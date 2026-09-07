# Backend de audio — ChordSync v56

El backend FastAPI sirve el frontend y proveedores opcionales de audio intelligence.

## Instalación base

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r server/requirements.txt
python server/start.py
```

Abre `http://127.0.0.1:8000`.

## Proveedores opcionales

Beat/downbeat neuronal:

```bash
pip install -r server/requirements-neural-rhythm.txt
```

Multi-pitch / note transcription con Spotify Basic Pitch:

```bash
pip install -r server/requirements-neural-notes.txt
```

Estructura neuronal:

```bash
pip install -r server/requirements-structure-neural.txt
```

Los endpoints principales son `/api/v1/separate`, `/api/v1/rhythm`, `/api/v1/chords`, `/api/v1/notes`, `/api/v1/structure`, `/api/v1/structure/boundaries` y `/api/v1/structure/joint`.

## Variables útiles

- `CHORDSYNC_DEMUCS_MODEL=htdemucs`
- `CHORDSYNC_DEMUCS_DEVICE=cpu` o `cuda`
- `CHORDSYNC_BEATNET_DEVICE=cpu` o `cuda`
- `CHORDSYNC_BASIC_PITCH_ONSET_THRESHOLD=0.50`
- `CHORDSYNC_BASIC_PITCH_FRAME_THRESHOLD=0.30`
- `CHORDSYNC_BASIC_PITCH_MIN_NOTE_MS=90`
- `CHORDSYNC_MAX_UPLOAD_MB=250`
- `CHORDSYNC_RUNTIME_DIR=/ruta/temporal`

Consulta `README-neural-chords.md` para BTC/CrispASR y `README-structure.md` para los modelos de estructura.
