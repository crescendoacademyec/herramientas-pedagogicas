const DATA = window.APP_DATA;
const PIANO_NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PIANO_FULL_RANGE = Object.freeze({ from: "C1", to: "C7" });
const PIANO_SELECT_DEFAULT_RANGE = PIANO_FULL_RANGE;
const MODULE_3_REMOVED_QUESTION_IDS = new Set([17, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 34, 46]);
const MODULE_3_PIANO_PROMPTS = {
  1: "Seleccione una fundamental en registro ideal de bajo para Dm7.",
  2: "Seleccione una fundamental en registro ideal de bajo para F7.",
  3: "Seleccione las notas guía de G7 en registro medio.",
  4: "Seleccione una posición cerrada en registro medio para Amaj9 sin bajo.",
  5: "Seleccione un Spread completo para Dm9.",
  6: "Seleccione una separación clara entre bajo y notas guía para Bbmaj7.",
  7: "Seleccione en el teclado un shell válido para F mayor.",
  8: "Seleccione en el teclado un shell válido para Dmaj7.",
  9: "Seleccione en el teclado un shell válido para G7.",
  10: "Seleccione en el teclado un shell válido para A-7.",
  11: "Seleccione en el teclado un shell válido para Emaj9.",
  12: "Seleccione en el teclado un shell válido para Bb mayor.",
  13: "Seleccione en el teclado un shell válido para D7.",
  14: "Seleccione en el teclado un shell válido para Db7.",
  15: "Seleccione en el teclado un shell válido para Amaj9.",
  16: "Seleccione en el teclado un shell válido para Gmaj7.",
  17: "Seleccione una posición cerrada de Cmaj9.",
  18: "Seleccione Skip 2 desde posición cerrada para Fmaj9 desde A como base.",
  19: "Seleccione una posición cerrada de Dm9 sin bajo.",
  24: "Seleccione una posición cerrada completa de Cmaj9 con nota interna agregada.",
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
  12: {
    noteLabels: { "A#2": "Bb2" }
  },
  14: {
    noteLabels: {
      "C#3": "Db3",
      "B3": "Cb4",
      "G#4": "Ab4",
      "D#4": "Eb4"
    }
  },
  15: {
    keyboardRange: { from: "C3", to: "C6" },
    answers: ["C#4", "G#4", "B4"]
  },
  16: {
    keyboardRange: { from: "C3", to: "C6" },
    answers: ["B3", "F#4"]
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
    noteLabels: { "C#4": "C#4" },
    parserCiphers: ["G13(#11)"],
    sampleAnswer: "G2, F3, B3, C#4, E4 y A4."
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
  54: ["G13(#11)"]
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
const LS_KEY = "armonia_funcional_crescendo_v2";
const LEGACY_LS_KEYS = ["teoria_musical_local_app_v1"];
const STATE_SCHEMA_VERSION = 2;
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

      if (module.id === "nivel-3-principios-voicing" && MODULE_3_SHELL_ALTERNATIVES[sourceId]) {
        question.accept = buildShellAcceptance(sourceId);
        question.sampleAnswer = shellSampleAnswer(sourceId, question);
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
function shellSampleAnswer(id, question) {
  const examples = MODULE_3_SHELL_ALTERNATIVES[id]
    .map(notes => notes.map(note => pianoAnswerLabel(question, note)).join(", "));
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
      attemptModuleId: null,
      student: { name: "", course: "", date: "" },
      answers: {},
      focusWarnings: 0,
      result: null
    }
  };
}
function normalizeStoredState(value) {
  const defaults = defaultState();
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;

  const loaded = {
    ...defaults,
    ...value,
    studied: value.studied && typeof value.studied === "object" && !Array.isArray(value.studied)
      ? value.studied
      : {},
    quiz: {
      ...defaults.quiz,
      ...(value.quiz && typeof value.quiz === "object" && !Array.isArray(value.quiz) ? value.quiz : {}),
      student: {
        ...defaults.quiz.student,
        ...(value.quiz?.student && typeof value.quiz.student === "object" && !Array.isArray(value.quiz.student)
          ? value.quiz.student
          : {})
      },
      answers: value.quiz?.answers && typeof value.quiz.answers === "object" && !Array.isArray(value.quiz.answers)
        ? value.quiz.answers
        : {}
    },
    schemaVersion: STATE_SCHEMA_VERSION
  };

  if (!DATA.modules.some(module => module.id === loaded.moduleId)) {
    loaded.moduleId = DATA.modules[0]?.id || defaults.moduleId;
    loaded.quiz = { ...defaults.quiz };
  }

  loaded.quiz.focusWarnings = Math.max(0, Number.parseInt(loaded.quiz.focusWarnings, 10) || 0);
  loaded.quiz.active = Boolean(loaded.quiz.active);
  loaded.quiz.submitted = Boolean(loaded.quiz.submitted);
  loaded.quiz.attemptModuleId = typeof loaded.quiz.attemptModuleId === "string"
    ? loaded.quiz.attemptModuleId
    : (loaded.quiz.active || loaded.quiz.submitted ? loaded.moduleId : null);

  if ((loaded.quiz.active || loaded.quiz.submitted) &&
      loaded.quiz.attemptModuleId &&
      loaded.quiz.attemptModuleId !== loaded.moduleId) {
    loaded.quiz = { ...defaults.quiz };
  }
  return loaded;
}

function readStoredState() {
  const keys = [LS_KEY, ...LEGACY_LS_KEYS];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      return { key, state: normalizeStoredState(parsed) };
    } catch (error) {
      console.warn(`No se pudo leer el estado guardado en ${key}:`, error);
    }
  }
  return { key: null, state: defaultState() };
}

function loadState() {
  const stored = readStoredState();
  if (stored.key && stored.key !== LS_KEY) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(stored.state));
    } catch (error) {
      console.warn("No se pudo migrar el progreso a la nueva versión:", error);
    }
  }
  return stored.state;
}

function saveState() {
  try {
    state.schemaVersion = STATE_SCHEMA_VERSION;
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("No se pudo guardar el progreso local:", error);
    return false;
  }
}
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
function prefersReducedMotion() {
  return !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function scrollPageTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

function percent(n) { return Math.round(n * 100); }
function initialTheoryId() {
  const hashId = decodeURIComponent(location.hash || "").replace(/^#topic-/, "");
  return moduleTheory().some(section => section.id === hashId) ? hashId : moduleTheory()[0]?.id;
}

function populateChordReference() {
  if (!window.ChordRef) return; // chords-ref.js no cargó: continuar sin diagramas
  const mount = $("chordExplorerMount");
  if (mount) window.ChordRef.mount(mount);
}
function init() {
  renderModules();
  renderHome();
  renderTheory();
  populateChordReference();
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
  ["homeView","theoryView","chordsView","quizView"].forEach(id => $(id).classList.add("hidden"));
  $(`${view}View`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(btn => {
    const active = btn.dataset.view === view;
    btn.classList.toggle("active", active);
    if (active) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  if (view === "quiz") renderQuiz();
  scrollPageTop();
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
    return `<button class="module-tab ${active ? "active" : ""}" data-module="${escapeAttr(module.id)}" type="button"${active ? ' aria-current="true"' : ""}>
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
const METHOD_SPECIFIC_TERMS = new Set([
  "Consonancias perfectas",
  "Uso general de extensiones",
  "Duplicaciones y supresiones",
  "Distribución registral",
  "Función tónica",
  "Función subdominante",
  "Función dominante",
  "Rearmonización simple"
]);

function theoryMethodBadge(term) {
  return METHOD_SPECIFIC_TERMS.has(term)
    ? '<span class="method-badge" title="Regla o clasificación operativa propia del método del curso">Método del curso</span>'
    : "";
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
  mountTheoryVisuals();
  mountTopicPractices();
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
          <h4>${escapeHtml(item.term)} ${theoryMethodBadge(item.term)}</h4>
          ${renderConceptBody(item)}
        </section>`).join("")}
      </div>
      ${renderSectionVisuals(section)}
      ${renderTopicPractice(section)}
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
  state.quiz.attemptModuleId = state.moduleId;
  state.quiz.answers = {};
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
  updateQuizProgressUI();
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
  updateQuizProgressUI();
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
  updateQuizProgressUI();
}
function questionCompletion(q) {
  if (q.type === "selectBlanks") {
    const filled = q.answers.filter((_, i) => String(val(q.id, `_${i}`)).trim()).length;
    return filled === 0 ? "empty" : filled === q.answers.length ? "complete" : "partial";
  }
  if (q.type === "classify" || q.type === "match") {
    const filled = q.items.filter(item => String(val(q.id, `_${item}`)).trim()).length;
    return filled === 0 ? "empty" : filled === q.items.length ? "complete" : "partial";
  }
  if (q.type === "multiSelect") {
    return q.choices.some((_, i) => String(val(q.id, `_${i}`)).trim()) ? "complete" : "empty";
  }
  if (q.type === "pianoSelect") {
    return pianoSelectedNotes(q).length ? "complete" : "empty";
  }
  return String(val(q.id)).trim() ? "complete" : "empty";
}
function countAnswered() {
  return moduleQuiz().filter(q => questionCompletion(q) !== "empty").length;
}
function countCompleted() {
  return moduleQuiz().filter(q => questionCompletion(q) === "complete").length;
}
function countPartialInputs() {
  return moduleQuiz().filter(q => questionCompletion(q) === "partial").length;
}
function isAnswered(q) {
  return questionCompletion(q) !== "empty";
}
function updateQuizProgressUI() {
  const total = moduleQuiz().length;
  const completed = countCompleted();
  const partial = countPartialInputs();
  const suffix = partial ? ` · ${partial} incompleta${partial === 1 ? "" : "s"}` : "";
  setText("answeredCount", `${completed}/${total} completas${suffix}`);
  $("quizBar").style.width = `${total ? (completed / total) * 100 : 0}%`;
}
function submitQuiz() {
  const incomplete = moduleQuiz().filter(q => questionCompletion(q) !== "complete");
  if (incomplete.length > 0) {
    const partial = incomplete.filter(q => questionCompletion(q) === "partial").length;
    const empty = incomplete.length - partial;
    const detail = [
      empty ? `${empty} sin respuesta` : "",
      partial ? `${partial} incompleta${partial === 1 ? "" : "s"}` : ""
    ].filter(Boolean).join(" y ");
    if (!confirm(`Quedan ${detail}. Esas preguntas pueden reducir la calificación. ¿Entregar de todos modos?`)) return;
  }

  const submittedAt = new Date().toISOString();
  const result = gradeQuiz(submittedAt);
  state.quiz.submitted = true;
  state.quiz.active = false;
  state.quiz.submittedAt = submittedAt;
  state.quiz.result = result;
  saveState();
  applyQuizLock(false);
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(()=>{});
  renderQuizResult(result);
}
function gradeQuiz(submittedAt = new Date().toISOString()) {
  const details = moduleQuiz().map(q => gradeQuestion(q));
  const raw = details.reduce((sum, d) => sum + d.points, 0);
  const max = moduleQuiz().length;
  const percentValue = max ? raw / max : 0;
  const score = percentValue * 5;
  return {
    schema: "crescendo-armonia-quiz-result",
    schemaVersion: 2,
    moduleId: state.moduleId,
    moduleTitle: activeModule()?.title || "",
    details,
    raw,
    max,
    score,
    percent: percentValue,
    student: { ...state.quiz.student },
    focusWarnings: state.quiz.focusWarnings || 0,
    startedAt: state.quiz.startedAt,
    submittedAt
  };
}
function gradeQuestion(q) {
  let points = 0;
  let given = "";
  if (q.type === "selectBlanks") {
    const scores = q.answers.map((ans, i) => val(q.id,`_${i}`) === ans ? 1 : 0);
    given = q.labels.map((l,i)=>`${l}: ${val(q.id,`_${i}`)}`).join(" | ");
    points = scores.reduce((a,b)=>a+b,0) / q.answers.length;
  } else if (q.type === "multipleChoice") {
    const selectedValue = String(val(q.id)).trim();
    given = choiceLabel(q, selectedValue);
    points = selectedValue !== "" && Number(selectedValue) === q.answer ? 1 : 0;
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
  const completion = questionCompletion(q);
  return {
    id: q.id,
    prompt: q.prompt,
    points,
    given,
    sampleAnswer: q.sampleAnswer,
    completion,
    status: completion === "empty" ? "unanswered" : points >= .999 ? "correct" : points > 0 ? "partial" : "wrong"
  };
}
function pianoSelectedNotes(q) {
  const range = pianoQuestionRange(q);
  return buildPianoNotes(range.from, range.to)
    .map(note => note.note)
    .filter(note => String(val(q.id, `_${note}`)).trim());
}
function pianoQuestionRange(q) {
  const requested = q?.keyboardRange || fullPianoRange();
  const full = fullPianoRange();
  const from = noteStep(requested.from) >= noteStep(full.from) ? requested.from : full.from;
  const to = noteStep(requested.to) <= noteStep(full.to) ? requested.to : full.to;
  return noteStep(from) <= noteStep(to) ? { from, to } : full;
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
    return { points: clamp(identityScore * (.7 + (.3 * layoutScore)), 0, 1) };
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
    const label = d.status === "correct"
      ? "Correcta"
      : d.status === "partial"
        ? "Parcial"
        : d.status === "unanswered"
          ? "Sin respuesta"
          : "Incorrecta";
    return `<details class="review-item">
      <summary>${d.id}. ${escapeHtml(label)} · ${d.points.toFixed(2)} punto(s)</summary>
      <div class="review-meta"><b>Pregunta:</b> ${escapeHtml(d.prompt)}</div>
      <div class="review-meta"><b>Respuesta del estudiante:</b> ${escapeHtml(d.given || "Sin respuesta")}</div>
      <div class="review-meta"><b>Referencia de respuesta:</b> ${escapeHtml(d.sampleAnswer)}</div>
    </details>`;
  }).join("");
}
function safeFilename(value) {
  return String(value || "estudiante")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "estudiante";
}
function downloadCSV() {
  const result = state.quiz.result;
  if (!result) return;
  const rows = [
    ["App","Armonía funcional: aspectos esenciales"],
    ["Modulo", result.moduleTitle || result.moduleId || ""],
    ["Estudiante", result.student.name],
    ["Curso", result.student.course],
    ["Fecha", result.student.date],
    ["Inicio", result.startedAt || ""],
    ["Entrega", result.submittedAt || ""],
    ["Calificacion_0_5", result.score.toFixed(1)],
    ["Puntos", result.raw.toFixed(3)],
    ["Maximo", result.max],
    ["Incidencias_foco_informativas", result.focusWarnings || 0],
    [],
    ["Pregunta","Estado","Puntos","Respuesta estudiante","Respuesta esperada"]
  ];
  result.details.forEach(d => rows.push([
    d.id,
    d.status,
    d.points.toFixed(3),
    d.given || "",
    d.sampleAnswer || ""
  ]));
  const csv = "\uFEFF" + rows
    .map(r => r.map(cell => `"${String(cell ?? "").replace(/"/g,'""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resultado_${safeFilename(result.student.name)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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


/* ============================ FASE 7 · PEDAGOGÍA VISUAL ============================ */

const THEORY_VISUAL_ROOTS = [
  { value: "C", label: "C" },
  { value: "Db", label: "D♭" },
  { value: "D", label: "D" },
  { value: "Eb", label: "E♭" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "Gb", label: "G♭" },
  { value: "G", label: "G" },
  { value: "Ab", label: "A♭" },
  { value: "A", label: "A" },
  { value: "Bb", label: "B♭" },
  { value: "B", label: "B" }
];
const THEORY_VISUAL_SCALE_LIBRARY = [
  { id: "major", label: "Mayor natural", tokens: ["1","2","3","4","5","6","7","8"], formula: "T–T–S–T–T–T–S" },
  { id: "minor-natural", label: "Menor natural", tokens: ["1","2","b3","4","5","b6","b7","8"], formula: "T–S–T–T–S–T–T" },
  { id: "minor-harmonic", label: "Menor armónica", tokens: ["1","2","b3","4","5","b6","7","8"], formula: "T–S–T–T–S–T+S–S" },
  { id: "minor-melodic", label: "Menor melódica", tokens: ["1","2","b3","4","5","6","7","8"], formula: "T–S–T–T–T–T–S" },
  { id: "major-pentatonic", label: "Pentatónica mayor", tokens: ["1","2","3","5","6","8"], formula: "1 2 3 5 6" },
  { id: "minor-pentatonic", label: "Pentatónica menor", tokens: ["1","b3","4","5","b7","8"], formula: "1 ♭3 4 5 ♭7" },
  { id: "dorian", label: "Dórico", tokens: ["1","2","b3","4","5","6","b7","8"], formula: "1 2 ♭3 4 5 6 ♭7" },
  { id: "phrygian", label: "Frigio", tokens: ["1","b2","b3","4","5","b6","b7","8"], formula: "1 ♭2 ♭3 4 5 ♭6 ♭7" },
  { id: "lydian", label: "Lidio", tokens: ["1","2","3","#4","5","6","7","8"], formula: "1 2 3 ♯4 5 6 7" },
  { id: "mixolydian", label: "Mixolidio", tokens: ["1","2","3","4","5","6","b7","8"], formula: "1 2 3 4 5 6 ♭7" },
  { id: "locrian", label: "Locrio", tokens: ["1","b2","b3","4","b5","b6","b7","8"], formula: "1 ♭2 ♭3 4 ♭5 ♭6 ♭7" }
];
const THEORY_VISUAL_INTERVALS = [
  { id: "P1", label: "1 justa", token: "1", semitones: 0, family: "Consonancia perfecta" },
  { id: "m2", label: "2 menor", token: "b2", semitones: 1, family: "Disonancia fuerte" },
  { id: "M2", label: "2 mayor", token: "2", semitones: 2, family: "Disonancia suave" },
  { id: "m3", label: "3 menor", token: "b3", semitones: 3, family: "Consonancia imperfecta" },
  { id: "M3", label: "3 mayor", token: "3", semitones: 4, family: "Consonancia imperfecta" },
  { id: "P4", label: "4 justa", token: "4", semitones: 5, family: "Consonancia perfecta (según este curso)" },
  { id: "TT", label: "4 aumentada / 5 disminuida", token: "#4", semitones: 6, family: "Disonancia neutra" },
  { id: "P5", label: "5 justa", token: "5", semitones: 7, family: "Consonancia perfecta" },
  { id: "m6", label: "6 menor", token: "b6", semitones: 8, family: "Consonancia imperfecta" },
  { id: "M6", label: "6 mayor", token: "6", semitones: 9, family: "Consonancia imperfecta" },
  { id: "m7", label: "7 menor", token: "b7", semitones: 10, family: "Disonancia suave" },
  { id: "M7", label: "7 mayor", token: "7", semitones: 11, family: "Disonancia fuerte" },
  { id: "P8", label: "8 justa", token: "8", semitones: 12, family: "Consonancia perfecta" }
];
const THEORY_VISUAL_DEGREE_BASE = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12, 9: 14, 10: 16, 11: 17, 12: 19, 13: 21 };
const THEORY_VISUAL_NATURAL_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const THEORY_VISUAL_NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];
const THEORY_VISUAL_ACC_VAL = { "": 0, "b": -1, "#": 1, "bb": -2, "##": 2 };
const THEORY_VISUAL_ACC_SYM = { "-2": "♭♭", "-1": "♭", "0": "", "1": "♯", "2": "♯♯" };
const THEORY_VISUAL_LABS = {
  "escalas-intervalos": [
    { type: "scaleExplorer", title: "Explorador de escalas", description: "Selecciona una tónica y una escala para verla en piano, guitarra y pentagrama." },
    { type: "intervalExplorer", title: "Explorador de intervalos", description: "Visualiza cualquier intervalo y comprueba su cantidad de semitonos y su familia sonora." }
  ],
  "consonancias-disonancias": [
    { type: "intervalExplorer", title: "Clasificador interválico", description: "Relaciona el intervalo con su categoría: consonancia perfecta, imperfecta o disonancia." }
  ],
  "acordes": [
    { type: "chordExplorer", title: "Constructor visual de acordes", description: "Explora la estructura, el soporte y la superestructura de un acorde con tres representaciones.", options: { categories: ["Triadas", "Séptimas y sextas", "Novenas", "Onceavas y treceavas", "Con #11"], defaultSymbol: "maj7" } }
  ],
  "enlace-voces": [
    { type: "shellLab", title: "Notas guía y shells", description: "Selecciona una fundamental y observa cómo quedan la fundamental y las notas guía en un shell práctico." }
  ],
  "tonalidad": [
    { type: "tonalityLab", title: "Mapa tonal", description: "Elige una tonalidad y revisa su escala, sus grados y sus funciones tónica, subdominante y dominante." }
  ],
  "rearmonizacion": [
    { type: "reharmLab", title: "Laboratorio de rearmonización", description: "Prueba sustituciones funcionales simples y observa cómo cambia una progresión manteniendo la función." }
  ],
  "nivel-2-referencia-intervalica": [
    { type: "scaleExplorer", title: "Referencia interválica", description: "Usa la escala mayor natural como mapa visual de referencia para cada grado." },
    { type: "intervalExplorer", title: "Relación grado–intervalo", description: "Conecta cada grado con su distancia en semitonos." }
  ],
  "nivel-2-sistema-americano-cifrado": [
    { type: "chordExplorer", title: "Cifrado americano en contexto", description: "Elige un acorde y contrasta el símbolo con sus notas reales.", options: { categories: ["Triadas", "Séptimas y sextas"], defaultSymbol: "" } }
  ],
  "nivel-2-triadas": [
    { type: "chordExplorer", title: "Triadas en tres vistas", description: "Mayor, menor, aumentada, disminuida o suspendida: compáralas en teclado, guitarra y pentagrama.", options: { categories: ["Triadas"], defaultSymbol: "" } }
  ],
  "nivel-2-soportes": [
    { type: "chordExplorer", title: "Soportes: 6 y 7", description: "Comprueba visualmente cómo cambia el acorde al añadir sexta o séptima.", options: { categories: ["Séptimas y sextas"], defaultSymbol: "6" } }
  ],
  "nivel-2-septimas": [
    { type: "chordExplorer", title: "Séptimas menores y mayores", description: "Revisa la diferencia entre maj7, 7 y -7.", options: { categories: ["Séptimas y sextas", "Séptimas alteradas"], defaultSymbol: "7" } }
  ],
  "nivel-2-reglas-extensiones": [
    { type: "chordExplorer", title: "Extensiones y color", description: "Explora cómo las extensiones agregan color armónico.", options: { categories: ["Novenas", "Onceavas y treceavas", "Con #11"], defaultSymbol: "9" } }
  ],
  "nivel-2-novenas": [
    { type: "chordExplorer", title: "Novenas", description: "Compara add9, 9, maj9, b9 y #9.", options: { categories: ["Novenas"], defaultSymbol: "9" } }
  ],
  "nivel-2-onceavas": [
    { type: "chordExplorer", title: "Onceavas", description: "Comprueba cuándo aparece la 11 natural y cuándo la #11.", options: { categories: ["Onceavas y treceavas", "Con #11"], defaultSymbol: "-11" } }
  ],
  "nivel-2-treceavas": [
    { type: "chordExplorer", title: "Treceavas", description: "Visualiza 13, maj13, 13b9, 13#9 y 13#11.", options: { categories: ["Onceavas y treceavas", "Con #11"], defaultSymbol: "13" } }
  ],
  "nivel-2-omision-notas": [
    { type: "constructionLab", title: "Qué mantener y qué omitir", description: "Observa la triada, el soporte y las extensiones para decidir qué notas suelen conservarse." }
  ],
  "nivel-2-aplicacion": [
    { type: "chordExplorer", title: "Aplicación práctica", description: "Explora acordes concretos y transfiere las reglas del tema a ejemplos reales.", options: { categories: ["Triadas", "Séptimas y sextas", "Novenas", "Onceavas y treceavas"], defaultSymbol: "maj9" } }
  ],
  "nivel-2-sintesis-reglas": [
    { type: "constructionLab", title: "Síntesis visual de reglas", description: "Resume visualmente estructura, soporte y extensiones en un solo acorde elegido." }
  ],
  "nivel-3-registros-zonas": [
    { type: "registerLab", title: "Mapa interactivo de registros", description: "Selecciona una zona de trabajo y visualízala inmediatamente sobre el teclado." }
  ],
  "nivel-3-shell-voicings": [
    { type: "shellLab", title: "Shell voicings", description: "Elige una fundamental y un tipo de acorde para ver una realización shell sugerida." }
  ],
  "nivel-3-posicion-cerrada-skip-2": [
    { type: "drop2Lab", title: "Posición cerrada y Skip 2", description: "Compara una disposición cerrada con su transformación tipo Skip 2 / Drop 2." }
  ],
  "nivel-3-registro-grave-extensiones": [
    { type: "extensionPlacementLab", title: "Ubicación de extensiones", description: "Comprueba por qué el grave se reserva al bajo y las extensiones suben al registro agudo." }
  ],
  "nivel-3-construccion-acordes-extendidos": [
    { type: "constructionLab", title: "Construcción de acordes extendidos", description: "Arma un acorde por etapas: triada, soporte y extensiones." }
  ],
  "nivel-3-acompanamiento-bajo-acorde": [
    { type: "bassChordLab", title: "Acompañamiento bajo/acorde", description: "Visualiza una propuesta de reparto entre mano izquierda y mano derecha." }
  ]
};
const THEORY_VISUAL_CHORD_FORMULAS = {
  "": "1 3 5",
  "-": "1 b3 5",
  "+": "1 3 #5",
  "°": "1 b3 b5",
  "sus2": "1 2 5",
  "sus4": "1 4 5",
  "6": "1 3 5 6",
  "-6": "1 b3 5 6",
  "maj7": "1 3 5 7",
  "7": "1 3 5 b7",
  "-7": "1 b3 5 b7",
  "9": "1 3 5 b7 9",
  "maj9": "1 3 5 7 9",
  "-9": "1 b3 5 b7 9",
  "-11": "1 b3 5 b7 9 11",
  "13": "1 3 5 b7 9 13",
  "13b9": "1 3 5 b7 b9 13",
  "13#11": "1 3 5 b7 9 #11 13",
  "maj9#11": "1 3 5 7 9 #11",
  "7#11": "1 3 5 b7 #11",
  "7b9": "1 3 5 b7 b9"
};
const THEORY_VISUAL_ROMAN_QUALITIES_MAJOR = [
  { roman: "I", degree: 1, suffix: "maj7", quality: "Tónica" },
  { roman: "ii", degree: 2, suffix: "-7", quality: "Subdominante" },
  { roman: "iii", degree: 3, suffix: "-7", quality: "Tónica" },
  { roman: "IV", degree: 4, suffix: "maj7", quality: "Subdominante" },
  { roman: "V", degree: 5, suffix: "7", quality: "Dominante" },
  { roman: "vi", degree: 6, suffix: "-7", quality: "Tónica" },
  { roman: "vii°", degree: 7, suffix: "m7♭5", quality: "Dominante" }
];
const THEORY_VISUAL_ROMAN_QUALITIES_MINOR = [
  { roman: "i", degree: 1, suffix: "-7", quality: "Tónica" },
  { roman: "ii°", degree: 2, suffix: "m7♭5", quality: "Subdominante" },
  { roman: "III", degree: 3, suffix: "maj7", quality: "Tónica" },
  { roman: "iv", degree: 4, suffix: "-7", quality: "Subdominante" },
  { roman: "V", degree: 5, suffix: "7", quality: "Dominante" },
  { roman: "VI", degree: 6, suffix: "maj7", quality: "Tónica" },
  { roman: "vii°", degree: 7, suffix: "°7", quality: "Dominante" }
];

function renderSectionVisuals(section) {
  const labs = THEORY_VISUAL_LABS[section.id] || [];
  if (!labs.length) return "";
  return `<section class="theory-visuals panel" aria-label="Material visual interactivo">
    <header class="theory-visuals-head">
      <div>
        <p class="kicker">Material visual interactivo</p>
        <h4>Aprender viendo y comparando</h4>
        <p>Estos apoyos gráficos permiten manipular el contenido del tema y contrastarlo en instrumentos o notación.</p>
      </div>
    </header>
    <div class="visual-lab-grid">
      ${labs.map((lab, index) => `<article class="visual-lab-card">
        <div class="visual-lab-copy">
          <h5>${escapeHtml(lab.title)}</h5>
          <p>${escapeHtml(lab.description)}</p>
        </div>
        <div class="visual-lab-mount" data-theory-widget="${escapeAttr(lab.type)}" data-widget-options="${escapeAttr(JSON.stringify(lab.options || {}))}" data-widget-key="${escapeAttr(section.id)}-${index}"></div>
      </article>`).join("")}
    </div>
  </section>`;
}
function mountTheoryVisuals() {
  document.querySelectorAll("[data-theory-widget]").forEach(el => {
    const type = el.dataset.theoryWidget;
    const options = safeJsonParse(el.dataset.widgetOptions || "{}");
    if (type === "scaleExplorer") mountScaleExplorer(el, options);
    else if (type === "intervalExplorer") mountIntervalExplorer(el, options);
    else if (type === "chordExplorer") mountChordExplorerLab(el, options);
    else if (type === "tonalityLab") mountTonalityLab(el, options);
    else if (type === "reharmLab") mountReharmLab(el, options);
    else if (type === "registerLab") mountRegisterLab(el, options);
    else if (type === "shellLab") mountShellLab(el, options);
    else if (type === "drop2Lab") mountDrop2Lab(el, options);
    else if (type === "extensionPlacementLab") mountExtensionPlacementLab(el, options);
    else if (type === "constructionLab") mountConstructionLab(el, options);
    else if (type === "bassChordLab") mountBassChordLab(el, options);
  });
}
function safeJsonParse(value) {
  try { return JSON.parse(value); } catch (error) { return {}; }
}
function theorySelectOptions(items, selected, valueKey = "value", labelKey = "label") {
  return items.map(item => `<option value="${escapeAttr(item[valueKey])}" ${item[valueKey] === selected ? "selected" : ""}>${escapeHtml(item[labelKey])}</option>`).join("");
}
function theoryRootInfo(name) {
  const clean = String(name || "C").replace(/♭/g, "b").replace(/♯/g, "#");
  const letter = clean[0] || "C";
  const letterIdx = THEORY_VISUAL_NATURAL_LETTERS.indexOf(letter);
  const acc = (clean.slice(1).match(/bb|##|b|#/g) || []).reduce((sum, token) => sum + THEORY_VISUAL_ACC_VAL[token], 0);
  const pc = ((THEORY_VISUAL_NATURAL_PC[letterIdx] + acc) % 12 + 12) % 12;
  return { name: clean, letter, letterIdx, acc, pc };
}
function theoryDegreeInfo(token) {
  const match = String(token || "1").match(/^(bb|##|b|#)?(\d+)$/);
  const accTok = match?.[1] || "";
  const degree = Number(match?.[2] || 1);
  return {
    token: String(token || "1"),
    accTok,
    degree,
    accVal: THEORY_VISUAL_ACC_VAL[accTok] || 0,
    baseSemi: THEORY_VISUAL_DEGREE_BASE[degree] ?? 0
  };
}
function accidentalSymbol(diff) {
  return THEORY_VISUAL_ACC_SYM[String(diff)] || "";
}
function spellTheoryTone(rootName, token) {
  const root = theoryRootInfo(rootName);
  const info = theoryDegreeInfo(token);
  const absPc = ((root.pc + info.baseSemi + info.accVal) % 12 + 12) % 12;
  const letterStep = info.degree - 1;
  const letterIdx = (root.letterIdx + letterStep) % 7;
  const natPc = THEORY_VISUAL_NATURAL_PC[letterIdx];
  const diff = ((absPc - natPc + 18) % 12) - 6;
  const clamped = Math.max(-2, Math.min(2, diff));
  return {
    token: info.token,
    degree: info.degree,
    semi: info.baseSemi + info.accVal,
    pc: absPc,
    diatonicStepsFromRoot: letterStep,
    accSym: accidentalSymbol(clamped),
    name: THEORY_VISUAL_NATURAL_LETTERS[letterIdx] + accidentalSymbol(clamped),
    isRoot: info.degree === 1 && info.accVal === 0
  };
}
function buildTheoryTones(rootName, tokens) {
  return tokens.map(token => spellTheoryTone(rootName, token));
}
function midiToSharpNote(step) {
  const pc = ((step % 12) + 12) % 12;
  const octave = Math.floor(step / 12) - 1;
  return `${PIANO_NOTE_NAMES[pc]}${octave}`;
}
function theoryRootUnicode(name) {
  return String(name || "C").replace(/b/g, "♭").replace(/#/g, "♯");
}
function theoryRootMidi(rootName, octave) {
  const root = theoryRootInfo(rootName);
  return ((Number(octave) + 1) * 12) + root.pc;
}
function pianoDiagramForTones(rootName, tones, options = {}) {
  const baseOctave = Number(options.baseOctave ?? 3);
  const rootStep = theoryRootMidi(rootName, baseOctave);
  const keys = {};
  tones.forEach((tone, index) => {
    const octaveLift = tone.degree > 7 ? 0 : 0;
    const step = rootStep + tone.semi + (Number(options.extraOctaveFor?.[tone.token]) || 0) + (tone.degree === 1 && index > 0 ? 12 : 0);
    const noteId = midiToSharpNote(step);
    keys[noteId] = {
      color: tone.isRoot ? "#d4a84f" : (options.colorMap?.[tone.token] || "#91e2af"),
      opacity: tone.isRoot ? 100 : 86,
      label: { text: tone.name, fontSize: 12, verticalOffset: 10 }
    };
  });
  return { keys };
}
function scalePianoDiagram(rootName, scale) {
  const tones = buildTheoryTones(rootName, scale.tokens);
  const rootStep = theoryRootMidi(rootName, 3);
  const keys = {};
  tones.forEach((tone, index) => {
    const step = rootStep + tone.semi;
    const noteId = midiToSharpNote(step);
    keys[noteId] = {
      color: tone.isRoot ? "#d4a84f" : "#91e2af",
      opacity: tone.isRoot ? 100 : 84,
      label: { text: tone.name, fontSize: 11, verticalOffset: 10 + ((index % 2) * 2) }
    };
  });
  return { keys };
}
function scaleLegend(tones) {
  return tones.map(tone => `<span class="visual-pill">${escapeHtml(tone.name)} <small>${escapeHtml(tone.token.replace(/b/g, "♭").replace(/#/g, "♯"))}</small></span>`).join("");
}
function renderScaleStaff(rootName, tones, label) {
  const root = theoryRootInfo(rootName);
  const e4Diatonic = 4 * 7 + THEORY_VISUAL_NATURAL_LETTERS.indexOf("E");
  function staffStep(tone) {
    const rootDiatonic = 4 * 7 + root.letterIdx;
    return (rootDiatonic + tone.diatonicStepsFromRoot) - e4Diatonic;
  }
  const placed = tones.map((tone, index) => ({ tone, step: staffStep(tone), x: 56 + (index * 28) }));
  const minStep = Math.min(0, ...placed.map(item => item.step));
  const maxStep = Math.max(8, ...placed.map(item => item.step));
  const lineGap = 10;
  const stepHeight = lineGap / 2;
  const topPad = Math.max(0, maxStep - 8) * stepHeight + 18;
  const bottomPad = Math.max(0, -minStep) * stepHeight + 20;
  const w = Math.max(280, 88 + (placed.length * 30));
  const staffTop = topPad;
  const yOf = step => staffTop + (8 - step) * stepHeight;
  const h = yOf(minStep) + bottomPad;
  const lines = [];
  for (let s = 0; s <= 8; s += 2) {
    lines.push(`<line x1="18" y1="${yOf(s)}" x2="${w - 18}" y2="${yOf(s)}" class="jz-staff-line"></line>`);
  }
  const notes = placed.map(item => {
    const nx = item.x;
    const ny = yOf(item.step);
    const ledger = [];
    if (item.step > 8) {
      for (let s = 10; s <= item.step; s += 2) ledger.push(`<line x1="${nx - 11}" y1="${yOf(s)}" x2="${nx + 11}" y2="${yOf(s)}" class="jz-ledger"></line>`);
    }
    if (item.step < 0) {
      for (let s = -2; s >= item.step; s -= 2) ledger.push(`<line x1="${nx - 11}" y1="${yOf(s)}" x2="${nx + 11}" y2="${yOf(s)}" class="jz-ledger"></line>`);
    }
    const accidental = item.tone.accSym ? `<text x="${nx - 14}" y="${ny + 4}" text-anchor="middle" class="jz-accidental">${item.tone.accSym}</text>` : "";
    return `${ledger.join("")}
      ${accidental}
      <ellipse cx="${nx}" cy="${ny}" rx="6" ry="4.6" transform="rotate(-18 ${nx} ${ny})" class="jz-notehead ${item.tone.isRoot ? "jz-notehead-root" : ""}"></ellipse>
      <text x="${nx}" y="${h - 4}" text-anchor="middle" class="visual-staff-degree">${escapeHtml(item.tone.token.replace(/b/g, "♭").replace(/#/g, "♯"))}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" class="jz-staff visual-staff-scale" role="img" aria-label="${escapeAttr(label)}">
    ${lines.join("")}
    ${notes}
  </svg>`;
}
function renderScaleGuitar(rootName, tones, label) {
  const pcs = new Set(tones.map(tone => tone.pc));
  const rootPc = theoryRootInfo(rootName).pc;
  const stringData = [
    { label: "E", pc: 4 }, { label: "B", pc: 11 }, { label: "G", pc: 7 },
    { label: "D", pc: 2 }, { label: "A", pc: 9 }, { label: "E", pc: 4 }
  ];
  const nFrets = 12;
  const stringGap = 28;
  const fretGap = 34;
  const marginL = 28;
  const marginT = 16;
  const w = marginL + nFrets * fretGap + 44;
  const h = marginT + (stringData.length - 1) * stringGap + 28;
  const dots = [];
  stringData.forEach((string, row) => {
    for (let fret = 0; fret <= nFrets; fret += 1) {
      const pc = (string.pc + fret) % 12;
      if (!pcs.has(pc)) continue;
      const x = marginL + 22 + fret * fretGap;
      const y = marginT + row * stringGap;
      const isRoot = pc === rootPc;
      const labelText = isRoot ? "R" : "";
      dots.push(`<circle cx="${x}" cy="${y}" r="8.7" class="visual-fret-dot ${isRoot ? "root" : ""}"></circle>
        ${labelText ? `<text x="${x}" y="${y + 3.5}" text-anchor="middle" class="visual-fret-dot-label">${labelText}</text>` : ""}`);
    }
  });
  return `<svg viewBox="0 0 ${w} ${h}" class="visual-guitar-scale" role="img" aria-label="${escapeAttr(label)}">
    ${stringData.map((string, row) => `<text x="12" y="${marginT + row * stringGap + 4}" text-anchor="middle" class="jz-string-label-h">${string.label}</text>`).join("")}
    ${stringData.map((_, row) => `<line x1="${marginL}" y1="${marginT + row * stringGap}" x2="${w - 14}" y2="${marginT + row * stringGap}" class="jz-string-h"></line>`).join("")}
    ${Array.from({ length: nFrets + 1 }, (_, index) => `<line x1="${marginL + 22 + index * fretGap}" y1="${marginT}" x2="${marginL + 22 + index * fretGap}" y2="${marginT + (stringData.length - 1) * stringGap}" class="${index === 0 ? "jz-nut-h" : "jz-fret-h"}"></line>`).join("")}
    ${Array.from({ length: nFrets + 1 }, (_, index) => `<text x="${marginL + 22 + index * fretGap}" y="${h - 6}" text-anchor="middle" class="jz-fret-num-h">${index}</text>`).join("")}
    ${dots.join("")}
  </svg>`;
}
function mountScaleExplorer(el) {
  const defaultScale = "major";
  el.innerHTML = `<div class="theory-widget theory-widget-scale">
    <div class="visual-controls">
      <label>Fundamental<select data-scale-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Escala<select data-scale-type>${theorySelectOptions(THEORY_VISUAL_SCALE_LIBRARY, defaultScale, "id", "label")}</select></label>
    </div>
    <div class="visual-summary">
      <div><strong data-scale-name></strong><div class="small-note" data-scale-formula></div></div>
      <div class="visual-pill-row" data-scale-notes></div>
    </div>
    <div class="visual-panel-grid visual-panel-grid-3">
      <section class="visual-panel"><div class="diagram-label">Piano</div><div data-scale-piano></div></section>
      <section class="visual-panel"><div class="diagram-label">Guitarra · mapa de escala</div><div class="diagram-scroll" data-scale-guitar></div></section>
      <section class="visual-panel"><div class="diagram-label">Pentagrama · grados ascendentes</div><div class="diagram-scroll" data-scale-staff></div></section>
    </div>
  </div>`;
  const rootSel = el.querySelector("[data-scale-root]");
  const typeSel = el.querySelector("[data-scale-type]");
  const update = () => {
    const rootName = rootSel.value;
    const scale = THEORY_VISUAL_SCALE_LIBRARY.find(item => item.id === typeSel.value) || THEORY_VISUAL_SCALE_LIBRARY[0];
    const tones = buildTheoryTones(rootName, scale.tokens);
    el.querySelector("[data-scale-name]").textContent = `${theoryRootUnicode(rootName)} ${scale.label}`;
    el.querySelector("[data-scale-formula]").textContent = `Patrón: ${scale.formula}`;
    el.querySelector("[data-scale-notes]").innerHTML = scaleLegend(tones);
    el.querySelector("[data-scale-piano]").innerHTML = renderPianoDiagram(scalePianoDiagram(rootName, scale));
    el.querySelector("[data-scale-guitar]").innerHTML = renderScaleGuitar(rootName, tones, `${theoryRootUnicode(rootName)} ${scale.label} en guitarra`);
    el.querySelector("[data-scale-staff]").innerHTML = renderScaleStaff(rootName, tones, `${theoryRootUnicode(rootName)} ${scale.label} en pentagrama`);
  };
  rootSel.addEventListener("change", update);
  typeSel.addEventListener("change", update);
  update();
}
function mountIntervalExplorer(el) {
  const defaultInterval = "M3";
  el.innerHTML = `<div class="theory-widget theory-widget-interval">
    <div class="visual-controls">
      <label>Nota base<select data-interval-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Intervalo<select data-interval-type>${theorySelectOptions(THEORY_VISUAL_INTERVALS, defaultInterval, "id", "label")}</select></label>
    </div>
    <div class="visual-summary">
      <div><strong data-interval-name></strong><div class="small-note" data-interval-meta></div></div>
      <div class="visual-pill-row" data-interval-notes></div>
    </div>
    <div class="visual-panel-grid visual-panel-grid-3">
      <section class="visual-panel"><div class="diagram-label">Pentagrama</div><div class="diagram-scroll" data-interval-staff></div></section>
      <section class="visual-panel"><div class="diagram-label">Guitarra · digitación sugerida</div><div class="diagram-scroll" data-interval-guitar></div></section>
      <section class="visual-panel"><div class="diagram-label">Piano</div><div class="diagram-scroll" data-interval-piano></div></section>
    </div>
  </div>`;
  const rootSel = el.querySelector("[data-interval-root]");
  const intervalSel = el.querySelector("[data-interval-type]");
  const update = () => {
    const interval = THEORY_VISUAL_INTERVALS.find(item => item.id === intervalSel.value) || THEORY_VISUAL_INTERVALS[0];
    const rootName = rootSel.value;
    const rootTone = spellTheoryTone(rootName, "1");
    const targetTone = spellTheoryTone(rootName, interval.token);
    const tones = interval.token === "1" ? [rootTone, { ...targetTone, semi: 12, degree: 8, diatonicStepsFromRoot: 7, name: rootTone.name, token: "8" }] : [rootTone, targetTone];
    const rootInfo = window.__ChordCore?.rootInfo?.(theoryRootUnicode(rootName)) || null;
    el.querySelector("[data-interval-name]").textContent = `${theoryRootUnicode(rootName)} → ${targetTone.name} · ${interval.label}`;
    el.querySelector("[data-interval-meta]").textContent = `${interval.semitones} semitonos · ${interval.family}`;
    el.querySelector("[data-interval-notes]").innerHTML = tones.map(tone => `<span class="visual-pill">${escapeHtml(tone.name)} <small>${escapeHtml(tone.token.replace(/b/g, "♭").replace(/#/g, "♯"))}</small></span>`).join("");
    if (rootInfo && window.__ChordCore) {
      el.querySelector("[data-interval-staff]").innerHTML = window.__ChordCore.staffSVG(rootInfo, tones, `${theoryRootUnicode(rootName)} ${interval.label}`);
      el.querySelector("[data-interval-guitar]").innerHTML = window.__ChordCore.guitarSVG(rootInfo, tones, `${theoryRootUnicode(rootName)} ${interval.label}`);
      el.querySelector("[data-interval-piano]").innerHTML = window.__ChordCore.pianoSVG(rootInfo, tones, `${theoryRootUnicode(rootName)} ${interval.label}`);
    }
  };
  rootSel.addEventListener("change", update);
  intervalSel.addEventListener("change", update);
  update();
}
function mountChordExplorerLab(el, options = {}) {
  const mountPoint = document.createElement("div");
  el.innerHTML = "";
  el.appendChild(mountPoint);
  ChordRef.mount(mountPoint);
  const rootSel = mountPoint.querySelector('[data-cx="root"]');
  const typeSel = mountPoint.querySelector('[data-cx="type"]');
  if (Array.isArray(options.categories) && options.categories.length) {
    mountPoint.querySelectorAll('optgroup').forEach(group => {
      if (!options.categories.includes(group.label)) group.remove();
    });
  }
  if (options.defaultRoot) {
    const rootIndex = ChordRef.ROOTS.findIndex(name => name === theoryRootUnicode(options.defaultRoot));
    if (rootIndex >= 0) rootSel.value = String(rootIndex);
  } else {
    rootSel.value = "0";
  }
  if (options.defaultSymbol) {
    const typeIndex = ChordRef.CHORD_TYPES.findIndex(type => type.symbol === options.defaultSymbol);
    if (typeIndex >= 0 && typeSel.querySelector(`option[value="${typeIndex}"]`)) typeSel.value = String(typeIndex);
  }
  rootSel.dispatchEvent(new Event("change"));
}
function mountTonalityLab(el) {
  el.innerHTML = `<div class="theory-widget theory-widget-tonality">
    <div class="visual-controls">
      <label>Tonalidad<select data-key-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Modo<select data-key-mode>
        <option value="major">Mayor</option>
        <option value="minor">Menor</option>
      </select></label>
    </div>
    <div class="visual-summary">
      <div><strong data-key-title></strong><div class="small-note" data-key-desc></div></div>
      <div class="visual-pill-row" data-key-notes></div>
    </div>
    <div class="visual-panel-grid visual-panel-grid-2">
      <section class="visual-panel"><div class="diagram-label">Escala de la tonalidad</div><div data-key-piano></div></section>
      <section class="visual-panel">
        <div class="diagram-label">Funciones armónicas</div>
        <div class="function-groups" data-key-functions></div>
      </section>
    </div>
  </div>`;
  const rootSel = el.querySelector("[data-key-root]");
  const modeSel = el.querySelector("[data-key-mode]");
  const update = () => {
    const isMinor = modeSel.value === "minor";
    const scale = THEORY_VISUAL_SCALE_LIBRARY.find(item => item.id === (isMinor ? "minor-natural" : "major"));
    const tones = buildTheoryTones(rootSel.value, scale.tokens);
    const scaleNotes = tones.slice(0, 7);
    const families = isMinor ? THEORY_VISUAL_ROMAN_QUALITIES_MINOR : THEORY_VISUAL_ROMAN_QUALITIES_MAJOR;
    const groups = {
      "Tónica": families.filter(item => item.quality === "Tónica"),
      "Subdominante": families.filter(item => item.quality === "Subdominante"),
      "Dominante": families.filter(item => item.quality === "Dominante")
    };
    el.querySelector("[data-key-title]").textContent = `${theoryRootUnicode(rootSel.value)} ${isMinor ? "menor" : "mayor"}`;
    el.querySelector("[data-key-desc]").textContent = isMinor
      ? "Escala base: menor natural. La función dominante se refuerza habitualmente con la sensible de la menor armónica."
      : "Escala base: mayor natural. Los grados se agrupan según su función tónica, subdominante o dominante.";
    el.querySelector("[data-key-notes]").innerHTML = scaleLegend(scaleNotes);
    el.querySelector("[data-key-piano]").innerHTML = renderPianoDiagram(scalePianoDiagram(rootSel.value, scale));
    el.querySelector("[data-key-functions]").innerHTML = Object.entries(groups).map(([title, list]) => `<section class="function-group">
      <h6>${title}</h6>
      <div class="function-chip-row">${list.map(item => {
        const tone = scaleNotes[item.degree - 1];
        const chordLabel = `${tone?.name || "?"}${item.suffix}`;
        return `<span class="function-chip"><b>${item.roman}</b> ${escapeHtml(chordLabel)}</span>`;
      }).join("")}</div>
    </section>`).join("");
  };
  rootSel.addEventListener("change", update);
  modeSel.addEventListener("change", update);
  update();
}
function mountReharmLab(el) {
  el.innerHTML = `<div class="theory-widget theory-widget-reharm">
    <div class="visual-controls">
      <label>Tonalidad<select data-reharm-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Tónica inicial<select data-slot-t1></select></label>
      <label>Tónica interna<select data-slot-t2></select></label>
      <label>Subdominante<select data-slot-s></select></label>
      <label>Dominante<select data-slot-d></select></label>
    </div>
    <div class="visual-summary">
      <div><strong data-reharm-title></strong><div class="small-note">Progresión funcional ejemplo: tónica → tónica → subdominante → dominante → tónica.</div></div>
    </div>
    <div class="function-progressions">
      <div class="progression-line" data-reharm-progression></div>
      <div class="function-groups" data-reharm-choices></div>
    </div>
  </div>`;
  const rootSel = el.querySelector("[data-reharm-root]");
  const t1Sel = el.querySelector("[data-slot-t1]");
  const t2Sel = el.querySelector("[data-slot-t2]");
  const sSel = el.querySelector("[data-slot-s]");
  const dSel = el.querySelector("[data-slot-d]");
  const fillOptions = () => {
    const scale = buildTheoryTones(rootSel.value, THEORY_VISUAL_SCALE_LIBRARY.find(item => item.id === "major").tokens).slice(0, 7);
    const families = THEORY_VISUAL_ROMAN_QUALITIES_MAJOR;
    const byQuality = {
      "Tónica": families.filter(item => item.quality === "Tónica"),
      "Subdominante": families.filter(item => item.quality === "Subdominante"),
      "Dominante": families.filter(item => item.quality === "Dominante")
    };
    const makeOptions = family => family.map(item => {
      const tone = scale[item.degree - 1];
      return { value: item.roman, label: `${item.roman} · ${tone?.name || "?"}${item.suffix}` };
    });
    t1Sel.innerHTML = theorySelectOptions(makeOptions(byQuality["Tónica"]), "I");
    t2Sel.innerHTML = theorySelectOptions(makeOptions(byQuality["Tónica"]), "vi");
    sSel.innerHTML = theorySelectOptions(makeOptions(byQuality["Subdominante"]), "ii");
    dSel.innerHTML = theorySelectOptions(makeOptions(byQuality["Dominante"]), "V");
    return { scale, byQuality };
  };
  const update = () => {
    const { scale, byQuality } = fillOptions();
    const labelOf = roman => {
      const item = THEORY_VISUAL_ROMAN_QUALITIES_MAJOR.find(entry => entry.roman === roman);
      const tone = scale[(item?.degree || 1) - 1];
      return `${roman} · ${tone?.name || "?"}${item?.suffix || ""}`;
    };
    el.querySelector("[data-reharm-title]").textContent = `${theoryRootUnicode(rootSel.value)} mayor · sustitución funcional simple`;
    el.querySelector("[data-reharm-progression]").innerHTML = [t1Sel.value, t2Sel.value, sSel.value, dSel.value, "I"].map(value => `<span class="progression-chord">${escapeHtml(labelOf(value))}</span>`).join('<span class="progression-arrow">→</span>');
    el.querySelector("[data-reharm-choices]").innerHTML = Object.entries(byQuality).map(([title, list]) => `<section class="function-group">
      <h6>${title}</h6>
      <div class="function-chip-row">${list.map(item => {
        const tone = scale[item.degree - 1];
        return `<span class="function-chip"><b>${item.roman}</b> ${escapeHtml(tone?.name || "?")}${escapeHtml(item.suffix)}</span>`;
      }).join("")}</div>
    </section>`).join("");
  };
  [rootSel, t1Sel, t2Sel, sSel, dSel].forEach(sel => sel.addEventListener("change", update));
  update();
}
function registerRangeDiagram(from, to, color, labelText) {
  const start = noteStep(from);
  const end = noteStep(to);
  const keys = {};
  for (let step = start; step <= end; step += 1) {
    const noteId = midiToSharpNote(step);
    keys[noteId] = { color, opacity: 54 };
  }
  if (keys[from]) keys[from].label = { text: labelText, fontSize: 11, verticalOffset: 8 };
  return { keys };
}
function mountRegisterLab(el) {
  const presets = [
    { id: "bass", label: "Registro de bajo", from: "C2", to: "C3", color: "#91e2af", summary: "La fundamental y el soporte grave se entienden mejor en esta región." },
    { id: "closed", label: "Posición cerrada", from: "C3", to: "C5", color: "#a5b4fc", summary: "La disposición cerrada suele ubicarse mejor en el registro medio." },
    { id: "spread", label: "Spread / Drop", from: "G2", to: "C5", color: "#f9a8d4", summary: "Un Spread abre el acorde, separa el bajo y despeja la textura." },
    { id: "guides", label: "Notas guía", from: "E3", to: "B4", color: "#facc15", summary: "La tercera y la séptima se localizan con claridad en el registro medio." }
  ];
  el.innerHTML = `<div class="theory-widget theory-widget-register">
    <div class="visual-controls">
      <label>Zona<select data-register-preset>${theorySelectOptions(presets, "bass", "id", "label")}</select></label>
    </div>
    <div class="visual-summary"><div><strong data-register-title></strong><div class="small-note" data-register-summary></div></div></div>
    <section class="visual-panel"><div class="diagram-label">Mapa de registro en el teclado</div><div data-register-diagram></div></section>
  </div>`;
  const select = el.querySelector("[data-register-preset]");
  const update = () => {
    const preset = presets.find(item => item.id === select.value) || presets[0];
    el.querySelector("[data-register-title]").textContent = preset.label;
    el.querySelector("[data-register-summary]").textContent = preset.summary;
    el.querySelector("[data-register-diagram]").innerHTML = renderPianoDiagram(registerRangeDiagram(preset.from, preset.to, preset.color, preset.label));
  };
  select.addEventListener("change", update);
  update();
}
function shellFormula(symbol) {
  const map = {
    "maj7": ["1","3","7"],
    "-7": ["1","b3","b7"],
    "7": ["1","3","b7"],
    "6": ["1","3","6"],
    "-6": ["1","b3","6"],
    "sus4": ["1","4","b7"]
  };
  return map[symbol] || map["maj7"];
}
function buildShellDiagram(rootName, symbol) {
  const tokens = shellFormula(symbol);
  const keys = {};
  const bassStep = theoryRootMidi(rootName, 2);
  const upperStep = theoryRootMidi(rootName, 3);
  keys[midiToSharpNote(bassStep)] = { color: "#d4a84f", opacity: 100, label: { text: theoryRootUnicode(rootName), fontSize: 11, verticalOffset: 8 } };
  tokens.slice(1).forEach(token => {
    const tone = spellTheoryTone(rootName, token);
    keys[midiToSharpNote(upperStep + tone.semi)] = {
      color: "#91e2af",
      opacity: 92,
      label: { text: `${tone.name}`, fontSize: 11, verticalOffset: 10 }
    };
  });
  return { keys };
}
function mountShellLab(el) {
  const qualities = [
    { value: "maj7", label: "maj7" }, { value: "-7", label: "-7" }, { value: "7", label: "7" },
    { value: "6", label: "6" }, { value: "-6", label: "-6" }, { value: "sus4", label: "sus4" }
  ];
  el.innerHTML = `<div class="theory-widget theory-widget-shell">
    <div class="visual-controls">
      <label>Fundamental<select data-shell-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Tipo<select data-shell-type>${theorySelectOptions(qualities, "maj7")}</select></label>
    </div>
    <div class="visual-summary">
      <div><strong data-shell-name></strong><div class="small-note">La fundamental queda abajo; las notas guía se ubican en el registro medio.</div></div>
      <div class="visual-pill-row" data-shell-notes></div>
    </div>
    <section class="visual-panel"><div class="diagram-label">Shell sugerido</div><div data-shell-diagram></div></section>
  </div>`;
  const rootSel = el.querySelector("[data-shell-root]");
  const typeSel = el.querySelector("[data-shell-type]");
  const update = () => {
    const tokens = shellFormula(typeSel.value);
    const tones = buildTheoryTones(rootSel.value, tokens);
    el.querySelector("[data-shell-name]").textContent = `${theoryRootUnicode(rootSel.value)}${typeSel.value}`;
    el.querySelector("[data-shell-notes]").innerHTML = tones.map(tone => `<span class="visual-pill">${escapeHtml(tone.name)} <small>${escapeHtml(tone.token.replace(/b/g, "♭").replace(/#/g, "♯"))}</small></span>`).join("");
    el.querySelector("[data-shell-diagram]").innerHTML = renderPianoDiagram(buildShellDiagram(rootSel.value, typeSel.value));
  };
  rootSel.addEventListener("change", update);
  typeSel.addEventListener("change", update);
  update();
}
function closedAndDrop2(rootName, symbol) {
  const formula = THEORY_VISUAL_CHORD_FORMULAS[symbol] || THEORY_VISUAL_CHORD_FORMULAS["maj7"];
  const tones = buildTheoryTones(rootName, formula.split(/\s+/));
  const base = theoryRootMidi(rootName, 4);
  const closed = tones.map(tone => ({ tone, step: base + tone.semi }));
  const sorted = closed.slice().sort((a, b) => a.step - b.step);
  const drop = sorted.map(item => ({ ...item }));
  if (drop.length >= 2) drop[drop.length - 2].step -= 12;
  return { closed: sorted, drop: drop.sort((a, b) => a.step - b.step) };
}
function diagramFromAbsoluteNotes(notes, color) {
  const keys = {};
  notes.forEach(item => {
    keys[midiToSharpNote(item.step)] = {
      color: item.tone.isRoot ? "#d4a84f" : color,
      opacity: item.tone.isRoot ? 100 : 90,
      label: { text: item.tone.name, fontSize: 11, verticalOffset: 8 }
    };
  });
  return { keys };
}
function mountDrop2Lab(el) {
  const chordChoices = [
    { value: "maj7", label: "maj7" },
    { value: "-7", label: "-7" },
    { value: "7", label: "7" },
    { value: "maj9", label: "maj9" }
  ];
  el.innerHTML = `<div class="theory-widget theory-widget-drop2">
    <div class="visual-controls">
      <label>Fundamental<select data-drop-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Acorde<select data-drop-type>${theorySelectOptions(chordChoices, "maj7")}</select></label>
    </div>
    <div class="visual-summary"><div><strong data-drop-name></strong><div class="small-note">La segunda voz superior baja una octava para abrir el acorde.</div></div></div>
    <div class="visual-panel-grid visual-panel-grid-2">
      <section class="visual-panel"><div class="diagram-label">Posición cerrada</div><div data-drop-closed></div></section>
      <section class="visual-panel"><div class="diagram-label">Skip 2 / Drop 2</div><div data-drop-open></div></section>
    </div>
  </div>`;
  const rootSel = el.querySelector("[data-drop-root]");
  const typeSel = el.querySelector("[data-drop-type]");
  const update = () => {
    const result = closedAndDrop2(rootSel.value, typeSel.value);
    el.querySelector("[data-drop-name]").textContent = `${theoryRootUnicode(rootSel.value)}${typeSel.value}`;
    el.querySelector("[data-drop-closed]").innerHTML = renderPianoDiagram(diagramFromAbsoluteNotes(result.closed, "#91e2af"));
    el.querySelector("[data-drop-open]").innerHTML = renderPianoDiagram(diagramFromAbsoluteNotes(result.drop, "#a5b4fc"));
  };
  rootSel.addEventListener("change", update);
  typeSel.addEventListener("change", update);
  update();
}
function voicingFormula(symbol) {
  const map = {
    "9": ["1","3","b7","9"],
    "-11": ["1","b3","b7","9","11"],
    "13": ["1","3","b7","9","13"],
    "13b9": ["1","3","b7","b9","13"],
    "13#11": ["1","3","b7","9","#11","13"]
  };
  return map[symbol] || map["13"];
}
function buildVoicingPlacement(rootName, symbol) {
  const tones = buildTheoryTones(rootName, voicingFormula(symbol));
  const bass = theoryRootMidi(rootName, 2);
  const upper = theoryRootMidi(rootName, 3);
  const keys = {};
  keys[midiToSharpNote(bass)] = { color: "#d4a84f", opacity: 100, label: { text: theoryRootUnicode(rootName), fontSize: 11, verticalOffset: 8 } };
  tones.filter(tone => tone.token !== "1").forEach(tone => {
    const isGuide = ["3","b3","7","b7","6","4"].includes(tone.token);
    const step = upper + tone.semi;
    keys[midiToSharpNote(step)] = {
      color: isGuide ? "#91e2af" : "#a5b4fc",
      opacity: 92,
      label: { text: tone.name, fontSize: 11, verticalOffset: 10 }
    };
  });
  return { keys, tones };
}
function mountExtensionPlacementLab(el) {
  const choices = [
    { value: "9", label: "9" },
    { value: "-11", label: "-11" },
    { value: "13", label: "13" },
    { value: "13b9", label: "13(b9)" },
    { value: "13#11", label: "13(#11)" }
  ];
  el.innerHTML = `<div class="theory-widget theory-widget-extension">
    <div class="visual-controls">
      <label>Fundamental<select data-ext-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Color armónico<select data-ext-type>${theorySelectOptions(choices, "13")}</select></label>
    </div>
    <div class="visual-summary">
      <div><strong data-ext-name></strong><div class="small-note">Dorado = bajo · Verde = notas estructurales y guía · Lila = extensiones.</div></div>
      <div class="visual-pill-row" data-ext-notes></div>
    </div>
    <section class="visual-panel"><div class="diagram-label">Ubicación sugerida</div><div data-ext-diagram></div></section>
  </div>`;
  const rootSel = el.querySelector("[data-ext-root]");
  const typeSel = el.querySelector("[data-ext-type]");
  const update = () => {
    const result = buildVoicingPlacement(rootSel.value, typeSel.value);
    el.querySelector("[data-ext-name]").textContent = `${theoryRootUnicode(rootSel.value)}${typeSel.value}`;
    el.querySelector("[data-ext-notes]").innerHTML = result.tones.map(tone => `<span class="visual-pill">${escapeHtml(tone.name)} <small>${escapeHtml(tone.token.replace(/b/g, "♭").replace(/#/g, "♯"))}</small></span>`).join("");
    el.querySelector("[data-ext-diagram]").innerHTML = renderPianoDiagram(result);
  };
  rootSel.addEventListener("change", update);
  typeSel.addEventListener("change", update);
  update();
}
function buildConstructionData(rootName, symbol) {
  const formula = THEORY_VISUAL_CHORD_FORMULAS[symbol] || THEORY_VISUAL_CHORD_FORMULAS["maj9"];
  const tokens = formula.split(/\s+/);
  const triad = tokens.filter(token => ["1","b3","3","4","5","#5","b5","2"].includes(token));
  const support = tokens.filter(token => ["6","7","b7"].includes(token));
  const extensions = tokens.filter(token => ["9","b9","#9","11","#11","13","b13"].includes(token));
  return {
    symbol,
    triad: buildTheoryTones(rootName, triad),
    support: buildTheoryTones(rootName, support),
    extensions: buildTheoryTones(rootName, extensions)
  };
}
function buildConstructionDiagram(rootName, data) {
  const keys = {};
  const base = theoryRootMidi(rootName, 3);
  data.triad.forEach(tone => keys[midiToSharpNote(base + tone.semi)] = { color: tone.isRoot ? "#d4a84f" : "#91e2af", opacity: 92, label: { text: tone.name, fontSize: 11, verticalOffset: 8 } });
  data.support.forEach(tone => keys[midiToSharpNote(base + tone.semi)] = { color: "#a5b4fc", opacity: 92, label: { text: tone.name, fontSize: 11, verticalOffset: 8 } });
  data.extensions.forEach(tone => keys[midiToSharpNote(base + tone.semi)] = { color: "#f9a8d4", opacity: 92, label: { text: tone.name, fontSize: 11, verticalOffset: 8 } });
  return { keys };
}
function mountConstructionLab(el) {
  const choices = [
    { value: "maj9", label: "maj9" },
    { value: "9", label: "9" },
    { value: "-11", label: "-11" },
    { value: "13", label: "13" },
    { value: "maj9#11", label: "maj9(#11)" }
  ];
  el.innerHTML = `<div class="theory-widget theory-widget-construction">
    <div class="visual-controls">
      <label>Fundamental<select data-build-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Acorde<select data-build-type>${theorySelectOptions(choices, "maj9")}</select></label>
    </div>
    <div class="visual-summary">
      <div><strong data-build-name></strong><div class="small-note">Verde = triada · Lila = soporte · Rosa = extensiones.</div></div>
    </div>
    <div class="construction-steps" data-build-steps></div>
    <section class="visual-panel"><div class="diagram-label">Acorde completo por capas</div><div data-build-diagram></div></section>
  </div>`;
  const rootSel = el.querySelector("[data-build-root]");
  const typeSel = el.querySelector("[data-build-type]");
  const update = () => {
    const data = buildConstructionData(rootSel.value, typeSel.value);
    el.querySelector("[data-build-name]").textContent = `${theoryRootUnicode(rootSel.value)}${typeSel.value}`;
    const stepHtml = [
      { title: "1. Triada", notes: data.triad },
      { title: "2. Soporte", notes: data.support },
      { title: "3. Extensiones", notes: data.extensions }
    ].map(block => `<div class="construction-step">
      <h6>${block.title}</h6>
      <div class="visual-pill-row">${block.notes.length ? block.notes.map(tone => `<span class="visual-pill">${escapeHtml(tone.name)} <small>${escapeHtml(tone.token.replace(/b/g, "♭").replace(/#/g, "♯"))}</small></span>`).join("") : '<span class="small-note">No aplica</span>'}</div>
    </div>`).join("");
    el.querySelector("[data-build-steps]").innerHTML = stepHtml;
    el.querySelector("[data-build-diagram]").innerHTML = renderPianoDiagram(buildConstructionDiagram(rootSel.value, data));
  };
  rootSel.addEventListener("change", update);
  typeSel.addEventListener("change", update);
  update();
}
function buildBassChordVoicing(rootName, symbol) {
  const configs = {
    "maj7": { left: ["1"], right: ["3","7","9"] },
    "-7": { left: ["1"], right: ["b3","b7","9"] },
    "7": { left: ["1"], right: ["3","b7","13"] },
    "-11": { left: ["1","b7"], right: ["b3","9","11"] },
    "13": { left: ["1","b7"], right: ["3","9","13"] }
  };
  const config = configs[symbol] || configs["maj7"];
  const keysLeft = {};
  const keysRight = {};
  const leftBase = theoryRootMidi(rootName, 2);
  const rightBase = theoryRootMidi(rootName, 3);
  buildTheoryTones(rootName, config.left).forEach(tone => {
    keysLeft[midiToSharpNote(leftBase + tone.semi)] = { color: tone.isRoot ? "#d4a84f" : "#91e2af", opacity: 96, label: { text: tone.name, fontSize: 11, verticalOffset: 8 } };
  });
  buildTheoryTones(rootName, config.right).forEach(tone => {
    keysRight[midiToSharpNote(rightBase + tone.semi)] = { color: "#a5b4fc", opacity: 96, label: { text: tone.name, fontSize: 11, verticalOffset: 8 } };
  });
  return { left: { keys: keysLeft }, right: { keys: keysRight }, leftTokens: config.left, rightTokens: config.right };
}
function mountBassChordLab(el) {
  const choices = [
    { value: "maj7", label: "maj7" },
    { value: "-7", label: "-7" },
    { value: "7", label: "7" },
    { value: "-11", label: "-11" },
    { value: "13", label: "13" }
  ];
  el.innerHTML = `<div class="theory-widget theory-widget-basschord">
    <div class="visual-controls">
      <label>Fundamental<select data-bc-root>${theorySelectOptions(THEORY_VISUAL_ROOTS, "C")}</select></label>
      <label>Modelo<select data-bc-type>${theorySelectOptions(choices, "maj7")}</select></label>
    </div>
    <div class="visual-summary">
      <div><strong data-bc-name></strong><div class="small-note">Una guía práctica: izquierda = base / soporte grave · derecha = estructura media y color.</div></div>
      <div class="visual-pill-row" data-bc-legend></div>
    </div>
    <div class="visual-panel-grid visual-panel-grid-2">
      <section class="visual-panel"><div class="diagram-label">Mano izquierda / bajo</div><div data-bc-left></div></section>
      <section class="visual-panel"><div class="diagram-label">Mano derecha / acorde</div><div data-bc-right></div></section>
    </div>
  </div>`;
  const rootSel = el.querySelector("[data-bc-root]");
  const typeSel = el.querySelector("[data-bc-type]");
  const update = () => {
    const result = buildBassChordVoicing(rootSel.value, typeSel.value);
    el.querySelector("[data-bc-name]").textContent = `${theoryRootUnicode(rootSel.value)}${typeSel.value}`;
    el.querySelector("[data-bc-legend]").innerHTML = result.leftTokens.map(token => spellTheoryTone(rootSel.value, token)).concat(result.rightTokens.map(token => spellTheoryTone(rootSel.value, token))).map(tone => `<span class="visual-pill">${escapeHtml(tone.name)} <small>${escapeHtml(tone.token.replace(/b/g, "♭").replace(/#/g, "♯"))}</small></span>`).join("");
    el.querySelector("[data-bc-left]").innerHTML = renderPianoDiagram(result.left);
    el.querySelector("[data-bc-right]").innerHTML = renderPianoDiagram(result.right);
  };
  rootSel.addEventListener("change", update);
  typeSel.addEventListener("change", update);
  update();
}



/* ============================ FASE 8 · AUDIO + PRÁCTICA ============================ */

const THEORY_AUDIO_STATE = {
  context: null,
  activeNodes: [],
  sequenceToken: 0
};

const TOPIC_PRACTICE_BANK = {
  "escalas-intervalos": [
    {
      prompt: "¿Qué patrón interválico describe la escala mayor natural?",
      choices: ["T–T–S–T–T–T–S", "T–S–T–T–S–T–T", "S–T–T–S–T–T–T"],
      answer: 0,
      explain: "La escala mayor natural sigue T–T–S–T–T–T–S."
    },
    {
      prompt: "¿Cuántos semitonos tiene una 3 mayor?",
      choices: ["3", "4", "5"],
      answer: 1,
      explain: "Una tercera mayor equivale a 4 semitonos."
    }
  ],
  "consonancias-disonancias": [
    {
      prompt: "Según la clasificación usada en este curso, ¿qué intervalo se considera disonancia fuerte?",
      choices: ["3 mayor", "2 menor", "5 justa"],
      answer: 1,
      explain: "La 2 menor se clasifica aquí como disonancia fuerte."
    }
  ],
  "acordes": [
    {
      prompt: "¿Cuál es la estructura básica de una tríada mayor?",
      choices: ["1–3–5", "1–♭3–5", "1–3–♭5"],
      answer: 0,
      explain: "La tríada mayor contiene fundamental, tercera mayor y quinta justa."
    }
  ],
  "enlace-voces": [
    {
      prompt: "¿Qué notas suelen funcionar como notas guía en un acorde con séptima?",
      choices: ["Fundamental y quinta", "Tercera y séptima", "Novena y treceava"],
      answer: 1,
      explain: "La tercera y la séptima son las notas guía más características."
    }
  ],
  "tonalidad": [
    {
      prompt: "En el esquema funcional del curso, ¿qué grado representa con mayor claridad la función dominante?",
      choices: ["I", "IV", "V7"],
      answer: 2,
      explain: "V7 concentra la función dominante y su tendencia de resolución."
    }
  ],
  "rearmonizacion": [
    {
      prompt: "En una rearmonización funcional simple, ¿qué principio se aplica primero?",
      choices: ["Sustituir por cualquier acorde cromático", "Sustituir por acordes de función equivalente", "Eliminar la melodía"],
      answer: 1,
      explain: "El punto de partida del método es sustituir acordes por otros de función equivalente."
    }
  ],
  "nivel-2-referencia-intervalica": [
    {
      prompt: "¿Qué intervalo corresponde al grado 6 de la escala mayor natural?",
      choices: ["6 menor", "6 mayor", "5 aumentada"],
      answer: 1,
      explain: "El sexto grado de la escala mayor está a una sexta mayor de la tónica."
    }
  ],
  "nivel-2-sistema-americano-cifrado": [
    {
      prompt: "En el cifrado usado en este curso, ¿qué símbolo representa un acorde menor?",
      choices: ["-", "+", "°"],
      answer: 0,
      explain: "El signo - se usa para indicar acorde menor."
    }
  ],
  "nivel-2-triadas": [
    {
      prompt: "¿Qué fórmula corresponde a una tríada disminuida?",
      choices: ["1–♭3–♭5", "1–3–♯5", "1–4–5"],
      answer: 0,
      explain: "La tríada disminuida se construye 1–♭3–♭5."
    }
  ],
  "nivel-2-soportes": [
    {
      prompt: "¿Qué elemento se considera soporte de un acorde en este curso?",
      choices: ["La 6 o la 7", "Solo la 5", "Solo la 9"],
      answer: 0,
      explain: "El soporte corresponde a la sexta o la séptima."
    }
  ],
  "nivel-2-septimas": [
    {
      prompt: "¿Qué fórmula corresponde a un acorde dominante 7?",
      choices: ["1–3–5–7", "1–3–5–♭7", "1–♭3–5–♭7"],
      answer: 1,
      explain: "El dominante 7 combina tríada mayor con séptima menor."
    }
  ],
  "nivel-2-reglas-extensiones": [
    {
      prompt: "En el método del curso, ¿qué extensión se asocia principalmente a acordes con tercera mayor?",
      choices: ["11 justa", "♯11", "♭13 exclusivamente"],
      answer: 1,
      explain: "La ♯11 se asocia principalmente a acordes con tercera mayor."
    }
  ],
  "nivel-2-novenas": [
    {
      prompt: "¿Qué intervalo representa una novena mayor?",
      choices: ["14 semitonos desde la fundamental", "12 semitonos", "10 semitonos"],
      answer: 0,
      explain: "La novena mayor es una segunda mayor compuesta: 14 semitonos."
    }
  ],
  "nivel-2-onceavas": [
    {
      prompt: "¿Qué grado simple corresponde a la 11?",
      choices: ["La 4", "La 3", "La 6"],
      answer: 0,
      explain: "La onceava corresponde a la cuarta extendida una octava."
    }
  ],
  "nivel-2-treceavas": [
    {
      prompt: "¿Qué grado simple corresponde a la 13?",
      choices: ["La 5", "La 6", "La 7"],
      answer: 1,
      explain: "La treceava corresponde a la sexta extendida una octava."
    }
  ],
  "nivel-2-omision-notas": [
    {
      prompt: "En un voicing extendido, ¿qué nota suele ser más prescindible que la tercera o la séptima?",
      choices: ["La quinta justa", "La tercera", "La séptima"],
      answer: 0,
      explain: "La quinta justa suele omitirse con mayor facilidad cuando la textura necesita espacio."
    }
  ],
  "nivel-2-aplicacion": [
    {
      prompt: "¿Qué conviene comprobar primero al construir un acorde extendido?",
      choices: ["La estructura básica", "El tempo", "La dinámica"],
      answer: 0,
      explain: "La construcción parte de la estructura antes de añadir soporte y extensiones."
    }
  ],
  "nivel-2-sintesis-reglas": [
    {
      prompt: "¿Cuál es el orden conceptual del método?",
      choices: ["Estructura → soporte → superestructura", "Superestructura → estructura → soporte", "Soporte → ritmo → estructura"],
      answer: 0,
      explain: "El curso organiza el acorde como estructura, soporte y superestructura."
    }
  ],
  "nivel-3-registros-zonas": [
    {
      prompt: "¿Dónde conviene ubicar normalmente las extensiones?",
      choices: ["En el registro agudo o medio", "Siempre debajo del bajo", "Solo en C2–C3"],
      answer: 0,
      explain: "El curso favorece extensiones en registro medio/agudo para conservar claridad."
    }
  ],
  "nivel-3-shell-voicings": [
    {
      prompt: "¿Qué información mínima suele conservar un shell de séptima?",
      choices: ["3 y 7", "1 y 5", "5 y 9"],
      answer: 0,
      explain: "La tercera y la séptima definen con claridad la cualidad y función."
    }
  ],
  "nivel-3-posicion-cerrada-skip-2": [
    {
      prompt: "En una transformación tipo Drop 2, ¿qué voz se baja una octava?",
      choices: ["La segunda voz desde arriba", "La voz más grave", "La voz superior"],
      answer: 0,
      explain: "Drop 2 baja una octava la segunda voz contando desde arriba."
    }
  ],
  "nivel-3-registro-grave-extensiones": [
    {
      prompt: "¿Por qué se evitan demasiadas notas cerradas en el grave?",
      choices: ["Para reducir turbidez y mejorar claridad", "Porque no existen allí", "Porque cambian de nombre"],
      answer: 0,
      explain: "Abrir el registro grave ayuda a evitar acumulación y pérdida de definición."
    }
  ],
  "nivel-3-construccion-acordes-extendidos": [
    {
      prompt: "¿Qué se añade después de establecer triada y soporte?",
      choices: ["Extensiones", "Otra fundamental obligatoria", "Una nueva tonalidad"],
      answer: 0,
      explain: "Las extensiones se añaden después de definir estructura y soporte."
    }
  ],
  "nivel-3-acompanamiento-bajo-acorde": [
    {
      prompt: "En un modelo bajo/acorde, ¿qué función cumple normalmente la mano izquierda?",
      choices: ["Base grave o soporte", "Solo extensiones", "Solo melodía"],
      answer: 0,
      explain: "La mano izquierda sostiene la base grave; la derecha organiza las voces superiores."
    }
  ]
};

function renderTopicPractice(section) {
  const bank = TOPIC_PRACTICE_BANK[section.id] || [];
  if (!bank.length) return "";
  return `<section class="topic-practice panel" data-topic-practice="${escapeAttr(section.id)}">
    <header class="topic-practice-head">
      <div>
        <p class="kicker">Comprueba lo aprendido</p>
        <h4>Desafío rápido</h4>
        <p>Una pregunta breve antes de marcar el tema como estudiado.</p>
      </div>
      <span class="practice-score" data-practice-score>0/${bank.length}</span>
    </header>
    <div class="practice-question" data-practice-question></div>
    <div class="practice-feedback" data-practice-feedback aria-live="polite"></div>
    <div class="practice-actions">
      <button type="button" class="ghost-btn" data-practice-next>Siguiente pregunta</button>
      <button type="button" class="soft-btn" data-practice-reset>Reiniciar</button>
    </div>
  </section>`;
}

function mountTopicPractices() {
  document.querySelectorAll("[data-topic-practice]").forEach(root => {
    const topicId = root.dataset.topicPractice;
    const bank = TOPIC_PRACTICE_BANK[topicId] || [];
    if (!bank.length) return;
    let index = 0;
    let correct = 0;
    let answered = false;
    const scoreEl = root.querySelector("[data-practice-score]");
    const questionEl = root.querySelector("[data-practice-question]");
    const feedbackEl = root.querySelector("[data-practice-feedback]");
    const nextBtn = root.querySelector("[data-practice-next]");
    const resetBtn = root.querySelector("[data-practice-reset]");

    function render() {
      const q = bank[index];
      answered = false;
      feedbackEl.textContent = "";
      questionEl.innerHTML = `<p class="practice-prompt">${escapeHtml(q.prompt)}</p>
        <div class="practice-options">
          ${q.choices.map((choice, choiceIndex) => `<button type="button" class="practice-option" data-practice-choice="${choiceIndex}">${escapeHtml(choice)}</button>`).join("")}
        </div>`;
      questionEl.querySelectorAll("[data-practice-choice]").forEach(btn => {
        btn.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const picked = Number(btn.dataset.practiceChoice);
          const isCorrect = picked === q.answer;
          if (isCorrect) correct += 1;
          questionEl.querySelectorAll("[data-practice-choice]").forEach(option => {
            option.disabled = true;
            const value = Number(option.dataset.practiceChoice);
            if (value === q.answer) option.classList.add("correct");
            else if (value === picked) option.classList.add("wrong");
          });
          feedbackEl.textContent = `${isCorrect ? "Correcto. " : "Revisa: "}${q.explain}`;
          scoreEl.textContent = `${correct}/${bank.length}`;
        });
      });
      nextBtn.disabled = bank.length <= 1;
    }
    nextBtn.addEventListener("click", () => {
      index = (index + 1) % bank.length;
      render();
    });
    resetBtn.addEventListener("click", () => {
      index = 0;
      correct = 0;
      scoreEl.textContent = `0/${bank.length}`;
      render();
    });
    render();
  });
}

function ensureTheoryAudioContext() {
  if (!THEORY_AUDIO_STATE.context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    THEORY_AUDIO_STATE.context = new AudioContextClass();
  }
  if (THEORY_AUDIO_STATE.context.state === "suspended") THEORY_AUDIO_STATE.context.resume();
  return THEORY_AUDIO_STATE.context;
}
function stopTheoryAudio() {
  THEORY_AUDIO_STATE.sequenceToken += 1;
  THEORY_AUDIO_STATE.activeNodes.forEach(node => {
    try { node.stop(); } catch (error) {}
    try { node.disconnect(); } catch (error) {}
  });
  THEORY_AUDIO_STATE.activeNodes = [];
}
function midiFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function playTheoryMidi(midi, options = {}) {
  const ctx = ensureTheoryAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime + (Number(options.delay) || 0);
  const duration = Math.max(.08, Number(options.duration) || .55);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = options.type || "triangle";
  osc.frequency.setValueAtTime(midiFrequency(midi), now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Number(options.volume) || 0.18, now + .018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + .03);
  THEORY_AUDIO_STATE.activeNodes.push(osc);
  osc.addEventListener("ended", () => {
    THEORY_AUDIO_STATE.activeNodes = THEORY_AUDIO_STATE.activeNodes.filter(item => item !== osc);
    try { osc.disconnect(); gain.disconnect(); } catch (error) {}
  });
}
function playTheoryChord(midis, options = {}) {
  stopTheoryAudio();
  midis.forEach((midi, index) => playTheoryMidi(midi, {
    duration: options.duration || 1.05,
    volume: 0.105,
    type: index === 0 ? "triangle" : "sine"
  }));
}
async function playTheorySequence(midis, onStep, options = {}) {
  stopTheoryAudio();
  const token = THEORY_AUDIO_STATE.sequenceToken;
  const gap = Number(options.gap) || 420;
  for (let index = 0; index < midis.length; index += 1) {
    if (token !== THEORY_AUDIO_STATE.sequenceToken) return;
    onStep?.(index);
    playTheoryMidi(midis[index], { duration: Math.min(.7, gap / 1000 * .88), volume: .15 });
    await new Promise(resolve => setTimeout(resolve, gap));
  }
  onStep?.(-1);
}
function theoryToneMidis(rootName, tones, baseOctave = 4) {
  const rootMidi = theoryRootMidi(rootName, baseOctave);
  return tones.map(tone => rootMidi + tone.semi);
}
function addAudioControls(container, config) {
  if (!container || container.querySelector("[data-audio-controls]")) return;
  const bar = document.createElement("div");
  bar.className = "visual-audio-controls";
  bar.dataset.audioControls = "true";
  if (config.sequence) {
    const seq = document.createElement("button");
    seq.type = "button";
    seq.className = "ghost-btn compact-btn";
    seq.textContent = config.sequenceLabel || "▶ Escuchar ascendente";
    seq.addEventListener("click", config.sequence);
    bar.appendChild(seq);
  }
  if (config.chord) {
    const chord = document.createElement("button");
    chord.type = "button";
    chord.className = "ghost-btn compact-btn";
    chord.textContent = config.chordLabel || "▶ Escuchar simultáneo";
    chord.addEventListener("click", config.chord);
    bar.appendChild(chord);
  }
  const stop = document.createElement("button");
  stop.type = "button";
  stop.className = "soft-btn compact-btn";
  stop.textContent = "■ Detener";
  stop.addEventListener("click", stopTheoryAudio);
  bar.appendChild(stop);
  container.prepend(bar);
}

function currentScaleSelection(el) {
  const rootName = el.querySelector("[data-scale-root]")?.value || "C";
  const typeId = el.querySelector("[data-scale-type]")?.value || "major";
  const scale = THEORY_VISUAL_SCALE_LIBRARY.find(item => item.id === typeId) || THEORY_VISUAL_SCALE_LIBRARY[0];
  const tones = buildTheoryTones(rootName, scale.tokens);
  return { rootName, scale, tones };
}
function addScaleAudio(el) {
  const host = el.querySelector(".theory-widget-scale");
  if (!host) return;
  addAudioControls(host, {
    sequenceLabel: "▶ Escuchar escala",
    sequence: () => {
      const { rootName, tones } = currentScaleSelection(el);
      const midis = theoryToneMidis(rootName, tones, 4);
      const pills = [...el.querySelectorAll("[data-scale-notes] .visual-pill")];
      playTheorySequence(midis, index => {
        pills.forEach((pill, i) => pill.classList.toggle("audio-active", i === index));
      }, { gap: 360 });
    },
    chordLabel: "▶ Escuchar notas juntas",
    chord: () => {
      const { rootName, tones } = currentScaleSelection(el);
      playTheoryChord(theoryToneMidis(rootName, tones.slice(0, -1), 4), { duration: 1.1 });
    }
  });
}
function currentIntervalSelection(el) {
  const rootName = el.querySelector("[data-interval-root]")?.value || "C";
  const intervalId = el.querySelector("[data-interval-type]")?.value || "M3";
  const interval = THEORY_VISUAL_INTERVALS.find(item => item.id === intervalId) || THEORY_VISUAL_INTERVALS[0];
  return { rootName, interval };
}
function addIntervalAudio(el) {
  const host = el.querySelector(".theory-widget-interval");
  if (!host) return;
  addAudioControls(host, {
    sequenceLabel: "▶ Escuchar melódico",
    sequence: () => {
      const { rootName, interval } = currentIntervalSelection(el);
      const base = theoryRootMidi(rootName, 4);
      playTheorySequence([base, base + interval.semitones], () => {}, { gap: 520 });
    },
    chordLabel: "▶ Escuchar armónico",
    chord: () => {
      const { rootName, interval } = currentIntervalSelection(el);
      const base = theoryRootMidi(rootName, 4);
      playTheoryChord([base, base + interval.semitones], { duration: 1.05 });
    }
  });
}
function chordExplorerCurrentTones(mountPoint) {
  const rootSel = mountPoint.querySelector('[data-cx="root"]');
  const typeSel = mountPoint.querySelector('[data-cx="type"]');
  const rootName = ChordRef.ROOTS[Number(rootSel?.value || 0)] || "C";
  const type = ChordRef.CHORD_TYPES[Number(typeSel?.value || 0)] || ChordRef.CHORD_TYPES[0];
  const root = ChordRef.rootInfo(rootName);
  const tones = ChordRef.chordTones(root, type.formula);
  return { rootName, root, type, tones };
}
function chordTonesToMidis(rootName, tones) {
  const asciiRoot = String(rootName).replace(/♭/g, "b").replace(/♯/g, "#");
  const rootMidi = theoryRootMidi(asciiRoot, 4);
  return tones.map(tone => rootMidi + tone.semi);
}
function addChordExplorerAudio(mountPoint) {
  const host = mountPoint.querySelector(".chord-explorer");
  if (!host) return;
  addAudioControls(host, {
    sequenceLabel: "▶ Arpegiar",
    sequence: () => {
      const current = chordExplorerCurrentTones(mountPoint);
      playTheorySequence(chordTonesToMidis(current.rootName, current.tones), () => {}, { gap: 340 });
    },
    chordLabel: "▶ Escuchar acorde",
    chord: () => {
      const current = chordExplorerCurrentTones(mountPoint);
      playTheoryChord(chordTonesToMidis(current.rootName, current.tones), { duration: 1.15 });
    }
  });
}
function addGenericPianoAudio(container, getNotes, config = {}) {
  addAudioControls(container, {
    sequenceLabel: config.sequenceLabel || "▶ Arpegiar",
    sequence: () => playTheorySequence(getNotes(), () => {}, { gap: config.gap || 340 }),
    chordLabel: config.chordLabel || "▶ Escuchar simultáneo",
    chord: () => playTheoryChord(getNotes(), { duration: 1.1 })
  });
}

/* Decoradores Fase 8 sobre los widgets de Fase 7 */
const _mountScaleExplorerPhase7 = mountScaleExplorer;
mountScaleExplorer = function(el, options) {
  _mountScaleExplorerPhase7(el, options);
  addScaleAudio(el);
};

const _mountIntervalExplorerPhase7 = mountIntervalExplorer;
mountIntervalExplorer = function(el, options) {
  _mountIntervalExplorerPhase7(el, options);
  addIntervalAudio(el);
};

const _mountChordExplorerLabPhase7 = mountChordExplorerLab;
mountChordExplorerLab = function(el, options) {
  _mountChordExplorerLabPhase7(el, options);
  addChordExplorerAudio(el);
};

const _mountTonalityLabPhase7 = mountTonalityLab;
mountTonalityLab = function(el, options) {
  _mountTonalityLabPhase7(el, options);
  const host = el.querySelector(".theory-widget-tonality");
  addAudioControls(host, {
    sequenceLabel: "▶ Escuchar escala tonal",
    sequence: () => {
      const rootName = el.querySelector("[data-key-root]")?.value || "C";
      const isMinor = el.querySelector("[data-key-mode]")?.value === "minor";
      const scale = THEORY_VISUAL_SCALE_LIBRARY.find(item => item.id === (isMinor ? "minor-natural" : "major"));
      const tones = buildTheoryTones(rootName, scale.tokens);
      playTheorySequence(theoryToneMidis(rootName, tones, 4), () => {}, { gap: 360 });
    }
  });
};

const _mountReharmLabPhase7 = mountReharmLab;
mountReharmLab = function(el, options) {
  _mountReharmLabPhase7(el, options);
  const host = el.querySelector(".theory-widget-reharm");
  addAudioControls(host, {
    sequenceLabel: "▶ Escuchar progresión",
    sequence: async () => {
      stopTheoryAudio();
      const token = THEORY_AUDIO_STATE.sequenceToken;
      const rootName = el.querySelector("[data-reharm-root]")?.value || "C";
      const scale = buildTheoryTones(rootName, THEORY_VISUAL_SCALE_LIBRARY.find(item => item.id === "major").tokens).slice(0, 7);
      const slots = [
        el.querySelector("[data-slot-t1]")?.value || "I",
        el.querySelector("[data-slot-t2]")?.value || "vi",
        el.querySelector("[data-slot-s]")?.value || "ii",
        el.querySelector("[data-slot-d]")?.value || "V",
        "I"
      ];
      for (const roman of slots) {
        if (token !== THEORY_AUDIO_STATE.sequenceToken) return;
        const item = THEORY_VISUAL_ROMAN_QUALITIES_MAJOR.find(entry => entry.roman === roman) || THEORY_VISUAL_ROMAN_QUALITIES_MAJOR[0];
        const chordRoot = scale[item.degree - 1]?.name || "C";
        const suffixMap = { "maj7":"maj7", "-7":"-7", "7":"7", "m7♭5":"-7b5" };
        const type = ChordRef.CHORD_TYPES.find(entry => entry.symbol === (suffixMap[item.suffix] || ""));
        if (type) {
          const root = ChordRef.rootInfo(chordRoot);
          const tones = ChordRef.chordTones(root, type.formula);
          playTheoryChord(chordTonesToMidis(chordRoot, tones), { duration: .72 });
        }
        await new Promise(resolve => setTimeout(resolve, 760));
      }
    }
  });
};

const _mountRegisterLabPhase7 = mountRegisterLab;
mountRegisterLab = function(el, options) {
  _mountRegisterLabPhase7(el, options);
  const host = el.querySelector(".theory-widget-register");
  addAudioControls(host, {
    sequenceLabel: "▶ Escuchar zona",
    sequence: () => {
      const preset = el.querySelector("[data-register-preset]")?.value || "bass";
      const ranges = { bass:["C2","C3"], closed:["C3","C5"], spread:["G2","C5"], guides:["E3","B4"] };
      const [from, to] = ranges[preset] || ranges.bass;
      const start = noteStep(from), end = noteStep(to);
      const midis = [];
      for (let step = start; step <= end; step += 4) midis.push(step);
      playTheorySequence(midis, () => {}, { gap: 230 });
    }
  });
};

const _mountShellLabPhase7 = mountShellLab;
mountShellLab = function(el, options) {
  _mountShellLabPhase7(el, options);
  const host = el.querySelector(".theory-widget-shell");
  addGenericPianoAudio(host, () => {
    const rootName = el.querySelector("[data-shell-root]")?.value || "C";
    const symbol = el.querySelector("[data-shell-type]")?.value || "maj7";
    const tokens = shellFormula(symbol);
    const base = theoryRootMidi(rootName, 3);
    return tokens.map(token => base + spellTheoryTone(rootName, token).semi);
  });
};

const _mountDrop2LabPhase7 = mountDrop2Lab;
mountDrop2Lab = function(el, options) {
  _mountDrop2LabPhase7(el, options);
  const host = el.querySelector(".theory-widget-drop2");
  addAudioControls(host, {
    sequenceLabel: "▶ Cerrada",
    sequence: () => {
      const result = closedAndDrop2(
        el.querySelector("[data-drop-root]")?.value || "C",
        el.querySelector("[data-drop-type]")?.value || "maj7"
      );
      playTheoryChord(result.closed.map(item => item.step), { duration: 1.05 });
    },
    chordLabel: "▶ Skip 2 / Drop 2",
    chord: () => {
      const result = closedAndDrop2(
        el.querySelector("[data-drop-root]")?.value || "C",
        el.querySelector("[data-drop-type]")?.value || "maj7"
      );
      playTheoryChord(result.drop.map(item => item.step), { duration: 1.05 });
    }
  });
};

const _mountExtensionPlacementLabPhase7 = mountExtensionPlacementLab;
mountExtensionPlacementLab = function(el, options) {
  _mountExtensionPlacementLabPhase7(el, options);
  const host = el.querySelector(".theory-widget-extension");
  addGenericPianoAudio(host, () => {
    const rootName = el.querySelector("[data-ext-root]")?.value || "C";
    const type = el.querySelector("[data-ext-type]")?.value || "13";
    const tones = buildTheoryTones(rootName, voicingFormula(type));
    return theoryToneMidis(rootName, tones, 3);
  });
};

const _mountConstructionLabPhase7 = mountConstructionLab;
mountConstructionLab = function(el, options) {
  _mountConstructionLabPhase7(el, options);
  const host = el.querySelector(".theory-widget-construction");
  const controls = document.createElement("div");
  controls.className = "construction-animation-controls";
  controls.innerHTML = `<button type="button" class="primary-btn compact-btn" data-build-play>▶ Construir paso a paso</button>
    <button type="button" class="soft-btn compact-btn" data-build-reset>Reiniciar vista</button>`;
  host.insertBefore(controls, host.querySelector(".construction-steps"));
  const diagram = el.querySelector("[data-build-diagram]");

  function currentData() {
    const rootName = el.querySelector("[data-build-root]")?.value || "C";
    const type = el.querySelector("[data-build-type]")?.value || "maj9";
    return { rootName, data: buildConstructionData(rootName, type) };
  }
  function showStage(stage) {
    const { rootName, data } = currentData();
    const staged = {
      symbol: data.symbol,
      triad: data.triad,
      support: stage >= 2 ? data.support : [],
      extensions: stage >= 3 ? data.extensions : []
    };
    diagram.innerHTML = renderPianoDiagram(buildConstructionDiagram(rootName, staged));
    const steps = [...el.querySelectorAll(".construction-step")];
    steps.forEach((step, index) => step.classList.toggle("build-active", index + 1 === stage));
  }
  controls.querySelector("[data-build-play]").addEventListener("click", async () => {
    stopTheoryAudio();
    for (let stage = 1; stage <= 3; stage += 1) {
      showStage(stage);
      const { rootName, data } = currentData();
      const groups = stage === 1 ? data.triad : stage === 2 ? data.triad.concat(data.support) : data.triad.concat(data.support, data.extensions);
      playTheoryChord(theoryToneMidis(rootName, groups, 4), { duration: .65 });
      await new Promise(resolve => setTimeout(resolve, 850));
    }
    el.querySelectorAll(".construction-step").forEach(step => step.classList.remove("build-active"));
  });
  controls.querySelector("[data-build-reset]").addEventListener("click", () => {
    const { rootName, data } = currentData();
    diagram.innerHTML = renderPianoDiagram(buildConstructionDiagram(rootName, data));
    el.querySelectorAll(".construction-step").forEach(step => step.classList.remove("build-active"));
  });
  addGenericPianoAudio(host, () => {
    const { rootName, data } = currentData();
    return theoryToneMidis(rootName, data.triad.concat(data.support, data.extensions), 4);
  }, { sequenceLabel: "▶ Arpegiar acorde" });
};

const _mountBassChordLabPhase7 = mountBassChordLab;
mountBassChordLab = function(el, options) {
  _mountBassChordLabPhase7(el, options);
  const host = el.querySelector(".theory-widget-basschord");
  addAudioControls(host, {
    sequenceLabel: "▶ Escuchar izquierda",
    sequence: () => {
      const rootName = el.querySelector("[data-bc-root]")?.value || "C";
      const type = el.querySelector("[data-bc-type]")?.value || "maj7";
      const data = buildBassChordVoicing(rootName, type);
      const midis = data.leftTokens.map(token => theoryRootMidi(rootName, 2) + spellTheoryTone(rootName, token).semi);
      playTheoryChord(midis, { duration: 1.05 });
    },
    chordLabel: "▶ Escuchar reparto completo",
    chord: () => {
      const rootName = el.querySelector("[data-bc-root]")?.value || "C";
      const type = el.querySelector("[data-bc-type]")?.value || "maj7";
      const data = buildBassChordVoicing(rootName, type);
      const left = data.leftTokens.map(token => theoryRootMidi(rootName, 2) + spellTheoryTone(rootName, token).semi);
      const right = data.rightTokens.map(token => theoryRootMidi(rootName, 3) + spellTheoryTone(rootName, token).semi);
      playTheoryChord(left.concat(right), { duration: 1.1 });
    }
  });
};


document.addEventListener("DOMContentLoaded", init);
