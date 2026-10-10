(function () {
  const TEXT_WIDTH_CACHE_LIMIT = 1200;
  const textWidthCache = new Map();

  function rectsOverlap(a, b) {
    return !!a && !!b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function expandedRect(rect, padX = 0, padY = padX) {
    return {
      left: rect.left - padX,
      right: rect.right + padX,
      top: rect.top - padY,
      bottom: rect.bottom + padY
    };
  }

  function pointInRect(point, rect) {
    return point &&
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom;
  }

  function unionRects(rects) {
    const validRects = rects.filter(Boolean);
    if (!validRects.length) return null;
    return validRects.reduce((acc, rect) => ({
      left: Math.min(acc.left, rect.left),
      right: Math.max(acc.right, rect.right),
      top: Math.min(acc.top, rect.top),
      bottom: Math.max(acc.bottom, rect.bottom)
    }), { ...validRects[0] });
  }

  function normalizeRect(a, b) {
    return {
      left: Math.min(a.x, b.x),
      right: Math.max(a.x, b.x),
      top: Math.min(a.y, b.y),
      bottom: Math.max(a.y, b.y)
    };
  }

  function approximateTextWidth(text, size, font) {
    const safeSize = Number(size) || 24;
    const cacheKey = `${font || ""}|${safeSize}|${String(text)}`;
    if (textWidthCache.has(cacheKey)) return textWidthCache.get(cacheKey);
    const fontFactor = /ink/i.test(font || "") ? 0.48 : 0.56;
    const width = Math.max(safeSize * 0.9, [...String(text)].reduce((sum, char) => {
      if (char === " ") return sum + safeSize * fontFactor * 0.55;
      return sum + safeSize * fontFactor * (char.charCodeAt(0) > 255 ? 1.08 : 1);
    }, 0));
    textWidthCache.set(cacheKey, width);
    if (textWidthCache.size > TEXT_WIDTH_CACHE_LIMIT) {
      textWidthCache.delete(textWidthCache.keys().next().value);
    }
    return width;
  }

  window.ScoreEditorGeometry = Object.freeze({
    approximateTextWidth,
    expandedRect,
    normalizeRect,
    pointInRect,
    rectsOverlap,
    unionRects
  });
})();
