# Segunda auditoría: otras aplicaciones

Fecha: 20 de septiembre de 2026. Código base: `7003258`.

**Estado actualizado (25 de septiembre): los nueve hallazgos tienen correcciones y pruebas de regresión. Véase [verificación de correcciones](2026-09-25-correcciones.md). Los casos y resultados siguientes documentan la versión original auditada.**

**Resultado original: 9 hallazgos funcionales confirmados por pruebas focalizadas o errores de navegador. No se modificó el código de estas aplicaciones.** La revisión no certifica que cada función sea correcta: incluye inventario de las 16 apps, carga en navegador, dependencias iniciales, scripts incrustados, pruebas existentes y casos focalizados. Las funciones no ejercitadas se identifican al final.

## Hallazgos y prioridad

### 1. Alta — Los silencios pierden su duración en cinco lectores

**Apps:** Piano Virtual, Diapasón Virtual, Bajo Virtual, Folk Virtual y Cuerdas Frotadas.

**Caso:** un paso que contiene un silencio de redonda a 120 BPM debe durar 2 segundos. Los cinco lectores devuelven **0,25 segundos**. Descartan el silencio antes de calcular la duración y usan un valor fijo de medio pulso. También queda comprometida la sincronización del cursor y del tutor.

**Evidencia:** prueba de las funciones de producción con una entrada OSMD de silencio. Archivos: [Piano](../piano-virtual/js/tutor.js), función `triggerCurrentStepNotes`, línea 176; [Diapasón](../diapason-virtual/js/score.js), `getCurrentStepData`, 745; [Bajo](../bass-virtual/js/score.js), 768; [Folk](../folk-virtual/js/score.js), 750; [Cuerdas](../cuerdas-frotadas/js/app.js), 1892.

**Corrección propuesta:** separar la línea temporal de los ataques audibles y avanzar según la diferencia entre timestamps de eventos, respetando silencios y duraciones de voces independientes.

### 2. Alta — El lector del metrónomo alarga la polifonía

**Caso:** un compás de 4/4 con una redonda en una voz y cuatro negras en otra debe durar cuatro pulsos. El parser devuelve duraciones que suman **siete pulsos**, y el programador las consume en serie. A 120 BPM el compás tarda 3,5 s en vez de 2 s.

**Evidencia:** reproducido en navegador con MusicXML sintético y el parser copiado directamente del código auditado. [Caso ejecutable](metronomo-polyphony-probe.html). [Código](../metronomo/index.html), `parseMusicXmlEvents`, 1273; `scheduleScoreEvent`, 1403.

**Corrección propuesta:** calcular tiempo hasta el siguiente inicio, no usar la duración máxima de las notas como separación de ataques. Mantener duraciones por nota aparte.

### 3. Alta — Entrenamiento Auditivo agenda antes de que termine de cargar el piano

**Caso:** comenzar una secuencia con muestras sin cargar y detenerla antes de finalizar la carga. Al resolver la carga se envían igualmente los dos ataques de la prueba. Sus tiempos ya están en el pasado, por lo que pueden coincidir al ejecutarse.

**Evidencia:** prueba con carga diferida y reloj simulado; **dos ataques después de Detener**, esperado cero. [Código](../ear-training/js/audio.js), `playNotes`, 101; `playSequence`, 123. `playSequence` tampoco espera a las promesas de `playNotes`.

**Corrección propuesta:** cargar antes de fijar el instante inicial; utilizar un identificador de reproducción invalidado al detener, cambiar ejercicio o instrumento. Revisar también la liberación de nodos futuros, que se programa respecto al momento de agendar y no a su inicio.

### 4. Media — Filtrar una mano cambia el tempo en Piano Virtual

**Caso:** paso de negra a 120 BPM perteneciente solo a la mano excluida. Debería conservar 0,5 s de tiempo aunque no suene. Devuelve **0,25 s** porque filtra las notas antes de calcular el tiempo del paso.

**Evidencia:** prueba focalizada de `triggerCurrentStepNotes` con el filtro desactivando esa nota. [Código](../piano-virtual/js/tutor.js), 176–205.

**Corrección propuesta:** aplicar el filtro solo al audio y al resaltado, nunca a la línea temporal.

### 5. Media — Piano Virtual vuelve a atacar una continuación ligada

**Caso:** la nota que continúa una ligadura de prolongación no debe generar otro `noteOn`. La ruta revisada genera **un ataque nuevo**. El código recorre todas las notas con altura y no distingue las continuaciones de ligadura.

**Evidencia:** prueba focalizada de la función de reproducción con una nota marcada como continuación; revisión del código en [tutor.js](../piano-virtual/js/tutor.js), 176–201. No se hizo una escucha física de todas las variantes de ligadura importadas.

**Corrección propuesta:** unir duración y estado de las notas ligadas, conservando voz y altura; cancelar correctamente los temporizadores al pausar y reiniciar.

### 6. Media — El afinador reconoce el armónico pero calcula cents contra la fundamental

**Caso:** frecuencia de 164,82 Hz, segundo armónico de Mi2 a 82,41 Hz. `closestStringIndex` selecciona correctamente Mi2, pero `handlePitch` compara 164,82 contra 82,41 y muestra **+1200 cents**, en vez de normalizar el armónico reconocido.

**Evidencia:** prueba numérica de selección y fórmula; [código](../afinador/index.html), 1332 y 1490. Que el detector entregue ese armónico depende del instrumento, micrófono y señal; no se afirma que ocurra con toda nota tocada.

**Corrección propuesta:** devolver también el armónico estimado y calcular el desvío contra esa referencia, con controles de estabilidad que eviten confundir octavas reales.

### 7. Media — Velocidad y Tono ignora el salto al hacer clic mientras reproduce

**Caso:** archivo de 10 s, reproducción en el segundo 1, clic al 80% de la onda. Se espera reiniciar en el segundo 8; reinicia en el **segundo 1**.

**Causa:** el manejador asigna el nuevo `currentTime` y después llama a `pausePlayback()`, cuyo `refreshCurrentTime()` sobrescribe el destino con la posición antigua.

**Evidencia:** ejecutado con el manejador original y reloj simulado. [Código](../speed/index.html), clic en la onda, 1602; `pausePlayback`, 1148.

**Corrección propuesta:** guardar el destino aparte y asignarlo después de pausar.

### 8. Media — Cuerdas Frotadas llama a una función de guardado inexistente

**Caso:** abrir la app. La consola informa `ReferenceError: saveSettings is not defined`. Cambiar BPM también llama a esa función. El registro de eventos de cambio de compás/pulso falla en la inicialización.

**Evidencia:** observado en navegador local. [Código](../cuerdas-frotadas/js/metronome.js), 18 y 21. La app dispone de `saveStringsPrefs`, no de la función invocada por ese módulo.

**Corrección propuesta:** conectar el metrónomo al mecanismo real de preferencias y comprobar su restauración. Esto no significa que toda la app o el botón de reproducción estén inutilizados.

### 9. Media — Historia del Jazz falla al inicializar un observador de navegación

**Caso:** abrir la app. `IntersectionObserver` rechaza `rootMargin: 'calc(-1 * var(--header-height)) 0px -68% 0px'`: solo admite longitudes en píxeles o porcentajes, no esa expresión CSS.

**Evidencia:** error real de navegador. [Código](../historia-del-jazz/index.html), 2964–2974. Falla este observador que actualiza el estilo activo y `aria-current`; otro observador anterior sigue existiendo, por lo que no se concluye que toda la navegación esté rota.

**Corrección propuesta:** calcular la altura y pasar un valor en píxeles; reconstruir el observador si cambia la cabecera.

## Cobertura por aplicación

| App | Verificado | Pendiente de verificar exhaustivamente |
| --- | --- | --- |
| Piano Virtual | Carga, dependencias, pruebas de banco de acordes; casos de silencios, filtro de manos y ligaduras | MIDI físico, pedal, evaluación del tutor, catálogo completo de MusicXML |
| Diapasón Virtual | Carga, validación, banco de ukelele, duración de silencios | Digitación y técnicas para cada instrumento, reproducción polifónica completa |
| Bajo Virtual | Carga, validación, duración de silencios | Digitaciones de 4/5 cuerdas, cambios de posición y MIDI |
| Folk Virtual | Carga, validación, duración de silencios | Afinaciones particulares, instrumentos dobles, todas las importaciones |
| Cuerdas Frotadas | Carga con error reproducido, pentagrama en vivo, validación, silencios | Micrófono, vibrato, afinación real, dobles cuerdas y seguimiento físico |
| Metrónomo | Carga, parser polifónico y revisión de programación temporal | Latencia física, toda subdivisión, loops y count-in con archivos reales |
| Afinador | Carga, fórmula de cents y selección ante armónico | Precisión con cada micrófono, ruido, registros extremos y ambigüedades |
| Entrenamiento Auditivo | Carga, generadores/intervalos existentes, carga diferida y detención | Escucha humana completa, todas las sesiones y persistencia en navegadores |
| Velocidad y Tono | Carga, revisión del motor y caso de salto temporal | Calidad perceptual del estiramiento, exportación de audio completa y loops extremos |
| Tabla de Frecuencias | Carga, dependencias y revisión de analizador/ejercicios | Micrófono/compartir pestaña, calibración, todos los ejercicios de EQ |
| Analizador Armónico (AAC) | Carga; ii–V–I Dm7–G7–Cmaj7 analizado como C mayor, dórico/mixolidio/jónico | Corpus completo, ambigüedad tonal, todas las propuestas de rearmonización, operaciones de biblioteca |
| ChordSync Pro | Carga, prueba de regresión del worker, 3 pruebas Python de pulso/compás | Servicio/modelos completos, precisión con repertorio real, exportaciones |
| Editor Crescendo | Carga correcta; motor activo de cambios de tempo y conversión inversa comprobado | Edición táctil/MIDI, cada símbolo, importación/exportación MusicXML y todas las voces/ligaduras |
| Generador de Bingo | Carga, creación de segunda página, revisión de rangos y unicidad por columna | Impresión física A4, gran volumen y todas las ediciones de pie/texto |
| Historia del Jazz | Carga, error del observador, revisión de navegación | Todo el contenido histórico, enlaces externos, lectura con tecnologías asistivas |
| Mi Crescendo | Pantalla inicial y dependencias locales | Operaciones autenticadas, roles y backend; no se accedió ni modificó información de alumnos |

## Pruebas y reproducibilidad

- **11 archivos de pruebas JavaScript existentes: pasan.** Cubren instrumentos virtuales, Entrenamiento Auditivo y worker de ChordSync.
- **3 pruebas Python de ChordSync: pasan.**
- **16 páginas principales:** sin dependencias locales iniciales ausentes tras resolver sus etiquetas `<base>`; scripts incrustados sin errores de sintaxis.
- Carga en navegador de las **16 apps**, con los errores de Cuerdas Frotadas e Historia del Jazz descritos arriba. La carga correcta no equivale a validar todas sus funciones.
- [Sondas de comportamiento](2026-09-20-otras-apps-probes.cjs): ejecutar `node auditorias/2026-09-20-otras-apps-probes.cjs`. Ahora ejecutan las aserciones de regresión sobre el código actual; los resultados anteriores se conservan en el JSON histórico.
- [Caso MusicXML polifónico](metronomo-polyphony-probe.html): abrir servido por HTTP. Contiene el parser de la versión auditada y un archivo sintético; no necesita archivos del usuario.
- [Resultados numéricos](2026-09-20-otras-apps-resultados.json).

**Orden recomendado:** corregir primero la línea temporal común de los lectores y la carga/cancelación auditiva; después el salto de audio, afinador y errores de interfaz. Añadir estos casos como pruebas de regresión antes de ampliar la revisión manual con hardware.
