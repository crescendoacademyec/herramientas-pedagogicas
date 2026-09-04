// ---------- AUTODIAGNÓSTICO 3.1 ----------
function runPhase31SelfTests(){
  const results=[]; const check=(name,ok)=>results.push({name,ok:!!ok});
  try{const prevM=metroMeter.value,prevP=metroPulse.value;metroMeter.value='6';metroPulse.value='auto';check('6/8 auto = 2 pulsos',getMeterTiming(80).pulses===2);metroPulse.value='eighth';check('6/8 corchea = 6 pulsos',getMeterTiming(80).pulses===6);metroMeter.value=prevM;metroPulse.value=prevP}catch(e){check('Metrónomo',false)}
  try{check('Velocity acotada',velocityGain(1)>0&&velocityGain(127)<=1.01)}catch(e){check('Velocity',false)}
  try{check('Rangos MIDI válidos',RANGES.beginner.min<RANGES.beginner.max&&RANGES.pro.min===21&&RANGES.pro.max===108)}catch(e){check('Rangos MIDI',false)}
  if(DEBUG)console.table(results); return results.every(r=>r.ok);
}

// ---------- INICIALIZACIÓN ----------
currentMode = savedSettings.mode && RANGES[savedSettings.mode] ? savedSettings.mode : 'beginner';
currentDisplay = savedSettings.display || (currentMode==='pro'?'ocultar':'mostrar');
currentLang = savedSettings.lang || 'es';
currentKeyPc = savedSettings.key==='' || savedSettings.key==null ? null : parseInt(savedSettings.key,10);
currentScaleMode = savedSettings.keyMode || 'major';
showHandLeft = !!(savedSettings.hands&&savedSettings.hands[0]); showHandRight=!!(savedSettings.hands&&savedSettings.hands[1]);
midiVelocityCurve=savedSettings.velocityCurve||'normal'; currentMidiRange=RANGES[currentMode];
noteDisplaySelect.value=currentDisplay; noteLangSelect.value=currentLang; keySelect.value=currentKeyPc===null?'':String(currentKeyPc); keyModeSelect.value=currentScaleMode;
velocityCurveSelect.value=midiVelocityCurve; if(typeof renderVelocityMenu==='function')renderVelocityMenu(); if(savedSettings.volume!=null)volumeSlider.value=savedSettings.volume; if(savedSettings.metroBpm)metroBpm.value=savedSettings.metroBpm; if(savedSettings.metroMeter)metroMeter.value=savedSettings.metroMeter; if(savedSettings.metroPulse)metroPulse.value=savedSettings.metroPulse;
scoreHandMode.value=savedSettings.scoreHandMode||'both';scoreCountIn.value=savedSettings.scoreCountIn||'1';scoreMetroSync.checked=!!savedSettings.scoreMetroSync;scoreLoopRepeats.value=savedSettings.scoreLoopRepeats||'0';scoreAutoTempoStep.value=savedSettings.scoreAutoTempoStep||'0';scoreAutoTempoEvery.value=savedSettings.scoreAutoTempoEvery||'3';tutorMode.value=savedSettings.tutorMode||'off';tutorHand.value=savedSettings.tutorHand||'right';
[scoreHandMode,scoreCountIn,scoreMetroSync,scoreLoopRepeats,scoreAutoTempoStep,scoreAutoTempoEvery,tutorMode,tutorHand].forEach(el=>el.addEventListener('change',()=>{saveSettings();tutorLiveStatus.textContent=tutorMode.value==='off'?'Tutor inactivo':(tutorMode.value==='wait'?'Esperará al alumno':'Evaluará a tempo')}));
[['beginner',modeBeginnerBtn],['intermediate',modeIntermediateBtn],['pro',modeProBtn]].forEach(([m,b])=>{const on=m===currentMode;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});
updateKeyLanguage();
qsNotes.sync(); qsLang.sync(); qsKey.sync(); qsMode.sync();
handLeftBtn.classList.toggle('active',showHandLeft); handRightBtn.classList.toggle('active',showHandRight);
handLeftBtn.setAttribute('aria-pressed',String(showHandLeft)); handRightBtn.setAttribute('aria-pressed',String(showHandRight));

[volumeSlider,document.getElementById('activeColor')].forEach(el=>el&&el.addEventListener('change',saveSettings));
runPhase31SelfTests();
// Forzar redibujo inicial
requestAnimationFrame(() => {
  buildKeyboard(currentMidiRange.min, currentMidiRange.max);
});
updateSampleStatus();
updateChordDisplay();

document.addEventListener('click', () => {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });


const footerYearEl = document.getElementById('footerYear');
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
