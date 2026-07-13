(function (global) {
  const MENU_DEFINITIONS = Object.freeze([
    {
      id: "edit",
      label: "Edición",
      items: [
        { label: "Deshacer", target: "#undoButton", shortcut: "Cmd/Ctrl+Z" },
        { label: "Rehacer", target: "#redoButton", shortcut: "Cmd/Ctrl+Shift+Z" },
        { separator: true },
        { label: "Selección", palette: "selection", shortcut: "Esc" },
        { label: "Modo edición", target: "#editModeButton" },
        { label: "Mover elementos", target: "#shiftModeButton" },
        { separator: true },
        { label: "Drops y voicings", palette: "tools", shortcut: "Shift+I" },
        { label: "Reorganizar partitura", target: "#reflowButton" },
        { label: "Limpiar", target: "#clearButton" }
      ]
    },
    {
      id: "write",
      label: "Escritura",
      items: [
        { label: "Figuras y silencios", palette: "figures", shortcut: "Shift+N" },
        { field: "grid", label: "Grid" },
        { label: "Tuplets", palette: "tuplets", shortcut: "Ñ / Shift+Ñ" },
        { separator: true },
        { label: "Texto", target: "#textModeButton", shortcut: "Shift+X" },
        { label: "Cifrado", target: "#chordModeButton", shortcut: "Shift+Q" }
      ]
    },
    {
      id: "notation",
      label: "Notación",
      items: [
        { label: "Ligaduras", palette: "ties", shortcut: "T / S" },
        { label: "Compás", palette: "meters", shortcut: "Shift+M" },
        { label: "Tempo", palette: "tempo", shortcut: "Shift+T" },
        { label: "Claves", palette: "clefs", shortcut: "Shift+C" },
        { label: "Armadura", target: "#keySignatureButton", shortcut: "Shift+K" },
        { separator: true },
        { label: "Articulaciones", palette: "articulations", shortcut: "Shift+O / P / H" },
        { label: "Dinámicas", target: "#dynamicsButton", shortcut: "Shift+D" },
        { label: "Casillas", palette: "endings" },
        { label: "Barras y repeticiones", palette: "bars", shortcut: "Shift+B / R" }
      ]
    },
    {
      id: "playback",
      label: "Reproducción",
      items: [
        { label: "Reproducir / detener", target: "#playbackButton", shortcut: "Space / P" },
        { field: "bpm", label: "BPM" },
        { label: "Interpretación jazz", palette: "jazz" }
      ]
    },
    {
      id: "view",
      label: "Vista",
      items: [
        { label: "Canvas", palette: "canvas" },
        { label: "Pantalla completa", target: "#fullscreenButton" }
      ]
    }
  ]);

  function createElement(tag, className = "", text = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function originalPaletteTrigger(paletteId) {
    return document.querySelector(`.editor-menu--primary [data-palette="${CSS.escape(paletteId)}"]`);
  }

  function isTargetActive(target) {
    return target?.classList.contains("is-active") || target?.getAttribute("aria-pressed") === "true";
  }

  function createMenuDetails(definition) {
    const details = createElement("details", "editor-app-menu");
    details.dataset.appMenu = definition.id;
    const summary = createElement("summary", "editor-app-menu__summary", definition.label);
    summary.setAttribute("role", "menuitem");
    const panel = createElement("div", "editor-app-menu__panel");
    panel.setAttribute("role", "menu");
    panel.setAttribute("aria-label", definition.label);
    details.append(summary, panel);
    return { details, panel };
  }

  function createSeparator() {
    const separator = createElement("div", "editor-app-menu__separator");
    separator.setAttribute("role", "separator");
    return separator;
  }

  function createShortcut(text) {
    const shortcut = createElement("span", "editor-app-menu__shortcut", text || "");
    shortcut.setAttribute("aria-hidden", "true");
    return shortcut;
  }

  function createActionItem(item, context) {
    const target = item.palette
      ? originalPaletteTrigger(item.palette)
      : document.querySelector(item.target || "");
    if (!target) return null;
    const button = createElement("button", "editor-app-menu__item");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.dataset.menuLabel = item.label;
    if (item.palette) {
      button.dataset.paletteProxy = item.palette;
      button.classList.add("has-submenu");
    } else {
      button.dataset.targetProxy = item.target;
    }
    const label = createElement("span", "editor-app-menu__item-label", item.label);
    const trailing = createElement("span", "editor-app-menu__item-trailing");
    trailing.appendChild(createShortcut(item.shortcut));
    const arrow = createElement("span", "editor-app-menu__submenu-arrow", item.palette ? "›" : "");
    if (!item.palette) arrow.classList.add("is-placeholder");
    trailing.appendChild(arrow);
    button.append(label, trailing);

    const sync = () => button.classList.toggle("is-active", isTargetActive(target));
    sync();
    new MutationObserver(sync).observe(target, {
      attributes: true,
      attributeFilter: ["class", "aria-pressed", "aria-expanded"]
    });

    if (item.palette) {
      button.addEventListener("pointerenter", () => {
        context.activatePaletteRow(button, target, item.palette);
      });
    } else {
      button.addEventListener("pointerenter", () => context.dismissPaletteForRow(button));
    }

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (item.palette) {
        context.activatePaletteRow(button, target, item.palette);
        return;
      }
      context.closeTopMenus();
      context.closePaletteDrawer();
      target.click();
    });
    return button;
  }

  function createGridField(context) {
    const original = document.getElementById("gridDurationSelect");
    if (!original) return null;
    const row = createElement("label", "editor-app-menu__item editor-app-menu__field");
    row.appendChild(createElement("span", "editor-app-menu__item-label", "Grid"));
    const select = original.cloneNode(true);
    select.removeAttribute("id");
    select.setAttribute("aria-label", "Grid del cursor");
    select.value = original.value;
    select.addEventListener("change", () => {
      original.value = select.value;
      original.dispatchEvent(new Event("change", { bubbles: true }));
    });
    original.addEventListener("change", () => { select.value = original.value; });
    row.appendChild(select);
    context.fieldSynchronizers.push(() => { select.value = original.value; });
    return row;
  }

  function createBpmField(context) {
    const original = document.getElementById("playbackBpmInput");
    if (!original) return null;
    const row = createElement("label", "editor-app-menu__item editor-app-menu__field");
    row.appendChild(createElement("span", "editor-app-menu__item-label", "BPM"));
    const input = original.cloneNode(true);
    input.removeAttribute("id");
    input.setAttribute("aria-label", "BPM de reproducción");
    const commit = () => {
      original.value = input.value;
      original.dispatchEvent(new Event("change", { bubbles: true }));
      input.value = original.value;
    };
    input.addEventListener("change", commit);
    input.addEventListener("blur", commit);
    original.addEventListener("change", () => { input.value = original.value; });
    row.appendChild(input);
    context.fieldSynchronizers.push(() => { input.value = original.value; });
    return row;
  }

  function decorateExistingMenu(details, id) {
    if (!details) return;
    details.classList.add("editor-app-menu", "editor-app-menu--existing");
    details.dataset.appMenu = id;
    details.querySelector(":scope > summary")?.classList.add("editor-app-menu__summary");
    details.querySelector(":scope > div")?.classList.add("editor-app-menu__panel");
  }

  function setup(options = {}) {
    const workbench = document.querySelector(".editor-workbench");
    const sourceToolbar = workbench?.querySelector(".editor-menu--primary");
    const drawer = document.getElementById("durationDrawer");
    if (!workbench || !sourceToolbar || !drawer || workbench.querySelector(".editor-application-menubar")) return null;

    const existingMenus = [...document.querySelectorAll(".exercise-app-menu")];
    const [fileMenu, scenesMenu, helpMenu] = existingMenus;
    decorateExistingMenu(fileMenu, "file");
    decorateExistingMenu(scenesMenu, "scenes");
    decorateExistingMenu(helpMenu, "help");

    const bar = createElement("nav", "editor-application-menubar");
    bar.setAttribute("role", "menubar");
    bar.setAttribute("aria-label", "Menú de la aplicación");
    sourceToolbar.before(bar);
    sourceToolbar.classList.add("is-application-menu-source");
    document.querySelector(".exercise-library")?.classList.add("is-merged-into-editor-menu");

    const context = {
      activePaletteRow: null,
      fieldSynchronizers: [],
      closePaletteDrawer: typeof options.closePaletteDrawer === "function" ? options.closePaletteDrawer : () => {},
      closeTopMenus() {
        bar.querySelectorAll(":scope > details[open]").forEach((menu) => { menu.open = false; });
      },
      activatePaletteRow: () => {},
      dismissPaletteForRow: () => {},
      positionPaletteDrawer: () => {}
    };

    context.activatePaletteRow = (row, target, paletteId) => {
      context.activePaletteRow = row;
      const alreadyOpen = !drawer.classList.contains("is-hidden") && drawer.dataset.activePalette === paletteId;
      if (!alreadyOpen) target.click();
      requestAnimationFrame(() => context.positionPaletteDrawer(row));
    };

    context.dismissPaletteForRow = (row) => {
      if (!context.activePaletteRow || !row.closest("details")?.contains(context.activePaletteRow)) return;
      context.closePaletteDrawer();
      context.activePaletteRow = null;
    };

    if (fileMenu) bar.appendChild(fileMenu);
    MENU_DEFINITIONS.forEach((definition) => {
      const { details, panel } = createMenuDetails(definition);
      definition.items.forEach((item) => {
        if (item.separator) {
          panel.appendChild(createSeparator());
          return;
        }
        const control = item.field === "grid"
          ? createGridField(context)
          : item.field === "bpm"
            ? createBpmField(context)
            : createActionItem(item, context);
        if (control) {
          if (item.field) control.addEventListener("pointerenter", () => context.dismissPaletteForRow(control));
          panel.appendChild(control);
        }
      });
      bar.appendChild(details);
    });
    if (scenesMenu) bar.appendChild(scenesMenu);
    if (helpMenu) bar.appendChild(helpMenu);

    const status = document.getElementById("exerciseStatus");
    const filePanel = fileMenu?.querySelector(":scope > .editor-app-menu__panel");
    if (status && filePanel) filePanel.appendChild(status);

    const topMenus = [...bar.querySelectorAll(":scope > details")];
    topMenus.forEach((menu) => {
      menu.querySelector(":scope > summary")?.addEventListener("pointerenter", () => {
        if (bar.querySelector(":scope > details[open]") && !menu.open) menu.open = true;
      });
      menu.addEventListener("toggle", () => {
        if (!menu.open) return;
        topMenus.forEach((other) => { if (other !== menu) other.open = false; });
        context.fieldSynchronizers.forEach((sync) => sync());
        if (!context.activePaletteRow || !menu.contains(context.activePaletteRow)) {
          context.closePaletteDrawer();
          context.activePaletteRow = null;
        }
      });
    });

    context.positionPaletteDrawer = (row) => {
      if (!row || drawer.classList.contains("is-hidden")) return;
      const panel = row.closest(".editor-app-menu__panel");
      const workbenchRect = workbench.getBoundingClientRect();
      const panelRect = panel?.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      if (!panelRect) return;
      drawer.dataset.presentation = "application-submenu";
      drawer.style.visibility = "hidden";
      drawer.style.left = "0px";
      drawer.style.top = "0px";
      requestAnimationFrame(() => {
        const drawerRect = drawer.getBoundingClientRect();
        const rightPosition = panelRect.right - workbenchRect.left + 4;
        const leftPosition = panelRect.left - workbenchRect.left - drawerRect.width - 4;
        const maxLeft = Math.max(8, workbenchRect.width - drawerRect.width - 8);
        const left = rightPosition + drawerRect.width <= workbenchRect.width - 8
          ? rightPosition
          : Math.max(8, Math.min(leftPosition, maxLeft));
        const desiredTop = rowRect.top - workbenchRect.top;
        const maxTop = Math.max(36, workbenchRect.height - drawerRect.height - 8);
        drawer.style.left = `${Math.max(8, Math.min(left, maxLeft))}px`;
        drawer.style.top = `${Math.max(34, Math.min(desiredTop, maxTop))}px`;
        drawer.style.visibility = "visible";
      });
    };

    const drawerObserver = new MutationObserver(() => {
      const activePalette = drawer.dataset.activePalette || "";
      bar.querySelectorAll("[data-palette-proxy]").forEach((row) => {
        row.classList.toggle("is-active", !drawer.classList.contains("is-hidden") && row.dataset.paletteProxy === activePalette);
      });
      if (drawer.classList.contains("is-hidden")) {
        delete drawer.dataset.presentation;
        drawer.style.removeProperty("left");
        drawer.style.removeProperty("top");
        drawer.style.removeProperty("visibility");
        return;
      }
      const row = bar.querySelector(`[data-palette-proxy="${CSS.escape(activePalette)}"]`);
      if (!row) return;
      context.activePaletteRow = row;
      const menu = row.closest("details");
      if (menu && !menu.open) menu.open = true;
      requestAnimationFrame(() => context.positionPaletteDrawer(row));
    });
    drawerObserver.observe(drawer, { attributes: true, attributeFilter: ["class", "data-active-palette"] });

    document.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".editor-application-menubar, #durationDrawer")) return;
      context.closeTopMenus();
      context.closePaletteDrawer();
      context.activePaletteRow = null;
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      context.closeTopMenus();
      context.closePaletteDrawer();
      context.activePaletteRow = null;
    });
    window.addEventListener("resize", () => {
      if (context.activePaletteRow) context.positionPaletteDrawer(context.activePaletteRow);
    });

    return Object.freeze({ bar, closeMenus: context.closeTopMenus });
  }

  global.JMLScoreApplicationMenu = Object.freeze({ setup });
})(window);
