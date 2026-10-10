import { getDuration, scoreBeats } from "./store.js";

const STAFF_TOP = 86;
const STAFF_GAP = 13;
const MEASURE_WIDTH = 205;
const MEASURE_START = 98;
const NOTE_STEPS = { C: 10, D: 9, E: 8, F: 7, G: 6, A: 5, B: 4 };

const yForPitch = (pitch) => {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return STAFF_TOP + 2 * STAFF_GAP;
  const [, letter, , octave] = match;
  return STAFF_TOP + (NOTE_STEPS[letter] + (4 - Number(octave)) * 7) * (STAFF_GAP / 2);
};

const noteSvg = (note, x, selected) => {
  const y = yForPitch(note.pitch);
  if (note.rest) return `<g class="score-note ${selected ? "selected" : ""}" data-note-id="${note.id}"><path d="M ${x - 8} ${STAFF_TOP + 24} h 16 l -4 6 h -13 z" class="rest" /></g>`;
  const isWhole = note.duration === "whole";
  const isHalf = note.duration === "half";
  const fill = isWhole || isHalf ? "#fffaf1" : "#1c1d21";
  const stem = isWhole ? "" : `<line x1="${x + 6}" y1="${y}" x2="${x + 6}" y2="${y - 39}" class="stem" />`;
  const flag = note.duration === "eighth" || note.duration === "sixteenth"
    ? `<path d="M ${x + 6} ${y - 39} q 17 5 13 20" class="flag" />${note.duration === "sixteenth" ? `<path d="M ${x + 6} ${y - 30} q 17 5 13 20" class="flag" />` : ""}`
    : "";
  const accidental = note.pitch.includes("#") ? `<text x="${x - 18}" y="${y + 6}" class="accidental">♯</text>` : "";
  return `<g class="score-note ${selected ? "selected" : ""}" data-note-id="${note.id}">${accidental}<ellipse cx="${x}" cy="${y}" rx="8" ry="5.7" fill="${fill}" />${stem}${flag}</g>`;
};

export function renderScore(state) {
  const { measures } = state.score;
  const lines = Array.from({ length: 5 }, (_, line) => `<line x1="43" x2="${MEASURE_START + measures.length * MEASURE_WIDTH}" y1="${STAFF_TOP + line * STAFF_GAP}" y2="${STAFF_TOP + line * STAFF_GAP}" class="staff-line" />`).join("");
  const barlines = measures.map((measure, index) => {
    const x = MEASURE_START + index * MEASURE_WIDTH;
    const notes = measure.notes.map((note) => {
      const beat = note.beat;
      return noteSvg(note, x + 28 + (beat / 4) * (MEASURE_WIDTH - 40), state.selection === note.id);
    }).join("");
    const text = measure.textItems.map((item, textIndex) => `<text x="${x + 28}" y="${STAFF_TOP - 47 - textIndex * 17}" class="annotation">${escapeHtml(item.text)}</text>`).join("");
    const chords = measure.chordSymbols.map((item, chordIndex) => `<text x="${x + 28 + chordIndex * 42}" y="${STAFF_TOP - 27}" class="chord">${escapeHtml(item.text)}</text>`).join("");
    const repeatStart = measure.repeatStart ? `<line x1="${x + 5}" x2="${x + 5}" y1="${STAFF_TOP}" y2="${STAFF_TOP + 52}" class="repeat-line"/><circle cx="${x + 12}" cy="${STAFF_TOP + 19}" r="2.2"/><circle cx="${x + 12}" cy="${STAFF_TOP + 33}" r="2.2"/>` : "";
    const repeatEnd = measure.repeatEnd ? `<line x1="${x + MEASURE_WIDTH - 5}" x2="${x + MEASURE_WIDTH - 5}" y1="${STAFF_TOP}" y2="${STAFF_TOP + 52}" class="repeat-line"/><circle cx="${x + MEASURE_WIDTH - 12}" cy="${STAFF_TOP + 19}" r="2.2"/><circle cx="${x + MEASURE_WIDTH - 12}" cy="${STAFF_TOP + 33}" r="2.2"/>` : "";
    return `<g class="measure" data-measure="${index}"><rect x="${x + 1}" y="${STAFF_TOP - 58}" width="${MEASURE_WIDTH - 2}" height="${STAFF_GAP * 5 + 68}" class="measure-hit" data-measure="${index}"/><line x1="${x}" x2="${x}" y1="${STAFF_TOP}" y2="${STAFF_TOP + 4 * STAFF_GAP}" class="barline" /><text x="${x + 10}" y="${STAFF_TOP - 8}" class="measure-number">${measure.number}</text>${text}${chords}${repeatStart}${repeatEnd}${notes}</g>`;
  }).join("");
  const endX = MEASURE_START + measures.length * MEASURE_WIDTH;
  const cursorX = MEASURE_START + state.cursor.measure * MEASURE_WIDTH + 28 + (state.cursor.beat / 4) * (MEASURE_WIDTH - 40);
  const cursor = state.tool !== "select" ? `<line x1="${cursorX}" x2="${cursorX}" y1="${STAFF_TOP - 11}" y2="${STAFF_TOP + 4 * STAFF_GAP + 11}" class="cursor" />` : "";
  return `<svg viewBox="0 0 ${endX + 42} 240" class="score-svg" role="img" aria-label="Partitura editable">
    <rect width="100%" height="100%" rx="12" class="paper" />
    <text x="42" y="55" class="score-title">${escapeHtml(state.score.title)}</text>
    <text x="54" y="${STAFF_TOP + 46}" class="clef">${state.score.clef === "bass" ? "𝄢" : "𝄞"}</text>
    <text x="78" y="${STAFF_TOP + 23}" class="meter">${state.score.timeSignature[0]}</text>
    <text x="78" y="${STAFF_TOP + 48}" class="meter">${state.score.timeSignature[1]}</text>
    <text x="96" y="${STAFF_TOP - 18}" class="key-signature">${state.score.keySignature !== "C" ? state.score.keySignature : ""}</text>
    ${lines}${barlines}<line x1="${endX}" x2="${endX}" y1="${STAFF_TOP}" y2="${STAFF_TOP + 4 * STAFF_GAP}" class="barline end" />${cursor}
  </svg>`;
}

export function renderMeasureSummary(score) {
  return score.measures.map((measure) => `${measure.number}: ${scoreBeats(measure)}/4`).join(" · ");
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}
