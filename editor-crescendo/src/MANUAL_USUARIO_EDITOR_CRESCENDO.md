# Manual de usuario — Editor Crescendo

Editor Crescendo es un espacio para escribir, revisar y reproducir ejercicios de notación musical. Los cambios se conservan localmente en el navegador hasta que el ejercicio se guarda en la biblioteca o se exporta.

## Primeros pasos

1. Abra **Archivo** y escriba un título y una descripción para el ejercicio.
2. Elija **Figuras** para seleccionar una duración.
3. Active **Editar** o pulse `Enter` para entrar en escritura.
4. Haga clic sobre el pentagrama o use el teclado MIDI virtual para introducir notas.
5. Pulse **Guardar** para añadir el ejercicio a la biblioteca local.

## Navegación y selección

El cursor muestra el compás y la subdivisión activos. Haga clic en una posición del pentagrama para moverlo. El modo **Selección** permite elegir notas, silencios, texto y marcas ya existentes.

- `Esc`: volver a selección.
- Flechas: mover la posición activa.
- `Cmd/Ctrl + Z`: deshacer.
- `Cmd/Ctrl + Shift + Z`: rehacer.
- `Supr` o `Retroceso`: borrar la selección.

## Escribir notas y silencios

En **Figuras** se elige la duración de entrada. El control **Grid** define la resolución del cursor para desplazamientos y clics.

- Use **Nota** para introducir alturas en el pentagrama o desde el teclado MIDI.
- Use **Silencio** para colocar silencios de la duración activa.
- El botón **Editar** alterna el modo de escritura.
- **Ligaduras** une dos posiciones contiguas.
- **Tuplets** permite crear tresillos y otras relaciones rítmicas.

### Teclado MIDI

El teclado situado debajo de la partitura permite escribir alturas sin un dispositivo externo. Active **Acorde** para capturar varias notas en la misma posición. El menú **MIDI** reúne las opciones de entrada y reconocimiento cuando el navegador autoriza el acceso a un dispositivo MIDI.

## Notación

Las paletas superiores añaden elementos a la posición actual o a la selección.

- **Compás**: cambia la métrica y estructura de los compases.
- **Tempo**: inserta indicaciones de tempo y configura la reproducción.
- **Claves**: cambia entre clave de sol, fa y otras disponibles.
- **Armadura**: aplica la tonalidad y las alteraciones correspondientes.
- **Articulaciones**: añade acentos, staccato, tenuto, fermatas y otros signos.
- **Dinámicas**: inserta niveles como `p`, `mf` o `f`.
- **Barras** y **Casillas**: crean repeticiones y finales alternativos.

## Texto y cifrado

Use el botón **Texto** para crear indicaciones editoriales sobre el pentagrama. Desde la barra de texto puede ajustar fuente, tamaño, color, justificación y contorno.

Use **Cifrado** para añadir símbolos armónicos. Los cifrados se anclan al compás o pulso activo y se pueden mover o editar posteriormente desde selección.

## Compases y reorganización

La paleta **Canvas** incluye operaciones estructurales para añadir, quitar u ocultar compases. **Reorganizar** ajusta el reparto de compases y sistemas para aprovechar el ancho disponible.

Al cambiar la métrica, revise las figuras ya escritas: una métrica nueva no modifica automáticamente la intención musical de cada entrada.

## Reproducción

Pulse **Reproducir** o la barra espaciadora para escuchar la partitura mediante la salida MIDI o el motor de audio disponible. El campo **BPM** controla la velocidad.

El modo **Jazz** ofrece opciones de interpretación y voicings para ejercicios armónicos. Detenga la reproducción con el mismo botón.

## Escenas y modos de ejercicio

Una escena guarda un punto de la partitura para recuperarlo más tarde.

1. Sitúe el cursor y la partitura en el estado que desea conservar.
2. Abra **Escenas** y pulse **Guardar escena**.
3. Seleccione una escena y pulse **Ir** para restaurarla.

El modo **Repaso** permite navegar libremente. El modo **Ejercicio** usa la secuencia de escenas para crear un recorrido guiado. Puede reescribir, ordenar o borrar escenas desde el mismo menú.

## Archivo, importación y exportación

Los ejercicios guardados viven en la biblioteca local del navegador. Desde **Archivo** puede cargar, eliminar, exportar e importar ejercicios.

- **Exportar** descarga una copia JSON de Editor Crescendo.
- **Importar** restaura una copia JSON compatible.
- **Exportar XML** genera un archivo MusicXML para abrir la partitura en otros programas de notación.

Para conservar su trabajo entre navegadores o dispositivos, exporte regularmente una copia antes de borrar los datos del navegador.

## Pantalla completa y atajos

Use **Pantalla** para ampliar el espacio de trabajo. Las paletas muestran sus atajos en los mensajes de ayuda de cada herramienta. Algunos de los más usados son:

- `Espacio`: reproducir o detener.
- `Enter`: entrar o salir de escritura.
- `Esc`: selección.
- `Cmd/Ctrl + Z`: deshacer.
- `Cmd/Ctrl + Shift + Z`: rehacer.

## Solución de problemas

Si una fuente musical, teclado MIDI o archivo no aparece correctamente, recargue la página con `Cmd/Ctrl + Shift + R`. Para la entrada MIDI, compruebe que el navegador haya concedido el permiso y que el dispositivo esté conectado antes de abrir el editor.

Los datos se guardan de forma local. Una ventana privada, borrar los datos del navegador o usar otro dispositivo puede ocultar la biblioteca anterior; utilice exportaciones JSON como copia de seguridad.
