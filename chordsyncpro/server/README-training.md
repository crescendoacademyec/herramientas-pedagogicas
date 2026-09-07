# v37 — functional harmony training

La v37 añade un segundo contexto de transición invariante a transposición. `build_multihead_dataset.py` lee `# key:` cuando existe y guarda `key_root`/`key_mode`; el trainer construye desde TRAIN un prior `degree+triad -> degree+triad` condicionado por major/minor. Si el dataset es anterior y no tiene tonalidad, el trainer estima una tonalidad conservadora desde sus anotaciones para mantener compatibilidad.

Nuevas opciones: `--functional-loss-weight`, `--functional-report`, `--no-functional-loss`. El reporte por defecto es `<model>.functional-transitions.json`. TEST nunca se usa para ajustar este prior.

---

# Entrenamiento multi-head — v37

v37 mantiene el entrenamiento balanceado, la loss musical de v33, temperature scaling y thresholds de v31/v32, y añade un regularizador de **contexto armónico TRAIN-only**.

## Comando recomendado

```bash
python server/train_multihead.py dataset_v37/train.npz \
  --val-npz dataset_v37/validation.npz \
  --test-npz dataset_v37/test.npz \
  --epochs 30 \
  --out models/multihead_chord_model.onnx
```

El entrenamiento produce, además del ONNX:

```text
.onnx.balance.json
.onnx.training.json
.onnx.calibration.json
.onnx.thresholds.json
.onnx.transitions.json
```

## Contexto de transiciones

Se estima un prior de 72 estados (`12 roots × 6 triads`) usando sólo cambios reales dentro de TRAIN. Los frames repetidos de un mismo acorde no se cuentan como progresiones.

Parámetros:

```text
--transition-loss-weight 0.08
--transition-alpha 0.5
--transition-backoff 0.20
```

Para hacer A/B contra cross-entropy + loss musical sin contexto:

```bash
python server/train_multihead.py dataset_v37/train.npz \
  --val-npz dataset_v37/validation.npz \
  --no-transition-loss \
  --skip-export \
  --epochs 10
```

La selección de checkpoint usa:

```text
0.47 * mean accuracy
+ 0.38 * mean macro recall
+ 0.10 * (1 - aggregate musical cost)
+ 0.05 * transition boundary accuracy
```

El prior de transición jamás usa VALIDATION o TEST. VALIDATION sólo selecciona checkpoint, calibra temperaturas y aprende thresholds; TEST se reserva para evaluación final.
