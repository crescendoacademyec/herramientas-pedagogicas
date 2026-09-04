// ---------- PARTITURA (PDF, MUSICXML, IMAGEN) ----------
const pdfUpload = document.getElementById('pdfUpload');
const pdfViewer = document.getElementById('pdfViewer');
const pdfClearBtn = document.getElementById('pdfClearBtn');
const webViewer = document.getElementById('webViewer');
const webUrlInput = document.getElementById('webUrlInput');
const webLoadBtn = document.getElementById('webLoadBtn');
const webOpenNewTabBtn = document.getElementById('webOpenNewTabBtn');
const webClearBtn = document.getElementById('webClearBtn');
const webLoadNote = document.getElementById('webLoadNote');
const osmdContainer = document.getElementById('osmdContainer');
const imageContainer = document.getElementById('imageContainer');
const imageViewer = document.getElementById('imageViewer');
const scorePlayControls = document.getElementById('scorePlayControls');
const scorePlayBtn = document.getElementById('scorePlayBtn');
const scorePauseBtn = document.getElementById('scorePauseBtn');
const scoreStopBtn = document.getElementById('scoreStopBtn');
const scorePrevBtn = document.getElementById('scorePrevBtn');
const scoreNextBtn = document.getElementById('scoreNextBtn');
const scoreTempoInput = document.getElementById('scoreTempo');
const scoreTempoDown = document.getElementById('scoreTempoDown');
const scoreTempoUp = document.getElementById('scoreTempoUp');
function adjustScoreTempo(delta) {
  const min = parseInt(scoreTempoInput.min) || 20;
  const max = parseInt(scoreTempoInput.max) || 300;
  const current = parseInt(scoreTempoInput.value) || 100;
  const next = Math.min(max, Math.max(min, current + delta));
  scoreTempoInput.value = next;
  scoreTempoInput.dispatchEvent(new Event('change'));
}
scoreTempoDown.addEventListener('click', () => adjustScoreTempo(-1));
scoreTempoUp.addEventListener('click', () => adjustScoreTempo(1));
scoreTempoInput.addEventListener('change',()=>{scoreTempoInput.value=Math.max(20,Math.min(300,+scoreTempoInput.value||100));if(scoreMetroSync&&scoreMetroSync.checked)metroBpm.value=scoreTempoInput.value;});
const scoreZoomInBtn = document.getElementById('scoreZoomInBtn');
const scoreZoomOutBtn = document.getElementById('scoreZoomOutBtn');
const scoreLoopStartBtn = document.getElementById('scoreLoopStartBtn');
const scoreLoopEndBtn = document.getElementById('scoreLoopEndBtn');
const scoreLoopBtn = document.getElementById('scoreLoopBtn');
const scoreLoopClearBtn = document.getElementById('scoreLoopClearBtn');
const scoreStatus = document.getElementById('scoreStatus');
const scoreHandMode=document.getElementById('scoreHandMode'),scoreCountIn=document.getElementById('scoreCountIn'),scoreMetroSync=document.getElementById('scoreMetroSync');
const scoreLoopRepeats=document.getElementById('scoreLoopRepeats'),scoreAutoTempoStep=document.getElementById('scoreAutoTempoStep'),scoreAutoTempoEvery=document.getElementById('scoreAutoTempoEvery'),studyStatus=document.getElementById('studyStatus');
const tutorMode=document.getElementById('tutorMode'),tutorHand=document.getElementById('tutorHand'),tutorLiveStatus=document.getElementById('tutorLiveStatus');
let currentScoreName='Sin partitura'; let scoreStartedMetro=false; let loopCompletedCount=0; let countInTimerIds=[];

let currentPdfUrl = null;
let currentImageUrl = null;
let osmd = null;

// Estado de zoom/pan de imagen
let imageScale = 1, imageTranslateX = 0, imageTranslateY = 0;
let isImageDragging = false;
let dragStartX = 0, dragStartY = 0;
let dragStartTranslateX = 0, dragStartTranslateY = 0;

function updateImageTransform() {
  imageViewer.style.transform = `translate(${imageTranslateX}px, ${imageTranslateY}px) scale(${imageScale})`;
}
function resetImageTransform() {
  imageScale = 1; imageTranslateX = 0; imageTranslateY = 0;
  updateImageTransform();
}

function setupImageControls() {
  imageContainer.addEventListener('wheel', function(e) {
    if (imageContainer.style.display === 'none') return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const rect = imageContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const newScale = Math.min(5, Math.max(0.2, imageScale + delta));
    if (newScale === imageScale) return;
    const ratio = newScale / imageScale;
    imageTranslateX = mouseX - (mouseX - imageTranslateX) * ratio;
    imageTranslateY = mouseY - (mouseY - imageTranslateY) * ratio;
    imageScale = newScale;
    updateImageTransform();
  }, { passive: false });

  imageContainer.addEventListener('mousedown', function(e) {
    if (imageContainer.style.display === 'none') return;
    if (e.button !== 0) return;
    isImageDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTranslateX = imageTranslateX;
    dragStartTranslateY = imageTranslateY;
    imageContainer.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', function(e) {
    if (!isImageDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    imageTranslateX = dragStartTranslateX + dx;
    imageTranslateY = dragStartTranslateY + dy;
    updateImageTransform();
  });

  window.addEventListener('mouseup', function(e) {
    if (isImageDragging) {
      isImageDragging = false;
      imageContainer.style.cursor = 'grab';
    }
  });

  // Touch
  let lastTouchDist = 0;
  let touchStartX = 0, touchStartY = 0;
  let touchStartTranslateX = 0, touchStartTranslateY = 0;
  let touchStartScale = 1;

  imageContainer.addEventListener('touchstart', function(e) {
    if (imageContainer.style.display === 'none') return;
    const touches = e.touches;
    if (touches.length === 1) {
      isImageDragging = true;
      touchStartX = touches[0].clientX;
      touchStartY = touches[0].clientY;
      touchStartTranslateX = imageTranslateX;
      touchStartTranslateY = imageTranslateY;
    } else if (touches.length === 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      lastTouchDist = Math.sqrt(dx*dx + dy*dy);
      touchStartScale = imageScale;
      touchStartTranslateX = imageTranslateX;
      touchStartTranslateY = imageTranslateY;
      const midX = (touches[0].clientX + touches[1].clientX) / 2;
      const midY = (touches[0].clientY + touches[1].clientY) / 2;
      const rect = imageContainer.getBoundingClientRect();
      touchStartX = midX - rect.left;
      touchStartY = midY - rect.top;
    }
    e.preventDefault();
  }, { passive: false });

  imageContainer.addEventListener('touchmove', function(e) {
    if (imageContainer.style.display === 'none') return;
    const touches = e.touches;
    if (touches.length === 1 && isImageDragging) {
      const dx = touches[0].clientX - touchStartX;
      const dy = touches[0].clientY - touchStartY;
      imageTranslateX = touchStartTranslateX + dx;
      imageTranslateY = touchStartTranslateY + dy;
      updateImageTransform();
      e.preventDefault();
    } else if (touches.length === 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const scaleFactor = dist / lastTouchDist;
      const newScale = Math.min(5, Math.max(0.2, touchStartScale * scaleFactor));
      const rect = imageContainer.getBoundingClientRect();
      const midX = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
      const midY = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
      const ratio = newScale / touchStartScale;
      imageTranslateX = midX - (midX - touchStartTranslateX) * ratio;
      imageTranslateY = midY - (midY - touchStartTranslateY) * ratio;
      imageScale = newScale;
      updateImageTransform();
      e.preventDefault();
    }
  }, { passive: false });

  imageContainer.addEventListener('touchend', function(e) {
    isImageDragging = false;
  });
}
setupImageControls();

// Atajos de teclado para zoom de imagen
window.addEventListener('keydown', function(e) {
  if (imageContainer.style.display === 'none') return;
  const tag = e.target && e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    const rect = imageContainer.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const newScale = Math.min(5, imageScale + 0.1);
    if (newScale === imageScale) return;
    const ratio = newScale / imageScale;
    imageTranslateX = cx - (cx - imageTranslateX) * ratio;
    imageTranslateY = cy - (cy - imageTranslateY) * ratio;
    imageScale = newScale;
    updateImageTransform();
  } else if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    const rect = imageContainer.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const newScale = Math.max(0.2, imageScale - 0.1);
    if (newScale === imageScale) return;
    const ratio = newScale / imageScale;
    imageTranslateX = cx - (cx - imageTranslateX) * ratio;
    imageTranslateY = cy - (cy - imageTranslateY) * ratio;
    imageScale = newScale;
    updateImageTransform();
  } else if (e.key === '0') {
    e.preventDefault();
    resetImageTransform();
  }
});

// ---------- FUNCIONES DE PARTITURA ----------
function ensureOSMD() {
  if (typeof opensheetmusicdisplay === 'undefined') {
    throw new Error('La librería OpenSheetMusicDisplay no se cargó.');
  }
  if (!osmd) {
    osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(osmdContainer, {
      autoResize: true,
      drawTitle: true,
      followCursor: true
    });
  }
  return osmd;
}

function getTempo() { return parseFloat(scoreTempoInput.value) || 100; }
function scoreNoteHand(midi,ve){
  // Prioriza la asignación real de pentagrama expuesta por OSMD. El split en Do4
  // queda únicamente como fallback cuando el MusicXML/OSMD no aporta staff fiable.
  try{
    const candidates=[
      ve?.ParentStaffEntry?.ParentStaff?.Id,
      ve?.ParentSourceStaffEntry?.ParentStaff?.Id,
      ve?.ParentVoice?.ParentStaffEntry?.ParentStaff?.Id,
      ve?.ParentVoice?.ParentStaff?.Id,
      ve?.ParentVoice?.ParentVoiceEntry?.ParentStaffEntry?.ParentStaff?.Id
    ];
    for(const staff of candidates){
      if(staff===undefined||staff===null) continue;
      const n=Number(staff);
      if(Number.isFinite(n)) return n<=1?'right':'left';
    }
  }catch(e){}
  return midi < HAND_SPLIT_MIDI ? 'left' : 'right';
}
function shouldPlayScoreNote(midi,ve){
  if(tutorMode && tutorMode.value!=='off'){const target=tutorHand.value;const hand=scoreNoteHand(midi,ve);return target==='both'?false:hand!==target}
  const mode=scoreHandMode.value;return mode==='both'||scoreNoteHand(midi,ve)===mode
}
function clearCountIn(){countInTimerIds.forEach(clearTimeout);countInTimerIds=[]}
function syncScoreMetronome(start){
  if(start&&scoreMetroSync.checked){metroBpm.value=Math.round(getTempo()); if(!metroRunning){setMetro(true);scoreStartedMetro=true}}
  else if(!start&&scoreStartedMetro){setMetro(false);scoreStartedMetro=false}
}
function getMeterTiming(bpmValue=+metroBpm.value||80){
  const numerator=Math.max(1,+metroMeter.value||4), denominator=numerator===6?8:4;
  const barQuarterLength=numerator*(4/denominator);
  const pulseSel=document.getElementById('metroPulse')?.value||'auto';
  let pulseQuarterLength=pulseSel==='quarter'?1:pulseSel==='eighth'?.5:pulseSel==='dottedQuarter'?1.5:(numerator===6&&denominator===8?1.5:1);
  let pulses=barQuarterLength/pulseQuarterLength;
  if(!Number.isFinite(pulses)||Math.abs(pulses-Math.round(pulses))>.001||pulses<1){
    pulseQuarterLength=(numerator===6&&denominator===8)?1.5:1;
    pulses=barQuarterLength/pulseQuarterLength;
  }
  pulses=Math.max(1,Math.round(pulses));
  return {numerator,denominator,pulses,secondsPerPulse:60/Math.max(30,Math.min(300,bpmValue)),pulseQuarterLength};
}
function runCountIn(done){
  clearCountIn(); const bars=Math.max(0,Math.min(2,+scoreCountIn.value||0)); if(!bars){done();return}
  const timing=getMeterTiming(getTempo()),beats=timing.pulses,tempo=getTempo(),ms=timing.secondsPerPulse*1000,total=bars*beats; studyStatus.textContent=`Count-in ${bars} compás${bars>1?'es':''}`;
  const ctx=ensureCtx(),start=ctx.currentTime+.08; for(let i=0;i<total;i++){metroClick(start+i*timing.secondsPerPulse,i%beats===0);const id=setTimeout(()=>{metroBeat.textContent=String((i%beats)+1)},Math.max(0,(start-ctx.currentTime)*1000+i*ms));countInTimerIds.push(id)}
  countInTimerIds.push(setTimeout(()=>{studyStatus.textContent='';done()},Math.max(0,(start-ctx.currentTime)*1000+total*ms)));
}
const PRACTICE_KEY='pianoVirtual_practiceDiary_v1'; let practiceSession=null;
function loadPracticeDiary(){try{return JSON.parse(localStorage.getItem(PRACTICE_KEY)||'[]')}catch(e){return[]}}
function savePracticeDiary(rows){try{localStorage.setItem(PRACTICE_KEY,JSON.stringify(rows.slice(0,100)))}catch(e){}}
function beginPracticeSession(){if(practiceSession)return;practiceSession={startedAt:Date.now(),activeStarted:Date.now(),activeMs:0,startBpm:getTempo(),loops:0,score:currentScoreName,hand:scoreHandMode.value}}
function pausePracticeClock(){if(practiceSession&&practiceSession.activeStarted){practiceSession.activeMs+=Date.now()-practiceSession.activeStarted;practiceSession.activeStarted=null}}
function resumePracticeClock(){if(practiceSession&&!practiceSession.activeStarted)practiceSession.activeStarted=Date.now()}
function finishPracticeSession(reason='stop'){
  if(!practiceSession)return;pausePracticeClock();if(practiceSession.activeMs>=4000){const rows=loadPracticeDiary();rows.unshift({date:new Date(practiceSession.startedAt).toISOString(),durationMs:practiceSession.activeMs,startBpm:practiceSession.startBpm,endBpm:getTempo(),loops:practiceSession.loops,score:practiceSession.score,hand:practiceSession.hand,reason});savePracticeDiary(rows)}practiceSession=null;renderPracticeDiary();
}
function fmtDuration(ms){const s=Math.round(ms/1000),m=Math.floor(s/60);return m?`${m}m ${s%60}s`:`${s}s`}
function handLabel(v){return v==='left'?'MI':v==='right'?'MD':'Ambas'}
function renderPracticeDiary(){
  const rows=loadPracticeDiary(),summary=document.getElementById('practiceSummary'),list=document.getElementById('practiceList');const total=rows.reduce((a,r)=>a+(r.durationMs||0),0),loops=rows.reduce((a,r)=>a+(r.loops||0),0);
  summary.innerHTML=`<div class="practice-kpi"><strong>${rows.length}</strong><span>sesiones</span></div><div class="practice-kpi"><strong>${fmtDuration(total)}</strong><span>tiempo acumulado</span></div><div class="practice-kpi"><strong>${loops}</strong><span>loops completados</span></div>`;
  list.innerHTML=rows.length?rows.slice(0,30).map(r=>`<div class="practice-entry"><div><strong>${r.score||'Práctica libre'}</strong><br><small>${new Date(r.date).toLocaleString()}</small></div><div>${fmtDuration(r.durationMs)}<br><small>${handLabel(r.hand)}</small></div><div>${r.startBpm} → ${r.endBpm} BPM<br><small>${r.loops||0} loops</small></div><div><small>${r.reason==='end'?'Completada':'Detenida'}</small></div></div>`).join(''):'<p style="color:var(--muted);font-size:.78rem">Aún no hay sesiones. Se guarda una entrada al detener o terminar una reproducción de al menos 4 segundos.</p>';
}
const diaryPanel=document.getElementById('practiceDiaryPanel');document.getElementById('practiceDiaryBtn').addEventListener('click',()=>{renderPracticeDiary();diaryPanel.hidden=false});document.getElementById('practiceDiaryClose').addEventListener('click',()=>diaryPanel.hidden=true);document.addEventListener('keydown',e=>{if(e.key==='Escape'){diaryPanel.hidden=true;const srp=document.getElementById('sampleReportPanel');if(srp)srp.hidden=true;const trp=document.getElementById('tutorReportPanel');if(trp)trp.hidden=true}});document.getElementById('practiceClearBtn').addEventListener('click',()=>{if(confirm('¿Borrar todo el diario de práctica?')){savePracticeDiary([]);renderPracticeDiary()}});document.getElementById('practiceExportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(loadPracticeDiary(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='diario-practica-piano.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
