// ---------- MIDI ----------
const midiStatus = document.getElementById('midiStatus');
const midiStatusText = document.getElementById('midiStatusText');
const midiDeviceDropdown = document.getElementById('midiDeviceDropdown');
const sustainIndicator = document.getElementById('sustainIndicator');
sustainIndicator.addEventListener('click', () => { setSustain(!sustainOn); });
function setStatus(text, cls) {
  midiStatusText.textContent = text;
  midiStatus.classList.toggle('badge-on', cls === 'ok');
  midiStatus.title = text + ' · clic para seleccionar controlador';
}

let midiAccess = null;
const midiDeviceSelect = document.getElementById('midiDeviceSelect');
const velocityCurveSelect = document.getElementById('velocityCurve');
const velocityCurveBox = document.getElementById('velocityCurveBox');
const velocityCurveDropdown = document.getElementById('velocityCurveDropdown');
const velocityCurveText = document.getElementById('velocityCurveText');
const panicBtn = document.getElementById('panicBtn');

function closeIndicatorDropdown(box, dropdown){
  dropdown.classList.remove('open');
  box.setAttribute('aria-expanded','false');
}
function toggleIndicatorDropdown(e, box, dropdown){
  e.stopPropagation();
  const open=!dropdown.classList.contains('open');
  document.querySelectorAll('.indicator-dropdown.open').forEach(d=>d.classList.remove('open'));
  document.querySelectorAll('.indicator-button[aria-expanded="true"]').forEach(b=>b.setAttribute('aria-expanded','false'));
  if(open){dropdown.classList.add('open');box.setAttribute('aria-expanded','true')}
}
document.addEventListener('click',()=>{
  document.querySelectorAll('.indicator-dropdown.open').forEach(d=>d.classList.remove('open'));
  document.querySelectorAll('.indicator-button[aria-expanded="true"]').forEach(b=>b.setAttribute('aria-expanded','false'));
});

midiStatus.addEventListener('click',e=>toggleIndicatorDropdown(e,midiStatus,midiDeviceDropdown));
velocityCurveBox.addEventListener('click',e=>toggleIndicatorDropdown(e,velocityCurveBox,velocityCurveDropdown));

function renderVelocityMenu(){
  velocityCurveDropdown.innerHTML='';
  [...velocityCurveSelect.options].forEach(opt=>{
    const b=document.createElement('button');
    b.type='button'; b.className='quick-select-item'; b.dataset.value=opt.value;
    b.textContent=opt.textContent; b.classList.toggle('selected',opt.value===velocityCurveSelect.value);
    b.addEventListener('click',e=>{e.stopPropagation();velocityCurveSelect.value=opt.value;midiVelocityCurve=opt.value;velocityCurveText.textContent=opt.textContent;renderVelocityMenu();closeIndicatorDropdown(velocityCurveBox,velocityCurveDropdown);saveSettings()});
    velocityCurveDropdown.appendChild(b);
  });
  const selected=velocityCurveSelect.options[velocityCurveSelect.selectedIndex];
  velocityCurveText.textContent=selected?selected.textContent:'Velocidad normal';
}

function panic(){
  setSustain(false); sustainedNotes.clear();
  Object.keys(activeSources).map(Number).forEach(stopSoundNow);
  heldKeys.clear(); updateChordDisplay();
}
panicBtn.addEventListener('click', panic);
window.addEventListener('blur', panic);
document.addEventListener('visibilitychange', ()=>{if(document.hidden) panic()});
velocityCurveSelect.addEventListener('change',()=>{midiVelocityCurve=velocityCurveSelect.value;renderVelocityMenu();saveSettings()});
renderVelocityMenu();

function refreshMidiInputs(){
  if(!midiAccess) return;
  const previous=midiDeviceSelect.value||'all';
  midiDeviceSelect.innerHTML='<option value="all">Todos los MIDI</option>';
  const inputs=[...midiAccess.inputs.values()];
  inputs.forEach(input=>{const o=document.createElement('option');o.value=input.id;o.textContent=input.name||'Entrada MIDI';midiDeviceSelect.appendChild(o)});
  midiDeviceSelect.value=[...midiDeviceSelect.options].some(o=>o.value===previous)?previous:'all';
  midiDeviceDropdown.innerHTML='';
  const addChoice=(value,label,detail='')=>{
    const b=document.createElement('button');b.type='button';b.className='quick-select-item';b.dataset.value=value;
    b.innerHTML='<span>'+label+'</span>'+(detail?'<small>'+detail+'</small>':'');
    b.classList.toggle('selected',midiDeviceSelect.value===value);
    b.addEventListener('click',e=>{e.stopPropagation();midiDeviceSelect.value=value;refreshMidiInputs();closeIndicatorDropdown(midiStatus,midiDeviceDropdown)});
    midiDeviceDropdown.appendChild(b);
  };
  if(inputs.length){
    addChoice('all','Todos los MIDI',inputs.length===1?'1 controlador disponible':`${inputs.length} controladores disponibles`);
    inputs.forEach(input=>addChoice(input.id,input.name||'Entrada MIDI',input.manufacturer||''));
  }else{
    const empty=document.createElement('div');empty.className='quick-select-item';empty.style.cursor='default';empty.textContent='No hay controladores MIDI conectados';midiDeviceDropdown.appendChild(empty);
  }
  const selectedInput=inputs.find(i=>i.id===midiDeviceSelect.value);
  const statusLabel=inputs.length ? (selectedInput ? `MIDI: ${selectedInput.name||'conectado'}` : `MIDI: conectado${inputs.length>1?' ('+inputs.length+')':''}`) : 'MIDI: no conectado';
  setStatus(statusLabel,inputs.length?'ok':'');
  inputs.forEach(input=>{input.onmidimessage=msg=>{if(midiDeviceSelect.value==='all'||midiDeviceSelect.value===input.id) handleMIDIMessage(msg)}});
}
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(access => { midiAccess=access; refreshMidiInputs(); access.onstatechange=refreshMidiInputs; }).catch(() => setStatus('MIDI: error', 'err'));
} else setStatus('MIDI: no soportado', 'err');

function handleMIDIMessage(msg) {
  const [status, data1, data2] = msg.data; const cmd=status&0xf0;
  if(cmd===0xB0&&data1===64){recordMidiEvent('sustain',{on:data2>=64,value:data2});setSustain(data2>=64);return}
  const note=data1,vel=data2; if(note<21||note>108||!isNoteInRange(note)) return; const n=midiToInfo(note);
  if(cmd===0x90&&vel>0){recordMidiEvent('on',{note,velocity:vel});phase3TutorMidiNote(note,vel);noteOn(n,vel)} else if(cmd===0x80||(cmd===0x90&&vel===0)){recordMidiEvent('off',{note,velocity:vel});noteOff(n)};
}


// ---------- GRABACIÓN MIDI (FASE 2) ----------
let midiRecording=false,midiRecordStart=0,midiRecordedEvents=[],midiPlaybackTimers=[];
function recordMidiEvent(type,data){if(!midiRecording)return;midiRecordedEvents.push({t:performance.now()-midiRecordStart,type,...data})}
function startMidiRecording(){stopMidiRecordedPlayback();midiRecordedEvents=[];midiRecording=true;midiRecordStart=performance.now();document.getElementById('midiRecordBtn').classList.add('recording');studyStatus.textContent='Grabando MIDI…'}
function stopMidiRecording(){if(midiRecording){midiRecording=false;document.getElementById('midiRecordBtn').classList.remove('recording');studyStatus.textContent=`Grabación: ${midiRecordedEvents.length} eventos`}}
function stopMidiRecordedPlayback(){midiPlaybackTimers.forEach(clearTimeout);midiPlaybackTimers=[];panic();}
function playMidiRecording(){if(!midiRecordedEvents.length){studyStatus.textContent='No hay grabación MIDI';return}stopMidiRecording();stopMidiRecordedPlayback();studyStatus.textContent='Reproduciendo grabación';midiRecordedEvents.forEach(ev=>{midiPlaybackTimers.push(setTimeout(()=>{if(ev.type==='on')noteOn(midiToInfo(ev.note),ev.velocity);else if(ev.type==='off')noteOff(midiToInfo(ev.note));else if(ev.type==='sustain')setSustain(ev.on)},ev.t))});const end=Math.max(...midiRecordedEvents.map(e=>e.t),0)+700;midiPlaybackTimers.push(setTimeout(()=>{panic();studyStatus.textContent='Grabación lista'},end))}
document.getElementById('midiRecordBtn').addEventListener('click',startMidiRecording);document.getElementById('midiRecordStopBtn').addEventListener('click',()=>{stopMidiRecording();stopMidiRecordedPlayback()});document.getElementById('midiRecordPlayBtn').addEventListener('click',playMidiRecording);

// ---------- TECLADO FÍSICO ----------
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (keyMap[k] !== undefined && !heldKeys.has(k)) {
    const midi = keyMap[k];
    if (isNoteInRange(midi)) {
      heldKeys.add(k);
      noteOn(midiToInfo(midi));
    }
  }
});
window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (keyMap[k] !== undefined) {
    heldKeys.delete(k);
    const midi = keyMap[k];
    if (isNoteInRange(midi)) {
      noteOff(midiToInfo(midi));
    }
  }
});

// ---------- CONTROL DE VOLUMEN CON TECLAS ----------
function adjustVolume(delta) {
  const maxVol = parseFloat(volumeSlider.max) || 1;
  const minVol = parseFloat(volumeSlider.min) || 0;
  let newVal = parseFloat(volumeSlider.value) + delta;
  newVal = Math.min(maxVol, Math.max(minVol, newVal));
  volumeSlider.value = newVal;
  volumeSlider.dispatchEvent(new Event('input'));
  const vol = newVal;
  for (const midi in activeSources) {
    const entry = activeSources[midi];
    if (entry.type === 'sample' || entry.type === 'osc') {
      if (entry.gain) {
        const now = audioCtx ? audioCtx.currentTime : 0;
        entry.gain.gain.cancelScheduledValues(now);
        entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
        entry.gain.gain.linearRampToValueAtTime(vol, now + 0.02);
      }
    }
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const delta = e.key === 'ArrowUp' ? 0.05 : -0.05;
    adjustVolume(delta);
    return;
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!osmd || !osmd.cursor) return;
    e.preventDefault();
    if (e.key === 'ArrowRight') stepForward();
    else stepBackward();
    return;
  }
  if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    if (!osmd || !osmd.cursor) return;
    e.preventDefault();
    if (scorePlaying) pausePlayback();
    else playFromCurrentPosition();
  }
});

// ---------- COLOR DE TECLAS (caja + desplegable con muestras) ----------
const colorInput = document.getElementById('activeColor');
const COLOR_PRESETS = [
  { hex: '#66b3ff', name: 'Azul' },
  { hex: '#ff6e6e', name: 'Rojo' },
  { hex: '#7fe0a0', name: 'Verde' },
  { hex: '#ffce54', name: 'Ámbar' },
  { hex: '#d18fff', name: 'Violeta' },
  { hex: '#ff8fc7', name: 'Rosa' },
  { hex: '#7fdbe0', name: 'Turquesa' },
  { hex: '#f2f2f2', name: 'Blanco' },
];
const qsColorBox = document.getElementById('qsColorBox');
const qsColorSwatch = document.getElementById('qsColorSwatch');
const qsColorValue = document.getElementById('qsColorValue');
const qsColorDropdown = document.getElementById('qsColorDropdown');

function applyActiveColor(hex, name) {
  document.documentElement.style.setProperty('--active-color', hex);
  colorInput.value = hex;
  qsColorSwatch.style.background = hex;
  qsColorValue.textContent = name;
  qsColorDropdown.querySelectorAll('.color-swatch-item[data-hex]').forEach(item => {
    item.classList.toggle('selected', item.dataset.hex.toLowerCase() === hex.toLowerCase());
  });
}

COLOR_PRESETS.forEach(preset => {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'color-swatch-item';
  item.dataset.hex = preset.hex;
  item.innerHTML = '<span class="color-swatch" style="background:' + preset.hex + '"></span><span>' + preset.name + '</span>';
  item.addEventListener('click', () => {
    applyActiveColor(preset.hex, preset.name);
    closeAllQuickSelects();
  });
  qsColorDropdown.appendChild(item);
});
const customItem = document.createElement('button');
customItem.type = 'button';
customItem.className = 'color-swatch-item custom-trigger';
customItem.innerHTML = '<span class="color-swatch"></span><span>Personalizado…</span>';
customItem.addEventListener('click', () => {
  closeAllQuickSelects();
  colorInput.click();
});
qsColorDropdown.appendChild(customItem);

colorInput.addEventListener('input', () => {
  applyActiveColor(colorInput.value, 'Personalizado');
});
qsColorBox.addEventListener('click', (e) => {
  e.stopPropagation();
  const willOpen = !qsColorDropdown.classList.contains('open');
  closeAllQuickSelects();
  if (willOpen) {
    qsColorBox.classList.add('open');
    qsColorDropdown.classList.add('open');
    qsColorBox.setAttribute('aria-expanded', 'true');
  }
});
applyActiveColor(colorInput.value, 'Azul');

// ---------- SAMPLES ----------
let lastSampleReport={recognized:[],unrecognized:[],decodeErrors:[]};
function findSampleForMidi(midi){
  if(sampleMap.has(midi)) return {buffer:sampleMap.get(midi),sourceMidi:midi,rate:1,exact:true};
  if(!sampleMap.size) return null;
  let best=null,dist=Infinity; for(const [sourceMidi,buffer] of sampleMap.entries()){const d=Math.abs(sourceMidi-midi);if(d<dist){dist=d;best={buffer,sourceMidi,rate:Math.pow(2,(midi-sourceMidi)/12),exact:false}}}
  return dist<=6?best:null;
}
function buildSampleCoverage(){let playable=0,exact=0;const missing=[];for(let m=21;m<=108;m++){const h=findSampleForMidi(m);if(h){playable++;if(h.exact)exact++}else missing.push(m)}return{playable,exact,missing}}
function midiLabel(m){const n=midiToInfo(m);return `${n.name}${n.octave}`}
function renderSampleReport(){
  const panel=document.getElementById('sampleReportPanel'),body=document.getElementById('sampleReportBody'); const c=buildSampleCoverage();
  const missing=c.missing.map(midiLabel); const bad=lastSampleReport.unrecognized; const errors=lastSampleReport.decodeErrors;
  body.innerHTML=`<div class="sample-report-grid"><div class="practice-kpi"><strong>${sampleMap.size}</strong><span>samples exactos cargados</span></div><div class="practice-kpi"><strong>${c.playable}/88</strong><span>teclas reproducibles</span></div><div class="practice-kpi"><strong>${missing.length}</strong><span>sin cobertura ±6 st</span></div></div><p style="font-size:.74rem;color:var(--muted)">Cuando falta una nota exacta, se usa el sample cargado más cercano hasta ±6 semitonos ajustando <em>playbackRate</em>. Los samples exactos siempre tienen prioridad.</p><div class="sample-report-list"><strong>Sin cobertura:</strong> ${missing.length?missing.join(', '):'ninguna'}<br><strong>Nombres no reconocidos:</strong> ${bad.length?bad.join(', '):'ninguno'}<br><strong>Error al decodificar:</strong> ${errors.length?errors.join(', '):'ninguno'}</div>`;
  panel.hidden=false;
}
async function loadSamplesFromFolder(files) {
  const ctx = ensureCtx();
  const loaded = []; lastSampleReport={recognized:[],unrecognized:[],decodeErrors:[]};
  const pattern = /(?:^|[^A-G])([A-G])([#b]?)(-?\d+)/i; const basePc={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  for (const file of files) {
    const match = file.name.match(pattern);
    if (!match) { lastSampleReport.unrecognized.push(file.name); continue; }
    const note = match[1].toUpperCase(), accidental=match[2]||'', octave=parseInt(match[3],10);
    let pc=basePc[note]+(accidental==='#'?1:accidental==='b'?-1:0);pc=(pc+12)%12;const midi=(octave+1)*12+pc;
    const info=allNotes.find(n=>n.midi===midi);
    if (!info) { lastSampleReport.unrecognized.push(file.name); continue; }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      sampleMap.set(info.midi, audioBuffer);
      loaded.push(info.midi); lastSampleReport.recognized.push(file.name);
    } catch(e) {
      lastSampleReport.decodeErrors.push(file.name);
      console.warn('Error al cargar sample:', file.name, e);
    }
  }
  updateSampleStatus();
  if (sampleMap.size > 0) setSourceIndicator('Samples personalizados', 'sample');
  else if (sfPlayer) setSourceIndicator(instrumentInfo(currentInstrumentId).label, 'sf');
  else setSourceIndicator('Sintético (fallback)', 'osc');
  return loaded;
}

function updateSampleStatus() {
  const statusEl = document.getElementById('sampleStatus');
  const statusTextEl = document.getElementById('sampleStatusText');
  const clearBtn = document.getElementById('sampleClearBtn');
  if (sampleMap.size === 0) {
    statusTextEl.textContent = 'sin samples';
    statusEl.className = 'icon-badge';
    statusEl.title = 'Sin samples cargados — clic para elegir una carpeta de samples de audio';
    if (clearBtn) clearBtn.classList.remove('visible'); const rb=document.getElementById('sampleReportBtn'); if(rb) rb.classList.remove('visible');
  } else {
    const coverage=buildSampleCoverage(); statusTextEl.textContent = `${sampleMap.size} samples · ${coverage.playable}/88 cobertura`;
    statusEl.className = 'icon-badge badge-on';
    statusEl.title = `${sampleMap.size} samples cargados — clic para elegir otra carpeta`;
    if (clearBtn) clearBtn.classList.add('visible'); const rb=document.getElementById('sampleReportBtn'); if(rb) rb.classList.add('visible');
  }
}

const folderInput = document.getElementById('sampleFolder');
folderInput.addEventListener('change', async function(e) {
  const files = this.files;
  if (files.length === 0) return;
  const loaded = await loadSamplesFromFolder(files);
  if (loaded.length === 0) {
    alert('No se encontraron archivos de audio con nombres de nota válidos (ej. C4.wav, F#5.mp3).');
  }
  this.value = '';
});

const sampleClearBtn = document.getElementById('sampleClearBtn');
sampleClearBtn.addEventListener('click', function() {
  sampleMap.clear();
  updateSampleStatus();
  if (sfPlayer) setSourceIndicator(instrumentInfo(currentInstrumentId).label, 'sf');
  else if (sfLoading) setSourceIndicator('cargando…', '');
  else setSourceIndicator('Sintético (fallback)', 'osc');
  folderInput.value = '';
});
const sampleReportBtn=document.getElementById('sampleReportBtn'), sampleReportPanel=document.getElementById('sampleReportPanel');
sampleReportBtn.addEventListener('click',renderSampleReport);
document.getElementById('sampleReportClose').addEventListener('click',()=>sampleReportPanel.hidden=true);
