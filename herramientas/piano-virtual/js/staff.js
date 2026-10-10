// Live grand staff rendered by OpenSheetMusicDisplay; preserve piano spelling and input hooks.
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


const pianoLiveStaff=new CrescendoLiveStaff(document.getElementById('staffSvg'));
function drawBaseStaff(){renderStaffNotes();}
function drawKeySignature(){renderStaffNotes();}
function renderStaffNotes(){
  const midis=Object.keys(activeStaffNotes).map(Number).sort((a,b)=>a-b);
  const chord=midis.length>=2&&typeof identifyChord==='function'?identifyChord(midis):null;
  const notes=midis.map(midi=>{
    const n=spellStaffMidi(midi,chord);
    return {...n,alter:n.accidental,staff:diatonicStep(n.name,n.octave)>=0?1:2,label:n.label+n.glyph+n.octave};
  });
  const sig=currentSignature();
  pianoLiveStaff.update(notes,'grand',currentKeyPc===null?0:(sig.count||0)*(sig.type==='flat'?-1:1));
}
drawBaseStaff();
