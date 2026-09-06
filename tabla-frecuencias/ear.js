(function () {
  const $ = (id) => document.getElementById(id);
  const fmtHzEar = (f) => (f >= 1000 ? (Number.isInteger(f / 1000) ? (f / 1000) + ' kHz' : (f / 1000).toFixed(2).replace(/0$/, '') + ' kHz') : f + ' Hz');

  const STATS_NOISE_KEY = 'crescendo-ear-noise-stats-v2';
  const STATS_TONE_KEY = 'crescendo-ear-tone-stats-v2';
  const STATS_DIR_KEY = 'crescendo-ear-direction-stats-v3';
  const HISTORY_NOISE_KEY = 'crescendo-ear-noise-history-v3';
  const HISTORY_TONE_KEY = 'crescendo-ear-tone-history-v3';
  const HISTORY_DIR_KEY = 'crescendo-ear-direction-history-v3';
  const SESSION_HISTORY_KEY = 'crescendo-ear-practice-sessions-v4';
  const SESSION_GOAL_KEY = 'crescendo-ear-practice-goal-v4';

  function loadStats(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) { return {}; }
  }
  function saveStats(key, stats) {
    try { localStorage.setItem(key, JSON.stringify(stats)); } catch (_) {}
  }
  function recordBand(stats, freq, correct) {
    const k = String(freq);
    const row = stats[k] || { correct: 0, total: 0, recent: [] };
    row.total += 1;
    if (correct) row.correct += 1;
    row.recent = Array.isArray(row.recent) ? row.recent : [];
    row.recent.push(correct ? 1 : 0);
    if (row.recent.length > 8) row.recent.shift();
    stats[k] = row;
  }
  function statAccuracy(row) {
    return row && row.total ? row.correct / row.total : null;
  }
  function loadHistory(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v.slice(-24) : [];
    } catch (_) { return []; }
  }
  function saveHistory(key, history) {
    try { localStorage.setItem(key, JSON.stringify(history.slice(-24))); } catch (_) {}
  }
  function pushHistory(history, key, item) {
    history.push(item);
    if (history.length > 24) history.shift();
    saveHistory(key, history);
  }
  function renderProgress(el, history, showDirection = false) {
    if (!el) return;
    if (!history.length) {
      el.innerHTML = '<span style="font-size:.68rem;color:var(--muted)">Sin rondas todavía</span>';
      return;
    }
    el.innerHTML = history.map((x) => {
      const dirClass = showDirection && x.dir ? ` ${x.dir}` : '';
      const title = `${x.ok ? 'Correcto' : 'Incorrecto'}${x.freq ? ' · ' + fmtHzEar(x.freq) : ''}${x.dir ? ' · ' + x.dir : ''}`;
      return `<span class="ear-progress-dot ${x.ok ? 'ok' : 'bad'}${dirClass}" title="${title}"></span>`;
    }).join('');
  }

  /* =========================================================
     SESIONES DE PRÁCTICA
     ========================================================= */
  const PracticeSession = (function () {
    let startedAt = null;
    let timerId = null;
    let rounds = 0, correct = 0;
    let byModule = { noise:{total:0,correct:0}, direction:{total:0,correct:0}, tone:{total:0,correct:0} };
    let goal = Number(localStorage.getItem(SESSION_GOAL_KEY) || 20);
    if (![10,20,30,50].includes(goal)) goal = 20;

    function loadHistory() {
      try {
        const v = JSON.parse(localStorage.getItem(SESSION_HISTORY_KEY) || '[]');
        return Array.isArray(v) ? v.slice(-30) : [];
      } catch (_) { return []; }
    }
    function saveHistory(items) {
      try { localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(items.slice(-30))); } catch (_) {}
    }
    function fmtDuration(sec) {
      sec = Math.max(0, Math.floor(sec || 0));
      const m = Math.floor(sec/60), s = sec%60;
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    function elapsed() {
      return startedAt ? (Date.now()-startedAt)/1000 : 0;
    }
    function startIfNeeded() {
      if (startedAt) return;
      startedAt = Date.now();
      timerId = setInterval(render, 1000);
      const note = $('practiceSessionNote');
      if (note) note.textContent = 'Sesión activa. Tus resultados se registran solo en este navegador.';
    }
    function moduleLabel(k) {
      return k === 'noise' ? 'Frecuencias EQ' : k === 'direction' ? 'Boost/Cut' : 'Tono puro';
    }
    function weakestFocus() {
      const used = Object.entries(byModule).filter(([,v]) => v.total > 0);
      if (!used.length) return 'Empieza una ronda';
      used.sort((a,b) => (a[1].correct/a[1].total) - (b[1].correct/b[1].total));
      const [k,v] = used[0];
      return `${moduleLabel(k)} · ${Math.round(v.correct/v.total*100)}%`;
    }
    function record(moduleName, ok) {
      startIfNeeded();
      rounds++;
      if (ok) correct++;
      if (byModule[moduleName]) {
        byModule[moduleName].total++;
        if (ok) byModule[moduleName].correct++;
      }
      render();
      if (rounds === goal) {
        const note = $('practiceSessionNote');
        if (note) note.textContent = 'Meta alcanzada. Puedes terminar la sesión o seguir practicando.';
      }
    }
    function render() {
      const roundsEl=$('practiceRounds'), accEl=$('practiceAccuracy'), timeEl=$('practiceTime'),
            focusEl=$('practiceFocus'), fill=$('practiceProgressFill');
      if (roundsEl) roundsEl.textContent = `${rounds} / ${goal}`;
      if (accEl) accEl.textContent = rounds ? `${Math.round(correct/rounds*100)}%` : '—';
      if (timeEl) timeEl.textContent = fmtDuration(elapsed());
      if (focusEl) focusEl.textContent = weakestFocus();
      if (fill) fill.style.width = `${Math.min(100, rounds/goal*100)}%`;
    }
    function resetCurrent() {
      if (timerId) clearInterval(timerId);
      timerId=null; startedAt=null; rounds=0; correct=0;
      byModule={ noise:{total:0,correct:0}, direction:{total:0,correct:0}, tone:{total:0,correct:0} };
      render();
      const note=$('practiceSessionNote');
      if(note) note.textContent='La sesión empieza con tu primera respuesta y se guarda localmente al terminar.';
    }
    function finish() {
      if (!rounds) {
        const note=$('practiceSessionNote');
        if(note) note.textContent='Todavía no hay rondas para guardar en esta sesión.';
        return;
      }
      const duration=Math.round(elapsed());
      const item={
        date:new Date().toISOString(),
        rounds, correct, duration, goal,
        byModule: JSON.parse(JSON.stringify(byModule))
      };
      const hist=loadHistory();
      hist.push(item); saveHistory(hist);
      renderHistory();
      const note=$('practiceSessionNote');
      if(note) note.textContent=`Sesión guardada: ${correct}/${rounds} aciertos (${Math.round(correct/rounds*100)}%).`;
      resetCurrent();
    }
    function renderHistory() {
      const wrap=$('practiceHistoryList');
      if(!wrap) return;
      const hist=loadHistory().slice().reverse();
      if(!hist.length){
        wrap.innerHTML='<div style="font-size:.72rem;color:var(--muted)">Aún no hay sesiones guardadas.</div>';
        return;
      }
      wrap.innerHTML=hist.slice(0,12).map((s)=>{
        const d=new Date(s.date);
        const dateTxt=d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});
        const acc=s.rounds?Math.round(s.correct/s.rounds*100):0;
        return `<div class="practice-history-row">
          <strong>${dateTxt}</strong>
          <span>${s.rounds} rondas</span>
          <span>${acc}%</span>
          <span>${fmtDuration(s.duration)}</span>
        </div>`;
      }).join('');
    }
    function wire() {
      const goalSel=$('practiceGoalSelect');
      if(goalSel){
        goalSel.value=String(goal);
        goalSel.addEventListener('change',()=>{
          goal=Number(goalSel.value)||20;
          try{localStorage.setItem(SESSION_GOAL_KEY,String(goal));}catch(_){}
          render();
        });
      }
      const endBtn=$('practiceEndBtn');
      if(endBtn) endBtn.addEventListener('click',finish);
      const clearBtn=$('practiceHistoryClear');
      if(clearBtn) clearBtn.addEventListener('click',()=>{
        saveHistory([]);
        renderHistory();
        const note=$('practiceSessionNote');
        if(note) note.textContent='Historial de sesiones eliminado.';
      });
      renderHistory(); render();
    }
    return { wire, record, finish, render };
  })();

  function chooseWeakTarget(freqs, stats) {
    // Prioriza bandas no practicadas y, después, las de peor precisión.
    const ranked = freqs.map((f) => {
      const row = stats[String(f)];
      if (!row || row.total === 0) return { f, score: 2 + Math.random() * .2 };
      const acc = row.correct / row.total;
      const scarcity = 1 / Math.sqrt(row.total + 1);
      return { f, score: (1 - acc) + scarcity + Math.random() * .08 };
    }).sort((a,b) => b.score - a.score);
    return ranked[0].f;
  }
  function renderStatsGrid(gridEl, summaryEl, freqs, stats) {
    if (!gridEl || !summaryEl) return;
    const rows = freqs.map((f) => ({ f, row: stats[String(f)] })).filter(x => x.row && x.row.total);
    if (!rows.length) {
      summaryEl.textContent = 'Aún no hay datos suficientes.';
      gridEl.innerHTML = '';
      return;
    }
    const total = rows.reduce((s,x) => s + x.row.total, 0);
    const correct = rows.reduce((s,x) => s + x.row.correct, 0);
    const weakest = [...rows].sort((a,b) => (a.row.correct/a.row.total) - (b.row.correct/b.row.total))[0];
    summaryEl.textContent = `Historial: ${correct}/${total} (${Math.round(correct/total*100)}%). Banda a reforzar: ${fmtHzEar(weakest.f)}.`;
    gridEl.innerHTML = freqs.map((f) => {
      const row = stats[String(f)];
      if (!row || !row.total) return `<div class="ear-stat"><strong>${fmtHzEar(f)}</strong><span>Sin intentos</span></div>`;
      const pct = Math.round(row.correct / row.total * 100);
      const cls = pct < 55 ? ' weak' : pct >= 80 && row.total >= 3 ? ' strong' : '';
      return `<div class="ear-stat${cls}"><strong>${fmtHzEar(f)}</strong><span>${row.correct}/${row.total} · ${pct}%</span></div>`;
    }).join('');
  }


  // ---------- audio compartido ----------
  let audioCtx = null;
  let masterGain = null;

  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(audioCtx.destination);
  }
  function resumeAudio() { ensureAudio(); if (audioCtx.state === 'suspended') audioCtx.resume(); }

  function makePinkNoiseBuffer(ctx, seconds) {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(seconds * sampleRate);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      let pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11;
    }
    return buffer;
  }

  /* =========================================================
     MÓDULO: RUIDO ROSA
     ========================================================= */
  const Noise = (function () {
    let source = null, filterNode = null, dryGain = null, wetGain = null;
    let isPlaying = false, hearingWet = true;
    let selGain = 6, numOptions = 5;
    let round = null, answered = false;
    let score = { correct: 0, total: 0 };
    let learnFreq = null;
    let stats = loadStats(STATS_NOISE_KEY);
    let history = loadHistory(HISTORY_NOISE_KEY);
    let adaptiveMode = false;
    let adaptiveStage = 0;
    const adaptiveStages = [
      { name:'Inicial', gain:12, opts:3 },
      { name:'Intermedio', gain:6, opts:5 },
      { name:'Avanzado', gain:3, opts:9 },
    ];
    let recentResults = [];

    function setupGraph() {
      if (filterNode) return;
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'peaking';
      filterNode.Q.value = 1.4;
      dryGain = audioCtx.createGain();
      wetGain = audioCtx.createGain();
      dryGain.gain.value = 0;
      wetGain.gain.value = 1;
      dryGain.connect(masterGain);
      wetGain.connect(masterGain);
      filterNode.connect(wetGain);
    }

    function start(targetFreq, gainDb) {
      resumeAudio();
      setupGraph();
      stop();
      const buf = makePinkNoiseBuffer(audioCtx, 4);
      source = audioCtx.createBufferSource();
      source.buffer = buf;
      source.loop = true;
      source.connect(dryGain);
      source.connect(filterNode);
      filterNode.frequency.setValueAtTime(targetFreq, audioCtx.currentTime);
      filterNode.gain.setValueAtTime(gainDb, audioCtx.currentTime);
      source.start();
      isPlaying = true;
    }
    function stop() {
      if (source) { try { source.stop(); source.disconnect(); } catch (e) {} source = null; }
      isPlaying = false;
    }
    function setWet(wet) {
      hearingWet = wet;
      if (!audioCtx || !dryGain) return;
      const now = audioCtx.currentTime;
      dryGain.gain.linearRampToValueAtTime(wet ? 0 : 1, now + 0.06);
      wetGain.gain.linearRampToValueAtTime(wet ? 1 : 0, now + 0.06);
    }

    // ---- modo Aprender ----
    function renderLearnGrid() {
      const grid = $('earNoiseLearnGrid');
      grid.innerHTML = EAR_OCTAVE_FREQS.map((f) =>
        `<button class="ear-freq-btn" data-freq="${f}">${fmtHzEar(f)}</button>`).join('');
      grid.querySelectorAll('.ear-freq-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const f = Number(btn.dataset.freq);
          if (learnFreq === f && isPlaying) { stop(); learnFreq = null; grid.querySelectorAll('.ear-freq-btn').forEach(b => b.classList.remove('playing')); return; }
          learnFreq = f;
          start(f, selGain);
          setWet(true);
          grid.querySelectorAll('.ear-freq-btn').forEach(b => b.classList.toggle('playing', Number(b.dataset.freq) === f));
        });
      });
    }
    function stopLearn() {
      stop(); learnFreq = null;
      const grid = $('earNoiseLearnGrid');
      if (grid) grid.querySelectorAll('.ear-freq-btn').forEach(b => b.classList.remove('playing'));
    }

    // ---- modo Examen ----
    function pickOptions(target, n) {
      const pool = EAR_OCTAVE_FREQS.filter((f) => f !== target);
      const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(n - 1, pool.length));
      return [target, ...shuffled].sort((a, b) => a - b);
    }

    function newRound() {
      answered = false;
      if (adaptiveMode) {
        const stage = adaptiveStages[adaptiveStage];
        selGain = stage.gain; numOptions = stage.opts;
      }
      const target = adaptiveMode
        ? chooseWeakTarget(EAR_OCTAVE_FREQS, stats)
        : EAR_OCTAVE_FREQS[Math.floor(Math.random() * EAR_OCTAVE_FREQS.length)];
      const sign = Math.random() < 0.5 ? 1 : -1;
      round = { target, sign, options: pickOptions(target, numOptions) };
      start(target, sign * selGain);
      setWet(true);
      renderRound();
    }

    function renderRound() {
      const optsEl = $('earOptions');
      $('earFeedback').innerHTML = '';
      $('earFeedback').className = 'ear-feedback';
      optsEl.innerHTML = round.options.map((f) => `<button class="ear-opt" data-freq="${f}">${fmtHzEar(f)}</button>`).join('');
      optsEl.querySelectorAll('.ear-opt').forEach((btn) => btn.addEventListener('click', () => submitAnswer(Number(btn.dataset.freq))));
      $('earPlayBtn').textContent = '⏹ Detener';
      $('earAbBtn').disabled = false;
      $('earAbBtn').textContent = 'A/B: escuchando modificado';
      $('earNextBtn').style.display = 'none';
    }

    function submitAnswer(freq) {
      if (answered || !round) return;
      answered = true;
      score.total++;
      const correct = freq === round.target;
      if (correct) score.correct++;
      PracticeSession.record('noise', correct);
      recordBand(stats, round.target, correct);
      saveStats(STATS_NOISE_KEY, stats);
      recentResults.push(correct ? 1 : 0);
      if (recentResults.length > 8) recentResults.shift();
      pushHistory(history, HISTORY_NOISE_KEY, { ok: correct, freq: round.target, dir: round.sign > 0 ? 'boost' : 'cut' });
      renderProgress($('earNoiseProgress'), history, true);
      if (adaptiveMode && recentResults.length >= 6) {
        const accRecent = recentResults.reduce((a,b)=>a+b,0) / recentResults.length;
        if (accRecent >= .78 && adaptiveStage < adaptiveStages.length - 1) {
          adaptiveStage++; recentResults = [];
        } else if (accRecent < .5 && adaptiveStage > 0) {
          adaptiveStage--; recentResults = [];
        }
      }
      renderNoiseStats();
      renderProgress($('earNoiseProgress'), history, true);
      updateAdaptiveStatus();
      $('earOptions').querySelectorAll('.ear-opt').forEach((btn) => {
        const f = Number(btn.dataset.freq);
        btn.disabled = true;
        if (f === round.target) btn.classList.add('correct');
        else if (f === freq) btn.classList.add('wrong');
      });
      const signTxt = round.sign > 0 ? 'un realce (boost)' : 'un corte';
      const feedbackEl = $('earFeedback');
      feedbackEl.textContent = correct
        ? `✓ ¡Correcto! Era ${fmtHzEar(round.target)}, con ${signTxt} de ${selGain} dB.`
        : `✗ No era esa. La frecuencia modificada era ${fmtHzEar(round.target)}, con ${signTxt} de ${selGain} dB.`;
      feedbackEl.className = 'ear-feedback ' + (correct ? 'ok' : 'bad');
      $('earNextBtn').style.display = '';
      updateScore();
    }

    function renderNoiseStats() {
      renderStatsGrid($('earStatsGrid'), $('earStatsSummary'), EAR_OCTAVE_FREQS, stats);
    }
    function updateAdaptiveStatus() {
      const el = $('earAdaptiveStatus');
      if (!el) return;
      if (!adaptiveMode) {
        const label = selGain >= 10 ? 'Inicial' : selGain >= 5 ? 'Intermedio' : 'Avanzado';
        el.textContent = `Nivel fijo: ${label}`;
        return;
      }
      const s = adaptiveStages[adaptiveStage];
      el.textContent = `Adaptativo · ${s.name}: ±${s.gain} dB · ${s.opts} opciones · prioriza tus bandas más débiles`;
    }

    function updateScore() {
      const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
      $('earScore').textContent = `Aciertos: ${score.correct} / ${score.total} (${pct}%)`;
    }

    function wire() {
      renderLearnGrid();
      const diffMap = { initial: { gain: 12, opts: 3 }, intermediate: { gain: 6, opts: 5 }, advanced: { gain: 3, opts: 9 } };
      const diffWrap = $('earDifficultyChips');
      if (diffWrap) diffWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip'); if (!btn) return;
        const key = btn.dataset.diff;
        adaptiveMode = key === 'adaptive';
        const d = diffMap[key];
        if (!adaptiveMode && !d) return;
        if (!adaptiveMode) { selGain = d.gain; numOptions = d.opts; }
        [...diffWrap.querySelectorAll('.chip')].forEach(c => c.classList.toggle('active', c === btn));
        [...$('earGainChips').querySelectorAll('.chip')].forEach(c => c.classList.toggle('active', Number(c.dataset.gain) === selGain));
        [...$('earOptChips').querySelectorAll('.chip')].forEach(c => c.classList.toggle('active', Number(c.dataset.opt) === numOptions));
        updateAdaptiveStatus();
        if (round && !answered && audioCtx && filterNode) filterNode.gain.setValueAtTime(round.sign * selGain, audioCtx.currentTime);
      });
      $('earGainChips').addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        selGain = Number(btn.dataset.gain);
        adaptiveMode = false;
        [...$('earGainChips').querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
        if (diffWrap) [...diffWrap.querySelectorAll('.chip')].forEach(c => c.classList.remove('active'));
        if (round && !answered && audioCtx && filterNode) filterNode.gain.setValueAtTime(round.sign * selGain, audioCtx.currentTime);
        if (learnFreq !== null && isPlaying) filterNode.gain.setValueAtTime(selGain, audioCtx.currentTime);
      });
      $('earOptChips').addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        numOptions = Number(btn.dataset.opt);
        adaptiveMode = false;
        [...$('earOptChips').querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
        if (diffWrap) [...diffWrap.querySelectorAll('.chip')].forEach(c => c.classList.remove('active'));
      });
      $('earPlayBtn').addEventListener('click', () => {
        if (isPlaying) { stop(); $('earPlayBtn').textContent = '▶ Reproducir ronda'; $('earAbBtn').disabled = true; return; }
        if (!round) newRound(); else { start(round.target, round.sign * selGain); setWet(hearingWet); renderRound(); }
      });
      $('earAbBtn').addEventListener('click', () => {
        setWet(!hearingWet);
        $('earAbBtn').textContent = hearingWet ? 'A/B: escuchando modificado' : 'A/B: escuchando referencia';
      });
      $('earNextBtn').addEventListener('click', () => newRound());
      $('earResetScore').addEventListener('click', () => { score = { correct: 0, total: 0 }; updateScore(); });
      const statsReset = $('earStatsReset');
      if (statsReset) statsReset.addEventListener('click', () => {
        stats = {}; history = []; recentResults = []; adaptiveStage = 0;
        saveStats(STATS_NOISE_KEY, stats); saveHistory(HISTORY_NOISE_KEY, history);
        renderNoiseStats(); renderProgress($('earNoiseProgress'), history, true); updateAdaptiveStatus();
      });
      renderNoiseStats();
      updateAdaptiveStatus();
      updateScore();
    }

    return { wire, stop, stopLearn };
  })();

  /* =========================================================
     MÓDULO: TONO PURO
     ========================================================= */
  const Tone = (function () {
    let osc = null, isPlaying = false, learnFreq = null;
    let numOptions = 5;
    let round = null, answered = false;
    let score = { correct: 0, total: 0 };
    let stats = loadStats(STATS_TONE_KEY);
    let history = loadHistory(HISTORY_TONE_KEY);
    let adaptiveMode = false;
    let recentResults = [];

    function start(freq) {
      resumeAudio();
      stop();
      osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      g.gain.value = 0.28;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      osc._gainNode = g;
      isPlaying = true;
    }
    function stop() {
      if (osc) { try { osc.stop(); osc.disconnect(); if (osc._gainNode) osc._gainNode.disconnect(); } catch (e) {} osc = null; }
      isPlaying = false;
    }

    function renderLearnGrid() {
      const grid = $('earToneLearnGrid');
      grid.innerHTML = EAR_31_BANDS.map((f) => `<button class="ear-freq-btn" data-freq="${f}">${fmtHzEar(f)}</button>`).join('');
      grid.querySelectorAll('.ear-freq-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const f = Number(btn.dataset.freq);
          if (learnFreq === f && isPlaying) { stop(); learnFreq = null; grid.querySelectorAll('.ear-freq-btn').forEach(b => b.classList.remove('playing')); return; }
          learnFreq = f;
          start(f);
          grid.querySelectorAll('.ear-freq-btn').forEach(b => b.classList.toggle('playing', Number(b.dataset.freq) === f));
        });
      });
    }
    function stopLearn() {
      stop(); learnFreq = null;
      const grid = $('earToneLearnGrid');
      if (grid) grid.querySelectorAll('.ear-freq-btn').forEach(b => b.classList.remove('playing'));
    }

    function pickOptions(target, n) {
      const pool = EAR_31_BANDS.filter((f) => f !== target);
      const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(n - 1, pool.length));
      return [target, ...shuffled].sort((a, b) => a - b);
    }

    function newRound() {
      answered = false;
      if (adaptiveMode && recentResults.length >= 6) {
        const accRecent = recentResults.reduce((a,b)=>a+b,0) / recentResults.length;
        numOptions = accRecent >= .78 ? 9 : accRecent >= .60 ? 5 : 3;
      }
      const target = adaptiveMode
        ? chooseWeakTarget(EAR_31_BANDS, stats)
        : EAR_31_BANDS[Math.floor(Math.random() * EAR_31_BANDS.length)];
      round = { target, options: pickOptions(target, numOptions) };
      start(target);
      renderRound();
      updateToneAdaptiveStatus();
    }

    function renderRound() {
      const optsEl = $('earToneOptions');
      $('earToneFeedback').innerHTML = '';
      $('earToneFeedback').className = 'ear-feedback';
      optsEl.innerHTML = round.options.map((f) => `<button class="ear-opt" data-freq="${f}">${fmtHzEar(f)}</button>`).join('');
      optsEl.querySelectorAll('.ear-opt').forEach((btn) => btn.addEventListener('click', () => submitAnswer(Number(btn.dataset.freq))));
      $('earTonePlayBtn').textContent = '⏹ Detener';
      $('earToneNextBtn').style.display = 'none';
    }

    function submitAnswer(freq) {
      if (answered || !round) return;
      answered = true;
      score.total++;
      const correct = freq === round.target;
      if (correct) score.correct++;
      PracticeSession.record('tone', correct);
      recordBand(stats, round.target, correct);
      saveStats(STATS_TONE_KEY, stats);
      recentResults.push(correct ? 1 : 0);
      if (recentResults.length > 8) recentResults.shift();
      pushHistory(history, HISTORY_TONE_KEY, { ok: correct, freq: round.target });
      renderToneStats();
      renderProgress($('earToneProgress'), history);
      updateToneAdaptiveStatus();
      $('earToneOptions').querySelectorAll('.ear-opt').forEach((btn) => {
        const f = Number(btn.dataset.freq);
        btn.disabled = true;
        if (f === round.target) btn.classList.add('correct');
        else if (f === freq) btn.classList.add('wrong');
      });
      const feedbackEl = $('earToneFeedback');
      feedbackEl.textContent = correct
        ? `✓ ¡Correcto! Era ${fmtHzEar(round.target)}.`
        : `✗ No era esa. El tono era ${fmtHzEar(round.target)}.`;
      feedbackEl.className = 'ear-feedback ' + (correct ? 'ok' : 'bad');
      $('earToneNextBtn').style.display = '';
      updateScore();
    }

    function renderToneStats() {
      renderStatsGrid($('earToneStatsGrid'), $('earToneStatsSummary'), EAR_31_BANDS, stats);
    }
    function updateToneAdaptiveStatus() {
      const el = $('earToneAdaptiveStatus');
      if (!el) return;
      el.textContent = adaptiveMode
        ? `Adaptativo · ${numOptions} opciones · prioriza frecuencias con menor precisión`
        : `Modo guiado · ${numOptions} opciones`;
    }

    function updateScore() {
      const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
      $('earToneScore').textContent = `Aciertos: ${score.correct} / ${score.total} (${pct}%)`;
    }

    function wire() {
      renderLearnGrid();
      const toneDiff = $('earToneDifficultyChips');
      if (toneDiff) toneDiff.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip'); if (!btn) return;
        adaptiveMode = btn.dataset.toneDiff === 'adaptive';
        [...toneDiff.querySelectorAll('.chip')].forEach(c => c.classList.toggle('active', c === btn));
        updateToneAdaptiveStatus();
      });
      $('earToneOptChips').addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        numOptions = Number(btn.dataset.opt);
        adaptiveMode = false;
        [...$('earToneOptChips').querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
        const toneDiff = $('earToneDifficultyChips');
        if (toneDiff) [...toneDiff.querySelectorAll('.chip')].forEach(c => c.classList.toggle('active', c.dataset.toneDiff === 'guided'));
        updateToneAdaptiveStatus();
      });
      $('earTonePlayBtn').addEventListener('click', () => {
        if (isPlaying) { stop(); $('earTonePlayBtn').textContent = '▶ Reproducir ronda'; return; }
        if (!round) newRound(); else { start(round.target); renderRound(); }
      });
      $('earToneNextBtn').addEventListener('click', () => newRound());
      $('earToneResetScore').addEventListener('click', () => { score = { correct: 0, total: 0 }; updateScore(); });
      const toneStatsReset = $('earToneStatsReset');
      if (toneStatsReset) toneStatsReset.addEventListener('click', () => {
        stats = {}; history = []; recentResults = [];
        saveStats(STATS_TONE_KEY, stats); saveHistory(HISTORY_TONE_KEY, history);
        renderToneStats(); renderProgress($('earToneProgress'), history); updateToneAdaptiveStatus();
      });
      renderToneStats();
      renderProgress($('earToneProgress'), history);
      updateToneAdaptiveStatus();
      updateScore();
    }

    return { wire, stop, stopLearn };
  })();


  /* =========================================================
     MÓDULO: BOOST VS. CUT
     La frecuencia se revela; la tarea es identificar únicamente
     la dirección del cambio para aislar esta habilidad auditiva.
     ========================================================= */
  const Direction = (function () {
    let source = null, filterNode = null, dryGain = null, wetGain = null;
    let isPlaying = false, hearingWet = true;
    let selGain = 6, bandMode = 'adaptive';
    let round = null, answered = false, learnFreq = null;
    let score = { correct: 0, total: 0 };
    let stats = loadStats(STATS_DIR_KEY);
    let history = loadHistory(HISTORY_DIR_KEY);

    function setupGraph() {
      if (filterNode) return;
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'peaking';
      filterNode.Q.value = 1.4;
      dryGain = audioCtx.createGain();
      wetGain = audioCtx.createGain();
      dryGain.gain.value = 0;
      wetGain.gain.value = 1;
      dryGain.connect(masterGain);
      wetGain.connect(masterGain);
      filterNode.connect(wetGain);
    }
    function start(freq, gainDb) {
      resumeAudio();
      setupGraph();
      stop();
      const buf = makePinkNoiseBuffer(audioCtx, 4);
      source = audioCtx.createBufferSource();
      source.buffer = buf;
      source.loop = true;
      source.connect(dryGain);
      source.connect(filterNode);
      filterNode.frequency.setValueAtTime(freq, audioCtx.currentTime);
      filterNode.gain.setValueAtTime(gainDb, audioCtx.currentTime);
      source.start();
      isPlaying = true;
    }
    function stop() {
      if (source) { try { source.stop(); source.disconnect(); } catch (_) {} source = null; }
      isPlaying = false;
    }
    function setWet(wet) {
      hearingWet = wet;
      if (!audioCtx || !dryGain) return;
      const now = audioCtx.currentTime;
      dryGain.gain.cancelScheduledValues(now);
      wetGain.gain.cancelScheduledValues(now);
      dryGain.gain.setValueAtTime(dryGain.gain.value, now);
      wetGain.gain.setValueAtTime(wetGain.gain.value, now);
      dryGain.gain.linearRampToValueAtTime(wet ? 0 : 1, now + .05);
      wetGain.gain.linearRampToValueAtTime(wet ? 1 : 0, now + .05);
    }

    function dirRow(freq) {
      const row = stats[String(freq)] || { boostCorrect:0, boostTotal:0, cutCorrect:0, cutTotal:0 };
      return row;
    }
    function recordDirection(freq, dir, correct) {
      const k = String(freq);
      const row = dirRow(freq);
      if (dir === 'boost') {
        row.boostTotal += 1; if (correct) row.boostCorrect += 1;
      } else {
        row.cutTotal += 1; if (correct) row.cutCorrect += 1;
      }
      stats[k] = row;
      saveStats(STATS_DIR_KEY, stats);
    }
    function dirAccuracy(row) {
      const total = row.boostTotal + row.cutTotal;
      const correct = row.boostCorrect + row.cutCorrect;
      return total ? correct / total : null;
    }
    function chooseTarget() {
      if (bandMode === 'random') return EAR_OCTAVE_FREQS[Math.floor(Math.random()*EAR_OCTAVE_FREQS.length)];
      const ranked = EAR_OCTAVE_FREQS.map((f) => {
        const row = stats[String(f)];
        const acc = row ? dirAccuracy(row) : null;
        const total = row ? row.boostTotal + row.cutTotal : 0;
        const score = acc === null ? 2.2 : (1 - acc) + 1/Math.sqrt(total + 1);
        return { f, score: score + Math.random()*.06 };
      }).sort((a,b) => b.score-a.score);
      return ranked[0].f;
    }
    function renderStats() {
      const grid = $('earDirStatsGrid'), summary = $('earDirStatsSummary');
      if (!grid || !summary) return;
      let total=0, correct=0;
      let weakest=null;
      grid.innerHTML = EAR_OCTAVE_FREQS.map((f) => {
        const row = stats[String(f)];
        if (!row) return `<div class="ear-stat"><strong>${fmtHzEar(f)}</strong><span>Sin intentos</span></div>`;
        const t = row.boostTotal + row.cutTotal;
        const c = row.boostCorrect + row.cutCorrect;
        total += t; correct += c;
        const acc = t ? c/t : 0;
        if (!weakest || acc < weakest.acc) weakest = { f, acc };
        const pct = Math.round(acc*100);
        const cls = pct < 55 ? ' weak' : pct >= 80 && t >= 3 ? ' strong' : '';
        return `<div class="ear-stat${cls}">
          <strong>${fmtHzEar(f)}</strong>
          <span>Total ${c}/${t} · ${pct}%</span>
          <span>Boost ${row.boostCorrect}/${row.boostTotal} · Cut ${row.cutCorrect}/${row.cutTotal}</span>
        </div>`;
      }).join('');
      summary.textContent = total
        ? `Historial: ${correct}/${total} (${Math.round(correct/total*100)}%). Banda a reforzar: ${fmtHzEar(weakest.f)}.`
        : 'Aún no hay datos suficientes.';
      renderProgress($('earDirProgress'), history, true);
    }
    function updateScore() {
      const pct = score.total ? Math.round(score.correct/score.total*100) : 0;
      $('earDirScore').textContent = `Aciertos: ${score.correct} / ${score.total} (${pct}%)`;
    }

    function renderLearnGrid() {
      const grid = $('earDirLearnGrid');
      grid.innerHTML = EAR_OCTAVE_FREQS.map((f) => `<button class="ear-freq-btn" data-freq="${f}">${fmtHzEar(f)}</button>`).join('');
      grid.querySelectorAll('.ear-freq-btn').forEach((btn) => btn.addEventListener('click', () => {
        learnFreq = Number(btn.dataset.freq);
        grid.querySelectorAll('.ear-freq-btn').forEach(b => b.classList.toggle('playing', Number(b.dataset.freq) === learnFreq));
        start(learnFreq, selGain);
        setWet(false);
        $('earDirLearnStatus').textContent = `${fmtHzEar(learnFreq)} · referencia activa`;
      }));
    }
    function applyLearn(mode) {
      if (learnFreq === null) {
        $('earDirLearnStatus').textContent = 'Selecciona una frecuencia.';
        return;
      }
      if (!isPlaying) start(learnFreq, mode === 'cut' ? -selGain : selGain);
      if (mode === 'ref') {
        setWet(false);
        $('earDirLearnStatus').textContent = `${fmtHzEar(learnFreq)} · referencia`;
      } else {
        filterNode.gain.setValueAtTime(mode === 'boost' ? selGain : -selGain, audioCtx.currentTime);
        setWet(true);
        $('earDirLearnStatus').textContent = `${fmtHzEar(learnFreq)} · ${mode === 'boost' ? '+' : '−'}${selGain} dB ${mode}`;
      }
    }
    function stopLearn() {
      stop(); learnFreq = null;
      const grid = $('earDirLearnGrid');
      if (grid) grid.querySelectorAll('.ear-freq-btn').forEach(b => b.classList.remove('playing'));
    }

    function newRound() {
      answered = false;
      const target = chooseTarget();
      const dir = Math.random() < .5 ? 'boost' : 'cut';
      round = { target, dir };
      start(target, dir === 'boost' ? selGain : -selGain);
      setWet(true);
      $('earDirQuestion').textContent = `Frecuencia objetivo: ${fmtHzEar(target)}. ¿Escuchas un realce o un corte?`;
      $('earDirFeedback').textContent = '';
      $('earDirFeedback').className = 'ear-feedback';
      $('earDirOptions').querySelectorAll('.ear-opt').forEach(btn => {
        btn.disabled = false; btn.classList.remove('correct','wrong');
      });
      $('earDirPlayBtn').textContent = '⏹ Detener';
      $('earDirAbBtn').disabled = false;
      $('earDirAbBtn').textContent = 'A/B: modificado';
      $('earDirNextBtn').style.display = 'none';
    }
    function submit(dir) {
      if (!round || answered) return;
      answered = true;
      score.total++;
      const correct = dir === round.dir;
      if (correct) score.correct++;
      PracticeSession.record('direction', correct);
      recordDirection(round.target, round.dir, correct);
      pushHistory(history, HISTORY_DIR_KEY, { ok:correct, freq:round.target, dir:round.dir });
      $('earDirOptions').querySelectorAll('.ear-opt').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.dir === round.dir) btn.classList.add('correct');
        else if (btn.dataset.dir === dir) btn.classList.add('wrong');
      });
      $('earDirFeedback').textContent = correct
        ? `✓ Correcto: era ${round.dir === 'boost' ? 'un realce' : 'un corte'} de ${selGain} dB en ${fmtHzEar(round.target)}.`
        : `✗ Era ${round.dir === 'boost' ? 'un realce' : 'un corte'} de ${selGain} dB en ${fmtHzEar(round.target)}.`;
      $('earDirFeedback').className = 'ear-feedback ' + (correct ? 'ok' : 'bad');
      $('earDirNextBtn').style.display = '';
      updateScore(); renderStats();
    }

    function wire() {
      renderLearnGrid();
      $('earDirGainChips').addEventListener('click', (e) => {
        const btn=e.target.closest('.chip'); if(!btn) return;
        selGain=Number(btn.dataset.gain);
        [...$('earDirGainChips').querySelectorAll('.chip')].forEach(c=>c.classList.toggle('active',c===btn));
        if (learnFreq !== null && filterNode && hearingWet) {
          const sign = $('earDirLearnStatus').textContent.includes('cut') ? -1 : 1;
          filterNode.gain.setValueAtTime(sign*selGain,audioCtx.currentTime);
        }
      });
      $('earDirBandMode').addEventListener('click', (e) => {
        const btn=e.target.closest('.chip'); if(!btn) return;
        bandMode=btn.dataset.mode;
        [...$('earDirBandMode').querySelectorAll('.chip')].forEach(c=>c.classList.toggle('active',c===btn));
      });
      $('earDirLearnBoost').addEventListener('click',()=>applyLearn('boost'));
      $('earDirLearnRef').addEventListener('click',()=>applyLearn('ref'));
      $('earDirLearnCut').addEventListener('click',()=>applyLearn('cut'));

      $('earDirPlayBtn').addEventListener('click',()=>{
        if(isPlaying){ stop(); $('earDirPlayBtn').textContent='▶ Reproducir ronda'; $('earDirAbBtn').disabled=true; return; }
        if(!round) newRound(); else { start(round.target,round.dir==='boost'?selGain:-selGain); setWet(hearingWet); $('earDirPlayBtn').textContent='⏹ Detener'; $('earDirAbBtn').disabled=false; }
      });
      $('earDirAbBtn').addEventListener('click',()=>{
        setWet(!hearingWet);
        $('earDirAbBtn').textContent=hearingWet?'A/B: modificado':'A/B: referencia';
      });
      $('earDirOptions').querySelectorAll('.ear-opt').forEach(btn=>btn.addEventListener('click',()=>submit(btn.dataset.dir)));
      $('earDirNextBtn').addEventListener('click',newRound);
      $('earDirResetScore').addEventListener('click',()=>{score={correct:0,total:0};updateScore();});
      $('earDirStatsReset').addEventListener('click',()=>{
        stats={}; history=[];
        saveStats(STATS_DIR_KEY,stats); saveHistory(HISTORY_DIR_KEY,history);
        renderStats();
      });
      renderStats(); updateScore();
    }
    return { wire, stop, stopLearn };
  })();

  /* =========================================================
     NAVEGACIÓN: tipo de sonido y modo (Aprender / Examen)
     ========================================================= */
  function wireTypeTabs() {
    document.querySelectorAll('#earTypeTabs .ear-subtab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        document.querySelectorAll('#earTypeTabs .ear-subtab').forEach((b) => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.ear-type-panel').forEach((p) => p.classList.toggle('active', p.id === 'earPanel-' + type));
        // detener audio de los paneles que se ocultan
        if (type !== 'noise') { Noise.stop(); Noise.stopLearn(); }
        if (type !== 'direction') { Direction.stop(); Direction.stopLearn(); }
        if (type !== 'tone') { Tone.stop(); Tone.stopLearn(); }
      });
    });
  }

  function wireModeTabs(prefix, onLeaveLearn, onLeaveQuiz) {
    document.querySelectorAll(`#${prefix}ModeTabs .ear-subtab`).forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        document.querySelectorAll(`#${prefix}ModeTabs .ear-subtab`).forEach((b) => b.classList.toggle('active', b === btn));
        $(`${prefix}Learn`).classList.toggle('active', mode === 'learn');
        $(`${prefix}Quiz`).classList.toggle('active', mode === 'quiz');
        if (mode === 'quiz' && onLeaveLearn) onLeaveLearn();
        if (mode === 'learn' && onLeaveQuiz) onLeaveQuiz();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('earTypeTabs')) return; // sección no presente en esta página
    PracticeSession.wire();
    Noise.wire();
    Direction.wire();
    Tone.wire();
    wireTypeTabs();
    wireModeTabs('earNoise', () => Noise.stopLearn(), () => Noise.stop());
    wireModeTabs('earDirection', () => Direction.stopLearn(), () => Direction.stop());
    wireModeTabs('earTone', () => Tone.stopLearn(), () => Tone.stop());
  });

  window.addEventListener('beforeunload', () => { Noise.stop(); Direction.stop(); Tone.stop(); });
})();
