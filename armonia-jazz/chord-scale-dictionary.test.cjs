const assert = require('node:assert/strict');
const d = require('./chord-scale-dictionary.js');
assert.equal(d.chordName(0, 'maj7'), 'Cmaj7');
assert.equal(d.chordName(7, '7'), 'G7');
assert.equal(d.ROWS.length, 4);
assert.ok(d.SCALE.harmonicMajor);
assert.ok(d.allRows().length >= d.ROWS.length);
assert.ok(d.allRows().some(row => row.scale === 'wholeTone'));
for (const row of d.ROWS) {
  assert.equal(row.qualities.length, 7);
  assert.equal(row.modes.length, 7);
  for (const mode of row.modes) assert.ok(d.SCALE[mode]);
}
assert.deepEqual(d.scaleNotes(0, 'ionian'), [0,2,4,5,7,9,11]);
