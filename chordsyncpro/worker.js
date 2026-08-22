// ChordSync Pro — worker de análisis
// Corre Essentia.js en un Web Worker separado, con UNA instancia persistente que nunca se destruye.
// El bug del archivo original era llamar essentia.delete() (que destruye TODA la instancia de Essentia)
// después de cada análisis — aquí solo se liberan los vectores temporales de cada llamada, nunca la instancia.

// El bundle de Essentia (essentia-wasm.web.js) fue compilado para navegador con detección de entorno
// fija (asume que SIEMPRE hay `document`/`window`, sin chequeo real de si está en un Worker). Dentro de
// un Worker esos globals no existen y el simple hecho de importar el script lanzaba
// "ReferenceError: document is not defined", abortando toda la carga en silencio.
// Este shim los simula como alias del propio contexto del Worker (self) para que esas referencias
// no truenen, sin alterar el resto del comportamiento.
if (typeof window === 'undefined') { self.window = self; }
if (typeof document === 'undefined') {
  self.document = { currentScript: null, title: '', createElement: function () { return {}; } };
}

importScripts('essentia-wasm.web.js', 'essentia.js-core.js');

let essentia = null;
let ready = false;

EssentiaWASM().then((wasmModule) => {
  essentia = new Essentia(wasmModule);
  ready = true;
  postMessage({ type: 'ready', version: essentia.version });
}).catch((err) => {
  postMessage({ type: 'error', message: 'No se pudo inicializar Essentia: ' + err.message });
});

function vectorToArray(vector) {
  const arr = [];
  for (let i = 0; i < vector.size(); i++) arr.push(vector.get(i));
  return arr;
}

// Heurística de compás — EXPERIMENTAL. Cuenta cuántos pulsos caen cerca del inicio de compás
// para 3/4, 4/4 y 6/8, y elige el de mayor puntaje. No es un detector robusto de métrica.
function estimateMeterFromBeats(beats) {
  if (!beats || beats.length < 4) return null;
  const intervals = [];
  for (let i = 1; i < beats.length; i++) intervals.push(beats[i] - beats[i - 1]);
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  const candidates = [3, 4, 6];
  let bestMeter = 4, bestScore = 0;
  for (const m of candidates) {
    const measureInterval = avgInterval * m;
    let score = 0;
    for (let i = 0; i < beats.length; i++) {
      const posInMeasure = (beats[i] % measureInterval) / measureInterval;
      if (posInMeasure < 0.15 || posInMeasure > 0.85) score += 2;
      else if (posInMeasure < 0.4 || posInMeasure > 0.6) score += 1;
    }
    if (score > bestScore) { bestScore = score; bestMeter = m; }
  }
  return bestMeter;
}

// Agrupa la progresión cuadro-a-cuadro de acordes en segmentos de tiempo con inicio/fin/fuerza.
function buildChordTimeline(chords, strengths, sampleRate, hopSize) {
  const segments = [];
  const hopTime = hopSize / sampleRate;
  let currentChord = null, startTime = 0, avgStrength = 0, count = 0;

  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    const strength = strengths[i] || 0;
    const time = i * hopTime;

    if (chord !== currentChord) {
      if (currentChord !== null && currentChord !== 'N' && currentChord !== 'X') {
        segments.push({
          chord: currentChord,
          start: parseFloat(startTime.toFixed(2)),
          end: parseFloat(time.toFixed(2)),
          strength: parseFloat((avgStrength / count).toFixed(3)),
          confidence: parseFloat(Math.min((avgStrength / count) * 2, 1).toFixed(2)),
        });
      }
      currentChord = chord;
      startTime = time;
      avgStrength = 0;
      count = 0;
    }
    avgStrength += Math.abs(strength);
    count++;
  }
  if (currentChord !== null && currentChord !== 'N' && currentChord !== 'X') {
    segments.push({
      chord: currentChord,
      start: parseFloat(startTime.toFixed(2)),
      end: parseFloat((chords.length * hopTime).toFixed(2)),
      strength: parseFloat((avgStrength / count).toFixed(3)),
      confidence: parseFloat(Math.min((avgStrength / count) * 2, 1).toFixed(2)),
    });
  }

  // fusiona segmentos espurios muy cortos (< 0.35s, típicamente errores de detección de un cuadro) con el anterior
  const MIN_SEG = 0.35;
  const merged = [];
  segments.forEach((seg) => {
    const dur = seg.end - seg.start;
    if (merged.length && dur < MIN_SEG) merged[merged.length - 1].end = seg.end;
    else merged.push(seg);
  });
  return merged;
}

// ---------- Análisis de archivo completo ----------
function handleAnalyzeFile(id, audioData, sampleRate, duration) {
  postMessage({ type: 'progress', message: 'Preparando el audio…' });
  const audioVector = essentia.arrayToVector(audioData);

  postMessage({ type: 'progress', message: 'Detectando tonalidad y progresión de acordes…' });
  const tonal = essentia.TonalExtractor(audioVector, 4096, 2048, 440);
  const keyResult = essentia.KeyExtractor(audioVector, true, 4096, 4096, 12, 3500, 60, 25, 0.2, 'bgate', sampleRate, 0.0001, 440, 'cosine', 'hann');

  postMessage({ type: 'progress', message: 'Detectando tempo (BPM)…' });
  let bpm = null;
  try {
    // BUG corregido: la firma real de PercivalBpmEstimator es
    // (signal, frameSize, frameSizeOSS, hopSize, hopSizeOSS, maxBPM, minBPM, sampleRate).
    // La llamada anterior pasaba los argumentos en un orden equivocado — en particular,
    // minBPM llegaba con el valor 48000 (¡el sample rate, no un BPM!) y maxBPM con 320,
    // así que minBPM > maxBPM y el algoritmo no podía devolver ningún tempo válido, fallando
    // en silencio dentro de este try/catch. Ahora se usan los valores por defecto correctos.
    const bpmResult = essentia.PercivalBpmEstimator(audioVector, 1024, 2048, 128, 128, 210, 50, sampleRate);
    bpm = parseFloat(bpmResult.bpm.toFixed(1));
  } catch (bpmErr) { /* seguimos sin bpm si falla */ }

  postMessage({ type: 'progress', message: 'Estimando compás (experimental)…' });
  let meter = null;
  try {
    const rhythm = essentia.RhythmExtractor2013(audioVector, 1024, 1024, 256, 0.1, 208, 40, 1024, sampleRate, [], 0.24, true, true);
    const beats = vectorToArray(rhythm.ticks);
    meter = estimateMeterFromBeats(beats);
    try { rhythm.ticks.delete(); } catch (e) {}
  } catch (meterErr) { /* opcional */ }

  postMessage({ type: 'progress', message: 'Construyendo la línea de tiempo de acordes…' });
  const rawChords = vectorToArray(tonal.chords_progression);
  const rawStrengths = vectorToArray(tonal.chords_strength);
  const segments = buildChordTimeline(rawChords, rawStrengths, sampleRate, 2048);

  const result = {
    key: tonal.key_key || keyResult.key,
    scale: tonal.key_scale || keyResult.scale,
    strength: keyResult.strength ? parseFloat(keyResult.strength.toFixed(3)) : null,
    bpm,
    meter,
    duration: parseFloat(duration.toFixed(2)),
    sampleRate,
    segments,
    totalChords: new Set(rawChords.filter((c) => c !== 'N' && c !== 'X')).size,
  };

  // liberar SOLO los vectores temporales de esta llamada — nunca `essentia` en sí
  try { audioVector.delete(); } catch (e) {}
  try { tonal.chords_progression.delete(); } catch (e) {}
  try { tonal.chords_strength.delete(); } catch (e) {}

  postMessage({ type: 'fileResult', id, result });
}

// ---------- Análisis de un fragmento en vivo (micrófono) ----------
function handleAnalyzeLiveChunk(id, audioData, sampleRate) {
  const audioVector = essentia.arrayToVector(audioData);
  const tonal = essentia.TonalExtractor(audioVector, 2048, 1024, 440);
  const chords = vectorToArray(tonal.chords_progression);
  const strengths = vectorToArray(tonal.chords_strength);

  // acorde más frecuente del fragmento, ponderado por fuerza de detección
  const scores = {};
  chords.forEach((c, i) => {
    if (c === 'N' || c === 'X') return;
    scores[c] = (scores[c] || 0) + Math.abs(strengths[i] || 0);
  });
  let bestChord = 'N', bestScore = 0;
  Object.keys(scores).forEach((c) => { if (scores[c] > bestScore) { bestScore = scores[c]; bestChord = c; } });

  try { audioVector.delete(); } catch (e) {}
  try { tonal.chords_progression.delete(); } catch (e) {}
  try { tonal.chords_strength.delete(); } catch (e) {}

  postMessage({ type: 'liveResult', id, chord: bestChord, key: tonal.key_key, scale: tonal.key_scale });
}

onmessage = (e) => {
  const msg = e.data;
  if (!ready) {
    postMessage({ type: 'error', id: msg.id, message: 'Essentia todavía no está listo — intenta de nuevo en un segundo.' });
    return;
  }
  try {
    if (msg.type === 'analyzeFile') handleAnalyzeFile(msg.id, msg.samples, msg.sampleRate, msg.duration);
    else if (msg.type === 'analyzeLiveChunk') handleAnalyzeLiveChunk(msg.id, msg.samples, msg.sampleRate);
  } catch (err) {
    postMessage({ type: 'error', id: msg.id, message: err.message || String(err) });
  }
};
