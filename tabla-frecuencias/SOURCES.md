# Registros y criterios editoriales (26 de septiembre de 2026)

La tabla combina dos clases de información que no son intercambiables: registros de notas y zonas de mezcla. Se añaden 31 perfiles a las 15 referencias existentes. No se publican copias de los PDF aportados.

## Convenciones

- Alturas **sonoras**, Do central C4, temperamento igual y A4 = 440 Hz. Hz = 440 × 2^((MIDI − 69)/12), redondeados a 0,1 Hz. Referencia: [Indiana University, Introduction to Computer Music, apéndice B](https://cmtext.indiana.edu/appendices/appendix_B.php) (hoy redirige a cmtext.com).
- Un límite agudo orquestal es una referencia práctica, no la capacidad máxima de un solista. Las extensiones, armónicos ejecutados y afinaciones alternativas se indican aparte.
- No se inventan límites de armónicos ni bandas de EQ para los perfiles nuevos. En «Zona de mezcla» conservan su registro y lo advierten en la ficha. Las bandas grises antiguas son orientaciones de mezcla, no mediciones de una grabación.
- Las recomendaciones son síntesis editoriales condicionadas a la escucha; no son presets universitarios, certificaciones ni avales institucionales.

## Registros contrastados

| Perfiles | Fuente y alcance |
| --- | --- |
| Violín G3–E7, viola C3–E6 | Samuel Adler, *The Study of Orchestration*, PDF aportado, pp. impresas 58 y 72 (PDF 76 y 90). Lectura visual de ejemplos 3-2 y 3-29. Se elige registro orquestal, no extremos de solo. |
| Cello C2–A5 | [VSL Academy, Cello](https://www.vsl.co.at/academy/strings/cello). Adler p. 82 y Sección de Cuerdas HTC pp. 2–3 se contrastaron; sus extensiones difieren. Se declara la referencia elegida. |
| Contrabajo E1–G3 | [Macalester College, fig. 28-1, p. 3](https://pressbooks.macalester.digital/multimodalmusicianship/files/2023/05/Fig-28.1.pdf): convertir una octava hacia abajo. Adler p. 90 confirma transposición y extensiones. No se usa el ambiguo rango del apunte HTC como límite universal. |
| Flauta, piccolo, oboe, corno inglés, fagot, saxofones y trompeta | [Macalester College, Multimodal Musicianship](https://pressbooks.macalester.digital/multimodalmusicianship/chapter/instrument-transpositions-ranges/), figura 28-1 revisada visualmente. Saxos: escrito B♭3–F6, sin altissimo; trompeta en Si♭: escrito F♯3–C6. Todas las transposiciones se aplican antes de calcular Hz. |
| Clarinete en Si♭ | [VSL Academy](https://www.vsl.co.at/academy/woodwinds/clarinet): D3–B♭6, con G6 como referencia orquestal indicada en la ficha. |
| Trompa B1–F5, trombón E2–F5, tuba D1–G4 | VSL Academy: [trompa](https://www.vsl.co.at/academy/brass/horn-f), [trombón](https://www.vsl.co.at/academy/brass/tenor-trombone), [tuba](https://www.vsl.co.at/academy/brass/bass-tuba). Pedales y extensiones se excluyen o explican. |
| Seis voces | [Yale University Library](https://yalelibrary.atlassian.net/wiki/spaces/YMD/pages/202030334), rangos de catalogación del New Harvard Dictionary of Music: soprano C4–A5, mezzo A3–F5, contralto F3–D5, tenor B2–G4, barítono G2–E4, bajo E2–C4. No son límites operísticos ni diagnósticos de tesitura personal. |
| Arpa | [VSL Academy](https://www.vsl.co.at/academy/strings/harp), C♭1–G♯7. C♭1 equivale a B0, no a B1. |
| Mandolina | Adler cap. 4, afinación G3–D4–A4–E5. Se muestra explícitamente la ventana de 12 trastes (hasta E6), no el rango máximo de todos los modelos. |
| Ukelele | [Yamaha YT-220](https://jp.yamaha.com/files/download/other_assets/3/333423/yt220_en.pdf): afinación reentrante; ventana calculada de 12 trastes hasta A5. Se avisa de low-G y barítono. |
| Marimba y vibráfono | Yamaha Music: [marimbas](https://hub.yamaha.com/music-educators/instruments/perc/what-marimba-should-i-purchase/) y [vibráfonos](https://hub.yamaha.com/music-educators/instruments/perc/vibraphone-bars/). Se especifican modelos de 5 y 3 octavas. |
| Timbal orquestal grave | [VSL Academy](https://www.vsl.co.at/academy/percussion/timpani), modelo grave grande C2–C3. No confundir con timbales latinos ni con el conjunto de cuatro o cinco calderos. |
| Clavecín | [The Met, instrumento de Jean Goermans](https://www.metmuseum.org/art/collection/search/503901): teclado histórico FF–f3, convertido a F1–F6. Ejemplo de extensión, no afirmación sobre todos los clavecines. |

## Mezcla y material aportado

- [Berklee Online, Rich Mendelson, EQ in Music](https://online.berklee.edu/takenote/what-is-eq-in-music-10-audio-equalization-tips/): principios de EQ contextual, fundamentales y sobretonos. No se atribuyen a Berklee las bandas específicas de nuestras fichas.
- *Vocal Mixing Reference Guide*, pp. 2–5: filtrado que preserve fundamentales, de-esser y diferencia entre compresión en serie y paralela.
- *Sección de Cuerdas HTC*, pp. 1–3 y 7: técnicas y mezcla de sección. Sus orientaciones de 200–300 Hz no se extrapolan a un filtro obligatorio para todo instrumento.
- *Chapter 5 es*, *Aprende a utilizar tu ecualizador*, *Tabla de Frecuencias* y *Resumen de técnicas*: consulta de texto. Se descartan afirmaciones absolutas como «no hay información útil» debajo de un corte común a toda una familia.
- *The Art of Mixing* se consultó en texto; no se reproducen sus diagramas. *Mixing Drums* y *Mixing Live* son mayormente gráficos/escaneados: no se usan para asignar cifras nuevas. Adler se revisó visualmente en las páginas pertinentes porque el PDF tiene muy poco texto extraíble.
- Se corrigen dos definiciones previas: compresión en serie requiere varias etapas; makeup gain y gain reduction son conceptos distintos. La frecuencia de sibilancia no se fija por sexo o clasificación vocal.

## Comprobaciones

`node --test tabla-frecuencias/tests/catalog.test.cjs`

Revisión en navegador de familias, búsqueda sin tildes, comparación, fuentes, cambio de vista y ausencia de desbordamiento horizontal. El analizador comparte las referencias seleccionadas en la tabla.
