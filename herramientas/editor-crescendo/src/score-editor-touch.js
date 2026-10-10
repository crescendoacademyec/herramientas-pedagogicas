(function () {
  function isTouchOptimizedInput(options = {}) {
    const {
      supportsTouchInput = false,
      coarsePointerMatches = false,
      hoverlessMatches = false,
      pointerType = ""
    } = options;
    return supportsTouchInput ||
      coarsePointerMatches === true ||
      hoverlessMatches === true ||
      pointerType === "touch" ||
      pointerType === "pen";
  }

  function selectedItemCount(counts = {}) {
    return (Number(counts.entries) || 0) +
      (Number(counts.notes) || 0) +
      (Number(counts.marks) || 0) +
      (Number(counts.textItems) || 0) +
      (counts.hasMeasureSelection ? 1 : 0);
  }

  window.JMLScoreTouch = Object.freeze({
    isTouchOptimizedInput,
    selectedItemCount
  });
})();
