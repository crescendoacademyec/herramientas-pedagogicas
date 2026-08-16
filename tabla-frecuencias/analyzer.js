(function () {
  const $ = (id) => document.getElementById(id);

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('analyzerCanvas')) return; // sección no presente en esta página

    const F = window.CrescendoFreq || { MIN_F: 20, MAX_F: 20000 };
    const MIN_F = F.MIN_F, MAX_F = F.MAX_F;
    const LOG_MIN = Math.log10(MIN_F), LOG_RANGE = Math.log10(MAX_F) - LOG_MIN;
    const pct = F.pct || function (f) {
      const c = Math.max(MIN_F, Math.min(MAX_F, f));
      return ((Math.log10(c) - LOG_MIN) / LOG_RANGE) * 100;
    };
    const fmtHz = F.fmtHz || function (f) { return f >= 1000 ? (f / 1000) + ' kHz' : f + ' Hz'; };

    const canvas = $('analyzerCanvas');
    const ctx2d = canvas.getContext('2d');
    const emptyMsg = $('analyzerEmpty');
    const fileInput = $('analyzerFileInput');
    const fileNameEl = $('analyzerFileName');
    const micBtn = $('analyzerMicBtn');
    const audioEl = $('analyzerAudioEl');
    const overlayToggle = $('analyzerOverlayToggle');
    const freezeToggle = $('analyzerFreezeToggle');
    const refWrap = $('analyzerRefWrap');
    const refRuler = $('analyzerRefRuler');
    const refRows = $('analyzerRefRows');
    const canvasWrap = $('analyzerCanvasWrap');
    const hoverLine = $('analyzerHoverLine');
    const hoverLabel = $('analyzerHoverLabel');

    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let micStream = null;
    let rafId = null;
    let hasSignal = false;

    function ensureAudio() {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.82;
    }

    function disconnectSource() {
      if (sourceNode) { try { sourceNode.disconnect(); } catch (e) {} sourceNode = null; }
      if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
    }

    // ---------- referencia de instrumentos (mini réplica del gráfico principal) ----------
    const TICKS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    function renderRefChart() {
      refRuler.innerHTML = TICKS.map((f) => {
        const p = pct(f);
        return `<div class="tick" style="left:${p}%;"><span>${fmtHz(f)}</span></div>`;
      }).join('');

      refRows.innerHTML = (typeof INSTRUMENTS !== 'undefined' ? INSTRUMENTS : []).map((inst) => {
        const fLow = pct(inst.range[0]), fHigh = pct(inst.range[1]);
        let harmHtml = '';
        if (inst.harm) {
          const hLow = pct(inst.range[0]), hHigh = pct(inst.harm[1]);
          harmHtml = `<div class="bar-harm" style="left:${hLow}%;width:${Math.max(0.5, hHigh - hLow)}%;"></div>`;
        }
        return `<div class="row">
          <div class="row-label"><span class="dot"></span>${inst.name}</div>
          <div class="row-track">
            ${harmHtml}
            <div class="bar-fund" style="left:${fLow}%;width:${Math.max(0.6, fHigh - fLow)}%;cursor:default;"></div>
          </div>
        </div>`;
      }).join('');
    }
    renderRefChart();

    function updateOverlayVisibility() {
      refWrap.classList.toggle('hidden', !overlayToggle.checked);
    }
    overlayToggle.addEventListener('change', updateOverlayVisibility);
    updateOverlayVisibility();

    // ---------- dibujo del espectro ----------
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawFrame() {
      if (!analyser) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      const bufferLength = analyser.frequencyBinCount;
      const data = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(data);

      ctx2d.clearRect(0, 0, w, h);

      // rejilla vertical sutil en las marcas de frecuencia
      ctx2d.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx2d.lineWidth = 1;
      TICKS.forEach((f) => {
        const x = (pct(f) / 100) * w;
        ctx2d.beginPath(); ctx2d.moveTo(x, 0); ctx2d.lineTo(x, h); ctx2d.stroke();
      });

      const sampleRate = audioCtx.sampleRate;
      const nyquist = sampleRate / 2;

      // construir el trazado del espectro mapeado a escala logarítmica
      ctx2d.beginPath();
      ctx2d.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const frac = x / w;
        const logF = LOG_MIN + frac * LOG_RANGE;
        const freq = Math.pow(10, logF);
        const bin = Math.min(bufferLength - 1, Math.round((freq / nyquist) * bufferLength));
        const v = data[bin] / 255; // 0..1
        const y = h - v * h;
        ctx2d.lineTo(x, y);
      }
      ctx2d.lineTo(w, h);
      ctx2d.closePath();

      const grad = ctx2d.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(212,168,79,0.85)');
      grad.addColorStop(0.6, 'rgba(212,168,79,0.35)');
      grad.addColorStop(1, 'rgba(212,168,79,0.05)');
      ctx2d.fillStyle = grad;
      ctx2d.fill();
      ctx2d.strokeStyle = '#e5bd67';
      ctx2d.lineWidth = 1.5;
      ctx2d.stroke();
    }

    // ---------- indicador de frecuencia al pasar el mouse ----------
    function fmtHzPrecise(f) {
      if (f >= 1000) return (f / 1000).toFixed(f >= 10000 ? 1 : 2) + ' kHz';
      return Math.round(f) + ' Hz';
    }

    function updateHover(clientX) {
      if (!hasSignal) return;
      const rect = canvasWrap.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(rect.width, x));
      const frac = rect.width ? x / rect.width : 0;
      const logF = LOG_MIN + frac * LOG_RANGE;
      const freq = Math.pow(10, logF);

      hoverLine.style.left = x + 'px';
      hoverLine.style.display = 'block';

      hoverLabel.textContent = fmtHzPrecise(freq);
      hoverLabel.style.display = 'block';
      // mantener la etiqueta dentro del recuadro
      const labelHalfWidth = hoverLabel.offsetWidth / 2 || 30;
      const clampedX = Math.max(labelHalfWidth + 4, Math.min(rect.width - labelHalfWidth - 4, x));
      hoverLabel.style.left = clampedX + 'px';
    }

    function hideHover() {
      hoverLine.style.display = 'none';
      hoverLabel.style.display = 'none';
    }

    canvasWrap.addEventListener('mousemove', (e) => updateHover(e.clientX));
    canvasWrap.addEventListener('mouseleave', hideHover);
    canvasWrap.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) { updateHover(e.touches[0].clientX); e.preventDefault(); }
    }, { passive: false });
    canvasWrap.addEventListener('touchend', hideHover);

    function loop() {
      if (freezeToggle.checked) { rafId = requestAnimationFrame(loop); return; }
      drawFrame();
      rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      resizeCanvas();
      emptyMsg.style.display = 'none';
      hasSignal = true;
      if (!rafId) rafId = requestAnimationFrame(loop);
    }
    function stopLoopIfIdle() {
      if (audioEl.paused && !micStream) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    }

    // ---------- fuente: archivo de audio ----------
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      ensureAudio();
      disconnectSource();
      const url = URL.createObjectURL(file);
      audioEl.src = url;
      audioEl.style.display = '';
      fileNameEl.textContent = file.name;
      sourceNode = audioCtx.createMediaElementSource(audioEl);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
      audioEl.play().catch(() => {});
    });

    audioEl.addEventListener('play', () => { if (audioCtx.state === 'suspended') audioCtx.resume(); startLoop(); });
    audioEl.addEventListener('pause', stopLoopIfIdle);
    audioEl.addEventListener('ended', stopLoopIfIdle);

    // ---------- fuente: micrófono ----------
    let micActive = false;
    micBtn.addEventListener('click', async () => {
      ensureAudio();
      if (micActive) {
        disconnectSource();
        micActive = false;
        micBtn.textContent = '🎙 Usar micrófono';
        stopLoopIfIdle();
        return;
      }
      disconnectSource();
      audioEl.pause();
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        fileNameEl.textContent = 'No se pudo acceder al micrófono.';
        return;
      }
      micStream = stream;
      sourceNode = audioCtx.createMediaStreamSource(micStream);
      sourceNode.connect(analyser);
      // el micrófono NO se conecta a destination, para evitar retroalimentación (feedback)
      micActive = true;
      micBtn.textContent = '⏹ Detener micrófono';
      fileNameEl.textContent = 'Escuchando micrófono…';
      if (audioCtx.state === 'suspended') audioCtx.resume();
      startLoop();
    });

    window.addEventListener('resize', () => { if (hasSignal) resizeCanvas(); });

    window.addEventListener('crescendo:view-change', (e) => {
      if (e.detail && e.detail.view === 'analyzer') {
        resizeCanvas();
        if ((!audioEl.paused || micActive) && !rafId) rafId = requestAnimationFrame(loop);
      } else {
        // pausar todo al salir de la vista para no dejar audio/mic corriendo de fondo
        audioEl.pause();
        if (micActive) { micBtn.click(); }
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    });

    window.addEventListener('beforeunload', () => { disconnectSource(); });
  });
})();
