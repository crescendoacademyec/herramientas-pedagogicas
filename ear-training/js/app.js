(function () {
  'use strict';

  const D = window.ETData;
  const S = window.ETStorage;
  const G = window.ETGenerators;
  const { AudioEngine, INSTRUMENTS } = window.ETAudio;
  const audio = new AudioEngine();

  const app = document.getElementById('app');
  const levelNav = document.getElementById('levelNav');
  document.getElementById('year').textContent = new Date().getFullYear();

  const state = {
    level: Number(S.getPref('activeLevel') || 1),
    mode: S.getPref('mode') || 'practice',
    round: null,
    session: { correct:0,total:0,streak:0,streakMax:0 },
    errorPractice: null,
    challenge: null,
    challengeResult: null,
    timerId: null,
    audioUnlocked: false
  };

  audio.setVolume(Number(S.getPref('volume') ?? 0.78));
  audio.setInstrument(S.getPref('instrument') || 'piano');

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function fmtTime(sec){sec=Math.max(0,Math.round(Number(sec)||0));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;}
  function fmtDate(iso){try{return new Intl.DateTimeFormat('es-EC',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso));}catch(_){return iso||'';}}
  function levelInfo(id=state.level){return D.LEVELS.find(x=>x.id===Number(id))||D.LEVELS[0];}
  function deepClone(v){return JSON.parse(JSON.stringify(v));}

  function captureConfig(level=state.level){
    return {
      level:Number(level),
      intervals:S.getSelection('intervals'),
      chords:S.getSelection('chords'),
      level3Targets:S.getSelection('level3Targets'),
      level3Refs:S.getSelection('level3Refs'),
      level3Type:S.getPref('level3Type')||'tetrad',
      intervalMode:S.getPref('intervalMode')||'random',
      register:S.getPref('register')||'random',
      chordVoicing:S.getPref('chordVoicing')||'root',
      tonalReference:S.getPref('tonalReference')||'chord',
      instrument:S.getPref('instrument')||'piano',
      autoplay:Boolean(S.getPref('autoplay')),
      volume:Number(S.getPref('volume')??0.78)
    };
  }

  function effectiveConfig(){
    const cfg = state.challenge ? deepClone(state.challenge.configSnapshot) : captureConfig();
    if(state.errorPractice && state.errorPractice.level===state.level) cfg.forcedConceptIds=state.errorPractice.targetIds.slice();
    return cfg;
  }

  function renderNav(){
    levelNav.innerHTML=D.LEVELS.map(l=>`<button class="level-btn ${l.id===state.level?'active':''}" data-action="level" data-level="${l.id}" ${state.challenge?'disabled':''}><b>${l.id}</b>${esc(l.short)}</button>`).join('');
  }

  function statsHtml(){
    const st=S.getLevelStats(state.level); const pct=st.total?Math.round(st.correct*100/st.total):0;
    return `<span class="stats-line"><b>${st.correct}</b>/${st.total} · racha <b>${state.session.streak}</b> · máx <b>${st.streakMax}</b> · <b>${pct}%</b></span>`;
  }

  function modeTabs(){
    return `<div class="mode-tabs" role="tablist" aria-label="Modo">
      <button data-action="mode" data-mode="practice" class="${state.mode==='practice'?'active':''}" ${state.challenge?'disabled':''}>Practicar</button>
      <button data-action="mode" data-mode="learn" class="${state.mode==='learn'?'active':''}" ${state.challenge?'disabled':''}>Aprender</button>
      <button data-action="mode" data-mode="progress" class="${state.mode==='progress'?'active':''}" ${state.challenge?'disabled':''}>Progreso</button>
    </div>`;
  }

  function renderApp(){
    renderNav();
    const lv=levelInfo();
    app.innerHTML=`<section class="card">
      <header class="card-head"><div><div class="eyebrow">Nivel ${lv.id}</div><h2>${esc(lv.title)}</h2><p class="subtitle">${esc(lv.instr)}</p></div>${statsHtml()}</header>
      ${modeTabs()}<div id="view"></div>
    </section>`;
    if(state.mode==='practice') renderPractice();
    else if(state.mode==='learn') renderLearn();
    else renderProgress();
  }

  function prefSelect(name,label,options,current,disabled=false){
    return `<div class="field"><label for="pref-${name}">${esc(label)}</label><select id="pref-${name}" data-pref="${name}" ${disabled?'disabled':''}>${options.map(([v,t])=>`<option value="${esc(v)}" ${String(current)===String(v)?'selected':''}>${esc(t)}</option>`).join('')}</select></div>`;
  }

  function commonSettings(){
    const locked=Boolean(state.challenge);
    const inst=S.getPref('instrument')||'piano';
    const register=S.getPref('register')||'random';
    let html=`<div class="settings-grid">
      ${prefSelect('instrument','Instrumento',Object.entries(INSTRUMENTS).map(([k,v])=>[k,v.label]),inst,locked)}
      ${prefSelect('register','Registro',[['low','Grave'],['mid','Medio'],['high','Agudo'],['random','Aleatorio']],register,locked)}
      <div class="field"><label for="volume">Volumen</label><input id="volume" type="range" min="0" max="1" step="0.01" value="${Number(S.getPref('volume')??0.78)}" data-pref="volume"></div>
      <label class="toggle-row"><input type="checkbox" data-pref="autoplay" ${S.getPref('autoplay')?'checked':''} ${locked?'disabled':''}> Reproducción automática</label>
      <div class="field"><label for="challengeMinutes">Challenge (min)</label><input id="challengeMinutes" type="number" min="1" max="30" value="${Number(S.getPref('challengeMinutes')||5)}" data-pref="challengeMinutes" ${locked?'disabled':''}></div>`;
    if(state.level===1) html+=prefSelect('intervalMode','Tipo de intervalo',[['ascending','Melódico ↑'],['descending','Melódico ↓'],['harmonic','Armónico'],['random','Aleatorio (↑/↓/armónico)']],S.getPref('intervalMode')||'random',locked);
    if(state.level===2) html+=prefSelect('chordVoicing','Voicing',[['root','Posición fundamental'],['inversions','Inversiones'],['open','Abierto / drop 2'],['random','Aleatorio']],S.getPref('chordVoicing')||'root',locked);
    if(state.level===3) html+=prefSelect('level3Type','Tipo diatónico',[['triad','Tríadas'],['tetrad','Cuatríadas']],S.getPref('level3Type')||'tetrad',locked);
    if(state.level>=4) html+=prefSelect('tonalReference','Referencia tonal',[['note','Nota tónica'],['chord','Imaj7'],['cadence','I–IV–V–I']],S.getPref('tonalReference')||'chord',locked);
    html+='</div>';
    return html;
  }

  function intervalConfig(){
    const selected=new Set(S.getSelection('intervals')),locked=Boolean(state.challenge);
    return `<div class="config-section ${locked?'locked':''}"><h3>Intervalos a practicar</h3>
      <div class="preset-row">${Object.entries(D.INTERVAL_PRESETS).map(([k,p])=>`<button class="mini-btn" data-action="interval-preset" data-preset="${k}" ${locked?'disabled':''}>${esc(p.label)}</button>`).join('')}</div>
      <div class="check-grid">${D.INTERVALS.map(iv=>`<label class="check-item"><input type="checkbox" data-selection="intervals" value="${iv.semitones}" ${selected.has(iv.semitones)?'checked':''} ${locked?'disabled':''}><span><strong>${esc(iv.name)}</strong><small>${iv.semitones} semitonos · Ej.: ${esc(iv.example)}</small></span></label>`).join('')}</div></div>`;
  }

  function chordConfig(){
    const selected=new Set(S.getSelection('chords')),locked=Boolean(state.challenge);
    const groups=[...new Set(D.CHORD_BANK.map(c=>c.group))];
    return `<div class="config-section ${locked?'locked':''}"><h3>Banco de acordes · ${D.CHORD_BANK.length} sonoridades</h3>
      <div class="preset-row">${Object.entries(D.CHORD_PRESETS).map(([k,p])=>`<button class="mini-btn" data-action="chord-preset" data-preset="${k}" ${locked?'disabled':''}>${esc(p.label)}</button>`).join('')}</div>
      <div class="group-list">${groups.map((g,idx)=>`<details ${idx<2?'open':''}><summary>${esc(g)} · ${D.CHORD_BANK.filter(c=>c.group===g).length}</summary><div class="check-grid">${D.CHORD_BANK.filter(c=>c.group===g).map(ch=>`<label class="check-item"><input type="checkbox" data-selection="chords" value="${ch.id}" ${selected.has(ch.id)?'checked':''} ${locked?'disabled':''}><span><strong>C${esc(ch.symbol)}</strong><small>${esc(ch.name)} · ${esc(D.formulaLabel(ch.intervals))}</small></span></label>`).join('')}</div></details>`).join('')}</div></div>`;
  }

  function level3Config(){
    const t=new Set(S.getSelection('level3Targets')),r=new Set(S.getSelection('level3Refs')),locked=Boolean(state.challenge),type=S.getPref('level3Type')||'tetrad';
    const labels=type==='triad'?D.LEVEL3_TRIAD_ROMAN:D.LEVEL3_TETRAD_ROMAN;
    const grid=(key,set)=>`<div class="check-grid">${labels.map((lab,i)=>`<label class="check-item"><input type="checkbox" data-selection="${key}" value="${i}" ${set.has(i)?'checked':''} ${locked?'disabled':''}><span><strong>${esc(lab)}</strong><small>grado ${i+1}</small></span></label>`).join('')}</div>`;
    return `<div class="config-section ${locked?'locked':''}"><h3>Grados de referencia</h3>${grid('level3Refs',r)}<h3 style="margin-top:14px">Grados objetivo</h3>${grid('level3Targets',t)}</div>`;
  }

  function challengeHtml(){
    if(state.challenge){
      const c=state.challenge;
      return `<div class="challenge-box"><div class="challenge-row"><span class="badge active">Challenge activo · configuración congelada</span><span id="challengeTimer" class="timer">${fmtTime(c.remaining)}</span><button class="danger-btn" data-action="cancel-challenge">Cancelar</button></div><p class="challenge-note">Nivel ${c.level} · ${esc(levelInfo(c.level).title)}. Los cambios de configuración quedan bloqueados hasta finalizar.</p></div>`;
    }
    const r=state.challengeResult;
    return `<div class="challenge-box"><div class="challenge-row"><button class="primary-btn" data-action="start-challenge">Iniciar Challenge</button><span class="timer">${fmtTime(Number(S.getPref('challengeMinutes')||5)*60)}</span>${r&&r.wrong>0?`<button class="ghost-btn" data-action="practice-result-errors">Practicar errores (${r.wrong})</button>`:''}</div><p class="challenge-note">Cada Challenge guarda nivel, configuración exacta, respuestas, duración, porcentaje, racha y conceptos fallados.</p>${r?`<div class="summary-grid"><div class="metric">Aciertos<b>${r.correct}</b></div><div class="metric">Errores<b>${r.wrong}</b></div><div class="metric">Precisión<b>${r.pct}%</b></div><div class="metric">Racha máx<b>${r.streakMax}</b></div></div>`:''}</div>`;
  }

  function renderPractice(){
    const view=document.getElementById('view');
    const errorBadge=state.errorPractice?`<div class="learn-note"><b>Modo revisión de errores:</b> se están generando preguntas solo con ${state.errorPractice.targetIds.length} concepto(s) fallado(s). <button class="mini-btn" data-action="stop-error-practice">Salir de revisión</button></div>`:'';
    let specific=''; if(state.level===1)specific=intervalConfig(); else if(state.level===2)specific=chordConfig(); else if(state.level===3)specific=level3Config();
    view.innerHTML=`${errorBadge}<details class="settings"><summary><span>Configuración de práctica</span><span>⚙</span></summary><div class="settings-panel">${commonSettings()}${specific}</div></details>
      <div class="practice-grid"><div class="stage"><button id="playBtn" class="play-btn" data-action="play" aria-label="Escuchar ejercicio">▶<br><small>Escuchar</small></button><div id="stageHint" class="stage-hint">Espacio para reproducir</div></div><div id="options" class="options" role="group" aria-label="Respuestas"></div><div id="feedback" class="feedback" aria-live="polite">Escucha y selecciona una respuesta.</div><div class="practice-actions"><button id="nextBtn" class="ghost-btn" data-action="next" disabled>Siguiente · N</button></div></div>${challengeHtml()}`;
    newRound();
  }

  function newRound(){
    if(state.mode!=='practice')return;
    state.round=G.generate(state.level,effectiveConfig());
    state.round.answered=false;
    renderRound();
    if(S.getPref('autoplay') && state.audioUnlocked && state.round.seq?.length) setTimeout(playRound,180);
  }

  function renderRound(){
    const opts=document.getElementById('options'); if(!opts||!state.round)return;
    const count=state.round.options.length; opts.style.gridTemplateColumns=count<=2?'1fr':count===3?'repeat(3,1fr)':'repeat(2,1fr)';
    opts.innerHTML=state.round.options.map((o,i)=>`<button class="opt-btn" data-action="answer" data-index="${i}" ${state.round.disabled?'disabled':''}><span class="key-hint">${i<9?`${i+1}. `:''}</span>${esc(o.label)}</button>`).join('');
    const fb=document.getElementById('feedback'); if(fb)fb.innerHTML=state.round.disabled?state.round.feedback():'Escucha y selecciona una respuesta.';
    const next=document.getElementById('nextBtn'); if(next)next.disabled=true;
  }

  async function playRound(){
    state.audioUnlocked=true;
    if(!state.round?.seq?.length)return;
    const hint=document.getElementById('stageHint'); if(hint)hint.textContent='Reproduciendo…';
    await audio.playSequence(state.round.seq);
    const total=Math.max(...state.round.seq.map(s=>Number(s.start||0)+Number(s.dur||0)),0);
    setTimeout(()=>{const h=document.getElementById('stageHint');if(h)h.textContent='Repetir · Espacio';},Math.ceil(total*1000));
  }

  function answerRound(index){
    const r=state.round; if(!r||r.answered||r.disabled)return;
    const i=Number(index); if(!Number.isInteger(i)||!r.options[i])return;
    r.answered=true; const correct=i===r.correctIdx; const selected=r.options[i]; const expected=r.options[r.correctIdx];
    state.session.total++; if(correct){state.session.correct++;state.session.streak++;}else state.session.streak=0; state.session.streakMax=Math.max(state.session.streakMax,state.session.streak);
    S.recordAnswer(state.level,correct,state.session.streakMax,r.meta);

    if(state.challenge){
      const c=state.challenge;c.stats.total++;if(correct){c.stats.correct++;c.stats.streak++;}else c.stats.streak=0;c.stats.streakMax=Math.max(c.stats.streakMax,c.stats.streak);
      c.answers.push({n:c.stats.total,at:new Date().toISOString(),correct,selectedId:selected.id,selected:selected.label,expectedId:expected.id,expected:expected.label,meta:deepClone(r.meta)});
    }

    [...document.querySelectorAll('#options .opt-btn')].forEach((b,idx)=>{b.disabled=true;if(idx===r.correctIdx)b.classList.add('correct');else if(idx===i)b.classList.add('wrong');});
    const fb=document.getElementById('feedback'); if(fb)fb.innerHTML=r.feedback(correct,selected);
    const next=document.getElementById('nextBtn'); if(next)next.disabled=false;
    const stats=document.querySelector('.stats-line'); if(stats)stats.outerHTML=statsHtml();
    if(state.challenge)setTimeout(()=>{if(state.challenge)newRound();},950);
  }

  function startChallenge(){
    const mins=Math.max(1,Math.min(30,Number(S.getPref('challengeMinutes')||5)));
    state.errorPractice=null;
    state.challenge={level:state.level,startedAt:new Date().toISOString(),plannedMinutes:mins,remaining:mins*60,configSnapshot:captureConfig(),stats:{correct:0,total:0,streak:0,streakMax:0},answers:[]};
    state.challengeResult=null;
    clearInterval(state.timerId);
    state.timerId=setInterval(()=>{if(!state.challenge)return;state.challenge.remaining--;const el=document.getElementById('challengeTimer');if(el)el.textContent=fmtTime(state.challenge.remaining);if(state.challenge.remaining<=0)finishChallenge('completed');},1000);
    renderApp();
  }

  function finishChallenge(status='completed'){
    if(!state.challenge)return;
    clearInterval(state.timerId);state.timerId=null;
    const c=state.challenge,total=c.stats.total,correct=c.stats.correct,wrong=Math.max(0,total-correct),pct=total?Math.round(correct*100/total):0,elapsed=Math.max(0,c.plannedMinutes*60-c.remaining);
    const item=S.addHistory({type:'challenge',status,startedAt:c.startedAt,level:c.level,levelTitle:levelInfo(c.level).title,plannedMinutes:c.plannedMinutes,elapsedSeconds:elapsed,correct,total,wrong,pct,streakMax:c.stats.streakMax,configSnapshot:c.configSnapshot,answers:c.answers});
    state.challengeResult={id:item.id,level:c.level,correct,total,wrong,pct,streakMax:c.stats.streakMax,targetIds:[...new Set(c.answers.filter(a=>!a.correct).map(a=>a.meta?.targetId).filter(Boolean))]};
    state.challenge=null;renderApp();
  }

  function startErrorPractice(level,targetIds,source){
    const clean=[...new Set((targetIds||[]).filter(Boolean))];if(!clean.length)return;
    state.level=Number(level);S.setPref('activeLevel',state.level);state.mode='practice';S.setPref('mode','practice');state.errorPractice={level:state.level,targetIds:clean,source:source||'errores'};state.session={correct:0,total:0,streak:0,streakMax:0};renderApp();
  }

  function renderLearn(){
    const view=document.getElementById('view');
    if(state.level===1){
      view.innerHTML=`<div class="learn-note"><b>Guía:</b> el nombre del intervalo define la distancia; “Do → …” es solo un ejemplo. El tritono puede escribirse como 4ª aumentada o 5ª disminuida según el contexto. Las canciones son referencias mnemónicas: la asociación puede corresponder a un fragmento específico y conviene verificarlo en clase.</div><div class="learn-grid">${D.INTERVALS.map(iv=>`<article class="learn-item"><div><h3>${esc(iv.name)}</h3><span class="formula">${iv.semitones} semitonos · ${esc(iv.example)}</span></div><div><p><b>Asc.:</b> ${esc(iv.ascRefs.join(' · '))}</p><p><b>Desc.:</b> ${esc(iv.descRefs.join(' · '))}</p></div><div class="sample-actions"><button class="sample-btn text" data-action="sample-interval" data-semitones="${iv.semitones}" data-direction="ascending">↑ Asc</button><button class="sample-btn text" data-action="sample-interval" data-semitones="${iv.semitones}" data-direction="descending">↓ Desc</button><button class="sample-btn text" data-action="sample-interval" data-semitones="${iv.semitones}" data-direction="harmonic">♬ Arm</button></div></article>`).join('')}</div>`;
      return;
    }
    if(state.level===2){
      const groups=[...new Set(D.CHORD_BANK.map(c=>c.group))];
      view.innerHTML=`<div class="learn-note"><b>Banco oficial:</b> ${D.CHORD_BANK.length} sonoridades transcritas de la imagen de referencia. Los alias de cifrado se muestran dentro del mismo acorde para evitar preguntas auditivamente imposibles. Ejemplo: <b>Cm(maj7)</b> = 1–♭3–5–7.</div>${groups.map(g=>`<h3 class="section-title">${esc(g)}</h3><div class="learn-grid">${D.CHORD_BANK.filter(c=>c.group===g).map(ch=>`<article class="learn-item"><div><h3>C${esc(ch.symbol)}</h3><span class="formula">${esc(D.formulaLabel(ch.intervals))}</span></div><div><p>${esc(ch.name)}${ch.aliases.length?` · Alias: ${esc(ch.aliases.join(', '))}`:''}</p></div><div class="sample-actions"><button class="sample-btn" aria-label="Escuchar C${esc(ch.symbol)}" data-action="sample-chord" data-chord="${ch.id}">▶</button></div></article>`).join('')}</div>`).join('')}`;
      return;
    }
    const cards=D.LEARN_OVERVIEW[state.level]||[];
    view.innerHTML=`<div class="learn-note">En los niveles armónicos, usa las tres referencias tonales (nota, Imaj7 y I–IV–V–I) para comprobar cuánto contexto necesitas antes de identificar la función.</div><div class="learn-grid">${cards.map(c=>`<article class="learn-item"><div><h3>${esc(c.title)}</h3></div><div><p>${esc(c.desc)}</p></div><div class="sample-actions"><button class="sample-btn text" data-action="sample-generated">▶ Ejemplo</button></div></article>`).join('')}</div>`;
  }

  function progressData(){
    const history=S.getHistory();const challenges=history.filter(h=>h.type==='challenge'&&h.status==='completed');const last7=challenges.slice(0,7);const avg=last7.length?Math.round(last7.reduce((a,x)=>a+Number(x.pct||0),0)/last7.length):0;const best=challenges.length?Math.max(...challenges.map(x=>Number(x.pct||0))):0;const seconds=challenges.reduce((a,x)=>a+Number(x.elapsedSeconds||0),0);const concepts=S.getConceptStats();const weak=concepts.filter(x=>x.total>=2).map(x=>({...x,pct:Math.round(x.correct*100/x.total)})).sort((a,b)=>a.pct-b.pct||b.total-a.total);
    return {history,challenges,last7,avg,best,seconds,concepts,weak};
  }

  function configSummary(c){
    if(!c)return 'Configuración no disponible (intento de una versión anterior).';
    const parts=[`registro: ${c.register||'—'}`,`instrumento: ${INSTRUMENTS[c.instrument]?.label||c.instrument||'—'}`];
    if(Number(c.level)===1)parts.push(`intervalos: ${(c.intervals||[]).length}`,`modo: ${c.intervalMode||'—'}`);
    if(Number(c.level)===2)parts.push(`acordes: ${(c.chords||[]).length}`,`voicing: ${c.chordVoicing||'—'}`);
    if(Number(c.level)===3)parts.push(`tipo: ${c.level3Type||'—'}`);
    if(Number(c.level)>=4)parts.push(`referencia: ${c.tonalReference||'—'}`);
    return parts.join(' · ');
  }

  function renderProgress(){
    const view=document.getElementById('view'),p=progressData();
    const totalAnswers=p.concepts.reduce((a,x)=>a+Number(x.total||0),0);
    const weakHtml=p.weak.length?p.weak.slice(0,10).map(w=>`<div class="weak-row"><div class="weak-name">N${w.level} · ${esc(w.targetName)}</div><div class="bar"><span style="width:${Math.max(4,w.pct)}%"></span></div><div class="weak-score">${w.correct}/${w.total} · ${w.pct}%</div></div>`).join(''):'<div class="empty">Responde al menos dos veces cada concepto para detectar debilidades.</div>';
    const byLevel={};p.weak.slice(0,12).forEach(w=>{(byLevel[w.level]||(byLevel[w.level]=[])).push(w.targetId);});
    const weakButtons=Object.entries(byLevel).map(([lvl,ids])=>`<button class="mini-btn" data-action="practice-weak" data-level="${lvl}" data-targets="${esc(JSON.stringify(ids))}">Practicar debilidades N${lvl}</button>`).join('');
    const historyHtml=p.history.length?p.history.map(h=>historyEntry(h)).join(''):'<div class="empty">Todavía no hay Challenges ni reinicios guardados.</div>';
    view.innerHTML=`<div class="progress-top"><div class="progress-card">Promedio · últimos 7<b>${p.avg}%</b></div><div class="progress-card">Mejor Challenge<b>${p.best}%</b></div><div class="progress-card">Tiempo en Challenge<b>${Math.round(p.seconds/60)} min</b></div><div class="progress-card">Respuestas analizadas<b>${totalAnswers}</b></div></div><h3 class="section-title" style="margin-top:20px">Conceptos a reforzar</h3><div class="weak-list">${weakHtml}</div><div class="preset-row" style="margin-top:10px">${weakButtons}</div><h3 class="section-title" style="margin-top:20px">Historial</h3><div class="history">${historyHtml}</div><div class="data-actions"><button class="danger-btn" data-action="reset-progress">Reiniciar progreso</button><button class="ghost-btn" data-action="reset-config">Restaurar configuración</button><button class="danger-btn" data-action="erase-all">Borrar todos los datos</button><button class="ghost-btn" data-action="clear-history">Borrar solo historial</button></div>`;
  }

  function historyEntry(h){
    if(h.type==='challenge'){
      const wrong=Number(h.wrong??Math.max(0,Number(h.total||0)-Number(h.correct||0)));const errs=[...new Set((h.answers||[]).filter(a=>!a.correct).map(a=>a.meta?.targetId).filter(Boolean))];
      return `<details class="history-entry"><summary><div><div class="history-title">⏱ Challenge · Nivel ${esc(h.level)} · ${esc(h.levelTitle||'')}</div><div class="history-date">${fmtDate(h.date)} · ${h.status==='cancelled'?'Cancelado':'Completado'}</div></div><div class="history-score">${Number(h.correct||0)}/${Number(h.total||0)} · ${Number(h.pct||0)}%</div></summary><div class="history-body"><div class="metric-grid"><div class="metric">Aciertos<b>${Number(h.correct||0)}</b></div><div class="metric">Errores<b>${wrong}</b></div><div class="metric">Racha máx<b>${Number(h.streakMax||0)}</b></div><div class="metric">Tiempo<b>${fmtTime(h.elapsedSeconds||0)}</b></div></div><p class="history-config"><b>Configuración:</b> ${esc(configSummary(h.configSnapshot))}</p>${errs.length?`<button class="mini-btn" data-action="practice-history-errors" data-history-id="${esc(h.id)}">Practicar errores (${errs.length})</button>`:''}<div class="answer-log" style="margin-top:9px">${(h.answers||[]).map(a=>`<div class="answer-row ${a.correct?'ok':'err'}"><span>${a.correct?'✓':'✕'}</span><span><strong>#${esc(a.n)} ${esc(a.meta?.targetName||a.expected||'')}</strong> · elegiste ${esc(a.selected)}${a.correct?'':` · correcta: ${esc(a.expected)}`}</span></div>`).join('')||'<div class="empty">Sin respuestas registradas.</div>'}</div></div></details>`;
    }
    const t=h.totals||{correct:0,total:0,streakMax:0};const pct=t.total?Math.round(t.correct*100/t.total):0;
    return `<details class="history-entry"><summary><div><div class="history-title">🔄 Reinicio de progreso</div><div class="history-date">${fmtDate(h.date)}</div></div><div class="history-score">${t.correct}/${t.total} · ${pct}%</div></summary><div class="history-body"><p class="history-config">Se archivó automáticamente el estado de las estadísticas antes de reiniciarlas. La configuración de práctica se conservó.</p></div></details>`;
  }

  async function sampleInterval(semitones,direction){
    const s=Number(semitones),root=60;let seq;if(direction==='harmonic')seq=[{notes:[root,root+s],start:0,dur:1.8,vel:.8}];else if(direction==='descending')seq=[{notes:[root],start:0,dur:.6,vel:.7},{notes:[root-s],start:.9,dur:1.3,vel:.8}];else seq=[{notes:[root],start:0,dur:.6,vel:.7},{notes:[root+s],start:.9,dur:1.3,vel:.8}];await audio.playSequence(seq);
  }
  async function sampleChord(id){const c=D.CHORD_BANK.find(x=>x.id===id);if(c)await audio.playSequence([{notes:c.intervals.map(iv=>48+iv),start:0,dur:2.4,vel:.82}]);}

  function updateSelection(key,value,checked){
    let arr=S.getSelection(key);const parsed=(key==='intervals'||key.startsWith('level3'))?Number(value):value;
    if(checked&&!arr.includes(parsed))arr.push(parsed);if(!checked)arr=arr.filter(x=>x!==parsed);S.setSelection(key,arr);
    if(state.mode==='practice'&&!state.challenge)newRound();
  }

  app.addEventListener('click',e=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;const a=btn.dataset.action;
    if(a==='mode'){if(state.challenge)return;state.mode=btn.dataset.mode;S.setPref('mode',state.mode);renderApp();}
    else if(a==='play')playRound();
    else if(a==='next')newRound();
    else if(a==='answer')answerRound(btn.dataset.index);
    else if(a==='interval-preset'){S.setSelection('intervals',D.INTERVAL_PRESETS[btn.dataset.preset].ids);renderApp();}
    else if(a==='chord-preset'){S.setSelection('chords',D.CHORD_PRESETS[btn.dataset.preset].ids);renderApp();}
    else if(a==='start-challenge')startChallenge();
    else if(a==='cancel-challenge'){if(confirm('¿Cancelar este Challenge? El intento se guardará como cancelado.'))finishChallenge('cancelled');}
    else if(a==='practice-result-errors'&&state.challengeResult)startErrorPractice(state.challengeResult.level,state.challengeResult.targetIds,'último Challenge');
    else if(a==='stop-error-practice'){state.errorPractice=null;renderApp();}
    else if(a==='sample-interval')sampleInterval(btn.dataset.semitones,btn.dataset.direction);
    else if(a==='sample-chord')sampleChord(btn.dataset.chord);
    else if(a==='sample-generated'){const r=G.generate(state.level,captureConfig());audio.playSequence(r.seq||[]);}
    else if(a==='practice-history-errors'){const h=S.getHistory().find(x=>x.id===btn.dataset.historyId);if(h){const ids=[...new Set((h.answers||[]).filter(x=>!x.correct).map(x=>x.meta?.targetId).filter(Boolean))];startErrorPractice(h.level,ids,'Challenge');}}
    else if(a==='practice-weak'){try{startErrorPractice(Number(btn.dataset.level),JSON.parse(btn.dataset.targets),'debilidades');}catch(_){}}
    else if(a==='reset-progress'){if(confirm('¿Reiniciar únicamente el progreso? Se guardará un informe y se conservarán tus configuraciones.')){S.resetProgress();state.session={correct:0,total:0,streak:0,streakMax:0};renderApp();}}
    else if(a==='reset-config'){if(confirm('¿Restaurar las configuraciones de práctica? Tus estadísticas e historial no se borrarán.')){S.resetConfiguration();audio.setVolume(Number(S.getPref('volume')));audio.setInstrument(S.getPref('instrument'));renderApp();}}
    else if(a==='erase-all'){if(confirm('¿Borrar TODOS los datos locales de la app? Esta acción elimina progreso, historial y configuración.')){S.eraseAll();location.reload();}}
    else if(a==='clear-history'){if(confirm('¿Borrar solo el historial de Challenges y reinicios? Las estadísticas actuales se conservan.')){S.clearHistory();renderProgress();}}
  });

  levelNav.addEventListener('click',e=>{
    const b=e.target.closest('[data-action="level"]');if(!b||state.challenge)return;state.level=Number(b.dataset.level);S.setPref('activeLevel',state.level);state.session={correct:0,total:0,streak:0,streakMax:0};state.errorPractice=null;renderApp();
  });

  app.addEventListener('change',e=>{
    const el=e.target;
    if(el.dataset.selection)updateSelection(el.dataset.selection,el.value,el.checked);
    if(el.dataset.pref){
      const key=el.dataset.pref;let value=el.type==='checkbox'?el.checked:el.value;
      if(key==='challengeMinutes')value=Math.max(1,Math.min(30,Number(value)||5));
      if(key==='volume')value=Number(value);
      S.setPref(key,value);
      if(key==='instrument')audio.setInstrument(value);
      if(key==='volume')audio.setVolume(value);
      if(['intervalMode','register','chordVoicing','tonalReference','level3Type'].includes(key)&&state.mode==='practice'&&!state.challenge)newRound();
      if(key==='level3Type'&&state.mode==='practice')renderApp();
    }
  });

  app.addEventListener('input',e=>{
    if(e.target.dataset.pref==='volume'){const v=Number(e.target.value);audio.setVolume(v);S.setPref('volume',v);}
  });

  document.addEventListener('keydown',e=>{
    if(state.mode!=='practice')return;
    const tag=e.target?.tagName?.toLowerCase();if(['input','select','textarea','button'].includes(tag))return;
    if(e.code==='Space'){e.preventDefault();playRound();return;}
    if((e.key==='n'||e.key==='N')&&state.round?.answered){e.preventDefault();newRound();return;}
    if(/^[1-9]$/.test(e.key)){const idx=Number(e.key)-1;if(state.round?.options?.[idx]){e.preventDefault();answerRound(idx);}}
  });

  window.addEventListener('beforeunload',()=>clearInterval(state.timerId));
  document.addEventListener('pointerdown',()=>{state.audioUnlocked=true;audio.ensureContext();},{once:true});

  renderApp();
})();
