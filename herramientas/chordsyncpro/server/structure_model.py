from __future__ import annotations

import json
import math
import os
from pathlib import Path
from typing import Dict, List, Sequence

import numpy as np

LABELS = ['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Outro']
DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[1] / 'models' / 'structure_model.onnx'
DEFAULT_META_PATH = Path(str(DEFAULT_MODEL_PATH) + '.json')


def _time_resize(x: np.ndarray, frames: int) -> np.ndarray:
    if x.shape[1] == 0:
        return np.zeros((frames, x.shape[0]), np.float32)
    old = np.linspace(0, 1, x.shape[1])
    new = np.linspace(0, 1, frames)
    out = np.stack([np.interp(new, old, row) for row in x], axis=1)
    return out.astype(np.float32)


def _entropy(v: np.ndarray) -> float:
    v = np.maximum(v, 1e-8)
    v = v / max(1e-8, float(v.sum()))
    return float(-(v * np.log(v)).sum() / np.log(len(v)))


def extract_section_features(y: np.ndarray, sr: int, start: float, end: float, duration: float,
                             tempo: float, n_mels: int, frames: int) -> tuple[np.ndarray, np.ndarray]:
    try:
        import librosa
    except Exception as exc:
        raise RuntimeError('librosa no está instalado. Instala server/requirements-structure-neural.txt') from exc
    a = max(0, int(start * sr))
    b = min(len(y), max(a + 1, int(end * sr)))
    z = y[a:b]
    mel = librosa.feature.melspectrogram(y=z, sr=sr, n_fft=2048, hop_length=512, n_mels=n_mels, power=2.0)
    db = librosa.power_to_db(mel + 1e-10, ref=np.max)
    db = np.clip((db + 80) / 80, 0, 1)
    x = _time_resize(db, frames)
    rms = float(np.mean(librosa.feature.rms(y=z))) if len(z) > 0 else 0.0
    onset = float(np.mean(librosa.onset.onset_strength(y=z, sr=sr))) if len(z) > 1024 else 0.0
    centroid = float(np.mean(librosa.feature.spectral_centroid(y=z, sr=sr)) / (sr / 2)) if len(z) > 1024 else 0.0
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(z))) if len(z) > 0 else 0.0
    chroma = librosa.feature.chroma_cqt(y=z, sr=sr) if len(z) > 4096 else np.zeros((12, 1))
    ce = _entropy(np.mean(chroma, axis=1) + 1e-8)
    mid = (start + end) / 2
    aux = np.array([
        mid / max(duration, 1e-6),
        (end - start) / max(duration, 1e-6),
        rms,
        np.tanh(onset / 4),
        centroid,
        zcr,
        ce,
        min(float(tempo or 0), 240) / 240,
    ], np.float32)
    return x, aux


def _softmax(logits: np.ndarray) -> np.ndarray:
    logits = np.asarray(logits, dtype=np.float64)
    logits = logits - np.max(logits, axis=-1, keepdims=True)
    ex = np.exp(logits)
    return (ex / np.maximum(ex.sum(axis=-1, keepdims=True), 1e-12)).astype(np.float32)


class StructureModelRuntime:
    def __init__(self, model_path: Path | None = None, meta_path: Path | None = None):
        self.model_path = Path(os.environ.get('CHORDSYNC_STRUCTURE_MODEL', str(model_path or DEFAULT_MODEL_PATH)))
        self.meta_path = Path(os.environ.get('CHORDSYNC_STRUCTURE_MODEL_META', str(meta_path or (str(self.model_path) + '.json'))))
        self._session = None
        self._error = None
        self._meta: Dict = {}

    @property
    def available(self) -> bool:
        return self.model_path.exists() and self._onnxruntime_available()

    def _onnxruntime_available(self) -> bool:
        try:
            import onnxruntime  # noqa: F401
            return True
        except Exception:
            return False

    def metadata(self) -> Dict:
        if not self._meta:
            if self.meta_path.exists():
                try:
                    self._meta = json.loads(self.meta_path.read_text(encoding='utf-8'))
                except Exception as exc:
                    self._error = f'metadata: {exc}'
                    self._meta = {}
            else:
                self._meta = {}
        return self._meta

    def status(self) -> Dict:
        meta = self.metadata()
        return {
            'available': self.available,
            'modelPath': str(self.model_path),
            'metadataPath': str(self.meta_path),
            'modelName': meta.get('modelName', self.model_path.name),
            'labels': meta.get('labels', LABELS),
            'error': self._error,
        }

    def _ensure_session(self):
        if self._session is not None:
            return self._session
        if not self.model_path.exists():
            raise RuntimeError(f'Modelo de estructura no encontrado: {self.model_path}')
        try:
            import onnxruntime as ort
        except Exception as exc:
            raise RuntimeError('onnxruntime no está instalado. Instala server/requirements-structure-neural.txt') from exc
        providers = ['CPUExecutionProvider']
        available = set(ort.get_available_providers())
        if 'CUDAExecutionProvider' in available and os.environ.get('CHORDSYNC_STRUCTURE_DEVICE', 'auto').lower() != 'cpu':
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
        self._session = ort.InferenceSession(str(self.model_path), providers=providers)
        return self._session

    def classify_file(self, input_path: Path, sections: Sequence[dict]) -> Dict:
        if not sections:
            raise RuntimeError('No se recibieron secciones para clasificar')
        try:
            import librosa
        except Exception as exc:
            raise RuntimeError('librosa no está instalado. Instala server/requirements-structure-neural.txt') from exc
        meta = self.metadata()
        sr_target = int(meta.get('sampleRate', 22050))
        frames = int(meta.get('frames', 192))
        n_mels = int(meta.get('nMels', 64))
        labels = list(meta.get('labels') or LABELS)
        y, sr = librosa.load(input_path, sr=sr_target, mono=True)
        duration = len(y) / max(1, sr)
        try:
            tempo_raw = librosa.beat.beat_track(y=y, sr=sr)[0] if len(y) > sr else 0
            tempo = float(np.asarray(tempo_raw).reshape(-1)[0])
        except Exception:
            tempo = 0.0
        xs, auxs, valid_sections = [], [], []
        for i, row in enumerate(sections):
            try:
                start = max(0.0, float(row.get('start', 0)))
                end = min(duration, float(row.get('end', start)))
            except Exception:
                continue
            if end <= start:
                continue
            x, aux = extract_section_features(y, sr, start, end, duration, tempo, n_mels, frames)
            xs.append(x)
            auxs.append(aux)
            valid_sections.append((i, start, end))
        if not xs:
            raise RuntimeError('No hay secciones válidas después de normalizar tiempos')
        session = self._ensure_session()
        inputs = {i.name: i for i in session.get_inputs()}
        feed = {}
        x_batch = np.stack(xs).astype(np.float32)
        aux_batch = np.stack(auxs).astype(np.float32)
        if 'x' in inputs:
            feed['x'] = x_batch
        else:
            feed[next(iter(inputs))] = x_batch
        if 'aux' in inputs:
            feed['aux'] = aux_batch
        outputs = session.run(None, feed)
        if not outputs:
            raise RuntimeError('El modelo ONNX no devolvió logits')
        logits = np.asarray(outputs[0])
        if logits.ndim != 2 or logits.shape[0] != len(valid_sections):
            raise RuntimeError(f'Salida ONNX incompatible: {list(logits.shape)}')
        probs = _softmax(logits)
        rows = []
        for j, (original_index, start, end) in enumerate(valid_sections):
            p = probs[j]
            k = int(np.argmax(p))
            prob_map = {labels[c]: round(float(p[c]), 6) for c in range(min(len(labels), len(p)))}
            rows.append({
                'index': original_index,
                'start': round(start, 6),
                'end': round(end, 6),
                'label': labels[k] if k < len(labels) else str(k),
                'confidence': round(float(p[k]), 6),
                'probabilities': prob_map,
            })
        return {
            'provider': 'chordsync-structure-transformer-onnx',
            'modelName': meta.get('modelName', self.model_path.name),
            'modelVersion': meta.get('version', 1),
            'labels': labels,
            'sampleRate': sr_target,
            'frames': frames,
            'nMels': n_mels,
            'sections': rows,
            'duration': round(duration, 6),
            'tempo': round(tempo, 3) if math.isfinite(tempo) else None,
        }
