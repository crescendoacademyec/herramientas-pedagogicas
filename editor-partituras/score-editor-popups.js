(function () {
  function removeExistingPrompt() {
    document.querySelector(".editor-prompt-backdrop")?.remove();
  }

  function defaultHost() {
    return document.querySelector(".editor-workbench") || document.body;
  }

  function requestText(options = {}) {
    const {
      title,
      initialValue = "",
      placeholder = "",
      help = "",
      input = true,
      okLabel = "Aceptar",
      cancelLabel = "Cancelar",
      host = defaultHost()
    } = options;
    return new Promise((resolve) => {
      removeExistingPrompt();
      const backdrop = document.createElement("div");
      backdrop.className = "editor-prompt-backdrop";
      const promptBox = document.createElement("div");
      promptBox.className = "editor-prompt";
      promptBox.setAttribute("role", "dialog");
      promptBox.setAttribute("aria-modal", "true");
      const titleNode = document.createElement("p");
      titleNode.className = "editor-prompt__title";
      titleNode.textContent = title || "";
      promptBox.appendChild(titleNode);
      if (help) {
        const helpNode = document.createElement("p");
        helpNode.className = "editor-prompt__help";
        helpNode.textContent = help;
        promptBox.appendChild(helpNode);
      }
      const inputNode = document.createElement("input");
      if (input) {
        inputNode.type = "text";
        inputNode.value = initialValue;
        if (placeholder) inputNode.placeholder = placeholder;
        promptBox.appendChild(inputNode);
      }
      const actions = document.createElement("div");
      actions.className = "editor-prompt__actions";
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = cancelLabel;
      const okButton = document.createElement("button");
      okButton.type = "button";
      okButton.textContent = okLabel;
      okButton.className = "is-primary";
      actions.append(cancelButton, okButton);
      promptBox.appendChild(actions);
      backdrop.appendChild(promptBox);
      host.appendChild(backdrop);

      const cleanup = (value) => {
        document.removeEventListener("keydown", onKeydown, true);
        backdrop.remove();
        resolve(value);
      };
      const commit = () => cleanup(input ? inputNode.value : "");
      const cancel = () => cleanup(null);
      function onKeydown(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        } else if (event.key === "Enter") {
          event.preventDefault();
          commit();
        }
      }

      okButton.addEventListener("click", commit);
      cancelButton.addEventListener("click", cancel);
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) cancel();
      });
      document.addEventListener("keydown", onKeydown, true);
      requestAnimationFrame(() => {
        if (input) {
          inputNode.focus();
          inputNode.select();
        } else {
          okButton.focus();
        }
      });
    });
  }

  function requestColor(options = {}) {
    const {
      title,
      current = "#15120f",
      help = "",
      okLabel = "Aceptar",
      cancelLabel = "Cancelar",
      host = defaultHost(),
      swatches = [],
      normalizeColor = (value) => String(value || "#15120f")
    } = options;
    return new Promise((resolve) => {
      removeExistingPrompt();
      let selectedColor = normalizeColor(current);
      const backdrop = document.createElement("div");
      backdrop.className = "editor-prompt-backdrop";
      const promptBox = document.createElement("div");
      promptBox.className = "editor-prompt editor-prompt--color";
      promptBox.setAttribute("role", "dialog");
      promptBox.setAttribute("aria-modal", "true");
      const titleNode = document.createElement("p");
      titleNode.className = "editor-prompt__title";
      titleNode.textContent = title || "";
      promptBox.appendChild(titleNode);
      if (help) {
        const helpNode = document.createElement("p");
        helpNode.className = "editor-prompt__help";
        helpNode.textContent = help;
        promptBox.appendChild(helpNode);
      }

      const pickerWrap = document.createElement("div");
      pickerWrap.className = "editor-color-picker";
      const mainRow = document.createElement("div");
      mainRow.className = "editor-color-picker__main";
      const preview = document.createElement("span");
      preview.className = "editor-color-picker__preview";
      const picker = document.createElement("input");
      picker.type = "color";
      picker.className = "editor-color-picker__input";
      picker.value = selectedColor;
      picker.setAttribute("aria-label", "Elegir color");
      mainRow.append(preview, picker);

      const swatchesNode = document.createElement("div");
      swatchesNode.className = "editor-color-picker__swatches";
      const swatchButtons = swatches.map((color) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "editor-color-picker__swatch";
        button.style.setProperty("--swatch-color", color);
        button.setAttribute("aria-label", "Color");
        button.addEventListener("click", () => setSelectedColor(color));
        swatchesNode.appendChild(button);
        return { color, button };
      });

      pickerWrap.append(mainRow, swatchesNode);
      promptBox.appendChild(pickerWrap);
      const actions = document.createElement("div");
      actions.className = "editor-prompt__actions";
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = cancelLabel;
      const okButton = document.createElement("button");
      okButton.type = "button";
      okButton.textContent = okLabel;
      okButton.className = "is-primary";
      actions.append(cancelButton, okButton);
      promptBox.appendChild(actions);
      backdrop.appendChild(promptBox);
      host.appendChild(backdrop);

      function setSelectedColor(color) {
        selectedColor = normalizeColor(color);
        picker.value = selectedColor;
        preview.style.background = selectedColor;
        swatchButtons.forEach(({ color: swatchColor, button }) => {
          button.classList.toggle("is-selected", normalizeColor(swatchColor) === selectedColor);
        });
      }
      const cleanup = (value) => {
        document.removeEventListener("keydown", onKeydown, true);
        backdrop.remove();
        resolve(value);
      };
      const commit = () => cleanup(selectedColor);
      const cancel = () => cleanup(null);
      function onKeydown(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        } else if (event.key === "Enter") {
          event.preventDefault();
          commit();
        }
      }

      picker.addEventListener("input", () => setSelectedColor(picker.value));
      okButton.addEventListener("click", commit);
      cancelButton.addEventListener("click", cancel);
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) cancel();
      });
      document.addEventListener("keydown", onKeydown, true);
      setSelectedColor(selectedColor);
      requestAnimationFrame(() => picker.focus());
    });
  }

  function showMessage(message, options = {}) {
    return requestText({
      title: options.title || "Revisa el formato",
      help: message,
      input: false,
      okLabel: options.okLabel || "OK",
      cancelLabel: options.cancelLabel || "Cerrar",
      host: options.host
    });
  }

  window.JMLScorePopups = Object.freeze({
    requestColor,
    requestText,
    showMessage
  });
})();
