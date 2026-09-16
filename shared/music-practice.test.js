const assert=require('node:assert/strict');
global.window={};require('./music-practice.js');
const P=window.CrescendoPractice;
const decode=s=>s.match(/data-cp-xml="([^"]*)"/)[1].replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
for(const [beats,type] of [[4,'whole'],[2,'half'],[1,'quarter'],[.5,'eighth'],[.25,'16th'],[.125,'32nd'],[.0625,'64th']]){
  for(const kind of ['note','rest']){
    const xml=decode(P.sequence([{note:'C4',beats,kind}],{meter:'4/4'}));
    assert.ok(xml.includes(`<type>${type}</type>`));
    assert.ok(xml.includes(`<duration>${beats*48}</duration>`));
    assert.equal(xml.includes('<rest/>'),kind==='rest');
  }
}
const triplet=decode(P.sequence(Array.from({length:3},()=>({beats:1/3,kind:'triplet'}))));
assert.equal((triplet.match(/<tuplet /g)||[]).length,2);
assert.ok(!triplet.includes('type="continue"'));
assert.ok(decode(P.sequence([{beats:1.5}])).includes('<dot/>'));
assert.ok(decode(P.sequence([{tieStart:true},{tied:true}])).includes('<tied type="stop"/>'));
const pc=[0,2,4,5,7,9,11];
for(const kind of ['key','interval','scale','chord'])for(const clef of ['treble','bass'])for(let i=0;i<100;i++){
  const q=P.question(kind,{clef,family:i%2?'minor':'major',inversions:true});
  assert.ok(q.choices.includes(q.answer));assert.equal(new Set(q.choices).size,q.choices.length);
  q.notes.forEach(n=>assert.equal(n.midi,12*(Math.floor(n.diatonic/7)+1)+pc[n.diatonic%7]+n.alter));
  const svg=P.staff(q.notes,{clef,key:q.key||0,stack:q.stack});
  assert.ok(!svg.includes('NaN'));assert.ok(!svg.includes('undefined'));
  assert.ok(!svg.includes(q.answer),'El pentagrama no debe revelar la respuesta');
}
require('../ear-training/js/data.js');require('../ear-training/js/generators.js');
for(const scale of P.scales){
  const round=window.ETGenerators.generate(9,{register:'mid',forcedConceptIds:['scale:'+scale.id]});
  assert.equal(round.options[round.correctIdx].id,'scale:'+scale.id);
  assert.deepEqual(round.seq.map(e=>e.notes[0]-round.meta.rootMidi),scale.steps);
  assert.ok(P.review(round).includes('cp-staff'));
}
console.log('800 preguntas verificadas: grafía, respuestas, claves, inversiones y 4 escalas auditivas.');
