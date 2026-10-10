(function () {
  "use strict";

  const Data = window.JMLMidiPianoData || {};
  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const DETECT_NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const NOTE_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const NOTE_LETTER_TO_INDEX = Object.freeze({ C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 });
  const NOTE_LETTER_TO_PC = Object.freeze({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 });
  const INTERVAL_LABELS = Object.freeze({
    0: "f",
    1: "9m",
    2: "9M",
    3: "+9/3m",
    4: "3M",
    5: "4j",
    6: "4+/5b",
    7: "5j",
    8: "5+/b6",
    9: "6/7b",
    10: "7m",
    11: "7M"
  });
  const SIMPLE_INTERVAL_LABELS = Object.freeze({
    0: "8j",
    1: "2m",
    2: "2M",
    3: "3m",
    4: "3M",
    5: "4j",
    6: "4+",
    7: "5j",
    8: "6m",
    9: "6M",
    10: "7m",
    11: "7M"
  });

  function mod12(value) {
    return ((Number(value) % 12) + 12) % 12;
  }

  function uniqueSortedNumbers(values) {
    return [...new Set((values || []).map((value) => Number(value)).filter(Number.isFinite))]
      .sort((a, b) => a - b);
  }

  function normalizeIntervals(intervals) {
    return uniqueSortedNumbers([...(intervals || []), 0].map(mod12));
  }

  function optionalIntervals(intervals) {
    return uniqueSortedNumbers((intervals || []).map(mod12));
  }

  function signatureFromLists(obligatorias = [], opcionales = []) {
    return `${normalizeIntervals(obligatorias).join(",")}|${optionalIntervals(opcionales).join(",")}`;
  }

  function normalizePattern(pattern = {}, isCustom = false) {
    return {
      nombre: String(pattern.nombre || ""),
      root_pc: Number.isFinite(Number(pattern.root_pc)) ? mod12(pattern.root_pc) : 0,
      root_name: String(pattern.root_name || "C"),
      obligatorias: normalizeIntervals(pattern.obligatorias || pattern.intervalos || []),
      opcionales: optionalIntervals(pattern.opcionales || []),
      fuente: String(pattern.fuente || (isCustom ? "aprendido" : "base")),
      is_custom: Boolean(pattern.is_custom || isCustom)
    };
  }

  function baseChordPatterns() {
    const chords = Data.chordDictionary?.chords;
    return Array.isArray(chords) ? chords.map((pattern) => normalizePattern(pattern, false)) : [];
  }

  function midiToName(note) {
    const midi = Number(note);
    const octave = Math.floor(midi / 12) - 1;
    return `${NOTE_NAMES[mod12(midi)]}${octave}`;
  }

  function isWhite(note) {
    return [0, 2, 4, 5, 7, 9, 11].includes(mod12(note));
  }

  function simpleIntervalName(interval) {
    const normalized = mod12(interval);
    if (normalized === 0) return "8j";
    return SIMPLE_INTERVAL_LABELS[normalized] || "";
  }

  function liveNoteOrIntervalLabel(notas) {
    const ordered = uniqueSortedNumbers(notas || []);
    if (ordered.length === 1) return midiToName(ordered[0]);
    if (ordered.length === 2) {
      const interval = Math.abs(ordered[1] - ordered[0]) % 12;
      if (interval === 0) return "8j";
      return SIMPLE_INTERVAL_LABELS[interval] || "";
    }
    return "";
  }

  function intervalLabelForContext(interval, presentIntervals, chordName = "") {
    const normalized = mod12(interval);
    const present = new Set([...(presentIntervals || [])].map(mod12));
    const name = String(chordName || "");

    if (normalized === 1) return "9m";
    if (normalized === 2) {
      if ([3, 4, 5].some((ivl) => present.has(ivl)) || ["9", "11", "13"].some((token) => name.includes(token))) {
        return "9M";
      }
      return "sus2";
    }
    if (normalized === 3) {
      if (name.includes("#9") || name.includes("♯9") || present.has(4)) return "9+";
      return "3m";
    }
    if (normalized === 5) {
      if (name.includes("11")) return "11j";
      return "4j";
    }
    if (normalized === 6) {
      if (name.includes("b5") || name.includes("♭5") || name.includes("º") || name.includes("ø") || present.has(3)) return "5b";
      if (name.includes("#11") || name.includes("♯11") || present.has(4)) return "11+";
      return "5b";
    }
    if (normalized === 8) {
      if (name.includes("b13") || name.includes("♭13") || [6, 7].some((ivl) => present.has(ivl))) return "13m";
      return "5+";
    }
    if (normalized === 9) {
      if (name.includes("º7") || (name.includes("º") && name.includes("7"))) return "7b";
      if (name.includes("13")) return "13";
      if (name.includes("6")) return "6";
      return "6";
    }
    return INTERVAL_LABELS[normalized] || "";
  }

  function parseRootSpelling(chordName) {
    const root = String(chordName || "").split("/")[0].trim();
    if (!root) return { letter: null, accidental: "" };
    const letter = root[0].toUpperCase();
    if (!(letter in NOTE_LETTER_TO_INDEX)) return { letter: null, accidental: "" };
    let accidental = "";
    if (root.length > 1 && ["b", "#"].includes(root[1])) {
      accidental = root[1];
      if (root.length > 2 && root[2] === root[1]) accidental += root[2];
    }
    return { letter, accidental };
  }

  function degreeOffset(degree) {
    return { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 9: 1, 11: 3, 13: 5 }[Number(degree)] ?? 0;
  }

  function degreeForInterval(interval, chordName = "") {
    const name = String(chordName || "");
    const normalized = mod12(interval);
    const isSus2 = name.includes("sus2");
    const isSus4 = name.includes("sus4");

    if (normalized === 0) return 1;
    if ([1, 2, 3].includes(normalized)) {
      if (name.includes("addb2") && normalized === 1) return 2;
      if (name.includes("#9") && normalized === 3) return 9;
      if (name.includes("b9") && normalized === 1) return 9;
      if (normalized === 2 && (name.includes("add2") || isSus2)) return 2;
      if ([1, 2].includes(normalized) && ["9", "11", "13"].some((token) => name.includes(token))) return 9;
      return 3;
    }
    if (normalized === 4) return 3;
    if ([5, 6].includes(normalized)) {
      if (isSus4 && normalized === 5) return 4;
      if (name.includes("add4") && normalized === 5) return 4;
      if (name.includes("b5") || name.includes("(b5)") || name.includes("º") || name.includes("ø")) {
        if (normalized === 6) return 5;
      }
      if (name.includes("#11") && normalized === 6) return 11;
      if (name.includes("11") && [5, 6].includes(normalized)) return 11;
      if (normalized === 5 && !isSus4) return 11;
      return isSus4 ? 4 : 5;
    }
    if (normalized === 7) return 5;
    if (normalized === 8) {
      if (name.includes("b13")) return 13;
      if (name.includes("+") || name.includes("#5")) return 5;
      return name.includes("13") ? 13 : 5;
    }
    if (normalized === 9) {
      if (name.includes("º7") || (name.includes("º") && name.includes("7"))) return 7;
      if (name.includes("13") || name.includes("b13")) return 13;
      if (name.includes("6") && !name.includes("13")) return 6;
      return 6;
    }
    if ([10, 11].includes(normalized)) return 7;
    return 1;
  }

  function accidentalOffset(accidental) {
    return { bb: -2, b: -1, "": 0, "#": 1, "##": 2 }[String(accidental || "")] ?? 0;
  }

  function noteOctave(note) {
    return Math.floor(Number(note) / 12) - 1;
  }

  function midiOfC(octave) {
    return (Number(octave) + 1) * 12;
  }

  function spelledOctave(note, letter, accidental) {
    const baseOctave = noteOctave(note);
    const basePc = (NOTE_LETTER_TO_PC[letter] || 0) + accidentalOffset(accidental);
    for (const octave of [baseOctave - 1, baseOctave, baseOctave + 1]) {
      if (midiOfC(octave) + basePc === Number(note)) return octave;
    }
    return baseOctave;
  }

  function spellNoteForInterval(rootLetter, rootPc, chordName, interval) {
    const degree = degreeForInterval(interval, chordName);
    return spellNoteForDegreeInterval(rootLetter, rootPc, degree, interval);
  }

  function spellNoteForDegreeInterval(rootLetter, rootPc, degree, interval) {
    const rootIndex = NOTE_LETTER_TO_INDEX[rootLetter];
    const letterIndex = (rootIndex + degreeOffset(degree)) % 7;
    const letter = NOTE_LETTERS[letterIndex];
    const naturalPc = NOTE_LETTER_TO_PC[letter];
    const notePc = (Number(rootPc) + mod12(interval)) % 12;
    let diff = (notePc - naturalPc + 12) % 12;
    if (diff > 6) diff -= 12;
    if (![-2, -1, 0, 1, 2].includes(diff)) return NOTE_NAMES[notePc];
    const accidental = { "-2": "bb", "-1": "b", 0: "", 1: "#", 2: "##" }[diff];
    return `${letter}${accidental}`;
  }

  function accidentalForOffset(offset) {
    return { "-2": "bb", "-1": "b", 0: "", 1: "#", 2: "##" }[String(offset)] || "";
  }

  function rootSpellingsForPitchClass(pitchClass) {
    const pc = mod12(pitchClass);
    const candidates = [];
    NOTE_LETTERS.forEach((letter) => {
      const naturalPc = NOTE_LETTER_TO_PC[letter];
      for (const offset of [-2, -1, 0, 1, 2]) {
        if (mod12(naturalPc + offset) === pc) {
          candidates.push(`${letter}${accidentalForOffset(offset)}`);
        }
      }
    });
    return candidates.length ? candidates : [DETECT_NOTE_NAMES[pc] || NOTE_NAMES[pc]];
  }

  function spellingPenalty(noteName) {
    const name = String(noteName || "");
    const accidental = name.slice(1);
    let penalty = 0;
    if (accidental === "bb" || accidental === "##") penalty += 8;
    else if (accidental === "b" || accidental === "#") penalty += 1;
    if (["B#", "E#", "Cb", "Fb"].includes(name)) penalty += 4;
    return penalty;
  }

  function bestRootNameForMatch(match) {
    const intervals = uniqueSortedNumbers(match.intervalos || match.obligatorias || []);
    let best = DETECT_NOTE_NAMES[match.root] || NOTE_NAMES[match.root];
    let bestScore = Infinity;
    rootSpellingsForPitchClass(match.root).forEach((candidate) => {
      const { letter } = parseRootSpelling(candidate);
      if (!letter) return;
      const chordName = `${candidate}${match.nombre}`;
      const spelledNotes = intervals.map((interval) => spellNoteForInterval(letter, match.root, chordName, interval));
      const score = [
        candidate,
        ...spelledNotes
      ].reduce((sum, noteName) => sum + spellingPenalty(noteName), 0);
      if (score < bestScore || (score === bestScore && candidate.length < best.length)) {
        best = candidate;
        bestScore = score;
      }
    });
    return best;
  }

  function analyzeChordAlternatives(notas, patterns = baseChordPatterns()) {
    const ordered = uniqueSortedNumbers(notas || []);
    if (ordered.length < 2) return { principal: "", alternativos: [] };

    const bassMidi = ordered[0];
    const bassPc = mod12(bassMidi);
    const pitchClasses = uniqueSortedNumbers(ordered.map(mod12));
    const matches = [];

    for (const rootPc of pitchClasses) {
      const intervalSet = new Set(ordered.map((note) => mod12(mod12(note) - rootPc)));
      intervalSet.add(0);
      for (const rawPattern of patterns) {
        const pattern = normalizePattern(rawPattern, Boolean(rawPattern.is_custom));
        const oblig = pattern.obligatorias;
        const opc = pattern.opcionales;
        if (!oblig.every((ivl) => intervalSet.has(ivl))) continue;
        const permitidas = new Set([...oblig, ...opc]);
        const extraNotas = [...intervalSet].filter((ivl) => !permitidas.has(ivl));
        if (extraNotas.length) continue;
        matches.push({
          root: rootPc,
          nombre: pattern.nombre,
          numOblig: oblig.length,
          opcionalesPresentes: opc.filter((ivl) => intervalSet.has(ivl)).length,
          esGraveFundamental: bassPc === rootPc,
          intervalos: [...intervalSet].sort((a, b) => a - b),
          obligatorias: oblig,
          opcionales: opc,
          is_custom: Boolean(pattern.is_custom),
          fuente: pattern.fuente
        });
      }
    }

    if (!matches.length) return { principal: "", alternativos: [] };

    const sortKey = (match) => [
      match.is_custom ? 0 : 1,
      match.esGraveFundamental ? 0 : 1,
      -match.numOblig,
      -match.opcionalesPresentes,
      match.nombre
    ];
    const compareMatches = (a, b) => {
      const ak = sortKey(a);
      const bk = sortKey(b);
      for (let i = 0; i < ak.length; i += 1) {
        if (ak[i] < bk[i]) return -1;
        if (ak[i] > bk[i]) return 1;
      }
      return 0;
    };
    const nameForMatch = (match) => {
      let nombre = `${bestRootNameForMatch(match)}${match.nombre}`;
      if (!match.esGraveFundamental) {
        const soloTriadaOSeptima = [...match.obligatorias, ...match.opcionales].every((ivl) => ![2, 5, 9].includes(ivl));
        if (soloTriadaOSeptima) {
          const bassInt = mod12(bassPc - match.root);
          if ([3, 4, 7, 10].includes(bassInt)) nombre += `/${DETECT_NOTE_NAMES[bassPc]}`;
        }
      }
      return nombre;
    };

    const bassMatches = matches.filter((match) => match.esGraveFundamental).sort(compareMatches);
    const orderedAll = [...matches].sort(compareMatches);
    const principalMatch = bassMatches[0] || orderedAll[0];
    const principal = nameForMatch(principalMatch);
    const alternativos = [];
    for (const match of [...bassMatches.slice(1), ...orderedAll.filter((match) => match !== principalMatch)]) {
      const nombre = nameForMatch(match);
      if (nombre !== principal && !alternativos.includes(nombre)) alternativos.push(nombre);
      if (alternativos.length >= 4) break;
    }

    return {
      principal,
      alternativos,
      principal_match: principalMatch,
      bass_pc: bassPc
    };
  }

  function parseNoteLabels(text) {
    const tokens = String(text || "").replace(/,/g, " ").split(/\s+/).map((token) => token.trim()).filter(Boolean);
    if (!tokens.length) return null;
    const parsed = {};
    for (const token of tokens) {
      const letter = token[0]?.toUpperCase();
      if (!(letter in NOTE_LETTER_TO_PC)) return null;
      const accidental = token.slice(1).replace(/♯/g, "#").replace(/♭/g, "b");
      if ([...accidental].some((char) => !["b", "#"].includes(char))) return null;
      if (accidental.length > 2) return null;
      const pc = mod12(NOTE_LETTER_TO_PC[letter] + accidentalOffset(accidental));
      if (Object.prototype.hasOwnProperty.call(parsed, pc)) return null;
      parsed[pc] = `${letter}${accidental}`;
    }
    return parsed;
  }

  function findMinorNinthWarnings(notes, chordInfo = null) {
    const ordered = uniqueSortedNumbers(notes || []);
    const principalMatch = chordInfo?.principal_match;
    if (principalMatch && typeof principalMatch === "object" && principalMatch.root != null) {
      const rootPc = mod12(principalMatch.root);
      const intervals = new Set(ordered.map((note) => mod12(mod12(note) - rootPc)));
      if (intervals.has(4) && intervals.has(10)) return new Set();
    }
    const warnings = new Set();
    for (let i = 0; i < ordered.length; i += 1) {
      for (let j = i + 1; j < ordered.length; j += 1) {
        const distance = Math.abs(ordered[i] - ordered[j]);
        if (distance >= 13 && distance % 12 === 1) {
          warnings.add(ordered[i]);
          warnings.add(ordered[j]);
        }
      }
    }
    return warnings;
  }

  class ChordRecognitionEngine {
    constructor(options = {}) {
      this.basePatterns = (options.patterns || baseChordPatterns()).map((pattern) => normalizePattern(pattern, false));
      this.customChords = [];
      this.additionalBaseChords = [];
      this.additionalBaseSignatures = new Set();
      this.customChordSpellings = new Map();
      this.customChordQualitySpellings = new Map();
      this.jazzscopeChords = { ...(Data.jazzscopeChords || {}), ...(options.jazzscopeChords || {}) };
    }

    get patterns() {
      return [...this.basePatterns, ...this.customChords];
    }

    patternSignature(pattern) {
      return signatureFromLists(pattern?.obligatorias || [], pattern?.opcionales || []);
    }

    findPatternBySignature(signature, includeCustom = true) {
      return this.patterns.find((pattern) => {
        if (!includeCustom && pattern.is_custom) return false;
        return this.patternSignature(pattern) === signature;
      }) || null;
    }

    rememberAdditionalBase(name, obligatorias, opcionales = []) {
      const signature = signatureFromLists(obligatorias, opcionales);
      const payload = normalizePattern({ nombre: name, obligatorias, opcionales }, false);
      if (this.additionalBaseSignatures.has(signature)) {
        const existing = this.additionalBaseChords.find((pattern) => this.patternSignature(pattern) === signature);
        if (existing) Object.assign(existing, payload);
      } else {
        this.additionalBaseSignatures.add(signature);
        this.additionalBaseChords.push(payload);
      }
    }

    addBaseChord(name, obligatorias, opcionales = [], options = {}) {
      const pattern = normalizePattern({ nombre: name, obligatorias, opcionales }, false);
      const signature = this.patternSignature(pattern);
      const existing = this.basePatterns.find((candidate) => this.patternSignature(candidate) === signature);
      if (existing) {
        if (options.allowOverwrite) Object.assign(existing, pattern);
        if (options.recordExtra) this.rememberAdditionalBase(name, pattern.obligatorias, pattern.opcionales);
        return existing;
      }
      this.basePatterns.push(pattern);
      if (options.recordExtra) this.rememberAdditionalBase(name, pattern.obligatorias, pattern.opcionales);
      return pattern;
    }

    importDictionary(payload, options = {}) {
      const chords = Array.isArray(payload?.chords) ? payload.chords : [];
      let added = 0;
      for (const chord of chords) {
        if (!chord || typeof chord !== "object") continue;
        const oblig = chord.obligatorias || [];
        if (!Array.isArray(oblig) || !oblig.length) continue;
        this.addBaseChord(chord.nombre || "", oblig, chord.opcionales || [], options);
        added += 1;
      }
      return added;
    }

    exportDictionary() {
      return {
        chords: this.patterns.map((pattern) => ({
          nombre: pattern.nombre,
          root_pc: 0,
          root_name: DETECT_NOTE_NAMES[0],
          obligatorias: [...pattern.obligatorias],
          opcionales: [...pattern.opcionales],
          fuente: pattern.is_custom ? "aprendido" : "base"
        }))
      };
    }

    analyze(notes) {
      return analyzeChordAlternatives(notes, this.patterns);
    }

    registerCustomChord(name, intervals) {
      const pattern = normalizePattern({ nombre: name, obligatorias: intervals, opcionales: [] }, true);
      const signature = this.patternSignature(pattern);
      const existing = this.customChords.find((candidate) => this.patternSignature(candidate) === signature);
      if (existing) {
        Object.assign(existing, pattern);
        return existing;
      }
      this.customChords.push(pattern);
      return pattern;
    }

    deleteCustomChord(index) {
      if (index < 0 || index >= this.customChords.length) return null;
      return this.customChords.splice(index, 1)[0] || null;
    }

    moveCustomToBase(index) {
      if (index < 0 || index >= this.customChords.length) return null;
      const pattern = this.customChords.splice(index, 1)[0];
      pattern.is_custom = false;
      pattern.fuente = "base";
      this.addBaseChord(pattern.nombre, pattern.obligatorias, pattern.opcionales, { allowOverwrite: true, recordExtra: true });
      return pattern;
    }

    parseNoteLabels(text) {
      return parseNoteLabels(text);
    }

    setCustomChordSpellingForNotes(notes, labelsText) {
      const parsed = parseNoteLabels(labelsText);
      if (!parsed) return false;
      const signature = uniqueSortedNumbers((notes || []).map((note) => mod12(note)));
      const parsedSignature = uniqueSortedNumbers(Object.keys(parsed).map(Number));
      if (signature.join(",") !== parsedSignature.join(",")) return false;
      this.customChordSpellings.set(signature.join(","), parsed);
      return true;
    }

    setCustomQualitySpellings(quality, intervalMap) {
      const normalized = new Map();
      Object.entries(intervalMap || {}).forEach(([interval, data]) => {
        if (Number.isFinite(Number(interval)) && Number.isFinite(Number(data?.degree))) {
          normalized.set(mod12(interval), {
            degree: Number(data.degree),
            accidental: String(data.accidental || "")
          });
        }
      });
      if (normalized.size) this.customChordQualitySpellings.set(String(quality), normalized);
    }

    customSpellingForNotes(notes, chordInfo = null) {
      const normalizedNotes = uniqueSortedNumbers(notes || []);
      if (!normalizedNotes.length) return null;
      const info = chordInfo || this.analyze(normalizedNotes);
      const principalMatch = info?.principal_match;
      const quality = principalMatch?.nombre;
      if (quality) {
        const { letter: rootLetter } = parseRootSpelling(info?.principal || "");
        const rootPc = principalMatch?.root;
        const intervalSpellings = this.customChordQualitySpellings.get(String(quality));
        if (rootLetter != null && rootPc != null && intervalSpellings) {
          const spellings = {};
          for (const note of normalizedNotes) {
            const interval = mod12(note - rootPc);
            const custom = intervalSpellings.get(interval);
            spellings[mod12(note)] = custom
              ? spellNoteForDegreeInterval(rootLetter, rootPc, Number(custom.degree || 1), interval)
              : spellNoteForInterval(rootLetter, rootPc, String(quality), interval);
          }
          if (Object.keys(spellings).length) return spellings;
        }
      }
      const signature = uniqueSortedNumbers(normalizedNotes.map(mod12)).join(",");
      return this.customChordSpellings.get(signature) || null;
    }

    intervalLabelsForNotes(notes, chordInfo = null) {
      const normalizedNotes = uniqueSortedNumbers(notes || []);
      const info = chordInfo || this.analyze(normalizedNotes);
      const principalMatch = info?.principal_match;
      const rootPc = principalMatch?.root;
      if (rootPc == null) return {};
      const rootCandidates = normalizedNotes.filter((note) => mod12(note) === mod12(rootPc));
      if (!rootCandidates.length) return {};
      const rootNote = rootCandidates[0];
      const chordName = String(principalMatch.nombre || "");
      const presentIntervals = new Set(normalizedNotes.map((note) => mod12(note - rootNote)));
      const labels = {};
      for (const note of normalizedNotes) {
        const interval = mod12(note - rootNote);
        const label = intervalLabelForContext(interval, presentIntervals, chordName);
        if (label) labels[note] = label;
      }
      return labels;
    }

    findMinorNinthWarnings(notes, chordInfo = null) {
      return findMinorNinthWarnings(notes, chordInfo || this.analyze(notes));
    }

    midiLearnSummary(notes) {
      const ordered = uniqueSortedNumbers(notes || []);
      if (ordered.length < 2) return null;
      const rootNote = ordered[0];
      const intervals = ordered.map((note) => mod12(note - rootNote));
      return {
        notes: ordered,
        noteNames: ordered.map(midiToName),
        rootNote,
        rootName: midiToName(rootNote),
        intervals,
        intervalNames: intervals.map((interval) => interval === 0 ? "fundamental" : simpleIntervalName(interval))
      };
    }
  }

  window.JMLMidiRecognition = {
    NOTE_NAMES,
    DETECT_NOTE_NAMES,
    NOTE_LETTERS,
    NOTE_LETTER_TO_INDEX,
    NOTE_LETTER_TO_PC,
    INTERVAL_LABELS,
    SIMPLE_INTERVAL_LABELS,
    baseChordPatterns,
    normalizeIntervals,
    optionalIntervals,
    signatureFromLists,
    analyzeChordAlternatives,
    midiToName,
    isWhite,
    liveNoteOrIntervalLabel,
    simpleIntervalName,
    intervalLabelForContext,
    parseRootSpelling,
    degreeForInterval,
    spellNoteForInterval,
    spellNoteForDegreeInterval,
    spelledOctave,
    parseNoteLabels,
    findMinorNinthWarnings,
    ChordRecognitionEngine,
    createEngine: (options) => new ChordRecognitionEngine(options)
  };
}());
