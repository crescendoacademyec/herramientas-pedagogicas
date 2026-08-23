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
  // cuerdas, de izquierda a derecha tal como se ve el diagrama: Mi grave, La, Re, Sol, Si, Mi agudo
  major: {
    'C':  [null, 3, 2, 0, 1, 0],
    'C#': [null, 4, 6, 6, 6, 4],   // cejilla forma A, traste 4
    'D':  [null, null, 0, 2, 3, 2],
    'D#': [null, 6, 8, 8, 8, 6],   // cejilla forma A, traste 6
    'E':  [0, 2, 2, 1, 0, 0],
    'F':  [1, 3, 3, 2, 1, 1],      // cejilla forma E, traste 1
    'F#': [2, 4, 4, 3, 2, 2],      // cejilla forma E, traste 2
    'G':  [3, 2, 0, 0, 0, 3],
    'G#': [4, 6, 6, 5, 4, 4],      // cejilla forma E, traste 4
    'A':  [null, 0, 2, 2, 2, 0],
    'A#': [null, 1, 3, 3, 3, 1],   // cejilla forma A, traste 1
    'B':  [null, 2, 4, 4, 4, 2],   // cejilla forma A, traste 2
  },
  minor: {
    'C':  [null, 3, 5, 5, 4, 3],   // cejilla forma Am, traste 3
    'C#': [null, 4, 6, 6, 5, 4],   // cejilla forma Am, traste 4
    'D':  [null, null, 0, 2, 3, 1],
    'D#': [null, 6, 8, 8, 7, 6],   // cejilla forma Am, traste 6
    'E':  [0, 2, 2, 0, 0, 0],
    'F':  [1, 3, 3, 1, 1, 1],      // cejilla forma Em, traste 1
    'F#': [2, 4, 4, 2, 2, 2],      // cejilla forma Em, traste 2
    'G':  [3, 5, 5, 3, 3, 3],      // cejilla forma Em, traste 3
    'G#': [4, 6, 6, 4, 4, 4],      // cejilla forma Em, traste 4
    'A':  [null, 0, 2, 2, 1, 0],
    'A#': [null, 1, 3, 3, 2, 1],   // cejilla forma Am, traste 1
    'B':  [null, 2, 4, 4, 3, 2],   // cejilla forma Am, traste 2
  },
};

// cuerdas, de izquierda a derecha: Sol, Do, Mi, La (afinación reentrante estándar)
const UKULELE_CHORD_SHAPES = {
  major: {
    'A': [2, 1, 0, 0], 'A#': [3, 2, 1, 1], 'B': [4, 3, 2, 2], 'C': [0, 0, 0, 3],
    'C#': [1, 1, 1, 4], 'D': [2, 2, 2, 0], 'D#': [0, 3, 3, 1], 'E': [4, 4, 4, 2],
    'F': [2, 0, 1, 0], 'F#': [3, 1, 2, 1], 'G': [0, 2, 3, 2], 'G#': [null, 3, 4, 3],
  },
  minor: {
    'A': [2, 0, 0, 0], 'A#': [3, 1, 1, 1], 'B': [4, 2, 2, 2], 'C': [0, 3, 3, 3],
    'C#': [1, 1, 0, 4], 'D': [2, 2, 1, 0], 'D#': [3, 3, 2, 1], 'E': [0, 4, 3, 2],
    'F': [1, 0, 1, 3], 'F#': [2, 1, 2, 0], 'G': [0, 2, 3, 1], 'G#': [1, 3, 4, 2],
  },
};

function lookupChordShape(table, chord) {
  const parsed = parseChordLabel(chord);
  if (!parsed) return null;
  // usamos la grafía con sostenidos (C#, D#...) como clave canónica, sin importar si el
  // acorde detectado vino como bemol (Db, Eb...): mismo semitono, misma digitación.
  const canonicalRoot = SEMITONE_TO_NOTE[parsed.semitone];
  const frets = (parsed.quality === 'minor' ? table.minor : table.major)[canonicalRoot];
  if (!frets) return null;
  const label = canonicalRoot + (parsed.quality === 'minor' ? 'm' : '');
  return { label, frets };
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
