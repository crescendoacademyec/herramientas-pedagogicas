(function () {
  'use strict';

  const LEVELS = [
    { id: 1, title: 'Intervalos', short: 'Intervalos', instr: 'Escucha el intervalo y selecciona su nombre.' },
    { id: 2, title: 'Diccionario de Acordes', short: 'Acordes', instr: 'Escucha el acorde e identifica su tipo.' },
    { id: 3, title: 'Acordes Diatónicos', short: 'Grados diatónicos', instr: 'Compara el grado de referencia con el acorde objetivo.' },
    { id: 4, title: 'Dominantes Secundarios', short: 'Dominantes secundarios', instr: 'Identifica el dominante secundario por su resolución.' },
    { id: 5, title: 'Disminuidos Secundarios', short: 'Disminuidos secundarios', instr: 'Identifica el disminuido secundario por su resolución.' },
    { id: 6, title: 'Sustitución Tritonal', short: 'Sustituto tritonal', instr: 'Distingue dominante secundario y sustituto tritonal.' },
    { id: 7, title: 'Cambios de Centro Tonal', short: 'Modulaciones', instr: 'Reconoce hacia dónde se desplazó el centro tonal.' },
    { id: 8, title: 'Acordes maj7 / 6 / 6/9', short: 'Sustitutos de Imaj7', instr: 'Distingue colores de tónica mayor.' }
  ];

  const PITCH_NAMES = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
  const SOLFEGE_NAMES = ['Do','Re♭','Re','Mi♭','Mi','Fa','Sol♭','Sol','La♭','La','Si♭','Si'];
  const MAJOR_SCALE = [0,2,4,5,7,9,11];

  const CORE_CHORDS = {
    MAJ7: [0,4,7,11], MIN7: [0,3,7,10], DOM7: [0,4,7,10], DIM7: [0,3,6,9],
    MIN7B5: [0,3,6,10], MAJ6: [0,4,7,9], MAJ69: [0,4,7,9,14]
  };

  // Banco transcrito de la imagen de referencia entregada por el usuario.
  // Cada id representa un color sonoro único: no hay alias duplicados como opciones distintas.
  const CHORD_BANK = [
    {id:'c5', symbol:'5', name:'Quinta / power chord', group:'Fundamentales', intervals:[0,7], aliases:['5']},
    {id:'cmaj', symbol:'', name:'Mayor', group:'Fundamentales', intervals:[0,4,7], aliases:['maj','M']},
    {id:'cmin', symbol:'m', name:'Menor', group:'Fundamentales', intervals:[0,3,7], aliases:['−','min']},
    {id:'caug', symbol:'+', name:'Aumentado', group:'Fundamentales', intervals:[0,4,8], aliases:['aug']},
    {id:'cdim', symbol:'°', name:'Disminuido', group:'Fundamentales', intervals:[0,3,6], aliases:['dim']},

    {id:'csus2', symbol:'sus2', name:'Sus2', group:'Suspensiones', intervals:[0,2,7], aliases:[]},
    {id:'csus4', symbol:'sus4', name:'Sus4', group:'Suspensiones', intervals:[0,5,7], aliases:[]},
    {id:'csus24', symbol:'sus2/4', name:'Sus2/4', group:'Suspensiones', intervals:[0,2,5,7], aliases:['sus2sus4']},

    {id:'cadd2', symbol:'add2', name:'Add2', group:'Notas añadidas', intervals:[0,2,4,7], aliases:[]},
    {id:'cmadd2', symbol:'m(add2)', name:'Menor add2', group:'Notas añadidas', intervals:[0,2,3,7], aliases:['−(add2)']},
    {id:'cadd4', symbol:'add4', name:'Add4', group:'Notas añadidas', intervals:[0,4,5,7], aliases:[]},
    {id:'cmadd4', symbol:'m(add4)', name:'Menor add4', group:'Notas añadidas', intervals:[0,3,5,7], aliases:['−(add4)']},
    {id:'cadd9', symbol:'add9', name:'Add9', group:'Notas añadidas', intervals:[0,4,7,14], aliases:[]},
    {id:'cmadd9', symbol:'m(add9)', name:'Menor add9', group:'Notas añadidas', intervals:[0,3,7,14], aliases:['−(add9)']},

    {id:'c6', symbol:'6', name:'Sexta mayor', group:'Sextas', intervals:[0,4,7,9], aliases:[]},
    {id:'cm6', symbol:'m6', name:'Menor sexta', group:'Sextas', intervals:[0,3,7,9], aliases:['−6']},
    {id:'c69', symbol:'6/9', name:'Seis nueve', group:'Sextas', intervals:[0,4,7,9,14], aliases:[]},
    {id:'cm69', symbol:'m6/9', name:'Menor seis nueve', group:'Sextas', intervals:[0,3,7,9,14], aliases:['−6/9']},

    {id:'cmaj7', symbol:'maj7', name:'Mayor séptima', group:'Séptimas', intervals:[0,4,7,11], aliases:['Δ7']},
    {id:'cmmaj7', symbol:'m(maj7)', name:'Menor con séptima mayor', group:'Séptimas', intervals:[0,3,7,11], aliases:['−(maj7)','mΔ7']},
    {id:'c7', symbol:'7', name:'Dominante séptima', group:'Séptimas', intervals:[0,4,7,10], aliases:[]},
    {id:'cm7', symbol:'m7', name:'Menor séptima', group:'Séptimas', intervals:[0,3,7,10], aliases:['−7','min7']},
    {id:'c7sus4', symbol:'7sus4', name:'Dominante sus4', group:'Séptimas', intervals:[0,5,7,10], aliases:[]},
    {id:'cm7add4', symbol:'m7add4', name:'Menor 7 add4', group:'Séptimas', intervals:[0,3,5,7,10], aliases:['−7add4']},
    {id:'cm7b5', symbol:'m7♭5', name:'Semidisminuido', group:'Séptimas', intervals:[0,3,6,10], aliases:['ø7','−7♭5']},
    {id:'cdim7', symbol:'°7', name:'Disminuido séptima', group:'Séptimas', intervals:[0,3,6,9], aliases:['dim7']},

    {id:'c7s5', symbol:'7♯5', name:'Dominante ♯5', group:'Séptimas alteradas', intervals:[0,4,8,10], aliases:['7+5']},
    {id:'c7b5', symbol:'7♭5', name:'Dominante ♭5', group:'Séptimas alteradas', intervals:[0,4,6,10], aliases:[]},
    {id:'cmaj7s5', symbol:'maj7♯5', name:'Mayor 7 ♯5', group:'Séptimas alteradas', intervals:[0,4,8,11], aliases:['Δ7♯5']},
    {id:'cmaj7b5', symbol:'maj7♭5', name:'Mayor 7 ♭5', group:'Séptimas alteradas', intervals:[0,4,6,11], aliases:['Δ7♭5']},
    {id:'c7s11', symbol:'7♯11', name:'Dominante ♯11', group:'Séptimas alteradas', intervals:[0,4,7,10,18], aliases:[]},
    {id:'cmaj7s11', symbol:'maj7♯11', name:'Mayor 7 ♯11', group:'Séptimas alteradas', intervals:[0,4,7,11,18], aliases:['Δ7♯11']},
    {id:'c7s9b5', symbol:'7(♯9♭5)', name:'Dominante ♯9 ♭5', group:'Séptimas alteradas', intervals:[0,4,6,10,15], aliases:[]},
    {id:'c7b9s5', symbol:'7(♭9♯5)', name:'Dominante ♭9 ♯5', group:'Séptimas alteradas', intervals:[0,4,8,10,13], aliases:[]},

    {id:'cmaj9', symbol:'maj9', name:'Mayor novena', group:'Novenas', intervals:[0,4,7,11,14], aliases:['Δ9']},
    {id:'c9', symbol:'9', name:'Dominante novena', group:'Novenas', intervals:[0,4,7,10,14], aliases:[]},
    {id:'c7b9', symbol:'7♭9', name:'Dominante ♭9', group:'Novenas', intervals:[0,4,7,10,13], aliases:[]},
    {id:'c7s9', symbol:'7♯9', name:'Dominante ♯9', group:'Novenas', intervals:[0,4,7,10,15], aliases:[]},
    {id:'cm9', symbol:'m9', name:'Menor novena', group:'Novenas', intervals:[0,3,7,10,14], aliases:['−9']},
    {id:'c9s5', symbol:'9♯5', name:'Novena ♯5', group:'Novenas', intervals:[0,4,8,10,14], aliases:[]},
    {id:'c9b5', symbol:'9♭5', name:'Novena ♭5', group:'Novenas', intervals:[0,4,6,10,14], aliases:[]},
    {id:'c9sus4', symbol:'9sus4', name:'Novena sus4', group:'Novenas', intervals:[0,5,7,10,14], aliases:[]},
    {id:'c9s11', symbol:'9♯11', name:'Novena ♯11', group:'Novenas', intervals:[0,4,7,10,14,18], aliases:[]},
    {id:'cmaj9s11', symbol:'maj9♯11', name:'Mayor 9 ♯11', group:'Novenas', intervals:[0,4,7,11,14,18], aliases:['Δ9♯11']},

    {id:'c11', symbol:'11', name:'Dominante once', group:'11 y 13', intervals:[0,4,7,10,14,17], aliases:[]},
    {id:'cm11', symbol:'m11', name:'Menor once', group:'11 y 13', intervals:[0,3,7,10,14,17], aliases:['−11']},
    {id:'c13', symbol:'13', name:'Dominante trece', group:'11 y 13', intervals:[0,4,7,10,14,17,21], aliases:[]},
    {id:'c13sus4', symbol:'13sus4', name:'Trece sus4', group:'11 y 13', intervals:[0,5,7,10,14,21], aliases:[]},
    {id:'cmaj13', symbol:'maj13', name:'Mayor trece', group:'11 y 13', intervals:[0,4,7,11,14,17,21], aliases:['Δ13']},
    {id:'c13b9', symbol:'13♭9', name:'Trece ♭9', group:'11 y 13', intervals:[0,4,7,10,13,17,21], aliases:[]},
    {id:'c13s9', symbol:'13♯9', name:'Trece ♯9', group:'11 y 13', intervals:[0,4,7,10,15,17,21], aliases:[]},
    {id:'c13s11', symbol:'13♯11', name:'Trece ♯11', group:'11 y 13', intervals:[0,4,7,10,14,18,21], aliases:[]}
  ];

  const DEGREE_LABELS = {
    0:'1', 1:'♭2', 2:'2', 3:'♭3', 4:'3', 5:'4', 6:'♭5', 7:'5', 8:'♯5',
    9:'6', 10:'♭7', 11:'7', 13:'♭9', 14:'9', 15:'♯9', 17:'11', 18:'♯11', 21:'13'
  };

  function formulaLabel(intervals) {
    return intervals.map(iv => DEGREE_LABELS[iv] ?? String(iv)).join('–');
  }

  const INTERVALS = [
    {semitones:0, name:'Unísono', short:'P1', example:'Do → Do', ascRefs:['Jingle Bells','Let It Be'], descRefs:['Jingle Bells','Let It Be']},
    {semitones:1, name:'2ª menor', short:'m2', example:'Do → Re♭', ascRefs:['Tema de Tiburón','White Christmas'], descRefs:['Für Elise','Fly Me to the Moon']},
    {semitones:2, name:'2ª mayor', short:'M2', example:'Do → Re', ascRefs:['Martinillo','Noche de Paz'], descRefs:['Yesterday','Mary Tenía un Corderito']},
    {semitones:3, name:'3ª menor', short:'m3', example:'Do → Mi♭', ascRefs:['Greensleeves','Georgia on My Mind'], descRefs:['Hey Jude','The Star-Spangled Banner']},
    {semitones:4, name:'3ª mayor', short:'M3', example:'Do → Mi', ascRefs:['Morning Has Broken','What a Wonderful World'], descRefs:['Summertime','Giant Steps']},
    {semitones:5, name:'4ª justa', short:'P4', example:'Do → Fa', ascRefs:['Amazing Grace','Love Me Tender'], descRefs:['Eine kleine Nachtmusik','All of Me']},
    {semitones:6, name:'Tritono · 4ª aumentada / 5ª disminuida', short:'A4/d5', example:'Do → Fa♯ / Sol♭', ascRefs:['Maria (West Side Story)','The Simpsons Theme'], descRefs:['Blue 7','YYZ']},
    {semitones:7, name:'5ª justa', short:'P5', example:'Do → Sol', ascRefs:['Scarborough Fair','Top Gun Anthem'], descRefs:['Minuet en Sol','Flintstones Theme']},
    {semitones:8, name:'6ª menor', short:'m6', example:'Do → La♭', ascRefs:['Go Down Moses','In My Life'], descRefs:['Chega de Saudade','Love Story Theme']},
    {semitones:9, name:'6ª mayor', short:'M6', example:'Do → La', ascRefs:['My Bonnie Lies over the Ocean','My Way'], descRefs:['Man in the Mirror','No Surprises']},
    {semitones:10, name:'7ª menor', short:'m7', example:'Do → Si♭', ascRefs:['Somewhere','Star Trek Theme'], descRefs:['Watermelon Man','Lady Jane']},
    {semitones:11, name:'7ª mayor', short:'M7', example:'Do → Si', ascRefs:['Take on Me','Don’t Know Why'], descRefs:['I Love You (Cole Porter)']},
    {semitones:12, name:'Octava justa', short:'P8', example:'Do → Do (octava)', ascRefs:['Over the Rainbow','Blue Bossa'], descRefs:['Willow Weep for Me','To Zanarkand']}
  ];

  const INTERVAL_PRESETS = {
    initial: {label:'Inicial', ids:[0,2,4,5,7,12]},
    intermediate: {label:'Intermedio', ids:[0,1,2,3,4,5,7,8,9,12]},
    complete: {label:'Completo', ids:INTERVALS.map(x=>x.semitones)}
  };

  const CHORD_PRESETS = {
    basic: {label:'Tríadas básicas', ids:['cmaj','cmin']},
    triads: {label:'Tríadas completas', ids:['cmaj','cmin','caug','cdim','csus2','csus4']},
    sevenths: {label:'Séptimas', ids:['cmaj7','cmmaj7','c7','cm7','cm7b5','cdim7','c7sus4']},
    extensions: {label:'Extensiones', ids:['cmaj9','c9','cm9','c11','cm11','c13','cmaj13','c69','cm69']},
    altered: {label:'Alterados', ids:['c7b9','c7s9','c7s5','c7b5','c7s11','c9s11','c13s11','c7s9b5','c7b9s5']},
    complete: {label:'Banco completo', ids:CHORD_BANK.map(x=>x.id)}
  };

  const LEVEL3_TRIAD_ROMAN = ['I','ii','iii','IV','V','vi','vii°'];
  const LEVEL3_TETRAD_ROMAN = ['Imaj7','iim7','iiim7','IVmaj7','V7','vim7','viiø7'];
  const LEVEL3_TRIAD_FORMULA = ['1–3–5','1–♭3–5','1–♭3–5','1–3–5','1–3–5','1–♭3–5','1–♭3–♭5'];
  const LEVEL3_TETRAD_FORMULA = ['1–3–5–7','1–♭3–5–♭7','1–♭3–5–♭7','1–3–5–7','1–3–5–♭7','1–♭3–5–♭7','1–♭3–♭5–♭7'];

  const MODULATIONS = [
    {iv:1,label:'2ª menor arriba',short:'+m2'}, {iv:-1,label:'2ª menor abajo',short:'−m2'},
    {iv:2,label:'2ª mayor arriba',short:'+M2'}, {iv:-2,label:'2ª mayor abajo',short:'−M2'},
    {iv:3,label:'3ª menor arriba',short:'+m3'}, {iv:-3,label:'3ª menor abajo',short:'−m3'},
    {iv:5,label:'4ª justa arriba',short:'+P4'}, {iv:-5,label:'4ª justa abajo',short:'−P4'}
  ];

  const LEARN_OVERVIEW = {
    3: [
      {title:'Tríadas diatónicas', desc:'I, ii, iii, IV, V, vi, vii° en tonalidad mayor. Entrena función, calidad y movimiento entre grados.'},
      {title:'Cuatríadas diatónicas', desc:'Imaj7, iim7, iiim7, IVmaj7, V7, vim7, viiø7. Escucha la referencia antes del objetivo.'}
    ],
    4: [
      {title:'Dominante secundario', desc:'Un acorde V7 que toniciza temporalmente un grado diatónico distinto de I. La resolución es la pista principal.'},
      {title:'Referencia tonal', desc:'Puedes usar nota, Imaj7 o una cadencia I–IV–V–I para establecer el centro tonal con distinta intensidad.'}
    ],
    5: [
      {title:'Disminuido secundario', desc:'El vii°7 secundario se ubica un semitono debajo del acorde objetivo y resuelve por conducción cromática.'},
      {title:'Escucha la resolución', desc:'No memorices solo el color del disminuido: identifica hacia qué grado tienden sus voces.'}
    ],
    6: [
      {title:'Sustitución tritonal', desc:'Un dominante puede sustituirse por otro cuya fundamental está a un tritono; comparten el tritono guía 3ª–7ª.'},
      {title:'Comparación funcional', desc:'Contrasta V7/x con subV7/x y presta atención al movimiento cromático hacia la resolución.'}
    ],
    7: [
      {title:'Cambio de centro tonal', desc:'Después de una referencia, una progresión ii–V–I establece una nueva tonalidad. Identifica la distancia entre centros.'},
      {title:'Nomenclatura normalizada', desc:'Los desplazamientos se expresan como 2ª menor/mayor, 3ª menor y 4ª justa, arriba o abajo.'}
    ],
    8: [
      {title:'Imaj7', desc:'Color de tónica con 7ª mayor: 1–3–5–7.'},
      {title:'I6', desc:'Sustituye la 7ª por la 6ª: 1–3–5–6.'},
      {title:'I6/9', desc:'Añade 9ª a la sonoridad de sexta: 1–3–5–6–9.'}
    ]
  };

  window.ETData = {
    LEVELS, PITCH_NAMES, SOLFEGE_NAMES, MAJOR_SCALE, CORE_CHORDS, CHORD_BANK, INTERVALS,
    INTERVAL_PRESETS, CHORD_PRESETS, LEVEL3_TRIAD_ROMAN, LEVEL3_TETRAD_ROMAN,
    LEVEL3_TRIAD_FORMULA, LEVEL3_TETRAD_FORMULA, MODULATIONS, LEARN_OVERVIEW,
    formulaLabel
  };
})();
