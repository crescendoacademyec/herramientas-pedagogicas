# Bass Virtual Pro · mejoras específicas de bajo

Esta versión parte de la revisión específica del Bajo Virtual y añade una capa de práctica instrumental propia del bajo.

## Nuevas funciones

- Ejercicio **Raíz · 5ª · 8ª** con ruta real sobre el diapasón.
- **Arpegio de una octava** basado en el acorde/arpegio seleccionado.
- **Pentatónica de una octava**; usa la pentatónica/blues seleccionada cuando corresponde y, si no, parte de la pentatónica mayor.
- **Desplazamiento horizontal** sobre una misma cuerda para trabajar continuidad y cambios de posición.
- Mano derecha: **i–m**, **m–i** y **púa ↓–↑**.
- Dirección: ascendente, descendente o sube y baja.
- La ruta de práctica muestra:
  - dedo de mano izquierda;
  - posición de la mano;
  - indicación de mano derecha;
  - trayectoria sobre el diapasón;
  - paso actual y progreso.
- El alumno puede tocar/clicar las posiciones en orden; la app valida cada paso y avanza solo cuando es correcto.
- Respeta afinación, 4/5 cuerdas, capo, orientación, registro/cuerdas y estrategia 1-2-4 / 1-2-3-4.
- Preferencias nuevas guardadas en `bassVirtual_settings_v1`.

## Archivos

- `index.html` — versión modular.
- `css/styles.css`
- `js/fretboard.js`
- `js/staff.js`
- `js/metronome.js`
- `js/score.js`
- `bass-virtual-standalone.html`
- `tests/validate.js`

## Validación

Ejecutar:

```bash
node tests/validate.js
node --check js/fretboard.js
node --check js/staff.js
node --check js/metronome.js
node --check js/score.js
```
