(function (global) {
  const WHOLE_NOTE_TICKS = 16;
  const DEFAULT_METER = Object.freeze({ top: "4", bottom: "4", label: "4/4", kind: "simple" });
  const DEFAULT_MEASURE_TICKS = 16;
  const DEFAULT_PULSE_TICKS = 4;
  const EPSILON = 0.0001;

  function denominatorTicks(denominator) {
    const value = Number(denominator);
    return Number.isFinite(value) && value > 0 ? WHOLE_NOTE_TICKS / value : 4;
  }

  function normalize(meter = DEFAULT_METER) {
    const top = String(meter.top || "4");
    const bottom = String(meter.bottom || "4");
    const denominator = Number(bottom);
    const unitTicks = denominatorTicks(denominator);
    const additiveParts = top.includes("+")
      ? top.split("+").map((part) => Number(part)).filter((part) => Number.isFinite(part) && part > 0)
      : [];
    const numerator = Number(top);
    if (additiveParts.length) {
      return {
        ...meter,
        top,
        bottom,
        denominator,
        unitTicks,
        kind: "additive",
        pulseGroups: additiveParts,
        measureTicks: additiveParts.reduce((sum, part) => sum + part, 0) * unitTicks,
        defaultGridTicks: unitTicks
      };
    }
    const compound = [6, 9, 12].includes(numerator);
    const pulseGroups = compound
      ? Array.from({ length: numerator / 3 }, () => 3)
      : Array.from({ length: Number.isFinite(numerator) && numerator > 0 ? numerator : 4 }, () => 1);
    return {
      ...meter,
      top,
      bottom,
      denominator,
      unitTicks,
      kind: compound ? "compound" : "simple",
      pulseGroups,
      measureTicks: pulseGroups.reduce((sum, part) => sum + part, 0) * unitTicks,
      defaultGridTicks: unitTicks
    };
  }

  function measureTicks(profile) {
    const ticks = normalize(profile).measureTicks;
    return Number.isFinite(ticks) && ticks > 0 ? ticks : DEFAULT_MEASURE_TICKS;
  }

  function pulseTicks(profile) {
    const normalized = normalize(profile);
    const firstGroup = normalized.pulseGroups?.[0] || 1;
    const ticks = firstGroup * normalized.unitTicks;
    return Number.isFinite(ticks) && ticks > 0 ? ticks : DEFAULT_PULSE_TICKS;
  }

  function subdivisionTicks(profile) {
    const normalized = normalize(profile);
    if (normalized.kind === "compound" || normalized.kind === "additive") return normalized.unitTicks;
    return Math.max(0.25, normalized.unitTicks / 2);
  }

  function pulseBoundaries(profile) {
    const normalized = normalize(profile);
    const boundaries = [0];
    let cursor = 0;
    normalized.pulseGroups.forEach((group) => {
      cursor += group * normalized.unitTicks;
      boundaries.push(cursor);
    });
    return boundaries;
  }

  function positiveModulo(value, size) {
    return ((value % size) + size) % size;
  }

  function measureTickAt(absoluteTick, profile) {
    const normalized = normalize(profile);
    const size = normalized.measureTicks || DEFAULT_MEASURE_TICKS;
    return positiveModulo(absoluteTick, size);
  }

  function pulseStartOffsets(profile) {
    return pulseBoundaries(profile).slice(0, -1);
  }

  function pulseIndexForTick(tick, profile) {
    const normalized = normalize(profile);
    const boundaries = pulseBoundaries(normalized);
    const measureTick = Math.max(0, Math.min(normalized.measureTicks, tick));
    for (let index = 0; index < boundaries.length - 1; index += 1) {
      if (measureTick >= boundaries[index] - EPSILON && measureTick < boundaries[index + 1] - EPSILON) return index;
    }
    return Math.max(0, boundaries.length - 2);
  }

  function pulseRangeForTick(tick, profile) {
    const normalized = normalize(profile);
    const boundaries = pulseBoundaries(normalized);
    const index = pulseIndexForTick(tick, normalized);
    return {
      index,
      start: boundaries[index] ?? 0,
      end: boundaries[index + 1] ?? normalized.measureTicks
    };
  }

  function tickMatchesAnyOffset(tick, offsets) {
    return offsets.some((offset) => Math.abs(tick - offset) < EPSILON);
  }

  function isPulseBoundaryTick(absoluteTick, profile) {
    const normalized = normalize(profile);
    const measureTick = measureTickAt(absoluteTick, normalized);
    return tickMatchesAnyOffset(measureTick, pulseBoundaries(normalized));
  }

  function pulseSpanBeforeBoundary(absoluteTick, profile) {
    const normalized = normalize(profile);
    const boundaries = pulseBoundaries(normalized);
    const measureTick = measureTickAt(absoluteTick, normalized);
    const boundaryIndex = boundaries.findIndex((boundary) => Math.abs(measureTick - boundary) < EPSILON);
    if (boundaryIndex > 0) return boundaries[boundaryIndex] - boundaries[boundaryIndex - 1];
    const last = boundaries.at(-1) ?? normalized.measureTicks;
    const previous = boundaries.at(-2) ?? 0;
    return last - previous;
  }

  function strongBeatOffsets(profile) {
    const normalized = normalize(profile);
    const pulseStarts = pulseBoundaries(normalized).slice(0, -1);
    if (normalized.kind === "additive") return pulseStarts;
    const label = normalized.label || `${normalized.top}/${normalized.bottom}`;
    if (label === "2/2" || label === "4/4") return [0, denominatorTicks(4) * 2];
    if (label === "12/8") return [0, normalized.unitTicks * 6];
    return [0];
  }

  function boundaryCandidates(startTick, endTick, profile) {
    const normalized = normalize(profile);
    const candidates = new Set();
    const addSeries = (step, offset = 0) => {
      if (!Number.isFinite(step) || step <= EPSILON) return;
      let tick = Math.floor((startTick - offset) / step) * step + offset;
      while (tick <= startTick + EPSILON) tick += step;
      while (tick < endTick - EPSILON) {
        candidates.add(Number(tick.toFixed(6)));
        tick += step;
      }
    };
    addSeries(normalized.measureTicks);
    pulseBoundaries(normalized).forEach((offset) => addSeries(normalized.measureTicks, offset));
    strongBeatOffsets(normalized).forEach((offset) => addSeries(normalized.measureTicks, offset));
    return [...candidates].sort((a, b) => a - b);
  }

  global.JMLScoreMeter = Object.freeze({
    DEFAULT_METER,
    DEFAULT_MEASURE_TICKS,
    DEFAULT_PULSE_TICKS,
    denominatorTicks,
    normalize,
    measureTicks,
    pulseTicks,
    subdivisionTicks,
    pulseBoundaries,
    positiveModulo,
    measureTickAt,
    pulseStartOffsets,
    pulseIndexForTick,
    pulseRangeForTick,
    tickMatchesAnyOffset,
    isPulseBoundaryTick,
    pulseSpanBeforeBoundary,
    strongBeatOffsets,
    boundaryCandidates
  });
})(window);
