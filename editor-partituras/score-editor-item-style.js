(function () {
  function normalizeColor(value, fallback = "#15120f") {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
  }

  function normalizeOpacity(value, fallback = 1) {
    const opacity = Number(value);
    if (!Number.isFinite(opacity)) return fallback;
    return Math.max(0.05, Math.min(1, opacity));
  }

  function visualOffset(item, axis) {
    const value = Number(axis === "x" ? item?.offsetX : item?.offsetY);
    return Number.isFinite(value) ? value : 0;
  }

  function selectedColor({
    textItem = null,
    mark = null,
    note = null,
    entry = null,
    noteColor = null,
    fallback = "#15120f"
  } = {}) {
    if (textItem?.style?.color) return normalizeColor(textItem.style.color, fallback);
    if (mark?.color) return normalizeColor(mark.color, fallback);
    if (note) return normalizeColor(noteColor || note.entry?.color || fallback, fallback);
    if (entry?.color) return normalizeColor(entry.color, fallback);
    return normalizeColor(fallback, "#15120f");
  }

  function selectedOpacity({
    textItem = null,
    mark = null,
    entry = null,
    fallback = 1
  } = {}) {
    if (Number.isFinite(Number(textItem?.style?.opacity))) return normalizeOpacity(textItem.style.opacity, fallback);
    if (Number.isFinite(Number(mark?.opacity))) return normalizeOpacity(mark.opacity, fallback);
    if (Number.isFinite(Number(entry?.opacity))) return normalizeOpacity(entry.opacity, fallback);
    return normalizeOpacity(fallback, 1);
  }

  function hasSelection({ notes = [], entries = [], marks = [], texts = [] } = {}) {
    return !!(notes.length || entries.length || marks.length || texts.length);
  }

  window.JMLScoreItemStyle = Object.freeze({
    hasSelection,
    normalizeColor,
    normalizeOpacity,
    selectedColor,
    selectedOpacity,
    visualOffset
  });
})();
