const assert = require('assert');
global.window = {};
require('../js/data.js');
require('../js/generators.js');
const D = window.ETData;
const G = window.ETGenerators;

const expected = [
  ['c5',[0,7]], ['cmaj',[0,4,7]], ['cmin',[0,3,7]], ['caug',[0,4,8]], ['cdim',[0,3,6]], ['csus2',[0,2,7]],
  ['csus4',[0,5,7]], ['csus24',[0,2,5,7]], ['cadd2',[0,2,4,7]], ['cmadd2',[0,2,3,7]], ['cadd4',[0,4,5,7]], ['cmadd4',[0,3,5,7]],
  ['c6',[0,4,7,9]], ['cm6',[0,3,7,9]], ['cmaj7',[0,4,7,11]], ['cmmaj7',[0,3,7,11]], ['c7',[0,4,7,10]], ['cm7',[0,3,7,10]],
  ['c7sus4',[0,5,7,10]], ['cm7add4',[0,3,5,7,10]], ['c7s5',[0,4,8,10]], ['c7b5',[0,4,6,10]], ['cm7b5',[0,3,6,10]], ['cdim7',[0,3,6,9]],
  ['cmaj7s5',[0,4,8,11]], ['cmaj7b5',[0,4,6,11]], ['cadd9',[0,4,7,14]], ['cmadd9',[0,3,7,14]], ['cmaj9',[0,4,7,11,14]], ['c9',[0,4,7,10,14]], ['c7b9',[0,4,7,10,13]],
  ['c7s9',[0,4,7,10,15]], ['cm9',[0,3,7,10,14]], ['c9s5',[0,4,8,10,14]], ['c9b5',[0,4,6,10,14]], ['c69',[0,4,7,9,14]], ['cm69',[0,3,7,9,14]], ['c9sus4',[0,5,7,10,14]],
  ['c11',[0,4,7,10,14,17]], ['cm11',[0,3,7,10,14,17]], ['c13',[0,4,7,10,14,17,21]], ['c13sus4',[0,5,7,10,14,21]], ['cmaj13',[0,4,7,11,14,17,21]], ['c13b9',[0,4,7,10,13,17,21]], ['c13s9',[0,4,7,10,15,17,21]],
  ['c7s11',[0,4,7,10,18]], ['cmaj7s11',[0,4,7,11,18]], ['c9s11',[0,4,7,10,14,18]], ['cmaj9s11',[0,4,7,11,14,18]], ['c13s11',[0,4,7,10,14,18,21]], ['c7s9b5',[0,4,6,10,15]], ['c7b9s5',[0,4,8,10,13]]
];

assert.strictEqual(D.CHORD_BANK.length, 52, 'El banco debe tener 52 acordes');
assert.strictEqual(new Set(D.CHORD_BANK.map(c => c.id)).size, 52, 'IDs de acordes duplicados');
assert.strictEqual(new Set(D.CHORD_BANK.map(c => c.intervals.join(','))).size, 52, 'Fórmulas auditivas duplicadas');
for (const [id, formula] of expected) {
  const chord = D.CHORD_BANK.find(c => c.id === id);
  assert(chord, `Falta ${id}`);
  assert.deepStrictEqual(chord.intervals, formula, `Fórmula incorrecta en ${id}`);
}

const config = {
  intervals:D.INTERVALS.map(x=>x.semitones), chords:D.CHORD_BANK.map(x=>x.id),
  level3Targets:[0,1,2,3,4,5,6], level3Refs:[0,1,2,3,4,5,6], level3Type:'tetrad',
  intervalMode:'random', register:'random', chordVoicing:'random', tonalReference:'chord'
};
for (let level=1; level<=8; level++) {
  for (let i=0; i<100; i++) {
    const r = G.generate(level, config);
    assert(r.options.length > 0, `Nivel ${level} sin opciones`);
    assert(r.correctIdx >= 0 && r.correctIdx < r.options.length, `Nivel ${level} correctIdx inválido`);
    for (const step of r.seq || []) for (const note of step.notes || []) assert(Number.isFinite(note), `Nivel ${level} nota inválida`);
  }
}
console.log('OK · 52 acordes únicos y 8 generadores validados.');
