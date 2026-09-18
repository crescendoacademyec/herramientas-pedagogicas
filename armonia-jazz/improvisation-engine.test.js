const assert = require("node:assert/strict");
const E = require("./improvisation-engine.js");

for (const root of Object.keys(E.ROOTS)) {
  for (const mode of Object.keys(E.MODES)) {
    const events = E.scale(root, mode);
    assert.ok(events.length >= 8);
    assert.ok(events.every(e => e.midi >= 60 && e.midi <= 88));
  }
  assert.equal(E.targets(root).length, 16);
  for (const type of ["below", "above", "enclosure", "double"]) assert.ok(E.approaches(root, type).length >= 8);
  for (const type of ["offbeat", "rests", "triplets", "mixed"]) assert.ok(E.rhythm(root, type).reduce((sum, e) => sum + e.beats, 0) > 0);
}
assert.equal(E.degreeMidi(60, 7), 72);
assert.equal(E.DIATONIC[4].roman, "V7");
console.log("improvisation-engine: OK");
