(function () {
  document.documentElement.dataset.jmlEditorBoot = "start";
  const Geometry = window.ScoreEditorGeometry || {};
  const Perf = window.ScoreEditorPerformance || {
    layoutCache(layout, namespace) {
      const key = `__${namespace}`;
      if (!layout[key]) layout[key] = new Map();
      return layout[key];
    },
    scheduleFrame(_key, callback) {
      return requestAnimationFrame(callback);
    }
  };
  const ModeControls = window.JMLScoreModeControls;
  const Marks = window.JMLScoreMarks;
  const TextItems = window.JMLScoreTextItems;
  const Writing = window.JMLScoreWriting;
  const Timeline = window.JMLScoreTimeline;
  const RhythmicColumns = window.JMLScoreRhythmicColumns;
  const InputSession = window.JMLScoreInputSession;
  const Keymap = window.JMLScoreKeymap;
  const ApplicationMenu = window.JMLScoreApplicationMenu;
  if (!Timeline) throw new Error("No se cargó score-editor-timeline.js");
  if (!RhythmicColumns) throw new Error("No se cargó score-editor-rhythmic-columns.js");
  if (!InputSession) throw new Error("No se cargó score-editor-input-session.js");
  if (!Keymap) throw new Error("No se cargó score-editor-keymap.js");
  if (!ApplicationMenu) throw new Error("No se cargó score-editor-application-menu.js");
  const svg = document.getElementById("score");
  const scoreShell = document.querySelector(".score-shell");
  const systemsCanvas = document.querySelector(".systems-canvas");
  const durationTools = document.getElementById("durationTools");
  const appearancePanel = document.querySelector(".appearance-panel");
  const adminOnlyPanels = [...document.querySelectorAll("[data-admin-only]")];
  const cursorLabel = document.getElementById("cursorLabel");
  const noteModeButton = document.getElementById("noteMode");
  const restModeButton = document.getElementById("restMode");
  const undoButton = document.getElementById("undoButton");
  const redoButton = document.getElementById("redoButton");
  const shiftModeButton = document.getElementById("shiftModeButton");
  const textModeButton = document.getElementById("textModeButton");
  const chordModeButton = document.getElementById("chordModeButton");
  const dynamicsButton = document.getElementById("dynamicsButton");
  const itemColorInput = document.getElementById("itemColorInput");
  const addMeasureButton = document.getElementById("addMeasureButton");
  const removeMeasureButton = document.getElementById("removeMeasureButton");
  const hideMeasureButton = document.getElementById("hideMeasureButton");
  const zoomOutButton = document.getElementById("zoomOutButton");
  const zoomInButton = document.getElementById("zoomInButton");
  const zoomLabel = document.getElementById("zoomLabel");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const playbackButton = document.getElementById("playbackButton");
  const playbackBpmInput = document.getElementById("playbackBpmInput");
  const jazzModeButton = document.getElementById("jazzModeButton");
  const reflowButton = document.getElementById("reflowButton");
  const clearButton = document.getElementById("clearButton");
  const textToolbar = document.getElementById("textToolbar");
  const textFontSelect = document.getElementById("textFontSelect");
  const textSizeInput = document.getElementById("textSizeInput");
  const textColorInput = document.getElementById("textColorInput");
  const textEnclosureSelect = document.getElementById("textEnclosureSelect");
  const textAlignSelect = document.getElementById("textAlignSelect");
  const selectToolButton = document.getElementById("selectToolButton");
  const editModeButton = document.getElementById("editModeButton");
  const figureMenuButton = document.getElementById("figureMenuButton");
  const gridDurationSelect = document.getElementById("gridDurationSelect");
  const midiKeyboardPanel = document.getElementById("midiKeyboardPanel");
  const midiKeyboard = document.getElementById("midiKeyboard");
  const midiFigureStrip = document.getElementById("midiFigureStrip");
  const midiChordButton = document.getElementById("midiChordButton");
  const keySignatureButton = document.getElementById("keySignatureButton");
  const durationDrawer = document.getElementById("durationDrawer");
  const exerciseSelect = document.getElementById("exerciseSelect");
  const loadExerciseButton = document.getElementById("loadExerciseButton");
  const saveExerciseButton = document.getElementById("saveExerciseButton");
  const exportExerciseButton = document.getElementById("exportExerciseButton");
  const exportMusicXmlButton = document.getElementById("exportMusicXmlButton");
  const musicXmlButton = document.getElementById("musicXmlButton");
  const importExerciseInput = document.getElementById("importExerciseInput");
  const exerciseTitleInput = document.getElementById("exerciseTitleInput");
  const exerciseDescriptionInput = document.getElementById("exerciseDescriptionInput");
  const deleteExerciseButton = document.getElementById("deleteExerciseButton");
  const exerciseStatus = document.getElementById("exerciseStatus");
  const captureSceneButton = document.getElementById("captureSceneButton");
  const sceneMenuButton = document.getElementById("sceneMenuButton");
  const saveSceneButton = document.getElementById("saveSceneButton");
  const sceneSelect = document.getElementById("sceneSelect");
  const prevSceneButton = document.getElementById("prevSceneButton");
  const nextSceneButton = document.getElementById("nextSceneButton");
  const loadSceneButton = document.getElementById("loadSceneButton");
  const overwriteSceneButton = document.getElementById("overwriteSceneButton");
  const moveSceneUpButton = document.getElementById("moveSceneUpButton");
  const moveSceneDownButton = document.getElementById("moveSceneDownButton");
  const deleteSceneButton = document.getElementById("deleteSceneButton");
  const reviewModeButton = document.getElementById("reviewModeButton");
  const exerciseModeButton = document.getElementById("exerciseModeButton");
  const openManualButton = document.getElementById("openManualButton");
  const closeManualButton = document.getElementById("closeManualButton");
  const manualOverlay = document.getElementById("manualOverlay");
  const manualBody = document.getElementById("manualBody");
  const manualNav = document.getElementById("manualNav");
  const manualSearchInput = document.getElementById("manualSearchInput");
  const manualSearchStatus = document.getElementById("manualSearchStatus");
  const exerciseAppMenus = [...document.querySelectorAll(".exercise-app-menu")];
  const paletteTriggers = [...document.querySelectorAll(".palette-trigger")];
  const appearanceControls = document.getElementById("appearanceControls");
  const appearanceJson = document.getElementById("appearanceJson");
  const resetAppearanceButton = document.getElementById("resetAppearance");
  const copyAppearanceButton = document.getElementById("copyAppearance");
  const exportAppearanceButton = document.getElementById("exportAppearance");
  const importAppearanceInput = document.getElementById("importAppearance");
  const iconAppearanceSelect = document.getElementById("iconAppearanceSelect");
  const iconAppearanceControls = document.getElementById("iconAppearanceControls");
  const iconAppearanceJson = document.getElementById("iconAppearanceJson");
  const iconAppearanceSearch = document.getElementById("iconAppearanceSearch");
  const iconAppearancePreview = document.getElementById("iconAppearancePreview");
  const midiLabelAppearanceControls = document.getElementById("midiLabelAppearanceControls");
  const resetIconAppearanceButton = document.getElementById("resetIconAppearance");
  const copyIconAppearanceButton = document.getElementById("copyIconAppearance");
  const exportIconAppearanceButton = document.getElementById("exportIconAppearance");
  const coarsePointerQuery = window.matchMedia?.("(pointer: coarse)");
  const hoverlessQuery = window.matchMedia?.("(hover: none)");
  const supportsTouchInput = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const touchState = {
    active: false,
    longPressTimer: null,
    pointerId: null,
    startX: 0,
    startY: 0,
    target: null,
    suppressClickUntil: 0,
    pinch: null
  };

  const NS = "http://www.w3.org/2000/svg";
  const KeySignatures = window.JMLScoreKeySignatures;
  if (!KeySignatures) throw new Error("No se cargó score-editor-key-signatures.js");
  const AnchoredText = window.JMLScoreAnchoredText;
  if (!AnchoredText) throw new Error("No se cargó score-editor-anchored-text.js");
  const Meter = window.JMLScoreMeter;
  if (!Meter) throw new Error("No se cargó score-editor-meter.js");
  const Rhythm = window.JMLScoreRhythm;
  if (!Rhythm) throw new Error("No se cargó score-editor-rhythm.js");
  const Durations = window.JMLScoreDurations;
  if (!Durations) throw new Error("No se cargó score-editor-durations.js");
  const MidiRecognition = window.JMLMidiRecognition;
  if (!MidiRecognition) throw new Error("No se cargó score-editor-midi-recognition.js");
  const MidiChords = window.JMLScoreMidiChords;
  if (!MidiChords) throw new Error("No se cargó score-editor-midi-chords.js");
  const MidiCapture = window.JMLMidiCapture;
  if (!MidiCapture) throw new Error("No se cargó score-editor-midi-capture.js");
  const MidiKeyboard = window.JMLScoreMidiKeyboard;
  if (!MidiKeyboard) throw new Error("No se cargó score-editor-midi-keyboard.js");
  const MidiPlayback = window.JMLScoreMidiPlayback;
  if (!MidiPlayback) throw new Error("No se cargó score-editor-midi-playback.js");
  const MusicXml = window.JMLScoreMusicXml;
  if (!MusicXml) throw new Error("No se cargó score-editor-musicxml-export.js");
  const Engraving = window.JMLScoreEngraving;
  if (!Engraving) throw new Error("No se cargó score-editor-engraving.js");
  const midiRecognitionEngine = MidiRecognition.createEngine();
  const DEFAULT_METER = Meter.DEFAULT_METER;
  const DEFAULT_MEASURE_TICKS = Meter.DEFAULT_MEASURE_TICKS;
  const DEFAULT_PULSE_TICKS = Meter.DEFAULT_PULSE_TICKS;
  const EPSILON = 0.0001;
  const MIN_DURATION_TICKS = 0.125;
  const STAFF_GAP = 12;
  const STAFF_CENTER_Y = 142;
  const STAFF_LEFT = 84;
  const SYSTEM_GAP_Y = 138;
  const MEASURE_MIN_WIDTH = 176;
  const MEASURE_LEFT_INSET = 0;
  const MEASURE_RIGHT_INSET = 0;
  const MIN_TICK_SPACING = 6;
  const EIGHTH_TICK_SPACING = 8;
  const SIXTEENTH_TICK_SPACING = 10;
  const STEP_HEIGHT = STAFF_GAP / 2;
  const SMUFL_SPACE = STAFF_GAP;
  const MUSIC_FONT_SIZE = SMUFL_SPACE * 4;
  const SmuflData = window.JMLScoreSmuflData;
  if (!SmuflData) throw new Error("No se cargó score-editor-smufl-data.js");
  const Smufl = window.JMLScoreSmufl;
  if (!Smufl) throw new Error("No se cargó score-editor-smufl.js");
  const Svg = window.JMLScoreSvg;
  if (!Svg) throw new Error("No se cargó score-editor-svg.js");
  const BasicRender = window.JMLScoreBasicRender;
  if (!BasicRender) throw new Error("No se cargó score-editor-basic-render.js");
  const EntryRender = window.JMLScoreEntryRender;
  if (!EntryRender) throw new Error("No se cargó score-editor-entry-render.js");
  const MarkRender = window.JMLScoreMarkRender;
  if (!MarkRender) throw new Error("No se cargó score-editor-mark-render.js");
  const GlyphRender = window.JMLScoreGlyphRender;
  if (!GlyphRender) throw new Error("No se cargó score-editor-glyph-render.js");
  const ItemStyle = window.JMLScoreItemStyle;
  if (!ItemStyle) throw new Error("No se cargó score-editor-item-style.js");
  const Storage = window.JMLScoreStorage;
  if (!Storage) throw new Error("No se cargó score-editor-storage.js");
  const UiOptions = window.JMLScoreUiOptions;
  if (!UiOptions) throw new Error("No se cargó score-editor-ui-options.js");
  const Clefs = window.JMLScoreClefs;
  if (!Clefs) throw new Error("No se cargó score-editor-clefs.js");
  const Palettes = window.JMLScorePalettes;
  if (!Palettes) throw new Error("No se cargó score-editor-palettes.js");
  const Appearance = window.JMLScoreAppearance;
  if (!Appearance) throw new Error("No se cargó score-editor-appearance.js");
  const AdminControls = window.JMLScoreAdminControls;
  if (!AdminControls) throw new Error("No se cargó score-editor-admin-controls.js");
  const Exercises = window.JMLScoreExercises;
  if (!Exercises) throw new Error("No se cargó score-editor-exercises.js");
  const Voices = window.JMLScoreVoices;
  if (!Voices) throw new Error("No se cargó score-editor-voices.js");
  const ScoreModel = window.JMLScoreModel;
  if (!ScoreModel) throw new Error("No se cargó score-editor-score-model.js");
  const Systems = window.JMLScoreSystems;
  if (!Systems) throw new Error("No se cargó score-editor-systems.js");
  const MeasureAnchors = window.JMLScoreMeasureAnchors;
  if (!MeasureAnchors) throw new Error("No se cargó score-editor-measure-anchors.js");
  const Measures = window.JMLScoreMeasures;
  if (!Measures) throw new Error("No se cargó score-editor-measures.js");
  const Touch = window.JMLScoreTouch;
  if (!Touch) throw new Error("No se cargó score-editor-touch.js");
  const History = window.JMLScoreHistory;
  if (!History) throw new Error("No se cargó score-editor-history.js");
  const Tooltips = window.JMLScoreTooltips;
  if (!Tooltips) throw new Error("No se cargó score-editor-tooltips.js");
  const Popups = window.JMLScorePopups;
  if (!Popups) throw new Error("No se cargó score-editor-popups.js");
  const Selection = window.JMLScoreSelection;
  if (!Selection) throw new Error("No se cargó score-editor-selection.js");
  const ContextMenu = window.JMLScoreContextMenu;
  if (!ContextMenu) throw new Error("No se cargó score-editor-context-menu.js");
  const IconHtml = window.JMLScoreIconHtml;
  if (!IconHtml) throw new Error("No se cargó score-editor-icon-html.js");
  const MenuRenderer = window.JMLScoreMenuRenderer;
  if (!MenuRenderer) throw new Error("No se cargó score-editor-menu-renderer.js");
  const AutoVoicing = window.JMLScoreAutoVoicing;
  if (!AutoVoicing) throw new Error("No se cargó score-editor-auto-voicing.js");
  const Progress = window.JMLScoreProgress;
  if (!Progress) throw new Error("No se cargó score-editor-progress.js");
  const ExerciseLibrary = window.JMLScoreExerciseLibrary;
  if (!ExerciseLibrary) throw new Error("No se cargó score-editor-exercise-library.js");
  const Viewport = window.JMLScoreViewport;
  if (!Viewport) throw new Error("No se cargó score-editor-viewport.js");
  const {
    SMUFL_DEFAULTS
  } = SmuflData;
  const STAFF_LINE_TOP_STEP = 4;
  const STAFF_LINE_BOTTOM_STEP = -4;
  const STAFF_HEIGHT = (STAFF_LINE_TOP_STEP - STAFF_LINE_BOTTOM_STEP) * STEP_HEIGHT;
  const NOTE_HEAD_HEIGHT = glyphHeight("noteheadBlack");
  const NOTE_HEAD_WIDTH = glyphWidth("noteheadBlack");
  const MIN_EDGE_GAP = 8;
  const EDGE_GAP_PROGRESSION = 1.9;
  const DOT_VISUAL_WIDTH = glyphWidth("augmentationDot");
  const NOTE_HEAD_RX = NOTE_HEAD_WIDTH / 2;
  const NOTE_HEAD_RY = NOTE_HEAD_HEIGHT / 2;
  const STEM_OCTAVE_STEPS = 7;
  const HIT_PADDING = 52;
  const HIT_HEIGHT = 164;
  const HIDDEN_MEASURE_WIDTH = 172;
  const REST_VISUAL_WIDTHS = {
    breve: glyphWidth("restDoubleWhole"),
    "sixty-fourth": glyphWidth("rest64th"),
    "one-twenty-eighth": glyphWidth("rest128th"),
    "thirty-second": glyphWidth("rest32nd"),
    sixteenth: glyphWidth("rest16th"),
    eighth: glyphWidth("rest8th"),
    quarter: glyphWidth("restQuarter"),
    half: glyphWidth("restHalf"),
    whole: glyphWidth("restWhole")
  };
  const APPEARANCE_STORAGE_KEY = "jml-score-appearance-v1";
  const APPEARANCE_ADMIN_STORAGE_KEY = "jml-score-appearance-admin";
  const ICON_APPEARANCE_STORAGE_KEY = "jml-score-icon-appearance-v3";
  const EXERCISE_LIBRARY_STORAGE_KEY = "jml-score-exercise-library-v1";
  const CANVAS_AUTOSAVE_STORAGE_KEY = "jml-score-canvas-autosave-v1";
  const EXERCISE_FORMAT = "jml-score-exercise";
  const EXERCISE_FORMAT_VERSION = 1;
  const AppearanceDefaults = window.JMLScoreAppearanceDefaults;
  if (!AppearanceDefaults) throw new Error("No se cargó score-editor-appearance-defaults.js");
  const {
    FACTORY_ICON_APPEARANCE,
    FACTORY_APPEARANCE,
    FACTORY_ICON_APPEARANCE_OVERRIDES
  } = AppearanceDefaults;
  let appearance = loadAppearance();
  let iconAppearance = loadIconAppearance();
  let selectedIconId = "";
  let iconAppearanceSearchText = "";
  let contextMenuEl = null;

  function storageGet(key) {
    return Storage.getItem(key);
  }

  function storageSet(key, value) {
    Storage.setItem(key, value);
  }

  const ACCIDENTAL_SYMBOLS = {
    "double-flat": smufl("accidentalDoubleFlat"),
    flat: smufl("accidentalFlat"),
    natural: smufl("accidentalNatural"),
    sharp: smufl("accidentalSharp"),
    "double-sharp": smufl("accidentalDoubleSharp")
  };
  const MUSIC_GLYPHS = {
    gClef: smufl("gClef"),
    noteheadWhole: smufl("noteheadWhole"),
    noteheadHalf: smufl("noteheadHalf"),
    noteheadBlack: smufl("noteheadBlack"),
    stem: smufl("stem"),
    augmentationDot: smufl("augmentationDot"),
    restDoubleWhole: smufl("restDoubleWhole"),
    restWhole: smufl("restWhole"),
    restHalf: smufl("restHalf"),
    restQuarter: smufl("restQuarter"),
    restEighth: smufl("rest8th"),
    restSixteenth: smufl("rest16th"),
    restThirtySecond: smufl("rest32nd"),
    restSixtyFourth: smufl("rest64th"),
    restOneTwentyEighth: smufl("rest128th"),
    flagUp: ["", smufl("flag8thUp"), smufl("flag16thUp"), smufl("flag32ndUp"), smufl("flag64thUp"), smufl("flag128thUp")],
    flagDown: ["", smufl("flag8thDown"), smufl("flag16thDown"), smufl("flag32ndDown"), smufl("flag64thDown"), smufl("flag128thDown")]
  };
  const FONT_OPTIONS = UiOptions.FONT_OPTIONS;
  const COLOR_SWATCHES = UiOptions.COLOR_SWATCHES;
  const TEXT_FONT_FALLBACK = UiOptions.TEXT_FONT_FALLBACK;
  const MUSIC_FONT_FALLBACK = UiOptions.MUSIC_FONT_FALLBACK;
  const ICON_TEXT_FONT_FALLBACK = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  const DEFAULT_GRID_DURATION_ID = Durations.DEFAULT_GRID_DURATION_ID;
  const DEFAULT_PLAYBACK_BPM = 140;
  const DEFAULT_JAZZ_SWING_PRESET = "hard";
  const JAZZ_SWING_PRESETS = Object.freeze({
    straight: { label: "Straight", split: 0.5 },
    light: { label: "Light swing", split: 0.6 },
    medium: { label: "Medium swing", split: 2 / 3 },
    hard: { label: "Hard swing", split: 0.72 }
  });
  const COMPLETE_DURATION_SYMBOLS = Durations.COMPLETE_DURATION_SYMBOLS;
  const durations = Durations.DURATIONS;

  const paletteData = Palettes.createPalettes({
    durations,
    completeDurationSymbols: COMPLETE_DURATION_SYMBOLS,
    smufl
  });
  const restPalette = paletteData.restPalette;
  const dotPalette = paletteData.dotPalette;
  const figurePalette = paletteData.figurePalette;
  const palettes = paletteData.palettes;
  const ARTICULATION_GLYPHS = Palettes.ARTICULATION_GLYPHS;

  function paletteIdForGlyphName(glyphName) {
    return Palettes.paletteIdForGlyphName(glyphName);
  }

  function showGlyphInArticulationMenu(glyphName) {
    return Palettes.showGlyphInArticulationMenu(glyphName);
  }

  function articulationPaletteItems() {
    return Palettes.articulationPaletteItems(smufl);
  }

  function tupletIconLayers(number, noteSymbol) {
    return Palettes.tupletIconLayers(number, noteSymbol);
  }

  let activeMeter = { ...DEFAULT_METER };

  function denominatorTicks(denominator) {
    return Meter.denominatorTicks(denominator);
  }

  function normalizeMeter(meter = DEFAULT_METER) {
    return Meter.normalize(meter);
  }

  function activeMeterProfile() {
    return normalizeMeter(activeMeter);
  }

  function measureTicks() {
    return Meter.measureTicks(activeMeterProfile());
  }

  function pulseTicks() {
    return Meter.pulseTicks(activeMeterProfile());
  }

  function subdivisionTicks() {
    return Meter.subdivisionTicks(activeMeterProfile());
  }

  function meterPulseBoundaries(profile = activeMeterProfile()) {
    return Meter.pulseBoundaries(profile);
  }

  function positiveModulo(value, size) {
    return Meter.positiveModulo(value, size);
  }

  function measureTickAt(absoluteTick, profile = activeMeterProfile()) {
    return Meter.measureTickAt(absoluteTick, profile);
  }

  function pulseStartOffsets(profile = activeMeterProfile()) {
    return Meter.pulseStartOffsets(profile);
  }

  function pulseIndexForTick(tick, profile = activeMeterProfile()) {
    return Meter.pulseIndexForTick(tick, profile);
  }

  function pulseRangeForTick(tick, profile = activeMeterProfile()) {
    return Meter.pulseRangeForTick(tick, profile);
  }

  function isPulseBoundaryTick(absoluteTick, profile = activeMeterProfile()) {
    return Meter.isPulseBoundaryTick(absoluteTick, profile);
  }

  function pulseSpanBeforeBoundary(absoluteTick, profile = activeMeterProfile()) {
    return Meter.pulseSpanBeforeBoundary(absoluteTick, profile);
  }

  function meterStrongBeatOffsets(profile = activeMeterProfile()) {
    return Meter.strongBeatOffsets(profile);
  }

  function tickMatchesAnyOffset(tick, offsets) {
    return Meter.tickMatchesAnyOffset(tick, offsets);
  }

  function meterBoundaryCandidates(startTick, endTick, profile = activeMeterProfile()) {
    return Meter.boundaryCandidates(startTick, endTick, profile);
  }

  function meterForMeasureIndex(measureIndex) {
    const measure = (Array.isArray(state?.systems) && state.systems[0]?.measures?.[measureIndex]) ||
      state.measures[measureIndex];
    return normalizeMeter(measure?.meter || state.meter || DEFAULT_METER);
  }

  function keySignatureForMeasureIndex(measureIndex) {
    const measures = (Array.isArray(state?.systems) && state.systems[0]?.measures) || state.measures || [];
    const safeIndex = Math.max(0, Number(measureIndex) || 0);
    for (let index = Math.min(safeIndex, measures.length - 1); index >= 1; index -= 1) {
      if (measures[index]?.keySignature) return measures[index].keySignature;
    }
    return state.keySignature || null;
  }

  function measureTicksForIndex(measureIndex) {
    return Meter.measureTicks(meterForMeasureIndex(measureIndex));
  }

  function syncActiveMeterToCursor() {
    activeMeter = { ...meterForMeasureIndex(state.cursorMeasure || 0) };
  }

  function meterChangeSpacingBeforeMeasure(measureIndex) {
    const measure = (Array.isArray(state?.systems) && state.systems[0]?.measures?.[measureIndex]) ||
      state.measures[measureIndex];
    if (measureIndex <= 0 || !measure) return 0;
    const keyWidth = measure.keySignature ? estimatedKeySignatureWidth(measure.keySignature) : 0;
    const keyGap = keyWidth > 0 ? appearanceValue("keySignatureTimeGap") : 0;
    const meterWidth = measure.meter ? estimatedTimeSignatureWidth(measure.meter) + 26 : 0;
    return keyWidth + keyGap + meterWidth;
  }

  function keySignatureSpacingBeforeTime(measureIndex) {
    const measure = (Array.isArray(state?.systems) && state.systems[0]?.measures?.[measureIndex]) ||
      state.measures[measureIndex];
    if (measureIndex <= 0 || !measure?.keySignature) return 0;
    const keyWidth = estimatedKeySignatureWidth(measure.keySignature);
    return keyWidth > 0 ? keyWidth + appearanceValue("keySignatureTimeGap") : 0;
  }

  const DEFAULT_CLEF_ID = Clefs.DEFAULT_CLEF_ID;
  const CLEF_PROFILES = Clefs.CLEF_PROFILES;

  function clefProfile(clefId = DEFAULT_CLEF_ID) {
    return Clefs.clefProfile(clefId);
  }

  function staffStepForDiatonicStep(diatonicStep, clefId = DEFAULT_CLEF_ID) {
    return Clefs.staffStepForDiatonicStep(diatonicStep, clefId);
  }

  function diatonicStepForStaffStep(staffStep, clefId = DEFAULT_CLEF_ID) {
    return Clefs.diatonicStepForStaffStep(staffStep, clefId);
  }

  const pitchMap = Clefs.PITCH_MAP;

  function createDefaultSystems(measureCount = 8) {
    const trebleMeasures = createInitialMeasures(measureCount);
    const bassMeasures = createInitialMeasures(measureCount);
    return [
      { id: createSystemId(), kind: "staff", initialClefId: "clef-g", measures: trebleMeasures },
      { id: createSystemId(), kind: "staff", initialClefId: "clef-f", measures: bassMeasures }
    ];
  }

  const initialSystems = createDefaultSystems();

  const state = {
    activeDuration: durations.find((duration) => duration.id === DEFAULT_GRID_DURATION_ID) || durations[3],
    gridDurationId: DEFAULT_GRID_DURATION_ID,
    mode: "note",
    cursorMeasure: 0,
    cursorTick: 0,
    cursorStaffStep: 0,
    selectMode: false,
    cursorEntryId: null,
    selectedEntryIds: [],
    selectedNoteRefs: [],
    selectedMeasureIndex: null,
    dragSelection: null,
    entryCursorActive: false,
    activeNoteEntryId: null,
    activeNoteStaffStep: null,
    pendingTieEntryId: null,
    cursorPitchVisible: false,
    cursorPitchAnchorEntryId: null,
    cursorActive: false,
    displacementMode: false,
    line2Mode: false,
    noteChordMode: false,
    lockDurationMode: false,
    forceDurationMode: false,
    pitchBeforeDurationMode: false,
    pendingInputPitch: null,
    pendingMidiNotes: [],
    activeTuplet: null,
    activeTupletRun: null,
    pendingTupletRatio: null,
    meter: { ...DEFAULT_METER },
    keySignature: null,
    textMode: false,
    chordMode: false,
    dynamicMode: false,
    editMode: false,
    midiChordMode: false,
    midiAutoChordMode: false,
    midiCaptureStatus: "",
    midiPlayback: {
      active: false,
      access: null,
      output: null,
      stopTimer: null,
      scheduledNotes: [],
      scheduledTimers: [],
      suppressInputUntil: 0,
      animationFrame: null,
      startAt: 0,
      startOffsetMs: 0,
      tempoEvents: [],
      durationMs: 0
    },
    autoDropConfig: {
      lowerLimitMidi: 62,
      upperLimitMidi: 74,
      midPrimaryTool: "drop-2",
      midFallbackTool: "drop-3",
      highPrimaryTool: "drop-2-4",
      highFallbackTool: "drop-3"
    },
    autoSkipConfig: {
      lowLimitMidi: 57,
      upperNoSkipMidi: 67,
      midPrimaryTool: "skip-2",
      midFallbackTool: "skip-3",
      lowPrimaryTool: "skip-2-4",
      lowFallbackTool: "skip-3"
    },
    activeTextId: null,
    selectedTextIds: [],
    selectedMarkIds: [],
    activeSystemIndex: 0,
    zoom: 1,
    compactLayout: false,
    playbackBpm: DEFAULT_PLAYBACK_BPM,
    jazzMode: false,
    jazzSwingPreset: DEFAULT_JAZZ_SWING_PRESET,
    jazzSwingCache: new Map(),
    jazzSwingRevision: 0,
    measureWidthOverrides: [],
    systems: initialSystems,
    textStyle: {
      font: "Ink Free",
      size: 24,
      color: "#15120f",
      enclosure: "none",
      align: "left"
    },
    measures: initialSystems[0].measures,
    marks: [],
    textItems: [],
    clipboardUnits: [],
    clipboardItems: [],
    clipboardFreeOrigin: null,
    history: [],
    future: []
  };
  InputSession.ensure(state);

  function createMeasure(meter = null) {
    const ticks = meter ? Meter.measureTicks(normalizeMeter(meter)) : measureTicks();
    return ScoreModel.createMeasure({ meter, ticks, durations });
  }

  function createInitialMeasures(count = 8) {
    return ScoreModel.createInitialMeasures({ count, createMeasure });
  }

  let renderSystemIndex = 0;
  let suppressSystemSync = false;
  let lastRenderedLayout = null;
  let cachedScoreLayout = null;
  let restFontAlignmentQueued = false;
  let renderInProgress = false;
  let renderQueued = false;
  let renderFrameQueued = false;
  let reflowInProgress = false;
  let normalizedScoreModelSignature = "";
  let scoreModelDirty = true;
  let scoreModelPreparationCount = 0;
  let layoutCacheKeyComputationCount = 0;
  const rhythmicColumnIndex = RhythmicColumns.createIndex();

  function invalidateLayoutCache() {
    cachedScoreLayout = null;
    rhythmicColumnIndex.clear();
  }

  function requestRender() {
    if (renderInProgress) {
      renderQueued = true;
      return;
    }
    if (renderFrameQueued) return;
    renderFrameQueued = true;
    Perf.scheduleFrame("scoreRender", () => {
      renderFrameQueued = false;
      render();
    });
  }

  function createSystemId() {
    return Systems.createSystemId();
  }

  function clampSystemIndex(index) {
    return Systems.clampSystemIndex(state, index);
  }

  function activeSystemIndex() {
    return clampSystemIndex(state.activeSystemIndex);
  }

  function contextSystemIndex() {
    return suppressSystemSync ? renderSystemIndex : activeSystemIndex();
  }

  function syncActiveSystemMeasures() {
    Systems.ensureSystemState(state, { createId: createSystemId });
    normalizeSystemDefaults();
  }

  function scoreSystems() {
    if (!suppressSystemSync) syncActiveSystemMeasures();
    return state.systems;
  }

  function systemCount() {
    return scoreSystems().length;
  }

  function systemGapY() {
    return SYSTEM_GAP_Y;
  }

  function systemOffsetY(index = renderSystemIndex) {
    return Math.max(0, Number(index) || 0) * systemGapY();
  }

  function createMeasureForSystemIndex(measureIndex) {
    const reference = scoreSystems()[0]?.measures?.[measureIndex];
    const measure = createMeasure(reference?.meter || null);
    if (reference?.keySignature) measure.keySignature = { ...reference.keySignature };
    if (reference?.hidden) measure.hidden = true;
    return measure;
  }

  function createStaffSystem(kind = "staff", options = {}) {
    const referenceMeasures = options.referenceMeasures || scoreSystems()[0]?.measures || state.measures || [];
    const measures = referenceMeasures.map((reference) => {
      const measure = createMeasure(reference?.meter || null);
      if (reference?.keySignature) measure.keySignature = { ...reference.keySignature };
      if (reference?.hidden) measure.hidden = true;
      return measure;
    });
    return {
      id: createSystemId(),
      kind,
      initialClefId: options.initialClefId || (kind === "percussion-line" ? "clef-percussion" : DEFAULT_CLEF_ID),
      measures
    };
  }

  function defaultInitialClefForSystem(system, index = 0) {
    if (systemIsPercussionLine(system)) return "clef-percussion";
    return index === 1 ? "clef-f" : "clef-g";
  }

  function normalizeSystemDefaults() {
    if (!Array.isArray(state.systems)) return;
    state.systems.forEach((system, index) => {
      if (!system.kind) system.kind = "staff";
      if (!clefProfile(system.initialClefId)) {
        system.initialClefId = defaultInitialClefForSystem(system, index);
      }
    });
  }

  function ensureAllSystemsMeasure(index) {
    scoreSystems().forEach((system) => {
      if (!Array.isArray(system.measures)) system.measures = [];
      while (system.measures.length <= index) {
        system.measures.push(createMeasureForSystemIndex(system.measures.length));
      }
    });
  }

  function withSystemContext(index, callback) {
    const systems = scoreSystems();
    const safeIndex = Math.max(0, Math.min(systems.length - 1, Number(index) || 0));
    const previousMeasures = state.measures;
    const previousRenderSystemIndex = renderSystemIndex;
    const previousSuppressSystemSync = suppressSystemSync;
    suppressSystemSync = true;
    renderSystemIndex = safeIndex;
    state.measures = systems[safeIndex].measures;
    try {
      return callback(systems[safeIndex], safeIndex);
    } finally {
      state.measures = previousMeasures;
      renderSystemIndex = previousRenderSystemIndex;
      suppressSystemSync = previousSuppressSystemSync;
    }
  }

  function setActiveSystemIndex(index) {
    syncActiveSystemMeasures();
    const safeIndex = clampSystemIndex(index);
    state.activeSystemIndex = safeIndex;
    state.measures = state.systems[safeIndex].measures;
    if (activeSystemIsPercussionLine()) state.cursorStaffStep = 0;
    syncActiveMeterToCursor();
  }

  function activeSystem() {
    return scoreSystems()[activeSystemIndex()] || null;
  }

  function systemIsPercussionLine(system = activeSystem()) {
    return Systems.systemIsPercussionLine(system);
  }

  function activeSystemIsPercussionLine() {
    return systemIsPercussionLine(activeSystem());
  }

  function staffStepForSystem(staffStep, system = activeSystem()) {
    return Systems.staffStepForSystem(staffStep, system);
  }

  function addSystem(kind = "staff") {
    closePaletteDrawer();
    syncActiveSystemMeasures();
    saveHistory();
    const insertIndex = activeSystemIndex() + 1;
    state.systems.splice(insertIndex, 0, createStaffSystem(kind, {
      initialClefId: kind === "percussion-line" ? "clef-percussion" : DEFAULT_CLEF_ID
    }));
    setActiveSystemIndex(insertIndex);
    clearEntrySelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = true;
    render();
  }

  function addStaffSystem() {
    addSystem("staff");
  }

  function addPercussionLineSystem() {
    addSystem("percussion-line");
  }

  function removeActiveSystem() {
    syncActiveSystemMeasures();
    if (state.systems.length <= 1) {
      showEditorMessage("No se puede quitar el único sistema.");
      return false;
    }
    saveHistory();
    const removeIndex = activeSystemIndex();
    state.systems.splice(removeIndex, 1);
    state.marks = (state.marks || [])
      .filter((mark) => !(markIsSystemLocal(mark) && (Number(mark.systemIndex) || 0) === removeIndex))
      .map((mark) => {
        if (Number.isFinite(Number(mark.systemIndex)) && Number(mark.systemIndex) > removeIndex) {
          return { ...mark, systemIndex: Number(mark.systemIndex) - 1 };
        }
        return mark;
      });
    state.textItems = (state.textItems || [])
      .filter((item) => !(Number(item.systemIndex) === removeIndex))
      .map((item) => (
        Number.isFinite(Number(item.systemIndex)) && Number(item.systemIndex) > removeIndex
          ? { ...item, systemIndex: Number(item.systemIndex) - 1 }
          : item
      ));
    setActiveSystemIndex(Math.min(removeIndex, state.systems.length - 1));
    clearEntrySelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    hideCursorPitch();
    render();
    return true;
  }

  function contextSystem() {
    return scoreSystems()[contextSystemIndex()] || null;
  }

  function contextSystemIsPercussionLine() {
    return systemIsPercussionLine(contextSystem());
  }

  function normalizePercussionEntry(entry) {
    ScoreModel.normalizePercussionEntry(entry);
  }

  function makeMeasureRest(ticks = measureTicks()) {
    return ScoreModel.makeMeasureRest({ ticks, durations });
  }

  function el(name, attrs = {}, children = []) {
    return Svg.el(name, attrs, children);
  }

  function htmlEl(name, attrs = {}, children = []) {
    return Svg.htmlEl(name, attrs, children);
  }

  function overlayHost() {
    return document.fullscreenElement || document.body;
  }

  function isTouchOptimizedInput(event = null) {
    return Touch.isTouchOptimizedInput({
      supportsTouchInput,
      coarsePointerMatches: coarsePointerQuery?.matches === true,
      hoverlessMatches: hoverlessQuery?.matches === true,
      pointerType: event?.pointerType || ""
    });
  }

  function syncTouchModeClass() {
    document.documentElement.classList.toggle("touch-optimized", isTouchOptimizedInput());
  }

  function selectedItemCountForTouch() {
    return Touch.selectedItemCount({
      entries: selectedEntryLocations().length,
      notes: selectedNoteLocations().length,
      marks: selectedMarks().length,
      textItems: selectedTextItems().length,
      hasMeasureSelection: Number.isFinite(state.selectedMeasureIndex)
    });
  }

  function updateTouchToolbar() {
    // The floating touch toolbar was removed; keep this hook so existing render
    // refresh paths can remain stable while touch gestures continue to work.
  }

  function textNode(x, y, text, attrs = {}) {
    return Svg.textNode(x, y, text, attrs);
  }

  function smufl(name) {
    return Smufl.smufl(SmuflData, name);
  }

  function glyphBBox(name) {
    return Smufl.glyphBBox(SmuflData, name);
  }

  function glyphWidth(name) {
    return Smufl.glyphWidth(SmuflData, name, SMUFL_SPACE);
  }

  function glyphHeight(name) {
    return Smufl.glyphHeight(SmuflData, name, SMUFL_SPACE);
  }

  function glyphCenter(name) {
    return Smufl.glyphCenter(SmuflData, name);
  }

  function glyphTextCentered(name, x, y, attrs = {}) {
    return GlyphRender.textCentered(name, x, y, attrs, {
      smuflSpace: SMUFL_SPACE,
      defaultFontSize: musicGlyphSize()
    });
  }

  function glyphTextAtAnchor(name, anchorName, x, y, attrs = {}) {
    return GlyphRender.textAtAnchor(name, anchorName, x, y, attrs, {
      smuflSpace: SMUFL_SPACE,
      defaultFontSize: musicGlyphSize()
    });
  }

  function loadAppearance() {
    return Appearance.loadAppearance({
      storageGet,
      storageKey: APPEARANCE_STORAGE_KEY,
      factory: FACTORY_APPEARANCE
    });
  }

  function saveAppearance() {
    Appearance.saveAppearance({
      storageSet,
      storageKey: APPEARANCE_STORAGE_KEY,
      appearance
    });
  }

  function loadIconAppearance() {
    const loaded = Appearance.loadIconAppearance({
      storageGet,
      storageKey: ICON_APPEARANCE_STORAGE_KEY
    });
    const { appearance: sanitized, changed } = sanitizeIconAppearance(loaded);
    if (changed) {
      Appearance.saveIconAppearance({
        storageSet,
        storageKey: ICON_APPEARANCE_STORAGE_KEY,
        iconAppearance: sanitized
      });
    }
    return sanitized;
  }

  function saveIconAppearance() {
    Appearance.saveIconAppearance({
      storageSet,
      storageKey: ICON_APPEARANCE_STORAGE_KEY,
      iconAppearance
    });
  }

  function sanitizeIconAppearance(loaded = {}) {
    const current = loaded && typeof loaded === "object" ? loaded : {};
    const appearance = Object.fromEntries(Object.entries(current).flatMap(([iconId, config]) => {
      const tooltip = String(config?.tooltip || "").trim();
      return tooltip ? [[iconId, { tooltip }]] : [];
    }));
    return {
      appearance,
      changed: JSON.stringify(appearance) !== JSON.stringify(current)
    };
  }

  function populateFontSelect(select, selectedValue = "Ink Free") {
    if (!select) return;
    const value = knownFont(selectedValue, "Ink Free");
    select.innerHTML = FONT_OPTIONS.map((option) => (
      `<option value="${escapeHtml(option.value)}"${option.value === value ? " selected" : ""}>${escapeHtml(option.label)}</option>`
    )).join("");
  }

  function readAppearanceAdminMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("admin")) {
      const rawValue = String(params.get("admin") || "").toLowerCase();
      const enabled = ["1", "true", "si", "sí", "yes", "on"].includes(rawValue);
      storageSet(APPEARANCE_ADMIN_STORAGE_KEY, enabled ? "true" : "false");
      return enabled;
    }
    return false;
  }

  function setupAppearanceAdminMode() {
    const enabled = readAppearanceAdminMode();
    applyAppearanceAdminMode(enabled);
    return enabled;
  }

  function applyAppearanceAdminMode(enabled) {
    document.documentElement.classList.toggle("appearance-admin-enabled", enabled);
    adminOnlyPanels.forEach((panel) => {
      panel.hidden = !enabled;
      panel.dataset.adminEnabled = enabled ? "true" : "false";
    });
  }

  function appearanceAdminIsVisible() {
    return document.documentElement.classList.contains("appearance-admin-enabled") &&
      adminOnlyPanels.some((panel) => !panel.hidden);
  }

  function setAppearanceAdminMode(enabled) {
    storageSet(APPEARANCE_ADMIN_STORAGE_KEY, enabled ? "true" : "false");
    appearanceAdminMode = enabled;
    applyAppearanceAdminMode(enabled);
    if (enabled) {
      renderAppearanceControls({ force: true });
      renderIconAppearancePanel({ force: true });
      renderMidiLabelAppearancePanel({ force: true });
    }
  }

  function toggleAppearanceAdminMode() {
    setAppearanceAdminMode(!appearanceAdminMode);
  }

  function appearanceValue(key) {
    const value = Number(appearance[key]);
    return Number.isFinite(value) ? value : FACTORY_APPEARANCE[key];
  }

  function appearanceString(key, fallback = "") {
    const value = appearance[key];
    if (value === undefined || value === null || value === "") return FACTORY_APPEARANCE[key] || fallback;
    return String(value);
  }

  function knownFont(value, fallback = "Ink Free") {
    return Appearance.knownFont(value, fallback, FONT_OPTIONS);
  }

  function appearanceFont(key, fallback = "Ink Free") {
    return Appearance.appearanceFont({
      appearance,
      factory: FACTORY_APPEARANCE,
      key,
      fallback,
      fontOptions: FONT_OPTIONS
    });
  }

  function fontCss(font, fallback = TEXT_FONT_FALLBACK) {
    return Appearance.fontCss(font, fallback, FONT_OPTIONS);
  }

  function textFontStyle(key = "scoreTextFont") {
    return `font-family:${fontCss(appearanceFont(key, "Ink Free"))};`;
  }

  function musicFontStyle(key = "musicGlyphFont") {
    return `font-family:${fontCss(appearanceFont(key, "MTF Improviso Light"), MUSIC_FONT_FALLBACK)};`;
  }

  function applyAppearanceFontVariables() {
    const root = document.documentElement;
    root.style.setProperty("--jml-score-text-font", fontCss(appearanceFont("scoreTextFont", "Ink Free")));
    root.style.setProperty("--jml-canvas-text-font", fontCss(appearanceFont("canvasTextFont", "Ink Free")));
    root.style.setProperty("--jml-music-font", fontCss(appearanceFont("musicGlyphFont", "MTF Improviso Light"), MUSIC_FONT_FALLBACK));
    root.style.setProperty("--jml-icon-text-font", fontCss(appearanceFont("iconTextFont", "Arial"), ICON_TEXT_FONT_FALLBACK));
    root.style.setProperty("--jml-icon-music-font", fontCss(appearanceFont("iconMusicFont", "MTF Improviso Light"), MUSIC_FONT_FALLBACK));
    [
      ["--jml-menu-primary-offset-x", "menuPrimaryOffsetX", "px"],
      ["--jml-menu-primary-offset-y", "menuPrimaryOffsetY", "px"],
      ["--jml-menu-primary-scale", "menuPrimaryScale", ""],
      ["--jml-menu-primary-gap", "menuPrimaryGap", "px"],
      ["--jml-menu-drawer-offset-x", "menuDrawerOffsetX", "px"],
      ["--jml-menu-drawer-offset-y", "menuDrawerOffsetY", "px"],
      ["--jml-menu-drawer-scale", "menuDrawerScale", ""],
      ["--jml-menu-drawer-gap", "menuDrawerGap", "px"],
      ["--jml-menu-drawer-padding-x", "menuDrawerPaddingX", "px"],
      ["--jml-menu-drawer-padding-y", "menuDrawerPaddingY", "px"],
      ["--jml-midi-panel-offset-x", "midiPanelOffsetX", "px"],
      ["--jml-midi-panel-offset-y", "midiPanelOffsetY", "px"],
      ["--jml-midi-panel-scale", "midiPanelScale", ""],
      ["--jml-midi-panel-padding", "midiPanelPadding", "px"],
      ["--jml-midi-strip-gap", "midiStripGap", "px"],
      ["--jml-midi-button-size", "midiButtonSize", "px"],
      ["--jml-midi-button-text-scale", "midiButtonTextScale", ""],
      ["--jml-midi-white-key-width", "midiWhiteKeyWidth", "px"],
      ["--jml-midi-white-key-height", "midiWhiteKeyHeight", "px"],
      ["--jml-midi-black-key-width", "midiBlackKeyWidth", "px"],
      ["--jml-midi-black-key-height", "midiBlackKeyHeight", "px"],
      ["--jml-midi-key-label-scale", "midiKeyLabelScale", ""],
      ["--jml-midi-white-label-size", "midiWhiteLabelSize", "px"],
      ["--jml-midi-white-label-offset-x", "midiWhiteLabelOffsetX", "px"],
      ["--jml-midi-white-label-offset-y", "midiWhiteLabelOffsetY", "px"],
      ["--jml-midi-white-label-opacity", "midiWhiteLabelOpacity", ""],
      ["--jml-midi-white-label-padding-x", "midiWhiteLabelPaddingX", "px"],
      ["--jml-midi-white-label-padding-y", "midiWhiteLabelPaddingY", "px"],
      ["--jml-midi-white-label-min-width", "midiWhiteLabelMinWidth", "px"],
      ["--jml-midi-white-label-radius", "midiWhiteLabelRadius", "px"],
      ["--jml-midi-black-label-size", "midiBlackLabelSize", "px"],
      ["--jml-midi-black-label-offset-x", "midiBlackLabelOffsetX", "px"],
      ["--jml-midi-black-label-offset-y", "midiBlackLabelOffsetY", "px"],
      ["--jml-midi-black-label-opacity", "midiBlackLabelOpacity", ""],
      ["--jml-midi-black-label-padding-x", "midiBlackLabelPaddingX", "px"],
      ["--jml-midi-black-label-padding-y", "midiBlackLabelPaddingY", "px"],
      ["--jml-midi-black-label-min-width", "midiBlackLabelMinWidth", "px"],
      ["--jml-midi-black-label-radius", "midiBlackLabelRadius", "px"]
    ].forEach(([cssName, key, unit]) => {
      root.style.setProperty(cssName, `${appearanceValue(key)}${unit}`);
    });
    [
      ["--jml-midi-white-label-color", "midiWhiteLabelColor"],
      ["--jml-midi-white-label-bg", "midiWhiteLabelBackground"],
      ["--jml-midi-white-label-border", "midiWhiteLabelBorder"],
      ["--jml-midi-black-label-color", "midiBlackLabelColor"],
      ["--jml-midi-black-label-bg", "midiBlackLabelBackground"],
      ["--jml-midi-black-label-border", "midiBlackLabelBorder"]
    ].forEach(([cssName, key]) => {
      root.style.setProperty(cssName, appearanceString(key));
    });
  }

  function smuflLineWidth(defaultKey, scaleKey) {
    return Engraving.smuflLineWidth(SMUFL_DEFAULTS, SMUFL_SPACE, appearanceValue, defaultKey, scaleKey);
  }

  function staffLineWidth() {
    return Engraving.staffLineWidth({ defaults: SMUFL_DEFAULTS, smuflSpace: SMUFL_SPACE, appearanceValue });
  }

  function barLineWidth() {
    return Engraving.barLineWidth({ defaults: SMUFL_DEFAULTS, smuflSpace: SMUFL_SPACE, appearanceValue });
  }

  function ledgerLineWidth() {
    return Engraving.ledgerLineWidth({ defaults: SMUFL_DEFAULTS, smuflSpace: SMUFL_SPACE, appearanceValue });
  }

  function beamThickness() {
    return Engraving.beamThickness({ defaults: SMUFL_DEFAULTS, smuflSpace: SMUFL_SPACE, appearanceValue });
  }

  function beamLevelDistance() {
    return Engraving.beamLevelDistance({ defaults: SMUFL_DEFAULTS, smuflSpace: SMUFL_SPACE, appearanceValue });
  }

  function musicGlyphSize(scaleKey = "glyphScale") {
    return Engraving.musicGlyphSize({ musicFontSize: MUSIC_FONT_SIZE, appearanceValue }, scaleKey);
  }

  function accidentalNoteGap() {
    return Engraving.accidentalNoteGap(appearanceValue);
  }

  function accidentalYOffset() {
    return Engraving.accidentalYOffset(appearanceValue);
  }

  function accidentalBaseOffset(glyphName, headName = "noteheadBlack") {
    const accidentalBox = glyphBBox(glyphName);
    const accidentalCenter = glyphCenter(glyphName);
    const headBox = glyphBBox(headName);
    const noteLeft = (headBox.sw[0] - glyphCenter(headName).x) * SMUFL_SPACE;
    const accidentalRightFromCenter = (accidentalBox.ne[0] - accidentalCenter.x) * SMUFL_SPACE;
    return noteLeft - accidentalNoteGap() - accidentalRightFromCenter;
  }

  function restOpticalOffset(durationId) {
    return Engraving.restOpticalOffset(durationId, appearanceValue);
  }

  function measureLeftInset() {
    return Math.max(8, appearanceValue("measureLeftInset"));
  }

  function measureRightInset() {
    return appearanceValue("measureRightInset");
  }

  function timeSignatureBaseSize(meter = state.meter || DEFAULT_METER) {
    const top = String(meter.top || "4");
    return top.length > 3 ? 24 : 28;
  }

  function keySignatureAccidentalCount(signature = state.keySignature) {
    return KeySignatures.accidentalCount(signature);
  }

  function keySignatureGlyphName(signature = state.keySignature) {
    return KeySignatures.glyphName(signature);
  }

  function keySignatureAccidentalForDiatonicStep(diatonicStep, signature = state.keySignature) {
    return KeySignatures.accidentalForDiatonicStep(diatonicStep, signature);
  }

  function keySignatureStartX() {
    return 58 + appearanceValue("keySignatureOffsetX");
  }

  function estimatedKeySignatureWidth(signature = state.keySignature) {
    const count = keySignatureAccidentalCount(signature);
    if (!count || !["sharp", "flat"].includes(signature?.accidental)) return 0;
    const scale = appearanceValue("glyphScale") * appearanceValue("keySignatureScale");
    const glyphName = keySignatureGlyphName(signature);
    return glyphWidth(glyphName) * scale + Math.max(0, count - 1) * appearanceValue("keySignatureAccidentalGap");
  }

  function timeSignatureX() {
    const keyWidth = estimatedKeySignatureWidth();
    const keyGap = keyWidth > 0 ? appearanceValue("keySignatureTimeGap") : 0;
    return 58 + keyWidth + keyGap + appearanceValue("timeSignatureOffsetX");
  }

  function estimatedTimeSignatureWidth(meter = state.meter || DEFAULT_METER) {
    const scale = appearanceValue("timeSignatureScale");
    if (meter.cutTime) return glyphWidth("timeSigCutCommon") * (32 * scale / musicGlyphSize());
    const top = String(meter.top || "4");
    const bottom = String(meter.bottom || "4");
    const size = timeSignatureBaseSize(meter) * scale;
    const estimate = (value) => Math.max(
      approximateTextWidth(value, size, "MTF Improviso Light"),
      [...value].length * size * 0.72
    );
    return Math.max(estimate(top), estimate(bottom));
  }

  function firstMeasureSignatureInset() {
    const meter = state.meter || DEFAULT_METER;
    const rightEdge = timeSignatureX() + estimatedTimeSignatureWidth(meter);
    const firstEntryStart = staffLeft() + measureLeftInset();
    return Math.max(0, rightEdge + 24 - firstEntryStart);
  }

  function tickSpacingForMaxFlags(maxFlags) {
    return Engraving.tickSpacingForMaxFlags(maxFlags, appearanceValue);
  }

  function spacingProgression() {
    return appearanceValue("forwardGapProgression");
  }

  function minForwardGap() {
    return appearanceValue("minForwardGap");
  }

  function dotXOffset() {
    return Engraving.dotXOffset(NOTE_HEAD_RX, appearanceValue);
  }

  function restVisualWidth(durationId) {
    return Engraving.restVisualWidth(durationId, REST_VISUAL_WIDTHS, appearanceValue);
  }

  function staffLeft() {
    return Engraving.staffLeft(STAFF_LEFT, appearanceValue);
  }

  function scoreHeight(scoreLayout = null) {
    const zoom = Math.max(0.45, state.zoom || 1);
    const virtualCanvasHeight = Math.max(
      appearanceValue("scoreHeight"),
      (window.innerHeight || 900) * 1.8 / zoom,
      1800 / zoom
    );
    const baseHeight = Math.max(
      virtualCanvasHeight + Math.max(0, systemCount() - 1) * systemGapY(),
      462 / zoom
    );
    const layout = scoreLayout || buildLayout();
    const textBottom = (state.textItems || []).reduce((bottom, item) => {
      try {
        const systemIndex = textItemSystemIndex(item);
        return Math.max(bottom, withSystemContext(systemIndex, () => textItemMetrics(item, layout).hitRect.bottom + 520));
      } catch {
        return bottom;
      }
    }, 0);
    return Math.max(baseHeight, textBottom);
  }

  function scoreShellHeightFor(scoreSvgHeight = scoreHeight()) {
    return Viewport.shellHeight(scoreSvgHeight, state.zoom || 1);
  }

  function scoreShellVisibleHeightFor(scoreSvgHeight = scoreHeight()) {
    const workbench = document.querySelector(".editor-workbench");
    return Viewport.visibleShellHeight({
      totalHeight: scoreShellHeightFor(scoreSvgHeight),
      workbenchRect: workbench?.getBoundingClientRect(),
      shellRect: scoreShell?.getBoundingClientRect(),
      midiHeight: midiKeyboardPanel?.getBoundingClientRect().height || 0,
      windowHeight: window.innerHeight || 900
    });
  }

  function scoreMinWidth() {
    const visibleWidth = scoreShell?.clientWidth || systemsCanvas?.clientWidth || window.innerWidth || 0;
    return Viewport.minWidth({
      zoom: state.zoom || 1,
      visibleWidth,
      configuredWidth: appearanceValue("scoreMinWidth")
    });
  }

  function stateSnapshot() {
    syncActiveSystemMeasures();
    return JSON.stringify({
      cursorMeasure: state.cursorMeasure,
      cursorTick: state.cursorTick,
      cursorStaffStep: state.cursorStaffStep,
      cursorEntryId: state.cursorEntryId,
      selectedEntryIds: state.selectedEntryIds,
      selectedNoteRefs: state.selectedNoteRefs,
      selectedMeasureIndex: state.selectedMeasureIndex,
      entryCursorActive: state.entryCursorActive,
      activeNoteEntryId: state.activeNoteEntryId,
      activeNoteStaffStep: state.activeNoteStaffStep,
      pendingTieEntryId: state.pendingTieEntryId,
      cursorPitchVisible: state.cursorPitchVisible,
      cursorPitchAnchorEntryId: state.cursorPitchAnchorEntryId,
      cursorActive: state.cursorActive,
      selectMode: state.selectMode,
      displacementMode: state.displacementMode,
      line2Mode: state.line2Mode,
      noteChordMode: state.noteChordMode,
      lockDurationMode: state.lockDurationMode,
      forceDurationMode: state.forceDurationMode,
      pitchBeforeDurationMode: state.pitchBeforeDurationMode,
      pendingInputPitch: state.pendingInputPitch,
      pendingMidiNotes: state.pendingMidiNotes,
      activeDurationId: state.activeDuration?.id || DEFAULT_GRID_DURATION_ID,
      gridDurationId: state.gridDurationId || DEFAULT_GRID_DURATION_ID,
      activeTuplet: state.activeTuplet,
      activeTupletRun: state.activeTupletRun,
      pendingTupletRatio: state.pendingTupletRatio,
      meter: state.meter,
      keySignature: state.keySignature,
      textMode: state.textMode,
      chordMode: state.chordMode,
      dynamicMode: state.dynamicMode,
      editMode: state.editMode,
      activeTextId: state.activeTextId,
      selectedTextIds: state.selectedTextIds,
      selectedMarkIds: state.selectedMarkIds,
      activeSystemIndex: state.activeSystemIndex,
      zoom: state.zoom,
      compactLayout: state.compactLayout === true,
      playbackBpm: state.playbackBpm,
      jazzMode: state.jazzMode === true,
      jazzSwingPreset: state.jazzSwingPreset || DEFAULT_JAZZ_SWING_PRESET,
      measureWidthOverrides: state.measureWidthOverrides,
      systems: state.systems,
      textStyle: state.textStyle,
      measures: state.measures,
      marks: state.marks,
      textItems: state.textItems
    });
  }

  let canvasAutosaveTimer = null;
  let canvasAutosaveDirty = true;
  let canvasAutosaveRestored = false;

  function currentCanvasAutosaveDocument() {
    return {
      format: "jml-score-canvas-autosave",
      version: 1,
      updatedAt: new Date().toISOString(),
      payload: JSON.parse(stateSnapshot()),
      exercise: {
        title: String(exerciseTitleInput?.value || ""),
        description: String(exerciseDescriptionInput?.value || ""),
        scenes: normalizeScenes(currentExerciseScenes)
      }
    };
  }

  function saveCanvasAutosaveNow() {
    if (!canvasAutosaveDirty) return true;
    try {
      const saved = storageSet(CANVAS_AUTOSAVE_STORAGE_KEY, JSON.stringify(currentCanvasAutosaveDocument()));
      if (saved) canvasAutosaveDirty = false;
      return saved;
    } catch {
      return false;
    }
  }

  function scheduleCanvasAutosave() {
    if (!canvasAutosaveDirty) return;
    if (canvasAutosaveTimer) clearTimeout(canvasAutosaveTimer);
    canvasAutosaveTimer = setTimeout(() => {
      canvasAutosaveTimer = null;
      saveCanvasAutosaveNow();
    }, 400);
  }

  function restoreCanvasAutosaveIfPresent() {
    if (canvasAutosaveRestored) return false;
    canvasAutosaveRestored = true;
    try {
      const raw = storageGet(CANVAS_AUTOSAVE_STORAGE_KEY);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      if (draft?.format !== "jml-score-canvas-autosave" || !draft.payload) return false;
      restore(JSON.stringify(draft.payload));
      state.history = [];
      state.future = [];
      if (exerciseTitleInput) exerciseTitleInput.value = draft.exercise?.title || "";
      if (exerciseDescriptionInput) exerciseDescriptionInput.value = draft.exercise?.description || "";
      currentExerciseScenes = normalizeScenes(draft.exercise?.scenes || []);
      activeSceneIndex = currentExerciseScenes.length ? 0 : -1;
      renderSceneControls();
      if (draft.updatedAt) setExerciseStatus(`Trabajo local restaurado: ${new Date(draft.updatedAt).toLocaleString()}`);
      return true;
    } catch {
      return false;
    }
  }

  let manualContentLoaded = false;
  let manualMarkdownSource = "";
  let manualSearchTimer = null;

  function manualSlug(text, used = new Map()) {
    const base = String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "seccion";
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  }

  function appendManualPlainOrMarked(target, text, query = "") {
    const content = String(text || "");
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) {
      target.appendChild(document.createTextNode(content));
      return 0;
    }
    const lower = content.toLowerCase();
    let start = 0;
    let count = 0;
    let index = lower.indexOf(needle);
    while (index !== -1) {
      if (index > start) target.appendChild(document.createTextNode(content.slice(start, index)));
      const mark = document.createElement("mark");
      mark.className = "manual-reader__mark";
      mark.textContent = content.slice(index, index + needle.length);
      target.appendChild(mark);
      count += 1;
      start = index + needle.length;
      index = lower.indexOf(needle, start);
    }
    if (start < content.length) target.appendChild(document.createTextNode(content.slice(start)));
    return count;
  }

  function appendManualInline(target, text, query = "") {
    let matches = 0;
    String(text || "").split(/(`[^`]+`)/g).forEach((part) => {
      if (!part) return;
      if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
        const code = document.createElement("code");
        matches += appendManualPlainOrMarked(code, part.slice(1, -1), query);
        target.appendChild(code);
        return;
      }
      matches += appendManualPlainOrMarked(target, part, query);
    });
    return matches;
  }

  function manualTextNode(tagName, text, query = "") {
    const node = document.createElement(tagName);
    const matches = appendManualInline(node, text, query);
    return { node, matches };
  }

  function renderManualMarkdown(markdown, options = {}) {
    const query = String(options.query || "").trim();
    const fragment = document.createDocumentFragment();
    let activeList = null;
    let activeListType = "";
    const headings = [];
    const usedIds = new Map();
    let matchCount = 0;

    const closeList = () => {
      activeList = null;
      activeListType = "";
    };

    const ensureList = (type) => {
      if (!activeList || activeListType !== type) {
        closeList();
        activeList = document.createElement(type);
        activeListType = type;
        fragment.appendChild(activeList);
      }
      return activeList;
    };

    String(markdown || "").split(/\r?\n/).forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        closeList();
        return;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        closeList();
        const level = heading[1].length;
        const id = manualSlug(heading[2], usedIds);
        const { node, matches } = manualTextNode(`h${level}`, heading[2], query);
        node.id = id;
        fragment.appendChild(node);
        matchCount += matches;
        if (level <= 2) headings.push({ id, level, text: heading[2] });
        return;
      }

      const bullet = line.match(/^-\s+(.+)$/);
      if (bullet) {
        const { node: item, matches } = manualTextNode("li", bullet[1], query);
        matchCount += matches;
        ensureList("ul").appendChild(item);
        return;
      }

      const ordered = line.match(/^\d+\.\s+(.+)$/);
      if (ordered) {
        const { node: item, matches } = manualTextNode("li", ordered[1], query);
        matchCount += matches;
        ensureList("ol").appendChild(item);
        return;
      }

      closeList();
      const { node, matches } = manualTextNode("p", line, query);
      matchCount += matches;
      fragment.appendChild(node);
    });

    return { fragment, headings, matchCount };
  }

  function renderManualNav(headings) {
    if (!manualNav) return;
    manualNav.replaceChildren();
    manualNav.appendChild(htmlEl("strong", {
      class: "manual-reader__nav-title",
      text: "Indice"
    }));
    headings
      .filter((heading) => heading.level === 1 || heading.level === 2)
      .forEach((heading) => {
        const link = htmlEl("a", {
          href: `#${heading.id}`,
          text: heading.text
        });
        link.addEventListener("click", (event) => {
          event.preventDefault();
          const target = document.getElementById(heading.id);
          if (!target) return;
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          manualNav.querySelectorAll("a").forEach((item) => item.classList.remove("is-active"));
          link.classList.add("is-active");
        });
        manualNav.appendChild(link);
      });
  }

  function renderManualSearchStatus(query, matchCount) {
    if (!manualSearchStatus) return;
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) {
      manualSearchStatus.textContent = "Use el indice o busque una herramienta por nombre.";
    } else if (matchCount === 1) {
      manualSearchStatus.textContent = "1 coincidencia";
    } else {
      manualSearchStatus.textContent = `${matchCount} coincidencias`;
    }
  }

  function renderManualContent(query = "") {
    if (!manualBody || !manualMarkdownSource) return;
    const result = renderManualMarkdown(manualMarkdownSource, { query });
    manualBody.replaceChildren(result.fragment);
    renderManualNav(result.headings);
    renderManualSearchStatus(query, result.matchCount);
    if (query && !result.matchCount) {
      manualBody.prepend(htmlEl("p", {
        class: "manual-search-empty",
        text: "No encontre coincidencias. Pruebe con otro termino o use el indice."
      }));
    } else if (query) {
      manualBody.querySelector(".manual-reader__mark")?.scrollIntoView({ block: "center" });
    }
  }

  async function loadManualContent() {
    if (!manualBody || manualContentLoaded) return;
    manualBody.replaceChildren(htmlEl("p", {
      class: "manual-reader__loading",
      text: "Cargando manual..."
    }));
    try {
      const response = await fetch("MANUAL_USUARIO_CUADERNO_ESTUDIO.md?v=8", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      manualMarkdownSource = markdown;
      renderManualContent(manualSearchInput?.value || "");
      manualContentLoaded = true;
    } catch {
      manualBody.replaceChildren(
        htmlEl("p", {
          class: "manual-reader__loading",
          text: "No se pudo cargar el manual en esta vista. Recargue la pagina e intente abrir Ayuda de nuevo."
        })
      );
    }
  }

  function closeExerciseAppMenus() {
    exerciseAppMenus.forEach((menu) => {
      menu.open = false;
    });
  }

  function openManualReader() {
    if (!manualOverlay) return;
    closeExerciseAppMenus();
    manualOverlay.hidden = false;
    manualOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("manual-reader-open");
    loadManualContent();
    setTimeout(() => {
      closeManualButton?.focus();
    }, 0);
  }

  function closeManualReader() {
    if (!manualOverlay || manualOverlay.hidden) return;
    manualOverlay.hidden = true;
    manualOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("manual-reader-open");
    openManualButton?.focus();
  }

  function exerciseSlug(value) {
    return Exercises.slug(value);
  }

  let currentExerciseScenes = [];
  let activeSceneIndex = -1;
  let sceneNavigationMode = "review";

  function clonePlain(value, fallback = null) {
    try {
      return JSON.parse(JSON.stringify(value ?? fallback));
    } catch {
      return fallback;
    }
  }

  function sceneViewportSnapshot() {
    return {
      zoom: Math.max(0.45, state.zoom || 1),
      scrollLeft: Math.max(0, Number(scoreShell?.scrollLeft) || 0),
      scrollTop: Math.max(0, Number(scoreShell?.scrollTop) || 0)
    };
  }

  function normalizeScene(scene, index = 0) {
    if (!scene || typeof scene !== "object" || !scene.payload || typeof scene.payload !== "object") return null;
    const viewport = scene.viewport && typeof scene.viewport === "object" ? scene.viewport : {};
    return {
      id: String(scene.id || `scene-${Date.now()}-${index}`),
      title: String(scene.title || `Escena ${index + 1}`),
      note: String(scene.note || ""),
      createdAt: scene.createdAt || new Date().toISOString(),
      updatedAt: scene.updatedAt || scene.createdAt || new Date().toISOString(),
      viewport: {
        zoom: Number.isFinite(Number(viewport.zoom)) ? Math.max(0.45, Math.min(2.4, Number(viewport.zoom))) : 1,
        scrollLeft: Math.max(0, Number(viewport.scrollLeft) || 0),
        scrollTop: Math.max(0, Number(viewport.scrollTop) || 0)
      },
      payload: clonePlain(scene.payload, {})
    };
  }

  function normalizeScenes(scenes = []) {
    return (Array.isArray(scenes) ? scenes : [])
      .map((scene, index) => normalizeScene(scene, index))
      .filter(Boolean);
  }

  function renderSceneControls() {
    const hasScenes = currentExerciseScenes.length > 0;
    if (sceneSelect) {
      const previous = sceneSelect.value;
      sceneSelect.innerHTML = "";
      if (!hasScenes) {
        sceneSelect.appendChild(htmlEl("option", { value: "", text: "Sin escenas" }));
      } else {
        currentExerciseScenes.forEach((scene, index) => {
          sceneSelect.appendChild(htmlEl("option", {
            value: String(index),
            text: `${index + 1}. ${scene.title}`
          }));
        });
      }
      const desired = Number.isFinite(activeSceneIndex) && activeSceneIndex >= 0 ? String(activeSceneIndex) : previous;
      if ([...sceneSelect.options].some((option) => option.value === desired)) sceneSelect.value = desired;
    }
    const selectedIndex = (() => {
      const bySelect = Number(sceneSelect?.value);
      if (Number.isFinite(bySelect) && currentExerciseScenes[bySelect]) return bySelect;
      if (Number.isFinite(activeSceneIndex) && currentExerciseScenes[activeSceneIndex]) return activeSceneIndex;
      return hasScenes ? 0 : -1;
    })();
    [loadSceneButton, overwriteSceneButton, deleteSceneButton].forEach((button) => {
      if (button) button.disabled = !hasScenes;
    });
    if (prevSceneButton) prevSceneButton.disabled = !hasScenes || selectedIndex <= 0;
    if (nextSceneButton) nextSceneButton.disabled = !hasScenes || selectedIndex >= currentExerciseScenes.length - 1;
    if (moveSceneUpButton) moveSceneUpButton.disabled = !hasScenes || selectedIndex <= 0;
    if (moveSceneDownButton) moveSceneDownButton.disabled = !hasScenes || selectedIndex >= currentExerciseScenes.length - 1;
    reviewModeButton?.classList.toggle("is-active", sceneNavigationMode === "review");
    exerciseModeButton?.classList.toggle("is-active", sceneNavigationMode === "exercise");
    if (durationDrawer?.dataset.activePalette === "scenes") renderPalette("scenes");
  }

  function activeSceneFromSelect() {
    const index = Number(sceneSelect?.value);
    if (Number.isFinite(index) && currentExerciseScenes[index]) return { scene: currentExerciseScenes[index], index };
    if (Number.isFinite(activeSceneIndex) && currentExerciseScenes[activeSceneIndex]) {
      return { scene: currentExerciseScenes[activeSceneIndex], index: activeSceneIndex };
    }
    return currentExerciseScenes.length ? { scene: currentExerciseScenes[0], index: 0 } : null;
  }

  function sceneFromCurrentState(title, index = 0, base = {}) {
    return normalizeScene({
      id: base.id || `scene-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: String(title || base.title || `Escena ${index + 1}`).trim() || `Escena ${index + 1}`,
      note: base.note || "",
      createdAt: base.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: sceneViewportSnapshot(),
      payload: JSON.parse(stateSnapshot())
    }, index);
  }

  async function captureSceneSnapshot() {
    const nextIndex = currentExerciseScenes.length + 1;
    const title = await requestEditorPopup({
      title: "Guardar escena",
      initialValue: `Escena ${nextIndex}`,
      placeholder: "Nombre breve de este paso",
      okLabel: "Guardar"
    });
    if (title === null) return false;
    const sceneTitle = String(title).trim() || `Escena ${nextIndex}`;
    const scene = sceneFromCurrentState(sceneTitle, currentExerciseScenes.length);
    if (!scene) return false;
    currentExerciseScenes.push(scene);
    activeSceneIndex = currentExerciseScenes.length - 1;
    canvasAutosaveDirty = true;
    scheduleCanvasAutosave();
    renderSceneControls();
    setExerciseStatus(`Escena guardada: ${scene.title}`);
    return true;
  }

  function restoreSceneViewport(viewport = {}) {
    requestAnimationFrame(() => {
      if (!scoreShell) return;
      scoreShell.scrollLeft = Math.max(0, Number(viewport.scrollLeft) || 0);
      scoreShell.scrollTop = Math.max(0, Number(viewport.scrollTop) || 0);
    });
  }

  function restoreSceneByIndex(index, options = {}) {
    const safeIndex = Math.max(0, Math.min(currentExerciseScenes.length - 1, Number(index) || 0));
    const scene = currentExerciseScenes[safeIndex];
    if (!scene) return false;
    stopMidiPlayback();
    restore(JSON.stringify(scene.payload));
    state.history = [];
    state.future = [];
    activeSceneIndex = safeIndex;
    renderSceneControls();
    restoreSceneViewport(scene.viewport);
    const mode = options.mode || sceneNavigationMode;
    setExerciseStatus(mode === "exercise"
      ? `Ejercicio desde escena ${safeIndex + 1}: ${scene.title}`
      : `Repaso escena ${safeIndex + 1}: ${scene.title}`);
    return true;
  }

  function restoreSelectedScene() {
    const selected = activeSceneFromSelect();
    return selected ? restoreSceneByIndex(selected.index) : false;
  }

  function overwriteSelectedScene() {
    const selected = activeSceneFromSelect();
    if (!selected) return false;
    const scene = sceneFromCurrentState(selected.scene.title, selected.index, selected.scene);
    if (!scene) return false;
    currentExerciseScenes[selected.index] = scene;
    activeSceneIndex = selected.index;
    canvasAutosaveDirty = true;
    scheduleCanvasAutosave();
    renderSceneControls();
    setExerciseStatus(`Escena reescrita: ${scene.title}`);
    return true;
  }

  function moveSelectedScene(delta) {
    const selected = activeSceneFromSelect();
    if (!selected) return false;
    const target = Math.max(0, Math.min(currentExerciseScenes.length - 1, selected.index + delta));
    if (target === selected.index) return false;
    const [scene] = currentExerciseScenes.splice(selected.index, 1);
    currentExerciseScenes.splice(target, 0, scene);
    activeSceneIndex = target;
    canvasAutosaveDirty = true;
    scheduleCanvasAutosave();
    renderSceneControls();
    setExerciseStatus(`Escena movida a la posición ${target + 1}: ${scene.title}`);
    return true;
  }

  function navigateScene(delta) {
    if (!currentExerciseScenes.length) return false;
    const current = activeSceneFromSelect()?.index ?? 0;
    const next = Math.max(0, Math.min(currentExerciseScenes.length - 1, current + delta));
    return restoreSceneByIndex(next);
  }

  function deleteSelectedScene() {
    const selected = activeSceneFromSelect();
    if (!selected) return false;
    const [removed] = currentExerciseScenes.splice(selected.index, 1);
    activeSceneIndex = Math.min(selected.index, currentExerciseScenes.length - 1);
    canvasAutosaveDirty = true;
    scheduleCanvasAutosave();
    renderSceneControls();
    setExerciseStatus(`Escena eliminada: ${removed?.title || ""}`);
    return true;
  }

  function setSceneNavigationMode(mode) {
    sceneNavigationMode = mode === "exercise" ? "exercise" : "review";
    renderSceneControls();
  }

  function currentExerciseMetadata() {
    return ExerciseLibrary.currentMetadata(exerciseTitleInput, exerciseDescriptionInput);
  }

  function currentExerciseDocument(metadata = currentExerciseMetadata()) {
    return Exercises.createDocument({
      format: EXERCISE_FORMAT,
      version: EXERCISE_FORMAT_VERSION,
      metadata,
      payload: JSON.parse(stateSnapshot()),
      scenes: normalizeScenes(currentExerciseScenes),
      editor: "editor-partituras"
    });
  }

  function normalizeExerciseDocument(input) {
    const exercise = Exercises.normalizeDocument(input, {
      format: EXERCISE_FORMAT,
      version: EXERCISE_FORMAT_VERSION,
      editor: "editor-partituras"
    });
    if (exercise) exercise.scenes = normalizeScenes(exercise.scenes);
    return exercise;
  }

  function loadLocalExerciseLibrary() {
    return Exercises.loadLocalLibrary({
      storageGet,
      storageKey: EXERCISE_LIBRARY_STORAGE_KEY,
      format: EXERCISE_FORMAT,
      version: EXERCISE_FORMAT_VERSION
    });
  }

  function saveLocalExerciseLibrary(items) {
    Exercises.saveLocalLibrary({
      storageSet,
      storageKey: EXERCISE_LIBRARY_STORAGE_KEY,
      items
    });
  }

  let localExerciseLibrary = loadLocalExerciseLibrary();
  let bundledExerciseLibrary = [];

  function allExerciseLibraryItems() {
    return ExerciseLibrary.allItems(bundledExerciseLibrary, localExerciseLibrary);
  }

  function setExerciseStatus(message) {
    if (exerciseStatus) exerciseStatus.textContent = message || "";
  }

  function renderExerciseLibrary() {
    if (!exerciseSelect) return;
    ExerciseLibrary.renderSelect(exerciseSelect, allExerciseLibraryItems(), htmlEl);
    updateExerciseFormFromSelection();
    renderSceneControls();
  }

  function selectedExerciseDocument() {
    return ExerciseLibrary.selectedDocument(exerciseSelect, allExerciseLibraryItems());
  }

  function updateExerciseFormFromSelection() {
    ExerciseLibrary.updateForm(selectedExerciseDocument(), {
      titleInput: exerciseTitleInput,
      descriptionInput: exerciseDescriptionInput,
      deleteButton: deleteExerciseButton,
      loadButton: loadExerciseButton
    });
  }

  function restoreExerciseDocument(exerciseDocument) {
    const exercise = normalizeExerciseDocument(exerciseDocument);
    if (!exercise) return false;
    saveHistory();
    restore(JSON.stringify(exercise.payload));
    state.history = [];
    state.future = [];
    if (exerciseTitleInput) exerciseTitleInput.value = exercise.title || "";
    if (exerciseDescriptionInput) exerciseDescriptionInput.value = exercise.description || "";
    currentExerciseScenes = normalizeScenes(exercise.scenes);
    activeSceneIndex = currentExerciseScenes.length ? 0 : -1;
    renderSceneControls();
    setExerciseStatus(`Cargado: ${exercise.title}`);
    return true;
  }

  function loadSelectedExercise() {
    const selected = selectedExerciseDocument();
    if (!selected) return false;
    return restoreExerciseDocument(selected);
  }

  function saveCurrentExerciseToLibrary() {
    const metadata = currentExerciseMetadata();
    const exerciseDocument = currentExerciseDocument(metadata);
    const selected = selectedExerciseDocument();
    const result = ExerciseLibrary.upsertLocal(localExerciseLibrary, exerciseDocument, selected, exerciseSlug);
    localExerciseLibrary = result.library;
    saveLocalExerciseLibrary(localExerciseLibrary);
    renderExerciseLibrary();
    exerciseSelect.value = `local:${result.document.id}:${allExerciseLibraryItems().findIndex((item) => item.id === result.document.id)}`;
    setExerciseStatus(`Guardado local: ${result.document.title}`);
    return true;
  }

  function downloadExerciseDocument(exerciseDocument = currentExerciseDocument()) {
    const exercise = normalizeExerciseDocument(exerciseDocument) || currentExerciseDocument();
    ExerciseLibrary.downloadJson(exercise, exerciseSlug);
    setExerciseStatus(`Exportado: ${exercise.title}`);
  }

  function importExerciseFile(file) {
    if (!file) return false;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const exercise = normalizeExerciseDocument(JSON.parse(String(reader.result || "{}")));
        if (!exercise) throw new Error("Formato no reconocido");
        restoreExerciseDocument(exercise);
        localExerciseLibrary = ExerciseLibrary.importedLocalLibrary(localExerciseLibrary, exercise, exerciseSlug);
        saveLocalExerciseLibrary(localExerciseLibrary);
        renderExerciseLibrary();
        setExerciseStatus(`Importado: ${exercise.title}`);
      } catch (error) {
        setExerciseStatus("No pude importar ese JSON.");
      }
    });
    reader.readAsText(file);
    return true;
  }

  function deleteSelectedLocalExercise() {
    const selected = selectedExerciseDocument();
    if (!selected || selected.source !== "local") return false;
    localExerciseLibrary = localExerciseLibrary.filter((item) => item.id !== selected.id);
    saveLocalExerciseLibrary(localExerciseLibrary);
    renderExerciseLibrary();
    setExerciseStatus(`Eliminado: ${selected.title}`);
    return true;
  }

  async function loadBundledExercises() {
    bundledExerciseLibrary = await ExerciseLibrary.loadBundled({
      fetchImpl: window.fetch?.bind(window),
      normalizeDocument: normalizeExerciseDocument,
      protocol: window.location.protocol
    });
    renderExerciseLibrary();
  }

  function saveHistory() {
    markJazzSwingCacheDirty();
    scoreModelDirty = true;
    canvasAutosaveDirty = true;
    invalidateLayoutCache();
    return History.save(state, stateSnapshot, { maxLength: 80 });
  }

  function restore(snapshot) {
    markJazzSwingCacheDirty();
    scoreModelDirty = true;
    canvasAutosaveDirty = true;
    invalidateLayoutCache();
    const data = JSON.parse(snapshot);
    state.cursorMeasure = data.cursorMeasure;
    state.cursorTick = data.cursorTick;
    state.cursorStaffStep = Number.isFinite(data.cursorStaffStep) ? data.cursorStaffStep : 0;
    state.cursorEntryId = data.cursorEntryId || null;
    state.selectedEntryIds = Array.isArray(data.selectedEntryIds) ? data.selectedEntryIds : [];
    state.selectedNoteRefs = Array.isArray(data.selectedNoteRefs) ? data.selectedNoteRefs : [];
    state.selectedMeasureIndex = Number.isFinite(data.selectedMeasureIndex) ? data.selectedMeasureIndex : null;
    state.dragSelection = null;
    state.entryCursorActive = data.entryCursorActive === true;
    state.activeNoteEntryId = data.activeNoteEntryId || null;
    state.activeNoteStaffStep = Number.isFinite(data.activeNoteStaffStep) ? data.activeNoteStaffStep : null;
    state.pendingTieEntryId = data.pendingTieEntryId || null;
    state.cursorPitchVisible = data.cursorPitchVisible === true;
    state.cursorPitchAnchorEntryId = data.cursorPitchAnchorEntryId || null;
    state.cursorActive = data.cursorActive !== false;
    state.selectMode = data.selectMode === true;
    state.displacementMode = data.displacementMode === true;
    state.line2Mode = data.line2Mode === true;
    state.noteChordMode = data.noteChordMode === true;
    state.lockDurationMode = data.lockDurationMode === true;
    state.forceDurationMode = data.forceDurationMode === true;
    state.pitchBeforeDurationMode = data.pitchBeforeDurationMode === true;
    state.pendingInputPitch = data.pendingInputPitch || null;
    state.pendingMidiNotes = Array.isArray(data.pendingMidiNotes) ? data.pendingMidiNotes : [];
    state.activeDuration = durationById(data.activeDurationId) || durationById(DEFAULT_GRID_DURATION_ID) || durations[3];
    state.gridDurationId = durationById(data.gridDurationId)?.id || DEFAULT_GRID_DURATION_ID;
    state.activeTuplet = data.activeTuplet || null;
    state.activeTupletRun = data.activeTupletRun || null;
    state.pendingTupletRatio = data.pendingTupletRatio || null;
    state.meter = data.meter || { ...DEFAULT_METER };
    activeMeter = { ...state.meter };
    state.keySignature = data.keySignature || null;
    state.textMode = data.textMode === true;
    state.chordMode = data.chordMode === true;
    state.dynamicMode = data.dynamicMode === true;
    state.editMode = data.editMode === true;
    state.activeTextId = data.activeTextId || null;
    state.selectedTextIds = Array.isArray(data.selectedTextIds) ? data.selectedTextIds : [];
    state.selectedMarkIds = Array.isArray(data.selectedMarkIds) ? data.selectedMarkIds : [];
    state.activeSystemIndex = Number.isFinite(data.activeSystemIndex) ? data.activeSystemIndex : 0;
    state.zoom = Number.isFinite(data.zoom) ? Math.max(0.45, Math.min(2.4, data.zoom)) : 1;
    state.compactLayout = data.compactLayout === true;
    state.playbackBpm = normalizePlaybackBpm(data.playbackBpm);
    state.jazzMode = data.jazzMode === true;
    state.jazzSwingPreset = normalizeJazzSwingPreset(data.jazzSwingPreset);
    state.jazzSwingCache = new Map();
    state.measureWidthOverrides = Array.isArray(data.measureWidthOverrides) ? data.measureWidthOverrides : [];
    state.textStyle = data.textStyle || state.textStyle;
    if (Array.isArray(data.systems) && data.systems.length) {
      state.systems = data.systems;
      state.activeSystemIndex = clampSystemIndex(state.activeSystemIndex);
      state.measures = state.systems[state.activeSystemIndex].measures;
    } else {
      state.measures = data.measures;
      state.systems = [{ id: createSystemId(), kind: "staff", measures: state.measures }];
      state.activeSystemIndex = 0;
    }
    state.marks = Array.isArray(data.marks) ? data.marks : [];
    state.textItems = Array.isArray(data.textItems) ? data.textItems : [];
    state.inputSession = null;
    InputSession.syncFromLegacy(state);
    normalizedScoreModelSignature = "";
    render();
  }

  function ensureMeasure(index) {
    ensureAllSystemsMeasure(index);
    while (state.measures.length <= index) state.measures.push(createMeasure());
  }

  function entryVoice(entry) {
    return Voices.entryVoice(entry);
  }

  function activeVoice() {
    return state.line2Mode ? 2 : 1;
  }

  function syncInputSession() {
    return InputSession.syncFromLegacy(state);
  }

  function isNoteInputMode() {
    return InputSession.isNoteInput(state);
  }

  function setInputPhase(phase) {
    InputSession.applyPhase(state, phase);
    syncInputSession();
    return phase;
  }

  function noteInputAnchorLocation() {
    const selection = selectedEntryLocation();
    if (selection?.entry) return selection;
    const firstSelectedRef = selectedNoteRefs()[0];
    return firstSelectedRef ? entryLocationById(firstSelectedRef.entryId) : null;
  }

  function startNoteInput(options = {}) {
    const anchor = noteInputAnchorLocation();
    const previousMeasureIndex = state.cursorMeasure;
    let anchorStaffStep = state.cursorStaffStep;
    if (anchor?.entry) {
      activateVoiceForEntrySelection(anchor.entry);
      state.cursorMeasure = anchor.measureIndex;
      state.cursorTick = Math.max(0, Number(anchor.entry.tickStart) || 0);
      if (anchor.entry.type === "note") {
        anchorStaffStep = nearestEntryStaffStep(anchor.entry, state.cursorStaffStep);
      }
    } else if (options.preferFirstWritable === true && !state.cursorActive) {
      const location = firstWritableCursorLocation();
      state.cursorMeasure = location.measureIndex;
      state.cursorTick = location.tick;
    }
    clearMeasureSelection();
    clearEntrySelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    hideCursorPitch();
    state.cursorStaffStep = staffStepForSystem(anchorStaffStep);
    state.textMode = false;
    state.chordMode = false;
    state.dynamicMode = false;
    state.editMode = false;
    state.selectMode = false;
    state.cursorActive = true;
    state.entryCursorActive = false;
    setInputPhase(InputSession.PHASES.NOTE_INPUT);
    finalizeMeasureOnExit(previousMeasureIndex, state.cursorMeasure);
    updateModeButtons();
    render();
    return true;
  }

  function toggleNoteInput() {
    if (isNoteInputMode()) {
      activateSelectTool();
      return false;
    }
    return startNoteInput({ preferFirstWritable: true });
  }

  function setNoteInputModifier(key, enabled) {
    const next = enabled === true;
    if (key === "chordMode" && next) InputSession.setModifier(state, "insertMode", false);
    if (key === "insertMode" && next) InputSession.setModifier(state, "chordMode", false);
    InputSession.setModifier(state, key, next);
    if (key === "pitchBeforeDuration" && !next) {
      state.pendingInputPitch = null;
      state.pendingMidiNotes = [];
    }
    syncInputSession();
    updateModeButtons();
    render();
    return next;
  }

  function toggleNoteInputModifier(key) {
    const session = syncInputSession();
    return setNoteInputModifier(key, !session.input[key]);
  }

  function selectableVoiceForEntry(entry) {
    return entryVoice(entry) === 2 ? 2 : 1;
  }

  function activateVoiceForEntrySelection(entry) {
    if (!entry) return;
    const nextVoice = selectableVoiceForEntry(entry);
    const nextLine2Mode = nextVoice === 2;
    const changed = state.line2Mode !== nextLine2Mode;
    state.line2Mode = nextLine2Mode;
    syncInputSession();
    if (changed) updateModeButtons();
  }

  function setEntryVoice(entry, voice = activeVoice()) {
    return Voices.setEntryVoice(entry, voice);
  }

  function isSecondaryVoiceEntry(entry) {
    return Voices.isSecondaryVoiceEntry(entry);
  }

  function measureVoiceEntries(measure, voice = 1) {
    return Voices.measureVoiceEntries(measure, voice);
  }

  function measurePrimaryEntries(measure) {
    return Voices.measurePrimaryEntries(measure);
  }

  function measureSecondaryEntries(measure) {
    return Voices.measureSecondaryEntries(measure);
  }

  function measureHasSecondaryVoice(measure) {
    return Voices.measureHasSecondaryVoice(measure);
  }

  function measureHasMultipleVoices(measure) {
    return Voices.measureHasMultipleVoices(measure);
  }

  function measureHasVoiceLayers(measure) {
    return Voices.measureHasVoiceLayers(measure, { isMeasureRestEntry });
  }

  function entryMeasure(entry) {
    const location = entryLocationById(entry?.id);
    return location ? state.measures[location.measureIndex] : null;
  }

  function primaryMeasures() {
    return Measures.primaryMeasures(scoreSystems(), state.measures);
  }

  function measureIsHidden(index) {
    return Measures.measureIsHidden(scoreSystems(), state.measures, index);
  }

  function setMeasureHidden(index, hidden) {
    Measures.setMeasureHidden(scoreSystems(), index, hidden);
  }

  function selectedMeasureIndex() {
    return Measures.selectedMeasureIndex(state);
  }

  function shiftAnchoredItemsForMeasureInsert(index) {
    MeasureAnchors.shiftAnchoredItemsForInsert(state, index);
  }

  function shiftAnchoredItemsForMeasureRemove(index) {
    MeasureAnchors.shiftAnchoredItemsForRemove(state, index);
  }

  function insertMeasureAfterSelection() {
    return insertMeasureAtIndex(selectedMeasureIndex() + 1);
  }

  function insertMeasureAtIndex(index) {
    syncActiveSystemMeasures();
    const insertIndex = Math.max(0, Math.min(state.measures.length, Number(index) || 0));
    saveHistory();
    scoreSystems().forEach((system) => {
      if (!Array.isArray(system.measures)) system.measures = [];
      system.measures.splice(insertIndex, 0, createMeasureForSystemIndex(insertIndex));
    });
    shiftAnchoredItemsForMeasureInsert(insertIndex);
    setActiveSystemIndex(activeSystemIndex());
    state.selectedMeasureIndex = insertIndex;
    state.cursorMeasure = insertIndex;
    state.cursorTick = 0;
    clearEntrySelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = true;
    render();
    return true;
  }

  function appendMeasuresAtEnd(count = 1) {
    syncActiveSystemMeasures();
    const amount = Math.max(0, Math.min(64, Math.round(Number(count) || 0)));
    if (!amount) return false;
    const firstNewIndex = state.measures.length;
    saveHistory();
    scoreSystems().forEach((system) => {
      if (!Array.isArray(system.measures)) system.measures = [];
      for (let offset = 0; offset < amount; offset += 1) {
        system.measures.push(createMeasureForSystemIndex(firstNewIndex + offset));
      }
    });
    setActiveSystemIndex(activeSystemIndex());
    state.selectedMeasureIndex = firstNewIndex;
    state.cursorMeasure = firstNewIndex;
    state.cursorTick = 0;
    clearEntrySelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = true;
    render();
    return true;
  }

  let appendMeasurePromptOpen = false;

  async function requestAppendMeasuresAtEnd() {
    if (appendMeasurePromptOpen) return false;
    appendMeasurePromptOpen = true;
    try {
      const value = await requestEditorPopup({
        title: "Agregar compases",
        message: "El cursor llegó al final. ¿Cuántos compases quieres agregar?",
        placeholder: "4",
        defaultValue: "1"
      });
      if (value === null) return false;
      const count = Math.max(1, Math.min(64, Math.round(Number.parseInt(String(value).trim(), 10) || 1)));
      return appendMeasuresAtEnd(count);
    } finally {
      appendMeasurePromptOpen = false;
    }
  }

  function removeSelectedMeasure() {
    syncActiveSystemMeasures();
    if (state.measures.length <= 1) return false;
    const removeIndex = selectedMeasureIndex();
    saveHistory();
    scoreSystems().forEach((system) => {
      if (Array.isArray(system.measures) && system.measures.length > 1) {
        system.measures.splice(removeIndex, 1);
      }
    });
    shiftAnchoredItemsForMeasureRemove(removeIndex);
    setActiveSystemIndex(activeSystemIndex());
    state.selectedMeasureIndex = Math.max(0, Math.min(removeIndex, state.measures.length - 1));
    state.cursorMeasure = state.selectedMeasureIndex;
    state.cursorTick = 0;
    clearEntrySelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = true;
    render();
    return true;
  }

  function toggleSelectedMeasureHidden() {
    syncActiveSystemMeasures();
    const index = selectedMeasureIndex();
    ensureMeasure(index);
    saveHistory();
    setMeasureHidden(index, !measureIsHidden(index));
    state.selectedMeasureIndex = index;
    clearEntrySelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    hideCursorPitch();
    state.cursorMeasure = index;
    state.cursorTick = 0;
    state.cursorActive = true;
    render();
    return true;
  }

  function measureUsed(measure, voice = 1) {
    return Measures.measureUsed(measure, voice, measureVoiceEntries);
  }

  function entryBaseTicks(entry) {
    return entryDuration(entry).ticks;
  }

  function measureIsFull(measure, measureIndex = state.measures.indexOf(measure)) {
    return Measures.measureIsFull(measure, measureTicksForIndex(measureIndex), {
      voice: 1,
      epsilon: EPSILON,
      measureVoiceEntries
    });
  }

  function isMeasureRestEntry(entry, measureIndex = state.cursorMeasure) {
    return Measures.isMeasureRestEntry(entry, measureTicksForIndex(measureIndex), {
      isSecondaryVoiceEntry,
      epsilon: EPSILON
    });
  }

  function isEmptyMeasure(measure, measureIndex = state.measures.indexOf(measure)) {
    return Measures.isEmptyMeasure(measure, measureTicksForIndex(measureIndex), {
      isSecondaryVoiceEntry,
      epsilon: EPSILON
    });
  }

  function retimeMeasure(measure, voice = 1) {
    Writing.retimeMeasure(measure, voice, measureVoiceEntries);
  }

  function normalizeMeasure(measure, measureIndex = state.measures.indexOf(measure)) {
    if (!measure) return false;
    const structure = () => (measure.entries || []).map((entry) => (
      `${entry.id || ""}:${entryVoice(entry)}:${entry.type}:${Number(entry.tickStart) || 0}:${Number(entry.ticks) || 0}:${entry.explicitRest === true ? 1 : 0}`
    )).join("|");
    const before = structure();

    [1, 2].forEach((voice) => {
      const hasAuthoredContent = (measure.entries || []).some((entry) => (
        entryVoice(entry) === voice &&
        !entry.hiddenTupletReserve &&
        (entry.type === "note" || entry.explicitRest === true || !!entry.tuplet)
      ));
      if (voice === 2 && !hasAuthoredContent) {
        measure.entries = measure.entries.filter((entry) => !(
          entryVoice(entry) === 2 && entry.type === "rest" && entry.explicitRest !== true
        ));
        return;
      }
      fillVoiceWithRestsExact(measure, measureIndex, voice);
    });

    measure.entries.sort((a, b) => (
      (Number(a.tickStart) || 0) - (Number(b.tickStart) || 0) ||
      entryVoice(a) - entryVoice(b) ||
      (a.type === "note" ? -1 : 1)
    ));
    return before !== structure();
  }

  function durationByTicks(ticks) {
    return Durations.durationByTicks(ticks);
  }

  function dotCountForEntry(entry) {
    return Durations.dotCountForEntry(entry);
  }

  function dotFactor(dotCount) {
    return Durations.dotFactor(dotCount);
  }

  function durationInfoByTicks(ticks) {
    return Durations.durationInfoByTicks(ticks);
  }

  function makeEntry(type, duration, staffStep = 0, accidental = null) {
    return ScoreModel.makeEntry({ type, duration, staffStep, accidental });
  }

  function durationById(id) {
    return Durations.durationById(id);
  }

  function durationDenominator(durationId) {
    return Durations.durationDenominator(durationId);
  }

  function normalizeTuplet(tuplet) {
    if (!tuplet) return null;
    const actual = Number(tuplet.actual);
    const normal = Number(tuplet.normal);
    const unitDurationId = tuplet.unitDurationId;
    const unit = durationById(unitDurationId);
    if (!Number.isFinite(actual) || !Number.isFinite(normal) || actual <= 0 || normal <= 0 || !unit) return null;
    return {
      actual,
      normal,
      unitDurationId,
      label: tuplet.label || `${actual}(${durationDenominator(unitDurationId)})`
    };
  }

  function tupletDisplayLabel(tuplet, mode = "cursor") {
    const normalized = normalizeTuplet(tuplet);
    if (!normalized) return "";
    const denominator = durationDenominator(normalized.unitDurationId);
    if (mode === "group") {
      return (normalized.actual === 3 || normalized.actual === 6)
        ? String(normalized.actual)
        : `${normalized.actual}:${normalized.normal}`;
    }
    return (normalized.actual === 3 || normalized.actual === 6)
      ? `${normalized.actual}(${denominator})`
      : normalized.actual === normalized.normal + 1
        ? `${normalized.actual}(${denominator})`
        : `${normalized.actual}:${normalized.normal}`;
  }

  function tupletUnitTicks(tuplet) {
    const normalized = normalizeTuplet(tuplet);
    if (!normalized) return null;
    const unit = durationById(normalized.unitDurationId);
    return unit.ticks * normalized.normal / normalized.actual;
  }

  function createTupletGroupId() {
    return crypto.randomUUID ? crypto.randomUUID() : `tuplet-${Date.now()}-${Math.random()}`;
  }

  function applyTupletMetadata(entry, tuplet, index, groupId = null, slotSpan = 1) {
    const normalized = normalizeTuplet(tuplet);
    if (!entry || !normalized) return false;
    const unit = durationById(normalized.unitDurationId);
    const unitTicks = tupletUnitTicks(normalized);
    if (!unit || !Number.isFinite(unitTicks)) return false;
    const span = Math.max(1, Number(slotSpan) || 1);
    const visualInfo = durationInfoByTicks(unit.ticks * span);
    const visualDuration = visualInfo?.duration || unit;
    entry.durationId = visualDuration.id;
    entry.flags = visualDuration.flags;
    entry.ticks = unitTicks * span;
    entry.dotted = visualInfo?.dotted || false;
    entry.dots = visualInfo?.dots || (entry.dotted ? 1 : 0);
    entry.tuplet = {
      id: groupId || createTupletGroupId(),
      actual: normalized.actual,
      normal: normalized.normal,
      unitDurationId: normalized.unitDurationId,
      index,
      span,
      count: normalized.actual,
      label: tupletDisplayLabel(normalized, "group")
    };
    if (entry.type === "rest") {
      entry.tieToNext = false;
      entry.tieStaffStep = null;
    }
    return true;
  }

  function clearTupletMetadata(entry) {
    if (entry) delete entry.tuplet;
  }

  function sameTupletConfig(a, b) {
    const left = normalizeTuplet(a);
    const right = normalizeTuplet(b);
    return !!left && !!right &&
      left.actual === right.actual &&
      left.normal === right.normal &&
      left.unitDurationId === right.unitDurationId;
  }

  function tupletsShareRun(a, b) {
    return sameTupletConfig(a, b);
  }

  function startTupletRun(tuplet, startAbsTick = cursorAbsoluteTick()) {
    const normalized = normalizeTuplet(tuplet);
    if (!normalized) return null;
    state.activeTupletRun = {
      id: createTupletGroupId(),
      actual: normalized.actual,
      normal: normalized.normal,
      unitDurationId: normalized.unitDurationId,
      startAbsTick,
      voice: activeVoice(),
      index: 0,
      remaining: normalized.actual
    };
    return state.activeTupletRun;
  }

  function tupletGroupTicks(tuplet) {
    const normalized = normalizeTuplet(tuplet);
    const unit = normalized ? durationById(normalized.unitDurationId) : null;
    return normalized && unit ? unit.ticks * normalized.normal : 0;
  }

  function tupletSlotTicks(tuplet) {
    const normalized = normalizeTuplet(tuplet);
    return normalized ? tupletUnitTicks(normalized) : 0;
  }

  function activeTupletRunStart(tuplet = state.activeTuplet) {
    const normalized = normalizeTuplet(tuplet);
    if (!normalized) return null;
    if (!state.activeTupletRun || !tupletsShareRun(state.activeTupletRun, normalized) || Number(state.activeTupletRun.voice || 1) !== activeVoice()) {
      startTupletRun(normalized, cursorAbsoluteTick());
    }
    return state.activeTupletRun.startAbsTick;
  }

  function tupletSlotIndexFromTick(tuplet, absoluteTick, startAbsTick = activeTupletRunStart(tuplet)) {
    const normalized = normalizeTuplet(tuplet);
    const slotTicks = tupletSlotTicks(normalized);
    if (!normalized || !Number.isFinite(startAbsTick) || !slotTicks) return 0;
    return Math.max(0, Math.min(
      normalized.actual - 1,
      Math.round((absoluteTick - startAbsTick) / slotTicks)
    ));
  }

  function nextTupletWriteInfo() {
    const tuplet = normalizeTuplet(state.activeTuplet);
    if (!tuplet) return null;
    const unit = durationById(tuplet.unitDurationId);
    if (!unit) return null;
    if (
      !state.activeTupletRun ||
      !tupletsShareRun(state.activeTupletRun, tuplet) ||
      Number(state.activeTupletRun.voice || 1) !== activeVoice() ||
      state.activeTupletRun.remaining <= 0
    ) {
      startTupletRun(tuplet, cursorAbsoluteTick());
    }
    const run = state.activeTupletRun;
    const index = tupletSlotIndexFromTick(tuplet, cursorAbsoluteTick(), run.startAbsTick);
    const info = {
      tuplet,
      unit,
      groupId: run.id,
      index,
      startAbsTick: run.startAbsTick
    };
    run.index = Math.max(run.index, index + 1);
    run.remaining = Math.max(0, tuplet.actual - run.index);
    return info;
  }

  function tupletRunEntries(run = state.activeTupletRun) {
    if (!run?.id) return [];
    const voice = Number(run.voice) === 2 ? 2 : 1;
    return flattenScoreEntries()
      .filter((item) => item.entry?.tuplet?.id === run.id && entryVoice(item.entry) === voice)
      .sort((a, b) => (a.entry.tuplet.index || 0) - (b.entry.tuplet.index || 0));
  }

  function occupiedTupletSlots(run = state.activeTupletRun) {
    const occupied = new Set();
    tupletRunEntries(run).forEach(({ entry }) => {
      const start = Number(entry.tuplet?.index) || 0;
      const span = Math.max(1, Number(entry.tuplet?.span) || 1);
      for (let slot = start; slot < start + span; slot += 1) occupied.add(slot);
    });
    return occupied;
  }

  function tupletEntrySlots(entry) {
    const start = Number(entry?.tuplet?.index) || 0;
    const span = Math.max(1, Number(entry?.tuplet?.span) || 1);
    return { start, end: start + span };
  }

  function tupletEntriesOverlap(a, b) {
    const left = tupletEntrySlots(a);
    const right = tupletEntrySlots(b);
    return left.start < right.end && right.start < left.end;
  }

  function makeTupletRest(tuplet, groupId, index, slotSpan = 1) {
    const normalized = normalizeTuplet(tuplet);
    const unit = normalized ? durationById(normalized.unitDurationId) : null;
    if (!normalized || !unit) return null;
    const visualInfo = durationInfoByTicks(unit.ticks * Math.max(1, slotSpan)) || { duration: unit, dotted: false };
    const rest = makeEntry("rest", visualInfo.duration, 0, null);
    applyTupletMetadata(rest, normalized, index, groupId, slotSpan);
    return rest;
  }

  function insertTupletRestSpan(tuplet, groupId, index, slotSpan, absoluteTick) {
    const rest = makeTupletRest(tuplet, groupId, index, slotSpan);
    if (!rest) return false;
    return rest;
  }

  function fillAbsoluteGapBefore(items, targetAbsTick, voice = 1) {
    if (!Number.isFinite(targetAbsTick)) return;
    const normalizedVoice = Number(voice) === 2 ? 2 : 1;
    const targetMeasureIndex = measureIndexAndTickFromAbsolute(targetAbsTick).measureIndex;
    const measureStart = measureStartAbsoluteTick(targetMeasureIndex);
    let coveredEnd = measureStart;
    [...items]
      .filter((item) => (
        entryVoice(item.entry) === normalizedVoice &&
        item.absTick >= measureStart - EPSILON &&
        item.absTick < targetAbsTick - EPSILON
      ))
      .sort((a, b) => a.absTick - b.absTick || entryVoice(a.entry) - entryVoice(b.entry))
      .forEach((item) => {
        if (item.absTick <= coveredEnd + EPSILON) {
          coveredEnd = Math.max(coveredEnd, item.absTick + item.entry.ticks);
        }
      });
    if (coveredEnd >= targetAbsTick - EPSILON) return;
    makeRestEntriesForRange(coveredEnd, targetAbsTick - coveredEnd, meterForMeasureIndex(targetMeasureIndex)).forEach((rest) => {
      setEntryVoice(rest, normalizedVoice);
      items.push({ absTick: rest.tickStart, entry: rest });
    });
  }

  function rebuildMeasuresFromAbsoluteItemsExact(items, minimumMeasures = state.measures.length) {
    const maxEnd = items.reduce((max, item) => Math.max(max, item.absTick + item.entry.ticks), 0);
    const metersByIndex = state.measures.map((measure) => measure?.meter || null);
    const keySignaturesByIndex = state.measures.map((measure) => measure?.keySignature || null);
    const hiddenByIndex = state.measures.map((measure) => measure?.hidden === true);
    let measureCount = Math.max(minimumMeasures, 8, 1);
    while (measureStartAbsoluteTick(measureCount) < maxEnd - EPSILON) measureCount += 1;
    state.measures = Array.from({ length: measureCount }, (_, index) => {
      const measure = metersByIndex[index] ? { meter: { ...metersByIndex[index] }, entries: [] } : { entries: [] };
      if (keySignaturesByIndex[index]) measure.keySignature = { ...keySignaturesByIndex[index] };
      if (hiddenByIndex[index]) measure.hidden = true;
      return measure;
    });
    items
      .filter((item) => item.entry.ticks > EPSILON)
      .sort((a, b) => a.absTick - b.absTick)
      .forEach((item) => {
        const segments = splitEntryRhythmically(item.entry, item.absTick);
        segments.forEach((segment) => {
          const target = measureIndexAndTickFromAbsolute(segment.absoluteStart);
          const measureIndex = target.measureIndex;
          ensureMeasure(measureIndex);
          segment.entry.tickStart = target.tick;
          state.measures[measureIndex].entries.push(segment.entry);
        });
      });

    state.measures.forEach((measure, measureIndex) => {
      measure.entries.sort((a, b) => a.tickStart - b.tickStart || entryVoice(a) - entryVoice(b));
      if (!measure.entries.length) measure.entries.push(makeMeasureRest(measureTicksForIndex(measureIndex)));
    });
    const systems = Array.isArray(state.systems) ? state.systems : null;
    if (systems?.[renderSystemIndex]) systems[renderSystemIndex].measures = state.measures;
  }

  function rewriteOpenTupletGroup(run, entries) {
    const normalized = normalizeTuplet(run);
    const slotTicks = tupletSlotTicks(normalized);
    const groupTicks = tupletGroupTicks(normalized);
    if (!run?.id || !normalized || !slotTicks || !groupTicks) return false;
    const voice = Number(run.voice) === 2 ? 2 : 1;
    const groupStart = run.startAbsTick;
    const groupEnd = groupStart + groupTicks;
    const nextItems = [];

    flattenScoreEntries().forEach((item) => {
      const sameVoice = entryVoice(item.entry) === voice;
      if (sameVoice && item.entry?.tuplet?.id === run.id) return;
      if (!sameVoice) {
        nextItems.push(item);
        return;
      }
      const itemEnd = item.absTick + item.entry.ticks;
      if (itemEnd <= groupStart + EPSILON || item.absTick >= groupEnd - EPSILON) {
        nextItems.push(item);
        return;
      }
      if (item.entry.type !== "rest" || item.entry.tuplet) return;

      if (item.absTick < groupStart - EPSILON) {
        makeRestEntriesForRange(item.absTick, groupStart - item.absTick).forEach((rest) => {
          setEntryVoice(rest, voice);
          nextItems.push({ absTick: rest.tickStart, entry: rest });
        });
      }
      if (itemEnd > groupEnd + EPSILON) {
        makeRestEntriesForRange(groupEnd, itemEnd - groupEnd).forEach((rest) => {
          setEntryVoice(rest, voice);
          nextItems.push({ absTick: rest.tickStart, entry: rest });
        });
      }
    });

    fillAbsoluteGapBefore(nextItems, groupStart, voice);

    entries
      .filter(Boolean)
      .sort((a, b) => (a.tuplet?.index || 0) - (b.tuplet?.index || 0))
      .forEach((entry) => {
        setEntryVoice(entry, voice);
        const index = Math.max(0, Number(entry.tuplet?.index) || 0);
        nextItems.push({
          absTick: groupStart + index * slotTicks,
          entry
        });
      });
    rebuildMeasuresFromAbsoluteItemsExact(nextItems);
    return true;
  }

  function rewriteTupletGroup(run, entries) {
    const normalized = normalizeTuplet(run);
    const slotTicks = tupletSlotTicks(normalized);
    const groupTicks = tupletGroupTicks(normalized);
    if (!run?.id || !normalized || !slotTicks || !groupTicks) return false;
    const voice = Number(run.voice) === 2 ? 2 : 1;
    const groupStart = run.startAbsTick;
    const groupEnd = groupStart + groupTicks;
    const nextItems = [];

    flattenScoreEntries().forEach((item) => {
      const sameVoice = entryVoice(item.entry) === voice;
      if (sameVoice && item.entry?.tuplet?.id === run.id) return;
      if (!sameVoice) {
        nextItems.push(item);
        return;
      }
      const itemEnd = item.absTick + item.entry.ticks;
      if (itemEnd <= groupStart + EPSILON || item.absTick >= groupEnd - EPSILON) {
        nextItems.push(item);
        return;
      }
      if (item.entry.type !== "rest" || item.entry.tuplet) return;

      if (item.absTick < groupStart - EPSILON) {
        makeRestEntriesForRange(item.absTick, groupStart - item.absTick).forEach((rest) => {
          setEntryVoice(rest, voice);
          nextItems.push({ absTick: rest.tickStart, entry: rest });
        });
      }
      if (itemEnd > groupEnd + EPSILON) {
        makeRestEntriesForRange(groupEnd, itemEnd - groupEnd).forEach((rest) => {
          setEntryVoice(rest, voice);
          nextItems.push({ absTick: rest.tickStart, entry: rest });
        });
      }
    });

    fillAbsoluteGapBefore(nextItems, groupStart, voice);

    entries
      .filter(Boolean)
      .sort((a, b) => (a.tuplet?.index || 0) - (b.tuplet?.index || 0))
      .forEach((entry) => {
        setEntryVoice(entry, voice);
        const index = Math.max(0, Number(entry.tuplet?.index) || 0);
        nextItems.push({
          absTick: groupStart + index * slotTicks,
          entry
        });
      });
    rebuildMeasuresFromAbsoluteItems(nextItems);
    return true;
  }

  function cleanedTupletEntries(entries) {
    const accepted = [];
    const occupied = new Set();
    [...entries]
      .filter(Boolean)
      .sort((a, b) => (
        (Number(a.tuplet?.index) || 0) - (Number(b.tuplet?.index) || 0) ||
        (a.type === "rest" ? 1 : 0) - (b.type === "rest" ? 1 : 0)
      ))
      .forEach((entry) => {
        const { start, end } = tupletEntrySlots(entry);
        const slots = [];
        for (let slot = start; slot < end; slot += 1) slots.push(slot);
        const overlaps = slots.some((slot) => occupied.has(slot));
        if (!overlaps) {
          accepted.push(entry);
          slots.forEach((slot) => occupied.add(slot));
          return;
        }
        if (entry.type === "rest") return;

        for (let index = accepted.length - 1; index >= 0; index -= 1) {
          const acceptedEntry = accepted[index];
          if (acceptedEntry.type !== "rest" || !tupletEntriesOverlap(acceptedEntry, entry)) continue;
          const acceptedSlots = tupletEntrySlots(acceptedEntry);
          for (let slot = acceptedSlots.start; slot < acceptedSlots.end; slot += 1) occupied.delete(slot);
          accepted.splice(index, 1);
        }
        if (slots.some((slot) => occupied.has(slot))) return;
        accepted.push(entry);
        slots.forEach((slot) => occupied.add(slot));
      });
    return accepted;
  }

  function tupleGroupRunFromEntry(item) {
    const tuplet = normalizeTuplet(item?.entry?.tuplet);
    const slotTicks = tupletSlotTicks(tuplet);
    const index = Number(item?.entry?.tuplet?.index) || 0;
    if (!item?.entry?.tuplet?.id || !tuplet || !slotTicks) return null;
    return {
      id: item.entry.tuplet.id,
      actual: tuplet.actual,
      normal: tuplet.normal,
      unitDurationId: tuplet.unitDurationId,
      voice: entryVoice(item.entry),
      startAbsTick: item.absTick - index * slotTicks
    };
  }

  function completedTupletEntries(tuplet, groupId, startAbsTick, entries) {
    const normalized = normalizeTuplet(tuplet);
    if (!normalized || !groupId || !Number.isFinite(startAbsTick)) return cleanedTupletEntries(entries);
    const nextEntries = cleanedTupletEntries(entries).map((entry) => {
      delete entry.hiddenTupletReserve;
      return entry;
    });
    const occupied = new Set();
    nextEntries.forEach((entry) => {
      const { start, end } = tupletEntrySlots(entry);
      for (let slot = start; slot < end; slot += 1) occupied.add(slot);
    });

    let cursor = 0;
    while (cursor < normalized.actual) {
      if (occupied.has(cursor)) {
        cursor += 1;
        continue;
      }
      let end = cursor + 1;
      while (end < normalized.actual && !occupied.has(end)) end += 1;
      nextEntries.push(...fillTupletGapSlots(normalized, groupId, cursor, end, startAbsTick));
      cursor = end;
    }
    return cleanedTupletEntries(nextEntries);
  }

  function reservedTupletEntries(tuplet, groupId, startAbsTick, entries, visibleThroughIndex = -1) {
    const normalized = normalizeTuplet(tuplet);
    if (!normalized || !groupId || !Number.isFinite(startAbsTick)) return cleanedTupletEntries(entries);
    const nextEntries = cleanedTupletEntries(entries);
    const occupied = new Set();
    nextEntries.forEach((entry) => {
      const { start, end } = tupletEntrySlots(entry);
      for (let slot = start; slot < end; slot += 1) occupied.add(slot);
    });

    let cursor = 0;
    while (cursor < normalized.actual) {
      if (occupied.has(cursor)) {
        cursor += 1;
        continue;
      }
      const hidden = cursor > visibleThroughIndex;
      let end = cursor + 1;
      while (end < normalized.actual && !occupied.has(end) && (end > visibleThroughIndex) === hidden) end += 1;
      nextEntries.push(...fillTupletGapSlots(normalized, groupId, cursor, end, startAbsTick, { hidden }));
      cursor = end;
    }
    return cleanedTupletEntries(nextEntries);
  }

  function isTupletWritingOpen() {
    const run = state.activeTupletRun;
    return !!run?.id && run.remaining > 0 && !!normalizeTuplet(run || state.activeTuplet);
  }

  function completeTupletGroupsInMeasure(measureIndex) {
    if (!Number.isFinite(measureIndex)) return false;
    let changed = false;
    const ids = new Set(
      flattenScoreEntries()
        .filter((item) => measureIndexAndTickFromAbsolute(item.absTick).measureIndex === measureIndex && item.entry?.tuplet?.id)
        .map((item) => item.entry.tuplet.id)
    );

    ids.forEach((id) => {
      const groupItems = flattenScoreEntries()
        .filter((item) => item.entry?.tuplet?.id === id)
        .sort((a, b) => (Number(a.entry.tuplet?.index) || 0) - (Number(b.entry.tuplet?.index) || 0));
      if (!groupItems.length) return;
      const run = tupleGroupRunFromEntry(groupItems[0]);
      const tuplet = normalizeTuplet(run);
      const groupTicks = tupletGroupTicks(tuplet);
      if (!run || !tuplet || !groupTicks || measureIndexAndTickFromAbsolute(run.startAbsTick).measureIndex !== measureIndex) return;

      const groupStart = run.startAbsTick;
      const groupEnd = groupStart + groupTicks;
      const overlappingNonTuplet = flattenScoreEntries().some((item) => {
        if (item.entry?.tuplet?.id === id) return false;
        if (entryVoice(item.entry) !== Number(run.voice || 1)) return false;
        const itemEnd = item.absTick + item.entry.ticks;
        return itemEnd > groupStart + EPSILON && item.absTick < groupEnd - EPSILON;
      });

      const nextEntries = completedTupletEntries(tuplet, run.id, run.startAbsTick, groupItems.map((item) => item.entry));
      const hasGaps = nextEntries.length !== groupItems.length;

      if (hasGaps || overlappingNonTuplet || nextEntries.length !== groupItems.length) {
        changed = rewriteTupletGroup(run, nextEntries) || changed;
      }
    });

    if (changed) forceScoreSpacingRefresh();
    return changed;
  }

  function tupletGroupEntriesWithReplacement(run, replacement = null) {
    const current = tupletRunEntries(run).map(({ entry }) => entry);
    const kept = replacement
      ? current.filter((entry) => !tupletEntriesOverlap(entry, replacement))
      : current;
    return replacement ? [...kept, replacement] : kept;
  }

  function fillTupletGapSlots(tuplet, groupId, startIndex, endIndex, startAbsTick, options = {}) {
    const normalized = normalizeTuplet(tuplet);
    const slotTicks = tupletSlotTicks(normalized);
    if (!normalized || !slotTicks || endIndex <= startIndex) return false;
    const rests = [];
    let cursor = startIndex;
    while (cursor < endIndex) {
      const span = Math.min(endIndex - cursor, normalized.actual - cursor);
      const absoluteTick = startAbsTick + cursor * slotTicks;
      const rest = insertTupletRestSpan(normalized, groupId, cursor, span, absoluteTick);
      if (rest) {
        if (options.hidden) rest.hiddenTupletReserve = true;
        rests.push(rest);
      }
      cursor += span;
    }
    return rests;
  }

  function tupletGapRestsBeforeIndex(info) {
    if (!info || info.index <= 0) return [];
    const run = state.activeTupletRun;
    if (!run?.id || run.id !== info.groupId) return [];
    const occupied = occupiedTupletSlots(run);
    const rests = [];
    let cursor = 0;
    while (cursor < info.index) {
      if (occupied.has(cursor)) {
        cursor += 1;
        continue;
      }
      let end = cursor + 1;
      while (end < info.index && !occupied.has(end)) end += 1;
      rests.push(...fillTupletGapSlots(info.tuplet, info.groupId, cursor, end, info.startAbsTick));
      cursor = end;
    }
    return rests;
  }

  function completeActiveTupletRun(options = {}) {
    const run = state.activeTupletRun;
    const tuplet = normalizeTuplet(run || state.activeTuplet);
    if (!run?.id || !tuplet || run.remaining <= 0) return false;
    const existingEntries = tupletRunEntries(run);
    if (!existingEntries.length) {
      state.activeTupletRun = null;
      return false;
    }
    if (options.saveHistory !== false) saveHistory();
    const nextEntries = existingEntries.map(({ entry }) => entry);
    const changed = rewriteTupletGroup(
      run,
      completedTupletEntries(tuplet, run.id, run.startAbsTick, nextEntries)
    );
    state.activeTuplet = null;
    state.activeTupletRun = null;
    if (changed) forceScoreSpacingRefresh();
    return changed;
  }

  function forceScoreSpacingRefresh() {
    state.measures.forEach((measure, measureIndex) => {
      measure.entries.sort((a, b) => a.tickStart - b.tickStart);
      normalizeMeasure(measure, measureIndex);
    });
  }

  function deactivateTupletWriting() {
    completeActiveTupletRun({ saveHistory: false });
    state.activeTuplet = null;
    state.activeTupletRun = null;
  }

  function closePaletteDrawer() {
    if (!durationDrawer) return;
    durationDrawer.classList.add("is-hidden");
    delete durationDrawer.dataset.activePalette;
    delete document.documentElement.dataset.editorPalette;
    paletteTriggers.forEach((button) => {
      button.classList.remove("is-active");
      button.setAttribute("aria-expanded", "false");
    });
  }

  function makeRestEntries(ticks, profile = activeMeterProfile()) {
    return makeRestEntriesForRange(0, ticks, profile);
  }

  function makeRestEntriesForRange(tickStart, ticks, profile = activeMeterProfile()) {
    const rests = [];
    let remaining = ticks;
    let cursor = tickStart;
    const meterProfile = normalizeMeter(profile);
    const restCandidates = () => durations
      .flatMap((duration) => [
        { duration, ticks: duration.ticks, dotted: false, dots: 0 },
        { duration, ticks: duration.ticks * 1.5, dotted: true, dots: 1 },
        { duration, ticks: duration.ticks * 1.75, dotted: true, dots: 2 }
      ])
      .filter((item) => item.ticks > EPSILON)
      .sort((a, b) => b.ticks - a.ticks);
    const nextMetricBoundary = () => {
      const boundaries = meterBoundaryCandidates(cursor, cursor + remaining + EPSILON, meterProfile);
      return boundaries.find((boundary) => boundary > cursor + EPSILON && boundary < cursor + remaining + EPSILON) || null;
    };
    const chooseRestDuration = () => {
      const measureTick = measureTickAt(cursor, meterProfile);
      if (remaining >= meterProfile.measureTicks - EPSILON && Math.abs(measureTick) < EPSILON) {
        return { duration: durationById("whole"), ticks: meterProfile.measureTicks, dotted: false, dots: 0, isMeasureRest: true };
      }
      const boundary = nextMetricBoundary();
      const maxTicks = boundary ? boundary - cursor : remaining;
      const candidate = restCandidates().find((item) => item.ticks <= maxTicks + EPSILON);
      return candidate || {
        duration: durationById("one-twenty-eighth"),
        ticks: Math.min(remaining, MIN_DURATION_TICKS),
        dotted: false,
        dots: 0
      };
    };
    while (remaining > EPSILON) {
      const info = chooseRestDuration();
      const duration = info.duration;
      if (!duration) break;
      const rest = makeEntry("rest", duration, 0, null);
      rest.ticks = info.ticks;
      rest.dotted = info.dotted;
      rest.dots = info.dots;
      rest.tickStart = cursor;
      if (info.isMeasureRest) {
        rest.isMeasureRest = true;
      }
      rests.push(rest);
      remaining = Math.max(0, remaining - rest.ticks);
      cursor += rest.ticks;
    }
    return rests;
  }

  function isMeasureBoundaryTick(absoluteTick) {
    return Rhythm.isMeasureBoundaryTick(absoluteTick, activeMeterProfile());
  }

  function isStrongBeatBoundaryTick(absoluteTick) {
    return Rhythm.isStrongBeatBoundaryTick(absoluteTick, activeMeterProfile());
  }

  function startsOnBeat(absoluteTick) {
    return Rhythm.startsOnBeat(absoluteTick, activeMeterProfile());
  }

  function startsOnDivision(absoluteTick) {
    return Rhythm.startsOnDivision(absoluteTick, activeMeterProfile());
  }

  function usesSubdivisionSpelling(startTick, endTick) {
    return Rhythm.usesSubdivisionSpelling(startTick, endTick, activeMeterProfile());
  }

  function shouldSplitAtRhythmicBoundary(startTick, endTick, boundaryTick) {
    return Rhythm.shouldSplitAtRhythmicBoundary(startTick, endTick, boundaryTick, activeMeterProfile());
  }

  function rhythmicSplitBoundaries(startTick, endTick) {
    return Rhythm.rhythmicSplitBoundaries(startTick, endTick, activeMeterProfile());
  }

  function copyEntryPitchData(source, target, includeAccidentals) {
    if (source.type === "rest" || target.type === "rest") return;
    target.staffStep = source.staffStep;
    if (Array.isArray(source.chordSteps)) target.chordSteps = [...source.chordSteps];
    else delete target.chordSteps;
    if (Number.isFinite(source.diatonicStep)) target.diatonicStep = source.diatonicStep;
    else delete target.diatonicStep;
    if (Array.isArray(source.chordDiatonicSteps)) target.chordDiatonicSteps = [...source.chordDiatonicSteps];
    else delete target.chordDiatonicSteps;
    if (Number.isFinite(source.tieDiatonicStep)) target.tieDiatonicStep = source.tieDiatonicStep;
    else delete target.tieDiatonicStep;
    if (includeAccidentals) {
      target.accidental = source.accidental || null;
      if (source.accidentalsByStep) target.accidentalsByStep = { ...source.accidentalsByStep };
      else delete target.accidentalsByStep;
      if (source.accidentalsByDiatonicStep) target.accidentalsByDiatonicStep = { ...source.accidentalsByDiatonicStep };
      else delete target.accidentalsByDiatonicStep;
    } else {
      target.accidental = null;
      delete target.accidentalsByStep;
      delete target.accidentalsByDiatonicStep;
    }
  }

  function tieStepForEntry(entry) {
    if (Number.isFinite(entry.tieStaffStep)) return nearestEntryStaffStep(entry, entry.tieStaffStep);
    return entry.type === "note" ? entryStaffStep(entry) : null;
  }

  function makeRhythmicSegment(sourceEntry, ticks, index, totalSegments, targetEntry = null) {
    const info = durationInfoByTicks(ticks);
    if (!info) return null;
    const isFirst = index === 0;
    const isLast = index === totalSegments - 1;
    const segment = targetEntry || makeEntry(sourceEntry.type, info.duration, entryStaffStep(sourceEntry), null);
    setEntryDuration(segment, info.duration);
    segment.dotted = info.dotted;
    segment.dots = info.dots || (info.dotted ? 1 : 0);
    if (sourceEntry.explicitRest) segment.explicitRest = true;
    if (sourceEntry.forceDuration) segment.forceDuration = true;
    segment.ticks = ticks;
    segment.manualStemDirection = sourceEntry.manualStemDirection;
    setEntryVoice(segment, entryVoice(sourceEntry));
    if (sourceEntry.color) segment.color = sourceEntry.color;
    else delete segment.color;
    if (sourceEntry.noteColors) segment.noteColors = { ...sourceEntry.noteColors };
    else delete segment.noteColors;
    if (sourceEntry.noteheadGlyphName) segment.noteheadGlyphName = sourceEntry.noteheadGlyphName;
    else delete segment.noteheadGlyphName;
    if (sourceEntry.noteheadsByStep) segment.noteheadsByStep = { ...sourceEntry.noteheadsByStep };
    else delete segment.noteheadsByStep;
    if (sourceEntry.type === "note") {
      copyEntryPitchData(sourceEntry, segment, isFirst);
      segment.tieToNext = !isLast || sourceEntry.tieToNext === true;
      segment.tieStaffStep = segment.tieToNext ? tieStepForEntry(sourceEntry) : null;
    }
    return segment;
  }

  function splitEntryRhythmically(entry, absoluteStart) {
    if (entry.tuplet) return [{ absoluteStart, entry, changed: false }];
    const absoluteEnd = absoluteStart + entry.ticks;
    const boundaries = rhythmicSplitBoundaries(absoluteStart, absoluteEnd)
      .filter((boundary) => entry.forceDuration !== true || isMeasureBoundaryTick(boundary));
    if (!boundaries.length && (entry.forceDuration === true || durationInfoByTicks(entry.ticks))) {
      return [{ absoluteStart, entry, changed: false }];
    }
    const sourceEntry = JSON.parse(JSON.stringify(entry));
    const points = [absoluteStart, ...boundaries, absoluteEnd];
    const segmentPlan = [];
    const candidates = durations
      .flatMap((duration) => [duration.ticks, duration.ticks * 1.5, duration.ticks * 1.75])
      .filter((ticks, index, values) => ticks > EPSILON && values.indexOf(ticks) === index)
      .sort((a, b) => b - a);
    const splitTicksIntoWritableDurations = (ticks) => {
      if (durationInfoByTicks(ticks)) return [ticks];
      const result = [];
      let remaining = ticks;
      let guard = 0;
      while (remaining > EPSILON && guard < 128) {
        const next = candidates.find((candidate) => candidate <= remaining + EPSILON);
        if (!next) return null;
        result.push(next);
        remaining -= next;
        guard += 1;
      }
      return remaining <= EPSILON ? result : null;
    };
    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const ticks = points[index + 1] - start;
      const parts = splitTicksIntoWritableDurations(ticks);
      if (!parts?.length) return [{ absoluteStart, entry, changed: false }];
      let segmentStart = start;
      parts.forEach((partTicks) => {
        segmentPlan.push({ absoluteStart: segmentStart, ticks: partTicks });
        segmentStart += partTicks;
      });
    }
    const segments = [];
    for (let index = 0; index < segmentPlan.length; index += 1) {
      const segmentPlanItem = segmentPlan[index];
      const segment = makeRhythmicSegment(
        sourceEntry,
        segmentPlanItem.ticks,
        index,
        segmentPlan.length,
        index === 0 ? entry : null
      );
      if (!segment) return [{ absoluteStart, entry, changed: false }];
      segments.push({ absoluteStart: segmentPlanItem.absoluteStart, entry: segment, changed: true });
    }
    return segments;
  }

  function normalizeRhythmicSpelling() {
    const segments = [];
    let changed = false;

    state.measures.forEach((measure, measureIndex) => {
      measure.entries.forEach((entry) => {
        const absoluteStart = measureStartAbsoluteTick(measureIndex) + entry.tickStart;
        const entrySegments = splitEntryRhythmically(entry, absoluteStart);
        const mappedStart = measureIndexAndTickFromAbsolute(absoluteStart);
        if (
          mappedStart.measureIndex !== measureIndex ||
          Math.abs(mappedStart.tick - entry.tickStart) > EPSILON
        ) {
          changed = true;
        }
        if (entrySegments.length !== 1 || entrySegments[0].entry !== entry || entrySegments[0].changed) {
          changed = true;
        }
        segments.push(...entrySegments);
      });
    });

    if (!changed) return false;

    const maxMeasureIndex = Math.max(
      state.measures.length - 1,
      ...segments.map((segment) => measureIndexAndTickFromAbsolute(segment.absoluteStart).measureIndex)
    );
    const metersByIndex = state.measures.map((measure) => measure?.meter || null);
    const keySignaturesByIndex = state.measures.map((measure) => measure?.keySignature || null);
    const hiddenByIndex = state.measures.map((measure) => measure?.hidden === true);
    const nextMeasures = Array.from({ length: maxMeasureIndex + 1 }, (_, index) => {
      const measure = metersByIndex[index] ? { meter: { ...metersByIndex[index] }, entries: [] } : { entries: [] };
      if (keySignaturesByIndex[index]) measure.keySignature = { ...keySignaturesByIndex[index] };
      if (hiddenByIndex[index]) measure.hidden = true;
      return measure;
    });
    segments
      .sort((a, b) => a.absoluteStart - b.absoluteStart)
      .forEach((segment) => {
        const target = measureIndexAndTickFromAbsolute(segment.absoluteStart);
        const measureIndex = target.measureIndex;
        segment.entry.tickStart = target.tick;
        nextMeasures[measureIndex].entries.push(segment.entry);
      });

    nextMeasures.forEach((measure, measureIndex) => {
      measure.entries.sort((a, b) => a.tickStart - b.tickStart);
      normalizeMeasure(measure, measureIndex);
      if (!measure.entries.length) measure.entries.push(makeMeasureRest(measureTicksForIndex(measureIndex)));
    });
    state.measures = nextMeasures;
    const systems = Array.isArray(state.systems) ? state.systems : null;
    if (systems?.[renderSystemIndex]) systems[renderSystemIndex].measures = nextMeasures;
    return true;
  }

  function isInsideTernaryPulseGroup(absoluteStart, absoluteEnd, profile = activeMeterProfile()) {
    if (!profile?.pulseGroups?.some((group) => group === 3)) return false;
    const measureIndex = Math.floor(absoluteStart / profile.measureTicks);
    const measureStart = measureIndex * profile.measureTicks;
    if (Math.floor((absoluteEnd - EPSILON) / profile.measureTicks) !== measureIndex) return false;
    const localStart = absoluteStart - measureStart;
    const localEnd = absoluteEnd - measureStart;
    let cursor = 0;
    return profile.pulseGroups.some((group) => {
      const groupStart = cursor;
      const groupEnd = cursor + group * profile.unitTicks;
      cursor = groupEnd;
      return group === 3 &&
        localStart >= groupStart - EPSILON &&
        localEnd <= groupEnd + EPSILON;
    });
  }

  function entriesAreSameSingleTiedPitch(source, target) {
    if (!source || !target || source.type !== "note" || target.type !== "note") return false;
    const sourceSteps = entryStaffSteps(source);
    const targetSteps = entryStaffSteps(target);
    if (sourceSteps.length !== 1 || targetSteps.length !== 1) return false;
    const tieStep = tieStepForEntry(source);
    return Number.isFinite(tieStep) &&
      Math.abs(sourceSteps[0] - tieStep) < EPSILON &&
      Math.abs(targetSteps[0] - tieStep) < EPSILON;
  }

  function remapEntryReference(oldId, newId) {
    if (!oldId || !newId || oldId === newId) return;
    if (state.cursorEntryId === oldId) state.cursorEntryId = newId;
    if (state.activeNoteEntryId === oldId) state.activeNoteEntryId = newId;
    if (state.pendingTieEntryId === oldId) state.pendingTieEntryId = newId;
    if (state.cursorPitchAnchorEntryId === oldId) state.cursorPitchAnchorEntryId = newId;
    state.selectedEntryIds = state.selectedEntryIds.map((id) => (id === oldId ? newId : id));
    state.selectedNoteRefs = state.selectedNoteRefs.map((ref) => (
      ref?.entryId === oldId ? { ...ref, entryId: newId } : ref
    ));
    state.marks.forEach((mark) => {
      if (mark.entryId === oldId) mark.entryId = newId;
      if (mark.endEntryId === oldId) mark.endEntryId = newId;
    });
  }

  function normalizeTernaryTiedUnitPairs() {
    const profile = activeMeterProfile();
    if (!profile?.pulseGroups?.some((group) => group === 3)) return false;
    const combinedInfo = durationInfoByTicks(profile.unitTicks * 2);
    if (!combinedInfo?.duration) return false;
    let changed = false;

    state.measures.forEach((measure, measureIndex) => {
      const secondaryEntries = measureSecondaryEntries(measure);
      const workingEntries = measurePrimaryEntries(measure);
      const nextEntries = [];
      for (let index = 0; index < workingEntries.length; index += 1) {
        const entry = workingEntries[index];
        const next = workingEntries[index + 1];
        const absoluteStart = measureIndex * profile.measureTicks + entry.tickStart;
        const absoluteEnd = absoluteStart + entry.ticks + (next?.ticks || 0);
        const shouldMerge = !!next &&
          Math.abs(next.tickStart - (entry.tickStart + entry.ticks)) < EPSILON &&
          !entry.tuplet &&
          !next.tuplet &&
          entry.tieToNext === true &&
          Math.abs(entry.ticks - profile.unitTicks) < EPSILON &&
          Math.abs(next.ticks - profile.unitTicks) < EPSILON &&
          entriesAreSameSingleTiedPitch(entry, next) &&
          isInsideTernaryPulseGroup(absoluteStart, absoluteEnd, profile);

        if (!shouldMerge) {
          nextEntries.push(entry);
          continue;
        }

        const continuedTie = next.tieToNext === true;
        const continuedTieStep = continuedTie ? tieStepForEntry(next) : null;
        setEntryDuration(entry, combinedInfo.duration);
        entry.ticks = profile.unitTicks * 2;
        entry.dotted = combinedInfo.dotted;
        entry.dots = combinedInfo.dots || (combinedInfo.dotted ? 1 : 0);
        entry.tieToNext = continuedTie;
        entry.tieStaffStep = continuedTie ? continuedTieStep : null;
        remapEntryReference(next.id, entry.id);
        nextEntries.push(entry);
        index += 1;
        changed = true;
      }
      measure.entries = [...nextEntries, ...secondaryEntries].sort((a, b) => (
        a.tickStart - b.tickStart || entryVoice(a) - entryVoice(b)
      ));
    });

    return changed;
  }

  function setEntryDuration(entry, duration) {
    Writing.setEntryDuration(entry, duration, clearTupletMetadata);
  }

  function selectedEntryLocation() {
    if (!state.cursorEntryId) return null;
    for (let measureIndex = 0; measureIndex < state.measures.length; measureIndex += 1) {
      const entryIndex = state.measures[measureIndex].entries.findIndex((entry) => entry.id === state.cursorEntryId);
      if (entryIndex !== -1) {
        const entry = state.measures[measureIndex].entries[entryIndex];
        return { measureIndex, entryIndex, entry };
      }
    }
    state.cursorEntryId = null;
    return null;
  }

  function selectedEntryLocations() {
    const ids = state.selectedEntryIds.length
      ? state.selectedEntryIds
      : state.cursorEntryId
        ? [state.cursorEntryId]
        : [];
    const wanted = new Set(ids);
    const locations = [];
    state.measures.forEach((measure, measureIndex) => {
      measure.entries.forEach((entry, entryIndex) => {
        if (wanted.has(entry.id)) {
          locations.push({ measureIndex, entryIndex, entry });
        }
      });
    });
    return locations.sort((a, b) => (
      a.measureIndex - b.measureIndex || a.entry.tickStart - b.entry.tickStart || a.entryIndex - b.entryIndex
    ));
  }

  function measureStartAbsoluteTick(measureIndex) {
    let tick = 0;
    for (let index = 0; index < Math.max(0, measureIndex); index += 1) {
      tick += measureTicksForIndex(index);
    }
    return tick;
  }

  function measureIndexAndTickFromAbsolute(absoluteTick) {
    const safeTick = Math.max(0, Number(absoluteTick) || 0);
    let cursor = 0;
    for (let measureIndex = 0; measureIndex < state.measures.length; measureIndex += 1) {
      const ticks = measureTicksForIndex(measureIndex);
      if (safeTick < cursor + ticks - EPSILON) {
        return { measureIndex, tick: safeTick - cursor };
      }
      cursor += ticks;
    }
    const measureIndex = Math.max(0, state.measures.length - 1);
    return { measureIndex, tick: Math.min(measureTicksForIndex(measureIndex), safeTick - cursor + measureTicksForIndex(measureIndex)) };
  }

  function absoluteTickForLocation(location) {
    if (!location?.entry) return null;
    return measureStartAbsoluteTick(location.measureIndex) + location.entry.tickStart;
  }

  function absoluteTickForEntry(entryId) {
    const location = entryLocationById(entryId);
    return location ? absoluteTickForLocation(location) : null;
  }

  function entryEndAbsoluteTick(location) {
    const start = absoluteTickForLocation(location);
    return start === null ? null : start + location.entry.ticks;
  }

  function selectedRhythmicRange() {
    const locations = selectedEntryLocations();
    const noteLocations = selectedNoteLocations();
    const noteEntryIds = new Set(noteLocations.map((location) => location.entry.id));
    const combined = [
      ...locations,
      ...noteLocations.filter((location) => !locations.some((entryLocation) => entryLocation.entry.id === location.entry.id))
    ].filter((location) => location.entry && !isMeasureRestEntry(location.entry));

    if (!combined.length) return null;
    const start = Math.min(...combined.map((location) => absoluteTickForLocation(location)));
    const end = Math.max(...combined.map((location) => entryEndAbsoluteTick(location)));
    return { start, end, ticks: end - start, locations: combined };
  }

  function flatEntryLocations() {
    return state.measures.flatMap((measure, measureIndex) => (
      measure.entries.map((entry, entryIndex) => ({ measureIndex, entryIndex, entry }))
    ));
  }

  function firstEntryLocation() {
    return flatEntryLocations()[0] || null;
  }

  function lastEntryLocation() {
    return flatEntryLocations().at(-1) || null;
  }

  function setCursorAfterEntryLocation(location) {
    if (!location?.entry) return false;
    const previousMeasureIndex = state.cursorMeasure;
    state.cursorMeasure = location.measureIndex;
    state.cursorTick = location.entry.tickStart + location.entry.ticks;
    state.cursorActive = true;
    state.entryCursorActive = false;
    finalizeMeasureOnExit(previousMeasureIndex, state.cursorMeasure);
    return true;
  }

  function firstWritableCursorLocation() {
    const voice = activeVoice();
    for (let measureIndex = 0; measureIndex < state.measures.length; measureIndex += 1) {
      const measure = state.measures[measureIndex];
      if (!measure) continue;
      const voiceEntries = measureVoiceEntries(measure, voice);
      if (voice === 2 && !voiceEntries.length) return { measureIndex, tick: 0 };
      if (voice === 1 && isEmptyMeasure(measure, measureIndex)) return { measureIndex, tick: 0 };
      const restEntry = voiceEntries.find((entry) => entry.type === "rest" && entry.ticks > EPSILON);
      if (restEntry) return { measureIndex, tick: restEntry.tickStart };
      const used = measureUsed(measure, voice);
      if (used < measureTicksForIndex(measureIndex) - EPSILON) return { measureIndex, tick: used };
    }
    const measureIndex = state.measures.length;
    ensureMeasure(measureIndex);
    return { measureIndex, tick: 0 };
  }

  function enterFigureWritingMode() {
    return startNoteInput({ preferFirstWritable: true });
  }

  function finalizeMeasureOnExit(previousMeasureIndex, nextMeasureIndex) {
    if (!Number.isFinite(previousMeasureIndex) || previousMeasureIndex === nextMeasureIndex) return false;
    const measure = state.measures[previousMeasureIndex];
    if (!measure) return false;
    let changed = false;
    const activeRunMeasure = state.activeTupletRun
      ? measureIndexAndTickFromAbsolute(state.activeTupletRun.startAbsTick).measureIndex
      : null;
    if (activeRunMeasure === previousMeasureIndex) {
      changed = completeActiveTupletRun({ saveHistory: false }) || changed;
    }
    changed = completeTupletGroupsInMeasure(previousMeasureIndex) || changed;
    changed = completeMeasureWithRests(previousMeasureIndex, { saveHistory: false }) || changed;
    normalizeMeasure(state.measures[previousMeasureIndex], previousMeasureIndex);
    forceScoreSpacingRefresh();
    return changed;
  }

  function setCursorFromAbsoluteTick(absoluteTick) {
    const previousMeasureIndex = state.cursorMeasure;
    const safeTick = Math.max(0, absoluteTick);
    const target = measureIndexAndTickFromAbsolute(safeTick);
    state.cursorMeasure = target.measureIndex;
    state.cursorTick = target.tick;
    ensureMeasure(state.cursorMeasure);
    syncActiveMeterToCursor();
    finalizeMeasureOnExit(previousMeasureIndex, state.cursorMeasure);
  }

  function cursorAbsoluteTick() {
    return measureStartAbsoluteTick(state.cursorMeasure) + state.cursorTick;
  }

  function absoluteTickForMark(mark) {
    return measureStartAbsoluteTick(Number(mark?.measureIndex) || 0) + (Number(mark?.tick) || 0);
  }

  function clefMarksSorted() {
    return (state.marks || [])
      .filter((mark) => mark?.type === "clef" && mark.clefId && markSystemIndex(mark) === contextSystemIndex())
      .sort((a, b) => absoluteTickForMark(a) - absoluteTickForMark(b));
  }

  function markSystemIndex(mark) {
    return Marks.systemIndex(mark, systemCount());
  }

  function markIsSystemLocal(mark) {
    return Marks.isSystemLocal(mark);
  }

  function markBelongsToRenderSystem(mark) {
    return Marks.belongsToRenderSystem(mark, renderSystemIndex, systemCount());
  }

  function sameScoreAnchor(a, b) {
    return Number(a?.measureIndex) === Number(b?.measureIndex) &&
      Math.abs((Number(a?.tick) || 0) - (Number(b?.tick) || 0)) < EPSILON;
  }

  function clefIdAtAbsoluteTick(absoluteTick) {
    let clefId = initialClefIdForSystem(contextSystemIndex());
    clefMarksSorted().forEach((mark) => {
      if (absoluteTickForMark(mark) <= absoluteTick + EPSILON) clefId = mark.clefId || DEFAULT_CLEF_ID;
    });
    return clefId;
  }

  function initialClefIdForSystem(systemIndex = contextSystemIndex()) {
    const system = scoreSystems()[Math.max(0, Number(systemIndex) || 0)];
    if (systemIsPercussionLine(system)) return "clef-percussion";
    return clefProfile(system?.initialClefId)?.id || DEFAULT_CLEF_ID;
  }

  function initialClefId() {
    return clefIdAtAbsoluteTick(0);
  }

  function isInitialClefMark(mark) {
    return mark?.type === "clef" && markSystemIndex(mark) === contextSystemIndex() && absoluteTickForMark(mark) <= EPSILON;
  }

  function scoreEndTick() {
    return measureStartAbsoluteTick(state.measures.length);
  }

  function activeGridDuration() {
    const tuplet = normalizeTuplet(state.activeTuplet);
    return Writing.activeGridDuration({
      activeTuplet: tuplet,
      gridDurationId: state.gridDurationId,
      durationById,
      defaultGridDurationId: DEFAULT_GRID_DURATION_ID,
      durations,
      tupletUnitTicks
    });
  }

  function gridStepTicks() {
    return Math.max(MIN_DURATION_TICKS, activeGridDuration()?.ticks || pulseTicks());
  }

  function ensureMeasureForAbsoluteTick(absoluteTick) {
    const safeTick = Math.max(0, Number(absoluteTick) || 0);
    let guard = 0;
    while (safeTick >= measureStartAbsoluteTick(state.measures.length) - EPSILON && guard < 256) {
      ensureMeasure(state.measures.length);
      guard += 1;
    }
  }

  function nextGridAbsoluteTickAfter(absoluteTick) {
    ensureMeasureForAbsoluteTick(absoluteTick);
    const location = measureIndexAndTickFromAbsolute(absoluteTick);
    const measureLength = measureTicksForIndex(location.measureIndex);
    const step = gridStepTicks();
    const nextLocalTick = (Math.floor((location.tick + EPSILON) / step) + 1) * step;
    if (nextLocalTick >= measureLength - EPSILON) {
      return measureStartAbsoluteTick(location.measureIndex + 1);
    }
    return measureStartAbsoluteTick(location.measureIndex) + nextLocalTick;
  }

  function entryOccupiesWritingGrid(entry) {
    if (!entry || entry.hiddenTupletReserve) return false;
    return entry.type === "note";
  }

  function voiceHasWrittenFigureAtAbsoluteTick(absoluteTick, voice = activeVoice()) {
    ensureMeasureForAbsoluteTick(absoluteTick);
    const location = measureIndexAndTickFromAbsolute(absoluteTick);
    const measure = state.measures[location.measureIndex];
    if (!measure) return false;
    const tick = Number(location.tick) || 0;
    return (measure.entries || []).some((entry) => (
      entryVoice(entry) === voice &&
      entryOccupiesWritingGrid(entry) &&
      entry.tickStart <= tick + EPSILON &&
      tick < entry.tickStart + entry.ticks - EPSILON
    ));
  }

  function nextEmptyGridAbsoluteTick(absoluteTick, voice = activeVoice()) {
    let candidate = nextGridAbsoluteTickAfter(absoluteTick);
    const maxSteps = Math.max(64, state.measures.length * Math.ceil(measureTicksForIndex(0) / gridStepTicks() + 1));
    for (let stepIndex = 0; stepIndex < maxSteps; stepIndex += 1) {
      ensureMeasureForAbsoluteTick(candidate);
      if (!voiceHasWrittenFigureAtAbsoluteTick(candidate, voice)) return candidate;
      candidate = nextGridAbsoluteTickAfter(candidate);
    }
    return candidate;
  }

  function nextWritingGridAbsoluteTickAfterEntry(absoluteTick, entry, voice = activeVoice()) {
    const entryEnd = Math.max(Number(absoluteTick) || 0, (Number(absoluteTick) || 0) + Math.max(0, Number(entry?.ticks) || 0));
    let candidate = nextGridAbsoluteTickAfter(absoluteTick);
    while (candidate < entryEnd - EPSILON) {
      candidate = nextGridAbsoluteTickAfter(candidate);
    }
    const maxSteps = Math.max(64, state.measures.length * Math.ceil(measureTicksForIndex(0) / gridStepTicks() + 1));
    for (let stepIndex = 0; stepIndex < maxSteps; stepIndex += 1) {
      ensureMeasureForAbsoluteTick(candidate);
      if (!voiceHasWrittenFigureAtAbsoluteTick(candidate, voice)) return candidate;
      candidate = nextGridAbsoluteTickAfter(candidate);
    }
    return candidate;
  }

  function setGridDuration(durationId) {
    const duration = durationById(durationId) || durationById(DEFAULT_GRID_DURATION_ID);
    state.gridDurationId = duration?.id || DEFAULT_GRID_DURATION_ID;
    rhythmicColumnIndex.clear();
    if (gridDurationSelect) gridDurationSelect.value = state.gridDurationId;
    updateModeButtons();
  }

  function changeGridResolution(direction) {
    const ordered = [...durations].sort((a, b) => a.ticks - b.ticks);
    const currentIndex = Math.max(0, ordered.findIndex((duration) => duration.id === state.gridDurationId));
    const nextIndex = Math.max(0, Math.min(ordered.length - 1, currentIndex + (direction > 0 ? 1 : -1)));
    const nextDuration = ordered[nextIndex];
    if (!nextDuration || nextDuration.id === state.gridDurationId) return false;
    setGridDuration(nextDuration.id);
    renderMidiFigureStrip({ force: true });
    render();
    return true;
  }

  function moveCursorByActiveDuration(direction) {
    const pitchSnapshot = rememberFreeCursorPitch();
    clearEntrySelection();
    clearActiveNote();
    if (!pitchSnapshot.visible) hideCursorPitch();
    const step = gridStepTicks();
    const currentTick = cursorAbsoluteTick();
    const endTick = scoreEndTick();
    const desiredTick = currentTick + direction * step;
    if (direction > 0 && desiredTick > endTick + EPSILON) {
      state.cursorMeasure = state.measures.length - 1;
      state.cursorTick = measureTicksForIndex(state.cursorMeasure);
      state.cursorActive = true;
      state.entryCursorActive = false;
      restoreFreeCursorPitch(pitchSnapshot);
      render();
      requestAppendMeasuresAtEnd();
      return;
    }
    let nextTick = Math.max(0, Math.min(endTick, desiredTick));
    const run = state.activeTupletRun;
    const activeTuplet = normalizeTuplet(run || state.activeTuplet);
    if (run?.id && activeTuplet) {
      const groupStart = run.startAbsTick;
      const groupEnd = groupStart + tupletGroupTicks(activeTuplet);
      if (nextTick < groupStart - EPSILON || nextTick >= groupEnd - EPSILON) {
        completeActiveTupletRun();
        nextTick = Math.max(0, Math.min(scoreEndTick(), nextTick));
      }
    }
    if (nextTick >= scoreEndTick() - EPSILON) {
      const previousMeasureIndex = state.cursorMeasure;
      state.cursorMeasure = state.measures.length - 1;
      state.cursorTick = measureTicks();
      finalizeMeasureOnExit(previousMeasureIndex, state.cursorMeasure);
    } else {
      setCursorFromAbsoluteTick(nextTick);
    }
    state.cursorActive = true;
    state.entryCursorActive = false;
    restoreFreeCursorPitch(pitchSnapshot);
    render();
  }

  function clampCursorToWrittenBounds() {
    const first = firstEntryLocation();
    const last = lastEntryLocation();
    if (!first || !last) return;
    const minTick = absoluteTickForLocation(first);
    const maxTick = absoluteTickForLocation(last) + last.entry.ticks;
    const currentTick = cursorAbsoluteTick();
    if (currentTick < minTick) setCursorFromAbsoluteTick(minTick);
    if (currentTick > maxTick) setCursorFromAbsoluteTick(maxTick);
  }

  function selectedNoteRefs() {
    return Selection.uniqueNoteRefs(state.selectedNoteRefs);
  }

  function selectedNoteLocations() {
    return selectedNoteRefs()
      .map((ref) => {
        const location = entryLocationById(ref.entryId);
        if (!location?.entry || location.entry.type === "rest") return null;
        const staffStep = nearestEntryStaffStep(location.entry, ref.staffStep);
        return { ...location, staffStep };
      })
      .filter(Boolean)
      .sort((a, b) => (
        a.measureIndex - b.measureIndex ||
        a.entry.tickStart - b.entry.tickStart ||
        a.staffStep - b.staffStep
      ));
  }

  function isEntrySelected(entry) {
    return state.selectedEntryIds.includes(entry.id) ||
      (state.cursorEntryId === entry.id && !state.selectedNoteRefs.length);
  }

  function isNoteHeadSelected(entry, staffStep) {
    return Selection.noteHeadIsSelected({
      entryId: entry?.id,
      staffStep,
      selectedEntryIds: state.selectedEntryIds,
      selectedNoteRefs: state.selectedNoteRefs,
      epsilon: EPSILON
    });
  }

  function clearMeasureSelection() {
    state.selectedMeasureIndex = null;
  }

  function normalizeItemColor(value) {
    return ItemStyle.normalizeColor(value);
  }

  function normalizeItemOpacity(value, fallback = 1) {
    return ItemStyle.normalizeOpacity(value, fallback);
  }

  function entryNoteColor(entry, staffStep) {
    return entry?.noteColors?.[String(staffStep)] || entry?.color || "";
  }

  function setEntryNoteColor(entry, staffStep, color) {
    if (!entry || entry.type === "rest") return;
    if (!entry.noteColors) entry.noteColors = {};
    entry.noteColors[String(staffStep)] = color;
  }

  function clearEntryNoteColor(entry, staffStep) {
    if (!entry?.noteColors) return;
    delete entry.noteColors[String(staffStep)];
    if (!Object.keys(entry.noteColors).length) delete entry.noteColors;
  }

  function defaultNoteheadGlyphName(durationId) {
    if (durationId === "breve") return "noteheadDoubleWhole";
    if (durationId === "whole") return "noteheadWhole";
    if (durationId === "half") return "noteheadHalf";
    return "noteheadBlack";
  }

  function entryNoteheadGlyphName(entry, staffStep = null) {
    const fallback = defaultNoteheadGlyphName(entryDuration(entry).id);
    if (!entry || entry.type === "rest") return fallback;
    const stepKey = Number.isFinite(staffStep) ? String(nearestEntryStaffStep(entry, staffStep)) : null;
    const stepGlyph = stepKey ? entry.noteheadsByStep?.[stepKey] : null;
    if (isNoteheadGlyphAvailable(stepGlyph)) return stepGlyph;
    if (isNoteheadGlyphAvailable(entry.noteheadGlyphName)) return entry.noteheadGlyphName;
    return fallback;
  }

  function clearEntryNoteheadGlyph(entry, staffStep = null) {
    if (!entry || entry.type === "rest") return;
    if (Number.isFinite(staffStep)) {
      const key = String(nearestEntryStaffStep(entry, staffStep));
      if (entry.noteheadsByStep) {
        delete entry.noteheadsByStep[key];
        if (!Object.keys(entry.noteheadsByStep).length) delete entry.noteheadsByStep;
      }
      return;
    }
    delete entry.noteheadGlyphName;
    delete entry.noteheadsByStep;
  }

  function setEntryNoteheadGlyph(entry, glyphName, staffStep = null) {
    if (!entry || entry.type === "rest") return false;
    if (!glyphName) {
      clearEntryNoteheadGlyph(entry, staffStep);
      return true;
    }
    if (!isNoteheadGlyphAvailable(glyphName)) return false;
    if (Number.isFinite(staffStep)) {
      if (!entry.noteheadsByStep) entry.noteheadsByStep = {};
      entry.noteheadsByStep[String(nearestEntryStaffStep(entry, staffStep))] = glyphName;
    } else {
      entry.noteheadGlyphName = glyphName;
      delete entry.noteheadsByStep;
    }
    return true;
  }

  function selectedItemColor() {
    const textItem = selectedTextItems()[0];
    const mark = selectedMarks()[0];
    const note = selectedNoteLocations()[0];
    const entry = selectedEntryLocations()[0]?.entry;
    return ItemStyle.selectedColor({
      textItem,
      mark,
      note,
      entry,
      noteColor: note ? entryNoteColor(note.entry, note.staffStep) : null,
      fallback: state.textStyle.color || "#15120f"
    });
  }

  function hasSelectedItemsForColor() {
    return ItemStyle.hasSelection({
      notes: selectedNoteLocations(),
      entries: selectedEntryLocations(),
      marks: selectedMarks(),
      texts: selectedTextItems()
    });
  }

  function applySelectedItemColor(value) {
    const color = normalizeItemColor(value);
    const noteLocations = selectedNoteLocations();
    const entryLocations = noteLocations.length && !state.selectedEntryIds.length
      ? []
      : selectedEntryLocations();
    const marks = selectedMarks();
    const texts = selectedTextItems();
    if (!noteLocations.length && !entryLocations.length && !marks.length && !texts.length) return false;
    saveHistory();
    noteLocations.forEach(({ entry, staffStep }) => setEntryNoteColor(entry, staffStep, color));
    entryLocations.forEach(({ entry }) => {
      entry.color = color;
    });
    marks.forEach((mark) => {
      mark.color = color;
    });
    texts.forEach((item) => {
      item.style = { ...(item.style || {}), color };
    });
    state.textStyle = { ...state.textStyle, color };
    render();
    return true;
  }

  function selectedItemOpacity() {
    const textItem = selectedTextItems()[0];
    const mark = selectedMarks()[0];
    const entry = selectedEntryLocations()[0]?.entry;
    return ItemStyle.selectedOpacity({ textItem, mark, entry, fallback: 1 });
  }

  function applySelectedItemOpacity(value) {
    const opacity = normalizeItemOpacity(value, selectedItemOpacity());
    const noteLocations = selectedNoteLocations();
    const entryLocations = noteLocations.length && !state.selectedEntryIds.length
      ? []
      : selectedEntryLocations();
    const marks = selectedMarks();
    const texts = selectedTextItems();
    if (!noteLocations.length && !entryLocations.length && !marks.length && !texts.length) return false;
    saveHistory();
    entryLocations.forEach(({ entry }) => {
      entry.opacity = opacity;
    });
    noteLocations.forEach(({ entry }) => {
      entry.opacity = opacity;
    });
    marks.forEach((mark) => {
      mark.opacity = opacity;
    });
    texts.forEach((item) => {
      item.style = { ...(item.style || {}), opacity };
    });
    render();
    return true;
  }

  function allEntryLocations(options = {}) {
    const voiceFilter = Number(options.voice) === 2 ? 2 : Number(options.voice) === 1 ? 1 : null;
    const systemFilter = Number.isFinite(options.systemIndex) ? Number(options.systemIndex) : null;
    const typeFilter = options.type || null;
    return scoreSystems().flatMap((system, systemIndex) => {
      if (systemFilter !== null && systemIndex !== systemFilter) return [];
      return (system.measures || []).flatMap((measure, measureIndex) => (
        (measure.entries || []).map((entry, entryIndex) => ({
          system,
          systemIndex,
          measure,
          measureIndex,
          entry,
          entryIndex
        }))
      ));
    }).filter((location) => {
      if (!location.entry) return false;
      if (voiceFilter && entryVoice(location.entry) !== voiceFilter) return false;
      if (typeFilter && location.entry.type !== typeFilter) return false;
      return true;
    });
  }

  function noteNameForDiatonicStep(diatonicStep) {
    const names = ["C", "D", "E", "F", "G", "A", "B"];
    const index = ((Math.round(Number(diatonicStep) || 0) % 7) + 7) % 7;
    return names[index];
  }

  function noteColorTargetsByDiatonicClass(diatonicStep) {
    const diatonicClass = ((Math.round(Number(diatonicStep) || 0) % 7) + 7) % 7;
    return allEntryLocations({ type: "note" }).flatMap((location) => (
      entryStaffSteps(location.entry)
        .filter((staffStep) => {
          const step = entryDiatonicStepForStaffStep(location.entry, staffStep);
          const stepClass = ((Math.round(step) % 7) + 7) % 7;
          return stepClass === diatonicClass;
        })
        .map((staffStep) => ({ ...location, staffStep }))
    ));
  }

  function availableNoteheadGlyphNames() {
    return (SmuflData.SMUFL_NOTEHEAD_NAMES || [])
      .filter((name) => SmuflData.SMUFL_CODEPOINTS[name]);
  }

  function isNoteheadGlyphAvailable(glyphName) {
    return availableNoteheadGlyphNames().includes(glyphName);
  }

  function noteheadFamilyLabel(glyphName) {
    const name = String(glyphName || "");
    if (["noteheadBlack", "noteheadHalf", "noteheadWhole", "noteheadDoubleWhole"].includes(name)) return "Estándar";
    if (/Diamond/i.test(name)) return "Diamantes";
    if (/Triangle/i.test(name)) return "Triángulos";
    if (/Slash|Slashed/i.test(name)) return "Barras / slash";
    if (/Circle|Circled|Round/i.test(name)) return "Círculos / redondas";
    if (/\bX|WithX|VoidWithX|Plus/i.test(name.replace("notehead", ""))) return "X / plus";
    if (/Square|Moon|Cowell/i.test(name)) return "Especiales";
    return "Otras";
  }

  function noteheadGlyphLabel(glyphName) {
    const labels = {
      noteheadBlack: "Negra",
      noteheadHalf: "Blanca",
      noteheadWhole: "Redonda",
      noteheadDoubleWhole: "Cuadrada",
      noteheadXBlack: "X negra",
      noteheadXHalf: "X blanca",
      noteheadXWhole: "X redonda",
      noteheadDiamondBlack: "Diamante negro",
      noteheadDiamondHalf: "Diamante blanco",
      noteheadTriangleUpBlack: "Triángulo arriba negro",
      noteheadTriangleDownBlack: "Triángulo abajo negro",
      noteheadSlashVerticalEnds: "Slash vertical",
      noteheadSlashHorizontalEnds: "Slash horizontal"
    };
    if (labels[glyphName]) return labels[glyphName];
    return String(glyphName || "")
      .replace(/^notehead/, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\bBlack\b/g, "negra")
      .replace(/\bHalf\b/g, "blanca")
      .replace(/\bWhole\b/g, "redonda")
      .replace(/\bDouble\b/g, "doble")
      .trim();
  }

  function noteheadGlyphGroups() {
    const order = ["Estándar", "X / plus", "Diamantes", "Triángulos", "Barras / slash", "Círculos / redondas", "Especiales", "Otras"];
    const grouped = new Map(order.map((label) => [label, []]));
    availableNoteheadGlyphNames().forEach((glyphName) => {
      const family = noteheadFamilyLabel(glyphName);
      if (!grouped.has(family)) grouped.set(family, []);
      grouped.get(family).push(glyphName);
    });
    return order
      .filter((label) => grouped.get(label)?.length)
      .map((label) => [label, grouped.get(label)]);
  }

  function articulationFamilyLabel(glyphName) {
    const name = String(glyphName || "");
    if (/Fermata|Breath|Caesura/i.test(name)) return "Calderones, respiraciones y cesuras";
    if (/Ornament|Trill|Mordent|Turn|Tremblement|Shake|Schleifer/i.test(name)) return "Ornamentos";
    if (/UpBow|DownBow|Harmonic|String|Guitar|Brass|Wind/i.test(name)) return "Técnicas";
    return "Articulaciones";
  }

  function articulationPaletteGroups() {
    const order = ["Articulaciones", "Ornamentos", "Calderones, respiraciones y cesuras", "Técnicas"];
    const grouped = new Map(order.map((label) => [label, []]));
    palettes.articulations.forEach((item) => {
      const family = articulationFamilyLabel(item.glyphName);
      if (!grouped.has(family)) grouped.set(family, []);
      grouped.get(family).push(item);
    });
    return order
      .filter((label) => grouped.get(label)?.length)
      .map((label) => [label, grouped.get(label)]);
  }

  async function requestItemColor(title, current = selectedItemColor()) {
    return requestColorPicker({
      title,
      current
    });
  }

  async function requestItemOpacity(title, current = selectedItemOpacity()) {
    const currentPercent = Math.round(normalizeItemOpacity(current, 1) * 100);
    const value = await requestEditorPopup({
      title,
      initialValue: String(currentPercent),
      placeholder: "100",
      help: "Valor entre 5 y 100."
    });
    if (value === null) return null;
    return normalizeItemOpacity((Number(value) || currentPercent) / 100, currentPercent / 100);
  }

  async function requestEntryContextColor(location, scope = "entry") {
    if (!location?.entry) return false;
    const entry = location.entry;
    const staffStep = Number.isFinite(location.staffStep)
      ? nearestEntryStaffStep(entry, location.staffStep)
      : entryStaffStep(entry);
    const voice = entryVoice(entry);
    const current = entry.type === "note"
      ? entryNoteColor(entry, staffStep) || entry.color || selectedItemColor()
      : entry.color || selectedItemColor();
    const diatonicStep = entry.type === "note" ? entryDiatonicStepForStaffStep(entry, staffStep) : null;
    const noteName = entry.type === "note" ? noteNameForDiatonicStep(diatonicStep) : "";
    const titles = {
      note: `Color de esta nota${noteName ? ` (${noteName})` : ""}`,
      entry: entry.type === "rest" ? "Color de este silencio" : "Color de este acorde/figura",
      voice: `Color de toda la voz ${voice}`,
      pitch: `Color de todas las notas ${noteName}`,
      selected: "Color de la selección"
    };
    const color = await requestItemColor(titles[scope] || "Color", current);
    if (!color) return false;
    saveHistory();
    if (scope === "note" && entry.type === "note") {
      setEntryNoteColor(entry, staffStep, color);
    } else if (scope === "voice") {
      allEntryLocations({ systemIndex: location.systemIndex, voice }).forEach(({ entry: target }) => {
        target.color = color;
      });
    } else if (scope === "pitch" && entry.type === "note") {
      noteColorTargetsByDiatonicClass(diatonicStep).forEach((target) => {
        setEntryNoteColor(target.entry, target.staffStep, color);
      });
    } else if (scope === "selected") {
      applySelectedItemColor(color);
      return true;
    } else {
      entry.color = color;
    }
    render();
    return true;
  }

  async function requestEntryContextOpacity(location, scope = "entry") {
    if (!location?.entry) return false;
    const opacity = await requestItemOpacity(
      scope === "selected" ? "Opacidad de la selección" : "Opacidad de la figura",
      scope === "selected" ? selectedItemOpacity() : location.entry.opacity
    );
    if (opacity === null) return false;
    if (scope === "selected") return applySelectedItemOpacity(opacity);
    saveHistory();
    location.entry.opacity = opacity;
    render();
    return true;
  }

  function entryContextNoteheadTargetSteps(location, scope = "head") {
    const entry = location?.entry;
    if (!entry || entry.type === "rest") return [];
    if (scope === "entry" || location.wholeChord) return entryStaffSteps(entry);
    return [nearestEntryStaffStep(entry, location.staffStep)];
  }

  function entryIsInMultiSelection(entry) {
    return !!entry?.id &&
      (
        state.cursorEntryId === entry.id ||
        state.selectedEntryIds.includes(entry.id) ||
        state.selectedNoteRefs.some((ref) => ref?.entryId === entry.id)
      );
  }

  function hasMultiNoteheadSelection() {
    return selectedNoteheadCountForContext() > 1;
  }

  function selectedNoteheadLocationsForContext() {
    const byEntryId = new Map();
    state.selectedEntryIds.forEach((entryId) => {
      const location = entryLocationById(entryId);
      if (!location?.entry || location.entry.type !== "note") return;
      byEntryId.set(entryId, {
        ...location,
        staffSteps: entryStaffSteps(location.entry)
      });
    });
    selectedNoteLocations().forEach((location) => {
      if (!location?.entry || location.entry.type !== "note") return;
      const existing = byEntryId.get(location.entry.id);
      if (existing) {
        if (!existing.staffSteps.some((step) => Math.abs(step - location.staffStep) < EPSILON)) {
          existing.staffSteps.push(location.staffStep);
        }
      } else {
        byEntryId.set(location.entry.id, {
          ...location,
          staffSteps: [location.staffStep]
        });
      }
    });
    return [...byEntryId.values()].filter((location) => location.staffSteps.length);
  }

  function selectedNoteheadCountForContext() {
    return selectedNoteheadLocationsForContext()
      .reduce((sum, location) => sum + location.staffSteps.length, 0);
  }

  function setEntryContextNotehead(location, glyphName = null, scope = "head") {
    const entry = location?.entry;
    if (!entry || entry.type === "rest") return false;
    saveHistory();
    const previousSelectedIds = [...state.selectedEntryIds];
    const previousCursorEntryId = state.cursorEntryId;
    if (scope === "selection") {
      const targets = selectedNoteheadLocationsForContext();
      if (!targets.length) {
        state.history.pop();
        return false;
      }
      const previousSelectedNoteRefs = [...state.selectedNoteRefs];
      targets.forEach(({ entry: targetEntry, staffSteps }) => {
        const isWholeEntrySelected = state.selectedEntryIds.includes(targetEntry.id);
        if (isWholeEntrySelected) {
          setEntryNoteheadGlyph(targetEntry, glyphName, null);
        } else {
          staffSteps.forEach((staffStep) => setEntryNoteheadGlyph(targetEntry, glyphName, staffStep));
        }
      });
      state.selectedEntryIds = previousSelectedIds;
      state.selectedNoteRefs = previousSelectedNoteRefs;
      state.cursorEntryId = previousCursorEntryId || state.selectedEntryIds[0] || entry.id;
      state.cursorActive = true;
      state.entryCursorActive = false;
      render();
      return true;
    }
    const targetSteps = entryContextNoteheadTargetSteps(location, scope);
    if (scope === "entry" || location.wholeChord) {
      setEntryNoteheadGlyph(entry, glyphName, null);
    } else {
      targetSteps.forEach((staffStep) => setEntryNoteheadGlyph(entry, glyphName, staffStep));
    }
    state.cursorEntryId = entry.id;
    state.selectedNoteRefs = targetSteps.map((staffStep) => ({ entryId: entry.id, staffStep }));
    if (scope === "entry" || location.wholeChord) state.selectedEntryIds = [entry.id];
    setActiveNote(entry, targetSteps[0] ?? entryStaffStep(entry));
    render();
    return true;
  }

  function noteheadMenuGroups(location, scope = "head", options = {}) {
    const title = options.title || "Cabezas de nota";
    const intro = options.intro || "Restaurar cabeza por duración";
    const items = [
      contextMenuButton(intro, () => setEntryContextNotehead(location, null, scope))
    ];
    noteheadGlyphGroups().forEach(([label, glyphNames], index) => {
      items.push(contextMenuGroup(label, glyphNames.map((glyphName) => (
        contextMenuGlyphButton(glyphName, noteheadGlyphLabel(glyphName), () => setEntryContextNotehead(location, glyphName, scope), {
          className: "score-context-menu__glyph-item--notehead"
        })
      )), { open: index === 0 }));
    });
    return contextMenuGroup(title, items, { open: options.open !== false });
  }

  function articulationMenuGroup(location, scope = "head", options = {}) {
    const title = options.title || "Articulaciones";
    const items = [];
    articulationPaletteGroups().forEach(([label, paletteItems], index) => {
      items.push(contextMenuGroup(label, paletteItems.map((item) => (
        contextMenuGlyphButton(item.glyphName, item.label, () => setEntryContextArticulation(location, item, scope), {
          className: "score-context-menu__glyph-item--articulation"
        })
      )), { open: index === 0 }));
    });
    return contextMenuGroup(title, items, { open: options.open !== false });
  }

  function runWithContextEntry(location, action) {
    return async () => {
      selectEntryForContext(location);
      await action();
    };
  }

  function runAtCanvasPoint(point, action) {
    return async () => {
      positionCursorFromPoint(point);
      await action();
    };
  }

  function contextMeasureIndexFromPoint(point) {
    const layout = buildLayout();
    const measureIndex = measureIndexFromX(layout, point.x);
    ensureMeasure(measureIndex);
    return measureIndex;
  }

  function durationShortcut(duration) {
    const mapped = Object.entries(Keymap.durationKeyMap())
      .find(([, durationId]) => durationId === duration?.id)?.[0];
    return mapped ? mapped.replace("Digit", "") : (duration?.key ? String(duration.key) : "");
  }

  function durationContextItemsForEntry(location) {
    const items = [];
    durations.forEach((duration) => {
      items.push(contextMenuButton(duration.label, runWithContextEntry(location, () => {
        if (location.entry?.type === "rest") replaceSelectedEntryWithRestDuration(duration);
        else replaceSelectedEntryDuration(duration);
      }), { shortcut: durationShortcut(duration) }));
    });
    items.push(contextMenuButton("Puntillo", runWithContextEntry(location, () => addDotsToPreviousFigure(1)), { shortcut: "." }));
    items.push(contextMenuButton("Doble puntillo", runWithContextEntry(location, () => addDotsToPreviousFigure(2))));
    if (location.entry?.type === "note") {
      items.push(contextMenuButton("Convertir en silencio", runWithContextEntry(location, () => {
        replaceSelectedEntryWithRestDuration(entryDuration(location.entry));
      })));
    }
    return items;
  }

  function noteConversionContextItems(location) {
    return durations.map((duration) => (
      contextMenuButton(duration.label, runWithContextEntry(location, () => replaceSelectedRestWithNoteDuration(duration)), {
        shortcut: durationShortcut(duration)
      })
    ));
  }

  function setAccidentalFromContext(location, accidental) {
    selectEntryForContext(location);
    if (accidental) return setCursorNoteAccidental(accidental);
    return clearActiveAccidental();
  }

  function nudgeAccidentalFromContext(location, direction) {
    selectEntryForContext(location);
    const target = findCursorNoteTarget();
    if (!target) return false;
    const current = accidentalSemitone(effectiveEntryAccidental(target.entry, target.staffStep));
    return setCursorNoteAccidental(accidentalBySemitone(current + direction));
  }

  function accidentalContextItems(location) {
    return [
      contextMenuButton("Sostenido", () => setAccidentalFromContext(location, "sharp"), { shortcut: "¡" }),
      contextMenuButton("Bemol", () => setAccidentalFromContext(location, "flat"), { shortcut: "'" }),
      contextMenuButton("Becuadro", () => setAccidentalFromContext(location, "natural"), { shortcut: "0" }),
      contextMenuButton("Doble sostenido", () => setAccidentalFromContext(location, "double-sharp")),
      contextMenuButton("Doble bemol", () => setAccidentalFromContext(location, "double-flat")),
      contextMenuButton("Quitar alteración escrita", () => setAccidentalFromContext(location, null))
    ];
  }

  function beamContextItems(location) {
    return [
      contextMenuButton("Conectar/separar barrado", runWithContextEntry(location, toggleManualBeaming)),
      contextMenuButton("Invertir plicas del grupo", runWithContextEntry(location, toggleSelectedFlip), { shortcut: "F" }),
      contextMenuButton("Subir primera plica", () => nudgeBeamEndpoint(location, "start", -4)),
      contextMenuButton("Bajar primera plica", () => nudgeBeamEndpoint(location, "start", 4)),
      contextMenuButton("Subir última plica", () => nudgeBeamEndpoint(location, "end", -4)),
      contextMenuButton("Bajar última plica", () => nudgeBeamEndpoint(location, "end", 4)),
      contextMenuButton("Ajustar extremos...", () => requestBeamEndpointOffsets(location)),
      contextMenuButton("Restablecer extremos", () => resetBeamEndpointOffsets(location))
    ];
  }

  function writingContextItemsAtPoint(point) {
    const items = [];
    durations.forEach((duration) => {
      items.push(contextMenuButton(duration.label, runAtCanvasPoint(point, () => selectFigureDuration(duration)), {
        shortcut: durationShortcut(duration)
      }));
    });
    restPalette.forEach((rest) => {
      items.push(contextMenuButton(rest.label, runAtCanvasPoint(point, () => selectRestDuration(rest))));
    });
    items.push(contextMenuButton("Puntillo", () => addDotsToPreviousFigure(1), { shortcut: "." }));
    items.push(contextMenuButton("Doble puntillo", () => addDotsToPreviousFigure(2)));
    return items;
  }

  function tupletContextItems(location = null, point = null) {
    return palettes.tuplets.map((item) => {
      const action = async () => {
        if (location) selectEntryForContext(location);
        else if (point) positionCursorFromPoint(point);
        if (item.customTuplet) await requestCustomTuplet();
        else activateTuplet(item.tuplet);
      };
      return contextMenuButton(item.label, action);
    });
  }

  function tempoContextItemsAtPoint(point) {
    return palettes.tempo.map((item) => (
      contextMenuButton(item.label, runAtCanvasPoint(point, () => {
        if (item.tempoText) return requestTempoText();
        return requestTempoMark(item);
      }))
    ));
  }

  function dynamicContextItemsForEntry(location) {
    const items = palettes.dynamics.map((item) => (
      contextMenuButton(item.label, runWithContextEntry(location, () => {
        if (isHairpinType(item.markType)) return insertNotationMark(item);
        return setDynamicTextAtCurrentNote(item.symbol || item.id);
      }))
    ));
    items.push(contextMenuButton("Texto dinámico libre...", runWithContextEntry(location, addDynamicItemAtCurrentNote)));
    return items;
  }

  function clefContextItemsAtPoint(point) {
    return palettes.clefs.map((item) => (
      contextMenuButton(item.label, runAtCanvasPoint(point, () => insertClefChange(item)))
    ));
  }

  function voicingContextItems(location = null) {
    return palettes.tools
      .filter((item) => item.chordTool)
      .map((item) => contextMenuButton(item.label, async () => {
        if (location?.entry) {
          selectChordEntry(location.measureIndex, location.entryIndex, {
            activateCursor: false,
            staffStep: location.staffStep
          });
        }
        if (item.chordTool === "auto-drops") {
          if (await requestAutoDropConfig()) await applyChordTool(item.chordTool);
        } else if (item.chordTool === "auto-skips") {
          if (await requestAutoSkipConfig()) await applyChordTool(item.chordTool);
        } else {
          await applyChordTool(item.chordTool);
        }
      }));
  }

  function voiceContextItems() {
    return palettes.tools
      .filter((item) => Number.isFinite(item.voiceMode))
      .map((item) => contextMenuButton(item.label, () => setVoiceMode(item.voiceMode)));
  }

  function editContextItems() {
    return [
      contextMenuButton("Deshacer", undo, { shortcut: "Cmd/Ctrl+Z" }),
      contextMenuButton("Rehacer", redo, { shortcut: "Cmd/Ctrl+Shift+Z" }),
      contextMenuButton("Copiar selección", copySelectedContentToClipboard, { shortcut: "Cmd/Ctrl+C" }),
      contextMenuButton("Repetir selección", repeatSelectedContent, { shortcut: "R" }),
      contextMenuButton("Borrar selección", () => {
        if (deleteSelectedMarks()) return;
        if (deleteSelectedTextItem()) return;
        deleteActiveNoteOrCursorEntry();
      }, { shortcut: "Delete" }),
      contextMenuButton("Limpiar partitura", clearScore)
    ];
  }

  function editContextItemsForEntry(location) {
    const absoluteTick = absoluteTickForLocation(location);
    return [
      contextMenuButton("Copiar esta figura/acorde", () => {
        selectEntryForContext(location);
        return copySelectedContentToClipboard();
      }),
      contextMenuButton("Copiar selección", copySelectedContentToClipboard),
      contextMenuButton("Pegar aquí", () => pasteClipboardContentAtAbsoluteTick(absoluteTick), { shortcut: "Cmd/Ctrl+V" }),
      contextMenuButton("Duplicar/repetir", () => {
        selectEntryForContext(location);
        return repeatSelectedContent();
      }, { shortcut: "R" }),
      ...editContextItems()
    ];
  }

  function nonNoteMoveContextItems() {
    return [
      contextMenuButton("Mover selección izquierda por figura", () => moveSelectedItemsByGrid(-1), { shortcut: "Option+←" }),
      contextMenuButton("Mover selección derecha por figura", () => moveSelectedItemsByGrid(1), { shortcut: "Option+→" }),
      contextMenuButton("Mover selección izquierda por pulso", () => moveSelectedNonNoteItems(-1, { shiftKey: true }), { shortcut: "Shift+←" }),
      contextMenuButton("Mover selección derecha por pulso", () => moveSelectedNonNoteItems(1, { shiftKey: true }), { shortcut: "Shift+→" }),
      contextMenuButton(`Modo desplazamiento ${state.displacementMode ? "off" : "on"}`, toggleDisplacementMode)
    ];
  }

  function entryLocationById(entryId) {
    if (!entryId) return null;
    for (let measureIndex = 0; measureIndex < state.measures.length; measureIndex += 1) {
      const entryIndex = state.measures[measureIndex].entries.findIndex((entry) => entry.id === entryId);
      if (entryIndex !== -1) {
        return { measureIndex, entryIndex, entry: state.measures[measureIndex].entries[entryIndex] };
      }
    }
    return null;
  }

  function setActiveNote(entry, staffStep = entryStaffStep(entry)) {
    if (!entry || entry.type === "rest") {
      state.activeNoteEntryId = null;
      state.activeNoteStaffStep = null;
      return;
    }
    state.activeNoteEntryId = entry.id;
    state.activeNoteStaffStep = staffStep;
  }

  function clearActiveNote() {
    state.activeNoteEntryId = null;
    state.activeNoteStaffStep = null;
  }

  function hideCursorPitch() {
    state.cursorPitchVisible = false;
    state.cursorPitchAnchorEntryId = null;
  }

  function showCursorPitchAtCursor() {
    state.cursorPitchVisible = true;
    state.cursorPitchAnchorEntryId = null;
  }

  function anchorCursorPitchToEntry(entry, staffStep = entryStaffStep(entry)) {
    if (!entry || entry.type === "rest") {
      hideCursorPitch();
      return;
    }
    state.cursorPitchVisible = true;
    state.cursorPitchAnchorEntryId = entry.id;
    state.cursorStaffStep = staffStep;
    setActiveNote(entry, staffStep);
  }

  function carryCursorPitchAfterWrittenNote(entry, staffStep) {
    if (!entry || entry.type === "rest") {
      clearActiveNote();
      hideCursorPitch();
      return;
    }
    state.cursorStaffStep = staffStep;
    setActiveNote(entry, staffStep);
    showCursorPitchAtCursor();
  }

  function cursorPitchReadyToWrite() {
    return state.cursorPitchVisible && !state.cursorPitchAnchorEntryId;
  }

  function rememberFreeCursorPitch() {
    return {
      visible: state.cursorPitchVisible === true && !state.cursorPitchAnchorEntryId,
      staffStep: state.cursorStaffStep
    };
  }

  function restoreFreeCursorPitch(snapshot) {
    if (!snapshot?.visible) return false;
    state.cursorStaffStep = staffStepForSystem(snapshot.staffStep);
    showCursorPitchAtCursor();
    return true;
  }

  function svgPointFromEvent(event) {
    if (!svg.createSVGPoint) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : null;
  }

  function staffStepForEntryPointer(entry, event) {
    const point = svgPointFromEvent(event);
    if (!point || entry.type === "rest") return entryStaffStep(entry);
    return staffStepForSystem(stepFromY(point.y, systemIndexFromY(point.y)));
  }

  function selectEntry(measureIndex, entryIndex, options = {}) {
    const entry = state.measures[measureIndex]?.entries[entryIndex];
    if (!entry) return false;
    activateVoiceForEntrySelection(entry);
    clearMeasureSelection();
    clearTextSelection();
    clearMarkSelection();
    const staffStep = Number.isFinite(options.staffStep)
      ? options.staffStep
      : entryStaffStep(entry);
    state.cursorEntryId = entry.id;
    state.selectedEntryIds = [];
    state.selectedNoteRefs = (
      options.selectHead === true &&
      entry.type === "note" &&
      entryStaffSteps(entry).length > 1
    )
      ? [{ entryId: entry.id, staffStep }]
      : [];
    state.cursorMeasure = measureIndex;
    state.cursorTick = Math.max(0, Number(entry.tickStart) || 0);
    state.cursorActive = options.activateCursor === true;
    state.entryCursorActive = options.activateCursor === true;
    if (entry.type !== "rest") {
      state.cursorStaffStep = staffStep;
    }
    if (state.entryCursorActive) {
      state.cursorStaffStep = entry.type === "rest" ? 0 : staffStep;
    }
    if (entry.type === "rest") {
      clearActiveNote();
      hideCursorPitch();
    } else {
      setActiveNote(entry, staffStep);
      hideCursorPitch();
    }
    if (!state.entryCursorActive) setInputPhase(InputSession.PHASES.SELECT);
    syncInputSession();
    return true;
  }

  function selectChordEntry(measureIndex, entryIndex, options = {}) {
    const entry = state.measures[measureIndex]?.entries[entryIndex];
    if (!entry || entry.type !== "note") return false;
    activateVoiceForEntrySelection(entry);
    const steps = entryStaffSteps(entry);
    if (steps.length < 2) return selectEntry(measureIndex, entryIndex, options);
    selectEntry(measureIndex, entryIndex, {
      ...options,
      staffStep: Number.isFinite(options.staffStep) ? options.staffStep : steps[0]
    });
    state.selectedEntryIds = [entry.id];
    state.selectedNoteRefs = steps.map((staffStep) => ({ entryId: entry.id, staffStep }));
    state.cursorEntryId = entry.id;
    state.cursorMeasure = measureIndex;
    state.cursorTick = entry.tickStart;
    state.entryCursorActive = false;
    state.cursorActive = false;
    setInputPhase(InputSession.PHASES.SELECT);
    setActiveNote(entry, steps[0]);
    return true;
  }

  function isAdditiveSelectionEvent(event) {
    return Selection.isAdditiveEvent(event);
  }

  function removeEntryNoteRefs(entryId) {
    state.selectedNoteRefs = Selection.withoutEntryRefs(state.selectedNoteRefs || [], entryId);
  }

  function toggleNoteRef(entryId, staffStep) {
    state.selectedNoteRefs = Selection.toggleNoteRef(
      state.selectedNoteRefs || [],
      entryId,
      staffStep,
      EPSILON
    );
  }

  function toggleEntrySelection(measureIndex, entryIndex, options = {}) {
    const entry = state.measures[measureIndex]?.entries[entryIndex];
    if (!entry) return false;
    activateVoiceForEntrySelection(entry);
    const staffStep = Number.isFinite(options.staffStep)
      ? nearestEntryStaffStep(entry, options.staffStep)
      : entryStaffStep(entry);
    const wholeEntry = options.wholeEntry === true ||
      entry.type === "rest" ||
      entryStaffSteps(entry).length < 2;
    clearMeasureSelection();
    const selectedEntries = new Set(state.selectedEntryIds || []);
    if (
      state.cursorEntryId &&
      !state.selectedEntryIds.length &&
      !state.selectedNoteRefs.length
    ) {
      const cursorLocation = entryLocationById(state.cursorEntryId);
      if (cursorLocation?.entry) {
        selectedEntries.add(state.cursorEntryId);
      }
    }
    if (wholeEntry) {
      if (selectedEntries.has(entry.id)) {
        selectedEntries.delete(entry.id);
      } else {
        selectedEntries.add(entry.id);
      }
      state.selectedEntryIds = [...selectedEntries];
      removeEntryNoteRefs(entry.id);
    } else if (selectedEntries.has(entry.id)) {
      selectedEntries.delete(entry.id);
      state.selectedEntryIds = [...selectedEntries];
      state.selectedNoteRefs = [
        ...state.selectedNoteRefs.filter((ref) => ref?.entryId !== entry.id),
        ...entryStaffSteps(entry)
          .filter((step) => Math.abs(step - staffStep) >= EPSILON)
          .map((step) => ({ entryId: entry.id, staffStep: step }))
      ];
    } else {
      toggleNoteRef(entry.id, staffStep);
      state.selectedEntryIds = [...selectedEntries];
    }
    state.cursorEntryId = state.selectedEntryIds[0] || state.selectedNoteRefs[0]?.entryId || entry.id;
    state.cursorMeasure = measureIndex;
    state.cursorTick = entry.tickStart;
    state.cursorActive = false;
    state.entryCursorActive = false;
    state.selectMode = true;
    setInputPhase(InputSession.PHASES.SELECT);
    hideCursorPitch();
    if (entry.type === "note") {
      state.cursorStaffStep = staffStep;
      setActiveNote(entry, staffStep);
    } else {
      clearActiveNote();
      hideCursorPitch();
    }
    render();
    return true;
  }

  function clearEntrySelection() {
    state.cursorEntryId = null;
    state.selectedEntryIds = [];
    state.selectedNoteRefs = [];
    state.entryCursorActive = false;
  }

  function deactivateWritingCursor() {
    deactivateTupletWriting();
    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = false;
    render();
  }

  function clearTextSelection() {
    state.activeTextId = null;
    state.selectedTextIds = [];
  }

  function clearMarkSelection() {
    state.selectedMarkIds = [];
  }

  function selectMark(mark, options = {}) {
    if (!mark?.id) return false;
    if (markIsSystemLocal(mark)) setActiveSystemIndex(markSystemIndex(mark));
    if (options.toggle === true) {
      clearMeasureSelection();
      const ids = new Set(state.selectedMarkIds || []);
      if (ids.has(mark.id)) ids.delete(mark.id);
      else ids.add(mark.id);
      state.selectedMarkIds = [...ids];
      state.selectMode = true;
      render();
      return true;
    }
    clearMeasureSelection();
    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();
    clearTextSelection();
    state.selectedMarkIds = [mark.id];
    state.cursorActive = false;
    state.entryCursorActive = false;
    state.selectMode = true;
    render();
    return true;
  }

  function deselectAll() {
    deactivateTupletWriting();
    clearMeasureSelection();
    state.pendingTupletRatio = null;
    state.selectMode = false;
    state.displacementMode = false;
    state.noteChordMode = false;
    state.lockDurationMode = false;
    state.forceDurationMode = false;
    state.pitchBeforeDurationMode = false;
    state.pendingInputPitch = null;
    state.pendingMidiNotes = [];
    state.textMode = false;
    state.chordMode = false;
    state.dynamicMode = false;
    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();
    clearTextSelection();
    clearMarkSelection();
    state.cursorActive = false;
    state.entryCursorActive = false;
    state.dragSelection = null;
    closePaletteDrawer();
    syncInputSession();
    updateModeButtons();
    render();
  }

  function activateSelectTool() {
    deselectAll();
    setInputPhase(InputSession.PHASES.SELECT);
    updateModeButtons();
    render();
  }

  function allSelectableEntryLocations() {
    return Selection.selectableEntryLocations(state.measures, {
      line2Mode: state.line2Mode,
      entryVoice,
      shouldRenderRestEntry
    });
  }

  function selectedOrAllEntryLocations() {
    return Selection.selectedOrAllEntryLocations(
      allSelectableEntryLocations(),
      state.selectedEntryIds,
      state.selectedNoteRefs
    );
  }

  function selectedRhythmicScopeRange() {
    const range = selectedRhythmicRange();
    return range?.locations?.length ? range : null;
  }

  function absoluteTickForTextItem(item) {
    if (!AnchoredText.isAnchored(item)) return null;
    return measureStartAbsoluteTick(Number(item.measureIndex) || 0) + (Number(item.tick) || 0);
  }

  function withinSelectedRhythmicScope(absoluteTick) {
    return Selection.scopeContains(selectedRhythmicScopeRange(), absoluteTick, EPSILON);
  }

  function selectEntryLocations(locations, options = {}) {
    clearMeasureSelection();
    clearTextSelection();
    clearMarkSelection();
    state.selectedEntryIds = locations.map((location) => location.entry.id);
    state.selectedNoteRefs = [];
    state.cursorEntryId = state.selectedEntryIds[0] || null;
    if (locations[0]) {
      state.cursorMeasure = locations[0].measureIndex;
      state.cursorTick = locations[0].entry.tickStart;
      if (locations[0].entry.type === "note") {
        const staffStep = Number.isFinite(options.staffStep)
          ? options.staffStep
          : entryStaffStep(locations[0].entry);
        state.cursorStaffStep = staffStep;
        setActiveNote(locations[0].entry, staffStep);
      } else {
        clearActiveNote();
      }
    } else {
      clearActiveNote();
    }
    hideCursorPitch();
    state.selectMode = true;
    state.cursorActive = !!locations.length;
    state.entryCursorActive = false;
    render();
    return true;
  }

  function selectNoteRefs(refs) {
    clearMeasureSelection();
    clearTextSelection();
    clearMarkSelection();
    state.selectedEntryIds = [];
    state.selectedNoteRefs = refs;
    state.cursorEntryId = refs[0]?.entryId || null;
    const first = refs[0] ? entryLocationById(refs[0].entryId) : null;
    if (first?.entry) {
      state.cursorMeasure = first.measureIndex;
      state.cursorTick = first.entry.tickStart;
      state.cursorStaffStep = refs[0].staffStep;
      setActiveNote(first.entry, refs[0].staffStep);
      state.cursorActive = true;
    } else {
      clearActiveNote();
      state.cursorActive = false;
    }
    hideCursorPitch();
    state.entryCursorActive = false;
    state.selectMode = true;
    render();
    return true;
  }

  function selectTextItemsByFilter(filter) {
    clearMeasureSelection();
    clearEntrySelection();
    clearMarkSelection();
    const items = state.textItems.filter(filter);
    state.activeTextId = items[0]?.id || null;
    state.selectedTextIds = items.map((item) => item.id);
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = false;
    state.entryCursorActive = false;
    state.selectMode = true;
    render();
    return true;
  }

  function selectMarksByFilter(filter) {
    clearMeasureSelection();
    clearEntrySelection();
    clearTextSelection();
    const ids = (state.marks || []).filter(filter).map((mark) => mark.id);
    state.selectedMarkIds = ids;
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = false;
    state.entryCursorActive = false;
    state.selectMode = true;
    render();
    return true;
  }

  function selectAllItems() {
    clearMeasureSelection();
    const entries = allSelectableEntryLocations();
    state.selectedEntryIds = entries.map((location) => location.entry.id);
    state.selectedNoteRefs = [];
    state.cursorEntryId = state.selectedEntryIds[0] || null;
    state.selectedTextIds = state.textItems.map((item) => item.id);
    state.activeTextId = state.selectedTextIds[0] || null;
    state.selectedMarkIds = (state.marks || []).map((mark) => mark.id);
    const first = entries[0];
    if (first?.entry?.type === "note") setActiveNote(first.entry, entryStaffStep(first.entry));
    else clearActiveNote();
    hideCursorPitch();
    state.cursorActive = !!state.cursorEntryId;
    state.entryCursorActive = false;
    state.selectMode = true;
    render();
    return true;
  }

  function selectClass(kind) {
    const normalized = String(kind || "");
    const entryScope = selectedOrAllEntryLocations();
    const scopeRange = selectedRhythmicScopeRange();
    const inScope = (absoluteTick) => Selection.scopeContains(scopeRange, absoluteTick, EPSILON);
    if (!normalized) return false;
    const entryLocations = Selection.classEntryLocations(normalized, entryScope, { entryStaffSteps });
    if (entryLocations) return selectEntryLocations(entryLocations);
    if (normalized === "chord-symbols") return selectTextItemsByFilter((item) => AnchoredText.isChord(item) && inScope(absoluteTickForTextItem(item)));
    if (normalized === "dynamics") return selectTextItemsByFilter((item) => AnchoredText.isDynamic(item) && inScope(absoluteTickForTextItem(item)));
    if (normalized === "text") return selectTextItemsByFilter((item) => !AnchoredText.isAnchored(item));
    if (normalized === "slurs") return selectMarksByFilter((mark) => (mark.type === "slur" || mark.type === "dotted-slur") && inScope(absoluteTickForMark(mark)));
    if (normalized === "articulations") return selectMarksByFilter((mark) => isArticulationMark(mark) && inScope(absoluteTickForMark(mark)));
    if (normalized === "bars") return selectMarksByFilter((mark) => mark.type === "barline" && inScope(absoluteTickForMark(mark)));
    if (normalized === "endings") return selectMarksByFilter((mark) => mark.type === "ending" && inScope(absoluteTickForMark(mark)));
    if (normalized === "clefs") return selectMarksByFilter((mark) => mark.type === "clef" && inScope(absoluteTickForMark(mark)));
    if (normalized === "tempo") return selectMarksByFilter((mark) => String(mark.type || "").startsWith("tempo") && inScope(absoluteTickForMark(mark)));
    return false;
  }

  function selectSpecialVoice(kind) {
    return selectNoteRefs(Selection.specialVoiceRefs(kind, selectedOrAllEntryLocations(), entryStaffSteps));
  }

  function selectDurationClass(durationId) {
    const locations = Selection.durationClassLocations(selectedOrAllEntryLocations(), durationId, {
      durationById,
      entryDuration,
      dotCountForEntry
    });
    return locations ? selectEntryLocations(locations) : false;
  }

  function durationSelectionOptions() {
    return Selection.durationSelectionOptions(durations);
  }

  function fillVoiceWithRestsExact(measure, measureIndex, voice = 2) {
    if (!measure) return false;
    const targetTicks = measureTicksForIndex(measureIndex);
    const normalizedVoice = Number(voice) === 2 ? 2 : 1;
    measure.entries = measure.entries.filter((entry) => !(
      entryVoice(entry) === normalizedVoice &&
      entry.type === "rest" &&
      entry.explicitRest !== true
    ));
    const voiceEntries = measure.entries
      .filter((entry) => entryVoice(entry) === normalizedVoice && !entry.hiddenTupletReserve)
      .sort((a, b) => a.tickStart - b.tickStart || a.ticks - b.ticks);
    const rests = [];
    let cursor = 0;
    voiceEntries.forEach((entry) => {
      const start = Math.max(0, Number(entry.tickStart) || 0);
      if (start > cursor + EPSILON) {
        rests.push(...makeRestEntriesForRange(cursor, start - cursor, meterForMeasureIndex(measureIndex)).map((rest) => (
          setEntryVoice(rest, normalizedVoice)
        )));
      }
      cursor = Math.max(cursor, start + (Number(entry.ticks) || 0));
    });
    if (cursor < targetTicks - EPSILON) {
      rests.push(...makeRestEntriesForRange(cursor, targetTicks - cursor, meterForMeasureIndex(measureIndex)).map((rest) => (
        setEntryVoice(rest, normalizedVoice)
      )));
    }
    if (rests.length) measure.entries.push(...rests);
    measure.entries.sort((a, b) => a.tickStart - b.tickStart || entryVoice(a) - entryVoice(b));
    return rests.length > 0;
  }

  function selectedLowerVoiceToLine2() {
    const refs = selectedNoteRefs();
    if (!refs.length) return false;
    saveHistory();
    const nextRefs = [];
    const byEntry = new Map();
    refs.forEach((ref) => {
      if (!byEntry.has(ref.entryId)) byEntry.set(ref.entryId, []);
      byEntry.get(ref.entryId).push(ref.staffStep);
    });
    byEntry.forEach((staffSteps, entryId) => {
      const location = entryLocationById(entryId);
      if (!location?.entry || location.entry.type !== "note") return;
      const entry = location.entry;
      const measure = state.measures[location.measureIndex];
      const originalSteps = entryStaffSteps(entry);
      const selectedSteps = [...new Set(staffSteps.filter((step) => originalSteps.includes(step)))];
      if (!selectedSteps.length) return;
      selectedSteps.forEach((staffStep) => {
        const voiceEntry = cloneEntryForPaste(entry);
        voiceEntry.tickStart = entry.tickStart;
        setEntryStaffSteps(voiceEntry, [staffStep]);
        setEntryVoice(voiceEntry, 2);
        measure.entries.push(voiceEntry);
        nextRefs.push({ entryId: voiceEntry.id, staffStep });
      });
      if (originalSteps.length > selectedSteps.length) {
        setEntryStaffSteps(entry, originalSteps.filter((step) => !selectedSteps.includes(step)));
        setEntryVoice(entry, 1);
      } else {
        setEntryVoice(entry, 1);
      }
      measure.entries.sort((a, b) => a.tickStart - b.tickStart || entryVoice(a) - entryVoice(b));
    });
    state.measures.forEach((measure, measureIndex) => {
      if (measureVoiceEntries(measure, 2).some((entry) => entry.type === "note")) {
        fillVoiceWithRestsExact(measure, measureIndex, 2);
      }
    });
    verifyAllMeasureDurations();
    state.line2Mode = true;
    selectNoteRefs(nextRefs);
    return true;
  }

  function selectedMovableNoteLocations() {
    const noteLocations = selectedNoteLocations();
    if (noteLocations.length) return noteLocations;
    return selectedEntryLocations()
      .filter((location) => location.entry?.type === "note")
      .flatMap((location) => (
        entryStaffSteps(location.entry).map((staffStep) => ({ ...location, staffStep }))
      ));
  }

  function noteMoveData(location) {
    const { entry, measureIndex, staffStep } = location;
    const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
    const explicit = getEntryAccidental(entry, staffStep);
    const diatonic = diatonicAccidentalForMeasure(diatonicStep, measureIndex);
    const effective = effectiveEntryAccidental(entry, staffStep);
    const accidental = explicit || (effective !== diatonic ? effective : null);
    return {
      sourceEntry: entry,
      sourceStaffStep: staffStep,
      measureIndex,
      absoluteTick: measureStartAbsoluteTick(measureIndex) + entry.tickStart,
      ticks: entry.ticks,
      voice: entryVoice(entry),
      diatonicStep,
      accidental,
      color: entry.noteColors?.[String(staffStep)] || null,
      notehead: entry.noteheadsByStep?.[String(staffStep)] || null,
      tieToNext: entry.tieToNext,
      tied: Number.isFinite(entry.tieStaffStep) && Math.abs(nearestEntryStaffStep(entry, entry.tieStaffStep) - staffStep) < EPSILON
    };
  }

  function applyMovedNoteDetails(entry, staffStep, data) {
    if (data.accidental) setEntryAccidental(entry, staffStep, data.accidental);
    else clearEntryAccidental(entry, staffStep);
    if (data.color) setEntryNoteColor(entry, staffStep, data.color);
    if (data.notehead) setEntryNoteheadGlyph(entry, data.notehead, staffStep);
    if (data.tied) {
      entry.tieToNext = data.tieToNext;
      entry.tieStaffStep = staffStep;
      entry.tieDiatonicStep = data.diatonicStep;
    }
  }

  function createMovedNoteEntry(data, targetStaffStep) {
    const copy = cloneEntryForPaste(data.sourceEntry);
    copy.type = "note";
    copy.ticks = data.ticks;
    copy.tickStart = 0;
    setEntryVoice(copy, data.voice);
    delete copy.chordSteps;
    delete copy.chordDiatonicSteps;
    delete copy.accidentalsByStep;
    delete copy.accidentalsByDiatonicStep;
    delete copy.noteColors;
    delete copy.noteheadsByStep;
    copy.accidental = null;
    setEntryStaffSteps(copy, [targetStaffStep]);
    copy.diatonicStep = data.diatonicStep;
    delete copy.chordDiatonicSteps;
    copy.tieStaffStep = data.tied ? targetStaffStep : null;
    copy.tieDiatonicStep = data.tied ? data.diatonicStep : null;
    return copy;
  }

  function addMovedNoteToSystem(data, targetSystemIndex) {
    return withSystemContext(targetSystemIndex, () => {
      const target = measureIndexAndTickFromAbsolute(data.absoluteTick);
      ensureMeasure(target.measureIndex);
      const measure = state.measures[target.measureIndex];
      const clefId = clefIdAtAbsoluteTick(data.absoluteTick);
      const targetStaffStep = staffStepForDiatonicStep(data.diatonicStep, clefId);
      const existing = (measure.entries || []).find((entry) => (
        entry?.type === "note" &&
        entryVoice(entry) === data.voice &&
        Math.abs((Number(entry.tickStart) || 0) - target.tick) < EPSILON &&
        Math.abs((Number(entry.ticks) || 0) - data.ticks) < EPSILON
      ));
      if (existing) {
        if (!entryStaffSteps(existing).some((step) => Math.abs(step - targetStaffStep) < EPSILON)) {
          setEntryStaffSteps(existing, [...entryStaffSteps(existing), targetStaffStep]);
        }
        applyMovedNoteDetails(existing, targetStaffStep, data);
        return { entryId: existing.id, staffStep: targetStaffStep };
      }
      const copy = createMovedNoteEntry(data, targetStaffStep);
      if (!overwriteEntryInMeasure(target.measureIndex, target.tick, copy)) return null;
      applyMovedNoteDetails(copy, targetStaffStep, data);
      return { entryId: copy.id, staffStep: targetStaffStep };
    });
  }

  function removeMovedNotesFromSource(moveData) {
    const byEntry = new Map();
    moveData.forEach((data) => {
      if (!byEntry.has(data.sourceEntry.id)) {
        const location = entryLocationById(data.sourceEntry.id);
        if (!location) return;
        byEntry.set(data.sourceEntry.id, { location, staffSteps: [] });
      }
      byEntry.get(data.sourceEntry.id)?.staffSteps.push(data.sourceStaffStep);
    });
    byEntry.forEach(({ location, staffSteps }) => {
      const entry = location.entry;
      const measure = state.measures[location.measureIndex];
      const currentSteps = entryStaffSteps(entry);
      const removeSet = new Set(staffSteps.map(String));
      const selectedSteps = currentSteps.filter((step) => removeSet.has(String(step)));
      if (!selectedSteps.length) return;
      if (selectedSteps.length >= currentSteps.length) {
        const entryIndex = measure.entries.findIndex((candidate) => candidate.id === entry.id);
        if (entryIndex >= 0) replaceEntryWithRests(measure, entryIndex, true);
      } else {
        removeSelectedHeadsFromEntry(entry, selectedSteps);
        normalizeMeasure(measure, location.measureIndex);
      }
    });
  }

  function moveSelectedNotesToAdjacentSystem(direction) {
    const sourceSystemIndex = activeSystemIndex();
    const targetSystemIndex = sourceSystemIndex + (direction < 0 ? -1 : 1);
    const systems = scoreSystems();
    if (!systems[targetSystemIndex]) {
      showEditorMessage(direction < 0 ? "No hay un pentagrama contiguo arriba." : "No hay un pentagrama contiguo abajo.");
      return false;
    }
    if (systemIsPercussionLine(systems[targetSystemIndex])) {
      showEditorMessage("No puedo mover alturas a una línea de percusión.");
      return false;
    }
    const targets = selectedMovableNoteLocations();
    if (!targets.length) {
      showEditorMessage("Selecciona una o varias notas para moverlas al pentagrama contiguo.");
      return false;
    }
    saveHistory();
    const moveData = targets.map(noteMoveData);
    const moved = [];
    moveData.forEach((data) => {
      const ref = addMovedNoteToSystem(data, targetSystemIndex);
      if (ref) moved.push({ data, ref });
    });
    if (!moved.length) {
      state.history.pop();
      showEditorMessage("No pude mover esa selección al pentagrama contiguo.");
      return false;
    }
    const movedRefs = moved.map((item) => item.ref);
    setActiveSystemIndex(sourceSystemIndex);
    removeMovedNotesFromSource(moved.map((item) => item.data));
    verifyAllMeasureDurations();
    setActiveSystemIndex(targetSystemIndex);
    state.selectedEntryIds = [];
    state.selectedNoteRefs = movedRefs;
    state.cursorEntryId = movedRefs[0]?.entryId || null;
    const first = movedRefs[0] ? entryLocationById(movedRefs[0].entryId) : null;
    if (first?.entry) {
      state.cursorMeasure = first.measureIndex;
      state.cursorTick = first.entry.tickStart;
      state.cursorStaffStep = movedRefs[0].staffStep;
      setActiveNote(first.entry, movedRefs[0].staffStep);
      state.cursorActive = true;
      state.entryCursorActive = false;
    }
    state.selectMode = true;
    state.compactLayout = true;
    invalidateLayoutCache();
    render();
    return true;
  }

  function applySelectionAction(action) {
    if (action === "simple") return activateSelectTool();
    if (action === "all") return selectAllItems();
    if (action === "upper-voice") return selectSpecialVoice("upper");
    if (action === "lower-voice") return selectSpecialVoice("lower");
    if (action === "convert-selection-to-l2") return selectedLowerVoiceToLine2();
    return false;
  }

  function normalizeCursor() {
    ensureMeasure(state.cursorMeasure);
    syncActiveMeterToCursor();
    state.cursorTick = Math.max(0, Math.min(measureTicksForIndex(state.cursorMeasure), state.cursorTick));
    clampCursorToWrittenBounds();
  }

  function advanceCursor(ticks) {
    state.cursorTick += ticks;
    while (state.cursorTick >= measureTicksForIndex(state.cursorMeasure)) {
      state.cursorTick -= measureTicksForIndex(state.cursorMeasure);
      state.cursorMeasure += 1;
      ensureMeasure(state.cursorMeasure);
      syncActiveMeterToCursor();
    }
  }

  function writeEntryAcrossMeasures(measureIndex, tick, entry) {
    const absoluteStart = measureStartAbsoluteTick(measureIndex) + tick;
    const segments = splitEntryRhythmically(entry, absoluteStart);
    if (!segments.length) return [];
    const writtenEntries = [];
    segments.forEach((segment) => {
      const target = measureIndexAndTickFromAbsolute(segment.absoluteStart);
      const targetMeasureIndex = target.measureIndex;
      const targetTick = target.tick;
      ensureMeasure(targetMeasureIndex);
      if (overwriteEntryInMeasure(targetMeasureIndex, targetTick, segment.entry)) {
        writtenEntries.push(segment.entry);
      }
    });
    return writtenEntries;
  }

  function noteEntryAtExactCursor(voice = activeVoice()) {
    const measure = state.measures[state.cursorMeasure];
    if (!measure) return null;
    const entryIndex = measure.entries.findIndex((entry) => (
      entry?.type === "note" &&
      entryVoice(entry) === voice &&
      Math.abs((Number(entry.tickStart) || 0) - state.cursorTick) < EPSILON
    ));
    return entryIndex >= 0
      ? { measureIndex: state.cursorMeasure, entryIndex, entry: measure.entries[entryIndex] }
      : null;
  }

  function addChordPitchAtCursor(staffStep, options = {}) {
    if (!state.noteChordMode || state.mode !== "note") return false;
    const location = noteEntryAtExactCursor(activeVoice());
    if (!location?.entry) return false;
    const entry = location.entry;
    const steps = entryStaffSteps(entry);
    if (steps.some((step) => Math.abs(step - staffStep) < EPSILON)) return true;
    saveHistory();
    const nextSteps = [...steps, staffStep].sort((a, b) => a - b);
    setEntryStaffSteps(entry, nextSteps);
    if (Number.isFinite(options.diatonicStep)) {
      const diatonicSteps = entryDiatonicSteps(entry);
      const staffIndex = nextSteps.findIndex((step) => Math.abs(step - staffStep) < EPSILON);
      if (staffIndex >= 0) diatonicSteps[staffIndex] = options.diatonicStep;
      entry.diatonicStep = diatonicSteps[0] ?? options.diatonicStep;
      entry.chordDiatonicSteps = diatonicSteps;
    }
    state.cursorStaffStep = staffStep;
    state.activeNoteEntryId = entry.id;
    state.activeNoteStaffStep = staffStep;
    showCursorPitchAtCursor();
    state.cursorActive = true;
    state.entryCursorActive = false;
    syncInputSession();
    render();
    return true;
  }

  function insertEntry(staffStep = 0, options = {}) {
    if (!state.cursorActive) return false;
    staffStep = staffStepForSystem(staffStep);
    state.cursorStaffStep = staffStepForSystem(state.cursorStaffStep);
    if (addChordPitchAtCursor(staffStep, options)) return true;
    clearEntrySelection();
    ensureMeasure(state.cursorMeasure);
    if (state.pendingTupletRatio) {
      activatePendingTupletForDuration(state.activeDuration, cursorAbsoluteTick());
    }
    const voice = activeVoice();
    const activeTuplet = normalizeTuplet(state.activeTuplet);
    const tupletUnit = activeTuplet ? durationById(activeTuplet.unitDurationId) : null;
    const duration = tupletUnit || state.activeDuration;

    if (state.cursorTick >= measureTicksForIndex(state.cursorMeasure) - EPSILON) {
      const previousMeasureIndex = state.cursorMeasure;
      state.cursorMeasure += 1;
      state.cursorTick = 0;
      ensureMeasure(state.cursorMeasure);
      finalizeMeasureOnExit(previousMeasureIndex, state.cursorMeasure);
      return insertEntry(staffStep, options);
    }

    saveHistory();
    const tupletWrite = activeTuplet ? nextTupletWriteInfo() : null;
    const entry = makeEntry(state.mode, duration, staffStep, null);
    setEntryVoice(entry, voice);
    if (state.forceDurationMode) entry.forceDuration = true;
    if (entry.type === "note") {
      const writeTick = tupletWrite?.startAbsTick ?? cursorAbsoluteTick();
      const clefId = clefIdAtAbsoluteTick(writeTick);
      if (activeSystemIsPercussionLine()) {
        normalizePercussionEntry(entry);
      } else {
        const diatonicStep = Number.isFinite(options.diatonicStep)
          ? options.diatonicStep
          : diatonicStepForStaffStep(staffStep, clefId);
        entry.diatonicStep = diatonicStep;
        if (Array.isArray(options.chordDiatonicSteps)) entry.chordDiatonicSteps = [...options.chordDiatonicSteps];
        if (options.midiInfo) applyMidiAccidental(entry, staffStep, options.midiInfo, state.cursorMeasure);
      }
    }
    if (entry.type === "rest" && options.explicitRest) entry.explicitRest = true;
    if (tupletWrite) {
      const run = state.activeTupletRun;
      applyTupletMetadata(entry, tupletWrite.tuplet, tupletWrite.index, tupletWrite.groupId);
      const groupEntries = [
        ...tupletGroupEntriesWithReplacement(run, entry)
      ];
      rewriteOpenTupletGroup(
        run,
        reservedTupletEntries(tupletWrite.tuplet, tupletWrite.groupId, tupletWrite.startAbsTick, groupEntries, -1)
      );
      const inserted = entryLocationById(entry.id);
      const slotTicks = tupletSlotTicks(tupletWrite.tuplet);
      setCursorFromAbsoluteTick(tupletWrite.startAbsTick + (tupletWrite.index + 1) * slotTicks);
      if (entry.type === "note") carryCursorPitchAfterWrittenNote(inserted?.entry || entry, staffStep);
      else {
        clearActiveNote();
        hideCursorPitch();
      }
      if (state.activeTupletRun?.remaining <= 0 || tupletWrite.index + 1 >= tupletWrite.tuplet.actual) {
        completeTupletGroupsInMeasure(measureIndexAndTickFromAbsolute(tupletWrite.startAbsTick).measureIndex);
        state.activeTuplet = null;
        state.activeTupletRun = null;
      }
      state.cursorActive = true;
      state.entryCursorActive = false;
      if (!options.suppressAudition) {
        auditionWrittenEntries([inserted?.entry || entry], measureIndexAndTickFromAbsolute(tupletWrite.startAbsTick).measureIndex);
      }
      render();
      return true;
    }
    const insertStart = cursorAbsoluteTick();
    const shouldShift = state.displacementMode || !!tupletWrite;
    const writtenEntries = shouldShift
      ? (() => {
        insertEntryAtAbsoluteTickShift(entry, insertStart);
        const inserted = entryLocationById(entry.id);
        return inserted?.entry ? [inserted.entry] : [];
      })()
      : writeEntryAcrossMeasures(state.cursorMeasure, state.cursorTick, entry);
    if (!writtenEntries.length) return false;
    if (state.noteChordMode && entry.type === "note") {
      setCursorFromAbsoluteTick(insertStart);
    } else {
      setCursorFromAbsoluteTick(nextWritingGridAbsoluteTickAfterEntry(
        insertStart,
        writtenEntries.at(-1) || entry,
        voice
      ));
    }
    if (entry.type === "note") carryCursorPitchAfterWrittenNote(writtenEntries.at(-1) || entry, staffStep);
    else {
      clearActiveNote();
      hideCursorPitch();
    }
    if (state.activeTupletRun?.remaining <= 0) state.activeTupletRun = null;
    state.cursorActive = true;
    state.entryCursorActive = false;
    syncInputSession();
    if (!options.suppressAudition) {
      auditionWrittenEntries(writtenEntries, measureIndexAndTickFromAbsolute(insertStart).measureIndex);
    }
    render();
    return true;
  }

  function shrinkFollowingRest(measure, restIndex, ticksToRemove) {
    const rest = measure.entries[restIndex];
    const remainingTicks = rest.ticks - ticksToRemove;
    if (remainingTicks <= EPSILON) {
      measure.entries.splice(restIndex, 1);
      return 0;
    }

    const duration = durationByTicks(remainingTicks);
    if (duration) {
      setEntryDuration(rest, duration);
    } else {
      measure.entries.splice(restIndex, 1, ...makeRestEntriesForRange(rest.tickStart, remainingTicks));
    }
    return 0;
  }

  function consumeFollowingDuration(measure, selectedIndex, ticksToConsume, voice = 1) {
    let remaining = ticksToConsume;

    while (remaining > EPSILON && measure.entries.length > selectedIndex + 1) {
      let nextIndex = selectedIndex + 1;
      while (nextIndex < measure.entries.length && entryVoice(measure.entries[nextIndex]) !== voice) {
        nextIndex += 1;
      }
      if (nextIndex >= measure.entries.length) break;
      const entry = measure.entries[nextIndex];
      if (entry.ticks <= remaining + EPSILON) {
        remaining -= entry.ticks;
        measure.entries.splice(nextIndex, 1);
      } else {
        const consumedTicks = remaining;
        const remainingTicks = entry.ticks - consumedTicks;
        const nextTickStart = (Number(entry.tickStart) || 0) + consumedTicks;
        const duration = durationByTicks(remainingTicks);
        if (duration) {
          setEntryDuration(entry, duration);
          entry.tickStart = nextTickStart;
        } else {
          measure.entries.splice(nextIndex, 1, ...makeRestEntriesForRange(nextTickStart, remainingTicks).map((rest) => (
            setEntryVoice(rest, voice)
          )));
        }
        remaining = 0;
      }
    }

    return remaining;
  }

  function replaceSelectedEntryDuration(duration) {
    const selection = selectedEntryLocation();
    if (!selection) return false;

    const { measureIndex, entryIndex, entry } = selection;
    const measure = state.measures[measureIndex];
    const oldTick = entry.tickStart;
    const oldTicks = entry.ticks;
    const voice = entryVoice(entry);

    saveHistory();
    measure.entries.splice(entryIndex, 1, ...makeRestEntriesForRange(oldTick, oldTicks).map((rest) => (
      setEntryVoice(rest, voice)
    )));
    setEntryDuration(entry, duration);
    setEntryVoice(entry, voice);
    const writtenEntries = writeEntryAcrossMeasures(measureIndex, oldTick, entry);
    const firstWritten = writtenEntries[0] || entry;
    const normalizedLocation = entryLocationById(firstWritten.id);
    state.cursorMeasure = measureIndex;
    if (normalizedLocation) {
      selectEntry(normalizedLocation.measureIndex, normalizedLocation.entryIndex, { activateCursor: state.entryCursorActive });
    } else {
      clearEntrySelection();
      state.cursorTick = Math.min(oldTick, measureUsed(measure));
    }
    render();
    return true;
  }

  function selectedDurationTargetLocations() {
    const byId = new Map();
    selectedEntryLocations().forEach((location) => {
      if (location.entry?.type === "note" || location.entry?.type === "rest") byId.set(location.entry.id, location);
    });
    selectedNoteLocations().forEach((location) => {
      if (!location.entry || location.entry.type !== "note") return;
      const liveLocation = entryLocationById(location.entry.id) || location;
      byId.set(location.entry.id, liveLocation);
    });
    return [...byId.values()].sort((a, b) => (
      a.measureIndex - b.measureIndex || a.entry.tickStart - b.entry.tickStart || a.entryIndex - b.entryIndex
    ));
  }

  function changeSelectedNoteDurations(duration) {
    const targets = selectedDurationTargetLocations();
    if (targets.length <= 1) return false;

    saveHistory();
    const affectedVoices = new Map();
    targets.forEach((location) => {
      const liveLocation = entryLocationById(location.entry.id);
      const entry = liveLocation?.entry;
      if (!entry || (entry.type !== "note" && entry.type !== "rest")) return;
      const measureIndex = liveLocation.measureIndex;
      const voice = entryVoice(entry);
      setEntryDuration(entry, duration);
      if (entry.type === "rest") entry.explicitRest = true;
      setEntryVoice(entry, voice);
      affectedVoices.set(`${measureIndex}:${voice}`, { measureIndex, voice });
    });

    affectedVoices.forEach(({ measureIndex }) => {
      const measure = state.measures[measureIndex];
      if (measure) normalizeMeasure(measure, measureIndex);
    });

    const selectedIds = targets
      .map((location) => location.entry.id)
      .filter((entryId) => !!entryLocationById(entryId));
    state.selectedEntryIds = selectedIds;
    state.selectedNoteRefs = [];
    state.cursorEntryId = selectedIds[0] || null;
    const firstLocation = state.cursorEntryId ? entryLocationById(state.cursorEntryId) : null;
    if (firstLocation?.entry) {
      state.cursorMeasure = firstLocation.measureIndex;
      state.cursorTick = firstLocation.entry.tickStart;
      state.cursorStaffStep = entryStaffStep(firstLocation.entry);
      setActiveNote(firstLocation.entry, entryStaffStep(firstLocation.entry));
      state.cursorActive = true;
      state.entryCursorActive = false;
    }
    render();
    return true;
  }

  function replaceSelectedEntryWithRestDuration(duration) {
    const selection = selectedEntryLocation();
    if (!selection) return false;

    const { measureIndex, entryIndex, entry } = selection;
    const measure = state.measures[measureIndex];
    const oldTick = entry.tickStart;
    const oldTicks = entry.ticks;
    const voice = entryVoice(entry);

    saveHistory();
    measure.entries.splice(entryIndex, 1, ...makeRestEntriesForRange(oldTick, oldTicks).map((rest) => (
      setEntryVoice(rest, voice)
    )));
    const restEntry = makeEntry("rest", duration, 0, null);
    restEntry.explicitRest = true;
    setEntryVoice(restEntry, voice);
    const writtenEntries = writeEntryAcrossMeasures(measureIndex, oldTick, restEntry);
    const firstWritten = writtenEntries[0] || restEntry;
    const normalizedLocation = entryLocationById(firstWritten.id);
    state.cursorMeasure = measureIndex;
    if (normalizedLocation) {
      selectEntry(normalizedLocation.measureIndex, normalizedLocation.entryIndex, { activateCursor: state.entryCursorActive });
      state.cursorTick = normalizedLocation.entry.tickStart + normalizedLocation.entry.ticks;
    } else {
      clearEntrySelection();
      state.cursorTick = Math.min(oldTick, measureUsed(measure));
    }
    render();
    return true;
  }

  function replaceSelectedRestWithNoteDuration(duration) {
    const selection = selectedEntryLocation();
    if (!selection?.entry || selection.entry.type !== "rest") return false;
    const { measureIndex, entry } = selection;
    const cursorInsideRest = state.cursorMeasure === measureIndex &&
      state.cursorTick >= entry.tickStart - EPSILON &&
      state.cursorTick <= entry.tickStart + entry.ticks - duration.ticks + EPSILON;
    const oldTick = cursorInsideRest ? state.cursorTick : entry.tickStart;

    saveHistory();
    state.cursorStaffStep = staffStepForSystem(state.cursorStaffStep);
    const noteEntry = makeEntry("note", duration, state.cursorStaffStep, null);
    const voice = entryVoice(entry);
    const writeStartAbsTick = measureStartAbsoluteTick(measureIndex) + oldTick;
    setEntryVoice(noteEntry, voice);
    const writtenEntries = writeEntryAcrossMeasures(measureIndex, oldTick, noteEntry);
    const firstWritten = writtenEntries[0] || noteEntry;
    const location = entryLocationById(firstWritten.id);
    if (location) {
      selectEntry(location.measureIndex, location.entryIndex, { activateCursor: true, staffStep: state.cursorStaffStep });
      setActiveNote(location.entry, state.cursorStaffStep);
      hideCursorPitch();
      setCursorFromAbsoluteTick(voice === 2
        ? nextWritingGridAbsoluteTickAfterEntry(writeStartAbsTick, location.entry, voice)
        : writeStartAbsTick + location.entry.ticks);
      state.entryCursorActive = false;
    }
    render();
    return true;
  }

  function rewriteSelectedEntryPitch() {
    const selection = selectedEntryLocation();
    if (!selection) return false;
    const { entry } = selection;

    saveHistory();
    state.cursorStaffStep = staffStepForSystem(state.cursorStaffStep);
    entry.type = "note";
    setEntryStaffSteps(entry, [state.cursorStaffStep]);
    entry.accidental = null;
    delete entry.accidentalsByStep;
    delete entry.accidentalsByDiatonicStep;
    setActiveNote(entry, state.cursorStaffStep);
    render();
    return true;
  }

  function noteEntryLocationAtCursor(voice = activeVoice()) {
    return Writing.noteEntryLocationAtCursor({
      measures: state.measures,
      cursorActive: state.cursorActive,
      cursorMeasure: state.cursorMeasure,
      cursorTick: state.cursorTick,
      voice,
      entryVoice,
      epsilon: EPSILON
    });
  }

  function addCursorPitchToSelectedEntry() {
    const anchored = state.cursorPitchAnchorEntryId ? entryLocationById(state.cursorPitchAnchorEntryId) : null;
    const selected = selectedEntryLocation();
    const cursorTarget = !anchored?.entry && !selected?.entry ? noteEntryLocationAtCursor(activeVoice()) : null;
    const selection = anchored?.entry ? anchored : selected?.entry ? selected : cursorTarget;
    if (!selection || selection.entry.type === "rest") return false;
    const { entry } = selection;
    state.cursorStaffStep = staffStepForSystem(state.cursorStaffStep);
    const steps = entryStaffSteps(entry);
    if (steps.includes(state.cursorStaffStep)) return true;

    saveHistory();
    setEntryStaffSteps(entry, [...steps, state.cursorStaffStep]);
    state.cursorEntryId = entry.id;
    state.selectedEntryIds = [];
    state.selectedNoteRefs = [{ entryId: entry.id, staffStep: state.cursorStaffStep }];
    state.cursorMeasure = selection.measureIndex;
    state.cursorTick = entry.tickStart;
    state.cursorActive = true;
    state.entryCursorActive = false;
    setActiveNote(entry, state.cursorStaffStep);
    showCursorPitchAtCursor();
    render();
    return true;
  }

  function cloneEntryForPaste(entry) {
    return Writing.cloneEntryForPaste(entry);
  }

  function cloneEntryWithStaffSteps(entry, staffSteps = null) {
    const copy = cloneEntryForPaste(entry);
    if (!staffSteps) return copy;
    copy.type = "note";
    copy.accidental = null;
    delete copy.accidentalsByStep;
    delete copy.accidentalsByDiatonicStep;
    setEntryStaffSteps(copy, staffSteps);
    staffSteps.forEach((staffStep) => {
      const accidental = getEntryAccidental(entry, staffStep);
      if (accidental) setEntryAccidental(copy, staffStep, accidental);
    });
    return copy;
  }

  function replaceEntryWithRests(measure, entryIndex, shouldNormalize = true, options = {}) {
    const entry = measure.entries[entryIndex];
    if (!entry) return;
    const voice = entryVoice(entry);
    Writing.replaceEntryWithRests({
      measure,
      entryIndex,
      restEntries: makeRestEntriesForRange(entry.tickStart, entry.ticks),
      voice,
      explicitRest: options.explicitRest,
      shouldNormalize,
      setEntryVoice,
      normalizeMeasure,
      retime: retimeMeasure
    });
  }

  function removeSelectedHeadsFromEntry(entry, staffStepsToRemove) {
    return Writing.removeSelectedHeadsFromEntry(entry, staffStepsToRemove, {
      entryStaffSteps,
      clearEntryAccidental,
      clearEntryNoteColor,
      clearEntryNoteheadGlyph,
      setEntryStaffSteps
    });
  }

  function repeatSelectedEntries() {
    if (state.displacementMode && state.clipboardUnits?.length) {
      const targetTick = singlePasteTargetAbsoluteTick();
      const selectedCount = selectedEntryLocations().length + selectedNoteLocations().length;
      if (Number.isFinite(targetTick) && selectedCount <= 1) {
        return pasteClipboardAtAbsoluteTick(targetTick);
      }
    }

    const units = selectedRepeatUnits();
    if (!units.length) return false;

    state.clipboardUnits = units.map((unit) => ({
      offset: unit.offset,
      entry: cloneEntryForPaste(unit.entry)
    }));

    saveHistory();
    const targetStart = Math.max(...units.map((unit) => unit.sourceAbsTick + unit.entry.ticks));
    const pastedIds = [];
    units.forEach((unit) => {
      const copy = cloneEntryForPaste(unit.entry);
      const targetAbsTick = targetStart + unit.offset;
      if (state.displacementMode) {
        insertEntryAtAbsoluteTickShift(copy, targetAbsTick);
        pastedIds.push(copy.id);
      } else if (overwriteEntryAtAbsoluteTick(copy, targetAbsTick)) {
        pastedIds.push(copy.id);
      }
    });

    state.selectedEntryIds = pastedIds;
    state.selectedNoteRefs = [];
    state.cursorEntryId = pastedIds[0] || null;
    const firstPasted = entryLocationById(state.cursorEntryId);
    if (firstPasted?.entry?.type === "note") setActiveNote(firstPasted.entry, entryStaffStep(firstPasted.entry));
    else clearActiveNote();
    render();
    return true;
  }

  function selectedContentCount() {
    return selectedRepeatUnits().length + selectedMarks().length + selectedTextItems().length;
  }

  function selectedContentRepeatTargetAbsoluteTick() {
    const range = selectedRhythmicRange();
    if (range?.locations?.length) return range.end;
    const anchor = clipboardAnchorAbsoluteTick();
    if (Number.isFinite(anchor)) return anchor + Math.max(MIN_DURATION_TICKS, activeGridDuration()?.ticks || pulseTicks());
    return singlePasteTargetAbsoluteTick();
  }

  function repeatSelectedContent() {
    if (!selectedContentCount()) return false;
    const targetTick = selectedContentRepeatTargetAbsoluteTick();
    if (!Number.isFinite(targetTick)) return false;
    if (!copySelectedContentToClipboard()) return false;
    return pasteClipboardContentAtAbsoluteTick(targetTick);
  }

  function copySelectedUnitsToClipboard() {
    const units = selectedRepeatUnits();
    if (!units.length) return false;
    state.clipboardUnits = units.map((unit) => ({
      offset: unit.offset,
      entry: cloneEntryForPaste(unit.entry)
    }));
    return true;
  }

  function cloneTextItemForPaste(item) {
    return {
      ...JSON.parse(JSON.stringify(item)),
      id: createTextId()
    };
  }

  function cloneMarkForPaste(mark) {
    return {
      ...JSON.parse(JSON.stringify(mark)),
      id: createMarkId()
    };
  }

  function markAnchorAbsoluteTick(mark) {
    if (!mark) return null;
    if (mark.type === "barline") return measureStartAbsoluteTick(Number(mark.boundaryIndex) || 0);
    if (mark.type === "ending") return measureStartAbsoluteTick(Number(mark.startMeasureIndex ?? mark.measureIndex) || 0);
    return absoluteTickForMark(mark);
  }

  function clipboardAnchorAbsoluteTick() {
    const candidates = [
      ...selectedRepeatUnits().map((unit) => unit.sourceAbsTick),
      ...selectedMarks().map(markAnchorAbsoluteTick).filter(Number.isFinite),
      ...selectedTextItems()
        .filter((item) => isAnchoredTextItem(item))
        .map((item) => measureStartAbsoluteTick(Number(item.measureIndex) || 0) + (Number(item.tick) || 0))
    ];
    return candidates.length ? Math.min(...candidates) : (state.cursorActive ? cursorAbsoluteTick() : 0);
  }

  function freeTextClipboardOrigin() {
    const freeItems = selectedTextItems().filter((item) => !isAnchoredTextItem(item));
    if (!freeItems.length) return null;
    return freeItems.reduce((origin, item) => ({
      x: Math.min(origin.x, Number(item.x) || 0),
      y: Math.min(origin.y, Number(item.y) || 0)
    }), { x: Infinity, y: Infinity });
  }

  function copySelectedContentToClipboard() {
    const anchorAbsTick = clipboardAnchorAbsoluteTick();
    const freeOrigin = freeTextClipboardOrigin();
    const entries = selectedRepeatUnits().map((unit) => ({
      kind: "entry",
      offset: unit.sourceAbsTick - anchorAbsTick,
      entry: cloneEntryForPaste(unit.entry)
    }));
    const marks = selectedMarks().map((mark) => ({
      kind: "mark",
      offset: (markAnchorAbsoluteTick(mark) ?? anchorAbsTick) - anchorAbsTick,
      mark: cloneMarkForPaste(mark)
    }));
    const texts = selectedTextItems().map((item) => {
      const copy = cloneTextItemForPaste(item);
      if (isAnchoredTextItem(item)) {
        return {
          kind: "text",
          anchored: true,
          offset: measureStartAbsoluteTick(Number(item.measureIndex) || 0) + (Number(item.tick) || 0) - anchorAbsTick,
          item: copy
        };
      }
      return {
        kind: "text",
        anchored: false,
        offsetX: (Number(item.x) || 0) - (freeOrigin?.x || 0),
        offsetY: (Number(item.y) || 0) - (freeOrigin?.y || 0),
        item: copy
      };
    });
    const items = [...entries, ...marks, ...texts];
    if (!items.length) return false;
    state.clipboardItems = items;
    state.clipboardFreeOrigin = freeOrigin ? { ...freeOrigin } : null;
    state.clipboardUnits = entries.map((item) => ({
      offset: item.offset,
      entry: cloneEntryForPaste(item.entry)
    }));
    return true;
  }

  function singlePasteTargetAbsoluteTick() {
    const range = selectedRhythmicRange();
    if (range?.locations?.length === 1) return range.start;
    if (state.cursorActive) return cursorAbsoluteTick();
    const anchor = clipboardAnchorAbsoluteTick();
    if (Number.isFinite(anchor)) return anchor;
    return null;
  }

  function pasteClipboardAtAbsoluteTick(absoluteTick) {
    if (!state.clipboardUnits?.length || !Number.isFinite(absoluteTick)) return false;
    saveHistory();
    const pastedIds = [];
    state.clipboardUnits
      .map((unit) => ({ offset: unit.offset, entry: cloneEntryForPaste(unit.entry) }))
      .sort((a, b) => a.offset - b.offset)
      .forEach((unit) => {
        const targetAbsTick = absoluteTick + unit.offset;
        if (state.displacementMode) {
          insertEntryAtAbsoluteTickShift(unit.entry, targetAbsTick);
          pastedIds.push(unit.entry.id);
        } else if (overwriteEntryAtAbsoluteTick(unit.entry, targetAbsTick)) {
          pastedIds.push(unit.entry.id);
        }
      });
    if (!pastedIds.length) return false;
    state.selectedEntryIds = pastedIds;
    state.selectedNoteRefs = [];
    state.cursorEntryId = pastedIds[0] || null;
    const firstPasted = entryLocationById(state.cursorEntryId);
    if (firstPasted?.entry?.type === "note") setActiveNote(firstPasted.entry, entryStaffStep(firstPasted.entry));
    else clearActiveNote();
    hideCursorPitch();
    state.cursorActive = true;
    state.entryCursorActive = false;
    render();
    return true;
  }

  function pasteFreeTextPoint(layout) {
    if (state.cursorActive) {
      return {
        x: cursorVisualX(layout),
        y: pitchY(state.cursorStaffStep)
      };
    }
    if (state.clipboardFreeOrigin) {
      return {
        x: state.clipboardFreeOrigin.x + 24,
        y: state.clipboardFreeOrigin.y + 24
      };
    }
    return { x: staffLeft(), y: staffTopY() - 36 };
  }

  function pasteMarkFromClipboard(markData, absoluteTick) {
    const mark = cloneMarkForPaste(markData.mark);
    if (mark.type === "barline") {
      const location = measureIndexAndTickFromAbsolute(absoluteTick);
      mark.boundaryIndex = location.tick <= EPSILON ? location.measureIndex : location.measureIndex + 1;
      mark.measureIndex = Math.max(0, mark.boundaryIndex - 1);
      mark.tick = mark.boundaryIndex > 0 ? measureTicksForIndex(mark.measureIndex) : 0;
    } else if (mark.type === "ending") {
      const sourceSpan = Math.max(1, Number(mark.endMeasureIndex) - Number(mark.startMeasureIndex ?? mark.measureIndex));
      const location = measureIndexAndTickFromAbsolute(absoluteTick);
      mark.startMeasureIndex = location.measureIndex;
      mark.endMeasureIndex = location.measureIndex + sourceSpan;
      mark.measureIndex = mark.startMeasureIndex;
      mark.tick = 0;
      ensureMeasure(mark.endMeasureIndex);
    } else if (mark.type === "slur" || mark.type === "dotted-slur") {
      const sourceSpan = Math.max(1, Number(mark.endMeasureIndex) - Number(mark.measureIndex || 0));
      const location = measureIndexAndTickFromAbsolute(absoluteTick);
      mark.measureIndex = location.measureIndex;
      mark.tick = location.tick;
      mark.endMeasureIndex = location.measureIndex + sourceSpan;
      delete mark.entryId;
      ensureMeasure(mark.endMeasureIndex);
    } else {
      const location = measureIndexAndTickFromAbsolute(absoluteTick);
      mark.measureIndex = location.measureIndex;
      mark.tick = location.tick;
      delete mark.entryId;
    }
    state.marks.push(mark);
    return mark.id;
  }

  function pasteTextFromClipboard(textData, absoluteTick, freeOriginPoint) {
    const item = cloneTextItemForPaste(textData.item);
    if (textData.anchored) {
      const location = measureIndexAndTickFromAbsolute(absoluteTick);
      item.measureIndex = location.measureIndex;
      item.tick = location.tick;
    } else {
      item.x = freeOriginPoint.x + (Number(textData.offsetX) || 0);
      item.y = freeOriginPoint.y + (Number(textData.offsetY) || 0);
    }
    state.textItems.push(item);
    return item.id;
  }

  function pasteClipboardContentAtAbsoluteTick(absoluteTick) {
    const hasMixedClipboard = Array.isArray(state.clipboardItems) && state.clipboardItems.length;
    if (!hasMixedClipboard) return pasteClipboardAtAbsoluteTick(absoluteTick);
    if (!Number.isFinite(absoluteTick)) return false;
    saveHistory();
    const layout = buildLayout();
    const freeOriginPoint = pasteFreeTextPoint(layout);
    const pastedEntryIds = [];
    const pastedMarkIds = [];
    const pastedTextIds = [];
    state.clipboardItems
      .map((item) => JSON.parse(JSON.stringify(item)))
      .sort((a, b) => (Number(a.offset) || 0) - (Number(b.offset) || 0))
      .forEach((item) => {
        const targetAbsTick = absoluteTick + (Number(item.offset) || 0);
        if (item.kind === "entry") {
          const entry = cloneEntryForPaste(item.entry);
          const pasted = state.displacementMode
            ? insertEntryAtAbsoluteTickShift(entry, targetAbsTick)
            : overwriteEntryAtAbsoluteTick(entry, targetAbsTick);
          if (pasted) pastedEntryIds.push(entry.id);
        } else if (item.kind === "mark") {
          pastedMarkIds.push(pasteMarkFromClipboard(item, targetAbsTick));
        } else if (item.kind === "text") {
          pastedTextIds.push(pasteTextFromClipboard(item, targetAbsTick, freeOriginPoint));
        }
      });
    if (!pastedEntryIds.length && !pastedMarkIds.length && !pastedTextIds.length) return false;
    state.selectedEntryIds = pastedEntryIds;
    state.selectedNoteRefs = [];
    state.selectedMarkIds = pastedMarkIds;
    state.selectedTextIds = pastedTextIds;
    state.activeTextId = pastedTextIds[0] || null;
    state.cursorEntryId = pastedEntryIds[0] || null;
    const firstPasted = entryLocationById(state.cursorEntryId);
    if (firstPasted?.entry?.type === "note") setActiveNote(firstPasted.entry, entryStaffStep(firstPasted.entry));
    else clearActiveNote();
    hideCursorPitch();
    state.cursorActive = !!pastedEntryIds.length;
    state.entryCursorActive = false;
    render();
    return true;
  }

  function setCursorToSelectionStart() {
    const selection = selectedEntryLocation();
    if (!selection?.entry) return false;
    state.cursorMeasure = selection.measureIndex;
    state.cursorTick = selection.entry.tickStart;
    state.cursorActive = true;
    state.entryCursorActive = false;
    return true;
  }

  function prepareDisplacementWritePoint() {
    if (!state.displacementMode) return;
    setCursorToSelectionStart();
  }

  function insertDisplacementFigureAtSelection(duration) {
    if (!state.displacementMode) return false;
    const selection = selectedEntryLocation();
    if (!selection?.entry) return false;
    const insertTick = absoluteTickForLocation(selection);
    if (!Number.isFinite(insertTick)) return false;
    const shouldWriteNote = cursorPitchReadyToWrite();
    saveHistory();
    state.cursorStaffStep = staffStepForSystem(state.cursorStaffStep);
    const entry = makeEntry(shouldWriteNote ? "note" : "rest", duration, state.cursorStaffStep, null);
    setEntryVoice(entry, entryVoice(selection.entry));
    insertEntryAtAbsoluteTickShift(entry, insertTick);
    const inserted = entryLocationById(entry.id);
    if (inserted?.entry?.type === "note") {
      setActiveNote(inserted.entry, state.cursorStaffStep);
      hideCursorPitch();
    } else {
      clearActiveNote();
      hideCursorPitch();
    }
    setCursorFromAbsoluteTick(insertTick + duration.ticks);
    state.cursorActive = true;
    state.entryCursorActive = false;
    clearEntrySelection();
    render();
    return true;
  }

  function selectedRepeatUnits() {
    return Writing.selectedRepeatUnits({
      noteLocations: selectedNoteLocations(),
      entryLocations: selectedEntryLocations(),
      cloneEntryForPaste,
      cloneEntryWithStaffSteps,
      absoluteTickForLocation
    });
  }

  function fillMeasureToTick(measure, tick, measureIndex = state.measures.indexOf(measure), voice = 1) {
    const used = measureUsed(measure, voice);
    if (used + EPSILON < tick) {
      measure.entries.push(...makeRestEntriesForRange(used, tick - used, meterForMeasureIndex(measureIndex)).map((rest) => (
        setEntryVoice(rest, voice)
      )));
    }
  }

  function completeMeasureWithRests(measureIndex, options = {}) {
    const measure = state.measures[measureIndex];
    if (!measure) return false;
    return normalizeMeasure(measure, measureIndex);
  }

  function completeCurrentMeasureWithRests(options = {}) {
    return completeMeasureWithRests(state.cursorMeasure, options);
  }

  function verifyMeasureDuration(measure, measureIndex = state.measures.indexOf(measure)) {
    if (!measure) return false;
    return normalizeMeasure(measure, measureIndex);
  }

  function verifyAllMeasureDurations() {
    let changed = false;
    state.measures.forEach((measure, measureIndex) => {
      changed = verifyMeasureDuration(measure, measureIndex) || changed;
    });
    return changed;
  }

  function makeRestSegment(ticks, tickStart, measureIndex = state.cursorMeasure, voice = 1) {
    return Writing.restSegment({
      ticks,
      tickStart,
      restEntries: makeRestEntriesForRange(tickStart, ticks, meterForMeasureIndex(measureIndex)),
      setEntryVoice,
      voice
    });
  }

  function overwriteEntryInMeasure(measureIndex, tick, entry) {
    ensureMeasure(measureIndex);
    const measure = state.measures[measureIndex];
    const voice = entryVoice(entry);
    const rangeStart = tick;
    const rangeEnd = tick + entry.ticks;
    if (rangeEnd > measureTicksForIndex(measureIndex) + EPSILON) return false;

    fillMeasureToTick(measure, rangeEnd, measureIndex, voice);
    const nextEntries = [];
    measure.entries.forEach((existing) => {
      if (entryVoice(existing) !== voice) {
        nextEntries.push(existing);
        return;
      }
      const start = existing.tickStart;
      const end = start + existing.ticks;
      if (end <= rangeStart + EPSILON || start >= rangeEnd - EPSILON) {
        nextEntries.push(existing);
        return;
      }
      if (start < rangeStart - EPSILON) {
        nextEntries.push(...makeRestSegment(rangeStart - start, start, measureIndex, voice));
      }
      if (end > rangeEnd + EPSILON) {
        nextEntries.push(...makeRestSegment(end - rangeEnd, rangeEnd, measureIndex, voice));
      }
    });

    setEntryVoice(entry, voice);
    entry.tickStart = rangeStart;
    nextEntries.push(entry);
    nextEntries.sort((a, b) => a.tickStart - b.tickStart || entryVoice(a) - entryVoice(b));
    measure.entries = nextEntries;
    normalizeMeasure(measure, measureIndex);
    return true;
  }

  function overwriteEntryAtAbsoluteTick(entry, absoluteTick) {
    let target = measureIndexAndTickFromAbsolute(absoluteTick);
    let measureIndex = target.measureIndex;
    let tick = target.tick;
    if (tick + entry.ticks > measureTicksForIndex(measureIndex) + EPSILON) {
      measureIndex += 1;
      tick = 0;
    }
    return overwriteEntryInMeasure(measureIndex, tick, entry);
  }

  function flattenScoreEntries(options = {}) {
    const voiceFilter = Number(options.voice) === 2 ? 2 : Number(options.voice) === 1 ? 1 : null;
    const items = [];
    state.measures.forEach((measure, measureIndex) => {
      measure.entries.forEach((entry) => {
        if (isMeasureRestEntry(entry)) return;
        if (voiceFilter && entryVoice(entry) !== voiceFilter) return;
        items.push({
          absTick: measureStartAbsoluteTick(measureIndex) + entry.tickStart,
          entry
        });
      });
    });
    return items.sort((a, b) => a.absTick - b.absTick || entryVoice(a.entry) - entryVoice(b.entry));
  }

  function rebuildMeasuresFromAbsoluteItems(items, minimumMeasures = state.measures.length) {
    const maxEnd = items.reduce((max, item) => Math.max(max, item.absTick + item.entry.ticks), 0);
    const metersByIndex = state.measures.map((measure) => measure?.meter || null);
    const keySignaturesByIndex = state.measures.map((measure) => measure?.keySignature || null);
    const hiddenByIndex = state.measures.map((measure) => measure?.hidden === true);
    let measureCount = Math.max(minimumMeasures, 8, 1);
    while (measureStartAbsoluteTick(measureCount) < maxEnd - EPSILON) measureCount += 1;
    state.measures = Array.from({ length: measureCount }, (_, index) => {
      const measure = metersByIndex[index] ? { meter: { ...metersByIndex[index] }, entries: [] } : { entries: [] };
      if (keySignaturesByIndex[index]) measure.keySignature = { ...keySignaturesByIndex[index] };
      if (hiddenByIndex[index]) measure.hidden = true;
      return measure;
    });
    items
      .filter((item) => item.entry.ticks > EPSILON)
      .sort((a, b) => a.absTick - b.absTick || entryVoice(a.entry) - entryVoice(b.entry))
      .forEach((item) => {
        const segments = splitEntryRhythmically(item.entry, item.absTick);
        segments.forEach((segment) => {
          const target = measureIndexAndTickFromAbsolute(segment.absoluteStart);
          const measureIndex = target.measureIndex;
          ensureMeasure(measureIndex);
          segment.entry.tickStart = target.tick;
          state.measures[measureIndex].entries.push(segment.entry);
        });
      });

    state.measures.forEach((measure, measureIndex) => {
      measure.entries.sort((a, b) => a.tickStart - b.tickStart || entryVoice(a) - entryVoice(b));
      normalizeMeasure(measure, measureIndex);
      if (!measure.entries.length) measure.entries.push(makeMeasureRest(measureTicksForIndex(measureIndex)));
    });
    forceScoreSpacingRefresh();
    const systems = Array.isArray(state.systems) ? state.systems : null;
    if (systems?.[renderSystemIndex]) systems[renderSystemIndex].measures = state.measures;
  }

  function insertEntryAtAbsoluteTickShift(entry, absoluteTick) {
    const insertTicks = entry.ticks;
    const items = flattenScoreEntries().map((item) => ({
      absTick: item.absTick >= absoluteTick - EPSILON ? item.absTick + insertTicks : item.absTick,
      entry: item.entry
    }));
    const copy = cloneEntryForPaste(entry);
    copy.id = entry.id;
    items.push({ absTick: absoluteTick, entry: copy });
    rebuildMeasuresFromAbsoluteItems(items);
    return true;
  }

  function insertEntriesAtAbsoluteTickShift(entries, absoluteTick) {
    if (!entries?.length) return [];
    let tick = absoluteTick;
    const insertedIds = [];
    entries.forEach((entry) => {
      const copy = cloneEntryForPaste(entry);
      insertEntryAtAbsoluteTickShift(copy, tick);
      insertedIds.push(copy.id);
      tick += copy.ticks;
    });
    return insertedIds;
  }

  function deleteAbsoluteRangeShift(startTick, ticks) {
    if (ticks <= EPSILON) return false;
    const endTick = startTick + ticks;
    const items = flattenScoreEntries()
      .filter((item) => item.absTick < startTick - EPSILON || item.absTick >= endTick - EPSILON)
      .map((item) => ({
        absTick: item.absTick >= endTick - EPSILON ? item.absTick - ticks : item.absTick,
        entry: item.entry
      }));
    rebuildMeasuresFromAbsoluteItems(items);
    return true;
  }

  function deleteSelectedWithDisplacement() {
    const range = selectedRhythmicRange();
    if (range?.locations?.some((location) => entryVoice(location.entry) !== 1)) return false;
    if (!range || range.ticks <= EPSILON) return false;
    saveHistory();
    deleteAbsoluteRangeShift(range.start, range.ticks);
    setCursorFromAbsoluteTick(range.start);
    state.cursorActive = true;
    state.entryCursorActive = false;
    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();
    render();
    return true;
  }

  function deleteSingleEntryWithDisplacement(location) {
    if (!location?.entry || isMeasureRestEntry(location.entry)) return false;
    if (entryVoice(location.entry) !== 1) return false;
    const start = absoluteTickForLocation(location);
    saveHistory();
    deleteAbsoluteRangeShift(start, location.entry.ticks);
    setCursorFromAbsoluteTick(start);
    state.cursorActive = true;
    state.entryCursorActive = false;
    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();
    render();
    return true;
  }

  function findLastEntryLocation(voice = activeVoice()) {
    return Writing.findLastEntryLocation(state.measures, voice, entryVoice);
  }

  function findPreviousFigureLocation() {
    const activeNote = entryLocationById(state.activeNoteEntryId);
    return Writing.findPreviousFigureLocation({
      activeNoteLocation: activeNote,
      activeVoice: activeVoice(),
      selection: selectedEntryLocation(),
      lastLocation: findLastEntryLocation(activeVoice()),
      entryVoice
    });
  }

  function addDotsToPreviousFigure(dotCount = 1) {
    const location = findPreviousFigureLocation();
    const nextDots = Math.min(2, Math.max(1, Number(dotCount) || 1));
    if (!location?.entry || dotCountForEntry(location.entry) >= nextDots) return false;
    const { measureIndex, entryIndex, entry } = location;
    const measure = state.measures[measureIndex];
    const baseTicks = entryBaseTicks(entry);
    const extraTicks = baseTicks * (dotFactor(nextDots) - dotFactor(dotCountForEntry(entry)));
    const voice = entryVoice(entry);
    const followingAvailable = measure.entries
      .slice(entryIndex + 1)
      .filter((item) => entryVoice(item) === voice)
      .reduce((sum, item) => sum + (Number(item.ticks) || 0), 0);
    if (followingAvailable + EPSILON < extraTicks) return false;

    saveHistory();
    entry.dotted = true;
    entry.dots = nextDots;
    entry.ticks = baseTicks * dotFactor(nextDots);
    consumeFollowingDuration(measure, entryIndex, extraTicks, voice);
    normalizeMeasure(measure);
    const normalizedEntryIndex = measure.entries.indexOf(entry);
    if (normalizedEntryIndex !== -1) {
      if (entry.type === "note") setActiveNote(entry, nearestEntryStaffStep(entry, state.activeNoteStaffStep ?? entryStaffStep(entry)));
      state.cursorMeasure = measureIndex;
      state.cursorTick = entry.tickStart + entry.ticks;
      clearEntrySelection();
    }
    render();
    return true;
  }

  function addDotToPreviousFigure() {
    const location = findPreviousFigureLocation();
    if (!location?.entry) return false;
    if (dotCountForEntry(location.entry) === 0) return addDotsToPreviousFigure(1);
    return removeDotsFromPreviousFigure(location);
  }

  function removeDotsFromPreviousFigure(location = findPreviousFigureLocation()) {
    if (!location?.entry || dotCountForEntry(location.entry) === 0) return false;
    const { measureIndex, entry } = location;
    const measure = state.measures[measureIndex];
    saveHistory();
    entry.ticks = entryBaseTicks(entry);
    entry.dotted = false;
    entry.dots = 0;
    normalizeMeasure(measure, measureIndex);
    const liveLocation = entryLocationById(entry.id);
    if (liveLocation?.entry?.type === "note") {
      setActiveNote(liveLocation.entry, nearestEntryStaffStep(liveLocation.entry, state.activeNoteStaffStep ?? entryStaffStep(liveLocation.entry)));
    }
    render();
    return true;
  }

  function cycleDotsOnPreviousFigure() {
    const location = findPreviousFigureLocation();
    if (!location?.entry) return false;
    const dots = dotCountForEntry(location.entry);
    if (dots === 0) return addDotsToPreviousFigure(1);
    if (dots === 1) return addDotsToPreviousFigure(2);
    return removeDotsFromPreviousFigure(location);
  }

  function addTieFromPreviousNote() {
    const target = findCursorNoteTarget();
    if (!target?.entry || target.entry.type === "rest") return false;
    saveHistory();
    target.entry.tieToNext = true;
    target.entry.tieStaffStep = nearestEntryStaffStep(target.entry, target.staffStep);
    state.pendingTieEntryId = target.entry.id;
    setActiveNote(target.entry, target.entry.tieStaffStep);
    render();
    return true;
  }

  function toggleDurationTieFromCurrentNote() {
    const target = findCursorNoteTarget();
    if (!target?.entry || target.entry.type === "rest") return false;
    saveHistory();
    const nextValue = target.entry.tieToNext !== true;
    target.entry.tieToNext = nextValue;
    target.entry.tieStaffStep = nextValue
      ? nearestEntryStaffStep(target.entry, target.staffStep)
      : null;
    state.pendingTieEntryId = nextValue ? target.entry.id : null;
    if (nextValue) setActiveNote(target.entry, target.entry.tieStaffStep);
    render();
    return true;
  }

  function orderedNoteLocations(voice = null) {
    const voiceFilter = Number(voice) === 2 ? 2 : Number(voice) === 1 ? 1 : null;
    const locations = [];
    state.measures.forEach((measure, measureIndex) => {
      measure.entries.forEach((entry, entryIndex) => {
        if (entry.type === "rest") return;
        if (voiceFilter && entryVoice(entry) !== voiceFilter) return;
        locations.push({
          measureIndex,
          entryIndex,
          entry,
          staffStep: entryStaffStep(entry),
          absoluteTick: measureStartAbsoluteTick(measureIndex) + entry.tickStart
        });
      });
    });
    return locations.sort((a, b) => (
      a.absoluteTick - b.absoluteTick ||
      a.measureIndex - b.measureIndex ||
      a.entryIndex - b.entryIndex
    ));
  }

  function phraseSlurSelectedLocations() {
    const noteLocations = selectedNoteLocations()
      .filter((location) => entryVoice(location.entry) === activeVoice())
      .map((location) => ({
        ...location,
        absoluteTick: absoluteTickForLocation(location)
      }));
    const entryLocations = selectedEntryLocations()
      .filter((location) => location.entry?.type !== "rest" && entryVoice(location.entry) === activeVoice())
      .map((location) => ({
        ...location,
        staffStep: Number.isFinite(state.activeNoteStaffStep)
          ? nearestEntryStaffStep(location.entry, state.activeNoteStaffStep)
          : entryStaffStep(location.entry),
        absoluteTick: absoluteTickForLocation(location)
      }));
    const locations = noteLocations.length ? noteLocations : entryLocations;
    return locations
      .filter((location) => Number.isFinite(location.absoluteTick))
      .sort((a, b) => (
        a.absoluteTick - b.absoluteTick ||
        a.measureIndex - b.measureIndex ||
        a.entryIndex - b.entryIndex
      ));
  }

  function currentPhraseSlurStartLocation() {
    const selected = phraseSlurSelectedLocations();
    if (selected.length) return selected[0];
    const active = findActiveNoteTarget();
    const activeLocation = active?.entry ? entryLocationById(active.entry.id) : null;
    if (activeLocation?.entry) {
      return {
        ...activeLocation,
        staffStep: active.staffStep,
        absoluteTick: absoluteTickForLocation(activeLocation)
      };
    }
    const target = findCursorNoteTarget();
    const targetLocation = target?.entry ? entryLocationById(target.entry.id) : null;
    if (targetLocation?.entry) {
      return {
        ...targetLocation,
        staffStep: target.staffStep,
        absoluteTick: absoluteTickForLocation(targetLocation)
      };
    }
    return null;
  }

  function nextNoteLocationAfter(location) {
    if (!location?.entry) return null;
    const startTick = Number.isFinite(location.absoluteTick)
      ? location.absoluteTick
      : absoluteTickForLocation(location);
    const voice = entryVoice(location.entry);
    return orderedNoteLocations(voice).find((candidate) => (
      candidate.entry.id !== location.entry.id &&
      candidate.absoluteTick > startTick + EPSILON
    )) || null;
  }

  function addPhraseSlur(slurType = "slur") {
    const selected = phraseSlurSelectedLocations();
    const start = selected[0] || currentPhraseSlurStartLocation();
    if (!start?.entry || start.entry.type === "rest") return false;
    const selectedEnd = selected.length > 1 ? selected.at(-1) : null;
    const end = selectedEnd && selectedEnd.entry.id !== start.entry.id
      ? selectedEnd
      : nextNoteLocationAfter(start) || start;
    saveHistory();
    state.marks.push({
      id: createMarkId(),
      type: slurType === "dotted-slur" ? "dotted-slur" : "slur",
      measureIndex: start.measureIndex,
      tick: start.entry.tickStart,
      staffStep: start.staffStep,
      entryId: start.entry.id,
      endEntryId: end.entry.id,
      endStaffStep: end.staffStep
    });
    render();
    return true;
  }

  function stopPhraseSlurInput() {
    const target = findCursorNoteTarget();
    if (!target?.entry || target.entry.type === "rest") return false;
    const targetLocation = entryLocationById(target.entry.id);
    if (!targetLocation) return false;
    const pending = [...state.marks].reverse().find((mark) => (
      isPhraseSlurMark(mark) &&
      mark.entryId &&
      mark.endEntryId === mark.entryId
    ));
    if (!pending) return false;
    saveHistory();
    pending.endEntryId = target.entry.id;
    pending.endStaffStep = target.staffStep;
    render();
    return true;
  }

  function isPhraseSlurMark(mark) {
    return mark?.type === "slur" || mark?.type === "dotted-slur";
  }

  function selectedPhraseSlurMarks(extraMark = null) {
    return Marks.selectedPhraseSlurs(state.marks, state.selectedMarkIds, extraMark);
  }

  function applyPhraseSlurType(slurType = "slur") {
    const type = slurType === "dotted-slur" ? "dotted-slur" : "slur";
    const marks = selectedPhraseSlurMarks();
    if (!marks.length) return addPhraseSlur(type);
    const changed = marks.some((mark) => mark.type !== type);
    if (!changed) return true;
    saveHistory();
    marks.forEach((mark) => {
      mark.type = type;
    });
    render();
    return true;
  }

  function flipSelectedPhraseSlurs(targetMark = null) {
    const marks = selectedPhraseSlurMarks(targetMark);
    if (!marks.length) return false;
    saveHistory();
    marks.forEach((mark) => {
      mark.flipped = !mark.flipped;
    });
    render();
    return true;
  }

  function isFlippableMark(mark) {
    return isPhraseSlurMark(mark) || ["accent", "fermata", "glyph"].includes(mark?.type);
  }

  function selectedFlippableMarks(extraMark = null) {
    const selected = new Set(state.selectedMarkIds || []);
    const marks = state.marks.filter((mark) => selected.has(mark.id) && isFlippableMark(mark));
    if (isFlippableMark(extraMark) && !marks.some((mark) => mark.id === extraMark.id)) {
      marks.push(extraMark);
    }
    return marks;
  }

  function flipSelectedMarks(targetMark = null) {
    const marks = selectedFlippableMarks(targetMark);
    if (!marks.length) return false;
    saveHistory();
    marks.forEach((mark) => {
      mark.flipped = !mark.flipped;
    });
    render();
    return true;
  }

  function selectedBeamGroupsForFlip(location = null) {
    const selectedEntries = selectedEntryLocations().filter((item) => item.entry?.type === "note");
    const candidates = selectedEntries.length > 1
      ? selectedEntries
      : location?.entry
        ? [location]
        : selectedEntries;
    const seen = new Set();
    return candidates.map((candidate) => beamedGroupForLocation(candidate))
      .filter((group) => group?.length)
      .filter((group) => {
        const key = group.map((item) => item.entry.id).join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function moveActiveNotePitch(direction) {
    if (activeSystemIsPercussionLine()) return false;
    const target = findActiveNoteTarget();
    if (!target || !selectedEntryLocation()) return false;
    const { entry, staffStep } = target;
    const nextStep = staffStep + direction;
    if (Math.abs(nextStep - staffStep) < EPSILON) return true;

    saveHistory();
    const previousAccidental = getEntryAccidental(entry, staffStep);
    const steps = entryStaffSteps(entry).map((step) => (
      Math.abs(step - staffStep) < EPSILON ? nextStep : step
    ));
    setEntryStaffSteps(entry, steps);
    if (previousAccidental) setEntryAccidental(entry, nextStep, previousAccidental);
    normalizeChordSpellingAndSymbol(selectedEntryLocation());
    const selectedStep = nearestEntryStaffStep(entry, nextStep);
    setActiveNote(entry, selectedStep);
    state.cursorStaffStep = selectedStep;
    render();
    return true;
  }

  function moveSelectedNotesPitch(direction) {
    if (activeSystemIsPercussionLine()) return false;
    const noteLocations = selectedNoteLocations();
    const fullEntries = selectedEntryLocations().filter((location) => location.entry.type === "note");
    if (!noteLocations.length && !fullEntries.length) return false;

    saveHistory();
    const selectedStepsByEntry = new Map();
    noteLocations.forEach((location) => {
      if (!selectedStepsByEntry.has(location.entry.id)) selectedStepsByEntry.set(location.entry.id, new Set());
      selectedStepsByEntry.get(location.entry.id).add(location.staffStep);
    });
    fullEntries.forEach((location) => {
      selectedStepsByEntry.set(location.entry.id, new Set(entryStaffSteps(location.entry)));
    });

    const nextNoteRefs = [];
    [...selectedStepsByEntry.entries()].forEach(([entryId, selectedSteps]) => {
      const location = entryLocationById(entryId);
      if (!location?.entry || location.entry.type === "rest") return;
      const entry = location.entry;
      const accidentalMoves = [];
      const movedSteps = [];
      const nextSteps = entryStaffSteps(entry).map((staffStep) => {
        if (!selectedSteps.has(staffStep)) return staffStep;
        const nextStep = staffStep + direction;
        const accidental = getEntryAccidental(entry, staffStep);
        if (accidental) accidentalMoves.push({ from: staffStep, to: nextStep, accidental });
        movedSteps.push(nextStep);
        return nextStep;
      });
      setEntryStaffSteps(entry, nextSteps);
      accidentalMoves.forEach(({ from, to, accidental }) => {
        clearEntryAccidental(entry, from);
        setEntryAccidental(entry, to, accidental);
      });
      normalizeChordSpellingAndSymbol(location);
      movedSteps.forEach((staffStep) => {
        nextNoteRefs.push({ entryId, staffStep: nearestEntryStaffStep(entry, staffStep) });
      });
    });

    state.selectedNoteRefs = nextNoteRefs;
    if (nextNoteRefs.length) {
      state.cursorEntryId = nextNoteRefs[0].entryId;
      state.cursorStaffStep = nextNoteRefs[0].staffStep;
      const first = entryLocationById(nextNoteRefs[0].entryId);
      if (first?.entry) setActiveNote(first.entry, nextNoteRefs[0].staffStep);
    }
    render();
    return true;
  }

  function clearActiveAccidental() {
    const target = findCursorNoteTarget();
    if (!target) return false;
    saveHistory();
    clearEntryAccidental(target.entry, target.staffStep);
    setActiveNote(target.entry, target.staffStep);
    render();
    auditionEntryStaffStep(target.entry, target.staffStep);
    return true;
  }

  function toggleSelectedFlip(targetMark = null) {
    if (flipSelectedMarks(targetMark)) return true;
    const location = selectedEntryLocation();
    const groups = selectedBeamGroupsForFlip(location);
    if (!groups.length) return false;
    saveHistory();
    groups.forEach((group) => {
      const current = beamedGroupDirection(group);
      group.forEach((item) => {
        item.entry.manualStemDirection = -current;
      });
      state.marks.forEach((mark) => {
        if (group.some((item) => item.entry.id === mark.entryId) && ["accent", "fermata", "glyph"].includes(mark.type)) {
          mark.flipped = !mark.flipped;
        }
      });
    });
    render();
    return true;
  }

  function selectedBeamLocations() {
    const byId = new Map();
    const add = (location) => {
      if (!location?.entry || location.entry.type === "rest" || entryDuration(location.entry).flags < 1) return;
      byId.set(location.entry.id, entryLocationById(location.entry.id) || location);
    };
    selectedEntryLocations().forEach(add);
    selectedNoteLocations().forEach(add);
    add(selectedEntryLocation());
    return [...byId.values()].sort((a, b) => (
      a.measureIndex - b.measureIndex ||
      a.entry.tickStart - b.entry.tickStart ||
      a.entryIndex - b.entryIndex
    ));
  }

  function manualBeamGroupId() {
    return crypto.randomUUID ? crypto.randomUUID() : `beam-${Date.now()}-${Math.random()}`;
  }

  function nextBeamLocationAfter(location) {
    if (!location?.entry) return null;
    const entries = state.measures[location.measureIndex]?.entries || [];
    const voice = entryVoice(location.entry);
    for (let entryIndex = location.entryIndex + 1; entryIndex < entries.length; entryIndex += 1) {
      const entry = entries[entryIndex];
      if (entryVoice(entry) === voice && entry.type !== "rest" && entryDuration(entry).flags > 0) {
        return { measureIndex: location.measureIndex, entryIndex, entry };
      }
    }
    return null;
  }

  function restsBetweenCanBelongToBeam(previous, next) {
    const entries = state.measures[next.measureIndex]?.entries || [];
    const tupletId = next.entry.tuplet?.id || "";
    const voice = entryVoice(next.entry);
    return entries
      .slice(previous.entryIndex + 1, next.entryIndex)
      .filter((entry) => entryVoice(entry) === voice)
      .every((entry) => entry.type === "rest" && (entry.tuplet?.id || "") === tupletId);
  }

  function autoBeamWouldJoin(previous, next) {
    if (!previous?.entry || !next?.entry || previous.measureIndex !== next.measureIndex) return false;
    if (entryVoice(previous.entry) !== entryVoice(next.entry)) return false;
    if (previous.entry.type === "rest" || next.entry.type === "rest") return false;
    if (entryDuration(previous.entry).flags < 1 || entryDuration(next.entry).flags < 1) return false;
    const previousTuplet = previous.entry.tuplet?.id || "";
    const nextTuplet = next.entry.tuplet?.id || "";
    if (previousTuplet || nextTuplet) {
      if (previousTuplet !== nextTuplet) return false;
      const previousEnd = (Number(previous.entry.tuplet?.index) || 0) + Math.max(1, Number(previous.entry.tuplet?.span) || 1);
      const nextStart = Number(next.entry.tuplet?.index) || 0;
      return previousEnd === nextStart || restsBetweenCanBelongToBeam(previous, next);
    }

    const samePulse = pulseIndexForTick(previous.entry.tickStart) === pulseIndexForTick(next.entry.tickStart);
    const halfMeasureTicks = Math.max(1, measureTicks() / 2);
    const sameEighthHalfMeasure =
      entryDuration(previous.entry).flags === 1 &&
      entryDuration(next.entry).flags === 1 &&
      activeMeterProfile().kind === "simple" &&
      Math.floor(previous.entry.tickStart / halfMeasureTicks) === Math.floor(next.entry.tickStart / halfMeasureTicks);
    const rhythmicallyAdjacent = next.entry.tickStart >= previous.entry.tickStart + previous.entry.ticks - EPSILON;
    return rhythmicallyAdjacent && (samePulse || sameEighthHalfMeasure);
  }

  function manualBeamRelationshipIsConnected(previous, next) {
    if (!previous?.entry || !next?.entry) return false;
    if (next.entry.manualBeamBreakBefore === true || previous.entry.manualBeamBreakAfter === true) return false;
    const previousGroup = previous.entry.manualBeamGroup || "";
    const nextGroup = next.entry.manualBeamGroup || "";
    if (previousGroup || nextGroup) return !!previousGroup && previousGroup === nextGroup;
    return autoBeamWouldJoin(previous, next);
  }

  function connectManualBeamForward(previous, next) {
    const groupId = previous.entry.manualBeamGroup || manualBeamGroupId();
    previous.entry.manualBeamGroup = groupId;
    next.entry.manualBeamGroup = groupId;
    delete next.entry.manualBeamBreakBefore;
    delete previous.entry.manualBeamBreakAfter;
  }

  function disconnectManualBeamForward(previous, next) {
    next.entry.manualBeamBreakBefore = true;
  }

  function toggleManualBeaming() {
    const locations = selectedBeamLocations();
    if (!locations.length) return false;
    const voice = entryVoice(locations[0].entry);
    if (!locations.every((location) => entryVoice(location.entry) === voice)) return false;
    if (locations.length === 1) {
      const next = nextBeamLocationAfter(locations[0]);
      if (!next) return false;
      saveHistory();
      if (manualBeamRelationshipIsConnected(locations[0], next)) disconnectManualBeamForward(locations[0], next);
      else connectManualBeamForward(locations[0], next);
      render();
      return true;
    }

    saveHistory();
    const existingGroup = locations[0].entry.manualBeamGroup || null;
    const allSameManualGroup = !!existingGroup &&
      locations.every((location) => location.entry.manualBeamGroup === existingGroup);

    if (allSameManualGroup) {
      locations.forEach((location) => {
        delete location.entry.manualBeamGroup;
      });
    } else {
      const groupId = manualBeamGroupId();
      locations.forEach((location) => {
        location.entry.manualBeamGroup = groupId;
        delete location.entry.manualBeamBreakBefore;
      });
    }
    render();
    return true;
  }

  function beamedGroupForLocation(location) {
    if (!location?.entry || location.entry.type === "rest" || entryDuration(location.entry).flags < 1) {
      return location?.entry ? [location] : [];
    }
    const measure = state.measures[location.measureIndex];
    if (location.entry.manualBeamGroup) {
      const manualCandidates = measure.entries
        .map((entry, entryIndex) => ({ measureIndex: location.measureIndex, entryIndex, entry }))
        .filter((item) => (
          item.entry.type !== "rest" &&
          entryDuration(item.entry).flags > 0 &&
          entryVoice(item.entry) === entryVoice(location.entry) &&
          item.entry.manualBeamGroup === location.entry.manualBeamGroup
        ));
      if (manualCandidates.length) return manualCandidates;
    }
    const pulse = pulseIndexForTick(location.entry.tickStart);
    const candidates = measure.entries
      .map((entry, entryIndex) => ({ measureIndex: location.measureIndex, entryIndex, entry }))
      .filter((item) => (
        item.entry.type !== "rest" &&
        entryDuration(item.entry).flags > 0 &&
        entryVoice(item.entry) === entryVoice(location.entry) &&
        pulseIndexForTick(item.entry.tickStart) === pulse
      ));
    return candidates.length ? candidates : [location];
  }

  function beamedGroupDirection(group) {
    if (!group.length) return 1;
    const manual = group.find((item) => item.entry.manualStemDirection === 1 || item.entry.manualStemDirection === -1);
    if (manual) return manual.entry.manualStemDirection;
    return group.reduce((sum, item) => sum + stemDirection(item.entry), 0) >= 0 ? 1 : -1;
  }

  function beamGeometryForPositionedGroup(group, positionedByEntryId) {
    const positionedGroup = [...(group || [])]
      .map((item) => {
        const positioned = positionedByEntryId.get(item.entry.id);
        if (!positioned) return null;
        return { ...item, x: positioned.x };
      })
      .filter(Boolean)
      .sort((a, b) => a.measureIndex - b.measureIndex || a.entry.tickStart - b.entry.tickStart || a.entryIndex - b.entryIndex);
    if (positionedGroup.length < 2) return null;
    const direction = beamedGroupDirection(positionedGroup);
    const first = positionedGroup[0];
    const last = positionedGroup.at(-1);
    const stemData = positionedGroup.map((item) => {
      const staffSteps = entryStaffSteps(item.entry);
      const outerStep = direction > 0 ? Math.max(...staffSteps) : Math.min(...staffSteps);
      const stemX = stemXForEntry(item.entry, item.x, direction);
      const stemEnd = pitchY(outerStep + direction * STEM_OCTAVE_STEPS);
      return { ...item, stemX, stemEnd };
    });
    const firstData = stemData[0];
    const lastData = stemData.at(-1);
    const preliminaryY = direction > 0
      ? Math.min(...stemData.map((item) => item.stemEnd)) - 2
      : Math.max(...stemData.map((item) => item.stemEnd)) + 2;
    const y = avoidBeamCollisions(preliminaryY, direction, firstData.stemX, lastData.stemX, [], beamThickness());
    const yStart = y + (Number(first.entry.manualBeamStartYOffset) || 0);
    const yEnd = y + (Number(last.entry.manualBeamEndYOffset) || 0);
    const xStart = visualStemX(firstData.stemX, direction) + appearanceValue("beamOffsetX");
    const xEnd = visualStemX(lastData.stemX, direction) + appearanceValue("beamOffsetX");
    const visualYStart = visualStemY(yStart, direction) + appearanceValue("beamOffsetY");
    const visualYEnd = visualStemY(yEnd, direction) + appearanceValue("beamOffsetY");
    const yAtX = (x) => {
      const span = xEnd - xStart;
      if (Math.abs(span) < EPSILON) return visualYStart;
      const ratio = (x - xStart) / span;
      return visualYStart + (visualYEnd - visualYStart) * ratio;
    };
    return {
      direction,
      first: firstData,
      last: lastData,
      xStart,
      xEnd,
      yAtX
    };
  }

  function normalizedBeamGroupForEdit(location) {
    const group = beamedGroupForLocation(location);
    return group
      .filter((item) => item?.entry?.type === "note" && entryDuration(item.entry).flags > 0)
      .sort((a, b) => a.measureIndex - b.measureIndex || a.entry.tickStart - b.entry.tickStart || a.entryIndex - b.entryIndex);
  }

  function beamEndpointEntries(location) {
    const group = normalizedBeamGroupForEdit(location);
    if (group.length < 2) return null;
    return { group, first: group[0].entry, last: group.at(-1).entry };
  }

  function setBeamEndpointOffset(location, endpoint, value) {
    const endpoints = beamEndpointEntries(location);
    if (!endpoints) return false;
    saveHistory();
    const target = endpoint === "end" ? endpoints.last : endpoints.first;
    const key = endpoint === "end" ? "manualBeamEndYOffset" : "manualBeamStartYOffset";
    const nextValue = Math.max(-80, Math.min(80, Number(value) || 0));
    if (Math.abs(nextValue) < EPSILON) delete target[key];
    else target[key] = nextValue;
    render();
    return true;
  }

  function nudgeBeamEndpoint(location, endpoint, delta) {
    const endpoints = beamEndpointEntries(location);
    if (!endpoints) return false;
    const target = endpoint === "end" ? endpoints.last : endpoints.first;
    const key = endpoint === "end" ? "manualBeamEndYOffset" : "manualBeamStartYOffset";
    return setBeamEndpointOffset(location, endpoint, (Number(target[key]) || 0) + delta);
  }

  async function requestBeamEndpointOffsets(location) {
    const endpoints = beamEndpointEntries(location);
    if (!endpoints) return false;
    const start = Number(endpoints.first.manualBeamStartYOffset) || 0;
    const end = Number(endpoints.last.manualBeamEndYOffset) || 0;
    const value = await requestEditorPopup({
      title: "Extremos del barrado",
      initialValue: `${start}, ${end}`,
      help: "Escribe dos valores en px: primera, última. Negativo sube el extremo; positivo lo baja. Ejemplo: -8, 6."
    });
    if (value === null) return false;
    const parts = String(value).split(/[,\s]+/).map(Number).filter(Number.isFinite);
    if (parts.length < 2) {
      await showEditorMessage("Escribe dos valores: primera, última. Ejemplo: -8, 6.");
      return false;
    }
    saveHistory();
    const [nextStart, nextEnd] = parts;
    if (Math.abs(nextStart) < EPSILON) delete endpoints.first.manualBeamStartYOffset;
    else endpoints.first.manualBeamStartYOffset = Math.max(-80, Math.min(80, nextStart));
    if (Math.abs(nextEnd) < EPSILON) delete endpoints.last.manualBeamEndYOffset;
    else endpoints.last.manualBeamEndYOffset = Math.max(-80, Math.min(80, nextEnd));
    render();
    return true;
  }

  function resetBeamEndpointOffsets(location) {
    const endpoints = beamEndpointEntries(location);
    if (!endpoints) return false;
    saveHistory();
    delete endpoints.first.manualBeamStartYOffset;
    delete endpoints.last.manualBeamEndYOffset;
    render();
    return true;
  }

  function deleteSelectedAsRests() {
    if (state.displacementMode && activeVoice() === 1 && deleteSelectedWithDisplacement()) return true;
    const noteLocations = selectedNoteLocations();
    const noteEntryIds = new Set(noteLocations.map((location) => location.entry.id));
    const selectedEntryLocationsForDelete = selectedEntryLocations()
      .filter((location) => !noteEntryIds.has(location.entry.id));
    const fullEntryIds = new Set(selectedEntryLocationsForDelete.map((location) => location.entry.id));
    if (!fullEntryIds.size && !noteLocations.length) return false;
    const entryLocationsBeforeDelete = selectedEntryLocationsForDelete;
    const firstAffected = [...entryLocationsBeforeDelete, ...noteLocations]
      .sort((a, b) => (
        a.measureIndex - b.measureIndex ||
        a.entry.tickStart - b.entry.tickStart ||
        a.entryIndex - b.entryIndex
      ))[0] || null;

    saveHistory();
    const noteStepsByEntry = new Map();
    noteLocations.forEach((location) => {
      if (!noteStepsByEntry.has(location.entry.id)) noteStepsByEntry.set(location.entry.id, []);
      noteStepsByEntry.get(location.entry.id).push(location.staffStep);
    });

    state.measures.forEach((measure) => {
      for (let entryIndex = measure.entries.length - 1; entryIndex >= 0; entryIndex -= 1) {
        const entry = measure.entries[entryIndex];
        if (fullEntryIds.has(entry.id)) {
          replaceEntryWithRests(measure, entryIndex, false);
          continue;
        }
        const selectedSteps = noteStepsByEntry.get(entry.id);
        if (!selectedSteps?.length || entry.type === "rest") continue;
        if (!removeSelectedHeadsFromEntry(entry, selectedSteps)) {
          replaceEntryWithRests(measure, entryIndex, false);
        }
      }
      normalizeMeasure(measure);
    });

    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = true;
    if (firstAffected) {
      state.cursorMeasure = firstAffected.measureIndex;
      state.cursorTick = firstAffected.entry.tickStart;
    }
    render();
    return true;
  }

  function deleteActiveNoteOrCursorEntry() {
    if (state.displacementMode && activeVoice() === 1) {
      if (deleteSelectedWithDisplacement()) return true;
      const target = findActiveNoteTarget();
      const location = target ? entryLocationById(target.entry.id) : selectedEntryLocation();
      if (location?.entry) return deleteSingleEntryWithDisplacement(location);
    }
    const simpleSelection = selectedEntryLocation();
    if (
      simpleSelection?.entry?.type === "rest" &&
      !state.selectedNoteRefs.length &&
      (state.selectedEntryIds.length <= 1 || state.selectedEntryIds.includes(simpleSelection.entry.id))
    ) {
      return deleteEntryAt(simpleSelection.measureIndex, simpleSelection.entryIndex);
    }
    if (deleteSelectedAsRests()) return true;
    const target = findActiveNoteTarget();
    const location = target ? entryLocationById(target.entry.id) : null;
    if (target && location?.entry?.type === "note") {
      const { entry } = location;
      const steps = entryStaffSteps(entry);
      if (steps.length > 1) {
        saveHistory();
        const remainingSteps = steps.filter((step) => Math.abs(step - target.staffStep) > EPSILON);
        clearEntryAccidental(entry, target.staffStep);
        setEntryStaffSteps(entry, remainingSteps);
        setActiveNote(entry, remainingSteps[0] ?? entryStaffStep(entry));
        state.cursorStaffStep = state.activeNoteStaffStep ?? state.cursorStaffStep;
        render();
        return true;
      }
      saveHistory();
      const keepMeasure = state.cursorMeasure;
      const keepTick = state.cursorTick;
      const keepStaffStep = target.staffStep;
      replaceEntryWithRests(state.measures[location.measureIndex], location.entryIndex, true, { explicitRest: true });
      clearEntrySelection();
      clearActiveNote();
      state.cursorMeasure = keepMeasure;
      state.cursorTick = keepTick;
      state.cursorStaffStep = keepStaffStep;
      showCursorPitchAtCursor();
      state.cursorActive = true;
      state.entryCursorActive = false;
      render();
      return true;
    }
    const selection = selectedEntryLocation();
    if (selection?.entry) {
      saveHistory();
      state.cursorMeasure = selection.measureIndex;
      state.cursorTick = selection.entry.tickStart;
      replaceEntryWithRests(state.measures[selection.measureIndex], selection.entryIndex);
      clearEntrySelection();
      clearActiveNote();
      hideCursorPitch();
      state.cursorActive = true;
      render();
      return true;
    }
    return deleteCursorEntry();
  }

  function deleteEntryAt(measureIndex, entryIndex) {
    const measure = state.measures[measureIndex];
    const entry = measure?.entries[entryIndex];
    if (!entry) return false;

    if (state.displacementMode && entryVoice(entry) === 1) return deleteSingleEntryWithDisplacement({ measureIndex, entryIndex, entry });

    const nextTick = entry.tickStart;
    saveHistory();
    if (entry.type === "rest" && !isMeasureRestEntry(entry, measureIndex)) {
      const voice = entryVoice(entry);
      measure.entries.splice(entryIndex, 1);
      verifyMeasureDuration(measure, measureIndex);
      state.cursorMeasure = measureIndex;
      state.cursorTick = nextTick;
      state.cursorActive = true;
      state.entryCursorActive = false;
      clearEntrySelection();
      clearActiveNote();
      hideCursorPitch();
      render();
      return true;
    }
    if (state.activeNoteEntryId === entry.id) clearActiveNote();
    replaceEntryWithRests(measure, entryIndex);
    state.cursorMeasure = measureIndex;
    state.cursorTick = nextTick;
    state.cursorActive = true;
    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();

    render();
    return true;
  }

  function deleteCursorEntry() {
    const selection = selectedEntryLocation();
    if (selection) return deleteEntryAt(selection.measureIndex, selection.entryIndex);

    for (let measureIndex = state.cursorMeasure; measureIndex >= 0; measureIndex -= 1) {
      const entries = state.measures[measureIndex].entries;
      for (let entryIndex = entries.length - 1; entryIndex >= 0; entryIndex -= 1) {
        const entry = entries[entryIndex];
        if (entryVoice(entry) !== activeVoice()) continue;
        if (
          measureIndex < state.cursorMeasure ||
          entry.tickStart < state.cursorTick - EPSILON
        ) {
          return deleteEntryAt(measureIndex, entryIndex);
        }
      }
    }
    return false;
  }

  function undo() {
    return History.undo(state, {
      snapshot: stateSnapshot,
      restore
    });
  }

  function redo() {
    return History.redo(state, {
      snapshot: stateSnapshot,
      restore
    });
  }

  function clearScore() {
    saveHistory();
    state.cursorMeasure = 0;
    state.cursorTick = 0;
    state.cursorStaffStep = 0;
    state.cursorEntryId = null;
    state.selectedEntryIds = [];
    state.selectedNoteRefs = [];
    state.dragSelection = null;
    clearActiveNote();
    hideCursorPitch();
    state.cursorActive = false;
    state.pendingTupletRatio = null;
    state.keySignature = null;
    state.measureWidthOverrides = [];
    state.systems = createDefaultSystems();
    state.measures = state.systems[0].measures;
    state.activeSystemIndex = 0;
    state.marks = [];
    state.textItems = [];
    state.activeTextId = null;
    state.selectedTextIds = [];
    state.selectedMarkIds = [];
    state.selectMode = false;
    state.dynamicMode = false;
    state.line2Mode = false;
    render();
  }

  function refreshDurationButtons() {
    ModeControls.refreshDurationButtons(durationTools, state);
  }

  function setMode(mode) {
    ModeControls.setEntryMode(state, mode);
    noteModeButton.classList.toggle("is-active", mode === "note");
    restModeButton.classList.toggle("is-active", mode === "rest");
    refreshDurationButtons();
    updateModeButtons();
  }

  function updateModeButtons() {
    const inputSession = syncInputSession();
    document.documentElement.dataset.inputPhase = inputSession.phase;
    document.documentElement.dataset.inputVoice = String(activeVoice());
    document.documentElement.dataset.inputDuration = state.activeDuration?.id || "";
    document.documentElement.dataset.inputGrid = state.gridDurationId || DEFAULT_GRID_DURATION_ID;
    document.documentElement.dataset.inputChord = state.noteChordMode ? "true" : "false";
    document.documentElement.dataset.inputInsert = state.displacementMode ? "true" : "false";
    document.documentElement.dataset.inputLockDuration = state.lockDurationMode ? "true" : "false";
    document.documentElement.dataset.inputForceDuration = state.forceDurationMode ? "true" : "false";
    document.documentElement.dataset.inputPitchBeforeDuration = state.pitchBeforeDurationMode ? "true" : "false";
    shiftModeButton?.classList.toggle("is-active", state.displacementMode);
    editModeButton?.classList.toggle("is-active", state.editMode === true);
    textModeButton?.classList.toggle("is-active", state.textMode);
    chordModeButton?.classList.toggle("is-active", state.chordMode);
    dynamicsButton?.classList.toggle("is-active", state.dynamicMode);
    reflowButton?.classList.toggle("is-active", state.compactLayout === true);
    reflowButton?.setAttribute("aria-pressed", state.compactLayout === true ? "true" : "false");
    jazzModeButton?.classList.toggle("is-active", state.jazzMode === true);
    if (jazzModeButton) {
      const presetLabel = currentJazzSwingPreset().label || "Jazz mode";
      jazzModeButton.title = state.jazzMode === true ? `Jazz mode: ${presetLabel}` : "Jazz mode";
    }
    const drawerOpen = durationDrawer && !durationDrawer.classList.contains("is-hidden");
    selectToolButton?.classList.toggle(
      "is-active",
      !drawerOpen &&
        !state.displacementMode &&
        !state.textMode &&
        !state.chordMode &&
        !state.dynamicMode &&
        !state.editMode &&
        !state.activeTuplet &&
        !state.pendingTupletRatio &&
        state.selectMode
    );
    [...durationTools.querySelectorAll("[data-tuplet-actual]")].forEach((button) => {
      button.classList.toggle("is-active", sameTupletConfig(state.activeTuplet, {
        actual: button.dataset.tupletActual,
        normal: button.dataset.tupletNormal,
        unitDurationId: button.dataset.tupletUnit
      }));
    });
    [...durationTools.querySelectorAll("[data-custom-tuplet]")].forEach((button) => {
      button.classList.toggle("is-active", !!state.pendingTupletRatio);
    });
    [...durationTools.querySelectorAll("[data-line2-toggle]")].forEach((button) => {
      button.classList.toggle("is-active", state.line2Mode === true);
    });
    [...durationTools.querySelectorAll("[data-voice-mode]")].forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.voiceMode) === activeVoice());
    });
    [...durationTools.querySelectorAll("[data-jazz-swing-preset]")].forEach((button) => {
      button.classList.toggle(
        "is-active",
        state.jazzMode === true && button.dataset.jazzSwingPreset === normalizeJazzSwingPreset(state.jazzSwingPreset)
      );
    });
    [...durationTools.querySelectorAll("[data-note-input-modifier]")].forEach((button) => {
      const key = button.dataset.noteInputModifier;
      button.classList.toggle("is-active", inputSession.input[key] === true);
    });
    textToolbar?.classList.toggle("is-hidden", !(state.textMode || state.chordMode || state.dynamicMode));
    populateFontSelect(textFontSelect, state.textStyle.font || appearanceFont("canvasTextFont", "Ink Free"));
    if (textSizeInput) textSizeInput.value = String(state.textStyle.size);
    if (textColorInput) textColorInput.value = state.textStyle.color;
    if (textEnclosureSelect) textEnclosureSelect.value = state.textStyle.enclosure;
    if (textAlignSelect) textAlignSelect.value = normalizeTextAlign(state.textStyle.align || "left");
    const activeItemColorInput = itemColorInput || document.getElementById("itemColorInput");
    const activeZoomLabel = zoomLabel || document.getElementById("zoomLabel");
    const activeHideMeasureButton = hideMeasureButton || document.getElementById("hideMeasureButton");
    if (gridDurationSelect && gridDurationSelect.value !== (state.gridDurationId || DEFAULT_GRID_DURATION_ID)) {
      gridDurationSelect.value = state.gridDurationId || DEFAULT_GRID_DURATION_ID;
    }
    if (playbackBpmInput && Number(playbackBpmInput.value) !== normalizePlaybackBpm(state.playbackBpm)) {
      playbackBpmInput.value = String(normalizePlaybackBpm(state.playbackBpm));
    }
    if (activeItemColorInput) activeItemColorInput.value = selectedItemColor();
    if (activeZoomLabel) activeZoomLabel.textContent = Viewport.zoomLabel(state.zoom || 1);
    activeHideMeasureButton?.classList.toggle("is-active", measureIsHidden(selectedMeasureIndex()));
    updateMidiControls();
  }

  function setZoom(nextZoom) {
    state.zoom = Viewport.clampZoom(nextZoom, 1);
    canvasAutosaveDirty = true;
    invalidateLayoutCache();
    render();
  }

  function zoomBy(delta) {
    setZoom((state.zoom || 1) + delta);
  }

  async function toggleEditorFullscreen() {
    const target = document.querySelector(".editor-workbench");
    if (!target) return false;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
    } catch {
      showEditorMessage("El navegador no permitió activar pantalla completa.");
      return false;
    }
    return true;
  }

  function setDisplacementMode(enabled) {
    if (enabled) state.selectMode = false;
    state.displacementMode = enabled;
    updateModeButtons();
  }

  function toggleDisplacementMode() {
    setDisplacementMode(!state.displacementMode);
  }

  function toggleLine2Mode() {
    return setVoiceMode(state.line2Mode ? 1 : 2);
  }

  function setVoiceMode(voice = 1) {
    const nextVoice = Number(voice) === 2 ? 2 : 1;
    state.line2Mode = nextVoice === 2;
    state.editMode = false;
    if (nextVoice === 2 && isNoteInputMode()) {
      state.textMode = false;
      state.chordMode = false;
      state.dynamicMode = false;
      clearMeasureSelection();
      clearEntrySelection();
      clearActiveNote();
      hideCursorPitch();
      clearTextSelection();
      clearMarkSelection();
      state.cursorActive = true;
      state.entryCursorActive = false;
    } else if (isNoteInputMode()) {
      clearEntrySelection();
      clearActiveNote();
      hideCursorPitch();
    }
    syncInputSession();
    updateModeButtons();
    render();
    return true;
  }

  function setTextMode(enabled) {
    ModeControls.setTextualMode(state, "textMode", enabled);
    updateModeButtons();
  }

  function toggleTextMode() {
    setTextMode(!state.textMode);
  }

  function setChordMode(enabled) {
    ModeControls.setTextualMode(state, "chordMode", enabled);
    updateModeButtons();
  }

  function toggleChordMode() {
    setChordMode(!state.chordMode);
  }

  function setDynamicMode(enabled) {
    ModeControls.setTextualMode(state, "dynamicMode", enabled);
    updateModeButtons();
  }

  function toggleDynamicMode() {
    setDynamicMode(!state.dynamicMode);
  }

  function setEditMode(enabled) {
    if (ModeControls.setEditMode(state, enabled)) {
      closePaletteDrawer();
      clearActiveNote();
      hideCursorPitch();
    }
    updateModeButtons();
    render();
  }

  function toggleEditMode() {
    setEditMode(!state.editMode);
  }

  function activateDynamicsTool() {
    closePaletteDrawer();
    if (addDynamicItemAtCurrentNote()) {
      setDynamicMode(false);
      return;
    }
    setDynamicMode(true);
  }

  function textItemById(id) {
    return state.textItems.find((item) => item.id === id) || null;
  }

  function selectedTextItem() {
    return textItemById(state.activeTextId);
  }

  function selectedTextItems() {
    const ids = new Set(state.selectedTextIds || []);
    if (state.activeTextId) ids.add(state.activeTextId);
    return TextItems.selected(state.textItems, ids);
  }

  function createTextId() {
    return crypto.randomUUID ? crypto.randomUUID() : `text-${Date.now()}-${Math.random()}`;
  }

  function svgPointToClient(point) {
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    const width = viewBox?.width || rect.width || 1;
    const height = viewBox?.height || rect.height || 1;
    return {
      x: rect.left + ((point.x - (viewBox?.x || 0)) / width) * rect.width,
      y: rect.top + ((point.y - (viewBox?.y || 0)) / height) * rect.height
    };
  }

  function ensureTextEditor() {
    let input = document.getElementById("floatingTextEditor");
    if (!input) {
      input = document.createElement("textarea");
      input.id = "floatingTextEditor";
      input.className = "floating-text-editor";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.rows = 3;
    }
    const host = overlayHost();
    if (input.parentElement !== host) host.appendChild(input);
    return input;
  }

  function closeTextEditor(input) {
    input?.classList.remove("is-visible");
    input?.classList.remove("is-chord-editor");
    input?.classList.remove("is-dynamic-editor");
    input?.removeAttribute("data-text-id");
    input?.removeAttribute("data-text-kind");
  }

  function textEditorLines(value) {
    return String(value || "").split(/\r?\n/);
  }

  function resizeFloatingTextEditor(input, textKind, style = {}) {
    if (!input) return;
    const size = Number(style.size) || 24;
    const font = style.font || appearanceFont("canvasTextFont", "Ink Free");
    const lines = textEditorLines(input.value || input.placeholder || AnchoredText.sampleText(textKind));
    const longestLineWidth = Math.max(
      AnchoredText.minWidth(textKind),
      ...lines.map((line) => approximateTextWidth(line || " ", size, font))
    );
    const lineHeight = Math.max(20, size * 1.28);
    input.rows = Math.max(3, Math.min(14, lines.length + 1));
    input.style.minWidth = `${Math.max(AnchoredText.minWidth(textKind), longestLineWidth + 42)}px`;
    input.style.width = `${Math.min(window.innerWidth - 24, Math.max(AnchoredText.minWidth(textKind), longestLineWidth + 42))}px`;
    input.style.minHeight = `${Math.max(72, lineHeight * Math.max(3, Math.min(14, lines.length + 1)))}px`;
    input.style.height = "auto";
    input.style.height = `${Math.min(window.innerHeight - 24, Math.max(input.scrollHeight + 2, lineHeight * Math.max(3, lines.length + 1)))}px`;
  }

  function openTextEditor(point, item = null, createData = null) {
    if (!point) return false;
    const input = ensureTextEditor();
    const style = { ...state.textStyle, ...(item?.style || {}) };
    const textKind = AnchoredText.kindOf(item, createData);
    const isChordEditor = AnchoredText.isChord(textKind);
    const isDynamicEditor = AnchoredText.isDynamic(textKind);
    const client = svgPointToClient(point);
    input.value = item?.text || "";
    input.dataset.textId = item?.id || "";
    input.dataset.textKind = textKind;
    input.placeholder = AnchoredText.placeholder(textKind);
    input.style.left = `${Math.max(8, Math.round(client.x))}px`;
    input.style.top = `${Math.max(8, Math.round(client.y - (Number(style.size) || 24) - 8))}px`;
    input.style.fontFamily = fontCss(style.font || appearanceFont("canvasTextFont", "Ink Free"));
    input.style.fontSize = `${Number(style.size) || 24}px`;
    input.style.color = style.color || "#15120f";
    input.style.textAlign = style.align || "left";
    resizeFloatingTextEditor(input, textKind, style);
    input.classList.add("is-visible");
    input.classList.toggle("is-chord-editor", isChordEditor);
    input.classList.toggle("is-dynamic-editor", isDynamicEditor);
    input.focus();
    input.select();

    const cleanup = () => {
      input.removeEventListener("keydown", onKeydown);
      input.removeEventListener("blur", onBlur);
      input.removeEventListener("input", onInput);
    };
    const commit = ({ close = true, renderAfter = true } = {}) => {
      cleanup();
      const rawValue = input.value.replace(/\s+$/g, "").replace(/^\n+/, "");
      const value = isChordEditor
        ? (normalizeChordSymbolForGeneration(rawValue) || rawValue.trim())
        : rawValue;
      if (close) closeTextEditor(input);
      if (!value) {
        if (renderAfter) render();
        return null;
      }
      saveHistory();
      let committedItem = item;
      if (item) {
        item.text = value;
        item.style = { ...style };
        state.activeTextId = item.id;
        state.selectedTextIds = [item.id];
      } else {
        const next = {
          id: createTextId(),
          text: value,
          kind: createData?.kind || "text",
          x: createData?.x ?? point.x,
          y: createData?.y ?? point.y,
          measureIndex: createData?.measureIndex,
          tick: createData?.tick,
          systemIndex: createData?.systemIndex,
          style: { ...state.textStyle }
        };
        state.textItems.push(next);
        state.activeTextId = next.id;
        state.selectedTextIds = [next.id];
        committedItem = next;
      }
      clearEntrySelection();
      clearActiveNote();
      hideCursorPitch();
      state.cursorActive = false;
      if (renderAfter) render();
      return committedItem;
    };
    const cancel = () => {
      cleanup();
      closeTextEditor(input);
      render();
    };
    function onKeydown(event) {
      event.stopPropagation();
      if (AnchoredText.shouldNavigate(textKind, event.key)) {
        event.preventDefault();
        const committedItem = commit({ close: false, renderAfter: false });
        const source = committedItem || item || createData;
        const direction = AnchoredText.directionForKey(event.key);
        const nextAnchor = isDynamicEditor ? nextDynamicAnchor(source, direction) : nextChordAnchor(source, direction);
        const targetItem = isDynamicEditor
          ? dynamicItemAt(nextAnchor.measureIndex, nextAnchor.tick)
          : chordItemAt(nextAnchor.measureIndex, nextAnchor.tick);
        render();
        openTextEditor(
          isDynamicEditor ? dynamicItemPoint(nextAnchor) : chordItemPoint(nextAnchor),
          targetItem,
          { kind: textKind, ...nextAnchor }
        );
        return;
      }
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        commit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        commit();
      }
    }
    function onInput() {
      resizeFloatingTextEditor(input, textKind, style);
    }
    function onBlur() {
      commit();
    }
    input.addEventListener("keydown", onKeydown);
    input.addEventListener("blur", onBlur);
    input.addEventListener("input", onInput);
    return true;
  }

  function addTextItemAtPoint(point) {
    return openTextEditor(point, null, { kind: "text", x: point.x, y: point.y });
  }

  function chordGridStepTicks() {
    const duration = activeGridDuration();
    return Math.max(MIN_DURATION_TICKS, Number(duration?.ticks) || subdivisionTicks());
  }

  function chordGridAnchors(measureIndex = state.cursorMeasure) {
    const profile = meterForMeasureIndex(measureIndex);
    const measureLength = measureTicksForIndex(measureIndex);
    const step = chordGridStepTicks();
    const anchors = [];
    for (let tick = 0; tick < measureLength - EPSILON; tick += step) {
      anchors.push(Math.max(0, Math.min(measureLength, Number(tick.toFixed(4)))));
    }
    if (!anchors.length) anchors.push(0);
    return anchors.filter((tick) => tick < profile.measureTicks - EPSILON);
  }

  function snapChordTick(tick, measureIndex = state.cursorMeasure) {
    const measureLength = measureTicksForIndex(measureIndex);
    const anchors = chordGridAnchors(measureIndex);
    const normalizedTick = Math.max(0, Math.min(measureLength, Number(tick) || 0));
    return anchors.reduce((closest, anchor) => (
      Math.abs(anchor - normalizedTick) < Math.abs(closest - normalizedTick) ? anchor : closest
    ), anchors[0]);
  }

  function chordItemAt(measureIndex, tick) {
    return state.textItems.find((item) => AnchoredText.matchesAnchor(item, AnchoredText.KINDS.CHORD, measureIndex, tick, EPSILON)) || null;
  }

  function dynamicItemAt(measureIndex, tick) {
    const systemIndex = activeSystemIndex();
    return state.textItems.find((item) => (
      AnchoredText.matchesAnchor(item, AnchoredText.KINDS.DYNAMIC, measureIndex, tick, EPSILON) &&
      clampSystemIndex(item.systemIndex ?? 0) === systemIndex
    )) || null;
  }

  function nextChordAnchor(source, direction) {
    const sourceMeasureIndex = Math.max(0, Number(source?.measureIndex) || 0);
    const sourceTick = snapChordTick(Number.isFinite(source?.tick) ? Number(source.tick) : 0, sourceMeasureIndex);
    const step = chordGridStepTicks();
    let targetAbsoluteTick = Math.max(0, measureStartAbsoluteTick(sourceMeasureIndex) + sourceTick + direction * step);
    while (targetAbsoluteTick >= measureStartAbsoluteTick(state.measures.length) - EPSILON) {
      ensureMeasure(state.measures.length);
    }
    const target = measureIndexAndTickFromAbsolute(targetAbsoluteTick);
    ensureMeasure(target.measureIndex);
    return {
      measureIndex: target.measureIndex,
      tick: snapChordTick(target.tick, target.measureIndex)
    };
  }

  function dynamicAnchors() {
    return state.measures.flatMap((measure, measureIndex) => (
      measure.entries
        .filter((entry) => !entry.hiddenTupletReserve && !isMeasureRestEntry(entry))
        .map((entry) => ({
          measureIndex,
          tick: Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(entry.tickStart) || 0)),
          absoluteTick: measureStartAbsoluteTick(measureIndex) + (Number(entry.tickStart) || 0)
        }))
    )).sort((a, b) => a.absoluteTick - b.absoluteTick);
  }

  function nextDynamicAnchor(source, direction) {
    const anchors = dynamicAnchors();
    const measureIndex = Math.max(0, Number(source?.measureIndex) || 0);
    const tick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(source?.tick) || 0));
    const absoluteTick = measureStartAbsoluteTick(measureIndex) + tick;
    const next = direction < 0
      ? anchors.filter((anchor) => anchor.absoluteTick < absoluteTick - EPSILON).at(-1)
      : anchors.find((anchor) => anchor.absoluteTick > absoluteTick + EPSILON);
    if (next) return { measureIndex: next.measureIndex, tick: next.tick };
    ensureMeasure(measureIndex);
    return {
      measureIndex,
      tick: Math.max(0, Math.min(measureTicks(), tick + direction * (state.activeDuration?.ticks || 1)))
    };
  }

  function highestStaffStepInMeasure(measureIndex) {
    const measure = state.measures[measureIndex];
    if (!measure) return STAFF_LINE_TOP_STEP;
    const steps = measure.entries.flatMap((entry) => (
      entry.type === "rest" ? [] : entryStaffSteps(entry)
    ));
    return Math.max(STAFF_LINE_TOP_STEP, ...steps);
  }

  function lowestStaffStepInMeasure(measureIndex) {
    const measure = state.measures[measureIndex];
    if (!measure) return STAFF_LINE_BOTTOM_STEP;
    const steps = measure.entries.flatMap((entry) => (
      entry.type === "rest" ? [] : entryStaffSteps(entry)
    ));
    return Math.min(STAFF_LINE_BOTTOM_STEP, ...steps);
  }

  function chordBaselineY(measureIndex) {
    return pitchY(highestStaffStepInMeasure(measureIndex)) - STAFF_GAP * 2;
  }

  function dynamicBaselineY(measureIndex = state.cursorMeasure) {
    return Math.max(
      staffBottomY() + STAFF_GAP * 3.2,
      pitchY(lowestStaffStepInMeasure(measureIndex)) + STAFF_GAP * 2.2
    );
  }

  function anchoredTextOffset(item, axis) {
    const value = Number(axis === "x" ? item?.offsetX : item?.offsetY);
    return Number.isFinite(value) ? value : 0;
  }

  function textRectAtPoint(point, text, style = {}, align = "left") {
    const size = Number(style.size) || Number(state.textStyle.size) || 24;
    const font = style.font || state.textStyle.font || appearanceFont("canvasTextFont", "Ink Free");
    const width = approximateTextWidth(text || AnchoredText.sampleText(AnchoredText.KINDS.CHORD), size, font);
    const left = align === "center"
      ? point.x - width / 2
      : align === "right"
        ? point.x - width
        : point.x;
    return {
      left: left - 4,
      right: left + width + 8,
      top: point.y - size * 0.95,
      bottom: point.y + size * 0.38
    };
  }

  function approximateBeamCollisionRectsForMeasure(layout, measureIndex) {
    const cache = Perf.layoutCache(layout, "beamCollisionRects");
    const cacheKey = `${contextSystemIndex()}:${measureIndex}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const positioned = positionedEntries(layout)
      .filter((item) => item.measureIndex === measureIndex && item.entry?.type === "note" && entryDuration(item.entry).flags > 0)
      .sort((a, b) => entryVoice(a.entry) - entryVoice(b.entry) || a.entry.tickStart - b.entry.tickStart || a.entryIndex - b.entryIndex);
    const groups = [];
    let current = [];
    const beamKey = (item) => `${entryVoice(item.entry)}:${item.entry.tuplet?.id || pulseIndexForTick(item.entry.tickStart)}`;
    positioned.forEach((item) => {
      const previous = current.at(-1);
      const joins = previous &&
        beamKey(previous) === beamKey(item) &&
        item.entry.tickStart <= previous.entry.tickStart + previous.entry.ticks + EPSILON;
      if (joins) current.push(item);
      else {
        if (current.length > 1) groups.push(current);
        current = [item];
      }
    });
    if (current.length > 1) groups.push(current);

    const rects = groups.map((group) => {
      const rects = group.map((item) => stemRect(item.entry, item.x)).filter(Boolean);
      if (!rects.length) return null;
      const direction = group.reduce((sum, item) => sum + stemDirection(item.entry), 0) >= 0 ? 1 : -1;
      const first = group[0];
      const last = group.at(-1);
      const beamY = direction > 0
        ? Math.min(...rects.map((rect) => rect.top)) - beamThickness()
        : Math.max(...rects.map((rect) => rect.bottom)) + beamThickness();
      return expandedRect({
        left: Math.min(first.x, last.x) - 8,
        right: Math.max(first.x, last.x) + 8,
        top: beamY - beamThickness() * 2,
        bottom: beamY + beamThickness() * 2
      }, 4, 4);
    }).filter(Boolean);
    cache.set(cacheKey, rects);
    return rects;
  }

  function chordCollisionRectsForMeasure(layout, measureIndex) {
    const cache = Perf.layoutCache(layout, "chordCollisionRects");
    const cacheKey = `${contextSystemIndex()}:${measureIndex}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const rects = [];
    const measure = state.measures[measureIndex];
    if (!measure) {
      cache.set(cacheKey, rects);
      return rects;
    }
    const start = layout.starts[measureIndex];
    const width = layout.widths[measureIndex];
    if (!Number.isFinite(start) || !Number.isFinite(width)) {
      cache.set(cacheKey, rects);
      return rects;
    }
    const positions = measureEntryPositions(measure, start, width);
    (measure.entries || []).forEach((entry) => {
      if (entry?.hiddenTupletReserve) return;
      const x = positions.get(entry.id);
      if (!Number.isFinite(x)) return;
      const rect = entryVisualRect(entry, x);
      if (rect) rects.push(expandedRect(rect, 8, 8));
    });
    rects.push(...approximateBeamCollisionRectsForMeasure(layout, measureIndex));
    (state.marks || [])
      .filter((mark) => Number(mark?.measureIndex) === measureIndex && mark.type !== "tempo")
      .forEach((mark) => {
        const x = markX(mark, layout);
        if (!Number.isFinite(x)) return;
        rects.push({
          left: x - 28,
          right: x + 28,
          top: staffTopY() - 62,
          bottom: staffBottomY() + 30
        });
      });
    cache.set(cacheKey, rects);
    return rects;
  }

  function notationCollisionRectsForMeasure(layout, measureIndex, systemIndex = contextSystemIndex(), options = {}) {
    const padX = Number.isFinite(options.padX) ? options.padX : 8;
    const padY = Number.isFinite(options.padY) ? options.padY : 8;
    const cache = Perf.layoutCache(layout, "notationCollisionRects");
    const cacheKey = `${systemIndex}:${measureIndex}:${padX}:${padY}:${options.includeMarks === false ? 0 : 1}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const rects = withSystemContext(systemIndex, () => {
      const measure = state.measures[measureIndex];
      if (!measure) return [];
      const start = layout.starts[measureIndex];
      const width = layout.widths[measureIndex];
      if (!Number.isFinite(start) || !Number.isFinite(width)) return [];
      const positions = measureEntryPositions(measure, start, width);
      const nextRects = [];
      (measure.entries || []).forEach((entry) => {
        if (entry?.hiddenTupletReserve) return;
        const x = positions.get(entry.id);
        if (!Number.isFinite(x)) return;
        const rect = entryVisualRect(entry, x);
        if (rect) nextRects.push(expandedRect(rect, padX, padY));
      });
      nextRects.push(...approximateBeamCollisionRectsForMeasure(layout, measureIndex));
      if (options.includeMarks !== false) {
        (state.marks || [])
          .filter((mark) => Number(mark?.measureIndex) === measureIndex && mark.type !== "tempo")
          .forEach((mark) => {
            const x = markX(mark, layout);
            if (!Number.isFinite(x)) return;
            nextRects.push({
              left: x - 28,
              right: x + 28,
              top: staffTopY() - 62,
              bottom: staffBottomY() + 30
            });
          });
      }
      return nextRects;
    });
    cache.set(cacheKey, rects);
    return rects;
  }

  function chordLaneMap(layout = buildLayout()) {
    const cacheKey = `chord:${contextSystemIndex()}`;
    const cache = Perf.layoutCache(layout, "textLaneMaps");
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const laneById = new Map();
    const measureLanes = new Map();
    const items = state.textItems
      .filter((item) => AnchoredText.isChord(item) && String(item.text || "").trim())
      .map((item) => {
        const measureIndex = Math.max(0, Math.min(state.measures.length - 1, Number(item.measureIndex) || 0));
        const x = xForChordAnchor(layout, measureIndex, Number.isFinite(item.tick) ? item.tick : 0) + anchoredTextOffset(item, "x");
        const style = { ...state.textStyle, ...(item.style || {}) };
        const size = Number(style.size) || 24;
        return { item, measureIndex, x, style, size };
      })
      .sort((a, b) => a.measureIndex - b.measureIndex || a.x - b.x);

    items.forEach((candidate) => {
      const baseY = chordBaselineY(candidate.measureIndex) + anchoredTextOffset(candidate.item, "y");
      const collisionRects = chordCollisionRectsForMeasure(layout, candidate.measureIndex);
      const lanes = measureLanes.get(candidate.measureIndex) || [];
      let lane = 0;
      for (; lane < 8; lane += 1) {
        const y = baseY - lane * candidate.size * 1.12;
        const rect = textRectAtPoint({ x: candidate.x, y }, candidate.item.text, candidate.style, "center");
        const hitsNotation = collisionRects.some((blocked) => rectsOverlap(rect, blocked));
        const hitsChord = lanes.some((placed) => placed.lane === lane && rectsOverlap(rect, placed.rect));
        if (!hitsNotation && !hitsChord) {
          lanes.push({ lane, rect });
          laneById.set(candidate.item.id, lane);
          measureLanes.set(candidate.measureIndex, lanes);
          return;
        }
      }
      const fallbackY = baseY - lane * candidate.size * 1.12;
      lanes.push({
        lane,
        rect: textRectAtPoint({ x: candidate.x, y: fallbackY }, candidate.item.text, candidate.style, "center")
      });
      laneById.set(candidate.item.id, lane);
      measureLanes.set(candidate.measureIndex, lanes);
    });
    cache.set(cacheKey, laneById);
    return laneById;
  }

  function chordItemPoint(item, layout = buildLayout()) {
    const measureIndex = Math.max(0, Math.min(state.measures.length - 1, Number(item.measureIndex) || 0));
    const style = { ...state.textStyle, ...(item?.style || {}) };
    const size = Number(style.size) || 24;
    const lane = chordLaneMap(layout).get(item.id) || 0;
    return {
      x: xForChordAnchor(layout, measureIndex, Number.isFinite(item.tick) ? item.tick : 0) + anchoredTextOffset(item, "x"),
      y: chordBaselineY(measureIndex) - lane * size * 1.12 + anchoredTextOffset(item, "y")
    };
  }

  function dynamicLaneMap(layout = buildLayout(), systemIndex = renderSystemIndex) {
    const cacheKey = `dynamic:${systemIndex}`;
    const cache = Perf.layoutCache(layout, "textLaneMaps");
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const lanes = [];
    const laneById = new Map();
    const items = state.textItems
      .filter((item) => AnchoredText.isDynamic(item) && textItemSystemIndex(item) === systemIndex)
      .map((item) => {
        const measureIndex = Math.max(0, Math.min(state.measures.length - 1, Number(item.measureIndex) || 0));
        const start = layout.starts[measureIndex] ?? staffLeft();
        const width = layout.widths[measureIndex] ?? MEASURE_MIN_WIDTH;
        const style = { ...state.textStyle, ...(item.style || {}) };
        const size = Number(style.size) || 24;
        const x = xForChordAnchor(layout, measureIndex, Number.isFinite(item.tick) ? item.tick : 0) + anchoredTextOffset(item, "x");
        const textWidth = approximateTextWidth(item.text || AnchoredText.sampleText(AnchoredText.KINDS.DYNAMIC), size, style.font || appearanceFont("canvasTextFont", "Ink Free"));
        return { item, measureIndex, x, width: textWidth, style, size };
      })
      .sort((a, b) => a.x - b.x || a.measureIndex - b.measureIndex);
    items.forEach((item) => {
      const baseY = withSystemContext(systemIndex, () => dynamicBaselineY(item.measureIndex)) + anchoredTextOffset(item.item, "y");
      const collisionRects = notationCollisionRectsForMeasure(layout, item.measureIndex, systemIndex, {
        padX: 8,
        padY: 10,
        includeMarks: true
      });
      let lane = 0;
      for (; lane < 8; lane += 1) {
        const y = baseY + lane * item.size * 1.25;
        const rect = textRectAtPoint({ x: item.x, y }, item.item.text || AnchoredText.sampleText(AnchoredText.KINDS.DYNAMIC), item.style, "left");
        const hitsNotation = collisionRects.some((blocked) => rectsOverlap(rect, blocked));
        const hitsDynamic = lanes.some((placed) => placed.lane === lane && rectsOverlap(rect, placed.rect));
        if (!hitsNotation && !hitsDynamic) {
          lanes.push({ lane, rect });
          laneById.set(item.item.id, lane);
          return;
        }
      }
      const fallbackY = baseY + lane * item.size * 1.25;
      lanes.push({
        lane,
        rect: textRectAtPoint({ x: item.x, y: fallbackY }, item.item.text || AnchoredText.sampleText(AnchoredText.KINDS.DYNAMIC), item.style, "left")
      });
      laneById.set(item.item.id, lane);
    });
    cache.set(cacheKey, laneById);
    return laneById;
  }

  function dynamicItemPoint(item, layout = buildLayout()) {
    const measureIndex = Math.max(0, Math.min(state.measures.length - 1, Number(item.measureIndex) || 0));
    const start = layout.starts[measureIndex] ?? staffLeft();
    const width = layout.widths[measureIndex] ?? MEASURE_MIN_WIDTH;
    const lane = dynamicLaneMap(layout, textItemSystemIndex(item)).get(item.id) || 0;
    const style = { ...state.textStyle, ...(item.style || {}) };
    const size = Number(style.size) || 24;
    return {
      x: xForChordAnchor(layout, measureIndex, Number.isFinite(item.tick) ? item.tick : 0) + anchoredTextOffset(item, "x"),
      y: dynamicBaselineY(measureIndex) + lane * size * 1.25 + anchoredTextOffset(item, "y")
    };
  }

  function textItemPoint(item, layout = buildLayout()) {
    if (AnchoredText.isChord(item)) return chordItemPoint(item, layout);
    if (AnchoredText.isDynamic(item)) return dynamicItemPoint(item, layout);
    return { x: item?.x || 0, y: item?.y || 0 };
  }

  function visualOffset(item, axis) {
    return ItemStyle.visualOffset(item, axis);
  }

  function textItemSystemIndex(item) {
    if (AnchoredText.isDynamic(item)) return clampSystemIndex(item.systemIndex ?? 0);
    if (AnchoredText.isChord(item)) return 0;
    return 0;
  }

  function chordAnchorFromPoint(point) {
    const layout = buildLayout();
    const measureIndex = measureIndexFromX(layout, point.x);
    ensureMeasure(measureIndex);
    return {
      measureIndex,
      tick: snapChordTick(tickFromMeasureX(layout, measureIndex, point.x), measureIndex)
    };
  }

  function addChordItemAtPoint(point) {
    const anchor = chordAnchorFromPoint(point);
    return openTextEditor(chordItemPoint(anchor), null, {
      kind: "chord",
      measureIndex: anchor.measureIndex,
      tick: anchor.tick
    });
  }

  function dynamicAnchorFromEntry(entry) {
    const location = entryLocationById(entry?.id);
    if (!location) return null;
    return {
      measureIndex: location.measureIndex,
      tick: Math.max(0, Math.min(measureTicks(), Number(location.entry.tickStart) || 0)),
      systemIndex: activeSystemIndex()
    };
  }

  function dynamicAnchorFromPoint(point) {
    const layout = buildLayout();
    const measureIndex = measureIndexFromX(layout, point.x);
    ensureMeasure(measureIndex);
    return {
      measureIndex,
      tick: Math.max(0, Math.min(measureTicks(), tickFromMeasureX(layout, measureIndex, point.x))),
      systemIndex: activeSystemIndex()
    };
  }

  function addDynamicItemAtAnchor(anchor) {
    if (!anchor) return false;
    const targetItem = dynamicItemAt(anchor.measureIndex, anchor.tick);
    return openTextEditor(dynamicItemPoint(anchor), targetItem, {
      kind: "dynamic",
      measureIndex: anchor.measureIndex,
      tick: anchor.tick,
      systemIndex: anchor.systemIndex ?? activeSystemIndex()
    });
  }

  function setDynamicTextAtAnchor(anchor, text) {
    if (!anchor || !String(text || "").trim()) return false;
    const value = String(text).trim();
    const targetItem = dynamicItemAt(anchor.measureIndex, anchor.tick);
    saveHistory();
    if (targetItem) {
      targetItem.text = value;
      targetItem.style = { ...(targetItem.style || {}), ...state.textStyle };
      state.activeTextId = targetItem.id;
      state.selectedTextIds = [targetItem.id];
    } else {
      const next = {
        id: createTextId(),
        text: value,
        kind: "dynamic",
        measureIndex: anchor.measureIndex,
        tick: anchor.tick,
        systemIndex: anchor.systemIndex ?? activeSystemIndex(),
        style: { ...state.textStyle }
      };
      state.textItems.push(next);
      state.activeTextId = next.id;
      state.selectedTextIds = [next.id];
    }
    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();
    render();
    return true;
  }

  function setDynamicTextAtCurrentNote(text) {
    const activeTarget = findActiveNoteTarget();
    const selection = selectedEntryLocation();
    const entry = activeTarget?.entry || (selection?.entry?.type === "note" ? selection.entry : null);
    return setDynamicTextAtAnchor(dynamicAnchorFromEntry(entry), text);
  }

  function addDynamicItemAtPoint(point) {
    return addDynamicItemAtAnchor(dynamicAnchorFromPoint(point));
  }

  function addDynamicItemAtCurrentNote() {
    const activeTarget = findActiveNoteTarget();
    const selection = selectedEntryLocation();
    const entry = activeTarget?.entry || (selection?.entry?.type === "note" ? selection.entry : null);
    return addDynamicItemAtAnchor(dynamicAnchorFromEntry(entry));
  }

  function addActiveTextLikeItemAtPoint(point) {
    if (state.chordMode) return addChordItemAtPoint(point);
    if (state.dynamicMode) return addDynamicItemAtPoint(point);
    if (state.textMode) return addTextItemAtPoint(point);
    return false;
  }

  function editTextItem(item) {
    return item ? openTextEditor(textItemPoint(item), item) : false;
  }

  function isAnchoredTextItem(item) {
    return AnchoredText.isAnchored(item);
  }

  function deleteSelectedTextItem() {
    const ids = new Set(state.selectedTextIds || []);
    if (state.activeTextId) ids.add(state.activeTextId);
    if (!ids.size) return false;
    const before = state.textItems.length;
    const nextItems = state.textItems.filter((item) => !ids.has(item.id));
    if (nextItems.length === before) {
      state.activeTextId = null;
      state.selectedTextIds = [];
      return false;
    }
    saveHistory();
    state.textItems = nextItems;
    state.activeTextId = null;
    state.selectedTextIds = [];
    render();
    return true;
  }

  function deleteSelectedMarks() {
    const ids = new Set(state.selectedMarkIds || []);
    if (!ids.size) return false;
    const before = state.marks.length;
    const nextMarks = state.marks.filter((mark) => !ids.has(mark.id));
    if (nextMarks.length === before) {
      clearMarkSelection();
      return false;
    }
    saveHistory();
    state.marks = nextMarks;
    clearMarkSelection();
    render();
    return true;
  }

  function selectedMarks() {
    return Marks.selected(state.marks, state.selectedMarkIds);
  }

  function movementGridTicks(event = {}) {
    if (event.shiftKey) return Math.max(MIN_DURATION_TICKS, pulseTicks());
    return Math.max(MIN_DURATION_TICKS, activeGridDuration()?.ticks || pulseTicks());
  }

  function clampAbsoluteScoreTick(absoluteTick) {
    return Math.max(0, Math.min(scoreEndTick(), Number(absoluteTick) || 0));
  }

  function setAnchorFromAbsoluteTick(target, absoluteTick) {
    const safeTick = clampAbsoluteScoreTick(absoluteTick);
    const measureIndex = measureIndexAndTickFromAbsolute(safeTick).measureIndex;
    target.measureIndex = measureIndex;
    target.tick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), safeTick - measureStartAbsoluteTick(measureIndex)));
    return safeTick;
  }

  function nearestNoteLocationAtAbsoluteTick(absoluteTick, preferredStaffStep = null, options = {}) {
    const afterTick = Number.isFinite(options.afterTick) ? options.afterTick : null;
    const voiceFilter = Number(options.voice) === 2 ? 2 : Number(options.voice) === 1 ? 1 : null;
    const candidates = orderedNoteLocations(voiceFilter).filter((location) => (
      afterTick === null || location.absoluteTick > afterTick + EPSILON
    ));
    if (!candidates.length) return null;
    return candidates
      .map((location) => ({
        ...location,
        distance: Math.abs(location.absoluteTick - absoluteTick) +
          (Number.isFinite(preferredStaffStep) ? Math.abs(location.staffStep - preferredStaffStep) * 0.05 : 0)
      }))
      .sort((a, b) => a.distance - b.distance || a.absoluteTick - b.absoluteTick)[0] || null;
  }

  function moveMarkByTicks(mark, deltaTicks) {
    const currentStart = measureStartAbsoluteTick(Number(mark.measureIndex || 0)) + Number(mark.tick || 0);
    const nextStart = clampAbsoluteScoreTick(currentStart + deltaTicks);
    const isPhraseSlur = mark.type === "slur" || mark.type === "dotted-slur";

    if (mark.type === "ending") {
      const direction = Math.sign(deltaTicks);
      if (!direction) return;
      const start = Math.max(0, Number(mark.startMeasureIndex ?? mark.measureIndex) || 0);
      const end = Math.max(start + 1, Number(mark.endMeasureIndex) || start + 1);
      const span = Math.max(1, end - start);
      const nextStartMeasure = Math.max(0, start + direction);
      const nextEndMeasure = nextStartMeasure + span;
      ensureMeasure(nextEndMeasure);
      mark.startMeasureIndex = nextStartMeasure;
      mark.endMeasureIndex = nextEndMeasure;
      mark.measureIndex = nextStartMeasure;
      mark.tick = 0;
      return;
    }

    if (isPhraseSlur) {
      const startLocation = mark.entryId ? entryLocationById(mark.entryId) : null;
      const endLocation = mark.endEntryId ? entryLocationById(mark.endEntryId) : null;
      const voice = startLocation?.entry ? entryVoice(startLocation.entry) : activeVoice();
      const startAbs = startLocation ? absoluteTickForLocation(startLocation) : currentStart;
      const endAbs = endLocation ? absoluteTickForLocation(endLocation) : startAbs;
      const span = Math.max(0, endAbs - startAbs);
      const nextStartLocation = nearestNoteLocationAtAbsoluteTick(nextStart, mark.staffStep, { voice });
      if (!nextStartLocation?.entry) {
        setAnchorFromAbsoluteTick(mark, nextStart);
        delete mark.entryId;
        delete mark.endEntryId;
        return;
      }
      mark.measureIndex = nextStartLocation.measureIndex;
      mark.tick = nextStartLocation.entry.tickStart;
      mark.staffStep = nearestEntryStaffStep(nextStartLocation.entry, mark.staffStep);
      mark.entryId = nextStartLocation.entry.id;
      const nextEndLocation = nearestNoteLocationAtAbsoluteTick(
        nextStartLocation.absoluteTick + span,
        mark.endStaffStep,
        { afterTick: nextStartLocation.absoluteTick, voice }
      ) || nextStartLocation;
      mark.endEntryId = nextEndLocation.entry.id;
      mark.endStaffStep = nearestEntryStaffStep(nextEndLocation.entry, mark.endStaffStep);
      delete mark.previewX;
      delete mark.previewY;
      return;
    }

    setAnchorFromAbsoluteTick(mark, nextStart);
    const noteAnchor = nearestNoteLocationAtAbsoluteTick(nextStart, mark.staffStep, { voice: activeVoice() });
    if (noteAnchor?.entry && Math.abs(noteAnchor.absoluteTick - nextStart) < EPSILON) {
      mark.entryId = noteAnchor.entry.id;
      mark.staffStep = nearestEntryStaffStep(noteAnchor.entry, mark.staffStep);
    } else {
      delete mark.entryId;
    }
  }

  function moveTextItemByTicks(item, deltaTicks) {
    if (Number.isFinite(Number(item.measureIndex)) && Number.isFinite(Number(item.tick))) {
      const current = measureStartAbsoluteTick(Number(item.measureIndex)) + Number(item.tick);
      setAnchorFromAbsoluteTick(item, current + deltaTicks);
      return;
    }
    const layout = buildLayout();
    const measureIndex = measureIndexFromX(layout, Number(item.x) || 0);
    const start = layout.starts[measureIndex] ?? staffLeft();
    const width = layout.widths[measureIndex] ?? MEASURE_MIN_WIDTH;
    const pixelsPerTick = (width - measureLeftInset() - measureRightInset()) / measureTicks();
    item.x = (Number(item.x) || 0) + deltaTicks * Math.max(1, pixelsPerTick);
  }

  function moveSelectedNonNoteItems(direction, event = {}) {
    const marks = selectedMarks();
    const textItems = selectedTextItems();
    if (!marks.length && !textItems.length) return false;
    saveHistory();
    const deltaTicks = direction * movementGridTicks(event);
    marks.forEach((mark) => moveMarkByTicks(mark, deltaTicks));
    textItems.forEach((item) => moveTextItemByTicks(item, deltaTicks));
    render();
    return true;
  }

  function selectedEditableRhythmicLocations() {
    return selectedDurationTargetLocations().filter((location) => (
      location?.entry &&
      location.entry.hiddenTupletReserve !== true &&
      !location.entry.tuplet
    ));
  }

  function authoredRhythmicItems(selectedIds = new Set()) {
    return flattenScoreEntries()
      .filter(({ entry }) => (
        entry.type === "note" ||
        entry.explicitRest === true ||
        entry.tuplet ||
        entry.hiddenTupletReserve ||
        selectedIds.has(entry.id)
      ))
      .map((item) => ({ ...item }));
  }

  function rhythmicRangesOverlap(startA, ticksA, startB, ticksB) {
    return startA < startB + ticksB - EPSILON && startB < startA + ticksA - EPSILON;
  }

  function plannedRhythmicMove(deltaTicks) {
    const targets = selectedEditableRhythmicLocations();
    const selectedIds = new Set(targets.map((location) => location.entry.id));
    const items = authoredRhythmicItems(selectedIds);
    const nextTicksById = new Map();

    targets.forEach((location) => {
      const entry = location.entry;
      const currentTick = absoluteTickForLocation(location);
      const nextTick = Math.max(0, currentTick + deltaTicks);
      if (Math.abs(nextTick - currentTick) < EPSILON) return;
      const blocked = items.some((item) => (
        !selectedIds.has(item.entry.id) &&
        entryVoice(item.entry) === entryVoice(entry) &&
        rhythmicRangesOverlap(nextTick, entry.ticks, item.absTick, item.entry.ticks)
      ));
      if (!blocked) nextTicksById.set(entry.id, nextTick);
    });

    return { items, nextTicksById, selectedIds };
  }

  function syncMarksAnchoredToEntries(entryIds) {
    const ids = new Set(entryIds || []);
    if (!ids.size) return;
    state.marks.forEach((mark) => {
      if (ids.has(mark.entryId)) {
        const location = entryLocationById(mark.entryId);
        if (location?.entry) {
          mark.measureIndex = location.measureIndex;
          mark.tick = location.entry.tickStart;
        }
      }
      if (ids.has(mark.endEntryId)) {
        const location = entryLocationById(mark.endEntryId);
        if (location?.entry) {
          mark.endMeasureIndex = location.measureIndex;
          mark.endTick = location.entry.tickStart;
        }
      }
    });
  }

  function refreshRhythmicSelection(entryIds) {
    const liveIds = [...new Set(entryIds || [])].filter((entryId) => !!entryLocationById(entryId));
    if (!liveIds.length) return;
    state.selectedEntryIds = state.selectedEntryIds.filter((entryId) => liveIds.includes(entryId));
    state.selectedNoteRefs = state.selectedNoteRefs.filter((ref) => (
      liveIds.includes(ref?.entryId) && !!entryLocationById(ref.entryId)
    ));
    const primaryId = state.selectedEntryIds[0] || state.selectedNoteRefs[0]?.entryId || liveIds[0];
    const location = entryLocationById(primaryId);
    if (!location?.entry) return;
    state.cursorEntryId = primaryId;
    state.cursorMeasure = location.measureIndex;
    state.cursorTick = location.entry.tickStart;
    state.cursorStaffStep = state.selectedNoteRefs.find((ref) => ref.entryId === primaryId)?.staffStep ?? entryStaffStep(location.entry);
    if (location.entry.type === "note") setActiveNote(location.entry, state.cursorStaffStep);
  }

  function applyPlannedRhythmicMove(plan) {
    if (!plan?.nextTicksById?.size) return false;
    const movedIds = [...plan.nextTicksById.keys()];
    plan.items.forEach((item) => {
      const nextTick = plan.nextTicksById.get(item.entry.id);
      if (!Number.isFinite(nextTick)) return;
      if (item.entry.type === "rest") item.entry.explicitRest = true;
      item.absTick = nextTick;
    });
    rebuildMeasuresFromAbsoluteItems(plan.items);
    syncMarksAnchoredToEntries(movedIds);
    refreshRhythmicSelection(movedIds);
    return true;
  }

  function moveSelectedItemsByGrid(direction) {
    const deltaTicks = direction * movementGridTicks();
    const plan = plannedRhythmicMove(deltaTicks);
    const movedEntryIds = new Set(plan.nextTicksById.keys());
    const marks = selectedMarks().filter((mark) => !movedEntryIds.has(mark.entryId));
    const textItems = selectedTextItems();
    if (!movedEntryIds.size && !marks.length && !textItems.length) return false;
    saveHistory();
    applyPlannedRhythmicMove(plan);
    marks.forEach((mark) => moveMarkByTicks(mark, deltaTicks));
    textItems.forEach((item) => moveTextItemByTicks(item, deltaTicks));
    render();
    return true;
  }

  function plannedRhythmicResize(direction) {
    const deltaTicks = direction * gridStepTicks();
    const targets = selectedEditableRhythmicLocations().filter((location) => location.entry.forceDuration !== true);
    const selectedIds = new Set(targets.map((location) => location.entry.id));
    const items = authoredRhythmicItems(selectedIds);
    const nextDurationById = new Map();

    targets.forEach((location) => {
      const entry = location.entry;
      const nextTicks = entry.ticks + deltaTicks;
      if (nextTicks < MIN_DURATION_TICKS - EPSILON) return;
      if (direction > 0) {
        const startTick = absoluteTickForLocation(location);
        const blocked = items.some((item) => (
          item.entry.id !== entry.id &&
          entryVoice(item.entry) === entryVoice(entry) &&
          rhythmicRangesOverlap(startTick, nextTicks, item.absTick, item.entry.ticks)
        ));
        if (blocked) return;
      }
      nextDurationById.set(entry.id, nextTicks);
    });

    return { items, nextDurationById };
  }

  function resizeSelectedEntriesByGrid(direction) {
    const plan = plannedRhythmicResize(direction);
    if (!plan.nextDurationById.size) return false;
    const changedIds = [...plan.nextDurationById.keys()];
    saveHistory();
    plan.items.forEach((item) => {
      const nextTicks = plan.nextDurationById.get(item.entry.id);
      if (!Number.isFinite(nextTicks)) return;
      const info = durationInfoByTicks(nextTicks);
      if (info?.duration) {
        setEntryDuration(item.entry, info.duration);
        item.entry.dotted = info.dotted;
        item.entry.dots = info.dots || (info.dotted ? 1 : 0);
      }
      item.entry.ticks = nextTicks;
      if (item.entry.type === "rest") item.entry.explicitRest = true;
    });
    rebuildMeasuresFromAbsoluteItems(plan.items);
    syncMarksAnchoredToEntries(changedIds);
    refreshRhythmicSelection(changedIds);
    render();
    return true;
  }

  function applyTextStyleUpdate(key, value) {
    const nextValue = key === "size"
      ? Number(value)
      : key === "font"
        ? knownFont(value, appearanceFont("canvasTextFont", "Ink Free"))
        : value;
    const nextStyle = { ...state.textStyle, [key]: nextValue };
    state.textStyle = nextStyle;
    const item = selectedTextItem();
    if (item) {
      saveHistory();
      item.style = { ...(item.style || {}), [key]: nextStyle[key] };
      render();
    } else {
      updateModeButtons();
    }
  }

  function setDuration(duration, options = {}) {
    state.activeDuration = duration;
    rhythmicColumnIndex.clear();
    if (!options.keepTuplet) deactivateTupletWriting();
    refreshDurationButtons();
    updateModeButtons();
  }

  function activatePendingTupletForDuration(duration, absoluteTick = null) {
    const pendingRatio = state.pendingTupletRatio;
    if (!pendingRatio || !duration) return false;
    const normalized = normalizeTuplet({ ...pendingRatio, unitDurationId: duration.id });
    if (!normalized) return false;
    state.pendingTupletRatio = null;
    state.activeTuplet = normalized;
    state.activeTupletRun = Number.isFinite(absoluteTick) ? startTupletRun(normalized, absoluteTick) : null;
    updateModeButtons();
    return true;
  }

  function chooseDuration(duration, options = {}) {
    if (!duration) return;
    if (state.pendingTupletRatio) {
      setDuration(duration, { keepTuplet: true });
      activatePendingTupletForDuration(duration, state.cursorActive ? cursorAbsoluteTick() : null);
      render();
      return;
    }
    setDuration(duration, options);
  }

  function midiDurationLabel(duration) {
    return MidiKeyboard.durationLabel(duration);
  }

  function updateMidiControls() {
    midiChordButton?.classList.toggle("is-active", state.midiChordMode === true);
    midiChordButton?.setAttribute("aria-pressed", state.midiChordMode ? "true" : "false");
    MidiKeyboard.updateFigureStripControls(midiFigureStrip, {
      activeDurationId: state.activeDuration?.id,
      activeTuplet: state.activeTuplet,
      midiAutoChordMode: state.midiAutoChordMode,
      mode: state.mode,
      pendingTupletRatio: state.pendingTupletRatio,
      sameTupletConfig
    });
  }

  function midiFigureStripSignature() {
    return MidiKeyboard.figureStripSignature({
      durations,
      restPalette,
      tuplets: palettes.tuplets,
      extraTools: midiExtraToolItems()
    });
  }

  function renderMidiFigureStrip(options = {}) {
    if (!midiFigureStrip) return;
    const signature = midiFigureStripSignature();
    if (!options.force && midiFigureStrip.dataset.renderSignature === signature && midiFigureStrip.children.length) {
      updateMidiControls();
      applyIconAppearance();
      return;
    }
    midiFigureStrip.dataset.renderSignature = signature;
    MidiKeyboard.renderFigureStrip(midiFigureStrip, {
      durations,
      restPalette,
      tuplets: palettes.tuplets,
      extraTools: midiExtraToolItems(),
      effectiveIconTooltip,
      iconLayerHtml,
      iconLayersForItem,
      applyIconTooltipToElement,
      afterAction: updateMidiControls,
      actions: {
        noteDuration: (duration) => selectFigureDuration(duration),
        rest: (rest) => selectRestDuration(rest),
        tuplet: (item) => {
          if (item.stopTuplet) {
            deactivateTupletWriting();
            state.pendingTupletRatio = null;
            render();
          } else if (item.customTuplet) requestCustomTuplet();
          else activateTuplet(item.tuplet);
        },
        tool: (item) => {
          const action = {
            "midi-recognize-selection": () => recognizeSelectedWrittenChords(),
            "midi-auto-chord": () => toggleMidiAutoChordMode(),
            "midi-generate-chord": () => generateNotesFromChordSymbols(),
            "midi-generate-chord-from-top": () => generateNotesFromChordSymbolsUsingWrittenTop()
          }[item.id];
          return action?.();
        }
      }
    });
    updateMidiControls();
    ensureMidiIconMetadata();
    fitIconGlyphs();
  }

  function midiNoteInfo(midiNumber, measureIndex = state.cursorMeasure) {
    return MidiChords.midiNoteInfo(midiNumber, {
      signature: keySignatureForMeasureIndex(measureIndex),
      accidentalSemitone,
      keySignatureAccidentalForDiatonicStep
    });
  }

  function midiNoteInfoCandidates(midiNumber, measureIndex = state.cursorMeasure) {
    return MidiChords.midiNoteInfoCandidates(midiNumber, {
      signature: keySignatureForMeasureIndex(measureIndex),
      accidentalSemitone,
      keySignatureAccidentalForDiatonicStep
    });
  }

  function midiInfoSpellingKey(info) {
    return MidiChords.midiInfoSpellingKey(info);
  }

  function midiInfosAvoidingStaffCollisions(notes, measureIndex = state.cursorMeasure, preferredInfos = null) {
    return MidiChords.midiInfosAvoidingStaffCollisions(notes, {
      signature: keySignatureForMeasureIndex(measureIndex),
      accidentalSemitone,
      keySignatureAccidentalForDiatonicStep,
      preferredInfos
    });
  }

  function explicitAccidentalForMidiInfo(info, measureIndex = state.cursorMeasure) {
    const keyAccidental = keySignatureAccidentalForDiatonicStep(info.diatonicStep, keySignatureForMeasureIndex(measureIndex)) || "natural";
    const keySemitone = accidentalSemitone(keyAccidental);
    if (keySemitone === info.accidentalSemitone) return null;
    return accidentalBySemitone(info.accidentalSemitone);
  }

  function applyMidiAccidental(entry, staffStep, info, measureIndex = state.cursorMeasure) {
    const accidental = explicitAccidentalForMidiInfo(info, measureIndex);
    if (accidental) setEntryAccidental(entry, staffStep, accidental);
    else clearEntryAccidental(entry, staffStep);
  }

  function midiStaffStep(info) {
    if (activeSystemIsPercussionLine()) return 0;
    const clefId = clefIdAtAbsoluteTick(cursorAbsoluteTick());
    return staffStepForDiatonicStep(info.diatonicStep, clefId);
  }

  function mod12(value) {
    return MidiChords.mod12(value);
  }

  function midiForDiatonicStep(diatonicStep, accidental = "natural") {
    return MidiChords.midiForDiatonicStep(diatonicStep, accidental, accidentalSemitone);
  }

  function midiNotesForEntry(entry, measureIndex = state.cursorMeasure, staffSteps = entryStaffSteps(entry)) {
    if (!entry || entry.type !== "note") return [];
    return staffSteps.map((staffStep) => {
      const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
      const accidental = effectiveEntryAccidental(entry, staffStep) ||
        diatonicAccidentalForMeasure(diatonicStep, measureIndex);
      return midiForDiatonicStep(diatonicStep, accidental);
    }).filter(Number.isFinite).sort((a, b) => a - b);
  }

  const MUSICXML_STEP_NAMES = Object.freeze(["C", "D", "E", "F", "G", "A", "B"]);

  function musicXmlPitchForDiatonicStep(diatonicStep, accidental = "natural") {
    const step = Math.round(Number(diatonicStep) || 0);
    const octaveOffset = Math.floor(step / 7);
    const degree = ((step % 7) + 7) % 7;
    return {
      step: MUSICXML_STEP_NAMES[degree] || "C",
      octave: 4 + octaveOffset,
      alter: accidentalSemitone(accidental)
    };
  }

  function musicXmlDurationInfo(ticks, fallbackDurationId = null, fallbackDots = 0) {
    const info = durationInfoByTicks(Number(ticks) || 0);
    return {
      durationId: info?.duration?.id || fallbackDurationId || null,
      dots: Number.isFinite(Number(info?.dots)) ? Number(info.dots) : Number(fallbackDots) || 0
    };
  }

  function musicXmlRestEvent(ticks, options = {}) {
    const durationInfo = musicXmlDurationInfo(ticks, "whole", 0);
    return {
      type: "rest",
      duration: Number(ticks) || 0,
      durationId: durationInfo.durationId,
      dots: durationInfo.dots,
      measureRest: options.measureRest === true
    };
  }

  function musicXmlNoteNameInfo(name) {
    const match = String(name || "").trim().match(/^([A-G])([#b]*)$/);
    if (!match) return null;
    const alter = [...match[2]].reduce((sum, char) => (
      sum + (char === "#" ? 1 : char === "b" ? -1 : 0)
    ), 0);
    return {
      step: match[1],
      alter
    };
  }

  function musicXmlHarmonyKindForSuffix(suffix) {
    const normalized = normalizeChordSuffix(suffix || "");
    const knownKinds = {
      "": { value: "major", text: "" },
      "m": { value: "minor", text: "m" },
      "7": { value: "dominant", text: "7" },
      "m7": { value: "minor-seventh", text: "m7" },
      "∆": { value: "major-seventh", text: "∆" },
      "∆7": { value: "major-seventh", text: "∆" },
      "6": { value: "major-sixth", text: "6" },
      "m6": { value: "minor-sixth", text: "m6" },
      "9": { value: "dominant-ninth", text: "9" },
      "m9": { value: "minor-ninth", text: "m9" },
      "∆9": { value: "major-ninth", text: "∆9" },
      "11": { value: "dominant-11th", text: "11" },
      "m11": { value: "minor-11th", text: "m11" },
      "∆11": { value: "major-11th", text: "∆11" },
      "13": { value: "dominant-13th", text: "13" },
      "m13": { value: "minor-13th", text: "m13" },
      "∆13": { value: "major-13th", text: "∆13" },
      "sus2": { value: "suspended-second", text: "sus2" },
      "sus4": { value: "suspended-fourth", text: "sus4" },
      "7sus4": { value: "dominant", text: "7sus4", degrees: [{ value: 4, alter: 0, type: "add" }] },
      "m7(b5)": { value: "half-diminished", text: "m7(b5)" },
      "ø": { value: "half-diminished", text: "ø" },
      "º": { value: "diminished", text: "º" },
      "º7": { value: "diminished-seventh", text: "º7" },
      "+": { value: "augmented", text: "+" },
      "+7": { value: "augmented-seventh", text: "+7" },
      "+7(#9)": { value: "augmented-seventh", text: "+7(#9)", degrees: [{ value: 9, alter: 1, type: "alter" }] },
      "7alt": { value: "augmented-seventh", text: "7alt", degrees: [{ value: 9, alter: 1, type: "alter" }] },
      "6(9)": { value: "major-sixth", text: "6(9)", degrees: [{ value: 9, alter: 0, type: "add" }] },
      "m6(9)": { value: "minor-sixth", text: "m6(9)", degrees: [{ value: 9, alter: 0, type: "add" }] }
    };
    if (knownKinds[normalized]) return knownKinds[normalized];
    if (/^∆13/.test(normalized)) return { value: "major-13th", text: normalized };
    if (/^∆11/.test(normalized)) return { value: "major-11th", text: normalized };
    if (/^∆9/.test(normalized)) return { value: "major-ninth", text: normalized };
    if (/^∆7|^∆/.test(normalized)) return { value: "major-seventh", text: normalized };
    if (/^m13/.test(normalized)) return { value: "minor-13th", text: normalized };
    if (/^m11/.test(normalized)) return { value: "minor-11th", text: normalized };
    if (/^m9/.test(normalized)) return { value: "minor-ninth", text: normalized };
    if (/^m7/.test(normalized)) return { value: "minor-seventh", text: normalized };
    if (/^13/.test(normalized)) return { value: "dominant-13th", text: normalized };
    if (/^11/.test(normalized)) return { value: "dominant-11th", text: normalized };
    if (/^9/.test(normalized)) return { value: "dominant-ninth", text: normalized };
    if (/^7/.test(normalized)) return { value: "dominant", text: normalized };
    return { value: "other", text: normalized };
  }

  function musicXmlHarmonyDegreesForSuffix(suffix, baseDegrees = []) {
    const normalized = normalizeChordSuffix(suffix || "");
    const degrees = [...(baseDegrees || [])];
    const alterationMatches = normalized.matchAll(/([#b])\s*(5|9|11|13)/g);
    for (const match of alterationMatches) {
      degrees.push({
        value: Number(match[2]),
        alter: match[1] === "#" ? 1 : -1,
        type: "alter"
      });
    }
    const addMatches = normalized.matchAll(/(?:add|\()(\d+)\)?/gi);
    for (const match of addMatches) {
      const value = Number(match[1]);
      if ([2, 4, 6, 9, 11, 13].includes(value)) {
        degrees.push({ value, alter: 0, type: "add" });
      }
    }
    const seen = new Set();
    return degrees.filter((degree) => {
      const key = `${degree.value}:${degree.alter}:${degree.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function musicXmlHarmonyFromChordText(text) {
    const parsed = parseChordSymbol(text);
    const root = musicXmlNoteNameInfo(parsed?.root);
    if (!parsed || !root) return null;
    const bass = parsed.bass && parsed.bass !== parsed.root
      ? musicXmlNoteNameInfo(parsed.bass)
      : null;
    const kind = musicXmlHarmonyKindForSuffix(parsed.suffix);
    return {
      text: String(text || "").trim(),
      root,
      bass,
      kind: {
        value: kind.value,
        text: kind.text
      },
      degrees: musicXmlHarmonyDegreesForSuffix(parsed.suffix, kind.degrees)
    };
  }

  function musicXmlDynamicName(text) {
    const value = String(text || "").trim().replace(/\s+/g, "").replace(/ƒ/g, "f").toLowerCase();
    if (/^(?:p{1,5}|mp|mf|f{1,5}|sf|sfp|sfz|sffz|fp|rfz|fz)$/.test(value)) return value;
    return "";
  }

  function musicXmlTempoUnitText(durationId = "quarter", dots = 0) {
    const names = {
      whole: "redonda",
      half: "blanca",
      quarter: "negra",
      eighth: "corchea",
      sixteenth: "semicorchea",
      "thirty-second": "fusa",
      "sixty-fourth": "semifusa"
    };
    const base = names[durationId] || names.quarter;
    return `${base}${Number(dots) > 0 ? " con puntillo" : ""}`;
  }

  function musicXmlTempoDirectionForMark(mark, measureIndex, measureTicksValue) {
    if (!mark || !["tempo", "tempo-quarter", "tempo-text", "ritardando"].includes(mark.type)) return null;
    if (Number(mark.measureIndex) !== measureIndex) return null;
    const tick = Math.max(0, Math.min(measureTicksValue, Number(mark.tick) || 0));
    if (mark.type === "tempo-text") {
      const text = String(mark.text || "").trim();
      return text ? { type: "words", placement: "above", tick, text, staff: 1 } : null;
    }
    if (mark.type === "ritardando") {
      return { type: "words", placement: "above", tick, text: "rit.", staff: 1 };
    }
    const bpm = mark.type === "tempo-quarter" ? 82 : tempoMarkBpm(mark);
    if (!Number.isFinite(bpm)) return null;
    const unitDurationId = mark.type === "tempo-quarter" ? "quarter" : (mark.unitDurationId || "quarter");
    const dots = mark.type === "tempo-quarter" ? 0 : (Number(mark.dots) || 0);
    const unitTicks = tempoUnitTicks(unitDurationId, dots);
    const quarterBpm = bpm * 4 / Math.max(EPSILON, unitTicks);
    return {
      type: "tempo",
      placement: "above",
      tick,
      text: `${musicXmlTempoUnitText(unitDurationId, dots)} = ${bpm}`,
      bpm,
      quarterBpm,
      unitDurationId,
      dots,
      staff: 1
    };
  }

  function musicXmlDirectionForTextItem(item, measureIndex, measureTicksValue) {
    const text = String(item?.text || "").trim();
    if (!text || Number(item.measureIndex) !== measureIndex) return null;
    const tick = Math.max(0, Math.min(measureTicksValue, Number(item.tick) || 0));
    if (AnchoredText.isChord(item)) {
      const harmony = musicXmlHarmonyFromChordText(text);
      return harmony
        ? { type: "harmony", tick, text, harmony, staff: 1 }
        : { type: "words", placement: "above", tick, text, staff: 1 };
    }
    if (AnchoredText.isDynamic(item)) {
      const dynamic = musicXmlDynamicName(text);
      return dynamic
        ? { type: "dynamic", placement: "below", tick, text, dynamic, staff: textItemSystemIndex(item) + 1 }
        : { type: "words", placement: "below", tick, text, staff: textItemSystemIndex(item) + 1 };
    }
    if (item.kind === AnchoredText.KINDS.TEXT) {
      return { type: "words", placement: "above", tick, text, staff: textItemSystemIndex(item) + 1 };
    }
    return null;
  }

  function musicXmlMeasureDirections(measureIndex, measureTicksValue) {
    const directions = [
      ...(state.textItems || []).map((item) => musicXmlDirectionForTextItem(item, measureIndex, measureTicksValue)),
      ...(state.marks || []).map((mark) => {
        if (mark.type === "dynamic-mf" && Number(mark.measureIndex) === measureIndex) {
          return {
            type: "dynamic",
            placement: "below",
            tick: Math.max(0, Math.min(measureTicksValue, Number(mark.tick) || 0)),
            text: "mf",
            dynamic: "mf",
            staff: markSystemIndex(mark) + 1
          };
        }
        return musicXmlTempoDirectionForMark(mark, measureIndex, measureTicksValue);
      })
    ].filter(Boolean);
    return directions.sort((a, b) => (
      (Number(a.tick) || 0) - (Number(b.tick) || 0) ||
      String(a.type || "").localeCompare(String(b.type || ""))
    ));
  }

  function musicXmlClefIdAt(systemIndex, absoluteTick) {
    return withSystemContext(systemIndex, () => clefIdAtAbsoluteTick(absoluteTick));
  }

  function musicXmlMeasureClefs(measureIndex) {
    const absoluteTick = measureStartAbsoluteTick(measureIndex);
    return scoreSystems().map((system, systemIndex) => ({
      staff: systemIndex + 1,
      clefId: musicXmlClefIdAt(systemIndex, absoluteTick)
    }));
  }

  function musicXmlAttributeChangesForMeasure(measureIndex, measureTicksValue) {
    return (state.marks || [])
      .filter((mark) => mark?.type === "clef" && mark.clefId && Number(mark.measureIndex) === measureIndex)
      .map((mark) => {
        const tick = Math.max(0, Math.min(measureTicksValue, Number(mark.tick) || 0));
        if (tick <= EPSILON) return null;
        return {
          type: "clef",
          tick,
          staff: markSystemIndex(mark) + 1,
          clefId: mark.clefId
        };
      })
      .filter(Boolean)
      .sort((a, b) => (Number(a.tick) || 0) - (Number(b.tick) || 0) || (Number(a.staff) || 0) - (Number(b.staff) || 0));
  }

  function musicXmlBarlineStyle(type, location) {
    if (type === "double") return "light-light";
    if (type === "final") return "light-heavy";
    if (type === "repeat-start") return "heavy-light";
    if (type === "repeat-end") return "light-heavy";
    if (type === "repeat-both") return location === "left" ? "heavy-light" : "light-heavy";
    return "regular";
  }

  function musicXmlRepeatForBarline(type, location) {
    if (type === "repeat-start" && location === "left") return "forward";
    if (type === "repeat-end" && location === "right") return "backward";
    if (type === "repeat-both") return location === "left" ? "forward" : "backward";
    return null;
  }

  function musicXmlEndingNumber(mark) {
    return String(mark?.label || "1").replace(/\.$/, "").trim() || "1";
  }

  function musicXmlBarlinesForMeasure(measureIndex) {
    const byLocation = new Map();
    const ensure = (location) => {
      if (!byLocation.has(location)) byLocation.set(location, { location, endings: [] });
      return byLocation.get(location);
    };

    (state.marks || []).forEach((mark) => {
      if (mark?.type === "barline") {
        const boundary = Number(mark.boundaryIndex);
        const type = mark.barlineType || "single";
        const locations = [];
        if (boundary === measureIndex + 1 && type !== "repeat-start") locations.push("right");
        if (boundary === measureIndex && (type === "repeat-start" || type === "repeat-both")) locations.push("left");
        locations.forEach((location) => {
          const barline = ensure(location);
          barline.style = musicXmlBarlineStyle(type, location);
          const repeat = musicXmlRepeatForBarline(type, location);
          if (repeat) barline.repeat = repeat;
        });
      } else if (mark?.type === "ending") {
        const start = Math.max(0, Number(mark.startMeasureIndex ?? mark.measureIndex) || 0);
        const end = Math.max(start + 1, Number(mark.endMeasureIndex) || start + 1);
        const number = musicXmlEndingNumber(mark);
        if (measureIndex === start) {
          ensure("left").endings.push({ number, type: "start" });
        }
        if (measureIndex === end - 1) {
          ensure("right").endings.push({
            number,
            type: mark.closedEnd === true ? "stop" : "discontinue"
          });
        }
      }
    });

    return ["left", "right"]
      .map((location) => byLocation.get(location))
      .filter(Boolean)
      .map((barline) => ({
        ...barline,
        style: barline.style || (barline.endings?.length ? "regular" : null)
      }));
  }

  function musicXmlPlacementForMark(mark, glyphName = "") {
    const name = String(glyphName || mark?.glyphName || "");
    if (mark?.flipped === true || name.endsWith("Below")) return "below";
    return "above";
  }

  function musicXmlArticulationNotation(name, mark, glyphName = "", extra = {}) {
    return {
      group: "articulations",
      name,
      placement: musicXmlPlacementForMark(mark, glyphName),
      ...extra
    };
  }

  function musicXmlOrnamentNotation(name, mark, glyphName = "", extra = {}) {
    return {
      group: "ornaments",
      name,
      placement: musicXmlPlacementForMark(mark, glyphName),
      ...extra
    };
  }

  function musicXmlTechnicalNotation(name, mark, glyphName = "", extra = {}) {
    return {
      group: "technical",
      name,
      placement: musicXmlPlacementForMark(mark, glyphName),
      ...extra
    };
  }

  function musicXmlNotationsForGlyphMark(mark) {
    const glyphName = mark?.type === "accent"
      ? (mark.flipped ? "articAccentBelow" : "articAccentAbove")
      : mark?.type === "fermata"
        ? (mark.flipped ? "fermataBelow" : "fermataAbove")
        : String(mark?.glyphName || "");
    if (!glyphName) return [];
    const name = glyphName.replace(/Below$|Above$/g, "");
    const lower = name.toLowerCase();
    const placement = musicXmlPlacementForMark(mark, glyphName);
    if (lower.startsWith("fermata")) {
      return [{ group: "fermata", name: "fermata", placement, text: "normal" }];
    }
    if (name === "articAccent") return [musicXmlArticulationNotation("accent", mark, glyphName)];
    if (name === "articMarcato") {
      return [musicXmlArticulationNotation("strong-accent", mark, glyphName, {
        type: placement === "below" ? "down" : "up"
      })];
    }
    if (name === "articStaccato") return [musicXmlArticulationNotation("staccato", mark, glyphName)];
    if (name === "articStaccatissimo" || name === "articStaccatissimoWedge") {
      return [musicXmlArticulationNotation("staccatissimo", mark, glyphName)];
    }
    if (name === "articTenuto") return [musicXmlArticulationNotation("tenuto", mark, glyphName)];
    if (name === "articTenutoAccent") {
      return [
        musicXmlArticulationNotation("tenuto", mark, glyphName),
        musicXmlArticulationNotation("accent", mark, glyphName)
      ];
    }
    if (name === "articTenutoStaccato") {
      return [
        musicXmlArticulationNotation("tenuto", mark, glyphName),
        musicXmlArticulationNotation("staccato", mark, glyphName)
      ];
    }
    if (name === "articAccentStaccato") {
      return [
        musicXmlArticulationNotation("accent", mark, glyphName),
        musicXmlArticulationNotation("staccato", mark, glyphName)
      ];
    }
    if (name === "articMarcatoStaccato") {
      return [
        musicXmlArticulationNotation("strong-accent", mark, glyphName, {
          type: placement === "below" ? "down" : "up"
        }),
        musicXmlArticulationNotation("staccato", mark, glyphName)
      ];
    }
    if (name === "articMarcatoTenuto") {
      return [
        musicXmlArticulationNotation("strong-accent", mark, glyphName, {
          type: placement === "below" ? "down" : "up"
        }),
        musicXmlArticulationNotation("tenuto", mark, glyphName)
      ];
    }
    if (name === "articStress") return [musicXmlArticulationNotation("stress", mark, glyphName)];
    if (name === "articUnstress") return [musicXmlArticulationNotation("unstress", mark, glyphName)];
    if (name === "articLaissezVibrer") {
      return [musicXmlArticulationNotation("other-articulation", mark, glyphName, { text: "laissez vibrer" })];
    }
    if (lower.startsWith("breathmark")) return [musicXmlArticulationNotation("breath-mark", mark, glyphName)];
    if (lower.startsWith("caesura")) return [musicXmlArticulationNotation("caesura", mark, glyphName)];
    if (lower.includes("downbow")) return [musicXmlTechnicalNotation("down-bow", mark, glyphName)];
    if (lower.includes("upbow")) return [musicXmlTechnicalNotation("up-bow", mark, glyphName)];
    if (lower.includes("snappizzicato")) return [musicXmlTechnicalNotation("snap-pizzicato", mark, glyphName)];
    if (lower.includes("trill") || lower.includes("tremblement") || lower.includes("valvetrill") || lower.includes("windtrill")) {
      return [musicXmlOrnamentNotation("trill-mark", mark, glyphName)];
    }
    if (lower.includes("invertedmordent")) return [musicXmlOrnamentNotation("inverted-mordent", mark, glyphName)];
    if (lower.includes("mordent")) return [musicXmlOrnamentNotation("mordent", mark, glyphName)];
    if (lower.includes("turninverted")) return [musicXmlOrnamentNotation("inverted-turn", mark, glyphName)];
    if (lower.includes("turn") || lower.includes("haydn")) return [musicXmlOrnamentNotation("turn", mark, glyphName)];
    if (lower.includes("shake")) return [musicXmlOrnamentNotation("shake", mark, glyphName)];
    if (lower.includes("scoop")) return [musicXmlArticulationNotation("scoop", mark, glyphName)];
    if (lower.includes("fall")) return [musicXmlArticulationNotation("falloff", mark, glyphName)];
    if (lower.includes("doit")) return [musicXmlArticulationNotation("doit", mark, glyphName)];
    if (lower.includes("plop")) return [musicXmlArticulationNotation("plop", mark, glyphName)];
    return [];
  }

  function musicXmlMarkMatchesEntryHead(mark, entry, measureIndex, systemIndex, staffStep) {
    if (!mark || !entry || entry.type === "rest") return false;
    if (!["accent", "fermata", "glyph"].includes(mark.type)) return false;
    if (markSystemIndex(mark) !== systemIndex) return false;
    if (mark.entryId && mark.entryId !== entry.id) return false;
    if (!mark.entryId) {
      if (Number(mark.measureIndex) !== measureIndex) return false;
      if (Math.abs((Number(mark.tick) || 0) - (Number(entry.tickStart) || 0)) > EPSILON) return false;
    }
    const markStep = Number.isFinite(mark.staffStep)
      ? nearestEntryStaffStep(entry, mark.staffStep)
      : staffStep;
    return Math.abs(markStep - staffStep) < EPSILON;
  }

  function musicXmlPhraseSlurNumber(mark) {
    const slurs = (state.marks || []).filter((item) => item?.type === "slur" || item?.type === "dotted-slur");
    const index = Math.max(0, slurs.findIndex((item) => item.id === mark?.id));
    return (index % 16) + 1;
  }

  function musicXmlPhraseSlursForEntryHead(entry, systemIndex, staffStep) {
    if (!entry || entry.type === "rest") return [];
    return (state.marks || [])
      .filter((mark) => (mark?.type === "slur" || mark?.type === "dotted-slur") && markSystemIndex(mark) === systemIndex)
      .flatMap((mark) => {
        const rows = [];
        const startMatches = mark.entryId === entry.id &&
          Math.abs(nearestEntryStaffStep(entry, mark.staffStep) - staffStep) < EPSILON;
        const endMatches = mark.endEntryId === entry.id &&
          Math.abs(nearestEntryStaffStep(entry, mark.endStaffStep) - staffStep) < EPSILON;
        if (startMatches && mark.endEntryId && mark.endEntryId !== entry.id) {
          rows.push({
            type: "start",
            number: musicXmlPhraseSlurNumber(mark),
            lineType: mark.type === "dotted-slur" ? "dotted" : "solid",
            placement: musicXmlPlacementForMark(mark)
          });
        }
        if (endMatches && mark.entryId && mark.entryId !== entry.id) {
          rows.push({
            type: "stop",
            number: musicXmlPhraseSlurNumber(mark),
            lineType: mark.type === "dotted-slur" ? "dotted" : "solid",
            placement: musicXmlPlacementForMark(mark)
          });
        }
        return rows;
      });
  }

  function musicXmlNotationsForEntryHead(entry, measureIndex, systemIndex, staffStep) {
    const marks = (state.marks || [])
      .filter((mark) => musicXmlMarkMatchesEntryHead(mark, entry, measureIndex, systemIndex, staffStep))
      .flatMap(musicXmlNotationsForGlyphMark);
    const slurs = musicXmlPhraseSlursForEntryHead(entry, systemIndex, staffStep);
    if (!marks.length && !slurs.length) return null;
    return {
      articulations: marks.filter((notation) => notation.group === "articulations"),
      ornaments: marks.filter((notation) => notation.group === "ornaments"),
      technical: marks.filter((notation) => notation.group === "technical"),
      fermatas: marks.filter((notation) => notation.group === "fermata"),
      slurs
    };
  }

  function musicXmlTieStartsForEntry(entry, staffStep) {
    if (!entry?.tieToNext) return false;
    if (!Number.isFinite(entry.tieStaffStep)) return true;
    return Math.abs(nearestEntryStaffStep(entry, entry.tieStaffStep) - staffStep) < EPSILON;
  }

  function musicXmlEventsForEntry(entry, measureIndex, systemIndex) {
    const ticks = Math.max(0, Number(entry?.ticks) || 0);
    if (!entry || ticks <= EPSILON) return [];
    const durationInfo = musicXmlDurationInfo(ticks, entry.durationId, dotCountForEntry(entry));
    const base = {
      duration: ticks,
      durationId: durationInfo.durationId,
      dots: durationInfo.dots,
      tuplet: entry.tuplet ? {
        actual: entry.tuplet.actual,
        normal: entry.tuplet.normal,
        unitDurationId: entry.tuplet.unitDurationId
      } : null
    };
    if (entry.type === "rest") {
      return [{
        ...base,
        type: "rest",
        measureRest: isMeasureRestEntry(entry, measureIndex)
      }];
    }
    const system = scoreSystems()[systemIndex];
    if (systemIsPercussionLine(system)) {
      const staffStep = entryStaffStep(entry);
      return [{
        ...base,
        type: "note",
        unpitched: true,
        displayStep: "C",
        displayOctave: 5,
        notations: musicXmlNotationsForEntryHead(entry, measureIndex, systemIndex, staffStep),
        tieStart: musicXmlTieStartsForEntry(entry, staffStep)
      }];
    }
    ensureEntryPitchData(entry, measureStartAbsoluteTick(measureIndex) + Number(entry.tickStart || 0));
    return entryStaffSteps(entry).map((staffStep, index) => {
      const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
      const accidental = effectiveEntryAccidental(entry, staffStep) ||
        diatonicAccidentalForMeasure(diatonicStep, measureIndex);
      return {
        ...base,
        type: "note",
        chord: index > 0,
        staffStep,
        diatonicStep,
        pitch: musicXmlPitchForDiatonicStep(diatonicStep, accidental),
        notations: musicXmlNotationsForEntryHead(entry, measureIndex, systemIndex, staffStep),
        tieStart: musicXmlTieStartsForEntry(entry, staffStep)
      };
    });
  }

  function musicXmlVoiceEvents(entries, measureIndex, measureTicksValue, systemIndex) {
    const events = [];
    let cursor = 0;
    const sortedEntries = [...entries]
      .filter((entry) => !entry.hiddenTupletReserve)
      .sort((a, b) => (Number(a.tickStart) || 0) - (Number(b.tickStart) || 0));
    sortedEntries.forEach((entry) => {
      const start = Math.max(0, Math.min(measureTicksValue, Number(entry.tickStart) || 0));
      const ticks = Math.max(0, Number(entry.ticks) || 0);
      if (start > cursor + EPSILON) {
        events.push(musicXmlRestEvent(start - cursor));
      }
      events.push(...musicXmlEventsForEntry(entry, measureIndex, systemIndex));
      cursor = Math.max(cursor, start + ticks);
    });
    if (cursor < measureTicksValue - EPSILON) {
      events.push(musicXmlRestEvent(measureTicksValue - cursor, { measureRest: events.length === 0 }));
    }
    return events.length ? events : [musicXmlRestEvent(measureTicksValue, { measureRest: true })];
  }

  function buildMusicXmlExportModel() {
    syncActiveSystemMeasures();
    refreshAutomaticAccidentals();
    const systems = scoreSystems();
    const measureCount = Math.max(0, ...systems.map((system) => system.measures?.length || 0));
    const staves = systems.map((system, systemIndex) => ({
      number: systemIndex + 1,
      kind: system.kind || "staff",
      clefId: initialClefIdForSystem(systemIndex),
      percussion: systemIsPercussionLine(system)
    }));
    const measures = [];
    for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
      if (measureIsHidden(measureIndex)) continue;
      const ticks = measureTicksForIndex(measureIndex);
      const measure = {
        number: measures.length + 1,
        sourceMeasureIndex: measureIndex,
        ticks,
        meter: meterForMeasureIndex(measureIndex),
        keySignature: keySignatureForMeasureIndex(measureIndex),
        clefs: musicXmlMeasureClefs(measureIndex),
        attributeChanges: musicXmlAttributeChangesForMeasure(measureIndex, ticks),
        directions: musicXmlMeasureDirections(measureIndex, ticks),
        barlines: musicXmlBarlinesForMeasure(measureIndex),
        staves: []
      };
      systems.forEach((system, systemIndex) => {
        const staff = withSystemContext(systemIndex, () => {
          const sourceMeasure = system.measures?.[measureIndex] || { entries: [] };
          const entries = (sourceMeasure.entries || []).filter((entry) => !entry.hiddenTupletReserve);
          const voices = [...new Set(entries.map((entry) => entryVoice(entry)))].sort((a, b) => a - b);
          const voiceNumbers = voices.length ? voices : [1];
          return {
            number: systemIndex + 1,
            kind: system.kind || "staff",
            voices: voiceNumbers.map((voice) => ({
              number: voice,
              events: musicXmlVoiceEvents(
                entries.filter((entry) => entryVoice(entry) === voice),
                measureIndex,
                ticks,
                systemIndex
              )
            }))
          };
        });
        measure.staves.push(staff);
      });
      measures.push(measure);
    }
    return {
      title: String(exerciseTitleInput?.value || "").trim() || "Cuaderno JML",
      partName: "Cuaderno",
      divisions: MusicXml.DEFAULT_DIVISIONS,
      midi: {
        instrumentId: "P1-I1",
        instrumentName: "Piano",
        channel: 1,
        program: 1,
        volume: 80
      },
      staves,
      measures
    };
  }

  function validateMusicXmlText(xml) {
    const text = String(xml || "");
    const errors = [];
    if (!text.includes("<score-partwise")) errors.push("Falta score-partwise.");
    if (!text.includes("<part-list>")) errors.push("Falta part-list.");
    if (!text.includes('<part id="P1">')) errors.push("Falta la parte principal P1.");
    if (typeof DOMParser !== "undefined") {
      const documentXml = new DOMParser().parseFromString(text, "application/xml");
      const parserError = documentXml.querySelector("parsererror");
      if (parserError) {
        errors.push(String(parserError.textContent || "XML inválido.").replace(/\s+/g, " ").trim().slice(0, 220));
      }
    }
    return {
      ok: errors.length === 0,
      errors
    };
  }

  function musicXmlExportStats(model) {
    const stats = {
      measures: model?.measures?.length || 0,
      staves: model?.staves?.length || 0,
      notes: 0,
      rests: 0,
      chordHeads: 0,
      harmonies: 0,
      dynamics: 0,
      textDirections: 0,
      tempos: 0,
      articulations: 0,
      ornaments: 0,
      technical: 0,
      fermatas: 0,
      phraseSlurs: 0,
      ties: 0,
      clefChanges: 0,
      barlines: 0,
      endings: 0,
      repeats: 0
    };
    (model?.measures || []).forEach((measure) => {
      stats.clefChanges += (measure.attributeChanges || []).filter((change) => change?.type === "clef").length;
      (measure.barlines || []).forEach((barline) => {
        stats.barlines += 1;
        stats.endings += (barline.endings || []).length;
        if (barline.repeat) stats.repeats += 1;
      });
      (measure.directions || []).forEach((direction) => {
        if (direction.type === "harmony") stats.harmonies += 1;
        else if (direction.type === "dynamic") stats.dynamics += 1;
        else if (direction.type === "tempo") stats.tempos += 1;
        else stats.textDirections += 1;
      });
      (measure.staves || []).forEach((staff) => {
        (staff.voices || []).forEach((voice) => {
          (voice.events || []).forEach((event) => {
            if (event.type === "rest") stats.rests += 1;
            if (event.type === "note") stats.notes += 1;
            if (event.chord) stats.chordHeads += 1;
            if (event.tieStart) stats.ties += 1;
            const notations = event.notations || {};
            stats.articulations += (notations.articulations || []).length;
            stats.ornaments += (notations.ornaments || []).length;
            stats.technical += (notations.technical || []).length;
            stats.fermatas += (notations.fermatas || []).length;
            stats.phraseSlurs += (notations.slurs || []).length;
          });
        });
      });
    });
    return stats;
  }

  function musicXmlOmissionSummary(measureCount = 0) {
    const hiddenMeasures = Array.from({ length: Math.max(0, measureCount) }, (_, index) => index)
      .filter((index) => measureIsHidden(index)).length;
    const floatingTextCount = (state.textItems || []).filter((item) => (
      (item.kind || AnchoredText.KINDS.TEXT) === AnchoredText.KINDS.TEXT &&
      (!Number.isFinite(Number(item.measureIndex)) || !Number.isFinite(Number(item.tick)))
    )).length;
    const unsupportedGlyphMarks = (state.marks || []).filter((mark) => (
      mark?.type === "glyph" &&
      musicXmlNotationsForGlyphMark(mark).length === 0
    )).length;
    const visualOnlyMarks = (state.marks || []).filter((mark) => (
      mark?.type === "crescendo" || mark?.type === "diminuendo"
    )).length;
    const incompletePhraseSlurs = (state.marks || []).filter((mark) => (
      (mark?.type === "slur" || mark?.type === "dotted-slur") &&
      (!mark.entryId || !mark.endEntryId || mark.entryId === mark.endEntryId)
    )).length;
    return {
      hiddenMeasures,
      floatingTextCount,
      unsupportedGlyphMarks,
      visualOnlyMarks,
      incompletePhraseSlurs
    };
  }

  function formatCount(label, count) {
    return count > 0 ? `${count} ${label}` : "";
  }

  function musicXmlExportMessage(model, validation, omissions) {
    const stats = musicXmlExportStats(model);
    const exported = [
      formatCount("compases", stats.measures),
      formatCount("pentagramas", stats.staves),
      formatCount("notas", stats.notes),
      formatCount("silencios", stats.rests),
      formatCount("cifrados", stats.harmonies),
      formatCount("dinámicas", stats.dynamics),
      formatCount("textos/tempos", stats.textDirections + stats.tempos),
      formatCount("articulaciones", stats.articulations),
      formatCount("ornamentos", stats.ornaments),
      formatCount("técnicas", stats.technical),
      formatCount("fermatas", stats.fermatas),
      formatCount("ligaduras de fraseo", stats.phraseSlurs),
      formatCount("ligaduras de duración", stats.ties),
      formatCount("cambios de clave", stats.clefChanges),
      formatCount("barras", stats.barlines),
      formatCount("casillas", stats.endings),
      formatCount("repeticiones", stats.repeats)
    ].filter(Boolean).join(", ");
    const omitted = [
      formatCount("compases ocultos", omissions.hiddenMeasures),
      formatCount("textos flotantes sin anclaje musical", omissions.floatingTextCount),
      formatCount("glifos sin mapeo MusicXML seguro", omissions.unsupportedGlyphMarks),
      formatCount("marcas visuales sin traducción segura", omissions.visualOnlyMarks),
      formatCount("ligaduras de fraseo incompletas", omissions.incompletePhraseSlurs)
    ].filter(Boolean).join(", ");
    const validationText = validation.ok
      ? "Validación XML básica: correcta."
      : `Advertencia de validación XML: ${validation.errors.join(" ")}`;
    return [
      "MusicXML exportado.",
      validationText,
      exported ? `Exportado: ${exported}.` : "",
      omitted ? `Omitido: ${omitted}.` : "No se detectaron omisiones musicales relevantes."
    ].filter(Boolean).join("\n");
  }

  function downloadTextFile(filename, text, type = "text/plain;charset=utf-8") {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function musicXmlExportFilename() {
    const title = String(exerciseTitleInput?.value || "cuaderno-jml")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúüñ]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "cuaderno-jml";
    return `${title}.musicxml`;
  }

  async function exportMusicXml() {
    const model = buildMusicXmlExportModel();
    if (!model.measures.length) {
      await showEditorMessage("No hay compases visibles para exportar.");
      return false;
    }
    const xml = MusicXml.serialize(model);
    const validation = validateMusicXmlText(xml);
    const omissions = musicXmlOmissionSummary(Math.max(0, ...scoreSystems().map((system) => system.measures?.length || 0)));
    downloadTextFile(musicXmlExportFilename(), xml, "application/vnd.recordare.musicxml+xml;charset=utf-8");
    await showEditorMessage(musicXmlExportMessage(model, validation, omissions));
    return validation.ok;
  }

  function tempoUnitTicks(unitDurationId = "quarter", dots = 0) {
    return MidiPlayback.tempoUnitTicks(unitDurationId, dots, durationById);
  }

  function tempoMarkBpm(mark) {
    return MidiPlayback.tempoMarkBpm(mark);
  }

  function normalizePlaybackBpm(value) {
    const bpm = Math.round(Number(value));
    if (!Number.isFinite(bpm)) return DEFAULT_PLAYBACK_BPM;
    return Math.max(20, Math.min(320, bpm));
  }

  function setPlaybackBpm(value) {
    const nextBpm = normalizePlaybackBpm(value);
    state.playbackBpm = nextBpm;
    if (playbackBpmInput && Number(playbackBpmInput.value) !== nextBpm) {
      playbackBpmInput.value = String(nextBpm);
    }
    if (state.midiPlayback.active) stopMidiPlayback();
    return nextBpm;
  }

  function normalizeJazzSwingPreset(value) {
    return JAZZ_SWING_PRESETS[String(value || "")] ? String(value) : DEFAULT_JAZZ_SWING_PRESET;
  }

  function currentJazzSwingPreset() {
    return JAZZ_SWING_PRESETS[normalizeJazzSwingPreset(state.jazzSwingPreset)] || JAZZ_SWING_PRESETS[DEFAULT_JAZZ_SWING_PRESET];
  }

  function jazzSwingSplit() {
    const split = Number(currentJazzSwingPreset().split);
    return Number.isFinite(split) ? Math.max(0.5, Math.min(0.9, split)) : JAZZ_SWING_PRESETS[DEFAULT_JAZZ_SWING_PRESET].split;
  }

  function setJazzSwingPreset(preset) {
    state.jazzSwingPreset = normalizeJazzSwingPreset(preset);
    state.jazzMode = true;
    if (state.midiPlayback.active) stopMidiPlayback();
    updateModeButtons();
    return state.jazzSwingPreset;
  }

  function playbackTempoEvents() {
    return MidiPlayback.tempoEventsFromMarks({
      marks: [],
      absoluteTickForMark,
      durationById,
      defaultBpm: normalizePlaybackBpm(state.playbackBpm),
      defaultUnitDurationId: "quarter"
    });
  }

  function playbackMsForTick(absoluteTick, tempoEvents = playbackTempoEvents()) {
    return MidiPlayback.msForTick(absoluteTick, tempoEvents, EPSILON);
  }

  function playbackTickForMs(elapsedMs, tempoEvents = playbackTempoEvents()) {
    return MidiPlayback.tickForMs(elapsedMs, tempoEvents, EPSILON);
  }

  function roundJazzTick(value) {
    return Math.round((Number(value) || 0) * 1000) / 1000;
  }

  function jazzPulseCache() {
    if (!(state.jazzSwingCache instanceof Map)) state.jazzSwingCache = new Map();
    return state.jazzSwingCache;
  }

  function markJazzSwingCacheDirty() {
    state.jazzSwingRevision = (Number(state.jazzSwingRevision) || 0) + 1;
  }

  function jazzPulseEntryDuration(entry) {
    return durationById(entry?.durationId) || entryDuration(entry) || durationById("quarter");
  }

  function jazzPulseData(measureIndex, pulseIndex, profile, pulseStart, pulseEnd, lane = {}) {
    const pulseSpan = Math.max(0, pulseEnd - pulseStart);
    const eighthTicks = durationById("eighth")?.ticks || 2;
    const laneSystemIndex = Number.isFinite(Number(lane.systemIndex)) ? Number(lane.systemIndex) : null;
    const laneVoice = Number(lane.voice) === 2 ? 2 : Number(lane.voice) === 1 ? 1 : null;
    const signatureParts = [
      `meter:${profile.label || `${profile.top}/${profile.bottom}`}:${profile.kind}:${roundJazzTick(profile.unitTicks)}:${roundJazzTick(pulseStart)}:${roundJazzTick(pulseEnd)}:lane:${laneSystemIndex ?? "*"}:${laneVoice ?? "*"}`
    ];
    let hasTuplet = false;
    const starts = new Map();
    scoreSystems().forEach((system, systemIndex) => {
      if (laneSystemIndex !== null && systemIndex !== laneSystemIndex) return;
      const measure = system?.measures?.[measureIndex];
      if (!measure?.entries?.length) return;
      (measure.entries || []).forEach((entry, entryIndex) => {
        if (!entry || entry.hiddenTupletReserve) return;
        const voice = entryVoice(entry);
        if (laneVoice !== null && voice !== laneVoice) return;
        const start = Number(entry.tickStart) || 0;
        const duration = jazzPulseEntryDuration(entry);
        const ticks = Math.max(EPSILON, Number(entry.ticks) || duration?.ticks || 1);
        const end = start + ticks;
        if (end <= pulseStart + EPSILON || start >= pulseEnd - EPSILON) return;
        const durationId = entry.durationId || duration?.id || "";
        const dots = Number(entry.dots) || (entry.dotted ? 1 : 0);
        const tuplet = normalizeTuplet(entry.tuplet);
        if (tuplet) hasTuplet = true;
        if (start >= pulseStart - EPSILON && start < pulseEnd - EPSILON) {
          const offset = roundJazzTick(start - pulseStart);
          const slot = starts.get(offset) || { offset, minTicks: Infinity, maxTicks: 0, durationIds: new Set(), dots: new Set() };
          slot.minTicks = Math.min(slot.minTicks, ticks);
          slot.maxTicks = Math.max(slot.maxTicks, ticks);
          slot.durationIds.add(durationId);
          slot.dots.add(dots);
          starts.set(offset, slot);
        }
        signatureParts.push([
          systemIndex,
          entryIndex,
          voice,
          entry.type || "",
          roundJazzTick(start),
          roundJazzTick(ticks),
          durationId,
          dots,
          tuplet ? `${tuplet.actual}:${tuplet.normal}:${tuplet.unitDurationId}` : ""
        ].join(":"));
      });
    });
    const sixteenthTicks = durationById("sixteenth")?.ticks || Math.max(0.25, eighthTicks / 2);
    const slotAt = (offset) => starts.get(roundJazzTick(offset));
    const slotIsPlain = (slot, expectedTicks, expectedDurationId) => !!slot &&
      Math.abs(slot.minTicks - expectedTicks) < EPSILON &&
      Math.abs(slot.maxTicks - expectedTicks) < EPSILON &&
      slot.durationIds.has(expectedDurationId) &&
      [...slot.dots].every((dot) => Math.abs(Number(dot) || 0) < EPSILON);
    const slotOffsets = [...starts.keys()].map(Number).sort((a, b) => a - b);
    const sameOffsets = (expected) => (
      slotOffsets.length === expected.length &&
      expected.every((offset, index) => Math.abs(slotOffsets[index] - offset) < EPSILON)
    );
    let swingPattern = null;
    if (!hasTuplet && Math.abs(pulseSpan - eighthTicks * 2) < EPSILON) {
      if (
        sameOffsets([0, eighthTicks]) &&
        slotIsPlain(slotAt(0), eighthTicks, "eighth") &&
        slotIsPlain(slotAt(eighthTicks), eighthTicks, "eighth")
      ) {
        swingPattern = "eighth-pair";
      } else if (
        sameOffsets([0, eighthTicks, eighthTicks + sixteenthTicks]) &&
        slotIsPlain(slotAt(0), eighthTicks, "eighth") &&
        slotIsPlain(slotAt(eighthTicks), sixteenthTicks, "sixteenth") &&
        slotIsPlain(slotAt(eighthTicks + sixteenthTicks), sixteenthTicks, "sixteenth")
      ) {
        swingPattern = "eighth-two-sixteenths";
      }
    }
    return {
      signature: signatureParts.join("|"),
      analysis: {
        swingable: !!swingPattern,
        swingPattern,
        pulseStart,
        pulseEnd,
        pulseSpan,
        eighthTicks,
        sixteenthTicks
      }
    };
  }

  function jazzLaneKey(lane = {}) {
    const systemIndex = Number.isFinite(Number(lane.systemIndex)) ? Number(lane.systemIndex) : "*";
    const voice = Number(lane.voice) === 2 ? 2 : Number(lane.voice) === 1 ? 1 : "*";
    return `${systemIndex}:${voice}`;
  }

  function jazzPulseAnalysis(measureIndex, tickInMeasure, playbackCache = null, lane = {}) {
    const profile = meterForMeasureIndex(measureIndex);
    const boundaries = meterPulseBoundaries(profile);
    const pulseIndex = pulseIndexForTick(tickInMeasure, profile);
    const pulseStart = boundaries[pulseIndex] ?? 0;
    const pulseEnd = boundaries[pulseIndex + 1] ?? profile.measureTicks;
    const cacheKey = `${measureIndex}:${pulseIndex}:${jazzLaneKey(lane)}`;
    if (playbackCache?.has(cacheKey)) return playbackCache.get(cacheKey);
    const cached = jazzPulseCache().get(cacheKey);
    if (cached?.revision === state.jazzSwingRevision) {
      playbackCache?.set(cacheKey, cached.analysis);
      return cached.analysis;
    }
    const data = jazzPulseData(measureIndex, pulseIndex, profile, pulseStart, pulseEnd, lane);
    const analysis = cached?.signature === data.signature ? cached.analysis : data.analysis;
    jazzPulseCache().set(cacheKey, {
      signature: data.signature,
      analysis,
      revision: state.jazzSwingRevision
    });
    playbackCache?.set(cacheKey, analysis);
    return analysis;
  }

  function jazzRegisterVelocity(midi, baseVelocity = 64) {
    const midiValue = Number(midi);
    const shaped = baseVelocity + (Number.isFinite(midiValue) ? (midiValue - 60) * 0.55 : 0);
    return Math.max(38, Math.min(96, Math.round(shaped)));
  }

  function jazzModeEvent(event, tempoEvents, playbackCache = null) {
    const next = { ...event, velocity: jazzRegisterVelocity(event.midi) };
    const durationId = event.durationId || "";
    const dots = Number(event.dots) || 0;
    const hasTuplet = !!event.tuplet;
    const location = Number.isFinite(event.measureIndex) && Number.isFinite(event.startTick)
      ? { measureIndex: event.measureIndex, tick: (Number(event.startTick) || 0) - measureStartAbsoluteTick(event.measureIndex) }
      : measureIndexAndTickFromAbsolute(event.startTick);
    const entryTicks = Math.max(EPSILON, Number(event.entryTicks) || ((event.endTick || 0) - (event.startTick || 0)) || 1);
    const carriedByTie = event.tieToNext === true || ((Number(event.endTick) || 0) - (Number(event.startTick) || 0) > entryTicks + EPSILON);
    const quarterTicks = durationById("quarter")?.ticks || 4;

    if (
      durationId === "eighth" &&
      dots === 0 &&
      !hasTuplet &&
      Number.isFinite(location.measureIndex) &&
      Number.isFinite(location.tick)
    ) {
      const pulse = jazzPulseAnalysis(location.measureIndex, location.tick, playbackCache, {
        systemIndex: event.systemIndex,
        voice: event.voice
      });
      const offset = location.tick - pulse.pulseStart;
      const isFirstEighth = Math.abs(offset) < EPSILON;
      const isSecondEighth = Math.abs(offset - pulse.eighthTicks) < EPSILON;
      if ((pulse.swingPattern === "eighth-pair" || pulse.swingPattern === "eighth-two-sixteenths") && isFirstEighth) {
        const pulseAbsoluteStart = measureStartAbsoluteTick(location.measureIndex) + pulse.pulseStart;
        const swingSplitTick = pulseAbsoluteStart + pulse.pulseSpan * jazzSwingSplit();
        next.velocity = 75;
        if (!carriedByTie) {
          next.endMs = playbackMsForTick(swingSplitTick, tempoEvents);
        }
      } else if (pulse.swingPattern === "eighth-pair" && isSecondEighth) {
        const pulseAbsoluteStart = measureStartAbsoluteTick(location.measureIndex) + pulse.pulseStart;
        const swingSplitTick = pulseAbsoluteStart + pulse.pulseSpan * jazzSwingSplit();
        const pulseAbsoluteEnd = pulseAbsoluteStart + pulse.pulseSpan;
        next.velocity = 108;
        next.startMs = playbackMsForTick(swingSplitTick, tempoEvents);
        if (!carriedByTie) {
          next.endMs = playbackMsForTick(pulseAbsoluteEnd, tempoEvents);
        }
      }
    } else if (
      durationId === "sixteenth" &&
      dots === 0 &&
      !hasTuplet &&
      Number.isFinite(location.measureIndex) &&
      Number.isFinite(location.tick)
    ) {
      const pulse = jazzPulseAnalysis(location.measureIndex, location.tick, playbackCache, {
        systemIndex: event.systemIndex,
        voice: event.voice
      });
      if (pulse.swingPattern === "eighth-two-sixteenths") {
        const offset = location.tick - pulse.pulseStart;
        const isFirstFinalSixteenth = Math.abs(offset - pulse.eighthTicks) < EPSILON;
        const isSecondFinalSixteenth = Math.abs(offset - pulse.eighthTicks - pulse.sixteenthTicks) < EPSILON;
        if (isFirstFinalSixteenth || isSecondFinalSixteenth) {
          const pulseAbsoluteStart = measureStartAbsoluteTick(location.measureIndex) + pulse.pulseStart;
          const split = jazzSwingSplit();
          const swingSplitTick = pulseAbsoluteStart + pulse.pulseSpan * split;
          const finalMidTick = pulseAbsoluteStart + pulse.pulseSpan * (split + (1 - split) / 2);
          const pulseAbsoluteEnd = pulseAbsoluteStart + pulse.pulseSpan;
          next.velocity = 108;
          next.startMs = playbackMsForTick(isFirstFinalSixteenth ? swingSplitTick : finalMidTick, tempoEvents);
          if (!carriedByTie) {
            next.endMs = playbackMsForTick(isFirstFinalSixteenth ? finalMidTick : pulseAbsoluteEnd, tempoEvents);
          }
        }
      }
    } else if (
      durationId === "quarter" &&
      dots === 0 &&
      !hasTuplet &&
      !carriedByTie &&
      Math.abs(entryTicks - quarterTicks) < EPSILON
    ) {
      next.endMs = next.startMs + Math.max(20, (next.endMs - next.startMs) * 0.6);
    }

    next.endMs = Math.max(next.startMs + 20, next.endMs);
    return next;
  }

  function applyJazzModeToPlaybackEvents(events, tempoEvents) {
    if (state.jazzMode !== true) return events;
    const playbackCache = new Map();
    return (events || [])
      .map((event) => jazzModeEvent(event, tempoEvents, playbackCache))
      .sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
  }

  function playbackNoteEvents() {
    const tempoEvents = playbackTempoEvents();
    const events = [];
    scoreSystems().forEach((system, systemIndex) => {
      if (systemIsPercussionLine(system)) return;
      withSystemContext(systemIndex, () => {
        const entries = (state.measures || []).flatMap((measure, measureIndex) => (
          (measure.entries || []).map((entry, entryIndex) => ({
            measureIndex,
            entryIndex,
            systemIndex,
            entry,
            absoluteTick: measureStartAbsoluteTick(measureIndex) + (Number(entry.tickStart) || 0)
          }))
        )).sort((a, b) => (
          a.absoluteTick - b.absoluteTick ||
          entryVoice(a.entry) - entryVoice(b.entry) ||
          a.entryIndex - b.entryIndex
        ));
        events.push(...MidiPlayback.noteEventsForEntries({
          entries,
          tempoEvents,
          entryVoice,
          entryBaseTicks,
          entryStaffSteps,
          nearestEntryStaffStep,
          entryStaffStep,
          midiNotesForEntry,
          epsilon: EPSILON
        }));
      });
    });
    return events.sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
  }

  async function midiPlaybackOutput(options = {}) {
    const quiet = options.quiet === true;
    if (!navigator.requestMIDIAccess) {
      if (!quiet) await showEditorMessage("Este navegador no tiene Web MIDI disponible. Usa Chrome o Edge en HTTPS/local para reproducir por MIDI local.");
      return null;
    }
    try {
      if (!state.midiPlayback.access) {
        state.midiPlayback.access = await navigator.requestMIDIAccess({ sysex: false });
      }
    } catch (error) {
      if (!quiet) await showEditorMessage("No se pudo activar MIDI local. Revisa permisos MIDI del navegador.");
      return null;
    }
    const outputs = [...state.midiPlayback.access.outputs.values()];
    const output = outputs.find((candidate) => candidate.state === "connected") || outputs[0] || null;
    if (!output) {
      if (!quiet) await showEditorMessage("No hay ninguna salida MIDI local disponible.");
      return null;
    }
    state.midiPlayback.output = output;
    return output;
  }

  async function auditionMidiNotes(notes, options = {}) {
    if (options.allowLiveAudition !== true) return false;
    const midiNotes = [...new Set((notes || []).map(Number).filter(Number.isFinite))]
      .map((note) => Math.max(0, Math.min(127, Math.round(note))));
    if (!midiNotes.length) return false;
    const output = await midiPlaybackOutput({ quiet: true });
    if (!output || state.midiPlayback.active) return false;
    const durationMs = Math.max(80, Math.min(1200, Number(options.durationMs) || 360));
    const now = performance.now();
    clearPendingMidiInputWrite();
    state.midiPlayback.suppressInputUntil = Math.max(state.midiPlayback.suppressInputUntil || 0, now + durationMs + 900);
    midiNotes.forEach((midi) => {
      output.send([0x90, midi, 78], now);
      output.send([0x80, midi, 0], now + durationMs);
    });
    return true;
  }

  function auditionWrittenEntries(entries, fallbackMeasureIndex = state.cursorMeasure) {
    const notes = [];
    (entries || []).forEach((entry) => {
      if (!entry || entry.type !== "note") return;
      const location = entryLocationById(entry.id);
      notes.push(...midiNotesForEntry(entry, location?.measureIndex ?? fallbackMeasureIndex));
    });
    if (notes.length) auditionMidiNotes(notes);
  }

  function auditionEntryStaffStep(entry, staffStep, fallbackMeasureIndex = state.cursorMeasure) {
    if (!entry || entry.type !== "note") return;
    const location = entryLocationById(entry.id);
    const finalStep = nearestEntryStaffStep(entry, staffStep);
    const notes = midiNotesForEntry(entry, location?.measureIndex ?? fallbackMeasureIndex, [finalStep]);
    if (notes.length) auditionMidiNotes(notes);
  }

  function sendMidiAllNotesOff(output = state.midiPlayback.output) {
    if (!output) return;
    const now = performance.now();
    output.send([0xB0, 123, 0], now);
    output.send([0xB0, 120, 0], now + 1);
  }

  function removePlaybackLine() {
    svg?.querySelector("#playbackLine")?.remove();
  }

  function visualTickAnchorsForMeasure(layout, measureIndex) {
    const cache = Perf.layoutCache(layout, "visualTickAnchors");
    const cacheKey = String(measureIndex);
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const start = layout.starts[measureIndex] ?? staffLeft();
    const width = layout.widths[measureIndex] ?? MEASURE_MIN_WIDTH;
    const ticks = measureTicksForIndex(measureIndex);
    const byTick = new Map();
    const addAnchor = (tick, x, score = 0) => {
      if (!Number.isFinite(tick) || !Number.isFinite(x)) return;
      const safeTick = Math.max(0, Math.min(ticks, Number(tick) || 0));
      const key = String(Math.round(safeTick * 1000) / 1000);
      const current = byTick.get(key);
      if (!current || score > current.score || (score === current.score && x < current.x)) {
        byTick.set(key, { tick: safeTick, x, score });
      }
    };

    addAnchor(0, xForTickWithInternalClefs(start, width, measureIndex, 0, true), -1);
    addAnchor(ticks, xForTickWithInternalClefs(start, width, measureIndex, ticks, true), -1);
    scoreSystems().forEach((system, systemIndex) => {
      const measure = system?.measures?.[measureIndex];
      if (!measure?.entries?.length) return;
      withSystemContext(systemIndex, () => {
        const positions = measureEntryPositions(measure, start, width);
        measure.entries.forEach((entry) => {
          if (entry?.hiddenTupletReserve) return;
          addAnchor(entry.tickStart, positions.get(entry.id), entryAnchorScore(entry, systemIndex));
          addAnchor((Number(entry.tickStart) || 0) + (Number(entry.ticks) || 0), null, -1);
        });
      });
    });
    [...byTick.values()].forEach((anchor) => {
      if (!Number.isFinite(anchor.x)) {
        anchor.x = xForTickWithInternalClefs(start, width, measureIndex, anchor.tick, true);
      }
    });
    const anchors = [...byTick.values()].sort((a, b) => a.tick - b.tick || a.x - b.x);
    anchors.forEach((anchor) => {
      scoreSystems().forEach((_system, systemIndex) => {
        rhythmicColumnIndex.set(systemIndex, measureIndex, anchor.tick, anchor.x);
      });
    });
    cache.set(cacheKey, anchors);
    return anchors;
  }

  function visualXForTick(layout, measureIndex, tick) {
    const start = layout.starts[measureIndex] ?? staffLeft();
    const width = layout.widths[measureIndex] ?? MEASURE_MIN_WIDTH;
    const safeTick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(tick) || 0));
    const indexed = rhythmicColumnIndex.get(0, measureIndex, safeTick);
    if (Number.isFinite(indexed)) return indexed;
    const anchors = visualTickAnchorsForMeasure(layout, measureIndex);
    return RhythmicColumns.xAtTick(
      anchors,
      safeTick,
      () => xForTickWithInternalClefs(start, width, measureIndex, safeTick, true)
    );
  }

  function playbackLineXForTick(absoluteTick, layout = lastRenderedLayout || buildLayout()) {
    const location = measureIndexAndTickFromAbsolute(absoluteTick);
    const measureIndex = Math.max(0, Math.min(layout.starts.length - 1, location.measureIndex));
    const tick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), location.tick));
    return visualXForTick(layout, measureIndex, tick);
  }

  function updatePlaybackLine() {
    if (!state.midiPlayback.active) {
      removePlaybackLine();
      return;
    }
    const elapsedMs = Math.max(0, performance.now() - (state.midiPlayback.startAt || performance.now()));
    const absoluteTick = playbackTickForMs(elapsedMs + (state.midiPlayback.startOffsetMs || 0), state.midiPlayback.tempoEvents);
    const x = playbackLineXForTick(absoluteTick, lastRenderedLayout || buildLayout());
    const y1 = scoreStaffTopY() - 28;
    const y2 = scoreStaffBottomY() + 34;
    let line = svg?.querySelector("#playbackLine");
    if (!line) {
      line = el("line", {
        id: "playbackLine",
        class: "playback-line",
        "pointer-events": "none"
      });
      svg?.appendChild(line);
    }
    line.setAttribute("x1", x);
    line.setAttribute("x2", x);
    line.setAttribute("y1", y1);
    line.setAttribute("y2", y2);
  }

  function startPlaybackLineAnimation() {
    if (state.midiPlayback.animationFrame) cancelAnimationFrame(state.midiPlayback.animationFrame);
    const step = () => {
      updatePlaybackLine();
      if (state.midiPlayback.active) {
        state.midiPlayback.animationFrame = requestAnimationFrame(step);
      }
    };
    state.midiPlayback.animationFrame = requestAnimationFrame(step);
  }

  function stopPlaybackLineAnimation() {
    if (state.midiPlayback.animationFrame) {
      cancelAnimationFrame(state.midiPlayback.animationFrame);
      state.midiPlayback.animationFrame = null;
    }
    removePlaybackLine();
  }

  function clearPlaybackTimers() {
    (state.midiPlayback.scheduledTimers || []).forEach((timer) => clearTimeout(timer));
    state.midiPlayback.scheduledTimers = [];
  }

  function schedulePlaybackMidiMessage(output, message, delayMs) {
    const timer = setTimeout(() => {
      state.midiPlayback.scheduledTimers = (state.midiPlayback.scheduledTimers || [])
        .filter((item) => item !== timer);
      if (!state.midiPlayback.active) return;
      output.send(message);
    }, Math.max(0, Number(delayMs) || 0));
    if (!Array.isArray(state.midiPlayback.scheduledTimers)) state.midiPlayback.scheduledTimers = [];
    state.midiPlayback.scheduledTimers.push(timer);
  }

  function stopMidiPlayback() {
    if (state.midiPlayback.stopTimer) {
      clearTimeout(state.midiPlayback.stopTimer);
      state.midiPlayback.stopTimer = null;
    }
    clearPlaybackTimers();
    sendMidiAllNotesOff();
    state.midiPlayback.scheduledNotes = [];
    state.midiPlayback.active = false;
    state.midiPlayback.suppressInputUntil = performance.now() + 650;
    state.midiPlayback.startAt = 0;
    state.midiPlayback.startOffsetMs = 0;
    state.midiPlayback.durationMs = 0;
    state.midiPlayback.tempoEvents = [];
    stopPlaybackLineAnimation();
    updatePlaybackButton();
  }

  function updatePlaybackButton() {
    if (!playbackButton) return;
    playbackButton.classList.toggle("is-active", state.midiPlayback.active);
    playbackButton.setAttribute("aria-pressed", state.midiPlayback.active ? "true" : "false");
    playbackButton.setAttribute("aria-label", state.midiPlayback.active ? "Detener MIDI local" : "Reproducir MIDI local desde la selección");
    playbackButton.title = state.midiPlayback.active ? "Detener MIDI local" : "Reproducir MIDI local desde la selección";
    MenuRenderer.renderControl(playbackButton, {
      label: state.midiPlayback.active ? "Detener" : "Reproducir",
      shortcut: false
    });
  }

  function playbackSelectedItemAbsoluteTick() {
    const candidates = [
      ...selectedEntryLocations().map(absoluteTickForLocation),
      ...selectedNoteLocations().map(absoluteTickForLocation),
      ...selectedTextItems().map(absoluteTickForTextItem),
      ...selectedMarks().map(markAnchorAbsoluteTick)
    ].filter(Number.isFinite);
    if (Number.isFinite(state.selectedMeasureIndex)) {
      candidates.push(measureStartAbsoluteTick(state.selectedMeasureIndex));
    }
    return candidates.length ? Math.min(...candidates) : null;
  }

  function playbackStartAbsoluteTick(options = {}) {
    if (Number.isFinite(Number(options?.startAbsoluteTick))) return Math.max(0, Number(options.startAbsoluteTick));
    return playbackSelectedItemAbsoluteTick() ?? 0;
  }

  function playbackEventsFromAbsoluteTick(events, startAbsoluteTick, tempoEvents) {
    const startOffsetMs = playbackMsForTick(startAbsoluteTick, tempoEvents);
    const adjustedEvents = events
      .filter((event) => event.endMs > startOffsetMs + EPSILON)
      .map((event) => ({
        ...event,
        startMs: Math.max(0, event.startMs - startOffsetMs),
        endMs: Math.max(20, event.endMs - startOffsetMs)
      }))
      .map((event) => ({
        ...event,
        endMs: Math.max(event.startMs + 20, event.endMs)
      }));
    return { adjustedEvents, startOffsetMs };
  }

  async function toggleMidiPlayback(options = {}) {
    if (state.midiPlayback.active) {
      stopMidiPlayback();
      return;
    }
    const tempoEvents = playbackTempoEvents();
    const events = playbackNoteEvents();
    const startAbsoluteTick = playbackStartAbsoluteTick(options);
    if (!Number.isFinite(startAbsoluteTick)) {
      await showEditorMessage("Selecciona un item para iniciar la reproducción desde ahí.");
      return;
    }
    const playbackEvents = applyJazzModeToPlaybackEvents(events, tempoEvents);
    const { adjustedEvents, startOffsetMs } = playbackEventsFromAbsoluteTick(playbackEvents, startAbsoluteTick, tempoEvents);
    if (!adjustedEvents.length) {
      await showEditorMessage(events.length ? "No hay notas para reproducir desde la selección." : "No hay notas para reproducir.");
      return;
    }
    const output = await midiPlaybackOutput();
    if (!output) return;

    stopMidiPlayback();
    clearPendingMidiInputWrite();
    const startDelayMs = 120;
    const startAt = performance.now() + startDelayMs;
    state.midiPlayback.active = true;
    state.midiPlayback.startAt = startAt;
    state.midiPlayback.startOffsetMs = startOffsetMs;
    state.midiPlayback.tempoEvents = tempoEvents;
    const totalMs = Math.max(...adjustedEvents.map((event) => event.endMs), 0);
    state.midiPlayback.suppressInputUntil = startAt + totalMs + 700;
    state.midiPlayback.scheduledNotes = adjustedEvents;
    state.midiPlayback.durationMs = totalMs;
    schedulePlaybackMidiMessage(output, [0xC0, 0], 0);
    adjustedEvents.forEach((event) => {
      schedulePlaybackMidiMessage(output, [0x90, event.midi, Math.max(1, Math.min(127, Math.round(Number(event.velocity) || 88)))], startDelayMs + event.startMs);
      schedulePlaybackMidiMessage(output, [0x80, event.midi, 0], startDelayMs + event.endMs);
    });
    startPlaybackLineAnimation();
    state.midiPlayback.stopTimer = setTimeout(() => {
      sendMidiAllNotesOff(output);
      state.midiPlayback.active = false;
      state.midiPlayback.suppressInputUntil = performance.now() + 650;
      state.midiPlayback.stopTimer = null;
      clearPlaybackTimers();
      state.midiPlayback.scheduledNotes = [];
      state.midiPlayback.startAt = 0;
      state.midiPlayback.startOffsetMs = 0;
      state.midiPlayback.durationMs = 0;
      state.midiPlayback.tempoEvents = [];
      stopPlaybackLineAnimation();
      updatePlaybackButton();
    }, totalMs + 260);
    updatePlaybackButton();
  }

  function spelledMidiInfo(midiNumber, noteName, fallbackInfo) {
    return MidiChords.spelledMidiInfo(midiNumber, noteName, fallbackInfo, {
      spelledOctave: MidiRecognition.spelledOctave
    });
  }

  function chordAwareMidiInfos(notes, measureIndex = state.cursorMeasure) {
    const ordered = uniqueMidiNotes(notes);
    const fallbackInfos = midiInfosAvoidingStaffCollisions(ordered, measureIndex);
    if (ordered.length < 3) return fallbackInfos;
    const info = midiRecognitionEngine.analyze(ordered);
    const principalMatch = info?.principal_match;
    const rootPc = principalMatch?.root;
    const quality = String(principalMatch?.nombre || "");
    const rootSpelling = MidiRecognition.parseRootSpelling?.(info?.principal || "");
    if (rootPc == null || !rootSpelling?.letter) return fallbackInfos;
    const customSpellings = midiRecognitionEngine.customSpellingForNotes?.(ordered, info) || {};
    return ordered.map((note, index) => {
      const pitchClass = mod12(note);
      const interval = mod12(note - rootPc);
      const noteName = customSpellings[pitchClass] ||
        MidiRecognition.spellNoteForInterval?.(rootSpelling.letter, rootPc, quality, interval);
      return spelledMidiInfo(note, noteName, fallbackInfos[index]);
    });
  }

  function chordSymbolAwareMidiInfos(notes, chordContext = null, measureIndex = state.cursorMeasure) {
    const ordered = uniqueMidiNotes(notes);
    const fallbackInfos = midiInfosAvoidingStaffCollisions(ordered, measureIndex);
    const rootPc = chordContext?.rootPc;
    const quality = String(chordContext?.patternName || chordContext?.suffix || "").trim();
    const rootSpelling = MidiRecognition.parseRootSpelling?.(chordContext?.root || "");
    if (rootPc == null || !quality || !rootSpelling?.letter) return chordAwareMidiInfos(ordered, measureIndex);
    const chordInfo = {
      principal: `${chordContext.root || ""}${quality}`,
      principal_match: {
        root: rootPc,
        nombre: quality
      }
    };
    const contextNotes = uniqueMidiNotes(chordContext?.notes?.length ? chordContext.notes : ordered);
    const customSpellings = midiRecognitionEngine.customSpellingForNotes?.(contextNotes, chordInfo) || {};
    return ordered.map((note, index) => {
      const pitchClass = mod12(note);
      const interval = mod12(note - rootPc);
      const noteName = customSpellings[pitchClass] ||
        MidiRecognition.spellNoteForInterval?.(rootSpelling.letter, rootPc, quality, interval);
      return spelledMidiInfo(note, noteName, fallbackInfos[index]);
    });
  }

  function setEntryPitchInfos(entry, infos, measureIndex = state.cursorMeasure) {
    if (!entry || entry.type !== "note" || !infos?.length) return null;
    const location = entryLocationById(entry.id);
    const absoluteTick = location
      ? measureStartAbsoluteTick(location.measureIndex) + entry.tickStart
      : measureStartAbsoluteTick(measureIndex) + (Number(entry.tickStart) || 0);
    const clefId = clefIdAtAbsoluteTick(absoluteTick);
    const previousSteps = entryStaffSteps(entry);
    const previousColors = entry.noteColors ? { ...entry.noteColors } : null;
    const previousNoteheads = entry.noteheadsByStep ? { ...entry.noteheadsByStep } : null;
    const staffSteps = infos.map((info) => staffStepForDiatonicStep(info.diatonicStep, clefId));
    const stepMap = new Map();
    previousSteps.forEach((step, index) => {
      if (Number.isFinite(staffSteps[index])) stepMap.set(String(step), staffSteps[index]);
    });
    entry.staffStep = staffSteps[0] ?? 0;
    if (staffSteps.length > 1) entry.chordSteps = staffSteps;
    else delete entry.chordSteps;
    entry.diatonicStep = infos[0]?.diatonicStep ?? 0;
    if (infos.length > 1) entry.chordDiatonicSteps = infos.map((info) => info.diatonicStep);
    else delete entry.chordDiatonicSteps;
    delete entry.accidentalsByStep;
    delete entry.accidentalsByDiatonicStep;
    entry.accidental = null;
    if (previousColors) {
      entry.noteColors = {};
      Object.entries(previousColors).forEach(([step, color]) => {
        const nextStep = stepMap.get(String(step));
        if (Number.isFinite(nextStep)) entry.noteColors[String(nextStep)] = color;
      });
      if (!Object.keys(entry.noteColors).length) delete entry.noteColors;
    }
    if (previousNoteheads) {
      entry.noteheadsByStep = {};
      Object.entries(previousNoteheads).forEach(([step, glyphName]) => {
        const nextStep = stepMap.get(String(step));
        if (Number.isFinite(nextStep)) entry.noteheadsByStep[String(nextStep)] = glyphName;
      });
      if (!Object.keys(entry.noteheadsByStep).length) delete entry.noteheadsByStep;
    }
    staffSteps.forEach((staffStep, index) => applyMidiAccidental(entry, staffStep, infos[index], measureIndex));
    return stepMap;
  }

  function respellEntryForChord(entry, measureIndex = state.cursorMeasure) {
    if (!entry || entry.type !== "note" || entryStaffSteps(entry).length < 2) return null;
    const notes = midiNotesForEntry(entry, measureIndex);
    if (notes.length < 3) return null;
    return setEntryPitchInfos(entry, chordAwareMidiInfos(notes, measureIndex), measureIndex);
  }

  function refreshExistingChordSymbolAtTick(measureIndex, tick) {
    const normalizedMeasure = Math.max(0, Math.min(state.measures.length - 1, Number(measureIndex) || 0));
    const normalizedTick = Math.max(0, Math.min(measureTicksForIndex(normalizedMeasure), Number(tick) || 0));
    const item = chordItemAt(normalizedMeasure, normalizedTick);
    if (!item) return null;
    const notes = midiNotesAtCanvasTick(normalizedMeasure, normalizedTick);
    if (notes.length < 2) return null;
    const label = recognizeMidiChordName(notes);
    if (!label) return null;
    item.text = label;
    item.style = { ...(item.style || {}), ...chordTextStyle() };
    return item;
  }

  function refreshExistingChordSymbolForEntry(location) {
    if (!location?.entry) return null;
    return refreshExistingChordSymbolAtTick(location.measureIndex, location.entry.tickStart);
  }

  function normalizeChordSpellingAndSymbol(location) {
    if (!location?.entry || location.entry.type !== "note") return;
    respellEntryForChord(location.entry, location.measureIndex);
    refreshExistingChordSymbolForEntry(location);
  }

  function chordTextStyle() {
    return {
      ...state.textStyle,
      font: appearanceFont("canvasTextFont", "Ink Free"),
      size: Number(state.textStyle?.size) || 24
    };
  }

  function normalizeChordSymbolForGeneration(symbol) {
    return MidiChords.normalizeChordSymbol?.(symbol, midiRecognitionEngine.patterns) || "";
  }

  function upsertChordSymbol(measureIndex, tick, text, options = {}) {
    const value = normalizeChordSymbolForGeneration(text) || String(text || "").trim();
    if (!value) return null;
    const normalizedMeasure = Math.max(0, Math.min(state.measures.length - 1, Number(measureIndex) || 0));
    const normalizedTick = Math.max(0, Math.min(measureTicksForIndex(normalizedMeasure), Number(tick) || 0));
    if (options.save !== false) saveHistory();
    let item = chordItemAt(normalizedMeasure, normalizedTick);
    if (item) {
      item.text = value;
      item.style = { ...(item.style || {}), ...chordTextStyle() };
    } else {
      item = {
        id: createTextId(),
        text: value,
        kind: AnchoredText.KINDS.CHORD,
        measureIndex: normalizedMeasure,
        tick: normalizedTick,
        style: chordTextStyle()
      };
      state.textItems.push(item);
    }
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    return item;
  }

  function recognizeMidiChordName(notes) {
    if ((notes || []).length === 2) {
      return MidiRecognition.liveNoteOrIntervalLabel(notes);
    }
    const info = midiRecognitionEngine.analyze(notes);
    return String(info?.principal || "").trim();
  }

  function upsertChordSymbolForEntry(location, options = {}) {
    if (!location?.entry || location.entry.type !== "note") return null;
    const notes = midiNotesForEntry(location.entry, location.measureIndex);
    if (notes.length < 2) return null;
    const chordName = recognizeMidiChordName(notes);
    if (!chordName) return null;
    return upsertChordSymbol(location.measureIndex, location.entry.tickStart, chordName, options);
  }

  function noteSoundsAtTick(entry, tick) {
    if (!entry || entry.type !== "note" || entry.hiddenTupletReserve) return false;
    const start = Number(entry.tickStart) || 0;
    const end = start + (Number(entry.ticks) || 0);
    return start <= tick + EPSILON && tick < end - EPSILON;
  }

  function uniqueMidiNotes(notes) {
    return MidiChords.uniqueMidiNotes(notes);
  }

  function recognitionTicksForMeasure(measureIndex) {
    const ticks = new Set();
    scoreSystems().forEach((system, systemIndex) => {
      if (systemIsPercussionLine(system)) return;
      withSystemContext(systemIndex, () => {
        const measure = system.measures?.[measureIndex];
        (measure?.entries || []).forEach((entry) => {
          if (entry?.type === "note" && !entry.hiddenTupletReserve) {
            ticks.add(String(Math.max(0, Number(entry.tickStart) || 0)));
          }
        });
      });
    });
    return [...ticks].map(Number).sort((a, b) => a - b);
  }

  function midiNotesAtCanvasTick(measureIndex, tick) {
    const notes = [];
    scoreSystems().forEach((system, systemIndex) => {
      if (systemIsPercussionLine(system)) return;
      withSystemContext(systemIndex, () => {
        const measure = system.measures?.[measureIndex];
        (measure?.entries || []).forEach((entry) => {
          if (noteSoundsAtTick(entry, tick)) {
            notes.push(...midiNotesForEntry(entry, measureIndex));
          }
        });
      });
    });
    return uniqueMidiNotes(notes);
  }

  function canvasHasRecognizableNotes() {
    return scoreSystems().some((system) => {
      if (systemIsPercussionLine(system)) return false;
      return (system.measures || []).some((measure) => (
        (measure.entries || []).some((entry) => entry?.type === "note" && !entry.hiddenTupletReserve)
      ));
    });
  }

  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  function createEditorProgress(title = "Procesando") {
    return Progress.create(title, { host: overlayHost() });
  }

  async function recognizedCanvasChordLabels(progress = null) {
    syncActiveSystemMeasures();
    const systems = scoreSystems();
    const measureCount = Math.max(0, ...systems.map((system) => system.measures?.length || 0));
    const labels = [];
    for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
      progress?.update(measureIndex / Math.max(1, measureCount), `Compás ${measureIndex + 1} de ${measureCount}`);
      recognitionTicksForMeasure(measureIndex).forEach((tick) => {
        const notes = midiNotesAtCanvasTick(measureIndex, tick);
        if (notes.length < 2) return;
        const label = recognizeMidiChordName(notes);
        if (label) labels.push({ measureIndex, tick, label });
      });
      if (measureIndex % 2 === 0) await nextAnimationFrame();
    }
    progress?.update(1, "Escribiendo cifrados...");
    return labels;
  }

  async function recognizeSelectedWrittenChords() {
    syncActiveSystemMeasures();
    if (!canvasHasRecognizableNotes()) {
      await showEditorMessage("No encontré intervalos ni acordes para cifrar en el canvas.");
      return false;
    }
    const progress = createEditorProgress("Reconociendo cifrados");
    try {
      await nextAnimationFrame();
      const labels = await recognizedCanvasChordLabels(progress);
      if (!labels.length) {
        progress.close();
        await showEditorMessage("No encontré intervalos ni acordes para cifrar en el canvas.");
        return false;
      }
      saveHistory();
      labels.forEach(({ measureIndex, tick, label }) => {
        withSystemContext(0, () => {
          upsertChordSymbol(measureIndex, tick, label, { save: false });
        });
      });
      clearEntrySelection();
      clearTextSelection();
      clearMarkSelection();
      progress.close();
      render();
      return true;
    } catch (error) {
      progress.close();
      throw error;
    }
  }

  function parseChordSymbol(symbol) {
    return MidiChords.parseChordSymbol(symbol);
  }

  function normalizeChordSuffix(suffix) {
    return MidiChords.normalizeChordSuffix(suffix);
  }

  function patternForChordSuffix(suffix) {
    return MidiChords.patternForChordSuffix(suffix, midiRecognitionEngine.patterns);
  }

  function midiInRangeForPitchClass(pitchClass, minMidi, maxMidi, target = null) {
    return MidiChords.midiInRangeForPitchClass(pitchClass, minMidi, maxMidi, target);
  }

  function closedUpperVoicingNearC4(pitchClasses) {
    return MidiChords.closedUpperVoicingNearC4(pitchClasses);
  }

  function generationIntervalsForPattern(pattern) {
    return MidiChords.generationIntervalsForPattern(pattern);
  }

  function midiNotesForChordSymbol(symbol) {
    return MidiChords.midiNotesForChordSymbol(symbol, midiRecognitionEngine.patterns);
  }

  function midiNotesForChordSymbolWithTop(symbol, topMidi) {
    return MidiChords.midiNotesForChordSymbolWithTop(symbol, topMidi, midiRecognitionEngine.patterns);
  }

  function midiWriteDurationSpec(options = {}) {
    const explicitTicks = Number(options.durationTicks);
    if (Number.isFinite(explicitTicks) && explicitTicks > EPSILON) {
      const info = durationInfoByTicks(explicitTicks);
      return {
        duration: info?.duration || durationById("whole") || state.activeDuration,
        ticks: explicitTicks,
        dotted: info?.dotted || false,
        dots: info?.dots || 0
      };
    }
    const duration = normalizeTuplet(state.activeTuplet)
      ? (durationById(state.activeTuplet.unitDurationId) || state.activeDuration)
      : state.activeDuration;
    return {
      duration,
      ticks: Number(duration?.ticks) || 0,
      dotted: false,
      dots: 0
    };
  }

  function chordSymbolAnchors() {
    return (state.textItems || [])
      .filter((item) => AnchoredText.isChord(item) && String(item.text || "").trim())
      .map((item) => ({
        item,
        absoluteTick: absoluteTickForTextItem(item)
      }))
      .filter((anchor) => Number.isFinite(anchor.absoluteTick))
      .sort((a, b) => a.absoluteTick - b.absoluteTick || String(a.item.id || "").localeCompare(String(b.item.id || "")));
  }

  function chordSymbolDurationTicks(source) {
    const measureIndex = Math.max(0, Math.min(state.measures.length - 1, Number(source?.measureIndex) || 0));
    const tick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(source?.tick) || 0));
    const startTick = measureStartAbsoluteTick(measureIndex) + tick;
    const nextAnchor = chordSymbolAnchors().find((anchor) => (
      anchor.item?.id !== source?.id &&
      anchor.absoluteTick > startTick + EPSILON
    ));
    const measureEndTick = measureStartAbsoluteTick(measureIndex) + measureTicksForIndex(measureIndex);
    const endTick = nextAnchor?.absoluteTick ?? measureEndTick;
    const durationTicks = endTick - startTick;
    if (durationTicks > EPSILON) return durationTicks;
    return Number(midiWriteDurationSpec().ticks) || Number(state.activeDuration?.ticks) || subdivisionTicks();
  }

  function noteEntryLocationsAtTick(systemIndex, measureIndex, tick) {
    const safeSystem = clampSystemIndex(systemIndex);
    const safeMeasure = Math.max(0, Math.min(scoreSystems()[safeSystem]?.measures?.length - 1 ?? 0, Number(measureIndex) || 0));
    const safeTick = Math.max(0, Number(tick) || 0);
    return allEntryLocations({ systemIndex: safeSystem, type: "note" })
      .filter((location) => (
        location.measureIndex === safeMeasure &&
        Math.abs((Number(location.entry?.tickStart) || 0) - safeTick) < EPSILON
      ))
      .sort((a, b) => a.entryIndex - b.entryIndex);
  }

  function midiForEntryStaffStep(entry, staffStep, measureIndex = state.cursorMeasure) {
    const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
    const accidental = effectiveEntryAccidental(entry, staffStep) ||
      diatonicAccidentalForMeasure(diatonicStep, measureIndex);
    return midiForDiatonicStep(diatonicStep, accidental);
  }

  function writtenTopNoteForChordItem(item, systemIndex = 0) {
    const measureIndex = Math.max(0, Math.min(state.measures.length - 1, Number(item?.measureIndex) || 0));
    const tick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(item?.tick) || 0));
    const candidates = noteEntryLocationsAtTick(systemIndex, measureIndex, tick)
      .flatMap((location) => withSystemContext(systemIndex, () => (
        entryStaffSteps(location.entry).map((staffStep) => ({
          ...location,
          staffStep,
          midi: midiForEntryStaffStep(location.entry, staffStep, measureIndex)
        }))
      )))
      .filter((candidate) => Number.isFinite(candidate.midi));
    if (!candidates.length) return null;
    return candidates.reduce((best, candidate) => (
      candidate.midi > best.midi ? candidate : best
    ), candidates[0]);
  }

  function setExistingEntryToMidiNotes(location, midiNotes, options = {}) {
    if (!location?.entry || location.entry.type !== "note") return false;
    const previousSystemIndex = activeSystemIndex();
    setActiveSystemIndex(location.systemIndex ?? previousSystemIndex);
    const notes = uniqueMidiNotes(midiNotes);
    const infos = options.normalizeChord === false
      ? midiInfosAvoidingStaffCollisions(notes, location.measureIndex)
      : options.chordContext
        ? chordSymbolAwareMidiInfos(notes, options.chordContext, location.measureIndex)
      : chordAwareMidiInfos(notes, location.measureIndex);
    setEntryPitchInfos(location.entry, infos, location.measureIndex);
    state.cursorMeasure = location.measureIndex;
    state.cursorTick = Number(location.entry.tickStart) || 0;
    state.cursorActive = true;
    state.entryCursorActive = false;
    state.cursorEntryId = location.entry.id;
    state.selectedEntryIds = [location.entry.id];
    state.selectedNoteRefs = entryStaffSteps(location.entry).map((staffStep) => ({
      entryId: location.entry.id,
      staffStep
    }));
    const topStep = entryStaffSteps(location.entry).at(-1);
    if (Number.isFinite(topStep)) setActiveNote(location.entry, topStep);
    setActiveSystemIndex(previousSystemIndex);
    return true;
  }

  function writeOrUpdateGeneratedBassAtTick(bassMidi, source, options = {}) {
    const systems = scoreSystems();
    const bassSystemIndex = systems.length > 1 && !systemIsPercussionLine(systems[1]) ? 1 : null;
    if (bassSystemIndex === null) return false;
    const previousSystemIndex = activeSystemIndex();
    const measureIndex = Math.max(0, Math.min(systems[bassSystemIndex].measures.length - 1, Number(source?.measureIndex) || 0));
    const tick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(source?.tick) || 0));
    const existing = noteEntryLocationsAtTick(bassSystemIndex, measureIndex, tick)[0] || null;
    setActiveSystemIndex(bassSystemIndex);
    let changed = false;
    if (existing?.entry) {
      changed = setExistingEntryToMidiNotes(existing, [bassMidi], { chordContext: options.chordContext });
    } else {
      state.cursorMeasure = measureIndex;
      state.cursorTick = tick;
      state.cursorActive = true;
      changed = writeMidiChordAtCursor([bassMidi], {
        save: false,
        forceChord: true,
        normalizeChord: false,
        suppressAudition: true,
        durationTicks: options.durationTicks
      });
      const written = noteEntryLocationsAtTick(bassSystemIndex, measureIndex, tick)[0] || null;
      if (written?.entry) setExistingEntryToMidiNotes(written, [bassMidi], { chordContext: options.chordContext });
    }
    setActiveSystemIndex(previousSystemIndex);
    return changed;
  }

  function applyGeneratedChordFromWrittenTop(item, result) {
    const top = writtenTopNoteForChordItem(item, 0);
    if (!top?.entry || !Number.isFinite(top.midi)) return false;
    const durationTicks = chordSymbolDurationTicks(item);
    const hasBassSystem = scoreSystems().length > 1 && !systemIsPercussionLine(scoreSystems()[1]);
    const upperNotes = hasBassSystem ? result.upper : result.notes;
    const changedUpper = setExistingEntryToMidiNotes(top, upperNotes, { chordContext: result });
    const changedBass = hasBassSystem
      ? writeOrUpdateGeneratedBassAtTick(result.bass, item, { durationTicks, chordContext: result })
      : false;
    return changedUpper || changedBass;
  }

  function generatedChordSystemGroups(midiNotes) {
    const notes = [...new Set((midiNotes || []).map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
    const systems = scoreSystems();
    if (notes.length < 2 || systems.length < 2 || systemIsPercussionLine(systems[0]) || systemIsPercussionLine(systems[1])) {
      return [{ systemIndex: activeSystemIndex(), notes }];
    }
    const trebleSystemIndex = 0;
    const bassSystemIndex = 1;
    const bassCutoffMidi = 55; // G3: lower generated chord tones belong naturally to the F clef staff.
    let bassNotes = notes.filter((note) => note < bassCutoffMidi);
    let trebleNotes = notes.filter((note) => note >= bassCutoffMidi);
    if (!bassNotes.length && notes.length > 1) {
      bassNotes = [notes[0]];
      trebleNotes = notes.slice(1);
    }
    if (!trebleNotes.length && notes.length > 1) {
      trebleNotes = [bassNotes.pop()];
    }
    return [
      bassNotes.length ? { systemIndex: bassSystemIndex, notes: bassNotes } : null,
      trebleNotes.length ? { systemIndex: trebleSystemIndex, notes: trebleNotes } : null
    ].filter(Boolean);
  }

  function writeGeneratedChordAtCursor(midiNotes, options = {}) {
    const notes = [...new Set((midiNotes || []).map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
    if (!notes.length) return false;
    const groups = generatedChordSystemGroups(notes);
    if (groups.length <= 1) return writeMidiChordAtCursor(notes, { ...options, preserveSelection: true });
    const previousSystemIndex = activeSystemIndex();
    const writeMeasure = Math.max(0, Math.min(state.measures.length - 1, Number(state.cursorMeasure) || 0));
    const writeTick = Math.max(0, Math.min(measureTicksForIndex(writeMeasure), Number(state.cursorTick) || 0));
    const duration = midiWriteDurationSpec(options);
    const selectedEntryIds = [];
    const selectedNoteRefs = [];
    let changed = false;
    groups.forEach(({ systemIndex, notes: groupNotes }) => {
      setActiveSystemIndex(systemIndex);
      state.cursorMeasure = writeMeasure;
      state.cursorTick = writeTick;
      state.cursorActive = true;
      if (!writeMidiChordAtCursor(groupNotes, {
        ...options,
        forceChord: true,
        save: false,
        preserveSelection: true,
        suppressAudition: true
      })) return;
      changed = true;
      selectedEntryLocations().forEach((location) => {
        if (!selectedEntryIds.includes(location.entry.id)) selectedEntryIds.push(location.entry.id);
      });
      selectedNoteLocations().forEach((location) => {
        selectedNoteRefs.push({ entryId: location.entry.id, staffStep: location.staffStep });
      });
    });
    const finalSystemIndex = groups.find((group) => group.systemIndex === 0)?.systemIndex ?? previousSystemIndex;
    setActiveSystemIndex(finalSystemIndex);
    setCursorFromAbsoluteTick(measureStartAbsoluteTick(writeMeasure) + writeTick + (Number(duration?.ticks) || 0));
    state.selectedEntryIds = selectedEntryIds;
    state.selectedNoteRefs = selectedNoteRefs;
    state.cursorEntryId = selectedEntryIds.find((entryId) => !!entryLocationById(entryId)) ||
      selectedNoteRefs.find((ref) => !!entryLocationById(ref.entryId))?.entryId ||
      null;
    if (selectedNoteRefs.length) {
      const activeRef = selectedNoteRefs.find((ref) => !!entryLocationById(ref.entryId)) || selectedNoteRefs[0];
      const activeLocation = entryLocationById(activeRef.entryId);
      if (activeLocation?.entry) {
        state.cursorStaffStep = activeRef.staffStep;
        setActiveNote(activeLocation.entry, activeRef.staffStep);
      }
    }
    state.cursorActive = true;
    state.entryCursorActive = false;
    if (!changed) setActiveSystemIndex(previousSystemIndex);
    render();
    return changed;
  }

  function setPendingMidiInput(notes) {
    const ordered = uniqueMidiNotes(notes);
    if (!ordered.length) return false;
    if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
    const infos = ordered.length >= 3
      ? chordAwareMidiInfos(ordered, state.cursorMeasure)
      : midiInfosAvoidingStaffCollisions(ordered, state.cursorMeasure);
    const previewInfo = infos.at(-1) || midiNoteInfo(ordered.at(-1), state.cursorMeasure);
    state.pendingMidiNotes = ordered;
    state.pendingInputPitch = previewInfo || null;
    if (previewInfo) state.cursorStaffStep = midiStaffStep(previewInfo);
    state.cursorActive = true;
    state.entryCursorActive = false;
    showCursorPitchAtCursor();
    syncInputSession();
    render();
    return true;
  }

  function commitPendingPitchInput() {
    if (!state.pitchBeforeDurationMode || !cursorPitchReadyToWrite()) return false;
    const midiNotes = uniqueMidiNotes(state.pendingMidiNotes || []);
    if (midiNotes.length > 1) {
      return writeMidiChordAtCursor(midiNotes, {
        commitPending: true,
        forceChord: true,
        suppressAudition: true
      });
    }
    if (midiNotes.length === 1) {
      return writeMidiNote(midiNotes[0], {
        commitPending: true,
        suppressAudition: true
      });
    }
    return insertEntry(state.cursorStaffStep, {
      diatonicStep: state.pendingInputPitch?.diatonicStep,
      midiInfo: state.pendingInputPitch || null,
      suppressAudition: true
    });
  }

  function writeMidiChordAtCursor(midiNotes, options = {}) {
    const notes = [...new Set((midiNotes || []).map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
    if (!notes.length) return false;
    if (state.pitchBeforeDurationMode && options.commitPending !== true) return setPendingMidiInput(notes);
    if (state.lockDurationMode && isNoteInputMode() && notes.length > 1 && repitchLockedMidiChord(notes)) return true;
    if (notes.length === 1 && options.forceChord !== true) return writeMidiNote(notes[0], options);
    if (activeSystemIsPercussionLine()) return false;
    if (!state.cursorActive) enterFigureWritingMode();
    ensureMeasure(state.cursorMeasure);
    if (options.save !== false) saveHistory();
    const writeMeasure = Math.max(0, Math.min(state.measures.length - 1, Number(state.cursorMeasure) || 0));
    const writeTick = Math.max(0, Math.min(measureTicksForIndex(writeMeasure), Number(state.cursorTick) || 0));
    const preferredInfos = options.normalizeChord !== false && notes.length >= 3
      ? chordAwareMidiInfos(notes, writeMeasure)
      : null;
    const infos = midiInfosAvoidingStaffCollisions(notes, writeMeasure, preferredInfos);
    const staffSteps = infos.map((info) => staffStepForDiatonicStep(info.diatonicStep, clefIdAtAbsoluteTick(measureStartAbsoluteTick(writeMeasure) + writeTick)));
    const duration = midiWriteDurationSpec(options);
    const entry = makeEntry("note", duration.duration, staffSteps[0], null);
    entry.ticks = duration.ticks;
    entry.dotted = duration.dotted;
    entry.dots = duration.dots;
    setEntryVoice(entry, activeVoice());
    setEntryStaffSteps(entry, staffSteps);
    entry.diatonicStep = infos[0]?.diatonicStep ?? entry.diatonicStep;
    entry.chordDiatonicSteps = infos.map((info) => info.diatonicStep);
    const previousMode = state.mode;
    state.mode = "note";
    const writtenEntries = writeEntryAcrossMeasures(writeMeasure, writeTick, entry);
    state.mode = previousMode;
    if (!writtenEntries.length) return false;
    writtenEntries.forEach((written) => {
      infos.forEach((info, index) => {
        const step = entryStaffSteps(written)[index] ?? staffSteps[index];
        applyMidiAccidental(written, step, info, writeMeasure);
      });
    });
    if (options.normalizeChord !== false) {
      writtenEntries.forEach((written) => {
        const location = entryLocationById(written.id);
        if (!location) return;
        if (options.refreshChordSymbol === false) respellEntryForChord(location.entry, location.measureIndex);
        else normalizeChordSpellingAndSymbol(location);
      });
    }
    const firstLocation = entryLocationById(writtenEntries[0].id);
    const lastEntry = writtenEntries.at(-1) || entry;
    const writeAbsoluteTick = measureStartAbsoluteTick(writeMeasure) + writeTick;
    setCursorFromAbsoluteTick(state.noteChordMode
      ? writeAbsoluteTick
      : nextWritingGridAbsoluteTickAfterEntry(writeAbsoluteTick, lastEntry, activeVoice()));
    if (firstLocation) {
      if (options.preserveSelection === true || !isNoteInputMode()) {
        state.selectedEntryIds = [firstLocation.entry.id];
        state.selectedNoteRefs = entryStaffSteps(firstLocation.entry).map((staffStep) => ({
          entryId: firstLocation.entry.id,
          staffStep
        }));
        state.cursorEntryId = firstLocation.entry.id;
      } else {
        state.selectedEntryIds = [];
        state.selectedNoteRefs = [];
        state.cursorEntryId = null;
      }
    }
    carryCursorPitchAfterWrittenNote(lastEntry, entryStaffSteps(lastEntry)[0]);
    if (!options.suppressAudition) auditionMidiNotes(notes);
    render();
    return true;
  }

  function writeMidiChordWithOptionalSymbol(notes, options = {}) {
    const startMeasure = state.cursorMeasure;
    const startTick = state.cursorTick;
    const chordName = notes.length >= 2 ? recognizeMidiChordName(notes) : "";
    const ok = writeMidiChordAtCursor(notes, {
      ...options,
      normalizeChord: options.normalizeChord ?? Boolean(chordName)
    });
    if (!ok) return false;
    if (options.withChordSymbol) {
      if (chordName) upsertChordSymbol(startMeasure, startTick, chordName, { save: false });
      render();
    }
    return true;
  }

  async function generateNotesFromChordSymbols() {
    const selected = selectedTextItems().filter((item) => AnchoredText.isChord(item));
    let items = selected;
    if (!items.length) {
      const value = await requestEditorPopup({
        title: "Generar acorde desde cifrado",
        placeholder: "C7, Bb∆, F#m7...",
        help: "Bajo entre C2 y C3; voces superiores cerradas cerca de C4."
      });
      if (!value) return false;
      items = [{ text: value, measureIndex: state.cursorMeasure, tick: state.cursorTick }];
    }
    saveHistory();
    let changed = false;
    items.forEach((item) => {
      const normalizedSymbol = normalizeChordSymbolForGeneration(item.text);
      if (normalizedSymbol && item.text !== normalizedSymbol) item.text = normalizedSymbol;
      const notes = midiNotesForChordSymbol(normalizedSymbol || item.text);
      if (!notes?.length) return;
      state.cursorMeasure = Math.max(0, Math.min(state.measures.length - 1, Number(item.measureIndex) || 0));
      state.cursorTick = Math.max(0, Math.min(measureTicksForIndex(state.cursorMeasure), Number(item.tick) || 0));
      state.cursorActive = true;
      if (writeGeneratedChordAtCursor(notes, {
        save: false,
        forceChord: true,
        refreshChordSymbol: false,
        durationTicks: chordSymbolDurationTicks(item)
      })) changed = true;
    });
    if (!changed) {
      state.history.pop();
      await showEditorMessage("No pude generar notas con ese cifrado.");
      return false;
    }
    render();
    return true;
  }

  async function generateNotesFromChordSymbolsUsingWrittenTop() {
    const selected = selectedTextItems().filter((item) => AnchoredText.isChord(item));
    let items = selected;
    if (!items.length) {
      const value = await requestEditorPopup({
        title: "Generar acorde con nota superior",
        placeholder: "C7, Bb∆, F#m7...",
        help: "Usa la nota ya escrita en el pulso como voz superior; agrega bajo grave si hay sistema de bajo."
      });
      if (!value) return false;
      items = [{ text: value, measureIndex: state.cursorMeasure, tick: state.cursorTick }];
    }
    saveHistory();
    let changed = false;
    let missingTopCount = 0;
    let invalidTopCount = 0;
    items.forEach((item) => {
      const normalizedSymbol = normalizeChordSymbolForGeneration(item.text);
      if (normalizedSymbol && item.text !== normalizedSymbol) item.text = normalizedSymbol;
      const top = writtenTopNoteForChordItem(item, 0);
      if (!top?.entry || !Number.isFinite(top.midi)) {
        missingTopCount += 1;
        return;
      }
      const result = midiNotesForChordSymbolWithTop(normalizedSymbol || item.text, top.midi);
      if (!result?.upper?.length) {
        invalidTopCount += 1;
        return;
      }
      if (applyGeneratedChordFromWrittenTop(item, result)) changed = true;
    });
    if (!changed) {
      state.history.pop();
      const reason = missingTopCount
        ? "No encontré una nota escrita en el mismo pulso del cifrado."
        : invalidTopCount
          ? "La nota escrita no pertenece al cifrado seleccionado."
          : "No pude generar acordes con esos cifrados.";
      await showEditorMessage(reason);
      return false;
    }
    if (missingTopCount || invalidTopCount) {
      await showEditorMessage(`Generé los acordes posibles. Omitidos: ${missingTopCount + invalidTopCount}.`);
    }
    render();
    return true;
  }

  let midiNoteCapture = null;
  let midiAutoWriteTimer = null;
  const midiInputNoteBuffer = new Set();
  let midiKeyboardFlashNotes = [];
  let midiKeyboardFlashLabels = {};
  let midiKeyboardFlashUntil = 0;
  let midiKeyboardFlashTimer = null;
  let midiKeyboardSelectionNotes = [];
  let midiKeyboardSelectionLabels = {};

  async function ensureMidiNoteCapture() {
    if (!midiNoteCapture) {
      midiNoteCapture = MidiCapture.createCapture({ captureWindowMs: 520 });
      midiNoteCapture.addEventListener("portschange", () => connectAllMidiInputs());
      midiNoteCapture.addEventListener("change", (event) => {
        if (!event.detail?.newNoteOn) return;
        if (midiInputSuppressedForPlayback()) {
          clearPendingMidiInputWrite();
          return;
        }
        captureMidiInputNotes(event.detail);
      });
    }
    if (!midiNoteCapture.access) await midiNoteCapture.requestAccess();
    if (!midiNoteCapture.connectedInputs.size) {
      const inputs = connectAllMidiInputs();
      if (!inputs.length) throw new Error("No encontré entradas MIDI conectadas.");
    }
    return midiNoteCapture;
  }

  function connectAllMidiInputs() {
    if (!midiNoteCapture?.access) return [];
    return midiNoteCapture.connect(MidiCapture.ALL_INPUTS_VALUE);
  }

  async function initializeDefaultMidiInput() {
    try {
      await ensureMidiNoteCapture();
      state.midiCaptureStatus = "MIDI activo";
      updateMidiControls();
      return true;
    } catch (error) {
      state.midiCaptureStatus = error?.message || "MIDI no disponible";
      updateMidiControls();
      return false;
    }
  }

  async function midiLearnWriteNotes() {
    return initializeDefaultMidiInput();
  }

  function midiInputSuppressedForPlayback() {
    return state.midiPlayback.active === true ||
      performance.now() < (Number(state.midiPlayback.suppressInputUntil) || 0);
  }

  function clearPendingMidiInputWrite() {
    if (midiAutoWriteTimer) {
      clearTimeout(midiAutoWriteTimer);
      midiAutoWriteTimer = null;
    }
    midiInputNoteBuffer.clear();
    midiNoteCapture?.clear?.();
  }

  function captureMidiInputNotes(detail = {}) {
    if (midiInputSuppressedForPlayback()) return;
    const messageNote = Number(detail.message?.note);
    if (Number.isFinite(messageNote)) midiInputNoteBuffer.add(messageNote);
    (detail.notes || []).forEach((note) => {
      if (Number.isFinite(Number(note))) midiInputNoteBuffer.add(Number(note));
    });
    flashMidiKeyboardNotes([...midiInputNoteBuffer], "midi", 900);
    scheduleMidiAutoWrite();
  }

  function scheduleMidiAutoWrite() {
    if (midiInputSuppressedForPlayback()) {
      clearPendingMidiInputWrite();
      return;
    }
    if (midiAutoWriteTimer) clearTimeout(midiAutoWriteTimer);
    midiAutoWriteTimer = setTimeout(() => {
      midiAutoWriteTimer = null;
      if (midiInputSuppressedForPlayback()) {
        midiInputNoteBuffer.clear();
        return;
      }
      const notes = [...midiInputNoteBuffer].sort((a, b) => a - b);
      midiInputNoteBuffer.clear();
      if (!notes.length) return;
      flashMidiKeyboardNotes(notes, "midi", 900);
      writeMidiChordWithOptionalSymbol(notes, {
        withChordSymbol: state.midiAutoChordMode === true && notes.length >= 2,
        suppressAudition: true
      });
    }, 260);
  }

  async function toggleMidiAutoChordMode() {
    if (state.midiAutoChordMode) {
      state.midiAutoChordMode = false;
      if (midiAutoWriteTimer) {
        clearTimeout(midiAutoWriteTimer);
        midiAutoWriteTimer = null;
      }
      updateMidiControls();
      return true;
    }
    try {
      await ensureMidiNoteCapture();
      state.midiAutoChordMode = true;
      updateMidiControls();
      await showEditorMessage("AutoCif. activo: toca acordes en tu teclado MIDI para escribir notas y cifrado.");
      return true;
    } catch (error) {
      state.midiAutoChordMode = false;
      updateMidiControls();
      await showEditorMessage(error?.message || "No pude activar la entrada MIDI.");
      return false;
    }
  }

  function midiChordTargetLocation() {
    const active = findActiveNoteTarget();
    const activeLocation = active?.entry ? entryLocationById(active.entry.id) : null;
    if (activeLocation?.entry?.type === "note") return activeLocation;
    const cursorLocation = noteEntryLocationAtCursor(activeVoice());
    if (cursorLocation?.entry) return cursorLocation;
    const selected = selectedEntryLocation();
    if (selected?.entry?.type === "note") return selected;
    return null;
  }

  function addMidiPitchToExistingFigure(info, staffStep, options = {}) {
    const location = midiChordTargetLocation();
    if (!location?.entry || location.entry.type === "rest") return false;
    const entry = location.entry;
    const steps = entryStaffSteps(entry);
    const alreadyExists = steps.some((step) => Math.abs(step - staffStep) < EPSILON);
    saveHistory();
    if (!alreadyExists) setEntryStaffSteps(entry, [...steps, staffStep]);
    applyMidiAccidental(entry, staffStep, info, location.measureIndex);
    normalizeChordSpellingAndSymbol(location);
    const selectedStaffStep = nearestEntryStaffStep(entry, staffStep);
    state.cursorMeasure = location.measureIndex;
    state.cursorTick = entry.tickStart;
    state.cursorEntryId = isNoteInputMode() ? null : entry.id;
    state.selectedEntryIds = [];
    state.selectedNoteRefs = isNoteInputMode()
      ? []
      : [{ entryId: entry.id, staffStep: selectedStaffStep }];
    state.cursorStaffStep = selectedStaffStep;
    state.cursorActive = true;
    state.entryCursorActive = false;
    setActiveNote(entry, selectedStaffStep);
    showCursorPitchAtCursor();
    if (state.midiAutoChordMode) upsertChordSymbolForEntry(location, { save: false });
    if (!options.suppressAudition) auditionMidiNotes(midiNotesForEntry(entry, location.measureIndex));
    render();
    return true;
  }

  function writeMidiNote(midiNumber, options = {}) {
    const info = midiNoteInfo(midiNumber, state.cursorMeasure);
    const staffStep = midiStaffStep(info);
    state.cursorStaffStep = staffStep;
    if (state.pitchBeforeDurationMode && options.commitPending !== true) return setPendingMidiInput([midiNumber]);
    if (repitchLockedDuration(info.diatonicStep, { midiInfo: info })) return true;
    if ((state.midiChordMode || state.noteChordMode) && addMidiPitchToExistingFigure(info, staffStep, options)) return true;
    setMode("note");
    if (!state.cursorActive) enterFigureWritingMode();
    const startMeasure = state.cursorMeasure;
    const startTick = state.cursorTick;
    const inserted = insertEntry(staffStep, {
      diatonicStep: info.diatonicStep,
      suppressAudition: true
    });
    if (!inserted) return false;
    const active = findActiveNoteTarget();
    const location = active?.entry ? entryLocationById(active.entry.id) : null;
    if (location?.entry) {
      applyMidiAccidental(location.entry, staffStep, info, location.measureIndex);
      if (state.midiChordMode || state.noteChordMode) {
        state.cursorMeasure = location.measureIndex;
        state.cursorTick = location.entry.tickStart;
        state.cursorEntryId = location.entry.id;
        state.selectedNoteRefs = [{ entryId: location.entry.id, staffStep }];
        showCursorPitchAtCursor();
      } else {
        state.cursorMeasure = Math.max(0, state.cursorMeasure);
      }
      render();
    } else if (state.midiChordMode || state.noteChordMode) {
      state.cursorMeasure = startMeasure;
      state.cursorTick = startTick;
      render();
    }
    if (!options.suppressAudition) auditionMidiNotes([midiNumber]);
    return true;
  }

  function midiKeyboardLabelsForNotes(notes) {
    return MidiKeyboard.labelsForNotes(notes, {
      engine: midiRecognitionEngine,
      recognition: MidiRecognition,
      uniqueNotes: uniqueMidiNotes
    });
  }

  function applyMidiKeyboardHighlights() {
    if (!midiKeyboard) return;
    const flashActive = Date.now() < midiKeyboardFlashUntil && midiKeyboardFlashNotes.length;
    const notes = flashActive ? midiKeyboardFlashNotes : midiKeyboardSelectionNotes;
    const labels = flashActive ? midiKeyboardFlashLabels : midiKeyboardSelectionLabels;
    const source = flashActive ? "played" : "selection";
    MidiKeyboard.applyHighlights(midiKeyboard, {
      notes,
      labels,
      source,
      uniqueNotes: uniqueMidiNotes,
      enclosureForKey: (prefix) => appearanceString(`${prefix}Enclosure`, "pill")
    });
  }

  function flashMidiKeyboardNotes(notes, source = "played", durationMs = 900) {
    const ordered = uniqueMidiNotes(notes);
    if (!ordered.length) return;
    midiKeyboardFlashNotes = ordered;
    midiKeyboardFlashLabels = midiKeyboardLabelsForNotes(ordered);
    midiKeyboardFlashUntil = Date.now() + Math.max(120, Number(durationMs) || 900);
    if (midiKeyboardFlashTimer) clearTimeout(midiKeyboardFlashTimer);
    midiKeyboardFlashTimer = setTimeout(() => {
      midiKeyboardFlashTimer = null;
      midiKeyboardFlashNotes = [];
      midiKeyboardFlashLabels = {};
      midiKeyboardFlashUntil = 0;
      applyMidiKeyboardHighlights();
    }, Math.max(120, Number(durationMs) || 900));
    applyMidiKeyboardHighlights();
  }

  function selectedMidiKeyboardNotes() {
    const notes = [];
    const noteLocations = selectedNoteLocations();
    const noteEntryIds = new Set(noteLocations.map((location) => location.entry.id));
    noteLocations.forEach((location) => {
      notes.push(...midiNotesForEntry(location.entry, location.measureIndex, [location.staffStep]));
    });
    selectedEntryLocations().forEach((location) => {
      if (!location?.entry || location.entry.type !== "note") return;
      const explicitlySelected = state.selectedEntryIds.includes(location.entry.id);
      if (!explicitlySelected && noteEntryIds.has(location.entry.id)) return;
      notes.push(...midiNotesForEntry(location.entry, location.measureIndex));
    });
    return uniqueMidiNotes(notes);
  }

  function refreshMidiKeyboardSelectionHighlights() {
    midiKeyboardSelectionNotes = selectedMidiKeyboardNotes();
    midiKeyboardSelectionLabels = midiKeyboardLabelsForNotes(midiKeyboardSelectionNotes);
    applyMidiKeyboardHighlights();
  }

  const MIDI_KEYBOARD_FIRST_NOTE = MidiKeyboard.FIRST_NOTE;
  const MIDI_KEYBOARD_LAST_NOTE = MidiKeyboard.LAST_NOTE;

  function ensureMidiKeyboardStructure() {
    return MidiKeyboard.ensureStructure(midiKeyboard, {
      firstNote: MIDI_KEYBOARD_FIRST_NOTE,
      lastNote: MIDI_KEYBOARD_LAST_NOTE,
      noteInfo: (midiNumber) => midiNoteInfo(midiNumber, state.cursorMeasure),
      onKeyClick: (midiNumber) => {
        flashMidiKeyboardNotes([midiNumber], "mouse", 900);
        writeMidiNote(midiNumber);
      }
    });
  }

  function updateMidiKeyboardGeometry() {
    MidiKeyboard.updateGeometry(midiKeyboard, {
      firstNote: MIDI_KEYBOARD_FIRST_NOTE,
      lastNote: MIDI_KEYBOARD_LAST_NOTE,
      noteInfo: (midiNumber) => midiNoteInfo(midiNumber, state.cursorMeasure),
      onKeyClick: (midiNumber) => {
        flashMidiKeyboardNotes([midiNumber], "mouse", 900);
        writeMidiNote(midiNumber);
      },
      whiteKeyWidth: appearanceValue("midiWhiteKeyWidth"),
      blackKeyWidth: appearanceValue("midiBlackKeyWidth")
    });
  }

  function renderMidiKeyboard() {
    if (!midiKeyboard) return;
    updateMidiKeyboardGeometry();
    refreshMidiKeyboardSelectionHighlights();
  }

  function toggleMidiChordMode() {
    state.midiChordMode = !state.midiChordMode;
    updateMidiControls();
  }

  const instantTooltip = Tooltips.createInstantTooltipController({
    selector: ".editor-workbench button, .editor-workbench label, .editor-workbench select, .midi-key",
    className: "instant-tooltip"
  });

  function tooltipTargetFromEvent(event) {
    return instantTooltip.targetFromEvent(event);
  }

  function tooltipTextForElement(element) {
    return instantTooltip.textForElement(element);
  }

  function positionInstantTooltip(event) {
    instantTooltip.position(event);
  }

  function showInstantTooltip(event) {
    instantTooltip.show(event);
  }

  function hideInstantTooltip() {
    instantTooltip.hide();
  }

  function setupInstantTooltips() {
    const scope = document.querySelector(".editor-workbench");
    instantTooltip.setup(scope);
  }

  function selectFigureDuration(duration) {
    if (!duration) return;
    setMode("note");
    chooseDuration(duration, {
      keepTuplet: Writing.keepTupletForDuration(normalizeTuplet(state.activeTuplet), duration)
    });
    const selection = selectedEntryLocation();
    if (state.displacementMode && selection?.entry) return insertDisplacementFigureAtSelection(duration);
    if (changeSelectedNoteDurations(duration)) return;
    if (selection?.entry?.type === "rest" && cursorPitchReadyToWrite()) return replaceSelectedRestWithNoteDuration(duration);
    if (selection?.entry?.type === "rest") return replaceSelectedEntryWithRestDuration(duration);
    if (selection?.entry?.type === "note") return replaceSelectedEntryDuration(duration);
    if (commitPendingPitchInput()) return;
    if (cursorPitchReadyToWrite()) insertEntry(state.cursorStaffStep);
    else render();
  }

  function selectRestDuration(item) {
    const duration = durationById(item?.restDurationId);
    if (!duration) return;
    setMode("rest");
    chooseDuration(duration, {
      keepTuplet: Writing.keepTupletForDuration(normalizeTuplet(state.activeTuplet), duration)
    });
    if (!state.cursorActive) enterFigureWritingMode();
    const selection = selectedEntryLocation();
    if (selection?.entry) {
      replaceSelectedEntryWithRestDuration(duration);
    } else {
      insertEntry(0, { explicitRest: true });
    }
  }

  function parseTupletRatio(value) {
    const match = String(value || "").trim().match(/^(\d+)\s*:\s*(\d+)$/);
    if (!match) return null;
    const actual = Number(match[1]);
    const normal = Number(match[2]);
    if (!Number.isInteger(actual) || !Number.isInteger(normal) || actual <= 0 || normal <= 0) return null;
    return { actual, normal };
  }

  async function requestCustomTuplet() {
    const value = await requestEditorPopup({
      title: "Tuplet irregular x:y",
      initialValue: "7:6",
      help: "La siguiente figura que elijas define la unidad del tuplet."
    });
    if (value === null) return;
    const ratio = parseTupletRatio(value);
    if (!ratio) {
      await showEditorMessage("Escribe dos valores positivos con el formato x:y, por ejemplo 7:6.");
      return;
    }
    state.pendingTupletRatio = ratio;
    deactivateTupletWriting();
    updateModeButtons();
    render();
  }

  function applyTupletToSelection(tuplet) {
    const normalized = normalizeTuplet(tuplet);
    const selection = selectedEntryLocation();
    if (!normalized || !selection?.entry) return false;

    const measure = state.measures[selection.measureIndex];
    const entries = measure?.entries || [];
    const groupEntries = entries.slice(selection.entryIndex, selection.entryIndex + normalized.actual);
    if (groupEntries.length < normalized.actual || groupEntries.some((entry) => isMeasureRestEntry(entry))) {
      return false;
    }

    saveHistory();
    const groupId = createTupletGroupId();
    groupEntries.forEach((entry, index) => {
      applyTupletMetadata(entry, normalized, index, groupId);
    });
    state.selectedEntryIds = groupEntries.map((entry) => entry.id);
    state.cursorEntryId = groupEntries[0]?.id || null;
    state.cursorMeasure = selection.measureIndex;
    state.cursorTick = groupEntries.at(-1).tickStart + groupEntries.at(-1).ticks;
    state.cursorActive = true;
    state.entryCursorActive = false;
    if (groupEntries[0]?.type === "note") {
      setActiveNote(groupEntries[0], entryStaffStep(groupEntries[0]));
      state.cursorStaffStep = entryStaffStep(groupEntries[0]);
    } else {
      clearActiveNote();
      hideCursorPitch();
    }
    render();
    return true;
  }

  function activateTuplet(tuplet) {
    const normalized = normalizeTuplet(tuplet);
    if (!normalized) return;
    state.pendingTupletRatio = null;
    const selection = selectedEntryLocation();
    const isSingleExplicitEntrySelection = !!selection?.entry && state.selectedEntryIds.length <= 1;
    if (isSingleExplicitEntrySelection && applyTupletToSelection(normalized)) {
      state.activeTuplet = normalized;
      state.activeTupletRun = null;
      updateModeButtons();
      return;
    }
    clearEntrySelection();
    if (sameTupletConfig(state.activeTuplet, normalized)) deactivateTupletWriting();
    else {
      state.activeTuplet = normalized;
      state.activeTupletRun = state.cursorActive ? startTupletRun(normalized, cursorAbsoluteTick()) : null;
      const unit = durationById(normalized.unitDurationId);
      if (unit) state.activeDuration = unit;
    }
    updateModeButtons();
    render();
  }

  function createMarkId() {
    return Marks.createId();
  }

  function currentMarkAnchor() {
    const selection = selectedEntryLocation();
    if (selection?.entry) {
      return {
        measureIndex: selection.measureIndex,
        tick: selection.entry.tickStart,
        staffStep: Number.isFinite(state.activeNoteStaffStep)
          ? nearestEntryStaffStep(selection.entry, state.activeNoteStaffStep)
          : entryStaffStep(selection.entry),
        entryId: selection.entry.id
      };
    }
    return {
      measureIndex: state.cursorMeasure,
      tick: state.cursorTick,
      staffStep: state.cursorStaffStep,
      entryId: null
    };
  }

  function currentArticulationAnchor() {
    const selection = selectedEntryLocation();
    if (!selection?.entry || selection.entry.type !== "note") return null;
    return {
      measureIndex: selection.measureIndex,
      tick: selection.entry.tickStart,
      staffStep: Number.isFinite(state.activeNoteStaffStep)
        ? nearestEntryStaffStep(selection.entry, state.activeNoteStaffStep)
        : entryStaffStep(selection.entry),
      entryId: selection.entry.id
    };
  }

  function isArticulationPaletteItem(item) {
    return ["accent", "fermata", "glyph"].includes(item?.markType);
  }

  function isHairpinType(type) {
    return type === "crescendo" || type === "diminuendo";
  }

  function hairpinMarksAtAnchor(anchor, systemIndex = activeSystemIndex()) {
    return state.marks.filter((mark) => (
      isHairpinType(mark?.type) &&
      markSystemIndex(mark) === systemIndex &&
      sameScoreAnchor(mark, anchor)
    ));
  }

  function upsertHairpinAtCurrentAnchor(type) {
    const nextType = type === "diminuendo" ? "diminuendo" : "crescendo";
    const selectedHairpins = selectedMarks().filter((mark) => isHairpinType(mark?.type));
    if (selectedHairpins.length) {
      const changed = selectedHairpins.some((mark) => mark.type !== nextType);
      if (changed) saveHistory();
      selectedHairpins.forEach((mark) => { mark.type = nextType; });
      state.selectedMarkIds = selectedHairpins.map((mark) => mark.id);
      render();
      return selectedHairpins[0]?.id || null;
    }

    const anchor = currentMarkAnchor();
    const systemIndex = activeSystemIndex();
    const anchoredHairpins = hairpinMarksAtAnchor(anchor, systemIndex);
    if (anchoredHairpins.length) {
      const target = anchoredHairpins[0];
      const duplicateIds = new Set(anchoredHairpins.slice(1).map((mark) => mark.id));
      const changed = target.type !== nextType || duplicateIds.size > 0;
      if (changed) saveHistory();
      target.type = nextType;
      if (duplicateIds.size) state.marks = state.marks.filter((mark) => !duplicateIds.has(mark.id));
      state.selectedMarkIds = [target.id];
      render();
      return target.id;
    }

    saveHistory();
    const mark = {
      id: createMarkId(),
      type: nextType,
      systemIndex,
      measureIndex: anchor.measureIndex,
      tick: anchor.tick,
      staffStep: anchor.staffStep,
      entryId: anchor.entryId
    };
    state.marks.push(mark);
    state.selectedMarkIds = [mark.id];
    render();
    return mark.id;
  }

  function insertNotationMark(item) {
    if (!item?.markType) return;
    if (isHairpinType(item.markType)) return upsertHairpinAtCurrentAnchor(item.markType);
    if (isArticulationPaletteItem(item)) {
      const selectedTargets = selectedArticulationMarks();
      if (selectedTargets.length) {
        saveHistory();
        const selectedIds = selectedTargets.map((mark) => (
          upsertArticulationAtAnchor(item, {
            measureIndex: mark.measureIndex,
            tick: mark.tick,
            staffStep: mark.staffStep,
            entryId: mark.entryId
          }, markSystemIndex(mark))
        ));
        state.selectedMarkIds = [...new Set(selectedIds.filter(Boolean))];
        render();
        return;
      }
      if (selectedNoteheadLocationsForContext().length) {
        setEntryContextArticulation({}, item, "selection");
        return;
      }
      const anchor = currentArticulationAnchor();
      if (!anchor) return;
      saveHistory();
      const id = upsertArticulationAtAnchor(item, anchor, activeSystemIndex());
      state.selectedMarkIds = id ? [id] : [];
      render();
      return;
    }
    saveHistory();
    const anchor = currentMarkAnchor();
    state.marks.push({
      id: createMarkId(),
      type: item.markType,
      glyphName: item.glyphName,
      systemIndex: activeSystemIndex(),
      measureIndex: anchor.measureIndex,
      tick: anchor.tick,
      staffStep: anchor.staffStep,
      entryId: anchor.entryId
    });
    render();
  }

  function selectedClefMarks() {
    return Marks.selectedOfType(state.marks, state.selectedMarkIds, "clef");
  }

  function findClefMarkAtAnchor(anchor) {
    const systemIndex = activeSystemIndex();
    return state.marks.find((mark) => (
      mark?.type === "clef" &&
      markSystemIndex(mark) === systemIndex &&
      sameScoreAnchor(mark, anchor)
    )) || null;
  }

  function insertClefChange(item) {
    const profile = clefProfile(item?.clefId);
    if (!profile) return;
    ensureAllPitchData({ force: true });
    saveHistory();
    const anchor = currentMarkAnchor();
    const selectedClefs = selectedClefMarks();
    const targetMarks = selectedClefs.length ? selectedClefs : [findClefMarkAtAnchor(anchor)].filter(Boolean);
    if (targetMarks.length) {
      targetMarks.forEach((mark) => {
        mark.clefId = profile.id;
        mark.staffStep = 0;
        delete mark.entryId;
      });
    } else {
      state.marks.push({
        id: createMarkId(),
        type: "clef",
        clefId: profile.id,
        systemIndex: activeSystemIndex(),
        measureIndex: anchor.measureIndex,
        tick: anchor.tick,
        staffStep: 0
      });
    }
    clearEntrySelection();
    clearTextSelection();
    state.selectedMarkIds = [];
    applyClefSpellingToEntries();
    render();
  }

  function requestEditorPopup({
    title,
    initialValue = "",
    placeholder = "",
    help = "",
    input = true,
    okLabel = "Aceptar",
    cancelLabel = "Cancelar"
  }) {
    return Popups.requestText({
      title,
      initialValue,
      placeholder,
      help,
      input,
      okLabel,
      cancelLabel,
      host: overlayHost()
    });
  }

  function requestColorPicker({
    title,
    current = selectedItemColor(),
    help = "",
    okLabel = "Aceptar",
    cancelLabel = "Cancelar"
  }) {
    return Popups.requestColor({
      title,
      current,
      help,
      okLabel,
      cancelLabel,
      host: overlayHost(),
      swatches: COLOR_SWATCHES,
      normalizeColor: normalizeItemColor
    });
  }

  function showEditorMessage(message) {
    return Popups.showMessage(message, { host: overlayHost() });
  }

  function normalizedAutoDropTool(value, fallback = "") {
    return AutoVoicing.normalizeDropTool(value, fallback);
  }

  function normalizedAutoSkipTool(value, fallback = "") {
    return AutoVoicing.normalizeSkipTool(value, fallback);
  }

  function autoDropCandidateTools(range) {
    return AutoVoicing.dropCandidateTools(state.autoDropConfig || {}, range);
  }

  function autoSkipCandidateTools(range) {
    return AutoVoicing.skipCandidateTools(state.autoSkipConfig || {}, range);
  }

  function autoDropPitchLabel(midi) {
    return AutoVoicing.pitchLabel(midi);
  }

  function parseAutoDropPitchValue(value) {
    return AutoVoicing.parsePitchValue(value);
  }

  async function requestAutoDropConfig() {
    const config = await AutoVoicing.requestDropConfig({
      config: state.autoDropConfig || {},
      host: overlayHost()
    });
    if (!config) return false;
    state.autoDropConfig = config;
    return true;
  }

  async function requestAutoSkipConfig() {
    const config = await AutoVoicing.requestSkipConfig({
      config: state.autoSkipConfig || {},
      host: overlayHost()
    });
    if (!config) return false;
    state.autoSkipConfig = config;
    return true;
  }

  function normalizeKeySignatureInput(value) {
    return KeySignatures.normalizeInput(value);
  }

  function parseKeySignatureInput(value) {
    return KeySignatures.parse(value);
  }

  function effectiveAccidentalWithSignature(entry, staffStep, signature) {
    return getEntryAccidental(entry, staffStep) ||
      getAutomaticAccidental(entry, staffStep) ||
      keySignatureAccidentalForDiatonicStep(entryDiatonicStepForStaffStep(entry, staffStep), signature) ||
      "natural";
  }

  function respellEntriesForKeySignature(previousSignature, nextSignature, startMeasureIndex = 0) {
    scoreSystems().forEach((system, systemIndex) => {
      if (systemIsPercussionLine(system)) return;
      withSystemContext(systemIndex, () => {
        refreshAutomaticAccidentals();
        state.measures.forEach((measure, measureIndex) => {
          if (measureIndex < startMeasureIndex) return;
          measure.entries.forEach((entry) => {
            if (entry.type === "rest") return;
            entryStaffSteps(entry).forEach((staffStep) => {
              const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
              const previousAccidental = effectiveAccidentalWithSignature(entry, staffStep, previousSignature);
              const nextDiatonicAccidental = keySignatureAccidentalForDiatonicStep(diatonicStep, nextSignature) || "natural";
              if (previousAccidental === nextDiatonicAccidental) {
                clearEntryAccidental(entry, staffStep);
              } else {
                setEntryAccidental(entry, staffStep, previousAccidental);
              }
            });
          });
        });
        refreshAutomaticAccidentals();
      });
    });
  }

  function setKeySignatureAtMeasure(signature, measureIndex = state.cursorMeasure) {
    const safeMeasureIndex = Math.max(0, Number(measureIndex) || 0);
    ensureAllSystemsMeasure(safeMeasureIndex);
    const previousSignature = keySignatureForMeasureIndex(safeMeasureIndex);
    respellEntriesForKeySignature(previousSignature, signature, safeMeasureIndex);
    if (safeMeasureIndex === 0) {
      state.keySignature = signature;
      scoreSystems().forEach((system) => {
        if (system.measures?.[0]) delete system.measures[0].keySignature;
      });
    } else {
      scoreSystems().forEach((system) => {
        if (!system.measures?.[safeMeasureIndex]) return;
        system.measures[safeMeasureIndex].keySignature = { ...signature };
      });
    }
  }

  async function requestKeySignature(measureIndex = state.cursorMeasure) {
    closePaletteDrawer();
    const safeMeasureIndex = Math.max(0, Number(measureIndex) || 0);
    const value = await requestEditorPopup({
      title: "Armadura",
      initialValue: keySignatureForMeasureIndex(safeMeasureIndex)?.source || "",
      placeholder: "F (mayor) f (menor)",
      help: "Ejemplo: F (mayor) o f (menor). Usa Bb para si bemol mayor, bb para si bemol menor, F# para fa sostenido mayor."
    });
    if (value === null) return;
    const normalized = normalizeKeySignatureInput(value);
    if (!normalized) return;
    const signature = parseKeySignatureInput(normalized);
    if (!signature) {
      showEditorMessage("Escribe una tonalidad entre Cb y C# mayor, o entre ab y a# menor. Ejemplos: F, f, Bb, bb, F#, f#.");
      return;
    }
    saveHistory();
    setKeySignatureAtMeasure(signature, safeMeasureIndex);
    render();
  }

  function parseMeterValue(value) {
    const match = String(value || "").trim().match(/^(\d+(?:\s*\+\s*\d+)*)\s*\/\s*(\d+)$/);
    if (!match) return null;
    const top = match[1].replace(/\s+/g, "");
    const bottom = match[2];
    const topParts = top.split("+").map(Number);
    const denominator = Number(bottom);
    if (!topParts.every((part) => Number.isInteger(part) && part > 0) || !Number.isInteger(denominator) || denominator <= 0) {
      return null;
    }
    return { top, bottom, label: `${top}/${bottom}` };
  }

  function setMeterAtMeasure(meter, measureIndex = state.cursorMeasure) {
    if (!meter) return;
    const entrySnapshots = scoreSystems().map((system, systemIndex) => (
      withSystemContext(systemIndex, () => flattenScoreEntries().map((item) => ({
        absTick: item.absTick,
        entry: item.entry
      })))
    ));
    saveHistory();
    measureIndex = Math.max(0, Number(measureIndex) || 0);
    ensureAllSystemsMeasure(measureIndex);
    if (measureIndex === 0) {
      state.meter = { ...meter };
      scoreSystems().forEach((system) => {
        if (system.measures[0]) delete system.measures[0].meter;
      });
    } else {
      scoreSystems().forEach((system) => {
        if (system.measures[measureIndex]) system.measures[measureIndex].meter = { ...meter };
      });
    }
    syncActiveMeterToCursor();
    scoreSystems().forEach((system, systemIndex) => {
      withSystemContext(systemIndex, () => {
        rebuildMeasuresFromAbsoluteItems(entrySnapshots[systemIndex] || [], system.measures.length);
        normalizeTernaryTiedUnitPairs();
        verifyAllMeasureDurations();
      });
    });
    render();
  }

  function setMeter(meter) {
    return setMeterAtMeasure(meter, state.cursorMeasure);
  }

  async function requestAmalgamMeter() {
    const value = await requestEditorPopup({
      title: "Amalgama",
      initialValue: "2+3/8",
      help: "Ejemplos: 2+3/8, 3+2/8, 4+3+3/8."
    });
    if (value === null) return;
    const meter = parseMeterValue(value);
    if (!meter || !meter.top.includes("+")) {
      await showEditorMessage("Escribe una amalgama con el formato 2+3/8, 3+2/8 o 4+3+3/8.");
      return;
    }
    setMeter(meter);
  }

  async function requestCustomMeterAtMeasure(measureIndex) {
    const value = await requestEditorPopup({
      title: "Signatura",
      initialValue: "5/4",
      help: "Ejemplos: 2/4, 5/8, 7/16."
    });
    if (value === null) return;
    const meter = parseMeterValue(value);
    if (!meter || meter.top.includes("+")) {
      await showEditorMessage("Escribe una signatura simple con formato X/Y. Para sumas usa Amalgama.");
      return;
    }
    setMeterAtMeasure(meter, measureIndex);
  }

  async function requestAmalgamMeterAtMeasure(measureIndex) {
    const value = await requestEditorPopup({
      title: "Amalgama",
      initialValue: "2+3/8",
      help: "Ejemplos: 2+3/8, 3+2/8, 4+3+3/8."
    });
    if (value === null) return;
    const meter = parseMeterValue(value);
    if (!meter || !meter.top.includes("+")) {
      await showEditorMessage("Escribe una amalgama con el formato 2+3/8, 3+2/8 o 4+3+3/8.");
      return;
    }
    setMeterAtMeasure(meter, measureIndex);
  }

  function targetBoundaryIndexForBarline(item = {}) {
    const cursorMeasure = Math.max(0, Number(state.cursorMeasure) || 0);
    if (item.previousBoundary) return cursorMeasure;
    return cursorMeasure + 1;
  }

  function barlineMarksAtBoundary(boundaryIndex) {
    return (state.marks || []).filter((mark) => (
      mark?.type === "barline" &&
      Number(mark.boundaryIndex) === boundaryIndex
    ));
  }

  function applyBarlineAtBoundary(barlineType, boundaryIndex) {
    if (!barlineType) return false;
    closePaletteDrawer();
    boundaryIndex = Math.max(0, Number(boundaryIndex) || 0);
    ensureMeasure(Math.max(0, boundaryIndex - 1));
    saveHistory();
    state.marks = (state.marks || []).filter((mark) => !(
      mark?.type === "barline" &&
      Number(mark.boundaryIndex) === boundaryIndex
    ));
    const hasDefaultSingle = boundaryIndex > 0;
    if (barlineType !== "single" || !hasDefaultSingle) {
      state.marks.push({
        id: createMarkId(),
        type: "barline",
        barlineType,
        boundaryIndex,
        measureIndex: Math.max(0, boundaryIndex - 1),
        tick: boundaryIndex > 0 ? measureTicksForIndex(Math.max(0, boundaryIndex - 1)) : 0,
        staffStep: 0
      });
    }
    clearEntrySelection();
    clearTextSelection();
    clearActiveNote();
    hideCursorPitch();
    state.selectedMarkIds = [];
    render();
    return true;
  }

  function applyBarline(item) {
    const barlineType = item?.barlineType;
    if (!barlineType) return false;
    return applyBarlineAtBoundary(barlineType, targetBoundaryIndexForBarline(item));
  }

  function selectedEndingMarks() {
    return selectedMarks().filter((mark) => mark?.type === "ending");
  }

  function applyEndingAtMeasure(item, startMeasureIndex = state.cursorMeasure, options = {}) {
    const ending = item?.ending;
    if (!ending) return false;
    closePaletteDrawer();
    saveHistory();
    const selectedEndings = options.ignoreSelection ? [] : selectedEndingMarks();
    if (selectedEndings.length) {
      selectedEndings.forEach((mark) => {
        if (ending.label) mark.label = ending.label;
        mark.closedEnd = ending.closedEnd === true;
      });
      render();
      return true;
    }
    startMeasureIndex = Math.max(0, Number(startMeasureIndex) || 0);
    const endMeasureIndex = startMeasureIndex + 1;
    ensureMeasure(endMeasureIndex);
    const mark = {
      id: createMarkId(),
      type: "ending",
      label: ending.label || "",
      closedEnd: ending.closedEnd === true,
      startMeasureIndex,
      endMeasureIndex,
      measureIndex: startMeasureIndex,
      tick: 0,
      staffStep: 0
    };
    state.marks.push(mark);
    clearEntrySelection();
    clearTextSelection();
    clearActiveNote();
    hideCursorPitch();
    state.selectedMarkIds = [mark.id];
    render();
    return true;
  }

  function applyEnding(item) {
    return applyEndingAtMeasure(item, state.cursorMeasure);
  }

  function closeContextMenu() {
    if (!contextMenuEl) return;
    contextMenuEl.remove();
    contextMenuEl = null;
    document.removeEventListener("pointerdown", closeContextMenuOnOutside, true);
    document.removeEventListener("keydown", closeContextMenuOnKey);
  }

  function closeContextMenuOnOutside(event) {
    if (contextMenuEl?.contains(event.target)) return;
    closeContextMenu();
  }

  function closeContextMenuOnKey(event) {
    if (event.key === "Escape") closeContextMenu();
  }

  function textContextLabel(item) {
    return TextItems.contextLabel(item, AnchoredText);
  }

  function setActiveTextItemForContext(item) {
    if (!item) return false;
    selectTextItem(item);
    render();
    return true;
  }

  function sameKindTextItems(item) {
    return TextItems.sameKind(state.textItems, item, AnchoredText);
  }

  function textKindPluralLabel(item) {
    return TextItems.pluralLabel(item, AnchoredText);
  }

  function textStyleTargets(item, options = {}) {
    return TextItems.styleTargets(state.textItems, item, options, AnchoredText);
  }

  async function requestTextItemColor(item, options = {}) {
    if (!item) return false;
    const current = normalizeItemColor(item.style?.color || state.textStyle.color || "#15120f");
    const color = await requestColorPicker({
      title: options.allOfKind ? `Color de todos los ${textKindPluralLabel(item)}` : "Color de texto",
      current
    });
    if (color === null) return false;
    saveHistory();
    textStyleTargets(item, options).forEach((target) => {
      target.style = { ...(target.style || {}), color };
    });
    state.textStyle = { ...state.textStyle, color };
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    render();
    return true;
  }

  async function requestTextItemSize(item, options = {}) {
    if (!item) return false;
    const current = Number(item.style?.size || state.textStyle.size || 24);
    const value = await requestEditorPopup({
      title: options.allOfKind ? `Tamaño de todos los ${textKindPluralLabel(item)}` : "Tamaño de texto",
      initialValue: String(current),
      placeholder: "24"
    });
    if (value === null) return false;
    const size = Math.max(6, Math.min(96, Number(value) || current));
    saveHistory();
    textStyleTargets(item, options).forEach((target) => {
      target.style = { ...(target.style || {}), size };
    });
    state.textStyle = { ...state.textStyle, size };
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    render();
    return true;
  }

  async function requestTextItemOpacity(item, options = {}) {
    if (!item) return false;
    const current = Math.round(normalizeItemOpacity(item.style?.opacity, 1) * 100);
    const value = await requestEditorPopup({
      title: options.allOfKind ? `Opacidad de todos los ${textKindPluralLabel(item)}` : "Opacidad de texto",
      initialValue: String(current),
      placeholder: "100",
      help: "Valor entre 5 y 100."
    });
    if (value === null) return false;
    const opacity = normalizeItemOpacity((Number(value) || current) / 100, current / 100);
    saveHistory();
    textStyleTargets(item, options).forEach((target) => {
      target.style = { ...(target.style || {}), opacity };
    });
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    render();
    return true;
  }

  function setTextItemFont(item, font, options = {}) {
    if (!item) return false;
    const nextFont = knownFont(font, "Ink Free");
    saveHistory();
    textStyleTargets(item, options).forEach((target) => {
      target.style = { ...(target.style || {}), font: nextFont };
    });
    state.textStyle = { ...state.textStyle, font: nextFont };
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    render();
    return true;
  }

  function setTextItemEnclosure(item, enclosure, options = {}) {
    if (!item) return false;
    const allowed = new Set(["none", "box", "round", "circle"]);
    const nextEnclosure = allowed.has(enclosure) ? enclosure : "none";
    saveHistory();
    textStyleTargets(item, options).forEach((target) => {
      target.style = { ...(target.style || {}), enclosure: nextEnclosure };
    });
    state.textStyle = { ...state.textStyle, enclosure: nextEnclosure };
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    render();
    return true;
  }

  function setTextItemAlign(item, align, options = {}) {
    if (!item) return false;
    const nextAlign = normalizeTextAlign(align);
    saveHistory();
    textStyleTargets(item, options).forEach((target) => {
      target.style = { ...(target.style || {}), align: nextAlign };
    });
    state.textStyle = { ...state.textStyle, align: nextAlign };
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    render();
    return true;
  }

  function copyTextStyleToAllSameKind(item) {
    if (!item) return false;
    const style = { ...state.textStyle, ...(item.style || {}) };
    saveHistory();
    sameKindTextItems(item).forEach((target) => {
      target.style = { ...(target.style || {}), ...style };
    });
    state.textStyle = { ...style };
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    render();
    return true;
  }

  function duplicateTextItem(item) {
    if (!item) return false;
    saveHistory();
    const copy = cloneTextItemForPaste(item);
    if (Number.isFinite(copy.x)) copy.x += 24;
    if (Number.isFinite(copy.y)) copy.y += 24;
    if (Number.isFinite(copy.tick)) {
      copy.tick = Math.min(measureTicksForIndex(Number(copy.measureIndex) || 0), Number(copy.tick) + movementGridTicks());
    }
    state.textItems.push(copy);
    state.activeTextId = copy.id;
    state.selectedTextIds = [copy.id];
    render();
    return true;
  }

  function deleteTextItem(item) {
    if (!item) return false;
    saveHistory();
    state.textItems = state.textItems.filter((candidate) => candidate.id !== item.id);
    if (state.activeTextId === item.id) state.activeTextId = null;
    state.selectedTextIds = (state.selectedTextIds || []).filter((id) => id !== item.id);
    render();
    return true;
  }

  function showTextContextMenu(event, item) {
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    closePaletteDrawer();
    closeContextMenu();
    const menu = htmlEl("div", {
      class: "score-context-menu",
      role: "menu",
      "aria-label": `Opciones de ${textContextLabel(item)}`
    });
    menu.appendChild(htmlEl("div", {
      class: "score-context-menu__title",
      text: textContextLabel(item)
    }));
    menu.appendChild(contextMenuGroup("Editar", [
      contextMenuButton("Editar contenido", () => editTextItem(item)),
      contextMenuButton("Duplicar", () => duplicateTextItem(item)),
      contextMenuButton("Copiar", () => {
        setActiveTextItemForContext(item);
        return copySelectedContentToClipboard();
      }, { shortcut: "Cmd/Ctrl+C" }),
      contextMenuButton("Borrar", () => deleteTextItem(item), { shortcut: "Delete" })
    ]));
    menu.appendChild(contextMenuGroup("Color", [
      contextMenuButton("Color...", () => requestTextItemColor(item)),
      contextMenuButton("Tamaño...", () => requestTextItemSize(item)),
      contextMenuButton("Opacidad...", () => requestTextItemOpacity(item)),
      contextMenuButton(`Copiar apariencia a todos los ${textKindPluralLabel(item)}`, () => copyTextStyleToAllSameKind(item))
    ]));
    menu.appendChild(contextMenuGroup("Fuente", FONT_OPTIONS.map((font) => (
      contextMenuButton(font.label, () => setTextItemFont(item, font.value))
    ))));
    menu.appendChild(contextMenuGroup("Enclosure", [
      contextMenuButton("Ninguno", () => setTextItemEnclosure(item, "none")),
      contextMenuButton("Caja", () => setTextItemEnclosure(item, "box")),
      contextMenuButton("Redondeado", () => setTextItemEnclosure(item, "round")),
      contextMenuButton("Círculo", () => setTextItemEnclosure(item, "circle"))
    ]));
    menu.appendChild(contextMenuGroup("Justificación", [
      contextMenuButton("Izquierda", () => setTextItemAlign(item, "left")),
      contextMenuButton("Centro", () => setTextItemAlign(item, "center")),
      contextMenuButton("Derecha", () => setTextItemAlign(item, "right"))
    ]));
    menu.appendChild(contextMenuGroup(`Todos los ${textKindPluralLabel(item)}`, [
      contextMenuButton("Color a todos...", () => requestTextItemColor(item, { allOfKind: true })),
      contextMenuButton("Tamaño a todos...", () => requestTextItemSize(item, { allOfKind: true })),
      contextMenuButton("Opacidad a todos...", () => requestTextItemOpacity(item, { allOfKind: true })),
      contextMenuButton("Fuente actual a todos", () => setTextItemFont(item, item.style?.font || state.textStyle.font || "Ink Free", { allOfKind: true })),
      contextMenuButton("Enclosure actual a todos", () => setTextItemEnclosure(item, item.style?.enclosure || state.textStyle.enclosure || "none", { allOfKind: true })),
      contextMenuButton("Justificación actual a todos", () => setTextItemAlign(item, item.style?.align || state.textStyle.align || "left", { allOfKind: true }))
    ]));
    menu.appendChild(contextMenuGroup("Desplazar", nonNoteMoveContextItems()));
    contextMenuEl = menu;
    positionContextMenu(menu, event.clientX, event.clientY);
    setTimeout(() => {
      document.addEventListener("pointerdown", closeContextMenuOnOutside, true);
      document.addEventListener("keydown", closeContextMenuOnKey);
    }, 0);
  }

  function entryContextLabel(entry) {
    if (entry?.type === "rest") return "Silencio";
    if (entry?.type === "note" && entryStaffSteps(entry).length > 1) return "Acorde";
    return "Nota";
  }

  function selectEntryForContext(location) {
    if (!location?.entry) return false;
    setActiveSystemIndex(location.systemIndex);
    if (location.wholeChord && location.entry.type === "note") {
      return selectChordEntry(location.measureIndex, location.entryIndex, {
        activateCursor: false,
        staffStep: location.staffStep
      });
    }
    return selectEntry(location.measureIndex, location.entryIndex, {
      activateCursor: false,
      staffStep: location.staffStep,
      selectHead: location.entry.type === "note" && entryStaffSteps(location.entry).length > 1
    });
  }

  function showEntryContextMenu(event, location) {
    const entry = location?.entry;
    if (!entry) return;
    event.preventDefault();
    event.stopPropagation();
    if (Number.isFinite(location.systemIndex)) setActiveSystemIndex(location.systemIndex);
    activateVoiceForEntrySelection(entry);
    closePaletteDrawer();
    closeContextMenu();
    const staffStep = entry.type === "note"
      ? nearestEntryStaffStep(entry, location.staffStep)
      : entryStaffStep(entry);
    const preserveSelection = entry.type === "note" &&
      entryIsInMultiSelection(entry) &&
      hasMultiNoteheadSelection();
    const normalizedLocation = { ...location, staffStep, preserveSelection };
    const menu = htmlEl("div", {
      class: "score-context-menu",
      role: "menu",
      "aria-label": `Opciones de ${entryContextLabel(entry)}`
    });
    menu.appendChild(htmlEl("div", {
      class: "score-context-menu__title",
      text: entryContextLabel(entry)
    }));
    const colorItems = [
      contextMenuButton(entry.type === "rest" ? "Color del silencio..." : "Color de la figura/acorde...", () => requestEntryContextColor(normalizedLocation, "entry"))
    ];
    if (entry.type === "note") {
      colorItems.unshift(contextMenuButton("Color de esta cabeza...", () => requestEntryContextColor(normalizedLocation, "note")));
      colorItems.push(contextMenuButton("Color de todas las notas iguales...", () => requestEntryContextColor(normalizedLocation, "pitch")));
    }
    if (hasSelectedItemsForColor()) {
      colorItems.push(contextMenuButton("Color de la selección...", () => requestEntryContextColor(normalizedLocation, "selected")));
    }
    colorItems.push(contextMenuButton(`Color de voz ${entryVoice(entry)} completa...`, () => requestEntryContextColor(normalizedLocation, "voice")));
    colorItems.push(
      contextMenuButton("Opacidad...", () => requestEntryContextOpacity(normalizedLocation, "entry")),
      ...(hasSelectedItemsForColor()
        ? [contextMenuButton("Opacidad de la selección...", () => requestEntryContextOpacity(normalizedLocation, "selected"))]
        : [])
    );
    menu.appendChild(contextMenuGroup("Color", colorItems));
    menu.appendChild(contextMenuGroup("Duración", durationContextItemsForEntry(normalizedLocation)));
    if (entry.type === "rest") {
      menu.appendChild(contextMenuGroup("Convertir en nota", noteConversionContextItems(normalizedLocation)));
    }
    menu.appendChild(contextMenuGroup("Tuplets", tupletContextItems(normalizedLocation)));
    if (entry.type === "note") {
      if (!activeSystemIsPercussionLine()) {
        menu.appendChild(contextMenuGroup("Alteraciones", accidentalContextItems(normalizedLocation)));
      }
      menu.appendChild(contextMenuGroup("Dinámicas", dynamicContextItemsForEntry(normalizedLocation)));
      menu.appendChild(contextMenuGroup("Ligaduras", [
        contextMenuButton("Prolongación", runWithContextEntry(normalizedLocation, toggleDurationTieFromCurrentNote), { shortcut: "T" }),
        contextMenuButton("Fraseo", runWithContextEntry(normalizedLocation, () => applyPhraseSlurType("slur")), { shortcut: "S" }),
        contextMenuButton("Fraseo punteado", runWithContextEntry(normalizedLocation, () => applyPhraseSlurType("dotted-slur")))
      ]));
      if (entryDuration(entry).flags > 0) {
        menu.appendChild(contextMenuGroup("Barrado", beamContextItems(normalizedLocation)));
      }
      if (normalizedLocation.preserveSelection) {
        menu.appendChild(noteheadMenuGroups(normalizedLocation, "selection", {
          title: "Cabezas de nota",
          intro: "Restaurar cabezas de la selección"
        }));
        menu.appendChild(articulationMenuGroup(normalizedLocation, "selection", {
          title: "Articulaciones de la selección"
        }));
      }
      menu.appendChild(noteheadMenuGroups(normalizedLocation, normalizedLocation.wholeChord ? "entry" : "head", {
        title: normalizedLocation.wholeChord ? "Cabezas de nota del acorde" : "Cabezas de nota"
      }));
      menu.appendChild(articulationMenuGroup(normalizedLocation, normalizedLocation.wholeChord ? "entry" : "head", {
        title: normalizedLocation.wholeChord ? "Articulaciones del acorde" : "Articulaciones"
      }));
      if (!normalizedLocation.wholeChord && entryStaffSteps(entry).length > 1) {
        menu.appendChild(noteheadMenuGroups({ ...normalizedLocation, wholeChord: true }, "entry", {
          title: "Cabezas de todo el acorde",
          open: false
        }));
        menu.appendChild(articulationMenuGroup({ ...normalizedLocation, wholeChord: true }, "entry", {
          title: "Articulaciones de todo el acorde",
          open: false
        }));
      }
      if (entryStaffSteps(entry).length > 1 || selectedChordLocations().length) {
        menu.appendChild(contextMenuGroup("Voicing", voicingContextItems(normalizedLocation)));
      }
    }
    menu.appendChild(contextMenuGroup("Voz", voiceContextItems()));
    menu.appendChild(contextMenuGroup("Edición", editContextItemsForEntry(normalizedLocation)));
    contextMenuEl = menu;
    positionContextMenu(menu, event.clientX, event.clientY);
    setTimeout(() => {
      document.addEventListener("pointerdown", closeContextMenuOnOutside, true);
      document.addEventListener("keydown", closeContextMenuOnKey);
    }, 0);
  }

  function showCanvasContextMenu(event) {
    if (event.target?.closest?.(".score-entry, .canvas-text-item, .barline-group, .phrase-slur-group, .notation-mark-group")) return;
    const point = svgPointFromEvent(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    closePaletteDrawer();
    closeContextMenu();
    setActiveSystemIndex(systemIndexFromY(point.y));
    const menu = htmlEl("div", {
      class: "score-context-menu",
      role: "menu",
      "aria-label": "Opciones del canvas"
    });
    menu.appendChild(htmlEl("div", { class: "score-context-menu__title", text: "Canvas" }));
    menu.appendChild(contextMenuGroup("Escritura", writingContextItemsAtPoint(point)));
    menu.appendChild(contextMenuGroup("Tuplets", tupletContextItems(null, point)));
    menu.appendChild(contextMenuGroup("Texto", [
      contextMenuButton("Crear texto libre", () => addTextItemAtPoint(point)),
      contextMenuButton("Crear cifrado", () => addChordItemAtPoint(point)),
      contextMenuButton("Crear dinámica", () => addDynamicItemAtPoint(point))
    ]));
    menu.appendChild(contextMenuGroup("Tempo", tempoContextItemsAtPoint(point)));
    menu.appendChild(contextMenuGroup("Clave", clefContextItemsAtPoint(point)));
    menu.appendChild(contextMenuGroup("Armadura", [
      contextMenuButton("Escribir tonalidad...", runAtCanvasPoint(point, () => requestKeySignature(contextMeasureIndexFromPoint(point))))
    ]));
    menu.appendChild(contextMenuGroup("Voz", voiceContextItems()));
    menu.appendChild(contextMenuGroup("Sistemas", [
      contextMenuButton("Agregar pentagrama", addStaffSystem),
      contextMenuButton("Agregar línea de percusión", addPercussionLineSystem),
      contextMenuButton("Quitar sistema activo", removeActiveSystem)
    ]));
    menu.appendChild(contextMenuGroup("Estructura", [
      contextMenuButton("Insertar compás antes", () => insertMeasureAtIndex(contextMeasureIndexFromPoint(point))),
      contextMenuButton("Insertar compás después", () => insertMeasureAtIndex(contextMeasureIndexFromPoint(point) + 1)),
      contextMenuButton("Quitar compás", () => {
        state.selectedMeasureIndex = contextMeasureIndexFromPoint(point);
        return removeSelectedMeasure();
      }, { shortcut: "Delete" }),
      contextMenuButton("Ocultar/mostrar compás", () => {
        state.selectedMeasureIndex = contextMeasureIndexFromPoint(point);
        return toggleSelectedMeasureHidden();
      })
    ]));
    if (hasSelectedItemsForColor()) {
      menu.appendChild(contextMenuGroup("Color", [
        contextMenuButton("Color de la selección...", () => requestItemColor("Color de la selección", selectedItemColor()).then((color) => {
          if (color) applySelectedItemColor(color);
        }))
      ]));
    }
    menu.appendChild(contextMenuGroup("Vista", [
      contextMenuButton("Acercar", () => zoomBy(0.1), { shortcut: "Cmd/Ctrl++" }),
      contextMenuButton("Alejar", () => zoomBy(-0.1), { shortcut: "Cmd/Ctrl+-" }),
      contextMenuButton("Zoom 100%", () => setZoom(1), { shortcut: "Cmd/Ctrl+0" })
    ]));
    menu.appendChild(contextMenuGroup("Desplazar", nonNoteMoveContextItems()));
    menu.appendChild(contextMenuGroup("Edición", editContextItems()));
    if ((state.clipboardItems || []).length || (state.clipboardUnits || []).length) {
      const layout = buildLayout();
      const measureIndex = measureIndexFromX(layout, point.x);
      const tick = tickFromMeasureX(layout, measureIndex, point.x);
      const absoluteTick = measureStartAbsoluteTick(measureIndex) + tick;
      menu.appendChild(contextMenuGroup("Pegar", [
        contextMenuButton("Pegar aquí", () => pasteClipboardContentAtAbsoluteTick(absoluteTick), { shortcut: "Cmd/Ctrl+V" })
      ]));
    }
    contextMenuEl = menu;
    positionContextMenu(menu, event.clientX, event.clientY);
    setTimeout(() => {
      document.addEventListener("pointerdown", closeContextMenuOnOutside, true);
      document.addEventListener("keydown", closeContextMenuOnKey);
    }, 0);
  }

  function contextEventAtClientPoint(clientX, clientY, target = svg) {
    return {
      clientX,
      clientY,
      target,
      preventDefault() {},
      stopPropagation() {}
    };
  }

  function defaultTouchMenuPoint() {
    const rect = svg.getBoundingClientRect();
    return {
      x: rect.left + Math.min(rect.width - 20, Math.max(20, rect.width / 2)),
      y: rect.top + Math.min(rect.height - 20, Math.max(20, rect.height / 2))
    };
  }

  function defaultScoreClientPoint() {
    const rect = svg.getBoundingClientRect();
    return {
      x: rect.left + Math.min(rect.width - 20, Math.max(20, rect.width / 2)),
      y: rect.top + Math.min(rect.height - 20, Math.max(20, rect.height / 2))
    };
  }

  function openTouchSelectionMenu() {
    const point = defaultTouchMenuPoint();
    const textItem = selectedTextItems()[0];
    if (textItem) {
      showTextContextMenu(contextEventAtClientPoint(point.x, point.y), textItem);
      return true;
    }
    const mark = selectedMarks()[0];
    if (mark) {
      showMarkContextMenu(contextEventAtClientPoint(point.x, point.y), mark);
      return true;
    }
    const entryLocation = selectedEntryLocations()[0] || selectedEntryLocation();
    if (entryLocation?.entry) {
      showEntryContextMenu(contextEventAtClientPoint(point.x, point.y), {
        systemIndex: activeSystemIndex(),
        measureIndex: entryLocation.measureIndex,
        entryIndex: entryLocation.entryIndex,
        entry: entryLocation.entry,
        staffStep: Number.isFinite(state.activeNoteStaffStep)
          ? nearestEntryStaffStep(entryLocation.entry, state.activeNoteStaffStep)
          : entryStaffStep(entryLocation.entry),
        wholeChord: state.selectedEntryIds.includes(entryLocation.entry.id)
      });
      return true;
    }
    return openTouchCanvasMenu();
  }

  function openTouchCanvasMenu() {
    const point = defaultScoreClientPoint();
    showCanvasContextMenu(contextEventAtClientPoint(point.x, point.y, svg));
    return true;
  }

  async function requestSelectedTouchColor() {
    if (!hasSelectedItemsForColor()) return false;
    const color = await requestColorPicker({
      title: "Color de la selección",
      current: selectedItemColor()
    });
    if (color === null) return false;
    applySelectedItemColor(color);
    return true;
  }

  function deleteTouchSelection() {
    if (deleteSelectedMarks()) return true;
    if (deleteSelectedTextItem()) return true;
    if (selectedItemCountForTouch() > 0) {
      deleteActiveNoteOrCursorEntry();
      return true;
    }
    return false;
  }

  function clearTouchLongPress() {
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
      touchState.longPressTimer = null;
    }
  }

  function openContextMenuFromTouch(target, clientX, clientY) {
    const contextTarget = target?.closest?.(
      ".score-entry, .canvas-text-item, .barline-group, .phrase-slur-group, .notation-mark-group, .initial-context-hit"
    );
    if (contextTarget) {
      contextTarget.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY
      }));
      return true;
    }
    showCanvasContextMenu(contextEventAtClientPoint(clientX, clientY, svg));
    return true;
  }

  function handleTouchLongPressStart(event) {
    if (!isTouchOptimizedInput(event) || event.button === 2) return;
    if (event.target?.closest?.(".score-context-menu, .editor-popup")) return;
    clearTouchLongPress();
    touchState.pointerId = event.pointerId;
    touchState.startX = event.clientX;
    touchState.startY = event.clientY;
    touchState.target = event.target;
    touchState.longPressTimer = setTimeout(() => {
      touchState.suppressClickUntil = Date.now() + 450;
      openContextMenuFromTouch(touchState.target, touchState.startX, touchState.startY);
      clearTouchLongPress();
    }, 560);
  }

  function handleTouchLongPressMove(event) {
    if (event.pointerId !== touchState.pointerId || !touchState.longPressTimer) return;
    if (Math.hypot(event.clientX - touchState.startX, event.clientY - touchState.startY) > 10) {
      clearTouchLongPress();
    }
  }

  function handleTouchLongPressEnd(event) {
    if (event.pointerId === touchState.pointerId) {
      clearTouchLongPress();
      touchState.pointerId = null;
      touchState.target = null;
    }
  }

  function touchDistance(touches) {
    if (!touches || touches.length < 2) return 0;
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function handleTouchPinchStart(event) {
    if (!isTouchOptimizedInput() || event.touches.length !== 2) return;
    touchState.pinch = {
      distance: touchDistance(event.touches),
      zoom: state.zoom || 1
    };
  }

  function handleTouchPinchMove(event) {
    if (!touchState.pinch || event.touches.length !== 2) return;
    const distance = touchDistance(event.touches);
    if (!distance || !touchState.pinch.distance) return;
    event.preventDefault();
    setZoom(touchState.pinch.zoom * (distance / touchState.pinch.distance));
  }

  function handleTouchPinchEnd(event) {
    if (event.touches.length < 2) touchState.pinch = null;
  }

  function setupTouchSupport() {
    syncTouchModeClass();
    updateTouchToolbar();
    svg?.addEventListener("pointerdown", handleTouchLongPressStart, true);
    svg?.addEventListener("pointermove", handleTouchLongPressMove, true);
    svg?.addEventListener("pointerup", handleTouchLongPressEnd, true);
    svg?.addEventListener("pointercancel", handleTouchLongPressEnd, true);
    scoreShell?.addEventListener("touchstart", handleTouchPinchStart, { passive: true });
    scoreShell?.addEventListener("touchmove", handleTouchPinchMove, { passive: false });
    scoreShell?.addEventListener("touchend", handleTouchPinchEnd, { passive: true });
    scoreShell?.addEventListener("touchcancel", handleTouchPinchEnd, { passive: true });
    coarsePointerQuery?.addEventListener?.("change", () => {
      syncTouchModeClass();
      updateTouchToolbar();
    });
    hoverlessQuery?.addEventListener?.("change", () => {
      syncTouchModeClass();
      updateTouchToolbar();
    });
  }

  function setInitialClef(clefId) {
    const profile = clefProfile(clefId);
    if (!profile) return false;
    ensureAllPitchData({ force: true });
    saveHistory();
    const systemIndex = activeSystemIndex();
    const system = scoreSystems()[systemIndex];
    if (system) system.initialClefId = profile.id;
    state.marks = state.marks.filter((mark) => !(
      mark?.type === "clef" &&
      markSystemIndex(mark) === systemIndex &&
      Number(mark.measureIndex) === 0 &&
      Math.abs(Number(mark.tick) || 0) < EPSILON
    ));
    applyClefSpellingToEntries();
    render();
    return true;
  }

  function initialItemsContextActions(measureIndex = 0) {
    return [
      contextMenuGroup("Clave inicial", palettes.clefs.map((item) => (
        contextMenuButton(item.label, () => setInitialClef(item.clefId))
      ))),
      contextMenuGroup("Signatura de medida", [
        contextMenuButton("2/4", () => setMeterAtMeasure({ top: "2", bottom: "4", label: "2/4" }, measureIndex)),
        contextMenuButton("3/4", () => setMeterAtMeasure({ top: "3", bottom: "4", label: "3/4" }, measureIndex)),
        contextMenuButton("4/4", () => setMeterAtMeasure({ top: "4", bottom: "4", label: "4/4" }, measureIndex)),
        contextMenuButton("6/8", () => setMeterAtMeasure({ top: "6", bottom: "8", label: "6/8" }, measureIndex)),
        contextMenuButton("9/8", () => setMeterAtMeasure({ top: "9", bottom: "8", label: "9/8" }, measureIndex)),
        contextMenuButton("12/8", () => setMeterAtMeasure({ top: "12", bottom: "8", label: "12/8" }, measureIndex)),
        contextMenuButton("X/Y...", () => requestCustomMeterAtMeasure(measureIndex)),
        contextMenuButton("Amalg...", () => requestAmalgamMeterAtMeasure(measureIndex))
      ]),
      contextMenuGroup("Armadura", [
        contextMenuButton("Escribir tonalidad...", () => requestKeySignature(measureIndex))
      ])
    ];
  }

  function showInitialItemContextMenu(event, title, measureIndex = 0) {
    event.preventDefault();
    event.stopPropagation();
    closePaletteDrawer();
    closeContextMenu();
    const menu = htmlEl("div", {
      class: "score-context-menu",
      role: "menu",
      "aria-label": `Opciones de ${title}`
    });
    menu.appendChild(htmlEl("div", { class: "score-context-menu__title", text: title }));
    initialItemsContextActions(measureIndex).forEach((group) => menu.appendChild(group));
    contextMenuEl = menu;
    positionContextMenu(menu, event.clientX, event.clientY);
    setTimeout(() => {
      document.addEventListener("pointerdown", closeContextMenuOnOutside, true);
      document.addEventListener("keydown", closeContextMenuOnKey);
    }, 0);
  }

  function renderInitialContextHit(root, rect, title, measureIndex = 0) {
    const hit = BasicRender.appendInitialContextHit(root, rect);
    hit.addEventListener("contextmenu", (event) => showInitialItemContextMenu(event, title, measureIndex));
  }

  function boundaryContextMeasureIndex(boundaryIndex) {
    const safeBoundary = Math.max(0, Number(boundaryIndex) || 0);
    return Math.max(0, Math.min(Math.max(0, state.measures.length - 1), safeBoundary));
  }

  function contextMenuButton(label, action, options = {}) {
    return ContextMenu.button(label, action, {
      ...options,
      close: closeContextMenu,
      htmlEl
    });
  }

  function contextMenuGlyphButton(glyphName, label, action, options = {}) {
    return ContextMenu.glyphButton(glyphName, label, action, {
      ...options,
      close: closeContextMenu,
      htmlEl,
      smufl
    });
  }

  function contextMenuGroup(label, items) {
    return ContextMenu.group(label, items, { htmlEl });
  }

  function positionContextMenu(menu, x, y) {
    ContextMenu.position(menu, x, y, { host: overlayHost() });
  }

  function showBarlineContextMenu(event, boundaryIndex, mark = null) {
    event.preventDefault();
    event.stopPropagation();
    closePaletteDrawer();
    closeContextMenu();
    const measureIndex = boundaryContextMeasureIndex(boundaryIndex);
    const menu = htmlEl("div", {
      class: "score-context-menu",
      role: "menu",
      "aria-label": `Opciones de barra ${boundaryIndex}`
    });
    menu.appendChild(htmlEl("div", {
      class: "score-context-menu__title",
      text: `Barra ${boundaryIndex}`
    }));
    const meterItems = [
      ["2/4", { top: "2", bottom: "4", label: "2/4" }],
      ["3/4", { top: "3", bottom: "4", label: "3/4" }],
      ["4/4", { top: "4", bottom: "4", label: "4/4" }],
      ["6/8", { top: "6", bottom: "8", label: "6/8" }],
      ["9/8", { top: "9", bottom: "8", label: "9/8" }],
      ["12/8", { top: "12", bottom: "8", label: "12/8" }]
    ].map(([label, meter]) => contextMenuButton(label, () => setMeterAtMeasure(meter, measureIndex)));
    meterItems.push(contextMenuButton("X/Y...", () => requestCustomMeterAtMeasure(measureIndex)));
    meterItems.push(contextMenuButton("Amalg...", () => requestAmalgamMeterAtMeasure(measureIndex)));
    menu.appendChild(contextMenuGroup("Signatura de medida", meterItems));
    menu.appendChild(contextMenuGroup("Armadura", [
      contextMenuButton("Escribir tonalidad...", () => requestKeySignature(measureIndex))
    ]));
    menu.appendChild(contextMenuGroup("Tipo de barra", palettes.bars.map((item) => (
      contextMenuButton(item.label, () => applyBarlineAtBoundary(item.barlineType, boundaryIndex))
    ))));
    menu.appendChild(contextMenuGroup("Casillas", palettes.endings.map((item) => (
      contextMenuButton(item.label, () => applyEndingAtMeasure(item, measureIndex, { ignoreSelection: true }))
    ))));
    menu.appendChild(contextMenuGroup("Estructura", [
      contextMenuButton("Insertar compás antes", () => insertMeasureAtIndex(measureIndex)),
      contextMenuButton("Insertar compás después", () => insertMeasureAtIndex(measureIndex + 1)),
      contextMenuButton("Quitar compás", () => {
        state.selectedMeasureIndex = measureIndex;
        return removeSelectedMeasure();
      }, { shortcut: "Delete" }),
      contextMenuButton("Ocultar/mostrar compás", () => {
        state.selectedMeasureIndex = measureIndex;
        return toggleSelectedMeasureHidden();
      })
    ]));
    menu.appendChild(contextMenuGroup("Edición", editContextItems()));
    contextMenuEl = menu;
    positionContextMenu(menu, event.clientX, event.clientY);
    setTimeout(() => {
      document.addEventListener("pointerdown", closeContextMenuOnOutside, true);
      document.addEventListener("keydown", closeContextMenuOnKey);
    }, 0);
  }

  async function requestMarkColor(mark) {
    if (!mark) return false;
    const color = await requestItemColor("Color", mark.color || selectedItemColor());
    if (!color) return false;
    saveHistory();
    mark.color = color;
    render();
    return true;
  }

  async function requestMarkOpacity(mark) {
    if (!mark) return false;
    const opacity = await requestItemOpacity("Opacidad", mark.opacity);
    if (opacity === null) return false;
    saveHistory();
    mark.opacity = opacity;
    render();
    return true;
  }

  function markAction(mark, action) {
    return async () => {
      if (mark?.id) state.selectedMarkIds = [mark.id];
      await action();
    };
  }

  function articulationMarkMenuGroup(mark) {
    const items = [];
    articulationPaletteGroups().forEach(([label, paletteItems]) => {
      items.push(contextMenuGroup(label, paletteItems.map((item) => (
        contextMenuGlyphButton(item.glyphName, item.label, markAction(mark, () => insertNotationMark(item)), {
          className: "score-context-menu__glyph-item--articulation"
        })
      ))));
    });
    return contextMenuGroup("Articulaciones", items);
  }

  function showMarkContextMenu(event, mark) {
    if (!mark) return;
    event.preventDefault();
    event.stopPropagation();
    closePaletteDrawer();
    closeContextMenu();
    const title = mark.type === "tempo" || mark.type === "tempo-text" || mark.type === "tempo-quarter"
      ? "Tempo"
      : mark.type === "clef"
        ? "Clave"
        : mark.type === "ending"
          ? "Casilla"
          : mark.type === "slur" || mark.type === "dotted-slur"
            ? "Ligadura de fraseo"
            : isArticulationMark(mark)
              ? "Articulación"
              : "Marca";
    const menu = htmlEl("div", {
      class: "score-context-menu",
      role: "menu",
      "aria-label": `Opciones de ${title}`
    });
    menu.appendChild(htmlEl("div", { class: "score-context-menu__title", text: title }));
    menu.appendChild(contextMenuGroup("Color", [
      contextMenuButton("Color...", () => requestMarkColor(mark)),
      contextMenuButton("Opacidad...", () => requestMarkOpacity(mark))
    ]));
    if (mark.type === "tempo" || mark.type === "tempo-text" || mark.type === "tempo-quarter") {
      menu.appendChild(contextMenuGroup("Tempo", palettes.tempo.map((item) => (
        contextMenuButton(item.label, markAction(mark, () => item.tempoText ? requestTempoText() : requestTempoMark(item)))
      ))));
    }
    if (mark.type === "clef") {
      menu.appendChild(contextMenuGroup("Clave", palettes.clefs.map((item) => (
        contextMenuButton(item.label, markAction(mark, () => insertClefChange(item)))
      ))));
    }
    if (mark.type === "ending") {
      menu.appendChild(contextMenuGroup("Casilla", [
        contextMenuButton("Editar numeral...", () => editEndingLabel(mark)),
        ...palettes.endings.map((item) => (
          contextMenuButton(item.label, markAction(mark, () => applyEndingAtMeasure(item, Number(mark.startMeasureIndex ?? mark.measureIndex) || 0)))
        ))
      ]));
    }
    if (isArticulationMark(mark)) {
      menu.appendChild(articulationMarkMenuGroup(mark));
    }
    if (isHairpinType(mark.type)) {
      menu.appendChild(contextMenuGroup("Regulador", [
        contextMenuButton("Crescendo", markAction(mark, () => upsertHairpinAtCurrentAnchor("crescendo")), { shortcut: "<" }),
        contextMenuButton("Diminuendo", markAction(mark, () => upsertHairpinAtCurrentAnchor("diminuendo")), { shortcut: ">" })
      ]));
    }
    if (mark.type === "slur" || mark.type === "dotted-slur") {
      menu.appendChild(contextMenuGroup("Ligadura", [
        contextMenuButton("Fraseo", markAction(mark, () => applyPhraseSlurType("slur")), { shortcut: "S" }),
        contextMenuButton("Fraseo punteado", markAction(mark, () => applyPhraseSlurType("dotted-slur"))),
        contextMenuButton("Invertir", () => toggleSelectedFlip(mark), { shortcut: "F" })
      ]));
    } else if (mark.type === "fermata") {
      menu.appendChild(contextMenuGroup("Orientación", [
        contextMenuButton("Invertir", () => toggleSelectedFlip(mark), { shortcut: "F" })
      ]));
    }
    menu.appendChild(contextMenuGroup("Edición", [
      contextMenuButton("Copiar esta marca", () => {
        if (mark?.id) state.selectedMarkIds = [mark.id];
        return copySelectedContentToClipboard();
      }, { shortcut: "Cmd/Ctrl+C" }),
      contextMenuButton("Borrar", markAction(mark, deleteSelectedMarks), { shortcut: "Delete" }),
      ...editContextItems()
    ]));
    menu.appendChild(contextMenuGroup("Desplazar", nonNoteMoveContextItems()));
    contextMenuEl = menu;
    positionContextMenu(menu, event.clientX, event.clientY);
    setTimeout(() => {
      document.addEventListener("pointerdown", closeContextMenuOnOutside, true);
      document.addEventListener("keydown", closeContextMenuOnKey);
    }, 0);
  }

  function insertMark(markData) {
    if (!markData?.type) return;
    if (isHairpinType(markData.type)) return upsertHairpinAtCurrentAnchor(markData.type);
    saveHistory();
    const anchor = currentMarkAnchor();
    state.marks.push({
      id: createMarkId(),
      ...markData,
      systemIndex: markIsSystemLocal(markData) ? activeSystemIndex() : markData.systemIndex,
      measureIndex: anchor.measureIndex,
      tick: anchor.tick,
      staffStep: anchor.staffStep,
      entryId: anchor.entryId
    });
    render();
  }

  function isArticulationMark(mark) {
    return Marks.isArticulation(mark);
  }

  function articulationMarkMatchesAnchor(mark, anchor) {
    return Marks.articulationMatchesAnchor(mark, anchor, activeSystemIndex(), EPSILON);
  }

  function selectedArticulationMarks() {
    return Marks.selectedArticulations(state.marks, state.selectedMarkIds);
  }

  function replaceArticulationMark(mark, item, anchor = null) {
    mark.type = item.markType;
    mark.glyphName = item.glyphName;
    mark.systemIndex = activeSystemIndex();
    mark.staffStep = anchor ? anchor.staffStep : mark.staffStep;
    if (anchor) {
      mark.measureIndex = anchor.measureIndex;
      mark.tick = anchor.tick;
      if (anchor.entryId) mark.entryId = anchor.entryId;
      else delete mark.entryId;
    }
    mark.flipped = false;
  }

  function entryContextMarkAnchor(location) {
    const entry = location?.entry;
    if (!entry || entry.type !== "note") return null;
    return {
      measureIndex: location.measureIndex,
      tick: entry.tickStart,
      staffStep: Number.isFinite(location.staffStep)
        ? nearestEntryStaffStep(entry, location.staffStep)
        : entryStaffStep(entry),
      entryId: entry.id
    };
  }

  function articulationMarkMatchesAnchorOnSystem(mark, anchor, systemIndex) {
    return Marks.articulationMatchesAnchor(mark, anchor, systemIndex, EPSILON);
  }

  function articulationGlyphIdentity(markOrItem) {
    const glyphName = markOrItem?.glyphName || (
      markOrItem?.type === "accent" || markOrItem?.markType === "accent"
        ? "articAccentAbove"
        : ""
    );
    return String(glyphName || "").replace(/(?:Above|Below)$/, "");
  }

  function articulationMarkMatchesItemAtAnchor(mark, item, anchor, systemIndex) {
    return articulationMarkMatchesAnchorOnSystem(mark, anchor, systemIndex) &&
      articulationGlyphIdentity(mark) === articulationGlyphIdentity(item);
  }

  function upsertArticulationAtAnchor(item, anchor, systemIndex = activeSystemIndex()) {
    const existing = state.marks.find((mark) => (
      articulationMarkMatchesItemAtAnchor(mark, item, anchor, systemIndex)
    ));
    if (existing) {
      return existing.id;
    }
    const id = createMarkId();
    state.marks.push({
      id,
      type: item.markType,
      glyphName: item.glyphName,
      systemIndex,
      measureIndex: anchor.measureIndex,
      tick: anchor.tick,
      staffStep: anchor.staffStep,
      entryId: anchor.entryId
    });
    return id;
  }

  function contextArticulationTargets(location, scope = "entry") {
    if (scope === "selection") {
      return selectedNoteheadLocationsForContext().flatMap((target) => (
        (state.selectedEntryIds.includes(target.entry.id)
          ? [entryStaffStep(target.entry)]
          : target.staffSteps
        ).map((staffStep) => ({
          systemIndex: Number.isFinite(target.systemIndex) ? target.systemIndex : activeSystemIndex(),
          anchor: {
            measureIndex: target.measureIndex,
            tick: target.entry.tickStart,
            staffStep,
            entryId: target.entry.id
          }
        }))
      ));
    }
    const entry = location?.entry;
    if (!entry || entry.type !== "note") return [];
    const steps = (scope === "entry" || location.wholeChord)
      ? [entryStaffStep(entry)]
      : [Number.isFinite(location.staffStep) ? nearestEntryStaffStep(entry, location.staffStep) : entryStaffStep(entry)];
    const systemIndex = Number.isFinite(location.systemIndex) ? location.systemIndex : activeSystemIndex();
    return steps.map((staffStep) => ({
      systemIndex,
      anchor: {
        measureIndex: location.measureIndex,
        tick: entry.tickStart,
        staffStep,
        entryId: entry.id
      }
    }));
  }

  function setEntryContextArticulation(location, item, scope = "head") {
    if (!item?.markType) return false;
    const targets = contextArticulationTargets(location, scope);
    if (!targets.length) return false;
    saveHistory();
    const previousSystemIndex = activeSystemIndex();
    const selectedIds = [];
    targets.forEach(({ anchor, systemIndex }) => {
      selectedIds.push(upsertArticulationAtAnchor(item, anchor, systemIndex));
    });
    setActiveSystemIndex(previousSystemIndex);
    state.selectedMarkIds = selectedIds.filter(Boolean);
    render();
    return true;
  }

  function selectedTempoMarks() {
    return Marks.selectedTempo(state.marks, state.selectedMarkIds);
  }

  function replaceSelectedTempoMarks(markData) {
    const marks = selectedTempoMarks();
    if (!marks.length || !markData?.type) return false;
    saveHistory();
    marks.forEach((mark) => {
      mark.type = markData.type;
      if (markData.type === "tempo") {
        mark.unitDurationId = markData.unitDurationId;
        mark.dots = markData.dots || 0;
        mark.value = markData.value;
        delete mark.text;
      } else if (markData.type === "tempo-text") {
        mark.text = markData.text;
        delete mark.unitDurationId;
        delete mark.dots;
        delete mark.value;
      }
    });
    render();
    return true;
  }

  async function requestTempoMark(item) {
    const existing = selectedTempoMarks()[0];
    const value = await requestEditorPopup({
      title: item.label,
      initialValue: existing?.value || "82"
    });
    if (value === null) return;
    const normalized = String(value).trim();
    if (!normalized) return;
    const markData = {
      type: "tempo",
      unitDurationId: item.tempoUnit,
      dots: item.tempoDots || 0,
      value: normalized
    };
    if (replaceSelectedTempoMarks(markData)) return;
    insertMark(markData);
  }

  async function requestTempoText() {
    const existing = selectedTempoMarks()[0];
    const value = await requestEditorPopup({
      title: "Texto de tempo",
      initialValue: existing?.text || "Andante"
    });
    if (value === null) return;
    const text = String(value).trim();
    if (!text) return;
    const markData = { type: "tempo-text", text };
    if (replaceSelectedTempoMarks(markData)) return;
    insertMark(markData);
  }

  function measureGlyphUnits(text) {
    return IconHtml.measureGlyphUnits(text);
  }

  function isSmuflCharacter(char) {
    return IconHtml.isSmuflCharacter(char);
  }

  function escapeHtml(value) {
    return IconHtml.escapeHtml(value);
  }

  function iconLayersForSymbol(symbol, baseClass = "text-glyph") {
    return IconHtml.layersForSymbol(symbol, baseClass);
  }

  function iconLayerHtml(layers, dotted = false) {
    return IconHtml.layerHtml(layers, dotted);
  }

  function iconLayersForItem(item, baseClass = "text-glyph") {
    return IconHtml.layersForItem(item, baseClass);
  }

  function primaryIconLabel(button) {
    return IconHtml.primaryLabel(button);
  }

  function primaryIconId(element) {
    return IconHtml.primaryId(element);
  }

  function defaultIconTooltip(iconId, fallback = "") {
    return IconHtml.defaultTooltip(iconId, fallback, { palettes, durations, restPalette, durationById, durationShortcut });
  }

  function midiExtraToolItems() {
    return IconHtml.midiExtraToolItems();
  }

  function effectiveIconTooltip(iconId, fallback = "") {
    const config = resolvedIconConfig(iconId);
    return String(config.tooltip || "").trim() || defaultIconTooltip(iconId, fallback);
  }

  function applyIconTooltipToElement(element) {
    const iconId = element?.dataset?.iconId;
    if (!iconId) return;
    const tooltip = effectiveIconTooltip(iconId, element.dataset.defaultTooltip || element.dataset.iconLabel || primaryIconLabel(element));
    element.dataset.tooltip = tooltip;
    element.setAttribute("aria-label", tooltip);
    element.title = tooltip;
    if (element.dataset.iconLabelPrefix) {
      element.dataset.iconLabel = `${element.dataset.iconLabelPrefix} · ${tooltip}`;
    }
  }

  function ensurePrimaryIconMetadata() {
    [
      ...document.querySelectorAll(".editor-workbench .icon-chip.music-icon"),
      ...document.querySelectorAll(".editor-workbench .edit-controls button"),
      ...document.querySelectorAll(".editor-workbench .grid-control")
    ].forEach((button) => {
      if (!button.dataset.defaultTooltip) button.dataset.defaultTooltip = primaryIconLabel(button);
      button.dataset.iconId = primaryIconId(button);
      button.dataset.iconLabelPrefix = "Principal";
      button.dataset.iconLabel = `Principal · ${effectiveIconTooltip(button.dataset.iconId, button.dataset.defaultTooltip)}`;
      const comboLayers = [...button.querySelectorAll(".icon-combo > span")];
      if (comboLayers.length) {
        comboLayers.forEach((node, index) => {
          node.dataset.iconLayer = index === 0 ? "music-1" : `text-${index}`;
        });
        applyIconTooltipToElement(button);
        return;
      }
      const staffIcon = button.querySelector(".staff-icon");
      if (staffIcon) {
        staffIcon.dataset.iconLayer = "staff-1";
        applyIconTooltipToElement(button);
        return;
      }
      const direct = button.matches(".grid-control")
        ? button.querySelector(":scope > span")
        : button.querySelector(":scope > span, :scope > svg");
      if (direct) direct.dataset.iconLayer = direct.tagName === "svg" ? "svg-1" : "default";
      applyIconTooltipToElement(button);
    });
  }

  function ensureMidiIconMetadata() {
    if (midiChordButton) {
      midiChordButton.dataset.iconId = "midi:chord-toggle";
      midiChordButton.dataset.defaultTooltip = midiChordButton.dataset.defaultTooltip || "Modo acorde del teclado MIDI";
      midiChordButton.dataset.iconLabelPrefix = "Teclado MIDI";
      midiChordButton.dataset.iconLabel = `Teclado MIDI · ${effectiveIconTooltip("midi:chord-toggle", "Acorde")}`;
      midiChordButton.dataset.iconLayer = "default";
      applyIconTooltipToElement(midiChordButton);
    }
    midiFigureStrip?.querySelectorAll("button[data-icon-id]").forEach((button) => {
      if (!button.dataset.defaultTooltip) button.dataset.defaultTooltip = button.getAttribute("aria-label") || button.title || "Icono";
      button.dataset.iconLabelPrefix = "Teclado MIDI";
      button.dataset.iconLabel = `Teclado MIDI · ${effectiveIconTooltip(button.dataset.iconId, button.dataset.defaultTooltip)}`;
      button.querySelectorAll("[data-icon-layer]").forEach((layer, index) => {
        if (!layer.dataset.iconLayer) layer.dataset.iconLayer = `layer-${index + 1}`;
      });
      applyIconTooltipToElement(button);
    });
  }

  function iconRegistry() {
    ensurePrimaryIconMetadata();
    ensureMidiIconMetadata();
    const visibleIcons = [
      ...document.querySelectorAll(".editor-workbench [data-icon-id]")
    ].map((button) => ({
      id: button.dataset.iconId || primaryIconId(button),
      label: button.dataset.iconLabel || `Icono · ${primaryIconLabel(button)}`,
      layers: iconLayerIdsForButton(button)
    }));
    const drawer = Object.entries(palettes).flatMap(([paletteId, items]) => (
      items.map((item) => {
      const baseClass = item.symbolClass || (item.music ? "music-glyph" : "text-glyph");
      const layers = iconLayersForItem(item, baseClass);
      const iconId = `drawer:${paletteId}:${item.id}`;
      return {
        id: iconId,
        label: `Desplegable · ${effectiveIconTooltip(iconId, item.label)}`,
        layers: layers.map((layer) => layer.id)
      };
      })
    ));
    const seen = new Set();
    return [...visibleIcons, ...drawer].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  function iconLayerIdsForButton(button) {
    return IconHtml.layerIdsForButton(button);
  }

  function iconConfig(iconId) {
    if (!iconAppearance[iconId]) iconAppearance[iconId] = {};
    if (!iconAppearance[iconId].layers) iconAppearance[iconId].layers = {};
    return iconAppearance[iconId];
  }

  function iconLayerConfig(iconId, layerId) {
    const config = iconConfig(iconId);
    if (!config.layers[layerId]) config.layers[layerId] = {};
    return config.layers[layerId];
  }

  function mergeIconAppearanceConfig(base = {}, override = {}) {
    return IconHtml.mergeAppearanceConfig(base, override);
  }

  function factoryIconConfig(iconId) {
    const tooltip = String(
      FACTORY_ICON_APPEARANCE_OVERRIDES[iconId]?.tooltip ||
      FACTORY_ICON_APPEARANCE[iconId]?.tooltip ||
      ""
    ).trim();
    return tooltip ? { tooltip, layers: {} } : { layers: {} };
  }

  function resolvedIconConfig(iconId) {
    const tooltip = String(iconAppearance[iconId]?.tooltip || factoryIconConfig(iconId).tooltip || "").trim();
    return tooltip ? { tooltip, layers: {} } : { layers: {} };
  }

  function resolvedIconLayerConfig(iconId, layerId) {
    return resolvedIconConfig(iconId).layers?.[layerId] || {};
  }

  function numericIconSetting(value, fallback = 0) {
    return IconHtml.numericSetting(value, fallback);
  }

  function iconLayerNodesForElement(element) {
    return IconHtml.layerNodesForElement(element);
  }

  function iconTextLayerNodes(button) {
    return IconHtml.textLayerNodes(button);
  }

  function setButtonIconBaseFontSize(button, size) {
    const numericSize = Math.max(1, Number(size) || 16);
    [
      ...button.querySelectorAll(":scope > span"),
      ...iconTextLayerNodes(button)
    ].forEach((node) => {
      node.dataset.baseIconFontSize = String(numericSize);
      node.style.setProperty("font-size", `${numericSize}px`, "important");
    });
  }

  function iconBaseFontSize(layerNode) {
    return IconHtml.baseFontSize(layerNode, 16);
  }

  function applyIconAppearanceToButton(button) {
    const iconId = button.dataset.iconId;
    if (!iconId) return;
    applyIconTooltipToElement(button);
  }

  function applyIconAppearance() {
    document.querySelectorAll("[data-icon-id]").forEach(applyIconAppearanceToButton);
  }

  function fitIconGlyphs() {
    const buttons = [
      ...document.querySelectorAll(".editor-workbench .icon-chip.music-icon"),
      ...document.querySelectorAll(".editor-workbench .duration-icons button"),
      ...document.querySelectorAll(".editor-workbench .duration-icons .palette-control"),
      ...document.querySelectorAll(".editor-workbench .grid-control"),
      ...document.querySelectorAll(".editor-workbench .playback-bpm-control"),
      ...document.querySelectorAll(".editor-workbench .edit-controls button"),
      ...document.querySelectorAll(".midi-figure-strip button"),
      ...document.querySelectorAll(".midi-chord-toggle")
    ];
    MenuRenderer.renderControls(buttons);
    applyIconAppearance();
  }

  let responsiveRenderFrame = null;

  function scheduleIconFit() {
    requestAnimationFrame(fitIconGlyphs);
  }

  function scheduleResponsiveRender() {
    if (responsiveRenderFrame !== null) cancelAnimationFrame(responsiveRenderFrame);
    responsiveRenderFrame = requestAnimationFrame(() => {
      responsiveRenderFrame = null;
      invalidateLayoutCache();
      render();
    });
  }

  function renderScenePalette() {
    durationTools.innerHTML = "";
    const makeButton = (label, title, onClick, options = {}) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.paletteItem = options.id || label;
      button.dataset.iconId = `drawer:scenes:${options.id || label}`;
      button.dataset.defaultTooltip = title;
      button.dataset.iconLabelPrefix = "Desplegable";
      button.dataset.iconLabel = `Desplegable · ${title}`;
      button.classList.add("palette-scenes", `item-${options.id || "scene"}`);
      if (options.active) button.classList.add("is-active");
      if (options.disabled) button.disabled = true;
      button.innerHTML = iconLayerHtml([{ id: "default", text: label, className: "text-glyph" }]);
      button.addEventListener("click", onClick);
      applyIconTooltipToElement(button);
      durationTools.appendChild(button);
      return button;
    };
    const selectedIndex = activeSceneFromSelect()?.index ?? -1;
    const hasScenes = currentExerciseScenes.length > 0;
    makeButton("Cam.", "Guardar escena", captureSceneSnapshot, { id: "capture" });
    makeButton("‹", "Escena anterior", () => navigateScene(-1), {
      id: "previous",
      disabled: !hasScenes || selectedIndex <= 0
    });
    if (!hasScenes) {
      const label = document.createElement("strong");
      label.dataset.paletteItem = "empty";
      label.dataset.iconId = "drawer:scenes:empty";
      label.dataset.defaultTooltip = "Sin escenas guardadas";
      label.dataset.iconLabelPrefix = "Desplegable";
      label.dataset.iconLabel = "Desplegable · Sin escenas guardadas";
      label.dataset.iconLayer = "default";
      label.classList.add("palette-scenes", "palette-control", "scene-empty-label");
      label.textContent = "Sin escenas";
      durationTools.appendChild(label);
    } else {
      currentExerciseScenes.forEach((scene, index) => {
        makeButton(String(index + 1), scene.title, () => restoreSceneByIndex(index), {
          id: `scene-${index + 1}`,
          active: index === activeSceneIndex
        });
      });
    }
    makeButton("›", "Escena siguiente", () => navigateScene(1), {
      id: "next",
      disabled: !hasScenes || selectedIndex >= currentExerciseScenes.length - 1
    });
    makeButton("Act.", "Reescribir escena seleccionada", overwriteSelectedScene, {
      id: "overwrite",
      disabled: !hasScenes
    });
    makeButton("↑", "Mover escena antes", () => moveSelectedScene(-1), {
      id: "move-up",
      disabled: !hasScenes || selectedIndex <= 0
    });
    makeButton("↓", "Mover escena después", () => moveSelectedScene(1), {
      id: "move-down",
      disabled: !hasScenes || selectedIndex >= currentExerciseScenes.length - 1
    });
    makeButton("Borr.", "Borrar escena seleccionada", deleteSelectedScene, {
      id: "delete",
      disabled: !hasScenes
    });
    makeButton(sceneNavigationMode === "exercise" ? "Ej." : "Rep.", "Cambiar modo repaso/ejercicio", () => {
      setSceneNavigationMode(sceneNavigationMode === "exercise" ? "review" : "exercise");
    }, { id: "mode", active: sceneNavigationMode === "exercise" });
    applyIconAppearance();
    scheduleIconFit();
  }

  function renderPalette(paletteId = "figures") {
    if (paletteId === "scenes") {
      renderScenePalette();
      return;
    }
    const items = palettes[paletteId] || palettes.figures;
    durationTools.innerHTML = "";
    items.forEach((item) => {
      if (item.selectionClassPicker) {
        const label = document.createElement("label");
        label.dataset.paletteItem = item.id;
        label.dataset.iconId = `drawer:${paletteId}:${item.id}`;
        label.dataset.defaultTooltip = item.label;
        label.dataset.iconLabelPrefix = "Desplegable";
        label.dataset.iconLabel = `Desplegable · ${effectiveIconTooltip(label.dataset.iconId, item.label)}`;
        label.classList.add(`palette-${paletteId}`, `item-${item.id}`, "palette-control", "palette-select-control");
        applyIconTooltipToElement(label);
        const text = document.createElement("span");
        text.className = "text-glyph";
        text.dataset.iconLayer = "default";
        text.textContent = "Clase";
        const select = document.createElement("select");
        select.innerHTML = [
          ["", "Tipo..."],
          ["notes", "Notas"],
          ["rests", "Silencios"],
          ["chords", "Acordes"],
          ["chord-symbols", "Cifrados"],
          ["dynamics", "Dinámicas"],
          ["text", "Textos"],
          ["slurs", "Ligaduras"],
          ["articulations", "Articulaciones"],
          ["bars", "Barras"],
          ["endings", "Casillas"],
          ["clefs", "Claves"],
          ["tempo", "Tempo"]
        ].map(([value, labelText]) => `<option value="${value}">${labelText}</option>`).join("");
        select.addEventListener("change", () => {
          if (select.value) selectClass(select.value);
          select.value = "";
        });
        label.append(text, select);
        durationTools.appendChild(label);
        return;
      }
      if (item.selectionDurationPicker) {
        const label = document.createElement("label");
        label.dataset.paletteItem = item.id;
        label.dataset.iconId = `drawer:${paletteId}:${item.id}`;
        label.dataset.defaultTooltip = item.label;
        label.dataset.iconLabelPrefix = "Desplegable";
        label.dataset.iconLabel = `Desplegable · ${effectiveIconTooltip(label.dataset.iconId, item.label)}`;
        label.classList.add(`palette-${paletteId}`, `item-${item.id}`, "palette-control", "palette-select-control");
        applyIconTooltipToElement(label);
        const text = document.createElement("span");
        text.className = "text-glyph";
        text.dataset.iconLayer = "default";
        text.textContent = "Figura";
        const select = document.createElement("select");
        select.innerHTML = [
          ["", "Figura..."],
          ...durationSelectionOptions()
        ].map(([value, labelText]) => `<option value="${value}">${labelText}</option>`).join("");
        select.addEventListener("change", () => {
          if (select.value) selectDurationClass(select.value);
          select.value = "";
        });
        label.append(text, select);
        durationTools.appendChild(label);
        return;
      }
      if (item.colorPicker) {
        const label = document.createElement("label");
        label.dataset.paletteItem = item.id;
        label.dataset.iconId = `drawer:${paletteId}:${item.id}`;
        label.dataset.defaultTooltip = item.label;
        label.dataset.iconLabelPrefix = "Desplegable";
        label.dataset.iconLabel = `Desplegable · ${effectiveIconTooltip(label.dataset.iconId, item.label)}`;
        label.classList.add(`palette-${paletteId}`, `item-${item.id}`, "palette-control", "palette-color-control");
        applyIconTooltipToElement(label);
        const text = document.createElement("span");
        text.className = "text-glyph";
        text.dataset.iconLayer = "default";
        text.textContent = item.symbol || item.label;
        const input = document.createElement("input");
        input.id = "itemColorInput";
        input.type = "color";
        input.value = selectedItemColor();
        input.addEventListener("input", () => applySelectedItemColor(input.value));
        label.append(text, input);
        durationTools.appendChild(label);
        return;
      }
      if (item.zoomLabel) {
        const label = document.createElement("strong");
        label.id = "zoomLabel";
        label.dataset.paletteItem = item.id;
        label.dataset.iconId = `drawer:${paletteId}:${item.id}`;
        label.dataset.defaultTooltip = item.label;
        label.dataset.iconLabelPrefix = "Desplegable";
        label.dataset.iconLabel = `Desplegable · ${effectiveIconTooltip(label.dataset.iconId, item.label)}`;
        label.dataset.iconLayer = "default";
        label.classList.add(`palette-${paletteId}`, `item-${item.id}`, "palette-control", "zoom-label");
        applyIconTooltipToElement(label);
        label.textContent = `${Math.round((state.zoom || 1) * 100)}%`;
        durationTools.appendChild(label);
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.paletteItem = item.id;
      button.dataset.iconId = `drawer:${paletteId}:${item.id}`;
      button.dataset.defaultTooltip = item.label;
      button.dataset.iconLabelPrefix = "Desplegable";
      button.dataset.iconLabel = `Desplegable · ${effectiveIconTooltip(button.dataset.iconId, item.label)}`;
      button.classList.add(`palette-${paletteId}`, `item-${item.id}`);
      if (item.ticks) button.classList.add("palette-note-duration");
      if (item.restDurationId) button.classList.add("palette-rest-duration");
      if (item.clefId) button.classList.add("palette-clef");
      if (item.tuplet) button.classList.add("palette-tuplet");
      if (item.ticks) {
        button.dataset.duration = item.id;
        button.dataset.entryKind = "note";
      }
      if (item.restDurationId) {
        button.dataset.duration = item.restDurationId;
        button.dataset.entryKind = "rest";
      }
      if (item.customTuplet) button.dataset.customTuplet = "true";
      if (item.noteInputModifier) {
        button.dataset.noteInputModifier = item.noteInputModifier;
        button.classList.toggle("is-active", syncInputSession().input[item.noteInputModifier] === true);
      }
      if (item.line2Toggle) {
        button.dataset.line2Toggle = "true";
        button.classList.toggle("is-active", state.line2Mode === true);
      }
      if (Number.isFinite(item.voiceMode)) {
        button.dataset.voiceMode = String(item.voiceMode);
        button.classList.toggle("is-active", activeVoice() === Number(item.voiceMode));
      }
      if (item.jazzSwingPreset) {
        button.dataset.jazzSwingPreset = normalizeJazzSwingPreset(item.jazzSwingPreset);
        button.classList.toggle(
          "is-active",
          state.jazzMode === true && button.dataset.jazzSwingPreset === normalizeJazzSwingPreset(state.jazzSwingPreset)
        );
      }
      if (item.tuplet) {
        button.dataset.tupletActual = String(item.tuplet.actual);
        button.dataset.tupletNormal = String(item.tuplet.normal);
        button.dataset.tupletUnit = item.tuplet.unitDurationId;
        button.classList.toggle("is-active", sameTupletConfig(state.activeTuplet, item.tuplet));
      }
      const symbolClass = item.symbolClass || (item.music ? "music-glyph" : "text-glyph");
      button.innerHTML = iconLayerHtml(iconLayersForItem(item, symbolClass), item.dotted);
      applyIconTooltipToElement(button);
      if (item.ticks) {
        button.addEventListener("click", () => selectFigureDuration(item));
      } else if (item.restDurationId) {
        button.addEventListener("click", () => selectRestDuration(item));
      } else if (item.dotCount) {
        button.addEventListener("click", () => addDotsToPreviousFigure(item.dotCount));
      } else if (item.tieAction === "prolongation") {
        button.addEventListener("click", toggleDurationTieFromCurrentNote);
      } else if (item.slurType) {
        button.addEventListener("click", () => applyPhraseSlurType(item.slurType));
      } else if (item.markType) {
        button.addEventListener("click", () => insertNotationMark(item));
      } else if (item.tuplet) {
        button.addEventListener("click", () => activateTuplet(item.tuplet));
      } else if (item.customTuplet) {
        button.addEventListener("click", requestCustomTuplet);
      } else if (item.stopTuplet) {
        button.addEventListener("click", () => {
          deactivateTupletWriting();
          state.pendingTupletRatio = null;
          render();
        });
      } else if (item.noteInputModifier) {
        button.addEventListener("click", () => {
          if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
          toggleNoteInputModifier(item.noteInputModifier);
        });
      } else if (item.meter) {
        button.addEventListener("click", () => setMeter(item.meter));
      } else if (item.amalgamMeter) {
        button.addEventListener("click", requestAmalgamMeter);
      } else if (item.tempoUnit) {
        button.addEventListener("click", () => requestTempoMark(item));
      } else if (item.tempoText) {
        button.addEventListener("click", requestTempoText);
      } else if (item.jazzSwingPreset) {
        button.addEventListener("click", () => setJazzSwingPreset(item.jazzSwingPreset));
      } else if (item.clefId) {
        button.addEventListener("click", () => insertClefChange(item));
      } else if (item.barlineType) {
        button.addEventListener("click", () => applyBarline(item));
      } else if (item.ending) {
        button.addEventListener("click", () => applyEnding(item));
      } else if (item.chordTool) {
        button.addEventListener("click", async () => {
          if (item.chordTool === "auto-drops") {
            if (await requestAutoDropConfig()) await applyChordTool(item.chordTool);
          } else if (item.chordTool === "auto-skips") {
            if (await requestAutoSkipConfig()) await applyChordTool(item.chordTool);
          } else {
            await applyChordTool(item.chordTool);
          }
        });
      } else if (item.selectionAction) {
        button.addEventListener("click", () => applySelectionAction(item.selectionAction));
      } else if (Number.isFinite(item.voiceMode)) {
        button.addEventListener("click", () => setVoiceMode(item.voiceMode));
      } else if (item.line2Toggle) {
        button.addEventListener("click", toggleLine2Mode);
      } else if (item.measureAction === "add") {
        button.addEventListener("click", insertMeasureAfterSelection);
      } else if (item.measureAction === "remove") {
        button.addEventListener("click", removeSelectedMeasure);
      } else if (item.measureAction === "hide") {
        button.id = "hideMeasureButton";
        button.addEventListener("click", toggleSelectedMeasureHidden);
      } else if (Number.isFinite(item.zoomAction)) {
        button.addEventListener("click", () => zoomBy(item.zoomAction));
      } else if (item.systemAction === "add-staff") {
        button.addEventListener("click", addStaffSystem);
      } else if (item.systemAction === "add-percussion-line") {
        button.addEventListener("click", addPercussionLineSystem);
      } else if (item.systemAction === "remove-active") {
        button.addEventListener("click", removeActiveSystem);
      } else {
        button.classList.add("is-preview-only");
      }
      durationTools.appendChild(button);
    });
    if (paletteId === "figures") setDuration(state.activeDuration, { keepTuplet: true });
    applyIconAppearance();
    scheduleIconFit();
  }

  function renderKeySignature(root, signature = state.keySignature, xOverride = null, options = {}) {
    const count = keySignatureAccidentalCount(signature);
    if (!count || !["sharp", "flat"].includes(signature?.accidental)) return;
    const glyphName = keySignatureGlyphName(signature);
    const x0 = Number.isFinite(xOverride) ? xOverride : keySignatureStartX();
    const gap = appearanceValue("keySignatureAccidentalGap");
    const yOffset = appearanceValue("keySignatureOffsetY");
    const clefId = options.clefId || initialClefId();
    for (let index = 0; index < count; index += 1) {
      root.appendChild(glyphTextCentered(
        glyphName,
        x0 + index * gap,
        pitchY(keySignatureStaffStep(signature, index, clefId)) + yOffset,
        {
          class: "music-glyph key-signature",
          "font-size": musicGlyphSize("keySignatureScale"),
          style: musicFontStyle("musicGlyphFont")
        }
      ));
    }
  }

  function openPalette(trigger) {
    if (!durationDrawer || !trigger) return;
    const paletteId = trigger.dataset.palette || "figures";
    const wasOpen = !durationDrawer.classList.contains("is-hidden");
    const wasSamePalette = durationDrawer.dataset.activePalette === paletteId;
    paletteTriggers.forEach((button) => {
      button.classList.remove("is-active");
      button.setAttribute("aria-expanded", "false");
    });

    if (wasOpen && wasSamePalette) {
      durationDrawer.classList.add("is-hidden");
      delete durationDrawer.dataset.activePalette;
      delete document.documentElement.dataset.editorPalette;
      updateModeButtons();
      return;
    }

    if (paletteId === "figures") {
      enterFigureWritingMode();
      render();
    }
    renderPalette(paletteId);
    durationDrawer.dataset.activePalette = paletteId;
    document.documentElement.dataset.editorPalette = paletteId;
    durationDrawer.classList.remove("is-hidden");
    trigger.classList.add("is-active");
    trigger.setAttribute("aria-expanded", "true");
    updateModeButtons();
    if (appearanceAdminIsVisible()) renderIconAppearancePanel({ force: true });
  }

  function entryStaffStep(entry) {
    if (Number.isFinite(entry.staffStep)) return entry.staffStep;
    if (Number.isFinite(entry.pitchStep)) return 4 - entry.pitchStep;
    return 0;
  }

  function entryStaffSteps(entry) {
    if (Array.isArray(entry.chordSteps) && entry.chordSteps.length) {
      return entry.chordSteps.filter(Number.isFinite);
    }
    return [entryStaffStep(entry)];
  }

  function entryDiatonicSteps(entry) {
    if (!entry || entry.type === "rest") return [];
    if (Array.isArray(entry.chordDiatonicSteps) && entry.chordDiatonicSteps.length) {
      return entry.chordDiatonicSteps.filter(Number.isFinite);
    }
    if (Number.isFinite(entry.diatonicStep)) return [entry.diatonicStep];
    return [];
  }

  function entryDiatonicStepForStaffStep(entry, staffStep) {
    const staffSteps = entryStaffSteps(entry);
    const diatonicSteps = entryDiatonicSteps(entry);
    const index = staffSteps.findIndex((step) => Math.abs(step - staffStep) < EPSILON);
    if (index >= 0 && Number.isFinite(diatonicSteps[index])) return diatonicSteps[index];
    return diatonicStepForStaffStep(staffStep, entryClefId(entry));
  }

  function entryClefId(entry, fallbackAbsoluteTick = null) {
    const location = entryLocationById(entry?.id);
    const absoluteTick = location
      ? absoluteTickForLocation(location)
      : Number.isFinite(fallbackAbsoluteTick)
        ? fallbackAbsoluteTick
        : cursorAbsoluteTick();
    return clefIdAtAbsoluteTick(absoluteTick);
  }

  function ensureEntryPitchData(entry, absoluteTick = null, options = {}) {
    if (!entry || entry.type === "rest") return;
    if (contextSystemIsPercussionLine()) {
      normalizePercussionEntry(entry);
      return;
    }
    const clefId = entryClefId(entry, absoluteTick);
    const staffSteps = entryStaffSteps(entry);
    const force = options.force === true;
    const hasPitchData = staffSteps.length > 1
      ? Array.isArray(entry.chordDiatonicSteps) &&
        entry.chordDiatonicSteps.length === staffSteps.length &&
        entry.chordDiatonicSteps.every(Number.isFinite)
      : Number.isFinite(entry.diatonicStep);
    if (force || !hasPitchData) {
      const diatonicSteps = staffSteps.map((staffStep) => diatonicStepForStaffStep(staffStep, clefId));
      entry.diatonicStep = diatonicSteps[0] ?? 0;
      if (diatonicSteps.length > 1) entry.chordDiatonicSteps = diatonicSteps;
      else delete entry.chordDiatonicSteps;
    } else if (!Number.isFinite(entry.diatonicStep) && Array.isArray(entry.chordDiatonicSteps)) {
      entry.diatonicStep = entry.chordDiatonicSteps[0];
    }

    if (Number.isFinite(entry.tieStaffStep) && (force || !Number.isFinite(entry.tieDiatonicStep))) {
      entry.tieDiatonicStep = diatonicStepForStaffStep(entry.tieStaffStep, clefId);
    }

    if (force || !entry.accidentalsByDiatonicStep) {
      const accidentalsByDiatonicStep = {};
      if (entry.accidentalsByStep) {
        Object.entries(entry.accidentalsByStep).forEach(([staffStep, accidental]) => {
          if (accidental) {
            accidentalsByDiatonicStep[String(diatonicStepForStaffStep(Number(staffStep), clefId))] = accidental;
          }
        });
      }
      if (entry.accidental) {
        accidentalsByDiatonicStep[String(diatonicStepForStaffStep(entryStaffStep(entry), clefId))] = entry.accidental;
      }
      if (Object.keys(accidentalsByDiatonicStep).length) entry.accidentalsByDiatonicStep = accidentalsByDiatonicStep;
    }
  }

  function ensureAllPitchData(options = {}) {
    state.measures.forEach((measure, measureIndex) => {
      measure.entries.forEach((entry) => {
        ensureEntryPitchData(entry, measureStartAbsoluteTick(measureIndex) + entry.tickStart, options);
      });
    });
  }

  function setEntryDiatonicStepsFromStaffSteps(entry, staffSteps = entryStaffSteps(entry), absoluteTick = null) {
    if (!entry || entry.type === "rest") return;
    if (contextSystemIsPercussionLine()) {
      normalizePercussionEntry(entry);
      return;
    }
    const clefId = entryClefId(entry, absoluteTick);
    const diatonicSteps = staffSteps.map((staffStep) => diatonicStepForStaffStep(staffStep, clefId));
    entry.diatonicStep = diatonicSteps[0] ?? 0;
    if (diatonicSteps.length > 1) entry.chordDiatonicSteps = diatonicSteps;
    else delete entry.chordDiatonicSteps;
    if (Number.isFinite(entry.tieStaffStep)) {
      entry.tieDiatonicStep = diatonicStepForStaffStep(entry.tieStaffStep, clefId);
    }
  }

  function applyClefSpellingToEntry(entry, absoluteTick) {
    if (!entry || entry.type === "rest") return;
    if (contextSystemIsPercussionLine()) {
      normalizePercussionEntry(entry);
      return;
    }
    ensureEntryPitchData(entry, absoluteTick);
    const clefId = clefIdAtAbsoluteTick(absoluteTick);
    const diatonicSteps = entryDiatonicSteps(entry);
    if (!diatonicSteps.length) return;
    const staffSteps = diatonicSteps.map((diatonicStep) => staffStepForDiatonicStep(diatonicStep, clefId));
    entry.staffStep = staffSteps[0] ?? 0;
    if (staffSteps.length > 1) entry.chordSteps = staffSteps;
    else delete entry.chordSteps;

    if (entry.accidentalsByDiatonicStep) {
      const nextAccidentalsByStep = {};
      Object.entries(entry.accidentalsByDiatonicStep).forEach(([diatonicStep, accidental]) => {
        if (accidental) {
          nextAccidentalsByStep[String(staffStepForDiatonicStep(Number(diatonicStep), clefId))] = accidental;
        }
      });
      if (Object.keys(nextAccidentalsByStep).length) entry.accidentalsByStep = nextAccidentalsByStep;
      else delete entry.accidentalsByStep;
      entry.accidental = nextAccidentalsByStep[String(entry.staffStep)] || null;
    }

    if (Number.isFinite(entry.tieDiatonicStep)) {
      entry.tieStaffStep = staffStepForDiatonicStep(entry.tieDiatonicStep, clefId);
    } else if (Number.isFinite(entry.tieStaffStep)) {
      entry.tieStaffStep = nearestEntryStaffStep(entry, entry.tieStaffStep);
    }
  }

  function applyClefSpellingToEntries() {
    ensureAllPitchData();
    state.measures.forEach((measure, measureIndex) => {
      measure.entries.forEach((entry) => {
        applyClefSpellingToEntry(entry, measureStartAbsoluteTick(measureIndex) + entry.tickStart);
      });
    });
  }

  function getEntryAccidental(entry, staffStep) {
    const keyedAccidental = entry.accidentalsByStep?.[String(staffStep)];
    if (keyedAccidental) return keyedAccidental;
    return staffStep === entryStaffStep(entry) ? entry.accidental : null;
  }

  function setAutomaticAccidentals(entry, accidentalsByStep) {
    delete entry.__autoAccidentalsByStep;
    if (!accidentalsByStep || !Object.keys(accidentalsByStep).length) return;
    Object.defineProperty(entry, "__autoAccidentalsByStep", {
      configurable: true,
      enumerable: false,
      value: accidentalsByStep,
      writable: true
    });
  }

  function getAutomaticAccidental(entry, staffStep) {
    return entry.__autoAccidentalsByStep?.[String(staffStep)] || null;
  }

  function setHiddenAccidentals(entry, accidentalsByStep) {
    delete entry.__hiddenAccidentalsByStep;
    if (!accidentalsByStep || !Object.keys(accidentalsByStep).length) return;
    Object.defineProperty(entry, "__hiddenAccidentalsByStep", {
      configurable: true,
      enumerable: false,
      value: accidentalsByStep,
      writable: true
    });
  }

  function isAccidentalHidden(entry, staffStep) {
    return entry.__hiddenAccidentalsByStep?.[String(staffStep)] === true;
  }

  function getEntryDisplayAccidental(entry, staffStep) {
    if (isAccidentalHidden(entry, staffStep)) return null;
    return getEntryAccidental(entry, staffStep) || getAutomaticAccidental(entry, staffStep);
  }

  function accidentalBySemitone(value) {
    return KeySignatures.accidentalBySemitone(value);
  }

  function accidentalSemitone(accidental) {
    return KeySignatures.accidentalSemitone(accidental);
  }

  function entryKeySignature(entry) {
    const location = entryLocationById(entry?.id);
    return keySignatureForMeasureIndex(location?.measureIndex ?? state.cursorMeasure);
  }

  function effectiveEntryAccidental(entry, staffStep) {
    const explicitAccidental = getEntryAccidental(entry, staffStep);
    if (explicitAccidental) return explicitAccidental;
    const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
    return keySignatureAccidentalForDiatonicStep(diatonicStep, entryKeySignature(entry)) || "natural";
  }

  function diatonicAccidentalForMeasure(diatonicStep, measureIndex) {
    return keySignatureAccidentalForDiatonicStep(diatonicStep, keySignatureForMeasureIndex(measureIndex)) || "natural";
  }

  function refreshAutomaticAccidentals() {
    state.measures.forEach((measure, measureIndex) => {
      measure.entries.forEach((entry) => setAutomaticAccidentals(entry, null));
      measure.entries.forEach((entry) => setHiddenAccidentals(entry, null));
      const activeAccidentalByDiatonicStep = new Map();
      [...measure.entries]
        .sort((a, b) => (
          (Number(a.tickStart) || 0) - (Number(b.tickStart) || 0) ||
          entryVoice(a) - entryVoice(b) ||
          (measure.entries.indexOf(a) - measure.entries.indexOf(b))
        ))
        .forEach((entry) => {
        if (entry.type === "rest") return;
        const automaticAccidentals = {};
        const hiddenAccidentals = {};
        entryStaffSteps(entry).forEach((staffStep) => {
          const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
          const accidentalKey = String(diatonicStep);
          const diatonicAccidental = diatonicAccidentalForMeasure(diatonicStep, measureIndex);
          const previousAccidental = activeAccidentalByDiatonicStep.get(accidentalKey) || diatonicAccidental;
          const explicitAccidental = getEntryAccidental(entry, staffStep);
          const currentAccidental = explicitAccidental || diatonicAccidental;
          if (explicitAccidental) {
            if (previousAccidental === explicitAccidental) {
              hiddenAccidentals[String(staffStep)] = true;
            }
            activeAccidentalByDiatonicStep.set(accidentalKey, explicitAccidental);
            return;
          }
          if (previousAccidental !== currentAccidental) {
            automaticAccidentals[String(staffStep)] = currentAccidental;
          }
          activeAccidentalByDiatonicStep.set(accidentalKey, currentAccidental);
        });
        setAutomaticAccidentals(entry, automaticAccidentals);
        setHiddenAccidentals(entry, hiddenAccidentals);
      });
    });
  }

  function noteHeadOffset(entry, staffStep) {
    if (entry?.type === "rest") return 0;
    const direction = stemDirection(entry);
    const orderedSteps = [...entryStaffSteps(entry)].sort((a, b) => (
      direction > 0 ? b - a : a - b
    ));
    let previousStep = null;
    let clusterIndex = 0;
    const shouldFlip = orderedSteps.some((step) => {
      if (previousStep === null || Math.abs(step - previousStep) > 1 + EPSILON) {
        clusterIndex = 0;
      } else {
        clusterIndex += 1;
      }
      previousStep = step;
      return Math.abs(step - staffStep) < EPSILON && clusterIndex % 2 === 1;
    });
    if (!shouldFlip) return 0;

    const headName = entryNoteheadGlyphName(entry, staffStep);
    const box = glyphBBox(headName);
    const headWidth = (box.ne[0] - box.sw[0]) * SMUFL_SPACE;
    return (direction > 0 ? headWidth : -headWidth)
      + mirroredDirectionOffset("flippedSecondDistance", direction);
  }

  function stemXForEntry(entry, x, direction = stemDirection(entry)) {
    return stemAnchorPoint(entry, x, stemAnchorStep(entry, direction), direction).x;
  }

  function stemAnchorStep(entry, direction = stemDirection(entry)) {
    const steps = entryStaffSteps(entry);
    return direction > 0 ? Math.max(...steps) : Math.min(...steps);
  }

  function stemAnchorPoint(entry, x, staffStep, direction = stemDirection(entry)) {
    const headName = entryNoteheadGlyphName(entry, staffStep);
    const anchors = Smufl.glyphAnchors(SmuflData, headName);
    const anchor = anchors[direction > 0 ? "stemUpSE" : "stemDownNW"];
    const center = glyphCenter(headName);
    return {
      x: x + noteHeadOffset(entry, staffStep) + (anchor[0] - center.x) * SMUFL_SPACE,
      y: pitchY(staffStep) + (center.y - anchor[1]) * SMUFL_SPACE
    };
  }

  function rectsOverlap(a, b) {
    return Geometry.rectsOverlap
      ? Geometry.rectsOverlap(a, b)
      : a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function expandedRect(rect, padX = 0, padY = padX) {
    return Geometry.expandedRect
      ? Geometry.expandedRect(rect, padX, padY)
      : {
        left: rect.left - padX,
        right: rect.right + padX,
        top: rect.top - padY,
        bottom: rect.bottom + padY
      };
  }

  function pointInRect(point, rect) {
    return Geometry.pointInRect
      ? Geometry.pointInRect(point, rect)
      : point &&
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom;
  }

  function noteHeadRect(entry, baseX, staffStep) {
    const centerX = baseX + noteHeadOffset(entry, staffStep) + appearanceValue("noteheadOffsetX");
    const centerY = pitchY(staffStep) + appearanceValue("noteheadOffsetY");
    const glyphName = entryNoteheadGlyphName(entry, staffStep);
    const rect = glyphRectAt(glyphName, centerX, centerY, appearanceValue("noteheadScale"));
    return expandedRect(rect, 2, 2);
  }

  function unionRects(rects) {
    if (Geometry.unionRects) return Geometry.unionRects(rects);
    const validRects = rects.filter(Boolean);
    if (!validRects.length) return null;
    return validRects.reduce((acc, rect) => ({
      left: Math.min(acc.left, rect.left),
      right: Math.max(acc.right, rect.right),
      top: Math.min(acc.top, rect.top),
      bottom: Math.max(acc.bottom, rect.bottom)
    }), { ...validRects[0] });
  }

  function restGlyphNameForDuration(durationId) {
    return Durations.restGlyphNameForDuration(durationId);
  }

  function matchingRestInOtherVoice(measure, entry) {
    if (!measure || entry?.type !== "rest") return null;
    const voice = entryVoice(entry);
    return (measure.entries || []).find((candidate) => (
      candidate !== entry &&
      candidate.type === "rest" &&
      entryVoice(candidate) !== voice &&
      Math.abs(candidate.tickStart - entry.tickStart) < EPSILON &&
      Math.abs(candidate.ticks - entry.ticks) < EPSILON &&
      candidate.durationId === entry.durationId &&
      dotCountForEntry(candidate) === dotCountForEntry(entry)
    )) || null;
  }

  function restIsConsolidatedAcrossVoices(measure, entry) {
    return !!matchingRestInOtherVoice(measure, entry);
  }

  function shouldRenderRestEntry(measure, entry) {
    if (entry?.type !== "rest") return true;
    if (!restIsConsolidatedAcrossVoices(measure, entry)) return true;
    return state.line2Mode ? entryVoice(entry) === 2 : entryVoice(entry) === 1;
  }

  function restVoiceOffsetY(measure, entry) {
    if (entry?.type !== "rest") return 0;
    if (!measureHasVoiceLayers(measure)) return 0;
    if (restIsConsolidatedAcrossVoices(measure, entry)) return 0;
    return entryVoice(entry) === 2 ? STEP_HEIGHT * 4 : -STEP_HEIGHT * 4;
  }

  function glyphRectAt(glyphName, centerX, centerY, scale = 1) {
    const box = glyphBBox(glyphName);
    const center = glyphCenter(glyphName);
    const fontSize = musicGlyphSize() * scale;
    const factor = fontSize / 4;
    const originX = centerX - center.x * factor;
    const originY = centerY + center.y * factor;
    return {
      left: originX + box.sw[0] * factor,
      right: originX + box.ne[0] * factor,
      top: originY - box.ne[1] * factor,
      bottom: originY - box.sw[1] * factor
    };
  }

  function restRect(entry, x) {
    const duration = entryDuration(entry);
    const glyphName = restGlyphNameForDuration(duration.id);
    const measure = entryMeasure(entry);
    const centerY = pitchYForSystem(0, renderSystemIndex) +
      restVoiceOffsetY(measure, entry) +
      appearanceValue("restOffsetY") +
      restOpticalOffset(duration.id);
    return glyphRectAt(glyphName, x + appearanceValue("restOffsetX"), centerY, appearanceValue("restScale"));
  }

  function stemRect(entry, x) {
    const duration = entryDuration(entry);
    if (entry.type === "rest" || duration.id === "whole" || duration.id === "breve") return null;
    const staffSteps = entryStaffSteps(entry);
    const direction = stemDirection(entry);
    const outerStep = direction > 0 ? Math.max(...staffSteps) : Math.min(...staffSteps);
    const stemStart = stemAnchorPoint(entry, x, stemAnchorStep(entry, direction), direction);
    const stemEnd = pitchY(outerStep + direction * STEM_OCTAVE_STEPS);
    const stemX = visualStemX(stemStart.x, direction);
    const stemHalfWidth = Math.max(1.5, SMUFL_DEFAULTS.stemThickness * SMUFL_SPACE * appearanceValue("stemGlyphScaleX") / 2);
    return {
      left: stemX - stemHalfWidth,
      right: stemX + stemHalfWidth,
      top: Math.min(visualStemY(stemStart.y, direction), visualStemY(stemEnd, direction)),
      bottom: Math.max(visualStemY(stemStart.y, direction), visualStemY(stemEnd, direction))
    };
  }

  function dotRectForEntry(entry, x) {
    const dots = dotCountForEntry(entry);
    if (!dots) return null;
    if (entry.type === "rest") {
      const duration = entryDuration(entry);
      const centerX = x + appearanceValue("restOffsetX") + restVisualWidth(duration.id) / 2 + appearanceValue("dotGap");
      const centerY = pitchYForSystem(0, renderSystemIndex) - STEP_HEIGHT / 2 + appearanceValue("dotOffsetY");
      return {
        left: centerX - DOT_VISUAL_WIDTH / 2,
        right: centerX + DOT_VISUAL_WIDTH / 2 + (dots - 1) * (DOT_VISUAL_WIDTH + 4),
        top: centerY - DOT_VISUAL_WIDTH / 2,
        bottom: centerY + DOT_VISUAL_WIDTH / 2
      };
    }
    return unionRects(entryStaffSteps(entry).map((staffStep) => {
      const centerX = x + noteHeadOffset(entry, staffStep) + dotXOffset();
      const centerY = dotYForStaffStep(staffStep) + appearanceValue("dotOffsetY");
      return {
        left: centerX - DOT_VISUAL_WIDTH / 2,
        right: centerX + DOT_VISUAL_WIDTH / 2 + (dots - 1) * (DOT_VISUAL_WIDTH + 4),
        top: centerY - DOT_VISUAL_WIDTH / 2,
        bottom: centerY + DOT_VISUAL_WIDTH / 2
      };
    }));
  }

  function entryVisualRect(entry, x) {
    if (!entry) return null;
    if (entry.type === "rest") {
      return unionRects([restRect(entry, x), dotRectForEntry(entry, x)]);
    }

    const headRects = entryStaffSteps(entry).map((staffStep) => noteHeadRect(entry, x, staffStep));
    const accidentalRects = entryStaffSteps(entry)
      .map((staffStep) => {
        const accidental = getEntryDisplayAccidental(entry, staffStep);
        return accidental ? accidentalRect(entry, x, staffStep, accidentalXOffsetFor(entry, staffStep)) : null;
      })
      .filter(Boolean);
    return unionRects([...headRects, ...accidentalRects, stemRect(entry, x), dotRectForEntry(entry, x)]);
  }

  function entryWrittenElementContainsPoint(entry, x, point) {
    if (!point || !entry) return false;
    const rect = entryVisualRect(entry, x);
    return rect ? pointInRect(point, rect) : false;
  }

  function accidentalRect(entry, baseX, staffStep, xOffset) {
    const glyphName = accidentalGlyphName(getEntryDisplayAccidental(entry, staffStep));
    if (!glyphName) return { left: 0, right: 0, top: 0, bottom: 0 };
    const box = glyphBBox(glyphName);
    const center = glyphCenter(glyphName);
    const centerX = baseX + noteHeadOffset(entry, staffStep) + xOffset + appearanceValue("accidentalOffsetX");
    const originX = centerX - center.x * SMUFL_SPACE;
    const originY = pitchY(staffStep) + accidentalYOffset();
    return {
      left: originX + box.sw[0] * SMUFL_SPACE,
      right: originX + box.ne[0] * SMUFL_SPACE,
      top: originY - box.ne[1] * SMUFL_SPACE,
      bottom: originY - box.sw[1] * SMUFL_SPACE
    };
  }

  function accidentalStackRect(entry, baseX, staffStep, xOffset) {
    const rect = accidentalRect(entry, baseX, staffStep, xOffset);
    return {
      left: rect.left - appearanceValue("accidentalStackPadX"),
      right: rect.right + appearanceValue("accidentalStackPadX"),
      top: rect.top - appearanceValue("accidentalStackPadY"),
      bottom: rect.bottom + appearanceValue("accidentalStackPadY")
    };
  }

  function accidentalLayoutFor(entry) {
    const placedStackRects = [];
    const offsets = new Map();
    const accidentalSteps = entryStaffSteps(entry)
      .filter((staffStep) => getEntryDisplayAccidental(entry, staffStep))
      .sort((a, b) => b - a);

    accidentalSteps.forEach((staffStep) => {
      const glyphName = accidentalGlyphName(getEntryDisplayAccidental(entry, staffStep));
      let xOffset = accidentalBaseOffset(glyphName, entryNoteheadGlyphName(entry, staffStep));
      const otherHeadRects = entryStaffSteps(entry)
        .filter((step) => Math.abs(step - staffStep) > EPSILON)
        .map((step) => noteHeadRect(entry, 0, step));

      for (let tries = 0; tries < appearanceValue("accidentalCollisionTries"); tries += 1) {
        const fullRect = accidentalRect(entry, 0, staffStep, xOffset);
        const stackRect = accidentalStackRect(entry, 0, staffStep, xOffset);
        const hitsHead = otherHeadRects.some((headRect) => rectsOverlap(fullRect, headRect));
        const hitsAccidental = placedStackRects.some((placedRect) => rectsOverlap(stackRect, placedRect));
        if (!hitsHead && !hitsAccidental) break;
        xOffset -= appearanceValue("accidentalCollisionStep") + appearanceValue("accidentalColumnGap");
      }

      offsets.set(String(staffStep), xOffset);
      placedStackRects.push(accidentalStackRect(entry, 0, staffStep, xOffset));
    });

    return offsets;
  }

  function accidentalXOffsetFor(entry, staffStep) {
    const glyphName = accidentalGlyphName(getEntryDisplayAccidental(entry, staffStep));
    return accidentalLayoutFor(entry).get(String(staffStep)) ?? accidentalBaseOffset(glyphName, entryNoteheadGlyphName(entry, staffStep));
  }

  function nearestEntryStaffStep(entry, targetStep) {
    return entryStaffSteps(entry).reduce((nearest, step) => (
      Math.abs(step - targetStep) < Math.abs(nearest - targetStep) ? step : nearest
    ), entryStaffStep(entry));
  }

  function setEntryAccidental(entry, staffStep, accidental) {
    if (!entry.accidentalsByStep) entry.accidentalsByStep = {};
    entry.accidentalsByStep[String(staffStep)] = accidental;
    if (staffStep === entryStaffStep(entry)) entry.accidental = accidental;
    if (entry?.type === "note") {
      const diatonicStep = diatonicStepForStaffStep(staffStep, entryClefId(entry));
      if (!entry.accidentalsByDiatonicStep) entry.accidentalsByDiatonicStep = {};
      entry.accidentalsByDiatonicStep[String(diatonicStep)] = accidental;
    }
  }

  function clearEntryAccidental(entry, staffStep) {
    if (!entry) return;
    if (entry.accidentalsByStep) {
      delete entry.accidentalsByStep[String(staffStep)];
      if (!Object.keys(entry.accidentalsByStep).length) delete entry.accidentalsByStep;
    }
    if (entry.accidentalsByDiatonicStep && entry.type === "note") {
      const diatonicStep = diatonicStepForStaffStep(staffStep, entryClefId(entry));
      delete entry.accidentalsByDiatonicStep[String(diatonicStep)];
      if (!Object.keys(entry.accidentalsByDiatonicStep).length) delete entry.accidentalsByDiatonicStep;
    }
    if (Math.abs(entryStaffStep(entry) - staffStep) < EPSILON) entry.accidental = null;
  }

  function setEntryStaffSteps(entry, staffSteps) {
    const uniqueSteps = [];
    staffSteps.forEach((step) => {
      if (Number.isFinite(step) && !uniqueSteps.includes(step)) uniqueSteps.push(step);
    });
    const previousClefAbsoluteTick = entryLocationById(entry?.id)
      ? absoluteTickForLocation(entryLocationById(entry.id))
      : null;
    entry.staffStep = uniqueSteps[0] ?? 0;
    if (uniqueSteps.length > 1) {
      entry.chordSteps = uniqueSteps;
    } else {
      delete entry.chordSteps;
    }
    setEntryDiatonicStepsFromStaffSteps(entry, uniqueSteps, previousClefAbsoluteTick);
    if (entry.accidentalsByStep) {
      Object.keys(entry.accidentalsByStep).forEach((step) => {
        if (!uniqueSteps.includes(Number(step))) delete entry.accidentalsByStep[step];
      });
      if (!Object.keys(entry.accidentalsByStep).length) delete entry.accidentalsByStep;
    }
    if (entry.noteheadsByStep) {
      Object.keys(entry.noteheadsByStep).forEach((step) => {
        if (!uniqueSteps.includes(Number(step))) delete entry.noteheadsByStep[step];
      });
      if (!Object.keys(entry.noteheadsByStep).length) delete entry.noteheadsByStep;
    }
    if (entry.noteColors) {
      Object.keys(entry.noteColors).forEach((step) => {
        if (!uniqueSteps.includes(Number(step))) delete entry.noteColors[step];
      });
      if (!Object.keys(entry.noteColors).length) delete entry.noteColors;
    }
    if (entry.accidentalsByDiatonicStep && entry.type === "note") {
      const validDiatonicSteps = new Set(entryDiatonicSteps(entry).map(String));
      Object.keys(entry.accidentalsByDiatonicStep).forEach((step) => {
        if (!validDiatonicSteps.has(step)) delete entry.accidentalsByDiatonicStep[step];
      });
      if (!Object.keys(entry.accidentalsByDiatonicStep).length) delete entry.accidentalsByDiatonicStep;
    }
    if (entry.tieStaffStep !== null && !uniqueSteps.includes(entry.tieStaffStep)) {
      entry.tieStaffStep = uniqueSteps[0] ?? null;
    }
    if (state.activeNoteEntryId === entry.id && !uniqueSteps.includes(state.activeNoteStaffStep)) {
      setActiveNote(entry, uniqueSteps[0] ?? 0);
    }
  }

  function selectedChordLocations() {
    return selectedEntryLocations().filter((location) => (
      location.entry?.type === "note" && entryStaffSteps(location.entry).length > 1
    ));
  }

  function selectedVoicingLocations() {
    const byId = new Map();
    const add = (location) => {
      if (!location?.entry || location.entry.type !== "note") return;
      if (entryStaffSteps(location.entry).length < 2) return;
      byId.set(location.entry.id, entryLocationById(location.entry.id) || location);
    };
    selectedEntryLocations().forEach(add);
    selectedNoteLocations().forEach(add);
    add(selectedEntryLocation());
    return [...byId.values()].sort((a, b) => (
      a.measureIndex - b.measureIndex ||
      a.entry.tickStart - b.entry.tickStart ||
      a.entryIndex - b.entryIndex
    ));
  }

  function voiceTransformTargetSteps(staffSteps, toolId) {
    const highToLow = [...staffSteps].sort((a, b) => b - a);
    const lowToHigh = [...staffSteps].sort((a, b) => a - b);
    if (toolId === "drop-2") return highToLow.length >= 2 ? [highToLow[1]] : [];
    if (toolId === "drop-3") return highToLow.length >= 3 ? [highToLow[2]] : [];
    if (toolId === "drop-2-4") return [highToLow[1], highToLow[3]].filter(Number.isFinite);
    if (toolId === "skip-2") return lowToHigh.length >= 2 ? [lowToHigh[1]] : [];
    if (toolId === "skip-3") return lowToHigh.length >= 3 ? [lowToHigh[2]] : [];
    if (toolId === "skip-2-4") return [lowToHigh[1], lowToHigh[3]].filter(Number.isFinite);
    if (toolId === "rotate-up") return lowToHigh.length ? [lowToHigh[0]] : [];
    if (toolId === "rotate-down") return highToLow.length ? [highToLow[0]] : [];
    return [];
  }

  function voiceTransformDirection(toolId) {
    if (["drop-2", "drop-3", "drop-2-4", "rotate-down"].includes(toolId)) return -7;
    if (["skip-2", "skip-3", "skip-2-4", "rotate-up"].includes(toolId)) return 7;
    return 0;
  }

  function chordStepMidiInfos(entry) {
    const location = entryLocationById(entry?.id);
    const measureIndex = location?.measureIndex ?? state.cursorMeasure;
    return entryStaffSteps(entry).map((staffStep) => {
      const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
      const accidental = effectiveEntryAccidental(entry, staffStep) ||
        diatonicAccidentalForMeasure(diatonicStep, measureIndex);
      const midi = midiForDiatonicStep(diatonicStep, accidental);
      return { staffStep, midi };
    }).filter((item) => Number.isFinite(item.midi));
  }

  function blockedSemitoneDropSteps(entry, targets, shift) {
    if (shift >= 0 || !targets?.length) return [];
    const targetSet = new Set(targets.map(String));
    const infos = chordStepMidiInfos(entry);
    const blocked = new Set();
    for (let i = 0; i < infos.length; i += 1) {
      for (let j = i + 1; j < infos.length; j += 1) {
        if (Math.abs(infos[i].midi - infos[j].midi) !== 1) continue;
        const lower = infos[i].midi < infos[j].midi ? infos[i] : infos[j];
        if (targetSet.has(String(lower.staffStep))) blocked.add(lower.staffStep);
      }
    }
    return [...blocked];
  }

  function blockedSemitoneSkipSteps(entry, targets, shift) {
    if (shift <= 0 || !targets?.length) return [];
    const targetSet = new Set(targets.map(String));
    const infos = chordStepMidiInfos(entry);
    const blocked = new Set();
    for (let i = 0; i < infos.length; i += 1) {
      for (let j = i + 1; j < infos.length; j += 1) {
        if (Math.abs(infos[i].midi - infos[j].midi) !== 1) continue;
        const upper = infos[i].midi > infos[j].midi ? infos[i] : infos[j];
        if (targetSet.has(String(upper.staffStep))) blocked.add(upper.staffStep);
      }
    }
    return [...blocked];
  }

  function blockedSemitoneVoicingSteps(entry, toolId) {
    const targetSteps = voiceTransformTargetSteps(entryStaffSteps(entry), toolId);
    const shift = voiceTransformDirection(toolId);
    if (toolId.startsWith("drop-")) return blockedSemitoneDropSteps(entry, targetSteps, shift);
    if (toolId.startsWith("skip-")) return blockedSemitoneSkipSteps(entry, targetSteps, shift);
    return [];
  }

  function topMidiForChord(entry) {
    const midis = chordStepMidiInfos(entry).map((item) => item.midi).filter(Number.isFinite);
    return midis.length ? Math.max(...midis) : null;
  }

  function autoDropDecisionForEntry(entry) {
    const topMidi = topMidiForChord(entry);
    const lowerLimit = Number(state.autoDropConfig?.lowerLimitMidi) || 62;
    const upperLimit = Number(state.autoDropConfig?.upperLimitMidi) || 74;
    if (!Number.isFinite(topMidi) || topMidi < lowerLimit) return { toolId: null, reason: "range" };
    const candidates = autoDropCandidateTools(topMidi < upperLimit ? "mid" : "high");
    if (!candidates.length) return { toolId: null, reason: "voices" };
    let blocked = false;
    for (const candidate of candidates) {
      const staffSteps = entryStaffSteps(entry);
      const targets = voiceTransformTargetSteps(staffSteps, candidate);
      if (!targets.length || !voiceTransformDirection(candidate)) continue;
      const blockedSteps = blockedSemitoneVoicingSteps(entry, candidate);
      if (blockedSteps.length) {
        blocked = true;
        continue;
      }
      return { toolId: candidate, reason: "" };
    }
    return { toolId: null, reason: blocked ? "semitone" : "voices" };
  }

  function autoSkipDecisionForEntry(entry) {
    const topMidi = topMidiForChord(entry);
    const lowLimit = Number(state.autoSkipConfig?.lowLimitMidi) || 57;
    const upperNoSkip = Number(state.autoSkipConfig?.upperNoSkipMidi) || 67;
    if (!Number.isFinite(topMidi) || topMidi > upperNoSkip) return { toolId: null, reason: "range" };
    const candidates = autoSkipCandidateTools(topMidi < lowLimit ? "low" : "mid");
    if (!candidates.length) return { toolId: null, reason: "voices" };
    let blocked = false;
    for (const candidate of candidates) {
      const staffSteps = entryStaffSteps(entry);
      const targets = voiceTransformTargetSteps(staffSteps, candidate);
      if (!targets.length || !voiceTransformDirection(candidate)) continue;
      const blockedSteps = blockedSemitoneVoicingSteps(entry, candidate);
      if (blockedSteps.length) {
        blocked = true;
        continue;
      }
      return { toolId: candidate, reason: "" };
    }
    return { toolId: null, reason: blocked ? "semitone" : "voices" };
  }

  function transformChordVoicing(entry, toolId) {
    const staffSteps = entryStaffSteps(entry);
    if (entry.type !== "note" || staffSteps.length < 2) return null;
    const targets = voiceTransformTargetSteps(staffSteps, toolId);
    const shift = voiceTransformDirection(toolId);
    if (!targets.length || !shift) return null;
    const targetSet = new Set(targets.map(String));
    const movedAccidentals = [];
    const movedNoteheads = [];
    const nextSteps = staffSteps.map((staffStep) => {
      if (!targetSet.has(String(staffStep))) return staffStep;
      const nextStep = staffStep + shift;
      const accidental = getEntryAccidental(entry, staffStep);
      if (accidental) movedAccidentals.push({ from: staffStep, to: nextStep, accidental });
      const notehead = entry.noteheadsByStep?.[String(staffStep)];
      if (notehead) movedNoteheads.push({ from: staffStep, to: nextStep, notehead });
      return nextStep;
    });
    if (nextSteps.length !== staffSteps.length || nextSteps.every((step, index) => Math.abs(step - staffSteps[index]) < EPSILON)) {
      return null;
    }
    setEntryStaffSteps(entry, nextSteps);
    movedAccidentals.forEach(({ from, to, accidental }) => {
      clearEntryAccidental(entry, from);
      setEntryAccidental(entry, to, accidental);
    });
    movedNoteheads.forEach(({ from, to, notehead }) => {
      clearEntryNoteheadGlyph(entry, from);
      setEntryNoteheadGlyph(entry, notehead, to);
    });
    const location = entryLocationById(entry.id);
    if (location) normalizeChordSpellingAndSymbol(location);
    return entryStaffSteps(entry);
  }

  function parseDistributePattern(rawPattern, noteCount) {
    const text = String(rawPattern || "").trim();
    if (!text) return null;
    if (text === "1") return Array.from({ length: Math.max(1, noteCount) }, () => 1);
    const sizes = text
      .split(/[\/,\s]+/)
      .map((part) => Math.round(Number(part)))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!sizes.length) return null;
    const total = sizes.reduce((sum, value) => sum + value, 0);
    if (total < noteCount) sizes[sizes.length - 1] += noteCount - total;
    return sizes;
  }

  function chordNotesHighToLow(entry, measureIndex) {
    return entryStaffSteps(entry)
      .map((staffStep) => {
        const diatonicStep = entryDiatonicStepForStaffStep(entry, staffStep);
        const explicit = getEntryAccidental(entry, staffStep);
        const diatonic = diatonicAccidentalForMeasure(diatonicStep, measureIndex);
        const effective = effectiveEntryAccidental(entry, staffStep);
        const accidental = explicit || (effective !== diatonic ? effective : null);
        return {
          staffStep,
          diatonicStep,
          accidental,
          color: entry.noteColors?.[String(staffStep)] || null,
          notehead: entry.noteheadsByStep?.[String(staffStep)] || null
        };
      })
      .sort((a, b) => b.staffStep - a.staffStep);
  }

  function splitChordNotesByPattern(notes, pattern) {
    const groups = [];
    let cursor = 0;
    pattern.forEach((size) => {
      if (cursor >= notes.length) return;
      groups.push(notes.slice(cursor, cursor + size));
      cursor += size;
    });
    if (cursor < notes.length) {
      if (!groups.length) groups.push([]);
      groups[groups.length - 1].push(...notes.slice(cursor));
    }
    return groups.filter((group) => group.length);
  }

  function ensureSystemsForDistribution(sourceSystemIndex, groupCount) {
    syncActiveSystemMeasures();
    while (state.systems.length < sourceSystemIndex + groupCount) {
      state.systems.push(createStaffSystem("staff", { initialClefId: DEFAULT_CLEF_ID }));
    }
    normalizeSystemDefaults();
    ensureAllSystemsMeasure(state.measures.length - 1);
  }

  function entryForDistributedGroup(sourceEntry, notes, targetSystemIndex, absoluteTick) {
    const copy = cloneEntryForPaste(sourceEntry);
    copy.type = "note";
    setEntryVoice(copy, 1);
    delete copy.chordSteps;
    delete copy.chordDiatonicSteps;
    delete copy.accidentalsByStep;
    delete copy.accidentalsByDiatonicStep;
    delete copy.noteColors;
    delete copy.noteheadsByStep;
    copy.accidental = null;
    const targetClefId = withSystemContext(targetSystemIndex, () => clefIdAtAbsoluteTick(absoluteTick));
    const staffSteps = notes.map((note) => staffStepForDiatonicStep(note.diatonicStep, targetClefId));
    copy.staffStep = staffSteps[0] ?? 0;
    if (staffSteps.length > 1) copy.chordSteps = staffSteps;
    copy.diatonicStep = notes[0]?.diatonicStep ?? 0;
    if (notes.length > 1) copy.chordDiatonicSteps = notes.map((note) => note.diatonicStep);
    notes.forEach((note, index) => {
      const staffStep = staffSteps[index];
      if (!Number.isFinite(staffStep)) return;
      if (note.accidental) {
        if (!copy.accidentalsByStep) copy.accidentalsByStep = {};
        if (!copy.accidentalsByDiatonicStep) copy.accidentalsByDiatonicStep = {};
        copy.accidentalsByStep[String(staffStep)] = note.accidental;
        copy.accidentalsByDiatonicStep[String(note.diatonicStep)] = note.accidental;
        if (index === 0) copy.accidental = note.accidental;
      }
      if (note.color) {
        if (!copy.noteColors) copy.noteColors = {};
        copy.noteColors[String(staffStep)] = note.color;
      }
      if (note.notehead) {
        if (!copy.noteheadsByStep) copy.noteheadsByStep = {};
        copy.noteheadsByStep[String(staffStep)] = note.notehead;
      }
    });
    return copy;
  }

  async function distributeSelectedChordsByPattern(rawPattern) {
    const targets = selectedVoicingLocations();
    if (!targets.length) {
      await showEditorMessage("Selecciona uno o varios acordes para repartirlos en sistemas.");
      return false;
    }
    const sourceSystemIndex = activeSystemIndex();
    if (systemIsPercussionLine(scoreSystems()[sourceSystemIndex])) {
      await showEditorMessage("Repartir aplica a pentagramas con altura, no a línea de percusión.");
      return false;
    }
    const firstNotes = chordNotesHighToLow(targets[0].entry, targets[0].measureIndex);
    const firstPattern = parseDistributePattern(rawPattern, firstNotes.length);
    if (!firstPattern) {
      await showEditorMessage("Escribe un patrón como 1, 2/2, 3/2 o 2/2/1.");
      return false;
    }
    saveHistory();
    let changed = false;
    let maxGroupCount = 1;
    const createdSourceIds = [];
    targets.forEach((location) => {
      const notes = chordNotesHighToLow(location.entry, location.measureIndex);
      const pattern = parseDistributePattern(rawPattern, notes.length);
      const groups = splitChordNotesByPattern(notes, pattern || firstPattern);
      if (!groups.length) return;
      maxGroupCount = Math.max(maxGroupCount, groups.length);
      ensureSystemsForDistribution(sourceSystemIndex, groups.length);
      const absoluteTick = measureStartAbsoluteTick(location.measureIndex) + location.entry.tickStart;
      groups.forEach((group, groupIndex) => {
        const targetSystemIndex = sourceSystemIndex + groupIndex;
        const copy = entryForDistributedGroup(location.entry, group, targetSystemIndex, absoluteTick);
        withSystemContext(targetSystemIndex, () => {
          if (overwriteEntryAtAbsoluteTick(copy, absoluteTick)) {
            changed = true;
            if (targetSystemIndex === sourceSystemIndex) createdSourceIds.push(copy.id);
          }
        });
      });
    });
    if (!changed) {
      state.history.pop();
      await showEditorMessage("No pude repartir esa selección.");
      return false;
    }
    setActiveSystemIndex(sourceSystemIndex);
    state.selectedEntryIds = createdSourceIds;
    state.selectedNoteRefs = [];
    state.cursorEntryId = createdSourceIds[0] || null;
    state.compactLayout = true;
    invalidateLayoutCache();
    render();
    showEditorMessage(maxGroupCount === 1 ? "Repartir aplicado." : `Repartir aplicado en ${maxGroupCount} sistemas.`);
    return true;
  }

  async function requestDistributeChords() {
    const value = await requestEditorPopup({
      title: "Repartir acorde",
      initialValue: "1",
      placeholder: "Ej. 1, 3/2, 2/2/1",
      help: "Escribe el reparto de arriba hacia abajo. Ejemplos: 1 crea un pentagrama por nota; 3/2 pone tres notas arriba y dos abajo.",
      okLabel: "Repartir"
    });
    if (value === null || value === undefined) return false;
    return distributeSelectedChordsByPattern(value);
  }

  async function applyChordTool(toolId) {
    if (toolId === "distribute") return requestDistributeChords();
    if (activeSystemIsPercussionLine()) {
      await showEditorMessage("Las herramientas de voicing aplican solo a acordes en pentagramas con altura.");
      return false;
    }
    const targets = selectedVoicingLocations();
    if (!targets.length) {
      await showEditorMessage("Selecciona un acorde primero. Puedes hacer click en la plica para tomar todas sus notas.");
      return false;
    }
    saveHistory();
    const selectedRefs = [];
    let changed = false;
    let blockedSemitoneCount = 0;
    let outOfRangeAutoCount = 0;
    let unavailableAutoCount = 0;
    const isAutoDrop = toolId === "auto-drops";
    const isAutoSkip = toolId === "auto-skips";
    targets.forEach(({ entry }) => {
      const autoDecision = isAutoDrop
        ? autoDropDecisionForEntry(entry)
        : isAutoSkip
          ? autoSkipDecisionForEntry(entry)
          : null;
      const effectiveToolId = autoDecision ? autoDecision.toolId : toolId;
      if (!effectiveToolId) {
        if (autoDecision?.reason === "range") outOfRangeAutoCount += 1;
        else if (autoDecision?.reason === "semitone") blockedSemitoneCount += 1;
        else if (isAutoDrop || isAutoSkip) unavailableAutoCount += 1;
        return;
      }
      const blockedSteps = blockedSemitoneVoicingSteps(entry, effectiveToolId);
      if (blockedSteps.length) {
        blockedSemitoneCount += blockedSteps.length;
        return;
      }
      const nextSteps = transformChordVoicing(entry, effectiveToolId);
      if (!nextSteps) return;
      changed = true;
      nextSteps.forEach((staffStep) => selectedRefs.push({ entryId: entry.id, staffStep }));
    });
    if (!changed) {
      state.history.pop();
      if (blockedSemitoneCount) {
        render();
        await showEditorMessage("Movimiento bloqueado: no se separa por octava una de las notas de un semitono interno del acorde.");
        return false;
      }
      if (isAutoDrop && outOfRangeAutoCount) {
        await showEditorMessage(`Auto-drops no hizo cambios: la nota superior está por debajo de ${autoDropPitchLabel(state.autoDropConfig.lowerLimitMidi)}.`);
        return false;
      }
      if (isAutoSkip && outOfRangeAutoCount) {
        await showEditorMessage(`Auto-skips no hizo cambios: la nota superior está por encima de ${autoDropPitchLabel(state.autoSkipConfig.upperNoSkipMidi)}.`);
        return false;
      }
      if (isAutoDrop && unavailableAutoCount) {
        await showEditorMessage("Auto-drops no encontró un drop válido para la selección.");
        return false;
      }
      if (isAutoSkip && unavailableAutoCount) {
        await showEditorMessage("Auto-skips no encontró un skip válido para la selección.");
        return false;
      }
      await showEditorMessage("Ese acorde no tiene suficientes voces para esa herramienta.");
      return false;
    }
    state.selectedEntryIds = targets.map((location) => location.entry.id);
    state.selectedNoteRefs = selectedRefs;
    state.cursorEntryId = targets[0]?.entry.id || null;
    if (selectedRefs[0]) {
      state.cursorStaffStep = selectedRefs[0].staffStep;
      setActiveNote(targets[0].entry, selectedRefs[0].staffStep);
    }
    render();
    if (blockedSemitoneCount) {
      showEditorMessage("Algunos acordes se mantuvieron sin cambios por semitonos internos.");
    } else if (isAutoDrop && outOfRangeAutoCount) {
      showEditorMessage("Auto-drops aplicado; los acordes fuera de rango se mantuvieron sin cambios.");
    } else if (isAutoSkip && outOfRangeAutoCount) {
      showEditorMessage("Auto-skips aplicado; los acordes fuera de rango se mantuvieron sin cambios.");
    } else if (isAutoDrop && unavailableAutoCount) {
      showEditorMessage("Auto-drops aplicado; algunos acordes sin drop disponible se mantuvieron sin cambios.");
    } else if (isAutoSkip && unavailableAutoCount) {
      showEditorMessage("Auto-skips aplicado; algunos acordes sin skip disponible se mantuvieron sin cambios.");
    }
    return true;
  }

  function pitchYForSystem(staffStep, systemIndex = renderSystemIndex) {
    return STAFF_CENTER_Y + appearanceValue("scoreOffsetY") + systemOffsetY(systemIndex) - staffStep * STEP_HEIGHT;
  }

  function pitchY(staffStep) {
    return pitchYForSystem(staffStep, renderSystemIndex);
  }

  function staffTopY() {
    return pitchY(STAFF_LINE_TOP_STEP);
  }

  function staffBottomY() {
    return pitchY(STAFF_LINE_BOTTOM_STEP);
  }

  function staffTopYForSystem(systemIndex) {
    return pitchYForSystem(STAFF_LINE_TOP_STEP, systemIndex);
  }

  function staffBottomYForSystem(systemIndex) {
    return pitchYForSystem(STAFF_LINE_BOTTOM_STEP, systemIndex);
  }

  function scoreStaffTopY() {
    return staffTopYForSystem(0);
  }

  function scoreStaffBottomY() {
    return staffBottomYForSystem(systemCount() - 1);
  }

  function hitTopY() {
    return staffTopY() - HIT_PADDING;
  }

  function pointIsInStaffArea(point) {
    if (!point) return false;
    const verticalPadding = STEP_HEIGHT * 2;
    const systemIndex = systemIndexFromY(point.y);
    return point.y >= staffTopYForSystem(systemIndex) - verticalPadding &&
      point.y <= staffBottomYForSystem(systemIndex) + verticalPadding;
  }

  function systemIndexFromY(y) {
    const count = systemCount();
    let closest = 0;
    let closestDistance = Infinity;
    for (let index = 0; index < count; index += 1) {
      const center = STAFF_CENTER_Y + appearanceValue("scoreOffsetY") + systemOffsetY(index);
      const distance = Math.abs(y - center);
      if (distance < closestDistance) {
        closest = index;
        closestDistance = distance;
      }
    }
    return closest;
  }

  function stepFromY(y, systemIndex = systemIndexFromY(y)) {
    return Math.round((STAFF_CENTER_Y + appearanceValue("scoreOffsetY") + systemOffsetY(systemIndex) - y) / STEP_HEIGHT);
  }

  function noteheadGlyphName(durationId) {
    return defaultNoteheadGlyphName(durationId);
  }

  function keySignatureStaffStep(signature, index, clefId = initialClefId()) {
    const trebleStep = KeySignatures.staffStep(signature, index);
    const trebleC4Step = clefProfile(DEFAULT_CLEF_ID).c4Step;
    const targetC4Step = clefProfile(clefId).c4Step;
    let step = trebleStep + (targetC4Step - trebleC4Step);
    const topLimit = STAFF_LINE_TOP_STEP + 1;
    const bottomLimit = STAFF_LINE_BOTTOM_STEP - 1;
    while (step > topLimit) step -= 14;
    while (step < bottomLimit) step += 14;
    return step;
  }

  function noteHead(x, y, durationId = "quarter", extraClass = "", glyphName = noteheadGlyphName(durationId)) {
    return glyphTextCentered(glyphName, x + appearanceValue("noteheadOffsetX"), y + appearanceValue("noteheadOffsetY"), {
      class: `music-glyph note-head${extraClass ? ` ${extraClass}` : ""}`,
      "font-size": musicGlyphSize("noteheadScale"),
      "data-cx": x + appearanceValue("noteheadOffsetX"),
      "data-cy": y + appearanceValue("noteheadOffsetY")
    });
  }

  function mirroredDirectionOffset(key, direction, axis = "x") {
    const value = appearanceValue(key);
    return axis === "y" ? -direction * value : direction * value;
  }

  function visualStemX(stemX, direction) {
    return stemX + appearanceValue("stemOffsetX") + mirroredDirectionOffset("stemMirrorOffsetX", direction);
  }

  function visualStemY(y, direction) {
    return y + appearanceValue("stemOffsetY") + mirroredDirectionOffset("stemMirrorOffsetY", direction, "y");
  }

  function visualFlagX(stemX, direction) {
    const directOffset = appearanceValue(direction > 0 ? "flagUpOffsetX" : "flagDownOffsetX");
    return visualStemX(stemX, direction) + directOffset + mirroredDirectionOffset("flagStemOffsetX", direction);
  }

  function visualFlagY(stemEnd, direction) {
    const directOffset = appearanceValue(direction > 0 ? "flagUpOffsetY" : "flagDownOffsetY");
    return visualStemY(stemEnd, direction) + directOffset + mirroredDirectionOffset("flagStemOffsetY", direction, "y");
  }

  function setStemGlyph(node, stemX, yStart, yEnd) {
    const direction = yEnd < yStart ? 1 : -1;
    const visualStartY = visualStemY(yStart, direction);
    const visualEndY = visualStemY(yEnd, direction);
    const visualX = visualStemX(stemX, direction);
    const length = Math.max(1, Math.abs(visualEndY - visualStartY) + appearanceValue("stemEndExtension"));
    const sign = visualEndY < visualStartY ? 1 : -1;
    const stemBox = glyphBBox("stem");
    const stemHeight = stemBox.ne[1] - stemBox.sw[1];
    const fontSize = musicGlyphSize();
    const baseHeight = stemHeight * fontSize / 4;
    const scaleY = length / Math.max(1, baseHeight);
    const scaleX = appearanceValue("stemGlyphScaleX");
    const centerX = (stemBox.sw[0] + stemBox.ne[0]) * 0.5 * fontSize / 4;
    const originX = -centerX * scaleX;
    node.setAttribute("style", `font-size:${fontSize}px`);
    node.setAttribute("transform", `translate(${visualX + originX} ${visualStartY}) scale(${scaleX} ${sign * scaleY})`);
  }

  function renderStemGlyph(root, stemX, yStart, yEnd) {
    const node = textNode(0, 0, MUSIC_GLYPHS.stem, {
      class: "music-glyph stem-symbol",
      "dominant-baseline": "alphabetic"
    });
    setStemGlyph(node, stemX, yStart, yEnd);
    root.appendChild(node);
    return node;
  }

  function stemDirection(entry) {
    const measure = entryMeasure(entry);
    if (measureHasMultipleVoices(measure)) return isSecondaryVoiceEntry(entry) ? -1 : 1;
    if (entry.manualStemDirection === 1 || entry.manualStemDirection === -1) return entry.manualStemDirection;
    const steps = entryStaffSteps(entry);
    const highestStep = Math.max(...steps);
    return highestStep >= 0 ? -1 : 1;
  }

  function entryDuration(entry) {
    return durations.find((duration) => duration.id === entry.durationId)
      || durations.find((duration) => duration.id === "quarter")
      || durations[4];
  }

  function isNoteEntry(entry) {
    return entry.type !== "rest";
  }

  function durationSpacingRank(duration) {
    const ranks = {
      "one-twenty-eighth": 0,
      "sixty-fourth": 0,
      "thirty-second": 0,
      sixteenth: 0,
      eighth: 1,
      quarter: 2,
      half: 3,
      whole: 4,
      breve: 5
    };
    return ranks[duration.id] || 0;
  }

  function edgeGapForRank(rank) {
    return minForwardGap() * (spacingProgression() ** rank);
  }

  function spacingRankForEntry(entry) {
    const duration = entryDuration(entry);
    return durationSpacingRank(duration);
  }

  function forwardGapForEntry(entry) {
    const duration = entryDuration(entry);
    const rank = spacingRankForEntry(entry);
    const baseGap = edgeGapForRank(rank);
    const restGap = entry.type === "rest" && duration.id === "quarter"
      ? baseGap + appearanceValue("afterQuarterRestGap")
      : baseGap;
    return dotCountForEntry(entry) ? restGap * dotFactor(dotCountForEntry(entry)) : restGap;
  }

  function edgeGapBetween(leftEntry, _rightEntry) {
    return forwardGapForEntry(leftEntry);
  }

  function measureTrailingGap(entry) {
    if (!entry) return measureRightInset();
    return Math.max(measureRightInset(), forwardGapForEntry(entry));
  }

  function edgeGapForHit(entry) {
    return edgeGapForRank(spacingRankForEntry(entry));
  }

  function entryLeftExtent(entry) {
    const duration = entryDuration(entry);
    if (entry?.type === "rest") return restVisualWidth(duration.id) / 2;
    return entryStaffSteps(entry).reduce((extent, staffStep) => {
      const headExtent = -noteHeadRect(entry, 0, staffStep).left;
      const accidental = getEntryDisplayAccidental(entry, staffStep);
      if (!accidental) return Math.max(extent, headExtent);
      const accidentalExtent = -accidentalRect(entry, 0, staffStep, accidentalXOffsetFor(entry, staffStep)).left - appearanceValue("accidentalExtentCorrection");
      return Math.max(extent, headExtent, accidentalExtent);
    }, NOTE_HEAD_RX);
  }

  function entryRightExtent(entry) {
    const duration = entryDuration(entry);
    if (entry?.type === "rest") return restVisualWidth(duration.id) / 2;
    const headExtent = entryStaffSteps(entry).reduce((extent, staffStep) => (
      Math.max(extent, noteHeadRect(entry, 0, staffStep).right)
    ), NOTE_HEAD_RX);
    const dots = dotCountForEntry(entry);
    return dots ? Math.max(headExtent, dotXOffset() + DOT_VISUAL_WIDTH / 2 + (dots - 1) * (DOT_VISUAL_WIDTH + 4)) : headExtent;
  }

  function visualDistance(previous, entry) {
    return entryRightExtent(previous) + edgeGapBetween(previous, entry) + entryLeftExtent(entry);
  }

  function chordSpacingGap() {
    return 16;
  }

  function textBoxExtentsAtAnchor(text, style = {}, kind = AnchoredText.KINDS.CHORD) {
    const metrics = TextItems.metrics({
      item: { kind, text, style },
      point: { x: 0, y: 0 },
      style,
      AnchoredText,
      approximateTextWidth
    });
    let left = metrics.hitRect.left;
    let right = metrics.hitRect.right;
    const enclosure = style.enclosure || "none";
    if (enclosure === "box" || enclosure === "round") {
      left -= 8;
      right += 8;
    } else if (enclosure === "circle") {
      const rx = Math.max(metrics.width / 2 + 10, metrics.size * 0.72);
      left = Math.min(left, -rx);
      right = Math.max(right, rx);
    }
    return {
      left,
      right,
      width: Math.max(1, right - left)
    };
  }

  function chordItemHorizontalExtents(item) {
    const style = { ...state.textStyle, ...(item?.style || {}) };
    const extents = textBoxExtentsAtAnchor(
      item?.text || AnchoredText.sampleText(AnchoredText.KINDS.CHORD),
      style,
      AnchoredText.KINDS.CHORD
    );
    const offsetX = anchoredTextOffset(item, "x");
    return {
      left: extents.left + offsetX,
      right: extents.right + offsetX,
      width: extents.width
    };
  }

  function chordItemsAtTick(measureIndex, tick) {
    if (measureIndex < 0) return [];
    const normalizedTick = Number(tick) || 0;
    return chordItemsForMeasure(measureIndex).filter((item) => (
      Math.abs((Number(item.tick) || 0) - normalizedTick) < EPSILON
    ));
  }

  function chordTextExtentAtTick(measureIndex, tick) {
    const items = chordItemsAtTick(measureIndex, tick);
    if (!items.length) return 0;
    return Math.max(...items.map((item) => chordItemHorizontalExtents(item).right)) + chordSpacingGap();
  }

  function chordLeftExtentAtTick(measureIndex, tick) {
    const items = chordItemsAtTick(measureIndex, tick);
    if (!items.length) return 0;
    return Math.min(...items.map((item) => chordItemHorizontalExtents(item).left));
  }

  function chordRequiredDistanceBetweenTicks(measureIndex, leftTick, rightTick) {
    const leftItems = chordItemsAtTick(measureIndex, leftTick);
    const rightItems = chordItemsAtTick(measureIndex, rightTick);
    if (!leftItems.length || !rightItems.length) return 0;
    const leftRight = Math.max(...leftItems.map((item) => chordItemHorizontalExtents(item).right));
    const rightLeft = Math.min(...rightItems.map((item) => chordItemHorizontalExtents(item).left));
    return leftRight + chordSpacingGap() - rightLeft;
  }

  function visualDistanceWithChordSpacing(measureIndex, previous, entry) {
    const baseDistance = visualDistance(previous, entry);
    const hasPreviousChord = chordItemsAtTick(measureIndex, previous.tickStart).length > 0;
    const hasCurrentChord = chordItemsAtTick(measureIndex, entry.tickStart).length > 0;
    const previousChordToEntry = hasPreviousChord
      ? chordTextExtentAtTick(measureIndex, previous.tickStart) + entryLeftExtent(entry)
      : 0;
    const previousEntryToChord = hasCurrentChord
      ? entryRightExtent(previous) + chordSpacingGap() - chordLeftExtentAtTick(measureIndex, entry.tickStart)
      : 0;
    const chordToChord = chordRequiredDistanceBetweenTicks(measureIndex, previous.tickStart, entry.tickStart);
    return Math.max(baseDistance, previousChordToEntry, previousEntryToChord, chordToChord);
  }

  function eventDistanceWithChordSpacing(measureIndex, previousEvent, event) {
    const baseDistance = Math.max(...previousEvent.entries.flatMap((previous) => (
      event.entries.map((entry) => visualDistance(previous, entry))
    )));
    const hasPreviousChord = chordItemsAtTick(measureIndex, previousEvent.tick).length > 0;
    const hasCurrentChord = chordItemsAtTick(measureIndex, event.tick).length > 0;
    const eventLeft = Math.max(...event.entries.map(entryLeftExtent));
    const previousRight = Math.max(...previousEvent.entries.map(entryRightExtent));
    const previousChordToEvent = hasPreviousChord
      ? chordTextExtentAtTick(measureIndex, previousEvent.tick) + eventLeft
      : 0;
    const previousEventToChord = hasCurrentChord
      ? previousRight + chordSpacingGap() - chordLeftExtentAtTick(measureIndex, event.tick)
      : 0;
    const chordToChord = chordRequiredDistanceBetweenTicks(measureIndex, previousEvent.tick, event.tick);
    return Math.max(baseDistance, previousChordToEvent, previousEventToChord, chordToChord);
  }

  function trailingExtentWithChordSpacing(measureIndex, entry) {
    if (!entry) return measureRightInset();
    return Math.max(
      entryRightExtent(entry) + measureTrailingGap(entry),
      chordTextExtentAtTick(measureIndex, entry.tickStart)
    );
  }

  function trailingEventExtentWithChordSpacing(measureIndex, event) {
    if (!event?.entries?.length) return measureRightInset();
    const notationExtent = Math.max(...event.entries.map((entry) => (
      entryRightExtent(entry) + measureTrailingGap(entry)
    )));
    return Math.max(notationExtent, chordTextExtentAtTick(measureIndex, event.tick));
  }

  function internalClefMarksForMeasure(measureIndex) {
    return (state.marks || [])
      .filter((mark) => (
        mark?.type === "clef" &&
        Number(mark.measureIndex) === measureIndex &&
        !isInitialClefMark(mark)
      ))
      .sort((a, b) => (Number(a.tick) || 0) - (Number(b.tick) || 0));
  }

  function clefMarkReservedWidth(mark) {
    const profile = clefProfile(mark?.clefId);
    const scale = appearanceValue("glyphScale") * appearanceValue("clefScale");
    const glyphBody = glyphWidth(profile.glyphName) * scale;
    const octaveSpace = profile.octaveText ? 8 * scale : 0;
    return Math.max(
      appearanceValue("clefSpacingMinWidth"),
      glyphBody + octaveSpace + appearanceValue("clefSpacingPadding")
    );
  }

  function clefSpacingForMeasureRange(measureIndex, startTick, endTick, options = {}) {
    const includeStart = options.includeStart === true;
    const includeEnd = options.includeEnd !== false;
    return internalClefMarksForMeasure(measureIndex)
      .filter((mark) => {
        const tick = Number(mark.tick) || 0;
        const afterStart = includeStart ? tick >= startTick - EPSILON : tick > startTick + EPSILON;
        const beforeEnd = includeEnd ? tick <= endTick + EPSILON : tick < endTick - EPSILON;
        return afterStart && beforeEnd;
      })
      .reduce((sum, mark) => sum + clefMarkReservedWidth(mark), 0);
  }

  function clefSpacingBeforeTick(measureIndex, tick, includeAtTick = true) {
    return clefSpacingForMeasureRange(measureIndex, 0, tick, {
      includeStart: true,
      includeEnd: includeAtTick
    });
  }

  function internalClefSpacingWidthForMeasure(measureIndex) {
    return internalClefMarksForMeasure(measureIndex)
      .reduce((sum, mark) => sum + clefMarkReservedWidth(mark), 0);
  }

  function chordItemsForMeasure(measureIndex) {
    return state.textItems
      .filter((item) => (
        AnchoredText.isChord(item) &&
        Number(item.measureIndex) === measureIndex &&
        String(item.text || "").trim()
      ))
      .sort((a, b) => Number(a.tick || 0) - Number(b.tick || 0));
  }

  function chordGroupsForMeasure(measureIndex) {
    const ticks = measureTicksForIndex(measureIndex);
    const groups = [];
    chordItemsForMeasure(measureIndex).forEach((item) => {
      const tick = Math.max(0, Math.min(ticks, Number(item.tick) || 0));
      const extents = chordItemHorizontalExtents(item);
      let group = groups.find((candidate) => Math.abs(candidate.tick - tick) < EPSILON);
      if (!group) {
        group = {
          tick,
          left: extents.left,
          right: extents.right
        };
        groups.push(group);
      } else {
        group.left = Math.min(group.left, extents.left);
        group.right = Math.max(group.right, extents.right);
      }
    });
    return groups.sort((a, b) => a.tick - b.tick);
  }

  function chordItemWidth(item) {
    return chordItemHorizontalExtents(item).width;
  }

  function chordSpacingWidthForMeasure(measureIndex) {
    const groups = chordGroupsForMeasure(measureIndex);
    if (!groups.length) return 0;
    const minGap = chordSpacingGap();
    const meterWidth = meterChangeSpacingBeforeMeasure(measureIndex);
    let width = measureLeftInset() + meterWidth;
    let previousGroup = null;
    groups.forEach((group) => {
      let x = measureLeftInset() + meterWidth + Math.max(0, -group.left);
      if (previousGroup) {
        x = previousGroup.x + Math.max(0, previousGroup.right + minGap - group.left);
      }
      width = Math.max(width, x + Math.max(0, group.right));
      previousGroup = { ...group, x };
    });
    return width + minGap + measureRightInset();
  }

  function ensureSharedSpacingGroup(groups, tick) {
    const key = String(Number(tick) || 0);
    let group = groups.get(key);
    if (!group) {
      group = {
        tick: Number(tick) || 0,
        left: 0,
        right: 0,
        forwardGap: 0,
        trailingGap: 0,
        hasChord: false,
        entries: []
      };
      groups.set(key, group);
    }
    return group;
  }

  function addChordSpacingToSharedGroups(groups, measureIndex) {
    chordGroupsForMeasure(measureIndex).forEach((chordGroup) => {
      const group = ensureSharedSpacingGroup(groups, chordGroup.tick);
      group.left = Math.max(group.left, Math.max(0, -chordGroup.left));
      group.right = Math.max(group.right, Math.max(0, chordGroup.right));
      group.forwardGap = Math.max(group.forwardGap, chordSpacingGap());
      group.trailingGap = Math.max(group.trailingGap, chordSpacingGap());
      group.hasChord = true;
    });
  }

  function addEntrySpacingToSharedGroup(group, entry) {
    group.left = Math.max(group.left, entryLeftExtent(entry));
    group.right = Math.max(group.right, entryRightExtent(entry));
    group.forwardGap = Math.max(group.forwardGap, forwardGapForEntry(entry));
    group.trailingGap = Math.max(group.trailingGap, measureTrailingGap(entry));
    group.entries.push(entry);
  }

  function restFontSize() {
    return musicGlyphSize("restScale");
  }

  function measureRhythmicEvents(measure) {
    const events = [];
    (measure?.entries || [])
      .filter((entry) => !entry.hiddenTupletReserve)
      .sort((a, b) => a.tickStart - b.tickStart || entryVoice(a) - entryVoice(b))
      .forEach((entry) => {
        const previous = events.at(-1);
        if (previous && Math.abs(previous.tick - entry.tickStart) < EPSILON) {
          previous.entries.push(entry);
        } else {
          events.push({ tick: entry.tickStart, entries: [entry] });
        }
      });
    return events;
  }

  function sharedClefSpacingBeforeTick(measureIndex, tick, includeAtTick = true) {
    return Math.max(0, ...scoreSystems().map((system, systemIndex) => (
      withSystemContext(systemIndex, () => clefSpacingBeforeTick(measureIndex, tick, includeAtTick))
    )));
  }

  function sharedClefSpacingForMeasureRange(measureIndex, startTick, endTick, options = {}) {
    return Math.max(0, ...scoreSystems().map((system, systemIndex) => (
      withSystemContext(systemIndex, () => clefSpacingForMeasureRange(measureIndex, startTick, endTick, options))
    )));
  }

  function sharedInternalClefSpacingWidthForMeasure(measureIndex) {
    return Math.max(0, ...scoreSystems().map((system, systemIndex) => (
      withSystemContext(systemIndex, () => internalClefSpacingWidthForMeasure(measureIndex))
    )));
  }

  function sharedMaxFlagsForMeasure(measureIndex) {
    return Math.max(0, ...scoreSystems().flatMap((system) => (
      (system.measures?.[measureIndex]?.entries || [])
        .filter((entry) => !entry.hiddenTupletReserve && !isMeasureRestEntry(entry, measureIndex))
        .map((entry) => entryDuration(entry).flags || 0)
    )));
  }

  function sharedRhythmicEvents(measureIndex) {
    const groups = new Map();
    scoreSystems().forEach((system, systemIndex) => {
      const measure = system.measures?.[measureIndex];
      if (!measure) return;
      withSystemContext(systemIndex, () => {
        measureRhythmicEvents(measure).forEach((event) => {
          const spacingEntries = event.entries.filter((entry) => !isMeasureRestEntry(entry, measureIndex));
          if (!spacingEntries.length) return;
          const group = ensureSharedSpacingGroup(groups, event.tick);
          spacingEntries.forEach((entry) => addEntrySpacingToSharedGroup(group, entry));
        });
      });
    });
    addChordSpacingToSharedGroups(groups, measureIndex);
    return [...groups.values()].sort((a, b) => a.tick - b.tick);
  }

  function sharedEventDistanceWithChordSpacing(_measureIndex, previousEvent, event) {
    if (!previousEvent || !event) return 0;
    return Math.max(0, previousEvent.right + previousEvent.forwardGap + event.left);
  }

  function sharedTrailingEventExtentWithChordSpacing(_measureIndex, event) {
    if (!event) return measureRightInset();
    return event.right + Math.max(measureRightInset(), event.trailingGap);
  }

  function sharedMeasureOpticalLayout(measureIndex, start = 0) {
    const events = sharedRhythmicEvents(measureIndex);
    const meterWidth = meterChangeSpacingBeforeMeasure(measureIndex);
    let width = measureLeftInset() + meterWidth;
    const positionsByTick = new Map();
    let previousEvent = null;
    events.forEach((event) => {
      let x = start + measureLeftInset() + meterWidth +
        sharedClefSpacingBeforeTick(measureIndex, event.tick, true) +
        event.left;
      if (previousEvent) {
        x = previousEvent.x +
          sharedClefSpacingForMeasureRange(measureIndex, previousEvent.tick, event.tick) +
          sharedEventDistanceWithChordSpacing(measureIndex, previousEvent, event);
      }
      positionsByTick.set(String(event.tick), x);
      width = Math.max(width, x - start);
      previousEvent = { ...event, x };
    });
    const ticks = measureTicksForIndex(measureIndex);
    const trailingClefWidth = previousEvent
      ? sharedClefSpacingForMeasureRange(measureIndex, previousEvent.tick, ticks, { includeEnd: true })
      : sharedInternalClefSpacingWidthForMeasure(measureIndex);
    const compactWidth = previousEvent
      ? (previousEvent.x - start) +
        sharedTrailingEventExtentWithChordSpacing(measureIndex, previousEvent) +
        trailingClefWidth
      : measureLeftInset() + meterWidth + measureRightInset() + trailingClefWidth;
    return {
      events,
      positionsByTick,
      width: Math.max(width + measureRightInset(), compactWidth)
    };
  }

  function sharedMultiSystemMeasureWidth(measureIndex) {
    const ticks = measureTicksForIndex(measureIndex);
    const tickSpacing = tickSpacingForMaxFlags(sharedMaxFlagsForMeasure(measureIndex));
    const meterWidth = meterChangeSpacingBeforeMeasure(measureIndex);
    const clefWidth = sharedInternalClefSpacingWidthForMeasure(measureIndex);
    const rhythmicWidth = measureLeftInset() + meterWidth + measureRightInset() + ticks * tickSpacing + clefWidth;
    const opticalLayout = sharedMeasureOpticalLayout(measureIndex);
    const compactWidth = opticalLayout.width;
    if (opticalLayout.events.length || state.compactLayout) return Math.max(MEASURE_MIN_WIDTH, compactWidth);
    return Math.max(MEASURE_MIN_WIDTH, compactWidth, rhythmicWidth);
  }

  function compactMultivoiceMeasureWidth(measure, measureIndex, ticks, meterWidth, chordWidth) {
    const events = measureRhythmicEvents(measure);
    if (!events.length) return Math.max(MEASURE_MIN_WIDTH, chordWidth);
    let width = measureLeftInset() + meterWidth;
    let previousEvent = null;
    events.forEach((event) => {
      if (!previousEvent) {
        width += clefSpacingBeforeTick(measureIndex, event.tick, true) +
          Math.max(...event.entries.map(entryLeftExtent));
      } else {
        const distance = eventDistanceWithChordSpacing(measureIndex, previousEvent, event);
        width += clefSpacingForMeasureRange(measureIndex, previousEvent.tick, event.tick) + distance;
      }
      previousEvent = event;
    });
    const lastEvent = events.at(-1);
    const trailingClefWidth = lastEvent
      ? clefSpacingForMeasureRange(measureIndex, lastEvent.tick, ticks, { includeEnd: true })
      : 0;
    return width +
      trailingEventExtentWithChordSpacing(measureIndex, lastEvent) +
      trailingClefWidth;
  }

  function measureWidth(measure, measureIndex = -1) {
    if (measureIndex >= 0 && measureIsHidden(measureIndex)) return HIDDEN_MEASURE_WIDTH;
    if (measureIndex >= 0 && systemCount() > 1) return sharedMultiSystemMeasureWidth(measureIndex);
    const maxFlags = measure.entries.reduce((max, entry) => {
      const duration = entryDuration(entry);
      return Math.max(max, duration.flags || 0);
    }, 0);
    const tickSpacing = tickSpacingForMaxFlags(maxFlags);
    const clefWidth = measureIndex >= 0 ? internalClefSpacingWidthForMeasure(measureIndex) : 0;
    const meterWidth = measureIndex >= 0 ? meterChangeSpacingBeforeMeasure(measureIndex) : 0;
    const ticks = measureIndex >= 0 ? measureTicksForIndex(measureIndex) : measureTicks();
    const rhythmicWidth = measureLeftInset() + meterWidth + measureRightInset() + ticks * tickSpacing + clefWidth;
    const chordWidth = measureIndex >= 0 ? chordSpacingWidthForMeasure(measureIndex) + clefWidth : 0;
    if (!measure.entries.length) return Math.max(MEASURE_MIN_WIDTH, rhythmicWidth, chordWidth);
    if (measureHasMultipleVoices(measure)) {
      const compactWidth = compactMultivoiceMeasureWidth(measure, measureIndex, ticks, meterWidth, chordWidth);
      return Math.max(MEASURE_MIN_WIDTH, compactWidth, chordWidth);
    }
    const compactWidth = measure.entries.reduce((width, entry, index, entriesList) => {
      if (index === 0) {
        return width + clefSpacingBeforeTick(measureIndex, entry.tickStart, true) + entryLeftExtent(entry);
      }
      return width +
        clefSpacingForMeasureRange(measureIndex, entriesList[index - 1].tickStart, entry.tickStart) +
        visualDistanceWithChordSpacing(measureIndex, entriesList[index - 1], entry);
    }, measureLeftInset() + meterWidth) + trailingExtentWithChordSpacing(measureIndex, measure.entries.at(-1));
    const lastEntry = measure.entries.at(-1);
    const trailingClefWidth = lastEntry
      ? clefSpacingForMeasureRange(measureIndex, lastEntry.tickStart, ticks, { includeEnd: true })
      : clefWidth;
    return Math.max(compactWidth + trailingClefWidth, chordWidth);
  }

  function manualMeasureWidth(measureIndex) {
    const value = Number(state.measureWidthOverrides?.[measureIndex]);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function hasManualMeasureWidths() {
    return Array.isArray(state.measureWidthOverrides) &&
      state.measureWidthOverrides.some((value) => Number.isFinite(Number(value)) && Number(value) > 0);
  }

  function measureHasSpacingEventsForStretch(measureIndex) {
    if (chordItemsForMeasure(measureIndex).length) return true;
    return scoreSystems().some((system) => (
      (system.measures?.[measureIndex]?.entries || [])
        .some((entry) => !entry.hiddenTupletReserve && !isMeasureRestEntry(entry, measureIndex))
    ));
  }

  function scoreHasSpacingEvents(measureCount) {
    for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
      if (measureHasSpacingEventsForStretch(measureIndex)) return true;
    }
    return false;
  }

  function setManualMeasureWidth(measureIndex, width) {
    if (!Array.isArray(state.measureWidthOverrides)) state.measureWidthOverrides = [];
    state.measureWidthOverrides[measureIndex] = Math.max(1, Number(width) || 1);
  }

  function naturalMeasureWidth(measureIndex) {
    const systems = scoreSystems();
    return Math.max(...systems.map((system, systemIndex) => (
      withSystemContext(systemIndex, () => measureWidth(system.measures?.[measureIndex] || createMeasure(), measureIndex))
    )));
  }

  function layoutTextSignature(item) {
    if (!item) return null;
    const style = item.style || {};
    return [
      item.id,
      item.kind || "",
      item.text || "",
      item.measureIndex ?? "",
      item.tick ?? "",
      item.systemIndex ?? "",
      item.x ?? "",
      item.y ?? "",
      item.offsetX ?? "",
      item.offsetY ?? "",
      style.font || "",
      style.size || "",
      style.align || "",
      style.color || "",
      style.enclosure || ""
    ].join(":");
  }

  function computeLayout(systems, measureCount) {
    let widths = Array.from({ length: measureCount }, (_, measureIndex) => (
      Math.max(...systems.map((system, systemIndex) => (
        withSystemContext(systemIndex, () => measureWidth(system.measures[measureIndex], measureIndex))
      )))
    ));
    widths = widths.map((width, measureIndex) => {
      const manualWidth = manualMeasureWidth(measureIndex);
      return manualWidth ? Math.max(width, manualWidth) : width;
    });
    const left = staffLeft() + firstMeasureSignatureInset();
    const rightPadding = 80 + appearanceValue("scoreOffsetX");
    const intrinsicTotalWidth = left + widths.reduce((sum, width) => sum + width, 0) + rightPadding;
    const targetTotalWidth = scoreMinWidth();
    const canStretchEmptyScore = !scoreHasSpacingEvents(measureCount);
    if (!state.compactLayout && canStretchEmptyScore && !hasManualMeasureWidths() && widths.length && targetTotalWidth > intrinsicTotalWidth) {
      const extraPerMeasure = (targetTotalWidth - intrinsicTotalWidth) / widths.length;
      widths = widths.map((width) => width + extraPerMeasure);
    }
    const starts = [];
    let x = left;
    widths.forEach((width) => {
      starts.push(x);
      x += width;
    });
    return { starts, widths, totalWidth: Math.max(x + rightPadding, targetTotalWidth) };
  }

  function buildLayout(options = {}) {
    if (!options.fresh && cachedScoreLayout) return cachedScoreLayout;
    const systems = scoreSystems();
    const measureCount = Math.max(1, ...systems.map((system) => system.measures?.length || 0));
    layoutCacheKeyComputationCount += 1;
    document.documentElement.dataset.layoutKeyComputations = String(layoutCacheKeyComputationCount);
    rhythmicColumnIndex.clear();
    const layout = computeLayout(systems, measureCount);
    cachedScoreLayout = layout;
    return layout;
  }

  function visibleBarXs(layout) {
    return visibleBarBoundaries(layout).map((boundary) => boundary.x);
  }

  function visibleBarBoundaries(layout) {
    const boundaries = [];
    layout.starts.forEach((start, index) => {
      const touchesHiddenMeasure = measureIsHidden(index) || measureIsHidden(index - 1);
      if (
        index > 0 &&
        (touchesHiddenMeasure || measureIsFull(state.measures[index - 1], index - 1))
      ) {
        boundaries.push({ boundaryIndex: index, x: start });
      }
    });
    const lastMeasure = state.measures.at(-1);
    const lastStart = layout.starts.at(-1);
    const lastWidth = layout.widths.at(-1);
    if (
      (measureIsHidden(state.measures.length - 1) || measureIsFull(lastMeasure, state.measures.length - 1)) &&
      Number.isFinite(lastStart) &&
      Number.isFinite(lastWidth)
    ) {
      boundaries.push({ boundaryIndex: state.measures.length, x: lastStart + lastWidth });
    }
    return boundaries;
  }

  function boundaryX(layout, boundaryIndex) {
    if (boundaryIndex === 0) return layout.starts[0];
    if (boundaryIndex > 0 && boundaryIndex < layout.starts.length) return layout.starts[boundaryIndex];
    if (boundaryIndex === layout.starts.length) {
      const lastStart = layout.starts.at(-1);
      const lastWidth = layout.widths.at(-1);
      return Number.isFinite(lastStart) && Number.isFinite(lastWidth) ? lastStart + lastWidth : null;
    }
    return null;
  }

  function xForTick(start, width, tick, measureIndex = state.cursorMeasure) {
    const meterWidth = meterChangeSpacingBeforeMeasure(measureIndex);
    const usableStart = start + measureLeftInset() + meterWidth;
    const usableWidth = Math.max(1, width - measureLeftInset() - meterWidth - measureRightInset());
    return usableStart + (tick / measureTicksForIndex(measureIndex)) * usableWidth;
  }

  function xForTickWithInternalClefs(start, width, measureIndex, tick, includeAtTick = true) {
    return xForTick(start, width, tick, measureIndex) + clefSpacingBeforeTick(measureIndex, tick, includeAtTick);
  }

  function entryAnchorScore(entry, systemIndex) {
    const noteScore = entry?.type === "rest" ? 0 : 1000;
    const chordScore = entry?.type === "rest" ? 0 : entryStaffSteps(entry).length * 20;
    const voiceScore = entryVoice(entry) === 1 ? 4 : 2;
    const systemScore = Math.max(0, 12 - systemIndex);
    return noteScore + chordScore + voiceScore + systemScore;
  }

  function renderedEntryXForTick(layout, measureIndex, tick) {
    const normalizedMeasure = Math.max(0, Math.min(layout.starts.length - 1, Number(measureIndex) || 0));
    const start = layout.starts[normalizedMeasure] ?? staffLeft();
    const width = layout.widths[normalizedMeasure] ?? MEASURE_MIN_WIDTH;
    const normalizedTick = Math.max(0, Math.min(measureTicksForIndex(normalizedMeasure), Number(tick) || 0));
    const candidates = [];
    scoreSystems().forEach((system, systemIndex) => {
      const measure = system?.measures?.[normalizedMeasure];
      if (!measure?.entries?.length) return;
      withSystemContext(systemIndex, () => {
        const positions = measureEntryPositions(measure, start, width);
        measure.entries.forEach((entry) => {
          if (entry?.hiddenTupletReserve) return;
          if (Math.abs((Number(entry.tickStart) || 0) - normalizedTick) > EPSILON) return;
          const x = positions.get(entry.id);
          if (!Number.isFinite(x)) return;
          candidates.push({
            x,
            score: entryAnchorScore(entry, systemIndex)
          });
        });
      });
    });
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.score - a.score || a.x - b.x);
    return candidates[0].x;
  }

  function xForChordAnchor(layout, measureIndex, tick) {
    const normalizedMeasure = Math.max(0, Math.min(layout.starts.length - 1, Number(measureIndex) || 0));
    const start = layout.starts[normalizedMeasure] ?? staffLeft();
    const width = layout.widths[normalizedMeasure] ?? MEASURE_MIN_WIDTH;
    const normalizedTick = Math.max(0, Math.min(measureTicksForIndex(normalizedMeasure), Number(tick) || 0));
    const indexed = rhythmicColumnIndex.get(0, normalizedMeasure, normalizedTick);
    if (Number.isFinite(indexed)) return indexed;
    let resolvedX = null;
    if (systemCount() > 1) {
      const sharedLayout = sharedMeasureOpticalLayout(normalizedMeasure, start);
      const sharedX = sharedLayout.positionsByTick.get(String(normalizedTick));
      if (Number.isFinite(sharedX)) resolvedX = sharedX;
    }
    resolvedX = resolvedX
      ?? renderedEntryXForTick(layout, normalizedMeasure, normalizedTick)
      ?? xForTickWithInternalClefs(start, width, normalizedMeasure, normalizedTick, true);
    scoreSystems().forEach((_system, systemIndex) => {
      rhythmicColumnIndex.set(systemIndex, normalizedMeasure, normalizedTick, resolvedX);
    });
    return resolvedX;
  }

  function spacingGroupsForMeasureWithCursor(measure, measureIndex, tick) {
    const groups = new Map();
    measureRhythmicEvents(measure).forEach((event) => {
      const spacingEntries = event.entries.filter((entry) => !isMeasureRestEntry(entry, measureIndex));
      if (!spacingEntries.length) return;
      const group = ensureSharedSpacingGroup(groups, event.tick);
      spacingEntries.forEach((entry) => addEntrySpacingToSharedGroup(group, entry));
    });
    addChordSpacingToSharedGroups(groups, measureIndex);
    const normalizedTick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(tick) || 0));
    const probe = cursorProbeEntry(normalizedTick);
    addEntrySpacingToSharedGroup(ensureSharedSpacingGroup(groups, normalizedTick), probe);
    return [...groups.values()].sort((a, b) => a.tick - b.tick);
  }

  function opticalTickPositionsFromEvents(measureIndex, start, events, options = {}) {
    const positionsByTick = new Map();
    let previousEvent = null;
    const clefBefore = options.shared
      ? sharedClefSpacingBeforeTick
      : clefSpacingBeforeTick;
    const clefRange = options.shared
      ? sharedClefSpacingForMeasureRange
      : clefSpacingForMeasureRange;
    events.forEach((event) => {
      let x = start + measureLeftInset() + meterChangeSpacingBeforeMeasure(measureIndex) +
        clefBefore(measureIndex, event.tick, true) +
        event.left;
      if (previousEvent) {
        x = previousEvent.x +
          clefRange(measureIndex, previousEvent.tick, event.tick) +
          sharedEventDistanceWithChordSpacing(measureIndex, previousEvent, event);
      }
      positionsByTick.set(String(Number(event.tick) || 0), x);
      previousEvent = { ...event, x };
    });
    return positionsByTick;
  }

  function opticalCursorXFromEventLayout(measure, measureIndex, start, width, tick, options = {}) {
    const normalizedTick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(tick) || 0));
    if (!measureHasMultipleVoices(measure) && !options.shared) {
      const positions = measureEntryPositions(measure, start, width);
      const exactEntry = opticalSpacingEntries(measure)
        .find((entry) => Math.abs(entry.tickStart - normalizedTick) < EPSILON);
      const exactX = exactEntry ? positions.get(exactEntry.id) : null;
      if (Number.isFinite(exactX)) return exactX;
    }

    const events = options.shared
      ? (() => {
        const groups = new Map(sharedRhythmicEvents(measureIndex).map((event) => [String(Number(event.tick) || 0), { ...event, entries: [...(event.entries || [])] }]));
        const probe = cursorProbeEntry(normalizedTick);
        addEntrySpacingToSharedGroup(ensureSharedSpacingGroup(groups, normalizedTick), probe);
        return [...groups.values()].sort((a, b) => a.tick - b.tick);
      })()
      : spacingGroupsForMeasureWithCursor(measure, measureIndex, normalizedTick);
    return opticalTickPositionsFromEvents(measureIndex, start, events, options).get(String(normalizedTick)) ?? null;
  }

  function beamRect(x1, x2, y, strokeWidth) {
    const top = y - strokeWidth / 2 - 2;
    const bottom = y + strokeWidth / 2 + 2;
    return {
      left: Math.min(x1, x2) - 2,
      right: Math.max(x1, x2) + 2,
      top,
      bottom
    };
  }

  function beamCollides(x1, x2, y, strokeWidth, protectedGlyphs) {
    const rect = beamRect(x1, x2, y, strokeWidth);
    return protectedGlyphs.some((glyph) => rectsOverlap(rect, glyph));
  }

  function avoidBeamCollisions(y, direction, x1, x2, protectedGlyphs, strokeWidth) {
    let adjustedY = y;
    for (let tries = 0; tries < 8; tries += 1) {
      if (!beamCollides(x1, x2, adjustedY, strokeWidth, protectedGlyphs)) return adjustedY;
      adjustedY += direction > 0 ? -appearanceValue("beamCollisionClearance") : appearanceValue("beamCollisionClearance");
    }
    return adjustedY;
  }

  function measureEntryPositions(measure, start, width) {
    const positions = new Map();
    let previousEntry = null;
    const measureIndex = state.measures.indexOf(measure);
    if (systemCount() > 1) {
      const sharedLayout = sharedMeasureOpticalLayout(measureIndex, start);
      measure.entries.forEach((entry) => {
        const tickKey = String(Number(entry.tickStart) || 0);
        positions.set(
          entry.id,
          sharedLayout.positionsByTick.get(tickKey) ??
            xForTickWithInternalClefs(start, width, measureIndex, entry.tickStart, true)
        );
      });
      return positions;
    }
    if (measureHasMultipleVoices(measure)) {
      const events = measureRhythmicEvents(measure);
      let previousEvent = null;
      events.forEach((event) => {
        let x = start + measureLeftInset() + meterChangeSpacingBeforeMeasure(measureIndex) +
          clefSpacingBeforeTick(measureIndex, event.tick, true) +
          Math.max(...event.entries.map(entryLeftExtent));
        if (previousEvent) {
          const distance = eventDistanceWithChordSpacing(measureIndex, previousEvent, event);
          x = previousEvent.x +
            clefSpacingForMeasureRange(measureIndex, previousEvent.tick, event.tick) +
            distance;
        }
        event.entries.forEach((entry) => positions.set(entry.id, x));
        previousEvent = { ...event, x };
      });
      return positions;
    }
    measure.entries.forEach((entry) => {
      let x = start + measureLeftInset() + meterChangeSpacingBeforeMeasure(measureIndex) + clefSpacingBeforeTick(measureIndex, entry.tickStart, true) + entryLeftExtent(entry);
      if (previousEntry) {
        x = previousEntry.x +
          clefSpacingForMeasureRange(measureIndex, previousEntry.entry.tickStart, entry.tickStart) +
          visualDistanceWithChordSpacing(measureIndex, previousEntry.entry, entry);
      }
      positions.set(entry.id, x);
      previousEntry = { entry, x };
    });
    return positions;
  }

  function cursorProbeEntry(tick = state.cursorTick) {
    const duration = activeGridDuration();
    return {
      id: "__cursor_probe__",
      type: "note",
      durationId: duration.id,
      ticks: duration.ticks,
      flags: duration.flags,
      dotted: false,
      tieToNext: false,
      tieStaffStep: null,
      staffStep: state.cursorStaffStep,
      tickStart: tick
    };
  }

  function opticalSpacingEntries(measure) {
    return (measure?.entries || []).filter((entry) => !isMeasureRestEntry(entry));
  }

  function opticalCursorXForTick(measure, start, width, tick) {
    const entries = opticalSpacingEntries(measure);
    const measureIndex = state.measures.indexOf(measure);
    if (systemCount() > 1) {
      return opticalCursorXFromEventLayout(measure, measureIndex, start, width, tick, { shared: true })
        ?? xForTickWithInternalClefs(start, width, measureIndex, tick, true);
    }
    if (measureHasMultipleVoices(measure)) {
      return opticalCursorXFromEventLayout(measure, measureIndex, start, width, tick)
        ?? xForTickWithInternalClefs(start, width, measureIndex, tick, true);
    }
    if (!entries.length) return null;

    const positions = measureEntryPositions(measure, start, width);
    const exactEntry = entries.find((entry) => Math.abs(entry.tickStart - tick) < EPSILON);
    if (exactEntry) return positions.get(exactEntry.id) ?? null;

    const previous = entries
      .filter((entry) => entry.tickStart + entry.ticks <= tick + EPSILON)
      .at(-1);
    if (!previous) return null;

    const previousX = positions.get(previous.id);
    if (!Number.isFinite(previousX)) return null;

    const proportionalX = xForTickWithInternalClefs(start, width, measureIndex, tick, true);
    const step = Math.max(MIN_DURATION_TICKS, activeGridDuration()?.ticks || pulseTicks());
    let virtualTick = previous.tickStart + previous.ticks;
    let virtualX = previousX;
    let virtualPrevious = previous;
    let cursorX = virtualX + visualDistance(virtualPrevious, cursorProbeEntry(virtualTick));

    while (virtualTick + step <= tick + EPSILON) {
      virtualPrevious = cursorProbeEntry(virtualTick);
      virtualX = cursorX;
      virtualTick += step;
      cursorX = virtualX + visualDistance(virtualPrevious, cursorProbeEntry(virtualTick));
    }

    return Math.max(proportionalX, cursorX);
  }

  function cursorVisualXForMeasureTick(layout, measureIndex, tick) {
    const normalizedMeasure = Math.max(0, Math.min(layout.starts.length - 1, Number(measureIndex) || 0));
    const measure = state.measures[normalizedMeasure] || state.measures.at(-1);
    const start = layout.starts[normalizedMeasure] ?? layout.starts.at(-1);
    const width = layout.widths[normalizedMeasure] ?? layout.widths.at(-1);
    const normalizedTick = Math.max(0, Math.min(measureTicksForIndex(normalizedMeasure), Number(tick) || 0));
    const indexed = rhythmicColumnIndex.get(0, normalizedMeasure, normalizedTick);
    if (Number.isFinite(indexed)) return indexed;
    if (!measure || !Number.isFinite(start) || !Number.isFinite(width)) {
      return xForTick(start || STAFF_LEFT, width || MEASURE_MIN_WIDTH, normalizedTick, normalizedMeasure);
    }
    const resolvedX = opticalCursorXForTick(measure, start, width, normalizedTick)
      ?? xForTick(start, width, normalizedTick, normalizedMeasure);
    scoreSystems().forEach((_system, systemIndex) => {
      rhythmicColumnIndex.set(systemIndex, normalizedMeasure, normalizedTick, resolvedX);
    });
    return resolvedX;
  }

  function cursorVisualX(layout) {
    const selection = selectedEntryLocation();
    if (selection && state.entryCursorActive) {
      const measure = state.measures[selection.measureIndex];
      const start = layout.starts[selection.measureIndex];
      const width = layout.widths[selection.measureIndex];
      if (measure && Number.isFinite(start) && Number.isFinite(width)) {
        const positions = measureEntryPositions(measure, start, width);
        return positions.get(selection.entry.id) ?? xForTick(start, width, selection.entry.tickStart, selection.measureIndex);
      }
    }

    return cursorVisualXForMeasureTick(layout, state.cursorMeasure, state.cursorTick);
  }

  function pointerGridTicksForMeasure(measureIndex, options = {}) {
    const measureLength = measureTicksForIndex(measureIndex);
    const step = Math.max(MIN_DURATION_TICKS, Number(activeGridDuration()?.ticks) || pulseTicks());
    const ticks = [];
    for (let tick = 0; tick < measureLength - EPSILON; tick += step) {
      ticks.push(Math.max(0, Math.min(measureLength, Number(tick.toFixed(6)))));
    }
    if (options.includeEnd !== false && !ticks.some((tick) => Math.abs(tick - measureLength) < EPSILON)) {
      ticks.push(measureLength);
    }
    return ticks.length ? ticks : [0];
  }

  function tickFromOpticalMeasureX(layout, measureIndex, x) {
    const anchors = pointerGridTicksForMeasure(measureIndex);
    const ranked = anchors.map((tick) => ({
      tick,
      x: cursorVisualXForMeasureTick(layout, measureIndex, tick)
    })).filter((candidate) => Number.isFinite(candidate.x));
    if (!ranked.length) return null;
    return ranked.reduce((closest, candidate) => (
      Math.abs(candidate.x - x) < Math.abs(closest.x - x) ? candidate : closest
    ), ranked[0]).tick;
  }

  function measureIndexFromX(layout, x) {
    if (!layout.starts.length) return 0;
    for (let index = 0; index < layout.starts.length; index += 1) {
      const start = layout.starts[index];
      const end = start + layout.widths[index];
      if (x >= start && x <= end) return index;
    }
    if (x < layout.starts[0]) return 0;
    return layout.starts.length - 1;
  }

  function tickFromMeasureX(layout, measureIndex, x) {
    const opticalTick = tickFromOpticalMeasureX(layout, measureIndex, x);
    if (Number.isFinite(opticalTick)) return opticalTick;
    const start = layout.starts[measureIndex] ?? staffLeft();
    const width = layout.widths[measureIndex] ?? MEASURE_MIN_WIDTH;
    const meterWidth = meterChangeSpacingBeforeMeasure(measureIndex);
    const usableStart = start + measureLeftInset() + meterWidth;
    const usableWidth = Math.max(1, width - measureLeftInset() - meterWidth - measureRightInset());
    const ticks = measureTicksForIndex(measureIndex);
    const raw = ((x - usableStart) / usableWidth) * ticks;
    return Math.max(0, Math.min(ticks, Math.round(raw)));
  }

  function positionCursorFromPoint(point) {
    if (!point) return;
    const pitchSnapshot = rememberFreeCursorPitch();
    setActiveSystemIndex(systemIndexFromY(point.y));
    const previousMeasureIndex = state.cursorMeasure;
    deactivateTupletWriting();
    const layout = buildLayout();
    const measureIndex = measureIndexFromX(layout, point.x);
    ensureMeasure(measureIndex);
    clearEntrySelection();
    clearActiveNote();
    if (!pitchSnapshot.visible) hideCursorPitch();
    state.cursorMeasure = measureIndex;
    state.cursorTick = tickFromMeasureX(layout, measureIndex, point.x);
    state.cursorStaffStep = pitchSnapshot.visible
      ? staffStepForSystem(pitchSnapshot.staffStep)
      : staffStepForSystem(stepFromY(point.y, activeSystemIndex()));
    state.cursorActive = true;
    state.entryCursorActive = false;
    state.selectMode = false;
    setInputPhase(InputSession.PHASES.NOTE_INPUT);
    restoreFreeCursorPitch(pitchSnapshot);
    syncActiveMeterToCursor();
    finalizeMeasureOnExit(previousMeasureIndex, state.cursorMeasure);
    render();
  }

  function positionCursorFromEntryPointer(measureIndex, entry, event) {
    if (!entry) return false;
    const pitchSnapshot = rememberFreeCursorPitch();
    const previousMeasureIndex = state.cursorMeasure;
    clearEntrySelection();
    clearMeasureSelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    if (!pitchSnapshot.visible) hideCursorPitch();
    state.cursorMeasure = measureIndex;
    state.cursorTick = Math.max(0, Math.min(measureTicksForIndex(measureIndex), Number(entry.tickStart) || 0));
    state.cursorStaffStep = pitchSnapshot.visible
      ? staffStepForSystem(pitchSnapshot.staffStep)
      : staffStepForEntryPointer(entry, event);
    state.cursorActive = true;
    state.entryCursorActive = false;
    state.selectMode = false;
    setInputPhase(InputSession.PHASES.NOTE_INPUT);
    restoreFreeCursorPitch(pitchSnapshot);
    syncActiveMeterToCursor();
    finalizeMeasureOnExit(previousMeasureIndex, state.cursorMeasure);
    render();
    return true;
  }

  function selectMeasureFromPoint(point) {
    if (!point) return;
    setActiveSystemIndex(systemIndexFromY(point.y));
    const previousMeasureIndex = state.cursorMeasure;
    deactivateTupletWriting();
    const layout = buildLayout();
    const measureIndex = measureIndexFromX(layout, point.x);
    ensureMeasure(measureIndex);
    state.selectedMeasureIndex = measureIndex;
    const entries = state.measures[measureIndex].entries;
    state.selectedEntryIds = measureIsHidden(measureIndex) ? [] : entries.map((entry) => entry.id);
    state.selectedNoteRefs = [];
    state.cursorEntryId = state.selectedEntryIds[0] || null;
    clearActiveNote();
    hideCursorPitch();

    const first = selectedEntryLocation();
    if (first?.entry?.type === "note") {
      setActiveNote(first.entry, entryStaffStep(first.entry));
      state.cursorStaffStep = entryStaffStep(first.entry);
    }

    state.cursorMeasure = measureIndex;
    state.cursorTick = tickFromMeasureX(layout, measureIndex, point.x);
    state.cursorStaffStep = staffStepForSystem(stepFromY(point.y, activeSystemIndex()));
    state.cursorActive = false;
    state.entryCursorActive = false;
    setInputPhase(InputSession.PHASES.SELECT);
    syncActiveMeterToCursor();
    finalizeMeasureOnExit(previousMeasureIndex, state.cursorMeasure);
    render();
  }

  function renderTimeSignature(root, meter = state.meter || { ...DEFAULT_METER }, xOverride = null) {
    const top = String(meter.top || "4");
    const bottom = String(meter.bottom || "4");
    const baseSize = timeSignatureBaseSize(meter);
    const timeSignatureStyle = `font-size:${baseSize * appearanceValue("timeSignatureScale")}px`;
    const x = Number.isFinite(xOverride) ? xOverride : timeSignatureX();
    const y = pitchYForSystem(0, renderSystemIndex) + appearanceValue("timeSignatureOffsetY");
    if (meter.cutTime) {
      root.appendChild(textNode(x, y + 9, smufl("timeSigCutCommon"), {
        class: "music-glyph time-signature",
        style: `font-size:${32 * appearanceValue("timeSignatureScale")}px;${musicFontStyle("musicGlyphFont")}`
      }));
      return;
    }
    root.appendChild(textNode(x, y - 4, top, {
      class: "time-signature",
      style: `${timeSignatureStyle};${textFontStyle("timeSignatureFont")}`
    }));
    root.appendChild(textNode(x, y + 20, bottom, {
      class: "time-signature",
      style: `${timeSignatureStyle};${textFontStyle("timeSignatureFont")}`
    }));
  }

  function renderClefGlyph(root, clefId, x, y, options = {}) {
    const profile = clefProfile(clefId);
    const scale = Number(options.scale) || appearanceValue("clefScale");
    const className = options.className || "music-glyph clef";
    root.appendChild(glyphTextCentered(profile.glyphName, x, y, {
      class: className,
      "font-size": MUSIC_FONT_SIZE * appearanceValue("glyphScale") * scale
    }));
    if (profile.octaveText) {
      const octaveY = profile.octavePosition === "below"
        ? y + glyphHeight(profile.glyphName) * scale * 0.34 + 13
        : y - glyphHeight(profile.glyphName) * scale * 0.34 - 7;
      root.appendChild(textNode(x + glyphWidth(profile.glyphName) * scale * 0.24, octaveY, profile.octaveText, {
        class: "clef-octave",
        style: `font-size:${12 * scale}px;${textFontStyle("scoreTextFont")}`
      }));
    }
  }

  function renderClefMark(root, x, mark) {
    renderClefGlyph(root, mark?.clefId || DEFAULT_CLEF_ID, x + appearanceValue("clefOffsetX"), pitchYForSystem(0, renderSystemIndex) + appearanceValue("clefOffsetY"), {
      className: "music-glyph notation-mark clef clef-change",
      scale: appearanceValue("clefScale")
    });
  }

  function renderBarlineStroke(root, x, className = "bar-line", width = barLineWidth(), options = {}) {
    const y1 = options.spanAllSystems
      ? scoreStaffTopY() + appearanceValue("barLineTopOffsetY")
      : staffTopY() + appearanceValue("barLineTopOffsetY");
    const y2 = options.spanAllSystems
      ? scoreStaffBottomY() + appearanceValue("barLineBottomOffsetY")
      : staffBottomY() + appearanceValue("barLineBottomOffsetY");
    BasicRender.appendBarlineStroke(root, {
      x,
      y1,
      y2,
      offsetX: appearanceValue("barLineOffsetX"),
      className,
      width
    });
  }

  function renderRepeatDots(root, x, side, options = {}) {
    const systemIndexes = options.spanAllSystems
      ? Array.from({ length: systemCount() }, (_, index) => index)
      : [renderSystemIndex];
    BasicRender.appendRepeatDots(root, {
      x,
      side,
      offsetX: appearanceValue("barLineOffsetX"),
      systemIndexes,
      pitchYForSystem
    });
  }

  function renderBarlineAtBoundary(root, x, type = "single", mark = null, options = {}) {
    const boundaryIndex = Number.isFinite(Number(options.boundaryIndex))
      ? Number(options.boundaryIndex)
      : Number(mark?.boundaryIndex);
    const group = el("g", {
      class: `barline-group barline-${type}${mark && state.selectedMarkIds.includes(mark.id) ? " is-selected" : ""}`,
      style: mark?.color ? `--item-color:${normalizeItemColor(mark.color)}` : "",
      "data-boundary-index": Number.isFinite(boundaryIndex) ? boundaryIndex : ""
    });
    const thin = barLineWidth();
    const thick = Math.max(thin * 3.2, 3.2);
    const gap = Math.max(10, thick / 2 + thin / 2 + 5);

    if (type === "double") {
      renderBarlineStroke(group, x - gap / 2, "bar-line bar-line-custom", thin, options);
      renderBarlineStroke(group, x + gap / 2, "bar-line bar-line-custom", thin, options);
    } else if (type === "final") {
      renderBarlineStroke(group, x - gap / 2, "bar-line bar-line-custom", thin, options);
      renderBarlineStroke(group, x + gap / 2, "bar-line bar-line-custom bar-line-thick", thick, options);
    } else if (type === "repeat-start") {
      renderBarlineStroke(group, x - gap / 2, "bar-line bar-line-custom bar-line-thick", thick, options);
      renderBarlineStroke(group, x + gap / 2, "bar-line bar-line-custom", thin, options);
      renderRepeatDots(group, x + gap / 2, "right", options);
    } else if (type === "repeat-end") {
      renderRepeatDots(group, x - gap / 2, "left", options);
      renderBarlineStroke(group, x - gap / 2, "bar-line bar-line-custom", thin, options);
      renderBarlineStroke(group, x + gap / 2, "bar-line bar-line-custom bar-line-thick", thick, options);
    } else if (type === "repeat-both") {
      renderRepeatDots(group, x - gap / 2, "left", options);
      renderBarlineStroke(group, x - gap / 2, "bar-line bar-line-custom bar-line-thick", thick, options);
      renderBarlineStroke(group, x + gap / 2, "bar-line bar-line-custom bar-line-thick", thick, options);
      renderRepeatDots(group, x + gap / 2, "right", options);
    } else {
      renderBarlineStroke(group, x, "bar-line bar-line-custom", thin, options);
    }

    if (Number.isFinite(boundaryIndex)) {
      const hit = el("rect", {
        class: `barline-hit${state.editMode ? " barline-edit-hit" : ""}`,
        x: x - 16,
        y: (options.spanAllSystems ? scoreStaffTopY() : staffTopY()) - 18,
        width: 32,
        height: (options.spanAllSystems ? scoreStaffBottomY() - scoreStaffTopY() : staffBottomY() - staffTopY()) + 36,
        rx: 4
      });
      hit.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.button === 2) return;
        if (state.editMode) {
          startBarlineEditDrag(event, boundaryIndex);
          return;
        }
        if (mark) selectMark(mark, { toggle: isAdditiveSelectionEvent(event) });
      });
      hit.addEventListener("contextmenu", (event) => showBarlineContextMenu(event, boundaryIndex, mark));
      group.insertBefore(hit, group.firstChild);
    }

    root.appendChild(group);
  }

  function startBarlineEditDrag(event, boundaryIndex) {
    const measureIndex = Number(boundaryIndex) - 1;
    if (!Number.isFinite(measureIndex) || measureIndex < 0) return false;
    const startPoint = svgPointFromEvent(event);
    if (!startPoint) return false;
    const startLayout = buildLayout({ fresh: true });
    if (!Number.isFinite(startLayout.widths[measureIndex])) return false;
    const originalWidth = startLayout.widths[measureIndex];
    const minimumWidth = Math.max(24, naturalMeasureWidth(measureIndex));
    const maximumWidth = Math.max(minimumWidth, 8000);
    let moved = false;
    let committedHistory = false;

    const onMove = (moveEvent) => {
      const point = svgPointFromEvent(moveEvent);
      if (!point) return;
      const dx = point.x - startPoint.x;
      if (!moved && Math.abs(dx) < 2) return;
      moved = true;
      if (!committedHistory) {
        saveHistory();
        committedHistory = true;
      }
      const nextWidth = Math.max(minimumWidth, Math.min(maximumWidth, originalWidth + dx));
      setManualMeasureWidth(measureIndex, nextWidth);
      invalidateLayoutCache();
      requestRender();
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (moved) {
        invalidateLayoutCache();
        render();
      }
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
    return true;
  }

  function renderStaff(root, layout) {
    const scoreWidth = layout.totalWidth;
    const currentSystem = scoreSystems()[renderSystemIndex];
    const lineSteps = systemIsPercussionLine(currentSystem)
      ? [0]
      : Array.from({ length: 5 }, (_, index) => STAFF_LINE_TOP_STEP - index * 2);
    const visibleRuns = [];
    let runStart = null;
    layout.starts.forEach((start, index) => {
      if (measureIsHidden(index)) {
        if (runStart !== null) {
          visibleRuns.push({ start: runStart, end: start });
          runStart = null;
        }
        return;
      }
      if (runStart === null) runStart = index === 0 ? 0 : start;
    });
    if (runStart !== null) {
      const lastStart = layout.starts.at(-1) ?? scoreWidth;
      const lastWidth = layout.widths.at(-1) ?? 0;
      visibleRuns.push({ start: runStart, end: lastStart + lastWidth });
    }
    BasicRender.appendStaffLines(root, {
      lineSteps,
      visibleRuns,
      pitchY,
      offsetY: appearanceValue("staffLineOffsetY"),
      strokeWidth: staffLineWidth(),
      percussion: systemIsPercussionLine(currentSystem)
    });

    const clefId = systemIsPercussionLine(currentSystem) ? "clef-percussion" : initialClefId();
    const initialClefX = 30 + appearanceValue("clefOffsetX");
    const initialClefY = pitchYForSystem(0, renderSystemIndex) + appearanceValue("clefOffsetY");
    renderClefGlyph(root, clefId, initialClefX, initialClefY, {
      className: "music-glyph clef",
      scale: appearanceValue("clefScale")
    });
    renderInitialContextHit(root, {
      x: initialClefX - 26,
      y: staffTopY() - 34,
      width: 54,
      height: staffBottomY() - staffTopY() + 68
    }, "Clave inicial", 0);
    if (!systemIsPercussionLine(currentSystem)) {
      renderKeySignature(root);
      const keyWidth = estimatedKeySignatureWidth();
      if (keyWidth > 0) {
        renderInitialContextHit(root, {
          x: keySignatureStartX() - 12,
          y: staffTopY() - 24,
          width: Math.max(28, keyWidth + 24),
          height: staffBottomY() - staffTopY() + 48
        }, "Armadura inicial", 0);
      }
    }
    renderTimeSignature(root);
    renderInitialContextHit(root, {
      x: timeSignatureX() - 10,
      y: staffTopY() - 16,
      width: Math.max(34, estimatedTimeSignatureWidth(state.meter || DEFAULT_METER) + 20),
      height: staffBottomY() - staffTopY() + 32
    }, "Signatura inicial", 0);

    layout.starts.forEach((start, index) => {
      if (!measureIsHidden(index)) return;
      const selected = Number(state.selectedMeasureIndex) === index;
      root.appendChild(el("rect", {
        class: `hidden-measure-space${selected ? " is-selected" : ""}`,
        x: start,
        y: staffTopY() - 26,
        width: layout.widths[index],
        height: staffBottomY() - staffTopY() + 52,
        rx: 6
      }));
    });

    if (renderSystemIndex === 0) {
      visibleBarBoundaries(layout).forEach(({ boundaryIndex, x }) => {
        if (!barlineMarksAtBoundary(boundaryIndex).length) {
          renderBarlineAtBoundary(root, x, "single", null, { spanAllSystems: true, boundaryIndex });
        }
      });

      (state.marks || [])
        .filter((mark) => mark?.type === "barline")
        .forEach((mark) => {
          const x = boundaryX(layout, Number(mark.boundaryIndex));
          if (
            Number.isFinite(x)
          ) renderBarlineAtBoundary(root, x, mark.barlineType || "single", mark, {
            spanAllSystems: true,
            boundaryIndex: Number(mark.boundaryIndex)
          });
        });
    }

    layout.starts.forEach((start, index) => {
      const keyChange = systemIsPercussionLine(currentSystem) ? null : state.measures[index]?.keySignature;
      const meterChange = state.measures[index]?.meter;
      if (index > 0 && keyChange) {
        const keyX = start + measureLeftInset() + appearanceValue("keySignatureOffsetX");
        renderKeySignature(root, keyChange, keyX, {
          clefId: clefIdAtAbsoluteTick(measureStartAbsoluteTick(index))
        });
      }
      if (index > 0 && meterChange) {
        renderTimeSignature(
          root,
          meterChange,
          start + measureLeftInset() + keySignatureSpacingBeforeTime(index) + appearanceValue("timeSignatureOffsetX")
        );
      }
      if (measureIsHidden(index)) return;
      if (renderSystemIndex === 0 && (index === 0 || (!measureIsHidden(index - 1) && measureIsFull(state.measures[index - 1])))) {
        root.appendChild(textNode(start + 8 + appearanceValue("measureNumberOffsetX"), staffTopY() - 18 + appearanceValue("measureNumberOffsetY"), String(index + 1), {
          class: "duration-label",
          style: `font-size:${12 * appearanceValue("measureNumberScale")}px;${textFontStyle("scoreTextFont")}`
        }));
      }
    });
  }

  function renderLedger(root, x, staffStep) {
    EntryRender.appendLedgerLines(root, {
      x,
      staffStep,
      topStep: STAFF_LINE_TOP_STEP,
      bottomStep: STAFF_LINE_BOTTOM_STEP,
      pitchY,
      extension: appearanceValue("ledgerExtension"),
      offsetX: appearanceValue("ledgerOffsetX"),
      offsetY: appearanceValue("ledgerOffsetY"),
      strokeWidth: ledgerLineWidth(),
      className: "leger"
    });
  }

  function renderCursorLedger(root, x, staffStep) {
    EntryRender.appendLedgerLines(root, {
      x,
      staffStep,
      topStep: STAFF_LINE_TOP_STEP,
      bottomStep: STAFF_LINE_BOTTOM_STEP,
      pitchY,
      extension: appearanceValue("ledgerExtension"),
      offsetX: appearanceValue("ledgerOffsetX"),
      offsetY: appearanceValue("ledgerOffsetY"),
      strokeWidth: ledgerLineWidth(),
      className: "leger cursor-leger"
    });
  }


  function renderEntryHit(root, x, entry, measureIndex, entryIndex, systemIndex = activeSystemIndex()) {
    const rect = entryVisualRect(entry, x);
    if (!rect) return;
    const touchPadX = isTouchOptimizedInput() ? 12 : 0;
    const touchPadY = isTouchOptimizedInput() ? 14 : 0;
    const restPadX = entry.type === "rest" ? 14 : 0;
    const restPadY = entry.type === "rest" ? 18 : 0;
    const hit = el("rect", {
      class: "entry-hit",
      x: rect.left - touchPadX - restPadX,
      y: rect.top - touchPadY - restPadY,
      width: Math.max(1, rect.right - rect.left + (touchPadX + restPadX) * 2),
      height: Math.max(1, rect.bottom - rect.top + (touchPadY + restPadY) * 2)
    });
    hit.addEventListener("pointerdown", (event) => {
      if (event.button === 2) return;
      setActiveSystemIndex(systemIndex);
      if (state.editMode) {
        event.stopPropagation();
        event.preventDefault();
        startEntryEditDrag(event, { measureIndex, entryIndex, entry });
        return;
      }
      if (state.dynamicMode && entry.type === "note") {
        event.stopPropagation();
        addDynamicItemAtAnchor(dynamicAnchorFromEntry(entry));
        return;
      }
      if (state.textMode || state.chordMode || state.dynamicMode) {
        const point = svgPointFromEvent(event);
        event.stopPropagation();
        addActiveTextLikeItemAtPoint(point);
        return;
      }
      const point = svgPointFromEvent(event);
      if (entry.type !== "rest" && !entryWrittenElementContainsPoint(entry, x, point)) {
        beginDragSelection(event);
        return;
      }
      event.stopPropagation();
      const stemHitRect = entry.type === "note" && entryStaffSteps(entry).length > 1
        ? stemRect(entry, x)
        : null;
      const clickedStem = !!stemHitRect && pointInRect(point, stemHitRect);
      if (isAdditiveSelectionEvent(event)) {
        toggleEntrySelection(measureIndex, entryIndex, {
          staffStep: staffStepForEntryPointer(entry, event),
          wholeEntry: clickedStem
        });
        return;
      }
      if (clickedStem) {
        selectChordEntry(measureIndex, entryIndex, {
          activateCursor: false,
          staffStep: staffStepForEntryPointer(entry, event)
        });
      } else {
        selectEntry(measureIndex, entryIndex, {
          activateCursor: false,
          staffStep: staffStepForEntryPointer(entry, event),
          selectHead: entry.type === "note" && entryStaffSteps(entry).length > 1
        });
      }
      render();
    });
    root.appendChild(hit);
  }

  function startEntryEditDrag(event, location) {
    const entry = location?.entry;
    const start = svgPointFromEvent(event);
    if (!entry || !start) return;
    const originalOffsetX = visualOffset(entry, "x");
    const originalOffsetY = visualOffset(entry, "y");
    const originalSteps = entry.type === "note" ? entryStaffSteps(entry) : [];
    let moved = false;
    let committedHistory = false;
    if (entry.type === "note") {
      selectEntry(location.measureIndex, location.entryIndex, {
        activateCursor: false,
        staffStep: staffStepForEntryPointer(entry, event),
        selectHead: false
      });
    } else {
      selectEntry(location.measureIndex, location.entryIndex, { activateCursor: false });
    }

    const onMove = (moveEvent) => {
      const point = svgPointFromEvent(moveEvent);
      if (!point) return;
      const dx = point.x - start.x;
      const dy = point.y - start.y;
      if (!moved && Math.hypot(dx, dy) < 2) return;
      moved = true;
      if (!committedHistory) {
        saveHistory();
        committedHistory = true;
      }
      entry.offsetX = Math.max(-160, Math.min(160, originalOffsetX + dx));
      if (entry.type === "note" && !activeSystemIsPercussionLine()) {
        const stepDelta = Math.round(-dy / STEP_HEIGHT);
        setEntryStaffSteps(entry, originalSteps.map((staffStep) => staffStepForSystem(staffStep + stepDelta)));
      } else {
        entry.offsetY = Math.max(-160, Math.min(160, originalOffsetY + dy));
      }
      invalidateLayoutCache();
      requestRender();
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (!moved) render();
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
  }

  function renderRest(root, x, y, entry) {
    const duration = entryDuration(entry);
    const symbols = {
      breve: MUSIC_GLYPHS.restDoubleWhole,
      whole: MUSIC_GLYPHS.restWhole,
      half: MUSIC_GLYPHS.restHalf,
      quarter: MUSIC_GLYPHS.restQuarter,
      eighth: MUSIC_GLYPHS.restEighth,
      sixteenth: MUSIC_GLYPHS.restSixteenth,
      "thirty-second": MUSIC_GLYPHS.restThirtySecond,
      "sixty-fourth": MUSIC_GLYPHS.restSixtyFourth,
      "one-twenty-eighth": MUSIC_GLYPHS.restOneTwentyEighth
    };
    const glyphName = {
      breve: "restDoubleWhole",
      whole: "restWhole",
      half: "restHalf",
      quarter: "restQuarter",
      eighth: "rest8th",
      sixteenth: "rest16th",
      "thirty-second": "rest32nd",
      "sixty-fourth": "rest64th",
      "one-twenty-eighth": "rest128th"
    }[duration.id] || "restQuarter";
    const restNode = glyphTextCentered(glyphName, x + appearanceValue("restOffsetX"), y + appearanceValue("restOffsetY"), {
      class: "music-glyph rest-symbol",
      "data-center-y": y + appearanceValue("restOffsetY") + appearanceValue("restCenterShift"),
      "data-optical-y": restOpticalOffset(duration.id),
      "font-size": restFontSize(duration)
    });
    root.appendChild(restNode);
    const dots = dotCountForEntry(entry);
    for (let index = 0; index < dots; index += 1) {
      renderDot(
        root,
        x + appearanceValue("restOffsetX") + restVisualWidth(duration.id) / 2 + appearanceValue("dotGap") + index * (DOT_VISUAL_WIDTH + 4),
        y - STEP_HEIGHT / 2
      );
    }
  }

  function dotYForStaffStep(staffStep) {
    return Math.abs(staffStep % 2) < EPSILON
      ? pitchY(staffStep) - STEP_HEIGHT / 2
      : pitchY(staffStep);
  }

  function renderDot(root, x, y) {
    root.appendChild(glyphTextCentered("augmentationDot", x, y + appearanceValue("dotOffsetY"), {
      class: "music-glyph duration-dot",
      "font-size": musicGlyphSize("dotScale")
    }));
  }

  function renderEntryDots(root, entry, x) {
    const dots = dotCountForEntry(entry);
    if (!dots || entry.type === "rest") return;
    entryStaffSteps(entry).forEach((staffStep) => {
      const headX = x + noteHeadOffset(entry, staffStep);
      for (let index = 0; index < dots; index += 1) {
        renderDot(root, headX + dotXOffset() + index * (DOT_VISUAL_WIDTH + 4), dotYForStaffStep(staffStep));
      }
    });
  }

  function alignRestSymbols() {
    svg.querySelectorAll(".rest-symbol").forEach((node) => {
      const centerY = Number(node.getAttribute("data-center-y"));
      const opticalY = Number(node.getAttribute("data-optical-y")) || 0;
      if (!Number.isFinite(centerY)) return;
      try {
        const box = node.getBBox();
        const currentCenter = box.y + box.height / 2;
        node.setAttribute("transform", `translate(0 ${centerY - currentCenter + opticalY})`);
      } catch {
        node.removeAttribute("transform");
      }
    });
  }

  function scheduleRestAlignment() {
    alignRestSymbols();
    Perf.scheduleFrame("restAlignment", alignRestSymbols);
    if (document.fonts && !restFontAlignmentQueued) {
      restFontAlignmentQueued = true;
      document.fonts.ready.then(() => {
        restFontAlignmentQueued = false;
        alignRestSymbols();
      });
    }
  }

  function renderNote(root, entry, x) {
    const duration = entryDuration(entry);
    const staffSteps = entryStaffSteps(entry);
    const sortedSteps = [...staffSteps].sort((a, b) => b - a);
    sortedSteps.forEach((staffStep) => {
      const headX = x + noteHeadOffset(entry, staffStep);
      const y = pitchY(staffStep);
      renderLedger(root, headX, staffStep);
      const isActiveHead = (
        (entry.id === state.activeNoteEntryId && Math.abs(staffStep - state.activeNoteStaffStep) < EPSILON) ||
        isNoteHeadSelected(entry, staffStep)
      );
      const headNode = noteHead(headX, y, duration.id, isActiveHead ? "active-note-head" : "", entryNoteheadGlyphName(entry, staffStep));
      const noteColor = entryNoteColor(entry, staffStep);
      if (noteColor) headNode.style.setProperty("--note-color", normalizeItemColor(noteColor));
      root.appendChild(headNode);
    });
    sortedSteps.forEach((staffStep) => {
      const headX = x + noteHeadOffset(entry, staffStep);
      const y = pitchY(staffStep);
      renderAccidental(root, headX, y, getEntryDisplayAccidental(entry, staffStep), "", accidentalXOffsetFor(entry, staffStep));
    });
    renderEntryDots(root, entry, x);

    if (duration.id === "whole" || duration.id === "breve") return null;

    const direction = stemDirection(entry);
    const outerStep = direction > 0 ? Math.max(...staffSteps) : Math.min(...staffSteps);
    const stemStart = stemAnchorPoint(entry, x, stemAnchorStep(entry, direction), direction);
    const stemX = stemStart.x;
    const stemEnd = pitchY(outerStep + direction * STEM_OCTAVE_STEPS);
    const stemLine = renderStemGlyph(root, stemX, stemStart.y, stemEnd);

    if (duration.flags > 0) {
      return { entry, x, y: stemStart.y, stemX, stemEnd, stemLine, direction, flags: duration.flags };
    }
    return null;
  }

  function renderFlags(root, flagged) {
    flagged.forEach((item) => {
      const flagNames = item.direction > 0
        ? ["", "flag8thUp", "flag16thUp", "flag32ndUp", "flag64thUp", "flag128thUp"]
        : ["", "flag8thDown", "flag16thDown", "flag32ndDown", "flag64thDown", "flag128thDown"];
      const name = flagNames[Math.min(item.flags, flagNames.length - 1)];
      if (!name) return;
      root.appendChild(glyphTextAtAnchor(
        name,
        item.direction > 0 ? "stemUpNW" : "stemDownSW",
        visualFlagX(item.stemX, item.direction),
        visualFlagY(item.stemEnd, item.direction),
        {
          class: "music-glyph flag-symbol",
          "font-size": musicGlyphSize("flagScale"),
          style: item.entry?.color ? `--item-color:${normalizeItemColor(item.entry.color)}` : ""
        }
      ));
    });
  }

  function renderBeams(root, flagged, protectedGlyphs = []) {
    const groups = [];
    let current = [];
    const pulseIndex = (entry) => pulseIndexForTick(entry.tickStart);
    const halfMeasureIndex = (entry) => Math.floor(entry.tickStart / Math.max(1, measureTicks() / 2));
    const pulseKey = (item) => `${item.measureIndex}:${pulseIndex(item.entry)}`;
    const halfMeasureKey = (item) => `${item.measureIndex}:${halfMeasureIndex(item.entry)}`;
    const tupletBeamKey = (item) => item.entry.tuplet?.id || "";
    const sameVoice = (previous, item) => entryVoice(previous.entry) === entryVoice(item.entry);
    const sameTupletBeamGroup = (previous, item) => tupletBeamKey(item) === tupletBeamKey(previous);
    const samePulse = (previous, item) => pulseKey(item) === pulseKey(previous);
    const sameEighthHalfMeasure = (previous, item) => (
      previous.flags === 1 &&
      item.flags === 1 &&
      activeMeterProfile().kind === "simple" &&
      halfMeasureKey(item) === halfMeasureKey(previous)
    );
    const sameBeamWindow = (previous, item) => (
      tupletBeamKey(item)
        ? sameTupletBeamGroup(previous, item)
        : sameEighthHalfMeasure(previous, item) || samePulse(previous, item)
    );
    const pulseIsComplete = (item) => {
      const entries = item.measureEntries || [];
      const { start, end } = pulseRangeForTick(item.entry.tickStart);
      const pulseEntries = entries
        .filter((entry) => (
          entryVoice(entry) === entryVoice(item.entry) &&
          entry.tickStart >= start &&
          entry.tickStart < end
        ))
        .sort((a, b) => a.tickStart - b.tickStart);
      if (!pulseEntries.length || pulseEntries[0].tickStart !== start) return false;
      let cursor = start;
      for (const entry of pulseEntries) {
        if (entry.tickStart !== cursor) return false;
        cursor += entry.ticks;
      }
      return cursor === end;
    };
    const restsBetween = (previous, item) => {
      const entries = item.measureEntries || [];
      return entries
        .slice(previous.entryIndex + 1, item.entryIndex)
        .filter((entry) => entryVoice(entry) === entryVoice(item.entry))
        .every((entry) => entry.type === "rest" && (entry.tuplet?.id || "") === tupletBeamKey(item));
    };
    const manualBeamGroup = (item) => item.entry.manualBeamGroup || "";
    const manualBeamAllowsJoin = (previous, item) => (
      previous.measureIndex === item.measureIndex &&
      sameVoice(previous, item) &&
      !!manualBeamGroup(previous) &&
      manualBeamGroup(previous) === manualBeamGroup(item)
    );
    const hasManualBeamBoundary = (previous, item) => (
      !sameVoice(previous, item) ||
      item.entry.manualBeamBreakBefore === true ||
      previous.entry.manualBeamBreakAfter === true ||
      (!!manualBeamGroup(previous) && manualBeamGroup(previous) !== manualBeamGroup(item)) ||
      (!!manualBeamGroup(item) && manualBeamGroup(previous) !== manualBeamGroup(item))
    );
    const canBeamAcrossRests = (previous, item) => (
      sameVoice(previous, item) &&
      sameTupletBeamGroup(previous, item) &&
      samePulse(previous, item) &&
      restsBetween(previous, item) &&
      pulseIsComplete(item)
    );
    const consecutiveTupletSlots = (previous, item) => {
      if (!sameVoice(previous, item) || !tupletBeamKey(item) || !sameTupletBeamGroup(previous, item)) return false;
      const previousEnd = (Number(previous.entry.tuplet?.index) || 0) + Math.max(1, Number(previous.entry.tuplet?.span) || 1);
      const itemStart = Number(item.entry.tuplet?.index) || 0;
      return previousEnd === itemStart || restsBetween(previous, item);
    };
    const canJoinGroup = (previous, item) => {
      if (!sameVoice(previous, item)) return false;
      if (hasManualBeamBoundary(previous, item)) return false;
      if (manualBeamAllowsJoin(previous, item)) return true;
      return sameTupletBeamGroup(previous, item) &&
        sameBeamWindow(previous, item) &&
        (
          consecutiveTupletSlots(previous, item) ||
          (
            item.entry.tickStart === previous.entry.tickStart + previous.entry.ticks
          ) ||
          canBeamAcrossRests(previous, item)
        );
    };
    [...flagged]
      .sort((a, b) => (
        a.measureIndex - b.measureIndex ||
        entryVoice(a.entry) - entryVoice(b.entry) ||
        a.entry.tickStart - b.entry.tickStart ||
        a.entryIndex - b.entryIndex
      ))
      .forEach((item) => {
      if (!current.length || canJoinGroup(current.at(-1), item)) {
        current.push(item);
      } else {
        groups.push(current);
        current = [item];
      }
    });
    if (current.length) groups.push(current);

    const singles = [];
    groups.forEach((group) => {
      if (group.length < 2) {
        singles.push(...group);
        return;
      }
      const manualDirection = group.find((item) => item.entry.manualStemDirection === 1 || item.entry.manualStemDirection === -1)?.entry.manualStemDirection;
      const direction = manualDirection || (group.reduce((sum, item) => sum + item.direction, 0) >= 0 ? 1 : -1);
      const first = group[0];
      const last = group[group.length - 1];
      const preliminaryY = direction > 0
        ? Math.min(...group.map((item) => item.stemEnd)) - 2
        : Math.max(...group.map((item) => item.stemEnd)) + 2;
      const y = avoidBeamCollisions(preliminaryY, direction, first.stemX, last.stemX, protectedGlyphs, beamThickness());
      const startOffset = Number(first.entry.manualBeamStartYOffset) || 0;
      const endOffset = Number(last.entry.manualBeamEndYOffset) || 0;
      const yStart = y + startOffset;
      const yEnd = y + endOffset;
      const beamYAtStem = (stemX) => {
        const span = last.stemX - first.stemX;
        if (Math.abs(span) < EPSILON) return yStart;
        const ratio = (stemX - first.stemX) / span;
        return yStart + (yEnd - yStart) * ratio;
      };
      group.forEach((item) => {
        item.direction = direction;
        item.stemX = stemXForEntry(item.entry, item.x, direction);
        item.y = stemAnchorPoint(item.entry, item.x, stemAnchorStep(item.entry, direction), direction).y;
        item.stemEnd = beamYAtStem(item.stemX);
        setStemGlyph(item.stemLine, item.stemX, item.y, item.stemEnd);
      });
      root.appendChild(el("line", {
        class: "beam",
        style: first.entry?.color ? `--item-color:${normalizeItemColor(first.entry.color)}` : "",
        x1: visualStemX(first.stemX, direction) + appearanceValue("beamOffsetX"),
        y1: visualStemY(yStart, direction) + appearanceValue("beamOffsetY"),
        x2: visualStemX(last.stemX, direction) + appearanceValue("beamOffsetX"),
        y2: visualStemY(yEnd, direction) + appearanceValue("beamOffsetY"),
        "stroke-width": beamThickness(),
        "stroke-linecap": "butt"
      }));
      const beamHit = el("line", {
        class: "beam-hit",
        x1: visualStemX(first.stemX, direction) + appearanceValue("beamOffsetX"),
        y1: visualStemY(yStart, direction) + appearanceValue("beamOffsetY"),
        x2: visualStemX(last.stemX, direction) + appearanceValue("beamOffsetX"),
        y2: visualStemY(yEnd, direction) + appearanceValue("beamOffsetY"),
        "stroke-width": Math.max(14, beamThickness() + 10),
        "stroke-linecap": "round"
      });
      const beamSystemIndex = renderSystemIndex;
      beamHit.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        selectBeamedGroup(group, beamSystemIndex);
      });
      beamHit.addEventListener("contextmenu", (event) => {
        const firstLocation = entryLocationById(first.entry.id);
        if (!firstLocation) return;
        showEntryContextMenu(event, {
          ...firstLocation,
          systemIndex: beamSystemIndex,
          staffStep: entryStaffStep(first.entry),
          wholeChord: false
        });
      });
      root.appendChild(beamHit);

      const maxFlags = Math.max(...group.map((item) => item.flags));
      for (let level = 2; level <= maxFlags; level += 1) {
        const runs = [];
        let run = [];
        group.forEach((item) => {
          const previous = run.at(-1);
          if (
            item.flags >= level &&
            (!previous || item.entry.tickStart - previous.entry.tickStart <= 1)
          ) {
            run.push(item);
          } else {
            if (run.length > 1) runs.push(run);
            run = item.flags >= level ? [item] : [];
          }
        });
        if (run.length > 1) runs.push(run);

        const connected = new Set();
        runs.forEach((items) => {
          items.forEach((item) => connected.add(item));
          const firstAtLevel = items[0];
          const lastAtLevel = items[items.length - 1];
          const beamYStart = beamYAtStem(firstAtLevel.stemX) + direction * beamLevelDistance() * (level - 1);
          const beamYEnd = beamYAtStem(lastAtLevel.stemX) + direction * beamLevelDistance() * (level - 1);
          root.appendChild(el("line", {
            class: "beam",
            style: firstAtLevel.entry?.color ? `--item-color:${normalizeItemColor(firstAtLevel.entry.color)}` : "",
            x1: visualStemX(firstAtLevel.stemX, direction) + appearanceValue("beamOffsetX"),
            y1: visualStemY(beamYStart, direction) + appearanceValue("beamOffsetY"),
            x2: visualStemX(lastAtLevel.stemX, direction) + appearanceValue("beamOffsetX"),
            y2: visualStemY(beamYEnd, direction) + appearanceValue("beamOffsetY"),
            "stroke-width": beamThickness(),
            "stroke-linecap": "butt"
          }));
        });

        group
          .filter((item) => item.flags >= level && !connected.has(item))
          .forEach((item) => {
            const partialLength = appearanceValue("partialBeamLength");
            const index = group.indexOf(item);
            const previous = group[index - 1];
            const next = group[index + 1];
            const sameBeat = (other) => other &&
              entryVoice(other.entry) === entryVoice(item.entry) &&
              pulseIndexForTick(other.entry.tickStart) === pulseIndexForTick(item.entry.tickStart);
            const pulseSpan = pulseRangeForTick(item.entry.tickStart).end - pulseRangeForTick(item.entry.tickStart).start;
            const pointsLeft = sameBeat(previous) && item.entry.tickStart - previous.entry.tickStart <= pulseSpan + EPSILON;
            const pointsRight = !pointsLeft && sameBeat(next) && next.entry.tickStart - item.entry.tickStart <= pulseSpan + EPSILON;
            const x2 = pointsLeft
              ? item.stemX - partialLength
              : pointsRight
                ? item.stemX + partialLength
                : item.stemX + partialLength;
            const beamY = beamYAtStem(item.stemX) + direction * beamLevelDistance() * (level - 1);
            root.appendChild(el("line", {
              class: "beam",
              style: item.entry?.color ? `--item-color:${normalizeItemColor(item.entry.color)}` : "",
              x1: visualStemX(item.stemX, direction) + appearanceValue("beamOffsetX") + appearanceValue("partialBeamOffsetX"),
              y1: visualStemY(beamY, direction) + appearanceValue("beamOffsetY") + appearanceValue("partialBeamOffsetY"),
              x2: visualStemX(x2, direction) + appearanceValue("beamOffsetX") + appearanceValue("partialBeamOffsetX"),
              y2: visualStemY(beamY, direction) + appearanceValue("beamOffsetY") + appearanceValue("partialBeamOffsetY"),
              "stroke-width": beamThickness(),
              "stroke-linecap": "butt"
            }));
          });
      }
    });
    renderFlags(root, singles);
  }

  function selectBeamedGroup(group, systemIndex = activeSystemIndex()) {
    if (!Array.isArray(group) || !group.length) return false;
    setActiveSystemIndex(systemIndex);
    clearMeasureSelection();
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    hideCursorPitch();
    const ordered = [...group].sort((a, b) => (
      a.measureIndex - b.measureIndex || a.entry.tickStart - b.entry.tickStart || a.entryIndex - b.entryIndex
    ));
    state.selectedEntryIds = ordered.map((item) => item.entry.id);
    state.selectedNoteRefs = [];
    state.cursorEntryId = ordered[0]?.entry.id || null;
    state.cursorMeasure = ordered[0]?.measureIndex ?? state.cursorMeasure;
    state.cursorTick = ordered[0]?.entry.tickStart ?? state.cursorTick;
    state.cursorActive = true;
    state.entryCursorActive = false;
    const firstNote = ordered.find((item) => item.entry.type === "note")?.entry;
    if (firstNote) {
      state.cursorStaffStep = entryStaffStep(firstNote);
      setActiveNote(firstNote, entryStaffStep(firstNote));
    }
    state.selectMode = true;
    render();
    return true;
  }

  function positionedEntries(layout) {
    const cacheKey = `positioned:${contextSystemIndex()}`;
    const cache = Perf.layoutCache(layout, "positionedEntries");
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const entries = state.measures.flatMap((measure, measureIndex) => {
      if (measureIsHidden(measureIndex)) return [];
      const start = layout.starts[measureIndex];
      const width = layout.widths[measureIndex];
      const positions = measureEntryPositions(measure, start, width);
      return measure.entries.map((entry, entryIndex) => ({
        measureIndex,
        entryIndex,
        entry,
        x: positions.get(entry.id) ?? xForTick(start, width, entry.tickStart)
      }));
    });
    cache.set(cacheKey, entries);
    return entries;
  }

  function layoutHitIndex(layout = buildLayout()) {
    const cacheKey = `hit:${contextSystemIndex()}`;
    const cache = Perf.layoutCache(layout, "hitIndex");
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const entries = positionedEntries(layout).map((item) => {
      const rect = entrySelectionRect(item);
      const headRects = noteHeadSelectionRects(item);
      return { ...item, rect, headRects };
    });
    const byEntryId = new Map(entries.map((item) => [item.entry.id, item]));
    const noteHeads = entries.flatMap((item) => (
      item.headRects.map((head) => ({
        ...head,
        measureIndex: item.measureIndex,
        entryIndex: item.entryIndex,
        entry: item.entry,
        x: item.x
      }))
    ));
    const textItems = (state.textItems || []).map((item) => {
      const systemIndex = textItemSystemIndex(item);
      const metrics = withSystemContext(systemIndex, () => textItemMetrics(item, layout));
      return { item, systemIndex, metrics };
    });
    const index = { entries, byEntryId, noteHeads, textItems };
    cache.set(cacheKey, index);
    return index;
  }

  function renderTupletIndicators(root, layout) {
    const groups = new Map();
    const activeOpenTupletId = isTupletWritingOpen() ? state.activeTupletRun.id : null;
    positionedEntries(layout).forEach((item) => {
      if (!item.entry?.tuplet?.id || item.entry.hiddenTupletReserve) return;
      if (item.entry.tuplet.id === activeOpenTupletId) return;
      if (!groups.has(item.entry.tuplet.id)) groups.set(item.entry.tuplet.id, []);
      groups.get(item.entry.tuplet.id).push(item);
    });

    groups.forEach((items) => {
      const ordered = [...items].sort((a, b) => a.measureIndex - b.measureIndex || a.entry.tickStart - b.entry.tickStart);
      if (!ordered.length) return;
      const first = ordered[0];
      const last = ordered.at(-1);
      const startX = first.x - entryLeftExtent(first.entry) * 0.25;
      const endX = last.x + entryRightExtent(last.entry) * 0.5;
      const rects = ordered.map((item) => entryVisualRect(item.entry, item.x)).filter(Boolean);
      const top = rects.length
        ? Math.min(...rects.map((rect) => rect.top))
        : staffTopY();
      const y = Math.min(staffTopY() - 16, top - 14);
      const label = first.entry.tuplet.label || tupletDisplayLabel(first.entry.tuplet, "group");
      root.appendChild(el("path", {
        class: "tuplet-bracket",
        d: `M ${startX} ${y + 5} L ${startX} ${y} L ${endX} ${y} L ${endX} ${y + 5}`,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.4,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }));
      root.appendChild(textNode((startX + endX) / 2, y - 3, label, {
        class: "duration-label tuplet-label",
        "text-anchor": "middle",
        style: `font-size:14px;${textFontStyle("scoreTextFont")}`
      }));
    });
  }

  function normalizeRect(a, b) {
    return Geometry.normalizeRect
      ? Geometry.normalizeRect(a, b)
      : {
        left: Math.min(a.x, b.x),
        right: Math.max(a.x, b.x),
        top: Math.min(a.y, b.y),
        bottom: Math.max(a.y, b.y)
      };
  }

  function entrySelectionRect(item) {
    return entryVisualRect(item.entry, item.x) || {
      left: item.x,
      right: item.x,
      top: STAFF_CENTER_Y,
      bottom: STAFF_CENTER_Y
    };
  }

  function noteHeadSelectionRects(item) {
    if (item.entry.type === "rest") return [];
    return entryStaffSteps(item.entry).map((staffStep) => ({
      entryId: item.entry.id,
      staffStep,
      rect: expandedRect(noteHeadRect(item.entry, item.x, staffStep), 5, 6)
    }));
  }

  function noteHeadHitAtPoint(point, layout = buildLayout()) {
    if (!point) return null;
    const hitIndex = layoutHitIndex(layout);
    return [...hitIndex.noteHeads]
      .reverse()
      .find((head) => pointInRect(point, head.rect)) || null;
  }

  function selectNoteHeadAtPoint(point, event = {}) {
    if (!point) return false;
    setActiveSystemIndex(systemIndexFromY(point.y));
    const hit = noteHeadHitAtPoint(point);
    if (!hit?.entry || hit.entry.type === "rest") return false;
    if (isAdditiveSelectionEvent(event)) {
      toggleEntrySelection(hit.measureIndex, hit.entryIndex, {
        staffStep: hit.staffStep,
        wholeEntry: false
      });
    } else {
      selectEntry(hit.measureIndex, hit.entryIndex, {
        activateCursor: false,
        staffStep: hit.staffStep,
        selectHead: true
      });
      render();
    }
    return true;
  }

  function updateDragSelection(point) {
    if (!state.dragSelection || !point) return;
    state.dragSelection.current = point;
    const rect = normalizeRect(state.dragSelection.start, point);
    const layout = buildLayout();
    const hitIndex = layoutHitIndex(layout);
    const entryIds = [];
    const noteRefs = [];
    const selectedTextItems = [];
    hitIndex.entries.forEach((item) => {
      if (item.entry.type === "rest") {
        if (rectsOverlap(rect, item.rect)) entryIds.push(item.entry.id);
        return;
      }
      const selectedHeads = item.headRects.filter((head) => rectsOverlap(rect, head.rect));
      if (selectedHeads.length) {
        selectedHeads.forEach((head) => noteRefs.push({ entryId: head.entryId, staffStep: head.staffStep }));
      } else if (rectsOverlap(rect, item.rect)) {
        entryIds.push(item.entry.id);
      }
    });
    hitIndex.textItems.forEach(({ item, metrics }) => {
      if (rectsOverlap(rect, metrics.hitRect)) selectedTextItems.push(item);
    });
    state.selectedEntryIds = entryIds;
    state.selectedNoteRefs = noteRefs;
    state.activeTextId = selectedTextItems[0]?.id || null;
    state.selectedTextIds = selectedTextItems.map((item) => item.id);
    if (selectedTextItems[0]) {
      state.textStyle = { ...state.textStyle, ...(selectedTextItems[0].style || {}) };
    }
    const firstNote = noteRefs[0];
    state.cursorEntryId = firstNote?.entryId || entryIds[0] || null;
    if (firstNote || entryIds.length) {
      const first = entryLocationById(state.cursorEntryId);
      if (first?.entry) activateVoiceForEntrySelection(first.entry);
      if (firstNote && first?.entry?.type === "note") setActiveNote(first.entry, firstNote.staffStep);
      else if (first?.entry?.type === "note") setActiveNote(first.entry, entryStaffStep(first.entry));
      else clearActiveNote();
      state.cursorActive = false;
      state.entryCursorActive = false;
      setInputPhase(InputSession.PHASES.SELECT);
    } else if (selectedTextItems.length) {
      clearActiveNote();
      hideCursorPitch();
      state.cursorActive = false;
      state.entryCursorActive = false;
    }
  }

  function beginDragSelection(event) {
    if (event.button !== 0) return;
    const activeEditor = document.getElementById("floatingTextEditor");
    if (activeEditor?.classList.contains("is-visible") && event.target !== activeEditor) {
      event.preventDefault();
      event.stopPropagation();
      activeEditor.blur();
      return;
    }
    const start = svgPointFromEvent(event);
    if (!start) return;
    setActiveSystemIndex(systemIndexFromY(start.y));
    event.preventDefault();
    event.stopPropagation();
    if (isNoteInputMode()) {
      const onInputPointerUp = (upEvent) => {
        const point = svgPointFromEvent(upEvent) || start;
        positionCursorFromPoint(point);
      };
      document.addEventListener("pointerup", onInputPointerUp, { once: true });
      return;
    }
    state.dragSelection = { start, current: start };
    state.selectedEntryIds = [];
    state.selectedNoteRefs = [];
    clearMeasureSelection();
    state.cursorEntryId = null;
    clearTextSelection();
    clearMarkSelection();
    clearActiveNote();
    const onMove = (moveEvent) => {
      const point = svgPointFromEvent(moveEvent);
      updateDragSelection(point);
      requestRender();
    };
    const onUp = (upEvent) => {
      const point = svgPointFromEvent(upEvent);
      updateDragSelection(point);
      const rect = state.dragSelection ? normalizeRect(state.dragSelection.start, state.dragSelection.current) : null;
      const isClick = rect && Math.abs(rect.right - rect.left) < 4 && Math.abs(rect.bottom - rect.top) < 4;
      state.dragSelection = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (isClick) {
        const clickPoint = point || start;
        if (state.textMode || state.chordMode || state.dynamicMode) {
          addActiveTextLikeItemAtPoint(clickPoint);
        } else if (selectNoteHeadAtPoint(clickPoint, event)) {
          return;
        } else if (pointIsInStaffArea(clickPoint)) {
          completeCurrentMeasureWithRests();
          selectMeasureFromPoint(clickPoint);
        } else {
          deselectAll();
        }
      }
      else render();
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
    render();
  }

  function handleScoreClick(event) {
    if (Date.now() < touchState.suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!(state.textMode || state.chordMode || state.dynamicMode)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function handleScoreDoubleClick(event) {
    if (state.textMode || state.chordMode || state.dynamicMode || state.editMode) return;
    const point = svgPointFromEvent(event);
    if (!point || !pointIsInStaffArea(point)) return;
    event.preventDefault();
    event.stopPropagation();
    positionCursorFromPoint(point);
  }

  function updateShiftDragCursor(event) {
    document.documentElement.classList.toggle("text-shift-drag-ready", event?.shiftKey === true);
  }

  function clearShiftDragCursor() {
    document.documentElement.classList.remove("text-shift-drag-ready");
  }

  function renderDragSelection(root) {
    if (!state.dragSelection) return;
    const rect = normalizeRect(state.dragSelection.start, state.dragSelection.current);
    root.appendChild(el("rect", {
      class: "selection-marquee",
      x: rect.left,
      y: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      rx: 4
    }));
  }

  function renderTies(root, layout) {
    const entries = positionedEntries(layout);
    entries.forEach((item, index) => {
      if (item.entry.type === "rest" || !item.entry.tieToNext) return;
      const voice = entryVoice(item.entry);
      const next = entries.slice(index + 1).find((candidate) => (
        candidate.entry.type !== "rest" &&
        entryVoice(candidate.entry) === voice
      ));
      if (!next) return;
      const sourceStep = Number.isFinite(item.entry.tieStaffStep)
        ? nearestEntryStaffStep(item.entry, item.entry.tieStaffStep)
        : entryStaffStep(item.entry);
      const targetStep = nearestEntryStaffStep(next.entry, sourceStep);
      const sourceHeadX = item.x + noteHeadOffset(item.entry, sourceStep);
      const targetHeadX = next.x + noteHeadOffset(next.entry, targetStep);
      const tieSide = stemDirection(item.entry) > 0 ? 1 : -1;
      const sourceY = pitchY(sourceStep) + tieSide * (NOTE_HEAD_RY + 2) + appearanceValue("tieOffsetY") + appearanceValue("tieStartOffsetY");
      const targetY = pitchY(targetStep) + tieSide * (NOTE_HEAD_RY + 2) + appearanceValue("tieOffsetY") + appearanceValue("tieEndOffsetY");
      const x1 = sourceHeadX + appearanceValue("tieOffsetX") + appearanceValue("tieEndpointInset") + appearanceValue("tieStartOffsetX");
      const x2 = targetHeadX + appearanceValue("tieOffsetX") - appearanceValue("tieEndpointInset") + appearanceValue("tieEndOffsetX");
      if (x2 <= x1 + 10) return;
      const span = Math.hypot(x2 - x1, targetY - sourceY);
      const arcDepth = Math.max(5, Math.min(11, span * 0.1)) * appearanceValue("tieArcScale");
      const midpointThickness = SMUFL_DEFAULTS.tieMidpointThickness * SMUFL_SPACE * appearanceValue("tieThicknessScale");
      const thickness = Math.max(midpointThickness * 1.25, Math.min(midpointThickness * 1.75, span * 0.055));
      const controlX1 = x1 + (x2 - x1) * 0.34;
      const controlX2 = x1 + (x2 - x1) * 0.66;
      const controlY1 = sourceY + tieSide * arcDepth;
      const controlY2 = targetY + tieSide * arcDepth;
      const innerControlY1 = controlY1 - tieSide * thickness;
      const innerControlY2 = controlY2 - tieSide * thickness;
      const innerSourceY = sourceY - tieSide * 0.25;
      const innerTargetY = targetY - tieSide * 0.25;
      EntryRender.appendDurationTie(root, {
        x1,
        x2,
        sourceY,
        targetY,
        controlX1,
        controlX2,
        controlY1,
        controlY2,
        innerSourceY,
        innerTargetY,
        innerControlY1,
        innerControlY2
      });
    });
  }

  function noteLocationAtPoint(point, options = {}) {
    if (!point) return null;
    const layout = options.layout || buildLayout();
    const afterTick = Number.isFinite(options.afterTick) ? options.afterTick : null;
    const voiceFilter = Number(options.voice) === 2 ? 2 : Number(options.voice) === 1 ? 1 : null;
    const candidates = [];
    layoutHitIndex(layout).noteHeads.forEach((head) => {
      const item = head;
      if (voiceFilter && entryVoice(item.entry) !== voiceFilter) return;
      const location = {
        measureIndex: item.measureIndex,
        entryIndex: item.entryIndex,
        entry: item.entry
      };
      const absoluteTick = absoluteTickForLocation(location);
      if (afterTick !== null && absoluteTick <= afterTick + EPSILON) return;
      const padded = expandedRect(head.rect, 10, 10);
      const centerX = (head.rect.left + head.rect.right) / 2;
      const centerY = (head.rect.top + head.rect.bottom) / 2;
      const distance = Math.hypot(point.x - centerX, point.y - centerY);
      const contains = pointInRect(point, padded);
      if (contains || distance <= 28) {
        candidates.push({
          ...location,
          staffStep: head.staffStep,
          absoluteTick,
          distance
        });
      }
    });
    return candidates.sort((a, b) => a.distance - b.distance)[0] || null;
  }

  function phraseSlurEndpoint(mark, layout, keyPrefix = "") {
    const entryId = keyPrefix ? mark[`${keyPrefix}EntryId`] : mark.entryId;
    const staffKey = keyPrefix ? `${keyPrefix}StaffStep` : "staffStep";
    const item = layoutHitIndex(layout).byEntryId.get(entryId);
    if (!item || item.entry.type === "rest") return null;
    const staffStep = Number.isFinite(mark[staffKey])
      ? nearestEntryStaffStep(item.entry, mark[staffKey])
      : entryStaffStep(item.entry);
    return {
      item,
      staffStep,
      x: item.x + noteHeadOffset(item.entry, staffStep),
      y: pitchY(staffStep)
    };
  }

  function phraseSlurBeamGuide(mark, layout) {
    const startLocation = entryLocationById(mark?.entryId);
    if (!startLocation?.entry || entryDuration(startLocation.entry).flags < 1) return null;
    const group = beamedGroupForLocation(startLocation);
    if (!group || group.length < 2) return null;
    const positionedByEntryId = layoutHitIndex(layout).byEntryId;
    return beamGeometryForPositionedGroup(group, positionedByEntryId);
  }

  function startPhraseSlurEndDrag(event, mark) {
    event.preventDefault();
    event.stopPropagation();
    const startLocation = entryLocationById(mark.entryId);
    const startTick = startLocation ? absoluteTickForLocation(startLocation) : null;
    const voice = startLocation?.entry ? entryVoice(startLocation.entry) : activeVoice();
    let moved = false;
    let committedHistory = false;

    const onMove = (moveEvent) => {
      const point = svgPointFromEvent(moveEvent);
      if (!point) return;
      moved = true;
      if (!committedHistory) {
        saveHistory();
        committedHistory = true;
      }
      const target = noteLocationAtPoint(point, { afterTick: startTick, voice });
      if (target?.entry) {
        mark.endEntryId = target.entry.id;
        mark.endStaffStep = target.staffStep;
        delete mark.previewX;
        delete mark.previewY;
      } else {
        mark.previewX = point.x;
        mark.previewY = point.y;
      }
      invalidateLayoutCache();
      requestRender();
    };

    const onUp = (upEvent) => {
      const point = svgPointFromEvent(upEvent);
      const target = noteLocationAtPoint(point, { afterTick: startTick, voice });
      if (target?.entry) {
        if (!committedHistory) saveHistory();
        mark.endEntryId = target.entry.id;
        mark.endStaffStep = target.staffStep;
      }
      delete mark.previewX;
      delete mark.previewY;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (moved || target?.entry) render();
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
  }

  function startMarkEditDrag(event, mark) {
    event.preventDefault();
    event.stopPropagation();
    if (!mark) return;
    const start = svgPointFromEvent(event);
    if (!start) return;
    const origin = {
      x: visualOffset(mark, "x"),
      y: visualOffset(mark, "y")
    };
    let moved = false;
    let committedHistory = false;
    selectMark(mark, { toggle: isAdditiveSelectionEvent(event) });

    const onMove = (moveEvent) => {
      const point = svgPointFromEvent(moveEvent);
      if (!point) return;
      const dx = point.x - start.x;
      const dy = point.y - start.y;
      if (!moved && Math.hypot(dx, dy) < 2) return;
      moved = true;
      if (!committedHistory) {
        saveHistory();
        committedHistory = true;
      }
      mark.offsetX = origin.x + dx;
      mark.offsetY = origin.y + dy;
      invalidateLayoutCache();
      requestRender();
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (!moved) render();
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
  }

  function renderPhraseSlur(root, mark, layout) {
    const start = phraseSlurEndpoint(mark, layout, "");
    if (!start) return;
    const end = phraseSlurEndpoint(mark, layout, "end");
    const offsetX = visualOffset(mark, "x");
    const offsetY = visualOffset(mark, "y");
    let x2 = Number.isFinite(mark.previewX) ? mark.previewX : end?.x;
    let y2 = Number.isFinite(mark.previewY) ? mark.previewY : end?.y;
    if (!Number.isFinite(x2) || !Number.isFinite(y2) || x2 <= start.x + 10) {
      x2 = start.x + 56;
      y2 = start.y;
    }
    const x1 = start.x - 2 + offsetX;
    x2 += offsetX;
    y2 += offsetY;
    const isFlipped = mark.flipped === true;
    const startStemSide = stemDirection(start.item.entry) > 0 ? -1 : 1;
    const slurSide = isFlipped ? startStemSide : -startStemSide;
    const verticalOffset = NOTE_HEAD_RY + (isFlipped ? 34 : 10);
    const beamGuide = isFlipped ? phraseSlurBeamGuide(mark, layout) : null;
    const beamClearance = beamThickness() * 0.5 + 9;
    const y1 = beamGuide
      ? beamGuide.yAtX(x1) - beamGuide.direction * beamClearance + offsetY
      : start.y + offsetY + slurSide * verticalOffset;
    const endY = beamGuide
      ? beamGuide.yAtX(x2) - beamGuide.direction * beamClearance + offsetY
      : y2 + slurSide * verticalOffset;
    const span = Math.max(24, x2 - x1);
    const arcDepth = Math.max(18, Math.min(46, span * 0.14));
    const controlX1 = x1 + span * 0.25;
    const controlX2 = x1 + span * 0.75;
    const curveSide = beamGuide ? -beamGuide.direction : slurSide;
    const controlY = curveSide > 0
      ? Math.max(y1, endY) + arcDepth
      : Math.min(y1, endY) - arcDepth;
    const group = el("g", {
      class: `phrase-slur-group${mark.type === "dotted-slur" ? " is-dotted" : ""}${isFlipped ? " is-flipped" : ""}${state.selectedMarkIds.includes(mark.id) ? " is-selected" : ""}`,
      style: mark?.color ? `--item-color:${normalizeItemColor(mark.color)}` : "",
      opacity: normalizeItemOpacity(mark?.opacity, 1),
      "data-mark-id": mark.id
    });
    const slurPath = `M ${x1} ${y1} C ${controlX1} ${controlY} ${controlX2} ${controlY} ${x2} ${endY}`;
    const selectThisSlur = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.button === 2) return;
      if (state.editMode) {
        startMarkEditDrag(event, mark);
        return;
      }
      selectMark(mark, { toggle: isAdditiveSelectionEvent(event) });
    };
    const hit = el("path", {
      class: "phrase-slur-hit",
      d: slurPath
    });
    hit.addEventListener("pointerdown", selectThisSlur);
    group.appendChild(hit);
    const visibleSlur = el("path", {
      class: "phrase-slur",
      d: slurPath
    });
    visibleSlur.addEventListener("pointerdown", selectThisSlur);
    group.appendChild(visibleSlur);
    const handle = el("circle", {
      class: "phrase-slur-handle",
      cx: x2,
      cy: endY,
      r: 5.5
    });
    handle.addEventListener("pointerdown", (event) => startPhraseSlurEndDrag(event, mark));
    group.appendChild(handle);
    root.appendChild(group);
  }

  function markX(mark, layout) {
    const measure = state.measures[mark.measureIndex];
    const start = layout.starts[mark.measureIndex];
    const width = layout.widths[mark.measureIndex];
    if (!measure || !Number.isFinite(start) || !Number.isFinite(width)) return staffLeft();
    if (mark.entryId) {
      const positions = measureEntryPositions(measure, start, width);
      const attachedX = positions.get(mark.entryId);
      if (Number.isFinite(attachedX)) return attachedX + visualOffset(mark, "x");
    }
    return xForTickWithInternalClefs(start, width, mark.measureIndex, mark.tick || 0, mark.type !== "clef") + visualOffset(mark, "x");
  }

  function renderHairpin(root, x, y, isCrescendo = true) {
    const width = glyphWidth(isCrescendo ? "dynamicCrescendoHairpin" : "dynamicDiminuendoHairpin")
      * appearanceValue("hairpinScaleX");
    const height = glyphHeight(isCrescendo ? "dynamicCrescendoHairpin" : "dynamicDiminuendoHairpin")
      * appearanceValue("hairpinScaleY");
    const thickness = SMUFL_DEFAULTS.hairpinThickness * SMUFL_SPACE * appearanceValue("hairpinThicknessScale");
    const leftX = x + appearanceValue("hairpinOffsetX");
    const centerY = y + appearanceValue("hairpinOffsetY");
    const rightX = leftX + width;
    const openY1 = centerY - height / 2;
    const openY2 = centerY + height / 2;
    MarkRender.appendHairpin(root, {
      leftX,
      rightX,
      centerY,
      openY1,
      openY2,
      thickness,
      crescendo: isCrescendo
    });
    return { leftX, rightX, centerY, height };
  }

  function renderTempoMark(root, x, y, mark = null) {
    const scale = appearanceValue("tempoScale");
    const textSize = 18 * scale * appearanceValue("tempoTextScale");
    const originX = x + appearanceValue("tempoOffsetX");
    const originY = y + appearanceValue("tempoOffsetY");
    const durationId = mark?.unitDurationId || "quarter";
    const headSize = 18 * scale * appearanceValue("tempoHeadScale");
    const headX = originX + appearanceValue("tempoHeadOffsetX");
    const headY = originY + appearanceValue("tempoHeadOffsetY");
    const tempoGroup = el("g", { class: "tempo-figure" });

    tempoGroup.appendChild(glyphTextCentered(noteheadGlyphName(durationId), headX, headY, {
      class: "music-glyph notation-mark tempo-mark tempo-glyph tempo-notehead",
      "font-size": headSize,
      style: musicFontStyle("tempoGlyphFont")
    }));

    if (durationId !== "whole") {
      const stemX = headX + appearanceValue("tempoStemOffsetX") * scale;
      const stemStartY = headY + appearanceValue("tempoStemOffsetY") * scale;
      const stemEndY = stemStartY - appearanceValue("tempoStemHeight") * scale;
      const stem = textNode(0, 0, MUSIC_GLYPHS.stem, {
        class: "music-glyph notation-mark tempo-mark tempo-glyph tempo-stem",
        "dominant-baseline": "alphabetic"
      });
      const fontSize = MUSIC_FONT_SIZE * appearanceValue("glyphScale") * scale;
      const stemBox = glyphBBox("stem");
      const stemHeight = stemBox.ne[1] - stemBox.sw[1];
      const baseHeight = stemHeight * fontSize / 4;
      const scaleY = Math.max(1, Math.abs(stemEndY - stemStartY)) / Math.max(1, baseHeight);
      const scaleX = appearanceValue("stemGlyphScaleX") * appearanceValue("tempoStemScale");
      const centerX = (stemBox.sw[0] + stemBox.ne[0]) * 0.5 * fontSize / 4;
      stem.setAttribute("style", `font-size:${fontSize}px;${musicFontStyle("tempoGlyphFont")}`);
      stem.setAttribute("transform", `translate(${stemX - centerX * scaleX} ${stemStartY}) scale(${scaleX} ${scaleY})`);
      tempoGroup.appendChild(stem);

      if (durationId === "eighth") {
        tempoGroup.appendChild(glyphTextAtAnchor(
          "flag8thUp",
          "stemUpNW",
          stemX + appearanceValue("tempoFlagOffsetX") * scale,
          stemEndY + appearanceValue("tempoFlagOffsetY") * scale,
          {
            class: "music-glyph notation-mark tempo-mark tempo-glyph tempo-flag",
            "font-size": headSize * appearanceValue("tempoFlagScale"),
            style: musicFontStyle("tempoGlyphFont")
          }
        ));
      }
    }

    if (Number(mark?.dots) > 0) {
      tempoGroup.appendChild(glyphTextCentered(
        "augmentationDot",
        headX + appearanceValue("tempoDotGap") * scale + appearanceValue("tempoDotOffsetX") * scale,
        headY + appearanceValue("tempoDotOffsetY") * scale,
        {
          class: "music-glyph notation-mark tempo-mark tempo-glyph tempo-dot",
          "font-size": headSize * appearanceValue("tempoDotScale"),
          style: musicFontStyle("tempoGlyphFont")
        }
      ));
    }

    root.appendChild(tempoGroup);
    root.appendChild(textNode(
      originX + appearanceValue("tempoGlyphWidth") * scale + appearanceValue("tempoTextGap"),
      originY,
      `= ${mark?.value || "82"}`,
      {
        class: "notation-mark tempo-mark tempo-number",
        style: `font-size:${textSize}px;${textFontStyle("tempoTextFont")}`
      }
    ));
  }

  function alternateVerticalGlyphName(glyphName) {
    const name = String(glyphName || "");
    if (name.endsWith("Above")) return `${name.slice(0, -5)}Below`;
    if (name.endsWith("Below")) return `${name.slice(0, -5)}Above`;
    return name;
  }

  function isStackableArticulationMark(mark) {
    return mark?.type === "accent" || mark?.type === "glyph";
  }

  function articulationEntryLocation(mark) {
    const location = mark?.entryId ? entryLocationById(mark.entryId) : null;
    return location?.entry?.type === "note" ? location : null;
  }

  function articulationBelowForMark(mark, glyphName = "") {
    const location = articulationEntryLocation(mark);
    if (location) return stemDirection(location.entry) > 0;
    const name = String(glyphName || "");
    if (name.endsWith("Below")) return true;
    if (name.endsWith("Above")) return false;
    return mark?.flipped === true;
  }

  function glyphNameForArticulationSide(glyphName, below) {
    const name = String(glyphName || "");
    if (name.endsWith("Above")) return `${name.slice(0, -5)}${below ? "Below" : "Above"}`;
    if (name.endsWith("Below")) return `${name.slice(0, -5)}${below ? "Below" : "Above"}`;
    return name;
  }

  function renderedGlyphNameForMark(mark) {
    if (mark?.type === "accent") {
      const baseName = mark.flipped ? "articAccentBelow" : "articAccentAbove";
      return glyphNameForArticulationSide(baseName, articulationBelowForMark(mark, baseName));
    }
    if (mark?.type === "fermata") return mark.flipped ? "fermataBelow" : "fermataAbove";
    if (mark?.type !== "glyph") return null;
    const baseName = mark.glyphName || "articAccentAbove";
    const flippedName = mark.flipped ? alternateVerticalGlyphName(baseName) : baseName;
    return glyphNameForArticulationSide(flippedName, articulationBelowForMark(mark, flippedName));
  }

  function glyphMarkIsBelow(glyphName, mark = null) {
    if (isStackableArticulationMark(mark)) return articulationBelowForMark(mark, glyphName);
    const name = String(glyphName || "");
    if (name.endsWith("Below")) return true;
    if (name.endsWith("Above")) return false;
    return mark?.flipped === true;
  }

  function articulationStackKey(mark) {
    const systemIndex = markSystemIndex(mark);
    const staffStep = Number(mark?.staffStep) || 0;
    if (mark?.entryId) return `${systemIndex}:entry:${mark.entryId}:${staffStep}`;
    return `${systemIndex}:anchor:${Number(mark?.measureIndex) || 0}:${Number(mark?.tick) || 0}:${staffStep}`;
  }

  function articulationGlyphHeight(glyphName) {
    const box = glyphBBox(glyphName);
    return Math.max(6, (box.ne[1] - box.sw[1]) * musicGlyphSize("articulationScale") / 4);
  }

  function articulationStackForMark(mark, below) {
    const key = articulationStackKey(mark);
    return state.marks.filter((candidate) => (
      isStackableArticulationMark(candidate) &&
      articulationStackKey(candidate) === key &&
      glyphMarkIsBelow(renderedGlyphNameForMark(candidate), candidate) === below
    ));
  }

  function articulationPlacement(mark, fallbackY) {
    const glyphName = renderedGlyphNameForMark(mark);
    const below = glyphMarkIsBelow(glyphName, mark);
    const location = articulationEntryLocation(mark);
    const stack = articulationStackForMark(mark, below);
    const stackIndex = Math.max(0, stack.findIndex((candidate) => candidate.id === mark.id));
    const glyphHeight = articulationGlyphHeight(glyphName);
    const stackGap = Math.max(5, glyphHeight * 0.18);
    let distance = glyphHeight / 2 + 8;
    for (let index = 1; index <= stackIndex; index += 1) {
      const previousHeight = articulationGlyphHeight(renderedGlyphNameForMark(stack[index - 1]));
      const currentHeight = articulationGlyphHeight(renderedGlyphNameForMark(stack[index]));
      distance += previousHeight / 2 + currentHeight / 2 + stackGap;
    }
    const edgeY = location
      ? pitchY(below ? Math.min(...entryStaffSteps(location.entry)) : Math.max(...entryStaffSteps(location.entry)))
      : fallbackY;
    const manualOffsetY = location ? visualOffset(mark, "y") : 0;
    return {
      glyphName,
      below,
      centerY: edgeY + (below ? distance : -distance) + manualOffsetY + appearanceValue("articulationOffsetY")
    };
  }

  function renderGlyphNotationMark(root, x, y, mark) {
    const placement = articulationPlacement(mark, y);
    if (!placement.glyphName) return null;
    root.appendChild(glyphTextCentered(placement.glyphName, x + appearanceValue("articulationOffsetX"), placement.centerY, {
      class: "music-glyph notation-mark articulation-mark",
      "font-size": musicGlyphSize("articulationScale")
    }));
    return placement;
  }

  async function editEndingLabel(mark) {
    if (!mark || mark.type !== "ending") return false;
    const value = await requestEditorPopup({
      title: "Número de casilla",
      initialValue: mark.label || "",
      placeholder: "1. / 1-3 / 4",
      help: "Escribe el numeral o rango que debe verse en la casilla."
    });
    if (value === null) return false;
    saveHistory();
    mark.label = String(value).trim();
    render();
    return true;
  }

  function endingBoundaryIndexFromPoint(layout, x, minimumBoundary) {
    const candidates = [];
    layout.starts.forEach((start, index) => candidates.push({ boundaryIndex: index, x: start }));
    const lastStart = layout.starts.at(-1);
    const lastWidth = layout.widths.at(-1);
    if (Number.isFinite(lastStart) && Number.isFinite(lastWidth)) {
      candidates.push({ boundaryIndex: layout.starts.length, x: lastStart + lastWidth });
    }
    return candidates
      .filter((candidate) => candidate.boundaryIndex >= minimumBoundary)
      .map((candidate) => ({ ...candidate, distance: Math.abs(candidate.x - x) }))
      .sort((a, b) => a.distance - b.distance)[0]?.boundaryIndex ?? minimumBoundary;
  }

  function startEndingEndDrag(event, mark, layout) {
    event.preventDefault();
    event.stopPropagation();
    if (!mark || mark.type !== "ending") return;
    selectMark(mark);
    const minimumBoundary = Math.max((Number(mark.startMeasureIndex) || 0) + 1, 1);
    let moved = false;
    let committedHistory = false;

    const onMove = (moveEvent) => {
      const point = svgPointFromEvent(moveEvent);
      if (!point) return;
      const nextEnd = endingBoundaryIndexFromPoint(layout, point.x, minimumBoundary);
      if (nextEnd === mark.endMeasureIndex) return;
      if (!committedHistory) {
        saveHistory();
        committedHistory = true;
      }
      moved = true;
      ensureMeasure(nextEnd);
      mark.endMeasureIndex = nextEnd;
      invalidateLayoutCache();
      requestRender();
    };

    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (moved) render();
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
  }

  function renderEndingMark(root, mark, layout) {
    const startMeasureIndex = Math.max(0, Number(mark.startMeasureIndex ?? mark.measureIndex) || 0);
    const endMeasureIndex = Math.max(startMeasureIndex + 1, Number(mark.endMeasureIndex) || startMeasureIndex + 1);
    ensureMeasure(endMeasureIndex);
    const baseX1 = boundaryX(layout, startMeasureIndex);
    const baseX2 = boundaryX(layout, endMeasureIndex);
    if (!Number.isFinite(baseX1) || !Number.isFinite(baseX2)) return;
    const x1 = baseX1 + visualOffset(mark, "x");
    const x2 = baseX2 + visualOffset(mark, "x");
    if (x2 <= x1 + 12) return;
    const selected = state.selectedMarkIds.includes(mark.id);
    const y = staffTopY() - 34 + visualOffset(mark, "y");
    const drop = 22;
    const label = String(mark.label || "");
    const group = el("g", {
      class: `ending-group${selected ? " is-selected" : ""}`,
      style: mark?.color ? `--item-color:${normalizeItemColor(mark.color)}` : "",
      opacity: normalizeItemOpacity(mark?.opacity, 1),
      "data-mark-id": mark.id
    });
    group.addEventListener("contextmenu", (event) => showMarkContextMenu(event, mark));
    MarkRender.appendEndingBracket(group, {
      x1,
      x2,
      y,
      drop,
      closedEnd: mark.closedEnd === true
    });
    const hit = el("rect", {
      class: "ending-hit",
      x: x1 - 8,
      y: y - 12,
      width: Math.max(16, x2 - x1 + 16),
      height: drop + 26,
      rx: 4
    });
    hit.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.button === 2) return;
      if (state.editMode) {
        startMarkEditDrag(event, mark);
        return;
      }
      selectMark(mark, { toggle: isAdditiveSelectionEvent(event) });
    });
    hit.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      editEndingLabel(mark);
    });
    group.insertBefore(hit, group.firstChild);
    if (label) {
      const labelNode = textNode(x1 + 12, y + 17, label, {
        class: "ending-label",
        style: `font-size:${18 * appearanceValue("measureNumberScale")}px;${textFontStyle("scoreTextFont")}`
      });
      labelNode.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.button === 2) return;
        selectMark(mark, { toggle: isAdditiveSelectionEvent(event) });
      });
      labelNode.addEventListener("dblclick", (event) => {
        event.preventDefault();
        event.stopPropagation();
        editEndingLabel(mark);
      });
      group.appendChild(labelNode);
    }
    const handle = el("circle", {
      class: "ending-handle",
      cx: x2,
      cy: y,
      r: 5.5
    });
    handle.addEventListener("pointerdown", (event) => startEndingEndDrag(event, mark, layout));
    group.appendChild(handle);
    root.appendChild(group);
  }

  function markVisibleWhenMeasureHidden(mark) {
    return ["clef", "tempo", "tempo-quarter", "tempo-text", "ritardando", "ending"].includes(mark?.type);
  }

  function renderNotationMarks(root, layout) {
    const markLayer = el("g", { class: "notation-marks" });
    state.marks.forEach((mark) => {
      if (!markBelongsToRenderSystem(mark)) return;
      if (
        Number.isFinite(mark.measureIndex) &&
        measureIsHidden(mark.measureIndex) &&
        !markVisibleWhenMeasureHidden(mark)
      ) return;
      if (isInitialClefMark(mark)) return;
      if (mark.type === "barline") return;
      if (mark.type === "ending") {
        renderEndingMark(markLayer, mark, layout);
        return;
      }
      const x = markX(mark, layout);
      const y = pitchY(Number.isFinite(mark.staffStep) ? mark.staffStep : 0) + visualOffset(mark, "y");
      const isSlur = mark.type === "slur" || mark.type === "dotted-slur";
      const markGroup = el("g", {
        class: `notation-mark-group${state.selectedMarkIds.includes(mark.id) ? " is-selected" : ""}`,
        style: mark?.color ? `--item-color:${normalizeItemColor(mark.color)}` : "",
        opacity: normalizeItemOpacity(mark?.opacity, 1),
        "data-mark-id": mark.id
      });
      let hairpinGeometry = null;
      let glyphPlacement = null;
      markGroup.addEventListener("contextmenu", (event) => showMarkContextMenu(event, mark));
      if (mark.type === "slur" || mark.type === "dotted-slur") {
        renderPhraseSlur(markGroup, mark, layout);
      } else if (mark.type === "clef") {
        renderClefMark(markGroup, x, mark);
      } else if (mark.type === "accent" || mark.type === "glyph") {
        glyphPlacement = renderGlyphNotationMark(markGroup, x, y, mark);
      } else if (mark.type === "dynamic-mf") {
        markGroup.appendChild(glyphTextCentered("dynamicMF", x + appearanceValue("dynamicOffsetX"), staffBottomY() + 42 + appearanceValue("dynamicOffsetY"), {
          class: "music-glyph notation-mark dynamic-mark",
          "font-size": musicGlyphSize("dynamicScale")
        }));
      } else if (mark.type === "crescendo" || mark.type === "diminuendo") {
        hairpinGeometry = renderHairpin(markGroup, x, staffBottomY() + 34, mark.type === "crescendo");
      } else if (mark.type === "tempo-quarter") {
        renderTempoMark(markGroup, x, staffTopY() - 36, { unitDurationId: "quarter", value: "82" });
      } else if (mark.type === "tempo") {
        renderTempoMark(markGroup, x, staffTopY() - 36, mark);
      } else if (mark.type === "tempo-text") {
        markGroup.appendChild(textNode(
          x + appearanceValue("tempoOffsetX"),
          staffTopY() - 22 + appearanceValue("tempoOffsetY"),
          mark.text || "",
          {
            class: "notation-mark tempo-number",
            style: `font-size:${20 * appearanceValue("tempoScale") * appearanceValue("tempoTextScale")}px;${textFontStyle("tempoTextFont")}`
          }
        ));
      } else if (mark.type === "ritardando") {
        markGroup.appendChild(textNode(
          x + appearanceValue("ritOffsetX"),
          staffTopY() - 22 + appearanceValue("ritOffsetY"),
          "rit.",
          {
            class: "notation-mark rit-mark",
            style: `font-size:${20 * appearanceValue("ritScale")}px;${textFontStyle("tempoTextFont")}`
          }
        ));
      } else if (mark.type === "fermata") {
        const glyphName = mark.flipped ? "fermataBelow" : "fermataAbove";
        const y = mark.flipped ? staffBottomY() + 22 : staffTopY() - 18;
        markGroup.appendChild(glyphTextCentered(glyphName, x + appearanceValue("fermataOffsetX"), y + appearanceValue("fermataOffsetY"), {
          class: "music-glyph notation-mark fermata-mark",
          "font-size": musicGlyphSize("fermataScale")
        }));
      }
      if (!isSlur) {
        const hitY = mark.type === "dynamic-mf"
          ? staffBottomY() + 42
          : mark.type === "fermata"
            ? (mark.flipped ? staffBottomY() + 22 : staffTopY() - 18)
            : mark.type === "crescendo" || mark.type === "diminuendo"
              ? staffBottomY() + 34
              : mark.type?.startsWith("tempo") || mark.type === "ritardando"
                ? staffTopY() - 28
                : mark.type === "clef"
                  ? pitchYForSystem(0, renderSystemIndex) + appearanceValue("clefOffsetY")
                  : mark.type === "glyph"
                    ? glyphPlacement?.centerY ?? y
                    : mark.type === "accent"
                      ? glyphPlacement?.centerY ?? y
                    : y;
        const hitRadius = isArticulationMark(mark) ? 22 : 18;
        const hit = hairpinGeometry
          ? el("rect", {
            class: "notation-mark-hit hairpin-hit",
            x: hairpinGeometry.leftX - 8,
            y: hairpinGeometry.centerY - Math.max(14, hairpinGeometry.height / 2 + 8),
            width: Math.max(20, hairpinGeometry.rightX - hairpinGeometry.leftX + 16),
            height: Math.max(28, hairpinGeometry.height + 16),
            rx: 5
          })
          : el("circle", {
            class: "notation-mark-hit",
            cx: x,
            cy: hitY,
            r: hitRadius
          });
        hit.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.button === 2) return;
          if (state.editMode) {
            startMarkEditDrag(event, mark);
            return;
          }
          selectMark(mark, { toggle: isAdditiveSelectionEvent(event) });
        });
        markGroup.appendChild(hit);
      }
      markLayer.appendChild(markGroup);
    });
    root.appendChild(markLayer);
  }

  function approximateTextWidth(text, size, font) {
    if (Geometry.approximateTextWidth) return Geometry.approximateTextWidth(text, size, font);
    const fontFactor = /ink/i.test(font) ? 0.48 : 0.56;
    return Math.max(size * 0.9, [...String(text)].reduce((sum, char) => {
      if (char === " ") return sum + size * fontFactor * 0.55;
      return sum + size * fontFactor * (char.charCodeAt(0) > 255 ? 1.08 : 1);
    }, 0));
  }

  function textItemLines(item) {
    return TextItems.lines(item);
  }

  function normalizeTextAlign(value) {
    return TextItems.normalizeAlign(value);
  }

  function textItemAlign(item, style = {}) {
    return TextItems.align(item, style, AnchoredText);
  }

  function textAnchorForAlign(align) {
    return TextItems.anchorForAlign(align);
  }

  function textOriginXForAlign(point, width, align) {
    return TextItems.originXForAlign(point, width, align);
  }

  function textLineLeftForAlign(textX, lineWidth, align) {
    return TextItems.lineLeftForAlign(textX, lineWidth, align);
  }

  function textItemMetrics(item, layout = buildLayout()) {
    const cache = Perf.layoutCache(layout, "textItemMetrics");
    const cacheKey = `${contextSystemIndex()}:${layoutTextSignature(item)}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    const point = textItemPoint(item, layout);
    const style = { ...state.textStyle, ...(item.style || {}) };
    const metrics = TextItems.metrics({
      item,
      point,
      style,
      AnchoredText,
      approximateTextWidth
    });
    cache.set(cacheKey, metrics);
    return metrics;
  }

  function startTextResize(event, item) {
    event.preventDefault();
    event.stopPropagation();
    if (!item) return;
    const start = svgPointFromEvent(event);
    if (!start) return;
    const metrics = textItemMetrics(item);
    const originSize = Number(metrics.style.size || state.textStyle.size || 24);
    const originDistance = Math.max(
      8,
      Math.hypot(start.x - metrics.point.x, start.y - metrics.hitRect.top)
    );
    let committedHistory = false;
    selectTextItem(item);

    const onMove = (moveEvent) => {
      const point = svgPointFromEvent(moveEvent);
      if (!point) return;
      const distance = Math.max(8, Math.hypot(point.x - metrics.point.x, point.y - metrics.hitRect.top));
      const nextSize = Math.max(6, Math.min(144, originSize * (distance / originDistance)));
      if (!committedHistory) {
        saveHistory();
        committedHistory = true;
      }
      item.style = { ...(item.style || {}), size: nextSize };
      state.textStyle = { ...state.textStyle, size: nextSize };
      invalidateLayoutCache();
      requestRender();
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
  }

  function renderTextItems(root, layout = buildLayout()) {
    if (!state.textItems.length) return;
    const layer = el("g", { class: "canvas-text-layer" });
    state.textItems.forEach((item) => {
      const systemIndex = textItemSystemIndex(item);
      const { style, size, width, height, lineHeight, lines, lineWidths, hitRect: textHitRect, point } = withSystemContext(systemIndex, () => textItemMetrics(item, layout));
      const isSelected = item.id === state.activeTextId || (state.selectedTextIds || []).includes(item.id);
      const group = el("g", {
        class: `canvas-text-item${AnchoredText.itemClass(item.kind)}${isSelected ? " is-selected" : ""}`,
        opacity: normalizeItemOpacity(style.opacity, 1),
        "data-text-id": item.id
      });
      const enclosure = style.enclosure || "none";
      const align = textItemAlign(item, style);
      const textX = AnchoredText.isChord(item)
        ? point.x
        : textOriginXForAlign(point, width, align);
      const hitRect = el("rect", {
        class: "canvas-text-hitbox",
        x: textHitRect.left,
        y: textHitRect.top,
        width: Math.max(1, textHitRect.right - textHitRect.left),
        height: Math.max(1, textHitRect.bottom - textHitRect.top),
        rx: 5
      });
      group.appendChild(hitRect);
      lines.forEach((line, index) => {
        const lineWidth = Math.max(size * 0.7, lineWidths[index] || size);
        const lineBaseline = point.y + index * lineHeight;
        const lineHit = el("rect", {
          class: "canvas-text-line-hitbox",
          x: textLineLeftForAlign(textX, lineWidth, align) - 4,
          y: lineBaseline - size * 0.9,
          width: lineWidth + 8,
          height: size * 1.25,
          rx: 3
        });
        group.appendChild(lineHit);
      });
      if (enclosure === "box" || enclosure === "round") {
        group.appendChild(el("rect", {
          class: "canvas-text-enclosure",
          x: textHitRect.left - 8,
          y: textHitRect.top - 4,
          width: Math.max(1, textHitRect.right - textHitRect.left) + 16,
          height: Math.max(1, textHitRect.bottom - textHitRect.top) + 8,
          rx: enclosure === "round" ? Math.min(12, height / 2) : 2
        }));
      } else if (enclosure === "circle") {
        group.appendChild(el("ellipse", {
          class: "canvas-text-enclosure",
          cx: (textHitRect.left + textHitRect.right) / 2,
          cy: (textHitRect.top + textHitRect.bottom) / 2,
          rx: Math.max(width / 2 + 10, size * 0.72),
          ry: Math.max(height / 2 + 6, size * 0.62)
        }));
      }
      const text = textNode(point.x, point.y, item.text, {
        class: "canvas-text",
        "text-anchor": textAnchorForAlign(align),
        style: `font-family:${fontCss(style.font || appearanceFont("canvasTextFont", "Ink Free"))}; font-size:${size}px; fill:${style.color};`
      });
      text.textContent = "";
      lines.forEach((line, index) => {
        const tspan = el("tspan", {
          x: textX,
          dy: index === 0 ? 0 : lineHeight
        });
        tspan.textContent = line || " ";
        text.appendChild(tspan);
      });
      group.appendChild(text);
      if (isSelected) {
        const handle = el("rect", {
          class: "canvas-text-resize-handle",
          x: textHitRect.right + 5,
          y: textHitRect.bottom + 5,
          width: 10,
          height: 10,
          rx: 2
        });
        handle.addEventListener("pointerdown", (event) => startTextResize(event, item));
        group.appendChild(handle);
      }
      group.addEventListener("contextmenu", (event) => showTextContextMenu(event, item));
      group.addEventListener("pointerdown", (event) => {
        if (event.button === 2) return;
        event.stopPropagation();
        event.preventDefault();
        setActiveSystemIndex(systemIndex);
        if (isAdditiveSelectionEvent(event)) {
          toggleTextItemSelection(item);
          return;
        }
        if (state.editMode) {
          startTextDrag(event, item);
          return;
        }
        if (state.selectMode) {
          selectTextItem(item);
          render();
          return;
        }
        if (event.shiftKey && !isAnchoredTextItem(item)) {
          startTextDrag(event, item);
          return;
        }
        editTextItem(item);
      });
      layer.appendChild(group);
    });
    root.appendChild(layer);
  }

  function selectTextItem(item) {
    if (!item) return;
    setActiveSystemIndex(textItemSystemIndex(item));
    clearMeasureSelection();
    clearEntrySelection();
    clearActiveNote();
    hideCursorPitch();
    clearMarkSelection();
    state.activeTextId = item.id;
    state.selectedTextIds = [item.id];
    state.textStyle = { ...state.textStyle, ...(item.style || {}) };
    state.cursorActive = false;
  }

  function toggleTextItemSelection(item) {
    if (!item?.id) return false;
    setActiveSystemIndex(textItemSystemIndex(item));
    clearMeasureSelection();
    const ids = new Set(state.selectedTextIds || []);
    if (state.activeTextId) ids.add(state.activeTextId);
    if (ids.has(item.id)) ids.delete(item.id);
    else ids.add(item.id);
    state.selectedTextIds = [...ids];
    state.activeTextId = state.selectedTextIds.at(-1) || null;
    if (state.activeTextId) {
      const active = textItemById(state.activeTextId);
      if (active) state.textStyle = { ...state.textStyle, ...(active.style || {}) };
    }
    state.cursorActive = false;
    state.entryCursorActive = false;
    state.selectMode = true;
    render();
    return true;
  }

  function startTextDrag(event, item) {
    const start = svgPointFromEvent(event);
    if (!start || !item) return;
    const originPoint = textItemPoint(item);
    const origin = {
      x: isAnchoredTextItem(item) ? anchoredTextOffset(item, "x") : originPoint.x,
      y: isAnchoredTextItem(item) ? anchoredTextOffset(item, "y") : originPoint.y
    };
    let moved = false;
    let committedHistory = false;
    selectTextItem(item);
    render();

    const onMove = (moveEvent) => {
      const point = svgPointFromEvent(moveEvent);
      if (!point) return;
      const dx = point.x - start.x;
      const dy = point.y - start.y;
      if (!moved && Math.hypot(dx, dy) < 2) return;
      moved = true;
      if (!committedHistory) {
        saveHistory();
        committedHistory = true;
      }
      if (isAnchoredTextItem(item)) {
        item.offsetX = origin.x + dx;
        item.offsetY = origin.y + dy;
      } else {
        item.x = origin.x + dx;
        item.y = origin.y + dy;
      }
      invalidateLayoutCache();
      requestRender();
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (!moved) render();
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
  }

  function renderEntries(root, layout) {
    const allFlagged = [];
    const systemIndex = renderSystemIndex;
    state.measures.forEach((measure, measureIndex) => {
      if (measureIsHidden(measureIndex)) return;
      const start = layout.starts[measureIndex];
      const width = layout.widths[measureIndex];
      const positions = measureEntryPositions(measure, start, width);
      measure.entries.forEach((entry, entryIndex) => {
        if (entry.hiddenTupletReserve) return;
        if (entry.type === "rest" && !shouldRenderRestEntry(measure, entry)) return;
        const duration = entryDuration(entry);
        const isWholeRest = entry.type === "rest" && duration.id === "whole";
        const x = isWholeRest
          ? start + width / 2
          : positions.get(entry.id) ?? xForTick(start, width, entry.tickStart);
        const visualX = x + visualOffset(entry, "x");
        const entryGroup = el("g", {
          class: `score-entry${isEntrySelected(entry) ? " is-selected" : ""}`,
          style: entry?.color ? `--item-color:${normalizeItemColor(entry.color)}` : "",
          opacity: normalizeItemOpacity(entry?.opacity, 1),
          "data-entry-id": entry.id,
          "data-measure-index": measureIndex,
          "data-tick": Number(entry.tickStart) || 0,
          "data-voice": entryVoice(entry),
          "data-entry-type": entry.type,
          "data-explicit-rest": entry.explicitRest === true ? "true" : "false",
          "data-force-duration": entry.forceDuration === true ? "true" : "false",
          "data-duration-id": entry.durationId || "",
          "data-ticks": Number(entry.ticks) || 0,
          "data-staff-steps": entry.type === "note" ? entryStaffSteps(entry).join(",") : ""
        });
        entryGroup.addEventListener("contextmenu", (event) => {
          const point = svgPointFromEvent(event);
          const stemHitRect = entry.type === "note" && entryStaffSteps(entry).length > 1
            ? stemRect(entry, visualX)
            : null;
          showEntryContextMenu(event, {
            systemIndex,
            measureIndex,
            entryIndex,
            entry,
            staffStep: staffStepForEntryPointer(entry, event),
            wholeChord: !!stemHitRect && pointInRect(point, stemHitRect)
          });
        });
        entryGroup.addEventListener("pointerdown", (event) => {
          if (event.button === 2) return;
          setActiveSystemIndex(systemIndex);
          if (isNoteInputMode()) {
            event.stopPropagation();
            event.preventDefault();
            activateVoiceForEntrySelection(entry);
            positionCursorFromEntryPointer(measureIndex, entry, event);
            return;
          }
          if (state.editMode) {
            event.stopPropagation();
            event.preventDefault();
            startEntryEditDrag(event, { measureIndex, entryIndex, entry });
            return;
          }
          if (state.dynamicMode && entry.type === "note") {
            event.stopPropagation();
            addDynamicItemAtAnchor(dynamicAnchorFromEntry(entry));
            return;
          }
          if (state.textMode || state.chordMode || state.dynamicMode) {
            const point = svgPointFromEvent(event);
            event.stopPropagation();
            addActiveTextLikeItemAtPoint(point);
            return;
          }
          event.stopPropagation();
          const point = svgPointFromEvent(event);
          const stemHitRect = entry.type === "note" && entryStaffSteps(entry).length > 1
            ? stemRect(entry, visualX)
            : null;
          if (isAdditiveSelectionEvent(event)) {
            toggleEntrySelection(measureIndex, entryIndex, {
              staffStep: staffStepForEntryPointer(entry, event),
              wholeEntry: !!stemHitRect && pointInRect(point, stemHitRect)
            });
            return;
          }
          selectEntry(measureIndex, entryIndex, {
            activateCursor: false,
            staffStep: staffStepForEntryPointer(entry, event),
            selectHead: entry.type === "note" && entryStaffSteps(entry).length > 1
          });
          render();
        });
        renderEntryHit(entryGroup, visualX, entry, measureIndex, entryIndex, systemIndex);
        if (entry.type === "rest") {
          renderRest(entryGroup, visualX, pitchYForSystem(0, renderSystemIndex) + restVoiceOffsetY(measure, entry) + visualOffset(entry, "y"), entry);
        } else {
          const flagged = renderNote(entryGroup, entry, visualX);
          if (flagged) allFlagged.push({ ...flagged, measureIndex, entryIndex, measureEntries: measure.entries });
        }
        root.appendChild(entryGroup);
      });
    });
    renderBeams(root, allFlagged);
    renderTupletIndicators(root, layout);
    renderTies(root, layout);
  }

  function renderCursor(root, layout) {
    if (!isNoteInputMode()) return;
    const x = cursorVisualX(layout) + appearanceValue("cursorOffsetX");
    const y = pitchY(state.cursorStaffStep) + appearanceValue("cursorOffsetY");
    root.appendChild(el("rect", {
      class: "cursor",
      x: x - 9,
      y: hitTopY(),
      width: 18,
      height: HIT_HEIGHT,
      rx: 6
    }));
    root.appendChild(el("line", {
      class: "cursor-line",
      "data-measure-index": state.cursorMeasure,
      "data-tick": state.cursorTick,
      "data-voice": activeVoice(),
      x1: x,
      y1: staffTopY() - 14 + appearanceValue("cursorLineTopOffsetY"),
      x2: x,
      y2: staffBottomY() + 14 + appearanceValue("cursorLineBottomOffsetY")
    }));
    const activeModifiers = [
      state.noteChordMode ? "Q" : "",
      state.displacementMode ? "I" : "",
      state.lockDurationMode ? "L" : "",
      state.forceDurationMode ? "O" : "",
      state.pitchBeforeDurationMode ? "K" : ""
    ].filter(Boolean);
    root.appendChild(textNode(
      x + 12,
      staffTopY() - 18,
      `L${activeVoice()}${activeVoice() === 1 ? "↑" : "↓"}${activeModifiers.length ? ` · ${activeModifiers.join(" ")}` : ""}`,
      {
        class: "input-caret-status",
        style: textFontStyle("scoreTextFont")
      }
    ));
    if (state.activeTuplet) {
      root.appendChild(textNode(x + 12, staffTopY() - 28, tupletDisplayLabel(state.activeTuplet, "cursor"), {
        class: "duration-label tuplet-cursor-label",
        style: `font-size:14px;${textFontStyle("scoreTextFont")}`
      }));
    }
    if (state.cursorPitchVisible) {
      const pendingMidiNotes = state.pitchBeforeDurationMode ? uniqueMidiNotes(state.pendingMidiNotes || []) : [];
      const pendingInfos = pendingMidiNotes.length > 1
        ? midiInfosAvoidingStaffCollisions(pendingMidiNotes, state.cursorMeasure)
        : [];
      const pendingSteps = pendingInfos.map((info) => midiStaffStep(info));
      const previewSteps = pendingSteps.length ? pendingSteps : [state.cursorStaffStep];
      const anchorLocation = !pendingSteps.length && state.cursorPitchAnchorEntryId
        ? entryLocationById(state.cursorPitchAnchorEntryId)
        : null;
      const previewEntry = {
        type: "note",
        durationId: state.activeDuration?.id || "quarter",
        ticks: state.activeDuration?.ticks || 4,
        flags: state.activeDuration?.flags || 0,
        staffStep: previewSteps[0],
        chordSteps: previewSteps
      };
      const anchorBaseX = anchorLocation
        ? (measureEntryPositions(
          state.measures[anchorLocation.measureIndex],
          layout.starts[anchorLocation.measureIndex],
          layout.widths[anchorLocation.measureIndex]
        ).get(anchorLocation.entry.id) ?? x)
        : x;
      previewSteps.forEach((staffStep) => {
        const sourceEntry = anchorLocation?.entry || previewEntry;
        const headX = anchorBaseX + noteHeadOffset(sourceEntry, staffStep);
        const headY = pitchY(staffStep) + (anchorLocation ? 0 : appearanceValue("cursorOffsetY"));
        renderCursorLedger(root, headX, staffStep);
        root.appendChild(noteHead(
          headX + appearanceValue("cursorHeadOffsetX"),
          headY + appearanceValue("cursorHeadOffsetY"),
          "quarter",
          "cursor-note-head"
        ));
      });
    }
  }

  function renderHitZones(root, layout) {
    const totalWidth = Math.max(layout.totalWidth, scoreMinWidth());
    const zone = el("rect", {
      class: "entry-zone",
      x: 0,
      y: 0,
      width: totalWidth,
      height: Math.max(appearanceValue("hitZoneHeight"), scoreHeight(layout))
    });
    zone.addEventListener("pointerdown", beginDragSelection);
    root.appendChild(zone);
  }

  function updateCursorLabel() {
    const beat = state.cursorTick / 4 + 1;
    const beatLabel = Number.isInteger(beat) ? `${beat}/4` : `${state.cursorTick}/16`;
    const phaseLabel = isNoteInputMode() ? `Escritura L${activeVoice()}` : "Selección";
    cursorLabel.textContent = `${phaseLabel} · Compás ${state.cursorMeasure + 1} · ${beatLabel}`;
  }

  function scoreModelNormalizationSignature() {
    const systems = scoreSystems().map((system) => ({
      kind: system?.kind || "staff",
      initialClefId: system?.initialClefId || "",
      measures: (system?.measures || []).map((measure) => ({
        meter: measure?.meter || null,
        keySignature: measure?.keySignature || null,
        entries: (measure?.entries || []).map((entry) => ({
          id: entry.id,
          type: entry.type,
          voice: entryVoice(entry),
          tickStart: Number(entry.tickStart) || 0,
          ticks: Number(entry.ticks) || 0,
          durationId: entry.durationId,
          dots: Number(entry.dots) || 0,
          dotted: entry.dotted === true,
          explicitRest: entry.explicitRest === true,
          forceDuration: entry.forceDuration === true,
          hiddenTupletReserve: entry.hiddenTupletReserve === true,
          tuplet: entry.tuplet || null,
          staffStep: entry.staffStep,
          chordSteps: entry.chordSteps || null,
          diatonicStep: entry.diatonicStep,
          chordDiatonicSteps: entry.chordDiatonicSteps || null,
          accidental: entry.accidental || null,
          accidentalsByStep: entry.accidentalsByStep || null,
          accidentalsByDiatonicStep: entry.accidentalsByDiatonicStep || null,
          tieToNext: entry.tieToNext === true,
          tieStaffStep: entry.tieStaffStep
        }))
      }))
    }));
    const structuralMarks = (state.marks || []).filter((mark) => (
      mark?.type === "clef" || mark?.type === "key-signature"
    )).map((mark) => ({
      type: mark.type,
      systemIndex: markSystemIndex(mark),
      measureIndex: mark.measureIndex,
      tick: mark.tick,
      clefId: mark.clefId,
      signature: mark.signature || null
    }));
    return JSON.stringify({ systems, structuralMarks, keySignature: state.keySignature || null });
  }

  function prepareScoreModel() {
    if (!scoreModelDirty) return false;
    const signature = scoreModelNormalizationSignature();
    if (signature === normalizedScoreModelSignature) {
      scoreModelDirty = false;
      return false;
    }
    scoreModelPreparationCount += 1;
    document.documentElement.dataset.scoreModelPreparations = String(scoreModelPreparationCount);
    const activeIndex = activeSystemIndex();
    scoreSystems().forEach((system, systemIndex) => {
      withSystemContext(systemIndex, () => {
        applyClefSpellingToEntries();
        if (!isTupletWritingOpen() || systemIndex !== activeIndex) {
          normalizeRhythmicSpelling();
          normalizeTernaryTiedUnitPairs();
          verifyAllMeasureDurations();
        }
        refreshAutomaticAccidentals();
      });
    });
    setActiveSystemIndex(activeIndex);
    normalizedScoreModelSignature = scoreModelNormalizationSignature();
    scoreModelDirty = false;
    invalidateLayoutCache();
    return true;
  }

  function render() {
    renderFrameQueued = false;
    Perf.cancelFrame?.("scoreRender");
    if (renderInProgress) {
      renderQueued = true;
      return;
    }
    renderInProgress = true;
    try {
      syncActiveSystemMeasures();
      const activeIndex = activeSystemIndex();
      prepareScoreModel();
      normalizeCursor();
      const layout = buildLayout();
      lastRenderedLayout = layout;
      const width = Math.max(layout.totalWidth, scoreMinWidth());
      const height = scoreHeight(layout);
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      svg.style.width = `${width * (state.zoom || 1)}px`;
      svg.style.height = `${height * (state.zoom || 1)}px`;
      const visibleShellHeight = scoreShellVisibleHeightFor(height);
      if (scoreShell) scoreShell.style.height = `${visibleShellHeight}px`;
      if (systemsCanvas) {
        systemsCanvas.style.minHeight = `${visibleShellHeight}px`;
        systemsCanvas.style.gridTemplateRows = `${visibleShellHeight}px`;
      }
      svg.innerHTML = "";

      const root = el("g");
      root.addEventListener("pointerdown", beginDragSelection);
      renderHitZones(root, layout);
      scoreSystems().forEach((system, systemIndex) => {
        withSystemContext(systemIndex, () => {
          renderStaff(root, layout);
          renderEntries(root, layout);
          renderNotationMarks(root, layout);
          if (systemIndex === activeIndex) renderCursor(root, layout);
        });
      });
      setActiveSystemIndex(activeIndex);
      renderTextItems(root, layout);
      renderDragSelection(root);
      svg.appendChild(root);
      scheduleRestAlignment();
      updateCursorLabel();
      updateModeButtons();
      syncTouchModeClass();
      updateTouchToolbar();
      refreshMidiKeyboardSelectionHighlights();
      if (state.midiPlayback.active) updatePlaybackLine();
      scheduleCanvasAutosave();
    } finally {
      renderInProgress = false;
      if (renderQueued) {
        renderQueued = false;
        Perf.scheduleFrame("queuedRender", render);
      }
    }
  }

  async function reflowScoreLayout() {
    if (reflowInProgress) {
      showEditorMessage("Ya estoy reorganizando la partitura.");
      return;
    }
    reflowInProgress = true;
    const progress = createEditorProgress("Reorganizando partitura");
    try {
      progress.update(0.05, "Preparando layout compacto...");
      await nextAnimationFrame();
      const wasPlaying = state.midiPlayback.active;
      const elapsedMs = wasPlaying
        ? Math.max(0, performance.now() - (state.midiPlayback.startAt || performance.now()))
        : 0;
      const activeIndex = activeSystemIndex();
      const systems = scoreSystems();
      const totalSystems = Math.max(1, systems.length);
      for (let systemIndex = 0; systemIndex < systems.length; systemIndex += 1) {
        progress.update(
          0.12 + (systemIndex / totalSystems) * 0.52,
          `Recalculando sistema ${systemIndex + 1} de ${systems.length}...`
        );
        withSystemContext(systemIndex, () => {
          refreshAutomaticAccidentals();
          normalizeRhythmicSpelling();
        });
        await nextAnimationFrame();
        progress.update(
          0.36 + (systemIndex / totalSystems) * 0.28,
          `Normalizando ligaduras y silencios del sistema ${systemIndex + 1}...`
        );
        withSystemContext(systemIndex, () => {
          normalizeTernaryTiedUnitPairs();
          verifyAllMeasureDurations();
        });
        await nextAnimationFrame();
      }
      progress.update(0.72, "Compactando compases...");
      setActiveSystemIndex(activeIndex);
      normalizedScoreModelSignature = scoreModelNormalizationSignature();
      scoreModelDirty = false;
      state.compactLayout = true;
      invalidateLayoutCache();
      render();
      await nextAnimationFrame();
      progress.update(0.88, "Recalculando proporciones finales...");
      buildLayout({ fresh: true });
      await nextAnimationFrame();
      progress.update(0.94, "Sincronizando playhead...");
      if (wasPlaying) {
        state.midiPlayback.startAt = performance.now() - elapsedMs;
        updatePlaybackLine();
        startPlaybackLineAnimation();
      }
      progress.update(1, "Listo.");
      setTimeout(() => progress.close(), 650);
    } catch (error) {
      console.error(error);
      progress.update(1, "No pude completar la reorganización.");
      setTimeout(() => progress.close(), 900);
    } finally {
      reflowInProgress = false;
    }
  }

  function activeVoiceNoteLocations(voice = activeVoice()) {
    return state.measures.flatMap((measure, measureIndex) => (
      measure.entries.map((entry, entryIndex) => ({ measureIndex, entryIndex, entry }))
    )).filter((location) => (
      location.entry?.type === "note" && entryVoice(location.entry) === voice
    )).sort((a, b) => (
      absoluteTickForLocation(a) - absoluteTickForLocation(b) || a.entryIndex - b.entryIndex
    ));
  }

  function lockedDurationTarget() {
    if (!state.lockDurationMode || !isNoteInputMode()) return null;
    const absoluteTick = cursorAbsoluteTick();
    const locations = activeVoiceNoteLocations();
    const targetIndex = locations.findIndex((location) => (
      absoluteTickForLocation(location) >= absoluteTick - EPSILON
    ));
    if (targetIndex < 0) {
      setNoteInputModifier("lockDuration", false);
      return null;
    }
    return { locations, targetIndex, target: locations[targetIndex] };
  }

  function finishLockedDurationRepitch(targetData, activeStaffStep) {
    const { locations, targetIndex, target } = targetData;
    state.cursorStaffStep = activeStaffStep;
    state.activeNoteEntryId = target.entry.id;
    state.activeNoteStaffStep = activeStaffStep;
    const next = locations[targetIndex + 1];
    if (next?.entry) {
      setCursorFromAbsoluteTick(absoluteTickForLocation(next));
    } else {
      setCursorFromAbsoluteTick(absoluteTickForLocation(target) + target.entry.ticks);
      InputSession.setModifier(state, "lockDuration", false);
    }
    showCursorPitchAtCursor();
    state.cursorActive = true;
    state.entryCursorActive = false;
    syncInputSession();
    render();
    return true;
  }

  function repitchLockedDuration(diatonicStep, options = {}) {
    if (!state.lockDurationMode || !isNoteInputMode()) return false;
    const targetData = lockedDurationTarget();
    if (!targetData) return false;
    const { target } = targetData;
    const clefId = clefIdAtAbsoluteTick(absoluteTickForLocation(target));
    const staffStep = staffStepForDiatonicStep(diatonicStep, clefId);
    saveHistory();
    const oldSteps = entryStaffSteps(target.entry);
    oldSteps.forEach((step) => clearEntryAccidental(target.entry, step));
    setEntryStaffSteps(target.entry, [staffStep]);
    target.entry.diatonicStep = diatonicStep;
    delete target.entry.chordDiatonicSteps;
    delete target.entry.autoAccidentalsByStep;
    delete target.entry.displayAccidentalsByStep;
    if (options.midiInfo) applyMidiAccidental(target.entry, staffStep, options.midiInfo, target.measureIndex);
    return finishLockedDurationRepitch(targetData, staffStep);
  }

  function repitchLockedMidiChord(midiNotes) {
    const targetData = lockedDurationTarget();
    if (!targetData) return false;
    const notes = uniqueMidiNotes(midiNotes);
    if (notes.length < 2) return false;
    const { target } = targetData;
    const infos = chordAwareMidiInfos(notes, target.measureIndex);
    if (!infos.length) return false;
    saveHistory();
    setEntryPitchInfos(target.entry, infos, target.measureIndex);
    const activeStaffStep = entryStaffSteps(target.entry).at(-1) ?? entryStaffStep(target.entry);
    return finishLockedDurationRepitch(targetData, activeStaffStep);
  }

  function moveNoteInputCaret(direction) {
    const pitchSnapshot = rememberFreeCursorPitch();
    const measureIndex = state.cursorMeasure;
    const measure = state.measures[measureIndex];
    if (!measure) return false;
    const measureLength = measureTicksForIndex(measureIndex);
    const navigableEntries = measure.entries.filter((entry) => (
      entryVoice(entry) === activeVoice() &&
      (entry.type === "note" || entry.explicitRest === true)
    ));
    let nextTick = Timeline.nearestGridOrEventTick({
      entries: navigableEntries,
      voice: activeVoice(),
      currentTick: state.cursorTick,
      gridStep: gridStepTicks(),
      direction,
      minTick: 0,
      maxTick: measureLength,
      includeRests: true
    });
    let nextAbsoluteTick = measureStartAbsoluteTick(measureIndex) + nextTick;
    if (direction > 0 && nextTick >= measureLength - EPSILON) {
      if (measureIndex >= state.measures.length - 1) {
        state.cursorTick = measureLength;
        restoreFreeCursorPitch(pitchSnapshot);
        render();
        requestAppendMeasuresAtEnd();
        return true;
      }
      nextAbsoluteTick = measureStartAbsoluteTick(measureIndex + 1);
    } else if (direction < 0 && nextTick <= EPSILON && state.cursorTick <= EPSILON) {
      if (measureIndex <= 0) nextAbsoluteTick = 0;
      else nextAbsoluteTick = measureStartAbsoluteTick(measureIndex) - gridStepTicks();
    }
    clearEntrySelection();
    clearActiveNote();
    if (!pitchSnapshot.visible) hideCursorPitch();
    setCursorFromAbsoluteTick(Math.max(0, nextAbsoluteTick));
    state.cursorActive = true;
    state.entryCursorActive = false;
    restoreFreeCursorPitch(pitchSnapshot);
    syncInputSession();
    render();
    return true;
  }

  function moveNoteInputCaretByDuration(direction) {
    if (!isNoteInputMode()) return false;
    const pitchSnapshot = rememberFreeCursorPitch();
    const durationTicks = Math.max(MIN_DURATION_TICKS, Number(state.activeDuration?.ticks) || gridStepTicks());
    const desired = cursorAbsoluteTick() + direction * durationTicks;
    if (direction > 0 && desired > scoreEndTick() + EPSILON) {
      requestAppendMeasuresAtEnd();
      return true;
    }
    setCursorFromAbsoluteTick(Math.max(0, Math.min(scoreEndTick(), desired)));
    clearEntrySelection();
    clearActiveNote();
    if (!pitchSnapshot.visible) hideCursorPitch();
    restoreFreeCursorPitch(pitchSnapshot);
    state.cursorActive = true;
    state.entryCursorActive = false;
    syncInputSession();
    render();
    return true;
  }

  function moveCursor(direction) {
    if (isNoteInputMode()) return moveNoteInputCaret(direction);
    const entries = state.measures.flatMap((measure, measureIndex) => (
      measure.entries.map((entry, entryIndex) => ({ measureIndex, entryIndex, entry }))
    )).filter((location) => (
      entryVoice(location.entry) === activeVoice() && !location.entry.hiddenTupletReserve
    )).sort((a, b) => (
      absoluteTickForLocation(a) - absoluteTickForLocation(b) || a.entryIndex - b.entryIndex
    ));
    const selection = selectedEntryLocation();
    if (!selection?.entry || !entries.length) return false;
    const selectedFlatIndex = entries.findIndex((item) => item.entry.id === selection.entry.id);
    const next = entries[selectedFlatIndex + direction];
    if (!next) return false;
    selectEntry(next.measureIndex, next.entryIndex, { activateCursor: false });
    render();
    return true;
  }

  function navigateSelectedNoteHead(direction) {
    const location = selectedEntryLocation() || selectedNoteLocations()[0];
    if (!location?.entry || location.entry.type !== "note") return false;
    const steps = [...entryStaffSteps(location.entry)].sort((a, b) => a - b);
    if (!steps.length) return false;
    const selectedRef = selectedNoteLocations().find((item) => item.entry.id === location.entry.id);
    const currentStep = Number.isFinite(selectedRef?.staffStep)
      ? selectedRef.staffStep
      : nearestEntryStaffStep(location.entry, state.cursorStaffStep);
    const currentIndex = Math.max(0, steps.findIndex((step) => Math.abs(step - currentStep) < EPSILON));
    const nextIndex = Math.max(0, Math.min(steps.length - 1, currentIndex + direction));
    const nextStep = steps[nextIndex];
    state.selectedEntryIds = [];
    state.selectedNoteRefs = [{ entryId: location.entry.id, staffStep: nextStep }];
    state.cursorEntryId = location.entry.id;
    state.cursorMeasure = location.measureIndex;
    state.cursorTick = location.entry.tickStart;
    state.cursorStaffStep = nextStep;
    setActiveNote(location.entry, nextStep);
    setInputPhase(InputSession.PHASES.SELECT);
    render();
    return true;
  }

  function moveCursorPitch(direction) {
    if (activeSystemIsPercussionLine()) {
      state.cursorStaffStep = 0;
      state.cursorActive = true;
      showCursorPitchAtCursor();
      setMode("note");
      render();
      return;
    }
    state.cursorStaffStep += direction;
    state.cursorActive = true;
    showCursorPitchAtCursor();
    const selection = selectedEntryLocation();
    if (selection?.entry?.type === "rest") {
      clearEntrySelection();
    } else if (selection) {
      state.entryCursorActive = true;
      if (
        selection.entry.type === "note" &&
        entryStaffSteps(selection.entry).some((step) => Math.abs(step - state.cursorStaffStep) < EPSILON)
      ) {
        setActiveNote(selection.entry, state.cursorStaffStep);
      }
    }
    setMode("note");
    render();
  }

  function moveSelectedPitchWithShift(direction) {
    if (moveSelectedNotesPitch(direction)) return;
    if (moveActiveNotePitch(direction)) return;
    moveCursorPitch(direction);
  }

  function moveSelectedPitchByOctave(direction) {
    const octaveSteps = direction * 7;
    if (moveSelectedNotesPitch(octaveSteps)) return;
    if (moveActiveNotePitch(octaveSteps)) return;
    moveCursorPitch(octaveSteps);
  }

  function accidentalGlyphName(accidental) {
    return {
      "double-flat": "accidentalDoubleFlat",
      flat: "accidentalFlat",
      natural: "accidentalNatural",
      sharp: "accidentalSharp",
      "double-sharp": "accidentalDoubleSharp"
    }[accidental];
  }

  function renderAccidental(root, x, y, accidental, extraClass = "", xOffset = null) {
    const glyphName = accidentalGlyphName(accidental);
    if (!glyphName) return;
    const center = glyphCenter(glyphName);
    const resolvedOffset = Number.isFinite(xOffset) ? xOffset : accidentalBaseOffset(glyphName);
    root.appendChild(textNode(
      x + resolvedOffset + appearanceValue("accidentalOffsetX") - center.x * SMUFL_SPACE,
      y + accidentalYOffset(),
      smufl(glyphName),
      {
        class: `music-glyph accidental${extraClass ? ` ${extraClass}` : ""}`,
        style: `font-size:${musicGlyphSize("accidentalScale")}px`
      }
    ));
  }

  function findLastNoteEntry(voice = activeVoice()) {
    const voiceFilter = Number(voice) === 2 ? 2 : 1;
    for (let measureIndex = state.measures.length - 1; measureIndex >= 0; measureIndex -= 1) {
      const entries = state.measures[measureIndex].entries;
      for (let entryIndex = entries.length - 1; entryIndex >= 0; entryIndex -= 1) {
        if (entries[entryIndex].type !== "rest" && entryVoice(entries[entryIndex]) === voiceFilter) {
          return entries[entryIndex];
        }
      }
    }
    return null;
  }

  function findActiveNoteTarget() {
    const location = entryLocationById(state.activeNoteEntryId);
    if (!location?.entry || location.entry.type === "rest" || entryVoice(location.entry) !== activeVoice()) {
      clearActiveNote();
      return null;
    }
    const staffStep = Number.isFinite(state.activeNoteStaffStep)
      ? nearestEntryStaffStep(location.entry, state.activeNoteStaffStep)
      : entryStaffStep(location.entry);
    return { entry: location.entry, staffStep };
  }

  function findCursorNoteTarget() {
    const activeNote = findActiveNoteTarget();
    if (activeNote) return activeNote;
    const selection = selectedEntryLocation();
    if (selection?.entry?.type !== "rest" && entryVoice(selection.entry) === activeVoice()) {
      return {
        entry: selection.entry,
        staffStep: nearestEntryStaffStep(selection.entry, state.cursorStaffStep)
      };
    }
    const entry = findLastNoteEntry(activeVoice());
    return entry ? { entry, staffStep: entryStaffStep(entry) } : null;
  }

  function setCursorNoteAccidental(accidental) {
    if (activeSystemIsPercussionLine()) return false;
    const target = findCursorNoteTarget();
    if (!target) return false;
    saveHistory();
    setEntryAccidental(target.entry, target.staffStep, accidental);
    const location = entryLocationById(target.entry.id);
    if (location) {
      normalizeChordSpellingAndSymbol(location);
      state.cursorStaffStep = nearestEntryStaffStep(target.entry, target.staffStep);
      setActiveNote(target.entry, state.cursorStaffStep);
    }
    render();
    auditionEntryStaffStep(target.entry, target.staffStep, location?.measureIndex ?? state.cursorMeasure);
    return true;
  }

  function doricoPitchDirection(event) {
    const noModifiers = !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey;
    if (noModifiers) return 0;
    if (event.shiftKey && event.altKey && !event.metaKey && !event.ctrlKey) return 1;
    if (event.metaKey && !event.shiftKey && !event.altKey && !event.ctrlKey) return -1;
    if (event.ctrlKey && event.altKey && !event.shiftKey && !event.metaKey) return -1;
    return null;
  }

  function doricoDiatonicStepForPitch(letter, direction = 0) {
    const pitch = pitchMap[letter];
    if (!pitch) return null;
    const clefId = clefIdAtAbsoluteTick(cursorAbsoluteTick());
    const reference = diatonicStepForStaffStep(state.cursorStaffStep, clefId);
    const degree = positiveModulo(pitch.diatonicStep, 7);
    let candidate = degree + Math.round((reference - degree) / 7) * 7;
    if (direction > 0) {
      while (candidate <= reference) candidate += 7;
    } else if (direction < 0) {
      while (candidate >= reference) candidate -= 7;
    }
    return candidate;
  }

  function handleDoricoPitchInput(event) {
    if (!isNoteInputMode()) return false;
    const match = String(event.code || "").match(/^Key([A-G])$/);
    if (!match) return false;
    const direction = doricoPitchDirection(event);
    if (direction === null) return false;
    event.preventDefault();
    if (state.mode === "rest") {
      insertEntry(0, { explicitRest: true, suppressAudition: true });
      return true;
    }
    const letter = match[1];
    const diatonicStep = doricoDiatonicStepForPitch(letter, direction);
    if (!Number.isFinite(diatonicStep)) return true;
    setMode("note");
    prepareDisplacementWritePoint();
    if (repitchLockedDuration(diatonicStep)) return true;
    const clefId = clefIdAtAbsoluteTick(cursorAbsoluteTick());
    const staffStep = staffStepForDiatonicStep(diatonicStep, clefId);
    if (state.pitchBeforeDurationMode) {
      state.cursorStaffStep = staffStepForSystem(staffStep);
      state.pendingInputPitch = { diatonicStep };
      state.pendingMidiNotes = [];
      showCursorPitchAtCursor();
      state.cursorActive = true;
      state.entryCursorActive = false;
      syncInputSession();
      render();
      return true;
    }
    state.pendingInputPitch = null;
    state.pendingMidiNotes = [];
    insertEntry(staffStep, { diatonicStep });
    return true;
  }

  function handleAccidentalKey(event) {
    const accidental = Keymap.accidentalForEvent(event);
    if (!accidental) return false;
    event.preventDefault();
    setCursorNoteAccidental(accidental);
    return true;
  }

  function isTextEditingTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    return target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  }

  function isPlaybackSpaceShortcut(event) {
    return !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      (event.code === "Space" || event.key === " " || event.key === "Spacebar");
  }

  function openPaletteById(paletteId) {
    const trigger = paletteTriggers.find((button) => button.dataset.palette === paletteId);
    if (!trigger) return false;
    openPalette(trigger);
    return true;
  }

  function beginChordSymbolInputAtCursor() {
    setChordMode(true);
    const layout = buildLayout();
    addChordItemAtPoint({
      x: cursorVisualX(layout),
      y: chordBaselineY(state.cursorMeasure)
    });
  }

  function beginTextInputAtCursor() {
    setTextMode(true);
    const layout = buildLayout();
    return addTextItemAtPoint({
      x: cursorVisualX(layout),
      y: staffTopY() - 48
    });
  }

  const DORICO_ARTICULATION_GLYPHS = Object.freeze({
    "articulation.accent": "articAccentAbove",
    "articulation.staccato": "articStaccatoAbove",
    "articulation.marcato": "articMarcatoAbove",
    "articulation.stress": "articStressAbove",
    "articulation.staccatissimo": "articStaccatissimoAbove",
    "articulation.tenuto": "articTenutoAbove",
    "articulation.portato": "articTenutoStaccatoAbove",
    "articulation.unstress": "articUnstressAbove"
  });

  function applyDoricoArticulation(command) {
    const glyphName = DORICO_ARTICULATION_GLYPHS[command];
    if (!glyphName) return false;
    const item = palettes.articulations.find((candidate) => candidate.glyphName === glyphName);
    return item ? insertNotationMark(item) : false;
  }

  function handleSemanticKeyCommand(event) {
    const command = Keymap.commandForEvent(event);
    if (!command) return false;
    if ((command === "note-input.advance" || command === "note-input.retreat") && !isNoteInputMode()) return false;
    event.preventDefault();
    if (command === "note-input.toggle") toggleNoteInput();
    else if (command === "note-input.chord") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      toggleNoteInputModifier("chordMode");
    } else if (command === "note-input.insert") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      toggleNoteInputModifier("insertMode");
    } else if (command === "note-input.lock-duration") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      toggleNoteInputModifier("lockDuration");
    } else if (command === "note-input.force-duration") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      toggleNoteInputModifier("forceDuration");
    } else if (command === "note-input.pitch-before-duration") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      toggleNoteInputModifier("pitchBeforeDuration");
    } else if (command === "note-input.next-voice") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      setVoiceMode(activeVoice() === 1 ? 2 : 1);
    } else if (command === "note-input.create-voice") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      setVoiceMode(2);
    } else if (command === "note-input.rest") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      setMode(state.mode === "rest" ? "note" : "rest");
    } else if (command === "note-input.tuplet") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      requestCustomTuplet();
    } else if (command === "note-input.stop-tuplet") {
      deactivateTupletWriting();
      state.pendingTupletRatio = null;
      render();
    } else if (command === "note-input.advance") moveNoteInputCaretByDuration(1);
    else if (command === "note-input.pitch-current") {
      if (!isNoteInputMode()) startNoteInput({ preferFirstWritable: true });
      insertEntry(state.mode === "rest" ? 0 : state.cursorStaffStep, {
        explicitRest: state.mode === "rest",
        suppressAudition: state.mode === "rest"
      });
    }
    else if (command === "duration.dot") addDotToPreviousFigure();
    else if (command === "duration.cycle-dots") cycleDotsOnPreviousFigure();
    else if (command === "notation.tie") toggleDurationTieFromCurrentNote();
    else if (command === "notation.slur") addPhraseSlur();
    else if (command === "notation.slur-stop") stopPhraseSlurInput();
    else if (command === "dynamic.crescendo") insertNotationMark({ markType: "crescendo" });
    else if (command === "dynamic.diminuendo") insertNotationMark({ markType: "diminuendo" });
    else if (command === "edit.move-left") moveSelectedItemsByGrid(-1);
    else if (command === "edit.move-right") moveSelectedItemsByGrid(1);
    else if (command === "duration.shorten-by-grid") resizeSelectedEntriesByGrid(-1);
    else if (command === "duration.lengthen-by-grid") resizeSelectedEntriesByGrid(1);
    else if (command === "edit.flip") toggleSelectedFlip();
    else if (command === "edit.repeat") {
      if (!repeatSelectedContent()) repeatSelectedEntries();
    }
    else if (command === "grid.coarser") changeGridResolution(1);
    else if (command === "grid.finer") changeGridResolution(-1);
    else if (command === "popover.bars") openPaletteById("bars");
    else if (command === "popover.key-signature") requestKeySignature();
    else if (command === "popover.meter") openPaletteById("meters");
    else if (command === "popover.ornaments") openPaletteById("articulations");
    else if (command === "popover.chord-symbol") beginChordSymbolInputAtCursor();
    else if (command === "popover.repeats") openPaletteById("bars");
    else if (command === "popover.tempo") openPaletteById("tempo");
    else if (command === "popover.text") beginTextInputAtCursor();
    else if (command === "popover.system-text") beginTextInputAtCursor();
    else if (command === "popover.clef") openPaletteById("clefs");
    else if (command === "popover.dynamics") activateDynamicsTool();
    else if (command === "popover.holds") openPaletteById("articulations");
    else if (command === "popover.note-tools") openPaletteById("tools");
    else if (command === "popover.playing-techniques") openPaletteById("articulations");
    else if (command.startsWith("articulation.")) applyDoricoArticulation(command);
    return true;
  }

  function handleKeydown(event) {
    if (isTextEditingTarget(event.target)) return;
    if (handleDoricoPitchInput(event)) return;
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "a") {
      event.preventDefault();
      selectAllItems();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "d") {
      event.preventDefault();
      deselectAll();
      render();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "x") {
      event.preventDefault();
      copySelectedContentToClipboard();
      if (deleteSelectedMarks()) return;
      if (deleteSelectedTextItem()) return;
      deleteActiveNoteOrCursorEntry();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
      event.preventDefault();
      copySelectedContentToClipboard();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
      event.preventDefault();
      pasteClipboardContentAtAbsoluteTick(singlePasteTargetAbsoluteTick());
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      const isZoomIn = event.key === "+" || event.key === "=" || event.code === "Equal" || event.code === "NumpadAdd";
      const isZoomOut = event.key === "-" || event.code === "Minus" || event.code === "NumpadSubtract";
      const isZoomReset = event.key === "0" || event.code === "Digit0" || event.code === "Numpad0";
      if (isZoomIn) {
        event.preventDefault();
        zoomBy(0.1);
        return;
      }
      if (isZoomOut) {
        event.preventDefault();
        zoomBy(-0.1);
        return;
      }
      if (isZoomReset) {
        event.preventDefault();
        setZoom(1);
        return;
      }
    }
    if (event.key === "Escape") {
      event.preventDefault();
      activateSelectTool();
      return;
    }
    if (event.key === "Enter" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      if (isNoteInputMode()) activateSelectTool();
      else startNoteInput({ preferFirstWritable: true });
      return;
    }
    if (handleSemanticKeyCommand(event)) return;
    if (isPlaybackSpaceShortcut(event)) {
      event.preventDefault();
      if (!event.repeat) toggleMidiPlayback();
      return;
    }
    if (!isNoteInputMode() && event.code === "KeyP" && !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      if (!event.repeat) toggleMidiPlayback();
      return;
    }
    if (event.altKey && (event.code === "KeyN" || event.code === "KeyM")) {
      event.preventDefault();
      moveSelectedNotesToAdjacentSystem(event.code === "KeyN" ? -1 : 1);
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      moveSelectedPitchByOctave(event.key === "ArrowUp" ? 1 : -1);
      return;
    }
    if (event.altKey && !event.metaKey && !event.ctrlKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      moveSelectedPitchWithShift(event.key === "ArrowUp" ? 1 : -1);
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.toUpperCase() === "Z") {
      event.preventDefault();
      zoomBy(0.1);
      return;
    }
    if (event.key.toUpperCase() === "X") {
      event.preventDefault();
      zoomBy(-0.1);
      return;
    }
    if (handleAccidentalKey(event)) return;

    const durationId = Keymap.durationIdForEvent(event);
    const duration = durationById(durationId);
    if (duration) {
      event.preventDefault();
      const keepTuplet = normalizeTuplet(state.activeTuplet)?.unitDurationId === duration.id;
      chooseDuration(duration, { keepTuplet });
      const selection = selectedEntryLocation();
      if (state.displacementMode && selection?.entry) {
        insertDisplacementFigureAtSelection(duration);
        return;
      }
      if (changeSelectedNoteDurations(duration)) return;
      if (selection?.entry?.type === "rest" && cursorPitchReadyToWrite()) {
        replaceSelectedRestWithNoteDuration(duration);
        return;
      }
      if (selection?.entry?.type === "rest") {
        replaceSelectedEntryWithRestDuration(duration);
        return;
      }
      if (selection?.entry?.type === "note") {
        replaceSelectedEntryDuration(duration);
        return;
      }
      if (!state.cursorActive) {
        render();
        return;
      }
      if (commitPendingPitchInput()) return;
      if (cursorPitchReadyToWrite()) insertEntry(state.cursorStaffStep);
      else render();
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      if (deleteSelectedMarks()) return;
      if (deleteSelectedTextItem()) return;
      deleteActiveNoteOrCursorEntry();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (moveSelectedNonNoteItems(1, event)) return;
      moveCursor(1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (moveSelectedNonNoteItems(-1, event)) return;
      moveCursor(-1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (event.altKey) moveSelectedPitchByOctave(1);
      else if (event.shiftKey) moveSelectedPitchWithShift(1);
      else if (isNoteInputMode()) moveCursorPitch(1);
      else navigateSelectedNoteHead(1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (event.altKey) moveSelectedPitchByOctave(-1);
      else if (event.shiftKey) moveSelectedPitchWithShift(-1);
      else if (isNoteInputMode()) moveCursorPitch(-1);
      else navigateSelectedNoteHead(-1);
    }
  }

  const appearanceControlGroups = [
    {
      title: "Fuentes",
      controls: [
        { type: "font", key: "scoreTextFont", label: "Texto de partitura", fallback: "Ink Free" },
        { type: "font", key: "canvasTextFont", label: "Texto del canvas", fallback: "Ink Free" },
        { type: "font", key: "tempoTextFont", label: "Texto de tempo", fallback: "Ink Free" },
        { type: "font", key: "tempoGlyphFont", label: "Glifo de tempo", fallback: "MTF Improviso Light" },
        { type: "font", key: "musicGlyphFont", label: "Glifos musicales del canvas", fallback: "MTF Improviso Light" },
        { type: "font", key: "timeSignatureFont", label: "Signaturas de medida", fallback: "Ink Free" },
        { type: "font", key: "iconTextFont", label: "Texto de iconos", fallback: "Arial" },
        { type: "font", key: "iconMusicFont", label: "Glifos musicales de iconos", fallback: "MTF Improviso Light" }
      ]
    },
    {
      title: "Canvas y sistema",
      controls: [
        ["scoreOffsetX", "Mover partitura X", -120, 160, 1],
        ["scoreOffsetY", "Mover partitura Y", -80, 120, 1],
        ["staffLeftOffset", "Inicio visible del pentagrama", -80, 180, 1],
        ["scoreMinWidth", "Ancho mínimo del canvas", 700, 2200, 10],
        ["scoreHeight", "Alto del canvas", 180, 900, 10],
        ["hitZoneHeight", "Alto zona editable", 120, 900, 10]
      ]
    },
    {
      title: "Líneas y barras de compás",
      controls: [
        ["staffLineWidthScale", "Grosor líneas de pentagrama", 0.25, 3, 0.05],
        ["staffLineOffsetY", "Mover líneas de pentagrama Y", -12, 12, 0.5],
        ["barLineWidthScale", "Grosor barras de compás", 0.25, 3, 0.05],
        ["barLineOffsetX", "Mover barras de compás X", -16, 16, 0.5],
        ["barLineTopOffsetY", "Extremo superior barras Y", -20, 20, 0.5],
        ["barLineBottomOffsetY", "Extremo inferior barras Y", -20, 20, 0.5],
        ["ledgerLineWidthScale", "Grosor líneas adicionales", 0.25, 3, 0.05],
        ["ledgerOffsetX", "Mover líneas adicionales X", -16, 16, 0.5],
        ["ledgerOffsetY", "Mover líneas adicionales Y", -16, 16, 0.5],
        ["ledgerExtension", "Extensión líneas adicionales", -12, 24, 0.5]
      ]
    },
    {
      title: "Clave, compás y números",
      controls: [
        ["clefScale", "Escala clave", 0.5, 1.8, 0.01],
        ["clefOffsetX", "Mover clave X", -50, 50, 0.5],
        ["clefOffsetY", "Mover clave Y", -50, 50, 0.5],
        ["clefSpacingMinWidth", "Espacio mínimo claves internas", 20, 120, 1],
        ["clefSpacingPadding", "Padding claves internas", 0, 80, 1],
        ["keySignatureScale", "Escala armadura", 0.5, 1.8, 0.01],
        ["keySignatureOffsetX", "Mover armadura X", -50, 80, 0.5],
        ["keySignatureOffsetY", "Mover armadura Y", -40, 40, 0.5],
        ["keySignatureAccidentalGap", "Separación alteraciones", 4, 24, 0.5],
        ["keySignatureTimeGap", "Espacio armadura-signatura", 0, 48, 0.5],
        ["timeSignatureScale", "Escala signatura", 0.5, 1.8, 0.01],
        ["timeSignatureOffsetX", "Mover signatura X", -40, 60, 0.5],
        ["timeSignatureOffsetY", "Mover signatura Y", -40, 60, 0.5],
        ["measureNumberScale", "Escala números de compás", 0.5, 2.2, 0.01],
        ["measureNumberOffsetX", "Mover números de compás X", -30, 30, 0.5],
        ["measureNumberOffsetY", "Mover números de compás Y", -30, 30, 0.5]
      ]
    },
    {
      title: "Cabezas, plicas y flags",
      controls: [
        ["glyphScale", "Escala global SMuFL", 0.75, 1.35, 0.01],
        ["noteheadScale", "Escala cabezas de nota", 0.75, 1.35, 0.01],
        ["noteheadOffsetX", "Mover cabezas X", -16, 16, 0.5],
        ["noteheadOffsetY", "Mover cabezas Y", -16, 16, 0.5],
        ["stemGlyphScaleX", "Ancho visual de plicas", 0.5, 2, 0.05],
        ["stemMirrorOffsetX", "Plica-cabeza X en espejo", -16, 16, 0.5],
        ["stemMirrorOffsetY", "Plica-cabeza Y en espejo", -16, 16, 0.5],
        ["stemOffsetX", "Ajuste técnico plicas X global", -16, 16, 0.5],
        ["stemOffsetY", "Ajuste técnico plicas Y global", -16, 16, 0.5],
        ["stemEndExtension", "Extensión final de plicas", -10, 10, 0.5],
        ["flagScale", "Escala flags", 0.75, 1.5, 0.01],
        ["flagStemOffsetX", "Flag-plica X en espejo", -16, 16, 0.5],
        ["flagStemOffsetY", "Flag-plica Y en espejo", -16, 16, 0.5],
        ["flagUpOffsetX", "Ajuste técnico flag arriba X", -16, 16, 0.5],
        ["flagUpOffsetY", "Ajuste técnico flag arriba Y", -16, 16, 0.5],
        ["flagDownOffsetX", "Ajuste técnico flag abajo X", -16, 16, 0.5],
        ["flagDownOffsetY", "Ajuste técnico flag abajo Y", -16, 16, 0.5]
      ]
    },
    {
      title: "Barras de corcheas",
      controls: [
        ["beamWidthScale", "Grosor de barras", 0.35, 2.5, 0.05],
        ["beamSpacingScale", "Separación entre barras", 0.35, 3, 0.05],
        ["beamOffsetX", "Mover barras X", -16, 16, 0.5],
        ["beamOffsetY", "Mover barras Y", -16, 16, 0.5],
        ["partialBeamLength", "Longitud de barras parciales", 4, 28, 1],
        ["partialBeamOffsetX", "Mover barras parciales X", -16, 16, 0.5],
        ["partialBeamOffsetY", "Mover barras parciales Y", -16, 16, 0.5],
        ["beamCollisionClearance", "Separación anti-colisión", 0, 24, 1]
      ]
    },
    {
      title: "Alteraciones",
      controls: [
        ["accidentalScale", "Escala alteraciones", 0.75, 1.7, 0.01],
        ["accidentalOffsetX", "Mover alteraciones X global", -24, 24, 0.5],
        ["accidentalOffsetY", "Mover alteraciones Y global", -24, 24, 0.5],
        ["accidentalNoteGap", "Espacio alteración-nota", -8, 24, 0.5],
        ["accidentalYOffset", "Altura de alteraciones", -18, 18, 0.5],
        ["accidentalColumnGap", "Distancia entre columnas", 0, 18, 0.5],
        ["accidentalStackPadX", "Colisión horizontal", 0, 12, 0.5],
        ["accidentalStackPadY", "Colisión vertical", 0, 12, 0.5],
        ["accidentalCollisionStep", "Paso de corrimiento", 1, 18, 0.5],
        ["accidentalCollisionTries", "Intentos anti-colisión", 1, 40, 1],
        ["accidentalExtentCorrection", "Corrección borde izquierdo", -16, 16, 0.5]
      ]
    },
    {
      title: "Silencios y puntillos",
      controls: [
        ["restScale", "Escala silencios", 0.75, 1.6, 0.01],
        ["restOffsetX", "Mover silencios X", -24, 24, 0.5],
        ["restOffsetY", "Mover silencios Y", -24, 24, 0.5],
        ["restCenterShift", "Centro vertical de silencios", -24, 24, 0.5],
        ["restOpticalQuarter", "Ajuste silencio negra", -24, 24, 0.5],
        ["restOpticalEighth", "Ajuste silencio corchea", -24, 24, 0.5],
        ["restOpticalSixteenth", "Ajuste silencios menores", -24, 24, 0.5],
        ["restOpticalHalf", "Ajuste silencio blanca", -24, 24, 0.5],
        ["restOpticalWhole", "Ajuste silencio redonda", -24, 24, 0.5],
        ["dotScale", "Escala puntillos", 0.75, 1.7, 0.01],
        ["dotGap", "Distancia cabeza-puntillo", 0, 20, 0.5],
        ["dotOffsetX", "Mover puntillos X", -16, 16, 0.5],
        ["dotOffsetY", "Mover puntillos Y", -16, 16, 0.5]
      ]
    },
    {
      title: "Espaciado",
      controls: [
        ["measureLeftInset", "Pad inicial de compás", 0, 60, 1],
        ["measureRightInset", "Pad final de compás", 0, 60, 1],
        ["minTickSpacing", "Tick mínimo sin flags", 3, 20, 0.5],
        ["eighthTickSpacing", "Tick con corcheas", 3, 24, 0.5],
        ["sixteenthTickSpacing", "Tick con semicorcheas", 3, 28, 0.5],
        ["minForwardGap", "Distancia mínima frontal", 2, 28, 0.5],
        ["forwardGapProgression", "Progresión por duración", 1, 3, 0.01],
        ["afterQuarterRestGap", "Extra después de silencio negra", 0, 28, 0.5],
        ["flippedSecondDistance", "Extra flip de segundas", -16, 16, 0.5]
      ]
    },
    {
      title: "Ligaduras",
      controls: [
        ["tieThicknessScale", "Grosor ligadura", 0.35, 3, 0.05],
        ["tieArcScale", "Curvatura ligadura", 0.35, 2.5, 0.05],
        ["tieEndpointInset", "Entrada/salida ligadura", -16, 16, 0.5],
        ["tieOffsetX", "Mover ligadura X", -24, 24, 0.5],
        ["tieOffsetY", "Mover ligadura Y", -24, 24, 0.5],
        ["tieStartOffsetX", "Inicio ligadura X", -24, 24, 0.5],
        ["tieStartOffsetY", "Inicio ligadura Y", -24, 24, 0.5],
        ["tieEndOffsetX", "Final ligadura X", -24, 24, 0.5],
        ["tieEndOffsetY", "Final ligadura Y", -24, 24, 0.5]
      ]
    },
    {
      title: "Cursor",
      controls: [
        ["cursorOffsetX", "Mover cursor X", -40, 40, 0.5],
        ["cursorOffsetY", "Mover cursor Y", -40, 40, 0.5],
        ["cursorLineTopOffsetY", "Extremo superior cursor", -40, 40, 0.5],
        ["cursorLineBottomOffsetY", "Extremo inferior cursor", -40, 40, 0.5],
        ["cursorHeadOffsetX", "Cabeza sombra X", -24, 24, 0.5],
        ["cursorHeadOffsetY", "Cabeza sombra Y", -24, 24, 0.5]
      ]
    },
    {
      title: "Marcas activas",
      controls: [
        ["articulationScale", "Escala articulaciones", 0.5, 2, 0.01],
        ["articulationOffsetX", "Articulaciones X", -40, 40, 0.5],
        ["articulationOffsetY", "Articulaciones Y", -40, 40, 0.5],
        ["dynamicScale", "Escala dinámicas", 0.5, 2, 0.01],
        ["dynamicOffsetX", "Dinámicas X", -60, 60, 0.5],
        ["dynamicOffsetY", "Dinámicas Y", -60, 60, 0.5],
        ["hairpinScaleX", "Ancho regulador", 0.4, 4, 0.05],
        ["hairpinScaleY", "Apertura regulador", 0.4, 3, 0.05],
        ["hairpinOffsetX", "Regulador X", -60, 60, 0.5],
        ["hairpinOffsetY", "Regulador Y", -60, 60, 0.5],
        ["hairpinThicknessScale", "Grosor regulador", 0.35, 3, 0.05],
        ["ritScale", "Escala ritardando", 0.5, 2, 0.01],
        ["ritOffsetX", "Ritardando X", -60, 60, 0.5],
        ["ritOffsetY", "Ritardando Y", -60, 60, 0.5],
        ["fermataScale", "Escala calderón", 0.5, 2, 0.01],
        ["fermataOffsetX", "Calderón X", -60, 60, 0.5],
        ["fermataOffsetY", "Calderón Y", -60, 60, 0.5]
      ]
    },
    {
      title: "Tempo en partitura",
      controls: [
        ["tempoScale", "Escala general tempo", 0.5, 2.5, 0.01],
        ["tempoOffsetX", "Tempo X", -80, 80, 0.5],
        ["tempoOffsetY", "Tempo Y", -80, 80, 0.5],
        ["tempoHeadScale", "Tamaño cabeza tempo", 0.5, 4, 0.01],
        ["tempoHeadOffsetX", "Cabeza tempo X", -40, 40, 0.5],
        ["tempoHeadOffsetY", "Cabeza tempo Y", -40, 40, 0.5],
        ["tempoStemScale", "Grosor/ancho plica tempo", 0.35, 3, 0.05],
        ["tempoStemHeight", "Altura plica tempo", 4, 60, 0.5],
        ["tempoStemOffsetX", "Plica tempo X", -40, 40, 0.5],
        ["tempoStemOffsetY", "Plica tempo Y", -40, 40, 0.5],
        ["tempoFlagScale", "Tamaño flag tempo", 0.35, 4, 0.01],
        ["tempoFlagOffsetX", "Flag tempo X", -40, 40, 0.5],
        ["tempoFlagOffsetY", "Flag tempo Y", -40, 40, 0.5],
        ["tempoDotScale", "Tamaño puntillo tempo", 0.35, 4, 0.01],
        ["tempoDotGap", "Distancia cabeza-puntillo tempo", 0, 40, 0.5],
        ["tempoDotOffsetX", "Puntillo tempo X", -40, 40, 0.5],
        ["tempoDotOffsetY", "Puntillo tempo Y", -40, 40, 0.5],
        ["tempoGlyphWidth", "Ancho reservado figura tempo", 4, 80, 0.5],
        ["tempoTextScale", "Tamaño texto tempo", 0.5, 2.5, 0.01],
        ["tempoTextGap", "Espacio figura-texto tempo", -20, 60, 0.5]
      ]
    },
    {
      title: "Menú y teclado MIDI",
      controls: [
        ["menuPrimaryOffsetX", "Menú principal X", -120, 120, 1],
        ["menuPrimaryOffsetY", "Menú principal Y", -80, 80, 1],
        ["menuPrimaryScale", "Escala menú principal", 0.7, 1.4, 0.01],
        ["menuPrimaryGap", "Separación iconos menú", 0, 24, 1],
        ["menuDrawerOffsetX", "Desplegable X", -120, 120, 1],
        ["menuDrawerOffsetY", "Desplegable Y", -80, 80, 1],
        ["menuDrawerScale", "Escala desplegable", 0.7, 1.5, 0.01],
        ["menuDrawerGap", "Separación iconos desplegable", 0, 28, 1],
        ["menuDrawerPaddingX", "Padding horizontal desplegable", 0, 32, 1],
        ["menuDrawerPaddingY", "Padding vertical desplegable", 0, 28, 1],
        ["midiPanelOffsetX", "Teclado MIDI X", -160, 160, 1],
        ["midiPanelOffsetY", "Teclado MIDI Y", -120, 120, 1],
        ["midiPanelScale", "Escala panel MIDI", 0.65, 1.6, 0.01],
        ["midiPanelPadding", "Padding panel MIDI", 0, 30, 1],
        ["midiStripGap", "Separación iconos MIDI", 0, 18, 1],
        ["midiButtonSize", "Tamaño botones MIDI", 22, 58, 1],
        ["midiButtonTextScale", "Texto/glifo botones MIDI", 0.5, 1.8, 0.01],
        ["midiWhiteKeyWidth", "Ancho teclas blancas", 18, 56, 1],
        ["midiWhiteKeyHeight", "Alto teclas blancas", 48, 150, 1],
        ["midiBlackKeyWidth", "Ancho teclas negras", 10, 36, 1],
        ["midiBlackKeyHeight", "Alto teclas negras", 30, 110, 1],
        ["midiKeyLabelScale", "Tamaño etiquetas de teclas", 0.5, 1.8, 0.01]
      ]
    }
  ];

  function serializedAppearance() {
    return JSON.stringify(appearance, null, 2);
  }

  function updateAppearanceJson() {
    if (appearanceJson) appearanceJson.value = serializedAppearance();
  }

  function formatAppearanceValue(value) {
    return Appearance.formatValue(value);
  }

  let appearanceTuningTimer = null;

  function setAppearanceTuning(active) {
    if (!appearancePanel) return;
    window.clearTimeout(appearanceTuningTimer);
    if (active) {
      appearancePanel.classList.add("is-tuning");
      return;
    }
    appearanceTuningTimer = window.setTimeout(() => {
      appearancePanel.classList.remove("is-tuning");
    }, 260);
  }

  function renderAppearanceControls(options = {}) {
    if (!appearanceControls) return;
    if (!options.force && !appearanceAdminIsVisible()) return;
    appearanceControls.innerHTML = "";
    appearanceControlGroups.forEach((group) => {
      const groupNode = document.createElement("section");
      groupNode.className = "appearance-group";
      groupNode.innerHTML = `<h3>${group.title}</h3>`;
      group.controls.forEach((control) => {
        const [key, label, min, max, step] = Array.isArray(control)
          ? control
          : [control.key, control.label, control.min, control.max, control.step];
        const row = document.createElement("div");
        row.className = "appearance-control";
        if (control.type === "font") {
          const value = appearanceFont(key, control.fallback || "Ink Free");
          row.innerHTML = `
            <label for="appearance-${key}">
              <span>${label}</span>
              <output>${escapeHtml(value)}</output>
            </label>
            <select id="appearance-${key}">
              ${FONT_OPTIONS.map((option) => (
                `<option value="${escapeHtml(option.value)}"${option.value === value ? " selected" : ""}>${escapeHtml(option.label)}</option>`
              )).join("")}
            </select>
          `;
          const select = row.querySelector("select");
          const output = row.querySelector("output");
          select.addEventListener("change", () => {
            appearance[key] = knownFont(select.value, control.fallback || "Ink Free");
            output.textContent = appearance[key];
            saveAppearance();
            updateAppearanceJson();
            applyAppearanceFontVariables();
            render();
            fitIconGlyphs();
          });
          groupNode.appendChild(row);
          return;
        }
        const value = appearanceValue(key);
        row.innerHTML = `
          <label for="appearance-${key}">
            <span>${label}</span>
            <output>${formatAppearanceValue(value)}</output>
          </label>
          <input id="appearance-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">
        `;
        const input = row.querySelector("input");
        const output = row.querySelector("output");
        input.addEventListener("pointerdown", () => setAppearanceTuning(true));
        input.addEventListener("pointerup", () => setAppearanceTuning(false));
        input.addEventListener("pointercancel", () => setAppearanceTuning(false));
        input.addEventListener("blur", () => setAppearanceTuning(false));
        input.addEventListener("change", () => setAppearanceTuning(false));
        input.addEventListener("input", () => {
          setAppearanceTuning(true);
          appearance[key] = Number(input.value);
          output.textContent = formatAppearanceValue(appearance[key]);
          saveAppearance();
          updateAppearanceJson();
          applyAppearanceFontVariables();
          render();
          renderMidiKeyboard();
          scheduleIconFit();
        });
        groupNode.appendChild(row);
      });
      appearanceControls.appendChild(groupNode);
    });
    updateAppearanceJson();
  }

  function resetAppearance() {
    appearance = { ...FACTORY_APPEARANCE };
    saveAppearance();
    applyAppearanceFontVariables();
    renderAppearanceControls({ force: true });
    renderMidiLabelAppearancePanel({ force: true });
    render();
    scheduleIconFit();
  }

  async function copyAppearance() {
    updateAppearanceJson();
    if (!navigator.clipboard || !appearanceJson) return;
    await navigator.clipboard.writeText(appearanceJson.value);
  }

  function exportAppearance() {
    const blob = new Blob([serializedAppearance()], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "apariencia-cuaderno-estudio.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function importAppearance(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const imported = JSON.parse(String(reader.result || "{}"));
        appearance = { ...FACTORY_APPEARANCE, ...imported };
        saveAppearance();
        applyAppearanceFontVariables();
        renderAppearanceControls({ force: true });
        renderMidiLabelAppearancePanel({ force: true });
        render();
        scheduleIconFit();
      } catch {
        window.alert("No pude leer ese JSON de apariencia.");
      }
    });
    reader.readAsText(file);
  }

  function serializedIconAppearance() {
    return JSON.stringify(iconAppearance, null, 2);
  }

  function updateIconAppearanceJson() {
    if (iconAppearanceJson) iconAppearanceJson.value = serializedIconAppearance();
  }

  function setAppearanceSettingFromIconPanel(key, value) {
    appearance[key] = Number(value);
    saveAppearance();
    applyAppearanceFontVariables();
    renderMidiKeyboard();
    fitIconGlyphs();
  }

  function setIconSetting(iconId, key, value) {
    iconConfig(iconId)[key] = Number(value);
    saveIconAppearance();
    updateIconAppearanceJson();
    fitIconGlyphs();
  }

  function setIconTooltip(iconId, value) {
    const config = iconConfig(iconId);
    const nextValue = String(value || "").trim();
    if (nextValue) config.tooltip = nextValue;
    else delete config.tooltip;
    saveIconAppearance();
    updateIconAppearanceJson();
    document.querySelectorAll(`[data-icon-id="${CSS.escape(iconId)}"]`).forEach(applyIconTooltipToElement);
    if (appearanceAdminIsVisible()) renderIconSelector();
    if (iconAppearanceSelect) iconAppearanceSelect.value = iconId;
  }

  function setIconLayerSetting(iconId, layerId, key, value) {
    iconLayerConfig(iconId, layerId)[key] = Number(value);
    saveIconAppearance();
    updateIconAppearanceJson();
    fitIconGlyphs();
  }

  function makeIconRange({ label, value, min, max, step, onInput }) {
    return AdminControls.makeRange({
      label,
      value,
      min,
      max,
      step,
      formatValue: formatAppearanceValue,
      onInput
    });
  }

  function makeIconTextControl({ label, value, placeholder, onInput }) {
    return AdminControls.makeTextControl({
      label,
      value,
      placeholder,
      escapeHtml,
      onInput
    });
  }

  function colorToInputValue(value, fallback = "#15120f") {
    return Appearance.colorToInputValue(value, fallback);
  }

  function setMidiLabelAppearance(key, value) {
    appearance[key] = value;
    saveAppearance();
    updateAppearanceJson();
    applyAppearanceFontVariables();
    applyMidiKeyboardHighlights();
  }

  function makeMidiLabelColorControl({ label, key, fallback }) {
    const row = document.createElement("div");
    row.className = "appearance-control";
    row.innerHTML = `
      <label for="appearance-${key}">
        <span>${escapeHtml(label)}</span>
      </label>
      <input id="appearance-${key}" class="midi-label-color-input" type="color" value="${colorToInputValue(appearanceString(key, fallback), fallback)}">
    `;
    const input = row.querySelector("input");
    input.addEventListener("input", () => setMidiLabelAppearance(key, input.value));
    return row;
  }

  function makeMidiLabelSelectControl({ label, key, options }) {
    const value = appearanceString(key, "pill");
    const row = document.createElement("div");
    row.className = "appearance-control";
    row.innerHTML = `
      <label for="appearance-${key}">
        <span>${escapeHtml(label)}</span>
        <output>${escapeHtml(options.find((option) => option.value === value)?.label || value)}</output>
      </label>
      <select id="appearance-${key}">
        ${options.map((option) => (
          `<option value="${escapeHtml(option.value)}"${option.value === value ? " selected" : ""}>${escapeHtml(option.label)}</option>`
        )).join("")}
      </select>
    `;
    const select = row.querySelector("select");
    const output = row.querySelector("output");
    select.addEventListener("change", () => {
      setMidiLabelAppearance(key, select.value);
      output.textContent = options.find((option) => option.value === select.value)?.label || select.value;
    });
    return row;
  }

  function renderMidiLabelAppearancePanel(options = {}) {
    if (!midiLabelAppearanceControls) return;
    if (!options.force && !appearanceAdminIsVisible()) return;
    midiLabelAppearanceControls.innerHTML = "";
    const enclosureOptions = [
      { value: "pill", label: "Pastilla" },
      { value: "box", label: "Caja" },
      { value: "circle", label: "Círculo" },
      { value: "none", label: "Sin caja" }
    ];
    [
      { title: "Etiquetas en teclas blancas", prefix: "midiWhiteLabel", colorFallback: "#fff7de", bgFallback: "#15120f", borderFallback: "#ffffff" },
      { title: "Etiquetas en teclas negras", prefix: "midiBlackLabel", colorFallback: "#15120f", bgFallback: "#fff8df", borderFallback: "#15120f" }
    ].forEach((group) => {
      const node = document.createElement("section");
      node.className = "appearance-group midi-label-group";
      node.innerHTML = `<h3>${escapeHtml(group.title)}</h3>`;
      node.appendChild(makeIconRange({
        label: "Tamaño",
        value: appearanceValue(`${group.prefix}Size`),
        min: 6,
        max: 28,
        step: 0.5,
        onInput: (value) => setMidiLabelAppearance(`${group.prefix}Size`, Number(value))
      }));
      node.appendChild(makeIconRange({
        label: "Posición X",
        value: appearanceValue(`${group.prefix}OffsetX`),
        min: -36,
        max: 36,
        step: 0.5,
        onInput: (value) => setMidiLabelAppearance(`${group.prefix}OffsetX`, Number(value))
      }));
      node.appendChild(makeIconRange({
        label: "Posición Y",
        value: appearanceValue(`${group.prefix}OffsetY`),
        min: -36,
        max: 36,
        step: 0.5,
        onInput: (value) => setMidiLabelAppearance(`${group.prefix}OffsetY`, Number(value))
      }));
      node.appendChild(makeMidiLabelSelectControl({
        label: "Enclosure",
        key: `${group.prefix}Enclosure`,
        options: enclosureOptions
      }));
      node.appendChild(makeMidiLabelColorControl({
        label: "Color texto",
        key: `${group.prefix}Color`,
        fallback: group.colorFallback
      }));
      node.appendChild(makeMidiLabelColorControl({
        label: "Color fondo",
        key: `${group.prefix}Background`,
        fallback: group.bgFallback
      }));
      node.appendChild(makeMidiLabelColorControl({
        label: "Color borde",
        key: `${group.prefix}Border`,
        fallback: group.borderFallback
      }));
      node.appendChild(makeIconRange({
        label: "Opacidad",
        value: appearanceValue(`${group.prefix}Opacity`),
        min: 0,
        max: 1,
        step: 0.01,
        onInput: (value) => setMidiLabelAppearance(`${group.prefix}Opacity`, Number(value))
      }));
      node.appendChild(makeIconRange({
        label: "Padding X",
        value: appearanceValue(`${group.prefix}PaddingX`),
        min: 0,
        max: 16,
        step: 0.5,
        onInput: (value) => setMidiLabelAppearance(`${group.prefix}PaddingX`, Number(value))
      }));
      node.appendChild(makeIconRange({
        label: "Padding Y",
        value: appearanceValue(`${group.prefix}PaddingY`),
        min: 0,
        max: 12,
        step: 0.5,
        onInput: (value) => setMidiLabelAppearance(`${group.prefix}PaddingY`, Number(value))
      }));
      midiLabelAppearanceControls.appendChild(node);
    });
  }

  function iconLayerLabel(layerId) {
    return Appearance.iconLayerLabel(layerId);
  }

  function filteredIconRegistry() {
    const registry = iconRegistry();
    const query = iconAppearanceSearchText.trim().toLowerCase();
    if (!query) return registry;
    return registry.filter((item) => (
      item.id.toLowerCase().includes(query) ||
      item.label.toLowerCase().includes(query)
    ));
  }

  function findIconRegistryItem(iconId) {
    return iconRegistry().find((item) => item.id === iconId) || null;
  }

  function paletteItemForIconId(iconId) {
    return IconHtml.paletteItemForIconId(iconId, palettes);
  }

  function midiItemForIconId(iconId) {
    return IconHtml.midiItemForIconId(iconId, { palettes, restPalette, durationById });
  }

  function iconElementForPreview(iconId) {
    const live = document.querySelector(`[data-icon-id="${CSS.escape(iconId)}"]`);
    if (live) {
      const clone = live.cloneNode(true);
      clone.removeAttribute("id");
      clone.querySelectorAll("select, input").forEach((control) => control.remove());
      return clone;
    }
    const paletteIcon = paletteItemForIconId(iconId);
    if (paletteIcon) {
      const { paletteId, item } = paletteIcon;
      const isSelectControl = item.selectionClassPicker || item.selectionDurationPicker;
      const isColorControl = item.colorPicker;
      const isZoomLabel = item.zoomLabel;
      const button = document.createElement(isZoomLabel ? "strong" : (isSelectControl || isColorControl ? "label" : "button"));
      if (button.tagName === "BUTTON") {
        button.type = "button";
      }
      button.dataset.paletteItem = item.id;
      button.dataset.iconId = iconId;
      button.dataset.defaultTooltip = item.label;
      button.dataset.iconLabelPrefix = "Desplegable";
      button.dataset.iconLabel = `Desplegable · ${effectiveIconTooltip(iconId, item.label)}`;
      button.classList.add(`palette-${paletteId}`, `item-${item.id}`);
      if (isSelectControl) button.classList.add("palette-control", "palette-select-control");
      if (isColorControl) button.classList.add("palette-control", "palette-color-control");
      if (isZoomLabel) button.classList.add("palette-control", "zoom-label");
      if (item.ticks) button.classList.add("palette-note-duration");
      if (item.restDurationId) button.classList.add("palette-rest-duration");
      if (item.clefId) button.classList.add("palette-clef");
      if (item.tuplet) button.classList.add("palette-tuplet");
      if (item.ticks) {
        button.dataset.duration = item.id;
        button.dataset.entryKind = "note";
      }
      if (item.restDurationId) {
        button.dataset.duration = item.restDurationId;
        button.dataset.entryKind = "rest";
      }
      const symbolClass = item.symbolClass || (item.music ? "music-glyph" : "text-glyph");
      if (item.selectionClassPicker) {
        button.innerHTML = '<span class="text-glyph" data-icon-layer="default">Clase</span><select><option>Tipo...</option></select>';
      } else if (item.selectionDurationPicker) {
        button.innerHTML = '<span class="text-glyph" data-icon-layer="default">Figura</span><select><option>Figura...</option></select>';
      } else if (item.colorPicker) {
        button.innerHTML = `<span class="text-glyph" data-icon-layer="default">${escapeHtml(item.symbol || item.label)}</span><input type="color" value="${escapeHtml(selectedItemColor())}">`;
      } else if (item.zoomLabel) {
        button.dataset.iconLayer = "default";
        button.textContent = `${Math.round((state.zoom || 1) * 100)}%`;
      } else {
        button.innerHTML = iconLayerHtml(iconLayersForItem(item, symbolClass), item.dotted);
      }
      applyIconTooltipToElement(button);
      return button;
    }
    const midiIcon = midiItemForIconId(iconId);
    if (midiIcon?.item) {
      const { item, scope } = midiIcon;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.iconId = iconId;
      button.dataset.defaultTooltip = item.label;
      button.dataset.iconLabelPrefix = "Teclado MIDI";
      button.dataset.iconLabel = `Teclado MIDI · ${effectiveIconTooltip(iconId, item.label)}`;
      button.className = "midi-preview-button";
      const symbolClass = item.music ? "music-glyph" : "text-glyph";
      button.innerHTML = iconLayerHtml(iconLayersForItem(item, symbolClass));
      if (scope === "note") button.classList.add("palette-note-duration");
      if (scope === "rest") button.classList.add("palette-rest-duration");
      applyIconTooltipToElement(button);
      return button;
    }
    if (iconId === "midi:chord-toggle") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "midi-chord-toggle";
      button.dataset.iconId = iconId;
      button.dataset.iconLabelPrefix = "Teclado MIDI";
      button.dataset.defaultTooltip = "Modo acorde del teclado MIDI";
      button.innerHTML = '<span data-icon-layer="default">Acorde</span>';
      applyIconTooltipToElement(button);
      return button;
    }
    return null;
  }

  function renderIconPreview(icon) {
    if (!iconAppearancePreview) return;
    iconAppearancePreview.innerHTML = "";
    if (!icon) {
      iconAppearancePreview.textContent = "Selecciona un icono.";
      return;
    }
    const title = document.createElement("div");
    title.className = "icon-preview-title";
    title.textContent = icon.label;
    const stage = document.createElement("div");
    stage.className = "icon-preview-stage";
    let mount = stage;
    if (icon.id.startsWith("main:")) {
      mount = document.createElement("div");
      mount.className = "editor-menu editor-menu--primary icon-preview-real-menu";
      stage.appendChild(mount);
    } else if (icon.id.startsWith("drawer:")) {
      const drawerMenu = document.createElement("div");
      drawerMenu.className = "editor-menu editor-menu--drawer icon-preview-real-menu";
      mount = document.createElement("div");
      mount.className = "segmented duration-icons";
      mount.setAttribute("role", "group");
      drawerMenu.appendChild(mount);
      stage.appendChild(drawerMenu);
    } else if (icon.id.startsWith("midi:")) {
      mount = document.createElement("div");
      mount.className = "midi-figure-strip";
      stage.appendChild(mount);
    } else {
      mount = document.createElement("div");
      mount.className = "segmented duration-icons";
      stage.appendChild(mount);
    }
    const preview = iconElementForPreview(icon.id);
    if (preview) {
      preview.classList.add("icon-preview-subject");
      mount.appendChild(preview);
    } else {
      stage.textContent = icon.id;
    }
    iconAppearancePreview.append(title, stage);
    fitIconGlyphs();
  }

  function updateSelectedIconHighlight() {
    document.querySelectorAll(".is-icon-admin-selected").forEach((node) => {
      node.classList.remove("is-icon-admin-selected");
    });
    if (!selectedIconId) return;
    document.querySelectorAll(`[data-icon-id="${CSS.escape(selectedIconId)}"]`).forEach((node) => {
      if (!node.closest(".appearance-panel")) node.classList.add("is-icon-admin-selected");
    });
  }

  function selectIconForEditing(iconId) {
    const registry = iconRegistry();
    if (!registry.some((item) => item.id === iconId)) return;
    selectedIconId = iconId;
    if (iconAppearanceSearch) {
      const filtered = filteredIconRegistry();
      if (!filtered.some((item) => item.id === iconId)) {
        iconAppearanceSearchText = "";
        iconAppearanceSearch.value = "";
      }
    }
    renderIconAppearancePanel({ force: true });
    updateSelectedIconHighlight();
    iconAppearancePreview?.scrollIntoView({ block: "nearest" });
  }

  function renderIconSelector() {
    if (!iconAppearanceSelect) return;
    const allIcons = iconRegistry();
    const registry = filteredIconRegistry();
    if (!selectedIconId || !allIcons.some((item) => item.id === selectedIconId)) {
      selectedIconId = registry[0]?.id || "";
    }
    if (registry.length && !registry.some((item) => item.id === selectedIconId)) {
      selectedIconId = registry[0].id;
    }
    iconAppearanceSelect.innerHTML = registry.map((item) => (
      `<option value="${escapeHtml(item.id)}"${item.id === selectedIconId ? " selected" : ""}>${escapeHtml(item.label)}</option>`
    )).join("");
  }

  function renderIconAppearanceControls() {
    if (!iconAppearanceControls || !iconAppearanceSelect) return;
    const registry = iconRegistry();
    const icon = registry.find((item) => item.id === selectedIconId) || filteredIconRegistry()[0] || registry[0];
    iconAppearanceControls.innerHTML = "";
    if (!icon) {
      updateIconAppearanceJson();
      renderIconPreview(null);
      return;
    }
    selectedIconId = icon.id;
    iconAppearanceSelect.value = selectedIconId;
    renderIconPreview(icon);
    const config = resolvedIconConfig(icon.id);
    const isDrawerIcon = icon.id.startsWith("drawer:");
    const scaleMax = isDrawerIcon ? 6 : 3.2;
    const moveLimit = isDrawerIcon ? 140 : 48;
    const widthMin = isDrawerIcon ? -80 : -36;
    const widthMax = isDrawerIcon ? 180 : 100;
    const heightMin = isDrawerIcon ? -30 : -24;
    const heightMax = isDrawerIcon ? 120 : 80;

    const buttonGroup = document.createElement("section");
    buttonGroup.className = "appearance-group";
    buttonGroup.innerHTML = "<h3>Botón</h3>";
    buttonGroup.appendChild(makeIconTextControl({
      label: "Tooltip / nombre",
      value: String((iconAppearance[icon.id] || {}).tooltip || ""),
      placeholder: defaultIconTooltip(icon.id, icon.label.replace(/^.*?·\s*/, "")),
      onInput: (value) => setIconTooltip(icon.id, value)
    }));
    buttonGroup.appendChild(makeIconRange({
      label: "Ancho extra",
      value: numericIconSetting(config.extraWidth, 0),
      min: widthMin,
      max: widthMax,
      step: 1,
      onInput: (value) => setIconSetting(icon.id, "extraWidth", value)
    }));
    buttonGroup.appendChild(makeIconRange({
      label: "Alto extra",
      value: numericIconSetting(config.extraHeight, 0),
      min: heightMin,
      max: heightMax,
      step: 1,
      onInput: (value) => setIconSetting(icon.id, "extraHeight", value)
    }));
    iconAppearanceControls.appendChild(buttonGroup);

    if (icon.id.startsWith("drawer:")) {
      const layoutGroup = document.createElement("section");
      layoutGroup.className = "appearance-group";
      layoutGroup.innerHTML = "<h3>Panel desplegable</h3>";
      [
        ["menuDrawerGap", "Espacio entre iconos", 0, 28, 1],
        ["menuDrawerPaddingX", "Padding horizontal", 0, 32, 1],
        ["menuDrawerPaddingY", "Padding vertical", 0, 28, 1],
        ["menuDrawerScale", "Escala del panel", 0.7, 1.5, 0.01]
      ].forEach(([key, label, min, max, step]) => {
        layoutGroup.appendChild(makeIconRange({
          label,
          value: appearanceValue(key),
          min,
          max,
          step,
          onInput: (value) => setAppearanceSettingFromIconPanel(key, value)
        }));
      });
      iconAppearanceControls.appendChild(layoutGroup);
    }

    icon.layers.forEach((layerId) => {
      const layer = resolvedIconLayerConfig(icon.id, layerId);
      const group = document.createElement("section");
      group.className = "appearance-group";
      group.innerHTML = `<h3>Capa ${escapeHtml(iconLayerLabel(layerId))}</h3>`;
      group.appendChild(makeIconRange({
        label: "Tamaño",
        value: numericIconSetting(layer.scale, 1),
        min: 0.05,
        max: scaleMax,
        step: 0.01,
        onInput: (value) => setIconLayerSetting(icon.id, layerId, "scale", value)
      }));
      group.appendChild(makeIconRange({
        label: "Mover X",
        value: numericIconSetting(layer.x, 0),
        min: -moveLimit,
        max: moveLimit,
        step: 0.5,
        onInput: (value) => setIconLayerSetting(icon.id, layerId, "x", value)
      }));
      group.appendChild(makeIconRange({
        label: "Mover Y",
        value: numericIconSetting(layer.y, 0),
        min: -moveLimit,
        max: moveLimit,
        step: 0.5,
        onInput: (value) => setIconLayerSetting(icon.id, layerId, "y", value)
      }));
      iconAppearanceControls.appendChild(group);
    });
    updateIconAppearanceJson();
    updateSelectedIconHighlight();
  }

  function renderIconAppearancePanel(options = {}) {
    if (!iconAppearanceSelect || !iconAppearanceControls) return;
    if (!options.force && !appearanceAdminIsVisible()) return;
    renderIconSelector();
    renderIconAppearanceControls();
    renderMidiLabelAppearancePanel(options);
  }

  function resetIconAppearance() {
    iconAppearance = {};
    saveIconAppearance();
    renderIconAppearancePanel({ force: true });
    fitIconGlyphs();
  }

  async function copyIconAppearance() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(serializedIconAppearance());
  }

  function exportIconAppearance() {
    const blob = new Blob([serializedIconAppearance()], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "apariencia-iconos-cuaderno-estudio.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  window.JMLScoreMidiTools = {
    learnWriteNotes: midiLearnWriteNotes,
    recognizeSelectedChords: recognizeSelectedWrittenChords,
    toggleAutoChordRecognition: toggleMidiAutoChordMode,
    generateNotesFromChordSymbols,
    midiNotesForChordSymbol,
    writeMidiChordAtCursor,
    recognizeMidiChordName
  };

  applyAppearanceFontVariables();
  populateFontSelect(textFontSelect, state.textStyle.font || appearanceFont("canvasTextFont", "Ink Free"));
  let appearanceAdminMode = setupAppearanceAdminMode();

  selectToolButton?.addEventListener("click", activateSelectTool);
  keySignatureButton?.addEventListener("click", requestKeySignature);
  dynamicsButton?.addEventListener("click", activateDynamicsTool);
  noteModeButton.addEventListener("click", () => setMode("note"));
  restModeButton.addEventListener("click", () => setMode("rest"));
  undoButton.addEventListener("click", undo);
  redoButton?.addEventListener("click", redo);
  shiftModeButton?.addEventListener("click", toggleDisplacementMode);
  editModeButton?.addEventListener("click", toggleEditMode);
  playbackButton?.addEventListener("click", () => toggleMidiPlayback());
  reflowButton?.addEventListener("click", reflowScoreLayout);
  textModeButton?.addEventListener("click", toggleTextMode);
  chordModeButton?.addEventListener("click", toggleChordMode);
  textFontSelect?.addEventListener("change", () => applyTextStyleUpdate("font", textFontSelect.value));
  textSizeInput?.addEventListener("input", () => applyTextStyleUpdate("size", textSizeInput.value));
  textColorInput?.addEventListener("input", () => applyTextStyleUpdate("color", textColorInput.value));
  textEnclosureSelect?.addEventListener("change", () => applyTextStyleUpdate("enclosure", textEnclosureSelect.value));
  textAlignSelect?.addEventListener("change", () => applyTextStyleUpdate("align", textAlignSelect.value));
  gridDurationSelect?.addEventListener("change", () => setGridDuration(gridDurationSelect.value));
  playbackBpmInput?.addEventListener("change", () => setPlaybackBpm(playbackBpmInput.value));
  playbackBpmInput?.addEventListener("blur", () => setPlaybackBpm(playbackBpmInput.value));
  midiChordButton?.addEventListener("click", toggleMidiChordMode);
  svg?.addEventListener("contextmenu", showCanvasContextMenu);
  setupTouchSupport();
  setupInstantTooltips();
  itemColorInput?.addEventListener("input", () => applySelectedItemColor(itemColorInput.value));
  addMeasureButton?.addEventListener("click", insertMeasureAfterSelection);
  removeMeasureButton?.addEventListener("click", removeSelectedMeasure);
  hideMeasureButton?.addEventListener("click", toggleSelectedMeasureHidden);
  zoomOutButton?.addEventListener("click", () => zoomBy(-0.1));
  zoomInButton?.addEventListener("click", () => zoomBy(0.1));
  fullscreenButton?.addEventListener("click", toggleEditorFullscreen);
  document.addEventListener("fullscreenchange", () => {
    fullscreenButton?.classList.toggle("is-active", !!document.fullscreenElement);
  });
  clearButton.addEventListener("click", clearScore);
  resetAppearanceButton?.addEventListener("click", resetAppearance);
  copyAppearanceButton?.addEventListener("click", copyAppearance);
  exportAppearanceButton?.addEventListener("click", exportAppearance);
  importAppearanceInput?.addEventListener("change", (event) => importAppearance(event.target.files?.[0]));
  iconAppearanceSelect?.addEventListener("change", () => {
    selectedIconId = iconAppearanceSelect.value;
    renderIconAppearanceControls();
  });
  iconAppearanceSearch?.addEventListener("input", () => {
    iconAppearanceSearchText = iconAppearanceSearch.value;
    renderIconAppearancePanel({ force: true });
  });
  document.addEventListener("click", (event) => {
    if (!appearanceAdminMode) return;
    const iconTarget = event.target.closest?.("[data-icon-id]");
    if (!iconTarget || iconTarget.closest(".appearance-panel")) return;
    if (!document.querySelector(".editor-workbench")?.contains(iconTarget) && !midiKeyboardPanel?.contains(iconTarget)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    selectIconForEditing(iconTarget.dataset.iconId);
    if (iconTarget.classList.contains("palette-trigger")) {
      openPalette(iconTarget);
    }
  }, true);
  resetIconAppearanceButton?.addEventListener("click", resetIconAppearance);
  copyIconAppearanceButton?.addEventListener("click", copyIconAppearance);
  exportIconAppearanceButton?.addEventListener("click", exportIconAppearance);
  exerciseSelect?.addEventListener("change", updateExerciseFormFromSelection);
  loadExerciseButton?.addEventListener("click", loadSelectedExercise);
  saveExerciseButton?.addEventListener("click", saveCurrentExerciseToLibrary);
  exportExerciseButton?.addEventListener("click", () => downloadExerciseDocument(currentExerciseDocument()));
  captureSceneButton?.addEventListener("click", captureSceneSnapshot);
  saveSceneButton?.addEventListener("click", captureSceneSnapshot);
  loadSceneButton?.addEventListener("click", restoreSelectedScene);
  prevSceneButton?.addEventListener("click", () => navigateScene(-1));
  nextSceneButton?.addEventListener("click", () => navigateScene(1));
  overwriteSceneButton?.addEventListener("click", overwriteSelectedScene);
  moveSceneUpButton?.addEventListener("click", () => moveSelectedScene(-1));
  moveSceneDownButton?.addEventListener("click", () => moveSelectedScene(1));
  deleteSceneButton?.addEventListener("click", deleteSelectedScene);
  sceneSelect?.addEventListener("change", restoreSelectedScene);
  reviewModeButton?.addEventListener("click", () => setSceneNavigationMode("review"));
  exerciseModeButton?.addEventListener("click", () => setSceneNavigationMode("exercise"));
  openManualButton?.addEventListener("click", openManualReader);
  closeManualButton?.addEventListener("click", closeManualReader);
  manualSearchInput?.addEventListener("input", () => {
    if (manualSearchTimer) clearTimeout(manualSearchTimer);
    manualSearchTimer = setTimeout(() => {
      manualSearchTimer = null;
      renderManualContent(manualSearchInput.value);
    }, 120);
  });
  const scheduleExerciseMetadataAutosave = () => {
    canvasAutosaveDirty = true;
    scheduleCanvasAutosave();
  };
  exerciseTitleInput?.addEventListener("input", scheduleExerciseMetadataAutosave);
  exerciseDescriptionInput?.addEventListener("input", scheduleExerciseMetadataAutosave);
  manualOverlay?.addEventListener("click", (event) => {
    if (event.target === manualOverlay) closeManualReader();
  });
  exerciseAppMenus.forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      exerciseAppMenus.forEach((otherMenu) => {
        if (otherMenu !== menu) otherMenu.open = false;
      });
    });
  });
  importExerciseInput?.addEventListener("change", (event) => {
    importExerciseFile(event.target.files?.[0]);
    event.target.value = "";
  });
  deleteExerciseButton?.addEventListener("click", deleteSelectedLocalExercise);
  exportMusicXmlButton?.addEventListener("click", exportMusicXml);
  musicXmlButton?.addEventListener("click", exportMusicXml);
  paletteTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openPalette(trigger));
  });
  document.addEventListener("click", (event) => {
    if (event.target?.closest?.(".exercise-library, .editor-application-menubar")) return;
    closeExerciseAppMenus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && manualOverlay && !manualOverlay.hidden) {
      event.preventDefault();
      closeManualReader();
    }
  });
  if (document.fonts) {
    document.fonts.ready.then(() => {
      fitIconGlyphs();
    });
  }
  window.addEventListener("resize", () => {
    scheduleIconFit();
    scheduleResponsiveRender();
  });
  svg.addEventListener("click", handleScoreClick, true);
  svg.addEventListener("dblclick", handleScoreDoubleClick, true);
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey && event.code === "KeyA") {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleAppearanceAdminMode();
    }
  });
  document.addEventListener("keydown", updateShiftDragCursor);
  document.addEventListener("keyup", updateShiftDragCursor);
  window.addEventListener("blur", clearShiftDragCursor);
  window.addEventListener("beforeunload", saveCanvasAutosaveNow);
  document.addEventListener("keydown", handleKeydown);

  document.documentElement.dataset.jmlEditorBoot = "listeners-ready";
  ensurePrimaryIconMetadata();
  document.documentElement.dataset.jmlEditorBoot = "metadata-ready";
  renderPalette("figures");
  document.documentElement.dataset.jmlEditorBoot = "palette-ready";
  renderMidiFigureStrip();
  renderMidiKeyboard();
  ApplicationMenu.setup({ closePaletteDrawer });
  initializeDefaultMidiInput();
  document.documentElement.dataset.jmlEditorBoot = "midi-ready";
  if (appearanceAdminMode) {
    renderAppearanceControls({ force: true });
    renderIconAppearancePanel({ force: true });
    renderMidiLabelAppearancePanel({ force: true });
  }
  document.documentElement.dataset.jmlEditorBoot = "admin-ready";
  if (!restoreCanvasAutosaveIfPresent()) render();
  document.documentElement.dataset.jmlEditorBoot = "render-ready";
  loadBundledExercises();
  scheduleIconFit();
  document.documentElement.dataset.jmlEditorBoot = "complete";
})();
