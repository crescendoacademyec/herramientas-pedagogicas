    // ======================================================================
    // METRÓNOMO / PRÁCTICA SINCRONIZADA
    // ======================================================================
    const metroToggle=$('metroToggle'),metroDown=$('metroDown'),metroUp=$('metroUp'),metroTap=$('metroTap'),metroBpmValue=$('metroBpmValue'),metroMeter=$('metroMeter'),metroPulse=$('metroPulse'),metroBeat=$('metroBeat');
    let metroRunning=false,metroTimer=null,metroNextTime=0,metroBeatIndex=0,metroTapTimes=[];
    function getMeterTiming(bpm=+metroBpmValue.textContent||80){
      const [num,den]=metroMeter.value.split('/').map(Number); const barQ=num*(4/den);
      const p=metroPulse.value; let pulseQ=p==='quarter'?1:p==='eighth'?.5:p==='dottedQuarter'?1.5:(num===6&&den===8?1.5:1);
      let pulses=barQ/pulseQ; if(!Number.isInteger(Math.round(pulses))||Math.abs(pulses-Math.round(pulses))>.01||pulses<1){pulseQ=(num===6&&den===8)?1.5:1;pulses=barQ/pulseQ}
      return {pulses:Math.max(1,Math.round(pulses)),secondsPerPulse:60/Math.max(30,Math.min(300,bpm))};
    }
    function metroClick(time,accent=false){const c=ensureCtx(),o=c.createOscillator(),g=c.createGain();o.frequency.value=accent?1450:980;g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(accent?.18:.11,time+.003);g.gain.exponentialRampToValueAtTime(.0001,time+.045);o.connect(g);g.connect(masterBus);o.start(time);o.stop(time+.055)}
    function metroSchedule(){if(!metroRunning)return;const c=ensureCtx(),timing=getMeterTiming(),beats=timing.pulses;while(metroNextTime<c.currentTime+.12){const idx=metroBeatIndex%beats;metroClick(metroNextTime,idx===0);const shown=idx+1;setTimeout(()=>{if(metroRunning)metroBeat.textContent=shown},Math.max(0,(metroNextTime-c.currentTime)*1000));metroBeatIndex++;metroNextTime+=timing.secondsPerPulse}metroTimer=setTimeout(metroSchedule,25)}
    function startMetro(){if(metroRunning)return;const c=ensureCtx();metroRunning=true;metroBeatIndex=0;metroNextTime=c.currentTime+.06;metroToggle.textContent='■';metroSchedule()}
    function stopMetro(){metroRunning=false;if(metroTimer)clearTimeout(metroTimer);metroTimer=null;metroToggle.textContent='▶';metroBeat.textContent='1'}
    function setMetroBpm(v){metroBpmValue.textContent=String(Math.max(30,Math.min(300,Math.round(v))));saveSettings()}
    metroToggle.addEventListener('click',()=>metroRunning?stopMetro():startMetro()); metroDown.addEventListener('click',()=>setMetroBpm(+metroBpmValue.textContent-1)); metroUp.addEventListener('click',()=>setMetroBpm(+metroBpmValue.textContent+1));
    metroTap.addEventListener('click',()=>{const now=performance.now();metroTapTimes=metroTapTimes.filter(t=>now-t<2500);metroTapTimes.push(now);if(metroTapTimes.length>=2){const ds=metroTapTimes.slice(1).map((t,i)=>t-metroTapTimes[i]);setMetroBpm(60000/(ds.reduce((a,b)=>a+b,0)/ds.length))}});
    ;[metroMeter,metroPulse].forEach(e=>e.addEventListener('change',saveSettings));
