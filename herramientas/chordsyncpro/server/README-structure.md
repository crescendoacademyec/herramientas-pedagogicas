# ChordSync v44 — estructura semántica neural

v44 mantiene el detector híbrido de v40 como baseline y añade un clasificador neuronal entrenable para `Intro / Verse / Pre-Chorus / Chorus / Bridge / Solo / Outro`.

## 1. Crear dataset

Cada audio debe tener un `.sections` con el mismo nombre base:

```text
0.000 8.400 Intro
8.400 32.100 Verse
32.100 48.000 Pre-Chorus
48.000 72.000 Chorus
```

```bash
pip install -r server/requirements-training.txt
python server/build_structure_dataset.py ./corpus --out-dir ./structure_dataset_v44
```

El split es determinista **por canción**. Produce `train.npz`, `validation.npz`, `test.npz` y `dataset_manifest.json`.

## 2. Entrenar el Transformer

```bash
pip install -r server/requirements-structure-neural.txt
python server/train_structure.py structure_dataset_v44/train.npz \
  --val-npz structure_dataset_v44/validation.npz \
  --test-npz structure_dataset_v44/test.npz \
  --epochs 35 \
  --out models/structure_model.onnx
```

Arquitectura: log-mel `[192,64]` -> proyección temporal -> Transformer encoder -> attention pooling; ocho features auxiliares entran por un MLP y se fusionan antes del head semántico.

El mejor checkpoint se selecciona con `0.55 * accuracy + 0.45 * macro recall` sobre VALIDATION. TEST no participa en la selección.

## 3. Activar inferencia en ChordSync

El backend busca por defecto:

```text
models/structure_model.onnx
models/structure_model.onnx.json
```

También puedes definir:

```bash
export CHORDSYNC_STRUCTURE_MODEL=/ruta/structure_model.onnx
export CHORDSYNC_STRUCTURE_MODEL_META=/ruta/structure_model.onnx.json
```

Después inicia:

```bash
python server/start.py
```

`GET /api/v1/health` debe indicar `structureNeuralAvailable: true`.

## 4. Runtime y fallback

La app primero detecta las fronteras estructurales A/B/C con el motor local. Luego envía **el audio original + las fronteras candidatas** al endpoint `POST /api/v1/structure`. El modelo clasifica cada región. La app permite tres modos:

- `Neural + heurística` (default): fusiona probabilidades neuronales y scores heurísticos.
- `Neural`: usa el modelo cuando supera el umbral; si no, deja `Unclassified`.
- `Heurística`: reproduce el baseline de v40.

Si el modelo/onnxruntime/backend no están disponibles, ChordSync vuelve automáticamente al baseline heurístico.

## 5. Evaluación A/B

Después de analizar una canción, usa `🏷 Evaluar estructura` y carga su `.sections`. Cuando hubo inferencia neural, el reporte muestra también el A/B contra la heurística v40: accuracy y macro-F1 antes/después.

## v44 — detector neuronal de fronteras

Además del clasificador semántico, v44 añade `structure_boundary_model.onnx`.

```bash
python server/build_structure_boundary_dataset.py ./corpus --out-dir structure_boundary_dataset_v44
python server/train_structure_boundary.py structure_boundary_dataset_v44/train.npz \
  --val-npz structure_boundary_dataset_v44/validation.npz \
  --test-npz structure_boundary_dataset_v44/test.npz \
  --out models/structure_boundary_model.onnx
```

El runtime escanea la canción con ventanas solapadas, produce una curva `P(boundary)` y aplica NMS temporal. El frontend combina esos picos con las fronteras A/B/C existentes antes de enviar las regiones al clasificador semántico.


## v44 — Joint Structure Transformer

La v44 puede reemplazar las dos redes separadas de v41/v42 por un encoder compartido con dos cabezas: `boundary` y `semantic`.

```bash
python server/build_structure_joint_dataset.py ./corpus --out-dir ./structure_joint_dataset_v44
python server/train_structure_joint.py structure_joint_dataset_v44/train.npz \
  --val-npz structure_joint_dataset_v44/validation.npz \
  --test-npz structure_joint_dataset_v44/test.npz \
  --out models/structure_joint_model.onnx
```

El runtime expone `POST /api/v1/structure/joint`. El health endpoint reporta `structureJointNeuralAvailable`. Si el checkpoint no existe, la aplicación vuelve al pipeline de redes separadas y después a las heurísticas.
