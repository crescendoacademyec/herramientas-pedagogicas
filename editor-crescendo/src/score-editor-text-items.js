(function () {
  function selected(items = [], ids = []) {
    const selectedIds = new Set(ids || []);
    return items.filter((item) => selectedIds.has(item.id));
  }

  function contextLabel(item, AnchoredText) {
    if (AnchoredText.isChord(item)) return "Cifrado";
    if (AnchoredText.isDynamic(item)) return "Dinámica";
    return "Texto";
  }

  function pluralLabel(item, AnchoredText) {
    if (AnchoredText.isChord(item)) return "cifrados";
    if (AnchoredText.isDynamic(item)) return "dinámicas";
    return "textos";
  }

  function sameKind(items = [], item, AnchoredText) {
    const kind = AnchoredText.kindOf(item);
    return items.filter((candidate) => AnchoredText.kindOf(candidate) === kind);
  }

  function styleTargets(items = [], item, options = {}, AnchoredText) {
    if (!item) return [];
    return options.allOfKind ? sameKind(items, item, AnchoredText) : [item];
  }

  function lines(item) {
    const textLines = String(item?.text || "").split(/\r?\n/);
    return textLines.length ? textLines : [""];
  }

  function normalizeAlign(value) {
    return ["left", "center", "right"].includes(value) ? value : "left";
  }

  function align(item, style = {}, AnchoredText) {
    if (AnchoredText.isChord(item)) return "center";
    return normalizeAlign(style.align || "left");
  }

  function anchorForAlign(alignValue) {
    if (alignValue === "center") return "middle";
    if (alignValue === "right") return "end";
    return "start";
  }

  function originXForAlign(point, width, alignValue) {
    if (alignValue === "center") return point.x + width / 2;
    if (alignValue === "right") return point.x + width;
    return point.x;
  }

  function lineLeftForAlign(textX, lineWidth, alignValue) {
    if (alignValue === "center") return textX - lineWidth / 2;
    if (alignValue === "right") return textX - lineWidth;
    return textX;
  }

  function metrics({
    item,
    point,
    style,
    AnchoredText,
    approximateTextWidth
  } = {}) {
    const safeStyle = style || {};
    const size = Number(safeStyle.size) || 24;
    const itemLines = lines(item);
    const lineHeight = size * 1.18;
    const lineWidths = itemLines.map((line) => approximateTextWidth(line || " ", size, safeStyle.font));
    const width = Math.max(...lineWidths);
    const alignValue = align(item, safeStyle, AnchoredText);
    const left = alignValue === "center"
      ? point.x - width / 2
      : alignValue === "right"
        ? point.x - width
        : point.x;
    const top = point.y - size * 0.86;
    const bottom = point.y + Math.max(0, itemLines.length - 1) * lineHeight + size * 0.34;
    const height = Math.max(size, bottom - top);
    const hitRect = {
      left,
      right: left + width,
      top,
      bottom
    };
    return { style: safeStyle, size, width, height, lineHeight, lines: itemLines, lineWidths, hitRect, point };
  }

  window.JMLScoreTextItems = Object.freeze({
    align,
    anchorForAlign,
    contextLabel,
    lineLeftForAlign,
    lines,
    metrics,
    normalizeAlign,
    originXForAlign,
    pluralLabel,
    sameKind,
    selected,
    styleTargets
  });
})();
