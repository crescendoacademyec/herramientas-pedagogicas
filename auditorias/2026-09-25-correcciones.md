# Correcciones de la segunda auditoría

Fecha: 25 de septiembre de 2026. Base: `bd44dec`.

Los nueve hallazgos del informe anterior se corrigieron. Además se adaptó la barra de Piano Virtual a pantallas estrechas. Los resultados históricos de la auditoría original se conservan; no representan el estado actual.

| Hallazgo | Corrección y evidencia |
| --- | --- |
| Silencios en cinco lectores | Línea temporal independiente del audio. Diferencia entre inicios del iterador OSMD y final real del compás; silencio de redonda a 120 BPM = 2 s. Se actualizaron también las implementaciones incrustadas de Diapasón, Bajo y Folk. |
| Polifonía del metrónomo | Tiempos absolutos en negras, avance hasta el siguiente inicio, final del compás por la voz más larga y cambios de divisions. Una redonda con cuatro negras dura cuatro pulsos. Duraciones individuales separadas. |
| Carga y cancelación auditiva | Se cargan las muestras antes de fijar el reloj. Detener, cambiar de ejercicio, reproducir otra secuencia o cambiar instrumento invalida solicitudes anteriores. Los nodos futuros permanecen cancelables hasta terminar. Las cargas antiguas no reemplazan el instrumento actual. |
| Filtro de manos del piano | Se aplica solo al sonido y resaltado; una negra excluida conserva 0,5 s a 120 BPM. |
| Ligaduras del piano | Se sostiene la cadena de notas ligada reconocida por OSMD; una continuación no vuelve a atacar. Seleccionar una continuación inicia su duración restante. Pausar elimina temporizadores de liberación. |
| Armónicos del afinador | En modo automático se normaliza el armónico 2–4 próximo a su referencia (hasta 50 cents). Se mantiene preferencia por fundamentales, calibración A4, modo manual y vocal. |
| Salto en Velocidad y Tono | Se conserva el destino del clic antes de pausar y se asigna después; funciona también con zoom o en pausa. |
| Metrónomo de Cuerdas Frotadas | Se conecta a `saveStringsPrefs`; BPM, compás y figura se guardan y restauran. |
| Navegación en Historia del Jazz | Margen numérico válido y reconstrucción al cambiar la cabecera. Un único observador actualiza el estado activo y `aria-current`, considerando todas las tarjetas visibles. |
| Barra de Piano Virtual | Altura común de 38 px en escritorio y 44 px en móvil para controles izquierdos, Laboratorio y controles derechos. Filas flexibles, texto adaptable y desplegables sin recorte. |

## Verificación

- **62 aserciones de regresión pasan:** `node auditorias/playback-regression.test.cjs`. Incluyen audio frío, cancelación, cambio de instrumento, acordes simultáneos, secuencias, silencios, filtro de mano, ligaduras, transposición conservada, afinación y salto con zoom.
- **19 comprobaciones en navegador pasan:** [prueba del lector real](playback-regression.html), servida por HTTP. Usa el parser de producción extraído al ejecutar la prueba y OSMD 1.8.4 local. Comprueba polifonía, cambio de divisions, acordes, silencios, anacrusa, posición del cursor y ligaduras notadas con `tie` y `notations/tied`.
- **39 archivos de pruebas JavaScript existentes pasan.** Dos validadores de dependencias se actualizaron para resolver rutas de recursos con versión en la URL.
- Comprobación de sintaxis de **34 scripts modificados o incrustados**, sin errores; `git diff --check` limpio.
- Carga local de las nueve apps afectadas sin errores de aplicación observados en consola.
- Piano: medición de controles a **320, 390, 768 y 1280 px**; no desbordan la barra y mantienen alturas iguales. Apertura y cierre de Laboratorio comprobados; revisión visual a 768 px.
- Cuerdas: cambiar a **81 BPM, 3/4 y corchea**, recargar y comprobar restauración de los tres controles.
- Historia: navegar a **Bebop** y comprobar `aria-current="true"`, sin el error anterior del observador.

Las pruebas cubren estos cambios y sus regresiones relacionadas. No certifican toda variante de MusicXML ni sustituyen una prueba física de latencia, micrófono o MIDI. La prueba de ligaduras requiere que OSMD reconozca la ligadura; algunos MusicXML que solo incluyen la etiqueta sonora `tie` sin `notations/tied` no la exponen en OSMD 1.8.4.
