// Concert pitch, equal temperament, A4=440 Hz. See SOURCES.md for scope and decisions.
const FREQUENCY_SOURCES = {
  adler: { label: 'Samuel Adler · The Study of Orchestration, cap. 3–4 (material de consulta)', note: 'Registros y afinación; edición PDF facilitada por el usuario.' },
  mac: { label: 'Macalester College · Registros y transposición', url: 'https://pressbooks.macalester.digital/multimodalmusicianship/chapter/instrument-transpositions-ranges/' },
  yale: { label: 'Yale University Library · Registros vocales', url: 'https://yalelibrary.atlassian.net/wiki/spaces/YMD/pages/202030334' },
  berklee: { label: 'Berklee Online · Criterios de ecualización', url: 'https://online.berklee.edu/takenote/what-is-eq-in-music-10-audio-equalization-tips/' },
  indiana: { label: 'Indiana University · Notas, MIDI y frecuencia', url: 'https://cmtext.indiana.edu/appendices/appendix_B.php' },
  cello: { label: 'VSL Academy · Violonchelo', url: 'https://www.vsl.co.at/academy/strings/cello' },
  clarinet: { label: 'VSL Academy · Clarinete', url: 'https://www.vsl.co.at/academy/woodwinds/clarinet' },
  horn: { label: 'VSL Academy · Trompa', url: 'https://www.vsl.co.at/academy/brass/horn-f' },
  trombone: { label: 'VSL Academy · Trombón tenor', url: 'https://www.vsl.co.at/academy/brass/tenor-trombone' },
  tuba: { label: 'VSL Academy · Tuba baja', url: 'https://www.vsl.co.at/academy/brass/bass-tuba' },
  harp: { label: 'VSL Academy · Arpa', url: 'https://www.vsl.co.at/academy/strings/harp' },
  timpani: { label: 'VSL Academy · Timbales orquestales', url: 'https://www.vsl.co.at/academy/percussion/timpani' },
  marimba: { label: 'Yamaha · Extensiones de la marimba', url: 'https://hub.yamaha.com/music-educators/instruments/perc/what-marimba-should-i-purchase/' },
  vibes: { label: 'Yamaha · Vibráfono', url: 'https://hub.yamaha.com/music-educators/instruments/perc/vibraphone-bars/' },
  clave: { label: 'The Metropolitan Museum of Art · Teclado histórico FF–f3', url: 'https://www.metmuseum.org/art/collection/search/503901' },
  uke: { label: 'Yamaha · Afinación del ukelele', url: 'https://jp.yamaha.com/files/download/other_assets/3/333423/yt220_en.pdf' },
  vocal: { label: 'Pro Vocal Mixing Reference Guide · pp. 2–5 (material de consulta)' },
  strings: { label: 'Sección de Cuerdas HTC · pp. 1–3 y 7 (material de consulta)' },
  eq: { label: 'Chapter 5 · Ecualización; Aprende a utilizar tu ecualizador (material de consulta)' },
};
function frequencyForNote(note) {
  const match = /^([A-G])(b|#)?(-?\d+)$/.exec(note);
  if (!match) throw new Error('Nota inválida: ' + note);
  const pc = {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
  return Math.round(440 * 2 ** (((Number(match[3]) + 1) * 12 + pc - 69) / 12) * 10) / 10;
}
// EQ guidance describes listening decisions, not measured spectra or mandatory presets.
const CATALOG_EQ = {
  bowed: { cuts:[{f:'200–400 Hz',r:'Si el conjunto pierde claridad, comprueba acumulaciones antes de reducir cuerpo.'},{f:'2–5 kHz',r:'Atenúa solo si el arco resulta áspero; conserva la articulación.'}], boosts:[{f:'Ataque del arco',r:'Busca la articulación en la grabación y realza suavemente solo si queda oculta.'}], tip:'El arco, la cuerda elegida, la dinámica y la distancia del micrófono cambian el espectro.' },
  wind: { cuts:[{f:'Resonancias',r:'Localiza notas que sobresalen; no elimines el carácter de la lengüeta o de la columna de aire.'}], boosts:[{f:'Articulación',r:'Si falta definición, revisa primero el balance con los demás instrumentos y después prueba un realce moderado.'}], tip:'La proyección cambia entre registros. Una posición de micrófono distinta puede resolver el problema sin EQ.' },
  brass: { cuts:[{f:'Medios y agudos',r:'Si los ataques resultan agresivos, reduce solo la zona problemática, preferiblemente de forma dinámica.'}], boosts:[{f:'Cuerpo',r:'Escucha las notas graves reales antes de reforzar o filtrar: trompa, trombón y tuba sí tienen fundamentales graves.'}], tip:'No apliques un filtro pasa-altos común a toda la familia de metales.' },
  vocal: { cuts:[{f:'Graves no musicales',r:'Ajusta el pasa-altos escuchando la nota más grave de la frase, sin adelgazar la voz.'},{f:'Sibilancia',r:'Localiza las consonantes molestas y usa de-esser solo cuando aparezcan; la banda no se deduce del tipo de voz.'}], boosts:[{f:'Inteligibilidad',r:'Comprueba primero el acompañamiento y la dicción. Evita aumentar también consonantes o ruido.'}], tip:'La clasificación vocal no determina una ecualización ni permite diagnosticar la voz de una persona.' },
  plucked: { cuts:[{f:'Resonancias de caja',r:'Reduce solo las resonancias que enmascaran notas vecinas; conserva la nota grave más baja.'}], boosts:[{f:'Ataque',r:'Un realce suave puede destacar la pulsación, pero también amplifica púa, uñas y ruido de dedos.'}], tip:'Escucha el ataque y la caída por separado; no confundir un parcial destacado con la fundamental.' },
  mallet: { cuts:[{f:'Resonancias',r:'Distingue las notas sostenidas del recinto antes de cortar. No elimines el tono principal del instrumento.'}], boosts:[{f:'Golpe de la maza',r:'La dureza de la maza y la toma modifican el ataque; prueba esas opciones antes de añadir agudos.'}], tip:'Los parciales de láminas y membranas no forman necesariamente una serie armónica exacta.' },
};
// id, name, family, lowest/highest sounding pitch, EQ family, range source, scope.
const INSTRUMENT_PROFILES = [
  ['violin','Violín','cuerdas','G3','E7','bowed','adler','Registro orquestal práctico; el solo y los armónicos pueden extenderlo.'],
  ['viola','Viola','cuerdas','C3','E6','bowed','adler','Referencia orquestal; posiciones y técnicas avanzadas amplían el extremo agudo.'],
  ['cello','Violonchelo (cello)','cuerdas','C2','A5','bowed','cello','Referencia de VSL; existen extensiones solistas y armónicos por encima.'],
  ['contrabajo','Contrabajo','cuerdas','E1','G3','bowed','mac','Cuatro cuerdas, registro orquestal orientativo. Extensión a C1 o quinta cuerda y técnicas solistas amplían el rango. Suena una octava bajo lo escrito.'],
  ['arpa','Arpa de pedales','cuerdas','Cb1','G#7','plucked','harp','Arpa de concierto; la afinación de los pedales modifica las notas disponibles.'],
  ['mandolina','Mandolina · 12 trastes','cuerdas','G3','E6','plucked','adler','Ventana de los primeros 12 trastes, con afinación G3–D4–A4–E5; instrumentos con más trastes llegan más arriba.'],
  ['ukelele','Ukelele · 12 trastes','cuerdas','C4','A5','plucked','uke','Afinación reentrante G4–C4–E4–A4 y 12 trastes. Low-G baja a G3; el barítono tiene otra afinación.'],
  ['flauta','Flauta travesera','viento','C4','C7','wind','mac','Referencia de flauta en Do. El pie de Si permite B3; hay extensiones agudas.'],
  ['piccolo','Piccolo','viento','D5','C8','wind','mac','Alturas sonoras: una octava por encima de la escritura.'],
  ['oboe','Oboe','viento','Bb3','G6','wind','mac','Referencia profesional; el extremo agudo depende de la técnica.'],
  ['corno-ingles','Corno inglés','viento','E3','C6','wind','mac','Instrumento en Fa: suena una quinta justa por debajo de la escritura.'],
  ['clarinete','Clarinete en Si♭','viento','D3','Bb6','wind','clarinet','Alturas sonoras; la referencia orquestal suele detenerse en G6.'],
  ['fagot','Fagot','viento','Bb1','Eb5','wind','mac','Registro orientativo; no incluye extensiones solistas superiores.'],
  ['saxo-soprano','Saxofón soprano','viento','Ab3','Eb6','wind','mac','Referencia escrita B♭3–F6, convertida a sonido real; no incluye llave de F♯ ni altissimo.'],
  ['saxo-alto','Saxofón alto','viento','Db3','Ab5','wind','mac','Referencia escrita B♭3–F6, convertida a sonido real; no incluye llave de F♯ ni altissimo.'],
  ['saxo-tenor','Saxofón tenor','viento','Ab2','Eb5','wind','mac','Referencia escrita B♭3–F6, convertida a sonido real; no incluye llave de F♯ ni altissimo.'],
  ['saxo-baritono','Saxofón barítono','viento','Db2','Ab4','wind','mac','Referencia sin llave de La grave: los modelos con esa llave llegan a C2. No incluye altissimo.'],
  ['trompeta','Trompeta en Si♭','viento','E3','Bb5','brass','mac','Referencia escrita F♯3–C6 convertida a sonido real. El registro sobreagudo no se incluye.'],
  ['trompa','Trompa en Fa','viento','B1','F5','brass','horn','Alturas sonoras de referencia; la escritura habitual está una quinta más alta.'],
  ['trombon','Trombón tenor','viento','E2','F5','brass','trombone','No incluye pedales E1–B♭1 ni la extensión grave con transpositor.'],
  ['tuba','Tuba baja','viento','D1','G4','brass','tuba','Referencia amplia; afinación, tamaño y capacidad del intérprete modifican los extremos.'],
  ['soprano','Soprano','voz','C4','A5','vocal','yale','Referencia de catalogación de Yale/New Harvard Dictionary; no es un límite fisiológico ni la extensión operística máxima.'],
  ['mezzo','Mezzosoprano','voz','A3','F5','vocal','yale','Referencia de catalogación; repertorio, tesitura e intérprete pueden ampliar este intervalo.'],
  ['contralto','Contralto','voz','F3','D5','vocal','yale','Referencia de catalogación; la tesitura cómoda no equivale al registro completo.'],
  ['tenor','Tenor','voz','B2','G4','vocal','yale','Referencia de catalogación en alturas sonoras, no límite máximo de una voz entrenada.'],
  ['baritono','Barítono','voz','G2','E4','vocal','yale','Referencia de catalogación; no clasifica una voz individual por sus notas extremas.'],
  ['bajo-vocal','Bajo vocal','voz','E2','C4','vocal','yale','Referencia de catalogación; no confundir con bajo eléctrico o contrabajo.'],
  ['marimba','Marimba · 5 octavas','percusion','C2','C7','mallet','marimba','Modelo de cinco octavas. Hay marimbas más pequeñas con otra nota grave.'],
  ['vibrafono','Vibráfono · 3 octavas','percusion','F3','F6','mallet','vibes','Modelo estándar de tres octavas; otros modelos amplían el registro.'],
  ['timbal-orquestal','Timbal orquestal grave','percusion','C2','C3','mallet','timpani','Un timbal grave grande, no el conjunto completo. La extensión útil depende del diámetro y la tensión del parche.'],
  ['clavecín','Clavecín · 5 octavas','teclas','F1','F6','plucked','clave','Ejemplo de teclado FF–f3 con registro de 8 pies; las extensiones históricas y los registros varían.'],
];
for (const [id,name,cat,low,high,eqFamily,source,note] of INSTRUMENT_PROFILES) {
  const eq = CATALOG_EQ[eqFamily], realRange = [frequencyForNote(low), frequencyForNote(high)];
  INSTRUMENTS.push({id,name,cat,detail:true,range:realRange,realRange,rangeKind:'register',registerOnly:true,
    noteRange:[low,high],rangeNote:`${low}–${high} (sonido real). ${note}`,
    cuts:eq.cuts.map(x=>({...x})),boosts:eq.boosts.map(x=>({...x})),tip:eq.tip,
    sources:[source, ...(eqFamily==='vocal'?['vocal']:eqFamily==='bowed'?['strings']:['eq'])],
  });
}
