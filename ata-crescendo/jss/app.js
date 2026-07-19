const NS = "http://www.w3.org/2000/svg";

const DEFAULT_SETTINGS = {
  "orientation": "landscape",
  "pageWidth": 1100,
  "pageHeight": 850,
  "scoreScale": 0.85,
  "pageBackground": "#ffffff",
  "pageShadow": true,
  "marginLeft": 48,
  "marginRight": 48,
  "marginTop": 48,
  "marginBottom": 48,
  "headerHeight": 122,
  "measuresPerSystem": 4,
  "systemsPerPage": 4,
  "systemHeight": 122,
  "systemGap": 86,
  "dynamicSystemGap": 34,
  "measureLineY": 58,
  "barTop": 40,
  "barBottom": 18,
  "titleX": 0.5,
  "titleY": 28,
  "composerX": 1,
  "composerY": 50,
  "chordXOffset": 0.2265625,
  "chordY": 15.31640625,
  "modeXOffset": 0,
  "modeY": 39,
  "degreeXOffset": 2.94140625,
  "degreeY": 98.69921875,
  "sectionLabelXOffset": 10,
  "sectionLabelY": 72,
  "noteXOffset": 15.76953125,
  "noteY": 122,
  "noteHeight": 26,
  "noteShowBox": false,
  "notePaddingX": 6,
  "notePaddingY": 4,
  "formX": -15.97265625,
  "formY": 24.87890625,
  "endingY": -29.5625,
  "endingStartX": 3.1328125,
  "endingEndInset": 22,
  "endingHookHeight": 14,
  "jumpXOffset": 0,
  "jumpY": -22,
  "measureInnerPadding": 18,
  "slotGap": 22,
  "minMeasureWidthRatio": 0.68,
  "minTextScale": 1,
  "titleFont": "Georgia, 'Times New Roman', serif",
  "composerFont": "Georgia, 'Times New Roman', serif",
  "chordFont": "\"Ink Free\"",
  "modeFont": "\"Ink Free\"",
  "degreeFont": "\"ATA Condensed\", \"Arial Narrow\", \"Avenir Next Condensed\", sans-serif",
  "sectionLabelFont": "\"ATA Condensed\", \"Arial Narrow\", \"Avenir Next Condensed\", sans-serif",
  "formFont": "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
  "noteFont": "\"Ink Free\"",
  "pageNumberFont": "\"Ink Free\"",
  "titleSize": 30,
  "composerSize": 13,
  "chordSize": 28,
  "modeSize": 20,
  "degreeSize": 20,
  "sectionLabelSize": 15,
  "formSize": 28,
  "endingSize": 12,
  "jumpSize": 12,
  "noteSize": 20,
  "pageNumberSize": 24,
  "formPaddingX": 7,
  "formPaddingY": 4,
  "formRadius": 2,
  "connectorXOffset": 0,
  "connectorYOffset": 0,
  "connectorStrokeWidth": 1.8,
  "connectorCurveStartOffsetY": 0,
  "connectorCurveEndOffsetY": 0,
  "connectorCurveLift": 0,
  "connectorArrowHeadSize": 0,
  "connectorArrowTextGap": 0,
  "connectorBracketOffsetY": 24,
  "connectorBracketHookHeight": 8,
  "connectorBracketSidePad": 0,
  "titleWeight": 700,
  "composerWeight": 700,
  "chordWeight": 800,
  "modeWeight": 400,
  "degreeWeight": 600,
  "sectionLabelWeight": 600,
  "formWeight": 700,
  "noteWeight": 400,
  "pageNumberWeight": 400,
  "inkColor": "#111111",
  "chordColor": "#111111",
  "modeColor": "#18753a",
  "degreeColor": "#2b229a",
  "sectionLabelColor": "#2b229a",
  "noteColor": "#cc8100",
  "noteBoxColor": "#bbbbbb",
  "pageNumberColor": "#111111",
  "arrowColor": "#c21b1b",
  "guideColor": "#000000",
  "selectedColor": "#ffdf58",
  "titleCase": "upper",
  "composerCase": "upper",
  "showPageNumbers": true,
  "pageNumberY": 28,
  "pageNumberXOffset": 0,
  "showSystemMeasureNumbers": true,
  "systemMeasureNumberX": -18,
  "systemMeasureNumberY": 63,
  "systemMeasureNumberFont": "\"Ink Free\"",
  "systemMeasureNumberSize": 16,
  "systemMeasureNumberWeight": 600,
  "systemMeasureNumberColor": "#666666",
  "timeSignatureXOffset": -27,
  "timeSignatureYOffset": 0,
  "timeSignatureFont": "Georgia, 'Times New Roman', serif",
  "timeSignatureSize": 25,
  "timeSignatureWeight": 700,
  "timeSignatureColor": "#111111",
  "rhythmY": -34,
  "rhythmSize": 29,
  "rhythmStemHeight": 35,
  "rhythmColor": "#111111",
  "localFonts": [],
  "systemFonts": [],
  "deltaToMaj7": "on",
  "studentNameX": 0,
  "studentNameY": 28,
  "studentNameFont": "\"Ink Free\"",
  "studentNameSize": 20,
  "studentNameWeight": 400,
  "studentNameColor": "#111111",
  "studentNameWidth": 230
};

const SCORE_SCALE_KEYS = new Set([
  "marginTop",
  "marginBottom",
  "headerHeight",
  "systemHeight",
  "systemGap",
  "measureLineY",
  "barTop",
  "barBottom",
  "titleY",
  "composerY",
  "studentNameX",
  "studentNameY",
  "studentNameWidth",
  "chordXOffset",
  "chordY",
  "modeXOffset",
  "modeY",
  "degreeXOffset",
  "degreeY",
  "sectionLabelXOffset",
  "sectionLabelY",
  "noteXOffset",
  "noteY",
  "noteHeight",
  "notePaddingX",
  "notePaddingY",
  "formX",
  "formY",
  "endingY",
  "endingStartX",
  "endingEndInset",
  "endingHookHeight",
  "jumpXOffset",
  "jumpY",
  "measureInnerPadding",
  "slotGap",
  "titleSize",
  "composerSize",
  "studentNameSize",
  "chordSize",
  "modeSize",
  "degreeSize",
  "sectionLabelSize",
  "formSize",
  "endingSize",
  "jumpSize",
  "noteSize",
  "pageNumberSize",
  "pageNumberY",
  "pageNumberXOffset",
  "systemMeasureNumberX",
  "systemMeasureNumberY",
  "systemMeasureNumberSize",
  "timeSignatureXOffset",
  "timeSignatureYOffset",
  "timeSignatureSize",
  "rhythmY",
  "rhythmSize",
  "rhythmStemHeight",
  "formPaddingX",
  "formPaddingY",
  "formRadius",
  "connectorXOffset",
  "connectorYOffset",
  "connectorStrokeWidth",
  "connectorCurveStartOffsetY",
  "connectorCurveEndOffsetY",
  "connectorCurveLift",
  "connectorArrowHeadSize",
  "connectorArrowTextGap",
  "connectorBracketOffsetY",
  "connectorBracketHookHeight",
  "connectorBracketSidePad"
]);

function scoreScale(settings = null) {
  const raw = Number(settings?.scoreScale ?? DEFAULT_SETTINGS.scoreScale ?? 1);
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return raw;
}

function scoreSettings(settings = null) {
  const source = settings || song?.settings || DEFAULT_SETTINGS;
  const scale = scoreScale(source);
  const scaled = { ...source };
  if (Math.abs(scale - 1) >= 0.0001) {
    SCORE_SCALE_KEYS.forEach(key => {
      const value = Number(source[key]);
      if (Number.isFinite(value)) scaled[key] = value * scale;
    });
  }
  applyRhythmAwareVerticalSpacing(scaled);
  return scaled;
}

function applyRhythmAwareVerticalSpacing(settings) {
  const rhythmTopReserve = Math.max(
    64,
    Math.abs(Number(settings.rhythmY || 0))
      + Number(settings.rhythmStemHeight || 0)
      + Number(settings.rhythmSize || 0) * 0.65
      + 14
  );
  const titleBottom = Number(settings.titleY || 0) + Number(settings.titleSize || 0) * 0.75;
  settings.headerHeight = Math.max(Number(settings.headerHeight || 0), titleBottom + rhythmTopReserve);

  const lowerContent = Math.max(
    Number(settings.noteY || 0) + Number(settings.noteSize || 0) * 1.2,
    Number(settings.degreeY || 0) + Number(settings.degreeSize || 0) * 1.15,
    Number(settings.sectionLabelY || 0) + Number(settings.sectionLabelSize || 0) * 1.1,
    Number(settings.measureLineY || 0) + Number(settings.barBottom || 0) + 18
  );
  const nextRhythmTop = Number(settings.rhythmY || 0)
    - Number(settings.rhythmStemHeight || 0)
    - Number(settings.rhythmSize || 0) * 0.65;
  const minSystemStep = lowerContent - nextRhythmTop + 16;
  const currentStep = Number(settings.systemHeight || 0) + Number(settings.systemGap || 0);
  if (currentStep < minSystemStep) {
    settings.systemGap = Math.max(Number(settings.systemGap || 0), minSystemStep - Number(settings.systemHeight || 0));
  }
}

const FONT_OPTIONS = [
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Palatino", value: "Palatino, 'Palatino Linotype', serif" },
  { label: "Baskerville", value: "Baskerville, 'Times New Roman', serif" },
  { label: "Hoefler Text", value: "'Hoefler Text', Georgia, serif" },
  { label: "Didot", value: "Didot, Georgia, serif" },
  { label: "Cochin", value: "Cochin, Georgia, serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Avenir Next", value: "'Avenir Next', Avenir, Helvetica, Arial, sans-serif" },
  { label: "Futura", value: "Futura, Helvetica, Arial, sans-serif" },
  { label: "Optima", value: "Optima, Helvetica, Arial, sans-serif" },
  { label: "Gill Sans", value: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Menlo", value: "Menlo, Monaco, Consolas, monospace" },
  { label: "Monaco", value: "Monaco, Menlo, Consolas, monospace" }
];

function getCurrentSettingsFallback(settingsObj = null) {
  if (settingsObj) return settingsObj;

  try {
    return song?.settings || DEFAULT_SETTINGS;
  } catch (_) {
    // Durante `let song = makeDemoSong()`, la variable global aún está
    // en zona temporal muerta. En ese momento usamos defaults.
    return DEFAULT_SETTINGS;
  }
}

function isDeltaMaj7Enabled(settingsObj = null) {
  const settings = getCurrentSettingsFallback(settingsObj);
  return settings?.deltaToMaj7 === true || settings?.deltaToMaj7 === "on";
}

function normalizeTextSymbols(value, settingsObj = null) {
  const settings = getCurrentSettingsFallback(settingsObj);
  let text = String(value ?? "")
    .replaceAll("𝄫", "bb")
    .replaceAll("♭", "b")
    .replaceAll("𝄪", "x")
    .replaceAll("♯", "#")
    .replaceAll("♮", "n");

  if (isDeltaMaj7Enabled(settings)) {
    text = text
      .replaceAll("∆", "maj7")
      .replaceAll("Δ", "maj7");
  }

  return text;
}

function normalizeAccidentals(value) {
  return normalizeTextSymbols(value);
}

function normalizeChordSymbolInput(value, settingsObj = null) {
  const text = normalizeTextSymbols(value || "", settingsObj).trim();
  if (!text || text === "%") return text;

  const [symbolPart, ...bassParts] = text.split("/");
  const bass = bassParts.length ? `/${bassParts.join("/")}` : "";
  const match = symbolPart.match(/^([A-G](?:bb|##|b|#)?)(.*)$/i);
  if (!match) return text;

  const root = match[1][0].toUpperCase() + match[1].slice(1);
  let suffix = match[2] || "";
  suffix = normalizeMinorMajorSuffixInput(suffix);
  suffix = suffix.replace(/^mmaj7/i, "m(maj7)");
  if (!/[()]/.test(suffix)) {
    suffix = suffix
      .replace(/^7(b9)(b13)$/i, "7($1)$2")
      .replace(/^7(#9)(b13)$/i, "7($1)$2")
      .replace(/^7(b9)(b5)$/i, "7($1)$2")
      .replace(/^7(b5)$/i, "7($1)")
      .replace(/^9(b5)$/i, "9($1)")
      .replace(/^9(b13)$/i, "9($1)")
      .replace(/^13(b9)$/i, "13($1)")
      .replace(/^7sus4(b9)$/i, "7sus4($1)")
      .replace(/^sus4add(b?2)$/i, "sus4(add$1)");
  }

  return `${root}${suffix}${bass}`;
}

function normalizeMinorMajorSuffixInput(value) {
  return String(value || "")
    .replace(/mmaj79/gi, "m(maj9)")
    .replace(/mmaj9/gi, "m(maj9)");
}

function normalizeDegreeInput(value, settingsObj = null) {
  return normalizeMinorMajorSuffixInput(normalizeTextSymbols(value || "", settingsObj)).trim();
}

function cleanTextInput(value) {
  return normalizeTextSymbols(value).trim();
}

function normalizeTimeSignature(value) {
  const cleaned = normalizeTextSymbols(value || "")
    .trim()
    .replace(/\s+/g, "");

  if (/^\d+\/\d+$/.test(cleaned)) return cleaned;
  if (/^\d+$/.test(cleaned)) return `${cleaned}/4`;
  return cleaned || "4/4";
}

function quoteCssFamily(name) {
  const clean = String(name || "Local Font")
    .replace(/[\\"]/g, "")
    .replace(/[\u0000-\u001f\u007f<>;{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90) || "Local Font";
  return `"${clean}"`;
}

function safeCssFamilyValue(value, fallback = "Local Font") {
  const raw = String(value || "").trim();
  if (/^"[^"\n\r<>;{}]{1,100}"$/.test(raw)) return raw;
  return quoteCssFamily(fallback);
}

function isSafeFontDataUrl(value) {
  const dataUrl = String(value || "");
  return /^data:(font\/(?:otf|ttf|woff|woff2)|application\/(?:font-woff|font-woff2|x-font-ttf|x-font-otf|x-font-woff|octet-stream));base64,[a-z0-9+/=\s]+$/i.test(dataUrl);
}

function localFontNameFromFile(filename) {
  return String(filename || "Local Font")
    .replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/i, "")
    .replace(/[_-]+/g, " ")
    .trim() || "Local Font";
}

function getFontOptions() {
  const imported = Array.isArray(song?.settings?.localFonts)
    ? song.settings.localFonts.map(font => ({
        label: `Importada: ${font.name}`,
        value: safeCssFamilyValue(font.cssFamily, font.name)
      }))
    : [];

  const system = Array.isArray(song?.settings?.systemFonts)
    ? song.settings.systemFonts.map(font => ({
        label: `Sistema: ${font.family}`,
        value: safeCssFamilyValue(font.cssFamily, font.family)
      }))
    : [];

  const seen = new Set();
  return [...FONT_OPTIONS, ...system, ...imported].filter(option => {
    const key = option.value;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function registerLocalFonts() {
  const fonts = Array.isArray(song?.settings?.localFonts) ? song.settings.localFonts : [];

  for (const font of fonts) {
    if (!font?.name || !font?.dataUrl) continue;
    if (!isSafeFontDataUrl(font.dataUrl)) continue;
    if (font._registered) continue;

    try {
      const face = new FontFace(font.name, `url(${font.dataUrl})`);
      await face.load();
      document.fonts.add(face);
      font._registered = true;
    } catch (error) {
      console.warn(`No se pudo cargar la fuente local ${font.name}`, error);
    }
  }
}

function localFontCss() {
  const fonts = Array.isArray(song?.settings?.localFonts) ? song.settings.localFonts : [];
  return fonts
    .filter(font => font?.name && font?.dataUrl && isSafeFontDataUrl(font.dataUrl))
    .map(font => `@font-face { font-family: ${quoteCssFamily(font.name)}; src: url(${font.dataUrl}); font-display: swap; }`)
    .join("\n");
}

function packagedFontCss() {
  return [
    '@font-face { font-family: "Ink Free"; src: url("./assets/fonts/Inkfree.ttf") format("truetype"); font-display: swap; }',
    '@font-face { font-family: "ATA Condensed"; src: local("Avenir Next Condensed"), local("Arial Narrow"), url("./assets/fonts/Avenir-Next-Condensed.ttc"); font-display: swap; }',
    '@font-face { font-family: "MTF Improviso"; src: url("./assets/fonts/MTF-Improviso.otf") format("opentype"); font-display: swap; }'
  ].join("\n");
}

const SETTINGS_SECTIONS = [
  {
    title: "Documento y página",
    items: [
      ["orientation", "Orientación", "select", ["landscape", "portrait"]],
      ["pageWidth", "Ancho de página", "number"],
      ["pageHeight", "Alto de página", "number"],
      ["scoreScale", "Escala global de partitura", "number", null, 0.01],
      ["pageBackground", "Color del papel", "color"],
      ["showPageNumbers", "Mostrar número de página", "select", ["false", "true"]],
      ["pageNumberXOffset", "Número de página offset X", "number"],
      ["pageNumberY", "Número de página distancia superior", "number"],
      ["showSystemMeasureNumbers", "Mostrar números de compás por sistema", "select", ["false", "true"]],
      ["systemMeasureNumberX", "Números de compás X", "number"],
      ["systemMeasureNumberY", "Números de compás Y", "number"],
      ["timeSignatureXOffset", "Signatura de medida X", "number"],
      ["timeSignatureYOffset", "Signatura de medida Y", "number"],
      ["marginLeft", "Margen izquierdo", "number"],
      ["marginRight", "Margen derecho", "number"],
      ["marginTop", "Margen superior", "number"],
      ["marginBottom", "Margen inferior", "number"],
      ["headerHeight", "Altura del encabezado", "number"],
      ["measuresPerSystem", "Compases por sistema", "number"],
      ["systemsPerPage", "Sistemas por página", "number"]
    ]
  },
  {
    title: "Sistemas, compases y líneas",
    items: [
      ["systemHeight", "Alto del sistema", "number"],
      ["dynamicSystemGap", "Separación entre sistemas", "number"],
      ["measureLineY", "Posición línea central", "number"],
      ["barTop", "Inicio vertical de barras", "number"],
      ["barBottom", "Fin vertical de barras", "number"],
      ["measureInnerPadding", "Padding interno compás", "number"],
      ["slotGap", "Separación mínima entre acordes", "number"],
      ["minMeasureWidthRatio", "Ancho mínimo compás", "number", null, 0.01],
      ["minTextScale", "Escala mínima automática", "number", null, 0.01]
    ]
  },
  {
    title: "Posiciones de texto y símbolos",
    items: [
      ["titleX", "Título X relativo", "number", null, 0.01],
      ["titleY", "Título Y", "number"],
      ["composerX", "Compositor X relativo", "number", null, 0.01],
      ["composerY", "Compositor Y", "number"],
      ["studentNameX", "Nombre estudiante X", "number"],
      ["studentNameY", "Nombre estudiante Y", "number"],
      ["studentNameWidth", "Nombre estudiante ancho", "number"],
      ["chordXOffset", "Acordes offset X", "number"],
      ["chordY", "Acordes Y", "number"],
      ["modeXOffset", "Modos offset X", "number"],
      ["modeY", "Modos Y", "number"],
      ["degreeXOffset", "Grados offset X", "number"],
      ["degreeY", "Grados Y", "number"],
      ["sectionLabelXOffset", "Tonalidad offset X", "number"],
      ["sectionLabelY", "Tonalidad Y", "number"],
      ["noteXOffset", "Escala de origen offset X", "number"],
      ["noteY", "Escala de origen Y", "number"],
      ["noteHeight", "Escala de origen alto de área", "number"],
      ["notePaddingX", "Escala de origen padding X", "number"],
      ["notePaddingY", "Escala de origen padding Y", "number"],
      ["formX", "Marca de forma X", "number"],
      ["formY", "Marca de forma Y", "number"],
      ["endingY", "Casilla Y", "number"],
      ["endingStartX", "Casilla inicio X", "number"],
      ["endingEndInset", "Casilla fin inset", "number"],
      ["endingHookHeight", "Casilla alto gancho", "number"],
      ["jumpXOffset", "Saltos offset X", "number"],
      ["jumpY", "Saltos Y", "number"]
    ]
  },
  {
    title: "Fuentes",
    items: [
      ["titleFont", "Fuente título", "font"],
      ["composerFont", "Fuente compositor", "font"],
      ["studentNameFont", "Fuente nombre estudiante", "font"],
      ["chordFont", "Fuente acordes", "font"],
      ["modeFont", "Fuente modos", "font"],
      ["degreeFont", "Fuente grados", "font"],
      ["sectionLabelFont", "Fuente tonalidad", "font"],
      ["formFont", "Fuente marcas de forma", "font"],
      ["noteFont", "Fuente escala de origen", "font"],
      ["pageNumberFont", "Fuente números de página", "font"],
      ["systemMeasureNumberFont", "Fuente números de compás", "font"],
      ["timeSignatureFont", "Fuente signatura de medida", "font"],
      ["titleSize", "Tamaño título", "number"],
      ["composerSize", "Tamaño compositor", "number"],
      ["studentNameSize", "Tamaño nombre estudiante", "number"],
      ["chordSize", "Tamaño acordes", "number"],
      ["modeSize", "Tamaño modos", "number"],
      ["degreeSize", "Tamaño grados", "number"],
      ["sectionLabelSize", "Tamaño tonalidad", "number"],
      ["formSize", "Tamaño marcas de forma", "number"],
      ["endingSize", "Tamaño casillas", "number"],
      ["jumpSize", "Tamaño saltos", "number"],
      ["noteSize", "Tamaño escala de origen", "number"],
      ["pageNumberSize", "Tamaño números de página", "number"],
      ["systemMeasureNumberSize", "Tamaño números de compás", "number"],
      ["timeSignatureSize", "Tamaño signatura de medida", "number"],
      ["rhythmY", "Ritmo Y", "number"],
      ["rhythmSize", "Tamaño ritmo", "number"],
      ["rhythmStemHeight", "Altura plica ritmo", "number"],
      ["titleWeight", "Peso título", "number"],
      ["composerWeight", "Peso compositor", "number"],
      ["studentNameWeight", "Peso nombre estudiante", "number"],
      ["chordWeight", "Peso acordes", "number"],
      ["modeWeight", "Peso modos", "number"],
      ["degreeWeight", "Peso grados", "number"],
      ["sectionLabelWeight", "Peso tonalidad", "number"],
      ["formWeight", "Peso marcas de forma", "number"],
      ["noteWeight", "Peso escala de origen", "number"],
      ["pageNumberWeight", "Peso números de página", "number"],
      ["systemMeasureNumberWeight", "Peso números de compás", "number"],
      ["timeSignatureWeight", "Peso signatura de medida", "number"],
      ["titleCase", "Capitalización título", "select", ["upper", "normal"]],
      ["composerCase", "Capitalización compositor", "select", ["upper", "normal"]],
      ["deltaToMaj7", "Normalizar ∆ como maj7", "select", ["off", "on"]]
    ]
  },
  {
    title: "Marcas de forma, casillas y barras",
    items: [
      ["formPaddingX", "Padding X marcas", "number"],
      ["formPaddingY", "Padding Y marcas", "number"],
      ["formRadius", "Radio marcas", "number"],
      ["endingStartX", "Casilla inicio X", "number"],
      ["endingEndInset", "Casilla fin inset", "number"],
      ["endingHookHeight", "Casilla alto gancho", "number"],
      ["barTop", "Barras inicio Y", "number"],
      ["barBottom", "Barras fin Y", "number"]
    ]
  },
  {
    title: "Conectores",
    items: [
      ["connectorXOffset", "Conectores offset X", "number"],
      ["connectorYOffset", "Conectores offset Y", "number"],
      ["connectorStrokeWidth", "Grosor línea", "number", null, 0.1],
      ["connectorCurveStartOffsetY", "Flecha offset inicial Y", "number"],
      ["connectorCurveEndOffsetY", "Flecha offset final Y", "number"],
      ["connectorCurveLift", "Flecha altura curva", "number"],
      ["connectorArrowHeadSize", "Flecha tamaño punta", "number", null, 0.5],
      ["connectorArrowTextGap", "Flecha separación al cifrado", "number", null, 0.5],
      ["connectorBracketOffsetY", "Corchete separación vertical", "number"],
      ["connectorBracketHookHeight", "Corchete altura palitos", "number"],
      ["connectorBracketSidePad", "Corchete apertura lateral", "number"]
    ]
  },
  {
    title: "Colores",
    items: [
      ["inkColor", "Color líneas", "color"],
      ["chordColor", "Color acordes", "color"],
      ["modeColor", "Color modos", "color"],
      ["degreeColor", "Color grados", "color"],
      ["sectionLabelColor", "Color tonalidad", "color"],
      ["arrowColor", "Color conectores", "color"],
      ["guideColor", "Color guías", "color"],
      ["selectedColor", "Color selección", "color"],
      ["noteColor", "Color escala de origen", "color"],
      ["noteBoxColor", "Color caja escala de origen", "color"],
      ["pageNumberColor", "Color números de página", "color"],
      ["systemMeasureNumberColor", "Color números de compás", "color"],
      ["timeSignatureColor", "Color signatura de medida", "color"],
      ["rhythmColor", "Color ritmo", "color"],
      ["studentNameColor", "Color nombre estudiante", "color"]
    ]
  }
];

const els = {
  pages: document.getElementById("pages"),
  status: document.getElementById("status"),
  newBtn: document.getElementById("newBtn"),
  undoBtn: document.getElementById("undoBtn"),
  redoBtn: document.getElementById("redoBtn"),
  globalRespaceBtn: document.getElementById("globalRespaceBtn"),
  saveBtn: document.getElementById("saveBtn"),
  duplicateSongBtn: document.getElementById("duplicateSongBtn"),
  blankSongDialog: document.getElementById("blankSongDialog"),
  blankSongWarning: document.getElementById("blankSongWarning"),
  blankMeasureCountInput: document.getElementById("blankMeasureCountInput"),
  blankSongApplyBtn: document.getElementById("blankSongApplyBtn"),
  openLibraryBtn: document.getElementById("openLibraryBtn"),
  downloadJsonBtn: document.getElementById("downloadJsonBtn"),
  fileInput: document.getElementById("fileInput"),
  importTextBtn: document.getElementById("importTextBtn"),
  addMeasureBtn: document.getElementById("addMeasureBtn"),
  removeLastMeasureBtn: document.getElementById("removeLastMeasureBtn"),
  removeUnusedMeasuresBtn: document.getElementById("removeUnusedMeasuresBtn"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  exportPngBtn: document.getElementById("exportPngBtn"),
  exportSvgBtn: document.getElementById("exportSvgBtn"),
  adminSaveThemeBtn: document.getElementById("adminSaveThemeBtn"),
  adminThemeSelect: document.getElementById("adminThemeSelect"),
  adminSaveEngineExampleBtn: document.getElementById("adminSaveEngineExampleBtn"),
  adminReloadEngineExamplesBtn: document.getElementById("adminReloadEngineExamplesBtn"),
  adminOpenAppearanceBtn: document.getElementById("adminOpenAppearanceBtn"),
  adminSaveAppearanceBtn: document.getElementById("adminSaveAppearanceBtn"),
  adminPanel: document.getElementById("adminPanel"),
  adminCloseBtn: document.getElementById("adminCloseBtn"),
  adminKeyInput: document.getElementById("adminKeyInput"),
  adminExampleNameInput: document.getElementById("adminExampleNameInput"),
  adminPanelSaveEngineExampleBtn: document.getElementById("adminPanelSaveEngineExampleBtn"),
  adminPanelReloadEngineExamplesBtn: document.getElementById("adminPanelReloadEngineExamplesBtn"),
  adminPanelOpenAppearanceBtn: document.getElementById("adminPanelOpenAppearanceBtn"),
  adminPanelSaveAppearanceBtn: document.getElementById("adminPanelSaveAppearanceBtn"),
  adminPanelStatus: document.getElementById("adminPanelStatus"),
  measureCountPanel: document.getElementById("measureCountPanel"),
  measureCountCloseBtn: document.getElementById("measureCountCloseBtn"),
  measureCountInput: document.getElementById("measureCountInput"),
  measureCountApplyBtn: document.getElementById("measureCountApplyBtn"),
  measureCountStatus: document.getElementById("measureCountStatus"),
  clearFieldsBtn: document.getElementById("clearFieldsBtn"),
  clearFieldsDialog: document.getElementById("clearFieldsDialog"),
  clearFieldsSelect: document.getElementById("clearFieldsSelect"),
  clearFieldsApplyBtn: document.getElementById("clearFieldsApplyBtn"),
  assistanceModeSelect: document.getElementById("assistanceModeSelect"),
  analysisVisibilitySelect: document.getElementById("analysisVisibilitySelect"),
  toggleAnalysisVisibilityBtn: document.getElementById("toggleAnalysisVisibilityBtn"),
  toggleAssistanceModeBtn: document.getElementById("toggleAssistanceModeBtn"),
  chordDetailModeSelect: document.getElementById("chordDetailModeSelect"),
  autoAnalyzeBtn: document.getElementById("autoAnalyzeBtn"),
  evaluateAnalysisBtn: document.getElementById("evaluateAnalysisBtn"),
  randomReharmBtn: document.getElementById("randomReharmBtn"),
  randomReharmDialog: document.getElementById("randomReharmDialog"),
  randomReharmDensityInput: document.getElementById("randomReharmDensityInput"),
  randomReharmDensityValue: document.getElementById("randomReharmDensityValue"),
  randomReharmSeedInput: document.getElementById("randomReharmSeedInput"),
  randomReharmWeights: document.getElementById("randomReharmWeights"),
  randomReharmPreviewBtn: document.getElementById("randomReharmPreviewBtn"),
  randomReharmVariationBtn: document.getElementById("randomReharmVariationBtn"),
  randomReharmApplyBtn: document.getElementById("randomReharmApplyBtn"),
  randomReharmPreview: document.getElementById("randomReharmPreview"),
  openAboutBtn: document.getElementById("openAboutBtn"),
  aboutDialog: document.getElementById("aboutDialog"),
  aboutPrintContent: document.getElementById("aboutPrintContent"),
  printAboutBtn: document.getElementById("printAboutBtn"),
  openTheoryBtn: document.getElementById("openTheoryBtn"),
  theoryDialog: document.getElementById("theoryDialog"),
  theorySearchInput: document.getElementById("theorySearchInput"),
  theoryCardList: document.getElementById("theoryCardList"),
  theoryCardContent: document.getElementById("theoryCardContent"),
  theoryCardMeta: document.getElementById("theoryCardMeta"),
  prevTheoryCardBtn: document.getElementById("prevTheoryCardBtn"),
  nextTheoryCardBtn: document.getElementById("nextTheoryCardBtn"),
  printTheoryCardBtn: document.getElementById("printTheoryCardBtn"),
  autoFormSelect: document.getElementById("autoFormSelect"),
  toggleSettingsBtn: document.getElementById("toggleSettingsBtn"),
  editFormBtn: document.getElementById("editFormBtn"),
  editEndingBtn: document.getElementById("editEndingBtn"),
  editJumpBtn: document.getElementById("editJumpBtn"),
  barSimpleBtn: document.getElementById("barSimpleBtn"),
  barDoubleBtn: document.getElementById("barDoubleBtn"),
  barFinalBtn: document.getElementById("barFinalBtn"),
  barRepeatStartBtn: document.getElementById("barRepeatStartBtn"),
  barRepeatEndBtn: document.getElementById("barRepeatEndBtn"),
  connCurveBtn: document.getElementById("connCurveBtn"),
  connCurveDashedBtn: document.getElementById("connCurveDashedBtn"),
  connBracketBtn: document.getElementById("connBracketBtn"),
  connBracketDashedBtn: document.getElementById("connBracketDashedBtn"),
  thirdChordPosBtn: document.getElementById("thirdChordPosBtn"),
  settingsPanel: document.getElementById("settingsPanel"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  settingsForm: document.getElementById("settingsForm"),
  quickAppearance: document.getElementById("quickAppearance"),
  settingsSearchInput: document.getElementById("settingsSearchInput"),
  resetAppearanceBtn: document.getElementById("resetAppearanceBtn"),
  localFontInput: document.getElementById("localFontInput"),
  scanSystemFontsBtn: document.getElementById("scanSystemFontsBtn"),
  systemFontsStatus: document.getElementById("systemFontsStatus"),
  localFontsList: document.getElementById("localFontsList"),
  measurePanel: document.getElementById("measurePanel"),
  measurePanelTitle: document.getElementById("measurePanelTitle"),
  closeMeasurePanelBtn: document.getElementById("closeMeasurePanelBtn"),
  measureFormInput: document.getElementById("measureFormInput"),
  measureEndingInput: document.getElementById("measureEndingInput"),
  measureJumpInput: document.getElementById("measureJumpInput"),
  measureLeftBarInput: document.getElementById("measureLeftBarInput"),
  measureRightBarInput: document.getElementById("measureRightBarInput"),
  slotsEditor: document.getElementById("slotsEditor"),
  clearMeasureBtn: document.getElementById("clearMeasureBtn"),
  compactMeasureBtn: document.getElementById("compactMeasureBtn"),
  libraryDialog: document.getElementById("libraryDialog"),
  libraryList: document.getElementById("libraryList"),
  librarySearchInput: document.getElementById("librarySearchInput"),
  libraryCount: document.getElementById("libraryCount"),
  normalizeLibraryNamesBtn: document.getElementById("normalizeLibraryNamesBtn"),
  standardsList: document.getElementById("standardsList"),
  curatedStandardsList: document.getElementById("curatedStandardsList"),
  standardSearchInput: document.getElementById("standardSearchInput"),
  standardsCount: document.getElementById("standardsCount"),
  copySaveDialog: document.getElementById("copySaveDialog"),
  copySaveNameInput: document.getElementById("copySaveNameInput"),
  copySaveDestinationSelect: document.getElementById("copySaveDestinationSelect"),
  copySaveDestinationHint: document.getElementById("copySaveDestinationHint"),
  copySaveApplyBtn: document.getElementById("copySaveApplyBtn"),
  textImportDialog: document.getElementById("textImportDialog"),
  textImportWarning: document.getElementById("textImportWarning"),
  textImportTitleInput: document.getElementById("textImportTitleInput"),
  textImportInput: document.getElementById("textImportInput"),
  textImportApplyBtn: document.getElementById("textImportApplyBtn"),
  inlineEditor: document.getElementById("inlineEditor"),
  degreeSuggestionMenu: document.getElementById("degreeSuggestionMenu"),
  reharmonizationMenu: document.getElementById("reharmonizationMenu"),
  inlineTextarea: document.getElementById("inlineTextarea"),
  canvasTooltip: document.getElementById("canvasTooltip"),
  rhythmPaletteBar: document.getElementById("rhythmPaletteBar"),
  rhythmPaletteStatus: document.getElementById("rhythmPaletteStatus")
};

const IS_STUDENT_MODE = window.ATA_STUDENT_MODE === true;
let song = makeDemoSong();
let currentFilename = null;
let dirty = false;
let selected = { page: 0, measure: 0 };
let selectedSlot = 0;
let selectedConnector = null;
let selectedRhythm = { page: 0, measure: 0, sources: [], sourceKeys: [], tuplets: [], openTuplet: null, insertPosition: null, entryMode: null, slashCycleTarget: null };
let rhythmSlashCycleIndex = 0;
let rhythmEditingActive = false;
let inlineContext = null;
let assistanceMode = "assisted";
let analysisVisibility = "visible";
let chordDetailMode = "basic";
let evaluationIssues = new Map();
let historyStack = [];
let redoStack = [];
let isRestoringState = false;
let adminEngineExamples = [];
let savedLibraryIndex = [];
let standardsIndex = [];
let currentStandardFilename = null;
let currentStandardSource = null;
let randomReharmProposals = [];
let randomReharmPreviewTimer = null;
let randomReharmSessionSeed = "";
let selectedTheoryCardId = "";
const ADMIN_ACCESS_KEY = "ATA";
const LAST_OPEN_DOCUMENT_KEY = "analizador-armonico:last-open-document";

function normalizeTextForSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const BLUES_STANDARD_ITEMS = [
  { kind: "blues", id: "blues-simple", title: "Blues simple", composer: "ATA", rhythm: "Estudio / Blues", timeSignature: "4/4" },
  { kind: "blues", id: "jazz-blues", title: "Jazz blues", composer: "ATA", rhythm: "Estudio / Blues", timeSignature: "4/4" },
  { kind: "blues", id: "bird-blues", title: "Bird blues", composer: "ATA", rhythm: "Estudio / Blues", timeSignature: "4/4" },
  { kind: "blues", id: "minor-blues", title: "Minor blues", composer: "ATA", rhythm: "Estudio / Blues", timeSignature: "4/4" }
];
const BLUES_STANDARD_BY_TITLE = new Map(BLUES_STANDARD_ITEMS.map(item => [
  normalizeTextForSearch(item.title),
  item
]));

function bluesStandardFilename(key) {
  return `${key}.json`;
}

function inferCurrentBuiltInBluesFilename() {
  if (currentFilename || currentStandardFilename) return null;
  const item = BLUES_STANDARD_BY_TITLE.get(normalizeTextForSearch(song?.title || ""));
  return item ? bluesStandardFilename(item.id) : null;
}

function titleCaseDisplay(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-zA-Z0-9 .]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const RANDOM_REHARM_TECHNIQUES = [
  {
    id: "simple",
    label: "Sustitución simple",
    defaultWeight: 25,
    families: ["simple-substitution", "secondary-region"]
  },
  {
    id: "tritone",
    label: "Tritonos / Vsub",
    defaultWeight: 40,
    families: ["tritone-substitution", "major-tritone-substitution", "tritone-color"]
  },
  {
    id: "relativeTwo",
    label: "II relativos",
    defaultWeight: 45,
    families: ["relative-two", "relative-two-minor", "relative-two-sub", "preparatory-two", "preparatory-two-sub", "preparatory-two-backdoor", "cadential-two"]
  },
  {
    id: "backdoor",
    label: "Backdoor",
    defaultWeight: 20,
    families: ["backdoor"]
  },
  {
    id: "modal",
    label: "Intercambio modal",
    defaultWeight: 25,
    families: ["modal-interchange", "parallel-modal-interchange", "secondary-region-modal"]
  },
  {
    id: "diminished",
    label: "Disminuidos",
    defaultWeight: 12,
    families: ["chromatic-diminished"]
  },
  {
    id: "color",
    label: "Colores / extensiones",
    defaultWeight: 15,
    families: ["same-root-color", "dominant-color"]
  }
];

const THEORY_CARDS = [
  {
    id: "escalas-tonales",
    title: "Las cuatro escalas tonales",
    category: "Sistema ATA",
    summary: "Acordes básicos y extendidos de las escalas tonales.",
    sections: [
      {
        heading: "Idea central",
        body: [
          "El ATA organiza el análisis tonal a partir de cuatro escalas tonales: mayor, mayor armónica, menor armónica y menor melódica. Cada escala produce grados, cualidades, extensiones y nombres modales específicos."
        ]
      },
      {
        heading: "Acordes básicos en C",
        table: {
          headers: ["Escala", "I", "II", "III", "IV", "V", "VI", "VII"],
          rows: [
            ["C mayor", "C∆", "Dm7", "Em7", "F∆", "G7", "Am7", "Bø"],
            ["C mayor arm.", "C+∆", "Dø", "E7", "Fm∆", "G7", "Ab+∆", "B°7"],
            ["Cm arm.", "Cm∆", "Dø", "Eb+∆", "Fm7/Fm6", "G7", "Ab∆", "B°7"],
            ["Cm mel.", "Cm6", "D7sus4", "Eb∆(b5)", "F7(b5)", "G7", "Aø", "B+7"]
          ]
        }
      },
      {
        heading: "Acordes extendidos en C",
        table: {
          headers: ["Escala", "I", "II", "III", "IV", "V", "VI", "VII"],
          rows: [
            ["C mayor", "C∆13", "Dm9", "Em11", "F∆13", "G13", "Am9", "Bø11"],
            ["C mayor arm.", "C+∆9", "Dø9", "E7(#9)b13", "Fm∆9", "G13(b9)", "Ab+∆#9", "B°7"],
            ["Cm arm.", "Cm∆11", "Dø11", "Eb+∆9", "Fm9/Fm6(9)", "G7(b9)b13", "Ab∆9", "B°7"],
            ["Cm mel.", "Cm6(9)", "D7sus4(b9)", "Eb∆(b5)", "F9(#11)", "G9(b13)", "Aø9", "B7alt"]
          ]
        }
      },
      {
        heading: "Acordes suspendidos en C",
        table: {
          headers: ["Escala", "Sin extensiones", "Con extensiones"],
          rows: [
            ["C mayor", "Csus4, D7sus4, E7sus4, Fsus2, G7sus4, A7sus4", "C6sus4, D9sus4, E7sus4, F6sus2, G13sus4, A9sus4"],
            ["C mayor arm.", "Gsus4(addb2)", "G7sus4(b9)"],
            ["Cm arm.", "Csus4, Gsus4(addb2), Absus4", "Csus4(add2), G7sus4(b9), Ab6sus4"],
            ["Cm mel.", "Csus4, Dsus4(addb2), G7sus4", "Csus4(addb2), D7sus4(b9), G9sus4(b13)"]
          ]
        }
      }
      ,
      {
        heading: "Aclaración sobre el IV menor",
        body: [
          "En la escala menor armónica, el IVm se entiende como un acorde menor con séptima menor: en Cm arm. es Fm7. También puede escribirse como Fm6, porque la sexta natural pertenece al modo Dórico #4 de ese grado."
        ]
      }
    ]
  },
  {
    id: "grados",
    title: "Análisis por grados",
    category: "Grados",
    summary: "Cómo leer grados, alteraciones y regiones secundarias.",
    sections: [
      {
        heading: "Grado y contexto",
        body: [
          "El grado siempre se calcula contra la tonalidad indicada. F∆ en F:[ es I∆; el mismo F∆ en Dm:[ es III∆. Por eso las marcas de tonalidad y los grados deben coincidir."
        ]
      },
      {
        heading: "Alteraciones en mayor y menor",
        table: {
          headers: ["Contexto", "Diatónicos", "Alteraciones típicas"],
          rows: [
            ["C mayor", "C D E F G A B = I II III IV V VI VII", "Db = bII, Eb = bIII, F# = #IV, G# = #V, Ab = bVI, Bb = bVII"],
            ["C menor", "C D Eb F G Ab Bb = I II III IV V VI VII", "Db = bII, E = #III, F# = #IV, A = #VI, B = #VII"]
          ]
        }
      },
      {
        heading: "Regiones secundarias",
        body: [
          "La barra indica una región pasajera: V7/II significa dominante del II; IIm7sub/VI significa segundo relativo del sustituto tritonal que conduce hacia la región del VI."
        ]
      }
    ]
  },
  {
    id: "modos",
    title: "Nombre de los modos",
    category: "Modos",
    summary: "El modo debe corresponder al grado analizado.",
    sections: [
      {
        heading: "Regla práctica",
        body: [
          "El nombre del modo debe salir del grado y de la escala de origen. Un IIm7 es dórico, un IIIm7 es frigio y un VIm7 es eólico. Esto aplica también en regiones secundarias."
        ]
      },
      {
        heading: "Orden modal",
        table: {
          headers: ["Escala", "Modos"],
          rows: [
            ["Mayor", "Jónico, Dórico, Frigio, Lidio, Mixolidio, Eólico, Locrio"],
            ["Mayor armónica", "Jónico b6, Locrio #2#6, Mixo b2#2b6 no 4, Dórico #4#7, Mixolidio b2, Lidio aumentado #2, Locrio b7"],
            ["Menor armónica", "Eólico #7, Locrio #6, Jónico aumentado, Dórico #4, Mixo b2b6, Lidio #2, Locrio b4b7"],
            ["Menor melódica", "Dórico #7, Dórico b2, Lidio aumentado, Lidio dominante, Mixolidio b6, Locrio #2, Mixo alterado"]
          ]
        }
      }
    ]
  },
  {
    id: "dominantes",
    title: "Dominantes secundarias",
    category: "Rearmonización",
    summary: "V7/x y II-V/x antes de un acorde objetivo.",
    sections: [
      {
        heading: "Uso",
        body: [
          "Una dominante secundaria puede ir antes de cualquier acorde objetivo, excepto acordes °7 u ø. Puede aparecer sola o acompañada de su II relativo."
        ]
      },
      {
        heading: "Mayor o menor",
        body: [
          "Si el objetivo es menor, el V7 aislado suele venir de la escala menor armónica del objetivo. Si aparece un II-V del tipo m7-7, se analiza mejor como región mayor: Dm7 G7 hacia Cm puede funcionar como dórico-mixolidio."
        ]
      },
      {
        heading: "Ejemplos",
        examples: [
          ["C:[ Dm7 G7 C∆", "IIm7 V7 I∆"],
          ["C:[ Eø A7 Dm", "IIø/II V7/II IIm"],
          ["F:[ Am7 D7 Gm7", "IIIm7 V7/II IIm7"]
        ]
      }
    ]
  },
  {
    id: "tritonos",
    title: "Sustitutos tritonales",
    category: "Rearmonización",
    summary: "Vsub, IIsub-Vsub y resoluciones por semitono.",
    sections: [
      {
        heading: "Principio",
        body: [
          "Un dominante puede ser reemplazado por otro dominante a distancia de tritono. En C mayor, G7 puede reemplazarse por Db7. Ese Vsub suele resolver medio tono abajo."
        ]
      },
      {
        heading: "Segundos relativos",
        body: [
          "Antes de un Vsub puede aparecer su II relativo: Abm7 Db7 C∆. También puede haber un II de la tonalidad principal antes del Vsub: Dm7 Db7 C∆."
        ]
      },
      {
        heading: "Variante maj7",
        body: [
          "En algunos contextos el sustituto puede aparecer como acorde mayor: Dm7 Db∆ C∆. Se entiende como color de sustitución hacia el objetivo."
        ]
      }
    ]
  },
  {
    id: "backdoor",
    title: "Backdoor",
    category: "Rearmonización",
    summary: "Una preparación subdominante que entra por bVII.",
    sections: [
      {
        heading: "Definición",
        body: [
          "El backdoor prepara un objetivo con un movimiento desde la región de bVII. En C puede aparecer como Fm7 Bb7 C∆. No debe confundirse automáticamente con modulación."
        ]
      },
      {
        heading: "Notación ATA",
        examples: [
          ["C:[ Fm7 Bb7 C∆", "IIm7bck.dr V7bck.dr I∆"],
          ["G:[ Cm7 F7 G∆", "IIm7bck.dr V7bck.dr I∆"]
        ]
      }
    ]
  },
  {
    id: "intercambio-modal",
    title: "Intercambio modal",
    category: "Rearmonización",
    summary: "Mismo grado tomado de una escala paralela.",
    sections: [
      {
        heading: "Definición",
        body: [
          "El intercambio modal reemplaza un acorde por otro del mismo grado, tomado de otra escala paralela. Las escalas paralelas comparten fundamental."
        ]
      },
      {
        heading: "Prioridades",
        table: {
          headers: ["Tonalidad", "Escalas paralelas principales"],
          rows: [
            ["Mayor", "Mayor natural, eólica, mayor armónica, frigia"],
            ["Menor", "Menor natural, menor armónica, menor melódica, mayor"]
          ]
        }
      },
      {
        heading: "Grados paralelos en C",
        table: {
          headers: ["Grado", "C mayor", "C eólica", "C mayor arm.", "C frigia", "Cm arm.", "Cm mel."],
          rows: [
            ["I", "C∆", "Cm7", "C+∆", "Cm7", "Cm∆", "Cm6"],
            ["II", "Dm7", "Dø", "Dø", "Db∆", "Dø", "D7sus4"],
            ["III", "Em7", "Eb∆", "E7", "Eb∆", "Eb+∆", "Eb∆(b5)"],
            ["IV", "F∆", "Fm7", "Fm∆", "Fm7", "Fm7", "F7(b5)"],
            ["V", "G7", "Gm7", "G7", "Gø", "G7", "G7"],
            ["VI", "Am7", "Ab∆", "Ab+∆", "Ab∆", "Ab∆", "Aø"],
            ["VII", "Bø", "Bb7", "B°7", "Bb∆", "B°7", "B+7"]
          ]
        }
      },
      {
        heading: "Suspendidos como intercambio modal",
        table: {
          headers: ["Centro", "Escala paralela", "Grados sus disponibles"],
          rows: [
            ["C mayor", "Mayor natural", "I: Csus4/C6sus4, II: D7sus4/D9sus4, III: E7sus4, IV: Fsus2/F6sus2, V: G7sus4/G13sus4, VI: A7sus4/A9sus4"],
            ["C mayor", "Mayor armónica", "V: Gsus4(addb2)/G7sus4(b9)"],
            ["C menor", "Menor armónica", "I: Csus4/Csus4(add2), V: Gsus4(addb2)/G7sus4(b9), VI: Absus4/Ab6sus4"],
            ["C menor", "Menor melódica", "I: Csus4/Csus4(addb2), II: Dsus4(addb2)/D7sus4(b9), V: G7sus4/G9sus4(b13)"]
          ]
        }
      },
      {
        heading: "Ejemplo",
        body: [
          "En C mayor, Fm7 puede leerse como IVm7 tomado de una escala paralela menor, no necesariamente como modulación."
        ]
      }
    ]
  },
  {
    id: "disminuidos",
    title: "Acordes disminuidos",
    category: "Escalas y función",
    summary: "VII°7, #VII°7 y disminuidos de aproximación.",
    sections: [
      {
        heading: "Función",
        body: [
          "Los disminuidos pueden funcionar como sensibles, dominantes incompletos o acordes de aproximación. Un °7 que resuelve medio tono abajo puede indicar bII°7/."
        ]
      },
      {
        heading: "Escalas de origen",
        body: [
          "Si el °7 es VII°7 de un mayor, pertenece a la escala mayor armónica. Si es #VII°7 de un menor, pertenece a la escala menor armónica."
        ]
      },
      {
        heading: "Escalas simétricas",
        body: [
          "Para acordes °7 puede usarse disminuida WH. Para acordes 7(b5), 7(b9)b5, 13(b9) y 13(#11), puede aparecer HW. Para 7(b5), +7, +9 o 9(b5), puede aparecer escala por tonos."
        ]
      }
    ]
  },
  {
    id: "conectores",
    title: "Conectores",
    category: "Notación",
    summary: "Flechas, flechas punteadas, corchetes y saltos.",
    sections: [
      {
        heading: "Flechas",
        body: [
          "La flecha normal aparece cuando un X7 resuelve a una fundamental cinco semitonos arriba, por ejemplo G7 a C. La flecha punteada aparece cuando un X7 resuelve medio tono abajo o tono arriba, como Db7 a C o Bb7 a C."
        ],
        diagrams: [
          { type: "arrow", label: "Flecha normal", chords: ["G7", "C∆"], caption: "Dominante que resuelve por quinta: G7 → C∆." },
          { type: "dashedArrow", label: "Flecha punteada", chords: ["Db7", "C∆"], caption: "Vsub que resuelve medio tono abajo: Db7 → C∆." }
        ]
      },
      {
        heading: "Corchetes",
        body: [
          "El corchete normal marca relaciones m7-7 o ø-7 a distancia de quinta. El corchete punteado marca II-Vsub. En modo manual, Option+derecha puede hacer que un conector salte un acorde."
        ],
        diagrams: [
          { type: "bracket", label: "Corchete normal", chords: ["Dm7", "G7", "C∆"], caption: "II-V hacia el objetivo: Dm7 G7 C∆." },
          { type: "dashedBracket", label: "Corchete punteado", chords: ["Dm7", "Db7", "C∆"], caption: "II-Vsub: Dm7 Db7 C∆." },
          { type: "skipDashedArrow", label: "Salto punteado", chords: ["Bbm7", "Eb7", "Am7", "D7"], caption: "Cadena cromática: la flecha salta el II siguiente." }
        ]
      }
    ]
  },
  {
    id: "forma",
    title: "Forma musical",
    category: "Forma",
    summary: "Letras, dobles barras, casillas y similitud interválica.",
    sections: [
      {
        heading: "Letras de forma",
        body: [
          "La forma se marca con letras al comienzo de una sección: A, B, C. Una doble barra puede indicar el inicio de una nueva sección."
        ]
      },
      {
        heading: "Similitud",
        body: [
          "Dos secciones pueden compartir letra si su estructura interválica y sus cualidades son equivalentes, aunque estén transportadas. Por eso un AA puede existir sin repetir exactamente las mismas fundamentales."
        ]
      },
      {
        heading: "Recursos de lectura",
        body: [
          "Las casillas 1. y 2., las barras de repetición y las dobles barras ayudan a separar recorrido formal de análisis armónico."
        ]
      }
    ]
  }
];

const THEORY_CARD_NOTES = {
  "escalas-tonales": {
    tags: ["4 escalas", "básico/extendido", "escala de origen"],
    keyPoints: [
      "La escala de origen explica a la vez el grado, la cualidad, las extensiones y el modo.",
      "El modo básico muestra el acorde hasta la 7a; el extendido muestra el color disponible.",
      "Si el usuario escribe una extensión concreta, esa escritura se conserva."
    ],
    avoid: "No llamar modulación a cada escala de origen: muchas son colores locales."
  },
  grados: {
    tags: ["tonalidad", "alteraciones", "regiones"],
    keyPoints: [
      "El grado se lee siempre contra la tonalidad visible: C:[ o Cm:[.",
      "En menor, III, VI y VII son Eb, Ab y Bb; E, A y B son #III, #VI y #VII.",
      "La barra /x indica una región secundaria, no necesariamente una modulación."
    ],
    avoid: "No mezclar la tonalidad del campo C:[ con una escala de origen como C mayor arm."
  },
  modos: {
    tags: ["grado = modo", "regiones", "color modal"],
    keyPoints: [
      "El modo debe coincidir con el grado: II = dórico, III = frigio, VI = eólico.",
      "En regiones secundarias se conserva la misma lógica dentro de la región.",
      "Las variantes modales vienen de las cuatro escalas tonales, no de nombres libres."
    ],
    avoid: "No llamar dórico a un IIIm7 ni jónico b6 a un I6."
  },
  dominantes: {
    tags: ["V7/x", "II-V/x", "resolución"],
    keyPoints: [
      "El V7 aislado hacia un menor suele venir de la menor armónica del objetivo.",
      "Si el II es m7 y no ø, el II-V se entiende como región mayor.",
      "Un V7-I diatónico no obliga a modular."
    ],
    avoid: "No analizar como modulación una dominante secundaria que solo toniciza momentáneamente."
  },
  tritonos: {
    tags: ["Vsub", "IIsub", "semitono"],
    keyPoints: [
      "Vsub resuelve típicamente medio tono abajo.",
      "IIsub-Vsub puede reemplazar o preparar el dominante esperado.",
      "El contexto decide si el tritono se lee como sustituto o como IV7/backdoor."
    ],
    avoid: "No leer un Vsub como IV7 si su resolución contextual apunta a un grado claro."
  },
  backdoor: {
    tags: ["bVII", "subdominante", "color"],
    keyPoints: [
      "El backdoor conduce al objetivo desde la región de bVII.",
      "Funciona como color de preparación, no como cambio de tonalidad por defecto.",
      "Suele convivir con intercambio modal."
    ],
    avoid: "No confundir todo bVII7 con backdoor si no conduce a un objetivo tonal."
  },
  "intercambio-modal": {
    tags: ["paralelas", "mismo grado", "función"],
    keyPoints: [
      "Reemplaza un acorde por otro del mismo grado.",
      "La escala paralela comparte fundamental con la tonalidad principal.",
      "En rearmonización, cambia el color sin mover el sitio formal del acorde."
    ],
    avoid: "No llamar intercambio modal a un acorde que cambia de grado o de región."
  },
  disminuidos: {
    tags: ["°7", "WH/HW", "aproximación"],
    keyPoints: [
      "VII°7 de un mayor apunta a mayor armónica.",
      "#VII°7 de un menor apunta a menor armónica.",
      "Un °7 que baja medio tono puede funcionar como bII°7/."
    ],
    avoid: "No tratar todos los disminuidos como el mismo modo: el grado importa."
  },
  conectores: {
    tags: ["flechas", "corchetes", "hitboxes"],
    keyPoints: [
      "Las flechas siguen resolución de dominante.",
      "Los corchetes siguen cualidad y distancia, no solo el texto del análisis.",
      "Los conectores manuales deben conservarse al guardar."
    ],
    avoid: "No recalcular conectores sobre un análisis curado si el usuario ya lo corrigió."
  },
  forma: {
    tags: ["AABA", "doble barra", "casillas"],
    keyPoints: [
      "La doble barra puede iniciar nueva sección formal.",
      "Dos secciones pueden compartir letra si son intervalicamente equivalentes.",
      "Las casillas y saltos describen recorrido, no sustituyen la forma."
    ],
    avoid: "No marcar una nueva letra solo porque cambió la tonalidad si la estructura es equivalente."
  }
};

init();

async function loadAdminConfiguration() {
  await Promise.all([
    loadAdminDefaultSettings(),
    loadAdminEngineExamples()
  ]);
}

async function loadAdminDefaultSettings() {
  try {
    const res = await fetch("/api/admin/default-settings");
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.settings || typeof data.settings !== "object") return false;
    Object.assign(DEFAULT_SETTINGS, data.settings);
    song = makeDemoSong();
    return true;
  } catch (_) {
    return false;
  }
}

async function loadAdminEngineExamples() {
  try {
    const res = await fetch("/api/admin/engine-examples");
    if (!res.ok) return false;
    const data = await res.json();
    adminEngineExamples = Array.isArray(data.examples) ? data.examples : [];
    window.TonalAnalysis?.setUserExamples?.(adminEngineExamples);
    return true;
  } catch (_) {
    adminEngineExamples = [];
    window.TonalAnalysis?.setUserExamples?.([]);
    return false;
  }
}

async function init() {
  if (!IS_STUDENT_MODE) await loadAdminConfiguration();
  if (IS_STUDENT_MODE) song = makeBlankSong(12);
  const restoredLastDocument = IS_STUDENT_MODE ? false : await restoreLastOpenDocument();
  await registerLocalFonts();
  renderSettingsForm();
  renderLocalFontsList();
  updateAssistanceModeControls();
  updateAnalysisVisibilityControls();
  updateChordDetailModeControls();
  updateStandardSaveControls();
  bindToolbar();
  bindDesktopMenus();
  bindMeasurePanel();
  bindCanvasTooltip();
  bindCategoryDrag();
  updateRhythmSlashCycleButton();
  if (!restoredLastDocument) {
    if (!IS_STUDENT_MODE) {
      currentStandardFilename = inferCurrentBuiltInBluesFilename();
      updateStandardSaveControls();
      autoAnalyzeCurrentSong(true, { confirm: false, alert: false, markDirty: false, render: false });
    }
  }
  applyStudentModeUi();
  renderAll();
  resetHistory();
  refreshLibrary();
}

function applyStudentModeUi() {
  if (!IS_STUDENT_MODE) return;
  document.body.classList.add("studentMode");
  const title = document.querySelector(".appMenuTitle span:last-child");
  if (title) title.textContent = "Aula";
  document.title = "ATA Aula";
  assistanceMode = "assisted";
  analysisVisibility = "hidden";
  updateAssistanceModeControls();
  updateAnalysisVisibilityControls();
  updateChordDetailModeControls();
  [
    els.saveBtn,
    els.duplicateSongBtn,
    els.downloadJsonBtn,
    els.fileInput?.closest?.(".fileBtn"),
    els.importTextBtn,
    els.normalizeLibraryNamesBtn,
    els.autoAnalyzeBtn,
    els.randomReharmBtn,
    els.exportPngBtn,
    els.exportSvgBtn,
    els.adminSaveThemeBtn,
    els.adminSaveEngineExampleBtn,
    els.adminReloadEngineExamplesBtn,
    els.adminOpenAppearanceBtn,
    els.adminSaveAppearanceBtn,
    els.adminPanel
  ].filter(Boolean).forEach(element => {
    element.hidden = true;
    element.setAttribute?.("aria-hidden", "true");
  });
}

function bindToolbar() {
  bindRhythmPalette();
  els.newBtn.addEventListener("click", openBlankSongDialog);
  els.blankSongApplyBtn?.addEventListener("click", createBlankSongFromDialog);

	  els.undoBtn?.addEventListener("click", undo);
	  els.redoBtn?.addEventListener("click", redo);
	  els.globalRespaceBtn?.addEventListener("click", respaceWholeSong);

  els.saveBtn.addEventListener("click", saveCurrentDocument);
  els.duplicateSongBtn?.addEventListener("click", openCopySaveDialog);
  els.copySaveApplyBtn?.addEventListener("click", duplicateCurrentSong);
  els.copySaveDestinationSelect?.addEventListener("change", updateCopySaveDestinationHint);
  els.downloadJsonBtn.addEventListener("click", downloadJson);
  els.fileInput.addEventListener("change", importJson);
  els.importTextBtn?.addEventListener("click", importPlainTextAnalysis);
  els.textImportApplyBtn?.addEventListener("click", applyTextImportFromDialog);
  els.textImportInput?.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      applyTextImportFromDialog();
    }
  });
  els.openLibraryBtn.addEventListener("click", async () => {
    await Promise.all([refreshLibrary(), refreshStandards()]);
    els.libraryDialog.showModal();
    requestAnimationFrame(() => els.standardSearchInput?.focus());
  });
  els.normalizeLibraryNamesBtn?.addEventListener("click", normalizeLibraryFilenames);
  els.librarySearchInput?.addEventListener("input", () => {
    renderLibrary(savedLibraryIndex, els.librarySearchInput.value);
  });
  els.standardSearchInput?.addEventListener("input", () => {
    renderStandards(standardsIndex, els.standardSearchInput.value);
  });

  els.addMeasureBtn?.addEventListener("click", addMeasureAtEnd);
  els.removeLastMeasureBtn?.addEventListener("click", removeMeasureAtEnd);
  els.removeUnusedMeasuresBtn?.addEventListener("click", removeUnusedMeasures);
  els.measureCountCloseBtn?.addEventListener("click", closeMeasureCountPanel);
  els.measureCountApplyBtn?.addEventListener("click", addMeasuresFromPanel);
  els.measureCountInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addMeasuresFromPanel();
    }
  });

  els.exportPdfBtn.addEventListener("click", exportPdf);

  els.exportPngBtn.addEventListener("click", exportSelectedPagePng);
  els.exportSvgBtn.addEventListener("click", exportSelectedPageSvg);
  els.adminSaveThemeBtn?.addEventListener("click", () => openAdminPanel("theme"));
  els.adminSaveEngineExampleBtn?.addEventListener("click", () => openAdminPanel("engine"));
  els.adminReloadEngineExamplesBtn?.addEventListener("click", () => openAdminPanel("reload"));
  els.adminOpenAppearanceBtn?.addEventListener("click", () => openAdminPanel("appearance"));
  els.adminSaveAppearanceBtn?.addEventListener("click", () => openAdminPanel("saveAppearance"));
  els.adminCloseBtn?.addEventListener("click", closeAdminPanel);
  els.adminPanelSaveEngineExampleBtn?.addEventListener("click", saveEngineExampleFromAdminPanel);
  els.adminPanelReloadEngineExamplesBtn?.addEventListener("click", reloadEngineExamplesFromAdminPanel);
  els.adminPanelOpenAppearanceBtn?.addEventListener("click", openAppearanceFromAdminPanel);
  els.adminPanelSaveAppearanceBtn?.addEventListener("click", saveAppearanceFromAdminPanel);
  els.clearFieldsBtn?.addEventListener("click", openClearFieldsDialog);
  els.clearFieldsApplyBtn?.addEventListener("click", clearFieldsFromDialog);
  els.assistanceModeSelect?.addEventListener("change", () => {
    assistanceMode = els.assistanceModeSelect.value === "manual" ? "manual" : "assisted";
    clearEvaluationIssues();
    updateAssistanceModeControls();
  });
  els.toggleAssistanceModeBtn?.addEventListener("click", toggleAssistanceMode);
  els.analysisVisibilitySelect?.addEventListener("change", () => {
    analysisVisibility = els.analysisVisibilitySelect.value === "hidden" ? "hidden" : "visible";
    updateAnalysisVisibilityControls();
    renderAll(false);
    setDirty(true);
  });
  els.toggleAnalysisVisibilityBtn?.addEventListener("click", toggleAnalysisVisibility);
  els.chordDetailModeSelect?.addEventListener("change", () => {
    chordDetailMode = els.chordDetailModeSelect.value === "extended" ? "extended" : "basic";
    updateChordDetailModeControls();
    renderAll(false);
  });
  els.autoAnalyzeBtn?.addEventListener("click", () => {
    analysisVisibility = "visible";
    updateAnalysisVisibilityControls();
    autoAnalyzeCurrentSong(true);
  });
  els.evaluateAnalysisBtn?.addEventListener("click", evaluateCurrentAnalysis);
  els.randomReharmBtn?.addEventListener("click", openRandomReharmDialog);
  els.randomReharmDensityInput?.addEventListener("input", () => {
    updateRandomReharmDensityLabel();
    scheduleRandomReharmPreview();
  });
  els.randomReharmSeedInput?.addEventListener("input", () => {
    randomReharmSessionSeed = "";
    scheduleRandomReharmPreview();
  });
  els.randomReharmPreviewBtn?.addEventListener("click", previewRandomReharmonization);
  els.randomReharmVariationBtn?.addEventListener("click", generateRandomReharmVariation);
  els.randomReharmApplyBtn?.addEventListener("click", applyRandomReharmonization);
  els.openAboutBtn?.addEventListener("click", openAboutDialog);
  els.printAboutBtn?.addEventListener("click", printAboutCredits);
  els.openTheoryBtn?.addEventListener("click", openTheoryCardsDialog);
  els.theorySearchInput?.addEventListener("input", () => renderTheoryCardList(els.theorySearchInput.value));
  els.prevTheoryCardBtn?.addEventListener("click", () => moveTheoryCard(-1));
  els.nextTheoryCardBtn?.addEventListener("click", () => moveTheoryCard(1));
  els.printTheoryCardBtn?.addEventListener("click", printSelectedTheoryCard);

  if (els.localFontInput) {
    els.localFontInput.addEventListener("change", importLocalFonts);
  }

  if (els.scanSystemFontsBtn) {
    els.scanSystemFontsBtn.addEventListener("click", scanSystemFonts);
  }

  els.toggleSettingsBtn?.addEventListener("click", () => {
    openAdminAppearancePanel();
  });

  els.closeSettingsBtn.addEventListener("click", () => {
    els.settingsPanel.classList.add("closed");
    document.body.classList.remove("settingsOpen");
  });

  els.settingsSearchInput?.addEventListener("input", () => {
    filterSettings(els.settingsSearchInput.value);
  });

  els.resetAppearanceBtn?.addEventListener("click", () => {
    if (!confirm("¿Restaurar todos los ajustes visuales a los valores por defecto?")) return;
    const keepLocalFonts = song.settings.localFonts || [];
    const keepSystemFonts = song.settings.systemFonts || [];
    song.settings = {
      ...structuredClone(DEFAULT_SETTINGS),
      localFonts: keepLocalFonts,
      systemFonts: keepSystemFonts
    };
    renderSettingsForm();
    renderQuickAppearance();
    renderLocalFontsList();
    setDirty(true);
    renderAll();
  });

  window.addEventListener("resize", () => {
    if (!els.measurePanel.classList.contains("hidden")) placeMeasurePanel(selected.page, selected.measure);
  });

  window.addEventListener("scroll", () => {}, true);

  els.editFormBtn?.addEventListener("click", () => openMeasureFieldInline("form", "A"));
  els.editEndingBtn?.addEventListener("click", () => openMeasureFieldInline("ending", "1."));
  els.editJumpBtn?.addEventListener("click", () => openMeasureFieldInline("jump", "D.S."));

  els.barSimpleBtn?.addEventListener("click", () => setSelectedMeasureBar("rightBar", "|"));
  els.barDoubleBtn?.addEventListener("click", () => setSelectedMeasureBar("rightBar", "||"));
  els.barFinalBtn?.addEventListener("click", () => setSelectedMeasureBar("rightBar", "|||"));
  els.barRepeatStartBtn?.addEventListener("click", () => setSelectedMeasureBar("leftBar", "|:"));
  els.barRepeatEndBtn?.addEventListener("click", () => setSelectedMeasureBar("rightBar", ":||"));

  els.connCurveBtn?.addEventListener("click", () => setSelectedConnector("->"));
  els.connCurveDashedBtn?.addEventListener("click", () => setSelectedConnector("-->"));
  els.connBracketBtn?.addEventListener("click", () => setSelectedConnector("[]"));
  els.connBracketDashedBtn?.addEventListener("click", () => setSelectedConnector("[--]"));
  els.thirdChordPosBtn?.addEventListener("click", () => toggleThirdChordPosition());

  document.addEventListener("keydown", event => {
    if (shouldHandleRhythmBackspace(event)) {
      event.preventDefault();
      rhythmDeleteSelection();
      return;
    }
    if (shouldHandleRhythmSpaceAdvance(event)) {
      event.preventDefault();
      event.stopPropagation();
      rhythmAdvanceSlashCyclePulse();
      return;
    }
    if (handleConnectorSpanShortcut(event)) {
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (IS_STUDENT_MODE) {
        updateStatus("ATA Aula no guarda archivos. Usa PDF para entregar o imprimir.");
        return;
      }
      saveCurrentDocument();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
      return;
    }
	    if (((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "z") || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y")) {
	      event.preventDefault();
	      redo();
	      return;
	    }
	    if ((event.metaKey || event.ctrlKey) && event.altKey && event.key.toLowerCase() === "r") {
	      event.preventDefault();
	      respaceWholeSong();
	      return;
	    }
	    if (event.key === "Escape") {
	      hideReharmonizationMenu();
	      hideInlineEditor(true);
      els.measurePanel.classList.add("hidden");
    }
  });

  els.inlineEditor.addEventListener("keydown", event => {
    if (event.key === "Tab") {
      event.preventDefault();
      moveInlineEditor(event.shiftKey ? -1 : 1);
      return;
    }
    if (isChordInlineContext(inlineContext) && event.key === " " && !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      moveChordInlineEditor(1);
      return;
    }
    if (isChordInlineContext(inlineContext) && (event.key === "." || event.key === ")") && shouldCommitInlineEndingToken(event.key)) {
      event.preventDefault();
      commitInlineEndingToken(event.key);
      return;
    }
    if (isChordInlineContext(inlineContext) && event.key === "ArrowRight" && isInlineEditorCaretAtEdge(1)) {
      event.preventDefault();
      moveChordInlineEditor(1);
      return;
    }
    if (isChordInlineContext(inlineContext) && event.key === "ArrowLeft" && isInlineEditorCaretAtEdge(-1)) {
      event.preventDefault();
      moveChordInlineEditor(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (isChordInlineContext(inlineContext)) {
        moveChordInlineEditor(1);
        return;
      }
      hideInlineEditor(false);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      hideInlineEditor(true);
    }
  });

  els.inlineEditor.addEventListener("input", () => {
    els.inlineEditor.dataset.dirty = "true";
  });

  els.inlineEditor.addEventListener("blur", () => hideInlineEditor(false));

  els.inlineTextarea?.addEventListener("keydown", event => {
    if (event.key === "Tab") {
      event.preventDefault();
      moveInlineEditor(event.shiftKey ? -1 : 1);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      hideInlineEditor(false);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      hideInlineEditor(true);
    }
  });

  els.inlineTextarea?.addEventListener("blur", () => hideInlineEditor(false));
}

function bindDesktopMenus() {
  const menus = Array.from(document.querySelectorAll(".appMenu"));
  if (!menus.length) return;

  const closeMenus = (except = null) => {
    menus.forEach(menu => {
      if (menu !== except) menu.removeAttribute("open");
    });
  };

  menus.forEach(menu => {
    menu.querySelector("summary")?.addEventListener("click", () => {
      window.setTimeout(() => {
        if (menu.open) closeMenus(menu);
      });
    });

    menu.querySelectorAll("button, .fileBtn").forEach(control => {
      control.addEventListener("click", () => {
        window.setTimeout(() => closeMenus(), 80);
      });
    });

    menu.querySelectorAll("select").forEach(select => {
      select.addEventListener("change", () => closeMenus());
    });
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".appMenu")) closeMenus();
    if (!event.target.closest(".reharmonizationMenu")) hideReharmonizationMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenus();
      hideReharmonizationMenu();
    }
  });
}

function closeDesktopMenus() {
  document.querySelectorAll(".appMenu[open]").forEach(menu => {
    menu.removeAttribute("open");
  });
}

function runAdminMenuAction(action) {
  closeDesktopMenus();
  window.setTimeout(async () => {
    try {
      await action();
    } catch (error) {
      console.warn("Accion administrativa fallida", error);
      const detail = error?.message ? `\n\nDetalle tecnico: ${error.message}` : "";
      alert(`No se pudo ejecutar la accion administrativa.${detail}\n\nAvísame con este mensaje y lo rastreamos.`);
    }
  }, 120);
}

function setAdminPanelStatus(message, tone = "") {
  if (!els.adminPanelStatus) return;
  els.adminPanelStatus.textContent = message;
  els.adminPanelStatus.dataset.tone = tone;
}

function openAdminPanel(mode = "") {
  closeDesktopMenus();
  els.adminPanel?.classList.remove("closed");
  if (els.adminExampleNameInput && !els.adminExampleNameInput.value.trim()) {
    els.adminExampleNameInput.value = song.title || "ejemplo-motor";
  }
  const hints = {
    engine: "Escribe la clave y pulsa Grabar ejemplo para el motor.",
    reload: "Escribe la clave y pulsa Recargar ejemplos del motor.",
    appearance: "Escribe la clave y pulsa Abrir apariencia completa.",
    saveAppearance: "Escribe la clave y pulsa Grabar apariencia predeterminada."
  };
  setAdminPanelStatus(hints[mode] || "Listo.");
  requestAnimationFrame(() => els.adminKeyInput?.focus());
}

function closeAdminPanel() {
  els.adminPanel?.classList.add("closed");
}

function validateAdminPanelKey() {
  const key = String(els.adminKeyInput?.value || "");
  if (key === ADMIN_ACCESS_KEY) return true;
  setAdminPanelStatus("Clave incorrecta. No se ejecuto la accion administrativa.", "error");
  els.adminKeyInput?.focus();
  els.adminKeyInput?.select();
  return false;
}

async function saveEngineExampleFromAdminPanel() {
  if (!validateAdminPanelKey()) return;
  const defaultName = song.title || "ejemplo-motor";
  const requestedName = String(els.adminExampleNameInput?.value || "").trim() || defaultName;
  const example = buildEngineExampleFromCurrentSong(requestedName);
  if (!example) {
    setAdminPanelStatus("No se grabo ningun ejemplo: el analisis actual no tiene acordes.", "error");
    return;
  }

  try {
    setAdminPanelStatus("Guardando ejemplo del motor...");
    const res = await fetch("/api/admin/engine-examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ example })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error del servidor (${res.status})`);
    }
    const data = await res.json();
    adminEngineExamples = Array.isArray(data.examples) ? data.examples : [];
    window.TonalAnalysis?.setUserExamples?.(adminEngineExamples);
    setAdminPanelStatus(`Ejemplo guardado: ${requestedName}. Ejemplos cargados: ${adminEngineExamples.length}.`, "ok");
    updateStatus(`Ejemplo del motor guardado: ${requestedName}`);
  } catch (error) {
    console.warn(error);
    setAdminPanelStatus(`No se pudo grabar el ejemplo del motor. ${error?.message || ""}`.trim(), "error");
  }
}

async function reloadEngineExamplesFromAdminPanel() {
  if (!validateAdminPanelKey()) return;
  setAdminPanelStatus("Recargando ejemplos del motor...");
  const loaded = await loadAdminEngineExamples();
  setAdminPanelStatus(
    loaded
      ? `Ejemplos administrativos recargados: ${adminEngineExamples.length}.`
      : "No se pudieron recargar los ejemplos administrativos.",
    loaded ? "ok" : "error"
  );
}

function openAppearanceFromAdminPanel() {
  if (!validateAdminPanelKey()) return;
  els.settingsPanel.classList.remove("closed");
  document.body.classList.add("settingsOpen");
  placeSettingsPanel();
  setAdminPanelStatus("Controles completos de apariencia abiertos.", "ok");
  updateStatus("Controles completos de apariencia abiertos.");
  setTimeout(() => els.settingsSearchInput?.focus(), 80);
}

async function saveAppearanceFromAdminPanel() {
  if (!validateAdminPanelKey()) return;
  try {
    setAdminPanelStatus("Guardando apariencia predeterminada...");
    const settings = structuredClone(song.settings || {});
    const res = await fetch("/api/admin/default-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error del servidor (${res.status})`);
    }
    const data = await res.json();
    Object.assign(DEFAULT_SETTINGS, settings);
    setAdminPanelStatus(
      data.backup
        ? `Apariencia predeterminada guardada. Respaldo anterior: ${data.backup}.`
        : "Apariencia predeterminada guardada.",
      "ok"
    );
    updateStatus("Apariencia predeterminada administrativa guardada.");
  } catch (error) {
    console.warn(error);
    setAdminPanelStatus(`No se pudo grabar la apariencia. ${error?.message || ""}`.trim(), "error");
  }
}

function askTextInput({ title = "ATA", message = "", defaultValue = "", password = false, confirmText = "Aceptar" } = {}) {
  return new Promise(resolve => {
    const dialog = document.createElement("dialog");
    dialog.className = "textPromptDialog";
    dialog.innerHTML = `
      <form method="dialog" class="textPromptForm">
        <strong></strong>
        <p></p>
        <input />
        <div class="textPromptActions">
          <button value="cancel" type="submit">Cancelar</button>
          <button value="ok" type="submit">${confirmText}</button>
        </div>
      </form>
    `;

    const titleEl = dialog.querySelector("strong");
    const messageEl = dialog.querySelector("p");
    const input = dialog.querySelector("input");
    titleEl.textContent = title;
    messageEl.textContent = message;
    input.value = defaultValue;
    input.type = password ? "password" : "text";

    dialog.addEventListener("close", () => {
      const value = dialog.returnValue === "ok" ? input.value : null;
      dialog.remove();
      resolve(value);
    });

    document.body.appendChild(dialog);
    dialog.showModal();
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  });
}

function askConfirmation({ title = "ATA", message = "", confirmText = "Continuar", cancelText = "Cancelar" } = {}) {
  return new Promise(resolve => {
    const dialog = document.createElement("dialog");
    dialog.className = "textPromptDialog";
    dialog.innerHTML = `
      <form method="dialog" class="textPromptForm">
        <strong></strong>
        <p></p>
        <div class="textPromptActions">
          <button value="cancel" type="submit"></button>
          <button value="ok" type="submit"></button>
        </div>
      </form>
    `;

    dialog.querySelector("strong").textContent = title;
    dialog.querySelector("p").textContent = message;
    dialog.querySelector('button[value="cancel"]').textContent = cancelText;
    dialog.querySelector('button[value="ok"]').textContent = confirmText;

    dialog.addEventListener("close", () => {
      const ok = dialog.returnValue === "ok";
      dialog.remove();
      resolve(ok);
    });

    document.body.appendChild(dialog);
    dialog.showModal();
  });
}


function updateAssistanceModeControls() {
  if (els.assistanceModeSelect) {
    els.assistanceModeSelect.value = assistanceMode;
  }

  if (els.toggleAssistanceModeBtn) {
    const isManual = assistanceMode === "manual";
    els.toggleAssistanceModeBtn.textContent = isManual
      ? "Manual"
      : "Asistido";
    els.toggleAssistanceModeBtn.dataset.mode = isManual ? "manual" : "assisted";
    els.toggleAssistanceModeBtn.setAttribute("aria-pressed", isManual ? "true" : "false");
    els.toggleAssistanceModeBtn.title = assistanceMode === "manual"
      ? "Modo manual activo. Clic para activar asistencia del motor."
      : "Modo asistido activo. Clic para escribir sin sugerencias del motor.";
  }

  if (els.autoAnalyzeBtn) {
    els.autoAnalyzeBtn.disabled = false;
    els.autoAnalyzeBtn.title = assistanceMode === "manual"
      ? "Rellenar el analisis cuando quieras comparar con el motor."
      : "Rellenar grados, modos y tonalidades automaticamente.";
  }
}

function toggleAssistanceMode() {
  assistanceMode = assistanceMode === "manual" ? "assisted" : "manual";
  clearEvaluationIssues();
  updateAssistanceModeControls();
  updateStatus(assistanceMode === "manual" ? "Modo manual activado." : "Modo asistido activado.");
}

function isAnalysisVisible() {
  return analysisVisibility !== "hidden";
}

function isHiddenAnalysisField(field) {
  return ["degree", "mode", "sectionLabel", "originScale"].includes(field);
}

function isHiddenMeasureAnalysisField(field) {
  return field === "sectionLabel";
}

function isHiddenAnalysisFieldEdited(slot, field) {
  return !!slot?._hiddenAnalysisEdits?.[field];
}

function isHiddenMeasureAnalysisFieldEdited(measure, field) {
  return !!measure?._hiddenAnalysisEdits?.[field];
}

function isManualAnalysisField(field) {
  return ["degree", "mode", "sectionLabel", "originScale"].includes(field);
}

function isManualMeasureAnalysisField(field) {
  return field === "sectionLabel";
}

function sanitizeManualAnalysisFields(value, allowedFields) {
  const out = {};
  const source = value && typeof value === "object" ? value : {};
  allowedFields.forEach(field => {
    if (source[field] === true) out[field] = true;
  });
  return out;
}

function isManualAnalysisFieldLocked(slot, field) {
  return !!slot?.manualAnalysisFields?.[field];
}

function isManualMeasureAnalysisFieldLocked(measure, field) {
  return !!measure?.manualAnalysisFields?.[field];
}

function markManualAnalysisField(slot, field) {
  if (!slot || !isManualAnalysisField(field)) return;
  slot.manualAnalysisFields = {
    ...(slot.manualAnalysisFields || {}),
    [field]: true
  };
}

function markManualMeasureAnalysisField(measure, field) {
  if (!measure || !isManualMeasureAnalysisField(field)) return;
  measure.manualAnalysisFields = {
    ...(measure.manualAnalysisFields || {}),
    [field]: true
  };
}

function clearManualAnalysisField(slot, field) {
  if (!slot?.manualAnalysisFields) return;
  delete slot.manualAnalysisFields[field];
  if (!Object.keys(slot.manualAnalysisFields).length) delete slot.manualAnalysisFields;
}

function clearManualMeasureAnalysisField(measure, field) {
  if (!measure?.manualAnalysisFields) return;
  delete measure.manualAnalysisFields[field];
  if (!Object.keys(measure.manualAnalysisFields).length) delete measure.manualAnalysisFields;
}

function shouldRenderAnalysisField(slot, field) {
  return isAnalysisVisible() || isHiddenAnalysisFieldEdited(slot, field);
}

function shouldRenderMeasureAnalysisField(measure, field) {
  return isAnalysisVisible() || isHiddenMeasureAnalysisFieldEdited(measure, field);
}

function shouldRenderConnector(slot) {
  return isAnalysisVisible() || !!slot?._connectorEditedWhileHidden;
}

function markHiddenAnalysisFieldEdit(slot, field, value) {
  if (!slot || !isHiddenAnalysisField(field) || isAnalysisVisible()) return;

  if (String(value || "").trim()) {
    slot._hiddenAnalysisEdits = {
      ...(slot._hiddenAnalysisEdits || {}),
      [field]: true
    };
    return;
  }

  if (slot._hiddenAnalysisEdits) {
    delete slot._hiddenAnalysisEdits[field];
    if (!Object.keys(slot._hiddenAnalysisEdits).length) delete slot._hiddenAnalysisEdits;
  }
}

function markHiddenMeasureAnalysisFieldEdit(measure, field, value) {
  if (!measure || !isHiddenMeasureAnalysisField(field) || isAnalysisVisible()) return;

  if (String(value || "").trim()) {
    measure._hiddenAnalysisEdits = {
      ...(measure._hiddenAnalysisEdits || {}),
      [field]: true
    };
    return;
  }

  if (measure._hiddenAnalysisEdits) {
    delete measure._hiddenAnalysisEdits[field];
    if (!Object.keys(measure._hiddenAnalysisEdits).length) delete measure._hiddenAnalysisEdits;
  }
}

function clearHiddenAnalysisEditMarkers() {
  (song.pages || []).forEach(page => {
    (page.measures || []).forEach(measure => {
      delete measure._hiddenAnalysisEdits;
      (measure.slots || []).forEach(slot => {
        delete slot._hiddenAnalysisEdits;
        delete slot._connectorEditedWhileHidden;
      });
    });
  });
}

function clearManualAnalysisLocks() {
  (song.pages || []).forEach(page => {
    (page.measures || []).forEach(measure => {
      delete measure.manualAnalysisFields;
      (measure.slots || []).forEach(slot => {
        delete slot.manualAnalysisFields;
      });
    });
  });
}

function clearManualOffsets() {
  let changed = false;
  (song.pages || []).forEach(page => {
    (page.measures || []).forEach(measure => {
      if (measure?.offsets && Object.keys(measure.offsets).length) {
        measure.offsets = {};
        changed = true;
      }
      (measure?.slots || []).forEach(slot => {
        if (slot?.offsets && Object.keys(slot.offsets).length) {
          slot.offsets = {};
          changed = true;
        }
        if (slot?.connectorShape && Object.keys(slot.connectorShape).length) {
          delete slot.connectorShape;
          changed = true;
        }
      });
    });
  });
  return changed;
}

function respaceWholeSong() {
  const changed = clearManualOffsets();
  renderAll(false);
  if (changed) {
    setDirty(true);
    updateStatus("Reespaciado aplicado.");
  } else {
    updateStatus("No había desplazamientos manuales para reespaciar.");
  }
}

function updateAnalysisVisibilityControls() {
  if (els.analysisVisibilitySelect) {
    els.analysisVisibilitySelect.value = isAnalysisVisible() ? "visible" : "hidden";
  }

  if (els.toggleAnalysisVisibilityBtn) {
    els.toggleAnalysisVisibilityBtn.textContent = isAnalysisVisible()
      ? "Ocultar análisis"
      : "Mostrar análisis";
    els.toggleAnalysisVisibilityBtn.title = isAnalysisVisible()
      ? "Ocultar grados, modos, tonalidades y escalas de origen."
      : "Volver a mostrar el analisis.";
  }

  if (els.evaluateAnalysisBtn) {
    els.evaluateAnalysisBtn.disabled = !isAnalysisVisible();
    els.evaluateAnalysisBtn.title = isAnalysisVisible()
      ? "Evaluar el analisis escrito."
      : "Activa el analisis para evaluar grados, modos y escalas.";
  }
}

function toggleAnalysisVisibility() {
  analysisVisibility = isAnalysisVisible() ? "hidden" : "visible";
  updateAnalysisVisibilityControls();
  renderAll(false);
  setDirty(true);
}

function updateChordDetailModeControls() {
  if (els.chordDetailModeSelect) {
    els.chordDetailModeSelect.value = chordDetailMode === "extended" ? "extended" : "basic";
  }
}

function updateStandardSaveControls() {
  if (!els.saveBtn) return;

  els.saveBtn.textContent = currentStandardFilename ? "Guardar standard curado" : "Guardar";
  els.saveBtn.title = currentStandardFilename
    ? `Guardar version curada completa de ${currentStandardFilename}`
    : "Guardar en biblioteca local.";
}

function clearCurrentStandardSource() {
  currentStandardFilename = null;
  currentStandardSource = null;
  updateStandardSaveControls();
}

const TONAL_MODE_CHORD_SUFFIXES = {
  jonico: { basic: "∆", extended: "∆13" },
  dorico: { basic: "m7", extended: "m9" },
  frigio: { basic: "m7", extended: "m11" },
  lidio: { basic: "∆", extended: "∆13" },
  mixolidio: { basic: "7", extended: "13" },
  eolico: { basic: "m7", extended: "m9" },
  locrio: { basic: "ø", extended: "ø11" },

  jonicob6: { basic: "+∆", extended: "+∆9" },
  "locrio#2#6": { basic: "ø", extended: "ø9" },
  "mixob2#2b6no4": { basic: "7", extended: "7(#9)b13" },
  "dorico#4#7": { basic: "m∆", extended: "m∆9" },
  mixolidiob2: { basic: "7", extended: "13(b9)" },
  "lidioaumentado#2": { basic: "+∆", extended: "+∆#9" },
  locriob7: { basic: "°7", extended: "°7(b13)" },

  "eolico#7": { basic: "m∆", extended: "m∆11" },
  "locrio#6": { basic: "ø", extended: "ø11" },
  jonicoaumentado: { basic: "+∆", extended: "+∆9" },
  "dorico#4": { basic: "m7", extended: "m9" },
  mixob2b6: { basic: "7", extended: "7(b9)b13" },
  "lidio#2": { basic: "∆", extended: "∆9" },
  locriob4b7: { basic: "°7", extended: "°7(b13)" },

  "dorico#7": { basic: "m6", extended: "m6(9)" },
  doricob2: { basic: "7sus4", extended: "7sus4(b9)" },
  lidioaumentado: { basic: "∆(b5)", extended: "∆(b5)" },
  lidiodominante: { basic: "7(b5)", extended: "9(#11)" },
  mixolidiob6: { basic: "7", extended: "9(b13)" },
  "locrio#2": { basic: "ø", extended: "ø9" },
  mixoalterado: { basic: "+7", extended: "7alt" }
};

function tonalModeKey(mode) {
  return String(mode || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function chordSuffixForDisplayMode(mode) {
  const entry = TONAL_MODE_CHORD_SUFFIXES[tonalModeKey(mode)];
  if (!entry) return "";
  return chordDetailMode === "extended" ? entry.extended : entry.basic;
}

function normalizeDeltaSuffixForVisibleChord(suffix) {
  if (!isDeltaMaj7Enabled()) return suffix;

  return String(suffix || "")
    .replaceAll("m∆11", "m(maj7)11")
    .replaceAll("m∆9", "m(maj7)9")
    .replaceAll("m∆", "m(maj7)")
    .replaceAll("+∆#9", "+maj7#9")
    .replaceAll("+∆9", "+maj9")
    .replaceAll("+∆", "+maj7")
    .replaceAll("∆13", "maj13")
    .replaceAll("∆9", "maj9")
    .replaceAll("∆(b5)", "maj7(b5)")
    .replaceAll("∆", "maj7");
}

function parsedSuffixForVisibleSuffix(suffix) {
  return window.TonalAnalysis?.parseChord?.(`C${suffix || ""}`)?.suffix || "";
}

function suffixFamilyForDisplay(suffix) {
  const normalized = parsedSuffixForVisibleSuffix(suffix);
  if (!normalized && !String(suffix || "").trim()) return "major";
  if (/^m7b5/.test(normalized)) return "halfdim";
  if (/^dim/.test(normalized)) return "dim";
  if (/^m/.test(normalized)) return "minor";
  if (/^\+maj|^maj7#5/.test(normalized)) return "augMajor";
  if (/^\+7|^7|^9|^13|7alt/.test(normalized)) return "dominant";
  if (/^maj|^6$|^$/.test(normalized)) return "major";
  return normalized || String(suffix || "");
}

function extensionRankForSuffix(suffix) {
  const normalized = parsedSuffixForVisibleSuffix(suffix);
  if (/13/.test(normalized)) return 13;
  if (/11|#11/.test(normalized)) return 11;
  if (/9|b9|#9/.test(normalized)) return 9;
  if (/maj|∆|7|dim|m7b5|\+7/.test(normalized)) return 7;
  if (/6/.test(normalized)) return 6;
  return 5;
}

function suffixAlterationsForDisplay(suffix) {
  const normalized = parsedSuffixForVisibleSuffix(suffix);
  if (/alt/.test(normalized)) return ["alt"];
  return normalized.match(/(?:b5|#5|b9|#9|#11|b13)/g) || [];
}

function suffixPreservesAlterations(originalSuffix, candidateSuffix) {
  const candidate = parsedSuffixForVisibleSuffix(candidateSuffix);
  return suffixAlterationsForDisplay(originalSuffix).every(alteration => candidate.includes(alteration));
}

function extendedSuffixForFixedChord(parsed, mode) {
  const isDiminishedChord = parsed.suffix === "dim" || parsed.suffix === "dim7";
  const rawSuffix = isDiminishedChord ? "°7(b13)" : (TONAL_MODE_CHORD_SUFFIXES[tonalModeKey(mode)]?.extended || "");
  if (!rawSuffix) return "";

  const candidateSuffix = normalizeDeltaSuffixForVisibleChord(rawSuffix);
  if (suffixFamilyForDisplay(parsed.displaySuffix || parsed.suffix) !== suffixFamilyForDisplay(candidateSuffix)) return "";
  if (!suffixPreservesAlterations(parsed.displaySuffix || parsed.suffix, candidateSuffix)) return "";
  if (extensionRankForSuffix(candidateSuffix) < extensionRankForSuffix(parsed.displaySuffix || parsed.suffix)) return "";
  return candidateSuffix;
}

function modalSuffixForVisibleChord(parsed, mode) {
  const isDiminishedChord = parsed.suffix === "dim" || parsed.suffix === "dim7";
  const rawSuffix = chordDetailMode === "extended" && isDiminishedChord
    ? "°7(b13)"
    : chordSuffixForDisplayMode(mode || "");
  if (!rawSuffix) return "";

  const candidateSuffix = normalizeDeltaSuffixForVisibleChord(rawSuffix);
  const originalSuffix = parsed.displaySuffix || parsed.suffix;
  if (suffixFamilyForDisplay(originalSuffix) !== suffixFamilyForDisplay(candidateSuffix)) return "";
  if (!suffixPreservesAlterations(originalSuffix, candidateSuffix)) return "";
  if (extensionRankForSuffix(candidateSuffix) < extensionRankForSuffix(originalSuffix)) return "";
  return candidateSuffix;
}

function visibleChordForSlot(slot) {
  const original = String(slot?.chord || "");
  if (!original) return "";

  if (!window.TonalAnalysis?.parseChord) return original;
  const parsed = window.TonalAnalysis.parseChord(original);
  if (!parsed?.root) return original;

  if (slot?.chordFixed) {
    const suffix = chordDetailMode === "extended"
      ? extendedSuffixForFixedChord(parsed, slot.mode || "")
      : "";
    return suffix
      ? `${parsed.root}${suffix}${parsed.bass ? `/${parsed.bass}` : ""}`
      : original;
  }

  const suffix = modalSuffixForVisibleChord(parsed, slot.mode || "");
  if (!suffix) return original;

  return `${parsed.root}${suffix}${parsed.bass ? `/${parsed.bass}` : ""}`;
}

function clearEvaluationIssues(render = true) {
  if (!evaluationIssues.size) return;
  evaluationIssues.clear();
  if (render) renderAll(false);
}

function captureAppState() {
  return {
    app: "analizador-armonico-svg-pro",
    exportVersion: 44,
    document: serializableSong(),
    uiState: {
      selected,
      selectedRhythm,
      currentFilename,
      currentStandardFilename,
      assistanceMode,
      analysisVisibility,
      chordDetailMode,
      settingsPanelOpen: !els.settingsPanel.classList.contains("closed"),
      measurePanelOpen: false
    }
  };
}

function normalizeImportedState(raw) {
  if (raw?.document) {
    return {
      document: normalizeSong(raw.document),
      uiState: raw.uiState || {}
    };
  }

  return {
    document: normalizeSong(raw),
    uiState: {}
  };
}

function resetHistory() {
  historyStack = [JSON.stringify(captureAppState())];
  redoStack = [];
  refreshUndoRedoButtons();
}

function pushHistory() {
  if (isRestoringState) return;
  const snapshot = JSON.stringify(captureAppState());
  if (historyStack[historyStack.length - 1] === snapshot) {
    refreshUndoRedoButtons();
    return;
  }
  historyStack.push(snapshot);
  if (historyStack.length > 150) historyStack.shift();
  redoStack = [];
  refreshUndoRedoButtons();
}

async function applyAppState(rawState, dirtyAfter = true) {
  const state = normalizeImportedState(rawState);
  isRestoringState = true;
  song = state.document;
  selected = state.uiState.selected || { page: 0, measure: 0 };
  selectedRhythm = state.uiState.selectedRhythm || { page: selected.page || 0, measure: selected.measure || 0, sources: [], tuplets: [], openTuplet: null };
  selectedRhythm.sources = Array.isArray(selectedRhythm.sources) ? selectedRhythm.sources : [];
  selectedRhythm.sourceKeys = Array.isArray(selectedRhythm.sourceKeys)
    ? selectedRhythm.sourceKeys
    : selectedRhythm.sources.map(rhythmSourceKey).filter(Boolean);
  selectedRhythm.tuplets = Array.isArray(selectedRhythm.tuplets) ? selectedRhythm.tuplets : [];
  selectedRhythm.openTuplet = selectedRhythm.openTuplet || null;
  selectedRhythm.insertPosition = Number.isFinite(Number(selectedRhythm.insertPosition)) ? Number(selectedRhythm.insertPosition) : null;
  selectedRhythm.entryMode = selectedRhythm.entryMode === "cursor" || selectedRhythm.entryMode === "selection" ? selectedRhythm.entryMode : null;
  selectedRhythm.slashCycleTarget = selectedRhythm.slashCycleTarget || null;
  assistanceMode = state.uiState.assistanceMode === "manual" ? "manual" : "assisted";
  analysisVisibility = state.uiState.analysisVisibility === "hidden" ? "hidden" : "visible";
  chordDetailMode = state.uiState.chordDetailMode === "extended" ? "extended" : "basic";
  const restoredStandardFilename = state.uiState.currentStandardFilename || null;
  if (restoredStandardFilename !== currentStandardFilename) currentStandardSource = null;
  currentStandardFilename = restoredStandardFilename;
  evaluationIssues.clear();
  currentFilename = state.uiState.currentFilename || currentFilename;
  if (assistanceMode === "assisted") updateOriginScalesFromCurrentAnalysis(false);
  await registerLocalFonts();
  renderSettingsForm();
  renderLocalFontsList();
  updateAssistanceModeControls();
  updateAnalysisVisibilityControls();
  updateChordDetailModeControls();
  updateStandardSaveControls();
  renderAll();

  const settingsOpen = !!state.uiState.settingsPanelOpen;
  els.settingsPanel.classList.toggle("closed", !settingsOpen);
  document.body.classList.toggle("settingsOpen", settingsOpen);

  els.measurePanel.classList.add("hidden");

  setDirty(dirtyAfter);
  isRestoringState = false;
}

async function undo() {
  if (historyStack.length <= 1) return;
  const current = historyStack.pop();
  redoStack.push(current);
  await applyAppState(JSON.parse(historyStack[historyStack.length - 1]), true);
  refreshUndoRedoButtons();
}

async function redo() {
  if (!redoStack.length) return;
  const snapshot = redoStack.pop();
  historyStack.push(snapshot);
  await applyAppState(JSON.parse(snapshot), true);
  refreshUndoRedoButtons();
}

function refreshUndoRedoButtons() {
  if (els.undoBtn) els.undoBtn.disabled = historyStack.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = redoStack.length === 0;
}


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampText(value, min, max) {
  if (max < min) return min;
  return clamp(value, min, max);
}

function placeSettingsPanel() {
  const panel = els.settingsPanel;
  if (!panel || panel.classList.contains("closed")) return;

  const anchor = els.adminOpenAppearanceBtn || els.toggleSettingsBtn;
  const rect = anchor
    ? anchor.getBoundingClientRect()
    : { left: window.innerWidth - 720 - 12, bottom: 44 };
  const width = Math.min(720, window.innerWidth - 24);
  const height = Math.min(panel.scrollHeight, window.innerHeight - 88);
  const left = clamp(rect.left, 12, window.innerWidth - width - 12);
  const top = clamp(rect.bottom + 8, 52, window.innerHeight - height - 12);

  panel.style.width = `${width}px`;
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.maxHeight = `${window.innerHeight - top - 12}px`;
}

function placeMeasurePanel(pageIndex, measureIndex) {
  const panel = els.measurePanel;
  if (!panel || panel.classList.contains("hidden")) return;

  const anchor = document.querySelector(`.measureHit[data-page="${pageIndex}"][data-measure="${measureIndex}"]`);
  if (!anchor) return;

  const rect = anchor.getBoundingClientRect();
  const width = panel.offsetWidth || 420;
  const height = Math.min(panel.scrollHeight, window.innerHeight - 84);
  const offset = 12;

  let left = rect.right + offset;
  if (left + width > window.innerWidth - 12) {
    left = rect.left - width - offset;
  }
  if (left < 12) {
    left = clamp(window.innerWidth - width - 12, 12, window.innerWidth - width - 12);
  }

  let top = rect.top;
  if (top + height > window.innerHeight - 12) {
    top = window.innerHeight - height - 12;
  }
  top = clamp(top, 54, window.innerHeight - height - 12);

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.maxHeight = `${window.innerHeight - top - 12}px`;
}


function getSelectedPage() {
  return song.pages[selected.page];
}

function setSelectedMeasureBar(field, value) {
  const measure = getSelectedMeasure();
  if (!measure) return;
  measure[field] = value;
  if (field === "rightBar") maybeAutoDetectFormFromBar(value);
  setDirty(true);
  renderAll(false);
}


function connectorSpanValue(value) {
  return Number(value) === 2 ? 2 : 1;
}

function connectorCycleOptions() {
  return [
    { arrow: "", span: 1 },
    { arrow: "->", span: 1 },
    { arrow: "-->", span: 1 },
    { arrow: "[]", span: 1 },
    { arrow: "[--]", span: 1 }
  ];
}

function connectorStateIndex(arrow, span = 1) {
  const cleanArrow = String(arrow || "").trim();
  const cleanSpan = cleanArrow ? connectorSpanValue(span) : 1;
  return connectorCycleOptions().findIndex(option =>
    option.arrow === cleanArrow && option.span === cleanSpan
  );
}

function cycleConnectorState(currentArrow, currentSpan = 1) {
  const order = connectorCycleOptions();
  const index = connectorStateIndex(currentArrow, 1);
  return order[(index + 1) % order.length];
}

function cycleConnectorAt(pageIndex, measureIndex, slotIndex) {
  const measure = song.pages[pageIndex]?.measures?.[measureIndex];
  if (!measure?.slots?.[slotIndex]) return;

  selected = { page: pageIndex, measure: measureIndex };
  selectedSlot = slotIndex;

  const slot = measure.slots[slotIndex];
  const current = isAnalysisVisible() || slot._connectorEditedWhileHidden
    ? (slot.arrow || "")
    : "";
  const next = cycleConnectorState(current, slot.arrowSpan);
  slot.arrow = next.arrow;
  slot.arrowSpan = next.span;
  if (!isAnalysisVisible()) slot._connectorEditedWhileHidden = true;

  setDirty(true);
  renderAll(false);
}


function getThreeChordPositions(measure) {
  return [1, 3, Number(measure?.thirdChordPosition || 4) === 2 ? 2 : 4];
}

function toggleThirdChordPosition() {
  const measure = getSelectedMeasure();
  if (!measure) return;
  measure.thirdChordPosition = Number(measure.thirdChordPosition || 4) === 2 ? 4 : 2;
  setDirty(true);
  renderAll(false);
}

function syncThirdChordPositionButton() {
  if (!els.thirdChordPosBtn) return;
  const measure = getSelectedMeasure();
  const pos = Number(measure?.thirdChordPosition || 4) === 2 ? 2 : 4;
  els.thirdChordPosBtn.textContent = `3er acorde: ${pos}`;
  els.thirdChordPosBtn.title = `Alternar posición del 3er acorde cuando hay 3 acordes. Actual: posición ${pos}`;
}

function setSelectedConnector(value) {
  const measure = getSelectedMeasure();
  if (!measure) return;
  const slot = measure.slots[Math.max(0, Math.min(3, selectedSlot || 0))];
  if (!slot) return;
  slot.arrow = value;
  slot.arrowSpan = 1;
  setDirty(true);
  renderAll(false);
}

function setSelectedConnectorSpan(span) {
  const measure = getSelectedMeasure();
  if (!measure) return false;

  const slot = measure.slots[Math.max(0, Math.min((measure.slots.length || 1) - 1, selectedSlot || 0))];
  if (!slot || !connectorClass(slot.arrow)) return false;

  const nextSpan = connectorSpanValue(span);
  if (connectorSpanValue(slot.arrowSpan) === nextSpan) return true;

  slot.arrowSpan = nextSpan;
  if (!isAnalysisVisible()) slot._connectorEditedWhileHidden = true;
  setDirty(true);
  renderAll(false);
  return true;
}

function handleConnectorSpanShortcut(event) {
  if (!event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return false;
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return false;
  if (!els.inlineEditor?.classList.contains("hidden")) return false;

  const active = document.activeElement;
  if (active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) return false;
  if (active?.isContentEditable) return false;

  const handled = setSelectedConnectorSpan(event.key === "ArrowRight" ? 2 : 1);
  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
  return handled;
}

function openMeasureFieldInline(field, fallback) {
  const measure = getSelectedMeasure();
  if (!measure) return;
  if (!measure[field]) {
    measure[field] = fallback || "";
    renderAll(false);
  }
  requestAnimationFrame(() => {
    const target = document.querySelector(`[data-kind="measureField"][data-page="${selected.page}"][data-measure="${selected.measure}"][data-field="${field}"]`);
    if (target) {
      showInlineEditor(target);
    }
  });
}


function svgTitle(value) {
  // Los tooltips nativos de SVG tienen delay. Se mantiene esta función
  // solo por compatibilidad, pero la interfaz usa tooltips HTML inmediatos.
  const title = svgEl("title", {});
  title.textContent = value;
  return title;
}

function hitRect(attrs, tooltip) {
  const rect = svgEl("rect", attrs);
  if (tooltip) rect.setAttribute("data-tooltip", tooltip);
  if (["rhythmPulse", "rhythmMeasure", "rhythmItem", "rhythmTuplet"].includes(attrs?.["data-kind"])) {
    rect.addEventListener("pointerdown", handleSvgRhythmPointerDown);
  }
  return rect;
}

function getItemOffset(container, field) {
  const offset = container?.offsets?.[field];
  return {
    x: Number(offset?.x || 0),
    y: Number(offset?.y || 0)
  };
}

function setItemOffset(container, field, x, y) {
  if (!container) return;
  if (!container.offsets) container.offsets = {};
  container.offsets[field] = {
    x: Number(x || 0),
    y: Number(y || 0)
  };
}

function getSlotAt(pageIndex, measureIndex, slotIndex) {
  return song.pages[pageIndex]?.measures?.[measureIndex]?.slots?.[slotIndex];
}

function getMeasureAt(pageIndex, measureIndex) {
  return song.pages[pageIndex]?.measures?.[measureIndex];
}



let categoryDrag = null;
let suppressNextClick = false;
let suppressNextClickTimer = null;

function suppressFollowingClick(duration = 0) {
  suppressNextClick = true;
  if (suppressNextClickTimer) clearTimeout(suppressNextClickTimer);
  suppressNextClickTimer = setTimeout(() => {
    suppressNextClick = false;
    suppressNextClickTimer = null;
  }, duration);
}

function bindCategoryDrag() {
  document.addEventListener("contextmenu", event => {
    if ((event.ctrlKey || event.metaKey || event.altKey) && event.target.closest?.("[data-kind]")) {
      event.preventDefault();
    }
  });

	  document.addEventListener("pointerdown", event => {
	    const target = event.target.closest?.("[data-kind]");
	    if (!target) return;

	    if (target.dataset.kind === "connectorHandle") {
	      beginConnectorHandleDrag(event, target);
	      return;
	    }

	    if (target.dataset.kind === "systemDragControl") {
	      beginSystemDrag(event, target);
	      return;
	    }

	    const isGlobalDrag = event.ctrlKey || event.metaKey;
	    const isSingleDrag = event.altKey && !isGlobalDrag;

    if (!isGlobalDrag && !isSingleDrag) return;

    const dragConfig = isSingleDrag
      ? getSingleDragConfigForTarget(target)
      : getDragConfigForTarget(target);

    if (!dragConfig) return;

    event.preventDefault();
    event.stopPropagation();
    hideCanvasTooltip();

    if (isSingleDrag) {
      const startOffset = getOffsetForSingleDragConfig(dragConfig);
      categoryDrag = {
        mode: "single",
        target,
        config: dragConfig,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startValues: { x: startOffset.x, y: startOffset.y }
      };
    } else {
      categoryDrag = {
        mode: "global",
        target,
        config: dragConfig,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startValues: Object.fromEntries(dragConfig.keys.map(key => [key, Number(song.settings[key] || 0)]))
      };
    }

    document.body.classList.add("categoryDragging");
    target.setPointerCapture?.(event.pointerId);
  }, true);

  document.addEventListener("pointermove", event => {
    if (!categoryDrag) return;

    event.preventDefault();
    const dx = event.clientX - categoryDrag.startClientX;
    const dy = event.clientY - categoryDrag.startClientY;

	    if (categoryDrag.mode === "single") {
	      setOffsetForSingleDragConfig(
        categoryDrag.config,
        categoryDrag.startValues.x + dx,
        categoryDrag.startValues.y + dy
      );
      renderAll(false);
	      return;
	    }

	    if (categoryDrag.mode === "connectorHandle") {
	      updateConnectorHandleDrag(event, false);
	      renderAll(false);
	      return;
	    }

	    if (categoryDrag.mode === "systemDrag") {
	      updateSystemDrag(event);
	      renderAll(false);
	      return;
	    }

    const pageW = Number(song.settings.pageWidth || 1100);
    const usableW = Math.max(1, pageW - Number(song.settings.marginLeft || 0) - Number(song.settings.marginRight || 0));

    categoryDrag.config.keys.forEach(key => {
      if (key === "titleX" || key === "composerX") {
        song.settings[key] = categoryDrag.startValues[key] + dx / usableW;
      } else if (key.endsWith("X") || key.endsWith("XOffset")) {
        song.settings[key] = categoryDrag.startValues[key] + dx;
      } else if (key.endsWith("Y")) {
        song.settings[key] = categoryDrag.startValues[key] + dy;
      }
    });

    renderAll(false);
  }, true);

	  document.addEventListener("pointerup", event => {
	    if (!categoryDrag) return;
	    event.preventDefault();
	    if (categoryDrag.mode === "connectorHandle") {
	      updateConnectorHandleDrag(event, true);
	    }
	    categoryDrag = null;
    suppressFollowingClick(0);
    document.body.classList.remove("categoryDragging");
    setDirty(true);
    renderAll();
	  }, true);
	}

function svgPointerMetrics(svg) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox?.baseVal;
  return {
    left: rect.left,
    top: rect.top,
    rectWidth: rect.width,
    rectHeight: rect.height,
    viewBoxX: viewBox?.x || 0,
    viewBoxY: viewBox?.y || 0,
    width: viewBox?.width || rect.width || Number(song.settings.pageWidth || 1100),
    height: viewBox?.height || rect.height || Number(song.settings.pageHeight || 850)
  };
}

function svgPointFromPointer(svg, event, metrics = null) {
  const source = metrics || svgPointerMetrics(svg);
  return {
    x: ((event.clientX - source.left) / Math.max(1, source.rectWidth)) * source.width + source.viewBoxX,
    y: ((event.clientY - source.top) / Math.max(1, source.rectHeight)) * source.height + source.viewBoxY
  };
}

function normalizeConnectorShape(value) {
  const source = value && typeof value === "object" ? value : {};
  const legacyCurve = source.curveY === undefined ? source.curve : source.curveY;
  const curveX = Number(source.curveX || 0);
  const curveY = Number(legacyCurve || 0);
  return {
    startX: Number(source.startX || 0),
    startY: Number(source.startY || 0),
    endX: Number(source.endX || 0),
    endY: Number(source.endY || 0),
    curveX,
    curveY,
    mainCurveX: source.mainCurveX === undefined ? curveX : Number(source.mainCurveX || 0),
    mainCurveY: source.mainCurveY === undefined ? curveY : Number(source.mainCurveY || 0),
    continuationCurveX: source.continuationCurveX === undefined ? curveX : Number(source.continuationCurveX || 0),
    continuationCurveY: source.continuationCurveY === undefined ? curveY : Number(source.continuationCurveY || 0)
  };
}

function connectorSegmentShape(shape = {}, segment = "") {
  const normalized = normalizeConnectorShape(shape);
  if (segment === "continuation") {
    return {
      ...normalized,
      curveX: Number(normalized.continuationCurveX || 0),
      curveY: Number(normalized.continuationCurveY || 0)
    };
  }
  if (segment === "main") {
    return {
      ...normalized,
      curveX: Number(normalized.mainCurveX || 0),
      curveY: Number(normalized.mainCurveY || 0)
    };
  }
  return normalized;
}

function compactConnectorShape(shape) {
  const normalized = normalizeConnectorShape(shape);
  const out = {};
  Object.entries(normalized).forEach(([key, value]) => {
    if (Math.abs(Number(value || 0)) >= 0.01) out[key] = Number(value);
  });
  return out;
}

function setConnectorShapeValue(slot, shape) {
  if (!slot) return;
  const compact = compactConnectorShape(shape);
  if (Object.keys(compact).length) {
    slot.connectorShape = compact;
  } else {
    delete slot.connectorShape;
  }
}

function beginSystemDrag(event, target) {
  event.preventDefault();
  event.stopPropagation();
  hideCanvasTooltip();
  const svg = target.closest("svg");
  const svgMetrics = svgPointerMetrics(svg);
  const startPoint = svgPointFromPointer(svg, event, svgMetrics);
  const pageIndex = Number(target.dataset.page);
  const systemIndex = Number(target.dataset.system);
  const page = song.pages?.[pageIndex];
  const systems = page ? pageSystemsWithY(page, scoreSettings()) : [];
  const system = systems.find(item => item.systemIndex === systemIndex);
  const startOffset = systemManualYOffset(system?.measures || []);

  categoryDrag = {
    mode: "systemDrag",
    target,
    svg,
    svgMetrics,
    page: pageIndex,
    system: systemIndex,
    startPoint,
    startOffset
  };
  document.body.classList.add("categoryDragging");
  target.setPointerCapture?.(event.pointerId);
}

function updateSystemDrag(event) {
  if (!categoryDrag || categoryDrag.mode !== "systemDrag") return;
  const point = svgPointFromPointer(categoryDrag.svg, event, categoryDrag.svgMetrics);
  const dy = point.y - categoryDrag.startPoint.y;
  setSystemManualYOffset(categoryDrag.page, categoryDrag.system, categoryDrag.startOffset + dy);
}

function connectorDragGeometryForTarget(target) {
  const pageIndex = Number(target.dataset.page);
  const measureIndex = Number(target.dataset.measure);
  const slotIndex = Number(target.dataset.slot);
  const page = song.pages?.[pageIndex];
  if (!page) return null;
  const geoms = computePageGeometries(page);
  const measure = page.measures?.[measureIndex];
  const slot = measure?.slots?.[slotIndex];
  if (!slot || !connectorClass(slot.arrow)) return null;
  const entry = { slot, slotIndex };
  const next = findNextVisibleSlot(page, measureIndex, slotIndex, slot.arrowSpan);
  const fromPoint = slotPointFromEntryForPage(page, geoms, measureIndex, entry);
  const toPoint = next ? slotPointFromEntryForPage(page, geoms, next.measureIndex, next.entry) : null;
  if (!fromPoint || !toPoint) return null;
  const base = connectorBaseGeometry(page, geoms, measureIndex, entry, next, connectorClass(slot.arrow));
  return { page, geoms, slot, entry, next, fromPoint, toPoint, base };
}

function beginConnectorHandleDrag(event, target) {
  const geometry = connectorDragGeometryForTarget(target);
  if (!geometry) return;
  event.preventDefault();
  event.stopPropagation();
  hideCanvasTooltip();
  const svg = target.closest("svg");
  const svgMetrics = svgPointerMetrics(svg);
  const startPoint = svgPointFromPointer(svg, event, svgMetrics);
  const shape = normalizeConnectorShape(geometry.slot.connectorShape);
  categoryDrag = {
    mode: "connectorHandle",
    target,
    svg,
    svgMetrics,
    handle: target.dataset.handle,
    segment: target.dataset.segment || "",
    page: Number(target.dataset.page),
    measure: Number(target.dataset.measure),
    slot: Number(target.dataset.slot),
    startPoint,
    startShape: shape,
    geometry
  };
  document.body.classList.add("categoryDragging");
  target.setPointerCapture?.(event.pointerId);
}

function updateConnectorHandleDrag(event, finalize = false) {
  if (!categoryDrag || categoryDrag.mode !== "connectorHandle") return;
  const slot = getSlotAt(categoryDrag.page, categoryDrag.measure, categoryDrag.slot);
  if (!slot) return;

  const point = svgPointFromPointer(categoryDrag.svg, event, categoryDrag.svgMetrics);
  const dx = point.x - categoryDrag.startPoint.x;
  const dy = point.y - categoryDrag.startPoint.y;
  const shape = { ...categoryDrag.startShape };

  if (categoryDrag.handle === "start") {
    shape.startX += dx;
    shape.startY += dy;
  } else if (categoryDrag.handle === "end") {
    shape.endX += dx;
    shape.endY += dy;
  } else {
    const segment = categoryDrag.segment === "continuation" ? "continuation" : "main";
    const startSegmentShape = connectorSegmentShape(categoryDrag.startShape, segment);
    const curveLimit = connectorCurveXLimit(categoryDrag.geometry?.base, categoryDrag.startShape, segment);
    const nextCurveX = clamp(startSegmentShape.curveX + dx, -curveLimit, curveLimit);
    const nextCurveY = clamp(startSegmentShape.curveY - dy, 0, 140);
    if (segment === "continuation") {
      shape.continuationCurveX = nextCurveX;
      shape.continuationCurveY = nextCurveY;
    } else {
      shape.mainCurveX = nextCurveX;
      shape.mainCurveY = nextCurveY;
    }
  }

  if (finalize && categoryDrag.handle === "end") {
    const snap = nearestConnectorTarget(categoryDrag, point);
    if (snap) {
      slot.arrowSpan = snap.span;
      shape.endX = 0;
      shape.endY = 0;
    }
  }

  setConnectorShapeValue(slot, shape);
  if (!isAnalysisVisible()) slot._connectorEditedWhileHidden = true;
}

function connectorCurveSegmentPoints(base, shape = {}, segment = "") {
  if (!base) return null;
  const sharedX = base.connectorXOffset + base.localConnectorOffset.x;
  const sharedY = base.connectorYOffset + base.localConnectorOffset.y;

  if (!base.sameSystem && segment === "continuation") {
    return {
      start: {
        x: base.continuationFrom + sharedX,
        y: base.continuationYFrom + sharedY
      },
      end: {
        x: base.continuationTo + sharedX + Number(shape.endX || 0),
        y: base.continuationYTo + sharedY + Number(shape.endY || 0)
      }
    };
  }

  return {
    start: {
      x: base.from + sharedX + Number(shape.startX || 0),
      y: base.yFrom + sharedY + Number(shape.startY || 0)
    },
    end: {
      x: (base.sameSystem ? base.to + Number(shape.endX || 0) : base.to) + sharedX,
      y: (base.sameSystem ? base.yTo + Number(shape.endY || 0) : base.yTo) + sharedY
    }
  };
}

function connectorCurveXLimit(base, shape = {}, segment = "") {
  const points = connectorCurveSegmentPoints(base, shape, segment);
  if (!points) return 0;
  const startX = points.start.x;
  const endX = points.end.x;
  return Math.max(0, Math.abs(endX - startX) / 2 - 12);
}

function nearestConnectorTarget(drag, point) {
  const page = song.pages?.[drag.page];
  if (!page) return null;
  const entries = filledChordSlots()
    .filter(entry => entry.pageIndex === drag.page)
    .filter(entry => {
      if (entry.measureIndex < drag.measure) return false;
      if (entry.measureIndex === drag.measure && entry.slotIndex <= drag.slot) return false;
      return true;
    });
  if (!entries.length) return null;
  const geoms = computePageGeometries(page);
  let best = null;
  entries.forEach(entry => {
    const slotPoint = slotPointFromEntryForPage(
      page,
      geoms,
      entry.measureIndex,
      { slot: entry.slot, slotIndex: entry.slotIndex }
    );
    if (!slotPoint) return;
    const distance = Math.hypot(slotPoint.x - point.x, slotPoint.y - point.y);
    if (!best || distance < best.distance) {
      best = { entry, distance };
    }
  });
  if (!best || best.distance > 68) return null;

  const span = entries.findIndex(entry =>
    entry.measureIndex === best.entry.measureIndex && entry.slotIndex === best.entry.slotIndex
  ) + 1;
  return { span: Math.max(1, Math.min(8, span)) };
}


function getSingleDragConfigForTarget(target) {
  const kind = target.dataset.kind;
  const field = target.dataset.field;

  if (kind === "slot" && ["chord", "mode", "degree", "sectionLabel", "originScale", "arrow"].includes(field)) {
    return {
      type: "slot",
      page: Number(target.dataset.page),
      measure: Number(target.dataset.measure),
      slot: Number(target.dataset.slot),
      field
    };
  }

  if (kind === "measureField" && ["form", "ending", "jump", "sectionLabel", "note"].includes(field)) {
    return {
      type: "measure",
      page: Number(target.dataset.page),
      measure: Number(target.dataset.measure),
      field
    };
  }

  return null;
}

function getOffsetForSingleDragConfig(config) {
  const container = config.type === "slot"
    ? getSlotAt(config.page, config.measure, config.slot)
    : getMeasureAt(config.page, config.measure);

  return getItemOffset(container, config.field);
}

function setOffsetForSingleDragConfig(config, x, y) {
  const container = config.type === "slot"
    ? getSlotAt(config.page, config.measure, config.slot)
    : getMeasureAt(config.page, config.measure);

  setItemOffset(container, config.field, x, y);
}

function getDragConfigForTarget(target) {
  const kind = target.dataset.kind;
  const field = target.dataset.field;

  if (kind === "song" && field === "title") return { keys: ["titleX", "titleY"] };
  if (kind === "song" && field === "composer") return { keys: ["composerX", "composerY"] };
  if (kind === "song" && field === "studentName") return { keys: ["studentNameX", "studentNameY"] };
  if (kind === "meta" && field === "pageNumber") return { keys: ["pageNumberXOffset", "pageNumberY"] };
  if (kind === "meta" && field === "systemMeasureNumber") return { keys: ["systemMeasureNumberX", "systemMeasureNumberY"] };

  if (kind === "slot" && field === "chord") return { keys: ["chordXOffset", "chordY"] };
  if (kind === "slot" && field === "mode") return { keys: ["modeXOffset", "modeY"] };
  if (kind === "slot" && field === "degree") return { keys: ["degreeXOffset", "degreeY"] };
  if (kind === "slot" && field === "sectionLabel") return { keys: ["sectionLabelXOffset", "sectionLabelY"] };
  if (kind === "slot" && field === "originScale") return { keys: ["noteXOffset", "noteY"] };

  if (kind === "measureField" && field === "form") return { keys: ["formX", "formY"] };
  if (kind === "measureField" && field === "ending") return { keys: ["endingStartX", "endingY"] };
  if (kind === "measureField" && field === "jump") return { keys: ["jumpXOffset", "jumpY"] };
  if (kind === "measureField" && field === "sectionLabel") return { keys: ["sectionLabelXOffset", "sectionLabelY"] };
  if (kind === "measureField" && field === "note") return { keys: ["noteXOffset", "noteY"] };
  if (kind === "slot" && field === "arrow") return { keys: ["connectorXOffset", "connectorYOffset"] };

  return null;
}

function bindCanvasTooltip() {
  if (!els.canvasTooltip) return;
  normalizeNativeTooltips();

  document.addEventListener("pointerover", event => {
    const target = tooltipTargetFromEvent(event);
    if (!target) return;
    showCanvasTooltip(target.getAttribute("data-tooltip"), event.clientX, event.clientY);
  });

  document.addEventListener("pointermove", event => {
    const target = tooltipTargetFromEvent(event);
    if (target) {
      showCanvasTooltip(target.getAttribute("data-tooltip"), event.clientX, event.clientY);
      return;
    }
    if (!els.canvasTooltip.classList.contains("hidden")) {
      positionCanvasTooltip(event.clientX, event.clientY);
    }
  });

  document.addEventListener("pointerout", event => {
    const from = tooltipTargetFromNode(event.target);
    const to = tooltipTargetFromNode(event.relatedTarget);
    if (from && from !== to) hideCanvasTooltip();
  });

  document.addEventListener("scroll", hideCanvasTooltip, true);
}

function tooltipTargetFromNode(node) {
  const target = node?.closest?.("[data-tooltip], [title]");
  if (!target) return null;
  if (!target.dataset.tooltip && target.getAttribute("title")) {
    target.dataset.tooltip = target.getAttribute("title");
    target.dataset.nativeTitle = target.getAttribute("title");
    target.removeAttribute("title");
  }
  return target.dataset.tooltip ? target : null;
}

function tooltipTargetFromEvent(event) {
  return tooltipTargetFromNode(event.target);
}

function normalizeNativeTooltips() {
  document.querySelectorAll("[title]").forEach(element => {
    if (!element.dataset.tooltip) element.dataset.tooltip = element.getAttribute("title") || "";
    element.dataset.nativeTitle = element.getAttribute("title") || "";
    element.removeAttribute("title");
  });
}

function showCanvasTooltip(text, clientX, clientY) {
  if (!text || !els.canvasTooltip) return;
  els.canvasTooltip.textContent = text;
  els.canvasTooltip.classList.remove("hidden");
  positionCanvasTooltip(clientX, clientY);
}

function positionCanvasTooltip(clientX, clientY) {
  const tooltip = els.canvasTooltip;
  const pad = 10;
  const rect = tooltip.getBoundingClientRect();
  let left = clientX + 12;
  let top = clientY + 12;

  if (left + rect.width > window.innerWidth - pad) left = clientX - rect.width - 12;
  if (top + rect.height > window.innerHeight - pad) top = clientY - rect.height - 12;

  tooltip.style.left = `${Math.max(pad, left)}px`;
  tooltip.style.top = `${Math.max(pad, top)}px`;
}

function hideCanvasTooltip() {
  els.canvasTooltip?.classList.add("hidden");
}

function renderDirectEditTargets(group, measure, pageIndex, measureIndex, x, y, w, h) {
  const s = scoreSettings();
  const entries = visibleSlotEntries(measure);
  const layout = entries.length
    ? layoutSlots(entries.map(entry => entry.slot), w, s, measure)
    : [];
  const slotFieldTargets = [
    ["sectionLabel", Number(s.sectionLabelY || 72) - Math.max(18, Number(s.sectionLabelSize || 15)), Math.max(22, Number(s.sectionLabelSize || 15) + 10), "Tonalidad", Number(s.sectionLabelXOffset || 0)],
    ["chord", s.chordY - 22, Math.max(26, s.chordSize + 12), "Acorde", Number(s.chordXOffset || 0)],
    ["mode", s.modeY - 16, Math.max(20, s.modeSize + 12), "Modo", Number(s.modeXOffset || 0)],
    ["degree", s.degreeY - 22, Math.max(26, s.degreeSize + 12), "Grado", Number(s.degreeXOffset || 0)],
    ["originScale", Number(s.noteY || 108) - Math.max(8, Number(s.noteSize || 12) * 0.65), Math.max(22, Number(s.noteSize || 12) + 10), "Escala de origen", Number(s.noteXOffset || 0)]
  ];

  const pulseSlotCount = Math.max(4, measure.slots?.length || 4);
  const pulseSlotW = w / Math.max(4, pulseSlotCount);

  // Si hay acordes visibles, los hitboxes siguen exactamente su layout real.
  // Si el compás está vacío, se usan cuatro zonas regulares para permitir escribir.
  if (entries.length) {
    const occupiedPulses = new Set(layout.map(item => item.position).filter(Boolean));

    for (let pulse = 1; pulse <= pulseSlotCount; pulse++) {
      if (occupiedPulses.has(pulse)) continue;
      const insertionIndex = insertionSlotIndexForVisualPulse(entries, layout, pulse);
      const slot = measure.slots?.[insertionIndex] || makeEmptySlot();
      const itemOffset = getItemOffset(slot, "chord");
      const emptyHitW = Math.max(22, Math.min(34, pulseSlotW - 12));
      const hitX = x + pulseSlotW * (pulse - 1) + (pulseSlotW - emptyHitW) / 2 + Number(s.chordXOffset || 0) + itemOffset.x;
      const hitY = y + s.chordY - 22 + itemOffset.y;
      group.appendChild(hitRect({
        x: hitX,
        y: hitY,
        width: emptyHitW,
        height: Math.max(26, s.chordSize + 12),
        class: "hit directFieldHit emptySlotHit",
        "data-kind": "slot",
        "data-page": pageIndex,
        "data-measure": measureIndex,
        "data-slot": insertionIndex,
        "data-empty-pulse": "true",
        "data-visual-pulse": pulse,
        "data-field": "chord",
        "data-tooltip": "Acorde"
      }, "Acorde"));
      renderPulseNumberGuide(group, hitX, hitY, pulse);
    }

    entries.forEach((entry, visualIndex) => {
      const l = layout[visualIndex];
      const cx = x + l.center;
      const maxPulseHitW = Math.max(30, pulseSlotW - 8);
      const hitW = Math.max(30, Math.min(maxPulseHitW, l.width + 28));

      slotFieldTargets.map(target => target[0] === "chord"
        ? ["chord", s.chordY - 22, Math.max(26, l.chordSize + 12), "Acorde", Number(s.chordXOffset || 0)]
        : target
      ).forEach(([field, yy, hh, tooltip, offsetX]) => {
        const itemOffset = getItemOffset(entry.slot, field);
        const hitX = field === "sectionLabel"
          ? cx + offsetX + itemOffset.x - hitW - 8
          : cx + offsetX + itemOffset.x - hitW / 2;
        const hitY = y + yy + itemOffset.y;
        group.appendChild(hitRect({
          x: hitX,
          y: hitY,
          width: hitW,
          height: hh,
          class: "hit directFieldHit",
          "data-kind": "slot",
          "data-page": pageIndex,
          "data-measure": measureIndex,
          "data-slot": entry.slotIndex,
          "data-field": field,
          "data-tooltip": tooltip
        }, tooltip));
        if (field === "chord") {
          renderPulseNumberGuide(group, hitX, hitY, l.position || entry.slotIndex + 1);
        }
      });
    });
  } else {
    const slotW = w / 4;
    for (let slotIndex = 0; slotIndex < 4; slotIndex++) {
      const sx = x + slotW * slotIndex;
      slotFieldTargets.forEach(([field, yy, hh, tooltip, offsetX]) => {
        const slot = measure.slots[slotIndex];
        const itemOffset = getItemOffset(slot, field);
        const hitX = sx + 3 + offsetX + itemOffset.x;
        const hitY = y + yy + itemOffset.y;
        group.appendChild(hitRect({
          x: hitX,
          y: hitY,
          width: slotW - 6,
          height: hh,
          class: "hit directFieldHit",
          "data-kind": "slot",
          "data-page": pageIndex,
          "data-measure": measureIndex,
          "data-slot": slotIndex,
          "data-field": field,
          "data-tooltip": tooltip
        }, tooltip));
        if (field === "chord") {
          renderPulseNumberGuide(group, hitX, hitY, slotIndex + 1);
        }
      });
    }
  }

  // Conectores: entre acordes visibles y también entre último acorde del compás
  // y primer acorde del compás siguiente. El clic cicla el tipo de conector.
  if (entries.length >= 2) {
    for (let i = 0; i < entries.length - 1; i++) {
      const leftCenter = x + layout[i].center;
      const rightCenter = x + layout[i + 1].center;
      const gapCenter = (leftCenter + rightCenter) / 2;
      const zoneW = Math.max(32, Math.min(72, Math.abs(rightCenter - leftCenter) * 0.60));
      const connectorOffset = getItemOffset(entries[i].slot, "arrow");
      const zoneX = gapCenter - zoneW / 2 + Number(s.connectorXOffset || 0) + connectorOffset.x;
      const connectorZone = connectorHitZone(entries[i].slot, y, s, connectorOffset);

      group.appendChild(hitRect({
        x: zoneX,
        y: connectorZone.y,
        width: zoneW,
        height: connectorZone.height,
        class: "hit directFieldHit connectorHit",
        "data-kind": "slot",
        "data-page": pageIndex,
        "data-measure": measureIndex,
        "data-slot": entries[i].slotIndex,
        "data-field": "arrow",
        "data-tooltip": "Conector"
      }, "Conector"));
    }
  }

  if (entries.length) {
    const lastEntry = entries[entries.length - 1];
    const lastLayout = layout[layout.length - 1];
    const lastCenter = x + lastLayout.center;
    const connectorOffset = getItemOffset(lastEntry.slot, "arrow");
    const zoneX = Math.min(lastCenter + 18, x + w - 46) + Number(s.connectorXOffset || 0) + connectorOffset.x;
    const connectorZone = connectorHitZone(lastEntry.slot, y, s, connectorOffset);

    group.appendChild(hitRect({
      x: zoneX,
      y: connectorZone.y,
      width: Math.max(32, x + w - zoneX - 8),
      height: connectorZone.height,
      class: "hit directFieldHit connectorHit",
      "data-kind": "slot",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-slot": lastEntry.slotIndex,
      "data-field": "arrow",
      "data-tooltip": "Conector al siguiente compás"
    }, "Conector al siguiente compás"));
  }

  const structuralTargets = [
    ["form", x - 38, y + s.measureLineY - 28, 32, 30, "Forma"],
    ["ending", x + Number(s.endingStartX || 8) - 2, y + s.endingY - 10, 34, 30, "Casilla"],
    ["jump", x + w - 82 + Number(s.jumpXOffset || 0), y + s.jumpY - 22, 80, 32, "Salto"],
    ["rightBar", x + w - 18, y + s.barTop - 10, 36, h - s.barBottom - s.barTop + 20, "Barra derecha"]
  ];
  const measureSectionLabelVisible = shouldRenderMeasureAnalysisField(measure, "sectionLabel")
    && String(measure.sectionLabel || "").trim();
  if (measureSectionLabelVisible) {
    structuralTargets.splice(3, 0, [
      "sectionLabel",
      x + Number(s.sectionLabelXOffset || 0),
      y + Number(s.sectionLabelY || 72) - Math.max(18, Number(s.sectionLabelSize || 15)),
      Math.max(66, estimateTextWidth(measure.sectionLabel || "F:[", Number(s.sectionLabelSize || 15), s.sectionLabelFont || s.degreeFont) + 18),
      Math.max(22, Number(s.sectionLabelSize || 15) + 10),
      "Tonalidad"
    ]);
  }

  const isFirstMeasureInSystem = measureIndex % s.measuresPerSystem === 0;
  const leftBarType = barClass(measure.leftBar);

  // La barra izquierda de un compás interno simple coincide visualmente
  // con la barra derecha del compás anterior. Si dejamos ambos hitboxes,
  // el clic cae en el compás siguiente. Solo se activa la barra izquierda
  // cuando realmente hay una marca especial o estamos al inicio del sistema.
  if (isFirstMeasureInSystem || leftBarType !== "single") {
    structuralTargets.push(["leftBar", x - 13, y + s.barTop - 10, 28, h - s.barBottom - s.barTop + 20, "Barra izquierda"]);
  }

  structuralTargets.forEach(([field, xx, yy, ww, hh, tooltip]) => {
    const itemOffset = getItemOffset(measure, field);
    group.appendChild(hitRect({
      x: xx + itemOffset.x,
      y: yy + itemOffset.y,
      width: ww,
      height: hh,
      class: "hit directFieldHit structuralHit",
      "data-kind": "measureField",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-field": field,
      "data-tooltip": tooltip
    }, tooltip));
  });
}

function renderPulseNumberGuide(group, hitX, hitY, pulse) {
  group.appendChild(textEl(String(pulse || ""), {
    x: hitX + 4,
    y: hitY + 9,
    class: "hit pulseNumberGuide",
    "font-family": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    "font-size": 8,
    "font-weight": 650,
    "text-anchor": "start",
    "pointer-events": "none"
  }));
}

function connectorHitZone(slot, y, s, offset = { x: 0, y: 0 }) {
  const type = connectorClass(slot?.arrow);
  const isBracket = type === "bracketSolid" || type === "bracketDashed";
  const relativeTop = isBracket
    ? Number(s.chordY || 22) - Number(s.connectorBracketOffsetY || 6) - Number(s.connectorBracketHookHeight || 11) - 18
    : Number(s.chordY || 22) - Number(s.connectorCurveStartOffsetY || 18) - Number(s.connectorCurveLift || 15) - 18;

  return {
    y: y + relativeTop + Number(s.connectorYOffset || 0) + Number(offset.y || 0),
    height: isBracket ? 30 : 38
  };
}

function insertionSlotIndexForVisualPulse(entries, layout, pulse) {
  const nextIndex = layout.findIndex(item => Number(item.position || 0) > pulse);
  if (nextIndex >= 0) return entries[nextIndex]?.slotIndex ?? nextIndex;
  const lastEntry = entries[entries.length - 1];
  return Math.min((lastEntry?.slotIndex ?? entries.length - 1) + 1, entries.length);
}

function bindMeasurePanel() {
  els.closeMeasurePanelBtn.addEventListener("click", () => els.measurePanel.classList.add("hidden"));

  const bind = (input, prop) => {
    input.addEventListener("input", () => {
      const measure = getSelectedMeasure();
      if (!measure) return;
      const clean = normalizeAccidentals(input.value);
      measure[prop] = clean;
      if (input.value !== clean) input.value = clean;
      if (prop === "form") {
        measure._autoForm = false;
      } else if (prop === "rightBar") {
        maybeAutoDetectFormFromBar(clean);
      }
      setDirty(true);
      renderAll(false);
    });
  };

  bind(els.measureFormInput, "form");
  bind(els.measureEndingInput, "ending");
  bind(els.measureJumpInput, "jump");
  bind(els.measureLeftBarInput, "leftBar");
  bind(els.measureRightBarInput, "rightBar");

  els.clearMeasureBtn.addEventListener("click", () => {
    const measure = getSelectedMeasure();
    if (!measure) return;
    const keepBars = {
      leftBar: measure.leftBar,
      rightBar: measure.rightBar
    };
    Object.assign(measure, makeMeasure(), keepBars);
    setDirty(true);
    renderAll();
    showMeasurePanel(selected.page, selected.measure);
  });

  els.compactMeasureBtn.addEventListener("click", () => {
    const measure = getSelectedMeasure();
    if (!measure) return;
    measure.slots = compactSlots(measure.slots);
    setDirty(true);
    renderAll();
    showMeasurePanel(selected.page, selected.measure);
  });
}


function numericSettingDefault(key) {
  const value = Number(DEFAULT_SETTINGS[key]);
  return Number.isFinite(value) ? value : 0;
}

function numericSettingDelta(key, value) {
  const current = Number(value);
  const base = numericSettingDefault(key);
  if (!Number.isFinite(current)) return 0;
  return Math.round((current - base) * 1000) / 1000;
}

function numericSettingFromDelta(key, delta) {
  const next = numericSettingDefault(key) + Number(delta || 0);
  return Math.round(next * 1000) / 1000;
}

function settingInputDisplayValue(key, type, value) {
  if (type === "number" || type === "range") {
    return numericSettingDelta(key, value ?? DEFAULT_SETTINGS[key]);
  }
  return type === "color" ? normalizeColorValue(value) : value;
}

function quickRangeAttrs(key, minDelta, maxDelta, step = 1) {
  const value = settingInputDisplayValue(key, "range", song.settings[key] ?? DEFAULT_SETTINGS[key]);
  return `data-quick="${key}" data-relative-setting="true" type="range" min="${minDelta}" max="${maxDelta}" step="${step}" value="${value}"`;
}

function renderQuickAppearance() {
  if (!els.quickAppearance) return;

  const s = song.settings;
  els.quickAppearance.innerHTML = `
    <div class="quickGrid">
      <label>Fuente acordes
        <select data-quick="chordFont">
          ${getFontOptions().map(opt => `<option value="${escapeAttr(opt.value)}">${escapeHtml(opt.label)}</option>`).join("")}
        </select>
      </label>
      <label>Fuente grados
        <select data-quick="degreeFont">
          ${getFontOptions().map(opt => `<option value="${escapeAttr(opt.value)}">${escapeHtml(opt.label)}</option>`).join("")}
        </select>
      </label>
      <label>Tamaño acordes
        <input ${quickRangeAttrs("chordSize", -14, 14, 1)}>
      </label>
      <label>Tamaño grados
        <input ${quickRangeAttrs("degreeSize", -11, 11, 1)}>
      </label>
      <label>Espacio sistemas
        <input ${quickRangeAttrs("dynamicSystemGap", -34, 34, 1)}>
      </label>
      <label>Alto sistema
        <input ${quickRangeAttrs("systemHeight", -50, 50, 1)}>
      </label>
      <label>Color acordes
        <input data-quick="chordColor" type="color" value="${s.chordColor}">
      </label>
      <label>Color grados
        <input data-quick="degreeColor" type="color" value="${s.degreeColor}">
      </label>
    </div>
  `;

  els.quickAppearance.querySelectorAll("[data-quick]").forEach(input => {
    const key = input.dataset.quick;
    input.value = input.dataset.relativeSetting === "true"
      ? settingInputDisplayValue(key, input.type, song.settings[key] ?? DEFAULT_SETTINGS[key])
      : song.settings[key] ?? DEFAULT_SETTINGS[key];

    input.addEventListener("input", () => {
      const value = input.dataset.relativeSetting === "true"
        ? numericSettingFromDelta(key, Number(input.value))
        : input.type === "range"
          ? Number(input.value)
          : input.value;
      song.settings[key] = value;
      setDirty(true);
      renderAll(false);
    });
  });
}


function filterSettings(query) {
  const q = String(query || "").trim().toLowerCase();
  const sections = els.settingsForm?.querySelectorAll(".settingsSection") || [];

  sections.forEach(section => {
    let visibleRows = 0;
    section.querySelectorAll(".settingRow").forEach(row => {
      const text = row.textContent.toLowerCase();
      const show = !q || text.includes(q);
      row.style.display = show ? "" : "none";
      if (show) visibleRows++;
    });

    section.style.display = visibleRows ? "" : "none";
    if (q && visibleRows) section.open = true;
  });
}

function renderSettingsForm() {
  els.settingsForm.innerHTML = "";

  SETTINGS_SECTIONS.forEach((section, index) => {
    const details = document.createElement("details");
    details.className = "settingsSection";
    details.open = true;

    const summary = document.createElement("summary");
    summary.textContent = section.title;
    details.appendChild(summary);

    section.items.forEach(([key, label, type, options, step]) => {
      const row = document.createElement("div");
      row.className = "settingRow";

      const lab = document.createElement("label");
      lab.textContent = label;

      let input;
      if (type === "select" || type === "font") {
        input = document.createElement("select");
        const sourceOptions = type === "font" ? getFontOptions() : options.map(opt => ({ label: opt, value: opt }));
        sourceOptions.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt.value;
          option.textContent = opt.label;
          if (type === "font") option.style.fontFamily = opt.value;
          input.appendChild(option);
        });

        if (type === "font") {
          const customOption = document.createElement("option");
          customOption.value = "__custom__";
          customOption.textContent = "Personalizada…";
          input.appendChild(customOption);
        }
      } else {
        input = document.createElement("input");
        input.type = type;
        if (type === "number") {
          input.step = step || 1;
          input.dataset.relativeSetting = "true";
        }
      }

      input.dataset.setting = key;
      const currentValue = song?.settings?.[key] ?? DEFAULT_SETTINGS[key];
      if (type === "font" && !getFontOptions().some(opt => opt.value === currentValue)) {
        const customOption = Array.from(input.options).find(option => option.value === "__custom__");
        customOption.value = currentValue;
        customOption.textContent = `Personalizada: ${currentValue}`;
      }
      input.value = settingInputDisplayValue(key, type, currentValue);

      const applySettingChange = async () => {
        let value = readSettingInput(input, type);

        if (type === "font" && value === "__custom__") {
          const typed = await askTextInput({
            title: "Fuente personalizada",
            message: "Escribe una familia tipografica CSS. Ejemplo: Avenir Next, Helvetica, Arial, sans-serif",
            defaultValue: "",
            confirmText: "Usar"
          });
          if (!typed) {
            input.value = settingInputDisplayValue(key, type, song.settings[key] ?? DEFAULT_SETTINGS[key]);
            return;
          }
          value = typed;
          const customOption = Array.from(input.options).find(option => option.value === "__custom__");
          customOption.value = typed;
          customOption.textContent = `Personalizada: ${typed}`;
        }

        song.settings[key] = value;

        if (key === "orientation") {
          applyOrientation(value);
          syncSettingsFormValues();
        }

        if (key === "systemsPerPage" || key === "measuresPerSystem") {
          normalizeAllPagesMeasureCount();
        }

        if (key === "deltaToMaj7") {
          normalizeWholeDocumentContent(song);
        }

        setDirty(true);
        renderAll(false);
      };

      input.addEventListener(type === "color" ? "input" : "input", applySettingChange);
      if (type === "color") {
        input.addEventListener("change", applySettingChange);
      }

      row.appendChild(lab);
      row.appendChild(input);
      details.appendChild(row);
    });

    els.settingsForm.appendChild(details);
  });

  if (els.settingsSearchInput?.value) {
    filterSettings(els.settingsSearchInput.value);
  }
}

function syncSettingsFormValues() {
  els.settingsForm.querySelectorAll("[data-setting]").forEach(input => {
    const key = input.dataset.setting;
    const value = song.settings[key] ?? DEFAULT_SETTINGS[key];

    if (input.tagName === "SELECT" && key.endsWith("Font")) {
      const existingCustom = Array.from(input.options).filter(option => option.dataset.dynamic === "true");
      existingCustom.forEach(option => option.remove());

      if (!Array.from(input.options).some(option => option.value === value)) {
        const customOption = document.createElement("option");
        customOption.value = value;
        customOption.textContent = `Personalizada: ${value}`;
        customOption.dataset.dynamic = "true";
        input.appendChild(customOption);
      }
    }

    input.value = input.dataset.relativeSetting === "true"
      ? settingInputDisplayValue(key, input.type, value)
      : typeof value === "boolean"
      ? String(value)
      : input.type === "color"
        ? normalizeColorValue(value)
        : value;
  });
}

function normalizeColorValue(value) {
  const fallback = "#000000";
  if (!value) return fallback;

  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return "#" + value.slice(1).split("").map(ch => ch + ch).join("");
  }

  const tester = document.createElement("canvas").getContext("2d");
  if (!tester) return fallback;
  tester.fillStyle = fallback;
  tester.fillStyle = value;
  const normalized = tester.fillStyle;
  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized;
  return fallback;
}

function readSettingInput(input, type) {
  if (type === "number") {
    return input.dataset.relativeSetting === "true"
      ? numericSettingFromDelta(input.dataset.setting, Number(input.value))
      : Number(input.value);
  }
  if (type === "color") return normalizeColorValue(input.value);
  if (["showPageNumbers", "noteShowBox", "showSystemMeasureNumbers"].includes(input.dataset.setting)) return input.value === "true";
  return input.value;
}

function applyOrientation(value) {
  if (value === "portrait") {
    song.settings.pageWidth = 850;
    song.settings.pageHeight = 1100;
  } else {
    song.settings.pageWidth = 1100;
    song.settings.pageHeight = 850;
  }
}

function openBlankSongDialog() {
  if (!els.blankSongDialog || !els.blankMeasureCountInput) {
    createBlankSongWithMeasureCount(12);
    return;
  }

  els.blankMeasureCountInput.value = "12";
  if (els.blankSongWarning) {
    els.blankSongWarning.textContent = dirty
      ? "Tienes cambios sin guardar. Al crear un archivo nuevo se reemplazará la partitura actual."
      : "Crea una partitura vacía con la cantidad de compases que necesites.";
  }
  els.blankSongDialog.showModal();
  requestAnimationFrame(() => {
    els.blankMeasureCountInput?.focus();
    els.blankMeasureCountInput?.select();
  });
}

function createBlankSongFromDialog() {
  const raw = els.blankMeasureCountInput?.value || "12";
  const count = Math.round(Number(String(raw).replace(",", ".")));
  if (!(count >= 1 && count <= 256)) {
    alert("Escribe un número de compases entre 1 y 256.");
    return;
  }

  createBlankSongWithMeasureCount(count);
  els.blankSongDialog?.close();
}

function createBlankSongWithMeasureCount(measureCount) {
  song = makeBlankSong(measureCount);
  currentFilename = null;
  clearCurrentStandardSource();
  selected = { page: 0, measure: 0 };
  selectedSlot = 0;
  clearEvaluationIssues(false);
  analysisVisibility = "visible";
  updateAnalysisVisibilityControls();
  setDirty(false);
  renderAll();
  resetHistory();
}

function makeBlankSong(measureCount = null) {
  const count = Math.max(
    1,
    Math.min(
      256,
      Math.round(Number(measureCount) || Math.round(DEFAULT_SETTINGS.measuresPerSystem * DEFAULT_SETTINGS.systemsPerPage))
    )
  );

  return normalizeSong({
    version: 7,
    title: "SIN TÍTULO",
    composer: "",
    timeSignature: "4/4",
    settings: structuredClone(DEFAULT_SETTINGS),
    measures: Array.from({ length: count }, () => makeMeasure())
  });
}

function makeBlankPage() {
  const count = Math.max(1, Math.round(song?.settings?.measuresPerSystem || DEFAULT_SETTINGS.measuresPerSystem))
    * Math.max(1, Math.round(song?.settings?.systemsPerPage || DEFAULT_SETTINGS.systemsPerPage));

  return {
    measures: Array.from({ length: count }, () => makeMeasure())
  };
}

function makeMeasure() {
  return {
    pageBreakBefore: false,
    form: "",
    ending: "",
    jump: "",
    note: "",
    rhythm: "",
    leftBar: "|",
    rightBar: "|",
    thirdChordPosition: 4,
    offsets: {},
    sectionLabel: "",
    slots: Array.from({ length: 4 }, () => makeEmptySlot())
  };
}

function makeEmptySlot() {
  return { chord: "", mode: "", degree: "", sectionLabel: "", originScale: "", arrow: "", arrowSpan: 1, offsets: {} };
}

function ensureMeasureSlot(measure, slotIndex) {
  if (!measure || Number.isNaN(Number(slotIndex)) || Number(slotIndex) < 0) return null;
  if (!Array.isArray(measure.slots)) measure.slots = [];
  while (measure.slots.length <= Number(slotIndex)) {
    measure.slots.push(makeEmptySlot());
  }
  return measure.slots[Number(slotIndex)];
}

function makeDemoSong() {
  return makeBluesStudySong("bird-blues", DEFAULT_SETTINGS);
}

function makeBluesStudySong(key, settingsSource = null) {
  const definitions = {
    "blues-simple": {
      title: "BLUES SIMPLE",
      sectionLabel: "F:[",
      measures: [
        [["F7", "Mixo.", "I7", ""]],
        [["Bb7", "Mixo.", "IV7", ""]],
        [["F7", "Mixo.", "I7", ""]],
        [["%", "", "%", ""]],
        [["Bb7", "Mixo.", "IV7", ""]],
        [["%", "", "%", ""]],
        [["F7", "Mixo.", "I7", ""]],
        [["%", "", "%", ""]],
        [["C7", "Mixo.", "V7", ""]],
        [["Bb7", "Mixo.", "IV7", ""]],
        [["F7", "Mixo.", "I7", ""]],
        [["%", "", "%", ""]]
      ]
    },
    "jazz-blues": {
      title: "JAZZ BLUES",
      sectionLabel: "F:[",
      measures: [
        [["F7", "Mixo.", "I7", ""]],
        [["Bb7", "Mixo.", "IV7", ""], ["B°7", "Disminuida", "#IV°7", ""]],
        [["F7", "Mixo.", "I7", ""]],
        [["Cm7", "Dorico", "II-7/IV", ""], ["F7", "Mixo.", "V7/IV", "->"]],
        [["Bb7", "Mixo.", "IV7", ""]],
        [["B°7", "Disminuida", "#IV°7", ""]],
        [["F7", "Mixo.", "I7", ""]],
        [["Am7", "Eolico", "III-7", ""], ["D7", "Mixo.", "V7/II", "->"]],
        [["Gm7", "Dorico", "II-7", ""]],
        [["C7", "Mixo.", "V7", "->"]],
        [["Am7", "Eolico", "III-7", ""], ["D7", "Mixo.", "V7/II", "->"]],
        [["Gm7", "Dorico", "II-7", ""], ["C7", "Mixo.", "V7", "->"]]
      ]
    },
    "bird-blues": {
      title: "BIRD BLUES",
      sectionLabel: "F:[",
      measures: [
        [["Fmaj7", "Jonico", "Imaj7", ""]],
        [["Eø", "Locrio", "IIø/VI", ""], ["A7", "Mixo.", "V7/VI", "->"]],
        [["Dm7", "Eolico", "VI-7", ""], ["G7", "Mixo.", "V7/V", "->"]],
        [["Cm7", "Dorico", "II-7/IV", ""], ["F7", "Mixo.", "V7/IV", "->"]],
        [["Bb7", "Mixo.", "IV7", ""]],
        [["Bbm7", "Dorico", "IIm7sub/VI", ""], ["Eb7", "Mixo.", "V7sub/VI", "->"]],
        [["Am7", "Eolico", "III-7", ""], ["D7", "Mixo.", "V7/II", "->"]],
        [["Abm7", "Dorico", "IIm7sub/V", ""], ["Db7", "Mixo.", "Vsub/V", "->"]],
        [["Gm7", "Dorico", "II-7", ""]],
        [["C7", "Mixo.", "V7", "->"]],
        [["Am7", "Eolico", "III-7", ""], ["D7", "Mixo.", "V7/II", "->"]],
        [["Gm7", "Dorico", "II-7", ""], ["C7", "Mixo.", "V7", "->"]]
      ]
    },
    "minor-blues": {
      title: "MINOR BLUES",
      sectionLabel: "Cm:[",
      measures: [
        [["Cm7", "Menor arm.", "I-7", ""]],
        [["Fm7", "Dorico", "IV-7", ""]],
        [["Cm7", "Menor arm.", "I-7", ""]],
        [["%", "", "%", ""]],
        [["Fm7", "Dorico", "IV-7", ""]],
        [["%", "", "%", ""]],
        [["Cm7", "Menor arm.", "I-7", ""]],
        [["%", "", "%", ""]],
        [["Ab7", "Lidio b7", "Vsub/V", ""]],
        [["G7", "Mixo.b9b13", "V7", "->"]],
        [["Cm7", "Menor arm.", "I-7", ""]],
        [["%", "", "%", ""]]
      ]
    }
  };

  const definition = definitions[key] || definitions["bird-blues"];
  const measures = definition.measures.map((slots, index) =>
    m("", "", "", "|", index === definition.measures.length - 1 ? "||" : "|", slots)
  );
  measures[0].sectionLabel = definition.sectionLabel;
  const connectorEntries = measures.flatMap(measure =>
    writtenChordEntries(measure).map(entry => ({
      measure,
      slot: measure.slots[entry.slotIndex],
      analysisChord: entry.chord
    }))
  );
  applyAutomaticConnectors(connectorEntries, measures);

  return normalizeSong({
    version: 7,
    title: definition.title,
    composer: "",
    studentName: "",
    timeSignature: "4/4",
    settings: structuredClone(settingsSource || DEFAULT_SETTINGS),
    measures
  });
}

function m(form, ending, jump, leftBar, rightBar, slotTuples) {
  const measure = makeMeasure();
  measure.form = form;
  measure.ending = ending;
  measure.jump = jump;
  measure.note = "";
  measure.sectionLabel = "";
  measure.leftBar = leftBar;
  measure.rightBar = rightBar;
  slotTuples.forEach((slot, i) => {
    if (i < 4) {
	      measure.slots[i] = {
	        chord: normalizeChordSymbolInput(slot[0] || ""),
        mode: normalizeTextSymbols(slot[1] || ""),
        degree: normalizeDegreeInput(slot[2] || ""),
        sectionLabel: "",
        originScale: "",
        arrow: normalizeTextSymbols(slot[3] || ""),
        arrowSpan: 1,
        offsets: {}
      };
    }
  });
  return measure;
}

function normalizeSong(raw) {
  const settings = { ...DEFAULT_SETTINGS, ...(raw?.settings || {}) };
  if (Math.abs(Number(raw?.settings?.noteY || 0) - 103.2890625) < 0.001) {
    settings.noteY = DEFAULT_SETTINGS.noteY;
  }
  const pages = Array.isArray(raw?.pages) && raw.pages.length
    ? raw.pages.map(p => ({ measures: normalizeMeasures(p.measures || []) }))
    : splitMeasuresIntoPages(normalizeMeasures(raw?.measures || []), settings);

  const normalized = {
    version: 7,
    title: raw?.title || "SIN TÍTULO",
    composer: raw?.composer || "",
    studentName: raw?.studentName || "",
    timeSignature: normalizeTimeSignature(raw?.timeSignature || raw?.meter || raw?.TimeSignature || "4/4"),
    updatedAt: raw?.updatedAt || null,
    settings,
    pages: pages.length ? pages : [{ measures: [] }]
  };

  // No asignar aquí a la variable global `song`.
  // Durante `let song = makeDemoSong()` todavía está en inicialización
  // y asignarla desde normalizeSong() produce ReferenceError.
  if (Math.abs(Number(raw?.settings?.headerHeight || 0) - 74) < 0.001) {
    settings.headerHeight = DEFAULT_SETTINGS.headerHeight;
  }
  normalizeAllPagesMeasureCount(normalized);
  normalizeWholeDocumentContent(normalized);
  return normalized;
}

function normalizeMeasures(measures) {
  return (Array.isArray(measures) ? measures : []).map(normalizeMeasure);
}


function normalizeWholeDocumentContent(targetSong = song) {
  if (!targetSong?.pages) return targetSong;
  targetSong.pages.forEach(page => {
    (page.measures || []).forEach(measure => {
      if (!measure) return;
      migrateAutoSectionNote(measure);
      measure.form = normalizeTextSymbols(measure.form || "", targetSong.settings);
      measure.ending = normalizeTextSymbols(measure.ending || "", targetSong.settings);
      measure.jump = normalizeTextSymbols(measure.jump || "", targetSong.settings);
      measure.note = String(measure.note || "");
      measure.rhythm = normalizeRhythmText(measure.rhythm || "");
      measure.sectionLabel = normalizeSectionLabelInput(measure.sectionLabel || "", targetSong.settings);
      measure.manualAnalysisFields = sanitizeManualAnalysisFields(measure.manualAnalysisFields, ["sectionLabel"]);
      if (!Object.keys(measure.manualAnalysisFields).length) delete measure.manualAnalysisFields;
      measure.leftBar = normalizeTextSymbols(measure.leftBar || "", targetSong.settings);
      measure.rightBar = normalizeTextSymbols(measure.rightBar || "", targetSong.settings);
      (measure.slots || []).forEach(slot => {
        if (!slot) return;
        slot.chord = normalizeChordSymbolInput(slot.chord || "", targetSong.settings);
        slot.chordFixed = slot.chordFixed === true;
        slot.mode = normalizeTextSymbols(slot.mode || "", targetSong.settings);
        slot.degree = normalizeDegreeInput(slot.degree || "", targetSong.settings);
        slot.sectionLabel = normalizeSectionLabelInput(slot.sectionLabel || "", targetSong.settings);
        slot.originScale = normalizeOriginScaleInput(slot.originScale || slot.origin || slot.sourceScale || "", targetSong.settings);
        slot.manualAnalysisFields = sanitizeManualAnalysisFields(slot.manualAnalysisFields, ["degree", "mode", "sectionLabel", "originScale"]);
        if (!Object.keys(slot.manualAnalysisFields).length) delete slot.manualAnalysisFields;
	        slot.arrow = normalizeTextSymbols(slot.arrow || "", targetSong.settings);
	        slot.arrowSpan = slot.arrow ? connectorSpanValue(slot.arrowSpan) : 1;
	        slot.pulse = normalizeSlotPulse(slot.pulse);
	        slot.connectorShape = compactConnectorShape(slot.connectorShape);
	        if (!Object.keys(slot.connectorShape).length) delete slot.connectorShape;
	      });
    });
  });
  return targetSong;
}

function normalizeSectionLabelsInDocument(targetSong = song) {
  if (!targetSong?.pages) return false;
  let changed = false;

  targetSong.pages.forEach(page => {
    (page.measures || []).forEach(measure => {
      if (!measure) return;
      const nextMeasureLabel = normalizeSectionLabelInput(measure.sectionLabel || "", targetSong.settings);
      if ((measure.sectionLabel || "") !== nextMeasureLabel) {
        measure.sectionLabel = nextMeasureLabel;
        changed = true;
      }

      (measure.slots || []).forEach(slot => {
        if (!slot) return;
        const nextSlotLabel = normalizeSectionLabelInput(slot.sectionLabel || "", targetSong.settings);
        if ((slot.sectionLabel || "") !== nextSlotLabel) {
          slot.sectionLabel = nextSlotLabel;
          changed = true;
        }
      });
    });
  });

  return changed;
}

function normalizeMeasure(raw) {
  const measure = makeMeasure();
  measure.pageBreakBefore = raw?.pageBreakBefore === true;
  const systemYOffset = Number(raw?.systemYOffset || 0);
  if (Number.isFinite(systemYOffset) && Math.abs(systemYOffset) >= 0.5) {
    measure.systemYOffset = Math.round(systemYOffset * 1000) / 1000;
  }
  measure.form = raw?.form || raw?.formMark || "";
  if (raw?._autoForm) measure._autoForm = true;
  measure.ending = raw?.ending || "";
  measure.jump = raw?.jump || "";
  measure.note = raw?.note || raw?.annotation || "";
  measure.rhythm = normalizeRhythmText(raw?.rhythm || raw?.rhythmText || "");
  measure.sectionLabel = normalizeSectionLabelInput(raw?.sectionLabel || raw?.section || "", raw?.settings || DEFAULT_SETTINGS);
  measure.manualAnalysisFields = sanitizeManualAnalysisFields(raw?.manualAnalysisFields, ["sectionLabel"]);
  if (!Object.keys(measure.manualAnalysisFields).length) delete measure.manualAnalysisFields;
  measure.leftBar = raw?.leftBar || "|";
  measure.rightBar = raw?.rightBar || "|";
  measure.thirdChordPosition = Number(raw?.thirdChordPosition || 4) === 2 ? 2 : 4;
  measure.offsets = raw?.offsets || {};

  const sourceSlots = Array.isArray(raw?.slots)
    ? raw.slots
    : Array.isArray(raw?.chords)
      ? raw.chords.map(ch => ({
          chord: ch.symbol || "",
          mode: ch.mode || "",
          degree: ch.degree || "",
          originScale: ch.originScale || ch.origin || ch.sourceScale || "",
	          arrow: ch.arrow || "",
	          arrowSpan: ch.arrowSpan || 1,
	          offsets: ch.offsets || {},
	          connectorShape: ch.connectorShape || {}
	        }))
      : [];

  const slotCount = Math.max(4, sourceSlots.length);
  measure.slots = [];

  for (let i = 0; i < slotCount; i++) {
    const slot = sourceSlots[i] || {};
    measure.slots[i] = {
      chord: normalizeChordSymbolInput(slot.chord || slot.symbol || "", raw?.settings || DEFAULT_SETTINGS),
      chordFixed: slot.chordFixed === true,
      mode: normalizeTextSymbols(slot.mode || "", raw?.settings || DEFAULT_SETTINGS),
      degree: normalizeDegreeInput(slot.degree || "", raw?.settings || DEFAULT_SETTINGS),
      sectionLabel: normalizeSectionLabelInput(slot.sectionLabel || slot.section || "", raw?.settings || DEFAULT_SETTINGS),
      originScale: normalizeOriginScaleInput(slot.originScale || slot.origin || slot.sourceScale || "", raw?.settings || DEFAULT_SETTINGS),
      manualAnalysisFields: sanitizeManualAnalysisFields(slot.manualAnalysisFields, ["degree", "mode", "sectionLabel", "originScale"]),
      arrow: normalizeTextSymbols(slot.arrow || "", raw?.settings || DEFAULT_SETTINGS),
      arrowSpan: slot.arrow ? connectorSpanValue(slot.arrowSpan) : 1,
      pulse: normalizeSlotPulse(slot.pulse),
      offsets: slot.offsets || {},
      connectorShape: compactConnectorShape(slot.connectorShape)
    };
    if (!Object.keys(measure.slots[i].connectorShape).length) delete measure.slots[i].connectorShape;
    if (!Object.keys(measure.slots[i].manualAnalysisFields).length) delete measure.slots[i].manualAnalysisFields;
  }

  migrateAutoSectionNote(measure);
  return measure;
}

function normalizeSlotPulse(value) {
  const pulse = Number(value);
  return pulse >= 1 && pulse <= 8 ? Math.round(pulse) : undefined;
}

function splitMeasuresIntoPages(measures, settings) {
  const src = measures.length ? measures : [makeMeasure()];
  const systems = splitMeasuresIntoSystems(src, settings);
  const pages = packSystemsIntoPages(systems, settings);
  return pages.length ? pages : [{ measures: src.slice(0, 1) }];
}

function measuresPerSystemValue(settings = song?.settings || DEFAULT_SETTINGS) {
  return Math.max(1, Math.round(Number(settings.measuresPerSystem || DEFAULT_SETTINGS.measuresPerSystem || 4)));
}

function systemsPerPageValue(settings = song?.settings || DEFAULT_SETTINGS) {
  return Math.max(1, Math.round(Number(settings.systemsPerPage || DEFAULT_SETTINGS.systemsPerPage || 4)));
}

function splitMeasuresIntoSystems(measures, settings = song?.settings || DEFAULT_SETTINGS) {
  const mps = measuresPerSystemValue(settings);
  const systems = [];

  for (let i = 0; i < measures.length; i += mps) {
    const systemMeasures = measures.slice(i, i + mps);
    if (!systemMeasures.length) continue;
    systems.push({
      measures: systemMeasures,
      forcedPageBreak: systemMeasures[0]?.pageBreakBefore === true && systems.length > 0
    });
  }

  return systems;
}

function systemManualYOffset(measures) {
  const value = Number(measures?.[0]?.systemYOffset || 0);
  return Number.isFinite(value) ? value : 0;
}

function setSystemManualYOffset(pageIndex, systemIndex, value) {
  const page = song.pages?.[pageIndex];
  if (!page) return false;
  const systems = pageSystemsWithY(page, scoreSettings());
  const system = systems.find(item => item.systemIndex === systemIndex);
  const measure = system ? page.measures?.[system.start] : null;
  if (!measure) return false;

  const nextValue = Math.round(Number(value || 0) * 1000) / 1000;
  if (Math.abs(nextValue) < 0.5) {
    delete measure.systemYOffset;
  } else {
    measure.systemYOffset = nextValue;
  }
  return true;
}

function packSystemsIntoPages(systems, settings = song?.settings || DEFAULT_SETTINGS) {
  const s = scoreSettings(settings);
  const maxSystems = systemsPerPageValue(settings);
  const pageBottom = Number(s.pageHeight || 850) - Number(s.marginBottom || 48);
  const pages = [];
  let current = [];
  let lastY = null;
  let lastMetrics = null;

  systems.forEach((system, index) => {
    const metrics = systemContentMetrics(system.measures, s);
    const manualYOffset = systemManualYOffset(system.measures);
    const nextY = current.length
      ? nextSystemY(lastY, lastMetrics, metrics, s) + manualYOffset
      : firstSystemY(s) + manualYOffset;
    const wouldExceedSystemCount = current.length >= maxSystems;
    const wouldOverflowPage = current.length > 0 && nextY + metrics.bottom > pageBottom;
    const shouldBreak = current.length > 0 && (system.forcedPageBreak || wouldExceedSystemCount || wouldOverflowPage);

    if (shouldBreak) {
      pages.push({ measures: current.flatMap(item => item.measures) });
      current = [];
      lastY = null;
      lastMetrics = null;
    }

    const y = current.length
      ? nextSystemY(lastY, lastMetrics, metrics, s) + manualYOffset
      : firstSystemY(s) + manualYOffset;
    current.push({ ...system, metrics, y, manualYOffset, sourceIndex: index });
    lastY = y;
    lastMetrics = metrics;
  });

  if (current.length) {
    pages.push({ measures: current.flatMap(item => item.measures) });
  }
  return pages;
}

function normalizeAllPagesMeasureCount(targetSong = song) {
  const measures = flatDocumentMeasures(targetSong);
  targetSong.pages = splitMeasuresIntoPages(measures.length ? measures : [makeMeasure()], targetSong.settings);
}

function repaginateSongFromMeasures(measures, targetSong = song) {
  const sourceMeasures = Array.isArray(measures) && measures.length ? measures : [makeMeasure()];
  targetSong.pages = splitMeasuresIntoPages(sourceMeasures, targetSong.settings);
  return targetSong;
}

function flatDocumentMeasures(targetSong = song) {
  return (targetSong.pages || []).flatMap(page => page.measures || []);
}

function locateMeasureIndex(flatIndex, targetSong = song) {
  let seen = 0;
  for (let pageIndex = 0; pageIndex < (targetSong.pages || []).length; pageIndex += 1) {
    const pageMeasures = targetSong.pages[pageIndex]?.measures || [];
    if (flatIndex < seen + pageMeasures.length) {
      return { page: pageIndex, measure: Math.max(0, flatIndex - seen) };
    }
    seen += pageMeasures.length;
  }

  const lastPage = Math.max(0, (targetSong.pages || []).length - 1);
  const lastMeasure = Math.max(0, (targetSong.pages?.[lastPage]?.measures?.length || 1) - 1);
  return { page: lastPage, measure: lastMeasure };
}

function selectedFlatMeasureIndex(targetSong = song) {
  let seen = 0;
  for (let pageIndex = 0; pageIndex < (targetSong.pages || []).length; pageIndex += 1) {
    const pageMeasures = targetSong.pages[pageIndex]?.measures || [];
    if (pageIndex === selected.page) {
      return seen + Math.min(selected.measure, Math.max(0, pageMeasures.length - 1));
    }
    seen += pageMeasures.length;
  }
  return 0;
}

function moveSystemToNextPage(pageIndex, systemIndex) {
  const page = song.pages?.[pageIndex];
  if (!page) return;

  const mps = measuresPerSystemValue(song.settings);
  const startMeasure = Math.max(0, Math.round(Number(systemIndex) || 0) * mps);
  const measure = page.measures?.[startMeasure];
  if (!measure || startMeasure <= 0) return;

  const selectedFlat = selectedFlatMeasureIndex(song);
  measure.pageBreakBefore = true;
  repaginateSongFromMeasures(flatDocumentMeasures(song), song);
  selected = locateMeasureIndex(selectedFlat, song);
  selectedRhythm.page = selected.page;
  selectedRhythm.measure = selected.measure;
  renderAll(false);
  setDirty(true);
  updateStatus("Sistema trasladado a la página siguiente.");
}

function moveSystemToPreviousPage(pageIndex, systemIndex) {
  const page = song.pages?.[pageIndex];
  if (!page || pageIndex <= 0) return;

  const mps = measuresPerSystemValue(song.settings);
  const startMeasure = Math.max(0, Math.round(Number(systemIndex) || 0) * mps);
  const measure = page.measures?.[startMeasure];
  if (!measure || startMeasure !== 0 || measure.pageBreakBefore !== true) return;

  const selectedFlat = selectedFlatMeasureIndex(song);
  delete measure.pageBreakBefore;
  repaginateSongFromMeasures(flatDocumentMeasures(song), song);
  selected = locateMeasureIndex(selectedFlat, song);
  selectedRhythm.page = selected.page;
  selectedRhythm.measure = selected.measure;
  renderAll(false);
  setDirty(true);
  updateStatus("Sistema trasladado hacia la página anterior.");
}

function openMeasureCountPanel(defaultCount = 1) {
  closeDesktopMenus();
  if (els.measureCountInput) {
    els.measureCountInput.value = String(Math.max(1, Math.round(Number(defaultCount) || 1)));
  }
  if (els.measureCountStatus) {
    els.measureCountStatus.textContent = "Listo.";
    els.measureCountStatus.dataset.tone = "";
  }
  els.measureCountPanel?.classList.remove("closed");
  requestAnimationFrame(() => {
    els.measureCountInput?.focus();
    els.measureCountInput?.select();
  });
}

function closeMeasureCountPanel() {
  els.measureCountPanel?.classList.add("closed");
}

function setMeasureCountStatus(message, tone = "") {
  if (!els.measureCountStatus) return;
  els.measureCountStatus.textContent = message;
  els.measureCountStatus.dataset.tone = tone;
}

function addMeasuresFromPanel() {
  const rawCount = els.measureCountInput?.value || "1";
  addMeasuresAtEnd(rawCount);
}

function addMeasureAtEnd() {
  openMeasureCountPanel(1);
}

function addMeasuresAtEnd(rawCount) {
  const count = Number.parseInt(String(rawCount).trim(), 10);
  if (!Number.isFinite(count) || count < 1) {
    setMeasureCountStatus("Escribe un numero de compases mayor que cero.", "error");
    return;
  }

  if (count > 128) {
    setMeasureCountStatus("Por seguridad, agrega maximo 128 compases a la vez.", "error");
    return;
  }

  const measures = flatDocumentMeasures();
  const firstNewIndex = measures.length;
  for (let i = 0; i < count; i += 1) {
    measures.push(makeMeasure());
  }
  repaginateSongFromMeasures(measures);
  const located = locateMeasureIndex(firstNewIndex);
  selected.page = located.page;
  selected.measure = located.measure;
  selectedSlot = 0;
  setDirty(true);
  renderAll();
  updateStatus(`Se agregaron ${count} compas${count === 1 ? "" : "es"}.`);
  closeMeasureCountPanel();
}

function removeMeasureAtEnd() {
  const measures = flatDocumentMeasures();
  if (measures.length <= 1) {
    alert("Debe quedar al menos un compás.");
    return;
  }

  const last = measures[measures.length - 1];
  if (hasMeasurePrintableContent(last) && !confirm("El ultimo compas tiene contenido.\n\nQuieres quitarlo de todas formas?")) {
    return;
  }

  measures.pop();
  repaginateSongFromMeasures(measures);
  selected.page = Math.min(selected.page, song.pages.length - 1);
  selected.measure = Math.min(selected.measure, Math.max(0, (song.pages[selected.page]?.measures?.length || 1) - 1));
  selectedSlot = 0;
  setDirty(true);
  renderAll();
}

function removeUnusedMeasures() {
  const measures = flatDocumentMeasures();
  const unusedIndexes = measures
    .map((measure, index) => ({ measure, index }))
    .filter(item => !hasMeasurePrintableContent(item.measure))
    .map(item => item.index);

  if (!unusedIndexes.length) {
    alert("No hay compases vacios para eliminar.");
    return;
  }

  if (!confirm(`Se eliminaran ${unusedIndexes.length} compas${unusedIndexes.length === 1 ? "" : "es"} vacio${unusedIndexes.length === 1 ? "" : "s"}.\n\nNo se borraran compases con cifrado, grados, modos, conectores, barras especiales, casillas, saltos o marcas de forma.\n\nQuieres continuar?`)) {
    return;
  }

  const cleanedMeasures = measures.filter(measure => hasMeasurePrintableContent(measure));
  repaginateSongFromMeasures(cleanedMeasures.length ? cleanedMeasures : [makeMeasure()]);
  selected.page = 0;
  selected.measure = 0;
  selectedSlot = 0;
  setDirty(true);
  renderAll();
  updateStatus(`Se eliminaron ${unusedIndexes.length} compas${unusedIndexes.length === 1 ? "" : "es"} vacio${unusedIndexes.length === 1 ? "" : "s"}.`);
}

function hasMeasurePrintableContent(measure) {
  if (!measure) return false;
  if (String(measure.form || measure.ending || measure.jump || measure.note || measure.sectionLabel || measure.rhythm || "").trim()) return true;
  if (barClass(measure.leftBar) !== "single" || barClass(measure.rightBar) !== "single") return true;
  return (measure.slots || []).some(slot =>
    ["chord", "mode", "degree", "sectionLabel", "originScale", "arrow"].some(field => String(slot?.[field] || "").trim())
  );
}

function renderAll(syncForm = true) {
  const activeInSettings = els.settingsPanel?.contains(document.activeElement);

  if (syncForm) {
    syncSettingsFormValues();
    renderQuickAppearance();
  } else if (!activeInSettings) {
    // No reconstruir controles mientras el usuario está usando sliders,
    // selects o el picker de color. Reconstruirlos cierra el control nativo.
    renderQuickAppearance();
  }

  normalizeAllPagesMeasureCount();
  normalizeSectionLabelsInDocument();
  els.pages.innerHTML = "";

  syncThirdChordPositionButton();

  song.pages.forEach((page, pageIndex) => {
    const wrap = document.createElement("div");
    wrap.className = "pageWrap";

    const label = document.createElement("div");
    label.className = "pageLabel";
    label.textContent = `Página ${pageIndex + 1}`;
    wrap.appendChild(label);

    wrap.appendChild(renderPageSvg(page, pageIndex));
    els.pages.appendChild(wrap);
  });

  updateMeasurePanelIfOpen();
  rhythmUpdatePaletteStatus();
}

function renderPageSvg(page, pageIndex) {
  const s = scoreSettings();
  const svg = svgEl("svg", {
    class: "scoreSvg",
    width: s.pageWidth,
    height: s.pageHeight,
    viewBox: `0 0 ${s.pageWidth} ${s.pageHeight}`,
    "data-page": pageIndex
  });

  svg.style.background = s.pageBackground;

  const fontCss = [packagedFontCss(), localFontCss()].filter(Boolean).join("\n");
  if (fontCss) {
    const defs = svgEl("defs", {});
    const style = svgEl("style", { type: "text/css" });
    style.textContent = fontCss;
    defs.appendChild(style);
    svg.appendChild(defs);
  }

  const bg = svgEl("rect", {
    x: 0,
    y: 0,
    width: s.pageWidth,
    height: s.pageHeight,
    fill: s.pageBackground
  });
  svg.appendChild(bg);

  const titleText = applyCase(song.title || "", s.titleCase);
  const composerText = applyCase(song.composer || "", s.composerCase);

  const titleNode = textEl(titleText, {
    x: s.pageWidth * s.titleX,
    y: s.marginTop + s.titleY,
    "text-anchor": "middle",
    fill: s.inkColor,
    "font-family": s.titleFont,
    "font-size": s.titleSize,
    "font-weight": s.titleWeight,
    class: "svgEditable",
    "data-kind": "song",
    "data-field": "title",
    "data-tooltip": "Título"
  });
  svg.appendChild(titleNode);
  renderStudentNameField(svg);

  const composerNode = textEl(composerText, {
    x: s.pageWidth - s.marginRight - (1 - s.composerX) * (s.pageWidth - s.marginLeft - s.marginRight),
    y: s.marginTop + s.composerY,
    "text-anchor": "end",
    fill: s.inkColor,
    "font-family": s.composerFont,
    "font-size": s.composerSize,
    "font-weight": s.composerWeight,
    class: "svgEditable",
    "data-kind": "song",
    "data-field": "composer",
    "data-tooltip": "Compositor"
  });
  svg.appendChild(composerNode);

  const geoms = computePageGeometries(page);
  renderTimeSignature(svg, pageIndex, geoms);

  geoms.forEach((geom, measureIndex) => {
    const measure = page.measures[measureIndex];
    svg.appendChild(renderMeasureGroup(measure, pageIndex, measureIndex, geom.x, geom.y, geom.w, geom.h));
  });

  svg.appendChild(renderPageRhythmCrossMeasureTies(page, geoms));
  svg.appendChild(renderPageConnectors(page, pageIndex, geoms));
  renderSystemMeasureNumbers(svg, page, geoms);
  renderSystemDragControls(svg, page, pageIndex, geoms);
  renderSystemPageBreakControls(svg, page, pageIndex, geoms);
  renderMeasureCountControls(svg, page, pageIndex, geoms);

  if (s.showPageNumbers) {
    const pageNumberText = `pag. ${pageIndex + 1}`;
    const pageNumberSize = Number(s.pageNumberSize || 11);
    const pageNumberX = Number(s.marginLeft || 48) + Number(s.pageNumberXOffset || 0);
    const pageNumberY = Math.max(28, Number(s.pageNumberY || 28));
    const pageNumberWidth = Math.max(44, estimateTextWidth(pageNumberText, pageNumberSize, s.pageNumberFont || s.composerFont) + 12);
    svg.appendChild(textEl(pageNumberText, {
      x: pageNumberX,
      y: pageNumberY,
      "text-anchor": "start",
      fill: s.pageNumberColor || s.inkColor,
      "font-family": s.pageNumberFont || s.composerFont,
      "font-size": pageNumberSize,
      "font-weight": s.pageNumberWeight || 400,
      "data-kind": "meta",
      "data-field": "pageNumber",
      "data-tooltip": "Número de página"
    }));
    appendMetaHitTarget(
      svg,
      pageNumberX - 6,
      pageNumberY - pageNumberSize,
      pageNumberWidth,
      Math.max(22, pageNumberSize + 10),
      "pageNumber",
      "Número de página"
    );
  }

  renderAtaCredit(svg);

  svg.addEventListener("pointerdown", handleSvgRhythmPointerDown);
  svg.addEventListener("click", handleSvgClick);
  svg.addEventListener("dblclick", handleSvgDoubleClick);
  return svg;
}

function renderMeasureCountControls(svg, page, pageIndex, geoms) {
  if (pageIndex !== song.pages.length - 1) return;
  const measureIndex = (page.measures || []).length - 1;
  if (measureIndex < 0) return;

  const geom = geoms[measureIndex];
  if (!geom) return;

  const s = scoreSettings();
  const size = 18;
  const gap = 5;
  const x = Math.min(
    Number(s.pageWidth || 1100) - Number(s.marginRight || 48) + 8,
    geom.x + geom.w + 10
  );
  const y = geom.y + Number(s.measureLineY || 58) - size - 8;
  const group = svgEl("g", {
    class: "hit measureCountControls",
    "data-kind": "measureControl",
    "data-tooltip": "Agregar o quitar compases"
  });

  [
    { label: "+", action: "addMeasure", tooltip: "Agregar compás al final" },
    { label: "-", action: "removeMeasure", tooltip: "Quitar último compás" }
  ].forEach((button, index) => {
    const bx = x + index * (size + gap);
    const buttonGroup = svgEl("g", {
      "data-kind": "measureControl",
      "data-action": button.action,
      "data-tooltip": button.tooltip
    });
    buttonGroup.appendChild(svgEl("rect", {
      x: bx,
      y,
      width: size,
      height: size,
      rx: 4,
      class: "measureCountButton"
    }));
    buttonGroup.appendChild(textEl(button.label, {
      x: bx + size / 2,
      y: y + size * 0.72,
      "text-anchor": "middle",
      fill: s.inkColor || "#111111",
      "font-family": "system-ui, sans-serif",
      "font-size": 14,
      "font-weight": 800,
      "pointer-events": "none"
    }));
    group.appendChild(buttonGroup);
  });

  svg.appendChild(group);
}

function renderSystemDragControls(svg, page, pageIndex, geoms) {
  const s = scoreSettings();
  const systems = pageSystemsWithY(page, s);
  if (!systems.length) return;

  const size = 16;
  systems.forEach(system => {
    const systemGeoms = geoms
      .filter(Boolean)
      .filter(geom => geom.systemIndex === system.systemIndex);
    if (!systemGeoms.length) return;

    const firstGeom = systemGeoms[0];
    const x = Math.max(8, firstGeom.x - size - 18);
    const y = firstGeom.y + Number(s.measureLineY || 58) + 6;
    const group = svgEl("g", {
      class: "hit systemDragControl",
      "data-kind": "systemDragControl",
      "data-page": pageIndex,
      "data-system": system.systemIndex,
      "data-tooltip": "Arrastrar sistema arriba o abajo"
    });

    group.appendChild(svgEl("rect", {
      x,
      y,
      width: size,
      height: size,
      rx: 4,
      class: "systemDragButton"
    }));
    group.appendChild(svgEl("path", {
      d: [
        `M ${x + size / 2} ${y + 3} L ${x + size / 2} ${y + size - 3}`,
        `M ${x + 5} ${y + 6} L ${x + size / 2} ${y + 3} L ${x + size - 5} ${y + 6}`,
        `M ${x + 5} ${y + size - 6} L ${x + size / 2} ${y + size - 3} L ${x + size - 5} ${y + size - 6}`
      ].join(" "),
      class: "systemDragIcon",
      "pointer-events": "none"
    }));
    svg.appendChild(group);
  });
}

function renderSystemPageBreakControls(svg, page, pageIndex, geoms) {
  const s = scoreSettings();
  const systems = pageSystemsWithY(page, s);

  const size = 14;
  if (pageIndex > 0 && systems[0]?.measures?.[0]?.pageBreakBefore === true) {
    const system = systems[0];
    const systemGeoms = geoms
      .filter(Boolean)
      .filter(geom => geom.systemIndex === system.systemIndex);
    if (systemGeoms.length) {
      const firstGeom = systemGeoms[0];
      const x = Math.max(8, firstGeom.x - size - 2);
      const y = firstGeom.y + Number(s.systemHeight || 122) - size - 4;
      const group = svgEl("g", {
        class: "hit systemPageBreakControl systemPageBreakControlPrev",
        "data-kind": "systemBreakControl",
        "data-action": "previous",
        "data-page": pageIndex,
        "data-system": system.systemIndex,
        "data-tooltip": "Pasar este sistema a la página anterior"
      });

      group.appendChild(svgEl("rect", {
        x,
        y,
        width: size,
        height: size,
        rx: 3,
        class: "systemPageBreakButton"
      }));
      group.appendChild(svgEl("path", {
        d: `M ${x + 4} ${y + 9} L ${x + size / 2} ${y + 5} L ${x + size - 4} ${y + 9}`,
        class: "systemPageBreakIcon",
        "pointer-events": "none"
      }));
      svg.appendChild(group);
    }
  }

  if (systems.length <= 1) return;

  systems.slice(1).forEach(system => {
    const systemGeoms = geoms
      .filter(Boolean)
      .filter(geom => geom.systemIndex === system.systemIndex);
    if (!systemGeoms.length) return;

    const lastGeom = systemGeoms[systemGeoms.length - 1];
    const x = lastGeom.x + lastGeom.w - size - 4;
    const y = lastGeom.y + Number(s.systemHeight || 122) - size - 4;
    const group = svgEl("g", {
      class: "hit systemPageBreakControl",
      "data-kind": "systemBreakControl",
      "data-action": "next",
      "data-page": pageIndex,
      "data-system": system.systemIndex,
      "data-tooltip": "Pasar este sistema a la página siguiente"
    });

    group.appendChild(svgEl("rect", {
      x,
      y,
      width: size,
      height: size,
      rx: 3,
      class: "systemPageBreakButton"
    }));
    group.appendChild(svgEl("path", {
      d: `M ${x + 4} ${y + 5} L ${x + size / 2} ${y + 9} L ${x + size - 4} ${y + 5}`,
      class: "systemPageBreakIcon",
      "pointer-events": "none"
    }));
    svg.appendChild(group);
  });
}

function renderTimeSignature(svg, pageIndex, geoms) {
  if (pageIndex !== 0) return;

  const signature = normalizeTimeSignature(song.timeSignature || "");
  if (!signature) return;

  const parts = signature.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return;

  const s = scoreSettings();
  const firstGeom = geoms[0];
  if (!firstGeom) return;

  const x = firstGeom.x + Number(s.timeSignatureXOffset || -27);
  const y = firstGeom.y + Number(s.measureLineY || 58) + Number(s.timeSignatureYOffset || 0);
  const size = Number(s.timeSignatureSize || 25);
  const attrs = {
    x,
    "text-anchor": "middle",
    fill: s.timeSignatureColor || s.inkColor,
    "font-family": s.timeSignatureFont || s.titleFont,
    "font-size": size,
    "font-weight": s.timeSignatureWeight || 700,
    class: "svgEditable",
    "data-kind": "song",
    "data-field": "timeSignature",
    "data-tooltip": "Signatura de medida"
  };

  svg.appendChild(textEl(parts[0], {
    ...attrs,
    y: y - size * 0.12
  }));
  svg.appendChild(textEl(parts[1], {
    ...attrs,
    y: y + size * 0.78
  }));
  svg.appendChild(hitRect({
    x: x - size * 0.75,
    y: y - size * 0.95,
    width: size * 1.5,
    height: size * 1.95,
    class: "hit directFieldHit structuralHit",
    "data-kind": "song",
    "data-field": "timeSignature",
    "data-tooltip": "Signatura de medida"
  }, "Signatura de medida"));
}




function renderAtaCredit(svg) {
  const s = scoreSettings();
  const text = "AAC (Analizador Armónico Crescendo)";
  svg.appendChild(textEl(text, {
    x: Number(s.pageWidth || 1100) - Number(s.marginRight || 48),
    y: 22,
    "text-anchor": "end",
    fill: "#777777",
    "font-family": s.composerFont || "Georgia, 'Times New Roman', serif",
    "font-size": 10,
    "font-weight": 400,
    "data-kind": "meta",
    "data-field": "ataCredit"
  }));
}

function appendMetaHitTarget(svg, x, y, width, height, field, tooltip) {
  svg.appendChild(hitRect({
    x,
    y,
    width,
    height,
    class: "hit directFieldHit structuralHit",
    "data-kind": "meta",
    "data-field": field,
    "data-tooltip": tooltip
  }, tooltip));
}

function renderStudentNameField(svg) {
  const s = scoreSettings();
  const text = song.studentName || "";
  const x = s.marginLeft + Number(s.studentNameX || 0);
  const y = s.marginTop + Number(s.studentNameY || s.titleY || 28);
  const width = Number(s.studentNameWidth || 230);
  const fontFamily = s.studentNameFont || '"Ink Free"';
  const fontSize = Number(s.studentNameSize || 20);

  if (text) {
    svg.appendChild(textEl(text, {
      x,
      y,
      "text-anchor": "start",
      fill: s.studentNameColor || s.inkColor,
      "font-family": fontFamily,
      "font-size": fontSize,
      "font-weight": s.studentNameWeight || 400,
      class: "svgEditable",
      "data-kind": "song",
      "data-field": "studentName",
      "data-tooltip": "Nombre estudiante"
    }));
  }

  svg.appendChild(hitRect({
    x: x - 4,
    y: y - fontSize,
    width,
    height: Math.max(24, fontSize + 8),
    class: "hit directFieldHit structuralHit",
    "data-kind": "song",
    "data-field": "studentName",
    "data-tooltip": "Nombre estudiante"
  }, "Nombre estudiante"));
}

function renderSystemMeasureNumbers(svg, page, geoms) {
  const s = scoreSettings();
  const enabled = s.showSystemMeasureNumbers === true || s.showSystemMeasureNumbers === "true";
  if (!enabled) return;

  for (let systemIndex = 1; systemIndex < s.systemsPerPage; systemIndex++) {
    const measureIndex = systemIndex * s.measuresPerSystem;
    const geom = geoms[measureIndex];
    if (!geom) continue;

    const x = geom.x + Number(s.systemMeasureNumberX || -18);
    const y = geom.y + Number(s.systemMeasureNumberY || 63);
    const size = Number(s.systemMeasureNumberSize || 10);

    svg.appendChild(textEl(String(measureIndex + 1), {
      x,
      y,
      "text-anchor": "end",
      fill: s.systemMeasureNumberColor || s.inkColor,
      "font-family": s.systemMeasureNumberFont || s.pageNumberFont || s.composerFont,
      "font-size": size,
      "font-weight": s.systemMeasureNumberWeight || 600,
      class: "systemMeasureNumber",
      "data-kind": "meta",
      "data-field": "systemMeasureNumber",
      "data-tooltip": "Número de compás"
    }));

    appendMetaHitTarget(
      svg,
      x - 34,
      y - size,
      42,
      Math.max(20, size + 8),
      "systemMeasureNumber",
      "Número de compás"
    );
  }
}

function computePageGeometries(page) {
  const s = scoreSettings();
  const usableW = s.pageWidth - s.marginLeft - s.marginRight;
  const baseW = usableW / s.measuresPerSystem;
  const minW = Math.max(80, baseW * Number(s.minMeasureWidthRatio || 0.68));
  const geoms = [];
  const systems = pageSystemsWithY(page, s);

  systems.forEach(system => {
    const y = system.y;
    const start = system.start;
    const measures = system.measures;

    const isFullSystem = measures.length >= Number(s.measuresPerSystem || 4);
    const required = measures.map(measure => Math.max(
      isFullSystem ? minW : baseW,
      requiredMeasureWidth(measure, baseW)
    ));
    const sumRequired = required.reduce((sum, value) => sum + value, 0);
    const widths = sumRequired > usableW
      ? required.map(value => value * usableW / sumRequired)
      : isFullSystem
        ? distributeExtraWidth(required, usableW, baseW)
        : required;

    let x = s.marginLeft;
    widths.forEach((width, i) => {
      geoms[start + i] = {
        x,
        y,
        w: width,
        h: s.systemHeight,
        systemIndex: system.systemIndex,
        measureInSystem: i
      };
      x += width;
    });
  });

  return geoms;
}

function pageSystemsWithY(page, settings = scoreSettings()) {
  const measures = Array.isArray(page?.measures) ? page.measures : [];
  const mps = measuresPerSystemValue(settings);
  const systems = [];
  let lastY = null;
  let lastMetrics = null;

  for (let start = 0; start < measures.length; start += mps) {
    const systemIndex = systems.length;
    const systemMeasures = measures.slice(start, start + mps);
    const metrics = systemContentMetrics(systemMeasures, settings);
    const manualYOffset = systemManualYOffset(systemMeasures);
    const y = systems.length
      ? nextSystemY(lastY, lastMetrics, metrics, settings) + manualYOffset
      : firstSystemY(settings) + manualYOffset;
    systems.push({ start, measures: systemMeasures, systemIndex, y, metrics, manualYOffset });
    lastY = y;
    lastMetrics = metrics;
  }

  return systems;
}

function firstSystemY(settings = scoreSettings()) {
  return Number(settings.marginTop || 48) + Number(settings.headerHeight || 0);
}

function nextSystemY(previousY, previousMetrics, nextMetrics, settings = scoreSettings()) {
  const minGap = Number(settings.dynamicSystemGap ?? 34);
  return previousY + Number(previousMetrics?.bottom || settings.systemHeight || 122) - Number(nextMetrics?.top || 0) + minGap;
}

function rhythmLaneMetrics(settings = scoreSettings()) {
  const s = settings;
  const rhythmY = Number(s.rhythmY ?? -34);
  const size = Number(s.rhythmSize ?? 29);
  const stemHeight = Number(s.rhythmStemHeight ?? 35);
  const top = rhythmY - stemHeight - size * 0.55 - 4;
  const bottom = rhythmY + size * 0.9 + 4;
  return { top, bottom, height: bottom - top };
}

function systemContentMetrics(measures, settings = scoreSettings()) {
  const s = settings;
  const rhythmLane = rhythmLaneMetrics(s);
  let top = Math.min(
    rhythmLane.top,
    Number(s.chordY || 0) - Number(s.chordSize || 24) * 0.92,
    Number(s.measureLineY || 58) - 28
  );
  let bottom = Math.max(
    rhythmLane.bottom,
    Number(s.measureLineY || 58) + Number(s.barBottom || 18) + 16,
    Number(s.degreeY || 98) + Number(s.degreeSize || 20) * 0.45,
    Number(s.noteY || 122) + Number(s.noteSize || 20) * 0.55
  );

  measures.forEach(measure => {
    if (!measure) return;

    if (measure.form) {
      const offset = getItemOffset(measure, "form");
      top = Math.min(top, Number(s.formY || 0) + offset.y - Number(s.formSize || 20) - Number(s.formPaddingY || 4) - 4);
    }
    if (measure.ending) {
      const offset = getItemOffset(measure, "ending");
      top = Math.min(top, Number(s.endingY || 0) + offset.y - Number(s.endingSize || 12) - 6);
    }
    if (measure.jump) {
      const offset = getItemOffset(measure, "jump");
      top = Math.min(top, Number(s.jumpY || 0) + offset.y - Number(s.jumpSize || 12) - 6);
    }
    (measure.slots || []).forEach(slot => {
      if (!slot) return;
      if (slot.chord) {
        const offset = getItemOffset(slot, "chord");
        top = Math.min(top, Number(s.chordY || 0) + offset.y - Number(s.chordSize || 24) * 0.92);
      }
      if (slot.mode) {
        const offset = getItemOffset(slot, "mode");
        top = Math.min(top, Number(s.modeY || 39) + offset.y - Number(s.modeSize || 18));
      }
      if (slot.sectionLabel) {
        const offset = getItemOffset(slot, "sectionLabel");
        bottom = Math.max(bottom, Number(s.sectionLabelY || 72) + offset.y + Number(s.sectionLabelSize || 15) * 0.4);
      }
      if (slot.degree) {
        const offset = getItemOffset(slot, "degree");
        bottom = Math.max(bottom, Number(s.degreeY || 98) + offset.y + Number(s.degreeSize || 20) * 0.45);
      }
      if (slot.originScale) {
        const offset = getItemOffset(slot, "originScale");
        bottom = Math.max(bottom, Number(s.noteY || 122) + offset.y + Number(s.noteSize || 20) * 0.55);
      }
    });
  });

  const minHeight = Math.max(72, Number(s.systemHeight || 122) * 0.58);
  if (bottom - top < minHeight) bottom = top + minHeight;

  return { top, bottom, height: bottom - top };
}

function rhythmHasVisibleContent(value) {
  return rhythmTokenize(value || "").some(token => {
    if (!token || token === "|") return false;
    return !/^v\//i.test(token);
  });
}

function distributeExtraWidth(required, usableW, baseW) {
  const extra = usableW - required.reduce((sum, value) => sum + value, 0);
  if (extra <= 0) return required;

  const weights = required.map(value => Math.max(0.15, baseW / Math.max(baseW, value)));
  const weightSum = weights.reduce((sum, value) => sum + value, 0);

  return required.map((value, index) => value + extra * weights[index] / weightSum);
}

function requiredMeasureWidth(measure, baseW) {
  const s = scoreSettings();
  const entries = visibleSlotEntries(measure);
  const count = entries.length;
  if (!count) return baseW * 0.72;

  const pad = Number(s.measureInnerPadding || 18) * 2 + formCollisionReserve(measure, s, entries[0]?.slot);
  const gap = Number(s.slotGap || 22);

  const textWidths = entries.map(entry => Math.max(
    estimateTextWidth(visibleChordForSlot(entry.slot), s.chordSize, s.chordFont),
    estimateTextWidth(entry.slot.mode || "", s.modeSize, s.modeFont),
    estimateTextWidth(entry.slot.degree || "", s.degreeSize, s.degreeFont),
    estimateTextWidth(entry.slot.originScale || "", s.noteSize || 12, s.noteFont || s.degreeFont),
    estimateTextWidth(entry.slot.sectionLabel || "", s.sectionLabelSize || 15, s.sectionLabelFont || s.degreeFont),
    26
  ));

  let needed;
  if (count === 1) {
    needed = pad + textWidths[0] + gap;
  } else if (count === 2) {
    needed = pad + Math.max(textWidths[0] * 1.75, textWidths[0] + textWidths[1] + gap * 2.2);
  } else {
    needed = pad + textWidths.reduce((sum, value) => sum + value, 0) + gap * (count + 0.5);
  }

  return Math.max(baseW * 0.72, needed);
}

function formLabelBoundsRelative(measure, s) {
  if (!measure?.form) return null;

  const formOffset = getItemOffset(measure, "form");
  const formFont = s.formFont || s.titleFont;
  const padX = Number(s.formPaddingX || 7);
  const tx = Number(s.formX || 0) + formOffset.x;
  const labelW = Math.max(18, estimateTextWidth(measure.form, s.formSize, formFont) + padX * 2);

  return {
    left: tx - labelW / 2,
    right: tx + labelW / 2,
    width: labelW
  };
}

function formCollisionReserve(measure, s, firstSlot = null) {
  const bounds = formLabelBoundsRelative(measure, s);
  if (!bounds || !firstSlot) return 0;

  const innerPadding = Number(s.measureInnerPadding || 18);
  const firstChordWidth = Math.max(26, estimateTextWidth(visibleChordForSlot(firstSlot), s.chordSize, s.chordFont));
  const requiredFirstCenter = bounds.right + 14 + firstChordWidth / 2;
  const defaultFirstCenter = innerPadding + (firstChordWidth / 2);

  return Math.max(0, requiredFirstCenter - defaultFirstCenter);
}

function getPageMeasureGeometry(page, measureIndex) {
  return computePageGeometries(page)[measureIndex];
}


function renderMultilineText(group, text, x, y, maxWidth, lineHeight, attrs, maxLines = 3) {
  const lines = wrapText(String(text || ""), maxWidth, attrs["font-size"], attrs["font-family"], maxLines);
  lines.forEach((line, index) => {
    group.appendChild(textEl(line, {
      ...attrs,
      x,
      y: y + index * lineHeight
    }));
  });
}

function wrapText(text, maxWidth, size, fontFamily, maxLines = Infinity) {
  const rawLines = String(text || "").split(/\r?\n/);
  const out = [];

  for (const rawLine of rawLines) {
    const words = rawLine.split(/\s+/).filter(Boolean);

    if (!words.length) {
      out.push("");
      continue;
    }

    let current = "";
    words.forEach(word => {
      const candidate = current ? `${current} ${word}` : word;

      if (estimateTextWidth(candidate, size, fontFamily) <= maxWidth || !current) {
        current = candidate;
      } else {
        out.push(current);
        current = word;
      }
    });

    if (current) out.push(current);
  }

  // No truncar y no agregar "...": cualquier anotación heredada debe mostrar
  // exactamente lo que el usuario escribió, distribuida en líneas si hace falta.
  return Number.isFinite(maxLines) ? out.slice(0, maxLines) : out;
}

function renderMeasureNote(group, measure, pageIndex, measureIndex, x, y, w) {
  if (!isAnalysisVisible()) return;

  const s = scoreSettings();
  const noteOffset = getItemOffset(measure, "note");
  const boxX = x + Number(s.noteXOffset || 0) + noteOffset.x;
  const boxY = y + Number(s.noteY || 108) + noteOffset.y;
  const boxH = Number(s.noteHeight || 26);
  const padX = Number(s.notePaddingX || 6);
  const padY = Number(s.notePaddingY || 4);
  const noteFont = s.noteFont || s.degreeFont;
  const noteSize = Number(s.noteSize || 12);
  const noteColor = s.noteColor || s.inkColor;

  if (measure.note) {
    renderMultilineText(group, measure.note, boxX + padX, boxY + padY + noteSize, Math.max(20, w - padX * 2), noteSize * 1.15, {
      "text-anchor": "start",
      fill: noteColor,
      "font-family": noteFont,
      "font-size": noteSize,
      "font-weight": s.noteWeight || 400,
      class: "svgEditable",
      "data-kind": "measureField",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-field": "note",
      "data-tooltip": "Anotación"
    });
  }
}

function renderMeasureSectionLabel(group, measure, pageIndex, measureIndex, x, y) {
  if (!shouldRenderMeasureAnalysisField(measure, "sectionLabel")) return;

  const sectionLabel = String(measure.sectionLabel || "").trim();
  if (!sectionLabel) return;

  const s = scoreSettings();
  const sectionOffset = getItemOffset(measure, "sectionLabel");
  const sectionTextX = x + Math.max(10, Number(s.sectionLabelXOffset || 0)) + sectionOffset.x;
  group.appendChild(textEl(sectionLabel, {
    x: sectionTextX,
    y: y + Number(s.sectionLabelY || 72) + sectionOffset.y,
    "text-anchor": "start",
    fill: s.sectionLabelColor || s.degreeColor || s.inkColor,
    "font-family": s.sectionLabelFont || s.degreeFont,
    "font-size": Number(s.sectionLabelSize || 15),
    "font-weight": s.sectionLabelWeight || s.degreeWeight || 600,
    class: "svgEditable",
    "data-kind": "measureField",
    "data-page": pageIndex,
    "data-measure": measureIndex,
    "data-field": "sectionLabel",
    "data-tooltip": "Tonalidad"
  }));
}

function renderMeasureGroup(measure, pageIndex, measureIndex, x, y, w, h) {
  const s = scoreSettings();
  const group = svgEl("g", {
    class: "measureGroup",
    "data-page": pageIndex,
    "data-measure": measureIndex
  });

  const isSelected = pageIndex === selected.page && measureIndex === selected.measure;
  if (isSelected) {
    // Selección discreta: no se rellena todo el compás.
    group.appendChild(svgEl("rect", {
      x: x + 2,
      y: y - 15,
      width: Math.max(0, w - 4),
      height: h + 10,
      fill: "none",
      stroke: s.selectedColor,
      "stroke-width": 1,
      opacity: 0.45,
      "stroke-dasharray": "3 5",
      "pointer-events": "none"
    }));
  }

  group.appendChild(svgEl("rect", {
    x,
    y: y - 18,
    width: w,
    height: h + 16,
    class: "hit measureHit",
    "data-kind": "measure",
    "data-page": pageIndex,
    "data-measure": measureIndex
  }));

  group.appendChild(svgEl("line", {
    x1: x,
    y1: y + s.measureLineY,
    x2: x + w,
    y2: y + s.measureLineY,
    stroke: s.inkColor,
    "stroke-width": 2
  }));

  const isFirstMeasureInSystem = measureIndex % s.measuresPerSystem === 0;
  const leftBarType = barClass(measure.leftBar);

  // En límites internos se evita dibujar una barra simple izquierda,
  // porque ya la dibuja la barra derecha del compás anterior. Esto evita
  // que "||" se vea como tres líneas.
  if (isFirstMeasureInSystem || leftBarType !== "single") {
    group.appendChild(renderBar(measure.leftBar, x, y + s.barTop, y + h - s.barBottom, "left"));
  }
  const nextMeasure = song.pages[pageIndex]?.measures?.[measureIndex + 1];
  const rightBarType = barClass(measure.rightBar);
  const nextLeftBarType = barClass(nextMeasure?.leftBar);
  const isLastMeasureInSystem = (measureIndex + 1) % s.measuresPerSystem === 0;
  const nextLeftBarTakesBoundary = !!nextMeasure
    && !isLastMeasureInSystem
    && nextLeftBarType !== "single"
    && ["single", "double"].includes(rightBarType);
  if (!nextLeftBarTakesBoundary) {
    group.appendChild(renderBar(measure.rightBar, x + w, y + s.barTop, y + h - s.barBottom, "right"));
  }

  if (measure.form) {
    const formOffset = getItemOffset(measure, "form");
    const tx = x + s.formX + formOffset.x;
    const ty = y + s.formY + formOffset.y;
    const formFont = s.formFont || s.titleFont;
    const padX = Number(s.formPaddingX || 7);
    const padY = Number(s.formPaddingY || 4);
    const labelW = Math.max(18, estimateTextWidth(measure.form, s.formSize, formFont) + padX * 2);
    const labelH = Math.max(14, Number(s.formSize || 13) + padY * 2);
    const rectY = ty - Number(s.formSize || 13) + 3 - padY;
    group.appendChild(svgEl("rect", {
      x: tx - labelW / 2,
      y: rectY,
      width: labelW,
      height: labelH,
      rx: Number(s.formRadius || 2),
      fill: s.pageBackground,
      stroke: s.inkColor,
      "stroke-width": 1.2
    }));
    group.appendChild(textEl(measure.form, {
      x: tx,
      y: ty,
      "text-anchor": "middle",
      fill: s.inkColor,
      "font-family": formFont,
      "font-size": s.formSize,
      "font-weight": s.formWeight || 700,
      class: "svgEditable",
      "data-kind": "measureField",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-field": "form"
    }));
  }

  if (measure.ending) {
    const endingOffset = getItemOffset(measure, "ending");
    const ey = y + s.endingY + endingOffset.y;
    const startX = x + Number(s.endingStartX || 8) + endingOffset.x;
    const endX = x + w - Number(s.endingEndInset || 22) + endingOffset.x;
    const hookHeight = Number(s.endingHookHeight || 14);
    group.appendChild(svgEl("path", {
      d: `M ${startX} ${ey + 4} L ${endX} ${ey + 4} M ${startX} ${ey + 4} L ${startX} ${ey + 4 + hookHeight}`,
      stroke: s.inkColor,
      "stroke-width": 1.2,
      fill: "none"
    }));
    group.appendChild(textEl(measure.ending, {
      x: startX + 5,
      y: ey + 4 + Math.max(11, hookHeight - 2),
      "text-anchor": "start",
      fill: s.inkColor,
      "font-family": s.chordFont,
      "font-size": s.endingSize,
      "font-weight": 700,
      class: "svgEditable",
      "data-kind": "measureField",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-field": "ending"
    }));
  }

  if (measure.jump) {
    const jumpOffset = getItemOffset(measure, "jump");
    group.appendChild(textEl(measure.jump, {
      x: x + w - 10 + Number(s.jumpXOffset || 0) + jumpOffset.x,
      y: y + s.jumpY + jumpOffset.y,
      "text-anchor": "end",
      fill: s.inkColor,
      "font-family": s.chordFont,
      "font-size": s.jumpSize,
      "font-weight": 700,
      class: "svgEditable",
      "data-kind": "measureField",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-field": "jump"
    }));
  }

  renderSlots(group, measure, pageIndex, measureIndex, x, y, w);
  renderMeasureSectionLabel(group, measure, pageIndex, measureIndex, x, y);
  renderDirectEditTargets(group, measure, pageIndex, measureIndex, x, y, w, h);
  renderRhythmMeasure(group, measure, pageIndex, measureIndex, x, y, w);

  return group;
}

function renderSlots(group, measure, pageIndex, measureIndex, x, y, w) {
  const s = scoreSettings();
  const entries = measure.slots
    .map((slot, slotIndex) => ({ slot, slotIndex }))
    .filter(entry => hasSlotVisibleContent(entry.slot));

  if (!entries.length) return;

  const layout = layoutSlots(entries.map(e => e.slot), w, s, measure);

  entries.forEach((entry, i) => {
    const slot = entry.slot;
    const l = layout[i];
    const sx = x + l.center;
    const visibleChord = visibleChordForSlot(slot);
    const measureTextInset = 12;
    let sectionLabelRightEdge = null;

    const renderSectionLabel = shouldRenderAnalysisField(slot, "sectionLabel");
    const renderMode = shouldRenderAnalysisField(slot, "mode");
    const renderDegree = shouldRenderAnalysisField(slot, "degree");
    const renderOriginScale = shouldRenderAnalysisField(slot, "originScale");

    if (renderSectionLabel && slot.sectionLabel) {
      const labelOffset = getItemOffset(slot, "sectionLabel");
      const chordReferenceWidth = Math.max(28, estimateTextWidth(visibleChord || slot.degree || "", l.chordSize, s.chordFont));
      const sectionLabelWidth = estimateTextWidth(slot.sectionLabel, Number(s.sectionLabelSize || 15), s.sectionLabelFont || s.degreeFont);
      const rawSectionLabelX = sx - chordReferenceWidth / 2 - 6 + Number(s.sectionLabelXOffset || 0) + labelOffset.x;
      const sectionLabelX = clampText(rawSectionLabelX, x + measureTextInset + sectionLabelWidth, x + w - measureTextInset);
      sectionLabelRightEdge = sectionLabelX;
      group.appendChild(textEl(slot.sectionLabel, {
        x: sectionLabelX,
        y: y + Number(s.sectionLabelY || 72) + labelOffset.y,
        "text-anchor": "end",
        fill: s.sectionLabelColor || s.degreeColor || s.inkColor,
        "font-family": s.sectionLabelFont || s.degreeFont,
        "font-size": Number(s.sectionLabelSize || 15),
        "font-weight": s.sectionLabelWeight || s.degreeWeight || 600,
        class: "svgEditable",
        "data-kind": "slot",
        "data-page": pageIndex,
        "data-measure": measureIndex,
        "data-slot": entry.slotIndex,
        "data-field": "sectionLabel",
        "data-tooltip": "Tonalidad"
      }));
    }

    if (slot.chord) {
      group.appendChild(textEl(visibleChord, {
        x: sx + Number(s.chordXOffset || 0) + getItemOffset(slot, "chord").x,
        y: y + s.chordY + getItemOffset(slot, "chord").y,
        "text-anchor": "middle",
        fill: s.chordColor,
        "font-family": s.chordFont,
        "font-size": l.chordSize,
        "font-weight": s.chordWeight,
        class: "svgEditable",
        "data-kind": "slot",
        "data-page": pageIndex,
        "data-measure": measureIndex,
        "data-slot": entry.slotIndex,
        "data-field": "chord"
      }));
    }

    if (renderMode && slot.mode) {
      const modeOffset = getItemOffset(slot, "mode");
      const chordReferenceWidth = Math.max(24, estimateTextWidth(visibleChord || slot.mode || "", l.chordSize, s.chordFont));
      const modeWidth = estimateTextWidth(slot.mode, l.modeSize, s.modeFont);
      const rawModeX = sx - chordReferenceWidth / 2 + Number(s.modeXOffset || 0) + modeOffset.x;
      const modeX = clampText(rawModeX, x + measureTextInset, x + w - measureTextInset - modeWidth);
      const safeModeY = Math.min(
        Number(s.modeY || 43),
        Number(s.measureLineY || 58) - Math.max(18, l.modeSize * 0.95)
      );
      group.appendChild(textEl(slot.mode, {
        x: modeX,
        y: y + safeModeY + modeOffset.y,
        "text-anchor": "start",
        fill: s.modeColor,
        "font-family": s.modeFont,
        "font-size": l.modeSize,
        "font-weight": s.modeWeight,
        class: "svgEditable",
        "data-kind": "slot",
        "data-page": pageIndex,
        "data-measure": measureIndex,
        "data-slot": entry.slotIndex,
        "data-field": "mode"
      }));
    }

    if (renderDegree && slot.degree) {
      const evaluationIssue = evaluationIssues.get(`${pageIndex}:${measureIndex}:${entry.slotIndex}`);
      const degreeOffset = getItemOffset(slot, "degree");
      const degreeBaseX = sx + Number(s.degreeXOffset || 0) + degreeOffset.x;
      const degreeY = y + s.degreeY + degreeOffset.y;
      const degreeWidth = estimateTextWidth(slot.degree, l.degreeSize, s.degreeFont);
      const degreeCollisionWidth = degreeWidth * 1.45;
      const minGap = 24;
      const autoPad = sectionLabelRightEdge === null
        ? 0
        : Math.max(0, sectionLabelRightEdge + minGap - (degreeBaseX - degreeCollisionWidth / 2));
      const degreeX = clampText(
        degreeBaseX + autoPad,
        x + measureTextInset + degreeWidth / 2,
        x + w - measureTextInset - degreeWidth / 2
      );
      group.appendChild(textEl(slot.degree, {
        x: degreeX,
        y: degreeY,
        "text-anchor": "middle",
        fill: s.degreeColor,
        "font-family": s.degreeFont,
        "font-size": l.degreeSize,
        "font-weight": s.degreeWeight,
        class: `svgEditable${evaluationIssue ? " evaluationIssue" : ""}`,
        "data-kind": "slot",
        "data-page": pageIndex,
        "data-measure": measureIndex,
        "data-slot": entry.slotIndex,
        "data-field": "degree",
        "data-tooltip": evaluationIssue?.suggested?.length
          ? `Revisar. Recomendado: ${evaluationIssue.suggested.join(", ")}`
          : "Grado"
      }));

      if (evaluationIssue) {
        group.appendChild(svgEl("line", {
          x1: degreeX - degreeWidth / 2,
          x2: degreeX + degreeWidth / 2,
          y1: degreeY + 4,
          y2: degreeY + 4,
          stroke: "#c21b1b",
          "stroke-width": 2,
          "stroke-linecap": "round",
          "pointer-events": "none"
        }));
      }
    }

    if (renderOriginScale && slot.originScale && shouldRenderOriginScale(pageIndex, measureIndex, entry.slotIndex)) {
      const originOffset = getItemOffset(slot, "originScale");
      const originWidth = estimateTextWidth(slot.originScale, Number(s.noteSize || 12), s.noteFont || s.degreeFont);
      const originX = clampText(
        sx + Number(s.noteXOffset || 0) + originOffset.x,
        x + measureTextInset + originWidth / 2,
        x + w - measureTextInset - originWidth / 2
      );
      group.appendChild(textEl(slot.originScale, {
        x: originX,
        y: y + Number(s.noteY || 108) + originOffset.y,
        "text-anchor": "middle",
        fill: s.noteColor || s.inkColor,
        "font-family": s.noteFont || s.degreeFont,
        "font-size": Number(s.noteSize || 12),
        "font-weight": s.noteWeight || 400,
        class: "svgEditable",
        "data-kind": "slot",
        "data-page": pageIndex,
        "data-measure": measureIndex,
        "data-slot": entry.slotIndex,
        "data-field": "originScale",
        "data-tooltip": "Escala de origen"
      }));
    }

  });
}


function getMeasureGeometry(page, measureIndex) {
  return getPageMeasureGeometry(page, measureIndex);
}

function visibleSlotEntries(measure) {
  return (measure?.slots || [])
    .map((slot, slotIndex) => ({ slot, slotIndex }))
    .filter(entry => hasSlotVisibleContent(entry.slot));
}

function hasSlotVisibleContent(slot) {
  if (isAnalysisVisible()) return hasSlotContent(slot);
  return !!String(slot?.chord || "").trim()
    || ["degree", "mode", "sectionLabel", "originScale"].some(field =>
      isHiddenAnalysisFieldEdited(slot, field) && String(slot?.[field] || "").trim()
    );
}

function originScaleComparable(value) {
  return normalizeOriginScaleInput(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function shouldRenderOriginScale(pageIndex, measureIndex, slotIndex) {
  const entries = filledChordSlots();
  const index = entries.findIndex(entry =>
    entry.pageIndex === pageIndex &&
    entry.measureIndex === measureIndex &&
    entry.slotIndex === slotIndex
  );
  if (index < 0) return true;

  const current = originScaleComparable(entries[index]?.slot?.originScale);
  if (!current) return false;

  const previous = originScaleComparable(entries[index - 1]?.slot?.originScale);
  return current !== previous;
}

const RHYTHM_NOTEHEAD_WHOLE = "\uE0A2";
const RHYTHM_NOTEHEAD_HALF = "\uE0A3";
const RHYTHM_NOTEHEAD_BLACK = "\uE0A4";
const RHYTHM_RESTS = {
  1: "\uE4E3",
  2: "\uE4E4",
  4: "\uE4E5",
  8: "\uE4E6",
  16: "\uE4E7",
  32: "\uE4E8"
};

function rhythmMeasureRefs(targetSong = song) {
  const refs = [];
  (targetSong.pages || []).forEach((page, pageIndex) => {
    (page.measures || []).forEach((measure, measureIndex) => {
      refs.push({ pageIndex, measureIndex, measure });
    });
  });
  return refs;
}

function rhythmMeasureGlobalIndex(pageIndex, measureIndex) {
  return rhythmMeasureRefs().findIndex(ref => ref.pageIndex === pageIndex && ref.measureIndex === measureIndex);
}

function rhythmSelectedRef() {
  return song.pages[selectedRhythm.page]?.measures?.[selectedRhythm.measure] || null;
}

function rhythmTokenize(input) {
  const tokens = [];
  let current = "";
  let depth = 0;
  for (const ch of String(input || "")) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && ch === "|") {
      if (current.trim()) tokens.push(current.trim());
      tokens.push("|");
      current = "";
    } else if (depth === 0 && (/\s/.test(ch) || ch === ",")) {
      if (current.trim()) tokens.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function normalizeRhythmText(value) {
  return rhythmTokenize(value)
    .filter(token => token !== "|")
    .join(" ")
    .trim();
}

function rhythmParseMeter(raw) {
  const match = String(raw || "").trim().match(/^(\d+)\s*\/\s*(1|2|4|8|16)$/);
  if (!match) return { beats: 4, unit: 4, capacity: 1 };
  const beats = Number(match[1]);
  const unit = Number(match[2]);
  return { beats, unit, capacity: beats / unit };
}

function rhythmDurationFromText(text) {
  const clean = String(text || "").trim().replace(/[~-]$/, "");
  const match = clean.match(/^(x|s|i|v)?(1|\/(?:2|4|8|16|32))(\.*)$/);
  if (!match) return null;
  const rest = match[1] === "x";
  const slash = match[1] === "s";
  const invisibleSlash = match[1] === "i";
  const emptySlash = match[1] === "v";
  const value = match[2];
  const denominator = value === "1" ? 1 : Number(value.slice(1));
  let duration = value === "1" ? 1 : 1 / denominator;
  let added = duration;
  for (let i = 0; i < match[3].length; i += 1) {
    added /= 2;
    duration += added;
  }
  return { rest, slash, invisibleSlash, emptySlash, denominator, duration, dots: match[3].length, raw: clean };
}

function rhythmTokenPrefix(rest = false, kind = "") {
  if (rest) return "x";
  if (kind === "emptySlash") return "v";
  if (kind === "invisibleSlash") return "i";
  if (kind === "slash") return "s";
  return "";
}

function rhythmTokenKindFromParsed(parsed) {
  if (parsed?.emptySlash) return "emptySlash";
  if (parsed?.invisibleSlash) return "invisibleSlash";
  if (parsed?.slash) return "slash";
  return "";
}

function rhythmDurationTokenFromValue(duration, rest = false, kind = "") {
  const candidates = [
    ["1", 1],
    ["/2.", 0.75],
    ["/2", 0.5],
    ["/4.", 0.375],
    ["/4", 0.25],
    ["/8.", 0.1875],
    ["/8", 0.125],
    ["/16.", 0.09375],
    ["/16", 0.0625],
    ["/32.", 0.046875],
    ["/32", 0.03125]
  ];
  const exact = candidates.find(candidate => Math.abs(candidate[1] - duration) < 0.00001);
  const token = exact
    ? exact[0]
    : candidates.reduce((best, candidate) =>
      Math.abs(candidate[1] - duration) < Math.abs(best[1] - duration) ? candidate : best
    , candidates.at(-1))[0];
  return `${rhythmTokenPrefix(rest, kind)}${token}`;
}

function rhythmDurationTokensFromValue(duration, rest = false, kind = "") {
  const candidates = [
    ["1", 1],
    ["/2.", 0.75],
    ["/2", 0.5],
    ["/4.", 0.375],
    ["/4", 0.25],
    ["/8.", 0.1875],
    ["/8", 0.125],
    ["/16.", 0.09375],
    ["/16", 0.0625],
    ["/32.", 0.03125]
  ];
  const tokens = [];
  let remaining = duration;
  while (remaining > 0.00001) {
    const candidate = candidates.find(item => item[1] <= remaining + 0.00001) || candidates.at(-1);
    tokens.push(`${rhythmTokenPrefix(rest, kind)}${candidate[0]}`);
    remaining -= candidate[1];
  }
  return tokens;
}

function rhythmDefaultTupletInTimeOf(count) {
  if (count === 3) return 2;
  if (count === 6) return 4;
  return Math.max(1, count - 1);
}

function rhythmParseToken(token, factor = 1, tuplet = null, source = null) {
  const tupletMatch = String(token || "").match(/^(\d+)(?:\/(1|2|4|8|16|32))?\((.+)\)$/);
  if (tupletMatch) {
    const count = Number(tupletMatch[1]);
    const unit = tupletMatch[2] || "";
    const id = `rt-${Math.random().toString(36).slice(2)}`;
    const inner = rhythmTokenize(tupletMatch[3]).filter(item => item !== "|");
    return inner.flatMap((innerToken, innerIndex) =>
      rhythmParseToken(
        innerToken,
        factor * (rhythmDefaultTupletInTimeOf(count) / count),
        { id, label: String(count), unit },
        source ? { ...source, innerIndex } : source
      )
    );
  }

  const prepared = token.endsWith("-") ? `${token.slice(0, -1)}~` : token;
  return prepared.split("-").flatMap((part, partIndex, parts) => {
    const parsed = rhythmDurationFromText(part);
    if (!parsed) return [];
    return [{
      ...parsed,
      duration: parsed.duration * factor,
      tieToNext: (partIndex < parts.length - 1 || part.trim().endsWith("~")) && !parsed.rest,
      tuplet,
      source: source ? { ...source, partIndex } : source
    }];
  });
}

function rhythmParseMeasureText(text) {
  return rhythmTokenize(text)
    .filter(token => token !== "|")
    .flatMap((token, tokenIndex) => rhythmParseToken(token, 1, null, { tokenIndex }));
}

function rhythmMeasureDurationText(text) {
  return rhythmTokenize(text)
    .filter(token => token !== "|")
    .reduce((sum, token) => sum + rhythmTokenDuration(token), 0);
}

function rhythmTokenDuration(token) {
  return rhythmParseToken(token, 1, null, []).reduce((sum, item) => sum + item.duration, 0);
}

function rhythmSourceKey(source) {
  if (!source) return "";
  return [source.tokenIndex, source.innerIndex ?? "x", source.partIndex ?? "x"].join(":");
}

function rhythmTupletKey(source) {
  return source ? String(source.tokenIndex) : "";
}

function rhythmHasSelectedSource(source) {
  const key = rhythmSourceKey(source);
  return !!key && (
    selectedRhythm.sources.some(item => rhythmSourceKey(item) === key) ||
    (selectedRhythm.sourceKeys || []).includes(key)
  );
}

function rhythmHasSelectedTuplet(source) {
  const key = rhythmTupletKey(source);
  return selectedRhythm.tuplets.some(item => rhythmTupletKey(item) === key);
}

function rhythmClearSourceSelection() {
  selectedRhythm.sources = [];
  selectedRhythm.sourceKeys = [];
}

function rhythmSelectedSourcesUnique() {
  const seen = new Set();
  return selectedRhythm.sources.filter(source => {
    const key = rhythmSourceKey(source);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function rhythmSplitTieToken(token) {
  const prepared = token.endsWith("-") ? `${token.slice(0, -1)}~` : token;
  return prepared.split("-");
}

function rhythmJoinTieToken(parts) {
  return parts.join("-").replace(/~$/, "-");
}

function rhythmParseTupletToken(token) {
  const match = String(token || "").match(/^(\d+)(?:\/(1|2|4|8|16|32))?\((.+)\)$/);
  if (!match) return null;
  return {
    count: Number(match[1]),
    unit: match[2] || "",
    inner: rhythmTokenize(match[3]).filter(item => item !== "|")
  };
}

function rhythmBuildTupletToken(tuplet) {
  return `${tuplet.count}${tuplet.unit ? `/${tuplet.unit}` : ""}(${tuplet.inner.join(" ")})`;
}

function rhythmSourceTokenText(tokens, source) {
  const original = tokens[source.tokenIndex] || "";
  const tuplet = rhythmParseTupletToken(original);
  if (tuplet && source.innerIndex != null) {
    const innerToken = tuplet.inner[source.innerIndex] || "";
    const innerParts = rhythmSplitTieToken(innerToken);
    return innerParts[source.partIndex ?? 0] || innerToken;
  }
  const parts = rhythmSplitTieToken(original);
  return parts[source.partIndex ?? 0] || original;
}

function rhythmTokenRestForDuration(token) {
  return rhythmDurationTokenFromValue(rhythmTokenDuration(token), true);
}

function rhythmSameDurationTokenLike(token, duration) {
  const parsed = rhythmDurationFromText(token);
  return rhythmDurationTokenFromValue(duration, parsed ? parsed.rest : false, rhythmTokenKindFromParsed(parsed));
}

function rhythmReplaceInTokenList(tokens, index, replacementToken) {
  if (tokens[index] == null) return;
  const selectedDuration = rhythmTokenDuration(tokens[index]);
  const replacementDuration = rhythmTokenDuration(replacementToken);
  let consumeLastIndex = index;
  let consumedDuration = selectedDuration;
  while (replacementDuration > consumedDuration + 0.00001 && consumeLastIndex + 1 < tokens.length) {
    consumeLastIndex += 1;
    consumedDuration += rhythmTokenDuration(tokens[consumeLastIndex]);
  }
  const replacement = [replacementToken];
  if (replacementDuration < consumedDuration - 0.00001) {
    replacement.push(rhythmSameDurationTokenLike(tokens[consumeLastIndex], consumedDuration - replacementDuration));
  }
  tokens.splice(index, consumeLastIndex - index + 1, ...replacement);
}

function rhythmReplaceSourceInTokens(tokens, source, replacementToken) {
  const original = tokens[source.tokenIndex];
  if (original == null) return;
  const tuplet = rhythmParseTupletToken(original);
  if (tuplet && source.innerIndex != null) {
    rhythmReplaceInTokenList(tuplet.inner, source.innerIndex, replacementToken);
    tokens[source.tokenIndex] = rhythmBuildTupletToken(tuplet);
    return;
  }
  const parts = rhythmSplitTieToken(original);
  if (source.partIndex != null && parts.length > 1) {
    rhythmReplaceInTokenList(parts, source.partIndex, replacementToken);
    tokens[source.tokenIndex] = rhythmJoinTieToken(parts);
    return;
  }
  rhythmReplaceInTokenList(tokens, source.tokenIndex, replacementToken);
}

function rhythmReplaceWholeSourceInTokens(tokens, source, replacementTokens) {
  if (!source || source.innerIndex != null || source.partIndex != null || tokens[source.tokenIndex] == null) return;
  const replacements = Array.isArray(replacementTokens) ? replacementTokens.filter(Boolean) : [replacementTokens].filter(Boolean);
  if (!replacements.length) return;
  if (replacements.length === 1) {
    rhythmReplaceInTokenList(tokens, source.tokenIndex, replacements[0]);
  } else {
    tokens.splice(source.tokenIndex, 1, ...replacements);
  }
}

function rhythmReplaceTextRangeWithTokens(text, position, replacementTokens) {
  const tokens = rhythmTokenize(text || "").filter(token => token !== "|");
  const replacements = (Array.isArray(replacementTokens) ? replacementTokens : [replacementTokens]).filter(Boolean);
  const replacementDuration = replacements.reduce((sum, token) => sum + rhythmTokenDuration(token), 0);
  const startPosition = Math.max(0, Number(position || 0));
  const endPosition = startPosition + replacementDuration;
  const result = [];
  const epsilon = 0.00001;
  let used = 0;

  tokens.forEach(token => {
    const duration = rhythmTokenDuration(token);
    const tokenStart = used;
    const tokenEnd = used + duration;
    used = tokenEnd;

    if (tokenEnd <= startPosition + epsilon) {
      result.push(token);
      return;
    }

    if (tokenStart >= endPosition - epsilon) {
      result.push(token);
      return;
    }

    const leftDuration = Math.max(0, startPosition - tokenStart);
    const rightDuration = Math.max(0, tokenEnd - endPosition);
    if (leftDuration > epsilon) result.push(rhythmSameDurationTokenLike(token, leftDuration));
    if (!result._inserted) {
      result.push(...replacements);
      result._inserted = true;
    }
    if (rightDuration > epsilon) result.push(rhythmSameDurationTokenLike(token, rightDuration));
  });

  if (!result._inserted) result.push(...replacements);
  delete result._inserted;
  return normalizeRhythmText(result.join(" "));
}

function rhythmConvertEmptySlashRangeToRests(text, startPosition, endPosition) {
  const tokens = rhythmTokenize(text || "").filter(token => token !== "|");
  const result = [];
  const epsilon = 0.00001;
  let used = 0;

  tokens.forEach(token => {
    const parsed = rhythmDurationFromText(token);
    const duration = rhythmTokenDuration(token);
    const tokenStart = used;
    const tokenEnd = used + duration;
    used = tokenEnd;

    if (!parsed?.emptySlash || tokenEnd <= startPosition + epsilon || tokenStart >= endPosition - epsilon) {
      result.push(token);
      return;
    }

    const leftDuration = Math.max(0, startPosition - tokenStart);
    const restStart = Math.max(tokenStart, startPosition);
    const restEnd = Math.min(tokenEnd, endPosition);
    const restDuration = Math.max(0, restEnd - restStart);
    const rightDuration = Math.max(0, tokenEnd - endPosition);

    if (leftDuration > epsilon) result.push(rhythmDurationTokenFromValue(leftDuration, false, "emptySlash"));
    if (restDuration > epsilon) result.push(rhythmDurationTokenFromValue(restDuration, true));
    if (rightDuration > epsilon) result.push(rhythmDurationTokenFromValue(rightDuration, false, "emptySlash"));
  });

  return normalizeRhythmText(result.join(" "));
}

function rhythmFillPulseRemainderWithRests(text, startPosition, duration) {
  const meter = rhythmParseMeter(song.timeSignature);
  const beatUnit = 1 / meter.unit;
  const endPosition = Number(startPosition || 0) + Number(duration || 0);
  const pulseEnd = Math.min(
    meter.capacity,
    (Math.floor((endPosition + 0.00001) / beatUnit) + 1) * beatUnit
  );
  if (pulseEnd - endPosition <= 0.00001) return text;
  return rhythmConvertEmptySlashRangeToRests(text, endPosition, pulseEnd);
}

function rhythmRefsAndTexts() {
  const refs = rhythmMeasureRefs();
  return {
    refs,
    texts: refs.map(ref => normalizeRhythmText(ref.measure.rhythm || ""))
  };
}

function rhythmWriteTexts(refs, texts) {
  refs.forEach((ref, index) => {
    ref.measure.rhythm = normalizeRhythmText(texts[index] || "");
  });
}

function rhythmSplitTokenAcrossPulseBoundaries(token, startInMeasure) {
  const parsed = rhythmDurationFromText(token);
  if (!parsed) return [{ measureOffset: 0, token, duration: rhythmTokenDuration(token) }];
  const meter = rhythmParseMeter(song.timeSignature);
  const beatUnit = 1 / meter.unit;
  const pieces = [];
  let remaining = parsed.duration;
  let position = startInMeasure;
  let measureOffset = 0;
  const startsInsidePulse = Math.abs(startInMeasure % beatUnit) > 0.00001;
  while (remaining > 0.00001) {
    if (position >= meter.capacity - 0.00001) {
      measureOffset += 1;
      position = 0;
    }
    const nextBoundary = startsInsidePulse
      ? Math.min(meter.capacity, (Math.floor((position + 0.00001) / beatUnit) + 1) * beatUnit)
      : meter.capacity;
    const available = Math.max(0, nextBoundary - position);
    const take = Math.min(remaining, available || remaining);
    const hasMore = remaining - take > 0.00001;
    const pieceToken = rhythmDurationTokenFromValue(take, parsed.rest, rhythmTokenKindFromParsed(parsed));
    pieces.push({
      measureOffset,
      token: !parsed.rest && hasMore ? `${pieceToken}~` : pieceToken,
      duration: take
    });
    remaining -= take;
    position += take;
  }
  return pieces;
}

function rhythmGroupedPieceTokens(pieces, measureOffset) {
  return pieces.filter(piece => piece.measureOffset === measureOffset).map(piece => piece.token);
}

function rhythmInvisibleFillTokens(duration) {
  const meter = rhythmParseMeter(song.timeSignature);
  const beatUnit = 1 / meter.unit;
  const tokens = [];
  let remaining = Math.max(0, Number(duration || 0));
  while (remaining > 0.00001) {
    const take = Math.min(beatUnit, remaining);
    tokens.push(rhythmDurationTokenFromValue(take, false, "emptySlash"));
    remaining -= take;
  }
  return tokens;
}

function rhythmEnsureTextReachesPosition(text, position) {
  const current = normalizeRhythmText(text || "");
  const currentDuration = rhythmMeasureDurationText(current);
  const missing = Math.max(0, Number(position || 0) - currentDuration);
  if (missing <= 0.00001) return current;
  const fill = rhythmInvisibleFillTokens(missing).join(" ");
  return normalizeRhythmText(current ? `${current} ${fill}` : fill);
}

function rhythmEnsureTextFillsMeasureWithInvisible(text) {
  const current = normalizeRhythmText(text || "");
  if (!current) return "";
  const meter = rhythmParseMeter(song.timeSignature);
  const missing = meter.capacity - rhythmMeasureDurationText(current);
  if (missing <= 0.00001) return current;
  const fill = rhythmInvisibleFillTokens(missing).join(" ");
  return normalizeRhythmText(`${current} ${fill}`);
}

function rhythmTextOrFullInvisible(text) {
  const current = normalizeRhythmText(text || "");
  if (current) return rhythmEnsureTextFillsMeasureWithInvisible(current);
  return rhythmInvisibleFillTokens(rhythmParseMeter(song.timeSignature).capacity).join(" ");
}

function rhythmMoveCursorAfterDuration(refs, globalIndex, startPosition, duration) {
  const meter = rhythmParseMeter(song.timeSignature);
  const total = Number(startPosition || 0) + Number(duration || 0);
  let offset = Math.floor((total + 0.00001) / meter.capacity);
  let position = total - offset * meter.capacity;
  if (Math.abs(position - meter.capacity) <= 0.00001) {
    offset += 1;
    position = 0;
  }
  const nextRef = refs[globalIndex + offset];
  if (!nextRef) {
    selectedRhythm.insertPosition = null;
    selectedRhythm.entryMode = null;
    return;
  }
  selected.page = nextRef.pageIndex;
  selected.measure = nextRef.measureIndex;
  selectedRhythm.page = nextRef.pageIndex;
  selectedRhythm.measure = nextRef.measureIndex;
  selectedRhythm.insertPosition = Math.max(0, position);
  selectedRhythm.entryMode = "cursor";
}

function rhythmCompleteMeasureWithRests(ref) {
  if (!ref?.measure) return false;
  const current = normalizeRhythmText(ref.measure.rhythm || "");
  if (!current) return false;
  const meter = rhythmParseMeter(song.timeSignature);
  const missing = meter.capacity - rhythmMeasureDurationText(current);
  if (missing <= 0.00001) return false;
  ref.measure.rhythm = normalizeRhythmText(`${current} ${rhythmDurationTokensFromValue(missing, true).join(" ")}`);
  return true;
}

function rhythmSelectMeasure(pageIndex, measureIndex, options = {}) {
  const previous = rhythmSelectedRef();
  const completed = !options.skipComplete && rhythmCompleteMeasureWithRests(previous ? { measure: previous } : null);
  if (completed) setDirty(true);
  rhythmEditingActive = true;
  selected.page = pageIndex;
  selected.measure = measureIndex;
  selectedRhythm.page = pageIndex;
  selectedRhythm.measure = measureIndex;
  rhythmClearSourceSelection();
  selectedRhythm.tuplets = [];
  selectedRhythm.insertPosition = null;
  renderAll(false);
}

function rhythmAddDotToToken(token) {
  const tie = token.match(/[~-]$/)?.[0] || "";
  const base = tie ? token.slice(0, -1) : token;
  return `${base}.${tie}`;
}

function rhythmAddTieToToken(token) {
  if (!token || /^x/.test(token) || /[~-]$/.test(token)) return token;
  return `${token}~`;
}

function rhythmDotSelection() {
  const source = rhythmSelectedSourcesUnique()[0];
  const measure = rhythmSelectedRef();
  if (!source || !measure) return false;
  const tokens = rhythmTokenize(measure.rhythm || "").filter(token => token !== "|");
  const token = rhythmSourceTokenText(tokens, source);
  if (!token) return false;
  rhythmReplaceSourceInTokens(tokens, source, rhythmAddDotToToken(token));
  measure.rhythm = normalizeRhythmText(tokens.join(" "));
  rhythmRetainSelectionForSources(measure, [source]);
  setDirty(true);
  renderAll(false);
  return true;
}

function rhythmTieSelection() {
  const source = rhythmSelectedSourcesUnique()[0];
  const measure = rhythmSelectedRef();
  if (!source || !measure) return false;
  const tokens = rhythmTokenize(measure.rhythm || "").filter(token => token !== "|");
  const token = rhythmSourceTokenText(tokens, source);
  if (!token) return false;
  rhythmReplaceSourceInTokens(tokens, source, rhythmAddTieToToken(token));
  measure.rhythm = normalizeRhythmText(tokens.join(" "));
  rhythmRetainSelectionForSources(measure, [source]);
  setDirty(true);
  renderAll(false);
  return true;
}

function rhythmReplaceSelectionWith(value) {
  const sources = rhythmSelectedSourcesUnique();
  const measure = rhythmSelectedRef();
  if (!sources.length || !measure) return false;
  const tokens = rhythmTokenize(measure.rhythm || "").filter(token => token !== "|");
  sources
    .sort((a, b) => rhythmSourceKey(b).localeCompare(rhythmSourceKey(a)))
    .forEach(source => rhythmReplaceSourceInTokens(tokens, source, value));
  measure.rhythm = normalizeRhythmText(tokens.join(" "));
  rhythmClearSourceSelection();
  selectedRhythm.tuplets = [];
  selectedRhythm.insertPosition = null;
  selectedRhythm.slashCycleTarget = null;
  rhythmSlashCycleIndex = 0;
  setDirty(true);
  renderAll(false);
  return true;
}

function rhythmAppendMeasureToken(value) {
  const { refs, texts } = rhythmRefsAndTexts();
  const globalIndex = rhythmMeasureGlobalIndex(selectedRhythm.page, selectedRhythm.measure);
  if (globalIndex < 0) return;
  const explicitInsertPosition = Number.isFinite(Number(selectedRhythm.insertPosition));
  const startPosition = Number.isFinite(Number(selectedRhythm.insertPosition))
    ? Number(selectedRhythm.insertPosition)
    : rhythmMeasureDurationText(texts[globalIndex] || "");
  if (explicitInsertPosition) {
    texts[globalIndex] = rhythmEnsureTextReachesPosition(texts[globalIndex] || "", Number(selectedRhythm.insertPosition));
  }
  const current = texts[globalIndex] || "";
  const compact = value === "." || value === "-" || current.endsWith("-");
  const explicitDuration = rhythmDurationFromText(value);
  if (explicitInsertPosition && explicitDuration && !compact) {
    texts[globalIndex] = rhythmTextOrFullInvisible(texts[globalIndex]);
    const pieces = rhythmSplitTokenAcrossPulseBoundaries(value, startPosition);
    const maxOffset = Math.max(...pieces.map(piece => piece.measureOffset));
    for (let offset = 0; offset <= maxOffset; offset += 1) {
      const index = globalIndex + offset;
      const groupedTokens = rhythmGroupedPieceTokens(pieces, offset);
      if (!groupedTokens.length || !refs[index]) continue;
      const position = offset === 0 ? startPosition : 0;
      texts[index] = rhythmTextOrFullInvisible(texts[index] || "");
      texts[index] = rhythmEnsureTextFillsMeasureWithInvisible(
        rhythmReplaceTextRangeWithTokens(texts[index], position, groupedTokens)
      );
      if (offset > 0 && !explicitDuration.rest) {
        const groupedDuration = groupedTokens.reduce((sum, token) => sum + rhythmTokenDuration(token), 0);
        texts[index] = rhythmFillPulseRemainderWithRests(texts[index], position, groupedDuration);
      }
    }
    rhythmWriteTexts(refs, texts);
    rhythmClearSourceSelection();
    selectedRhythm.tuplets = [];
    selectedRhythm.slashCycleTarget = null;
    rhythmSlashCycleIndex = 0;
    rhythmMoveCursorAfterDuration(refs, globalIndex, startPosition, explicitDuration.duration);
    setDirty(true);
    renderAll(false);
    return;
  }
  if (!compact && rhythmDurationFromText(value)) {
    const start = rhythmMeasureDurationText(current);
    const pieces = rhythmSplitTokenAcrossPulseBoundaries(value, start);
    const maxOffset = Math.max(...pieces.map(piece => piece.measureOffset));
    for (let offset = 0; offset <= maxOffset; offset += 1) {
      const index = globalIndex + offset;
      const tokens = rhythmGroupedPieceTokens(pieces, offset);
      if (!tokens.length || !refs[index]) continue;
      if (offset > 0 && texts[index]) {
        const existing = rhythmTokenize(texts[index]).filter(token => token !== "|");
        existing.splice(0, 1, tokens.join("-").replace(/~-/g, "-"));
        texts[index] = existing.join(" ");
      } else {
        texts[index] = texts[index] ? `${texts[index]} ${tokens.join(" ")}` : tokens.join(" ");
      }
      if (offset > 0) {
        texts[index] = rhythmEnsureTextFillsMeasureWithInvisible(texts[index]);
      }
    }
    if (explicitInsertPosition) {
      texts[globalIndex] = rhythmEnsureTextFillsMeasureWithInvisible(texts[globalIndex]);
    }
    rhythmWriteTexts(refs, texts);
  } else {
    refs[globalIndex].measure.rhythm = normalizeRhythmText(current ? `${current}${compact ? "" : " "}${value}` : value);
  }
  rhythmClearSourceSelection();
  selectedRhythm.tuplets = [];
  selectedRhythm.slashCycleTarget = null;
  rhythmSlashCycleIndex = 0;
  if (explicitInsertPosition && explicitDuration && !compact) {
    rhythmMoveCursorAfterDuration(refs, globalIndex, startPosition, explicitDuration.duration);
  } else {
    selectedRhythm.insertPosition = null;
    selectedRhythm.entryMode = null;
  }
  setDirty(true);
  renderAll(false);
}

function rhythmTupletTargetDuration(tuplet) {
  return Number(tuplet.count) / Number(tuplet.unit);
}

function rhythmTupletUsedDuration(tuplet) {
  return tuplet.items.reduce((sum, item) => {
    const parsed = rhythmDurationFromText(item);
    return sum + (parsed ? parsed.duration : 0);
  }, 0);
}

function rhythmOpenTupletGroup(count, unit) {
  rhythmEditingActive = true;
  selectedRhythm.openTuplet = {
    count: Number(count),
    unit: Number(unit),
    page: selectedRhythm.page,
    measure: selectedRhythm.measure,
    items: []
  };
  rhythmUpdatePaletteStatus();
}

function rhythmCloseTupletGroup() {
  const tuplet = selectedRhythm.openTuplet;
  if (!tuplet) return;
  selectedRhythm.page = tuplet.page;
  selectedRhythm.measure = tuplet.measure;
  const token = `${tuplet.count}/${tuplet.unit}(${tuplet.items.join(" ")})`;
  selectedRhythm.openTuplet = null;
  rhythmAppendMeasureToken(token);
}

function rhythmAddToOpenTuplet(value) {
  const tuplet = selectedRhythm.openTuplet;
  if (!tuplet) return false;
  if (value === "." || value === "-") {
    const last = tuplet.items.length - 1;
    if (last >= 0) tuplet.items[last] += value;
    rhythmUpdatePaletteStatus();
    return true;
  }
  const parsed = rhythmDurationFromText(value);
  if (!parsed) return true;
  const target = rhythmTupletTargetDuration(tuplet);
  const nextTotal = rhythmTupletUsedDuration(tuplet) + parsed.duration;
  if (nextTotal < target - 0.00001) {
    tuplet.items.push(value);
    rhythmUpdatePaletteStatus();
    return true;
  }
  if (Math.abs(nextTotal - target) <= 0.00001) {
    tuplet.items.push(value);
    rhythmCloseTupletGroup();
    return true;
  }
  const remainingInside = Math.max(0, target - rhythmTupletUsedDuration(tuplet));
  const overflow = nextTotal - target;
  if (remainingInside > 0.00001) {
    const insideToken = rhythmDurationTokenFromValue(remainingInside, parsed.rest);
    tuplet.items.push(parsed.rest ? insideToken : `${insideToken}~`);
  }
  selectedRhythm.openTuplet = null;
  rhythmAppendMeasureToken(`${tuplet.count}/${tuplet.unit}(${tuplet.items.join(" ")})`);
  rhythmAppendMeasureToken(rhythmDurationTokenFromValue(overflow, parsed.rest));
  return true;
}

function rhythmAppendToSelected(value) {
  rhythmEditingActive = true;
  selectedRhythm.slashCycleTarget = null;
  if (selectedRhythm.openTuplet && value !== "|") {
    rhythmAddToOpenTuplet(value);
    return;
  }
  if (value === "." && rhythmDotSelection()) return;
  if (value === "-" && rhythmTieSelection()) return;
  const shouldReplaceSelection = selectedRhythm.entryMode === "selection" ||
    (!Number.isFinite(Number(selectedRhythm.insertPosition)) && selectedRhythm.entryMode !== "cursor");
  if (value !== "." && value !== "-" && shouldReplaceSelection && rhythmReplaceSelectionWith(value)) return;
  rhythmAppendMeasureToken(value);
}

function rhythmDeleteSelection() {
  rhythmEditingActive = true;
  selectedRhythm.slashCycleTarget = null;
  const measure = rhythmSelectedRef();
  if (!measure) return;
  const selectedSources = rhythmSelectedSourcesUnique();
  const selectedTuplets = [...selectedRhythm.tuplets];
  if (selectedRhythm.tuplets.length) {
    const tokens = rhythmTokenize(measure.rhythm || "").filter(token => token !== "|");
    selectedRhythm.tuplets
      .sort((a, b) => b.tokenIndex - a.tokenIndex)
      .forEach(source => {
        const tuplet = rhythmParseTupletToken(tokens[source.tokenIndex] || "");
        if (!tuplet) return;
        tokens.splice(source.tokenIndex, 1, ...tuplet.inner);
      });
    measure.rhythm = normalizeRhythmText(tokens.join(" "));
  } else {
    const sources = selectedSources;
    if (!sources.length) {
      measure.rhythm = "";
    } else {
      const tokens = rhythmTokenize(measure.rhythm || "").filter(token => token !== "|");
      sources
        .sort((a, b) => rhythmSourceKey(b).localeCompare(rhythmSourceKey(a)))
        .forEach(source => {
          const token = rhythmSourceTokenText(tokens, source);
          if (token) rhythmReplaceSourceInTokens(tokens, source, rhythmTokenRestForDuration(token));
        });
      measure.rhythm = normalizeRhythmText(tokens.join(" "));
    }
  }
  selectedRhythm.openTuplet = null;
  if (selectedSources.length) {
    rhythmRetainSelectionForSources(measure, selectedSources);
  } else if (selectedTuplets.length) {
    rhythmRetainSelectionForSources(measure, [{ tokenIndex: selectedTuplets[0].tokenIndex }]);
  } else {
    rhythmClearSourceSelection();
    selectedRhythm.tuplets = [];
    selectedRhythm.insertPosition = null;
    selectedRhythm.entryMode = null;
    selectedRhythm.slashCycleTarget = null;
    rhythmSlashCycleIndex = 0;
  }
  setDirty(true);
  renderAll(false);
}

function rhythmAutoSpace() {
  rhythmEditingActive = true;
  rhythmMeasureRefs().forEach(ref => {
    ref.measure.rhythm = rhythmTokenize(ref.measure.rhythm || "")
      .filter(token => token !== "|")
      .join(" ");
  });
  rhythmClearSourceSelection();
  selectedRhythm.tuplets = [];
  setDirty(true);
  renderAll(false);
}

function rhythmNoteheadFor(denominator) {
  if (denominator === 1) return RHYTHM_NOTEHEAD_WHOLE;
  if (denominator === 2) return RHYTHM_NOTEHEAD_HALF;
  return RHYTHM_NOTEHEAD_BLACK;
}

function rhythmBeamLevels(denominator) {
  if (denominator >= 32) return 3;
  if (denominator >= 16) return 2;
  if (denominator >= 8) return 1;
  return 0;
}

function rhythmDrawFlag(group, x, y, levels, color) {
  for (let level = 0; level < levels; level += 1) {
    const offset = level * 5.8;
    group.appendChild(svgEl("path", {
      d: `M ${x} ${y + offset} C ${x + 18} ${y + offset + 4}, ${x + 16} ${y + offset + 15}, ${x + 6} ${y + offset + 16}`,
      fill: "none",
      stroke: color,
      "stroke-width": 1.55,
      "stroke-linecap": "round",
      "pointer-events": "none"
    }));
  }
}

function rhythmPulseIndex(item, meter) {
  return Math.floor((item.start + 0.00001) / (1 / meter.unit));
}

function rhythmCanBeamTogether(first, second, meter) {
  return first && second &&
    !first.rest && !second.rest &&
    rhythmBeamLevels(first.denominator) > 0 &&
    rhythmBeamLevels(second.denominator) > 0 &&
    rhythmPulseIndex(first, meter) === rhythmPulseIndex(second, meter);
}

function rhythmVisualWeight(item) {
  if (item.tuplet) return 1.2;
  if (item.denominator >= 16) return 0.72;
  if (item.denominator >= 8) return 0.9;
  if (item.denominator === 4) return 1.08;
  if (item.denominator === 2) return 1.35;
  return 1.7;
}

function rhythmLayoutItems(items, x, w) {
  if (!items.length) return new Map();
  const innerStart = x + 18;
  const innerWidth = Math.max(24, w - 36);
  const weights = items.map(rhythmVisualWeight);
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  const map = new Map();
  let cursor = innerStart;
  items.forEach((item, index) => {
    const slotW = innerWidth * weights[index] / total;
    map.set(item, cursor + slotW / 2);
    cursor += slotW;
  });
  return map;
}

function rhythmPositionedItemsForMeasure(measure, x, y, w) {
  const s = scoreSettings();
  const meter = rhythmParseMeter(song.timeSignature);
  const baseY = y + Number(s.rhythmY || -9);
  const size = Number(s.rhythmSize || 26);
  const stemHeight = Number(s.rhythmStemHeight || 34);
  const parsed = rhythmParseMeasureText(measure?.rhythm || "");
  let used = 0;
  const items = [];
  parsed.forEach(item => {
    if (used + item.duration > meter.capacity + 0.00001 && items.length) return;
    items.push({ ...item, start: used });
    used += item.duration;
  });
  const innerStart = x + 18;
  const innerWidth = Math.max(24, w - 36);

  return items.map(item => {
    const midpoint = item.start + item.duration / 2;
    const px = innerStart + (midpoint / meter.capacity) * innerWidth;
    const data = { ...item, x: px, y: baseY };
    if (!item.rest && item.denominator !== 1) {
      data.stemX = px + size * 0.22;
      data.stemTop = baseY - stemHeight;
    }
    return data;
  });
}

function rhythmPulseStartForIndex(pulseIndex, meter = rhythmParseMeter(song.timeSignature)) {
  return clamp(Number(pulseIndex || 0), 0, Math.max(0, meter.beats - 1)) * (1 / meter.unit);
}

function rhythmSourceAtPosition(measure, position) {
  const items = rhythmParseMeasureText(measure?.rhythm || "");
  let used = 0;
  const epsilon = 0.00001;
  for (const item of items) {
    const start = used;
    const end = used + item.duration;
    used = end;
    if (position + epsilon >= start && position < end - epsilon) {
      return item.source || null;
    }
    if (Math.abs(position - start) <= epsilon) {
      return item.source || null;
    }
  }
  return null;
}

function rhythmSourceStartPosition(measure, source) {
  const key = rhythmSourceKey(source);
  if (!key) return null;
  const items = rhythmParseMeasureText(measure?.rhythm || "");
  let used = 0;
  for (const item of items) {
    const start = used;
    used += item.duration;
    if (rhythmSourceKey(item.source) === key) return start;
  }
  return null;
}

function rhythmSourceStillExists(measure, source) {
  const tokens = rhythmTokenize(measure?.rhythm || "").filter(token => token !== "|");
  if (!source || tokens[source.tokenIndex] == null) return false;
  if (source.innerIndex != null) {
    const tuplet = rhythmParseTupletToken(tokens[source.tokenIndex]);
    return !!tuplet && tuplet.inner[source.innerIndex] != null;
  }
  if (source.partIndex != null) {
    return rhythmSplitTieToken(tokens[source.tokenIndex]).length > source.partIndex;
  }
  return true;
}

function rhythmRetainSelectionForSources(measure, sources) {
  const retained = [];
  (sources || []).forEach(source => {
    if (!source) return;
    if (rhythmSourceStillExists(measure, source)) {
      retained.push(source);
      return;
    }
    const outerSource = { tokenIndex: source.tokenIndex };
    if (rhythmSourceStillExists(measure, outerSource)) {
      retained.push(outerSource);
    }
  });
  selectedRhythm.sources = retained;
  selectedRhythm.sourceKeys = retained.map(rhythmSourceKey).filter(Boolean);
  selectedRhythm.tuplets = [];
  selectedRhythm.insertPosition = null;
  selectedRhythm.entryMode = null;
  selectedRhythm.slashCycleTarget = null;
  rhythmSlashCycleIndex = 0;
}

function rhythmSelectPulse(pageIndex, measureIndex, pulseIndex) {
  const measure = song.pages?.[pageIndex]?.measures?.[measureIndex];
  if (!measure) return;

  const previous = rhythmSelectedRef();
  const changedMeasure = selectedRhythm.page !== pageIndex || selectedRhythm.measure !== measureIndex;
  if (changedMeasure) {
    const completed = rhythmCompleteMeasureWithRests(previous ? { measure: previous } : null);
    if (completed) setDirty(true);
  }

  const meter = rhythmParseMeter(song.timeSignature);
  const position = rhythmPulseStartForIndex(pulseIndex, meter);
  rhythmEditingActive = true;
  selectedConnector = null;
  selected.page = pageIndex;
  selected.measure = measureIndex;
  selectedRhythm.page = pageIndex;
  selectedRhythm.measure = measureIndex;
  selectedRhythm.tuplets = [];
  selectedRhythm.openTuplet = null;
  selectedRhythm.slashCycleTarget = null;
  rhythmSlashCycleIndex = 0;
  rhythmClearSourceSelection();
  selectedRhythm.insertPosition = position;
  selectedRhythm.entryMode = "cursor";

  renderAll(false);
}

function renderRhythmMeasure(group, measure, pageIndex, measureIndex, x, y, w) {
  const s = scoreSettings();
  const meter = rhythmParseMeter(song.timeSignature);
  const rhythmY = Number(s.rhythmY ?? -34);
  const baseY = y + rhythmY;
  const color = s.rhythmColor || s.inkColor || "#111111";
  const size = Number(s.rhythmSize ?? 29);
  const stemHeight = Number(s.rhythmStemHeight ?? 35);
  const lane = rhythmLaneMetrics(s);
  const laneTop = y + lane.top;
  const laneHeight = lane.height;
  const isSelectedMeasure = rhythmEditingActive && selectedRhythm.page === pageIndex && selectedRhythm.measure === measureIndex;

  group.appendChild(hitRect({
    x,
    y: laneTop,
    width: w,
    height: laneHeight,
    class: `hit rhythmMeasureHit${isSelectedMeasure ? " rhythmMeasureSelected" : ""}`,
      "data-kind": "rhythmMeasure",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-rhythm-text": normalizeRhythmText(measure.rhythm || ""),
      "data-tooltip": "Ritmo"
    }, "Ritmo"));

  const beatUnit = 1 / meter.unit;
  const laneInset = 6;
  const pulseWidth = Math.max(18, (w - laneInset * 2) / Math.max(1, meter.beats));
  for (let pulseIndex = 0; pulseIndex < meter.beats; pulseIndex += 1) {
    const pulseX = x + laneInset + pulseIndex * pulseWidth;
    group.appendChild(hitRect({
      x: pulseX,
      y: laneTop + 2,
      width: Math.max(12, pulseWidth - 2),
      height: laneHeight - 4,
      rx: 4,
      class: `hit rhythmPulseHit${isSelectedMeasure && Math.abs(Number(selectedRhythm.insertPosition ?? -999) - pulseIndex * beatUnit) < 0.00001 ? " rhythmPulseSelected" : ""}`,
      "data-kind": "rhythmPulse",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-pulse": pulseIndex,
      "data-tooltip": `Ritmo pulso ${pulseIndex + 1}`
    }, `Ritmo pulso ${pulseIndex + 1}`));
    group.appendChild(textEl(String(pulseIndex + 1), {
      x: pulseX + 5,
      y: laneTop + 12,
      "text-anchor": "start",
      fill: "#8d8178",
      "font-family": "system-ui, sans-serif",
      "font-size": 9,
      "font-weight": 700,
      class: "rhythmPulseGuide",
      "pointer-events": "none"
    }));
  }

  const positioned = rhythmPositionedItemsForMeasure(measure, x, y, w);
  if (!positioned.length) return;
  const rhythmTokensForHit = rhythmTokenize(measure.rhythm || "").filter(token => token !== "|");

  positioned.forEach(item => {
    const px = item.x;
    const data = item;

    if (rhythmHasSelectedSource(item.source) && isSelectedMeasure) {
      group.appendChild(svgEl("rect", {
        x: px - 15,
        y: baseY - stemHeight - 8,
        width: 30,
        height: stemHeight + 28,
        rx: 4,
        class: "rhythmItemSelected",
        "pointer-events": "none"
      }));
    }

    if (item.rest) {
      group.appendChild(textEl(RHYTHM_RESTS[item.denominator] || RHYTHM_RESTS[4], {
        x: px,
        y: baseY - 2,
        "text-anchor": "middle",
        fill: color,
        "font-family": "\"MTF Improviso\", serif",
        "font-size": size,
        "font-weight": 400,
        "pointer-events": "none"
      }));
    } else if (item.emptySlash) {
      // Espaciador rítmico: ocupa duración, pero no dibuja nada.
    } else if (item.slash || item.invisibleSlash) {
      group.appendChild(svgEl("line", {
        x1: px - size * 0.18,
        y1: baseY + size * 0.24,
        x2: px + size * 0.18,
        y2: baseY - size * 0.24,
        stroke: item.invisibleSlash ? "#c5bdb5" : color,
        "stroke-width": Math.max(2.1, size * 0.12),
        "stroke-linecap": "round",
        "pointer-events": "none"
      }));
    } else {
      group.appendChild(textEl(rhythmNoteheadFor(item.denominator), {
        x: px,
        y: baseY,
        "text-anchor": "middle",
        fill: color,
        "font-family": "\"MTF Improviso\", serif",
        "font-size": size,
        "font-weight": 400,
        "pointer-events": "none"
      }));
      if (item.denominator !== 1) {
        data.stemX = px + size * 0.22;
        data.stemTop = baseY - stemHeight;
        group.appendChild(svgEl("line", {
          x1: data.stemX,
          y1: baseY - 3,
          x2: data.stemX,
          y2: data.stemTop,
          class: "rhythmStem",
          stroke: color
        }));
      }
    }

    if (!item.emptySlash) {
      for (let dot = 0; dot < item.dots; dot += 1) {
        group.appendChild(svgEl("circle", {
          cx: px + size * 0.48 + dot * 6,
          cy: baseY,
          r: 1.7,
          fill: color,
          "pointer-events": "none"
        }));
      }
    }
  });

  positioned.forEach((item, index) => {
    if (!item.tieToNext || item.emptySlash) return;
    const next = positioned[index + 1];
    if (!next) return;
    group.appendChild(svgEl("path", {
      d: `M ${item.x + 8} ${item.y + 15} Q ${(item.x + next.x) / 2} ${item.y + 27} ${next.x - 8} ${next.y + 15}`,
      class: "rhythmTie",
      stroke: color
    }));
  });

  positioned.forEach((item, index) => {
    if (item.rest || item.slash || item.invisibleSlash || item.emptySlash || rhythmBeamLevels(item.denominator) === 0) return;
    const previous = positioned[index - 1];
    const next = positioned[index + 1];
    const hasBeamNeighbor = rhythmCanBeamTogether(previous, item, meter) || rhythmCanBeamTogether(item, next, meter);
    if (!hasBeamNeighbor) rhythmDrawFlag(group, item.stemX, item.stemTop, rhythmBeamLevels(item.denominator), color);
  });

  for (let i = 0; i < positioned.length - 1; i += 1) {
    const current = positioned[i];
    const next = positioned[i + 1];
    if (current.slash || current.invisibleSlash || current.emptySlash || next.slash || next.invisibleSlash || next.emptySlash) continue;
    if (!rhythmCanBeamTogether(current, next, meter)) continue;
    const levels = Math.min(rhythmBeamLevels(current.denominator), rhythmBeamLevels(next.denominator));
    for (let level = 0; level < levels; level += 1) {
      group.appendChild(svgEl("line", {
        x1: current.stemX,
        y1: current.stemTop + level * 5.8,
        x2: next.stemX,
        y2: next.stemTop + level * 5.8,
        class: "rhythmBeam",
        stroke: color
      }));
    }
  }

  const tupletGroups = new Map();
  positioned.forEach(item => {
    if (!item.tuplet) return;
    if (!tupletGroups.has(item.tuplet.id)) {
      tupletGroups.set(item.tuplet.id, { label: item.tuplet.label, items: [] });
    }
    tupletGroups.get(item.tuplet.id).items.push(item);
  });

  tupletGroups.forEach(tupletGroup => {
    const first = tupletGroup.items[0];
    const last = tupletGroup.items.at(-1);
    if (!first || !last) return;
    const top = baseY - stemHeight - 14;
    const source = { tokenIndex: first.source.tokenIndex };
    group.appendChild(svgEl("path", {
      d: `M ${first.x - 9} ${top + 7} L ${first.x - 9} ${top} L ${last.x + 9} ${top} L ${last.x + 9} ${top + 7}`,
      class: `rhythmTupletBracket${isSelectedMeasure && rhythmHasSelectedTuplet(source) ? " rhythmTupletSelected" : ""}`,
      stroke: color
    }));
    group.appendChild(textEl(tupletGroup.label, {
      x: (first.x + last.x) / 2,
      y: top - 4,
      "text-anchor": "middle",
      fill: color,
      "font-family": "system-ui, sans-serif",
      "font-size": 10,
      "font-weight": 800,
      "pointer-events": "none"
    }));
    group.appendChild(hitRect({
      x: first.x - 16,
      y: top - 16,
      width: Math.max(32, last.x - first.x + 32),
      height: 34,
      rx: 4,
      class: "hit rhythmTupletHit",
      "data-kind": "rhythmTuplet",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-token": source.tokenIndex,
      "data-tooltip": "Grupo irregular"
    }, "Grupo irregular"));
  });

  const selectablePositioned = positioned.filter(item => item.source && !item.emptySlash);
  selectablePositioned.forEach((item, index) => {
    if (!item.source || item.emptySlash) return;
    const previous = selectablePositioned[index - 1];
    const next = selectablePositioned[index + 1];
    const hitX1 = Math.max(x, previous ? (previous.x + item.x) / 2 : item.x - 24);
    const hitX2 = Math.min(x + w, next ? (item.x + next.x) / 2 : item.x + 24);
    group.appendChild(hitRect({
      x: hitX1,
      y: item.y - stemHeight - 12,
      width: Math.max(16, hitX2 - hitX1),
      height: stemHeight + 34,
      rx: 4,
      class: "hit rhythmItemHit",
      "data-kind": "rhythmItem",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-token": item.source.tokenIndex,
      "data-inner": item.source.innerIndex ?? "",
      "data-part": item.source.partIndex ?? "",
      "data-rhythm-token": rhythmSourceTokenText(rhythmTokensForHit, item.source),
      "data-rhythm-start": item.start,
      "data-rhythm-duration": item.duration,
      "data-tooltip": "Figura rítmica"
    }, "Figura rítmica"));
  });
}

function renderPageRhythmCrossMeasureTies(page, geoms) {
  const group = svgEl("g", { class: "pageRhythmCrossTies" });
  const color = scoreSettings().rhythmColor || scoreSettings().inkColor || "#111111";

  (page.measures || []).forEach((measure, measureIndex) => {
    const geom = geoms[measureIndex];
    const nextGeom = geoms[measureIndex + 1];
    const nextMeasure = page.measures[measureIndex + 1];
    if (!geom || !nextGeom || !nextMeasure) return;

    const currentItems = rhythmPositionedItemsForMeasure(measure, geom.x, geom.y, geom.w);
    const nextItems = rhythmPositionedItemsForMeasure(nextMeasure, nextGeom.x, nextGeom.y, nextGeom.w);
    const last = currentItems.at(-1);
    const next = nextItems[0];
    if (!last?.tieToNext || !next || last.rest || next.rest) return;

    const sameSystem = geom.systemIndex === nextGeom.systemIndex;
    if (sameSystem) {
      group.appendChild(svgEl("path", {
        d: `M ${last.x + 8} ${last.y + 15} Q ${(last.x + next.x) / 2} ${last.y + 27} ${next.x - 8} ${next.y + 15}`,
        class: "rhythmTie",
        stroke: color
      }));
      return;
    }

    const endOfSystemX = geom.x + geom.w - 10;
    const startOfSystemX = nextGeom.x + 10;
    group.appendChild(svgEl("path", {
      d: `M ${last.x + 8} ${last.y + 15} Q ${(last.x + endOfSystemX) / 2} ${last.y + 27} ${endOfSystemX} ${last.y + 15}`,
      class: "rhythmTie",
      stroke: color
    }));
    group.appendChild(svgEl("path", {
      d: `M ${startOfSystemX} ${next.y + 15} Q ${(startOfSystemX + next.x) / 2} ${next.y + 27} ${next.x - 8} ${next.y + 15}`,
      class: "rhythmTie",
      stroke: color
    }));
  });

  return group;
}

function rhythmUpdatePaletteStatus() {
  const tuplet = selectedRhythm.openTuplet;
  if (els.rhythmPaletteStatus) {
    els.rhythmPaletteStatus.textContent = tuplet
      ? `Grupo ${tuplet.count}:${tuplet.unit} abierto`
      : `Ritmo compás ${rhythmMeasureGlobalIndex(selectedRhythm.page, selectedRhythm.measure) + 1 || 1}`;
  }
  els.rhythmPaletteBar?.querySelectorAll("[data-rhythm-tuplet-count]").forEach(button => {
    const active = tuplet &&
      button.dataset.rhythmTupletCount === String(tuplet.count) &&
      button.dataset.rhythmTupletUnit === String(tuplet.unit);
    button.classList.toggle("rhythmActiveTuplet", !!active);
  });
  updateRhythmSlashCycleButton();
}

function rhythmSlashCycleOptions() {
  return [
    { token: "s/4", label: "Slash normal", className: "" },
    { token: "i/4", label: "Slash gris", className: "rhythmGhostSlashBtn" },
    { token: "v/4", label: "Slash vacío", className: "rhythmEmptySlashBtn" }
  ];
}

function rhythmSlashCycleCurrent() {
  const options = rhythmSlashCycleOptions();
  return options[rhythmSlashCycleIndex % options.length];
}

function updateRhythmSlashCycleButton() {
  const button = els.rhythmPaletteBar?.querySelector('[data-rhythm-action="slash-cycle"]');
  if (!button) return;
  const current = rhythmSlashCycleCurrent();
  button.classList.toggle("rhythmGhostSlashBtn", current.className === "rhythmGhostSlashBtn");
  button.classList.toggle("rhythmEmptySlashBtn", current.className === "rhythmEmptySlashBtn");
  button.dataset.tooltip = `${current.label}: negra`;
  button.setAttribute("aria-label", current.label);
}

function rhythmInsertSlashCycle() {
  const options = rhythmSlashCycleOptions();
  const current = rhythmSlashCycleCurrent();
  rhythmEditingActive = true;
  const measure = rhythmSelectedRef();
  if (!measure) return;

  let source = selectedRhythm.slashCycleTarget?.source || rhythmSelectedSourcesUnique()[0] || null;
  if (source && !rhythmSourceStillExists(measure, source)) source = null;
  const explicitInsertPosition = Number.isFinite(Number(selectedRhythm.insertPosition));
  const shouldReplaceSelectedPulse = explicitInsertPosition && selectedRhythm.entryMode === "selection";

  if (source && !shouldReplaceSelectedPulse) {
    const tokens = rhythmTokenize(measure.rhythm || "").filter(token => token !== "|");
    rhythmReplaceSourceInTokens(tokens, source, current.token);
    measure.rhythm = rhythmEnsureTextFillsMeasureWithInvisible(tokens.join(" "));
  } else {
    const position = explicitInsertPosition
      ? Number(selectedRhythm.insertPosition)
      : rhythmMeasureDurationText(measure.rhythm || "");
    measure.rhythm = rhythmEnsureTextReachesPosition(measure.rhythm || "", position);
    if (explicitInsertPosition) {
      measure.rhythm = rhythmEnsureTextFillsMeasureWithInvisible(
        rhythmReplaceTextRangeWithTokens(rhythmTextOrFullInvisible(measure.rhythm), position, current.token)
      );
      source = rhythmSourceAtPosition(measure, position);
    } else {
      const tokens = rhythmTokenize(measure.rhythm || "").filter(token => token !== "|");
      source = { tokenIndex: tokens.length };
      tokens.push(current.token);
      measure.rhythm = normalizeRhythmText(tokens.join(" "));
    }
  }

  selectedRhythm.sources = [source];
  selectedRhythm.insertPosition = null;
  selectedRhythm.slashCycleTarget = {
    page: selectedRhythm.page,
    measure: selectedRhythm.measure,
    source
  };

  rhythmSlashCycleIndex = (rhythmSlashCycleIndex + 1) % options.length;
  selectedRhythm.tuplets = [];
  selectedRhythm.openTuplet = null;
  setDirty(true);
  renderAll(false);
  updateRhythmSlashCycleButton();
}

function rhythmAdvanceSlashCyclePulse() {
  const measure = rhythmSelectedRef();
  const source = selectedRhythm.slashCycleTarget?.source;
  if (!measure || !source || !rhythmSourceStillExists(measure, source)) return false;

  const position = rhythmSourceStartPosition(measure, source);
  if (!Number.isFinite(Number(position))) return false;

  const meter = rhythmParseMeter(song.timeSignature);
  selectedRhythm.sources = [];
  selectedRhythm.slashCycleTarget = null;
  selectedRhythm.tuplets = [];
  selectedRhythm.openTuplet = null;
  rhythmSlashCycleIndex = 0;
  rhythmAdvanceRhythmCursorAfterPosition(Number(position) + (1 / meter.unit), meter);
  renderAll(false);
  updateRhythmSlashCycleButton();
  return true;
}

function rhythmAdvanceRhythmCursorAfterPosition(nextPosition, meter = rhythmParseMeter(song.timeSignature)) {
  if (nextPosition < meter.capacity - 0.00001) {
    selectedRhythm.insertPosition = nextPosition;
    selectedRhythm.entryMode = "cursor";
    return;
  }

  const refs = rhythmMeasureRefs();
  const globalIndex = rhythmMeasureGlobalIndex(selectedRhythm.page, selectedRhythm.measure);
  const nextRef = refs[globalIndex + 1];
  if (nextRef) {
    selectedRhythm.page = nextRef.pageIndex;
    selectedRhythm.measure = nextRef.measureIndex;
    selected.page = nextRef.pageIndex;
    selected.measure = nextRef.measureIndex;
    selectedRhythm.insertPosition = 0;
    selectedRhythm.entryMode = "cursor";
  } else {
    selectedRhythm.insertPosition = null;
    selectedRhythm.entryMode = null;
  }
}

function bindRhythmPalette() {
  els.rhythmPaletteBar?.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const insert = button.dataset.rhythmInsert;
    const action = button.dataset.rhythmAction;
    const tupletCount = button.dataset.rhythmTupletCount;
    if (!insert && !action && !tupletCount) return;
    rhythmEditingActive = true;
    if (insert) {
      rhythmAppendToSelected(insert);
      return;
    }
    if (action === "slash-cycle") {
      rhythmInsertSlashCycle();
      return;
    }
    if (tupletCount) {
      rhythmOpenTupletGroup(tupletCount, button.dataset.rhythmTupletUnit || "8");
      return;
    }
    if (action === "delete") rhythmDeleteSelection();
    if (action === "space") rhythmAutoSpace();
    if (action === "cancel-tuplet") {
      selectedRhythm.openTuplet = null;
      rhythmUpdatePaletteStatus();
    }
  });
}

function shouldHandleRhythmBackspace(event) {
  if (event.key !== "Backspace") return false;
  const active = document.activeElement;
  if (active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) return false;
  if (active?.isContentEditable) return false;
  return rhythmEditingActive && !!rhythmSelectedRef();
}

function shouldHandleRhythmSpaceAdvance(event) {
  if (event.key !== " " && event.key !== "Spacebar") return false;
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return false;
  const active = document.activeElement;
  if (active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) return false;
  if (active?.isContentEditable) return false;
  const measure = rhythmSelectedRef();
  const source = selectedRhythm.slashCycleTarget?.source;
  return rhythmEditingActive && !!measure && !!source && rhythmSourceStillExists(measure, source);
}

function slotPointFromEntry(measureIndex, measureW, entry) {
  const page = song.pages[selected.page];
  const geoms = computePageGeometries(page);
  return slotPointFromEntryForPage(page, geoms, measureIndex, entry);
}

function findNextVisibleSlot(page, measureIndex, slotIndex, span = 1) {
  const measure = page.measures[measureIndex];
  const entries = visibleSlotEntries(measure);
  const currentVisualIndex = entries.findIndex(entry => entry.slotIndex === slotIndex);
  const requestedSpan = connectorSpanValue(span);
  let remaining = requestedSpan;

  if (currentVisualIndex >= 0 && entries[currentVisualIndex + 1]) {
    for (let index = currentVisualIndex + 1; index < entries.length; index++) {
      remaining -= 1;
      if (remaining <= 0) {
        return {
          measureIndex,
          entry: entries[index]
        };
      }
    }
  }

  for (let i = measureIndex + 1; i < page.measures.length; i++) {
    const nextEntries = visibleSlotEntries(page.measures[i]);
    for (const entry of nextEntries) {
      remaining -= 1;
      if (remaining <= 0) {
        return {
          measureIndex: i,
          entry
        };
      }
    }
  }

  return null;
}

function renderPageConnectors(page, pageIndex, geoms) {
  const g = svgEl("g", { class: "pageConnectors" });
  const handles = svgEl("g", { class: "connectorHandles" });

  page.measures.forEach((measure, measureIndex) => {
    const entries = visibleSlotEntries(measure);

    entries.forEach(entry => {
      if (!shouldRenderConnector(entry.slot)) return;

      const connectorType = connectorClass(entry.slot.arrow);
      if (!connectorType) return;

      const next = findNextVisibleSlot(page, measureIndex, entry.slotIndex, entry.slot.arrowSpan);
      if (!next) return;

      const base = connectorBaseGeometry(page, geoms, measureIndex, entry, next, connectorType);
      if (!base) return;
      const {
        from,
        to,
        yFrom,
        yTo,
        continuationFrom,
        continuationTo,
        continuationYFrom,
        continuationYTo,
        sameSystem,
        connectorXOffset,
        connectorYOffset,
        localConnectorOffset,
        shape
      } = base;
      const startX = connectorXOffset + localConnectorOffset.x + shape.startX;
      const startY = connectorYOffset + localConnectorOffset.y + shape.startY;
      const endX = connectorXOffset + localConnectorOffset.x + shape.endX;
      const endY = connectorYOffset + localConnectorOffset.y + shape.endY;
      const sharedX = connectorXOffset + localConnectorOffset.x;
      const sharedY = connectorYOffset + localConnectorOffset.y;
      const mainShape = connectorSegmentShape(shape, "main");
      const continuationShape = connectorSegmentShape(shape, "continuation");

      if (to > from + 10) {
        g.appendChild(renderConnector(
          from + startX,
          yFrom + startY,
          sameSystem ? to + endX : to + sharedX,
          sameSystem ? yTo + endY : yTo + sharedY,
          connectorType,
          { markerEnd: sameSystem, curveX: mainShape.curveX, curveY: mainShape.curveY }
        ));
      }
      if (!sameSystem && continuationTo > continuationFrom + 10) {
        g.appendChild(renderConnector(
          continuationFrom + sharedX,
          continuationYFrom + sharedY,
          continuationTo + endX,
          continuationYTo + endY,
          connectorType,
          { markerEnd: true, curveX: continuationShape.curveX, curveY: continuationShape.curveY }
        ));
      }
      if (
        selectedConnector &&
        selectedConnector.page === pageIndex &&
        selectedConnector.measure === measureIndex &&
        selectedConnector.slot === entry.slotIndex
      ) {
        renderConnectorHandles(handles, pageIndex, measureIndex, entry, base, connectorType);
      }
    });
  });

  g.appendChild(handles);
  return g;
}

function connectorBaseGeometry(page, geoms, measureIndex, entry, next, connectorType) {
  const s = scoreSettings();
  const minCrossSystemContinuation = 32;
  const fromPoint = slotPointFromEntryForPage(page, geoms, measureIndex, entry);
  const toPoint = slotPointFromEntryForPage(page, geoms, next.measureIndex, next.entry);
  if (!fromPoint || !toPoint) return null;

  const geomFrom = geoms[measureIndex];
  const geomTo = geoms[next.measureIndex];
  const sameSystem = geomFrom.systemIndex === geomTo.systemIndex;
  const requestedSpan = connectorSpanValue(entry.slot.arrowSpan);
  const systemStartGeom = geoms.find(geom => geom.systemIndex === geomTo.systemIndex) || geomTo;
  const continuationMinLength = requestedSpan > 1 ? 120 : minCrossSystemContinuation;

  let from;
  let to;
  let yFrom;
  let yTo;
  let continuationFrom = null;
  let continuationTo = null;
  let continuationYFrom = null;
  let continuationYTo = null;

  if (connectorType === "bracketSolid" || connectorType === "bracketDashed") {
    const sidePad = Number(s.connectorBracketSidePad || 0);
    const innerPadding = Number(s.measureInnerPadding || 0);
    from = fromPoint.x - sidePad;
    to = sameSystem ? toPoint.x + sidePad : geomFrom.x + geomFrom.w - innerPadding + sidePad;
    yFrom = fromPoint.y - Number(s.connectorBracketOffsetY || 6);
    yTo = sameSystem ? toPoint.y - Number(s.connectorBracketOffsetY || 6) : yFrom;
    if (!sameSystem) {
      continuationFrom = requestedSpan > 1
        ? systemStartGeom.x + innerPadding - sidePad
        : geomTo.x + innerPadding - sidePad;
      continuationTo = toPoint.x + sidePad;
      if (continuationTo <= continuationFrom + continuationMinLength) {
        continuationFrom = continuationTo - continuationMinLength;
      }
      continuationYFrom = toPoint.y - Number(s.connectorBracketOffsetY || 6);
      continuationYTo = continuationYFrom;
    }
  } else {
    const textGap = Number(s.connectorArrowTextGap || 4);
    const visibleFromChord = visibleChordForSlot(entry.slot);
    const visibleToChord = visibleChordForSlot(next.entry.slot);
    const leftChordHalf = estimateTextWidth(visibleFromChord || "", fromPoint.chordSize, s.chordFont) / 2;
    const rightChordHalf = estimateTextWidth(visibleToChord || "", toPoint.chordSize, s.chordFont) / 2;

    from = fromPoint.x + leftChordHalf + textGap;
    to = sameSystem
      ? toPoint.x - rightChordHalf - textGap
      : geomFrom.x + geomFrom.w - 8;

    yFrom = fromPoint.y - Number(s.connectorCurveStartOffsetY || 18);
    yTo = sameSystem ? toPoint.y - Number(s.connectorCurveEndOffsetY || 10) : yFrom + 8;
    if (!sameSystem) {
      continuationFrom = requestedSpan > 1
        ? systemStartGeom.x + 8
        : geomTo.x + 8;
      continuationTo = toPoint.x - rightChordHalf - textGap;
      if (continuationTo <= continuationFrom + continuationMinLength) {
        continuationFrom = continuationTo - continuationMinLength;
      }
      continuationYFrom = toPoint.y - Number(s.connectorCurveStartOffsetY || 18);
      continuationYTo = toPoint.y - Number(s.connectorCurveEndOffsetY || 10);
    }
  }

  return {
    from,
    to,
    yFrom,
    yTo,
    continuationFrom,
    continuationTo,
    continuationYFrom,
    continuationYTo,
    sameSystem,
    connectorXOffset: Number(s.connectorXOffset || 0),
    connectorYOffset: Number(s.connectorYOffset || 0),
    localConnectorOffset: getItemOffset(entry.slot, "arrow"),
    shape: normalizeConnectorShape(entry.slot.connectorShape)
  };
}

function isArrowConnectorType(type) {
  return type === "curveSolid" || type === "curveDashed";
}

function renderConnectorHandles(group, pageIndex, measureIndex, entry, base, connectorType) {
  const sharedX = base.connectorXOffset + base.localConnectorOffset.x;
  const sharedY = base.connectorYOffset + base.localConnectorOffset.y;
  const start = {
    x: base.from + sharedX + base.shape.startX,
    y: base.yFrom + sharedY + base.shape.startY
  };
  const end = base.sameSystem
    ? {
        x: base.to + sharedX + base.shape.endX,
        y: base.yTo + sharedY + base.shape.endY
      }
    : {
        x: base.continuationTo + sharedX + base.shape.endX,
        y: base.continuationYTo + sharedY + base.shape.endY
      };
  const handles = [
    ["start", start, 4.2],
    ["end", end, 4.2]
  ];
  if (isArrowConnectorType(connectorType)) {
    const mainPoints = connectorCurveSegmentPoints(base, base.shape, "main");
    const mainShape = connectorSegmentShape(base.shape, "main");
    const mainCurve = mainPoints
      ? connectorCurveApex(mainPoints.start.x, mainPoints.start.y, mainPoints.end.x, mainPoints.end.y, mainShape)
      : null;
    if (mainCurve) handles.splice(1, 0, ["curve", mainCurve, 3.8, "main"]);

    if (!base.sameSystem) {
      const continuationPoints = connectorCurveSegmentPoints(base, base.shape, "continuation");
      const continuationShape = connectorSegmentShape(base.shape, "continuation");
      const continuationCurve = continuationPoints
        ? connectorCurveApex(continuationPoints.start.x, continuationPoints.start.y, continuationPoints.end.x, continuationPoints.end.y, continuationShape)
        : null;
      if (continuationCurve) handles.splice(handles.length - 1, 0, ["curve", continuationCurve, 3.8, "continuation"]);
    }
  }

  handles.forEach(([handle, point, radius, segment]) => {
    group.appendChild(svgEl("circle", {
      cx: point.x,
      cy: point.y,
      r: radius,
      class: "hit connectorHandle",
      "data-kind": "connectorHandle",
      "data-page": pageIndex,
      "data-measure": measureIndex,
      "data-slot": entry.slotIndex,
      "data-handle": handle,
      "data-segment": segment || "",
      "data-tooltip": handle === "curve"
        ? "Arrastrar para ajustar curva"
        : "Arrastrar extremo del conector"
    }));
  });
}

function slotPointFromEntryForPage(page, geoms, measureIndex, entry) {
  const s = scoreSettings();
  const geom = geoms[measureIndex];
  if (!geom) return null;

  const entries = visibleSlotEntries(page.measures[measureIndex]);
  const layout = layoutSlots(entries.map(item => item.slot), geom.w, s, page.measures[measureIndex]);
  const visualIndex = entries.findIndex(item => item.slotIndex === entry.slotIndex);
  if (visualIndex < 0) return null;

  const l = layout[visualIndex];
  return {
    x: geom.x + l.center,
    y: geom.y + s.chordY,
    width: l.width,
    chordSize: l.chordSize,
    slot: entry.slot,
    entry,
    measureIndex,
    geom,
    visualIndex
  };
}

function layoutSlots(slots, measureW, s, measure = null) {
  const count = slots.length;
  if (!count) return [];

  const contentW = Math.max(20, measureW - 2 * s.measureInnerPadding);
  const laneCount = Math.max(4, count);
  const cellW = contentW / laneCount;

  let positions;
  if (count === 1) {
    positions = [1];
  } else if (count === 2) {
    positions = [1, 3];
  } else if (count === 3) {
    positions = getThreeChordPositions(measure);
  } else if (count === 4) {
    positions = [1, 2, 3, 4];
  } else {
    positions = Array.from({ length: count }, (_, index) => index + 1);
  }

  const centers = Array.from({ length: laneCount }, (_, index) => s.measureInnerPadding + cellW * (index + 0.5));
  const metrics = slots.map(slot => {
    const visibleChord = visibleChordForSlot(slot);
    const chordWidth = estimateTextWidth(visibleChord, s.chordSize, s.chordFont);
    const modeWidth = shouldRenderAnalysisField(slot, "mode") ? estimateTextWidth(slot.mode, s.modeSize, s.modeFont) : 0;
    const degreeWidth = shouldRenderAnalysisField(slot, "degree") ? estimateTextWidth(slot.degree, s.degreeSize, s.degreeFont) : 0;
    const originScaleWidth = shouldRenderAnalysisField(slot, "originScale") ? estimateTextWidth(slot.originScale, s.noteSize || 12, s.noteFont || s.degreeFont) : 0;
    const sectionLabelWidth = shouldRenderAnalysisField(slot, "sectionLabel") ? estimateTextWidth(slot.sectionLabel, s.sectionLabelSize || 15, s.sectionLabelFont || s.degreeFont) : 0;

    return {
      visibleChord,
      chordWidth,
      modeWidth,
      degreeWidth,
      originScaleWidth,
      sectionLabelWidth,
      width: Math.max(
        chordWidth,
        modeWidth,
        degreeWidth,
        originScaleWidth,
        sectionLabelWidth,
        26
      )
    };
  });

  const rawCenters = slots.map((slot, index) => {
    const explicitPulse = normalizeSlotPulse(slot?.pulse);
    const pos = Math.min(laneCount, explicitPulse || positions[index] || Math.min(laneCount, index + 1));
    let center = centers[pos - 1];

    if (index === 0 && measure?.form) {
      const bounds = formLabelBoundsRelative(measure, s);
      if (bounds) {
        const minCenter = bounds.right + 14 + metrics[index].width / 2;
        center = Math.max(center, minCenter);
      }
    }

    return center;
  });

  const collisionGap = 10;
  const packedCenters = packSlotCenters(rawCenters, metrics.map(metric => metric.width), measureW, collisionGap);

  return slots.map((slot, index) => {
    const explicitPulse = normalizeSlotPulse(slot?.pulse);
    const position = Math.min(laneCount, explicitPulse || positions[index] || Math.min(laneCount, index + 1));
    return {
      center: packedCenters[index],
      position,
      width: metrics[index].width,
      chordSize: s.chordSize,
      modeSize: s.modeSize,
      degreeSize: s.degreeSize
    };
  });
}

function packSlotCenters(rawCenters, widths, measureW, gap = 10) {
  if (rawCenters.length <= 1) return rawCenters;

  const leftBounds = widths.map(width => Math.max(8 + width / 2, 12));
  const rightBounds = widths.map((width, index) => Math.max(leftBounds[index], measureW - 8 - width / 2));
  const centers = rawCenters.map((center, index) => clamp(center, leftBounds[index], rightBounds[index]));

  for (let index = 1; index < centers.length; index++) {
    const minCenter = centers[index - 1] + widths[index - 1] / 2 + widths[index] / 2 + gap;
    centers[index] = Math.max(centers[index], minCenter);
  }

  for (let index = centers.length - 1; index >= 0; index--) {
    centers[index] = Math.min(centers[index], rightBounds[index]);
    if (index === centers.length - 1) continue;

    const maxCenter = centers[index + 1] - widths[index] / 2 - widths[index + 1] / 2 - gap;
    centers[index] = Math.min(centers[index], maxCenter);
    centers[index] = Math.max(centers[index], leftBounds[index]);
  }

  return centers;
}

function renderBar(value, x, y1, y2, side) {
  const s = scoreSettings();
  const type = barClass(value);
  const g = svgEl("g", {});
  const swThin = 1.25;
  const swThick = 3.6;
  const dotsX = side === "left" ? x + 8 : x - 8;

  if (type === "double") {
    g.appendChild(svgEl("line", { x1: x - 3, y1, x2: x - 3, y2, stroke: s.inkColor, "stroke-width": swThin }));
    g.appendChild(svgEl("line", { x1: x + 3, y1, x2: x + 3, y2, stroke: s.inkColor, "stroke-width": swThin }));
  } else if (type === "repeatStart") {
    g.appendChild(svgEl("line", { x1: x, y1, x2: x, y2, stroke: s.inkColor, "stroke-width": swThick }));
    g.appendChild(svgEl("line", { x1: x + 6, y1, x2: x + 6, y2, stroke: s.inkColor, "stroke-width": swThin }));
    g.appendChild(svgEl("circle", { cx: dotsX, cy: y1 + 16, r: 2.2, fill: s.inkColor }));
    g.appendChild(svgEl("circle", { cx: dotsX, cy: y1 + 30, r: 2.2, fill: s.inkColor }));
  } else if (type === "repeatEnd") {
    g.appendChild(svgEl("line", { x1: x - 6, y1, x2: x - 6, y2, stroke: s.inkColor, "stroke-width": swThin }));
    g.appendChild(svgEl("line", { x1: x, y1, x2: x, y2, stroke: s.inkColor, "stroke-width": swThick }));
    g.appendChild(svgEl("circle", { cx: dotsX, cy: y1 + 16, r: 2.2, fill: s.inkColor }));
    g.appendChild(svgEl("circle", { cx: dotsX, cy: y1 + 30, r: 2.2, fill: s.inkColor }));
  } else if (type === "final") {
    g.appendChild(svgEl("line", { x1: x - 5, y1, x2: x - 5, y2, stroke: s.inkColor, "stroke-width": swThin }));
    g.appendChild(svgEl("line", { x1: x, y1, x2: x, y2, stroke: s.inkColor, "stroke-width": 4.2 }));
  } else {
    g.appendChild(svgEl("line", { x1: x, y1, x2: x, y2, stroke: s.inkColor, "stroke-width": 1.4 }));
  }

  return g;
}

function renderConnector(x1, y1, x2, y2, type, options = {}) {
  const s = scoreSettings();
  const markerId = `arrow-${Math.random().toString(36).slice(2)}`;
  const g = svgEl("g", {});
  const defs = svgEl("defs", {});
  const strokeWidth = Number(s.connectorStrokeWidth || 1.8);
  const markerEnd = options.markerEnd !== false;

  if (type === "curveSolid" || type === "curveDashed") {
    const headSize = Number(s.connectorArrowHeadSize || 7);
    if (markerEnd) {
      const marker = svgEl("marker", {
        id: markerId,
        markerWidth: headSize,
        markerHeight: headSize,
        refX: Math.max(2, headSize - 1),
        refY: headSize / 2,
        orient: "auto"
      });
      marker.appendChild(svgEl("path", { d: `M0,0 L${headSize},${headSize / 2} L0,${headSize} z`, fill: s.arrowColor }));
      defs.appendChild(marker);
      g.appendChild(defs);
    }

    const curveX = Number(options.curveX || 0);
    const curveY = Math.max(0, Number(options.curveY || 0));
    const { x: apexX, y: apexY } = connectorCurveApex(x1, y1, x2, y2, { curveX, curveY });
    const c1x = (x1 + apexX) / 2;
    const c2x = (apexX + x2) / 2;
    g.appendChild(svgEl("path", {
      d: `M ${x1} ${y1} Q ${c1x} ${apexY}, ${apexX} ${apexY} Q ${c2x} ${apexY}, ${x2} ${y2}`,
      stroke: s.arrowColor,
      "stroke-width": strokeWidth,
      fill: "none",
      "stroke-dasharray": type === "curveDashed" ? "5 4" : "",
      "marker-end": markerEnd ? `url(#${markerId})` : ""
    }));

    return g;
  }

  const hookHeight = Number(s.connectorBracketHookHeight || 11);
  const bottomY = Math.max(y1, y2);
  const topY = bottomY - hookHeight;
  g.appendChild(svgEl("path", {
    d: `M ${x1} ${bottomY} L ${x1} ${topY} L ${x2} ${topY} L ${x2} ${bottomY}`,
    stroke: s.arrowColor,
    "stroke-width": strokeWidth,
    fill: "none",
    "stroke-dasharray": type === "bracketDashed" ? "5 4" : ""
  }));

  return g;
}

function connectorCurveApex(x1, y1, x2, y2, shape = {}) {
  const s = scoreSettings();
  const minX = Math.min(x1, x2) + 12;
  const maxX = Math.max(x1, x2) - 12;
  const midpointX = (x1 + x2) / 2;
  const fallbackX = (x1 + x2) / 2;
  const apexX = maxX > minX
    ? clamp(midpointX + Number(shape.curveX || 0), minX, maxX)
    : fallbackX;
  const lift = Number(s.connectorCurveLift || 15) + Math.max(0, Number(shape.curveY || 0));
  return {
    x: apexX,
    y: Math.min(y1, y2) - lift
  };
}

function clearCanvasInteractionState() {
  const hadSelection = !!selectedConnector ||
    rhythmEditingActive ||
    selectedRhythm.sources.length ||
    selectedRhythm.tuplets.length ||
    selectedRhythm.openTuplet ||
    selectedRhythm.insertPosition != null ||
    selectedRhythm.slashCycleTarget;

  rhythmEditingActive = false;
  selectedConnector = null;
  rhythmClearSourceSelection();
  selectedRhythm.tuplets = [];
  selectedRhythm.openTuplet = null;
  selectedRhythm.insertPosition = null;
  selectedRhythm.entryMode = null;
  selectedRhythm.slashCycleTarget = null;
  rhythmSlashCycleIndex = 0;
  hideReharmonizationMenu();
  hideDegreeSuggestionMenu();
  hideCanvasTooltip();
  hideInlineEditor(true);
  els.measurePanel?.classList.add("hidden");
  updateRhythmSlashCycleButton();

  if (hadSelection) {
    renderAll(false);
  }
}

function handleSvgRhythmPointerDown(event) {
  const target = event.target.closest("[data-kind]");
  const kind = target?.dataset?.kind;
  if (!["rhythmPulse", "rhythmMeasure", "rhythmItem", "rhythmTuplet"].includes(kind)) return;

  event.preventDefault();
  event.stopPropagation();
  suppressFollowingClick(1200);

  if (kind === "rhythmPulse") {
    rhythmSelectPulse(
      Number(target.dataset.page),
      Number(target.dataset.measure),
      Number(target.dataset.pulse)
    );
    return;
  }

  if (kind === "rhythmMeasure") {
    selectedConnector = null;
    rhythmSelectMeasure(Number(target.dataset.page), Number(target.dataset.measure));
    return;
  }

  if (kind === "rhythmItem") {
    selectRhythmItemTarget(target, event.shiftKey);
    return;
  }

  if (kind === "rhythmTuplet") {
    selectRhythmTupletTarget(target, event.shiftKey);
  }
}

function selectRhythmItemTarget(target, additive = false) {
  rhythmEditingActive = true;
  selectedConnector = null;
  const pageIndex = Number(target.dataset.page);
  const measureIndex = Number(target.dataset.measure);
  if (selectedRhythm.page !== pageIndex || selectedRhythm.measure !== measureIndex) {
    rhythmSelectMeasure(pageIndex, measureIndex, { skipComplete: true });
  }
  selected.page = pageIndex;
  selected.measure = measureIndex;
  selectedRhythm.page = pageIndex;
  selectedRhythm.measure = measureIndex;
  const source = {
    tokenIndex: Number(target.dataset.token),
    innerIndex: target.dataset.inner === "" ? undefined : Number(target.dataset.inner),
    partIndex: target.dataset.part === "" ? undefined : Number(target.dataset.part)
  };
  const key = rhythmSourceKey(source);
  const wasSelected = rhythmHasSelectedSource(source);
  selectedRhythm.sources = additive
    ? wasSelected
      ? selectedRhythm.sources.filter(item => rhythmSourceKey(item) !== key)
      : [...selectedRhythm.sources, source]
    : [source];
  selectedRhythm.sourceKeys = additive
    ? wasSelected
      ? (selectedRhythm.sourceKeys || []).filter(item => item !== key)
      : [...(selectedRhythm.sourceKeys || []), key]
    : [key];
  selectedRhythm.tuplets = [];
  const itemStart = Number(target.dataset.rhythmStart);
  const meter = rhythmParseMeter(song.timeSignature);
  selectedRhythm.insertPosition = Number.isFinite(itemStart)
    ? rhythmPulseStartForIndex(Math.floor((itemStart + 0.00001) / (1 / meter.unit)), meter)
    : null;
  selectedRhythm.entryMode = "selection";
  selectedRhythm.slashCycleTarget = null;
  rhythmSlashCycleIndex = 0;
  renderAll(false);
}

function selectRhythmTupletTarget(target, additive = false) {
  rhythmEditingActive = true;
  selectedConnector = null;
  const pageIndex = Number(target.dataset.page);
  const measureIndex = Number(target.dataset.measure);
  selected.page = pageIndex;
  selected.measure = measureIndex;
  selectedRhythm.page = pageIndex;
  selectedRhythm.measure = measureIndex;
  const source = { tokenIndex: Number(target.dataset.token) };
  const key = rhythmTupletKey(source);
  selectedRhythm.tuplets = additive
    ? rhythmHasSelectedTuplet(source)
      ? selectedRhythm.tuplets.filter(item => rhythmTupletKey(item) !== key)
      : [...selectedRhythm.tuplets, source]
    : [source];
  rhythmClearSourceSelection();
  selectedRhythm.insertPosition = null;
  selectedRhythm.entryMode = "selection";
  selectedRhythm.slashCycleTarget = null;
  rhythmSlashCycleIndex = 0;
  renderAll(false);
}

function handleSvgClick(event) {
  if (suppressNextClick) {
    suppressNextClick = false;
    if (suppressNextClickTimer) {
      clearTimeout(suppressNextClickTimer);
      suppressNextClickTimer = null;
    }
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const target = event.target.closest("[data-kind]");
  if (!target) {
    clearCanvasInteractionState();
    return;
  }

  const kind = target.dataset.kind;

  if (kind === "measureControl") {
    if (target.dataset.action === "addMeasure") addMeasureAtEnd();
    if (target.dataset.action === "removeMeasure") removeMeasureAtEnd();
    event.stopPropagation();
    return;
  }

  if (kind === "systemBreakControl") {
    if (target.dataset.action === "previous") {
      moveSystemToPreviousPage(
        Number(target.dataset.page),
        Number(target.dataset.system)
      );
    } else {
      moveSystemToNextPage(
        Number(target.dataset.page),
        Number(target.dataset.system)
      );
    }
    event.stopPropagation();
    return;
  }

  if (kind === "systemDragControl") {
    event.stopPropagation();
    return;
  }

  if (kind === "meta") return;

  if (kind === "rhythmPulse") {
    rhythmSelectPulse(
      Number(target.dataset.page),
      Number(target.dataset.measure),
      Number(target.dataset.pulse)
    );
    event.stopPropagation();
    return;
  }

  if (kind === "rhythmMeasure") {
    selectedConnector = null;
    rhythmSelectMeasure(Number(target.dataset.page), Number(target.dataset.measure));
    event.stopPropagation();
    return;
  }

  if (kind === "rhythmItem") {
    selectRhythmItemTarget(target, event.shiftKey);
    event.stopPropagation();
    return;
  }

  if (kind === "rhythmTuplet") {
    selectRhythmTupletTarget(target, event.shiftKey);
    event.stopPropagation();
    return;
  }

  if (kind === "song") {
    rhythmEditingActive = false;
    selectedConnector = null;
    showInlineEditor(target, event.clientX, event.clientY);
    return;
  }

  if (kind === "measure") {
    rhythmEditingActive = false;
    selectedConnector = null;
    selected.page = Number(target.dataset.page);
    selected.measure = Number(target.dataset.measure);
    renderAll(false);
    return;
  }

  if (kind === "measureField" || kind === "slot") {
    rhythmEditingActive = false;
    if (!(kind === "slot" && target.dataset.field === "arrow")) selectedConnector = null;
    selected.page = Number(target.dataset.page);
    selected.measure = Number(target.dataset.measure);

    if (kind === "slot" && target.dataset.slot !== undefined) {
      selectedSlot = Number(target.dataset.slot);
    }

    if (kind === "slot" && target.dataset.field === "arrow") {
      selectedConnector = {
        page: Number(target.dataset.page),
        measure: Number(target.dataset.measure),
        slot: Number(target.dataset.slot)
      };
      cycleConnectorAt(
        Number(target.dataset.page),
        Number(target.dataset.measure),
        Number(target.dataset.slot)
      );
      return;
    }

    if (shouldOpenReharmonizationMenu(target)) {
      showReharmonizationMenu(target, event.clientX, event.clientY);
      event.stopPropagation();
      return;
    }

    showInlineEditor(target, event.clientX, event.clientY);
  }
}

function handleSvgDoubleClick(event) {
  event.preventDefault();
  event.stopPropagation();
}

function showInlineEditor(target, clientX = null, clientY = null) {
  hideReharmonizationMenu();

  const context = {
    kind: target.dataset.kind,
    page: Number(target.dataset.page),
    measure: Number(target.dataset.measure),
    slot: Number(target.dataset.slot),
    field: target.dataset.field,
    emptyPulse: target.dataset.emptyPulse === "true",
    visualPulse: normalizeSlotPulse(target.dataset.visualPulse)
  };
  const current = getValueFromTarget(target);
  const suppressHiddenAnswer = shouldSuppressHiddenAnalysisValue(context);
  const editorValue = suppressHiddenAnswer ? "" : current;
  const isOriginScaleEditor = target.dataset.kind === "slot" && target.dataset.field === "originScale";
  const isNoteEditor = isOriginScaleEditor || (target.dataset.kind === "measureField" && target.dataset.field === "note");
  const useTextarea = false;
  inlineContext = context;

  if (inlineContext.kind === "slot" && !Number.isNaN(inlineContext.slot)) {
    selectedSlot = inlineContext.slot;
  }

  const rect = target.getBoundingClientRect();

  const editor = els.inlineEditor;
  els.inlineTextarea?.classList.add("hidden");
  editor.classList.toggle("noteTextEditor", isNoteEditor);

  let width = Math.max(60, Math.min(260, Math.max(rect.width + 18, estimateTextWidth(editorValue || target.dataset.field || "", 14, "Arial") + 36)));
  if (target.dataset.kind === "song" && target.dataset.field === "studentName") {
    width = Math.max(width, Number(song.settings.studentNameWidth || 230));
  }
  let left = rect.width ? rect.left + rect.width / 2 - width / 2 : (clientX || 80);
  let top = rect.height ? rect.top + rect.height / 2 - 15 : (clientY || 80);

  if (isNoteEditor) {
    const s = scoreSettings();
    width = Math.max(80, rect.width);
    left = rect.left;
    top = rect.top + Math.max(0, (rect.height - Number(s.noteSize || 12) * 1.25) / 2);

    editor.style.height = `${Math.max(18, Number(s.noteSize || 12) * 1.35)}px`;
    editor.style.fontFamily = s.noteFont || s.degreeFont || "system-ui, sans-serif";
    editor.style.fontSize = `${Number(s.noteSize || 12)}px`;
    editor.style.fontWeight = String(s.noteWeight || 400);
    editor.style.color = s.noteColor || s.inkColor || "#111111";
    editor.style.lineHeight = "1.15";
    editor.style.textAlign = isOriginScaleEditor ? "center" : "left";
  } else {
    editor.style.height = "";
    editor.style.fontFamily = "";
    editor.style.fontSize = "";
    editor.style.fontWeight = "";
    editor.style.color = "";
    editor.style.lineHeight = "";
    editor.style.textAlign = "";
  }

  editor.dataset.suppressedHiddenAnalysisValue = suppressHiddenAnswer ? "true" : "";
  editor.dataset.dirty = "";
  editor.value = editorValue;
  editor.style.left = `${Math.max(8, Math.min(window.innerWidth - width - 8, left))}px`;
  editor.style.top = `${Math.max(48, Math.min(window.innerHeight - 40, top))}px`;
  editor.style.width = `${width}px`;

  editor.classList.remove("hidden");
  editor.focus();
  editor.select();

  if (assistanceMode === "assisted" && isDegreeInlineContext(inlineContext)) {
    showDegreeSuggestionMenu(editor, degreeSuggestionsForInlineContext(inlineContext));
  } else if (assistanceMode === "assisted" && isModeInlineContext(inlineContext)) {
    showDegreeSuggestionMenu(editor, modeSuggestionsForInlineContext(inlineContext));
  } else if (assistanceMode === "assisted" && isOriginScaleInlineContext(inlineContext)) {
    showDegreeSuggestionMenu(editor, originScaleSuggestionsForInlineContext(inlineContext));
  } else if (isStructuralMeasureInlineContext(inlineContext)) {
    showDegreeSuggestionMenu(editor, structuralMeasureSuggestionsForInlineContext(inlineContext));
  } else {
    hideDegreeSuggestionMenu();
  }
}

function shouldSuppressHiddenAnalysisValue(context) {
  if (isAnalysisVisible()) return false;
  if (context?.kind === "measureField" && isHiddenMeasureAnalysisField(context.field)) {
    const measure = song.pages[context.page]?.measures?.[context.measure];
    return !isHiddenMeasureAnalysisFieldEdited(measure, context.field);
  }
  if (context?.kind !== "slot") return false;
  const measure = song.pages[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  if (isHiddenAnalysisFieldEdited(slot, context.field)) return false;
  return ["degree", "mode", "sectionLabel", "originScale"].includes(context.field);
}

function canShowCurrentHiddenAnalysisValue(slot, field) {
  return isAnalysisVisible() || isHiddenAnalysisFieldEdited(slot, field);
}

function hideInlineEditor(cancel) {
  if (els.inlineEditor.classList.contains("hidden")) return;
  const context = inlineContext;
  const suppressedHiddenAnalysisValue = els.inlineEditor.dataset.suppressedHiddenAnalysisValue === "true";
  const editorWasChanged = els.inlineEditor.dataset.dirty === "true";
  const rawValue = els.inlineEditor.value;
  els.inlineEditor.classList.add("hidden");
  els.inlineEditor.classList.remove("noteTextEditor");
  els.inlineEditor.dataset.suppressedHiddenAnalysisValue = "";
  els.inlineEditor.dataset.dirty = "";
  hideDegreeSuggestionMenu();

  if (!cancel && context) {
    if (suppressedHiddenAnalysisValue && !editorWasChanged && !String(rawValue || "").trim()) {
      inlineContext = null;
      return;
    }
    setValueFromContext(context, rawValue);
    setDirty(true);
    evaluationIssues.clear();
    renderAll(false);
  }

  inlineContext = null;
}

function isDegreeInlineContext(context) {
  return context?.kind === "slot" && context.field === "degree";
}

function isModeInlineContext(context) {
  return context?.kind === "slot" && context.field === "mode";
}

function isOriginScaleInlineContext(context) {
  return context?.kind === "slot" && context.field === "originScale";
}

function addDegreeSuggestion(suggestions, seen, value, detail = "", sectionLabel = "", analysis = {}) {
  const cleanedValue = String(value || "").trim();
  if (!cleanedValue) return;
  const cleanedSectionLabel = String(sectionLabel || "").trim();
  const identity = `${cleanedValue}|${cleanedSectionLabel || detail}`;
  if (seen.has(identity)) return;
  seen.add(identity);
  suggestions.push({
    value: cleanedValue,
    detail: String(detail || "").trim(),
    sectionLabel: cleanedSectionLabel,
	    degree: String(analysis.degree || "").trim(),
	    mode: String(analysis.mode || "").trim(),
	    originScale: String(analysis.originScale || "").trim()
	  });
	}

function addModeSuggestion(suggestions, seen, mode, detail = "", sectionLabel = "", analysis = {}) {
  const cleanedValue = String(mode || "").trim();
  if (!cleanedValue) return;
  const cleanedSectionLabel = String(sectionLabel || "").trim();
  const degree = String(analysis.degree || "").trim();
  const identity = `${cleanedValue}|${degree}|${cleanedSectionLabel || detail}`;
  if (seen.has(identity)) return;
  seen.add(identity);
  suggestions.push({
    value: cleanedValue,
    detail: String(detail || "").trim(),
	    sectionLabel: cleanedSectionLabel,
	    degree,
	    mode: cleanedValue,
	    originScale: String(analysis.originScale || "").trim()
	  });
	}

function normalizeModeForComparison(value) {
  return normalizeAnalysisSymbolForComparison(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function normalizeOriginScaleForComparison(value) {
  return normalizeOriginScaleInput(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function analysisInterpretationKey(interpretation) {
  return [
    normalizeDegreeForComparison(interpretation.degree || ""),
    normalizeModeForComparison(interpretation.mode || ""),
    normalizeSectionLabelInput(interpretation.sectionLabel || ""),
    normalizeOriginScaleForComparison(interpretation.originScale || "")
  ].join("|");
}

function analysisInterpretationsForInlineContext(context) {
  if (!context || !window.TonalAnalysis) return [];
  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  if (!slot || !String(slot.chord || "").trim()) return [];

  if (String(slot.chord || "").trim() === "%") {
    return [{ degree: "%", mode: "", sectionLabel: "", originScale: "", source: "repeat", sourceRank: 100 }];
  }

  const entries = filledChordSlots();
  const entryIndex = entries.findIndex(entry =>
    entry.pageIndex === context.page
    && entry.measureIndex === context.measure
    && entry.slotIndex === context.slot
  );
  const entry = entryIndex >= 0 ? entries[entryIndex] : null;
  if (!entry) return [];

  const interpretations = [];
  const seen = new Set();
  const addInterpretation = (analysis, source, sourceRank) => {
    if (!analysis?.degree && !analysis?.mode) return;
    const normalizedAnalysis = {
      ...analysis,
      degree: String(analysis.degree || "").trim(),
      mode: String(analysis.mode || "").trim(),
      sectionLabel: normalizeSectionLabelInput(analysis.sectionLabel || sectionLabelForAnalysis(analysis) || ""),
      source,
      sourceRank
    };
    normalizedAnalysis.originScale = defaultOriginScaleForEntry(
      entry,
      normalizedAnalysis,
      entries[entryIndex + 1],
      entries[entryIndex - 1]
    ) || originScaleLabelForContext(normalizedAnalysis);
    const key = analysisInterpretationKey(normalizedAnalysis);
    if (!key || seen.has(key)) return;
    seen.add(key);
    interpretations.push(normalizedAnalysis);
  };

  const sectionContext = activeSectionContextForEntry(entries, entryIndex);
  addInterpretation(analysisForEntryInSectionContext(entry, sectionContext), "tonalidad visible", 100);

  const results = window.TonalAnalysis.analyzeProgression(entries.map(item => item.analysisChord || item.slot.chord));
  addInterpretation(results[entryIndex], "contexto", 90);

  const analysisChord = entry.analysisChord || slot.chord;
  window.TonalAnalysis.candidatesForChord(analysisChord).forEach((candidate, candidateIndex) => {
    addInterpretation(candidate, "opcion", 50 - candidateIndex / 100);
  });

  return interpretations;
}

function scoreAnalysisInterpretation(interpretation, context, editedField) {
  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  const activeLabel = activeSectionLabelBeforeContext(context);
  let score = Number(interpretation.sourceRank || 0);
  if (normalizeSectionLabelInput(interpretation.sectionLabel || "") === normalizeSectionLabelInput(activeLabel || "")) score += 12;
  if (editedField !== "degree" && normalizeDegreeForComparison(interpretation.degree || "") === normalizeDegreeForComparison(slot?.degree || "")) score += 5;
  if (editedField !== "mode" && normalizeModeForComparison(interpretation.mode || "") === normalizeModeForComparison(slot?.mode || "")) score += 4;
  if (editedField !== "originScale" && normalizeOriginScaleForComparison(interpretation.originScale || "") === normalizeOriginScaleForComparison(slot?.originScale || "")) score += 3;
  return score;
}

function matchingAnalysisInterpretationForEdit(context, editedField, value) {
  const cleanedValue = String(value || "").trim();
  if (!cleanedValue) return null;

  const interpretations = analysisInterpretationsForInlineContext(context);
  const matches = interpretations.filter(interpretation => {
    if (editedField === "degree") {
      return normalizeDegreeForComparison(interpretation.degree || "") === normalizeDegreeForComparison(cleanedValue);
    }
    if (editedField === "mode") {
      return normalizeModeForComparison(interpretation.mode || "") === normalizeModeForComparison(cleanedValue);
    }
    if (editedField === "originScale") {
      return normalizeOriginScaleForComparison(interpretation.originScale || "") === normalizeOriginScaleForComparison(cleanedValue);
    }
    return false;
  });
  if (!matches.length) return null;

  return matches.sort((a, b) =>
    scoreAnalysisInterpretation(b, context, editedField) - scoreAnalysisInterpretation(a, context, editedField)
  )[0];
}

function synchronizeAnalysisBoxesFromEdit(context, editedField, value) {
  if (!["degree", "mode"].includes(editedField)) return false;
  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  if (!slot) return false;

  const interpretation = matchingAnalysisInterpretationForEdit(context, editedField, value);
  let changed = false;

  if (interpretation) {
    if (editedField === "degree" && interpretation.degree && slot.degree !== interpretation.degree) {
      slot.degree = interpretation.degree;
      markHiddenAnalysisFieldEdit(slot, "degree", interpretation.degree);
      changed = true;
    }
    if (interpretation.mode && slot.mode !== interpretation.mode) {
      slot.mode = interpretation.mode;
      markHiddenAnalysisFieldEdit(slot, "mode", interpretation.mode);
      changed = true;
    }
    if (interpretation.originScale && slot.originScale !== interpretation.originScale) {
      slot.originScale = normalizeOriginScaleInput(interpretation.originScale);
      markHiddenAnalysisFieldEdit(slot, "originScale", slot.originScale);
      changed = true;
    }

    ["degree", "mode", "originScale"].forEach(field => {
      if (String(slot[field] || "").trim()) markManualAnalysisField(slot, field);
    });
    return changed;
  }

  if (editedField === "mode") {
    const entries = filledChordSlots();
    const entry = entries.find(item =>
      item.pageIndex === context.page
      && item.measureIndex === context.measure
      && item.slotIndex === context.slot
    );
    const modeContext = originScaleContextFromMode(parsedEntryChord(entry), value);
    const originScale = originScaleLabelForContext(modeContext);
    if (originScale && slot.originScale !== originScale) {
      slot.originScale = originScale;
      markManualAnalysisField(slot, "originScale");
      markHiddenAnalysisFieldEdit(slot, "originScale", originScale);
      changed = true;
    }
  }

  return changed;
}

function sectionLabelForAnalysis(analysis) {
  if (!analysis?.key || !analysis.scaleType) return "";
  if (analysis.scaleType === "major") return `${analysis.key}:[`;
  if (analysis.scaleType === "harmonicMinor") return `${analysis.key}m:[`;
  if (analysis.scaleType === "melodicMinor") return `${analysis.key}m:[`;
  if (analysis.scaleType === "naturalMinor") return `${analysis.key}m:[`;
  if (analysis.scaleType === "harmonicMajor") return `${analysis.key}:[`;
  return /menor|minor|m\./i.test(analysis.scaleLabel || "") ? `${analysis.key}m:[` : `${analysis.key}:[`;
}

function sectionContextFromLabel(sectionLabel) {
  const cleaned = normalizeTextSymbols(sectionLabel || "")
    .trim()
    .replace(/\s*\[\s*$/, "")
    .replace(/\s*:\s*$/, "")
    .trim();
  if (!cleaned) return null;

  const match = cleaned.match(/^([A-G](?:b|#)?)(m)?(?:\s+(.+))?$/i);
  if (!match) return null;

  const rawKey = match[1];
  const key = rawKey[0].toUpperCase() + rawKey.slice(1).replace(/B/g, "b");
  const minorMark = !!match[2];
  const lowercaseRootMeansMinor = /^[a-g]/.test(cleaned);
  const detail = String(match[3] || "").toLowerCase();
  if (detail && !/^(mayor|mayor\s+arm\.?|menor|menor\s+arm[oó]nica|menor\s+mel[oó]dica|m\.arm\.?|m\.mel\.?)$/.test(detail)) {
    return null;
  }
  let scaleType = "major";

  if (/mayor\s+arm/.test(detail)) {
    scaleType = "harmonicMajor";
  } else if (minorMark || (lowercaseRootMeansMinor && !/mayor/.test(detail)) || /menor|m\.arm|m\.mel|mel[oó]dica/.test(detail)) {
    scaleType = /mel|mel[oó]dica/.test(detail) ? "melodicMinor" : "harmonicMinor";
  }

  return { key, scaleType };
}

function sectionLabelForContext(context) {
  if (!context) return "";
  return sectionLabelForAnalysis(context);
}

function extractLastSectionLabelCandidate(value, settingsObj = null) {
  const cleaned = normalizeTextSymbols(value || "", settingsObj).trim();
  if (!cleaned) return "";

  const completePattern = /[A-Ga-g](?:b|#)?m?(?:\s+(?:mayor\s+arm\.?|menor|menor\s+arm[oó]nica|menor\s+mel[oó]dica|m\.arm\.?|m\.mel\.?))?\s*:\s*\[/g;
  const completeMatches = [...cleaned.matchAll(completePattern)];
  if (completeMatches.length) return completeMatches[completeMatches.length - 1][0];

  const simpleMatch = cleaned.match(/^[A-Ga-g](?:b|#)?m?(?:\s+(?:mayor\s+arm\.?|menor|menor\s+arm[oó]nica|menor\s+mel[oó]dica|m\.arm\.?|m\.mel\.?))?$/);
  if (simpleMatch) return simpleMatch[0];

  return cleaned;
}

function visibleSectionContextForAnalysis(analysis) {
  if (!analysis?.key || !analysis.scaleType) return null;
  if (analysis.scaleType === "harmonicMajor") {
    return { ...analysis, scaleType: "major", scaleLabel: "mayor" };
  }
  return analysis;
}

function normalizeSectionLabelInput(value, settingsObj = null) {
  const cleaned = extractLastSectionLabelCandidate(value, settingsObj);
  if (!cleaned) return "";

  const context = sectionContextFromLabel(cleaned);
  return context ? sectionLabelForContext(context) : cleaned;
}

function originScaleLabelForContext(context) {
  if (!context?.key || !context.scaleType) return "";
  if (context.scaleType === "major") return `${context.key} mayor`;
  if (context.scaleType === "harmonicMajor") return `${context.key} mayor arm.`;
  if (context.scaleType === "naturalMinor") return `${context.key}m natural`;
  if (context.scaleType === "harmonicMinor") return `${context.key}m arm.`;
  if (context.scaleType === "melodicMinor") return `${context.key}m mel.`;
  return "";
}

function normalizeNonTonalScaleInput(value) {
  const normalized = String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[().,_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "";
  if (/^(?:disminuida )?wh$/.test(normalized) || /whole half|tono semitono/.test(normalized)) {
    return "Disminuida WH";
  }
  if (/^(?:disminuida )?hw$/.test(normalized) || /half whole|semitono tono/.test(normalized)) {
    return "Disminuida HW";
  }
  if (/^(?:tonos enteros|por tonos|whole tone|w)$/.test(normalized) || /tonos enteros/.test(normalized)) {
    return "Tonos enteros (W)";
  }
  return "";
}

function normalizeOriginScaleInput(value, settingsObj = null) {
  const cleaned = normalizeTextSymbols(value || "", settingsObj)
    .trim()
    .replace(/\s*\[\s*$/, "")
    .replace(/\s*:\s*$/, "")
    .replace(/\s+/g, " ");
  if (!cleaned) return "";

  const nonTonalScale = normalizeNonTonalScaleInput(cleaned);
  if (nonTonalScale) return nonTonalScale;

  const match = cleaned.match(/^([A-Ga-g])([b#]?)(m)?(?:\s+(.+))?$/);
  if (!match) return cleaned;

  const key = `${match[1].toUpperCase()}${match[2] === "B" ? "b" : match[2]}`;
  const explicitMinor = !!match[3] || /^[a-g]/.test(match[1]);
  const detail = String(match[4] || "").toLowerCase();
  let scaleType = explicitMinor ? "harmonicMinor" : "major";

  if (/mayor\s+arm\.?|arm[oó]nica\s+mayor/.test(detail)) {
    scaleType = "harmonicMajor";
  } else if (/mayor/.test(detail)) {
    scaleType = "major";
  } else if (/nat\.?|natural/.test(detail)) {
    scaleType = "naturalMinor";
  } else if (/mel\.?|mel[oó]dica/.test(detail)) {
    scaleType = "melodicMinor";
  } else if (/arm\.?|menor|m\s*arm/.test(detail)) {
    scaleType = "harmonicMinor";
  } else if (detail) {
    return cleaned;
  }

  return originScaleLabelForContext({ key, scaleType }) || cleaned;
}

function isStandardOriginScaleLabel(value) {
  const cleaned = String(value || "").trim();
  const normalized = normalizeOriginScaleInput(cleaned);
  return /^[A-G](?:b|#)?(?: mayor(?: arm\.)?|m (?:natural|arm\.|mel\.))$/.test(normalized);
}

function sectionLabelDetail(sectionLabel) {
  return String(sectionLabel || "").replace(/\s*\[$/, "").trim();
}

function activeSectionLabelBeforeContext(context) {
  const entries = filledChordSlots();
  const currentIndex = entries.findIndex(entry =>
    entry.pageIndex === context.page
    && entry.measureIndex === context.measure
    && entry.slotIndex === context.slot
  );
  if (currentIndex < 0) return "";

  let activeLabel = "";
  let lastMeasureKey = "";
  for (let index = 0; index <= currentIndex; index++) {
    const entry = entries[index];
    const measureKey = `${entry.pageIndex}:${entry.measureIndex}`;

    if (measureKey !== lastMeasureKey) {
      lastMeasureKey = measureKey;
      migrateAutoSectionNote(entry.measure);
      if (isAutoSectionNote(entry.measure?.sectionLabel)) {
        activeLabel = String(entry.measure.sectionLabel || "").trim();
      }
    }

    if (index === currentIndex) break;

    if (isAutoSectionNote(entry.slot?.sectionLabel)) {
      activeLabel = String(entry.slot.sectionLabel || "").trim();
    }
  }

  return activeLabel;
}

function activeSectionContextForEntry(entries, entryIndex) {
  let activeContext = null;
  let lastMeasureKey = "";

  for (let index = 0; index <= entryIndex; index++) {
    const entry = entries[index];
    const measureKey = `${entry.pageIndex}:${entry.measureIndex}`;

    if (measureKey !== lastMeasureKey) {
      lastMeasureKey = measureKey;
      migrateAutoSectionNote(entry.measure);
      const measureContext = sectionContextFromLabel(entry.measure?.sectionLabel);
      if (measureContext) activeContext = measureContext;
    }

    const slotContext = sectionContextFromLabel(entry.slot?.sectionLabel);
    if (slotContext) activeContext = slotContext;
  }

  return activeContext;
}

function analysisForEntryInSectionContext(entry, sectionContext) {
  if (!entry || !sectionContext || !window.TonalAnalysis?.analyzeChordInContext) return null;
  if (String(entry.slot?.chord || "").trim() === "%") {
    return { degree: "%", mode: "", key: sectionContext.key, scaleType: sectionContext.scaleType };
  }
  return window.TonalAnalysis.analyzeChordInContext(
    entry.analysisChord || entry.slot?.chord,
    sectionContext.key,
    sectionContext.scaleType
  );
}

function alignAnalysisToVisibleSectionLabels(overwrite = false) {
  if (!window.TonalAnalysis?.analyzeChordInContext) return false;
  const entries = filledChordSlots();
  let changed = false;

  entries.forEach((entry, index) => {
    const sectionContext = activeSectionContextForEntry(entries, index);
    const analysis = analysisForEntryInSectionContext(entry, sectionContext);
    if (!analysis) return;

    if (!isManualAnalysisFieldLocked(entry.slot, "degree") && analysis.degree && (overwrite || !entry.slot.degree)) {
      if (entry.slot.degree !== analysis.degree) {
        entry.slot.degree = analysis.degree;
        changed = true;
      }
    }

    if (!isManualAnalysisFieldLocked(entry.slot, "mode") && (overwrite || !entry.slot.mode) && (entry.slot.mode || analysis.mode)) {
      const nextMode = analysis.mode || "";
      if (entry.slot.mode !== nextMode) {
        entry.slot.mode = nextMode;
        changed = true;
      }
    }
  });

  return changed;
}

function entryForInlineContext(context) {
  const entries = filledChordSlots();
  const index = entries.findIndex(entry =>
    entry.pageIndex === context.page
    && entry.measureIndex === context.measure
    && entry.slotIndex === context.slot
  );

  return {
    entries,
    index,
    current: index >= 0 ? entries[index] : null,
    next: index >= 0 ? entries[index + 1] : null
  };
}

function canWriteSlotSectionLabel(slot) {
  if (isManualAnalysisFieldLocked(slot, "sectionLabel")) return false;
  return !String(slot?.sectionLabel || "").trim() || isAutoSectionNote(slot.sectionLabel);
}

function isFirstAnalyzedEntryInMeasure(entries, entryIndex) {
  const current = entries[entryIndex];
  if (!current) return false;
  return !entries.slice(0, entryIndex).some(entry =>
    entry.pageIndex === current.pageIndex && entry.measureIndex === current.measureIndex
  );
}

function setAutoSectionLabelAtEntry(entries, entryIndex, sectionLabel) {
  const cleaned = normalizeSectionLabelInput(sectionLabel);
  const entry = entries[entryIndex];
  if (!entry || !cleaned) return false;

  if (
    entry.slotIndex === 0 &&
    isFirstAnalyzedEntryInMeasure(entries, entryIndex) &&
    canWriteSectionLabel(entry.measure)
  ) {
    if (entry.measure.sectionLabel === cleaned) return false;
    entry.measure.sectionLabel = cleaned;
    return true;
  }

  if (canWriteSlotSectionLabel(entry.slot)) {
    if (entry.slot.sectionLabel === cleaned) return false;
    entry.slot.sectionLabel = cleaned;
    return true;
  }

  return false;
}

function hasPriorChordInMeasure(entryInfo) {
  const current = entryInfo.current;
  if (!current) return false;

  return entryInfo.entries.slice(0, entryInfo.index).some(entry =>
    entry.pageIndex === current.pageIndex && entry.measureIndex === current.measureIndex
  );
}

function clearMeasureSectionLabelIfCurrentStartsThere(entryInfo, previousSectionLabel) {
  const current = entryInfo.current;
  if (!current || hasPriorChordInMeasure(entryInfo)) return;
  if (isManualMeasureAnalysisFieldLocked(current.measure, "sectionLabel")) return;
  if (String(current.measure?.sectionLabel || "").trim() !== previousSectionLabel) return;
  current.measure.sectionLabel = "";
}

function clearRedundantReturnLabels(entryInfo, previousSectionLabel) {
  entryInfo.entries.slice(entryInfo.index + 1).forEach(entry => {
    migrateAutoSectionNote(entry.measure);
    if (isManualAnalysisFieldLocked(entry.slot, "sectionLabel")) return;
    if (String(entry.slot?.sectionLabel || "").trim() === previousSectionLabel) {
      entry.slot.sectionLabel = "";
    }
  });
}

function applySectionLabelForSuggestion(context, suggestion) {
  const sectionLabel = normalizeSectionLabelInput(suggestion?.sectionLabel || "");
  if (!sectionLabel) return;

  const entryInfo = entryForInlineContext(context);
  const currentSlot = entryInfo.current?.slot || song.pages?.[context.page]?.measures?.[context.measure]?.slots?.[context.slot];
  if (!currentSlot) return;

  const activeLabel = activeSectionLabelBeforeContext(context);
  const isDifferentSection = activeLabel !== sectionLabel;
  const isTemporaryChange = activeLabel && isDifferentSection;

  currentSlot.sectionLabel = isDifferentSection ? sectionLabel : "";
  markManualAnalysisField(currentSlot, "sectionLabel");

  const suggestionContext = sectionContextFromLabel(sectionLabel);
  const suggestionAnalysis = analysisForEntryInSectionContext(entryInfo.current, suggestionContext);
  if (suggestionAnalysis?.mode) {
    currentSlot.mode = suggestionAnalysis.mode;
    markManualAnalysisField(currentSlot, "mode");
  }

  if (!isTemporaryChange) return;

  clearMeasureSectionLabelIfCurrentStartsThere(entryInfo, activeLabel);
  clearRedundantReturnLabels(entryInfo, activeLabel);

  const nextSlot = entryInfo.next?.slot;
  if (nextSlot && canWriteSlotSectionLabel(nextSlot)) {
    nextSlot.sectionLabel = activeLabel;
  }
}

function applyAnalysisSuggestionForContext(context, suggestion) {
  if (!context || !suggestion) return;
  const entryInfo = entryForInlineContext(context);
  const currentSlot = entryInfo.current?.slot || song.pages?.[context.page]?.measures?.[context.measure]?.slots?.[context.slot];
  if (!currentSlot) return;

  if (suggestion.degree && isDegreeInlineContext(context)) {
    currentSlot.degree = suggestion.degree;
    markManualAnalysisField(currentSlot, "degree");
    markHiddenAnalysisFieldEdit(currentSlot, "degree", suggestion.degree);
  }
  if (suggestion.mode && (isModeInlineContext(context) || isDegreeInlineContext(context))) {
    currentSlot.mode = suggestion.mode;
    markManualAnalysisField(currentSlot, "mode");
    markHiddenAnalysisFieldEdit(currentSlot, "mode", suggestion.mode);
  }
  if (suggestion.originScale && (isModeInlineContext(context) || isDegreeInlineContext(context))) {
    currentSlot.originScale = normalizeOriginScaleInput(suggestion.originScale);
    markManualAnalysisField(currentSlot, "originScale");
    markHiddenAnalysisFieldEdit(currentSlot, "originScale", currentSlot.originScale);
  }
}

function addEngineDegreeSuggestionsForContext(context, suggestions, seen) {
  if (!isDegreeInlineContext(context) || !window.TonalAnalysis) return [];

  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  if (!slot) return suggestions;

  if (String(slot.chord || "").trim() === "%") {
    addDegreeSuggestion(suggestions, seen, "%", "repeticion");
    return suggestions;
  }

  const entries = filledChordSlots();
  const entryIndex = entries.findIndex(entry =>
    entry.pageIndex === context.page
    && entry.measureIndex === context.measure
    && entry.slotIndex === context.slot
  );
  const entry = entryIndex >= 0 ? entries[entryIndex] : null;
  const analysisChord = entry?.analysisChord || slot.chord;

  if (entryIndex >= 0) {
    const sectionContext = activeSectionContextForEntry(entries, entryIndex);
    const sectionAnalysis = analysisForEntryInSectionContext(entry, sectionContext);
    if (sectionAnalysis?.degree) {
      const sectionLabel = sectionLabelForContext(sectionContext);
      addDegreeSuggestion(
        suggestions,
        seen,
        sectionAnalysis.degree,
        sectionLabelDetail(sectionLabel) || sectionContext?.key || "tonalidad visible",
        sectionLabel,
        sectionAnalysis
      );
    }
  }

  if (entryIndex >= 0) {
    const results = window.TonalAnalysis.analyzeProgression(
      entries.map(item => item.analysisChord || item.slot.chord)
    );
    const contextualResult = results[entryIndex];
    if (contextualResult?.degree) {
      const sectionLabel = contextualResult.sectionLabel || sectionLabelForAnalysis(contextualResult);
      addDegreeSuggestion(
        suggestions,
        seen,
        contextualResult.degree,
        sectionLabelDetail(sectionLabel) || contextualResult.key || "contexto",
        sectionLabel,
        contextualResult
      );
    }
  }

  window.TonalAnalysis.candidatesForChord(analysisChord).forEach(candidate => {
    const sectionLabel = sectionLabelForAnalysis(candidate);
    addDegreeSuggestion(suggestions, seen, candidate.degree, sectionLabelDetail(sectionLabel), sectionLabel, candidate);
  });

  return suggestions;
}

function degreeSuggestionsForInlineContext(context) {
  if (!isDegreeInlineContext(context) || !window.TonalAnalysis) return [];

  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  if (!slot) return [];

  const suggestions = [];
  const seen = new Set();
  const currentDegree = String(slot.degree || "").trim();
  if (canShowCurrentHiddenAnalysisValue(slot, "degree")) {
    addDegreeSuggestion(suggestions, seen, currentDegree, "actual");
  }
  addEngineDegreeSuggestionsForContext(context, suggestions, seen);

  return suggestions.slice(0, 14);
}

function addEngineModeSuggestionsForContext(context, suggestions, seen) {
  if (!isModeInlineContext(context) || !window.TonalAnalysis) return suggestions;

  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  if (!slot) return suggestions;
  if (String(slot.chord || "").trim() === "%") return suggestions;

  const entries = filledChordSlots();
  const entryIndex = entries.findIndex(entry =>
    entry.pageIndex === context.page
    && entry.measureIndex === context.measure
    && entry.slotIndex === context.slot
  );
  const entry = entryIndex >= 0 ? entries[entryIndex] : null;
  const analysisChord = entry?.analysisChord || slot.chord;

  if (entryIndex >= 0) {
    const sectionContext = activeSectionContextForEntry(entries, entryIndex);
    const sectionAnalysis = analysisForEntryInSectionContext(entry, sectionContext);
    if (sectionAnalysis?.mode) {
      const sectionLabel = sectionLabelForContext(sectionContext);
      addModeSuggestion(
        suggestions,
        seen,
        sectionAnalysis.mode,
        [sectionAnalysis.degree, sectionLabelDetail(sectionLabel) || sectionContext?.key || "tonalidad visible"].filter(Boolean).join(" · "),
        sectionLabel,
        sectionAnalysis
      );
    }
  }

  if (entryIndex >= 0) {
    const results = window.TonalAnalysis.analyzeProgression(
      entries.map(item => item.analysisChord || item.slot.chord)
    );
    const contextualResult = results[entryIndex];
    if (contextualResult?.mode) {
      const sectionLabel = contextualResult.sectionLabel || sectionLabelForAnalysis(contextualResult);
      addModeSuggestion(
        suggestions,
        seen,
        contextualResult.mode,
        [contextualResult.degree, sectionLabelDetail(sectionLabel) || contextualResult.key || "contexto"].filter(Boolean).join(" · "),
        sectionLabel,
        contextualResult
      );
    }
  }

  window.TonalAnalysis.candidatesForChord(analysisChord).forEach(candidate => {
    const sectionLabel = sectionLabelForAnalysis(candidate);
    addModeSuggestion(
      suggestions,
      seen,
      candidate.mode,
      [candidate.degree, sectionLabelDetail(sectionLabel)].filter(Boolean).join(" · "),
      sectionLabel,
      candidate
    );
  });

  return suggestions;
}

function modeSuggestionsForInlineContext(context) {
  if (!isModeInlineContext(context) || !window.TonalAnalysis) return [];

  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  if (!slot) return [];

  const suggestions = [];
  const seen = new Set();
  if (canShowCurrentHiddenAnalysisValue(slot, "mode")) {
    addModeSuggestion(suggestions, seen, String(slot.mode || "").trim(), "actual", "", {
      degree: slot.degree || "",
      mode: slot.mode || ""
    });
  }
  addEngineModeSuggestionsForContext(context, suggestions, seen);

  return suggestions.slice(0, 16);
}

function addOriginScaleSuggestion(suggestions, seen, value, detail = "") {
  const cleanedValue = normalizeOriginScaleInput(value || "");
  if (!cleanedValue || seen.has(cleanedValue)) return;
  seen.add(cleanedValue);
  suggestions.push({
    value: cleanedValue,
    detail: String(detail || "").trim()
  });
}

function hasDominantHalfWholeOption(parsed) {
  const suffix = parsed?.suffix || "";
  return /^(?:7b5|7b9b5|13b9|13#11)$/.test(suffix);
}

function hasWholeToneOption(parsed) {
  const suffix = parsed?.suffix || "";
  return /^(?:7b5|9b5|\+7|\+9)$/.test(suffix);
}

function addChordScaleOptionsForParsed(suggestions, seen, parsed) {
  if (!parsed) return;
  const suffix = parsed.suffix || "";
  if (suffix === "dim" || suffix === "dim7") {
    addOriginScaleSuggestion(suggestions, seen, "Disminuida WH", "tono-semitono");
  }
  if (hasDominantHalfWholeOption(parsed)) {
    addOriginScaleSuggestion(suggestions, seen, "Disminuida HW", "semitono-tono");
  }
  if (hasWholeToneOption(parsed)) {
    addOriginScaleSuggestion(suggestions, seen, "Tonos enteros (W)", "por tonos");
  }
}

function originScaleSuggestionsForInlineContext(context) {
  if (!isOriginScaleInlineContext(context)) return [];

  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  if (!slot) return [];

  const suggestions = [];
  const seen = new Set();
  if (canShowCurrentHiddenAnalysisValue(slot, "originScale")) {
    addOriginScaleSuggestion(suggestions, seen, slot.originScale, "actual");
  }

  if (window.TonalAnalysis) {
    const currentDegree = normalizeDegreeForComparison(slot.degree || "");
    const currentMode = normalizeModeForComparison(slot.mode || "");
    analysisInterpretationsForInlineContext({ ...context, kind: "slot" })
      .filter(interpretation => {
        const degreeMatches = currentDegree
          && normalizeDegreeForComparison(interpretation.degree || "") === currentDegree;
        const modeMatches = currentMode
          && normalizeModeForComparison(interpretation.mode || "") === currentMode;
        return degreeMatches || modeMatches;
      })
      .forEach(interpretation => {
        const detail = [interpretation.degree, interpretation.mode].filter(Boolean).join(" · ");
        addOriginScaleSuggestion(suggestions, seen, interpretation.originScale, detail || "segun analisis");
      });
  }

  const entries = filledChordSlots();
  const entryIndex = entries.findIndex(entry =>
    entry.pageIndex === context.page
    && entry.measureIndex === context.measure
    && entry.slotIndex === context.slot
  );
  const entry = entryIndex >= 0 ? entries[entryIndex] : null;

  if (entry && window.TonalAnalysis) {
    const automaticResults = window.TonalAnalysis.analyzeProgression(
      entries.map(item => item.analysisChord || item.slot.chord)
    );
    const contextualResults = contextualResultsForCurrentSlots(entries, automaticResults);
    const originLabels = originScaleLabelsForAnalysis(entries, contextualResults);
    addOriginScaleSuggestion(suggestions, seen, originLabels[entryIndex], "sugerida");

    const activeContext = activeSectionContextForEntry(entries, entryIndex);
    addOriginScaleSuggestion(suggestions, seen, originScaleLabelForContext(activeContext), "tonalidad visible");

    const parsed = parsedEntryChord(entry);
    addChordScaleOptionsForParsed(suggestions, seen, parsed);

    const modeContext = originScaleContextFromMode(parsed, slot.mode || automaticResults[entryIndex]?.mode || "");
    addOriginScaleSuggestion(suggestions, seen, originScaleLabelForContext(modeContext), "segun modo");

    const analysisChord = entry.analysisChord || slot.chord;
    window.TonalAnalysis.candidatesForChord(analysisChord).forEach(candidate => {
      const detail = [candidate.degree, candidate.mode].filter(Boolean).join(" · ");
      addOriginScaleSuggestion(suggestions, seen, originScaleLabelForContext(candidate), detail);
    });
  }

  return suggestions.slice(0, 16);
}

function normalizeAnalysisSymbolForComparison(value) {
  return String(value ?? "")
    .trim()
    .replaceAll("𝄫", "bb")
    .replaceAll("♭", "b")
    .replaceAll("𝄪", "x")
    .replaceAll("♯", "#")
    .replaceAll("♮", "n")
    .replace(/[−–]/g, "-")
    .replace(/Δ/g, "∆")
    .replace(/º/g, "°")
    .replace(/\s+/g, "")
    .replace(/[()]/g, "");
}

function normalizeQualityAliasesForComparison(value) {
  let normalized = normalizeAnalysisSymbolForComparison(value)
    .replace(/maj(?=7|9|11|13|$)/gi, "∆")
    .replace(/ma(?=7|9|11|13)/gi, "∆")
    .replace(/M(?=7|9|11|13)/g, "∆")
    .replace(/min/gi, "-")
    .replace(/mi(?=∆|maj|6|7|9|11|13|sub|bck|\/|$)/gi, "-")
    .replace(/aug|aum|au/gi, "+")
    .replace(/sus(?!4)/gi, "sus4")
    .replace(/m7b5/gi, "ø")
    .replace(/-7b5/gi, "ø")
    .replace(/ø7/gi, "ø")
	    .replace(/dim7|o7|°7/gi, "°7")
	    .replace(/dim|°|o(?=\d|\/|$)/gi, "°");
	  if (normalized === "#5") normalized = "+";
	  if (normalized === "79") normalized = "9";
	  normalized = normalized.replace(/∆79/g, "∆9");
	  if (normalized === "913" || normalized === "139") normalized = "13";
	  return normalized;
	}

function normalizeDegreeForComparison(value) {
  return normalizeQualityAliasesForComparison(value)
    .replace(/([#b]*[iv]+)(?:min|mi)(?=∆|\d|sub|bck|\/|$)/gi, "$1-")
    .replace(/([#b]*[iv]+)m(?=∆|\d|sub|bck|\/|$)/gi, "$1-")
    .replace(/([#b]*[iv]+)-∆/gi, "$1m∆")
    .toUpperCase();
}

function canonicalChordSuffixForComparison(suffix) {
  const normalized = normalizeQualityAliasesForComparison(suffix);
  if (!normalized) return "";
  if (normalized === "m") return "-";
  if (/^m∆/.test(normalized)) return normalized.replace(/^m/, "-");
  if (/^m(?:6|7|9|11|13)/.test(normalized)) return normalized.replace(/^m/, "-");
  if (/^∆/.test(normalized)) return normalized;
  if (normalized === "ø") return "ø";
  if (normalized === "°" || normalized === "°7") return normalized;
  return normalized;
}

function normalizeChordForComparison(value) {
  const cleaned = normalizeAnalysisSymbolForComparison(value);
  if (!cleaned) return "";
  if (cleaned === "%") return "%";

  const parsed = window.TonalAnalysis?.parseChord?.(cleaned);
  if (parsed) {
    const suffix = canonicalChordSuffixForComparison(parsed.suffix || parsed.displaySuffix || "");
    const bass = parsed.bass ? `/${parsed.bass}` : "";
    return `${parsed.root}${suffix}${bass}`.toUpperCase();
  }

  return normalizeQualityAliasesForComparison(cleaned).toUpperCase();
}

function noteChromaForAnalysisName(name) {
  const normalized = normalizeTextSymbols(name || "").trim();
  const map = {
    C: 0, "B#": 0,
    "C#": 1, Db: 1,
    D: 2,
    "D#": 3, Eb: 3,
    E: 4, Fb: 4,
    "E#": 5, F: 5,
    "F#": 6, Gb: 6,
    G: 7,
    "G#": 8, Ab: 8,
    A: 9,
    "A#": 10, Bb: 10,
    B: 11, Cb: 11
  };
  return map[normalized];
}

function tonalDegreeIntervalsForScale(scaleType) {
  return /minor|Minor|harmonicMinor|melodicMinor|naturalMinor/.test(scaleType || "")
    ? [0, 2, 3, 5, 7, 8, 10]
    : [0, 2, 4, 5, 7, 9, 11];
}

function parseRomanDegreeHead(value) {
  const cleaned = normalizeAnalysisSymbolForComparison(value || "")
    .replace(/\s+/g, "")
    .replace(/maj/gi, "∆");
  const match = cleaned.match(/^([#b]*)(VII|VI|IV|V|III|II|I)(.*)$/i);
  if (!match) return null;
  const roman = match[2].toUpperCase();
  const index = ["I", "II", "III", "IV", "V", "VI", "VII"].indexOf(roman);
  if (index < 0) return null;
  const accidental = (match[1] || "").split("").reduce((sum, char) => sum + (char === "#" ? 1 : char === "b" ? -1 : 0), 0);
  return {
    index,
    accidental,
    tail: match[3] || "",
    normalized: cleaned
  };
}

function degreeRootChromaFromContext(degreeValue, sectionContext) {
  const keyChroma = noteChromaForAnalysisName(sectionContext?.key);
  if (keyChroma === undefined) return undefined;

  const parts = String(degreeValue || "").split("/");
  const base = parseRomanDegreeHead(parts[0]);
  if (!base) return undefined;

  let tonalRoot = keyChroma;
  let scaleType = sectionContext?.scaleType || "major";

  if (parts[1]) {
    const target = parseRomanDegreeHead(parts[1]);
    if (target) {
      const targetIntervals = tonalDegreeIntervalsForScale(scaleType);
      tonalRoot = mod12(keyChroma + targetIntervals[target.index] + target.accidental);
      scaleType = "major";
    }
  }

  const baseText = base.normalized;
  const intervals = tonalDegreeIntervalsForScale(scaleType);
  if (/sub/i.test(baseText)) {
    if (base.index === 4) return mod12(tonalRoot + 1);
    if (base.index === 1) return mod12(tonalRoot + 8);
  }
  if (/bck\.?dr/i.test(baseText)) {
    if (base.index === 4) return mod12(tonalRoot + 10);
    if (base.index === 1) return mod12(tonalRoot + 5);
  }

  return mod12(tonalRoot + intervals[base.index] + base.accidental);
}

function chordQualityMatchesDegree(parsedChord, degreeValue) {
  const normalizedDegree = normalizeDegreeForComparison(degreeValue || "");
  const suffix = parsedChord?.suffix || "";
  if (!normalizedDegree || !parsedChord) return false;

  if (/°/.test(normalizedDegree)) return suffix === "dim" || suffix === "dim7";
  if (/Ø/.test(normalizedDegree)) return suffix === "m7b5";
  if (/-/.test(normalizedDegree)) return /^m/.test(suffix) && suffix !== "m7b5";
  if (/SUS/.test(normalizedDegree)) return /sus/.test(suffix);
  if (/ALT/.test(normalizedDegree)) return /alt/.test(suffix);
  if (/\+/.test(normalizedDegree)) return /^\+|#5/.test(suffix);
  if (/∆|MAJ/.test(normalizedDegree)) return /maj|∆|6|^\+maj|^\+∆/.test(suffix) || suffix === "";
  if (/7|9|13/.test(normalizedDegree)) return isDominantSeventhChord(parsedChord) || /maj|∆|m/.test(suffix);
  return true;
}

function manualDegreeViability(context, degreeValue) {
  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  const slot = measure?.slots?.[context.slot];
  const parsedChord = window.TonalAnalysis?.parseChord?.(slot?.chord || "");
  if (!parsedChord) {
    return { status: "unknown", message: "No pude leer el cifrado de este acorde para verificar la viabilidad." };
  }

  const entries = filledChordSlots();
  const entryIndex = entries.findIndex(entry =>
    entry.pageIndex === context.page &&
    entry.measureIndex === context.measure &&
    entry.slotIndex === context.slot
  );
  const sectionContext = entryIndex >= 0
    ? activeSectionContextForEntry(entries, entryIndex)
    : sectionContextFromLabel(measure?.sectionLabel || "");

  const expectedRoot = degreeRootChromaFromContext(degreeValue, sectionContext);
  if (expectedRoot === undefined) {
    return { status: "unknown", message: "No pude deducir una raiz tonal clara desde ese grado." };
  }

  const rootMatches = mod12(parsedChord.chroma - expectedRoot) === 0;
  const qualityMatches = chordQualityMatchesDegree(parsedChord, degreeValue);

  if (rootMatches && qualityMatches) {
    return {
      status: "viable",
      message: "La raiz y la cualidad parecen viables segun la tonalidad visible, aunque el motor no la prioriza en este contexto."
    };
  }
  if (rootMatches) {
    return {
      status: "partial",
      message: "La raiz coincide con el grado escrito, pero la cualidad/extensión no coincide plenamente con esa lectura."
    };
  }

  return {
    status: "unlikely",
    message: "La raiz del cifrado no coincide con la raiz que sugiere ese grado en la tonalidad visible."
  };
}

function manualChordViability(context, chord) {
  const parsed = window.TonalAnalysis?.parseChord?.(chord);
  if (!parsed) {
    return { status: "unlikely", message: "No pude leer ese cifrado como acorde válido." };
  }

  const tonalCandidates = window.TonalAnalysis?.candidatesForChord?.(chord) || [];
  const reharmonizationContext = window.Reharmonization?.buildContext?.({
    song,
    pageIndex: Number(context.page),
    measureIndex: Number(context.measure),
    slotIndex: Number(context.slot),
    virtualEmpty: context.emptyPulse === true,
    visualPulse: normalizeSlotPulse(context.visualPulse),
    parseChord: window.TonalAnalysis.parseChord
  });
  const nextParsed = reharmonizationContext?.nextParsed;

  if (nextParsed && isDominantSeventhChord(parsed) && !isDiminishedOrHalfDiminishedChord(nextParsed)) {
    if (resolvesAsRegularDominant(parsed, nextParsed)) {
      return { status: "viable", message: "El cifrado es viable: funciona como dominante que resuelve por quinta hacia el siguiente acorde." };
    }
    if (resolvesAsSubOrBackdoorDominant(parsed, nextParsed)) {
      return { status: "viable", message: "El cifrado es viable: puede funcionar como sustituto/backdoor hacia el siguiente acorde." };
    }
  }

  if (tonalCandidates.length) {
    return { status: "viable", message: "El cifrado existe dentro de las tablas tonales, aunque no es una rearmonización prioritaria para este lugar." };
  }

  return { status: "partial", message: "El cifrado se puede leer, pero queda fuera de las tablas tonales actuales del motor." };
}

function warnIfManualDegreeLooksUnexpected(context, value) {
  const normalizedValue = normalizeDegreeForComparison(value);
  if (!normalizedValue || !window.TonalAnalysis) return;

  const suggestions = addEngineDegreeSuggestionsForContext(context, [], new Set());
  if (!suggestions.length) return;

  const accepted = suggestions.some(suggestion =>
    normalizeDegreeForComparison(suggestion.value) === normalizedValue
  );
  if (accepted) return;

  const recommended = [...new Set(suggestions.map(suggestion => suggestion.value))]
    .filter(Boolean)
    .slice(0, 5)
    .join(", ");

  const viability = manualDegreeViability(context, value);
  const viableText = viability?.message ? `\n\nVerificacion de viabilidad: ${viability.message}` : "";
  const intro = viability?.status === "viable"
    ? `La lectura "${value}" no es la opcion que el motor recomienda para este contexto, pero parece viable.`
    : `El motor no reconoce "${value}" como una opcion habitual para este acorde.`;

  alert(`No te lo recomiendo, pero el cliente siempre tiene la razon.\n\n${intro}${viableText}${recommended ? `\n\nOpciones sugeridas: ${recommended}` : ""}\n\nDe todos modos dejare tu analisis escrito.`);
}

function warnIfManualChordLooksUnexpected(context, value) {
  const chord = String(value || "").trim();
  if (!isChordInlineContext(context) || !chord || chord === "%") return;
  if (!window.Reharmonization || !window.TonalAnalysis) return;
  if (chord.split(/\s+/).filter(Boolean).length > 1) return;
  if (context.emptyPulse === true) return;

  const normalizedValue = normalizeChordForComparison(chord);
  if (!normalizedValue) return;

  const reharmonizationContext = window.Reharmonization.buildContext?.({
    song,
    pageIndex: Number(context.page),
    measureIndex: Number(context.measure),
    slotIndex: Number(context.slot),
    virtualEmpty: context.emptyPulse === true,
    visualPulse: normalizeSlotPulse(context.visualPulse),
    parseChord: window.TonalAnalysis.parseChord
  });
  const currentValue = normalizeChordForComparison(reharmonizationContext?.currentChord || "");
  if (!currentValue) return;
  if (currentValue && currentValue === normalizedValue) return;

  const suggestions = window.Reharmonization.suggestionsForSlot?.(reharmonizationContext) || [];
  if (!suggestions.length) return;

  const accepted = suggestions.some(suggestion =>
    normalizeChordForComparison(suggestion.chord || suggestion.label || "") === normalizedValue
  );
  if (accepted) return;

  const recommended = [...new Set(suggestions.map(suggestion => suggestion.chord || suggestion.label))]
    .filter(Boolean)
    .slice(0, 6)
    .join(", ");

  const viability = manualChordViability(context, chord);
  const viableText = viability?.message ? `\n\nVerificacion de viabilidad: ${viability.message}` : "";
  const intro = viability?.status === "viable"
    ? `El cifrado "${chord}" no es una rearmonizacion prioritaria para este lugar, pero parece viable.`
    : `El motor no reconoce "${chord}" como una rearmonizacion habitual para este lugar.`;

  alert(`No te lo recomiendo, pero el cliente siempre tiene la razon.\n\n${intro}${viableText}${recommended ? `\n\nOpciones sugeridas: ${recommended}` : ""}\n\nDe todos modos dejare tu cifrado escrito.`);
}

function evaluationKeyForEntry(entry) {
  return `${entry.pageIndex}:${entry.measureIndex}:${entry.slotIndex}`;
}

function measureLabelForEvaluationEntry(entry) {
  const flatIndex = flatMeasureEntries().findIndex(item =>
    item.pageIndex === entry.pageIndex && item.measureIndex === entry.measureIndex
  );
  const measureNumber = flatIndex >= 0 ? flatIndex + 1 : entry.measureIndex + 1;
  return `compas ${measureNumber}, acorde ${entry.slotIndex + 1}`;
}

function evaluateCurrentAnalysis() {
  if (!window.TonalAnalysis) {
    alert("No se pudo cargar el motor de analisis tonal.");
    return;
  }

  const entries = filledChordSlots();
  const results = window.TonalAnalysis.analyzeProgression(
    entries.map(entry => entry.analysisChord || entry.slot.chord)
  );
  evaluationIssues.clear();

  entries.forEach((entry, index) => {
    const degree = String(entry.slot.degree || "").trim();
    if (!degree) return;
    if (degree === "%") return;

    const sectionContext = activeSectionContextForEntry(entries, index);
    const sectionAnalysis = analysisForEntryInSectionContext(entry, sectionContext);
    const expected = String(sectionAnalysis?.degree || results[index]?.degree || "").trim();
    if (!expected) return;
    if (normalizeDegreeForComparison(degree) === normalizeDegreeForComparison(expected)) return;

    evaluationIssues.set(evaluationKeyForEntry(entry), {
      degree,
      expected,
      suggested: [expected],
      label: measureLabelForEvaluationEntry(entry)
    });
  });

  renderAll(false);

  if (!evaluationIssues.size) {
    alert("Evaluacion completa.\n\nNo encontre grados dudosos segun el motor.");
    return;
  }

  const corrections = Array.from(evaluationIssues.values())
    .slice(0, 10)
    .map(issue => `- ${issue.label}: escribio ${issue.degree}; sugiero ${issue.expected}`)
    .join("\n");
  const remaining = evaluationIssues.size > 10
    ? `\n\nY ${evaluationIssues.size - 10} correccion(es) mas.`
    : "";

  alert(`Evaluacion completa.\n\nHay ${evaluationIssues.size} grado(s) para revisar. Estan subrayados en rojo.\n\nCorrecciones sugeridas:\n${corrections}${remaining}\n\nNo cambie nada del analisis escrito por el estudiante.`);
}

function isStructuralMeasureInlineContext(context) {
  return context?.kind === "measureField" && ["form", "ending", "jump", "leftBar", "rightBar"].includes(context.field);
}

function structuralMeasureSuggestionsForInlineContext(context) {
  if (!isStructuralMeasureInlineContext(context)) return [];

  const options = {
    form: [
      ["A", "seccion A"],
      ["B", "seccion B"],
      ["C", "seccion C"],
      ["D", "seccion D"],
      ["Intro", "introduccion"],
      ["Coda", "coda"]
    ],
    ending: [
      ["", "sin casilla"],
      ["1.", "primera casilla"],
      ["2.", "segunda casilla"],
      ["3.", "tercera casilla"],
      ["4.", "cuarta casilla"]
    ],
    jump: [
      ["", "sin salto"],
      ["D.S.", "dal segno"],
      ["D.C.", "da capo"],
      ["D.S. al Coda", "dal segno a coda"],
      ["D.C. al Fine", "da capo al fine"],
      ["To Coda", "ir a coda"],
      ["Coda", "marca de coda"],
      ["Fine", "final"]
    ],
    leftBar: [
      ["|", "barra simple"],
      ["||", "doble barra"],
      ["|:", "inicio de repeticion"]
    ],
    rightBar: [
      ["|", "barra simple"],
      ["||", "doble barra"],
      ["|||", "barra final"],
      [":||", "fin de repeticion"]
    ]
  };

  return (options[context.field] || []).map(([value, detail]) => ({ value, detail }));
}

function showDegreeSuggestionMenu(editor, suggestions) {
  const menu = els.degreeSuggestionMenu;
  if (!menu || !suggestions.length) {
    hideDegreeSuggestionMenu();
    return;
  }

  menu.innerHTML = "";
  suggestions.forEach(suggestion => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "degreeSuggestionOption";
    option.addEventListener("mousedown", event => {
      event.preventDefault();
      if (inlineContext && (isDegreeInlineContext(inlineContext) || isModeInlineContext(inlineContext))) {
        applyAnalysisSuggestionForContext(inlineContext, suggestion);
      }
      els.inlineEditor.value = suggestion.value;
      els.inlineEditor.dataset.dirty = "true";
      hideInlineEditor(false);
    });

    const value = document.createElement("span");
    value.className = "degreeSuggestionValue";
    value.textContent = suggestion.value;
    option.appendChild(value);

    if (suggestion.detail) {
      const detail = document.createElement("span");
      detail.className = "degreeSuggestionDetail";
      detail.textContent = suggestion.detail;
      option.appendChild(detail);
    }

    menu.appendChild(option);
  });

  const rect = editor.getBoundingClientRect();
  const width = Math.max(120, rect.width);
  menu.style.left = `${Math.max(8, Math.min(window.innerWidth - width - 8, rect.left))}px`;
  menu.style.top = `${Math.min(window.innerHeight - 40, rect.bottom + 4)}px`;
  menu.style.width = `${width}px`;
  menu.classList.remove("hidden");
}

function hideDegreeSuggestionMenu() {
  const menu = els.degreeSuggestionMenu;
  if (!menu) return;
  menu.classList.add("hidden");
  menu.innerHTML = "";
}

function shouldOpenReharmonizationMenu(target) {
  if (assistanceMode !== "assisted") return false;
  if (!window.Reharmonization) return false;
  if (target?.dataset?.kind !== "slot" || target.dataset.field !== "chord") return false;
  const measure = song.pages?.[Number(target.dataset.page)]?.measures?.[Number(target.dataset.measure)];
  const slot = measure?.slots?.[Number(target.dataset.slot)];
  if (target.dataset.emptyPulse !== "true" && !String(slot?.chord || "").trim()) return false;
  return true;
}

function reharmonizationContextForTarget(target) {
  return window.Reharmonization?.buildContext?.({
    song,
    pageIndex: Number(target.dataset.page),
    measureIndex: Number(target.dataset.measure),
    slotIndex: Number(target.dataset.slot),
    virtualEmpty: target.dataset.emptyPulse === "true",
    visualPulse: normalizeSlotPulse(target.dataset.visualPulse),
    parseChord: window.TonalAnalysis?.parseChord
  }) || null;
}

function showReharmonizationMenu(target, clientX = null, clientY = null) {
  const menu = els.reharmonizationMenu;
  if (!menu) {
    showInlineEditor(target, clientX, clientY);
    return;
  }

  hideInlineEditor(true);
  hideDegreeSuggestionMenu();

  const context = reharmonizationContextForTarget(target);
  const suggestions = window.Reharmonization?.suggestionsForSlot?.(context) || [];

  selected.page = Number(target.dataset.page);
  selected.measure = Number(target.dataset.measure);
  selectedSlot = Number(target.dataset.slot);

  menu.innerHTML = "";
  menu.dataset.page = String(selected.page);
  menu.dataset.measure = String(selected.measure);
  menu.dataset.slot = String(selectedSlot);

  menu.appendChild(reharmonizationHeader(context));
  menu.appendChild(reharmonizationActionButton("Editar cifrado manualmente", "Abrir editor de texto", () => {
    hideReharmonizationMenu();
    showInlineEditor(target, clientX, clientY);
  }));

  const displaySuggestions = deduplicateReharmonizationSuggestions(suggestions);

  if (displaySuggestions.length) {
    groupedReharmonizationSuggestions(displaySuggestions).forEach(group => {
      menu.appendChild(reharmonizationGroupHeader(group.label));
      group.items.forEach(suggestion => {
        menu.appendChild(reharmonizationActionButton(
          suggestion.label || suggestion.chord,
          reharmonizationDetailText(suggestion),
          () => applyReharmonizationSuggestion(target, suggestion)
        ));
      });
    });
  } else {
    const empty = document.createElement("div");
    empty.className = "reharmonizationEmpty";
    empty.textContent = "Sin opciones calculadas todavía";
    menu.appendChild(empty);
  }

  const rect = target.getBoundingClientRect();
  const width = 240;
  const left = rect.width
    ? rect.left + rect.width / 2 - width / 2
    : (clientX || 80) - width / 2;
  const top = rect.height ? rect.bottom + 6 : (clientY || 80) + 8;
  menu.style.left = `${Math.max(8, Math.min(window.innerWidth - width - 8, left))}px`;
  menu.style.top = `${Math.max(48, Math.min(window.innerHeight - 60, top))}px`;
  menu.style.width = `${width}px`;
  menu.classList.remove("hidden");
}

function reharmonizationFamilyInfo(suggestion) {
  const family = suggestion?.family || "";
  const type = suggestion?.type || "";
  if (/secondary-dominant|dominant-color/.test(family)) return { key: "dominant", label: "Dominantes hacia el siguiente acorde", order: 10 };
  if (/tritone-substitution|major-tritone-substitution|tritone-color/.test(family)) return { key: "tritone", label: "Sustitutos de tritono", order: 20 };
  if (/backdoor/.test(family)) return { key: "backdoor", label: "Backdoor", order: 30 };
  if (/preparatory-two|relative-two/.test(family)) return { key: "ii", label: "II relativos", order: 40 };
  if (/diminished/.test(family)) return { key: "diminished", label: "Disminuidos de aproximacion", order: 50 };
  if (/simple-substitution/.test(family)) return { key: "function", label: "Misma funcion tonal", order: 60 };
  if (/secondary-region|cadential-two|dominant-replacement/.test(family)) return { key: "local", label: "Reemplazos funcionales", order: 65 };
  if (/modal-interchange/.test(family)) return { key: "modal", label: "Intercambio modal", order: 70 };
  if (/same-root-color/.test(family)) return { key: "color", label: "Color y escala", order: 80 };
  if (type === "replacement") return { key: "replace", label: "Reemplazar este acorde", order: 75 };
  return { key: "other", label: "Otras opciones", order: 90 };
}

function groupedReharmonizationSuggestions(suggestions) {
  const groups = new Map();
  suggestions.forEach((suggestion, index) => {
    const info = reharmonizationFamilyInfo(suggestion);
    if (!groups.has(info.key)) groups.set(info.key, { ...info, items: [] });
    groups.get(info.key).items.push({ ...suggestion, _order: index });
  });

  return Array.from(groups.values())
    .sort((a, b) => a.order - b.order)
    .map(group => ({
      ...group,
      items: group.items.sort((a, b) => reharmonizationPriority(a) - reharmonizationPriority(b) || a._order - b._order)
    }));
}

function reharmonizationSuggestionKey(suggestion) {
  const chord = String(suggestion?.chord || suggestion?.label || "").trim();
  const normalized = normalizeChordForComparison(chord);
  return normalized || chord.toLowerCase();
}

function isBetterReharmonizationSuggestion(candidate, current) {
  if (!current) return true;
  const candidateGroup = reharmonizationFamilyInfo(candidate);
  const currentGroup = reharmonizationFamilyInfo(current);
  if (candidateGroup.order !== currentGroup.order) return candidateGroup.order < currentGroup.order;
  const candidatePriority = reharmonizationPriority(candidate);
  const currentPriority = reharmonizationPriority(current);
  if (candidatePriority !== currentPriority) return candidatePriority < currentPriority;
  const candidateDetail = String(candidate?.detail || "");
  const currentDetail = String(current?.detail || "");
  if (/\bhacia\b/i.test(candidateDetail) !== /\bhacia\b/i.test(currentDetail)) return /\bhacia\b/i.test(candidateDetail);
  return candidateDetail.length > currentDetail.length;
}

function deduplicateReharmonizationSuggestions(suggestions) {
  const byChord = new Map();
  suggestions.forEach((suggestion, index) => {
    const key = reharmonizationSuggestionKey(suggestion);
    if (!key) return;
    const normalized = { ...suggestion, _sourceOrder: index };
    const current = byChord.get(key);
    if (isBetterReharmonizationSuggestion(normalized, current)) {
      byChord.set(key, normalized);
    }
  });
  return Array.from(byChord.values())
    .sort((a, b) => {
      const groupDelta = reharmonizationFamilyInfo(a).order - reharmonizationFamilyInfo(b).order;
      if (groupDelta) return groupDelta;
      const priorityDelta = reharmonizationPriority(a) - reharmonizationPriority(b);
      if (priorityDelta) return priorityDelta;
      return (a._sourceOrder || 0) - (b._sourceOrder || 0);
    });
}

function reharmonizationPriority(suggestion) {
  if (suggestion?.priority !== undefined) return Number(suggestion.priority);
  const family = suggestion?.family || "";
  const chord = String(suggestion?.chord || "");
  if (/secondary-dominant/.test(family)) return 10;
  if (/tritone-substitution/.test(family)) return 15;
  if (/backdoor/.test(family)) return 20;
  if (/relative-two$|preparatory-two$|cadential-two/.test(family)) return 25;
  if (/relative-two-sub|preparatory-two-sub/.test(family)) return 30;
  if (/chromatic-diminished/.test(family)) return 35;
  if (/simple-substitution/.test(family)) return 40;
  if (/major-tritone|tritone-color|dominant-color|secondary-region/.test(family)) return 45;
  if (/modal-interchange|parallel-modal-interchange/.test(family)) return 50;
  if (/same-root-color/.test(family)) return /(?:alt|#11|b5|b9|b13)/.test(chord) ? 70 : 60;
  return 50;
}

function reharmonizationGroupHeader(label) {
  const header = document.createElement("div");
  header.className = "reharmonizationGroupHeader";
  header.textContent = label;
  return header;
}

function reharmonizationDetailText(suggestion) {
  const detail = String(suggestion?.detail || "").trim();
  if (!detail) return "";
  return detail
    .replace(/\bDominante secundaria\b/g, "V7 secundario")
    .replace(/\bDominante sustituto\b/g, "Vsub")
    .replace(/\bSustituto dominante\b/g, "Vsub")
    .replace(/\bSustituto mayor\b/g, "Vsub maj7")
    .replace(/\bDisminuido de aproximación\b/g, "°7 de aproximacion")
    .replace(/\bII relativo del sustituto\b/g, "IIsub")
    .replace(/\bTritono de\b/g, "Sustituto de tritono de")
    .replace(/\bSustitución simple\b/g, "Misma funcion tonal")
    .replace(/\bIntercambio modal\b/g, "Mismo grado en escala paralela")
    .replace(/\bColor:\s*/g, "Misma raiz, color ");
}

function reharmonizationHeader(context) {
  const header = document.createElement("div");
  header.className = "reharmonizationHeader";

  const title = document.createElement("strong");
  title.textContent = context?.currentChord || "Slot vacío";
  header.appendChild(title);

  const detail = document.createElement("span");
  const tonal = context?.tonalContext?.label || "sin tonalidad visible";
  const next = context?.nextChord ? `siguiente: ${context.nextChord}` : "sin acorde siguiente";
  detail.textContent = `${tonal} · ${next}`;
  header.appendChild(detail);

  return header;
}

function reharmonizationActionButton(label, detail, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "reharmonizationOption";
  button.addEventListener("mousedown", event => {
    event.preventDefault();
    event.stopPropagation();
  });
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  const value = document.createElement("span");
  value.className = "reharmonizationValue";
  value.textContent = label;
  button.appendChild(value);

  if (detail) {
    const description = document.createElement("span");
    description.className = "reharmonizationDetail";
    description.textContent = detail;
    button.appendChild(description);
  }

  return button;
}

function applyReharmonizationSuggestion(target, suggestion) {
  const chord = String(suggestion?.chord || "").trim();
  if (!chord) return;

  const pageIndex = Number(target.dataset.page);
  const measureIndex = Number(target.dataset.measure);
  const slotIndex = Number(target.dataset.slot);
  const measure = song.pages[pageIndex]?.measures?.[measureIndex];
  if (!measure) return;

  if (target.dataset.emptyPulse === "true") {
    insertChordValueAtPulse(measure, slotIndex, normalizeSlotPulse(target.dataset.visualPulse), chord, { chordFixed: true });
  } else {
    const slot = measure.slots?.[slotIndex];
    if (!slot) return;
    setChordValueFromContext(measure, slotIndex, chord, { chordFixed: true });
  }
  selected = { page: pageIndex, measure: measureIndex };
  selectedSlot = slotIndex;
  hideReharmonizationMenu();
  autoAnalyzeCurrentSong(false);
  setDirty(true);
  renderAll(false);
}

function updateRandomReharmDensityLabel() {
  if (!els.randomReharmDensityInput || !els.randomReharmDensityValue) return;
  els.randomReharmDensityValue.textContent = `${Number(els.randomReharmDensityInput.value || 0)}%`;
}

function renderRandomReharmControls() {
  if (!els.randomReharmWeights || els.randomReharmWeights.childElementCount) return;

  RANDOM_REHARM_TECHNIQUES.forEach(technique => {
    const row = document.createElement("label");
    row.className = "randomReharmWeightRow";
    row.innerHTML = `
      <span class="randomReharmWeightTop">
        <span>${escapeHtml(technique.label)}</span>
        <span data-random-weight-value="${escapeAttr(technique.id)}">${technique.defaultWeight}%</span>
      </span>
      <input data-random-weight="${escapeAttr(technique.id)}" type="range" min="0" max="100" step="5" value="${technique.defaultWeight}">
    `;
    const input = row.querySelector("input");
    const value = row.querySelector("[data-random-weight-value]");
    input?.addEventListener("input", () => {
      if (value) value.textContent = `${Number(input.value || 0)}%`;
      scheduleRandomReharmPreview();
    });
    els.randomReharmWeights.appendChild(row);
  });
}

function openRandomReharmDialog() {
  if (!els.randomReharmDialog) return;
  renderRandomReharmControls();
  updateRandomReharmDensityLabel();
  randomReharmSessionSeed = `${Date.now()}-${Math.random()}`;
  randomReharmProposals = [];
  renderRandomReharmPreview([]);
  els.randomReharmDialog.showModal();
  scheduleRandomReharmPreview(0);
}

function randomReharmWeights() {
  const out = new Map();
  RANDOM_REHARM_TECHNIQUES.forEach(technique => {
    const input = els.randomReharmWeights?.querySelector(`[data-random-weight="${technique.id}"]`);
    out.set(technique.id, Math.max(0, Number(input?.value ?? technique.defaultWeight) || 0));
  });
  return out;
}

function randomReharmTechniqueForFamily(family) {
  return RANDOM_REHARM_TECHNIQUES.find(technique => technique.families.includes(family)) || null;
}

function randomReharmSuggestionTechnique(suggestion) {
  const family = String(suggestion?.family || "");
  let technique = randomReharmTechniqueForFamily(family);
  if (!technique && family === "secondary-region" && /Intercambio modal/i.test(suggestion?.detail || "")) {
    technique = RANDOM_REHARM_TECHNIQUES.find(item => item.id === "modal");
  }
  return technique;
}

function seededRandom(seedText) {
  let seed = 2166136261;
  String(seedText || `${Date.now()}-${Math.random()}`).split("").forEach(char => {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  });
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedChoice(items, weightFor, rng) {
  const weighted = items
    .map(item => ({ item, weight: Math.max(0, Number(weightFor(item)) || 0) }))
    .filter(entry => entry.weight > 0);
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (!total) return null;

  let pick = rng() * total;
  for (const entry of weighted) {
    pick -= entry.weight;
    if (pick <= 0) return entry.item;
  }
  return weighted[weighted.length - 1]?.item || null;
}

function randomReharmMeasureNumber(pageIndex, measureIndex) {
  const flatIndex = flatMeasureEntries().findIndex(entry =>
    entry.pageIndex === pageIndex && entry.measureIndex === measureIndex
  );
  return flatIndex >= 0 ? flatIndex + 1 : measureIndex + 1;
}

function randomReharmContextForEntry(entry) {
  return window.Reharmonization?.buildContext?.({
    song,
    pageIndex: entry.pageIndex,
    measureIndex: entry.measureIndex,
    slotIndex: entry.slotIndex,
    parseChord: window.TonalAnalysis?.parseChord
  });
}

function randomReharmCandidateSuggestions(entry, weights) {
  const context = randomReharmContextForEntry(entry);
  const current = normalizeChordForComparison(entry.slot?.chord || "");
  return (window.Reharmonization?.suggestionsForSlot?.(context) || [])
    .map(suggestion => ({
      ...suggestion,
      technique: randomReharmSuggestionTechnique(suggestion)
    }))
    .filter(suggestion =>
      suggestion.technique &&
      (weights.get(suggestion.technique.id) || 0) > 0 &&
      normalizeChordForComparison(suggestion.chord || "") !== current
    );
}

function buildRandomReharmonizationProposals() {
  if (!window.Reharmonization || !window.TonalAnalysis) {
    alert("No se pudo abrir el motor de rearmonización.\n\nRecarga la app y vuelve a intentarlo.");
    return [];
  }

  const weights = randomReharmWeights();
  const density = Math.max(0, Math.min(1, Number(els.randomReharmDensityInput?.value || 0) / 100));
  const seed = String(els.randomReharmSeedInput?.value || "").trim();
  if (!seed && !randomReharmSessionSeed) randomReharmSessionSeed = `${Date.now()}-${Math.random()}`;
  const rng = seededRandom(seed || randomReharmSessionSeed);
  const entries = filledChordSlots()
    .filter(entry => {
      const chord = String(entry.slot?.chord || "").trim();
      return chord && chord !== "%" && !isRepeatMeasure(entry.measure);
    });
  const proposals = [];

  entries.forEach(entry => {
    if (rng() > density) return;
    const suggestions = randomReharmCandidateSuggestions(entry, weights);
    if (!suggestions.length) return;

    const availableTechniques = [...new Map(suggestions.map(suggestion => [suggestion.technique.id, suggestion.technique])).values()];
    const technique = weightedChoice(availableTechniques, item => weights.get(item.id), rng);
    if (!technique) return;

    const suggestionPool = suggestions.filter(suggestion => suggestion.technique.id === technique.id);
    const suggestion = suggestionPool[Math.floor(rng() * suggestionPool.length)];
    if (!suggestion) return;

    proposals.push({
      pageIndex: entry.pageIndex,
      measureIndex: entry.measureIndex,
      slotIndex: entry.slotIndex,
      measureNumber: randomReharmMeasureNumber(entry.pageIndex, entry.measureIndex),
      pulse: normalizeSlotPulse(entry.slot?.pulse) || entry.slotIndex + 1,
      from: entry.slot.chord,
      to: suggestion.chord,
      detail: suggestion.detail || "",
      family: suggestion.family || "",
      techniqueId: technique.id,
      techniqueLabel: technique.label
    });
  });

  return proposals;
}

function renderRandomReharmPreview(proposals) {
  if (!els.randomReharmPreview || !els.randomReharmApplyBtn) return;
  els.randomReharmPreview.innerHTML = "";
  els.randomReharmApplyBtn.disabled = !proposals.length;

  if (!proposals.length) {
    const empty = document.createElement("div");
    empty.className = "randomReharmPreviewEmpty";
    empty.textContent = "Genera una vista previa para ver propuestas.";
    els.randomReharmPreview.appendChild(empty);
    return;
  }

  proposals.forEach(proposal => {
    const item = document.createElement("div");
    item.className = "randomReharmPreviewItem";
    item.innerHTML = `
      <span class="randomReharmPreviewMeta">c. ${proposal.measureNumber} · pulso ${proposal.pulse}</span>
      <span class="randomReharmPreviewChange">${escapeHtml(proposal.from)} → ${escapeHtml(proposal.to)}</span>
      <span class="randomReharmPreviewFamily">${escapeHtml(proposal.techniqueLabel)}</span>
    `;
    item.title = proposal.detail;
    els.randomReharmPreview.appendChild(item);
  });
}

function previewRandomReharmonization() {
  if (randomReharmPreviewTimer) {
    clearTimeout(randomReharmPreviewTimer);
    randomReharmPreviewTimer = null;
  }
  randomReharmProposals = buildRandomReharmonizationProposals();
  renderRandomReharmPreview(randomReharmProposals);
}

function generateRandomReharmVariation() {
  randomReharmSessionSeed = `${Date.now()}-${Math.random()}`;
  if (els.randomReharmSeedInput) els.randomReharmSeedInput.value = "";
  previewRandomReharmonization();
}

function scheduleRandomReharmPreview(delay = 160) {
  if (!els.randomReharmDialog?.open) return;
  if (randomReharmPreviewTimer) clearTimeout(randomReharmPreviewTimer);
  randomReharmPreviewTimer = window.setTimeout(() => {
    randomReharmPreviewTimer = null;
    previewRandomReharmonization();
  }, delay);
}

function applyRandomReharmonization() {
  if (!randomReharmProposals.length) return;
  if (randomReharmPreviewTimer) {
    clearTimeout(randomReharmPreviewTimer);
    randomReharmPreviewTimer = null;
  }

  randomReharmProposals.forEach(proposal => {
    const measure = song.pages?.[proposal.pageIndex]?.measures?.[proposal.measureIndex];
    if (!measure?.slots?.[proposal.slotIndex]) return;
    setChordValueFromContext(measure, proposal.slotIndex, proposal.to, { chordFixed: true });
  });

  autoAnalyzeCurrentSong(false, { confirm: false, alert: false, markDirty: false, render: false });
  selected = {
    page: randomReharmProposals[0]?.pageIndex || 0,
    measure: randomReharmProposals[0]?.measureIndex || 0
  };
  selectedSlot = randomReharmProposals[0]?.slotIndex || 0;
  setDirty(true);
  renderAll(false);
  renderRandomReharmPreview([]);
  randomReharmProposals = [];
  els.randomReharmDialog?.close();
}

function hideReharmonizationMenu() {
  const menu = els.reharmonizationMenu;
  if (!menu) return;
  menu.classList.add("hidden");
  menu.innerHTML = "";
}

function inlineNavigationRank(context) {
  if (!context) return null;
  const fieldOrder = { chord: 0, mode: 1, degree: 2, originScale: 3, sectionLabel: 4, note: 900 };

  if (context.kind === "slot" && fieldOrder[context.field] !== undefined) {
    return Number(context.page) * 1000000
      + Number(context.measure) * 1000
      + Number(context.slot) * 10
      + fieldOrder[context.field];
  }

  if (context.kind === "measureField" && (context.field === "sectionLabel" || context.field === "note")) {
    return Number(context.page) * 1000000
      + Number(context.measure) * 1000
      + fieldOrder.note;
  }

  return null;
}

function inlineNavigationTargets() {
  const selector = [
    '.directFieldHit[data-kind="slot"][data-field="chord"]',
    '.directFieldHit[data-kind="slot"][data-field="mode"]',
    '.directFieldHit[data-kind="slot"][data-field="degree"]',
    '.directFieldHit[data-kind="slot"][data-field="originScale"]',
    '.directFieldHit[data-kind="slot"][data-field="sectionLabel"]',
    '.directFieldHit[data-kind="measureField"][data-field="sectionLabel"]'
  ].join(",");

  return Array.from(els.pages.querySelectorAll(selector))
    .map(target => {
      const context = {
        kind: target.dataset.kind,
        page: Number(target.dataset.page),
        measure: Number(target.dataset.measure),
        slot: Number(target.dataset.slot),
        field: target.dataset.field
      };
      return {
        target,
        rank: inlineNavigationRank(context)
      };
    })
    .filter(item => item.rank !== null)
    .sort((a, b) => a.rank - b.rank);
}

function moveInlineEditor(direction) {
  if (els.inlineEditor.classList.contains("hidden") || !inlineContext) return;

  const context = { ...inlineContext };
  const currentRank = inlineNavigationRank(context);
  if (currentRank === null) return;

  const suppressedHiddenAnalysisValue = els.inlineEditor.dataset.suppressedHiddenAnalysisValue === "true";
  const editorWasChanged = els.inlineEditor.dataset.dirty === "true";
  const rawValue = els.inlineEditor.value;
  if (!(suppressedHiddenAnalysisValue && !editorWasChanged && !String(rawValue || "").trim())) {
    setValueFromContext(context, rawValue);
  }
  setDirty(true);
  evaluationIssues.clear();
  inlineContext = null;
  els.inlineEditor.classList.add("hidden");
  els.inlineEditor.classList.remove("noteTextEditor");
  els.inlineEditor.dataset.suppressedHiddenAnalysisValue = "";
  els.inlineEditor.dataset.dirty = "";
  hideDegreeSuggestionMenu();
  renderAll(false);

  const targets = inlineNavigationTargets();
  if (!targets.length) return;

  let next;
  if (direction > 0) {
    next = targets.find(item => item.rank > currentRank) || targets[0];
  } else {
    next = [...targets].reverse().find(item => item.rank < currentRank) || targets[targets.length - 1];
  }

  if (next?.target) {
    showInlineEditor(next.target);
  }
}

function isChordInlineContext(context) {
  return context?.kind === "slot" && context.field === "chord";
}

function inlineEditorValueWithKey(key) {
  const editor = els.inlineEditor;
  const value = String(editor?.value || "");
  const start = Number(editor?.selectionStart ?? value.length);
  const end = Number(editor?.selectionEnd ?? start);
  return `${value.slice(0, start)}${key}${value.slice(end)}`;
}

function normalizeInlineStructureToken(value) {
  const token = String(value || "").trim();
  if (/^[12][.)]$/.test(token)) return `${token.replace(/\D/g, "")}.`;
  if (token === "|") return "|";
  if (token === "||") return "||";
  if (token === "|||") return "|||";
  if (token === "|:" || token === "||:") return "|:";
  if (token === ":|" || token === ":||") return ":||";
  return "";
}

function shouldCommitInlineEndingToken(key) {
  if (!isChordInlineContext(inlineContext)) return false;
  return /^[12]\.$/.test(inlineEditorValueWithKey(key));
}

function commitInlineEndingToken(key) {
  if (!isChordInlineContext(inlineContext)) return;
  const context = { ...inlineContext };
  commitInlineChordOrStructure(context, inlineEditorValueWithKey(key));
  setDirty(true);
  evaluationIssues.clear();
  inlineContext = null;
  els.inlineEditor.classList.add("hidden");
  els.inlineEditor.classList.remove("noteTextEditor");
  hideDegreeSuggestionMenu();
  renderAll(false);
  showChordInlineTargetForContext(context);
}

function isInlineEditorCaretAtEdge(direction) {
  const editor = els.inlineEditor;
  if (!editor || editor.classList.contains("hidden")) return false;
  const start = Number(editor.selectionStart ?? 0);
  const end = Number(editor.selectionEnd ?? start);
  const length = String(editor.value || "").length;
  if (start !== end) return true;
  return direction > 0 ? end >= length : start <= 0;
}

function chordNavigationRankForContext(context) {
  if (!isChordInlineContext(context)) return null;
  const pulse = normalizeSlotPulse(context.visualPulse) || Number(context.slot) + 1;
  return Number(context.page) * 1000000
    + Number(context.measure) * 100
    + pulse;
}

function chordNavigationTargets() {
  return Array.from(els.pages.querySelectorAll('.directFieldHit[data-kind="slot"][data-field="chord"]'))
    .map(target => {
      const context = {
        kind: target.dataset.kind,
        page: Number(target.dataset.page),
        measure: Number(target.dataset.measure),
        slot: Number(target.dataset.slot),
        field: target.dataset.field,
        emptyPulse: target.dataset.emptyPulse === "true",
        visualPulse: normalizeSlotPulse(target.dataset.visualPulse)
      };
      return {
        target,
        context,
        rank: chordNavigationRankForContext(context),
        empty: context.emptyPulse
      };
    })
    .filter(item => item.rank !== null)
    .sort((a, b) => a.rank - b.rank || (a.empty === b.empty ? 0 : a.empty ? 1 : -1));
}

function moveChordInlineEditor(direction) {
  if (els.inlineEditor.classList.contains("hidden") || !isChordInlineContext(inlineContext)) return;

  const context = { ...inlineContext };
  const currentRank = chordNavigationRankForContext(context);
  if (currentRank === null) return;

  const commitResult = commitInlineChordOrStructure(context, els.inlineEditor.value);
  setDirty(true);
  evaluationIssues.clear();
  inlineContext = null;
  els.inlineEditor.classList.add("hidden");
  els.inlineEditor.classList.remove("noteTextEditor");
  hideDegreeSuggestionMenu();
  renderAll(false);

  if (commitResult.stayOnMeasure) {
    showChordInlineTargetForContext(context);
    return;
  }

  const targets = chordNavigationTargets();
  if (!targets.length) return;

  const next = commitResult.nextMeasure
    ? nextMeasureChordTarget(context)
    : direction > 0
      ? targets.find(item => item.rank > currentRank)
      : [...targets].reverse().find(item => item.rank < currentRank);

  if (next?.target) {
    showInlineEditor(next.target);
  }
}

function moveChordInlineEditorToNextMeasure() {
  if (els.inlineEditor.classList.contains("hidden") || !isChordInlineContext(inlineContext)) return;

  const context = { ...inlineContext };
  commitInlineChordOrStructure(context, els.inlineEditor.value);
  setDirty(true);
  evaluationIssues.clear();
  inlineContext = null;
  els.inlineEditor.classList.add("hidden");
  els.inlineEditor.classList.remove("noteTextEditor");
  hideDegreeSuggestionMenu();
  renderAll(false);

  const targets = chordNavigationTargets();
  if (!targets.length) return;

  const next = nextMeasureChordTarget(context);

  if (next?.target) {
    showInlineEditor(next.target);
  }
}

function nextMeasureChordTarget(context) {
  return chordNavigationTargets().find(item =>
    item.context.page > context.page
    || (item.context.page === context.page && item.context.measure > context.measure)
  );
}

function showChordInlineTargetForContext(context) {
  const target = chordNavigationTargets().find(item =>
    item.context.page === context.page
    && item.context.measure === context.measure
    && item.context.slot === context.slot
    && item.context.emptyPulse === context.emptyPulse
    && normalizeSlotPulse(item.context.visualPulse) === normalizeSlotPulse(context.visualPulse)
  ) || chordNavigationTargets().find(item =>
    item.context.page === context.page
    && item.context.measure === context.measure
  );
  if (target?.target) showInlineEditor(target.target);
}

function commitInlineChordOrStructure(context, value) {
  const token = normalizeInlineStructureToken(value);
  if (!token) {
    setValueFromContext(context, value);
    return {};
  }

  const measure = song.pages?.[context.page]?.measures?.[context.measure];
  if (!measure) return {};

  if (/^[12]\.$/.test(token)) {
    measure.ending = token;
    return { stayOnMeasure: true };
  }

  if (token === "|:") {
    measure.leftBar = "|:";
    return { stayOnMeasure: true };
  }

  measure.rightBar = token;
  if (token === ":||" || token === "||" || token === "|||") {
    maybeAutoDetectFormFromBar(token, { force: true });
  }
  return { nextMeasure: true };
}

function getValueFromTarget(target) {
  const kind = target.dataset.kind;
  const field = target.dataset.field;

  if (kind === "song") return song[field] || "";

  const measure = song.pages[Number(target.dataset.page)]?.measures?.[Number(target.dataset.measure)];
  if (!measure) return "";

  if (kind === "measureField") return measure[field] || "";

  if (kind === "slot") {
    if (target.dataset.emptyPulse === "true") return "";
    const slot = measure.slots[Number(target.dataset.slot)];
    return slot?.[field] || "";
  }

  return "";
}

function setValueFromContext(context, value) {
	  let cleanedValue = context.kind === "song" || context.field === "note"
	    ? String(value || "")
	    : normalizeTextSymbols(value);
	  if (context.kind === "slot" && context.field === "chord") {
	    cleanedValue = normalizeChordSymbolInput(value);
	  }
  if (context.kind === "slot" && context.field === "degree") {
    cleanedValue = normalizeDegreeInput(value);
  } else if (context.field === "sectionLabel") {
    cleanedValue = normalizeSectionLabelInput(cleanedValue);
  } else if (context.field === "originScale") {
    cleanedValue = normalizeOriginScaleInput(cleanedValue);
  } else if (context.kind === "song" && context.field === "timeSignature") {
    cleanedValue = normalizeTimeSignature(cleanedValue);
  }

  if (context.kind === "song") {
    song[context.field] = cleanedValue;
    return;
  }

  const measure = song.pages[context.page]?.measures?.[context.measure];
  if (!measure) return;

  if (context.kind === "measureField") {
    measure[context.field] = cleanedValue;
    markHiddenMeasureAnalysisFieldEdit(measure, context.field, cleanedValue);
    markManualMeasureAnalysisField(measure, context.field);
    if (context.field === "form") {
      measure._autoForm = false;
    } else if (context.field === "rightBar") {
      maybeAutoDetectFormFromBar(cleanedValue);
    }
	    return;
	  }

  if (context.kind === "slot") {
    if (context.field === "chord") {
      if (assistanceMode === "assisted") {
        warnIfManualChordLooksUnexpected(context, cleanedValue);
      }
      if (context.emptyPulse && cleanedValue) {
        insertChordValueAtPulse(measure, context.slot, context.visualPulse, cleanedValue, { chordFixed: true });
      } else {
        setChordValueFromContext(measure, context.slot, cleanedValue, { chordFixed: true });
      }
      if (assistanceMode === "assisted") {
        autoAnalyzeCurrentSong(false);
      }
      return;
    }

    const slot = measure.slots[context.slot];
    if (!slot) return;

    if (assistanceMode === "assisted" && context.field === "degree" && String(slot.degree || "") !== cleanedValue) {
      warnIfManualDegreeLooksUnexpected(context, cleanedValue);
    }

    slot[context.field] = cleanedValue;
    markHiddenAnalysisFieldEdit(slot, context.field, cleanedValue);
    markManualAnalysisField(slot, context.field);
	    if (assistanceMode === "assisted" && ["degree", "mode"].includes(context.field)) {
	      synchronizeAnalysisBoxesFromEdit(context, context.field, cleanedValue);
	    }
	  }
	}

function setChordValueFromContext(measure, startSlot, value, options = {}) {
  const chords = String(value || "").trim().split(/\s+/).filter(Boolean).map(normalizeChordSymbolInput).slice(0, 4 - startSlot);
  ensureMeasureSlot(measure, startSlot + Math.max(0, chords.length - 1));

  if (!chords.length) {
    const slot = ensureMeasureSlot(measure, startSlot);
    if (!slot) return;
    slot.chord = "";
    slot.chordFixed = false;
    slot.degree = "";
    slot.mode = "";
    slot.sectionLabel = "";
    slot.originScale = "";
    delete slot.manualAnalysisFields;
    return;
  }

  if (chords.length === 1 && chords[0] === "%") {
    (measure.slots || []).forEach(slot => {
      slot.chord = "";
      slot.chordFixed = false;
      slot.degree = "";
      slot.mode = "";
      slot.sectionLabel = "";
      slot.originScale = "";
      delete slot.manualAnalysisFields;
    });
    measure.slots[0].chord = "%";
    measure.slots[0].chordFixed = false;
    measure.slots[0].originScale = "";
    return;
  }

  chords.forEach((chord, index) => {
    const slot = measure.slots[startSlot + index];
    if (!slot) return;

    slot.chord = chord;
    slot.chordFixed = options.chordFixed === true;
    slot.degree = "";
    slot.mode = "";
    slot.sectionLabel = "";
    slot.originScale = "";
    delete slot.manualAnalysisFields;
  });
}

function assignVisiblePulsesForMeasure(measure) {
  const entries = visibleSlotEntries(measure);
  if (!entries.length) return;
  const layout = layoutSlots(entries.map(entry => entry.slot), 100, song.settings, measure);

  entries.forEach((entry, index) => {
    if (!entry.slot || normalizeSlotPulse(entry.slot.pulse)) return;
    entry.slot.pulse = layout[index]?.position;
  });
}

function insertChordValueAtPulse(measure, insertionIndex, pulse, value, options = {}) {
  const chords = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!chords.length) return;

  assignVisiblePulsesForMeasure(measure);
  const startSlot = Math.max(0, Math.min(Number(insertionIndex) || 0, measure.slots?.length || 0));
  const startPulse = normalizeSlotPulse(pulse) || Math.min(4, startSlot + 1);
  const newSlots = chords.map((chord, index) => ({
    ...makeEmptySlot(),
    chord,
    chordFixed: options.chordFixed === true,
    pulse: normalizeSlotPulse(startPulse + index)
  }));

  if (!Array.isArray(measure.slots)) measure.slots = [];
  measure.slots.splice(startSlot, 0, ...newSlots);
}

function filledChordSlots() {
  const out = [];
  const measures = flatMeasureEntries();

  measures.forEach((entry, measureOrder) => {
    effectiveChordEntriesForMeasure(measures, measureOrder).forEach(effective => {
      const slot = entry.measure.slots?.[effective.slotIndex];
      if (!slot) return;
      out.push({
        pageIndex: entry.pageIndex,
        measureIndex: entry.measureIndex,
        slotIndex: effective.slotIndex,
        measure: entry.measure,
        slot,
        analysisChord: effective.chord
      });
    });
  });

  return out;
}

function flatMeasureEntries() {
  return (song.pages || []).flatMap((page, pageIndex) =>
    (page.measures || []).map((measure, measureIndex) => ({
      pageIndex,
      measureIndex,
      measure
    }))
  );
}

function isRepeatMeasure(measure) {
  return (measure?.slots || []).some(slot => String(slot?.chord || "").trim() === "%");
}

function writtenChordEntries(measure) {
  return (measure?.slots || [])
    .map((slot, slotIndex) => ({ slotIndex, chord: String(slot?.chord || "").trim() }))
    .filter(entry => entry.chord && entry.chord !== "%");
}

function effectiveChordEntriesForMeasure(measures, measureOrder, seen = new Set()) {
  const entry = measures[measureOrder];
  if (!entry) return [];

  if (isRepeatMeasure(entry.measure)) {
    if (measureOrder <= 0 || seen.has(measureOrder)) return [];
    seen.add(measureOrder);
    const previous = effectiveChordEntriesForMeasure(measures, measureOrder - 1, seen);
    return previous
      .slice(0, entry.measure.slots?.length || 4)
      .map((previousEntry, slotIndex) => ({
        slotIndex,
        chord: previousEntry.chord
      }));
  }

  return writtenChordEntries(entry.measure);
}

function mod12(value) {
  return ((value % 12) + 12) % 12;
}

function parsedEntryChord(entry) {
  const chord = entry?.analysisChord || entry?.slot?.chord || "";
  return window.TonalAnalysis?.parseChord?.(chord) || null;
}

function isDominantSeventhChord(parsed) {
  const suffix = parsed?.suffix || "";
  return /^(?:7|9|13)/.test(suffix) || /^\+7/.test(suffix) || suffix === "7alt";
}

function isMinorSeventhOrHalfDiminishedChord(parsed) {
  const suffix = parsed?.suffix || "";
  return /^m(?:7|9|11|13)/.test(suffix) || suffix === "m7b5";
}

function isDiminishedOrHalfDiminishedChord(parsed) {
  const suffix = parsed?.suffix || "";
  return suffix === "m7b5" || suffix === "dim" || suffix === "dim7";
}

function resolvesAsRegularDominant(source, target) {
  return !!(source && target && mod12(target.chroma - source.chroma) === 5);
}

function resolvesAsSubOrBackdoorDominant(source, target) {
  if (!source || !target) return false;
  const distance = mod12(target.chroma - source.chroma);
  return distance === 11 || distance === 2;
}

function resolvesAsSubstituteTwoFive(source, target) {
  if (!source || !target) return false;
  return mod12(target.chroma - source.chroma) === 11;
}

function automaticConnectorForEntries(current, next, following) {
  return automaticConnectorStateForEntries(current, next, following).arrow;
}

function automaticConnectorStateForEntries(current, next, following, previous = null) {
  const source = parsedEntryChord(current);
  const target = parsedEntryChord(next);
  const afterTarget = parsedEntryChord(following);
  if (!source || !target) return { arrow: "", span: 1 };

  const previousSource = parsedEntryChord(previous);
  if (
    previousSource &&
    afterTarget &&
    isMinorSeventhOrHalfDiminishedChord(previousSource) &&
    isDominantSeventhChord(source) &&
    resolvesAsRegularDominant(previousSource, source) &&
    isMinorSeventhOrHalfDiminishedChord(target) &&
    isDominantSeventhChord(afterTarget) &&
    resolvesAsRegularDominant(target, afterTarget) &&
    mod12(afterTarget.chroma - source.chroma) === 11
  ) {
    return { arrow: "-->", span: 2 };
  }

  if (isMinorSeventhOrHalfDiminishedChord(source) && isDominantSeventhChord(target)) {
    if (
      afterTarget &&
      !isDiminishedOrHalfDiminishedChord(afterTarget) &&
      resolvesAsSubstituteTwoFive(source, target) &&
      resolvesAsSubOrBackdoorDominant(target, afterTarget)
    ) {
      return { arrow: "[--]", span: 1 };
    }

    if (resolvesAsRegularDominant(source, target)) {
      return { arrow: "[]", span: 1 };
    }
  }

  if (isDominantSeventhChord(source) && !isDiminishedOrHalfDiminishedChord(target)) {
    if (resolvesAsRegularDominant(source, target)) return { arrow: "->", span: 1 };
    if (resolvesAsSubOrBackdoorDominant(source, target)) return { arrow: "-->", span: 1 };
  }

  return { arrow: "", span: 1 };
}

function applyAutomaticConnectors(entries = filledChordSlots(), measures = allMeasures()) {
  if (!window.TonalAnalysis) return false;

  let changed = false;
  measures.forEach(measure => {
    (measure.slots || []).forEach(slot => {
      if (slot.arrow || connectorSpanValue(slot.arrowSpan) !== 1) {
        slot.arrow = "";
        slot.arrowSpan = 1;
        changed = true;
      }
    });
  });

  entries.forEach((entry, index) => {
    const connector = automaticConnectorStateForEntries(entry, entries[index + 1], entries[index + 2], entries[index - 1]);
    if (
      entry.slot &&
      (entry.slot.arrow !== connector.arrow || connectorSpanValue(entry.slot.arrowSpan) !== connector.span)
    ) {
      entry.slot.arrow = connector.arrow;
      entry.slot.arrowSpan = connector.span;
      changed = true;
    }
  });

  return changed;
}

function keyNameForOriginChroma(chroma) {
  const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  return names[mod12(chroma)] || "C";
}

function originScaleContextFromMode(parsed, mode) {
  if (!parsed || !mode) return null;

  const normalizedMode = String(mode || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const modeMaps = [
    {
      scaleType: "major",
      modes: [
        ["Jonico", 0],
        ["Dorico", 2],
        ["Frigio", 4],
        ["Lidio", 5],
        ["Mixolidio", 7],
        ["Eolico", 9],
        ["Locrio", 11]
      ]
    },
    {
      scaleType: "harmonicMajor",
      modes: [
        ["Jonico b6", 0],
        ["Locrio #2#6", 2],
        ["Mixo b2#2b6 no 4", 4],
        ["Dorico #4#7", 5],
        ["Mixolidio b2", 7],
        ["Lidio aumentado #2", 8],
        ["Locrio b7", 11]
      ]
    },
    {
      scaleType: "harmonicMinor",
      modes: [
        ["Eolico #7", 0],
        ["Locrio #6", 2],
        ["Jonico aumentado", 3],
        ["Dorico #4", 5],
        ["Mixo b2b6", 7],
        ["Lidio #2", 8],
        ["Locrio b4b7", 11]
      ]
    },
    {
      scaleType: "melodicMinor",
      modes: [
        ["Dorico #7", 0],
        ["Dorico b2", 2],
        ["Lidio aumentado", 3],
        ["Lidio dominante", 5],
        ["Mixolidio b6", 7],
        ["Locrio #2", 9],
        ["Mixo alterado", 11]
      ]
    }
  ];

  for (const map of modeMaps) {
    const found = map.modes.find(([name]) => name === normalizedMode);
    if (!found) continue;
    return {
      key: keyNameForOriginChroma(parsed.chroma - found[1]),
      scaleType: map.scaleType
    };
  }

  return null;
}

function isHalfDiminishedParsed(parsed) {
  return parsed?.suffix === "m7b5";
}

function isMinorFamilyParsed(parsed) {
  const suffix = parsed?.suffix || "";
  return /^m/.test(suffix) && !isHalfDiminishedParsed(parsed);
}

function dominantOriginScaleType(dominantParsed, targetParsed, previousParsed) {
  const suffix = dominantParsed?.suffix || "";
  if (isHalfDiminishedParsed(previousParsed)) return "harmonicMinor";
  if (
    isMinorSeventhOrHalfDiminishedChord(previousParsed) &&
    !isHalfDiminishedParsed(previousParsed) &&
    resolvesAsRegularDominant(previousParsed, dominantParsed)
  ) {
    if (/13b9|b9/.test(suffix)) return "harmonicMajor";
    return "major";
  }
  if (isMinorFamilyParsed(targetParsed)) return "harmonicMinor";
  if (/alt|#9|b9b13|b9#5|#5/.test(suffix)) return "harmonicMinor";
  if (/13b9|b9/.test(suffix)) return isMinorFamilyParsed(targetParsed) ? "harmonicMinor" : "harmonicMajor";
  if (/b13/.test(suffix)) return "melodicMinor";
  return "major";
}

function resultOriginScaleForDominant(parsed, result) {
  if (!isDominantSeventhChord(parsed) || !result?.key || !result.scaleType) return "";
  const degree = String(result.degree || "");
  if (!/^V/.test(degree) || /sub|bck\.dr/.test(degree)) return "";

  const suffix = parsed.suffix || "";
  if (/alt|#9|b9b13|b9#5|#5/.test(suffix)) return "";
  if (/13b9|b9/.test(suffix) && result.scaleType === "major") {
    return originScaleLabelForContext({ key: result.key, scaleType: "harmonicMajor" });
  }
  if (/b13/.test(suffix) && result.scaleType === "major") {
    return originScaleLabelForContext({ key: result.key, scaleType: "melodicMinor" });
  }

  if (["major", "harmonicMajor", "harmonicMinor", "melodicMinor"].includes(result.scaleType)) {
    return originScaleLabelForContext({ key: result.key, scaleType: result.scaleType });
  }

  return "";
}

function explicitOriginScaleForResult(result) {
  if (!result?.originKey || !result.originScaleType) return "";
  return originScaleLabelForContext({
    key: result.originKey,
    scaleType: result.originScaleType
  });
}

function defaultOriginScaleForEntry(entry, result, nextEntry = null, previousEntry = null) {
  if (String(entry?.slot?.chord || "").trim() === "%") return "";

  const parsed = parsedEntryChord(entry);
  if (!parsed) return "";

  const nextParsed = parsedEntryChord(nextEntry);
  const previousParsed = parsedEntryChord(previousEntry);
  if (isNaturalMinorTonicOrigin(parsed, result)) {
    return originScaleLabelForContext({ key: result.key, scaleType: "naturalMinor" });
  }

  const explicitOriginScale = explicitOriginScaleForResult(result);
  if (explicitOriginScale) return explicitOriginScale;

  if (isDiminishedOrHalfDiminishedChord(parsed) && !isHalfDiminishedParsed(parsed)) return "";

  const modeContext = originScaleContextFromMode(parsed, result?.mode || entry?.slot?.mode || "");
  const suffix = parsed.suffix || "";
  if (modeContext && (modeContext.scaleType === "melodicMinor" || /b9b13|b9#5|#5/.test(suffix))) {
    return originScaleLabelForContext(modeContext);
  }

  const dominantResultLabel = resultOriginScaleForDominant(parsed, result);
  if (dominantResultLabel) return dominantResultLabel;

  if (
    isDominantSeventhChord(parsed) &&
    nextParsed &&
    !isDiminishedOrHalfDiminishedChord(nextParsed) &&
    resolvesAsRegularDominant(parsed, nextParsed)
  ) {
    return originScaleLabelForContext({
      key: keyNameForOriginChroma(nextParsed.chroma),
      scaleType: dominantOriginScaleType(parsed, nextParsed, previousParsed)
    });
  }

  if (modeContext) return originScaleLabelForContext(modeContext);

  const resultLabel = originScaleLabelForContext(result);
  if (resultLabel) return resultLabel;

  return "";
}

function isNaturalMinorTonicOrigin(parsed, result) {
  const suffix = parsed?.suffix || "";
  return !!(
    parsed &&
    result?.key &&
    parsed.root === result.key &&
    /^I(?!I|V)/.test(result.degree || "") &&
    /^m(?:$|7|9|11|13)/.test(suffix) &&
    !/^m(?:6|69|∆|maj)/.test(suffix) &&
    normalizeAnalysisSymbolForComparison(result.mode || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase() === "eolico"
  );
}

function degreeSlashTarget(degree) {
  const match = String(degree || "").match(/\/([A-Z]+)$/);
  return match ? match[1] : "";
}

function shouldShareOriginScaleAsTwoFive(currentResult, dominantResult) {
  const currentDegree = String(currentResult?.degree || "");
  const dominantDegree = String(dominantResult?.degree || "");
  if (!currentResult?.key || !dominantResult?.key) return false;
  if (currentResult.key !== dominantResult.key || currentResult.scaleType !== dominantResult.scaleType) return false;
  if (/sub|bck\.dr/.test(currentDegree) || /sub|bck\.dr/.test(dominantDegree)) return false;
  if (!/^II(?!I)/.test(currentDegree) || !/^V/.test(dominantDegree)) return false;
  return degreeSlashTarget(currentDegree) === degreeSlashTarget(dominantDegree);
}

function originScaleLabelsForAnalysis(entries, results) {
  const labels = entries.map((entry, index) =>
    defaultOriginScaleForEntry(entry, results[index], entries[index + 1], entries[index - 1])
  );

  entries.forEach((entry, index) => {
    const currentParsed = parsedEntryChord(entry);
    const dominantEntry = entries[index + 1];
    const dominantParsed = parsedEntryChord(dominantEntry);
    if (!isMinorSeventhOrHalfDiminishedChord(currentParsed) || !isDominantSeventhChord(dominantParsed)) return;
    if (!resolvesAsRegularDominant(currentParsed, dominantParsed)) return;
    if (!shouldShareOriginScaleAsTwoFive(results[index], results[index + 1])) return;

    const followingParsed = parsedEntryChord(entries[index + 2]);
    const label = originScaleLabelForContext({
      key: keyNameForOriginChroma(dominantParsed.chroma + 5),
      scaleType: dominantOriginScaleType(dominantParsed, followingParsed, currentParsed)
    });
    if (!label) return;

    const dominantModeContext = originScaleContextFromMode(
      dominantParsed,
      results[index + 1]?.mode || dominantEntry?.slot?.mode || ""
    );
    labels[index] = label;
    labels[index + 1] = dominantModeContext?.scaleType === "melodicMinor"
      ? originScaleLabelForContext(dominantModeContext)
      : label;
  });

  return labels;
}

function contextualResultsForCurrentSlots(entries, automaticResults) {
  return entries.map((entry, index) => {
    const result = { ...(automaticResults[index] || {}) };
    const sectionContext = activeSectionContextForEntry(entries, index);
    if (sectionContext) {
      result.key = sectionContext.key;
      result.scaleType = sectionContext.scaleType;
    }
    if (entry.slot?.degree) result.degree = entry.slot.degree;
    if (entry.slot?.mode) result.mode = entry.slot.mode;
    return result;
  });
}

function updateOriginScalesFromCurrentAnalysis(overwrite = true) {
  if (!window.TonalAnalysis) return false;

  const entries = filledChordSlots();
  if (!entries.length) return false;

  const automaticResults = window.TonalAnalysis.analyzeProgression(
    entries.map(entry => entry.analysisChord || entry.slot.chord)
  );
  const results = contextualResultsForCurrentSlots(entries, automaticResults);
  const originLabels = originScaleLabelsForAnalysis(entries, results);
  let changed = false;

  entries.forEach((entry, index) => {
    if (isManualAnalysisFieldLocked(entry.slot, "originScale")) return;
    if (isRepeatMeasure(entry.measure) && String(entry.slot?.chord || "").trim() !== "%") return;
    const nextValue = String(entry.slot?.chord || "").trim() === "%" ? "" : (originLabels[index] || "");
    const currentValue = String(entry.slot.originScale || "").trim();
    const canRefreshOriginScale = overwrite || !currentValue || isStandardOriginScaleLabel(currentValue);
    if (canRefreshOriginScale && entry.slot.originScale !== nextValue) {
      entry.slot.originScale = nextValue;
      changed = true;
    }
  });

  return changed;
}

function autoAnalyzeCurrentSong(overwrite, options = {}) {
  const shouldConfirm = options.confirm !== false;
  const shouldAlert = options.alert !== false;
  const shouldMarkDirty = options.markDirty !== false;
  const shouldRender = options.render !== false;

  if (!window.TonalAnalysis) {
    if (shouldAlert) alert("No se pudo cargar el motor de analisis tonal.");
    return false;
  }

  const entries = filledChordSlots();
  if (!entries.length) {
    if (overwrite && shouldAlert) alert("No hay acordes para analizar.");
    return false;
  }

  if (overwrite && shouldConfirm && !confirm("Esto rellenara modos, grados, tonalidades de seccion y escalas de origen segun el analisis tonal automatico.\n\nPuede reemplazar modos, grados y escalas ya escritos. Las tonalidades van en su propio campo editable.\n\nNo tocara acordes, barras, conectores, paginas ni apariencia.\n\nQuieres continuar?")) {
    return false;
  }

  if (overwrite) {
    clearHiddenAnalysisEditMarkers();
    clearManualAnalysisLocks();
  }

  const results = window.TonalAnalysis.analyzeProgression(entries.map(entry => entry.analysisChord || entry.slot.chord));
  const originLabels = originScaleLabelsForAnalysis(entries, results);
  let changed = clearAutoSectionLabels();

  entries.forEach((entry, index) => {
    const result = results[index];
    if (!result) return;
    const isRepeat = isRepeatMeasure(entry.measure);

    if (isRepeat) {
      if (String(entry.slot.chord || "").trim() === "%") {
        if (!isManualAnalysisFieldLocked(entry.slot, "degree") && entry.slot.degree !== "%") {
          entry.slot.degree = "%";
          changed = true;
        }
        if (!isManualAnalysisFieldLocked(entry.slot, "mode") && entry.slot.mode !== "") {
          entry.slot.mode = "";
          changed = true;
        }
        if (!isManualAnalysisFieldLocked(entry.slot, "originScale") && entry.slot.originScale !== "") {
          entry.slot.originScale = "";
          changed = true;
        }
      }
      return;
    }

    if (!isManualAnalysisFieldLocked(entry.slot, "degree") && result.degree && (overwrite || isRepeat || !entry.slot.degree)) {
      entry.slot.degree = result.degree;
      changed = true;
    }

    if (!isManualAnalysisFieldLocked(entry.slot, "mode") && result.mode && (overwrite || isRepeat || !entry.slot.mode)) {
      entry.slot.mode = result.mode;
      changed = true;
    }

    const nextOriginScale = originLabels[index] || "";
    if (!isManualAnalysisFieldLocked(entry.slot, "originScale") && (overwrite || !entry.slot.originScale) && entry.slot.originScale !== nextOriginScale) {
      entry.slot.originScale = nextOriginScale;
      changed = true;
    }

    if (result.sectionStart && result.sectionLabel) {
      changed = setAutoSectionLabelAtEntry(entries, index, result.sectionLabel) || changed;
    }
  });

  changed = applyAutomaticConnectors(entries) || changed;

  if (changed) {
    if (shouldMarkDirty) setDirty(true);
    if (shouldRender) renderAll(false);
  } else if (overwrite && shouldAlert) {
    alert("No se encontraron cambios nuevos para aplicar.");
  }

  return changed;
}

function isAutoSectionNote(value) {
  const normalized = normalizeSectionLabelInput(value || "");
  return /^[A-G](?:b|#)?m?:\s*\[$/.test(normalized);
}

function migrateAutoSectionNote(measure) {
  if (!measure) return measure;
  if (isAutoSectionNote(measure.note)) {
    if (!String(measure.sectionLabel || "").trim()) {
      measure.sectionLabel = String(measure.note || "").trim();
    }
    measure.note = "";
  }
  return measure;
}

function canWriteSectionLabel(measure) {
  if (isManualMeasureAnalysisFieldLocked(measure, "sectionLabel")) return false;
  return !String(measure?.sectionLabel || "").trim() || isAutoSectionNote(measure.sectionLabel);
}

function clearAutoSectionLabels() {
  let changed = false;
  (song.pages || []).forEach(page => {
    (page.measures || []).forEach(measure => {
      migrateAutoSectionNote(measure);
      if (!isManualMeasureAnalysisFieldLocked(measure, "sectionLabel") && isAutoSectionNote(measure.sectionLabel)) {
        measure.sectionLabel = "";
        changed = true;
      }
      if (isAutoSectionNote(measure.note)) {
        measure.note = "";
        changed = true;
      }
      (measure.slots || []).forEach(slot => {
        if (!isManualAnalysisFieldLocked(slot, "sectionLabel") && isAutoSectionNote(slot.sectionLabel)) {
          slot.sectionLabel = "";
          changed = true;
        }
      });
    });
  });
  return changed;
}

function clearFieldOptions() {
  function clearHiddenEdit(slot, field) {
    if (!slot?._hiddenAnalysisEdits) return;
    delete slot._hiddenAnalysisEdits[field];
    if (!Object.keys(slot._hiddenAnalysisEdits).length) {
      delete slot._hiddenAnalysisEdits;
    }
  }

  function clearSlotAnalysis(slot, includeChord = false) {
    if (!slot) return;
    if (includeChord) {
      slot.chord = "";
      slot.chordFixed = false;
    }
    slot.degree = "";
    slot.mode = "";
    slot.sectionLabel = "";
    slot.originScale = "";
    slot.arrow = "";
    slot.arrowSpan = 1;
    delete slot._hiddenAnalysisEdits;
    delete slot._connectorEditedWhileHidden;
    delete slot.manualAnalysisFields;
  }

  return {
    analisis: {
      label: "análisis oculto en modo asistido",
      apply() {}
    },
    acordes: {
      label: "acordes",
      apply(measure) {
        (measure.slots || []).forEach(slot => clearSlotAnalysis(slot, true));
      }
    },
    grados: {
      label: "grados",
      apply(measure) {
        (measure.slots || []).forEach(slot => {
          slot.degree = "";
          clearHiddenEdit(slot, "degree");
          clearManualAnalysisField(slot, "degree");
        });
      }
    },
    modos: {
      label: "modos",
      apply(measure) {
        (measure.slots || []).forEach(slot => {
          slot.mode = "";
          clearHiddenEdit(slot, "mode");
          clearManualAnalysisField(slot, "mode");
        });
      }
    },
    escalas: {
      label: "escalas de origen",
      apply(measure) {
        (measure.slots || []).forEach(slot => {
          slot.originScale = "";
          clearHiddenEdit(slot, "originScale");
          clearManualAnalysisField(slot, "originScale");
        });
      }
    },
    tonalidades: {
      label: "tonalidades",
      apply(measure) {
        measure.sectionLabel = "";
        measure._hiddenAnalysisEdits && delete measure._hiddenAnalysisEdits.sectionLabel;
        clearManualMeasureAnalysisField(measure, "sectionLabel");
        (measure.slots || []).forEach(slot => {
          slot.sectionLabel = "";
          clearHiddenEdit(slot, "sectionLabel");
          clearManualAnalysisField(slot, "sectionLabel");
        });
      }
    },
    conectores: {
      label: "conectores",
      apply(measure) {
        (measure.slots || []).forEach(slot => {
          slot.arrow = "";
          slot.arrowSpan = 1;
          delete slot._connectorEditedWhileHidden;
        });
      }
    }
  };
}

function normalizedClearFieldKey(value) {
  const key = normalizeTextSymbols(value || "").trim().toLowerCase();
  const aliases = {
    "": "analisis",
    todo: "analisis",
    análisis: "analisis",
    "analisis completo": "analisis",
    "análisis completo": "analisis",
    texto: "escalas",
    origen: "escalas",
    "escala de origen": "escalas",
    "escalas de origen": "escalas"
  };
  return aliases[key] || key;
}

function openClearFieldsDialog() {
  if (!els.clearFieldsDialog || !els.clearFieldsSelect) {
    clearCurrentAnalysisFields("analisis");
    return;
  }

  els.clearFieldsSelect.value = "analisis";
  els.clearFieldsDialog.showModal();
  requestAnimationFrame(() => els.clearFieldsSelect?.focus());
}

function clearFieldsFromDialog() {
  const key = els.clearFieldsSelect?.value || "analisis";
  if (clearCurrentAnalysisFields(key)) {
    els.clearFieldsDialog?.close();
  }
}

function clearCurrentAnalysisFields(choice = "analisis") {
  const options = clearFieldOptions();
  const key = normalizedClearFieldKey(choice);

  const option = options[key];
  if (!option) {
    alert("No se limpió nada.\n\nElige una opción válida.");
    return false;
  }

  if (key === "analisis") {
    assistanceMode = "assisted";
    analysisVisibility = "hidden";
    clearHiddenAnalysisEditMarkers();
    updateAssistanceModeControls();
    updateAnalysisVisibilityControls();
  } else {
    (song.pages || []).forEach(page => {
      (page.measures || []).forEach(measure => option.apply(measure));
    });
  }

  setDirty(true);
  renderAll();
  if (els.status) {
    els.status.textContent = `Limpio: ${option.label}`;
  }
  return true;
}

function allMeasures() {
  return (song.pages || []).flatMap(page => page.measures || []);
}

function hasManualFormMarks(measures) {
  return measures.some(measure =>
    String(measure?.form || "").trim() && measure._autoForm !== true
  );
}

function maybeAutoDetectFormFromBar(value, options = {}) {
  if (!isSectionBreakBar(value)) return false;
  const measures = allMeasures();
  if (!measures.length) return false;
  if (hasManualFormMarks(measures)) return false;
  if (options.force) {
    clearFormMarks(measures);
  }
  applyDetectedFormMarks(measures);
  return true;
}

function clearFormMarks(measures) {
  measures.forEach(measure => {
    measure.form = "";
    delete measure._autoForm;
  });
}

function applySectionFormMarks(measures, labels, sectionLength) {
  clearFormMarks(measures);
  labels.forEach((label, index) => {
    const measure = measures[index * sectionLength];
    if (measure) {
      measure.form = label;
      measure._autoForm = true;
    }
  });
}

async function loadCuratedStandardState(filename) {
  try {
    const res = await fetch(`/api/curated-standards/${encodeURIComponent(filename)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

async function loadCuratedBluesStudy(key) {
  const filename = bluesStandardFilename(key);
  const state = await loadCuratedStandardState(filename);
  if (!state) return false;

  await applyAppState(state, false);
  currentFilename = null;
  currentStandardFilename = filename;
  currentStandardSource = null;
  updateStandardSaveControls();
  selected = { page: 0, measure: 0 };
  selectedSlot = 0;
  evaluationIssues.clear();
  rememberLastOpenDocument({ source: "curated", filename, state });
  setDirty(false);
  renderAll();
  resetHistory();
  return true;
}

async function loadBluesStudy(key) {
  if (dirty && !confirm("Hay cambios sin guardar.\n\nEsto cargara una progresion completa nueva y reemplazara el analisis actual.\n\nQuieres continuar?")) {
    return;
  }

  if (await loadCuratedBluesStudy(key)) return;

  song = makeBluesStudySong(key, song?.settings || DEFAULT_SETTINGS);
  autoAnalyzeCurrentSong(true, { confirm: false, alert: false, markDirty: false, render: false });
  currentFilename = null;
  currentStandardFilename = bluesStandardFilename(key);
  currentStandardSource = null;
  updateStandardSaveControls();
  selected = { page: 0, measure: 0 };
  selectedSlot = 0;
  evaluationIssues.clear();
  setDirty(false);
  renderAll();
  resetHistory();
}

async function loadBluesStudyFromLibrary(key) {
  if (await loadCuratedBluesStudy(key)) return;

  song = makeBluesStudySong(key, song?.settings || DEFAULT_SETTINGS);
  autoAnalyzeCurrentSong(true, { confirm: false, alert: false, markDirty: false, render: false });
  currentFilename = null;
  currentStandardFilename = bluesStandardFilename(key);
  currentStandardSource = null;
  updateStandardSaveControls();
  selected = { page: 0, measure: 0 };
  selectedSlot = 0;
  evaluationIssues.clear();
  setDirty(false);
  renderAll();
  resetHistory();
}

async function confirmAdminAction(action) {
  if (!(await requireAdminAccess(action))) return false;

  return askConfirmation({
    title: "Modo administrador",
    message: `${action}\n\nEsta accion debe usarla solo un administrador con experiencia. Puede cambiar ejemplos del motor, temas precargados o la apariencia predeterminada de la app.`,
    confirmText: "Continuar"
  });
}

async function requireAdminAccess(action = "Accion administrativa.") {
  const key = await askTextInput({
    title: "Clave de administrador",
    message: action,
    defaultValue: "",
    password: true,
    confirmText: "Continuar"
  });
  if (key === null) return false;

  if (key === ADMIN_ACCESS_KEY) {
    return true;
  }

  alert("Clave incorrecta.\n\nNo se ejecutó la acción administrativa.");
  return false;
}

async function openAdminAppearancePanel() {
  if (!(await requireAdminAccess("Abrir controles completos de apariencia."))) return;

  els.settingsPanel.classList.remove("closed");
  document.body.classList.add("settingsOpen");
  placeSettingsPanel();
  setTimeout(() => els.settingsSearchInput?.focus(), 80);
  updateStatus("Controles completos de apariencia abiertos.");
}

async function refreshAdminThemes() {
  if (!els.adminThemeSelect) return;

  try {
    const res = await fetch("/api/admin/themes");
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderAdminThemeOptions(data.themes || []);
  } catch (_) {
    renderAdminThemeOptions([]);
  }
}

function renderAdminThemeOptions(themes) {
  if (!els.adminThemeSelect) return;
  els.adminThemeSelect.innerHTML = `<option value="">Elegir tema</option>`;
  themes.forEach(theme => {
    const option = document.createElement("option");
    option.value = theme.filename;
    option.textContent = theme.title || theme.filename;
    els.adminThemeSelect.appendChild(option);
  });
}

async function saveCurrentAsAdminTheme() {
  if (!(await confirmAdminAction("Se grabara el analisis actual como standard curado ATA, disponible en la Biblioteca junto a los standards."))) return;

  const defaultName = song.title || "standard-curado";
  const requestedName = await askTextInput({
    title: "Standard curado",
    message: "Nombre del standard curado:",
    defaultValue: defaultName,
    confirmText: "Guardar"
  });
  if (requestedName === null) return;

  try {
    const state = captureAppState();
    const res = await fetch("/api/curated-standards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: requestedName,
        sourceFilename: "",
        state
      })
    });

    if (!res.ok) throw new Error();
    const data = await res.json();
    currentFilename = null;
    currentStandardFilename = data.filename;
    currentStandardSource = null;
    rememberLastOpenDocument({ source: "curated", filename: data.filename, state: data.state || state });
    updateStandardSaveControls();
    setDirty(false);
    resetHistory();
    await refreshStandards();
    alert(`Standard curado guardado.\n\nArchivo: ${data.filename}\n\nQueda disponible en Biblioteca > Standards.`);
  } catch (error) {
    console.warn(error);
    alert("No se pudo grabar el standard curado.\n\nRevisa que la app este corriendo con el servidor local y vuelve a intentar.");
  }
}

async function loadAdminTheme(filename) {
  if (!(await confirmAdminAction("Se cargara un tema administrativo y reemplazara el analisis actual en pantalla."))) return;
  if (dirty && !confirm("Hay cambios sin guardar.\n\nCargar este tema administrativo reemplazara lo que tienes en pantalla.\n\nQuieres continuar?")) return;

  try {
    const res = await fetch(`/api/admin/themes/${encodeURIComponent(filename)}`);
    if (!res.ok) throw new Error();
    const state = await res.json();
    currentFilename = null;
    await applyAppState(state, true);
    autoAnalyzeCurrentSong(true, { confirm: false, alert: false, markDirty: false, render: false });
    resetHistory();
    setDirty(false);
    renderAll(false);
  } catch (error) {
    console.warn(error);
    alert("No se pudo cargar el tema administrativo.\n\nRevisa que exista el archivo y que el servidor local siga abierto.");
  }
}

async function loadAdminThemeFromLibrary(filename) {
  try {
    const res = await fetch(`/api/admin/themes/${encodeURIComponent(filename)}`);
    if (!res.ok) throw new Error();
    const state = await res.json();
    currentFilename = null;
    await applyAppState(state, false);
    currentStandardFilename = filename;
    currentStandardSource = null;
    updateStandardSaveControls();
    autoAnalyzeCurrentSong(true, { confirm: false, alert: false, markDirty: false, render: false });
    resetHistory();
    setDirty(false);
    renderAll(false);
  } catch (error) {
    console.warn(error);
    alert("No se pudo cargar el tema administrativo.\n\nRevisa que exista el archivo y que el servidor local siga abierto.");
  }
}

async function saveCurrentAppearanceAsAdminDefault() {
  if (!(await confirmAdminAction("Se grabara la apariencia actual como predeterminada administrativa para nuevas sesiones y nuevos analisis."))) return;

  try {
    const settings = structuredClone(song.settings || {});
    const res = await fetch("/api/admin/default-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings })
    });

    if (!res.ok) throw new Error();
    const data = await res.json();
    Object.assign(DEFAULT_SETTINGS, settings);
    alert(`Apariencia predeterminada administrativa guardada.\n\nLos nuevos analisis usaran esta apariencia como base.\n\n${data.backup ? `Respaldo anterior: ${data.backup}` : "No habia apariencia anterior para respaldar."}`);
  } catch (error) {
    console.warn(error);
    alert("No se pudo grabar la apariencia predeterminada.\n\nRevisa que la app este corriendo con el servidor local y vuelve a intentar.");
  }
}

function buildEngineExampleFromCurrentSong(name) {
  const entries = filledChordSlots();
  const chords = entries.map(entry => entry.analysisChord || entry.slot.chord).filter(Boolean);
  if (!chords.length) return null;

  const automatic = window.TonalAnalysis?.analyzeProgression?.(chords) || [];
  const results = entries.map((entry, index) => {
    const sectionContext = activeSectionContextForEntry(entries, index);
    const fallback = automatic[index] || {};
    return {
      degree: String(entry.slot.degree || fallback.degree || ""),
      mode: String(entry.slot.mode || fallback.mode || ""),
      key: sectionContext?.key || fallback.key || "",
      scaleType: sectionContext?.scaleType || fallback.scaleType || ""
    };
  });

  return {
    id: `${slugify(name)}-${Date.now()}`,
    name,
    title: song.title || "",
    chords,
    results
  };
}

async function saveCurrentAsEngineExample() {
  if (!window.TonalAnalysis?.setUserExamples) {
    alert("No se pudo acceder al motor de analisis.\n\nNo se grabo ningun ejemplo.");
    return;
  }
  if (!(await requireAdminAccess("Grabar ejemplo para el motor."))) return;
  const shouldContinue = await askConfirmation({
    title: "Grabar ejemplo para el motor",
    message: "Se grabara el analisis actual como ejemplo administrativo del motor.\n\nCuando el motor encuentre la misma progresion, usara estos grados, modos y tonalidades como referencia.\n\nEsta accion debe usarla solo un administrador con experiencia.",
    confirmText: "Grabar"
  });
  if (!shouldContinue) return;

  const defaultName = song.title || "ejemplo-motor";
  const requestedName = await askTextInput({
    title: "Ejemplo para el motor",
    message: "Nombre del ejemplo para el motor:",
    defaultValue: defaultName,
    confirmText: "Guardar"
  });
  if (requestedName === null) return;

  const example = buildEngineExampleFromCurrentSong(requestedName.trim() || defaultName);
  if (!example) {
    alert("No se grabo ningun ejemplo.\n\nEl analisis actual no tiene acordes.");
    return;
  }

  try {
    const res = await fetch("/api/admin/engine-examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ example })
    });

    if (!res.ok) throw new Error();
    const data = await res.json();
    adminEngineExamples = Array.isArray(data.examples) ? data.examples : [];
    window.TonalAnalysis.setUserExamples(adminEngineExamples);
    alert(`Ejemplo administrativo guardado en el motor.\n\nEjemplos cargados: ${adminEngineExamples.length}\n\nUsalo solo para ejemplos revisados cuidadosamente.`);
  } catch (error) {
    console.warn(error);
    alert("No se pudo grabar el ejemplo del motor.\n\nRevisa que la app este corriendo con el servidor local y vuelve a intentar.");
  }
}

function showMeasurePanel(pageIndex, measureIndex) {
  const measure = song.pages[pageIndex]?.measures?.[measureIndex];
  if (!measure) return;

  selected = { page: pageIndex, measure: measureIndex };
  els.measurePanelTitle.textContent = `Compás ${measureIndex + 1}`;

  els.measureFormInput.value = measure.form || "";
  els.measureEndingInput.value = measure.ending || "";
  els.measureJumpInput.value = measure.jump || "";
  els.measureLeftBarInput.value = measure.leftBar || "|";
  els.measureRightBarInput.value = measure.rightBar || "|";

  els.slotsEditor.innerHTML = "";
  measure.slots.forEach((slot, slotIndex) => {
    const block = document.createElement("div");
    block.className = "slotBlock simpleSlotBlock";
    block.innerHTML = `
      <div class="simpleSlotHead">
        <strong>${slotIndex + 1}</strong>
        <input data-field="chord" data-slot="${slotIndex}" value="${escapeAttr(slot.chord)}" placeholder="Acorde">
        <input data-field="degree" data-slot="${slotIndex}" value="${escapeAttr(slot.degree)}" placeholder="Grado">
      </div>
      <div class="simpleSlotExtra">
        <input data-field="mode" data-slot="${slotIndex}" value="${escapeAttr(slot.mode)}" placeholder="Modo">
        <input data-field="originScale" data-slot="${slotIndex}" value="${escapeAttr(slot.originScale)}" placeholder="Escala de origen">
        <input class="connectorInput" data-field="arrow" data-slot="${slotIndex}" value="${escapeAttr(slot.arrow)}" placeholder="Conector">
      </div>
      <div class="connectorPicker compactConnectors" data-slot-buttons="${slotIndex}">
        ${connectorButtonOptions().map(option => `
          <button
            type="button"
            class="connectorBtn ${slot.arrow === option.value ? "active" : ""}"
            data-connector-value="${escapeAttr(option.value)}"
            data-slot="${slotIndex}"
            title="${escapeAttr(option.label)}"
          >
            <span class="connectorBtnShort">${option.short}</span>
          </button>
        `).join("")}
      </div>
    `;
    block.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", () => {
        const activeMeasure = getSelectedMeasure();
        if (!activeMeasure) return;
        const field = input.dataset.field;
        const clean = field === "originScale"
          ? normalizeOriginScaleInput(input.value)
          : normalizeAccidentals(input.value);
        const slotNumber = Number(input.dataset.slot);
        if (field === "chord") {
          setChordValueFromContext(activeMeasure, slotNumber, clean, { chordFixed: true });
        } else {
          activeMeasure.slots[slotNumber][field] = clean;
          if (field === "arrow") activeMeasure.slots[slotNumber].arrowSpan = 1;
        }
        if (input.value !== clean) input.value = clean;
        if (field === "chord") {
          autoAnalyzeCurrentSong(false);
        } else if (assistanceMode === "assisted" && ["degree", "mode"].includes(field)) {
          updateOriginScalesFromCurrentAnalysis(true);
        }
        setDirty(true);
        renderAll(false);
      });
    });
    block.querySelectorAll(".connectorBtn").forEach(button => {
      button.addEventListener("click", () => {
        const activeMeasure = getSelectedMeasure();
        if (!activeMeasure) return;
        const slotNumber = Number(button.dataset.slot);
        const value = button.dataset.connectorValue || "";
        activeMeasure.slots[slotNumber].arrow = value;
        activeMeasure.slots[slotNumber].arrowSpan = 1;
        const connectorInput = block.querySelector(`input[data-field="arrow"][data-slot="${slotNumber}"]`);
        if (connectorInput) connectorInput.value = value;
        setDirty(true);
        renderAll(false);
        showMeasurePanel(selected.page, selected.measure);
      });
    });
    els.slotsEditor.appendChild(block);
  });

  els.measurePanel.classList.remove("hidden");
  placeMeasurePanel(pageIndex, measureIndex);
}

function updateMeasurePanelIfOpen() {
  if (els.measurePanel.classList.contains("hidden")) return;
  const measure = getSelectedMeasure();
  if (!measure) {
    els.measurePanel.classList.add("hidden");
    return;
  }
  // No reconstruimos si el usuario está escribiendo dentro del panel.
  if (els.measurePanel.contains(document.activeElement)) return;
  showMeasurePanel(selected.page, selected.measure);
}

function getSelectedMeasure() {
  return song.pages[selected.page]?.measures?.[selected.measure];
}

function hasSlotContent(slot) {
  return !!(slot?.chord || slot?.mode || slot?.degree || slot?.sectionLabel || slot?.originScale);
}

function compactSlots(slots) {
  const filled = slots.filter(hasSlotContent).map(slot => ({ ...slot }));
  while (filled.length < 4) filled.push({ chord: "", mode: "", degree: "", sectionLabel: "", originScale: "", arrow: "", arrowSpan: 1 });
  return filled.slice(0, 4);
}

function barClass(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "||" || v === "doble" || v === "double") return "double";
  if (v === "|||" || v === "final" || v === "fin") return "final";
  if (v === "|:" || v === "inicio" || v === "start") return "repeatStart";
  if (v === ":|" || v === ":||" || v === "finrep" || v === "end") return "repeatEnd";
  return "single";
}

function connectorClass(value) {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (v === "->" || v === "→" || v === "arrow" || v === "curva") return "curveSolid";
  if (v === "-->" || v === "arrow-dashed" || v === "curva--" || v === "curva punteada") return "curveDashed";
  if (v === "[]" || v === "br" || v === "bracket" || v === "corchete") return "bracketSolid";
  if (v === "[--]" || v === "br--" || v === "bracket-dashed" || v === "corchete--" || v === "corchete punteado") return "bracketDashed";
  return "";
}

function connectorButtonOptions() {
  return [
    { value: "", label: "Sin conector", short: "∅" },
    { value: "->", label: "Flecha curva", short: "↗→" },
    { value: "-->", label: "Flecha curva punteada", short: "↗⇢" },
    { value: "[]", label: "Corchete", short: "└─┘" },
    { value: "[--]", label: "Corchete punteado", short: "└┄┘" }
  ];
}

function estimateTextWidth(text, size, fontFamily) {
  const value = String(text || "");
  if (!value) return 0;
  let factor = 0.56;
  if (/Georgia|Times/i.test(fontFamily || "")) factor = 0.50;
  if (/Trebuchet|Arial/i.test(fontFamily || "")) factor = 0.58;
  // Algunos símbolos musicales se dibujan más estrechos que las letras.
  const adjusted = value
    .replace(/[♭#Δ°øø/]/g, "i")
    .replace(/[MW]/g, "WW");
  return adjusted.length * Number(size || 12) * factor + 4;
}

function applyCase(value, mode) {
  return mode === "upper" ? String(value || "").toUpperCase() : String(value || "");
}

function svgEl(name, attrs) {
  const el = document.createElementNS(NS, name);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    el.setAttribute(key, String(value));
  });
  return el;
}

function textEl(value, attrs) {
  const el = svgEl("text", attrs);
  el.textContent = value || "";
  return el;
}



async function scanSystemFonts() {
  if (!("queryLocalFonts" in window)) {
    if (els.systemFontsStatus) els.systemFontsStatus.textContent = "queryLocalFonts() no está disponible en este navegador.";
    alert("Tu navegador no permite listar fuentes locales desde una app web. Usa Chrome o Edge actualizado en escritorio. También revisa que estés en http://localhost, no abriendo el HTML con file://.");
    return;
  }

  try {
    if (els.systemFontsStatus) els.systemFontsStatus.textContent = "Solicitando permiso…";
    const fonts = await window.queryLocalFonts();

    const map = new Map();
    fonts.forEach(font => {
      const family = font.family || font.fullName || font.postscriptName;
      if (!family) return;

      const key = family.toLowerCase();
      const existing = map.get(key) || {
        family,
        cssFamily: quoteCssFamily(family),
        faces: [],
        count: 0
      };

      existing.count += 1;
      existing.faces.push({
        fullName: font.fullName || "",
        postscriptName: font.postscriptName || "",
        style: font.style || ""
      });

      map.set(key, existing);
    });

    song.settings.systemFonts = Array.from(map.values())
      .sort((a, b) => a.family.localeCompare(b.family, undefined, { sensitivity: "base" }));

    renderSettingsForm();
    renderLocalFontsList();
    syncSettingsFormValues();

    if (els.systemFontsStatus) {
      els.systemFontsStatus.textContent = `${song.settings.systemFonts.length} familias cargadas del sistema.`;
    }

    setDirty(true);
  } catch (error) {
    console.warn(error);
    if (els.systemFontsStatus) els.systemFontsStatus.textContent = "Permiso denegado o lectura cancelada.";
    alert("No se pudieron leer las fuentes del sistema. El navegador puede haber bloqueado el permiso local-fonts.");
  }
}

function clearSystemFonts() {
  song.settings.systemFonts = [];

  ["titleFont", "composerFont", "chordFont", "modeFont", "degreeFont"].forEach(key => {
    const value = song.settings[key];
    const wasSystemFont = !FONT_OPTIONS.some(opt => opt.value === value)
      && !(song.settings.localFonts || []).some(font => safeCssFamilyValue(font.cssFamily, font.name) === value);

    if (wasSystemFont) {
      song.settings[key] = DEFAULT_SETTINGS[key];
    }
  });

  renderSettingsForm();
  renderLocalFontsList();
  syncSettingsFormValues();
  setDirty(true);
  renderAll(false);
}

async function importLocalFonts(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  song.settings.localFonts = Array.isArray(song.settings.localFonts) ? song.settings.localFonts : [];

  for (const file of files) {
    const dataUrl = await readFileAsDataURL(file);
    const name = localFontNameFromFile(file.name);
    const existingIndex = song.settings.localFonts.findIndex(font => font.name === name);

    const item = {
      name,
      cssFamily: quoteCssFamily(name),
      fileName: file.name,
      dataUrl
    };

    if (existingIndex >= 0) {
      song.settings.localFonts[existingIndex] = item;
    } else {
      song.settings.localFonts.push(item);
    }
  }

  event.target.value = "";
  await registerLocalFonts();
  renderSettingsForm();
  renderLocalFontsList();
  syncSettingsFormValues();
  setDirty(true);
  renderAll(false);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderLocalFontsList() {
  if (!els.localFontsList) return;
  const fonts = Array.isArray(song.settings.localFonts) ? song.settings.localFonts : [];
  const systemFonts = Array.isArray(song.settings.systemFonts) ? song.settings.systemFonts : [];

  if (els.systemFontsStatus && systemFonts.length && !els.systemFontsStatus.textContent) {
    els.systemFontsStatus.textContent = `${systemFonts.length} familias cargadas del sistema.`;
  }

  els.localFontsList.innerHTML = "";

  if (systemFonts.length) {
    const sys = document.createElement("div");
    sys.className = "systemFontSummary";
    sys.innerHTML = `
      <div><strong>${systemFonts.length}</strong> familias del sistema disponibles en los selectores.</div>
      <button type="button">Limpiar lista</button>
    `;
    sys.querySelector("button").addEventListener("click", clearSystemFonts);
    els.localFontsList.appendChild(sys);
  }

  if (!fonts.length) {
    const empty = document.createElement("div");
    empty.className = "localFontEmpty";
    empty.textContent = systemFonts.length ? "No hay archivos de fuente importados manualmente." : "No hay fuentes cargadas.";
    els.localFontsList.appendChild(empty);
    return;
  }

  fonts.forEach((font, index) => {
    const row = document.createElement("div");
    row.className = "localFontRow";
    const cssFamily = safeCssFamilyValue(font.cssFamily, font.name);
    row.innerHTML = `
      <div>
        <strong style="font-family: ${cssFamily}">${escapeHtml(font.name)}</strong>
        <span>${escapeHtml(font.fileName || "")}</span>
      </div>
      <button data-index="${index}" type="button">Quitar</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      removeLocalFont(index);
    });
    els.localFontsList.appendChild(row);
  });
}

function removeLocalFont(index) {
  const fonts = Array.isArray(song.settings.localFonts) ? song.settings.localFonts : [];
  const removed = fonts[index];
  if (!removed) return;

  song.settings.localFonts.splice(index, 1);

  const removedFamily = safeCssFamilyValue(removed.cssFamily, removed.name);
  ["titleFont", "composerFont", "chordFont", "modeFont", "degreeFont"].forEach(key => {
    if (song.settings[key] === removedFamily) {
      song.settings[key] = DEFAULT_SETTINGS[key];
    }
  });

  renderSettingsForm();
  renderLocalFontsList();
  syncSettingsFormValues();
  setDirty(true);
  renderAll(false);
}

function saveLocalStorageBackup(keySuffix, payload) {
  try {
    localStorage.setItem(`analizador-armonico:backup:${keySuffix}`, JSON.stringify(payload));
  } catch (error) {
    console.warn("No se pudo guardar respaldo local.", error);
  }
}

function rememberLastOpenDocument(payload) {
  try {
    localStorage.setItem(LAST_OPEN_DOCUMENT_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      ...payload
    }));
  } catch (error) {
    console.warn("No se pudo recordar el ultimo archivo abierto.", error);
  }
}

async function restoreLastOpenDocument() {
  let saved = null;

  try {
    saved = JSON.parse(localStorage.getItem(LAST_OPEN_DOCUMENT_KEY) || "null");
  } catch (_) {
    return false;
  }

  if (!saved) return false;

  try {
    let state = saved.state || null;

    if (saved.source === "library" && saved.filename) {
      const res = await fetch(`/api/songs/${encodeURIComponent(saved.filename)}`);
      if (res.ok) {
        state = await res.json();
        currentFilename = saved.filename;
        currentStandardFilename = null;
      }
    } else if (saved.source === "curated" && saved.filename) {
      const res = await fetch(`/api/curated-standards/${encodeURIComponent(saved.filename)}`);
      if (res.ok) {
        state = await res.json();
        currentFilename = null;
        currentStandardFilename = saved.filename;
      }
    }

    if (!state) return false;

    await applyAppState(state, false);
    if (saved.source === "library" && saved.filename) {
      currentFilename = saved.filename;
      clearCurrentStandardSource();
    } else if (saved.source === "curated" && saved.filename) {
      currentFilename = null;
      currentStandardFilename = saved.filename;
      currentStandardSource = null;
      updateStandardSaveControls();
    }
    setDirty(false);
    return true;
  } catch (error) {
    console.warn("No se pudo restaurar el ultimo archivo abierto.", error);
    return false;
  }
}

async function backupBeforeLibrarySave(state) {
  const filename = currentFilename || `${slugify(song.title)}.json`;
  const backedUpAt = new Date().toISOString();

  saveLocalStorageBackup("before-save-current", {
    filename,
    backedUpAt,
    state
  });

  if (!currentFilename) return;

  try {
    const res = await fetch(`/api/songs/${encodeURIComponent(currentFilename)}`);
    if (!res.ok) return;
    const previousState = await res.json();
    saveLocalStorageBackup(`library:${currentFilename}`, {
      filename: currentFilename,
      backedUpAt,
      state: previousState
    });
  } catch (error) {
    console.warn("No se pudo leer el estado anterior de biblioteca.", error);
  }
}

async function saveCurrentDocument() {
  const inferredStandardFilename = inferCurrentBuiltInBluesFilename();
  if (inferredStandardFilename) {
    currentStandardFilename = inferredStandardFilename;
    updateStandardSaveControls();
  }

  if (currentStandardFilename) {
    await saveCurrentStandardCorrection();
    return;
  }

  await saveSong();
}

async function saveSong() {
  const state = captureAppState();
  await backupBeforeLibrarySave(state);
  const isFirstSave = !currentFilename;
  let filenameForSave = currentFilename;

  if (!filenameForSave) {
    const requestedName = await askTextInput({
      title: "Guardar en biblioteca",
      message: "Nombre para guardar en biblioteca:",
      defaultValue: song.title || "analisis",
      confirmText: "Guardar"
    });
    if (requestedName === null) return;
    filenameForSave = requestedName.trim() || song.title || "analisis";
  }

  let res;
  try {
    res = await fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: filenameForSave, state })
    });
  } catch (error) {
    console.warn(error);
    alert("No se pudo guardar en la biblioteca local.\n\nRevisa que la app este abierta con npm start y que la ventana de Terminal siga encendida.\n\nTu analisis sigue en pantalla. Puedes usar Descargar JSON para guardar una copia manual.");
    return;
  }

  if (!res.ok) {
    alert("No se pudo guardar en la biblioteca local.\n\nEl servidor local respondio con un error. Revisa la ventana de Terminal para ver si aparece algun mensaje.\n\nTu analisis sigue en pantalla. Puedes usar Descargar JSON como respaldo.");
    return;
  }

  const data = await res.json();
  currentFilename = data.filename;
  rememberLastOpenDocument({ source: "library", filename: data.filename, state: data.state || state });

  // No recargar el estado desde el servidor. Antes esto podía reemplazar
  // la sesión actual por un JSON normalizado vacío si el servidor fallaba.
  setDirty(false);
  resetHistory();
  await refreshLibrary();

  if (isFirstSave) {
    alert(`Analisis guardado en biblioteca.\n\nArchivo: ${data.filename}\n\nLo encuentras en Archivo > Biblioteca... > Guardados.`);
  }
}

async function libraryFilenameExists(filename) {
  try {
    const res = await fetch("/api/songs");
    if (!res.ok) return false;
    const data = await res.json();
    return (data.songs || []).some(item => item.filename === filename);
  } catch (_) {
    return false;
  }
}

async function uniqueLibraryFilename(baseName) {
  const base = slugify(baseName || "analisis-copia");
  let filename = `${base}.json`;
  let index = 2;

  while (await libraryFilenameExists(filename)) {
    filename = `${base}-${index}.json`;
    index += 1;
  }

  return filename;
}

function updateCopySaveDestinationHint() {
  if (!els.copySaveDestinationHint || !els.copySaveDestinationSelect) return;

  const destination = els.copySaveDestinationSelect.value;
  els.copySaveDestinationHint.textContent = destination === "curated"
    ? "Aparecera en Archivo > Biblioteca... > Standards, blues y curados. Se guarda en library/ATA-Standards."
    : "Aparecera en Archivo > Biblioteca... > Guardados. Se guarda en la carpeta library.";
}

function openCopySaveDialog() {
  if (!els.copySaveDialog || !els.copySaveNameInput || !els.copySaveDestinationSelect) {
    duplicateCurrentSong();
    return;
  }

  els.copySaveNameInput.value = `${song.title || "analisis"} copia`;
  els.copySaveDestinationSelect.value = "library";
  updateCopySaveDestinationHint();
  els.copySaveDialog.showModal();
  requestAnimationFrame(() => els.copySaveNameInput?.focus());
}

async function duplicateCurrentSong() {
  const requestedName = String(els.copySaveNameInput?.value || "").trim() || `${song.title || "analisis"} copia`;
  const destination = els.copySaveDestinationSelect?.value === "curated" ? "curated" : "library";

  const filename = await uniqueLibraryFilename(requestedName);
  const state = captureAppState();
  state.uiState = {
    ...(state.uiState || {}),
    currentFilename: destination === "library" ? filename : null,
    currentStandardFilename: null
  };

  let res;
  try {
    res = destination === "curated"
      ? await fetch("/api/curated-standards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: requestedName,
            sourceFilename: currentStandardFilename || "",
            state
          })
        })
      : await fetch("/api/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename, state })
        });
  } catch (error) {
    console.warn(error);
    alert("No se pudo guardar la copia.\n\nRevisa que el servidor local siga abierto. El analisis sigue en pantalla.");
    return;
  }

  if (!res.ok) {
    alert("No se pudo guardar la copia.\n\nEl servidor local respondio con un error. El analisis sigue en pantalla.");
    return;
  }

  const data = await res.json();
  currentFilename = destination === "library" ? data.filename : null;
  currentStandardFilename = destination === "curated" ? data.filename : null;
  currentStandardSource = null;
  rememberLastOpenDocument({
    source: destination === "curated" ? "curated" : "library",
    filename: data.filename,
    state: data.state || state
  });
  updateStandardSaveControls();
  setDirty(false);
  resetHistory();
  if (destination === "curated") {
    await refreshStandards();
  } else {
    await refreshLibrary();
  }
  els.copySaveDialog?.close();
  alert(destination === "curated"
    ? `Copia guardada como standard curado.\n\nArchivo: ${data.filename}\n\nLa encuentras en Archivo > Biblioteca... > Standards, blues y curados.`
    : `Copia guardada en biblioteca.\n\nArchivo: ${data.filename}\n\nLa encuentras en Archivo > Biblioteca... > Guardados.`);
}

async function refreshLibrary() {
  if (!els.libraryList) return;
  try {
    const res = await fetch("/api/songs");
    if (!res.ok) throw new Error();
    const data = await res.json();
    savedLibraryIndex = Array.isArray(data.songs) ? data.songs : [];
    renderLibrary(savedLibraryIndex, els.librarySearchInput?.value || "");
  } catch (_) {
    if (els.libraryCount) els.libraryCount.textContent = "";
    if (els.libraryList) els.libraryList.innerHTML = `<p class="libraryHint">No se pudo leer la biblioteca. Revisa que el servidor esté corriendo.</p>`;
  }
}

function openAboutDialog() {
  els.aboutDialog?.showModal();
}

function printAboutCredits() {
  const content = els.aboutPrintContent?.outerHTML || "";
  if (!content) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("No se pudo abrir la página de créditos para imprimir.\n\nPermite ventanas emergentes o vuelve a intentar.");
    return;
  }

  printWindow.document.write(`<!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Créditos ATA</title>
      <style>
        @page { size: letter portrait; margin: 0.55in; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #191919; background: #fff; font-family: Georgia, "Times New Roman", serif; }
        .aboutSheet { width: 100%; margin: 0; padding: 0; border: 0; box-shadow: none; }
        .aboutKicker { margin: 0 0 8px; color: #777; font: 11px Arial, sans-serif; text-transform: uppercase; letter-spacing: .08em; }
        h2 { margin: 0 0 7px; font-size: 42px; line-height: .95; letter-spacing: 0; }
        h3 { margin: 15px 0 5px; font-size: 14px; }
        p { margin: 0 0 8px; font-size: 12.5px; line-height: 1.38; }
        .aboutLead { max-width: 6.9in; font-size: 15px; line-height: 1.32; }
        .aboutGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 12px; }
        .aboutFooter { margin-top: 18px; padding-top: 9px; border-top: 1px solid #ddd; color: #777; font: 10px Arial, sans-serif; }
      </style>
    </head>
    <body>${content}</body>
    </html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function openTheoryCardsDialog() {
  if (!selectedTheoryCardId) selectedTheoryCardId = THEORY_CARDS[0]?.id || "";
  renderTheoryCardList(els.theorySearchInput?.value || "");
  renderSelectedTheoryCard();
  els.theoryDialog?.showModal();
  requestAnimationFrame(() => els.theorySearchInput?.focus());
}

function renderTheoryCardList(query = "") {
  if (!els.theoryCardList) return;

  const terms = librarySearchTerms(query);
  const visible = THEORY_CARDS.filter(card => itemMatchesTerms(card, terms, ["title", "category", "summary"]));
  els.theoryCardList.innerHTML = "";

  if (!visible.length) {
    els.theoryCardList.innerHTML = `<p class="libraryHint">No encontré tarjetas con esa búsqueda.</p>`;
    return;
  }

  if (!visible.some(card => card.id === selectedTheoryCardId)) {
    selectedTheoryCardId = visible[0].id;
  }

  visible.forEach(card => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `theoryCardButton${card.id === selectedTheoryCardId ? " current" : ""}`;
    button.innerHTML = `
      <strong>${escapeHtml(card.title)}</strong>
      <span>${escapeHtml(card.category)}</span>
      <span>${escapeHtml(card.summary)}</span>
    `;
    button.addEventListener("click", () => {
      selectedTheoryCardId = card.id;
      renderTheoryCardList(els.theorySearchInput?.value || "");
      renderSelectedTheoryCard();
    });
    els.theoryCardList.appendChild(button);
  });
}

function selectedTheoryCard() {
  return THEORY_CARDS.find(card => card.id === selectedTheoryCardId) || THEORY_CARDS[0];
}

function selectedTheoryCardIndex() {
  return Math.max(0, THEORY_CARDS.findIndex(card => card.id === selectedTheoryCardId));
}

function moveTheoryCard(direction) {
  if (!THEORY_CARDS.length) return;
  const index = selectedTheoryCardIndex();
  const nextIndex = (index + direction + THEORY_CARDS.length) % THEORY_CARDS.length;
  selectedTheoryCardId = THEORY_CARDS[nextIndex].id;
  renderTheoryCardList(els.theorySearchInput?.value || "");
  renderSelectedTheoryCard();
}

function theoryTableHtml(table, className = "theoryTable") {
  if (!table?.headers?.length || !Array.isArray(table.rows)) return "";
  const headers = table.headers.map(header => `<th>${escapeHtml(header)}</th>`).join("");
  const rows = table.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  return `<table class="${className}"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}

function theoryExamplesHtml(examples) {
  if (!Array.isArray(examples) || !examples.length) return "";
  return theoryTableHtml({
    headers: ["Cifrado", "Lectura ATA"],
    rows: examples
  }, "theoryExamples");
}

function theoryConnectorDiagramSvg(diagram) {
  const chords = Array.isArray(diagram.chords) ? diagram.chords : [];
  const width = 560;
  const height = 92;
  const lineY = 58;
  const xPositions = chords.length === 4
    ? [54, 190, 330, 468]
    : chords.length === 3
      ? [78, 276, 476]
      : [130, 430];
  const chordText = chords.map((chord, index) => {
    const x = xPositions[index] || 60;
    return `<text x="${x}" y="34" class="theoryDiagramChord">${escapeHtml(chord)}</text>`;
  }).join("");
  const bars = xPositions.map(x => `<line x1="${x - 22}" y1="${lineY - 18}" x2="${x - 22}" y2="${lineY + 20}" class="theoryDiagramBar" />`).join("");
  const baseLine = `<line x1="32" y1="${lineY}" x2="528" y2="${lineY}" class="theoryDiagramStaff" />`;
  const marker = `<marker id="arrow-${escapeAttr(diagram.type)}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#d22" /></marker>`;
  let connector = "";

  if (diagram.type === "arrow") {
    connector = `<path d="M160 20 C250 1 330 1 410 22" class="theoryDiagramArrow" marker-end="url(#arrow-${escapeAttr(diagram.type)})" />`;
  } else if (diagram.type === "dashedArrow") {
    connector = `<path d="M160 20 C250 1 330 1 410 22" class="theoryDiagramArrow theoryDiagramDashed" marker-end="url(#arrow-${escapeAttr(diagram.type)})" />`;
  } else if (diagram.type === "bracket") {
    connector = `<path d="M82 18 L82 7 L274 7 L274 18" class="theoryDiagramBracket" />`;
  } else if (diagram.type === "dashedBracket") {
    connector = `<path d="M82 18 L82 7 L274 7 L274 18" class="theoryDiagramBracket theoryDiagramDashed" />`;
  } else if (diagram.type === "skipDashedArrow") {
    connector = `<path d="M222 20 C282 0 382 0 436 21" class="theoryDiagramArrow theoryDiagramDashed" marker-end="url(#arrow-${escapeAttr(diagram.type)})" />`;
  }

  return `
    <figure class="theoryDiagramFigure">
      <figcaption>${escapeHtml(diagram.label || "")}</figcaption>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(diagram.label || "Ejemplo de conector")}">
        <defs>${marker}</defs>
        ${connector}
        ${baseLine}
        ${bars}
        ${chordText}
      </svg>
      <p>${escapeHtml(diagram.caption || "")}</p>
    </figure>
  `;
}

function theoryDiagramsHtml(diagrams) {
  if (!Array.isArray(diagrams) || !diagrams.length) return "";
  return `<div class="theoryDiagramGrid">${diagrams.map(theoryConnectorDiagramSvg).join("")}</div>`;
}

function theoryCardHtml(card) {
  if (!card) return "";
  const notes = THEORY_CARD_NOTES[card.id] || {};
  const tags = Array.isArray(notes.tags) && notes.tags.length
    ? `<div class="theoryTagRow">${notes.tags.map(tag => `<span class="theoryTag">${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";
  const keyPoints = Array.isArray(notes.keyPoints) && notes.keyPoints.length
    ? `<div class="theoryCallout"><strong>Claves de lectura</strong><ul>${notes.keyPoints.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul></div>`
    : "";
  const avoid = notes.avoid
    ? `<div class="theoryNoteBox"><strong>Evitar confusión</strong><p>${escapeHtml(notes.avoid)}</p></div>`
    : "";
  const sections = (card.sections || []).map(section => {
    const body = (section.body || []).map(text => `<p>${escapeHtml(text)}</p>`).join("");
    const bullets = Array.isArray(section.bullets) && section.bullets.length
      ? `<ul>${section.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "";
    return `
      <section>
        <h3>${escapeHtml(section.heading || "")}</h3>
        ${body}
        ${bullets}
        ${theoryTableHtml(section.table)}
        ${theoryExamplesHtml(section.examples)}
        ${theoryDiagramsHtml(section.diagrams)}
      </section>
    `;
  }).join("");

  return `
    <div class="theorySheet">
      <p class="theoryKicker">${escapeHtml(card.category)}</p>
      <h2>${escapeHtml(card.title)}</h2>
      ${tags}
      <p>${escapeHtml(card.summary)}</p>
      ${keyPoints}
      ${sections}
      ${avoid}
      <div class="theoryFooter">AAC (Analizador Armónico Crescendo)</div>
    </div>
  `;
}

function renderSelectedTheoryCard() {
  const card = selectedTheoryCard();
  if (!card) return;
  const index = THEORY_CARDS.indexOf(card);
  if (els.theoryCardMeta) els.theoryCardMeta.textContent = `${card.category} · ${index + 1} de ${THEORY_CARDS.length} · una página imprimible`;
  if (els.theoryCardContent) els.theoryCardContent.innerHTML = theoryCardHtml(card);
}

function printSelectedTheoryCard() {
  const card = selectedTheoryCard();
  if (!card) return;
  const printTitle = `${card.title} - ATA`;

  printHtmlDocument(`<!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(printTitle)}</title>
      <style>
        @page { size: letter portrait; margin: 0.45in; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #191919; background: #fff; }
        .theorySheet { width: 100%; min-height: auto; margin: 0; padding: 0; border: 0; box-shadow: none; font-family: Georgia, "Times New Roman", serif; }
        h2 { margin: 0 0 6px; font-size: 26px; line-height: 1.05; letter-spacing: 0; }
        .theoryKicker { margin: 0 0 9px; color: #777; font: 11px Arial, sans-serif; text-transform: uppercase; letter-spacing: .06em; }
        .theoryTagRow { display: flex; flex-wrap: wrap; gap: 5px; margin: 0 0 11px; }
        .theoryTag { border: 1px solid #d8d8d8; border-radius: 999px; padding: 2px 7px; background: #fafafa; color: #555; font: 10px Arial, sans-serif; }
        .theoryCallout, .theoryNoteBox { margin: 10px 0 11px; border: 1px solid #d7d7d7; padding: 8px 10px; }
        .theoryCallout { border-left: 4px solid #d99b3d; background: #fff9ed; }
        .theoryNoteBox { background: #f8f8f8; }
        .theoryCallout strong, .theoryNoteBox strong { display: block; margin-bottom: 5px; font: 700 10px Arial, sans-serif; text-transform: uppercase; letter-spacing: .05em; }
        h3 { margin: 13px 0 5px; font-size: 14px; }
        p { margin: 0 0 7px; font-size: 12px; line-height: 1.32; }
        ul { margin: 0 0 9px 17px; padding: 0; font-size: 11px; line-height: 1.28; }
        table { width: 100%; border-collapse: collapse; margin: 7px 0 10px; font: 10px Arial, sans-serif; }
        th, td { border: 1px solid #d7d7d7; padding: 4px 5px; vertical-align: top; }
        th { background: #f5f5f5; text-align: left; }
        .theoryDiagramGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin: 7px 0 9px; }
        .theoryDiagramFigure { margin: 0; border: 1px solid #d7d7d7; padding: 5px; }
        .theoryDiagramFigure figcaption { margin: 0 0 3px; font: 700 9px Arial, sans-serif; text-transform: uppercase; letter-spacing: .04em; color: #555; }
        .theoryDiagramFigure svg { width: 100%; height: auto; display: block; }
        .theoryDiagramFigure p { margin: 3px 0 0; color: #555; font: 9px Arial, sans-serif; line-height: 1.2; }
        .theoryDiagramChord { fill: #111; font: 22px Georgia, "Times New Roman", serif; }
        .theoryDiagramStaff, .theoryDiagramBar { stroke: #111; stroke-width: 1.8; }
        .theoryDiagramArrow, .theoryDiagramBracket { fill: none; stroke: #d22; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
        .theoryDiagramDashed { stroke-dasharray: 6 5; }
        .theoryFooter { margin-top: 13px; padding-top: 8px; border-top: 1px solid #ddd; color: #777; font: 10px Arial, sans-serif; }
      </style>
    </head>
    <body>${theoryCardHtml(card)}</body>
    </html>`, "No se pudo preparar la tarjeta para imprimir.\n\nCierra la tarjeta, vuelve a abrirla e intenta de nuevo.", printTitle);
}

function printHtmlDocument(html, errorMessage, printTitle = "") {
  const previousTitle = document.title;
  let restorePrintTitleTimer = null;
  let iframe = null;
  const restorePrintTitle = () => {
    if (restorePrintTitleTimer) {
      clearTimeout(restorePrintTitleTimer);
      restorePrintTitleTimer = null;
    }
    window.removeEventListener("focus", restorePrintTitle);
    if (printTitle && document.title === printTitle) {
      document.title = previousTitle;
    }
  };
  const removePrintFrame = () => {
    if (iframe?.parentNode) iframe.remove();
    iframe = null;
  };

  try {
    iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    if (printTitle) {
      document.title = printTitle;
      iframe.contentDocument.title = printTitle;
    }
    iframe.contentDocument.close();
    setTimeout(() => {
      try {
        if (!iframe?.contentWindow) return;
        if (printTitle) {
          document.title = printTitle;
          iframe.contentDocument.title = printTitle;
          window.addEventListener("focus", restorePrintTitle, { once: true });
          restorePrintTitleTimer = setTimeout(restorePrintTitle, 120000);
        }
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (error) {
        console.warn(error);
        restorePrintTitle();
        alert(errorMessage || "No se pudo imprimir.");
      }
      setTimeout(removePrintFrame, 1000);
    }, 80);
  } catch (error) {
    console.warn(error);
    restorePrintTitle();
    removePrintFrame();
    alert(errorMessage || "No se pudo imprimir.");
  }
}

async function normalizeLibraryFilenames() {
  if (!confirm("Normalizar nombres de archivos guardados?\n\nEjemplo: BIRD-BLUES-COPIA.json se vera como Bird Blues Copia.json.\n\nSolo afecta archivos de Guardados en la carpeta library.")) {
    return;
  }

  let res;
  try {
    res = await fetch("/api/songs/normalize-filenames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
  } catch (error) {
    console.warn(error);
    alert("No se pudieron normalizar los nombres.\n\nRevisa que el servidor local siga abierto.");
    return;
  }

  if (!res.ok) {
    alert("No se pudieron normalizar los nombres.\n\nEl servidor local respondio con un error.");
    return;
  }

  const data = await res.json();
  if (currentFilename && data.renamed?.[currentFilename]) {
    currentFilename = data.renamed[currentFilename];
  }
  await refreshLibrary();
  alert(`Nombres normalizados.\n\nArchivos renombrados: ${Object.keys(data.renamed || {}).length}`);
}

async function refreshStandards() {
  if (!els.standardsList) return;

  try {
    const [standardsRes, adminThemesRes] = await Promise.all([
      fetch("/api/standards"),
      fetch("/api/admin/themes")
    ]);
    if (!standardsRes.ok) throw new Error();
    const data = await standardsRes.json();
    const standards = Array.isArray(data.standards) ? data.standards : [];
    const bluesCuratedNames = new Set(BLUES_STANDARD_ITEMS.map(item => bluesStandardFilename(item.id)));
    const curatedNames = new Set(standards.map(item => item.curatedFilename).filter(Boolean));
    const bluesItems = BLUES_STANDARD_ITEMS.map(item => {
      const curatedFilename = bluesStandardFilename(item.id);
      return {
        ...item,
        curated: curatedNames.has(curatedFilename),
        curatedFilename: curatedNames.has(curatedFilename) ? curatedFilename : ""
      };
    });
    const visibleStandards = standards.filter(item => !item.standaloneCurated || !bluesCuratedNames.has(item.curatedFilename));
    const adminData = adminThemesRes.ok ? await adminThemesRes.json() : { themes: [] };
    const visibleStandardTitles = new Set([...bluesItems, ...visibleStandards].map(item => normalizeTextForSearch(item.title)));
    const adminThemes = (Array.isArray(adminData.themes) ? adminData.themes : [])
      .map(theme => ({
        ...theme,
        title: titleCaseDisplay(theme.title || theme.filename),
        kind: "admin-theme",
        rhythm: "Admin",
        timeSignature: ""
      }))
      .filter(theme => !visibleStandardTitles.has(normalizeTextForSearch(theme.title)));
    standardsIndex = [
      ...bluesItems,
      ...visibleStandards,
      ...adminThemes
    ].sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "es", { sensitivity: "base" }));
    renderStandards(standardsIndex, els.standardSearchInput?.value || "");
  } catch (_) {
    els.standardsList.innerHTML = `<p class="libraryHint">No se pudo leer la biblioteca de standards.</p>`;
  }
}

function librarySearchTerms(query) {
  return normalizeTextForSearch(query).split(/\s+/).filter(Boolean);
}

function itemMatchesTerms(item, terms, fields) {
  if (!terms.length) return true;
  const text = normalizeTextForSearch(fields.map(field => item?.[field] || "").join(" "));
  return terms.every(term => text.includes(term));
}

function renderLibrary(items, query = "") {
  if (!els.libraryList) return;
  els.libraryList.innerHTML = "";
  const allItems = Array.isArray(items) ? items : [];
  const terms = librarySearchTerms(query);
  const visible = allItems.filter(item => itemMatchesTerms(item, terms, ["title", "composer", "filename"]));

  if (els.libraryCount) {
    els.libraryCount.textContent = terms.length
      ? `${visible.length} de ${allItems.length}`
      : `${allItems.length}`;
  }

  if (!allItems.length) {
    els.libraryList.innerHTML = `<p class="libraryHint">No hay archivos guardados.</p>`;
    return;
  }

  if (!visible.length) {
    els.libraryList.innerHTML = `<p class="libraryHint">No encontré guardados con esa búsqueda.</p>`;
    return;
  }

  visible.forEach(item => {
    const row = document.createElement("div");
    row.className = "libraryItemRow";

    const btn = document.createElement("button");
    btn.className = `libraryItem libraryItemOpen${currentFilename === item.filename ? " current" : ""}`;
    btn.innerHTML = `
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.composer || "Sin compositor")}</span>
      ${currentFilename === item.filename ? `<span>Abierto ahora</span>` : ""}
      <span>${escapeHtml(item.filename)}</span>
    `;
    btn.addEventListener("click", () => loadFromLibrary(item.filename));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "libraryDeleteBtn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.title = `Eliminar ${item.filename}`;
    deleteBtn.addEventListener("click", event => {
      event.stopPropagation();
      deleteLibrarySong(item);
    });

    row.appendChild(btn);
    row.appendChild(deleteBtn);
    els.libraryList.appendChild(row);
  });
}

async function deleteLibrarySong(item) {
  const filename = item?.filename || "";
  if (!filename) return;

  if (!confirm(`Eliminar de Guardados:\n\n${item.title || filename}\n\nArchivo: ${filename}\n\nEsta accion borra el archivo de la carpeta library. El analisis que tienes en pantalla no se borra.`)) {
    return;
  }

  try {
    const previousRes = await fetch(`/api/songs/${encodeURIComponent(filename)}`);
    if (previousRes.ok) {
      const previousState = await previousRes.json();
      saveLocalStorageBackup(`deleted:${filename}`, {
        filename,
        backedUpAt: new Date().toISOString(),
        state: previousState
      });
    }
  } catch (error) {
    console.warn("No se pudo crear respaldo local antes de eliminar.", error);
  }

  let res;
  try {
    res = await fetch(`/api/songs/${encodeURIComponent(filename)}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.warn(error);
    alert("No se pudo eliminar el archivo.\n\nRevisa que el servidor local siga abierto.");
    return;
  }

  if (!res.ok) {
    alert("No se pudo eliminar el archivo.\n\nEl servidor local respondio con un error.");
    return;
  }

  if (currentFilename === filename) {
    currentFilename = null;
    setDirty(true);
  }

  await refreshLibrary();
  alert(`Archivo eliminado de Guardados.\n\n${filename}`);
}

function renderStandards(items, query = "") {
  if (!els.standardsList) return;
  els.standardsList.innerHTML = "";
  if (els.curatedStandardsList) els.curatedStandardsList.innerHTML = "";

  const terms = librarySearchTerms(query);

  const normalizedText = item => [
    item.title,
    item.composer,
    item.kind,
    item.filename,
    item.curatedFilename,
    item.key,
    item.rhythm,
    item.timeSignature
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const filtered = terms.length
    ? items.filter(item => terms.every(term => normalizedText(item).includes(term)))
    : items;
  const isCuratedItem = item => !!item.curated || !!item.standaloneCurated || item.kind === "admin-theme";
  const curatedVisible = filtered.filter(isCuratedItem);
  const visible = filtered.filter(item => !isCuratedItem(item));

  if (els.standardsCount) {
    els.standardsCount.textContent = terms.length
      ? `${filtered.length} de ${items.length}`
      : `${items.length}`;
  }

  if (!items.length) {
    els.standardsList.innerHTML = `<p class="libraryHint">No hay standards disponibles.</p>`;
    return;
  }

  if (!visible.length) {
    els.standardsList.innerHTML = `<p class="libraryHint">${curatedVisible.length ? "Los resultados están en Curados y favoritos." : "No encontré standards con esa búsqueda."}</p>`;
  }

  if (els.curatedStandardsList) {
    if (curatedVisible.length) {
      curatedVisible.forEach(item => appendStandardLibraryButton(els.curatedStandardsList, item, true));
    } else {
      els.curatedStandardsList.innerHTML = `<p class="libraryHint">Aún no hay curados con esta búsqueda.</p>`;
    }
  }

  visible.forEach(item => appendStandardLibraryButton(els.standardsList, item, false));
}

function appendStandardLibraryButton(container, item, favorite = false) {
    const btn = document.createElement("button");
    const itemCurrentStandard = item.kind === "blues"
      ? currentStandardFilename === bluesStandardFilename(item.id)
      : currentStandardFilename === (item.curatedFilename || item.filename);
    btn.className = `libraryItem${favorite ? " curatedFavorite" : ""}${itemCurrentStandard ? " current" : ""}`;
    btn.innerHTML = `
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.composer || "Sin compositor")}</span>
      ${itemCurrentStandard ? `<span>Abierto ahora</span>` : ""}
      <span>${escapeHtml([
        item.kind === "blues" ? "Blues precargado" : "",
        item.kind === "admin-theme" ? "Admin" : "",
        item.curated ? "Curado ATA" : "",
        item.key,
        item.rhythm,
        item.timeSignature
      ].filter(Boolean).join(" · ") || item.filename)}</span>
    `;
    btn.addEventListener("click", () => loadStandardFromLibrary(item));
    container.appendChild(btn);
}

async function loadFromLibrary(filename) {
  if (dirty && !confirm("Hay cambios sin guardar. ¿Cargar otro análisis?")) return;
  const res = await fetch(`/api/songs/${encodeURIComponent(filename)}`);
  if (!res.ok) {
    alert("No se pudo cargar el archivo.");
    return;
  }
  const data = await res.json();
  await applyAppState(data, false);
  currentFilename = filename;
  clearCurrentStandardSource();
  rememberLastOpenDocument({ source: "library", filename, state: data });
  updateStandardSaveControls();
  resetHistory();
  els.libraryDialog.close();
}

async function loadStandardFromLibrary(itemOrFilename) {
  if (dirty && !confirm("Hay cambios sin guardar. ¿Cargar este standard?")) return;
  const item = typeof itemOrFilename === "string"
    ? { filename: itemOrFilename }
    : (itemOrFilename || {});
  const filename = item.filename;

  if (item.kind === "blues") {
    await loadBluesStudyFromLibrary(item.id);
    els.libraryDialog.close();
    return;
  }

  if (item.kind === "admin-theme") {
    await loadAdminThemeFromLibrary(filename);
    els.libraryDialog.close();
    return;
  }

  if (item.curatedFilename) {
    const curatedRes = await fetch(`/api/curated-standards/${encodeURIComponent(item.curatedFilename)}`);
    if (!curatedRes.ok) {
      alert("No se pudo cargar la versión curada de ese standard.\n\nRevisa que la carpeta ATA-Standards esté disponible.");
      return;
    }

    const curatedState = await curatedRes.json();
    await applyAppState(curatedState, false);
    currentFilename = null;
    currentStandardFilename = filename || item.curatedFilename;
    currentStandardSource = null;
    rememberLastOpenDocument({ source: "curated", filename: item.curatedFilename, state: curatedState });
    updateStandardSaveControls();
    resetHistory();
    els.libraryDialog.close();
    return;
  }

  const res = await fetch(`/api/standards/${encodeURIComponent(filename)}`);
  if (!res.ok) {
    alert("No se pudo cargar ese standard.\n\nRevisa que la biblioteca de standards esté en la carpeta library.");
    return;
  }

  const standard = await res.json();
  const converted = standardToSong(standard);
  if (!converted.measures.length) {
    alert("No se pudo convertir ese standard.\n\nEl archivo no trae compases o cifrados reconocibles.");
    return;
  }

  song = normalizeSong(converted);
  currentFilename = null;
  currentStandardFilename = filename;
  currentStandardSource = structuredClone(standard);
  updateStandardSaveControls();
  selected = { page: 0, measure: 0 };
  selectedSlot = 0;
  clearEvaluationIssues(false);
  if (!IS_STUDENT_MODE) {
    autoAnalyzeCurrentSong(true, { confirm: false, alert: false, markDirty: false, render: false });
  } else {
    analysisVisibility = "hidden";
    updateAnalysisVisibilityControls();
  }
  renderAll(false);
  resetHistory();
  setDirty(true);
  els.libraryDialog.close();
}

async function saveCurrentStandardCorrection() {
  if (!currentStandardFilename) {
    alert("Primero carga un tema desde la biblioteca de Standards.\n\nEste botón guarda una versión curada completa en ATA-Standards.");
    return;
  }

  if (!confirm(`Guardar versión curada completa de:\n\n${currentStandardFilename}\n\nSe guardarán acordes, grados, modos, escalas de origen, tonalidades, conectores, páginas, barras, casillas y apariencia.\n\nLa biblioteca original no se modifica.`)) {
    return;
  }

  normalizeRepeatedMeasures(allMeasures());
  const state = captureAppState();
  state.uiState = {
    ...(state.uiState || {}),
    currentFilename: null,
    currentStandardFilename
  };

  let res;
  try {
    res = await fetch("/api/curated-standards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: currentStandardFilename,
        sourceFilename: currentStandardFilename,
        state
      })
    });
  } catch (error) {
    console.warn(error);
    alert("No se pudo guardar el standard curado.\n\nRevisa que la app esté abierta con el servidor local.");
    return;
  }

  if (!res.ok) {
    alert("No se pudo guardar el standard curado.\n\nEl servidor local respondió con un error. El análisis sigue en pantalla.");
    return;
  }

  const data = await res.json();
  currentFilename = null;
  currentStandardFilename = data.filename;
  currentStandardSource = null;
  rememberLastOpenDocument({ source: "curated", filename: data.filename, state: data.state || state });
  updateStandardSaveControls();
  setDirty(false);
  resetHistory();
  await refreshStandards();
  alert(`Standard curado guardado.\n\nArchivo: ${data.filename}\n\nLo encuentras en Archivo > Biblioteca... > Standards.\n\n${data.backup ? `Respaldo anterior: ${data.backup}` : "No habia version curada anterior."}`);
}

function currentSongToStandardJson(source = {}) {
  const sections = currentSongToStandardSections();
  const standard = {
    ...structuredClone(source || {}),
    Title: song.title || source.Title || "STANDARD",
    Composer: song.composer || source.Composer || "",
    TimeSignature: normalizeTimeSignature(song.timeSignature || source.TimeSignature || "4/4"),
    Sections: sections
  };

  if (source.Key) standard.Key = source.Key;
  if (source.Rhythm) standard.Rhythm = source.Rhythm;

  return standard;
}

function currentSongToStandardSections() {
  normalizeRepeatedMeasures(allMeasures());
  const measures = allMeasures().filter(measure => hasMeasureChordContent(measure));
  const sections = [];
  let current = null;
  let currentEnding = null;

  const startSection = label => {
    current = {
      ...(label ? { Label: label } : {}),
      MainSegment: { Chords: "" }
    };
    sections.push(current);
    currentEnding = null;
  };

  measures.forEach((measure, index) => {
    const label = String(measure.form || "").trim();
    const startsNewSection = label && (!current || standardSectionHasContent(current));
    if (!current || startsNewSection) startSection(label);
    if (label && !current.Label) current.Label = label;

    if (measure.ending) {
      current.Endings = Array.isArray(current.Endings) ? current.Endings : [];
      currentEnding = { Chords: "" };
      current.Endings.push(currentEnding);
    }

    const target = currentEnding || current.MainSegment;
    target.Chords = appendStandardMeasureText(target.Chords, measureToStandardChordText(measure));

    if (currentEnding && isSectionBreakBar(measure.rightBar)) {
      currentEnding = null;
    }

    const next = measures[index + 1];
    if (!currentEnding && isSectionBreakBar(measure.rightBar) && next?.form) {
      current = null;
    }
  });

  return sections.filter(standardSectionHasContent);
}

function standardSectionHasContent(section) {
  if (String(section?.MainSegment?.Chords || "").trim()) return true;
  return Array.isArray(section?.Endings) && section.Endings.some(ending => String(ending?.Chords || "").trim());
}

function hasMeasureChordContent(measure) {
  return (measure?.slots || []).some(slot => String(slot?.chord || "").trim());
}

function appendStandardMeasureText(existing, measureText) {
  if (!measureText) return existing || "";
  return existing ? `${existing}|${measureText}` : measureText;
}

function measureToStandardChordText(measure) {
  return (measure?.slots || [])
    .map(slot => normalizeTextSymbols(slot?.chord || "").trim())
    .filter(Boolean)
    .join(",");
}

function standardToSong(standard) {
  const measures = [];
  const sections = Array.isArray(standard?.Sections) ? standard.Sections : [];

  sections.forEach((section, sectionIndex) => {
    const sectionLabel = String(section?.Label || "").trim();
    const hasEndings = Array.isArray(section?.Endings) && section.Endings.length;
    const mainMeasures = measuresFromStandardChordString(section?.MainSegment?.Chords || "");
    const firstSectionMeasureIndex = measures.length;

    mainMeasures.forEach((measure, index) => {
      if (index === 0) {
        if (sectionLabel) {
          measure.form = sectionLabel;
          measure._autoForm = true;
        }
        if (sectionIndex > 0) measure.leftBar = "||";
        if (Number(section?.Repeats || 0) > 0 || hasEndings) measure.leftBar = "|:";
      }
      measures.push(measure);
    });

    if (hasEndings) {
      section.Endings.forEach((ending, endingIndex) => {
        const endingMeasures = measuresFromStandardChordString(ending?.Chords || "");
        endingMeasures.forEach((measure, index) => {
          if (index === 0) {
            measure.ending = `${endingIndex + 1}.`;
            measure.leftBar = "|";
          }
          if (index === endingMeasures.length - 1) {
            measure.rightBar = endingIndex === 0 ? ":||" : "||";
          }
          measures.push(measure);
        });
      });
    } else if (Number(section?.Repeats || 0) > 0 && measures.length > firstSectionMeasureIndex) {
      measures[measures.length - 1].rightBar = ":||";
    } else if (measures.length > firstSectionMeasureIndex) {
      measures[measures.length - 1].rightBar = "||";
    }
  });

  if (measures.length) measures[measures.length - 1].rightBar = "|||";
  normalizeRepeatedMeasures(measures);

  return {
    version: 7,
    title: normalizeTextSymbols(standard?.Title || "STANDARD"),
    composer: normalizeTextSymbols(standard?.Composer || ""),
    studentName: "",
    timeSignature: normalizeTimeSignature(standard?.TimeSignature || "4/4"),
    settings: structuredClone(song?.settings || DEFAULT_SETTINGS),
    measures
  };
}

function normalizeRepeatedMeasures(measures) {
  let previousSignature = "";

  (measures || []).forEach(measure => {
    const signature = chordSequenceSignature(measure);
    if (!signature) return;

    const canReplace = signature === previousSignature && canReplaceMeasureWithRepeat(measure);
    if (canReplace) {
      replaceMeasureWithRepeat(measure);
      return;
    }

    if (signature !== "%") previousSignature = signature;
  });
}

function chordSequenceSignature(measure) {
  const chords = (measure?.slots || [])
    .map(slot => String(slot?.chord || "").trim())
    .filter(Boolean);

  if (!chords.length) return "";
  if (chords.length === 1 && chords[0] === "%") return "%";

  return chords.map(chord => normalizeChordForFormSignature(chord)).join(" ");
}

function canReplaceMeasureWithRepeat(measure) {
  if (!measure) return false;
  if (String(measure.form || "").trim()) return false;
  if (String(measure.ending || "").trim()) return false;
  if (String(measure.jump || "").trim()) return false;
  if (String(measure.sectionLabel || "").trim()) return false;
  if (barClass(measure.leftBar) !== "single") return false;
  return true;
}

function replaceMeasureWithRepeat(measure) {
  const slotCount = Math.max(4, measure.slots?.length || 4);
  measure.slots = Array.from({ length: slotCount }, (_, index) => ({
    chord: index === 0 ? "%" : "",
    mode: "",
    degree: index === 0 ? "%" : "",
    sectionLabel: "",
    originScale: "",
    arrow: "",
    arrowSpan: 1,
    offsets: {}
  }));
}

function measuresFromStandardChordString(chordString) {
  return String(chordString || "")
    .split("|")
    .map(part => standardMeasureFromText(part))
    .filter(Boolean);
}

function standardMeasureFromText(text) {
  const chords = standardChordTokens(text);
  if (!chords.length) return null;

  const measure = makeMeasure();
  const slotCount = Math.max(4, chords.length);
  measure.slots = Array.from({ length: slotCount }, () => ({
    chord: "",
    mode: "",
    degree: "",
    sectionLabel: "",
    originScale: "",
    arrow: "",
    arrowSpan: 1,
    offsets: {}
  }));
  chords.forEach((chord, index) => {
    measure.slots[index].chord = chord;
  });
  return measure;
}

function standardChordTokens(text) {
  return String(text || "")
    .replace(/\(([A-G][^()]*)\)/gi, ",$1")
    .split(",")
    .map(normalizeStandardChordSymbol)
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeStandardChordSymbol(value) {
  let chord = normalizeTextSymbols(value || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\s+/g, "");

  if (!chord) return "";

  chord = chord
    .replace(/^([A-G](?:bb|##|b|#)?)(?:0|o|º)(7?)$/i, (_, root) => `${root[0].toUpperCase()}${root.slice(1)}°7`)
    .replace(/([A-G](?:bb|##|b|#)?)(?:0|o|º)(7?)/gi, (_, root) => `${root[0].toUpperCase()}${root.slice(1)}°7`)
    .replace(/\/maj7/gi, "(maj7)")
    .replace(/maj7#5/gi, "+maj7")
    .replace(/maj7b5/gi, "maj7(b5)")
    .replace(/m7b5/gi, "ø")
    .replace(/sus(?!\d)/gi, "sus4");

  return normalizeChordSymbolInput(chord);
}

async function downloadJson() {
  const filename = `${exportFilenameBase()}.json`;
  const content = JSON.stringify(captureAppState(), null, 2);

  if (window.ataDesktop?.saveJson) {
    try {
      const result = await window.ataDesktop.saveJson({
        defaultFilename: filename,
        content
      });
      if (!result?.canceled) {
        updateStatus(`JSON guardado: ${result.filePath || filename}`);
      }
      return;
    } catch (error) {
      console.warn(error);
      alert("No se pudo guardar el JSON en esa carpeta.\n\nPrueba otra ubicacion o usa la app local en el navegador para descargarlo.");
      return;
    }
  }

  const blob = new Blob([content], { type: "application/json" });
  downloadBlob(blob, filename);
}

function parseChordTextMeasures(rawText) {
  const text = normalizeTextSymbols(rawText || "")
    .replace(/[\u2026]/g, "...")
    .replace(/[|｜]/g, "|")
    .replace(/:\s*\|\s*\|/g, ":||")
    .replace(/:\s*\|/g, ":|")
    .replace(/\|\s*\|\s*\|/g, "|||")
    .replace(/\|\s*\|/g, "||")
    .replace(/\|\s*:/g, "|:")
    .trim();

  if (!text) {
    return [];
  }

  const tokens = text.match(/:\|\||\|\|\||\|\||\|:|:\||\||[^\s|]+/g) || [];
  const measures = [];
  let pendingLeftBar = "|";
  let pendingEnding = "";
  let currentTokens = [];

  const isBarToken = token => ["|", "||", "|||", "|:", ":|", ":||"].includes(token);
  const isEndingToken = token => /^\d+[.)]$/.test(token);
  const normalizeEndingToken = token => `${String(token || "").replace(/\D/g, "")}.`;

  const makeMeasuresFromTokens = (chordTokens, rightBar = "|") => {
    const generated = [];
    if (!chordTokens.length) return generated;

    if (chordTokens.length === 1 && chordTokens[0] === "%") {
      const measure = makeMeasure();
      measure.slots[0].chord = "%";
      generated.push(measure);
      return generated;
    }

    for (let start = 0; start < chordTokens.length; start += 4) {
      const chunk = chordTokens.slice(start, start + 4);
      if (!chunk.length) continue;
	      const measure = makeMeasure();
	      chunk.forEach((chord, index) => {
	        measure.slots[index].chord = normalizeChordSymbolInput(chord);
	      });
      generated.push(measure);
    }

    generated.forEach((measure, index) => {
      measure.leftBar = index === 0 ? pendingLeftBar : "|";
      measure.rightBar = index === generated.length - 1 ? rightBar : "|";
      if (index === 0 && pendingEnding) {
        measure.ending = pendingEnding;
      }
    });

    pendingLeftBar = "|";
    pendingEnding = "";
    return generated;
  };

  const flushCurrent = (rightBar = "|") => {
    if (!currentTokens.length) return;
    measures.push(...makeMeasuresFromTokens(currentTokens, rightBar));
    currentTokens = [];
  };

  tokens.forEach(rawToken => {
    const token = String(rawToken || "").trim();
    if (!token || token === "...") return;

    if (isEndingToken(token)) {
      if (currentTokens.length) flushCurrent("|");
      pendingEnding = normalizeEndingToken(token);
      return;
    }

    if (isBarToken(token)) {
      if (token === "|:") {
        flushCurrent("|");
        pendingLeftBar = "|:";
        return;
      }

      if (currentTokens.length) {
        flushCurrent(token);
      } else if (measures.length && token !== "|") {
        measures[measures.length - 1].rightBar = token;
      } else if (token !== "|") {
        pendingLeftBar = token;
      }
      return;
    }

    if (token === "%" && currentTokens.length) {
      flushCurrent("|");
    } else if (currentTokens.includes("%")) {
      flushCurrent("|");
    }

    currentTokens.push(token);
  });

  flushCurrent(measures.length ? "|" : "||");
  if (measures.length && measures[measures.length - 1].rightBar === "|") {
    measures[measures.length - 1].rightBar = "||";
  }

  return measures;
}

function isSectionBreakBar(value) {
  const cleaned = String(value || "").trim();
  return ["||", "|||", ":|", ":||"].includes(cleaned)
    || ["double", "final", "repeatEnd"].includes(barClass(cleaned));
}

function normalizeChordForFormSignature(chord) {
  const parsed = window.TonalAnalysis?.parseChord?.(chord);
  if (parsed) return `${parsed.root}${parsed.displaySuffix || parsed.suffix || ""}`;
  return normalizeQualityAliasesForComparison(chord).toUpperCase();
}

function chordQualityForFormSignature(parsed) {
  const suffix = parsed?.suffix || "";
  if (!suffix || suffix === "6" || /^maj|^∆/.test(suffix)) return "maj";
  if (/^\+maj|^maj7#5|^\+∆/.test(suffix)) return "augmaj";
  if (/^m7b5/.test(suffix)) return "half";
  if (/^dim/.test(suffix)) return "dim";
  if (/^m/.test(suffix)) return "min";
  if (/^7|^9|^13|\+7|7alt/.test(suffix)) return "dom";
  return normalizeQualityAliasesForComparison(suffix).toLowerCase();
}

function measureFormChordEntries(measure) {
  return (measure?.slots || [])
    .map(slot => String(slot?.chord || "").trim())
    .filter(Boolean)
    .map(chord => {
      const parsed = window.TonalAnalysis?.parseChord?.(chord);
      if (!parsed) return { raw: normalizeChordForFormSignature(chord), chroma: null, quality: normalizeQualityAliasesForComparison(chord) };
      return {
        raw: normalizeChordForFormSignature(chord),
        chroma: parsed.chroma,
        quality: chordQualityForFormSignature(parsed)
      };
    });
}

function measureFormSignature(measure, previousSignature = "") {
  const chords = measureFormChordEntries(measure);

  if (chords.length === 1 && chords[0].raw === "%") {
    return previousSignature || "%";
  }

  return chords.map(chord => chord.raw).join(" ");
}

function measureRelativeFormSignature(measure, previousSignature = "") {
  const chords = measureFormChordEntries(measure);

  if (chords.length === 1 && chords[0].raw === "%") {
    return previousSignature || "%";
  }
  if (!chords.length) return "";

  const anchor = chords.find(chord => chord.chroma !== null)?.chroma;
  if (anchor === undefined || anchor === null) {
    return chords.map(chord => chord.raw).join(" ");
  }

  return chords.map(chord => {
    if (chord.chroma === null) return chord.raw;
    return `${mod12(chord.chroma - anchor)}:${chord.quality}`;
  }).join(" ");
}

function formLabelForIndex(index) {
  let value = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);
  return label;
}

function formSectionSimilarity(a, b) {
  const left = a?.relativeSignatures || a?.signatures || [];
  const right = b?.relativeSignatures || b?.signatures || [];
  if (!left.length || !right.length) return 0;

  const length = Math.max(left.length, right.length);
  let matches = 0;
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    if (left[index] === right[index]) matches += 1;
  }

  return matches / length;
}

function detectImportedTextFormSections(measures) {
  const starts = [0];
  for (let index = 1; index < measures.length; index++) {
    if (isSectionBreakBar(measures[index - 1]?.rightBar)) {
      starts.push(index);
    }
  }

  const measureSignatures = [];
  const relativeMeasureSignatures = [];
  let previousSignature = "";
  let previousRelativeSignature = "";
  measures.forEach((measure, index) => {
    const signature = measureFormSignature(measure, previousSignature);
    const relativeSignature = measureRelativeFormSignature(measure, previousRelativeSignature);
    measureSignatures[index] = signature;
    relativeMeasureSignatures[index] = relativeSignature;
    if (signature && signature !== "%") previousSignature = signature;
    if (relativeSignature && relativeSignature !== "%") previousRelativeSignature = relativeSignature;
  });

  for (let index = 1; index < measures.length - 1; index++) {
    if (starts.includes(index)) continue;
    if (String(measures[index]?.ending || "").trim()) continue;
    const previousStart = starts.filter(start => start < index).at(-1) ?? 0;
    if (index - previousStart < 2) continue;
    if (
      measureSignatures[index] &&
      measureSignatures[index] === measureSignatures[0] &&
      measureSignatures[index + 1] === measureSignatures[1]
    ) {
      starts.push(index);
    }
  }

  starts.sort((a, b) => a - b);

  return starts.map((start, index) => {
    const end = (starts[index + 1] ?? measures.length) - 1;
    return {
      start,
      end,
      ending: String(measures[start]?.ending || "").trim(),
      signatures: measureSignatures.slice(start, end + 1),
      relativeSignatures: relativeMeasureSignatures.slice(start, end + 1)
    };
  });
}

function applyDetectedFormMarks(measures) {
  clearFormMarks(measures);
  const sections = detectImportedTextFormSections(measures);
  if (!sections.length) return;

  const namedSections = [];
  let nextLabelIndex = 0;

  sections.forEach((section, index) => {
    let label = "";
    if (index > 0 && /^2[.)]?$/.test(section.ending) && namedSections.length) {
      label = namedSections[namedSections.length - 1].label;
    } else {
      const best = namedSections
        .map(named => ({ label: named.label, similarity: formSectionSimilarity(section, named.section) }))
        .sort((a, b) => b.similarity - a.similarity)[0];
      if (best && best.similarity >= 0.7) {
        label = best.label;
      }
    }

    if (!label) {
      label = formLabelForIndex(nextLabelIndex);
      nextLabelIndex += 1;
    }

    const isSecondEnding = /^2[.)]?$/.test(section.ending);
    if (measures[section.start] && !isSecondEnding) {
      measures[section.start].form = label;
      measures[section.start]._autoForm = true;
      if (section.start > 0 && barClass(measures[section.start].leftBar) === "single") {
        measures[section.start].leftBar = "||";
      }
    }
    namedSections.push({ label, section });
  });
}

function importPlainTextAnalysis() {
  if (!els.textImportDialog || !els.textImportInput || !els.textImportTitleInput) {
    alert("No se pudo abrir el importador de texto.\n\nRecarga la app e intenta de nuevo.");
    return;
  }

  const sample = "Dm7 G7 | C∆ Am7 | Dm7 G7 | C∆";
  const warning = dirty
    ? "Aviso: tienes cambios sin guardar. Al cargar este texto se reemplazará el análisis actual."
    : "Pega una progresión en texto plano. Usa | para separar compases.";

  if (els.textImportWarning) {
    els.textImportWarning.textContent = warning;
  }

  els.textImportTitleInput.value = song?.title || "ANÁLISIS IMPORTADO";
  if (!String(els.textImportInput.value || "").trim()) {
    els.textImportInput.value = sample;
  }

  els.textImportDialog.showModal();
  requestAnimationFrame(() => els.textImportInput?.focus());
}

function applyTextImportFromDialog() {
  const source = String(els.textImportInput?.value || "");
  const titleInput = String(els.textImportTitleInput?.value || "");

  const measures = parseChordTextMeasures(source);
  if (!measures.length) {
    alert("No se pudo importar el texto.\n\nNo encontré acordes válidos. Usa barras | para separar compases.");
    return;
  }

  applyDetectedFormMarks(measures);

  song = normalizeSong({
    version: 7,
    title: normalizeTextSymbols(titleInput).trim() || "ANÁLISIS IMPORTADO",
    composer: "",
    studentName: "",
    settings: structuredClone(song?.settings || DEFAULT_SETTINGS),
    measures
  });

  currentFilename = null;
  clearCurrentStandardSource();
  selected = { page: 0, measure: 0 };
  selectedSlot = 0;
  clearEvaluationIssues(false);
  autoAnalyzeCurrentSong(true, { confirm: false, alert: false, markDirty: false, render: false });
  renderAll(false);
  resetHistory();
  setDirty(true);
  els.textImportDialog?.close();
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const imported = JSON.parse(reader.result);
      currentFilename = file.name;
      await applyAppState(imported, true);
      clearCurrentStandardSource();
      resetHistory();
      setDirty(true);
    } catch (error) {
      console.warn(error);
      alert("No se pudo importar ese JSON.\n\nEl archivo no parece ser un analisis valido para esta app, o esta danado.\n\nPrueba con un JSON descargado desde esta misma app.");
    }
  };

  reader.onerror = () => {
    alert("No se pudo leer el archivo JSON.\n\nEl navegador no logro abrir el archivo seleccionado. Revisa que el archivo exista y vuelve a intentarlo.");
  };

  reader.readAsText(file, "utf8");
  event.target.value = "";
}

function getSelectedSvg() {
  return els.pages.querySelector(`.scoreSvg[data-page="${selected.page}"]`) || els.pages.querySelector(".scoreSvg");
}

function exportPdf() {
  try {
    window.print();
  } catch (error) {
    console.warn(error);
    alert("No se pudo abrir la ventana para exportar PDF.\n\nPrueba usando la opcion Imprimir del navegador y elige Guardar como PDF.");
  }
}

async function exportSelectedPagePng() {
  const svg = getSelectedSvg();
  if (!svg) {
    alert("No hay una pagina lista para exportar.\n\nAbre o crea un analisis y vuelve a intentar exportar la imagen.");
    return;
  }

  let url = "";

  try {
    const clone = svg.cloneNode(true);
    clone.querySelectorAll(".hit").forEach(el => el.remove());

    const source = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    url = URL.createObjectURL(svgBlob);
  } catch (error) {
    console.warn(error);
    alert("No se pudo preparar la pagina para exportar imagen.\n\nGuarda una copia con Descargar JSON y vuelve a intentar.");
    return;
  }

  const img = new Image();
  img.onload = () => {
    try {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = Number(song.settings.pageWidth) * scale;
      canvas.height = Number(song.settings.pageHeight) * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = song.settings.pageBackground || "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(blob => {
        if (blob) {
	          downloadBlob(blob, `${exportFilenameBase()} - pag ${selected.page + 1}.png`);
          return;
        }

        alert("No se pudo crear el archivo PNG.\n\nPrueba exportar como SVG o PDF, o vuelve a intentarlo despues de guardar el JSON.");
      }, "image/png");
    } catch (error) {
      URL.revokeObjectURL(url);
      console.warn(error);
      alert("No se pudo crear la imagen PNG.\n\nPrueba exportar como SVG o PDF, o vuelve a intentarlo despues de guardar el JSON.");
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert("No se pudo exportar la imagen PNG.\n\nEl navegador no pudo convertir la pagina SVG en imagen. Prueba exportar como SVG o PDF.");
  };

  img.src = url;
}

function exportSelectedPageSvg() {
  const svg = getSelectedSvg();
  if (!svg) {
    alert("No hay una pagina lista para exportar.\n\nAbre o crea un analisis y vuelve a intentar exportar SVG.");
    return;
  }

  try {
    const clone = svg.cloneNode(true);
    clone.querySelectorAll(".hit").forEach(el => el.remove());
    clone.setAttribute("xmlns", NS);
    const source = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, `${exportFilenameBase()} - pag ${selected.page + 1}.svg`);
  } catch (error) {
    console.warn(error);
    alert("No se pudo exportar el SVG.\n\nGuarda una copia con Descargar JSON y vuelve a intentarlo.");
  }
}


function serializableSong() {
  normalizeSectionLabelsInDocument();
  return JSON.parse(JSON.stringify(song, (key, value) => {
    if (key.startsWith("_")) return undefined;
    return value;
  }));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setDirty(value) {
  dirty = value;
  if (value) pushHistory();
  els.status.textContent = value
    ? `Cambios sin guardar · Undo ${Math.max(0, historyStack.length - 1)} · Redo ${redoStack.length}`
    : (currentFilename ? `Guardado: ${currentFilename}` : "Sin guardar");
  refreshUndoRedoButtons();
}

function updateStatus(message) {
  if (els.status) {
    els.status.textContent = message || "";
  }
}

function exportFilenameBase() {
  const title = normalizeTextSymbols(song?.title || "analisis").trim() || "analisis";
  const readable = title
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${readable || "analisis"} - ATA`;
}

function slugify(value) {
  return String(value || "analisis")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "analisis";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}
