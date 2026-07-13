(function () {
  const Svg = window.JMLScoreSvg;
  if (!Svg) throw new Error("No se cargó score-editor-svg.js");

  function ledgerStepsForStaffStep(staffStep, topStep, bottomStep) {
    const steps = [];
    if (staffStep > topStep) {
      for (let step = topStep + 2; step <= staffStep; step += 2) steps.push(step);
    }
    if (staffStep < bottomStep) {
      for (let step = bottomStep - 2; step >= staffStep; step -= 2) steps.push(step);
    }
    return steps;
  }

  function appendLedgerLines(root, options = {}) {
    const {
      x = 0,
      staffStep = 0,
      topStep = 4,
      bottomStep = -4,
      pitchY,
      extension = 0,
      offsetX = 0,
      offsetY = 0,
      strokeWidth = 1,
      className = "leger"
    } = options;
    if (typeof pitchY !== "function") return;
    ledgerStepsForStaffStep(staffStep, topStep, bottomStep).forEach((step) => {
      const y = pitchY(step);
      root.appendChild(Svg.el("line", {
        class: className,
        x1: x - 13 - extension + offsetX,
        y1: y + offsetY,
        x2: x + 13 + extension + offsetX,
        y2: y + offsetY,
        "stroke-width": strokeWidth
      }));
    });
  }

  function durationTiePath(points = {}) {
    const {
      x1 = 0,
      x2 = 0,
      sourceY = 0,
      targetY = 0,
      controlX1 = x1,
      controlX2 = x2,
      controlY1 = sourceY,
      controlY2 = targetY,
      innerSourceY = sourceY,
      innerTargetY = targetY,
      innerControlY1 = controlY1,
      innerControlY2 = controlY2
    } = points;
    return [
      `M ${x1} ${sourceY}`,
      `C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${x2} ${targetY}`,
      `L ${x2} ${innerTargetY}`,
      `C ${controlX2} ${innerControlY2} ${controlX1} ${innerControlY1} ${x1} ${innerSourceY}`,
      "Z"
    ].join(" ");
  }

  function appendDurationTie(root, points = {}) {
    root.appendChild(Svg.el("path", {
      class: points.className || "duration-tie",
      d: durationTiePath(points)
    }));
  }

  window.JMLScoreEntryRender = Object.freeze({
    appendDurationTie,
    appendLedgerLines,
    durationTiePath,
    ledgerStepsForStaffStep
  });
})();
