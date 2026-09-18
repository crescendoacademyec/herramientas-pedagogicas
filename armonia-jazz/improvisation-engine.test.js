const assert = require("node:assert/strict");
require("../shared/rhythm-engine.js");
const E = require("./improvisation-engine.js");

for (const root of Object.keys(E.ROOTS)) {
  for (const mode of Object.keys(E.MODES)) {
    const events = E.scale(root, mode);
    assert.ok(events.length >= 8);
    assert.ok(events.every(e => e.midi >= 60 && e.midi <= 88));
  }
  assert.equal(E.targets(root).length, 16);
  for (const type of ["below", "above", "enclosure", "double"]) assert.ok(E.approaches(root, type).length >= 8);
  for (const type of ["offbeat", "rests", "triplets", "mixed"]) assert.equal(E.rhythm(root, type).reduce((sum, e) => sum + e.beats, 0),4);
  for(const type of ["tree","charleston","reverse","redGarland","funk"]){
    const events=E.locking(root,type,.5);
    assert.ok(events.length>1);
    assert.equal(events.reduce((sum,e)=>sum+e.beats,0),4);
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
