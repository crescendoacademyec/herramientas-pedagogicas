// Datos sintetizados (no copiados literalmente) de:
// - Manual del Ingeniero de Mezclas, Capítulo 5 (ecualización)
// - Aprende a Utilizar tu Procesador Dinámico (compresión, de-esser, técnicas de mezcla)
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

const GOLDEN_RULES = [
  'Si suena turbio, corta un poco alrededor de 250 Hz.',
  'Si suena mal o "cuadrado", corta un poco alrededor de 500 Hz.',
  'Corta cuando busques que algo suene mejor (más limpio, más definido).',
  'Realza (boost) cuando busques que algo suene diferente o se distinga más.',
  'No se puede realzar algo que no existe: si falta la fundamental, subir EQ no la crea.',
];

const SIBILANCE_TABLE = [
  { tipo: 'Voz femenina aguda', rango: '7 – 10 kHz' },
  { tipo: 'Voz femenina media', rango: '6.5 – 8.5 kHz' },
  { tipo: 'Voz femenina grave', rango: '6 – 8 kHz' },
  { tipo: 'Voz masculina aguda', rango: '6.5 – 8.5 kHz' },
  { tipo: 'Voz masculina media', rango: '6 – 8 kHz' },
  { tipo: 'Voz masculina grave', rango: '5 – 7 kHz' },
];

const TECHNIQUES = {
  serie: {
    title: 'Compresión en serie',
    body: 'El compresor se inserta directamente en el canal y actúa sobre toda la señal de esa pista. Ideal para elementos individuales que necesitan consistencia: voz principal, bajo, o cualquier instrumento donde el control preciso de la dinámica es prioritario.',
    tips: [
      'Apunta a una reducción de 2–6 dB — más que eso suele aplastar la señal y quitarle naturalidad.',
      'Es la opción por defecto para pistas solistas o protagonistas de la mezcla.',
    ],
  },
  paralela: {
    title: 'Compresión paralela (New York Compression)',
    body: 'Se duplica la señal (por un bus o auxiliar): a la copia se le aplica compresión agresiva, mientras la señal original se mantiene limpia o casi sin comprimir. Luego se mezclan ambas, sumando el cuerpo de la señal comprimida sin perder los transitorios de la original.',
    tips: [
      'Muy útil en baterías, guitarras eléctricas o incluso el bus completo de la mezcla.',
      'Compresores FET (rápidos y agresivos) son una elección típica para la señal duplicada.',
      'Preserva el punch de los transitorios mientras añade peso y presencia de fondo.',
    ],
  },
};

const GLOSSARY = [
  { t: 'Attack (Ataque)', d: 'Tiempo que tarda un compresor o gate en empezar a actuar una vez que la señal supera el umbral.' },
  { t: 'Threshold (Umbral)', d: 'Nivel a partir del cual el procesador dinámico comienza a afectar la señal.' },
  { t: 'Ratio', d: 'Relación de reducción de ganancia aplicada por cada dB que excede el umbral. Ej: 4:1 deja pasar 1 dB por cada 4 que sobran.' },
  { t: 'Release', d: 'Tiempo que tarda el procesador en dejar de actuar una vez que la señal cae por debajo del umbral.' },
  { t: 'Knee (Rodilla)', d: 'Forma en que la compresión se aplica alrededor del umbral: "duro" (abrupto) o "suave" (gradual).' },
  { t: 'Makeup / Gain Reduction', d: 'Ganancia añadida tras comprimir para compensar los dB perdidos por la reducción de nivel.' },
  { t: 'Range (de Gate)', d: 'Cuánto se atenúa la señal cuando el gate está cerrado.' },
  { t: 'Hold', d: 'Tiempo que un gate permanece abierto después de que la señal cae por debajo del umbral, antes de iniciar el release.' },
  { t: 'Gate', d: 'Procesador que bloquea la señal por debajo de un umbral, usado para reducir bleed y ruido de fondo.' },
  { t: 'De-Esser', d: 'Compresor enfocado solo en una banda de frecuencia (típicamente 5–10 kHz) para controlar sibilancias vocales.' },
  { t: 'Compresión en Serie', d: 'El compresor procesa toda la señal de un canal de forma directa y uniforme.' },
  { t: 'Compresión Paralela', d: 'Se mezcla una copia muy comprimida con la señal original, sumando cuerpo sin perder transitorios.' },
  { t: 'Limiter', d: 'Compresor con ratio muy alto, usado para evitar que la señal sobrepase un techo y distorsione.' },
  { t: 'Transient (Transiente)', d: 'La parte inicial y más rápida de un sonido — el golpe o ataque, clave para la claridad y definición.' },
  { t: 'EQ (Ecualización)', d: 'Proceso de ajustar el balance de frecuencias de una señal: gráfico, paramétrico u otros tipos.' },
  { t: 'Bandas (de EQ)', d: 'Secciones de un ecualizador, cada una con su propia frecuencia central, ancho de banda (Q) y ganancia.' },
  { t: 'Q (Ancho de banda)', d: 'Determina qué tan ancho o angosto es el rango de frecuencias afectado por una banda de EQ.' },
  { t: 'Bus / Buss', d: 'Canal virtual o físico que agrupa varias señales para procesarlas juntas (ej. bus de batería).' },
  { t: 'Fader', d: 'Control deslizante que ajusta el nivel de una pista o canal en la consola o DAW.' },
  { t: 'Phase Cancellation', d: 'Pérdida o debilitamiento de frecuencias cuando dos señales similares se suman fuera de fase.' },
  { t: 'Room Acoustics', d: 'Cómo un espacio refleja, absorbe y difunde el sonido, afectando la grabación y la mezcla.' },
  { t: 'Normalization', d: 'Ajustar el nivel de una señal a un máximo predefinido sin alterar la relación entre sus partes.' },
  { t: 'Reverb', d: 'Efecto que simula el eco difuso de un espacio cerrado, dando profundidad y ambiente.' },
  { t: 'Delay', d: 'Efecto que repite la señal tras un tiempo definido, usado para eco, espacialidad o profundidad.' },
];

// ---------- Entrenamiento auditivo ----------
const EAR_OCTAVE_FREQS = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EAR_GAINS_DB = [3, 6, 9, 12];

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
    comp: {
      tipo: 'Óptico (tipo LA-2A) para suavidad musical, o FET si necesitas más control de picos.',
      ratio: '3:1 – 4:1',
      attack: 'Medio (evita cortar la transiente inicial de la palabra)',
      release: 'Medio (150–300 ms aprox.)',
      nota: 'Apunta a 3–6 dB de reducción en los picos más fuertes. Considera compresión en serie suave + un de-esser dedicado en la banda de sibilancia.',
    },
    deesser: true,
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
    comp: {
      tipo: 'Óptico o VCA suave.',
      ratio: '2:1 – 3:1',
      attack: 'Medio',
      release: 'Medio a largo',
      nota: 'La compresión sutil ayuda a nivelar entre pasajes suaves y acordes fuertes sin quitarle naturalidad al instrumento.',
    },
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
    comp: {
      tipo: 'Óptico suave.',
      ratio: '2:1 – 4:1',
      attack: 'Medio (deja pasar el rasgueo inicial)',
      release: 'Medio',
      nota: 'Usa compresión ligera solo para nivelar dinámica entre rasgueo y punteo; demasiada compresión aplana el carácter acústico.',
    },
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
    comp: {
      tipo: 'FET rápido — añade carácter y presencia.',
      ratio: '4:1 – 8:1',
      attack: 'Rápido',
      release: 'Rápido a medio',
      nota: 'En riffs muy dinámicos, una compresión más agresiva ayuda a mantener consistencia sin perder el ataque de la púa.',
    },
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
    comp: {
      tipo: 'Óptico o VCA — control preciso y consistente.',
      ratio: '4:1 – 6:1',
      attack: 'Medio (deja pasar el ataque de dedos/púa)',
      release: 'Medio',
      nota: 'El bajo suele necesitar compresión constante en serie para que quede parejo con el bombo en toda la canción.',
    },
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
    comp: {
      tipo: 'FET rápido y agresivo.',
      ratio: '4:1 – 10:1',
      attack: 'Rápido (controla el transiente) o lento (lo deja pasar y comprime la cola, según el punch que busques)',
      release: 'Rápido a medio',
      nota: 'Muy usado también en compresión paralela: una copia muy comprimida suma peso constante sin perder el golpe original.',
    },
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
    comp: {
      tipo: 'FET — rápido y con carácter.',
      ratio: '4:1 – 8:1',
      attack: 'Rápido a medio (deja pasar el transiente inicial del golpe)',
      release: 'Rápido (para recuperarse antes del siguiente golpe)',
      nota: 'Un release demasiado lento hace que el compresor siga actuando cuando llega el próximo golpe, aplastando la dinámica de la ejecución.',
    },
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
    comp: {
      tipo: 'FET.',
      ratio: '4:1 – 6:1',
      attack: 'Medio',
      release: 'Medio (usa el hold para no cortar la resonancia natural)',
      nota: 'Un release muy corto corta la cola del tom de forma antinatural; dale espacio para que decaiga.',
    },
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
    comp: {
      tipo: 'FET.',
      ratio: '4:1 – 6:1',
      attack: 'Medio',
      release: 'Medio',
      nota: 'Igual que en los toms: cuida el release para no cortar la resonancia grave característica.',
    },
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
    comp: {
      tipo: 'Ligera o ninguna — los platillos suelen perder brillo natural si se comprimen mucho.',
      ratio: '2:1 (si se usa)',
      attack: 'Rápido',
      release: 'Rápido',
      nota: 'Muchas veces basta con automatizar volumen en vez de comprimir.',
    },
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
    comp: {
      tipo: 'VCA en bus paralelo (compresión de bus tipo "New York").',
      ratio: '4:1 – 10:1 en el bus paralelo',
      attack: 'Medio a rápido',
      release: 'Medio a rápido',
      nota: 'Mezcla la versión comprimida con la original limpia para sumar aire y energía sin perder los transitorios de platillos.',
    },
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
    comp: {
      tipo: 'Vari-Mu u Óptico — cálido y musical.',
      ratio: '2:1 – 3:1',
      attack: 'Lento',
      release: 'Medio a largo',
      nota: 'Una compresión suave y lenta mantiene el carácter orgánico del arco sin aplastar el vibrato.',
    },
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
    comp: {
      tipo: 'FET o VCA.',
      ratio: '3:1 – 6:1',
      attack: 'Rápido a medio',
      release: 'Medio',
      nota: 'Los ataques fuertes de metales se benefician de un attack no demasiado rápido, para no perder el "punch" inicial.',
    },
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
    comp: {
      tipo: 'Suave, Óptico o VCA.',
      ratio: '2:1 – 3:1',
      attack: 'Medio',
      release: 'Medio',
      nota: 'Compresión ligera para nivelar entre acordes sostenidos y notas percutidas.',
    },
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
    comp: {
      tipo: 'FET.',
      ratio: '4:1 – 6:1',
      attack: 'Rápido',
      release: 'Rápido',
      nota: 'Ayuda a nivelar la diferencia entre golpes abiertos y cerrados sin perder el carácter percusivo.',
    },
  },
];
