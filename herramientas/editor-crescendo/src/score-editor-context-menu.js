(function () {
  function button(label, action, options = {}) {
    const htmlEl = options.htmlEl;
    const close = options.close || (() => {});
    const node = htmlEl("button", { type: "button", class: "score-context-menu__item" });
    node.appendChild(htmlEl("span", {
      class: "score-context-menu__item-label",
      text: label
    }));
    if (options.shortcut) {
      node.appendChild(htmlEl("kbd", {
        class: "score-context-menu__shortcut",
        text: options.shortcut
      }));
    }
    node.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      close();
      await action();
    });
    return node;
  }

  function glyphButton(glyphName, label, action, options = {}) {
    const htmlEl = options.htmlEl;
    const close = options.close || (() => {});
    const smufl = options.smufl || ((name) => name);
    const node = htmlEl("button", {
      type: "button",
      class: `score-context-menu__item score-context-menu__glyph-item${options.className ? ` ${options.className}` : ""}`,
      title: glyphName
    });
    node.appendChild(htmlEl("span", {
      class: "score-context-menu__glyph music-glyph",
      text: smufl(glyphName)
    }));
    node.appendChild(htmlEl("span", {
      class: "score-context-menu__glyph-label",
      text: label
    }));
    node.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      close();
      await action();
    });
    return node;
  }

  function group(label, items, options = {}) {
    const htmlEl = options.htmlEl;
    const details = htmlEl("details", { class: "score-context-menu__group" });
    details.appendChild(htmlEl("summary", { class: "score-context-menu__summary", text: label }));
    const body = htmlEl("div", { class: "score-context-menu__group-body" });
    items.forEach((item) => body.appendChild(item));
    details.appendChild(body);
    return details;
  }

  function position(menu, x, y, options = {}) {
    const host = options.host || document.body;
    const minHeight = Number.isFinite(options.minHeight) ? options.minHeight : 220;
    const margin = Number.isFinite(options.margin) ? options.margin : 10;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.setProperty("--context-menu-max-height", `${Math.max(minHeight, window.innerHeight - y - 14)}px`);
    host.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    const nextX = Math.min(x, window.innerWidth - rect.width - margin);
    const nextY = Math.min(y, window.innerHeight - rect.height - margin);
    menu.style.setProperty("--context-menu-max-height", `${Math.max(minHeight, window.innerHeight - Math.max(margin, nextY) - margin)}px`);
    menu.style.left = `${Math.max(margin, nextX)}px`;
    menu.style.top = `${Math.max(margin, nextY)}px`;
  }

  window.JMLScoreContextMenu = Object.freeze({
    button,
    glyphButton,
    group,
    position
  });
})();
