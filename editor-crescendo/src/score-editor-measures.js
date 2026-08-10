(function () {
  function primaryMeasures(systems, fallbackMeasures = []) {
    return systems?.[0]?.measures || fallbackMeasures;
  }

  function measureIsHidden(systems, fallbackMeasures, index) {
    return primaryMeasures(systems, fallbackMeasures)[index]?.hidden === true;
  }

  function setMeasureHidden(systems, index, hidden) {
    (systems || []).forEach((system) => {
      if (!Array.isArray(system.measures)) return;
      if (system.measures[index]) system.measures[index].hidden = hidden === true;
    });
  }

  function selectedMeasureIndex(state) {
    const maxIndex = Math.max(0, (state?.measures?.length || 1) - 1);
    if (Number.isFinite(state?.selectedMeasureIndex)) {
      return Math.max(0, Math.min(maxIndex, state.selectedMeasureIndex));
    }
    return Math.max(0, Math.min(maxIndex, Number(state?.cursorMeasure) || 0));
  }

  function measureUsed(measure, voice = 1, measureVoiceEntries) {
    return measureVoiceEntries(measure, voice).reduce((maxEnd, entry) => (
      Math.max(maxEnd, (Number(entry?.tickStart) || 0) + Math.max(0, Number(entry?.ticks) || 0))
    ), 0);
  }

  function measureIsFull(measure, targetTicks, options = {}) {
    const { voice = 1, epsilon = 0.0001, measureVoiceEntries } = options;
    if (!measure || typeof measureVoiceEntries !== "function") return false;
    return measureUsed(measure, voice, measureVoiceEntries) >= targetTicks - epsilon;
  }

  function isMeasureRestEntry(entry, targetTicks, options = {}) {
    const { isSecondaryVoiceEntry = () => false, epsilon = 0.0001 } = options;
    return !isSecondaryVoiceEntry(entry) &&
      entry?.type === "rest" &&
      entry.durationId === "whole" &&
      entry.ticks >= targetTicks - epsilon;
  }

  function isEmptyMeasure(measure, targetTicks, options = {}) {
    return measure?.entries?.length === 1 && isMeasureRestEntry(measure.entries[0], targetTicks, options);
  }

  window.JMLScoreMeasures = Object.freeze({
    isEmptyMeasure,
    isMeasureRestEntry,
    measureIsFull,
    measureIsHidden,
    measureUsed,
    primaryMeasures,
    selectedMeasureIndex,
    setMeasureHidden
  });
})();
