(function (global) {
  'use strict';
  const roots = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
  const natural = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const letters = 'CDEFGAB';
  const mod = n => (n % 12 + 12) % 12;
  // Offsets preserve register and hand assignment, unlike a pitch-class detector.
  const presets = [
    {id:'major6',label:'Sexta mayor',suffix:'6',offsets:[0,4,7,9],degrees:[1,3,5,6],kind:'shape',help:'1–3–5–6. Recorre las cuatro inversiones; la forma abierta baja la segunda voz desde arriba una octava.'},
    {id:'minor6',label:'Sexta menor',suffix:'m6',offsets:[0,3,7,9],degrees:[1,3,5,6],kind:'shape',help:'1–♭3–5–6: la sexta es mayor, aunque el acorde sea menor.'},
    {id:'dim7',label:'Disminuido de séptima',suffix:'º7',offsets:[0,3,6,9],degrees:[1,3,5,7],kind:'shape',help:'1–♭3–♭5–♭♭7. Cuatro terceras menores dividen la octava; la escritura depende de la función.'},
    {id:'shell-major',label:'Shell mayor',suffix:'maj7',offsets:[0,11,16],degrees:[1,7,3],hands:['left','left','right'],help:'Fundamental, séptima y tercera. La quinta se omite para destacar las notas guía.'},
    {id:'shell-minor',label:'Shell menor',suffix:'m7',offsets:[0,10,15],degrees:[1,7,3],hands:['left','left','right'],help:'Fundamental, séptima menor y tercera menor.'},
    {id:'shell-dominant',label:'Shell dominante',suffix:'7',offsets:[0,10,16],degrees:[1,7,3],hands:['left','left','right'],help:'La tercera y la séptima forman el tritono que impulsa la resolución.'},
    {id:'rooted-major',label:'Mayor · cinco notas con fundamental',suffix:'maj9',offsets:[0,7,11,16,26],degrees:[1,5,7,3,9],hands:['left','left','left','right','right'],help:'Bajo con fundamental; tercera y novena arriba. No intentes abarcar todo con una sola mano.'},
    {id:'rooted-minor',label:'Menor · cinco notas con fundamental',suffix:'m9',offsets:[0,7,10,15,26],degrees:[1,5,7,3,9],hands:['left','left','left','right','right'],help:'1–5–♭7 en la izquierda; ♭3–9 en la derecha.'},
    {id:'rooted-dominant',label:'Dominante · cinco notas con fundamental',suffix:'13',offsets:[0,10,16,21,26],degrees:[1,7,3,13,9],hands:['left','left','right','right','right'],help:'La quinta se omite; las tensiones 9 y 13 aportan el color dominante.'},
    {id:'major-a',label:'Mayor rootless A',suffix:'maj9',offsets:[4,7,11,14],degrees:[3,5,7,9],kind:'rootless',help:'3–5–7–9. Sin fundamental: el bajo o el contexto establece el centro.'},
    {id:'major-b',label:'Mayor rootless B',suffix:'maj13',offsets:[11,14,16,21],degrees:[7,9,3,13],kind:'rootless',help:'7–9–3–13. Alternativa de color y conducción, no una simple inversión de A.'},
    {id:'minor-a',label:'Menor rootless A',suffix:'m9',offsets:[3,7,10,14],degrees:[3,5,7,9],kind:'rootless',help:'♭3–5–♭7–9; útil como ii de una tonalidad mayor.'},
    {id:'minor-b',label:'Menor rootless B',suffix:'m9',offsets:[10,14,15,19],degrees:[7,9,3,5],kind:'rootless',help:'♭7–9–♭3–5. El registro se ajusta para evitar saltos innecesarios.'},
    {id:'dominant-a',label:'Dominante rootless A',suffix:'13',offsets:[4,9,10,14],degrees:[3,13,7,9],kind:'rootless',help:'3–13–♭7–9. La quinta se sustituye por la trecena.'},
    {id:'dominant-b',label:'Dominante rootless B',suffix:'13',offsets:[10,14,16,21],degrees:[7,9,3,13],kind:'rootless',help:'♭7–9–3–13. Conserva las notas comunes al enlazar ii–V–I.'},
    {id:'baga-tonic-a',label:'Tónica 6/9 · Baga A',suffix:'6/9',offsets:[4,7,9,14],degrees:[3,5,6,9],kind:'rootless',help:'3–5–6–9. Tónica mayor sin fundamental, distinta de maj9 porque usa sexta en lugar de séptima mayor.'},
    {id:'baga-tonic-b',label:'Tónica 6/9 · Baga B',suffix:'6/9',offsets:[9,14,16,19],degrees:[6,9,3,5],kind:'rootless',help:'6–9–3–5. Segunda disposición de la tónica 6/9 para enlazar el ii–V–I sin saltos amplios.'},
    {id:'half-dim',label:'Semidisminuido · forma menor sexta',suffix:'m7(b5)',offsets:[0,3,6,10],degrees:[1,3,5,7],kind:'shape',help:'Bm7♭5 y Dm6 comparten notas. El bajo y la función determinan el nombre.'},
    {id:'dominant-dim',label:'Dominante ♭9 · forma disminuida',suffix:'7(b9)',offsets:[0,16,19,22,25],degrees:[1,3,5,7,9],hands:['left','right','right','right','right'],help:'Sobre G: bajo G y B–D–F–A♭. La derecha forma Bdim7; juntos producen G7♭9.'},
    {id:'dominant-min6',label:'Dominante 9 · forma menor sexta',suffix:'9',offsets:[0,19,22,26,28],degrees:[1,5,7,9,3],hands:['left','right','right','right','right'],help:'Sobre G: Dm6 en la derecha (D–F–A–B) y G en el bajo forman G9.'},
    {id:'major-upper6',label:'Mayor 9 · sexta sobre el quinto grado',suffix:'maj9',offsets:[0,19,23,26,28],degrees:[1,5,7,9,3],hands:['left','right','right','right','right'],help:'Sobre C: G6 en la derecha (G–B–D–E) y C en el bajo forman Cmaj9.'},
    {id:'minor-upper6',label:'Menor 7 · forma mayor sexta',suffix:'m7',offsets:[0,15,19,22,24],degrees:[1,3,5,7,1],hands:['left','right','right','right','right'],help:'Sobre D: F6 en la derecha (F–A–C–D) y D en el bajo forman Dm7.'},
    {id:'altered',label:'Dominante rootless ♭9 ♭13',suffix:'7(b9)b13',offsets:[4,8,10,13],degrees:[3,13,7,9],kind:'rootless',help:'3–♭13–♭7–♭9. Una opción para resolver a una tónica menor.'}
  ];
  function spell(midi, root, degree) {
    const letter=letters[(letters.indexOf(roots[root][0])+degree-1)%7];
    let alter=mod(midi-natural[letter]); if(alter>6) alter-=12;
    const octave=(midi-natural[letter]-alter)/12-1;
    const glyph=alter<0?'♭'.repeat(-alter):'♯'.repeat(alter);
    return {midi,letter,alter,octave,label:letter+glyph+octave};
  }
  function degreeFor(pc, suffix) {
    if(pc===2 && /9|11|13/.test(suffix)) return 9;
    if(pc===5 && /11|13/.test(suffix) && !suffix.includes('sus')) return 11;
    if(pc===9 && suffix.includes('º7')) return 7;
    if(pc===3 && suffix.includes('#9')) return 9;
    if(pc===6 && suffix.includes('#11')) return 11;
    if(pc===8 && suffix.includes('b13')) return 13;
    if(pc===9 && suffix.includes('13')) return 13;
    return [1,9,2,3,3,4,5,5,5,6,7,7][pc];
  }
  function degreeLabel(note, root, degree) {
    const expected=[0,2,4,5,7,9,11][(degree-1)%7];
    let delta=mod(note.midi-root-expected); if(delta>6) delta-=12;
    return (delta<0?'♭'.repeat(-delta):'♯'.repeat(delta))+degree;
  }
  const fullFormulas={'9':[0,4,7,10,2],'m9':[0,3,7,10,2],'∆9':[0,4,7,11,2],'m∆9':[0,3,7,11,2],
    'm11':[0,3,7,10,2,5],'m∆11':[0,3,7,11,2,5],'13':[0,4,7,10,2,5,9],
    'm13':[0,3,7,10,2,5,9],'∆13':[0,4,7,11,2,5,9],'m∆13':[0,3,7,11,2,5,9]};
  function construct(pattern, root=0, inversion=0, octave=4) {
    const offsets=[...new Set(pattern.intervals)].sort((a,b)=>a-b);
    let notes=offsets.map(pc=>spell(12*(octave+1)+root+pc,root,degreeFor(pc,pattern.name)));
    for(let i=0;i<inversion%notes.length;i++){const n=notes.shift();notes.push({...n,midi:n.midi+12,octave:n.octave+1,label:n.label.replace(/-?\d+$/,String(n.octave+1))});}
    notes=notes.map((n,i)=>({...n,hand:notes.length>4&&i<notes.length-3?'left':'right',degree:degreeLabel(n,root,degreeFor(mod(n.midi-root),pattern.name))}));
    return {symbol:roots[root]+pattern.name,notes,help:'Notas del patrón reconocido. Algunas familias omiten voces: esto no es una fórmula completa obligatoria ni una única digitación.'};
  }
  function voice(id,root=0,options={}) {
    const p=presets.find(p=>p.id===id)||presets[0];
    const base=(p.kind==='shape'?60:48)+root+12*(options.register||0);
    let notes=p.offsets.map((offset,i)=>({...spell(base+offset,root,p.degrees[i]),degree:p.degrees[i],hand:p.hands?.[i]||'right'}));
    if(p.kind==='shape') {
      for(let i=0;i<(options.inversion||0)%notes.length;i++){const n=notes.shift();notes.push({...n,midi:n.midi+12});}
      if(options.open) notes[notes.length-2].midi-=12;
      notes.sort((a,b)=>a.midi-b.midi);
      notes.forEach((n,i)=>n.hand=options.open&&i===0?'left':'right');
    }
    if(p.kind==='rootless') notes.forEach((n,i)=>n.hand=options.hands==='left'||i<2?'left':'right');
    notes=notes.map(n=>({...spell(n.midi,root,n.degree),hand:n.hand,degree:degreeLabel(n,root,n.degree)}));
    return {symbol:roots[root]+p.suffix,notes,help:p.help,id:p.id};
  }
  function progression(root,minor=false,style='rootless',smooth=true) {
    const baga=style==='baga-a'||style==='baga-b';
    if(baga&&!minor){
      const ids=style==='baga-a'?['minor-a','dominant-b','baga-tonic-a']:['minor-b','dominant-a','baga-tonic-b'];
      const steps=[2,7,0].map((delta,i)=>({...voice(ids[i],mod(root+delta)),roman:['ii · Baga '+style.at(-1).toUpperCase(),'V · Baga '+style.at(-1).toUpperCase(),'I · Baga '+style.at(-1).toUpperCase()][i]}));
      if(smooth) smoothProgression(steps);
      return steps;
    }
    const ids=minor?(style==='shell'?['half-dim','shell-dominant','minor6']:style==='sixth'?['half-dim','dominant-dim','minor6']:['half-dim','altered','minor6']):
      (style==='shell'?['shell-minor','shell-dominant','shell-major']:style==='sixth'?['minor-upper6','dominant-min6','major-upper6']:['minor-a','dominant-b','major-a']);
    // In major, the ii is a minor seventh, not a half-diminished chord.
    const steps=[2,7,0].map((delta,i)=>{
      const r=mod(root+delta);
      const v=voice(ids[i],r);
      return {...v,roman:minor?['iiø7','V7','i6'][i]:['ii','V','I'][i]};
    });
    if(smooth) smoothProgression(steps);
    return steps;
  }
  function smoothProgression(steps) {
    for(let i=1;i<steps.length;i++) {
      const avg=ns=>ns.reduce((s,n)=>s+n.midi,0)/ns.length;
      const prev=avg(steps[i-1].notes);
      const shift=[-12,0,12].sort((a,b)=>Math.abs(avg(steps[i].notes)+a-prev)-Math.abs(avg(steps[i].notes)+b-prev))[0];
      steps[i].notes=steps[i].notes.map(n=>({...n,midi:n.midi+shift,octave:n.octave+shift/12,label:n.label.replace(/-?\d+$/,String(n.octave+shift/12))}));
    }
  }
  const api={roots,presets,fullFormulas,construct,voice,progression,spell};
  global.CrescendoPianoVoicings=api;
  if(typeof module!=='undefined') module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
