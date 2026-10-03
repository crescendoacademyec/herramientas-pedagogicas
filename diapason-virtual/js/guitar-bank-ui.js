/* Bancos separados: las formas son iguales; el requinto suena una 4.ª justa arriba. */
(function(){
  const bank=window.GuitarChordBank;
  if(!bank)return;
  const rootNames=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const displayNames=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const rootLabel={C:'Do · C','C#':'Do♯ / Re♭ · C♯ / Re♭',D:'Re · D','D#':'Re♯ / Mi♭ · Re♯ / Mi♭',E:'Mi · E',F:'Fa · F','F#':'Fa♯ / Sol♭ · Fa♯ / Sol♭',G:'Sol · G','G#':'Sol♯ / La♭ · Sol♯ / La♭',A:'La · A','A#':'La♯ / Si♭ · La♯ / Si♭',B:'Si · B'};
  const configs=[
    {hostId:'guitarChordBank',instrument:'guitar',rootOffset:0,title:'Banco de acordes de guitarra',tuningLabels:['E','A','D','G','B','E'],instrumentLabel:'Guitarra estándar',note:'Las posiciones corresponden a guitarra estándar E–A–D–G–B–E.'},
    {hostId:'requintoChordBank',instrument:'requinto',rootOffset:5,title:'Banco de acordes de requinto',tuningLabels:['A','D','G','C','E','A'],instrumentLabel:'Requinto estándar',note:'El requinto suena una cuarta justa arriba de la guitarra: por ejemplo, la forma C se nombra F.'}
  ];

  function mount(config){
    const host=document.getElementById(config.hostId);
    if(!host)return;
    let selected=null,timers=[],voices=[];
    const stop=()=>{timers.forEach(clearTimeout);timers=[];voices.forEach(v=>v?.stop?.());voices=[];};
    const rendered=e=>{
      const rootPc=(bank.roots[e.root]+config.rootOffset)%12,root=rootNames[rootPc];
      return {...e,displayRoot:root,displayName:root+e.quality};
    };
    host.innerHTML='<summary>'+config.title+'</summary><p>'+config.note+' Orden en los diagramas: grave → aguda. ○ al aire. Los círculos indican dedo: 1 índice · 2 medio · 3 anular · 4 meñique; la cifra lateral marca el traste inicial.</p><div class="guitar-filters"><label>Fundamental<select data-guitar-root></select></label><label>Familia<select data-guitar-quality></select></label><label>Registro<select data-guitar-position><option value="all">Todos</option><option value="1">Primer registro</option><option value="2">Registro medio</option><option value="3">Registro alto</option></select></label><button type="button" data-guitar-stop>Detener sonido</button></div><p data-guitar-count></p><div class="guitar-status" role="status" aria-live="polite" data-guitar-status>Selecciona una postura para verla en el diapasón y el pentagrama.</div><div class="guitar-grid"></div>';
    const root=host.querySelector('[data-guitar-root]'),quality=host.querySelector('[data-guitar-quality]'),position=host.querySelector('[data-guitar-position]'),grid=host.querySelector('.guitar-grid'),status=host.querySelector('[data-guitar-status]');
    root.add(new Option('Todas','all'));rootNames.forEach(r=>root.add(new Option(rootLabel[r],r)));root.value=rootNames[config.rootOffset];
    quality.add(new Option('Todas','all'));bank.qualityOrder.forEach(q=>quality.add(new Option(bank.qualities[q][0],q)));
    const isSupported=()=>instrumentSel.value===config.instrument&&(config.instrument!=='guitar'||tuningSel.value==='standard');
    function diagram(e){
      const positive=e.frets.filter(f=>f>0),start=positive.length&&Math.min(...positive)>1?Math.min(...positive):1;
      const rows=Math.max(4,Math.max(0,...positive)-start+1),gap=104/rows;
      let s='<svg viewBox="0 0 156 172" role="img" aria-label="'+e.displayName+', trastes '+e.frets.join(', ')+'">';
      for(let i=0;i<6;i++){const x=20+i*23;s+='<text x="'+x+'" y="14" text-anchor="middle" font-size="10" fill="#222">'+config.tuningLabels[i]+'</text><path d="M'+x+' 37V141" stroke="#444"/>';}
      for(let j=0;j<=rows;j++)s+='<path d="M20 '+(37+j*gap)+'H135" stroke="#444" stroke-width="'+(j===0&&start===1?3:1)+'"/>';
      s+='<text x="4" y="'+(37+gap/2+4)+'" font-size="10" fill="#222">'+start+'</text>';
      e.frets.forEach((f,i)=>{const x=20+i*23;if(f===0)s+='<text x="'+x+'" y="31" text-anchor="middle" font-size="13" fill="#222">○</text>';else{const y=37+(f-start+.5)*gap,finger=Math.min(4,Math.max(1,f-start+1));s+='<circle cx="'+x+'" cy="'+y+'" r="8" fill="#9c6919"/><text x="'+x+'" y="'+(y+3)+'" text-anchor="middle" font-size="9" fill="white">'+finger+'</text>';}});
      return s+'</svg>';
    }
    function choose(e){
      if(!isSupported()){status.textContent='Este banco requiere '+(config.instrument==='guitar'?'guitarra en afinación estándar.':'requinto estándar.')+' Cambia el instrumento para aplicar la postura.';return false;}
      stop();selected=e;rootSel.value='';chordTypeSel.value='';scaleSel.value='';manualSelections.clear();hoverCell=null;
      e.frets.forEach((f,i)=>manualSelections.add(selectedKey(5-i,f)));
      visibleFrets=Math.max(visibleFrets,Math.max(...e.frets),4);posSel.value='1';refresh();
      const midis=bank.midis(e,config.instrument,capoSemitones());
      status.textContent=e.displayName+' · '+config.instrumentLabel+' · Posición '+e.position+' · Notas reales: '+midis.map(m=>displayNames[m%12]+(Math.floor(m/12)-1)).join(' · ')+(capoSemitones()?' · Capo '+capoSemitones()+': el sonido está transpuesto.':'');
      grid.querySelectorAll('.guitar-card').forEach(card=>{const on=card.dataset.id===e.id;card.classList.toggle('is-selected',on);card.querySelector('.guitar-select').setAttribute('aria-pressed',String(on));});
      return true;
    }
    function play(e,arpeggio){if(!choose(e))return;const ctx=ensureCtx();ctx?.resume?.();bank.midis(e,config.instrument,capoSemitones()).forEach((m,i)=>{if(arpeggio)timers.push(setTimeout(()=>{if(isSupported())voices.push(playNote(m,1.5));},i*175));else voices.push(playNote(m,1.8));});}
    function render(){
      grid.replaceChildren();const filtered=bank.entries.map(rendered).filter(e=>(root.value==='all'||e.displayRoot===root.value)&&(quality.value==='all'||e.quality===quality.value)&&(position.value==='all'||String(e.position)===position.value));
      host.querySelector('[data-guitar-count]').textContent=filtered.length+' posturas · '+bank.entries.length+' en el banco';
      for(const e of filtered){const card=document.createElement('article');card.className='guitar-card';card.dataset.id=e.id;card.innerHTML='<strong>'+e.displayName+'</strong>'+diagram(e)+'<small>'+bank.qualities[e.quality][0]+' · posición '+e.position+'</small><button type="button" class="guitar-select" aria-pressed="false">Ver '+e.displayName+'</button><div><button type="button" data-play>Escuchar</button> <button type="button" data-arp>Arpegio</button></div>';card.querySelector('.guitar-select').onclick=()=>choose(e);card.querySelector('[data-play]').onclick=()=>play(e,false);card.querySelector('[data-arp]').onclick=()=>play(e,true);grid.appendChild(card);}
    }
    function sync(){stop();host.hidden=instrumentSel.value!==config.instrument;if(host.hidden){host.open=false;selected=null;}else if(!isSupported())status.textContent='Cambia a afinación estándar para aplicar estas posiciones.';}
    root.onchange=quality.onchange=position.onchange=()=>{stop();render();};host.querySelector('[data-guitar-stop]').onclick=stop;
    instrumentSel.addEventListener('change',sync);[tuningSel,capoSel,orientationSel,labelModeSel].forEach(el=>el.addEventListener('change',()=>{if(selected&&isSupported())choose(selected);else sync();}));
    [rootSel,chordTypeSel,scaleSel,posSel,patternSel].forEach(el=>el.addEventListener('change',()=>{stop();selected=null;}));cvs.addEventListener('pointerdown',()=>{stop();selected=null;});clearSelectionBtn.addEventListener('click',()=>{stop();selected=null;});clearAllBtn.addEventListener('click',()=>{stop();selected=null;sync();});window.addEventListener('pagehide',stop);
    render();sync();
  }
  configs.forEach(mount);
})();
