(function () {
  function create(title = "Procesando", options = {}) {
    document.querySelector(".editor-progress-backdrop")?.remove();
    const backdrop = document.createElement("div");
    backdrop.className = "editor-progress-backdrop";
    const box = document.createElement("div");
    box.className = "editor-progress";
    const titleNode = document.createElement("p");
    titleNode.className = "editor-progress__title";
    titleNode.textContent = title;
    const labelNode = document.createElement("p");
    labelNode.className = "editor-progress__label";
    labelNode.textContent = "Preparando...";
    const track = document.createElement("div");
    track.className = "editor-progress__track";
    const bar = document.createElement("div");
    bar.className = "editor-progress__bar";
    track.appendChild(bar);
    box.append(titleNode, labelNode, track);
    backdrop.appendChild(box);
    (options.host || document.body).appendChild(backdrop);
    return {
      update(value, label = "") {
        const amount = Math.max(0, Math.min(1, Number(value) || 0));
        bar.style.width = `${Math.round(amount * 100)}%`;
        labelNode.textContent = label || `${Math.round(amount * 100)}%`;
      },
      close() {
        backdrop.remove();
      }
    };
  }

  window.JMLScoreProgress = Object.freeze({
    create
  });
})();
