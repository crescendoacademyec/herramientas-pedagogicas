(function () {
  function refreshDurationButtons(durationTools, state) {
    [...(durationTools?.querySelectorAll("button[data-duration]") || [])].forEach((button) => {
      const matchesDuration = button.dataset.duration === state.activeDuration?.id;
      const entryKind = button.dataset.entryKind || "note";
      button.classList.toggle("is-active", matchesDuration && entryKind === state.mode);
    });
  }

  function setEntryMode(state, mode) {
    state.selectMode = false;
    state.editMode = false;
    state.mode = mode;
  }

  function setTextualMode(state, modeName, enabled) {
    if (enabled) {
      state.selectMode = false;
      state.editMode = false;
    }
    state[modeName] = enabled;
    if (!enabled) return;
    if (modeName !== "textMode") state.textMode = false;
    if (modeName !== "chordMode") state.chordMode = false;
    if (modeName !== "dynamicMode") state.dynamicMode = false;
  }

  function setEditMode(state, enabled) {
    state.editMode = enabled === true;
    if (!state.editMode) return false;
    state.selectMode = false;
    state.textMode = false;
    state.chordMode = false;
    state.dynamicMode = false;
    return true;
  }

  function updateButtons({
    state,
    elements = {},
    callbacks = {}
  } = {}) {
    const {
      noteModeButton,
      restModeButton,
      shiftModeButton,
      textModeButton,
      chordModeButton,
      dynamicsButton,
      selectToolButton,
      editModeButton,
      figureMenuButton,
      durationTools,
      textToolbar,
      textFontSelect,
      textSizeInput,
      textColorInput,
      textEnclosureSelect,
      textAlignSelect,
      gridDurationSelect,
      itemColorInput,
      zoomLabel,
      hideMeasureButton
    } = elements;
    const {
      getActiveGridDuration,
      getCurrentMeasure,
      measureHidden,
      updateMidiControls
    } = callbacks;

    noteModeButton?.classList.toggle("is-active", state.mode === "note" && !state.selectMode);
    restModeButton?.classList.toggle("is-active", state.mode === "rest" && !state.selectMode);
    shiftModeButton?.classList.toggle("is-active", state.shiftMode);
    textModeButton?.classList.toggle("is-active", state.textMode);
    chordModeButton?.classList.toggle("is-active", state.chordMode);
    dynamicsButton?.classList.toggle("is-active", state.dynamicMode);
    selectToolButton?.classList.toggle("is-active", state.selectMode);
    editModeButton?.classList.toggle("is-active", state.editMode);
    figureMenuButton?.classList.toggle("is-active", !state.selectMode && (state.mode === "note" || state.mode === "rest"));

    refreshDurationButtons(durationTools, state);
    [...(durationTools?.querySelectorAll("button[data-tuplet]") || [])].forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.tuplet) === state.tuplet);
    });

    if (textToolbar) {
      const hasTextSelection = state.textMode || state.chordMode || state.dynamicMode || state.activeTextId || state.selectedTextIds?.length;
      textToolbar.hidden = !hasTextSelection;
    }
    if (textFontSelect && textFontSelect.value !== state.textStyle.fontFamily) textFontSelect.value = state.textStyle.fontFamily;
    if (textSizeInput && Number(textSizeInput.value) !== Number(state.textStyle.fontSize)) textSizeInput.value = state.textStyle.fontSize;
    if (textColorInput && textColorInput.value !== state.textStyle.color) textColorInput.value = state.textStyle.color;
    if (textEnclosureSelect && textEnclosureSelect.value !== state.textStyle.enclosure) textEnclosureSelect.value = state.textStyle.enclosure || "none";
    if (textAlignSelect && textAlignSelect.value !== state.textStyle.align) textAlignSelect.value = state.textStyle.align || "left";
    const activeGrid = getActiveGridDuration?.();
    if (gridDurationSelect && activeGrid?.id && gridDurationSelect.value !== activeGrid.id) gridDurationSelect.value = activeGrid.id;
    if (itemColorInput && itemColorInput.value !== state.itemColor) itemColorInput.value = state.itemColor;
    if (zoomLabel) zoomLabel.textContent = `${Math.round((state.zoom || 1) * 100)}%`;
    if (hideMeasureButton) {
      const measure = getCurrentMeasure?.();
      const hidden = measureHidden?.(measure);
      hideMeasureButton.textContent = hidden ? "Mostrar compás" : "Ocultar compás";
    }
    updateMidiControls?.();
  }

  window.JMLScoreModeControls = Object.freeze({
    refreshDurationButtons,
    setEditMode,
    setEntryMode,
    setTextualMode,
    updateButtons
  });
})();
