# Cuerdas Frotadas Pro — Auditoría final

Versión consolidada después de la auditoría integral de la aplicación.

## Incluye
- Violín, viola, violonchelo y contrabajo.
- Pentagrama con claves/registros adaptados por instrumento.
- Header Crescendo + metrónomo.
- PDF, imagen, web y MusicXML/MXL.
- Tutor MusicXML y análisis de frase.
- Práctica de arco.
- Entonación con micrófono y drones.
- Cambios de posición.
- Dobles cuerdas y afinación relativa.
- Vibrato y estabilidad.
- Escalas/arpegios digitados.
- Patrones técnicos.
- Precisión rítmica.
- Pointer Events y responsive.

## Lector avanzado v10
- Loop A–B.
- Repeticiones configurables.
- Incremento automático de BPM.
- Count-in 0/1/2 compases.
- Click del metrónomo sincronizable.
- Tempo, zoom, anterior/siguiente, play/pause/stop y clic sobre la partitura.

## Correcciones de auditoría
- Los módulos de escala/patrones ahora leen el BPM real del header.
- Persistencia ampliada a todos los controles relevantes.
- Migración automática desde `cuerdasFrotadas_settings_v9`.
- Nueva clave: `cuerdasFrotadas_settings_v10`.

Ver `AUDITORIA-FINAL.md` para el detalle.


## Mejora de interfaz compacta

Se añadieron secciones colapsables para reducir la altura visual de la app. Usa **Vista compacta** para dejar abiertos solo los módulos principales y **Expandir módulos** para volver a ver todo.


## Interfaz por pestañas

La interfaz avanzada ahora se organiza en cinco áreas: **Tutor**, **Técnica**, **Arco y ritmo**, **Entonación** y **Partituras**. El pentagrama y diapasón permanecen visibles sobre el espacio de trabajo. La pestaña activa se recuerda con `localStorage`.


## Corrección de overlays de dobles cuerdas

Las marcas **INF/SUP** del diapasón solo aparecen en la pestaña **Entonación** después de pulsar **Preparar intervalo**. Se ocultan automáticamente al cambiar de pestaña.


## Ajuste de notación en pentagrama

- Las notas del pentagrama se desplazaron más a la derecha para evitar que el accidental quede encima de la cabeza de la nota.
- Los sostenidos, bemoles y becuadros de las notas ahora son más grandes y legibles.
- Se añadieron armaduras de clave automáticas para escalas y modos tonales compatibles.


## Tonalidad, grafía y pentagrama

- Nuevo selector **Tonalidad** independiente: permite dibujar únicamente la armadura y seguir en modo exploración.
- Nuevo selector **Grafía**: Automática / preferir sostenidos / preferir bemoles.
- Orden visual corregido en el pentagrama: **clave → armadura → notas**.
- Accidentales de notas más grandes y separados de la cabeza.
- La pestaña **Partituras** ocupa ahora todo el espacio disponible de su panel.


## Panel principal en dos filas

En escritorio, los diez selectores principales ocupan la primera fila. **Rango del diapasón** inicia la segunda fila y comparte esa fila con limpiar ajustes/selección, el modo de exploración y los controles de volumen. En tablet y móvil el panel vuelve a distribuirse para mantener legibilidad.


## Ajuste fino del panel principal

- Se movió **Tonalidad** a la segunda fila para liberar espacio en la fila superior.
- Se redujo el ancho visual de **Modo exploración** para equilibrar el panel.
- Se forzó mejor lectura en **Posición técnica** y se evitó el solapamiento entre **Tonalidad**, **Grafía** y **Fundamental**.


## Panel principal · ajuste final de anchos

- La fila superior usa 9 columnas de ancho proporcional para evitar solapamientos entre **Grafía**, **Fundamental**, **Tipo de acorde** y **Escala / Modo**.
- **Tonalidad** queda compacta en la segunda fila.
- **Limpiar ajustes** y **Limpiar selección** usan botones más estrechos.
- **Modo exploración** tiene un ancho máximo menor para dejar más espacio a volumen y controles.


## Panel principal · ajuste v2

- Grafía más estrecha y Fundamental más ancha.
- Tonalidad más compacta.
- Acciones de la segunda fila alineadas hacia la derecha para aprovechar el espacio final del panel.
- Botones Limpiar ajustes / Limpiar selección reducidos.


## Panel principal · ajuste v3

La primera fila usa ahora anchos mínimos/máximos explícitos por control. **Grafía** y **Fundamental** son más compactos y todos los selectores quedan confinados a su celda para evitar solapamientos en Edge.
