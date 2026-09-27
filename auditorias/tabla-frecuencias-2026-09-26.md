# Auditoría de Tabla de Frecuencias — 26 de septiembre de 2026

Base: commit `c2f273f`. Auditoría de lectura y pruebas; no se modificó la aplicación.

## Resultado

La tabla de referencia funciona en los recorridos comprobados, pero la aplicación
no está completamente validada para uso continuo. Hay fallos importantes en el
analizador y en la validez pedagógica de enmascaramiento. Las pruebas automáticas
actuales no cubren suficientemente cambios de fuente, permisos y calidad perceptual.

## Evidencia y alcance

- `node --test tabla-frecuencias/tests/*.test.cjs auditorias/playback-regression.test.cjs`: 13 pruebas aprobadas. Una incluye 62 aserciones de regresión de reproducción; otra recorre 66 combinaciones de ejercicio/respuesta/dificultad.
- Catálogo: 57 IDs únicos, todas las fichas con franjas y descripciones. Filtro Percusión: 19; regreso a Todos: 57.
- Navegador integrado: carga de dos WAV locales de prueba (440 y 880 Hz), apertura de vistas y filtros. Error del segundo archivo registrado en consola.
- Vista móvil de 390 px: tabla y procesamiento sin desbordamiento horizontal.
- Comprobación numérica de correlación de pistas del ejercicio de enmascaramiento.
- No se activó micrófono ni captura de pantalla. Sus hallazgos son de revisión del código, no pruebas con hardware.
- No se certificó Safari, Firefox, dispositivos móviles físicos, captura de audio de pestañas ni reproducción externa de YouTube/Spotify. La auditoría no es una medición de sonoridad perceptual ni calibración acústica.

## Fallos prioritarios

### P1 — El analizador falla al cargar un segundo archivo

**Reproducido.** Elegir `audit-440.wav` y después `audit-880.wav` produce:
`InvalidStateError: HTMLMediaElement already connected previously to a different MediaElementSourceNode`.

`analyzer.js:263–278` desconecta y elimina la referencia del nodo anterior, pero
vuelve a ejecutar `createMediaElementSource(audioEl)` para el mismo elemento.
La fuente del elemento debe crearse una vez y reutilizarse al cambiar `src`.
El error queda en consola, sin mensaje útil para el usuario.
Referencia API: https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode

Validación de la corrección: cargar tres archivos seguidos, alternar pausa/play
y volver a archivo después de micrófono/captura, sin recrear el nodo.

### P1 — Posible retorno del micrófono a los altavoces tras analizar un archivo

**Confirmado por trazado del código; no probado con micrófono.**
`analyzer.js:277` conecta el analizador a `audioCtx.destination`. Al cambiar al
micrófono, `disconnectSource()` desconecta solo la fuente de entrada; no elimina
esa salida. La nueva ruta queda micrófono → analizador → altavoces, aunque el
comentario del código afirma que no existe retorno. Puede producir eco o acople.

Separar monitorización y análisis, y gestionar explícitamente las conexiones de
salida para cada fuente. Probar primero con auriculares y señal controlada.

### P1 — Enmascaramiento: las dos partes son prácticamente la misma línea

**Confirmado numéricamente.** `processing-exercises.js:15` usa el mismo generador
con semillas separadas por 19. `processing-dsp.js:10–25` conserva la secuencia de
cuatro notas, ritmo y timbre; con muchas semillas tampoco cambia la transposición.

Semillas 1, 83 y 51000: correlación entre pistas de 0,9971–0,9972. Las versiones
con respuestas opuestas («bajó melodía» / «bajó acompañamiento»), tras igualar RMS,
tienen correlación de 0,9987–0,9988. La diferencia residual no ofrece dos partes
musicales claramente identificables. No basta con que los arrays sean distintos.
El laboratorio usa semillas separadas por 3 y comparte la misma debilidad.

Generar melodía y acompañamiento realmente distintos (notas, ritmo, registro o
timbre), mantenerlos estables dentro de A/B y validar su identificación a oído.

### P2 — «Una octava abajo» también cambia el tempo

**Confirmado en código.** `processing-lab.js:43` toma `backing[Math.floor(i/2)]`.
Esto reproduce a mitad de velocidad, duplica la duración de eventos y solo usa
la primera mitad del contenido. La comparación cambia registro y ritmo a la vez.

Resintetizar las notas a mitad de frecuencia conservando sus tiempos, o usar una
transposición que preserve la duración.

### P2 — Los ejercicios antiguos de EQ permiten usar el volumen como pista

**Confirmado en código.** `ear.js:324–330` y `ear.js:722–731` alternan referencia
y señal ecualizada con ganancias 1/0, sin compensación de nivel entre ellas.
El laboratorio nuevo sí iguala RMS; ruido rosa y boost/cut antiguos no.
Puede aprenderse «más fuerte/más suave» en vez del cambio de timbre buscado.

Ofrecer igualación aproximada y explicar su alcance; conservar un modo sin
igualación únicamente si ese es el objetivo del ejercicio.

### P2 — Permisos asíncronos pueden activar una captura después de salir

**Confirmado por flujo del código, pendiente de prueba con permisos reales.**
Los manejadores de `getUserMedia` y `getDisplayMedia` (`analyzer.js:297–434`)
continúan conectando el stream después del `await` sin verificar si el usuario
abandonó la vista o inició otra operación. El manejador de cambio de vista solo
puede detener streams ya existentes.

Usar un identificador de operación; si la solicitud quedó obsoleta, detener todas
las pistas del stream recién recibido en lugar de conectarlo.

### P2 — La comparación de instrumentos puede dar una conclusión demasiado fuerte

`app.js:322` presenta las franjas no superpuestas como señal de que no compiten.
Las franjas comparadas son registros o ventanas editoriales: armónicos, ataques,
niveles y arreglo pueden producir competencia fuera de ellas. El mensaje para
franjas superpuestas sí evita esa inferencia; el de no superposición también debe hacerlo.

## Limitaciones y mejoras pendientes

1. **Espectros más realistas.** Las 29 franjas tonales calculadas hasta el armónico
   16 y las ventanas de percusión son recursos didácticos, no espectros medidos.
   Ya se explica en las fichas; faltan ejemplos de grabaciones por nota, dinámica
   y técnica para enseñar distribución e intensidad, no solo extensión.
2. **Más diversidad musical.** El material sintético conserva una línea de cuatro
   notas y patrones rítmicos fijos. Cambiar semillas no produce por sí solo un
   catálogo amplio de ejercicios. El barajado agota respuestas, no combinaciones
   musicales; con dos respuestas, la segunda de cada pareja es predecible.
3. **Compresión por instrumento.** Solo 15 de las 57 fichas tienen orientación
   específica de compresión. Las otras 42 cuentan con EQ y notas, pero falta
   completar objetivos y ejemplos de dinámica sin inventar presets universales.
4. **Progreso unificado.** El entrenamiento nuevo guarda aciertos aparte del
   historial de sesiones antiguo. Falta un resumen común, exportación y controles
   de reinicio para las estadísticas nuevas.
5. **Accesibilidad del cursor.** La lectura puntual de Hz solo atiende movimiento
   de mouse/pen; ignora touch y no ofrece equivalente por teclado. Las barras sí
   se abren con Enter/Espacio. Falta lectura táctil y teclado sin bloquear scroll.
6. **Audio propio.** El laboratorio usa solo los primeros ocho segundos y convierte
   a mono. Es una limitación informada, pero falta elegir el fragmento y conservar
   estéreo; señales con fuerte oposición entre canales pueden cancelarse al sumar.
7. **Errores y recursos.** El analizador no trata explícitamente errores de formato
   del reproductor, silencia errores de `play()` y no revoca sus object URLs.
   La lectura de la meta de práctica (`ear.js:68`) no protege el acceso a almacenamiento
   como sí hacen otras lecturas. Faltan pruebas de errores y almacenamiento bloqueado.
8. **Medidores.** Son educativos: RMS no es LUFS, el techo es de muestras y no de
   true peak. Las etiquetas ya lo aclaran. No es necesario añadir mastering profesional
   para enseñar EQ, pero no debe anunciarse como medición certificada.

## Qué sí está comprobado

- Integridad del catálogo completo y franjas de los 57 instrumentos.
- Filtros por familia y regreso a Todos; diseño móvil en los dos paneles revisados.
- Cálculo logarítmico del cursor a distintos anchos, incluidos 75 y 80 Hz.
- Respuesta de EQ y pasa-altos, ratio y ataque del compresor, extremos del paralelo.
- Techo del limitador ante impulsos y sobrecarga, selectividad del de-esser,
  igualación RMS y ausencia de valores no finitos en las combinaciones probadas.
- La cobertura numérica no sustituye pruebas perceptuales ni integración de fuentes.

## Orden recomendado

1. Corregir el ciclo de fuentes del analizador, retorno y permisos pendientes.
2. Rehacer las dos pistas de enmascaramiento y la transposición sin alterar ritmo.
3. Igualar nivel en ejercicios antiguos y mejorar diversidad/validez perceptual.
4. Completar acceso táctil/teclado, progreso, tratamiento de errores y material de referencia.


## Resolución implementada

Los hallazgos anteriores describen el estado previo a esta corrección.

- Corregidos los siete fallos: fuente multimedia reutilizable, desconexión de
  salida al capturar, pistas de enmascaramiento independientes, transposición
  sin alterar ritmo, EQ antigua con RMS igualado, cancelación de permisos tardíos
  y mensaje de comparación sin inferir ausencia de competencia.
- Añadidos control de frecuencia por teclado/tacto, fragmento de audio elegible
  conservando estéreo, errores visibles, limpieza de recursos y tolerancia a
  almacenamiento bloqueado.
- Frases con ocho notas y duraciones variables; respuestas barajadas en bloques
  mayores para evitar alternancia forzada. No se promete agotar todas las
  combinaciones musicales posibles.
- Compresión en 57 fichas; progreso integrado en sesión, exportación JSON y
  reinicio de estadísticas por ejercicio.
- Se puede contrastar cada instrumento con una grabación propia. No se incorpora
  una biblioteca de grabaciones de terceros sin licencia; las bandas teóricas
  se mantienen identificadas como modelos.
- Mapas originales editables, con seis estilos y controles adaptables a móvil.

Validación: pruebas numéricas de DSP y regresión musical; ciclo de fuentes y
permisos tardíos con Web Audio simulado; almacenamiento bloqueado y nulo. En
navegador: cargas sucesivas, fragmento estéreo, reproducción A/B, progreso,
teclado del cursor y controles del mapa. Captura con micrófono real y compartir
pantalla no se validaron con hardware. RMS y pico de muestras siguen siendo
medidores educativos, no LUFS ni true peak certificado.

## Seguimiento: mapas de mezcla

Se detectó que la prioridad de la etiqueta seleccionada alteraba la colocación
de las demás etiquetas. No variaban paneo ni profundidad, pero el gráfico sugería
un cambio de posición. Corregido: asignación y orden de dibujo estables. Prueba en
navegador de 1.277 selecciones en los 184 escenarios sin variación de coordenadas.
Se amplió el catálogo, se añadieron alias de búsqueda y nombres de pistas en inglés.
