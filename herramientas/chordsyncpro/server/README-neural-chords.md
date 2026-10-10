# Proveedor neuronal de acordes — BTC / CrispASR

ChordSync v29 añade `POST /api/v1/chords`. El adaptador ejecuta el backend BTC de CrispASR y devuelve una línea temporal de acordes que el worker convierte en observaciones probabilísticas para Viterbi y para el ensemble BTC + HPCP.

## Opción A: evaluación local con pesos públicos no comerciales

Instala/compila CrispASR y deja el binario accesible como `crispasr`, o define:

```bash
export CHORDSYNC_CRISPASR_BIN=/ruta/crispasr
export CHORDSYNC_BTC_MODEL=auto
export CHORDSYNC_BTC_ACCEPT_NC=1
```

`CHORDSYNC_BTC_ACCEPT_NC=1` es deliberadamente explícito: la ruta `auto` descarga pesos BTC con licencia no comercial. No actives esta opción para empaquetar un producto comercial.

## Opción B: checkpoint propio

Para un producto comercial, entrena/suministra tus propios pesos compatibles y usa:

```bash
export CHORDSYNC_CRISPASR_BIN=/ruta/crispasr
export CHORDSYNC_BTC_MODEL=/ruta/mi_btc_comercial.gguf
```

En ese caso ChordSync no intenta aceptar ni descargar los pesos públicos.

## Verificación

Arranca el backend y consulta `/api/v1/health`. Debes ver:

```json
{
  "btcBinaryAvailable": true,
  "btcAvailable": true,
  "btcModel": "..."
}
```

El endpoint de análisis es:

```text
POST /api/v1/chords
```

El frontend lo usa automáticamente cuando `acousticProvider` es `auto`, `btc` o `btc-ensemble`.
