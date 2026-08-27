/* Laboratorio instrumental: una selección por vez, no una pared de diagramas.
   Las fórmulas son la fuente de verdad; las posiciones son ventanas de estudio
   transponibles sobre afinación estándar E-A-D-G-B-E. */
(function (global) {
  "use strict";

  var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var ROOT_LABELS = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
  var ROOT_LETTERS = ["C", "D", "D", "E", "E", "F", "G", "G", "A", "A", "B", "B"];
  var NATURAL_PC = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  /* El tablero se lee como el intérprete ve una partitura/tab: 1ª arriba, 6ª abajo. */
  var BOARD_STRINGS = [1, 2, 3, 4, 5, 6];
  var OPEN_BY_STRING = { 1: 4, 2: 11, 3: 7, 4: 2, 5: 9, 6: 4 };
  var OPEN_MIDI = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
  var CHORDS = {
    maj: { label: "Mayor", symbol: "", intervals: [0, 4, 7], degrees: ["1", "3", "5"] },
    min: { label: "Menor", symbol: "m", intervals: [0, 3, 7], degrees: ["1", "♭3", "5"] },
    aug: { label: "Aumentado", symbol: "+", intervals: [0, 4, 8], degrees: ["1", "3", "#5"] },
    dim: { label: "Disminuido", symbol: "°", intervals: [0, 3, 6], degrees: ["1", "♭3", "♭5"] },
    maj7: { label: "Maj7", symbol: "maj7", intervals: [0, 4, 7, 11], degrees: ["1", "3", "5", "7"] },
    min7: { label: "m7", symbol: "m7", intervals: [0, 3, 7, 10], degrees: ["1", "♭3", "5", "♭7"] },
    dom7: { label: "7 dominante", symbol: "7", intervals: [0, 4, 7, 10], degrees: ["1", "3", "5", "♭7"] },
    halfdim: { label: "m7♭5", symbol: "m7♭5", intervals: [0, 3, 6, 10], degrees: ["1", "♭3", "♭5", "♭7"] },
    dim7: { label: "°7", symbol: "°7", intervals: [0, 3, 6, 9], degrees: ["1", "♭3", "♭5", "♭♭7"] },
    sus: { label: "7sus4", symbol: "7sus4", intervals: [0, 5, 7, 10], degrees: ["1", "4", "5", "♭7"] },
    sharp5: { label: "7(#5)", symbol: "7(#5)", intervals: [0, 4, 8, 10], degrees: ["1", "3", "#5", "♭7"] },
    six: { label: "6", symbol: "6", intervals: [0, 4, 7, 9], degrees: ["1", "3", "5", "6"] },
    minsix: { label: "m6", symbol: "m6", intervals: [0, 3, 7, 9], degrees: ["1", "♭3", "5", "6"] }
  };
  /* roles: función sonora de cada intervalo (relativo a la tónica) para el nuevo
     código de color. root = tónica, chordTone = sonido estructural, tension =
     tensión disponible, avoid = nota a evitar. Los modos sin "roles" definido
     usan el valor por defecto (tónica / sonido estructural) hasta completarse. */
  var SCALES = {
    major: { label: "Mayor / Jónica", intervals: [0,2,4,5,7,9,11], degrees: ["1","2","3","4","5","6","7"], roles:{0:"root",2:"tension",4:"chordTone",5:"avoid",7:"chordTone",9:"tension",11:"chordTone"} },
    dorian: { label: "Dórica", intervals: [0,2,3,5,7,9,10], degrees: ["1","2","♭3","4","5","6","♭7"], roles:{0:"root",2:"tension",3:"chordTone",5:"tension",7:"chordTone",9:"tension",10:"chordTone"} },
    phrygian: { label: "Frigia", intervals: [0,1,3,5,7,8,10], degrees: ["1","♭2","♭3","4","5","♭6","♭7"], roles:{0:"root",1:"avoid",3:"chordTone",5:"tension",7:"chordTone",8:"tension",10:"chordTone"} },
    lydian: { label: "Lidia", intervals: [0,2,4,6,7,9,11], degrees: ["1","2","3","#4","5","6","7"], roles:{0:"root",2:"tension",4:"chordTone",6:"tension",7:"chordTone",9:"tension",11:"chordTone"} },
    mixolydian: { label: "Mixolidia", intervals: [0,2,4,5,7,9,10], degrees: ["1","2","3","4","5","6","♭7"], roles:{0:"root",2:"tension",4:"chordTone",5:"avoid",7:"chordTone",9:"tension",10:"chordTone"} },
    aeolian: { label: "Eólica", intervals: [0,2,3,5,7,8,10], degrees: ["1","2","♭3","4","5","♭6","♭7"], roles:{0:"root",2:"tension",3:"chordTone",5:"tension",7:"chordTone",8:"avoid",10:"chordTone"} },
    locrian: { label: "Locria", intervals: [0,1,3,5,6,8,10], degrees: ["1","♭2","♭3","4","♭5","♭6","♭7"], roles:{0:"root",1:"avoid",3:"chordTone",5:"tension",6:"chordTone",8:"tension",10:"chordTone"} },
    melodicMinor: { label: "Menor melódica", intervals: [0,2,3,5,7,9,11], degrees: ["1","2","♭3","4","5","6","7"], roles:{0:"root",2:"tension",3:"chordTone",5:"tension",7:"chordTone",9:"tension",11:"chordTone"} },
    harmonicMinor: { label: "Menor armónica", intervals: [0,2,3,5,7,8,11], degrees: ["1","2","♭3","4","5","♭6","7"], roles:{0:"root",2:"tension",3:"chordTone",5:"tension",7:"chordTone",8:"avoid",11:"chordTone"} },
    harmonicMajor: { label: "Mayor armónica", intervals: [0,2,4,5,7,8,11], degrees: ["1","2","3","4","5","♭6","7"], roles:{0:"root",2:"tension",4:"chordTone",5:"avoid",7:"chordTone",8:"tension",11:"chordTone"} },
    wholeTone: { label: "Tonos enteros", intervals: [0,2,4,6,8,10], degrees: ["1","2","3","#4","#5","♭7"], roles:{0:"root",2:"tension",4:"chordTone",6:"tension",8:"chordTone",10:"chordTone"} },
    diminishedHW: { label: "Disminuida semitono–tono", intervals: [0,1,3,4,6,7,9,10], degrees: ["1","♭9","#9","3","#11","5","13","♭7"], roles:{0:"root",1:"tension",3:"tension",4:"chordTone",6:"tension",7:"chordTone",9:"chordTone",10:"chordTone"} },
    diminishedWH: { label: "Disminuida tono–semitono", intervals: [0,2,3,5,6,8,9,11], degrees: ["1","2","♭3","4","♭5","♭6","6","7"], roles:{0:"root",2:"tension",3:"chordTone",5:"chordTone",6:"tension",8:"tension",9:"chordTone",11:"chordTone"} },
    minorPentatonic: { label: "Pentatónica menor", intervals: [0,3,5,7,10], degrees: ["1","♭3","4","5","♭7"], roles:{0:"root",3:"chordTone",5:"tension",7:"chordTone",10:"chordTone"} },
    majorPentatonic: { label: "Pentatónica mayor", intervals: [0,2,4,7,9], degrees: ["1","2","3","5","6"], roles:{0:"root",2:"tension",4:"chordTone",7:"chordTone",9:"tension"} },
    dominantPentatonic: { label: "Pentatónica dominante", intervals: [0,2,4,7,10], degrees: ["1","2","3","5","♭7"], roles:{0:"root",2:"tension",4:"chordTone",7:"chordTone",10:"chordTone"} },
    minorBlues: { label: "Blues menor", intervals: [0,3,5,6,7,10], degrees: ["1","♭3","4","#4","5","♭7"], roles:{0:"root",3:"chordTone",5:"tension",6:"tension",7:"chordTone",10:"chordTone"} },
    majorBlues: { label: "Blues mayor", intervals: [0,2,3,4,7,9], degrees: ["1","2","♭3","3","5","6"], roles:{0:"root",2:"tension",3:"tension",4:"chordTone",7:"chordTone",9:"tension"} },
    lydianDominant: { label: "Lidia dominante", intervals: [0,2,4,6,7,9,10], degrees: ["1","2","3","#4","5","6","♭7"], roles:{0:"root",2:"tension",4:"chordTone",6:"tension",7:"chordTone",9:"tension",10:"chordTone"} },
    lydianAugmented: { label: "Lidia aumentada", intervals: [0,2,4,6,8,9,11], degrees: ["1","2","3","#4","#5","6","7"], roles:{0:"root",2:"tension",4:"chordTone",6:"tension",8:"chordTone",9:"tension",11:"chordTone"} },
    altered: { label: "Alterada / superlocria", intervals: [0,1,3,4,6,8,10], degrees: ["1","♭9","#9","3","#11","♭13","♭7"], roles:{0:"root",1:"tension",3:"tension",4:"chordTone",6:"tension",8:"tension",10:"chordTone"} },
    phrygianDominant: { label: "Frigia dominante", intervals: [0,1,4,5,7,8,10], degrees: ["1","♭2","3","4","5","♭6","♭7"], roles:{0:"root",1:"tension",4:"chordTone",5:"tension",7:"chordTone",8:"tension",10:"chordTone"} },
    dorianSharp4: { label: "Dórica #4", intervals: [0,2,3,6,7,9,10], degrees: ["1","2","♭3","#4","5","6","♭7"] },
    mixolydianFlat6: { label: "Mixolidia ♭6", intervals: [0,2,4,5,7,8,10], degrees: ["1","2","3","4","5","♭6","♭7"] },
    locrianSharp2: { label: "Locria #2", intervals: [0,2,3,5,6,8,10], degrees: ["1","2","♭3","4","♭5","♭6","♭7"] },
    locrianNatural6: { label: "Locria 6", intervals: [0,1,3,5,6,9,10], degrees: ["1","♭2","♭3","4","♭5","6","♭7"], roles:{0:"root",1:"avoid",3:"chordTone",5:"tension",6:"chordTone",9:"tension",10:"chordTone"} },
    ionianFlat6: { label: "Jónica ♭6 / mayor armónica", intervals: [0,2,4,5,7,8,11], degrees: ["1","2","3","4","5","♭6","7"] },
    phrygianFlat4: { label: "Frigia ♭4", intervals: [0,1,3,4,7,8,10], degrees: ["1","♭2","♭3","♭4","5","♭6","♭7"] },
    lydianFlat3: { label: "Lidia ♭3", intervals: [0,2,3,6,7,9,11], degrees: ["1","2","♭3","#4","5","6","7"] },
    mixolydianFlat2: { label: "Mixolidia ♭2", intervals: [0,1,4,5,7,9,10], degrees: ["1","♭2","3","4","5","6","♭7"] },
    lydianSharp2: { label: "Lidia #2", intervals: [0,3,4,6,7,9,11], degrees: ["1","#2","3","#4","5","6","7"] },
    superLocrianFlat7: { label: "Superlocria ♭♭7", intervals: [0,1,3,4,6,8,9], degrees: ["1","♭2","♭3","♭4","♭5","♭6","♭♭7"] }
  };
  var GROUPS = { chord: { label: "Acordes / voicings", data: CHORDS }, scale: { label: "Escalas y modos", data: SCALES }, arpeggio: { label: "Arpegios", data: CHORDS } };
  /* Catálogo adicional procedente del diapasón virtual original. Se conservan
     incluso los modos enarmónicos para que el alumno encuentre el nombre usado
     en la clase y no una versión reducida del repertorio. */
  Object.assign(SCALES, {
    locrianSharp2Natural6: { label:"Locria #2, 6", intervals:[0,2,3,5,6,9,10], degrees:["1","2","♭3","4","♭5","6","♭7"] },
    mixolydianFlat2Sharp2No4: { label:"Mixolidia ♭2, #2 (sin 4)", intervals:[0,1,3,4,7,8,10], degrees:["1","♭2","#2","3","5","♭6","♭7"] },
    dorianSharp4Sharp7: { label:"Dórica #4, #7", intervals:[0,2,3,6,7,9,11], degrees:["1","2","♭3","#4","5","6","7"] },
    lydianSharp2Sharp5: { label:"Lidia #2, #5", intervals:[0,3,4,6,8,9,11], degrees:["1","#2","3","#4","#5","6","7"] },
    locrianFlat7: { label:"Locria ♭7", intervals:[0,1,3,5,6,8,9], degrees:["1","♭2","♭3","4","♭5","♭6","♭7"] },
    aeolianSharp7: { label:"Eólica #7", intervals:[0,2,3,5,7,8,11], degrees:["1","2","♭3","4","5","♭6","7"] },
    ionianAugmented: { label:"Jónica aumentada", intervals:[0,2,4,5,8,9,11], degrees:["1","2","3","4","#5","6","7"] },
    mixolydianFlat2Flat6: { label:"Mixolidia ♭2, ♭6", intervals:[0,1,4,5,7,8,10], degrees:["1","♭2","3","4","5","♭6","♭7"] },
    locrianFlat4Flat7: { label:"Locria ♭4, ♭7", intervals:[0,1,3,4,6,8,9], degrees:["1","♭2","♭3","♭4","♭5","♭6","♭7"] },
    dorianFlat2: { label:"Dórica ♭2", intervals:[0,1,3,5,7,9,10], degrees:["1","♭2","♭3","4","5","6","♭7"] }
  });
  var REGION_STARTS = [0, 3, 6, 9, 12];
  /* Los 5 modelos reales de la escala mayor (verificados nota por nota y traste
     por traste contra las imágenes de referencia, en Do mayor): ventanas de
     trastes NO uniformes, cada una empezando en un grado distinto de la
     escala (5, 6, 7, 2, 3). Se transportan a cualquier tónica sumando el
     semitono de la tónica elegida al traste base. */
  var SCALE_POSITION_WINDOWS = [ {start:2,end:6}, {start:4,end:8}, {start:7,end:10}, {start:9,end:13}, {start:12,end:15} ];
  function scaleWindowFor(regionIndex, root) {
    var base = SCALE_POSITION_WINDOWS[regionIndex % SCALE_POSITION_WINDOWS.length], span = base.end - base.start;
    var start = base.start + root;
    if (start + span > 19) start -= 12;
    return { start: start, end: start + span };
  }
  /* Código de color funcional: verde tónica, azul sonido estructural,
     amarillo tensión disponible, rojo nota a evitar. */
  var ROLE_COLORS = { root: "#4caf6a", chordTone: "#4a90d9", tension: "#e0b93c", avoid: "#d9564a" };

  function esc(value) { return String(value).replace(/[&<>\"]/g, function (c) { return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c]; }); }
  function pcs(root, item) { return item.intervals.map(function (i) { return (root + i) % 12; }); }
  function spelled(pc, root, degree) {
    if (!degree || degree === "nota") return ROOT_LABELS[pc];
    var number = parseInt(String(degree).replace(/[^0-9]/g, ""), 10); if (!number) return ROOT_LABELS[pc];
    var letters = ["C","D","E","F","G","A","B"], rootIndex = letters.indexOf(ROOT_LETTERS[root]), letter = letters[(rootIndex + number - 1) % 7];
    var delta = ((pc - NATURAL_PC[letter] + 18) % 12) - 6, accidental = delta === 0 ? "" : delta === 1 ? "#" : delta === 2 ? "##" : delta === -1 ? "♭" : delta === -2 ? "♭♭" : "";
    return letter + accidental;
  }
  function noteList(root, item) { return item.intervals.map(function (i, n) { return spelled((root + i) % 12, root, item.degrees[n]) + " (" + item.degrees[n] + ")"; }).join(" · "); }
  function labelForPc(pc, root, item) { var index = item.intervals.map(function(i){return (root+i)%12;}).indexOf(pc); return spelled(pc, root, index < 0 ? "nota" : item.degrees[index]); }
  /* Determina el color funcional de una nota según su intervalo con la tónica.
     Solo las escalas tienen tensiones/notas a evitar; acordes y arpegios sólo
     distinguen tónica de resto de la estructura. */
  function roleForPc(pc, root, item, group) {
    var rel = ((pc - root) % 12 + 12) % 12;
    if (rel === 0) return "root";
    if (group === "scale" && item.roles && item.roles[rel]) return item.roles[rel];
    return "chordTone";
  }

  function fretboard(root, item, region, group) {
    var win = scaleWindowFor(region, root), start = win.start, end = win.end, active = pcs(root, item);
    var left = 44, top = 34, fret = 94, gap = 27, cols = end - start + 1, width = left + cols * fret + 20, height = 215;
    var svg = ['<svg class="lab-fretboard" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Diapasón: posición '+(region+1)+'">'];
    svg.push('<text x="'+left+'" y="16" fill="rgba(255,250,240,.62)" font-size="11">Posición '+(region+1)+' · trastes '+start+'–'+end+'</text>');
    for (var f = start; f <= end + 1; f++) { var x = left + (f - start) * fret; svg.push('<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+gap*5)+'" stroke="rgba(255,255,255,.25)"/>'); if (f <= end) svg.push('<text x="'+(x+fret/2)+'" y="'+(top+gap*5+22)+'" text-anchor="middle" fill="rgba(255,250,240,.5)" font-size="10">'+f+'</text>'); }
    for (var s = 0; s < 6; s++) { var stringNo = BOARD_STRINGS[s], y = top + s*gap; svg.push('<line x1="'+left+'" y1="'+y+'" x2="'+(left+fret*cols)+'" y2="'+y+'" stroke="rgba(255,255,255,.46)" stroke-width="'+(2-s*.18)+'"/><text x="10" y="'+(y+4)+'" fill="rgba(255,250,240,.55)" font-size="10">'+stringNo+'ª</text>'); }
    for (var si = 0; si < 6; si++) for (var fr = start; fr <= end; fr++) { var boardString = BOARD_STRINGS[si], pc = (OPEN_BY_STRING[boardString]+fr)%12; if (active.indexOf(pc) < 0) continue; var x2 = left+(fr-start)*fret+fret/2, y2 = top+si*gap, role = roleForPc(pc,root,item,group); svg.push('<circle cx="'+x2+'" cy="'+y2+'" r="12" fill="'+ROLE_COLORS[role]+'" stroke="#171513" stroke-width="2"/><text x="'+x2+'" y="'+(y2+4)+'" text-anchor="middle" fill="#171513" font-size="9" font-weight="800">'+labelForPc(pc,root,item)+'</text>'); }
    svg.push('</svg>'); return svg.join('');
  }
  function piano(root, item, group) {
    var active = pcs(root,item), out=['<svg class="lab-piano" viewBox="0 0 430 105" role="img" aria-label="Teclado de piano">'];
    var whites=[0,2,4,5,7,9,11], black=[1,3,6,8,10], wx={0:0,2:30,4:60,5:90,7:120,9:150,11:180};
    for (var oct=0;oct<2;oct++) whites.forEach(function(pc){var on=active.indexOf(pc)>=0, role=on?roleForPc(pc,root,item,group):null; out.push('<rect x="'+(wx[pc]+oct*210+1)+'" y="2" width="28" height="94" rx="2" fill="'+(on?ROLE_COLORS[role]:'#f4efe5')+'" stroke="#171513"/>'); if(on)out.push('<text x="'+(wx[pc]+oct*210+15)+'" y="82" text-anchor="middle" fill="#171513" font-size="9" font-weight="800">'+labelForPc(pc,root,item)+'</text>');});
    for (var oct2=0;oct2<2;oct2++) black.forEach(function(pc2){var x=({1:21,3:51,6:111,8:141,10:171}[pc2])+oct2*210,on2=active.indexOf(pc2)>=0, role2=on2?roleForPc(pc2,root,item,group):null; out.push('<rect x="'+x+'" y="2" width="18" height="59" rx="2" fill="'+(on2?ROLE_COLORS[role2]:'#1b1a18')+'"/>'); if(on2)out.push('<text x="'+(x+9)+'" y="47" text-anchor="middle" fill="#171513" font-size="7" font-weight="800">'+labelForPc(pc2,root,item)+'</text>');});
    out.push('</svg>'); return out.join('');
  }
  function populateItemSelect(select, state) { var data=GROUPS[state.group].data; select.innerHTML=""; Object.keys(data).forEach(function(key){var o=document.createElement("option");o.value=key;o.textContent=data[key].label;select.appendChild(o);}); if(!data[state.item]) state.item=Object.keys(data)[0]; select.value=state.item; }
  function mount(rootEl, initial) {
    initial = initial || {};
    var state={group:initial.group || "chord",item:initial.item || "maj7",root:initial.root || 0,region:initial.region || 0,stringSet:"drop2_5"};
    rootEl.innerHTML='<section class="lab" aria-label="Laboratorio de instrumentos"><div class="lab-head"><h3>'+esc(initial.title || "Laboratorio de instrumentos")+'</h3><p>Selecciona el contenido y una posición. El diapasón y el teclado se actualizan juntos.</p></div><div class="lab-controls"><label class="lab-field">Contenido<select data-lab="group"></select></label><label class="lab-field">Tipo<select data-lab="item"></select></label><label class="lab-field">Tónica<select data-lab="root"></select></label><label class="lab-field" data-lab="strings-field">Juego de cuerdas<select data-lab="strings"></select></label></div><div class="lab-position" data-lab="positions" aria-label="Seleccionar posición"></div><div class="lab-summary" data-lab="summary"></div><div class="lab-views"><div class="lab-card"><h4 data-lab="visual-title">Acorde de guitarra</h4><div data-lab="board"></div><div class="lab-legend" data-lab="legend"></div></div><div class="lab-card"><h4>Teclado</h4><div data-lab="piano"></div><p class="lab-note-list" data-lab="notes"></p></div></div></section>';
    var group=rootEl.querySelector('[data-lab="group"]'), item=rootEl.querySelector('[data-lab="item"]'), tonic=rootEl.querySelector('[data-lab="root"]');
    Object.keys(GROUPS).forEach(function(k){group.add(new Option(GROUPS[k].label,k));}); ROOT_LABELS.forEach(function(n,i){tonic.add(new Option(n,i));});
    function render(){
      group.value=state.group; tonic.value=state.root; populateItemSelect(item,state);
      var spec=GROUPS[state.group].data[state.item], isChord=state.group==="chord", isScale=state.group==="scale", isTriad=spec.intervals.length===3;
      var name=ROOT_LABELS[state.root]+(isScale?" "+spec.label:spec.symbol), stringsField=rootEl.querySelector('[data-lab="strings-field"]'), stringSelect=rootEl.querySelector('[data-lab="strings"]');
      stringsField.classList.toggle("hidden",!isChord);
      if(isChord){ stringSelect.innerHTML=""; (isTriad ? [{id:"triad6",label:"Tríada: 6–5–4"},{id:"triad5",label:"Tríada: 5–4–3"},{id:"triad4",label:"Tríada: 4–3–2"},{id:"triad3",label:"Tríada: 3–2–1"}] : [{id:"drop2_5",label:"Drop 2: raíz en 5ª"},{id:"drop2_4",label:"Drop 2: raíz en 4ª"},{id:"drop3_6",label:"Drop 3: raíz en 6ª"},{id:"drop3_5",label:"Drop 3: raíz en 5ª"}]).forEach(function(option){stringSelect.add(new Option(option.label,option.id));});if(!stringSelect.querySelector('option[value="'+state.stringSet+'"]'))state.stringSet=stringSelect.options[0].value;stringSelect.value=state.stringSet; }
      var posCount = isChord ? spec.intervals.length : 5;
      if (state.region >= posCount) state.region = 0;
      var buttons=rootEl.querySelector('[data-lab="positions"]');buttons.innerHTML="";
      for(var p=0;p<posCount;p++){var b=document.createElement("button");b.type="button";b.textContent=isChord?INVERSION_LABELS[p]:"Posición "+(p+1);b.className=p===state.region?"active":"";(function(pos){b.addEventListener("click",function(){state.region=pos;render();});})(p);buttons.appendChild(b);}
      rootEl.querySelector('[data-lab="summary"]').innerHTML='<strong>'+esc(name)+'</strong><span>'+esc(state.group==="arpeggio"?"Arpegio · ":isChord?"Acorde · ":"Escala · ")+esc(spec.degrees.join(" – "))+'</span>';
      rootEl.querySelector('[data-lab="notes"]').textContent=noteList(state.root,spec);
      rootEl.querySelector('[data-lab="visual-title"]').textContent=isChord?"Acorde de guitarra":isScale?"Mapa de escala":"Arpegio";
      rootEl.querySelector('[data-lab="board"]').innerHTML=isChord?voicingFretboard(state.root,spec,state.region,state.stringSet):fretboard(state.root,spec,state.region,state.group);
      rootEl.querySelector('[data-lab="piano"]').innerHTML=piano(state.root,spec,state.group);
      var legend=rootEl.querySelector('[data-lab="legend"]');
      legend.innerHTML = isScale
        ? '<span><i style="background:'+ROLE_COLORS.root+'"></i>Fundamental</span><span><i style="background:'+ROLE_COLORS.chordTone+'"></i>Sonido estructural</span><span><i style="background:'+ROLE_COLORS.tension+'"></i>Tensión disponible</span><span><i style="background:'+ROLE_COLORS.avoid+'"></i>Evitar</span>'
        : '<span><i style="background:'+ROLE_COLORS.root+'"></i>Fundamental</span><span><i style="background:'+ROLE_COLORS.chordTone+'"></i>Notas del acorde</span>';
    }
    group.addEventListener("change",function(){state.group=this.value;state.item="";state.region=0;render();}); item.addEventListener("change",function(){state.item=this.value;state.region=0;render();}); tonic.addEventListener("change",function(){state.root=Number(this.value);render();}); rootEl.querySelector('[data-lab="strings"]').addEventListener("change",function(){state.stringSet=this.value;state.region=0;render();}); render();
  }
  function formulaSpec(item) {
    var root = item.rootPc || 0;
    return { intervals: item.formula.map(function (pc) { return ((pc - root) + 12) % 12; }), degrees: item.formula.map(function () { return "nota"; }) };
  }
  var INVERSION_LABELS = ["Fundamental", "1ª Inversión", "2ª Inversión", "3ª Inversión"];
  /* Construye la posición cerrada ascendente para la rotación k (0..n-1) y,
     si corresponde, aplica drop 2 / drop 3 (solo definido para tétradas). */
  function computeOrder(intervals, n, k, dropType) {
    var close = []; for (var i = 0; i < n; i++) { var idx = (k + i) % n; close.push(intervals[idx] + (idx < k ? 12 : 0)); }
    if (n === 4 && dropType === "drop3") return [close[1]-12, close[0], close[2], close[3]];
    if (n === 4 && dropType === "drop2") return [close[2]-12, close[0], close[1], close[3]];
    return close;
  }
  /* El drop 2 / drop 3 cambia físicamente qué tono queda en el bajo respecto
     a la rotación k de la posición cerrada (p.ej. la rotación "raíz" de un
     drop 2 termina con la 5ª en el bajo). Aquí se calcula, para cada k, cuál
     es el bajo real resultante y se arma la tabla inversa: qué k produce
     Fundamental, cuál produce 1ª Inversión, etc. */
  function trueInversionMap(intervals, n, dropType) {
    var kForTrue = new Array(n);
    for (var k = 0; k < n; k++) {
      var order = computeOrder(intervals, n, k, dropType), bassRel = ((order[0] % 12) + 12) % 12, trueIdx = intervals.indexOf(bassRel);
      kForTrue[trueIdx < 0 ? k : trueIdx] = k;
    }
    return kForTrue;
  }
  /* Calidad de la tríada formada por fundamental-3ª-5ª (ignorando la 7ª),
     usada para nombrar la 3ª inversión de una tétrada como acorde con bajo. */
  function triadQualitySuffix(intervals) {
    var third = intervals[1], fifth = intervals[2];
    if (third === 4 && fifth === 7) return "";
    if (third === 3 && fifth === 7) return "m";
    if (third === 3 && fifth === 6) return "°";
    if (third === 4 && fifth === 8) return "+";
    return null;
  }
  function guessSymbol(intervals) {
    var key = intervals.join(",");
    for (var name in CHORDS) if (CHORDS[name].intervals.join(",") === key) return CHORDS[name].symbol;
    return null;
  }
  /* Nombre del acorde para la inversión mostrada: sin barra en fundamental,
     "símbolo/bajo" en 1ª y 2ª inversión, y en la última inversión de una
     tétrada (7ª en el bajo) se simplifica a "tríada/bajo" cuando la tríada
     fundamental-3ª-5ª es reconocible (igual que en las cifras estándar). */
  function chordNameForBass(root, item, intervals, symbol, bassPc, trueInv, n) {
    var full = ROOT_LABELS[root] + symbol;
    if (trueInv === 0 || bassPc === undefined) return full;
    if (n === 4 && trueInv === 3) { var quality = triadQualitySuffix(intervals); if (quality !== null) return ROOT_LABELS[root] + quality + "/" + labelForPc(bassPc, root, item); }
    return full + "/" + labelForPc(bassPc, root, item);
  }
  /* Busca, entre todos los trastes posibles para la nota del bajo, la
     disposición más compacta (menor distancia entre el traste más grave y
     el más agudo) en vez de anclarse a un traste "deseado" fijo: así se
     evita mezclar una cuerda al aire muy grave con notas mucho más arriba
     del mástil, que era la causa de los voicings imposibles de tocar. */
  function buildVoicing(root, orderRel, strings) {
    var n = strings.length, bassPc = ((root + orderRel[0]) % 12 + 12) % 12, bassString = strings[0], candidates = [], best = null;
    for (var f = 0; f <= 19; f++) if ((OPEN_BY_STRING[bassString]+f)%12 === bassPc) candidates.push(f);
    candidates.forEach(function (bassFret) {
      var notes = [{ string: bassString, fret: bassFret, pc: bassPc }], previous = OPEN_MIDI[bassString] + bassFret, ok = true;
      for (var s = 1; s < n; s++) {
        var stringNo = strings[s], target = ((root + orderRel[s]) % 12 + 12) % 12, chosen = -1, bestAbs = Infinity;
        for (var f2 = 0; f2 <= 22; f2++) { var abs = OPEN_MIDI[stringNo] + f2; if ((OPEN_BY_STRING[stringNo]+f2)%12 === target && abs > previous && abs < bestAbs) { chosen = f2; bestAbs = abs; } }
        if (chosen < 0) { ok = false; break; }
        previous = OPEN_MIDI[stringNo] + chosen; notes.push({ string: stringNo, fret: chosen, pc: target });
      }
      if (!ok) return;
      var frets = notes.map(function (nt) { return nt.fret; }), span = Math.max.apply(null, frets) - Math.min.apply(null, frets), sum = frets.reduce(function (a,b) { return a+b; }, 0);
      if (!best || span < best.span || (span === best.span && sum < best.sum)) best = { notes: notes, span: span, sum: sum };
    });
    return best ? best.notes : [];
  }
  function voicingFretboard(root, item, positionIndex, kind) {
    var intervals = item.intervals.slice().sort(function(a,b){ return a-b; }), n = intervals.length, isTriad = n === 3;
    var config = isTriad
      ? ({ "triad6": { strings:[6,5,4], label:"Tríada · cuerdas 6–5–4" }, "triad5": { strings:[5,4,3], label:"Tríada · cuerdas 5–4–3" }, "triad4": { strings:[4,3,2], label:"Tríada · cuerdas 4–3–2" }, "triad3": { strings:[3,2,1], label:"Tríada · cuerdas 3–2–1" } }[kind] || { strings:[6,5,4], label:"Tríada · cuerdas 6–5–4" })
      : ({ "drop2_5": { strings:[5,4,3,2], drop:"drop2", label:"Drop 2 · raíz en 5ª" }, "drop2_4": { strings:[4,3,2,1], drop:"drop2", label:"Drop 2 · raíz en 4ª" }, "drop3_6": { strings:[6,4,3,2], drop:"drop3", label:"Drop 3 · raíz en 6ª" }, "drop3_5": { strings:[5,3,2,1], drop:"drop3", label:"Drop 3 · raíz en 5ª" } }[kind] || { strings:[5,4,3,2], drop:"drop2", label:"Drop 2 · raíz en 5ª" });
    var dropType = isTriad ? null : config.drop, relabel = (n === 3 || n === 4), kForTrue = relabel ? trueInversionMap(intervals, n, dropType) : null;
    var p = ((positionIndex % n) + n) % n, k = relabel ? kForTrue[p] : p, trueInv = relabel ? p : k;
    var order = computeOrder(intervals, n, k, dropType), notes = buildVoicing(root, order, config.strings);
    var bassPc = notes.length ? notes[0].pc : root;
    var symbol = item.symbol !== undefined ? item.symbol : (guessSymbol(intervals) || "");
    var positionLabel = relabel ? INVERSION_LABELS[trueInv] : ("Posición " + (p + 1));
    var chordName = chordNameForBass(root, item, intervals, symbol, bassPc, trueInv, n);
    var left=44, top=34, fretW=76, gap=27;
    var frets = notes.map(function(nt){ return nt.fret; });
    var minFret = frets.length ? Math.min.apply(null, frets) : 0, maxFret = frets.length ? Math.max.apply(null, frets) : 4;
    var start = Math.max(0, minFret - 1), end = Math.max(start + 4, maxFret + 1);
    var openMargin = start === 0 ? 24 : 0, gridLeft = left + openMargin, cols = end - start + 1, width = gridLeft + cols*fretW + 20, height = 215;
    var svg=['<svg class="lab-fretboard" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Voicing de acorde: '+esc(positionLabel)+'">'];
    svg.push('<text x="'+left+'" y="16" fill="rgba(255,250,240,.62)" font-size="11">'+esc(config.label)+' · '+esc(positionLabel)+' · '+esc(chordName)+'</text>');
    for(var fr=start;fr<=end+1;fr++){ var x=gridLeft+(fr-start)*fretW, isNut = start===0 && fr===0; svg.push('<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+gap*5)+'" stroke="'+(isNut?"rgba(255,250,240,.85)":"rgba(255,255,255,.25)")+'" stroke-width="'+(isNut?4:1)+'"/>'); if(fr<=end && fr>0) svg.push('<text x="'+(x+fretW/2)+'" y="'+(top+gap*5+22)+'" text-anchor="middle" fill="rgba(255,250,240,.5)" font-size="10">'+fr+'</text>'); }
    if (start === 0) svg.push('<text x="'+(gridLeft-14)+'" y="'+(top+gap*5+22)+'" text-anchor="middle" fill="rgba(255,250,240,.5)" font-size="9">al aire</text>');
    BOARD_STRINGS.forEach(function(stringNo,row){var y=top+row*gap;svg.push('<line x1="'+gridLeft+'" y1="'+y+'" x2="'+(gridLeft+fretW*(end-start))+'" y2="'+y+'" stroke="rgba(255,255,255,.46)" stroke-width="'+(2-row*.18)+'"/><text x="10" y="'+(y+4)+'" fill="rgba(255,250,240,.55)" font-size="10">'+stringNo+'ª</text>');});
    notes.forEach(function(note){var row=BOARD_STRINGS.indexOf(note.string), open=note.fret===0 && start===0, x=open?(gridLeft-14):(gridLeft+(note.fret-start)*fretW+fretW/2), y=top+row*gap, role=roleForPc(note.pc,root,item,"chord");svg.push('<circle cx="'+x+'" cy="'+y+'" r="13" fill="'+ROLE_COLORS[role]+'" stroke="#171513" stroke-width="2"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" fill="#171513" font-size="10" font-weight="800">'+labelForPc(note.pc,root,item)+'</text>');});
    svg.push('</svg>'); return svg.join('');
  }
  function mountProgression(rootEl, items) {
    var state = { index: 0, region: 0, stringSet: "drop2_5", transpose: 0 };
    rootEl.innerHTML = '<section class="lab lab-progression" aria-label="Ejemplo armónico interactivo"><div class="lab-head"><h3>Ejemplo armónico interactivo</h3><p>El acorde de guitarra y el teclado muestran la misma estructura.</p></div><div class="lab-position" data-progression="chords"></div><div class="lab-controls"><label class="lab-field">Tónica de referencia<select data-progression="tonic"></select></label><label class="lab-field">Juego de cuerdas<select data-progression="strings"></select></label></div><div class="lab-position" data-progression="region" aria-label="Seleccionar posición"></div><div class="lab-summary" data-progression="summary"></div><div class="lab-views"><div class="lab-card"><h4>Acorde de guitarra</h4><div data-progression="board"></div><div class="lab-legend"><span><i style="background:'+ROLE_COLORS.root+'"></i>Fundamental</span><span><i style="background:'+ROLE_COLORS.chordTone+'"></i>Notas del acorde</span></div></div><div class="lab-card"><h4>Teclado</h4><div data-progression="piano"></div><p class="lab-note-list" data-progression="notes"></p></div></div></section>';
    function render() {
      var current = items[state.index], root = ((current.rootPc || 0) + state.transpose) % 12, spec = formulaSpec(current), tonicSelect=rootEl.querySelector('[data-progression="tonic"]');
      var n = spec.intervals.length, isTriad = n===3, relabel = (n===3||n===4), stringSelect=rootEl.querySelector('[data-progression="strings"]'), regionButtons=rootEl.querySelector('[data-progression="region"]');
      var chordButtons = rootEl.querySelector('[data-progression="chords"]'); chordButtons.innerHTML = "";
      items.forEach(function (entry, index) { var b=document.createElement("button"); b.type="button"; b.textContent=entry.symbol; b.className=index===state.index?"active":""; b.addEventListener("click",function(){state.index=index;state.region=0;render();}); chordButtons.appendChild(b); });
      tonicSelect.innerHTML=""; ROOT_LABELS.forEach(function(label,pc){tonicSelect.add(new Option(label,pc));});tonicSelect.value=state.transpose;
      stringSelect.innerHTML=""; (isTriad ? [{id:"triad6",label:"Tríada: 6–5–4"},{id:"triad5",label:"Tríada: 5–4–3"},{id:"triad4",label:"Tríada: 4–3–2"},{id:"triad3",label:"Tríada: 3–2–1"}] : [{id:"drop2_5",label:"Drop 2: raíz en 5ª"},{id:"drop2_4",label:"Drop 2: raíz en 4ª"},{id:"drop3_6",label:"Drop 3: raíz en 6ª"},{id:"drop3_5",label:"Drop 3: raíz en 5ª"}]).forEach(function(option){stringSelect.add(new Option(option.label,option.id));}); if(!stringSelect.querySelector('option[value="'+state.stringSet+'"]'))state.stringSet=stringSelect.options[0].value;stringSelect.value=state.stringSet;
      var posCount = relabel ? n : Math.max(n,1);
      if (state.region >= posCount) state.region = 0;
      regionButtons.innerHTML=""; for (var p=0;p<posCount;p++){ var rb=document.createElement("button"); rb.type="button"; rb.textContent = relabel ? INVERSION_LABELS[p] : ("Posición "+(p+1)); rb.className = p===state.region?"active":""; (function(pos){ rb.addEventListener("click",function(){state.region=pos;render();}); })(p); regionButtons.appendChild(rb); }
      rootEl.querySelector('[data-progression="summary"]').innerHTML='<strong>'+esc(spelled(root,root,"1")+" · "+current.symbol)+'</strong><span>Seleccionado dentro de la progresión</span>';
      rootEl.querySelector('[data-progression="board"]').innerHTML=voicingFretboard(root,spec,state.region,state.stringSet);
      rootEl.querySelector('[data-progression="piano"]').innerHTML=piano(root,spec);
      rootEl.querySelector('[data-progression="notes"]').textContent=noteList(root,spec);
    }
    rootEl.querySelector('[data-progression="strings"]').addEventListener("change",function(){state.stringSet=this.value;state.region=0;render();});
    rootEl.querySelector('[data-progression="tonic"]').addEventListener("change",function(){state.transpose=Number(this.value);render();});
    render();
  }
  global.ChordLab={mount:mount,mountProgression:mountProgression};
})(window);
