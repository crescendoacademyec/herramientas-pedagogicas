// ---------- PENTAGRAMA ----------
const svg = document.getElementById('staffSvg');
const SVG_W = 2100, SVG_H = 450;
const Y0 = 150, HALF = 110;
function stepY(step) { return Y0 - step * HALF; }

const STAFF_X1 = 10, STAFF_X2 = 2090;

function svgEl(tag, attrs) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

function placeClef(glyph, leftX, topY, bottomY, extraScale = 1.4) {
  const probe = svgEl('text', { x: 0, y: 0, 'font-size': 200, 'font-family': 'serif' });
  probe.textContent = glyph;
  svg.appendChild(probe);
  const bbox = probe.getBBox();
  svg.removeChild(probe);
  if (!bbox.height) return;
  const targetHeight = bottomY - topY;
  let scale = (targetHeight / bbox.height) * extraScale;
  const dx = leftX - bbox.x * scale;
  const dy = topY - bbox.y * scale;
  const g = svgEl('g', { transform: `translate(${dx},${dy}) scale(${scale})` });
  const text = svgEl('text', { x: 0, y: 0, 'font-size': 200, 'font-family': 'serif', fill: '#333' });
  text.textContent = glyph;
  g.appendChild(text);
  svg.appendChild(g);
}

// ---------- ARMADURA DE CLAVE (sostenidos/bemoles según la tonalidad) ----------
// Orden estándar de aparición: sostenidos "Fa Do Sol Re La Mi Si",
// bemoles "Si Mi La Re Sol Do Fa" (el orden de bemoles es el inverso del de sostenidos).
const SHARP_LETTERS = ['F','C','G','D','A','E','B'];
const FLAT_LETTERS  = ['B','E','A','D','G','C','F'];
// Octava convencional de cada alteración según la clave (posición estándar de notación).
const SHARP_OCTAVE_TREBLE = { F:5, C:5, G:5, D:5, A:4, E:5, B:4 };
const SHARP_OCTAVE_BASS   = { F:3, C:3, G:3, D:3, A:2, E:3, B:2 };
const FLAT_OCTAVE_TREBLE  = { B:4, E:5, A:4, D:5, G:4, C:5, F:4 };
const FLAT_OCTAVE_BASS    = { B:2, E:3, A:2, D:3, G:2, C:3, F:2 };

// Tonalidad mayor y su relativa menor (comparten la misma armadura), indexada
// por pitch-class (0-11) del tono mayor. type:null = Do mayor/La menor (sin alteraciones).
const KEY_SIGNATURES = {
  0:  { type: null,  count: 0 },
  7:  { type: 'sharp', count: 1 },
  2:  { type: 'sharp', count: 2 },
  9:  { type: 'sharp', count: 3 },
  4:  { type: 'sharp', count: 4 },
  11: { type: 'sharp', count: 5 },
  6:  { type: 'sharp', count: 6 },
  18: { type: 'flat',  count: 6 },
  1:  { type: 'flat',  count: 5 },
  8:  { type: 'flat',  count: 4 },
  3:  { type: 'flat',  count: 3 },
  10: { type: 'flat',  count: 2 },
  5:  { type: 'flat',  count: 1 }
};

const KEYSIG_X_START = 700; // mover armaduras
const KEYSIG_SPACING = 100; // separar armaduras

function drawKeySignature() {
  svg.querySelectorAll('.keysig-el').forEach(e => e.remove());
  if (currentKeyPc === null) return;
  const sig = currentSignature();
  if (!sig || sig.count === 0) return;

  const letters = sig.type === 'sharp' ? SHARP_LETTERS : FLAT_LETTERS;
  const octTreble = sig.type === 'sharp' ? SHARP_OCTAVE_TREBLE : FLAT_OCTAVE_TREBLE;
  const octBass = sig.type === 'sharp' ? SHARP_OCTAVE_BASS : FLAT_OCTAVE_BASS;
  const glyph = sig.type === 'sharp' ? '♯' : '♭';

  for (let i = 0; i < sig.count; i++) {
    const letter = letters[i];
    const x = KEYSIG_X_START + i * KEYSIG_SPACING;

    const stepTreble = diatonicStep(letter, octTreble[letter]);
    const yTreble = stepY(stepTreble);
    const symTreble = svgEl('text', { class: 'keysig-el', x, y: yTreble, 'font-size': 250, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#222', 'font-family': 'serif' });
    symTreble.textContent = glyph;
    svg.appendChild(symTreble);

    const stepBass = diatonicStep(letter, octBass[letter]);
    const yBass = stepY(stepBass);
    const symBass = svgEl('text', { class: 'keysig-el', x, y: yBass, 'font-size': 250, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#222', 'font-family': 'serif' });
    symBass.textContent = glyph;
    svg.appendChild(symBass);
  }
}

function drawBaseStaff() {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 ' + SVG_W + ' ' + SVG_H);
  [2,4,6,8,10].forEach(step => {
    const y = stepY(step);
    svg.appendChild(svgEl('line', { x1: STAFF_X1, x2: STAFF_X2, y1: y, y2: y, stroke: '#000', 'stroke-width': 10 }));
  });
  [-10,-8,-6,-4,-2].forEach(step => {
    const y = stepY(step);
    svg.appendChild(svgEl('line', { x1: STAFF_X1, x2: STAFF_X2, y1: y, y2: y, stroke: '#000', 'stroke-width': 10 }));
  });
  // Clave de sol con parámetros según SO
  // Clave de sol
  placeClef('𝄞', STAFF_X1+5, stepY(14) + clefOffsetY + CLEF_Y_SHIFT, stepY(3) + clefOffsetY + CLEF_Y_SHIFT, clefScale);
  // Clave de fa
  placeClef('𝄢', STAFF_X1+5, stepY(-3)-320, stepY(-10)-354, 1.45);
  svg.appendChild(svgEl('line', { x1: STAFF_X1, x2: STAFF_X1, y1: stepY(10), y2: stepY(-10), stroke: '#000', 'stroke-width': 5 }));
  svg.appendChild(svgEl('line', { x1: STAFF_X2, x2: STAFF_X2, y1: stepY(10), y2: stepY(-10), stroke: '#000', 'stroke-width': 5 }));
}
drawBaseStaff();
drawKeySignature();

function ledgerLinesFor(step, clef) {
  const lines = [];
  if (clef === 'treble') {
    if (step < 2) {
      for (let l = 0; l >= step; l -= 2) {
        lines.push(l);
      }
    } else if (step > 10) {
      for (let l = 12; l <= step; l += 2) {
        lines.push(l);
      }
    }
  } else {
    if (step < -10) {
      for (let l = -12; l >= step; l -= 2) {
        lines.push(l);
      }
    } else if (step > -2) {
      for (let l = 0; l <= step; l += 2) {
        lines.push(l);
      }
    }
  }
  return lines;
}

const activeStaffNotes = {};

// ---------- SPELLING ENHARMÓNICO DEL PENTAGRAMA ----------
// El MIDI solo identifica altura (p. ej. 63), no si esa tecla debe escribirse
// como D# o Eb. Para el pentagrama usamos primero el contexto del acorde
// detectado y, como fallback, la armadura seleccionada. Así, C–Eb–G se coloca
// realmente como una tercera menor (Eb sobre la línea/espacio de E), no como D#.
const STAFF_LETTERS = ['C','D','E','F','G','A','B'];
const STAFF_NATURAL_PC = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const STAFF_SOLFEGE = {C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};

function staffDegreeForInterval(interval, suffix='') {
  const iv=((interval%12)+12)%12;
  if(iv===0) return 0;      // raíz
  if(iv===1) return 1;      // b2 / b9
  if(iv===2) return 1;      // 2 / 9
  if(iv===3) return suffix.includes('#9') ? 1 : 2; // #9 o b3
  if(iv===4) return 2;      // 3
  if(iv===5) return 3;      // 4 / 11
  if(iv===6) return suffix.includes('#11') ? 3 : 4; // #11 o b5
  if(iv===7) return 4;      // 5
  if(iv===8) return suffix.includes('b13') ? 5 : 4; // b13 o #5
  if(iv===9) return 5;      // 6 / 13
  if(iv===10) return 6;     // b7
  if(iv===11) return 6;     // 7
  return null;
}

function normalizeStaffAccidental(delta){
  let d=((delta+6)%12)-6;
  if(d>2||d<-2) return null;
  return d;
}

function fallbackStaffSpelling(midi){
  const pc=((midi%12)+12)%12;
  const flats={1:['D',-1],3:['E',-1],6:['G',-1],8:['A',-1],10:['B',-1]};
  const sharps={1:['C',1],3:['D',1],6:['F',1],8:['G',1],10:['A',1]};
  if(STAFF_NATURAL_PC[NOTE_NAMES_EN[pc]]!==undefined){
    const letter=NOTE_NAMES_EN[pc];
    return makeStaffSpelling(midi,letter,0);
  }
  const useFlats=currentSignature().type==='flat';
  const spec=(useFlats?flats:sharps)[pc] || sharps[pc];
  return makeStaffSpelling(midi,spec[0],spec[1]);
}

function makeStaffSpelling(midi,letter,accidental){
  const naturalPc=STAFF_NATURAL_PC[letter];
  const octave=Math.round((midi-naturalPc-accidental)/12)-1;
  const accidentalText=accidental===-2?'bb':accidental===-1?'b':accidental===1?'#':accidental===2?'##':'';
  const glyph=accidental===-2?'♭♭':accidental===-1?'♭':accidental===1?'♯':accidental===2?'𝄪':'';
  // La alteración se dibuja fuera de la cabeza de la nota; dentro mostramos solo el nombre base.
  const label=(currentLang==='es'?STAFF_SOLFEGE[letter]:letter);
  return {midi,letter,name:letter+accidentalText,label,octave,accidental,glyph,idx:((midi%12)+12)%12};
}

function spellStaffMidi(midi,chord){
  if(!chord||typeof chord.rootPc!=='number') return fallbackStaffSpelling(midi);
  const rootText=chord.rootName||formatPc(chord.rootPc);
  const rootLetter=(rootText.match(/[A-G]/)||[])[0];
  if(!rootLetter) return fallbackStaffSpelling(midi);
  const interval=((midi%12)-chord.rootPc+12)%12;
  const degree=staffDegreeForInterval(interval,chord.suffix||'');
  if(degree===null) return fallbackStaffSpelling(midi);
  const rootIx=STAFF_LETTERS.indexOf(rootLetter);
  const letter=STAFF_LETTERS[(rootIx+degree)%7];
  const targetPc=((midi%12)+12)%12;
  const accidental=normalizeStaffAccidental(targetPc-STAFF_NATURAL_PC[letter]);
  if(accidental===null) return fallbackStaffSpelling(midi);
  return makeStaffSpelling(midi,letter,accidental);
}

function setStaffNote(midi, on) {
  if (on) activeStaffNotes[midi] = true;
  else delete activeStaffNotes[midi];
  renderStaffNotes();
}

function renderStaffNotes() {
  svg.querySelectorAll('.note-el').forEach(e => e.remove());
  const activeMidis = Object.keys(activeStaffNotes).map(Number).sort((a,b)=>a-b);
  const chord = (activeMidis.length >= 2 && typeof identifyChord === 'function') ? identifyChord(activeMidis) : null;
  const active = activeMidis.map(m => spellStaffMidi(m, chord));
  const cx = (STAFF_X1 + STAFF_X2) / 2;
  const NOTE_X_OFFSET = 500; //cabezas a la derecha
  let prevStep = null, shiftToggle = false;
  const LEDGER_LENGTH = 200;

  active.forEach(n => {
    const step = diatonicStep(n.name, n.octave);
    const clef = step >= 0 ? 'treble' : 'bass';
    let stepVisible = step;
    let octaveShift = null;

    if (step <= -13) {
      stepVisible = step + 7;
      octaveShift = '8vb';
    } else if (step >= 13) {
      stepVisible = step - 7;
      octaveShift = '8va';
    }

    const y = stepY(stepVisible);
    if (prevStep !== null && Math.abs(stepVisible - prevStep) <= 1) shiftToggle = !shiftToggle;
    else shiftToggle = false;
    prevStep = stepVisible;
    const x = cx + NOTE_X_OFFSET + (shiftToggle ? 300 : 0);

    const ledgerLines = ledgerLinesFor(stepVisible, clef);
    ledgerLines.forEach(L => {
      const ly = stepY(L);
      const led = svgEl('line', { class: 'note-el', x1: x - LEDGER_LENGTH, x2: x + LEDGER_LENGTH, y1: ly, y2: ly, stroke: '#000', 'stroke-width': 20 });
      svg.appendChild(led);
    });

    if (n.glyph) {
      const accidental = svgEl('text', { class: 'note-el', x: x-205, y: y+24, 'font-size': 205, fill: '#222', 'font-family': 'serif', 'text-anchor':'middle' });
      accidental.textContent = n.glyph;
      svg.appendChild(accidental);
    }

    const head = svgEl('ellipse', { class: 'note-el', cx: x, cy: y, rx: 122, ry: 106, fill: '#000', stroke: '#222', 'stroke-width': 0.8 });
    svg.appendChild(head);

    const lbl = svgEl('text', { class: 'note-el', x: x, y: y+2, 'font-size': 157, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#fff', 'font-weight': 'bold' });
    lbl.textContent = n.label;
    svg.appendChild(lbl);

    if (octaveShift) {
      const offsetY = (octaveShift === '8va') ? -173 : 196;
      const indicador = svgEl('text', { class: 'note-el', x: x, y: y + offsetY, 'font-size': 79, 'text-anchor': 'middle', 'font-family': 'serif', fill: '#333', 'font-weight': 'bold' });
      indicador.textContent = octaveShift;
      svg.appendChild(indicador);
    }
  });
}
