(function (global) {
  "use strict";

  const ROOTS = { C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65, Gb: 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71 };
  const MAJOR = [0, 2, 4, 5, 7, 9, 11];
  const MODES = {
    stepwise: { name: "Escala por grados", degrees: [0, 1, 2, 3, 4, 5, 6, 7] },
    thirds: { name: "Terceras diatónicas", degrees: [0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7] },
    fourths: { name: "Saltos diatónicos", degrees: [0, 3, 1, 4, 2, 5, 3, 6, 4, 7] },
    sevenths: { name: "Arpegios de séptima", degrees: [0, 2, 4, 6, 1, 3, 5, 7] },
    permutation: { name: "Permutación 1–3–2–4", degrees: [0, 2, 1, 3, 1, 3, 2, 4, 2, 4, 3, 5] }
    ,triads: { name: "Tríadas diatónicas", degrees: [0,2,4,1,3,5,2,4,6,3,5,7,4,6,8,5,7,9,6,8,10] }
    ,pentatonicSkip: { name: "Saltos pentatónicos", degrees: [0,2,1,4,2,5,4,7] }
    ,threeOverFour: { name: "Tres sobre cuatro", degrees: [0,1,2,1,2,3,2,3,4,3,4,5] }
  };
  const DIATONIC = [
    { roman: "Imaj7", degrees: [0, 2, 4, 6] }, { roman: "iim7", degrees: [1, 3, 5, 7] },
    { roman: "iiim7", degrees: [2, 4, 6, 8] }, { roman: "IVmaj7", degrees: [3, 5, 7, 9] },
    { roman: "V7", degrees: [4, 6, 8, 10] }, { roman: "vim7", degrees: [5, 7, 9, 11] },
    { roman: "viiø7", degrees: [6, 8, 10, 12] }
  ];

  function degreeMidi(rootMidi, degree) {
    const octave = Math.floor(degree / 7);
    const index = ((degree % 7) + 7) % 7;
    return rootMidi + MAJOR[index] + octave * 12;
  }
  function eventsFromDegrees(root, degrees, beats) {
    return degrees.map((degree, index) => ({ midi: degreeMidi(ROOTS[root], degree), beats: beats || .5, label: String(degree + 1), bar: Math.floor(index / 8) }));
  }
  function scale(root, mode) { return eventsFromDegrees(root, MODES[mode].degrees); }
  function motive(root) {
    const seed = [0, 2, 1, 3];
    return eventsFromDegrees(root, seed.concat(seed.map(n => n + 1), seed.map(n => n + 3)));
  }
  function targets(root) {
    const progression = [DIATONIC[1], DIATONIC[4], DIATONIC[0], DIATONIC[5]];
    return progression.flatMap((chord, bar) => chord.degrees.map((degree, i) => ({
      midi: degreeMidi(ROOTS[root], degree), beats: 1, bar, label: i === 0 ? chord.roman : ""
    })));
  }
  function approaches(root, type) {
    const targetsList = [degreeMidi(ROOTS[root], 2), degreeMidi(ROOTS[root], 6), degreeMidi(ROOTS[root], 4), degreeMidi(ROOTS[root], 0) + 12];
    const makers = {
      below: t => [t - 1, t], above: t => [t + 1, t], enclosure: t => [t + 1, t - 1, t], double: t => [t - 2, t - 1, t]
    };
    return targetsList.flatMap((target, group) => makers[type](target).map((midi, i, notes) => ({ midi, beats: notes.length === 3 ? .5 : 1, bar: Math.floor(group / 2), label: i === notes.length - 1 ? "objetivo" : "aprox." })));
  }
  function rhythm(root, type) {
    const pitch = ROOTS[root];
    const patterns = {
      offbeat: [{ kind: "rest", beats: .5 }, { beats: .5 }, { beats: 1 }, { kind: "rest", beats: .5 }, { beats: .5 }, { beats: 1 }],
      rests: [{ beats: 1 }, { kind: "rest", beats: 1 }, { beats: .5 }, { beats: .5 }, { kind: "rest", beats: 1 }],
      triplets: Array.from({ length: 6 }, () => ({ beats: 1 / 3, kind: "triplet" })),
      mixed: [{ beats: 1.5 }, { beats: .5 }, { beats: 1 }, { kind: "rest", beats: .5 }, { beats: .5 }]
    };
    return patterns[type].map((event, index) => ({ ...event, midi: pitch + MAJOR[index % 7], bar: 0 }));
  }
  global.CrescendoImprovisationEngine = { ROOTS, MODES, DIATONIC, degreeMidi, scale, motive, targets, approaches, rhythm };
  if (typeof module !== "undefined") module.exports = global.CrescendoImprovisationEngine;
})(typeof window === "undefined" ? globalThis : window);
