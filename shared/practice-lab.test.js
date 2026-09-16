const assert=require('node:assert/strict');
global.window={};require('./music-practice.js');require('./practice-lab.js');
const L=window.CrescendoLab;
assert.deepEqual(L.INSTRUMENTS.guitar.tuning,[64,59,55,50,45,40]);
assert.deepEqual(L.INSTRUMENTS.bass.tuning,[43,38,33,28]);
assert.deepEqual(L.INSTRUMENTS.ukulele.tuning,[69,64,60,67]);
assert.deepEqual(L.INSTRUMENTS.violin.tuning,[76,69,62,55]);
assert.ok(L.INSTRUMENTS.violin.fretless);
const natural=[0,2,4,5,7,9,11];
for(const kind of ['note','key','interval','scale','triad','function','cadence','inversion','leading','seventh','tension','shell','jazzcadence','dictation','jazzscale','substitution']){
  for(let i=0;i<100;i++){
    const q=L.makeQuestion(kind);
    assert.ok(q.answer);
    if(kind!=='dictation')assert.ok(q.choices.includes(q.answer),kind+' answer unavailable');
    for(const n of [...q.notes,...(q.progression||[]).flat()]){
      assert.equal(n.midi,12*(Math.floor(n.diatonic/7)+1)+natural[n.diatonic%7]+n.alter,kind+' spelling');
      assert.ok(Math.abs(n.alter)<=2,kind+' accidental');
    }
    assert.ok(L.sameNotes(q.notes.map(n=>n.midi),q.notes.map(n=>n.midi)));
    if(kind==='inversion')Object.values(L.INSTRUMENTS).forEach(ins=>{
      const mapped=L.boardRegister(q.notes.map(n=>n.midi),ins);
      assert.ok(Math.min(...mapped)>=Math.min(...ins.tuning));
      assert.ok(Math.max(...mapped)<=Math.max(...ins.tuning)+12);
      assert.ok(L.sameNotes(mapped,q.notes.map(n=>n.midi)));
    });
  }
}
assert.ok(L.sameNotes([48,52,55],[60,64,67]));
assert.ok(!L.sameNotes([64,60],[60,64],{ordered:true}));
assert.ok(!L.sameNotes([48,52,55],[60,64,67],{exact:true}));
for(let length=2;length<=8;length++)assert.equal(L.makeQuestion('dictation',{length}).notes.length,length);
console.log('1600 ejercicios: respuestas, grafías, registros, afinaciones y dictados de 2–8 notas verificados.');
