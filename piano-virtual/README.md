# Piano Virtual Pro 3.1 — versión modular

Esta carpeta parte de la versión 3.1 estabilizada y separa presentación, lógica y subsistemas sin cambiar el flujo funcional.

## Estructura

```text
piano-virtual-pro-modular/
├── index.html
├── piano-virtual-pro-standalone.html
├── css/
│   └── styles.css
├── js/
│   ├── core.js        # estado, selectores, persistencia y teclado virtual
│   ├── audio.js       # Web Audio, SoundFont, sustain y note on/off
│   ├── staff.js       # pentagrama y armadura
│   ├── midi.js        # Web MIDI, grabación, teclado físico y samples
│   ├── score.js       # PDF/MusicXML/imagen y controles de partitura
│   ├── tutor.js       # tutor MIDI, evaluación, loops y práctica
│   ├── web.js         # visor de páginas y cambios generales de UI
│   ├── metronome.js   # metrónomo y figura de pulso
│   ├── chords.js      # detector, spelling y análisis funcional
│   └── init.js        # autodiagnóstico e inicialización
└── tests/
    └── validate.js
```

## Importante

Los archivos JavaScript se cargan como scripts clásicos y comparten el mismo estado global, conservando el orden de ejecución de la versión standalone. Esto reduce el riesgo de regresiones al modularizar una app grande que originalmente estaba contenida en un IIFE. En una fase posterior se puede migrar gradualmente a ES Modules con `import`/`export` y un store explícito.

## Librerías externas

Se mantienen por CDN:
- soundfont-player 0.12.0
- opensheetmusicdisplay 1.8.4

## Validación

```bash
node tests/validate.js
node --check js/core.js
# repetir node --check para los demás archivos js/
```

`piano-virtual-pro-standalone.html` conserva la versión 3.1 original en un único archivo para distribución rápida.

## Ajustes de interfaz posteriores

- El metrónomo se movió al header, inmediatamente a la derecha del visualizador de acordes en escritorio.
- El estado MIDI y el selector de entradas MIDI ahora son un solo control: rojo/verde según conexión y desplegable al hacer clic.
- Velocity se convirtió en un control compacto con el mismo lenguaje visual de los indicadores.
- Panic usa el mismo tamaño, borde, radio e iconografía que el resto de indicadores.
- La versión standalone fue regenerada desde la versión modular actualizada.

## Corrección de spelling enharmónico en el pentagrama

- Las notas del pentagrama ya no se escriben siempre con sostenidos por depender del número MIDI.
- El spelling usa el acorde detectado como contexto: por ejemplo, **Cm = C–Eb–G / Do–Mib–Sol**, y Mib se coloca en la posición diatónica de Mi con bemol.
- Para intervalos ambiguos se respeta la función escrita del acorde cuando es posible (`#9`, `b5`, `#11`, `b13`).
- Si no hay suficiente contexto armónico, se usa la armadura seleccionada como criterio de sostenidos/bemoles.

- Corrección de notación: las alteraciones (♯/♭) se dibujan únicamente fuera de la cabeza; dentro aparece solo el nombre base de la nota.


## Ajustes de notación e idioma

- Los accidentales individuales del pentagrama (♯/♭) se muestran con mayor tamaño para mantener una proporción visual coherente con las cabezas de nota y la armadura.
- El selector **Tonalidad** sigue el idioma de nombres de nota: en español muestra `Do, Re♭, Re...`; en inglés muestra `C, Db, D, Eb...`.
