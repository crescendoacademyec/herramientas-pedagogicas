(function () {
  const Svg = window.JMLScoreSvg;
  if (!Svg) throw new Error("No se cargó score-editor-svg.js");

  function appendStaffLines(root, options = {}) {
    const {
      lineSteps = [],
      visibleRuns = [],
      pitchY,
      offsetY = 0,
      strokeWidth = 1,
      percussion = false
    } = options;
    lineSteps.forEach((staffStep) => {
      const y = pitchY(staffStep) + offsetY;
      visibleRuns.forEach((run) => {
        root.appendChild(Svg.el("line", {
          class: `staff-line${percussion ? " percussion-line" : ""}`,
          x1: run.start,
          y1: y,
          x2: run.end,
          y2: y,
          "stroke-width": strokeWidth
        }));
      });
    });
  }

  function appendBarlineStroke(root, options = {}) {
    const {
      x = 0,
      y1 = 0,
      y2 = 0,
      offsetX = 0,
      className = "bar-line",
      width = 1
    } = options;
    root.appendChild(Svg.el("line", {
      class: className,
      x1: x + offsetX,
      y1,
      x2: x + offsetX,
      y2,
      "stroke-width": width
    }));
  }

  function appendRepeatDots(root, options = {}) {
    const {
      x = 0,
      side = "right",
      offsetX = 0,
      systemIndexes = [0],
      pitchYForSystem,
      radius = 2.35
    } = options;
    const dotX = x + offsetX + (side === "left" ? -8 : 8);
    systemIndexes.forEach((systemIndex) => {
      [1, -1].forEach((staffStep) => {
        root.appendChild(Svg.el("circle", {
          class: "bar-repeat-dot",
          cx: dotX,
          cy: pitchYForSystem(staffStep, systemIndex),
          r: radius
        }));
      });
    });
  }

  function appendInitialContextHit(root, rect) {
    const hit = Svg.el("rect", {
      class: "initial-context-hit",
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      rx: rect.rx ?? 5
    });
    root.appendChild(hit);
    return hit;
  }

  window.JMLScoreBasicRender = Object.freeze({
    appendBarlineStroke,
    appendInitialContextHit,
    appendRepeatDots,
    appendStaffLines
  });
})();
