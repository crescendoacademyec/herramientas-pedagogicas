/*
 * Diccionario original de posiciones para guitarra/requinto.
 * Vocabulario armónico contrastado con All the Chords (Jeffrey Kunde, 2020):
 * tríadas, suspendidos, sextas, séptimas y extensiones habituales. Las
 * posiciones se generan aquí para no reproducir los diagramas del libro.
 * Guitarra estándar y requinto estándar tienen el mismo patrón interválico
 * entre cuerdas; por eso las digitaciones son transferibles.
 */
(function(global){
  const roots={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
  const qualities={
    '':['Mayor',[0,4,7]], m:['Menor',[0,3,7]], aug:['Aumentado',[0,4,8]], dim:['Disminuido',[0,3,6]],
    sus2:['Suspendido 2',[0,2,7]], sus4:['Suspendido 4',[0,5,7]],
    '6':['Sexta',[0,4,7,9]], m6:['Menor sexta',[0,3,7,9]],
    maj7:['Séptima mayor',[0,4,7,11]], '7':['Séptima dominante',[0,4,7,10]], m7:['Menor séptima',[0,3,7,10]],
    m7b5:['Semidisminuido',[0,3,6,10]], dim7:['Disminuido séptima',[0,3,6,9]],
    '9':['Novena dominante',[0,2,4,7,10]], maj9:['Novena mayor',[0,2,4,7,11]], m9:['Novena menor',[0,2,3,7,10]]
  };
  const qualityOrder=['','m','aug','dim','sus2','sus4','6','m6','maj7','7','m7','m7b5','dim7','9','maj9','m9'];
  const tuning=[40,45,50,55,59,64]; // E A D G B E, de grave a aguda
  const pc=(n)=>((n%12)+12)%12;

  function combinations(candidates,index=[],out=[],depth=0){
    if(depth===candidates.length){out.push(index.slice());return out;}
    candidates[depth].forEach(f=>{index.push(f);combinations(candidates,index,out,depth+1);index.pop();});
    return out;
  }
  function makeVoicing(root,quality,start){
    const tones=qualities[quality][1], allowed=new Set(tones.map(i=>pc(root+i)));
    const candidates=tuning.map(open=>{
      const found=[];
      for(let fret=start;fret<=Math.min(12,start+4);fret++)if(allowed.has(pc(open+fret)))found.push(fret);
      return found.slice(0,3);
    });
    const choices=combinations(candidates);
    let best=null,bestScore=-Infinity;
    choices.forEach(frets=>{
      const intervals=new Set(frets.map((f,i)=>pc(tuning[i]+f-root)));
      const coverage=tones.filter(t=>intervals.has(t)).length;
      if(!intervals.has(0)||coverage<Math.min(3,tones.length))return;
      const nonOpen=frets.filter(f=>f>0),span=nonOpen.length?Math.max(...nonOpen)-Math.min(...nonOpen):0;
      const score=coverage*100-span*9-nonOpen.reduce((sum,f)=>sum+f,0)*.12;
      if(score>bestScore){bestScore=score;best=frets;}
    });
    return best;
  }
  const entries=[];
  Object.entries(roots).forEach(([root,rootPc])=>{
    qualityOrder.forEach(quality=>{
      [0,4,8].forEach((start,position)=>{
        const frets=makeVoicing(rootPc,quality,start);
        if(frets)entries.push({id:`${root}-${quality||'maj'}-${position+1}`,root,quality,name:root+quality,frets,position:position+1,source:'All the Chords · voicing original'});
      });
    });
  });
  function midis(entry,instrument='guitar',capo=0){
    const transposition=instrument==='requinto'?5:0;
    return entry.frets.map((f,i)=>tuning[i]+transposition+f+capo);
  }
  function validate(entry){
    const root=roots[entry.root],allowed=new Set(qualities[entry.quality][1]);
    const tones=new Set(midis(entry).map(n=>pc(n-root)));
    return entry.frets.length===6&&entry.frets.every(f=>Number.isInteger(f)&&f>=0&&f<=12)&&tones.has(0)&&[...tones].every(t=>allowed.has(t));
  }
  const api={entries,roots,qualities,qualityOrder,midis,validate};
  global.GuitarChordBank=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
