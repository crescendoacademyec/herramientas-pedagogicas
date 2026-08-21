// ChordSync Pro — utilidades de teoría musical
// Números de Nashville, diagramas de guitarra (posición de cejilla movible) y notas de acorde para piano.

const NOTE_TO_SEMITONE = { 'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11 };
const SEMITONE_TO_NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Grados de la escala mayor por semitono de distancia respecto a la tónica — base estándar del sistema de números de Nashville.
const NASHVILLE_DEGREES = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'];

function parseChordLabel(chord) {
  if (!chord || chord === 'N' || chord === 'X') return null;
  const isMinor = chord.endsWith('m') && chord !== 'N';
  const root = isMinor ? chord.slice(0, -1) : chord;
  if (!(root in NOTE_TO_SEMITONE)) return null;
  return { root, semitone: NOTE_TO_SEMITONE[root], quality: isMinor ? 'minor' : 'major' };
}

// ---------- Números de Nashville ----------
function chordToNashville(chord, keyRoot) {
  const parsed = parseChordLabel(chord);
  const keySemitone = NOTE_TO_SEMITONE[keyRoot];
  if (!parsed || keySemitone === undefined) return chord;
  const dist = (parsed.semitone - keySemitone + 12) % 12;
  const degree = NASHVILLE_DEGREES[dist];
  return degree + (parsed.quality === 'minor' ? 'm' : '');
}

// ---------- Diagrama de guitarra (cejilla movible, forma "E") ----------
// Siempre da una posición correcta y ejecutable para cualquier tónica, aunque no sea
// necesariamente el voicing más idiomático en posición abierta.
const E_SHAPE_MAJOR_OFFSETS = [0, 2, 2, 1, 0, 0]; // cuerdas: Mi grave, La, Re, Sol, Si, Mi agudo
const E_SHAPE_MINOR_OFFSETS = [0, 2, 2, 0, 0, 0];

function guitarBarreShape(chord) {
  const parsed = parseChordLabel(chord);
  if (!parsed) return null;
  const openE = NOTE_TO_SEMITONE['E']; // 4
  const barreFret = (parsed.semitone - openE + 12) % 12;
  const offsets = parsed.quality === 'minor' ? E_SHAPE_MINOR_OFFSETS : E_SHAPE_MAJOR_OFFSETS;
  const frets = offsets.map((o) => barreFret + o);
  return { root: parsed.root, quality: parsed.quality, barreFret, frets };
}

function renderGuitarDiagramSVG(chord) {
  const shape = guitarBarreShape(chord);
  if (!shape) return '';
  const { barreFret, frets } = shape;
  const minFret = Math.min(...frets);
  const startFret = barreFret === 0 ? 0 : minFret;
  const fretSpan = 4; // frets visibles
  const W = 130, H = 150, marginL = 20, marginT = 26, stringGap = (W - marginL * 2) / 5, fretGap = (H - marginT - 14) / fretSpan;

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="150">`;
  // nombre del acorde
  svg += `<text x="${W / 2}" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="var(--gold, #d4a84f)">${shape.root}${shape.quality === 'minor' ? 'm' : ''}</text>`;
  // cuerdas
  for (let s = 0; s < 6; s++) {
    const x = marginL + s * stringGap;
    svg += `<line x1="${x}" y1="${marginT}" x2="${x}" y2="${marginT + fretSpan * fretGap}" stroke="rgba(255,255,255,0.35)" stroke-width="1.2"/>`;
  }
  // trastes
  for (let f = 0; f <= fretSpan; f++) {
    const y = marginT + f * fretGap;
    svg += `<line x1="${marginL}" y1="${y}" x2="${marginL + 5 * stringGap}" y2="${y}" stroke="rgba(255,255,255,0.35)" stroke-width="${f === 0 && startFret === 0 ? 3 : 1}"/>`;
  }
  // indicador de traste inicial
  if (startFret > 0) {
    svg += `<text x="${marginL - 14}" y="${marginT + fretGap * 0.7}" font-size="10" fill="var(--text-dim, #999)">${startFret}fr</text>`;
  }
  // barra de cejilla
  if (barreFret > 0) {
    const y = marginT + (barreFret - startFret + 0.5) * fretGap;
    svg += `<line x1="${marginL}" y1="${y}" x2="${marginL + 5 * stringGap}" y2="${y}" stroke="var(--gold, #d4a84f)" stroke-width="6" stroke-linecap="round" opacity="0.85"/>`;
  }
  // puntos por cuerda
  frets.forEach((fr, s) => {
    const x = marginL + s * stringGap;
    const relFret = fr - startFret;
    const y = marginT + (relFret + 0.5) * fretGap;
    svg += `<circle cx="${x}" cy="${y}" r="6" fill="var(--gold, #d4a84f)"/>`;
  });
  svg += `</svg>`;
  return svg;
}

// ---------- Notas del acorde para piano (clases de altura, no una octava específica) ----------
function chordToneNames(chord) {
  const parsed = parseChordLabel(chord);
  if (!parsed) return [];
  const third = parsed.quality === 'minor' ? 3 : 4;
  const tones = [parsed.semitone, (parsed.semitone + third) % 12, (parsed.semitone + 7) % 12];
  return tones.map((t) => SEMITONE_TO_NOTE[t]);
}

function renderPianoDiagramSVG(chord) {
  const tones = chordToneNames(chord);
  if (!tones.length) return '';
  const WHITE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const BLACK_AFTER = { 'C': 'C#', 'D': 'D#', 'F': 'F#', 'G': 'G#', 'A': 'A#' };
  const keyW = 20, keyH = 70, W = keyW * 7 + 4, H = keyH + 20;
  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="90">`;
  WHITE_ORDER.forEach((n, i) => {
    const x = 2 + i * keyW;
    const on = tones.includes(n);
    svg += `<rect x="${x}" y="18" width="${keyW - 1}" height="${keyH}" fill="${on ? 'var(--gold, #d4a84f)' : '#fdfaf3'}" stroke="#332b1a" stroke-width="1"/>`;
  });
  WHITE_ORDER.forEach((n, i) => {
    const bn = BLACK_AFTER[n];
    if (!bn) return;
    const x = 2 + i * keyW + keyW * 0.68;
    const on = tones.includes(bn);
    svg += `<rect x="${x}" y="18" width="${keyW * 0.62}" height="${keyH * 0.6}" fill="${on ? 'var(--gold-hover, #e5bd67)' : '#161514'}" stroke="#000" stroke-width="1"/>`;
  });
  svg += `<text x="${W / 2}" y="12" text-anchor="middle" font-size="11" fill="var(--text-dim, #999)">${tones.join(' – ')}</text>`;
  svg += `</svg>`;
  return svg;
}
