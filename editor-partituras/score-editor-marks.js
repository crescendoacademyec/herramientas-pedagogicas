(function () {
  const SYSTEM_LOCAL_MARK_TYPES = Object.freeze(["accent", "glyph", "fermata", "clef", "slur", "dotted-slur", "dynamic-mf", "crescendo", "diminuendo"]);
  const TOP_SYSTEM_MARK_TYPES = Object.freeze(["ending", "tempo-quarter", "tempo", "tempo-text", "ritardando"]);

  function createId() {
    return crypto.randomUUID ? crypto.randomUUID() : `mark-${Date.now()}-${Math.random()}`;
  }

  function systemIndex(mark, systemCount) {
    return Math.max(0, Math.min(Math.max(0, Number(systemCount) - 1), Number(mark?.systemIndex) || 0));
  }

  function isSystemLocal(mark) {
    return SYSTEM_LOCAL_MARK_TYPES.includes(mark?.type);
  }

  function belongsToRenderSystem(mark, renderSystemIndex, systemCount) {
    if (mark?.type === "barline") return false;
    if (TOP_SYSTEM_MARK_TYPES.includes(mark?.type)) return renderSystemIndex === 0;
    if (isSystemLocal(mark)) return systemIndex(mark, systemCount) === renderSystemIndex;
    return renderSystemIndex === 0;
  }

  function selected(marks = [], ids = []) {
    const selectedIds = new Set(ids || []);
    return marks.filter((mark) => selectedIds.has(mark.id));
  }

  function selectedOfType(marks = [], ids = [], type) {
    return selected(marks, ids).filter((mark) => mark?.type === type);
  }

  function isArticulation(mark) {
    return ["accent", "fermata", "glyph"].includes(mark?.type);
  }

  function isTempo(mark) {
    return mark?.type === "tempo" ||
      mark?.type === "tempo-quarter" ||
      mark?.type === "tempo-text";
  }

  function selectedArticulations(marks = [], ids = []) {
    return selected(marks, ids).filter(isArticulation);
  }

  function selectedTempo(marks = [], ids = []) {
    return selected(marks, ids).filter(isTempo);
  }

  function articulationMatchesAnchor(mark, anchor, systemIndex, epsilon = 0.0001) {
    if (!isArticulation(mark) || !anchor) return false;
    if ((Number(mark?.systemIndex) || 0) !== systemIndex) return false;
    if (mark.entryId && anchor.entryId) {
      return mark.entryId === anchor.entryId &&
        Math.abs((Number(mark.staffStep) || 0) - (Number(anchor.staffStep) || 0)) < epsilon;
    }
    return Number(mark.measureIndex) === Number(anchor.measureIndex) &&
      Math.abs((Number(mark.tick) || 0) - (Number(anchor.tick) || 0)) < epsilon &&
      Math.abs((Number(mark.staffStep) || 0) - (Number(anchor.staffStep) || 0)) < epsilon;
  }

  function selectedPhraseSlurs(marks = [], ids = [], extraMark = null) {
    const phraseSlurs = selected(marks, ids).filter((mark) => mark?.type === "slur" || mark?.type === "dotted-slur");
    if ((extraMark?.type === "slur" || extraMark?.type === "dotted-slur") && !phraseSlurs.some((mark) => mark.id === extraMark.id)) {
      phraseSlurs.push(extraMark);
    }
    return phraseSlurs;
  }

  window.JMLScoreMarks = Object.freeze({
    articulationMatchesAnchor,
    belongsToRenderSystem,
    createId,
    isArticulation,
    isTempo,
    isSystemLocal,
    selected,
    selectedArticulations,
    selectedOfType,
    selectedPhraseSlurs,
    selectedTempo,
    systemIndex
  });
})();
