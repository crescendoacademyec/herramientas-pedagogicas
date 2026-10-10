(function () {
  const Svg = window.JMLScoreSvg;
  const Smufl = window.JMLScoreSmufl;
  const SmuflData = window.JMLScoreSmuflData;
  if (!Svg) throw new Error("No se cargó score-editor-svg.js");
  if (!Smufl || !SmuflData) throw new Error("No se cargó score-editor-smufl.js");

  function textCentered(name, x, y, attrs = {}, options = {}) {
    const smuflSpace = Number(options.smuflSpace) || 12;
    const defaultFontSize = Number(options.defaultFontSize) || smuflSpace * 4;
    const center = Smufl.glyphCenter(SmuflData, name);
    const { "font-size": fontSize = defaultFontSize, ...restAttrs } = attrs;
    const style = `font-size:${fontSize}px;${attrs.style || ""}`;
    return Svg.textNode(x - center.x * smuflSpace, y + center.y * smuflSpace, Smufl.smufl(SmuflData, name), {
      class: "music-glyph",
      ...restAttrs,
      style
    });
  }

  function textAtAnchor(name, anchorName, x, y, attrs = {}, options = {}) {
    const smuflSpace = Number(options.smuflSpace) || 12;
    const defaultFontSize = Number(options.defaultFontSize) || smuflSpace * 4;
    const anchor = Smufl.glyphAnchor(SmuflData, name, anchorName);
    const { "font-size": fontSize = defaultFontSize, ...restAttrs } = attrs;
    const style = `font-size:${fontSize}px;${attrs.style || ""}`;
    return Svg.textNode(x - anchor[0] * smuflSpace, y + anchor[1] * smuflSpace, Smufl.smufl(SmuflData, name), {
      class: "music-glyph",
      ...restAttrs,
      style
    });
  }

  window.JMLScoreGlyphRender = Object.freeze({
    textAtAnchor,
    textCentered
  });
})();
