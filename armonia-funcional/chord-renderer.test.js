const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(`${__dirname}/chords-ref.js`, "utf8"), context);

const ref = context.ChordRef;
const core = context.__ChordCore;
const openPitchClasses = [4, 11, 7, 2, 9, 4];
const openMidi = [64, 59, 55, 50, 45, 40];
let combinations = 0;

for (const rootName of ref.ROOTS) {
  const root = ref.rootInfo(rootName);
  for (const chordType of ref.CHORD_TYPES) {
    combinations += 1;
    const tones = ref.chordTones(root, chordType.formula);
    const parsed = core.parseFormula(chordType.formula);

    assert.equal(tones.length, new Set(parsed.map(tone => tone.semi)).size,
      `${rootName}${chordType.symbol}: alturas repetidas`);
    assert.ok(tones.every(tone => tone.name && !tone.name.includes("?")),
      `${rootName}${chordType.symbol}: nota sin ortografía válida`);
    tones.forEach((tone, index) => {
      assert.equal(tone.pc, (root.pc + parsed[index].semi + 120) % 12,
        `${rootName}${chordType.symbol}: clase de altura incorrecta`);
    });

    const staff = ref.staffSVG(root, tones);
    const staffHeads = (staff.match(/<ellipse\b/g) || []).length;
    assert.equal(staffHeads, tones.length,
      `${rootName}${chordType.symbol}: cantidad incorrecta en pentagrama`);

    const piano = ref.pianoSVG(root, tones);
    const activeKeys = (piano.match(/\bjz-key-on\b/g) || []).length;
    assert.equal(activeKeys, tones.length,
      `${rootName}${chordType.symbol}: cantidad incorrecta en piano`);

    const playable = core.findGuitarVoicing(root, tones);
    assert.ok(playable, `${rootName}${chordType.symbol}: no se encontró voicing de guitarra`);
    const expectedGuitarNotes = Math.min(6, tones.length);
    assert.equal(playable.assignment.length, expectedGuitarNotes,
      `${rootName}${chordType.symbol}: cantidad incorrecta en guitarra`);
    assert.equal(new Set(playable.assignment.map(note => note.si)).size, playable.assignment.length,
      `${rootName}${chordType.symbol}: más de una nota en una cuerda`);
    playable.assignment.forEach(note => {
      assert.equal((openPitchClasses[note.si] + note.fret) % 12, note.tone.pc,
        `${rootName}${chordType.symbol}: traste incorrecto para ${note.tone.name}`);
    });
    const sounding = playable.assignment.slice().sort((a, b) =>
      (openMidi[a.si] + a.fret) - (openMidi[b.si] + b.fret));
    const expectedOrder = tones
      .slice()
      .sort((a, b) => a.semi - b.semi)
      .filter(tone => sounding.some(note => note.tone === tone));
    assert.deepEqual(Array.from(sounding, note => note.tone.name), Array.from(expectedOrder, tone => tone.name),
      `${rootName}${chordType.symbol}: voces cruzadas o desplazadas de octava`);

    const guitar = ref.guitarSVG(root, tones);
    const guitarDots = (guitar.match(/<circle\b/g) || []).length;
    assert.equal(guitarDots, expectedGuitarNotes,
      `${rootName}${chordType.symbol}: notas repetidas en el SVG de guitarra`);
  }
}

assert.deepEqual(
  Array.from(ref.chordTones(ref.rootInfo("C"), "1 3 5 7 9 13"), tone => tone.name),
  ["C", "E", "G", "B", "D", "A"]
);
assert.deepEqual(
  Array.from(ref.chordTones(ref.rootInfo("D♭"), "1 3 5 b7 b9 #11"), tone => tone.name),
  ["D♭", "F", "A♭", "C♭", "E♭♭", "G"]
);

const cMajor = core.findGuitarVoicing(
  ref.rootInfo("C"),
  ref.chordTones(ref.rootInfo("C"), "1 3 5")
).assignment.slice().sort((a, b) => a.midi - b.midi);
assert.deepEqual(
  Array.from(cMajor, note => [note.tone.name, note.si + 1, note.fret]),
  [["C", 5, 3], ["E", 4, 2], ["G", 3, 0]],
  "C mayor debe mostrarse como C(A3), E(D2), G(G0)"
);

console.log(`Renderer verificado: ${combinations} combinaciones de acorde/fundamental.`);
