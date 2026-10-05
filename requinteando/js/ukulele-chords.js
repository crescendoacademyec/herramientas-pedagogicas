/* Reference: Los-acordes-del-ukelele.pdf, pages A–G.
 * Frets are always G C E A (PDF order), NOT the app's reversed string order.
 * null means muted. Unmarked strings in the source are open.
 */
(function(global){
  const qualities={
    '':['Mayor',[0,4,7]],'6':['Sexta',[0,4,7,9]],'7':['Séptima dominante',[0,4,7,10]],
    '9':['Novena dominante',[0,4,7,10,2]],maj7:['Séptima mayor',[0,4,7,11]],
    m:['Menor',[0,3,7]],m6:['Menor sexta',[0,3,7,9]],m7:['Menor séptima',[0,3,7,10]],
    m9:['Menor novena',[0,3,7,10,2]],sus2:['Suspendido 2',[0,2,7]],sus4:['Suspendido 4',[0,5,7]],
    aug:['Aumentado',[0,4,8]],dim7:['Disminuido séptima',[0,3,6,9]],maj9:['Novena mayor',[0,4,7,11,2]]
  };
  const roots={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
  const rows={
    A:'=2100 6=6600 7=0100 9=0152 maj7=1100 m=2000 m6=5600 m7=0000 m9=2032 sus2=4400 sus4=2200 dim7=2323',
    'A#':'=3211 m=3111 7=1211 maj7=3210 m7=1111 sus2=3011 sus4=3311 maj9=3055',
    B:'=4322 6=1322 7=2322 9=4354 maj7=4321 m=4222 m6=1222 m7=2222 m9=4254 sus2=4122 sus4=4422 aug=0332 dim7=1212',
    C:'=0003 6=0000 7=0001 9=3203 maj7=0002 m=0333 m6=0353 m7=3333 m9=7066 sus2=0233 sus4=0013 aug=1003 dim7=2323',
    'C#':'=1114 6=1111 7=1112 9=4314 maj7=1113 m=1104 m6=1101 m7=1102 m9=4304 sus2=1344 sus4=1124 aug=2110 dim7=0101',
    D:'=2220 6=2222 7=2223 9=5425 maj7=2224 m=2210 m6=2212 m7=2213 m9=5505 sus2=2200 sus4=0230 aug=3221 dim7=1212',
    'D#':'=0331 6=3333 7=3334 9=0314 maj7=3335 m=3321 m6=3323 m7=6666 m9=6526 sus2=3311 sus4=1341 aug=0332 dim7=2323',
    E:'=4442 6=1102 7=1202 9=1425 maj7=1302 m=0432 m6=0102 m7=0202 m9=0425 sus2=4422 sus4=2402 aug=1003 dim7=0101',
    F:'=2010 6=2015 7=2313 9=0310 maj7=2413 m=1013 m6=1015 m7=1313 m9=0546 sus2=0013 sus4=3011 aug=2110 dim7=1212',
    'F#':'=3121 6=3324 7=6667 9=1421 maj7=3524 m=2120 m6=2324 m7=6600 m9=1420 sus2=1124 sus4=4122 aug=3221 dim7=5320',
    G:'=0232 6=0202 7=0212 9=4530 maj7=0222 m=0231 m6=0201 m7=0211 m9=3530 sus2=0230 sus4=0035 aug=0332 dim7=0101',
    'G#':'=x343 6=1313 7=1323 9=1021 maj7=0343 m=1342 m6=1312 m7=1322 m9=3642 sus2=1341 sus4=1344 aug=1003 dim7=1212'
  };
  const pages={A:1,B:2,C:3,D:4,E:5,F:6,G:7};
  const entries=Object.entries(rows).flatMap(([root,row])=>row.split(' ').map((token,i)=>{
    const [quality,frets]=token.split('=');
    return {id:root+'-'+i,root,quality,name:root+quality,frets:[...frets].map(x=>x==='x'?null:Number(x)),page:pages[root[0]]};
  }));
  // Second Em shape shown in the source.
  entries.push({id:'E-m-alt',root:'E',quality:'m',name:'Em',frets:[4,4,3,2],page:5});
  entries.find(e=>e.name==='D6').correction='El PDF muestra 1–1–1–1 (C♯6). Se corrige a 2–2–2–2 para D6.';
  entries.find(e=>e.name==='Csus2').correction='Se pisa la cuerda E en el traste 3 para evitar la tercera mayor y obtener Csus2.';
  entries.find(e=>e.id==='E-m-alt').correction='La segunda postura de Em del PDF no coincide con sus notas en G–C–E–A. Se ofrece la alternativa verificada 4–4–3–2.';
  function midis(entry,lowG=false,capo=0){
    const tuning=[lowG?55:67,60,64,69];
    return entry.frets.flatMap((f,i)=>f===null?[]:[tuning[i]+f+capo]);
  }
  function validate(entry){
    const allowed=qualities[entry.quality][1],root=roots[entry.root];
    return midis(entry).every(m=>allowed.includes((m-root+120)%12));
  }
  const api={entries,qualities,roots,midis,validate};
  global.UkuleleChordBank=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
