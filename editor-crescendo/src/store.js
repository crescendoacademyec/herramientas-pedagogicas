export const DURATION_OPTIONS = [
  { value: "whole", label: "Redonda", beats: 4 },
  { value: "half", label: "Blanca", beats: 2 },
  { value: "quarter", label: "Negra", beats: 1 },
  { value: "eighth", label: "Corchea", beats: 0.5 },
  { value: "sixteenth", label: "Semicorchea", beats: 0.25 },
];

export const createScore = () => ({
  id: crypto.randomUUID(),
  title: "Ejercicio sin título",
  description: "",
  tempo: 96,
  timeSignature: [4, 4],
  keySignature: "C",
  clef: "treble",
  composer: "",
  scenes: [],
  measures: Array.from({ length: 4 }, (_, index) => ({
    id: crypto.randomUUID(),
    number: index + 1,
    notes: [],
    textItems: [],
    chordSymbols: [],
    repeatStart: false,
    repeatEnd: false,
  })),
});

export const createInitialState = () => ({
  score: createScore(),
  tool: "select",
  duration: "quarter",
  cursor: { measure: 0, beat: 0 },
  selection: null,
  dirty: false,
  inspectorOpen: true,
  keyboardOpen: true,
  activePanel: "Escribir",
  midi: { available: false, connected: false, name: "Sin dispositivo MIDI" },
  playing: false,
  history: [],
  future: [],
  status: "Listo para escribir",
});

export const clone = (value) => structuredClone(value);

export const getDuration = (value) => DURATION_OPTIONS.find((item) => item.value === value) ?? DURATION_OPTIONS[2];

export const scoreBeats = (measure) => measure.notes.reduce((sum, note) => sum + getDuration(note.duration).beats, 0);

export const serialize = (state) => ({ score: state.score, savedAt: new Date().toISOString() });
