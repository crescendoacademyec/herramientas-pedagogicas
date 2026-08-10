(function (global) {
  const FALLBACK_BBOX = Object.freeze({ sw: [0, -0.5], ne: [1, 0.5] });

  function smufl(data, name) {
    return String.fromCodePoint(data.SMUFL_CODEPOINTS[name] || data.SMUFL_EXTRA_CODEPOINTS[name]);
  }

  function glyphBBox(data, name) {
    return data.SMUFL_BBOXES[name] || data.SMUFL_EXTRA_BBOXES[name] || FALLBACK_BBOX;
  }

  function glyphWidth(data, name, space) {
    const box = glyphBBox(data, name);
    return (box.ne[0] - box.sw[0]) * space;
  }

  function glyphHeight(data, name, space) {
    const box = glyphBBox(data, name);
    return (box.ne[1] - box.sw[1]) * space;
  }

  function glyphCenter(data, name) {
    const box = glyphBBox(data, name);
    return {
      x: (box.sw[0] + box.ne[0]) / 2,
      y: (box.sw[1] + box.ne[1]) / 2
    };
  }

  function glyphAnchors(data, name, fallbackName = "noteheadBlack") {
    return data.SMUFL_ANCHORS[name] || data.SMUFL_ANCHORS[fallbackName] || {};
  }

  function glyphAnchor(data, name, anchorName) {
    return glyphAnchors(data, name)[anchorName] || [0, 0];
  }

  global.JMLScoreSmufl = Object.freeze({
    smufl,
    glyphBBox,
    glyphWidth,
    glyphHeight,
    glyphCenter,
    glyphAnchors,
    glyphAnchor
  });
})(typeof window !== "undefined" ? window : globalThis);
