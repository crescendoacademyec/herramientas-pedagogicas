(function () {
  const CHORD_ROOT_TO_PC = Object.freeze({
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
  });
  const MIDI_NATURAL_DEGREES = Object.freeze({ C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 });
  const MIDI_PITCH_SPELLINGS = Object.freeze([
    Object.freeze([{ name: "C", baseName: "C", accidentalSemitone: 0 }]),
    Object.freeze([
      { name: "C#", baseName: "C", accidentalSemitone: 1 },
      { name: "Db", baseName: "D", accidentalSemitone: -1 }
    ]),
    Object.freeze([{ name: "D", baseName: "D", accidentalSemitone: 0 }]),
    Object.freeze([
      { name: "D#", baseName: "D", accidentalSemitone: 1 },
      { name: "Eb", baseName: "E", accidentalSemitone: -1 }
    ]),
    Object.freeze([{ name: "E", baseName: "E", accidentalSemitone: 0 }]),
    Object.freeze([{ name: "F", baseName: "F", accidentalSemitone: 0 }]),
    Object.freeze([
      { name: "F#", baseName: "F", accidentalSemitone: 1 },
      { name: "Gb", baseName: "G", accidentalSemitone: -1 }
    ]),
    Object.freeze([{ name: "G", baseName: "G", accidentalSemitone: 0 }]),
    Object.freeze([
      { name: "G#", baseName: "G", accidentalSemitone: 1 },
      { name: "Ab", baseName: "A", accidentalSemitone: -1 }
    ]),
    Object.freeze([{ name: "A", baseName: "A", accidentalSemitone: 0 }]),
    Object.freeze([
      { name: "A#", baseName: "A", accidentalSemitone: 1 },
      { name: "Bb", baseName: "B", accidentalSemitone: -1 }
    ]),
    Object.freeze([{ name: "B", baseName: "B", accidentalSemitone: 0 }])
  ]);

  function mod12(value) {
    return ((Number(value) % 12) + 12) % 12;
  }

  function uniqueMidiNotes(notes) {
    return [...new Set((notes || []).map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
  }

  function midiNoteCandidates(midiNumber) {
    const pitchClass = mod12(midiNumber);
    const octave = Math.floor(Number(midiNumber) / 12) - 1;
    return (MIDI_PITCH_SPELLINGS[pitchClass] || []).map((spelling) => ({
      midiNumber,
      name: spelling.name,
      label: `${spelling.name}${octave}`,
      octave,
      baseName: spelling.baseName,
      diatonicStep: (octave - 4) * 7 + MIDI_NATURAL_DEGREES[spelling.baseName],
      accidentalSemitone: spelling.accidentalSemitone,
      black: pitchClass === 1 || pitchClass === 3 || pitchClass === 6 || pitchClass === 8 || pitchClass === 10
    }));
  }

  function midiNoteInfo(midiNumber, options = {}) {
    const candidates = midiNoteCandidates(midiNumber);
    if (candidates.length <= 1) return candidates[0] || null;
    const signature = options.signature || null;
    const accidentalSemitone = options.accidentalSemitone || (() => 0);
    const keySignatureAccidentalForDiatonicStep = options.keySignatureAccidentalForDiatonicStep || (() => "natural");
    const signatureMatch = candidates.find((candidate) => (
      accidentalSemitone(keySignatureAccidentalForDiatonicStep(candidate.diatonicStep, signature) || "natural") === candidate.accidentalSemitone
    ));
    if (signatureMatch) return signatureMatch;
    if (signature?.accidental === "flat") {
      return candidates.find((candidate) => candidate.accidentalSemitone < 0) || candidates[0];
    }
    return candidates.find((candidate) => candidate.accidentalSemitone > 0) || candidates[0];
  }

  function midiNoteInfoCandidates(midiNumber, options = {}) {
    const candidates = midiNoteCandidates(midiNumber);
    const preferred = midiNoteInfo(midiNumber, options);
    return [
      preferred,
      ...candidates.filter((candidate) => candidate.name !== preferred?.name)
    ].filter(Boolean);
  }

  function midiInfoSpellingKey(info) {
    return `${info?.diatonicStep}:${info?.accidentalSemitone}`;
  }

  function midiInfosAvoidingStaffCollisions(notes, options = {}) {
    const ordered = uniqueMidiNotes(notes);
    const preferredInfos = options.preferredInfos || null;
    const candidateSets = ordered.map((note, index) => {
      const preferred = preferredInfos?.[index] || midiNoteInfo(note, options);
      const candidates = [
        preferred,
        ...midiNoteInfoCandidates(note, options)
      ];
      const seen = new Set();
      return candidates.filter((candidate) => {
        const key = midiInfoSpellingKey(candidate);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
    let bestInfos = preferredInfos?.length === ordered.length ? preferredInfos : ordered.map((note) => midiNoteInfo(note, options));
    let bestScore = Infinity;
    const evaluate = (infos) => {
      const used = new Map();
      infos.forEach((info) => {
        used.set(info.diatonicStep, (used.get(info.diatonicStep) || 0) + 1);
      });
      const collisions = [...used.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
      const accidentalCost = infos.reduce((sum, info) => sum + Math.abs(Number(info.accidentalSemitone) || 0), 0);
      const preferredCost = infos.reduce((sum, info, index) => (
        sum + (midiInfoSpellingKey(info) === midiInfoSpellingKey(preferredInfos?.[index]) ? 0 : 0.2)
      ), 0);
      return collisions * 100 + accidentalCost + preferredCost;
    };
    const walk = (index, current) => {
      if (index >= candidateSets.length) {
        const score = evaluate(current);
        if (score < bestScore) {
          bestScore = score;
          bestInfos = current.map((info) => ({ ...info }));
        }
        return;
      }
      candidateSets[index].forEach((candidate) => walk(index + 1, [...current, candidate]));
    };
    walk(0, []);
    return bestInfos.filter(Boolean);
  }

  function accidentalTokenSemitone(token) {
    return { bb: -2, b: -1, "": 0, "#": 1, "##": 2 }[String(token || "")] ?? 0;
  }

  function spelledMidiInfo(midiNumber, noteName, fallbackInfo, options = {}) {
    const normalized = String(noteName || "").replace(/♭/g, "b").replace(/♯/g, "#").trim();
    const match = normalized.match(/^([A-G])((?:bb|##|b|#)?)$/);
    if (!match) return fallbackInfo;
    const letter = match[1];
    const accidentalToken = match[2] || "";
    const octave = options.spelledOctave
      ? options.spelledOctave(midiNumber, letter, accidentalToken)
      : Math.floor(Number(midiNumber) / 12) - 1;
    return {
      ...fallbackInfo,
      midiNumber,
      name: `${letter}${accidentalToken}`,
      label: `${letter}${accidentalToken}${octave}`,
      octave,
      baseName: letter,
      diatonicStep: (octave - 4) * 7 + MIDI_NATURAL_DEGREES[letter],
      accidentalSemitone: accidentalTokenSemitone(accidentalToken)
    };
  }

  function midiForDiatonicStep(diatonicStep, accidental = "natural", accidentalSemitone = () => 0) {
    const step = Math.round(Number(diatonicStep) || 0);
    const octaveOffset = Math.floor(step / 7);
    const degree = ((step % 7) + 7) % 7;
    const diatonicStepToSemitone = [0, 2, 4, 5, 7, 9, 11];
    return 60 + octaveOffset * 12 + diatonicStepToSemitone[degree] + accidentalSemitone(accidental);
  }

  function normalizeChordSuffix(suffix) {
    let normalized = String(suffix || "")
      .trim()
      .replace(/maj/gi, "∆")
      .replace(/Δ/g, "∆")
      .replace(/^min/i, "m")
      .replace(/^dim/i, "º")
      .replace(/^m7b5$/i, "m7(b5)");
    if (/^∆7$/i.test(normalized)) normalized = "∆";
    if (/^M7$/.test(normalized)) normalized = "∆";
    if (/^M9$/.test(normalized)) normalized = "∆9";
    if (/^M13$/.test(normalized)) normalized = "∆13";
    if (/^(?:∆)?(?:69|6\/9|6add9)$/i.test(normalized)) normalized = "6(9)";
    if (/^m(?:69|6\/9|6add9)$/i.test(normalized)) normalized = "m6(9)";
    if (/^(?:7)?(?:\(?alt\)?|altered)$/i.test(normalized)) normalized = "7alt";
    return normalized;
  }

  function chordSuffixMatchKey(suffix) {
    return normalizeChordSuffix(suffix)
      .replace(/add(?=\d)/gi, "")
      .replace(/[()\s/]/g, "");
  }

  function parseChordSymbol(symbol) {
    const raw = String(symbol || "").trim()
      .replace(/[♭]/g, "b")
      .replace(/[♯]/g, "#")
      .replace(/\s+/g, "")
      .replace(/^([a-g])/, (match) => match.toUpperCase())
      .replace(/maj/gi, "∆")
      .replace(/Δ/g, "∆")
      .replace(/^([A-G][#b]?)-/, "$1m");
    const match = raw.match(/^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/);
    if (!match) return null;
    const root = match[1];
    const suffix = normalizeChordSuffix(match[2] || "");
    const bass = match[3] || root;
    if (!(root in CHORD_ROOT_TO_PC) || !(bass in CHORD_ROOT_TO_PC)) return null;
    return {
      raw,
      root,
      rootPc: CHORD_ROOT_TO_PC[root],
      suffix,
      bass,
      bassPc: CHORD_ROOT_TO_PC[bass]
    };
  }

  function normalizeChordSymbol(symbol, patterns = []) {
    const parsed = parseChordSymbol(symbol);
    if (!parsed) return "";
    const pattern = patternForChordSuffix(parsed.suffix, patterns);
    const suffix = parsed.suffix === "7alt" ? "7alt" : pattern?.nombre ?? parsed.suffix;
    const bass = parsed.bass && parsed.bass !== parsed.root ? `/${parsed.bass}` : "";
    return `${parsed.root}${suffix}${bass}`;
  }

  function patternForChordSuffix(suffix, patterns = []) {
    const normalized = normalizeChordSuffix(suffix);
    const key = chordSuffixMatchKey(normalized);
    if (normalized === "7alt") {
      return (patterns || []).find((pattern) => pattern.nombre === "+7(#9)") ||
        (patterns || []).find((pattern) => pattern.nombre === "7(#9)b13") ||
        null;
    }
    return (patterns || []).find((pattern) => pattern.nombre === normalized) ||
      (patterns || []).find((pattern) => pattern.nombre === normalized.replace(/[()]/g, "")) ||
      (patterns || []).find((pattern) => chordSuffixMatchKey(pattern.nombre) === key) ||
      null;
  }

  function uniquePatterns(patterns) {
    const seen = new Set();
    return (patterns || []).filter((pattern) => {
      const key = pattern?.nombre || "";
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function altPatternCandidates(patterns = []) {
    const names = [
      "+7(#9)",
      "7(b5)#9",
      "7(b5)b9",
      "+7(b9)",
      "7(#9)b13"
    ];
    return uniquePatterns(names
      .map((name) => (patterns || []).find((pattern) => pattern.nombre === name))
      .filter(Boolean));
  }

  function patternCandidatesForChordSuffix(suffix, patterns = []) {
    const normalized = normalizeChordSuffix(suffix);
    if (normalized === "7alt") return altPatternCandidates(patterns);
    const pattern = patternForChordSuffix(suffix, patterns);
    return pattern ? [pattern] : [];
  }

  function midiInRangeForPitchClass(pitchClass, minMidi, maxMidi, target = null) {
    const pc = mod12(pitchClass);
    const values = [];
    for (let midi = minMidi; midi <= maxMidi; midi += 1) {
      if (mod12(midi) === pc) values.push(midi);
    }
    if (!values.length) return null;
    if (!Number.isFinite(target)) return values[0];
    return values.reduce((best, midi) => (
      Math.abs(midi - target) < Math.abs(best - target) ? midi : best
    ), values[0]);
  }

  function voicingScore(notes, target = 60) {
    if (!notes?.length) return Infinity;
    const ordered = [...notes].sort((a, b) => a - b);
    const average = ordered.reduce((sum, note) => sum + note, 0) / ordered.length;
    const gaps = ordered.slice(1).map((note, idx) => note - ordered[idx]);
    const largeGapPenalty = gaps.reduce((sum, gap) => sum + Math.max(0, gap - 5) * 2, 0);
    const span = ordered.at(-1) - ordered[0];
    return Math.abs(average - target) * 10 + span * 0.8 + largeGapPenalty;
  }

  function closedUpperVoicingNearC4(pitchClasses, options = {}) {
    const uniquePcs = [...new Set((pitchClasses || []).map(mod12))];
    if (!uniquePcs.length) return [];
    const guidePitchClasses = new Set((options.guidePitchClasses || []).map(mod12));
    const candidateLists = uniquePcs.map((pc) => {
      const candidates = [];
      for (let midi = 45; midi <= 76; midi += 1) {
        if (mod12(midi) === pc) candidates.push(midi);
      }
      return candidates;
    });
    let best = null;
    const visit = (index, chosen) => {
      if (index >= candidateLists.length) {
        const notes = [...chosen].sort((a, b) => a - b);
        const guidePenalty = guidePitchClasses.size && !guidePitchClasses.has(mod12(notes[0])) ? 10000 : 0;
        const score = guidePenalty + voicingScore(notes);
        if (!best || score < best.score) best = { notes, score };
        return;
      }
      candidateLists[index].forEach((midi) => {
        if (chosen.includes(midi)) return;
        visit(index + 1, [...chosen, midi]);
      });
    };
    visit(0, []);
    return best?.notes || [];
  }

  function closedVoicingWithTop(pitchClasses, topMidi) {
    const uniquePcs = [...new Set((pitchClasses || []).map(mod12))];
    const top = Math.round(Number(topMidi));
    if (!uniquePcs.length || !Number.isFinite(top)) return [];
    const topPc = mod12(top);
    if (!uniquePcs.includes(topPc)) return [];
    const remaining = uniquePcs.filter((pc) => pc !== topPc);
    const descending = [top];
    let ceiling = top - 1;
    while (remaining.length) {
      let bestIndex = -1;
      let bestMidi = -Infinity;
      remaining.forEach((pc, index) => {
        let candidate = ceiling;
        while (candidate >= ceiling - 12 && mod12(candidate) !== pc) candidate -= 1;
        if (candidate > bestMidi) {
          bestMidi = candidate;
          bestIndex = index;
        }
      });
      if (bestIndex < 0 || !Number.isFinite(bestMidi)) return [];
      descending.push(bestMidi);
      remaining.splice(bestIndex, 1);
      ceiling = bestMidi - 1;
    }
    return descending.sort((a, b) => a - b);
  }

  const MIN_GENERATED_UPPER_NOTE_COUNT = 4;

  function generationIntervalsForPattern(pattern) {
    // Gen. writes only the chord tones required by the symbol. Optional tones
    // remain useful for recognition, but are deliberately ignored here.
    return [...new Set([...(pattern?.obligatorias || pattern?.intervalos || [])].map(mod12))];
  }

  function optionalIntervalsForPattern(pattern) {
    return [...new Set([...(pattern?.opcionales || [])].map(mod12))];
  }

  function guideIntervalsForPattern(pattern, intervals) {
    const suffix = String(pattern?.nombre || "");
    const intervalSet = new Set((intervals || []).map(mod12));
    const guides = [];
    const add = (interval) => {
      const normalized = mod12(interval);
      if (intervalSet.has(normalized) && !guides.includes(normalized)) guides.push(normalized);
    };
    if (/sus2/i.test(suffix)) add(2);
    if (/sus4/i.test(suffix)) add(5);
    add(3);
    add(4);
    if (/(?:^|[^1])6/.test(suffix) && !/13/.test(suffix)) add(9);
    add(10);
    add(11);
    if (/º7/.test(suffix)) add(9);
    return guides;
  }

  function isSecondGap(gap) {
    return gap === 1 || gap === 2;
  }

  function firstConsecutiveSecondCluster(notes) {
    const ordered = [...notes].sort((a, b) => a - b);
    for (let index = 0; index < ordered.length - 2; index += 1) {
      if (isSecondGap(ordered[index + 1] - ordered[index]) && isSecondGap(ordered[index + 2] - ordered[index + 1])) {
        return index;
      }
    }
    return -1;
  }

  function consecutiveSecondClusterCount(notes) {
    const ordered = [...notes].sort((a, b) => a - b);
    let count = 0;
    for (let index = 0; index < ordered.length - 2; index += 1) {
      if (isSecondGap(ordered[index + 1] - ordered[index]) && isSecondGap(ordered[index + 2] - ordered[index + 1])) count += 1;
    }
    return count;
  }

  function duplicateMidiCount(notes) {
    return notes.length - new Set(notes).size;
  }

  function lowerClusterNoteCandidate(notes, clusterIndex, noteOffset) {
    const ordered = [...notes].sort((a, b) => a - b);
    const bass = ordered[0];
    const upper = ordered.slice(1);
    const target = upper[clusterIndex + noteOffset];
    if (!Number.isFinite(target)) return null;
    const loweredTarget = target - 12;
    const next = ordered.map((note) => note === target ? loweredTarget : note);
    if (loweredTarget < bass) {
      const bassIndex = next.indexOf(bass);
      if (bassIndex >= 0) next[bassIndex] = bass - 12;
    }
    return next.sort((a, b) => a - b);
  }

  function preservesLockedTop(notes, lockedTopMidi) {
    const lockedTop = Math.round(Number(lockedTopMidi));
    if (!Number.isFinite(lockedTop)) return true;
    const ordered = [...notes].map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    return ordered.includes(lockedTop) && ordered.at(-1) === lockedTop;
  }

  function finiteOptionNumber(options, key) {
    if (!Object.prototype.hasOwnProperty.call(options || {}, key)) return null;
    if (options[key] == null) return null;
    const value = Number(options[key]);
    return Number.isFinite(value) ? value : null;
  }

  function resolveConsecutiveSecondClusters(notes, options = {}) {
    let current = [...notes].map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    const lockedTopValue = finiteOptionNumber(options, "lockedTopMidi");
    const lockedTopMidi = lockedTopValue == null ? null : Math.round(lockedTopValue);
    for (let guard = 0; guard < 8; guard += 1) {
      const upper = current.slice(1);
      const clusterIndex = firstConsecutiveSecondCluster(upper);
      if (clusterIndex < 0) break;
      const baseClusterCount = consecutiveSecondClusterCount(upper);
      const candidates = [
        lowerClusterNoteCandidate(current, clusterIndex, 1),
        lowerClusterNoteCandidate(current, clusterIndex, 2)
      ].filter((candidate) => candidate && preservesLockedTop(candidate, lockedTopMidi)).map((candidate) => ({
        notes: candidate,
        duplicates: duplicateMidiCount(candidate),
        clusters: consecutiveSecondClusterCount(candidate.slice(1)),
        score: voicingScore(candidate.slice(1)) + (candidate.at(-1) - candidate[0]) * 0.2
      }));
      const selected = candidates.find((candidate) => candidate.duplicates === 0 && candidate.clusters < baseClusterCount) ||
        candidates.find((candidate) => candidate.duplicates === 0) ||
        null;
      if (!selected || selected.notes.join(",") === current.join(",")) break;
      current = selected.notes;
    }
    return current;
  }

  function guidePitchClassesForPattern(pattern, intervals, rootPc) {
    return guideIntervalsForPattern(pattern, intervals).map((interval) => mod12(rootPc + interval));
  }

  function generationPitchClassesForPattern(pattern, rootPc) {
    const intervals = generationIntervalsForPattern(pattern);
    return intervals.map((interval) => mod12(rootPc + interval));
  }

  function optionalPitchClassesForPattern(pattern, rootPc) {
    return optionalIntervalsForPattern(pattern).map((interval) => mod12(rootPc + interval));
  }

  function upperPitchClassesWithMinimum(generationPitchClasses, optionalPitchClasses, bassPc, options = {}) {
    const minCount = Number(options.minCount) || MIN_GENERATED_UPPER_NOTE_COUNT;
    const lockedTopValue = finiteOptionNumber(options, "lockedTopPc");
    const lockedTopPc = lockedTopValue == null ? null : mod12(lockedTopValue);
    const upper = [];
    const add = (pc) => {
      const normalized = mod12(pc);
      if (!upper.includes(normalized)) upper.push(normalized);
    };
    (generationPitchClasses || []).forEach((pc) => {
      if (mod12(pc) !== mod12(bassPc)) add(pc);
    });
    if (lockedTopPc != null) add(lockedTopPc);
    (optionalPitchClasses || []).forEach((pc) => {
      if (upper.length < minCount) add(pc);
    });
    if (upper.length < minCount) add(bassPc);
    (generationPitchClasses || []).forEach((pc) => {
      if (upper.length < minCount) add(pc);
    });
    return upper;
  }

  function duplicateMidiForPitchClass(notes, pitchClass, options = {}) {
    const pc = mod12(pitchClass);
    const current = [...notes].map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    const lockedTopValue = finiteOptionNumber(options, "lockedTopMidi");
    const lockedTop = lockedTopValue == null ? null : Math.round(lockedTopValue);
    const candidates = [];
    for (let midi = 24; midi <= 84; midi += 1) {
      if (mod12(midi) !== pc || current.includes(midi)) continue;
      if (lockedTop != null && midi >= lockedTop) continue;
      candidates.push(midi);
    }
    if (!candidates.length) return null;
    return candidates
      .map((midi) => {
        const next = [...current, midi].sort((a, b) => a - b);
        return {
          midi,
          score: voicingScore(next) + (lockedTop != null && next.at(-1) !== lockedTop ? 10000 : 0)
        };
      })
      .sort((a, b) => a.score - b.score)[0]?.midi ?? null;
  }

  function ensureMinimumUpperNoteCount(upper, options = {}) {
    const minCount = Number(options.minCount) || MIN_GENERATED_UPPER_NOTE_COUNT;
    let notes = [...upper].map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    const duplicatePitchClasses = [...new Set((options.duplicatePitchClasses || []).map(mod12))];
    for (let guard = 0; notes.length < minCount && guard < 12; guard += 1) {
      const pitchClass = duplicatePitchClasses[guard % Math.max(1, duplicatePitchClasses.length)];
      const duplicate = duplicateMidiForPitchClass(notes, pitchClass, options);
      if (!Number.isFinite(duplicate)) break;
      notes = [...notes, duplicate].sort((a, b) => a - b);
    }
    return notes;
  }

  function patternSupportsLockedTop(pattern, rootPc, lockedTopPc) {
    if (!pattern || !Number.isFinite(lockedTopPc)) return false;
    return generationPitchClassesForPattern(pattern, rootPc).includes(lockedTopPc) ||
      optionalPitchClassesForPattern(pattern, rootPc).includes(lockedTopPc);
  }

  function patternPitchClassSet(pattern, rootPc) {
    return new Set([
      ...generationPitchClassesForPattern(pattern, rootPc),
      ...optionalPitchClassesForPattern(pattern, rootPc)
    ]);
  }

  function patternDistanceFromDefault(pattern, defaultPattern, rootPc) {
    if (!pattern || !defaultPattern) return 0;
    const candidateSet = patternPitchClassSet(pattern, rootPc);
    const defaultSet = patternPitchClassSet(defaultPattern, rootPc);
    let distance = 0;
    candidateSet.forEach((pc) => {
      if (!defaultSet.has(pc)) distance += 1;
    });
    defaultSet.forEach((pc) => {
      if (!candidateSet.has(pc)) distance += 1;
    });
    return distance;
  }

  function patternForLockedTop(candidates, rootPc, lockedTopPc) {
    const compatible = (candidates || []).filter((candidate) => patternSupportsLockedTop(candidate, rootPc, lockedTopPc));
    if (!compatible.length) return candidates?.[0] || null;
    const defaultPattern = candidates?.[0] || compatible[0];
    return compatible
      .map((pattern) => ({
        pattern,
        distance: patternDistanceFromDefault(pattern, defaultPattern, rootPc),
        topIsRequired: generationPitchClassesForPattern(pattern, rootPc).includes(lockedTopPc)
      }))
      .sort((a, b) => (
        a.distance - b.distance ||
        Number(b.topIsRequired) - Number(a.topIsRequired) ||
        candidates.indexOf(a.pattern) - candidates.indexOf(b.pattern)
      ))[0]?.pattern || null;
  }

  function midiNotesForChordSymbolResult(symbol, patterns = [], options = {}) {
    const parsed = parseChordSymbol(symbol);
    if (!parsed) return null;
    const lockedTop = Math.round(Number(options.lockedTopMidi));
    const hasLockedTop = Number.isFinite(lockedTop);
    const lockedTopPc = hasLockedTop ? mod12(lockedTop) : null;
    const candidates = patternCandidatesForChordSuffix(parsed.suffix, patterns);
    const pattern = hasLockedTop
      ? patternForLockedTop(candidates, parsed.rootPc, lockedTopPc)
      : candidates[0];
    if (!pattern) return null;
    const intervals = generationIntervalsForPattern(pattern);
    const bass = midiInRangeForPitchClass(parsed.bassPc, 36, 48, 42);
    if (!Number.isFinite(bass)) return null;
    let generationPitchClasses = generationPitchClassesForPattern(pattern, parsed.rootPc);
    const optionalPitchClasses = optionalPitchClassesForPattern(pattern, parsed.rootPc);
    if (hasLockedTop && !generationPitchClasses.includes(lockedTopPc)) {
      if (!optionalPitchClasses.includes(lockedTopPc)) return null;
      generationPitchClasses = [...generationPitchClasses, lockedTopPc];
    }
    const upperPitchClasses = upperPitchClassesWithMinimum(generationPitchClasses, optionalPitchClasses, bass, { lockedTopPc });
    const isInversion = parsed.bassPc !== parsed.rootPc;
    const guidePitchClasses = !hasLockedTop && !isInversion
      ? guidePitchClassesForPattern(pattern, intervals, parsed.rootPc).filter((pc) => pc !== mod12(bass))
      : [];
    const baseUpper = hasLockedTop
      ? closedVoicingWithTop(upperPitchClasses, lockedTop)
      : closedUpperVoicingNearC4(upperPitchClasses, { guidePitchClasses });
    if (hasLockedTop && !baseUpper.length) return null;
    const minimumOptions = {
      lockedTopMidi: hasLockedTop ? lockedTop : null,
      duplicatePitchClasses: [mod12(bass), parsed.rootPc, ...generationPitchClasses, ...optionalPitchClasses]
    };
    const upper = ensureMinimumUpperNoteCount(baseUpper, minimumOptions);
    const resolvedNotes = resolveConsecutiveSecondClusters([bass, ...upper], { lockedTopMidi: hasLockedTop ? lockedTop : null });
    const resolvedBass = resolvedNotes[0];
    const resolvedUpper = ensureMinimumUpperNoteCount(resolvedNotes.slice(1), minimumOptions);
    const notes = [resolvedBass, ...resolvedUpper].sort((a, b) => a - b);
    return {
      bass: notes[0],
      upper: notes.slice(1),
      notes,
      root: parsed.root,
      rootPc: parsed.rootPc,
      bassRoot: parsed.bass,
      bassPc: parsed.bassPc,
      suffix: parsed.suffix,
      patternName: pattern.nombre || parsed.suffix
    };
  }

  function midiNotesForChordSymbol(symbol, patterns = []) {
    return midiNotesForChordSymbolResult(symbol, patterns)?.notes || null;
  }

  function midiNotesForChordSymbolWithTop(symbol, topMidi, patterns = []) {
    return midiNotesForChordSymbolResult(symbol, patterns, { lockedTopMidi: topMidi });
  }

  window.JMLScoreMidiChords = Object.freeze({
    closedVoicingWithTop,
    closedUpperVoicingNearC4,
    generationIntervalsForPattern,
    optionalIntervalsForPattern,
    midiInfoSpellingKey,
    midiInfosAvoidingStaffCollisions,
    midiForDiatonicStep,
    midiInRangeForPitchClass,
    midiNoteInfo,
    midiNoteInfoCandidates,
    midiNoteCandidates,
    midiNotesForChordSymbol,
    midiNotesForChordSymbolWithTop,
    mod12,
    normalizeChordSymbol,
    normalizeChordSuffix,
    parseChordSymbol,
    patternForChordSuffix,
    spelledMidiInfo,
    uniqueMidiNotes
  });
})();
