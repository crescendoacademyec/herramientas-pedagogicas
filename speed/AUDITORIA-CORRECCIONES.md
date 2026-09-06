# Auditoría posterior a correcciones

## Corregido
1. Tempo y tono dejan de depender de `playbackRate + detune`.
2. Se usa un procesador granular OLA con dos controles independientes:
   - tempo determina la duración final;
   - pitch factor determina la altura local de los granos.
3. La reproducción usa el buffer procesado a velocidad 1.0.
4. La exportación reutiliza exactamente el mismo procesamiento.
5. El usuario puede exportar el archivo completo o el loop A–B.
6. El waveform tiene ventana temporal real, zoom, pan y clic relativo a la ventana visible.
7. Se añadieron presets y atajos.

## Consideración de calidad
El algoritmo granular es intencionalmente autocontenido y no depende de un segundo CDN. Es robusto para práctica musical y cambios moderados. Para mastering o cambios extremos, un phase-vocoder/WSOLA nativo especializado puede ofrecer menos artefactos.

## Validación recomendada en navegador
- voz: 75% con pitch 0;
- voz: 100% con +5 st;
- música: 60–80% con pitch 0;
- loop A–B exportado;
- zoom > 4x y pan con rueda/trackpad.
