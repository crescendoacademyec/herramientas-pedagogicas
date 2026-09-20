# Generadores de improvisación

Ejercicios originales basados en los conceptos de los dos libros proporcionados. No se copian sus partituras.

| Referencia (páginas del PDF) | Aplicación |
| --- | --- |
| Mini Monstro, 19 | Escala secuencial y aleatoria, intervalos, saltos, arpegios de los siete grados, motivos y transformaciones (unidades 2, 4 y 5). |
| Mini Monstro, 29 | Notas de los acordes y guías dentro de progresiones (unidad 6). |
| Mini Monstro, 38 | Aproximaciones cromáticas a los cuatro sonidos de cada acorde de séptima (unidad 7). |
| Mini Monstro, 48 | Figuras seleccionables en los generadores melódicos; variedad rítmica, silencios, tresillos y desplazamientos (unidades 9 y 10). |
| Major Scale Course, 3–5 y sus transposiciones | Material lineal, intervalos, tríadas, tétradas, grupos de tres sobre cuatro, aproximaciones, pivotes y material pentatónico (unidad 3). |

Las unidades 1, 11 y 12 conservan sus bloques de planificación, escucha y construcción de un chorus; no tenían generadores de partituras.

## Ciclos y límites musicales

Cada familia y sus filtros recorren un conjunto finito de patrones en orden aleatorio, sin reemplazo. Al agotarse, se baraja de nuevo evitando repetir inmediatamente el último. La semilla y posición se guardan localmente; si el navegador impide guardarlas, el ciclo continúa durante la sesión. Cambiar tempo, figura o tonalidad no reinicia el patrón melódico.

No se promete enumerar toda la música posible: cada universo tiene límites explícitos. Escalas lineales: siete puntos de inicio y dirección; intervalos de unísono a octava; saltos: células de cuatro grados, con saltos de al menos tercera y más de una distancia, seguidas de una secuencia; arpegios: siete acordes diatónicos, todas sus inversiones y órdenes de notas; aproximaciones: todos los órdenes de los cuatro sonidos del acorde. Las figuras uniformes se completan con silencios hasta cerrar el compás.

La unidad 9 combina duraciones y silencios dentro de un compás completo según la categoría. La unidad 10 genera uno o dos compases según el material, con desplazamiento inicial y ligaduras cuando una nota cruza una barra. Son ejercicios acotados que pueden generarse indefinidamente mediante nuevos ciclos.

## Verificación

`node armonia-jazz/improvisation-engine.test.js`

`node armonia-jazz/notation.test.js`

`node armonia-jazz/nivel5-refuerzos.test.js`
