(function () {
  const ARTICULATION_GLYPHS = Object.freeze([
    ["articAccentAbove", "Acento arriba"],
    ["articAccentBelow", "Acento abajo"],
    ["articMarcatoAbove", "Marcato arriba"],
    ["articMarcatoBelow", "Marcato abajo"],
    ["articStaccatoAbove", "Staccato arriba"],
    ["articStaccatoBelow", "Staccato abajo"],
    ["articStaccatissimoAbove", "Staccatissimo arriba"],
    ["articStaccatissimoBelow", "Staccatissimo abajo"],
    ["articStaccatissimoWedgeAbove", "Staccatissimo cuña arriba"],
    ["articStaccatissimoWedgeBelow", "Staccatissimo cuña abajo"],
    ["articTenutoAbove", "Tenuto arriba"],
    ["articTenutoBelow", "Tenuto abajo"],
    ["articTenutoAccentAbove", "Tenuto acento arriba"],
    ["articTenutoAccentBelow", "Tenuto acento abajo"],
    ["articTenutoStaccatoAbove", "Portato arriba"],
    ["articTenutoStaccatoBelow", "Portato abajo"],
    ["articAccentStaccatoAbove", "Acento staccato arriba"],
    ["articAccentStaccatoBelow", "Acento staccato abajo"],
    ["articMarcatoStaccatoAbove", "Marcato staccato arriba"],
    ["articMarcatoStaccatoBelow", "Marcato staccato abajo"],
    ["articMarcatoTenutoAbove", "Marcato tenuto arriba"],
    ["articMarcatoTenutoBelow", "Marcato tenuto abajo"],
    ["articStressAbove", "Énfasis arriba"],
    ["articStressBelow", "Énfasis abajo"],
    ["articUnstressAbove", "Sin énfasis arriba"],
    ["articUnstressBelow", "Sin énfasis abajo"],
    ["articLaissezVibrerAbove", "Laissez vibrer arriba"],
    ["articLaissezVibrerBelow", "Laissez vibrer abajo"],
    ["fermataAbove", "Calderón arriba"],
    ["fermataBelow", "Calderón abajo"],
    ["fermataShortAbove", "Calderón corto arriba"],
    ["fermataShortBelow", "Calderón corto abajo"],
    ["fermataLongAbove", "Calderón largo arriba"],
    ["fermataLongBelow", "Calderón largo abajo"],
    ["fermataVeryLongAbove", "Calderón muy largo arriba"],
    ["fermataVeryLongBelow", "Calderón muy largo abajo"],
    ["breathMarkComma", "Respiración coma"],
    ["breathMarkTick", "Respiración tick"],
    ["breathMarkUpbow", "Respiración tipo arco"],
    ["breathMarkSalzedo", "Respiración Salzedo"],
    ["caesura", "Cesura"],
    ["caesuraShort", "Cesura corta"],
    ["caesuraThick", "Cesura gruesa"],
    ["caesuraCurved", "Cesura curva"],
    ["stringsDownBow", "Arco abajo"],
    ["stringsUpBow", "Arco arriba"],
    ["stringsDownBowTurned", "Arco abajo invertido"],
    ["stringsUpBowTurned", "Arco arriba invertido"],
    ["stringsOverpressureDownBow", "Sobrepresión arco abajo"],
    ["stringsOverpressureUpBow", "Sobrepresión arco arriba"],
    ["stringsThumbPositionTurned", "Posición de pulgar"],
    ["pluckedSnapPizzicatoAbove", "Snap pizzicato arriba"],
    ["pluckedSnapPizzicatoBelow", "Snap pizzicato abajo"],
    ["ornamentTrill", "Trino"],
    ["wiggleTrill", "Trino ondulado"],
    ["ornamentShortTrill", "Trino corto"],
    ["ornamentMordent", "Mordente"],
    ["ornamentTurn", "Grupeto"],
    ["ornamentTurnInverted", "Grupeto invertido"],
    ["ornamentTurnSlash", "Grupeto tachado"],
    ["ornamentTurnUp", "Grupeto ascendente"],
    ["ornamentHaydn", "Ornamento Haydn"],
    ["ornamentTremblement", "Tremblement"],
    ["ornamentTremblementCouperin", "Tremblement Couperin"],
    ["ornamentPrecompTrillWithMordent", "Trino con mordente"],
    ["ornamentPrecompMordentUpperPrefix", "Mordente prefijo superior"],
    ["ornamentPrecompInvertedMordentUpperPrefix", "Mordente invertido prefijo"],
    ["ornamentPrecompSlide", "Slide ornamental"],
    ["ornamentSchleifer", "Schleifer"],
    ["ornamentShake3", "Shake"],
    ["brassScoop", "Scoop"],
    ["brassFallSmoothShort", "Fall corto"],
    ["brassFallSmoothMedium", "Fall medio"],
    ["brassFallSmoothLong", "Fall largo"],
    ["brassDoitShort", "Doit corto"],
    ["brassDoitMedium", "Doit medio"],
    ["brassDoitLong", "Doit largo"],
    ["brassPlop", "Plop"],
    ["brassFlip", "Flip"],
    ["brassJazzTurn", "Jazz turn"],
    ["brassValveTrill", "Trino de válvula"],
    ["guitarShake", "Shake guitarra"],
    ["windTrillKey", "Llave de trino"]
  ]);

  const DORICO_ARTICULATION_SHORTCUTS = Object.freeze({
    articAccentAbove: "!",
    articStaccatoAbove: "\"",
    articMarcatoAbove: "·",
    articStressAbove: "%",
    articStaccatissimoAbove: "&",
    articTenutoAbove: "$",
    articTenutoStaccatoAbove: "(",
    articUnstressAbove: "/"
  });

  function paletteIdForGlyphName(glyphName) {
    return String(glyphName)
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
  }

  function showGlyphInArticulationMenu(glyphName) {
    const name = String(glyphName || "");
    return !name.endsWith("Below") &&
      !name.includes("Turned") &&
      !name.includes("Inverted");
  }

  function articulationPaletteItems(smufl) {
    return ARTICULATION_GLYPHS
      .filter(([glyphName]) => showGlyphInArticulationMenu(glyphName))
      .map(([glyphName, label]) => ({
        id: paletteIdForGlyphName(glyphName),
        label,
        symbol: smufl(glyphName),
        music: true,
        markType: "glyph",
        glyphName,
        shortcut: DORICO_ARTICULATION_SHORTCUTS[glyphName] || ""
      }));
  }

  function tupletIconLayers(number, noteSymbol) {
    return [
      { id: "text-number", text: String(number), className: "text-glyph" },
      { id: "music-note", text: noteSymbol, className: "music-glyph" }
    ];
  }

  function tempoIconLayers(noteSymbol, dots = 0) {
    return [
      { id: "music-note", text: noteSymbol, className: "music-glyph" },
      ...(dots ? [{ id: "text-dot", text: "·", className: "text-glyph" }] : []),
      { id: "text-equals", text: "=", className: "text-glyph" }
    ];
  }

  function createPalettes(options = {}) {
    const {
      durations = [],
      completeDurationSymbols = {},
      smufl = (name) => name
    } = options;
    const restPalette = [
      { id: "rest-breve", label: "Silencio de cuadrada", symbol: smufl("restDoubleWhole"), music: true, restDurationId: "breve" },
      { id: "rest-whole", label: "Silencio de redonda", symbol: smufl("restWhole"), music: true, restDurationId: "whole" },
      { id: "rest-half", label: "Silencio de blanca", symbol: smufl("restHalf"), music: true, restDurationId: "half" },
      { id: "rest-quarter", label: "Silencio de negra", symbol: smufl("restQuarter"), music: true, restDurationId: "quarter" },
      { id: "rest-eighth", label: "Silencio de corchea", symbol: smufl("rest8th"), music: true, restDurationId: "eighth" },
      { id: "rest-sixteenth", label: "Silencio de semicorchea", symbol: smufl("rest16th"), music: true, restDurationId: "sixteenth" },
      { id: "rest-thirty-second", label: "Silencio de fusa", symbol: smufl("rest32nd"), music: true, restDurationId: "thirty-second" },
      { id: "rest-sixty-fourth", label: "Silencio de semifusa", symbol: smufl("rest64th"), music: true, restDurationId: "sixty-fourth" },
      { id: "rest-one-twenty-eighth", label: "Silencio de garrapatea", symbol: smufl("rest128th"), music: true, restDurationId: "one-twenty-eighth" }
    ];
    const dotPalette = [
      { id: "dot", label: "Puntillo", symbol: "•", symbolClass: "dot-glyph", dotCount: 1 },
      { id: "double-dot", label: "Doble puntillo", symbol: "••", symbolClass: "dot-glyph", dotCount: 2 }
    ];
    const inputModifierPalette = [
      { id: "input-chord", label: "Modo acorde", symbol: "Q", noteInputModifier: "chordMode", shortcut: "Q" },
      { id: "input-insert", label: "Modo insertar", symbol: "I", noteInputModifier: "insertMode", shortcut: "I" },
      { id: "input-lock-duration", label: "Bloquear duraciones", symbol: "L", noteInputModifier: "lockDuration", shortcut: "L" },
      { id: "input-force-duration", label: "Forzar duración", symbol: "O", noteInputModifier: "forceDuration", shortcut: "O" },
      { id: "input-pitch-before-duration", label: "Altura antes de duración", symbol: "K", noteInputModifier: "pitchBeforeDuration", shortcut: "K" }
    ];
    const figurePalette = [
      ...durations,
      ...restPalette,
      ...dotPalette,
      ...inputModifierPalette
    ];
    const articulations = articulationPaletteItems(smufl);
    const palettes = {
      selection: [
        { id: "select-simple", label: "Selección simple", symbol: "Sel.", selectionAction: "simple" },
        { id: "select-all", label: "Seleccionar todo", symbol: "Todo", selectionAction: "all" },
        { id: "select-class", label: "Seleccionar clase", symbol: "Clase", selectionClassPicker: true },
        { id: "select-upper-voice", label: "Voz superior", symbol: "Sup.", selectionAction: "upper-voice" },
        { id: "select-lower-voice", label: "Voz inferior", symbol: "Inf.", selectionAction: "lower-voice" },
        { id: "select-duration", label: "Seleccionar figura", symbol: "Fig.", selectionDurationPicker: true },
        { id: "convert-lower-to-l2", label: "Convertir selección a L2", symbol: "→L2", selectionAction: "convert-selection-to-l2" }
      ],
      figures: figurePalette,
      rests: restPalette,
      ties: [
        { id: "tie", label: "Ligadura de prolongación", symbol: "‿", tieAction: "prolongation" },
        { id: "slur", label: "Ligadura de fraseo", symbol: "⌒", slurType: "slur" },
        { id: "dotted-slur", label: "Ligadura de fraseo punteada", symbol: "⌒", dotted: true, slurType: "dotted-slur" }
      ],
      dots: dotPalette,
      tuplets: [
        { id: "triplet-eighth", label: "Tresillo de corcheas", symbol: `3${completeDurationSymbols.eighth}`, iconLayers: tupletIconLayers(3, completeDurationSymbols.eighth), music: true, tuplet: { actual: 3, normal: 2, unitDurationId: "eighth" } },
        { id: "triplet-quarter", label: "Tresillo de negras", symbol: `3${completeDurationSymbols.quarter}`, iconLayers: tupletIconLayers(3, completeDurationSymbols.quarter), music: true, tuplet: { actual: 3, normal: 2, unitDurationId: "quarter" } },
        { id: "sextuplet-sixteenth", label: "Seisillo de semicorcheas", symbol: `6${completeDurationSymbols.sixteenth}`, iconLayers: tupletIconLayers(6, completeDurationSymbols.sixteenth), music: true, tuplet: { actual: 6, normal: 4, unitDurationId: "sixteenth" } },
        { id: "custom-tuplet", label: "Tuplet irregular x:y", symbol: "x:y", customTuplet: true },
        { id: "stop-tuplet", label: "Cerrar escritura de tuplet", symbol: "Fin", stopTuplet: true, shortcut: "Shift+Ñ" }
      ],
      meters: [
        { id: "meter-2-2", label: "Compás 2/2", symbol: smufl("timeSigCutCommon"), music: true, meter: { top: "2", bottom: "2", label: "2/2", kind: "simple", cutTime: true } },
        { id: "meter-2-4", label: "Compás 2/4", symbol: "2/4", meter: { top: "2", bottom: "4", label: "2/4" } },
        { id: "meter-3-4", label: "Compás 3/4", symbol: "3/4", meter: { top: "3", bottom: "4", label: "3/4" } },
        { id: "meter-4-4", label: "Compás 4/4", symbol: "4/4", meter: { top: "4", bottom: "4", label: "4/4" } },
        { id: "meter-6-8", label: "Compás 6/8", symbol: "6/8", meter: { top: "6", bottom: "8", label: "6/8" } },
        { id: "meter-9-8", label: "Compás 9/8", symbol: "9/8", meter: { top: "9", bottom: "8", label: "9/8" } },
        { id: "meter-12-8", label: "Compás 12/8", symbol: "12/8", meter: { top: "12", bottom: "8", label: "12/8" } },
        { id: "meter-amalgam", label: "Amalgama", symbol: "amalg.", amalgamMeter: true }
      ],
      tempo: [
        { id: "tempo-quarter", label: "Negra =", symbol: `${completeDurationSymbols.quarter} =`, iconLayers: tempoIconLayers(completeDurationSymbols.quarter), tempoUnit: "quarter" },
        { id: "tempo-eighth", label: "Corchea =", symbol: `${completeDurationSymbols.eighth} =`, iconLayers: tempoIconLayers(completeDurationSymbols.eighth), tempoUnit: "eighth" },
        { id: "tempo-half", label: "Blanca =", symbol: `${completeDurationSymbols.half} =`, iconLayers: tempoIconLayers(completeDurationSymbols.half), tempoUnit: "half" },
        { id: "tempo-dotted-quarter", label: "Negra con puntillo =", symbol: `${completeDurationSymbols.quarter}· =`, iconLayers: tempoIconLayers(completeDurationSymbols.quarter, 1), tempoUnit: "quarter", tempoDots: 1 },
        { id: "tempo-dotted-eighth", label: "Corchea con puntillo =", symbol: `${completeDurationSymbols.eighth}· =`, iconLayers: tempoIconLayers(completeDurationSymbols.eighth, 1), tempoUnit: "eighth", tempoDots: 1 },
        { id: "tempo-text", label: "Texto de tempo", symbol: "Texto", tempoText: true }
      ],
      jazz: [
        { id: "jazz-straight", label: "Straight (sin swing)", symbol: "Straight", jazzSwingPreset: "straight" },
        { id: "jazz-light", label: "Light swing (60/40)", symbol: "Light", jazzSwingPreset: "light" },
        { id: "jazz-medium", label: "Medium swing (66/33)", symbol: "Medium", jazzSwingPreset: "medium" },
        { id: "jazz-hard", label: "Hard swing (72/28)", symbol: "Hard", jazzSwingPreset: "hard" }
      ],
      clefs: [
        { id: "clef-g", label: "Clave de sol", symbol: smufl("gClef"), music: true, clefId: "clef-g" },
        { id: "clef-c", label: "Clave de do", symbol: smufl("cClef"), music: true, clefId: "clef-c" },
        { id: "clef-f", label: "Clave de fa", symbol: smufl("fClef"), music: true, clefId: "clef-f" },
        { id: "clef-g-8va", label: "Clave de sol octavada arriba", symbol: smufl("gClef8va"), music: true, clefId: "clef-g-8va" },
        { id: "clef-g-8vb", label: "Clave de sol octavada abajo", symbol: smufl("gClef8vb"), music: true, clefId: "clef-g-8vb" },
        { id: "clef-f-8va", label: "Clave de fa octavada arriba", symbol: smufl("fClef8va"), music: true, clefId: "clef-f-8va" },
        { id: "clef-f-8vb", label: "Clave de fa octavada abajo", symbol: smufl("fClef8vb"), music: true, clefId: "clef-f-8vb" },
        { id: "clef-percussion", label: "Clave de percusión", symbol: smufl("unpitchedPercussionClef1"), music: true, clefId: "clef-percussion" }
      ],
      articulations,
      dynamics: [
        { id: "ppp", label: "Pianississimo", symbol: "ppp" },
        { id: "pp", label: "Pianissimo", symbol: "pp" },
        { id: "p", label: "Piano", symbol: "p" },
        { id: "mp", label: "Mezzo piano", symbol: "mp" },
        { id: "mf", label: "Mezzo forte", symbol: "mf", markType: "dynamic-mf" },
        { id: "f", label: "Forte", symbol: "f" },
        { id: "ff", label: "Fortissimo", symbol: "ff" },
        { id: "fff", label: "Fortississimo", symbol: "fff" },
        { id: "crescendo", label: "Crescendo", symbol: "<", markType: "crescendo" },
        { id: "diminuendo", label: "Diminuendo", symbol: ">", markType: "diminuendo" },
        { id: "cresc-text", label: "Cresc.", symbol: "cresc." },
        { id: "dim-text", label: "Dim.", symbol: "dim." }
      ],
      ornaments: articulations,
      bars: [
        { id: "bar-single", label: "Barra simple", symbol: "|", barlineType: "single" },
        { id: "bar-double", label: "Barra doble", symbol: "||", barlineType: "double" },
        { id: "bar-final", label: "Barra final", symbol: "|]", barlineType: "final" },
        { id: "repeat-start", label: "Inicio de repetición", symbol: "𝄆", music: true, barlineType: "repeat-start", previousBoundary: true },
        { id: "repeat-end", label: "Fin de repetición", symbol: "𝄇", music: true, barlineType: "repeat-end" },
        { id: "repeat-both", label: "Doble repetición", symbol: "𝄇𝄆", music: true, barlineType: "repeat-both" }
      ],
      endings: [
        { id: "first-ending", label: "Primera casilla", symbol: "⌜1.", ending: { label: "1.", closedEnd: true } },
        { id: "second-ending", label: "Segunda casilla", symbol: "⌜2.", ending: { label: "2.", closedEnd: false } },
        { id: "open-ending", label: "Casilla abierta", symbol: "⌜", ending: { label: "", closedEnd: false } },
        { id: "closed-ending", label: "Casilla cerrada", symbol: "⌜—|", ending: { label: "", closedEnd: true } }
      ],
      tools: [
        { id: "auto-drops", label: "Auto-drops", symbol: "Auto-drops", chordTool: "auto-drops" },
        { id: "auto-skips", label: "Auto-skips", symbol: "Auto-skips", chordTool: "auto-skips" },
        { id: "drop-2", label: "Drop 2", symbol: "D2", chordTool: "drop-2" },
        { id: "drop-3", label: "Drop 3", symbol: "D3", chordTool: "drop-3" },
        { id: "drop-2-4", label: "Drop 2-4", symbol: "D2-4", chordTool: "drop-2-4" },
        { id: "skip-2", label: "Skip 2", symbol: "S2", chordTool: "skip-2" },
        { id: "skip-3", label: "Skip 3", symbol: "S3", chordTool: "skip-3" },
        { id: "skip-2-4", label: "Skip 2-4", symbol: "S2-4", chordTool: "skip-2-4" },
        { id: "rotate-up", label: "Rotar arriba", symbol: "↑", chordTool: "rotate-up" },
        { id: "rotate-down", label: "Rotar abajo", symbol: "↓", chordTool: "rotate-down" },
        { id: "distribute-chord", label: "Repartir", symbol: "Repartir", chordTool: "distribute" },
        { id: "line-1", label: "Línea 1", symbol: "L1", voiceMode: 1 },
        { id: "line-2", label: "Línea 2", symbol: "L2", voiceMode: 2 }
      ],
      canvas: [
        { id: "item-color", label: "Color", symbol: "Color", colorPicker: true },
        { id: "add-staff", label: "Agregar pentagrama", symbol: "+𝄞", systemAction: "add-staff" },
        { id: "add-percussion-line", label: "Agregar línea de percusión", symbol: "+—", systemAction: "add-percussion-line" },
        { id: "remove-system", label: "Quitar sistema activo", symbol: "−𝄞", systemAction: "remove-active" },
        { id: "add-measure", label: "Agregar compás", symbol: "+□", measureAction: "add" },
        { id: "remove-measure", label: "Quitar compás", symbol: "−□", measureAction: "remove" },
        { id: "hide-measure", label: "Ocultar/mostrar compás", symbol: "H", measureAction: "hide" },
        { id: "zoom-out", label: "Alejar", symbol: "−", zoomAction: -0.1 },
        { id: "zoom-label", label: "Zoom actual", symbol: "100%", zoomLabel: true },
        { id: "zoom-in", label: "Acercar", symbol: "+", zoomAction: 0.1 }
      ],
      fermatas: articulations
    };
    return {
      dotPalette,
      figurePalette,
      palettes,
      restPalette
    };
  }

  window.JMLScorePalettes = Object.freeze({
    ARTICULATION_GLYPHS,
    articulationPaletteItems,
    createPalettes,
    paletteIdForGlyphName,
    showGlyphInArticulationMenu,
    tupletIconLayers
  });
})();
