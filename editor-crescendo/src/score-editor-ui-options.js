(function () {
  const FONT_OPTIONS = Object.freeze([
    { value: "Ink Free", label: "Ink Free" },
    { value: "MTF Improviso Light", label: "Improviso Light" },
    { value: "MTF Improviso Text", label: "Improviso Text" },
    { value: "Georgia", label: "Georgia" },
    { value: "Arial", label: "Arial" }
  ]);

  const COLOR_SWATCHES = Object.freeze([
    "#15120f", "#ffffff", "#6c757d", "#d62d20",
    "#ff8c00", "#d4a84f", "#f4d35e", "#2f9e44",
    "#00a6a6", "#1c7ed6", "#364fc7", "#862e9c",
    "#c2255c", "#ff6b6b", "#8d6e63", "#000000"
  ]);

  window.JMLScoreUiOptions = Object.freeze({
    COLOR_SWATCHES,
    FONT_OPTIONS,
    MUSIC_FONT_FALLBACK: "Georgia, serif",
    TEXT_FONT_FALLBACK: '"MTF Improviso Text", cursive'
  });
})();
