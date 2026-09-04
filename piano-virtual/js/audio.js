// ---------- AUDIO ----------
let audioCtx = null;
let masterBus = null;
function ensureCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterBus = audioCtx.createGain();
    masterBus.gain.value = 1;
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-6, audioCtx.currentTime);
    limiter.knee.setValueAtTime(12, audioCtx.currentTime);
    limiter.ratio.setValueAtTime(8, audioCtx.currentTime);
    limiter.attack.setValueAtTime(0.003, audioCtx.currentTime);
    limiter.release.setValueAtTime(0.15, audioCtx.currentTime);
    masterBus.connect(limiter);
    limiter.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

const volumeSlider = document.getElementById('volume');
const sampleMap = new Map();
const activeSources = {};
let sfPlayer = null;
let sfLoading = false;

// ---------- SELECTOR DE INSTRUMENTO (SoundFont) ----------
const ICON_ACOUSTIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4c0 0 11-1.3 15.5 4C20.6 10 20 14 17 15.5H6c-1.7 0-3-1.6-3-3.5V5.3C3 4.7 3.4 4.2 4 4Z"/><line x1="6.5" y1="15.5" x2="6.5" y2="19"/><line x1="9.5" y1="15.5" x2="9.5" y2="19"/><line x1="12.5" y1="15.5" x2="12.5" y2="19"/></svg>';
const ICON_ELECTRIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="7" rx="1"/><line x1="6.5" y1="7" x2="6.5" y2="14"/><line x1="10" y1="7" x2="10" y2="14"/><line x1="13.5" y1="7" x2="13.5" y2="14"/><line x1="17" y1="7" x2="17" y2="14"/><line x1="6" y1="14" x2="4" y2="20"/><line x1="18" y1="14" x2="20" y2="20"/><line x1="4" y1="20" x2="20" y2="20"/></svg>';
const ICON_ORGAN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="15" width="18" height="4" rx="1"/><line x1="6" y1="4" x2="6" y2="9"/><line x1="10" y1="4" x2="10" y2="9"/><line x1="14" y1="4" x2="14" y2="9"/><line x1="18" y1="4" x2="18" y2="9"/></svg>';

const INSTRUMENTS = [
  { id: 'acoustic_grand_piano', label: 'Piano Acústico', icon: ICON_ACOUSTIC },
  { id: 'electric_piano_1', label: 'Piano Eléctrico (Rhodes)', icon: ICON_ELECTRIC },
  { id: 'electric_piano_2', label: 'Piano Eléctrico (Wurli)', icon: ICON_ELECTRIC },
  { id: 'drawbar_organ', label: 'Órgano', icon: ICON_ORGAN },
];
let currentInstrumentId = INSTRUMENTS[0].id;

const instrumentBox = document.getElementById('qsInstrumentBox');
const instrumentIconEl = document.getElementById('qsInstrumentIcon');
const instrumentNameEl = document.getElementById('qsInstrumentName');
const instrumentDropdown = document.getElementById('qsInstrumentDropdown');

function instrumentInfo(id) {
  return INSTRUMENTS.find(i => i.id === id) || INSTRUMENTS[0];
}

function setSourceIndicator(text, cls) {
  instrumentNameEl.textContent = text;
  instrumentBox.title = text + ' — clic para cambiar el sonido';
  instrumentBox.className = 'instrument-box' + (cls ? ' ' + cls : '');
}

INSTRUMENTS.forEach(inst => {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'instrument-item';
  item.dataset.value = inst.id;
  item.innerHTML = '<span class="instrument-icon">' + inst.icon + '</span><span>' + inst.label + '</span>';
  item.addEventListener('click', () => {
    closeAllQuickSelects();
    loadInstrument(inst.id);
  });
  instrumentDropdown.appendChild(item);
});
function syncInstrumentSelection() {
  instrumentDropdown.querySelectorAll('.instrument-item').forEach(item => {
    item.classList.toggle('selected', item.dataset.value === currentInstrumentId);
  });
}
instrumentBox.addEventListener('click', (e) => {
  e.stopPropagation();
  const willOpen = !instrumentDropdown.classList.contains('open');
  closeAllQuickSelects();
  if (willOpen) {
    instrumentBox.classList.add('open');
    instrumentDropdown.classList.add('open');
    instrumentBox.setAttribute('aria-expanded', 'true');
  }
});

function loadInstrument(id) {
  currentInstrumentId = id;
  instrumentIconEl.innerHTML = instrumentInfo(id).icon;
  syncInstrumentSelection();
  sfPlayer = null;
  sfLoading = true;
  setSourceIndicator('cargando…', '');
  const ctx = ensureCtx();
  Soundfont.instrument(ctx, id, { destination: masterBus })
    .then(instrument => {
      if (currentInstrumentId !== id) return; // el usuario cambió de instrumento mientras cargaba
      sfPlayer = instrument;
      sfLoading = false;
      if (sampleMap.size > 0) {
        setSourceIndicator('Samples personalizados', 'sample');
      } else {
        setSourceIndicator(instrumentInfo(id).label, 'sf');
      }
      if (DEBUG) console.log('SoundFont cargado:', id);
    })
    .catch(err => {
      if (currentInstrumentId !== id) return;
      sfLoading = false;
      if (sampleMap.size > 0) {
        setSourceIndicator('Samples personalizados', 'sample');
      } else {
        setSourceIndicator('Sintético (fallback)', 'osc');
      }
      console.warn('Error al cargar SoundFont, se usará oscilador:', err);
    });
}
instrumentIconEl.innerHTML = instrumentInfo(currentInstrumentId).icon;
function initSoundFont() {
  if (sfPlayer || sfLoading) return;
  loadInstrument(currentInstrumentId);
}
setTimeout(initSoundFont, 100);

// ---------- SUSTAIN ----------
let sustainOn = false;
const sustainedNotes = new Set();

function stopSoundNow(midi) {
  const ctx = ensureCtx();
  const now = ctx.currentTime;
  const entry = activeSources[midi];
  if (!entry) return;
  if (entry.type === 'sample') {
    const { source, gain } = entry;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    source.stop(now + 0.35);
  } else if (entry.type === 'sf') {
    if (entry.note && typeof entry.note.stop === 'function') {
      entry.note.stop(now);
    }
  } else if (entry.type === 'osc') {
    const { source, gain } = entry;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    source.stop(now + 0.4);
  }
  delete activeSources[midi];
  setKeyActive(midi, false);
  setStaffNote(midi, false);
  updateChordDisplay();
}

function releaseSustainedNotes() {
  sustainedNotes.forEach(midi => stopSoundNow(midi));
  sustainedNotes.clear();
}

function setSustain(on) {
  if (sustainOn === on) return;
  sustainOn = on;
  const dot = document.getElementById('sustainDot');
  if (dot) dot.classList.toggle('active', on);
  if (!on) releaseSustainedNotes();
}

// ---------- NOTE ON / OFF ----------
function noteOn(n, velocity = 127) {
  if (!isNoteInRange(n.midi)) return;
  if (sustainedNotes.has(n.midi)) {
    sustainedNotes.delete(n.midi);
    stopSoundNow(n.midi);
  }
  const ctx = ensureCtx();
  const now = ctx.currentTime;
  let vol = parseFloat(volumeSlider.value);
  if (isNaN(vol) || vol < 0) vol = 0.5;
  lastMidiVelocity = velocity;
  vol *= velocityGain(velocity);

  const sampleHit = findSampleForMidi(n.midi);
  const buffer = sampleHit ? sampleHit.buffer : null;
  if (buffer) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = sampleHit.rate;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.02);
    source.connect(gain).connect(masterBus);
    source.start(now);
    activeSources[n.midi] = { type: 'sample', source, gain };
    setKeyActive(n.midi, true);
    setStaffNote(n.midi, true);
    updateChordDisplay();
    return;
  }

  if (sfPlayer) {
    try {
      const sfNote = sfPlayer.play(n.midi, now, { gain: vol });
      if (sfNote) {
        activeSources[n.midi] = { type: 'sf', note: sfNote };
        setKeyActive(n.midi, true);
        setStaffNote(n.midi, true);
        updateChordDisplay();
        return;
      }
    } catch(e) {
      console.warn('Error al tocar nota con SoundFont:', e);
    }
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(n.freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.015);
  osc.connect(gain).connect(masterBus);
  osc.start(now);
  activeSources[n.midi] = { type: 'osc', source: osc, gain };
  setKeyActive(n.midi, true);
  setStaffNote(n.midi, true);
  updateChordDisplay();
}

function noteOff(n) {
  if (!isNoteInRange(n.midi)) return;
  if (!activeSources[n.midi]) return;
  if (sustainOn) {
    sustainedNotes.add(n.midi);
    return;
  }
  stopSoundNow(n.midi);
}

// ---------- FUNCIONES AUXILIARES ----------
function setKeyActive(midi, on) {
  const el = keyElByMidi[midi];
  if (el) el.classList.toggle('active', on);
}

function attachPointer(el, n) {
  let down = false;
  el.setAttribute('role','button'); el.setAttribute('tabindex','0'); el.setAttribute('aria-label',`${getNoteNames(currentLang,n.idx)} ${n.octave}`);
  const start = (e) => { e.preventDefault(); down = true; try{el.setPointerCapture(e.pointerId)}catch(_){} noteOn(n, 105); };
  const end = (e) => { if (down) { down = false; noteOff(n); } };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('lostpointercapture', end);
  el.addEventListener('keydown', e=>{ if((e.key==='Enter'||e.key===' ')&&!down){e.preventDefault();down=true;noteOn(n,105)} });
  el.addEventListener('keyup', e=>{ if((e.key==='Enter'||e.key===' ')&&down){e.preventDefault();down=false;noteOff(n)} });
}
