(function () {
  function shiftAnchoredItemsForInsert(state, index) {
    (state.marks || []).forEach((mark) => {
      if (Number.isFinite(mark.measureIndex) && mark.measureIndex >= index) mark.measureIndex += 1;
      if (Number.isFinite(mark.boundaryIndex) && mark.boundaryIndex >= index) mark.boundaryIndex += 1;
      if (Number.isFinite(mark.startMeasureIndex) && mark.startMeasureIndex >= index) mark.startMeasureIndex += 1;
      if (Number.isFinite(mark.endMeasureIndex) && mark.endMeasureIndex >= index) mark.endMeasureIndex += 1;
    });
    (state.textItems || []).forEach((item) => {
      if (Number.isFinite(item.measureIndex) && item.measureIndex >= index) item.measureIndex += 1;
    });
  }

  function shiftAnchoredItemsForRemove(state, index) {
    state.marks = (state.marks || [])
      .filter((mark) => {
        if (mark?.type === "barline") return Number(mark.boundaryIndex) !== index + 1;
        if (mark?.type === "ending") {
          const start = Number(mark.startMeasureIndex ?? mark.measureIndex) || 0;
          const end = Number(mark.endMeasureIndex) || start + 1;
          return !(start <= index && end <= index + 1);
        }
        return Number(mark.measureIndex) !== index;
      })
      .map((mark) => {
        if (Number.isFinite(mark.measureIndex) && mark.measureIndex > index) mark.measureIndex -= 1;
        if (Number.isFinite(mark.boundaryIndex) && mark.boundaryIndex > index + 1) mark.boundaryIndex -= 1;
        if (Number.isFinite(mark.startMeasureIndex) && mark.startMeasureIndex > index) mark.startMeasureIndex -= 1;
        if (Number.isFinite(mark.endMeasureIndex) && mark.endMeasureIndex > index) mark.endMeasureIndex -= 1;
        if (Number.isFinite(mark.endMeasureIndex) && mark.endMeasureIndex <= (mark.startMeasureIndex || 0)) {
          mark.endMeasureIndex = (mark.startMeasureIndex || 0) + 1;
        }
        return mark;
      });
    state.textItems = (state.textItems || [])
      .filter((item) => Number(item.measureIndex) !== index)
      .map((item) => {
        if (Number.isFinite(item.measureIndex) && item.measureIndex > index) item.measureIndex -= 1;
        return item;
      });
  }

  window.JMLScoreMeasureAnchors = Object.freeze({
    shiftAnchoredItemsForInsert,
    shiftAnchoredItemsForRemove
  });
})();
