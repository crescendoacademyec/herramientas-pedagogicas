(function () {
  const DROP_TOOL_OPTIONS = Object.freeze([
    ["drop-2", "Drop 2"],
    ["drop-3", "Drop 3"],
    ["drop-2-4", "Drop 2-4"],
    ["", "Ninguno"]
  ]);
  const SKIP_TOOL_OPTIONS = Object.freeze([
    ["skip-2", "Skip 2"],
    ["skip-3", "Skip 3"],
    ["skip-2-4", "Skip 2-4"],
    ["", "Ninguno"]
  ]);
  const ROOT_TO_PC = Object.freeze({
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
  });

  function mod12(value) {
    return ((Number(value) % 12) + 12) % 12;
  }

  function normalizeTool(options, value, fallback = "") {
    return options.some(([toolId]) => toolId === value) ? value : fallback;
  }

  function normalizeDropTool(value, fallback = "") {
    return normalizeTool(DROP_TOOL_OPTIONS, value, fallback);
  }

  function normalizeSkipTool(value, fallback = "") {
    return normalizeTool(SKIP_TOOL_OPTIONS, value, fallback);
  }

  function dropCandidateTools(config = {}, range) {
    const primary = range === "high"
      ? normalizeDropTool(config.highPrimaryTool, "drop-2-4")
      : normalizeDropTool(config.midPrimaryTool, "drop-2");
    const fallback = range === "high"
      ? normalizeDropTool(config.highFallbackTool, "drop-3")
      : normalizeDropTool(config.midFallbackTool, "drop-3");
    return [...new Set([primary, fallback].filter(Boolean))];
  }

  function skipCandidateTools(config = {}, range) {
    const primary = range === "low"
      ? normalizeSkipTool(config.lowPrimaryTool, "skip-2-4")
      : normalizeSkipTool(config.midPrimaryTool, "skip-2");
    const fallback = range === "low"
      ? normalizeSkipTool(config.lowFallbackTool, "skip-3")
      : normalizeSkipTool(config.midFallbackTool, "skip-3");
    return [...new Set([primary, fallback].filter(Boolean))];
  }

  function pitchLabel(midi) {
    const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
    const value = Math.round(Number(midi));
    if (!Number.isFinite(value)) return "";
    const pc = mod12(value);
    const octave = Math.floor(value / 12) - 1;
    return `${names[pc]}${octave}`;
  }

  function parsePitchValue(value) {
    const text = String(value || "").trim().replace(/♯/g, "#").replace(/♭/g, "b");
    if (!text) return null;
    if (/^-?\d+$/.test(text)) {
      const midi = Number(text);
      return Number.isFinite(midi) ? midi : null;
    }
    const match = text.match(/^([A-Ga-g])\s*((?:#|b)?)\s*(-?\d+)$/);
    if (!match) return null;
    const root = `${match[1].toUpperCase()}${match[2] || ""}`;
    const pc = ROOT_TO_PC[root];
    const octave = Number(match[3]);
    if (!Number.isFinite(pc) || !Number.isFinite(octave)) return null;
    return (octave + 1) * 12 + pc;
  }

  function promptShell(className, title, help, host) {
    document.querySelector(".editor-prompt-backdrop")?.remove();
    const backdrop = document.createElement("div");
    backdrop.className = "editor-prompt-backdrop";
    const promptBox = document.createElement("div");
    promptBox.className = `editor-prompt ${className}`;
    promptBox.setAttribute("role", "dialog");
    promptBox.setAttribute("aria-modal", "true");
    const titleNode = document.createElement("p");
    titleNode.className = "editor-prompt__title";
    titleNode.textContent = title;
    const helpNode = document.createElement("p");
    helpNode.className = "editor-prompt__help";
    helpNode.textContent = help;
    promptBox.append(titleNode, helpNode);
    backdrop.appendChild(promptBox);
    (host || document.body).appendChild(backdrop);
    return { backdrop, helpNode, promptBox };
  }

  function explainRows(texts) {
    const node = document.createElement("div");
    node.className = "editor-prompt__explain";
    texts.forEach((text) => {
      const row = document.createElement("p");
      row.textContent = text;
      node.appendChild(row);
    });
    return node;
  }

  function textField(id, labelText, value, placeholder) {
    const field = document.createElement("div");
    field.className = "editor-prompt__field";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = id;
    input.type = "text";
    input.value = value;
    input.placeholder = placeholder;
    field.append(label, input);
    return { field, input };
  }

  function toolSelect(id, options, normalizer, value, fallback) {
    const select = document.createElement("select");
    select.id = id;
    options.forEach(([toolId, label]) => {
      const option = document.createElement("option");
      option.value = toolId;
      option.textContent = label;
      select.appendChild(option);
    });
    select.value = normalizer(value, fallback);
    return select;
  }

  function selectField(labelText, select) {
    const field = document.createElement("div");
    field.className = "editor-prompt__field";
    const label = document.createElement("label");
    label.htmlFor = select.id;
    label.textContent = labelText;
    field.append(label, select);
    return field;
  }

  function actions() {
    const node = document.createElement("div");
    node.className = "editor-prompt__actions";
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancelar";
    const okButton = document.createElement("button");
    okButton.type = "button";
    okButton.textContent = "Aplicar";
    okButton.className = "is-primary";
    node.append(cancelButton, okButton);
    return { cancelButton, node, okButton };
  }

  function wireDialog({ backdrop, commit, firstInput, resolve }) {
    const cancel = () => cleanup(false);
    function cleanup(value) {
      document.removeEventListener("keydown", onKeydown, true);
      backdrop.remove();
      resolve(value);
    }
    function onKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      } else if (event.key === "Enter") {
        event.preventDefault();
        commit(cleanup);
      }
    }
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) cancel();
    });
    document.addEventListener("keydown", onKeydown, true);
    requestAnimationFrame(() => {
      firstInput?.focus();
      firstInput?.select?.();
    });
    return { cancel, cleanup };
  }

  function requestDropConfig(options = {}) {
    return new Promise((resolve) => {
      const config = options.config || {};
      const { backdrop, helpNode, promptBox } = promptShell(
        "editor-prompt--auto-drops",
        "Auto-drops",
        "La app mira la nota superior de cada acorde seleccionado. Estos parámetros definen los tres rangos de Auto-drops.",
        options.host
      );
      promptBox.appendChild(explainRows([
        "Sin drops: por debajo del primer límite, por defecto D4, el acorde no cambia.",
        "Rango medio: desde el primer límite hasta antes del segundo, por defecto D4-D5; intenta Drop 2 y, si no se puede, Drop 3.",
        "Rango alto: desde el segundo límite hacia arriba, por defecto D5; intenta Drop 2-4 y, si no se puede, Drop 3."
      ]));
      const lower = textField("auto-drop-lower-limit", "Límite sin drops: no aplicar por debajo de", pitchLabel(config.lowerLimitMidi ?? 62), "D4");
      const upper = textField("auto-drop-upper-limit", "Límite de rango alto: usar desde", pitchLabel(config.upperLimitMidi ?? 74), "D5");
      const limitsGrid = document.createElement("div");
      limitsGrid.className = "editor-prompt__grid";
      limitsGrid.append(lower.field, upper.field);
      const midPrimary = toolSelect("auto-drop-mid-primary", DROP_TOOL_OPTIONS, normalizeDropTool, config.midPrimaryTool, "drop-2");
      const midFallback = toolSelect("auto-drop-mid-fallback", DROP_TOOL_OPTIONS, normalizeDropTool, config.midFallbackTool, "drop-3");
      const highPrimary = toolSelect("auto-drop-high-primary", DROP_TOOL_OPTIONS, normalizeDropTool, config.highPrimaryTool, "drop-2-4");
      const highFallback = toolSelect("auto-drop-high-fallback", DROP_TOOL_OPTIONS, normalizeDropTool, config.highFallbackTool, "drop-3");
      const toolsGrid = document.createElement("div");
      toolsGrid.className = "editor-prompt__grid";
      toolsGrid.append(
        selectField("Rango medio: primer intento", midPrimary),
        selectField("Rango medio: reemplazo", midFallback),
        selectField("Rango alto: primer intento", highPrimary),
        selectField("Rango alto: reemplazo", highFallback)
      );
      const actionNodes = actions();
      promptBox.append(limitsGrid, toolsGrid, actionNodes.node);
      const commit = (cleanup) => {
        const lowerMidi = parsePitchValue(lower.input.value);
        const upperMidi = parsePitchValue(upper.input.value);
        if (!Number.isFinite(lowerMidi) || !Number.isFinite(upperMidi)) {
          helpNode.textContent = "Usa nombres como D4, C#5, Eb5 o números MIDI.";
          return;
        }
        if (upperMidi <= lowerMidi) {
          helpNode.textContent = "El segundo límite debe estar por encima del primero.";
          return;
        }
        cleanup({
          lowerLimitMidi: lowerMidi,
          upperLimitMidi: upperMidi,
          midPrimaryTool: normalizeDropTool(midPrimary.value, "drop-2"),
          midFallbackTool: normalizeDropTool(midFallback.value, "drop-3"),
          highPrimaryTool: normalizeDropTool(highPrimary.value, "drop-2-4"),
          highFallbackTool: normalizeDropTool(highFallback.value, "drop-3")
        });
      };
      const dialog = wireDialog({ backdrop, commit, firstInput: lower.input, resolve });
      actionNodes.okButton.addEventListener("click", () => commit(dialog.cleanup));
      actionNodes.cancelButton.addEventListener("click", dialog.cancel);
    });
  }

  function requestSkipConfig(options = {}) {
    return new Promise((resolve) => {
      const config = options.config || {};
      const { backdrop, helpNode, promptBox } = promptShell(
        "editor-prompt--auto-skips",
        "Auto-skips",
        "La app mira la nota superior de cada acorde seleccionado. Estos parámetros definen los tres rangos de Auto-skips.",
        options.host
      );
      promptBox.appendChild(explainRows([
        "Sin skips: por encima del límite superior, por defecto G4, el acorde no cambia.",
        "Rango medio: desde el límite bajo hasta el límite superior, por defecto A3-G4; intenta Skip 2 y, si no se puede, Skip 3.",
        "Rango bajo: por debajo del límite bajo, por defecto A3; intenta Skip 2-4 y, si no se puede, Skip 3."
      ]));
      const low = textField("auto-skip-low-limit", "Límite de rango bajo: usar por debajo de", pitchLabel(config.lowLimitMidi ?? 57), "A3");
      const upper = textField("auto-skip-upper-limit", "Límite sin skips: no aplicar por encima de", pitchLabel(config.upperNoSkipMidi ?? 67), "G4");
      const limitsGrid = document.createElement("div");
      limitsGrid.className = "editor-prompt__grid";
      limitsGrid.append(low.field, upper.field);
      const midPrimary = toolSelect("auto-skip-mid-primary", SKIP_TOOL_OPTIONS, normalizeSkipTool, config.midPrimaryTool, "skip-2");
      const midFallback = toolSelect("auto-skip-mid-fallback", SKIP_TOOL_OPTIONS, normalizeSkipTool, config.midFallbackTool, "skip-3");
      const lowPrimary = toolSelect("auto-skip-low-primary", SKIP_TOOL_OPTIONS, normalizeSkipTool, config.lowPrimaryTool, "skip-2-4");
      const lowFallback = toolSelect("auto-skip-low-fallback", SKIP_TOOL_OPTIONS, normalizeSkipTool, config.lowFallbackTool, "skip-3");
      const toolsGrid = document.createElement("div");
      toolsGrid.className = "editor-prompt__grid";
      toolsGrid.append(
        selectField("Rango medio: primer intento", midPrimary),
        selectField("Rango medio: reemplazo", midFallback),
        selectField("Rango bajo: primer intento", lowPrimary),
        selectField("Rango bajo: reemplazo", lowFallback)
      );
      const actionNodes = actions();
      promptBox.append(limitsGrid, toolsGrid, actionNodes.node);
      const commit = (cleanup) => {
        const lowMidi = parsePitchValue(low.input.value);
        const upperMidi = parsePitchValue(upper.input.value);
        if (!Number.isFinite(lowMidi) || !Number.isFinite(upperMidi)) {
          helpNode.textContent = "Usa nombres como A3, G4, C#5, Eb5 o números MIDI.";
          return;
        }
        if (upperMidi <= lowMidi) {
          helpNode.textContent = "El límite superior debe estar por encima del límite bajo.";
          return;
        }
        cleanup({
          lowLimitMidi: lowMidi,
          upperNoSkipMidi: upperMidi,
          midPrimaryTool: normalizeSkipTool(midPrimary.value, "skip-2"),
          midFallbackTool: normalizeSkipTool(midFallback.value, "skip-3"),
          lowPrimaryTool: normalizeSkipTool(lowPrimary.value, "skip-2-4"),
          lowFallbackTool: normalizeSkipTool(lowFallback.value, "skip-3")
        });
      };
      const dialog = wireDialog({ backdrop, commit, firstInput: low.input, resolve });
      actionNodes.okButton.addEventListener("click", () => commit(dialog.cleanup));
      actionNodes.cancelButton.addEventListener("click", dialog.cancel);
    });
  }

  window.JMLScoreAutoVoicing = Object.freeze({
    DROP_TOOL_OPTIONS,
    SKIP_TOOL_OPTIONS,
    dropCandidateTools,
    normalizeDropTool,
    normalizeSkipTool,
    parsePitchValue,
    pitchLabel,
    requestDropConfig,
    requestSkipConfig,
    skipCandidateTools
  });
})();
