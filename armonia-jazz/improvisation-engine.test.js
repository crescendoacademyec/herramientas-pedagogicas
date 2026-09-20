const assert = require("node:assert/strict");
require("../shared/rhythm-engine.js");
const E = require("./improvisation-engine.js");

for (const root of Object.keys(E.ROOTS)) {
  for (const mode of Object.keys(E.MODES)) {
    const events = E.scale(root, mode);
    assert.ok(events.filter(e=>e.kind!=="rest").length >= 6);
    assert.ok(events.filter(e=>e.kind!=="rest").every(e => e.midi >= 21 && e.midi <= 108));
  }
  assert.equal(E.targets(root).length, 16);
  for (const type of ["below", "above", "enclosure", "double"]) assert.ok(E.approaches(root, type).length >= 8);
  for (const type of ["offbeat", "rests", "triplets", "mixed"]) assert.equal(E.rhythm(root, type).reduce((sum, e) => sum + e.beats, 0),4);
  for(const type of ["tree","charleston","reverse","redGarland","funk"]){
    const events=E.locking(root,type,.5);
    assert.ok(events.length>1);
    assert.equal(events.reduce((sum,e)=>sum+e.beats,0),["charleston","reverse"].includes(type)?8:4);
  }
  for (const progression of ["major251", "minor251", "tritone"]) {
    for (const direction of ["down", "up"]) {
      const events=E.gravity(root,progression,direction);
      assert.equal(events.length,12);
      assert.ok(events.every(e=>Number.isFinite(e.midi)&&e.beats>0));
      assert.equal(events.filter(e=>e.target).length,3);
    }
  }
}
assert.equal(E.degreeMidi(60, 7), 72);
assert.equal(E.DIATONIC[4].roman, "V7");
assert.notDeepEqual(E.locking("C","tree",0).map(e=>e.beats),E.locking("C","tree",0).map(e=>e.beats));
console.log("improvisation-engine: OK");

// Each category is a full randomized cycle, independent of key and other categories.
const signature = events => events.map(e => `${e.kind}:${e.beats.toFixed(8)}`).join('|');
for (const type of ['offbeat', 'rests', 'triplets', 'mixed']) {
  const store = new Map();
  const storage = {getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value)};
  const generator = E.createRhythmGenerator({storage, random:()=>.371});
  const total = generator.progress(type).total, seen = new Set();
  assert.ok(total > 100);
  let last;
  for (let i=0;i<total;i++) {
    const events=generator.next(i%2?'F':'C',type), pattern=signature(events);
    assert.ok(!seen.has(pattern), `${type}: repeated before exhausting cycle`);
    seen.add(pattern);last=pattern;
    assert.equal(events.reduce((sum,event)=>sum+event.beats,0),4);
    assert.ok(events.every(event=>event.beats>0&&Number.isFinite(event.midi)));
    assert.ok(events.some(event=>event.kind!=='rest'));
    if(type==='rests')assert.ok(events.some(event=>event.kind==='rest'));
    if(type==='mixed')assert.ok(new Set(events.filter(e=>e.kind!=='rest').map(e=>e.beats)).size>1);
    if(type==='triplets')assert.ok(events.some(event=>event.kind==='triplet'));
    if(type==='offbeat'){
      let at=0,found=false;
      for(const event of events){if(event.kind!=='rest'&&at%1===.5&&event.beats>=1)found=true;at+=event.beats;}
      assert.ok(found);
    }
  }
  assert.equal(seen.size,total);
  const restored = E.createRhythmGenerator({storage,random:()=>.371});
  restored.progress(type);
  const firstNext=signature(generator.next('C',type));
  assert.notEqual(firstNext,last,'No immediate repetition across cycles');
  assert.equal(signature(restored.next('C',type)),firstNext,'Reload continues the same cycle');
}
{
  const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
  const a=E.createRhythmGenerator({storage,random:()=>.23});
  for(let i=0;i<17;i++)a.next('C','mixed');
  const b=E.createRhythmGenerator({storage,random:()=>.85});
  b.progress('mixed');
  assert.equal(signature(a.next('C','mixed')),signature(b.next('C','mixed')));
  const before=a.progress('mixed').used;a.next('C','rests');assert.equal(a.progress('mixed').used,before);
  const other=E.createRhythmGenerator({storage:null,random:()=>.85});
  const fresh=E.createRhythmGenerator({storage:null,random:()=>.23});
  assert.notDeepEqual(Array.from({length:10},()=>signature(other.next('C','mixed'))),Array.from({length:10},()=>signature(fresh.next('C','mixed'))));
  const blocked=E.createRhythmGenerator({storage:{getItem(){throw Error('blocked')},setItem(){throw Error('full')}}});
  assert.equal(blocked.next('C','rests').reduce((s,e)=>s+e.beats,0),4);
}
console.log('rhythm cycles: unique, complete, persistent and musically valid');

// All figures fill measures exactly, including tuplets and their padding rests.
for(const figure of Object.keys(E.FIGURES))for(const mode of Object.keys(E.MODES)){
  const events=E.scale('Gb',mode,{figure}),bars=new Map();
  for(const e of events){assert.ok(e.beats>0);bars.set(e.bar,(bars.get(e.bar)||0)+Math.round(e.beats*48));if(e.kind!=='rest'){assert.ok(Number.isFinite(e.midi));assert.ok(Math.abs(e.beats-E.FIGURES[figure])<1e-9);}}
  for(const ticks of bars.values())assert.equal(ticks,192,`${mode}/${figure}: complete bar`);
}
for(let interval=1;interval<=8;interval++){
 const notes=E.scale('C','intervals',{interval,direction:'up'}).filter(e=>e.kind!=='rest');
 for(let i=0;i<notes.length;i+=2)assert.equal(notes[i+1].diatonic-notes[i].diatonic,interval-1);
}
for(const mode of ['triads','sevenths'])for(let chord=0;chord<7;chord++)for(let inversion=0;inversion<(mode==='triads'?3:4);inversion++){
 const seen=new Set(),total=mode==='triads'?6:24;
 for(let i=0;i<total;i++){
  const notes=E.scale('C',mode,{chord,inversion}).filter(e=>e.kind!=='rest');
  const sig=notes.map(n=>n.midi).join(',');assert.ok(!seen.has(sig));seen.add(sig);
  const degrees=new Set(notes.map(n=>(n.diatonic-28)%7));assert.deepEqual([...degrees].sort(),Array.from({length:mode==='triads'?3:4},(_,j)=>(chord+2*j)%7).sort());
 }
}
for(let i=0;i<100;i++){
 const notes=E.scale('C','jumps').slice(0,4),gaps=notes.slice(1).map((n,j)=>Math.abs(n.diatonic-notes[j].diatonic));
 assert.ok(gaps.every(g=>g>=2));assert.ok(new Set(gaps).size>1);
}
for(const type of ['tree','charleston','reverse','redGarland','funk'])for(const shift of [0,.5,1,1.5]){
 const seen=new Set();for(let i=0;i<8;i++){const events=E.locking('C',type,shift);const sig=events.map(e=>`${e.kind}:${e.beats}:${e.tied}`).join('|');assert.ok(!seen.has(sig),`${type}/${shift}`);seen.add(sig);}
}
console.log('Figures, intervals, all diatonic arpeggios/inversions, mixed jumps and rhythmic displacements: OK');
{
 const fs=require('node:fs'),vm=require('node:vm'),data=new Map();
 const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const load=()=>{const ctx={localStorage:storage};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/improvisation-engine.js','utf8'),ctx);return ctx.CrescendoImprovisationEngine;};
 const a=load(),seen=new Set();let last;
 for(let i=0;i<14;i++){last=JSON.stringify(a.scale('C','stepwise'));assert.ok(!seen.has(last));seen.add(last);}
 const next=JSON.stringify(a.scale('C','stepwise'));assert.notEqual(last,next);
 const snapshot=new Map(data),b=load(),expected=JSON.stringify(a.scale('C','stepwise'));data.clear();for(const [k,v] of snapshot)data.set(k,v);assert.equal(JSON.stringify(b.scale('C','stepwise')),expected);
 const before=a.materialProgress().used;a.scale('D','stepwise');assert.equal(a.materialProgress().used,before+1);
}
console.log('Melodic cycles persist across reload and transposition: OK');
