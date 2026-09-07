// ChordSync Pro — utilidades de teoría musical
// Números de Nashville, diagramas de guitarra (posición de cejilla movible) y notas de acorde para piano.

const NOTE_TO_SEMITONE = { 'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11 };
const SEMITONE_TO_NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEMITONE_TO_FLAT_NOTE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NASHVILLE_DEGREES = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'];

const CHORD_SUFFIX_ALIASES = {
  '': '', 'maj': '', 'M': '',
  'min': 'm', '-': 'm', 'm': 'm',
  '7': '7',
  'maj7': 'maj7', 'M7': 'maj7', 'Δ7': 'maj7', '∆7': 'maj7',
  'm7': 'm7', 'min7': 'm7', '-7': 'm7',
  'm7b5': 'm7b5', 'm7♭5': 'm7b5', 'ø': 'm7b5', 'ø7': 'm7b5',
  'dim': 'dim', '°': 'dim',
  'dim7': 'dim7', '°7': 'dim7',
  'sus': 'sus4', 'sus4': 'sus4', 'sus2': 'sus2',
  '6': '6', 'm6': 'm6', 'min6': 'm6',
  'add9': 'add9',
  '9': '9', 'm9': 'm9', 'min9': 'm9',
  'maj9': 'maj9', 'M9': 'maj9', 'Δ9': 'maj9', '∆9': 'maj9'
};

const CHORD_INTERVALS = {
  '': [0,4,7], 'm': [0,3,7],
  '7': [0,4,7,10], 'maj7': [0,4,7,11], 'm7': [0,3,7,10],
  'm7b5': [0,3,6,10], 'dim': [0,3,6], 'dim7': [0,3,6,9],
  'sus4': [0,5,7], 'sus2': [0,2,7],
  '6': [0,4,7,9], 'm6': [0,3,7,9],
  'add9': [0,4,7,2], '9': [0,4,7,10,2], 'm9': [0,3,7,10,2], 'maj9': [0,4,7,11,2]
};

// Grados diatónicos asociados a cada intervalo. Sirven para escribir correctamente
// E# en C#maj7, Bb en C7, Cb en Dbm7b5, etc., en lugar de elegir solo por semitono.
const CHORD_DEGREES = {
  '': [1,3,5], 'm': [1,3,5],
  '7': [1,3,5,7], 'maj7': [1,3,5,7], 'm7': [1,3,5,7],
  'm7b5': [1,3,5,7], 'dim': [1,3,5], 'dim7': [1,3,5,7],
  'sus4': [1,4,5], 'sus2': [1,2,5],
  '6': [1,3,5,6], 'm6': [1,3,5,6],
  'add9': [1,3,5,2], '9': [1,3,5,7,2], 'm9': [1,3,5,7,2], 'maj9': [1,3,5,7,2]
};

const LETTERS = ['C','D','E','F','G','A','B'];
const NATURAL_SEMITONES = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };

function accidentalText(offset) {
  if (offset === 0) return '';
  if (offset === 1) return '#';
  if (offset === 2) return '##';
  if (offset === -1) return 'b';
  if (offset === -2) return 'bb';
  return offset > 0 ? '#'.repeat(offset) : 'b'.repeat(-offset);
}

function signedPitchDiff(target, natural) {
  let diff = (target - natural + 12) % 12;
  if (diff > 6) diff -= 12;
  return diff;
}

function theoreticalChordToneNames(chord) {
  const parsed = typeof chord === 'string' ? parseChordLabel(chord) : chord;
  if (!parsed) return [];
  const degrees = CHORD_DEGREES[parsed.suffix];
  if (!degrees) return [];

  const rootLetter = parsed.root[0];
  const rootLetterIndex = LETTERS.indexOf(rootLetter);
  if (rootLetterIndex < 0) return [];

  return parsed.intervals.map((interval, i) => {
    const degree = degrees[i] || 1;
    const letter = LETTERS[(rootLetterIndex + degree - 1) % 7];
    const targetPitch = (parsed.semitone + interval) % 12;
    const accidental = accidentalText(signedPitchDiff(targetPitch, NATURAL_SEMITONES[letter]));
    return letter + accidental;
  });
}


function normalizeChordSuffix(rawSuffix) {
  const cleaned = String(rawSuffix || '').trim().replace(/♭/g, 'b').replace(/\s+/g, '');
  return Object.prototype.hasOwnProperty.call(CHORD_SUFFIX_ALIASES, cleaned)
    ? CHORD_SUFFIX_ALIASES[cleaned]
    : null;
}

function parseChordLabel(chord) {
  if (!chord || chord === 'N' || chord === 'X') return null;
  const cleaned = String(chord).trim();
  const match = cleaned.match(/^([A-Ga-g])([#b]?)([^/]*?)(?:\/([A-Ga-g])([#b]?))?$/);
  if (!match) return null;

  const root = match[1].toUpperCase() + (match[2] || '');
  if (!(root in NOTE_TO_SEMITONE)) return null;

  const suffix = normalizeChordSuffix(match[3] || '');
  if (suffix === null || !CHORD_INTERVALS[suffix]) return null;

  let bassRoot = '';
  if (match[4]) {
    bassRoot = match[4].toUpperCase() + (match[5] || '');
    if (!(bassRoot in NOTE_TO_SEMITONE)) return null;
  }

  const quality =
    ['m','m7','m7b5','m6','m9'].includes(suffix) ? 'minor' :
    ['dim','dim7'].includes(suffix) ? 'diminished' :
    ['sus2','sus4'].includes(suffix) ? 'suspended' :
    'major';

  return {
    root,
    semitone: NOTE_TO_SEMITONE[root],
    suffix,
    quality,
    bassRoot,
    intervals: CHORD_INTERVALS[suffix].slice(),
    normalized: root + suffix + (bassRoot ? '/' + bassRoot : '')
  };
}

function formatChordLabel(chord) {
  const parsed = typeof chord === 'string' ? parseChordLabel(chord) : chord;
  return parsed ? parsed.normalized : String(chord || '');
}

function chordToNashville(chord, keyRoot) {
  const parsed = parseChordLabel(chord);
  const keySemitone = NOTE_TO_SEMITONE[keyRoot];
  if (!parsed || keySemitone === undefined) return chord;
  const dist = (parsed.semitone - keySemitone + 12) % 12;
  let label = NASHVILLE_DEGREES[dist] + parsed.suffix;
  if (parsed.bassRoot) {
    const bassDist = (NOTE_TO_SEMITONE[parsed.bassRoot] - keySemitone + 12) % 12;
    label += '/' + NASHVILLE_DEGREES[bassDist];
  }
  return label;
}

// ---------- Diagramas de guitarra y ukelele: posiciones fijas, verificadas a mano ----------
// IMPORTANTE: estas NO se calculan con una fórmula de cejilla movible. Se transcribieron y
// verificaron (pixel a pixel, contrastando con las imágenes/PDF de referencia que compartió
// el usuario) directamente desde las digitaciones estándar que se enseñan en la práctica:
// posiciones abiertas para los acordes que las tienen (C, D, E, G, A / Am, Dm, Em en guitarra;
// prácticamente todos en ukelele), y cejilla ("forma E" o "forma A", la que quede más abajo del
// diapasón) solo para los que realmente se tocan así (F, B y los sostenidos en guitarra).
// Antes se usaba una única fórmula de cejilla movible para TODOS los acordes, lo cual daba
// digitaciones correctas en cuanto a las notas, pero irreconocibles frente a cómo se enseñan y
// se tocan realmente (p. ej. un Do mayor no se toca como cejilla en el traste 8).
// null = cuerda apagada (x). 0 = cuerda al aire.

const GUITAR_CHORD_SHAPES = {
  // cuerdas: Mi grave, La, Re, Sol, Si, Mi agudo
  major: {
    'C':[null,3,2,0,1,0], 'C#':[null,4,6,6,6,4], 'D':[null,null,0,2,3,2],
    'D#':[null,6,8,8,8,6], 'E':[0,2,2,1,0,0], 'F':[1,3,3,2,1,1],
    'F#':[2,4,4,3,2,2], 'G':[3,2,0,0,0,3], 'G#':[4,6,6,5,4,4],
    'A':[null,0,2,2,2,0], 'A#':[null,1,3,3,3,1], 'B':[null,2,4,4,4,2]
  },
  minor: {
    'C':[null,3,5,5,4,3], 'C#':[null,4,6,6,5,4], 'D':[null,null,0,2,3,1],
    'D#':[null,6,8,8,7,6], 'E':[0,2,2,0,0,0], 'F':[1,3,3,1,1,1],
    'F#':[2,4,4,2,2,2], 'G':[3,5,5,3,3,3], 'G#':[4,6,6,4,4,4],
    'A':[null,0,2,2,1,0], 'A#':[null,1,3,3,2,1], 'B':[null,2,4,4,3,2]
  },

  // Dominantes 7: posiciones estándar compactas / abiertas cuando son pedagógicamente comunes.
  '7': {
    'C':[null,3,2,3,1,0],
    'C#':[null,4,3,4,2,null],
    'D':[null,null,0,2,1,2],
    'D#':[null,6,5,6,4,null],
    'E':[0,2,0,1,0,0],
    'F':[1,3,1,2,1,1],
    'F#':[2,4,2,3,2,2],
    'G':[3,2,0,0,0,1],
    'G#':[4,6,4,5,4,4],
    'A':[null,0,2,0,2,0],
    'A#':[null,1,3,1,3,1],
    'B':[null,2,1,2,0,2]
  },

  // Maj7: voicings comunes, con forma abierta o cejilla reconocible.
  maj7: {
    'C':[null,3,2,0,0,0],
    'C#':[null,4,6,5,6,4],
    'D':[null,null,0,2,2,2],
    'D#':[null,6,8,7,8,6],
    'E':[0,2,1,1,0,0],
    'F':[null,null,3,2,1,0],
    'F#':[2,4,3,3,2,2],
    'G':[3,null,0,0,0,2],
    'G#':[4,6,5,5,4,4],
    'A':[null,0,2,1,2,0],
    'A#':[null,1,3,2,3,1],
    'B':[null,2,4,3,4,2]
  },

  // m7: formas abiertas o cejillas estándar.
  m7: {
    'C':[null,3,5,3,4,3],
    'C#':[null,4,6,4,5,4],
    'D':[null,null,0,2,1,1],
    'D#':[null,6,8,6,7,6],
    'E':[0,2,0,0,0,0],
    'F':[1,3,1,1,1,1],
    'F#':[2,4,2,2,2,2],
    'G':[3,5,3,3,3,3],
    'G#':[4,6,4,4,4,4],
    'A':[null,0,2,0,1,0],
    'A#':[null,1,3,1,2,1],
    'B':[null,2,4,2,3,2]
  },

  // m7b5: forma movible con raíz en quinta cuerda; contiene 1-b3-b5-b7.
  m7b5: {
    'C':[null,3,4,3,4,null], 'C#':[null,4,5,4,5,null],
    'D':[null,5,6,5,6,null], 'D#':[null,6,7,6,7,null],
    'E':[null,7,8,7,8,null], 'F':[null,8,9,8,9,null],
    'F#':[null,9,10,9,10,null], 'G':[null,10,11,10,11,null],
    'G#':[null,11,12,11,12,null], 'A':[null,0,1,0,1,null],
    'A#':[null,1,2,1,2,null], 'B':[null,2,3,2,3,null]
  },

  // dim7: voicings simétricos. Se elige una inversión compacta y completa.
  dim7: {
    'C':[8,null,7,8,7,null], 'C#':[9,null,8,9,8,null],
    'D':[10,null,9,10,9,null], 'D#':[11,null,10,11,10,null],
    'E':[12,null,11,12,11,null], 'F':[1,null,0,1,0,null],
    'F#':[2,null,1,2,1,null], 'G':[3,null,2,3,2,null],
    'G#':[4,null,3,4,3,null], 'A':[5,null,4,5,4,null],
    'A#':[6,null,5,6,5,null], 'B':[7,null,6,7,6,null]
  },

  // sus4: posiciones abiertas cuando son comunes y formas movibles para cromáticos.
  sus4: {
    'C':[null,3,3,0,1,1], 'C#':[null,4,6,6,7,4],
    'D':[null,null,0,2,3,3], 'D#':[null,6,8,8,9,6],
    'E':[0,2,2,2,0,0], 'F':[1,3,3,3,1,1],
    'F#':[2,4,4,4,2,2], 'G':[3,3,0,0,1,3],
    'G#':[4,6,6,6,4,4], 'A':[null,0,2,2,3,0],
    'A#':[null,1,3,3,4,1], 'B':[null,2,4,4,5,2]
  }
};

// cuerdas, de izquierda a derecha: Sol, Do, Mi, La (afinación reentrante estándar)
const UKULELE_CHORD_SHAPES = {
  // cuerdas: Sol, Do, Mi, La (afinación reentrante estándar)
  major: {
    'A':[2,1,0,0], 'A#':[3,2,1,1], 'B':[4,3,2,2], 'C':[0,0,0,3],
    'C#':[1,1,1,4], 'D':[2,2,2,0], 'D#':[0,3,3,1], 'E':[4,4,4,2],
    'F':[2,0,1,0], 'F#':[3,1,2,1], 'G':[0,2,3,2], 'G#':[null,3,4,3]
  },
  minor: {
    'A':[2,0,0,0], 'A#':[3,1,1,1], 'B':[4,2,2,2], 'C':[0,3,3,3],
    'C#':[1,1,0,4], 'D':[2,2,1,0], 'D#':[3,3,2,1], 'E':[0,4,3,2],
    'F':[1,0,1,3], 'F#':[2,1,2,0], 'G':[0,2,3,1], 'G#':[1,3,4,2]
  },

  '7': {
    'C':[0,0,0,1], 'C#':[1,1,1,2], 'D':[2,2,2,3], 'D#':[3,3,3,4],
    'E':[1,2,0,2], 'F':[2,3,1,3], 'F#':[3,4,2,4], 'G':[0,2,1,2],
    'G#':[1,3,2,3], 'A':[0,1,0,0], 'A#':[1,2,1,1], 'B':[2,3,2,2]
  },

  maj7: {
    'C':[0,0,0,2], 'C#':[1,1,1,3], 'D':[2,2,2,4], 'D#':[3,3,3,5],
    'E':[1,3,0,2], 'F':[2,4,1,3], 'F#':[3,5,2,4], 'G':[0,2,2,2],
    'G#':[1,3,3,3], 'A':[1,1,0,0], 'A#':[2,2,1,1], 'B':[4,3,2,2]
  },

  m7: {
    'C':[3,3,3,3], 'C#':[4,4,4,4], 'D':[2,2,1,3], 'D#':[3,3,2,4],
    'E':[0,2,0,2], 'F':[1,3,1,3], 'F#':[2,4,2,4], 'G':[0,2,1,1],
    'G#':[1,3,2,2], 'A':[0,0,0,0], 'A#':[1,1,1,1], 'B':[2,2,2,2]
  },

  m7b5: {
    'C':[3,3,2,3],
    'C#':[0,1,0,2],
    'D':[5,5,4,5],
    'D#':[6,6,5,6],
    'E':[0,2,0,1],
    'F':[8,8,7,8],
    'F#':[5,6,0,0],
    'G':[0,1,1,1],
    'G#':[1,2,2,2],
    'A':[2,3,3,3],
    'A#':[1,1,0,1],
    'B':[2,2,1,2]
  },

  dim7: {
    'C':[2,3,2,3],
    'C#':[0,1,0,1],
    'D':[1,2,1,2],
    'D#':[2,3,2,3],
    'E':[0,1,0,1],
    'F':[1,2,1,2],
    'F#':[2,3,2,3],
    'G':[0,1,0,1],
    'G#':[1,2,1,2],
    'A':[2,3,2,3],
    'A#':[0,1,0,1],
    'B':[1,2,1,2]
  },

  sus4: {
    'C':[0,0,8,8],
    'C#':[6,6,4,4],
    'D':[0,2,3,0],
    'D#':[8,8,6,6],
    'E':[4,4,0,0],
    'F':[3,0,1,1],
    'F#':[4,1,2,2],
    'G':[0,2,3,3],
    'G#':[1,3,4,4],
    'A':[2,2,0,0],
    'A#':[3,3,1,1],
    'B':[4,4,2,2]
  }
};

function lookupChordShape(table, chord) {
  const parsed = parseChordLabel(chord);
  if (!parsed || parsed.bassRoot) return null;

  const canonicalRoot = SEMITONE_TO_NOTE[parsed.semitone];
  const family =
    parsed.suffix === '' ? 'major' :
    parsed.suffix === 'm' ? 'minor' :
    parsed.suffix === '7' ? '7' :
    parsed.suffix === 'maj7' ? 'maj7' :
    parsed.suffix === 'm7' ? 'm7' :
    parsed.suffix === 'm7b5' ? 'm7b5' :
    parsed.suffix === 'dim7' ? 'dim7' :
    parsed.suffix === 'sus4' ? 'sus4' :
    null;

  if (!family || !table[family]) return null;
  const frets = table[family][canonicalRoot];
  if (!frets) return null;
  return { label: parsed.normalized, frets };
}

// Dibuja un diagrama de mástil genérico (usado por guitarra y ukelele) a partir de una
// digitación fija: frets[i] es null (cuerda apagada), 0 (al aire) o el traste pisado.
function renderFretboardSVG(chordLabel, frets, W, H) {
  const marginL = 20, marginT = 30;
  const numStrings = frets.length;
  const fretted = frets.filter((f) => typeof f === 'number' && f > 0);
  const hasOpenString = frets.includes(0);
  // si alguna cuerda suena al aire, el diagrama arranca en la cejuela real (traste 0);
  // si no (acorde de cejilla puro), arranca en el traste más bajo que se usa
  const startFret = hasOpenString || !fretted.length ? 0 : Math.min(...fretted);
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
  // cejilla: cuando el acorde es un acorde de cejilla puro (sin cuerdas al aire)
  if (startFret > 0) {
    const y = marginT + 0.5 * fretGap;
    svg += `<line x1="${marginL}" y1="${y}" x2="${marginL + (numStrings - 1) * stringGap}" y2="${y}" stroke="var(--gold, #d4a84f)" stroke-width="6" stroke-linecap="round" opacity="0.85"/>`;
  }
  // puntos / cuerdas al aire / cuerdas apagadas
  frets.forEach((fr, s) => {
    const x = marginL + s * stringGap;
    if (fr === null) {
      // cuerda apagada: "x" arriba de la cejuela
      svg += `<text x="${x}" y="${marginT - 4}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text-dim, #999)">×</text>`;
    } else if (fr === 0) {
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
  const shape = lookupChordShape(GUITAR_CHORD_SHAPES, chord);
  if (!shape) return '';
  return renderFretboardSVG(shape.label, shape.frets, 130, 150);
}

function renderUkuleleDiagramSVG(chord) {
  const shape = lookupChordShape(UKULELE_CHORD_SHAPES, chord);
  if (!shape) return '';
  return renderFretboardSVG(shape.label, shape.frets, 100, 150);
}

// ---------- Notas del acorde para piano (clases de altura, no una octava específica) ----------
function chordToneNames(chord) {
  return theoreticalChordToneNames(chord);
}

function renderPianoDiagramSVG(chord) {
  const parsed = parseChordLabel(chord);
  if (!parsed) return '';
  const tones = theoreticalChordToneNames(parsed);
  const activePcs = new Set(parsed.intervals.map(interval => (parsed.semitone + interval) % 12));

  const WHITE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const BLACK_AFTER = { 'C': 'C#', 'D': 'D#', 'F': 'F#', 'G': 'G#', 'A': 'A#' };
  const keyW = 20, keyH = 70, W = keyW * 7 + 4, H = keyH + 20;
  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="90">`;

  WHITE_ORDER.forEach((n, i) => {
    const x = 2 + i * keyW;
    const on = activePcs.has(NOTE_TO_SEMITONE[n]);
    svg += `<rect x="${x}" y="18" width="${keyW - 1}" height="${keyH}" fill="${on ? 'var(--gold, #d4a84f)' : '#fdfaf3'}" stroke="#332b1a" stroke-width="1"/>`;
  });

  WHITE_ORDER.forEach((n, i) => {
    const bn = BLACK_AFTER[n];
    if (!bn) return;
    const x = 2 + i * keyW + keyW * 0.68;
    const on = activePcs.has(NOTE_TO_SEMITONE[bn]);
    svg += `<rect x="${x}" y="18" width="${keyW * 0.62}" height="${keyH * 0.6}" fill="${on ? 'var(--gold-hover, #e5bd67)' : '#161514'}" stroke="#000" stroke-width="1"/>`;
  });

  svg += `<text x="${W / 2}" y="12" text-anchor="middle" font-size="11" fill="var(--text-dim, #999)">${tones.join(' – ')}</text>`;
  svg += `</svg>`;
  return svg;
}

