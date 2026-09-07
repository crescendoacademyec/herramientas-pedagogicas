(function () {
  const $ = (id) => document.getElementById(id);
  const SESSIONS_KEY = 'chordsync-pro-sessions-v4';
  const LEGACY_SESSIONS_KEY = 'chordsync-pro-sessions';
  const MAX_SESSIONS = 40;

  // ---------- estado ----------
  let worker = null;
  let workerReady = false;
  let pendingRequests = {};
  let reqCounter = 0;

  let currentFile = null;
  let isVideoFile = false;
  let audioElement = null;
  let analysisResult = null; // { key, scale, bpm, meter, strength, duration, segments, totalChords, song }
  let isPlaying = false;
  let animationFrame = null;
  let showNashville = false;
  let loopSegment = null; // { start, end } o null

  // liveMode
  const liveMode = {
    active: false, stream: null, ctx: null, processor: null,
    chordHistory: [], keyHistory: [], displayedChord: '', displayedKey: ''
  };
  let workletBlobUrl = null;
  let liveBusy = false;

  // ---------- worker ----------
  function ensureWorker() {
    if (worker) return;
    try {
      worker = new Worker('worker.js');
    } catch (err) {
      console.error('No se pudo crear el Worker:', err);
      setStatus('');
      showToast('No se pudo iniciar el motor de análisis. Si abriste el archivo directamente (doble clic), esto no funciona — debe servirse desde un servidor web (http/https), como GitHub Pages.');
      return;
    }
    worker.onerror = (err) => {
      console.error('Fallo al cargar/ejecutar worker.js:', err.message || err);
      setStatus('');
      showToast('No se pudo cargar el motor de análisis (Essentia). Revisa que todos los archivos de la carpeta (essentia-wasm.web.js, essentia-wasm.web.wasm, essentia.js-core.js, worker.js) estén subidos junto a index.html.');
      // rechaza cualquier solicitud pendiente para que la UI no se quede colgada esperando
      Object.keys(pendingRequests).forEach((id) => { pendingRequests[id].reject(new Error('Worker falló al cargar.')); delete pendingRequests[id]; });
      liveBusy = false;
      err.preventDefault && err.preventDefault();
    };
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'ready') { workerReady = true; return; }
      if (msg.type === 'progress') { setStatus(msg.message); return; }
      if (msg.type === 'error') {
        console.error('Worker error:', msg.message);
        liveBusy = false;
        if (msg.id && pendingRequests[msg.id]) { pendingRequests[msg.id].reject(new Error(msg.message)); delete pendingRequests[msg.id]; }
        else showToast('Error de análisis: ' + msg.message);
        setStatus('');
        return;
      }
      if (msg.type === 'fileResult') {
        if (pendingRequests[msg.id]) { pendingRequests[msg.id].resolve(msg.result); delete pendingRequests[msg.id]; }
        return;
      }
      if (msg.type === 'liveResult') {
        liveBusy = false;
        handleStableLiveResult(msg);
        return;
      }
    };
  }

  function workerRequest(type, payload, transferables, timeoutMs) {
    return new Promise((resolve, reject) => {
      ensureWorker();
      if (!worker) {
        reject(new Error('El motor de análisis no está disponible.'));
        return;
      }
      const id = ++reqCounter;
      const timeout = timeoutMs
        ? setTimeout(() => {
            if (pendingRequests[id]) {
              delete pendingRequests[id];
              reject(new Error('El análisis tardó demasiado y se canceló (posible archivo muy largo o problema con el motor de análisis).'));
            }
          }, timeoutMs)
        : null;
      pendingRequests[id] = {
        resolve: (v) => { if (timeout) clearTimeout(timeout); resolve(v); },
        reject: (e) => { if (timeout) clearTimeout(timeout); reject(e); },
      };
      worker.postMessage({ type, id, ...payload }, transferables || []);
    });
  }

  // ---------- utilidades ----------
  function showToast(msg) {
    const toast = $('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }
  function setStatus(msg) {
    const row = $('statusRow');
    if (!msg) { row.style.display = 'none'; return; }
    row.style.display = 'flex';
    $('statusText').textContent = msg;
  }
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  function mixToMono(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const mono = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let c = 0; c < numChannels; c++) sum += audioBuffer.getChannelData(c)[i];
      mono[i] = sum / numChannels;
    }
    return mono;
  }

  // ---------- modo (archivo / en vivo) ----------
  $('modeTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-tab');
    if (!btn) return;
    const mode = btn.dataset.mode;
    document.querySelectorAll('.mode-tab').forEach((t) => t.classList.toggle('active', t === btn));
    $('panelFile').classList.toggle('active', mode === 'file');
    $('panelLive').classList.toggle('active', mode === 'live');
    if (mode === 'file') stopLive(); else stopPlayback();
  });

  // ---------- manejo de archivo ----------
  const dropZone = $('dropZone');
  const fileInput = $('fileInput');
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });
  $('openAnotherBtn').addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });

  // ---------- link de YouTube / Spotify + grabación de audio de la pestaña ----------
  const linkInput = $('linkInput');
  const linkBtn = $('linkBtn');
  const embedBlock = $('embedBlock');
  const embedWrap = $('embedWrap');
  const embedHint = $('embedHint');
  const recordTabBtn = $('recordTabBtn');
  const embedRemoveBtn = $('embedRemoveBtn');
  const recordStatus = $('recordStatus');

  function parseYouTube(url) {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  function parseSpotify(url) {
    const m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    return m ? { type: m[1], id: m[2] } : null;
  }

  function loadEmbed() {
    const url = linkInput.value.trim();
    if (!url) return;
    const ytId = parseYouTube(url);
    const sp = !ytId ? parseSpotify(url) : null;

    if (ytId) {
      embedWrap.className = 'embed-wrap yt';
      embedWrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?enablejsapi=1" title="YouTube" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      embedHint.textContent = 'Dale play al video y luego toca "Grabar audio de esta pestaña" — en el diálogo del navegador, elige esta misma pestaña con audio incluido. No pauses ni adelantes el video mientras se graba.';
      embedBlock.style.display = '';
    } else if (sp) {
      const tall = sp.type === 'playlist' || sp.type === 'album' || sp.type === 'show';
      embedWrap.className = 'embed-wrap sp' + (tall ? ' tall' : '');
      embedWrap.innerHTML = `<iframe src="https://open.spotify.com/embed/${sp.type}/${sp.id}" title="Spotify" allow="autoplay; encrypted-media" loading="lazy"></iframe>`;
      embedHint.textContent = 'Sin sesión Premium en este reproductor, Spotify solo suena un avance de 30 segundos. Dale play y toca "Grabar audio de esta pestaña" sin pausar ni adelantar.';
      embedBlock.style.display = '';
    } else {
      embedBlock.style.display = 'none';
      showToast('Ese link no parece ser de YouTube ni de Spotify.');
      return;
    }
  }
  linkBtn.addEventListener('click', loadEmbed);
  linkInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadEmbed(); });
  embedRemoveBtn.addEventListener('click', () => {
    embedBlock.style.display = 'none';
    embedWrap.innerHTML = '';
    linkInput.value = '';
  });

  // ---------- grabación de audio de la pestaña compartida ----------
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordStartTime = 0;
  let recordTimerId = null;
  let captureStream = null;

  function pickRecorderMime() {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4'];
    if (!window.MediaRecorder) return null;
    for (const type of candidates) if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) return type;
    return null;
  }

  function fmtRecTime(sec) {
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  recordTabBtn.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') { mediaRecorder.stop(); return; }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      embedHint.textContent = 'Tu navegador no soporta grabar audio de pestaña. Prueba con Chrome o Edge actualizados.';
      return;
    }
    const mime = pickRecorderMime();
    if (!mime) { embedHint.textContent = 'Tu navegador no puede grabar audio en un formato compatible.'; return; }

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
    stream.getVideoTracks().forEach((t) => t.stop()); // no necesitamos el video, solo el audio
    captureStream = stream;
    recordedChunks = [];

    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
    } catch (err) {
      embedHint.textContent = 'No se pudo iniciar la grabación en este navegador.';
      return;
    }
    mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      clearInterval(recordTimerId);
      recordStatus.style.display = 'none';
      recordTabBtn.textContent = '⏺ Grabar audio de esta pestaña';
      recordTabBtn.disabled = false;
      linkInput.disabled = false;
      if (captureStream) { captureStream.getTracks().forEach((t) => t.stop()); captureStream = null; }

      if (!recordedChunks.length) { showToast('La grabación quedó vacía.'); return; }
      const blob = new Blob(recordedChunks, { type: mime });
      const ext = mime.includes('mp4') ? 'm4a' : 'webm';
      const title = (linkInput.value.trim() || 'grabacion-youtube').replace(/[^\w.-]+/g, '_').slice(0, 60);
      const file = new File([blob], `${title}.${ext}`, { type: mime });
      showToast('Grabación lista — analizando…');
      embedBlock.style.display = 'none';
      handleFile(file);
    };
    audioTracks[0].addEventListener('ended', () => { if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop(); });

    mediaRecorder.start();
    recordStartTime = Date.now();
    recordStatus.style.display = 'flex';
    recordStatus.innerHTML = '<span class="record-dot"></span><span id="recordTimeText">Grabando… 0:00</span>';
    recordTimerId = setInterval(() => {
      const el = document.getElementById('recordTimeText');
      if (el) el.textContent = 'Grabando… ' + fmtRecTime((Date.now() - recordStartTime) / 1000);
    }, 500);
    recordTabBtn.textContent = '⏹ Detener grabación';
    linkInput.disabled = true;
    embedHint.textContent = 'Grabando en tiempo real — no pauses ni adelantes el video. Toca "Detener grabación" solo cuando termine la canción (o si quieres cortar antes).';
  });

  async function handleFile(file) {
    currentFile = file;
    isVideoFile = file.type.startsWith('video/') || /\.(mp4|m4v|mov|mkv|avi|wmv|flv|f4v|mpg|mpeg|mpe|m2ts|mts|ts|3gp|3g2|ogv|vob|mxf|asf|rm|rmvb|divx|dv|qt)$/i.test(file.name);

    setStatus(isVideoFile ? 'Video detectado — extrayendo el audio…' : 'Cargando el archivo…');
    $('resultsCard').style.display = 'none';

    try {
      ensureWorker();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      let audioBuffer;
      try {
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      } catch (e1) {
        setStatus('');
        showToast(isVideoFile ? 'No se pudo extraer el audio de este video (códec no compatible).' : 'No se pudo decodificar este archivo de audio.');
        return;
      }

      const monoData = audioBuffer.numberOfChannels > 1 ? mixToMono(audioBuffer) : audioBuffer.getChannelData(0);
      setStatus('Analizando tonalidad, acordes y tempo… (puede tardar hasta un minuto en canciones largas)');

      const result = await workerRequest('analyzeFile', {
        samples: monoData,
        sampleRate: audioBuffer.sampleRate,
        duration: audioBuffer.duration,
      }, [], 180000); // tope de 3 minutos: si se excede, se cancela y se avisa en vez de colgarse

      result.song = file.name;
      result.isVideo = isVideoFile;
      analysisResult = result;
      loopSegment = null;

      setupPlayer(file);
      displayResults();
      setStatus('');
      $('resultsCard').style.display = 'block';
      $('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error(err);
      setStatus('');
      showToast('Error: ' + (err.message || err));
    }
  }

  // ---------- reproductor (usa el archivo original directamente, sin reconvertir) ----------
  function setupPlayer(file) {
    if (audioElement) { audioElement.pause(); audioElement.src = ''; audioElement = null; }
    const url = URL.createObjectURL(file);
    audioElement = new Audio(url);
    audioElement.addEventListener('ended', () => {
      isPlaying = false; updatePlayButton();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    });
    audioElement.addEventListener('timeupdate', () => {
      if (loopSegment && audioElement.currentTime >= loopSegment.end) {
        audioElement.currentTime = loopSegment.start;
      }
    });
  }

  $('playBtn').addEventListener('click', togglePlay);
  function togglePlay() {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause(); isPlaying = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
    } else {
      audioElement.play().catch(() => {});
      isPlaying = true; tick();
    }
    updatePlayButton();
  }
  function updatePlayButton() {
    $('playIcon').style.display = isPlaying ? 'none' : 'block';
    $('pauseIcon').style.display = isPlaying ? 'block' : 'none';
  }
  function stopPlayback() {
    if (audioElement) { audioElement.pause(); }
    isPlaying = false; updatePlayButton();
    if (animationFrame) cancelAnimationFrame(animationFrame);
  }
  function seekTo(time) {
    if (!audioElement) return;
    audioElement.currentTime = time;
    if (!isPlaying) updateDisplay(time);
  }

  // ---------- barra de progreso: clic para saltar, y arrastre del indicador con el mouse/touch ----------
  const progressBar = $('progressBar');
  let isScrubbing = false;
  let wasPlayingBeforeScrub = false;

  function timeFromPointerEvent(e) {
    const rect = progressBar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return ratio * analysisResult.duration;
  }

  function startScrub(e) {
    if (!audioElement || !analysisResult) return;
    isScrubbing = true;
    progressBar.classList.add('scrubbing');
    wasPlayingBeforeScrub = isPlaying;
    if (isPlaying) { audioElement.pause(); if (animationFrame) cancelAnimationFrame(animationFrame); }
    updateDisplay(timeFromPointerEvent(e));
    e.preventDefault();
  }
  function moveScrub(e) {
    if (!isScrubbing) return;
    updateDisplay(timeFromPointerEvent(e));
    e.preventDefault();
  }
  function endScrub(e) {
    if (!isScrubbing) return;
    isScrubbing = false;
    progressBar.classList.remove('scrubbing');
    audioElement.currentTime = timeFromPointerEvent(e.changedTouches ? { touches: e.changedTouches } : e);
    if (wasPlayingBeforeScrub) { audioElement.play().catch(() => {}); isPlaying = true; tick(); updatePlayButton(); }
  }

  progressBar.addEventListener('mousedown', startScrub);
  window.addEventListener('mousemove', moveScrub);
  window.addEventListener('mouseup', (e) => { if (isScrubbing) endScrub(e); });
  progressBar.addEventListener('touchstart', startScrub, { passive: false });
  window.addEventListener('touchmove', moveScrub, { passive: false });
  window.addEventListener('touchend', (e) => { if (isScrubbing) endScrub(e); });

  function tick() {
    if (!isPlaying || !audioElement) return;
    updateDisplay(audioElement.currentTime);
    animationFrame = requestAnimationFrame(tick);
  }

  function findCurrentSegment(t) {
    if (!analysisResult) return null;
    for (const seg of analysisResult.segments) if (t >= seg.start && t < seg.end) return seg;
    return null;
  }

  const FLAT_KEY_NAMES = new Set(['F','Bb','Eb','Ab','Db','Gb','Cb']);
  const SHARP_KEY_NAMES = new Set(['G','D','A','E','B','F#','C#']);

  function noteNameForPreference(pc, preferFlats) {
    const sharps = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const flats  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
    return (preferFlats ? flats : sharps)[((pc % 12) + 12) % 12];
  }

  function displayChordForKey(chord, keyRoot) {
    const parsed = parseChordLabel(chord);
    if (!parsed) return chord;
    const preferFlats = FLAT_KEY_NAMES.has(keyRoot) ||
      (!SHARP_KEY_NAMES.has(keyRoot) && String(keyRoot || '').includes('b'));
    const root = noteNameForPreference(parsed.semitone, preferFlats);
    let bass = '';
    if (parsed.bassRoot) {
      bass = '/' + noteNameForPreference(NOTE_TO_SEMITONE[parsed.bassRoot], preferFlats);
    }
    return root + parsed.suffix + bass;
  }

  let lastDiagramChord = null;
  function updateDisplay(currentTime) {
    if (!analysisResult) return;
    const duration = analysisResult.duration;
    const pct = Math.min((currentTime / duration) * 100, 100);
    $('progressFill').style.width = pct + '%';
    $('timeDisplay').textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    const playhead = document.getElementById('playhead');
    if (playhead) playhead.style.left = pct + '%';

    const seg = findCurrentSegment(currentTime);
    if (seg) {
      const label = showNashville
        ? chordToNashville(seg.chord, analysisResult.key)
        : displayChordForKey(seg.chord, analysisResult.key);
      $('currentChordName').textContent = label;
      const conf = Math.round((seg.confidence || 0) * 100);
      $('confidenceFill').style.width = conf + '%';
      if (seg.chord !== lastDiagramChord) {
        const guitarSvg = renderGuitarDiagramSVG(seg.chord);
        const ukuleleSvg = renderUkuleleDiagramSVG(seg.chord);
        $('guitarDiagram').innerHTML = guitarSvg || '<div class="diagram-unavailable">Digitación no incluida todavía para esta extensión.</div>';
        $('ukuleleDiagram').innerHTML = ukuleleSvg || '<div class="diagram-unavailable">Digitación no incluida todavía para esta extensión.</div>';
        $('pianoDiagram').innerHTML = renderPianoDiagramSVG(seg.chord);
        lastDiagramChord = seg.chord;
      }
    } else {
      $('currentChordName').textContent = '—';
      $('confidenceFill').style.width = '0%';
    }

    document.querySelectorAll('.chord-segment').forEach((el) => {
      const idx = Number(el.dataset.index);
      const s = analysisResult.segments[idx];
      const active = s && currentTime >= s.start && currentTime < s.end;
      el.classList.toggle('active', !!active);
      if (active) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });

    updateBeatGrid(currentTime);
  }

  // ---------- resultados / timeline / beat grid ----------
  function displayResults() {
    $('fileTitleEl').innerHTML = (analysisResult.song || 'Sin nombre') +
      (analysisResult.isVideo ? '<span>Audio extraído de video</span>' : '<span></span>');
    $('keyValue').textContent = analysisResult.key || '—';
    $('scaleValue').textContent = analysisResult.scale === 'major' ? 'Mayor' : (analysisResult.scale === 'minor' ? 'Menor' : '—');
    $('bpmValue').textContent = analysisResult.bpm !== null && analysisResult.bpm !== undefined ? analysisResult.bpm : '—';
    const meterVal = analysisResult.meter;
    document.getElementById('meterValue').innerHTML = (meterVal !== null && meterVal !== undefined ? meterVal + '/4' : '—') + '<span class="value small-note">experimental</span>';
    $('strengthValue').textContent = analysisResult.strength !== null && analysisResult.strength !== undefined ? analysisResult.strength : '—';
    $('durationValue').textContent = formatTime(analysisResult.duration);
    $('chordCountValue').textContent = analysisResult.totalChords;
    syncAnalysisCorrectionControls();

    buildBeatGrid();
    buildTimeline();
    lastDiagramChord = null;
    updateDisplay(0);
  }

  function buildBeatGrid() {
    const beatGrid = $('beatGrid');
    beatGrid.innerHTML = '';
    if (!analysisResult || !analysisResult.bpm || !analysisResult.meter) return;
    const meter = analysisResult.meter;
    const totalBeats = Math.min(meter * 4, 16);
    for (let i = 0; i < totalBeats; i++) {
      const dot = document.createElement('div');
      dot.className = 'beat-dot' + (i % meter === 0 ? ' downbeat' : '');
      beatGrid.appendChild(dot);
    }
  }
  function updateBeatGrid(currentTime) {
    if (!analysisResult || !analysisResult.bpm || !analysisResult.meter) return;
    const bpm = analysisResult.bpm, meter = analysisResult.meter;
    const beatDuration = 60 / bpm;
    const measureDuration = beatDuration * meter;
    const posInMeasure = (currentTime % measureDuration) / measureDuration;
    const currentBeat = Math.floor(posInMeasure * meter);
    document.querySelectorAll('.beat-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentBeat);
    });
  }

  const MIN_SEGMENT_DURATION = 0.15; // segundos — duración mínima permitida al editar a mano

  function sortSegments() {
    analysisResult.segments.sort((a, b) => a.start - b.start);
  }
  function recomputeChordCount() {
    analysisResult.totalChords = new Set(analysisResult.segments.map((s) => s.chord)).size;
    $('chordCountValue').textContent = analysisResult.totalChords;
  }
  function refreshAfterEdit() {
    sortSegments();
    recomputeChordCount();
    buildTimeline();
    updateDisplay(audioElement ? audioElement.currentTime : 0);
  }

  // calcula las posiciones en píxeles de cada segmento, con un ancho mínimo legible que
  // nunca invade el espacio del siguiente acorde (esto es lo que antes causaba que acordes
  // muy cortos se dibujaran encimados: se forzaba un ancho mínimo en PORCENTAJE del total de
  // la canción, que en canciones largas podía ser mucho más ancho en píxeles que el hueco real
  // disponible antes del siguiente acorde detectado)
  function computeSegmentPositions(segs, trackWidth, totalDuration) {
    const pxPerSec = trackWidth / totalDuration;
    const MIN_PX = 14;
    const positions = segs.map((seg) => ({
      left: seg.start * pxPerSec,
      width: (seg.end - seg.start) * pxPerSec,
    }));
    positions.forEach((p, i) => {
      if (p.width < MIN_PX) {
        const nextLeft = i < positions.length - 1 ? positions[i + 1].left : trackWidth;
        p.width = Math.max(Math.min(MIN_PX, nextLeft - p.left), 2);
      }
    });
    return positions;
  }

  function buildTimeline() {
    const track = $('timelineTrack');
    track.innerHTML = '<div class="playhead" id="playhead" style="left:0px"></div>';
    sortSegments();
    const totalDuration = analysisResult.duration;
    const trackWidth = Math.max(800, totalDuration * 40);
    track.style.width = trackWidth + 'px';
    const segs = analysisResult.segments;
    const positions = computeSegmentPositions(segs, trackWidth, totalDuration);

    segs.forEach((seg, idx) => {
      const el = document.createElement('div');
      el.className = 'chord-segment' + (seg.corrected ? ' corrected' : '');
      el.dataset.index = idx;
      const label = showNashville
        ? chordToNashville(seg.chord, analysisResult.key)
        : displayChordForKey(seg.chord, analysisResult.key);
      el.innerHTML = `<span class="seg-resize-handle" data-handle="left"></span>
        <span class="seg-label">${label}</span>
        <span class="seg-tools">
          <span class="seg-tool-btn" data-action="edit" title="Corregir acorde">✎</span>
          <span class="seg-tool-btn" data-action="split" title="Dividir en dos">✂</span>
          <span class="seg-tool-btn${loopSegment && loopSegment.start === seg.start ? ' loop-on' : ''}" data-action="loop" title="Practicar en loop">↻</span>
          <span class="seg-tool-btn seg-tool-danger" data-action="delete" title="Eliminar acorde">🗑</span>
        </span>
        <span class="seg-resize-handle right" data-handle="right"></span>`;
      el.style.left = positions[idx].left + 'px';
      el.style.width = positions[idx].width + 'px';
      const displayChord = displayChordForKey(seg.chord, analysisResult.key);
      el.title = `${displayChord} (${formatTime(seg.start)} - ${formatTime(seg.end)}) — arrastra los bordes para ajustar la duración`;

      el.addEventListener('click', (e) => {
        if (e.target.closest('.seg-resize-handle')) return; // ya lo maneja el arrastre
        const action = e.target.closest('.seg-tool-btn');
        if (action) {
          const act = action.dataset.action;
          if (act === 'edit') editSegmentChord(idx);
          else if (act === 'loop') toggleLoopSegment(seg);
          else if (act === 'delete') deleteSegment(idx);
          else if (act === 'split') splitSegment(idx);
          return;
        }
        seekTo(seg.start);
      });

      attachResizeHandles(el, idx);
      track.appendChild(el);
    });
  }

  // ---------- edición de segmentos: corregir, eliminar, dividir, añadir, redimensionar ----------
  function editSegmentChord(idx) {
    const seg = analysisResult.segments[idx];
    const input = prompt(
      'Corregir acorde\\n\\nEjemplos: C · Cm · Cmaj7 · C7 · Cm7 · C#m7b5 · Bdim7 · Dsus4 · A6 · Cadd9 · G9 · D/F#',
      seg.chord
    );
    if (input === null) return;
    const parsed = parseChordLabel(input);
    if (!parsed) {
      showToast('Formato no reconocido. Prueba Cmaj7, Dm7, G7, F#m7b5, Bdim7, Dsus4 o D/F#.');
      return;
    }
    seg.chord = parsed.normalized;
    seg.corrected = true;
    refreshAfterEdit();
    showToast('Acorde corregido manualmente.');
  }

  function deleteSegment(idx) {
    const segs = analysisResult.segments;
    const removed = segs[idx];
    if (loopSegment && loopSegment.start === removed.start && loopSegment.end === removed.end) {
      loopSegment = null;
      $('loopIndicator').style.display = 'none';
    }
    const hasPrev = idx > 0;
    segs.splice(idx, 1);
    // en vez de dejar un hueco de silencio, el espacio liberado se reparte extendiendo
    // al acorde vecino que sí sonaba (el anterior si existe, si no el siguiente)
    if (hasPrev) segs[idx - 1].end = removed.end;
    else if (segs.length) segs[0].start = removed.start;
    refreshAfterEdit();
    showToast('Acorde eliminado.');
  }

  function splitSegment(idx) {
    const seg = analysisResult.segments[idx];
    const mid = (seg.start + seg.end) / 2;
    if (mid - seg.start < MIN_SEGMENT_DURATION || seg.end - mid < MIN_SEGMENT_DURATION) {
      showToast('Este acorde es demasiado corto para dividirlo — agrándalo primero arrastrando un borde.');
      return;
    }
    const newSeg = { chord: seg.chord, start: mid, end: seg.end, strength: seg.strength, confidence: seg.confidence, corrected: true };
    seg.end = mid;
    seg.corrected = true;
    analysisResult.segments.splice(idx + 1, 0, newSeg);
    refreshAfterEdit();
    showToast('Acorde dividido en dos — edita la segunda mitad para asignarle otro acorde.');
  }

  function findGapAt(time) {
    const segs = analysisResult.segments; // ya vienen ordenados por buildTimeline
    if (!segs.length) return { start: 0, end: analysisResult.duration };
    if (time < segs[0].start) return { start: 0, end: segs[0].start };
    for (let i = 0; i < segs.length; i++) {
      if (time >= segs[i].start && time < segs[i].end) return null; // cae dentro de un acorde existente
      const next = segs[i + 1];
      if (next && time >= segs[i].end && time < next.start) return { start: segs[i].end, end: next.start };
    }
    const last = segs[segs.length - 1];
    if (time >= last.end) return { start: last.end, end: analysisResult.duration };
    return null;
  }

  function handleTrackBackgroundClick(e) {
    if (!analysisResult || e.target.closest('.chord-segment')) return;
    const track = $('timelineTrack');
    const rect = track.getBoundingClientRect();
    const clickTime = ((e.clientX - rect.left) / rect.width) * analysisResult.duration;
    const gap = findGapAt(clickTime);
    if (!gap || gap.end - gap.start < 0.1) return; // hueco inexistente o insignificante
    const input = prompt(
      `Añadir un acorde aquí (ej: Cmaj7, Dm7, G7, F#m7b5)\nOcupará de ${formatTime(gap.start)} a ${formatTime(gap.end)} — luego puedes ajustar la duración arrastrando sus bordes.`,
      'C'
    );
    if (input === null) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    const parsed = parseChordLabel(trimmed);
    if (!parsed) {
      showToast('Formato no reconocido. Prueba C, Cm7, G7, F#m7b5, Bdim7 o D/F#.');
      return;
    }
    const chord = parsed.normalized;
    analysisResult.segments.push({ chord, start: gap.start, end: gap.end, strength: 1, confidence: 1, corrected: true });
    refreshAfterEdit();
    showToast('Acorde añadido.');
  }
  $('timelineTrack').addEventListener('click', handleTrackBackgroundClick);

  // ---------- redimensionar arrastrando el borde izquierdo o derecho de un acorde ----------
  let resizingState = null;
  function attachResizeHandles(el, idx) {
    el.querySelectorAll('.seg-resize-handle').forEach((handle) => {
      const side = handle.dataset.handle;
      handle.addEventListener('mousedown', (e) => startResize(e, idx, side));
      handle.addEventListener('touchstart', (e) => startResize(e, idx, side), { passive: false });
    });
  }
  function startResize(e, idx, side) {
    e.stopPropagation();
    e.preventDefault();
    const track = $('timelineTrack');
    const rect = track.getBoundingClientRect();
    resizingState = { idx, side, rectLeft: rect.left, rectWidth: rect.width };
    document.body.classList.add('resizing-segment');
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeEnd);
    window.addEventListener('touchmove', onResizeMove, { passive: false });
    window.addEventListener('touchend', onResizeEnd);
  }
  function onResizeMove(e) {
    if (!resizingState || !analysisResult) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const t = ((clientX - resizingState.rectLeft) / resizingState.rectWidth) * analysisResult.duration;
    const segs = analysisResult.segments;
    const { idx, side } = resizingState;
    const seg = segs[idx];
    if (!seg) return;
    if (side === 'right') {
      const maxEnd = idx < segs.length - 1 ? segs[idx + 1].start : analysisResult.duration;
      seg.end = Math.min(Math.max(t, seg.start + MIN_SEGMENT_DURATION), maxEnd);
    } else {
      const minStart = idx > 0 ? segs[idx - 1].end : 0;
      seg.start = Math.max(Math.min(t, seg.end - MIN_SEGMENT_DURATION), minStart);
    }
    renderTimelinePositionsOnly();
  }
  function onResizeEnd() {
    if (!resizingState) return;
    resizingState = null;
    document.body.classList.remove('resizing-segment');
    window.removeEventListener('mousemove', onResizeMove);
    window.removeEventListener('mouseup', onResizeEnd);
    window.removeEventListener('touchmove', onResizeMove);
    window.removeEventListener('touchend', onResizeEnd);
    refreshAfterEdit();
  }
  // durante el arrastre solo reposicionamos los elementos existentes (barato), en vez de
  // reconstruir todo el timeline en cada movimiento del mouse
  function renderTimelinePositionsOnly() {
    const track = $('timelineTrack');
    const totalDuration = analysisResult.duration;
    const trackWidth = parseFloat(track.style.width) || track.getBoundingClientRect().width;
    const segs = analysisResult.segments;
    const positions = computeSegmentPositions(segs, trackWidth, totalDuration);
    track.querySelectorAll('.chord-segment').forEach((el) => {
      const idx = Number(el.dataset.index);
      const seg = segs[idx];
      const pos = positions[idx];
      if (!seg || !pos) return;
      el.style.left = pos.left + 'px';
      el.style.width = pos.width + 'px';
      el.title = `${seg.chord} (${formatTime(seg.start)} - ${formatTime(seg.end)}) — arrastra los bordes para ajustar la duración`;
    });
  }

  function toggleLoopSegment(seg) {
    if (loopSegment && loopSegment.start === seg.start && loopSegment.end === seg.end) {
      loopSegment = null;
      $('loopIndicator').style.display = 'none';
    } else {
      loopSegment = { start: seg.start, end: seg.end };
      $('loopIndicator').style.display = 'flex';
      $('loopIndicator').textContent = `🔁 Practicando en loop: ${seg.chord} (${formatTime(seg.start)} – ${formatTime(seg.end)}). Toca ↻ de nuevo para quitar el loop.`;
      if (audioElement) seekTo(seg.start);
    }
    buildTimeline();
  }

  // ---------- correcciones manuales de tonalidad / tempo ----------
  function syncAnalysisCorrectionControls() {
    if (!analysisResult) return;
    if ($('keyCorrectionSelect')) $('keyCorrectionSelect').value = analysisResult.key || 'C';
    if ($('scaleCorrectionSelect')) $('scaleCorrectionSelect').value = analysisResult.scale === 'minor' ? 'minor' : 'major';
    if ($('bpmCorrectionInput')) $('bpmCorrectionInput').value =
      analysisResult.bpm !== null && analysisResult.bpm !== undefined ? analysisResult.bpm : '';
  }

  function setManualBpm(nextBpm) {
    if (!analysisResult) return;
    const value = Number(nextBpm);
    if (!Number.isFinite(value) || value < 20 || value > 360) {
      showToast('El BPM debe estar entre 20 y 360.');
      return;
    }
    analysisResult.bpm = Math.round(value * 10) / 10;
    analysisResult.bpmCorrected = true;
    $('bpmValue').textContent = analysisResult.bpm;
    if ($('bpmCorrectionInput')) $('bpmCorrectionInput').value = analysisResult.bpm;
    buildBeatGrid();
    updateDisplay(audioElement ? audioElement.currentTime : 0);
  }

  $('halfBpmBtn')?.addEventListener('click', () => {
    if (!analysisResult?.bpm) return;
    setManualBpm(analysisResult.bpm / 2);
  });

  $('doubleBpmBtn')?.addEventListener('click', () => {
    if (!analysisResult?.bpm) return;
    setManualBpm(analysisResult.bpm * 2);
  });

  $('applyAnalysisCorrectionsBtn')?.addEventListener('click', () => {
    if (!analysisResult) return;
    const key = $('keyCorrectionSelect')?.value || analysisResult.key;
    const scale = $('scaleCorrectionSelect')?.value || analysisResult.scale;
    const bpmText = $('bpmCorrectionInput')?.value;

    analysisResult.key = key;
    analysisResult.scale = scale;
    analysisResult.keyCorrected = true;
    analysisResult.scaleCorrected = true;

    if (bpmText !== '') {
      const bpm = Number(bpmText);
      if (!Number.isFinite(bpm) || bpm < 20 || bpm > 360) {
        showToast('El BPM debe estar entre 20 y 360.');
        return;
      }
      analysisResult.bpm = Math.round(bpm * 10) / 10;
      analysisResult.bpmCorrected = true;
    }

    $('keyValue').textContent = analysisResult.key || '—';
    $('scaleValue').textContent = analysisResult.scale === 'major' ? 'Mayor' : 'Menor';
    $('bpmValue').textContent = analysisResult.bpm ?? '—';
    buildBeatGrid();
    buildTimeline();
    lastDiagramChord = null;
    updateDisplay(audioElement ? audioElement.currentTime : 0);
    showToast('Tonalidad y tempo actualizados manualmente.');
  });

  // ---------- Nashville ----------
  $('nashvilleToggle').addEventListener('change', (e) => {
    showNashville = e.target.checked;
    if (analysisResult) { buildTimeline(); updateDisplay(audioElement ? audioElement.currentTime : 0); }
  });

  // ---------- exportar ----------
  $('exportJsonBtn').addEventListener('click', () => {
    if (!analysisResult) { showToast('No hay análisis para exportar'); return; }
    const data = {
      schema: 'chordsync-analysis',
      schemaVersion: 4,
      ...analysisResult,
      segments: analysisResult.segments.map(seg => ({ ...seg })),
      exportedAt: new Date().toISOString(),
      app: 'ChordSync Pro',
      version: '4.0'
    };
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      (analysisResult.song || 'chordsync').replace(/\.[^/.]+$/, '') + '_analysis.json');
    showToast('JSON exportado correctamente');
  });

  $('exportChordProBtn').addEventListener('click', () => {
    if (!analysisResult) { showToast('No hay análisis para exportar'); return; }
    const title = (analysisResult.song || 'Sin título').replace(/\.[^/.]+$/, '');
    let cp = `{title: ${title}}\n{key: ${analysisResult.key}}\n{duration: ${formatTime(analysisResult.duration)}}\n{scale: ${analysisResult.scale}}\n`;
    if (analysisResult.bpm) cp += `{tempo: ${analysisResult.bpm}}\n`;
    if (analysisResult.meter) cp += `{time: ${analysisResult.meter}/4}\n`;
    cp += `{comment: Generado por ChordSync Pro — Crescendo Academy}\n\n`;
    let line = '', lastEnd = 0;
    analysisResult.segments.forEach((seg) => {
      const gap = seg.start - lastEnd;
      if (gap > 2) { if (line.trim()) cp += line.trim() + '\n\n'; line = ''; }
      const spaces = Math.max(1, Math.round((seg.end - seg.start) * 2));
      line += `[${seg.chord}]${' '.repeat(spaces)}`;
      lastEnd = seg.end;
    });
    if (line.trim()) cp += line.trim() + '\n';
    downloadBlob(new Blob([cp], { type: 'text/plain' }), title + '.cho');
    showToast('ChordPro exportado correctamente');
  });

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- sesiones guardadas (localStorage) ----------
  function normalizeSession(session) {
    if (!session || typeof session !== 'object') return null;
    const segments = Array.isArray(session.segments)
      ? session.segments
          .filter(seg => seg && Number.isFinite(Number(seg.start)) && Number.isFinite(Number(seg.end)) && seg.end > seg.start)
          .map(seg => ({
            chord: String(seg.chord || 'N'),
            start: Number(seg.start),
            end: Number(seg.end),
            strength: Number(seg.strength || 0),
            confidence: Number(seg.confidence || 0),
            corrected: Boolean(seg.corrected)
          }))
      : [];
    return {
      ...session,
      song: String(session.song || 'Sesión sin título'),
      key: String(session.key || ''),
      scale: session.scale === 'minor' ? 'minor' : 'major',
      bpm: Number.isFinite(Number(session.bpm)) ? Number(session.bpm) : null,
      meter: Number.isFinite(Number(session.meter)) ? Number(session.meter) : null,
      duration: Number.isFinite(Number(session.duration)) ? Number(session.duration) : 0,
      segments,
      savedAt: session.savedAt || new Date().toISOString()
    };
  }

  function loadSessions() {
    try {
      let raw = localStorage.getItem(SESSIONS_KEY);
      if (!raw) {
        const legacy = localStorage.getItem(LEGACY_SESSIONS_KEY);
        if (legacy) {
          raw = legacy;
          localStorage.setItem(SESSIONS_KEY, legacy);
        }
      }
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed.map(normalizeSession).filter(Boolean) : [];
    } catch (e) {
      console.warn('No se pudieron leer las sesiones guardadas:', e);
      return [];
    }
  }

  function saveSessions(list) {
    const trimmed = (Array.isArray(list) ? list : [])
      .map(normalizeSession)
      .filter(Boolean)
      .slice(-MAX_SESSIONS);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn('No se pudieron guardar las sesiones:', e);
      showToast('No hay espacio suficiente para guardar más sesiones en este navegador.');
      return false;
    }
  }

  function renderSessionList() {
    const list = loadSessions();
    const el = $('sessionList');
    el.innerHTML = '';
    if (!list.length) {
      const empty = document.createElement('span');
      empty.style.color = 'var(--text-dim)';
      empty.style.fontSize = '0.82rem';
      empty.textContent = 'Todavía no has guardado ninguna sesión.';
      el.appendChild(empty);
      return;
    }

    list.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'session-item';

      const info = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = s.song || 'Sesión sin título';

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${s.key || '—'} ${s.scale === 'major' ? 'Mayor' : 'Menor'} · ${s.bpm || '—'} BPM · ${formatTime(s.duration || 0)}`;

      info.append(name, meta);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const loadBtn = document.createElement('button');
      loadBtn.className = 'btn-ghost';
      loadBtn.type = 'button';
      loadBtn.textContent = 'Cargar';
      loadBtn.addEventListener('click', () => loadSession(i));

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-ghost';
      delBtn.type = 'button';
      delBtn.textContent = 'Eliminar';
      delBtn.addEventListener('click', () => deleteSession(i));

      actions.append(loadBtn, delBtn);
      item.append(info, actions);
      el.appendChild(item);
    });
  }

  $('saveSessionBtn').addEventListener('click', () => {
    if (!analysisResult) { showToast('No hay análisis para guardar.'); return; }
    const list = loadSessions();
    const snapshot = normalizeSession({
      ...analysisResult,
      segments: analysisResult.segments.map(seg => ({ ...seg })),
      savedAt: new Date().toISOString()
    });
    list.push(snapshot);
    if (saveSessions(list)) {
      renderSessionList();
      showToast(`Sesión guardada localmente (${Math.min(list.length, MAX_SESSIONS)}/${MAX_SESSIONS}).`);
    }
  });

  function loadSession(index) {
    const list = loadSessions();
    const session = normalizeSession(list[index]);
    if (!session) { showToast('La sesión guardada no es válida.'); return; }

    stopPlayback();
    analysisResult = session;
    currentFile = null;
    isVideoFile = false;

    $('uploadCard').style.display = 'none';
    $('resultsCard').style.display = '';
    $('fileTitleEl').firstChild.textContent = session.song || 'Sesión guardada';
    $('fileMetaEl').textContent = ' · sesión local (sin audio original)';
    $('keyValue').textContent = session.key || '—';
    $('scaleValue').textContent = session.scale === 'major' ? 'Mayor' : 'Menor';
    $('bpmValue').textContent = session.bpm || '—';
    $('meterValue').firstChild.textContent = session.meter ? `${session.meter}/4` : '—';
    $('durationValue').textContent = formatTime(session.duration || 0);
    $('chordCountValue').textContent = session.totalChords || session.segments.length;

    syncAnalysisCorrectionControls();
    buildBeatGrid();
    buildTimeline();
    lastDiagramChord = null;
    updateDisplay(0);
    showToast('Sesión cargada. El audio original no se guarda dentro de la sesión.');
  }

  function deleteSession(index) {
    const list = loadSessions();
    const item = list[index];
    if (!item) return;
    if (!confirm(`Eliminar la sesión guardada "${item.song || 'Sin título'}"?`)) return;
    list.splice(index, 1);
    saveSessions(list);
    renderSessionList();
    showToast('Sesión eliminada.');
  }

  // ==================== MODO EN VIVO (AudioWorklet) ====================
  const micBtn = $('micBtn');
  micBtn.addEventListener('click', () => { if (liveMode.active) stopLive(); else startLive(); });

  async function startLive() {
    try {
      ensureWorker();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, sampleRate: 44100 } });
      liveMode.stream = stream;
      const ctx = new AudioContext({ sampleRate: 44100 });
      liveMode.ctx = ctx;

      const workletCode = `
        class ChordProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            // Ventana 1.2 s con salto 0.6 s: suficiente contexto armónico sin esperar 2 s completos.
            this.windowSize = Math.max(4096, Math.round(sampleRate * 1.2));
            this.hopSize = Math.max(2048, Math.round(sampleRate * 0.6));
            this.overlap = this.windowSize - this.hopSize;
            this.buffer = new Float32Array(this.windowSize);
            this.idx = 0;
          }
          process(inputs) {
            const input = inputs[0];
            if (!input || !input[0]) return true;
            const channel = input[0];

            for (let i = 0; i < channel.length; i++) {
              this.buffer[this.idx++] = channel[i];

              if (this.idx >= this.windowSize) {
                this.port.postMessage({ samples: this.buffer.slice() });
                if (this.overlap > 0) {
                  this.buffer.copyWithin(0, this.hopSize, this.windowSize);
                  this.idx = this.overlap;
                } else {
                  this.idx = 0;
                }
              }
            }
            return true;
          }
        }
        registerProcessor('chord-processor', ChordProcessor);
      `;
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      workletBlobUrl = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(workletBlobUrl);

      const source = ctx.createMediaStreamSource(stream);
      const processor = new AudioWorkletNode(ctx, 'chord-processor');
      liveMode.processor = processor;

      processor.port.onmessage = (e) => {
        if (liveBusy) return; // evita acumular pedidos si el análisis anterior no ha terminado
        liveBusy = true;
        const id = ++reqCounter;
        worker.postMessage({ type: 'analyzeLiveChunk', id, samples: e.data.samples, sampleRate: ctx.sampleRate });
      };
      source.connect(processor);

      liveMode.active = true;
      liveMode.chordHistory = [];
      liveMode.keyHistory = [];
      liveMode.displayedChord = '';
      liveMode.displayedKey = '';
      micBtn.classList.add('recording');
      $('micIcon').style.display = 'none';
      $('stopIcon').style.display = 'block';
      $('liveStatus').textContent = 'Escuchando… toca un acorde';
      $('liveChordText').textContent = '...';
      $('liveChordText').classList.add('detecting');
    } catch (err) {
      console.error(err);
      showToast('Error de micrófono: ' + err.message);
    }
  }

  function majorityValue(items, getter) {
    const counts = new Map();
    items.forEach(item => {
      const value = getter(item);
      if (!value) return;
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    let best = '', bestCount = 0;
    counts.forEach((count, value) => {
      if (count > bestCount) { best = value; bestCount = count; }
    });
    return { value: best, count: bestCount };
  }

  function handleStableLiveResult(msg) {
    const chord = msg.chord && msg.chord !== 'X' ? msg.chord : 'N';
    const confidence = Number(msg.confidence || 0);

    liveMode.chordHistory.push({ chord, confidence });
    if (liveMode.chordHistory.length > 5) liveMode.chordHistory.shift();

    if (msg.key) {
      liveMode.keyHistory.push({ key: msg.key, scale: msg.scale || 'major' });
      if (liveMode.keyHistory.length > 7) liveMode.keyHistory.shift();
    }

    const recent = liveMode.chordHistory.slice(-3);
    const chordVote = majorityValue(recent.filter(x => x.chord !== 'N'), x => x.chord);

    let stableChord = liveMode.displayedChord || 'N';
    // Cambia con 2 de las últimas 3 coincidencias, o con una lectura muy clara.
    if (chordVote.count >= 2) {
      stableChord = chordVote.value;
    } else if (chord !== 'N' && confidence >= 0.72) {
      stableChord = chord;
    } else if (recent.length >= 3 && recent.every(x => x.chord === 'N')) {
      stableChord = 'N';
    }

    const keyVote = majorityValue(liveMode.keyHistory, x => `${x.key}|${x.scale}`);
    let stableKey = liveMode.displayedKey;
    if (keyVote.count >= 4) stableKey = keyVote.value;

    liveMode.displayedChord = stableChord;
    liveMode.displayedKey = stableKey;

    const [key, scale] = stableKey ? stableKey.split('|') : ['', ''];
    renderLiveChord(stableChord, key, scale, confidence, msg.rmsDb);
  }

  function renderLiveChord(chord, key, scale, confidence = 0, rmsDb = null) {
    $('liveChordText').classList.remove('detecting');
    const label = chord === 'N' || !chord ? '—' : chord;
    $('liveChordText').textContent = label;

    $('liveKeyValue').textContent = key
      ? `${key} ${scale === 'major' ? 'Mayor' : 'Menor'}`
      : '—';

    const confidenceEl = $('liveConfidenceValue');
    if (confidenceEl) {
      confidenceEl.textContent = chord === 'N'
        ? '—'
        : `${Math.round(Math.max(0, Math.min(1, confidence)) * 100)}%`;
    }

    const levelEl = $('liveLevelValue');
    if (levelEl) {
      levelEl.textContent = Number.isFinite(Number(rmsDb)) ? `${Number(rmsDb).toFixed(0)} dBFS` : '—';
    }

    if (chord && chord !== 'N') {
      const guitarSvg = renderGuitarDiagramSVG(chord);
      const ukuleleSvg = renderUkuleleDiagramSVG(chord);
      $('liveGuitarDiagram').innerHTML = guitarSvg || '<div class="diagram-unavailable">Sin digitación verificada para esta extensión.</div>';
      $('liveUkuleleDiagram').innerHTML = ukuleleSvg || '<div class="diagram-unavailable">Sin digitación verificada para esta extensión.</div>';
      $('livePianoDiagram').innerHTML = renderPianoDiagramSVG(chord);
    } else {
      $('liveGuitarDiagram').innerHTML = '';
      $('liveUkuleleDiagram').innerHTML = '';
      $('livePianoDiagram').innerHTML = '';
    }
  }

  function stopLive() {
    if (!liveMode.active) return;
    liveMode.active = false;
    liveBusy = false;
    if (liveMode.processor) { liveMode.processor.disconnect(); liveMode.processor = null; }
    if (liveMode.ctx) { liveMode.ctx.close(); liveMode.ctx = null; }
    if (liveMode.stream) { liveMode.stream.getTracks().forEach((t) => t.stop()); liveMode.stream = null; }
    if (workletBlobUrl) { URL.revokeObjectURL(workletBlobUrl); workletBlobUrl = null; }

    micBtn.classList.remove('recording');
    $('micIcon').style.display = 'block';
    $('stopIcon').style.display = 'none';
    $('liveStatus').textContent = 'Toca el micrófono para comenzar';
    $('liveChordText').textContent = '—';
    $('liveChordText').classList.remove('detecting');
    $('liveKeyValue').textContent = '—';
    if ($('liveConfidenceValue')) $('liveConfidenceValue').textContent = '—';
    if ($('liveLevelValue')) $('liveLevelValue').textContent = '—';
    liveMode.chordHistory = [];
    liveMode.keyHistory = [];
    liveMode.displayedChord = '';
    liveMode.displayedKey = '';
  }

  window.addEventListener('beforeunload', () => { stopLive(); if (worker) worker.terminate(); });

  // pre-calienta el worker (empieza a cargar Essentia) apenas se abre la página
  ensureWorker();
})();
