(function (global) {
  const ICON_SPRITE = "../midi-piano/assets/lucide-sprite.svg";
  const PANEL_STORAGE_KEY = "jml-score-ipad-shell-v1";
  const DURATION_LABELS = Object.freeze({
    breve: "Cuadrada",
    whole: "Redonda",
    half: "Blanca",
    quarter: "Negra",
    eighth: "Corchea",
    sixteenth: "Semicorchea",
    "thirty-second": "Fusa",
    "sixty-fourth": "Semifusa",
    "one-twenty-eighth": "Garrapatea"
  });

  const NAV_ITEMS = Object.freeze([
    { id: "document", label: "Archivo", icon: "folder-open" },
    { id: "write", label: "Escribir", icon: "pencil-line" },
    { id: "notation", label: "Notación", icon: "music-2" },
    { id: "text", label: "Texto", icon: "type" },
    { id: "scenes", label: "Escenas", icon: "list-ordered" },
    { id: "playback", label: "Reproducir", icon: "play" },
    { id: "help", label: "Ayuda", icon: "circle-help" }
  ]);

  const TOOL_GROUPS = Object.freeze({
    write: [
      { selector: "#selectToolButton", label: "Seleccionar", icon: "mouse-pointer-2" },
      { selector: "#editModeButton", label: "Editar", icon: "square-pen" },
      { selector: "#figureMenuButton", label: "Figuras", icon: "music" },
      { selector: "[data-palette='ties']", label: "Ligaduras", icon: "link-2" },
      { selector: "[data-palette='tuplets']", label: "Tuplets", icon: "braces" },
      { selector: "#shiftModeButton", label: "Desplazar", icon: "move-horizontal" },
      { selector: "[data-palette='tools']", label: "Voicings", icon: "wand-sparkles" },
      { selector: "#reflowButton", label: "Reorganizar", icon: "rows-3" }
    ],
    notation: [
      { selector: "[data-palette='meters']", label: "Compás", icon: "panel-top" },
      { selector: "[data-palette='tempo']", label: "Tempo", icon: "timer" },
      { selector: "[data-palette='clefs']", label: "Claves", icon: "music" },
      { selector: "#keySignatureButton", label: "Armadura", icon: "hash" },
      { selector: "[data-palette='articulations']", label: "Articulaciones", icon: "sparkles" },
      { selector: "#dynamicsButton", label: "Dinámicas", icon: "audio-lines" },
      { selector: "[data-palette='endings']", label: "Casillas", icon: "between-horizontal-end" },
      { selector: "[data-palette='bars']", label: "Barras", icon: "columns-3" }
    ],
    text: [
      { selector: "#textModeButton", label: "Texto", icon: "type" },
      { selector: "#chordModeButton", label: "Cifrado", icon: "badge" }
    ],
    playback: [
      { selector: "#playbackButton", label: "Reproducir", icon: "play" },
      { selector: "#jazzModeButton", label: "Interpretación jazz", icon: "audio-waveform" },
      { selector: "[data-palette='canvas']", label: "Vista del lienzo", icon: "scan" }
    ]
  });

  function icon(name, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (className) svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `${ICON_SPRITE}#${name}`);
    svg.appendChild(use);
    return svg;
  }

  function element(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function readLayoutPreferences() {
    try {
      const value = JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY) || "{}");
      return {
        activePanel: NAV_ITEMS.some((item) => item.id === value.activePanel) ? value.activePanel : "write",
        leftVisible: value.leftVisible !== false,
        rightVisible: value.rightVisible !== false,
        keyboardVisible: value.keyboardVisible !== false
      };
    } catch {
      return {
        activePanel: "write",
        leftVisible: true,
        rightVisible: true,
        keyboardVisible: true
      };
    }
  }

  function saveLayoutPreferences(state) {
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify({
        activePanel: state.activePanel,
        leftVisible: state.leftVisible,
        rightVisible: state.rightVisible,
        keyboardVisible: state.keyboardVisible
      }));
    } catch {
      // The editor remains usable when browser storage is unavailable.
    }
  }

  function createIconButton(options = {}) {
    const button = element("button", options.className || "ipad-icon-button");
    button.type = "button";
    button.title = options.label || "";
    button.setAttribute("aria-label", options.label || "");
    if (options.icon) button.appendChild(icon(options.icon));
    if (options.text) button.appendChild(element("span", "ipad-button-text", options.text));
    return button;
  }

  function proxyButton(config, context) {
    const source = document.querySelector(config.selector);
    if (!source) return null;
    const button = element("button", "ipad-tool-button");
    button.type = "button";
    button.title = source.title || source.getAttribute("aria-label") || config.label;
    button.setAttribute("aria-label", button.title);
    button.append(icon(config.icon), element("span", "", config.label));
    const sync = () => {
      const active = source.classList.contains("is-active") || source.getAttribute("aria-pressed") === "true";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.disabled = source.disabled;
      const expanded = source.getAttribute("aria-expanded");
      if (expanded != null) button.setAttribute("aria-expanded", expanded);
    };
    sync();
    new MutationObserver(sync).observe(source, {
      attributes: true,
      attributeFilter: ["class", "disabled", "aria-pressed", "aria-expanded", "title", "aria-label"]
    });
    button.addEventListener("click", () => {
      source.click();
      if (source.classList.contains("palette-trigger") || source.dataset.palette) {
        context.setRightVisible(true);
      }
      requestAnimationFrame(sync);
    });
    return button;
  }

  function sectionHeader(eyebrow, title, description = "") {
    const header = element("header", "ipad-panel-heading");
    header.append(
      element("span", "ipad-eyebrow", eyebrow),
      element("h2", "", title)
    );
    if (description) header.appendChild(element("p", "", description));
    return header;
  }

  function createControlSection(title) {
    const section = element("section", "ipad-control-section");
    section.appendChild(element("h3", "", title));
    return section;
  }

  function moveLegacyPanel(selector, destination) {
    const panel = document.querySelector(selector);
    if (!panel) return null;
    panel.classList.add("ipad-legacy-panel");
    destination.appendChild(panel);
    return panel;
  }

  function createStateRow(label, id) {
    const row = element("div", "ipad-state-row");
    row.append(
      element("span", "", label),
      element("strong", "")
    );
    row.querySelector("strong").id = id;
    return row;
  }

  function setup() {
    if (document.querySelector(".cuaderno-ipad-shell")) return null;
    const workbench = document.querySelector(".editor-workbench");
    const legacyMain = document.querySelector("main.app-shell");
    if (!workbench || !legacyMain) return null;

    const preferences = readLayoutPreferences();
    const state = {
      ...preferences,
      lastFocus: null
    };

    const root = element("div", "cuaderno-ipad-shell");
    root.dataset.leftVisible = String(state.leftVisible);
    root.dataset.rightVisible = String(state.rightVisible);
    root.dataset.keyboardVisible = String(state.keyboardVisible);

    const rail = element("nav", "ipad-navigation-rail");
    rail.setAttribute("aria-label", "Áreas del Cuaderno de estudio");
    rail.setAttribute("role", "tablist");
    const brand = element("a", "ipad-navigation-brand");
    brand.href = "../../lab.html";
    brand.title = "Volver al Lab";
    brand.setAttribute("aria-label", "Jaramillo Music Lab");
    brand.append(
      element("span", "ipad-brand-mark", "JML"),
      element("span", "ipad-brand-caption", "Lab")
    );
    rail.appendChild(brand);

    const navButtons = new Map();
    NAV_ITEMS.forEach((item) => {
      const button = element("button", "ipad-navigation-button");
      button.type = "button";
      button.id = `ipad-nav-${item.id}`;
      button.dataset.panel = item.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", `ipad-panel-${item.id}`);
      button.append(icon(item.icon), element("span", "", item.label));
      rail.appendChild(button);
      navButtons.set(item.id, button);
    });
    const labLink = element("a", "ipad-navigation-button ipad-navigation-exit");
    labLink.href = "../../lab.html";
    labLink.title = "Volver al Lab";
    labLink.append(icon("arrow-left"), element("span", "", "Lab"));
    rail.appendChild(labLink);

    const main = element("main", "ipad-app-main");
    const header = element("header", "ipad-workspace-header");
    const headerLeft = element("div", "ipad-header-left");
    const toggleLeft = createIconButton({ icon: "panel-left", label: "Mostrar u ocultar herramientas" });
    const heading = element("div", "ipad-screen-heading");
    heading.append(
      element("span", "ipad-eyebrow", "CUADERNO DE ESTUDIO"),
      element("h1", "", "Ejercicio sin título")
    );
    const documentSubtitle = element("span", "ipad-document-subtitle", "Partitura editable");
    heading.appendChild(documentSubtitle);
    headerLeft.append(toggleLeft, heading);

    const headerCenter = element("div", "ipad-header-center");
    const saveButton = createIconButton({ icon: "save", label: "Guardar ejercicio", text: "Guardar", className: "ipad-header-action ipad-save-action" });
    const undoProxy = createIconButton({ icon: "undo-2", label: "Deshacer" });
    const redoProxy = createIconButton({ icon: "redo-2", label: "Rehacer" });
    const playProxy = createIconButton({ icon: "play", label: "Reproducir o detener" });
    headerCenter.append(saveButton, undoProxy, redoProxy, playProxy);

    const headerRight = element("div", "ipad-header-actions");
    const saveStatus = element("span", "ipad-save-status");
    saveStatus.dataset.state = "saved";
    saveStatus.append(element("span", "ipad-status-dot"), element("span", "", "Guardado"));
    const keyboardToggle = createIconButton({ icon: "piano", label: "Mostrar u ocultar teclado MIDI" });
    const toggleRight = createIconButton({ icon: "panel-right", label: "Mostrar u ocultar inspector" });
    const fullscreenProxy = createIconButton({ icon: "maximize", label: "Pantalla completa" });
    headerRight.append(saveStatus, keyboardToggle, toggleRight, fullscreenProxy);
    header.append(headerLeft, headerCenter, headerRight);

    const body = element("div", "ipad-workspace-body");
    const leftPanel = element("aside", "ipad-tools-panel");
    leftPanel.setAttribute("aria-label", "Herramientas");
    const leftHeader = element("div", "ipad-side-header");
    const leftHeading = element("div");
    leftHeading.append(element("span", "ipad-eyebrow", "HERRAMIENTAS"), element("h2", "", "Escribir"));
    const leftClose = createIconButton({ icon: "x", label: "Cerrar herramientas" });
    leftHeader.append(leftHeading, leftClose);
    const leftContent = element("div", "ipad-side-content");
    leftPanel.append(leftHeader, leftContent);

    const workspace = element("section", "ipad-score-workspace");
    workspace.setAttribute("aria-label", "Partitura");
    const workspaceStatus = element("div", "ipad-score-status");
    const cursorStatus = element("strong", "", "Selección · Compás 1");
    const sceneStatus = element("span", "", "Repaso");
    workspaceStatus.append(cursorStatus, sceneStatus);
    workspace.append(workspaceStatus, workbench);

    const rightPanel = element("aside", "ipad-inspector-panel");
    rightPanel.setAttribute("aria-label", "Inspector");
    const rightHeader = element("div", "ipad-side-header");
    const rightHeading = element("div");
    rightHeading.append(element("span", "ipad-eyebrow", "INSPECTOR"), element("h2", "", "Estado actual"));
    const rightClose = createIconButton({ icon: "x", label: "Cerrar inspector" });
    rightHeader.append(rightHeading, rightClose);
    const rightContent = element("div", "ipad-side-content ipad-inspector-content");
    const sessionSection = createControlSection("Escritura");
    sessionSection.classList.add("ipad-state-section");
    sessionSection.append(
      createStateRow("Modo", "ipadStateMode"),
      createStateRow("Voz", "ipadStateVoice"),
      createStateRow("Figura", "ipadStateDuration"),
      createStateRow("Grid", "ipadStateGrid")
    );
    const positionSection = createControlSection("Posición");
    const positionText = element("p", "ipad-inspector-copy", "Compás 1 · 1/4");
    positionText.id = "ipadCursorStatus";
    positionSection.appendChild(positionText);
    const paletteSection = createControlSection("Opciones");
    paletteSection.classList.add("ipad-palette-section");
    const paletteHint = element("p", "ipad-inspector-empty", "Selecciona una herramienta para ver sus opciones.");
    const paletteHost = element("div", "ipad-palette-host");
    paletteHost.appendChild(paletteHint);
    paletteSection.appendChild(paletteHost);
    const documentSection = createControlSection("Documento");
    const documentState = element("p", "ipad-inspector-copy", "Guardado");
    documentState.id = "ipadDocumentStatus";
    documentSection.appendChild(documentState);
    rightContent.append(sessionSection, positionSection, paletteSection, documentSection);
    rightPanel.append(rightHeader, rightContent);

    const scrim = element("button", "ipad-panel-scrim");
    scrim.type = "button";
    scrim.setAttribute("aria-label", "Cerrar paneles");
    body.append(leftPanel, workspace, rightPanel, scrim);
    main.append(header, body);
    root.append(rail, main);

    document.body.appendChild(root);
    document.querySelector(".app-header")?.classList.add("is-ipad-shell-hidden");
    document.querySelector(".page-bg")?.classList.add("is-ipad-shell-hidden");
    workbench.classList.add("is-ipad-workbench");
    workbench.querySelector(".editor-menu--primary")?.classList.add("is-ipad-shell-source");

    const manual = document.getElementById("manualOverlay");
    if (manual) document.body.appendChild(manual);

    const panels = new Map();
    NAV_ITEMS.forEach((item) => {
      const panel = element("section", "ipad-panel-page");
      panel.id = `ipad-panel-${item.id}`;
      panel.dataset.panelPage = item.id;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `ipad-nav-${item.id}`);
      leftContent.appendChild(panel);
      panels.set(item.id, panel);
    });

    const documentPanel = panels.get("document");
    documentPanel.appendChild(sectionHeader("ARCHIVO", "Biblioteca", "Organiza, importa y exporta tus ejercicios."));
    const newDocumentButton = createIconButton({
      icon: "file-plus-2",
      label: "Nuevo ejercicio",
      text: "Nuevo ejercicio",
      className: "ipad-primary-action"
    });
    documentPanel.appendChild(newDocumentButton);
    moveLegacyPanel(".exercise-app-menu__panel--file", documentPanel);

    const buildToolPanel = (panelId, eyebrow, title, description, groupTitle) => {
      const panel = panels.get(panelId);
      panel.appendChild(sectionHeader(eyebrow, title, description));
      const group = createControlSection(groupTitle);
      const grid = element("div", "ipad-tool-grid");
      (TOOL_GROUPS[panelId] || []).forEach((config) => {
        const button = proxyButton(config, context);
        if (button) grid.appendChild(button);
      });
      group.appendChild(grid);
      panel.appendChild(group);
      return panel;
    };

    const context = {
      setRightVisible(visible) {
        if (visible && window.matchMedia("(max-width: 1180px)").matches) {
          state.leftVisible = false;
          root.dataset.leftVisible = "false";
          toggleLeft.setAttribute("aria-pressed", "false");
        }
        state.rightVisible = visible;
        root.dataset.rightVisible = String(visible);
        toggleRight.setAttribute("aria-pressed", visible ? "true" : "false");
        saveLayoutPreferences(state);
      }
    };

    const writePanel = buildToolPanel("write", "ESCRITURA", "Notas y figuras", "Elige el modo de entrada y la estructura rítmica.", "Herramientas");
    const gridSection = createControlSection("Resolución del cursor");
    const originalGrid = document.getElementById("gridDurationSelect");
    if (originalGrid) {
      const label = element("label", "ipad-field");
      label.appendChild(element("span", "", "Grid"));
      const select = originalGrid.cloneNode(true);
      select.removeAttribute("id");
      select.value = originalGrid.value;
      select.addEventListener("change", () => {
        originalGrid.value = select.value;
        originalGrid.dispatchEvent(new Event("change", { bubbles: true }));
      });
      originalGrid.addEventListener("change", () => { select.value = originalGrid.value; });
      label.appendChild(select);
      gridSection.appendChild(label);
    }
    writePanel.appendChild(gridSection);

    buildToolPanel("notation", "NOTACIÓN", "Símbolos", "Compases, claves, articulaciones y estructura.", "Paletas");
    const textPanel = buildToolPanel("text", "TEXTO", "Texto y cifrado", "Añade indicaciones, cifrados y formato editorial.", "Herramientas");
    const textToolbar = document.getElementById("textToolbar");
    if (textToolbar) {
      textToolbar.classList.add("ipad-text-toolbar");
      textPanel.appendChild(textToolbar);
    }

    const scenesPanel = panels.get("scenes");
    scenesPanel.appendChild(sectionHeader("SECUENCIA", "Escenas", "Crea pasos de repaso o un recorrido bloqueado de ejercicio."));
    moveLegacyPanel(".exercise-app-menu__panel--scenes", scenesPanel);

    const playbackPanel = buildToolPanel("playback", "REPRODUCCIÓN", "Escucha", "Reproduce la partitura mediante una salida MIDI local.", "Transporte");
    const bpmSection = createControlSection("Tempo");
    const originalBpm = document.getElementById("playbackBpmInput");
    if (originalBpm) {
      const label = element("label", "ipad-field");
      label.appendChild(element("span", "", "BPM"));
      const input = originalBpm.cloneNode(true);
      input.removeAttribute("id");
      input.value = originalBpm.value;
      const commit = () => {
        originalBpm.value = input.value;
        originalBpm.dispatchEvent(new Event("change", { bubbles: true }));
        input.value = originalBpm.value;
      };
      input.addEventListener("change", commit);
      originalBpm.addEventListener("change", () => { input.value = originalBpm.value; });
      label.appendChild(input);
      bpmSection.appendChild(label);
    }
    const midiState = element("p", "ipad-inline-status", "Buscando dispositivos MIDI...");
    midiState.id = "ipadMidiStatus";
    bpmSection.appendChild(midiState);
    playbackPanel.appendChild(bpmSection);

    const helpPanel = panels.get("help");
    helpPanel.appendChild(sectionHeader("AYUDA", "Manual", "Consulta las funciones y los atajos del editor."));
    moveLegacyPanel(".exercise-app-menu__panel--help", helpPanel);
    const shortcutSection = createControlSection("Atajos esenciales");
    shortcutSection.innerHTML += `
      <dl class="ipad-shortcut-list">
        <div><dt>Espacio</dt><dd>Reproducir / detener</dd></div>
        <div><dt>Enter</dt><dd>Entrar / salir de escritura</dd></div>
        <div><dt>Esc</dt><dd>Volver a selección</dd></div>
        <div><dt>Cmd/Ctrl + Z</dt><dd>Deshacer</dd></div>
      </dl>
    `;
    helpPanel.appendChild(shortcutSection);

    const durationDrawer = document.getElementById("durationDrawer");
    if (durationDrawer) {
      durationDrawer.classList.add("ipad-context-drawer");
      paletteHost.appendChild(durationDrawer);
      const drawerObserver = new MutationObserver(() => {
        const open = !durationDrawer.classList.contains("is-hidden");
        paletteHint.hidden = open;
        paletteSection.classList.toggle("has-options", open);
        const palette = durationDrawer.dataset.activePalette || "";
        rightHeading.querySelector("h2").textContent = open
          ? ({
              figures: "Figuras",
              ties: "Ligaduras",
              tuplets: "Tuplets",
              meters: "Compás",
              tempo: "Tempo",
              clefs: "Claves",
              articulations: "Articulaciones",
              keys: "Armadura",
              dynamics: "Dinámicas",
              endings: "Casillas",
              canvas: "Vista",
              tools: "Voicings",
              bars: "Barras",
              jazz: "Jazz",
              scenes: "Escenas",
              selection: "Selección"
            }[palette] || "Opciones")
          : "Estado actual";
        if (open) context.setRightVisible(true);
      });
      drawerObserver.observe(durationDrawer, { attributes: true, attributeFilter: ["class", "data-active-palette"] });
    }

    const proxyClick = (proxy, sourceSelector) => {
      const source = document.querySelector(sourceSelector);
      if (!source) {
        proxy.disabled = true;
        return;
      }
      proxy.addEventListener("click", () => source.click());
      const sync = () => {
        proxy.disabled = source.disabled;
        proxy.classList.toggle("is-active", source.classList.contains("is-active"));
        proxy.setAttribute("aria-pressed", source.getAttribute("aria-pressed") || "false");
      };
      sync();
      new MutationObserver(sync).observe(source, {
        attributes: true,
        attributeFilter: ["disabled", "class", "aria-pressed"]
      });
    };
    proxyClick(undoProxy, "#undoButton");
    proxyClick(redoProxy, "#redoButton");
    proxyClick(playProxy, "#playbackButton");
    proxyClick(saveButton, "#saveExerciseButton");
    proxyClick(fullscreenProxy, "#fullscreenButton");

    function setLeftVisible(visible) {
      if (visible && window.matchMedia("(max-width: 1180px)").matches) {
        state.rightVisible = false;
        root.dataset.rightVisible = "false";
        toggleRight.setAttribute("aria-pressed", "false");
      }
      state.leftVisible = visible;
      root.dataset.leftVisible = String(visible);
      toggleLeft.setAttribute("aria-pressed", visible ? "true" : "false");
      saveLayoutPreferences(state);
    }

    function setKeyboardVisible(visible) {
      state.keyboardVisible = visible;
      root.dataset.keyboardVisible = String(visible);
      keyboardToggle.setAttribute("aria-pressed", visible ? "true" : "false");
      saveLayoutPreferences(state);
      window.dispatchEvent(new Event("resize"));
    }

    function activatePanel(panelId, options = {}) {
      const nextId = panels.has(panelId) ? panelId : "write";
      const clickedActive = state.activePanel === nextId;
      state.activePanel = nextId;
      if (options.toggle && clickedActive) {
        setLeftVisible(!state.leftVisible);
      } else {
        setLeftVisible(true);
      }
      panels.forEach((panel, id) => {
        const active = id === nextId;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
      navButtons.forEach((button, id) => {
        const active = id === nextId;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.tabIndex = active ? 0 : -1;
      });
      const navItem = NAV_ITEMS.find((item) => item.id === nextId);
      leftHeading.querySelector("h2").textContent = navItem?.label || "Herramientas";
      saveLayoutPreferences(state);
    }

    navButtons.forEach((button, panelId) => {
      button.addEventListener("click", () => activatePanel(panelId, { toggle: true }));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const items = [...navButtons.values()];
        const index = items.indexOf(button);
        const nextIndex = event.key === "Home"
          ? 0
          : event.key === "End"
            ? items.length - 1
            : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[nextIndex].focus();
        activatePanel(items[nextIndex].dataset.panel);
      });
    });

    toggleLeft.addEventListener("click", () => setLeftVisible(!state.leftVisible));
    leftClose.addEventListener("click", () => setLeftVisible(false));
    toggleRight.addEventListener("click", () => context.setRightVisible(!state.rightVisible));
    rightClose.addEventListener("click", () => context.setRightVisible(false));
    keyboardToggle.addEventListener("click", () => setKeyboardVisible(!state.keyboardVisible));
    scrim.addEventListener("click", () => {
      setLeftVisible(false);
      context.setRightVisible(false);
    });
    newDocumentButton.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("jml-editor-new-document"));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (window.matchMedia("(max-width: 1180px)").matches && (state.leftVisible || state.rightVisible)) {
        setLeftVisible(false);
        context.setRightVisible(false);
      }
    });

    function syncInputState() {
      const html = document.documentElement;
      const phase = html.dataset.inputPhase || "select";
      const voice = html.dataset.inputVoice || "1";
      const duration = html.dataset.inputDuration || "quarter";
      const grid = html.dataset.inputGrid || "eighth";
      const modeLabel = phase === "write"
        ? (html.dataset.inputChord === "true" ? "Acorde" : "Escritura")
        : phase === "edit"
          ? "Edición"
          : "Selección";
      document.getElementById("ipadStateMode").textContent = modeLabel;
      document.getElementById("ipadStateVoice").textContent = `Línea ${voice}`;
      document.getElementById("ipadStateDuration").textContent = DURATION_LABELS[duration] || duration;
      document.getElementById("ipadStateGrid").textContent = DURATION_LABELS[grid] || grid;
    }

    new MutationObserver(syncInputState).observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-input-phase",
        "data-input-voice",
        "data-input-duration",
        "data-input-grid",
        "data-input-chord"
      ]
    });

    const cursorSource = document.getElementById("cursorLabel");
    const syncCursor = () => {
      const text = cursorSource?.textContent?.trim() || "Selección · Compás 1";
      cursorStatus.textContent = text;
      positionText.textContent = text;
    };
    if (cursorSource) {
      new MutationObserver(syncCursor).observe(cursorSource, { childList: true, subtree: true, characterData: true });
    }

    function updateDocumentState(detail = {}) {
      const title = String(detail.title || "Ejercicio sin título").trim() || "Ejercicio sin título";
      heading.querySelector("h1").textContent = title;
      documentSubtitle.textContent = detail.description || "Partitura editable";
      const dirty = detail.dirty === true;
      const storageError = detail.storageError === true;
      saveStatus.dataset.state = storageError ? "error" : dirty ? "dirty" : "saved";
      saveStatus.lastElementChild.textContent = storageError
        ? "No se pudo guardar"
        : dirty
          ? "Cambios sin guardar"
          : "Guardado";
      documentState.textContent = storageError
        ? (detail.status || "El almacenamiento local no está disponible.")
        : dirty
          ? "El borrador está protegido localmente, pero aún no forma parte de la biblioteca."
          : (detail.status || "Documento guardado en la biblioteca.");
      if (detail.sceneMode) {
        const progress = Number.isFinite(detail.sceneIndex) && Number.isFinite(detail.sceneCount)
          ? ` · ${detail.sceneIndex + 1}/${detail.sceneCount}`
          : "";
        sceneStatus.textContent = `${detail.sceneMode === "exercise" ? "Ejercicio" : "Repaso"}${progress}`;
        root.dataset.sceneMode = detail.sceneMode;
      }
      if (detail.midiStatus) midiState.textContent = detail.midiStatus;
    }

    document.addEventListener("jml-editor-state", (event) => updateDocumentState(event.detail));
    const statusSource = document.getElementById("exerciseStatus");
    if (statusSource) {
      new MutationObserver(() => {
        const text = statusSource.textContent.trim();
        if (text) documentState.textContent = text;
      }).observe(statusSource, { childList: true, subtree: true, characterData: true });
    }

    activatePanel(state.activePanel);
    setLeftVisible(state.leftVisible);
    context.setRightVisible(state.rightVisible);
    setKeyboardVisible(state.keyboardVisible);
    syncInputState();
    syncCursor();

    legacyMain.classList.add("is-ipad-shell-hidden");
    document.documentElement.dataset.ipadShell = "ready";
    window.dispatchEvent(new Event("resize"));

    return Object.freeze({
      root,
      activatePanel,
      setKeyboardVisible,
      setLeftVisible,
      setRightVisible: context.setRightVisible,
      updateDocumentState
    });
  }

  global.JMLScoreIpadShell = Object.freeze({ setup });
})(window);
