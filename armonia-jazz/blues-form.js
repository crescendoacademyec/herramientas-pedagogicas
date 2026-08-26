/* Formas armónicas de estudio: blues y turnaround, legibles por compases. */
(function (global) {
  "use strict";
  var NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
  var FORMS = {
    major: {
      title: "Blues mayor", note: "Forma básica: I7 y IV7 son colores propios del blues; V7 prepara el regreso.",
      bars: [[0,"7","I7"],[5,"7","IV7"],[0,"7","I7"],[0,"7","I7"],[5,"7","IV7"],[5,"7","IV7"],[0,"7","I7"],[0,"7","I7"],[7,"7","V7"],[5,"7","IV7"],[0,"7","I7"],[7,"7","V7"]]
    },
    minor: {
      title: "Blues menor", note: "El iiø–V7alt de los compases 9–10 conduce de nuevo al i menor.",
      bars: [[0,"m7","im7"],[0,"m7","im7"],[0,"m7","im7"],[0,"m7","im7"],[5,"m7","ivm7"],[5,"m7","ivm7"],[0,"m7","im7"],[0,"m7","im7"],[2,"m7♭5","iiø7"],[7,"7alt","V7alt"],[0,"m7","im7"],[7,"7alt","V7alt"]]
    },
    turnaround: {
      title: "Blues mayor con turnaround bebop", note: "Los últimos cuatro compases condensan movimientos de ciclo de quintas para volver al I.",
      bars: [[0,"7","I7"],[5,"7","IV7"],[0,"7","I7"],[0,"7","I7"],[5,"7","IV7"],[5,"7","IV7"],[0,"7","I7"],[0,"7","I7"],[4,"m7 · ","iii7 · " ,9,"7","VI7"],[2,"m7 · ","ii7 · ",7,"7","V7"],[0,"7 · ","I7 · ",9,"7","VI7"],[2,"m7 · ","ii7 · ",7,"7","V7"]]
    }
  };
  function chord(root, suffix) { return NAMES[root % 12] + suffix; }
  function barText(bar, tonic, degrees) {
    if (bar.length > 3) return degrees ? bar[2] + bar[5] : chord(tonic + bar[0], bar[1]) + bar[2] + chord(tonic + bar[3], bar[4]);
    return degrees ? bar[2] : chord(tonic + bar[0], bar[1]);
  }
  function controls(root, variants, showVariant) {
    var html = '<div class="form-study-controls">';
    if (showVariant) html += '<label>Variante<select data-form="variant"></select></label>';
    html += '<label>Tonalidad<select data-form="tonic"></select></label><label>Lectura<select data-form="notation"><option value="chords">Acordes</option><option value="degrees">Solo grados</option></select></label></div>';
    return html;
  }
  function mount(rootEl) {
    var state = { variant:"major", tonic:0, degrees:false };
    rootEl.innerHTML = '<section class="form-study" aria-label="Blues interactivo"><div class="form-study-head"><h3>Blues de 12 compases</h3><p>Una forma por compases, no una cadena de texto.</p></div>'+controls(rootEl, FORMS, true)+'<div class="blues-chart" data-form="chart"></div><div class="form-study-foot" data-form="note"></div></section>';
    var variant=rootEl.querySelector('[data-form="variant"]'), tonic=rootEl.querySelector('[data-form="tonic"]'), notation=rootEl.querySelector('[data-form="notation"]');
    Object.keys(FORMS).forEach(function(key){variant.add(new Option(FORMS[key].title,key));});NAMES.forEach(function(name,pc){tonic.add(new Option(name,pc));});
    function render(){var form=FORMS[state.variant],chart=rootEl.querySelector('[data-form="chart"]');variant.value=state.variant;tonic.value=state.tonic;notation.value=state.degrees?"degrees":"chords";chart.innerHTML="";form.bars.forEach(function(bar,index){var cell=document.createElement("article");cell.className="blues-bar";cell.innerHTML='<span class="blues-number">COMPÁS '+(index+1)+'</span><strong class="blues-chord">'+barText(bar,state.tonic,state.degrees)+'</strong>'+(!state.degrees?'<span class="blues-degree">'+barText(bar,state.tonic,true)+'</span>':'');chart.appendChild(cell);});rootEl.querySelector('[data-form="note"]').textContent=form.note;}
    variant.addEventListener("change",function(){state.variant=this.value;render();});tonic.addEventListener("change",function(){state.tonic=Number(this.value);render();});notation.addEventListener("change",function(){state.degrees=this.value==="degrees";render();});render();
  }
  function mountTurnaround(rootEl) {
    var state={tonic:0,degrees:false}, bars=[[0,"maj7","Imaj7"],[9,"7","VI7"],[2,"m7","ii7"],[7,"7","V7"]];
    rootEl.innerHTML='<section class="form-study" aria-label="Turnaround interactivo"><div class="form-study-head"><h3>Turnaround I–VI–ii–V</h3><p>Transpón la forma y alterna entre cifrado y análisis funcional.</p></div>'+controls(rootEl,null,false)+'<div class="blues-chart turnaround-chart" data-form="chart"></div><div class="form-study-foot">Variante básica; las sustituciones y el turnaround cromático se explican en el texto del tema.</div></section>';
    var tonic=rootEl.querySelector('[data-form="tonic"]'),notation=rootEl.querySelector('[data-form="notation"]');NAMES.forEach(function(name,pc){tonic.add(new Option(name,pc));});
    function render(){var chart=rootEl.querySelector('[data-form="chart"]');tonic.value=state.tonic;notation.value=state.degrees?"degrees":"chords";chart.innerHTML="";bars.forEach(function(bar,index){var cell=document.createElement("article");cell.className="blues-bar";cell.innerHTML='<span class="blues-number">PULSO '+(index+1)+'</span><strong class="blues-chord">'+barText(bar,state.tonic,state.degrees)+'</strong>'+(!state.degrees?'<span class="blues-degree">'+bar[2]+'</span>':'');chart.appendChild(cell);});}tonic.addEventListener("change",function(){state.tonic=Number(this.value);render();});notation.addEventListener("change",function(){state.degrees=this.value==="degrees";render();});render();
  }
  global.BluesForm={mount:mount,mountTurnaround:mountTurnaround};
})(window);
