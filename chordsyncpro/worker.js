// ChordSync Pro — Analysis Engine v62
// Fase 8H: persistencia temporal context-aware por beat/downbeat y novedad armónica.
// Esta versión funciona sin modelo externo (fallback HPCP) y activa ONNX automáticamente cuando existen:
//   vendor/ort.min.js
//   models/chord_model.json
//   models/chord_model.onnx
// El benchmark interno compara motores entre sí; NO sustituye una evaluación contra ground truth etiquetado.

if (typeof window === 'undefined') { self.window = self; }
if (typeof document === 'undefined') {
  self.document = { currentScript: null, title: '', createElement: function () { return {}; } };
}

importScripts('essentia-wasm.web.js', 'essentia.js-core.js');

let essentia = null;
let ready = false;

// v56: usa la transcripción neuronal multi-pitch opcional (Basic Pitch) tanto antes del Viterbi como después para verificar inversiones y voicings observados.
const analysisFeatureCache = new Map();
let analysisCacheCounter = 0;


// ---------------- Configuración ajustable del decodificador (v56) ----------------
const DEFAULT_TUNING = Object.freeze({
  ensembleNeuralWeight: 0.72,
  viterbiStayReward: 0.62,
  viterbiChangePenalty: 0.58,
  viterbiDistanceWeight: 0.30,
  functionalMotionBonus: 0.14,
  keyPriorStrength: 0.42,
  noveltyWeight: 0.82,
  noveltyThreshold: 0.24,
  beatSnapRatio: 0.28,
  beatSnapMax: 0.22,
  halfBeatSnapRatio: 0.20,
  halfBeatSnapMax: 0.14,
  otherHarmonyWeight: 0.58,
  otherAdaptiveStrength: 0.62,
  otherWeightFloor: 0.14,
  otherWeightCeil: 0.92,
  bassInversionWeight: 0.55,
  bassInversionThreshold: 0.46,
  bassTemporalWindow: 0.42,
  bassStabilityWeight: 0.68,
  bassBoundaryGuard: 0.10,
  drumsBeatWeight: 0.66,
  beatFusionMaxOffsetRatio: 0.24,
  beatFusionMaxOffset: 0.16,
  beatFusionMinAgreement: 0.45,
  downbeatDrumsWeight: 0.72,
  downbeatMinConfidence: 0.16,
  meterFourPrior: 0.12,
  meterThreePrior: 0.035,
  meterSixPrior: 0.0,
  neuralRhythmWeight: 0.78,
  neuralBeatSnapMax: 0.14,
  neuralRhythmMinConfidence: 0.28,
  backendChordWeight: 0.76,
  backendChordMinConfidence: 0.42,
  extensionMinConfidence: 0.56,
  extensionExactSupport: 0.34,
  extensionFamilyMargin: 0.08,
  alteredChordMinConfidence: 0.70,
  hierarchicalRootWeight: 1.35,
  hierarchicalTriadWeight: 1.10,
  hierarchicalSeventhWeight: 0.78,
  hierarchicalExtensionWeight: 0.58,
  hierarchicalExactWeight: 0.66,
  hierarchicalComplexityPenalty: 0.10,
  hierarchicalMinGain: 0.10,
  multiHeadWeight: 0.80,
  multiHeadMinConfidence: 0.26,
  functionalPriorWeight: 0.16,
  functionalPriorMaxBonus: 0.24,
  functionalPriorMaxPenalty: 0.30,
  functionalPriorMinKeyConfidence: 0.22,
  functionalDistanceWeight: 0.14,
  functionalDistanceMaxBonus: 0.20,
  functionalDistanceMaxPenalty: 0.18,
  voiceLeadingWeight: 0.12,
  voiceLeadingMaxBonus: 0.16,
  voiceLeadingMaxPenalty: 0.18,
  voiceLeadingCommonToneWeight: 0.55,
  voiceLeadingBassWeight: 0.18,
  voicingLeadingWeight: 0.10,
  voicingLeadingMaxBonus: 0.14,
  voicingLeadingMaxPenalty: 0.16,
  voicingBassRegisterWeight: 0.34,
  voicingUpperRegisterWeight: 0.66,
  voicingCommonToneWeight: 0.24,
  voicingLeapPenaltyWeight: 0.22,
  voicingMaxLeapSemitones: 7,
  transcriptionBassMinConfidence: 0.56,
  transcriptionBassMinCoverage: 0.34,
  transcriptionInversionOverrideMargin: 0.12,
  transcriptionVoicingMinConfidence: 0.32,
  transcriptionMaxVoicingNotes: 5,
  transcriptionHarmonyWeight: 0.24,
  transcriptionHarmonyMinConfidence: 0.24,
  transcriptionHarmonyBassWeight: 0.16,
  transcriptionHarmonyExtraNotePenalty: 0.28,
  // v56: fusión directa de Basic Pitch con las heads factorized del modelo multi-head.
  transcriptionHeadWeight: 0.34,
  transcriptionHeadMinConfidence: 0.22,
  transcriptionRootHeadWeight: 0.44,
  transcriptionTriadHeadWeight: 0.34,
  transcriptionSeventhHeadWeight: 0.24,
  transcriptionExtensionHeadWeight: 0.18,
  transcriptionBassHeadWeight: 0.52,
  // v56: dinámica temporal independiente por head. Bajo/raíz reaccionan rápido; séptima/extensión exigen persistencia.
  transcriptionRootPersistenceMs: 90,
  transcriptionTriadPersistenceMs: 120,
  transcriptionSeventhPersistenceMs: 190,
  transcriptionExtensionPersistenceMs: 280,
  transcriptionBassPersistenceMs: 65,
  transcriptionSeventhMinDwellMs: 110,
  transcriptionExtensionMinDwellMs: 180,
  transcriptionTemporalBlend: 0.72,
  // v62: el suavizado se relaja cerca de beats/downbeats o cambios armónicos fuertes.
  transcriptionContextAware: true,
  transcriptionBeatRelease: 0.42,
  transcriptionDownbeatRelease: 0.62,
  transcriptionNoveltyRelease: 0.70,
  transcriptionContextMinRadiusRatio: 0.28,
  // v62: selección automática de pipeline por canción.
  pipelinePolicy: 'auto-v62',
  releaseProfile: 'rc1-balanced',
  pipelineMinProviderScore: 0.16,
  pipelineEnsembleMargin: 0.10,
  pipelineOtherMinConfidence: 0.22,
  pipelineBassMinConfidence: 0.18,
  pipelineDrumsQualityMargin: -0.03,
  modulationWindowBeats: 16,
  modulationStepBeats: 4,
  modulationChangePenalty: 0.72,
  modulationMinConfidence: 0.44,
  modulationMinDurationBeats: 6,
  modulationGlobalKeyBias: 0.10,
  sectionMinBars: 4,
  sectionMaxBars: 16,
  sectionSimilarityThreshold: 0.76,
  sectionMinRepeatGapBars: 2,
  sectionRepeatConfidenceFloor: 0.50,
  sectionRepeatDonorConfidence: 0.72,
  sectionRepeatMinAcousticSupport: 0.18,
  sectionRepeatBoost: 0.16,
  semanticSectionMinConfidence: 0.44,
  semanticChorusEnergyBias: 0.58,
  semanticVocalWeight: 0.70,
  semanticRepeatWeight: 0.78,
  semanticBridgeNoveltyWeight: 0.66,
  semanticSoloVocalMax: 0.30,
  structureNeuralWeight: 0.76,
  structureNeuralMinConfidence: 0.46,
  structureBoundaryNeuralWeight: 0.78,
  structureBoundaryMinConfidence: 0.55,
  structureBoundaryStrongConfidence: 0.72,
  structureBoundaryMaxOffset: 1.50,
  structureBoundaryMinSectionDuration: 4.0,
  structureSequenceContextWeight: 0.28,
  structureRepeatContextWeight: 0.26
});
function tuningConfig(overrides) {
  const o = overrides && typeof overrides === 'object' ? overrides : {};
  const c = { ...DEFAULT_TUNING };
  for (const k of Object.keys(c)) {
    const v = Number(o[k]);
    if (Number.isFinite(v)) c[k] = v;
  }
  c.ensembleNeuralWeight = clamp(c.ensembleNeuralWeight, 0, 1);
  c.viterbiStayReward = clamp(c.viterbiStayReward, 0, 2);
  c.viterbiChangePenalty = clamp(c.viterbiChangePenalty, 0, 2);
  c.viterbiDistanceWeight = clamp(c.viterbiDistanceWeight, 0, 1.5);
  c.functionalMotionBonus = clamp(c.functionalMotionBonus, 0, 0.8);
  c.keyPriorStrength = clamp(c.keyPriorStrength, 0, 1.5);
  c.noveltyWeight = clamp(c.noveltyWeight, 0, 1);
  c.noveltyThreshold = clamp(c.noveltyThreshold, 0.05, 0.9);
  c.beatSnapRatio = clamp(c.beatSnapRatio, 0, 0.6);
  c.beatSnapMax = clamp(c.beatSnapMax, 0.03, 0.5);
  c.halfBeatSnapRatio = clamp(c.halfBeatSnapRatio, 0, 0.5);
  c.halfBeatSnapMax = clamp(c.halfBeatSnapMax, 0.03, 0.35);
  c.otherHarmonyWeight = clamp(c.otherHarmonyWeight, 0, 1);
  c.otherAdaptiveStrength = clamp(c.otherAdaptiveStrength, 0, 1.5);
  c.otherWeightFloor = clamp(c.otherWeightFloor, 0, 0.49);
  c.otherWeightCeil = clamp(c.otherWeightCeil, 0.51, 1);
  if (c.otherWeightFloor > c.otherWeightCeil - 0.05) c.otherWeightFloor = Math.max(0, c.otherWeightCeil - 0.05);
  c.bassInversionWeight = clamp(c.bassInversionWeight, 0, 1);
  c.bassInversionThreshold = clamp(c.bassInversionThreshold, 0.15, 0.95);
  c.bassTemporalWindow = clamp(c.bassTemporalWindow, 0.10, 1.50);
  c.bassStabilityWeight = clamp(c.bassStabilityWeight, 0, 1);
  c.bassBoundaryGuard = clamp(c.bassBoundaryGuard, 0, 0.35);
  c.drumsBeatWeight = clamp(c.drumsBeatWeight, 0, 1);
  c.beatFusionMaxOffsetRatio = clamp(c.beatFusionMaxOffsetRatio, 0.05, 0.5);
  c.beatFusionMaxOffset = clamp(c.beatFusionMaxOffset, 0.04, 0.35);
  c.beatFusionMinAgreement = clamp(c.beatFusionMinAgreement, 0.10, 0.95);
  c.downbeatDrumsWeight = clamp(c.downbeatDrumsWeight, 0, 1);
  c.downbeatMinConfidence = clamp(c.downbeatMinConfidence, 0.02, 0.8);
  c.meterFourPrior = clamp(c.meterFourPrior, 0, 0.5);
  c.meterThreePrior = clamp(c.meterThreePrior, 0, 0.3);
  c.meterSixPrior = clamp(c.meterSixPrior, 0, 0.3);
  c.neuralRhythmWeight = clamp(c.neuralRhythmWeight, 0, 1);
  c.neuralBeatSnapMax = clamp(c.neuralBeatSnapMax, 0.03, 0.35);
  c.neuralRhythmMinConfidence = clamp(c.neuralRhythmMinConfidence, 0.05, 0.95);
  c.backendChordWeight = clamp(c.backendChordWeight, 0, 1);
  c.backendChordMinConfidence = clamp(c.backendChordMinConfidence, 0.05, 0.99);
  c.functionalPriorWeight = clamp(c.functionalPriorWeight, 0, 0.8);
  c.functionalPriorMaxBonus = clamp(c.functionalPriorMaxBonus, 0, 1.0);
  c.functionalPriorMaxPenalty = clamp(c.functionalPriorMaxPenalty, 0, 1.2);
  c.functionalPriorMinKeyConfidence = clamp(c.functionalPriorMinKeyConfidence, 0, 0.95);
  c.functionalDistanceWeight = clamp(c.functionalDistanceWeight, 0, 0.8);
  c.functionalDistanceMaxBonus = clamp(c.functionalDistanceMaxBonus, 0, 0.8);
  c.functionalDistanceMaxPenalty = clamp(c.functionalDistanceMaxPenalty, 0, 0.8);
  c.voiceLeadingWeight = clamp(c.voiceLeadingWeight, 0, 0.8);
  c.voiceLeadingMaxBonus = clamp(c.voiceLeadingMaxBonus, 0, 0.8);
  c.voiceLeadingMaxPenalty = clamp(c.voiceLeadingMaxPenalty, 0, 0.8);
  c.voiceLeadingCommonToneWeight = clamp(c.voiceLeadingCommonToneWeight, 0, 1.5);
  c.voiceLeadingBassWeight = clamp(c.voiceLeadingBassWeight, 0, 1.0);
  c.voicingLeadingWeight = clamp(c.voicingLeadingWeight, 0, 0.8);
  c.voicingLeadingMaxBonus = clamp(c.voicingLeadingMaxBonus, 0, 0.8);
  c.voicingLeadingMaxPenalty = clamp(c.voicingLeadingMaxPenalty, 0, 0.8);
  c.voicingBassRegisterWeight = clamp(c.voicingBassRegisterWeight, 0, 1.5);
  c.voicingUpperRegisterWeight = clamp(c.voicingUpperRegisterWeight, 0, 1.5);
  c.voicingCommonToneWeight = clamp(c.voicingCommonToneWeight, 0, 1.5);
  c.voicingLeapPenaltyWeight = clamp(c.voicingLeapPenaltyWeight, 0, 1.5);
  c.voicingMaxLeapSemitones = clamp(c.voicingMaxLeapSemitones, 2, 18);
  c.transcriptionBassMinConfidence = clamp(c.transcriptionBassMinConfidence, 0.05, 0.99);
  c.transcriptionBassMinCoverage = clamp(c.transcriptionBassMinCoverage, 0.02, 1.0);
  c.transcriptionInversionOverrideMargin = clamp(c.transcriptionInversionOverrideMargin, 0, 0.5);
  c.transcriptionVoicingMinConfidence = clamp(c.transcriptionVoicingMinConfidence, 0.05, 0.95);
  c.transcriptionMaxVoicingNotes = Math.round(clamp(c.transcriptionMaxVoicingNotes, 2, 8));
  c.transcriptionHarmonyWeight = clamp(c.transcriptionHarmonyWeight, 0, 0.75);
  c.transcriptionHarmonyMinConfidence = clamp(c.transcriptionHarmonyMinConfidence, 0.02, 0.95);
  c.transcriptionHarmonyBassWeight = clamp(c.transcriptionHarmonyBassWeight, 0, 0.8);
  c.transcriptionHarmonyExtraNotePenalty = clamp(c.transcriptionHarmonyExtraNotePenalty, 0, 1.2);
  c.transcriptionHeadWeight = clamp(c.transcriptionHeadWeight, 0, 0.85);
  c.transcriptionHeadMinConfidence = clamp(c.transcriptionHeadMinConfidence, 0.02, 0.95);
  c.transcriptionRootHeadWeight = clamp(c.transcriptionRootHeadWeight, 0, 1);
  c.transcriptionTriadHeadWeight = clamp(c.transcriptionTriadHeadWeight, 0, 1);
  c.transcriptionSeventhHeadWeight = clamp(c.transcriptionSeventhHeadWeight, 0, 1);
  c.transcriptionExtensionHeadWeight = clamp(c.transcriptionExtensionHeadWeight, 0, 1);
  c.transcriptionBassHeadWeight = clamp(c.transcriptionBassHeadWeight, 0, 1);
  c.transcriptionRootPersistenceMs = clamp(c.transcriptionRootPersistenceMs, 0, 800);
  c.transcriptionTriadPersistenceMs = clamp(c.transcriptionTriadPersistenceMs, 0, 900);
  c.transcriptionSeventhPersistenceMs = clamp(c.transcriptionSeventhPersistenceMs, 0, 1200);
  c.transcriptionExtensionPersistenceMs = clamp(c.transcriptionExtensionPersistenceMs, 0, 1600);
  c.transcriptionBassPersistenceMs = clamp(c.transcriptionBassPersistenceMs, 0, 500);
  c.transcriptionSeventhMinDwellMs = clamp(c.transcriptionSeventhMinDwellMs, 0, 800);
  c.transcriptionExtensionMinDwellMs = clamp(c.transcriptionExtensionMinDwellMs, 0, 1200);
  c.transcriptionTemporalBlend = clamp(c.transcriptionTemporalBlend, 0, 1);
  c.modulationWindowBeats = clamp(c.modulationWindowBeats, 4, 64);
  c.modulationStepBeats = clamp(c.modulationStepBeats, 1, 16);
  c.modulationChangePenalty = clamp(c.modulationChangePenalty, 0, 2.5);
  c.modulationMinConfidence = clamp(c.modulationMinConfidence, 0.05, 0.95);
  c.modulationMinDurationBeats = clamp(c.modulationMinDurationBeats, 1, 32);
  c.modulationGlobalKeyBias = clamp(c.modulationGlobalKeyBias, 0, 0.8);
  c.sectionMinBars = Math.round(clamp(c.sectionMinBars, 2, 16));
  c.sectionMaxBars = Math.round(clamp(c.sectionMaxBars, c.sectionMinBars, 32));
  c.sectionSimilarityThreshold = clamp(c.sectionSimilarityThreshold, 0.45, 0.98);
  c.sectionMinRepeatGapBars = Math.round(clamp(c.sectionMinRepeatGapBars, 0, 16));
  c.sectionRepeatConfidenceFloor = clamp(c.sectionRepeatConfidenceFloor, 0.05, 0.95);
  c.sectionRepeatDonorConfidence = clamp(c.sectionRepeatDonorConfidence, 0.20, 0.99);
  c.sectionRepeatMinAcousticSupport = clamp(c.sectionRepeatMinAcousticSupport, 0.01, 0.80);
  c.sectionRepeatBoost = clamp(c.sectionRepeatBoost, 0, 0.50);
  c.semanticSectionMinConfidence = clamp(c.semanticSectionMinConfidence, 0.20, 0.90);
  c.semanticChorusEnergyBias = clamp(c.semanticChorusEnergyBias, 0.20, 1.20);
  c.semanticVocalWeight = clamp(c.semanticVocalWeight, 0, 1.5);
  c.semanticRepeatWeight = clamp(c.semanticRepeatWeight, 0, 1.5);
  c.semanticBridgeNoveltyWeight = clamp(c.semanticBridgeNoveltyWeight, 0, 1.5);
  c.semanticSoloVocalMax = clamp(c.semanticSoloVocalMax, 0.05, 0.70);
  c.structureNeuralWeight = clamp(c.structureNeuralWeight, 0, 1);
  c.structureNeuralMinConfidence = clamp(c.structureNeuralMinConfidence, 0.20, 0.95);
  c.structureBoundaryNeuralWeight = clamp(c.structureBoundaryNeuralWeight, 0, 1);
  c.structureBoundaryMinConfidence = clamp(c.structureBoundaryMinConfidence, 0.20, 0.95);
  c.structureBoundaryStrongConfidence = clamp(c.structureBoundaryStrongConfidence, c.structureBoundaryMinConfidence, 0.99);
  c.structureBoundaryMaxOffset = clamp(c.structureBoundaryMaxOffset, 0.20, 4.0);
  c.structureBoundaryMinSectionDuration = clamp(c.structureBoundaryMinSectionDuration, 1.5, 16.0);
  c.structureSequenceContextWeight = clamp(c.structureSequenceContextWeight, 0, 0.8);
  c.structureRepeatContextWeight = clamp(c.structureRepeatContextWeight, 0, 0.8);
  c.extensionMinConfidence = clamp(c.extensionMinConfidence, 0.20, 0.95);
  c.extensionExactSupport = clamp(c.extensionExactSupport, 0.05, 0.90);
  c.extensionFamilyMargin = clamp(c.extensionFamilyMargin, 0.00, 0.50);
  c.alteredChordMinConfidence = clamp(c.alteredChordMinConfidence, 0.30, 0.99);
  c.hierarchicalRootWeight = clamp(c.hierarchicalRootWeight, 0.2, 3.0);
  c.hierarchicalTriadWeight = clamp(c.hierarchicalTriadWeight, 0.2, 3.0);
  c.hierarchicalSeventhWeight = clamp(c.hierarchicalSeventhWeight, 0.0, 2.0);
  c.hierarchicalExtensionWeight = clamp(c.hierarchicalExtensionWeight, 0.0, 2.0);
  c.hierarchicalExactWeight = clamp(c.hierarchicalExactWeight, 0.0, 2.0);
  c.hierarchicalComplexityPenalty = clamp(c.hierarchicalComplexityPenalty, 0.0, 0.8);
  c.hierarchicalMinGain = clamp(c.hierarchicalMinGain, 0.0, 1.5);
  c.multiHeadWeight = clamp(c.multiHeadWeight, 0, 1);
  c.multiHeadMinConfidence = clamp(c.multiHeadMinConfidence, 0.02, 0.95);
  c.transcriptionBeatRelease = clamp(c.transcriptionBeatRelease, 0, 1);
  c.transcriptionDownbeatRelease = clamp(c.transcriptionDownbeatRelease, 0, 1);
  c.transcriptionNoveltyRelease = clamp(c.transcriptionNoveltyRelease, 0, 1);
  c.transcriptionContextMinRadiusRatio = clamp(c.transcriptionContextMinRadiusRatio, 0.05, 1);
  c.pipelineMinProviderScore = clamp(c.pipelineMinProviderScore, 0, 1);
  c.pipelineEnsembleMargin = clamp(c.pipelineEnsembleMargin, 0, 0.5);
  c.pipelineOtherMinConfidence = clamp(c.pipelineOtherMinConfidence, 0, 1);
  c.pipelineBassMinConfidence = clamp(c.pipelineBassMinConfidence, 0, 1);
  c.pipelineDrumsQualityMargin = clamp(c.pipelineDrumsQualityMargin, -0.5, 0.5);
  c.rhythmProvider = normalizeRhythmProvider(o.rhythmProvider || 'auto');
  return c;
}


function normalizeRhythmProvider(value) {
  const v = String(value || 'auto').toLowerCase();
  return ['auto','accent','neural','ensemble'].includes(v) ? v : 'auto';
}

function normalizeAcousticProvider(value) {
  const v = String(value || 'auto').toLowerCase();
  return ['auto','essentia','hpcp','onnx','ensemble','btc','btc-ensemble','multihead','multihead-ensemble'].includes(v) ? v : 'auto';
}

function normalizeStreamProfile(value, isMultiStream = false) {
  const v = String(value || (isMultiStream ? 'full' : 'mix')).toLowerCase();
  return ['mix','mix-other','mix-other-bass','full'].includes(v) ? v : (isMultiStream ? 'full' : 'mix');
}
function streamProfileFlags(profile) {
  const p = normalizeStreamProfile(profile, true);
  return {
    profile: p,
    other: p === 'mix-other' || p === 'mix-other-bass' || p === 'full',
    bass: p === 'mix-other-bass' || p === 'full',
    drums: p === 'full'
  };
}

function gateBackendChordModel(model, minConfidence) {
  if (!model?.observations?.length) return model;
  const threshold = clamp(Number(minConfidence || 0), 0, 1);
  let gated = 0, meanTop = 0;
  const observations = model.observations.map(obs => {
    const conf = Number(obs?.confidence || 0);
    if (conf >= threshold) { meanTop += conf; return obs; }
    gated++;
    const probs = (obs.probabilities || []).map(x => ({...x}));
    let n = probs.find(x => x.chord === 'N');
    if (!n) { n = {chord:'N', probability:0}; probs.push(n); }
    for (const x of probs) x.probability *= 0.45;
    n.probability += 0.55;
    const total = probs.reduce((a,b)=>a+Number(b.probability||0),0) || 1;
    for (const x of probs) x.probability /= total;
    probs.sort((a,b)=>b.probability-a.probability);
    const top = probs[0] || {chord:'N',probability:0};
    meanTop += top.probability;
    return {...obs, top:top.chord, confidence:top.probability, probabilities:probs, backendLowConfidence:true};
  });
  return {...model, observations, meanTopProbability:observations.length?meanTop/observations.length:0, gatedFrames:gated, source:(model.source||'btc-neural-backend-v1')+'-gated'};
}


function gateProbabilityModel(model, minConfidence) {
  if (!model?.observations?.length) return model;
  const threshold = clamp(Number(minConfidence || 0), 0, 1);
  const observations = model.observations.map(obs => {
    if (Number(obs?.confidence || 0) >= threshold) return obs;
    const probs=(obs?.probabilities||[]).map(x=>({...x,probability:Number(x.probability||0)*0.55}));
    let n=probs.find(x=>x.chord==='N'); if(!n){n={chord:'N',probability:0};probs.push(n);} n.probability+=0.45;
    const z=probs.reduce((a,b)=>a+Number(b.probability||0),0)||1; for(const x of probs)x.probability/=z; probs.sort((a,b)=>b.probability-a.probability);
    return {...obs,top:probs[0]?.chord||'N',confidence:probs[0]?.probability||0,probabilities:probs,lowConfidenceGate:true};
  });
  return {...model,observations,meanTopProbability:observations.reduce((a,o)=>a+Number(o.confidence||0),0)/Math.max(1,observations.length)};
}

function modelReliabilityScore(model, kind='generic'){
  if(!model?.observations?.length)return -1;
  const meanTop=clamp(Number(model.meanTopProbability||0),0,1);
  let entropy=0,n=0,margin=0;
  for(const o of model.observations){const p=(o.probabilities||[]).map(x=>Number(x.probability||0)).filter(x=>x>0);if(!p.length)continue;n++;entropy+=-p.reduce((a,x)=>a+x*Math.log(Math.max(1e-9,x)),0)/Math.log(Math.max(2,p.length));const q=[...p].sort((a,b)=>b-a);margin+=(q[0]||0)-(q[1]||0);}
  entropy=n?entropy/n:1;margin=n?margin/n:0;
  const calibrationBonus=model.calibration?.loaded?0.035:0;
  const thresholdBonus=model.decisionThresholds?.loaded?0.02:0;
  const kindBias=kind==='multihead'?0.035:kind==='btc'?0.018:kind==='onnx'?0.012:kind==='hpcp'?-0.015:0;
  return clamp(0.56*meanTop+0.28*margin+0.16*(1-entropy)+calibrationBonus+thresholdBonus+kindBias,0,1);
}
function chooseAutomaticAcousticProvider(hpcpModel,neuralModel,backendChordModel,multiHeadModel,tuning){
  const scores={hpcp:modelReliabilityScore(hpcpModel,'hpcp'),onnx:modelReliabilityScore(neuralModel,'onnx'),btc:modelReliabilityScore(backendChordModel,'btc'),multihead:modelReliabilityScore(multiHeadModel,'multihead')};
  const candidates=Object.entries(scores).filter(([,v])=>v>=0).sort((a,b)=>b[1]-a[1]);
  if(!candidates.length)return {provider:'essentia',scores,reason:'no-probability-models'};
  const [best,bestScore]=candidates[0];
  if(bestScore<tuning.pipelineMinProviderScore && hpcpModel)return {provider:'hpcp',scores,reason:'scores-below-minimum'};
  if(best!=='hpcp' && hpcpModel && scores.hpcp>=0 && bestScore-scores.hpcp<=tuning.pipelineEnsembleMargin){
    return {provider:best==='multihead'?'multihead-ensemble':best==='btc'?'btc-ensemble':'ensemble',scores,reason:'complementary-hpcp-ensemble'};
  }
  return {provider:best,scores,reason:'highest-reliability-score'};
}
function chooseAutomaticStreamProfile(f,tuning){
  if(!f.multiStream)return {profile:'mix',scores:{},reason:'single-stream'};
  const otherScore=modelReliabilityScore(f.otherModel,'hpcp');
  const bassScore=Number(f.bassRootModel?.meanTopProbability||0);
  const mixQ=beatMapQuality(f.mixBeatMap||f.beatMap||[],f.mixBpm||f.bpm).score;
  const drumsQ=beatMapQuality(f.drumsBeatMap||[],f.drumsBpm||f.bpm).score;
  const useOther=otherScore>=tuning.pipelineOtherMinConfidence;
  const useBass=bassScore>=tuning.pipelineBassMinConfidence;
  const useDrums=(f.drumsBeatMap?.length||0)>=4 && drumsQ>=mixQ+tuning.pipelineDrumsQualityMargin;
  let profile='mix'; if(useOther)profile='mix-other'; if(useOther&&useBass)profile='mix-other-bass'; if(useOther&&useBass&&useDrums)profile='full';
  return {profile,scores:{other:round(otherScore,3),bass:round(bassScore,3),mixBeat:round(mixQ,3),drumsBeat:round(drumsQ,3)},flags:{useOther,useBass,useDrums},reason:'per-song-stream-quality'};
}
function selectAcousticModel(mode, hpcpModel, neuralModel, tuning, backendChordModel = null, multiHeadModel = null) {
  const provider = normalizeAcousticProvider(mode);
  if (provider === 'essentia') return { provider, model: null, source: 'essentia-label-viterbi', available: true };
  if (provider === 'hpcp') {
    if (!hpcpModel) return { provider, model: null, source: 'hpcp-unavailable', available: false, error: 'HPCP no disponible para este audio.' };
    return { provider, model: hpcpModel, source: 'hpcp-template-probabilistic-v1', available: true };
  }
  if (provider === 'onnx') {
    if (!neuralModel) return { provider, model: null, source: 'onnx-unavailable', available: false, error: 'Modelo ONNX solicitado no disponible.' };
    return { provider, model: neuralModel, source: 'onnx-neural-v1', available: true };
  }
  if (provider === 'btc') {
    if (!backendChordModel) return { provider, model: null, source: 'btc-unavailable', available: false, error: 'Proveedor BTC backend no disponible.' };
    return { provider, model: gateBackendChordModel(backendChordModel, tuning.backendChordMinConfidence), source: 'btc-neural-backend-v1', available: true };
  }
  if (provider === 'btc-ensemble') {
    if (!backendChordModel || !hpcpModel) return { provider, model: null, source: 'btc-ensemble-unavailable', available: false, error: !backendChordModel ? 'BTC backend no disponible.' : 'HPCP no disponible.' };
    return { provider, model: blendProbabilityModels(gateBackendChordModel(backendChordModel, tuning.backendChordMinConfidence), hpcpModel, tuning.backendChordWeight), source: 'btc+hpcp-ensemble-v1', available: true };
  }
  if (provider === 'multihead') {
    if (!multiHeadModel) return { provider, model: null, source: 'multihead-unavailable', available: false, error: 'Modelo multi-head ONNX no disponible.' };
    return { provider, model: gateProbabilityModel(multiHeadModel, tuning.multiHeadMinConfidence), source: 'onnx-multihead-factorized-v1', available: true };
  }
  if (provider === 'multihead-ensemble') {
    if (!multiHeadModel || !hpcpModel) return { provider, model: null, source: 'multihead-ensemble-unavailable', available: false, error: !multiHeadModel ? 'Modelo multi-head ONNX no disponible.' : 'HPCP no disponible.' };
    return { provider, model: blendProbabilityModels(gateProbabilityModel(multiHeadModel, tuning.multiHeadMinConfidence), hpcpModel, tuning.multiHeadWeight), source: 'multihead+hpcp-ensemble-v1', available: true };
  }
  if (provider === 'ensemble') {
    if (!neuralModel || !hpcpModel) return { provider, model: null, source: 'ensemble-unavailable', available: false, error: !neuralModel ? 'ONNX no disponible para ensemble.' : 'HPCP no disponible para ensemble.' };
    return { provider, model: blendProbabilityModels(neuralModel, hpcpModel, tuning.ensembleNeuralWeight), source: 'onnx+hpcp-ensemble-v1', available: true };
  }
  if (multiHeadModel && hpcpModel) return { provider: 'auto', model: blendProbabilityModels(gateProbabilityModel(multiHeadModel, tuning.multiHeadMinConfidence), hpcpModel, tuning.multiHeadWeight), source: 'multihead+hpcp-ensemble-v1', available: true };
  if (backendChordModel && hpcpModel) return { provider: 'auto', model: blendProbabilityModels(gateBackendChordModel(backendChordModel, tuning.backendChordMinConfidence), hpcpModel, tuning.backendChordWeight), source: 'btc+hpcp-ensemble-v1', available: true };
  if (neuralModel && hpcpModel) return { provider: 'auto', model: blendProbabilityModels(neuralModel, hpcpModel, tuning.ensembleNeuralWeight), source: 'onnx+hpcp-ensemble-v1', available: true };
  if (hpcpModel) return { provider: 'auto', model: hpcpModel, source: 'hpcp-template-probabilistic-v1', available: true };
  return { provider: 'auto', model: null, source: 'essentia-label-fallback', available: true };
}

// ---------------- Registro multi-modelo ONNX Runtime Web (v19) ----------------

const neuralRegistry = {
  attempted: false,
  runtimeLoaded: false,
  registryLoaded: false,
  descriptors: [],
  entries: new Map(),
  defaultId: null,
  error: null
};

function safeModelId(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'default';
}

async function loadModelManifest(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
  const manifest = await response.json();
  if (!manifest || manifest.schema !== 'chordsync-chord-model-v1') throw new Error(`Manifest incompatible en ${url}`);
  if (!Array.isArray(manifest.labels) || manifest.labels.length < 2) throw new Error(`El manifest ${url} debe incluir labels[]`);
  return manifest;
}

async function ensureNeuralRegistry() {
  if (neuralRegistry.attempted) return neuralRegistry;
  neuralRegistry.attempted = true;
  try {
    if (typeof self.ort === 'undefined') importScripts('vendor/ort.min.js');
    if (typeof self.ort === 'undefined' || !self.ort.InferenceSession) throw new Error('ONNX Runtime Web no está disponible en vendor/ort.min.js');
    neuralRegistry.runtimeLoaded = true;

    let descriptors = [];
    try {
      const r = await fetch('models/chord_models.json', { cache: 'no-store' });
      if (r.ok) {
        const reg = await r.json();
        if (!reg || reg.schema !== 'chordsync-chord-model-registry-v1' || !Array.isArray(reg.models)) throw new Error('models/chord_models.json tiene un schema incompatible');
        descriptors = reg.models.filter(x => x && x.enabled !== false).map((x, i) => ({
          id: safeModelId(x.id || `model-${i+1}`),
          name: String(x.name || x.id || `Modelo ${i+1}`),
          manifest: String(x.manifest || ''),
          default: !!x.default
        })).filter(x => x.manifest);
      }
    } catch (e) {
      // Compatibilidad con v15: si no existe registry, intenta un único manifest legacy.
      descriptors = [];
    }
    if (!descriptors.length) descriptors = [{ id:'default', name:'Default ONNX', manifest:'chord_model.json', default:true }];
    neuralRegistry.descriptors = descriptors;
    neuralRegistry.defaultId = (descriptors.find(x => x.default) || descriptors[0]).id;
    neuralRegistry.registryLoaded = true;
  } catch (err) {
    neuralRegistry.error = err && err.message ? err.message : String(err);
  }
  return neuralRegistry;
}

async function ensureNeuralModel(modelId = null) {
  const registry = await ensureNeuralRegistry();
  if (!registry.runtimeLoaded) return null;
  const id = safeModelId(modelId || registry.defaultId || 'default');
  if (registry.entries.has(id)) return registry.entries.get(id);
  const descriptor = registry.descriptors.find(x => x.id === id);
  if (!descriptor) return null;
  const entry = { id, name:descriptor.name, descriptor, loaded:false, session:null, manifest:null, modelUrl:null, error:null };
  registry.entries.set(id, entry);
  try {
    const manifestUrl = new URL(descriptor.manifest, new URL('models/', self.location.href)).toString();
    const manifest = await loadModelManifest(manifestUrl);
    const modelUrl = manifest.model || 'chord_model.onnx';
    const resolved = new URL(modelUrl, manifestUrl).toString();
    const executionProviders = manifest.executionProviders || ['wasm'];
    entry.session = await self.ort.InferenceSession.create(resolved, { executionProviders });
    entry.manifest = manifest;
    entry.modelUrl = resolved;
    entry.loaded = true;
    entry.name = String(manifest.name || descriptor.name || id);
  } catch (err) {
    entry.error = err && err.message ? err.message : String(err);
    entry.loaded = false;
  }
  return entry;
}

function softmaxVector(values, temperature = 1) {
  if (!values.length) return [];
  const temp = Math.max(1e-4, Number(temperature) || 1);
  let max = -Infinity;
  for (const v of values) if (v > max) max = v;
  const exps = values.map(v => Math.exp((v - max) / temp));
  const sum = exps.reduce((a,b)=>a+b,0) || 1;
  return exps.map(v => v / sum);
}

function normalizeChromaRows(hpcpRaw) {
  const rows = [];
  for (const frame of hpcpRaw || []) {
    const c = collapseHpcpTo12(frame);
    if (c) rows.push(c);
  }
  return rows;
}

function makeOnnxInput(rows, manifest) {
  if (!rows.length) return null;
  const layout = String(manifest.inputLayout || 'BTC').toUpperCase();
  const T = rows.length, C = 12;
  let dims, data;
  if (layout === 'BCT') {
    dims = [1, C, T]; data = new Float32Array(T * C);
    for (let t=0;t<T;t++) for (let c=0;c<C;c++) data[c*T+t] = rows[t][c];
  } else {
    dims = [1, T, C]; data = new Float32Array(T * C);
    for (let t=0;t<T;t++) for (let c=0;c<C;c++) data[t*C+c] = rows[t][c];
  }
  return { data, dims, T };
}

function logitsToProbabilityObservations(outputData, outputDims, labels, manifest, targetFrames) {
  if (!outputData || !outputData.length || !labels.length) return null;
  const C = labels.length; let T = 0;
  if (Array.isArray(outputDims) && outputDims.length >= 2) {
    if (outputDims[outputDims.length - 1] === C) T = outputDims[outputDims.length - 2];
    else if (outputDims.length >= 3 && outputDims[1] === C) T = outputDims[2];
  }
  if (!T) T = Math.floor(outputData.length / C);
  if (!T) return null;
  const layout = String(manifest.outputLayout || 'BTC').toUpperCase();
  const temperature = Number(manifest.temperature || 1);
  const observations = [];
  for (let t=0;t<T;t++) {
    const logits = new Array(C);
    for (let c=0;c<C;c++) logits[c] = Number(outputData[layout === 'BCT' ? c*T+t : t*C+c] || 0);
    const probs = manifest.outputIsProbabilities ? logits : softmaxVector(logits, temperature);
    const ranked = labels.map((chord, i) => ({ chord, probability: clamp(Number(probs[i] || 0), 0, 1) }))
      .filter(x => x.chord && x.chord !== 'X').sort((a,b)=>b.probability-a.probability).slice(0, Math.min(18, labels.length));
    observations.push({ top: ranked[0]?.chord || 'N', confidence: ranked[0]?.probability || 0, probabilities: ranked });
  }
  if (!observations.length) return null;
  const aligned = [], N = Math.max(1, targetFrames || observations.length);
  for (let i=0;i<N;i++) aligned.push(observations[Math.min(observations.length-1, Math.round(i*(observations.length-1)/Math.max(1,N-1)))]);
  const meanTop = aligned.reduce((a,o)=>a+(o.confidence||0),0)/aligned.length;
  return { observations: aligned, meanTopProbability: meanTop, states: labels.slice(), source: 'onnx-neural-v2' };
}

async function runNeuralChordModel(hpcpRaw, targetFrames, modelId = null) {
  const entry = await ensureNeuralModel(modelId);
  if (!entry || !entry.loaded) return null;
  const rows = normalizeChromaRows(hpcpRaw);
  const input = makeOnnxInput(rows, entry.manifest);
  if (!input) return null;
  try {
    const inputName = entry.manifest.inputName || entry.session.inputNames?.[0];
    const outputName = entry.manifest.outputName || entry.session.outputNames?.[0];
    if (!inputName || !outputName) throw new Error('No se pudieron resolver los nombres input/output del modelo ONNX');
    const tensor = new self.ort.Tensor('float32', input.data, input.dims);
    const outputs = await entry.session.run({ [inputName]: tensor });
    const out = outputs[outputName];
    if (!out) throw new Error('El modelo ONNX no devolvió el output esperado');
    const model = logitsToProbabilityObservations(out.data, out.dims, entry.manifest.labels, entry.manifest, targetFrames);
    if (model) { model.modelId = entry.id; model.modelName = entry.name; model.source = `onnx:${entry.id}`; }
    return model;
  } catch (err) {
    entry.error = 'Inferencia ONNX: ' + (err && err.message ? err.message : String(err));
    return null;
  }
}

async function runNeuralModels(hpcpRaw, targetFrames, loadAll = false) {
  const registry = await ensureNeuralRegistry();
  const ids = loadAll ? registry.descriptors.map(x => x.id) : [registry.defaultId || 'default'];
  const models = {};
  for (const id of ids) {
    const model = await runNeuralChordModel(hpcpRaw, targetFrames, id);
    if (model) models[id] = model;
  }
  return { models, defaultId: registry.defaultId, descriptors: registry.descriptors.map(d => ({id:d.id,name:d.name,default:d.default})) };
}


// ---------------- Proveedor ONNX multi-head de acordes (v37) ----------------
const multiHeadRegistry = { attempted:false, loaded:false, session:null, manifest:null, error:null, modelUrl:null, calibration:null, calibrationUrl:null, thresholds:null, thresholdsUrl:null, functionalPrior:null, functionalPriorUrl:null };

async function ensureMultiHeadModel() {
  if (multiHeadRegistry.attempted) return multiHeadRegistry;
  multiHeadRegistry.attempted=true;
  try {
    if (typeof self.ort === 'undefined') importScripts('vendor/ort.min.js');
    if (typeof self.ort === 'undefined' || !self.ort.InferenceSession) throw new Error('ONNX Runtime Web no disponible');
    const manifestUrl=new URL('models/multihead_chord_model.json',self.location.href).toString();
    const r=await fetch(manifestUrl,{cache:'no-store'}); if(!r.ok) throw new Error('No existe models/multihead_chord_model.json');
    const m=await r.json();
    if(!m || m.schema!=='chordsync-multihead-chord-model-v1') throw new Error('Schema multi-head incompatible');
    for(const head of ['root','triad','seventh','extension','bass']) if(!Array.isArray(m.heads?.[head]?.labels)) throw new Error(`Falta heads.${head}.labels`);
    if(!Array.isArray(m.candidateVocabulary)||m.candidateVocabulary.length<2) throw new Error('candidateVocabulary insuficiente');
    const modelUrl=new URL(m.model||'multihead_chord_model.onnx',manifestUrl).toString();
    // v37: optional post-hoc calibration file. If absent, temperature=1 keeps v30 behavior.
    const calibrationUrl = m.calibration
      ? new URL(m.calibration, manifestUrl).toString()
      : modelUrl + '.calibration.json';
    let calibration = null;
    try {
      const cr = await fetch(calibrationUrl,{cache:'no-store'});
      if (cr.ok) {
        const c = await cr.json();
        if (c?.schema === 'chordsync-multihead-calibration-v1' && c?.heads) calibration = c;
      }
    } catch (_) {}
    if (calibration) {
      for (const head of ['root','triad','seventh','extension','bass']) {
        const t = Number(calibration.heads?.[head]?.temperature);
        if (Number.isFinite(t) && t > 0) m.heads[head].temperature = t;
      }
    }
    // v37: optional validation-learned per-class decision thresholds.
    const thresholdsUrl = m.thresholds
      ? new URL(m.thresholds, manifestUrl).toString()
      : modelUrl + '.thresholds.json';
    let thresholds = null;
    try {
      const tr = await fetch(thresholdsUrl,{cache:'no-store'});
      if (tr.ok) {
        const t = await tr.json();
        if (t?.schema === 'chordsync-multihead-thresholds-v1' && t?.heads) thresholds = t;
      }
    } catch (_) {}
    multiHeadRegistry.session=await self.ort.InferenceSession.create(modelUrl,{executionProviders:m.executionProviders||['wasm']});
    // v37: optional TRAIN-only key-relative functional-harmony prior used by runtime Viterbi.
    const functionalPriorUrl = m.functionalTransitions
      ? new URL(m.functionalTransitions, manifestUrl).toString()
      : modelUrl + '.functional-transitions.json';
    let functionalPrior = null;
    try {
      const fr = await fetch(functionalPriorUrl,{cache:'no-store'});
      if (fr.ok) {
        const fp = await fr.json();
        if (fp?.schema === 'chordsync-functional-harmony-prior-v1' && Array.isArray(fp?.probabilities) && fp.probabilities.length === 2) functionalPrior = fp;
      }
    } catch (_) {}
    multiHeadRegistry.manifest=m; multiHeadRegistry.modelUrl=modelUrl; multiHeadRegistry.calibration=calibration; multiHeadRegistry.calibrationUrl=calibrationUrl; multiHeadRegistry.thresholds=thresholds; multiHeadRegistry.thresholdsUrl=thresholdsUrl; multiHeadRegistry.functionalPrior=functionalPrior; multiHeadRegistry.functionalPriorUrl=functionalPriorUrl; multiHeadRegistry.loaded=true;
  } catch(e){ multiHeadRegistry.error=e?.message||String(e); }
  return multiHeadRegistry;
}

function tensorFrameRows(tensor, labels, manifestHead, targetFrames) {
  if(!tensor?.data?.length||!labels?.length)return null;
  const C=labels.length, dims=tensor.dims||[], layout=String(manifestHead?.layout||'BTC').toUpperCase();
  let T=0; if(dims.length>=2){ if(dims[dims.length-1]===C)T=dims[dims.length-2]; else if(dims.length>=3&&dims[1]===C)T=dims[2]; }
  if(!T)T=Math.floor(tensor.data.length/C); if(!T)return null;
  const temp=Number(manifestHead?.temperature||1), rows=[];
  for(let t=0;t<T;t++){
    const vals=new Array(C); for(let c=0;c<C;c++) vals[c]=Number(tensor.data[layout==='BCT'?c*T+t:t*C+c]||0);
    rows.push(manifestHead?.outputIsProbabilities?vals:softmaxVector(vals,temp));
  }
  const N=Math.max(1,targetFrames||rows.length), aligned=[];
  for(let i=0;i<N;i++) aligned.push(rows[Math.min(rows.length-1,Math.round(i*(rows.length-1)/Math.max(1,N-1)))]);
  return aligned;
}

function learnedClassThreshold(thresholdReport, head, label, fallback = 0) {
  const v = Number(thresholdReport?.heads?.[head]?.labels?.[label]?.threshold);
  return Number.isFinite(v) && v > 0 && v < 1 ? v : fallback;
}
function softDecisionGate(probability, threshold) {
  const p = clamp(Number(probability||0), 0, 1);
  const t = Number(threshold||0);
  if (!Number.isFinite(t) || t <= 0 || p >= t) return 1;
  const ratio = clamp(p / Math.max(1e-6, t), 0, 1);
  return Math.max(0.06, Math.pow(ratio, 2.2));
}
function chordComponentLikelihood(label, headRows, labelsByHead, frame, thresholdReport = null) {
  const idx=(head,name,value)=>{const labels=labelsByHead[name]||[];const i=labels.indexOf(value);return i>=0?Number(headRows[name]?.[frame]?.[i]||0):0;};
  if(label==='N'){
    const rn=idx(headRows,'root','N'); return Math.max(1e-9,rn);
  }
  const c=chordHierarchyComponents(canonicalChordLabel(label)); if(!c)return 0;
  const root=idx(headRows,'root',c.root), triad=idx(headRows,'triad',c.triad), seventh=idx(headRows,'seventh',c.seventh), extension=idx(headRows,'extension',c.extension);
  const bassTarget=c.bass||c.root; const bass=idx(headRows,'bass',bassTarget);
  // Base factorized posterior. Root/triad dominate; advanced heads are intentionally softer.
  let score = Math.pow(Math.max(root,1e-8),1.35)*Math.pow(Math.max(triad,1e-8),1.15)*Math.pow(Math.max(seventh,1e-8),0.72)*Math.pow(Math.max(extension,1e-8),0.52)*Math.pow(Math.max(bass,1e-8),0.32);
  // v37: learned thresholds are fitted on VALIDATION only. They act as soft gates,
  // never as hard deletions, so borrowed/rare chords can still survive with temporal evidence.
  if (thresholdReport) {
    if (['dim','aug','sus2','sus4'].includes(c.triad)) score *= softDecisionGate(triad, learnedClassThreshold(thresholdReport,'triad',c.triad,0));
    if (c.seventh !== 'none') score *= softDecisionGate(seventh, learnedClassThreshold(thresholdReport,'seventh',c.seventh,0));
    if (c.extension !== 'none') score *= softDecisionGate(extension, learnedClassThreshold(thresholdReport,'extension',c.extension,0));
    if (c.bass && c.bass !== c.root) score *= softDecisionGate(bass, learnedClassThreshold(thresholdReport,'bass',bassTarget,0));
  }
  return score;
}

function normalizeProbabilityRow(row) {
  const vals=(row||[]).map(x=>Math.max(0,Number(x)||0));
  const z=vals.reduce((a,b)=>a+b,0)||1;
  return vals.map(x=>x/z);
}

function rebuildMultiHeadChordModel(headRows, labelsByHead, vocab, thresholdReport, meta={}) {
  const frameCount=Math.max(1,headRows?.root?.length||0), observations=[];
  let meanTop=0;
  for(let t=0;t<frameCount;t++){
    const scored=[];
    for(const chord of vocab) scored.push({chord,probability:chordComponentLikelihood(chord,headRows,labelsByHead,t,thresholdReport)});
    const z=scored.reduce((a,b)=>a+b.probability,0)||1;
    for(const x of scored)x.probability/=z;
    scored.sort((a,b)=>b.probability-a.probability);
    const top=scored[0]||{chord:'N',probability:0}; meanTop+=top.probability;
    observations.push({
      top:top.chord,
      confidence:top.probability,
      probabilities:scored.slice(0,Math.min(24,scored.length)),
      heads:{
        root:topPosteriorFromArray(headRows.root[t],labelsByHead.root),
        triad:topPosteriorFromArray(headRows.triad[t],labelsByHead.triad),
        seventh:topPosteriorFromArray(headRows.seventh[t],labelsByHead.seventh),
        extension:topPosteriorFromArray(headRows.extension[t],labelsByHead.extension),
        bass:topPosteriorFromArray(headRows.bass[t],labelsByHead.bass)
      }
    });
  }
  return {
    observations,
    meanTopProbability:meanTop/Math.max(1,observations.length),
    states:vocab.slice(),
    source:meta.source||'onnx-multihead-factorized-calibrated-thresholded-v56',
    modelName:meta.modelName||'Multi-head chord model',
    headLabels:labelsByHead,
    factorized:{headRows,labelsByHead,vocab:vocab.slice(),thresholdReport},
    calibration:meta.calibration||{loaded:false,temperatures:{root:1,triad:1,seventh:1,extension:1,bass:1}},
    decisionThresholds:meta.decisionThresholds||{loaded:false}
  };
}

async function runMultiHeadChordModel(hpcpRaw,targetFrames){
  const reg=await ensureMultiHeadModel(); if(!reg.loaded)return null;
  const rows=normalizeChromaRows(hpcpRaw), input=makeOnnxInput(rows,reg.manifest); if(!input)return null;
  try{
    const inputName=reg.manifest.inputName||reg.session.inputNames?.[0]; if(!inputName)throw new Error('Input multi-head no resuelto');
    const outputs=await reg.session.run({[inputName]:new self.ort.Tensor('float32',input.data,input.dims)});
    const headRows={}, labelsByHead={};
    for(const name of ['root','triad','seventh','extension','bass']){
      const h=reg.manifest.heads[name], outName=h.outputName||name, tensor=outputs[outName]; if(!tensor)throw new Error(`Output multi-head ausente: ${outName}`);
      labelsByHead[name]=h.labels; headRows[name]=tensorFrameRows(tensor,h.labels,h,targetFrames); if(!headRows[name])throw new Error(`Output multi-head inválido: ${name}`);
    }
    const vocab=reg.manifest.candidateVocabulary.map(canonicalChordLabel).filter(Boolean);
    const calibration=reg.calibration?{loaded:true,method:reg.calibration.method||'per-head-temperature-scaling',fitSplit:reg.calibration.fitSplit||'validation',temperatures:Object.fromEntries(['root','triad','seventh','extension','bass'].map(h=>[h,Number(reg.manifest.heads?.[h]?.temperature||1)]))}:{loaded:false,temperatures:{root:1,triad:1,seventh:1,extension:1,bass:1}};
    const decisionThresholds=reg.thresholds?{loaded:true,method:reg.thresholds.method||'per-class-validation-fbeta-thresholds',fitSplit:reg.thresholds.fitSplit||'validation',beta:Number(reg.thresholds.beta||0.7),runtimePolicy:reg.thresholds.runtimePolicy||null,heads:reg.thresholds.heads||{}}:{loaded:false};
    return rebuildMultiHeadChordModel(headRows,labelsByHead,vocab,reg.thresholds,{source:'onnx-multihead-factorized-calibrated-thresholded-v56',modelName:String(reg.manifest.name||'Multi-head chord model'),calibration,decisionThresholds});
  }catch(e){reg.error='Inferencia multi-head: '+(e?.message||String(e));return null;}
}

function topPosteriorFromArray(row,labels){let idx=0,v=-Infinity;for(let i=0;i<(row||[]).length;i++)if(row[i]>v){v=row[i];idx=i;}return{label:labels?.[idx]??null,value:round(Number(v>0?v:0),3)};}

function blendProbabilityModels(primary, secondary, primaryWeight = 0.72) {
  if (!primary) return secondary;
  if (!secondary) return primary;
  const N = Math.min(primary.observations.length, secondary.observations.length);
  const observations = [];
  let meanTop = 0;
  for (let i=0;i<N;i++) {
    const a = primary.observations[i], b = secondary.observations[i];
    const labels = new Set([...(a.probabilities||[]).map(x=>x.chord), ...(b.probabilities||[]).map(x=>x.chord)]);
    const probs = [];
    for (const chord of labels) {
      const p = probabilityFor(a, chord) * primaryWeight + probabilityFor(b, chord) * (1-primaryWeight);
      probs.push({ chord, probability: p });
    }
    const sum = probs.reduce((x,y)=>x+y.probability,0) || 1;
    for (const p of probs) p.probability /= sum;
    probs.sort((x,y)=>y.probability-x.probability);
    const top = probs[0] || { chord:'N', probability:0 };
    meanTop += top.probability;
    observations.push({ top: top.chord, confidence: top.probability, probabilities: probs.slice(0,18) });
  }
  return {
    observations,
    meanTopProbability: observations.length ? meanTop/observations.length : 0,
    states: [...new Set(observations.flatMap(o => o.probabilities.map(p=>p.chord)))],
    source: 'onnx+hpcp-ensemble-v1'
  };
}




function normalizeBackendChordLabel(label) {
  if (!label) return 'N';
  let s = String(label).trim();
  if (!s || /^N(?:\.C\.)?$/i.test(s) || s === 'X') return 'N';
  // BTC/mir_eval suele usar root:quality; ChordSync usa C, Cm, C7, Cmaj7, etc.
  const slash = s.split('/');
  const main = slash[0];
  const bass = slash[1] || null;
  const m = main.match(/^([A-Ga-g])([#b]?)(?::([^/]+))?$/);
  if (!m) return s;
  const root = m[1].toUpperCase() + (m[2] || '');
  const q = String(m[3] || 'maj').toLowerCase();
  const map = {
    maj:'', min:'m', m:'m', maj7:'maj7', min7:'m7', '7':'7', dim:'dim', dim7:'dim7', hdim7:'m7b5',
    aug:'aug', sus2:'sus2', sus4:'sus4', min6:'m6', maj6:'6', minmaj7:'mMaj7', maj9:'maj9', min9:'m9', '9':'9'
  };
  let suffix = Object.prototype.hasOwnProperty.call(map,q) ? map[q] : q.replace(/^min/,'m').replace(/^maj$/,'');
  let out = root + suffix;
  if (bass) {
    const bm = String(bass).match(/^([A-Ga-g])([#b]?)/);
    if (bm) out += '/' + bm[1].toUpperCase() + (bm[2] || '');
  }
  return out;
}

function buildBackendChordProbabilityModel(payload, targetFrames, duration, fallbackStates = []) {
  const spans = Array.isArray(payload?.chords) ? payload.chords : Array.isArray(payload?.segments) ? payload.segments : [];
  if (!spans.length || !targetFrames) return null;
  const norm = spans.map((x) => ({
    start: Number(x.start_sec ?? x.start ?? x.startTime ?? 0),
    end: Number(x.end_sec ?? x.end ?? x.endTime ?? 0),
    chord: normalizeBackendChordLabel(x.chord ?? x.label ?? x.name),
    confidence: Number(x.confidence)
  })).filter(x => Number.isFinite(x.start) && Number.isFinite(x.end) && x.end > x.start).sort((a,b)=>a.start-b.start);
  if (!norm.length) return null;
  const stateSet = new Set(['N', ...fallbackStates]);
  norm.forEach(x => stateSet.add(x.chord));
  const states = [...stateSet].filter(Boolean);
  const observations = [];
  let si = 0, meanTop = 0;
  const frameDur = duration / Math.max(1, targetFrames);
  for (let i=0;i<targetFrames;i++) {
    const t = Math.min(duration, (i + 0.5) * frameDur);
    while (si + 1 < norm.length && t >= norm[si].end) si++;
    let span = norm[si];
    if (!span || t < span.start || t >= span.end) span = norm.find(x => t >= x.start && t < x.end) || null;
    const chord = span ? span.chord : 'N';
    let topP = span && Number.isFinite(span.confidence) ? clamp(span.confidence, 0.05, 0.995) : (chord === 'N' ? 0.72 : 0.86);
    if (payload?.probabilitiesCalibrated === false) topP = Math.min(topP, 0.90);
    const residual = Math.max(0, 1 - topP);
    const denom = Math.max(1, states.length - 1);
    const probabilities = states.map(c => ({chord:c, probability:c===chord ? topP : residual/denom})).sort((a,b)=>b.probability-a.probability);
    observations.push({top:chord, confidence:topP, probabilities, backendSpan:span ? {start:span.start,end:span.end} : null});
    meanTop += topP;
  }
  return {observations, meanTopProbability:meanTop/observations.length, states, source:'btc-neural-backend-v1', backend:payload?.provider||'btc', vocabulary:payload?.vocabulary||null};
}

function observationReliability(obs) {
  const probs = (obs && Array.isArray(obs.probabilities)) ? obs.probabilities : [];
  if (!probs.length) return 0;
  const sorted = probs.slice().sort((a,b)=>(b.probability||0)-(a.probability||0));
  const p1 = clamp(Number(sorted[0]?.probability || 0), 0, 1);
  const p2 = clamp(Number(sorted[1]?.probability || 0), 0, 1);
  const margin = clamp(p1-p2, 0, 1);
  let entropy = 0, mass = 0;
  for (const p of sorted) {
    const x = Math.max(1e-9, Number(p.probability || 0));
    mass += x;
    entropy -= x * Math.log(x);
  }
  const maxEntropy = Math.log(Math.max(2, sorted.length));
  const entropyQuality = maxEntropy > 0 ? clamp(1 - entropy/maxEntropy, 0, 1) : 0;
  return clamp(0.52*p1 + 0.30*margin + 0.18*entropyQuality, 0, 1);
}

// v20: el peso de OTHER cambia por frame según su fiabilidad relativa frente al MIX.
// No fuerza OTHER: si el stem tiene artefactos/ambigüedad, el peso vuelve hacia MIX.
function adaptiveBlendProbabilityModels(otherModel, mixModel, tuning = DEFAULT_TUNING) {
  if (!otherModel) return { model: mixModel, diagnostics: null };
  if (!mixModel) return { model: otherModel, diagnostics: { adaptive:true, meanOtherWeight:1, minOtherWeight:1, maxOtherWeight:1, disagreementRate:0 } };
  const N = Math.min(otherModel.observations.length, mixModel.observations.length);
  const rawWeights = new Array(N);
  let disagreements = 0;
  for (let i=0;i<N;i++) {
    const o = otherModel.observations[i], m = mixModel.observations[i];
    const ro = observationReliability(o), rm = observationReliability(m);
    let w = tuning.otherHarmonyWeight + tuning.otherAdaptiveStrength * 0.55 * (ro-rm);
    const ot = o?.top || 'N', mt = m?.top || 'N';
    if (ot === mt && ot !== 'N' && ot !== 'X') w += 0.05 * tuning.otherAdaptiveStrength;
    else if (ot !== mt) {
      disagreements++;
      if (ot === 'N' || ot === 'X') w -= 0.16 * tuning.otherAdaptiveStrength;
      if (mt === 'N' || mt === 'X') w += 0.10 * tuning.otherAdaptiveStrength;
    }
    rawWeights[i] = clamp(w, tuning.otherWeightFloor, tuning.otherWeightCeil);
  }
  // Suavizado temporal corto para evitar que el selector de stream oscile frame a frame.
  const weights = rawWeights.slice();
  for (let i=0;i<N;i++) {
    let sum=0, den=0;
    for (let k=-2;k<=2;k++) {
      const j=i+k; if (j<0 || j>=N) continue;
      const a = k===0 ? 3 : (Math.abs(k)===1 ? 2 : 1);
      sum += rawWeights[j]*a; den += a;
    }
    weights[i]=den?sum/den:rawWeights[i];
  }
  const observations=[];
  let meanTop=0, sumW=0, minW=1, maxW=0;
  for (let i=0;i<N;i++) {
    const a=otherModel.observations[i], b=mixModel.observations[i], w=weights[i];
    const labels=new Set([...(a.probabilities||[]).map(x=>x.chord),...(b.probabilities||[]).map(x=>x.chord)]);
    const probs=[];
    for (const chord of labels) probs.push({chord, probability: probabilityFor(a,chord)*w + probabilityFor(b,chord)*(1-w)});
    const total=probs.reduce((x,y)=>x+y.probability,0)||1;
    for (const p of probs) p.probability/=total;
    probs.sort((x,y)=>y.probability-x.probability);
    const top=probs[0]||{chord:'N',probability:0};
    meanTop+=top.probability; sumW+=w; minW=Math.min(minW,w); maxW=Math.max(maxW,w);
    observations.push({top:top.chord,confidence:top.probability,probabilities:probs.slice(0,18),otherWeight:round(w,3)});
  }
  return {
    model:{observations,meanTopProbability:N?meanTop/N:0,states:[...new Set(observations.flatMap(o=>o.probabilities.map(p=>p.chord)))],source:'adaptive-other+mix-v20'},
    diagnostics:{adaptive:true,meanOtherWeight:N?round(sumW/N,3):null,minOtherWeight:N?round(minW,3):null,maxOtherWeight:N?round(maxW,3):null,disagreementRate:N?round(disagreements/N,3):null,strength:round(tuning.otherAdaptiveStrength,3),baseWeight:round(tuning.otherHarmonyWeight,3)}
  };
}

// ---------------- Multi-stream: mix / other / bass / drums (v24) ----------------
function normalizeStreamRole(value) {
  const v = String(value || '').toLowerCase();
  if (['mix','other','bass','drums'].includes(v)) return v;
  return null;
}

function alignModelLength(model, targetFrames) {
  if (!model || !Array.isArray(model.observations) || !model.observations.length || !targetFrames) return model;
  if (model.observations.length === targetFrames) return model;
  const obs = [];
  for (let i=0;i<targetFrames;i++) {
    const src = Math.min(model.observations.length-1, Math.round(i*(model.observations.length-1)/Math.max(1,targetFrames-1)));
    obs.push(model.observations[src]);
  }
  return {...model, observations:obs};
}

function buildBassRootModel(hpcpRaw, targetFrames, shift = 0) {
  // Keep silent frames in place here too; otherwise inversions detected after
  // a break are attached to the wrong chord segment.
  const chromaFrames = (hpcpRaw || []).map(collapseHpcpTo12);
  if (!chromaFrames.some(Boolean)) return null;
  const observations = []; let meanTop = 0;
  for (let i=0;i<Math.max(1,targetFrames);i++) {
    const fi = Math.min(chromaFrames.length-1, Math.round(i*(chromaFrames.length-1)/Math.max(1,targetFrames-1)));
    const c = chromaFrames[fi];
    if (!c) {
      observations.push({top:null, confidence:0, probabilities:[]});
      continue;
    }
    const probs = []; let sum = 0;
    for (let pc=0;pc<12;pc++) { const v = Math.max(1e-7, c[(pc + shift + 120)%12] || 0); probs.push({root:PC_TO_SHARP[pc], pc, probability:v}); sum += v; }
    for (const x of probs) x.probability /= (sum || 1);
    probs.sort((a,b)=>b.probability-a.probability);
    meanTop += probs[0]?.probability || 0;
    observations.push({top:probs[0]?.root || null, confidence:probs[0]?.probability || 0, probabilities:probs});
  }
  return {observations, meanTopProbability:observations.length?meanTop/observations.length:0, source:'bass-root-hpcp-v1'};
}

function bassObservationAtTime(model, time, hopTime) {
  if (!model?.observations?.length) return null;
  const i = clamp(Math.round(time / Math.max(1e-6, hopTime)), 0, model.observations.length-1);
  return model.observations[i];
}

function stableBassEvidenceForSegment(model, seg, hopTime, tuning) {
  if (!model?.observations?.length) return null;
  const start = Number(seg.start || 0), end = Number(seg.end || start);
  const dur = Math.max(0.001, end - start);
  const guard = Math.min(tuning.bassBoundaryGuard, dur * 0.22);
  const center = (start + end) / 2;
  const halfWindow = Math.min(tuning.bassTemporalWindow / 2, Math.max(0.04, dur / 2 - guard));
  const from = Math.max(start + guard, center - halfWindow);
  const to = Math.min(end - guard, center + halfWindow);
  const i0 = clamp(Math.floor(from / Math.max(1e-6, hopTime)), 0, model.observations.length - 1);
  const i1 = clamp(Math.ceil(to / Math.max(1e-6, hopTime)), i0, model.observations.length - 1);
  const totals = new Array(12).fill(0);
  const winners = new Array(12).fill(0);
  let frames = 0, meanPeak = 0;
  for (let i = i0; i <= i1; i++) {
    const obs = model.observations[i];
    if (!obs) continue;
    frames++; meanPeak += Number(obs.confidence || 0);
    if (obs.top && NOTE_TO_PC[obs.top] !== undefined) winners[NOTE_TO_PC[obs.top]]++;
    for (const x of (obs.probabilities || [])) {
      const pc = Number.isFinite(x.pc) ? x.pc : NOTE_TO_PC[x.root];
      if (pc !== undefined) totals[(pc + 12) % 12] += Number(x.probability || 0);
    }
  }
  if (!frames) return null;
  let bestPc = 0;
  for (let pc = 1; pc < 12; pc++) if (totals[pc] > totals[bestPc]) bestPc = pc;
  const total = totals.reduce((a,b)=>a+b,0) || 1;
  const probability = totals[bestPc] / total;
  const stability = winners[bestPc] / frames;
  const peak = meanPeak / frames;
  const confidence = clamp((1 - tuning.bassStabilityWeight) * ((probability + peak) / 2) + tuning.bassStabilityWeight * stability, 0, 1);
  return {
    top: PC_TO_SHARP[bestPc], pc: bestPc, confidence, stability, probability, frames,
    windowStart: round(from,3), windowEnd: round(to,3)
  };
}

function applyBassInversionsToSegments(segments, bassRootModel, hopTime, tuning) {
  if (!bassRootModel?.observations?.length) return segments;
  return segments.map(seg => {
    const p = parseChordCore(seg.chord);
    if (!p) return seg;
    const obs = stableBassEvidenceForSegment(bassRootModel, seg, hopTime, tuning);
    const evidence = obs ? {root:obs.top,confidence:round(obs.confidence,3),stability:round(obs.stability,3),probability:round(obs.probability,3),frames:obs.frames,windowStart:obs.windowStart,windowEnd:obs.windowEnd} : null;
    if (!obs || obs.confidence < tuning.bassInversionThreshold || !obs.top) return {...seg,bassEvidence:evidence};
    const bassPc = NOTE_TO_PC[obs.top];
    if (bassPc === undefined || bassPc === p.root) return {...seg,bassEvidence:evidence};
    const allowed = new Set(qualityIntervals(p.quality,p.suffix).map(x=>(p.root+x)%12));
    if (!allowed.has(bassPc)) return {...seg,bassEvidence:evidence};
    const base = p.rootName + p.suffix;
    return {...seg, chord:`${base}/${obs.top}`, bassEvidence:{...evidence,applied:true}};
  });
}

function normalizeExternalNotes(noteAnalysis, duration) {
  if (!noteAnalysis || !Array.isArray(noteAnalysis.notes)) return null;
  const notes = [];
  for (const raw of noteAnalysis.notes) {
    const start = clamp(Number(raw.start ?? raw.start_time ?? 0), 0, Math.max(0,duration));
    const end = clamp(Number(raw.end ?? raw.end_time ?? start), start, Math.max(start,duration));
    const midi = Math.round(Number(raw.midi ?? raw.pitch));
    const confidence = clamp(Number(raw.confidence ?? raw.amplitude ?? raw.velocity/127 ?? 0.5),0,1);
    if (!Number.isFinite(midi) || midi < 0 || midi > 127 || end <= start) continue;
    notes.push({start,end,midi,pc:((midi%12)+12)%12,confidence,note:String(raw.note||'')});
  }
  notes.sort((a,b)=>a.start-b.start || a.midi-b.midi);
  if (!notes.length) return null;
  return {provider:String(noteAnalysis.provider||'multi-pitch'), model:String(noteAnalysis.model||''), notes, noteCount:notes.length, probabilitiesCalibrated:!!noteAnalysis.probabilitiesCalibrated};
}

function noteNameWithOctave(midi) {
  const pc=PC_TO_SHARP[((midi%12)+12)%12]||'C';
  return `${pc}${Math.floor(midi/12)-1}`;
}


function modelVocabulary(model) {
  const set=new Set(['N']);
  if(model?.observations) for(const obs of model.observations) for(const x of (obs?.probabilities||[])) {
    const c=canonicalChordLabel(x.chord); if(c&&c!=='X') set.add(c);
  }
  for(let pc=0;pc<12;pc++){const r=PC_TO_SHARP[pc];set.add(r);set.add(r+'m');}
  return [...set];
}

function buildNoteTranscriptionProbabilityModel(noteData, targetFrames, hopTime, referenceModel, tuning) {
  if(!noteData?.notes?.length || !targetFrames || targetFrames<1) return null;
  const frames=Number(targetFrames), hop=Math.max(1e-4,Number(hopTime||0.0464));
  const pcMass=Array.from({length:frames},()=>new Float32Array(12));
  const bassMidi=new Int16Array(frames); bassMidi.fill(127);
  const activity=new Float32Array(frames);
  for(const n of noteData.notes){
    const i0=Math.max(0,Math.floor(Number(n.start||0)/hop));
    const i1=Math.min(frames-1,Math.ceil(Number(n.end||n.start||0)/hop));
    const conf=clamp(Number(n.confidence||0.5),0.02,1);
    for(let i=i0;i<=i1;i++){
      const fs=i*hop, fe=(i+1)*hop;
      const ov=Math.max(0,Math.min(fe,n.end)-Math.max(fs,n.start));
      if(ov<=0) continue;
      const w=conf*clamp(ov/hop,0,1);
      pcMass[i][n.pc]+=w; activity[i]+=w;
      if(w>=0.08 && n.midi<bassMidi[i]) bassMidi[i]=n.midi;
    }
  }
  const vocab=modelVocabulary(referenceModel);
  const observations=[]; let meanTop=0, activeFrames=0;
  for(let i=0;i<frames;i++){
    const masses=pcMass[i], total=Array.from(masses).reduce((a,b)=>a+b,0);
    if(total<=1e-8){observations.push({top:'N',confidence:0,activity:0,probabilities:[{chord:'N',probability:1}]});continue;}
    activeFrames++;
    const maxPc=Math.max(...masses,1e-9), low=bassMidi[i]<127?((bassMidi[i]%12)+12)%12:null;
    const logits=[];
    for(const chord of vocab){
      if(chord==='N'){logits.push({chord,score:-1.8});continue;}
      const p=parseChordCore(chord); if(!p){continue;}
      const tonePcs=[...new Set(qualityIntervals(p.quality,p.suffix).map(x=>(p.root+x)%12))];
      if(!tonePcs.length) continue;
      let inMass=0, coverage=0;
      for(const pc of tonePcs){inMass+=masses[pc]; coverage+=clamp(masses[pc]/maxPc,0,1);}
      inMass/=total; coverage/=tonePcs.length;
      const rootSupport=clamp(masses[p.root]/maxPc,0,1);
      const extra=Math.max(0,1-inMass);
      const expectedBass=p.bass!=null?p.bass:p.root;
      const bassMatch=low==null?0:(low===expectedBass?1:(tonePcs.includes(low)?0.35:-0.35));
      const score=1.55*inMass+0.85*coverage+0.42*rootSupport+tuning.transcriptionHarmonyBassWeight*bassMatch-tuning.transcriptionHarmonyExtraNotePenalty*extra;
      logits.push({chord,score});
    }
    const mx=Math.max(...logits.map(x=>x.score)); let z=0;
    for(const x of logits){x.probability=Math.exp((x.score-mx)*3.2);z+=x.probability;}
    for(const x of logits)x.probability/=z||1;
    logits.sort((a,b)=>b.probability-a.probability);
    const top=logits[0]||{chord:'N',probability:0};
    const second=logits[1]?.probability||0;
    const frameConf=clamp((top.probability-second)*2.2 + Math.min(0.45,total*0.12),0,1);
    meanTop+=top.probability;
    observations.push({top:top.chord,confidence:frameConf,activity:round(total,4),bassMidi:low==null?null:bassMidi[i],probabilities:logits.slice(0,24)});
  }
  return {source:'basic-pitch-note-evidence-v1',provider:noteData.provider||'multi-pitch',observations,meanTopProbability:activeFrames?meanTop/activeFrames:0,activeFrames,frameCount:frames};
}

function noteToPc(label) {
  const s=String(label??'').trim();
  return Object.prototype.hasOwnProperty.call(NOTE_TO_PC,s) ? NOTE_TO_PC[s] : null;
}
function headLabelIndex(labels, label) {
  if(!Array.isArray(labels)) return -1;
  let i=labels.indexOf(label);
  if(i>=0) return i;
  // Enharmonic fallback for pitch-class heads.
  const pc=noteToPc(label);
  if(pc==null) return -1;
  for(let k=0;k<labels.length;k++) if(noteToPc(labels[k])===pc) return k;
  return -1;
}
function addHeadMass(row, labels, label, value) {
  const i=headLabelIndex(labels,label); if(i>=0) row[i]+=Math.max(0,Number(value)||0);
}
function normalizedHead(row, floor=1e-4) {
  const x=row.map(v=>Math.max(floor,Number(v)||0)); const z=x.reduce((a,b)=>a+b,0)||1; return x.map(v=>v/z);
}
function triadIntervalsForHead(label){
  return ({major:[0,4,7],minor:[0,3,7],dim:[0,3,6],aug:[0,4,8],sus2:[0,2,7],sus4:[0,5,7]})[label]||null;
}
function buildNoteHeadEvidence(noteData,targetFrames,frameDuration,labelsByHead,tuning){
  if(!noteData?.notes?.length||!targetFrames||!labelsByHead)return null;
  const notes=noteData.notes, heads={root:[],triad:[],seventh:[],extension:[],bass:[]};
  const confidences={root:[],triad:[],seventh:[],extension:[],bass:[]};
  let ni=0, activeFrames=0;
  for(let f=0;f<targetFrames;f++){
    const t0=f*frameDuration, t1=t0+frameDuration;
    while(ni<notes.length&&notes[ni].end<=t0)ni++;
    const pcMass=new Array(12).fill(0), lowMass=new Array(12).fill(0); let total=0,lowTotal=0;
    for(let j=ni;j<notes.length;j++){
      const n=notes[j]; if(n.start>=t1)break;
      const ov=Math.max(0,Math.min(t1,n.end)-Math.max(t0,n.start)); if(ov<=0)continue;
      const w=ov*Math.max(0.03,Number(n.confidence)||0.5); const pc=((n.midi%12)+12)%12;
      pcMass[pc]+=w; total+=w;
      if(n.midi<=60){const lw=w*(1+clamp((60-n.midi)/36,0,0.5));lowMass[pc]+=lw;lowTotal+=lw;}
    }
    const normPc=total>0?pcMass.map(v=>v/total):pcMass;
    const normLow=lowTotal>0?lowMass.map(v=>v/lowTotal):lowMass;
    if(total>0)activeFrames++;

    const rootLabels=labelsByHead.root||[], rootRow=new Array(rootLabels.length).fill(0);
    if(total<=0){addHeadMass(rootRow,rootLabels,'N',1);} else {
      for(const lbl of rootLabels){const pc=noteToPc(lbl);if(pc==null)continue;
        let bestFit=0;
        for(const q of ['major','minor','dim','aug','sus2','sus4']){
          const ints=triadIntervalsForHead(q); const fit=ints.reduce((a,k)=>a+normPc[(pc+k)%12],0)/ints.length; if(fit>bestFit)bestFit=fit;
        }
        addHeadMass(rootRow,rootLabels,lbl,0.52*normPc[pc]+0.34*bestFit+0.14*normLow[pc]);
      }
      addHeadMass(rootRow,rootLabels,'N',Math.max(0.001,0.08*(1-clamp(total/(frameDuration*0.8),0,1))));
    }
    heads.root.push(normalizedHead(rootRow));

    const rootPosterior=heads.root[f];
    const triLabels=labelsByHead.triad||[], triRow=new Array(triLabels.length).fill(0);
    for(const q of triLabels){const ints=triadIntervalsForHead(q);if(!ints)continue;let score=0;
      for(let r=0;r<12;r++){
        const ri=headLabelIndex(rootLabels,PC_TO_SHARP[r]); const rp=ri>=0?rootPosterior[ri]:1/12;
        const inMass=ints.reduce((a,k)=>a+normPc[(r+k)%12],0)/ints.length;
        const outside=Math.max(0,1-ints.reduce((a,k)=>a+normPc[(r+k)%12],0));
        score+=rp*Math.max(0,inMass-0.18*outside);
      }
      addHeadMass(triRow,triLabels,q,score);
    }
    heads.triad.push(normalizedHead(triRow));

    const sevLabels=labelsByHead.seventh||[], sevRow=new Array(sevLabels.length).fill(0);
    let seventhPresent=0;
    for(let r=0;r<12;r++){
      const ri=headLabelIndex(rootLabels,PC_TO_SHARP[r]); const rp=ri>=0?rootPosterior[ri]:1/12;
      const b7=normPc[(r+10)%12], maj7=normPc[(r+11)%12], dim7=normPc[(r+9)%12];
      addHeadMass(sevRow,sevLabels,'b7',rp*b7); addHeadMass(sevRow,sevLabels,'maj7',rp*maj7); addHeadMass(sevRow,sevLabels,'dim7',rp*dim7);
      seventhPresent+=rp*Math.max(b7,maj7,dim7);
    }
    addHeadMass(sevRow,sevLabels,'none',Math.max(0.05,1-2.2*seventhPresent));
    heads.seventh.push(normalizedHead(sevRow));

    const extLabels=labelsByHead.extension||[], extRow=new Array(extLabels.length).fill(0);
    let extPresent=0;
    for(let r=0;r<12;r++){
      const ri=headLabelIndex(rootLabels,PC_TO_SHARP[r]); const rp=ri>=0?rootPosterior[ri]:1/12;
      const vals={ '6':normPc[(r+9)%12], '9':normPc[(r+2)%12], 'add9':normPc[(r+2)%12], '11':normPc[(r+5)%12], 'add11':normPc[(r+5)%12], '13':normPc[(r+9)%12] };
      for(const [lbl,v] of Object.entries(vals)){addHeadMass(extRow,extLabels,lbl,rp*v);extPresent=Math.max(extPresent,rp*v);}
    }
    addHeadMass(extRow,extLabels,'none',Math.max(0.06,1-2.6*extPresent));
    heads.extension.push(normalizedHead(extRow));

    const bassLabels=labelsByHead.bass||[], bassRow=new Array(bassLabels.length).fill(0);
    if(lowTotal<=0){addHeadMass(bassRow,bassLabels,'N',1);} else for(let pc=0;pc<12;pc++)addHeadMass(bassRow,bassLabels,PC_TO_SHARP[pc],normLow[pc]);
    heads.bass.push(normalizedHead(bassRow));

    for(const name of ['root','triad','seventh','extension','bass']){
      const row=heads[name][f], sorted=[...row].sort((a,b)=>b-a), top=sorted[0]||0, second=sorted[1]||0;
      const activityGate=clamp(total/Math.max(1e-6,frameDuration*0.55),0,1);
      confidences[name].push(clamp((top-second)*2.0+0.35*activityGate,0,1));
    }
  }
  return {provider:noteData.provider||'multi-pitch',heads,confidences,activeFrames,frameCount:targetFrames};
}
function temporalSmoothRows(rows, radius){
  if(!Array.isArray(rows)||!rows.length||radius<=0)return rows||[];
  const out=[];
  for(let i=0;i<rows.length;i++){
    const acc=new Array(rows[i]?.length||0).fill(0); let z=0;
    for(let j=Math.max(0,i-radius);j<=Math.min(rows.length-1,i+radius);j++){
      const d=Math.abs(j-i), w=radius+1-d; z+=w;
      const row=rows[j]||[]; for(let k=0;k<acc.length;k++)acc[k]+=(row[k]||0)*w;
    }
    out.push(normalizedHead(acc.map(v=>v/Math.max(1,z))));
  }
  return out;
}
function temporalSmoothScalar(values,radius){
  if(!Array.isArray(values)||!values.length||radius<=0)return values||[];
  return values.map((_,i)=>{let a=0,z=0;for(let j=Math.max(0,i-radius);j<=Math.min(values.length-1,i+radius);j++){const w=radius+1-Math.abs(j-i);a+=(Number(values[j])||0)*w;z+=w;}return a/Math.max(1,z);});
}
function stabilizeCategoricalDwell(rows,labels,minFrames,blend){
  if(!Array.isArray(rows)||!rows.length||minFrames<=1||blend<=0)return rows||[];
  const neutralIdx=Math.max(0,labels.indexOf('none')>=0?labels.indexOf('none'):labels.indexOf('N'));
  const tops=rows.map(r=>{let b=0;for(let k=1;k<r.length;k++)if(r[k]>r[b])b=k;return b;});
  const out=rows.map(r=>r.slice());
  let start=0;
  while(start<tops.length){let end=start+1;while(end<tops.length&&tops[end]===tops[start])end++;const len=end-start, idx=tops[start];
    if(idx!==neutralIdx && len<minFrames){
      for(let i=start;i<end;i++){
        const row=out[i].slice(), mass=row[idx]||0, move=mass*blend;
        row[idx]=Math.max(1e-6,mass-move); row[neutralIdx]=(row[neutralIdx]||0)+move;
        out[i]=normalizedHead(row);
      }
    }
    start=end;
  }
  return out;
}
function buildTemporalChangeContext(frameCount,frameDuration,beatMap,probModel,tuning){
  const gate=new Array(frameCount).fill(0);
  if(!tuning.transcriptionContextAware)return {gate,diagnostics:{enabled:false}};
  const radiusSec=Math.max(0.035,Math.min(0.18,frameDuration*2.2));
  for(const b of (beatMap||[])){
    const t=Number(b.time??b.curr_beat_time); if(!Number.isFinite(t))continue;
    const center=Math.round(t/frameDuration), span=Math.max(1,Math.ceil(radiusSec/frameDuration));
    const strength=b.downbeat?tuning.transcriptionDownbeatRelease:tuning.transcriptionBeatRelease;
    for(let j=Math.max(0,center-span);j<=Math.min(frameCount-1,center+span);j++){
      const d=Math.abs(j-center)/Math.max(1,span), v=strength*(1-d*0.78); gate[j]=Math.max(gate[j],v);
    }
  }
  let noveltyUsed=0;
  try{
    const nov=probModel?harmonicNoveltyCurve(probModel):[];
    if(nov?.length){
      const mx=Math.max(1e-6,...nov.map(x=>Number(x)||0));
      for(let i=0;i<Math.min(frameCount,nov.length);i++){
        const n=clamp((Number(nov[i])||0)/mx,0,1); if(n>0.18){gate[i]=Math.max(gate[i],n*tuning.transcriptionNoveltyRelease);noveltyUsed++;}
      }
    }
  }catch(e){}
  return {gate:gate.map(x=>clamp(x,0,0.95)),diagnostics:{enabled:true,beatCount:(beatMap||[]).length,noveltyFrames:noveltyUsed,meanGate:gate.reduce((a,b)=>a+b,0)/Math.max(1,gate.length)}};
}
function temporalSmoothRowsAdaptive(rows,baseRadius,gates,minRatio){
  if(!Array.isArray(rows)||!rows.length||baseRadius<=0)return rows||[];
  const out=[];
  for(let i=0;i<rows.length;i++){
    const rel=clamp(1-(Number(gates?.[i])||0),minRatio,1), radius=Math.max(0,Math.round(baseRadius*rel));
    if(radius===0){out.push(rows[i].slice());continue;}
    const acc=new Array(rows[i]?.length||0).fill(0); let z=0;
    for(let j=Math.max(0,i-radius);j<=Math.min(rows.length-1,i+radius);j++){
      const d=Math.abs(j-i),w=radius+1-d;z+=w;const row=rows[j]||[];for(let k=0;k<acc.length;k++)acc[k]+=(row[k]||0)*w;
    }
    out.push(normalizedHead(acc.map(v=>v/Math.max(1,z))));
  }
  return out;
}
function stabilizeCategoricalDwellAdaptive(rows,labels,minFrames,blend,gates){
  if(!Array.isArray(rows)||!rows.length||minFrames<=1||blend<=0)return rows||[];
  const neutralIdx=Math.max(0,labels.indexOf('none')>=0?labels.indexOf('none'):labels.indexOf('N'));
  const tops=rows.map(r=>{let b=0;for(let k=1;k<r.length;k++)if(r[k]>r[b])b=k;return b;}); const out=rows.map(r=>r.slice());
  let start=0;
  while(start<tops.length){let end=start+1;while(end<tops.length&&tops[end]===tops[start])end++;const idx=tops[start],len=end-start;
    const localGate=(gates||[]).slice(start,end).reduce((a,b)=>a+(Number(b)||0),0)/Math.max(1,len);
    const required=Math.max(1,Math.round(minFrames*(1-0.72*localGate)));
    if(idx!==neutralIdx&&len<required){for(let i=start;i<end;i++){const row=out[i].slice(),mass=row[idx]||0,move=mass*blend*(1-localGate*0.65);row[idx]=Math.max(1e-6,mass-move);row[neutralIdx]=(row[neutralIdx]||0)+move;out[i]=normalizedHead(row);}}
    start=end;
  }
  return out;
}
function stabilizeNoteHeadEvidence(note,frameDuration,labelsByHead,tuning,temporalContext=null){
  if(!note?.heads)return {note,diagnostics:{applied:false}};
  const persistenceMs={root:tuning.transcriptionRootPersistenceMs,triad:tuning.transcriptionTriadPersistenceMs,seventh:tuning.transcriptionSeventhPersistenceMs,extension:tuning.transcriptionExtensionPersistenceMs,bass:tuning.transcriptionBassPersistenceMs};
  const minDwellMs={root:0,triad:0,seventh:tuning.transcriptionSeventhMinDwellMs,extension:tuning.transcriptionExtensionMinDwellMs,bass:0};
  const heads={},confidences={},perHead={};
  for(const name of ['root','triad','seventh','extension','bass']){
    const radius=Math.max(0,Math.round((persistenceMs[name]/1000)/Math.max(frameDuration,1e-4)/2));
    let rows=(temporalContext?.gate?.length?temporalSmoothRowsAdaptive(note.heads[name],radius,temporalContext.gate,tuning.transcriptionContextMinRadiusRatio):temporalSmoothRows(note.heads[name],radius));
    const dwellFrames=Math.max(1,Math.round((minDwellMs[name]/1000)/Math.max(frameDuration,1e-4)));
    rows=(temporalContext?.gate?.length?stabilizeCategoricalDwellAdaptive(rows,labelsByHead[name]||[],dwellFrames,tuning.transcriptionTemporalBlend,temporalContext.gate):stabilizeCategoricalDwell(rows,labelsByHead[name]||[],dwellFrames,tuning.transcriptionTemporalBlend));
    heads[name]=rows; confidences[name]=temporalSmoothScalar(note.confidences[name],Math.max(0,Math.floor(radius/2)));
    let changes=0; for(let i=1;i<rows.length;i++){let a=0,b=0;for(let k=1;k<rows[i-1].length;k++)if(rows[i-1][k]>rows[i-1][a])a=k;for(let k=1;k<rows[i].length;k++)if(rows[i][k]>rows[i][b])b=k;if(a!==b)changes++;}
    perHead[name]={persistenceMs:persistenceMs[name],radiusFrames:radius,minDwellMs:minDwellMs[name],minDwellFrames:dwellFrames,topLabelChanges:changes};
  }
  return {note:{...note,heads,confidences},diagnostics:{applied:true,method:temporalContext?.gate?.length?'context-aware-head-persistence-v2':'head-specific-temporal-persistence-v1',temporalBlend:tuning.transcriptionTemporalBlend,context:temporalContext?.diagnostics||{enabled:false},perHead}};
}

function blendHeadRows(baseRows,noteRows,confidences,weight,minConfidence){
  const out=[]; let used=0,sumW=0,disagree=0;
  const n=Math.min(baseRows?.length||0,noteRows?.length||0);
  for(let i=0;i<n;i++){
    const conf=clamp(Number(confidences?.[i]||0),0,1);
    const gate=conf<minConfidence?0:clamp((conf-minConfidence)/Math.max(1e-6,1-minConfidence),0,1);
    const w=clamp(weight*gate,0,0.95); const a=noteRows[i]||[],b=baseRows[i]||[];
    const row=new Array(Math.max(a.length,b.length)).fill(0).map((_,j)=>(a[j]||0)*w+(b[j]||0)*(1-w));
    out.push(normalizedHead(row));
    if(w>0){used++;sumW+=w;let ai=0,bi=0;for(let j=1;j<a.length;j++)if(a[j]>a[ai])ai=j;for(let j=1;j<b.length;j++)if(b[j]>b[bi])bi=j;if(ai!==bi)disagree++;}
  }
  if((baseRows?.length||0)>n)out.push(...baseRows.slice(n));
  return {rows:out,used,meanWeight:used?sumW/used:0,disagreementRate:used?disagree/used:0};
}
function fuseNoteEvidenceIntoMultiHeadModel(model,noteData,frameDuration,tuning,temporalContext=null){
  const factor=model?.factorized; if(!factor?.headRows||!noteData?.notes?.length||tuning.transcriptionHeadWeight<=0)return {model,diagnostics:{available:!!noteData,applied:false}};
  const rawNote=buildNoteHeadEvidence(noteData,factor.headRows.root.length,frameDuration,factor.labelsByHead,tuning); if(!rawNote)return {model,diagnostics:{available:false,applied:false}};
  const temporal=stabilizeNoteHeadEvidence(rawNote,frameDuration,factor.labelsByHead,tuning,temporalContext); const note=temporal.note;
  const headScale={root:tuning.transcriptionRootHeadWeight,triad:tuning.transcriptionTriadHeadWeight,seventh:tuning.transcriptionSeventhHeadWeight,extension:tuning.transcriptionExtensionHeadWeight,bass:tuning.transcriptionBassHeadWeight};
  const blended={}, perHead={}; let totalUsed=0;
  for(const name of ['root','triad','seventh','extension','bass']){
    const r=blendHeadRows(factor.headRows[name],note.heads[name],note.confidences[name],tuning.transcriptionHeadWeight*headScale[name],tuning.transcriptionHeadMinConfidence);
    blended[name]=r.rows; perHead[name]={usedFrames:r.used,meanWeight:round(r.meanWeight,4),disagreementRate:round(r.disagreementRate,4)}; totalUsed+=r.used;
  }
  const rebuilt=rebuildMultiHeadChordModel(blended,factor.labelsByHead,factor.vocab,factor.thresholdReport,{source:(model.source||'onnx-multihead')+'+basic-pitch-head-fusion-v56',modelName:model.modelName,calibration:model.calibration,decisionThresholds:model.decisionThresholds});
  return {model:rebuilt,diagnostics:{available:true,applied:totalUsed>0,provider:note.provider,method:'factorized-note-head-fusion-v3-context-aware',baseWeight:tuning.transcriptionHeadWeight,minConfidence:tuning.transcriptionHeadMinConfidence,temporal:temporal.diagnostics,perHead}};
}

function blendTranscriptionEvidenceModel(noteModel, baseModel, tuning) {
  if(!noteModel?.observations?.length || !baseModel?.observations?.length || tuning.transcriptionHarmonyWeight<=0) return {model:baseModel,diagnostics:{available:!!noteModel,applied:false,weight:0}};
  const n=Math.min(noteModel.observations.length,baseModel.observations.length), observations=[];
  let sumW=0,used=0,disagree=0,meanTop=0;
  for(let i=0;i<n;i++){
    const a=noteModel.observations[i], b=baseModel.observations[i];
    const conf=clamp(Number(a.confidence||0),0,1);
    const gate=conf<tuning.transcriptionHarmonyMinConfidence?0:clamp((conf-tuning.transcriptionHarmonyMinConfidence)/Math.max(1e-6,1-tuning.transcriptionHarmonyMinConfidence),0,1);
    const w=tuning.transcriptionHarmonyWeight*gate;
    const labels=new Set(['N']); for(const x of (a.probabilities||[]))labels.add(x.chord);for(const x of (b.probabilities||[]))labels.add(x.chord);
    const probs=[]; for(const chord of labels)probs.push({chord,probability:probabilityFor(a,chord)*w+probabilityFor(b,chord)*(1-w)});
    const z=probs.reduce((x,y)=>x+y.probability,0)||1;for(const x of probs)x.probability/=z;probs.sort((x,y)=>y.probability-x.probability);
    const top=probs[0]||{chord:'N',probability:0};meanTop+=top.probability;
    if(w>0){used++;sumW+=w;if(canonicalChordLabel(a.top)!==canonicalChordLabel(b.top))disagree++;}
    observations.push({top:top.chord,confidence:top.probability,probabilities:probs.slice(0,24),noteEvidenceWeight:round(w,3)});
  }
  if(baseModel.observations.length>n) observations.push(...baseModel.observations.slice(n));
  return {model:{...baseModel,observations,meanTopProbability:observations.length?meanTop/observations.length:baseModel.meanTopProbability,source:(baseModel.source||'acoustic')+'+note-evidence-v56'},diagnostics:{available:true,applied:used>0,provider:noteModel.provider,usedFrames:used,frameCount:n,meanWeight:used?round(sumW/used,4):0,disagreementRate:used?round(disagree/used,4):0,minConfidence:tuning.transcriptionHarmonyMinConfidence,baseWeight:tuning.transcriptionHarmonyWeight}};
}

function transcriptionEvidenceForSegment(noteData, seg, tuning) {
  if (!noteData?.notes?.length) return null;
  const start=Number(seg.start||0), end=Number(seg.end||start), dur=Math.max(1e-4,end-start);
  const guard=Math.min(0.10,dur*0.18), from=start+guard, to=end-guard>from?end-guard:end;
  const active=[];
  for(const n of noteData.notes){
    if(n.end<=from) continue;
    if(n.start>=to) break;
    const overlap=Math.max(0,Math.min(to,n.end)-Math.max(from,n.start));
    if(overlap<=0) continue;
    const score=overlap*Math.max(0.04,n.confidence);
    active.push({...n,overlap,score});
  }
  if(!active.length) return null;

  // Bass evidence: prefer genuinely low notes but keep the method instrument-agnostic.
  const lows=active.filter(n=>n.midi<=60);
  const pool=lows.length?lows:active.slice().sort((a,b)=>a.midi-b.midi).slice(0,Math.max(1,Math.ceil(active.length*.35)));
  const byPc=new Map(), byMidi=new Map();
  for(const n of pool){
    const lowBias=1+clamp((60-n.midi)/36,0,0.55);
    const w=n.score*lowBias;
    byPc.set(n.pc,(byPc.get(n.pc)||0)+w);
    byMidi.set(n.midi,(byMidi.get(n.midi)||0)+w);
  }
  const pcEntries=[...byPc.entries()].sort((a,b)=>b[1]-a[1]);
  const midiEntries=[...byMidi.entries()].sort((a,b)=>b[1]-a[1]);
  const totalPc=pcEntries.reduce((a,x)=>a+x[1],0)||1;
  const bestPc=pcEntries[0]?.[0];
  const bestMidiForPc=midiEntries.find(([m])=>((m%12)+12)%12===bestPc)?.[0] ?? midiEntries[0]?.[0];
  const bassPurity=(pcEntries[0]?.[1]||0)/totalPc;
  const bassCoverage=clamp(pool.filter(n=>n.pc===bestPc).reduce((a,n)=>a+n.overlap,0)/dur,0,1);
  const bassMeanConf=pool.filter(n=>n.pc===bestPc).reduce((a,n)=>a+n.confidence*n.overlap,0)/Math.max(1e-6,pool.filter(n=>n.pc===bestPc).reduce((a,n)=>a+n.overlap,0));
  const bassConfidence=clamp(0.46*bassPurity+0.34*bassCoverage+0.20*bassMeanConf,0,1);

  const voicingByMidi=new Map();
  for(const n of active){
    if(n.confidence<tuning.transcriptionVoicingMinConfidence) continue;
    voicingByMidi.set(n.midi,(voicingByMidi.get(n.midi)||0)+n.score);
  }
  const observedVoicing=[...voicingByMidi.entries()].sort((a,b)=>b[1]-a[1]).slice(0,tuning.transcriptionMaxVoicingNotes).map(([m,w])=>({midi:m,note:noteNameWithOctave(m),pc:((m%12)+12)%12,weight:round(w,4)})).sort((a,b)=>a.midi-b.midi);
  return {provider:noteData.provider,bassPc:bestPc,bassMidi:bestMidiForPc,bassNote:Number.isFinite(bestMidiForPc)?noteNameWithOctave(bestMidiForPc):null,bassConfidence,bassCoverage,bassPurity,observedVoicing,activeNoteCount:active.length};
}

function applyNoteTranscriptionToSegments(segments, noteData, tuning) {
  if(!noteData?.notes?.length) return {segments,diagnostics:{available:false,applied:0,verified:0,overridden:0,removed:0,noteCount:0}};
  let applied=0,verified=0,overridden=0,removed=0,annotated=0;
  const out=segments.map(seg=>{
    const parsed=parseChordCore(seg.chord);
    const ev=transcriptionEvidenceForSegment(noteData,seg,tuning);
    if(!parsed||!ev||ev.bassPc==null) return ev?{...seg,noteTranscription:ev}:seg;
    annotated++;
    const allowed=new Set(qualityIntervals(parsed.quality,parsed.suffix).map(x=>(parsed.root+x)%12));
    const strong=ev.bassConfidence>=tuning.transcriptionBassMinConfidence && ev.bassCoverage>=tuning.transcriptionBassMinCoverage;
    const currentBass=parsed.bass!=null?parsed.bass:parsed.root;
    const currentStemConf=Number(seg.bassEvidence?.confidence||0);
    const base=parsed.rootName+parsed.suffix;
    let chord=seg.chord, action='annotated';
    if(strong && ev.bassPc===currentBass){ verified++; action='verified'; }
    else if(strong && allowed.has(ev.bassPc)){
      const canOverride=!seg.bassEvidence?.applied || ev.bassConfidence>=currentStemConf+tuning.transcriptionInversionOverrideMargin;
      if(canOverride){
        if(ev.bassPc===parsed.root){
          if(parsed.bass!=null){ chord=base; removed++; action='removed-unsupported-inversion'; }
        } else {
          const bassName=PC_TO_SHARP[ev.bassPc];
          chord=`${base}/${bassName}`;
          if(parsed.bass!=null && parsed.bass!==ev.bassPc){overridden++; action='replaced-inversion';}
          else if(parsed.bass==null){applied++; action='added-inversion';}
        }
      }
    }
    return {...seg,chord,noteTranscription:{...ev,bassConfidence:round(ev.bassConfidence,3),bassCoverage:round(ev.bassCoverage,3),bassPurity:round(ev.bassPurity,3),action,applied:chord!==seg.chord}};
  });
  return {segments:out,diagnostics:{available:true,provider:noteData.provider,noteCount:noteData.noteCount,annotated,applied,verified,overridden,removed}};
}

async function extractAuxHarmonyStream(audioData, sampleRate, targetFrames, progressLabel) {
  if (!audioData || !audioData.length) return null;
  if (progressLabel) postMessage({type:'progress',message:progressLabel});
  const v = essentia.arrayToVector(audioData);
  try {
    const tonal = essentia.TonalExtractor(v,4096,2048,440);
    const chords = vectorToArray(tonal.chords_progression);
    const strengths = vectorToArray(tonal.chords_strength);
    let hpcpRaw=[]; try {hpcpRaw=vectorVectorToArray(tonal.hpcp);} catch(e){}
    const model = buildProbabilisticObservations(hpcpRaw,chords,strengths);
    return {model:alignModelLength(model,targetFrames),hpcpRaw,chords,strengths};
  } finally { try{v.delete();}catch(e){} }
}

async function extractBassStream(audioData, sampleRate, targetFrames, progressLabel) {
  const aux = await extractAuxHarmonyStream(audioData,sampleRate,targetFrames,progressLabel);
  if (!aux) return null;
  const shift = aux.model?.shift || 0;
  return {rootModel:buildBassRootModel(aux.hpcpRaw,targetFrames,shift), chordModel:aux.model};
}

function extractDrumBeatStream(audioData,sampleRate,duration) {
  if (!audioData || !audioData.length) return null;
  const v=essentia.arrayToVector(audioData); let rhythm=null;
  try {
    rhythm=essentia.RhythmExtractor2013(v,1024,1024,256,0.1,208,40,1024,sampleRate,[],0.24,true,true);
    const beats=normalizeBeats(vectorToArray(rhythm.ticks),duration);
    const bpm=rhythm.bpm?round(Number(rhythm.bpm),1):null;
    const meter=estimateMeterFromBeats(beats);
    const beatMap=buildBeatMap(beats,meter,duration);
    const beatAccents=beatAccentProfile(audioData,sampleRate,beatMap);
    return {bpm,meter,beatMap,beatAccents,beats};
  } catch(e){return null;} finally {try{v.delete();}catch(e){} try{rhythm&&rhythm.ticks&&rhythm.ticks.delete();}catch(e){}}
}


function rmsEnergyEnvelope(audioData,sampleRate,duration,frameSec=0.5){
  if(!audioData||!audioData.length||!sampleRate)return [];
  const frame=Math.max(128,Math.round(sampleRate*frameSec));
  const out=[]; let maxRms=1e-9;
  for(let i=0;i<audioData.length;i+=frame){
    const end=Math.min(audioData.length,i+frame); let ss=0,peak=0;
    for(let j=i;j<end;j++){const x=Number(audioData[j]||0);ss+=x*x;peak=Math.max(peak,Math.abs(x));}
    const n=Math.max(1,end-i),rms=Math.sqrt(ss/n);maxRms=Math.max(maxRms,rms);
    out.push({time:Math.min(duration,(i+end)/(2*sampleRate)),rms,peak});
  }
  for(const x of out){x.rmsNorm=clamp(x.rms/maxRms,0,1);x.peakNorm=clamp(x.peak,0,1);}
  return out;
}
function intervalMeanEnvelope(env,start,end,key='rmsNorm'){
  if(!env?.length||end<=start)return 0;
  let sum=0,n=0;
  for(const x of env){if(x.time>=start&&x.time<end){sum+=Number(x[key]||0);n++;}}
  return n?sum/n:0;
}
function intervalSlopeEnvelope(env,start,end,key='rmsNorm'){
  if(!env?.length||end<=start)return 0;
  const pts=env.filter(x=>x.time>=start&&x.time<end); if(pts.length<2)return 0;
  const first=pts.slice(0,Math.max(1,Math.floor(pts.length/3))).reduce((a,b)=>a+Number(b[key]||0),0)/Math.max(1,Math.floor(pts.length/3));
  const tail=pts.slice(-Math.max(1,Math.floor(pts.length/3))).reduce((a,b)=>a+Number(b[key]||0),0)/Math.max(1,Math.floor(pts.length/3));
  return clamp(tail-first,-1,1);
}
async function extractMultiStreamFeatures(streams,sampleRate,duration,progress=true,loadAllNeural=false,rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null) {
  const mix = streams?.mix;
  if (!mix || !mix.length) throw new Error('El análisis multi-stream requiere un stream mix.');
  const base = await extractAnalysisFeatures(mix,sampleRate,duration,progress,loadAllNeural,rhythmAnalysis,chordAnalysis,noteAnalysis);
  // Conserva la cuadrícula del MIX para poder hacer A/B de DRUMS sin reextraer features.
  base.mixBeatMap = base.beatMap;
  base.mixBpm = base.bpm;
  base.mixMeter = base.meter;
  const targetFrames = base.rawChords.length;
  const streamFeatures = {mix:true,other:false,bass:false,drums:false,vocals:false};
  if (streams.other?.length) {
    const other=await extractAuxHarmonyStream(streams.other,sampleRate,targetFrames,'Analizando armonía del stem OTHER…');
    base.otherModel=other?.model||null; streamFeatures.other=!!base.otherModel;
  }
  if (streams.bass?.length) {
    const bass=await extractBassStream(streams.bass,sampleRate,targetFrames,'Analizando raíz e inversiones del stem BASS…');
    base.bassRootModel=bass?.rootModel||null; base.bassChordModel=bass?.chordModel||null; streamFeatures.bass=!!base.bassRootModel;
  }
  if (streams.vocals?.length) {
    base.vocalEnergyEnvelope=rmsEnergyEnvelope(streams.vocals,sampleRate,duration,0.5);
    streamFeatures.vocals=!!base.vocalEnergyEnvelope?.length;
  }
  if (streams.drums?.length) {
    if(progress) postMessage({type:'progress',message:'Recalculando beat map desde DRUMS…'});
    const drums=extractDrumBeatStream(streams.drums,sampleRate,duration);
    if (drums?.beatMap?.length>=4) {
      base.drumsBeatMap=drums.beatMap;
      base.drumsBpm=drums.bpm||null;
      base.drumsMeter=drums.meter||null;
      base.drumsBeatAccents=drums.beatAccents||null;
      streamFeatures.drums=true;
    }
  }
  base.streamFeatures=streamFeatures;
  base.multiStream=true;
  return base;
}

EssentiaWASM().then((wasmModule) => {
  essentia = new Essentia(wasmModule);
  ready = true;
  postMessage({ type: 'ready', version: essentia.version });
}).catch((err) => {
  postMessage({ type: 'error', message: 'No se pudo inicializar Essentia: ' + err.message });
});

const NOTE_TO_PC = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
};
const PC_TO_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function vectorToArray(vector) {
  const arr = [];
  for (let i = 0; i < vector.size(); i++) arr.push(vector.get(i));
  return arr;
}

function vectorVectorToArray(vector) {
  const out = [];
  if (!vector || typeof vector.size !== 'function') return out;
  for (let i = 0; i < vector.size(); i++) {
    const inner = vector.get(i);
    if (inner && typeof inner.size === 'function') out.push(vectorToArray(inner));
    else if (Array.isArray(inner)) out.push(inner.slice());
    else out.push([]);
  }
  return out;
}

function safeDeleteVectorVector(vector) {
  if (!vector || typeof vector.size !== 'function') return;
  try {
    for (let i = 0; i < vector.size(); i++) {
      const inner = vector.get(i);
      try { inner && inner.delete && inner.delete(); } catch (e) {}
    }
  } catch (e) {}
  try { vector.delete && vector.delete(); } catch (e) {}
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round(v, digits = 3) {
  const p = Math.pow(10, digits);
  return Math.round(v * p) / p;
}
function median(values) {
  if (!values.length) return null;
  const a = values.slice().sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function normalizeChordSuffix(rawSuffix) {
  let s = String(rawSuffix || '').trim()
    .replace(/♭/g, 'b').replace(/♯/g, '#')
    .replace(/Δ/g, 'maj').replace(/−/g, 'm')
    .replace(/min/ig, 'm').replace(/major/ig, 'maj')
    .replace(/\s+/g, '');
  if (!s) return '';
  s = s.replace(/^M(?=7|9|11|13)/, 'maj');
  s = s.replace(/^mmaj/i, 'mMaj');
  s = s.replace(/ø7?/ig, 'm7b5');
  s = s.replace(/°7/ig, 'dim7').replace(/°/ig, 'dim');
  s = s.replace(/\+/g, 'aug');
  s = s.replace(/^7sus$/i, '7sus4');
  return s;
}

function classifyChordSuffix(suffix) {
  const s = normalizeChordSuffix(suffix);
  const low = s.toLowerCase();
  if (!s) return {quality:'major', family:'major', level:0, canonical:''};
  if (/^m7b5/.test(low)) return {quality:'half-diminished', family:'minor', level:2, canonical:'m7b5'};
  if (/^dim7/.test(low)) return {quality:'dim', family:'dim', level:2, canonical:'dim7'};
  if (/^dim/.test(low)) return {quality:'dim', family:'dim', level:1, canonical:'dim'};
  if (/^aug/.test(low)) return {quality:'aug', family:'aug', level:1, canonical:'aug'};
  if (/^sus2/.test(low)) return {quality:'sus', family:'sus', level:1, canonical:'sus2'};
  if (/^(7)?sus4/.test(low) || /^sus/.test(low)) return {quality:'sus', family:'sus', level:/^7/.test(low)?2:1, canonical:/^7/.test(low)?'7sus4':'sus4'};
  if (/^mmaj7/.test(low)) return {quality:'minor', family:'minor', level:3, canonical:'mMaj7'};
  if (/^maj13/.test(low)) return {quality:'major', family:'major', level:4, canonical:'maj13'};
  if (/^maj11/.test(low)) return {quality:'major', family:'major', level:4, canonical:'maj11'};
  if (/^maj9/.test(low)) return {quality:'major', family:'major', level:3, canonical:'maj9'};
  if (/^maj7/.test(low)) return {quality:'major', family:'major', level:2, canonical:'maj7'};
  if (/^m13/.test(low)) return {quality:'minor', family:'minor', level:4, canonical:'m13'};
  if (/^m11/.test(low)) return {quality:'minor', family:'minor', level:4, canonical:'m11'};
  if (/^m9/.test(low)) return {quality:'minor', family:'minor', level:3, canonical:'m9'};
  if (/^m7/.test(low)) return {quality:'minor', family:'minor', level:2, canonical:'m7'};
  if (/^m6/.test(low)) return {quality:'minor', family:'minor', level:2, canonical:'m6'};
  if (/^m(?!aj)/.test(low)) return {quality:'minor', family:'minor', level:0, canonical:'m'};
  if (/^13/.test(low)) return {quality:'dominant', family:'major', level:4, canonical:'13'};
  if (/^11/.test(low)) return {quality:'dominant', family:'major', level:4, canonical:'11'};
  if (/^9/.test(low)) return {quality:'dominant', family:'major', level:3, canonical:'9'};
  if (/^7/.test(low)) return {quality:'dominant', family:'major', level:2, canonical:'7'};
  if (/^6/.test(low)) return {quality:'major', family:'major', level:2, canonical:'6'};
  if (/^add9/.test(low)) return {quality:'major', family:'major', level:2, canonical:'add9'};
  if (/^add11/.test(low)) return {quality:'major', family:'major', level:3, canonical:'add11'};
  const altered = /(b5|#5|b9|#9|#11|b13)/i.test(s);
  return {quality:'major', family:'major', level:altered?4:2, canonical:s, altered};
}

function parseChordCore(label) {
  if (!label || label === 'N' || label === 'X') return null;
  const s = String(label).trim().replace(/:/g, '');
  const m = s.match(/^([A-G])([#b]?)([^/]*)(?:\/([A-G])([#b]?))?$/i);
  if (!m) return null;
  const rootName = m[1].toUpperCase() + (m[2] || '');
  const root = NOTE_TO_PC[rootName];
  if (root === undefined) return null;
  const suffix = normalizeChordSuffix(m[3] || '');
  const bassName = m[4] ? m[4].toUpperCase() + (m[5] || '') : null;
  const bass = bassName != null ? NOTE_TO_PC[bassName] : null;
  const cls = classifyChordSuffix(suffix);
  return { root, rootName, quality: cls.quality, family: cls.family, complexity: cls.level, altered: !!cls.altered, suffix, canonicalSuffix: cls.canonical, bass, bassName, original: s };
}

function canonicalChordLabel(label) {
  const p = parseChordCore(label);
  if (!p) return label || 'N';
  return p.rootName + p.canonicalSuffix + (p.bassName ? '/' + p.bassName : '');
}

function chordRepresentations(label) {
  const p = parseChordCore(label);
  if (!p) return { simple: label || 'N', basic: label || 'N', complex: label || 'N', root: null, bass: null, complexity:0 };
  let simpleSuffix = '';
  if (p.family === 'minor') simpleSuffix = 'm';
  else if (p.quality === 'dim') simpleSuffix = 'dim';
  else if (p.quality === 'aug') simpleSuffix = 'aug';
  else if (p.quality === 'sus') simpleSuffix = /sus2/i.test(p.canonicalSuffix) ? 'sus2' : 'sus4';
  const simple = p.rootName + simpleSuffix;

  let basicSuffix = p.canonicalSuffix;
  if (p.complexity >= 3) {
    if (p.family === 'minor') basicSuffix = /7|9|11|13/.test(p.canonicalSuffix) ? 'm7' : 'm';
    else if (/maj/.test(p.canonicalSuffix)) basicSuffix = 'maj7';
    else if (/^(9|11|13)/.test(p.canonicalSuffix)) basicSuffix = '7';
    else basicSuffix = p.canonicalSuffix.replace(/add(?:9|11|13)/ig, '');
  }
  if (!basicSuffix && p.family === 'minor') basicSuffix = 'm';
  const basic = p.rootName + basicSuffix + (p.bassName ? '/' + p.bassName : '');
  return { simple, basic, complex: canonicalChordLabel(label), root: p.rootName, bass: p.bassName, complexity:p.complexity };
}

function sameChordFamily(a, b) {
  const pa=parseChordCore(a), pb=parseChordCore(b);
  return !!(pa && pb && pa.root===pb.root && pa.family===pb.family);
}

function probabilityAtObservationForLabel(obs, label) {
  if (!obs?.probabilities?.length) return 0;
  const target=canonicalChordLabel(label);
  let p=0;
  for (const x of obs.probabilities) if (canonicalChordLabel(x.chord)===target) p += Number(x.probability||0);
  return p;
}

function familyProbability(obs, label) {
  if (!obs?.probabilities?.length) return 0;
  let p=0;
  for (const x of obs.probabilities) if (sameChordFamily(x.chord,label)) p += Number(x.probability||0);
  return p;
}


function chordHierarchyComponents(label) {
  const p = parseChordCore(label);
  if (!p) return null;
  const low = String(p.canonicalSuffix || '').toLowerCase();
  let triad = 'major';
  if (low.startsWith('m7b5')) triad = 'dim';
  else if (low.startsWith('dim')) triad = 'dim';
  else if (low.startsWith('aug')) triad = 'aug';
  else if (low.startsWith('sus2')) triad = 'sus2';
  else if (low.includes('sus4') || low === 'sus') triad = 'sus4';
  else if (low.startsWith('m') && !low.startsWith('maj')) triad = 'minor';

  let seventh = 'none';
  if (low.startsWith('dim7')) seventh = 'dim7';
  else if (low.startsWith('mmaj7')) seventh = 'maj7';
  else if (low.startsWith('maj7') || low.startsWith('maj9') || low.startsWith('maj11') || low.startsWith('maj13')) seventh = 'maj7';
  else if (/^(m?7|m?9|m?11|m?13|7sus4|m7b5)/.test(low)) seventh = 'b7';

  let extension = 'none';
  if (/(?:^|[^0-9])13/.test(low)) extension = '13';
  else if (/(?:^|[^0-9])11/.test(low)) extension = '11';
  else if (/(?:^|[^0-9])9/.test(low)) extension = low.includes('add9') ? 'add9' : '9';
  else if (low.includes('add11')) extension = 'add11';
  else if (/^(m?6)$/.test(low)) extension = '6';
  const alterations = (low.match(/(?:b5|#5|b9|#9|#11|b13)/g) || []).sort().join(',') || 'none';
  return {root:p.rootName,rootPc:p.root,triad,seventh,extension,alterations,bass:p.bassName||null,complexity:p.complexity};
}

function normalizePosteriorMap(map) {
  let total=0; for (const v of map.values()) total += Number(v||0);
  if (total <= 0) return map;
  for (const [k,v] of map.entries()) map.set(k, Number(v||0)/total);
  return map;
}
function topPosteriorEntry(map) {
  let key=null,value=0;
  for (const [k,v] of map.entries()) if (v>value) {key=k;value=v;}
  return {value:round(value,3), label:key};
}
function addPosterior(map,key,value){ if(key!=null) map.set(key,(map.get(key)||0)+Number(value||0)); }

function hierarchicalRefineChordSegments(segments, probabilityModel, sampleRate, hopSize, tuning=DEFAULT_TUNING) {
  if (!segments?.length) return segments || [];
  const obs = probabilityModel?.observations || [];
  if (!obs.length) return segments.map(seg=>({...seg,hierarchicalChord:{applied:false,reason:'no-probabilities'}}));
  const hop = hopSize/sampleRate;
  const eps=1e-6;
  return segments.map(seg=>{
    const current=canonicalChordLabel(seg.chord);
    const currentParts=chordHierarchyComponents(current);
    if (!currentParts) return {...seg,hierarchicalChord:{applied:false,reason:'unparsed-current'}};
    const i0=Math.max(0,Math.floor(seg.start/hop));
    const i1=Math.min(obs.length-1,Math.ceil(seg.end/hop));
    const exact=new Map(), roots=new Map(), triads=new Map(), sevenths=new Map(), extensions=new Map(), alterations=new Map();
    let frames=0;
    const candidates=new Set([current]);
    for(let i=i0;i<=i1;i++){
      const probs=obs[i]?.probabilities||[];
      if(!probs.length) continue;
      frames++;
      for(const x of probs){
        const pr=Number(x.probability||0); if(pr<=0) continue;
        const label=canonicalChordLabel(x.chord);
        const c=chordHierarchyComponents(label); if(!c) continue;
        if(pr>=0.004) candidates.add(label);
        addPosterior(exact,label,pr); addPosterior(roots,c.root,pr); addPosterior(triads,c.triad,pr);
        addPosterior(sevenths,c.seventh,pr); addPosterior(extensions,c.extension,pr); addPosterior(alterations,c.alterations,pr);
      }
    }
    if(!frames) return {...seg,hierarchicalChord:{applied:false,reason:'empty-segment-posterior'}};
    [exact,roots,triads,sevenths,extensions,alterations].forEach(normalizePosteriorMap);
    const weights={root:tuning.hierarchicalRootWeight,triad:tuning.hierarchicalTriadWeight,seventh:tuning.hierarchicalSeventhWeight,extension:tuning.hierarchicalExtensionWeight,exact:tuning.hierarchicalExactWeight};
    function score(label){
      const c=chordHierarchyComponents(label); if(!c) return -Infinity;
      const exactP=exact.get(canonicalChordLabel(label))||eps;
      let v=0;
      v += weights.root*Math.log((roots.get(c.root)||eps)+eps);
      v += weights.triad*Math.log((triads.get(c.triad)||eps)+eps);
      v += weights.seventh*Math.log((sevenths.get(c.seventh)||eps)+eps);
      v += weights.extension*Math.log((extensions.get(c.extension)||eps)+eps);
      v += weights.exact*Math.log(exactP+eps);
      const altP=alterations.get(c.alterations)||eps;
      if(c.alterations!=='none') v += 0.25*Math.log(altP+eps);
      v -= tuning.hierarchicalComplexityPenalty * c.complexity * (1-exactP);
      return v;
    }
    let best=current,bestScore=score(current);
    for(const label of candidates){ const sc=score(label); if(sc>bestScore){best=label;bestScore=sc;} }
    const currentScore=score(current), gain=bestScore-currentScore;
    const bestParts=chordHierarchyComponents(best);
    const rootGain=(roots.get(bestParts.root)||0)-(roots.get(currentParts.root)||0);
    const rootSafe=bestParts.root===currentParts.root || rootGain>=0.10;
    const exactBest=exact.get(best)||0;
    const applied=best!==current && gain>=tuning.hierarchicalMinGain && rootSafe && (roots.get(bestParts.root)||0)>=0.34 && (triads.get(bestParts.triad)||0)>=0.28;
    const chosen=applied?best:current;
    return {...seg,chord:chosen,hierarchicalChord:{
      applied,reason:applied?'factorized-posterior-gain':(best===current?'current-best':'gain-or-root-gate'),
      from:current,to:chosen,bestCandidate:best,scoreGain:round(gain,3),exactSupport:round(exactBest,3),frames,
      root:topPosteriorEntry(roots),triad:topPosteriorEntry(triads),seventh:topPosteriorEntry(sevenths),extension:topPosteriorEntry(extensions),alterations:topPosteriorEntry(alterations)
    }};
  });
}

function calibrateAdvancedChordSegments(segments, probabilityModel, sampleRate, hopSize, tuning=DEFAULT_TUNING) {
  if (!segments?.length) return segments || [];
  const obs = probabilityModel?.observations || [];
  const hop = hopSize / sampleRate;
  return segments.map(seg=>{
    const raw = canonicalChordLabel(seg.chord);
    const rep = chordRepresentations(raw);
    const pc = parseChordCore(raw);
    if (!pc || pc.complexity < 2 || !obs.length) return {...seg, chord:raw, detectedChord:raw, extensionCalibration:{applied:false,reason:'triad-or-no-probabilities'}};
    const i0=Math.max(0,Math.floor(seg.start/hop)), i1=Math.min(obs.length-1,Math.ceil(seg.end/hop));
    let exact=0,family=0,n=0;
    for(let i=i0;i<=i1;i++){exact+=probabilityAtObservationForLabel(obs[i],raw); family+=familyProbability(obs[i],raw); n++;}
    exact=n?exact/n:0; family=n?family/n:0;
    const ratio=family>1e-9?exact/family:0;
    const conf=Number(seg.confidence||0);
    const strict=pc.altered || pc.complexity>=4;
    const confMin=strict?tuning.alteredChordMinConfidence:tuning.extensionMinConfidence;
    const supportMin=tuning.extensionExactSupport + (strict?0.10:0);
    let chosen=raw, applied=false, reason='kept';
    if(conf<confMin || ratio<supportMin || (family-exact)>Math.max(0.12,tuning.extensionFamilyMargin+exact)){
      chosen = pc.complexity>=3 ? rep.basic : rep.simple;
      applied = canonicalChordLabel(chosen)!==raw;
      reason = conf<confMin?'low-segment-confidence':ratio<supportMin?'weak-exact-support':'family-dominates';
    }
    return {...seg, chord:canonicalChordLabel(chosen), detectedChord:raw, extensionCalibration:{applied,reason,exactSupport:round(exact,3),familySupport:round(family,3),exactRatio:round(ratio,3),segmentConfidence:round(conf,3),complexity:pc.complexity}};
  });
}

// ---------------- Beat map ----------------

function normalizeBeats(beats, duration) {
  if (!Array.isArray(beats)) return [];
  const clean = beats
    .map(Number)
    .filter((t) => Number.isFinite(t) && t >= 0 && t <= duration + 0.5)
    .sort((a, b) => a - b);
  const out = [];
  for (const t of clean) {
    if (!out.length || t - out[out.length - 1] > 0.08) out.push(t);
  }
  return out;
}

function estimateMeterFromBeats(beats) {
  // Essentia no devuelve downbeats aquí. Por ahora mantenemos una heurística conservadora.
  // La mayor parte de la música popular será 4/4; solo elegimos 3/4 o 6/4 cuando la
  // periodicidad de los intervalos ofrece evidencia suficiente.
  if (!beats || beats.length < 8) return 4;
  const intervals = [];
  for (let i = 1; i < beats.length; i++) {
    const d = beats[i] - beats[i - 1];
    if (d > 0.2 && d < 2.0) intervals.push(d);
  }
  const med = median(intervals);
  if (!med) return 4;

  // Sin acentos/downbeats reales no es responsable afirmar métrica compleja.
  // Dejamos 4 como default para no contaminar el chord map.
  return 4;
}

function buildBeatMap(beats, meter, duration) {
  const clean = normalizeBeats(beats, duration);
  const m = meter || 4;
  return clean.map((time, i) => ({
    time: round(time, 4),
    curr_beat_time: round(time, 4),
    beat_num: (i % m) + 1,
    bar_num: Math.floor(i / m) + 1,
    downbeat: i % m === 0
  }));
}



function beatAccentProfile(audioData, sampleRate, beatMap) {
  if (!audioData || !audioData.length || !beatMap || !beatMap.length || !sampleRate) return [];
  const raw=[];
  const n=audioData.length;
  for(const beat of beatMap){
    const center=Math.max(0,Math.min(n-1,Math.floor(beat.time*sampleRate)));
    const pre0=Math.max(0,center-Math.floor(0.055*sampleRate));
    const pre1=Math.max(pre0+1,center-Math.floor(0.008*sampleRate));
    const post0=Math.max(0,center-Math.floor(0.004*sampleRate));
    const post1=Math.min(n,center+Math.floor(0.115*sampleRate));
    let preE=0,preN=0,postE=0,postN=0,peak=0,diffE=0,last=audioData[post0]||0;
    for(let i=pre0;i<pre1;i++){const x=audioData[i]||0;preE+=x*x;preN++;}
    for(let i=post0;i<post1;i++){
      const x=audioData[i]||0; postE+=x*x; postN++; peak=Math.max(peak,Math.abs(x));
      const d=x-last; diffE+=d*d; last=x;
    }
    const preR=Math.sqrt(preE/Math.max(1,preN));
    const postR=Math.sqrt(postE/Math.max(1,postN));
    const transient=Math.sqrt(diffE/Math.max(1,postN));
    const rise=Math.max(0,postR-preR);
    raw.push(0.50*postR+0.22*peak+0.18*transient+0.10*rise);
  }
  const med=median(raw)||0;
  const mad=median(raw.map(x=>Math.abs(x-med)))||1e-6;
  return raw.map((x,i)=>({
    time:beatMap[i].time,
    raw:x,
    accent:clamp(1/(1+Math.exp(-(x-med)/(1.8*mad))),0,1)
  }));
}

function resampleBeatAccents(sourceMap, accents, targetMap) {
  if(!targetMap?.length) return [];
  if(!sourceMap?.length || !accents?.length) return targetMap.map(b=>({time:b.time,accent:0.5,raw:null}));
  return targetMap.map(b=>{
    const n=nearestBeatInfo(b.time,sourceMap);
    if(!n) return {time:b.time,accent:0.5,raw:null};
    const idx=sourceMap.findIndex(x=>x.time===n.time);
    const a=idx>=0?accents[idx]:null;
    const maxDist=Math.max(0.09,0.34*beatIntervalAround(b.time,sourceMap,null));
    const trust=n.distance<=maxDist?1:clamp(1-(n.distance-maxDist)/Math.max(0.05,maxDist),0,1);
    return {time:b.time,accent:(a?.accent??0.5)*trust+0.5*(1-trust),raw:a?.raw??null};
  });
}

function fuseBeatAccents(targetMap, mixMap, mixAccents, drumsMap, drumsAccents, useDrums, tuning) {
  const m=resampleBeatAccents(mixMap,mixAccents,targetMap);
  if(!useDrums || !drumsMap?.length || !drumsAccents?.length) return m.map(x=>({...x,mixAccent:x.accent,drumsAccent:null}));
  const d=resampleBeatAccents(drumsMap,drumsAccents,targetMap);
  return targetMap.map((b,i)=>{
    const ma=m[i]?.accent??0.5, da=d[i]?.accent??0.5;
    const agreement=1-Math.min(1,Math.abs(ma-da));
    const w=clamp(tuning.downbeatDrumsWeight*(0.78+0.22*agreement),0.05,0.95);
    return {time:b.time,accent:(1-w)*ma+w*da,mixAccent:ma,drumsAccent:da,drumsWeight:w};
  });
}

function meterPhaseScore(accents, meter, phase, prior=0) {
  if(!accents?.length) return {score:-Infinity,contrast:0,downMean:0,otherMean:0,phase,meter};
  const down=[],other=[];
  for(let i=0;i<accents.length;i++)(((i-phase)%meter+meter)%meter===0?down:other).push(accents[i].accent??0.5);
  if(down.length<2 || other.length<2) return {score:-Infinity,contrast:0,downMean:0,otherMean:0,phase,meter};
  const dm=down.reduce((a,b)=>a+b,0)/down.length;
  const om=other.reduce((a,b)=>a+b,0)/other.length;
  const contrast=dm-om;
  // Reward a stable recurring accent while avoiding a single extreme beat dominating the phase.
  const spread=median(down.map(x=>Math.abs(x-dm)))||0;
  const stability=Math.exp(-3.2*spread);
  const score=contrast+0.09*stability+prior;
  return {score,contrast,downMean:dm,otherMean:om,stability,phase,meter};
}

function inferDownbeatStructure(beatMap, fusedAccents, tuning) {
  if(!beatMap?.length) return {meter:4,phase:0,confidence:0,source:'none',candidates:[]};
  const candidates=[];
  for(const meter of [3,4,6]){
    const prior=meter===4?tuning.meterFourPrior:(meter===3?tuning.meterThreePrior:tuning.meterSixPrior);
    for(let phase=0;phase<meter;phase++) candidates.push(meterPhaseScore(fusedAccents,meter,phase,prior));
  }
  candidates.sort((a,b)=>b.score-a.score);
  const top=candidates[0], second=candidates[1]||{score:top.score-0.01};
  const margin=top.score-second.score;
  let confidence=clamp((margin+Math.max(0,top.contrast)*0.55)/0.32,0,1);
  let chosen=top;
  let fallback=false;
  if(!Number.isFinite(top.score) || confidence<tuning.downbeatMinConfidence){
    const fours=candidates.filter(x=>x.meter===4).sort((a,b)=>b.score-a.score);
    chosen=fours[0]||{meter:4,phase:0,score:0,contrast:0};
    confidence=Math.min(confidence,0.35);
    fallback=true;
  }
  return {
    meter:chosen.meter,phase:chosen.phase,confidence:round(confidence,3),fallback,
    source:'beat-synchronous-accent-v1',
    candidates:candidates.slice(0,6).map(x=>({meter:x.meter,phase:x.phase,score:round(x.score,4),contrast:round(x.contrast,4),downMean:round(x.downMean,3),otherMean:round(x.otherMean,3)}))
  };
}

function applyDownbeatStructure(beatMap, structure, accents) {
  if(!beatMap?.length) return [];
  const meter=structure?.meter||4, phase=structure?.phase||0, conf=structure?.confidence||0;
  return beatMap.map((b,i)=>{
    const rel=i-phase;
    const mod=((rel%meter)+meter)%meter;
    const isDown=mod===0;
    const bar=rel<0?0:Math.floor(rel/meter)+1;
    return {...b,
      beat_num:mod+1,
      bar_num:bar,
      downbeat:isDown,
      pickup:rel<0,
      accent:round(accents?.[i]?.accent??0.5,3),
      downbeat_confidence:isDown?conf:round(conf*0.45,3)
    };
  });
}


function normalizeExternalRhythm(payload, duration) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.beats)) return null;
  const rows = payload.beats
    .map((b, i) => ({
      time: Number(b?.time),
      index: i,
      downbeat: !!b?.downbeat,
      beat_num: Number.isFinite(Number(b?.beat_num)) ? Math.max(1, Math.round(Number(b.beat_num))) : null,
      bar_num: Number.isFinite(Number(b?.bar_num)) ? Math.max(0, Math.round(Number(b.bar_num))) : null,
      beatProbability: Number.isFinite(Number(b?.beatProbability)) ? clamp(Number(b.beatProbability),0,1) : null,
      downbeatProbability: Number.isFinite(Number(b?.downbeatProbability)) ? clamp(Number(b.downbeatProbability),0,1) : null
    }))
    .filter(b => Number.isFinite(b.time) && b.time >= 0 && (!duration || b.time <= duration + 0.5))
    .sort((a,b)=>a.time-b.time);
  const beats=[];
  for(const b of rows){
    if(beats.length && Math.abs(beats[beats.length-1].time-b.time)<1e-4){ if(b.downbeat) beats[beats.length-1]=b; continue; }
    beats.push(b);
  }
  if(beats.length<3) return null;
  const meterRaw=Number(payload.meter);
  const meter=[3,4,6].includes(Math.round(meterRaw))?Math.round(meterRaw):null;
  const conf=Number.isFinite(Number(payload.confidence))?clamp(Number(payload.confidence),0,1):0.5;
  return {
    provider:String(payload.provider||'external-neural'),
    model:payload.model??null,
    mode:payload.mode??null,
    inference:payload.inference??null,
    device:payload.device??null,
    bpm:Number.isFinite(Number(payload.bpm))?Number(payload.bpm):null,
    meter,
    confidence:conf,
    probabilitiesCalibrated:payload.probabilitiesCalibrated===true,
    beats
  };
}

function inferMeterFromLabeledBeats(beats, fallback=4) {
  const down=[];
  for(let i=0;i<(beats||[]).length;i++) if(beats[i].downbeat || Number(beats[i].beat_num)===1) down.push(i);
  if(down.length>=2){
    const gaps=[]; for(let i=1;i<down.length;i++){const g=down[i]-down[i-1]; if(g>=2&&g<=12)gaps.push(g);}
    const m=gaps.length?Math.round(median(gaps)):null;
    if([3,4,6].includes(m)) return m;
  }
  const nums=(beats||[]).map(b=>Number(b.beat_num)).filter(n=>Number.isFinite(n)&&n>=1&&n<=12);
  const maxNum=nums.length?Math.max(...nums):null;
  return [3,4,6].includes(maxNum)?maxNum:fallback;
}

function labelExternalBeatMap(ext, accents=null) {
  if(!ext?.beats?.length) return [];
  const meter=ext.meter || inferMeterFromLabeledBeats(ext.beats,4);
  let bar=0, pos=0;
  return ext.beats.map((b,i)=>{
    let beatNum=Number.isFinite(Number(b.beat_num))?Math.max(1,Math.min(meter,Math.round(Number(b.beat_num)))):null;
    const down=!!b.downbeat || beatNum===1;
    if(down){bar++;pos=1;beatNum=1;}
    else if(beatNum){pos=beatNum; if(bar===0)bar=1;}
    else {pos=pos>=meter?1:pos+1;if(pos===1)bar++;if(bar===0)bar=1;beatNum=pos;}
    return {
      time:b.time,index:i,beat_num:beatNum,bar_num:bar,downbeat:down,
      pickup:false,
      accent:round(accents?.[i]?.accent??0.5,3),
      downbeat_confidence:down?round(ext.confidence,3):round(ext.confidence*0.45,3),
      beatProbability:b.beatProbability,
      downbeatProbability:b.downbeatProbability,
      source:'neural'
    };
  });
}

function fuseAccentAndNeuralRhythm(accentMap, neural, tuning, duration) {
  if(!neural?.beats?.length) return null;
  const nq=beatMapQuality(neural.beats, neural.bpm);
  const aq=beatMapQuality(accentMap, null);
  const confidence=clamp((neural.confidence||0)*0.65+nq.score*0.35,0,1);
  const baseWeight=clamp(tuning.neuralRhythmWeight*(0.65+0.35*confidence),0.05,0.97);
  let matched=0,offsetSum=0,maxOffset=0;
  const nudged=neural.beats.map((b,i)=>{
    const n=nearestBeatInfo(b.time,accentMap);
    if(!n || n.distance>tuning.neuralBeatSnapMax) return {...b,index:i};
    matched++;offsetSum+=n.distance;maxOffset=Math.max(maxOffset,n.distance);
    const localAgreement=clamp(1-n.distance/Math.max(0.001,tuning.neuralBeatSnapMax),0,1);
    const w=clamp(baseWeight+(1-localAgreement)*0.10,0.05,0.98);
    return {...b,index:i,time:w*b.time+(1-w)*n.time};
  });
  const normalized={...neural,beats:nudged};
  const accents=resampleBeatAccents(accentMap,accentMap.map(b=>({time:b.time,accent:b.accent??0.5})),nudged);
  const beatMap=labelExternalBeatMap(normalized,accents);
  return {
    beatMap,
    bpm:neural.bpm || beatMapQuality(beatMap,null).inferredBpm || null,
    meter:neural.meter || inferMeterFromLabeledBeats(beatMap,4),
    structure:{meter:neural.meter||inferMeterFromLabeledBeats(beatMap,4),phase:0,confidence:round(confidence,3),fallback:false,source:'beatnet-neural+accent-ensemble-v1',candidates:[]},
    diagnostics:{mode:'neural+accent',accentQuality:round(aq.score,3),neuralQuality:round(nq.score,3),neuralConfidence:round(neural.confidence||0,3),neuralWeight:round(baseWeight,3),matchedBeats:matched,meanMatchedOffset:matched?round(offsetSum/matched,4):null,maxOffset:round(maxOffset,4),provider:neural.provider,model:neural.model}
  };
}

function chooseRhythmGrid(accentBeatMap, accentStructure, externalPayload, tuning, duration) {
  const requested=normalizeRhythmProvider(tuning.rhythmProvider);
  const neural=normalizeExternalRhythm(externalPayload,duration);
  const neuralUsable=!!(neural?.beats?.length>=3 && (neural.confidence||0)>=tuning.neuralRhythmMinConfidence);
  let resolved=requested;
  if(requested==='auto') resolved=neuralUsable?'ensemble':'accent';
  if((requested==='neural'||requested==='ensemble')&&!neuralUsable) resolved='accent';
  if(resolved==='neural'){
    const beatMap=labelExternalBeatMap(neural);
    const structure={meter:neural.meter||inferMeterFromLabeledBeats(beatMap,4),phase:0,confidence:round(neural.confidence||0,3),fallback:false,source:'beatnet-neural-v1',candidates:[]};
    return {requested,resolved,beatMap,bpm:neural.bpm||beatMapQuality(beatMap,null).inferredBpm,meter:structure.meter,structure,diagnostics:{mode:'neural',provider:neural.provider,model:neural.model,confidence:round(neural.confidence||0,3),events:beatMap.length}};
  }
  if(resolved==='ensemble'){
    const fused=fuseAccentAndNeuralRhythm(accentBeatMap,neural,tuning,duration);
    if(fused) return {requested,resolved,beatMap:fused.beatMap,bpm:fused.bpm,meter:fused.meter,structure:fused.structure,diagnostics:fused.diagnostics};
  }
  return {requested,resolved:'accent',beatMap:applyDownbeatStructure(accentBeatMap,accentStructure,accentBeatMap.map(b=>({accent:b.accent??0.5}))),bpm:null,meter:accentStructure.meter,structure:accentStructure,diagnostics:{mode:'accent',provider:'beat-synchronous-accent-v1',neuralAvailable:!!neural,neuralUsable}};
}

function nearestBeatInfo(time, beatMap) {
  if (!beatMap || !beatMap.length) return null;
  let lo = 0, hi = beatMap.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (beatMap[mid].time < time) lo = mid + 1;
    else hi = mid - 1;
  }
  const cands = [];
  if (lo < beatMap.length) cands.push(beatMap[lo]);
  if (lo - 1 >= 0) cands.push(beatMap[lo - 1]);
  let best = cands[0] || beatMap[0];
  for (const b of cands) if (Math.abs(b.time - time) < Math.abs(best.time - time)) best = b;
  return { ...best, distance: Math.abs(best.time - time) };
}

function beatIntervalAround(time, beatMap, bpm) {
  const fallback = bpm && bpm > 0 ? 60 / bpm : 0.5;
  if (!beatMap || beatMap.length < 2) return fallback;
  const n = nearestBeatInfo(time, beatMap);
  if (!n) return fallback;
  const idx = beatMap.findIndex((b) => b.time === n.time);
  const vals = [];
  if (idx > 0) vals.push(beatMap[idx].time - beatMap[idx - 1].time);
  if (idx + 1 < beatMap.length) vals.push(beatMap[idx + 1].time - beatMap[idx].time);
  const med = median(vals.filter((x) => x > 0.1 && x < 2));
  return med || fallback;
}

// v22: calidad y fusión adaptativa de beat maps MIX/DRUMS.
function beatMapQuality(beatMap, bpm) {
  if (!beatMap || beatMap.length < 4) return {score:0,regularity:0,count:beatMap?.length||0,interval:null};
  const ints=[];
  for(let i=1;i<beatMap.length;i++){const d=beatMap[i].time-beatMap[i-1].time;if(d>0.18&&d<2.2)ints.push(d);}
  const med=median(ints);
  if(!med) return {score:0,regularity:0,count:beatMap.length,interval:null};
  const dev=ints.map(x=>Math.abs(x-med));
  const mad=median(dev)||0;
  const regularity=Math.exp(-4.2*mad/Math.max(0.05,med));
  const countFactor=Math.min(1,beatMap.length/16);
  const inferredBpm=60/med;
  let bpmAgreement=1;
  if(bpm&&bpm>0){
    const ratios=[inferredBpm/bpm,inferredBpm/(bpm*2),inferredBpm/(bpm/2)].map(x=>Math.abs(Math.log(Math.max(1e-6,x))));
    bpmAgreement=Math.exp(-3*Math.min(...ratios));
  }
  return {score:clamp(0.62*regularity+0.23*countFactor+0.15*bpmAgreement,0,1),regularity,count:beatMap.length,interval:med,inferredBpm};
}

function adaptiveFuseBeatMaps(mixMap, drumsMap, mixBpm, drumsBpm, mixMeter, drumsMeter, duration, tuning) {
  const mq=beatMapQuality(mixMap,mixBpm), dq=beatMapQuality(drumsMap,drumsBpm);
  if(!drumsMap?.length) return {beatMap:mixMap||[],bpm:mixBpm,meter:mixMeter||4,diagnostics:{mode:'mix-only',mixQuality:round(mq.score,3),drumsQuality:0,agreement:0}};
  if(!mixMap?.length) return {beatMap:drumsMap||[],bpm:drumsBpm,meter:drumsMeter||4,diagnostics:{mode:'drums-only',mixQuality:0,drumsQuality:round(dq.score,3),agreement:1}};
  const refInterval=mq.interval||dq.interval||(mixBpm?60/mixBpm:0.5);
  const maxOffset=Math.min(tuning.beatFusionMaxOffset, Math.max(0.035,tuning.beatFusionMaxOffsetRatio*refInterval));
  let matched=0, offsetSum=0;
  const adjusted=[];
  const baseDrumWeight=clamp(tuning.drumsBeatWeight*(0.55+0.45*dq.score),0.05,0.95);
  for(const mb of mixMap){
    const d=nearestBeatInfo(mb.time,drumsMap);
    if(d&&d.distance<=maxOffset){
      matched++; offsetSum+=d.distance;
      const localAgreement=1-d.distance/maxOffset;
      const w=clamp(baseDrumWeight*(0.65+0.35*localAgreement),0.05,0.95);
      adjusted.push((1-w)*mb.time+w*d.time);
    }else adjusted.push(mb.time);
  }
  const agreement=matched/Math.max(1,Math.min(mixMap.length,drumsMap.length));
  let mode='fused';
  let times=adjusted;
  if(agreement<tuning.beatFusionMinAgreement){
    if(dq.score>mq.score+0.10){times=drumsMap.map(b=>b.time);mode='drums-dominant';}
    else {times=mixMap.map(b=>b.time);mode='mix-dominant';}
  }
  const meter=(mode==='drums-dominant'?(drumsMeter||mixMeter):(mixMeter||drumsMeter))||4;
  const clean=normalizeBeats(times,duration);
  const beatMap=buildBeatMap(clean,meter,duration);
  const interval=median(clean.slice(1).map((t,i)=>t-clean[i]).filter(x=>x>0.18&&x<2.2));
  const bpm=interval?round(60/interval,1):(mode==='drums-dominant'?(drumsBpm||mixBpm):(mixBpm||drumsBpm));
  return {beatMap,bpm,meter,diagnostics:{mode,mixQuality:round(mq.score,3),drumsQuality:round(dq.score,3),agreement:round(agreement,3),meanMatchedOffset:matched?round(offsetSum/matched,4):null,maxOffset:round(maxOffset,4),drumsBaseWeight:round(baseDrumWeight,3),matchedBeats:matched}};
}

// ---------------- Chord sequence ----------------

function smoothChordSequence(chords, strengths, windowSize) {
  const n = chords.length;
  const smoothed = new Array(n);
  const half = Math.floor(windowSize / 2);
  for (let i = 0; i < n; i++) {
    const from = Math.max(0, i - half);
    const to = Math.min(n, i + half + 1);
    const votes = {};
    for (let j = from; j < to; j++) {
      const c = chords[j];
      const w = Math.abs(strengths[j] || 0) + 0.0001;
      votes[c] = (votes[c] || 0) + w;
    }
    let bestChord = chords[i], bestVote = -1;
    Object.keys(votes).forEach((c) => {
      if (votes[c] > bestVote) { bestVote = votes[c]; bestChord = c; }
    });
    smoothed[i] = bestChord;
  }
  return smoothed;
}

function mergeAdjacentSameChord(segments) {
  const out = [];
  for (const seg of segments) {
    const prev = out[out.length - 1];
    if (prev && prev.chord === seg.chord && Math.abs(prev.end - seg.start) <= 0.06) {
      const pd = Math.max(0.001, prev.end - prev.start);
      const sd = Math.max(0.001, seg.end - seg.start);
      const total = pd + sd;
      prev.strength = round(((prev.strength || 0) * pd + (seg.strength || 0) * sd) / total, 3);
      prev.confidence = round(((prev.confidence || 0) * pd + (seg.confidence || 0) * sd) / total, 3);
      prev.end = seg.end;
    } else {
      out.push({ ...seg });
    }
  }
  return out;
}

function refineShortSegments(segments) {
  if (segments.length < 2) return segments.map((s) => ({ ...s }));
  const out = segments.map((s) => ({ ...s }));
  let i = 0;
  while (i < out.length) {
    const seg = out[i];
    const dur = seg.end - seg.start;
    const confidence = Number(seg.confidence || 0);
    const clearlyReal =
      dur >= 0.55 ||
      (dur >= 0.34 && confidence >= 0.46) ||
      (dur >= 0.22 && confidence >= 0.68);

    if (clearlyReal || out.length === 1) { i++; continue; }
    const prev = i > 0 ? out[i - 1] : null;
    const next = i < out.length - 1 ? out[i + 1] : null;

    if (prev && next && prev.chord === next.chord) {
      prev.end = next.end;
      prev.strength = Math.max(prev.strength || 0, next.strength || 0);
      prev.confidence = Math.max(prev.confidence || 0, next.confidence || 0);
      out.splice(i, 2);
      i = Math.max(0, i - 1);
      continue;
    }
    if (prev && next) {
      if ((next.confidence || 0) > (prev.confidence || 0)) {
        next.start = seg.start;
        out.splice(i, 1);
      } else {
        prev.end = seg.end;
        out.splice(i, 1);
        i = Math.max(0, i - 1);
      }
      continue;
    }
    if (prev) { prev.end = seg.end; out.splice(i, 1); i = Math.max(0, i - 1); continue; }
    if (next) { next.start = seg.start; out.splice(i, 1); continue; }
    i++;
  }
  return mergeAdjacentSameChord(out);
}


// ---------------- Capa acústica probabilística (HPCP) ----------------

function collapseHpcpTo12(frame) {
  if (!Array.isArray(frame) || frame.length < 12) return null;
  const out = new Array(12).fill(0);
  for (let i = 0; i < frame.length; i++) {
    const v = Math.max(0, Number(frame[i]) || 0);
    out[i % 12] += v;
  }
  const sum = out.reduce((a,b)=>a+b,0);
  if (sum <= 1e-10) return null;
  return out.map(v => v / sum);
}

function qualityIntervals(quality, suffix='') {
  if (quality === 'minor') return [0,3,7];
  if (quality === 'dim') return [0,3,6];
  if (quality === 'aug') return [0,4,8];
  if (quality === 'sus') return /sus2/i.test(suffix) ? [0,2,7] : [0,5,7];
  return [0,4,7];
}

function hpcpTemplateScore(chord, chroma, shift) {
  const p = parseChordCore(chord);
  if (!p || !chroma) return -1.2;
  // Essentia puede usar un origen de pitch-class distinto al parser. shift se calibra
  // automáticamente contra las etiquetas acústicas observadas en la propia canción.
  const pc = (midiPc) => (midiPc + shift + 120) % 12;
  const ints = qualityIntervals(p.quality, p.suffix);
  let chordEnergy = 0;
  for (let i=0;i<ints.length;i++) {
    const w = i === 0 ? 1.25 : i === 1 ? 1.0 : 0.88;
    chordEnergy += chroma[pc((p.root + ints[i]) % 12)] * w;
  }
  let nonChord = 0;
  const set = new Set(ints.map(x => (p.root+x)%12));
  for (let k=0;k<12;k++) if (!set.has(k)) nonChord += chroma[pc(k)];
  return chordEnergy - nonChord * 0.17;
}

function calibrateHpcpShift(chromaFrames, rawChords) {
  if (!chromaFrames.length || !rawChords.length) return 0;
  let bestShift = 0, bestScore = -1e30;
  for (let shift=0; shift<12; shift++) {
    let score=0, n=0;
    const step = Math.max(1, Math.floor(rawChords.length / 300));
    for (let i=0;i<rawChords.length;i+=step) {
      const chord = rawChords[i];
      if (!parseChordCore(chord)) continue;
      const fi = Math.min(chromaFrames.length-1, Math.round(i * (chromaFrames.length-1) / Math.max(1, rawChords.length-1)));
      const chroma = chromaFrames[fi];
      if (!chroma) continue;
      score += hpcpTemplateScore(chord, chroma, shift); n++;
    }
    if (n && score/n > bestScore) { bestScore=score/n; bestShift=shift; }
  }
  return bestShift;
}

function softmaxScores(entries, temperature=0.28) {
  if (!entries.length) return [];
  let max = -Infinity;
  for (const e of entries) if (e.score > max) max=e.score;
  let sum=0;
  const tmp=entries.map(e => { const x=Math.exp((e.score-max)/temperature); sum+=x; return {...e, x}; });
  return tmp.map(e => ({ chord:e.chord, probability: sum>0 ? e.x/sum : 1/tmp.length })).sort((a,b)=>b.probability-a.probability);
}

function buildProbabilisticObservations(hpcpRaw, rawChords, rawStrengths) {
  // Preserve the original frame positions. Filtering silent/invalid HPCP rows
  // compressed the chroma timeline and shifted every chord after a pause.
  const chromaFrames = (hpcpRaw || []).map(collapseHpcpTo12);
  if (!chromaFrames.some(Boolean)) return null;
  const shift = calibrateHpcpShift(chromaFrames, rawChords);
  const stateSet = new Set(['N']);
  for (const c of rawChords) if (parseChordCore(c)) stateSet.add(c);
  // Añadimos las 24 tríadas para que el modelo pueda recuperar una hipótesis que
  // TonalExtractor no haya elegido como etiqueta principal.
  for (let root=0;root<12;root++) { stateSet.add(PC_TO_SHARP[root]); stateSet.add(PC_TO_SHARP[root]+'m'); }
  const states=[...stateSet].slice(0,64);
  const observations=[];
  let meanTop=0;
  for (let i=0;i<rawChords.length;i++) {
    const fi=Math.min(chromaFrames.length-1, Math.round(i*(chromaFrames.length-1)/Math.max(1,rawChords.length-1)));
    const chroma=chromaFrames[fi];
    const obs=rawChords[i];
    const strength=clamp(Math.abs(Number(rawStrengths[i]||0))*2,0,1);
    // A missing chroma row is silence/invalid analysis, not permission to reuse
    // a neighbouring harmonic frame. Emit an explicit no-chord posterior.
    if (!chroma) {
      const probabilities = states.map(chord => ({chord, probability:chord==='N' ? 1 : 0}));
      observations.push({top:'N', confidence:1, probabilities:probabilities.slice(0,12)});
      meanTop += 1;
      continue;
    }
    const scores=[];
    for (const chord of states) {
      if (chord === 'N') {
        // Low acoustic confidence should be allowed to become N instead of
        // forcing one of the 24 major/minor triads through the entire track.
        scores.push({chord, score:-0.55 + (1-strength)*1.05 + (obs==='N'||obs==='X' ? 0.55 : 0)});
        continue;
      }
      let score=hpcpTemplateScore(chord,chroma,shift);
      if (chord===obs) score += 0.28 + 0.50*strength;
      else if (parseChordCore(chord) && parseChordCore(obs)) {
        const a=parseChordCore(chord), b=parseChordCore(obs);
        if (a.root===b.root) score += 0.10*(1-strength);
      }
      scores.push({chord,score});
    }
    const probs=softmaxScores(scores,0.24);
    meanTop += probs[0]?.probability || 0;
    observations.push({
      top: probs[0]?.chord || obs || 'N',
      confidence: probs[0]?.probability || 0,
      probabilities: probs.slice(0,12)
    });
  }
  return { observations, shift, meanTopProbability: observations.length ? meanTop/observations.length : 0, states };
}

function probabilityFor(obs, chord) {
  if (!obs || !Array.isArray(obs.probabilities)) return 1e-6;
  const f=obs.probabilities.find(x=>x.chord===chord);
  return f ? Math.max(1e-7,f.probability) : 1e-7;
}

function functionalTriadIndexForChord(parsed) {
  if (!parsed) return -1;
  if (parsed.quality === 'minor' || parsed.quality === 'half-diminished') return parsed.quality === 'half-diminished' ? 2 : 1;
  if (parsed.quality === 'dim') return 2;
  if (parsed.quality === 'aug') return 3;
  if (parsed.quality === 'sus') return /sus2/i.test(parsed.canonicalSuffix || parsed.suffix || '') ? 4 : 5;
  // dominant/major and major extensions share a major triad head.
  return 0;
}

function functionalStateForChord(chord, keyInfo) {
  const p = parseChordCore(chord);
  if (!p || !keyInfo?.key || !keyInfo?.scale) return -1;
  const tonic = NOTE_TO_PC[keyInfo.key];
  if (tonic === undefined) return -1;
  const rel = (p.root - tonic + 12) % 12;
  const triad = functionalTriadIndexForChord(p);
  return triad >= 0 ? rel * 6 + triad : -1;
}


function functionalRoleForChord(chord, keyInfo) {
  const p=parseChordCore(chord);
  if (!p || !keyInfo?.key || !keyInfo?.scale) return null;
  const tonic=NOTE_TO_PC[keyInfo.key];
  if (tonic===undefined) return null;
  const degree=(p.root-tonic+12)%12;
  const major=keyInfo.scale==='major';
  const tonicDegrees=major ? new Set([0,4,9]) : new Set([0,3,8]);
  const predominantDegrees=major ? new Set([2,5]) : new Set([2,5,8]);
  const dominantDegrees=new Set([7,11]);
  let role='chromatic';
  if (tonicDegrees.has(degree)) role='tonic';
  else if (predominantDegrees.has(degree)) role='predominant';
  else if (dominantDegrees.has(degree)) role='dominant';
  return {degree,role,quality:p.quality,root:p.root,parsed:p};
}

function runtimeFunctionalDistanceAdjustment(source,target,keyInfo,tuning,sourceObs=null,targetObs=null) {
  if (!source || !target || source===target || source==='N' || target==='N') return {adjustment:0,applied:false};
  const a=functionalRoleForChord(source,keyInfo), b=functionalRoleForChord(target,keyInfo);
  if (!a || !b) return {adjustment:0,applied:false};
  const keyConfidence=clamp(Number(keyInfo?.confidence ?? 0),0,1);
  const obsConf=(clamp(Number(sourceObs?.confidence ?? .5),0,1)+clamp(Number(targetObs?.confidence ?? .5),0,1))*.5;
  const ambiguity=1-obsConf;
  let affinity=0;
  // Resolutions and functional flow. Values are deliberately small and soft.
  if (a.role==='predominant' && b.role==='dominant') affinity += 0.95; // ii/IV -> V
  if (a.role==='dominant' && b.role==='tonic') affinity += 1.00;      // V/vii -> I/vi-like tonic family
  if (a.role==='predominant' && b.role==='tonic') affinity += 0.45;  // plagal/pre-dominant resolution
  if (a.role===b.role && a.role!=='chromatic') affinity += 0.28;      // functional substitution (I<->vi, IV<->ii, etc.)
  // Secondary-dominant style resolution: a major/dominant chord a fifth above target.
  const rootMove=(b.root-a.root+12)%12;
  const sourceMajorLike=['major','dominant','aug'].includes(a.quality);
  if (sourceMajorLike && rootMove===5) affinity += 0.78;
  // Leading-tone resolution by semitone into the next root.
  if (rootMove===1 || rootMove===11) affinity += 0.22;
  // Strongly remote chromatic-to-chromatic jumps get a mild penalty, not a veto.
  if (a.role==='chromatic' && b.role==='chromatic') {
    const d=Math.min(rootMove,(12-rootMove)%12);
    if (d>=4 && d!==5) affinity -= 0.38;
  }
  const gate=(0.35+0.65*ambiguity)*(0.45+0.55*keyConfidence);
  const raw=tuning.functionalDistanceWeight*affinity*gate;
  const adjustment=clamp(raw,-tuning.functionalDistanceMaxPenalty,tuning.functionalDistanceMaxBonus);
  return {adjustment,applied:Math.abs(adjustment)>1e-9,affinity,ambiguity,keyConfidence,sourceRole:a.role,targetRole:b.role,sourceDegree:a.degree,targetDegree:b.degree};
}


function chordTonePitchClasses(chord) {
  const p=parseChordCore(chord);
  if (!p) return [];
  const s=String(p.canonicalSuffix||p.suffix||'').toLowerCase();
  let ints;
  if (p.quality==='minor' || p.quality==='half-diminished') ints=[0,3,7];
  else if (p.quality==='dim') ints=[0,3,6];
  else if (p.quality==='aug') ints=[0,4,8];
  else if (p.quality==='sus') ints=/sus2/.test(s)?[0,2,7]:[0,5,7];
  else ints=[0,4,7];
  if (p.quality==='half-diminished') ints=[0,3,6,10];
  if (/dim7/.test(s)) ints=[0,3,6,9];
  else if (/mmaj7|maj7|maj9|maj11|maj13/.test(s)) ints.push(11);
  else if (/(^|[^a-z])7|m7|m9|m11|m13|^9|^11|^13|7sus/.test(s)) ints.push(10);
  else if (/^6|m6/.test(s)) ints.push(9);
  if (/add9|(^|[^a-z])9|maj9|m9/.test(s)) ints.push(2);
  if (/add11|(^|[^a-z])11|maj11|m11/.test(s)) ints.push(5);
  if (/(^|[^a-z])13|maj13|m13/.test(s)) ints.push(9);
  if (/b5/.test(s)) { ints=ints.filter(x=>x!==7); ints.push(6); }
  if (/#5/.test(s)) { ints=ints.filter(x=>x!==7); ints.push(8); }
  if (/b9/.test(s)) ints.push(1);
  if (/#9/.test(s)) ints.push(3);
  if (/#11/.test(s)) ints.push(6);
  if (/b13/.test(s)) ints.push(8);
  return [...new Set(ints.map(x=>(p.root+x+12)%12))].sort((a,b)=>a-b);
}

function pitchClassDistance(a,b) {
  const d=Math.abs(Number(a)-Number(b))%12;
  return Math.min(d,12-d);
}

function voiceLeadingMetrics(source,target) {
  const a=chordTonePitchClasses(source), b=chordTonePitchClasses(target);
  if (!a.length || !b.length) return null;
  const directed=(x,y)=>x.reduce((sum,pc)=>sum+Math.min(...y.map(q=>pitchClassDistance(pc,q))),0)/x.length;
  const movement=(directed(a,b)+directed(b,a))*0.5;
  const common=a.filter(pc=>b.includes(pc)).length;
  const commonRatio=common/Math.max(a.length,b.length,1);
  const pa=parseChordCore(source), pb=parseChordCore(target);
  const ba=pa?.bass ?? pa?.root, bb=pb?.bass ?? pb?.root;
  const bassMovement=(ba!=null && bb!=null)?pitchClassDistance(ba,bb):null;
  return {movement,common,commonRatio,bassMovement,sourceTones:a,targetTones:b};
}

function runtimeVoiceLeadingAdjustment(source,target,tuning,sourceObs=null,targetObs=null) {
  if (!source || !target || source===target || source==='N' || target==='N' || tuning.voiceLeadingWeight<=0) return {adjustment:0,applied:false};
  const m=voiceLeadingMetrics(source,target);
  if (!m) return {adjustment:0,applied:false};
  const obsConf=(clamp(Number(sourceObs?.confidence ?? .5),0,1)+clamp(Number(targetObs?.confidence ?? .5),0,1))*.5;
  const ambiguity=1-obsConf;
  const smoothness=1-clamp(m.movement/3.0,0,1);
  const bassSmooth=m.bassMovement==null?0.5:(1-clamp(m.bassMovement/4.0,0,1));
  // Center around zero: common tones + efficient motion help; remote motion gets a mild penalty.
  let affinity=0.72*smoothness + tuning.voiceLeadingCommonToneWeight*m.commonRatio + tuning.voiceLeadingBassWeight*bassSmooth - 0.58;
  const gate=0.30+0.70*ambiguity;
  const raw=tuning.voiceLeadingWeight*affinity*gate;
  const adjustment=clamp(raw,-tuning.voiceLeadingMaxPenalty,tuning.voiceLeadingMaxBonus);
  return {adjustment,applied:Math.abs(adjustment)>1e-9,affinity,ambiguity,movement:m.movement,commonTones:m.common,commonToneRatio:m.commonRatio,bassMovement:m.bassMovement};
}


const voicingMetricCache = new Map();

function nearestMidiForPc(pc, center, low, high) {
  let best=null, bestD=1e9;
  for (let n=low;n<=high;n++) {
    if (((n%12)+12)%12 !== ((pc%12)+12)%12) continue;
    const d=Math.abs(n-center);
    if (d<bestD){best=n;bestD=d;}
  }
  return best;
}

function buildApproximateVoicings(chord) {
  const p=parseChordCore(chord);
  const tones=chordTonePitchClasses(chord);
  if (!p || !tones.length) return [];
  const bassPc=p.bass ?? p.root;
  const bassCenters=p.bass!=null?[40,45,50]:[40,43,47];
  const ordered=[...tones].sort((a,b)=>((a-p.root+12)%12)-((b-p.root+12)%12));
  const rotations=[];
  for(let r=0;r<Math.min(ordered.length,4);r++){
    const pcs=[];
    for(let j=0;j<3;j++) pcs.push(ordered[(r+j)%ordered.length]);
    rotations.push(pcs);
  }
  const centerSets=[[55,62,69],[57,64,71],[52,60,67]];
  const seen=new Set(), out=[];
  for(const bc of bassCenters){
    const bass=nearestMidiForPc(bassPc,bc,32,59);
    if(bass==null) continue;
    for(const pcs of rotations){
      for(const centers of centerSets){
        const upper=[];
        let floor=Math.max(48,bass+5);
        for(let i=0;i<pcs.length;i++){
          let n=nearestMidiForPc(pcs[i],Math.max(centers[i],floor),floor,84);
          if(n==null) break;
          while(upper.length && n<=upper[upper.length-1] && n+12<=84) n+=12;
          if(upper.length && n<=upper[upper.length-1]) break;
          upper.push(n); floor=n+1;
        }
        if(upper.length!==3) continue;
        const key=[bass,...upper].join(',');
        if(!seen.has(key)){seen.add(key);out.push({bass,upper,notes:[bass,...upper]});}
      }
    }
  }
  return out.slice(0,24);
}

function voicingPairMetrics(source,target,tuning) {
  const cacheKey=`${source}>${target}|${Number(tuning.voicingMaxLeapSemitones||7).toFixed(2)}`;
  if(voicingMetricCache.has(cacheKey)) return voicingMetricCache.get(cacheKey);
  const A=buildApproximateVoicings(source), B=buildApproximateVoicings(target);
  if(!A.length||!B.length){voicingMetricCache.set(cacheKey,null);return null;}
  let best=null;
  for(const a of A){
    for(const b of B){
      const upperMoves=a.upper.map((n,i)=>Math.abs((b.upper[i]??n)-n));
      const upperMean=upperMoves.reduce((x,y)=>x+y,0)/Math.max(1,upperMoves.length);
      const bassMove=Math.abs(b.bass-a.bass);
      const maxLeap=Math.max(bassMove,...upperMoves);
      const leapExcess=[bassMove,...upperMoves].reduce((sum,d)=>sum+Math.max(0,d-tuning.voicingMaxLeapSemitones),0)/4;
      const pcsA=a.notes.map(n=>((n%12)+12)%12), pcsB=b.notes.map(n=>((n%12)+12)%12);
      const common=pcsA.filter(pc=>pcsB.includes(pc)).length;
      const commonRatio=common/4;
      const cost=0.50*upperMean+0.34*bassMove+0.16*leapExcess-0.55*commonRatio;
      if(!best||cost<best.cost) best={cost,upperMean,bassMove,maxLeap,leapExcess,commonRatio,sourceVoicing:a.notes,targetVoicing:b.notes};
    }
  }
  voicingMetricCache.set(cacheKey,best);
  return best;
}

function runtimeVoicingLeadingAdjustment(source,target,tuning,sourceObs=null,targetObs=null) {
  if(!source||!target||source===target||source==='N'||target==='N'||tuning.voicingLeadingWeight<=0) return {adjustment:0,applied:false};
  const m=voicingPairMetrics(source,target,tuning);
  if(!m) return {adjustment:0,applied:false};
  const obsConf=(clamp(Number(sourceObs?.confidence??.5),0,1)+clamp(Number(targetObs?.confidence??.5),0,1))*.5;
  const ambiguity=1-obsConf;
  const upperSmooth=1-clamp(m.upperMean/9,0,1);
  const bassSmooth=1-clamp(m.bassMove/9,0,1);
  const leapPenalty=clamp(m.leapExcess/6,0,1);
  let affinity=tuning.voicingUpperRegisterWeight*upperSmooth+tuning.voicingBassRegisterWeight*bassSmooth+tuning.voicingCommonToneWeight*m.commonRatio-tuning.voicingLeapPenaltyWeight*leapPenalty-0.72;
  const ps=parseChordCore(source), pt=parseChordCore(target);
  const inversionAware=(ps?.bass!=null||pt?.bass!=null);
  if(m.bassMove<=2) affinity+=inversionAware?0.20:0.08;
  const gate=0.28+0.72*ambiguity;
  const raw=tuning.voicingLeadingWeight*affinity*gate;
  const adjustment=clamp(raw,-tuning.voicingLeadingMaxPenalty,tuning.voicingLeadingMaxBonus);
  return {adjustment,applied:Math.abs(adjustment)>1e-9,affinity,ambiguity,upperMovement:m.upperMean,bassMovement:m.bassMove,maxLeap:m.maxLeap,commonToneRatio:m.commonRatio,leapExcess:m.leapExcess,inversionAware,sourceVoicing:m.sourceVoicing,targetVoicing:m.targetVoicing};
}

function runtimeFunctionalPriorAdjustment(source, target, keyInfo, tuning, sourceObs=null, targetObs=null) {
  const prior = multiHeadRegistry.functionalPrior;
  if (!prior?.probabilities || source === target) return { adjustment:0, applied:false };
  const keyConfidence = Number(keyInfo?.confidence ?? 0);
  if (!keyInfo?.scale || keyConfidence < tuning.functionalPriorMinKeyConfidence) return { adjustment:0, applied:false };
  const mode = keyInfo.scale === 'minor' ? 1 : keyInfo.scale === 'major' ? 0 : -1;
  if (mode < 0) return { adjustment:0, applied:false };
  const a = functionalStateForChord(source,keyInfo), b = functionalStateForChord(target,keyInfo);
  if (a < 0 || b < 0) return { adjustment:0, applied:false };
  const row = prior.probabilities?.[mode]?.[a];
  const prob = Number(row?.[b]);
  if (!Number.isFinite(prob) || prob <= 0) return { adjustment:0, applied:false };
  const stateCount = Number(prior.stateCount || 72);
  const uniform = 1 / Math.max(1,stateCount);
  // Adaptive: trust harmony context more when the acoustic observation is ambiguous.
  const sourceConf = clamp(Number(sourceObs?.confidence ?? 0.5),0,1);
  const targetConf = clamp(Number(targetObs?.confidence ?? 0.5),0,1);
  const ambiguity = 1 - (sourceConf + targetConf) * 0.5;
  const keyGate = clamp((keyConfidence - tuning.functionalPriorMinKeyConfidence) / Math.max(0.05,1-tuning.functionalPriorMinKeyConfidence),0,1);
  const adaptiveWeight = tuning.functionalPriorWeight * (0.35 + 0.65 * ambiguity) * (0.45 + 0.55 * keyGate);
  const logRatio = Math.log(Math.max(1e-9,prob) / uniform);
  const raw = adaptiveWeight * logRatio;
  const adjustment = clamp(raw, -tuning.functionalPriorMaxPenalty, tuning.functionalPriorMaxBonus);
  return { adjustment, applied:true, probability:prob, ambiguity, keyGate, states:[a,b], mode:keyInfo.scale };
}

function decodeProbabilitySequenceViterbi(probModel, keyInfo, tuning = DEFAULT_TUNING) {
  const observations=probModel?.observations || [];
  if (!observations.length) return { chords:[], confidences:[] };
  const counts=new Map();
  for (const obs of observations) for (const p of obs.probabilities.slice(0,6)) counts.set(p.chord,(counts.get(p.chord)||0)+p.probability);
  const states=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,36).map(x=>x[0]);
  const S=states.length, n=observations.length;
  let prev=new Float64Array(S); const back=new Array(n);
  let functionalApplied=0, functionalPositive=0, functionalNegative=0, functionalAbsSum=0;
  let functionalDistanceApplied=0, functionalDistancePositive=0, functionalDistanceNegative=0, functionalDistanceAbsSum=0;
  let voiceLeadingApplied=0, voiceLeadingPositive=0, voiceLeadingNegative=0, voiceLeadingAbsSum=0, voiceLeadingMovementSum=0;
  let voicingApplied=0, voicingPositive=0, voicingNegative=0, voicingAbsSum=0, voicingUpperMoveSum=0, voicingBassMoveSum=0, voicingInversionAware=0;
  const key0=resolveFrameKey(keyInfo,0);
  for (let s=0;s<S;s++) prev[s]=Math.log(probabilityFor(observations[0],states[s])) + keyPriorForChord(states[s],key0,tuning);
  for (let i=1;i<n;i++) {
    const curr=new Float64Array(S), bp=new Int16Array(S);
    for (let sj=0;sj<S;sj++) {
      let best=-1e30,bestK=0; const target=states[sj];
      for (let sk=0;sk<S;sk++) {
        const source=states[sk];
        let trans=source===target ? tuning.viterbiStayReward : -tuning.viterbiChangePenalty - chordDistance(source,target)*tuning.viterbiDistanceWeight;
        const ps=parseChordCore(source), pt=parseChordCore(target);
        if (ps&&pt) { const interval=(pt.root-ps.root+12)%12; if ([5,7].includes(interval)) trans+=tuning.functionalMotionBonus; }
        const frameKey=resolveFrameKey(keyInfo,i);
        const fp = runtimeFunctionalPriorAdjustment(source,target,frameKey,tuning,observations[i-1],observations[i]);
        if (fp.applied && fp.adjustment !== 0) {
          trans += fp.adjustment; functionalApplied++; functionalAbsSum += Math.abs(fp.adjustment);
          if (fp.adjustment > 0) functionalPositive++; else functionalNegative++;
        }
        const fd = runtimeFunctionalDistanceAdjustment(source,target,frameKey,tuning,observations[i-1],observations[i]);
        if (fd.applied) {
          trans += fd.adjustment; functionalDistanceApplied++; functionalDistanceAbsSum += Math.abs(fd.adjustment);
          if (fd.adjustment > 0) functionalDistancePositive++; else functionalDistanceNegative++;
        }
        const vl = runtimeVoiceLeadingAdjustment(source,target,tuning,observations[i-1],observations[i]);
        if (vl.applied) {
          trans += vl.adjustment; voiceLeadingApplied++; voiceLeadingAbsSum += Math.abs(vl.adjustment); voiceLeadingMovementSum += Number(vl.movement||0);
          if (vl.adjustment > 0) voiceLeadingPositive++; else voiceLeadingNegative++;
        }
        const vv = runtimeVoicingLeadingAdjustment(source,target,tuning,observations[i-1],observations[i]);
        if (vv.applied) {
          trans += vv.adjustment; voicingApplied++; voicingAbsSum += Math.abs(vv.adjustment); voicingUpperMoveSum += Number(vv.upperMovement||0); voicingBassMoveSum += Number(vv.bassMovement||0);
          if (vv.adjustment > 0) voicingPositive++; else voicingNegative++;
          if (vv.inversionAware) voicingInversionAware++;
        }
        const val=prev[sk]+trans; if (val>best){best=val;bestK=sk;}
      }
      const emissionKey=resolveFrameKey(keyInfo,i);
      curr[sj]=best + Math.log(probabilityFor(observations[i],target)) + keyPriorForChord(target,emissionKey,tuning); bp[sj]=bestK;
    }
    back[i]=bp; prev=curr;
  }
  let best=0; for(let s=1;s<S;s++) if(prev[s]>prev[best]) best=s;
  const chords=new Array(n), confidences=new Array(n);
  chords[n-1]=states[best];
  for(let i=n-1;i>0;i--){ best=back[i][best]; chords[i-1]=states[best]; }
  for(let i=0;i<n;i++) confidences[i]=probabilityFor(observations[i],chords[i]);
  return { chords, confidences, functionalPrior:{
    loaded:!!multiHeadRegistry.functionalPrior,
    appliedEvaluations:functionalApplied,
    positiveEvaluations:functionalPositive,
    negativeEvaluations:functionalNegative,
    meanAbsAdjustment:functionalApplied?round(functionalAbsSum/functionalApplied,4):0,
    weight:tuning.functionalPriorWeight,
    maxBonus:tuning.functionalPriorMaxBonus,
    maxPenalty:tuning.functionalPriorMaxPenalty,
    minKeyConfidence:tuning.functionalPriorMinKeyConfidence,
    fitSplit:multiHeadRegistry.functionalPrior?.fitSplit||null,
    keyRelative:!!multiHeadRegistry.functionalPrior,
    functionalDistance:{
      enabled:tuning.functionalDistanceWeight>0,
      appliedEvaluations:functionalDistanceApplied,
      positiveEvaluations:functionalDistancePositive,
      negativeEvaluations:functionalDistanceNegative,
      meanAbsAdjustment:functionalDistanceApplied?round(functionalDistanceAbsSum/functionalDistanceApplied,4):0,
      weight:tuning.functionalDistanceWeight,
      maxBonus:tuning.functionalDistanceMaxBonus,
      maxPenalty:tuning.functionalDistanceMaxPenalty,
      keyRelative:true,
      learned:false
    },
    voiceLeading:{
      enabled:tuning.voiceLeadingWeight>0,
      appliedEvaluations:voiceLeadingApplied,
      positiveEvaluations:voiceLeadingPositive,
      negativeEvaluations:voiceLeadingNegative,
      meanAbsAdjustment:voiceLeadingApplied?round(voiceLeadingAbsSum/voiceLeadingApplied,4):0,
      meanPitchClassMovement:voiceLeadingApplied?round(voiceLeadingMovementSum/voiceLeadingApplied,4):0,
      weight:tuning.voiceLeadingWeight,
      commonToneWeight:tuning.voiceLeadingCommonToneWeight,
      bassWeight:tuning.voiceLeadingBassWeight,
      maxBonus:tuning.voiceLeadingMaxBonus,
      maxPenalty:tuning.voiceLeadingMaxPenalty,
      learned:false,
      voicingLeading:{
        enabled:tuning.voicingLeadingWeight>0,
        method:'register-aware-approximate-voicing-search-v1',
        appliedEvaluations:voicingApplied,
        positiveEvaluations:voicingPositive,
        negativeEvaluations:voicingNegative,
        inversionAwareEvaluations:voicingInversionAware,
        meanAbsAdjustment:voicingApplied?round(voicingAbsSum/voicingApplied,4):0,
        meanUpperSemitoneMovement:voicingApplied?round(voicingUpperMoveSum/voicingApplied,3):0,
        meanBassSemitoneMovement:voicingApplied?round(voicingBassMoveSum/voicingApplied,3):0,
        weight:tuning.voicingLeadingWeight,
        maxLeapSemitones:tuning.voicingMaxLeapSemitones,
        maxBonus:tuning.voicingLeadingMaxBonus,
        maxPenalty:tuning.voicingLeadingMaxPenalty
      }
    }
  } };
}

function harmonicNoveltyCurve(probModel) {
  const obs=probModel?.observations || [];
  const curve=new Array(obs.length).fill(0);
  for(let i=1;i<obs.length;i++) {
    const keys=new Set([...obs[i-1].probabilities.map(x=>x.chord),...obs[i].probabilities.map(x=>x.chord)]);
    let l1=0; for(const k of keys) l1 += Math.abs(probabilityFor(obs[i-1],k)-probabilityFor(obs[i],k));
    curve[i]=clamp(l1/2,0,1);
  }
  return curve;
}

function refineSegmentsWithNovelty(segments, novelty, hopTime, duration, tuning = DEFAULT_TUNING) {
  if (!segments.length || !novelty?.length) return segments;
  const out=segments.map(s=>({...s}));
  for(let i=0;i<out.length-1;i++) {
    const raw=(out[i].end+out[i+1].start)/2;
    const center=Math.round(raw/hopTime), radius=Math.max(2,Math.round(0.20/hopTime));
    let best=center,bestVal=-1;
    for(let j=Math.max(1,center-radius);j<=Math.min(novelty.length-1,center+radius);j++) {
      const proximity=1-Math.min(1,Math.abs(j-center)/Math.max(1,radius));
      const score=novelty[j]*tuning.noveltyWeight+proximity*(1-tuning.noveltyWeight);
      if(score>bestVal){bestVal=score;best=j;}
    }
    if(bestVal>tuning.noveltyThreshold) {
      const t=clamp(best*hopTime,out[i].start+0.08,out[i+1].end-0.08);
      out[i].end=round(t,4); out[i+1].start=round(t,4);
      out[i].boundaryNovelty=round(novelty[best]||0,3); out[i+1].boundaryNovelty=round(novelty[best]||0,3);
    }
  }
  out[out.length-1].end=Math.min(duration,out[out.length-1].end);
  return out;
}


function chordDistance(a, b) {
  if (a === b) return 0;
  const pa = parseChordCore(a), pb = parseChordCore(b);
  if (!pa || !pb) return 3;
  const rootDist = Math.min((pa.root - pb.root + 12) % 12, (pb.root - pa.root + 12) % 12);
  let d = rootDist * 0.18;
  if (pa.quality !== pb.quality) d += 0.65;
  return d;
}

function keyPriorForChord(chord, keyInfo, tuning = DEFAULT_TUNING) {
  if (!keyInfo || !keyInfo.key || !keyInfo.scale) return 0;
  const tonic = NOTE_TO_PC[keyInfo.key];
  if (tonic === undefined) return 0;
  const fit = chordFitForKey(chord, tonic, keyInfo.scale);
  // Prior deliberadamente suave: nunca debe borrar un acorde cromático real.
  return (fit - 0.35) * tuning.keyPriorStrength;
}

function decodeChordSequenceViterbi(chords, strengths, keyInfo, tuning = DEFAULT_TUNING) {
  const n = chords.length;
  if (!n) return [];
  const counts = new Map();
  chords.forEach((c, i) => {
    if (!c || c === 'X') return;
    const w = Math.abs(Number(strengths[i] || 0)) + 0.05;
    counts.set(c, (counts.get(c) || 0) + w);
  });
  const states = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 28).map(x=>x[0]);
  if (!states.includes('N')) states.push('N');
  if (!states.length) return chords.slice();

  const S = states.length;
  let prev = new Float64Array(S);
  const back = new Array(n);

  function emission(state, obs, strength) {
    const st = clamp(Math.abs(Number(strength || 0)) * 2.0, 0, 1);
    if (state === 'N') return obs === 'N' || obs === 'X' ? -0.05 : -2.3 - st;
    if (obs === 'N' || obs === 'X') return -1.5 + keyPriorForChord(state, keyInfo, tuning) * 0.3;
    if (state === obs) return 0.2 + st * 1.65 + keyPriorForChord(state, keyInfo, tuning);
    const dist = chordDistance(state, obs);
    return -0.75 - dist + (1 - st) * 0.30 + keyPriorForChord(state, keyInfo, tuning);
  }

  for (let sidx=0; sidx<S; sidx++) prev[sidx] = emission(states[sidx], chords[0], strengths[0]);
  for (let i=1; i<n; i++) {
    const curr = new Float64Array(S);
    const bp = new Int16Array(S);
    for (let sj=0; sj<S; sj++) {
      let best = -1e30, bestK = 0;
      const target = states[sj];
      for (let sk=0; sk<S; sk++) {
        const source = states[sk];
        let trans;
        if (source === target) trans = tuning.viterbiStayReward; // preferencia ajustable por estabilidad
        else if (source === 'N' || target === 'N') trans = -Math.max(0.2, tuning.viterbiChangePenalty + 0.14);
        else {
          const d = chordDistance(source, target);
          trans = -Math.max(0.15, tuning.viterbiChangePenalty - 0.06) - d * tuning.viterbiDistanceWeight;
          const ps = parseChordCore(source), pt = parseChordCore(target);
          if (ps && pt) {
            const interval = (pt.root - ps.root + 12) % 12;
            if ([5,7].includes(interval)) trans += tuning.functionalMotionBonus; // movimientos funcionales frecuentes
          }
          const frameKey=resolveFrameKey(keyInfo,i);
          const fd=runtimeFunctionalDistanceAdjustment(source,target,frameKey,tuning,{confidence:Math.abs(Number(strengths[i-1]||0))},{confidence:Math.abs(Number(strengths[i]||0))});
          if (fd.applied) trans += fd.adjustment;
          const vl=runtimeVoiceLeadingAdjustment(source,target,tuning,{confidence:Math.abs(Number(strengths[i-1]||0))},{confidence:Math.abs(Number(strengths[i]||0))});
          if (vl.applied) trans += vl.adjustment;
          const vv=runtimeVoicingLeadingAdjustment(source,target,tuning,{confidence:Math.abs(Number(strengths[i-1]||0))},{confidence:Math.abs(Number(strengths[i]||0))});
          if (vv.applied) trans += vv.adjustment;
        }
        const val = prev[sk] + trans;
        if (val > best) { best = val; bestK = sk; }
      }
      curr[sj] = best + emission(target, chords[i], strengths[i]);
      bp[sj] = bestK;
    }
    back[i] = bp;
    prev = curr;
  }
  let best = 0;
  for (let j=1;j<S;j++) if (prev[j] > prev[best]) best = j;
  const out = new Array(n);
  out[n-1] = states[best];
  for (let i=n-1;i>0;i--) { best = back[i][best]; out[i-1] = states[best]; }
  return out;
}

function buildRawChordTimeline(chords, strengths, sampleRate, hopSize, duration, alreadyDecoded = false, frameConfidences = null) {
  const hopTime = hopSize / sampleRate;
  const windowSize = Math.max(3, Math.round(0.10 / hopTime) * 2 + 1);
  const smoothed = alreadyDecoded ? chords.slice() : smoothChordSequence(chords, strengths, windowSize);
  const segments = [];
  let currentChord = null, startTime = 0, sumStrength = 0, count = 0;

  for (let i = 0; i < smoothed.length; i++) {
    const chord = smoothed[i];
    const strength = frameConfidences ? clamp(Number(frameConfidences[i] || 0), 0, 1) : Math.abs(strengths[i] || 0);
    const time = i * hopTime;
    if (chord !== currentChord) {
      if (currentChord !== null && currentChord !== 'N' && currentChord !== 'X' && count > 0) {
        const avg = sumStrength / count;
        segments.push({
          chord: currentChord,
          start: round(startTime, 4),
          end: round(Math.min(time, duration), 4),
          strength: round(avg, 3),
          confidence: round(frameConfidences ? clamp(avg, 0, 1) : clamp(avg * 2, 0, 1), 3)
        });
      }
      currentChord = chord;
      startTime = time;
      sumStrength = 0;
      count = 0;
    }
    sumStrength += strength;
    count++;
  }

  if (currentChord !== null && currentChord !== 'N' && currentChord !== 'X' && count > 0) {
    const avg = sumStrength / count;
    segments.push({
      chord: currentChord,
      start: round(startTime, 4),
      end: round(Math.min(duration, chords.length * hopTime), 4),
      strength: round(avg, 3),
      confidence: round(frameConfidences ? clamp(avg, 0, 1) : clamp(avg * 2, 0, 1), 3)
    });
  }
  return refineShortSegments(segments).filter((s) => s.end - s.start >= 0.08);
}

function chooseBoundary(rawTime, prevSeg, nextSeg, beatMap, bpm, tuning = DEFAULT_TUNING) {
  if (!beatMap || beatMap.length < 2) {
    return { time: rawTime, source: 'frame', snapped: false };
  }

  const beat = nearestBeatInfo(rawTime, beatMap);
  const interval = beatIntervalAround(rawTime, beatMap, bpm);
  const maxBeatSnap = Math.min(tuning.beatSnapMax, interval * tuning.beatSnapRatio);

  // También probamos subdivisión a medio beat. Esto permite cambios en contratiempo sin
  // forzarlos al beat entero.
  let halfCandidate = null;
  for (let i = 0; i < beatMap.length - 1; i++) {
    const a = beatMap[i].time, b = beatMap[i + 1].time;
    if (rawTime >= a - 0.25 && rawTime <= b + 0.25) {
      const mid = (a + b) / 2;
      halfCandidate = { time: mid, distance: Math.abs(mid - rawTime) };
      break;
    }
  }

  let candidate = null;
  if (beat && beat.distance <= maxBeatSnap) {
    candidate = { time: beat.time, source: 'beat', snapped: true, beat };
  }
  if (halfCandidate && halfCandidate.distance <= Math.min(tuning.halfBeatSnapMax, interval * tuning.halfBeatSnapRatio)) {
    if (!candidate || halfCandidate.distance < Math.abs(candidate.time - rawTime)) {
      candidate = { time: halfCandidate.time, source: 'half-beat', snapped: true };
    }
  }

  if (!candidate) return { time: rawTime, source: 'harmonic', snapped: false };

  // No permitir que el snap cree un segmento microscópico.
  const minDur = 0.10;
  if (prevSeg && candidate.time - prevSeg.start < minDur) return { time: rawTime, source: 'harmonic', snapped: false };
  if (nextSeg && nextSeg.end - candidate.time < minDur) return { time: rawTime, source: 'harmonic', snapped: false };
  return candidate;
}

function refineBoundariesWithBeats(rawSegments, beatMap, bpm, duration, tuning = DEFAULT_TUNING) {
  if (!rawSegments.length) return [];
  const segs = rawSegments.map((s) => ({ ...s }));
  for (let i = 0; i < segs.length - 1; i++) {
    const rawBoundary = (segs[i].end + segs[i + 1].start) / 2;
    const chosen = chooseBoundary(rawBoundary, segs[i], segs[i + 1], beatMap, bpm, tuning);
    const t = clamp(chosen.time, segs[i].start + 0.08, segs[i + 1].end - 0.08);
    segs[i].end = round(t, 4);
    segs[i + 1].start = round(t, 4);
    segs[i].boundarySource = chosen.source;
    segs[i + 1].boundarySource = chosen.source;
  }

  segs[0].start = Math.max(0, segs[0].start);
  segs[segs.length - 1].end = Math.min(duration, Math.max(segs[segs.length - 1].end, segs[segs.length - 1].start + 0.08));
  return mergeAdjacentSameChord(segs).filter((s) => s.end > s.start);
}

function annotateSegments(segments, beatMap) {
  return segments.map((seg, i) => {
    const beat = nearestBeatInfo(seg.start, beatMap);
    const repr = chordRepresentations(seg.chord);
    return {
      ...seg,
      id: `chord-${i}`,
      curr_beat_time: round(seg.start, 4),
      bar_num: beat ? beat.bar_num : null,
      beat_num: beat ? beat.beat_num : null,
      root: repr.root,
      bass: repr.bass,
      chord_simple_pop: repr.simple,
      chord_basic_pop: repr.basic,
      chord_complex_pop: repr.complex,
      chord_easy: repr.simple,
      chord_medium: repr.basic,
      chord_advanced: repr.complex,
      chord_complexity: repr.complexity,
      chord_segment_boundary: true,
      chord_segment_start: true,
      chord_segment_gap_start: false
    };
  });
}

function buildChordMap(segments, beatMap) {
  if (!beatMap.length) return segments.map((s) => ({
    curr_beat_time: s.start,
    start: s.start,
    bar_num: s.bar_num,
    beat_num: s.beat_num,
    chord: s.chord,
    chord_simple_pop: chordRepresentations(s.chord).simple,
    chord_basic_pop: chordRepresentations(s.chord).basic,
    chord_complex_pop: chordRepresentations(s.chord).complex,
    chord_easy: chordRepresentations(s.chord).simple,
    chord_medium: chordRepresentations(s.chord).basic,
    chord_advanced: chordRepresentations(s.chord).complex,
    chord_complexity: chordRepresentations(s.chord).complexity,
    root: chordRepresentations(s.chord).root,
    bass: chordRepresentations(s.chord).bass,
    chord_segment_boundary: true,
    chord_segment_start: true,
    confidence: s.confidence,
    bassEvidence: s.bassEvidence || null,
    noteTranscription: s.noteTranscription || null
  }));

  const out = [];
  let segIdx = 0;
  for (const beat of beatMap) {
    while (segIdx + 1 < segments.length && beat.time >= segments[segIdx].end) segIdx++;
    const seg = segments[segIdx];
    if (!seg || beat.time < seg.start || beat.time >= seg.end) continue;
    const isStart = Math.abs(beat.time - seg.start) <= 0.06;
    out.push({
      curr_beat_time: beat.time,
      start: beat.time,
      bar_num: beat.bar_num,
      beat_num: beat.beat_num,
      chord: seg.chord,
      chord_simple_pop: chordRepresentations(seg.chord).simple,
      chord_basic_pop: chordRepresentations(seg.chord).basic,
      chord_complex_pop: chordRepresentations(seg.chord).complex,
      chord_easy: chordRepresentations(seg.chord).simple,
      chord_medium: chordRepresentations(seg.chord).basic,
      chord_advanced: chordRepresentations(seg.chord).complex,
      chord_complexity: chordRepresentations(seg.chord).complexity,
      root: chordRepresentations(seg.chord).root,
      bass: chordRepresentations(seg.chord).bass,
      prev_chord: out.length ? out[out.length - 1].chord : 'N',
      chord_segment_boundary: isStart ? true : undefined,
      chord_segment_start: isStart ? true : undefined,
      confidence: seg.confidence,
      bassEvidence: seg.bassEvidence || null,
      noteTranscription: seg.noteTranscription || null
    });
  }

  // Inserta cambios off-beat explícitos, al estilo del concepto observado en Moises.
  for (const seg of segments) {
    const n = nearestBeatInfo(seg.start, beatMap);
    if (!n || Math.abs(n.time - seg.start) > 0.06) {
      out.push({
        curr_beat_time: seg.start,
        start: seg.start,
        bar_num: n ? n.bar_num : null,
        beat_num: n ? n.beat_num : null,
        chord: seg.chord,
        chord_simple_pop: chordRepresentations(seg.chord).simple,
        chord_basic_pop: chordRepresentations(seg.chord).basic,
        chord_complex_pop: chordRepresentations(seg.chord).complex,
        root: chordRepresentations(seg.chord).root,
        bass: chordRepresentations(seg.chord).bass,
        chord_segment_boundary: true,
        chord_segment_start: true,
        confidence: seg.confidence,
        bassEvidence: seg.bassEvidence || null,
        noteTranscription: seg.noteTranscription || null
      });
    }
  }
  out.sort((a, b) => a.curr_beat_time - b.curr_beat_time);
  return out;
}

// ---------------- Tonalidad robusta ----------------

const MAJOR_SCALE_PCS = [0,2,4,5,7,9,11];
const MINOR_SCALE_PCS = [0,2,3,5,7,8,10];
const MAJOR_TRIADS = [
  { d: 0, q: 'major', w: 1.00 }, { d: 2, q: 'minor', w: 0.72 }, { d: 4, q: 'minor', w: 0.70 },
  { d: 5, q: 'major', w: 0.90 }, { d: 7, q: 'major', w: 0.95 }, { d: 9, q: 'minor', w: 0.82 }, { d: 11, q: 'dim', w: 0.45 }
];
const MINOR_TRIADS = [
  { d: 0, q: 'minor', w: 1.00 }, { d: 2, q: 'dim', w: 0.40 }, { d: 3, q: 'major', w: 0.85 },
  { d: 5, q: 'minor', w: 0.78 }, { d: 7, q: 'minor', w: 0.66 }, { d: 8, q: 'major', w: 0.90 }, { d: 10, q: 'major', w: 0.92 }
];

function chordFitForKey(chord, tonic, scale) {
  const p = parseChordCore(chord);
  if (!p) return 0;
  const rel = (p.root - tonic + 12) % 12;
  const triads = scale === 'minor' ? MINOR_TRIADS : MAJOR_TRIADS;
  let exact = triads.find((x) => x.d === rel && x.q === p.quality);
  if (exact) return exact.w;
  const degreeOnly = triads.find((x) => x.d === rel);
  if (degreeOnly) {
    // Suspensiones/extensiones conservan la raíz y suelen ser variaciones del grado.
    if (p.quality === 'sus') return degreeOnly.w * 0.72;
    return degreeOnly.w * 0.35;
  }
  // Dominante secundaria / cromatismo: no penalizar a cero si la raíz está a una quinta de un grado diatónico.
  const scalePcs = scale === 'minor' ? MINOR_SCALE_PCS : MAJOR_SCALE_PCS;
  for (const d of scalePcs) {
    if (rel === (d + 7) % 12 && p.quality === 'major') return 0.25;
  }
  return 0;
}

function normalizeKeyName(k) {
  if (!k) return null;
  const s = String(k).trim();
  const m = s.match(/^([A-G])([#b]?)/i);
  if (!m) return null;
  return m[1].toUpperCase() + (m[2] || '');
}

function scoreKeyCandidates(segments, keyResult, tonalKey, tonalScale) {
  const valid = segments.filter((s) => parseChordCore(s.chord));
  const totalDur = valid.reduce((a, s) => a + Math.max(0.05, s.end - s.start), 0) || 1;
  const candidates = [];

  const keyExName = normalizeKeyName(keyResult?.key);
  const keyExPc = keyExName != null ? NOTE_TO_PC[keyExName] : null;
  const keyExScale = keyResult?.scale === 'minor' ? 'minor' : keyResult?.scale === 'major' ? 'major' : null;
  const tonalName = normalizeKeyName(tonalKey);
  const tonalPc = tonalName != null ? NOTE_TO_PC[tonalName] : null;
  const tonalSc = tonalScale === 'minor' ? 'minor' : tonalScale === 'major' ? 'major' : null;

  for (let tonic = 0; tonic < 12; tonic++) {
    for (const scale of ['major','minor']) {
      let harmonic = 0;
      let tonicDuration = 0;
      let dominantDuration = 0;
      for (const s of valid) {
        const dur = Math.max(0.05, s.end - s.start);
        const conf = 0.45 + 0.55 * clamp(Number(s.confidence || 0.5), 0, 1);
        const fit = chordFitForKey(s.chord, tonic, scale);
        harmonic += dur * conf * fit;
        const p = parseChordCore(s.chord);
        if (p) {
          const rel = (p.root - tonic + 12) % 12;
          if (rel === 0 && ((scale === 'major' && p.quality === 'major') || (scale === 'minor' && p.quality === 'minor'))) tonicDuration += dur * conf;
          if (rel === 7) dominantDuration += dur * conf;
        }
      }
      harmonic /= totalDur;

      // Centro tonal: primer/último acorde y presencia de tónica.
      let center = clamp(tonicDuration / totalDur, 0, 1) * 0.42 + clamp(dominantDuration / totalDur, 0, 1) * 0.08;
      const first = valid[0] && parseChordCore(valid[0].chord);
      const last = valid[valid.length - 1] && parseChordCore(valid[valid.length - 1].chord);
      if (first && first.root === tonic) center += 0.08;
      if (last && last.root === tonic) center += 0.15;

      // Acoustic priors: ahora son solo una parte del voto, no autoridad absoluta.
      let detector = 0;
      if (keyExPc === tonic && keyExScale === scale) detector += 0.20 * clamp(Number(keyResult?.strength || 0.5), 0, 1);
      if (tonalPc === tonic && tonalSc === scale) detector += 0.08;

      const score = harmonic * 0.72 + center + detector;
      candidates.push({ tonic, key: PC_TO_SHARP[tonic], scale, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const max = candidates[0]?.score || 1;
  const min = candidates[candidates.length - 1]?.score || 0;
  const span = Math.max(1e-6, max - min);
  for (const c of candidates) c.confidence = round(clamp((c.score - min) / span, 0, 1), 3);
  return candidates;
}

function relativeKeyFor(key, scale) {
  const tonic = NOTE_TO_PC[key];
  if (tonic === undefined) return null;
  if (scale === 'minor') return { key: PC_TO_SHARP[(tonic + 3) % 12], scale: 'major' };
  return { key: PC_TO_SHARP[(tonic + 9) % 12], scale: 'minor' };
}

function chooseRobustKey(segments, keyResult, tonal) {
  const ranked = scoreKeyCandidates(segments, keyResult, tonal.key_key, tonal.key_scale);
  const best = ranked[0] || { key: tonal.key_key || keyResult.key || 'C', scale: tonal.key_scale || keyResult.scale || 'major', confidence: 0 };
  const rel = relativeKeyFor(best.key, best.scale);
  let relative = null;
  if (rel) {
    const rc = ranked.find((x) => x.key === rel.key && x.scale === rel.scale);
    if (rc) relative = { key: rc.key, scale: rc.scale, confidence: rc.confidence };
  }
  return {
    key: best.key,
    scale: best.scale,
    confidence: best.confidence,
    relative,
    alternatives: ranked.slice(0, 5).map((x) => ({ key: x.key, scale: x.scale, confidence: x.confidence }))
  };
}



// ---------------- Tonalidad local / modulaciones (v37) ----------------
function keyStateDistance(a, b) {
  if (!a || !b) return 1;
  if (a.tonic === b.tonic && a.scale === b.scale) return 0;
  const d = Math.min((a.tonic-b.tonic+12)%12,(b.tonic-a.tonic+12)%12);
  let cost = 0.55 + d * 0.055;
  if (a.scale !== b.scale) cost += 0.12;
  // Relative major/minor and parallel keys are common modulation pivots.
  if (a.scale !== b.scale && (d === 3 || d === 0)) cost *= 0.55;
  if (d === 5 || d === 7) cost *= 0.80;
  return cost;
}

function clippedSegmentsForWindow(segments, start, end) {
  const out=[];
  for (const s of segments || []) {
    const a=Math.max(start,Number(s.start||0)), b=Math.min(end,Number(s.end||0));
    if (b-a < 0.05) continue;
    out.push({...s,start:a,end:b});
  }
  return out;
}

function localKeyEmissionCandidates(segments, start, end, globalKey, tuning) {
  const windowSegs=clippedSegmentsForWindow(segments,start,end);
  const ranked=scoreKeyCandidates(windowSegs,null,null,null);
  const byKey=new Map(ranked.map(x=>[`${x.key}|${x.scale}`,x]));
  const rawScores=ranked.map(x=>Number(x.score||0));
  const max=Math.max(...rawScores,0), min=Math.min(...rawScores,0), span=Math.max(1e-5,max-min);
  const states=[];
  for(let tonic=0;tonic<12;tonic++) for(const scale of ['major','minor']) {
    const key=PC_TO_SHARP[tonic], r=byKey.get(`${key}|${scale}`) || {score:min};
    let emission=(Number(r.score||min)-min)/span;
    if(globalKey?.key===key && globalKey?.scale===scale) emission += tuning.modulationGlobalKeyBias;
    states.push({tonic,key,scale,emission,rawScore:Number(r.score||0)});
  }
  const sorted=[...states].sort((a,b)=>b.emission-a.emission);
  const margin=(sorted[0]?.emission||0)-(sorted[1]?.emission||0);
  const confidence=clamp(0.30 + margin*1.65,0,1);
  return {states,confidence,top:sorted[0]||null};
}

function detectKeyModulations(segments, duration, bpm, globalKey, tuning=DEFAULT_TUNING) {
  const beatSec = Number.isFinite(Number(bpm)) && bpm>20 ? 60/bpm : 0.5;
  const windowSec=Math.max(3, tuning.modulationWindowBeats*beatSec);
  const stepSec=Math.max(0.75, tuning.modulationStepBeats*beatSec);
  if (!segments?.length || duration < Math.max(8,windowSec*0.8)) {
    return {regions:[{start:0,end:duration,key:globalKey.key,scale:globalKey.scale,confidence:globalKey.confidence||0.5,source:'global'}],modulations:[],windows:[],enabled:false};
  }
  const centers=[];
  for(let c=Math.min(duration/2,windowSec/2); c<duration; c+=stepSec) centers.push(Math.min(duration,c));
  if (!centers.length || centers[centers.length-1] < duration-windowSec*0.25) centers.push(Math.max(0,duration-windowSec/2));
  const windows=centers.map(c=>{
    const start=Math.max(0,c-windowSec/2), end=Math.min(duration,c+windowSec/2);
    return {center:c,start,end,...localKeyEmissionCandidates(segments,start,end,globalKey,tuning)};
  });
  const K=24, N=windows.length;
  const dp=Array.from({length:N},()=>new Float64Array(K));
  const back=Array.from({length:N},()=>new Int16Array(K));
  for(let k=0;k<K;k++) dp[0][k]=windows[0].states[k].emission;
  for(let i=1;i<N;i++) {
    for(let k=0;k<K;k++) {
      let best=-1e30,bestPrev=0;
      for(let j=0;j<K;j++) {
        const same=j===k;
        const trans=same ? 0.20 : -tuning.modulationChangePenalty*keyStateDistance(windows[i-1].states[j],windows[i].states[k]);
        const val=dp[i-1][j]+trans;
        if(val>best){best=val;bestPrev=j;}
      }
      dp[i][k]=best+windows[i].states[k].emission;
      back[i][k]=bestPrev;
    }
  }
  let kBest=0; for(let k=1;k<K;k++) if(dp[N-1][k]>dp[N-1][kBest]) kBest=k;
  const path=new Array(N); path[N-1]=kBest;
  for(let i=N-1;i>0;i--) path[i-1]=back[i][path[i]];
  const points=windows.map((w,i)=>{
    const st=w.states[path[i]];
    const sorted=[...w.states].sort((a,b)=>b.emission-a.emission);
    const chosen=st.emission, runner=sorted.find(x=>x.key!==st.key||x.scale!==st.scale)?.emission ?? 0;
    const conf=clamp(0.28+(chosen-runner)*1.5,0,1);
    return {time:w.center,key:st.key,scale:st.scale,confidence:conf};
  });
  // Low-confidence windows fall back to the previous/global key before region building.
  let prev={key:globalKey.key,scale:globalKey.scale,confidence:globalKey.confidence||0.5};
  for(const pt of points){
    if(pt.confidence < tuning.modulationMinConfidence){pt.key=prev.key;pt.scale=prev.scale;pt.fallback=true;}
    else prev=pt;
  }
  const regions=[];
  for(let i=0;i<points.length;i++) {
    const start=i===0?0:(points[i-1].time+points[i].time)/2;
    const end=i===points.length-1?duration:(points[i].time+points[i+1].time)/2;
    const pt=points[i];
    const last=regions[regions.length-1];
    if(last && last.key===pt.key && last.scale===pt.scale){
      last.end=end; last.confidence=Math.max(last.confidence,pt.confidence); last.windows++;
    } else regions.push({start,end,key:pt.key,scale:pt.scale,confidence:pt.confidence,windows:1,source:'local-key-hmm-v1'});
  }
  // Absorb implausibly short key regions unless strongly supported.
  const minDur=tuning.modulationMinDurationBeats*beatSec;
  for(let i=0;i<regions.length;i++) {
    const r=regions[i];
    if(r.end-r.start>=minDur || r.confidence>=0.72 || regions.length===1) continue;
    const left=regions[i-1], right=regions[i+1];
    const target=(left&&right)?(left.confidence>=right.confidence?left:right):(left||right);
    if(target){r.key=target.key;r.scale=target.scale;r.confidence=Math.min(r.confidence,target.confidence);r.absorbed=true;}
  }
  const merged=[];
  for(const r of regions){const last=merged[merged.length-1]; if(last&&last.key===r.key&&last.scale===r.scale){last.end=r.end;last.confidence=Math.max(last.confidence,r.confidence);last.windows+=r.windows;}else merged.push({...r});}
  const modulations=[];
  for(let i=1;i<merged.length;i++) if(merged[i].key!==merged[i-1].key||merged[i].scale!==merged[i-1].scale) modulations.push({time:round(merged[i].start,3),from:{key:merged[i-1].key,scale:merged[i-1].scale},to:{key:merged[i].key,scale:merged[i].scale},confidence:round(merged[i].confidence,3)});
  return {regions:merged.map(r=>({...r,start:round(r.start,3),end:round(r.end,3),confidence:round(r.confidence,3)})),modulations,windows:points,enabled:true,windowSeconds:round(windowSec,3),stepSeconds:round(stepSec,3)};
}

function dynamicKeyContextForFrames(modulation, globalKey, frameCount, hopTime) {
  if (!modulation?.regions?.length || frameCount<=0) return globalKey;
  const frameKeys=new Array(frameCount);
  let ri=0;
  for(let i=0;i<frameCount;i++) {
    const t=i*hopTime;
    while(ri<modulation.regions.length-1 && t>=modulation.regions[ri].end) ri++;
    const r=modulation.regions[ri];
    frameKeys[i]={key:r.key,scale:r.scale,confidence:r.confidence,regionIndex:ri};
  }
  return {...globalKey,frameKeys,keyRegions:modulation.regions};
}


// ---------------- Estructura musical / repetición por barras (v56) ----------------
function cosineSimilarity(a,b){
  let dot=0,aa=0,bb=0; const n=Math.min(a?.length||0,b?.length||0);
  for(let i=0;i<n;i++){const x=Number(a[i]||0),y=Number(b[i]||0);dot+=x*y;aa+=x*x;bb+=y*y;}
  return aa>1e-9&&bb>1e-9?dot/Math.sqrt(aa*bb):0;
}
function structuralChordVector(label){
  const v=new Float64Array(24); const p=parseChordCore(label); if(!p)return v;
  const fam=p.family==='minor'?1:0; v[p.root*2+fam]=1;
  return v;
}
function barRangesFromBeatMap(beatMap,duration,meter=4){
  const beats=(beatMap||[]).filter(b=>Number.isFinite(Number(b.time))).sort((a,b)=>a.time-b.time);
  if(!beats.length)return [];
  const starts=[];
  for(let i=0;i<beats.length;i++){
    const b=beats[i];
    if(b.downbeat===true || Number(b.beat_num)===1 || (i===0 && !starts.length)) starts.push(Number(b.time));
  }
  if(starts.length<2){
    starts.length=0; const m=Math.max(1,Number(meter)||4);
    for(let i=0;i<beats.length;i+=m) starts.push(Number(beats[i].time));
  }
  const ranges=[];
  for(let i=0;i<starts.length;i++){
    const start=starts[i],end=i+1<starts.length?starts[i+1]:duration;
    if(end-start>0.2)ranges.push({index:i,start,end});
  }
  return ranges;
}
function fingerprintBar(bar,segments){
  const v=new Float64Array(24); let total=0;
  for(const seg of segments||[]){
    const a=Math.max(bar.start,Number(seg.start||0)),b=Math.min(bar.end,Number(seg.end||0));
    const dur=b-a;if(dur<=0)continue; const cv=structuralChordVector(seg.chord);
    const w=dur*(0.5+0.5*clamp(Number(seg.confidence??0.5),0,1)); total+=w;
    for(let i=0;i<v.length;i++)v[i]+=cv[i]*w;
  }
  if(total>1e-9)for(let i=0;i<v.length;i++)v[i]/=total;
  return v;
}
function concatBarFingerprints(barVectors,start,count){
  const out=new Float64Array(count*24); for(let k=0;k<count;k++)out.set(barVectors[start+k]||new Float64Array(24),k*24); return out;
}
function sectionLetter(i){return String.fromCharCode(65+(i%26));}
function detectRepeatedSections(segments,beatMap,duration,meter,tuning=DEFAULT_TUNING){
  const bars=barRangesFromBeatMap(beatMap,duration,meter); const n=bars.length;
  if(n<tuning.sectionMinBars*2)return {enabled:false,bars:n,sections:[],groups:[],matches:[],reason:'not-enough-bars'};
  const vectors=bars.map(b=>fingerprintBar(b,segments));
  const lengths=[8,4,12,16].filter(x=>x>=tuning.sectionMinBars&&x<=tuning.sectionMaxBars&&x*2<=n);
  if(!lengths.length) lengths.push(tuning.sectionMinBars);
  const matches=[];
  for(const L of lengths){
    for(let i=0;i+L<=n;i++){
      const a=concatBarFingerprints(vectors,i,L);
      for(let j=i+L+tuning.sectionMinRepeatGapBars;j+L<=n;j++){
        const sim=cosineSimilarity(a,concatBarFingerprints(vectors,j,L));
        if(sim>=tuning.sectionSimilarityThreshold)matches.push({a:i,b:j,bars:L,similarity:sim});
      }
    }
  }
  matches.sort((x,y)=>y.similarity-x.similarity||y.bars-x.bars);
  const selected=[]; const occupied=new Set();
  for(const m of matches){
    const keyA=`${m.a}:${m.bars}`,keyB=`${m.b}:${m.bars}`;
    if(occupied.has(keyA)||occupied.has(keyB))continue;
    selected.push(m);occupied.add(keyA);occupied.add(keyB);if(selected.length>=12)break;
  }
  const occurrences=[];
  for(const m of selected){occurrences.push({startBar:m.a,bars:m.bars,peerBar:m.b,similarity:m.similarity});occurrences.push({startBar:m.b,bars:m.bars,peerBar:m.a,similarity:m.similarity});}
  occurrences.sort((a,b)=>a.startBar-b.startBar||b.bars-a.bars);
  const groups=[]; const assigned=[];
  for(const o of occurrences){
    let g=groups.find(g=>g.bars===o.bars&&g.occurrences.some(x=>Math.abs(x.startBar-o.peerBar)<=1));
    if(!g){g={id:`section-${sectionLetter(groups.length)}`,label:`Sección ${sectionLetter(groups.length)}`,bars:o.bars,occurrences:[]};groups.push(g);}
    if(!g.occurrences.some(x=>x.startBar===o.startBar))g.occurrences.push(o);
  }
  const sections=[];
  for(const g of groups){
    g.occurrences.sort((a,b)=>a.startBar-b.startBar);
    const meanSim=g.occurrences.reduce((z,x)=>z+x.similarity,0)/Math.max(1,g.occurrences.length);
    for(let oi=0;oi<g.occurrences.length;oi++){
      const o=g.occurrences[oi],first=bars[o.startBar],last=bars[Math.min(n-1,o.startBar+o.bars-1)]; if(!first||!last)continue;
      sections.push({id:g.id,label:g.label,occurrence:oi+1,start:round(first.start,3),end:round(last.end,3),startBar:o.startBar+1,bars:o.bars,similarity:round(o.similarity,3),groupSimilarity:round(meanSim,3),repeated:true});
    }
  }
  // Fill large uncovered leading/trailing areas as structural regions without semantic verse/chorus guesses.
  sections.sort((a,b)=>a.start-b.start);
  if(sections.length){
    const filled=[];let cursor=0,extra=0;
    for(const sec of sections){
      if(sec.start-cursor>Math.max(2,(60/120)*(meter||4)*2))filled.push({id:`section-U${++extra}`,label:cursor<1?'Intro / no clasificada':`Sección única ${extra}`,start:round(cursor,3),end:sec.start,repeated:false,bars:null,similarity:null});
      filled.push(sec);cursor=Math.max(cursor,sec.end);
    }
    if(duration-cursor>1.5)filled.push({id:`section-U${++extra}`,label:'Outro / no clasificada',start:round(cursor,3),end:round(duration,3),repeated:false,bars:null,similarity:null});
    return {enabled:true,bars:n,sections:filled,groups:groups.map(g=>({id:g.id,label:g.label,bars:g.bars,occurrences:g.occurrences.length})),matches:selected.map(m=>({...m,similarity:round(m.similarity,3)})),method:'bar-chord-self-similarity-v1'};
  }
  return {enabled:true,bars:n,sections:[{id:'section-U1',label:'Sección única',start:0,end:round(duration,3),repeated:false,bars:n,similarity:null}],groups:[],matches:[],method:'bar-chord-self-similarity-v1'};
}

function sectionChordChangeDensity(section,segments){
  const xs=(segments||[]).filter(s=>s.start<section.end&&s.end>section.start); if(!xs.length)return 0;
  const bars=Math.max(1,Number(section.bars)||Math.max(1,(section.end-section.start)/2));
  let changes=0,last=null;for(const x of xs){const c=canonicalChordLabel(x.chord);if(last&&c!==last)changes++;last=c;}
  return clamp(changes/bars/2,0,1);
}
function sectionNovelty(section,sections){
  const i=sections.indexOf(section); if(i<0)return 0.5;
  let score=0.25;
  const prev=sections[i-1],next=sections[i+1];
  if(prev&&prev.id!==section.id)score+=0.25;
  if(next&&next.id!==section.id)score+=0.20;
  if(!section.repeated)score+=0.25;
  return clamp(score,0,1);
}
function softmaxScores(scores){
  const entries=Object.entries(scores); const m=Math.max(...entries.map(([,v])=>v));
  const ex=entries.map(([k,v])=>[k,Math.exp(v-m)]),sum=ex.reduce((a,[,v])=>a+v,0)||1;
  return Object.fromEntries(ex.map(([k,v])=>[k,v/sum]));
}
function semanticSectionFeatures(section,sections,groups,segments,duration,mixEnv,vocalEnv,keyRegions){
  const start=Number(section.start||0),end=Number(section.end||start),mid=(start+end)/2,pos=duration>0?mid/duration:0;
  const energy=intervalMeanEnvelope(mixEnv,start,end,'rmsNorm');
  const energySlope=intervalSlopeEnvelope(mixEnv,start,end,'rmsNorm');
  let vocalActivity=null;
  if(vocalEnv?.length){
    const vr=intervalMeanEnvelope(vocalEnv,start,end,'rmsNorm');
    const mr=Math.max(0.05,energy); vocalActivity=clamp(vr/(mr+0.18),0,1);
  }
  const group=groups?.find(g=>g.id===section.id),repeatCount=group?.occurrences|| (section.repeated?2:1);
  const chordDensity=sectionChordChangeDensity(section,segments);
  const novelty=sectionNovelty(section,sections);
  const modulations=(keyRegions||[]).filter(r=>Number(r.start)>start+0.2&&Number(r.start)<end-0.2).length;
  return {position:pos,energy,energySlope,vocalActivity,repeatCount,chordDensity,novelty,modulations,duration:end-start,bars:Number(section.bars)||null};
}
function classifySemanticSections(structure,segments,duration,mixEnv,vocalEnv,keyRegions,tuning=DEFAULT_TUNING){
  const sections=(structure?.sections||[]).map(s=>({...s})); if(!sections.length)return {sections,diagnostics:{enabled:false,reason:'no-sections'}};
  const groups=structure?.groups||[];
  const feats=sections.map(s=>semanticSectionFeatures(s,sections,groups,segments,duration,mixEnv,vocalEnv,keyRegions));
  const energies=feats.map(f=>f.energy).filter(Number.isFinite).sort((a,b)=>a-b); const medianEnergy=energies.length?energies[Math.floor(energies.length/2)]:0.5;
  const firstPass=[];
  for(let i=0;i<sections.length;i++){
    const f=feats[i],s=sections[i],vocal=f.vocalActivity==null?0.5:f.vocalActivity,repeat=clamp((f.repeatCount-1)/2,0,1),highEnergy=clamp((f.energy-medianEnergy+0.35)/0.7,0,1);
    const scores={
      'Intro': 1.9*(f.position<0.13?1:0)+0.7*(1-vocal)+0.45*(1-highEnergy)-0.5*repeat,
      'Verse': 0.55+0.9*vocal+0.75*repeat+0.35*(1-highEnergy)+0.20*(1-f.novelty),
      'Chorus': 0.15+tuning.semanticRepeatWeight*1.3*repeat+tuning.semanticVocalWeight*0.65*vocal+tuning.semanticChorusEnergyBias*1.05*highEnergy+0.18*f.chordDensity,
      'Bridge': 0.10+tuning.semanticBridgeNoveltyWeight*1.15*f.novelty+0.50*(f.position>0.42&&f.position<0.88?1:0)+0.35*(1-repeat)+0.35*Math.min(1,f.modulations),
      'Solo': 0.05+0.95*(1-vocal)+0.55*highEnergy+0.25*f.chordDensity+0.20*(f.position>0.25&&f.position<0.9?1:0),
      'Outro': 1.8*(f.position>0.88?1:0)+0.75*(1-vocal)+0.55*Math.max(0,-f.energySlope)+0.25*(1-repeat)
    };
    if(vocal>tuning.semanticSoloVocalMax)scores.Solo-=0.75*(vocal-tuning.semanticSoloVocalMax);
    const probs=softmaxScores(scores),rank=Object.entries(probs).sort((a,b)=>b[1]-a[1]);
    firstPass.push({scores:probs,label:rank[0][0],confidence:rank[0][1]});
  }
  // Second pass: a short/rising section immediately before a confident chorus is likely a pre-chorus.
  for(let i=0;i<sections.length-1;i++){
    const next=firstPass[i+1],f=feats[i],cur=firstPass[i];
    if(next.label==='Chorus'&&next.confidence>=0.28&&f.position>0.08&&f.position<0.82&&f.energySlope>0.03&&(f.bars==null||f.bars<=8)){
      const preScore=clamp(0.34+0.32*Math.max(0,f.energySlope)+0.18*(1-clamp((f.repeatCount-1)/2,0,1))+0.16*(1-f.novelty),0,0.92);
      if(preScore>cur.confidence*0.92){cur.label='Pre-Chorus';cur.confidence=preScore;cur.scores={...cur.scores,'Pre-Chorus':preScore};}
    }
  }
  let confident=0;
  for(let i=0;i<sections.length;i++){
    const pred=firstPass[i],f=feats[i],s=sections[i];
    const accepted=pred.confidence>=tuning.semanticSectionMinConfidence;
    if(accepted)confident++;
    s.structuralLabel=s.label;
    s.semanticLabel=accepted?pred.label:'Unclassified';
    s.semanticConfidence=round(pred.confidence,3);
    s.semanticScores=Object.fromEntries(Object.entries(pred.scores).map(([k,v])=>[k,round(v,3)]));
    s.semanticFeatures={position:round(f.position,3),energy:round(f.energy,3),energySlope:round(f.energySlope,3),vocalActivity:f.vocalActivity==null?null:round(f.vocalActivity,3),repeatCount:f.repeatCount,chordDensity:round(f.chordDensity,3),novelty:round(f.novelty,3),modulations:f.modulations};
    if(accepted)s.label=`${pred.label} · ${s.structuralLabel}`;
  }
  return {sections,diagnostics:{enabled:true,method:'hybrid-structural-acoustic-semantic-v1',classified:confident,total:sections.length,coverage:round(confident/sections.length,3),usesVocalStem:!!vocalEnv?.length,medianEnergy:round(medianEnergy,3)}};
}
function segmentAtTime(segments,t){return (segments||[]).find(s=>t>=s.start&&t<s.end)||null;}
function acousticSupportForChord(model,label,start,end,hopTime){
  if(!model?.observations?.length)return 0; const a=Math.max(0,Math.floor(start/hopTime)),b=Math.min(model.observations.length-1,Math.ceil(end/hopTime));
  let sum=0,n=0;for(let i=a;i<=b;i++){sum+=probabilityAtObservationForLabel(model.observations[i],label);n++;}return n?sum/n:0;
}
function reinforceRepeatedSections(segments,structure,activeModel,hopTime,tuning=DEFAULT_TUNING){
  if(!structure?.groups?.length||!segments?.length)return {segments,diagnostics:{enabled:false,changes:0,boosts:0}};
  const out=segments.map(s=>({...s})); let changes=0,boosts=0,comparisons=0;
  for(const group of structure.groups){
    const occ=(structure.sections||[]).filter(s=>s.id===group.id).sort((a,b)=>a.start-b.start); if(occ.length<2)continue;
    const ref=occ.reduce((best,o)=>{
      const ss=out.filter(s=>s.end>o.start&&s.start<o.end); const c=ss.reduce((z,s)=>z+Number(s.confidence||0),0)/Math.max(1,ss.length); return !best||c>best.c?{o,c}:best;
    },null); if(!ref)continue;
    const donors=out.filter(s=>s.end>ref.o.start&&s.start<ref.o.end);
    for(const targetOcc of occ){if(targetOcc===ref.o)continue; const scale=(targetOcc.end-targetOcc.start)/Math.max(1e-6,ref.o.end-ref.o.start);
      for(const donor of donors){
        const rel=((donor.start+donor.end)/2-ref.o.start)/Math.max(1e-6,ref.o.end-ref.o.start); const t=targetOcc.start+rel*(targetOcc.end-targetOcc.start); const target=segmentAtTime(out,t); if(!target)continue; comparisons++;
        const donorConf=Number(donor.confidence||0),targetConf=Number(target.confidence||0); if(donorConf<tuning.sectionRepeatDonorConfidence)continue;
        if(canonicalChordLabel(donor.chord)===canonicalChordLabel(target.chord)){
          const boost=tuning.sectionRepeatBoost*Math.min(1,targetOcc.similarity||0.8); target.confidence=clamp(targetConf+boost*(1-targetConf),0,1); target.repeatEvidence={matchedSection:group.id,donorChord:donor.chord,similarity:targetOcc.similarity,action:'confidence-boost'};boosts++;continue;
        }
        if(targetConf>=tuning.sectionRepeatConfidenceFloor)continue;
        const dur=Math.max(0.08,target.end-target.start); const support=acousticSupportForChord(activeModel,donor.chord,target.start,target.end,hopTime);
        if(support<tuning.sectionRepeatMinAcousticSupport)continue;
        const donorCore=parseChordCore(donor.chord),targetCore=parseChordCore(target.chord);
        // Conservative replacement: same root/family, or target is no-chord/unknown. Never force a remote harmonic substitution from repetition alone.
        const compatible=!targetCore || !donorCore ? false : (donorCore.root===targetCore.root && donorCore.family===targetCore.family);
        if(!(compatible || target.chord==='N' || target.chord==='X'))continue;
        const prev=target.chord; target.chord=donor.chord; target.confidence=clamp(Math.max(targetConf,support)*(1+tuning.sectionRepeatBoost*0.35),0,1);
        target.repeatEvidence={matchedSection:group.id,donorChord:donor.chord,previousChord:prev,similarity:targetOcc.similarity,acousticSupport:round(support,3),action:'conservative-replacement'};changes++;
      }
    }
  }
  return {segments:out,diagnostics:{enabled:true,changes,boosts,comparisons,groups:structure.groups.length,method:'repeat-consensus-with-acoustic-gate-v1'}};
}
function annotateSegmentsWithSections(segments,sections){
  if(!sections?.length)return segments; return (segments||[]).map(seg=>{const mid=(seg.start+seg.end)/2;const sec=sections.find(s=>mid>=s.start&&mid<s.end);return sec?{...seg,section:{id:sec.id,label:sec.label,occurrence:sec.occurrence||null,repeated:!!sec.repeated,similarity:sec.similarity??null}}:{...seg};});
}

function resolveFrameKey(keyContext, index) {
  return keyContext?.frameKeys?.[index] || keyContext;
}

function annotateSegmentsWithKeyRegions(segments, regions) {
  if (!regions?.length) return segments;
  return (segments||[]).map(seg=>{
    const mid=(Number(seg.start||0)+Number(seg.end||0))/2;
    const r=regions.find(x=>mid>=x.start&&mid<x.end) || regions[regions.length-1];
    return {...seg,localKey:r?{key:r.key,scale:r.scale,confidence:r.confidence}:null};
  });
}

function countChordTransitions(sequence) {
  let n = 0, prev = null;
  for (const c of sequence) {
    if (!c || c === 'X') continue;
    if (prev !== null && c !== prev) n++;
    prev = c;
  }
  return n;
}


function chordAtTime(segments, time) {
  if (!segments || !segments.length) return 'N';
  let lo=0, hi=segments.length-1, best=0;
  while (lo<=hi) {
    const mid=(lo+hi)>>1;
    if (segments[mid].start <= time) { best=mid; lo=mid+1; } else hi=mid-1;
  }
  const s=segments[best];
  return s && time >= s.start && time < s.end ? s.chord : 'N';
}

function timeWeightedAgreement(a, b, duration, step=0.10) {
  if (!duration || duration <= 0) return null;
  let same=0, total=0;
  for (let t=0;t<duration;t+=step) {
    const ca=chordAtTime(a,t), cb=chordAtTime(b,t);
    if (ca===cb) same += step;
    total += step;
  }
  return total ? round(same/total,3) : null;
}

function summarizeEngine(name, chords, confidences, segments, finalSegments, duration) {
  const transitions=countChordTransitions(chords || []);
  const valid=(confidences||[]).filter(Number.isFinite);
  const meanConfidence=valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : null;
  return {
    name,
    frames: chords?.length || 0,
    transitions,
    segments: segments?.length || 0,
    meanConfidence: meanConfidence == null ? null : round(meanConfidence,3),
    agreementWithFinal: finalSegments ? timeWeightedAgreement(segments, finalSegments, duration) : null
  };
}

function sameKey(a,b) {
  return !!a && !!b && a.key===b.key && a.scale===b.scale;
}

// ---------- Análisis de archivo completo + caché de features (v20) ----------
async function extractAnalysisFeatures(audioData, sampleRate, duration, progress = true, loadAllNeural = false, rhythmAnalysis = null, chordAnalysis = null, noteAnalysis = null) {
  if (progress) postMessage({ type: 'progress', message: 'Extrayendo features del audio una sola vez…' });
  const audioVector = essentia.arrayToVector(audioData);
  let rhythm = null;
  try {
    if (progress) postMessage({ type: 'progress', message: 'Detectando armonía base…' });
    const tonal = essentia.TonalExtractor(audioVector, 4096, 2048, 440);
    const keyResultRaw = essentia.KeyExtractor(audioVector, true, 4096, 4096, 12, 3500, 60, 25, 0.2, 'bgate', sampleRate, 0.0001, 440, 'cosine', 'hann');

    if (progress) postMessage({ type: 'progress', message: 'Detectando tempo y beat map…' });
    let bpm = null, beats = [], meter = 4;
    try {
      const bpmResult = essentia.PercivalBpmEstimator(audioVector, 1024, 2048, 128, 128, 210, 50, sampleRate);
      bpm = parseFloat(bpmResult.bpm.toFixed(1));
    } catch (e) {}
    try {
      rhythm = essentia.RhythmExtractor2013(audioVector, 1024, 1024, 256, 0.1, 208, 40, 1024, sampleRate, [], 0.24, true, true);
      beats = normalizeBeats(vectorToArray(rhythm.ticks), duration);
      if ((!bpm || bpm <= 0) && rhythm.bpm) bpm = round(Number(rhythm.bpm), 1);
      meter = estimateMeterFromBeats(beats);
    } catch (e) { beats = []; meter = 4; }
    const beatMap = buildBeatMap(beats, meter, duration);
    const mixBeatAccents = beatAccentProfile(audioData, sampleRate, beatMap);
    const mixEnergyEnvelope = rmsEnergyEnvelope(audioData, sampleRate, duration, 0.5);

    const rawChords = vectorToArray(tonal.chords_progression);
    const rawStrengths = vectorToArray(tonal.chords_strength);
    const rawConfidences = rawStrengths.map(x => clamp(Math.abs(Number(x||0))*2,0,1));
    let hpcpRaw = [];
    try { hpcpRaw = vectorVectorToArray(tonal.hpcp); } catch (e) { hpcpRaw = []; }

    if (progress) postMessage({ type: 'progress', message: 'Construyendo probabilidades HPCP…' });
    const hpcpModel = buildProbabilisticObservations(hpcpRaw, rawChords, rawStrengths);
    if (progress) postMessage({ type: 'progress', message: loadAllNeural ? 'Ejecutando checkpoints ONNX configurados…' : 'Ejecutando ONNX opcional…' });
    const neuralPack = await runNeuralModels(hpcpRaw, rawChords.length, loadAllNeural);
    const neuralModels = neuralPack.models || {};
    const defaultNeuralModelId = neuralPack.defaultId || null;
    const neuralModel = defaultNeuralModelId ? (neuralModels[defaultNeuralModelId] || null) : (Object.values(neuralModels)[0] || null);
    const backendChordModel = buildBackendChordProbabilityModel(chordAnalysis, rawChords.length, duration, hpcpModel?.states || []);
    if (progress) postMessage({ type: 'progress', message: 'Ejecutando modelo multi-head opcional…' });
    const multiHeadModel = await runMultiHeadChordModel(hpcpRaw, rawChords.length);

    return {
      sampleRate, duration, bpm, meter, beatMap, mixBeatAccents, mixEnergyEnvelope,
      rawChords, rawStrengths, rawConfidences,
      hpcpModel, neuralModel, neuralModels, defaultNeuralModelId, neuralModelDescriptors: neuralPack.descriptors || [], backendChordModel, multiHeadModel, externalChord: chordAnalysis || null,
      tonalSummary: { key_key: tonal.key_key || null, key_scale: tonal.key_scale || null },
      keyResult: {
        key: keyResultRaw.key || null,
        scale: keyResultRaw.scale || null,
        strength: Number.isFinite(Number(keyResultRaw.strength)) ? Number(keyResultRaw.strength) : 0
      },
      externalRhythm: normalizeExternalRhythm(rhythmAnalysis, duration),
      externalNotes: normalizeExternalNotes(noteAnalysis, duration),
      extractedAt: Date.now()
    };
  } finally {
    try { audioVector.delete(); } catch (e) {}
    try { rhythm && rhythm.ticks && rhythm.ticks.delete(); } catch (e) {}
    // TonalExtractor vectors are converted to JS arrays above; WASM objects are released by wrapper GC.
  }
}

function stableSerialize(value){
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(stableSerialize).join(',')+']';
  return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableSerialize(value[k])).join(',')+'}';
}
function fnv1a32(text){let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,'0');}
function releaseAnalysisSignature(tuning,features){
  return `cs60-${fnv1a32(stableSerialize({profile:tuning.releaseProfile||'rc1-balanced',tuning,duration:round(features.duration||0,3),sampleRate:features.sampleRate||0,frames:features.rawChords?.length||0}))}`;
}
function validateAnalysisContract(result){
  const issues=[];
  if(!Array.isArray(result?.segments))issues.push('segments-missing');
  if(!Array.isArray(result?.beatMap))issues.push('beatMap-missing');
  if(!Number.isFinite(Number(result?.duration)))issues.push('duration-invalid');
  if(result?.segments?.some(x=>!Number.isFinite(Number(x.start))||!Number.isFinite(Number(x.end))||Number(x.end)<Number(x.start)))issues.push('segment-time-invalid');
  if(result?.beatMap?.some((x,i,a)=>i>0&&Number(x.time??x.curr_beat_time)<Number(a[i-1].time??a[i-1].curr_beat_time)))issues.push('beat-order-invalid');
  return {valid:issues.length===0,issues};
}
function analyzeExtractedFeatures(f, tuningOverrides = null) {
  const tuning = tuningConfig(tuningOverrides);
  const requestedAcousticProvider = normalizeAcousticProvider(tuningOverrides && tuningOverrides.acousticProvider);
  const { sampleRate, duration, rawChords, rawStrengths, rawConfidences, hpcpModel, tonalSummary, keyResult } = f;
  const autoStream = (!(tuningOverrides&&tuningOverrides.streamProfile) && String(tuning.pipelinePolicy||'').startsWith('auto')) ? chooseAutomaticStreamProfile(f,tuning) : null;
  const streamProfile = autoStream?.profile || normalizeStreamProfile(tuningOverrides && tuningOverrides.streamProfile, !!f.multiStream);
  const streamFlags = streamProfileFlags(streamProfile);
  const useDrums = !!(streamFlags.drums && f.drumsBeatMap?.length >= 4);
  const mixBeatMap = f.mixBeatMap || f.beatMap || [];
  const beatFusion = useDrums
    ? adaptiveFuseBeatMaps(mixBeatMap, f.drumsBeatMap, f.mixBpm || f.bpm, f.drumsBpm, f.mixMeter || f.meter, f.drumsMeter, duration, tuning)
    : {beatMap:mixBeatMap,bpm:f.mixBpm||f.bpm,meter:f.mixMeter||f.meter,diagnostics:{mode:'mix-only',mixQuality:round(beatMapQuality(mixBeatMap,f.mixBpm||f.bpm).score,3),drumsQuality:0,agreement:0}};
  const fusedBeatAccents = fuseBeatAccents(
    beatFusion.beatMap,
    mixBeatMap,
    f.mixBeatAccents || [],
    f.drumsBeatMap || [],
    f.drumsBeatAccents || [],
    useDrums,
    tuning
  );
  const accentBaseMap = beatFusion.beatMap.map((b,i)=>({...b,accent:fusedBeatAccents?.[i]?.accent??0.5}));
  const accentStructure = inferDownbeatStructure(beatFusion.beatMap, fusedBeatAccents, tuning);
  const rhythmGrid = chooseRhythmGrid(accentBaseMap, accentStructure, f.externalRhythm, tuning, duration);
  const beatMap = rhythmGrid.beatMap;
  const bpm = rhythmGrid.bpm || beatFusion.bpm || f.bpm;
  const downbeatStructure = rhythmGrid.structure;
  const meter = rhythmGrid.meter || downbeatStructure.meter || 4;
  tuning.rhythmProvider = rhythmGrid.requested;
  tuning.streamProfile = streamProfile;
  const requestedNeuralModelId = safeModelId((tuningOverrides && tuningOverrides.neuralModelId) || f.defaultNeuralModelId || 'default');
  const explicitlyRequestedNeuralModel = !!(tuningOverrides && tuningOverrides.neuralModelId);
  const neuralModels = f.neuralModels || (f.neuralModel ? {[f.defaultNeuralModelId || 'default']: f.neuralModel} : {});
  const neuralModel = neuralModels[requestedNeuralModelId] || (!explicitlyRequestedNeuralModel ? (f.neuralModel || Object.values(neuralModels)[0] || null) : null);
  tuning.neuralModelId = requestedNeuralModelId;

  const rawSegments = annotateSegments(
    refineBoundariesWithBeats(buildRawChordTimeline(rawChords, rawStrengths, sampleRate, 2048, duration), beatMap, bpm, duration, tuning),
    beatMap
  );
  let robustKey = chooseRobustKey(rawSegments, keyResult, tonalSummary);
  const backendChordModel = f.backendChordModel || null;
  const multiHeadModel = f.multiHeadModel || null;
  // v56: cuando hay modelo multi-head + Basic Pitch, fusionamos evidencia de notas
  // directamente en root/triad/seventh/extension/bass ANTES de reconstruir P(chord|frame).
  let transcriptionHeadDiagnostics={available:!!f.externalNotes,applied:false};
  let effectiveMultiHeadModel=multiHeadModel;
  const transcriptionTemporalContext=buildTemporalChangeContext(multiHeadModel?.factorized?.headRows?.root?.length||rawChords.length,2048/sampleRate,beatMap,hpcpModel,tuning);
  if(multiHeadModel && f.externalNotes){
    const headFusion=fuseNoteEvidenceIntoMultiHeadModel(multiHeadModel,f.externalNotes,2048/sampleRate,tuning,transcriptionTemporalContext);
    effectiveMultiHeadModel=headFusion.model; transcriptionHeadDiagnostics=headFusion.diagnostics;
  }
  const autoProviderDecision = requestedAcousticProvider==='auto' ? chooseAutomaticAcousticProvider(hpcpModel,neuralModel,backendChordModel,effectiveMultiHeadModel,tuning) : {provider:requestedAcousticProvider,scores:{},reason:'explicit-user-selection'};
  const acousticProvider = autoProviderDecision.provider;
  tuning.acousticProvider = acousticProvider;
  const acousticSelection = selectAcousticModel(acousticProvider, hpcpModel, neuralModel, tuning, backendChordModel, effectiveMultiHeadModel);
  if (!acousticSelection.available) throw new Error(`Proveedor acústico ${acousticProvider} no disponible: ${acousticSelection.error || 'sin detalles'}`);
  let activeModel = acousticSelection.model;
  let acousticSource = acousticSelection.source;
  let adaptiveFusionDiagnostics = null;
  if (streamFlags.other && f.otherModel) {
    if (activeModel) {
      const adaptive = adaptiveBlendProbabilityModels(f.otherModel, activeModel, tuning);
      activeModel = adaptive.model;
      adaptiveFusionDiagnostics = adaptive.diagnostics;
      acousticSource += '+adaptive-other-v20';
    } else {
      activeModel = f.otherModel;
      adaptiveFusionDiagnostics = { adaptive:true, meanOtherWeight:1, minOtherWeight:1, maxOtherWeight:1, disagreementRate:0 };
      acousticSource += '+other-only';
    }
  }

  // v56: Basic Pitch deja de ser solo un verificador post-decoder. Convertimos los eventos
  // de nota a P(chord|frame) y los fusionamos de forma confidence-gated ANTES de Viterbi.
  let transcriptionHarmonyDiagnostics={available:!!f.externalNotes,applied:false,weight:0};
  let transcriptionHarmonyModel=null;
  if(f.externalNotes && activeModel && !transcriptionHeadDiagnostics.applied){
    transcriptionHarmonyModel=buildNoteTranscriptionProbabilityModel(f.externalNotes,activeModel.observations?.length||rawChords.length,2048/sampleRate,activeModel,tuning);
    const noteBlend=blendTranscriptionEvidenceModel(transcriptionHarmonyModel,activeModel,tuning);
    activeModel=noteBlend.model; transcriptionHarmonyDiagnostics=noteBlend.diagnostics;
    if(noteBlend.diagnostics?.applied) acousticSource += '+multipitch-pre-viterbi-v56';
  } else if(transcriptionHeadDiagnostics.applied){
    transcriptionHarmonyDiagnostics={available:true,applied:false,skippedBecause:'direct-multihead-fusion'};
    acousticSource += '+multipitch-head-fusion-v56';
  }

  let decodedChords, decodedConfidences, functionalPriorDiagnostics=null;
  if (activeModel) {
    const decoded = decodeProbabilitySequenceViterbi(activeModel, robustKey, tuning);
    decodedChords = decoded.chords; decodedConfidences = decoded.confidences; functionalPriorDiagnostics=decoded.functionalPrior||null;
  } else {
    decodedChords = decodeChordSequenceViterbi(rawChords, rawStrengths, robustKey, tuning);
    decodedConfidences = rawConfidences;
  }

  let decodedSegments = buildRawChordTimeline(decodedChords, rawStrengths, sampleRate, 2048, duration, true, decodedConfidences);
  if (activeModel) decodedSegments = refineSegmentsWithNovelty(decodedSegments, harmonicNoveltyCurve(activeModel), 2048/sampleRate, duration, tuning);
  let interimSegments = annotateSegments(refineBoundariesWithBeats(decodedSegments, beatMap, bpm, duration, tuning), beatMap);
  const refinedKey = chooseRobustKey(interimSegments, keyResult, tonalSummary);
  const keyChangedAfterDecode = !sameKey(robustKey, refinedKey);
  if (keyChangedAfterDecode && activeModel) {
    robustKey = refinedKey;
    const decoded2 = decodeProbabilitySequenceViterbi(activeModel, robustKey, tuning);
    decodedChords = decoded2.chords; decodedConfidences = decoded2.confidences; functionalPriorDiagnostics=decoded2.functionalPrior||functionalPriorDiagnostics;
    decodedSegments = buildRawChordTimeline(decodedChords, rawStrengths, sampleRate, 2048, duration, true, decodedConfidences);
    decodedSegments = refineSegmentsWithNovelty(decodedSegments, harmonicNoveltyCurve(activeModel), 2048/sampleRate, duration, tuning);
    interimSegments = annotateSegments(refineBoundariesWithBeats(decodedSegments, beatMap, bpm, duration, tuning), beatMap);
  } else robustKey = refinedKey;

  // v37: detect local tonal centers/modulations from the provisional decoded chord map,
  // then run one key-aware decode where both the soft key prior and the functional prior
  // can follow the local key instead of assuming one global tonic for the entire song.
  const modulationAnalysis = detectKeyModulations(interimSegments, duration, bpm, robustKey, tuning);
  let dynamicKeyContext = robustKey;
  let modulationDecodeApplied = false;
  if (activeModel && modulationAnalysis?.regions?.length) {
    dynamicKeyContext = dynamicKeyContextForFrames(modulationAnalysis, robustKey, activeModel.observations?.length || decodedChords.length, 2048/sampleRate);
    if (modulationAnalysis.regions.length > 1) {
      const decodedLocal = decodeProbabilitySequenceViterbi(activeModel, dynamicKeyContext, tuning);
      decodedChords = decodedLocal.chords; decodedConfidences = decodedLocal.confidences; functionalPriorDiagnostics=decodedLocal.functionalPrior||functionalPriorDiagnostics;
      decodedSegments = buildRawChordTimeline(decodedChords, rawStrengths, sampleRate, 2048, duration, true, decodedConfidences);
      decodedSegments = refineSegmentsWithNovelty(decodedSegments, harmonicNoveltyCurve(activeModel), 2048/sampleRate, duration, tuning);
      interimSegments = annotateSegments(refineBoundariesWithBeats(decodedSegments, beatMap, bpm, duration, tuning), beatMap);
      modulationDecodeApplied = true;
    }
  }

  const calibratedSegments = calibrateAdvancedChordSegments(interimSegments, activeModel, sampleRate, 2048, tuning);
  const hierarchicalSegments = hierarchicalRefineChordSegments(calibratedSegments, activeModel, sampleRate, 2048, tuning);
  const bassSegments = streamFlags.bass ? applyBassInversionsToSegments(hierarchicalSegments, f.bassRootModel, 2048/sampleRate, tuning) : hierarchicalSegments;
  const transcriptionPass = applyNoteTranscriptionToSegments(bassSegments, f.externalNotes, tuning);
  const noteAwareSegments = transcriptionPass.segments;
  let sectionAnalysis = detectRepeatedSections(noteAwareSegments, beatMap, duration, meter, tuning);
  const repeatReinforcement = reinforceRepeatedSections(noteAwareSegments, sectionAnalysis, activeModel, 2048/sampleRate, tuning);
  const semanticSections = classifySemanticSections(sectionAnalysis, repeatReinforcement.segments, duration, f.mixEnergyEnvelope||[], f.vocalEnergyEnvelope||[], modulationAnalysis?.regions||[], tuning);
  sectionAnalysis = {...sectionAnalysis, sections:semanticSections.sections, semanticDiagnostics:semanticSections.diagnostics};
  let segments = annotateSegmentsWithKeyRegions(repeatReinforcement.segments, modulationAnalysis?.regions);
  segments = annotateSegmentsWithSections(segments, sectionAnalysis.sections);
  const chordMap = buildChordMap(segments, beatMap);
  const rawTransitions = countChordTransitions(rawChords);
  const decodedTransitions = countChordTransitions(decodedChords);

  let hpcpDecoded=null,hpcpDecodedConf=null,hpcpSegments=null;
  if (hpcpModel) {
    const d=decodeProbabilitySequenceViterbi(hpcpModel,dynamicKeyContext,tuning); hpcpDecoded=d.chords; hpcpDecodedConf=d.confidences;
    let hs=buildRawChordTimeline(hpcpDecoded,rawStrengths,sampleRate,2048,duration,true,hpcpDecodedConf);
    hs=refineSegmentsWithNovelty(hs,harmonicNoveltyCurve(hpcpModel),2048/sampleRate,duration,tuning);
    hpcpSegments=annotateSegments(refineBoundariesWithBeats(hs,beatMap,bpm,duration,tuning),beatMap);
  }
  let neuralDecoded=null,neuralDecodedConf=null,neuralSegments=null;
  if (neuralModel) {
    const d=decodeProbabilitySequenceViterbi(neuralModel,dynamicKeyContext,tuning); neuralDecoded=d.chords; neuralDecodedConf=d.confidences;
    let ns=buildRawChordTimeline(neuralDecoded,rawStrengths,sampleRate,2048,duration,true,neuralDecodedConf);
    ns=refineSegmentsWithNovelty(ns,harmonicNoveltyCurve(neuralModel),2048/sampleRate,duration,tuning);
    neuralSegments=annotateSegments(refineBoundariesWithBeats(ns,beatMap,bpm,duration,tuning),beatMap);
  }
  const benchmark={kind:'internal-consistency-not-ground-truth',note:'Agreement metrics are internal, not annotated accuracy.',engines:[
    summarizeEngine('essentia-raw',rawChords,rawConfidences,rawSegments,segments,duration),
    hpcpModel?summarizeEngine('hpcp-template-probabilistic-v1',hpcpDecoded,hpcpDecodedConf,hpcpSegments,segments,duration):null,
    neuralModel?summarizeEngine('onnx-neural-v1',neuralDecoded,neuralDecodedConf,neuralSegments,segments,duration):null,
    transcriptionHarmonyModel?summarizeEngine('basic-pitch-note-evidence-v1',transcriptionHarmonyModel.observations.map(o=>o.top),transcriptionHarmonyModel.observations.map(o=>o.confidence),null,segments,duration):null,
    summarizeEngine(acousticSource,decodedChords,decodedConfidences,segments,segments,duration)
  ].filter(Boolean)};

  const result = {
    key:robustKey.key, scale:robustKey.scale, strength:robustKey.confidence, keyConfidence:robustKey.confidence,
    relativeKey:robustKey.relative, keyAlternatives:robustKey.alternatives,
    keyRegions:modulationAnalysis?.regions||[], modulations:modulationAnalysis?.modulations||[],
    sections:sectionAnalysis?.sections||[], sectionGroups:sectionAnalysis?.groups||[],
    detectorKey:{tonalExtractor:{key:tonalSummary.key_key,scale:tonalSummary.key_scale},keyExtractor:{key:keyResult.key,scale:keyResult.scale,strength:round(keyResult.strength||0,3)},refinedAfterChordDecode:keyChangedAfterDecode},
    decoderDiagnostics:{states:new Set(decodedChords.filter(c=>c&&c!=='N'&&c!=='X')).size,rawTransitions,decodedTransitions,transitionReduction:rawTransitions>0?round(1-decodedTransitions/rawTransitions,3):0,acousticModel:acousticSource,acousticProviderRequested:requestedAcousticProvider,acousticProviderResolved:acousticSelection.provider,pipelineDecision:{policy:tuning.pipelinePolicy||null,acoustic:autoProviderDecision,streams:autoStream||{profile:streamProfile,reason:'explicit-or-default'}},neuralModelLoaded:!!neuralModel,neuralModelId:requestedNeuralModelId,neuralModelName:neuralModel?.modelName||null,backendChordLoaded:!!backendChordModel,multiHeadLoaded:!!multiHeadModel,multiHeadModelName:multiHeadModel?.modelName||null,multiHeadError:multiHeadRegistry.error||null,multiHeadCalibration:multiHeadModel?.calibration||{loaded:false},multiHeadDecisionThresholds:multiHeadModel?.decisionThresholds||{loaded:false},functionalHarmonyRuntime: functionalPriorDiagnostics||{loaded:!!multiHeadRegistry.functionalPrior,appliedEvaluations:0,weight:tuning.functionalPriorWeight,fitSplit:multiHeadRegistry.functionalPrior?.fitSplit||null,keyRelative:!!multiHeadRegistry.functionalPrior},modulationRuntime:{enabled:!!modulationAnalysis?.enabled,decodeApplied:modulationDecodeApplied,regionCount:modulationAnalysis?.regions?.length||0,modulationCount:modulationAnalysis?.modulations?.length||0,windowSeconds:modulationAnalysis?.windowSeconds||null,stepSeconds:modulationAnalysis?.stepSeconds||null,regions:modulationAnalysis?.regions||[]},sectionStructureRuntime:{enabled:!!sectionAnalysis?.enabled,method:sectionAnalysis?.method||null,barCount:sectionAnalysis?.bars||0,sectionCount:sectionAnalysis?.sections?.length||0,repeatGroupCount:sectionAnalysis?.groups?.length||0,repeatMatches:sectionAnalysis?.matches?.length||0,reinforcement:repeatReinforcement?.diagnostics||null,semantic:sectionAnalysis?.semanticDiagnostics||null},backendChordProvider:f.externalChord?.provider||null,backendChordVocabulary:f.externalChord?.vocabulary||null,noteTranscription:transcriptionPass?.diagnostics||{available:false},noteTranscriptionHarmony:transcriptionHarmonyDiagnostics,noteTranscriptionHeads:transcriptionHeadDiagnostics,neuralRegistry:{attempted:neuralRegistry.attempted,runtimeLoaded:neuralRegistry.runtimeLoaded,defaultId:neuralRegistry.defaultId,available:Object.keys(neuralModels),configured:(f.neuralModelDescriptors||[]),error:neuralRegistry.error},hpcpPitchClassShift:hpcpModel?hpcpModel.shift:null,meanTopProbability:activeModel?round(activeModel.meanTopProbability,3):null,keyRefinementPasses:keyChangedAfterDecode&&activeModel?2:1,featureCache:true,multiStream:!!f.multiStream,streamProfile,streamsAvailable:f.streamFeatures||{mix:true,other:false,bass:false,drums:false,vocals:false},streamsUsed:{mix:true,other:!!(streamFlags.other&&f.otherModel),bass:!!(streamFlags.bass&&f.bassRootModel),drums:useDrums},streams:f.streamFeatures||{mix:true,other:false,bass:false,drums:false,vocals:false},otherHarmonyLoaded:!!f.otherModel,bassRootLoaded:!!f.bassRootModel,drumsBeatMapUsed:useDrums,adaptiveBeatFusion:beatFusion.diagnostics,rhythmProviderRequested:rhythmGrid.requested,rhythmProviderResolved:rhythmGrid.resolved,neuralRhythm:rhythmGrid.diagnostics,downbeatMeter:downbeatStructure,adaptiveOtherFusion:adaptiveFusionDiagnostics,chordVocabulary:{version:'hierarchical-v2',extensionCalibration:true,hierarchicalFactorization:true,components:['root','triad','seventh','extension','alterations','bass'],thresholds:{confidence:tuning.extensionMinConfidence,exactSupport:tuning.extensionExactSupport,alteredConfidence:tuning.alteredChordMinConfidence,hierarchicalMinGain:tuning.hierarchicalMinGain}}},
    benchmark,bpm,meter,duration:round(duration,2),sampleRate,beats:beatMap,beatMap,chordMap,segments,totalChords:new Set(segments.map(s=>s.chord)).size,tuning,
    analysisEngine:'ChordSync Analysis Engine v62',
    analysisFeatures:['feature-cache','single-pass-feature-extraction','fast-hyperparameter-decode','robust-key','iterative-key-refinement','real-beat-map','beat-aware-boundaries','offbeat-boundaries','relative-key','probabilistic-hpcp-observations','optional-onnx-provider','backend-btc-neural-provider','btc-hpcp-ensemble','backend-chord-provider-ab-ready','probability-ensemble','probabilistic-viterbi','harmonic-novelty-boundaries','soft-key-prior','ground-truth-evaluation-ready','end-to-end-quality-benchmark','automatic-per-song-pipeline-selection','release-candidate-contract','reproducible-analysis-signature','quality-gate-ready','provider-reliability-scoring','stream-quality-policy','runtime-latency-metrics','batch-corpus-benchmark-ready','wide-hyperparameter-search-ready','deterministic-search-ready','local-refinement-ready','train-validation-test-ready','holdout-test-ready','overfitting-gap-reporting','acoustic-provider-ab-benchmark','provider-locked-decoding','same-feature-provider-comparison','multi-onnx-registry','multi-checkpoint-benchmark','checkpoint-locked-decoding','multi-stream-architecture','other-harmony-fusion','adaptive-other-fusion','framewise-stream-reliability','adaptive-stream-weight-smoothing','bass-root-evidence','bass-inversion-decoding','adaptive-bass-stability','boundary-guarded-bass-evidence','drums-beat-priority','adaptive-mix-drums-beat-fusion','beat-map-confidence-scoring','beat-synchronous-downbeat-estimation','neural-beat-downbeat-provider','beatnet-crnn-pf','adaptive-rhythm-ensemble','rhythm-provider-ab-ready','meter-phase-inference','pickup-aware-bar-numbering','downbeat-confidence','manual-stem-input-ready','multistream-ab-benchmark-ready','stream-profile-locked-decoding','other-weight-search','bass-threshold-search','same-cache-stream-comparison','advanced-chord-vocabulary','extension-confidence-calibration','canonical-chord-normalization','hierarchical-chord-factorization','root-triad-seventh-extension-decomposition','factorized-posterior-decoder','component-level-ground-truth-evaluation','multihead-onnx-provider','factorized-neural-heads','root-triad-seventh-extension-bass-heads','multihead-hpcp-ensemble','per-head-temperature-scaling','calibration-ece-brier-nll','validation-only-calibration','validation-learned-class-thresholds','precision-aware-advanced-chord-gating','soft-threshold-runtime-gates','musically-structured-training-loss','harmonic-distance-aware-model-selection','train-only-harmonic-transition-context','boundary-transition-aware-model-selection','key-relative-functional-harmony-training','mode-conditioned-functional-transition-priors','runtime-functional-harmony-viterbi','functional-distance-aware-viterbi','voice-leading-aware-viterbi','register-aware-voicing-search','neural-multipitch-note-transcription','basic-pitch-provider','multipitch-pre-viterbi-evidence','confidence-gated-note-chord-fusion','transcription-verified-inversions','observed-voicing-evidence','common-tone-transition-scoring','bass-motion-aware-voice-leading','soft-functional-substitution-scoring','secondary-dominant-resolution-bonus','local-key-modulation-tracking','key-region-hmm','modulation-aware-viterbi','section-relative-functional-prior','bar-level-self-similarity-sections','semantic-section-classification','neural-semantic-section-provider','structure-transformer-onnx-ready','neural-structure-boundary-provider','boundary-transformer-onnx-ready','neural-boundary-refinement','heuristic-neural-section-ensemble','vocal-aware-section-features','energy-and-repetition-section-features','prechorus-context-pass','repeated-section-consensus','acoustic-gated-repeat-reinforcement','section-annotated-chord-map','ambiguity-adaptive-functional-prior','train-only-functional-prior-runtime','hierarchical-confusion-reporting','inversion-bass-metrics','simple-basic-complex','root-bass-fields']
  };
  result.releaseCandidate={profile:tuning.releaseProfile||'rc1-balanced',engine:'v62',analysisSignature:releaseAnalysisSignature(tuning,f),contract:null};
  result.releaseCandidate.contract=validateAnalysisContract(result);
  return result;
}


async function handleAnalyzeMultiStream(id,streams,sampleRate,duration,tuningOverrides=null,rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null){
  const totalStart=performance.now();
  const extractionStart=performance.now();
  const features=await extractMultiStreamFeatures(streams,sampleRate,duration,true,false,rhythmAnalysis,chordAnalysis,noteAnalysis);
  const extractionMs=performance.now()-extractionStart;
  postMessage({type:'progress',message:'Fusionando streams y decodificando secuencia temporal…'});
  const decodeStart=performance.now(); const result=analyzeExtractedFeatures(features,tuningOverrides); const decodeMs=performance.now()-decodeStart;
  result.runtime={extractionMs:round(extractionMs,1),decodeMs:round(decodeMs,1),totalMs:round(performance.now()-totalStart,1),realtimeFactor:duration>0?round((performance.now()-totalStart)/(duration*1000),4):null};
  postMessage({type:'fileResult',id,result});
}

async function handleAnalyzeFile(id,audioData,sampleRate,duration,tuningOverrides=null,rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null){
  const totalStart=performance.now(); const extractionStart=performance.now();
  const features=await extractAnalysisFeatures(audioData,sampleRate,duration,true,false,rhythmAnalysis,chordAnalysis,noteAnalysis);
  const extractionMs=performance.now()-extractionStart;
  postMessage({type:'progress',message:'Decodificando secuencia temporal…'});
  const decodeStart=performance.now(); const result=analyzeExtractedFeatures(features,tuningOverrides); const decodeMs=performance.now()-decodeStart;
  const totalMs=performance.now()-totalStart; result.runtime={extractionMs:round(extractionMs,1),decodeMs:round(decodeMs,1),totalMs:round(totalMs,1),realtimeFactor:duration>0?round(totalMs/(duration*1000),4):null};
  postMessage({type:'fileResult',id,result});
}
async function handlePrepareAnalysisCache(id,audioData,sampleRate,duration,rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null){
  const features=await extractAnalysisFeatures(audioData,sampleRate,duration,true,true,rhythmAnalysis,chordAnalysis,noteAnalysis);
  const cacheId=`f60-${Date.now().toString(36)}-${++analysisCacheCounter}`;
  analysisFeatureCache.set(cacheId,features);
  postMessage({type:'fileResult',id,result:{cacheId,duration:round(duration,2),sampleRate,bpm:features.bpm,meter:features.meter,frames:features.rawChords.length,neuralModelLoaded:!!features.neuralModel,backendChordLoaded:!!features.backendChordModel,multiHeadLoaded:!!features.multiHeadModel,neuralModels:(features.neuralModelDescriptors||[]).map(d=>({...d,loaded:!!features.neuralModels?.[d.id]}))}});
}
async function handlePrepareMultiStreamCache(id,streams,sampleRate,duration,rhythmAnalysis=null,chordAnalysis=null,noteAnalysis=null){
  const features=await extractMultiStreamFeatures(streams,sampleRate,duration,true,true,rhythmAnalysis,chordAnalysis,noteAnalysis);
  const cacheId=`f60ms-${Date.now().toString(36)}-${++analysisCacheCounter}`;
  analysisFeatureCache.set(cacheId,features);
  postMessage({type:'fileResult',id,result:{
    cacheId,duration:round(duration,2),sampleRate,bpm:features.bpm,meter:features.meter,frames:features.rawChords.length,
    multiStream:true,streams:features.streamFeatures||{},neuralModelLoaded:!!features.neuralModel,
    neuralModels:(features.neuralModelDescriptors||[]).map(d=>({...d,loaded:!!features.neuralModels?.[d.id]}))
  }});
}

function handleAnalyzeCached(id,cacheId,tuningOverrides){
  const features=analysisFeatureCache.get(cacheId); if(!features) throw new Error('Caché de features no encontrado o liberado.');
  const t0=performance.now(); const result=analyzeExtractedFeatures(features,tuningOverrides); const decodeMs=performance.now()-t0;
  result.runtime={extractionMs:0,decodeMs:round(decodeMs,1),totalMs:round(decodeMs,1),realtimeFactor:features.duration>0?round(decodeMs/(features.duration*1000),4):null,fromFeatureCache:true};
  postMessage({type:'fileResult',id,result});
}
function handleReleaseAnalysisCache(id,cacheId){
  const released=analysisFeatureCache.delete(cacheId);
  postMessage({type:'fileResult',id,result:{released,cacheId,remaining:analysisFeatureCache.size}});
}
function handleClearAnalysisCache(id){
  const released=analysisFeatureCache.size; analysisFeatureCache.clear();
  postMessage({type:'fileResult',id,result:{released,remaining:0}});
}

// ---------- Análisis en vivo (se conserva ligero por latencia) ----------
function handleAnalyzeLiveChunk(id, audioData, sampleRate) {
  let sumSq = 0;
  for (let i = 0; i < audioData.length; i++) sumSq += audioData[i] * audioData[i];
  const rms = Math.sqrt(sumSq / Math.max(1, audioData.length));
  const rmsDb = 20 * Math.log10(Math.max(rms, 1e-8));

  if (rmsDb < -52) {
    postMessage({ type: 'liveResult', id, chord: 'N', key: '', scale: '', confidence: 0, rmsDb: round(rmsDb, 1) });
    return;
  }

  const audioVector = essentia.arrayToVector(audioData);
  const tonal = essentia.TonalExtractor(audioVector, 2048, 1024, 440);
  const chords = vectorToArray(tonal.chords_progression);
  const strengths = vectorToArray(tonal.chords_strength);
  const scores = {};
  let totalScore = 0;
  chords.forEach((c, i) => {
    if (c === 'N' || c === 'X') return;
    const w = Math.abs(strengths[i] || 0);
    if (w <= 0) return;
    scores[c] = (scores[c] || 0) + w;
    totalScore += w;
  });

  let bestChord = 'N', bestScore = 0;
  Object.keys(scores).forEach((c) => {
    if (scores[c] > bestScore) { bestScore = scores[c]; bestChord = c; }
  });
  const confidence = totalScore > 0 ? Math.min(1, bestScore / totalScore) : 0;
  if (confidence < 0.34) bestChord = 'N';

  try { audioVector.delete(); } catch (e) {}
  try { tonal.chords_progression.delete(); } catch (e) {}
  try { tonal.chords_strength.delete(); } catch (e) {}
  try { safeDeleteVectorVector(tonal.hpcp); } catch (e) {}

  postMessage({
    type: 'liveResult', id, chord: bestChord,
    key: tonal.key_key || '', scale: tonal.key_scale || '',
    confidence: round(confidence, 3), rmsDb: round(rmsDb, 1)
  });
}

onmessage = (e) => {
  const msg = e.data;
  if (!ready) {
    postMessage({ type: 'error', id: msg.id, message: 'Essentia todavía no está listo — intenta de nuevo en un segundo.' });
    return;
  }
  try {
    if (msg.type === 'analyzeMultiStream') {
      Promise.resolve(handleAnalyzeMultiStream(msg.id,msg.streams,msg.sampleRate,msg.duration,msg.tuning,msg.rhythmAnalysis,msg.chordAnalysis,msg.noteAnalysis)).catch((err)=>postMessage({type:'error',id:msg.id,message:err.message||String(err)}));
    } else if (msg.type === 'analyzeFile') {
      Promise.resolve(handleAnalyzeFile(msg.id, msg.samples, msg.sampleRate, msg.duration, msg.tuning, msg.rhythmAnalysis, msg.chordAnalysis, msg.noteAnalysis)).catch((err) => postMessage({ type: 'error', id: msg.id, message: err.message || String(err) }));
    } else if (msg.type === 'prepareAnalysisCache') {
      Promise.resolve(handlePrepareAnalysisCache(msg.id,msg.samples,msg.sampleRate,msg.duration,msg.rhythmAnalysis,msg.chordAnalysis,msg.noteAnalysis)).catch((err)=>postMessage({type:'error',id:msg.id,message:err.message||String(err)}));
    } else if (msg.type === 'prepareMultiStreamCache') {
      Promise.resolve(handlePrepareMultiStreamCache(msg.id,msg.streams,msg.sampleRate,msg.duration,msg.rhythmAnalysis,msg.chordAnalysis,msg.noteAnalysis)).catch((err)=>postMessage({type:'error',id:msg.id,message:err.message||String(err)}));
    } else if (msg.type === 'analyzeCached') handleAnalyzeCached(msg.id,msg.cacheId,msg.tuning);
    else if (msg.type === 'releaseAnalysisCache') handleReleaseAnalysisCache(msg.id,msg.cacheId);
    else if (msg.type === 'clearAnalysisCache') handleClearAnalysisCache(msg.id);
    else if (msg.type === 'analyzeLiveChunk') handleAnalyzeLiveChunk(msg.id, msg.samples, msg.sampleRate);
  } catch (err) {
    postMessage({ type: 'error', id: msg.id, message: err.message || String(err) });
  }
};
