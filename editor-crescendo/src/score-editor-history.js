(function () {
  function save(state, snapshot, options = {}) {
    if (!state || typeof snapshot !== "function") return false;
    const maxLength = Number.isFinite(options.maxLength) ? options.maxLength : 80;
    state.history.push(snapshot());
    if (state.history.length > maxLength) state.history.shift();
    state.future = [];
    return true;
  }

  function undo(state, options = {}) {
    if (!state || typeof options.snapshot !== "function" || typeof options.restore !== "function") return false;
    const previous = state.history.pop();
    if (!previous) return false;
    state.future.push(options.snapshot());
    options.restore(previous);
    return true;
  }

  function redo(state, options = {}) {
    if (!state || typeof options.snapshot !== "function" || typeof options.restore !== "function") return false;
    const next = state.future.pop();
    if (!next) return false;
    state.history.push(options.snapshot());
    options.restore(next);
    return true;
  }

  function clear(state) {
    if (!state) return;
    state.history = [];
    state.future = [];
  }

  window.JMLScoreHistory = Object.freeze({
    clear,
    redo,
    save,
    undo
  });
})();
