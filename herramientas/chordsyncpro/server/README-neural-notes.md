# Multi-pitch / note transcription — ChordSync v56

v56 usa Spotify Basic Pitch como proveedor opcional para estimar eventos de nota polifónicos. El resultado se usa en dos etapas: como evidencia armónica por frame antes de Viterbi y como verificación posterior de registro, bajo, inversiones y voicings observados.

## Instalar

```bash
pip install -r server/requirements-neural-notes.txt
python server/start.py
```

Comprueba `/api/v1/health`: `basicPitchAvailable` y `noteTranscriptionAvailable` deben ser `true`.

## API

`POST /api/v1/notes` con un campo multipart `file` devuelve eventos `start`, `end`, `midi`, `pitchClass`, `note`, `confidence` y `velocity`.

Umbrales del proveedor pueden ajustarse con:

- `CHORDSYNC_BASIC_PITCH_ONSET_THRESHOLD`
- `CHORDSYNC_BASIC_PITCH_FRAME_THRESHOLD`
- `CHORDSYNC_BASIC_PITCH_MIN_NOTE_MS`
- `CHORDSYNC_BASIC_PITCH_MIN_FREQ`
- `CHORDSYNC_BASIC_PITCH_MAX_FREQ`

## Licencia

El proyecto Basic Pitch de Spotify está publicado bajo Apache-2.0. Revisa también las dependencias y el empaquetado final de tu producto antes de distribuir una build comercial.
