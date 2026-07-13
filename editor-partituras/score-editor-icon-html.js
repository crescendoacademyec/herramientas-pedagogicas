(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isSmuflCharacter(char) {
    const code = char.codePointAt(0);
    return code >= 0xE000 && code <= 0xF8FF;
  }

  function layersForSymbol(symbol, baseClass = "text-glyph") {
    const chars = [...String(symbol)];
    const layers = [];
    let current = null;
    chars.forEach((char) => {
      const type = isSmuflCharacter(char) ? "music" : "text";
      if (!current || current.type !== type) {
        current = { type, text: "" };
        layers.push(current);
      }
      current.text += char;
    });
    return layers.map((layer, index) => ({
      id: `${layer.type}-${index + 1}`,
      text: layer.text,
      className: layer.type === "music" ? "music-glyph" : baseClass
    }));
  }

  function layerHtml(layers, dotted = false) {
    return layers.map((layer) => (
      `<span class="${layer.className}${dotted ? " dotted-symbol" : ""}" data-icon-layer="${layer.id}">${escapeHtml(layer.text)}</span>`
    )).join("");
  }

  function layersForItem(item, baseClass = "text-glyph") {
    return item?.iconLayers || layersForSymbol(item?.symbol || "", baseClass);
  }

  function measureGlyphUnits(text) {
    return [...String(text || "").trim()].reduce((total, char) => total + (char.charCodeAt(0) > 255 ? 1.15 : 0.68), 0);
  }

  function primaryLabel(button) {
    return button?.getAttribute("aria-label") || button?.title || button?.dataset?.palette || "Icono";
  }

  function primaryId(element) {
    if (element?.id === "undoButton") return "main:undo";
    if (element?.id === "redoButton") return "main:redo";
    if (element?.id === "clearButton") return "main:clear";
    if (element?.id === "gridDurationSelect" || element?.classList?.contains("grid-control")) return "main:grid";
    return `main:${element?.dataset?.palette || element?.id || "icon"}`;
  }

  function midiExtraToolItems() {
    return [
      { id: "midi-recognize-selection", label: "Reconocer cifrado de la selección", symbol: "Cif." },
      { id: "midi-auto-chord", label: "Tocar acordes y escribir cifrado", symbol: "AutoCif." },
      { id: "midi-generate-chord-from-top", label: "Generar acorde usando nota superior escrita", symbol: "Gen↑" },
      { id: "midi-generate-chord", label: "Generar notas desde cifrado", symbol: "Gen." }
    ];
  }

  function defaultTooltip(iconId, fallback = "", options = {}) {
    const {
      palettes = {},
      durations = [],
      restPalette = [],
      durationById = () => null,
      durationShortcut = (item) => item?.key || ""
    } = options;
    if (String(iconId || "").startsWith("drawer:")) {
      const [, paletteId, itemId] = String(iconId).split(":");
      const item = palettes[paletteId]?.find((candidate) => candidate.id === itemId);
      if (item) {
        const shortcut = item.shortcut || (item.ticks ? durationShortcut(item) : item.key) || "";
        return shortcut ? `${item.label} · ${shortcut}` : item.label;
      }
    }
    if (iconId === "midi:chord-toggle") return "Modo acorde del teclado MIDI";
    if (String(iconId || "").startsWith("midi:")) {
      const [, scope, itemId] = String(iconId).split(":");
      const item = [
        ...durations,
        ...restPalette,
        ...(palettes.tuplets || []),
        ...midiExtraToolItems()
      ].find((candidate) => candidate.id === itemId);
      if (item) return item.label;
      if (scope === "note") return durationById(itemId)?.label || fallback;
      if (scope === "rest") return restPalette.find((candidate) => candidate.id === itemId)?.label || fallback;
    }
    const mainShortcuts = {
      "main:selection": "Esc",
      "main:figures": "Shift+N",
      "main:ties": "T / S",
      "main:tuplets": "Ñ / Shift+Ñ",
      "main:meters": "Shift+M",
      "main:tempo": "Shift+T",
      "main:clefs": "Shift+C",
      "main:articulations": "Shift+O / Shift+P / Shift+H",
      "main:keys": "Shift+K",
      "main:dynamicsButton": "Shift+D",
      "main:tools": "Shift+I",
      "main:bars": "Shift+B / Shift+R",
      "main:playbackButton": "Space / P",
      "main:textModeButton": "Shift+X",
      "main:chordModeButton": "Shift+Q",
      "main:undo": "Cmd/Ctrl+Z",
      "main:redo": "Cmd/Ctrl+Shift+Z"
    };
    const shortcut = mainShortcuts[iconId];
    return shortcut ? `${fallback || "Icono"} · ${shortcut}` : (fallback || "Icono");
  }

  function paletteItemForIconId(iconId, palettes = {}) {
    const match = String(iconId || "").match(/^drawer:([^:]+):(.+)$/);
    if (!match) return null;
    const [, paletteId, itemId] = match;
    const item = palettes[paletteId]?.find((candidate) => candidate.id === itemId);
    return item ? { paletteId, item } : null;
  }

  function midiItemForIconId(iconId, options = {}) {
    const {
      palettes = {},
      restPalette = [],
      durationById = () => null
    } = options;
    const match = String(iconId || "").match(/^midi:([^:]+):(.+)$/);
    if (!match) return null;
    const [, scope, itemId] = match;
    if (scope === "note") return { item: durationById(itemId), scope };
    if (scope === "rest") return { item: restPalette.find((candidate) => candidate.id === itemId), scope };
    if (scope === "tuplet") return { item: (palettes.tuplets || []).find((candidate) => candidate.id === itemId), scope };
    if (scope === "item") return { item: midiExtraToolItems().find((candidate) => candidate.id === itemId), scope };
    return null;
  }

  function mergeAppearanceConfig(base = {}, override = {}) {
    const baseLayers = base.layers || {};
    const overrideLayers = override.layers || {};
    const layers = {};
    [...new Set([...Object.keys(baseLayers), ...Object.keys(overrideLayers)])].forEach((layerId) => {
      layers[layerId] = {
        ...(baseLayers[layerId] || {}),
        ...(overrideLayers[layerId] || {})
      };
    });
    return {
      ...base,
      ...override,
      layers
    };
  }

  function numericSetting(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function layerNodesForElement(element) {
    const childLayers = [...(element?.querySelectorAll("[data-icon-layer]") || [])];
    if (!childLayers.length && element?.dataset?.iconLayer) return [element];
    return childLayers;
  }

  function layerIdsForButton(button) {
    const layers = layerNodesForElement(button)
      .map((node) => node.dataset.iconLayer)
      .filter(Boolean);
    return layers.length ? layers : ["default"];
  }

  function textLayerNodes(button) {
    return layerNodesForElement(button)
      .filter((node) => node.tagName !== "svg" && !node.classList.contains("staff-icon"));
  }

  function baseFontSize(layerNode, fallbackSize = 16) {
    const stored = Number(layerNode?.dataset?.baseIconFontSize);
    if (Number.isFinite(stored) && stored > 0) return stored;
    const button = layerNode?.closest?.("[data-icon-id]");
    const fallback = Number(button?.querySelector(":scope > span")?.dataset.baseIconFontSize)
      || parseFloat(getComputedStyle(button || layerNode).fontSize)
      || fallbackSize;
    if (layerNode?.dataset) layerNode.dataset.baseIconFontSize = String(fallback);
    return fallback;
  }

  window.JMLScoreIconHtml = Object.freeze({
    baseFontSize,
    defaultTooltip,
    escapeHtml,
    layerIdsForButton,
    isSmuflCharacter,
    layerHtml,
    layerNodesForElement,
    layersForItem,
    layersForSymbol,
    measureGlyphUnits,
    mergeAppearanceConfig,
    midiItemForIconId,
    midiExtraToolItems,
    numericSetting,
    paletteItemForIconId,
    primaryId,
    primaryLabel,
    textLayerNodes
  });
})();
