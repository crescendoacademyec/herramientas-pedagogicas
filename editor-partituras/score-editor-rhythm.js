(function () {
  const Meter = window.JMLScoreMeter;
  if (!Meter) throw new Error("No se cargó score-editor-meter.js");
  const EPSILON = 0.0001;

  function isMeasureBoundaryTick(absoluteTick, profile) {
    return Math.abs(Meter.measureTickAt(absoluteTick, profile)) < EPSILON;
  }

  function isStrongBeatBoundaryTick(absoluteTick, profile) {
    const measureTick = Meter.measureTickAt(absoluteTick, profile);
    return Meter.tickMatchesAnyOffset(measureTick, Meter.strongBeatOffsets(profile));
  }

  function startsOnBeat(absoluteTick, profile) {
    return Meter.isPulseBoundaryTick(absoluteTick, profile);
  }

  function startsOnDivision(absoluteTick, profile) {
    const division = Meter.subdivisionTicks(profile);
    return Math.abs(absoluteTick / division - Math.round(absoluteTick / division)) < EPSILON;
  }

  function usesSubdivisionSpelling(startTick, endTick, profile) {
    const durationTicks = endTick - startTick;
    return durationTicks <= 1 + EPSILON || !startsOnDivision(startTick, profile);
  }

  function shouldSplitAtRhythmicBoundary(startTick, endTick, boundaryTick, profile) {
    if (boundaryTick <= startTick + EPSILON || boundaryTick >= endTick - EPSILON) return false;
    if (isMeasureBoundaryTick(boundaryTick, profile)) return true;
    if (usesSubdivisionSpelling(startTick, endTick, profile)) return true;
    if (!isStrongBeatBoundaryTick(boundaryTick, profile)) return false;
    return startTick >= boundaryTick - Meter.pulseSpanBeforeBoundary(boundaryTick, profile) - EPSILON &&
      startTick < boundaryTick - EPSILON;
  }

  function rhythmicSplitBoundaries(startTick, endTick, profile) {
    return Meter.boundaryCandidates(startTick, endTick, profile)
      .filter((boundaryTick) => shouldSplitAtRhythmicBoundary(startTick, endTick, boundaryTick, profile));
  }

  window.JMLScoreRhythm = Object.freeze({
    isMeasureBoundaryTick,
    isStrongBeatBoundaryTick,
    startsOnBeat,
    startsOnDivision,
    usesSubdivisionSpelling,
    shouldSplitAtRhythmicBoundary,
    rhythmicSplitBoundaries
  });
})();
