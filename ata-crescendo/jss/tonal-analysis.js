(function (global) {
  const NOTE_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const BASE_DEGREES = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const MAJOR_DEGREE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
  const MINOR_DEGREE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
  let USER_EXAMPLES = [];

  const NOTE_TO_CHROMA = {
    C: 0, "B#": 0,
    "C#": 1, Db: 1,
    D: 2,
    "D#": 3, Eb: 3,
    E: 4, Fb: 4,
    "E#": 5, F: 5,
    "F#": 6, Gb: 6,
    G: 7,
    "G#": 8, Ab: 8,
    A: 9,
    "A#": 10, Bb: 10,
    B: 11, Cb: 11
  };

  const KEYS = [
    ["C", ["C", "D", "E", "F", "G", "A", "B"]],
    ["Db", ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"]],
    ["D", ["D", "E", "F#", "G", "A", "B", "C#"]],
    ["Eb", ["Eb", "F", "G", "Ab", "Bb", "C", "D"]],
    ["E", ["E", "F#", "G#", "A", "B", "C#", "D#"]],
    ["F", ["F", "G", "A", "Bb", "C", "D", "E"]],
    ["F#", ["F#", "G#", "A#", "B", "C#", "D#", "E#"]],
    ["Gb", ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"]],
    ["G", ["G", "A", "B", "C", "D", "E", "F#"]],
    ["Ab", ["Ab", "Bb", "C", "Db", "Eb", "F", "G"]],
    ["A", ["A", "B", "C#", "D", "E", "F#", "G#"]],
    ["Bb", ["Bb", "C", "D", "Eb", "F", "G", "A"]],
    ["B", ["B", "C#", "D#", "E", "F#", "G#", "A#"]]
  ];

  const SCALE_TYPES = [
    {
      id: "major",
      label: "mayor",
      priority: 0,
      intervals: [0, 2, 4, 5, 7, 9, 11],
      degrees: ["I", "II", "III", "IV", "V", "VI", "VII"],
      modes: ["Jónico", "Dórico", "Frigio", "Lidio", "Mixolidio", "Eólico", "Locrio"],
      suffixes: [
        ["", "6", "maj7", "maj9", "maj13", "∆", "∆9", "∆13", "+", "sus4", "6sus4"],
        ["m", "m6", "m69", "m7", "m9", "m11", "-", "-6", "-69", "-7", "-9", "-11", "7sus4", "9sus4"],
        ["m", "m7", "m11", "-", "-7", "-11", "7sus4"],
        ["", "6", "maj7", "maj9", "maj13", "∆", "∆9", "∆13", "sus2", "6sus2"],
        ["", "sus4", "7", "7sus4", "9", "9sus4", "13", "13sus4"],
        ["m", "m7", "m9", "m11", "-", "-7", "-9", "-11", "7sus4", "9sus4"],
        ["m7b5", "ø", "ø11"]
      ]
    },
    {
      id: "harmonicMinor",
      label: "menor armónica",
      priority: 1,
      intervals: [0, 2, 3, 5, 7, 8, 11],
      degrees: ["I", "II", "III", "IV", "V", "VI", "#VII"],
      modes: ["Eólico #7", "Locrio #6", "Jónico aumentado", "Dórico #4", "Mixo b2b6", "Lidio #2", "Locrio b4b7"],
      suffixes: [
        ["m", "m7", "m9", "m11", "mmaj7", "mmaj9", "mmaj11", "mmaj13", "m∆", "m∆9", "m∆11", "-", "-7", "-9", "-11", "sus4", "sus4add2"],
        ["m7b5", "ø", "ø11", "øb13"],
        ["+", "+maj7", "+maj9", "+∆", "+∆9"],
        ["m", "m7", "m9", "m11", "-", "-7", "-9", "-11"],
        ["", "7", "7b9", "7#9", "7b9b13", "+7", "+7b9", "+7#9", "sus4addb2", "7sus4b9"],
        ["", "maj7", "maj9", "maj7#11", "∆", "∆9", "sus4", "6sus4"],
        ["dim", "dim7", "º7", "o7"]
      ]
    },
    {
      id: "melodicMinor",
      label: "menor melódica",
      priority: 2,
      intervals: [0, 2, 3, 5, 7, 9, 11],
      degrees: ["I", "II", "III", "IV", "V", "#VI", "#VII"],
      modes: ["Dórico #7", "Dórico b2", "Lidio aumentado", "Lidio dominante", "Mixolidio b6", "Locrio #2", "Mixo alterado"],
      suffixes: [
        ["m", "m6", "m69", "m7", "m9", "m11", "mmaj7", "mmaj9", "m∆", "m∆9", "-", "-6", "-69", "-7", "-9", "-11", "sus4", "sus4addb2"],
        ["m", "m7", "m11", "-", "-7", "-11", "sus4", "7sus4", "sus4b9", "sus4addb2", "7sus4b9"],
        ["+", "+maj7", "+maj9", "+∆", "+∆9", "maj7b5", "∆b5"],
        ["", "7", "9", "13", "7b5", "7#11", "9#11", "13#11"],
        ["", "7", "9", "9b13", "7b13", "7sus4", "9sus4b13"],
        ["m7b5", "ø", "ø9", "ø11", "øb13"],
        ["+7", "7alt", "7b5", "7#5", "7b9", "7#9", "7b9#11", "7#9#11", "7b9b13", "7#9b13"]
      ]
    },
    {
      id: "harmonicMajor",
      label: "mayor armónica",
      priority: 3,
      intervals: [0, 2, 4, 5, 7, 8, 11],
      degrees: ["I", "II", "III", "IV", "V", "bVI", "VII"],
      modes: ["Jónico b6", "Locrio #2#6", "Mixo b2#2b6 no 4", "Dórico #4#7", "Mixolidio b2", "Lidio aumentado #2", "Locrio b7"],
      suffixes: [
        ["+maj7", "+maj9", "+∆", "+∆9", "maj7#5", "∆#5"],
        ["m7b5", "ø", "ø9", "ø11"],
        ["7", "7#9", "7#9b13"],
        ["m", "mmaj7", "mmaj9", "m∆", "m∆9", "m6", "-", "-6"],
        ["", "7", "7sus4", "9", "9sus4", "13", "13sus4", "7b9", "13b9", "sus4addb2", "7sus4b9"],
        ["+", "+maj7", "+maj7#9", "+∆", "+∆#9", "+7"],
        ["dim", "dim7", "º7", "o7"]
      ]
    }
  ];

  function normalizeSuffix(suffix) {
    const normalized = String(suffix || "")
      .trim()
      .replace(/Δ/g, "∆")
      .replace(/[−–]/g, "-")
      .replace(/maj/gi, "maj")
      .replace(/ma7/gi, "maj7")
      .replace(/M7/g, "maj7")
      .replace(/-/g, "m")
      .replace(/^min(?=∆|maj|6|7|9|11|13|\(|$)/i, "m")
      .replace(/^mi(?=∆|maj|6|7|9|11|13|\(|$)/i, "m")
      .replace(/m7\(b5\)/gi, "m7b5")
      .replace(/ø/g, "m7b5")
      .replace(/°/g, "dim")
      .replace(/º/g, "dim")
      .replace(/o7/g, "dim7")
      .replace(/aug|aum|au/gi, "+")
      .replace(/sus(?![24])/gi, "sus4")
      .replace(/[()]/g, "")
      .replace(/\s+/g, "");

    if (normalized === "#5") return "+";
    if (normalized === "79") return "9";
    if (normalized === "mmaj79") return "mmaj9";
    if (normalized === "m∆79") return "m∆9";
    if (normalized === "913" || normalized === "139") return "13";
    return normalized;
  }

  function displaySuffix(suffix) {
    const raw = String(suffix || "").trim();
    if (/ø/.test(raw)) return `ø${raw.replace(/^.*?ø/, "").replace(/[()]/g, "")}`;
    if (/°|º/.test(raw)) return normalizeSuffix(suffix) === "dim7" ? "°7" : "°";
    const normalized = normalizeSuffix(suffix);
    if (normalized === "dim") return "°";
    if (normalized === "dim7") return "°7";
    if (normalized.startsWith("maj")) return normalized;
    if (normalized === "m7b5") return "-7b5";
    if (normalized === "m7b59") return "-7b5(9)";
    if (normalized === "m7b511") return "-7b5(11)";
    if (normalized === "mmaj7") return "m∆";
    if (normalized.startsWith("mmaj")) return normalized.replace(/^mmaj/, "m∆");
    if (normalized.startsWith("m∆")) return normalized;
    if (normalized === "m69") return "-6(9)";
    if (normalized === "m" || /^m(?:6|7|9|11|13)/.test(normalized)) {
      return normalized.replace(/^m/, "-");
    }
    if (normalized === "7b5") return "7(b5)";
    if (normalized === "7b9b13") return "7(b9)b13";
    if (normalized === "7#9b13") return "7(#9)b13";
    if (normalized === "7sus4b9") return "7sus4(b9)";
    if (normalized === "sus4add2") return "sus4(add2)";
    if (normalized === "sus4addb2") return "sus4(addb2)";
    if (normalized === "9sus4b13") return "9sus4(b13)";
    if (normalized === "9b5") return "9(b5)";
    if (normalized === "9b13") return "9(b13)";
    if (normalized === "13b9") return "13(b9)";
    if (normalized === "∆b5") return "∆(b5)";
    return normalized;
  }

  function parseChord(chord) {
    const cleaned = String(chord || "").trim();
    const [symbolPart, bassPart] = cleaned.split("/");
    const match = symbolPart.match(/^([A-G])(#5)$/i) || symbolPart.match(/^([A-G](?:bb|##|b|#)?)(.*)$/i);
    if (!match) return null;

    let root = match[1][0].toUpperCase() + match[1].slice(1);
    root = root.replace("##", "x");
    const chroma = NOTE_TO_CHROMA[root.replace("x", "##")];
    if (chroma === undefined) return null;

    const bass = bassPart
      ? bassPart.trim().match(/^([A-G](?:bb|##|b|#)?)/i)?.[1]
      : "";
    const normalizedBass = bass ? bass[0].toUpperCase() + bass.slice(1) : "";

    return {
      input: cleaned,
      root,
      chroma,
      bass: normalizedBass,
      bassChroma: normalizedBass ? NOTE_TO_CHROMA[normalizedBass.replace("##", "x").replace("x", "##")] : undefined,
      suffix: normalizeSuffix(match[2]),
      displaySuffix: displaySuffix(match[2])
    };
  }

  function exampleChordKey(chord) {
    const parsed = parseChord(chord);
    if (!parsed) {
      return String(chord || "")
        .trim()
        .replace(/\s+/g, "")
        .toLowerCase();
    }
    const bass = parsed.bass ? `/${parsed.bass}` : "";
    return `${parsed.root}${parsed.suffix}${bass}`.toLowerCase();
  }

  function normalizeUserExample(example) {
    if (!example || !Array.isArray(example.chords) || !Array.isArray(example.results)) return null;
    const chords = example.chords.map(exampleChordKey).filter(Boolean);
    if (!chords.length || chords.length !== example.results.length) return null;
    return {
      id: String(example.id || example.name || `ejemplo-${USER_EXAMPLES.length + 1}`),
      name: String(example.name || "Ejemplo administrativo"),
      title: String(example.title || ""),
      chords,
      results: example.results.map(result => ({
        degree: String(result?.degree || ""),
        mode: String(result?.mode || ""),
        key: String(result?.key || ""),
        scaleType: String(result?.scaleType || "")
      }))
    };
  }

  function setUserExamples(examples) {
    USER_EXAMPLES = (Array.isArray(examples) ? examples : [])
      .map(normalizeUserExample)
      .filter(Boolean);
  }

  function getUserExamples() {
    return USER_EXAMPLES.map(example => ({ ...example, results: example.results.map(result => ({ ...result })) }));
  }

  function suffixAccepted(candidateSuffixes, suffix) {
    const normalizedSet = candidateSuffixes.map(normalizeSuffix);
    if (normalizedSet.includes(suffix)) return true;
    if (!suffix && normalizedSet.includes("")) return true;
    if (suffix === "maj7" && normalizedSet.includes("∆")) return true;
    if (suffix === "m7b5" && normalizedSet.includes("ø")) return true;
    if (suffix.startsWith("7") && normalizedSet.includes("7alt") && /b9|#9|b13|#5|b5/.test(suffix)) return true;
    return false;
  }

  function scaleNotesFor(keyNotes, type) {
    const rootChroma = NOTE_TO_CHROMA[keyNotes[0]];
    return type.intervals.map(interval => (rootChroma + interval) % 12);
  }

  function candidatesForChord(chord) {
    const parsed = parseChord(chord);
    if (!parsed) return [];

    const candidates = [];
    SCALE_TYPES.forEach(type => {
      KEYS.forEach(([key, keyNotes]) => {
        const chromas = scaleNotesFor(keyNotes, type);
        chromas.forEach((chroma, index) => {
          if (chroma !== parsed.chroma) return;
          if (!suffixAccepted(type.suffixes[index], parsed.suffix)) return;

          candidates.push({
            key,
            scaleType: type.id,
            scaleLabel: type.label,
            scalePriority: type.priority,
            degreeIndex: index,
            degree: `${type.degrees[index]}${parsed.displaySuffix}`,
            mode: type.modes[index],
            chord: parsed.input
          });
        });
      });
    });

    addMajorModalInterchangeCandidates(parsed, candidates);

    return candidates.sort(compareCandidates);
  }

  function minorAppliedDominantTargetInfo(parsed, key) {
    if (!parsed || !key) return null;
    const root = keyChroma(key);
    if (root === undefined) return null;

    const targetChroma = mod12(parsed.chroma + 5);
    const targets = [
      { degree: "IV", interval: 5, minorTarget: true },
      { degree: "V", interval: 7, minorTarget: false }
    ];
    const target = targets.find(item => mod12(root + item.interval) === targetChroma);
    if (!target) return null;

    const targetKey = keyNameForChromaPreference(targetChroma, [parsed.root, key]);
    const targetParsed = {
      chroma: targetChroma,
      root: targetKey,
      suffix: target.minorTarget ? "m7" : "7"
    };
    return {
      ...target,
      targetKey,
      targetParsed,
      originScaleType: target.minorTarget ? "harmonicMinor" : "harmonicMajor"
    };
  }

  function addMajorModalInterchangeCandidates(parsed, candidates) {
    KEYS.forEach(([key, keyNotes]) => {
      const keyRoot = NOTE_TO_CHROMA[keyNotes[0]];
      const degreeMap = [
        { interval: 3, degree: "bIII", mode: "Mixolidio", suffixes: ["7", "9", "13"] },
        { interval: 8, degree: "bVI", mode: "Lidio", suffixes: ["maj7", "∆", "maj9", "∆9"] },
        { interval: 10, degree: "bVII", mode: "Mixolidio", suffixes: ["7", "9", "13", "7sus4", "9sus4", "13sus4"] }
      ];

      degreeMap.forEach(item => {
        if ((keyRoot + item.interval) % 12 !== parsed.chroma) return;
        if (!suffixAccepted(item.suffixes, parsed.suffix)) return;

        candidates.push({
          key,
          scaleType: "major",
          scaleLabel: "mayor",
          scalePriority: 0,
          degreeIndex: 10 + item.interval,
          degree: `${item.degree}${parsed.displaySuffix}`,
          mode: item.mode,
          chord: parsed.input,
          source: "intercambio modal"
        });
      });
    });
  }

  function compareCandidates(a, b) {
    if (a.scalePriority !== b.scalePriority) return a.scalePriority - b.scalePriority;
    if (a.degreeIndex !== b.degreeIndex) return a.degreeIndex - b.degreeIndex;
    return a.key.localeCompare(b.key);
  }

  function scaleKey(candidate) {
    return `${candidate.key}|${candidate.scaleType}`;
  }

  function findBestContiguousGroup(items, startIndex) {
    let common = new Map();
    items[startIndex].candidates.forEach(candidate => {
      common.set(scaleKey(candidate), candidate);
    });

    let bestEnd = startIndex;
    let bestCommon = new Map(common);

    for (let index = startIndex + 1; index < items.length; index++) {
      const nextKeys = new Set(items[index].candidates.map(scaleKey));

      for (const key of Array.from(common.keys())) {
        if (!nextKeys.has(key)) common.delete(key);
      }

      if (!common.size) break;

      bestEnd = index;
      bestCommon = new Map(common);
    }

    const selectedScale = chooseBestScaleForGroup(Array.from(bestCommon.values()), items, startIndex, bestEnd);
    return { end: bestEnd, selectedScale };
  }

  function chooseBestScaleForGroup(scaleCandidates, items, startIndex, endIndex) {
    return scaleCandidates
      .map(candidate => ({
        candidate,
        score: scoreScaleForGroup(candidate, items, startIndex, endIndex)
      }))
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return compareCandidates(a.candidate, b.candidate);
      })[0]?.candidate || null;
  }

  function preferStandaloneFlatNineDominant(parsedItems, results) {
    if (parsedItems.length !== 1) return results;
    const item = parsedItems[0];
    const parsedChord = item?.parsed;
    if (!isDominantChord(parsedChord)) return results;
    const suffix = parsedChord.suffix || "";
    if (!/b9/.test(suffix) || /b9b13|alt|#9|#5|b5|#11|13b9/.test(suffix)) return results;

    const harmonicMajor = item.candidates.find(candidate =>
      candidate.scaleType === "harmonicMajor" &&
      /^V/.test(candidate.degree || "")
    );
    return harmonicMajor ? [{ ...harmonicMajor }] : results;
  }

  function scoreScaleForGroup(scaleCandidate, items, startIndex, endIndex) {
    let score = 0;

    for (let index = startIndex; index <= endIndex; index++) {
      const candidate = items[index].candidates.find(item => scaleKey(item) === scaleKey(scaleCandidate));
      if (!candidate) continue;

      if (index === endIndex && /^I(?!I|V)/.test(candidate.degree)) score += 100;
      if (/^V7/.test(candidate.degree)) score += 20;
      if (/^II.*\/|^V.*\//.test(candidate.degree)) score += 10;
      if (candidate.source === "intercambio modal") score -= 2;
    }

    score -= scaleCandidate.scalePriority;
    return score;
  }

  function sectionLabel(candidate) {
    if (!candidate) return "";
    if (candidate.scaleType === "major") return `${candidate.key}:[`;
    if (candidate.scaleType === "harmonicMinor") return `${candidate.key}m:[`;
    if (candidate.scaleType === "melodicMinor") return `${candidate.key}m:[`;
    if (candidate.scaleType === "harmonicMajor") return `${candidate.key}:[`;
    return /menor|minor|m\./i.test(candidate.scaleLabel || "") ? `${candidate.key}m:[` : `${candidate.key}:[`;
  }

  function visibleSectionScaleType(scaleType) {
    if (scaleType === "harmonicMajor") return "major";
    if (scaleType === "harmonicMinor" || scaleType === "melodicMinor" || scaleType === "naturalMinor") return "minor";
    return scaleType || "";
  }

  function visibleSectionKey(result) {
    if (!result?.key || !result.scaleType) return "";
    return `${result.key}:${visibleSectionScaleType(result.scaleType)}`;
  }

  function mod12(value) {
    return ((value % 12) + 12) % 12;
  }

  function keyChroma(key) {
    return NOTE_TO_CHROMA[key];
  }

  function keyNameForChroma(chroma) {
    const found = KEYS.find(([key]) => NOTE_TO_CHROMA[key] === mod12(chroma));
    return found ? found[0] : "";
  }

  function keyNameForChromaPreference(chroma, sourceRoots = []) {
    const matches = KEYS
      .map(([key]) => key)
      .filter(key => NOTE_TO_CHROMA[key] === mod12(chroma));
    if (!matches.length) return "";

    const sourceText = sourceRoots.join(" ");
    if (/b/.test(sourceText)) {
      return matches.find(key => key.includes("b")) || matches[0];
    }
    if (/#|x/.test(sourceText)) {
      return matches.find(key => key.includes("#")) || matches[0];
    }
    return matches.find(key => !/[b#]/.test(key)) || matches[0];
  }

  function degreeBase(degree) {
    const match = String(degree || "").match(/^((?:bb|##|b|#)?(?:VII|VI|IV|III|II|V|I))/);
    return match ? match[1] : "";
  }

  function naturalDegreeBase(degree) {
    return degreeBase(degree).replace(/^(?:bb|##|b|#)/, "");
  }

  function alterationPrefixForOffset(offset) {
    const normalized = mod12(offset);
    if (normalized === 0) return "";
    if (normalized === 1) return "#";
    if (normalized === 2) return "##";
    if (normalized === 11) return "b";
    if (normalized === 10) return "bb";
    return "";
  }

  function chromaticScaleDegreeFor(parsedChord, key, intervals) {
    if (!parsedChord || !key || keyChroma(key) === undefined) return "";
    const keyLetterIndex = NOTE_LETTERS.indexOf(String(key)[0]?.toUpperCase());
    const rootLetterIndex = NOTE_LETTERS.indexOf(String(parsedChord.root || "")[0]?.toUpperCase());
    if (keyLetterIndex < 0 || rootLetterIndex < 0) return "";

    const degreeIndex = ((rootLetterIndex - keyLetterIndex) % 7 + 7) % 7;
    const expectedChroma = mod12(keyChroma(key) + intervals[degreeIndex]);
    const prefix = alterationPrefixForOffset(parsedChord.chroma - expectedChroma);
    return `${prefix}${BASE_DEGREES[degreeIndex]}`;
  }

  function majorChromaticScaleDegreeFor(parsedChord, key) {
    return chromaticScaleDegreeFor(parsedChord, key, MAJOR_DEGREE_INTERVALS);
  }

  function minorScaleDegreeFor(parsedChord, key) {
    return chromaticScaleDegreeFor(parsedChord, key, MINOR_DEGREE_INTERVALS);
  }

  function isDominantChord(parsedChord) {
    if (!parsedChord) return false;
    return /^7|^9|^13|\+7/.test(parsedChord.suffix);
  }

  function isSuspendedDominantChord(parsedChord) {
    return /^7sus4|^9sus4|^13sus4/.test(parsedChord?.suffix || "");
  }

  function isHalfDiminishedChord(parsedChord) {
    return /^m7b5/.test(parsedChord?.suffix || "");
  }

  function isMinorChord(parsedChord) {
    return parsedChord?.suffix === "m" || /^m(?:6|7|9|11|13|∆)/.test(parsedChord?.suffix || "");
  }

  function isMinorSeventhChord(parsedChord) {
    return /^m(?:7|9|11|13)/.test(parsedChord?.suffix || "");
  }

  function isMajorChord(parsedChord) {
    if (!parsedChord) return false;
    return parsedChord.suffix === "" ||
      parsedChord.suffix === "6" ||
      parsedChord.suffix.startsWith("maj") ||
      parsedChord.suffix.startsWith("∆");
  }

  function isAugmentedChord(parsedChord) {
    return parsedChord?.suffix === "+";
  }

  function isAugmentedMajorChord(parsedChord) {
    return isAugmentedChord(parsedChord) || /^(?:\+maj|\+∆|maj7#5|∆#5)/.test(parsedChord?.suffix || "");
  }

  function isDiminishedChord(parsedChord) {
    return parsedChord?.suffix === "dim" || parsedChord?.suffix === "dim7";
  }

  function isDominantResolvingToMinor(parsedChord, nextParsedChord) {
    return !!(
      parsedChord &&
      nextParsedChord &&
      isMinorChord(nextParsedChord) &&
      !isHalfDiminishedChord(nextParsedChord) &&
      mod12(nextParsedChord.chroma - parsedChord.chroma) === 5
    );
  }

  function modeForDominantQuality(parsedChord, currentMode, degree = "", nextParsedChord = null) {
    const suffix = parsedChord?.suffix || "";
    const isSubContext = /sub|bck\.dr/.test(degree || "") || /^bVII/.test(degree || "");

    if (isSuspendedDominantChord(parsedChord)) {
      if (currentMode) return currentMode;
      if (/b9/.test(suffix)) return "Mixolidio b2";
      if (/b13/.test(suffix)) return "Mixolidio b6";
      return "Mixolidio";
    }

    if (/alt/.test(suffix)) return "Mixo alterado";
    if (/#11|b5/.test(suffix)) return "Lidio dominante";
    if (/b9(?:b13|#5)/.test(suffix)) return "Mixo b2b6";
    if (/13b9/.test(suffix)) return "Mixolidio b2";
    if (/#9b13/.test(suffix)) {
      return currentMode === "Mixo b2#2b6 no 4" ? currentMode : "Mixo alterado";
    }
    if (isDominantResolvingToMinor(parsedChord, nextParsedChord)) return "Mixo b2b6";
    if (/(?:7|9)b13/.test(suffix)) return "Mixolidio b6";
    if (/#5/.test(suffix)) return "Mixo alterado";
    if (/b9/.test(suffix) && /^(?:Mixo b2b6|Mixolidio b2)$/.test(currentMode || "")) return currentMode;
    if (/b9/.test(suffix)) return "Mixolidio b2";
    if (/#9/.test(suffix)) {
      return currentMode === "Mixo b2#2b6 no 4" ? currentMode : "Mixo alterado";
    }
    if (isSubContext && /^(?:7|9|13)/.test(suffix)) return "Lidio dominante";
    if (currentMode && currentMode !== "Mixolidio" && !isSubContext) return currentMode;

    return currentMode || "Mixolidio";
  }

  function modeForHarmonicMinorDominant(parsedChord, degree = "") {
    const suffix = parsedChord?.suffix || "";
    if (/b9/.test(suffix) && !/13b9/.test(suffix)) return "Mixo b2b6";
    return modeForDominantQuality(parsedChord, "Mixo b2b6", degree, null);
  }

  function modeForDiminishedDegree(result) {
    const degree = String(result?.degree || "");
    if (/^#VII/.test(degree) || result?.originScaleType === "harmonicMinor") return "Locrio b4b7";
    if (/^VII/.test(degree) || result?.originScaleType === "harmonicMajor") return "Locrio b7";
    if (/^(?:bII|#IV)/.test(degree)) return "Disminuida WH";
    return result?.mode || "Disminuida WH";
  }

  function modeForChordQuality(parsedChord, result, nextParsedChord = null) {
    if (!parsedChord || !result) return result?.mode || "";
    const suffix = parsedChord.suffix || "";
    const degree = result.degree || "";
    const degreeMode = modeForPlainMajorDegree(parsedChord, result);
    if (degreeMode) return degreeMode;

    if (isDiminishedChord(parsedChord)) return modeForDiminishedDegree(result);

    if (result.source === "majorMinorTwoFive") {
      if (isDominantChord(parsedChord) || isSuspendedDominantChord(parsedChord)) {
        return modeForDominantQuality(parsedChord, result.mode, degree, null);
      }
      return result.mode || "";
    }

    if (result.source === "dominante secundaria menor") {
      return result.mode || "";
    }

    if (result.scaleType && !result.source) {
      if (isDominantChord(parsedChord) || isSuspendedDominantChord(parsedChord)) {
        return modeForDominantQuality(parsedChord, result.mode, degree, nextParsedChord);
      }
      if (
        result.scaleType === "harmonicMinor" &&
        /^I(?!I|V)/.test(degreeBase(degree)) &&
        isMinorChord(parsedChord) &&
        !/^m(?:6|69|∆|maj)/.test(suffix)
      ) {
        return "Eólico";
      }
      if (isAugmentedMajorChord(parsedChord) && /^I(?!I|V)/.test(degreeBase(degree))) return "Jónico b6";
      return result.mode || "";
    }

    if (isDominantChord(parsedChord) || isSuspendedDominantChord(parsedChord)) {
      return modeForDominantQuality(parsedChord, result.mode, degree, nextParsedChord);
    }

    if (isHalfDiminishedChord(parsedChord)) return result.mode || "Locrio";

    if (/^m∆|^mmaj/.test(suffix)) {
      return /^I(?!I|V)/.test(degreeBase(degree)) ? "Eólico #7" : "Dórico #7";
    }

    if (/^m6/.test(suffix) && /^I(?!I|V)/.test(degreeBase(degree))) {
      return "Dórico #7";
    }

    if (isMajorChord(parsedChord) && /#11/.test(suffix)) return "Lidio";
    if (isAugmentedMajorChord(parsedChord)) {
      return /^I(?!I|V)/.test(degreeBase(degree)) ? "Jónico b6" : result.mode || "Jónico aumentado";
    }

    return result.mode || "";
  }

  function modeForPlainMajorDegree(parsedChord, result) {
    if (!parsedChord || result?.scaleType !== "major") return "";
    const degree = String(result?.degree || "");
    if (!degree || /bck\.dr/i.test(degree)) return "";
    if (/^(?:b|#)/.test(degree)) return "";
    const base = degreeBase(degree);

    if (isMinorChord(parsedChord)) {
      if (base === "II") return "Dórico";
      if (base === "III") return "Frigio";
      if (base === "VI") return "Eólico";
    }

    if (isMajorChord(parsedChord) || isAugmentedMajorChord(parsedChord)) {
      if (/sub/i.test(degree)) return "";
      if (/#11/.test(parsedChord.suffix || "")) return "Lidio";
      if (base === "I") return isAugmentedMajorChord(parsedChord) ? "Jónico b6" : "Jónico";
      if (base === "IV") return "Lidio";
    }

    if (isDominantChord(parsedChord) || isSuspendedDominantChord(parsedChord)) {
      if (/sub/i.test(degree)) return "";
      if (base === "V") return modeForDominantQuality(parsedChord, "Mixolidio", degree, null);
    }

    if (isHalfDiminishedChord(parsedChord) && base === "VII") return "Locrio";
    return "";
  }

  function applyChordQualityModes(parsed, results) {
    return results.map((result, index) => {
      if (!result) return result;
      const mode = modeForChordQuality(parsed[index]?.parsed, result, parsed[index + 1]?.parsed);
      return mode === result.mode ? result : { ...result, mode };
    });
  }

  function shouldResolveHarmonicMajorTonicToNatural(parsedItem, result) {
    const chord = parsedItem?.parsed;
    return Boolean(
      chord &&
      result?.scaleType === "harmonicMajor" &&
      result.key === chord.root &&
      /^I(?!I|V)/.test(result.degree || "") &&
      isMajorChord(chord) &&
      !isAugmentedMajorChord(chord)
    );
  }

  function asNaturalMajorResult(result, mode = null) {
    return {
      ...result,
      scaleType: "major",
      scaleLabel: "mayor",
      mode: mode || result.mode || ""
    };
  }

  function applyHarmonicMajorDominantResolutions(parsed, results) {
    for (let index = 0; index < results.length - 1; index++) {
      const current = parsed[index]?.parsed;
      const next = parsed[index + 1]?.parsed;
      if (!current || !next) continue;
      if (results[index]?.scaleType !== "harmonicMajor") continue;
      if (!/^V/.test(results[index]?.degree || "")) continue;
      if (!shouldResolveHarmonicMajorTonicToNatural(parsed[index + 1], results[index + 1])) continue;
      if (current.chroma !== mod12(next.chroma + 7)) continue;

      results[index] = asNaturalMajorResult(
        results[index],
        modeForDominantQuality(current, "Mixolidio", results[index].degree, next)
      );

      for (let tonicIndex = index + 1; tonicIndex < results.length; tonicIndex++) {
        if (!shouldResolveHarmonicMajorTonicToNatural(parsed[tonicIndex], results[tonicIndex])) break;
        results[tonicIndex] = asNaturalMajorResult(results[tonicIndex], "Jónico");
      }
    }

    return results;
  }

  function previousMajorContextKey(results, index) {
    for (let previousIndex = index - 1; previousIndex >= 0; previousIndex--) {
      const previous = results[previousIndex];
      if (previous?.scaleType === "major" && previous.key) return previous.key;
    }
    return "";
  }

  function applyDiatonicTargetSecondaryDominants(parsed, results) {
    for (let index = 0; index < parsed.length - 1; index++) {
      const dominant = parsed[index]?.parsed;
      const target = parsed[index + 1]?.parsed;
      if (!dominant || !target || !isDominantChord(dominant)) continue;
      if (results[index]?.source === "majorBlues" || results[index + 1]?.source === "majorBlues") continue;
      if (dominant.chroma !== mod12(target.chroma + 7)) continue;

      const key = previousMajorContextKey(results, index);
      if (!key) continue;
      if (isMajorChord(target) && /b9|#9|b13|alt|#5/.test(dominant.suffix || "")) continue;
      if (
        isMinorChord(target) &&
        isHalfDiminishedChord(parsed[index - 1]?.parsed) &&
        /b9|#9|b13|alt|#5/.test(dominant.suffix || "")
      ) continue;

      const targetDegree = majorScaleDegreeFor(target, key);
      if (!targetDegree || targetDegree === "I") continue;

      results[index] = {
        ...directContextResult(
          key,
          "major",
          `V${dominantSuffixForDegree(dominant)}/${targetDegree}`,
          dominant,
          modeForDominantQuality(dominant, "Mixolidio", `V${dominantSuffixForDegree(dominant)}/${targetDegree}`, target)
        ),
        source: "secondaryDominant",
        sectionStart: false,
        sectionLabel: ""
      };

      const targetResult = analyzeChordInMajorContext(target, key);
      if (targetResult) {
        results[index + 1] = {
          ...targetResult,
          source: "secondaryDominantTarget",
          sectionStart: false,
          sectionLabel: ""
        };
      }
    }

    return results;
  }

  function normalizeVisibleSectionScale(result) {
    if (!result?.key || !result.scaleType) return result;
    if (result.scaleType === "harmonicMajor") {
      return { ...result, scaleType: "major", scaleLabel: "mayor" };
    }
    return result;
  }

  function majorMinorTwoFiveTargetKey(iiParsed, dominantParsed) {
    if (isHalfDiminishedChord(iiParsed)) return "";
    if (!isMinorSeventhChord(iiParsed) || !dominantParsed) return "";
    if (!(isDominantChord(dominantParsed) || isSuspendedDominantChord(dominantParsed))) return "";
    if (mod12(dominantParsed.chroma - iiParsed.chroma) !== 5) return "";

    return keyNameForChromaPreference(dominantParsed.chroma + 5, [iiParsed.root, dominantParsed.root]);
  }

  function applyMajorMinorTwoFivePairs(parsed, results) {
    for (let index = 0; index < parsed.length - 1; index++) {
      const ii = parsed[index]?.parsed;
      const dominant = parsed[index + 1]?.parsed;
      const key = majorMinorTwoFiveTargetKey(ii, dominant);
      if (!key) continue;
      if (/\//.test(results[index]?.degree || "") || /\//.test(results[index + 1]?.degree || "")) continue;
      if (/sub|bck\.dr/.test(results[index]?.degree || "") || /sub|bck\.dr/.test(results[index + 1]?.degree || "")) continue;
      if (
        results[index]?.scaleType === "harmonicMinor" &&
        degreeBase(results[index]?.degree) === "I" &&
        degreeBase(results[index + 1]?.degree) === "IV"
      ) continue;

      const startsSection = startsSectionAt(results, index, key, "major");
      const dominantDegree = `V${dominantSuffixForDegree(dominant)}`;
      results[index] = {
        ...directContextResult(key, "major", `II${ii.displaySuffix}`, ii, "Dórico"),
        source: "majorMinorTwoFive",
        sectionStart: startsSection,
        sectionLabel: startsSection ? sectionLabel({ key, scaleType: "major" }) : ""
      };
      results[index + 1] = {
        ...directContextResult(
          key,
          "major",
          dominantDegree,
          dominant,
          modeForDominantQuality(dominant, "Mixolidio", dominantDegree, null)
        ),
        source: "majorMinorTwoFive",
        sectionStart: false,
        sectionLabel: ""
      };
    }

    return results;
  }

  function applyUserExamples(parsed, results) {
    if (!USER_EXAMPLES.length) return results;

    const chordKeys = parsed.map(item => exampleChordKey(item.chord));
    USER_EXAMPLES.forEach(example => {
      if (!example.chords.length || example.chords.length > chordKeys.length) return;

      for (let start = 0; start <= chordKeys.length - example.chords.length; start++) {
        const matches = example.chords.every((key, offset) => key === chordKeys[start + offset]);
        if (!matches) continue;

        example.results.forEach((saved, offset) => {
          const index = start + offset;
          const existing = results[index] || {};
          results[index] = {
            ...existing,
            chord: parsed[index]?.chord || existing.chord || "",
            key: saved.key || existing.key || "",
            scaleType: saved.scaleType || existing.scaleType || "",
            scaleLabel: saved.scaleType === "major" ? "mayor" : existing.scaleLabel || "",
            degree: saved.degree || existing.degree || "",
            mode: saved.mode || existing.mode || "",
            source: "adminExample",
            adminExample: example.name
          };
        });
      }
    });

    return results;
  }

  function contextResult(candidate) {
    if (!candidate) return null;
    const parsedChord = parseChord(candidate.chord);
    const mode = parsedChord ? modeForChordQuality(parsedChord, candidate) : candidate.mode;
    return {
      ...candidate,
      mode,
      sectionStart: true,
      sectionLabel: sectionLabel(candidate)
    };
  }

  function analyzeChordInMajorContext(parsedChord, key) {
    const item = {
      chord: parsedChord.input,
      parsed: parsedChord,
      candidates: candidatesForChord(parsedChord.input)
    };
    const direct = candidateFor(item, key, "major", degreeBase(item.candidates.find(candidate =>
      candidate.key === key &&
      candidate.scaleType === "major" &&
      !candidate.source
    )?.degree || ""));
    if (direct) return direct;

    const root = keyChroma(key);
    const scaleDegree = majorScaleDegreeFor(parsedChord, key);
    const suffix = dominantSuffixForDegree(parsedChord);

    if (parsedChord.bassChroma === mod12(parsedChord.chroma + 10) && scaleDegree === "V") {
      return directContextResult(key, "major", "V/7", parsedChord, "Mixolidio");
    }

    if (isHalfDiminishedChord(parsedChord)) {
      if (parsedChord.chroma === mod12(root + 6)) return directContextResult(key, "major", "IIø/III", parsedChord, "Locrio");
      if (parsedChord.chroma === mod12(root + 4)) return directContextResult(key, "major", "IIø/II", parsedChord, "Locrio");
      if (parsedChord.chroma === mod12(root + 2)) return directContextResult(key, "major", `II${parsedChord.displaySuffix}`, parsedChord, "Locrio");
    }

    if (isMinorChord(parsedChord)) {
      if (scaleDegree === "II") return directContextResult(key, "major", `II${parsedChord.displaySuffix}`, parsedChord, "Dórico");
      if (scaleDegree === "III") return directContextResult(key, "major", `III${parsedChord.displaySuffix}`, parsedChord, "Frigio");
      if (scaleDegree === "VI") return directContextResult(key, "major", `VI${parsedChord.displaySuffix}`, parsedChord, "Eólico");
      if (parsedChord.chroma === root) return directContextResult(key, "major", `II${parsedChord.displaySuffix.replace(/^-/, "m")}sub/III`, parsedChord, "Dórico");
    }

    if (isDominantChord(parsedChord) || isSuspendedDominantChord(parsedChord)) {
      const target = appliedDominantTargetFor(parsedChord, key);
      if (target) {
        const slash = target === "I" ? "" : `/${target}`;
        return directContextResult(key, "major", `V${suffix}${slash}`, parsedChord, modeForDominantQuality(parsedChord, "Mixolidio", `V${suffix}${slash}`));
      }

      const subTarget = subDominantTargetFor(parsedChord, key);
      if (subTarget) {
        const slash = subTarget === "I" ? "" : `/${subTarget}`;
        const degree = `V${suffix}sub${slash}`;
        return directContextResult(key, "major", degree, parsedChord, modeForDominantQuality(parsedChord, "Lidio dominante", degree));
      }
    }

    if (isMajorChord(parsedChord)) {
      if (scaleDegree === "I" || scaleDegree === "IV") {
        return directContextResult(
          key,
          "major",
          `${scaleDegree}${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`,
          parsedChord,
          scaleDegree === "I" ? "Jónico" : "Lidio"
        );
      }
      if (parsedChord.chroma === mod12(root + 6)) return directContextResult(key, "major", `I${parsedChord.displaySuffix}sub`, parsedChord, "Lidio");
      if (parsedChord.chroma === mod12(root + 3)) return directContextResult(key, "major", `V${parsedChord.displaySuffix}sub/II`, parsedChord, "Lidio");
      if (parsedChord.chroma === mod12(root + 8)) return directContextResult(key, "major", `V${parsedChord.displaySuffix}sub/V`, parsedChord, "Lidio");
      if (parsedChord.chroma === mod12(root + 1)) return directContextResult(key, "major", `V${parsedChord.displaySuffix}sub`, parsedChord, "Lidio");
    }

    const chromaticDegree = majorChromaticScaleDegreeFor(parsedChord, key);
    if (chromaticDegree) {
      return directContextResult(
        key,
        "major",
        `${chromaticDegree}${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`,
        parsedChord,
        ""
      );
    }

    return null;
  }

  function analyzeChordInMinorContext(parsedChord, key, scaleType = "harmonicMinor") {
    const root = keyChroma(key);
    if (root === undefined) return null;

    if (isMinorChord(parsedChord) && parsedChord.chroma === root) {
      const suffix = parsedChord.suffix || "";
      if (/^m6|^m69/.test(suffix)) {
        return directContextResult(key, "melodicMinor", `I${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`, parsedChord, "Dórico #7");
      }
      const mode = /^m∆|^mmaj/.test(suffix) ? "Eólico #7" : "Eólico";
      return directContextResult(key, "harmonicMinor", `I${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`, parsedChord, mode);
    }

    if (isHalfDiminishedChord(parsedChord) && parsedChord.chroma === mod12(root + 2)) {
      return directContextResult(key, "harmonicMinor", `II${parsedChord.displaySuffix}`, parsedChord, "Locrio #6");
    }

    if (isHalfDiminishedChord(parsedChord) && parsedChord.chroma === mod12(root + 7)) {
      return {
        ...directContextResult(key, "harmonicMinor", "IIø/IV", parsedChord, "Locrio #6"),
        source: "segunda relativa menor",
        originKey: keyNameForChromaPreference(root + 5, [parsedChord.root, key]),
        originScaleType: "harmonicMinor"
      };
    }

    if ((isMajorChord(parsedChord) || isAugmentedMajorChord(parsedChord)) && parsedChord.chroma === mod12(root + 3)) {
      return directContextResult(key, "harmonicMinor", `III${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`, parsedChord, "Jónico aumentado");
    }

    if (isMinorChord(parsedChord) && parsedChord.chroma === mod12(root + 5)) {
      return directContextResult(key, "harmonicMinor", `IV${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`, parsedChord, "Dórico #4");
    }

    if ((isDominantChord(parsedChord) || isSuspendedDominantChord(parsedChord)) && parsedChord.chroma === mod12(root + 7)) {
      const degree = `V${dominantSuffixForDegree(parsedChord)}`;
      return directContextResult(key, "harmonicMinor", degree, parsedChord, modeForHarmonicMinorDominant(parsedChord, degree));
    }

    if (isDominantChord(parsedChord) || isSuspendedDominantChord(parsedChord)) {
      const appliedTarget = minorAppliedDominantTargetInfo(parsedChord, key);
      if (appliedTarget?.targetKey) {
        const degree = `V${dominantSuffixForDegree(parsedChord)}/${appliedTarget.degree}`;
        return {
          ...directContextResult(
            key,
            "harmonicMinor",
            degree,
            parsedChord,
            modeForDominantQuality(
              parsedChord,
              appliedTarget.minorTarget ? "Mixo b2b6" : "Mixolidio",
              degree,
              appliedTarget.targetParsed
            )
          ),
          source: "dominante secundaria menor",
          originKey: appliedTarget.targetKey,
          originScaleType: appliedTarget.originScaleType
        };
      }
    }

    if (isMajorChord(parsedChord) && parsedChord.chroma === mod12(root + 8)) {
      return directContextResult(key, "harmonicMinor", `VI${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`, parsedChord, "Lidio #2");
    }

    if (isDiminishedChord(parsedChord) && parsedChord.chroma === mod12(root + 11)) {
      return directContextResult(key, "harmonicMinor", `#VII${parsedChord.displaySuffix}`, parsedChord, "Locrio b4b7");
    }

    const scaleDegree = minorScaleDegreeFor(parsedChord, key);
    if (scaleDegree) {
      return directContextResult(
        key,
        scaleType,
        `${scaleDegree}${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`,
        parsedChord,
        ""
      );
    }

    return null;
  }

  function analyzeChordInContext(chord, key, scaleType = "major") {
    const parsedChord = parseChord(chord);
    if (!parsedChord || !key) return null;

    const item = {
      chord: parsedChord.input,
      parsed: parsedChord,
      candidates: candidatesForChord(parsedChord.input)
    };
    const direct = item.candidates.find(candidate =>
      candidate.key === key &&
      candidate.scaleType === scaleType &&
      !candidate.source
    ) || item.candidates.find(candidate =>
      candidate.key === key &&
      candidate.scaleType === scaleType
    );

    if (scaleType === "major") return contextResult(analyzeChordInMajorContext(parsedChord, key));
    if (scaleType === "harmonicMinor" || scaleType === "melodicMinor") {
      if (direct && !direct.source) return contextResult(direct);
      const minorContext = analyzeChordInMinorContext(parsedChord, key, scaleType);
      if (minorContext) {
        return {
          ...minorContext,
          sectionStart: true,
          sectionLabel: sectionLabel(minorContext)
        };
      }
      return contextResult(direct);
    }
    if (direct) return contextResult(direct);
    return null;
  }

  function dominantSuffixForDegree(parsedChord) {
    if (parsedChord.suffix === "9b5") return "9(b5)";
    if (parsedChord.suffix === "13b9") return "13(b9)";
    if (!parsedChord.suffix && parsedChord.bassChroma === mod12(parsedChord.chroma + 10)) return "/7";
    return parsedChord.displaySuffix || "7";
  }

  function inversionSuffixForDegree(parsedChord) {
    if (parsedChord?.bassChroma === undefined) return "";

    const interval = mod12(parsedChord.bassChroma - parsedChord.chroma);
    if (interval === 4) return "/3";
    if (interval === 7) return "/5";
    if (interval === 10) return "/7";
    return "";
  }

  function candidateFor(item, key, scaleType, baseDegree) {
    return item.candidates.find(candidate =>
      candidate.key === key &&
      candidate.scaleType === scaleType &&
      degreeBase(candidate.degree) === baseDegree
    ) || null;
  }

  function applyCandidateResult(results, index, candidate, sectionStart) {
    results[index] = {
      ...candidate,
      sectionStart,
      sectionLabel: sectionStart ? sectionLabel(candidate) : ""
    };
  }

  function directContextResult(key, scaleType, degree, parsedChord, mode) {
    return {
      key,
      scaleType,
      scaleLabel: scaleType === "major" ? "mayor" : "menor armónica",
      degree,
      mode: mode || "",
      chord: parsedChord.input
    };
  }

  function startsSectionAt(results, index, key, scaleType) {
    const previous = results[index - 1];
    return !previous || visibleSectionKey(previous) !== `${key}:${visibleSectionScaleType(scaleType)}`;
  }

  function isCompleteScaleDegreeRun(results, index, scaleType) {
    const current = results[index];
    if (!current || current.scaleType !== scaleType || current.source) return false;

    let start = index;
    while (
      start > 0 &&
      results[start - 1]?.scaleType === scaleType &&
      results[start - 1]?.key === current.key &&
      !results[start - 1]?.source
    ) {
      start -= 1;
    }

    let end = index;
    while (
      end < results.length - 1 &&
      results[end + 1]?.scaleType === scaleType &&
      results[end + 1]?.key === current.key &&
      !results[end + 1]?.source
    ) {
      end += 1;
    }

    if (end - start + 1 < 7) return false;
    const bases = new Set();
    for (let runIndex = start; runIndex <= end; runIndex++) {
      bases.add(naturalDegreeBase(results[runIndex]?.degree || ""));
    }
    return ["I", "II", "III", "IV", "V", "VI", "VII"].every(degree => bases.has(degree));
  }

  function nearbyContextKey(results, index, scaleType) {
    const direct = results[index];
    if (direct?.scaleType === scaleType) {
      for (let distance = 1; distance <= 4; distance++) {
        const left = results[index - distance];
        if (left?.scaleType === scaleType && left.key !== direct.key && /^I/.test(left.degree || "")) return left.key;
      }
    }

    for (let distance = 0; distance <= 8; distance++) {
      const left = results[index - distance];
      if (left?.scaleType === scaleType && /^I/.test(left.degree || "")) return left.key;
    }

    for (let distance = 0; distance <= 8; distance++) {
      const left = results[index - distance];
      const right = results[index + distance];
      if (left?.scaleType === scaleType) return left.key;
      if (right?.scaleType === scaleType) return right.key;
    }

    return "";
  }

  function applyPrimaryMajorCadences(parsed, results) {
    for (let index = 0; index < parsed.length - 2; index++) {
      const ii = parsed[index].parsed;
      const v = parsed[index + 1].parsed;
      const tonic = parsed[index + 2].parsed;
      if (!ii || !v || !tonic) continue;
      if (!isMinorChord(ii) || !isDominantChord(v)) continue;

      const tonicCandidates = parsed[index + 2].candidates.filter(candidate =>
        candidate.scaleType === "major" &&
        !candidate.source &&
        degreeBase(candidate.degree) === "I"
      );

      tonicCandidates.forEach(tonicCandidate => {
        const root = keyChroma(tonicCandidate.key);
        if (ii.chroma !== mod12(root + 2)) return;
        if (v.chroma !== mod12(root + 7)) return;

        const iiCandidate = candidateFor(parsed[index], tonicCandidate.key, "major", "II");
        const vCandidate = candidateFor(parsed[index + 1], tonicCandidate.key, "major", "V");
        if (!iiCandidate || !vCandidate) return;

        const startsSection = startsSectionAt(results, index, tonicCandidate.key, "major");
        applyCandidateResult(results, index, iiCandidate, startsSection);
        applyCandidateResult(results, index + 1, vCandidate, false);
        applyCandidateResult(results, index + 2, tonicCandidate, false);
        results[index].source = "primaryMajorCadence";
        results[index + 1].source = "primaryMajorCadence";
        results[index + 2].source = "primaryMajorCadence";
      });
    }

    return results;
  }

  function applyPrimaryMajorDominants(parsed, results) {
    for (let index = 1; index < parsed.length; index++) {
      const tonic = parsed[index].parsed;
      if (!tonic) continue;
      if (results[index]?.scaleType === "harmonicMajor") continue;

      const tonicCandidates = parsed[index].candidates.filter(candidate =>
        candidate.scaleType === "major" &&
        !candidate.source &&
        degreeBase(candidate.degree) === "I"
      );

      tonicCandidates.forEach(tonicCandidate => {
        const root = keyChroma(tonicCandidate.key);
        let cursor = index - 1;
        const dominantIndexes = [];

        while (cursor >= 0) {
          const dominant = parsed[cursor].parsed;
          if (!dominant || !isDominantChord(dominant) || dominant.chroma !== mod12(root + 7)) break;
          dominantIndexes.unshift(cursor);
          cursor -= 1;
        }

        if (!dominantIndexes.length) return;

        const startsSection = startsSectionAt(results, dominantIndexes[0], tonicCandidate.key, "major");
        dominantIndexes.forEach((dominantIndex, dominantOrder) => {
          const dominantCandidate = candidateFor(parsed[dominantIndex], tonicCandidate.key, "major", "V") || {
            key: tonicCandidate.key,
            scaleType: "major",
            scaleLabel: "mayor",
            degree: `V${parsed[dominantIndex].parsed.displaySuffix}`,
            mode: "Mixolidio",
            chord: parsed[dominantIndex].chord
          };
          applyCandidateResult(results, dominantIndex, dominantCandidate, dominantOrder === 0 && startsSection);
          results[dominantIndex].source = "primaryMajorCadence";
        });
        applyCandidateResult(results, index, tonicCandidate, false);
        results[index].source = "primaryMajorCadence";
      });
    }

    return results;
  }

  function applyStableMajorDegreeVariants(parsed, results) {
    for (let index = 0; index < parsed.length; index++) {
      const current = parsed[index].parsed;
      const key = nearbyContextKey(results, index, "major");
      if (!current || !key) continue;

      const root = keyChroma(key);
      let degreeBaseName = "";
      if (current.chroma === root) degreeBaseName = "I";
      if (current.chroma === mod12(root + 5)) degreeBaseName = "IV";
      if (!degreeBaseName) continue;

      let suffix = current.displaySuffix;
      if (isAugmentedChord(current)) suffix = "+";
      if (!isMajorChord(current) && !isAugmentedMajorChord(current)) continue;
      suffix += inversionSuffixForDegree(current);

      results[index] = {
        ...directContextResult(
          key,
          "major",
          `${degreeBaseName}${suffix}`,
          current,
          degreeBaseName === "I" && isAugmentedMajorChord(current) ? "Jónico b6" : degreeBaseName === "I" ? "Jónico" : "Lidio"
        ),
        source: "stableMajorDegree",
        sectionStart: startsSectionAt(results, index, key, "major"),
        sectionLabel: ""
      };
    }

    return results;
  }

  function applyStableMinorDegreeVariants(parsed, results) {
    for (let index = 0; index < parsed.length; index++) {
      const current = parsed[index].parsed;
      if (results[index]?.scaleType === "harmonicMajor") continue;
      if (isCompleteScaleDegreeRun(results, index, "melodicMinor")) continue;
      if (current?.suffix.startsWith("m∆") && (index === 0 || parsed[index - 1]?.chord === "%" || parsed[index + 1]?.chord === "%")) {
        const key = current.root;
        const startsSection = startsSectionAt(results, index, key, "harmonicMinor");
        results[index] = {
          ...directContextResult(key, "harmonicMinor", `I${current.displaySuffix}${inversionSuffixForDegree(current)}`, current, "Eólico #7"),
          source: "stableMinorDegree",
          sectionStart: startsSection,
          sectionLabel: startsSection ? sectionLabel({
            key,
            scaleType: "harmonicMinor",
            scaleLabel: "menor armónica"
          }) : ""
        };
        continue;
      }

      const harmonicKey = nearbyContextKey(results, index, "harmonicMinor");
      const melodicKey = nearbyContextKey(results, index, "melodicMinor");
      const key = harmonicKey || (!nearbyContextKey(results, index, "major") ? melodicKey : "");
      if (!current || !key) continue;
      if (results[index]?.scaleType === "major" && results[index]?.source !== "stableMinorDegree") continue;
      if (results[index - 1]?.scaleType === "major" && results[index - 1]?.key === results[index]?.key) continue;

      const root = keyChroma(key);
      let degreeBaseName = "";
      if (current.chroma === root) degreeBaseName = "I";
      if (current.chroma === mod12(root + 5)) degreeBaseName = "IV";
      if (!degreeBaseName) continue;
      if (!isMinorChord(current)) continue;

      let suffix = current.displaySuffix;
      suffix += inversionSuffixForDegree(current);

      const startsSection = startsSectionAt(results, index, key, "harmonicMinor");
      let mode = degreeBaseName === "I" ? "Eólico" : "Dórico #4";
      if (degreeBaseName === "I" && /^m6|^m69/.test(current.suffix || "")) mode = "Dórico #7";
      if (degreeBaseName === "I" && /^m∆|^mmaj/.test(current.suffix || "")) mode = "Eólico #7";
      results[index] = {
        ...directContextResult(key, "harmonicMinor", `${degreeBaseName}${suffix}`, current, mode),
        source: "stableMinorDegree",
        sectionStart: startsSection,
        sectionLabel: startsSection ? sectionLabel({
          key,
          scaleType: "harmonicMinor",
          scaleLabel: "menor armónica"
        }) : ""
      };
    }

    return results;
  }

  function inferFinalMajorContext(parsed) {
    const lastChord = parsed[parsed.length - 1]?.parsed;
    const previousChord = parsed[parsed.length - 2]?.parsed;
    if (
      lastChord &&
      previousChord &&
      isMajorChord(lastChord) &&
      isMajorChord(previousChord) &&
      lastChord.chroma === previousChord.chroma
    ) {
      if (/[b#]/.test(lastChord.root)) {
        for (let lookback = parsed.length - 3; lookback >= Math.max(0, parsed.length - 6); lookback--) {
          const beforeFinal = parsed[lookback].parsed;
          if (beforeFinal && isDominantChord(beforeFinal) && beforeFinal.chroma === mod12(lastChord.chroma + 1)) {
            return keyNameForChroma(lastChord.chroma + 6);
          }
        }
      }
      return keyNameForChroma(lastChord.chroma);
    }

    for (let index = 2; index < parsed.length; index++) {
      const tonic = parsed[index].parsed;
      const backdoorIi = parsed[index - 2]?.parsed;
      const backdoorV = parsed[index - 1]?.parsed;
      if (!tonic || !backdoorIi || !backdoorV || !isMajorChord(tonic)) continue;

      const tonicRoot = tonic.chroma;
      const opensWithIv = parsed[0]?.parsed &&
        isMajorChord(parsed[0].parsed) &&
        parsed[0].parsed.chroma === mod12(tonicRoot + 5);
      if (
        opensWithIv &&
        isMinorChord(backdoorIi) &&
        isDominantChord(backdoorV) &&
        backdoorIi.chroma === mod12(tonicRoot + 5) &&
        backdoorV.chroma === mod12(tonicRoot + 10)
      ) {
        return keyNameForChroma(tonicRoot);
      }
    }

    let best = { key: "", score: 0 };
    KEYS.forEach(([key]) => {
      const root = keyChroma(key);
      let score = 0;

      parsed.forEach((item, index) => {
        const chord = item.parsed;
        const next = parsed[index + 1]?.parsed;
        const afterNext = parsed[index + 2]?.parsed;
        if (!chord) return;

        const scaleDegree = majorScaleDegreeFor(chord, key);
        if (index === 0 && isMajorChord(chord) && scaleDegree === "I") score += 5;
        if (isMajorChord(chord) && scaleDegree === "I") score += 7;
        if (isMajorChord(chord) && scaleDegree === "IV") score += 5;
        if (isMinorChord(chord) && scaleDegree === "II") score += 4;
        if (isMinorChord(chord) && scaleDegree === "III") score += 3;
        if (isMinorChord(chord) && scaleDegree === "VI") score += 3;
        if (isDominantChord(chord) && appliedDominantTargetFor(chord, key)) score += 3;

        if (
          isMinorChord(chord) &&
          next &&
          isDominantChord(next) &&
          chord.chroma === mod12(root + 5) &&
          next.chroma === mod12(root + 10)
        ) {
          score += 6;
        }

        if (
          isMinorChord(chord) &&
          next &&
          afterNext &&
          isDominantChord(next) &&
          majorScaleDegreeFor(afterNext, key) &&
          subDominantTargetFor(next, key)
        ) {
          score += 3;
        }
      });

      if (score > best.score) best = { key, score };
    });

    if (best.score >= 12) return best.key;

    for (let index = parsed.length - 1; index >= 0; index--) {
      const current = parsed[index].parsed;
      if (!current || !isMajorChord(current)) continue;

      for (let lookback = index - 1; lookback >= Math.max(0, index - 4); lookback--) {
        const previous = parsed[lookback].parsed;
        if (!previous || !isDominantChord(previous)) continue;
        if (/[b#]/.test(current.root) && previous.chroma === mod12(current.chroma + 1)) {
          return keyNameForChroma(current.chroma + 6);
        }
      }

      return keyNameForChroma(current.chroma);
    }

    return "";
  }

  function majorContextKeyFor(results, index, fallbackKey) {
    const key = nearbyContextKey(results, index, "major");
    if (!key) return fallbackKey || "";
    if (!fallbackKey) return key;

    const direct = results[index];
    const previous = results[index - 1];
    if (direct?.scaleType === "major" && direct.source === "primaryMajorCadence") return direct.key;
    if (
      direct?.scaleType === "major" &&
      previous?.scaleType === "major" &&
      previous.key === direct.key &&
      previous.source === "primaryMajorCadence"
    ) {
      return key;
    }
    return fallbackKey;
  }

  function majorScaleDegreeFor(parsedChord, key) {
    const degree = majorChromaticScaleDegreeFor(parsedChord, key);
    return /^(?:bb|##|b|#)/.test(degree) ? "" : degree;
  }

  function appliedDominantTargetFor(parsedChord, key) {
    const root = keyChroma(key);
    const targets = [
      ["I", 0],
      ["II", 2],
      ["III", 4],
      ["IV", 5],
      ["V", 7],
      ["VI", 9]
    ];

    return targets.find(([, targetInterval]) =>
      parsedChord.chroma === mod12(root + targetInterval + 7)
    )?.[0] || "";
  }

  function degreeInterval(degree) {
    return {
      I: 0,
      II: 2,
      III: 4,
      IV: 5,
      V: 7,
      VI: 9,
      VII: 11
    }[degree];
  }

  function subDominantTargetFor(parsedChord, key) {
    const root = keyChroma(key);
    const targets = [
      ["I", 0],
      ["II", 2],
      ["III", 4],
      ["IV", 5],
      ["V", 7],
      ["VI", 9]
    ];

    return targets.find(([, targetInterval]) =>
      parsedChord.chroma === mod12(root + targetInterval + 1)
    )?.[0] || "";
  }

  function shouldRetargetSubPairToSixth(parsed, index, key) {
    const afterNext = parsed[index + 2]?.parsed;
    const following = parsed[index + 3]?.parsed;
    return Boolean(
      afterNext &&
      following &&
      isMinorChord(afterNext) &&
      (isDominantChord(following) || isSuspendedDominantChord(following)) &&
      majorScaleDegreeFor(afterNext, key) === "III" &&
      appliedDominantTargetFor(following, key) === "II"
    );
  }

  function hasPreviousRelativeSubPair(results, index) {
    const currentDegree = results[index]?.degree || "";
    const previousDegree = results[index - 1]?.degree || "";
    const currentSub = currentDegree.match(/^V.*sub(\/[IVX]+)?$/);
    if (!currentSub) return false;
    const slash = currentSub[1] || "";
    return new RegExp(`^II.*sub${slash.replace("/", "\\/")}$`).test(previousDegree);
  }

  function setMajorContextResult(results, index, key, degree, parsedChord, mode, source) {
    results[index] = {
      ...directContextResult(key, "major", degree, parsedChord, mode || ""),
      source: source || "majorContext",
      sectionStart: startsSectionAt(results, index, key, "major"),
      sectionLabel: ""
    };
  }

  function hasFinalMajorSubstituteTonic(parsed, key) {
    const lastChord = parsed[parsed.length - 1]?.parsed;
    const previousChord = parsed[parsed.length - 2]?.parsed;
    if (!lastChord || !previousChord || !key) return false;
    return isMajorChord(lastChord) &&
      isMajorChord(previousChord) &&
      /[b#]/.test(lastChord.root) &&
      lastChord.chroma === previousChord.chroma &&
      lastChord.chroma === mod12(keyChroma(key) + 6);
  }

  function inferMajorBluesKey(parsed) {
    for (let index = 2; index < parsed.length; index++) {
      const tonic = parsed[index].parsed;
      const backdoorIi = parsed[index - 2]?.parsed;
      const backdoorV = parsed[index - 1]?.parsed;
      if (!tonic || !backdoorIi || !backdoorV || !isMajorChord(tonic)) continue;

      const tonicRoot = tonic.chroma;
      const opensWithIv = parsed[0]?.parsed &&
        isMajorChord(parsed[0].parsed) &&
        parsed[0].parsed.chroma === mod12(tonicRoot + 5);
      if (
        opensWithIv &&
        isMinorChord(backdoorIi) &&
        isDominantChord(backdoorV) &&
        backdoorIi.chroma === mod12(tonicRoot + 5) &&
        backdoorV.chroma === mod12(tonicRoot + 10)
      ) {
        return "";
      }
    }

    let best = { key: "", score: 0 };

    KEYS.forEach(([key]) => {
      const root = keyChroma(key);
      let score = 0;
      const bluesDegrees = new Set();
      let startsOnTonic = false;

      parsed.forEach((item, index) => {
        const chord = item.parsed;
        if (!chord) return;

        if (index === 0 && chord.chroma === root && (isDominantChord(chord) || isMajorChord(chord))) {
          score += 6;
          startsOnTonic = true;
        }
        if (isDominantChord(chord)) {
          if (chord.chroma === root) {
            score += 3;
            bluesDegrees.add("I");
          }
          if (chord.chroma === mod12(root + 5)) {
            score += 3;
            bluesDegrees.add("IV");
          }
          if (chord.chroma === mod12(root + 7)) {
            score += 3;
            bluesDegrees.add("V");
          }
          if (chord.chroma === mod12(root + 6)) score += 1;
          if (chord.chroma === mod12(root + 3)) score += 1;
          if (chord.chroma === mod12(root + 1)) score += 1;
        }
        if (isMajorChord(chord) && chord.chroma === root) score += 3;
        if (isMajorChord(chord) && chord.chroma === mod12(root + 5)) score += 2;
        if (isDiminishedChord(chord) && chord.chroma === mod12(root + 6)) score += 2;
      });

      if (!startsOnTonic || bluesDegrees.size < 2 || parsed.length < 8) score = 0;
      if (score > best.score) best = { key, score };
    });

    return best.score >= 8 ? best.key : "";
  }

  function minorDegreeLabelForBluesContext(parsedChord) {
    return parsedChord.displaySuffix.replace(/^-/, "m");
  }

  function applyMajorBluesFunctions(parsed, results) {
    const key = inferMajorBluesKey(parsed);
    if (!key) return results;

    const root = keyChroma(key);

    for (let index = 0; index < parsed.length - 1; index++) {
      const current = parsed[index].parsed;
      const next = parsed[index + 1].parsed;
      const afterNext = parsed[index + 2]?.parsed;
      if (!current || !next) continue;

      const target = appliedDominantTargetFor(next, key);
      if (isHalfDiminishedChord(current) && target && current.chroma === mod12(root + degreeInterval(target) + 2)) {
        const slash = target === "I" ? "" : `/${target}`;
        setMajorContextResult(results, index, key, `IIø${slash}`, current, "Locrio", "majorBlues");
        setMajorContextResult(results, index + 1, key, `V${dominantSuffixForDegree(next)}${slash}`, next, "Mixolidio", "majorBlues");
        continue;
      }

      if (isMinorChord(current) && isDominantChord(next)) {
        if (
          current.chroma === mod12(root + 5) &&
          next.chroma === mod12(root + 10) &&
          !(afterNext && isMinorChord(afterNext) && majorScaleDegreeFor(afterNext, key) === "III")
        ) {
          setMajorContextResult(results, index, key, `II${minorDegreeLabelForBluesContext(current)}bck.dr`, current, "Dórico", "majorBlues");
          setMajorContextResult(results, index + 1, key, `V${dominantSuffixForDegree(next)}bck.dr`, next, "Mixolidio", "majorBlues");
          continue;
        }

        if (target) {
          const targetInterval = degreeInterval(target);
          const scaleDegree = majorScaleDegreeFor(current, key);
          const slash = target === "I" ? "" : `/${target}`;

          if (scaleDegree === "II" || scaleDegree === "III" || scaleDegree === "VI") {
            setMajorContextResult(results, index, key, `${scaleDegree}${current.displaySuffix}`, current, "Dórico", "majorBlues");
            setMajorContextResult(results, index + 1, key, `V${dominantSuffixForDegree(next)}${slash}`, next, "Mixolidio", "majorBlues");
            continue;
          }

          if (targetInterval !== undefined && current.chroma === mod12(root + targetInterval + 2)) {
            setMajorContextResult(results, index, key, `II${current.displaySuffix}${slash}`, current, "Dórico", "majorBlues");
            setMajorContextResult(results, index + 1, key, `V${dominantSuffixForDegree(next)}${slash}`, next, "Mixolidio", "majorBlues");
            continue;
          }
        }

        if (afterNext) {
          let subTarget = majorScaleDegreeFor(afterNext, key);
          let subPairMatches = false;
          let omitPlainSeven = false;
          const following = parsed[index + 3]?.parsed;
          if (
            subTarget === "II" &&
            isMinorChord(afterNext) &&
            following &&
            isDominantChord(following) &&
            majorScaleDegreeFor(following, key) === "V"
          ) {
            subTarget = "V";
            omitPlainSeven = true;
            subPairMatches = current.chroma === mod12(root + degreeInterval(subTarget) + 8) &&
              next.chroma === mod12(root + degreeInterval(subTarget) + 1);
          }
          if (subTarget === "III" && shouldRetargetSubPairToSixth(parsed, index, key)) {
            subTarget = "VI";
            subPairMatches = current.chroma === mod12(root + degreeInterval(subTarget) + 8) &&
              next.chroma === mod12(root + degreeInterval(subTarget) + 1);
          }
          const subInterval = degreeInterval(subTarget);
          subPairMatches = subPairMatches || (
            subInterval !== undefined &&
            current.chroma === mod12(root + subInterval + 1) &&
            next.chroma === mod12(root + subInterval + 6)
          );
          if (
            subTarget &&
            subInterval !== undefined &&
            subPairMatches
          ) {
            const slash = subTarget === "I" ? "" : `/${subTarget}`;
            const dominantSuffix = omitPlainSeven && dominantSuffixForDegree(next) === "7" ? "" : dominantSuffixForDegree(next);
            setMajorContextResult(results, index, key, `II${minorDegreeLabelForBluesContext(current)}sub${slash}`, current, "Dórico", "majorBlues");
            setMajorContextResult(results, index + 1, key, `V${dominantSuffix}sub${slash}`, next, "Lidio dominante", "majorBlues");
          }
        }
      }
    }

    for (let index = 0; index < parsed.length; index++) {
      const current = parsed[index].parsed;
      if (!current) continue;
      if (results[index]?.source === "majorBlues") continue;
      if (hasPreviousRelativeSubPair(results, index)) continue;

      if (isDiminishedChord(current) && current.chroma === mod12(root + 6)) {
        setMajorContextResult(results, index, key, `#IV${current.displaySuffix}`, current, "Disminuida", "majorBlues");
        continue;
      }

      if (isDominantChord(current) || isSuspendedDominantChord(current)) {
        const next = parsed[index + 1]?.parsed;
        const subTarget = subDominantTargetFor(current, key);
        const subInterval = degreeInterval(subTarget);
        if (
          next &&
          subTarget &&
          subInterval !== undefined &&
          next.chroma === mod12(root + subInterval)
        ) {
          const slash = subTarget === "I" ? "" : `/${subTarget}`;
          const degree = `V${dominantSuffixForDegree(current)}sub${slash}`;
          setMajorContextResult(
            results,
            index,
            key,
            degree,
            current,
            modeForDominantQuality(current, "Lidio dominante", degree, null),
            "majorBlues"
          );
          continue;
        }

        if (current.chroma === root) {
          setMajorContextResult(results, index, key, `I${dominantSuffixForDegree(current)}`, current, "Mixolidio", "majorBlues");
          continue;
        }
        if (current.chroma === mod12(root + 5)) {
          setMajorContextResult(results, index, key, `IV${dominantSuffixForDegree(current)}`, current, "Mixolidio", "majorBlues");
          continue;
        }
        if (current.chroma === mod12(root + 7)) {
          setMajorContextResult(results, index, key, `V${dominantSuffixForDegree(current)}`, current, "Mixolidio", "majorBlues");
          continue;
        }
      }

      if (isMajorChord(current)) {
        const scaleDegree = majorScaleDegreeFor(current, key);
        if (scaleDegree === "I" || scaleDegree === "IV") {
          setMajorContextResult(results, index, key, `${scaleDegree}${current.displaySuffix}${inversionSuffixForDegree(current)}`, current, scaleDegree === "I" ? "Jónico" : "Lidio", "majorBlues");
          continue;
        }

        if (current.chroma === mod12(root + 6)) {
          setMajorContextResult(results, index, key, `I${current.displaySuffix}sub`, current, "Lidio", "majorBlues");
        }
      }
    }

    return results;
  }

  function applyMajorContextFunctions(parsed, results) {
    const fallbackKey = inferFinalMajorContext(parsed);

    for (let index = 0; index < parsed.length; index++) {
      const current = parsed[index].parsed;
      if (!current) continue;
      if (isStableMajorTonicBeforeCadence(parsed, results, index)) continue;
      if (isCompleteScaleDegreeRun(results, index, "melodicMinor")) continue;
      if (
        results[index]?.source === "majorContext" &&
        parsed[index - 1]?.parsed &&
        isSuspendedDominantChord(parsed[index - 1].parsed) &&
        parsed[index - 1].parsed.chroma === current.chroma
      ) continue;
      if (results[index]?.scaleType === "harmonicMajor") continue;
      if (
        results[index]?.source === "intercambio modal" &&
        /^bVII/.test(results[index]?.degree || "") &&
        !(
          isSuspendedDominantChord(current) &&
          parsed[index + 1]?.parsed &&
          parsed[index + 2]?.parsed &&
          isDominantChord(parsed[index + 1].parsed) &&
          isMajorChord(parsed[index + 2].parsed) &&
          current.chroma === parsed[index + 1].parsed.chroma &&
          current.chroma === mod12(parsed[index + 2].parsed.chroma + 7)
        )
      ) continue;
      if (/bck\.dr$/.test(results[index]?.degree || "")) continue;

      let key = majorContextKeyFor(results, index, fallbackKey);
      if (hasFinalMajorSubstituteTonic(parsed, fallbackKey)) key = fallbackKey;
      if (!key) continue;
      if (results[index]?.scaleType === "melodicMinor" && results[index]?.key === key) continue;

      const next = parsed[index + 1]?.parsed;
      const afterNext = parsed[index + 2]?.parsed;
      const afterCadence = parsed[index + 3]?.parsed;
      const nearbyMajorKey = nearbyContextKey(results, index, "major");
      if (
        nearbyMajorKey &&
        isMinorChord(current) &&
        next &&
        afterNext &&
        (isDominantChord(next) || isSuspendedDominantChord(next))
      ) {
        const nearbyRoot = keyChroma(nearbyMajorKey);
        const nearbySubTarget = subDominantTargetFor(next, nearbyMajorKey);
        const nearbyInterval = degreeInterval(nearbySubTarget || "");
        if (
          nearbyInterval !== undefined &&
          afterNext.chroma === mod12(nearbyRoot + nearbyInterval) &&
          current.chroma === mod12(nearbyRoot + nearbyInterval + 8)
        ) {
          key = nearbyMajorKey;
        }
      }

      const root = keyChroma(key);
      const suffix = dominantSuffixForDegree(current);
      const target = appliedDominantTargetFor(current, key);
      const subTarget = subDominantTargetFor(current, key);
      const scaleDegree = majorScaleDegreeFor(current, key);

      if (
        isSuspendedDominantChord(current) &&
        next &&
        afterNext &&
        isDominantChord(next) &&
        isMajorChord(afterNext) &&
        current.chroma === next.chroma &&
        current.chroma === mod12(afterNext.chroma + 7)
      ) {
        const targetKey = afterNext.root;
        const startsSection = startsSectionAt(results, index, targetKey, "major");
        setMajorContextResult(results, index, targetKey, `V${dominantSuffixForDegree(current)}`, current, "Mixolidio", "majorContext");
        results[index].sectionStart = startsSection;
        results[index].sectionLabel = startsSection ? sectionLabel({ key: targetKey, scaleType: "major", scaleLabel: "mayor" }) : "";
        setMajorContextResult(results, index + 1, targetKey, `V${dominantSuffixForDegree(next)}`, next, "Mixolidio", "majorContext");
        setMajorContextResult(results, index + 2, targetKey, `I${afterNext.displaySuffix}${inversionSuffixForDegree(afterNext)}`, afterNext, "Jónico", "majorContext");
        continue;
      }

      if (isHalfDiminishedChord(current) && next && (isDominantChord(next) || isSuspendedDominantChord(next))) {
        if (
          afterNext &&
          isMinorChord(afterNext) &&
          !isHalfDiminishedChord(afterNext) &&
          current.chroma === mod12(afterNext.chroma + 2) &&
          next.chroma === mod12(afterNext.chroma + 7)
        ) {
          continue;
        }
        const nextTarget = appliedDominantTargetFor(next, key);
        const interval = degreeInterval(nextTarget || "I");
        if (interval !== undefined && current.chroma === mod12(root + interval + 2)) {
          const slash = nextTarget && nextTarget !== "I" ? `/${nextTarget}` : "";
          setMajorContextResult(results, index, key, `IIø${slash}`, current, "Locrio", "majorContext");
          setMajorContextResult(results, index + 1, key, `V${dominantSuffixForDegree(next)}${slash}`, next, "Mixolidio", "majorContext");
          continue;
        }
      }

      if (isMinorChord(current) && next && isDominantChord(next)) {
        if (
          current.chroma === mod12(root + 5) &&
          next.chroma === mod12(root + 10) &&
          !(afterNext && isMinorChord(afterNext) && majorScaleDegreeFor(afterNext, key) === "III")
        ) {
          setMajorContextResult(results, index, key, `II${minorDegreeLabelForBluesContext(current)}bck.dr`, current, "Dórico", "majorContext");
          setMajorContextResult(results, index + 1, key, `V${dominantSuffixForDegree(next)}bck.dr`, next, "Mixolidio", "majorContext");
          continue;
        }
      }

      if (isMinorChord(current) && next && afterNext && (isDominantChord(next) || isSuspendedDominantChord(next))) {
        let nextSubTarget = subDominantTargetFor(next, key);
        const following = parsed[index + 3]?.parsed;
        if (
          nextSubTarget === "V" &&
          following &&
          isMinorChord(afterNext) &&
          isDominantChord(following) &&
          majorScaleDegreeFor(afterNext, key) === "II" &&
          majorScaleDegreeFor(following, key) === "V"
        ) {
          nextSubTarget = "V";
        }
        const interval = degreeInterval(nextSubTarget || "I");
        if (
          nextSubTarget &&
          (
            afterNext.chroma === mod12(root + interval) ||
            (
              following &&
              majorScaleDegreeFor(afterNext, key) === "II" &&
              majorScaleDegreeFor(following, key) === "V"
            )
          ) &&
          current.chroma === mod12(root + interval + 8)
        ) {
          const slash = nextSubTarget === "I" ? "" : `/${nextSubTarget}`;
          setMajorContextResult(results, index, key, `II${current.displaySuffix.replace(/^-/, "m")}sub${slash}`, current, "Dórico", "majorContext");
          setMajorContextResult(results, index + 1, key, `V${dominantSuffixForDegree(next)}sub${slash}`, next, "Lidio dominante", "majorContext");
          continue;
        }
      }

      if (isMinorChord(current) && next && isMajorChord(next)) {
        if (
          next.chroma === mod12(root + 3) &&
          current.chroma === mod12(root + 4) &&
          !/\/III\b/.test(results[index - 1]?.degree || "")
        ) {
          setMajorContextResult(results, index, key, `II${minorDegreeLabelForBluesContext(current)}`, current, "Dórico", "majorContext");
          setMajorContextResult(results, index + 1, key, `V${next.displaySuffix}sub/II`, next, "Lidio", "majorContext");
          continue;
        }
      }

      if (
        ["primaryMinorCadence", "stableMinorDegree"].includes(results[index]?.source) ||
        (results[index]?.source === "minorContext" && !hasFinalMajorSubstituteTonic(parsed, key))
      ) {
        continue;
      }

      if (current.bassChroma === mod12(current.chroma + 10) && scaleDegree === "V") {
        setMajorContextResult(results, index, key, "V/7", current, "Mixolidio", "majorContext");
        continue;
      }

      if (isHalfDiminishedChord(current)) {
        if (current.chroma === mod12(root + 6)) {
          setMajorContextResult(results, index, key, "IIø/III", current, "Locrio", "majorContext");
          continue;
        }
        if (current.chroma === mod12(root + 4)) {
          setMajorContextResult(results, index, key, "IIø/II", current, "Locrio", "majorContext");
          continue;
        }
        if (current.chroma === mod12(root + 2)) {
          setMajorContextResult(results, index, key, "IIø", current, "Locrio", "majorContext");
          continue;
        }
      }

      if (isMinorChord(current)) {
        if (scaleDegree === "II") {
          setMajorContextResult(results, index, key, `II${current.displaySuffix}`, current, "Dórico", "majorContext");
          continue;
        }
        if (scaleDegree === "III") {
          setMajorContextResult(results, index, key, `III${current.displaySuffix}`, current, "Frigio", "majorContext");
          continue;
        }
        if (current.chroma === mod12(root)) {
          setMajorContextResult(results, index, key, `II${current.displaySuffix.replace(/^-/, "m")}sub/III`, current, "Dórico", "majorContext");
          continue;
        }
      }

      if (isDominantChord(current) || isSuspendedDominantChord(current)) {
        if (target) {
          const slash = target === "I" ? "" : `/${target}`;
          setMajorContextResult(results, index, key, `V${suffix}${slash}`, current, "Mixolidio", "majorContext");
          continue;
        }

        if (subTarget) {
          const slash = subTarget === "I" ? "" : `/${subTarget}`;
          setMajorContextResult(results, index, key, `V${suffix}sub${slash}`, current, "Lidio dominante", "majorContext");
          continue;
        }
      }

      if (isMajorChord(current)) {
        const previousResult = results[index - 1];
        if (
          previousResult?.scaleType === "major" &&
          (
            candidateFor(parsed[index], previousResult.key, "major", "I") ||
            candidateFor(parsed[index], previousResult.key, "major", "IV")
          )
        ) {
          continue;
        }

        if (scaleDegree === "I" || scaleDegree === "IV") {
          setMajorContextResult(results, index, key, `${scaleDegree}${current.displaySuffix}${inversionSuffixForDegree(current)}`, current, scaleDegree === "I" ? "Jónico" : "Lidio", "majorContext");
          continue;
        }

        if (current.chroma === mod12(root + 6)) {
          setMajorContextResult(results, index, key, `I${current.displaySuffix}sub`, current, "Lidio", "majorContext");
          continue;
        }
        if (current.chroma === mod12(root + 3)) {
          setMajorContextResult(results, index, key, `V${current.displaySuffix}sub/II`, current, "Lidio", "majorContext");
          continue;
        }
        if (current.chroma === mod12(root + 8)) {
          setMajorContextResult(results, index, key, `V${current.displaySuffix}sub/V`, current, "Lidio", "majorContext");
          continue;
        }
        if (current.chroma === mod12(root + 1)) {
          setMajorContextResult(results, index, key, `V${current.displaySuffix}sub`, current, "Lidio", "majorContext");
        }
      }
    }

    return results;
  }

  function isStableMajorTonicBeforeCadence(parsed, results, index) {
    const current = parsed[index]?.parsed;
    const result = results[index];
    const next = parsed[index + 1]?.parsed;
    const afterNext = parsed[index + 2]?.parsed;
    if (!current || !result || !next || !afterNext) return false;
    if (!isMajorChord(current) || !isDominantChord(next) || !isMajorChord(afterNext)) return false;
    if (result.scaleType !== "major" || degreeBase(result.degree) !== "I") return false;
    if (result.key !== current.root) return false;
    return next.chroma === mod12(afterNext.chroma + 7);
  }

  function applyCircularMajorCadences(parsed, results) {
    if (parsed.length < 3) return results;

    const first = parsed[0]?.parsed;
    const ii = parsed[parsed.length - 2]?.parsed;
    const dominant = parsed[parsed.length - 1]?.parsed;
    if (!first || !ii || !dominant) return results;
    if (!isMajorChord(first) || !isMinorSeventhChord(ii) || !isDominantChord(dominant)) return results;

    const key = first.root;
    const root = keyChroma(key);
    if (root === undefined) return results;
    if (ii.chroma !== mod12(root + 2) || dominant.chroma !== mod12(root + 7)) return results;

    const iiIndex = parsed.length - 2;
    const dominantIndex = parsed.length - 1;
    const startsSection = startsSectionAt(results, iiIndex, key, "major");
    results[iiIndex] = {
      ...directContextResult(key, "major", `II${ii.displaySuffix}`, ii, "Dórico"),
      source: "circularMajorCadence",
      sectionStart: startsSection,
      sectionLabel: startsSection ? sectionLabel({ key, scaleType: "major" }) : ""
    };
    const dominantDegree = `V${dominantSuffixForDegree(dominant)}`;
    results[dominantIndex] = {
      ...directContextResult(key, "major", dominantDegree, dominant, modeForDominantQuality(dominant, "Mixolidio", dominantDegree, null)),
      source: "circularMajorCadence",
      sectionStart: false,
      sectionLabel: ""
    };

    return results;
  }

  function applyDominantCycleBridge(parsed, results) {
    let index = 0;

    while (index < parsed.length) {
      const current = parsed[index]?.parsed;
      if (!(isDominantChord(current) || isSuspendedDominantChord(current))) {
        index += 1;
        continue;
      }

      const groups = [];
      let cursor = index;
      while (cursor < parsed.length) {
        const dominant = parsed[cursor]?.parsed;
        if (!(isDominantChord(dominant) || isSuspendedDominantChord(dominant))) break;

        const previousGroup = groups[groups.length - 1];
        if (!previousGroup) {
          groups.push({ chroma: dominant.chroma, roots: [dominant.root], indexes: [cursor] });
          cursor += 1;
          continue;
        }

        if (dominant.chroma === previousGroup.chroma) {
          previousGroup.indexes.push(cursor);
          previousGroup.roots.push(dominant.root);
          cursor += 1;
          continue;
        }

        if (mod12(dominant.chroma - previousGroup.chroma) !== 5) break;

        groups.push({ chroma: dominant.chroma, roots: [dominant.root], indexes: [cursor] });
        cursor += 1;
      }

      if (groups.length >= 4) {
        groups.forEach(group => {
          const key = keyNameForChromaPreference(group.chroma + 5, group.roots);
          group.indexes.forEach((dominantIndex, order) => {
            const dominant = parsed[dominantIndex]?.parsed;
            if (!dominant || !key) return;
            const degree = `V${dominantSuffixForDegree(dominant)}`;
            const startsSection = order === 0 && startsSectionAt(results, dominantIndex, key, "major");
            results[dominantIndex] = {
              ...directContextResult(
                key,
                "major",
                degree,
                dominant,
                modeForDominantQuality(dominant, "Mixolidio", degree, null)
              ),
              source: "dominantCycleBridge",
              sectionStart: startsSection,
              sectionLabel: startsSection ? sectionLabel({ key, scaleType: "major" }) : ""
            };
          });
        });
      }

      index = Math.max(cursor, index + 1);
    }

    return results;
  }

  function applyTwoFiveCycleBridge(parsed, results) {
    let index = 0;

    while (index < parsed.length - 1) {
      const pairs = [];
      let cursor = index;

      while (cursor < parsed.length - 1) {
        const ii = parsed[cursor]?.parsed;
        const dominant = parsed[cursor + 1]?.parsed;
        if (!isMinorSeventhChord(ii) || !(isDominantChord(dominant) || isSuspendedDominantChord(dominant))) break;
        if (mod12(dominant.chroma - ii.chroma) !== 5) break;

        const previousPair = pairs[pairs.length - 1];
        if (previousPair && mod12(dominant.chroma - previousPair.dominant.chroma) !== 5) break;

        pairs.push({ ii, dominant, iiIndex: cursor, dominantIndex: cursor + 1 });
        cursor += 2;
      }

      if (pairs.length >= 3) {
        pairs.forEach(pair => {
          const key = keyNameForChromaPreference(pair.dominant.chroma + 5, [pair.ii.root, pair.dominant.root]);
          if (!key) return;
          const startsSection = startsSectionAt(results, pair.iiIndex, key, "major");
          results[pair.iiIndex] = {
            ...directContextResult(key, "major", `II${pair.ii.displaySuffix}`, pair.ii, "Dórico"),
            source: "twoFiveCycleBridge",
            sectionStart: startsSection,
            sectionLabel: startsSection ? sectionLabel({ key, scaleType: "major" }) : ""
          };
          const dominantDegree = `V${dominantSuffixForDegree(pair.dominant)}`;
          results[pair.dominantIndex] = {
            ...directContextResult(
              key,
              "major",
              dominantDegree,
              pair.dominant,
              modeForDominantQuality(pair.dominant, "Mixolidio", dominantDegree, null)
            ),
            source: "twoFiveCycleBridge",
            sectionStart: false,
            sectionLabel: ""
          };
        });
      }

      index = Math.max(cursor, index + 1);
    }

    return results;
  }

  function dimPassingInfoInMajor(parsedChord, key, nextChord) {
    if (!isDiminishedChord(parsedChord) || !key || !nextChord) return null;
    const targetDegree = majorScaleDegreeFor(nextChord, key);
    if (!targetDegree) return null;
    if (parsedChord.chroma === mod12(nextChord.chroma - 1)) {
      const minorTarget = isMinorChord(nextChord);
      return {
        degree: `${minorTarget ? "#VII" : "VII"}${parsedChord.displaySuffix}/${targetDegree}`,
        originKey: nextChord.root,
        originScaleType: minorTarget ? "harmonicMinor" : "harmonicMajor"
      };
    }
    if (parsedChord.chroma === mod12(nextChord.chroma + 1)) {
      if (targetDegree !== "II") return null;
      return {
        degree: `bII${parsedChord.displaySuffix}/${targetDegree}`
      };
    }
    return null;
  }

  function applyDescendingDiminishedContexts(parsed, results) {
    for (let index = 0; index < parsed.length - 1; index++) {
      const current = parsed[index]?.parsed;
      const next = parsed[index + 1]?.parsed;
      if (!isDiminishedChord(current) || !next) continue;
      if (current.chroma !== mod12(next.chroma + 1)) continue;

      const previous = parsed[index - 1]?.parsed;
      const majorKey = keyNameForChromaPreference(next.chroma - 2, [next.root]);
      const minorKey = keyNameForChromaPreference(next.chroma - 5, [next.root]);
      const nearbyMajorKey = nearbyMajorContextKey(results, index, new Set([index, index + 1]));
      const nearbyMinorKey = nearbyMinorContextKey(results, index);
      const previousSuggestsMinorKey = !!(
        previous &&
        isMinorChord(previous) &&
        previous.chroma === keyChroma(minorKey)
      );
      let key = "";
      let scaleType = "";
      let degree = "";

      if ((nearbyMinorKey === minorKey || previousSuggestsMinorKey) && isMinorChord(next)) {
        key = minorKey;
        scaleType = "harmonicMinor";
        degree = `bII${current.displaySuffix}/IV`;
      } else if (nearbyMajorKey === majorKey) {
        key = majorKey;
        scaleType = "major";
        degree = `bII${current.displaySuffix}/II`;
      } else {
        continue;
      }

      results[index] = {
        ...directContextResult(key, scaleType, degree, current, "Disminuida"),
        source: "descendingDiminished",
        sectionStart: startsSectionAt(results, index, key, scaleType),
        sectionLabel: startsSectionAt(results, index, key, scaleType)
          ? sectionLabel({ key, scaleType })
          : ""
      };

      if (previousSuggestsMinorKey && index > 0) {
        const previousResult = analyzeChordInMinorContext(previous, key, "harmonicMinor");
        if (previousResult && degreeBase(previousResult.degree) === "I") {
          const startsPreviousSection = startsSectionAt(results, index - 1, key, "harmonicMinor");
          results[index - 1] = {
            ...previousResult,
            source: "descendingDiminishedContext",
            sectionStart: startsPreviousSection,
            sectionLabel: startsPreviousSection ? sectionLabel(previousResult) : ""
          };
          results[index].sectionStart = false;
          results[index].sectionLabel = "";
        }
      }

      const nextResult = scaleType === "major"
        ? analyzeChordInMajorContext(next, key)
        : analyzeChordInMinorContext(next, key, "harmonicMinor");
      if (
        nextResult &&
        !["twoFiveCycleBridge", "dominantCycleBridge"].includes(results[index + 1]?.source || "")
      ) {
        results[index + 1] = {
          ...nextResult,
          source: "descendingDiminishedTarget",
          sectionStart: false,
          sectionLabel: ""
        };
      }
    }

    return results;
  }

  function applyMajorPassingDiminished(parsed, results) {
    for (let index = 0; index < parsed.length; index++) {
      const current = parsed[index]?.parsed;
      const next = parsed[index + 1]?.parsed;
      if (!isDiminishedChord(current) || !next) continue;

      const key = nearbyMajorContextKey(results, index, new Set([index]));
      const dimInfo = dimPassingInfoInMajor(current, key, next);
      if (!dimInfo?.degree) continue;

      results[index] = {
        ...directContextResult(key, "major", dimInfo.degree, current, "Disminuida"),
        originKey: dimInfo.originKey,
        originScaleType: dimInfo.originScaleType,
        source: "majorPassingDiminished",
        sectionStart: false,
        sectionLabel: ""
      };

      const nextMajorResult = analyzeChordInMajorContext(next, key);
      if (
        nextMajorResult &&
        !["twoFiveCycleBridge", "dominantCycleBridge"].includes(results[index + 1]?.source || "")
      ) {
        results[index + 1] = {
          ...nextMajorResult,
          source: "majorPassingDiminishedTarget",
          sectionStart: false,
          sectionLabel: ""
        };
      }
    }

    return results;
  }

  function applyMajorFlatSevenDominants(parsed, results) {
    for (let index = 0; index < parsed.length; index++) {
      const current = parsed[index]?.parsed;
      if (!(isDominantChord(current) || isSuspendedDominantChord(current))) continue;

      const key = nearbyMajorContextKey(results, index, new Set([index]));
      const root = keyChroma(key);
      if (root === undefined || current.chroma !== mod12(root + 10)) continue;

      const previous = parsed[index - 1]?.parsed;
      if (previous && isMinorChord(previous) && previous.chroma === mod12(root + 5)) continue;

      const degree = `bVII${dominantSuffixForDegree(current)}`;
      results[index] = {
        ...directContextResult(
          key,
          "major",
          degree,
          current,
          modeForDominantQuality(current, "Lidio dominante", degree, null)
        ),
        source: "intercambio modal",
        sectionStart: false,
        sectionLabel: ""
      };
    }

    return results;
  }

  function applyPrimaryMinorCadences(parsed, results) {
    for (let index = 0; index < parsed.length - 2; index++) {
      const ii = parsed[index].parsed;
      const v = parsed[index + 1].parsed;
      const tonic = parsed[index + 2].parsed;
      if (!ii || !v || !tonic) continue;
      if (!isHalfDiminishedChord(ii) || !isDominantChord(v) || !isMinorChord(tonic)) continue;
      if (
        parsed[index - 1]?.chord !== "%" &&
        results[index - 1]?.scaleType === "major" &&
        /^I(?!I|V)/.test(results[index - 1].degree || "") &&
        !(
          parsed[index + 3]?.parsed &&
          parsed[index + 3].parsed.chroma === tonic.chroma &&
          isMinorChord(parsed[index + 3].parsed)
        )
      ) {
        continue;
      }

      const tonicCandidates = parsed[index + 2].candidates.filter(candidate =>
        candidate.scaleType === "harmonicMinor" &&
        degreeBase(candidate.degree) === "I"
      );

      tonicCandidates.forEach(tonicCandidate => {
        const root = keyChroma(tonicCandidate.key);
        if (ii.chroma !== mod12(root + 2)) return;
        if (v.chroma !== mod12(root + 7)) return;

        const iiCandidate = candidateFor(parsed[index], tonicCandidate.key, "harmonicMinor", "II");
        const vCandidate = candidateFor(parsed[index + 1], tonicCandidate.key, "harmonicMinor", "V");
        if (!iiCandidate || !vCandidate) return;

        const startsSection = startsSectionAt(results, index, tonicCandidate.key, "harmonicMinor");
        applyCandidateResult(results, index, iiCandidate, startsSection);
        results[index].degree = "IIø";
        results[index].source = "primaryMinorCadence";
        applyCandidateResult(results, index + 1, vCandidate, false);
        results[index + 1].source = "primaryMinorCadence";
        applyCandidateResult(results, index + 2, tonicCandidate, false);
        results[index].source = "primaryMinorCadence";
        results[index + 1].source = "primaryMinorCadence";
        results[index + 2].source = "primaryMinorCadence";

        const nextTonic = parsed[index + 3];
        if (!nextTonic?.parsed || nextTonic.parsed.chroma !== root || !isMinorChord(nextTonic.parsed)) return;
        const nextCandidate = candidateFor(nextTonic, tonicCandidate.key, "harmonicMinor", "I");
        if (nextCandidate) {
          applyCandidateResult(results, index + 3, nextCandidate, false);
          results[index + 3].source = "primaryMinorCadence";
        }
      });
    }

    return results;
  }

  function appliedTargetCandidates(targetItem, contextKey) {
    const allowedDegrees = new Set(["II", "III", "IV", "V", "VI"]);

    return targetItem.candidates
      .filter(candidate => {
        if (candidate.scaleType !== "major") return false;
        if (candidate.source) return false;
        return allowedDegrees.has(degreeBase(candidate.degree));
      })
      .sort((a, b) => {
        if (contextKey && a.key !== b.key) return a.key === contextKey ? -1 : 1;
        if (a.key !== b.key) {
          if (a.key === "C") return -1;
          if (b.key === "C") return 1;
        }
        return compareCandidates(a, b);
      });
  }

  function nearbyMajorContextKey(results, index, excludedIndexes) {
    for (let distance = 1; distance <= 4; distance++) {
      const leftIndex = index - distance;
      const rightIndex = index + distance;
      const left = excludedIndexes.has(leftIndex) ? null : results[leftIndex];
      const right = excludedIndexes.has(rightIndex) ? null : results[rightIndex];
      if (left?.scaleType === "major" && /^I(?!I|V)/.test(left.degree || "")) return left.key;
      if (right?.scaleType === "major" && /^I(?!I|V)/.test(right.degree || "")) return right.key;
    }

    for (let distance = 1; distance <= 4; distance++) {
      const leftIndex = index - distance;
      const rightIndex = index + distance;
      const left = excludedIndexes.has(leftIndex) ? null : results[leftIndex];
      const right = excludedIndexes.has(rightIndex) ? null : results[rightIndex];
      if (left?.scaleType === "major") return left.key;
      if (right?.scaleType === "major") return right.key;
    }

    return "";
  }

  function isPrimaryTonicCadence(results, dominantIndex, targetIndex) {
    const dominant = results[dominantIndex];
    const target = results[targetIndex];
    return Boolean(
      dominant?.scaleType &&
      target?.scaleType &&
      dominant.key === target.key &&
      /^V/.test(dominant.degree || "") &&
      /^I(?!I|V)/.test(target.degree || "")
    );
  }

  function secondaryDominantFor(parsedChord, targetItem, results, dominantIndex, targetIndex) {
    if (!isDominantChord(parsedChord)) return null;
    const contextKey = nearbyMajorContextKey(results, targetIndex, new Set([dominantIndex, targetIndex]));
    if (
      isPrimaryTonicCadence(results, dominantIndex, targetIndex) &&
      (!contextKey || results[targetIndex]?.source === "primaryMinorCadence")
    ) {
      return null;
    }

    const candidates = appliedTargetCandidates(targetItem, contextKey)
      .filter(candidate => !contextKey || candidate.key === contextKey);
    if (!contextKey) return null;
    return candidates.find(candidate => mod12(targetItem.parsed.chroma + 7) === parsedChord.chroma) || null;
  }

  function appliedDominantDegree(parsedChord, targetDegree) {
    return `V${parsedChord.displaySuffix}/${targetDegree}`;
  }

  function appliedIiDegree(parsedChord, targetDegree) {
    if (isHalfDiminishedChord(parsedChord)) return `IIø/${targetDegree}`;
    return `II${parsedChord.displaySuffix}/${targetDegree}`;
  }

  function appliedIiMode(parsedChord) {
    if (isHalfDiminishedChord(parsedChord)) return "Locrio";
    if (isMinorChord(parsedChord)) return "Dórico";
    return "";
  }

  function startsAppliedSection(results, index, targetCandidate) {
    const previous = results[index - 1];
    return !previous || previous.key !== targetCandidate.key || previous.scaleType !== targetCandidate.scaleType;
  }

  function nearbyMinorContextKey(results, index) {
    for (let distance = 0; distance <= 12; distance++) {
      const left = results[index - distance];
      if (left?.scaleType === "harmonicMinor" && /^I/.test(left.degree || "")) return left.key;
    }

    for (let distance = 0; distance <= 6; distance++) {
      const left = results[index - distance];
      const right = results[index + distance];
      if (right?.source === "primaryMinorCadence" && /^I/.test(right.degree || "")) return right.key;
    }

    for (let distance = 0; distance <= 12; distance++) {
      const left = results[index - distance];
      if (left?.scaleType === "harmonicMinor") return left.key;
    }

    for (let distance = 0; distance <= 6; distance++) {
      const right = results[index + distance];
      if (right?.source === "primaryMinorCadence") return right.key;
    }

    return "";
  }

  function minorContextCandidate(key, degree, parsedChord) {
    return {
      key,
      scaleType: "harmonicMinor",
      scaleLabel: "menor armónica",
      degree,
      mode: "",
      chord: parsedChord.input
    };
  }

  function setMinorContextResult(results, index, key, degree, parsedChord, mode) {
    const startsSection = startsSectionAt(results, index, key, "harmonicMinor");
    results[index] = {
      ...minorContextCandidate(key, degree, parsedChord),
      mode: mode || "",
      source: "minorContext",
      sectionStart: startsSection,
      sectionLabel: startsSection ? sectionLabel({
        key,
        scaleType: "harmonicMinor",
        scaleLabel: "menor armónica"
      }) : ""
    };
  }

  function previousMinorTonicKey(results, index, maxDistance = 8) {
    for (let distance = 1; distance <= maxDistance; distance++) {
      const previous = results[index - distance];
      if (!previous?.key) continue;
      if (visibleSectionScaleType(previous.scaleType) !== "minor") continue;
      if (/^I(?!I|V)/.test(previous.degree || "")) return previous.key;
    }
    return "";
  }

  function applyMinorSubdominantRegionFunctions(parsed, results) {
    for (let index = 0; index < parsed.length; index++) {
      const key = previousMinorTonicKey(results, index);
      const current = parsed[index]?.parsed;
      if (!key || !current) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;

      const next = parsed[index + 1]?.parsed;
      const afterNext = parsed[index + 2]?.parsed;
      const startsMajorTwoFive = Boolean(
        next &&
        afterNext &&
        isMinorChord(current) &&
        isDominantChord(next) &&
        isMajorChord(afterNext) &&
        next.chroma === mod12(current.chroma + 5) &&
        afterNext.chroma === mod12(next.chroma + 5)
      );
      if (startsMajorTwoFive) continue;

      if (isMinorChord(current) && current.chroma === mod12(root + 5)) {
        setMinorContextResult(results, index, key, `IV${current.displaySuffix}`, current, "Dórico #4");
      }
    }

    for (let index = 0; index < parsed.length - 2; index++) {
      const current = parsed[index]?.parsed;
      const dominant = parsed[index + 1]?.parsed;
      const targetDominant = parsed[index + 2]?.parsed;
      const tonic = parsed[index + 3]?.parsed;
      const key = previousMinorTonicKey(results, index) || (tonic && isMinorChord(tonic) ? tonic.root : "");
      if (!key || !current || !dominant || !targetDominant) continue;
      if (!isHalfDiminishedChord(current)) continue;
      if (!isDominantChord(dominant) || !isDominantChord(targetDominant)) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;
      if (current.chroma !== mod12(root + 9)) continue;
      if (dominant.chroma !== mod12(root + 2)) continue;
      if (targetDominant.chroma !== mod12(root + 7)) continue;
      if (tonic && (tonic.chroma !== root || !isMinorChord(tonic))) continue;

      const previous = parsed[index - 1]?.parsed;
      if (previous && isMinorChord(previous) && previous.chroma === root) {
        setMinorContextResult(
          results,
          index - 1,
          key,
          `I${previous.displaySuffix}${inversionSuffixForDegree(previous)}`,
          previous,
          /^m6|^m69/.test(previous.suffix || "") ? "Dórico #7" : "Eólico"
        );
      }

      setMinorContextResult(results, index, key, "IIø/V", current, "Locrio #6");

      const dominantDegree = `V${dominantSuffixForDegree(dominant)}/V`;
      setMinorContextResult(
        results,
        index + 1,
        key,
        dominantDegree,
        dominant,
        modeForDominantQuality(dominant, "Mixolidio", dominantDegree, targetDominant)
      );
      results[index + 1].originKey = keyNameForChromaPreference(root + 7, [targetDominant.root, dominant.root]);
      results[index + 1].originScaleType = "harmonicMajor";

      const targetDegree = `V${dominantSuffixForDegree(targetDominant)}`;
      setMinorContextResult(
        results,
        index + 2,
        key,
        targetDegree,
        targetDominant,
        modeForDominantQuality(targetDominant, "Mixo b2b6", targetDegree, tonic || null)
      );
    }

    for (let index = 0; index < parsed.length - 2; index++) {
      const current = parsed[index]?.parsed;
      const targetDominant = parsed[index + 1]?.parsed;
      const tonic = parsed[index + 2]?.parsed;
      const inferredKey = tonic && isMinorChord(tonic) && /^m6|^m69/.test(tonic.suffix || "") ? tonic.root : "";
      const key = previousMinorTonicKey(results, index) || inferredKey;
      if (!key || !current || !targetDominant || !tonic) continue;
      if (!isDominantChord(current) || !isDominantChord(targetDominant)) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;
      if (current.chroma !== mod12(root + 2)) continue;
      if (targetDominant.chroma !== mod12(root + 7)) continue;
      if (tonic.chroma !== root || !isMinorChord(tonic)) continue;

      const previous = parsed[index - 1]?.parsed;
      if (previous && isMinorChord(previous) && previous.chroma === root) {
        setMinorContextResult(
          results,
          index - 1,
          key,
          `I${previous.displaySuffix}${inversionSuffixForDegree(previous)}`,
          previous,
          /^m6|^m69/.test(previous.suffix || "") ? "Dórico #7" : "Eólico"
        );
      }

      const dominantDegree = `V${dominantSuffixForDegree(current)}/V`;
      setMinorContextResult(
        results,
        index,
        key,
        dominantDegree,
        current,
        modeForDominantQuality(current, "Mixolidio", dominantDegree, targetDominant)
      );
      results[index].originKey = keyNameForChromaPreference(root + 7, [targetDominant.root, current.root]);
      results[index].originScaleType = "harmonicMajor";

      const targetDegree = `V${dominantSuffixForDegree(targetDominant)}`;
      setMinorContextResult(
        results,
        index + 1,
        key,
        targetDegree,
        targetDominant,
        modeForDominantQuality(targetDominant, "Mixo b2b6", targetDegree, tonic)
      );
      setMinorContextResult(
        results,
        index + 2,
        key,
        `I${tonic.displaySuffix}${inversionSuffixForDegree(tonic)}`,
        tonic,
        /^m6|^m69/.test(tonic.suffix || "") ? "Dórico #7" : "Eólico"
      );
    }

    for (let index = 0; index < parsed.length - 3; index++) {
      const current = parsed[index]?.parsed;
      const subDominant = parsed[index + 1]?.parsed;
      const targetDominant = parsed[index + 2]?.parsed;
      const tonic = parsed[index + 3]?.parsed;
      const inferredKey = tonic && isMinorChord(tonic) && /^m6|^m69/.test(tonic.suffix || "") ? tonic.root : "";
      const key = previousMinorTonicKey(results, index) || inferredKey;
      if (!key || !current || !subDominant || !targetDominant || !tonic) continue;
      if (!isDominantChord(current) || !isDominantChord(subDominant) || !isDominantChord(targetDominant)) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;
      if (current.chroma !== mod12(root + 2)) continue;
      if (subDominant.chroma !== mod12(root + 8)) continue;
      if (targetDominant.chroma !== mod12(root + 7)) continue;
      if (tonic.chroma !== root || !isMinorChord(tonic)) continue;

      const previous = parsed[index - 1]?.parsed;
      if (previous && isMinorChord(previous) && previous.chroma === root) {
        setMinorContextResult(
          results,
          index - 1,
          key,
          `I${previous.displaySuffix}${inversionSuffixForDegree(previous)}`,
          previous,
          /^m6|^m69/.test(previous.suffix || "") ? "Dórico #7" : "Eólico"
        );
      }

      const appliedDegree = `V${dominantSuffixForDegree(current)}/V`;
      setMinorContextResult(
        results,
        index,
        key,
        appliedDegree,
        current,
        modeForDominantQuality(current, "Mixolidio", appliedDegree, targetDominant)
      );
      results[index].originKey = keyNameForChromaPreference(root + 7, [targetDominant.root, current.root]);
      results[index].originScaleType = "harmonicMajor";

      const subDegree = "Vsub/V";
      setMinorContextResult(
        results,
        index + 1,
        key,
        subDegree,
        subDominant,
        modeForDominantQuality(subDominant, "Mixolidio", "", targetDominant)
      );
      results[index + 1].originKey = keyNameForChromaPreference(subDominant.chroma + 5, [subDominant.root]);
      results[index + 1].originScaleType = "harmonicMajor";

      const targetDegree = `V${dominantSuffixForDegree(targetDominant)}`;
      setMinorContextResult(
        results,
        index + 2,
        key,
        targetDegree,
        targetDominant,
        modeForDominantQuality(targetDominant, "Mixo b2b6", targetDegree, tonic)
      );
      setMinorContextResult(
        results,
        index + 3,
        key,
        `I${tonic.displaySuffix}${inversionSuffixForDegree(tonic)}`,
        tonic,
        /^m6|^m69/.test(tonic.suffix || "") ? "Dórico #7" : "Eólico"
      );
    }

    for (let index = 0; index < parsed.length - 1; index++) {
      const key = previousMinorTonicKey(results, index);
      const current = parsed[index]?.parsed;
      const target = parsed[index + 1]?.parsed;
      if (!key || !current || !target) continue;
      if (!isDominantChord(current) || !isMinorChord(target)) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;
      if (current.chroma !== root || target.chroma !== mod12(root + 5)) continue;

      const degree = `V${dominantSuffixForDegree(current)}/IV`;
      setMinorContextResult(
        results,
        index,
        key,
        degree,
        current,
        modeForDominantQuality(current, "Mixo b2b6", degree, target)
      );
      setMinorContextResult(results, index + 1, key, `IV${target.displaySuffix}`, target, "Dórico #4");
    }

    for (let index = 0; index < parsed.length - 1; index++) {
      const current = parsed[index]?.parsed;
      const target = parsed[index + 1]?.parsed;
      const followingDominant = parsed[index + 2]?.parsed;
      const followingTonic = parsed[index + 3]?.parsed;
      const inferredKey = followingDominant && followingTonic && isDominantChord(followingDominant) && isMinorChord(followingTonic)
        ? followingTonic.root
        : "";
      const key = previousMinorTonicKey(results, index) || inferredKey;
      if (!key || !current || !target) continue;
      if (!isDominantChord(current) || !isHalfDiminishedChord(target)) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;
      if (current.chroma !== root || target.chroma !== mod12(root + 2)) continue;
      if (followingDominant && followingDominant.chroma !== mod12(root + 7)) continue;

      const previous = parsed[index - 1]?.parsed;
      if (previous && isMinorChord(previous) && previous.chroma === root) {
        setMinorContextResult(
          results,
          index - 1,
          key,
          `I${previous.displaySuffix}${inversionSuffixForDegree(previous)}`,
          previous,
          /^m6|^m69/.test(previous.suffix || "") ? "Dórico #7" : "Eólico"
        );
      }

      const degree = `V${dominantSuffixForDegree(current)}/IV`;
      setMinorContextResult(
        results,
        index,
        key,
        degree,
        current,
        modeForDominantQuality(current, "Mixo b2b6", degree, {
          chroma: mod12(root + 5),
          root: keyNameForChromaPreference(root + 5, [target.root, current.root]),
          suffix: "m7"
        })
      );
      results[index].originKey = keyNameForChromaPreference(root + 5, [target.root, current.root]);
      results[index].originScaleType = "harmonicMinor";
    }

    for (let index = 0; index < parsed.length - 2; index++) {
      const key = previousMinorTonicKey(results, index);
      const current = parsed[index]?.parsed;
      const dominant = parsed[index + 1]?.parsed;
      const target = parsed[index + 2]?.parsed;
      if (!key || !current || !dominant || !target) continue;
      if (!isDominantChord(dominant) || !isMinorChord(target)) continue;
      if (!isHalfDiminishedChord(current) && !isMinorChord(current)) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;
      if (current.chroma !== mod12(root + 7)) continue;
      if (dominant.chroma !== root) continue;
      if (target.chroma !== mod12(root + 5)) continue;

      setMinorContextResult(
        results,
        index,
        key,
        isHalfDiminishedChord(current) ? "IIø/IV" : `II${current.displaySuffix}/IV`,
        current,
        isHalfDiminishedChord(current) ? "Locrio #6" : "Dórico"
      );
    }

    return results;
  }

  function scorePredominantMinorKey(parsed, results, key) {
    const root = keyChroma(key);
    if (root === undefined) return 0;

    let score = 0;
    parsed.forEach((item, index) => {
      const chord = item.parsed;
      const result = results[index];
      if (!chord) return;

      if (visibleSectionScaleType(result?.scaleType) === "minor" && result?.key === key) {
        score += 1;
        if (/^I(?!I|V)/.test(result.degree || "")) score += 5;
        if (result.source === "primaryMinorCadence") score += 4;
        if (result.source === "stableMinorDegree") score += 2;
      }

      if (isMinorChord(chord) && chord.chroma === root) {
        score += /^m6|^m69/.test(chord.suffix || "") ? 8 : 4;
        if (index === 0) score += 10;
      }
      if (isMinorChord(chord) && chord.chroma === mod12(root + 5)) score += 4;
      if (isHalfDiminishedChord(chord) && chord.chroma === mod12(root + 2)) score += 3;
      if (isHalfDiminishedChord(chord) && chord.chroma === mod12(root + 9)) score += 2;
      if (isDominantChord(chord) && chord.chroma === mod12(root + 7)) score += 4;
      if (isDominantChord(chord) && chord.chroma === mod12(root + 2)) score += 3;

      const next = parsed[index + 1]?.parsed;
      const afterNext = parsed[index + 2]?.parsed;
      if (isHalfDiminishedChord(chord) && next && afterNext) {
        if (
          chord.chroma === mod12(root + 2) &&
          isDominantChord(next) &&
          next.chroma === mod12(root + 7) &&
          isMinorChord(afterNext) &&
          afterNext.chroma === root
        ) {
          score += 10;
        }
        if (
          chord.chroma === mod12(root + 9) &&
          isDominantChord(next) &&
          next.chroma === mod12(root + 2) &&
          isDominantChord(afterNext) &&
          afterNext.chroma === mod12(root + 7)
        ) {
          score += 8;
        }
      }
      if (
        isDominantChord(chord) &&
        next &&
        isDominantChord(next) &&
        afterNext &&
        isMinorChord(afterNext) &&
        chord.chroma === mod12(root + 2) &&
        next.chroma === mod12(root + 7) &&
        afterNext.chroma === root
      ) {
        score += 9;
      }
      const thirdNext = parsed[index + 3]?.parsed;
      if (
        isDominantChord(chord) &&
        next &&
        isDominantChord(next) &&
        afterNext &&
        isDominantChord(afterNext) &&
        thirdNext &&
        isMinorChord(thirdNext) &&
        chord.chroma === mod12(root + 2) &&
        next.chroma === mod12(root + 8) &&
        afterNext.chroma === mod12(root + 7) &&
        thirdNext.chroma === root
      ) {
        score += 12;
      }
    });

    return score;
  }

  function inferPredominantMinorKey(parsed, results) {
    if (parsed.filter(item => item.parsed).length < 4) return "";
    if (hasLongMajorTwoFiveChain(parsed)) return "";

    const ranked = KEYS
      .map(([key]) => ({ key, score: scorePredominantMinorKey(parsed, results, key) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const next = ranked[1];
    if (!best || best.score < 18) return "";
    if (!hasStrongMinorTonicEvidence(parsed, results, best.key)) return "";
    if (next && best.score < next.score + 6) return "";
    return best.key;
  }

  function hasStrongMinorTonicEvidence(parsed, results, key) {
    const root = keyChroma(key);
    if (root === undefined) return false;

    return parsed.some((item, index) => {
      const chord = item.parsed;
      const result = results[index];
      if (!chord) return false;
      if (
        isMinorChord(chord) &&
        chord.chroma === root &&
        (/^m6|^m69|^m∆|^mmaj/.test(chord.suffix || "") || /^I(?!I|V)/.test(result?.degree || ""))
      ) {
        return true;
      }
      return result?.key === key &&
        visibleSectionScaleType(result.scaleType) === "minor" &&
        result.source === "primaryMinorCadence" &&
        /^I(?!I|V)/.test(result.degree || "");
    });
  }

  function hasLongMajorTwoFiveChain(parsed) {
    let pairs = 0;
    let longestRun = 0;
    let currentRun = 0;

    for (let index = 0; index < parsed.length - 1; index += 2) {
      const current = parsed[index]?.parsed;
      const next = parsed[index + 1]?.parsed;
      const isPair = Boolean(
        current &&
        next &&
        isMinorChord(current) &&
        !isHalfDiminishedChord(current) &&
        isDominantChord(next) &&
        next.chroma === mod12(current.chroma + 5)
      );

      if (isPair) {
        pairs += 1;
        currentRun += 1;
        longestRun = Math.max(longestRun, currentRun);
      } else {
        currentRun = 0;
      }
    }

    return pairs >= 3 && longestRun >= 3;
  }

  function setMinorTonicResult(results, index, key, parsedChord) {
    setMinorContextResult(
      results,
      index,
      key,
      `I${parsedChord.displaySuffix}${inversionSuffixForDegree(parsedChord)}`,
      parsedChord,
      /^m6|^m69/.test(parsedChord.suffix || "") ? "Dórico #7" : "Eólico"
    );
  }

  function setNearbyMinorSetup(results, parsed, index, key, root) {
    for (let offset = 1; offset <= 2; offset++) {
      const targetIndex = index - offset;
      const previous = parsed[targetIndex]?.parsed;
      if (!previous || !isMinorChord(previous)) continue;
      if (previous.chroma === root) {
        setMinorTonicResult(results, targetIndex, key, previous);
      }
      if (previous.chroma === mod12(root + 5)) {
        setMinorContextResult(
          results,
          targetIndex,
          key,
          `IV${previous.displaySuffix}${inversionSuffixForDegree(previous)}`,
          previous,
          "Dórico #4"
        );
      }
    }
  }

  function applyGlobalMinorContextTieBreaks(parsed, results) {
    const key = inferPredominantMinorKey(parsed, results);
    if (!key) return results;

    const root = keyChroma(key);
    if (root === undefined) return results;

    for (let index = 0; index < parsed.length - 2; index++) {
      const current = parsed[index]?.parsed;
      const targetDominant = parsed[index + 1]?.parsed;
      const tonic = parsed[index + 2]?.parsed;
      if (!current || !targetDominant || !tonic) continue;
      if (!isDominantChord(current) || !isDominantChord(targetDominant) || !isMinorChord(tonic)) continue;
      if (current.chroma !== mod12(root + 2)) continue;
      if (targetDominant.chroma !== mod12(root + 7)) continue;
      if (tonic.chroma !== root) continue;

      setNearbyMinorSetup(results, parsed, index, key, root);

      const dominantDegree = `V${dominantSuffixForDegree(current)}/V`;
      setMinorContextResult(
        results,
        index,
        key,
        dominantDegree,
        current,
        modeForDominantQuality(current, "Mixolidio", dominantDegree, targetDominant)
      );
      results[index].originKey = keyNameForChromaPreference(root + 7, [targetDominant.root, current.root]);
      results[index].originScaleType = "harmonicMajor";

      const targetDegree = `V${dominantSuffixForDegree(targetDominant)}`;
      setMinorContextResult(
        results,
        index + 1,
        key,
        targetDegree,
        targetDominant,
        modeForDominantQuality(targetDominant, "Mixo b2b6", targetDegree, tonic)
      );
      setMinorTonicResult(results, index + 2, key, tonic);
    }

    for (let index = 0; index < parsed.length - 3; index++) {
      const current = parsed[index]?.parsed;
      const subDominant = parsed[index + 1]?.parsed;
      const targetDominant = parsed[index + 2]?.parsed;
      const tonic = parsed[index + 3]?.parsed;
      if (!current || !subDominant || !targetDominant || !tonic) continue;
      if (!isDominantChord(current) || !isDominantChord(subDominant) || !isDominantChord(targetDominant) || !isMinorChord(tonic)) continue;
      if (current.chroma !== mod12(root + 2)) continue;
      if (subDominant.chroma !== mod12(root + 8)) continue;
      if (targetDominant.chroma !== mod12(root + 7)) continue;
      if (tonic.chroma !== root) continue;

      setNearbyMinorSetup(results, parsed, index, key, root);

      const appliedDegree = `V${dominantSuffixForDegree(current)}/V`;
      setMinorContextResult(
        results,
        index,
        key,
        appliedDegree,
        current,
        modeForDominantQuality(current, "Mixolidio", appliedDegree, targetDominant)
      );
      results[index].originKey = keyNameForChromaPreference(root + 7, [targetDominant.root, current.root]);
      results[index].originScaleType = "harmonicMajor";

      setMinorContextResult(
        results,
        index + 1,
        key,
        "Vsub/V",
        subDominant,
        modeForDominantQuality(subDominant, "Mixolidio", "", targetDominant)
      );
      results[index + 1].originKey = keyNameForChromaPreference(subDominant.chroma + 5, [subDominant.root]);
      results[index + 1].originScaleType = "harmonicMajor";

      const targetDegree = `V${dominantSuffixForDegree(targetDominant)}`;
      setMinorContextResult(
        results,
        index + 2,
        key,
        targetDegree,
        targetDominant,
        modeForDominantQuality(targetDominant, "Mixo b2b6", targetDegree, tonic)
      );
      setMinorTonicResult(results, index + 3, key, tonic);
    }

    for (let index = 0; index < parsed.length - 2; index++) {
      const current = parsed[index]?.parsed;
      const dominant = parsed[index + 1]?.parsed;
      const target = parsed[index + 2]?.parsed;
      if (!current || !dominant || !target) continue;
      if (!isDominantChord(dominant) || !isMinorChord(target)) continue;
      if (!isHalfDiminishedChord(current) && !isMinorChord(current)) continue;
      if (current.chroma !== mod12(root + 7)) continue;
      if (dominant.chroma !== root) continue;
      if (target.chroma !== mod12(root + 5)) continue;

      setMinorContextResult(
        results,
        index,
        key,
        isHalfDiminishedChord(current) ? "IIø/IV" : `II${current.displaySuffix}/IV`,
        current,
        isHalfDiminishedChord(current) ? "Locrio #6" : "Dórico"
      );
      results[index].originKey = keyNameForChromaPreference(root + 5, [target.root, current.root]);
      results[index].originScaleType = "harmonicMinor";

      const dominantDegree = `V${dominantSuffixForDegree(dominant)}/IV`;
      setMinorContextResult(
        results,
        index + 1,
        key,
        dominantDegree,
        dominant,
        modeForDominantQuality(dominant, "Mixo b2b6", dominantDegree, target)
      );
      results[index + 1].originKey = keyNameForChromaPreference(root + 5, [target.root, dominant.root]);
      results[index + 1].originScaleType = "harmonicMinor";
      setMinorContextResult(results, index + 2, key, `IV${target.displaySuffix}${inversionSuffixForDegree(target)}`, target, "Dórico #4");
    }

    return results;
  }

  function applyMinorContextFunctions(parsed, results) {
    for (let index = 0; index < parsed.length - 1; index++) {
      const key = nearbyMinorContextKey(results, index);
      const current = parsed[index].parsed;
      const target = parsed[index + 1].parsed;
      if (!key || !current || !target || !isDominantChord(current) || !isMinorChord(target)) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;
      if (current.chroma !== root || target.chroma !== mod12(root + 5)) continue;

      const dominantDegree = `V${dominantSuffixForDegree(current)}/IV`;
      setMinorContextResult(
        results,
        index,
        key,
        dominantDegree,
        current,
        modeForDominantQuality(current, "Mixo b2b6", dominantDegree, target)
      );
      setMinorContextResult(results, index + 1, key, `IV${target.displaySuffix}`, target, "Dórico #4");
    }

    for (let index = 0; index < parsed.length - 2; index++) {
      const key = nearbyMinorContextKey(results, index);
      const current = parsed[index].parsed;
      const dominant = parsed[index + 1].parsed;
      const target = parsed[index + 2].parsed;
      if (!key || !current || !dominant || !target) continue;
      if (!isDominantChord(dominant) || !isMinorChord(target)) continue;
      if (!isHalfDiminishedChord(current) && !isMinorChord(current)) continue;

      const root = keyChroma(key);
      if (root === undefined) continue;
      if (current.chroma !== mod12(root + 7)) continue;
      if (dominant.chroma !== root) continue;
      if (target.chroma !== mod12(root + 5)) continue;

      const iiDegree = isHalfDiminishedChord(current)
        ? "IIø/IV"
        : `II${current.displaySuffix}/IV`;
      setMinorContextResult(
        results,
        index,
        key,
        iiDegree,
        current,
        isHalfDiminishedChord(current) ? "Locrio #6" : "Dórico"
      );
    }

    for (let index = 0; index < parsed.length - 2; index++) {
      const current = parsed[index].parsed;
      const next = parsed[index + 1].parsed;
      const target = parsed[index + 2].parsed;
      if (!current || !next || !target || !isMinorChord(target)) continue;

      const root = target.chroma;
      if (current.chroma === mod12(root + 2) && next.chroma === mod12(root + 1)) {
        if (isHalfDiminishedChord(current) && isDominantChord(next)) {
          setMinorContextResult(results, index, target.root, `II${current.displaySuffix}`, current, "Locrio #6");
          setMinorContextResult(results, index + 1, target.root, `Vsub${next.displaySuffix}`, next, "Lidio dominante");

          const targetCandidate = candidateFor(parsed[index + 2], target.root, "harmonicMinor", "I") ||
            candidateFor(parsed[index + 2], target.root, "melodicMinor", "I") ||
            results[index + 2];
          if (targetCandidate) {
            applyCandidateResult(results, index + 2, {
              ...targetCandidate,
              key: target.root,
              scaleType: "harmonicMinor",
              scaleLabel: "menor armónica"
            }, false);
          }
          continue;
        }
      }

      if (current.chroma !== mod12(root + 8) || next.chroma !== mod12(root + 1)) continue;
      if (!isMinorChord(current) || !isDominantChord(next)) continue;
      const nearbyMajorKey = nearbyMajorContextKey(results, index, new Set([index, index + 1, index + 2]));
      const nearbyTargetDegree = nearbyMajorKey ? majorScaleDegreeFor(target, nearbyMajorKey) : "";
      if (nearbyTargetDegree && nearbyTargetDegree !== "VII") {
        const nearbyRoot = keyChroma(nearbyMajorKey);
        const nearbyInterval = degreeInterval(nearbyTargetDegree);
        if (
          nearbyInterval !== undefined &&
          current.chroma === mod12(nearbyRoot + nearbyInterval + 8) &&
          next.chroma === mod12(nearbyRoot + nearbyInterval + 1)
        ) {
          const slash = nearbyTargetDegree === "I" ? "" : `/${nearbyTargetDegree}`;
          setMajorContextResult(results, index, nearbyMajorKey, `II${current.displaySuffix.replace(/^-/, "m")}sub${slash}`, current, "Dórico", "minorContext");
          setMajorContextResult(results, index + 1, nearbyMajorKey, `V${dominantSuffixForDegree(next)}sub${slash}`, next, "Lidio dominante", "minorContext");
          continue;
        }
      }
      if (parsed.slice(index + 3).some(item =>
        item.parsed &&
        item.parsed.chroma === current.chroma &&
        isMajorChord(item.parsed)
      )) {
        continue;
      }

      setMinorContextResult(results, index, target.root, "IIm7sub", current, "Dórico");
      setMinorContextResult(results, index + 1, target.root, `V${next.displaySuffix}sub`, next, "Lidio dominante");

      const targetCandidate = candidateFor(parsed[index + 2], target.root, "harmonicMinor", "I") ||
        candidateFor(parsed[index + 2], target.root, "melodicMinor", "I") ||
        results[index + 2];
      if (targetCandidate) {
        applyCandidateResult(results, index + 2, {
          ...targetCandidate,
          key: target.root,
          scaleType: "harmonicMinor",
          scaleLabel: "menor armónica"
        }, false);
      }
    }

    for (let index = 0; index < parsed.length - 1; index++) {
      const key = nearbyMinorContextKey(results, index);
      const current = parsed[index].parsed;
      const next = parsed[index + 1].parsed;
      if (!key || !current || !next) continue;
      if (["harmonicMajor", "melodicMinor"].includes(results[index]?.scaleType) && results[index]?.key === key) continue;
      if (["harmonicMajor", "melodicMinor"].includes(results[index + 1]?.scaleType) && results[index + 1]?.key === key) continue;

      const root = keyChroma(key);
      const viRoot = mod12(root + 8);
      if (current.chroma !== mod12(viRoot + 2) || next.chroma !== mod12(viRoot + 7)) continue;
      if (!isMinorChord(current) || !isDominantChord(next)) continue;

      setMinorContextResult(results, index, key, `II${current.displaySuffix}/VI`, current, "Dórico");
      setMinorContextResult(results, index + 1, key, `V${next.displaySuffix}/VI`, next, "Mixolidio");
    }

    for (let index = 0; index < parsed.length; index++) {
      const key = nearbyMinorContextKey(results, index);
      const current = parsed[index].parsed;
      const next = parsed[index + 1]?.parsed;
      if (!key || !current) continue;
      if (results[index]?.source === "primaryMajorCadence") continue;
      if (results[index]?.source === "stableMinorDegree") continue;
      if (results[index]?.source === "intercambio modal" && /^bVII/.test(results[index]?.degree || "")) continue;
      if (results[index]?.scaleType === "harmonicMinor" && !results[index]?.source && results[index]?.key === key) continue;
      if (["harmonicMajor", "melodicMinor"].includes(results[index]?.scaleType) && results[index]?.key === key) continue;
      if (
        next &&
        parsed[index + 2]?.parsed &&
        isMinorChord(current) &&
        isDominantChord(next) &&
        isMajorChord(parsed[index + 2].parsed) &&
        current.chroma === mod12(parsed[index + 2].parsed.chroma + 2) &&
        next.chroma === mod12(parsed[index + 2].parsed.chroma + 7)
      ) {
        continue;
      }
      if (
        results[index]?.scaleType === "major" &&
        results[index - 1]?.scaleType === "major" &&
        results[index - 1]?.key === results[index].key
      ) {
        continue;
      }

      const root = keyChroma(key);
      if (isMajorChord(current) && current.chroma === mod12(root + 8)) {
        setMinorContextResult(results, index, key, `VI${current.displaySuffix}${inversionSuffixForDegree(current)}`, current, "Lidio #2");
      }

      if (isMajorChord(current) && current.chroma === mod12(root + 3)) {
        setMinorContextResult(results, index, key, `III${current.displaySuffix}`, current, "Jónico aumentado");
      }

      if (isDiminishedChord(current) && next?.chroma === mod12(root + 3) && current.chroma === mod12(next.chroma - 1)) {
        setMinorContextResult(results, index, key, `VII${current.displaySuffix}/III`, current, "Disminuida");
      }

      if (isDiminishedChord(current) && next?.chroma === mod12(root + 5) && current.chroma === mod12(next.chroma + 1)) {
        setMinorContextResult(results, index, key, `bII${current.displaySuffix}/IV`, current, "Disminuida");
      }

      if (isMinorChord(current) && current.chroma === mod12(root + 5)) {
        setMinorContextResult(results, index, key, `IV${current.displaySuffix}`, current, "Dórico #4");
      }

      if (isHalfDiminishedChord(current) && current.chroma === mod12(root + 2)) {
        setMinorContextResult(results, index, key, `II${current.displaySuffix}`, current, "Locrio #6");
      }

      if (!isDominantChord(current)) continue;
      if (
        isSuspendedDominantChord(current) &&
        next &&
        next.chroma === current.chroma &&
        parsed[index + 2]?.parsed &&
        isMajorChord(parsed[index + 2].parsed)
      ) {
        continue;
      }
      if (/^V.*sub$/.test(results[index]?.degree || "")) continue;
      if (
        next &&
        current.chroma === mod12(next.chroma + 7) &&
        parsed[index + 1].candidates.some(candidate => candidate.scaleType === "major" && degreeBase(candidate.degree) === "I")
      ) {
        continue;
      }

      if (current.chroma === mod12(root + 5)) {
        setMinorContextResult(results, index, key, `IV${current.displaySuffix}`, current, "Lidio dominante");
      }

      if (current.chroma === mod12(root + 2)) {
        setMinorContextResult(results, index, key, `V${current.displaySuffix}/V`, current, "Mixolidio");
      }

      if (current.chroma === mod12(root + 6)) {
        setMinorContextResult(results, index, key, "Vsub/IV", current, "Lidio dominante");
      }

      if (current.chroma === mod12(root + 1)) {
        setMinorContextResult(results, index, key, `Vsub${current.displaySuffix}`, current, "Lidio dominante");
      }

      if (current.chroma === mod12(root + 8)) {
        setMinorContextResult(results, index, key, "Vsub/V", current, "Lidio dominante");
      }

      if (current.chroma === mod12(root + 7)) {
        setMinorContextResult(results, index, key, `V${current.displaySuffix}`, current, "Mixo b2b6");
      }
    }

    return results;
  }

  function normalizeSectionLabels(results) {
    return results.map((result, index) => {
      if (!result?.key || !result.scaleType) return result;
      result = normalizeVisibleSectionScale(result);
      if (result.scaleType === "harmonicMinor" && /^II-7b5$/.test(result.degree || "")) {
        result = { ...result, degree: "IIø" };
      }
      let previous = null;
      for (let previousIndex = index - 1; previousIndex >= 0; previousIndex--) {
        if (results[previousIndex]?.key && results[previousIndex]?.scaleType) {
          previous = results[previousIndex];
          break;
        }
      }
      const sectionStart = (!previous || visibleSectionKey(previous) !== visibleSectionKey(result)) &&
        shouldShowSectionLabel(result, previous, results, index);
      return {
        ...result,
        sectionStart,
        sectionLabel: sectionStart ? sectionLabel(result) : ""
      };
    });
  }

  function hasPriorSectionContext(results, index, result) {
    const targetKey = visibleSectionKey(result);
    for (let previousIndex = index - 1; previousIndex >= 0; previousIndex--) {
      const previous = results[previousIndex];
      if (visibleSectionKey(previous) === targetKey) return true;
    }
    return false;
  }

  function shouldShowSectionLabel(result, previous, results, index) {
    const degree = String(result?.degree || "");
    const source = String(result?.source || "");
    if (!previous) return true;
    if (hasPriorSectionContext(results, index, result)) return true;
    if (source === "dominantCycleBridge") return true;
    if (/\/|sub|bck\.dr/i.test(degree)) return false;
    if (/intercambio|diminished|Diminished|secondary/i.test(source)) return false;
    if (/majorPassingDiminished|descendingDiminished/i.test(source)) return false;

    const currentVisibleKey = visibleSectionKey(result);
    const next = results[index + 1];
    const nextTwo = results[index + 2];
    const nextSame = visibleSectionKey(next) === currentVisibleKey;
    const nextTwoSame = visibleSectionKey(nextTwo) === currentVisibleKey;
    const nextDegree = String(next?.degree || "");
    const previousDegree = String(previous?.degree || "");
    const startsOnTonic = /^I(?!I|V)/.test(degree);
    const startsTwoFive = /^II/.test(degree) && nextSame && /^V/.test(nextDegree);
    const startsDominantToTonic = /^V/.test(degree) && nextSame && /^I(?!I|V)/.test(nextDegree);
    const resolvesFromDominant = /^V/.test(previousDegree) && startsOnTonic;
    const sustainedContext = nextSame && nextTwoSame;

    return startsOnTonic || startsTwoFive || startsDominantToTonic || resolvesFromDominant || sustainedContext;
  }

  function applySecondaryFunctions(parsed, results) {
    const appliedDominants = new Map();

    for (let index = 0; index < parsed.length - 1; index++) {
      if (results[index]?.source === "primaryMinorCadence" || results[index + 1]?.source === "primaryMinorCadence") continue;
      const currentItem = parsed[index];
      const targetItem = parsed[index + 1];
      if (!currentItem.parsed || !targetItem.parsed) continue;
      if (
        parsed[index + 2]?.parsed &&
        parsed[index + 2].parsed.chroma === targetItem.parsed.chroma &&
        isMinorChord(targetItem.parsed) &&
        isMinorChord(parsed[index + 2].parsed) &&
        currentItem.parsed.chroma === mod12(targetItem.parsed.chroma + 7)
      ) {
        continue;
      }

      const targetCandidate = secondaryDominantFor(currentItem.parsed, targetItem, results, index, index + 1);
      if (!targetCandidate) continue;

      const targetDegree = degreeBase(targetCandidate.degree);
      const dominantDegree = appliedDominantDegree(currentItem.parsed, targetDegree);
      const startsSection = startsAppliedSection(results, index, targetCandidate);
      const dominantResult = {
        ...results[index],
        chord: currentItem.chord,
        key: targetCandidate.key,
        scaleType: "major",
        scaleLabel: "mayor",
        degree: dominantDegree,
        mode: modeForDominantQuality(currentItem.parsed, "Mixolidio", dominantDegree, targetItem.parsed),
        source: "secondaryDominant",
        sectionStart: startsSection,
        sectionLabel: startsSection ? sectionLabel(targetCandidate) : ""
      };

      results[index] = dominantResult;
      results[index + 1] = {
        ...targetCandidate,
        chord: targetItem.chord,
        source: "secondaryDominantTarget",
        sectionStart: false,
        sectionLabel: ""
      };
      appliedDominants.set(index, { targetCandidate, targetDegree });
    }

    for (let index = 0; index < parsed.length - 2; index++) {
      const currentItem = parsed[index];
      const dominantInfo = appliedDominants.get(index + 1);
      if (!currentItem.parsed || !dominantInfo) continue;

      const targetChroma = parsed[index + 2].parsed?.chroma;
      if (targetChroma === undefined) continue;
      if (mod12(targetChroma + 2) !== currentItem.parsed.chroma) continue;
      if (!isHalfDiminishedChord(currentItem.parsed) && !isMinorChord(currentItem.parsed)) continue;

      const startsSection = startsAppliedSection(results, index, dominantInfo.targetCandidate);
      results[index] = {
        ...results[index],
        chord: currentItem.chord,
        key: dominantInfo.targetCandidate.key,
        scaleType: "major",
        scaleLabel: "mayor",
        degree: appliedIiDegree(currentItem.parsed, dominantInfo.targetDegree),
        mode: appliedIiMode(currentItem.parsed),
        source: "secondaryRelativeTwo",
        sectionStart: startsSection,
        sectionLabel: startsSection ? sectionLabel(dominantInfo.targetCandidate) : ""
      };
    }

    return results;
  }

  function analyzeContiguousGroups(parsed) {
    const results = Array(parsed.length).fill(null);
    let index = 0;

    while (index < parsed.length) {
      const item = parsed[index];

      if (!item.chord) {
        index += 1;
        continue;
      }

      if (!item.candidates.length) {
        results[index] = { chord: item.chord, degree: "", mode: "" };
        index += 1;
        continue;
      }

      const group = findBestContiguousGroup(parsed, index);

      for (let groupIndex = index; groupIndex <= group.end; groupIndex++) {
        const groupItem = parsed[groupIndex];
        const contextual = group.selectedScale
          ? groupItem.candidates.find(candidate => scaleKey(candidate) === scaleKey(group.selectedScale))
          : null;

        results[groupIndex] = {
          ...(contextual || groupItem.candidates[0]),
          sectionStart: groupIndex === index,
          sectionLabel: groupIndex === index ? sectionLabel(group.selectedScale || contextual || groupItem.candidates[0]) : ""
        };
      }

      index = group.end + 1;
    }

    return results;
  }

  function analyzeProgression(chords) {
    const repeatIndexes = new Set();
    let lastChord = "";
    const analysisChords = chords.map((chord, index) => {
      const value = String(chord || "").trim();
      if (value === "%") {
        repeatIndexes.add(index);
        return lastChord || value;
      }
      if (value) lastChord = value;
      return chord;
    });

    const parsed = analysisChords.map((chord, index) => ({
      chord: chords[index],
      parsed: parseChord(chord),
      candidates: candidatesForChord(chord)
    }));

    let results = analyzeContiguousGroups(parsed);
    results = preferStandaloneFlatNineDominant(parsed, results);
    results = applyPrimaryMajorCadences(parsed, results);
    results = applyPrimaryMajorDominants(parsed, results);
    results = applyPrimaryMinorCadences(parsed, results);
    results = applyStableMajorDegreeVariants(parsed, results);
    results = applyStableMinorDegreeVariants(parsed, results);
    results = applyMinorContextFunctions(parsed, results);
    results = applySecondaryFunctions(parsed, results);
    results = applyMajorContextFunctions(parsed, results);
    results = applyCircularMajorCadences(parsed, results);
    if (results.slice(-3).some(result => result?.scaleType === "harmonicMinor")) {
      results = applyMinorContextFunctions(parsed, results);
    }
    results = applyMajorMinorTwoFivePairs(parsed, results);
    results = applyMajorBluesFunctions(parsed, results);
    results = applyTwoFiveCycleBridge(parsed, results);
    results = applyDominantCycleBridge(parsed, results);
    results = applyDescendingDiminishedContexts(parsed, results);
    results = applyMajorPassingDiminished(parsed, results);
    results = applyMajorFlatSevenDominants(parsed, results);
    results = applyChordQualityModes(parsed, results);
    results = applyHarmonicMajorDominantResolutions(parsed, results);
    results = applyDiatonicTargetSecondaryDominants(parsed, results);
    results = applyMinorSubdominantRegionFunctions(parsed, results);
    results = applyGlobalMinorContextTieBreaks(parsed, results);
    results = applyUserExamples(parsed, results);
    results = normalizeSectionLabels(results);

    repeatIndexes.forEach(index => {
      results[index] = {
        chord: "%",
        degree: "%",
        mode: "",
        sectionStart: false,
        sectionLabel: ""
      };
    });

    return normalizeSectionLabels(results);
  }

  global.TonalAnalysis = {
    parseChord,
    candidatesForChord,
    analyzeChordInContext,
    analyzeProgression,
    setUserExamples,
    getUserExamples
  };
})(window);
