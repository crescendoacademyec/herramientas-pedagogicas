# Editor Crescendo

Editor de partituras web estático. No requiere instalación ni proceso de compilación.

## Publicar en GitHub Pages

1. Sube todos los archivos de esta carpeta a la raíz de un repositorio.
2. En **Settings → Pages**, selecciona **Deploy from a branch**.
3. Elige la rama `main` y la carpeta `/(root)`.
4. Abre la URL que GitHub Pages proporcione.

Para probarlo localmente no abras `index.html` con doble clic. Inicia un servidor:

```bash
python3 -m http.server 4173
```

Luego visita `http://localhost:4173`.

## Funciones actuales

- Escritura de notas y silencios, duraciones, selección, borrado e historial.
- Claves de sol/fa, armaduras, métrica, repeticiones y compases dinámicos.
- Articulaciones, texto musical y cifrado armónico.
- Guardado local, importación/exportación JSON y MusicXML básico.
- Teclado virtual, reproducción con Web Audio y entrada Web MIDI cuando el navegador/dispositivo la permite.
- Escenas para guardar y restaurar puntos de trabajo.

Los archivos permanecen en el navegador salvo cuando se exportan manualmente. GitHub Pages no sincroniza ejercicios entre dispositivos.
