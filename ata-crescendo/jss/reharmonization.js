(function (global) {
  "use strict";

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
  const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const DEGREE_INTERVALS = {
    major: { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 },
    minor: { I: 0, II: 2, III: 3, IV: 5, V: 7, VI: 8, VII: 10 }
  };
  const PARALLEL_SCALE_OPTIONS = {
    major: [
      {
        label: "mayor natural",
        items: [
          { degree: "I", interval: 0, suffix: "maj7" },
          { degree: "I", interval: 0, suffix: "sus4" },
          { degree: "I", interval: 0, suffix: "6sus4" },
          { degree: "II", interval: 2, suffix: "m7" },
          { degree: "II", interval: 2, suffix: "7sus4" },
          { degree: "II", interval: 2, suffix: "9sus4" },
          { degree: "III", interval: 4, suffix: "m7" },
          { degree: "III", interval: 4, suffix: "7sus4" },
          { degree: "IV", interval: 5, suffix: "maj7" },
          { degree: "IV", interval: 5, suffix: "sus2" },
          { degree: "IV", interval: 5, suffix: "6sus2" },
          { degree: "V", interval: 7, suffix: "7" },
          { degree: "V", interval: 7, suffix: "7sus4" },
          { degree: "V", interval: 7, suffix: "13sus4" },
          { degree: "VI", interval: 9, suffix: "m7" },
          { degree: "VI", interval: 9, suffix: "7sus4" },
          { degree: "VI", interval: 9, suffix: "9sus4" },
          { degree: "VII", interval: 11, suffix: "ø" }
        ]
      },
      {
        label: "eólica paralela",
        items: [
          { degree: "I", interval: 0, suffix: "m7" },
          { degree: "II", interval: 2, suffix: "ø" },
          { degree: "bIII", interval: 3, suffix: "maj7" },
          { degree: "IV", interval: 5, suffix: "m7" },
          { degree: "V", interval: 7, suffix: "m7" },
          { degree: "bVI", interval: 8, suffix: "maj7" },
          { degree: "bVII", interval: 10, suffix: "7" }
        ]
      },
      {
        label: "mayor armónica",
        items: [
          { degree: "I", interval: 0, suffix: "+maj7" },
          { degree: "II", interval: 2, suffix: "ø" },
          { degree: "III", interval: 4, suffix: "7(#9)b13" },
          { degree: "IV", interval: 5, suffix: "m(maj7)" },
          { degree: "V", interval: 7, suffix: "7(b9)" },
          { degree: "V", interval: 7, suffix: "sus4(addb2)" },
          { degree: "V", interval: 7, suffix: "7sus4(b9)" },
          { degree: "bVI", interval: 8, suffix: "+maj7" },
          { degree: "VII", interval: 11, suffix: "°7" }
        ]
      },
      {
        label: "frigia paralela",
        items: [
          { degree: "I", interval: 0, suffix: "m7" },
          { degree: "bII", interval: 1, suffix: "maj7" },
          { degree: "bIII", interval: 3, suffix: "7" },
          { degree: "IV", interval: 5, suffix: "m7" },
          { degree: "V", interval: 7, suffix: "ø" },
          { degree: "bVI", interval: 8, suffix: "maj7" },
          { degree: "bVII", interval: 10, suffix: "m7" }
        ]
      }
    ],
    minor: [
      {
        label: "menor natural",
        items: [
          { degree: "I", interval: 0, suffix: "m7" },
          { degree: "II", interval: 2, suffix: "ø" },
          { degree: "III", interval: 3, suffix: "maj7" },
          { degree: "IV", interval: 5, suffix: "m7" },
          { degree: "V", interval: 7, suffix: "m7" },
          { degree: "VI", interval: 8, suffix: "maj7" },
          { degree: "VII", interval: 10, suffix: "7" }
        ]
      },
      {
        label: "menor armónica",
        items: [
          { degree: "I", interval: 0, suffix: "m(maj7)" },
          { degree: "I", interval: 0, suffix: "sus4" },
          { degree: "I", interval: 0, suffix: "sus4(add2)" },
          { degree: "II", interval: 2, suffix: "ø" },
          { degree: "III", interval: 3, suffix: "+maj7" },
          { degree: "IV", interval: 5, suffix: "m7" },
          { degree: "V", interval: 7, suffix: "7(b9)b13" },
          { degree: "V", interval: 7, suffix: "sus4(addb2)" },
          { degree: "V", interval: 7, suffix: "7sus4(b9)" },
          { degree: "VI", interval: 8, suffix: "maj7" },
          { degree: "VI", interval: 8, suffix: "sus4" },
          { degree: "VI", interval: 8, suffix: "6sus4" },
          { degree: "#VII", interval: 11, suffix: "°7" }
        ]
      },
      {
        label: "menor melódica",
        items: [
          { degree: "I", interval: 0, suffix: "m6" },
          { degree: "I", interval: 0, suffix: "sus4" },
          { degree: "I", interval: 0, suffix: "sus4(addb2)" },
          { degree: "II", interval: 2, suffix: "7sus4(b9)" },
          { degree: "II", interval: 2, suffix: "sus4(addb2)" },
          { degree: "III", interval: 3, suffix: "maj7(b5)" },
          { degree: "IV", interval: 5, suffix: "9(#11)" },
          { degree: "V", interval: 7, suffix: "9(b13)" },
          { degree: "V", interval: 7, suffix: "7sus4" },
          { degree: "V", interval: 7, suffix: "9sus4(b13)" },
          { degree: "#VI", interval: 9, suffix: "ø" },
          { degree: "#VII", interval: 11, suffix: "7alt" }
        ]
      },
      {
        label: "mayor paralela",
        items: [
          { degree: "I", interval: 0, suffix: "maj7" },
          { degree: "I", interval: 0, suffix: "sus4" },
          { degree: "I", interval: 0, suffix: "6sus4" },
          { degree: "II", interval: 2, suffix: "m7" },
          { degree: "II", interval: 2, suffix: "7sus4" },
          { degree: "II", interval: 2, suffix: "9sus4" },
          { degree: "#III", interval: 4, suffix: "m7" },
          { degree: "#III", interval: 4, suffix: "7sus4" },
          { degree: "IV", interval: 5, suffix: "maj7" },
          { degree: "IV", interval: 5, suffix: "sus2" },
          { degree: "IV", interval: 5, suffix: "6sus2" },
          { degree: "V", interval: 7, suffix: "7" },
          { degree: "V", interval: 7, suffix: "7sus4" },
          { degree: "V", interval: 7, suffix: "13sus4" },
          { degree: "#VI", interval: 9, suffix: "m7" },
          { degree: "#VI", interval: 9, suffix: "7sus4" },
          { degree: "#VI", interval: 9, suffix: "9sus4" },
          { degree: "#VII", interval: 11, suffix: "ø" }
        ]
      }
    ]
  };

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function parseSectionLabel(value) {
    const text = normalizeText(value);
    const match = text.match(/^([A-G](?:b|#)?)(m)?\s*:\s*\[$/);
    if (!match) return null;

    return {
      key: match[1],
      mode: match[2] ? "minor" : "major",
      label: `${match[1]}${match[2] ? "m" : ""}:[`
    };
  }

  function slotChord(slot) {
    return normalizeText(slot?.chord);
  }

  function flatSlots(song, { filledOnly = false } = {}) {
    const out = [];

    (song?.pages || []).forEach((page, pageIndex) => {
      (page.measures || []).forEach((measure, measureIndex) => {
        (measure.slots || []).forEach((slot, slotIndex) => {
          if (filledOnly && !slotChord(slot)) return;
          out.push({ pageIndex, measureIndex, slotIndex, measure, slot });
        });
      });
    });

    return out;
  }

  function findSlotEntry(entries, pageIndex, measureIndex, slotIndex) {
    return entries.find(entry =>
      entry.pageIndex === pageIndex &&
      entry.measureIndex === measureIndex &&
      entry.slotIndex === slotIndex
    ) || null;
  }

  function findPreviousFilledEntry(entries, currentIndex) {
    for (let index = currentIndex - 1; index >= 0; index--) {
      if (slotChord(entries[index]?.slot)) return entries[index];
    }
    return null;
  }

  function findNextFilledEntry(entries, currentIndex) {
    for (let index = currentIndex + 1; index < entries.length; index++) {
      if (slotChord(entries[index]?.slot)) return entries[index];
    }
    return null;
  }

  function findNextFilledEntryFrom(entries, currentIndex) {
    for (let index = Math.max(0, currentIndex); index < entries.length; index++) {
      if (slotChord(entries[index]?.slot)) return entries[index];
    }
    return null;
  }

  function slotPulse(entry) {
    const pulse = Number(entry?.slot?.pulse);
    if (pulse >= 1 && pulse <= 8) return Math.round(pulse);
    return Number(entry?.slotIndex || 0) + 1;
  }

  function findNextFilledEntryForVirtualPulse(entries, currentIndex, pageIndex, measureIndex, visualPulse) {
    const pulse = Number(visualPulse);
    if (pulse >= 1) {
      const sameMeasureNext = entries
        .filter(entry =>
          entry.pageIndex === pageIndex &&
          entry.measureIndex === measureIndex &&
          slotChord(entry.slot) &&
          slotPulse(entry) > pulse
        )
        .sort((a, b) => slotPulse(a) - slotPulse(b) || a.slotIndex - b.slotIndex)[0];
      if (sameMeasureNext) return sameMeasureNext;
    }

    return findNextFilledEntryFrom(entries, currentIndex);
  }

  function visibleTonalContext(entries, currentIndex) {
    for (let index = currentIndex; index >= 0; index--) {
      const entry = entries[index];
      const slotContext = parseSectionLabel(entry?.slot?.sectionLabel);
      if (slotContext) return { ...slotContext, source: "slot" };

      const measureContext = parseSectionLabel(entry?.measure?.sectionLabel);
      if (measureContext) return { ...measureContext, source: "measure" };
    }

    return null;
  }

  function parseChord(parseChordFn, chord) {
    if (!parseChordFn || !chord) return null;
    try {
      return parseChordFn(chord) || null;
    } catch (_) {
      return null;
    }
  }

  function mod12(value) {
    return ((value % 12) + 12) % 12;
  }

  function chromaForRoot(root) {
    return NOTE_TO_CHROMA[String(root || "").replace("x", "##")];
  }

  function noteNameForChroma(chroma, references = []) {
    const referenceText = references.filter(Boolean).join(" ");
    if (/#/.test(referenceText) && !/b/.test(referenceText)) return SHARP_NAMES[mod12(chroma)];
    return FLAT_NAMES[mod12(chroma)];
  }

  function isHalfDiminished(parsed) {
    return /^m7b5/.test(parsed?.suffix || "");
  }

  function isDiminished(parsed) {
    return parsed?.suffix === "dim" || parsed?.suffix === "dim7";
  }

  function isMinorTarget(parsed) {
    const suffix = parsed?.suffix || "";
    return !isHalfDiminished(parsed) && (suffix === "m" || /^m(?:6|7|9|11|13|maj|∆)/.test(suffix));
  }

  function isDominant(parsed) {
    return /^7|^9|^13|\+7|7alt/.test(parsed?.suffix || "");
  }

  function isMinorQuality(parsed) {
    const suffix = parsed?.suffix || "";
    return !isHalfDiminished(parsed) && (suffix === "m" || /^m(?:6|7|9|11|13|maj|∆)/.test(suffix));
  }

  function isMajorQuality(parsed) {
    const suffix = parsed?.suffix || "";
    return suffix === "" || suffix === "6" || /^maj|^∆|\+maj|\+∆/.test(suffix);
  }

  function isDiminishedQuality(parsed) {
    return isDiminished(parsed);
  }

  function canPrepareTarget(parsed) {
    return !!parsed?.root && !isDiminished(parsed) && !isHalfDiminished(parsed);
  }

  function addSuggestion(out, seen, suggestion) {
    const chord = normalizeText(suggestion?.chord);
    if (!chord || seen.has(chord)) return;
    seen.add(chord);
    out.push({ ...suggestion, chord });
  }

  function targetLabel(context) {
    return context?.nextChord || context?.currentChord || "acorde objetivo";
  }

  function chordLabel(parsed) {
    return parsed?.input || parsed?.root || "acorde";
  }

  function isSecondaryDegreeContext(context) {
    return /\//.test(normalizeText(context?.currentDegree));
  }

  function isCadentialTwoToFive(context) {
    const current = context?.currentParsed;
    const next = context?.nextParsed;
    if (!current?.root || !next?.root || !isDominant(next)) return false;
    if (!isMinorQuality(current) && !isHalfDiminished(current)) return false;
    return mod12(next.chroma - current.chroma) === 5;
  }

  function cadentialResolutionContext(context) {
    const next = context?.nextParsed;
    if (!next?.root || !isDominant(next)) return null;

    const keyChroma = mod12(next.chroma + 5);
    const key = noteNameForChroma(keyChroma, [next.root, context?.nextChord, context?.tonalContext?.key]);
    const minor = isHalfDiminished(context?.currentParsed) || /b9|alt|b13/.test(next.suffix || "");
    return { key, keyChroma, mode: minor ? "minor" : "major" };
  }

  function preparationSuggestions(context) {
    const target = context?.nextParsed;
    if (!canPrepareTarget(target)) return [];

    const targetRootChroma = chromaForRoot(target.root);
    if (targetRootChroma === undefined) return [];

    const references = [target.root, context?.nextChord, context?.tonalContext?.key];
    const targetName = targetLabel(context);
    const dominantRoot = noteNameForChroma(targetRootChroma + 7, references);
    const subRoot = noteNameForChroma(targetRootChroma + 1, [target.root, "b"]);
    const backdoorRoot = noteNameForChroma(targetRootChroma + 10, [target.root, "b"]);
    const dominantSuffix = isMinorTarget(target) ? "7(b9)" : "7";
    const out = [];
    const seen = new Set();

    addSuggestion(out, seen, {
      chord: `${dominantRoot}${dominantSuffix}`,
      label: `${dominantRoot}${dominantSuffix}`,
      detail: `Dominante secundaria hacia ${targetName}`,
      type: "preparation",
      family: "secondary-dominant"
    });

    addSuggestion(out, seen, {
      chord: `${subRoot}7`,
      label: `${subRoot}7`,
      detail: `Dominante sustituto hacia ${targetName}`,
      type: "preparation",
      family: "tritone-substitution"
    });

    addSuggestion(out, seen, {
      chord: `${subRoot}maj7`,
      label: `${subRoot}maj7`,
      detail: `Sustituto mayor hacia ${targetName}`,
      type: "preparation",
      family: "major-tritone-substitution"
    });

    addSuggestion(out, seen, {
      chord: `${backdoorRoot}7`,
      label: `${backdoorRoot}7`,
      detail: `Backdoor hacia ${targetName}`,
      type: "preparation",
      family: "backdoor"
    });

    return out;
  }

  function diminishedApproachSuggestions(context) {
    const target = context?.nextParsed;
    if (!canPrepareTarget(target)) return [];

    const references = [target.root, context?.nextChord, context?.tonalContext?.key];
    const targetName = targetLabel(context);
    const lowerRoot = noteNameForChroma(target.chroma - 1, [target.root, "#"]);
    const upperRoot = noteNameForChroma(target.chroma + 1, [target.root, "b"]);
    const out = [];
    const seen = new Set();

    addSuggestion(out, seen, {
      chord: `${lowerRoot}°7`,
      label: `${lowerRoot}°7`,
      detail: `Disminuido de aproximación ascendente hacia ${targetName}`,
      type: "preparation",
      family: "chromatic-diminished"
    });

    addSuggestion(out, seen, {
      chord: `${upperRoot}°7`,
      label: `${upperRoot}°7`,
      detail: `Disminuido de aproximación descendente hacia ${targetName}`,
      type: "preparation",
      family: "chromatic-diminished"
    });

    return out;
  }

  function dominantColorPreparationSuggestions(context) {
    const target = context?.nextParsed;
    if (!canPrepareTarget(target)) return [];

    const targetRootChroma = chromaForRoot(target.root);
    if (targetRootChroma === undefined) return [];

    const references = [target.root, context?.nextChord, context?.tonalContext?.key];
    const dominantRoot = noteNameForChroma(targetRootChroma + 7, references);
    const subRoot = noteNameForChroma(targetRootChroma + 1, [target.root, "b"]);
    const targetName = targetLabel(context);
    const out = [];
    const seen = new Set();

    [
      ["7sus4", "Dominante suspendida"],
      ["13", "Dominante con color 13"],
      ["7alt", "Dominante alterada"]
    ].forEach(([suffix, label]) => {
      addSuggestion(out, seen, {
        chord: `${dominantRoot}${suffix}`,
        label: `${dominantRoot}${suffix}`,
        detail: `${label} hacia ${targetName}`,
        type: "preparation",
        family: "dominant-color"
      });
    });

    if (isMinorTarget(target)) {
      addSuggestion(out, seen, {
        chord: `${dominantRoot}7(b9)b13`,
        label: `${dominantRoot}7(b9)b13`,
        detail: `Dominante de menor armónica hacia ${targetName}`,
        type: "preparation",
        family: "dominant-color"
      });
    }

    [
      ["13(#11)", "Sustituto dominante con color"],
      ["9(b5)", "Sustituto dominante disminuido HW"]
    ].forEach(([suffix, label]) => {
      addSuggestion(out, seen, {
        chord: `${subRoot}${suffix}`,
        label: `${subRoot}${suffix}`,
        detail: `${label} hacia ${targetName}`,
        type: "preparation",
        family: "tritone-color"
      });
    });

    return out;
  }

  function preparatoryTwoToTargetSuggestions(context) {
    const target = context?.nextParsed;
    if (!canPrepareTarget(target)) return [];
    if (isDominant(target)) return [];

    const targetRootChroma = chromaForRoot(target.root);
    if (targetRootChroma === undefined) return [];

    const references = [target.root, context?.nextChord, context?.tonalContext?.key];
    const targetName = targetLabel(context);
    const dominantRoot = noteNameForChroma(targetRootChroma + 7, references);
    const regularTwoRoot = noteNameForChroma(targetRootChroma + 2, references);
    const subRoot = noteNameForChroma(targetRootChroma + 1, [target.root, "b"]);
    const subTwoRoot = noteNameForChroma(targetRootChroma + 8, [target.root, "b"]);
    const backdoorRoot = noteNameForChroma(targetRootChroma + 10, [target.root, "b"]);
    const backdoorTwoRoot = noteNameForChroma(targetRootChroma + 5, [target.root, "b"]);
    const out = [];
    const seen = new Set();

    if (isMinorTarget(target)) {
      addSuggestion(out, seen, {
        chord: `${regularTwoRoot}ø`,
        label: `${regularTwoRoot}ø`,
        detail: `II relativo menor antes de ${dominantRoot}7 hacia ${targetName}`,
        type: "preparation",
        family: "preparatory-two"
      });
      addSuggestion(out, seen, {
        chord: `${regularTwoRoot}m7`,
        label: `${regularTwoRoot}m7`,
        detail: `II relativo mayor como color antes de ${dominantRoot}7 hacia ${targetName}`,
        type: "preparation",
        family: "preparatory-two"
      });
    } else {
      addSuggestion(out, seen, {
        chord: `${regularTwoRoot}m7`,
        label: `${regularTwoRoot}m7`,
        detail: `II relativo antes de ${dominantRoot}7 hacia ${targetName}`,
        type: "preparation",
        family: "preparatory-two"
      });
    }

    addSuggestion(out, seen, {
      chord: `${subTwoRoot}m7`,
      label: `${subTwoRoot}m7`,
      detail: `IIsub antes de ${subRoot}7 hacia ${targetName}`,
      type: "preparation",
      family: "preparatory-two-sub"
    });

    addSuggestion(out, seen, {
      chord: `${backdoorTwoRoot}m7`,
      label: `${backdoorTwoRoot}m7`,
      detail: `II relativo del backdoor antes de ${backdoorRoot}7 hacia ${targetName}`,
      type: "preparation",
      family: "preparatory-two-backdoor"
    });

    return out;
  }

  function tonalRootChroma(context) {
    return chromaForRoot(context?.tonalContext?.key);
  }

  function tonalMode(context) {
    return context?.tonalContext?.mode === "minor" ? "minor" : "major";
  }

  function chordName(rootChroma, suffix, context) {
    return `${noteNameForChroma(rootChroma, [context?.tonalContext?.key, context?.currentChord, context?.nextChord])}${suffix}`;
  }

  function contextualChordName(rootChroma, suffix, references = []) {
    return `${noteNameForChroma(rootChroma, references)}${suffix}`;
  }

  function regionModeLabel(region) {
    if (!region?.key) return "";
    return `${region.key}${region.mode === "minor" ? "m" : ""}`;
  }

  function parallelScaleSuggestionsFor(context, region, detailPrefix = "Intercambio modal") {
    const parsed = context?.currentParsed;
    if (!parsed?.root || region?.keyChroma === undefined) return [];

    const mode = region.mode === "minor" ? "minor" : "major";
    const interval = mod12(parsed.chroma - region.keyChroma);
    const palettes = PARALLEL_SCALE_OPTIONS[mode] || [];
    const out = [];
    const seen = new Set();

    palettes.forEach(scale => {
      (scale.items || [])
        .filter(item => item.interval === interval)
        .forEach(item => {
          const chord = contextualChordName(region.keyChroma + item.interval, item.suffix, [
            parsed.root,
            context?.currentChord,
            region.key,
            context?.tonalContext?.key
          ]);
          const detail = `${detailPrefix}: ${scale.label}, ${item.degree}${region.label ? ` en ${region.label}` : ""}`;
          addSuggestion(out, seen, {
            chord,
            label: chord,
            detail,
            type: "replacement",
            family: "parallel-modal-interchange"
          });
        });
    });

    return out;
  }

  function intervalFromContextRoot(parsed, context) {
    const root = tonalRootChroma(context);
    if (root === undefined || !parsed) return null;
    return mod12(parsed.chroma - root);
  }

  function simpleFunctionGroup(interval, mode, parsed) {
    if (interval === null) return "";
    if (isDominant(parsed)) {
      if ([7, 11, 1].includes(interval)) return "dominante";
      return "";
    }
    if (isHalfDiminished(parsed) && interval !== 11 && interval !== 2) return "";
    if (isMinorQuality(parsed) && ![0, 2, 3, 5, 8, 9].includes(interval)) return "";
    if (isMajorQuality(parsed) && ![0, 3, 4, 5, 8, 9].includes(interval)) return "";

    if (mode === "minor") {
      if ([0, 3, 8].includes(interval)) return "tonica";
      if ([2, 5].includes(interval)) return "subdominante";
      if ([7, 11, 1].includes(interval)) return "dominante";
      return "";
    }

    if ([0, 4, 9].includes(interval)) return "tonica";
    if ([2, 5].includes(interval) || (interval === 7 && /^7sus4|^9sus4|^13sus4/.test(parsed?.suffix || ""))) return "subdominante";
    if ([7, 11, 1].includes(interval)) return "dominante";
    return "";
  }

  function simpleSubstitutionSuggestions(context) {
    const parsed = context?.currentParsed;
    const keyRoot = tonalRootChroma(context);
    if (isSecondaryDegreeContext(context)) return [];
    if (!parsed || keyRoot === undefined) return [];

    const interval = intervalFromContextRoot(parsed, context);
    const mode = tonalMode(context);
    const group = simpleFunctionGroup(interval, mode, parsed);
    const out = [];
    const seen = new Set();

    const add = (chord, detail) => addSuggestion(out, seen, {
      chord,
      label: chord,
      detail,
      type: "replacement",
      family: "simple-substitution"
    });

    if (mode === "minor") {
      if (group === "tonica") {
        add(chordName(keyRoot, "m7", context), "Sustitución simple: tónica menor");
        add(chordName(keyRoot, "sus4", context), "Sustitución simple: tónica suspendida");
        add(chordName(keyRoot + 3, "maj7", context), "Sustitución simple: III");
        add(chordName(keyRoot + 8, "maj7", context), "Sustitución simple: VI");
        add(chordName(keyRoot + 8, "6sus4", context), "Sustitución simple: VI suspendido");
      } else if (group === "subdominante") {
        add(chordName(keyRoot + 2, "ø", context), "Sustitución simple: IIø");
        add(chordName(keyRoot + 2, "7sus4(b9)", context), "Sustitución simple: II suspendido");
        add(chordName(keyRoot + 5, "m7", context), "Sustitución simple: IVm");
        add(chordName(keyRoot + 7, "7sus4", context), "Sustitución simple: Vsus");
      } else if (group === "dominante") {
        add(chordName(keyRoot + 7, "7(b9)", context), "Sustitución simple: dominante menor");
        add(chordName(keyRoot + 7, "7sus4(b9)", context), "Sustitución simple: dominante suspendida menor");
        add(chordName(keyRoot + 11, "°7", context), "Sustitución simple: sensible disminuida");
        add(chordName(keyRoot + 1, "7", context), "Sustitución simple: dominante sustituto");
      }
      return out;
    }

    if (group === "tonica") {
      add(chordName(keyRoot, "maj7", context), "Sustitución simple: tónica");
      add(chordName(keyRoot, "sus4", context), "Sustitución simple: tónica suspendida");
      add(chordName(keyRoot + 4, "m7", context), "Sustitución simple: III");
      add(chordName(keyRoot + 4, "7sus4", context), "Sustitución simple: III suspendido");
      add(chordName(keyRoot + 9, "m7", context), "Sustitución simple: VI");
      add(chordName(keyRoot + 9, "9sus4", context), "Sustitución simple: VI suspendido");
    } else if (group === "subdominante") {
      add(chordName(keyRoot + 2, "m7", context), "Sustitución simple: II");
      add(chordName(keyRoot + 2, "9sus4", context), "Sustitución simple: II suspendido");
      add(chordName(keyRoot + 5, "maj7", context), "Sustitución simple: IV");
      add(chordName(keyRoot + 5, "6sus2", context), "Sustitución simple: IV suspendido");
      add(chordName(keyRoot + 7, "7sus4", context), "Sustitución simple: Vsus");
    } else if (group === "dominante") {
      add(chordName(keyRoot + 7, "7", context), "Sustitución simple: V");
      add(chordName(keyRoot + 7, "13sus4", context), "Sustitución simple: V suspendido");
      add(chordName(keyRoot + 11, "ø", context), "Sustitución simple: VIIø");
      add(chordName(keyRoot + 1, "7", context), "Sustitución simple: dominante sustituto");
    }

    return out;
  }

  function modalInterchangeSuggestions(context) {
    const parsed = context?.currentParsed;
    const keyRoot = tonalRootChroma(context);
    if (isSecondaryDegreeContext(context)) return [];
    if (!parsed || keyRoot === undefined) return [];

    const interval = intervalFromContextRoot(parsed, context);
    const mode = tonalMode(context);
    const rootName = noteNameForChroma(parsed.chroma, [parsed.root, context?.currentChord]);
    const out = [];
    const seen = new Set();
    const add = (suffix, detail) => addSuggestion(out, seen, {
      chord: `${rootName}${suffix}`,
      label: `${rootName}${suffix}`,
      detail,
      type: "replacement",
      family: "modal-interchange"
    });

    if (mode === "minor") {
      if (interval === 0) {
        add("m(maj7)", "Intercambio modal: menor armónica");
        add("m6", "Intercambio modal: menor melódica");
        add("sus4", "Intercambio modal: I suspendido");
        add("sus4(add2)", "Intercambio modal: I sus de menor armónica");
        add("sus4(addb2)", "Intercambio modal: I sus de menor melódica");
        add("maj7", "Intercambio modal: paralelo mayor");
      } else if (interval === 2) {
        add("ø", "Intercambio modal: II de menor armónica");
        add("sus4(addb2)", "Intercambio modal: II sus de menor melódica");
        add("7sus4(b9)", "Intercambio modal: II de menor melódica");
      } else if (interval === 7) {
        add("sus4(addb2)", "Intercambio modal: V sus de menor armónica");
        add("7(b9)", "Intercambio modal: V de menor armónica");
        add("7sus4(b9)", "Intercambio modal: V sus de menor armónica");
        add("7sus4", "Intercambio modal: V sus de menor melódica");
        add("9(b13)", "Intercambio modal: V de menor melódica");
        add("9sus4(b13)", "Intercambio modal: V sus de menor melódica");
        add("7alt", "Intercambio modal: dominante alterada");
      } else if (interval === 8) {
        add("sus4", "Intercambio modal: VI sus de menor armónica");
        add("6sus4", "Intercambio modal: VI sus extendido");
      }
      return out;
    }

    if (interval === 0) {
      add("maj7", "Intercambio modal: mayor natural");
      add("sus4", "Intercambio modal: I sus mayor");
      add("6sus4", "Intercambio modal: I sus extendido");
      add("m7", "Intercambio modal: eólica paralela");
      add("+maj7", "Intercambio modal: mayor armónica");
    } else if (interval === 2) {
      add("m7", "Intercambio modal: II mayor");
      add("7sus4", "Intercambio modal: II sus mayor");
      add("9sus4", "Intercambio modal: II sus extendido");
      add("ø", "Intercambio modal: II de mayor armónica");
    } else if (interval === 4) {
      add("7sus4", "Intercambio modal: III sus mayor");
    } else if (interval === 5) {
      add("maj7", "Intercambio modal: IV mayor");
      add("sus2", "Intercambio modal: IV sus mayor");
      add("6sus2", "Intercambio modal: IV sus extendido");
      add("m7", "Intercambio modal: IV eólico");
      add("m(maj7)", "Intercambio modal: IV mayor armónica");
    } else if (interval === 7) {
      add("7", "Intercambio modal: V mixolidio");
      add("7(b9)", "Intercambio modal: V mayor armónica");
      add("sus4(addb2)", "Intercambio modal: V sus mayor armónica");
      add("7sus4", "Intercambio modal: Vsus");
      add("7sus4(b9)", "Intercambio modal: V sus mayor armónica");
      add("13sus4", "Intercambio modal: Vsus extendido");
    } else if (interval === 9) {
      add("7sus4", "Intercambio modal: VI sus mayor");
      add("9sus4", "Intercambio modal: VI sus extendido");
    } else if (interval === 8) {
      add("maj7", "Intercambio modal: bVI eólico");
    } else if (interval === 10) {
      add("7", "Intercambio modal: bVII");
    }

    return out;
  }

  function expandedModalInterchangeSuggestions(context) {
    const keyRoot = tonalRootChroma(context);
    if (isSecondaryDegreeContext(context)) return [];
    if (!context?.currentParsed || keyRoot === undefined) return [];

    return parallelScaleSuggestionsFor(context, {
      key: context?.tonalContext?.key,
      keyChroma: keyRoot,
      mode: tonalMode(context),
      label: context?.tonalContext?.label || context?.tonalContext?.key || ""
    });
  }

  function sameRootColorSuggestions(context) {
    const parsed = context?.currentParsed;
    if (!parsed?.root) return [];

    const root = noteNameForChroma(parsed.chroma, [parsed.root, context?.currentChord]);
    const out = [];
    const seen = new Set();
    const add = (suffix, detail) => addSuggestion(out, seen, {
      chord: `${root}${suffix}`,
      label: `${root}${suffix}`,
      detail,
      type: "replacement",
      family: "same-root-color"
    });

    if (isDominant(parsed)) {
      [
        ["7sus4", "Color: dominante suspendida"],
        ["9", "Color: novena dominante"],
        ["13", "Color: trecena dominante"],
        ["7(b9)", "Color: b9 dominante"],
        ["7alt", "Color: dominante alterada"],
        ["13(#11)", "Color: dominante lidia"],
        ["9(b5)", "Color: disminuida HW"]
      ].forEach(([suffix, detail]) => add(suffix, detail));
      return out;
    }

    if (isMajorQuality(parsed)) {
      [
        ["6", "Color: sexta mayor"],
        ["maj7", "Color: séptima mayor"],
        ["maj9", "Color: novena mayor"],
        ["maj13", "Color: trecena mayor"],
        ["+maj7", "Color: mayor armónica"]
      ].forEach(([suffix, detail]) => add(suffix, detail));
      return out;
    }

    if (isMinorQuality(parsed)) {
      [
        ["m7", "Color: menor séptima"],
        ["m9", "Color: menor novena"],
        ["m11", "Color: menor oncena"],
        ["m6", "Color: menor melódica"],
        ["m(maj7)", "Color: menor armónica"]
      ].forEach(([suffix, detail]) => add(suffix, detail));
      return out;
    }

    if (isHalfDiminished(parsed)) {
      [
        ["ø", "Color: semidisminuido"],
        ["ø9", "Color: semidisminuido 9"],
        ["ø11", "Color: semidisminuido 11"]
      ].forEach(([suffix, detail]) => add(suffix, detail));
      return out;
    }

    if (isDiminishedQuality(parsed)) {
      [
        ["°7", "Color: disminuido séptima"],
        ["°7(b13)", "Color: disminuido extendido"]
      ].forEach(([suffix, detail]) => add(suffix, detail));
    }

    return out;
  }

  function dominantReplacementSuggestions(context) {
    const parsed = context?.currentParsed;
    if (!parsed || !/^7|^9|^13|\+7|7alt/.test(parsed.suffix || "")) return [];

    const out = [];
    const seen = new Set();
    const references = [parsed.root, context?.currentChord, context?.nextChord];
    const subRoot = noteNameForChroma(parsed.chroma + 6, references.includes("#") ? references : [...references, "b"]);
    const backdoorRoot = context?.nextParsed
      ? noteNameForChroma(context.nextParsed.chroma + 10, [context.nextParsed.root, "b"])
      : "";

    addSuggestion(out, seen, {
      chord: `${subRoot}7`,
      label: `${subRoot}7`,
      detail: `Tritono de ${chordLabel(parsed)}`,
      type: "replacement",
      family: "tritone-substitution"
    });

    addSuggestion(out, seen, {
      chord: `${subRoot}maj7`,
      label: `${subRoot}maj7`,
      detail: `Sustituto mayor de ${chordLabel(parsed)}`,
      type: "replacement",
      family: "major-tritone-substitution"
    });

    if (backdoorRoot) {
      addSuggestion(out, seen, {
        chord: `${backdoorRoot}7`,
        label: `${backdoorRoot}7`,
        detail: `Backdoor hacia ${targetLabel(context)}`,
        type: "replacement",
        family: "backdoor"
      });
    }

    return out;
  }

  function relativeTwoSuggestions(context) {
    const target = context?.nextParsed;
    const nextDegree = normalizeText(context?.nextDegree || "");
    const isNextMajorSub = /^V(?:∆|maj|M)/.test(nextDegree);
    const isNextSubDominant = /^V.*sub/i.test(nextDegree) && !isNextMajorSub;
    if (!target || (!isNextSubDominant && !/^7|^9|^13|7alt|\+7/.test(target.suffix || ""))) return [];

    const references = [target.root, context?.nextChord, context?.tonalContext?.key];
    const iiRoot = noteNameForChroma(target.chroma + 7, references);
    const subRoot = noteNameForChroma(target.chroma + 6, [target.root, "b"]);
    const iiSubRoot = noteNameForChroma(target.chroma + 1, [target.root, "b"]);
    const out = [];
    const seen = new Set();

    if (isNextSubDominant) {
      addSuggestion(out, seen, {
        chord: `${iiRoot}m7`,
        label: `${iiRoot}m7`,
        detail: `IIm7sub antes de ${targetLabel(context)}`,
        type: "preparation",
        family: "relative-two-sub"
      });
    }

    addSuggestion(out, seen, {
      chord: `${iiRoot}m7`,
      label: `${iiRoot}m7`,
      detail: `II relativo de ${targetLabel(context)} en mayor`,
      type: "preparation",
      family: "relative-two"
    });

    if (!isNextSubDominant) {
      addSuggestion(out, seen, {
        chord: `${iiRoot}ø`,
        label: `${iiRoot}ø`,
        detail: `II relativo de ${targetLabel(context)} en menor`,
        type: "preparation",
        family: "relative-two-minor"
      });
    }

    addSuggestion(out, seen, {
      chord: `${iiSubRoot}m7`,
      label: `${iiSubRoot}m7`,
      detail: `IIsub antes de ${subRoot}7, sustituto de ${targetLabel(context)}`,
      type: "preparation",
      family: "relative-two-sub"
    });

    return out;
  }

  function cadentialTwoReplacementSuggestions(context) {
    if (!isCadentialTwoToFive(context)) return [];

    const resolution = cadentialResolutionContext(context);
    if (!resolution) return [];

    const out = [];
    const seen = new Set();
    const iiRoot = noteNameForChroma(resolution.keyChroma + 2, [resolution.key, context?.currentChord]);
    const ivRoot = noteNameForChroma(resolution.keyChroma + 5, [resolution.key, context?.currentChord]);
    const vRoot = noteNameForChroma(resolution.keyChroma + 7, [resolution.key, context?.nextChord]);
    const detailSuffix = `en ${resolution.key}${resolution.mode === "minor" ? "m" : ""}`;

    if (resolution.mode === "minor") {
      addSuggestion(out, seen, {
        chord: `${iiRoot}ø`,
        label: `${iiRoot}ø`,
        detail: `II relativo menor ${detailSuffix}`,
        type: "replacement",
        family: "cadential-two"
      });
      addSuggestion(out, seen, {
        chord: `${iiRoot}m7`,
        label: `${iiRoot}m7`,
        detail: `II relativo mayor como alternativa ${detailSuffix}`,
        type: "replacement",
        family: "cadential-two"
      });
      addSuggestion(out, seen, {
        chord: `${ivRoot}m7`,
        label: `${ivRoot}m7`,
        detail: `Subdominante menor equivalente ${detailSuffix}`,
        type: "replacement",
        family: "cadential-two"
      });
    } else {
      addSuggestion(out, seen, {
        chord: `${iiRoot}m7`,
        label: `${iiRoot}m7`,
        detail: `II relativo mayor ${detailSuffix}`,
        type: "replacement",
        family: "cadential-two"
      });
      addSuggestion(out, seen, {
        chord: `${iiRoot}ø`,
        label: `${iiRoot}ø`,
        detail: `II relativo menor como color ${detailSuffix}`,
        type: "replacement",
        family: "cadential-two"
      });
      addSuggestion(out, seen, {
        chord: `${ivRoot}maj7`,
        label: `${ivRoot}maj7`,
        detail: `Subdominante equivalente ${detailSuffix}`,
        type: "replacement",
        family: "cadential-two"
      });
    }

    addSuggestion(out, seen, {
      chord: `${vRoot}7sus4`,
      label: `${vRoot}7sus4`,
      detail: `Vsus con función subdominante ${detailSuffix}`,
      type: "replacement",
      family: "cadential-two"
    });

    return out;
  }

  function secondaryDegreeTarget(context) {
    const degree = normalizeText(context?.currentDegree || "");
    const match = degree.match(/\/\s*([#b]*)(I{1,3}|IV|V|VI{0,2}|VII)\b/i);
    const keyRoot = tonalRootChroma(context);
    if (!match || keyRoot === undefined) return null;

    const roman = match[2].toUpperCase();
    const accidental = match[1] || "";
    const mode = tonalMode(context);
    const majorMap = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
    const minorMap = { I: 0, II: 2, III: 3, IV: 5, V: 7, VI: 8, VII: 10 };
    const base = (mode === "minor" ? minorMap : majorMap)[roman];
    if (base === undefined) return null;

    const accidentalOffset = (accidental.match(/#/g) || []).length - (accidental.match(/b/g) || []).length;
    const keyChroma = mod12(keyRoot + base + accidentalOffset);
    const currentDegree = degree.split("/")[0] || "";
    let localMode = /ø|b9|alt|b13/i.test(currentDegree) ? "minor" : "major";
    if (context?.nextParsed && context.nextParsed.chroma === keyChroma) {
      if (isMinorTarget(context.nextParsed)) localMode = "minor";
      else if (isMajorQuality(context.nextParsed)) localMode = "major";
    } else if (mode === "major" && ["II", "III", "VI"].includes(roman)) {
      localMode = "minor";
    } else if (mode === "minor" && ["I", "IV"].includes(roman)) {
      localMode = "minor";
    }
    const key = noteNameForChroma(keyChroma, [context?.tonalContext?.key, context?.currentChord, context?.nextChord]);
    return { key, keyChroma, mode: localMode, localDegree: currentDegree };
  }

  function secondaryRegionSubstitutionSuggestions(context) {
    const region = secondaryDegreeTarget(context);
    if (!region || !context?.currentParsed) return [];

    const localDegree = region.localDegree.toUpperCase();
    const out = [];
    const seen = new Set();
    const add = (rootChroma, suffix, detail) => {
      const chord = `${noteNameForChroma(rootChroma, [region.key, context?.currentChord])}${suffix}`;
      addSuggestion(out, seen, {
        chord,
        label: chord,
        detail: `${detail} en region ${region.key}${region.mode === "minor" ? "m" : ""}`,
        type: "replacement",
        family: "secondary-region"
      });
    };

    if (/^II/.test(localDegree)) {
      if (region.mode === "minor") {
        add(region.keyChroma + 2, "ø", "II relativo menor");
        add(region.keyChroma + 5, "m7", "IVm equivalente");
      } else {
        add(region.keyChroma + 2, "m7", "II relativo mayor");
        add(region.keyChroma + 5, "maj7", "IV equivalente");
      }
      add(region.keyChroma + 7, "7sus4", "Vsus subdominante");
    } else if (/^V(?!I)/.test(localDegree) || /^B?VII/.test(localDegree)) {
      if (region.mode === "minor") {
        add(region.keyChroma + 2, "ø", "II relativo menor");
        add(region.keyChroma + 2, "m7", "II relativo mayor como color");
      } else {
        add(region.keyChroma + 2, "m7", "II relativo");
      }
      add(region.keyChroma + 8, "m7", "IIsub local");
      add(region.keyChroma + 7, region.mode === "minor" ? "7(b9)" : "7", "Dominante");
      add(region.keyChroma + 1, "7", "Dominante sustituto");
      add(region.keyChroma + 1, "maj7", "Sustituto mayor");
      add(region.keyChroma + 10, "7", "Backdoor");
      const leadingToneRoot = noteNameForChroma(region.keyChroma + 11, [region.key, "#"]);
      if (region.mode === "minor") {
        addSuggestion(out, seen, {
          chord: `${leadingToneRoot}°7`,
          label: `${leadingToneRoot}°7`,
          detail: `Sensible disminuida en region ${region.key}m`,
          type: "replacement",
          family: "secondary-region"
        });
      } else {
        addSuggestion(out, seen, {
          chord: `${leadingToneRoot}ø`,
          label: `${leadingToneRoot}ø`,
          detail: `VII semidisminuido en region ${region.key}`,
          type: "replacement",
          family: "secondary-region"
        });
      }
    } else if (/^(I|III|VI)\b/.test(localDegree)) {
      if (region.mode === "minor") {
        add(region.keyChroma, "m7", "Tonica menor");
        add(region.keyChroma + 3, "maj7", "III equivalente");
        add(region.keyChroma + 8, "maj7", "VI equivalente");
      } else {
        add(region.keyChroma, "maj7", "Tonica");
        add(region.keyChroma + 4, "m7", "III equivalente");
        add(region.keyChroma + 9, "m7", "VI equivalente");
      }
    }

    return out;
  }

  function secondaryRegionModalInterchangeSuggestions(context) {
    const region = secondaryDegreeTarget(context);
    if (!region || !context?.currentParsed) return [];

    return parallelScaleSuggestionsFor(context, {
      ...region,
      label: `region ${regionModeLabel(region)}`
    }, "Intercambio modal local");
  }

  function diatonicNeighborPreparationSuggestions(context) {
    const target = context?.nextParsed;
    const keyRoot = tonalRootChroma(context);
    if (!canPrepareTarget(target) || keyRoot === undefined) return [];
    if (isDominant(target)) return [];

    const mode = tonalMode(context);
    const targetInterval = mod12(target.chroma - keyRoot);
    const out = [];
    const seen = new Set();
    const targetName = targetLabel(context);
    const add = (rootChroma, suffix, detail) => addSuggestion(out, seen, {
      chord: chordName(rootChroma, suffix, context),
      label: chordName(rootChroma, suffix, context),
      detail: `${detail} hacia ${targetName}`,
      type: "preparation",
      family: "diatonic-neighbor"
    });

    if (mode === "minor") {
      if (targetInterval === 0) add(keyRoot + 2, "ø", "Subdominante diatónica");
      if (targetInterval === 3) add(keyRoot + 7, "7(b9)", "Dominante secundaria");
      if (targetInterval === 5) add(keyRoot + 2, "ø", "II relativo menor");
      if (targetInterval === 7) add(keyRoot + 5, "m7", "Subdominante menor");
      return out;
    }

    if (targetInterval === 0) add(keyRoot + 2, "m7", "Subdominante diatónica");
    if (targetInterval === 4) add(keyRoot + 9, "m7", "Función tónica previa");
    if (targetInterval === 5) add(keyRoot + 2, "m7", "II relativo");
    if (targetInterval === 7) add(keyRoot + 2, "m7", "II relativo del V");

    return out;
  }

  function buildContext({ song, pageIndex, measureIndex, slotIndex, virtualEmpty = false, visualPulse = null, parseChord: parseChordFn } = {}) {
    const entries = flatSlots(song);
    const current = findSlotEntry(entries, pageIndex, measureIndex, slotIndex);
    const currentIndex = current ? entries.indexOf(current) : -1;
    const next = currentIndex >= 0
      ? virtualEmpty
        ? findNextFilledEntryForVirtualPulse(entries, currentIndex, pageIndex, measureIndex, visualPulse)
        : findNextFilledEntry(entries, currentIndex)
      : null;
    const previous = currentIndex >= 0 ? findPreviousFilledEntry(entries, currentIndex) : null;
    const currentChord = virtualEmpty ? "" : slotChord(current?.slot);
    const tonalIndex = virtualEmpty ? Math.max(0, currentIndex - 1) : currentIndex;

    return {
      pageIndex,
      measureIndex,
      slotIndex,
      visualPulse,
      isEmptySlot: virtualEmpty || !currentChord,
      currentChord,
      nextChord: slotChord(next?.slot),
      previousChord: slotChord(previous?.slot),
      currentDegree: virtualEmpty ? "" : normalizeText(current?.slot?.degree),
      nextDegree: normalizeText(next?.slot?.degree),
      previousDegree: normalizeText(previous?.slot?.degree),
      currentParsed: parseChord(parseChordFn, currentChord),
      nextParsed: parseChord(parseChordFn, slotChord(next?.slot)),
      previousParsed: parseChord(parseChordFn, slotChord(previous?.slot)),
      tonalContext: currentIndex >= 0 ? visibleTonalContext(entries, tonalIndex) || visibleTonalContext(entries, currentIndex) : null,
      hasCurrentChord: !!currentChord,
      hasNextChord: !!slotChord(next?.slot)
    };
  }

  function suggestionsForSlot(context) {
    if (!context?.hasCurrentChord && !context?.hasNextChord) return [];

    const out = [];
    const seen = new Set();
    const current = normalizeText(context?.currentChord).toLowerCase();
    const groups = context.isEmptySlot
      ? [
        preparationSuggestions(context),
        dominantColorPreparationSuggestions(context),
        diminishedApproachSuggestions(context),
        relativeTwoSuggestions(context)
      ]
      : [
        preparationSuggestions(context),
        dominantColorPreparationSuggestions(context),
        diminishedApproachSuggestions(context),
        diatonicNeighborPreparationSuggestions(context),
        relativeTwoSuggestions(context),
        cadentialTwoReplacementSuggestions(context),
        dominantReplacementSuggestions(context),
        sameRootColorSuggestions(context),
        secondaryRegionSubstitutionSuggestions(context),
        secondaryRegionModalInterchangeSuggestions(context),
        simpleSubstitutionSuggestions(context),
        expandedModalInterchangeSuggestions(context),
        modalInterchangeSuggestions(context)
      ];

    groups.flat().forEach(suggestion => {
      if (normalizeText(suggestion?.chord).toLowerCase() === current) return;
      addSuggestion(out, seen, suggestion);
    });

    return out;
  }

  global.Reharmonization = {
    buildContext,
    suggestionsForSlot
  };
})(window);
