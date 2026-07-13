(function () {
  function createSystemId() {
    return crypto.randomUUID ? crypto.randomUUID() : `system-${Date.now()}-${Math.random()}`;
  }

  function systemList(state) {
    return Array.isArray(state?.systems) && state.systems.length
      ? state.systems
      : [{ measures: state?.measures || [] }];
  }

  function clampSystemIndex(state, index) {
    const systems = systemList(state);
    return Math.max(0, Math.min(systems.length - 1, Number(index) || 0));
  }

  function ensureSystemState(state, options = {}) {
    const { createId = createSystemId } = options;
    if (!Array.isArray(state.systems) || !state.systems.length) {
      state.systems = [{ id: createId(), kind: "staff", measures: state.measures }];
      state.activeSystemIndex = 0;
      return state.systems;
    }
    const index = clampSystemIndex(state, state.activeSystemIndex);
    state.activeSystemIndex = index;
    if (!state.systems[index]) {
      state.systems[index] = { id: createId(), kind: "staff", measures: state.measures };
    }
    state.systems.forEach((system) => {
      if (!system.kind) system.kind = "staff";
    });
    if (state.measures && state.measures !== state.systems[index].measures) {
      state.systems[index].measures = state.measures;
    }
    return state.systems;
  }

  function systemIsPercussionLine(system) {
    return system?.kind === "percussion-line";
  }

  function staffStepForSystem(staffStep, system) {
    return systemIsPercussionLine(system) ? 0 : staffStep;
  }

  window.JMLScoreSystems = Object.freeze({
    clampSystemIndex,
    createSystemId,
    ensureSystemState,
    staffStepForSystem,
    systemIsPercussionLine,
    systemList
  });
})();
