const assert = require('node:assert/strict');
const d = require('./chord-scale-dictionary.js');
assert.equal(d.chordName(0, 'maj7'), 'Cmaj7');
assert.equal(d.chordName(7, '7'), 'G7');
assert.equal(d.ROWS.length, 4);
assert.ok(d.SCALE.harmonicMajor);
assert.ok(d.allRows().length >= d.ROWS.length);
assert.ok(d.allRows().some(row => row.scale === 'wholeTone'));
assert.ok(!d.allRows().some(row => row.scale.startsWith('dictionary-')));
assert.equal(d.degreeCipher(d.ROWS[0], 0, 'maj7'), 'Imaj7');
assert.equal(d.degreeCipher(d.ROWS[1], 2, 'maj7♯5'), '♭IIImaj7♯5');
assert.equal(d.degreeCipher(d.ROWS[0], 1, 'm7'), 'iim7');
assert.equal(d.displayQuality('(1–♭2–3–5)'), '');
assert.equal(d.displayQuality('7♯11'), '7♯11');
assert.deepEqual(d.tensions(d.scaleNotes(0, 'ionian'), [0,4,7,11], 0), ['9', '13']);
for (const row of d.ROWS) {
  assert.equal(row.qualities.length, 7);
  assert.equal(row.modes.length, 7);
  for (const mode of row.modes) assert.ok(d.SCALE[mode]);
}
for (const row of d.ROWS) {
  row.qualities.forEach((quality, degree) => {
    const root = d.SCALE[row.scale][degree];
    const notes = d.scaleNotes(root, row.modes[degree]);
    const chordIntervals = {maj7:[0,4,7,11],m7:[0,3,7,10],7:[0,4,7,10],"m7♭5":[0,3,6,10],"m(maj7)":[0,3,7,11],"maj7♯5":[0,4,8,11],"7♯11":[0,4,6,7,10],"°7":[0,3,6,9]}[quality];
    const chord = chordIntervals.map(interval => (root + interval) % 12);
    const available = d.tensions(notes, chord, root);
    if (chordIntervals.includes(4)) assert.ok(!available.includes('11'), `${row.name}, grado ${degree + 1} no ofrece 11 natural contra la tercera mayor`);
  });
}
assert.deepEqual(d.scaleNotes(0, 'ionian'), [0,2,4,5,7,9,11]);
