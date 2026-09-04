# Ear Training · Crescendo Academy — versión Pro

Proyecto estático (HTML/CSS/JavaScript) de entrenamiento auditivo. No requiere backend ni framework.

## Cómo usarlo

- Para publicar: sube toda esta carpeta a GitHub Pages, Netlify, Vercel o cualquier hosting estático.
- Para una prueba local rápida: abre `ear_training_pro_standalone.html` en el navegador.
- `index.html` usa los archivos separados de `js/` y `styles.css`, por lo que es la versión recomendada para mantenimiento.
- El piano/Rhodes/guitarra usan `soundfont-player` desde CDN; si la carga externa falla, el motor usa un oscilador seno como fallback.

## Cambios principales

1. Banco de acordes corregido contra la imagen de referencia: 52 sonoridades únicas, incluyendo `m(maj7)`, `sus2/4`, `maj9`, `13sus4`, alterados, etc. Los alias de cifrado ya no aparecen como respuestas auditivamente distintas.
2. Intervalos melódicos ascendentes, descendentes, armónicos y aleatorios.
3. Cada Challenge congela y guarda su configuración exacta.
4. Nueva vista **Progreso**: promedio de los últimos Challenges, mejor resultado, tiempo total y conceptos débiles.
5. Cada respuesta guarda metadatos musicales (concepto, dirección, fórmula, tonalidad, referencia, voicing, etc.).
6. Proyecto dividido en módulos funcionales (`data`, `storage`, `audio`, `generators`, `app`).
7. Manejo de eventos centralizado por delegación; el quiz se actualiza sin reconstruir toda la aplicación en cada respuesta.
8. Persistencia robusta con base local versionada (`earTraining_db_v3`) y migración conservadora desde la versión anterior.
9. Separación entre **Reiniciar progreso**, **Restaurar configuración** y **Borrar todos los datos**.
10. Nomenclatura musical normalizada (`3ª`, `♭`, `♯`, `maj7`, `m7`, etc.).
11. Tritono mostrado como **4ª aumentada / 5ª disminuida**.
12. Guías de intervalos con semitonos y ejemplo `Do → nota` claramente marcado como ejemplo.
13. Presets de dificultad para intervalos y acordes.
14. Selector de acordes agrupado por familias.
15. Voicings: posición fundamental, inversiones, abierto/drop 2 y aleatorio.
16. Registro grave, medio, agudo o aleatorio.
17. **Practicar errores** desde el último Challenge, el historial o la lista de debilidades.
18. Feedback más didáctico con fórmula, distancia, tonalidad y respuesta elegida.
19. Mejoras de accesibilidad: foco visible, `aria-live`, etiquetas y controles de teclado.
20. Atajos: `Espacio` reproducir, `1–4` responder, `N` siguiente.
21. Persistencia de volumen, autoplay, instrumento, duración del Challenge y configuraciones de práctica.
22. Timbres: piano, Rhodes, guitarra nylon y seno puro.
23. Referencia tonal configurable: nota tónica, `Imaj7` o cadencia `I–IV–V–I`.
24. Las referencias de canciones se presentan explícitamente como **mnemónicas**, no como definición del intervalo; no se reproducen letras ni audio protegido.

## Arquitectura

- `index.html`: estructura de la página.
- `styles.css`: diseño responsive y accesible.
- `js/data.js`: niveles, intervalos, banco de acordes y contenido pedagógico.
- `js/storage.js`: preferencias, estadísticas, historial, migración y reinicios.
- `js/audio.js`: AudioContext, SoundFont, instrumentos y fallback.
- `js/generators.js`: generadores musicales de los 8 niveles.
- `js/app.js`: estado, vistas, Challenge, progreso, revisión de errores y eventos.
- `ear_training_pro_standalone.html`: versión de un solo archivo.
- `docs/chord-bank-reference.png`: imagen proporcionada como referencia para el banco de acordes.

## Banco de acordes validado

El banco siguiente contiene 52 entradas y no tiene fórmulas duplicadas exactas. Los alias (`−7`, `min7`, etc.) se muestran como alias del mismo objeto musical y no como respuestas diferentes.

| # | Cifrado en Do | Nombre | Fórmula |
|---:|---|---|---|
| 1 | C5 | Quinta / power chord | 1–5 |
| 2 | C | Mayor | 1–3–5 |
| 3 | Cm | Menor | 1–♭3–5 |
| 4 | C+ | Aumentado | 1–3–♯5 |
| 5 | C° | Disminuido | 1–♭3–♭5 |
| 6 | Csus2 | Sus2 | 1–2–5 |
| 7 | Csus4 | Sus4 | 1–4–5 |
| 8 | Csus2/4 | Sus2/4 | 1–2–4–5 |
| 9 | Cadd2 | Add2 | 1–2–3–5 |
| 10 | Cm(add2) | Menor add2 | 1–2–♭3–5 |
| 11 | Cadd4 | Add4 | 1–3–4–5 |
| 12 | Cm(add4) | Menor add4 | 1–♭3–4–5 |
| 13 | Cadd9 | Add9 | 1–3–5–9 |
| 14 | Cm(add9) | Menor add9 | 1–♭3–5–9 |
| 15 | C6 | Sexta mayor | 1–3–5–6 |
| 16 | Cm6 | Menor sexta | 1–♭3–5–6 |
| 17 | C6/9 | Seis nueve | 1–3–5–6–9 |
| 18 | Cm6/9 | Menor seis nueve | 1–♭3–5–6–9 |
| 19 | Cmaj7 | Mayor séptima | 1–3–5–7 |
| 20 | Cm(maj7) | Menor con séptima mayor | 1–♭3–5–7 |
| 21 | C7 | Dominante séptima | 1–3–5–♭7 |
| 22 | Cm7 | Menor séptima | 1–♭3–5–♭7 |
| 23 | C7sus4 | Dominante sus4 | 1–4–5–♭7 |
| 24 | Cm7add4 | Menor 7 add4 | 1–♭3–4–5–♭7 |
| 25 | Cm7♭5 | Semidisminuido | 1–♭3–♭5–♭7 |
| 26 | C°7 | Disminuido séptima | 1–♭3–♭5–6 |
| 27 | C7♯5 | Dominante ♯5 | 1–3–♯5–♭7 |
| 28 | C7♭5 | Dominante ♭5 | 1–3–♭5–♭7 |
| 29 | Cmaj7♯5 | Mayor 7 ♯5 | 1–3–♯5–7 |
| 30 | Cmaj7♭5 | Mayor 7 ♭5 | 1–3–♭5–7 |
| 31 | C7♯11 | Dominante ♯11 | 1–3–5–♭7–♯11 |
| 32 | Cmaj7♯11 | Mayor 7 ♯11 | 1–3–5–7–♯11 |
| 33 | C7(♯9♭5) | Dominante ♯9 ♭5 | 1–3–♭5–♭7–♯9 |
| 34 | C7(♭9♯5) | Dominante ♭9 ♯5 | 1–3–♯5–♭7–♭9 |
| 35 | Cmaj9 | Mayor novena | 1–3–5–7–9 |
| 36 | C9 | Dominante novena | 1–3–5–♭7–9 |
| 37 | C7♭9 | Dominante ♭9 | 1–3–5–♭7–♭9 |
| 38 | C7♯9 | Dominante ♯9 | 1–3–5–♭7–♯9 |
| 39 | Cm9 | Menor novena | 1–♭3–5–♭7–9 |
| 40 | C9♯5 | Novena ♯5 | 1–3–♯5–♭7–9 |
| 41 | C9♭5 | Novena ♭5 | 1–3–♭5–♭7–9 |
| 42 | C9sus4 | Novena sus4 | 1–4–5–♭7–9 |
| 43 | C9♯11 | Novena ♯11 | 1–3–5–♭7–9–♯11 |
| 44 | Cmaj9♯11 | Mayor 9 ♯11 | 1–3–5–7–9–♯11 |
| 45 | C11 | Dominante once | 1–3–5–♭7–9–11 |
| 46 | Cm11 | Menor once | 1–♭3–5–♭7–9–11 |
| 47 | C13 | Dominante trece | 1–3–5–♭7–9–11–13 |
| 48 | C13sus4 | Trece sus4 | 1–4–5–♭7–9–13 |
| 49 | Cmaj13 | Mayor trece | 1–3–5–7–9–11–13 |
| 50 | C13♭9 | Trece ♭9 | 1–3–5–♭7–♭9–11–13 |
| 51 | C13♯9 | Trece ♯9 | 1–3–5–♭7–♯9–11–13 |
| 52 | C13♯11 | Trece ♯11 | 1–3–5–♭7–9–♯11–13 |

## Nota musical sobre `13sus4`

Se implementa como `1–4–5–♭7–9–13`: la suspensión reemplaza la 3ª por la 4ª; no se duplica la misma clase de altura como 4ª y 11ª simultáneamente.

## Datos locales

Los datos se guardan únicamente en `localStorage` del navegador. No existe una cuenta de usuario ni sincronización en la nube en esta versión.

## Validación incluida

Ejecuta `node tests/validate.js` para comprobar el banco de 52 acordes, ausencia de fórmulas duplicadas exactas y generación válida de preguntas en los 8 niveles.
