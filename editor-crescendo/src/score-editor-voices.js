(function () {
  function entryVoice(entry) {
    return Number(entry?.voice) === 2 ? 2 : 1;
  }

  function setEntryVoice(entry, voice = 1) {
    if (!entry) return entry;
    const normalizedVoice = Number(voice) === 2 ? 2 : 1;
    if (normalizedVoice === 2) {
      entry.voice = 2;
      entry.manualStemDirection = -1;
    } else {
      delete entry.voice;
    }
    return entry;
  }

  function isSecondaryVoiceEntry(entry) {
    return entryVoice(entry) === 2;
  }

  function measureVoiceEntries(measure, voice = 1) {
    const normalizedVoice = Number(voice) === 2 ? 2 : 1;
    return (measure?.entries || []).filter((entry) => entryVoice(entry) === normalizedVoice);
  }

  function measurePrimaryEntries(measure) {
    return measureVoiceEntries(measure, 1);
  }

  function measureSecondaryEntries(measure) {
    return measureVoiceEntries(measure, 2);
  }

  function measureHasSecondaryVoice(measure) {
    return measureSecondaryEntries(measure).some((entry) => entry.type === "note");
  }

  function measureHasMultipleVoices(measure) {
    return measureHasSecondaryVoice(measure) &&
      measurePrimaryEntries(measure).some((entry) => entry.type === "note");
  }

  function measureHasVoiceLayers(measure, options = {}) {
    const isMeasureRestEntry = options.isMeasureRestEntry || (() => false);
    return measureSecondaryEntries(measure).length > 0 &&
      measurePrimaryEntries(measure).some((entry) => !isMeasureRestEntry(entry));
  }

  window.JMLScoreVoices = Object.freeze({
    entryVoice,
    isSecondaryVoiceEntry,
    measureHasMultipleVoices,
    measureHasSecondaryVoice,
    measureHasVoiceLayers,
    measurePrimaryEntries,
    measureSecondaryEntries,
    measureVoiceEntries,
    setEntryVoice
  });
})();
