(function () {
  // Hasta 4 voces independientes por pentagrama. Para todo lo que dependía
  // de "voz 1 o voz 2" (dirección de la plica, separación de colisiones),
  // las voces impares (1 y 3) se agrupan como "primaria" (plica natural
  // según la altura) y las pares (2 y 4) como "secundaria" (plica hacia
  // abajo) — el mismo criterio que ya existía entre las voces 1 y 2.
  function entryVoice(entry) {
    const raw = Math.round(Number(entry?.voice));
    return raw >= 1 && raw <= 4 ? raw : 1;
  }

  function setEntryVoice(entry, voice = 1) {
    if (!entry) return entry;
    const normalizedVoice = Math.max(1, Math.min(4, Math.round(Number(voice)) || 1));
    if (normalizedVoice === 1) {
      delete entry.voice;
    } else {
      entry.voice = normalizedVoice;
    }
    if (normalizedVoice === 2 || normalizedVoice === 4) {
      entry.manualStemDirection = -1;
    }
    return entry;
  }

  function isSecondaryVoiceEntry(entry) {
    return entryVoice(entry) % 2 === 0;
  }

  function measureVoiceEntries(measure, voice = 1) {
    const normalizedVoice = Math.max(1, Math.min(4, Math.round(Number(voice)) || 1));
    return (measure?.entries || []).filter((entry) => entryVoice(entry) === normalizedVoice);
  }

  function measurePrimaryEntries(measure) {
    return measureVoiceEntries(measure, 1);
  }

  function measureSecondaryEntries(measure) {
    return measureVoiceEntries(measure, 2);
  }

  function measureVoicesInUse(measure) {
    const voices = new Set();
    (measure?.entries || []).forEach((entry) => {
      if (entry.type === "note" || entry.type === "rest") voices.add(entryVoice(entry));
    });
    return voices;
  }

  function measureHasSecondaryVoice(measure) {
    return (measure?.entries || []).some((entry) => entryVoice(entry) !== 1 && entry.type === "note");
  }

  function measureHasMultipleVoices(measure) {
    const voicesWithNotes = new Set();
    (measure?.entries || []).forEach((entry) => {
      if (entry.type === "note") voicesWithNotes.add(entryVoice(entry));
    });
    return voicesWithNotes.size > 1;
  }

  function measureHasVoiceLayers(measure, options = {}) {
    const isMeasureRestEntry = options.isMeasureRestEntry || (() => false);
    const hasAnySecondary = (measure?.entries || []).some((entry) => entryVoice(entry) !== 1);
    const hasRealPrimary = measurePrimaryEntries(measure).some((entry) => !isMeasureRestEntry(entry));
    return hasAnySecondary && hasRealPrimary;
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
    measureVoicesInUse,
    setEntryVoice
  });
})();
