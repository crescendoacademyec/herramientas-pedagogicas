# Folk Virtual · revisión musical y técnica

Versión revisada a partir de Folk Virtual integrado con la base avanzada de Diapasón Virtual.

## Cambios principales

- Header Crescendo compacto con metrónomo.
- Lector PDF / imágenes / web / MusicXML y tutor conservados.
- Modelo instrumental revisado por **órdenes/cursos**:
  - Tiple colombiano: 4 órdenes, 12 cuerdas.
  - Tres cubano: 3 órdenes, 6 cuerdas.
  - Cuatro venezolano: 4 cuerdas, afinación reentrante.
- Tiple:
  - afinación moderna D–G–B–E;
  - alternativa grave C–F–A–D;
  - octavas reales de los órdenes modeladas para audición.
- Tres cubano:
  - G–C–E en Do mayor;
  - variante con primer orden en octavas;
  - A–D–F# en Re mayor;
  - cursos dobles y octavas modelados para audición;
  - notación una octava por encima del sonido.
- Cuatro venezolano:
  - A3–D4–F#4–B3, reentrante;
  - sin heredar la geometría E–B–G–D de guitarra.
- Pentagrama corregido para usar `writtenTranspose` del instrumento activo.
- MusicXML/tutor reconoce todas las voces que pertenecen a un orden octavado.
- El tutor compara cuerda/orden + traste, no una sola octava representativa.
- Voicings reemplazados por estructuras genéricas de 3/4 órdenes; se retiraron nombres Drop 2/Drop 3 propios de guitarra.
- En instrumentos reentrantes, la inversión se calcula por la nota realmente más grave, no por el número físico de cuerda.
- Filtro Graves/Centrales/Agudas adaptado al número real de órdenes.
- `localStorage` separado (`folkVirtual_settings_v1`) para evitar contaminación con Diapasón Virtual.

## Fuentes de revisión

- Orquesta Filarmónica de Bogotá, contenidos pedagógicos de tiple.
- Estudio académico sobre afinación y modelado físico del tiple colombiano (Universidad de San Buenaventura).
- Referencias sobre tiple colombiano y sus afinaciones por cursos.
- Referencias de tres cubano sobre G–C–E, A–D–F# y cursos en octavas/unísono.
- Referencias de cuatro venezolano sobre afinación A–D–F#–B y carácter reentrante.

## Validación

```bash
node tests/validate.js .
node --check js/fretboard.js
node --check js/staff.js
node --check js/metronome.js
node --check js/score.js
```
