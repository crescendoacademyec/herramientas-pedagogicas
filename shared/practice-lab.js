(function(global){
  'use strict';
  const INSTRUMENTS={
    guitar:{name:'Guitarra · 6 cuerdas',tuning:[64,59,55,50,45,40],labels:['Mi4','Si3','Sol3','Re3','La2','Mi2']},
    bass:{name:'Bajo · 4 cuerdas',tuning:[43,38,33,28],labels:['Sol2','Re2','La1','Mi1']},
    ukulele:{name:'Ukelele · Sol agudo',tuning:[69,64,60,67],labels:['La4','Mi4','Do4','Sol4']},
    violin:{name:'Violín',tuning:[76,69,62,55],labels:['Mi5','La4','Re4','Sol3'],fretless:true}
  };
  const LETTERS=['C','D','E','F','G','A','B'],SOLFEGE=['Do','Re','Mi','Fa','Sol','La','Si'];
  const NATURAL=[0,2,4,5,7,9,11], NAMES=['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'];
  const KEYS=[['Cb',-7],['Gb',-6],['Db',-5],['Ab',-4],['Eb',-3],['Bb',-2],['F',-1],['C',0],['G',1],['D',2],['A',3],['E',4],['B',5],['F#',6],['C#',7]];
  const BANKS={
    theory:[['note','Notas'],['key','Armaduras'],['interval','Intervalos'],['scale','Escalas'],['triad','Tríadas']],
    functional:[['function','Grados y funciones'],['cadence','Cadencias'],['inversion','Inversiones'],['leading','Enlace de voces']],
    jazz:[['seventh','Acordes de séptima'],['tension','Tensiones'],['shell','Shell voicings'],['jazzscale','Modos'],['jazzcadence','ii–V–I mayor y menor'],['substitution','Sustitución tritonal']],
    ear:[['note','Notas con referencia'],['interval','Intervalos'],['scale','Escalas'],['triad','Tríadas'],['seventh','Séptimas'],['cadence','Cadencias'],['dictation','Dictado melódico']]
  };
  const pick=a=>a[Math.floor(Math.random()*a.length)], pc=n=>((n%12)+12)%12;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=n=>SOLFEGE[((n.diatonic%7)+7)%7]+({'-2':'𝄫','-1':'♭',0:'',1:'♯',2:'𝄪'}[n.alter]||'')+Math.floor(n.diatonic/7);
  function note(midi){const p=pc(midi),i=NATURAL.findIndex(x=>x===p);const d=i>=0?i:NATURAL.findLastIndex(x=>x<p);return {midi,diatonic:Math.floor(midi/12-1)*7+d,alter:p-NATURAL[d]};}
  function build(root,steps,degrees){return steps.map((s,i)=>global.CrescendoPractice.spell(root,s,degrees[i]));}
  function makeQuestion(kind,{length=4}={}){
    const P=global.CrescendoPractice, tonic=pick(['C','D','E','F','G','A','Bb']),r=P.rootNote(tonic,4);
    let q={kind,tonic,reference:r,stack:true};
    const set=(name,steps,degrees,choices)=>Object.assign(q,{answer:name,notes:build(r,steps,degrees),choices});
    if(['interval','scale'].includes(kind)) return {...P.question(kind),kind,stack:kind==='interval'};
    if(kind==='key'){const k=pick(KEYS);return {...q,notes:[],key:k[1],answer:k[0]+' mayor',choices:KEYS.map(x=>x[0]+' mayor'),instruction:'Construye la armadura de '+k[0]+' mayor.'};}
    if(kind==='note'){q.notes=[note(60+Math.floor(Math.random()*12))];q.answer=label(q.notes[0]);q.choices=Array.from({length:12},(_,i)=>label(note(60+i)));q.reference=P.rootNote('C',4);q.stack=false;q.tonic='';}
    if(kind==='triad'){const b=pick([['Mayor',[0,4,7]],['Menor',[0,3,7]],['Disminuida',[0,3,6]],['Aumentada',[0,4,8]]]);set(b[0],b[1],[0,2,4],['Mayor','Menor','Disminuida','Aumentada']);}
    if(kind==='seventh'){const b=pick([['maj7',[0,4,7,11]],['m7',[0,3,7,10]],['7',[0,4,7,10]],['m7♭5',[0,3,6,10]],['dim7',[0,3,6,9]]]);set(b[0],b[1],[0,2,4,6],['maj7','m7','7','m7♭5','dim7']);}
    if(kind==='function'){
      const b=pick([['I · Tónica',0,0,[0,4,7]],['ii · Subdominante',2,1,[0,3,7]],['IV · Subdominante',5,3,[0,4,7]],['V · Dominante',7,4,[0,4,7]],['vi · Tónica',9,5,[0,3,7]]]);
      const base=P.spell(r,b[1],b[2]);q.notes=build(base,b[3],[0,2,4]);q.answer=b[0];q.choices=['I · Tónica','ii · Subdominante','IV · Subdominante','V · Dominante','vi · Tónica'];q.context='Tonalidad: '+tonic+' mayor. Familias funcionales del curso.';
    }
    if(kind==='inversion'){
      const inv=pick([0,1,2]);set(['Estado fundamental','Primera inversión','Segunda inversión'][inv],[0,4,7],[0,2,4],['Estado fundamental','Primera inversión','Segunda inversión']);
      q.notes=q.notes.map((n,i)=>i<inv?{...n,midi:n.midi+12,diatonic:n.diatonic+7}:n).sort((a,b)=>a.midi-b.midi);
    }
    if(kind==='tension'){const b=pick([['9',[0,4,7,10,14],8],['♭9',[0,4,7,10,13],8],['♯11',[0,4,7,10,18],10],['13',[0,4,7,10,21],12]]);set('7('+b[0]+')',b[1],[0,2,4,6,b[2]],['7(9)','7(♭9)','7(♯11)','7(13)']);}
    if(kind==='shell'){const b=pick([['maj7 · 1–3–7',[0,4,11]],['m7 · 1–♭3–♭7',[0,3,10]],['7 · 1–3–♭7',[0,4,10]]]);set(b[0],b[1],[0,2,6],['maj7 · 1–3–7','m7 · 1–♭3–♭7','7 · 1–3–♭7']);}
    if(kind==='jazzscale'){
      const modes=[['Jónico',[0,2,4,5,7,9,11,12]],['Dórico',[0,2,3,5,7,9,10,12]],['Frigio',[0,1,3,5,7,8,10,12]],['Lidio',[0,2,4,6,7,9,11,12]],['Mixolidio',[0,2,4,5,7,9,10,12]],['Eólico',[0,2,3,5,7,8,10,12]],['Locrio',[0,1,3,5,6,8,10,12]]];
      const b=pick(modes);set(b[0],b[1],[0,1,2,3,4,5,6,7],modes.map(m=>m[0]));q.stack=false;
    }
    if(kind==='substitution'){
      const sub=Math.random()<.5;
      q.progression=[build(r,sub?[1,5,8,11]:[7,11,14,17],sub?[1,3,5,7]:[4,6,8,10]),build(r,[0,4,7,11],[0,2,4,6])];
      q.notes=q.progression.at(-1);q.answer=sub?'♭II7–I · Sustitución tritonal':'V7–I · Dominante';q.choices=['♭II7–I · Sustitución tritonal','V7–I · Dominante'];q.context='Centro tonal: '+tonic+' mayor. Compara el movimiento del bajo y las notas guía.';
    }
    if(['cadence','jazzcadence','leading'].includes(kind)){
      let b;
      if(kind==='jazzcadence')b=pick([['ii–V–I mayor',[[2,5,9,12],[7,11,14,17],[0,4,7,11]],[[1,3,5,7],[4,6,8,10],[0,2,4,6]]],['iiø–V–i menor',[[2,5,8,12],[7,11,14,17],[0,3,7,10]],[[1,3,5,7],[4,6,8,10],[0,2,4,6]]]]);
      else b=pick([['V–I · Auténtica',[[7,11,14],[0,4,7]],[[4,6,8],[0,2,4]]],['IV–I · Plagal',[[5,9,12],[0,4,7]],[[3,5,7],[0,2,4]]],['V–vi · Rota',[[7,11,14],[9,12,16]],[[4,6,8],[5,7,9]]]]);
      q.progression=b[1].map((s,i)=>build(r,s,b[2][i]));q.notes=q.progression.at(-1);q.answer=b[0];q.choices=kind==='jazzcadence'?['ii–V–I mayor','iiø–V–i menor']:['V–I · Auténtica','IV–I · Plagal','V–vi · Rota'];q.context='Centro tonal: '+tonic+(q.answer.includes('menor')?' menor.':' mayor.');
      if(kind==='leading'){q.progression=[build(r,[7,11,17],[4,6,10]),build(r,[7,12,16],[4,7,9])];q.notes=q.progression[1];q.answer='V7 → I · Sol común, Si→Do, Fa→Mi';q.choices=[q.answer,'V7 → vi','IV → I'];q.context='En '+tonic+' mayor: conserva la quinta de I y resuelve las notas guía por semitono.';q.answer='V7 → I · notas guía resueltas';q.choices=[q.answer,'V7 → vi','IV → I'];}
    }
    if(kind==='dictation'){q.notes=Array.from({length:Math.max(2,Math.min(8,length))},()=>{const d=pick([0,1,2,3,4]);return P.spell(r,[0,2,4,5,7][d],d);});q.stack=false;q.answer='Melodía de '+q.notes.length+' notas';q.choices=[];q.context='Escucha la tónica de referencia y reconstruye las notas en orden.';}
    const rules={
      triad:'Compara la tercera y la quinta respecto de la fundamental.',
      seventh:'La tercera, la quinta y la séptima definen la calidad del acorde.',
      inversion:'La inversión depende de cuál nota del acorde está en el bajo, no de la nota más aguda.',
      shell:'La tercera y la séptima son las notas guía; aquí se incluye también la fundamental.',
      tension:'La tensión se añade al acorde dominante; identifica su distancia desde la fundamental.',
      cadence:'La llegada y el acorde que la precede determinan el tipo de cadencia.',
      jazzcadence:'En menor, el ii es semidisminuido y el V conserva la sensible de la tonalidad.',
      substitution:'El sustituto ♭II7 comparte enarmónicamente el tritono del V7 y su bajo resuelve por semitono.',
      leading:'Se conserva la nota común y las notas guía del dominante resuelven por semitono.'
    };
    q.detail=q.notes.map(label).join(' – ')+(rules[kind]?'. '+rules[kind]:'');return q;
  }
  function sameNotes(actual,expected,{ordered=false,exact=false}={}){
    const normalize=arr=>arr.map(n=>exact?n:pc(n));let a=normalize(actual),b=normalize(expected);
    if(!ordered){a=[...new Set(a)].sort((x,y)=>x-y);b=[...new Set(b)].sort((x,y)=>x-y);}
    return JSON.stringify(a)===JSON.stringify(b);
  }
  function pianoMarkup(shown,showNames,exact){
    let white=0;
    return '<div class="pl-piano"><div class="pl-keyboard">'+Array.from({length:49},(_,i)=>48+i).map(m=>{
      const black=[1,3,6,8,10].includes(pc(m)),left=black?white*32-10:white++*32;
      return '<button style="left:'+left+'px" class="'+(black?'black ':'')+(shown.some(n=>exact?n===m:pc(n)===pc(m))?'selected':'')+'" data-midi="'+m+'" aria-label="'+NAMES[pc(m)]+(Math.floor(m/12)-1)+'">'+(showNames?NAMES[pc(m)]:'')+'</button>';
    }).join('')+'</div></div>';
  }
  function boardRegister(midis,instrument){
    if(!midis.length)return [];
    const low=Math.min(...instrument.tuning),high=Math.max(...instrument.tuning)+12;
    for(const shift of [0,-12,12,-24,24,-36,36])if(Math.min(...midis)+shift>=low&&Math.max(...midis)+shift<=high)return midis.map(m=>m+shift);
    return midis;
  }
  let audio,player,loading,token=0;
  async function play(groups,melodic=false){
    const mine=++token;
    try{
      audio ||= new (global.AudioContext||global.webkitAudioContext)();await audio.resume();
      if(!global.Soundfont?.instrument)throw new Error('No se ha cargado el piano. Comprueba la conexión y vuelve a intentar.');
      loading ||= global.Soundfont.instrument(audio,'acoustic_grand_piano');player ||= await loading;
      if(mine!==token)return;player.stop();
      let offset=0;
      groups.forEach(group=>{group.forEach((n,i)=>player.play(n.midi,audio.currentTime+offset+(melodic?i*.45:0),{duration:melodic?.4:.85,gain:.8}));offset+=melodic?group.length*.45:1;});
    }catch(e){loading=null;throw e;}
  }
  function mount(host,course){
    if(!host || host.dataset.labReady)return;host.dataset.labReady='true';
    host.className='practice-lab';
    host.innerHTML='<h3>Taller de práctica · ver, escuchar y construir</h3><p>Práctica breve de apoyo a tus clases. Elige el contenido, la superficie y la modalidad.</p><div class="pl-controls">'+
      [['kind','Contenido',BANKS[course]],['mode','Actividad',[['explore','Explorar'],['identify','Identificar'],['build','Construir']]],['surface','Representación',[['staff','Pentagrama'],['piano','Piano'],['board','Diapasón']]],['instrument','Instrumento',Object.entries(INSTRUMENTS).map(([k,v])=>[k,v.name])],['sense','Presentación',[['visual','Visual'],['audio','Solo auditiva'],['both','Audiovisual guiada']]]].map(([id,title,opts])=>'<label>'+title+'<select data-pl="'+id+'">'+opts.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select></label>').join('')+'</div><p data-pl="prompt"></p><div class="pl-actions"><button data-action="play">▶ Escuchar</button><button data-action="reference">Escuchar referencia</button><button data-action="stop">■ Detener</button></div><div data-pl="display"></div><div data-pl="editor"></div><div class="pl-answers" data-pl="answers"></div><div class="pl-actions"><button data-action="check">Comprobar construcción</button><button data-action="undo">Deshacer nota</button><button data-action="clear">Limpiar</button><button data-action="reveal">Mostrar explicación</button><button data-action="next">Nuevo ejemplo</button></div><p role="status" data-pl="feedback"></p><small>En piano y diapasón se comparan clases de altura, salvo los dictados (orden) y las inversiones (registro exacto). Los diagramas de cuerdas son mapas de notas, no digitaciones obligatorias.</small>';
    const get=id=>host.querySelector('[data-pl="'+id+'"]'),val=id=>get(id).value;
    host.querySelector('.pl-controls').insertAdjacentHTML('beforeend','<label hidden data-dictation-length>Notas del dictado<select data-pl="length">'+[2,3,4,5,6,7,8].map(n=>'<option '+(n===4?'selected':'')+'>'+n+'</option>').join('')+'</select></label>');
    let q,chosen=[],written=[],revealed=false;
    if(course==='ear'){get('sense').value='audio';get('mode').value='identify';}
    const sounding=async(groups,melodic)=>{try{await play(groups,melodic);}catch(e){get('feedback').textContent=e.message;}};
    function draw(){
      const mode=val('mode'),surface=val('surface'),show=revealed||mode==='explore'||(mode==='identify'&&val('sense')!=='audio');
      if(q.kind==='note'){
        const base=surface==='board'?(val('instrument')==='bass'?36:val('instrument')==='guitar'?48:60):60;
        q.notes=[note(base+pc(q.notes[0].midi))];q.reference=note(base);q.answer=label(q.notes[0]);q.detail=q.answer;
        q.choices=Array.from({length:12},(_,i)=>label(note(base+i)));
      }
      const shown=show?q.notes.map(n=>n.midi):chosen;
      const answerName=c=>val('sense')==='audio'&&q.kind==='interval'&&['4ª aumentada','5ª disminuida'].includes(c)?'Tritono':c;
      get('instrument').closest('label').hidden=surface!=='board';
      host.querySelector('[data-dictation-length]').hidden=q.kind!=='dictation';
      get('sense').disabled=q.kind==='key'||mode==='explore';get('surface').disabled=q.kind==='key';
      get('prompt').textContent=(q.context||'')+' '+(mode==='build'?(q.kind==='dictation'?'Reconstruye la melodía escuchada.':q.kind==='note'?'Ubica '+q.answer+'.':q.progression?'Completa '+q.answer+': construye el acorde final.':q.instruction||'Construye: '+(q.tonic||label(q.notes[0]))+' · '+q.answer+'.'):(mode==='explore'?q.answer:'Identifica el ejemplo.'));
      if(show&&['scale','jazzscale'].includes(q.kind))get('prompt').textContent+=' Tónica: '+label(q.notes[0])+'. Lectura ascendente.';
      host.querySelector('[data-action="reference"]').hidden=!q.reference;
      host.querySelector('[data-action="play"]').hidden=q.kind==='key';
      ['check','undo','clear'].forEach(a=>host.querySelector('[data-action="'+a+'"]').hidden=mode!=='build');
      get('editor').innerHTML='';
      if(q.kind==='key'){
        const key=show?q.key:Number(chosen[0]||0);get('display').innerHTML=global.CrescendoPractice.staff([],{key});
        if(mode==='build')get('editor').innerHTML='<label>Armadura <select data-key-input>'+KEYS.map(k=>'<option value="'+k[1]+'" '+(key===k[1]?'selected':'')+'>'+Math.abs(k[1])+' '+(k[1]<0?'bemoles':k[1]>0?'sostenidos':'alteraciones')+'</option>').join('')+'</select></label>';
      }else if(surface==='staff'){
        get('display').innerHTML=show&&q.progression?q.progression.map(ns=>global.CrescendoPractice.staff(ns,{stack:true})).join(''):(mode==='build'&&q.progression?q.progression.slice(0,-1).map(ns=>global.CrescendoPractice.staff(ns,{stack:true})).join(''):'')+global.CrescendoPractice.staff(show?q.notes:written,{stack:q.stack,clef:shown.length&&Math.max(...shown)<60?'bass':'treble'});
        if(mode==='build')get('editor').innerHTML='<div class="pl-controls"><label>Nota<select data-note-letter>'+LETTERS.map((l,i)=>'<option value="'+i+'">'+SOLFEGE[i]+' / '+l+'</option>').join('')+'</select></label><label>Alteración<select data-note-alter><option value="0">Natural</option><option value="1">Sostenido</option><option value="-1">Bemol</option><option value="2">Doble sostenido</option><option value="-2">Doble bemol</option></select></label><label>Octava<select data-note-octave>'+[2,3,4,5,6].map(o=>'<option '+(o===4?'selected':'')+'>'+o+'</option>').join('')+'</select></label><button data-action="add">Añadir nota</button></div>';
      }else if(surface==='piano'){
        get('display').innerHTML=pianoMarkup(shown,mode==='explore'||revealed,['note','inversion','leading'].includes(q.kind));
      }else{
        const ins=INSTRUMENTS[val('instrument')],positions=show&&q.kind==='inversion'?boardRegister(shown,ins):shown;
        get('display').innerHTML='<div class="pl-board-wrap"><p>'+ins.name+' · '+(ins.fretless?'Posiciones de semitono orientativas: el violín no tiene trastes.':'Cuerda al aire = 0; posiciones hasta el traste XII.')+(q.kind==='inversion'?' Se adapta la octava al instrumento conservando el bajo.':'')+'</p><div class="pl-board '+(ins.fretless?'pl-fretless':'')+'">'+ins.tuning.map((open,s)=>'<div class="pl-string"><b>'+ins.labels[s]+'</b>'+Array.from({length:13},(_,f)=>'<button data-midi="'+(open+f)+'" class="'+(positions.some(n=>['note','inversion'].includes(q.kind)?n===open+f:pc(n)===pc(open+f))?'selected':'')+'" aria-label="Cuerda '+(s+1)+', '+(ins.fretless?'posición':'traste')+' '+f+', '+NAMES[pc(open+f)]+'">'+(mode==='explore'||revealed?NAMES[pc(open+f)]:f)+'</button>').join('')+'</div>').join('')+'</div></div>';
      }
      get('answers').innerHTML=mode==='identify'&&!revealed?[...new Set(q.choices.map(answerName))].map(c=>'<button data-answer="'+esc(c)+'">'+esc(c)+'</button>').join(''):'';
      if(mode==='build'&&chosen.length&&q.kind!=='key')get('editor').insertAdjacentHTML('beforeend','<p>Tu respuesta: '+written.map(n=>esc(label(n))).join(' · ')+'</p>');
    }
    function next(){token++;player?.stop();q=makeQuestion(val('kind'),{length:Number(val('length'))});chosen=[];written=[];revealed=false;get('feedback').textContent='';if(q.kind==='dictation')get('mode').value='build';draw();}
    function feedback(ok){revealed=true;get('feedback').textContent=(ok?'Correcto. ':'Revisa la solución. ')+q.answer+(q.detail?' · '+q.detail:'')+(q.kind==='key'?' · '+Math.abs(q.key)+' alteraciones.':'');draw();}
    host.addEventListener('change',e=>{if(e.target.matches('[data-key-input]')){chosen=[Number(e.target.value)];draw();}else if(e.target===get('kind')||e.target===get('length'))next();else if(e.target.matches('[data-pl]')){chosen=[];written=[];revealed=false;get('feedback').textContent='';draw();}});
    host.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.midi){const m=Number(b.dataset.midi);if(val('mode')==='build'){chosen.push(m);written.push(note(m));draw();}sounding([[note(m)]],false);return;}
      if(b.dataset.answer){feedback(b.dataset.answer===q.answer||(b.dataset.answer==='Tritono'&&['4ª aumentada','5ª disminuida'].includes(q.answer)));return;}
      switch(b.dataset.action){
        case 'next':next();break;
        case 'stop':token++;player?.stop();break;
        case 'play':sounding(q.progression||[q.notes],!q.stack);break;
        case 'reference':sounding([[q.reference]],false);break;
        case 'add':{const i=Number(host.querySelector('[data-note-letter]').value),a=Number(host.querySelector('[data-note-alter]').value),o=Number(host.querySelector('[data-note-octave]').value),m=(o+1)*12+NATURAL[i]+a;chosen.push(m);written.push({midi:m,diatonic:o*7+i,alter:a});draw();break;}
        case 'undo':chosen.pop();written.pop();draw();break;
        case 'clear':chosen=[];written=[];revealed=false;draw();break;
        case 'reveal':feedback(false);break;
        case 'check':{
          let ok=q.kind==='key'?Number(chosen[0]||0)===q.key:sameNotes(chosen,q.notes.map(n=>n.midi),{ordered:['dictation','scale','jazzscale'].includes(q.kind),exact:['inversion','leading'].includes(q.kind)&&val('surface')!=='board'});
          if(q.kind==='inversion'&&val('surface')==='board')ok=ok&&pc(Math.min(...chosen))===pc(q.notes[0].midi);
          if(val('surface')==='staff'&&q.kind!=='key'){
            const spelling=ns=>ns.map(n=>((n.diatonic%7)+7)%7+':'+n.alter).sort().join('|');
            ok=ok&&spelling(written)===spelling(q.notes);
          }
          feedback(ok);break;
        }
      }
    });next();
  }
  function attach(parent,course){if(!parent||parent.querySelector('[data-practice-workshop]'))return;const d=document.createElement('details');d.dataset.practiceWorkshop='';d.innerHTML='<summary>Taller de práctica: pentagrama, piano, instrumentos y oído</summary><div></div>';parent.appendChild(d);mount(d.querySelector('div'),course);}
  global.CrescendoLab={INSTRUMENTS,makeQuestion,sameNotes,boardRegister,mount,attach};
})(window);
