(function () {
  'use strict';
  const api=window.CrescendoPianoVoicings;
  // Append, never insert: persisted topic progress uses array indices.
  LEVELS[1].topics.push({
    title:'2.12 Laboratorio de piano: sextas, disminuidos y enlaces',
    html:`<p>Un <b>acorde</b> define relaciones entre notas; un <b>voicing</b> decide sus octavas, omisiones y reparto entre las manos. Aprende primero la fórmula y después una posición cómoda.</p>
      <h4>Tres formas básicas</h4><ul><li><b>Mayor sexta:</b> 1–3–5–6. En C: C–E–G–A.</li><li><b>Menor sexta:</b> 1–♭3–5–6. En C: C–E♭–G–A. La sexta sigue siendo mayor.</li><li><b>Disminuido de séptima:</b> 1–♭3–♭5–♭♭7. En C: C–E♭–G♭–B♭♭, no una sexta escrita como A.</li></ul>
      <p>Recorre las cuatro inversiones en posición cerrada. Después baja una octava la segunda voz desde arriba (drop 2): es una disposición abierta; reparte las manos sin forzar la extensión.</p>
      <h4>Una forma, distintas funciones</h4><ul><li><b>G6 sobre bajo C:</b> C–G–B–D–E forma Cmaj9.</li><li><b>Dm6 sobre bajo G:</b> G–D–F–A–B forma G9.</li><li><b>Bdim7 sobre bajo G:</b> G–B–D–F–A♭ forma G7♭9.</li><li><b>Dm6 con B en el bajo:</b> B–D–F–A forma Bm7♭5.</li></ul>
      <p>No basta reconocer las teclas: C6 y Am7 comparten notas, pero la función y el bajo orientan su nombre.</p>
      <h4>Aplicación y rutina</h4><p>En mayor, practica Dm7–G9–Cmaj9; en menor, Bm7♭5–E7♭9–Am6. Mantén notas comunes, escucha el movimiento de las terceras y séptimas y transpón gradualmente a las doce tonalidades. Comienza lento, con un acorde cada cuatro pulsos.</p>
      <p>En el banco puedes comparar el registro inicial con otro más cercano. Acercar registros no garantiza por sí solo la mejor conducción: observa también cada voz. Los ejemplos son generados por Crescendo y no requieren cargar partituras externas.</p>`
  });
  function attach(host,title){
    if(/Sistema Baga/i.test(title))return;
    const sixth=/sextas, disminuidos|disminuidos de paso/i.test(title);
    const rootless=/rootless/i.test(title);
    const shell=/shell/i.test(title);
    const progression=/ii.?V.?I/i.test(title);
    const general=/Cifrado de acordes|Laboratorio de acordes|Inversiones|Drop voicings/i.test(title);
    if(!sixth&&!rootless&&!shell&&!progression&&!general)return;
    const section=document.createElement('section');section.className='jazz-piano-bank';
    const heading=document.createElement('h4');heading.textContent='Del concepto a las manos · Piano Virtual';section.appendChild(heading);
    const controls=document.createElement('div');controls.className='jazz-piano-controls';
    function select(label,items){const wrapper=document.createElement('label');wrapper.append(document.createTextNode(label));const el=document.createElement('select');items.forEach(([v,t])=>{const opt=document.createElement('option');opt.value=v;opt.textContent=t;el.appendChild(opt);});wrapper.appendChild(el);controls.appendChild(wrapper);return el;}
    const root=select('Tonalidad',api.roots.map((r,i)=>[i,r]));
    const allowed=api.presets.filter(p=>sixth?['major6','minor6','dim7','half-dim','dominant-dim','dominant-min6','major-upper6','minor-upper6'].includes(p.id):rootless?p.kind==='rootless':shell?p.id.startsWith('shell'):true);
    const voicing=select('Posición para practicar',allowed.map(p=>[p.id,p.label]));
    section.appendChild(controls);
    const explanation=document.createElement('p');section.appendChild(explanation);
    const noteList=document.createElement('p');section.appendChild(noteList);
    const actions=document.createElement('div');actions.className='jazz-piano-links';section.appendChild(actions);
    const link=document.createElement('a');link.textContent='Practicar este voicing en Piano Virtual →';actions.appendChild(link);
    const major=document.createElement('a');major.textContent='Practicar ii–V–I mayor →';actions.appendChild(major);
    const minor=document.createElement('a');minor.textContent='Practicar ii–V–I menor →';actions.appendChild(minor);
    const build=document.createElement('a');build.textContent='Construir acordes desde cero →';actions.appendChild(build);
    function update(){
      const r=Number(root.value),v=api.voice(voicing.value,r);
      explanation.textContent=v.help;
      noteList.textContent=v.symbol+' · '+v.notes.map(n=>n.label+' ('+n.degree+')').join(' · ');
      link.href='../piano-virtual/index.html?'+new URLSearchParams({bank:'jazz',root:r,voicing:voicing.value});
      const style=sixth?'sixth':shell?'shell':'rootless';
      major.href='../piano-virtual/index.html?'+new URLSearchParams({bank:'progression',root:r,style});
      minor.href='../piano-virtual/index.html?'+new URLSearchParams({bank:'progression',root:r,style,minor:1});
      build.href='../piano-virtual/index.html?'+new URLSearchParams({bank:'build',root:r});
    }
    root.onchange=voicing.onchange=update;update();host.appendChild(section);
  }
  window.CrescendoJazzPiano={attach};
})();
