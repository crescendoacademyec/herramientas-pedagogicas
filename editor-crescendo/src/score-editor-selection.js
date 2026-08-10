(function () {
  function uniqueNoteRefs(refs = []) {
    const seen = new Set();
    return refs
      .filter((ref) => ref && ref.entryId && Number.isFinite(ref.staffStep))
      .filter((ref) => {
        const key = `${ref.entryId}:${ref.staffStep}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function noteHeadIsSelected(options = {}) {
    const {
      entryId,
      staffStep,
      selectedEntryIds = [],
      selectedNoteRefs = [],
      epsilon = 0.0001
    } = options;
    if (!entryId) return false;
    if (selectedEntryIds.includes(entryId)) return true;
    return selectedNoteRefs.some((ref) => (
      ref?.entryId === entryId && Math.abs(Number(ref.staffStep) - staffStep) < epsilon
    ));
  }

  function toggleNoteRef(refs = [], entryId, staffStep, epsilon = 0.0001) {
    const nextRefs = [...refs];
    const index = nextRefs.findIndex((ref) => (
      ref?.entryId === entryId && Math.abs(Number(ref.staffStep) - staffStep) < epsilon
    ));
    if (index >= 0) nextRefs.splice(index, 1);
    else nextRefs.push({ entryId, staffStep });
    return nextRefs;
  }

  function withoutEntryRefs(refs = [], entryId) {
    return refs.filter((ref) => ref?.entryId !== entryId);
  }

  function isAdditiveEvent(event) {
    return event?.metaKey === true || event?.ctrlKey === true;
  }

  function selectableEntryLocations(measures = [], options = {}) {
    const {
      line2Mode = false,
      entryVoice = () => 1,
      shouldRenderRestEntry = () => true
    } = options;
    return measures.flatMap((measure, measureIndex) => (
      (measure?.entries || []).map((entry, entryIndex) => ({ measureIndex, entryIndex, entry }))
    )).filter((location) => (
      (!line2Mode || entryVoice(location.entry) === 2) &&
      !(location.entry.type === "rest" && !shouldRenderRestEntry(measures[location.measureIndex], location.entry))
    ));
  }

  function selectedEntryIdSet(selectedEntryIds = [], selectedNoteRefs = []) {
    return new Set([...(selectedEntryIds || []), ...(selectedNoteRefs || []).map((ref) => ref.entryId)]);
  }

  function selectedOrAllEntryLocations(locations = [], selectedEntryIds = [], selectedNoteRefs = []) {
    const selectedIds = selectedEntryIdSet(selectedEntryIds, selectedNoteRefs);
    if (!selectedIds.size) return locations;
    return locations.filter((location) => selectedIds.has(location.entry.id));
  }

  function scopeContains(scopeRange, absoluteTick, epsilon = 0.0001) {
    if (!scopeRange) return true;
    return Number.isFinite(absoluteTick) &&
      absoluteTick >= scopeRange.start - epsilon &&
      absoluteTick < scopeRange.end - epsilon;
  }

  function classEntryLocations(kind, locations = [], helpers = {}) {
    const { entryStaffSteps = () => [] } = helpers;
    if (kind === "notes") return locations.filter((location) => location.entry.type === "note");
    if (kind === "rests") return locations.filter((location) => location.entry.type === "rest");
    if (kind === "chords") {
      return locations.filter((location) => location.entry.type === "note" && entryStaffSteps(location.entry).length > 1);
    }
    return null;
  }

  function specialVoiceRefs(kind, locations = [], entryStaffSteps = () => []) {
    return locations
      .filter((location) => location.entry.type === "note")
      .map((location) => {
        const steps = entryStaffSteps(location.entry);
        const staffStep = kind === "upper"
          ? Math.max(...steps)
          : Math.min(...steps);
        return { entryId: location.entry.id, staffStep };
      });
  }

  function durationClassLocations(locations = [], durationId, helpers = {}) {
    const {
      durationById = () => null,
      entryDuration = () => null,
      dotCountForEntry = () => 0
    } = helpers;
    const [durationKey, dotsKey = "0"] = String(durationId || "").split(":");
    const duration = durationById(durationKey);
    if (!duration) return null;
    const dotCount = Math.max(0, Math.min(2, Number(dotsKey) || 0));
    return locations.filter((location) => (
      entryDuration(location.entry)?.id === duration.id &&
      dotCountForEntry(location.entry) === dotCount
    ));
  }

  function durationSelectionOptions(durations = []) {
    return durations.flatMap((duration) => [
      [`${duration.id}:0`, duration.label],
      [`${duration.id}:1`, `${duration.label} con puntillo`],
      [`${duration.id}:2`, `${duration.label} con doble puntillo`]
    ]);
  }

  window.JMLScoreSelection = Object.freeze({
    classEntryLocations,
    durationClassLocations,
    durationSelectionOptions,
    isAdditiveEvent,
    noteHeadIsSelected,
    scopeContains,
    selectableEntryLocations,
    selectedEntryIdSet,
    selectedOrAllEntryLocations,
    specialVoiceRefs,
    toggleNoteRef,
    uniqueNoteRefs,
    withoutEntryRefs
  });
})();
