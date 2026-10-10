(function (global) {
  const DEFAULT_DIVISIONS = 32;
  const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
  const DOCTYPE = '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">';
  const VOICES_PER_STAFF_BLOCK = 16;

  const STEP_NAMES = Object.freeze(["C", "D", "E", "F", "G", "A", "B"]);
  const TYPE_BY_DURATION_ID = Object.freeze({
    breve: "breve",
    whole: "whole",
    half: "half",
    quarter: "quarter",
    eighth: "eighth",
    sixteenth: "16th",
    "thirty-second": "32nd",
    "sixty-fourth": "64th",
    "one-twenty-eighth": "128th"
  });

  function escapeXml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function line(level, value) {
    return `${"  ".repeat(level)}${value}`;
  }

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function xmlDuration(ticks, divisions = DEFAULT_DIVISIONS) {
    return Math.max(1, Math.round(finiteNumber(ticks, 0) * finiteNumber(divisions, DEFAULT_DIVISIONS) / 4));
  }

  function keyFifths(signature) {
    const count = Math.max(0, Math.min(7, Number(signature?.count) || 0));
    if (signature?.accidental === "sharp") return count;
    if (signature?.accidental === "flat") return -count;
    return 0;
  }

  function clefXml(clefId, number, level = 4) {
    const id = String(clefId || "clef-g");
    const clefs = {
      "clef-g": { sign: "G", line: 2 },
      "clef-c": { sign: "C", line: 3 },
      "clef-f": { sign: "F", line: 4 },
      "clef-g-8va": { sign: "G", line: 2, octave: 1 },
      "clef-g-8vb": { sign: "G", line: 2, octave: -1 },
      "clef-f-8va": { sign: "F", line: 4, octave: 1 },
      "clef-f-8vb": { sign: "F", line: 4, octave: -1 },
      "clef-percussion": { sign: "percussion", line: 2 }
    };
    const clef = clefs[id] || clefs["clef-g"];
    const attrs = number ? ` number="${number}"` : "";
    const rows = [line(level, `<clef${attrs}>`)];
    rows.push(line(level + 1, `<sign>${clef.sign}</sign>`));
    if (clef.line) rows.push(line(level + 1, `<line>${clef.line}</line>`));
    if (Number.isFinite(clef.octave)) rows.push(line(level + 1, `<clef-octave-change>${clef.octave}</clef-octave-change>`));
    rows.push(line(level, "</clef>"));
    return rows;
  }

  function staffCount(model) {
    return Math.max(1, Array.isArray(model?.staves) ? model.staves.length : 0);
  }

  function normalizedClefList(measure, model) {
    const count = staffCount(model);
    const byStaff = new Map();
    Array.from({ length: count }, (_, index) => index + 1).forEach((number) => {
      const staff = Array.isArray(model?.staves) ? model.staves[number - 1] : null;
      byStaff.set(number, {
        staff: number,
        clefId: staff?.clefId || (staff?.percussion ? "clef-percussion" : "clef-g")
      });
    });
    (Array.isArray(measure?.clefs) ? measure.clefs : []).forEach((clef, index) => {
      const number = Math.max(1, Math.round(Number(clef?.staff) || index + 1));
      byStaff.set(number, {
        staff: number,
        clefId: clef?.clefId || byStaff.get(number)?.clefId || "clef-g"
      });
    });
    return [...byStaff.values()].sort((a, b) => a.staff - b.staff);
  }

  function clefListKey(clefs) {
    return (Array.isArray(clefs) ? clefs : [])
      .map((clef) => `${Math.max(1, Math.round(Number(clef.staff) || 1))}:${clef.clefId || "clef-g"}`)
      .join("|");
  }

  function meterKey(meter = {}) {
    return `${String(meter.top || "4")}/${String(meter.bottom || "4")}`;
  }

  function measureAttributeSnapshot(measure, model) {
    const clefs = normalizedClefList(measure, model);
    return {
      divisions: finiteNumber(model.divisions, DEFAULT_DIVISIONS),
      keyFifths: keyFifths(measure.keySignature),
      meter: measure.meter || {},
      meterKey: meterKey(measure.meter),
      staves: staffCount(model),
      clefs,
      clefKey: clefListKey(clefs)
    };
  }

  function createAttributeExportState() {
    return {
      divisions: null,
      keyFifths: null,
      meterKey: null,
      staves: null,
      clefs: [],
      clefKey: ""
    };
  }

  function measureAttributeOptions(measure, model, state) {
    const current = measureAttributeSnapshot(measure, model);
    const stavesChanged = state.staves !== current.staves;
    return {
      includeDivisions: state.divisions !== current.divisions,
      includeKey: state.keyFifths !== current.keyFifths,
      includeTime: state.meterKey !== current.meterKey,
      includeStaves: stavesChanged,
      includeClefs: stavesChanged || state.clefKey !== current.clefKey,
      current
    };
  }

  function updateAttributeExportState(state, snapshot) {
    state.divisions = snapshot.divisions;
    state.keyFifths = snapshot.keyFifths;
    state.meterKey = snapshot.meterKey;
    state.staves = snapshot.staves;
    state.clefs = snapshot.clefs.map((clef) => ({ ...clef }));
    state.clefKey = snapshot.clefKey;
  }

  function applyMeasureAttributeChangesToState(state, measure, model) {
    const clefs = (state.clefs.length ? state.clefs : normalizedClefList(measure, model)).map((clef) => ({ ...clef }));
    (Array.isArray(measure?.attributeChanges) ? measure.attributeChanges : []).forEach((change) => {
      if (change?.type !== "clef") return;
      const staff = Math.max(1, Math.round(Number(change.staff) || 1));
      const index = clefs.findIndex((clef) => clef.staff === staff);
      const nextClef = {
        staff,
        clefId: change.clefId || clefs[index]?.clefId || "clef-g"
      };
      if (index >= 0) clefs[index] = nextClef;
      else clefs.push(nextClef);
    });
    clefs.sort((a, b) => a.staff - b.staff);
    state.clefs = clefs;
    state.clefKey = clefListKey(clefs);
  }

  function measureAttributesXml(measure, model, options = {}, level = 3) {
    if (typeof options === "number") {
      level = options;
      options = {
        includeDivisions: true,
        includeKey: true,
        includeTime: true,
        includeStaves: true,
        includeClefs: true,
        current: measureAttributeSnapshot(measure, model)
      };
    }
    const current = options.current || measureAttributeSnapshot(measure, model);
    const hasAttributes = options.includeDivisions ||
      options.includeKey ||
      options.includeTime ||
      options.includeStaves ||
      options.includeClefs;
    if (!hasAttributes) return [];
    const rows = [line(level, "<attributes>")];
    if (options.includeDivisions) {
      rows.push(line(level + 1, `<divisions>${current.divisions}</divisions>`));
    }
    if (options.includeKey) {
      rows.push(line(level + 1, "<key>"));
      rows.push(line(level + 2, `<fifths>${current.keyFifths}</fifths>`));
      rows.push(line(level + 1, "</key>"));
    }
    if (options.includeTime) {
      rows.push(line(level + 1, "<time>"));
      rows.push(line(level + 2, `<beats>${escapeXml(current.meter.top || "4")}</beats>`));
      rows.push(line(level + 2, `<beat-type>${escapeXml(current.meter.bottom || "4")}</beat-type>`));
      rows.push(line(level + 1, "</time>"));
    }
    if (options.includeStaves) {
      rows.push(line(level + 1, `<staves>${current.staves}</staves>`));
    }
    if (options.includeClefs) {
      current.clefs.forEach((clef) => {
        rows.push(...clefXml(clef.clefId, clef.staff, level + 1));
      });
    }
    rows.push(line(level, "</attributes>"));
    return rows;
  }

  function dotRows(event, level) {
    const dots = Math.max(0, Math.min(2, Math.round(Number(event.dots) || 0)));
    return Array.from({ length: dots }, () => line(level, "<dot/>"));
  }

  function typeXml(event, level) {
    const type = TYPE_BY_DURATION_ID[event.durationId];
    return type ? line(level, `<type>${type}</type>`) : null;
  }

  function timeModificationRows(event, level) {
    const tuplet = event.tuplet || null;
    const actual = Number(tuplet?.actual);
    const normal = Number(tuplet?.normal);
    if (!Number.isFinite(actual) || !Number.isFinite(normal) || actual <= 0 || normal <= 0) return [];
    return [
      line(level, "<time-modification>"),
      line(level + 1, `<actual-notes>${actual}</actual-notes>`),
      line(level + 1, `<normal-notes>${normal}</normal-notes>`),
      line(level, "</time-modification>")
    ];
  }

  function noteNameRows(prefix, info, level) {
    if (!info?.step) return [];
    const rows = [line(level, `<${prefix}-step>${escapeXml(info.step)}</${prefix}-step>`)];
    const alter = Number(info.alter) || 0;
    if (alter) rows.push(line(level, `<${prefix}-alter>${alter}</${prefix}-alter>`));
    return rows;
  }

  function harmonyRows(direction, level = 3) {
    const harmony = direction?.harmony || null;
    if (!harmony?.root) return [];
    const rows = [line(level, "<harmony>")];
    rows.push(line(level + 1, "<root>"));
    rows.push(...noteNameRows("root", harmony.root, level + 2));
    rows.push(line(level + 1, "</root>"));
    const kind = harmony.kind || {};
    const kindText = kind.text !== undefined ? ` text="${escapeXml(kind.text)}"` : "";
    rows.push(line(level + 1, `<kind${kindText}>${escapeXml(kind.value || "other")}</kind>`));
    if (harmony.bass) {
      rows.push(line(level + 1, "<bass>"));
      rows.push(...noteNameRows("bass", harmony.bass, level + 2));
      rows.push(line(level + 1, "</bass>"));
    }
    (harmony.degrees || []).forEach((degree) => {
      const value = Math.max(1, Math.round(Number(degree.value) || 0));
      if (!value) return;
      rows.push(line(level + 1, "<degree>"));
      rows.push(line(level + 2, `<degree-value>${value}</degree-value>`));
      rows.push(line(level + 2, `<degree-alter>${Math.round(Number(degree.alter) || 0)}</degree-alter>`));
      rows.push(line(level + 2, `<degree-type>${escapeXml(degree.type || "alter")}</degree-type>`));
      rows.push(line(level + 1, "</degree>"));
    });
    if (Number.isFinite(Number(direction.staff))) {
      rows.push(line(level + 1, `<staff>${Math.max(1, Math.round(Number(direction.staff)))}</staff>`));
    }
    rows.push(line(level, "</harmony>"));
    return rows;
  }

  function wordsDirectionRows(direction, level = 3) {
    const placement = direction.placement ? ` placement="${escapeXml(direction.placement)}"` : "";
    const rows = [line(level, `<direction${placement}>`)];
    rows.push(line(level + 1, "<direction-type>"));
    rows.push(line(level + 2, `<words>${escapeXml(direction.text || "")}</words>`));
    rows.push(line(level + 1, "</direction-type>"));
    if (Number.isFinite(Number(direction.staff))) {
      rows.push(line(level + 1, `<staff>${Math.max(1, Math.round(Number(direction.staff)))}</staff>`));
    }
    rows.push(line(level, "</direction>"));
    return rows;
  }

  function dynamicDirectionRows(direction, level = 3) {
    const dynamic = String(direction.dynamic || "").trim();
    if (!/^[a-z]+$/.test(dynamic)) return wordsDirectionRows(direction, level);
    const placement = direction.placement ? ` placement="${escapeXml(direction.placement)}"` : "";
    const rows = [line(level, `<direction${placement}>`)];
    rows.push(line(level + 1, "<direction-type>"));
    rows.push(line(level + 2, "<dynamics>"));
    rows.push(line(level + 3, `<${dynamic}/>`));
    rows.push(line(level + 2, "</dynamics>"));
    rows.push(line(level + 1, "</direction-type>"));
    if (Number.isFinite(Number(direction.staff))) {
      rows.push(line(level + 1, `<staff>${Math.max(1, Math.round(Number(direction.staff)))}</staff>`));
    }
    rows.push(line(level, "</direction>"));
    return rows;
  }

  function tempoDirectionRows(direction, level = 3) {
    const unit = TYPE_BY_DURATION_ID[direction.unitDurationId] || "quarter";
    const perMinute = finiteNumber(direction.bpm, null);
    if (!perMinute) return wordsDirectionRows(direction, level);
    const placement = direction.placement ? ` placement="${escapeXml(direction.placement)}"` : "";
    const rows = [line(level, `<direction${placement}>`)];
    rows.push(line(level + 1, "<direction-type>"));
    rows.push(line(level + 2, "<metronome parentheses=\"no\">"));
    rows.push(line(level + 3, `<beat-unit>${escapeXml(unit)}</beat-unit>`));
    const dots = Math.max(0, Math.min(2, Math.round(Number(direction.dots) || 0)));
    for (let index = 0; index < dots; index += 1) rows.push(line(level + 3, "<beat-unit-dot/>"));
    rows.push(line(level + 3, `<per-minute>${escapeXml(perMinute)}</per-minute>`));
    rows.push(line(level + 2, "</metronome>"));
    rows.push(line(level + 1, "</direction-type>"));
    if (Number.isFinite(Number(direction.staff))) {
      rows.push(line(level + 1, `<staff>${Math.max(1, Math.round(Number(direction.staff)))}</staff>`));
    }
    const quarterBpm = finiteNumber(direction.quarterBpm, perMinute);
    rows.push(line(level + 1, `<sound tempo="${Math.max(1, Math.round(quarterBpm * 100) / 100)}"/>`));
    rows.push(line(level, "</direction>"));
    return rows;
  }

  function directionRows(direction, level = 3) {
    if (direction?.type === "harmony") return harmonyRows(direction, level);
    if (direction?.type === "dynamic") return dynamicDirectionRows(direction, level);
    if (direction?.type === "tempo") return tempoDirectionRows(direction, level);
    return wordsDirectionRows(direction, level);
  }

  function forwardRows(duration, divisions = DEFAULT_DIVISIONS, level = 3) {
    const safeDuration = xmlDuration(duration, divisions);
    return [
      line(level, "<forward>"),
      line(level + 1, `<duration>${safeDuration}</duration>`),
      line(level, "</forward>")
    ];
  }

  function measureDirectionRows(measure, model, level = 3) {
    const directions = [...(measure.directions || [])]
      .sort((a, b) => (Number(a.tick) || 0) - (Number(b.tick) || 0));
    if (!directions.length) return [];
    const rows = [];
    let cursor = 0;
    directions.forEach((direction) => {
      const tick = Math.max(0, Math.min(Number(measure.ticks) || 0, Number(direction.tick) || 0));
      if (tick > cursor) {
        rows.push(...forwardRows(tick - cursor, model.divisions, level));
        cursor = tick;
      }
      rows.push(...directionRows(direction, level));
    });
    if (cursor > 0) rows.push(...backupRows(cursor, model.divisions, level));
    return rows;
  }

  function attributeChangeContentRows(change, level = 4) {
    if (change?.type === "clef") return clefXml(change.clefId, change.staff, level);
    return [];
  }

  function measureAttributeChangeRows(measure, model, level = 3) {
    const changes = [...(measure.attributeChanges || [])]
      .sort((a, b) => (Number(a.tick) || 0) - (Number(b.tick) || 0) || (Number(a.staff) || 0) - (Number(b.staff) || 0));
    if (!changes.length) return [];
    const rows = [];
    let cursor = 0;
    changes.forEach((change) => {
      const tick = Math.max(0, Math.min(Number(measure.ticks) || 0, Number(change.tick) || 0));
      if (tick > cursor) {
        rows.push(...forwardRows(tick - cursor, model.divisions, level));
        cursor = tick;
      }
      const content = attributeChangeContentRows(change, level + 1);
      if (content.length) {
        rows.push(line(level, "<attributes>"));
        rows.push(...content);
        rows.push(line(level, "</attributes>"));
      }
    });
    if (cursor > 0) rows.push(...backupRows(cursor, model.divisions, level));
    return rows;
  }

  function notePitchKey(note) {
    if (!note?.pitch) return "";
    const alter = Number(note.pitch.alter) || 0;
    return `${note.pitch.step}:${alter}:${note.pitch.octave}`;
  }

  function exportedVoiceNumber(staffNumber, voiceNumber) {
    const staff = Math.max(1, Math.round(Number(staffNumber) || 1));
    const voice = Math.max(1, Math.round(Number(voiceNumber) || 1));
    return ((staff - 1) * VOICES_PER_STAFF_BLOCK) + voice;
  }

  function attrsXml(attrs = {}) {
    return Object.entries(attrs)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
      .join("");
  }

  function notationItemRows(item, level) {
    const name = String(item?.name || "").trim();
    if (!name) return [];
    const attrs = {};
    if (item.placement) attrs.placement = item.placement;
    if (item.type) attrs.type = item.type;
    if (item.lineType) attrs["line-type"] = item.lineType;
    if (Number.isFinite(Number(item.number))) attrs.number = Math.max(1, Math.round(Number(item.number)));
    const text = item.text === undefined || item.text === null ? "" : String(item.text);
    if (text) return [line(level, `<${name}${attrsXml(attrs)}>${escapeXml(text)}</${name}>`)];
    return [line(level, `<${name}${attrsXml(attrs)}/>`)];
  }

  function notationGroupRows(groupName, items, level) {
    const safeItems = Array.isArray(items) ? items.filter((item) => item?.name) : [];
    if (!safeItems.length) return [];
    const rows = [line(level, `<${groupName}>`)];
    safeItems.forEach((item) => rows.push(...notationItemRows(item, level + 1)));
    rows.push(line(level, `</${groupName}>`));
    return rows;
  }

  function fermataRows(items, level) {
    const safeItems = Array.isArray(items) ? items.filter((item) => item?.name) : [];
    return safeItems.flatMap((item) => {
      const placement = item.placement === "below" ? "inverted" : "upright";
      return notationItemRows({
        name: "fermata",
        type: placement,
        text: item.text || "normal"
      }, level);
    });
  }

  function slurRows(items, level) {
    const safeItems = Array.isArray(items) ? items.filter((item) => item?.type) : [];
    return safeItems.flatMap((item) => notationItemRows({
      name: "slur",
      type: item.type,
      number: item.number,
      "line-type": item.lineType,
      lineType: item.lineType,
      placement: item.placement
    }, level));
  }

  function eventHasNotations(event, tieStop, tieStart) {
    const notations = event.notations || {};
    return tieStop || tieStart ||
      (notations.articulations || []).length ||
      (notations.ornaments || []).length ||
      (notations.technical || []).length ||
      (notations.fermatas || []).length ||
      (notations.slurs || []).length;
  }

  function eventNotationRows(event, tieStop, tieStart, level) {
    if (!eventHasNotations(event, tieStop, tieStart)) return [];
    const notations = event.notations || {};
    const rows = [line(level, "<notations>")];
    if (tieStop) rows.push(line(level + 1, '<tied type="stop"/>'));
    if (tieStart) rows.push(line(level + 1, '<tied type="start"/>'));
    rows.push(...slurRows(notations.slurs, level + 1));
    rows.push(...fermataRows(notations.fermatas, level + 1));
    rows.push(...notationGroupRows("articulations", notations.articulations, level + 1));
    rows.push(...notationGroupRows("ornaments", notations.ornaments, level + 1));
    rows.push(...notationGroupRows("technical", notations.technical, level + 1));
    rows.push(line(level, "</notations>"));
    return rows;
  }

  function noteRows(event, staffNumber, voiceNumber, tieState, divisions = DEFAULT_DIVISIONS, level = 3) {
    const duration = xmlDuration(event.duration, divisions);
    const rows = [line(level, "<note>")];
    if (event.chord) rows.push(line(level + 1, "<chord/>"));
    if (event.type === "rest") {
      const measureAttr = event.measureRest ? ' measure="yes"' : "";
      rows.push(line(level + 1, `<rest${measureAttr}/>`));
    } else if (event.unpitched) {
      rows.push(line(level + 1, "<unpitched>"));
      rows.push(line(level + 2, `<display-step>${escapeXml(event.displayStep || "C")}</display-step>`));
      rows.push(line(level + 2, `<display-octave>${finiteNumber(event.displayOctave, 4)}</display-octave>`));
      rows.push(line(level + 1, "</unpitched>"));
    } else {
      rows.push(line(level + 1, "<pitch>"));
      rows.push(line(level + 2, `<step>${escapeXml(event.pitch?.step || "C")}</step>`));
      const alter = Number(event.pitch?.alter) || 0;
      if (alter) rows.push(line(level + 2, `<alter>${alter}</alter>`));
      rows.push(line(level + 2, `<octave>${finiteNumber(event.pitch?.octave, 4)}</octave>`));
      rows.push(line(level + 1, "</pitch>"));
    }
    rows.push(line(level + 1, `<duration>${duration}</duration>`));

    const pitchKey = notePitchKey(event);
    const tieKey = `${staffNumber}:${voiceNumber}:${pitchKey}`;
    const tieStop = event.type === "note" && tieState.has(tieKey);
    const tieStart = event.type === "note" && event.tieStart === true;
    if (tieStop) rows.push(line(level + 1, '<tie type="stop"/>'));
    if (tieStart) rows.push(line(level + 1, '<tie type="start"/>'));
    if (tieStop && !tieStart) tieState.delete(tieKey);
    if (tieStart) tieState.add(tieKey);

    rows.push(line(level + 1, `<voice>${voiceNumber}</voice>`));
    const type = typeXml(event, level + 1);
    if (type) rows.push(type);
    rows.push(...dotRows(event, level + 1));
    rows.push(...timeModificationRows(event, level + 1));
    rows.push(line(level + 1, `<staff>${staffNumber}</staff>`));

    rows.push(...eventNotationRows(event, tieStop, tieStart, level + 1));

    rows.push(line(level, "</note>"));
    return rows;
  }

  function backupRows(duration, divisions = DEFAULT_DIVISIONS, level = 3) {
    const safeDuration = xmlDuration(duration, divisions);
    return [
      line(level, "<backup>"),
      line(level + 1, `<duration>${safeDuration}</duration>`),
      line(level, "</backup>")
    ];
  }

  function barlineRows(barline, level = 3) {
    const location = barline?.location || "right";
    const rows = [line(level, `<barline location="${escapeXml(location)}">`)];
    if (barline.style) rows.push(line(level + 1, `<bar-style>${escapeXml(barline.style)}</bar-style>`));
    (barline.endings || []).forEach((ending) => {
      rows.push(line(level + 1, `<ending number="${escapeXml(ending.number || "1")}" type="${escapeXml(ending.type || "start")}"/>`));
    });
    if (barline.repeat) rows.push(line(level + 1, `<repeat direction="${escapeXml(barline.repeat)}"/>`));
    rows.push(line(level, "</barline>"));
    return rows;
  }

  function measureXml(measure, model, tieState, attributeState = null, measureIndex = 0, level = 2) {
    if (typeof attributeState === "number") {
      level = attributeState;
      attributeState = createAttributeExportState();
    }
    const safeAttributeState = attributeState || createAttributeExportState();
    const attributeOptions = measureAttributeOptions(measure, model, safeAttributeState);
    const rows = [line(level, `<measure number="${measure.number}">`)];
    rows.push(...measureAttributesXml(measure, model, attributeOptions, level + 1));
    updateAttributeExportState(safeAttributeState, attributeOptions.current);
    rows.push(...(measure.barlines || []).filter((barline) => barline.location === "left").flatMap((barline) => barlineRows(barline, level + 1)));
    rows.push(...measureAttributeChangeRows(measure, model, level + 1));
    rows.push(...measureDirectionRows(measure, model, level + 1));
    let wroteStream = false;
    measure.staves.forEach((staff, staffIndex) => {
      const staffNumber = staffIndex + 1;
      staff.voices.forEach((voice) => {
        if (wroteStream) rows.push(...backupRows(measure.ticks, model.divisions, level + 1));
        const voiceNumber = exportedVoiceNumber(staffNumber, voice.number);
        (voice.events || []).forEach((event) => {
          rows.push(...noteRows(event, staffNumber, voiceNumber, tieState, model.divisions, level + 1));
        });
        wroteStream = true;
      });
    });
    if (!wroteStream) {
      rows.push(...noteRows({
        type: "rest",
        duration: measure.ticks,
        durationId: "whole",
        measureRest: true
      }, 1, 1, tieState, model.divisions, level + 1));
    }
    rows.push(...(measure.barlines || []).filter((barline) => barline.location !== "left").flatMap((barline) => barlineRows(barline, level + 1)));
    applyMeasureAttributeChangesToState(safeAttributeState, measure, model);
    rows.push(line(level, "</measure>"));
    return rows;
  }

  function midiInstrumentRows(model, level = 3) {
    const midi = model?.midi || {};
    const instrumentId = midi.instrumentId || "P1-I1";
    const instrumentName = midi.instrumentName || "Piano";
    const channel = Math.max(1, Math.min(16, Math.round(Number(midi.channel) || 1)));
    const program = Math.max(1, Math.min(128, Math.round(Number(midi.program) || 1)));
    const volume = Math.max(0, Math.min(100, Math.round(Number(midi.volume) || 80)));
    return [
      line(level, `<score-instrument id="${escapeXml(instrumentId)}">`),
      line(level + 1, `<instrument-name>${escapeXml(instrumentName)}</instrument-name>`),
      line(level, "</score-instrument>"),
      line(level, `<midi-instrument id="${escapeXml(instrumentId)}">`),
      line(level + 1, `<midi-channel>${channel}</midi-channel>`),
      line(level + 1, `<midi-program>${program}</midi-program>`),
      line(level + 1, `<volume>${volume}</volume>`),
      line(level, "</midi-instrument>")
    ];
  }

  function serialize(model) {
    const safeModel = model || {};
    const title = safeModel.title || "Cuaderno JML";
    const partName = safeModel.partName || "Cuaderno";
    const measures = Array.isArray(safeModel.measures) ? safeModel.measures : [];
    const rows = [
      XML_HEADER,
      DOCTYPE,
      '<score-partwise version="3.1">',
      line(1, "<work>"),
      line(2, `<work-title>${escapeXml(title)}</work-title>`),
      line(1, "</work>"),
      line(1, "<identification>"),
      line(2, "<encoding>"),
      line(3, "<software>Jaramillo Music Lab - Cuaderno de estudio</software>"),
      line(2, "</encoding>"),
      line(1, "</identification>"),
      line(1, "<part-list>"),
      line(2, '<score-part id="P1">'),
      line(3, `<part-name>${escapeXml(partName)}</part-name>`),
      ...midiInstrumentRows(safeModel, 3),
      line(2, "</score-part>"),
      line(1, "</part-list>"),
      line(1, '<part id="P1">')
    ];
    const tieState = new Set();
    const attributeState = createAttributeExportState();
    measures.forEach((measure, index) => rows.push(...measureXml(measure, safeModel, tieState, attributeState, index, 2)));
    rows.push(line(1, "</part>"));
    rows.push("</score-partwise>");
    return `${rows.join("\n")}\n`;
  }

  global.JMLScoreMusicXml = Object.freeze({
    DEFAULT_DIVISIONS,
    serialize
  });
})(window);
