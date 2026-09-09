(function (global) {
  "use strict";

  var NOTES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
  var AUDIO = { context: null, bus: null, player: null, promise: null, failed: false, nodes: [], token: 0 };
  function esc(value) { return String(value).replace(/[&<>\"']/g, function (c) { return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]; }); }
  function chord(root, suffix) { return NOTES[((root % 12) + 12) % 12] + suffix; }
  function audioContext() {
    if (!AUDIO.context) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      AUDIO.context = new AC(); AUDIO.bus = AUDIO.context.createGain(); AUDIO.bus.gain.value = 1.55; AUDIO.bus.connect(AUDIO.context.destination);
    }
    if (AUDIO.context.state === "suspended") AUDIO.context.resume();
    return AUDIO.context;
  }
  function piano() {
    var ctx = audioContext();
    if (!ctx || AUDIO.failed) return Promise.resolve(null);
    if (AUDIO.player) return Promise.resolve(AUDIO.player);
    if (!global.Soundfont || !global.Soundfont.instrument) { AUDIO.failed = true; return Promise.resolve(null); }
    if (!AUDIO.promise) AUDIO.promise = global.Soundfont.instrument(ctx, "acoustic_grand_piano", { destination: AUDIO.bus }).then(function (p) { AUDIO.player = p; return p; }).catch(function () { AUDIO.failed = true; return null; });
    return AUDIO.promise;
  }
  function stopAudio() { AUDIO.token += 1; AUDIO.nodes.forEach(function (n) { try { n.stop(); } catch (e) {} }); AUDIO.nodes = []; }
  function fallback(midi, duration, delay, gain) {
    var ctx=audioContext(); if(!ctx)return; var osc=ctx.createOscillator(),vol=ctx.createGain(),now=ctx.currentTime+(delay||0); osc.type="triangle";osc.frequency.value=440*Math.pow(2,(midi-69)/12);vol.gain.setValueAtTime(.0001,now);vol.gain.exponentialRampToValueAtTime(gain||.12,now+.02);vol.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(vol);vol.connect(AUDIO.bus);osc.start(now);osc.stop(now+duration+.03);AUDIO.nodes.push(osc);
  }
  function playNotes(midis, options) {
    options=options||{}; if(options.stop!==false)stopAudio(); var duration=options.duration||.75,delay=options.delay||0,gain=options.gain||.62;
    piano().then(function(player){midis.forEach(function(midi){if(player){var node=player.play(midi,audioContext().currentTime+delay,{duration:duration,gain:gain});if(node)AUDIO.nodes.push(node);}else fallback(midi,duration,delay,Math.min(.18,gain));});});
  }
  function suffixIntervals(suffix) {
    if (/m7♭5|m7b5|ø/.test(suffix)) return [0,3,6,10];
    if (/dim|°/.test(suffix)) return [0,3,6,9];
    if (/m\(maj7\)/.test(suffix)) return [0,3,7,11];
    if (/m7/.test(suffix)) return [0,3,7,10];
    if (/maj7/.test(suffix)) return [0,4,7,11];
    if (/7/.test(suffix)) return [0,4,7,10];
    if (/m/.test(suffix)) return [0,3,7];
    return [0,4,7];
  }
  function tonicControl(root) {
    return '<label class="tv-select-label">Tonalidad <select class="tv-tonic">' + NOTES.map(function (n, i) { return '<option value="' + i + '"' + (i === root ? ' selected' : '') + '>' + n + '</option>'; }).join("") + "</select></label>";
  }
  function chart(steps, root, grades) {
    return '<div class="tv-chart">' + steps.map(function (s, i) {
      var label = grades ? s.degree : chord(root + s.offset, s.suffix || "");
      return '<div class="tv-step"><span class="tv-step-num">' + (i + 1) + '</span><strong>' + esc(label) + '</strong><small>' + esc(grades ? (s.role || "función") : s.degree) + '</small></div>';
    }).join('<span class="tv-arrow">→</span>') + '</div>';
  }
  function renderProgression(root, config) {
    var grades = false;
    function paint() {
      root.innerHTML = '<section class="theory-viz"><div class="tv-head"><div><span class="tv-kicker">Mapa armónico interactivo</span><h4>' + esc(config.title) + '</h4><p>' + esc(config.note) + '</p></div><div class="tv-controls">' + tonicControl(state.root) + '<button class="tv-toggle" type="button">' + (grades ? 'Ver acordes' : 'Solo grados') + '</button><button class="tv-play" type="button">▶ Escuchar</button></div></div>' + chart(config.steps, state.root, grades) + (config.footer ? '<p class="tv-footer">' + esc(config.footer) + '</p>' : '') + '</section>';
      root.querySelector('.tv-tonic').addEventListener('change', function (e) { state.root = Number(e.target.value); paint(); });
      root.querySelector('.tv-toggle').addEventListener('click', function () { grades = !grades; paint(); });
      root.querySelector('.tv-play').addEventListener('click', async function () { stopAudio(); var token=AUDIO.token; for(var i=0;i<config.steps.length;i++){if(token!==AUDIO.token)return;var s=config.steps[i],base=48+state.root+s.offset;playNotes(suffixIntervals(s.suffix||"").map(function(n){return base+n;}),{duration:.68,stop:false,gain:.5});await new Promise(function(resolve){setTimeout(resolve,720);});} });
    }
    var state = { root: 0 }; paint();
  }
  function renderTable(root, config) {
    var state = { root: 0 };
    function paint() {
      var rows = config.rows.map(function (r) {
        var example = r.example ? chord(state.root + (r.offset || 0), r.example) : r.value;
        return '<tr><th>' + esc(r.name) + '</th><td>' + esc(r.formula) + '</td><td>' + esc(example) + '</td><td>' + esc(r.use) + '</td></tr>';
      }).join('');
      root.innerHTML = '<section class="theory-viz"><div class="tv-head"><div><span class="tv-kicker">Guía visual</span><h4>' + esc(config.title) + '</h4><p>' + esc(config.note) + '</p></div><div class="tv-controls">' + tonicControl(state.root) + '</div></div><div class="tv-table-wrap"><table class="tv-table"><thead><tr><th>Recurso</th><th>Fórmula / relación</th><th>Ejemplo</th><th>Escucha / función</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
      root.querySelector('.tv-tonic').addEventListener('change', function (e) { state.root = Number(e.target.value); paint(); });
    }
    paint();
  }
  function renderForm(root, config) {
    var state = { root: 0, grades: false };
    function paint() {
      var bars = config.bars.map(function (s, i) {
        return '<div class="tv-form-bar"><small>' + (i + 1) + '</small><strong>' + esc(state.grades ? s.degree : chord(state.root + s.offset, s.suffix)) + '</strong><span>' + esc(s.label || s.degree) + '</span></div>';
      }).join('');
      root.innerHTML = '<section class="theory-viz"><div class="tv-head"><div><span class="tv-kicker">Forma y recorrido</span><h4>' + esc(config.title) + '</h4><p>' + esc(config.note) + '</p></div><div class="tv-controls">' + tonicControl(state.root) + '<button class="tv-toggle" type="button">' + (state.grades ? 'Ver acordes' : 'Solo grados') + '</button></div></div><div class="tv-form">' + bars + '</div><p class="tv-footer">Cada bloque representa un punto de apoyo formal; transpónlo para reconocer la estructura sin depender de una tonalidad.</p></section>';
      root.querySelector('.tv-tonic').addEventListener('change', function (e) { state.root = Number(e.target.value); paint(); });
      root.querySelector('.tv-toggle').addEventListener('click', function () { state.grades = !state.grades; paint(); });
    }
    paint();
  }
  function renderSequence(root, config) {
    var state={root:0};
    function paint(){
      var cells=config.notes.map(function(n,i){return '<div class="tv-note-step"><small>'+(i+1)+'</small><strong>'+esc(chord(state.root+n.offset,""))+'</strong><span>'+esc(n.label||n.degree||"")+'</span></div>';}).join('<span class="tv-arrow">→</span>');
      root.innerHTML='<section class="theory-viz"><div class="tv-head"><div><span class="tv-kicker">Laboratorio melódico</span><h4>'+esc(config.title)+'</h4><p>'+esc(config.note)+'</p></div><div class="tv-controls">'+tonicControl(state.root)+'<button class="tv-play" type="button">▶ Escuchar</button></div></div><div class="tv-note-line">'+cells+'</div><p class="tv-footer">'+esc(config.footer||"Canta primero y después escucha para comprobar.")+'</p></section>';
      root.querySelector('.tv-tonic').addEventListener('change',function(e){state.root=Number(e.target.value);paint();});
      root.querySelector('.tv-play').addEventListener('click',function(){playNotes(config.notes.map(function(n){return 60+state.root+n.offset;}),{duration:.36,gain:.7});});
    } paint();
  }

  var P = function (title, note, steps, footer) { return { type: "progression", title: title, note: note, steps: steps, footer: footer }; };
  var S = function (o, suffix, degree, role) { return { offset: o, suffix: suffix, degree: degree, role: role }; };
  var VISUALS = {
    symbols: { type: "table", title: "Cómo se lee un símbolo de acorde", note: "La fundamental nombra el centro; la calidad y las tensiones describen el color que debes buscar en guitarra o piano.", rows: [
      { name: "Mayor con 7ª", formula: "1–3–5–7", example: "maj7", use: "Tónica mayor" },
      { name: "Menor con 7ª", formula: "1–♭3–5–♭7", example: "m7", use: "Menor / preparación" },
      { name: "Dominante", formula: "1–3–5–♭7", example: "7", use: "Tensión funcional" },
      { name: "Semidisminuido", formula: "1–♭3–♭5–♭7", example: "m7♭5", use: "ii de menor" }
    ] },
    extensions: { type: "table", title: "Extensiones: color sin perder la función", note: "La 3ª y la 7ª sostienen la identidad; las tensiones añaden color según la familia del acorde.", rows: [
      { name: "Mayor", formula: "1–3–5–7 + 9, #11, 13", example: "maj9", use: "Tónica luminosa / lidio" },
      { name: "Menor", formula: "1–♭3–5–♭7 + 9, 11, 13", example: "m11", use: "Predominante / dórico" },
      { name: "Dominante", formula: "1–3–5–♭7 + alteraciones", example: "13", use: "Tensión hacia resolución" }
    ] },
    inversions: { type: "table", title: "Inversiones y bajos específicos", note: "La misma calidad cambia de dirección y registro cuando cambia la nota más grave.", rows: [
      { name: "Fundamental", formula: "1–3–5–7", example: "maj7", use: "Estabilidad" },
      { name: "1ª inversión", formula: "3–5–7–1", example: "maj7/3", use: "Bajo ascendente" },
      { name: "2ª inversión", formula: "5–7–1–3", example: "maj7/5", use: "Conexión interna" },
      { name: "3ª inversión", formula: "7–1–3–5", example: "maj7/7", use: "Máxima tensión de bajo" }
    ] },
    chordScale: { type: "table", title: "Relación acorde–escala", note: "Elige primero la función del acorde y después la escala que describe sus tensiones disponibles.", rows: [
      { name: "Imaj7", formula: "1–3–5–7", example: "maj7", use: "Jónico o lidio" },
      { name: "IIm7", formula: "1–♭3–5–♭7", example: "m7", use: "Dórico" },
      { name: "V7", formula: "1–3–5–♭7", example: "7", use: "Mixolidio / alterada" },
      { name: "VIIm7♭5", formula: "1–♭3–♭5–♭7", example: "m7♭5", use: "Locrio" }
    ] },
    functions: P("Tres funciones, una dirección", "Observa cómo la preparación se acumula antes de la resolución. Cambia de tonalidad o usa solo grados.", [S(0,"maj7","Imaj7","Tónica"),S(5,"maj7","IVmaj7","Subdominante"),S(7,"7","V7","Dominante"),S(0,"maj7","Imaj7","Resolución")]),
    secondary: P("Dominantes secundarios", "Cada dominante momentánea prepara un grado distinto del campo armónico.", [S(0,"maj7","Imaj7","Tónica"),S(9,"7","V7/ii","Dominante aplicada"),S(2,"m7","ii7","Objetivo"),S(7,"7","V7","Dominante principal"),S(0,"maj7","Imaj7","Resolución")]),
    tritone: P("Sustitución tritonal", "El sustituto comparte las notas guía de V7 y conserva la dirección hacia la tónica.", [S(1,"7","♭II7 (subV7)","Sustituto"),S(0,"maj7","Imaj7","Resolución"),S(7,"7","V7","Comparación"),S(0,"maj7","Imaj7","Resolución")], "En la práctica, compara 3ª y 7ª: son el núcleo de la conducción."),
    modes: { type: "table", title: "Modos: una escala, siete puntos de partida", note: "La nota característica es la que distingue el color del modo sobre la misma tónica modal.", rows: [
      { name: "Dórico", formula: "1 2 ♭3 4 5 6 ♭7", example: "m7", use: "6ª mayor" },
      { name: "Frigio", formula: "1 ♭2 ♭3 4 5 ♭6 ♭7", example: "m7", use: "♭2" },
      { name: "Lidio", formula: "1 2 3 #4 5 6 7", example: "maj7", use: "#11" },
      { name: "Mixolidio", formula: "1 2 3 4 5 6 ♭7", example: "7", use: "♭7" }
    ] },
    chain: P("ii–V encadenados", "Cada ii–V prepara el siguiente objetivo; la resolución puede ser temporal o definitiva.", [S(2,"m7","ii7","Preparación"),S(7,"7","V7","Tensión"),S(0,"maj7","Imaj7","Objetivo"),S(9,"m7","vi7","Puente"),S(2,"7","V7/V","Nuevo impulso")]),
    minorFields: { type: "table", title: "Dos campos menores para funciones distintas", note: "La menor armónica refuerza V7; la menor melódica aporta colores modernos y dominantes alterados.", rows: [
      { name: "Menor armónica", formula: "1 2 ♭3 4 5 ♭6 7", example: "m(maj7)", use: "V7(♭9) y resolución menor" },
      { name: "Menor melódica", formula: "1 2 ♭3 4 5 6 7", example: "m(maj7)", use: "Lidio dominante / alterada" },
      { name: "Alterada", formula: "1 ♭9 #9 3 ♭5 #5 ♭7", example: "7alt", use: "Dominante de máxima tensión" }
    ] },
    cadences: P("Cuatro tipos de cadencia", "Mismo material, diferente sensación de llegada. Lee primero los grados y luego transpón.", [S(2,"m7","ii7","Preparación"),S(7,"7","V7","Auténtica"),S(0,"maj7","Imaj7","Llegada"),S(5,"maj7","IVmaj7","Plagal"),S(0,"maj7","Imaj7","Amén")]),
    modalInterchange: P("Intercambio modal", "Toma un color de un modo paralelo y conserva una llegada clara al centro tonal.", [S(0,"maj7","Imaj7","Centro"),S(8,"maj7","♭VImaj7","Prestado"),S(5,"m7","ivm7","Prestado"),S(7,"7","V7","Dominante"),S(0,"maj7","Imaj7","Centro")]),
    dominantExt: P("Dominantes sustitutos y extendidos", "La tensión puede llegar por dominante aplicada, sustituto tritonal o dominante alterado.", [S(2,"m7","ii7","Preparación"),S(1,"7","subV7","Sustituto"),S(0,"maj7","Imaj7","Resolución"),S(7,"7alt","V7alt","Alternativa"),S(0,"maj7","Imaj7","Resolución")]),
    reharm: P("Rearmonización: conservar la melodía, cambiar el soporte", "Un mismo punto de llegada admite caminos diatónicos, secundarios y sustitutos.", [S(0,"maj7","Imaj7","Original"),S(9,"7","V7/ii","Aplicado"),S(2,"m7","ii7","Nuevo color"),S(1,"7","subV7","Cromatismo"),S(0,"maj7","Imaj7","Llegada")]),
    coltrane: P("Ciclo de Coltrane", "Los centros tonales se mueven por terceras mayores; los dominantes conectan cada nuevo centro.", [S(0,"maj7","Imaj7","Centro 1"),S(2,"7","V7/III","Conector"),S(4,"maj7","IIImaj7","Centro 2"),S(8,"7","V7/♭VI","Conector"),S(8,"maj7","♭VImaj7","Centro 3")]),
    constant: P("Constant structure", "Un mismo voicing se desplaza conservando su estructura interna; el bajo define el color global.", [S(0,"m7","Im7","Estructura"),S(2,"m7","IIm7","Desplazamiento"),S(4,"m7","IIIm7","Desplazamiento"),S(5,"m7","IVm7","Desplazamiento"),S(7,"m7","Vm7","Desplazamiento")]),
    modulation: P("Modulación por acorde pivote", "El acorde pivote pertenece a ambos campos y permite cambiar de centro sin corte brusco.", [S(0,"maj7","Imaj7","Centro A"),S(9,"m7","vi7 / ii de V","Pivote"),S(2,"7","V7 del nuevo centro","Dominante"),S(7,"maj7","Imaj7 nuevo","Centro B")]),
    pandiatonic: { type: "table", title: "Pandiatonicismo y no funcionalidad", note: "Aquí el interés está en el color del conjunto y el movimiento de las voces, no en una cadencia obligatoria.", rows: [
      { name: "Planos diatónicos", formula: "acordes de una escala", example: "maj7", use: "Color de campo" },
      { name: "Estructuras por cuartas", formula: "4ª / #4ª superpuestas", example: "sus4", use: "Ambigüedad modal" },
      { name: "Cluster diatónico", formula: "2ªs dentro de una escala", example: "add9", use: "Textura" }
    ] },
    contemporaryModes: { type: "table", title: "Escalas modales contemporáneas", note: "Selecciona la escala por el color de la tensión que quieres oír sobre el acorde.", rows: [
      { name: "Lidio dominante", formula: "1 2 3 #4 5 6 ♭7", example: "7#11", use: "Dominante brillante" },
      { name: "Alterada", formula: "1 ♭9 #9 3 ♭5 #5 ♭7", example: "7alt", use: "Dominante tenso" },
      { name: "Disminuida semitono-tono", formula: "1 ♭9 #9 3 #11 5 13 ♭7", example: "13♭9", use: "Dominante simétrico" }
    ] },
    pedal: P("Pedal de bajo", "El bajo permanece mientras las estructuras superiores cambian: escucha la tensión entre estabilidad y movimiento.", [S(0,"","Pedal: I","Bajo fijo"),S(5,"maj7","IV/I","Color superior"),S(2,"m7","ii/I","Color superior"),S(7,"7","V/I","Tensión"),S(0,"maj7","I","Liberación")]),
    negative: P("Armonía negativa", "Invierte las distancias alrededor de un eje: la dirección funcional cambia de espejo, no de centro auditivo.", [S(0,"maj7","Imaj7","Original"),S(5,"m7","ivm7","Espejo"),S(1,"7","♭II7","Espejo dominante"),S(0,"maj7","Imaj7","Centro")]),
    specialFunctions: { type: "table", title: "Acordes de función especial", note: "Algunos acordes tienen una función más clara que su etiqueta aislada: mira siempre su resolución.", rows: [
      { name: "Sus dominante", formula: "1–4–5–♭7", example: "7sus4", use: "Dominante suspendido" },
      { name: "Disminuido de paso", formula: "simétrico por 3ª menor", example: "dim7", use: "Conexión cromática" },
      { name: "Aumentado", formula: "1–3–#5", example: "+", use: "Dirección por semitono" }
    ] },
    compound: { type: "table", title: "Acordes compuestos", note: "Separa el bajo de la estructura superior: esa lectura aclara híbridos, poliacordes e inversiones complejas.", rows: [
      { name: "Slash chord", formula: "estructura / bajo", example: "maj7/3", use: "Bajo dirigido" },
      { name: "Híbrido", formula: "triada superior / bajo", example: "D/C", use: "Color dominante o sus" },
      { name: "Poliacorde", formula: "acorde superior + acorde bajo", example: "maj7", use: "Textura extendida" }
    ] },
    voiceLeading: P("Conducción de voces", "Las líneas cercanas importan más que el nombre aislado de cada acorde. Sigue las notas guía por semitono.", [S(2,"m7","ii7","7ª → 3ª"),S(7,"7","V7","Notas guía"),S(0,"maj7","Imaj7","Resolución"),S(9,"m7","vi7","Conexión"),S(2,"m7","ii7","Continuidad")])
  };
  VISUALS.harmonicRhythm=P("Un ii–V–I, dos ritmos armónicos","Compara la duración de cada función y observa cómo cambia el impulso.",[S(2,"m7","ii7","2 pulsos"),S(7,"7","V7","2 pulsos"),S(0,"maj7","Imaj7","4 pulsos")]);
  VISUALS.melodyHarmony={type:"table",title:"Una nota, varias funciones",note:"La misma altura adquiere otro significado según el acorde inferior.",rows:[{name:"Nota del acorde",formula:"C como 7ª de Dm7",value:"Dm7",use:"Estable en tiempo fuerte"},{name:"Tensión",formula:"C como 11 de Gm7",value:"Gm7",use:"Color disponible"},{name:"Aproximación",formula:"C → B sobre G7",value:"G7",use:"Resuelve por semitono"}]};
  VISUALS.melodicModes={type:"table",title:"Mapa completo de menor melódica",note:"Relaciona cada modo con la cualidad que produce.",rows:[{name:"I · menor melódica",formula:"1 2 ♭3 4 5 6 7",example:"m(maj7)",use:"Centro menor"},{name:"III · lidio aumentado",formula:"1 2 3 #4 #5 6 7",example:"maj7#5",use:"Mayor aumentado"},{name:"IV · lidio dominante",formula:"1 2 3 #4 5 6 ♭7",example:"7#11",use:"Dominante brillante"},{name:"VII · alterada",formula:"1 ♭9 #9 3 #11 ♭13 ♭7",example:"7alt",use:"Dominante alterado"}]};
  VISUALS.tonalCenters={type:"table",title:"Cuatro centros tonales",note:"Compara el tercer, sexto y séptimo grado de cada escala madre.",rows:[{name:"Mayor",formula:"1 2 3 4 5 6 7",value:"C mayor",use:"Tónica maj7"},{name:"Mayor armónica",formula:"1 2 3 4 5 ♭6 7",value:"C mayor armónica",use:"Mayor con ♭6"},{name:"Menor armónica",formula:"1 2 ♭3 4 5 ♭6 7",value:"C menor armónica",use:"V7 hacia i"},{name:"Menor melódica",formula:"1 2 ♭3 4 5 6 7",value:"C menor melódica",use:"Color moderno"}]};
  VISUALS.scaleSubstitution={type:"table",title:"Un dominante, cuatro colores",note:"La función permanece; las tensiones disponibles cambian.",rows:[{name:"Mixolidia",formula:"9, 11, 13",example:"7",use:"Dominante diatónico"},{name:"Lidia dominante",formula:"9, #11, 13",example:"7#11",use:"subV / color brillante"},{name:"Disminuida",formula:"♭9, #9, #11, 13",example:"13b9",use:"Dominante simétrico"},{name:"Alterada",formula:"♭9, #9, #11, ♭13",example:"7alt",use:"Máxima tensión"}]};
  VISUALS.melodyReharm={type:"table",title:"Armonizar una nota C",note:"Filtra cada posibilidad por función, registro y acorde siguiente.",rows:[{name:"Como fundamental",formula:"1",value:"Cmaj7",use:"Tónica"},{name:"Como séptima",formula:"♭7",value:"Dm7",use:"Preparación"},{name:"Como tercera",formula:"♭3",value:"Am7",use:"Tónica relativa"},{name:"Como tensión",formula:"11",value:"Gm7",use:"Color"}]};
  VISUALS.triadPairs={type:"sequence",title:"Triad pair dórico",note:"Alterna Dm y Em para obtener seis notas de D dórico.",notes:[{offset:0,label:"Dm"},{offset:3,label:"Dm"},{offset:7,label:"Dm"},{offset:2,label:"Em"},{offset:5,label:"Em"},{offset:9,label:"Em"}]};
  VISUALS.topVoiceOstinato=P("Voz superior y ostinato","La voz aguda permanece reconocible mientras cambian bajo y función.",[S(0,"maj7","Imaj7","Melodía: E"),S(9,"m7","vi7","Melodía: E"),S(2,"m7","ii7","Melodía: F"),S(7,"7","V7","Melodía: F")]);
  VISUALS.pentatonicLab={type:"sequence",title:"Pentatónica menor y blue note",note:"Escucha 1–♭3–4–♭5–5–♭7–1.",notes:[{offset:0,label:"1"},{offset:3,label:"♭3"},{offset:5,label:"4"},{offset:6,label:"♭5"},{offset:7,label:"5"},{offset:10,label:"♭7"},{offset:12,label:"1"}]};
  VISUALS.swingMap={type:"table",title:"Mapa de articulación jazz",note:"La sensación nace de duración, acento y colocación.",rows:[{name:"Swing",formula:"larga–corta flexible",value:"Corcheas",use:"Flujo"},{name:"Anticipación",formula:"antes del tiempo fuerte",value:"& de 4",use:"Impulso"},{name:"Retardo",formula:"después del punto esperado",value:"Behind",use:"Relajación"},{name:"Ghost note",formula:"ataque muy ligero",value:"(nota)",use:"Textura rítmica"}]};
  VISUALS.bebopLine={type:"sequence",title:"Aproximación bebop hacia la tercera",note:"La línea rodea E y resuelve en una nota estructural de Cmaj7.",notes:[{offset:7,label:"5"},{offset:5,label:"4"},{offset:3,label:"aprox."},{offset:4,label:"3 objetivo"},{offset:7,label:"5"},{offset:11,label:"7"},{offset:12,label:"1"}]};
  VISUALS.guideToneLine={type:"sequence",title:"Línea de notas guía sobre ii–V–I",note:"C–B–B y F–F–E describen la progresión con movimiento mínimo.",notes:[{offset:0,label:"7ª de ii"},{offset:-1,label:"3ª de V"},{offset:-1,label:"7ª de I"},{offset:5,label:"3ª de ii"},{offset:5,label:"7ª de V"},{offset:4,label:"3ª de I"}]};
  VISUALS.motiveLab={type:"sequence",title:"Motivo y secuencia",note:"Un contorno corto se repite desde otro grado.",notes:[{offset:0,label:"motivo"},{offset:2,label:"motivo"},{offset:4,label:"motivo"},{offset:2,label:"secuencia"},{offset:4,label:"secuencia"},{offset:5,label:"secuencia"}]};
  VISUALS.iiVImprovisation=P("Capas para improvisar ii–V–I","Escucha primero la función; después conecta notas guía y cromatismos.",[S(2,"m7","ii7","Preparación"),S(7,"7","V7","Tensión"),S(0,"maj7","Imaj7","Resolución"),S(9,"7","VI7","Turnaround")]);
  VISUALS.outsideLab={type:"sequence",title:"Inside → outside → resolución",note:"El desplazamiento cromático tiene sentido porque regresa a una nota objetivo.",notes:[{offset:0,label:"inside"},{offset:4,label:"inside"},{offset:7,label:"inside"},{offset:1,label:"outside"},{offset:5,label:"outside"},{offset:8,label:"outside"},{offset:7,label:"5 objetivo"},{offset:4,label:"3 objetivo"}]};
  VISUALS.earPath=P("Ruta auditiva de un standard","Canta y reconoce cada función antes de improvisar.",[S(0,"maj7","Imaj7","Centro"),S(2,"m7","ii7","Preparación"),S(7,"7","V7","Tensión"),S(0,"maj7","Imaj7","Resolución")],"Canta las fundamentales y después las terceras y séptimas.");
  VISUALS.leadSheet = { type: "form", title: "Lectura rápida de un lead sheet", note: "Cada caja representa un compás: el símbolo superior indica armonía; la letra organiza la forma y la melodía vive sobre esa cuadrícula.", bars: [S(0,"maj7","A · 1","Compás 1"),S(2,"m7","A · 2","Cambio"),S(7,"7","A · 3","Tensión"),S(0,"maj7","A · 4","Resolución"),S(5,"maj7","B · 1","Bridge"),S(7,"7","B · 2","Dirección"),S(0,"maj7","A · 1","Retorno"),S(7,"7","A · 2","Turnaround")] };
  VISUALS.aaba = { type: "form", title: "Forma AABA y rhythm changes", note: "La forma organiza la escucha: dos A afirman el material, B contrasta y A regresa.", bars: [S(0,"maj7","I","A1"),S(9,"7","VI7","A1"),S(2,"m7","ii7","A1"),S(7,"7","V7","A1"),S(0,"maj7","I","A2"),S(9,"7","VI7","A2"),S(2,"m7","ii7","A2"),S(7,"7","V7","A2"),S(4,"7","III7","B"),S(9,"7","VI7","B"),S(2,"7","II7","B"),S(7,"7","V7","B"),S(0,"maj7","I","A3"),S(9,"7","VI7","A3"),S(2,"m7","ii7","A3"),S(7,"7","V7","A3")] };
  VISUALS.composition = { type: "form", title: "Diseño de una forma para componer", note: "Piensa la composición como recorrido: motivo, contraste, desarrollo y retorno.", bars: [S(0,"maj7","A","Motivo"),S(5,"maj7","A","Respuesta"),S(2,"m7","B","Contraste"),S(7,"7","B","Tensión"),S(0,"maj7","A'","Retorno"),S(9,"m7","A'","Variación"),S(2,"m7","C","Puente"),S(7,"7","C","Preparación")] };

  function mount(root, kind) {
    if (!root || root.dataset.mounted) return;
    var config = VISUALS[kind];
    if (!config) return;
    root.dataset.mounted = "true";
    if (config.type === "table") renderTable(root, config);
    else if (config.type === "form") renderForm(root, config);
    else if (config.type === "sequence") renderSequence(root, config);
    else renderProgression(root, config);
  }
  global.TheoryVisuals = { mount: mount };
})(window);
