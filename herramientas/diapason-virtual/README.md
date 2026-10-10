# Diapasón Virtual · Revisión profesional

Esta versión parte de la Fase 5 y aplica una revisión musical, responsive y estructural.

## Correcciones musicales
- Corrige la altura sonora del requinto A–D–G–C–E–A una octava abajo respecto de la versión anterior.
- Guitarra, ukelele y requinto conservan altura sonora para audio/diapasón y se muestran una octava arriba en el pentagrama, siguiendo la escritura habitual de la familia de guitarra.
- MusicXML se convierte de altura escrita a altura sonora con -12 semitonos para los tres instrumentos.
- El diapasón respeta spelling enharmónico según la fundamental (Db/Eb/Gb/Ab/Bb cuando corresponde).
- “Grados” ahora muestra alteraciones funcionales (♭3, ♯4/♭5, ♭7…) en lugar de numerar simplemente el orden de la escala.
- 3NPS se habilita solo para escalas heptatónicas; para escalas de 5/6/8 notas vuelve automáticamente a Libre.

## UX / responsive
- Compactación adicional para portátiles de 13 pulgadas entre 1180 y 1450 px.
- Panel de controles aprovecha mejor el ancho antes de saltar a diseños de tablet/móvil.
- Etiquetas CAGED/3NPS se presentan como zonas/guías para no confundirlas con digitaciones editoriales únicas.

## Estructura
- `js/fretboard.js`: teoría, instrumento, audio y diapasón.
- `js/staff.js`: pentagrama.
- `js/metronome.js`: metrónomo y pulso.
- `js/score.js`: PDF, imágenes, web, MusicXML, reproducción, tutor y digitación de frase.
- `js/ukulele-chords.js` y `js/ukulele-bank-ui.js`: banco específico de ukelele.
- `js/guitar-chords.js` y `js/guitar-bank-ui.js`: bancos separados de guitarra estándar y requinto estándar. Incluye 561 posturas verificadas en tres registros; el requinto conserva las formas y presenta los nombres una cuarta justa arriba.
- `tests/validate.js`: comprobación básica de IDs y dependencias.
- `tests/guitar-bank.test.js`: verificación de notas, posiciones e igualdad interválica entre guitarra y requinto.

## Publicación
Sube `index.html`, `css/`, `js/` y cualquier recurso adicional que ya use tu repositorio. La versión `diapason-virtual-standalone.html` se incluye para pruebas/archivo.
