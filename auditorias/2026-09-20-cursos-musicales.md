# Auditoría de Armonía Jazz, Armonía Funcional y Teoría

## Alcance y evidencia

Revisión de los generadores, bancos de preguntas, grafías, intervalos, acordes, inversiones, progresiones, figuras, ligaduras y rutas de reproducción de los tres cursos y sus talleres compartidos. Se ejecutan todos los archivos `*.test.js` de los cuatro directorios. Las pruebas de audio simulan el reproductor y comprueban alturas, orden, simultaneidad, carga inicial y cancelación; no sustituyen una escucha humana de cada ejemplo.

Comprobación en navegador local: acceso a Jazz, controles de improvisación, selección de séptimas e inversiones, generación en seisillos y botones Escuchar/Detener. Sin errores de consola en ese recorrido. No se probó manualmente cada combinación de interfaz ni el sonido en dispositivos físicos.

## Correcciones

- Jazz: líneas melódicas, pentatónica blues y bebop secuenciales; progresiones mantienen la simultaneidad interna de cada acorde.
- Jazz: V7alt incorpora alteraciones; pedal mantiene la tónica grave; voz superior mantiene los objetivos anunciados; dominantes del ciclo por terceras mayores corregidos; ritmo armónico 2–2–4 respeta esas duraciones; tríadas dóricas y sus etiquetas coinciden al transponer.
- Jazz: generación aleatoria por ciclos, todas las inversiones diatónicas y permutaciones, intervalos hasta octava, saltos variados y figuras seleccionables. Ligaduras se escuchan sin reataque.
- Jazz: el laboratorio Baga carga una única instancia de piano, agenda cada acorde de la progresión y permite cancelar durante la carga; improvisación detiene voces y metrónomo al generar o cambiar de unidad e incorpora Detener.
- Funcional: secuencias, puente y construcción progresiva esperan al piano; las peticiones canceladas no suenan después de cargar. La construcción sigue siendo por bloques de acorde.
- Teoría: escalas y arpegios secuenciales, cancelación de secuencias y ejercicios rítmicos al sustituirlos. Durante la carga, las notas aisladas usan el sintetizador inmediato para no acumular ataques retrasados.
- Escalas de Funcional y Teoría: segundo control descendente en lugar de reproducir toda la escala simultáneamente.
- Taller compartido: grafía por grados explícitos en escalas pentatónicas, bebop, disminuidas y de tonos enteros. Antes se asignaba una letra nueva a cada nota incluso en escalas de seis u ocho sonidos, llegando a producir alteraciones incorrectas y una tónica final mal escrita.

## Comportamiento preservado

Acordes, inversiones, shells, tensiones y bloques de progresión: notas simultáneas. Escalas, arpegios y dictados: notas sucesivas. Intervalos armónicos y texturas polifónicas conservan simultaneidad cuando forma parte del ejercicio. Silencios consumen tiempo sin ataques; las ligaduras prolongan el sonido. Los bloques de planificación y escucha no se convierten en generadores.

## Límites

Los ciclos agotan el universo definido por cada generador, no todas las combinaciones musicales concebibles. La disponibilidad de muestras remotas depende de la conexión. Se requiere comprobación con altavoces y dispositivos reales para certificar calidad sonora, latencia y funcionamiento en todos los navegadores.
