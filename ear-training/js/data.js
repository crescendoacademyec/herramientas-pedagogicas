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
    { id: 8, title: 'Acordes maj7 / 6 / 6/9', short: 'Sustitutos de Imaj7', instr: 'Distingue colores de tónica mayor.' },
    { id: 9, title: 'Escalas', short: 'Escalas', instr: 'Escucha la escala e identifica su tipo. El pentagrama se muestra después de responder.' }
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
    {semitones:0, name:'Unísono', short:'P1', example:'Do → Do', ascRefs:["Gloria al Bravo Pueblo (Vicente Salias, 1810)","Jingle Bells (James Lord Pierpont, 1857)","Feliz Cumpleaños (Mildred Hill, 1893)","Let It Be (The Beatles, 1970)","Candle in the Wind (Elton John, 1973)"], descRefs:["Gloria al Bravo Pueblo (Vicente Salias, 1810)","Jingle Bells (James Lord Pierpont, 1857)","Feliz Cumpleaños (Mildred Hill, 1893)","Let It Be (The Beatles, 1970)","Candle in the Wind (Elton John, 1973)"]},
    {semitones:1, name:'2ª menor', short:'m2', example:'Do → Re♭', ascRefs:["¡Oh, gloria inmarcesible! (Oreste Sindici, 1887)","White Christmas (Irving Berlin, 1954)","A Hard Day's Night (The Beatles, 1964)","Tema de Tiburón (John Williams, 1975)","Isn't She Lovely (Stevie Wonder, 1976)"], descRefs:["Joy to the World (Isaac Watts, 1719)","Für Elise (Ludwig van Beethoven, 1810)","Fly Me to the Moon (Frank Sinatra, 1954)","All My Loving (The Beatles, 1963)","Fields of Gold (Sting, 1993)"]},
    {semitones:2, name:'2ª mayor', short:'M2', example:'Do → Re', ascRefs:["Martinillo (canción folk)","Himno Nacional Argentino (Blas Parera, 1813)","Noche de Paz (Franz Xaver Gruber, 1818)","Rodolfo el Reno (J. Marks, 1939)","La Patita (Cri-Cri, 1957)"], descRefs:["La Primera Navidad (canción folk)","Mary Tenía un Corderito (canción folk)","Eight Days a Week (The Beatles, 1964)","Yesterday (The Beatles, 1965)","Wonderwall (Oasis, 1995)"]},
    {semitones:3, name:'3ª menor', short:'m3', example:'Do → Mi♭', ascRefs:["Greensleeves (canción folk)","Antón Pirulero (canción folk)","Georgia on My Mind (Hoagy Carmichael, 1930)","What the World Needs Now (Burt Bacharach, 1965)","Axel F (Beverly Hills Cop, 1985)"], descRefs:["The Star-Spangled Banner (Francis Scott Key, 1814)","La Mañana (Edvard Grieg, 1875)","Frosty the Snowman (Walter Rollins, 1950)","Hey Jude (The Beatles, 1968)","They Don't Care About Us (Michael Jackson, 1996)"]},
    {semitones:4, name:'3ª mayor', short:'M3', example:'Do → Mi', ascRefs:["For He's a Jolly Good Fellow (canción folk)","Morning Has Broken (canción folk)","La Primavera (Antonio Vivaldi, 1721-25)","Himno Nacional Mexicano (Jaime Nunó, 1854)","What a Wonderful World (George Douglas, 1967)"], descRefs:["Swing Low, Sweet Chariot (canción folk)","Quinta Sinfonía (Ludwig van Beethoven, 1804)","Summertime (George Gershwin, 1935)","Giant Steps (John Coltrane, 1960)","Tears in Heaven (Eric Clapton, 1991)"]},
    {semitones:5, name:'4ª justa', short:'P4', example:'Do → Fa', ascRefs:["We Wish You a Merry Christmas (canción folk)","Amazing Grace (John Newton, 1773)","Someday My Prince Will Come (F. Churchill, 1937)","Love Me Tender (Elvis Presley, 1956)","Black or White (Michael Jackson, 1991)"], descRefs:["O Come, All Ye Faithful (John Wade, 1751)","Marcha Real (Espinosa de los Monteros, 1761)","Eine kleine Nachtmusik (W.A. Mozart, 1787)","I´ve Been Working on the Railroad (canción folk)","All of Me (Gerald Marks, 1931)"]},
    {semitones:6, name:'Tritono · 4ª aumentada / 5ª disminuida', short:'A4/d5', example:'Do → Fa♯ / Sol♭', ascRefs:["Maria – Coro (Leonard Bernstein, 1956)","The Simpsons Theme (Danny Elfman, 1989)","The Saint (Edwin Astley, 1997)"], descRefs:["Blue 7 (Sonny Rollins, 1956)","Turn Back, O Man (Godspell, 1971)","YYZ (Rush, 1981)","Even Flow (Pearl Jam, 1991)"]},
    {semitones:7, name:'5ª justa', short:'P5', example:'Do → Sol', ascRefs:["Scarborough Fair (canción folk)","Byssan Lull (canción folk)","Can't Help Falling in Love (Elvis Presley, 1961)","Perhaps Love (John Denver, 1981)","Top Gun Anthem (Harold Faltermeyer, 1986)"], descRefs:["Minuet en Sol (Christian Petzold, 1725)","The Way You Look Tonight (Dorothy Fields, 1936)","Have You Met Miss Jones? (Richard Rodgers, 1937)","Flintstones Theme (Hoyt Curtin, 1961)","Love Will Keep You Warm (Swan Lee, 2004)"]},
    {semitones:8, name:'6ª menor', short:'m6', example:'Do → La♭', ascRefs:["Go Down Moses (canción folk)","Vals en Do sostenido menor (Frédéric Chopin, 1847)","In My Life – introducción (The Beatles, 1965)","A Town with an Ocean View (Joe Hisaishi, 1989)","Close Every Door (Andrew Lloyd Webber, 1991)"], descRefs:["Forêts Paisibles (Jean-Philippe Rameau, 1735)","Chega de Saudade (Antônio Carlos Jobim, 1957)","Love Story Theme (Francis Lai, 1970)","You're Everything (Chick Corea, 1973)"]},
    {semitones:9, name:'6ª mayor', short:'M6', example:'Do → La', ascRefs:["My Bonnie Lies over the Ocean (canción folk)","Nocturno en Mi Mayor (Frédéric Chopin, 1830)","La Traviata: Brindisi (Giuseppe Verdi, 1853)","My Way (Frank Sinatra, 1969)","Only Love (Nana Mouskouri, 1985)"], descRefs:["Nobody Knows the Trouble I´ve Seen (canción folk)","A Weaver of Dreams (Nat King Cole, 1925)","The Music of the Night (Andrew Lloyd Webber, 1986)","Man in the Mirror – Coro (Michael Jackson, 1988)","No Surprises (Radiohead, 1997)"]},
    {semitones:10, name:'7ª menor', short:'m7', example:'Do → Si♭', ascRefs:["Maman les p'tits bateaux (canción folk)","Somewhere (Leonard Bernstein, 1957)","Theme from Star Trek (Alexander Courage, 1966)","The Winner Takes It All – Coro (ABBA, 1980)"], descRefs:["An American in Paris (George Gershwin, 1951)","Watermelon Man (Herbie Hancock, 1962)","Lady Jane – Coro (Rolling Stones, 1966)"]},
    {semitones:11, name:'7ª mayor', short:'M7', example:'Do → Si', ascRefs:["Fantasy Island Theme (John Ottman, 1977)","Take on Me – Coro (A-ha, 1984)","Popular (Nada Surf, 1996)","Don't Know Why (Norah Jones, 2002)"], descRefs:["I Love You (Cole Porter, 1944)"]},
    {semitones:12, name:'Octava justa', short:'P8', example:'Do → Do (octava)', ascRefs:["Singin' in the Rain (Nacio Herb Brown, 1929)","Over the Rainbow (Harold Arlen, 1939)","The Christmas Song (Robert Wells, 1945)","Blue Bossa (Kenny Dorham, 1963)","Ironic (Alanis Morissette, 1996)"], descRefs:["Willow Weep for Me (Ann Ronell, 1932)","Doogie Howser Theme (Mike Post, 1989)","Todos los Días un Poco (León Gieco, 1993)","To Zanarkand (Nobuo Uematsu, 2002)"]}
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

  function chordExample(id, clef='treble') {
    const chord=CHORD_BANK.find(c=>c.id===id);
    if(!chord) throw new Error('Acorde desconocido');
    clef=clef==='bass'?'bass':'treble';
    const root=clef==='treble'?60:(Math.max(...chord.intervals)>11?36:48);
    return {seq:[{notes:chord.intervals.map(iv=>root+iv),start:0,dur:2.4,vel:.82}],meta:{targetType:'chord',chordId:id,root:'C',clef}};
  }

  function intervalExample(semitones, direction='ascending') {
    const degrees=[0,1,1,2,2,3,3,4,5,5,6,6,7];
    const P=window.CrescendoPractice, root=P.rootNote('C',4);
    const sign=direction==='descending'?-1:1;
    const notes=[root,P.spell(root,sign*Number(semitones),sign*degrees[Number(semitones)])];
    const names=['Do','Re','Mi','Fa','Sol','La','Si'];
    const labels=notes.map(n=>names[((n.diatonic%7)+7)%7]+(n.alter>0?'♯'.repeat(n.alter):'♭'.repeat(-n.alter))+Math.floor(n.diatonic/7));
    return {notes,labels};
  }

  window.ETData = {
    LEVELS, PITCH_NAMES, SOLFEGE_NAMES, MAJOR_SCALE, CORE_CHORDS, CHORD_BANK, INTERVALS,
    INTERVAL_PRESETS, CHORD_PRESETS, LEVEL3_TRIAD_ROMAN, LEVEL3_TETRAD_ROMAN,
    LEVEL3_TRIAD_FORMULA, LEVEL3_TETRAD_FORMULA, MODULATIONS, LEARN_OVERVIEW,
    formulaLabel, intervalExample, chordExample
  };
})();
