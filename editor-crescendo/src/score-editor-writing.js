(function () {
  const EPSILON = 0.0001;

  function createId() {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  }

  function retimeMeasure(measure, voice = 1, measureVoiceEntries = () => []) {
    let tickStart = 0;
    measureVoiceEntries(measure, voice).forEach((entry) => {
      entry.tickStart = tickStart;
      tickStart += entry.ticks;
    });
  }

  function setEntryDuration(entry, duration, clearTupletMetadata = () => {}) {
    entry.durationId = duration.id;
    entry.ticks = duration.ticks;
    entry.flags = duration.flags;
    entry.dotted = false;
    entry.dots = 0;
    clearTupletMetadata(entry);
    if (entry.type === "rest") {
      entry.accidental = null;
      delete entry.accidentalsByStep;
      delete entry.accidentalsByDiatonicStep;
      delete entry.diatonicStep;
      delete entry.chordDiatonicSteps;
      entry.tieToNext = false;
      entry.tieStaffStep = null;
      entry.tieDiatonicStep = null;
    }
  }

  function cloneEntryForPaste(entry) {
    const copy = JSON.parse(JSON.stringify(entry));
    copy.id = createId();
    copy.tickStart = 0;
    return copy;
  }

  function findLastEntryLocation(measures = [], voice = 1, entryVoice = () => 1) {
    const voiceFilter = Number(voice) === 2 ? 2 : 1;
    for (let measureIndex = measures.length - 1; measureIndex >= 0; measureIndex -= 1) {
      const entries = measures[measureIndex]?.entries || [];
      for (let entryIndex = entries.length - 1; entryIndex >= 0; entryIndex -= 1) {
        const entry = entries[entryIndex];
        if ((entry.type === "note" || entry.type === "rest") && entryVoice(entry) === voiceFilter) {
          return { measureIndex, entryIndex, entry };
        }
      }
    }
    return null;
  }

  function noteEntryLocationAtCursor(options = {}) {
    const {
      measures = [],
      cursorActive = false,
      cursorMeasure = 0,
      cursorTick = 0,
      voice = 1,
      entryVoice = () => 1,
      epsilon = EPSILON
    } = options;
    if (!cursorActive) return null;
    const measureIndex = Math.max(0, Math.min(measures.length - 1, Number(cursorMeasure) || 0));
    const measure = measures[measureIndex];
    if (!measure) return null;
    const tick = Number(cursorTick) || 0;
    const voiceFilter = Number(voice) === 2 ? 2 : 1;
    const entryIndex = measure.entries.findIndex((entry) => (
      entry?.type === "note" &&
      entryVoice(entry) === voiceFilter &&
      entry.tickStart <= tick + epsilon &&
      tick < entry.tickStart + entry.ticks - epsilon
    ));
    return entryIndex >= 0 ? { measureIndex, entryIndex, entry: measure.entries[entryIndex] } : null;
  }

  function findPreviousFigureLocation(options = {}) {
    const {
      activeNoteLocation = null,
      activeVoice = 1,
      selection = null,
      lastLocation = null,
      entryVoice = () => 1
    } = options;
    if (activeNoteLocation?.entry && entryVoice(activeNoteLocation.entry) === activeVoice) return activeNoteLocation;
    if (selection?.entry) return selection;
    return lastLocation;
  }

  function replaceEntryWithRests(options = {}) {
    const {
      measure,
      entryIndex,
      restEntries = [],
      voice = 1,
      explicitRest = false,
      shouldNormalize = true,
      setEntryVoice = (entry) => entry,
      normalizeMeasure = () => {},
      retime = () => {}
    } = options;
    const entry = measure?.entries?.[entryIndex];
    if (!entry) return false;
    const nextRests = restEntries.map((rest) => setEntryVoice(explicitRest ? { ...rest, explicitRest: true } : rest, voice));
    measure.entries.splice(entryIndex, 1, ...nextRests);
    if (shouldNormalize) normalizeMeasure(measure);
    else retime(measure, voice);
    return true;
  }

  function removeSelectedHeadsFromEntry(entry, staffStepsToRemove = [], helpers = {}) {
    const {
      entryStaffSteps = () => [],
      clearEntryAccidental = () => {},
      clearEntryNoteColor = () => {},
      clearEntryNoteheadGlyph = () => {},
      setEntryStaffSteps = () => {}
    } = helpers;
    const removeSet = new Set(staffStepsToRemove.map(String));
    const remainingSteps = entryStaffSteps(entry).filter((staffStep) => !removeSet.has(String(staffStep)));
    if (!remainingSteps.length) return false;
    staffStepsToRemove.forEach((staffStep) => {
      clearEntryAccidental(entry, staffStep);
      clearEntryNoteColor(entry, staffStep);
      clearEntryNoteheadGlyph(entry, staffStep);
    });
    setEntryStaffSteps(entry, remainingSteps);
    return true;
  }

  function selectedRepeatUnits(options = {}) {
    const {
      noteLocations = [],
      entryLocations = [],
      cloneEntryForPaste: clone = cloneEntryForPaste,
      cloneEntryWithStaffSteps,
      absoluteTickForLocation = () => 0
    } = options;
    const noteEntryIds = new Set(noteLocations.map((location) => location.entry.id));
    const groupedNotes = new Map();
    noteLocations.forEach((location) => {
      if (!groupedNotes.has(location.entry.id)) groupedNotes.set(location.entry.id, { location, staffSteps: [] });
      groupedNotes.get(location.entry.id).staffSteps.push(location.staffStep);
    });
    const units = [
      ...entryLocations
        .filter((location) => !noteEntryIds.has(location.entry.id))
        .map((location) => ({
          sourceAbsTick: absoluteTickForLocation(location),
          entry: clone(location.entry)
        })),
      ...[...groupedNotes.values()].map(({ location, staffSteps }) => ({
        sourceAbsTick: absoluteTickForLocation(location),
        entry: cloneEntryWithStaffSteps(location.entry, staffSteps)
      }))
    ].sort((a, b) => a.sourceAbsTick - b.sourceAbsTick);
    if (!units.length) return [];
    const start = units[0].sourceAbsTick;
    return units.map((unit) => ({ ...unit, offset: unit.sourceAbsTick - start }));
  }

  function restSegment({ ticks, tickStart, restEntries = [], setEntryVoice = (entry) => entry, voice = 1 } = {}) {
    let cursor = tickStart;
    return restEntries.map((rest) => {
      setEntryVoice(rest, voice);
      rest.tickStart = cursor;
      cursor += rest.ticks;
      return rest;
    });
  }

  function activeGridDuration({ activeTuplet = null, gridDurationId = "eighth", durationById = () => null, defaultGridDurationId = "eighth", durations = [], tupletUnitTicks = () => null } = {}) {
    const unit = activeTuplet ? durationById(activeTuplet.unitDurationId) : null;
    if (activeTuplet && unit) {
      return {
        ...unit,
        ticks: tupletUnitTicks(activeTuplet) ?? unit.ticks,
        tuplet: activeTuplet
      };
    }
    return durationById(gridDurationId) || durationById(defaultGridDurationId) || durations[3];
  }

  function keepTupletForDuration(activeTuplet, duration) {
    return activeTuplet?.unitDurationId === duration?.id;
  }

  window.JMLScoreWriting = Object.freeze({
    activeGridDuration,
    cloneEntryForPaste,
    findLastEntryLocation,
    findPreviousFigureLocation,
    keepTupletForDuration,
    noteEntryLocationAtCursor,
    removeSelectedHeadsFromEntry,
    replaceEntryWithRests,
    restSegment,
    retimeMeasure,
    selectedRepeatUnits,
    setEntryDuration
  });
})();
