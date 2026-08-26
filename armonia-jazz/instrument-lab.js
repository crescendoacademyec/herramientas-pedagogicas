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
  var SCALES = {
    major: { label: "Mayor / Jónica", intervals: [0,2,4,5,7,9,11], degrees: ["1","2","3","4","5","6","7"] },
    dorian: { label: "Dórica", intervals: [0,2,3,5,7,9,10], degrees: ["1","2","♭3","4","5","6","♭7"] },
    phrygian: { label: "Frigia", intervals: [0,1,3,5,7,8,10], degrees: ["1","♭2","♭3","4","5","♭6","♭7"] },
    lydian: { label: "Lidia", intervals: [0,2,4,6,7,9,11], degrees: ["1","2","3","#4","5","6","7"] },
    mixolydian: { label: "Mixolidia", intervals: [0,2,4,5,7,9,10], degrees: ["1","2","3","4","5","6","♭7"] },
    aeolian: { label: "Eólica", intervals: [0,2,3,5,7,8,10], degrees: ["1","2","♭3","4","5","♭6","♭7"] },
    locrian: { label: "Locria", intervals: [0,1,3,5,6,8,10], degrees: ["1","♭2","♭3","4","♭5","♭6","♭7"] },
    melodicMinor: { label: "Menor melódica", intervals: [0,2,3,5,7,9,11], degrees: ["1","2","♭3","4","5","6","7"] },
    harmonicMinor: { label: "Menor armónica", intervals: [0,2,3,5,7,8,11], degrees: ["1","2","♭3","4","5","♭6","7"] },
    harmonicMajor: { label: "Mayor armónica", intervals: [0,2,4,5,7,8,11], degrees: ["1","2","3","4","5","♭6","7"] },
    wholeTone: { label: "Tonos enteros", intervals: [0,2,4,6,8,10], degrees: ["1","2","3","#4","#5","♭7"] },
    diminishedHW: { label: "Disminuida semitono–tono", intervals: [0,1,3,4,6,7,9,10], degrees: ["1","♭9","#9","3","#11","5","13","♭7"] },
    diminishedWH: { label: "Disminuida tono–semitono", intervals: [0,2,3,5,6,8,9,11], degrees: ["1","2","♭3","4","♭5","♭6","6","7"] },
    minorPentatonic: { label: "Pentatónica menor", intervals: [0,3,5,7,10], degrees: ["1","♭3","4","5","♭7"] },
    majorPentatonic: { label: "Pentatónica mayor", intervals: [0,2,4,7,9], degrees: ["1","2","3","5","6"] },
    dominantPentatonic: { label: "Pentatónica dominante", intervals: [0,2,4,7,10], degrees: ["1","2","3","5","♭7"] },
    minorBlues: { label: "Blues menor", intervals: [0,3,5,6,7,10], degrees: ["1","♭3","4","#4","5","♭7"] },
    majorBlues: { label: "Blues mayor", intervals: [0,2,3,4,7,9], degrees: ["1","2","♭3","3","5","6"] },
    lydianDominant: { label: "Lidia dominante", intervals: [0,2,4,6,7,9,10], degrees: ["1","2","3","#4","5","6","♭7"] },
    lydianAugmented: { label: "Lidia aumentada", intervals: [0,2,4,6,8,9,11], degrees: ["1","2","3","#4","#5","6","7"] },
    altered: { label: "Alterada / superlocria", intervals: [0,1,3,4,6,8,10], degrees: ["1","♭9","#9","3","#11","♭13","♭7"] },
    phrygianDominant: { label: "Frigia dominante", intervals: [0,1,4,5,7,8,10], degrees: ["1","♭2","3","4","5","♭6","♭7"] },
    dorianSharp4: { label: "Dórica #4", intervals: [0,2,3,6,7,9,10], degrees: ["1","2","♭3","#4","5","6","♭7"] },
    mixolydianFlat6: { label: "Mixolidia ♭6", intervals: [0,2,4,5,7,8,10], degrees: ["1","2","3","4","5","♭6","♭7"] },
    locrianSharp2: { label: "Locria #2", intervals: [0,2,3,5,6,8,10], degrees: ["1","2","♭3","4","♭5","♭6","♭7"] },
    locrianNatural6: { label: "Locria 6", intervals: [0,1,3,5,6,9,10], degrees: ["1","♭2","♭3","4","♭5","6","♭7"] },
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

  function fretboard(root, item, region) {
    var start = REGION_STARTS[region], end = start + 5, active = pcs(root, item), width = 650, height = 215, left = 44, top = 34, fret = 94, gap = 27;
    var svg = ['<svg class="lab-fretboard" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Diapasón: región '+(region+1)+'">'];
    svg.push('<text x="'+left+'" y="16" fill="rgba(255,250,240,.62)" font-size="11">Región '+(region+1)+' · trastes '+start+'–'+end+'</text>');
    for (var f = start; f <= end + 1; f++) { var x = left + (f - start) * fret; svg.push('<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+gap*5)+'" stroke="rgba(255,255,255,.25)"/>'); if (f <= end) svg.push('<text x="'+(x+fret/2)+'" y="'+(top+gap*5+22)+'" text-anchor="middle" fill="rgba(255,250,240,.5)" font-size="10">'+f+'</text>'); }
    for (var s = 0; s < 6; s++) { var stringNo = BOARD_STRINGS[s], y = top + s*gap; svg.push('<line x1="'+left+'" y1="'+y+'" x2="'+(left+fret*6)+'" y2="'+y+'" stroke="rgba(255,255,255,.46)" stroke-width="'+(2-s*.18)+'"/><text x="10" y="'+(y+4)+'" fill="rgba(255,250,240,.55)" font-size="10">'+stringNo+'ª</text>'); }
    for (var si = 0; si < 6; si++) for (var fr = start; fr <= end; fr++) { var boardString = BOARD_STRINGS[si], pc = (OPEN_BY_STRING[boardString]+fr)%12; if (active.indexOf(pc) < 0) continue; var x2 = left+(fr-start)*fret+fret/2, y2 = top+si*gap, isRoot = pc === root; svg.push('<circle cx="'+x2+'" cy="'+y2+'" r="12" fill="'+(isRoot?'#d4a84f':'#9ab8aa')+'" stroke="#171513" stroke-width="2"/><text x="'+x2+'" y="'+(y2+4)+'" text-anchor="middle" fill="#171513" font-size="9" font-weight="800">'+labelForPc(pc,root,item)+'</text>'); }
    svg.push('</svg>'); return svg.join('');
  }
  function piano(root, item) {
    var active = pcs(root,item), out=['<svg class="lab-piano" viewBox="0 0 430 105" role="img" aria-label="Teclado de piano">'];
    var whites=[0,2,4,5,7,9,11], black=[1,3,6,8,10], wx={0:0,2:30,4:60,5:90,7:120,9:150,11:180};
    for (var oct=0;oct<2;oct++) whites.forEach(function(pc){var on=active.indexOf(pc)>=0;out.push('<rect x="'+(wx[pc]+oct*210+1)+'" y="2" width="28" height="94" rx="2" fill="'+(on?(pc===root?'#d4a84f':'#9ab8aa'):'#f4efe5')+'" stroke="#171513"/>'); if(on)out.push('<text x="'+(wx[pc]+oct*210+15)+'" y="82" text-anchor="middle" fill="#171513" font-size="9" font-weight="800">'+labelForPc(pc,root,item)+'</text>');});
    for (var oct2=0;oct2<2;oct2++) black.forEach(function(pc2){var x=({1:21,3:51,6:111,8:141,10:171}[pc2])+oct2*210,on2=active.indexOf(pc2)>=0;out.push('<rect x="'+x+'" y="2" width="18" height="59" rx="2" fill="'+(on2?(pc2===root?'#d4a84f':'#8a9e95'):'#1b1a18')+'"/>'); if(on2)out.push('<text x="'+(x+9)+'" y="47" text-anchor="middle" fill="#171513" font-size="7" font-weight="800">'+labelForPc(pc2,root,item)+'</text>');});
    out.push('</svg>'); return out.join('');
  }
  function populateItemSelect(select, state) { var data=GROUPS[state.group].data; select.innerHTML=""; Object.keys(data).forEach(function(key){var o=document.createElement("option");o.value=key;o.textContent=data[key].label;select.appendChild(o);}); if(!data[state.item]) state.item=Object.keys(data)[0]; select.value=state.item; }
  function mount(rootEl, initial) {
    initial = initial || {};
    var state={group:initial.group || "chord",item:initial.item || "maj7",root:initial.root || 0,region:initial.region || 0,view:"chord",stringSet:"drop2_5"};
    rootEl.innerHTML='<section class="lab" aria-label="Laboratorio de instrumentos"><div class="lab-head"><h3>'+esc(initial.title || "Laboratorio de instrumentos")+'</h3><p>Selecciona una sola familia y una región. La tónica se muestra en dorado.</p></div><div class="lab-controls"><label class="lab-field">Contenido<select data-lab="group"></select></label><label class="lab-field">Tipo<select data-lab="item"></select></label><label class="lab-field">Tónica<select data-lab="root"></select></label><label class="lab-field" data-lab="strings-field">Juego de cuerdas<select data-lab="strings"></select></label></div><div class="lab-position" data-lab="views" aria-label="Elegir lectura"></div><div class="lab-position" data-lab="positions" aria-label="Seleccionar región"></div><div class="lab-summary" data-lab="summary"></div><div class="lab-views"><div class="lab-card"><h4 data-lab="visual-title">Acorde de guitarra</h4><div data-lab="board"></div><div class="lab-legend"><span><i class="root"></i>Tónica</span><span><i></i>Notas de la estructura</span></div></div><div class="lab-card"><h4>Teclado</h4><div data-lab="piano"></div><p class="lab-note-list" data-lab="notes"></p></div></div></section>';
    var group=rootEl.querySelector('[data-lab="group"]'), item=rootEl.querySelector('[data-lab="item"]'), tonic=rootEl.querySelector('[data-lab="root"]');
    Object.keys(GROUPS).forEach(function(k){group.add(new Option(GROUPS[k].label,k));}); ROOT_LABELS.forEach(function(n,i){tonic.add(new Option(n,i));});
    function render(){
      group.value=state.group; tonic.value=state.root; populateItemSelect(item,state);
      var spec=GROUPS[state.group].data[state.item], isChord=state.group==="chord", isTriad=spec.intervals.length===3, name=ROOT_LABELS[state.root]+(state.group==="scale"?" "+spec.label:spec.symbol), stringsField=rootEl.querySelector('[data-lab="strings-field"]'), stringSelect=rootEl.querySelector('[data-lab="strings"]');
      stringsField.classList.toggle("hidden",!isChord);
      if(isChord){ stringSelect.innerHTML=""; (isTriad ? [{id:"triad6",label:"Tríada: 6–5–4"},{id:"triad5",label:"Tríada: 5–4–3"},{id:"triad4",label:"Tríada: 4–3–2"},{id:"triad3",label:"Tríada: 3–2–1"}] : [{id:"drop2_5",label:"Drop 2: raíz en 5ª"},{id:"drop2_4",label:"Drop 2: raíz en 4ª"},{id:"drop3_6",label:"Drop 3: raíz en 6ª"},{id:"drop3_5",label:"Drop 3: raíz en 5ª"}]).forEach(function(option){stringSelect.add(new Option(option.label,option.id));});if(!stringSelect.querySelector('option[value="'+state.stringSet+'"]'))state.stringSet=stringSelect.options[0].value;stringSelect.value=state.stringSet; }
      var views=rootEl.querySelector('[data-lab="views"]');views.innerHTML=""; (isChord ? [{id:"chord",label:"Acorde"},{id:"arpeggio",label:"Arpegio"},{id:"piano",label:"Piano"}] : [{id:"arpeggio",label:state.group==="scale"?"Mapa de escala":"Arpegio"},{id:"piano",label:"Piano"}]).forEach(function(view){var b=document.createElement("button");b.type="button";b.textContent=view.label;b.className=view.id===state.view?"active":"";b.addEventListener("click",function(){state.view=view.id;render();});views.appendChild(b);}); if(!isChord && state.view==="chord")state.view="arpeggio";
      rootEl.querySelector('[data-lab="summary"]').innerHTML='<strong>'+esc(name)+'</strong><span>'+esc(state.group==="arpeggio"?"Arpegio · ":state.group==="chord"?"Acorde · ":"Escala · ")+esc(spec.degrees.join(" – "))+'</span>';
      rootEl.querySelector('[data-lab="notes"]').textContent=noteList(state.root,spec);
      rootEl.querySelector('[data-lab="visual-title"]').textContent=state.view==="chord"?"Acorde de guitarra":state.view==="arpeggio"?(state.group==="scale"?"Escala por región":"Arpegio por región"):"Piano";
      rootEl.querySelector('[data-lab="board"]').innerHTML=state.view==="chord"?voicingFretboard(state.root,spec,state.region,state.stringSet):state.view==="arpeggio"?fretboard(state.root,spec,state.region):piano(state.root,spec);
      rootEl.querySelector('[data-lab="piano"]').innerHTML=state.view==="piano"?'<p class="lab-note-list">El teclado está ampliado a la izquierda.</p>':piano(state.root,spec);
      var buttons=rootEl.querySelector('[data-lab="positions"]');buttons.innerHTML="";for(var p=0;p<5;p++){var b=document.createElement("button");b.type="button";b.textContent="Región "+(p+1);b.className=p===state.region?"active":"";(function(pos){b.addEventListener("click",function(){state.region=pos;render();});})(p);buttons.appendChild(b);}
    }
    group.addEventListener("change",function(){state.group=this.value;state.item="";state.view=this.value==="chord"?"chord":"arpeggio";render();}); item.addEventListener("change",function(){render();}); tonic.addEventListener("change",function(){state.root=Number(this.value);render();}); rootEl.querySelector('[data-lab="strings"]').addEventListener("change",function(){state.stringSet=this.value;render();}); render();
  }
  function formulaSpec(item) {
    var root = item.rootPc || 0;
    return { intervals: item.formula.map(function (pc) { return ((pc - root) + 12) % 12; }), degrees: item.formula.map(function () { return "nota"; }) };
  }
  function nearestFret(stringNo, targetPc, desired) {
    var candidates = [];
    for (var fret = 0; fret <= 22; fret++) if ((OPEN_BY_STRING[stringNo] + fret) % 12 === targetPc) candidates.push(fret);
    return candidates.reduce(function (best, fret) { return Math.abs(fret - desired) < Math.abs(best - desired) ? fret : best; }, candidates[0]);
  }
  function voicingFretboard(root, item, region, kind) {
    var intervals = item.intervals.slice().sort(function(a,b){ return a-b; }), isTriad = intervals.length === 3;
    var config = isTriad
      ? ({ "triad6": { strings:[6,5,4], sequence:[0,1,2], label:"Tríada · cuerdas 6–5–4" }, "triad5": { strings:[5,4,3], sequence:[0,1,2], label:"Tríada · cuerdas 5–4–3" }, "triad4": { strings:[4,3,2], sequence:[0,1,2], label:"Tríada · cuerdas 4–3–2" }, "triad3": { strings:[3,2,1], sequence:[0,1,2], label:"Tríada · cuerdas 3–2–1" } }[kind] || { strings:[6,5,4], sequence:[0,1,2], label:"Tríada · cuerdas 6–5–4" })
      : ({ "drop2_5": { strings:[5,4,3,2], sequence:[0,2,3,1], label:"Drop 2 · raíz en 5ª" }, "drop2_4": { strings:[4,3,2,1], sequence:[0,2,3,1], label:"Drop 2 · raíz en 4ª" }, "drop3_6": { strings:[6,4,3,2], sequence:[0,3,1,2], label:"Drop 3 · raíz en 6ª" }, "drop3_5": { strings:[5,3,2,1], sequence:[0,3,1,2], label:"Drop 3 · raíz en 5ª" } }[kind] || { strings:[5,4,3,2], sequence:[0,2,3,1], label:"Drop 2 · raíz en 5ª" });
    var rootFret = nearestFret(config.strings[0], root, REGION_STARTS[region] + 2), notes=[], previous = -Infinity;
    config.strings.forEach(function (stringNo, index) { var target = (root + intervals[config.sequence[index]]) % 12, chosen = index === 0 ? rootFret : 0, bestAbs = Infinity; if(index){ for(var f=0;f<=22;f++){var abs=OPEN_MIDI[stringNo]+f;if((OPEN_BY_STRING[stringNo]+f)%12===target && abs>previous && abs<bestAbs){chosen=f;bestAbs=abs;}} } var midi=OPEN_MIDI[stringNo]+chosen; previous=midi; notes.push({ string:stringNo, fret:chosen, pc:target }); });
    var left=44, top=34, fretW=76, gap=27, start=Math.max(0, Math.min.apply(null,notes.map(function(n){return n.fret;}))-1), end=start+5, width=560, height=215, svg=['<svg class="lab-fretboard" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Voicing de acorde">'];
    svg.push('<text x="'+left+'" y="16" fill="rgba(255,250,240,.62)" font-size="11">'+config.label+' · trastes '+start+'–'+end+'</text>');
    for(var fr=start;fr<=end+1;fr++){var x=left+(fr-start)*fretW;svg.push('<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+gap*5)+'" stroke="rgba(255,255,255,.25)"/>');if(fr<=end)svg.push('<text x="'+(x+fretW/2)+'" y="'+(top+gap*5+22)+'" text-anchor="middle" fill="rgba(255,250,240,.5)" font-size="10">'+fr+'</text>');}
    BOARD_STRINGS.forEach(function(stringNo,row){var y=top+row*gap;svg.push('<line x1="'+left+'" y1="'+y+'" x2="'+(left+fretW*6)+'" y2="'+y+'" stroke="rgba(255,255,255,.46)" stroke-width="'+(2-row*.18)+'"/><text x="10" y="'+(y+4)+'" fill="rgba(255,250,240,.55)" font-size="10">'+stringNo+'ª</text>');});
    notes.forEach(function(note){var row=BOARD_STRINGS.indexOf(note.string), x=left+(note.fret-start)*fretW+fretW/2, y=top+row*gap, isRoot=note.pc===root;svg.push('<circle cx="'+x+'" cy="'+y+'" r="13" fill="'+(isRoot?'#d4a84f':'#9ab8aa')+'" stroke="#171513" stroke-width="2"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" fill="#171513" font-size="10" font-weight="800">'+labelForPc(note.pc,root,item)+'</text>');});
    svg.push('</svg>'); return svg.join('');
  }
  function mountProgression(rootEl, items) {
    var state = { index: 0, region: 0, view: "chord", stringSet: "drop2_5", transpose: 0 };
    rootEl.innerHTML = '<section class="lab lab-progression" aria-label="Ejemplo armónico interactivo"><div class="lab-head"><h3>Ejemplo armónico interactivo</h3><p>El acorde, su arpegio y el teclado son lecturas separadas de la misma estructura.</p></div><div class="lab-position" data-progression="chords"></div><div class="lab-position" data-progression="views" aria-label="Elegir lectura"></div><div class="lab-controls"><label class="lab-field">Tónica de referencia<select data-progression="tonic"></select></label><label class="lab-field">Juego de cuerdas<select data-progression="strings"></select></label><label class="lab-field">Posición / región<select data-progression="region"></select></label></div><div class="lab-summary" data-progression="summary"></div><div class="lab-views"><div class="lab-card"><h4 data-progression="visual-title">Acorde de guitarra</h4><div data-progression="board"></div><div class="lab-legend"><span><i class="root"></i>Fundamental</span><span><i></i>Notas del acorde</span></div></div><div class="lab-card"><h4>Teclado</h4><div data-progression="piano"></div><p class="lab-note-list" data-progression="notes"></p></div></div></section>';
    function render() {
      var current = items[state.index], root = ((current.rootPc || 0) + state.transpose) % 12, spec = formulaSpec(current), tonicSelect=rootEl.querySelector('[data-progression="tonic"]');
      var isTriad=spec.intervals.length===3, stringSelect=rootEl.querySelector('[data-progression="strings"]'), regionSelect=rootEl.querySelector('[data-progression="region"]');
      var chordButtons = rootEl.querySelector('[data-progression="chords"]'); chordButtons.innerHTML = "";
      items.forEach(function (entry, index) { var b=document.createElement("button"); b.type="button"; b.textContent=entry.symbol; b.className=index===state.index?"active":""; b.addEventListener("click",function(){state.index=index;render();}); chordButtons.appendChild(b); });
      var viewButtons=rootEl.querySelector('[data-progression="views"]'); viewButtons.innerHTML=""; [{id:"chord",label:"Acorde"},{id:"arpeggio",label:"Arpegio"},{id:"piano",label:"Piano"}].forEach(function(view){var b=document.createElement("button");b.type="button";b.textContent=view.label;b.className=view.id===state.view?"active":"";b.addEventListener("click",function(){state.view=view.id;render();});viewButtons.appendChild(b);});
      tonicSelect.innerHTML=""; ROOT_LABELS.forEach(function(label,pc){tonicSelect.add(new Option(label,pc));});tonicSelect.value=state.transpose;
      stringSelect.innerHTML=""; (isTriad ? [{id:"triad6",label:"Tríada: 6–5–4"},{id:"triad5",label:"Tríada: 5–4–3"},{id:"triad4",label:"Tríada: 4–3–2"},{id:"triad3",label:"Tríada: 3–2–1"}] : [{id:"drop2_5",label:"Drop 2: raíz en 5ª"},{id:"drop2_4",label:"Drop 2: raíz en 4ª"},{id:"drop3_6",label:"Drop 3: raíz en 6ª"},{id:"drop3_5",label:"Drop 3: raíz en 5ª"}]).forEach(function(option){stringSelect.add(new Option(option.label,option.id));}); if(!stringSelect.querySelector('option[value="'+state.stringSet+'"]'))state.stringSet=stringSelect.options[0].value;stringSelect.value=state.stringSet;
      regionSelect.innerHTML="";for(var p=0;p<5;p++)regionSelect.add(new Option("Región "+(p+1),p));regionSelect.value=state.region;
      rootEl.querySelector('[data-progression="summary"]').innerHTML='<strong>'+esc(spelled(root,root,"1")+" · "+current.symbol)+'</strong><span>Seleccionado dentro de la progresión</span>';
      rootEl.querySelector('[data-progression="visual-title"]').textContent=state.view==="chord"?"Acorde de guitarra":state.view==="arpeggio"?"Arpegio por región":"Piano";
      rootEl.querySelector('[data-progression="board"]').innerHTML=state.view==="chord"?voicingFretboard(root,spec,state.region,state.stringSet):state.view==="arpeggio"?fretboard(root,spec,state.region):piano(root,spec);
      rootEl.querySelector('[data-progression="piano"]').innerHTML=state.view==="piano"?'<p class="lab-note-list">El teclado está ampliado a la izquierda.</p>':piano(root,spec);
      rootEl.querySelector('[data-progression="notes"]').textContent=noteList(root,spec);
    }
    rootEl.querySelector('[data-progression="strings"]').addEventListener("change",function(){state.stringSet=this.value;render();});
    rootEl.querySelector('[data-progression="region"]').addEventListener("change",function(){state.region=Number(this.value);render();});
    rootEl.querySelector('[data-progression="tonic"]').addEventListener("change",function(){state.transpose=Number(this.value);render();});
    render();
  }
  global.ChordLab={mount:mount,mountProgression:mountProgression};
})(window);
