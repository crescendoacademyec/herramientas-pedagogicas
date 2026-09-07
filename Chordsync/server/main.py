from __future__ import annotations

import asyncio
import importlib.util
import json
import math
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path
from statistics import median
from typing import Dict, Iterable, List, Optional, Tuple

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

PROJECT_ROOT = Path(__file__).resolve().parents[1]
RUNTIME_ROOT = Path(os.environ.get("CHORDSYNC_RUNTIME_DIR", tempfile.gettempdir())) / "chordsync-v62"
RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)

DEMUCS_MODEL = os.environ.get("CHORDSYNC_DEMUCS_MODEL", "htdemucs")
DEMUCS_DEVICE = os.environ.get("CHORDSYNC_DEMUCS_DEVICE", "cuda" if shutil.which("nvidia-smi") else "cpu")
MAX_UPLOAD_MB = int(os.environ.get("CHORDSYNC_MAX_UPLOAD_MB", "250"))
MAX_CONCURRENT_INFERENCE = max(1, int(os.environ.get("CHORDSYNC_MAX_CONCURRENT_INFERENCE", "1")))
RUNTIME_TTL_SEC = max(300, int(os.environ.get("CHORDSYNC_RUNTIME_TTL_SEC", str(60 * 60 * 6))))

BEATNET_MODEL = int(os.environ.get("CHORDSYNC_BEATNET_MODEL", "1"))
BEATNET_DEVICE = os.environ.get("CHORDSYNC_BEATNET_DEVICE", DEMUCS_DEVICE)
BEATNET_MODE = os.environ.get("CHORDSYNC_BEATNET_MODE", "online")
BEATNET_INFERENCE = os.environ.get("CHORDSYNC_BEATNET_INFERENCE", "PF")

CRISPASR_BIN = os.environ.get("CHORDSYNC_CRISPASR_BIN", "crispasr")
BTC_MODEL = os.environ.get("CHORDSYNC_BTC_MODEL", "auto")
BTC_ACCEPT_NC = os.environ.get("CHORDSYNC_BTC_ACCEPT_NC", "0").strip().lower() in {"1", "true", "yes", "on"}
BTC_TIMEOUT_SEC = int(os.environ.get("CHORDSYNC_BTC_TIMEOUT_SEC", str(60 * 10)))

BASIC_PITCH_ONSET_THRESHOLD = float(os.environ.get("CHORDSYNC_BASIC_PITCH_ONSET_THRESHOLD", "0.50"))
BASIC_PITCH_FRAME_THRESHOLD = float(os.environ.get("CHORDSYNC_BASIC_PITCH_FRAME_THRESHOLD", "0.30"))
BASIC_PITCH_MIN_NOTE_MS = float(os.environ.get("CHORDSYNC_BASIC_PITCH_MIN_NOTE_MS", "90"))
BASIC_PITCH_MIN_FREQ = float(os.environ.get("CHORDSYNC_BASIC_PITCH_MIN_FREQ", "41.2"))  # E1
BASIC_PITCH_MAX_FREQ = float(os.environ.get("CHORDSYNC_BASIC_PITCH_MAX_FREQ", "2093.0"))  # C7

try:
    from .structure_model import StructureModelRuntime
except ImportError:
    from structure_model import StructureModelRuntime

STRUCTURE_MODEL = StructureModelRuntime()
try:
    from .structure_boundary_model import StructureBoundaryRuntime
except ImportError:
    from structure_boundary_model import StructureBoundaryRuntime
STRUCTURE_BOUNDARY_MODEL = StructureBoundaryRuntime()
try:
    from .structure_joint_model import StructureJointRuntime
except ImportError:
    from structure_joint_model import StructureJointRuntime
STRUCTURE_JOINT_MODEL = StructureJointRuntime()

app = FastAPI(title="ChordSync Audio Intelligence Service", version="62.0")

INFERENCE_SEMAPHORE = asyncio.Semaphore(MAX_CONCURRENT_INFERENCE)
HEAVY_POST_PATHS = {
    "/api/v1/rhythm", "/api/v1/chords", "/api/v1/notes", "/api/v1/separate",
    "/api/v1/structure", "/api/v1/structure/boundaries", "/api/v1/structure/joint",
}

def _cleanup_stale_runtime() -> int:
    import time
    now=time.time(); removed=0
    for child in RUNTIME_ROOT.iterdir():
        try:
            if now-child.stat().st_mtime > RUNTIME_TTL_SEC:
                if child.is_dir(): shutil.rmtree(child, ignore_errors=True)
                else: child.unlink(missing_ok=True)
                removed += 1
        except Exception:
            pass
    return removed

@app.on_event("startup")
async def _startup_cleanup() -> None:
    await asyncio.to_thread(_cleanup_stale_runtime)

@app.middleware("http")
async def production_guard(request: Request, call_next):
    async def run():
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "same-origin"
        response.headers["X-ChordSync-Version"] = "62.0"
        return response
    if request.method == "POST" and request.url.path in HEAVY_POST_PATHS:
        async with INFERENCE_SEMAPHORE:
            return await run()
    return await run()


def _safe_job_id(value: str) -> str:
    if not value or any(ch not in "0123456789abcdef-" for ch in value.lower()):
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return value


def _find_stem_dir(output_root: Path) -> Path:
    candidates = [p for p in output_root.rglob("vocals.wav")]
    if not candidates:
        raise RuntimeError("Demucs terminó sin producir stems WAV")
    return candidates[0].parent


def _run_demucs(input_path: Path, output_root: Path) -> Path:
    cmd = [
        os.environ.get("CHORDSYNC_DEMUCS_BIN", "demucs"),
        "-n", DEMUCS_MODEL,
        "--device", DEMUCS_DEVICE,
        "--float32",
        "-o", str(output_root),
        str(input_path),
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60 * 30)
    except FileNotFoundError as exc:
        raise RuntimeError("Demucs no está instalado. Ejecuta: pip install -r server/requirements.txt") from exc
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("La separación excedió 30 minutos") from exc
    if proc.returncode != 0:
        message = (proc.stderr or proc.stdout or "Error desconocido de Demucs")[-4000:]
        raise RuntimeError(message)
    return _find_stem_dir(output_root)


def _copy_outputs(stem_dir: Path, job_dir: Path) -> Dict[str, str]:
    expected = {"bass": "bass.wav", "drums": "drums.wav", "other": "other.wav", "vocals": "vocals.wav"}
    urls: Dict[str, str] = {}
    for role, filename in expected.items():
        src = stem_dir / filename
        if src.exists():
            dst = job_dir / filename
            shutil.copy2(src, dst)
            urls[role] = f"/api/v1/stems/{job_dir.name}/{filename}"
    if not all(role in urls for role in ("bass", "drums", "other")):
        raise RuntimeError("El modelo seleccionado no devolvió bass/drums/other")
    return urls


def _beatnet_available() -> bool:
    return importlib.util.find_spec("BeatNet") is not None


def _robust_bpm(times: Iterable[float]) -> Optional[float]:
    ts = [float(x) for x in times if isinstance(x, (int, float)) and math.isfinite(float(x))]
    if len(ts) < 3:
        return None
    diffs = [b - a for a, b in zip(ts, ts[1:]) if 0.18 <= (b - a) <= 2.0]
    if not diffs:
        return None
    bpm = 62.0 / median(diffs)
    while bpm < 55:
        bpm *= 2
    while bpm > 220:
        bpm /= 2
    return round(bpm, 3)


def _infer_meter_from_downbeats(rows: List[Tuple[float, int]]) -> int:
    down_indices = [i for i, (_, beat_type) in enumerate(rows) if int(round(beat_type)) == 1]
    if len(down_indices) >= 2:
        gaps = [b - a for a, b in zip(down_indices, down_indices[1:]) if 2 <= (b - a) <= 12]
        if gaps:
            g = int(round(median(gaps)))
            if g in (3, 4, 6):
                return g
    # Algunos releases de BeatNet entregan el número de beat en la segunda columna.
    observed = [int(round(x[1])) for x in rows if 1 <= int(round(x[1])) <= 12]
    if observed:
        m = max(observed)
        if m in (3, 4, 6):
            return m
    return 4


def _regularity_confidence(times: List[float]) -> float:
    if len(times) < 4:
        return 0.0
    diffs = [b - a for a, b in zip(times, times[1:]) if 0.18 <= (b - a) <= 2.0]
    if len(diffs) < 3:
        return 0.0
    med = median(diffs)
    if med <= 0:
        return 0.0
    mad = median([abs(x - med) for x in diffs])
    regularity = max(0.0, min(1.0, 1.0 - mad / max(0.025, med * 0.22)))
    count_factor = min(1.0, len(times) / 25.0)
    return round(0.78 * regularity + 0.22 * count_factor, 4)


def _run_beatnet(input_path: Path) -> dict:
    if not _beatnet_available():
        raise RuntimeError(
            "BeatNet no está instalado. Instala el proveedor neuronal con: "
            "pip install -r server/requirements-neural-rhythm.txt"
        )

    from BeatNet.BeatNet import BeatNet  # type: ignore

    kwargs = {
        "mode": BEATNET_MODE,
        "inference_model": BEATNET_INFERENCE,
        "plot": [],
        "thread": False,
    }
    # La firma ha cambiado entre releases; intentamos primero con device y luego sin él.
    try:
        estimator = BeatNet(BEATNET_MODEL, device=BEATNET_DEVICE, **kwargs)
    except TypeError:
        estimator = BeatNet(BEATNET_MODEL, **kwargs)

    output = estimator.process(str(input_path))
    if output is None:
        raise RuntimeError("BeatNet no devolvió eventos")

    try:
        rows = [(float(row[0]), int(round(float(row[1])))) for row in output if len(row) >= 2]
    except Exception as exc:
        raise RuntimeError("Salida de BeatNet incompatible") from exc

    rows = [(t, b) for t, b in rows if math.isfinite(t) and t >= 0]
    rows.sort(key=lambda x: x[0])
    # Deduplicación defensiva.
    clean: List[Tuple[float, int]] = []
    for t, b in rows:
        if clean and abs(clean[-1][0] - t) < 1e-4:
            if b == 1:
                clean[-1] = (t, b)
            continue
        clean.append((t, b))
    if len(clean) < 3:
        raise RuntimeError("BeatNet devolvió muy pocos beats")

    meter = _infer_meter_from_downbeats(clean)
    bpm = _robust_bpm([x[0] for x in clean])
    quality = _regularity_confidence([x[0] for x in clean])

    beats: List[dict] = []
    bar = 0
    inferred_pos = 0
    for idx, (time_sec, raw_type) in enumerate(clean):
        explicit_position = raw_type if 1 <= raw_type <= meter else None
        is_downbeat = raw_type == 1
        if is_downbeat:
            bar += 1
            inferred_pos = 1
        elif explicit_position is not None and explicit_position > 1:
            inferred_pos = explicit_position
        else:
            inferred_pos = 1 if inferred_pos >= meter else inferred_pos + 1
            if bar == 0:
                bar = 1
        beat_num = explicit_position or inferred_pos
        beats.append({
            "time": round(time_sec, 6),
            "index": idx,
            "downbeat": bool(is_downbeat),
            "beat_num": int(beat_num),
            "bar_num": int(max(1, bar)),
            # BeatNet's public process() returns decoded events, not calibrated frame probabilities.
            "beatProbability": None,
            "downbeatProbability": None,
        })

    downbeats = sum(1 for b in beats if b["downbeat"])
    return {
        "provider": "beatnet",
        "model": BEATNET_MODEL,
        "mode": BEATNET_MODE,
        "inference": BEATNET_INFERENCE,
        "device": BEATNET_DEVICE,
        "bpm": bpm,
        "meter": meter,
        "confidence": quality,
        "events": len(beats),
        "downbeats": downbeats,
        "beats": beats,
        "probabilitiesCalibrated": False,
        "note": "BeatNet process() exposes decoded beat/downbeat events; per-frame probabilities are not surfaced by this adapter.",
    }


def _btc_binary_available() -> bool:
    return bool(shutil.which(CRISPASR_BIN) or Path(CRISPASR_BIN).exists())


def _btc_configured() -> bool:
    if not _btc_binary_available():
        return False
    if BTC_MODEL.lower() in {"auto", "default"}:
        return BTC_ACCEPT_NC
    return True


def _extract_json_from_stdout(text: str) -> dict:
    payload = (text or "").strip()
    if not payload:
        raise RuntimeError("BTC no devolvió JSON")
    try:
        obj = json.loads(payload)
        if isinstance(obj, dict):
            return obj
    except json.JSONDecodeError:
        pass
    start, end = payload.find("{"), payload.rfind("}")
    if start >= 0 and end > start:
        try:
            obj = json.loads(payload[start:end + 1])
            if isinstance(obj, dict):
                return obj
        except json.JSONDecodeError:
            pass
    raise RuntimeError("No se pudo interpretar la salida JSON de BTC")


def _run_btc_chords(input_path: Path) -> dict:
    if not _btc_binary_available():
        raise RuntimeError(
            "CrispASR no está instalado. Configura CHORDSYNC_CRISPASR_BIN con el binario de CrispASR."
        )
    model = BTC_MODEL
    cmd = [CRISPASR_BIN, "--chords", "-m", model, "--chords-format", "json", "-f", str(input_path)]
    if model.lower() in {"auto", "default"}:
        if not BTC_ACCEPT_NC:
            raise RuntimeError(
                "El modelo BTC auto-descargable usa pesos no comerciales. Para evaluación local explícita, "
                "define CHORDSYNC_BTC_ACCEPT_NC=1; para un producto comercial usa un checkpoint propio y "
                "CHORDSYNC_BTC_MODEL=/ruta/al/modelo.gguf."
            )
        cmd.extend(["--auto-download", "--accept-license", "cc-by-nc-sa-4.0"])
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=BTC_TIMEOUT_SEC)
    except FileNotFoundError as exc:
        raise RuntimeError("No se encontró el binario CrispASR") from exc
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("El análisis BTC excedió el tiempo límite") from exc
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "Error desconocido de BTC")[-5000:]
        raise RuntimeError(detail)
    obj = _extract_json_from_stdout(proc.stdout)
    chords = obj.get("chords")
    if not isinstance(chords, list) or not chords:
        raise RuntimeError("BTC terminó sin producir segmentos de acordes")
    normalized = []
    for row in chords:
        if not isinstance(row, dict):
            continue
        start = row.get("start_sec", row.get("start", row.get("startTime")))
        end = row.get("end_sec", row.get("end", row.get("endTime")))
        label = row.get("chord", row.get("label", row.get("name")))
        try:
            start_f, end_f = float(start), float(end)
        except (TypeError, ValueError):
            continue
        if end_f <= start_f or not label:
            continue
        item = {"start_sec": round(start_f, 6), "end_sec": round(end_f, 6), "chord": str(label)}
        try:
            conf = float(row.get("confidence"))
            if math.isfinite(conf):
                item["confidence"] = max(0.0, min(1.0, conf))
        except (TypeError, ValueError):
            pass
        normalized.append(item)
    if not normalized:
        raise RuntimeError("La salida BTC no contiene spans válidos")
    return {
        "provider": "btc-crispasr",
        "backend": "btc",
        "model": model,
        "vocabulary": obj.get("vocabulary"),
        "n_spans": len(normalized),
        "chords": normalized,
        "probabilitiesCalibrated": False,
        "sourceFile": obj.get("file"),
    }


def _basic_pitch_available() -> bool:
    return importlib.util.find_spec("basic_pitch") is not None


def _midi_name(midi: int) -> str:
    names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    return f"{names[int(midi) % 12]}{int(midi) // 12 - 1}"


def _run_basic_pitch(input_path: Path) -> dict:
    if not _basic_pitch_available():
        raise RuntimeError(
            "Basic Pitch no está instalado. Ejecuta: pip install -r server/requirements-neural-notes.txt"
        )
    try:
        from basic_pitch.inference import predict  # type: ignore
    except Exception as exc:
        raise RuntimeError(f"No se pudo importar Basic Pitch: {exc}") from exc

    try:
        _model_output, _midi_data, events = predict(
            str(input_path),
            onset_threshold=BASIC_PITCH_ONSET_THRESHOLD,
            frame_threshold=BASIC_PITCH_FRAME_THRESHOLD,
            minimum_note_length=BASIC_PITCH_MIN_NOTE_MS,
            minimum_frequency=BASIC_PITCH_MIN_FREQ,
            maximum_frequency=BASIC_PITCH_MAX_FREQ,
            multiple_pitch_bends=False,
            melodia_trick=True,
        )
    except Exception as exc:
        raise RuntimeError(f"Basic Pitch falló: {exc}") from exc

    notes = []
    pitch_classes = [0.0] * 12
    total_weight = 0.0
    for event in events or []:
        try:
            start, end, midi, amplitude = float(event[0]), float(event[1]), int(event[2]), float(event[3])
        except Exception:
            continue
        if not (math.isfinite(start) and math.isfinite(end) and end > start and 0 <= midi <= 127):
            continue
        confidence = max(0.0, min(1.0, amplitude))
        duration = end - start
        weight = duration * max(0.05, confidence)
        pitch_classes[midi % 12] += weight
        total_weight += weight
        notes.append({
            "start": round(start, 5),
            "end": round(end, 5),
            "midi": midi,
            "pitchClass": midi % 12,
            "note": _midi_name(midi),
            "confidence": round(confidence, 5),
            "velocity": int(round(confidence * 127)),
        })
    notes.sort(key=lambda n: (n["start"], n["midi"], n["end"]))
    if total_weight > 0:
        pitch_classes = [round(x / total_weight, 6) for x in pitch_classes]
    duration = max((float(n["end"]) for n in notes), default=0.0)
    return {
        "provider": "basic-pitch",
        "model": "Spotify Basic Pitch default model",
        "notes": notes,
        "noteCount": len(notes),
        "duration": round(duration, 4),
        "pitchClassProfile": pitch_classes,
        "thresholds": {
            "onset": BASIC_PITCH_ONSET_THRESHOLD,
            "frame": BASIC_PITCH_FRAME_THRESHOLD,
            "minimumNoteMs": BASIC_PITCH_MIN_NOTE_MS,
        },
        "probabilitiesCalibrated": False,
    }


async def _save_upload(file: UploadFile, destination: Path) -> int:
    total = 0
    with destination.open("wb") as out:
        while chunk := await file.read(1024 * 1024):
            total += len(chunk)
            if total > MAX_UPLOAD_MB * 1024 * 1024:
                raise HTTPException(status_code=413, detail=f"Archivo mayor de {MAX_UPLOAD_MB} MB")
            out.write(chunk)
    return total


@app.get("/api/v1/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "ChordSync Audio Intelligence Service",
        "version": "62.0",
        "maxConcurrentInference": MAX_CONCURRENT_INFERENCE,
        "runtimeTtlSec": RUNTIME_TTL_SEC,
        "separator": "demucs",
        "model": DEMUCS_MODEL,
        "device": DEMUCS_DEVICE,
        "demucsAvailable": bool(shutil.which(os.environ.get("CHORDSYNC_DEMUCS_BIN", "demucs"))),
        "rhythmProvider": "beatnet",
        "beatnetAvailable": _beatnet_available(),
        "beatnetModel": BEATNET_MODEL,
        "beatnetMode": BEATNET_MODE,
        "beatnetInference": BEATNET_INFERENCE,
        "beatnetDevice": BEATNET_DEVICE,
        "chordProvider": "BTC / CrispASR",
        "btcAvailable": _btc_configured(),
        "btcBinaryAvailable": _btc_binary_available(),
        "btcModel": BTC_MODEL,
        "btcAutoLicenseAccepted": BTC_ACCEPT_NC,
        "noteTranscriptionProvider": "Spotify Basic Pitch",
        "basicPitchAvailable": _basic_pitch_available(),
        "noteTranscriptionAvailable": _basic_pitch_available(),
        "basicPitchThresholds": {
            "onset": BASIC_PITCH_ONSET_THRESHOLD,
            "frame": BASIC_PITCH_FRAME_THRESHOLD,
            "minimumNoteMs": BASIC_PITCH_MIN_NOTE_MS,
        },
        "structureProvider": "ChordSync Structure Transformer ONNX",
        "structureNeuralAvailable": STRUCTURE_MODEL.available,
        "structureModel": STRUCTURE_MODEL.status(),
        "structureBoundaryProvider": "ChordSync Structure Boundary Transformer ONNX",
        "structureBoundaryNeuralAvailable": STRUCTURE_BOUNDARY_MODEL.available,
        "structureBoundaryModel": STRUCTURE_BOUNDARY_MODEL.status(),
        "structureJointProvider": "ChordSync Joint Structure Transformer ONNX",
        "structureJointNeuralAvailable": STRUCTURE_JOINT_MODEL.available,
        "structureJointModel": STRUCTURE_JOINT_MODEL.status(),
    }


@app.post("/api/v1/rhythm")
async def neural_rhythm(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo sin nombre")
    job_id = str(uuid.uuid4())
    job_dir = RUNTIME_ROOT / f"rhythm-{job_id}"
    job_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename).suffix or ".audio"
    input_path = job_dir / f"input{suffix}"
    try:
        await _save_upload(file, input_path)
        result = await asyncio.to_thread(_run_beatnet, input_path)
        result["sourceName"] = file.filename
        result["engine"] = "ChordSync Neural Rhythm Adapter v62"
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        shutil.rmtree(job_dir, ignore_errors=True)


@app.post("/api/v1/chords")
async def neural_chords(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo sin nombre")
    job_id = str(uuid.uuid4())
    job_dir = RUNTIME_ROOT / f"chords-{job_id}"
    job_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename).suffix or ".audio"
    input_path = job_dir / f"input{suffix}"
    try:
        await _save_upload(file, input_path)
        result = await asyncio.to_thread(_run_btc_chords, input_path)
        result["sourceName"] = file.filename
        result["engine"] = "ChordSync Neural Chord Adapter v62"
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        shutil.rmtree(job_dir, ignore_errors=True)


@app.post("/api/v1/notes")
async def neural_notes(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo sin nombre")
    if not _basic_pitch_available():
        raise HTTPException(
            status_code=503,
            detail="Basic Pitch no está instalado. Ejecuta: pip install -r server/requirements-neural-notes.txt",
        )
    job_id = str(uuid.uuid4())
    job_dir = RUNTIME_ROOT / f"notes-{job_id}"
    job_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename).suffix or ".audio"
    input_path = job_dir / f"input{suffix}"
    try:
        await _save_upload(file, input_path)
        result = await asyncio.to_thread(_run_basic_pitch, input_path)
        result["sourceName"] = file.filename
        result["engine"] = "ChordSync Multi-Pitch Note Adapter v62"
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        shutil.rmtree(job_dir, ignore_errors=True)


@app.post("/api/v1/structure/joint")
async def neural_structure_joint(file: UploadFile = File(...), threshold: float | None = Form(None), sequence_context_weight: float | None = Form(None), repeat_context_weight: float | None = Form(None), context_json: str | None = Form(None)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo sin nombre")
    if not STRUCTURE_JOINT_MODEL.available:
        raise HTTPException(status_code=503, detail="Modelo neuronal conjunto de estructura no instalado. Entrena/exporta models/structure_joint_model.onnx")
    job_id = str(uuid.uuid4())
    job_dir = RUNTIME_ROOT / f"structure-joint-{job_id}"
    job_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename).suffix or ".audio"
    input_path = job_dir / f"input{suffix}"
    try:
        await _save_upload(file, input_path)
        context = None
        if context_json:
            try:
                context = json.loads(context_json)
            except Exception as exc:
                raise HTTPException(status_code=400, detail=f"context_json inválido: {exc}") from exc
        result = await asyncio.to_thread(STRUCTURE_JOINT_MODEL.analyze_file, input_path, threshold, None, sequence_context_weight, repeat_context_weight, context)
        result["sourceName"] = file.filename
        result["engine"] = "ChordSync Joint Neural Structure Adapter v62"
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        shutil.rmtree(job_dir, ignore_errors=True)


@app.post("/api/v1/structure/boundaries")
async def neural_structure_boundaries(file: UploadFile = File(...), threshold: float | None = Form(None)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo sin nombre")
    if not STRUCTURE_BOUNDARY_MODEL.available:
        raise HTTPException(status_code=503, detail="Modelo neuronal de fronteras no instalado. Entrena/exporta models/structure_boundary_model.onnx")
    job_id = str(uuid.uuid4())
    job_dir = RUNTIME_ROOT / f"structure-boundary-{job_id}"
    job_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename).suffix or ".audio"
    input_path = job_dir / f"input{suffix}"
    try:
        await _save_upload(file, input_path)
        result = await asyncio.to_thread(STRUCTURE_BOUNDARY_MODEL.detect_file, input_path, threshold)
        result["sourceName"] = file.filename
        result["engine"] = "ChordSync Neural Structure Boundary Adapter v62"
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        shutil.rmtree(job_dir, ignore_errors=True)


@app.post("/api/v1/structure")
async def neural_structure(file: UploadFile = File(...), sections_json: str = Form(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo sin nombre")
    if not STRUCTURE_MODEL.available:
        raise HTTPException(status_code=503, detail="Modelo neuronal de estructura no instalado. Entrena/exporta models/structure_model.onnx e instala server/requirements-structure-neural.txt")
    try:
        sections = json.loads(sections_json)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="sections_json inválido") from exc
    if not isinstance(sections, list) or not sections:
        raise HTTPException(status_code=400, detail="Se requieren secciones candidatas")
    job_id = str(uuid.uuid4())
    job_dir = RUNTIME_ROOT / f"structure-{job_id}"
    job_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename).suffix or ".audio"
    input_path = job_dir / f"input{suffix}"
    try:
        await _save_upload(file, input_path)
        result = await asyncio.to_thread(STRUCTURE_MODEL.classify_file, input_path, sections)
        result["sourceName"] = file.filename
        result["engine"] = "ChordSync Neural Structure Adapter v62"
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        shutil.rmtree(job_dir, ignore_errors=True)


@app.post("/api/v1/separate")
async def separate(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo sin nombre")
    job_id = str(uuid.uuid4())
    job_dir = RUNTIME_ROOT / job_id
    work_dir = job_dir / "work"
    output_root = job_dir / "demucs"
    work_dir.mkdir(parents=True, exist_ok=True)
    output_root.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename).suffix or ".audio"
    input_path = work_dir / f"input{suffix}"
    try:
        await _save_upload(file, input_path)
        stem_dir = await asyncio.to_thread(_run_demucs, input_path, output_root)
        urls = _copy_outputs(stem_dir, job_dir)
        shutil.rmtree(work_dir, ignore_errors=True)
        shutil.rmtree(output_root, ignore_errors=True)
        return {
            "jobId": job_id,
            "model": DEMUCS_MODEL,
            "device": DEMUCS_DEVICE,
            "sourceName": file.filename,
            "stems": urls,
        }
    except HTTPException:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    except Exception as exc:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/v1/stems/{job_id}/{filename}")
def stem(job_id: str, filename: str):
    job_id = _safe_job_id(job_id)
    if filename not in {"bass.wav", "drums.wav", "other.wav", "vocals.wav"}:
        raise HTTPException(status_code=404, detail="Stem no encontrado")
    path = RUNTIME_ROOT / job_id / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Stem no encontrado")
    return FileResponse(path, media_type="audio/wav", filename=filename)


@app.delete("/api/v1/jobs/{job_id}")
def delete_job(job_id: str) -> dict:
    job_id = _safe_job_id(job_id)
    shutil.rmtree(RUNTIME_ROOT / job_id, ignore_errors=True)
    return {"ok": True}


# API routes must be registered before this catch-all static mount.
app.mount("/", StaticFiles(directory=str(PROJECT_ROOT), html=True), name="frontend")
