/* Cuerdas Frotadas · análisis pedagógico de vibrato sobre una altura monofónica. */
(() => {
  const byId=id=>document.getElementById(id);
  const panel=byId('vibratoPanel'), micBtn=byId('vibratoMicBtn'), targetEl=byId('vibratoTarget'), modeEl=byId('vibratoMode'), widthEl=byId('vibratoWidth'), rateEl=byId('vibratoRate'), durationEl=byId('vibratoDuration'), refBtn=byId('vibratoReferenceBtn'), startBtn=byId('vibratoStartBtn');
  const centerEl=byId('vibratoCenter'), measuredWidthEl=byId('vibratoMeasuredWidth'), measuredRateEl=byId('vibratoMeasuredRate'), regularityEl=byId('vibratoRegularity'), onsetEl=byId('vibratoOnset'), chart=byId('vibratoChart'), guide=byId('vibratoGuide'), status=byId('vibratoStatus');
  if(!panel || !chart) return;
  const cctx=chart.getContext('2d');
  let active=false, raf=0, startedAt=0, samples=[], targetHz=440;
  const SETTINGS='cuerdasFrotadas_vibrato_v1';

  function targetInfo(){
    let midi;
    if(targetEl.value==='tutor' && typeof tutorPlan!=='undefined' && tutorPlan?.length){
      const step=tutorPlan[Math.max(0,Math.min(tutorIndex||0,tutorPlan.length-1))];
      midi=step?.notes?.[0]?.midi ?? step?.midi;
    }
    if(!Number.isFinite(midi)) midi=typeof intonationTargetMidi==='function'?intonationTargetMidi():69;
    const hz=(targetEl.value==='intonation' && typeof intonationTargetFrequency==='function')?intonationTargetFrequency():midiFrequency(midi,currentA4());
    return {midi,hz,label:midiLabel(midi)};
  }
  function save(){try{localStorage.setItem(SETTINGS,JSON.stringify({target:targetEl.value,mode:modeEl.value,width:widthEl.value,rate:rateEl.value,duration:durationEl.value}));}catch(e){}}
  function load(){try{const s=JSON.parse(localStorage.getItem(SETTINGS)||'{}'); for(const [el,k] of [[targetEl,'target'],[modeEl,'mode'],[widthEl,'width'],[rateEl,'rate'],[durationEl,'duration']]) if(s[k]&&[...el.options].some(o=>o.value===String(s[k])))el.value=String(s[k]);}catch(e){}}
  [targetEl,modeEl,widthEl,rateEl,durationEl].forEach(el=>el.addEventListener('change',save));

  function drawChart(data=samples){
    const dpr=window.devicePixelRatio||1, rect=chart.getBoundingClientRect(), w=Math.max(300,Math.round(rect.width||960)), h=150;
    if(chart.width!==Math.round(w*dpr)||chart.height!==Math.round(h*dpr)){chart.width=Math.round(w*dpr);chart.height=Math.round(h*dpr);cctx.setTransform(dpr,0,0,dpr,0,0);}
    cctx.clearRect(0,0,w,h);cctx.fillStyle='#11100f';cctx.fillRect(0,0,w,h);
    const yFor=c=>h/2-(Math.max(-60,Math.min(60,c))/60)*(h*.42);
    cctx.strokeStyle='rgba(255,255,255,.10)';cctx.lineWidth=1;
    for(const c of [-50,-25,0,25,50]){const y=yFor(c);cctx.beginPath();cctx.moveTo(0,y);cctx.lineTo(w,y);cctx.stroke();cctx.fillStyle='rgba(255,250,240,.45)';cctx.font='10px sans-serif';cctx.fillText(`${c>0?'+':''}${c}¢`,5,y-3);}
    const goal=modeEl.value==='stable'?5:+widthEl.value;
    cctx.fillStyle='rgba(212,168,79,.08)';cctx.fillRect(0,yFor(goal),w,yFor(-goal)-yFor(goal));
    if(data.length<2)return;
    const total=Math.max(.001,data[data.length-1].t-data[0].t);cctx.strokeStyle='#f1e6d2';cctx.lineWidth=1.8;cctx.beginPath();
    data.forEach((p,i)=>{const x=((p.t-data[0].t)/total)*w,y=yFor(p.c);i?cctx.lineTo(x,y):cctx.moveTo(x,y)});cctx.stroke();
  }
  const median=a=>{const b=a.slice().sort((x,y)=>x-y),n=b.length;return n? (n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2):0};
  function percentile(a,p){if(!a.length)return 0;const b=a.slice().sort((x,y)=>x-y),i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return b[lo]+(b[hi]-b[lo])*(i-lo)}
  function smooth(vals,n=5){return vals.map((_,i)=>{let s=0,k=0;for(let j=Math.max(0,i-n+1);j<=i;j++){s+=vals[j];k++}return s/k})}
  function crossingTimes(times,vals,center){const out=[];let armed=false;for(let i=1;i<vals.length;i++){if(vals[i-1]<center-2)armed=true;if(armed&&vals[i]>=center+2){const dv=vals[i]-vals[i-1]||1,frac=(center-vals[i-1])/dv;out.push(times[i-1]+Math.max(0,Math.min(1,frac))*(times[i]-times[i-1]));armed=false;}}return out}
  function analyze(){
    const valid=samples.filter(p=>Number.isFinite(p.c)&&Math.abs(p.c)<=100); if(valid.length<20){status.textContent='No hubo suficientes muestras estables para analizar.';status.className='vibrato-status bad';return;}
    const times=valid.map(p=>p.t), raw=valid.map(p=>p.c), vals=smooth(raw,5), center=median(vals), p10=percentile(vals,.10),p90=percentile(vals,.90),halfWidth=(p90-p10)/2;
    const crossings=crossingTimes(times,vals,center), periods=crossings.slice(1).map((t,i)=>t-crossings[i]).filter(x=>x>.07&&x<.5), rate=periods.length?1/(periods.reduce((a,b)=>a+b,0)/periods.length):0;
    const meanP=periods.length?periods.reduce((a,b)=>a+b,0)/periods.length:0, sdP=periods.length?Math.sqrt(periods.reduce((s,x)=>s+(x-meanP)**2,0)/periods.length):0, regularity=periods.length?Math.max(0,100-(sdP/meanP)*100):0;
    let onset=0;if(modeEl.value==='delayed'){const thresh=Math.max(6,(+widthEl.value)*.35);const base=median(vals.slice(0,Math.max(5,Math.floor(vals.length*.15))));let idx=vals.findIndex((v,i)=>i>4&&Math.abs(v-base)>=thresh&&vals.slice(i,i+4).filter(x=>Math.abs(x-base)>=thresh).length>=3);onset=idx>=0?times[idx]-times[0]:0;}
    centerEl.textContent=`${center>=0?'+':''}${center.toFixed(1)}¢`;measuredWidthEl.textContent=`±${halfWidth.toFixed(1)}¢`;measuredRateEl.textContent=rate?`${rate.toFixed(1)} Hz`:'—';regularityEl.textContent=periods.length?`${regularity.toFixed(0)}%`:'—';onsetEl.textContent=modeEl.value==='delayed'?(onset?`${onset.toFixed(2)} s`:'no detectada'):'—';
    const targetW=+widthEl.value,targetR=+rateEl.value, centerOK=Math.abs(center)<=8;
    let msg;if(modeEl.value==='stable'){msg=`Centro ${centerOK?'estable':'desplazado'}; variación central ≈ ±${halfWidth.toFixed(1)}¢. Para nota sin vibrato busca una oscilación pequeña y un centro afinado.`;}
    else{const widthDelta=halfWidth-targetW,rateDelta=rate-targetR;msg=`Centro ${center>=0?'+':''}${center.toFixed(1)}¢ · ancho ${halfWidth.toFixed(1)}¢ (${widthDelta>=0?'+':''}${widthDelta.toFixed(1)} vs objetivo) · velocidad ${rate?rate.toFixed(1):'—'} Hz${rate?` (${rateDelta>=0?'+':''}${rateDelta.toFixed(1)} vs objetivo)`:''}.`;if(modeEl.value==='delayed')msg+=` Entrada detectada: ${onset?onset.toFixed(2)+' s':'no clara'}.`;}
    status.textContent=msg;status.className='vibrato-status '+(centerOK?'good':'warn');drawChart(valid);
  }
  function tick(ts){
    if(!active)return;const seconds=(ts-startedAt)/1000,duration=+durationEl.value;
    if(typeof intonationAnalyser!=='undefined'&&intonationAnalyser){const buf=new Float32Array(intonationAnalyser.fftSize);intonationAnalyser.getFloatTimeDomainData(buf);const f=autoCorrelatePitch(buf,intonationAnalyser.context.sampleRate);if(f>0){const c=1200*Math.log2(f/targetHz);if(Number.isFinite(c)&&Math.abs(c)<120)samples.push({t:seconds,c});}}
    if(samples.length%3===0)drawChart();status.textContent=`Analizando… ${Math.min(duration,seconds).toFixed(1)} / ${duration.toFixed(0)} s`;
    if(seconds>=duration){active=false;startBtn.textContent='Iniciar análisis';analyze();return;}raf=requestAnimationFrame(tick);
  }
  function start(){
    if(active){active=false;cancelAnimationFrame(raf);startBtn.textContent='Iniciar análisis';status.textContent='Análisis detenido.';return;}
    if(typeof intonationAnalyser==='undefined'||!intonationAnalyser){status.textContent='Activa el micrófono primero. El módulo comparte el detector monofónico de Entonación.';status.className='vibrato-status warn';return;}
    const info=targetInfo();targetHz=info.hz;samples=[];centerEl.textContent=measuredWidthEl.textContent=measuredRateEl.textContent=regularityEl.textContent=onsetEl.textContent='—';active=true;startedAt=performance.now();startBtn.textContent='Detener';status.className='vibrato-status';status.textContent=`Objetivo ${info.label} · ${targetHz.toFixed(2)} Hz. Mantén una sola nota.`;drawChart([]);raf=requestAnimationFrame(tick);
  }
  micBtn.addEventListener('click',()=>{if(typeof intonationMicBtn!=='undefined'&&intonationMicBtn){intonationMicBtn.click();status.textContent='El vibrato usa el mismo micrófono del módulo Entonación.';}else status.textContent='No se encontró el módulo de Entonación.';});
  refBtn.addEventListener('click',()=>{const info=targetInfo();if(typeof playReferenceFrequency==='function')playReferenceFrequency(info.hz,1.5);else if(typeof playNote==='function')playNote(info.midi,1.5);status.textContent=`Referencia: ${info.label} · ${info.hz.toFixed(2)} Hz.`;});
  startBtn.addEventListener('click',start);window.addEventListener('resize',()=>drawChart());
  load();drawChart();
})();
