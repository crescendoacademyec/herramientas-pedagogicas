(function () {
  const $ = (id) => document.getElementById(id);
  const fmtHzEar = (f) => (f >= 1000 ? (Number.isInteger(f / 1000) ? (f / 1000) + ' kHz' : (f / 1000).toFixed(2).replace(/0$/, '') + ' kHz') : f + ' Hz');

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
      const target = EAR_OCTAVE_FREQS[Math.floor(Math.random() * EAR_OCTAVE_FREQS.length)];
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

    function updateScore() {
      const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
      $('earScore').textContent = `Aciertos: ${score.correct} / ${score.total} (${pct}%)`;
    }

    function wire() {
      renderLearnGrid();
      $('earGainChips').addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        selGain = Number(btn.dataset.gain);
        [...$('earGainChips').querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
        if (round && !answered && audioCtx && filterNode) filterNode.gain.setValueAtTime(round.sign * selGain, audioCtx.currentTime);
        if (learnFreq !== null && isPlaying) filterNode.gain.setValueAtTime(selGain, audioCtx.currentTime);
      });
      $('earOptChips').addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        numOptions = Number(btn.dataset.opt);
        [...$('earOptChips').querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
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
      const target = EAR_31_BANDS[Math.floor(Math.random() * EAR_31_BANDS.length)];
      round = { target, options: pickOptions(target, numOptions) };
      start(target);
      renderRound();
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

    function updateScore() {
      const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
      $('earToneScore').textContent = `Aciertos: ${score.correct} / ${score.total} (${pct}%)`;
    }

    function wire() {
      renderLearnGrid();
      $('earToneOptChips').addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        numOptions = Number(btn.dataset.opt);
        [...$('earToneOptChips').querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
      });
      $('earTonePlayBtn').addEventListener('click', () => {
        if (isPlaying) { stop(); $('earTonePlayBtn').textContent = '▶ Reproducir ronda'; return; }
        if (!round) newRound(); else { start(round.target); renderRound(); }
      });
      $('earToneNextBtn').addEventListener('click', () => newRound());
      $('earToneResetScore').addEventListener('click', () => { score = { correct: 0, total: 0 }; updateScore(); });
      updateScore();
    }

    return { wire, stop, stopLearn };
  })();

  /* =========================================================
     NAVEGACIÓN: tipo de sonido (Ruido rosa / Tono puro) y modo (Aprender / Examen)
     ========================================================= */
  function wireTypeTabs() {
    document.querySelectorAll('#earTypeTabs .ear-subtab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        document.querySelectorAll('#earTypeTabs .ear-subtab').forEach((b) => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.ear-type-panel').forEach((p) => p.classList.toggle('active', p.id === 'earPanel-' + type));
        // detener audio del panel que se oculta
        if (type === 'noise') { Tone.stop(); Tone.stopLearn(); } else { Noise.stop(); Noise.stopLearn(); }
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
    Noise.wire();
    Tone.wire();
    wireTypeTabs();
    wireModeTabs('earNoise', () => Noise.stopLearn(), () => Noise.stop());
    wireModeTabs('earTone', () => Tone.stopLearn(), () => Tone.stop());
  });

  window.addEventListener('beforeunload', () => { Noise.stop(); Tone.stop(); });
})();
