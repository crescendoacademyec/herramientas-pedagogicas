(function () {
  const FIRST_NOTE = 21;
  const LAST_NOTE = 108;

  function uniqueNotes(notes) {
    return [...new Set((notes || [])
      .map((note) => Number(note))
      .filter(Number.isFinite))]
      .sort((a, b) => a - b);
  }

  function labelsForNotes(notes, options = {}) {
    const ordered = typeof options.uniqueNotes === "function"
      ? options.uniqueNotes(notes)
      : uniqueNotes(notes);
    if (ordered.length < 2) return {};
    const engine = options.engine;
    const recognition = options.recognition;
    const info = engine?.analyze?.(ordered);
    const labels = engine?.intervalLabelsForNotes?.(ordered, info) || {};
    if (Object.keys(labels).length) return labels;
    const rootNote = ordered[0];
    const fallback = {};
    ordered.forEach((note, index) => {
      fallback[note] = index === 0
        ? "f"
        : recognition?.simpleIntervalName?.(Math.abs(note - rootNote)) || "";
    });
    return fallback;
  }

  function durationLabel(duration) {
    return `${duration?.key || ""}: ${duration?.label || ""}`;
  }

  function figureStripSignature(options = {}) {
    return JSON.stringify({
      durations: (options.durations || []).map((item) => item.id),
      rests: (options.restPalette || []).map((item) => item.id),
      tuplets: (options.tuplets || []).map((item) => item.id),
      tools: (options.extraTools || []).map((item) => item.id)
    });
  }

  function updateFigureStripControls(root, options = {}) {
    if (!root) return;
    root.querySelector('[data-midi-tool="midi-auto-chord"]')?.classList.toggle("is-active", options.midiAutoChordMode === true);
    root.querySelectorAll("[data-midi-duration]").forEach((button) => {
      const matchesDuration = button.dataset.midiDuration === options.activeDurationId;
      const entryKind = button.dataset.midiEntryKind || "note";
      button.classList.toggle("is-active", matchesDuration && entryKind === options.mode);
    });
    root.querySelectorAll("[data-midi-tuplet-actual]").forEach((button) => {
      button.classList.toggle("is-active", options.sameTupletConfig?.(options.activeTuplet, {
        actual: button.dataset.midiTupletActual,
        normal: button.dataset.midiTupletNormal,
        unitDurationId: button.dataset.midiTupletUnit
      }) === true);
    });
    root.querySelectorAll("[data-midi-custom-tuplet]").forEach((button) => {
      button.classList.toggle("is-active", !!options.pendingTupletRatio);
    });
  }

  function renderFigureStrip(root, options = {}) {
    if (!root) return;
    root.replaceChildren();
    root.classList.add("midi-dropdown-menubar");
    root.setAttribute("role", "menubar");

    const closeMenus = () => {
      root.querySelectorAll(".midi-dropdown-menu[open]").forEach((menu) => {
        menu.open = false;
      });
    };

    const addMenu = (id, label) => {
      const menu = document.createElement("details");
      menu.className = "midi-dropdown-menu";
      menu.dataset.midiMenu = id;
      const summary = document.createElement("summary");
      summary.className = "midi-dropdown-summary";
      summary.setAttribute("role", "menuitem");
      summary.setAttribute("aria-haspopup", "menu");
      summary.setAttribute("aria-expanded", "false");
      summary.textContent = label;
      const panel = document.createElement("div");
      panel.className = "midi-dropdown-panel";
      panel.setAttribute("role", "menu");
      panel.setAttribute("aria-label", label);
      menu.append(summary, panel);
      menu.addEventListener("toggle", () => {
        summary.setAttribute("aria-expanded", menu.open ? "true" : "false");
        if (!menu.open) return;
        root.querySelectorAll(".midi-dropdown-menu[open]").forEach((other) => {
          if (other !== menu) other.open = false;
        });
      });
      summary.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        if (root.querySelector(".midi-dropdown-menu[open]") && !menu.open) menu.open = true;
      });
      root.appendChild(menu);
      return panel;
    };

    const addButton = (parent, item, buttonOptions = {}) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "menuitem");
      if (buttonOptions.durationId) button.dataset.midiDuration = buttonOptions.durationId;
      if (buttonOptions.entryKind) button.dataset.midiEntryKind = buttonOptions.entryKind;
      if (buttonOptions.toolId || item.id) button.dataset.midiTool = buttonOptions.toolId || item.id;
      if (buttonOptions.shortcut || item.shortcut) button.dataset.menuShortcut = buttonOptions.shortcut || item.shortcut;
      if (item.tuplet) {
        button.dataset.midiTupletActual = String(item.tuplet.actual);
        button.dataset.midiTupletNormal = String(item.tuplet.normal);
        button.dataset.midiTupletUnit = item.tuplet.unitDurationId;
      }
      if (item.customTuplet) button.dataset.midiCustomTuplet = "true";
      const symbolClass = item.music ? "music-glyph" : "text-glyph";
      const iconIdParts = ["midi", buttonOptions.entryKind || (item.tuplet || item.customTuplet ? "tuplet" : "item"), item.id].filter(Boolean);
      button.dataset.iconId = iconIdParts.join(":");
      button.dataset.defaultTooltip = buttonOptions.label || item.label;
      button.dataset.iconLabelPrefix = "Teclado MIDI";
      button.dataset.iconLabel = `Teclado MIDI · ${options.effectiveIconTooltip?.(button.dataset.iconId, button.dataset.defaultTooltip) || button.dataset.defaultTooltip || ""}`;
      button.innerHTML = options.iconLayerHtml?.(options.iconLayersForItem?.(item, symbolClass) || []) || "";
      options.applyIconTooltipToElement?.(button);
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMenus();
        button.disabled = true;
        try {
          await buttonOptions.action?.(item, event);
        } finally {
          button.disabled = false;
          options.afterAction?.();
        }
      });
      parent.appendChild(button);
    };

    const figuresMenu = addMenu("figures", "Figuras");
    (options.durations || []).forEach((duration) => {
      addButton(figuresMenu, duration, {
        durationId: duration.id,
        entryKind: "note",
        label: duration.label,
        shortcut: duration.key,
        action: options.actions?.noteDuration
      });
    });

    const restsMenu = addMenu("rests", "Silencios");
    (options.restPalette || []).forEach((rest) => {
      addButton(restsMenu, rest, {
        durationId: rest.restDurationId,
        entryKind: "rest",
        action: options.actions?.rest
      });
    });

    const tupletsMenu = addMenu("tuplets", "Tuplets");
    (options.tuplets || []).forEach((item) => {
      addButton(tupletsMenu, item, { action: options.actions?.tuplet });
    });

    const toolsMenu = addMenu("tools", "MIDI");
    (options.extraTools || []).forEach((item) => {
      addButton(toolsMenu, item, {
        toolId: item.id,
        action: options.actions?.tool
      });
    });

    if (!root.dataset.dropdownBehaviorReady) {
      root.dataset.dropdownBehaviorReady = "true";
      root.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        closeMenus();
        root.querySelector(".midi-dropdown-summary")?.focus();
      });
      document.addEventListener("pointerdown", (event) => {
        if (!root.contains(event.target)) closeMenus();
      });
    }
  }

  function applyHighlights(root, options = {}) {
    if (!root) return;
    const ordered = typeof options.uniqueNotes === "function"
      ? options.uniqueNotes(options.notes || [])
      : uniqueNotes(options.notes || []);
    const labels = options.labels || {};
    const active = new Set(ordered.map(String));
    const source = options.source || "selection";
    root.querySelectorAll(".midi-key").forEach((key) => {
      const midiNumber = key.dataset.midiNote;
      const isHighlighted = active.has(midiNumber);
      key.classList.toggle("is-highlighted", isHighlighted);
      key.classList.toggle("is-played", isHighlighted && source === "played");
      key.classList.toggle("is-selection-highlight", isHighlighted && source === "selection");
      const badge = key.querySelector(".midi-key__badge");
      if (badge) {
        const prefix = key.classList.contains("midi-key--black") ? "midiBlackLabel" : "midiWhiteLabel";
        badge.dataset.enclosure = options.enclosureForKey?.(prefix) || "pill";
        badge.textContent = isHighlighted ? (labels[midiNumber] || "") : "";
      }
      key.setAttribute("aria-pressed", isHighlighted ? "true" : "false");
    });
  }

  function ensureStructure(root, options = {}) {
    if (!root) return null;
    const firstNote = Number.isFinite(options.firstNote) ? options.firstNote : FIRST_NOTE;
    const lastNote = Number.isFinite(options.lastNote) ? options.lastNote : LAST_NOTE;
    let inner = root.querySelector(".midi-keyboard__inner");
    if (inner && inner.dataset.firstNote === String(firstNote) && inner.dataset.lastNote === String(lastNote)) {
      return inner;
    }
    root.replaceChildren();
    inner = document.createElement("div");
    inner.className = "midi-keyboard__inner";
    inner.dataset.firstNote = String(firstNote);
    inner.dataset.lastNote = String(lastNote);
    for (let midiNumber = firstNote; midiNumber <= lastNote; midiNumber += 1) {
      const info = options.noteInfo?.(midiNumber) || {};
      const key = document.createElement("button");
      key.type = "button";
      key.className = `midi-key${info.black ? " midi-key--black" : " midi-key--white"}`;
      key.dataset.midiNote = String(midiNumber);
      key.setAttribute("aria-label", `Escribir ${info.label || midiNumber}`);
      key.title = `Escribir ${info.label || midiNumber}`;
      const name = document.createElement("span");
      name.className = "midi-key__name";
      const badge = document.createElement("span");
      badge.className = "midi-key__badge";
      key.append(name, badge);
      key.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        options.onKeyClick?.(midiNumber, event);
      });
      inner.appendChild(key);
    }
    root.appendChild(inner);
    return inner;
  }

  function updateGeometry(root, options = {}) {
    const inner = ensureStructure(root, options);
    if (!inner) return;
    let whiteIndex = 0;
    const whiteKeyWidth = Math.max(1, Number(options.whiteKeyWidth) || 1);
    const blackKeyWidth = Math.max(1, Number(options.blackKeyWidth) || 1);
    inner.querySelectorAll(".midi-key").forEach((key) => {
      const midiNumber = Number(key.dataset.midiNote);
      const info = options.noteInfo?.(midiNumber) || {};
      key.classList.toggle("midi-key--black", info.black === true);
      key.classList.toggle("midi-key--white", info.black !== true);
      key.setAttribute("aria-label", `Escribir ${info.label || midiNumber}`);
      key.title = `Escribir ${info.label || midiNumber}`;
      const name = key.querySelector(".midi-key__name");
      if (name) name.textContent = info.black ? "" : String(info.label || "").startsWith("C") ? info.label : "";
      if (info.black) {
        key.style.left = `${whiteIndex * whiteKeyWidth - blackKeyWidth / 2}px`;
      } else {
        key.style.left = `${whiteIndex * whiteKeyWidth}px`;
        whiteIndex += 1;
      }
    });
    inner.style.width = `${whiteIndex * whiteKeyWidth + 4}px`;
  }

  window.JMLScoreMidiKeyboard = Object.freeze({
    FIRST_NOTE,
    LAST_NOTE,
    applyHighlights,
    durationLabel,
    ensureStructure,
    figureStripSignature,
    labelsForNotes,
    renderFigureStrip,
    uniqueNotes,
    updateFigureStripControls,
    updateGeometry
  });
})();
