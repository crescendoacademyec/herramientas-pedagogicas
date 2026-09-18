const assert=require('node:assert/strict');
const R=require('./rhythm-engine.js');
assert.equal(Object.keys(R.PLACEMENTS).length,8);
assert.equal(R.placementFrame('twoFour',1,4).audible,true);
assert.equal(R.placementFrame('twoFour',0,4).audible,false);
assert.equal(R.placementFrame('upbeat',1,4).audible,true);
assert.equal(R.placementFrame('tripletEnd',2,4).audible,true);
for(const p of R.EAR_PATTERNS){
  const seq=R.patternSequence(p.id);assert.ok(seq.length>8);assert.ok(seq.every(e=>Number.isFinite(e.start)&&e.notes.every(Number.isFinite)));
}
for(const id of ['tree','charleston','reverse','redGarland','funk'])assert.ok(R.notationPattern(id).reduce((n,e)=>n+e.beats,0)>0);
console.log('rhythm-engine: OK');
