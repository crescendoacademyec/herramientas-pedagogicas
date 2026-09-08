(function () {
  const $ = (id) => document.getElementById(id);
  const runtime = window.ChordSyncRuntime || {mode:'local',backend:true};
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
  let analysisResult = null; // v62: incluye estructura repetitiva multimodal + semántica híbrida/neural + matching armónico invariante a transposición.
  let isPlaying = false;
  let animationFrame = null;
  let showNashville = false;
  let chordDisplayLevel = 'medium';
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
      // Version the worker URL so a corrected analysis engine is never hidden
      // behind Chromium's dedicated-worker cache after an app reload.
      worker = new Worker('worker.js?v=63.1.0');
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

  const ENGINE_TUNING_KEY = 'chordsync-engine-tuning-v62';
  function loadEngineTuning() {
    const keys=[ENGINE_TUNING_KEY,'chordsync-engine-tuning-v54','chordsync-engine-tuning-v49','chordsync-engine-tuning-v43','chordsync-engine-tuning-v40','chordsync-engine-tuning-v37','chordsync-engine-tuning-v36','chordsync-engine-tuning-v35','chordsync-engine-tuning-v30','chordsync-engine-tuning-v29','chordsync-engine-tuning-v27','chordsync-engine-tuning-v26','chordsync-engine-tuning-v25','chordsync-engine-tuning-v22','chordsync-engine-tuning-v21','chordsync-engine-tuning-v20','chordsync-engine-tuning-v19','chordsync-engine-tuning-v18','chordsync-engine-tuning-v17','chordsync-engine-tuning-v16','chordsync-engine-tuning-v15','chordsync-engine-tuning-v14','chordsync-engine-tuning-v13','chordsync-engine-tuning-v12','chordsync-engine-tuning-v11'];
    for(const key of keys){
      try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(parsed&&typeof parsed==='object')return parsed;}}catch(e){}
    }
    return {};
  }
  function saveEngineTuning(tuning) {
    const safe=tuning&&typeof tuning==='object'?tuning:{};
    try{localStorage.setItem(ENGINE_TUNING_KEY,JSON.stringify(safe));}catch(e){console.warn('No se pudo guardar tuning',e);}
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

  function encodeMonoWav(samples, sampleRate) {
    const pcm = samples instanceof Float32Array ? samples : new Float32Array(samples || []);
    const buffer = new ArrayBuffer(44 + pcm.length * 2);
    const view = new DataView(buffer);
    const ascii = (offset, value) => { for (let i=0;i<value.length;i++) view.setUint8(offset+i,value.charCodeAt(i)); };
    ascii(0,'RIFF'); view.setUint32(4,36+pcm.length*2,true); ascii(8,'WAVE');
    ascii(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true);
    view.setUint16(22,1,true); view.setUint32(24,sampleRate,true);
    view.setUint32(28,sampleRate*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
    ascii(36,'data'); view.setUint32(40,pcm.length*2,true);
    for(let i=0,offset=44;i<pcm.length;i++,offset+=2){
      const value=Math.max(-1,Math.min(1,Number(pcm[i])||0));
      view.setInt16(offset,value<0?Math.round(value*32768):Math.round(value*32767),true);
    }
    return new Blob([buffer],{type:'audio/wav'});
  }

  async function ensureWavForChordBackend(file) {
    if (/\.wav$/i.test(file?.name||'') || /^(audio\/wav|audio\/x-wav)$/i.test(file?.type||'')) return file;
    const decoded=await decodeAudioFile(file);
    const base=String(file?.name||'audio').replace(/\.[^.]+$/,'') || 'audio';
    return new File([encodeMonoWav(decoded.samples,decoded.sampleRate)],`${base}.wav`,{type:'audio/wav'});
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

  // ---------- análisis multi-stream manual (v62) ----------
  const stemInput = $('stemInput');
  const stemAnalyzeBtn = $('stemAnalyzeBtn');
  function inferStemRole(name) {
    const n = String(name || '').toLowerCase();
    if (/(^|[_. -])(bass|bajo)([_. -]|$)/.test(n)) return 'bass';
    if (/(^|[_. -])(drums?|drum|bateria|batería|percussion)([_. -]|$)/.test(n)) return 'drums';
    if (/(^|[_. -])(vocals?|vocal|voz|voices?)([_. -]|$)/.test(n)) return 'vocals';
    if (/(^|[_. -])(other|instrumental|instruments?|accompaniment|music)([_. -]|$)/.test(n)) return 'other';
    if (/(^|[_. -])(mix|master|original|full)([_. -]|$)/.test(n)) return 'mix';
    return null;
  }
  async function decodeAudioFile(file) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const ab = await file.arrayBuffer();
      const b = await ctx.decodeAudioData(ab);
      return {samples:b.numberOfChannels>1?mixToMono(b):new Float32Array(b.getChannelData(0)),sampleRate:b.sampleRate,duration:b.duration};
    } finally { try{await ctx.close();}catch(_){} }
  }
  function resampleMono(samples, fromRate, toRate, targetLength) {
    if (fromRate === toRate && (!targetLength || samples.length === targetLength)) return new Float32Array(samples);
    const outLen = targetLength || Math.max(1, Math.round(samples.length * toRate / fromRate));
    const out = new Float32Array(outLen);
    const scale = (samples.length - 1) / Math.max(1, outLen - 1);
    for (let i=0;i<outLen;i++) { const x=i*scale, a=Math.floor(x), b=Math.min(samples.length-1,a+1), t=x-a; out[i]=samples[a]*(1-t)+samples[b]*t; }
    return out;
  }
  async function handleStemPackage(files) {
    const selected=[...files];
    if (selected.length < 2) { showToast('Selecciona al menos MIX + un stem (OTHER, BASS, DRUMS o VOCALS).'); return; }
    const byRole={}; const unknown=[];
    for (const f of selected) { const role=inferStemRole(f.name); if(role && !byRole[role]) byRole[role]=f; else unknown.push(f); }
    if (!byRole.mix && unknown.length) byRole.mix=unknown.shift();
    if (!byRole.mix) { showToast('No pude identificar el MIX. Nómbralo con “mix”, “master”, “original” o “full”.'); return; }
    if (!byRole.other && !byRole.bass && !byRole.drums && !byRole.vocals) { showToast('No pude identificar OTHER, BASS, DRUMS o VOCALS por nombre de archivo.'); return; }
    stemAnalyzeBtn.disabled=true; setStatus('Decodificando paquete de stems…'); $('resultsCard').style.display='none';
    try {
      const mix=await decodeAudioFile(byRole.mix); const targetLength=mix.samples.length; const streams={mix:mix.samples};
      for (const role of ['other','bass','drums','vocals']) if(byRole[role]) {
        setStatus(`Decodificando stem ${role.toUpperCase()}…`); const d=await decodeAudioFile(byRole[role]);
        streams[role]=resampleMono(d.samples,d.sampleRate,mix.sampleRate,targetLength);
      }
      setStatus('Analizando armonía, ritmo y estructura semántica con stems…');
      const tuning=loadEngineTuning(); let rhythmAnalysis=null, chordAnalysis=null, noteAnalysis=null; try{rhythmAnalysis=await fetchNeuralRhythm(byRole.mix,tuning);}catch(e){console.warn('Rhythm neural fallback',e);} try{chordAnalysis=await fetchNeuralChords(byRole.mix,tuning);}catch(e){console.warn('BTC chord fallback',e);} try{noteAnalysis=await fetchNeuralNotes(byRole.mix,tuning);}catch(e){console.warn('Multi-pitch fallback',e);}
      let result=await workerRequest('analyzeMultiStream',{streams,sampleRate:mix.sampleRate,duration:mix.duration,tuning,rhythmAnalysis,chordAnalysis,noteAnalysis},[],300000);
      result=await enrichResultWithNeuralStructure(byRole.mix,result,tuning);
      currentFile=byRole.mix; isVideoFile=false; result.song=byRole.mix.name; result.isVideo=false;
      result.stemFiles=Object.fromEntries(Object.entries(byRole).filter(([,f])=>f).map(([k,f])=>[k,f.name]));
      analysisResult=result; loopSegment=null; setupPlayer(byRole.mix); displayResults(); setStatus(''); $('resultsCard').style.display='block'; $('resultsCard').scrollIntoView({behavior:'smooth',block:'start'});
      const active=Object.keys(result.decoderDiagnostics?.streams||{}).filter(k=>result.decoderDiagnostics.streams[k]);
      showToast(`Multi-stream v62 listo: ${active.join(' + ').toUpperCase()}.`);
    } catch(err) { console.error(err); setStatus(''); showToast('Error multi-stream: '+(err.message||err)); }
    finally { stemAnalyzeBtn.disabled=false; }
  }
  stemAnalyzeBtn?.addEventListener('click',()=>{stemInput.value='';stemInput.click();});
  stemInput?.addEventListener('change',()=>{if(stemInput.files?.length)handleStemPackage(stemInput.files);});


  // ---------- separación automática real de stems vía backend Demucs (v37) ----------
  const autoStemInput = $('autoStemInput');
  const autoStemBtn = $('autoStemBtn');
  let activeStemJobId = null;

  async function fetchStemServiceHealth() {
    if (runtime.backend === false) throw new Error('Backend no disponible en esta edición.');
    const r = await fetch('/api/v1/health', {cache:'no-store'});
    if (!r.ok) throw new Error(`Backend de stems no disponible (${r.status}).`);
    return r.json();
  }

  async function fetchNeuralRhythm(file, tuning = null, options = {}) {
    if (!file) return null;
    const cfg = tuning || loadEngineTuning();
    const requested = String(cfg.rhythmProvider || 'auto').toLowerCase();
    if (requested === 'accent') return null;
    let health;
    try { health = await fetchStemServiceHealth(); } catch (_) { return null; }
    if (!health.beatnetAvailable) return null;
    if (options.status !== false) setStatus(`Analizando beat/downbeat neuronal (${health.rhythmProvider || 'BeatNet'})…`);
    const form = new FormData();
    form.append('file', file, file.name || 'audio.wav');
    const r = await fetch('/api/v1/rhythm', {method:'POST', body:form});
    let payload=null; try{payload=await r.json();}catch(_){}
    if(!r.ok) throw new Error(payload?.detail || `Análisis neuronal de ritmo falló (${r.status}).`);
    return payload;
  }

  async function fetchNeuralChords(file, tuning = null, options = {}) {
    if (!file) return null;
    const cfg = tuning || loadEngineTuning();
    const requested = String(cfg.acousticProvider || 'auto').toLowerCase();
    if (!['auto','btc','btc-ensemble'].includes(requested) && options.force !== true) return null;
    let health;
    try { health = await fetchStemServiceHealth(); } catch (_) { return null; }
    if (!health.chordAnalysisAvailable && !health.btcAvailable) return null;
    if (options.status !== false) setStatus(`Analizando acordes con ${health.chordProvider || 'proveedor neuronal'}…`);
    const backendFile = health.chordProviderResolved === 'madmom' ? await ensureWavForChordBackend(file) : file;
    const form = new FormData();
    form.append('file', backendFile, backendFile.name || 'audio.wav');
    const r = await fetch('/api/v1/chords', {method:'POST', body:form});
    let payload=null; try{payload=await r.json();}catch(_){}
    if(!r.ok) throw new Error(payload?.detail || `Análisis neuronal de acordes falló (${r.status}).`);
    return payload;
  }

  async function fetchNeuralNotes(file, tuning = null, options = {}) {
    if (!file) return null;
    const cfg = tuning || loadEngineTuning();
    const requested = String(cfg.noteTranscriptionProvider || 'auto').toLowerCase();
    if (requested === 'off' || requested === 'disabled') return null;
    let health;
    try { health = await fetchStemServiceHealth(); } catch (_) { return null; }
    if (!health.noteTranscriptionAvailable && !health.basicPitchAvailable) return null;
    if (options.status !== false) setStatus(`Transcribiendo notas y registros (${health.noteTranscriptionProvider || 'Basic Pitch'})…`);
    const form = new FormData();
    form.append('file', file, file.name || 'audio.wav');
    const r = await fetch('/api/v1/notes', {method:'POST', body:form});
    let payload=null; try{payload=await r.json();}catch(_){}
    if(!r.ok) throw new Error(payload?.detail || `Transcripción multi-pitch falló (${r.status}).`);
    return payload;
  }

  async function fetchNeuralStructureJoint(file, result = null, tuning = null, options = {}) {
    if (!file || (file.type && file.type.startsWith('video/'))) return null;
    const cfg=tuning||loadEngineTuning();
    const mode=String(cfg.structureJointProvider||'auto').toLowerCase();
    if(mode==='separate'||mode==='off'||mode==='heuristic') return null;
    let health; try{health=await fetchStemServiceHealth();}catch(_){return null;}
    if(!health.structureJointNeuralAvailable) return null;
    if(options.status!==false)setStatus(`Analizando estructura conjunta con ${health.structureJointProvider||'Transformer multi-task'}…`);
    const form=new FormData(); form.append('file',file,file.name||'audio.wav');
    form.append('threshold',String(Math.max(.20,Math.min(.95,Number(cfg.structureBoundaryMinConfidence??.55)))));
    form.append('sequence_context_weight',String(Math.max(0,Math.min(.8,Number(cfg.structureSequenceContextWeight??.28)))));
    form.append('repeat_context_weight',String(Math.max(0,Math.min(.8,Number(cfg.structureRepeatContextWeight??.26)))));
    if(result){
      const context={
        segments:(Array.isArray(result.segments)?result.segments:[]).slice(0,4000).map(s=>({start:Number(s.start)||0,end:Number(s.end)||0,chord:String(s.chord||s.chord_advanced||s.chord_medium||s.chord_easy||'N'),confidence:Number(s.confidence)||0,localKey:s.localKey?{key:String(s.localKey.key||''),scale:String(s.localKey.scale||''),confidence:Number(s.localKey.confidence)||0}:null})),
        beatMap:(Array.isArray(result.beatMap)?result.beatMap:[]).slice(0,12000).map(b=>({time:Number(b.time??b.curr_beat_time)||0,downbeat:!!b.downbeat,beat_num:Number(b.beat_num)||null,bar_num:Number(b.bar_num)||null})),
        globalKey:{key:String(result.key||''),scale:String(result.scale||''),confidence:Number(result.keyStrength??result.keyConfidence??0)||0},
        keyRegions:(Array.isArray(result.keyRegions)?result.keyRegions:[]).slice(0,256).map(r=>({start:Number(r.start)||0,end:Number(r.end)||0,key:String(r.key||''),scale:String(r.scale||''),confidence:Number(r.confidence)||0}))
      };
      form.append('context_json',JSON.stringify(context));
    }
    const r=await fetch('/api/v1/structure/joint',{method:'POST',body:form});
    let payload=null;try{payload=await r.json();}catch(_){}
    if(!r.ok)throw new Error(payload?.detail||`Modelo conjunto de estructura falló (${r.status}).`);
    return payload;
  }

  function applyJointStructurePredictions(result, joint, tuning = null) {
    if(!result||!Array.isArray(result.sections)||!Array.isArray(joint?.sections))return result;
    const cfg=tuning||loadEngineTuning();
    const provider=String(cfg.structureSemanticProvider||'ensemble').toLowerCase();
    const neuralWeight=Math.max(0,Math.min(1,Number(cfg.structureNeuralWeight??.76)));
    const minConfidence=Math.max(.20,Math.min(.95,Number(cfg.structureNeuralMinConfidence??.46)));
    const labels=['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Outro'];
    let accepted=0;
    const overlap=(a,b)=>Math.max(0,Math.min(Number(a.end),Number(b.end))-Math.max(Number(a.start),Number(b.start)));
    result.sections=result.sections.map((sec,index)=>{
      const mid=(Number(sec.start)+Number(sec.end))/2;
      let pred=joint.sections.find(x=>mid>=Number(x.start)&&mid<Number(x.end));
      if(!pred)pred=joint.sections.reduce((best,x)=>!best||overlap(sec,x)>overlap(sec,best)?x:best,null);
      if(!pred)return sec;
      const heuristicLabel=sec.semanticLabel||'Unclassified', heuristicConfidence=Number(sec.semanticConfidence)||0, heuristicScores=sec.semanticScores||{};
      const neuralScores=pred.probabilities||{}; const combined={};
      for(const label of labels){const np=Number(neuralScores[label])||0,hp=Number(heuristicScores[label])||0;combined[label]=provider==='neural'?np:(provider==='heuristic'?hp:neuralWeight*np+(1-neuralWeight)*hp);}
      const ranked=Object.entries(combined).sort((a,b)=>b[1]-a[1]); let finalLabel=heuristicLabel,finalConfidence=heuristicConfidence,method='joint-heuristic-fallback';
      if(provider!=='heuristic'){
        const candidate=ranked[0]||[pred.label,Number(pred.confidence)||0];
        if(Number(candidate[1])>=minConfidence){finalLabel=candidate[0];finalConfidence=Number(candidate[1]);method=provider==='neural'?'joint-neural':'joint-neural+heuristic';accepted++;}
        else if(provider==='neural'){finalLabel='Unclassified';finalConfidence=Number(candidate[1])||0;method='joint-neural-low-confidence';}
      }
      const structural=sec.structuralLabel||String(sec.label||'').split(' · ').pop()||`Sección ${index+1}`;
      return {...sec,structuralLabel:structural,semanticHeuristicLabel:heuristicLabel,semanticHeuristicConfidence:heuristicConfidence,semanticNeuralLabel:pred.label,semanticNeuralConfidence:Number(pred.confidence)||0,semanticNeuralScores:neuralScores,semanticLabel:finalLabel,semanticConfidence:Number(finalConfidence.toFixed(3)),semanticMethod:method,label:finalLabel!=='Unclassified'?`${finalLabel} · ${structural}`:structural};
    });
    if(Array.isArray(result.segments))result.segments=result.segments.map(seg=>{const mid=(Number(seg.start)+Number(seg.end))/2,sec=result.sections.find(s=>mid>=s.start&&mid<s.end);return sec?{...seg,section:{id:sec.id,label:sec.label,semanticLabel:sec.semanticLabel,semanticConfidence:sec.semanticConfidence,occurrence:sec.occurrence||null,repeated:!!sec.repeated,similarity:sec.similarity??null}}:seg;});
    result.semanticSectionProvider={requested:provider,resolved:'joint-multitask',model:joint.modelName||null,neuralWeight,minConfidence,neuralAccepted:accepted,total:result.sections.length};
    result.structureJointProvider={requested:String(cfg.structureJointProvider||'auto'),resolved:joint.provider||'joint-onnx',model:joint.modelName||null,boundaryCandidates:Array.isArray(joint.boundaries)?joint.boundaries.length:0,semanticWindows:Array.isArray(joint.semanticCurve)?joint.semanticCurve.length:0,sequenceContext:joint.sequenceContext||null,repeatContext:joint.repeatContext||null};
    if(result.decoderDiagnostics?.sectionStructureRuntime)result.decoderDiagnostics.sectionStructureRuntime.jointNeural={available:true,provider:joint.provider||'joint-onnx',model:joint.modelName||null,accepted,total:result.sections.length};
    return result;
  }

  async function fetchNeuralStructureBoundaries(file, tuning = null, options = {}) {
    if (!file || (file.type && file.type.startsWith('video/'))) return null;
    const cfg=tuning||loadEngineTuning();
    const provider=String(cfg.structureBoundaryProvider||'ensemble').toLowerCase();
    if(provider==='heuristic'||provider==='off')return null;
    let health; try{health=await fetchStemServiceHealth();}catch(_){return null;}
    if(!health.structureBoundaryNeuralAvailable)return null;
    if(options.status!==false)setStatus(`Detectando fronteras estructurales con ${health.structureBoundaryProvider||'modelo neuronal'}…`);
    const form=new FormData(); form.append('file',file,file.name||'audio.wav');
    form.append('threshold',String(Math.max(.20,Math.min(.95,Number(cfg.structureBoundaryMinConfidence??.55)))));
    const r=await fetch('/api/v1/structure/boundaries',{method:'POST',body:form});
    let payload=null;try{payload=await r.json();}catch(_){}
    if(!r.ok)throw new Error(payload?.detail||`Detector neuronal de fronteras falló (${r.status}).`);
    return payload;
  }

  function applyNeuralStructureBoundaries(result, neural, tuning = null) {
    if(!result||!Array.isArray(result.sections)||result.sections.length<1||!Array.isArray(neural?.boundaries))return result;
    const cfg=tuning||loadEngineTuning();
    const provider=String(cfg.structureBoundaryProvider||'ensemble').toLowerCase();
    if(provider==='heuristic'||provider==='off')return result;
    const nw=Math.max(0,Math.min(1,Number(cfg.structureBoundaryNeuralWeight??.78)));
    const minConf=Math.max(.20,Math.min(.95,Number(cfg.structureBoundaryMinConfidence??.55)));
    const strong=Math.max(minConf,Math.min(.99,Number(cfg.structureBoundaryStrongConfidence??.72)));
    const maxOffset=Math.max(.20,Math.min(4,Number(cfg.structureBoundaryMaxOffset??1.5)));
    const minDur=Math.max(1.5,Math.min(16,Number(cfg.structureBoundaryMinSectionDuration??4.0)));
    const old=[...result.sections].sort((a,b)=>Number(a.start)-Number(b.start));
    if(!Array.isArray(result.heuristicSectionsBeforeNeuralBoundary)) result.heuristicSectionsBeforeNeuralBoundary=old.map(x=>({...x}));
    const duration=Number(result.duration)||Number(neural.duration)||Number(old.at(-1)?.end)||0;
    if(!(duration>0))return result;
    const cand=neural.boundaries.map(b=>({time:Number(b.time),confidence:Number(b.confidence)||0})).filter(b=>Number.isFinite(b.time)&&b.time>0&&b.time<duration&&b.confidence>=minConf).sort((a,b)=>a.time-b.time);
    const used=new Set(); const refined=[0]; let snapped=0,added=0;
    if(provider==='neural'){
      // Pure neural mode: derive internal boundaries from neural peaks only.
      for(const c of [...cand].sort((a,b)=>b.confidence-a.confidence)){
        const t=c.time; const pts=[...refined,duration].sort((a,b)=>a-b); let left=0,right=duration;
        for(let k=0;k<pts.length-1;k++)if(t>pts[k]&&t<pts[k+1]){left=pts[k];right=pts[k+1];break;}
        if(t-left>=minDur&&right-t>=minDur){refined.push(t);added++;}
      }
    } else {
      for(let i=1;i<old.length;i++){
        const t=Number(old[i].start)||0;
        let best=-1,dist=Infinity;
        for(let j=0;j<cand.length;j++){
          if(used.has(j))continue; const d=Math.abs(cand[j].time-t);
          if(d<dist&&d<=maxOffset){dist=d;best=j;}
        }
        if(best>=0){
          used.add(best); const c=cand[best]; const w=nw*Math.max(.35,c.confidence); refined.push(t*(1-w)+c.time*w); snapped++;
        }else refined.push(t);
      }
      // Strong unmatched neural boundaries may split a section, but only with a safe duration margin.
      for(let j=0;j<cand.length;j++){
        if(used.has(j)||cand[j].confidence<strong)continue;
        const t=cand[j].time; const pts=[...refined,duration].sort((a,b)=>a-b); let left=0,right=duration;
        for(let k=0;k<pts.length-1;k++)if(t>pts[k]&&t<pts[k+1]){left=pts[k];right=pts[k+1];break;}
        if(t-left>=minDur&&right-t>=minDur){refined.push(t);added++;}
      }
    }
    const pts=[...new Set(refined.map(x=>Math.max(0,Math.min(duration,Math.round(x*1000)/1000))))].sort((a,b)=>a-b); if(pts[0]!==0)pts.unshift(0); if(pts.at(-1)!==duration)pts.push(duration);
    const sections=[];
    for(let i=0;i<pts.length-1;i++){
      const start=pts[i],end=pts[i+1]; if(end-start<.25)continue; const mid=(start+end)/2;
      let base=old.find(o=>mid>=Number(o.start)&&mid<Number(o.end)); if(!base)base=old.reduce((best,o)=>Math.abs(((Number(o.start)+Number(o.end))/2)-mid)<Math.abs(((Number(best.start)+Number(best.end))/2)-mid)?o:best,old[0]);
      const isInserted=!old.some(o=>Math.abs(Number(o.start)-start)<.02);
      const structural=isInserted?`Sección N${i+1}`:(base.structuralLabel||String(base.label||`Sección ${i+1}`).split(' · ').pop());
      sections.push({...base,id:`section-${i+1}`,start,end,structuralLabel:structural,label:structural,semanticLabel:base.semanticLabel||'Unclassified',semanticConfidence:Number(base.semanticConfidence)||0,neuralBoundaryStart:i>0?cand.reduce((best,c)=>Math.abs(c.time-start)<Math.abs((best?.time??1e9)-start)?c:best,null):null});
    }
    result.sections=sections;
    result.structureBoundaryProvider={requested:provider,resolved:neural.provider||'onnx',model:neural.modelName||null,threshold:minConf,strongThreshold:strong,neuralWeight:nw,snapped,added,candidates:cand.length};
    if(result.decoderDiagnostics?.sectionStructureRuntime)result.decoderDiagnostics.sectionStructureRuntime.neuralBoundaries={available:true,provider:neural.provider||'onnx',model:neural.modelName||null,snapped,added,candidates:cand.length,curvePoints:Array.isArray(neural.curve)?neural.curve.length:0};
    return result;
  }

  async function fetchNeuralStructure(file, result, tuning = null, options = {}) {
    if (!file || !Array.isArray(result?.sections) || !result.sections.length) return null;
    if (file.type && file.type.startsWith('video/')) return null;
    let health;
    try { health = await fetchStemServiceHealth(); } catch (_) { return null; }
    if (!health.structureNeuralAvailable) return null;
    if (options.status !== false) setStatus(`Clasificando secciones con ${health.structureProvider || 'modelo neuronal'}…`);
    const payloadSections = result.sections.map((s, index) => ({index,start:Number(s.start)||0,end:Number(s.end)||0,structuralLabel:s.structuralLabel||s.label||null}));
    const form = new FormData();
    form.append('file', file, file.name || 'audio.wav');
    form.append('sections_json', JSON.stringify(payloadSections));
    const r = await fetch('/api/v1/structure', {method:'POST', body:form});
    let payload=null; try{payload=await r.json();}catch(_){}
    if(!r.ok) throw new Error(payload?.detail || `Clasificador neuronal de estructura falló (${r.status}).`);
    return payload;
  }

  function applyNeuralStructurePredictions(result, neural, tuning = null) {
    if (!result || !Array.isArray(result.sections) || !Array.isArray(neural?.sections)) return result;
    const cfg=tuning||loadEngineTuning();
    const provider=String(cfg.structureSemanticProvider||'ensemble').toLowerCase();
    const neuralWeight=Math.max(0,Math.min(1,Number(cfg.structureNeuralWeight ?? 0.76)));
    const minConfidence=Math.max(0.20,Math.min(0.95,Number(cfg.structureNeuralMinConfidence ?? 0.46)));
    const labels=['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Outro'];
    const byIndex=new Map(neural.sections.map(x=>[Number(x.index),x]));
    let neuralAccepted=0, ensembleAccepted=0;
    result.sections=result.sections.map((sec,index)=>{
      const pred=byIndex.get(index); if(!pred)return sec;
      const heuristicLabel=sec.semanticLabel||'Unclassified';
      const heuristicConfidence=Number(sec.semanticConfidence)||0;
      const heuristicScores=sec.semanticScores||{};
      const neuralScores=pred.probabilities||{};
      const combined={};
      for(const label of labels){
        const np=Number(neuralScores[label])||0;
        const hp=Number(heuristicScores[label])||0;
        combined[label]=provider==='neural'?np:(provider==='hybrid'||provider==='ensemble'||provider==='auto'?neuralWeight*np+(1-neuralWeight)*hp:hp);
      }
      let finalLabel=heuristicLabel,finalConfidence=heuristicConfidence,method='hybrid-heuristic';
      if(provider!=='heuristic'){
        const ranked=Object.entries(combined).sort((a,b)=>b[1]-a[1]);
        const candidate=ranked[0]||[pred.label,Number(pred.confidence)||0];
        const candidateConf=Number(candidate[1])||0;
        if(candidateConf>=minConfidence){ finalLabel=candidate[0]; finalConfidence=candidateConf; method=provider==='neural'?'neural-onnx':'neural+heuristic-ensemble'; neuralAccepted++; if(provider!=='neural')ensembleAccepted++; }
        else if(provider==='neural'){ finalLabel='Unclassified'; finalConfidence=candidateConf; method='neural-onnx-low-confidence'; }
      }
      const structural=sec.structuralLabel||String(sec.label||'').split(' · ').pop()||'Sección';
      return {...sec,
        structuralLabel:structural,
        semanticHeuristicLabel:heuristicLabel,
        semanticHeuristicConfidence:heuristicConfidence,
        semanticNeuralLabel:pred.label,
        semanticNeuralConfidence:Number(pred.confidence)||0,
        semanticNeuralScores:neuralScores,
        semanticLabel:finalLabel,
        semanticConfidence:Number(finalConfidence.toFixed(3)),
        semanticMethod:method,
        label:finalLabel!=='Unclassified'?`${finalLabel} · ${structural}`:structural
      };
    });
    if(Array.isArray(result.segments)){
      result.segments=result.segments.map(seg=>{
        const mid=(Number(seg.start)+Number(seg.end))/2; const sec=result.sections.find(s=>mid>=s.start&&mid<s.end);
        if(!sec)return seg;
        return {...seg,section:{id:sec.id,label:sec.label,semanticLabel:sec.semanticLabel,semanticConfidence:sec.semanticConfidence,occurrence:sec.occurrence||null,repeated:!!sec.repeated,similarity:sec.similarity??null}};
      });
    }
    result.semanticSectionProvider={requested:provider,resolved:provider==='heuristic'?'heuristic':(neuralAccepted?'neural-ensemble':'heuristic-fallback'),model:neural.modelName||null,neuralWeight,minConfidence,neuralAccepted,ensembleAccepted,total:result.sections.length};
    if(result.decoderDiagnostics?.sectionStructureRuntime){
      result.decoderDiagnostics.sectionStructureRuntime.semanticNeural={available:true,provider:neural.provider||'onnx',model:neural.modelName||null,requested:provider,neuralWeight,minConfidence,accepted:neuralAccepted,total:result.sections.length};
    }
    return result;
  }

  async function enrichResultWithNeuralStructure(file, result, tuning = null, options = {}) {
    const cfg=tuning||loadEngineTuning();
    const jointMode=String(cfg.structureJointProvider||'auto').toLowerCase();
    if(!['separate','off','heuristic'].includes(jointMode)){
      try{
        const joint=await fetchNeuralStructureJoint(file,result,cfg,options);
        if(joint){
          // Shared encoder predicts both tasks. Keep heuristic boundaries as a conservative ensemble unless user requests pure joint.
          const boundaryCfg={...cfg,structureBoundaryProvider:jointMode==='joint'?'neural':(String(cfg.structureBoundaryProvider||'ensemble').toLowerCase()==='heuristic'?'heuristic':'ensemble')};
          result=applyNeuralStructureBoundaries(result,joint,boundaryCfg);
          result=applyJointStructurePredictions(result,joint,cfg);
          return result;
        }
      }catch(e){console.warn('Joint neural structure fallback',e);}
    }
    try {
      const boundaries=await fetchNeuralStructureBoundaries(file,cfg,options);
      if(boundaries) result=applyNeuralStructureBoundaries(result,boundaries,cfg);
    } catch(e) { console.warn('Neural structure boundary fallback',e); }
    try {
      const neural=await fetchNeuralStructure(file,result,cfg,options);
      if(neural) result=applyNeuralStructurePredictions(result,neural,cfg);
    } catch(e) { console.warn('Neural structure semantic fallback',e); }
    return result;
  }

  async function decodeAudioUrl(url) {
    const r = await fetch(url, {cache:'no-store'});
    if (!r.ok) throw new Error(`No se pudo descargar ${url} (${r.status}).`);
    const ab = await r.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const b = await ctx.decodeAudioData(ab.slice(0));
      return {samples:b.numberOfChannels>1?mixToMono(b):new Float32Array(b.getChannelData(0)),sampleRate:b.sampleRate,duration:b.duration};
    } finally { try{await ctx.close();}catch(_){} }
  }

  async function releaseStemJob(jobId) {
    if (!jobId) return;
    try { await fetch(`/api/v1/jobs/${encodeURIComponent(jobId)}`, {method:'DELETE'}); } catch (_) {}
  }

  async function handleAutomaticStemAnalysis(file) {
    if (!file) return;
    autoStemBtn.disabled = true;
    $('resultsCard').style.display='none';
    let jobId = null;
    try {
      setStatus('Comprobando backend de separación…');
      const health = await fetchStemServiceHealth();
      if (!health.demucsAvailable) throw new Error('El backend está activo, pero Demucs no está instalado. Revisa server/README.md.');

      setStatus(`Separando stems con ${health.model || 'Demucs'} (${health.device || 'auto'})…`);
      const form = new FormData();
      form.append('file', file, file.name);
      const response = await fetch('/api/v1/separate', {method:'POST', body:form});
      let payload = null;
      try { payload = await response.json(); } catch (_) {}
      if (!response.ok) throw new Error(payload?.detail || `Separación falló (${response.status}).`);
      jobId = payload.jobId;
      activeStemJobId = jobId;

      setStatus('Decodificando MIX original…');
      const mix = await decodeAudioFile(file);
      const targetLength = mix.samples.length;
      const streams = {mix:mix.samples};
      const stemFiles = {mix:file.name};
      for (const role of ['other','bass','drums','vocals']) {
        const url = payload.stems?.[role];
        if (!url) continue;
        setStatus(`Descargando y decodificando ${role.toUpperCase()}…`);
        const d = await decodeAudioUrl(url);
        streams[role] = resampleMono(d.samples, d.sampleRate, mix.sampleRate, targetLength);
        stemFiles[role] = `${role}.wav`;
      }
      if (!streams.other && !streams.bass && !streams.drums) throw new Error('El separador no devolvió stems utilizables.');

      const tuning = loadEngineTuning();
      let rhythmAnalysis = null, chordAnalysis = null, noteAnalysis = null;
      try { rhythmAnalysis = await fetchNeuralRhythm(file, tuning); } catch (e) { console.warn('Rhythm neural fallback', e); }
      try { chordAnalysis = await fetchNeuralChords(file, tuning); } catch (e) { console.warn('BTC chord fallback', e); }
      try { noteAnalysis = await fetchNeuralNotes(file, tuning); } catch (e) { console.warn('Multi-pitch fallback', e); }
      setStatus('Fusionando stems, notas transcritas, armonía, bajo y ritmo…');
      let result = await workerRequest('analyzeMultiStream', {
        streams,
        sampleRate:mix.sampleRate,
        duration:mix.duration,
        tuning,
        rhythmAnalysis,
        chordAnalysis,
        noteAnalysis
      }, [], 300000);
      result = await enrichResultWithNeuralStructure(file,result,tuning);
      currentFile=file; isVideoFile=false; result.song=file.name; result.isVideo=false;
      result.stemFiles=stemFiles;
      result.stemSeparation={automatic:true,separator:'demucs',model:payload.model,device:payload.device,jobId};
      analysisResult=result; loopSegment=null; setupPlayer(file); displayResults(); setStatus('');
      $('resultsCard').style.display='block'; $('resultsCard').scrollIntoView({behavior:'smooth',block:'start'});
      const active=Object.keys(result.decoderDiagnostics?.streams||{}).filter(k=>result.decoderDiagnostics.streams[k]);
      showToast(`Stems automáticos v62 listos: ${active.join(' + ').toUpperCase()}.`);
    } catch(err) {
      console.error(err); setStatus(''); showToast('Error en separación automática: '+(err.message||err));
    } finally {
      if (jobId) await releaseStemJob(jobId);
      if (activeStemJobId === jobId) activeStemJobId = null;
      autoStemBtn.disabled = false;
    }
  }

  autoStemBtn?.addEventListener('click', async()=>{
    try {
      const health = await fetchStemServiceHealth();
      if (!health.demucsAvailable) { showToast('Backend activo, pero Demucs no está instalado.'); return; }
      autoStemInput.value=''; autoStemInput.click();
    } catch (_) {
      showToast('Para separación automática inicia ChordSync con: python server/start.py');
    }
  });
  autoStemInput?.addEventListener('change',()=>{if(autoStemInput.files?.length)handleAutomaticStemAnalysis(autoStemInput.files[0]);});

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
      const tuning = loadEngineTuning();
      let rhythmAnalysis = null, chordAnalysis = null, noteAnalysis = null;
      try { rhythmAnalysis = await fetchNeuralRhythm(file, tuning); } catch (e) { console.warn('Proveedor neural de ritmo no disponible', e); }
      try { chordAnalysis = await fetchNeuralChords(file, tuning); } catch (e) { console.warn('Proveedor BTC de acordes no disponible', e); }
      try { noteAnalysis = await fetchNeuralNotes(file, tuning); } catch (e) { console.warn('Proveedor multi-pitch no disponible', e); }
      setStatus('Analizando tonalidad, acordes, notas, tempo y estructura rítmica…');

      let result = await workerRequest('analyzeFile', {
        samples: monoData,
        sampleRate: audioBuffer.sampleRate,
        duration: audioBuffer.duration,
        tuning,
        rhythmAnalysis,
        chordAnalysis,
        noteAnalysis,
      }, [], 300000); // tope de 3 minutos: si se excede, se cancela y se avisa en vez de colgarse

      result = await enrichResultWithNeuralStructure(file,result,tuning);
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

  function chordForDisplay(seg) {
    if (!seg) return 'N';
    if (chordDisplayLevel === 'easy') return seg.chord_easy || seg.chord_simple_pop || seg.chord;
    if (chordDisplayLevel === 'advanced') return seg.chord_advanced || seg.chord_complex_pop || seg.detectedChord || seg.chord;
    return seg.chord_medium || seg.chord_basic_pop || seg.chord;
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
      const displayChordRaw = chordForDisplay(seg);
      const activeKey = seg.localKey?.key || analysisResult.key;
      const label = showNashville
        ? chordToNashville(displayChordRaw, activeKey)
        : displayChordForKey(displayChordRaw, activeKey);
      $('currentChordName').textContent = label;
      const conf = Math.round((seg.confidence || 0) * 100);
      $('confidenceFill').style.width = conf + '%';
      if (displayChordRaw !== lastDiagramChord) {
        const guitarSvg = renderGuitarDiagramSVG(displayChordRaw);
        const ukuleleSvg = renderUkuleleDiagramSVG(displayChordRaw);
        $('guitarDiagram').innerHTML = guitarSvg || '<div class="diagram-unavailable">Digitación no incluida todavía para esta extensión.</div>';
        $('ukuleleDiagram').innerHTML = ukuleleSvg || '<div class="diagram-unavailable">Digitación no incluida todavía para esta extensión.</div>';
        $('pianoDiagram').innerHTML = renderPianoDiagramSVG(displayChordRaw);
        lastDiagramChord = displayChordRaw;
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
    const rel = analysisResult.relativeKey;
    const relText = rel && rel.key
      ? `<span class="value small-note">relativa: ${rel.key} ${rel.scale === 'major' ? 'Mayor' : 'Menor'} · ${Math.round((rel.confidence || 0) * 100)}%</span>`
      : '';
    const modCount = Array.isArray(analysisResult.modulations) ? analysisResult.modulations.length : 0;
    const modText = modCount ? `<span class="value small-note">${modCount} modulación${modCount===1?'':'es'} detectada${modCount===1?'':'s'}</span>` : '';
    $('keyValue').innerHTML = (analysisResult.key || '—') + relText + modText;
    $('scaleValue').textContent = analysisResult.scale === 'major' ? 'Mayor' : (analysisResult.scale === 'minor' ? 'Menor' : '—');
    $('bpmValue').textContent = analysisResult.bpm !== null && analysisResult.bpm !== undefined ? analysisResult.bpm : '—';
    const meterVal = analysisResult.meter;
    const db = analysisResult.decoderDiagnostics?.downbeatMeter;
    const meterNote = db ? `downbeat ${Math.round((db.confidence || 0) * 100)}%${db.fallback ? ' · conservador' : ''}` : 'estimado';
    document.getElementById('meterValue').innerHTML = (meterVal !== null && meterVal !== undefined ? meterVal + '/4' : '—') + `<span class="value small-note">${meterNote}</span>`;
    $('strengthValue').textContent = analysisResult.strength !== null && analysisResult.strength !== undefined ? analysisResult.strength : '—';
    $('durationValue').textContent = formatTime(analysisResult.duration);
    const sectionCount = Array.isArray(analysisResult.sections) ? analysisResult.sections.length : 0;
    const repeatGroups = Array.isArray(analysisResult.sectionGroups) ? analysisResult.sectionGroups.length : 0;
    const semanticCount = Array.isArray(analysisResult.sections) ? analysisResult.sections.filter(s=>s.semanticLabel && s.semanticLabel !== 'Unclassified').length : 0;
    $('chordCountValue').innerHTML = String(analysisResult.totalChords ?? '—') + (sectionCount ? `<span class="value small-note">${sectionCount} secciones · ${semanticCount} semánticas · ${repeatGroups} grupos repetidos</span>` : '');
    syncAnalysisCorrectionControls();

    buildBeatGrid();
    buildTimeline();
    lastDiagramChord = null;
    updateDisplay(0);
  }

  function buildBeatGrid() {
    const beatGrid = $('beatGrid');
    beatGrid.innerHTML = '';
    if (!analysisResult) return;
    const meter = analysisResult.meter || 4;
    // La UI muestra una ventana de cuatro compases; el índice activo se obtiene del beatMap real.
    const totalBeats = Math.min(meter * 4, 16);
    for (let i = 0; i < totalBeats; i++) {
      const dot = document.createElement('div');
      dot.className = 'beat-dot' + (i % meter === 0 ? ' downbeat' : '');
      dot.dataset.beatSlot = String(i);
      beatGrid.appendChild(dot);
    }
  }
  function updateBeatGrid(currentTime) {
    if (!analysisResult) return;
    const beats = Array.isArray(analysisResult.beats) ? analysisResult.beats : [];
    const meter = analysisResult.meter || 4;
    let activeSlot = -1;

    if (beats.length) {
      // Último beat cuyo timestamp ya fue alcanzado. Esto elimina el desfase de asumir que beat 1 = t=0.
      let lo = 0, hi = beats.length - 1, idx = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const t = Number(beats[mid].time ?? beats[mid].curr_beat_time ?? 0);
        if (t <= currentTime + 1e-3) { idx = mid; lo = mid + 1; }
        else hi = mid - 1;
      }
      if (idx >= 0) {
        const b = beats[idx] || {};
        const total = Math.min(meter * 4, 16);
        const beatNum = Number(b.beat_num);
        const barNum = Number(b.bar_num);
        if (Number.isFinite(beatNum) && beatNum >= 1) {
          const barOffset = Number.isFinite(barNum) && barNum > 0 ? ((barNum - 1) % 4) * meter : 0;
          activeSlot = (barOffset + beatNum - 1) % total;
        } else activeSlot = idx % total;
      }
    } else if (analysisResult.bpm) {
      const beatDuration = 60 / analysisResult.bpm;
      activeSlot = Math.floor(currentTime / beatDuration) % Math.min(meter * 4, 16);
    }

    document.querySelectorAll('.beat-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeSlot);
    });
  }

  const MIN_SEGMENT_DURATION = 0.15; // segundos — duración mínima permitida al editar a mano

  function sortSegments() {
    analysisResult.segments.sort((a, b) => a.start - b.start);
  }
  function recomputeChordCount() {
    analysisResult.totalChords = new Set(analysisResult.segments.map((s) => s.chord)).size;
    const sectionCount = Array.isArray(analysisResult.sections) ? analysisResult.sections.length : 0;
    const repeatGroups = Array.isArray(analysisResult.sectionGroups) ? analysisResult.sectionGroups.length : 0;
    const semanticCount = Array.isArray(analysisResult.sections) ? analysisResult.sections.filter(s=>s.semanticLabel && s.semanticLabel !== 'Unclassified').length : 0;
    $('chordCountValue').innerHTML = String(analysisResult.totalChords) + (sectionCount ? `<span class="value small-note">${sectionCount} secciones · ${semanticCount} semánticas · ${repeatGroups} grupos repetidos</span>` : '');
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

    // v62: semantic section markers built from structural repetition + acoustic features.
    if (Array.isArray(analysisResult.sections)) {
      analysisResult.sections.forEach((sec) => {
        const marker = document.createElement('div');
        marker.className = 'section-structure-marker';
        marker.textContent = sec.label || sec.id || 'Sección';
        marker.title = `${marker.textContent} · ${formatTime(sec.start)}–${formatTime(sec.end)}${sec.semanticConfidence != null ? ` · semántica ${Math.round(sec.semanticConfidence*100)}%` : ''}${sec.repeated ? ` · similitud ${Math.round((sec.similarity || sec.groupSimilarity || 0) * 100)}%` : ''}`;
        marker.style.position = 'absolute';
        marker.style.left = Math.max(0, sec.start / totalDuration * trackWidth) + 'px';
        marker.style.top = '2px';
        marker.style.zIndex = '5';
        marker.style.fontSize = '10px';
        marker.style.opacity = sec.repeated ? '0.9' : '0.55';
        marker.style.pointerEvents = 'none';
        track.appendChild(marker);
      });
    }

    segs.forEach((seg, idx) => {
      const el = document.createElement('div');
      el.className = 'chord-segment' + (seg.corrected ? ' corrected' : '');
      el.dataset.index = idx;
      const displayChordRaw = chordForDisplay(seg);
      const activeKey = seg.localKey?.key || analysisResult.key;
      const label = showNashville
        ? chordToNashville(displayChordRaw, activeKey)
        : displayChordForKey(displayChordRaw, activeKey);
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
      const displayChord = displayChordForKey(chordForDisplay(seg), seg.localKey?.key || analysisResult.key);
      const keyTip = seg.localKey?.key ? ` · key local ${seg.localKey.key} ${seg.localKey.scale === 'minor' ? 'menor' : 'mayor'}` : '';
      const sectionTip = seg.section?.label ? ` · ${seg.section.label}${seg.section.repeated ? ' (repetida)' : ''}` : '';
      const repeatTip = seg.repeatEvidence?.action ? ` · consenso: ${seg.repeatEvidence.action}` : '';
      el.title = `${displayChord} (${formatTime(seg.start)} - ${formatTime(seg.end)})${keyTip}${sectionTip}${repeatTip} — arrastra los bordes para ajustar la duración`;

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
    analysisResult.relativeKey = null;
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


  // ---------- Evaluación contra ground truth (.lab/.txt) ----------
  (function initGroundTruthEvaluator() {
    const exportRow = document.querySelector('.export-row');
    if (!exportRow || !window.ChordSyncEvaluator) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lab,.txt,text/plain';
    input.style.display = 'none';
    input.id = 'groundTruthInput';

    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.id = 'groundTruthBtn';
    btn.textContent = '🧪 Evaluar .lab';
    btn.title = 'Compara el análisis actual contra acordes anotados manualmente';

    const report = document.createElement('div');
    report.id = 'groundTruthReport';
    report.style.cssText = 'width:100%;margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:10px;display:none;white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:12px;line-height:1.5;';

    exportRow.appendChild(btn);
    exportRow.appendChild(input);
    exportRow.parentNode.insertBefore(report, exportRow.nextSibling);

    btn.addEventListener('click', () => {
      if (!analysisResult) { showToast('Analiza una canción antes de cargar el ground truth.'); return; }
      input.value = '';
      input.click();
    });

    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file || !analysisResult) return;
      try {
        const text = await file.text();
        const evaluation = window.ChordSyncEvaluator.evaluateAnalysis(analysisResult, text, { boundaryTolerance: 0.25 });
        analysisResult.evaluation = evaluation;
        const pct = x => `${(100 * Number(x || 0)).toFixed(1)}%`;
        const lines = [
          `Ground truth: ${file.name}`,
          `CSR acordes (familia básica): ${pct(evaluation.chordSymbolRecall)}`,
          `Recall de raíz: ${pct(evaluation.rootRecall)}`,
          `Componentes jerárquicos:`,
          `  root: ${evaluation.components?.root?.accuracy == null ? '—' : pct(evaluation.components.root.accuracy)}`,
          `  triad: ${evaluation.components?.triad?.accuracy == null ? '—' : pct(evaluation.components.triad.accuracy)}`,
          `  seventh: ${evaluation.components?.seventh?.accuracy == null ? '—' : pct(evaluation.components.seventh.accuracy)}`,
          `  extension: ${evaluation.components?.extension?.accuracy == null ? '—' : pct(evaluation.components.extension.accuracy)}`,
          `  alterations: ${evaluation.components?.alterations?.accuracy == null ? '—' : pct(evaluation.components.alterations.accuracy)}`,
          `  inversion F1: ${evaluation.components?.inversion?.f1 == null ? '—' : pct(evaluation.components.inversion.f1)}`,
          `  bass exacto en inversiones: ${evaluation.components?.inversion?.bassAccuracy == null ? '—' : pct(evaluation.components.inversion.bassAccuracy)}`,
          `Boundary F1 (±${evaluation.boundary.tolerance}s): ${pct(evaluation.boundary.f1)}`,
          `  precisión: ${pct(evaluation.boundary.precision)} · recall: ${pct(evaluation.boundary.recall)}`,
          `  error medio de frontera: ${evaluation.boundary.meanAbsoluteError == null ? '—' : evaluation.boundary.meanAbsoluteError.toFixed(3) + ' s'}`,
          `Segmentos: pred ${evaluation.predictedSegments} · verdad ${evaluation.truthSegments}`
        ];
        if (evaluation.key) lines.push(`Tonalidad: ${evaluation.key.correct ? '✓' : '✗'} (verdad: ${evaluation.key.truth})`);
        if (evaluation.bpm) lines.push(`BPM: error ${evaluation.bpm.absoluteError.toFixed(2)} BPM`);
        report.textContent = lines.join('\n');
        report.style.display = 'block';
        showToast('Evaluación objetiva completada.');
      } catch (err) {
        report.textContent = 'Error de evaluación: ' + (err.message || String(err));
        report.style.display = 'block';
        showToast('No se pudo evaluar el archivo .lab.');
      }
    });
  })();


  // ---------- Evaluación de estructura semántica (.sections) — v62: híbrido vs neural ----------
  (function initStructureEvaluator() {
    const exportRow = document.querySelector('.export-row');
    if (!exportRow || !window.ChordSyncStructureEvaluator) return;
    const input=document.createElement('input'); input.type='file'; input.accept='.sections,.txt,text/plain'; input.style.display='none'; input.id='structureGroundTruthInput';
    const jointSelect=document.createElement('select'); jointSelect.id='structureJointProvider'; jointSelect.className='btn-ghost'; jointSelect.title='Motor conjunto v62 para fronteras + etiquetas'; jointSelect.style.cssText='min-height:38px;padding:0 10px;';
    jointSelect.innerHTML='<option value="auto">🧬 Joint: Auto</option><option value="joint">🧬 Joint: Solo conjunto</option><option value="separate">🧠 Joint: Redes separadas</option><option value="off">🧩 Joint: Desactivado</option>';
    const savedJointProvider=String(loadEngineTuning().structureJointProvider||'auto').toLowerCase(); if([...jointSelect.options].some(o=>o.value===savedJointProvider))jointSelect.value=savedJointProvider;
    jointSelect.addEventListener('change',()=>{saveEngineTuning({...loadEngineTuning(),structureJointProvider:jointSelect.value});showToast(`Motor conjunto de estructura: ${jointSelect.options[jointSelect.selectedIndex].textContent.replace(/^🧬 |^🧠 |^🧩 /,'')}`);});
    const sequenceSelect=document.createElement('select'); sequenceSelect.id='structureSequenceContext'; sequenceSelect.className='btn-ghost'; sequenceSelect.title='Prior suave entre secciones consecutivas, aprendido solo con TRAIN'; sequenceSelect.style.cssText='min-height:38px;padding:0 10px;';
    sequenceSelect.innerHTML='<option value="0.28">🔗 Secuencia: Auto</option><option value="0.14">🔗 Secuencia: Suave</option><option value="0">⛓ Secuencia: Off</option>';
    const savedSeq=Number(loadEngineTuning().structureSequenceContextWeight??.28); const seqOpt=[...sequenceSelect.options].reduce((best,o)=>Math.abs(Number(o.value)-savedSeq)<Math.abs(Number(best.value)-savedSeq)?o:best,sequenceSelect.options[0]); sequenceSelect.value=seqOpt.value;
    sequenceSelect.addEventListener('change',()=>{saveEngineTuning({...loadEngineTuning(),structureSequenceContextWeight:Number(sequenceSelect.value)});showToast(`Contexto entre secciones: ${sequenceSelect.options[sequenceSelect.selectedIndex].textContent.replace(/^🔗 |^⛓ /,'')}`);});
    const repeatSelect=document.createElement('select'); repeatSelect.id='structureRepeatContext'; repeatSelect.className='btn-ghost'; repeatSelect.title='Consenso multimodal: textura + acordes + ritmo + energía + perfil vocal/harmónico'; repeatSelect.style.cssText='min-height:38px;padding:0 10px;';
    repeatSelect.innerHTML='<option value="0.26">🔁 Repetición: Auto</option><option value="0.13">🔁 Repetición: Suave</option><option value="0">🚫 Repetición: Off</option>';
    const savedRepeat=Number(loadEngineTuning().structureRepeatContextWeight??.26); const repOpt=[...repeatSelect.options].reduce((best,o)=>Math.abs(Number(o.value)-savedRepeat)<Math.abs(Number(best.value)-savedRepeat)?o:best,repeatSelect.options[0]); repeatSelect.value=repOpt.value;
    repeatSelect.addEventListener('change',()=>{saveEngineTuning({...loadEngineTuning(),structureRepeatContextWeight:Number(repeatSelect.value)});showToast(`Contexto por repetición: ${repeatSelect.options[repeatSelect.selectedIndex].textContent.replace(/^🔁 |^🚫 /,'')}`);});
    const providerSelect=document.createElement('select'); providerSelect.id='structureSemanticProvider'; providerSelect.className='btn-ghost'; providerSelect.title='Proveedor semántico de secciones para próximos análisis'; providerSelect.style.cssText='min-height:38px;padding:0 10px;';
    providerSelect.innerHTML='<option value="ensemble">🧠 Estructura: Neural + heurística</option><option value="neural">🧠 Estructura: Neural</option><option value="heuristic">🧩 Estructura: Heurística</option>';
    const savedStructureProvider=String(loadEngineTuning().structureSemanticProvider||'ensemble').toLowerCase(); if([...providerSelect.options].some(o=>o.value===savedStructureProvider))providerSelect.value=savedStructureProvider;
    providerSelect.addEventListener('change',()=>{saveEngineTuning({...loadEngineTuning(),structureSemanticProvider:providerSelect.value});showToast(`Proveedor de estructura: ${providerSelect.options[providerSelect.selectedIndex].textContent.replace(/^🧠 |^🧩 /,'')}`);});
    const boundarySelect=document.createElement('select'); boundarySelect.id='structureBoundaryProvider'; boundarySelect.className='btn-ghost'; boundarySelect.title='Proveedor de fronteras estructurales para próximos análisis'; boundarySelect.style.cssText='min-height:38px;padding:0 10px;';
    boundarySelect.innerHTML='<option value="ensemble">📍 Fronteras: Neural + heurística</option><option value="neural">📍 Fronteras: Neural</option><option value="heuristic">📐 Fronteras: Heurística</option>';
    const savedBoundaryProvider=String(loadEngineTuning().structureBoundaryProvider||'ensemble').toLowerCase(); if([...boundarySelect.options].some(o=>o.value===savedBoundaryProvider))boundarySelect.value=savedBoundaryProvider;
    boundarySelect.addEventListener('change',()=>{saveEngineTuning({...loadEngineTuning(),structureBoundaryProvider:boundarySelect.value});showToast(`Fronteras de estructura: ${boundarySelect.options[boundarySelect.selectedIndex].textContent.replace(/^📍 |^📐 /,'')}`);});
    const btn=document.createElement('button'); btn.className='btn-ghost'; btn.id='structureGroundTruthBtn'; btn.textContent='🏷 Evaluar estructura'; btn.title='Compara Intro/Verse/Pre-Chorus/Chorus/Bridge/Solo/Outro contra un archivo .sections';
    const report=document.createElement('div'); report.id='structureGroundTruthReport'; report.style.cssText='width:100%;margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:10px;display:none;white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:12px;line-height:1.5;';
    exportRow.appendChild(jointSelect); exportRow.appendChild(sequenceSelect); exportRow.appendChild(repeatSelect); exportRow.appendChild(providerSelect); exportRow.appendChild(boundarySelect); exportRow.appendChild(btn); exportRow.appendChild(input); exportRow.parentNode.insertBefore(report, exportRow.nextSibling);
    btn.addEventListener('click',()=>{if(!analysisResult){showToast('Analiza una canción antes de evaluar la estructura.');return;} input.value='';input.click();});
    input.addEventListener('change',async()=>{
      const file=input.files&&input.files[0];if(!file||!analysisResult)return;
      try{
        const truthText=await file.text();
        const ev=window.ChordSyncStructureEvaluator.evaluateStructure(analysisResult,truthText,{boundaryTolerance:1.0});
        analysisResult.structureEvaluation=ev;
        let heuristicEv=null;
        const heuristicSource=Array.isArray(analysisResult.heuristicSectionsBeforeNeuralBoundary)?analysisResult.heuristicSectionsBeforeNeuralBoundary:analysisResult.sections;
        if(Array.isArray(heuristicSource)){
          const heuristicAnalysis={...analysisResult,sections:heuristicSource.map(s=>({...s,semanticLabel:s.semanticHeuristicLabel||s.semanticLabel||'Unclassified',semanticConfidence:Number(s.semanticHeuristicConfidence??s.semanticConfidence)||0,label:((s.semanticHeuristicLabel||s.semanticLabel)&& (s.semanticHeuristicLabel||s.semanticLabel)!=='Unclassified')?`${s.semanticHeuristicLabel||s.semanticLabel} · ${s.structuralLabel||'Sección'}`:(s.structuralLabel||s.label)}))};
          heuristicEv=window.ChordSyncStructureEvaluator.evaluateStructure(heuristicAnalysis,truthText,{boundaryTolerance:1.0});
        }
        const pct=x=>`${(100*Number(x||0)).toFixed(1)}%`;
        const per=ev.semantic?.perLabel||{};
        const labels=['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Outro'];
        const lines=[
          `Estructura ground truth: ${file.name}`,
          `Accuracy semántica (duración): ${pct(ev.semantic.accuracy)}`,
          `Macro-F1: ${pct(ev.semantic.macroF1)}`,
          `Cobertura clasificada: ${pct(ev.semantic.coverage)}`,
          `Boundary F1 (±${ev.boundary.tolerance.toFixed(1)}s): ${pct(ev.boundary.f1)}`,
          `  precisión: ${pct(ev.boundary.precision)} · recall: ${pct(ev.boundary.recall)}`,
          `  error medio: ${ev.boundary.meanAbsoluteError==null?'—':ev.boundary.meanAbsoluteError.toFixed(3)+' s'}`,
          `IoU medio de segmentos: ${pct(ev.segments.meanIoU)}`,
          `Etiqueta correcta en match: ${pct(ev.segments.labelAccuracyOnMatched)}`,
          `Secciones: pred ${ev.predictedSections} · verdad ${ev.truthSections}`,
          `Proveedor: ${analysisResult.semanticSectionProvider?.resolved||'heuristic'}`,
          ...(heuristicEv?[`A/B vs baseline heurístico: accuracy ${pct(heuristicEv.semantic.accuracy)} → ${pct(ev.semantic.accuracy)} (${((ev.semantic.accuracy-heuristicEv.semantic.accuracy)*100).toFixed(1)} pp)`,`A/B macro-F1: ${pct(heuristicEv.semantic.macroF1)} → ${pct(ev.semantic.macroF1)} (${((ev.semantic.macroF1-heuristicEv.semantic.macroF1)*100).toFixed(1)} pp)`]:[]),
          `Por etiqueta:`
        ];
        for(const l of labels){const m=per[l];if(m&&m.support>0)lines.push(`  ${l.padEnd(11)} F1 ${pct(m.f1)} · P ${pct(m.precision)} · R ${pct(m.recall)} · ${(m.support).toFixed(1)}s`);}
        if(ev.semantic.confusions?.length){lines.push('Confusiones dominantes:');for(const c of ev.semantic.confusions.slice(0,6))lines.push(`  ${c.pair}: ${c.seconds.toFixed(1)}s`);}
        report.textContent=lines.join('\n'); report.style.display='block'; showToast('Evaluación de estructura completada.');
      }catch(err){report.textContent='Error de evaluación de estructura: '+(err.message||String(err));report.style.display='block';showToast('No se pudo evaluar el archivo .sections.');}
    });
  })();


  // ---------- Benchmark batch / corpus (v11) ----------
  (function initBatchBenchmark() {
    const exportRow = document.querySelector('.export-row');
    if (!exportRow || !window.ChordSyncEvaluator) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'audio/*,video/*,.mp3,.wav,.wave,.aiff,.aif,.aifc,.m4a,.aac,.ogg,.oga,.opus,.flac,.webm,.mp4,.m4v,.mov,.lab,.txt';
    input.style.display = 'none';
    input.id = 'batchBenchmarkInput';

    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.id = 'batchBenchmarkBtn';
    btn.textContent = '📊 Benchmark lote';
    btn.title = 'Selecciona audios y sus archivos .lab/.txt con el mismo nombre base';

    const panel = document.createElement('div');
    panel.id = 'batchBenchmarkPanel';
    panel.style.cssText = 'width:100%;margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:12px;display:none;overflow:auto;';

    exportRow.appendChild(btn);
    exportRow.appendChild(input);
    exportRow.parentNode.insertBefore(panel, exportRow.nextSibling);

    const AUDIO_EXT_RE = /\.(mp3|wav|wave|aiff|aif|aifc|m4a|aac|ogg|oga|opus|flac|wma|amr|3gp|3gpp|webm|caf|au|mp4|m4v|mov|mkv|avi|wmv|flv|f4v|mpg|mpeg|mpe|m2ts|mts|ts|3g2|ogv|vob|mxf|asf|rm|rmvb|divx|dv|qt)$/i;
    const LAB_EXT_RE = /\.(lab|txt)$/i;

    function baseName(name) {
      return String(name || '')
        .replace(/\.(lab|txt|mp3|wav|wave|aiff|aif|aifc|m4a|aac|ogg|oga|opus|flac|wma|amr|3gp|3gpp|webm|caf|au|mp4|m4v|mov|mkv|avi|wmv|flv|f4v|mpg|mpeg|mpe|m2ts|mts|ts|3g2|ogv|vob|mxf|asf|rm|rmvb|divx|dv|qt)$/i, '')
        .replace(/(?:[_ .-](?:ground[_ -]?truth|truth|gt|chords?|annotations?))$/i, '')
        .trim()
        .toLowerCase();
    }

    function esc(v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    }
    function pct(x) { return `${(Number(x || 0) * 100).toFixed(1)}%`; }
    function mean(rows, fn) {
      const vals = rows.map(fn).filter(Number.isFinite);
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
    }
    function weightedMean(rows, valueFn, weightFn) {
      let sum=0,w=0;
      for (const r of rows) {
        const v=Number(valueFn(r)), ww=Math.max(0, Number(weightFn(r)) || 0);
        if (!Number.isFinite(v) || !ww) continue;
        sum += v*ww; w += ww;
      }
      return w ? sum/w : null;
    }

    async function analyzeBatchFile(file) {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const mono = audioBuffer.numberOfChannels > 1 ? mixToMono(audioBuffer) : new Float32Array(audioBuffer.getChannelData(0));
        const tuning=loadEngineTuning();
        let rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null; try{rhythmAnalysis=await fetchNeuralRhythm(file,tuning,{status:false});}catch(e){} try{chordAnalysis=await fetchNeuralChords(file,tuning,{status:false});}catch(e){} try{noteAnalysis=await fetchNeuralNotes(file,tuning,{status:false});}catch(e){}
        let result = await workerRequest('analyzeFile', {
          samples: mono,
          sampleRate: audioBuffer.sampleRate,
          duration: audioBuffer.duration,
          tuning,
          rhythmAnalysis,
          chordAnalysis,
          noteAnalysis,
        }, [], 240000);
        result = await enrichResultWithNeuralStructure(file,result,tuning,{status:false});
        result.song = file.name;
        return result;
      } finally {
        try { await audioCtx.close(); } catch (_) {}
      }
    }

    function corpusSummary(rows) {
      const ok = rows.filter(r => r.status === 'ok' && r.evaluation);
      const totalDuration = ok.reduce((a,r)=>a+(Number(r.duration)||0),0);
      const csr = weightedMean(ok, r=>r.evaluation.chordSymbolRecall, r=>r.duration || 1);
      const root = weightedMean(ok, r=>r.evaluation.rootRecall, r=>r.duration || 1);
      const bf1 = mean(ok, r=>r.evaluation.boundary?.f1);
      const bmae = mean(ok, r=>r.evaluation.boundary?.meanAbsoluteError);
      const rootComponent = weightedMean(ok, r=>r.evaluation.components?.root?.accuracy, r=>r.evaluation.components?.root?.evaluatedDuration || r.duration || 1);
      const triadComponent = weightedMean(ok, r=>r.evaluation.components?.triad?.accuracy, r=>r.evaluation.components?.triad?.evaluatedDuration || r.duration || 1);
      const seventhComponent = weightedMean(ok, r=>r.evaluation.components?.seventh?.accuracy, r=>r.evaluation.components?.seventh?.evaluatedDuration || r.duration || 1);
      const extensionComponent = weightedMean(ok, r=>r.evaluation.components?.extension?.accuracy, r=>r.evaluation.components?.extension?.evaluatedDuration || r.duration || 1);
      const alterationsComponent = weightedMean(ok, r=>r.evaluation.components?.alterations?.accuracy, r=>r.evaluation.components?.alterations?.evaluatedDuration || r.duration || 1);
      const inversionF1 = mean(ok, r=>r.evaluation.components?.inversion?.f1);
      const bassAccuracy = weightedMean(ok, r=>r.evaluation.components?.inversion?.bassAccuracy, r=>r.evaluation.components?.inversion?.evaluatedBassDuration || 0);
      const keyRows = ok.filter(r=>r.evaluation.key);
      const keyAcc = keyRows.length ? keyRows.filter(r=>r.evaluation.key.correct).length/keyRows.length : null;
      const bpmRows = ok.filter(r=>r.evaluation.bpm);
      const bpmMae = mean(bpmRows, r=>r.evaluation.bpm.absoluteError);
      return { songs:ok.length, totalDuration, chordSymbolRecall:csr, rootRecall:root, boundaryF1:bf1, boundaryMeanAbsoluteError:bmae, keyAccuracy:keyAcc, bpmMeanAbsoluteError:bpmMae, components:{root:rootComponent,triad:triadComponent,seventh:seventhComponent,extension:extensionComponent,alterations:alterationsComponent,inversionF1,bassAccuracy} };
    }

    function render(rows, summary) {
      const failed = rows.filter(r=>r.status !== 'ok');
      const scoreParts = [summary.chordSymbolRecall, summary.rootRecall, summary.boundaryF1, summary.keyAccuracy].filter(Number.isFinite);
      const score = scoreParts.length ? scoreParts.reduce((a,b)=>a+b,0)/scoreParts.length : 0;
      panel.innerHTML = `
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div><b>Benchmark de corpus v62</b><br><span style="color:var(--text-dim);font-size:12px;">${summary.songs} canciones evaluadas · ${(summary.totalDuration/60).toFixed(1)} min</span></div>
          <div style="font-size:22px;color:var(--gold);font-weight:700;">Score ${(score*100).toFixed(1)}/100</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px;margin-bottom:14px;">
          <div class="stat-box"><div class="label">CSR corpus</div><div class="value">${pct(summary.chordSymbolRecall)}</div></div>
          <div class="stat-box"><div class="label">Root</div><div class="value">${summary.components?.root == null ? '—' : pct(summary.components.root)}</div></div>
          <div class="stat-box"><div class="label">Triad</div><div class="value">${summary.components?.triad == null ? '—' : pct(summary.components.triad)}</div></div>
          <div class="stat-box"><div class="label">Seventh</div><div class="value">${summary.components?.seventh == null ? '—' : pct(summary.components.seventh)}</div></div>
          <div class="stat-box"><div class="label">Extension</div><div class="value">${summary.components?.extension == null ? '—' : pct(summary.components.extension)}</div></div>
          <div class="stat-box"><div class="label">Inversion F1</div><div class="value">${summary.components?.inversionF1 == null ? '—' : pct(summary.components.inversionF1)}</div></div>
          <div class="stat-box"><div class="label">Bass exacto</div><div class="value">${summary.components?.bassAccuracy == null ? '—' : pct(summary.components.bassAccuracy)}</div></div>
          <div class="stat-box"><div class="label">Boundary F1</div><div class="value">${pct(summary.boundaryF1)}</div></div>
          <div class="stat-box"><div class="label">Key accuracy</div><div class="value">${summary.keyAccuracy == null ? '—' : pct(summary.keyAccuracy)}</div></div>
        </div>
        <div style="overflow:auto;max-height:360px;border:1px solid var(--line);border-radius:8px;">
          <table style="border-collapse:collapse;width:100%;font-size:12px;min-width:760px;">
            <thead><tr>${['Canción','CSR','Root','Triad','7th','Ext','Inv F1','Bass','Boundary F1','Key','BPM err','Estado'].map(x=>`<th style="text-align:left;padding:8px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--panel);">${x}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(r=>{
              if (r.status !== 'ok') return `<tr><td style="padding:8px;">${esc(r.song)}</td><td colspan="10">—</td><td style="padding:8px;color:#ff8b72;">${esc(r.error || r.status)}</td></tr>`;
              const e=r.evaluation;
              return `<tr>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${esc(r.song)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${pct(e.chordSymbolRecall)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${e.components?.root?.accuracy == null ? '—' : pct(e.components.root.accuracy)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${e.components?.triad?.accuracy == null ? '—' : pct(e.components.triad.accuracy)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${e.components?.seventh?.accuracy == null ? '—' : pct(e.components.seventh.accuracy)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${e.components?.extension?.accuracy == null ? '—' : pct(e.components.extension.accuracy)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${e.components?.inversion?.f1 == null ? '—' : pct(e.components.inversion.f1)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${e.components?.inversion?.bassAccuracy == null ? '—' : pct(e.components.inversion.bassAccuracy)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${pct(e.boundary.f1)}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${e.key ? (e.key.correct ? '✓' : '✗') : '—'}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">${e.bpm ? e.bpm.absoluteError.toFixed(2) : '—'}</td>
                <td style="padding:8px;border-bottom:1px solid var(--line);">OK</td>
              </tr>`;
            }).join('')}</tbody>
          </table>
        </div>
        ${failed.length ? `<div style="margin-top:10px;color:#ffb4a2;font-size:12px;">${failed.length} archivo(s) no pudieron evaluarse. Revisa que audio y .lab tengan el mismo nombre base.</div>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          <button type="button" class="btn-ghost" id="batchExportCsvBtn">⬇ CSV</button>
          <button type="button" class="btn-ghost" id="batchExportJsonBtn">⬇ Benchmark JSON</button>
        </div>`;
      panel.style.display = 'block';

      document.getElementById('batchExportCsvBtn')?.addEventListener('click', () => {
        const cols=['song','duration','csr','rootRecall','rootComponent','triadComponent','seventhComponent','extensionComponent','alterationsComponent','inversionPrecision','inversionRecall','inversionF1','bassAccuracy','boundaryPrecision','boundaryRecall','boundaryF1','boundaryMAE','keyCorrect','bpmAbsoluteError','predictedSegments','truthSegments','status'];
        const lines=[cols.join(',')];
        for (const r of rows) {
          const e=r.evaluation||{}, b=e.boundary||{};
          const c=e.components||{}, inv=c.inversion||{};
          const vals=[r.song,r.duration,e.chordSymbolRecall,e.rootRecall,c.root?.accuracy,c.triad?.accuracy,c.seventh?.accuracy,c.extension?.accuracy,c.alterations?.accuracy,inv.precision,inv.recall,inv.f1,inv.bassAccuracy,b.precision,b.recall,b.f1,b.meanAbsoluteError,e.key?.correct,e.bpm?.absoluteError,e.predictedSegments,e.truthSegments,r.status];
          lines.push(vals.map(v=>`"${String(v ?? '').replace(/"/g,'""')}"`).join(','));
        }
        downloadBlob(new Blob([lines.join('\n')], {type:'text/csv'}), 'chordsync_benchmark_v62.csv');
      });
      document.getElementById('batchExportJsonBtn')?.addEventListener('click', () => {
        downloadBlob(new Blob([JSON.stringify({schema:'chordsync-benchmark',schemaVersion:1,createdAt:new Date().toISOString(),summary,rows}, null, 2)], {type:'application/json'}), 'chordsync_benchmark_v62.json');
      });
    }

    btn.addEventListener('click', () => { input.value=''; input.click(); });
    input.addEventListener('change', async () => {
      const selected=[...(input.files || [])];
      if (!selected.length) return;
      const labs=new Map();
      const audios=[];
      for (const f of selected) {
        if (LAB_EXT_RE.test(f.name)) labs.set(baseName(f.name), f);
        else if (f.type.startsWith('audio/') || f.type.startsWith('video/') || AUDIO_EXT_RE.test(f.name)) audios.push(f);
      }
      if (!audios.length) { showToast('Selecciona al menos un archivo de audio/video.'); return; }

      const rows=[];
      btn.disabled=true;
      try {
        for (let i=0;i<audios.length;i++) {
          const audio=audios[i], lab=labs.get(baseName(audio.name));
          setStatus(`Benchmark ${i+1}/${audios.length}: ${audio.name}`);
          if (!lab) { rows.push({song:audio.name,status:'missing-ground-truth',error:'Falta .lab/.txt correspondiente'}); continue; }
          try {
            const [analysis, labText] = await Promise.all([analyzeBatchFile(audio), lab.text()]);
            const evaluation=window.ChordSyncEvaluator.evaluateAnalysis(analysis, labText, {boundaryTolerance:0.25});
            rows.push({song:audio.name,status:'ok',duration:analysis.duration,key:analysis.key,scale:analysis.scale,bpm:analysis.bpm,decoderDiagnostics:analysis.decoderDiagnostics,evaluation});
          } catch (err) {
            console.error('Batch benchmark error', audio.name, err);
            rows.push({song:audio.name,status:'error',error:err.message || String(err)});
          }
        }
        const summary=corpusSummary(rows);
        render(rows,summary);
        showToast(`Benchmark terminado: ${summary.songs}/${audios.length} canciones evaluadas.`);
      } finally {
        btn.disabled=false;
        setStatus('');
      }
    });
  })();


  // ---------- Optimización + benchmark A/B de proveedores + checkpoints ONNX (v37) ----------
  (function initHyperparameterSearch() {
    const exportRow = document.querySelector('.export-row');
    if (!exportRow || !window.ChordSyncEvaluator) return;

    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true;
    input.accept = 'audio/*,video/*,.mp3,.wav,.wave,.aiff,.aif,.m4a,.aac,.ogg,.opus,.flac,.webm,.mp4,.mov,.lab,.txt';
    input.style.display = 'none'; input.id = 'hyperTuneInput';
    const btn = document.createElement('button');
    btn.className = 'btn-ghost'; btn.id = 'hyperTuneBtn'; btn.textContent = '⚙️ Auto-optimizar';
    btn.title = 'Busca en TRAIN, selecciona en VALIDATION y reporta TEST sin usarlo para ajustar';
    const depth = document.createElement('select');
    depth.id='hyperTuneDepth'; depth.className='btn-ghost'; depth.title='Cantidad de configuraciones de exploración inicial';
    depth.innerHTML='<option value="24">Tuning rápido (≈40)</option><option value="56" selected>Tuning balanceado (≈72)</option><option value="112">Tuning profundo (≈128)</option>';
    const splitSel = document.createElement('select');
    splitSel.id='hyperTuneSplit'; splitSel.className='btn-ghost'; splitSel.title='Separación determinista del corpus';
    splitSel.innerHTML='<option value="70,15,15" selected>Split 70/15/15</option><option value="80,10,10">Split 80/10/10</option><option value="60,20,20">Split 60/20/20</option>';
    const panel = document.createElement('div');
    panel.id = 'hyperTunePanel';
    panel.style.cssText='width:100%;margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:12px;display:none;overflow:auto;';
    const providerBtn = document.createElement('button');
    providerBtn.className='btn-ghost'; providerBtn.id='providerBenchmarkBtn'; providerBtn.textContent='🧪 A/B acústico';
    providerBtn.title='Compara Essentia, HPCP, ONNX, BTC, Multi-head y ensembles con los mismos features, tuning y splits';
    const modelBtn=document.createElement('button');
    modelBtn.className='btn-ghost'; modelBtn.id='modelBenchmarkBtn'; modelBtn.textContent='🧠 A/B modelos ONNX';
    modelBtn.title='Compara todos los checkpoints declarados en models/chord_models.json';
    const streamBtn=document.createElement('button');
    streamBtn.className='btn-ghost'; streamBtn.id='streamBenchmarkBtn'; streamBtn.textContent='🎚 A/B multi-stream';
    streamBtn.title='Separa cada canción una vez y compara MIX, OTHER, BASS y DRUMS con la misma caché; además optimiza pesos de OTHER/BASS';
    const rhythmBtn=document.createElement('button');
    rhythmBtn.className='btn-ghost'; rhythmBtn.id='rhythmBenchmarkBtn'; rhythmBtn.textContent='🥁 A/B ritmo';
    rhythmBtn.title='Compara acentos v22, BeatNet neuronal y ensemble sobre los mismos features; acepta .beats opcional';
    const providerInput=document.createElement('input');
    providerInput.type='file'; providerInput.multiple=true; providerInput.accept=input.accept; providerInput.style.display='none'; providerInput.id='providerBenchmarkInput';
    const providerPanel=document.createElement('div');
    providerPanel.id='providerBenchmarkPanel'; providerPanel.style.cssText='width:100%;margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:12px;display:none;overflow:auto;';
    const modelInput=document.createElement('input'); modelInput.type='file'; modelInput.multiple=true; modelInput.accept=input.accept; modelInput.style.display='none'; modelInput.id='modelBenchmarkInput';
    const modelPanel=document.createElement('div'); modelPanel.id='modelBenchmarkPanel'; modelPanel.style.cssText='width:100%;margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:12px;display:none;overflow:auto;';
    const streamInput=document.createElement('input'); streamInput.type='file'; streamInput.multiple=true; streamInput.accept=input.accept; streamInput.style.display='none'; streamInput.id='streamBenchmarkInput';
    const streamPanel=document.createElement('div'); streamPanel.id='streamBenchmarkPanel'; streamPanel.style.cssText='width:100%;margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:12px;display:none;overflow:auto;';
    const rhythmInput=document.createElement('input'); rhythmInput.type='file'; rhythmInput.multiple=true; rhythmInput.accept=input.accept+',.beats'; rhythmInput.style.display='none'; rhythmInput.id='rhythmBenchmarkInput';
    const rhythmPanel=document.createElement('div'); rhythmPanel.id='rhythmBenchmarkPanel'; rhythmPanel.style.cssText='width:100%;margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:12px;display:none;overflow:auto;';
    exportRow.appendChild(btn); exportRow.appendChild(providerBtn); exportRow.appendChild(modelBtn); exportRow.appendChild(streamBtn); exportRow.appendChild(rhythmBtn); exportRow.appendChild(depth); exportRow.appendChild(splitSel); exportRow.appendChild(input); exportRow.appendChild(providerInput); exportRow.appendChild(modelInput); exportRow.appendChild(streamInput); exportRow.appendChild(rhythmInput);
    exportRow.parentNode.insertBefore(panel, exportRow.nextSibling);
    panel.parentNode.insertBefore(providerPanel, panel.nextSibling);
    providerPanel.parentNode.insertBefore(modelPanel, providerPanel.nextSibling);
    modelPanel.parentNode.insertBefore(streamPanel, modelPanel.nextSibling);
    streamPanel.parentNode.insertBefore(rhythmPanel, streamPanel.nextSibling);

    const AUDIO_EXT_RE=/\.(mp3|wav|wave|aiff|aif|m4a|aac|ogg|opus|flac|webm|mp4|mov)$/i;
    const LAB_EXT_RE=/\.(lab|txt)$/i;
    const baseName=(name)=>String(name||'').replace(/\.(lab|txt|mp3|wav|wave|aiff|aif|m4a|aac|ogg|opus|flac|webm|mp4|mov)$/i,'').replace(/(?:[_ .-](?:ground[_ -]?truth|truth|gt|chords?|annotations?))$/i,'').trim().toLowerCase();
    const esc=(v)=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const pct=(x)=>Number.isFinite(Number(x))?`${(Number(x)*100).toFixed(1)}%`:'—';
    const mean=(rows,fn)=>{const a=rows.map(fn).filter(Number.isFinite);return a.length?a.reduce((x,y)=>x+y,0)/a.length:null;};
    const weightedMean=(rows,vf,wf)=>{let s=0,w=0;for(const r of rows){const v=Number(vf(r)),ww=Math.max(0,Number(wf(r))||0);if(Number.isFinite(v)&&ww){s+=v*ww;w+=ww;}}return w?s/w:null;};
    function summary(rows){
      const ok=rows.filter(r=>r.status==='ok');
      const csr=weightedMean(ok,r=>r.evaluation.chordSymbolRecall,r=>r.duration||1);
      const root=weightedMean(ok,r=>r.evaluation.rootRecall,r=>r.duration||1);
      const bf1=mean(ok,r=>r.evaluation.boundary?.f1);
      const keys=ok.filter(r=>r.evaluation.key); const keyAcc=keys.length?keys.filter(r=>r.evaluation.key.correct).length/keys.length:null;
      const parts=[csr,root,bf1,keyAcc].filter(Number.isFinite);
      return {songs:ok.length,csr,root,bf1,keyAcc,score:parts.length?parts.reduce((a,b)=>a+b,0)/parts.length:0};
    }

    // Hash estable para que una canción permanezca en el mismo split entre ejecuciones.
    function hash32(str,seed=140906){let h=(2166136261^seed)>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;return h>>>0;}
    function deterministicSplit(items, ratios, seed){
      const [tr,vr,te]=ratios, total=Math.max(1,tr+vr+te), train=[],validation=[],test=[];
      for(const item of items){const u=hash32(baseName(item.audio.name),seed)/4294967296; if(u<tr/total)train.push(item); else if(u<(tr+vr)/total)validation.push(item); else test.push(item);}
      // Para corpus pequeños, garantiza validation/test cuando sea posible sin aleatoriedad.
      const ranked=[...items].sort((a,b)=>hash32(baseName(a.audio.name),seed)-hash32(baseName(b.audio.name),seed));
      function moveOne(from,to){if(!to.length&&from.length>1)to.push(from.pop());}
      if(items.length>=3){moveOne(train,validation); moveOne(train,test); if(!train.length){const donor=validation.length>test.length?validation:test;if(donor.length>1)train.push(donor.shift());}}
      return {train,validation,test,ratios:[tr,vr,te],seed,assignment:ranked.map(x=>({song:x.audio.name,split:train.includes(x)?'train':validation.includes(x)?'validation':'test'}))};
    }

    function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
    const RANGES={
      ensembleNeuralWeight:[.45,.90], viterbiStayReward:[.42,.90], viterbiChangePenalty:[.36,.82],
      viterbiDistanceWeight:[.16,.48], functionalMotionBonus:[.05,.28], functionalPriorWeight:[0,.32], functionalDistanceWeight:[0,.30], voiceLeadingWeight:[0,.26], voicingLeadingWeight:[0,.22], transcriptionHarmonyWeight:[0,.42], transcriptionHeadWeight:[0,.52], transcriptionTemporalBlend:[.45,.90], transcriptionExtensionPersistenceMs:[160,420], keyPriorStrength:[.16,.72],
      modulationChangePenalty:[.45,1.05], modulationMinConfidence:[.30,.65], modulationGlobalKeyBias:[.02,.22],
      sectionSimilarityThreshold:[.68,.88], sectionRepeatConfidenceFloor:[.38,.62], sectionRepeatMinAcousticSupport:[.10,.30], sectionRepeatBoost:[.08,.24],
      noveltyWeight:[.62,.94], noveltyThreshold:[.15,.34], beatSnapRatio:[.14,.44], beatSnapMax:[.10,.32],
      halfBeatSnapRatio:[.10,.34], halfBeatSnapMax:[.07,.22]
    };
    const BASELINE={ensembleNeuralWeight:.72,viterbiStayReward:.62,viterbiChangePenalty:.58,viterbiDistanceWeight:.30,functionalMotionBonus:.14,functionalPriorWeight:.16,functionalDistanceWeight:.14,voiceLeadingWeight:.12,voicingLeadingWeight:.10,transcriptionHarmonyWeight:.24,transcriptionHeadWeight:.34,transcriptionTemporalBlend:.72,transcriptionExtensionPersistenceMs:280,keyPriorStrength:.42,modulationChangePenalty:.72,modulationMinConfidence:.44,modulationGlobalKeyBias:.10,sectionSimilarityThreshold:.76,sectionRepeatConfidenceFloor:.50,sectionRepeatMinAcousticSupport:.18,sectionRepeatBoost:.16,noveltyWeight:.82,noveltyThreshold:.24,beatSnapRatio:.28,beatSnapMax:.22,halfBeatSnapRatio:.20,halfBeatSnapMax:.14};
    const HAND=[
      {name:'baseline',tuning:{}},
      {name:'stable+',tuning:{viterbiStayReward:.74,viterbiChangePenalty:.66,viterbiDistanceWeight:.32}},
      {name:'responsive',tuning:{viterbiStayReward:.52,viterbiChangePenalty:.48,viterbiDistanceWeight:.25}},
      {name:'tonal+',tuning:{keyPriorStrength:.58,functionalPriorWeight:.22,functionalDistanceWeight:.18,voiceLeadingWeight:.14,voicingLeadingWeight:.12,viterbiStayReward:.64}},
      {name:'tonal-light',tuning:{keyPriorStrength:.24,functionalPriorWeight:.08,functionalDistanceWeight:.07,voiceLeadingWeight:.05,voicingLeadingWeight:.04,viterbiStayReward:.60}},
      {name:'boundary-tight',tuning:{noveltyThreshold:.19,noveltyWeight:.88,beatSnapRatio:.22,beatSnapMax:.16}},
      {name:'beat-aware+',tuning:{noveltyThreshold:.25,beatSnapRatio:.36,beatSnapMax:.26,halfBeatSnapRatio:.25}},
      {name:'balanced-v62',tuning:{viterbiStayReward:.66,viterbiChangePenalty:.60,keyPriorStrength:.46,functionalPriorWeight:.16,functionalDistanceWeight:.14,voiceLeadingWeight:.12,voicingLeadingWeight:.10,transcriptionHarmonyWeight:.24,transcriptionHeadWeight:.34,transcriptionTemporalBlend:.72,transcriptionExtensionPersistenceMs:280,noveltyThreshold:.22,beatSnapRatio:.31}}
    ];
    const round4=x=>Math.round(x*10000)/10000;
    function signature(t){return Object.keys(RANGES).map(k=>`${k}:${round4(Number(t[k]??BASELINE[k]))}`).join('|');}
    function randomCandidates(count,seed=140906){
      const rnd=mulberry32(seed), out=[], seen=new Set(HAND.map(x=>signature(x.tuning)));
      for(let i=0;i<count;i++){
        const tuning={};
        for(const [k,[lo,hi]] of Object.entries(RANGES)){const u=((i+rnd())/count)%1;tuning[k]=round4(lo+(hi-lo)*u);}
        const sig=signature(tuning); if(seen.has(sig)){i--;continue;} seen.add(sig); out.push({name:`explore-${String(i+1).padStart(3,'0')}`,tuning});
      }
      return out;
    }
    function localNeighbors(elites, perElite=4, seed=1414){
      const rnd=mulberry32(seed), out=[], seen=new Set();
      elites.forEach((elite,ei)=>{const center={...BASELINE,...elite.tuning};for(let j=0;j<perElite;j++){const t={};for(const [k,[lo,hi]] of Object.entries(RANGES)){const span=(hi-lo)*(j<2?.10:.18),delta=(rnd()*2-1)*span;t[k]=round4(Math.min(hi,Math.max(lo,center[k]+delta)));}const sig=signature(t);if(seen.has(sig))continue;seen.add(sig);out.push({name:`refine-${ei+1}-${j+1}`,tuning:t,parent:elite.name});}});
      return out;
    }
    async function decodeFile(file){const ctx=new (window.AudioContext||window.webkitAudioContext)();try{const ab=await file.arrayBuffer();const b=await ctx.decodeAudioData(ab);return {samples:b.numberOfChannels>1?mixToMono(b):new Float32Array(b.getChannelData(0)),sampleRate:b.sampleRate,duration:b.duration};}finally{try{await ctx.close();}catch(_){}}}
    async function prepareDecodedCache(decoded,rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null){return await workerRequest('prepareAnalysisCache',{samples:decoded.samples,sampleRate:decoded.sampleRate,duration:decoded.duration,rhythmAnalysis,chordAnalysis,noteAnalysis},[],300000);}
    async function prepareMultiStreamCache(streams,sampleRate,duration,rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null){return await workerRequest('prepareMultiStreamCache',{streams,sampleRate,duration,rhythmAnalysis,chordAnalysis,noteAnalysis},[],360000);}
    async function analyzeCached(cacheId,tuning){return await workerRequest('analyzeCached',{cacheId,tuning},[],120000);}
    async function releaseCached(cacheId){try{return await workerRequest('releaseAnalysisCache',{cacheId},[],30000);}catch(_){return null;}}
    async function evaluateCandidate(candidate, corpus, phaseLabel, indexLabel=''){
      const rows=[];
      for(let si=0;si<corpus.length;si++){
        const x=corpus[si]; setStatus(`${phaseLabel}${indexLabel} · canción ${si+1}/${corpus.length} · ${candidate.name}`);
        try{const analysis=await analyzeCached(x.cacheId,candidate.tuning);const evaluation=window.ChordSyncEvaluator.evaluateAnalysis(analysis,x.labText,{boundaryTolerance:.25});rows.push({song:x.audio.name,status:'ok',duration:analysis.duration,evaluation});}
        catch(err){rows.push({song:x.audio.name,status:'error',error:err.message||String(err)});}
      }
      return {rows,summary:summary(rows)};
    }
    async function evaluateCandidates(candidates, corpus, phaseLabel){
      const results=[];
      for(let pi=0;pi<candidates.length;pi++){const candidate=candidates[pi],r=await evaluateCandidate(candidate,corpus,phaseLabel,` ${pi+1}/${candidates.length}`);results.push({...candidate,trainSummary:r.summary});}
      return results;
    }
    async function validateCandidates(candidates, corpus){
      const out=[];
      for(let i=0;i<candidates.length;i++){const c=candidates[i],r=await evaluateCandidate(c,corpus,'Validación',` ${i+1}/${candidates.length}`);out.push({...c,validationSummary:r.summary});}
      return out;
    }
    function scoreBadge(x){return Number.isFinite(x)?`${(x*100).toFixed(1)}/100`:'—';}
    function render(results, meta, winner, testReport){
      const ranked=[...results].sort((a,b)=>(b.validationSummary?.score??-1)-(a.validationSummary?.score??-1));
      const gap=winner && winner.trainSummary && winner.validationSummary ? winner.trainSummary.score-winner.validationSummary.score : null;
      panel.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px;"><div><b>Auto-optimización v62 · train / validation / test</b><br><span style="font-size:12px;color:var(--text-dim);">TRAIN ${meta.trainSongs} · VALIDATION ${meta.validationSongs} · TEST ${meta.testSongs} · seed ${meta.seed}</span></div><div style="font-size:20px;color:var(--gold);font-weight:700;">TEST ${scoreBadge(testReport?.summary?.score)}</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:12px;">
        <div class="stat-box"><div class="label">Ganador</div><div class="value" style="font-size:14px;">${esc(winner?.name||'—')}</div></div>
        <div class="stat-box"><div class="label">Train score</div><div class="value">${scoreBadge(winner?.trainSummary?.score)}</div></div>
        <div class="stat-box"><div class="label">Validation score</div><div class="value">${scoreBadge(winner?.validationSummary?.score)}</div></div>
        <div class="stat-box"><div class="label">Generalization gap</div><div class="value">${Number.isFinite(gap)?(gap*100).toFixed(1)+' pts':'—'}</div></div>
      </div>
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">Los hiperparámetros se buscan únicamente con TRAIN. VALIDATION selecciona el ganador entre los mejores candidatos. TEST se ejecuta una sola vez al final y no participa en el ajuste.</div>
      <div style="overflow:auto;max-height:360px;border:1px solid var(--line);border-radius:8px;"><table style="border-collapse:collapse;width:100%;font-size:12px;min-width:900px;"><thead><tr>${['Config','Fase','Train','Validation','CSR val','Raíz val','Boundary val','Key val'].map(x=>`<th style="padding:8px;text-align:left;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--panel);">${x}</th>`).join('')}</tr></thead><tbody>${ranked.map(r=>`<tr><td style="padding:8px;border-bottom:1px solid var(--line);">${esc(r.name)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${esc(r.parent?'refine':'explore')}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${scoreBadge(r.trainSummary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${scoreBadge(r.validationSummary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.validationSummary?.csr)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.validationSummary?.root)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.validationSummary?.bf1)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.validationSummary?.keyAcc)}</td></tr>`).join('')}</tbody></table></div>
      <div style="margin-top:12px;padding:10px;border:1px solid var(--line);border-radius:8px;font-size:12px;"><b>TEST final:</b> CSR ${pct(testReport?.summary?.csr)} · raíz ${pct(testReport?.summary?.root)} · Boundary F1 ${pct(testReport?.summary?.bf1)} · Key ${pct(testReport?.summary?.keyAcc)}.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;"><button class="btn-primary" id="applyBestTuneBtn">✓ Aplicar ganador validado</button><button class="btn-ghost" id="exportTuneBtn">⬇ JSON experimento</button><button class="btn-ghost" id="resetTuneBtn">Restablecer defaults</button></div>`;
      panel.style.display='block';
      document.getElementById('applyBestTuneBtn')?.addEventListener('click',()=>{const prev=loadEngineTuning();saveEngineTuning({...winner.tuning,acousticProvider:prev.acousticProvider||'auto'});showToast(`Configuración ${winner.name} aplicada. Fue seleccionada por VALIDATION.`);});
      document.getElementById('resetTuneBtn')?.addEventListener('click',()=>{saveEngineTuning({});showToast('Configuración restablecida a defaults v62.');});
      document.getElementById('exportTuneBtn')?.addEventListener('click',()=>downloadBlob(new Blob([JSON.stringify({schema:'chordsync-tuning-experiment',schemaVersion:3,engine:'v62',createdAt:new Date().toISOString(),split:meta.split,search:{seed:meta.seed,exploreCount:meta.exploreCount,refineCount:meta.refineCount,validationCandidates:meta.validationCandidates},winner:{name:winner.name,tuning:winner.tuning,trainSummary:winner.trainSummary,validationSummary:winner.validationSummary},test:testReport,results:ranked.map(r=>({name:r.name,parent:r.parent||null,tuning:r.tuning,trainSummary:r.trainSummary,validationSummary:r.validationSummary}))},null,2)],{type:'application/json'}),'chordsync_tuning_experiment_v62.json'));
    }
    btn.addEventListener('click',()=>{input.value='';input.click();});
    input.addEventListener('change',async()=>{
      const files=[...(input.files||[])]; if(!files.length)return;
      const labs=new Map(),audios=[]; for(const f of files){if(LAB_EXT_RE.test(f.name))labs.set(baseName(f.name),f);else if(f.type.startsWith('audio/')||f.type.startsWith('video/')||AUDIO_EXT_RE.test(f.name))audios.push(f);}
      const pairs=audios.map(a=>({audio:a,lab:labs.get(baseName(a.name))})).filter(x=>x.lab);
      if(pairs.length<3){showToast('v62 necesita al menos 3 pares audio + ground truth para separar train/validation/test.');return;}
      btn.disabled=true; depth.disabled=true; splitSel.disabled=true;
      const requested=Math.max(8,Math.min(160,Number(depth.value)||56)), seed=140906;
      const ratios=splitSel.value.split(',').map(Number); const split=deterministicSplit(pairs,ratios,seed);
      try{
        const decoded=[];
        for(let i=0;i<pairs.length;i++){
          setStatus(`Extrayendo features ${i+1}/${pairs.length}: ${pairs[i].audio.name}`);
          const audioData=await decodeFile(pairs[i].audio); let rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null; try{rhythmAnalysis=await fetchNeuralRhythm(pairs[i].audio,loadEngineTuning(),{status:false});}catch(e){} try{chordAnalysis=await fetchNeuralChords(pairs[i].audio,loadEngineTuning(),{status:false});}catch(e){} try{noteAnalysis=await fetchNeuralNotes(pairs[i].audio,loadEngineTuning(),{status:false});}catch(e){} const cache=await prepareDecodedCache(audioData,rhythmAnalysis,chordAnalysis,noteAnalysis);
          decoded.push({...pairs[i],cacheId:cache.cacheId,duration:audioData.duration,labText:await pairs[i].lab.text()});
        }
        const byName=new Map(decoded.map(x=>[x.audio.name,x]));
        const train=split.train.map(x=>byName.get(x.audio.name)).filter(Boolean), validation=split.validation.map(x=>byName.get(x.audio.name)).filter(Boolean), test=split.test.map(x=>byName.get(x.audio.name)).filter(Boolean);
        try{
          const exploration=[...HAND,...randomCandidates(requested,seed)];
          let trainResults=await evaluateCandidates(exploration,train,'Train exploración');
          const elites=[...trainResults].sort((a,b)=>b.trainSummary.score-a.trainSummary.score).slice(0,4);
          const refinement=localNeighbors(elites,4,seed+1);
          trainResults.push(...await evaluateCandidates(refinement,train,'Train refinamiento'));
          // Validation sólo recibe los mejores candidatos del TRAIN, evitando usarla para generar nuevos vecinos.
          const validationPool=[...trainResults].sort((a,b)=>b.trainSummary.score-a.trainSummary.score).slice(0,Math.min(12,trainResults.length));
          const validated=await validateCandidates(validationPool,validation);
          const winner=[...validated].sort((a,b)=>b.validationSummary.score-a.validationSummary.score || b.trainSummary.score-a.trainSummary.score)[0];
          const finalTest=await evaluateCandidate(winner,test,'TEST final');
          render(validated,{seed,exploreCount:exploration.length,refineCount:refinement.length,validationCandidates:validationPool.length,trainSongs:train.length,validationSongs:validation.length,testSongs:test.length,split:{ratios,assignment:split.assignment}},winner,finalTest);
          showToast(`v62 terminada. Ganador por validation: ${winner.name}; TEST ${(finalTest.summary.score*100).toFixed(1)}/100.`);
        } finally {for(const x of decoded) await releaseCached(x.cacheId);}
      } finally {btn.disabled=false;depth.disabled=false;splitSel.disabled=false;setStatus('');}
    });

    function renderProviderBenchmark(results, meta) {
      const available=results.filter(r=>r.validation?.summary?.songs>0);
      const ranked=[...available].sort((a,b)=>(b.validation.summary.score??-1)-(a.validation.summary.score??-1));
      const winner=ranked[0]||null;
      const providerLabel={essentia:'Essentia labels',hpcp:'HPCP probabilístico',onnx:'ONNX neural web',ensemble:'ONNX + HPCP',btc:'Backend neuronal','btc-ensemble':'Backend neuronal + HPCP',multihead:'ONNX multi-head','multihead-ensemble':'Multi-head + HPCP'};
      const cell=(v)=>scoreBadge(v);
      providerPanel.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px;"><div><b>Benchmark A/B acústico v62</b><br><span style="font-size:12px;color:var(--text-dim);">Mismos features · mismo tuning · mismo split · TRAIN ${meta.trainSongs} / VAL ${meta.validationSongs} / TEST ${meta.testSongs}</span></div><div style="font-size:18px;color:var(--gold);font-weight:700;">VAL ganador: ${esc(winner?providerLabel[winner.provider]:'—')}</div></div>
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">Esta prueba bloquea el proveedor acústico y mantiene idénticos Viterbi, prior tonal y refinamiento de fronteras. ONNX aparece como no disponible sin runtime/modelo web; BTC aparece como no disponible si el backend CrispASR/modelo no está configurado; Multi-head aparece como no disponible hasta instalar models/multihead_chord_model.json + .onnx. El ganador se determina por VALIDATION; TEST se muestra como holdout y no se usa para ajustar pesos.</div>
      <div style="overflow:auto;border:1px solid var(--line);border-radius:8px;"><table style="border-collapse:collapse;width:100%;font-size:12px;min-width:980px;"><thead><tr>${['Proveedor','Train','Validation','TEST','CSR test','Raíz test','Boundary test','Key test','Estado'].map(x=>`<th style="padding:8px;text-align:left;border-bottom:1px solid var(--line);background:var(--panel);">${x}</th>`).join('')}</tr></thead><tbody>${results.map(r=>`<tr><td style="padding:8px;border-bottom:1px solid var(--line);"><b>${esc(providerLabel[r.provider]||r.provider)}</b></td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.train?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.validation?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.test?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.csr)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.root)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.bf1)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.keyAcc)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${r.validation?.summary?.songs>0?'✓ disponible':'No disponible'}</td></tr>`).join('')}</tbody></table></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">${winner?'<button class="btn-primary" id="applyProviderWinnerBtn">✓ Aplicar proveedor ganador por VALIDATION</button>':''}<button class="btn-ghost" id="exportProviderBenchmarkBtn">⬇ JSON A/B</button></div>`;
      providerPanel.style.display='block';
      document.getElementById('applyProviderWinnerBtn')?.addEventListener('click',()=>{const next={...loadEngineTuning(),acousticProvider:winner.provider};saveEngineTuning(next);showToast(`Proveedor ${providerLabel[winner.provider]} aplicado según VALIDATION.`);});
      document.getElementById('exportProviderBenchmarkBtn')?.addEventListener('click',()=>downloadBlob(new Blob([JSON.stringify({schema:'chordsync-acoustic-provider-benchmark',schemaVersion:1,engine:'v62',createdAt:new Date().toISOString(),split:meta.split,tuning:meta.tuning,winnerByValidation:winner?winner.provider:null,results},null,2)],{type:'application/json'}),'chordsync_acoustic_provider_ab_v62.json'));
    }

    providerBtn.addEventListener('click',()=>{providerInput.value='';providerInput.click();});
    providerInput.addEventListener('change',async()=>{
      const files=[...(providerInput.files||[])]; if(!files.length)return;
      const labs=new Map(),audios=[]; for(const f of files){if(LAB_EXT_RE.test(f.name))labs.set(baseName(f.name),f);else if(f.type.startsWith('audio/')||f.type.startsWith('video/')||AUDIO_EXT_RE.test(f.name))audios.push(f);}
      const pairs=audios.map(a=>({audio:a,lab:labs.get(baseName(a.name))})).filter(x=>x.lab);
      if(pairs.length<3){showToast('A/B acústico necesita al menos 3 pares audio + ground truth.');return;}
      providerBtn.disabled=true; btn.disabled=true; depth.disabled=true; splitSel.disabled=true;
      const seed=150906, ratios=splitSel.value.split(',').map(Number), split=deterministicSplit(pairs,ratios,seed);
      const baseTuning={...loadEngineTuning()}; delete baseTuning.acousticProvider;
      try{
        const decoded=[];
        for(let i=0;i<pairs.length;i++){
          setStatus(`A/B: extrayendo features ${i+1}/${pairs.length}: ${pairs[i].audio.name}`);
          const audioData=await decodeFile(pairs[i].audio); let rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null; try{rhythmAnalysis=await fetchNeuralRhythm(pairs[i].audio,baseTuning,{status:false});}catch(e){} try{chordAnalysis=await fetchNeuralChords(pairs[i].audio,baseTuning,{status:false,force:true});}catch(e){} try{noteAnalysis=await fetchNeuralNotes(pairs[i].audio,baseTuning,{status:false});}catch(e){} const cache=await prepareDecodedCache(audioData,rhythmAnalysis,chordAnalysis,noteAnalysis);
          decoded.push({...pairs[i],cacheId:cache.cacheId,duration:audioData.duration,labText:await pairs[i].lab.text()});
        }
        const byName=new Map(decoded.map(x=>[x.audio.name,x]));
        const train=split.train.map(x=>byName.get(x.audio.name)).filter(Boolean), validation=split.validation.map(x=>byName.get(x.audio.name)).filter(Boolean), test=split.test.map(x=>byName.get(x.audio.name)).filter(Boolean);
        try{
          const providers=['essentia','hpcp','onnx','ensemble','btc','btc-ensemble','multihead','multihead-ensemble'], results=[];
          for(let i=0;i<providers.length;i++){
            const provider=providers[i], candidate={name:`provider-${provider}`,tuning:{...baseTuning,acousticProvider:provider}};
            setStatus(`A/B proveedor ${i+1}/${providers.length}: ${provider}`);
            const trainReport=await evaluateCandidate(candidate,train,'A/B TRAIN');
            const validationReport=await evaluateCandidate(candidate,validation,'A/B VALIDATION');
            const testReport=await evaluateCandidate(candidate,test,'A/B TEST');
            results.push({provider,train:trainReport,validation:validationReport,test:testReport});
          }
          renderProviderBenchmark(results,{seed,trainSongs:train.length,validationSongs:validation.length,testSongs:test.length,split:{ratios,assignment:split.assignment},tuning:baseTuning});
          const available=results.filter(r=>r.validation.summary.songs>0).sort((a,b)=>b.validation.summary.score-a.validation.summary.score);
          showToast(available.length?`A/B v62 terminado. Mejor en VALIDATION: ${available[0].provider}.`:'A/B terminado sin proveedores evaluables.');
        } finally {for(const x of decoded) await releaseCached(x.cacheId);}
      } finally {providerBtn.disabled=false;btn.disabled=false;depth.disabled=false;splitSel.disabled=false;setStatus('');}
    });

    function renderModelBenchmark(results, meta) {
      const available=results.filter(r=>r.validation?.summary?.songs>0);
      const ranked=[...available].sort((a,b)=>(b.validation.summary.score??-1)-(a.validation.summary.score??-1));
      const winner=ranked[0]||null;
      const cell=(v)=>scoreBadge(v);
      modelPanel.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px;"><div><b>Benchmark de checkpoints ONNX v62</b><br><span style="font-size:12px;color:var(--text-dim);">Registry: models/chord_models.json · TRAIN ${meta.trainSongs} / VAL ${meta.validationSongs} / TEST ${meta.testSongs}</span></div><div style="font-size:18px;color:var(--gold);font-weight:700;">VAL ganador: ${esc(winner?winner.label:'—')}</div></div>
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">Cada checkpoint se prueba solo (ONNX) y combinado con HPCP (Ensemble), manteniendo el mismo tuning temporal y el mismo split. El ganador se decide por VALIDATION; TEST no participa en la selección.</div>
      <div style="overflow:auto;border:1px solid var(--line);border-radius:8px;"><table style="border-collapse:collapse;width:100%;font-size:12px;min-width:1100px;"><thead><tr>${['Modelo','Modo','Train','Validation','TEST','CSR test','Raíz test','Boundary test','Key test','Estado'].map(x=>`<th style="padding:8px;text-align:left;border-bottom:1px solid var(--line);background:var(--panel);">${x}</th>`).join('')}</tr></thead><tbody>${results.map(r=>`<tr><td style="padding:8px;border-bottom:1px solid var(--line);"><b>${esc(r.modelName||r.modelId)}</b><br><span style="color:var(--text-dim);">${esc(r.modelId)}</span></td><td style="padding:8px;border-bottom:1px solid var(--line);">${esc(r.mode)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.train?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.validation?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.test?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.csr)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.root)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.bf1)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.keyAcc)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${r.validation?.summary?.songs>0?'✓ disponible':'No disponible'}</td></tr>`).join('')}</tbody></table></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">${winner?'<button class="btn-primary" id="applyModelWinnerBtn">✓ Aplicar checkpoint ganador</button>':''}<button class="btn-ghost" id="exportModelBenchmarkBtn">⬇ JSON modelos</button></div>`;
      modelPanel.style.display='block';
      document.getElementById('applyModelWinnerBtn')?.addEventListener('click',()=>{const next={...loadEngineTuning(),acousticProvider:winner.mode==='ensemble'?'ensemble':'onnx',neuralModelId:winner.modelId};saveEngineTuning(next);showToast(`Checkpoint ${winner.modelName||winner.modelId} aplicado en modo ${winner.mode}.`);});
      document.getElementById('exportModelBenchmarkBtn')?.addEventListener('click',()=>downloadBlob(new Blob([JSON.stringify({schema:'chordsync-neural-checkpoint-benchmark',schemaVersion:1,engine:'v62',createdAt:new Date().toISOString(),split:meta.split,tuning:meta.tuning,winnerByValidation:winner?{modelId:winner.modelId,mode:winner.mode}:null,models:meta.models,results},null,2)],{type:'application/json'}),'chordsync_onnx_checkpoint_ab_v62.json'));
    }

    modelBtn.addEventListener('click',()=>{modelInput.value='';modelInput.click();});
    modelInput.addEventListener('change',async()=>{
      const files=[...(modelInput.files||[])]; if(!files.length)return;
      const labs=new Map(),audios=[]; for(const f of files){if(LAB_EXT_RE.test(f.name))labs.set(baseName(f.name),f);else if(f.type.startsWith('audio/')||f.type.startsWith('video/')||AUDIO_EXT_RE.test(f.name))audios.push(f);}
      const pairs=audios.map(a=>({audio:a,lab:labs.get(baseName(a.name))})).filter(x=>x.lab);
      if(pairs.length<3){showToast('A/B de modelos necesita al menos 3 pares audio + ground truth.');return;}
      modelBtn.disabled=true; providerBtn.disabled=true; btn.disabled=true; depth.disabled=true; splitSel.disabled=true;
      const seed=160906, ratios=splitSel.value.split(',').map(Number), split=deterministicSplit(pairs,ratios,seed);
      const baseTuning={...loadEngineTuning()}; delete baseTuning.acousticProvider; delete baseTuning.neuralModelId;
      try{
        const decoded=[]; let configuredModels=[];
        for(let i=0;i<pairs.length;i++){
          setStatus(`Modelos ONNX: extrayendo features ${i+1}/${pairs.length}: ${pairs[i].audio.name}`);
          const audioData=await decodeFile(pairs[i].audio), cache=await prepareDecodedCache(audioData);
          if(!configuredModels.length && Array.isArray(cache.neuralModels)) configuredModels=cache.neuralModels;
          decoded.push({...pairs[i],cacheId:cache.cacheId,duration:audioData.duration,labText:await pairs[i].lab.text()});
        }
        const models=configuredModels.filter(m=>m.loaded);
        if(!models.length){showToast('No hay checkpoints ONNX cargados. Agrega vendor/ort.min.js, models/chord_models.json y los .onnx declarados.'); for(const x of decoded) await releaseCached(x.cacheId); return;}
        const byName=new Map(decoded.map(x=>[x.audio.name,x]));
        const train=split.train.map(x=>byName.get(x.audio.name)).filter(Boolean), validation=split.validation.map(x=>byName.get(x.audio.name)).filter(Boolean), test=split.test.map(x=>byName.get(x.audio.name)).filter(Boolean);
        try{
          const results=[];
          for(const m of models){
            for(const mode of ['onnx','ensemble']){
              const candidate={name:`${mode}-${m.id}`,tuning:{...baseTuning,acousticProvider:mode,neuralModelId:m.id}};
              setStatus(`A/B checkpoint ${m.name||m.id} · ${mode}`);
              const trainReport=await evaluateCandidate(candidate,train,'MODEL TRAIN');
              const validationReport=await evaluateCandidate(candidate,validation,'MODEL VALIDATION');
              const testReport=await evaluateCandidate(candidate,test,'MODEL TEST');
              results.push({modelId:m.id,modelName:m.name||m.id,mode,label:`${m.name||m.id} · ${mode}`,train:trainReport,validation:validationReport,test:testReport});
            }
          }
          renderModelBenchmark(results,{seed,trainSongs:train.length,validationSongs:validation.length,testSongs:test.length,split:{ratios,assignment:split.assignment},tuning:baseTuning,models:configuredModels});
          const available=results.filter(r=>r.validation.summary.songs>0).sort((a,b)=>b.validation.summary.score-a.validation.summary.score);
          showToast(available.length?`A/B modelos v62 terminado. Mejor: ${available[0].label}.`:'A/B modelos terminó sin checkpoints evaluables.');
        } finally {for(const x of decoded) await releaseCached(x.cacheId);}
      } finally {modelBtn.disabled=false;providerBtn.disabled=false;btn.disabled=false;depth.disabled=false;splitSel.disabled=false;setStatus('');}
    });


    function streamProfileLabel(p){return ({'mix':'MIX','mix-other':'MIX + OTHER','mix-other-bass':'MIX + OTHER + BASS','full':'MIX + OTHER + BASS + DRUMS'})[p]||p;}
    async function separateForBenchmark(file){
      const health=await fetchStemServiceHealth();
      if(!health.demucsAvailable) throw new Error('Demucs no está instalado en el backend.');
      const form=new FormData(); form.append('file',file,file.name);
      const response=await fetch('/api/v1/separate',{method:'POST',body:form});
      let payload=null; try{payload=await response.json();}catch(_){ }
      if(!response.ok) throw new Error(payload?.detail||`Separación falló (${response.status}).`);
      return payload;
    }
    async function buildMultiStreamCacheFromFile(file){
      const payload=await separateForBenchmark(file); const jobId=payload.jobId;
      try{
        const mix=await decodeAudioFile(file), targetLength=mix.samples.length, streams={mix:mix.samples};
        for(const role of ['other','bass','drums','vocals']){
          const url=payload.stems?.[role]; if(!url) continue;
          const d=await decodeAudioUrl(url); streams[role]=resampleMono(d.samples,d.sampleRate,mix.sampleRate,targetLength);
        }
        if(!streams.other||!streams.bass||!streams.drums) throw new Error('El benchmark multi-stream requiere OTHER, BASS y DRUMS.');
        const cache=await prepareMultiStreamCache(streams,mix.sampleRate,mix.duration);
        return {cache,duration:mix.duration,separation:{model:payload.model,device:payload.device}};
      } finally { await releaseStemJob(jobId); }
    }
    function renderStreamBenchmark(profileResults,tuningResult,meta){
      const sorted=[...profileResults].sort((a,b)=>(b.validation?.summary?.score??-1)-(a.validation?.summary?.score??-1));
      const winner=sorted[0]||null, tw=tuningResult?.winner||null;
      const cell=x=>Number.isFinite(Number(x))?`${(Number(x)*100).toFixed(1)}`:'—';
      streamPanel.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px;"><div><b>Benchmark multi-stream v62</b><br><span style="font-size:12px;color:var(--text-dim);">Separación única por canción · misma caché · TRAIN ${meta.trainSongs} / VAL ${meta.validationSongs} / TEST ${meta.testSongs}</span></div><div style="font-size:18px;color:var(--gold);font-weight:700;">VAL ganador: ${esc(winner?streamProfileLabel(winner.profile):'—')}</div></div>
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">Primero compara el aporte incremental de OTHER, BASS y DRUMS. Luego optimiza <code>otherHarmonyWeight</code> y <code>bassInversionThreshold</code> en TRAIN/VALIDATION y reporta TEST una sola vez.</div>
      <div style="overflow:auto;border:1px solid var(--line);border-radius:8px;"><table style="border-collapse:collapse;width:100%;font-size:12px;min-width:950px;"><thead><tr>${['Perfil','Train','Validation','TEST','CSR test','Raíz test','Boundary test','Key test'].map(x=>`<th style="padding:8px;text-align:left;border-bottom:1px solid var(--line);background:var(--panel);">${x}</th>`).join('')}</tr></thead><tbody>${sorted.map(r=>`<tr><td style="padding:8px;border-bottom:1px solid var(--line);"><b>${esc(streamProfileLabel(r.profile))}</b></td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.train?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.validation?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.test?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.csr)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.root)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.bf1)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.keyAcc)}</td></tr>`).join('')}</tbody></table></div>
      ${tw?`<div style="margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:8px;"><b>Tuning multi-stream ganador</b><div style="margin-top:6px;font-size:12px;color:var(--text-dim);">OTHER weight <b>${Number(tw.tuning.otherHarmonyWeight).toFixed(2)}</b> · Bass threshold <b>${Number(tw.tuning.bassInversionThreshold).toFixed(2)}</b> · VAL ${cell(tw.validation?.summary?.score)} · TEST ${cell(tuningResult.test?.summary?.score)}</div></div>`:''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">${tw?'<button class="btn-primary" id="applyStreamTuneBtn">✓ Aplicar tuning multi-stream</button>':''}<button class="btn-ghost" id="exportStreamBenchmarkBtn">⬇ JSON multi-stream</button></div>`;
      streamPanel.style.display='block';
      document.getElementById('applyStreamTuneBtn')?.addEventListener('click',()=>{saveEngineTuning({...loadEngineTuning(),...tw.tuning,streamProfile:'full'});showToast('Tuning multi-stream v62 aplicado.');});
      document.getElementById('exportStreamBenchmarkBtn')?.addEventListener('click',()=>downloadBlob(new Blob([JSON.stringify({schema:'chordsync-multistream-benchmark',schemaVersion:1,engine:'v62',createdAt:new Date().toISOString(),split:meta.split,separation:meta.separation,profileResults,tuningSearch:tuningResult},null,2)],{type:'application/json'}),'chordsync_multistream_ab_v62.json'));
    }

    streamBtn.addEventListener('click',async()=>{
      try{const h=await fetchStemServiceHealth();if(!h.demucsAvailable){showToast('Backend activo, pero Demucs no está instalado.');return;}streamInput.value='';streamInput.click();}
      catch(_){showToast('Para A/B multi-stream inicia ChordSync con: python server/start.py');}
    });
    streamInput.addEventListener('change',async()=>{
      const files=[...(streamInput.files||[])]; if(!files.length)return;
      const labs=new Map(),audios=[]; for(const f of files){if(LAB_EXT_RE.test(f.name))labs.set(baseName(f.name),f);else if(f.type.startsWith('audio/')||f.type.startsWith('video/')||AUDIO_EXT_RE.test(f.name))audios.push(f);}
      const pairs=audios.map(a=>({audio:a,lab:labs.get(baseName(a.name))})).filter(x=>x.lab);
      if(pairs.length<3){showToast('A/B multi-stream necesita al menos 3 pares audio + ground truth.');return;}
      streamBtn.disabled=true; modelBtn.disabled=true; providerBtn.disabled=true; btn.disabled=true; depth.disabled=true; splitSel.disabled=true;
      const seed=190906, ratios=splitSel.value.split(',').map(Number), split=deterministicSplit(pairs,ratios,seed), baseTuning={...loadEngineTuning()};
      try{
        const decoded=[]; let separationMeta=null;
        for(let i=0;i<pairs.length;i++){
          setStatus(`Multi-stream: separando y extrayendo ${i+1}/${pairs.length}: ${pairs[i].audio.name}`);
          const built=await buildMultiStreamCacheFromFile(pairs[i].audio); separationMeta=separationMeta||built.separation;
          decoded.push({...pairs[i],cacheId:built.cache.cacheId,duration:built.duration,labText:await pairs[i].lab.text()});
        }
        const byName=new Map(decoded.map(x=>[x.audio.name,x]));
        const train=split.train.map(x=>byName.get(x.audio.name)).filter(Boolean), validation=split.validation.map(x=>byName.get(x.audio.name)).filter(Boolean), test=split.test.map(x=>byName.get(x.audio.name)).filter(Boolean);
        try{
          const profiles=['mix','mix-other','mix-other-bass','full'], profileResults=[];
          for(let i=0;i<profiles.length;i++){
            const profile=profiles[i], candidate={name:streamProfileLabel(profile),tuning:{...baseTuning,streamProfile:profile}};
            setStatus(`A/B multi-stream ${i+1}/${profiles.length}: ${streamProfileLabel(profile)}`);
            profileResults.push({profile,train:await evaluateCandidate(candidate,train,'STREAM TRAIN'),validation:await evaluateCandidate(candidate,validation,'STREAM VAL'),test:await evaluateCandidate(candidate,test,'STREAM TEST')});
          }
          // Búsqueda compacta 4x4: TRAIN -> top 6 -> VALIDATION -> TEST ganador.
          const otherWeights=[.35,.50,.65,.80], bassThresholds=[.32,.42,.52,.62], candidates=[];
          for(const ow of otherWeights)for(const bt of bassThresholds)candidates.push({name:`ow${ow}-bt${bt}`,tuning:{...baseTuning,streamProfile:'full',otherHarmonyWeight:ow,bassInversionThreshold:bt}});
          const trained=[];
          for(let i=0;i<candidates.length;i++){setStatus(`Tuning streams TRAIN ${i+1}/${candidates.length}`);const r=await evaluateCandidate(candidates[i],train,'STREAM TUNE TRAIN');trained.push({...candidates[i],train:r});}
          const top=trained.sort((a,b)=>b.train.summary.score-a.train.summary.score).slice(0,6), validated=[];
          for(let i=0;i<top.length;i++){setStatus(`Tuning streams VALIDATION ${i+1}/${top.length}`);const r=await evaluateCandidate(top[i],validation,'STREAM TUNE VAL');validated.push({...top[i],validation:r});}
          validated.sort((a,b)=>b.validation.summary.score-a.validation.summary.score); const winner=validated[0]||null;
          const testReport=winner?await evaluateCandidate(winner,test,'STREAM TUNE TEST'):null;
          const tuningResult={grid:{otherHarmonyWeight:otherWeights,bassInversionThreshold:bassThresholds},winner,test:testReport,candidatesValidated:validated};
          renderStreamBenchmark(profileResults,tuningResult,{seed,trainSongs:train.length,validationSongs:validation.length,testSongs:test.length,split:{ratios,assignment:split.assignment},separation:separationMeta});
          showToast(winner?`Multi-stream v62 terminado. OTHER ${winner.tuning.otherHarmonyWeight.toFixed(2)} · bass ${winner.tuning.bassInversionThreshold.toFixed(2)}.`:'Benchmark multi-stream terminado.');
        } finally {for(const x of decoded) await releaseCached(x.cacheId);}
      } catch(err){console.error(err);showToast('Error A/B multi-stream: '+(err.message||err));}
      finally{streamBtn.disabled=false;modelBtn.disabled=false;providerBtn.disabled=false;btn.disabled=false;depth.disabled=false;splitSel.disabled=false;setStatus('');}
    });


    // ---------- Benchmark A/B de ritmo neural v62 ----------
    function parseBeatsTruth(text){
      const rows=[];
      for(const line of String(text||'').split(/\r?\n/)){
        const t=line.trim(); if(!t||t.startsWith('#'))continue;
        const parts=t.split(/\s+/); const time=Number(parts[0]), beatNum=Number(parts[1]);
        if(Number.isFinite(time)&&Number.isFinite(beatNum)) rows.push({time,beat_num:Math.max(1,Math.round(beatNum)),downbeat:Math.round(beatNum)===1});
      }
      return rows.sort((a,b)=>a.time-b.time);
    }
    function eventF1(pred,truth,tol){
      const used=new Set(); let tp=0,err=0;
      for(const p of pred){let bi=-1,bd=Infinity;for(let i=0;i<truth.length;i++){if(used.has(i))continue;const d=Math.abs(Number(p.time)-Number(truth[i].time));if(d<bd){bd=d;bi=i;}}if(bi>=0&&bd<=tol){used.add(bi);tp++;err+=bd;}}
      const precision=pred.length?tp/pred.length:0, recall=truth.length?tp/truth.length:0, f1=(precision+recall)?2*precision*recall/(precision+recall):0;
      return {precision,recall,f1,meanAbsoluteError:tp?err/tp:null,matches:tp,predicted:pred.length,truth:truth.length};
    }
    function rhythmTruthMetrics(analysis,truth){
      if(!truth?.length)return null;
      const map=analysis.beatMap||analysis.beats||[];
      const beat=eventF1(map,truth,.07);
      const pd=map.filter(x=>x.downbeat||Number(x.beat_num)===1), td=truth.filter(x=>x.downbeat);
      const downbeat=eventF1(pd,td,.10);
      const truthMeter=Math.max(...truth.map(x=>Number(x.beat_num)||0));
      return {beat,downbeat,truthMeter:truthMeter||null,meterCorrect:truthMeter?[3,4,6].includes(truthMeter)?Number(analysis.meter)===truthMeter:null:null};
    }
    function summarizeRhythmRows(rows){
      const chordRows=rows.map(r=>({status:r.status,duration:r.duration,evaluation:r.evaluation}));
      const chord=summary(chordRows);
      const rr=rows.filter(r=>r.status==='ok'&&r.rhythm);
      const beatF1=mean(rr,r=>r.rhythm.beat.f1), downbeatF1=mean(rr,r=>r.rhythm.downbeat.f1);
      const meterRows=rr.filter(r=>typeof r.rhythm.meterCorrect==='boolean');
      const meterAccuracy=meterRows.length?meterRows.filter(r=>r.rhythm.meterCorrect).length/meterRows.length:null;
      return {...chord,beatF1,downbeatF1,meterAccuracy,rhythmSongs:rr.length};
    }
    async function evaluateRhythmCandidate(candidate,corpus,phase){
      const rows=[];
      for(let i=0;i<corpus.length;i++){
        const x=corpus[i]; setStatus(`${phase} · ${candidate.name} · ${i+1}/${corpus.length}`);
        try{
          const analysis=await analyzeCached(x.cacheId,candidate.tuning);
          const evaluation=window.ChordSyncEvaluator.evaluateAnalysis(analysis,x.labText,{boundaryTolerance:.25});
          const rhythm=x.beatsTruth?.length?rhythmTruthMetrics(analysis,x.beatsTruth):null;
          rows.push({song:x.audio.name,status:'ok',duration:analysis.duration,evaluation,rhythm,resolved:analysis.decoderDiagnostics?.rhythmProviderResolved||null});
        }catch(err){rows.push({song:x.audio.name,status:'error',error:err.message||String(err)});}
      }
      return {rows,summary:summarizeRhythmRows(rows)};
    }
    function renderRhythmBenchmark(results,meta){
      const sorted=[...results].sort((a,b)=>(b.validation?.summary?.score??-1)-(a.validation?.summary?.score??-1));
      const winner=sorted[0]||null; const cell=x=>Number.isFinite(Number(x))?`${(Number(x)*100).toFixed(1)}`:'—';
      rhythmPanel.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px;"><div><b>Benchmark A/B de ritmo v62</b><br><span style="font-size:12px;color:var(--text-dim);">Accent vs BeatNet CRNN+PF vs ensemble · TRAIN ${meta.trainSongs} / VAL ${meta.validationSongs} / TEST ${meta.testSongs}</span></div><div style="font-size:18px;color:var(--gold);font-weight:700;">VAL ganador: ${esc(winner?.mode||'—')}</div></div>
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">Boundary/CSR siempre se miden con los .lab. Si incluyes archivos <code>.beats</code> con líneas <code>tiempo beat_num</code>, también se calculan Beat F1 ±70 ms, Downbeat F1 ±100 ms y exactitud de compás. TEST no se usa para elegir el ganador.</div>
      <div style="overflow:auto;border:1px solid var(--line);border-radius:8px;"><table style="border-collapse:collapse;width:100%;font-size:12px;min-width:980px;"><thead><tr>${['Modo','VAL score','TEST score','CSR test','Boundary test','Beat F1','Downbeat F1','Compás'].map(x=>`<th style="padding:8px;text-align:left;border-bottom:1px solid var(--line);background:var(--panel);">${x}</th>`).join('')}</tr></thead><tbody>${sorted.map(r=>`<tr><td style="padding:8px;border-bottom:1px solid var(--line);"><b>${esc(r.mode)}</b></td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.validation?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${cell(r.test?.summary?.score)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.csr)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.bf1)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.beatF1)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.downbeatF1)}</td><td style="padding:8px;border-bottom:1px solid var(--line);">${pct(r.test?.summary?.meterAccuracy)}</td></tr>`).join('')}</tbody></table></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">${winner?'<button class="btn-primary" id="applyRhythmWinnerBtn">✓ Aplicar ritmo ganador</button>':''}<button class="btn-ghost" id="exportRhythmBenchmarkBtn">⬇ JSON ritmo</button></div>`;
      rhythmPanel.style.display='block';
      document.getElementById('applyRhythmWinnerBtn')?.addEventListener('click',()=>{saveEngineTuning({...loadEngineTuning(),rhythmProvider:winner.mode});showToast(`Proveedor de ritmo ${winner.mode} aplicado.`);});
      document.getElementById('exportRhythmBenchmarkBtn')?.addEventListener('click',()=>downloadBlob(new Blob([JSON.stringify({schema:'chordsync-rhythm-provider-benchmark',schemaVersion:1,engine:'v62',createdAt:new Date().toISOString(),split:meta.split,beatAnnotations:meta.beatAnnotations,winnerByValidation:winner?.mode||null,results},null,2)],{type:'application/json'}),'chordsync_rhythm_ab_v62.json'));
    }
    rhythmBtn.addEventListener('click',async()=>{
      try{const h=await fetchStemServiceHealth();if(!h.beatnetAvailable){showToast('Backend activo, pero BeatNet no está instalado. Usa server/requirements-neural-rhythm.txt');return;}rhythmInput.value='';rhythmInput.click();}
      catch(_){showToast('Para A/B neuronal inicia ChordSync con: python server/start.py');}
    });
    rhythmInput.addEventListener('change',async()=>{
      const files=[...(rhythmInput.files||[])]; if(!files.length)return;
      const labs=new Map(),beatsFiles=new Map(),audios=[];
      const rb=n=>String(n||'').replace(/\.(beats|lab|txt|mp3|wav|wave|aiff|aif|m4a|aac|ogg|opus|flac|webm|mp4|mov)$/i,'').replace(/(?:[_ .-](?:ground[_ -]?truth|truth|gt|chords?|annotations?|beats?))$/i,'').trim().toLowerCase();
      for(const f of files){if(/\.beats$/i.test(f.name))beatsFiles.set(rb(f.name),f);else if(LAB_EXT_RE.test(f.name))labs.set(rb(f.name),f);else if(f.type.startsWith('audio/')||AUDIO_EXT_RE.test(f.name))audios.push(f);}
      const pairs=audios.map(a=>({audio:a,lab:labs.get(rb(a.name)),beats:beatsFiles.get(rb(a.name))})).filter(x=>x.lab);
      if(pairs.length<3){showToast('A/B ritmo necesita al menos 3 pares audio + .lab; los .beats son opcionales.');return;}
      rhythmBtn.disabled=true;streamBtn.disabled=true;modelBtn.disabled=true;providerBtn.disabled=true;btn.disabled=true;depth.disabled=true;splitSel.disabled=true;
      const seed=230906,ratios=splitSel.value.split(',').map(Number),split=deterministicSplit(pairs,ratios,seed),baseTuning={...loadEngineTuning()};
      try{
        const decoded=[];
        for(let i=0;i<pairs.length;i++){
          setStatus(`Ritmo neural: preparando ${i+1}/${pairs.length}: ${pairs[i].audio.name}`);
          const d=await decodeFile(pairs[i].audio);
          const rhythmAnalysis=await fetchNeuralRhythm(pairs[i].audio,{...baseTuning,rhythmProvider:'neural'},{status:false});
          if(!rhythmAnalysis) throw new Error(`BeatNet no devolvió análisis para ${pairs[i].audio.name}`);
          const cache=await prepareDecodedCache(d,rhythmAnalysis);
          decoded.push({...pairs[i],cacheId:cache.cacheId,duration:d.duration,labText:await pairs[i].lab.text(),beatsTruth:pairs[i].beats?parseBeatsTruth(await pairs[i].beats.text()):null});
        }
        const byName=new Map(decoded.map(x=>[x.audio.name,x]));
        const train=split.train.map(x=>byName.get(x.audio.name)).filter(Boolean),validation=split.validation.map(x=>byName.get(x.audio.name)).filter(Boolean),test=split.test.map(x=>byName.get(x.audio.name)).filter(Boolean);
        try{
          const results=[];
          for(const mode of ['accent','neural','ensemble']){
            const candidate={name:mode,tuning:{...baseTuning,rhythmProvider:mode}};
            results.push({mode,train:await evaluateRhythmCandidate(candidate,train,'RHYTHM TRAIN'),validation:await evaluateRhythmCandidate(candidate,validation,'RHYTHM VAL'),test:await evaluateRhythmCandidate(candidate,test,'RHYTHM TEST')});
          }
          renderRhythmBenchmark(results,{trainSongs:train.length,validationSongs:validation.length,testSongs:test.length,split:{ratios,assignment:split.assignment},beatAnnotations:decoded.filter(x=>x.beatsTruth?.length).length});
          showToast('A/B de ritmo v62 terminado.');
        }finally{for(const x of decoded)await releaseCached(x.cacheId);}
      }catch(err){console.error(err);showToast('Error A/B ritmo: '+(err.message||err));}
      finally{rhythmBtn.disabled=false;streamBtn.disabled=false;modelBtn.disabled=false;providerBtn.disabled=false;btn.disabled=false;depth.disabled=false;splitSel.disabled=false;setStatus('');}
    });


  })();

  // ---------- Nashville ----------
  $('nashvilleToggle').addEventListener('change', (e) => {
    showNashville = e.target.checked;
    if (analysisResult) { buildTimeline(); updateDisplay(audioElement ? audioElement.currentTime : 0); }
  });
  $('chordLevelSelect')?.addEventListener('change', (e) => {
    chordDisplayLevel = ['easy','medium','advanced'].includes(e.target.value) ? e.target.value : 'medium';
    lastDiagramChord = null;
    if (analysisResult) { buildTimeline(); updateDisplay(audioElement ? audioElement.currentTime : 0); }
  });

  // ---------- exportar ----------
  $('exportJsonBtn').addEventListener('click', () => {
    if (!analysisResult) { showToast('No hay análisis para exportar'); return; }
    const data = {
      schema: 'chordsync-analysis',
      schemaVersion: 59,
      ...analysisResult,
      segments: analysisResult.segments.map(seg => ({ ...seg })),
      exportedAt: new Date().toISOString(),
      app: 'ChordSync Pro',
      version: '62.0'
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
  if (runtime.mode === 'pages') {
    const notice=document.createElement('div');
    notice.style.cssText='max-width:1180px;margin:12px auto;padding:10px 16px;border:1px solid rgba(212,168,79,.35);border-radius:10px;color:#d4a84f;background:rgba(212,168,79,.08);font-size:13px;text-align:center';
    notice.textContent='Edición web · análisis HPCP dentro del navegador · no usa Madmom ni sube tu audio';
    const main=document.querySelector('main');
    if(main) main.insertBefore(notice,main.firstChild);
    if(autoStemBtn){autoStemBtn.disabled=true;autoStemBtn.title='Disponible en la edición de escritorio';}
  }
})();
