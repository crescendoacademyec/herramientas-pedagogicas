"""Build reproducible ChordSync multi-head training datasets from audio + .lab.

Expected corpus layout (flat or nested):
  song.wav / song.mp3 / song.flac / ...
  song.lab

LAB formats accepted:
  start end chord
  start chord            # end inferred from next row/audio duration
Comments beginning with # are ignored except optional metadata like # key:, which v35 stores for functional-harmony training.

Outputs train.npz, validation.npz, test.npz with:
  x          float32 [N,T,12]
  root       int64   [N,T]
  triad      int64   [N,T]
  seventh    int64   [N,T]
  extension  int64   [N,T]
  bass       int64   [N,T]
  song_id    unicode  [N]
  start_time float32  [N]
  transpose  int16    [N]
  key_root   int16    [N]  # 1..12, 0 unknown
  key_mode   int8     [N]  # 0 major, 1 minor, -1 unknown

Unknown/padded head labels use -100, compatible with CrossEntropyLoss(ignore_index=-100).
No-chord N uses root=0, bass=0 and masks the harmonic-detail heads.

The default augmentation is feature-space pitch transposition: chroma bins and chord
labels are shifted together. This is fast, deterministic and musically exact at the
pitch-class level. Optional --audio-pitch-shift recomputes features from pitch-shifted
audio with librosa for a more realistic (and much slower) augmentation.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import numpy as np

try:
    import librosa
except Exception as exc:  # pragma: no cover
    raise SystemExit("librosa is required. Install server/requirements-training.txt") from exc

AUDIO_EXTS = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac", ".aif", ".aiff"}
PC = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
PC_TO_I = {n:i for i,n in enumerate(PC)}
ENHARMONIC = {
    "B#":"C", "DB":"C#", "EB":"D#", "FB":"E", "E#":"F", "GB":"F#",
    "AB":"G#", "BB":"A#", "CB":"B",
}
TRIAD_LABELS = ["major","minor","dim","aug","sus2","sus4"]
SEVENTH_LABELS = ["none","b7","maj7","dim7"]
EXTENSION_LABELS = ["none","6","9","add9","11","add11","13"]

@dataclass
class LabSegment:
    start: float
    end: float | None
    chord: str


def stable_unit(text: str, seed: int) -> float:
    h = hashlib.sha256(f"{seed}:{text}".encode("utf-8")).digest()
    return int.from_bytes(h[:8], "big") / 2**64


def normalize_note(note: str) -> str | None:
    if not note:
        return None
    s = note.strip().replace("♯", "#").replace("♭", "b")
    if len(s) >= 2 and s[1] in "b#":
        s = s[0].upper() + s[1]
    else:
        s = s[0].upper()
    key = s.upper()
    s = ENHARMONIC.get(key, s)
    return s if s in PC_TO_I else None


def split_root_quality(symbol: str):
    s = symbol.strip()
    if not s or s.upper() in {"N", "NC", "N.C.", "X"}:
        return None, "", None
    # Root + accidental, remainder, optional slash bass.
    m = re.match(r"^([A-Ga-g](?:[#b♯♭]?))(.*)$", s)
    if not m:
        return None, "", None
    root = normalize_note(m.group(1))
    rest = m.group(2).strip()
    bass = None
    if "/" in rest:
        rest, b = rest.rsplit("/", 1)
        bass = normalize_note(b)
    rest = rest.replace("Δ", "maj").replace("°", "dim").replace("ø", "m7b5")
    rest = rest.replace(":", "").replace("(", "").replace(")", "").replace(" ", "")
    return root, rest, bass


def chord_to_heads(symbol: str):
    root, q, bass = split_root_quality(symbol)
    if root is None:
        if symbol.strip().upper() in {"N", "NC", "N.C.", "X", ""}:
            return (0, -100, -100, -100, 0)
        return (-100, -100, -100, -100, -100)

    r = PC_TO_I[root] + 1
    b = PC_TO_I[bass] + 1 if bass else r
    ql = q.lower()

    # Triad quality. Order matters: m7b5 is diminished triad; maj is major.
    if "m7b5" in ql or "min7b5" in ql or "dim" in ql:
        triad = "dim"
    elif "aug" in ql or "+" in ql:
        triad = "aug"
    elif "sus2" in ql:
        triad = "sus2"
    elif "sus4" in ql or ql == "sus":
        triad = "sus4"
    elif (ql.startswith("m") and not ql.startswith("maj")) or ql.startswith("min"):
        triad = "minor"
    else:
        triad = "major"

    # Seventh component.
    if "dim7" in ql:
        seventh = "dim7"
    elif any(tok in ql for tok in ("maj7", "maj9", "maj11", "maj13", "ma7")):
        seventh = "maj7"
    elif "add9" in ql or "add11" in ql:
        seventh = "none"
    elif "7" in ql or "9" in ql or "11" in ql or "13" in ql or "m7b5" in ql:
        seventh = "b7"
    else:
        seventh = "none"

    # Highest/specific extension represented by the current contract.
    if "add11" in ql:
        ext = "add11"
    elif "add9" in ql:
        ext = "add9"
    elif "13" in ql:
        ext = "13"
    elif "11" in ql:
        ext = "11"
    elif "9" in ql:
        ext = "9"
    elif re.search(r"(^|[^0-9])6($|[^0-9])", ql):
        ext = "6"
    else:
        ext = "none"

    return (
        r,
        TRIAD_LABELS.index(triad),
        SEVENTH_LABELS.index(seventh),
        EXTENSION_LABELS.index(ext),
        b,
    )


def transpose_heads(heads, semitones: int):
    out = list(heads)
    for idx in (0, 4):
        v = out[idx]
        if v > 0:
            out[idx] = ((v - 1 + semitones) % 12) + 1
    return tuple(out)



def parse_key_metadata(path: Path):
    """Parse optional '# key:' metadata. Returns (root 1..12 or 0, mode 0 major/1 minor or -1)."""
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        m = re.match(r"^#\s*key\s*:\s*(.+)$", line, re.I)
        if not m:
            continue
        text = m.group(1).strip().replace("♯", "#").replace("♭", "b")
        mm = re.match(r"^([A-Ga-g](?:[#b]?))\s*(.*)$", text)
        if not mm:
            return 0, -1
        note = normalize_note(mm.group(1))
        if note is None:
            return 0, -1
        tail = mm.group(2).strip().lower()
        mode = 1 if (tail in {"m","min","minor"} or tail.startswith("minor") or tail.startswith("min")) else 0
        return PC_TO_I[note] + 1, mode
    return 0, -1


def estimate_key_from_segments(segments: list[LabSegment]):
    """Conservative 24-key fallback from annotated root+triad durations."""
    if not segments:
        return 0, -1
    major_q = ["major","minor","minor","major","major","minor","dim"]
    minor_q = ["minor","dim","major","minor","minor","major","major"]
    degrees = [0,2,4,5,7,9,11]
    best = None
    for tonic in range(12):
        for mode, quals in ((0, major_q),(1, minor_q)):
            score = 0.0
            tonic_score = 0.0
            for seg in segments:
                h = chord_to_heads(seg.chord)
                r,q = h[0], h[1]
                if r <= 0 or q < 0:
                    continue
                dur = max(0.05, float((seg.end or seg.start) - seg.start))
                rel = ((r-1)-tonic) % 12
                if rel in degrees:
                    di = degrees.index(rel)
                    qname = TRIAD_LABELS[q]
                    score += dur * (1.0 if qname == quals[di] else 0.35)
                    if rel == 0:
                        tonic_score += dur * (1.0 if qname == quals[0] else 0.25)
                else:
                    score -= dur * 0.12
            score += 0.18 * tonic_score
            cand = (score, tonic_score, -mode, tonic+1, mode)
            if best is None or cand > best:
                best = cand
    return (best[3], best[4]) if best else (0,-1)


def parse_lab(path: Path, duration: float) -> list[LabSegment]:
    rows: list[LabSegment] = []
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        try:
            start = float(parts[0])
        except ValueError:
            continue
        end = None
        chord_start = 1
        if len(parts) >= 3:
            try:
                end = float(parts[1])
                chord_start = 2
            except ValueError:
                pass
        chord = " ".join(parts[chord_start:]).strip()
        rows.append(LabSegment(max(0.0, start), end, chord))
    rows.sort(key=lambda x: x.start)
    for i, seg in enumerate(rows):
        if seg.end is None:
            seg.end = rows[i+1].start if i+1 < len(rows) else duration
        seg.end = min(duration, max(seg.start, float(seg.end)))
    return [s for s in rows if s.end and s.end > s.start]


def discover_pairs(corpus: Path):
    labs = sorted(corpus.rglob("*.lab"))
    pairs = []
    for lab in labs:
        stem = lab.stem
        candidates = [p for p in lab.parent.iterdir() if p.is_file() and p.suffix.lower() in AUDIO_EXTS and p.stem == stem]
        if not candidates:
            # Also accept suffix forms like song_ground_truth.lab -> song.wav.
            base = re.sub(r"(?:_ground[_-]?truth|_chords?)$", "", stem, flags=re.I)
            candidates = [p for p in lab.parent.iterdir() if p.is_file() and p.suffix.lower() in AUDIO_EXTS and p.stem == base]
        if candidates:
            pairs.append((sorted(candidates)[0], lab))
    return pairs


def extract_chroma(y: np.ndarray, sr: int, hop: int, bins_per_octave: int = 36):
    # CQT chroma aligns naturally with the 12 pitch-class input used by v30.
    c = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop, bins_per_octave=bins_per_octave)
    c = np.asarray(c.T, dtype=np.float32)
    denom = np.maximum(c.sum(axis=1, keepdims=True), 1e-8)
    return c / denom


def labels_for_frames(segments: list[LabSegment], n_frames: int, hop: int, sr: int, semitones: int = 0):
    labels = np.full((n_frames, 5), -100, dtype=np.int64)
    times = np.arange(n_frames, dtype=np.float64) * hop / sr
    si = 0
    for fi, t in enumerate(times):
        while si + 1 < len(segments) and t >= segments[si].end:
            si += 1
        if si < len(segments) and segments[si].start <= t < segments[si].end:
            labels[fi] = transpose_heads(chord_to_heads(segments[si].chord), semitones)
    return labels


def chunk_song(chroma, labels, song_id, chunk_frames, hop_frames, transpose, key_root=0, key_mode=-1):
    n = len(chroma)
    if n == 0:
        return []
    out = []
    for start in range(0, max(1, n), hop_frames):
        end = min(n, start + chunk_frames)
        x = np.zeros((chunk_frames, 12), np.float32)
        y = np.full((chunk_frames, 5), -100, np.int64)
        take = end - start
        x[:take] = chroma[start:end]
        y[:take] = labels[start:end]
        out.append((x, y, song_id, start, transpose, key_root, key_mode))
        if end >= n:
            break
    return out


def parse_semitones(text: str):
    vals = []
    for p in text.split(","):
        p = p.strip()
        if p:
            vals.append(int(p))
    return sorted(set(vals or [0]))


def split_name(song_id: str, seed: int, train_ratio: float, val_ratio: float):
    u = stable_unit(song_id, seed)
    if u < train_ratio:
        return "train"
    if u < train_ratio + val_ratio:
        return "validation"
    return "test"


def write_npz(path: Path, rows, sr: int, hop: int, chunk_frames: int):
    if not rows:
        np.savez_compressed(path,
            x=np.empty((0,chunk_frames,12),np.float32),
            root=np.empty((0,chunk_frames),np.int64), triad=np.empty((0,chunk_frames),np.int64),
            seventh=np.empty((0,chunk_frames),np.int64), extension=np.empty((0,chunk_frames),np.int64),
            bass=np.empty((0,chunk_frames),np.int64), song_id=np.empty((0,),dtype="U1"),
            start_time=np.empty((0,),np.float32), transpose=np.empty((0,),np.int16),
            key_root=np.empty((0,),np.int16), key_mode=np.empty((0,),np.int8),
            sample_rate=np.int32(sr), hop_length=np.int32(hop))
        return
    xs=np.stack([r[0] for r in rows])
    ys=np.stack([r[1] for r in rows])
    ids=np.array([r[2] for r in rows])
    starts=np.array([r[3]*hop/sr for r in rows],np.float32)
    trans=np.array([r[4] for r in rows],np.int16)
    key_root=np.array([r[5] for r in rows],np.int16)
    key_mode=np.array([r[6] for r in rows],np.int8)
    np.savez_compressed(path, x=xs, root=ys[:,:,0], triad=ys[:,:,1], seventh=ys[:,:,2], extension=ys[:,:,3], bass=ys[:,:,4],
                        song_id=ids, start_time=starts, transpose=trans, key_root=key_root, key_mode=key_mode, sample_rate=np.int32(sr), hop_length=np.int32(hop))


def main():
    ap=argparse.ArgumentParser(description="Build ChordSync multi-head NPZ datasets from audio + .lab")
    ap.add_argument("corpus", type=Path)
    ap.add_argument("--out-dir", type=Path, default=Path("dataset_v35"))
    ap.add_argument("--sr", type=int, default=22050)
    ap.add_argument("--hop-length", type=int, default=512)
    ap.add_argument("--chunk-seconds", type=float, default=12.0)
    ap.add_argument("--chunk-overlap", type=float, default=0.5, help="0..0.95")
    ap.add_argument("--seed", type=int, default=3007)
    ap.add_argument("--train-ratio", type=float, default=0.70)
    ap.add_argument("--val-ratio", type=float, default=0.15)
    ap.add_argument("--augment-semitones", default="0,-5,-3,-2,2,3,5")
    ap.add_argument("--augment-validation", action="store_true")
    ap.add_argument("--audio-pitch-shift", action="store_true", help="recompute chroma from pitch-shifted audio instead of rolling chroma")
    args=ap.parse_args()
    if not (0 < args.train_ratio < 1 and 0 <= args.val_ratio < 1 and args.train_ratio + args.val_ratio < 1):
        raise SystemExit("invalid split ratios")
    overlap=min(0.95,max(0.0,args.chunk_overlap))
    chunk_frames=max(8, int(round(args.chunk_seconds*args.sr/args.hop_length)))
    stride=max(1,int(round(chunk_frames*(1-overlap))))
    semitones=parse_semitones(args.augment_semitones)
    pairs=discover_pairs(args.corpus)
    if not pairs:
        raise SystemExit(f"No audio/.lab pairs found under {args.corpus}")
    args.out_dir.mkdir(parents=True,exist_ok=True)
    rows={"train":[],"validation":[],"test":[]}
    songs=[]
    for audio,lab in pairs:
        song_id=str(audio.relative_to(args.corpus).with_suffix(""))
        split=split_name(song_id,args.seed,args.train_ratio,args.val_ratio)
        y,sr=librosa.load(audio,sr=args.sr,mono=True)
        duration=len(y)/sr
        segs=parse_lab(lab,duration)
        key_root,key_mode=parse_key_metadata(lab)
        if key_root <= 0:
            key_root,key_mode=estimate_key_from_segments(segs)
        if not segs:
            print(f"skip {song_id}: no valid lab rows")
            continue
        shifts=semitones if split=="train" or args.augment_validation else [0]
        base_chroma=None if args.audio_pitch_shift else extract_chroma(y,sr,args.hop_length)
        n_chunks_before=len(rows[split])
        for shift in shifts:
            if args.audio_pitch_shift and shift:
                yy=librosa.effects.pitch_shift(y=y,sr=sr,n_steps=shift)
                chroma=extract_chroma(yy,sr,args.hop_length)
            elif args.audio_pitch_shift:
                chroma=extract_chroma(y,sr,args.hop_length)
            else:
                chroma=np.roll(base_chroma,shift=shift,axis=1) if shift else base_chroma.copy()
            labels=labels_for_frames(segs,len(chroma),args.hop_length,sr,semitones=shift)
            shifted_key_root = ((key_root - 1 + shift) % 12) + 1 if key_root > 0 else 0
            rows[split].extend(chunk_song(chroma,labels,song_id,chunk_frames,stride,shift,shifted_key_root,key_mode))
        songs.append({"song":song_id,"audio":str(audio),"lab":str(lab),"split":split,"duration":duration,"segments":len(segs),"augment":shifts,
                      "keyRoot": key_root, "keyMode": ("minor" if key_mode==1 else "major" if key_mode==0 else "unknown"),
                      "chunks":len(rows[split])-n_chunks_before})
        print(json.dumps({"song":song_id,"split":split,"duration":round(duration,2),"segments":len(segs),"shifts":shifts}))
    for split in rows:
        write_npz(args.out_dir/f"{split}.npz",rows[split],args.sr,args.hop_length,chunk_frames)
    summary={
        "schema":"chordsync-multihead-dataset-v2-key-aware",
        "seed":args.seed,"sampleRate":args.sr,"hopLength":args.hop_length,
        "chunkSeconds":args.chunk_seconds,"chunkFrames":chunk_frames,"chunkOverlap":overlap,
        "splits":{"train":args.train_ratio,"validation":args.val_ratio,"test":1-args.train_ratio-args.val_ratio},
        "augmentation":{"semitones":semitones,"audioPitchShift":bool(args.audio_pitch_shift),"validationAugmented":bool(args.augment_validation)},
        "headLabels":{"root":["N"]+PC,"triad":TRIAD_LABELS,"seventh":SEVENTH_LABELS,"extension":EXTENSION_LABELS,"bass":["N"]+PC},
        "ignoreIndex":-100,
        "songs":songs,
        "chunks":{k:len(v) for k,v in rows.items()},
    }
    (args.out_dir/"dataset_manifest.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps({"done":True,"out":str(args.out_dir),"chunks":summary["chunks"],"songs":len(songs)},indent=2))

if __name__ == "__main__":
    main()
