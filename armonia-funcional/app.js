const DATA = window.APP_DATA;
const PIANO_NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PIANO_FULL_RANGE = Object.freeze({ from: "C1", to: "C7" });
const PIANO_SELECT_DEFAULT_RANGE = PIANO_FULL_RANGE;
const MODULE_3_REMOVED_QUESTION_IDS = new Set([17, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 34, 46]);
const MODULE_3_PIANO_PROMPTS = {
  1: "Seleccione una fundamental en registro ideal de bajo para Dm7.",
  2: "Seleccione una fundamental en registro ideal de bajo para F7.",
  3: "Seleccione las notas guía de G7 en registro medio.",
  4: "Seleccione una posición cerrada en registro medio para A∆9 sin bajo.",
  5: "Seleccione un Spread completo para Dm9.",
  6: "Seleccione una separación clara entre bajo y notas guía para Bb∆.",
  7: "Seleccione en el teclado un shell válido para F mayor.",
  8: "Seleccione en el teclado un shell válido para D∆.",
  9: "Seleccione en el teclado un shell válido para G7.",
  10: "Seleccione en el teclado un shell válido para A-7.",
  11: "Seleccione en el teclado un shell válido para E∆9.",
  12: "Seleccione en el teclado un shell válido para Bb mayor.",
  13: "Seleccione en el teclado un shell válido para D7.",
  14: "Seleccione en el teclado un shell válido para Db7.",
  15: "Seleccione en el teclado un shell válido para A∆9.",
  16: "Seleccione en el teclado un shell válido para G∆.",
  17: "Seleccione una posición cerrada de C∆9.",
  18: "Seleccione Skip 2 desde posición cerrada para F∆9 desde A como base.",
  19: "Seleccione una posición cerrada de Dm9 sin bajo.",
  24: "Seleccione una posición cerrada completa de C∆9 con nota interna agregada.",
  27: "Seleccione una triada grave con separación recomendada para F mayor comenzando debajo de C3.",
  28: "Seleccione una triada grave con separación recomendada para Bb/F comenzando debajo de C3.",
  29: "Para Ab7, seleccione la nota del acorde ubicada justo debajo de Ab3.",
  30: "Para E9, seleccione la extensión ubicada justo encima de E3.",
  31: "Para E11, seleccione la extensión ubicada justo debajo de B3.",
  32: "Para E13, seleccione la extensión ubicada justo encima de B3.",
  33: "Para Db7, seleccione la nota del acorde ubicada justo debajo de Db3.",
  34: "Para Bb13, seleccione la extensión ubicada justo encima de F3.",
  35: "Seleccione la triada básica de E mayor como primer paso para construir E13.",
  36: "En G13, seleccione la nota que puede reemplazar a la fundamental.",
  37: "En F13, seleccione la nota que puede reemplazar a la quinta justa.",
  38: "Seleccione las notas que pertenecen a Bbm11.",
  39: "Seleccione las notas de G13(b9) sin quinta.",
  40: "Seleccione un voicing de G13(b9).",
  41: "En Gm11, seleccione la nota que puede reemplazar a la quinta justa.",
  42: "Seleccione Cm11 con soporte grave de fundamental.",
  43: "Seleccione las notas de F13 sin quinta.",
  44: "Para Bb13(#11), seleccione las dos extensiones superiores del acorde.",
  45: "Seleccione las notas de E13(b9) sin quinta.",
  47: "Seleccione bajo/acorde para Am7 con fundamental grave y notas guía en la mano derecha.",
  48: "Seleccione bajo/acorde para G7 con fundamental grave y notas guía en la mano derecha.",
  49: "Seleccione bajo/acorde para A7 con fundamental grave, notas guía en mano derecha y quinta en voz superior.",
  50: "Seleccione bajo/acorde para Gm7 con fundamental y séptima en la izquierda, tercera en la derecha.",
  51: "Seleccione bajo/acorde de Cm7 con fundamental y séptima en la izquierda, tercera en la derecha.",
  52: "Seleccione F#m11 en bajo/acorde.",
  53: "Seleccione Em11 en disposición bajo/acorde.",
  54: "Seleccione G13(#11)."
};
const MODULE_3_QUESTION_OVERRIDES = {
  3: {
    prompt: "Seleccione las notas guía de C7 en registro medio.",
    answers: ["E3", "A#3"],
    noteLabels: { "A#3": "Bb3" },
    sampleAnswer: "E3 y Bb3.",
    acceptMode: "pitchClass",
    layout: {
      allMin: 48,
      allMax: 72
    }
  },
  4: {
    answers: ["C#4", "E4", "G#4", "B4"],
    acceptedAnswers: [["G#3", "B3", "C#4", "E4"]],
    sampleAnswer: "C#4, E4, G#4 y B4; también una inversión cerrada equivalente.",
    acceptMode: "pitchClass",
    layout: {
      allMin: 48,
      allMax: 72,
      totalMaxSpan: 11
    }
  },
  5: {
    prompt: "Seleccione un Spread de Dm9 con fundamental en el bajo; la quinta puede omitirse.",
    acceptedAnswers: [["D3", "C4", "F4", "A4", "E5"]],
    sampleAnswer: "D2, F3, C4 y E4; también un Spread equivalente con quinta.",
    acceptMode: "pitchClass",
    layout: {
      bassPitchClass: 2,
      bassMax: 50,
      minGapAboveBass: 8,
      upperMin: 48
    }
  },
  6: {
    acceptedAnswers: [["A#2", "A3", "D4"]],
    sampleAnswer: "Bb2, D4 y A4; también Bb2, A3 y D4.",
    acceptMode: "pitchClass",
    layout: {
      bassPitchClass: 10,
      bassMax: 47,
      minGapAboveBass: 8,
      upperMin: 48
    }
  },
  15: {
    keyboardRange: { from: "C3", to: "C6" }
  },
  16: {
    keyboardRange: { from: "C3", to: "C6" }
  },
  19: {
    acceptMode: "pitchClass",
    layout: {
      allMin: 48,
      allMax: 72,
      totalMaxSpan: 11
    }
  },
  35: {
    answers: ["E3", "G#3", "B3"],
    sampleAnswer: "E3, G#3 y B3."
  },
  36: {
    answers: ["A4"],
    sampleAnswer: "A4."
  },
  37: {
    prompt: "En Ab13, seleccione la nota que reemplaza a Eb en el procedimiento de construcción.",
    answers: ["F4"],
    sampleAnswer: "F4."
  },
  38: {
    prompt: "Seleccione un voicing de Bbm11; puede incluir la fundamental o ser rootless.",
    answers: ["A#2", "C#3", "F3", "G#3", "C4", "D#4"],
    noteLabels: { "A#2": "Bb2", "C#3": "Db3", "G#3": "Ab3", "D#4": "Eb4" },
    acceptedAnswers: [["C#4", "D#4", "G#4", "C5"]],
    sampleAnswer: "Bb2, Db3, F3, Ab3, C4 y Eb4."
  },
  39: {
    acceptedAnswers: [["F3", "G#3", "B3", "E4"]],
    sampleAnswer: "G2, B3, F4, Ab4 y E4; también el voicing rootless F, Ab, B y E.",
    forbiddenIntervals: [7]
  },
  40: {
    prompt: "Seleccione las clases de nota de Db13(b9); puede incluir la fundamental o ser rootless.",
    answers: ["C#2", "B2", "F3", "D4", "A#4"],
    noteLabels: { "C#2": "Db2", "B2": "Cb3", "D4": "Ebb4", "A#4": "Bb4" },
    acceptedAnswers: [["F3", "A#3", "B3", "D4"]],
    sampleAnswer: "Db2, Cb3, F3, Ebb4 y Bb4."
  },
  41: {
    prompt: "En Gm11, seleccione la nota que reemplaza a D en el procedimiento de construcción.",
    answers: ["C4"],
    sampleAnswer: "C4."
  },
  42: {
    answers: ["C2", "D#3", "A#3", "D4", "F4"],
    noteLabels: { "D#3": "Eb3", "A#3": "Bb3" },
    acceptedAnswers: [["C2", "D#3", "F3", "A#3", "D4"]],
    sampleAnswer: "C2, Eb3, Bb3, D4 y F4.",
    acceptMode: "pitchClass",
    layout: {
      bassPitchClass: 0,
      bassMax: 48,
      minGapAboveBass: 8,
      upperMin: 48
    }
  },
  43: {
    forbiddenIntervals: [7]
  },
  45: {
    forbiddenIntervals: [7]
  },
  47: {
    answers: ["A2", "C4", "G4"],
    acceptedAnswers: [["A2", "G3", "C4"]],
    sampleAnswer: "A2, C4 y G4."
  },
  48: {
    acceptedAnswers: [["G2", "F3", "B3"]],
    sampleAnswer: "G2, B3 y F4; también G2, F3 y B3."
  },
  49: {
    keyboardRange: { from: "C2", to: "C6" },
    answers: ["A2", "C#4", "G4", "E5"],
    acceptedAnswers: [["A2", "G3", "C#4", "E4"]],
    sampleAnswer: "A2, C#4, G4 y E5."
  },
  51: {
    prompt: "Seleccione bajo/acorde de Cm7 con fundamental y séptima en la izquierda, tercera en la derecha y duplicación opcional de la nota guía superior.",
    answers: ["C3", "A#3", "D#4"],
    noteLabels: { "A#3": "Bb3", "D#4": "Eb4" },
    acceptedAnswers: [["C3", "A#3", "D#4", "D#5"]],
    sampleAnswer: "C3, Bb3 y Eb4; opcionalmente Eb5 duplicada."
  },
  52: {
    answers: ["F#2", "E3", "A3", "B3", "G#4"],
    acceptedAnswers: [["F#2", "E3", "G#3", "A3", "B3"]],
    sampleAnswer: "F#2, E3, A3, B3 y G#4; la 9 puede ubicarse en otra octava.",
    acceptMode: "pitchClass",
    layout: {
      bassPitchClass: 6,
      bassMax: 47,
      minGapAboveBass: 8,
      upperMin: 48
    }
  },
  53: {
    acceptedAnswers: [["E2", "G3", "A3", "D4", "F#4"]],
    sampleAnswer: "E2, D3, G3, A3 y F#4; también E2, G3, A3, D4 y F#4.",
    acceptMode: "pitchClass",
    layout: {
      bassPitchClass: 4,
      bassMax: 47,
      minGapAboveBass: 8,
      upperMin: 48
    }
  },
  54: {
    noteLabels: { "C#4": "C#/Db4" },
    parserCiphers: ["G13(#11)", "G13(b5)"],
    sampleAnswer: "G2, F3, B3, C#/Db4, E4 y A4."
  }
};
const MODULE_3_ANALYSIS_BASS = {
  5: "D2",
  7: "F2",
  8: "D2",
  9: "G2",
  10: "A2",
  11: "E2",
  12: "A#2",
  13: "D2",
  14: "C#2",
  15: "A2",
  16: "G2",
  18: "F2",
  27: "F2",
  38: "A#2",
  39: "G2",
  40: "C#2",
  42: "C2",
  43: "F2",
  45: "E2",
  52: "F#2",
  53: "E2",
  54: "G2"
};
const MODULE_3_PARSER_CIPHERS = {
  5: ["Dm9"],
  38: ["Bbm11"],
  39: ["G13(b9)"],
  40: ["Db13(b9)"],
  42: ["Cm11"],
  43: ["F13"],
  45: ["E13(b9)"],
  52: ["F#m11"],
  53: ["Em11"],
  54: ["G13(#11)", "G13(b5)"]
};
const MODULE_3_SHELL_ALTERNATIVES = {
  7: [["F3", "A3"]],
  8: [["D3", "F#3"], ["D3", "C#4"], ["F#3", "C#4"], ["C#4", "F#4", "A4"]],
  9: [["G3", "B3"], ["G3", "F4"], ["B3", "F4"], ["F3", "B3", "D4"], ["B3", "F4", "A4"]],
  10: [["A3", "C4"], ["A3", "G4"], ["C4", "G4"], ["G3", "C4", "E4"], ["C4", "G4", "B4"]],
  11: [["E3", "G#3"], ["E3", "D#4"], ["G#3", "D#4"], ["G#3", "D#4", "F#4"], ["D#4", "G#4", "B4"]],
  12: [["A#2", "D3"]],
  13: [["D3", "F#3"], ["D3", "C4"], ["F#3", "C4"], ["C4", "F#4", "A4"], ["F#3", "C4", "E4"]],
  14: [["C#3", "F3"], ["C#3", "B3"], ["F3", "B3"], ["B3", "F4", "G#4"], ["F3", "B3", "D#4"]],
  15: [["A3", "C#4"], ["A3", "G#4"], ["C#4", "G#4"], ["C#4", "G#4", "B4"], ["G#4", "C#5", "E5"]],
  16: [["G3", "B3"], ["G3", "F#4"], ["B3", "F#4"], ["F#4", "B4", "D5"]]
};
normalizeData();
const LS_KEY = "teoria_musical_local_app_v1";
let state = loadState();
let currentView = "home";
let quizResults = null;
let activeTheoryId = initialTheoryId();

function normalizeData() {
  if (!DATA.modules) {
    DATA.modules = [{
      id: "armonia-funcional-i",
      title: "Armonía Funcional",
      subtitle: "Escalas, intervalos, acordes, enlace, tonalidad y rearmonización.",
      theory: DATA.theory || [],
      quiz: DATA.quiz || []
    }];
  }
  normalizeMultipleChoiceOrder();
  normalizeVoicingQuiz();
  normalizePianoSelectQuestions();
}
function normalizeMultipleChoiceOrder() {
  DATA.modules.forEach(module => {
    const groups = new Map();
    module.quiz.forEach(question => {
      if (question.type !== "multipleChoice" || !Array.isArray(question.choices) || question.choices.length < 2) return;
      const size = question.choices.length;
      if (!groups.has(size)) groups.set(size, []);
      groups.get(size).push(question);
    });
    groups.forEach((questions, size) => {
      const targetPositions = questions.map((_, index) => index % size);
      deterministicShuffle(targetPositions, hashText(module.id + ":" + size));
      questions.forEach((question, index) => moveCorrectChoice(question, targetPositions[index]));
    });
  });
}
function deterministicShuffle(items, seed) {
  let value = seed >>> 0;
  for (let index = items.length - 1; index > 0; index -= 1) {
    value = ((value * 1664525) + 1013904223) >>> 0;
    const target = value % (index + 1);
    [items[index], items[target]] = [items[target], items[index]];
  }
}
function hashText(value) {
  let hash = 2166136261;
  String(value || "").split("").forEach(char => {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
}
function moveCorrectChoice(question, targetIndex) {
  const currentIndex = Number(question.answer);
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= question.choices.length) return;
  const correctChoice = question.choices[currentIndex];
  const reordered = question.choices.filter((_, index) => index !== currentIndex);
  reordered.splice(targetIndex, 0, correctChoice);
  question.choices = reordered;
  question.answer = targetIndex;
}
function normalizeVoicingQuiz() {
  const module = DATA.modules.find(item => item.id === "nivel-3-principios-voicing");
  if (!module || module.__normalizedVoicingQuiz) return;
  module.quiz = module.quiz
    .filter(question => !MODULE_3_REMOVED_QUESTION_IDS.has(question.id))
    .map((question, index) => {
      question.sourceId = question.sourceId || question.id;
      question.id = index + 1;
      return question;
    });
  module.__normalizedVoicingQuiz = true;
}
function normalizePianoSelectQuestions() {
  DATA.modules.forEach(module => {
    module.quiz.forEach(question => {
      if (question.type !== "pianoSelect") return;
      const sourceId = question.sourceId || question.id;
      question.keyboardRange = fullPianoRange();
      if (module.id === "nivel-3-principios-voicing" && MODULE_3_PIANO_PROMPTS[sourceId]) {
        question.prompt = MODULE_3_PIANO_PROMPTS[sourceId];
      }
      if (module.id === "nivel-3-principios-voicing" && MODULE_3_QUESTION_OVERRIDES[sourceId]) {
        applyQuestionOverride(question, MODULE_3_QUESTION_OVERRIDES[sourceId]);
      }
      if (module.id === "nivel-3-principios-voicing" && MODULE_3_ANALYSIS_BASS[sourceId]) {
        question.analysisBass = MODULE_3_ANALYSIS_BASS[sourceId];
      }
      if (module.id === "nivel-3-principios-voicing" && MODULE_3_PARSER_CIPHERS[sourceId]) {
        question.parserCiphers = MODULE_3_PARSER_CIPHERS[sourceId];
      }
      question.keyboardRange = fullPianoRange();
      if (module.id === "nivel-3-principios-voicing" && MODULE_3_SHELL_ALTERNATIVES[sourceId]) {
        question.accept = buildShellAcceptance(sourceId);
        question.sampleAnswer = shellSampleAnswer(sourceId);
      } else {
        question.accept = question.accept || buildPianoAcceptance(question);
      }
    });
  });
}
function fullPianoRange() {
  return { from: PIANO_FULL_RANGE.from, to: PIANO_FULL_RANGE.to };
}
function applyQuestionOverride(question, override) {
  Object.assign(question, override);
  question.accept = null;
}
function buildShellAcceptance(id) {
  return {
    mode: "oneOf",
    alternatives: MODULE_3_SHELL_ALTERNATIVES[id].map(expected => ({
      mode: "pitchClass",
      expected,
      pitchClasses: uniqueSorted(expected.map(notePitchClass)),
      pattern: pianoIntervalPattern(expected),
      analysis: pianoAnalysisHint(MODULE_3_ANALYSIS_BASS[id], expected)
    }))
  };
}
function shellSampleAnswer(id) {
  const examples = MODULE_3_SHELL_ALTERNATIVES[id].map(notes => notes.join(", "));
  return `Cualquier shell válido del acorde. Ejemplos: ${examples.join(" / ")}.`;
}
function buildPianoAcceptance(question) {
  const answers = Array.isArray(question.answers) ? question.answers : [];
  const prompt = question.prompt || "";
  const sensitiveSingle = answers.length === 1 && /registro ideal|ubicada justo|ubicado justo|justo debajo|justo encima/i.test(prompt);
  const shapeSensitive = /Shell|\bskip\b|Skip 2|Spread|posición cerrada|disposición|separación|voicing|bajo\/acorde|soporte grave|registro medio|comenzando debajo/i.test(prompt);
  const mode = question.acceptMode || (sensitiveSingle
    ? "exact"
    : answers.length === 1 || !shapeSensitive
      ? "pitchClass"
      : "shape");
  const base = pianoAcceptanceFromExpected(answers, {
    mode,
    analysisBass: question.analysisBass,
    parserCiphers: question.parserCiphers,
    forbiddenIntervals: question.forbiddenIntervals,
    layout: question.layout
  });
  const extra = (question.acceptedAnswers || []).map(item => {
    const notes = Array.isArray(item) ? item : item.notes;
    return pianoAcceptanceFromExpected(notes || [], {
      mode: Array.isArray(item) ? mode : item.mode || mode,
      analysisBass: question.analysisBass,
      parserCiphers: question.parserCiphers,
      forbiddenIntervals: question.forbiddenIntervals,
      layout: question.layout
    });
  });
  if (extra.length) {
    return { mode: "oneOf", alternatives: [base].concat(extra) };
  }
  return base;
}
function pianoAcceptanceFromExpected(expected, options) {
  return {
    mode: options.mode,
    expected,
    pitchClasses: uniqueSorted(expected.map(notePitchClass)),
    pattern: pianoIntervalPattern(expected),
    analysis: pianoAnalysisHint(options.analysisBass, expected),
    parserCiphers: options.parserCiphers || null,
    forbiddenIntervals: options.forbiddenIntervals || [],
    layout: options.layout || null
  };
}
function pianoAnalysisHint(analysisBass, expected) {
  if (!analysisBass) return null;
  const bassPitchClass = notePitchClass(analysisBass);
  const hasFundamental = expected.some(note => notePitchClass(note) === bassPitchClass);
  return {
    bass: analysisBass,
    rootless: !hasFundamental,
    parserNotes: [analysisBass].concat(expected.filter(note => note !== analysisBass))
  };
}
const CHORD_ROOT_BASE_PCS = Object.freeze({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 });
const CHORD_QUALITY_PATTERNS = Object.freeze({
  "": { required: [0, 4, 7], optional: [] },
  "m": { required: [0, 3, 7], optional: [] },
  "7": { required: [0, 4, 10], optional: [7] },
  "∆": { required: [0, 4, 11], optional: [7] },
  "∆9": { required: [0, 4, 11, 2], optional: [7] },
  "m7": { required: [0, 3, 10], optional: [7] },
  "m7(b5)": { required: [0, 3, 6, 10], optional: [] },
  "m9": { required: [0, 3, 10, 2], optional: [7] },
  "m11": { required: [0, 3, 10, 5], optional: [2, 7] },
  "ø9": { required: [0, 3, 6, 10, 2], optional: [] },
  "m6(9)": { required: [0, 3, 9, 2], optional: [7] },
  "13": { required: [0, 2, 4, 9, 10], optional: [7] },
  "13(b9)": { required: [0, 4, 10, 1, 9], optional: [7] },
  "13(b5)": { required: [0, 4, 6, 10, 9], optional: [2, 7] },
  "13(b5)b9": { required: [0, 4, 6, 10, 1, 9], optional: [7] },
  "13(#11)": { required: [0, 4, 7, 10, 6, 9], optional: [2] },
  "∆13": { required: [0, 2, 4, 7, 11, 9], optional: [] },
  "∆13(#11)": { required: [0, 4, 7, 11, 6, 9], optional: [2] }
});
function gradeChordParserSelection(accept, selected) {
  const ciphers = Array.isArray(accept.parserCiphers) ? accept.parserCiphers : [];
  if (!ciphers.length || !selected.length) return null;
  const notes = parserNotesForSelection(accept.analysis, selected);
  return ciphers.reduce((best, cipher) => Math.max(best, scoreSelectionAsCipher(notes, cipher, accept.forbiddenIntervals)), 0);
}
function parserNotesForSelection(analysis, selected) {
  const notes = selected.slice();
  const bass = analysis?.bass;
  if (bass && analysis?.rootless) {
    const bassPc = notePitchClass(bass);
    const hasBassPc = notes.some(note => notePitchClass(note) === bassPc);
    if (!hasBassPc) notes.unshift(bass);
  }
  return notes;
}
function scoreSelectionAsCipher(notes, cipher, forbiddenIntervals = []) {
  const parsed = parseChordCipher(cipher);
  if (!parsed) return 0;
  const pcs = uniqueSorted(notes.map(notePitchClass));
  const intervals = uniqueSorted(pcs.map(pc => (pc - parsed.rootPc + 12) % 12));
  const required = parsed.pattern.required;
  const optional = parsed.pattern.optional || [];
  const forbidden = new Set(forbiddenIntervals);
  const allowed = new Set(required.concat(optional).filter(interval => !forbidden.has(interval)));
  const presentRequired = required.filter(interval => intervals.includes(interval)).length;
  const forbiddenPresent = intervals.filter(interval => forbidden.has(interval)).length;
  const extra = intervals.filter(interval => !allowed.has(interval)).length;
  if (presentRequired === required.length && extra === 0 && forbiddenPresent === 0) return 1;
  return clamp((presentRequired - extra) / required.length, 0, 1);
}
function parseChordCipher(cipher) {
  const clean = normalizeChordCipher(cipher);
  const match = clean.match(/^([A-G](?:bb|##|b|#)?)(.*)$/);
  if (!match) return null;
  const rootPc = chordRootPitchClass(match[1]);
  const quality = normalizeChordQuality(match[2]);
  const pattern = CHORD_QUALITY_PATTERNS[quality];
  return Number.isFinite(rootPc) && pattern ? { rootPc, quality, pattern } : null;
}
function normalizeChordCipher(cipher) {
  return String(cipher || "")
    .trim()
    .replace(/[♭]/g, "b")
    .replace(/[♯]/g, "#")
    .replace(/[Δ]/g, "∆")
    .replace(/\s+/g, "")
    .split("/")[0];
}
function normalizeChordQuality(quality) {
  let q = String(quality || "")
    .replace(/^maj13/i, "∆13")
    .replace(/^ma13/i, "∆13")
    .replace(/^maj9/i, "∆9")
    .replace(/^ma9/i, "∆9")
    .replace(/^maj7/i, "∆")
    .replace(/^ma7/i, "∆")
    .replace(/^maj/i, "∆")
    .replace(/^ma/i, "∆")
    .replace(/^min/i, "m")
    .replace(/^mi/i, "m")
    .replace(/^-/, "m")
    .replace(/^°/, "º");
  if (q === "ø") return "m7(b5)";
  if (q === "ø9") return "ø9";
  if (q === "maj7") return "∆";
  if (q === "maj9") return "∆9";
  return q;
}
function chordRootPitchClass(root) {
  const letter = String(root || "")[0]?.toUpperCase();
  if (!(letter in CHORD_ROOT_BASE_PCS)) return NaN;
  let pc = CHORD_ROOT_BASE_PCS[letter];
  String(root || "").slice(1).split("").forEach(accidental => {
    if (accidental === "b") pc -= 1;
    if (accidental === "#") pc += 1;
  });
  return ((pc % 12) + 12) % 12;
}
function activeModule() {
  return DATA.modules.find(module => module.id === state.moduleId) || DATA.modules[0];
}
function moduleTheory() { return activeModule()?.theory || []; }
function moduleQuiz() { return activeModule()?.quiz || []; }
function defaultState() {
  return {
    moduleId: DATA.modules?.[0]?.id || "armonia-funcional-i",
    studied: {},
    quiz: {
      active: false,
      submitted: false,
      startedAt: null,
      submittedAt: null,
      student: { name: "", course: "", date: "" },
      answers: {},
      focusWarnings: 0,
      result: null
    }
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const loaded = Object.assign(defaultState(), JSON.parse(raw));
    if (!DATA.modules.some(module => module.id === loaded.moduleId)) {
      loaded.moduleId = DATA.modules[0]?.id || defaultState().moduleId;
      loaded.quiz = defaultState().quiz;
    }
    return loaded;
  } catch (e) { return defaultState(); }
}
function saveState() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function $(id) { return document.getElementById(id); }
function setText(id, value) { const el = $(id); if (el) el.textContent = value; }

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[º°]/g, "")
    .replace(/[.,;:()\[\]{}¿?¡!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function compactSymbol(value) {
  return String(value || "").trim().replace(/\s+/g, "").replace(/º/g,"°");
}
function answerMatches(value, accepted) {
  const vRaw = String(value || "").trim();
  const aRaw = String(accepted || "").trim();
  if (!vRaw) return false;
  if (/\d/.test(aRaw) || /[+#b°]/.test(aRaw)) {
    return compactSymbol(vRaw) === compactSymbol(aRaw);
  }
  return normalizeText(vRaw).includes(normalizeText(aRaw));
}
function groupHit(value, group) {
  const text = normalizeText(value);
  return group.some(term => {
    if (/\d/.test(term) || /[+#b°]/.test(term)) return answerMatches(value, term);
    return text.includes(normalizeText(term));
  });
}
function termHit(value, term) {
  return groupHit(value, [term]);
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function percent(n) { return Math.round(n * 100); }
function initialTheoryId() {
  const hashId = decodeURIComponent(location.hash || "").replace(/^#topic-/, "");
  return moduleTheory().some(section => section.id === hashId) ? hashId : moduleTheory()[0]?.id;
}

function init() {
  renderModules();
  renderHome();
  renderTheory();
  updateProgress();
  hydrateStudentFields();
  wireEvents();
  if (state.quiz.active && !state.quiz.submitted) {
    showView("quiz");
    renderQuiz();
    applyQuizLock(true);
  } else if (state.quiz.submitted && state.quiz.result) {
    showView("quiz");
    renderQuizResult(state.quiz.result);
  } else {
    showView("home");
  }
}
function wireEvents() {
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      if (state.quiz.active && !state.quiz.submitted && view !== "quiz") {
        alert("El cuestionario está activo. Debe entregarse antes de volver al módulo teórico.");
        showView("quiz");
        return;
      }
      showView(view);
    });
  });
  $("startQuizBtn").addEventListener("click", startQuiz);
  $("startQuizBtn2").addEventListener("click", () => showView("quiz"));
  $("goTheoryBtn").addEventListener("click", () => showView("theory"));
  $("submitQuizBtn").addEventListener("click", submitQuiz);
  $("printResultBtn").addEventListener("click", () => window.print());
  $("downloadCsvBtn").addEventListener("click", downloadCSV);
  $("newAttemptBtn").addEventListener("click", newAttempt);
  $("resetStudyBtn").addEventListener("click", resetStudy);
  ["studentName","studentCourse","studentDate"].forEach(id => {
    $(id).addEventListener("input", updateStudentMeta);
  });
  window.addEventListener("beforeunload", (e) => {
    if (state.quiz.active && !state.quiz.submitted) {
      e.preventDefault(); e.returnValue = "";
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.quiz.active && !state.quiz.submitted) {
      state.quiz.focusWarnings = (state.quiz.focusWarnings || 0) + 1;
      saveState();
      setText("focusWarnings", state.quiz.focusWarnings);
    }
  });
  history.pushState({app:true}, "");
  window.addEventListener("popstate", () => {
    if (state.quiz.active && !state.quiz.submitted) {
      history.pushState({app:true}, "");
      showView("quiz");
      alert("Navegación bloqueada durante el cuestionario.");
    }
  });
}
function showView(view) {
  if (state.quiz.active && !state.quiz.submitted && view !== "quiz") view = "quiz";
  currentView = view;
  ["homeView","theoryView","quizView"].forEach(id => $(id).classList.add("hidden"));
  $(`${view}View`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  if (view === "quiz") renderQuiz();
  window.scrollTo({top: 0, behavior: "smooth"});
}
function applyQuizLock(on) {
  document.body.classList.toggle("quiz-lock", !!on);
  $("lockBanner").classList.toggle("hidden", !on);
}
function renderHome() {
  const module = activeModule();
  setText("topicCount", moduleTheory().length);
  setText("questionCount", moduleQuiz().length);
  setText("autoGrade", "0–5.0");
  setText("moduleLabel", `${module.level || "Módulo"} · ${module.title}`);
  setText("moduleIntro", module.subtitle || "Lectura guiada y cuestionario autocorregible con nota final de 0 a 5.0.");
}
function renderModules() {
  const wrap = $("moduleTabs");
  if (!wrap) return;
  wrap.innerHTML = DATA.modules.map(module => {
    const active = module.id === state.moduleId;
    return `<button class="module-tab ${active ? "active" : ""}" data-module="${escapeAttr(module.id)}" type="button">
      <em>${escapeHtml(module.level || "Módulo")}</em>
      <span>${escapeHtml(module.title)}</span>
      <small>${module.theory.length} temas · ${module.quiz.length} preguntas</small>
    </button>`;
  }).join("");
  wrap.querySelectorAll("[data-module]").forEach(btn => {
    btn.addEventListener("click", () => selectModule(btn.dataset.module));
  });
}
function selectModule(id) {
  if (state.quiz.active && !state.quiz.submitted) {
    alert("Debe entregar el cuestionario activo antes de cambiar de módulo.");
    showView("quiz");
    return;
  }
  if (!DATA.modules.some(module => module.id === id) || state.moduleId === id) return;
  state.moduleId = id;
  state.quiz = defaultState().quiz;
  activeTheoryId = moduleTheory()[0]?.id;
  history.replaceState(history.state, "", location.pathname);
  saveState();
  renderModules();
  renderHome();
  renderTheory();
  hydrateStudentFields();
  showView("home");
}
function renderTheory() {
  const wrap = $("topicGrid");
  wrap.innerHTML = moduleTheory().map(section => {
    const learned = !!state.studied[section.id];
    const active = section.id === activeTheoryId;
    return `<button class="topic-link ${learned ? "done" : ""} ${active ? "active" : ""}" data-topic-select="${escapeAttr(section.id)}" type="button">
      <span class="topic-link-number">${escapeHtml(section.title.split(".")[0])}</span>
      <span>
        <b>${escapeHtml(section.title.replace(/^\d+\.\s*/, ""))}</b>
        <small>${section.items.length} conceptos · ${learned ? "estudiado" : "pendiente"}</small>
      </span>
    </button>`;
  }).join("");
  renderTheoryDetail();
  wrap.querySelectorAll("[data-topic-select]").forEach(btn => {
    btn.addEventListener("click", () => selectTheoryTopic(btn.dataset.topicSelect));
  });
  document.querySelectorAll("[data-study]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.studied[btn.dataset.study] = !state.studied[btn.dataset.study];
      saveState(); renderTheory(); updateProgress();
    });
  });
  document.querySelectorAll("[data-topic-step]").forEach(btn => {
    btn.addEventListener("click", () => selectTheoryStep(Number(btn.dataset.topicStep)));
  });
}
function selectTheoryTopic(id) {
  if (!moduleTheory().some(section => section.id === id)) return;
  activeTheoryId = id;
  history.replaceState(history.state, "", `#topic-${id}`);
  renderTheory();
  $("theoryDetail").scrollIntoView({ behavior: "smooth", block: "start" });
}
function selectTheoryStep(delta) {
  const theory = moduleTheory();
  const index = theory.findIndex(section => section.id === activeTheoryId);
  const next = theory[index + delta];
  if (next) selectTheoryTopic(next.id);
}
function renderTheoryDetail() {
  const wrap = $("theoryDetail");
  const theory = moduleTheory();
  const index = Math.max(0, theory.findIndex(section => section.id === activeTheoryId));
  const section = theory[index] || theory[0];
  if (!section) {
    wrap.innerHTML = "";
    return;
  }
  const prev = theory[index - 1];
  const next = theory[index + 1];
  wrap.innerHTML = `
    <article class="theory-section panel" id="topic-${escapeAttr(section.id)}">
      <header class="theory-section-head">
        <div>
          <p class="kicker">${section.items.length} conceptos</p>
          <h3>${escapeHtml(section.title)}</h3>
          <p>${escapeHtml(section.subtitle)}</p>
        </div>
        <span class="study-badge ${state.studied[section.id] ? "done" : ""}">${state.studied[section.id] ? "Estudiado" : "Pendiente"}</span>
      </header>
      <div class="concept-list">
        ${section.items.map(item => `<section class="concept-item ${item.diagram ? "has-diagram" : ""}">
          <h4>${escapeHtml(item.term)}</h4>
          ${renderConceptBody(item)}
        </section>`).join("")}
      </div>
      <footer class="theory-actions">
        <button class="ghost-btn" data-topic-step="-1" ${prev ? "" : "disabled"}>Tema anterior</button>
        <button class="soft-btn study-toggle" data-study="${section.id}">${state.studied[section.id] ? "Marcar como pendiente" : "Marcar tema como estudiado"}</button>
        <button class="ghost-btn" data-topic-step="1" ${next ? "" : "disabled"}>Tema siguiente</button>
      </footer>
    </article>`;
}
function renderConceptBody(item) {
  const body = typeof item === "string" ? item : item?.body || "";
  const blocks = conceptBlocks(body);
  const bodyHtml = !blocks.some(block => block.type === "table")
    ? (body ? `<p>${escapeHtml(body)}</p>` : "")
    : blocks.map(block => {
    if (block.type === "table") return renderChordTable(block.rows);
    return `<p>${escapeHtml(block.text)}</p>`;
  }).join("");
  const diagramHtml = item?.diagram ? renderPianoDiagram(item.diagram) : "";
  return `<div class="concept-body">${bodyHtml}${diagramHtml}</div>`;
}
function conceptBlocks(body) {
  const chunks = splitConceptChunks(body);
  const blocks = [];
  chunks.forEach(chunk => {
    const row = chordRowFromChunk(chunk.text) || noteCipherRowFromChunk(chunk.text);
    if (row) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "table" && last.tableKind === row.kind) last.rows.push(row);
      else blocks.push({ type: "table", tableKind: row.kind, rows: [row] });
      return;
    }
    if (chunk.text) {
      blocks.push({ type: "text", text: `${chunk.text}${chunk.punctuation}`.trim() });
    }
  });
  return blocks;
}
function splitConceptChunks(body) {
  const chunks = [];
  const re = /([^.;]+)([.;]?)/g;
  let match;
  while ((match = re.exec(body))) {
    const text = match[1].trim();
    if (text) chunks.push({ text, punctuation: match[2] || "" });
  }
  return chunks;
}
function chordRowFromChunk(chunk) {
  const interval = "(?:bb7\\(6\\)|#11\\(#4\\)|bb7|b13|#11|#9|b9|b7|#5|b5|b3|#4|13|11|9|7|6|5|4|3|2|1|\\((?:bb7|b13|#11|#9|b9|b7|#5|b5|b3|#4|13|11|9|7|6|5|4|3|2|1)(?: opcional)?\\))";
  const formulaRe = new RegExp(`(?:^|\\s)(1(?:\\s+${interval}){2,})`);
  const match = formulaRe.exec(chunk);
  if (!match) return null;
  const formulaStart = match.index + match[0].indexOf(match[1]);
  const formula = match[1];
  const afterFormula = chunk.slice(formulaStart + formula.length).trimStart();
  const notes = readBalancedNotes(afterFormula);
  if (!notes) return null;
  const before = chunk.slice(0, formulaStart).trim();
  const afterNotes = afterFormula.slice(notes.raw.length).trim();
  const label = chordLabel(before, afterNotes);
  return { kind: "chord", label, formula, notes: notes.value };
}
function noteCipherRowFromChunk(chunk) {
  const note = "(?:[A-G](?:bb|##|b|#)?)";
  const notesRe = new RegExp(`^((?:${note}(?:,\\s*|\\s+)){2,}${note})\\s+corresponde a\\s+(.+)$`, "i");
  const match = notesRe.exec(chunk.trim());
  if (!match) return null;
  return {
    kind: "noteCipher",
    notes: match[1].replace(/,\s*/g, " ").replace(/\s+/g, " ").trim(),
    cipher: match[2].replace(/[.;]$/, "").trim()
  };
}
function readBalancedNotes(text) {
  if (!text.startsWith("(")) return null;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    if (text[i] === ")") depth -= 1;
    if (depth === 0) {
      return { raw: text.slice(0, i + 1), value: text.slice(1, i) };
    }
  }
  return null;
}
function chordLabel(before, afterNotes) {
  const correspondence = afterNotes.match(/^corresponde a\s+(.+)$/i);
  if (correspondence) return correspondence[1].replace(/[.;]$/, "").trim();
  return before
    .replace(/[=:]+$/g, "")
    .replace(/\s+contiene$/i, "")
    .replace(/\s+es$/i, "")
    .replace(/\s+significa.*$/i, "")
    .trim() || "Ejemplo en C";
}
function renderChordTable(rows) {
  if (rows[0]?.kind === "noteCipher") {
    return `<div class="chord-table-wrap"><table class="chord-table note-cipher-table">
      <thead><tr><th>Notas</th><th>Cifrado</th></tr></thead>
      <tbody>${rows.map(row => `<tr>
        <td><code>${escapeHtml(row.notes)}</code></td>
        <td>${escapeHtml(row.cipher)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }
  return `<div class="chord-table-wrap"><table class="chord-table">
    <thead><tr><th>Acorde o caso</th><th>Intervalos</th><th>Notas del ejemplo</th></tr></thead>
    <tbody>${rows.map(row => `<tr>
      <td>${escapeHtml(row.label)}</td>
      <td><code>${escapeHtml(row.formula)}</code></td>
      <td><code>${escapeHtml(row.notes)}</code></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}
function renderPianoDiagram(diagram) {
  const range = fullPianoRange();
  const notes = buildPianoNotes(range.from, range.to);
  const whiteCount = notes.filter(note => !note.isBlack).length;
  const keys = diagram.keys || {};
  const labels = pianoFloatingLabels(notes, keys, whiteCount);
  return `<figure class="piano-diagram">
    <div class="piano-diagram-scroll">
      <div class="piano-diagram-keyboard" style="--white-count:${whiteCount};">
        ${notes.map(note => renderPianoKey(note, keys[note.note], whiteCount)).join("")}
        ${labels.map(item => renderPianoFloatingLabel(item)).join("")}
      </div>
    </div>
  </figure>`;
}

function pianoFloatingLabels(notes, keys, whiteCount) {
  const labels = notes.map(note => {
    const key = keys[note.note];
    const labelText = String(key?.label?.text || "").replace(/\s+/g, " ").trim();
    if (!labelText) return null;
    const centerUnits = note.isBlack ? note.leftWhiteIndex + 1 : note.whiteIndex + .5;
    return {
      note,
      key,
      text: labelText,
      center: (centerUnits / whiteCount) * 100,
      centerUnits,
      widthUnits: pianoLabelWidthUnits(labelText, key.label)
    };
  }).filter(Boolean).sort((a, b) => a.centerUnits - b.centerUnits);

  const lastByLevel = [];
  labels.forEach(label => {
    let level = 0;
    while (lastByLevel[level] && pianoLabelsCollide(lastByLevel[level], label)) level += 1;
    label.level = level;
    lastByLevel[level] = label;
  });
  return labels;
}

function pianoLabelWidthUnits(labelText, label) {
  const fontSize = Number(label?.fontSize) || 13;
  return Math.max(1.25, ((labelText.length * fontSize * .62) + 14) / 24);
}

function pianoLabelsCollide(previous, current) {
  const minDistance = ((previous.widthUnits + current.widthUnits) / 2) + .16;
  return current.centerUnits - previous.centerUnits < minDistance;
}

function buildPianoNotes(fromNote, toNote) {
  const start = noteStep(fromNote);
  const end = noteStep(toNote);
  const built = [];
  let whiteIndex = 0;
  for (let step = start; step <= end; step += 1) {
    const name = PIANO_NOTE_NAMES[((step % 12) + 12) % 12];
    const octave = Math.floor(step / 12) - 1;
    const isBlack = name.includes("#");
    built.push({
      note: `${name}${octave}`,
      name,
      octave,
      isBlack,
      whiteIndex: isBlack ? null : whiteIndex,
      leftWhiteIndex: isBlack ? whiteIndex - 1 : null
    });
    if (!isBlack) whiteIndex += 1;
  }
  return built;
}

function renderPianoKey(note, key, whiteCount) {
  const left = note.isBlack
    ? ((note.leftWhiteIndex + 1) / whiteCount) * 100
    : (note.whiteIndex / whiteCount) * 100;
  const width = note.isBlack ? 60 / whiteCount : 100 / whiteCount;
  const transform = note.isBlack ? " translateX(-50%)" : "";
  const active = !!key;
  const style = active
    ? `background:${escapeAttr(pianoKeyBackground(note, key))};`
    : "";
  const cName = note.name === "C" ? `<span class="piano-note-name">${escapeHtml(note.note)}</span>` : "";
  return `<span class="piano-key ${note.isBlack ? "black" : "white"} ${active ? "marked" : ""}"
      style="left:${left}%;width:${width}%;transform:${transform};${style}">
      ${cName}
    </span>`;
}

function renderPianoFloatingLabel(item) {
  const note = item.note;
  return `<span class="piano-floating-label ${note.isBlack ? "black-label" : "white-label"}"
      style="left:${item.center}%;${pianoLabelStyle(item.key.label, item.level)}">${escapeHtml(item.text)}</span>`;
}

function pianoLabelStyle(label, level = 0) {
  const baseOffset = Number(label.verticalOffset ?? 13);
  const verticalOffset = baseOffset + (level * 28);
  return [
    `font-size:${Number(label.fontSize) || 13}px`,
    `font-family:${escapeAttr(label.fontFamily || "'Arial Black', Arial, sans-serif")}`,
    `color:${escapeAttr(label.textColor || "#111827")}`,
    `background:${escapeAttr(label.background || "#ffffff")}`,
    `border:${Number(label.borderWidth ?? 2)}px solid ${escapeAttr(label.borderColor || "#111827")}`,
    `border-radius:${Number(label.borderRadius ?? 4)}px`,
    `bottom:${verticalOffset}px`
  ].join(";");
}

function pianoKeyBackground(note, key) {
  const color = hexToRgb(key?.color || "#facc15");
  const base = note.isBlack ? hexToRgb("#111827") : hexToRgb("#ffffff");
  const fill = note.isBlack ? darkenRgb(color, .52) : color;
  const opacity = clamp(Number(key?.opacity ?? 100), 0, 100) / 100;
  return rgbToCss({
    r: Math.round(base.r + (fill.r - base.r) * opacity),
    g: Math.round(base.g + (fill.g - base.g) * opacity),
    b: Math.round(base.b + (fill.b - base.b) * opacity)
  });
}

function noteStep(noteName) {
  const match = String(noteName || "").match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 48;
  const nameIndex = PIANO_NOTE_NAMES.indexOf(match[1]);
  return ((Number(match[2]) + 1) * 12) + nameIndex;
}

function notePitchClass(noteName) {
  return ((noteStep(noteName) % 12) + 12) % 12;
}

function uniqueSorted(values) {
  return [...new Set(values.map(value => Number(value)).filter(value => Number.isFinite(value)))]
    .sort((a, b) => a - b);
}

function pianoIntervalPattern(notes) {
  const midis = notes
    .map(noteStep)
    .filter(value => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (!midis.length) return [];
  const base = midis[0];
  return midis.map(midi => midi - base);
}

function sameNumberList(a, b) {
  return a.length === b.length && a.every((value, index) => Number(value) === Number(b[index]));
}

function hexToRgb(hex) {
  const clean = String(hex || "#000000").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map(char => char + char).join("") : clean.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function darkenRgb(rgb, factor) {
  return {
    r: Math.round(rgb.r * factor),
    g: Math.round(rgb.g * factor),
    b: Math.round(rgb.b * factor)
  };
}

function rgbToCss(rgb) {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}
function updateProgress() {
  const done = moduleTheory().filter(s => state.studied[s.id]).length;
  const total = moduleTheory().length;
  const pct = total ? done / total : 0;
  $("studyBar").style.width = `${pct * 100}%`;
  setText("studyProgressText", `${done}/${total} temas estudiados`);
}
function resetStudy() {
  if (!confirm("¿Borrar el progreso de estudio marcado?")) return;
  const currentIds = new Set(moduleTheory().map(section => section.id));
  Object.keys(state.studied).forEach(id => {
    if (currentIds.has(id)) delete state.studied[id];
  });
  saveState(); renderTheory(); updateProgress();
}
function hydrateStudentFields() {
  $("studentName").value = state.quiz.student.name || "";
  $("studentCourse").value = state.quiz.student.course || "";
  $("studentDate").value = state.quiz.student.date || new Date().toISOString().slice(0,10);
  updateStudentMeta();
}
function updateStudentMeta() {
  state.quiz.student = {
    name: $("studentName").value.trim(),
    course: $("studentCourse").value.trim(),
    date: $("studentDate").value || new Date().toISOString().slice(0,10)
  };
  saveState();
}
function startQuiz() {
  if (!moduleQuiz().length) {
    alert("Este módulo todavía no tiene cuestionario. Primero estudia el módulo teórico.");
    showView("theory");
    return;
  }
  updateStudentMeta();
  if (!state.quiz.student.name) {
    alert("Ingrese el nombre del estudiante antes de iniciar.");
    $("studentName").focus();
    return;
  }
  state.quiz.active = true;
  state.quiz.submitted = false;
  state.quiz.startedAt = new Date().toISOString();
  state.quiz.submittedAt = null;
  state.quiz.answers = state.quiz.answers || {};
  state.quiz.focusWarnings = 0;
  state.quiz.result = null;
  saveState();
  applyQuizLock(true);
  showView("quiz");
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}
function renderQuiz() {
  if (state.quiz.submitted && state.quiz.result) {
    renderQuizResult(state.quiz.result);
    return;
  }
  $("quizStartPanel").classList.toggle("hidden", state.quiz.active);
  $("quizActivePanel").classList.toggle("hidden", !state.quiz.active);
  $("quizResultPanel").classList.add("hidden");
  applyQuizLock(state.quiz.active && !state.quiz.submitted);
  if (!state.quiz.active) return;
  setText("activeStudent", state.quiz.student.name || "Sin nombre");
  setText("focusWarnings", state.quiz.focusWarnings || 0);
  const answered = countAnswered();
  setText("answeredCount", `${answered}/${moduleQuiz().length} respondidas`);
  $("quizBar").style.width = `${(answered / moduleQuiz().length) * 100}%`;
  $("questionList").innerHTML = moduleQuiz().map(renderQuestion).join("");
  bindAnswerEvents();
}
function renderQuestion(q) {
  const body = renderQuestionBody(q);
  const diagram = q.diagram ? `<div class="question-diagram">${renderPianoDiagram(q.diagram)}</div>` : "";
  return `<article class="question-card" id="q-${q.id}">
    <div class="section-label">${escapeHtml(q.section || "")}</div>
    <div class="question-head"><div class="qnum">${q.id}.</div><h3>${escapeHtml(q.prompt)}</h3></div>
    ${diagram}
    ${body}
  </article>`;
}
function val(qid, suffix="") { return state.quiz.answers[`q${qid}${suffix}`] ?? ""; }
function optionValue(option) { return typeof option === "object" ? option.value : option; }
function optionLabel(option) { return typeof option === "object" ? option.label : option; }
function dropdownOptions(q, item) {
  return q.optionsByItem?.[item] || q.options || [];
}
function renderQuestionBody(q) {
  if (q.type === "selectBlanks") {
    return `<div class="inline-grid">${q.labels.map((label,i) => `<label class="field"><span>${escapeHtml(label)}</span><select data-answer="q${q.id}_${i}"><option value="">Seleccione</option>${q.options.map(opt => `<option value="${escapeHtml(optionValue(opt))}" ${val(q.id,`_${i}`)===optionValue(opt)?"selected":""}>${escapeHtml(optionLabel(opt))}</option>`).join("")}</select></label>`).join("")}</div>`;
  }
  if (q.type === "multipleChoice") {
    return renderMultipleChoice(q);
  }
  if (q.type === "multiSelect") {
    return `<div class="multi-note">Seleccione todas las respuestas correctas.</div><div class="options">${q.choices.map((choice,i) => `<label class="option"><input type="checkbox" data-answer="q${q.id}_${i}" value="${escapeHtml(choice)}" ${val(q.id,`_${i}`) ? "checked" : ""}><span>${escapeHtml(choice)}</span></label>`).join("")}</div>`;
  }
  if (q.type === "pianoSelect") {
    return renderPianoSelect(q);
  }
  if (q.type === "classify") {
    return `<div>${q.items.map(item => `<label class="classify-row"><span>${escapeHtml(item)}</span><select data-answer="q${q.id}_${escapeAttr(item)}"><option value="">Seleccione</option>${dropdownOptions(q, item).map(opt => `<option value="${escapeHtml(opt)}" ${val(q.id,`_${item}`)===opt?"selected":""}>${escapeHtml(opt)}</option>`).join("")}</select></label>`).join("")}</div>`;
  }
  if (q.type === "match") {
    return `<div>${q.items.map(item => `<label class="match-row"><span>${escapeHtml(item)}</span><select data-answer="q${q.id}_${escapeAttr(item)}"><option value="">Seleccione</option>${dropdownOptions(q, item).map(opt => `<option value="${escapeHtml(opt)}" ${val(q.id,`_${item}`)===opt?"selected":""}>${escapeHtml(opt)}</option>`).join("")}</select></label>`).join("")}</div>`;
  }
  if (q.type === "trueFalse") {
    return `<div class="options"><label class="option"><input type="radio" name="q${q.id}" data-answer="q${q.id}" value="true" ${val(q.id)==="true"?"checked":""}><span>V</span></label><label class="option"><input type="radio" name="q${q.id}" data-answer="q${q.id}" value="false" ${val(q.id)==="false"?"checked":""}><span>F</span></label></div>`;
  }
  return "";
}

function renderMultipleChoice(q) {
  return `<div class="options">${q.choices.map((choice,i) => {
    const checked = String(val(q.id)) === String(i);
    const hasDiagram = !!choice?.diagram;
    return `<label class="option ${hasDiagram ? "choice-with-diagram" : ""}">
      <input type="radio" name="q${q.id}" data-answer="q${q.id}" value="${i}" ${checked ? "checked" : ""}>
      ${renderChoiceContent(choice, i)}
    </label>`;
  }).join("")}</div>`;
}

function renderChoiceContent(choice, index) {
  const diagram = choice?.diagram ? `<div class="option-diagram">${renderPianoDiagram(choice.diagram)}</div>` : "";
  return `<div class="choice-copy"><span class="choice-text">${String.fromCharCode(97 + index)}) ${escapeHtml(optionLabel(choice))}</span>${diagram}</div>`;
}

function renderPianoSelect(q) {
  const range = pianoQuestionRange(q);
  const notes = buildPianoNotes(range.from, range.to);
  const whiteCount = notes.filter(note => !note.isBlack).length;
  return `<div class="multi-note">Seleccione todas las teclas correctas.</div>
    <div class="piano-select-wrap">
      <div class="piano-select-keyboard" style="--white-count:${whiteCount};">
        ${notes.map(note => renderPianoToggleKey(q, note, whiteCount)).join("")}
      </div>
    </div>`;
}

function renderPianoToggleKey(q, note, whiteCount) {
  const left = note.isBlack
    ? ((note.leftWhiteIndex + 1) / whiteCount) * 100
    : (note.whiteIndex / whiteCount) * 100;
  const width = note.isBlack ? 60 / whiteCount : 100 / whiteCount;
  const transform = note.isBlack ? " translateX(-50%)" : "";
  const selected = !!val(q.id, `_${note.note}`);
  const cName = note.name === "C" ? `<span class="piano-note-name">${escapeHtml(note.note)}</span>` : "";
  return `<button type="button"
      class="piano-answer-key ${note.isBlack ? "black" : "white"} ${selected ? "selected" : ""}"
      data-piano-toggle
      data-answer="q${q.id}_${escapeAttr(note.note)}"
      data-value="${escapeAttr(note.note)}"
      aria-label="${escapeAttr(note.note)}"
      aria-pressed="${selected}"
      title="${escapeAttr(note.note)}"
      style="left:${left}%;width:${width}%;transform:${transform};">
      ${cName}
    </button>`;
}
function bindAnswerEvents() {
  document.querySelectorAll("[data-answer]:not([data-piano-toggle])").forEach(el => {
    el.addEventListener("input", saveAnswer);
    el.addEventListener("change", saveAnswer);
  });
  document.querySelectorAll("[data-piano-toggle]").forEach(el => {
    el.addEventListener("click", savePianoToggle);
  });
}
function saveAnswer(e) {
  const key = e.currentTarget.dataset.answer;
  if (e.currentTarget.type === "radio" && !e.currentTarget.checked) return;
  if (e.currentTarget.type === "checkbox") {
    if (e.currentTarget.checked) state.quiz.answers[key] = e.currentTarget.value;
    else delete state.quiz.answers[key];
  } else {
    state.quiz.answers[key] = e.currentTarget.value;
  }
  saveState();
  setText("answeredCount", `${countAnswered()}/${moduleQuiz().length} respondidas`);
  $("quizBar").style.width = `${(countAnswered() / moduleQuiz().length) * 100}%`;
}
function savePianoToggle(e) {
  const key = e.currentTarget.dataset.answer;
  const value = e.currentTarget.dataset.value;
  const selected = !state.quiz.answers[key];
  if (selected) state.quiz.answers[key] = value;
  else delete state.quiz.answers[key];
  e.currentTarget.classList.toggle("selected", selected);
  e.currentTarget.setAttribute("aria-pressed", String(selected));
  saveState();
  setText("answeredCount", `${countAnswered()}/${moduleQuiz().length} respondidas`);
  $("quizBar").style.width = `${(countAnswered() / moduleQuiz().length) * 100}%`;
}
function countAnswered() {
  return moduleQuiz().filter(q => isAnswered(q)).length;
}
function isAnswered(q) {
  if (q.type === "selectBlanks") return q.answers.some((_,i)=> String(val(q.id,`_${i}`)).trim());
  if (q.type === "multiSelect") return q.choices.some((_,i)=> String(val(q.id,`_${i}`)).trim());
  if (q.type === "pianoSelect") return pianoSelectedNotes(q).length > 0;
  if (q.type === "classify" || q.type === "match") return q.items.some(item => String(val(q.id,`_${item}`)).trim());
  return String(val(q.id)).trim() !== "";
}
function submitQuiz() {
  const unanswered = moduleQuiz().length - countAnswered();
  if (unanswered > 0 && !confirm(`Faltan ${unanswered} preguntas por responder. ¿Entregar de todos modos?`)) return;
  const result = gradeQuiz();
  state.quiz.submitted = true;
  state.quiz.active = false;
  state.quiz.submittedAt = new Date().toISOString();
  state.quiz.result = result;
  saveState();
  applyQuizLock(false);
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(()=>{});
  renderQuizResult(result);
}
function gradeQuiz() {
  const details = moduleQuiz().map(q => gradeQuestion(q));
  const raw = details.reduce((sum, d) => sum + d.points, 0);
  const max = moduleQuiz().length;
  const score = (raw / max) * 5;
  return { details, raw, max, score, percent: raw / max, student: state.quiz.student, focusWarnings: state.quiz.focusWarnings || 0, startedAt: state.quiz.startedAt, submittedAt: new Date().toISOString() };
}
function gradeQuestion(q) {
  let points = 0;
  let given = "";
  if (q.type === "selectBlanks") {
    const scores = q.answers.map((ans, i) => val(q.id,`_${i}`) === ans ? 1 : 0);
    given = q.labels.map((l,i)=>`${l}: ${val(q.id,`_${i}`)}`).join(" | ");
    points = scores.reduce((a,b)=>a+b,0) / q.answers.length;
  } else if (q.type === "multipleChoice") {
    given = choiceLabel(q, val(q.id));
    points = Number(val(q.id)) === q.answer ? 1 : 0;
  } else if (q.type === "multiSelect") {
    const selected = q.choices.filter((_, i) => String(val(q.id,`_${i}`)).trim());
    const expected = q.answers || [];
    const correct = selected.filter(choice => expected.includes(choice)).length;
    const extra = selected.filter(choice => !expected.includes(choice)).length;
    given = selected.length ? selected.join(" | ") : "";
    points = clamp((correct - extra) / expected.length, 0, 1);
  } else if (q.type === "pianoSelect") {
    const selected = pianoSelectedNotes(q);
    const evaluation = gradePianoSelection(q, selected);
    given = selected.length ? selected.map(note => pianoAnswerLabel(q, note)).join(" | ") : "";
    points = evaluation.points;
  } else if (q.type === "classify" || q.type === "match") {
    const scores = q.items.map(item => val(q.id,`_${item}`) === q.answers[item] ? 1 : 0);
    given = q.items.map(item => `${item}: ${val(q.id,`_${item}`)}`).join(" | ");
    points = scores.reduce((a,b)=>a+b,0) / q.items.length;
  } else if (q.type === "order") {
    given = val(q.id);
    const normalized = normalizeText(given).replace(/\s/g, "").split(/[,-]/).join("");
    points = normalized === q.answer.join("") ? 1 : 0;
  } else if (q.type === "trueFalse") {
    given = val(q.id) === "true" ? "V" : val(q.id) === "false" ? "F" : "";
    points = String(q.answer) === String(val(q.id)) ? 1 : 0;
  }
  points = Math.round(points * 1000) / 1000;
  return { id: q.id, prompt: q.prompt, points, given, sampleAnswer: q.sampleAnswer, status: points >= .999 ? "correct" : points > 0 ? "partial" : "wrong" };
}
function pianoSelectedNotes(q) {
  const range = pianoQuestionRange(q);
  return buildPianoNotes(range.from, range.to)
    .map(note => note.note)
    .filter(note => String(val(q.id, `_${note}`)).trim());
}
function pianoQuestionRange(q) {
  return fullPianoRange();
}
function gradePianoSelection(q, selected) {
  const accept = q.accept || buildPianoAcceptance(q);
  if (accept.mode === "oneOf") {
    const alternatives = Array.isArray(accept.alternatives) ? accept.alternatives : [];
    if (!alternatives.length) return { points: 0 };
    return alternatives
      .map(alternative => gradePianoSelection(Object.assign({}, q, { accept: alternative }), selected))
      .reduce((best, current) => current.points > best.points ? current : best, { points: 0 });
  }
  const structural = gradePianoSelectionStructure(q, selected, accept);
  const parserScore = gradeChordParserSelection(accept, selected);
  if (accept.layout) {
    const identityScore = parserScore === null
      ? gradePianoPitchClasses(q, selected, accept)
      : parserScore;
    const layoutScore = gradePianoLayout(selected, accept.layout);
    return { points: clamp((identityScore * .7) + (layoutScore * .3), 0, 1) };
  }
  if (accept.mode === "pitchClass" && parserScore !== null && parserScore >= .999) {
    return { points: 1 };
  }
  return structural;
}
function gradePianoPitchClasses(q, selected, accept) {
  const expected = accept.expected || q.answers || [];
  if (!expected.length || !selected.length) return 0;
  const selectedPcs = uniqueSorted(selected.map(notePitchClass));
  const expectedPcs = accept.pitchClasses || uniqueSorted(expected.map(notePitchClass));
  const correct = selectedPcs.filter(pc => expectedPcs.includes(pc)).length;
  const extra = selectedPcs.filter(pc => !expectedPcs.includes(pc)).length;
  const duplicateExtra = Math.max(0, selected.length - expected.length);
  return expectedPcs.length
    ? clamp((correct - extra - duplicateExtra) / expectedPcs.length, 0, 1)
    : 0;
}
function gradePianoLayout(selected, layout) {
  const notes = selected
    .map(note => ({ note, midi: noteStep(note), pitchClass: notePitchClass(note) }))
    .sort((a, b) => a.midi - b.midi);
  if (!notes.length) return 0;
  const checks = [];
  const bass = notes[0];
  const upper = notes.slice(1);
  if (Number.isFinite(layout.allMin)) checks.push(notes.every(note => note.midi >= layout.allMin));
  if (Number.isFinite(layout.allMax)) checks.push(notes.every(note => note.midi <= layout.allMax));
  if (Number.isFinite(layout.totalMaxSpan)) {
    checks.push(notes[notes.length - 1].midi - notes[0].midi <= layout.totalMaxSpan);
  }
  if (Number.isFinite(layout.bassPitchClass)) checks.push(bass.pitchClass === layout.bassPitchClass);
  if (Number.isFinite(layout.bassMin)) checks.push(bass.midi >= layout.bassMin);
  if (Number.isFinite(layout.bassMax)) checks.push(bass.midi <= layout.bassMax);
  if (Number.isFinite(layout.upperMin)) checks.push(upper.length > 0 && upper.every(note => note.midi >= layout.upperMin));
  if (Number.isFinite(layout.minGapAboveBass)) {
    checks.push(upper.length > 0 && upper[0].midi - bass.midi >= layout.minGapAboveBass);
  }
  if (Number.isFinite(layout.upperMaxSpan)) {
    checks.push(upper.length > 0 && upper[upper.length - 1].midi - upper[0].midi <= layout.upperMaxSpan);
  }
  return checks.length ? checks.filter(Boolean).length / checks.length : 1;
}
function gradePianoSelectionStructure(q, selected, accept) {
  const expected = accept.expected || q.answers || [];
  if (!expected.length || !selected.length) return { points: 0 };

  if (accept.mode === "exact") {
    const correct = selected.filter(note => expected.includes(note)).length;
    const extra = selected.filter(note => !expected.includes(note)).length;
    return { points: clamp((correct - extra) / expected.length, 0, 1) };
  }

  const pcScore = gradePianoPitchClasses(q, selected, accept);

  if (accept.mode === "pitchClass") {
    return { points: pcScore };
  }

  const expectedPattern = accept.pattern || pianoIntervalPattern(expected);
  const selectedPattern = pianoIntervalPattern(selected);
  const patternOk = sameNumberList(expectedPattern, selectedPattern);
  const points = patternOk && pcScore >= .999
    ? 1
    : clamp((pcScore * .45) + (patternOk ? .55 : 0), 0, 1);
  return { points };
}
function pianoAnswerLabel(q, note) {
  return q.noteLabels?.[note] || note;
}
function uniqueHits(text, terms) {
  const clean = normalizeText(text);
  const hits = new Set();
  terms.forEach(term => {
    const norm = normalizeText(term);
    if (clean.includes(norm)) hits.add(norm);
  });
  return hits.size;
}
function choiceLabel(q, value) {
  if (value === "" || value === undefined) return "";
  const i = Number(value);
  if (Number.isNaN(i) || !q.choices[i]) return "";
  return `${String.fromCharCode(97+i)}) ${optionLabel(q.choices[i])}`;
}
function renderQuizResult(result) {
  $("quizStartPanel").classList.add("hidden");
  $("quizActivePanel").classList.add("hidden");
  $("quizResultPanel").classList.remove("hidden");
  applyQuizLock(false);
  const score = result.score.toFixed(1);
  const raw = result.raw.toFixed(2).replace(/\.00$/, "");
  $("scoreCircle").style.setProperty("--score-deg", `${result.percent * 360}deg`);
  setText("finalScore", score);
  setText("rawPoints", `${raw}/${result.max} puntos`);
  setText("resultStudent", result.student.name || "Sin nombre");
  setText("resultCourse", result.student.course || "Sin curso");
  setText("resultDate", result.student.date || "Sin fecha");
  setText("resultWarnings", result.focusWarnings || 0);
  const wrap = $("reviewList");
  wrap.innerHTML = result.details.map(d => {
    const label = d.status === "correct" ? "Correcta" : d.status === "partial" ? "Parcial" : "Incorrecta";
    return `<details class="review-item">
      <summary>${d.id}. ${escapeHtml(label)} · ${d.points.toFixed(2)} punto(s)</summary>
      <div class="review-meta"><b>Pregunta:</b> ${escapeHtml(d.prompt)}</div>
      <div class="review-meta"><b>Respuesta del estudiante:</b> ${escapeHtml(d.given || "Sin respuesta")}</div>
      <div class="review-meta"><b>Referencia de respuesta:</b> ${escapeHtml(d.sampleAnswer)}</div>
    </details>`;
  }).join("");
}
function downloadCSV() {
  const result = state.quiz.result;
  if (!result) return;
  const rows = [["Estudiante","Curso","Fecha","Calificacion_0_5","Puntos","Maximo","Advertencias_foco"]];
  rows.push([result.student.name, result.student.course, result.student.date, result.score.toFixed(1), result.raw.toFixed(2), result.max, result.focusWarnings || 0]);
  rows.push([]);
  rows.push(["Pregunta","Puntos","Respuesta estudiante","Respuesta esperada"]);
  result.details.forEach(d => rows.push([d.id, d.points, d.given, d.sampleAnswer]));
  const csv = rows.map(r => r.map(cell => `"${String(cell ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `resultado_${(result.student.name || "estudiante").replace(/\s+/g,"_")}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function newAttempt() {
  if (!confirm("¿Crear un nuevo intento? Se borrarán las respuestas actuales y el resultado guardado en este navegador.")) return;
  const studied = state.studied;
  const moduleId = state.moduleId;
  state = defaultState();
  state.studied = studied;
  state.moduleId = moduleId;
  saveState(); hydrateStudentFields(); renderQuiz(); showView("quiz");
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch]));
}
function escapeAttr(value) { return escapeHtml(value); }

document.addEventListener("DOMContentLoaded", init);
