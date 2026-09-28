/* Mapa escala–acorde para la práctica de improvisación jazz. */
(function (global) {
  "use strict";
  var NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
  var SCALE = {
    ionian:[0,2,4,5,7,9,11], dorian:[0,2,3,5,7,9,10], phrygian:[0,1,3,5,7,8,10],
    lydian:[0,2,4,6,7,9,11], mixolydian:[0,2,4,5,7,9,10], aeolian:[0,2,3,5,7,8,10],
    locrian:[0,1,3,5,6,8,10], harmonicMinor:[0,2,3,5,7,8,11], melodicMinor:[0,2,3,5,7,9,11],
    altered:[0,1,3,4,6,8,10], diminishedHW:[0,1,3,4,6,7,9,10], wholeTone:[0,2,4,6,8,10]
  };
  var SCALE_NAMES = {ionian:"Jónica / mayor",dorian:"Dórica",phrygian:"Frigia",lydian:"Lidia",mixolydian:"Mixolidia",aeolian:"Eólica",locrian:"Locria",harmonicMinor:"Menor armónica",melodicMinor:"Menor melódica",altered:"Alterada",diminishedHW:"Disminuida semitono–tono",wholeTone:"Tonos enteros"};
  /* El catálogo del laboratorio visual es la fuente única de escalas y modos. */
  if (global.ChordLab && global.ChordLab.scales) Object.keys(global.ChordLab.scales).forEach(function (id) {
    SCALE[id] = global.ChordLab.scales[id].intervals.slice();
    SCALE_NAMES[id] = global.ChordLab.scales[id].label;
  });
  /* Respaldo para las pruebas y para una carga parcial; en la página se reemplaza
     por el catálogo completo del laboratorio visual. */
  Object.assign(SCALE,{harmonicMajor:[0,2,4,5,7,8,11],locrianSharp2Natural6:[0,2,3,5,6,9,10],dorianFlat2:[0,1,3,5,7,9,10],lydianFlat3:[0,2,3,6,7,9,11],mixolydianFlat2:[0,1,4,5,7,9,10],lydianSharp2:[0,3,4,6,7,9,11],superLocrianFlat7:[0,1,3,4,6,8,9],lydianAugmented:[0,2,4,6,8,9,11],lydianDominant:[0,2,4,6,7,9,10],mixolydianFlat6:[0,2,4,5,7,8,10],locrianSharp2:[0,2,3,5,6,8,10]});
  Object.assign(SCALE_NAMES,{harmonicMajor:"Mayor armónica",locrianSharp2Natural6:"Locria ♯2, 6",dorianFlat2:"Dórica ♭2",lydianFlat3:"Lidia ♭3",mixolydianFlat2:"Mixolidia ♭2",lydianSharp2:"Lidia ♯2",superLocrianFlat7:"Superlocria ♭♭7",lydianAugmented:"Lidia aumentada",lydianDominant:"Lidia dominante",mixolydianFlat6:"Mixolidia ♭6",locrianSharp2:"Locria ♯2"});
  var ROWS = [
    {id:"major", name:"Escala mayor", scale:"ionian", qualities:["maj7","m7","m7","maj7","7","m7","m7♭5"], modes:["ionian","dorian","phrygian","lydian","mixolydian","aeolian","locrian"]},
    {id:"harmonic", name:"Menor armónica", scale:"harmonicMinor", qualities:["m(maj7)","m7♭5","maj7♯5","m7","7","maj7","°7"], modes:["harmonicMinor","locrian","ionian","dorian","phrygian","lydian","diminishedHW"]},
    {id:"melodic", name:"Menor melódica", scale:"melodicMinor", qualities:["m(maj7)","m7","maj7♯5","7♯11","7","m7♭5","m7♭5"], modes:["melodicMinor","dorian","lydianAugmented","lydianDominant","mixolydianFlat6","locrianSharp2","altered"]},
    {id:"harmonicMajor", name:"Mayor armónica", scale:"harmonicMajor", qualities:["maj7","m7♭5","m7","m7","7","maj7♯5","°7"], modes:["harmonicMajor","locrianSharp2Natural6","dorianFlat2","lydianFlat3","mixolydianFlat2","lydianSharp2","superLocrianFlat7"]}
  ];
  var INTERVALS = {"maj7":[0,4,7,11],"m7":[0,3,7,10],"7":[0,4,7,10],"m7♭5":[0,3,6,10],"m(maj7)":[0,3,7,11],"maj7♯5":[0,4,8,11],"7♯11":[0,4,7,10,6],"°7":[0,3,6,9]};
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];
  function pc(n){ return ((n % 12) + 12) % 12; }
  function chordName(root, quality){ return NAMES[pc(root)] + quality; }
  function scaleFor(row, degree){ return row.modes[degree]; }
  function scaleNotes(root, id){ return SCALE[id].map(function(i){ return pc(root + i); }); }
  function chordNotes(root, quality){ return (INTERVALS[quality] || INTERVALS["7"]).map(function(i){ return pc(root + i); }); }
  function piano(root, notes, chord) {
    var out = '<div class="csd-piano" aria-label="Piano con notas de la escala">';
    for(var i=0;i<24;i++){var tone=pc(root+i); var black=[1,3,6,8,10].indexOf(tone)>-1; out += '<span class="'+(black?'black ':'white ')+(notes.indexOf(tone)>-1?'scale ':'')+(chord.indexOf(tone)>-1?'chord ':'')+'" title="'+NAMES[tone]+'">'+(!black?'<i>'+NAMES[tone]+'</i>':'')+'</span>';}
    return out+'</div>';
  }
  function fretboard(root, notes, chord) {
    /* Mismo SVG compacto, codificación y posición que el laboratorio de Jazz/Armonía Funcional. */
    var strings=[1,2,3,4,5,6], open={1:4,2:11,3:7,4:2,5:9,6:4}, start=4,end=9,left=44,top=34,fret=54,gap=27,cols=end-start+1,width=left+cols*fret+20,height=215;
    var svg=['<svg class="lab-fretboard csd-fretboard" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Diapasón: trastes '+start+'–'+end+'">'];
    svg.push('<text x="'+left+'" y="16" fill="rgba(255,250,240,.62)" font-size="11">Posición de escala · trastes '+start+'–'+end+'</text>');
    for(var f=start;f<=end+1;f++){var x=left+(f-start)*fret;svg.push('<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+gap*5)+'" stroke="rgba(255,255,255,.25)"/>');if(f<=end)svg.push('<text x="'+(x+fret/2)+'" y="'+(top+gap*5+22)+'" text-anchor="middle" fill="rgba(255,250,240,.5)" font-size="10">'+f+'</text>');}
    for(var s=0;s<6;s++){var y=top+s*gap;svg.push('<line x1="'+left+'" y1="'+y+'" x2="'+(left+fret*cols)+'" y2="'+y+'" stroke="rgba(255,255,255,.46)" stroke-width="'+(2-s*.18)+'"/><text x="10" y="'+(y+4)+'" fill="rgba(255,250,240,.55)" font-size="10">'+strings[s]+'ª</text>');}
    for(var si=0;si<6;si++)for(var fr=start;fr<=end;fr++){var tone=pc(open[strings[si]]+fr);if(notes.indexOf(tone)<0)continue;var x2=left+(fr-start)*fret+fret/2,y2=top+si*gap,isChord=chord.indexOf(tone)>-1,isRoot=tone===root,color=isRoot?'#4caf6a':isChord?'#4a90d9':'#e0b93c';svg.push('<circle cx="'+x2+'" cy="'+y2+'" r="12" fill="'+color+'" stroke="#171513" stroke-width="2"/><text x="'+x2+'" y="'+(y2+4)+'" text-anchor="middle" fill="#171513" font-size="9" font-weight="800">'+NAMES[tone]+'</text>');}
    return svg.join('')+'</svg>';
  }
  function alternatives(quality, primary) {
    var result=[primary];
    if(quality==="maj7") result.push("lydian");
    if(quality==="m7") result.push("dorian", "aeolian");
    if(quality==="7") result.push("mixolydian", "altered", "diminishedHW");
    if(quality==="m7♭5") result.push("locrian", "melodicMinor");
    if(quality==="7♯11") result.push("lydian", "wholeTone");
    if(quality==="maj7♯5") result.push("melodicMinor", "wholeTone");
    if(quality==="°7") result.push("diminishedHW");
    return result.filter(function(v,i,a){return SCALE[v] && a.indexOf(v)===i;});
  }
  function mount(el) {
    if(!el) return;
    var state={key:0,row:0,degree:0,alternative:0,libraryScale:""};
    function selected(){var row=ROWS[state.row], offset=SCALE[row.scale][state.degree], root=pc(state.key+offset), quality=row.qualities[state.degree], primary=scaleFor(row,state.degree), options=alternatives(quality,primary), scale=state.libraryScale||options[state.alternative]||primary; return {row:row,root:root,quality:quality,primary:primary,options:options,scale:scale};}
    function render(){
      var pick=selected(), notes=scaleNotes(pick.root,pick.scale), chord=chordNotes(pick.root,pick.quality);
      var table='<div class="csd-table-wrap"><table class="csd-table"><thead><tr><th>Colección</th>'+ROMAN.map(function(r){return '<th>'+r+'</th>';}).join('')+'</tr></thead><tbody>';
      ROWS.forEach(function(row,ri){table+='<tr><th>'+row.name+'</th>';row.qualities.forEach(function(q,di){var root=pc(state.key+SCALE[row.scale][di]), active=ri===state.row&&di===state.degree;table+='<td><button class="csd-cell '+(active?'active':'')+'" data-row="'+ri+'" data-degree="'+di+'"><b>'+chordName(root,q)+'</b><small>'+SCALE_NAMES[scaleFor(row,di)]+'</small></button></td>';});table+='</tr>';});table+='</tbody></table></div>';
      var libraryOptions=Object.keys(SCALE).sort(function(a,b){return SCALE_NAMES[a].localeCompare(SCALE_NAMES[b]);});
      el.innerHTML='<section class="csd"><header><div><p class="kicker">Mapa de improvisación</p><h3>Diccionario escala–acorde</h3><p>Selecciona una tonalidad y una celda. Las escalas sugeridas son puntos de partida: confirma siempre la melodía, función y resolución.</p></div><div class="csd-selectors"><label>Tonalidad <select data-key>'+NAMES.map(function(n,i){return '<option value="'+i+'" '+(i===state.key?'selected':'')+'>'+n+'</option>';}).join('')+'</select></label><label>Explorar escala / modo <select data-library-scale><option value="">Sugerencias del acorde</option>'+libraryOptions.map(function(id){return '<option value="'+id+'" '+(id===state.libraryScale?'selected':'')+'>'+SCALE_NAMES[id]+'</option>';}).join('')+'</select></label></div></header>'+table+'<div class="csd-detail"><div><p class="kicker">'+pick.row.name+' · grado '+ROMAN[state.degree]+'</p><h3>'+chordName(pick.root,pick.quality)+'</h3><p class="csd-tones">Notas del acorde: <b>'+chord.map(function(n){return NAMES[n];}).join(' · ')+'</b></p><div class="csd-scales">'+pick.options.map(function(id,i){return '<button data-scale="'+i+'" class="'+(!state.libraryScale&&i===state.alternative?'active':'')+'">'+SCALE_NAMES[id]+'<small>'+scaleNotes(pick.root,id).map(function(n){return NAMES[n];}).join(' · ')+'</small></button>';}).join('')+'</div><p class="small-note">Escala activa: <b>'+SCALE_NAMES[pick.scale]+'</b>. El menú «Explorar escala / modo» reúne todas las escalas y modos del laboratorio; úsalo para estudiar la colección, y las tarjetas para partir de una opción apropiada para el acorde.</p><div class="csd-actions"><button data-play="chord">▶ Escuchar acorde</button><button data-play="scale">▶ Escuchar escala</button></div></div><div class="csd-visuals"><div><h4>Piano</h4>'+piano(pick.root,notes,chord)+'</div><div><h4>Diapasón</h4>'+fretboard(pick.root,notes,chord)+'</div></div></div></section>';
      el.querySelector('[data-key]').onchange=function(e){state.key=Number(e.target.value);state.alternative=0;state.libraryScale="";render();};
      el.querySelector('[data-library-scale]').onchange=function(e){state.libraryScale=e.target.value;render();};
      el.querySelectorAll('[data-row]').forEach(function(btn){btn.onclick=function(){state.row=Number(btn.dataset.row);state.degree=Number(btn.dataset.degree);state.alternative=0;state.libraryScale="";render();};});
      el.querySelectorAll('[data-scale]').forEach(function(btn){btn.onclick=function(){state.alternative=Number(btn.dataset.scale);state.libraryScale="";render();};});
      el.querySelectorAll('[data-play]').forEach(function(btn){btn.onclick=function(){if(!global.TheoryVisuals)return;var midi=(btn.dataset.play==='chord'?chord:notes).map(function(n,i){return 60+n+(btn.dataset.play==='scale'?i*0:0);});global.TheoryVisuals.playNotes(midi,{melodic:btn.dataset.play==='scale',duration:btn.dataset.play==='scale'?.3:1.3,gain:.55});};});
    }
    render();
  }
  global.ChordScaleDictionary={mount:mount,ROWS:ROWS,SCALE:SCALE,chordName:chordName,scaleNotes:scaleNotes};
  if(typeof module!=="undefined") module.exports=global.ChordScaleDictionary;
})(typeof window!=="undefined"?window:globalThis);
