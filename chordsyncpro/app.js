(function () {
  const $ = (id) => document.getElementById(id);
  const SESSIONS_KEY = 'chordsync-pro-sessions';

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
  const liveMode = { active: false, stream: null, ctx: null, processor: null };
  let workletBlobUrl = null;
  let liveBusy = false;

  // ---------- worker ----------
  function ensureWorker() {
    if (worker) return;
    worker = new Worker('worker.js');
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'ready') { workerReady = true; return; }
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
        renderLiveChord(msg.chord, msg.key, msg.scale);
        return;
      }
    };
  }

  function workerRequest(type, payload, transferables) {
    return new Promise((resolve, reject) => {
      ensureWorker();
      const id = ++reqCounter;
      pendingRequests[id] = { resolve, reject };
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
      setStatus('Analizando tonalidad, acordes y tempo… (puede tardar unos segundos)');

      const result = await workerRequest('analyzeFile', {
        samples: monoData,
        sampleRate: audioBuffer.sampleRate,
        duration: audioBuffer.duration,
      });

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
  $('progressBar').addEventListener('click', (e) => {
    if (!audioElement || !analysisResult) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioElement.currentTime = ((e.clientX - rect.left) / rect.width) * analysisResult.duration;
  });

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
      const label = showNashville ? chordToNashville(seg.chord, analysisResult.key) : seg.chord;
      $('currentChordName').textContent = label;
      const conf = Math.round((seg.confidence || 0) * 100);
      $('confidenceFill').style.width = conf + '%';
      if (seg.chord !== lastDiagramChord) {
        $('guitarDiagram').innerHTML = renderGuitarDiagramSVG(seg.chord);
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

  function buildTimeline() {
    const track = $('timelineTrack');
    track.innerHTML = '<div class="playhead" id="playhead" style="left:0%"></div>';
    const totalDuration = analysisResult.duration;
    const trackWidth = Math.max(800, totalDuration * 40);
    track.style.width = trackWidth + 'px';

    analysisResult.segments.forEach((seg, idx) => {
      const el = document.createElement('div');
      el.className = 'chord-segment';
      el.dataset.index = idx;
      const label = showNashville ? chordToNashville(seg.chord, analysisResult.key) : seg.chord;
      el.innerHTML = `<span class="seg-label">${label}</span>
        <span class="seg-tools">
          <span class="seg-tool-btn" data-action="edit" title="Corregir acorde">✎</span>
          <span class="seg-tool-btn${loopSegment && loopSegment.start === seg.start ? ' loop-on' : ''}" data-action="loop" title="Practicar en loop">↻</span>
        </span>`;
      el.style.left = (seg.start / totalDuration * 100) + '%';
      el.style.width = Math.max(((seg.end - seg.start) / totalDuration * 100), 0.5) + '%';
      el.title = `${seg.chord} (${formatTime(seg.start)} - ${formatTime(seg.end)})`;

      el.addEventListener('click', (e) => {
        const action = e.target.closest('.seg-tool-btn');
        if (action && action.dataset.action === 'edit') { editSegmentChord(idx); return; }
        if (action && action.dataset.action === 'loop') { toggleLoopSegment(seg); return; }
        seekTo(seg.start);
      });
      track.appendChild(el);
    });
  }

  function editSegmentChord(idx) {
    const seg = analysisResult.segments[idx];
    const input = prompt('Corregir acorde (ej: C, C#m, D, F#m)\nTríadas mayores/menores solamente.', seg.chord);
    if (input === null) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    const parsed = parseChordLabel(trimmed) || parseChordLabel(trimmed.replace(/^([A-Ga-g])/, (m) => m.toUpperCase()));
    if (!parsed) { showToast('Formato de acorde no reconocido — usa algo como "C" o "F#m".'); return; }
    seg.chord = parsed.quality === 'minor' ? parsed.root + 'm' : parsed.root;
    seg.corrected = true;
    analysisResult.totalChords = new Set(analysisResult.segments.map((s) => s.chord)).size;
    $('chordCountValue').textContent = analysisResult.totalChords;
    buildTimeline();
    updateDisplay(audioElement ? audioElement.currentTime : 0);
    showToast('Acorde corregido.');
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

  // ---------- Nashville ----------
  $('nashvilleToggle').addEventListener('change', (e) => {
    showNashville = e.target.checked;
    if (analysisResult) { buildTimeline(); updateDisplay(audioElement ? audioElement.currentTime : 0); }
  });

  // ---------- exportar ----------
  $('exportJsonBtn').addEventListener('click', () => {
    if (!analysisResult) { showToast('No hay análisis para exportar'); return; }
    const data = { ...analysisResult, exportedAt: new Date().toISOString(), app: 'ChordSync Pro', version: '3.0' };
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
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- sesiones guardadas (localStorage) ----------
  function loadSessions() { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch (e) { return []; } }
  function saveSessions(list) { try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(list)); } catch (e) {} }

  function renderSessionList() {
    const list = loadSessions();
    const el = $('sessionList');
    if (!list.length) { el.innerHTML = '<span style="color:var(--text-dim);font-size:0.82rem;">Todavía no has guardado ninguna sesión.</span>'; return; }
    el.innerHTML = list.map((s, i) => `
      <div class="session-item">
        <div><div class="name">${s.song}</div><div class="meta">${s.key} ${s.scale === 'major' ? 'Mayor' : 'Menor'} · ${s.bpm || '—'} BPM · ${formatTime(s.duration)}</div></div>
        <div class="actions">
          <button class="btn-ghost" data-load="${i}">Cargar</button>
          <button class="btn-ghost" data-del="${i}">Eliminar</button>
        </div>
      </div>`).join('');
    el.querySelectorAll('[data-load]').forEach((btn) => btn.addEventListener('click', () => loadSession(Number(btn.dataset.load))));
    el.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', () => deleteSession(Number(btn.dataset.del))));
  }

  $('saveSessionBtn').addEventListener('click', () => {
    if (!analysisResult) { showToast('No hay análisis para guardar'); return; }
    const list = loadSessions();
    const exists = list.findIndex((s) => s.song === analysisResult.song && Math.abs(s.duration - analysisResult.duration) < 0.5);
    const record = { ...analysisResult, savedAt: new Date().toISOString() };
    if (exists > -1) list[exists] = record; else list.unshift(record);
    saveSessions(list.slice(0, 30));
    renderSessionList();
    showToast('Sesión guardada — nota: al recargarla no se reproduce audio, solo se restaura el análisis.');
  });

  function loadSession(i) {
    const list = loadSessions();
    const record = list[i];
    if (!record) return;
    analysisResult = JSON.parse(JSON.stringify(record));
    loopSegment = null;
    audioElement = null; // sin archivo original, no hay reproducción disponible hasta subir el archivo de nuevo
    $('resultsCard').style.display = 'block';
    displayResults();
    showToast('Sesión cargada. Sube el mismo archivo de audio para poder reproducirlo sincronizado.');
    $('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function deleteSession(i) {
    const list = loadSessions();
    list.splice(i, 1);
    saveSessions(list);
    renderSessionList();
  }
  renderSessionList();

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
          constructor() { super(); this.buffer = new Float32Array(88200); this.idx = 0; this.windowSize = 88200; }
          process(inputs) {
            const input = inputs[0];
            if (!input || !input[0]) return true;
            const channel = input[0];
            for (let i = 0; i < channel.length; i++) {
              this.buffer[this.idx] = channel[i]; this.idx++;
              if (this.idx >= this.windowSize) { this.port.postMessage({ samples: this.buffer.slice() }); this.idx = 0; }
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

  function renderLiveChord(chord, key, scale) {
    $('liveChordText').classList.remove('detecting');
    const label = chord === 'N' || !chord ? '—' : chord;
    $('liveChordText').textContent = label;
    $('liveKeyValue').textContent = key ? `${key} ${scale === 'major' ? 'Mayor' : 'Menor'}` : '—';
    if (chord && chord !== 'N') {
      $('liveGuitarDiagram').innerHTML = renderGuitarDiagramSVG(chord);
      $('livePianoDiagram').innerHTML = renderPianoDiagramSVG(chord);
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
  }

  window.addEventListener('beforeunload', () => { stopLive(); if (worker) worker.terminate(); });

  // pre-calienta el worker (empieza a cargar Essentia) apenas se abre la página
  ensureWorker();
})();
