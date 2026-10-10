# Auditoría posterior a correcciones

## Corregido
1. Tempo y tono dejan de depender de `playbackRate + detune`.
2. Se usa un procesador granular con alineación WSOLA con dos controles independientes:
   - tempo determina la duración final;
   - pitch factor determina la altura local de los granos.
3. La reproducción usa el buffer procesado a velocidad 1.0.
4. La exportación reutiliza exactamente el mismo procesamiento.
5. El usuario puede exportar el archivo completo o el loop A–B.
6. El waveform tiene ventana temporal real, zoom, pan y clic relativo a la ventana visible.
7. Se añadieron presets y atajos.

## Consideración de calidad
El procesador es autocontenido. Alinea los solapamientos por correlación normalizada y comparte el desplazamiento entre canales para preservar la imagen estéreo. Los cambios extremos y mezclas polifónicas pueden conservar artefactos; no se presenta como procesamiento de mastering.

## Regresión de tono
`node speed/tests/pitch-preservation.cjs` comprueba 440 Hz a velocidades 50 %, 75 %, 150 % y 200 %, cambio explícito a 880 Hz, duración, estéreo en contrafase y bypass. El tono comienza en cero al abrir la app; la velocidad guardada se conserva.

## Validación recomendada en navegador
- voz: 75% con pitch 0;
- voz: 100% con +5 st;
- música: 60–80% con pitch 0;
- loop A–B exportado;
- zoom > 4x y pan con rueda/trackpad.
