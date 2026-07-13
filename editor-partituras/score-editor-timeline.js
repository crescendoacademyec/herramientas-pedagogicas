(function (root) {
  const EPSILON = 0.0001;

  function entryVoice(entry) {
    return Number(entry?.voice) === 2 ? 2 : 1;
  }

  function entryStart(entry) {
    return Math.max(0, Number(entry?.tickStart) || 0);
  }

  function entryEnd(entry) {
    return entryStart(entry) + Math.max(0, Number(entry?.ticks) || 0);
  }

  function sortEntries(entries = []) {
    return [...entries].sort((a, b) => (
      entryStart(a) - entryStart(b) ||
      entryVoice(a) - entryVoice(b) ||
      String(a?.id || "").localeCompare(String(b?.id || ""))
    ));
  }

  function voiceEntries(entries = [], voice = 1) {
    const normalizedVoice = Number(voice) === 2 ? 2 : 1;
    return sortEntries(entries.filter((entry) => entryVoice(entry) === normalizedVoice));
  }

  function usedTicks(entries = [], voice = 1) {
    return voiceEntries(entries, voice).reduce((max, entry) => Math.max(max, entryEnd(entry)), 0);
  }

  function events(entries = [], voice = null, options = {}) {
    const source = Number.isFinite(Number(voice)) ? voiceEntries(entries, voice) : sortEntries(entries);
    return source.filter((entry) => (
      !entry?.hiddenTupletReserve &&
      (options.includeRests !== false || entry?.type !== "rest")
    ));
  }

  function eventTicks(entries = [], voice = null, options = {}) {
    return [...new Set(events(entries, voice, options).map((entry) => entryStart(entry)))]
      .sort((a, b) => a - b);
  }

  function directionalGridTick(currentTick, step, direction, minTick = 0, maxTick = Infinity) {
    const safeStep = Math.max(EPSILON, Number(step) || 1);
    const current = Number(currentTick) || 0;
    const next = direction < 0
      ? (Math.ceil((current - EPSILON) / safeStep) - 1) * safeStep
      : (Math.floor((current + EPSILON) / safeStep) + 1) * safeStep;
    return Math.max(minTick, Math.min(maxTick, next));
  }

  function nearestGridOrEventTick(options = {}) {
    const {
      entries: source = [],
      voice = 1,
      currentTick = 0,
      gridStep = 1,
      direction = 1,
      minTick = 0,
      maxTick = Infinity,
      includeRests = true
    } = options;
    const current = Number(currentTick) || 0;
    const gridTick = directionalGridTick(current, gridStep, direction, minTick, maxTick);
    const ticks = eventTicks(source, voice, { includeRests });
    const eventTick = direction < 0
      ? ticks.filter((tick) => tick < current - EPSILON).at(-1)
      : ticks.find((tick) => tick > current + EPSILON);
    if (!Number.isFinite(eventTick)) return gridTick;
    if (Math.abs(eventTick - current) < Math.abs(gridTick - current) - EPSILON) return eventTick;
    return gridTick;
  }

  function overlaps(entry, start, end) {
    return entryEnd(entry) > start + EPSILON && entryStart(entry) < end - EPSILON;
  }

  function atTick(entries = [], tick, voice = null) {
    const current = Number(tick) || 0;
    return events(entries, voice).filter((entry) => Math.abs(entryStart(entry) - current) < EPSILON);
  }

  const api = Object.freeze({
    EPSILON,
    atTick,
    directionalGridTick,
    entryEnd,
    entryStart,
    entryVoice,
    eventTicks,
    events,
    nearestGridOrEventTick,
    overlaps,
    sortEntries,
    usedTicks,
    voiceEntries
  });

  root.JMLScoreTimeline = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
