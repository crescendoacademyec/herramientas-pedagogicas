(function () {
  const $ = (id) => document.getElementById(id);

  // ---------- estado ----------
  let audioCtx = null;
  let noiseSource = null;
  let filterNode = null;
  let dryGain = null, wetGain = null, masterGain = null;
  let isPlaying = false;
  let hearingWet = true; // true = escuchando la versión modificada

  let selGain = 6;        // dB por defecto
  let numOptions = 5;      // opciones por defecto
  let round = null;        // { target, sign, options[] }
  let answered = false;
  let score = { correct: 0, total: 0 };

  // ---------- generación de ruido rosa (Voss-McCartney) ----------
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
      data[i] = pink * 0.11; // atenuar para dejar headroom
    }
    return buffer;
  }

  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(audioCtx.destination);

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

  function startNoise() {
    ensureAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    stopNoise();
    const buf = makePinkNoiseBuffer(audioCtx, 4);
    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buf;
    noiseSource.loop = true;
    noiseSource.connect(dryGain);
    noiseSource.connect(filterNode);
    noiseSource.start();
    isPlaying = true;
  }

  function stopNoise() {
    if (noiseSource) { try { noiseSource.stop(); noiseSource.disconnect(); } catch (e) {} noiseSource = null; }
    isPlaying = false;
  }

  function setHearingWet(wet) {
    hearingWet = wet;
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    dryGain.gain.linearRampToValueAtTime(wet ? 0 : 1, now + 0.06);
    wetGain.gain.linearRampToValueAtTime(wet ? 1 : 0, now + 0.06);
  }

  // ---------- ronda ----------
  function pickOptions(target, n) {
    const pool = EAR_OCTAVE_FREQS.filter((f) => f !== target);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(n - 1, pool.length));
    const opts = [target, ...shuffled];
    return opts.sort((a, b) => a - b);
  }

  function fmtHzEar(f) { return f >= 1000 ? (f / 1000) + ' kHz' : f + ' Hz'; }

  function newRound() {
    answered = false;
    const target = EAR_OCTAVE_FREQS[Math.floor(Math.random() * EAR_OCTAVE_FREQS.length)];
    const sign = Math.random() < 0.5 ? 1 : -1;
    round = { target, sign, options: pickOptions(target, numOptions) };

    ensureAudio();
    filterNode.frequency.setValueAtTime(target, audioCtx.currentTime);
    filterNode.gain.setValueAtTime(sign * selGain, audioCtx.currentTime);

    renderRound();
  }

  function renderRound() {
    const optsEl = $('earOptions');
    const feedbackEl = $('earFeedback');
    feedbackEl.innerHTML = '';
    feedbackEl.className = 'ear-feedback';
    optsEl.innerHTML = round.options.map((f) =>
      `<button class="ear-opt" data-freq="${f}">${fmtHzEar(f)}</button>`
    ).join('');
    optsEl.querySelectorAll('.ear-opt').forEach((btn) => {
      btn.addEventListener('click', () => submitAnswer(Number(btn.dataset.freq)));
    });
    $('earPlayBtn').textContent = '⏹ Detener';
    $('earAbBtn').disabled = false;
    $('earAbBtn').textContent = 'A/B: escuchando modificado';
    setHearingWet(true);
    $('earNextBtn').style.display = 'none';
  }

  function submitAnswer(freq) {
    if (answered || !round) return;
    answered = true;
    score.total++;
    const correct = freq === round.target;
    if (correct) score.correct++;

    const optsEl = $('earOptions');
    optsEl.querySelectorAll('.ear-opt').forEach((btn) => {
      const f = Number(btn.dataset.freq);
      btn.disabled = true;
      if (f === round.target) btn.classList.add('correct');
      else if (f === freq) btn.classList.add('wrong');
    });

    const feedbackEl = $('earFeedback');
    const signTxt = round.sign > 0 ? 'un realce (boost)' : 'un corte';
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

  // ---------- controles ----------
  function wireEarControls() {
    const gainChips = $('earGainChips');
    const optChips = $('earOptChips');
    if (!gainChips) return; // sección no presente en esta página

    gainChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      selGain = Number(btn.dataset.gain);
      [...gainChips.querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
      if (round) {
        // aplica el nuevo valor de ganancia en vivo si ya hay una ronda activa sin responder
        if (!answered && audioCtx) filterNode.gain.setValueAtTime(round.sign * selGain, audioCtx.currentTime);
      }
    });

    optChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      numOptions = Number(btn.dataset.opt);
      [...optChips.querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
    });

    $('earPlayBtn').addEventListener('click', () => {
      if (isPlaying) { stopNoise(); $('earPlayBtn').textContent = '▶ Reproducir ronda'; $('earAbBtn').disabled = true; return; }
      startNoise();
      if (!round) newRound(); else renderRound();
    });

    $('earAbBtn').addEventListener('click', () => {
      setHearingWet(!hearingWet);
      $('earAbBtn').textContent = hearingWet ? 'A/B: escuchando modificado' : 'A/B: escuchando referencia';
    });

    $('earNextBtn').addEventListener('click', () => { newRound(); if (!isPlaying) startNoise(); });

    $('earResetScore').addEventListener('click', () => { score = { correct: 0, total: 0 }; updateScore(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireEarControls();
    updateScore();
  });

  // detener el audio si el usuario cambia de pestaña dentro de la app (evita ruido de fondo)
  window.addEventListener('beforeunload', stopNoise);
})();
