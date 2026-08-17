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

    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let micStream = null;       // stream activo por micrófono O por "compartir pestaña"
    let activeExternalKind = null; // 'mic' | 'tab' | null
    let rafId = null;
    let hasSignal = false;
    let lastData = null;       // último frame de amplitudes (para hover, incluso congelado)
    const DB_MIN = -100, DB_MAX = 0;

    function ensureAudio() {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.82;
      analyser.minDecibels = -100;
      analyser.maxDecibels = 0;
    }

    function disconnectSource() {
      if (sourceNode) { try { sourceNode.disconnect(); } catch (e) {} sourceNode = null; }
      if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
      activeExternalKind = null;
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

    // ---------- eje de frecuencias bajo el espectro (mismas marcas log que la rejilla) ----------
    function renderAxisRow() {
        const axisRow = $('analyzerAxisRow');
        if (!axisRow) return;
        axisRow.innerHTML = TICKS.map((f) => {
            const p = pct(f);
            return `<span class="axis-tick" style="left:${p}%;">${fmtHz(f)}</span>`;
        }).join('');
    }
    renderAxisRow();

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
      lastData = data;

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

    function loop() {
      if (freezeToggle.checked) { rafId = requestAnimationFrame(loop); return; }
      drawFrame();
      rafId = requestAnimationFrame(loop);
    }

    // ---------- eje de dB (fijo, se dibuja una sola vez) ----------
    function renderDbAxis() {
      const dbAxisEl = $('analyzerDbAxis');
      if (!dbAxisEl) return;
      const steps = [0, -20, -40, -60, -80, -100];
      dbAxisEl.innerHTML = steps.map((db) => {
        const top = ((DB_MAX - db) / (DB_MAX - DB_MIN)) * 100;
        return `<div class="db-tick" style="top:${top}%;">${db} dB</div>`;
      }).join('');
    }
    renderDbAxis();

    // ---------- hover: frecuencia (y amplitud) exacta bajo el cursor ----------
    const hoverLine = $('analyzerHoverLine');
    const hoverLabel = $('analyzerHoverLabel');

    function freqAtX(xPx, widthPx) {
      const frac = Math.max(0, Math.min(1, xPx / widthPx));
      const logF = LOG_MIN + frac * LOG_RANGE;
      return Math.pow(10, logF);
    }
    function fmtHzPrecise(f) {
      if (f >= 1000) return (f / 1000).toFixed(f >= 10000 ? 1 : 2) + ' kHz';
      return Math.round(f) + ' Hz';
    }
    function dbAtFreq(freq) {
      if (!lastData || !audioCtx) return null;
      const nyquist = audioCtx.sampleRate / 2;
      const bin = Math.min(lastData.length - 1, Math.round((freq / nyquist) * lastData.length));
      const v = lastData[bin] / 255;
      return Math.round(DB_MIN + v * (DB_MAX - DB_MIN));
    }

    function handleHoverMove(clientX) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      if (x < 0 || x > rect.width) { hideHover(); return; }
      const freq = freqAtX(x, rect.width);
      const db = dbAtFreq(freq);
      hoverLine.style.left = x + 'px';
      hoverLine.style.display = 'block';
      hoverLabel.style.left = x + 'px';
      hoverLabel.textContent = db !== null ? `${fmtHzPrecise(freq)} · ${db} dB` : fmtHzPrecise(freq);
      hoverLabel.style.display = 'block';
      // evita que la etiqueta se salga del contenedor por los bordes
      const wrapWidth = rect.width;
      const estLabelWidth = hoverLabel.offsetWidth || 90;
      if (x < estLabelWidth / 2) hoverLabel.style.transform = 'translateX(0)';
      else if (x > wrapWidth - estLabelWidth / 2) hoverLabel.style.transform = 'translateX(-100%)';
      else hoverLabel.style.transform = 'translateX(-50%)';
    }
    function hideHover() {
      hoverLine.style.display = 'none';
      hoverLabel.style.display = 'none';
    }
    const canvasWrapEl = $('analyzerCanvasWrap');
    canvasWrapEl.addEventListener('mousemove', (e) => handleHoverMove(e.clientX));
    canvasWrapEl.addEventListener('mouseleave', hideHover);
    canvasWrapEl.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) { handleHoverMove(e.touches[0].clientX); e.preventDefault(); }
    }, { passive: false });
    canvasWrapEl.addEventListener('touchend', hideHover);

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
      resetCaptureUI();
      const embedBlockEl = $('analyzerEmbedBlock');
      if (embedBlockEl) embedBlockEl.style.display = 'none';
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
    let tabShareActive = false;

    function resetCaptureUI() {
      micActive = false;
      tabShareActive = false;
      micBtn.textContent = '🎙 Usar micrófono';
      const shareBtn = $('analyzerShareTabBtn');
      if (shareBtn) shareBtn.textContent = '🔊 Compartir audio de esta pestaña';
    }

    micBtn.addEventListener('click', async () => {
      ensureAudio();
      if (micActive) {
        disconnectSource();
        resetCaptureUI();
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
      activeExternalKind = 'mic';
      sourceNode = audioCtx.createMediaStreamSource(micStream);
      sourceNode.connect(analyser);
      // el micrófono NO se conecta a destination, para evitar retroalimentación (feedback)
      micActive = true;
      micBtn.textContent = '⏹ Detener micrófono';
      fileNameEl.textContent = 'Escuchando micrófono…';
      if (audioCtx.state === 'suspended') audioCtx.resume();
      startLoop();
    });

    // ---------- fuente: link de YouTube / Spotify + captura de audio de la pestaña ----------
    const linkInput = $('analyzerLinkInput');
    const linkBtn = $('analyzerLinkBtn');
    const embedBlock = $('analyzerEmbedBlock');
    const embedWrap = $('analyzerEmbedWrap');
    const embedHint = $('analyzerEmbedHint');
    const shareTabBtn = $('analyzerShareTabBtn');
    const embedRemoveBtn = $('analyzerEmbedRemoveBtn');

    function parseYouTube(url) {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      ];
      for (const re of patterns) {
        const m = url.match(re);
        if (m) return m[1];
      }
      return null;
    }
    function parseSpotify(url) {
      const m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
      if (m) return { type: m[1], id: m[2] };
      return null;
    }

    function loadEmbed() {
      const url = linkInput.value.trim();
      if (!url) return;

      disconnectSource();
      audioEl.pause();
      audioEl.removeAttribute('src');
      audioEl.style.display = 'none';

      const ytId = parseYouTube(url);
      const sp = !ytId ? parseSpotify(url) : null;

      if (ytId) {
        embedWrap.className = 'analyzer-embed-wrap yt';
        embedWrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?enablejsapi=1" title="YouTube" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        embedHint.textContent = 'Dale play al video y luego toca "Compartir audio de esta pestaña" — en el diálogo del navegador, elige esta misma pestaña con audio incluido.';
        embedBlock.style.display = '';
      } else if (sp) {
        const tall = sp.type === 'playlist' || sp.type === 'album' || sp.type === 'show';
        embedWrap.className = 'analyzer-embed-wrap sp' + (tall ? ' tall' : '');
        embedWrap.innerHTML = `<iframe src="https://open.spotify.com/embed/${sp.type}/${sp.id}" title="Spotify" allow="autoplay; encrypted-media" loading="lazy"></iframe>`;
        embedHint.textContent = 'Sin sesión Premium iniciada en este reproductor, Spotify solo reproduce un avance de 30 segundos — suficiente para ver el espectro. Dale play y luego toca "Compartir audio de esta pestaña".';
        embedBlock.style.display = '';
      } else {
        embedBlock.style.display = 'none';
        fileNameEl.textContent = 'Ese link no parece ser de YouTube ni de Spotify.';
        return;
      }
      fileNameEl.textContent = '';
    }

    linkBtn.addEventListener('click', loadEmbed);
    linkInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadEmbed(); });

    embedRemoveBtn.addEventListener('click', () => {
      embedBlock.style.display = 'none';
      embedWrap.innerHTML = '';
      linkInput.value = '';
      if (tabShareActive) { disconnectSource(); resetCaptureUI(); stopLoopIfIdle(); }
    });

    shareTabBtn.addEventListener('click', async () => {
      ensureAudio();
      if (tabShareActive) {
        disconnectSource();
        resetCaptureUI();
        stopLoopIfIdle();
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        embedHint.textContent = 'Tu navegador no soporta compartir audio de pestaña. Prueba con Chrome o Edge actualizados.';
        return;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } catch (err) {
        return; // el usuario canceló el diálogo de permiso
      }
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks.length) {
        stream.getTracks().forEach((t) => t.stop());
        embedHint.textContent = 'No se compartió audio — vuelve a intentar y activa la opción "Compartir audio de la pestaña" en el diálogo del navegador.';
        return;
      }
      stream.getVideoTracks().forEach((t) => t.stop()); // no necesitamos video, solo el audio
      disconnectSource();
      micStream = stream;
      activeExternalKind = 'tab';
      sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNode.connect(analyser);
      // no se conecta a destination: el audio ya suena por la pestaña compartida, solo lo analizamos
      tabShareActive = true;
      shareTabBtn.textContent = '⏹ Detener captura de pestaña';
      embedHint.textContent = 'Capturando el audio de la pestaña compartida.';
      if (audioCtx.state === 'suspended') audioCtx.resume();
      startLoop();
      // si el usuario cierra el diálogo de compartir desde la barra del navegador
      audioTracks[0].addEventListener('ended', () => { disconnectSource(); resetCaptureUI(); stopLoopIfIdle(); });
    });

    window.addEventListener('resize', () => { if (hasSignal) resizeCanvas(); });

    window.addEventListener('crescendo:view-change', (e) => {
      if (e.detail && e.detail.view === 'analyzer') {
        resizeCanvas();
        if ((!audioEl.paused || micActive || tabShareActive) && !rafId) rafId = requestAnimationFrame(loop);
      } else {
        // pausar todo al salir de la vista para no dejar audio/mic/captura corriendo de fondo
        audioEl.pause();
        if (micActive || tabShareActive) { disconnectSource(); resetCaptureUI(); }
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    });

    window.addEventListener('beforeunload', () => { disconnectSource(); });
  });
})();
