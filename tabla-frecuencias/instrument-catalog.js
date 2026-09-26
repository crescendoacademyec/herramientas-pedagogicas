// Concert pitch, equal temperament, A4=440 Hz. See SOURCES.md for scope and decisions.
const FREQUENCY_SOURCES = {
  ortega: { label: 'Ortega Guitars · Afinación de requinto', url: 'https://ortegaguitars.com/en/wiki' },
  lp: { label: 'Latin Percussion · Instrumentos de percusión', url: 'https://www.lpmusic.com/percussion/' },
  lpBongos: { label: 'Latin Percussion · Bongós', url: 'https://www.lpmusic.com/drums/bongos/' },
  moog: { label: 'Moog · Manual Sub 37: osciladores, ruido y filtro', url: 'https://api.moogmusic.com/sites/default/files/2018-09/SUB_37_MANUAL_v1.1_0.pdf' },
  unsw: { label: 'UNSW · Espectro, armónicos y parciales', url: 'https://phys.unsw.edu.au/jw/sound.spectrum.html' },
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
  ['requinto','Requinto de guitarra · 12 trastes','cuerdas','A2','A5','plucked','ortega','Requinto latinoamericano de seis cuerdas, A2–D3–G3–C4–E4–A4; ventana hasta el traste 12. No corresponde al clarinete requinto ni a otras afinaciones regionales.'],
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

// Editorial listening windows, not manufacturer measurements or fixed pitches.
const PERCUSSION_ADDITIONS = [
  ['bongos','Bongós',150,6000,'Dos parches (macho y hembra): escucha tono abierto, golpe seco y dedos por separado.','lpBongos'],
  ['shaker','Shaker',1000,16000,'El relleno, la carcasa y el movimiento cambian la textura y el brillo.','lp'],
  ['cajon','Cajón',50,6000,'Distingue el golpe grave, el ataque de la tapa y la bordonera si existe.','lp'],
  ['pandereta','Pandereta',1000,16000,'Las sonajas aportan brillo; los modelos con parche también pueden aportar cuerpo grave fuera de esta ventana.','lp'],
  ['guiro','Güiro',500,12000,'La velocidad del raspado, el material y la presión cambian la articulación.','lp'],
  ['claves','Claves',500,10000,'Golpe breve de madera: escucha resonancia, ataque y reflexiones de sala.','lp'],
  ['maracas','Maracas',800,16000,'El tamaño, el material y las semillas modifican la textura; no tienen registro de notas fijo.','lp'],
  ['cencerro','Cencerro / cowbell',300,10000,'Resonancias metálicas inarmónicas; boca y cuerpo producen ataques distintos.','lp'],
  ['triangulo','Triángulo',1500,18000,'Parciales metálicos y caída prolongada; la varilla y el lugar del golpe cambian el sonido.','lp'],
];
for (const [id,name,low,high,note,source] of PERCUSSION_ADDITIONS) {
  INSTRUMENTS.push({id,name,cat:'percusion',detail:true,range:[low,high],realRange:[low,high],rangeKind:'window',
    rangeNote:'Ventana orientativa para empezar a escuchar cuerpo y ataque; no es una medición ni un límite del instrumento. '+note,
    harm:[low,20000],harmKind:'partials',harmNote:'Ventana de parciales y ataque hasta el límite de 20 kHz del gráfico. No implica energía uniforme ni una serie de armónicos enteros.',
    cuts:[{f:'Resonancias y aspereza',r:'Localiza la zona molesta en la grabación; atenúa solo si distrae o enmascara otros instrumentos.'}],
    boosts:[{f:'Articulación',r:'Revisa primero nivel y posición del micrófono. Si falta definición, prueba un realce suave y compara al mismo volumen.'}],
    tip:note+' Las cifras son una guía editorial de exploración; las fuentes documentan el instrumento, no estas bandas de EQ.',sources:[source,'berklee']});
}
INSTRUMENTS.push({id:'sintetizador',name:'Sintetizador',cat:'teclas',detail:true,range:[20,20000],realRange:[20,20000],rangeKind:'window',
  rangeNote:'Se muestra la ventana audible del gráfico, no la extensión de un teclado. El patch, los osciladores, el ruido y los filtros determinan el espectro; también puede haber contenido fuera de esta ventana.',
  harm:[20,20000],harmKind:'variable-spectrum',harmNote:'Espectro dependiente del patch: una senoide ideal no tiene armónicos superiores, otras formas sí; ruido, FM y modulación pueden añadir componentes no armónicos. La franja completa no significa energía en todas las frecuencias.',
  cuts:[{f:'Según el patch',r:'Comprueba subgraves, resonancia del filtro y acumulación con otros instrumentos antes de recortar.'}],
  boosts:[{f:'Según su función',r:'Decide si actúa como bajo, lead, pad o efecto; ajusta el propio sonido antes de aplicar EQ externa.'}],
  tip:'No existe una banda de fundamentales ni de armónicos única para todos los sintetizadores.',sources:['moog','berklee']});

// Display conventions, not measured upper limits of an instrument's spectrum.
// For tonal profiles, show the envelope of harmonics 2–16 across the register.
// For percussion, do not invent an integer harmonic series for inharmonic modes.
for (const instrument of INSTRUMENTS) {
  if (instrument.harmNote) {
    // Preserve explicitly described inharmonic and patch-dependent windows.
  } else if (instrument.detail) {
    const [low, high] = instrument.realRange;
    if (instrument.cat === 'percusion') {
      instrument.harm = [low, 20000];
      instrument.harmKind = 'partials';
      instrument.harmNote = 'Parciales y ataque: ventana de exploración desde la nota más grave hasta 20 kHz, no un espectro medido ni energía uniforme. Las láminas y membranas tienen modos propios que no siguen necesariamente múltiplos enteros. La maza, la nota y el tiempo desde el golpe cambian su presencia.';
    } else {
      instrument.harm = [Math.round(2 * low * 10) / 10, Math.min(20000, Math.round(16 * high * 10) / 10)];
      instrument.harmKind = 'harmonic-model';
      instrument.harmNote = 'Armónicos 2.º–16.º: envolvente calculada como n × fundamental para el registro de este instrumento, recortada a 20 kHz. Es una referencia didáctica, no un límite acústico ni una banda continua para una sola nota. Pueden existir armónicos superiores; su intensidad depende de nota, técnica y dinámica. Las cuerdas reales pueden presentar inarmonicidad.';
      if (instrument.id === 'clarinete') instrument.harmNote += ' En el registro grave del clarinete suelen destacar los impares; los pares no están necesariamente ausentes.';
    }
  } else {
    instrument.harmKind = instrument.cat === 'percusion' ? 'partials' : 'mix-reference';
    instrument.harmNote = 'Franja orientativa de mezcla para armónicos, parciales y ataque; no es una medición ni el límite del espectro. La intensidad depende de la nota, la técnica y la grabación.';
  }
  instrument.sources = [...new Set([...(instrument.sources || []), 'unsw'])];
}
