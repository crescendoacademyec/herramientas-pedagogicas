from __future__ import annotations

import json
import math
import os
from pathlib import Path
from typing import Dict, List

import numpy as np

try:
    from .structure_model import extract_section_features
except ImportError:
    from structure_model import extract_section_features

DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[1] / 'models' / 'structure_boundary_model.onnx'


def _sigmoid(x: np.ndarray) -> np.ndarray:
    x = np.asarray(x, dtype=np.float64)
    return (1.0 / (1.0 + np.exp(-np.clip(x, -40, 40)))).astype(np.float32)


class StructureBoundaryRuntime:
    def __init__(self, model_path: Path | None = None, meta_path: Path | None = None):
        self.model_path = Path(os.environ.get('CHORDSYNC_STRUCTURE_BOUNDARY_MODEL', str(model_path or DEFAULT_MODEL_PATH)))
        self.meta_path = Path(os.environ.get('CHORDSYNC_STRUCTURE_BOUNDARY_MODEL_META', str(meta_path or (str(self.model_path) + '.json'))))
        self._session = None
        self._meta: Dict = {}
        self._error = None

    def _ort_available(self) -> bool:
        try:
            import onnxruntime  # noqa
            return True
        except Exception:
            return False

    @property
    def available(self) -> bool:
        return self.model_path.exists() and self._ort_available()

    def metadata(self) -> Dict:
        if not self._meta:
            if self.meta_path.exists():
                try:
                    self._meta = json.loads(self.meta_path.read_text(encoding='utf-8'))
                except Exception as exc:
                    self._error = f'metadata: {exc}'
                    self._meta = {}
        return self._meta

    def status(self) -> Dict:
        meta = self.metadata()
        return {
            'available': self.available,
            'modelPath': str(self.model_path),
            'metadataPath': str(self.meta_path),
            'modelName': meta.get('modelName', self.model_path.name),
            'error': self._error,
        }

    def _ensure_session(self):
        if self._session is not None:
            return self._session
        if not self.model_path.exists():
            raise RuntimeError(f'Modelo de fronteras no encontrado: {self.model_path}')
        try:
            import onnxruntime as ort
        except Exception as exc:
            raise RuntimeError('onnxruntime no está instalado') from exc
        providers = ['CPUExecutionProvider']
        available = set(ort.get_available_providers())
        if 'CUDAExecutionProvider' in available and os.environ.get('CHORDSYNC_STRUCTURE_DEVICE', 'auto').lower() != 'cpu':
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
        self._session = ort.InferenceSession(str(self.model_path), providers=providers)
        return self._session

    def detect_file(self, input_path: Path, threshold: float | None = None, hop_seconds: float | None = None) -> Dict:
        try:
            import librosa
        except Exception as exc:
            raise RuntimeError('librosa no está instalado. Instala server/requirements-structure-neural.txt') from exc
        meta = self.metadata()
        sr_target = int(meta.get('sampleRate', 22050))
        frames = int(meta.get('frames', 96))
        n_mels = int(meta.get('nMels', 64))
        window_seconds = float(meta.get('windowSeconds', 8.0))
        hop = float(hop_seconds or meta.get('scanHopSeconds', 0.75))
        threshold = float(threshold if threshold is not None else meta.get('decisionThreshold', 0.55))
        nms_seconds = float(meta.get('nmsSeconds', 2.0))
        min_edge_seconds = float(meta.get('minEdgeSeconds', 2.0))
        y, sr = librosa.load(input_path, sr=sr_target, mono=True)
        duration = len(y) / max(1, sr)
        if duration < max(4.0, window_seconds * 0.75):
            return {'provider':'chordsync-structure-boundary-transformer-onnx','boundaries':[], 'curve':[], 'duration':duration}
        try:
            tempo_raw = librosa.beat.beat_track(y=y, sr=sr)[0] if len(y) > sr else 0
            tempo = float(np.asarray(tempo_raw).reshape(-1)[0])
        except Exception:
            tempo = 0.0
        centers = np.arange(max(min_edge_seconds, hop), max(min_edge_seconds, duration-min_edge_seconds)+1e-9, hop)
        xs=[]; auxs=[]
        for c in centers:
            a=max(0.0,float(c-window_seconds/2)); b=min(duration,float(c+window_seconds/2))
            x,aux=extract_section_features(y,sr,a,b,duration,tempo,n_mels,frames)
            # Replace duration aux with centered-window duration and append center position encoded in first aux already.
            xs.append(x); auxs.append(aux)
        if not xs:
            return {'provider':'chordsync-structure-boundary-transformer-onnx','boundaries':[], 'curve':[], 'duration':duration}
        session=self._ensure_session(); ins={i.name:i for i in session.get_inputs()}
        xb=np.stack(xs).astype(np.float32); ab=np.stack(auxs).astype(np.float32)
        feed={}
        feed['x' if 'x' in ins else next(iter(ins))]=xb
        if 'aux' in ins: feed['aux']=ab
        outputs=session.run(None,feed)
        if not outputs: raise RuntimeError('Modelo de fronteras no devolvió logits')
        logits=np.asarray(outputs[0])
        if logits.ndim==2 and logits.shape[1]==1: probs=_sigmoid(logits[:,0])
        elif logits.ndim==1: probs=_sigmoid(logits)
        elif logits.ndim==2 and logits.shape[1]>=2:
            z=logits-np.max(logits,axis=1,keepdims=True); ex=np.exp(z); probs=(ex[:,1]/np.maximum(ex.sum(axis=1),1e-12)).astype(np.float32)
        else: raise RuntimeError(f'Salida de frontera incompatible: {list(logits.shape)}')
        curve=[{'time':round(float(t),6),'probability':round(float(p),6)} for t,p in zip(centers,probs)]
        cand=[(float(p),float(t)) for t,p in zip(centers,probs) if p>=threshold]
        cand.sort(reverse=True)
        kept=[]
        for p,t in cand:
            if t<min_edge_seconds or duration-t<min_edge_seconds: continue
            if any(abs(t-u['time'])<nms_seconds for u in kept): continue
            kept.append({'time':round(t,6),'confidence':round(p,6)})
        kept.sort(key=lambda r:r['time'])
        return {
            'provider':'chordsync-structure-boundary-transformer-onnx',
            'modelName':meta.get('modelName',self.model_path.name),
            'modelVersion':meta.get('version',1),
            'threshold':threshold,'windowSeconds':window_seconds,'hopSeconds':hop,'nmsSeconds':nms_seconds,
            'boundaries':kept,'curve':curve,'duration':round(duration,6),'tempo':round(tempo,3) if math.isfinite(tempo) else None,
        }
