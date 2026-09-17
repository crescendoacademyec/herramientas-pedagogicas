(function () {
  'use strict';
  const api=window.CrescendoPianoVoicings, patterns=window.CrescendoChordPatterns;
  const panel=document.getElementById('chordBank'), host=document.getElementById('chordBankContent');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const options=items=>items.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('');
  host.innerHTML=`<div class="bank-tabs" aria-label="Tipo de práctica">
    <button data-tab="build" aria-pressed="true">Construir acordes</button><button data-tab="jazz" aria-pressed="false">Voicings jazz</button><button data-tab="progression" aria-pressed="false">Progresiones</button></div>
    <div class="bank-controls">
      <label>Fundamental / tonalidad<select id="bankRoot">${options(api.roots.map((r,i)=>[i,r]))}</select></label>
      <label data-for="build">Familia del detector<select id="bankPattern">${options(patterns.map((p,i)=>[i,p.name||'Mayor']))}</select></label>
      <label data-for="build">Notas a construir<select id="bankFormula">${options([['pattern','Patrón del detector'],['full','Fórmula extendida completa']])}</select></label>
      <label data-for="jazz">Voicing<select id="bankVoicing">${options(api.presets.map(p=>[p.id,p.label]))}</select></label>
      <label data-for="build jazz">Inversión<select id="bankInversion"></select></label>
      <label data-for="build jazz">Registro<select id="bankRegister">${options([[-1,'Una octava abajo'],[0,'Registro central'],[1,'Una octava arriba']])}</select></label>
      <label data-for="jazz">Disposición de sextas y disminuidos<select id="bankOpen">${options([[0,'Cerrada'],[1,'Abierta · drop 2']])}</select></label>
      <label data-for="jazz">Rootless: reparto<select id="bankHands">${options([['both','Dos manos'],['left','Mano izquierda']])}</select></label>
      <label data-for="progression">Modo<select id="bankMinor">${options([[0,'Mayor'],[1,'Menor']])}</select></label>
      <label data-for="progression">Familia<select id="bankStyle">${options([['rootless','Rootless'],['shell','Shells / estructura básica'],['sixth','Sextas y disminuidos']])}</select></label>
      <label data-for="progression">Registro del enlace<select id="bankSmooth">${options([[1,'Acercar registros'],[0,'Registro de partida']])}</select></label>
      <label>Tempo de práctica (BPM)<input id="bankTempo" type="number" min="30" max="180" value="70"></label>
    </div>
    <div class="bank-steps" id="bankSteps"></div>
    <div class="bank-display"><div class="bank-score" id="bankScore" role="img" aria-label="Voicing en gran pentagrama"><div data-live-score></div><div data-live-labels></div></div>
      <div><h2 id="bankTitle"></h2><p class="bank-help" id="bankHelp"></p><ul class="bank-note-list" id="bankNotes"></ul>
      <p class="bank-note">Azul: mano izquierda · Dorado: mano derecha · Verde: sonando. Reparto sugerido, ajustable a tu mano. El cifrado objetivo se mantiene aunque el detector encuentre un nombre equivalente.</p></div></div>
    <div class="bank-preview-scroll"><div class="bank-preview" id="bankKeyboard" role="img" aria-label="88 teclas: posiciones del acorde, de La0 a Do8"></div></div>
    <div class="bank-actions"><button class="bank-primary" data-action="play">Escuchar acorde</button><button data-action="arpeggio">Escuchar arpegio</button><button data-action="stop">Detener</button>
    <button data-action="add" data-for="build">Añadir siguiente nota</button><button data-action="clear" data-for="build">Empezar desde cero</button><button data-action="all" data-for="build">Mostrar completo</button>
    <button data-action="sequence" data-for="progression">Escuchar ii–V–I</button><button data-action="pro">Mostrar 88 teclas del piano</button><button data-action="check">Comprobar lo que toco</button></div>
    <p class="bank-status" id="bankStatus" role="status" aria-live="polite"></p>
    <p class="bank-note">La comprobación usa las teclas pulsadas (ratón, teclado o MIDI), con octavas exactas; no evalúa el pedal. Para tensiones y omisiones, distingue siempre fórmula teórica de voicing. En progresiones, «Acercar registros» transpone octavas: no calcula una digitación óptima.</p>
    <a href="../armonia-jazz/index.html">Estudiar la explicación en Armonía Jazz →</a>`;
  const $=id=>document.getElementById('bank'+id);
  $('Pattern').value='1';$('Register').value='0';
  const state={tab:'build',step:0,count:Infinity};
  let current,sequence=[],staff=null,timers=[],voices=[],generation=0;
  const sounding=new Set(), pressed=new Set();
  function status(t){$('Status').textContent=t;}
  function highlight(){
    const notes=panel.open?(current?.notes||[]):[];
    document.querySelectorAll('#keyboard [data-midi]').forEach(k=>{
      const midi=Number(k.dataset.midi),n=notes.find(n=>n.midi===midi);
      k.classList.toggle('bank-left',n?.hand==='left');k.classList.toggle('bank-right',n?.hand==='right');k.classList.toggle('bank-sounding',panel.open&&sounding.has(midi));
    });
    $('Keyboard').querySelectorAll('[data-midi]').forEach(k=>k.classList.toggle('sounding',sounding.has(Number(k.dataset.midi))));
  }
  function stop(){generation++;timers.forEach(clearTimeout);timers=[];voices.forEach(v=>{try{v.stop();}catch(_){}});voices=[];sounding.clear();highlight();}
  function later(fn,ms){timers.push(setTimeout(fn,ms));}
  function preview(notes){
    const white=m=>![1,3,6,8,10].includes(m%12);let wi=0,keys=[];
    for(let m=21;m<=108;m++) {
      const w=white(m),n=notes.find(n=>n.midi===m),x=w?wi:wi-.3;
      keys.push(`<span class="bank-key ${w?'':'black'} ${n?.hand||''}" data-midi="${m}" style="left:${x*100/52}%;width:${(w?1:.6)*100/52}%" title="${esc(n?.label||midiToInfo(m).name+midiToInfo(m).octave)}"></span>`);
      if(w)wi++;
    }
    $('Keyboard').innerHTML=keys.join('');
  }
  function display(v){
    current=v;$('Title').textContent=v.symbol;$('Help').textContent=v.help;
    $('Notes').innerHTML=v.notes.map(n=>`<li data-hand="${n.hand}">${esc(n.label)} · ${esc(n.degree)} · ${n.hand==='left'?'MI':'MD'}</li>`).join('');
    if(!staff)staff=new CrescendoLiveStaff($('Score'));
    staff.update(v.notes.map(n=>({...n,staff:n.hand==='left'?2:1})),'grand',0);
    preview(v.notes);highlight();
  }
  function render(){
    stop();const root=Number($('Root').value),preset=api.presets.find(p=>p.id===$('Voicing').value);
    host.querySelectorAll('[data-for]').forEach(el=>el.hidden=!el.dataset.for.split(' ').includes(state.tab));
    host.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===state.tab)));
    const pattern=patterns[Number($('Pattern').value)],full=api.fullFormulas[pattern.name];
    $('Formula').disabled=!full;if(!full)$('Formula').value='pattern';
    const selectedPattern=$('Formula').value==='full'?{name:pattern.name,intervals:full}:pattern;
    const invCount=state.tab==='build'?selectedPattern.intervals.length:preset.kind==='shape'?4:1;
    const inv=Math.min(Number($('Inversion').value)||0,invCount-1);
    $('Inversion').innerHTML=options(Array.from({length:invCount},(_,i)=>[i,i?`${i}ª inversión`:'Fundamental / posición original']));$('Inversion').value=String(inv);
    $('Inversion').disabled=invCount===1;$('Open').disabled=preset.kind!=='shape';$('Hands').disabled=preset.kind!=='rootless';
    if(state.tab==='jazz'){
      $('Inversion').parentElement.hidden=preset.kind!=='shape';
      $('Open').parentElement.hidden=preset.kind!=='shape';
      $('Hands').parentElement.hidden=preset.kind!=='rootless';
    }
    $('Steps').innerHTML='';
    if(state.tab==='progression') {
      sequence=api.progression(root,$('Minor').value==='1',$('Style').value,$('Smooth').value==='1');
      sequence.forEach((v,i)=>{const b=document.createElement('button');b.textContent=v.roman+' · '+v.symbol;b.setAttribute('aria-pressed',String(i===state.step));b.onclick=()=>{stop();state.step=i;display(v);$('Steps').querySelectorAll('button').forEach((x,j)=>x.setAttribute('aria-pressed',String(i===j)));};$('Steps').appendChild(b);});
      display(sequence[state.step]);
    } else if(state.tab==='jazz') display(api.voice(preset.id,root,{inversion:inv,register:Number($('Register').value),open:$('Open').value==='1',hands:$('Hands').value}));
    else {const v=api.construct(selectedPattern,root,inv,4+Number($('Register').value));if($('Formula').value==='full')v.help='Fórmula teórica extendida: incluye las voces intermedias. No todas se tocan juntas en un voicing; la 11 natural puede rozar con la tercera mayor. Compara con el patrón del detector.';v.notes=v.notes.slice(0,state.count);display(v);}
    status('Selecciona Escuchar o toca las notas indicadas.');
  }
  async function play(arpeggio=false,all=false){
    stop();const token=generation,ctx=ensureCtx();
    if(!sfPlayer){initSoundFont();status('Cargando el sonido del piano…');}
    // Cancellable wait: no delayed playback after changing the selection or closing.
    for(let i=0;!sfPlayer&&sfLoading&&i<150&&token===generation;i++) await new Promise(r=>setTimeout(r,100));
    if(token!==generation)return;
    if(!sfPlayer){status('No se pudo cargar SoundFont. Revisa la conexión y vuelve a escuchar.');return;}
    if(ctx.state==='suspended')await ctx.resume();
    if(token!==generation)return;
    const bpm=Math.min(180,Math.max(30,Number($('Tempo').value)||70));$('Tempo').value=bpm;
    const beat=60/bpm, list=all?sequence:[current];
    list.forEach((v,i)=>{
      const at=i*4*beat;
      later(()=>{if(token!==generation)return;if(all){state.step=i;display(v);$('Steps').querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));}status('Escuchando '+v.symbol);},at*1000);
      v.notes.forEach((n,j)=>{
        const start=at+(arpeggio?j*beat*.5:0),duration=arpeggio?beat*.8:beat*3.6;
        later(()=>{if(token!==generation)return;try{const v=sfPlayer.play(n.midi,ctx.currentTime,{gain:Number(volumeSlider.value)*.65,duration});if(v)voices.push(v);sounding.add(n.midi);highlight();}catch(error){stop();status('No se pudo reproducir el sonido. Vuelve a intentarlo.');console.warn(error);}},start*1000);
        later(()=>{sounding.delete(n.midi);highlight();},(start+duration)*1000);
      });
    });
    const end=all?list.length*4*beat:arpeggio?(current.notes.length*.5+.8)*beat:4*beat;
    later(()=>{stop();status('Reproducción terminada.');},end*1000);
  }
  host.addEventListener('change',e=>{if(e.target.id==='bankTempo')return;state.count=Infinity;render();});
  host.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.tab){state.tab=b.dataset.tab;state.count=Infinity;state.step=0;render();return;}
    switch(b.dataset.action){
      case 'play':play();break;case 'arpeggio':play(true);break;case 'sequence':play(false,true);break;
      case 'stop':stop();status('Reproducción detenida.');break;
      case 'add':state.count=Number.isFinite(state.count)?state.count+1:1;render();break;
      case 'clear':state.count=0;render();break;case 'all':state.count=Infinity;render();break;
      case 'pro':modeProBtn.click();highlight();status('Piano completo: 88 teclas.');break;
      case 'check':{const expected=current.notes.map(n=>n.midi),missing=expected.filter(n=>!pressed.has(n)),extra=[...pressed].filter(n=>!expected.includes(n));status(!expected.length?'Añade primero alguna nota.':!missing.length&&!extra.length?'¡Correcto! Coinciden las notas y sus octavas.':`Faltan ${missing.length} notas; sobran ${extra.length}. Mantén las teclas pulsadas al comprobar.`);break;}
    }
  });
  document.addEventListener('piano-input',e=>{if(e.detail.on)pressed.add(e.detail.midi);else pressed.delete(e.detail.midi);});
  document.addEventListener('piano-panic',()=>{pressed.clear();stop();});
  new MutationObserver(highlight).observe(keyboardEl,{childList:true});
  panel.addEventListener('toggle',()=>{document.getElementById('openChordBank').setAttribute('aria-expanded',String(panel.open));if(panel.open)render();else stop();highlight();});
  document.getElementById('openChordBank').onclick=()=>{panel.open=!panel.open;if(panel.open)panel.scrollIntoView({behavior:'smooth',block:'start'});};
  window.addEventListener('pagehide',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  const params=new URLSearchParams(location.search);
  if(params.get('bank')) {
    const tab=params.get('bank');state.tab=['build','jazz','progression'].includes(tab)?tab:'build';
    const root=Number(params.get('root'));if(Number.isInteger(root)&&root>=0&&root<12)$('Root').value=String(root);
    if(api.presets.some(p=>p.id===params.get('voicing')))$('Voicing').value=params.get('voicing');
    if(params.get('minor')==='1')$('Minor').value='1';
    if(['rootless','shell','sixth'].includes(params.get('style')))$('Style').value=params.get('style');
    panel.open=true;requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}));
  }
})();
