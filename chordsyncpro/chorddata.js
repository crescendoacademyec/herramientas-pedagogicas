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

// Dibuja un diagrama de mástil genérico (usado por guitarra y ukelele).
// CORRECCIÓN (dos bugs relacionados con las cuerdas al aire, visibles en E/Em de guitarra):
// 1) Toda cuerda con traste 0 se dibujaba como un punto dentro de la primera casilla del
//    diapasón, es decir, idéntica a una cuerda pisada en el traste 1. Ahora una cuerda al
//    aire se marca con un círculo hueco ("o") arriba de la cejuela — nunca con un punto
//    dentro del diapasón.
// 2) Cuando el diagrama arranca en el traste 0 (cejuela real), la cejuela es una línea física
//    y la primera casilla de puntos corresponde al traste 1, no al traste 0 — a diferencia de
//    un diagrama que arranca en un traste alto (ej. "8fr"), donde la primera casilla SÍ es ese
//    mismo traste inicial. Antes se usaba la misma fórmula en ambos casos, así que las cuerdas
//    pisadas en el traste 1 (p. ej. la 3ª cuerda de un Mi mayor abierto) se dibujaban una
//    casilla más abajo de lo debido, encimadas con las del traste 2.
function renderFretboardSVG(chordLabel, numStrings, frets, W, H) {
  const marginL = 20, marginT = 30;
  const startFret = Math.min(...frets); // si el mínimo es 0, el diagrama empieza en la cejuela real
  // traste representado por la primera casilla de puntos (ver nota 2 arriba)
  const firstCellFret = startFret === 0 ? 1 : startFret;
  const fretSpan = 4; // trastes visibles
  const stringGap = (W - marginL * 2) / (numStrings - 1);
  const fretGap = (H - marginT - 14) / fretSpan;

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">`;
  svg += `<text x="${W / 2}" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="var(--gold, #d4a84f)">${chordLabel}</text>`;
  // cuerdas
  for (let s = 0; s < numStrings; s++) {
    const x = marginL + s * stringGap;
    svg += `<line x1="${x}" y1="${marginT}" x2="${x}" y2="${marginT + fretSpan * fretGap}" stroke="rgba(255,255,255,0.35)" stroke-width="1.2"/>`;
  }
  // trastes (la línea superior es la cejuela/nut, más gruesa, solo si empezamos en traste 0)
  for (let f = 0; f <= fretSpan; f++) {
    const y = marginT + f * fretGap;
    svg += `<line x1="${marginL}" y1="${y}" x2="${marginL + (numStrings - 1) * stringGap}" y2="${y}" stroke="rgba(255,255,255,0.35)" stroke-width="${f === 0 && startFret === 0 ? 3 : 1}"/>`;
  }
  // indicador de traste inicial (solo tiene sentido si no arrancamos en la cejuela real)
  if (startFret > 0) {
    svg += `<text x="${marginL - 14}" y="${marginT + fretGap * 0.7}" font-size="10" fill="var(--text-dim, #999)">${startFret}fr</text>`;
  }
  // cejilla: cuando todas las cuerdas están cejilladas en el mismo traste inicial (ninguna al aire)
  if (startFret > 0) {
    const y = marginT + 0.5 * fretGap;
    svg += `<line x1="${marginL}" y1="${y}" x2="${marginL + (numStrings - 1) * stringGap}" y2="${y}" stroke="var(--gold, #d4a84f)" stroke-width="6" stroke-linecap="round" opacity="0.85"/>`;
  }
  // puntos / cuerdas al aire
  frets.forEach((fr, s) => {
    const x = marginL + s * stringGap;
    if (fr === 0) {
      // cuerda al aire: círculo hueco arriba de la cejuela, NUNCA un punto dentro del diapasón
      svg += `<circle cx="${x}" cy="${marginT - 8}" r="4" fill="none" stroke="var(--gold, #d4a84f)" stroke-width="1.6"/>`;
    } else {
      const cellIndex = fr - firstCellFret;
      const y = marginT + (cellIndex + 0.5) * fretGap;
      svg += `<circle cx="${x}" cy="${y}" r="6" fill="var(--gold, #d4a84f)"/>`;
    }
  });
  svg += `</svg>`;
  return svg;
}

function renderGuitarDiagramSVG(chord) {
  const shape = guitarBarreShape(chord);
  if (!shape) return '';
  const label = shape.root + (shape.quality === 'minor' ? 'm' : '');
  return renderFretboardSVG(label, 6, shape.frets, 130, 150);
}

// ---------- Diagrama de ukelele (cejilla movible, forma "A" — la más usada en generadores de acordes de ukelele) ----------
// Afinación reentrante Sol-Do-Mi-La (G-C-E-A). Igual que con la guitarra, siempre da una
// posición correcta y ejecutable para cualquier tónica, aunque en tonos alejados de A/Am
// termine bastante arriba del diapasón en vez de ser el voicing más cómodo (por ejemplo
// C mayor sale como cejilla en el traste 3: 5-4-3-3, un shape real y tocable, aunque en
// la práctica muchos prefieran el acorde abierto de C).
const UKULELE_MAJOR_OFFSETS = [2, 1, 0, 0]; // cuerdas: Sol, Do, Mi, La
const UKULELE_MINOR_OFFSETS = [2, 0, 0, 0];

function ukuleleBarreShape(chord) {
  const parsed = parseChordLabel(chord);
  if (!parsed) return null;
  const openA = NOTE_TO_SEMITONE['A']; // 9 — cuerda de referencia de la forma "A"
  const barreFret = (parsed.semitone - openA + 12) % 12;
  const offsets = parsed.quality === 'minor' ? UKULELE_MINOR_OFFSETS : UKULELE_MAJOR_OFFSETS;
  const frets = offsets.map((o) => barreFret + o);
  return { root: parsed.root, quality: parsed.quality, barreFret, frets };
}

function renderUkuleleDiagramSVG(chord) {
  const shape = ukuleleBarreShape(chord);
  if (!shape) return '';
  const label = shape.root + (shape.quality === 'minor' ? 'm' : '');
  return renderFretboardSVG(label, 4, shape.frets, 100, 150);
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
