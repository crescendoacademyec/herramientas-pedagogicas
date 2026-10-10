(function () {
  const EPSILON = 0.0001;
  const DEFAULT_GRID_DURATION_ID = "eighth";
  const COMPLETE_DURATION_SYMBOLS = Object.freeze({
    "one-twenty-eighth": "𝅘𝅥𝅲",
    "sixty-fourth": "𝅘𝅥𝅱",
    "thirty-second": "𝅘𝅥𝅰",
    sixteenth: "𝅘𝅥𝅯",
    eighth: "𝅘𝅥𝅮",
    quarter: "𝅘𝅥",
    half: "𝅗𝅥",
    whole: "𝅝",
    breve: "𝅜"
  });

  const DURATIONS = Object.freeze([
    { key: "1", id: "one-twenty-eighth", label: "Garrapatea", symbol: COMPLETE_DURATION_SYMBOLS["one-twenty-eighth"], ticks: 0.125, flags: 5, music: true },
    { key: "2", id: "sixty-fourth", label: "Semifusa", symbol: COMPLETE_DURATION_SYMBOLS["sixty-fourth"], ticks: 0.25, flags: 4, music: true },
    { key: "3", id: "thirty-second", label: "Fusa", symbol: COMPLETE_DURATION_SYMBOLS["thirty-second"], ticks: 0.5, flags: 3, music: true },
    { key: "4", id: "sixteenth", label: "Semicorchea", symbol: COMPLETE_DURATION_SYMBOLS.sixteenth, ticks: 1, flags: 2, music: true },
    { key: "5", id: "eighth", label: "Corchea", symbol: COMPLETE_DURATION_SYMBOLS.eighth, ticks: 2, flags: 1, music: true },
    { key: "6", id: "quarter", label: "Negra", symbol: COMPLETE_DURATION_SYMBOLS.quarter, ticks: 4, flags: 0, music: true },
    { key: "7", id: "half", label: "Blanca", symbol: COMPLETE_DURATION_SYMBOLS.half, ticks: 8, flags: 0, music: true },
    { key: "8", id: "whole", label: "Redonda", symbol: COMPLETE_DURATION_SYMBOLS.whole, ticks: 16, flags: 0, music: true },
    { key: "9", id: "breve", label: "Cuadrada", symbol: COMPLETE_DURATION_SYMBOLS.breve, ticks: 32, flags: 0, music: true }
  ]);

  const DENOMINATORS = Object.freeze({
    breve: 0.5,
    whole: 1,
    half: 2,
    quarter: 4,
    eighth: 8,
    sixteenth: 16,
    "thirty-second": 32,
    "sixty-fourth": 64,
    "one-twenty-eighth": 128
  });

  const byId = new Map(DURATIONS.map((duration) => [duration.id, duration]));

  function durationById(id) {
    return byId.get(id) || null;
  }

  function durationByTicks(ticks) {
    return DURATIONS.find((duration) => Math.abs(duration.ticks - ticks) < EPSILON) || null;
  }

  function durationInfoByTicks(ticks) {
    const exact = durationByTicks(ticks);
    if (exact) return { duration: exact, dotted: false, dots: 0 };
    const dotted = DURATIONS.find((duration) => Math.abs(duration.ticks * 1.5 - ticks) < EPSILON);
    if (dotted) return { duration: dotted, dotted: true, dots: 1 };
    const doubleDotted = DURATIONS.find((duration) => Math.abs(duration.ticks * 1.75 - ticks) < EPSILON);
    return doubleDotted ? { duration: doubleDotted, dotted: true, dots: 2 } : null;
  }

  function durationDenominator(durationId) {
    return DENOMINATORS[durationId] || "";
  }

  function dotCountForEntry(entry) {
    const dots = Number(entry?.dots);
    if (Number.isFinite(dots) && dots > 0) return Math.min(2, Math.max(1, Math.round(dots)));
    return entry?.dotted ? 1 : 0;
  }

  function dotFactor(dotCount) {
    if (dotCount === 2) return 1.75;
    if (dotCount === 1) return 1.5;
    return 1;
  }

  function restGlyphNameForDuration(durationId) {
    return {
      breve: "restDoubleWhole",
      whole: "restWhole",
      half: "restHalf",
      quarter: "restQuarter",
      eighth: "rest8th",
      sixteenth: "rest16th",
      "thirty-second": "rest32nd",
      "sixty-fourth": "rest64th",
      "one-twenty-eighth": "rest128th"
    }[durationId] || "restQuarter";
  }

  window.JMLScoreDurations = Object.freeze({
    DEFAULT_GRID_DURATION_ID,
    COMPLETE_DURATION_SYMBOLS,
    DURATIONS,
    durationById,
    durationByTicks,
    durationInfoByTicks,
    durationDenominator,
    dotCountForEntry,
    dotFactor,
    restGlyphNameForDuration
  });
})();
