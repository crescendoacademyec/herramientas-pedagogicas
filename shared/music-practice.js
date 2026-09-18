(function(global){
  'use strict';
  const letters=['C','D','E','F','G','A','B'], pcs=[0,2,4,5,7,9,11];
  const roots=['C','G','D','A','E','B','F#','C#','F','Bb','Eb','Ab','Db','Gb','Cb'];
  const scales=[
    {id:'major',name:'Mayor',steps:[0,2,4,5,7,9,11,12]},
    {id:'minor',name:'Menor natural',steps:[0,2,3,5,7,8,10,12]},
    {id:'harmonic',name:'Menor armónica',steps:[0,2,3,5,7,8,11,12]},
    {id:'melodic',name:'Menor melódica ascendente',steps:[0,2,3,5,7,9,11,12]},
    {id:'bebopDominant',name:'Bebop dominante',steps:[0,2,4,5,7,9,10,11,12]},
    {id:'bebopMajor',name:'Bebop mayor',steps:[0,2,4,5,7,8,9,11,12]},
    {id:'bebopMinor',name:'Bebop menor',steps:[0,2,3,5,7,8,9,11,12]},
    {id:'minorSixPentatonic',name:'Pentatónica menor 6',steps:[0,2,3,7,9,12]},
    {id:'wholeTone',name:'Tonos enteros',steps:[0,2,4,6,8,10,12]},
    {id:'diminishedHalfWhole',name:'Disminuida semitono–tono',steps:[0,1,3,4,6,7,9,10,12]},
    {id:'diminishedWholeHalf',name:'Disminuida tono–semitono',steps:[0,2,3,5,6,8,9,11,12]}
  ];
  const chords=[['Mayor',[0,4,7]],['Menor',[0,3,7]],['Aumentado',[0,4,8]],['Disminuido',[0,3,6]],['Séptima dominante',[0,4,7,10]],['Séptima mayor',[0,4,7,11]],['Séptima menor',[0,3,7,10]],['Semidisminuido',[0,3,6,10]],['Séptima disminuida',[0,3,6,9]]];
  const intervals=[['2ª menor',1,1],['2ª mayor',2,1],['3ª menor',3,2],['3ª mayor',4,2],['4ª justa',5,3],['4ª aumentada',6,3],['5ª disminuida',6,4],['5ª justa',7,4],['6ª menor',8,5],['6ª mayor',9,5],['7ª menor',10,6],['7ª mayor',11,6],['8ª justa',12,7]];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  function rootNote(name,octave=4){const i=letters.indexOf(name[0]),alter=name.slice(1)==='#'?1:name.slice(1)==='b'?-1:0;return {midi:12*(octave+1)+pcs[i]+alter,diatonic:octave*7+i,alter};}
  function spell(root,semitones,degree){const d=root.diatonic+degree,oct=Math.floor(d/7),i=((d%7)+7)%7;return {midi:root.midi+semitones,diatonic:d,alter:root.midi+semitones-(12*(oct+1)+pcs[i])};}
  function name(n){return letters[((n.diatonic%7)+7)%7]+(n.alter>0?'♯'.repeat(n.alter):'♭'.repeat(-n.alter))+Math.floor(n.diatonic/7);}
  function midiNote(midi){const names=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];return rootNote(names[((midi%12)+12)%12],Math.floor(midi/12)-1);}
  function musicXML(notes,{clef='treble',stack=false,key=0}={}){
    const accidentals={'-2':'flat-flat','-1':'flat',0:'natural',1:'sharp',2:'double-sharp'};
    const body=notes.length?notes.map((n,i)=>`<note>${stack&&i?'<chord/>':''}<pitch><step>${letters[((n.diatonic%7)+7)%7]}</step><alter>${n.alter}</alter><octave>${Math.floor(n.diatonic/7)}</octave></pitch><duration>4</duration><type>whole</type>${n.alter&&accidentals[n.alter]?`<accidental>${accidentals[n.alter]}</accidental>`:''}</note>`).join(''):'<note print-object="no"><rest/><duration>4</duration><type>whole</type></note>';
    return `<?xml version="1.0" encoding="UTF-8"?><score-partwise version="3.1"><part-list><score-part id="P1"><part-name></part-name></score-part></part-list><part id="P1"><measure number="1" implicit="yes"><attributes><divisions>1</divisions><key><fifths>${key}</fifths></key><time print-object="no"><beats>${stack||!notes.length?4:notes.length*4}</beats><beat-type>4</beat-type></time><clef><sign>${clef==='bass'?'F':'G'}</sign><line>${clef==='bass'?4:2}</line></clef></attributes>${body}<barline location="right"><bar-style>none</bar-style></barline></measure></part></score-partwise>`;
  }
  function staff(notes,options={}){
    return `<div class="cp-staff" data-cp-xml="${esc(musicXML(notes,options))}" role="img" aria-label="Pentagrama de práctica en clave de ${options.clef==='bass'?'fa':'sol'}"><span>Preparando pentagrama…</span></div>`;
  }
  function named(value){const m=/^([A-G])([#b]?)(-?\d+)$/.exec(value);if(!m)throw new Error('Nota no válida: '+value);return rootNote(m[1]+m[2],Number(m[3]));}
  function sequence(events,{clef='treble',meter=null,labels=false,compact=false,key=0}={}){
    const types=[[4,'whole'],[2,'half'],[1,'quarter'],[.5,'eighth'],[.25,'16th'],[.125,'32nd'],[.0625,'64th']];
    const groups=new Map();events.forEach(e=>{const bar=e.bar||0;if(!groups.has(bar))groups.set(bar,[]);groups.get(bar).push(e);});
    if(!groups.size)groups.set(0,[]);
    const clefXML=clef==='bass'?'<sign>F</sign><line>4</line>':clef==='alto'?'<sign>C</sign><line>3</line>':'<sign>G</sign><line>2</line>';
    let measures='';
    for(const [bar,notes] of groups){
      const body=notes.map((e,i)=>{
        const n=e.note?named(e.note):e.midi!==undefined?{...midiNote(e.midi),...e}:rootNote('G',4),beats=e.beats??1;
        const triplet=e.kind==='triplet'||Math.abs(beats-1/3)<.00001;
        const base=triplet?.5:beats;
        const type=types.find(([v])=>Math.abs(base-v)<.00001)||types.find(([v])=>Math.abs(base-v*1.5)<.00001)||types.find(([v])=>Math.abs(base-v*1.75)<.00001)||types[2];
        const dots=triplet?0:Math.abs(base-type[0]*1.75)<.00001?2:Math.abs(base-type[0]*1.5)<.00001?1:0;
        const tie=(e.tieStart?'<tie type="start"/>':'')+(e.tied?'<tie type="stop"/>':'');
        const notation=(e.tieStart?'<tied type="start"/>':'')+(e.tied?'<tied type="stop"/>':'')+(e.fermata?'<fermata/>':'')+(e.articulation?`<articulations><${e.articulation}/></articulations>`:'')+(e.slur?`<slur type="${e.slur}" number="1"/>`:'')+(triplet&&i%3!==1?`<tuplet type="${i%3===0?'start':'stop'}"/>`:'');
        const accidental=e.accidental||({'-2':'flat-flat','-1':'flat',1:'sharp',2:'double-sharp'}[n.alter]);
        return `<note>${e.kind==='rest'?'<rest/>':`<pitch><step>${letters[((n.diatonic%7)+7)%7]}</step><alter>${n.alter}</alter><octave>${Math.floor(n.diatonic/7)}</octave></pitch>`}<duration>${Math.round(beats*48)}</duration>${tie}<type>${type[1]}</type>${'<dot/>'.repeat(dots)}${accidental&&e.kind!=='rest'?`<accidental>${accidental}</accidental>`:''}${triplet?'<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes><normal-type>eighth</normal-type></time-modification>':''}${e.stem?`<stem>${e.stem}</stem>`:''}${e.beam?`<beam number="1">${e.beam}</beam>`:''}${notation?'<notations>'+notation+'</notations>':''}${labels&&e.kind!=='rest'?'<lyric><text>'+esc(e.label||name(n))+'</text></lyric>':''}</note>`;
      }).join('');
      measures+=`<measure number="${bar+1}" implicit="yes">${bar===groups.keys().next().value?`<attributes><divisions>48</divisions><key><fifths>${key}</fifths></key>${meter?`<time><beats>${Number(meter.split('/')[0])}</beats><beat-type>${Number(meter.split('/')[1])}</beat-type></time>`:'<time print-object="no"><beats>4</beats><beat-type>4</beat-type></time>'}<clef>${clefXML}</clef></attributes>`:''}${body}</measure>`;
    }
    const xml=`<?xml version="1.0"?><score-partwise version="3.1"><part-list><score-part id="P1"><part-name></part-name></score-part></part-list><part id="P1">${measures}</part></score-partwise>`;
    return `<div class="cp-staff${compact?' cp-compact':''}" data-cp-xml="${esc(xml)}" data-cp-time="${!!meter}" role="img" aria-label="Ejemplo de notación musical">Preparando pentagrama…</div>`;
  }
  // Todos los consumidores insertan el mismo contenedor; OSMD calcula la notación.
  function upgradeExamples(){
    const figures=[0xECA2,0xECA3,0xECA5,0xECA7,0xECA9,0xECAB,0xECAD];
    document.querySelectorAll('.music-glyph').forEach(host=>{
      const code=host.textContent.trim().codePointAt(0),index=figures.indexOf(code);
      let events=null,options={compact:true};
      if(index>=0)events=[{beats:4/2**index}];
      else if(code>=0xE4E3&&code<=0xE4E9)events=[{kind:'rest',beats:4/2**(code-0xE4E3)}];
      else if([0xE050,0xE062,0xE05C].includes(code)){events=[{kind:'rest',beats:4}];options.clef=code===0xE062?'bass':code===0xE05C?'alto':'treble';}
      else if(code>=0xE260&&code<=0xE264){const alter={0xE260:-1,0xE261:0,0xE262:1,0xE263:2,0xE264:-2}[code];events=[{...rootNote('G'),alter,midi:67+alter,beats:1,accidental:alter===0?'natural':undefined}];}
      else if(code===0xE4C0)events=[{beats:1,fermata:true}];
      if(events){host.classList.remove('music-glyph','rest-glyph-cell');host.innerHTML=sequence(events,options);}
    });
    const samples={
      'Plica hacia arriba':[{note:'E4',stem:'up'}],
      'Plica hacia abajo':[{note:'C5',stem:'down'}],
      'Barras de unión':[{beats:.5,beam:'begin'},{beats:.5,beam:'end'}],
      'Línea adicional':[{note:'C4'}],
      'Puntillo':[{beats:1.5}], 'Doble puntillo':[{beats:1.75}],
      'Tresillo':Array.from({length:3},()=>({beats:1/3,kind:'triplet'})),
      'Ligadura de prolongación':[{tieStart:true},{tied:true}],
      'Contratiempo':[{kind:'rest',beats:.5},{beats:.5}],
      'Staccato':[{articulation:'staccato'}], 'Tenuto':[{articulation:'tenuto'}],
      'Acento':[{articulation:'accent'}], 'Legato':[{slur:'start'},{note:'A4',slur:'stop'}],
      'Compás incompleto':[{beats:1}]
    };
    document.querySelectorAll('.symbol-guide .notation-text').forEach(host=>{
      const title=host.parentElement.querySelector('span')?.textContent,events=samples[title];
      if(events){host.classList.remove('notation-text');host.innerHTML=sequence(events,{compact:true});return;}
      let xml=musicXML([rootNote('G')]);
      const bars={'Barra de compás':'<bar-style>regular</bar-style>','Doble barra':'<bar-style>light-light</bar-style>','Inicio de repetición':'<repeat direction="forward"/>','Fin de repetición':'<repeat direction="backward"/>','Casillas':'<ending number="1" type="stop"/><repeat direction="backward"/>'};
      if(bars[title]){
        xml=xml.replace('<barline location="right"><bar-style>none</bar-style></barline>',`<barline location="${title==='Inicio de repetición'?'left':'right'}">${bars[title]}</barline>`);
        if(title==='Casillas')xml=xml.replace('</attributes>','</attributes><barline location="left"><ending number="1" type="start"/></barline>');
      }else if(['Da Capo','Dal Segno','Destino'].includes(title)){
        const direction=title==='Da Capo'?'<words>D.C.</words>':title==='Dal Segno'?'<segno/>':'<coda/>';
        xml=xml.replace('</attributes>','</attributes><direction placement="above"><direction-type>'+direction+'</direction-type></direction>');
      }else if(title==='Gran pentagrama'){
        xml=xml.replace('<clef><sign>G</sign><line>2</line></clef>','<staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef>');
        xml=xml.replace('<type>whole</type>','<voice>1</voice><type>whole</type><staff>1</staff>');
        xml=xml.replace('</note>','</note><backup><duration>4</duration></backup><note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><voice>2</voice><type>whole</type><staff>2</staff></note>');
      }else if(title==='Silencio de varios compases'){
        xml=musicXML([]).replace('</attributes>','<measure-style><multiple-rest>4</multiple-rest></measure-style></attributes>').replace('<note print-object="no">','<note>');
        xml=xml.replace('</measure>','</measure>'+[2,3,4].map(i=>`<measure number="${i}"><note><rest measure="yes"/><duration>4</duration><type>whole</type></note></measure>`).join(''));
      }else return;
      host.classList.remove('notation-text');host.innerHTML=`<div class="cp-staff cp-compact" data-cp-xml="${esc(xml)}" role="img" aria-label="${esc(title)}">Preparando ejemplo…</div>`;
    });
  }
  function observeScores(){
    const mounted=new Map();
    async function render(host){
      mounted.set(host,null);
      try{
        const Engine=global.opensheetmusicdisplay?.OpenSheetMusicDisplay;
        if(!Engine)throw new Error('Motor de notación no disponible');
        const xml=new DOMParser().parseFromString(host.dataset.cpXml,'application/xml');
        const count=Math.max(1,...[...xml.querySelectorAll('measure')].map(m=>[...m.querySelectorAll('note')].filter(n=>!n.querySelector('chord')).length));
        const surface=document.createElement('div');
        surface.style.minWidth=(host.classList.contains('cp-compact')?Math.max(130,70+count*22):Math.max(150,110+count*30))+'px';
        host.replaceChildren(surface);
        const osmd=new Engine(surface,{backend:'svg',autoResize:false,drawTitle:false,drawSubtitle:false,drawComposer:false,drawPartNames:false,drawMeasureNumbers:false,drawTimeSignatures:host.dataset.cpTime==='true'});
        await osmd.load(host.dataset.cpXml);
        if(!host.isConnected){mounted.delete(host);return;}
        const earPage=document.body.classList.contains('ear-training-page');
        osmd.Zoom=earPage?(host.classList.contains('cp-compact')?.76:1.08):(host.classList.contains('cp-compact')?.6:.85);osmd.render();
        let width=host.clientWidth;
        const resize=new ResizeObserver(()=>{if(host.isConnected&&host.clientWidth>0&&host.clientWidth!==width){width=host.clientWidth;osmd.render();}});
        resize.observe(host);mounted.set(host,resize);host.dataset.cpRendered='true';
      }catch(error){host.textContent='No se pudo mostrar la partitura. Recarga la página para volver a cargar el motor de notación.';host.dataset.cpError='true';console.error(error);}
    }
    function scan(){
      upgradeExamples();
      for(const [host,resize] of mounted)if(!host.isConnected){resize?.disconnect();mounted.delete(host);}
      document.querySelectorAll('[data-cp-xml]').forEach(host=>{if(!mounted.has(host))render(host);});
    }
    new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();
  }
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeScores,{once:true});else observeScores();
  }
  function question(kind,{clef='treble',family='major',inversions=false}={}){
    const root=pick(roots.slice(0,12)),r=rootNote(root,clef==='bass'?2:4);
    if(kind==='key'){
      const idx=Math.floor(Math.random()*roots.length),key=idx<8?idx:7-idx,major=rootNote(roots[idx]),minor=spell(major,9,5),tonic=family==='minor'?name(minor).replace(/\d+$/,''):roots[idx];
      return {notes:[],key,answer:tonic+' '+(family==='minor'?'menor':'mayor'),choices:roots.map(k=>family==='minor'?name(spell(rootNote(k),9,5)).replace(/\d+$/,'')+' menor':k+' mayor'),detail:'Esta armadura corresponde a '+roots[idx]+' mayor y su relativa '+name(minor).replace(/\d+$/,'')+' menor.'};
    }
    let notes,answer,choices,stack=false;
    if(kind==='scale'){const s=pick(scales);notes=s.steps.map((v,i)=>spell(r,v,i));answer=s.name;choices=scales.map(s=>s.name);}
    else if(kind==='interval'){const iv=pick(intervals);notes=[r,spell(r,iv[1],iv[2])];answer=iv[0];choices=intervals.map(i=>i[0]);stack=true;}
    else {const ch=pick(chords);notes=ch[1].map((v,i)=>spell(r,v,i*2));if(inversions){const count=Math.floor(Math.random()*notes.length);notes=notes.map((n,i)=>i<count?{...n,midi:n.midi+12,diatonic:n.diatonic+7}:n).sort((a,b)=>a.midi-b.midi);}answer=ch[0];choices=chords.map(c=>c[0]);stack=true;}
    return {notes,answer,choices,stack,detail:answer+' · '+notes.map(name).join(' – ')};
  }
  function mount(host,kind,play,onResult=()=>{}){
    host.innerHTML=`<div class="cp-controls"><label>Clave <select data-cp-clef><option value="treble">Sol</option><option value="bass">Fa</option></select></label>${kind==='key'?'<label>Tonalidad <select data-cp-family><option value="major">Mayor</option><option value="minor">Menor relativa</option></select></label>':'<label>Modalidad <select data-cp-mode><option value="visual">Visual</option><option value="audio">Auditiva</option><option value="both">Visual y auditiva</option></select></label>'}${kind==='chord'?'<label><input type="checkbox" data-cp-inversions> Incluir inversiones</label>':''}</div><div data-cp-score></div><p data-cp-prompt></p><button type="button" data-cp-play>▶ Escuchar</button><div class="cp-answers" data-cp-answers></div><p aria-live="polite" data-cp-feedback></p><button type="button" data-cp-next>Nueva pregunta</button>`;
    const get=s=>host.querySelector(s);let q,answered=false;
    function visual(){get('[data-cp-score]').innerHTML=staff(q.notes,{clef:get('[data-cp-clef]').value,stack:q.stack,key:q.key||0});}
    function next(){answered=false;const mode=get('[data-cp-mode]')?.value||'visual';q=question(kind,{clef:get('[data-cp-clef]').value,family:get('[data-cp-family]')?.value,inversions:get('[data-cp-inversions]')?.checked});get('[data-cp-feedback]').textContent='';get('[data-cp-score]').innerHTML='';if(mode!=='audio')visual();get('[data-cp-prompt]').textContent=mode==='audio'?'Escucha y elige la respuesta. El pentagrama aparecerá después.':'Identifica '+({key:'la tonalidad de esta armadura',scale:'la escala',interval:'el intervalo',chord:'el tipo de acorde'}[kind])+'.';get('[data-cp-play]').hidden=kind==='key'||mode==='visual';get('[data-cp-answers]').innerHTML=q.choices.map(c=>`<button type="button">${esc(c)}</button>`).join('');get('[data-cp-answers]').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(answered)return;answered=true;const ok=b.textContent===q.answer;onResult(ok);visual();get('[data-cp-feedback]').textContent=(ok?'Correcto. ':'Respuesta: ')+q.detail;get('[data-cp-play]').hidden=kind==='key';get('[data-cp-answers]').querySelectorAll('button').forEach(btn=>{btn.disabled=true;if(btn.textContent===q.answer)btn.classList.add('correct');});});}
    get('[data-cp-play]').onclick=()=>play(q.notes.map(n=>n.midi),kind==='chord');get('[data-cp-next]').onclick=next;host.querySelectorAll('select,input').forEach(c=>c.onchange=next);next();
  }
  function review(round){
    const seq=round.seq||[],meta=round.meta||{};
    let drawings;
    if(meta.targetType==='scale'){
      const scale=scales.find(s=>'scale:'+s.id===meta.targetId),root=midiNote(meta.rootMidi);
      drawings=staff(scale.steps.map((v,i)=>spell(root,v,i)),{clef:root.midi<60?'bass':'treble'});
    }else if(meta.targetType==='interval'){
      const iv=intervals.find(i=>i[1]===meta.semitones),root=midiNote(meta.rootMidi),sign=meta.direction==='descending'?-1:1;
      drawings=staff([root,spell(root,sign*meta.semitones,sign*(iv?iv[2]:0))],{clef:root.midi<60?'bass':'treble',stack:meta.direction==='harmonic'});
    }else if(meta.targetType==='chord'){
      const chord=global.ETData.CHORD_BANK.find(c=>c.id===meta.chordId),root=rootNote(meta.root.replace('♭','b').replace('♯','#'));
      const generic=[0,1,1,2,2,3,4,4,4,5,6,6];
      const spelled=seq[0].notes.map(midi=>{
        const iv=chord.intervals.find(v=>((root.midi+v-midi)%12+12)%12===0);
        let degree=Math.floor(iv/12)*7+generic[iv%12];
        if(chord.id==='cdim7'&&iv===9)degree=6;
        if(iv===18)degree=10;
        if(iv===15)degree=8;
        const n=spell(root,iv,degree),oct=(midi-n.midi)/12;
        return {...n,midi,diatonic:n.diatonic+oct*7};
      });
      drawings=staff(spelled,{stack:true,clef:meta.clef||(Math.max(...seq[0].notes)<60?'bass':'treble')});
    }else drawings=seq.map(event=>staff(event.notes.map(midiNote),{stack:event.notes.length>1,clef:Math.max(...event.notes)<60?'bass':'treble'})).join('');
    return '<div class="cp-review"><h4>Lo que escuchaste</h4>'+drawings+'<p>Lectura de las alturas reproducidas; las grafías enarmónicas pueden variar según el contexto armónico.</p></div>';
  }
  global.CrescendoPractice={scales,staff,musicXML,sequence,named,spell,rootNote,question,mount,review};
})(window);
