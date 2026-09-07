# ChordSync Pro v62 — Production Candidate

La v62 añade controles operativos para producción: límite de concurrencia de inferencia, limpieza TTL del runtime, headers básicos, Docker/Compose y arranque con Uvicorn. El perfil sigue siendo RC hasta que el quality gate del corpus y la revisión de licencias estén aprobados.

# ChordSync Pro v62 — Benchmark directo contra Moises

La v62 no cambia el decoder principal: añade un adaptador reproducible para comparar ChordSync y exports/JSON de Moises sobre el mismo ground truth. Si no hay ground truth, reporta solo agreement y lo etiqueta explícitamente como no-accuracy.

# ChordSync Pro v62 — Release Candidate 1

La v62 consolida el pipeline experimental en un perfil `rc1-balanced`, añade firma reproducible del análisis, validación del contrato de salida, métricas de runtime y quality gates para automatizar regresiones. Esta es la versión en la que conviene congelar nuevas features y medir.

# ChordSync Pro v62 — Auto pipeline por canción

La v62 puntúa de forma conservadora los proveedores acústicos disponibles y la calidad de OTHER/BASS/DRUMS para elegir un pipeline por canción cuando el usuario deja `auto`. La decisión queda auditada en `decoderDiagnostics.pipelineDecision`.

# ChordSync Pro v62 — Benchmark end-to-end

La v62 añade medición de runtime y un evaluador CLI integrado para acordes, tonalidad, BPM, beats/downbeats, estructura y latencia usando los mismos exports JSON de ChordSync.

# ChordSync Pro v62 — Context-aware temporal fusion

La v62 hace que la persistencia por head se relaje cerca de beats, downbeats y picos de novedad armónica. Bajo/raíz pueden reaccionar rápido; séptimas/extensiones siguen siendo conservadoras en zonas estables.

# ChordSync Pro — v62 / Fase 8G

v62 añade **fusión temporal independiente por head** para la evidencia multi-pitch de Basic Pitch antes del Viterbi. La raíz, la triada, la séptima, la extensión y el bajo ya no reaccionan con la misma velocidad.

## Por qué

En audio real, distintos componentes armónicos tienen dinámicas distintas. El bajo puede anticipar un cambio de acorde; root/triad suelen estabilizarse rápido; séptimas y extensiones (`maj7`, `9`, `11`, `13`) necesitan evidencia persistente para no aparecer por notas de paso.

## Pipeline

```text
Basic Pitch notes
   ↓
head evidence por frame
   ├─ root
   ├─ triad
   ├─ seventh
   ├─ extension
   └─ bass
        ↓
head-specific temporal persistence
        ↓
confidence-gated fusion con Transformer multi-head
        ↓
P(chord | frame)
        ↓
Viterbi
```

## Persistencia por componente

Defaults:

```json
{
  "transcriptionRootPersistenceMs": 90,
  "transcriptionTriadPersistenceMs": 120,
  "transcriptionSeventhPersistenceMs": 190,
  "transcriptionExtensionPersistenceMs": 280,
  "transcriptionBassPersistenceMs": 65,
  "transcriptionSeventhMinDwellMs": 110,
  "transcriptionExtensionMinDwellMs": 180,
  "transcriptionTemporalBlend": 0.72
}
```

`bass` es el componente más rápido. `extension` es el más lento. Para `seventh` y `extension`, una clase no-neutral demasiado breve se mueve parcialmente hacia `none`, reduciendo falsos positivos provocados por notas de paso.

## Diagnóstico

`decoderDiagnostics.noteTranscriptionHeads.temporal` expone, por head:

```json
{
  "method": "head-specific-temporal-persistence-v1",
  "temporalBlend": 0.72,
  "perHead": {
    "bass": {"persistenceMs": 65, "radiusFrames": 1, "topLabelChanges": 48},
    "root": {"persistenceMs": 90, "radiusFrames": 1, "topLabelChanges": 31},
    "seventh": {"persistenceMs": 190, "minDwellMs": 110, "topLabelChanges": 12},
    "extension": {"persistenceMs": 280, "minDwellMs": 180, "topLabelChanges": 7}
  }
}
```

Esto permite comprobar si el filtro está suprimiendo ruido sin congelar demasiado la armonía.

## Auto-tuning

v62 incorpora `transcriptionTemporalBlend` y `transcriptionExtensionPersistenceMs` en la búsqueda automática, junto con los parámetros anteriores.

## Compatibilidad

- Si Basic Pitch no está disponible, el pipeline anterior sigue funcionando.
- Si no hay modelo multi-head, se conserva el fallback de evidencia de acordes completos de v54/v55.
- No requiere reentrenar el checkpoint multi-head.

## Versiones

- ChordSync: **62.0**
- Analysis Engine: **v62**
- schemaVersion: **53**
- Backend: **62.0**
