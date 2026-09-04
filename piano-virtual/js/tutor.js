// ---------- FASE 3: TUTOR MIDI / EVALUACIÓN ----------
const TUTOR_HISTORY_KEY='pianoVirtual_tutorHistory_v1';
let tutorSession=null, tutorStep=null, tutorAdvanceLock=false, lastTutorReport=null;
const recentTutorAttacks=[]; const TUTOR_EARLY_WINDOW_MS=180; const TUTOR_LATE_WINDOW_MS=180;
function loadTutorHistory(){try{return JSON.parse(localStorage.getItem(TUTOR_HISTORY_KEY)||'[]')}catch(e){return[]}}
function saveTutorHistory(rows){try{localStorage.setItem(TUTOR_HISTORY_KEY,JSON.stringify(rows.slice(0,60)))}catch(e){}}
function tutorActive(){return !!tutorMode && tutorMode.value!=='off'}
function getCurrentScoreStepData(){
  const out={target:[],all:[],measure:'—',duration:null};
  if(!osmd||!osmd.cursor||!osmd.cursor.Iterator)return out;
  try{
    const entries=osmd.cursor.Iterator.CurrentVoiceEntries||[];
    entries.forEach(ve=>{
      try{const m=ve?.ParentSourceStaffEntry?.VerticalContainerParent?.ParentMeasure?.MeasureNumber ?? ve?.ParentStaffEntry?.VerticalContainerParent?.ParentMeasure?.MeasureNumber ?? ve?.ParentMeasure?.MeasureNumber;if(m!==undefined&&m!==null){const nm=Number(m);out.measure=Number.isFinite(nm)?String(nm):String(m)}}catch(e){}
      (ve.Notes||[]).forEach(note=>{
        if(!note||(note.isRest&&note.isRest())||note.Pitch==null)return;
        const midi=note.Pitch.halfTone+12, hand=scoreNoteHand(midi,ve);
        out.all.push({midi,hand});
        const targetHand=tutorHand.value; if(targetHand==='both'||hand===targetHand)out.target.push(midi);
        const f=(note.Length&&typeof note.Length.RealValue==='number')?note.Length.RealValue:0.25,d=f*4*(60/getTempo());if(out.duration===null||d<out.duration)out.duration=d;
      });
    });
  }catch(e){}
  out.target=[...new Set(out.target)].sort((a,b)=>a-b);out.all=[...new Map(out.all.map(x=>[x.midi,x])).values()];if(out.duration===null)out.duration=.5*(60/getTempo());return out;
}
function beginTutorSession(){
  if(!tutorActive()){tutorSession=null;tutorLiveStatus.textContent='Tutor inactivo';return}
  if(tutorSession)return;
  tutorSession={startedAt:Date.now(),mode:tutorMode.value,hand:tutorHand.value,score:currentScoreName,bpm:getTempo(),steps:[],wrongNotes:0,correctNotes:0,missedNotes:0,velocities:[],timings:[],measures:{}};
  lastTutorReport=null;tutorLiveStatus.className='tutor-live tutor-step-wait';tutorLiveStatus.innerHTML='<strong>Tutor listo</strong>';
}
function openTutorStep(){
  if(!tutorSession)return false;
  // Si venimos de pausa conservamos aciertos/errores del paso actual y reiniciamos
  // únicamente su ventana temporal para no perder el trabajo del alumno.
  if(tutorStep&&tutorStep.paused){tutorStep.paused=false;tutorStep.openedAt=performance.now();tutorStep.deadlineAt=tutorStep.openedAt+(tutorStep.durationMs||500)+TUTOR_LATE_WINDOW_MS;return tutorStep.expected.size>0}
  const d=getCurrentScoreStepData(), now=performance.now();
  const expected=new Set(d.target);tutorStep={index:Math.max(0,currentStepIndex),measure:d.measure,expected,matched:new Set(),wrong:[],openedAt:now,durationMs:Math.max(80,(d.duration||.5)*1000),deadlineAt:now+Math.max(80,(d.duration||.5)*1000)+TUTOR_LATE_WINDOW_MS,timings:[],velocities:[]};
  // Recupera ataques ligeramente anticipados (hasta 180 ms) para poder medir timing negativo.
  if(expected.size){
    const fresh=recentTutorAttacks.filter(a=>now-a.time<=TUTOR_EARLY_WINDOW_MS);
    for(const a of fresh){if(expected.has(a.note)&&!tutorStep.matched.has(a.note)){tutorStep.matched.add(a.note);tutorStep.timings.push(a.time-now);tutorStep.velocities.push(a.velocity)}}
  }
  if(!expected.size){tutorLiveStatus.className='tutor-live';tutorLiveStatus.textContent=`Compás ${d.measure} · acompañamiento`;return false}
  tutorLiveStatus.className='tutor-live tutor-step-wait';tutorLiveStatus.innerHTML=`Compás ${d.measure} · espera <strong>${[...expected].filter(n=>!tutorStep.matched.has(n)).map(m=>displayMidiName(m)).join(' ')||'—'}</strong>`;return true;
}
function displayMidiName(m){const i=midiToInfo(m);return getNoteNames(currentLang,i.idx)+(i.octave??'')}
function closeTutorStep(markMisses=true){
  if(!tutorSession||!tutorStep)return;
  const missing=[...tutorStep.expected].filter(n=>!tutorStep.matched.has(n));
  if(markMisses)tutorSession.missedNotes+=missing.length;
  const correct=tutorStep.matched.size,wrong=tutorStep.wrong.length,perfect=missing.length===0&&wrong===0;
  tutorSession.correctNotes+=correct;tutorSession.wrongNotes+=wrong;tutorSession.timings.push(...tutorStep.timings);tutorSession.velocities.push(...tutorStep.velocities);
  const rec={index:tutorStep.index,measure:tutorStep.measure,expected:[...tutorStep.expected],correct:[...tutorStep.matched],missing,wrong:[...tutorStep.wrong],timings:[...tutorStep.timings],velocities:[...tutorStep.velocities],perfect};tutorSession.steps.push(rec);
  const mm=tutorSession.measures[rec.measure]||(tutorSession.measures[rec.measure]={steps:0,perfect:0,correct:0,missed:0,wrong:0});mm.steps++;if(perfect)mm.perfect++;mm.correct+=correct;mm.missed+=missing.length;mm.wrong+=wrong;
  tutorStep=null;
}
function phase3TutorMidiNote(note,velocity){
  const now=performance.now();recentTutorAttacks.push({note,velocity,time:now});while(recentTutorAttacks.length&&now-recentTutorAttacks[0].time>800)recentTutorAttacks.shift();
  if(!tutorSession||!tutorStep||tutorAdvanceLock||tutorStep.paused)return;
  const dt=now-tutorStep.openedAt;
  if(tutorMode.value==='tempo'&&now>tutorStep.deadlineAt)return; // demasiado tarde: pertenecerá al paso siguiente
  if(tutorStep.expected.has(note)&&!tutorStep.matched.has(note)){tutorStep.matched.add(note);tutorStep.timings.push(dt);tutorStep.velocities.push(velocity);tutorLiveStatus.className='tutor-live tutor-step-ok';const signed=Math.round(dt);tutorLiveStatus.innerHTML=`✓ ${tutorStep.matched.size}/${tutorStep.expected.size} · <strong>${signed>=0?'+':''}${signed} ms</strong>`;
    if(tutorMode.value==='wait'&&tutorStep.matched.size===tutorStep.expected.size){tutorAdvanceLock=true;closeTutorStep(false);setTimeout(()=>{tutorAdvanceLock=false;if(!scorePlaying)return;advanceTutorWaitStep()},90)}
  }else if(!tutorStep.matched.has(note)){tutorStep.wrong.push(note);tutorLiveStatus.className='tutor-live tutor-step-wrong';tutorLiveStatus.innerHTML=`✕ ${displayMidiName(note)} · esperado ${[...tutorStep.expected].filter(n=>!tutorStep.matched.has(n)).map(displayMidiName).join(' ')||'—'}`;}
}
function advanceTutorWaitStep(){
  if(!scorePlaying||!osmd||!osmd.cursor||!osmd.cursor.Iterator)return;
  if(osmd.cursor.Iterator.EndReached){fullStop('end');return}
  if(loopEnabled&&loopEnd!==null&&currentStepIndex>=loopEnd){loopCompletedCount++;if(practiceSession)practiceSession.loops=loopCompletedCount;const every=Math.max(1,+scoreAutoTempoEvery.value||3),step=Math.max(0,+scoreAutoTempoStep.value||0),target=Math.max(0,+scoreLoopRepeats.value||0);if(step>0&&loopCompletedCount%every===0){scoreTempoInput.value=Math.min(300,Math.round(getTempo()+step));if(scoreMetroSync.checked)metroBpm.value=scoreTempoInput.value}if(target>0&&loopCompletedCount>=target){loopEnabled=false;updateLoopUI();fullStop('end');return}jumpToStep(loopStart);scheduleScoreStep();return}
  osmd.cursor.next();currentStepIndex++;scheduleScoreStep();
}
function tutorStats(session){const expected=session.correctNotes+session.missedNotes,den=expected+session.wrongNotes,accuracy=den?Math.round(session.correctNotes/den*100):0,perfect=session.steps.length?Math.round(session.steps.filter(s=>s.perfect).length/session.steps.length*100):0,avgTiming=session.timings.length?Math.round(session.timings.reduce((a,b)=>a+Math.abs(b),0)/session.timings.length):null,avgVel=session.velocities.length?Math.round(session.velocities.reduce((a,b)=>a+b,0)/session.velocities.length):null;return{expected,accuracy,perfect,avgTiming,avgVel}}
function finalizeTutorSession(reason='stop'){
  if(!tutorSession)return;if(tutorStep)closeTutorStep(true);const stats=tutorStats(tutorSession);lastTutorReport={...tutorSession,endedAt:Date.now(),reason,stats};const rows=loadTutorHistory();rows.unshift(lastTutorReport);saveTutorHistory(rows);tutorSession=null;tutorStep=null;tutorLiveStatus.className='tutor-live';tutorLiveStatus.textContent=`${stats.accuracy}% notas · ${stats.perfect}% pasos`;renderTutorReport(lastTutorReport);
}
function renderTutorReport(report=lastTutorReport){
  const sum=document.getElementById('tutorReportSummary'),body=document.getElementById('tutorReportBody');if(!report){sum.innerHTML='';body.innerHTML='<p style="color:var(--muted)">Aún no hay una evaluación. Carga MusicXML, activa un modo Tutor y toca mediante MIDI.</p>';return}
  const st=report.stats||tutorStats(report),timing=st.avgTiming===null?'—':st.avgTiming+' ms',vel=st.avgVel===null?'—':st.avgVel;sum.innerHTML=`<div class="practice-kpi"><strong>${st.accuracy}%</strong><span>precisión de notas</span></div><div class="practice-kpi"><strong>${st.perfect}%</strong><span>pasos perfectos</span></div><div class="practice-kpi"><strong>${timing}</strong><span>respuesta / timing medio</span></div>`;
  const measures=Object.entries(report.measures||{}).map(([m,x])=>{const total=x.correct+x.missed+x.wrong,acc=total?Math.round(x.correct/total*100):0;return `<tr><td>${m}</td><td>${x.steps}</td><td>${acc}%</td><td>${x.missed}</td><td>${x.wrong}</td></tr>`}).join('');
  const problem=(report.steps||[]).filter(s=>!s.perfect).slice(0,12).map(s=>`<div class="practice-entry"><div><strong>Compás ${s.measure}</strong><br><small>Paso ${s.index+1}</small></div><div class="tutor-note-list">Esperado: ${s.expected.map(displayMidiName).join(' ')||'—'}</div><div class="tutor-note-list">Faltó: ${s.missing.map(displayMidiName).join(' ')||'—'}<br>Extra: ${s.wrong.map(displayMidiName).join(' ')||'—'}</div><div><small>${s.perfect?'✓':'Revisar'}</small></div></div>`).join('');
  const hist=loadTutorHistory().slice(0,8).map(r=>`<div class="practice-entry"><div><strong>${r.score||'Partitura'}</strong><br><small>${new Date(r.startedAt).toLocaleString()}</small></div><div>${r.stats?.accuracy??tutorStats(r).accuracy}% notas<br><small>${r.hand==='right'?'MD':r.hand==='left'?'MI':'Ambas'}</small></div><div>${r.stats?.perfect??tutorStats(r).perfect}% pasos<br><small>${r.mode==='wait'?'Espera':'A tempo'}</small></div><div><small>${r.bpm} BPM</small></div></div>`).join('');
  body.innerHTML=`<p><span class="tutor-badge">${report.mode==='wait'?'Modo esperar':'Evaluación a tempo'}</span> <span class="tutor-badge">Velocity media: ${vel}</span> <span class="tutor-badge">${report.correctNotes} correctas · ${report.missedNotes} faltantes · ${report.wrongNotes} extras</span></p><table class="tutor-report-table"><thead><tr><th>Compás</th><th>Pasos</th><th>Precisión</th><th>Faltantes</th><th>Extras</th></tr></thead><tbody>${measures||'<tr><td colspan="5">Sin datos por compás</td></tr>'}</tbody></table><h4 style="color:var(--gold);margin-bottom:6px">Pasajes a revisar</h4><div class="practice-list">${problem||'<p style="color:#7fe0a0">No se detectaron errores.</p>'}</div><div class="tutor-history"><h4>Evaluaciones recientes</h4><div class="practice-list">${hist}</div></div>`;
}
const tutorPanel=document.getElementById('tutorReportPanel');document.getElementById('tutorReportBtn').addEventListener('click',()=>{renderTutorReport();tutorPanel.hidden=false});document.getElementById('tutorReportClose').addEventListener('click',()=>tutorPanel.hidden=true);document.getElementById('tutorHistoryClearBtn').addEventListener('click',()=>{if(confirm('¿Borrar el historial de evaluaciones del tutor?')){saveTutorHistory([]);lastTutorReport=null;renderTutorReport()}});document.getElementById('tutorExportBtn').addEventListener('click',()=>{if(!lastTutorReport)return;const b=new Blob([JSON.stringify(lastTutorReport,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='informe-tutor-midi.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
document.getElementById('tutorWeakPracticeBtn').addEventListener('click',()=>{if(!lastTutorReport||!lastTutorReport.steps?.length){studyStatus.textContent='No hay informe para practicar';return}const ranked=Object.entries(lastTutorReport.measures||{}).map(([m,x])=>({m,x,score:(x.missed+x.wrong)*10+(x.steps-x.perfect)})).sort((a,b)=>b.score-a.score);if(!ranked.length||ranked[0].score<=0){studyStatus.textContent='No hay compases débiles detectados';return}const m=ranked[0].m,steps=lastTutorReport.steps.filter(x=>String(x.measure)===String(m)).map(x=>x.index);if(!steps.length)return;loopStart=Math.min(...steps);loopEnd=Math.max(...steps);loopEnabled=true;updateLoopUI();tutorMode.value='wait';tutorHand.value=lastTutorReport.hand||'right';saveSettings();tutorPanel.hidden=true;jumpToStep(loopStart);studyStatus.textContent=`Práctica adaptativa · compás ${m}`;playFromCurrentPosition()});


let scorePlaying = false;
let scorePlaybackTimer = null;
let currentStepIndex = -1;
const scoreActiveMidis = new Set();

// ---------- LOOP / REPETICIÓN DE UN TRAMO ----------
let loopStart = null;
let loopEnd = null;
let loopEnabled = false;

function updateLoopUI() {
  scoreLoopStartBtn.classList.toggle('marked', loopStart !== null);
  scoreLoopEndBtn.classList.toggle('marked', loopEnd !== null);
  scoreLoopBtn.disabled = !(loopStart !== null && loopEnd !== null);
  scoreLoopBtn.classList.toggle('active', loopEnabled);
}

function markLoopStart() {
  if (!osmd || !osmd.cursor || currentStepIndex < 0) {
    alert('Primero posiciónate sobre una nota: usa Play, avanza/retrocede, o haz clic sobre una nota de la partitura.');
    return;
  }
  loopStart = currentStepIndex;
  if (loopEnd !== null && loopEnd < loopStart) loopEnd = null;
  updateLoopUI();
}

function markLoopEnd() {
  if (!osmd || !osmd.cursor || currentStepIndex < 0) {
    alert('Primero posiciónate sobre una nota: usa Play, avanza/retrocede, o haz clic sobre una nota de la partitura.');
    return;
  }
  if (loopStart === null) {
    loopStart = currentStepIndex;
  } else if (currentStepIndex < loopStart) {
    loopEnd = loopStart;
    loopStart = currentStepIndex;
  } else {
    loopEnd = currentStepIndex;
  }
  updateLoopUI();
}

function clearLoopMarks() {
  loopStart = null;
  loopEnd = null;
  loopEnabled = false;
  updateLoopUI();
}

function toggleLoop() {
  if (loopStart === null || loopEnd === null) return;
  if (loopEnabled) {
    loopEnabled = false;
    stopPlaybackAudio();
    updateLoopUI();
  } else {
    loopEnabled = true; loopCompletedCount=0; if(practiceSession)practiceSession.loops=0;
    stopPlaybackAudio();
    jumpToStep(loopStart);
    scorePlaying = true;
    updateLoopUI();
    scheduleScoreStep();
  }
}

function stopPlaybackAudio() {
  scorePlaying = false;
  if (scorePlaybackTimer) { clearTimeout(scorePlaybackTimer); scorePlaybackTimer = null; }
  scoreActiveMidis.forEach(midi => noteOff(midiToInfo(midi)));
  scoreActiveMidis.clear();
}
function pausePlayback() { stopPlaybackAudio(); if(tutorSession&&tutorStep){tutorStep.paused=true;tutorStep.pausedAt=performance.now()} pausePracticeClock(); syncScoreMetronome(false); studyStatus.textContent='Pausa'; }
function fullStop(reason='stop') {
  clearCountIn(); stopPlaybackAudio(); syncScoreMetronome(false); finalizeTutorSession(reason); finishPracticeSession(reason); studyStatus.textContent='';
  loopEnabled = false;
  if (osmd && osmd.cursor) {
    try { osmd.cursor.reset(); osmd.cursor.hide(); } catch(e) {}
  }
  currentStepIndex = -1;
  try { osmdContainer.scrollLeft = 0; osmdContainer.scrollTop = 0; } catch(e) {}
  updateLoopUI();
}

function triggerCurrentStepNotes(tempo, hold) {
  let stepSeconds = null;
  try {
    const entries = osmd.cursor.Iterator.CurrentVoiceEntries || [];
    entries.forEach(ve => {
      (ve.Notes || []).forEach(note => {
        if (!note || (note.isRest && note.isRest()) || note.Pitch == null) return;
        const midi = note.Pitch.halfTone + 12;
        if (!shouldPlayScoreNote(midi, ve)) return;
        const lengthFraction = (note.Length && typeof note.Length.RealValue === 'number') ? note.Length.RealValue : 0.25;
        const durSeconds = lengthFraction * 4 * (60 / tempo);
        if (stepSeconds === null || durSeconds < stepSeconds) stepSeconds = durSeconds;
        noteOn(midiToInfo(midi));
        scoreActiveMidis.add(midi);
        if (!hold) {
          setTimeout(() => {
            noteOff(midiToInfo(midi));
            scoreActiveMidis.delete(midi);
          }, Math.max(30, durSeconds * 1000 - 30));
        }
      });
    });
  } catch(err) { console.warn('Error leyendo notas de la partitura:', err); }
  if (stepSeconds === null) stepSeconds = 0.5 * (60 / tempo);
  return stepSeconds;
}

function scheduleScoreStep() {
  if (!scorePlaying || !osmd || !osmd.cursor || !osmd.cursor.Iterator) return;
  if (osmd.cursor.Iterator.EndReached) {
    if (loopEnabled && loopStart !== null) { jumpToStep(loopStart); scorePlaybackTimer = setTimeout(scheduleScoreStep, 0); return; }
    fullStop('end'); return;
  }
  const durationSeconds = triggerCurrentStepNotes(getTempo());
  let hasTarget=false;
  if(tutorSession){ hasTarget=openTutorStep(); if(tutorMode.value==='wait' && hasTarget) return; }

  // En evaluación a tempo mantenemos el paso abierto durante toda su duración
  // musical (+ tolerancia tardía) y solo entonces calculamos notas faltantes.
  const finishCurrentStep=()=>{
    if(!scorePlaying)return;
    if(tutorSession&&tutorStep) closeTutorStep(true);
    if (loopEnabled && loopEnd !== null && currentStepIndex >= loopEnd) {
      loopCompletedCount++; if(practiceSession) practiceSession.loops=loopCompletedCount;
      const every=Math.max(1,+scoreAutoTempoEvery.value||3),step=Math.max(0,+scoreAutoTempoStep.value||0),target=Math.max(0,+scoreLoopRepeats.value||0);
      if(step>0 && loopCompletedCount%every===0){scoreTempoInput.value=Math.min(300,Math.round(getTempo()+step));if(scoreMetroSync.checked)metroBpm.value=scoreTempoInput.value;studyStatus.textContent=`Loop ${loopCompletedCount} · ${getTempo()} BPM`}
      if(target>0 && loopCompletedCount>=target){loopEnabled=false;updateLoopUI();fullStop('end');return}
      jumpToStep(loopStart); scheduleScoreStep(); return;
    }
    osmd.cursor.next(); currentStepIndex++; studyStatus.textContent=`Paso ${Math.max(1,currentStepIndex+1)} · ${getTempo()} BPM`; scheduleScoreStep();
  };
  const waitMs=Math.max(30,durationSeconds*1000);
  scorePlaybackTimer=setTimeout(finishCurrentStep,waitMs);
}

function playFromCurrentPosition() {
  if (!osmd || !osmd.cursor) return;
  stopPlaybackAudio(); clearCountIn();
  if (currentStepIndex === -1) osmd.cursor.reset();
  osmd.cursor.show(); beginPracticeSession(); resumePracticeClock(); beginTutorSession(); loopCompletedCount=practiceSession?practiceSession.loops||0:0;
  runCountIn(()=>{scorePlaying=true;syncScoreMetronome(true);scheduleScoreStep()});
}

function stepForward() {
  if (!osmd || !osmd.cursor || !osmd.cursor.Iterator) return;
  stopPlaybackAudio();
  if (currentStepIndex === -1) osmd.cursor.reset();
  else {
    if (osmd.cursor.Iterator.EndReached) return;
    osmd.cursor.next();
  }
  currentStepIndex++;
  osmd.cursor.show();
  triggerCurrentStepNotes(getTempo(), true);
}

function stepBackward() {
  if (!osmd || !osmd.cursor) return;
  stopPlaybackAudio();
  const target = currentStepIndex - 1;
  if (target < 0) { fullStop(); return; }
  try {
    osmd.cursor.reset();
    let guard = 0;
    while (guard < target && osmd.cursor.Iterator && !osmd.cursor.Iterator.EndReached) {
      osmd.cursor.next();
      guard++;
    }
    currentStepIndex = target;
    osmd.cursor.show();
    triggerCurrentStepNotes(getTempo(), true);
  } catch(err) { console.warn('Error al retroceder:', err); }
}

function jumpToStep(targetIndex) {
  try {
    osmd.cursor.reset();
    let guard = 0;
    while (guard < targetIndex && osmd.cursor.Iterator && !osmd.cursor.Iterator.EndReached) {
      osmd.cursor.next();
      guard++;
    }
    currentStepIndex = targetIndex;
    osmd.cursor.show();
  } catch(err) { console.warn('Error al saltar de posición:', err); }
}

function seekToStep(targetIndex) {
  if (!osmd || !osmd.cursor) return;
  stopPlaybackAudio();
  jumpToStep(targetIndex);
}

scorePlayBtn.addEventListener('click', playFromCurrentPosition);
scorePauseBtn.addEventListener('click', pausePlayback);
scoreStopBtn.addEventListener('click', fullStop);
scoreNextBtn.addEventListener('click', stepForward);
scorePrevBtn.addEventListener('click', stepBackward);
scoreLoopStartBtn.addEventListener('click', markLoopStart);
scoreLoopEndBtn.addEventListener('click', markLoopEnd);
scoreLoopBtn.addEventListener('click', toggleLoop);
scoreLoopClearBtn.addEventListener('click', clearLoopMarks);

function zoomScore(delta) {
  if (!osmd) return;
  try {
    const current = (typeof osmd.Zoom === 'number') ? osmd.Zoom : 1;
    const newZoom = Math.min(3, Math.max(0.4, +(current + delta).toFixed(2)));
    osmd.Zoom = newZoom;
    osmd.render();
    requestAnimationFrame(() => { try { buildScoreStepMap(); } catch(e) {} });
  } catch(err) { console.warn('Error al cambiar zoom:', err); }
}
scoreZoomInBtn.addEventListener('click', () => zoomScore(0.1));
scoreZoomOutBtn.addEventListener('click', () => zoomScore(-0.1));

let scoreSteps = [];
function buildScoreStepMap() {
  scoreSteps = [];
  if (!osmd || !osmd.cursor || !osmd.cursor.Iterator) return;
  try {
    osmd.cursor.reset();
    osmd.cursor.show();
    const containerRect = osmdContainer.getBoundingClientRect();
    let guard = 0;
    while (!osmd.cursor.Iterator.EndReached && guard < 4000) {
      osmd.cursor.update();
      const cursorEl = osmd.cursor.cursorElement;
      if (cursorEl) {
        const r = cursorEl.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          scoreSteps.push({
            index: scoreSteps.length,
            left: r.left - containerRect.left + osmdContainer.scrollLeft,
            top: r.top - containerRect.top + osmdContainer.scrollTop,
            width: Math.max(r.width, 10),
            height: Math.max(r.height, 20)
          });
        }
      }
      osmd.cursor.next();
      guard++;
    }
  } catch(err) { console.warn('No se pudo generar mapa de clics:', err); scoreSteps = []; }
  try { osmd.cursor.reset(); osmd.cursor.hide(); } catch(e) {}
  currentStepIndex = -1;
  renderClickOverlay();
}

function renderClickOverlay() {
  const old = document.getElementById('scoreClickOverlay');
  if (old) old.remove();
  if (!scoreSteps.length) return;
  const overlay = document.createElement('div');
  overlay.id = 'scoreClickOverlay';
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = osmdContainer.scrollWidth + 'px';
  overlay.style.height = osmdContainer.scrollHeight + 'px';
  overlay.style.pointerEvents = 'none';
  scoreSteps.forEach(step => {
    const hit = document.createElement('div');
    hit.className = 'score-click-hit';
    hit.style.left = (step.left - 4) + 'px';
    hit.style.top = (step.top - 4) + 'px';
    hit.style.width = (step.width + 8) + 'px';
    hit.style.height = (step.height + 8) + 'px';
    hit.style.pointerEvents = 'auto';
    hit.title = 'Comenzar aquí';
    hit.addEventListener('click', () => seekToStep(step.index));
    overlay.appendChild(hit);
  });
  osmdContainer.appendChild(overlay);
}

function resetScoreView() {
  fullStop();
  loopStart = null;
  loopEnd = null;
  updateLoopUI();
  pdfViewer.src = '';
  pdfViewer.style.display = 'none';
  webViewer.src = '';
  webViewer.classList.remove('visible');
  webClearBtn.classList.remove('visible');
  webLoadNote.textContent = '';
  webLoadNote.style.display = 'none';
  osmdContainer.classList.remove('visible');
  osmdContainer.innerHTML = '';
  osmd = null;
  imageContainer.style.display = 'none';
  if (currentImageUrl) { URL.revokeObjectURL(currentImageUrl); currentImageUrl = null; }
  imageViewer.src = '';
  resetImageTransform();
  scoreSteps = [];
  scorePlayControls.classList.remove('visible');
  scoreStatus.textContent = ''; currentScoreName='Sin partitura';
  pdfClearBtn.classList.remove('visible');
}

pdfUpload.addEventListener('change', async function(e) {
  const file = this.files[0];
  if (!file) return;
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
  const isMusicXML = name.endsWith('.xml') || name.endsWith('.musicxml') || name.endsWith('.mxl');
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);

  resetScoreView(); currentScoreName=file.name;
  if (isPdf) {
    if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
    currentPdfUrl = URL.createObjectURL(file);
    pdfViewer.src = currentPdfUrl;
    pdfViewer.style.display = 'block';
    pdfClearBtn.classList.add('visible');
    return;
  }
  if (isMusicXML) {
    pdfViewer.style.display = 'none';
    scoreStatus.textContent = 'Cargando partitura…';
    try {
      const engine = ensureOSMD();
      const ext = name.split('.').pop();
      const content = (ext === 'mxl') ? await file.arrayBuffer() : await file.text();
      await engine.load(content);
      osmdContainer.classList.add('visible');
      engine.render();
      requestAnimationFrame(() => {
        try { engine.render(); buildScoreStepMap(); } catch(e) { console.warn('Error final render:', e); }
      });
      scorePlayControls.classList.add('visible');
      pdfClearBtn.classList.add('visible');
      scoreStatus.textContent = '';
      const bpm = engine.Sheet && engine.Sheet.DefaultStartTempoInBpm;
      if (bpm && bpm > 0) scoreTempoInput.value = Math.round(bpm);
    } catch(err) {
      console.error('Error cargando MusicXML:', err);
      const detail = (err && err.message) ? err.message : String(err);
      scoreStatus.textContent = 'No se pudo leer el archivo: ' + detail;
      osmdContainer.classList.remove('visible');
      scorePlayControls.classList.remove('visible');
    }
    return;
  }
  if (isImage) {
    const url = URL.createObjectURL(file);
    currentImageUrl = url;
    imageViewer.src = url;
    imageContainer.style.display = 'block';
    resetImageTransform();
    pdfClearBtn.classList.add('visible');
    scoreStatus.textContent = '';
    pdfViewer.style.display = 'none';
    webViewer.classList.remove('visible');
    osmdContainer.classList.remove('visible');
    scorePlayControls.classList.remove('visible');
    return;
  }
  alert('Formato no soportado. Usa PDF, MusicXML (.xml / .musicxml), .mxl o imagen (PNG, JPG, GIF, WEBP, BMP, SVG).');
  this.value = '';
});

pdfClearBtn.addEventListener('click', function() {
  resetScoreView();
  pdfUpload.value = '';
  if (currentPdfUrl) { URL.revokeObjectURL(currentPdfUrl); currentPdfUrl = null; }
  pdfClearBtn.classList.remove('visible');
});
