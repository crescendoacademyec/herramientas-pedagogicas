(function () {
  const Svg = window.JMLScoreSvg;
  if (!Svg) throw new Error("No se cargó score-editor-svg.js");

  function hairpinPath(options = {}) {
    const {
      leftX = 0,
      rightX = 0,
      centerY = 0,
      openY1 = centerY,
      openY2 = centerY,
      crescendo = true
    } = options;
    if (crescendo) {
      return `M ${leftX} ${centerY} L ${rightX} ${openY1} M ${leftX} ${centerY} L ${rightX} ${openY2}`;
    }
    return `M ${leftX} ${openY1} L ${rightX} ${centerY} M ${leftX} ${openY2} L ${rightX} ${centerY}`;
  }

  function appendHairpin(root, options = {}) {
    root.appendChild(Svg.el("path", {
      class: options.className || "notation-mark hairpin-mark",
      d: hairpinPath(options),
      "stroke-width": options.thickness || 1
    }));
  }

  function endingBracketPath(options = {}) {
    const {
      x1 = 0,
      x2 = 0,
      y = 0,
      drop = 22,
      closedEnd = false
    } = options;
    const parts = [
      `M ${x1} ${y + drop}`,
      `L ${x1} ${y}`,
      `L ${x2} ${y}`
    ];
    if (closedEnd) parts.push(`L ${x2} ${y + drop}`);
    return parts.join(" ");
  }

  function appendEndingBracket(root, options = {}) {
    root.appendChild(Svg.el("path", {
      class: options.className || "ending-bracket",
      d: endingBracketPath(options)
    }));
  }

  window.JMLScoreMarkRender = Object.freeze({
    appendEndingBracket,
    appendHairpin,
    endingBracketPath,
    hairpinPath
  });
})();
