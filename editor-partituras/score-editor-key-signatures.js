(function (global) {
  const MAJOR_KEY_SIGNATURES = Object.freeze({
    C: { accidental: "natural", count: 0 },
    G: { accidental: "sharp", count: 1 },
    D: { accidental: "sharp", count: 2 },
    A: { accidental: "sharp", count: 3 },
    E: { accidental: "sharp", count: 4 },
    B: { accidental: "sharp", count: 5 },
    "F#": { accidental: "sharp", count: 6 },
    "C#": { accidental: "sharp", count: 7 },
    F: { accidental: "flat", count: 1 },
    Bb: { accidental: "flat", count: 2 },
    Eb: { accidental: "flat", count: 3 },
    Ab: { accidental: "flat", count: 4 },
    Db: { accidental: "flat", count: 5 },
    Gb: { accidental: "flat", count: 6 },
    Cb: { accidental: "flat", count: 7 }
  });

  const MINOR_KEY_SIGNATURES = Object.freeze({
    a: { accidental: "natural", count: 0 },
    e: { accidental: "sharp", count: 1 },
    b: { accidental: "sharp", count: 2 },
    "f#": { accidental: "sharp", count: 3 },
    "c#": { accidental: "sharp", count: 4 },
    "g#": { accidental: "sharp", count: 5 },
    "d#": { accidental: "sharp", count: 6 },
    "a#": { accidental: "sharp", count: 7 },
    d: { accidental: "flat", count: 1 },
    g: { accidental: "flat", count: 2 },
    c: { accidental: "flat", count: 3 },
    f: { accidental: "flat", count: 4 },
    bb: { accidental: "flat", count: 5 },
    eb: { accidental: "flat", count: 6 },
    ab: { accidental: "flat", count: 7 }
  });

  const STAFF_STEPS = Object.freeze({
    sharp: [4, 1, 5, 2, -1, 3, 0],
    flat: [0, 3, -1, 2, -2, 1, -3]
  });

  const LETTER_ORDERS = Object.freeze({
    sharp: [3, 0, 4, 1, 5, 2, 6],
    flat: [6, 2, 5, 1, 4, 0, 3]
  });

  function normalizeInput(value) {
    return String(value || "")
      .trim()
      .replace(/♯/g, "#")
      .replace(/♭/g, "b");
  }

  function parse(value) {
    const normalized = normalizeInput(value);
    if (!normalized) return null;
    const match = normalized.match(/^([A-Ga-g])\s*([#b]?)(?:\s*\((mayor|menor|major|minor)\))?$/i);
    if (!match) return null;
    const [, rawLetter, accidental = "", explicitMode = ""] = match;
    const explicitModeKey = explicitMode.toLowerCase();
    const mode = explicitMode
      ? (/menor|minor/.test(explicitModeKey) ? "minor" : "major")
      : rawLetter === rawLetter.toLowerCase()
        ? "minor"
        : "major";
    const tonic = `${rawLetter.toUpperCase()}${accidental}`;
    const lookupKey = mode === "minor" ? `${rawLetter.toLowerCase()}${accidental}` : tonic;
    const signature = mode === "minor"
      ? MINOR_KEY_SIGNATURES[lookupKey]
      : MAJOR_KEY_SIGNATURES[lookupKey];
    if (!signature) return null;
    return {
      tonic,
      mode,
      accidental: signature.accidental,
      count: signature.count,
      label: `${tonic} ${mode === "minor" ? "menor" : "mayor"}`,
      source: normalized
    };
  }

  function accidentalCount(signature) {
    const count = Number(signature?.count) || 0;
    return Math.max(0, Math.min(7, count));
  }

  function glyphName(signature) {
    return signature?.accidental === "sharp" ? "accidentalSharp" : "accidentalFlat";
  }

  function accidentalForDiatonicStep(diatonicStep, signature) {
    const count = accidentalCount(signature);
    if (!count || !["sharp", "flat"].includes(signature?.accidental) || !Number.isFinite(diatonicStep)) return null;
    const letterIndex = ((Math.round(diatonicStep) % 7) + 7) % 7;
    const order = LETTER_ORDERS[signature.accidental] || [];
    return order.slice(0, count).includes(letterIndex) ? signature.accidental : null;
  }

  function staffStep(signature, index) {
    const steps = STAFF_STEPS[signature?.accidental] || [];
    return Number.isFinite(steps[index]) ? steps[index] : 0;
  }

  function accidentalBySemitone(value) {
    return {
      "-2": "double-flat",
      "-1": "flat",
      0: "natural",
      1: "sharp",
      2: "double-sharp"
    }[String(Math.max(-2, Math.min(2, value)))];
  }

  function accidentalSemitone(accidental) {
    return {
      "double-flat": -2,
      flat: -1,
      natural: 0,
      sharp: 1,
      "double-sharp": 2
    }[accidental] ?? 0;
  }

  global.JMLScoreKeySignatures = Object.freeze({
    MAJOR_KEY_SIGNATURES,
    MINOR_KEY_SIGNATURES,
    STAFF_STEPS,
    normalizeInput,
    parse,
    accidentalBySemitone,
    accidentalCount,
    glyphName,
    accidentalForDiatonicStep,
    accidentalSemitone,
    staffStep
  });
})(window);
