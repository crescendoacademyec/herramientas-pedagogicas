const test=require('node:test');
const assert=require('node:assert/strict');
const api=require('../../shared/piano-voicings.js');
const patterns=require('../../shared/piano-chord-patterns.js');
const naturals={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function validate(v){
  assert.ok(v.notes.length);
  for(const n of v.notes){assert.ok(n.midi>=21&&n.midi<=108);assert.equal(12*(n.octave+1)+naturals[n.letter]+n.alter,n.midi);assert.ok(['left','right'].includes(n.hand));}
  assert.equal(new Set(v.notes.map(n=>n.midi)).size,v.notes.length);
}
test('Todos los patrones del detector: 12 raíces e inversiones con escritura coherente',()=>{
  assert.ok(patterns.length>100);
  for(const p of patterns)for(let root=0;root<12;root++)for(let inv=0;inv<p.intervals.length;inv++){
    const v=api.construct(p,root,inv);validate(v);
    assert.deepEqual([...new Set(v.notes.map(n=>(n.midi-root+120)%12))].sort((a,b)=>a-b),[...p.intervals].sort((a,b)=>a-b));
  }
});
test('Voicings: todas las tonalidades, inversiones, registros y disposiciones',()=>{
  for(const p of api.presets)for(let root=0;root<12;root++)for(const register of [-1,0,1])for(const open of [false,true])for(let inversion=0;inversion<4;inversion++)validate(api.voice(p.id,root,{register,open,inversion}));
});
test('Relaciones jazz y ortografía del disminuido',()=>{
  assert.deepEqual(api.voice('dominant-dim',7).notes.map(n=>n.midi%12),[7,11,2,5,8]);
  assert.deepEqual(api.voice('major-upper6',0).notes.map(n=>n.midi%12),[0,7,11,2,4]);
  const last=api.voice('dim7',0).notes.at(-1);assert.equal(last.letter,'B');assert.equal(last.alter,-2);
});
test('ii–V–I en doce tonos: el ii mayor es menor séptima, el menor es semidisminuido',()=>{
  for(let root=0;root<12;root++)for(const minor of [false,true])for(const style of ['shell','sixth','rootless'])for(const smooth of [false,true]){
    const seq=api.progression(root,minor,style,smooth);assert.equal(seq.length,3);seq.forEach(validate);
    const pcs=seq[0].notes.map(n=>(n.midi-root-2+120)%12);
    if(minor||style!=='shell')assert.ok(pcs.includes(minor?6:7));
    assert.ok(pcs.includes(3));assert.ok(pcs.includes(10));
  }
});
