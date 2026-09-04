// Bandera de depuración: los console.warn/console.error de los bloques
// catch se mantienen siempre activos (son útiles para diagnosticar fallas
// reportadas por usuarios); solo los console.log puramente informativos
// se silencian en producción y se activan poniendo DEBUG en true.
const DEBUG = false;

// ---------- DETECCIÓN DE SISTEMA OPERATIVO ----------
const ua = navigator.userAgent.toLowerCase();
const isMac = /macintosh|mac os x/.test(ua);
// Parámetros para la clave de sol según el SO
const clefOffsetY = isMac ? 31 : 118;
const clefScale = isMac ? 1.5 : 0.95;
const CLEF_Y_SHIFT = -20;   // Ajusta este valor (positivo = bajar)

// ---------- CONSTANTES Y UTILIDADES ----------
const NOTE_NAMES_EN = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const NOTE_NAMES_ES = ["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];
// Nombres de solfeo (notas naturales, incluyendo la sensible "Ti" para evitar
// ambigüedad con el "Si" que se usa como alteración ascendente de Sol)
const SOLFEO_NATURAL = ["Do", null, "Re", null, "Mi", "Fa", null, "Sol", null, "La", null, "Ti"];
// Sílabas de solfeo para las notas alteradas (teclas negras): arriba = ascendente, abajo = descendente
const SOLFEO_SHARP = { 1:"Di", 3:"Ri", 6:"Fi", 8:"Si", 10:"Li" };
const SOLFEO_FLAT  = { 1:"Ra", 3:"Me", 6:"Se", 8:"Le", 10:"Te" };

function getNoteNames(lang, idx) {
  if (lang === 'es') {
    return NOTE_NAMES_ES[idx] || '?';
  }
  return NOTE_NAMES_EN[idx];
}

function midiToInfo(m){
  const idx = m % 12;
  const octave = Math.floor(m/12) - 1;
  const name = NOTE_NAMES_EN[idx];
  const isBlack = name.includes('#');
  return {midi:m, name, octave, isBlack, freq: 440 * Math.pow(2,(m-69)/12), idx};
}

function diatonicStep(name, octave){
  const letter = name.charAt(0);
  const map = {C:0,D:1,E:2,F:3,G:4,A:5,B:6};
  return (octave-4)*7 + map[letter];
}

const RANGES = {
  beginner: { min: 48, max: 83 },
  intermediate: { min: 36, max: 95 },
  pro: { min: 21, max: 108 }
};

// ---------- ESTADO GLOBAL ----------
let currentMode = 'beginner';
let currentScaleMode = 'major';
let midiVelocityCurve = 'normal';
let lastMidiVelocity = 127;
let currentDisplay = 'mostrar';
// Idioma de los nombres de nota: independiente del modo Beginner/Pro,
// controlado por el selector #noteLang (antes iba atado a currentMode).
let currentLang = 'es';
let currentMidiRange = { min: 48, max: 83 };
let keyElByMidi = {};
let allNotes = [];
let showHandLeft = false;
let showHandRight = false;
let currentKeyPc = null; // pitch-class (0-11) de la tonalidad elegida, o null si no hay ninguna

// ---------- DOM REFS ----------
const keyboardEl = document.getElementById('keyboard');
const modeBeginnerBtn = document.getElementById('modeBeginnerBtn');
const modeIntermediateBtn = document.getElementById('modeIntermediateBtn');
const modeProBtn = document.getElementById('modeProBtn');
const noteDisplaySelect = document.getElementById('noteDisplay');
const noteLangSelect = document.getElementById('noteLang');
const keySelect = document.getElementById('keySelect');
const keyModeSelect = document.getElementById('keyMode');

// ---------- SELECTORES RÁPIDOS (caja + desplegable, estilo metrónomo) ----------
// Construye el desplegable a partir de las <option> del <select> oculto
// correspondiente, así el <select> sigue siendo la única fuente de verdad
// y todo el código existente (addEventListener('change', ...) y las
// asignaciones directas de .value) sigue funcionando sin cambios: solo
// hay que llamar a .sync() después de cada asignación directa.
function initQuickSelect(select, box, valueEl, dropdown) {
  function labelFor(val) {
    const opt = Array.from(select.options).find(o => o.value === val);
    return opt ? opt.textContent : '';
  }
  function sync() {
    valueEl.textContent = labelFor(select.value);
    dropdown.querySelectorAll('.quick-select-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.value === select.value);
    });
  }
  Array.from(select.options).forEach(opt => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'quick-select-item';
    item.setAttribute('role', 'option');
    item.dataset.value = opt.value;
    item.textContent = opt.textContent;
    item.addEventListener('click', () => {
      select.value = opt.value;
      sync();
      closeAllQuickSelects();
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    dropdown.appendChild(item);
  });
  box.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !dropdown.classList.contains('open');
    closeAllQuickSelects();
    if (willOpen) {
      box.classList.add('open');
      dropdown.classList.add('open');
      box.setAttribute('aria-expanded', 'true');
    }
  });
  sync();
  return { sync };
}
function closeAllQuickSelects() {
  document.querySelectorAll('.quick-select-box.open').forEach(b => {
    b.classList.remove('open');
    b.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.quick-select-dropdown.open').forEach(d => d.classList.remove('open'));
}
document.addEventListener('click', closeAllQuickSelects);

const qsNotes = initQuickSelect(noteDisplaySelect, document.getElementById('qsNotesBox'), document.getElementById('qsNotesValue'), document.getElementById('qsNotesDropdown'));
const qsLang = initQuickSelect(noteLangSelect, document.getElementById('qsLangBox'), document.getElementById('qsLangValue'), document.getElementById('qsLangDropdown'));
const qsKey = initQuickSelect(keySelect, document.getElementById('qsKeyBox'), document.getElementById('qsKeyValue'), document.getElementById('qsKeyDropdown'));
const qsMode = initQuickSelect(keyModeSelect, document.getElementById('qsModeBox'), document.getElementById('qsModeValue'), document.getElementById('qsModeDropdown'));

// Mantiene el selector de tonalidad en el mismo sistema de nombres elegido para las notas.
// Español: Do, Re♭, Re... · Inglés: C, Db, D...
const KEY_LABELS_BY_LANG = {
  es: ['Do','Re♭','Re','Mi♭','Mi','Fa','Fa♯','Sol','La♭','La','Si♭','Si'],
  en: ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B']
};
function updateKeyLanguage(){
  const labels = KEY_LABELS_BY_LANG[currentLang] || KEY_LABELS_BY_LANG.es;
  Array.from(keySelect.options).forEach((opt, i) => {
    if (i === 0) return;
    opt.textContent = labels[i - 1];
  });
  document.querySelectorAll('#qsKeyDropdown .quick-select-item').forEach(item => {
    if (item.dataset.value === '') return;
    const pc = Number(item.dataset.value);
    if (Number.isInteger(pc) && labels[pc]) item.textContent = labels[pc];
  });
  qsKey.sync();
}
const handLeftBtn = document.getElementById('handLeftBtn');
const handRightBtn = document.getElementById('handRightBtn');
const hintText = document.getElementById('hintText');

const chordNameEl = document.getElementById('chordName');
const chordSubEl = document.getElementById('chordSub');

// ---------- PERSISTENCIA SEGURA ----------
const SETTINGS_KEY = 'pianoVirtual_settings_v2';
function readSettings(){ try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{}}catch(e){return {}} }
function saveSettings(){
  try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify({mode:currentMode,display:currentDisplay,lang:currentLang,key:keySelect.value,keyMode:currentScaleMode,color:document.getElementById('activeColor').value,volume:document.getElementById('volume').value,hands:[showHandLeft,showHandRight],instrument:currentInstrumentId||'acoustic_grand_piano',velocityCurve:midiVelocityCurve,metroBpm:document.getElementById('metroBpm')?.value||80,metroMeter:document.getElementById('metroMeter')?.value||4,metroPulse:document.getElementById('metroPulse')?.value||'auto',scoreHandMode:document.getElementById('scoreHandMode')?.value||'both',scoreCountIn:document.getElementById('scoreCountIn')?.value||'1',scoreMetroSync:!!document.getElementById('scoreMetroSync')?.checked,scoreLoopRepeats:document.getElementById('scoreLoopRepeats')?.value||'0',scoreAutoTempoStep:document.getElementById('scoreAutoTempoStep')?.value||'0',scoreAutoTempoEvery:document.getElementById('scoreAutoTempoEvery')?.value||'3',tutorMode:document.getElementById('tutorMode')?.value||'off',tutorHand:document.getElementById('tutorHand')?.value||'right'})) }catch(e){}
}
const savedSettings = readSettings();

const MODE_INTERVALS = {major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],locrian:[0,1,3,5,6,8,10]};
const MODE_TO_REL_MAJOR = {major:0,minor:3,dorian:10,phrygian:8,lydian:7,mixolydian:5,locrian:1};
const PC_NAMES_SHARP=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const PC_NAMES_FLAT=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
function currentSignature(){
  if(currentKeyPc===null) return {type:null,count:0};
  const majorPc=(currentKeyPc+(MODE_TO_REL_MAJOR[currentScaleMode]||0))%12;
  const map={0:{type:null,count:0},7:{type:'sharp',count:1},2:{type:'sharp',count:2},9:{type:'sharp',count:3},4:{type:'sharp',count:4},11:{type:'sharp',count:5},6:{type:'sharp',count:6},1:{type:'flat',count:5},8:{type:'flat',count:4},3:{type:'flat',count:3},10:{type:'flat',count:2},5:{type:'flat',count:1}};
  return map[majorPc]||{type:null,count:0};
}
function formatPc(pc){ return (currentSignature().type==='flat'?PC_NAMES_FLAT:PC_NAMES_SHARP)[((pc%12)+12)%12]; }
function velocityGain(velocity){
  const x=Math.max(1,Math.min(127,velocity||127))/127;
  if(midiVelocityCurve==='fixed') return .82;
  if(midiVelocityCurve==='soft') return .45+.55*Math.sqrt(x);
  if(midiVelocityCurve==='dynamic') return Math.pow(x,1.65);
  return Math.pow(x,1.15);
}

// ---------- CONSTRUCCIÓN DEL TECLADO ----------
// División convencional mano izquierda / mano derecha: Do central (MIDI 60)
// en adelante es mano derecha; por debajo, mano izquierda. Es una referencia
// pedagógica general (método de piano estándar), no una regla absoluta.
const HAND_SPLIT_MIDI = 60;
function handClassFor(midi) {
  return midi < HAND_SPLIT_MIDI ? 'hand-left' : 'hand-right';
}

function buildKeyboard(minMidi, maxMidi) {
  keyboardEl.innerHTML = '';
  keyboardEl.classList.toggle('beginner-mode', currentMode === 'beginner');
  keyboardEl.classList.toggle('show-hand-left', showHandLeft);
  keyboardEl.classList.toggle('show-hand-right', showHandRight);
  keyElByMidi = {};
  const notes = [];
  for (let m = minMidi; m <= maxMidi; m++) {
    notes.push(midiToInfo(m));
  }
  allNotes = notes;

  const whiteNotes = notes.filter(n => !n.isBlack);
  const WHITE_COUNT = whiteNotes.length;
  const whiteWidthPct = 100 / WHITE_COUNT;
  const blackWidthPct = whiteWidthPct * 0.58;

  let whiteIndex = 0;
  notes.forEach(n => {
    if (n.isBlack) return;
    const el = document.createElement('div');
    el.className = 'white-key ' + handClassFor(n.midi);
    el.style.left = (whiteIndex * whiteWidthPct) + '%';
    el.style.width = whiteWidthPct + '%';
    el.dataset.midi = n.midi;
    const label = document.createElement('div');
    label.className = 'label';
    el.appendChild(label);
    keyboardEl.appendChild(el);
    keyElByMidi[n.midi] = el;
    attachPointer(el, n);
    whiteIndex++;
  });

  let wi = 0;
  notes.forEach(n => {
    if (!n.isBlack) { wi++; return; }
    const el = document.createElement('div');
    el.className = 'black-key ' + handClassFor(n.midi);
    const left = wi * whiteWidthPct - blackWidthPct / 2;
    el.style.left = left + '%';
    el.style.width = blackWidthPct + '%';
    el.dataset.midi = n.midi;
    const label = document.createElement('div');
    label.className = 'label';
    el.appendChild(label);
    keyboardEl.appendChild(el);
    keyElByMidi[n.midi] = el;
    attachPointer(el, n);
  });

  updateLabels();
  updateHint();
  updateChordDisplay();
}

function updateLabels() {
  const display = currentDisplay;
  const lang = currentLang;
  const isSolfeo = (display === 'solfeo');

  for (const midi in keyElByMidi) {
    const el = keyElByMidi[midi];
    const labelDiv = el.querySelector('.label');
    if (!labelDiv) continue;
    const m = parseInt(midi);
    const info = midiToInfo(m);
    const idx = info.idx;

    if (display === 'ocultar') {
      labelDiv.innerHTML = '';
      continue;
    }

    if (info.isBlack) {
      let topName, bottomName;
      if (isSolfeo) {
        // solfeo: sílabas de alteración (Di/Ra, Ri/Me, Fi/Se, Si/Le, Li/Te)
        topName = SOLFEO_SHARP[idx] || '';
        bottomName = SOLFEO_FLAT[idx] || '';
      } else {
        topName = getNoteNames(lang, idx);
        if (topName.includes('#')) {
          bottomName = getNoteNames(lang, (idx+1)%12) + 'b';
        } else {
          bottomName = '';
        }
      }
      labelDiv.innerHTML = topName + '<br>' + bottomName;
    } else {
      let text = getNoteNames(lang, idx);
      if (isSolfeo) {
        // Para solfeo usar las sílabas naturales (Do, Re, Mi, Fa, Sol, La, Ti)
        text = SOLFEO_NATURAL[idx] || '';
      }
      labelDiv.textContent = text;
    }
  }
}

function updateHint() {
  const mode = currentMode;
  const modeName = mode==='beginner'?'Principiante (3 octavas: C3–B5)':mode==='intermediate'?'Intermedio (5 octavas: C2–B6)':'Pro (88 teclas)';
  hintText.innerHTML = `Modo ${modeName} · Clic/touch para tocar · Teclado: <kbd>A S D F G H J K</kbd> blancas y <kbd>W E T Y U</kbd> negras · MIDI · Sonido: SoundFont de piano acústico · Volumen: flechas <kbd>↑</kbd> <kbd>↓</kbd>`;
}

// ---------- EVENTOS DE TECLADO FÍSICO ----------
const keyMap = { a:60, w:61, s:62, e:63, d:64, f:65, t:66, g:67, y:68, h:69, u:70, j:71, k:72 };
const heldKeys = new Set();

function isNoteInRange(midi) {
  return midi >= currentMidiRange.min && midi <= currentMidiRange.max;
}
