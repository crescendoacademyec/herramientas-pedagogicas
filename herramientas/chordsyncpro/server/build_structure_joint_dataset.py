from __future__ import annotations
import argparse, json
from pathlib import Path
import numpy as np
import librosa
from structure_model import extract_section_features
from build_structure_dataset import AUDIO_EXTS, LABELS, parse_sections, split_name


def label_at(t: float, truth):
    for start, end, label in truth:
        if start <= t < end or (t == end and end == truth[-1][1]):
            return LABELS.index(label)
    # conservative nearest-section fallback at song edges
    if truth:
        return LABELS.index(min(truth, key=lambda r: min(abs(t-r[0]), abs(t-r[1])))[2])
    return 0


def main():
    ap=argparse.ArgumentParser(description='Build joint structure dataset: boundary + semantic label from audio + .sections')
    ap.add_argument('corpus',type=Path)
    ap.add_argument('--out-dir',type=Path,default=Path('structure_joint_dataset_v44'))
    ap.add_argument('--seed',type=int,default=4343)
    ap.add_argument('--sample-rate',type=int,default=22050)
    ap.add_argument('--frames',type=int,default=128)
    ap.add_argument('--n-mels',type=int,default=64)
    ap.add_argument('--window-seconds',type=float,default=10.0)
    ap.add_argument('--hop-seconds',type=float,default=1.0)
    ap.add_argument('--boundary-tolerance',type=float,default=0.65)
    ap.add_argument('--boundary-oversample',type=int,default=2)
    ap.add_argument('--split',default='0.70,0.15,0.15')
    args=ap.parse_args()
    ratios=tuple(map(float,args.split.split(',')))
    if len(ratios)!=3 or abs(sum(ratios)-1)>1e-6: raise SystemExit('--split must sum to 1')
    buckets={k:[] for k in ('train','validation','test')}; skipped=[]
    audios=[p for p in args.corpus.rglob('*') if p.suffix.lower() in AUDIO_EXTS]
    for audio in audios:
        ann=audio.with_suffix('.sections')
        if not ann.exists(): continue
        song_id=str(audio.relative_to(args.corpus).with_suffix(''))
        try:
            y,sr=librosa.load(audio,sr=args.sample_rate,mono=True); duration=len(y)/sr
            truth=parse_sections(ann,duration)
            if not truth: raise ValueError('no valid sections')
            tempo=float(np.asarray(librosa.beat.beat_track(y=y,sr=sr)[0]).reshape(-1)[0]) if len(y)>sr else 0.0
            split=split_name(song_id,args.seed,ratios)
            half=args.window_seconds/2
            start=max(min(half,duration/2),0.0); stop=max(start,duration-half)
            centers=list(np.arange(start,stop+1e-9,max(.25,args.hop_seconds),dtype=float))
            boundaries=[float(r[0]) for r in truth[1:]]
            # Exact and slight-offset positive centers increase boundary supervision without changing song split.
            for b in boundaries:
                centers.append(b)
                for k in range(1,max(0,args.boundary_oversample)+1):
                    delta=min(args.boundary_tolerance*.65, .18*k)
                    centers.extend([max(0,b-delta),min(duration,b+delta)])
            # Deterministic de-duplication to 10 ms.
            centers=sorted({round(float(np.clip(c,0,duration)),2) for c in centers})
            for c in centers:
                a=max(0.0,c-half); b=min(duration,c+half)
                x,aux=extract_section_features(y,sr,a,b,duration,tempo,args.n_mels,args.frames)
                boundary=1.0 if any(abs(c-q)<=args.boundary_tolerance for q in boundaries) else 0.0
                semantic=label_at(c,truth)
                buckets[split].append((x,aux,boundary,semantic,song_id,c))
        except Exception as e:
            skipped.append({'song':song_id,'error':str(e)})
    args.out_dir.mkdir(parents=True,exist_ok=True); counts={}
    for split,rows in buckets.items():
        counts[split]=len(rows)
        if rows:
            np.savez_compressed(args.out_dir/f'{split}.npz',
                x=np.stack([r[0] for r in rows]).astype(np.float32),
                aux=np.stack([r[1] for r in rows]).astype(np.float32),
                boundary=np.array([r[2] for r in rows],np.float32),
                label=np.array([r[3] for r in rows],np.int64),
                song_id=np.array([r[4] for r in rows]), center=np.array([r[5] for r in rows],np.float32),
                labels=np.array(LABELS))
        else:
            np.savez_compressed(args.out_dir/f'{split}.npz',x=np.empty((0,args.frames,args.n_mels),np.float32),aux=np.empty((0,8),np.float32),boundary=np.empty((0,),np.float32),label=np.empty((0,),np.int64),song_id=np.empty((0,),dtype='<U1'),center=np.empty((0,),np.float32),labels=np.array(LABELS))
    manifest={'schema':'chordsync-structure-joint-dataset-v1','version':44,'seed':args.seed,'split':ratios,'labels':LABELS,'sampleRate':args.sample_rate,'frames':args.frames,'nMels':args.n_mels,'windowSeconds':args.window_seconds,'hopSeconds':args.hop_seconds,'boundaryTolerance':args.boundary_tolerance,'counts':counts,'songsWithAnnotations':len({r[4] for xs in buckets.values() for r in xs}),'skipped':skipped}
    (args.out_dir/'dataset_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print(json.dumps(manifest,indent=2))

if __name__=='__main__': main()
