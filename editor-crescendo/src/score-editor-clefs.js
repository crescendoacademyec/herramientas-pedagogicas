(function () {
  const DEFAULT_CLEF_ID = "clef-g";
  const CLEF_PROFILES = Object.freeze({
    "clef-g": { id: "clef-g", glyphName: "gClef", c4Step: -6 },
    "clef-c": { id: "clef-c", glyphName: "cClef", c4Step: 0 },
    "clef-f": { id: "clef-f", glyphName: "fClef", c4Step: 6 },
    "clef-g-8va": { id: "clef-g-8va", glyphName: "gClef", octaveText: "8", octavePosition: "above", c4Step: -13 },
    "clef-g-8vb": { id: "clef-g-8vb", glyphName: "gClef", octaveText: "8", octavePosition: "below", c4Step: 1 },
    "clef-f-8va": { id: "clef-f-8va", glyphName: "fClef", octaveText: "8", octavePosition: "above", c4Step: -1 },
    "clef-f-8vb": { id: "clef-f-8vb", glyphName: "fClef", octaveText: "8", octavePosition: "below", c4Step: 13 },
    "clef-percussion": { id: "clef-percussion", glyphName: "unpitchedPercussionClef1", c4Step: -6, percussion: true }
  });

  const PITCH_MAP = Object.freeze({
    C: { staffStep: 1, diatonicStep: 7, name: "C5" },
    D: { staffStep: 2, diatonicStep: 8, name: "D5" },
    E: { staffStep: 3, diatonicStep: 9, name: "E5" },
    F: { staffStep: 4, diatonicStep: 10, name: "F5" },
    G: { staffStep: -2, diatonicStep: 4, name: "G4" },
    A: { staffStep: -1, diatonicStep: 5, name: "A4" },
    B: { staffStep: 0, diatonicStep: 6, name: "B4" }
  });

  function clefProfile(clefId = DEFAULT_CLEF_ID) {
    return CLEF_PROFILES[clefId] || CLEF_PROFILES[DEFAULT_CLEF_ID];
  }

  function staffStepForDiatonicStep(diatonicStep, clefId = DEFAULT_CLEF_ID) {
    return Number(diatonicStep) + clefProfile(clefId).c4Step;
  }

  function diatonicStepForStaffStep(staffStep, clefId = DEFAULT_CLEF_ID) {
    return Number(staffStep) - clefProfile(clefId).c4Step;
  }

  window.JMLScoreClefs = Object.freeze({
    CLEF_PROFILES,
    DEFAULT_CLEF_ID,
    PITCH_MAP,
    clefProfile,
    diatonicStepForStaffStep,
    staffStepForDiatonicStep
  });
})();
