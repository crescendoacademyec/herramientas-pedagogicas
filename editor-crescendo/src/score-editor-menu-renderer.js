(function (global) {
  const CONTEXT_CLASSES = ["menu-context-main", "menu-context-drawer", "menu-context-midi"];
  const LEGACY_CLASSES = [
    "icon-context-main",
    "icon-context-drawer",
    "icon-context-midi",
    "icon-kind-text",
    "icon-kind-music",
    "icon-kind-mixed",
    "icon-kind-symbol",
    "icon-kind-svg",
    "is-text-icon"
  ];

  const MAIN_LABELS = Object.freeze({
    "main:selection": "Selección",
    "main:editModeButton": "Editar",
    "main:figures": "Figuras",
    "main:grid": "Grid",
    "main:ties": "Ligaduras",
    "main:tuplets": "Tuplets",
    "main:meters": "Compás",
    "main:tempo": "Tempo",
    "main:clefs": "Claves",
    "main:articulations": "Articulaciones",
    "main:keys": "Armadura",
    "main:dynamics": "Dinámicas",
    "main:endings": "Casillas",
    "main:canvas": "Canvas",
    "main:tools": "Drops",
    "main:bars": "Barras",
    "main:reflowButton": "Reorganizar",
    "main:musicXmlButton": "MusicXML",
    "main:captureSceneButton": "Guardar escena",
    "main:scenes": "Escenas",
    "main:fullscreenButton": "Pantalla",
    "main:jazz": "Jazz",
    "main:playbackButton": "Reproducir",
    "main:undo": "Deshacer",
    "main:redo": "Rehacer",
    "main:shiftModeButton": "Mover",
    "main:textModeButton": "Texto",
    "main:chordModeButton": "Cifrado",
    "main:clear": "Limpiar"
  });

  const MIDI_NOTE_LABELS = Object.freeze({
    "one-twenty-eighth": "1/128",
    "sixty-fourth": "1/64",
    "thirty-second": "1/32",
    sixteenth: "1/16",
    eighth: "1/8",
    quarter: "1/4",
    half: "1/2",
    whole: "1",
    breve: "Breve"
  });

  const MIDI_TUPLET_LABELS = Object.freeze({
    "triplet-eighth": "3:2 · 1/8",
    "triplet-quarter": "3:2 · 1/4",
    "sextuplet-sixteenth": "6:4 · 1/16",
    "custom-tuplet": "x:y",
    "stop-tuplet": "Fin"
  });

  const MIDI_TOOL_LABELS = Object.freeze({
    "midi-recognize-selection": "Cifrado",
    "midi-auto-chord": "Autocifrado",
    "midi-generate-chord-from-top": "Generar desde superior",
    "midi-generate-chord": "Generar",
    "stop-tuplet": "Fin",
    "chord-toggle": "Acorde"
  });

  function contextFor(element) {
    if (element.closest(".midi-keyboard-panel")) return "midi";
    if (element.closest(".duration-icons") || element.closest(".editor-menu--drawer")) return "drawer";
    return "main";
  }

  function clearLegacySizing(element) {
    LEGACY_CLASSES.forEach((className) => element.classList.remove(className));
    CONTEXT_CLASSES.forEach((className) => element.classList.remove(className));
    ["width", "min-width", "height", "min-height", "font-size", "--icon-extra-width", "--icon-extra-height"]
      .forEach((property) => element.style.removeProperty(property));
    element.classList.add(`menu-context-${contextFor(element)}`);
  }

  function rawFallbackLabel(element) {
    return String(
      element.dataset.defaultTooltip ||
      element.getAttribute("aria-label") ||
      element.title ||
      element.textContent ||
      "Acción"
    ).trim();
  }

  function midiLabel(iconId, fallback) {
    const [, scope, itemId] = String(iconId).split(":");
    if (scope === "note") return MIDI_NOTE_LABELS[itemId] || fallback;
    if (scope === "rest") {
      const durationId = itemId.replace(/^rest-/, "");
      return `Sil. ${MIDI_NOTE_LABELS[durationId] || fallback}`;
    }
    if (scope === "tuplet") return MIDI_TUPLET_LABELS[itemId] || fallback;
    if (scope === "item") return MIDI_TOOL_LABELS[itemId] || fallback;
    return fallback;
  }

  function labelFor(element, explicitLabel = "") {
    if (explicitLabel) return explicitLabel;
    const iconId = String(element.dataset.iconId || "");
    if (MAIN_LABELS[iconId]) return MAIN_LABELS[iconId];
    if (iconId === "midi:chord-toggle") return MIDI_TOOL_LABELS["chord-toggle"];
    const fallback = rawFallbackLabel(element);
    if (iconId.startsWith("midi:") && element.closest(".midi-dropdown-panel")) return fallback;
    if (iconId.startsWith("midi:")) return midiLabel(iconId, fallback);
    if (element.classList.contains("zoom-label")) return String(element.textContent || "100%").trim();
    return fallback;
  }

  function shortcutFor(element, label) {
    const explicit = String(element.dataset.menuShortcut || "").trim();
    if (explicit) return explicit;
    if (contextFor(element) !== "drawer") return "";
    const tooltip = String(element.getAttribute("aria-label") || element.title || "").trim();
    const prefix = `${label} · `;
    if (tooltip.startsWith(prefix)) return tooltip.slice(prefix.length).trim();
    return "";
  }

  function directFieldLabel(element) {
    return element.querySelector(":scope > span[data-menu-label], :scope > span");
  }

  function ensureFieldLabel(element, label) {
    let node = directFieldLabel(element);
    if (!node) {
      node = document.createElement("span");
      element.insertBefore(node, element.firstChild);
    }
    node.className = "menu-field-label";
    node.dataset.menuLabel = "";
    node.dataset.iconLayer = "default";
    node.textContent = label;
  }

  function renderTextControl(element, label, shortcut) {
    const labelNode = document.createElement("span");
    labelNode.className = "menu-control-label";
    labelNode.dataset.menuLabel = "";
    labelNode.dataset.iconLayer = "default";
    labelNode.textContent = label;
    if (!shortcut) {
      element.replaceChildren(labelNode);
      return;
    }
    const shortcutNode = document.createElement("span");
    shortcutNode.className = "menu-control-shortcut";
    shortcutNode.textContent = shortcut;
    element.replaceChildren(labelNode, shortcutNode);
  }

  function renderControl(element, options = {}) {
    if (!element) return;
    clearLegacySizing(element);
    const label = labelFor(element, options.label || "");
    element.dataset.menuTextLabel = label;
    const hasField = element.matches("label") || !!element.querySelector(":scope > input, :scope > select, :scope > textarea");
    if (hasField) {
      element.classList.add("menu-field-control");
      ensureFieldLabel(element, label);
      return;
    }
    element.classList.remove("menu-field-control");
    element.classList.add("menu-text-control");
    renderTextControl(element, label, options.shortcut === false ? "" : shortcutFor(element, label));
  }

  function renderControls(elements) {
    [...new Set(elements || [])].forEach((element) => renderControl(element));
  }

  global.JMLScoreMenuRenderer = Object.freeze({
    labelFor,
    renderControl,
    renderControls
  });
})(window);
