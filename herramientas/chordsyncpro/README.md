# ChordSync Pro

Analizador local de acordes, tonalidad, tempo y estructura. El frontend usa Essentia/WASM y puede combinar opcionalmente separación por stems, BeatNet, Basic Pitch y un modelo neuronal de acordes.

## Ejecutar

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
python server/start.py
```

Abre `http://127.0.0.1:8000`. No abras `index.html` directamente: las rutas de workers, WASM y API requieren el servidor.

Para añadir ritmo y transcripción multipitch:

```bash
pip install -r server/requirements-neural-rhythm.txt
pip install -r server/requirements-neural-notes.txt
```

La separación Demucs se activa desde el botón de stems automáticos. En CPU puede tardar varios minutos.

## Precisión de acordes

La instalación incluida funciona con el fallback probabilístico HPCP de Essentia. Los archivos `models/*.example.json` son contratos de ejemplo, no modelos entrenados. Para usar inferencia neuronal en el navegador hacen falta:

- `vendor/ort.min.js`
- `models/chord_model.json` y el `.onnx` indicado por ese manifiesto; o
- `models/multihead_chord_model.json` y su checkpoint `.onnx`.

También se puede configurar el proveedor BTC/CrispASR del backend siguiendo [server/README-neural-chords.md](server/README-neural-chords.md). Los pesos públicos mencionados allí son solo para evaluación no comercial.

Los archivos de `moises_referencia/` permiten estudiar la experiencia de usuario, pero no contienen el detector de Moises: ese cliente envía el trabajo a `api.moises.ai/graphql`. Por tanto, no aportan un checkpoint que pueda copiarse o ejecutarse localmente.

## Correcciones importantes del pipeline local

- El cromagrama conserva silencios y frames inválidos en su posición temporal. Antes se eliminaban y todos los acordes posteriores a una pausa podían desplazarse.
- El estado `N` (sin acorde) forma parte explícita del modelo HPCP, evitando forzar una tríada durante silencios o evidencia débil.
- El cálculo de BPM usa los 60 segundos correctos por minuto.
- Los proveedores del backend también se intentan con contenedores de video; el backend conserva la extensión y los decodifica con las dependencias de audio instaladas.

## Verificación

```bash
node --check app.js
node --check worker.js
node tests/worker_regression.test.js
PYTHONPATH=server python -m unittest server/test_core.py -v
```

Para medir precisión real usa pares de audio + anotaciones `.lab` desde la sección de benchmark. El agreement interno entre motores no es una métrica de accuracy.

## Producción

```bash
docker compose up --build
```

El contenedor base incluye el frontend, la API y Demucs. Los proveedores neuronales opcionales y sus modelos deben añadirse de forma explícita según sus licencias.
