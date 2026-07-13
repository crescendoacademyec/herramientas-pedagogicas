(function () {
  function identity(value) {
    return String(value ?? "");
  }

  function makeRange(options = {}) {
    const {
      label = "",
      value = 0,
      min = 0,
      max = 1,
      step = 1,
      formatValue = identity,
      onInput = () => {}
    } = options;
    const row = document.createElement("div");
    row.className = "appearance-control";
    row.innerHTML = `
      <label>
        <span>${label}</span>
        <output>${formatValue(value)}</output>
      </label>
      <div class="icon-range-row">
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}">
        <input class="icon-number-input" type="number" min="${min}" max="${max}" step="${step}" value="${value}">
      </div>
    `;
    const input = row.querySelector('input[type="range"]');
    const numberInput = row.querySelector('input[type="number"]');
    const output = row.querySelector("output");
    const applyValue = (nextValue) => {
      input.value = String(nextValue);
      numberInput.value = String(nextValue);
      output.textContent = formatValue(nextValue);
      onInput(nextValue);
    };
    input.addEventListener("input", () => applyValue(Number(input.value)));
    numberInput.addEventListener("input", () => applyValue(Number(numberInput.value)));
    return row;
  }

  function makeTextControl(options = {}) {
    const {
      label = "",
      value = "",
      placeholder = "",
      escapeHtml = identity,
      onInput = () => {}
    } = options;
    const row = document.createElement("div");
    row.className = "appearance-control";
    row.innerHTML = `
      <label>
        <span>${escapeHtml(label)}</span>
      </label>
      <input class="icon-text-input" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">
    `;
    const input = row.querySelector("input");
    input.addEventListener("input", () => onInput(input.value));
    return row;
  }

  window.JMLScoreAdminControls = Object.freeze({
    makeRange,
    makeTextControl
  });
})();
