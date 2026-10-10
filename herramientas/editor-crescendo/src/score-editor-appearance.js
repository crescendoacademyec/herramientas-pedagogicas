(function () {
  function loadAppearance(options = {}) {
    const {
      storageGet,
      storageKey,
      factory = {}
    } = options;
    try {
      const stored = JSON.parse(storageGet(storageKey) || "{}");
      if (!stored.timeSignatureFont || stored.timeSignatureFont === "MTF Improviso Light") {
        stored.timeSignatureFont = factory.timeSignatureFont;
      }
      if (!stored.iconTextFont || stored.iconTextFont === "Ink Free") {
        stored.iconTextFont = factory.iconTextFont || "Arial";
      }
      [
        ["midiWhiteLabelSize", 12],
        ["midiWhiteLabelOffsetX", 0],
        ["midiWhiteLabelOffsetY", 0],
        ["midiBlackLabelSize", 10],
        ["midiBlackLabelOffsetX", 0],
        ["midiBlackLabelOffsetY", 0]
      ].forEach(([key, oldValue]) => {
        if (stored[key] === oldValue) stored[key] = factory[key];
      });
      return { ...factory, ...stored };
    } catch {
      return { ...factory };
    }
  }

  function saveAppearance(options = {}) {
    const { storageSet, storageKey, appearance = {} } = options;
    storageSet(storageKey, JSON.stringify(appearance, null, 2));
  }

  function loadIconAppearance(options = {}) {
    const { storageGet, storageKey } = options;
    try {
      return JSON.parse(storageGet(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function saveIconAppearance(options = {}) {
    const { storageSet, storageKey, iconAppearance = {} } = options;
    storageSet(storageKey, JSON.stringify(iconAppearance, null, 2));
  }

  function knownFont(value, fallback = "Ink Free", fontOptions = []) {
    const font = String(value || "").trim();
    return fontOptions.some((option) => option.value === font) ? font : fallback;
  }

  function appearanceFont(options = {}) {
    const {
      appearance = {},
      factory = {},
      key,
      fallback = "Ink Free",
      fontOptions = []
    } = options;
    return knownFont(appearance[key] || factory[key], fallback, fontOptions);
  }

  function fontCss(font, fallback, fontOptions = []) {
    const safeFont = knownFont(font, String(fallback || "").includes("Georgia") ? "MTF Improviso Light" : "Ink Free", fontOptions);
    return `"${safeFont}", ${fallback}`;
  }

  function formatValue(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value ?? "");
    return Number.isInteger(number) ? String(number) : String(Math.round(number * 100) / 100);
  }

  function colorToInputValue(value, fallback = "#15120f") {
    const text = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(text)) return text;
    const match = text.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return fallback;
    return `#${[match[1], match[2], match[3]].map((part) => {
      const numeric = Math.max(0, Math.min(255, Number(part) || 0));
      return numeric.toString(16).padStart(2, "0");
    }).join("")}`;
  }

  function iconLayerLabel(layerId) {
    return {
      "music-head": "Cabeza",
      "music-flag": "Flag",
      "music-dot": "Puntillo",
      "music-note": "Figura",
      "text-number": "Número",
      "text-equals": "Igual/texto"
    }[layerId] || layerId;
  }

  window.JMLScoreAppearance = Object.freeze({
    appearanceFont,
    colorToInputValue,
    formatValue,
    fontCss,
    iconLayerLabel,
    knownFont,
    loadAppearance,
    loadIconAppearance,
    saveAppearance,
    saveIconAppearance
  });
})();
