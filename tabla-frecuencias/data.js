// Datos sintetizados (no copiados literalmente) de:
// - Manual del Ingeniero de Mezclas, Capítulo 5 (ecualización)
// - Aprende a Utilizar tu Procesador Dinámico (contexto general de mezcla)
// - Tabla de Frecuencias de referencia de estudio (notas de sesión)
// - Tabla de Sugerencias de Ecualización — Bunker Audio (bunker-audio.com)

const BANDS = [
  { id: 'sub',   label: 'Subgraves', low: 16,   high: 60 },
  { id: 'bajo',  label: 'Graves',    low: 60,   high: 250 },
  { id: 'mb',    label: 'Medios bajos', low: 250, high: 2000 },
  { id: 'ma',    label: 'Medios altos', low: 2000, high: 4000 },
  { id: 'pres',  label: 'Presencia', low: 4000, high: 6000 },
  { id: 'brillo',label: 'Brillo',    low: 6000, high: 16000 },
];

const INSTRUMENTS = [
  {
    id: 'voz', name: 'Voz', cat: 'voz',
    range: [80, 1100], harm: [1100, 12000],
    cuts: [
      { f: '7–10 kHz', r: 'Sibilancia excesiva en las "s" — considera un de-esser en vez de un corte fijo.' },
      { f: '2 kHz', r: 'Zona estridente o "shrill" si hay demasiada energía aquí.' },
      { f: '500 Hz', r: 'Nasalidad; cortar aquí ayuda a desenmascarar la voz del resto de la mezcla.' },
      { f: 'Por debajo de 80–100 Hz', r: 'Retumbo, pops de "p" y ruido de proximidad sin información útil.' },
    ],
    boosts: [
      { f: '10–15 kHz', r: 'Aire y sensación de cercanía sin agregar dureza.' },
      { f: '1.5–3 kHz', r: 'Presencia y definición para que la voz pase al frente de la mezcla.' },
      { f: '200–400 Hz', r: 'Cuerpo y calidez ("pectoral") sin caer en lo turbio.' },
    ],
    tip: 'Corta primero antes de realzar: reduce lo que sobra en 400–800 Hz para más claridad, y decide si necesitas "punto" (1–4 kHz) o "chispa" (5–10 kHz) según el resultado.',
  },
  {
    id: 'piano', name: 'Piano / Keys', cat: 'teclas',
    range: [80, 4600], harm: [4600, 12000],
    cuts: [
      { f: '1–2 kHz', r: 'Sonido metálico o "tinny" si se acumula demasiada energía.' },
      { f: '500–800 Hz', r: '"Honky": color nasal típico del piano si se pasa de la cuenta.' },
      { f: '300 Hz', r: 'Zona "boomy" que enturbia el cuerpo del instrumento.' },
    ],
    boosts: [
      { f: '5–6 kHz', r: 'Más presencia y brillo en el ataque de las teclas.' },
      { f: '80–200 Hz', r: 'Fondo y peso, incluyendo el golpe de martillo/pedal (~200 Hz).' },
      { f: '12 kHz', r: 'Sensación de aire y ambiente natural del instrumento.' },
    ],
    tip: 'El piano casi no tiene fundamental por encima de ~4.6 kHz, pero sí abundantes armónicos: ahí es donde se define si suena brillante o apagado.',
  },
  {
    id: 'guit-ac', name: 'Guitarra Acústica', cat: 'cuerdas',
    range: [80, 1000], harm: [1000, 12000],
    cuts: [
      { f: '2–3 kHz', r: 'Sonido "tinny" (hojalata) si hay exceso.' },
      { f: '300–600 Hz', r: 'Zona hueca/nasal ("hollow"); cortar aquí también le da paso a la voz.' },
      { f: 'Por debajo de 120 Hz', r: 'Nada útil aquí salvo cuerpo grave excesivo.' },
    ],
    boosts: [
      { f: '5 kHz en adelante', r: 'Brillo de las cuerdas de metal ("sparkle").' },
      { f: '125–240 Hz', r: 'Plenitud y cuerpo de la caja de resonancia.' },
      { f: '1–2 kHz', r: 'Ataque y definición del rasgueo/púa.' },
    ],
    tip: 'Si la guitarra hace un solo, evita tocar demasiado los 300–600 Hz para no perder cuerpo; si acompaña, ese recorte ayuda a que la voz respire.',
  },
  {
    id: 'guit-el', name: 'Guitarra Eléctrica', cat: 'cuerdas',
    range: [80, 1200], harm: [1200, 8000],
    cuts: [
      { f: '1–2 kHz', r: 'Zona estridente ("shrill") típica en stratocasters y pastillas brillantes.' },
      { f: 'Por debajo de 80 Hz', r: 'Solo enturbia, no aporta cuerpo real.' },
      { f: '500 Hz', r: 'Si acompaña a la voz, recorta aquí para dejarle espacio.' },
    ],
    boosts: [
      { f: '3–8 kHz', r: 'Presencia y definición del overdrive/distorsión.' },
      { f: '125 Hz', r: 'Peso y cuerpo grave del riff.' },
      { f: '1.5–2.5 kHz', r: 'Definición general del instrumento en la mezcla.' },
    ],
    tip: 'El "picking" (funk, reggae) suele vivir entre 1.5–3 kHz; para overdrives, la definición de la distorsión está entre 1.3–3 kHz.',
  },
  {
    id: 'bajo', name: 'Bajo Eléctrico', cat: 'cuerdas',
    range: [40, 1000], harm: [1000, 4000],
    cuts: [
      { f: '1 kHz', r: 'Sonido delgado ("thin") si predomina sobre el fondo.' },
      { f: '125 Hz', r: 'Zona "boomy"; también ligado a 240–400 Hz (barro).' },
    ],
    boosts: [
      { f: '600 Hz', r: '"Growl": carácter y gruñido, típico en bajos sin trastes.' },
      { f: '80 Hz y por debajo', r: 'Fondo y peso fundamental.' },
      { f: '400–800 Hz', r: 'Ataque de dedos o púa.' },
      { f: '2.5 kHz', r: '"Snap" — el chasquido del slap o el fret.' },
    ],
    tip: 'Prueba realzar el refuerzo tonal en 80–160 Hz (la octava de la fundamental) para dar peso sin acumular barro en 240–400 Hz.',
  },
  {
    id: 'kick', name: 'Bombo (Kick)', cat: 'percusion',
    range: [40, 5000], harm: [5000, 12000],
    cuts: [
      { f: '400 Hz', r: 'Zona "muddy" — el hueco típico del bombo mal ecualizado.' },
      { f: '240–400 Hz', r: 'Frecuencia "mud" general; recorta si hay más de un instrumento acumulando aquí.' },
      { f: 'Por debajo de 80 Hz', r: 'Corta si el bombo suena demasiado "boomy" o retumbante.' },
    ],
    boosts: [
      { f: '2–5 kHz', r: 'Ataque definido — el "click" de la maza en el parche.' },
      { f: '60–125 Hz', r: 'Fondo y peso fundamental.' },
      { f: '3–5 kHz', r: '"Punto" adicional si el golpe necesita más pegada.' },
    ],
    tip: 'Salvo en géneros como EDM, normalmente no hace falta refuerzo tonal (nota afinada) en el kick — el peso viene del fondo, no de un tono.',
  },
  {
    id: 'snare', name: 'Caja (Snare)', cat: 'percusion',
    range: [100, 8000], harm: [8000, 16000],
    cuts: [
      { f: '1 kHz', r: 'Puede sonar molesto ("annoying") si se acumula.' },
      { f: '~1 kHz (boing)', r: 'Resonancia de mala afinación del parche.' },
    ],
    boosts: [
      { f: '2 kHz', r: 'Nitidez ("crisp") y definición del golpe.' },
      { f: '150–240 Hz', r: 'Cuerpo y "grasa" del tambor.' },
      { f: '80 Hz', r: 'Profundidad añadida al golpe.' },
      { f: '6–8 kHz', r: '"Bordona" — el brillo metálico de la resonancia inferior.' },
      { f: '8–16 kHz', r: 'Chasquido y aire por arriba.' },
    ],
    tip: 'Para encontrar el "punto" del snare: sube ~5–6 dB en 2 kHz con un Q ancho, luego angosta el Q hasta aislar justo la parte que hace saltar el sonido.',
  },
  {
    id: 'toms', name: 'Toms', cat: 'percusion',
    range: [80, 5000], harm: [5000, 12000],
    cuts: [
      { f: '300 Hz', r: 'Zona "boomy" que opaca el tono del parche.' },
      { f: 'Por debajo de 80 Hz / arriba de 12 kHz', r: 'Corta los extremos que no aportan al cuerpo del tom.' },
    ],
    boosts: [
      { f: '2–5 kHz', r: 'Ataque — el "tick" del palo golpeando el parche.' },
      { f: '80–200 Hz', r: 'Fondo y tono grave del tambor.' },
      { f: '240–400 Hz', r: 'Tono fundamental del parche (define la afinación percibida).' },
    ],
    tip: 'Un truco de EQ tipo Pultec: realzar y atenuar la misma frecuencia crea una curva con forma de "zeta" que resulta útil para dar forma sin perder cuerpo.',
  },
  {
    id: 'tom-piso', name: 'Tom de Piso', cat: 'percusion',
    range: [60, 5000], harm: [5000, 10000],
    cuts: [
      { f: '240–400 Hz', r: 'Misma zona "mud" que el kick, ya que comparten rango similar.' },
    ],
    boosts: [
      { f: '60 Hz', r: 'Refuerzo de fondo grave (técnica tipo Pultec).' },
      { f: '4–6 kHz', r: 'Pegada y definición del golpe.' },
      { f: '3 kHz', r: 'El "tick" del palo, algo más agudo que en el kick.' },
    ],
    tip: 'Trabaja frecuencias parecidas al bombo, pero con el ataque ubicado un poco más arriba en el espectro.',
  },
  {
    id: 'hihat', name: 'Hi-Hat y Platillos', cat: 'percusion',
    range: [200, 16000], harm: [16000, 20000],
    cuts: [
      { f: '1 kHz', r: 'Puede sonar molesto si hay demasiada energía media.' },
    ],
    boosts: [
      { f: '7–8 kHz', r: '"Sizzle" — el crujido característico del platillo.' },
      { f: '8–12 kHz', r: 'Brillantez general.' },
      { f: '15 kHz', r: 'Sensación de aire por encima de todo.' },
      { f: '8–10 kHz', r: '"Chispa" adicional en el hi-hat.' },
    ],
    tip: 'El cuerpo metálico ("clang") de estos elementos vive alrededor de 200 Hz — mantenlo bajo control para no chocar con snare y toms.',
  },
  {
    id: 'overhead', name: 'Overheads / Rooms', cat: 'percusion',
    range: [100, 16000], harm: [16000, 20000],
    cuts: [
      { f: '~100–500 Hz', r: 'Filtra lo que ya aportan kick y snare por sus propios micrófonos.' },
      { f: 'Extremos superior e inferior', r: 'Recorta lo que esté fuera de la señal útil de platillos y ambiente.' },
    ],
    boosts: [],
    tip: 'Regla general: a los overheads y rooms normalmente se les quita, no se les añade. Súbelos de volumen hasta que empiecen a aportar aire, y elimina lo que enmascare a otros instrumentos.',
  },
  {
    id: 'cuerdas', name: 'Cuerdas Frotadas', cat: 'cuerdas',
    range: [65, 4000], harm: [4000, 15000],
    cuts: [
      { f: '3 kHz', r: 'Puede sonar estridente en secciones grandes.' },
      { f: '600 Hz', r: 'Zona hueca ("hollow") si predomina.' },
      { f: 'Por debajo de 120–200 Hz', r: 'Turbiedad si se acumula con otros graves.' },
    ],
    boosts: [
      { f: '2–5 kHz', r: 'Ataque nítido del frotado del arco.' },
      { f: '400–600 Hz', r: 'Sonido "lush" — pleno y envolvente en secciones de cuerdas.' },
      { f: '6 kHz', r: 'Brillo superior, con moderación (es el límite alto útil típico).' },
    ],
    tip: 'El cuerpo del instrumento vive cerca de 700 Hz, y el "mordido" del arco sobre la cuerda aparece alrededor de 2 kHz.',
  },
  {
    id: 'metales', name: 'Viento-Metal (Metales)', cat: 'viento',
    range: [150, 5000], harm: [5000, 15000],
    cuts: [
      { f: '1 kHz', r: 'Color nasal ("honky") si hay exceso.' },
      { f: 'Por debajo de 120 Hz', r: 'Solo aporta barro, no fundamento real del instrumento.' },
    ],
    boosts: [
      { f: '2 kHz', r: 'Claridad general.' },
      { f: '8–12 kHz', r: 'Sensación de sonido grande y presente.' },
      { f: '5 kHz', r: 'Presencia y sibilancia natural del metal.' },
      { f: '10–15 kHz', r: 'Aire por encima de la fundamental.' },
    ],
    tip: 'La plenitud vive cerca de 120 Hz y el "estruendo" (cuerpo) alrededor de 240 Hz — con cuidado de no chocar con guitarras o teclados en esa zona.',
  },
  {
    id: 'organo', name: 'Órgano', cat: 'teclas',
    range: [30, 3000], harm: [3000, 8000],
    cuts: [
      { f: '300 Hz', r: 'Zona "boomy" si el registro grave se acumula.' },
    ],
    boosts: [
      { f: '80 Hz', r: 'Plenitud y fondo del registro grave.' },
      { f: '2–5 kHz', r: 'Presencia en el registro medio-agudo.' },
      { f: '6 kHz en adelante', r: 'Brillo, útil en sonidos tipo Rhodes o registros agudos (1–3 kHz también ayuda ahí).' },
    ],
    tip: 'En sonidos tipo Rhodes, lo "hermoso" del timbre suele estar entre 160–200 Hz, con un carácter medio ("mellow") cerca de 600 Hz.',
  },
  {
    id: 'congas', name: 'Congas / Percusión Menor', cat: 'percusion',
    range: [150, 8000], harm: [8000, 14000],
    cuts: [],
    boosts: [
      { f: '240 Hz', r: 'Plenitud del cuerpo del parche.' },
      { f: '7–10 kHz', r: 'Brillo rasgado característico del golpe.' },
      { f: '200 Hz', r: '"Ring" — resonancia natural del cuero.' },
      { f: '5 kHz', r: '"Slap" — el golpe abierto y percusivo.' },
    ],
    tip: 'Trata cada golpe (tono, slap, ring) como una franja de frecuencia distinta antes de decidir dónde intervenir.',
  },
];
