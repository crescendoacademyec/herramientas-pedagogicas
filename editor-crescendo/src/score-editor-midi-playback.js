(function () {
  const EPSILON = 0.0001;

  function tempoUnitTicks(unitDurationId = "quarter", dots = 0, durationById = () => null, fallbackTicks = 4) {
    const baseTicks = durationById(unitDurationId)?.ticks || durationById("quarter")?.ticks || fallbackTicks;
    let multiplier = 1;
    let addition = 0.5;
    for (let index = 0; index < Math.max(0, Number(dots) || 0); index += 1) {
      multiplier += addition;
      addition *= 0.5;
    }
    return baseTicks * multiplier;
  }

  function tempoMarkBpm(mark) {
    const match = String(mark?.value || "").replace(",", ".").match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;
    const bpm = Number(match[1]);
    return Number.isFinite(bpm) && bpm > 0 ? bpm : null;
  }

  function tempoEventsFromMarks(options = {}) {
    const {
      marks = [],
      absoluteTickForMark = () => 0,
      durationById = () => null,
      defaultBpm = 82,
      defaultUnitDurationId = "quarter"
    } = options;
    const events = marks
      .filter((mark) => mark?.type === "tempo")
      .map((mark) => {
        const bpm = tempoMarkBpm(mark);
        if (!bpm) return null;
        return {
          absoluteTick: absoluteTickForMark(mark),
          bpm,
          unitTicks: tempoUnitTicks(mark.unitDurationId || defaultUnitDurationId, mark.dots || 0, durationById)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.absoluteTick - b.absoluteTick);
    if (!events.length || events[0].absoluteTick > EPSILON) {
      events.unshift({
        absoluteTick: 0,
        bpm: defaultBpm,
        unitTicks: tempoUnitTicks(defaultUnitDurationId, 0, durationById)
      });
    }
    return events;
  }

  function msForTick(absoluteTick, tempoEvents = [], epsilon = EPSILON) {
    const targetTick = Math.max(0, Number(absoluteTick) || 0);
    let elapsedMs = 0;
    for (let index = 0; index < tempoEvents.length; index += 1) {
      const current = tempoEvents[index];
      const next = tempoEvents[index + 1];
      const segmentStart = Math.max(0, Number(current.absoluteTick) || 0);
      const segmentEnd = next ? Math.max(segmentStart, Number(next.absoluteTick) || segmentStart) : targetTick;
      if (targetTick <= segmentStart + epsilon) return elapsedMs;
      const clampedEnd = Math.min(targetTick, segmentEnd);
      const tickCount = Math.max(0, clampedEnd - segmentStart);
      const tickMs = 60000 / (Math.max(1, current.bpm) * Math.max(epsilon, current.unitTicks));
      elapsedMs += tickCount * tickMs;
      if (targetTick <= segmentEnd + epsilon) return elapsedMs;
    }
    return elapsedMs;
  }

  function tickForMs(elapsedMs, tempoEvents = [], epsilon = EPSILON) {
    const targetMs = Math.max(0, Number(elapsedMs) || 0);
    let consumedMs = 0;
    for (let index = 0; index < tempoEvents.length; index += 1) {
      const current = tempoEvents[index];
      const next = tempoEvents[index + 1];
      const segmentStart = Math.max(0, Number(current.absoluteTick) || 0);
      const segmentEnd = next ? Math.max(segmentStart, Number(next.absoluteTick) || segmentStart) : Infinity;
      const tickMs = 60000 / (Math.max(1, current.bpm) * Math.max(epsilon, current.unitTicks));
      const segmentTicks = Math.max(0, segmentEnd - segmentStart);
      const segmentMs = Number.isFinite(segmentTicks) ? segmentTicks * tickMs : Infinity;
      if (targetMs <= consumedMs + segmentMs + epsilon) {
        return segmentStart + Math.max(0, targetMs - consumedMs) / tickMs;
      }
      consumedMs += segmentMs;
    }
    return 0;
  }

  function noteEventsForEntries(options = {}) {
    const {
      entries = [],
      tempoEvents = [],
      entryVoice = () => 1,
      entryBaseTicks = () => 1,
      entryStaffSteps = () => [],
      nearestEntryStaffStep = (_entry, staffStep) => staffStep,
      entryStaffStep = (entry) => entry?.staffStep ?? 0,
      midiNotesForEntry = () => [],
      epsilon = EPSILON
    } = options;
    const events = [];
    const tiedEvents = new Map();
    entries.forEach(({ measureIndex, entryIndex, systemIndex, entry, absoluteTick }) => {
      const voice = entryVoice(entry);
      if (entry?.type !== "note") {
        [...tiedEvents.keys()]
          .filter((key) => key.startsWith(`${voice}:`))
          .forEach((key) => tiedEvents.delete(key));
        return;
      }
      const startTick = absoluteTick;
      const entryTicks = Math.max(epsilon, Number(entry.ticks) || entryBaseTicks(entry) || 1);
      const endTick = startTick + entryTicks;
      const startMs = msForTick(startTick, tempoEvents, epsilon);
      const endMs = Math.max(startMs + 20, msForTick(endTick, tempoEvents, epsilon));
      const tiedStep = Number.isFinite(entry.tieStaffStep)
        ? nearestEntryStaffStep(entry, entry.tieStaffStep)
        : entryStaffStep(entry);
      const seenMidiInEntry = new Set();
      const continuedKeys = new Set();
      entryStaffSteps(entry).forEach((staffStep) => {
        const midi = Math.max(0, Math.min(127, Math.round(midiNotesForEntry(entry, measureIndex, [staffStep])?.[0])));
        if (!Number.isFinite(midi) || seenMidiInEntry.has(midi)) return;
        seenMidiInEntry.add(midi);
        const key = `${voice}:${midi}`;
        const carried = tiedEvents.get(key);
        const shouldCarryForward = entry.tieToNext === true && Math.abs(staffStep - tiedStep) < epsilon;
        if (carried) {
          carried.endMs = Math.max(carried.endMs, endMs);
          carried.endTick = Math.max(carried.endTick || endTick, endTick);
          carried.tieToNext = shouldCarryForward;
          continuedKeys.add(key);
          if (shouldCarryForward) tiedEvents.set(key, carried);
          else tiedEvents.delete(key);
          return;
        }
        const event = {
          midi,
          startMs,
          endMs,
          startTick,
          endTick,
          entryTicks,
          durationId: entry.durationId || null,
          dots: Number(entry.dots) || (entry.dotted ? 1 : 0),
          dotted: entry.dotted === true,
          tuplet: entry.tuplet || null,
          tieToNext: shouldCarryForward,
          measureIndex,
          entryIndex,
          systemIndex,
          voice,
          entryId: entry.id || null
        };
        events.push(event);
        if (shouldCarryForward) tiedEvents.set(key, event);
      });
      [...tiedEvents.keys()]
        .filter((key) => key.startsWith(`${voice}:`) && !continuedKeys.has(key))
        .forEach((key) => {
          const midi = Number(key.split(":")[1]);
          if (!seenMidiInEntry.has(midi)) tiedEvents.delete(key);
        });
    });
    return events.sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
  }

  window.JMLScoreMidiPlayback = Object.freeze({
    msForTick,
    noteEventsForEntries,
    tempoEventsFromMarks,
    tempoMarkBpm,
    tempoUnitTicks,
    tickForMs
  });
})();
