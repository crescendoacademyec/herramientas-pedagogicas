(function () {
  'use strict';

  const D = window.ETData;

  function randInt(n) { return Math.floor(Math.random() * n); }
  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
  function sample(arr) { return arr[randInt(arr.length)]; }
  function pick(arr, n) { return shuffle(arr).slice(0, n); }
  function mod12(n) { return ((n % 12) + 12) % 12; }

  function chordMidis(rootMidi, intervals) { return intervals.map(iv => rootMidi + iv); }

  function diatonicChordMidis(keyRootMidi, degree, type) {
    const ks = type === 'triad' ? [0,2,4] : [0,2,4,6];
    return ks.map(k => {
      const idx = (degree + k) % 7;
      const oct = Math.floor((degree + k) / 7);
      return keyRootMidi + D.MAJOR_SCALE[idx] + oct * 12;
    });
  }

  const REGISTER_RANGES = {
    low: [43,55], mid:[55,67], high:[67,79], random:[48,72]
  };

  function randomRootForPc(pc, register='random') {
    const [min,max] = REGISTER_RANGES[register] || REGISTER_RANGES.random;
    const candidates = [];
    for (let m=min; m<=max; m++) if (mod12(m) === mod12(pc)) candidates.push(m);
    return candidates.length ? sample(candidates) : 60 + mod12(pc);
  }

  function randomIntervalRoot(semitones, mode, register='random') {
    const [min,max] = REGISTER_RANGES[register] || REGISTER_RANGES.random;
    let lo = min, hi = max;
    if (mode === 'ascending') hi = Math.min(hi, 84 - semitones);
    if (mode === 'descending') lo = Math.max(lo, 36 + semitones);
    if (hi < lo) { lo = 55; hi = 67; }
    return lo + randInt(Math.max(1, hi-lo+1));
  }

  function normalizeWithinRange(notes, min=40, max=88) {
    let out = [...notes].sort((a,b)=>a-b);
    while (Math.max(...out) > max) out = out.map(n=>n-12);
    while (Math.min(...out) < min) out = out.map(n=>n+12);
    return out;
  }

  function applyVoicing(intervals, mode='root') {
    const tones = [...intervals].sort((a,b)=>a-b);
    let chosenMode = mode;
    if (mode === 'random') chosenMode = sample(['root','inversions','open']);
    if (chosenMode === 'root' || tones.length < 2) return tones;
    if (chosenMode === 'inversions') {
      const inv = 1 + randInt(Math.max(1, tones.length - 1));
      const out = tones.map((iv, idx) => idx < inv ? iv + 12 : iv).sort((a,b)=>a-b);
      return out;
    }
    // "Abierto / drop 2": en acordes de 4+ notas baja la segunda voz superior una octava.
    // En tríadas crea una disposición abierta elevando la voz central.
    if (tones.length >= 4) {
      const out = [...tones];
      out[out.length - 2] -= 12;
      return out.sort((a,b)=>a-b);
    }
    const out = [...tones];
    out[1] += 12;
    return out.sort((a,b)=>a-b);
  }

  function forcedSet(config) {
    return Array.isArray(config.forcedConceptIds) && config.forcedConceptIds.length ? new Set(config.forcedConceptIds) : null;
  }

  function option(id, label, payload={}) { return { id, label, ...payload }; }

  function tonalReference(keyPc, config, baseStart=0) {
    const mode = config.tonalReference || 'chord';
    const root = randomRootForPc(keyPc, config.register || 'random');
    if (mode === 'note') {
      return { root, steps:[{notes:[root],start:baseStart,dur:0.55,vel:0.65}], next:baseStart+0.8, label:'nota tónica' };
    }
    if (mode === 'cadence') {
      const I = chordMidis(root, D.CORE_CHORDS.MAJ7);
      const IVroot = randomRootForPc(mod12(keyPc+5), config.register || 'random');
      const Vroot = randomRootForPc(mod12(keyPc+7), config.register || 'random');
      const IV = chordMidis(IVroot, D.CORE_CHORDS.MAJ7);
      const V = chordMidis(Vroot, D.CORE_CHORDS.DOM7);
      return {
        root,
        steps:[
          {notes:I,start:baseStart,dur:0.9,vel:0.65},
          {notes:IV,start:baseStart+1.0,dur:0.9,vel:0.7},
          {notes:V,start:baseStart+2.0,dur:0.9,vel:0.75},
          {notes:I,start:baseStart+3.0,dur:1.1,vel:0.8}
        ],
        next:baseStart+4.35,
        label:'cadencia I–IV–V–I'
      };
    }
    return { root, steps:[{notes:chordMidis(root,D.CORE_CHORDS.MAJ7),start:baseStart,dur:1.25,vel:0.7}], next:baseStart+1.55, label:'Imaj7' };
  }

  function intervalDirection(config) {
    const m = config.intervalMode || 'random';
    if (m === 'random') return sample(['ascending','descending','harmonic']);
    return m;
  }

  function generateInterval(config) {
    const forced = forcedSet(config);
    let pool = D.INTERVALS.filter(iv => (config.intervals || []).includes(iv.semitones));
    if (forced) pool = pool.filter(iv => forced.has(`interval:${iv.semitones}`));
    if (!pool.length) return emptyRound('Selecciona al menos un intervalo válido.');
    const target = sample(pool);
    const direction = intervalDirection(config);
    const root = randomIntervalRoot(target.semitones, direction, config.register);
    const upper = root + target.semitones;
    const lower = root - target.semitones;
    let seq;
    if (direction === 'harmonic') seq = [{notes:[root,upper],start:0.08,dur:1.8,vel:0.82}];
    else if (direction === 'descending') seq = [{notes:[root],start:0.05,dur:0.6,vel:0.7},{notes:[lower],start:0.95,dur:1.35,vel:0.8}];
    else seq = [{notes:[root],start:0.05,dur:0.6,vel:0.7},{notes:[upper],start:0.95,dur:1.35,vel:0.8}];

    let candidates = pick(pool, Math.min(4,pool.length));
    if (!candidates.some(x=>x.semitones===target.semitones)) candidates[0]=target;
    candidates = shuffle(candidates);
    const options = candidates.map(x=>option(`interval:${x.semitones}`, x.name, {semitones:x.semitones}));
    const correctIdx = options.findIndex(x=>x.id===`interval:${target.semitones}`);
    const dirLabel = {ascending:'ascendente',descending:'descendente',harmonic:'armónico'}[direction];
    return {
      options, correctIdx, seq,
      meta:{targetId:`interval:${target.semitones}`,targetType:'interval',targetName:target.name,semitones:target.semitones,direction,rootMidi:root},
      feedback(ok, selected) {
        const diff = selected && Number.isFinite(selected.semitones) ? Math.abs(selected.semitones-target.semitones) : null;
        return `${ok?'✓ Correcto':'✕ Respuesta incorrecta'} · <b>${target.name}</b> · ${target.semitones} semitono${target.semitones===1?'':'s'} · ${dirLabel}. ${ok?'':`Elegiste <b>${selected?.label||'—'}</b>${diff!=null?` (diferencia de ${diff} semitono${diff===1?'':'s'})`:''}.`}`;
      }
    };
  }

  function generateChord(config) {
    const forced = forcedSet(config);
    let pool = D.CHORD_BANK.filter(ch => (config.chords || []).includes(ch.id));
    if (forced) pool = pool.filter(ch => forced.has(`chord:${ch.id}`));
    if (!pool.length) return emptyRound('Selecciona al menos un acorde válido.');
    const target = sample(pool);
    const rootPc = randInt(12);
    const rootMidi = randomRootForPc(rootPc, config.register);
    const voiced = applyVoicing(target.intervals, config.chordVoicing || 'root');
    const notes = normalizeWithinRange(voiced.map(iv=>rootMidi+iv));
    let candidates = pick(pool, Math.min(4,pool.length));
    if (!candidates.some(x=>x.id===target.id)) candidates[0]=target;
    candidates=shuffle(candidates);
    const options = candidates.map(x=>option(`chord:${x.id}`, `${x.name} · ${x.symbol || 'Mayor'}`, {chordId:x.id}));
    const correctIdx = options.findIndex(x=>x.id===`chord:${target.id}`);
    const rootName = D.PITCH_NAMES[rootPc];
    return {
      options, correctIdx, seq:[{notes,start:0.1,dur:2.6,vel:0.84}],
      meta:{targetId:`chord:${target.id}`,targetType:'chord',targetName:target.name,chordId:target.id,symbol:target.symbol,formula:D.formulaLabel(target.intervals),root:rootName,voicing:config.chordVoicing||'root'},
      feedback(ok, selected) {
        const aliases = target.aliases?.length ? ` · alias: ${target.aliases.join(', ')}` : '';
        return `${ok?'✓ Correcto':'✕ Respuesta incorrecta'} · <b>${rootName}${target.symbol}</b> — ${target.name}. Fórmula: <b>${D.formulaLabel(target.intervals)}</b>${aliases}${ok?'':`. Elegiste <b>${selected?.label||'—'}</b>.`}`;
      }
    };
  }

  function degreeLabel(d,type){ return type==='triad'?D.LEVEL3_TRIAD_ROMAN[d]:D.LEVEL3_TETRAD_ROMAN[d]; }
  function degreeFormula(d,type){ return type==='triad'?D.LEVEL3_TRIAD_FORMULA[d]:D.LEVEL3_TETRAD_FORMULA[d]; }

  function generateLevel3(config) {
    const type = config.level3Type || 'tetrad';
    const forced = forcedSet(config);
    let targetDegrees = (config.level3Targets || [0,1,2,3,4,5,6]).slice();
    const refs = (config.level3Refs || [0,1,2,3,4,5,6]).slice();
    if (forced) targetDegrees = targetDegrees.filter(d=>forced.has(`degree:${type}:${d}`));
    if (!targetDegrees.length || !refs.length) return emptyRound('Selecciona grados de referencia y objetivo.');
    const keyPc=randInt(12);
    const keyRoot=randomRootForPc(keyPc, config.register);
    const ref=sample(refs);
    let targetPool=targetDegrees.filter(d=>d!==ref); if(!targetPool.length) targetPool=targetDegrees;
    const degree=sample(targetPool);
    let candidates=pick(targetPool,Math.min(4,targetPool.length));
    if(!candidates.includes(degree)) candidates[0]=degree;
    candidates=shuffle(candidates);
    const options=candidates.map(d=>option(`degree:${type}:${d}`,degreeLabel(d,type),{degree:d}));
    const correctIdx=options.findIndex(x=>x.id===`degree:${type}:${degree}`);
    return {
      options,correctIdx,
      seq:[{notes:diatonicChordMidis(keyRoot,ref,type),start:0.05,dur:1.5,vel:0.72},{notes:diatonicChordMidis(keyRoot,degree,type),start:1.85,dur:2.3,vel:0.84}],
      meta:{targetId:`degree:${type}:${degree}`,targetType:'degree',targetName:degreeLabel(degree,type),degree,referenceDegree:ref,key:D.PITCH_NAMES[keyPc],formula:degreeFormula(degree,type)},
      feedback(ok,selected){return `${ok?'✓ Correcto':'✕ Respuesta incorrecta'} · <b>${degreeLabel(degree,type)}</b> en ${D.PITCH_NAMES[keyPc]}. Fórmula: <b>${degreeFormula(degree,type)}</b>. Referencia: ${degreeLabel(ref,type)}${ok?'':`. Elegiste <b>${selected?.label||'—'}</b>.`}`;}
    };
  }

  function generateLevel4(config) {
    const roman=['','ii','iii','IV','V','vi'];
    const forced=forcedSet(config);
    let degrees=[1,2,3,4,5]; if(forced) degrees=degrees.filter(d=>forced.has(`secondary:${d}`));
    if(!degrees.length) return emptyRound('No hay dominantes secundarios en el conjunto de errores.');
    const degree=sample(degrees), keyPc=randInt(12), ref=tonalReference(keyPc,config);
    const targetPc=mod12(keyPc+D.MAJOR_SCALE[degree]);
    const domPc=mod12(targetPc+7);
    const domRoot=randomRootForPc(domPc,config.register);
    let cands=pick([1,2,3,4,5],4); if(!cands.includes(degree)) cands[0]=degree; cands=shuffle(cands);
    const options=cands.map(d=>option(`secondary:${d}`,`V7/${roman[d]}`,{degree:d}));
    const correctIdx=options.findIndex(x=>x.id===`secondary:${degree}`);
    const seq=[...ref.steps,{notes:chordMidis(domRoot,D.CORE_CHORDS.DOM7),start:ref.next,dur:1.45,vel:.84},{notes:diatonicChordMidis(ref.root,degree,'tetrad'),start:ref.next+1.7,dur:2.1,vel:.9}];
    return {options,correctIdx,seq,meta:{targetId:`secondary:${degree}`,targetType:'secondaryDominant',targetName:`V7/${roman[degree]}`,degree,key:D.PITCH_NAMES[keyPc],referenceMode:ref.label},feedback(ok,s){return `${ok?'✓ Correcto':'✕ Respuesta incorrecta'} · <b>V7/${roman[degree]}</b> resolviendo a ${roman[degree]} en ${D.PITCH_NAMES[keyPc]}. Referencia tonal: ${ref.label}${ok?'':`. Elegiste <b>${s?.label||'—'}</b>.`}`;}};
  }

  function generateLevel5(config) {
    const roman=['','ii','iii','IV','V','vi','vii'];
    const forced=forcedSet(config);
    let degrees=[1,2,3,4,5,6]; if(forced) degrees=degrees.filter(d=>forced.has(`dimsecondary:${d}`));
    if(!degrees.length) return emptyRound('No hay disminuidos secundarios en el conjunto de errores.');
    const degree=sample(degrees), keyPc=randInt(12), ref=tonalReference(keyPc,config);
    const targetPc=mod12(keyPc+D.MAJOR_SCALE[degree]), dimPc=mod12(targetPc+11);
    const dimRoot=randomRootForPc(dimPc,config.register);
    let cands=pick([1,2,3,4,5,6],4); if(!cands.includes(degree)) cands[0]=degree; cands=shuffle(cands);
    const options=cands.map(d=>option(`dimsecondary:${d}`,`vii°7/${roman[d]}`,{degree:d}));
    const correctIdx=options.findIndex(x=>x.id===`dimsecondary:${degree}`);
    const seq=[...ref.steps,{notes:chordMidis(dimRoot,D.CORE_CHORDS.DIM7),start:ref.next,dur:1.35,vel:.82},{notes:diatonicChordMidis(ref.root,degree,'tetrad'),start:ref.next+1.6,dur:2.1,vel:.9}];
    return {options,correctIdx,seq,meta:{targetId:`dimsecondary:${degree}`,targetType:'secondaryDiminished',targetName:`vii°7/${roman[degree]}`,degree,key:D.PITCH_NAMES[keyPc],referenceMode:ref.label},feedback(ok,s){return `${ok?'✓ Correcto':'✕ Respuesta incorrecta'} · <b>vii°7/${roman[degree]}</b> resolviendo cromáticamente a ${roman[degree]} en ${D.PITCH_NAMES[keyPc]}${ok?'':`. Elegiste <b>${s?.label||'—'}</b>.`}`;}};
  }

  function generateLevel6(config) {
    const forced=forcedSet(config), roman=['','ii','iii','IV','V','vi'];
    let funcs=['V7','subV7']; if(forced) funcs=funcs.filter(x=>forced.has(`function:${x}`));
    if(!funcs.length) return emptyRound('No hay funciones seleccionadas para repasar.');
    const func=sample(funcs), degree=sample([1,2,3,4,5]), keyPc=randInt(12), ref=tonalReference(keyPc,config);
    const targetPc=mod12(keyPc+D.MAJOR_SCALE[degree]);
    const prePc=func==='subV7'?mod12(targetPc+1):mod12(targetPc+7);
    const preRoot=randomRootForPc(prePc,config.register);
    const options=[option('function:V7','Dominante secundario (V7)'),option('function:subV7','Sustitución tritonal (subV7)')];
    const correctIdx=func==='V7'?0:1;
    const label=options[correctIdx].label;
    const seq=[...ref.steps,{notes:chordMidis(preRoot,D.CORE_CHORDS.DOM7),start:ref.next,dur:1.45,vel:.84},{notes:diatonicChordMidis(ref.root,degree,'tetrad'),start:ref.next+1.7,dur:2.1,vel:.9}];
    return {options,correctIdx,seq,meta:{targetId:`function:${func}`,targetType:'dominantFunction',targetName:label,degree,key:D.PITCH_NAMES[keyPc],referenceMode:ref.label},feedback(ok,s){return `${ok?'✓ Correcto':'✕ Respuesta incorrecta'} · <b>${label}</b> resolviendo a ${roman[degree]}. El sustituto tritonal está a un tritono del dominante y comparte el tritono guía 3ª–7ª${ok?'':`. Elegiste <b>${s?.label||'—'}</b>.`}`;}};
  }

  function generateLevel7(config) {
    const forced=forcedSet(config);
    let pool=D.MODULATIONS.slice(); if(forced) pool=pool.filter(x=>forced.has(`mod:${x.iv}`));
    if(!pool.length) return emptyRound('No hay modulaciones seleccionadas para repasar.');
    const target=sample(pool), keyPc=randInt(12), newPc=mod12(keyPc+target.iv), ref=tonalReference(keyPc,config);
    let cands=pick(D.MODULATIONS,4); if(!cands.some(x=>x.iv===target.iv)) cands[0]=target; cands=shuffle(cands);
    const options=cands.map(x=>option(`mod:${x.iv}`,x.label,{iv:x.iv}));
    const correctIdx=options.findIndex(x=>x.id===`mod:${target.iv}`);
    const newRoot=randomRootForPc(newPc,config.register);
    const ii=chordMidis(randomRootForPc(mod12(newPc+2),config.register),D.CORE_CHORDS.MIN7);
    const V=chordMidis(randomRootForPc(mod12(newPc+7),config.register),D.CORE_CHORDS.DOM7);
    const I=chordMidis(newRoot,D.CORE_CHORDS.MAJ7);
    const seq=[...ref.steps,{notes:ii,start:ref.next,dur:1.35,vel:.72},{notes:V,start:ref.next+1.55,dur:1.35,vel:.82},{notes:I,start:ref.next+3.1,dur:2.1,vel:.9}];
    return {options,correctIdx,seq,meta:{targetId:`mod:${target.iv}`,targetType:'modulation',targetName:target.label,interval:target.iv,from:D.PITCH_NAMES[keyPc],to:D.PITCH_NAMES[newPc],referenceMode:ref.label},feedback(ok,s){return `${ok?'✓ Correcto':'✕ Respuesta incorrecta'} · centro tonal: <b>${D.PITCH_NAMES[keyPc]} → ${D.PITCH_NAMES[newPc]}</b>, ${target.label}${ok?'':`. Elegiste <b>${s?.label||'—'}</b>.`}`;}};
  }

  function generateLevel8(config) {
    const forced=forcedSet(config);
    let types=[
      {id:'maj7',label:'maj7',f:D.CORE_CHORDS.MAJ7,formula:'1–3–5–7'},
      {id:'6',label:'6',f:D.CORE_CHORDS.MAJ6,formula:'1–3–5–6'},
      {id:'69',label:'6/9',f:D.CORE_CHORDS.MAJ69,formula:'1–3–5–6–9'}
    ];
    if(forced) types=types.filter(x=>forced.has(`tonic:${x.id}`));
    if(!types.length) return emptyRound('No hay colores de tónica seleccionados para repasar.');
    const target=sample(types), keyPc=randInt(12), ref=tonalReference(keyPc,config), root=randomRootForPc(keyPc,config.register);
    const options=[
      option('tonic:maj7','maj7'), option('tonic:6','6'), option('tonic:69','6/9')
    ];
    const correctIdx=options.findIndex(x=>x.id===`tonic:${target.id}`);
    const seq=[...ref.steps,{notes:chordMidis(root,target.f),start:ref.next,dur:2.4,vel:.86}];
    return {options,correctIdx,seq,meta:{targetId:`tonic:${target.id}`,targetType:'tonicColor',targetName:target.label,formula:target.formula,key:D.PITCH_NAMES[keyPc],referenceMode:ref.label},feedback(ok,s){return `${ok?'✓ Correcto':'✕ Respuesta incorrecta'} · <b>${D.PITCH_NAMES[keyPc]}${target.label}</b>. Fórmula: <b>${target.formula}</b>${ok?'':`. Elegiste <b>${s?.label||'—'}</b>.`}`;}};
  }

  function emptyRound(message) {
    return {options:[option('empty','Configura el ejercicio')],correctIdx:0,seq:[],meta:{targetId:null,targetType:'empty',targetName:'Sin configuración'},feedback:()=>message,disabled:true};
  }

  function generate(level, config) {
    const map={1:generateInterval,2:generateChord,3:generateLevel3,4:generateLevel4,5:generateLevel5,6:generateLevel6,7:generateLevel7,8:generateLevel8};
    return (map[level]||generateInterval)(config||{});
  }

  window.ETGenerators={ generate, applyVoicing, tonalReference, randomRootForPc, diatonicChordMidis };
})();
