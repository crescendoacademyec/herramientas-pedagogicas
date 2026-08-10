(function () {
  const REST_OPTICAL_KEYS = Object.freeze({
    breve: "restOpticalWhole",
    quarter: "restOpticalQuarter",
    eighth: "restOpticalEighth",
    sixteenth: "restOpticalSixteenth",
    "thirty-second": "restOpticalSixteenth",
    "sixty-fourth": "restOpticalSixteenth",
    "one-twenty-eighth": "restOpticalSixteenth",
    half: "restOpticalHalf",
    whole: "restOpticalWhole"
  });

  function smuflLineWidth(defaults, smuflSpace, appearanceValue, defaultKey, scaleKey) {
    return defaults[defaultKey] * smuflSpace * appearanceValue(scaleKey);
  }

  function staffLineWidth(options) {
    return smuflLineWidth(options.defaults, options.smuflSpace, options.appearanceValue, "staffLineThickness", "staffLineWidthScale");
  }

  function barLineWidth(options) {
    return smuflLineWidth(options.defaults, options.smuflSpace, options.appearanceValue, "thinBarlineThickness", "barLineWidthScale");
  }

  function ledgerLineWidth(options) {
    return smuflLineWidth(options.defaults, options.smuflSpace, options.appearanceValue, "legerLineThickness", "ledgerLineWidthScale");
  }

  function beamThickness(options) {
    return options.defaults.beamThickness * options.smuflSpace * options.appearanceValue("beamWidthScale");
  }

  function beamLevelDistance(options) {
    return (
      (options.defaults.beamThickness * options.appearanceValue("beamWidthScale")) +
      (options.defaults.beamSpacing * options.appearanceValue("beamSpacingScale"))
    ) * options.smuflSpace;
  }

  function musicGlyphSize(options, scaleKey = "glyphScale") {
    return options.musicFontSize * options.appearanceValue("glyphScale") * options.appearanceValue(scaleKey);
  }

  function accidentalNoteGap(appearanceValue) {
    return appearanceValue("accidentalNoteGap");
  }

  function accidentalYOffset(appearanceValue) {
    return appearanceValue("accidentalYOffset") + appearanceValue("accidentalOffsetY");
  }

  function restOpticalOffset(durationId, appearanceValue) {
    return appearanceValue(REST_OPTICAL_KEYS[durationId] || "restOpticalQuarter");
  }

  function tickSpacingForMaxFlags(maxFlags, appearanceValue) {
    if (maxFlags > 1) return appearanceValue("sixteenthTickSpacing");
    if (maxFlags > 0) return appearanceValue("eighthTickSpacing");
    return appearanceValue("minTickSpacing");
  }

  function dotXOffset(noteHeadRx, appearanceValue) {
    return noteHeadRx + appearanceValue("dotGap") + appearanceValue("dotOffsetX");
  }

  function restVisualWidth(durationId, restVisualWidths, appearanceValue) {
    return (restVisualWidths[durationId] || 16) * appearanceValue("restScale");
  }

  function staffLeft(staffLeftBase, appearanceValue) {
    return staffLeftBase + appearanceValue("scoreOffsetX") + appearanceValue("staffLeftOffset");
  }

  window.JMLScoreEngraving = Object.freeze({
    accidentalNoteGap,
    accidentalYOffset,
    barLineWidth,
    beamLevelDistance,
    beamThickness,
    dotXOffset,
    ledgerLineWidth,
    musicGlyphSize,
    restOpticalOffset,
    restVisualWidth,
    smuflLineWidth,
    staffLeft,
    staffLineWidth,
    tickSpacingForMaxFlags
  });
})();
