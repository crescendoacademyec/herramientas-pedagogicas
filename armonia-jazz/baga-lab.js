(function () {
  "use strict";
  const api=window.CrescendoPianoVoicings, P=window.CrescendoPractice;
  if(!api||!P||typeof LEVELS==="undefined")return;

  LEVELS[2].topics.push({
    title:"3.13 Sistema Baga A/B: enlace rootless, drops y melodía",
    html:`<p><b>Baga A/B</b> es el nombre pedagógico usado en el método estudiado para dos familias de disposiciones sin fundamental. No designa una calidad de acorde nueva ni equivale siempre a un m7(9): en un ii–V–I mayor combina <b>iim9, V13 e I6/9</b>.</p>
      <div class="baga-formulas"><div><b>ii · Baga A</b><span>♭3–5–♭7–9</span></div><div><b>V · Baga A</b><span>♭7–9–3–13</span></div><div><b>I · Baga A</b><span>3–5–6–9</span></div><div><b>ii · Baga B</b><span>♭7–9–♭3–5</span></div><div><b>V · Baga B</b><span>3–13–♭7–9</span></div><div><b>I · Baga B</b><span>6–9–3–5</span></div></div>
      <p>La fundamental queda en el contrabajo o se añade por separado en piano solo. A y B contienen las mismas clases de altura dentro de cada función, pero cambian registro y orden para facilitar el <b>voice leading</b>. No confundas esta nomenclatura de progresión con otras convenciones A/B que clasifican cada acorde aislado desde la 3ª o la 7ª.</p>
      <h4>Drop 2 y distribución entre manos</h4><p>El Drop 2 baja una octava la segunda voz contada desde arriba. No cambia la identidad armónica: abre el registro y suele dejar una nota guía en la izquierda y tres voces en la derecha. El laboratorio permite comparar la posición original con esa apertura.</p>
      <h4>La melodía como voz superior</h4><p>Para armonizar una melodía con bloques, la nota melódica debe quedar en la voz superior. Reordena las mismas notas, conserva la función y escoge el enlace que produzca el menor movimiento posible. Si una nota melódica no pertenece al voicing, antes debes decidir si funcionará como tensión, sustitución u ornamentación.</p>
      <h4>Perspectiva y estructuras superiores</h4><p>Un mismo bloque de cuatro notas puede recibir otro nombre al cambiar el bajo. Esa ambigüedad debe analizarse por bajo, función y contexto. Las tríadas superiores se estudian con detalle en 4.2; aquí conviene dominar primero el núcleo rootless y su conducción.</p>
      <div data-baga-lab></div>`
  });

  const roots=api.roots, mod=n=>(n%12+12)%12, esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let player=null,ctx=null,voices=[],loading=null,audioToken=0;
  function respellOctave(note,midi){const octave=note.octave+(midi-note.midi)/12,glyph=note.alter<0?'♭'.repeat(-note.alter):'♯'.repeat(note.alter);return {...note,midi,octave,label:note.letter+glyph+octave};}
  function drop2(notes){const n=notes.map(x=>({...x})).sort((a,b)=>a.midi-b.midi),dropped=n[n.length-2];n[n.length-2]=respellOctave(dropped,dropped.midi-12);return n.sort((a,b)=>a.midi-b.midi).map((x,i)=>({...x,hand:i?'right':'left'}));}
  function withTop(notes,pc){const targetBase=notes.find(n=>mod(n.midi)===pc);if(!targetBase)return notes;let top=targetBase.midi;while(top<67)top+=12;const arranged=notes.map(n=>{if(mod(n.midi)===pc)return respellOctave(n,top);let midi=top-mod(top-n.midi);if(midi===top)midi-=12;return respellOctave(n,midi);}).sort((a,b)=>a.midi-b.midi);return arranged.map((n,i)=>({...n,hand:i<Math.max(1,arranged.length-3)?'left':'right'}));}
  function scoreNotes(notes){return notes.map(n=>({midi:n.midi,diatonic:n.octave*7+"CDEFGAB".indexOf(n.letter),alter:n.alter}));}
  function miniPiano(notes){const active=new Map(notes.map(n=>[mod(n.midi),n.hand]));const whites=[0,2,4,5,7,9,11,12,14,16,17,19,21,23], blacks=[1,3,6,8,10,13,15,18,20,22], blackX=[1,2,4,5,6,8,9,11,12,13];return `<div class="baga-piano">${whites.map((pc,i)=>`<i class="white ${active.has(mod(pc))?active.get(mod(pc)):''}" style="left:${i/14*100}%"></i>`).join("")}${blacks.map((pc,i)=>`<i class="black ${active.has(mod(pc))?active.get(mod(pc)):''}" style="left:${blackX[i]/14*100}%"></i>`).join("")}</div>`;}
  function movement(a,b){const x=a.map(n=>n.midi).sort((p,q)=>p-q),y=b.map(n=>n.midi).sort((p,q)=>p-q);return x.map((n,i)=>{let d=y[i]-n;while(d>6)d-=12;while(d<-6)d+=12;return d>0?`+${d}`:String(d);}).join(" · ");}
  async function play(groups){
    stop();const token=audioToken;
    ctx||=new(window.AudioContext||window.webkitAudioContext)();await ctx.resume();
    loading||=Soundfont.instrument(ctx,"acoustic_grand_piano",{soundfont:"MusyngKite"});
    player=await loading;if(token!==audioToken)return;
    const start=ctx.currentTime+.03;
    groups.forEach((notes,i)=>notes.forEach(n=>voices.push(player.play(n.midi,start+i*2,{duration:1.8,gain:.7}))));
  }
  function stop(){audioToken++;voices.forEach(v=>{try{v.stop();}catch(_){}});voices=[];}


  function mount(scope){
    const host=scope.querySelector("[data-baga-lab]");if(!host||host.dataset.ready)return;host.dataset.ready="1";
    host.className="baga-lab";host.innerHTML=`<div class="baga-controls"><label>Tonalidad<select data-root>${roots.map((r,i)=>`<option value="${i}">${r}</option>`).join("")}</select></label><label>Familia<select data-family><option value="baga-a">Baga A</option><option value="baga-b">Baga B</option></select></label><label>Disposición<select data-drop><option value="close">Original</option><option value="drop2">Drop 2</option></select></label><label><input type="checkbox" data-bass> Añadir fundamental</label></div><div class="baga-progression" data-progression></div><div class="baga-detail"><div><label>Nota superior<select data-top></select></label><div data-score></div></div><div><h4 data-title></h4><p data-notes></p><div data-keyboard></div><p data-movement></p></div></div><div class="baga-actions"><button data-play>▶ Acorde</button><button data-sequence>▶ ii–V–I</button><button data-stop>■ Detener</button><a data-piano>Practicar en Piano Virtual →</a></div>`;
    let selected=0,seq=[];
    const get=s=>host.querySelector(s);
    function render(){
      stop();const root=Number(get("[data-root]").value),style=get("[data-family]").value,useDrop=get("[data-drop]").value==="drop2";
      seq=api.progression(root,false,style,true).map(v=>({...v,notes:useDrop?drop2(v.notes):v.notes}));
      get("[data-progression]").innerHTML=seq.map((v,i)=>`<button type="button" data-step="${i}" class="${i===selected?'active':''}"><b>${esc(v.roman)}</b><span>${esc(v.symbol)}</span><small>${esc(v.notes.map(n=>n.degree).join('–'))}</small>${miniPiano(v.notes)}</button>`).join("");
      const current=seq[selected], chordRoot=mod(root+[2,7,0][selected]);
      const choices=[...new Map(current.notes.map(n=>[mod(n.midi),n])).values()];const previous=Number(get("[data-top]").value);get("[data-top]").innerHTML=choices.map(n=>`<option value="${mod(n.midi)}">${esc(n.label.replace(/-?\d+$/,''))} · ${esc(n.degree)}</option>`).join("");if(choices.some(n=>mod(n.midi)===previous))get("[data-top]").value=previous;
      let notes=withTop(current.notes,Number(get("[data-top]").value));if(get("[data-bass]").checked){const midi=36+chordRoot;notes=[{...api.spell(midi,chordRoot,1),degree:1,hand:'left'},...notes];}
      host._notes=notes;get("[data-title]").textContent=current.roman+" · "+current.symbol;get("[data-notes]").textContent=notes.map(n=>n.label+" ("+n.degree+")").join(" · ");get("[data-keyboard]").innerHTML=miniPiano(notes);get("[data-score]").innerHTML=P.staff(scoreNotes(notes),{stack:true,clef:notes.some(n=>n.midi<52)?'bass':'treble'});get("[data-movement]").textContent=selected?"Movimiento desde el acorde anterior: "+movement(seq[selected-1].notes,current.notes)+" semitonos por voz.":"Compara la misma familia a lo largo del ii–V–I.";
      get("[data-piano]").href="../piano-virtual/index.html?"+new URLSearchParams({bank:"progression",root,style});
      host.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>{selected=Number(b.dataset.step);render();});
    }
    host.querySelectorAll("select,input").forEach(el=>el.onchange=render);get("[data-play]").onclick=()=>play([host._notes]);get("[data-sequence]").onclick=()=>play(seq.map(v=>v.notes));get("[data-stop]").onclick=stop;render();
  }
  window.CrescendoBagaLab={mount};
})();
