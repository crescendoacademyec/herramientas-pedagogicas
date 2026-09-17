/* Only mounted/activated for ukulele. Existing chord generators are untouched. */
(function(){
  const bank=window.UkuleleChordBank,host=document.getElementById('ukuleleBank');
  if(!host||!bank)return;
  let selected=null,timers=[],voices=[];
  const stop=()=>{timers.forEach(clearTimeout);timers=[];voices.forEach(v=>v?.stop?.());voices=[];};
  const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const rootLabel={C:'Do · C','C#':'Do♯ / Re♭ · C♯ / D♭',D:'Re · D','D#':'Re♯ / Mi♭ · D♯ / E♭',E:'Mi · E',F:'Fa · F','F#':'Fa♯ / Sol♭ · F♯ / G♭',G:'Sol · G','G#':'Sol♯ / La♭ · G♯ / A♭',A:'La · A','A#':'La♯ / Si♭ · A♯ / B♭',B:'Si · B'};
  host.innerHTML='<summary>Banco de acordes de ukelele</summary><p>Posturas del documento de referencia, verificadas para G–C–E–A. Orden de cuerdas en los diagramas: G C E A. ○ al aire · × no tocar. Los números dentro de los puntos indican trastes, no dedos.</p><div class="uke-filters"><label>Fundamental<select data-uke-root></select></label><label>Familia<select data-uke-quality></select></label><button type="button" data-uke-stop>Detener sonido</button></div><p data-uke-count></p><div class="uke-status" role="status" aria-live="polite" data-uke-status>Selecciona una postura para verla en el diapasón y el pentagrama.</div><div class="uke-grid"></div>';
  const root=host.querySelector('[data-uke-root]'),quality=host.querySelector('[data-uke-quality]'),grid=host.querySelector('.uke-grid'),status=host.querySelector('[data-uke-status]');
  root.add(new Option('Todas','all'));Object.keys(bank.roots).forEach(r=>root.add(new Option(rootLabel[r],r)));root.value='C';
  quality.add(new Option('Todas','all'));Object.entries(bank.qualities).forEach(([q,v])=>quality.add(new Option(v[0],q)));
  function diagram(e){
    const positive=e.frets.filter(f=>f>0),start=positive.length&&Math.min(...positive)>1?Math.min(...positive):1;
    const rows=Math.max(4,Math.max(0,...positive)-start+1),gap=95/rows;
    let s='<svg viewBox="0 0 110 155" role="img" aria-label="'+e.name+', trastes '+e.frets.map(f=>f===null?'silenciada':f).join(', ')+'">';
    for(let i=0;i<4;i++){const x=28+i*21;s+='<text x="'+x+'" y="14" text-anchor="middle" font-size="11" fill="#222">'+['G','C','E','A'][i]+'</text><path d="M'+x+' 35V130" stroke="#444"/>';}
    for(let j=0;j<=rows;j++)s+='<path d="M28 '+(35+j*gap)+'H91" stroke="#444" stroke-width="'+(j===0&&start===1?3:1)+'"/>';
    s+='<text x="7" y="'+(35+gap/2+4)+'" font-size="10" fill="#222">'+start+'</text>';
    e.frets.forEach((f,i)=>{const x=28+i*21;if(f===null||f===0)s+='<text x="'+x+'" y="29" text-anchor="middle" font-size="13" fill="#222">'+(f===null?'×':'○')+'</text>';else{const y=35+(f-start+.5)*gap;s+='<circle cx="'+x+'" cy="'+y+'" r="8" fill="#9c6919"/><text x="'+x+'" y="'+(y+3)+'" text-anchor="middle" font-size="9" fill="white">'+f+'</text>';}});
    return s+'</svg>';
  }
  function choose(e){
    if(instrumentSel.value!=='ukulele')return false;
    stop();selected=e;
    // Use existing manual-position mode, not guitar/requinto voicing templates.
    rootSel.value='';chordTypeSel.value='';scaleSel.value='';
    manualSelections.clear();hoverCell=null;
    e.frets.forEach((f,i)=>{if(f!==null)manualSelections.add(selectedKey(3-i,f));});
    visibleFrets=Math.max(visibleFrets,Math.max(...e.frets.filter(f=>f!==null)),4);
    posSel.value='1';refresh();
    const midis=bank.midis(e,tuningSel.value==='low_g',capoSemitones());
    const pcs=new Set(midis.map(m=>(m-capoSemitones()-bank.roots[e.root]+120)%12));
    const missing=bank.qualities[e.quality][1].filter(iv=>!pcs.has(iv));
    status.textContent=e.name+' · '+(tuningSel.value==='low_g'?'Low G':'High G')+' · Notas reales: '+midis.map(m=>names[m%12]+(Math.floor(m/12)-1)).join(' · ')+(capoSemitones()?' · Capo '+capoSemitones()+': el sonido está transpuesto.':'')+(missing.length?' · Postura con notas omitidas respecto de la fórmula completa.':'')+(e.correction?' · '+e.correction:'');
    grid.querySelectorAll('.uke-card').forEach(card=>{const on=card.dataset.id===e.id;card.classList.toggle('is-selected',on);card.querySelector('.uke-select').setAttribute('aria-pressed',String(on));});
    return true;
  }
  function play(e,arpeggio){
    if(!choose(e))return;
    const ctx=ensureCtx();ctx?.resume?.();
    bank.midis(e,tuningSel.value==='low_g',capoSemitones()).forEach((m,i)=>{
      if(arpeggio)timers.push(setTimeout(()=>{if(instrumentSel.value==='ukulele')voices.push(playNote(m,1.5));},i*230));
      else voices.push(playNote(m,1.8));
    });
  }
  function render(){
    grid.replaceChildren();
    const filtered=bank.entries.filter(e=>(root.value==='all'||e.root===root.value)&&(quality.value==='all'||e.quality===quality.value));
    host.querySelector('[data-uke-count]').textContent=filtered.length+' posturas · '+bank.entries.length+' en el banco';
    for(const e of filtered){
      const card=document.createElement('article');card.className='uke-card';card.dataset.id=e.id;
      card.innerHTML='<strong>'+e.name+'</strong>'+diagram(e)+'<small>'+bank.qualities[e.quality][0]+' · pág. '+e.page+(e.correction?' · Revisado':'')+'</small><button type="button" class="uke-select" aria-pressed="false">Ver '+e.name+'</button><div><button type="button" data-play>Escuchar</button> <button type="button" data-arp>Arpegio</button></div>';
      card.querySelector('.uke-select').onclick=()=>choose(e);
      card.querySelector('[data-play]').onclick=()=>play(e,false);
      card.querySelector('[data-arp]').onclick=()=>play(e,true);
      grid.appendChild(card);
    }
  }
  function sync(){stop();host.hidden=instrumentSel.value!=='ukulele';if(host.hidden){host.open=false;selected=null;}}
  root.onchange=quality.onchange=()=>{stop();render();};
  host.querySelector('[data-uke-stop]').onclick=stop;
  instrumentSel.addEventListener('change',sync);
  [tuningSel,capoSel,orientationSel,labelModeSel].forEach(el=>el.addEventListener('change',()=>{if(instrumentSel.value==='ukulele'&&selected)choose(selected);}));
  // If the user resumes free exploration, don't reapply an old bank selection.
  [rootSel,chordTypeSel,scaleSel,posSel,patternSel].forEach(el=>el.addEventListener('change',()=>{stop();selected=null;}));
  cvs.addEventListener('pointerdown',()=>{stop();selected=null;});
  clearSelectionBtn.addEventListener('click',()=>{stop();selected=null;});
  clearAllBtn.addEventListener('click',()=>{stop();selected=null;sync();});
  window.addEventListener('pagehide',stop);
  render();sync();
})();
