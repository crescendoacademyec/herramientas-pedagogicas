/* Armonía Jazz — Crescendo Academy
   Generador de diagramas visuales (piano y mapa de notas en guitarra) y
   base de datos de referencia de acordes, escala octatónica y estructuras superiores.
   Todo el contenido es original, generado programáticamente a partir de fórmulas de intervalos. */

(function (global) {
  "use strict";

  var NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  function noteName(semitone) {
    return NOTE_NAMES[((semitone % 12) + 12) % 12];
  }

  // ---------- Diagrama de piano (una octava, C a B) ----------
  var KEY_POS = {
    0: { type: "w", x: 0 },
    1: { type: "b", x: 20 },
    2: { type: "w", x: 28 },
    3: { type: "b", x: 48 },
    4: { type: "w", x: 56 },
    5: { type: "w", x: 84 },
    6: { type: "b", x: 104 },
    7: { type: "w", x: 112 },
    8: { type: "b", x: 132 },
    9: { type: "w", x: 140 },
    10: { type: "b", x: 160 },
    11: { type: "w", x: 168 }
  };
  var WHITE_ORDER = [0, 2, 4, 5, 7, 9, 11];
  var BLACK_ORDER = [1, 3, 6, 8, 10];

  function pianoSVG(formula, rootPc) {
    var set = {};
    formula.forEach(function (n) { set[((n % 12) + 12) % 12] = true; });
    var root = ((rootPc || 0) % 12 + 12) % 12;

    var whiteW = 28, whiteH = 92, blackW = 16, blackH = 56;
    var parts = [];
    parts.push('<svg viewBox="0 0 200 100" class="jz-piano" role="img" aria-label="Diagrama de piano">');

    // teclas blancas
    WHITE_ORDER.forEach(function (n) {
      var pos = KEY_POS[n];
      var on = !!set[n];
      var isRoot = n === root;
      parts.push('<rect x="' + (pos.x + 2) + '" y="2" width="' + (whiteW - 4) + '" height="' + whiteH + '" rx="3" ' +
        'class="jz-key jz-key-w' + (on ? " jz-key-on" : "") + (isRoot && on ? " jz-key-root" : "") + '"></rect>');
      if (on) {
        parts.push('<circle cx="' + (pos.x + whiteW / 2) + '" cy="' + (whiteH - 14) + '" r="6" class="jz-dot' + (isRoot ? " jz-dot-root" : "") + '"></circle>');
      }
    });
    // teclas negras (encima)
    BLACK_ORDER.forEach(function (n) {
      var pos = KEY_POS[n];
      var on = !!set[n];
      parts.push('<rect x="' + pos.x + '" y="2" width="' + blackW + '" height="' + blackH + '" rx="2" ' +
        'class="jz-key jz-key-b' + (on ? " jz-key-on" : "") + '"></rect>');
      if (on) {
        parts.push('<circle cx="' + (pos.x + blackW / 2) + '" cy="' + (blackH - 12) + '" r="5" class="jz-dot jz-dot-black' + (n === root ? " jz-dot-root" : "") + '"></circle>');
      }
    });

    parts.push("</svg>");
    return parts.join("");
  }

  // ---------- Mapa de notas en guitarra (afinación estándar, 5 trastes) ----------
  // Cuerdas de grave a aguda: E A D G B E -> clases de altura relativas a C
  var STRING_OPEN = [4, 9, 2, 7, 11, 4];
  var STRING_LABELS = ["E", "A", "D", "G", "B", "E"];

  function guitarSVG(formula, rootPc) {
    var set = {};
    formula.forEach(function (n) { set[((n % 12) + 12) % 12] = true; });
    var root = ((rootPc || 0) % 12 + 12) % 12;

    var nStrings = 6, nFrets = 5;
    var stringGap = 22, fretGap = 24;
    var marginL = 26, marginT = 20;
    var w = marginL + stringGap * (nStrings - 1) + 20;
    var h = marginT + fretGap * nFrets + 16;

    var parts = [];
    parts.push('<svg viewBox="0 0 ' + w + ' ' + h + '" class="jz-guitar" role="img" aria-label="Mapa de notas en guitarra">');

    // nut (traste 0, más grueso)
    parts.push('<rect x="' + (marginL - 8) + '" y="' + marginT + '" width="' + (stringGap * (nStrings - 1) + 16) + '" height="4" class="jz-nut"></rect>');

    // trastes
    for (var f = 1; f <= nFrets; f++) {
      var y = marginT + f * fretGap;
      parts.push('<line x1="' + (marginL - 8) + '" y1="' + y + '" x2="' + (marginL + stringGap * (nStrings - 1) + 8) + '" y2="' + y + '" class="jz-fret"></line>');
    }
    // cuerdas
    for (var s = 0; s < nStrings; s++) {
      var x = marginL + s * stringGap;
      parts.push('<line x1="' + x + '" y1="' + marginT + '" x2="' + x + '" y2="' + (marginT + nFrets * fretGap) + '" class="jz-string"></line>');
      parts.push('<text x="' + x + '" y="' + (marginT - 6) + '" class="jz-string-label" text-anchor="middle">' + STRING_LABELS[s] + '</text>');
    }

    // notas en cada cruce cuerda/traste (0 a nFrets)
    for (var si = 0; si < nStrings; si++) {
      for (var fr = 0; fr <= nFrets; fr++) {
        var pc = (STRING_OPEN[si] + fr) % 12;
        if (!set[pc]) continue;
        var isRoot = pc === root;
        var xx = marginL + si * stringGap;
        var yy = fr === 0 ? marginT - 6 : marginT + (fr - 0.5) * fretGap;
        parts.push('<circle cx="' + xx + '" cy="' + yy + '" r="7" class="jz-fret-dot' + (isRoot ? " jz-fret-dot-root" : "") + '"></circle>');
      }
    }

    parts.push("</svg>");
    return parts.join("");
  }

  // ---------- Formas cerradas de guitarra para drop voicings (trastes reales, no solo mapa de notas) ----------
  // Afinación estándar: valores absolutos de semitono de cada cuerda al aire, anclados a C=0.
  // (E2=4, A2=9, D3=14, G3=19, B3=23, E4=28 respecto a un Do de referencia).
  var STRING_ABS_OPEN_LOW_TO_HIGH = { 6: 4, 5: 9, 4: 14, 3: 19, 2: 23, 1: 28 };

  // Dado un acorde de 4 sonidos (fórmula ordenada [R,3,5,7] en semitonos desde la raíz) y una raíz absoluta
  // ya ubicada en un traste de la cuerda base, calcula el traste de cada una de las 4 cuerdas siguientes
  // para producir un "drop 2 con la raíz en el bajo" (ver derivación: 2ª inversión de la posición cerrada,
  // soltando la 2ª voz desde arriba una octava, da como resultado el orden R-5-7-3 de grave a agudo).
  function computeDrop2Shape(formula, baseString, rootFret) {
    var t = formula.slice().sort(function (a, b) { return a - b; }); // [t0=0, t1, t2, t3]
    var seq = [t[0], t[2], t[3], t[1]]; // orden grave->agudo: R, 5ª-equiv, 7ª-equiv, 3ª-equiv
    var strings = [baseString, baseString - 1, baseString - 2, baseString - 3];
    var frets = [];
    var prevAbs = null;
    for (var i = 0; i < 4; i++) {
      var open = STRING_ABS_OPEN_LOW_TO_HIGH[strings[i]];
      var wantedPc = ((seq[i] % 12) + 12) % 12;
      if (i === 0) {
        frets.push(rootFret);
        prevAbs = open + rootFret;
        continue;
      }
      // buscar el traste más pequeño (>=0) que dé la altura absoluta más próxima por encima de la anterior
      var found = null;
      for (var f = 0; f <= 15; f++) {
        var abs = open + f;
        if (abs > prevAbs && ((abs % 12) + 12) % 12 === wantedPc) { found = f; break; }
      }
      if (found === null) found = 0; // fallback de seguridad, no debería ocurrir con acordes de 4 sonidos válidos
      frets.push(found);
      prevAbs = open + found;
    }
    return { strings: strings, frets: frets };
  }

  var STRING_NAMES = { 6: "6ª (E)", 5: "5ª (A)", 4: "4ª (D)", 3: "3ª (G)", 2: "2ª (B)", 1: "1ª (E)" };

  function guitarShapeSVG(shape) {
    var strings = shape.strings, frets = shape.frets;
    var minFret = Math.min.apply(null, frets);
    var maxFret = Math.max.apply(null, frets);
    var startFret = Math.max(1, minFret - 1);
    var nFretsShown = Math.max(4, maxFret - startFret + 2);
    var nStrings = 4;
    var stringGap = 26, fretGap = 26, marginL = 30, marginT = 26;
    var w = marginL + stringGap * (nStrings - 1) + 24;
    var h = marginT + fretGap * nFretsShown + 14;

    var parts = [];
    parts.push('<svg viewBox="0 0 ' + w + ' ' + h + '" class="jz-guitar-shape" role="img" aria-label="Forma de guitarra">');
    parts.push('<text x="' + (marginL - 20) + '" y="' + (marginT + fretGap * 0.7) + '" class="jz-fret-num">' + startFret + '</text>');

    for (var f = 0; f <= nFretsShown; f++) {
      var y = marginT + f * fretGap;
      parts.push('<line x1="' + marginL + '" y1="' + y + '" x2="' + (marginL + stringGap * (nStrings - 1)) + '" y2="' + y + '" class="jz-fret"></line>');
    }
    for (var s = 0; s < nStrings; s++) {
      var x = marginL + s * stringGap;
      parts.push('<line x1="' + x + '" y1="' + marginT + '" x2="' + x + '" y2="' + (marginT + nFretsShown * fretGap) + '" class="jz-string"></line>');
      parts.push('<text x="' + x + '" y="' + (marginT - 8) + '" class="jz-string-label" text-anchor="middle">' + strings[s] + '</text>');
    }
    for (var i = 0; i < 4; i++) {
      var relFret = frets[i] - startFret + 1;
      var xx = marginL + i * stringGap;
      var yy = marginT + (relFret - 0.5) * fretGap;
      var isRoot = i === 0;
      parts.push('<circle cx="' + xx + '" cy="' + yy + '" r="8" class="jz-fret-dot' + (isRoot ? " jz-fret-dot-root" : "") + '"></circle>');
    }
    parts.push("</svg>");
    return parts.join("");
  }

  function renderDropVoicingCard(symbol, formula) {
    var shape6 = computeDrop2Shape(formula, 6, 8);  // raíz en Do, traste 8, 6ª cuerda
    var shape5 = computeDrop2Shape(formula, 5, 3);  // raíz en Do, traste 3, 5ª cuerda
    return (
      '<div class="chord-card">' +
      '<div class="chord-card-symbol">' + symbol + " drop 2</div>" +
      '<div class="chord-card-notes">' + noteListLabel(formula) + '</div>' +
      '<div class="chord-diagrams drop-shapes">' +
      '<div class="diagram-block"><span class="diagram-label">Raíz en 6ª cuerda</span>' + guitarShapeSVG(shape6) + '</div>' +
      '<div class="diagram-block"><span class="diagram-label">Raíz en 5ª cuerda</span>' + guitarShapeSVG(shape5) + '</div>' +
      '</div>' +
      '</div>'
    );
  }

  var DROP2_CHORD_TYPES = [
    { symbol: "Cmaj7", formula: [0, 4, 7, 11] },
    { symbol: "Cm7", formula: [0, 3, 7, 10] },
    { symbol: "C7", formula: [0, 4, 7, 10] },
    { symbol: "Cm7b5", formula: [0, 3, 6, 10] },
    { symbol: "C°7", formula: [0, 3, 6, 9] },
    { symbol: "C6", formula: [0, 4, 7, 9] },
    { symbol: "Cm6", formula: [0, 3, 7, 9] },
    { symbol: "Cm(maj7)", formula: [0, 3, 7, 11] }
  ];

  function renderDropVoicingsSection() {
    var html = '<p class="ref-note">Estas son formas <b>cerradas y movibles</b> (drop 2, la más usada en guitarra):' +
      ' fija la raíz donde la necesites y desliza toda la forma arriba/abajo del mástil. Cada traste está calculado' +
      ' con la fórmula real del acorde, no es una aproximación — puedes confiar en que suenan correctas en cualquier' +
      ' posición.</p>';
    html += '<div class="chord-grid drop-grid">';
    DROP2_CHORD_TYPES.forEach(function (item) { html += renderDropVoicingCard(item.symbol, item.formula); });
    html += "</div>";
    return html;
  }

  function noteListLabel(formula) {
    return formula.map(function (n) { return noteName(n); }).join(" - ");
  }

  // ---------- Tabla completa de símbolos de acordes (todos en C) ----------
  var CHORD_GROUPS = [
    {
      title: "Tríadas y quintas",
      items: [
        { symbol: "C5", formula: [0, 7] },
        { symbol: "C", formula: [0, 4, 7] },
        { symbol: "C-", formula: [0, 3, 7] },
        { symbol: "C+", formula: [0, 4, 8] },
        { symbol: "C°", formula: [0, 3, 6] },
        { symbol: "Csus2", formula: [0, 2, 7] },
        { symbol: "Csus4", formula: [0, 5, 7] },
        { symbol: "Csus(2,4)", formula: [0, 2, 5, 7] }
      ]
    },
    {
      title: "Notas añadidas (add)",
      items: [
        { symbol: "Cadd2", formula: [0, 2, 4, 7] },
        { symbol: "C-(add2)", formula: [0, 2, 3, 7] },
        { symbol: "Cadd4", formula: [0, 4, 5, 7] },
        { symbol: "C-(add4)", formula: [0, 3, 5, 7] },
        { symbol: "Cadd9", formula: [0, 2, 4, 7] },
        { symbol: "C-(add9)", formula: [0, 2, 3, 7] }
      ]
    },
    {
      title: "Sextas y tétradas con 7ª",
      items: [
        { symbol: "C6", formula: [0, 4, 7, 9] },
        { symbol: "C-6", formula: [0, 3, 7, 9] },
        { symbol: "Cmaj7", formula: [0, 4, 7, 11] },
        { symbol: "C-(maj7)", formula: [0, 3, 7, 11] },
        { symbol: "C7", formula: [0, 4, 7, 10] },
        { symbol: "C-7", formula: [0, 3, 7, 10] },
        { symbol: "C6/9", formula: [0, 2, 4, 7, 9] },
        { symbol: "C-6/9", formula: [0, 2, 3, 7, 9] }
      ]
    },
    {
      title: "Tétradas alteradas y disminuidas",
      items: [
        { symbol: "C7sus4", formula: [0, 5, 7, 10] },
        { symbol: "C-7add4", formula: [0, 3, 5, 7, 10] },
        { symbol: "C7#5", formula: [0, 4, 8, 10] },
        { symbol: "C7b5", formula: [0, 4, 6, 10] },
        { symbol: "C-7b5", formula: [0, 3, 6, 10] },
        { symbol: "C°7", formula: [0, 3, 6, 9] },
        { symbol: "Cmaj7#5", formula: [0, 4, 8, 11] },
        { symbol: "Cmaj7b5", formula: [0, 4, 6, 11] }
      ]
    },
    {
      title: "Novenas (9)",
      items: [
        { symbol: "Cmaj9", formula: [0, 2, 4, 7, 11] },
        { symbol: "C9", formula: [0, 2, 4, 7, 10] },
        { symbol: "C-9", formula: [0, 2, 3, 7, 10] },
        { symbol: "C7b9", formula: [0, 1, 4, 7, 10] },
        { symbol: "C7#9", formula: [0, 3, 4, 7, 10] },
        { symbol: "C9#5", formula: [0, 2, 4, 8, 10] },
        { symbol: "C9b5", formula: [0, 2, 4, 6, 10] },
        { symbol: "C9sus4", formula: [0, 2, 5, 7, 10] }
      ]
    },
    {
      title: "Oncenas y trecenas (11, 13)",
      items: [
        { symbol: "C11", formula: [0, 2, 5, 7, 10] },
        { symbol: "C-11", formula: [0, 2, 3, 5, 7, 10] },
        { symbol: "C13", formula: [0, 2, 4, 7, 9, 10] },
        { symbol: "C13sus4", formula: [0, 2, 5, 7, 9, 10] },
        { symbol: "Cmaj13", formula: [0, 2, 4, 7, 9, 11] },
        { symbol: "C13b9", formula: [0, 1, 4, 7, 9, 10] },
        { symbol: "C13#9", formula: [0, 3, 4, 7, 9, 10] }
      ]
    },
    {
      title: "Con 11 aumentada (#11)",
      items: [
        { symbol: "C7#11", formula: [0, 4, 6, 7, 10] },
        { symbol: "Cmaj7#11", formula: [0, 4, 6, 7, 11] },
        { symbol: "C9#11", formula: [0, 2, 4, 6, 7, 10] },
        { symbol: "Cmaj9#11", formula: [0, 2, 4, 6, 7, 11] },
        { symbol: "C13#11", formula: [0, 2, 4, 6, 7, 9, 10] },
        { symbol: "C7(#9,b5)", formula: [0, 3, 4, 6, 10] },
        { symbol: "C7(b9,#5)", formula: [0, 1, 4, 8, 10] }
      ]
    }
  ];

  function renderChordCard(entry) {
    return (
      '<div class="chord-card">' +
      '<div class="chord-card-symbol">' + entry.symbol + '</div>' +
      '<div class="chord-card-notes">' + noteListLabel(entry.formula) + '</div>' +
      '<div class="chord-diagrams">' +
      '<div class="diagram-block"><span class="diagram-label">Piano</span>' + pianoSVG(entry.formula) + '</div>' +
      '<div class="diagram-block"><span class="diagram-label">Guitarra (mapa de notas)</span>' + guitarSVG(entry.formula) + '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function renderChordReferenceGrid() {
    var html = '<p class="ref-note">Todos los ejemplos están en C. El diagrama de guitarra muestra un <b>mapa de notas</b> ' +
      'del acorde en los primeros 5 trastes (no una digitación específica): cada punto es una nota válida del acorde, ' +
      'tú eliges cuáles tomar según el voicing que necesites.</p>';
    CHORD_GROUPS.forEach(function (group) {
      html += '<h4 class="chord-group-title">' + group.title + '</h4>';
      html += '<div class="chord-grid">';
      group.items.forEach(function (item) { html += renderChordCard(item); });
      html += '</div>';
    });
    return html;
  }

  // ---------- Escala / acordes octatónicos ----------
  var OCTATONIC_TS = [0, 2, 3, 5, 6, 8, 9, 11];  // tono-semitono
  var OCTATONIC_ST = [0, 1, 3, 4, 6, 7, 9, 10];  // semitono-tono

  function renderOctatonicSection() {
    var html = "";
    html += '<p>La escala <b>octatónica</b> (también llamada escala disminuida) tiene 8 notas y se construye ' +
      'alternando intervalos de <b>tono y semitono</b> en un patrón simétrico. Existen dos formas según con qué ' +
      'intervalo se empiece:</p>';
    html += '<div class="chord-grid">';
    html += '<div class="chord-card"><div class="chord-card-symbol">Octatónica tono-semitono</div>' +
      '<div class="chord-card-notes">' + noteListLabel(OCTATONIC_TS) + '</div>' +
      '<div class="chord-diagrams"><div class="diagram-block"><span class="diagram-label">Piano</span>' + pianoSVG(OCTATONIC_TS) + '</div></div></div>';
    html += '<div class="chord-card"><div class="chord-card-symbol">Octatónica semitono-tono</div>' +
      '<div class="chord-card-notes">' + noteListLabel(OCTATONIC_ST) + '</div>' +
      '<div class="chord-diagrams"><div class="diagram-block"><span class="diagram-label">Piano</span>' + pianoSVG(OCTATONIC_ST) + '</div></div></div>';
    html += "</div>";
    html += '<p>Como es una escala <b>simétrica</b>, solo existen <b>3 escalas octatónicas distintas</b> en total ' +
      '(cada una se repite a sí misma cada 3 semitonos). Por eso, cada escala octatónica contiene exactamente ' +
      '<b>4 acordes °7</b> distintos que comparten las mismas 8 notas (por ejemplo: C°7, Eb°7, Gb°7 y A°7 son, en ' +
      'realidad, el mismo conjunto de notas visto desde 4 fundamentales distintas).</p>';
    html += '<p><b>Acordes/voicings derivados de la octatónica (tono-semitono):</b> al apilar terceras dentro de esta ' +
      'escala se pueden formar voicings de "acorde dominante con todas las tensiones disponibles no alteradas" ' +
      '— por eso esta forma se usa sobre <b>V7(b9,#9,#11,13)</b>, un dominante muy denso y colorido característico ' +
      'del vocabulario post-bop.</p>';
    return html;
  }

  // ---------- Estructuras superiores (upper structure triads) ----------
  // Sistema numérico estándar 1-13 sobre un dominante V7, según qué tríada se toca sobre la 7ª/b7.
  var UPPER_STRUCTURES = [
    { num: "US 1", triad: "Tríada mayor sobre la fundamental", root: 0, quality: "mayor", tensions: "ninguna (acorde base)" },
    { num: "US 2", triad: "Tríada mayor sobre la 2ª (9)", root: 2, quality: "mayor", tensions: "9, #11, 13" },
    { num: "US 3", triad: "Tríada menor sobre la 2ª (9)", root: 2, quality: "menor", tensions: "9, 11, b13" },
    { num: "US 4", triad: "Tríada mayor sobre la b3 (#9)", root: 3, quality: "mayor", tensions: "#9, #11, 13" },
    { num: "US 5", triad: "Tríada mayor sobre la 3ª", root: 4, quality: "mayor", tensions: "3, 5, 9 (color suave)" },
    { num: "US 6", triad: "Tríada menor sobre la 3ª", root: 4, quality: "menor", tensions: "3, #9, 13" },
    { num: "US 7", triad: "Tríada mayor sobre la 4ª (#11)", root: 5, quality: "mayor", tensions: "#11, 13, 9" },
    { num: "US 8", triad: "Tríada aumentada sobre la b5", root: 6, quality: "aumentada", tensions: "#11, b13, 9" },
    { num: "US 9", triad: "Tríada menor sobre la #4 (b5)", root: 6, quality: "menor", tensions: "b5/#11, b9, b13" },
    { num: "US 10", triad: "Tríada mayor sobre la b6 (#5)", root: 8, quality: "mayor", tensions: "#5, b9, 11" },
    { num: "US 11", triad: "Tríada menor sobre la 6ª (13)", root: 9, quality: "menor", tensions: "13, b9, 11" },
    { num: "US 12", triad: "Tríada mayor sobre la b7", root: 10, quality: "mayor", tensions: "b7, 9, 11 (color modal)" },
    { num: "US 13", triad: "Tríada menor sobre la b7", root: 10, quality: "menor", tensions: "b7, 9, b13" }
  ];

  function triadFormula(root, quality) {
    var third = quality === "menor" ? 3 : 4;
    var fifth = quality === "aumentada" ? 8 : 7;
    return [0, root, root + third, root + fifth].map(function (n) { return ((n % 12) + 12) % 12; });
  }

  function renderUpperStructuresSection() {
    var html = '<p>Una <b>estructura superior</b> se cifra como fracción — tríada / acorde base — y se toca sobre ' +
      'el bajo del acorde original (normalmente un dominante). Berklee numera sistemáticamente 13 estructuras ' +
      'posibles según sobre qué grado y de qué calidad se construye la tríada superior. Aquí las 13, todas sobre ' +
      'un bajo de <b>C7</b>:</p>';
    html += '<div class="us-table-wrap"><table class="jz-table us-table">' +
      '<tr><th>#</th><th>Tríada superior</th><th>Cifrado</th><th>Tensiones que aporta</th><th>Piano (C7 + estructura)</th></tr>';
    UPPER_STRUCTURES.forEach(function (us) {
      var triadRootName = noteName(us.root);
      var qualityAbbr = us.quality === "menor" ? "m" : (us.quality === "aumentada" ? "+" : "");
      var label = triadRootName + qualityAbbr + "/C7";
      var formula = triadFormula(us.root, us.quality).concat([4, 7, 10]); // + 3ª, 5ª y b7 del C7 base
      html += "<tr><td>" + us.num + "</td><td>" + us.triad + "</td><td><code>" + label + "</code></td>" +
        "<td>" + us.tensions + "</td><td>" + pianoSVG(formula) + "</td></tr>";
    });
    html += "</table></div>";
    html += '<p class="small-note">Nota: la tabla muestra la tríada superior combinada con la 3ª, 5ª y 7ª del C7 base ' +
      'para que veas el acorde completo resultante en el piano; en la práctica, el bajista o la mano izquierda ' +
      'suelen tocar solo fundamental y 7ª, dejando que la tríada superior (mano derecha o guitarra) aporte el color.</p>';
    return html;
  }

  function renderProgressionGrid(items) {
    var html = '<div class="chord-grid">';
    items.forEach(function (item) {
      var root = item.rootPc || 0;
      html += '<div class="chord-card">' +
        '<div class="chord-card-symbol">' + item.symbol + '</div>' +
        '<div class="chord-card-notes">' + noteListLabel(item.formula) + '</div>' +
        '<div class="chord-diagrams">' +
        '<div class="diagram-block"><span class="diagram-label">Piano</span>' + pianoSVG(item.formula, root) + '</div>' +
        '<div class="diagram-block"><span class="diagram-label">Guitarra (mapa de notas)</span>' + guitarSVG(item.formula, root) + '</div>' +
        '</div></div>';
    });
    html += "</div>";
    return html;
  }

  global.ChordRef = {
    pianoSVG: pianoSVG,
    guitarSVG: guitarSVG,
    renderChordReferenceGrid: renderChordReferenceGrid,
    renderOctatonicSection: renderOctatonicSection,
    renderUpperStructuresSection: renderUpperStructuresSection,
    renderDropVoicingsSection: renderDropVoicingsSection,
    renderProgressionGrid: renderProgressionGrid
  };
})(window);
