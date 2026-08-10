(function () {
  function createInstantTooltipController(options = {}) {
    const selector = options.selector || "button, label, select";
    const className = options.className || "instant-tooltip";
    let tooltipEl = null;

    function targetFromEvent(event) {
      return event?.target?.closest?.(selector) || null;
    }

    function textForElement(element) {
      if (!element) return "";
      if (element.closest?.(".editor-application-menubar, #durationDrawer[data-presentation='application-submenu'], .midi-figure-strip")) return "";
      if (element.title) {
        element.dataset.tooltipTitle = element.title;
        element.removeAttribute("title");
      }
      return element.dataset.tooltip ||
        element.dataset.tooltipTitle ||
        element.getAttribute("aria-label") ||
        element.textContent?.trim() ||
        "";
    }

    function ensureElement() {
      if (tooltipEl) return tooltipEl;
      tooltipEl = document.createElement("div");
      tooltipEl.className = className;
      document.body.appendChild(tooltipEl);
      return tooltipEl;
    }

    function position(event) {
      if (!tooltipEl || !event) return;
      const x = Math.min(window.innerWidth - 16, event.clientX + 12);
      const y = Math.max(8, event.clientY - 34);
      tooltipEl.style.left = `${x}px`;
      tooltipEl.style.top = `${y}px`;
    }

    function show(event) {
      const target = targetFromEvent(event);
      const text = textForElement(target);
      if (!target || !text) return;
      const node = ensureElement();
      node.textContent = text;
      node.classList.add("is-visible");
      position(event);
    }

    function hide() {
      tooltipEl?.classList.remove("is-visible");
    }

    function relatedTargetMatches(event) {
      return event?.relatedTarget?.closest?.(selector) || null;
    }

    function setup(scope) {
      if (!scope) return false;
      scope.addEventListener("pointerover", show, true);
      scope.addEventListener("pointermove", position, true);
      scope.addEventListener("mouseover", show, true);
      scope.addEventListener("mousemove", position, true);
      scope.addEventListener("pointerout", (event) => {
        if (!relatedTargetMatches(event)) hide();
      }, true);
      scope.addEventListener("mouseout", (event) => {
        if (!relatedTargetMatches(event)) hide();
      }, true);
      return true;
    }

    return Object.freeze({
      hide,
      position,
      setup,
      show,
      targetFromEvent,
      textForElement
    });
  }

  window.JMLScoreTooltips = Object.freeze({
    createInstantTooltipController
  });
})();
