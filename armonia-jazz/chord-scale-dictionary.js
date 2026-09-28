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
  var INTERVAL_NAMES={0:"1",1:"♭2",2:"2",3:"♭3",4:"3",5:"4",6:"♭5",7:"5",8:"♭6",9:"6",10:"♭7",11:"7"};
  var TENSION_NAMES={1:"♭9",2:"9",3:"♯9",5:"11",6:"♯11",8:"♭13",9:"13"};
  function modeIntervals(scale, degree){
    var source=SCALE[scale], base=source[degree], out=[];
    for(var i=0;i<source.length;i++) out.push(pc(source[(degree+i)%source.length]-base));
    return out;
  }
  function qualityFromIntervals(intervals){
    var key=intervals.join(","), known={"0,4,7,11":"maj7","0,3,7,10":"m7","0,4,7,10":"7","0,3,6,10":"m7♭5","0,3,7,11":"m(maj7)","0,4,8,11":"maj7♯5","0,3,6,9":"°7","0,4,8,10":"7♯5","0,4,6,10":"7♯11"};
    return known[key] || "("+intervals.map(function(n){return INTERVAL_NAMES[n];}).join("–")+")";
  }
  function generatedRow(scaleId){
    var source=SCALE[scaleId], modes=[], qualities=[], chords=[];
    for(var d=0;d<source.length;d++){
      var mode=modeIntervals(scaleId,d), key="generated-"+scaleId+"-"+d;
      SCALE[key]=mode; SCALE_NAMES[key]=SCALE_NAMES[scaleId]+" · modo "+(d+1);
      modes.push(key);
      var chord=[]; for(var step=0;step<4;step++) chord.push(mode[(step*2)%mode.length]);
      qualities.push(qualityFromIntervals(chord)); chords.push(chord);
    }
    return {id:"generated-"+scaleId,name:SCALE_NAMES[scaleId],scale:scaleId,qualities:qualities,modes:modes,chords:chords};
  }
  function allRows(){
    var known={}; ROWS.forEach(function(row){known[row.scale]=true;});
    return ROWS.concat(Object.keys(SCALE).filter(function(id){return !known[id]&&id.indexOf("generated-")!==0;}).sort(function(a,b){return SCALE_NAMES[a].localeCompare(SCALE_NAMES[b]);}).map(generatedRow));
  }
  function tensions(notes, chord, root){
    return notes.filter(function(n){return chord.indexOf(n)<0;}).map(function(n){var rel=pc(n-root);return TENSION_NAMES[rel]||INTERVAL_NAMES[rel];}).filter(function(v,i,a){return a.indexOf(v)===i;});
  }
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
    var baseIds=ROWS.map(function(row){return row.scale;}), state={key:0,rowId:"major",degree:0,alternative:0,shown:baseIds.slice(),pickerOpen:false};
    function selected(rows){var row=rows.filter(function(item){return item.id===state.rowId;})[0]||rows[0], offset=SCALE[row.scale][state.degree], root=pc(state.key+offset), quality=row.qualities[state.degree], primary=scaleFor(row,state.degree), options=alternatives(quality,primary), scale=options[state.alternative]||primary, chordIntervals=row.chords?row.chords[state.degree]:(INTERVALS[quality]||INTERVALS["7"]); return {row:row,root:root,quality:quality,primary:primary,options:options,scale:scale,chordIntervals:chordIntervals};}
    function render(){
      var rows=allRows(), visible=rows.filter(function(row){return state.shown.indexOf(row.scale)>-1;}), pick=selected(visible.length?visible:rows), notes=scaleNotes(pick.root,pick.scale), chord=pick.chordIntervals.map(function(interval){return pc(pick.root+interval);}), available=tensions(notes,chord,pick.root);
      var table='<div class="csd-table-wrap"><table class="csd-table"><tbody>';
      visible.forEach(function(row){table+='<tr><th scope="row">'+row.name+'<small>'+row.qualities.length+' grados</small></th>';row.qualities.forEach(function(q,di){var root=pc(state.key+SCALE[row.scale][di]), active=row.id===pick.row.id&&di===state.degree;table+='<td><button class="csd-cell '+(active?'active':'')+'" data-row="'+row.id+'" data-degree="'+di+'"><em>'+ROMAN[di]||("G"+(di+1))+'</em><b>'+chordName(root,q)+'</b><small>'+SCALE_NAMES[scaleFor(row,di)]+'</small></button></td>';});table+='</tr>';});
      if(!visible.length)table+='<tr><td class="csd-empty" colspan="9">No hay escalas seleccionadas. Abre “Escalas en tabla” para elegir una o pulsa “Campos principales”.</td></tr>';
      table+='</tbody></table></div>';
      var libraryOptions=Object.keys(SCALE).filter(function(id){return id.indexOf("generated-")!==0;}).sort(function(a,b){return SCALE_NAMES[a].localeCompare(SCALE_NAMES[b]);});
      var chordPiano=global.ChordRef?global.ChordRef.pianoSVG(chord,pick.root):piano(pick.root,chord,chord), chordGuitar=global.ChordRef&&global.ChordRef.guitarShapeSVG?global.ChordRef.guitarShapeSVG(pick.chordIntervals,pick.root):fretboard(pick.root,chord,chord), scalePiano=global.ChordRef?global.ChordRef.pianoSVG(notes,pick.root):piano(pick.root,notes,chord), scaleGuitar=fretboard(pick.root,notes,chord);
      el.innerHTML='<section class="csd"><header><div><p class="kicker">Mapa de improvisación</p><h3>Diccionario escala–acorde</h3><p>Selecciona una tonalidad y una celda. Las escalas sugeridas son puntos de partida: confirma siempre la melodía, función y resolución.</p></div><div class="csd-selectors"><label>Tonalidad <select data-key>'+NAMES.map(function(n,i){return '<option value="'+i+'" '+(i===state.key?'selected':'')+'>'+n+'</option>';}).join('')+'</select></label><details class="csd-scale-picker" '+(state.pickerOpen?'open':'')+'><summary>Escalas en tabla · '+visible.length+' de '+rows.length+'</summary><div><button type="button" data-show-all>Todas las escalas</button><button type="button" data-show-base>Campos principales</button><button type="button" data-show-none>Deseleccionar escalas</button><div class="csd-scale-checks">'+libraryOptions.map(function(id){return '<label><input type="checkbox" data-show-scale="'+id+'" '+(state.shown.indexOf(id)>-1?'checked':'')+'> '+SCALE_NAMES[id]+'</label>';}).join('')+'</div></div></details></div></header>'+table+'<div class="csd-detail"><div><p class="kicker">'+pick.row.name+' · grado '+(ROMAN[state.degree]||("G"+(state.degree+1)))+'</p><h3>'+chordName(pick.root,pick.quality)+'</h3><p class="csd-tones">Notas del acorde: <b>'+chord.map(function(n){return NAMES[n];}).join(' · ')+'</b></p><div class="csd-scales">'+pick.options.map(function(id,i){return '<button data-scale="'+i+'" class="'+(i===state.alternative?'active':'')+'">'+SCALE_NAMES[id]+'<small>'+scaleNotes(pick.root,id).map(function(n){return NAMES[n];}).join(' · ')+'</small></button>';}).join('')+'</div><p class="csd-tensions"><b>Tensiones disponibles:</b> '+(available.length?available.join(' · '):'No añade tensiones fuera de la estructura.')+'</p><p class="small-note">Escala activa: <b>'+SCALE_NAMES[pick.scale]+'</b>. Estas tensiones se derivan de la colección activa; elige según melodía, función y resolución.</p><div class="csd-actions"><button data-play="chord">▶ Escuchar acorde</button><button data-play="scale">▶ Escuchar escala</button></div></div><div class="csd-visuals"><div><h4>Acorde · Piano</h4>'+chordPiano+'</div><div><h4>Acorde · Diapasón</h4>'+chordGuitar+'</div><div><h4>Escala y tensiones · Piano</h4>'+scalePiano+'</div><div><h4>Escala y tensiones · Diapasón</h4>'+scaleGuitar+'</div></div></div></section>';
      el.querySelector('[data-key]').onchange=function(e){state.key=Number(e.target.value);state.alternative=0;state.pickerOpen=false;render();};
      el.querySelector('[data-show-all]').onclick=function(){state.shown=rows.map(function(row){return row.scale;});state.pickerOpen=true;render();};
      el.querySelector('[data-show-base]').onclick=function(){state.shown=baseIds.slice();state.pickerOpen=true;render();};
      el.querySelector('[data-show-none]').onclick=function(){state.shown=[];state.pickerOpen=true;render();};
      el.querySelectorAll('[data-show-scale]').forEach(function(box){box.onchange=function(){var id=box.dataset.showScale;if(box.checked&&state.shown.indexOf(id)<0)state.shown.push(id);if(!box.checked)state.shown=state.shown.filter(function(item){return item!==id;});state.pickerOpen=true;render();};});
      el.querySelectorAll('[data-row]').forEach(function(btn){btn.onclick=function(){state.rowId=btn.dataset.row;state.degree=Number(btn.dataset.degree);state.alternative=0;state.pickerOpen=false;render();};});
      el.querySelectorAll('[data-scale]').forEach(function(btn){btn.onclick=function(){state.alternative=Number(btn.dataset.scale);state.pickerOpen=false;render();};});
      el.querySelectorAll('[data-play]').forEach(function(btn){btn.onclick=function(){if(!global.TheoryVisuals)return;var midi=(btn.dataset.play==='chord'?chord:notes).map(function(n,i){return 60+n+(btn.dataset.play==='scale'?i*0:0);});global.TheoryVisuals.playNotes(midi,{melodic:btn.dataset.play==='scale',duration:btn.dataset.play==='scale'?.3:1.3,gain:.55});};});
    }
    render();
  }
  global.ChordScaleDictionary={mount:mount,ROWS:ROWS,SCALE:SCALE,chordName:chordName,scaleNotes:scaleNotes,allRows:allRows};
  if(typeof module!=="undefined") module.exports=global.ChordScaleDictionary;
})(typeof window!=="undefined"?window:globalThis);
