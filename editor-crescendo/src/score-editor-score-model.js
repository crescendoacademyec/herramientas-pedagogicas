(function () {
  function createId(prefix = "") {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `${prefix}${Date.now()}-${Math.random()}`;
  }

  function makeEntry(options = {}) {
    const {
      type,
      duration,
      staffStep = 0,
      accidental = null
    } = options;
    return {
      id: createId(),
      type,
      durationId: duration.id,
      ticks: duration.ticks,
      flags: duration.flags,
      dotted: false,
      dots: 0,
      tieToNext: false,
      tieStaffStep: null,
      staffStep,
      accidental,
      tickStart: 0
    };
  }

  function makeMeasureRest(options = {}) {
    const {
      ticks = 16,
      durations = []
    } = options;
    const whole = durations.find((duration) => duration.id === "whole") || durations.at(-1);
    const rest = makeEntry({ type: "rest", duration: whole, staffStep: 0, accidental: null });
    rest.isMeasureRest = true;
    rest.ticks = ticks;
    return rest;
  }

  function createMeasure(options = {}) {
    const {
      meter = null,
      ticks = 16,
      durations = []
    } = options;
    const measure = { entries: [makeMeasureRest({ ticks, durations })] };
    if (meter) measure.meter = { ...meter };
    return measure;
  }

  function createInitialMeasures(options = {}) {
    const {
      count = 8,
      createMeasure: createMeasureCallback
    } = options;
    return Array.from({ length: count }, () => createMeasureCallback());
  }

  function normalizePercussionEntry(entry) {
    if (!entry || entry.type === "rest") return;
    entry.staffStep = 0;
    delete entry.chordSteps;
    delete entry.diatonicStep;
    delete entry.chordDiatonicSteps;
    delete entry.tieDiatonicStep;
    if (Number.isFinite(entry.tieStaffStep)) entry.tieStaffStep = 0;
    delete entry.accidentalsByStep;
    delete entry.accidentalsByDiatonicStep;
    entry.accidental = null;
  }

  window.JMLScoreModel = Object.freeze({
    createInitialMeasures,
    createMeasure,
    makeEntry,
    makeMeasureRest,
    normalizePercussionEntry
  });
})();
