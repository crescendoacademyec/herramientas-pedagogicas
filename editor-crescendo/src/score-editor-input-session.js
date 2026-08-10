(function (root) {
  const PHASES = Object.freeze({
    SELECT: "select",
    NOTE_INPUT: "note-input",
    EDIT: "edit",
    TEXT: "text"
  });

  function normalizedVoice(value) {
    return Number(value) === 2 ? 2 : 1;
  }

  function create(options = {}) {
    return {
      phase: Object.values(PHASES).includes(options.phase) ? options.phase : PHASES.SELECT,
      caret: {
        systemIndex: Math.max(0, Number(options.systemIndex) || 0),
        voiceId: normalizedVoice(options.voiceId),
        measureIndex: Math.max(0, Number(options.measureIndex) || 0),
        tick: Math.max(0, Number(options.tick) || 0),
        pitchStep: Number(options.pitchStep) || 0,
        pitchVisible: options.pitchVisible === true
      },
      input: {
        kind: options.kind === "rest" ? "rest" : "note",
        durationId: options.durationId || "eighth",
        dots: Math.max(0, Number(options.dots) || 0),
        chordMode: options.chordMode === true,
        insertMode: options.insertMode === true,
        lockDuration: options.lockDuration === true,
        forceDuration: options.forceDuration === true,
        pitchBeforeDuration: options.pitchBeforeDuration === true
      },
      anchor: {
        lastEntryId: options.lastEntryId || null,
        lastStaffStep: Number.isFinite(options.lastStaffStep) ? Number(options.lastStaffStep) : null
      }
    };
  }

  function ensure(state) {
    if (!state.inputSession) {
      state.inputSession = create({
        phase: state.cursorActive && !state.selectMode ? PHASES.NOTE_INPUT : PHASES.SELECT,
        systemIndex: state.activeSystemIndex,
        voiceId: state.line2Mode ? 2 : 1,
        measureIndex: state.cursorMeasure,
        tick: state.cursorTick,
        pitchStep: state.cursorStaffStep,
        pitchVisible: state.cursorPitchVisible,
        kind: state.mode,
        durationId: state.activeDuration?.id,
        chordMode: state.noteChordMode,
        insertMode: state.displacementMode,
        lockDuration: state.lockDurationMode,
        forceDuration: state.forceDurationMode,
        pitchBeforeDuration: state.pitchBeforeDurationMode,
        lastEntryId: state.activeNoteEntryId,
        lastStaffStep: state.activeNoteStaffStep
      });
    }
    return state.inputSession;
  }

  function syncFromLegacy(state) {
    const session = ensure(state);
    session.caret.systemIndex = Math.max(0, Number(state.activeSystemIndex) || 0);
    session.caret.voiceId = state.line2Mode ? 2 : 1;
    session.caret.measureIndex = Math.max(0, Number(state.cursorMeasure) || 0);
    session.caret.tick = Math.max(0, Number(state.cursorTick) || 0);
    session.caret.pitchStep = Number(state.cursorStaffStep) || 0;
    session.caret.pitchVisible = state.cursorPitchVisible === true;
    session.input.kind = state.mode === "rest" ? "rest" : "note";
    session.input.durationId = state.activeDuration?.id || session.input.durationId;
    session.input.chordMode = state.noteChordMode === true;
    session.input.insertMode = state.displacementMode === true;
    session.input.lockDuration = state.lockDurationMode === true;
    session.input.forceDuration = state.forceDurationMode === true;
    session.input.pitchBeforeDuration = state.pitchBeforeDurationMode === true;
    session.anchor.lastEntryId = state.activeNoteEntryId || null;
    session.anchor.lastStaffStep = Number.isFinite(state.activeNoteStaffStep)
      ? Number(state.activeNoteStaffStep)
      : null;
    if (state.cursorActive && !state.selectMode) session.phase = PHASES.NOTE_INPUT;
    else if (state.editMode) session.phase = PHASES.EDIT;
    else if (state.textMode || state.chordMode || state.dynamicMode) session.phase = PHASES.TEXT;
    else session.phase = PHASES.SELECT;
    return session;
  }

  function applyPhase(state, phase) {
    const session = ensure(state);
    session.phase = Object.values(PHASES).includes(phase) ? phase : PHASES.SELECT;
    if (session.phase === PHASES.NOTE_INPUT) {
      state.cursorActive = true;
      state.selectMode = false;
      state.editMode = false;
    } else if (session.phase === PHASES.EDIT) {
      state.cursorActive = false;
      state.selectMode = false;
      state.editMode = true;
    } else if (session.phase === PHASES.TEXT) {
      state.cursorActive = false;
      state.selectMode = false;
      state.editMode = false;
    } else {
      state.cursorActive = false;
      state.entryCursorActive = false;
      state.selectMode = true;
      state.editMode = false;
    }
    return session.phase;
  }

  function setCaret(state, caret = {}) {
    const session = ensure(state);
    if (Number.isFinite(caret.systemIndex)) state.activeSystemIndex = Math.max(0, Number(caret.systemIndex));
    if (Number.isFinite(caret.measureIndex)) state.cursorMeasure = Math.max(0, Number(caret.measureIndex));
    if (Number.isFinite(caret.tick)) state.cursorTick = Math.max(0, Number(caret.tick));
    if (Number.isFinite(caret.pitchStep)) state.cursorStaffStep = Number(caret.pitchStep);
    if (Number.isFinite(caret.voiceId)) state.line2Mode = normalizedVoice(caret.voiceId) === 2;
    if (typeof caret.pitchVisible === "boolean") state.cursorPitchVisible = caret.pitchVisible;
    syncFromLegacy(state);
    return session.caret;
  }

  function setModifier(state, key, enabled) {
    const session = ensure(state);
    const normalized = enabled === true;
    if (!(key in session.input)) return false;
    session.input[key] = normalized;
    const legacyKey = {
      chordMode: "noteChordMode",
      insertMode: "displacementMode",
      lockDuration: "lockDurationMode",
      forceDuration: "forceDurationMode",
      pitchBeforeDuration: "pitchBeforeDurationMode"
    }[key];
    if (legacyKey) state[legacyKey] = normalized;
    return true;
  }

  function isNoteInput(state) {
    return ensure(state).phase === PHASES.NOTE_INPUT && state.cursorActive === true;
  }

  const api = Object.freeze({
    PHASES,
    applyPhase,
    create,
    ensure,
    isNoteInput,
    normalizedVoice,
    setCaret,
    setModifier,
    syncFromLegacy
  });

  root.JMLScoreInputSession = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
