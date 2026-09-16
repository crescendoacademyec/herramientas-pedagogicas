/* Armonía Funcional — Crescendo Academy
   Explorador de acordes: piano (1 o 2 octavas según haga falta), mapa de guitarra
   (voicing real, una nota por cuerda) y pentagrama, generados a partir de fórmulas
   de intervalos con ortografía musical correcta (deletreo por grados, no solo semitonos). */

(function (global) {
  "use strict";

  /* ============================ TEORÍA / DELETREO ============================ */

  var NATURAL_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  var NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];
  var DEGREE_BASE_SEMI = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 9: 14, 11: 17, 13: 21 };
  var DEGREE_LETTERSTEP = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 9: 1, 11: 3, 13: 5 };
  var ACC_VAL = { "": 0, "b": -1, "#": 1, "bb": -2, "##": 2 };
  var ACC_SYM = { "-2": "\u266D\u266D", "-1": "\u266D", "0": "", "1": "\u266F", "2": "\u266F\u266F" };
  var DEG_SCORE = { 1: 100, 3: 90, 7: 85, 6: 80, 2: 75, 4: 75, 9: 70, 11: 65, 13: 60, 5: 40 };

  var ROOTS = ["C", "D\u266D", "D", "E\u266D", "E", "F", "G\u266D", "G", "A\u266D", "A", "B\u266D", "B"];

  function rootInfo(name) {
    var isFlat = name.indexOf("\u266D") >= 0;
    var letter = name[0];
    var letterIdx = NATURAL_LETTERS.indexOf(letter);
    var acc = isFlat ? -1 : 0;
    var pc = ((NATURAL_PC[letterIdx] + acc) % 12 + 12) % 12;
    return { name: name, letter: letter, letterIdx: letterIdx, acc: acc, pc: pc };
  }

  function parseFormula(str) {
    return str.trim().split(/\s+/).map(function (tok) {
      var m = /^(bb|##|b|#)?(\d+)$/.exec(tok);
      var accTok = m[1] || "";
      var deg = Number(m[2]);
      return { deg: deg, accTok: accTok, semi: DEGREE_BASE_SEMI[deg] + ACC_VAL[accTok] };
    });
  }

  function accSymOf(accTok) {
    return accTok === "" ? "" : accTok.split("").map(function (c) { return c === "b" ? "\u266D" : "\u266F"; }).join("");
  }

  // Deletrea un tono (grado + semitonos) sobre una fundamental dada: devuelve nombre de nota correcto
  // (ej. Db9 -> Db, no C#), la clase de altura absoluta y cuántos pasos diatónicos lo separan de la raíz.
  function spell(root, tone) {
    var absPc = ((root.pc + tone.semi) % 12 + 12) % 12;
    var letterStep = DEGREE_LETTERSTEP[tone.deg];
    var letterIdx = (root.letterIdx + letterStep) % 7;
    var natPc = NATURAL_PC[letterIdx];
    var diff = ((absPc - natPc + 18) % 12) - 6;
    var key = String(diff);
    var accSym = ACC_SYM.hasOwnProperty(key) ? ACC_SYM[key] : "?";
    var diatonicStepsFromRoot = Math.floor(tone.semi / 12) * 7 + letterStep;
    return {
      deg: tone.deg,
      accTok: tone.accTok,
      tag: accSymOf(tone.accTok) + tone.deg,
      semi: tone.semi,
      pc: absPc,
      letterIdx: letterIdx,
      accSym: accSym,
      name: NATURAL_LETTERS[letterIdx] + accSym,
      diatonicStepsFromRoot: diatonicStepsFromRoot,
      isRoot: tone.deg === 1 && tone.semi === 0
    };
  }

  function svgLabel(chordName, instrument, tones) {
    var notes = tones.map(function (t) { return t.name; }).join(", ");
    return (chordName ? chordName + ". " : "") + instrument + ". Notas: " + notes + ".";
  }

  function escapeXmlAttr(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function chordTones(root, formulaStr) {
    var seen = {};
    return parseFormula(formulaStr).map(function (t) { return spell(root, t); }).filter(function (tone) {
      // Una fórmula mal formada nunca debe dibujar dos veces la misma altura.
      // Se conserva la primera grafía/grado, que es la intención armónica principal.
      var key = String(tone.semi);
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  /* ============================ BANCO DE 52 TIPOS DE ACORDE ============================ */
  /* Fórmulas completas (sin omisiones); coinciden con la convención del curso: "-" para menor,
     bb7 para la séptima disminuida, 11 asociada principalmente a acordes con 3ª menor, etc. */

  var CHORD_TYPES = [
    { cat: "Triadas", symbol: "5", label: "Power chord (5)", formula: "1 5" },
    { cat: "Triadas", symbol: "", label: "Mayor", formula: "1 3 5" },
    { cat: "Triadas", symbol: "-", label: "Menor", formula: "1 b3 5" },
    { cat: "Triadas", symbol: "+", label: "Aumentado", formula: "1 3 #5" },
    { cat: "Triadas", symbol: "\u00B0", label: "Disminuido", formula: "1 b3 b5" },
    { cat: "Triadas", symbol: "sus2", label: "Suspendido 2", formula: "1 2 5" },
    { cat: "Triadas", symbol: "sus4", label: "Suspendido 4", formula: "1 4 5" },
    { cat: "Triadas", symbol: "sus24", label: "Suspendido 2 y 4", formula: "1 2 4 5" },
    { cat: "Triadas", symbol: "add2", label: "Add 2", formula: "1 2 3 5" },
    { cat: "Triadas", symbol: "-(add2)", label: "Menor add 2", formula: "1 2 b3 5" },
    { cat: "Triadas", symbol: "add4", label: "Add 4", formula: "1 3 4 5" },
    { cat: "Triadas", symbol: "-(add4)", label: "Menor add 4", formula: "1 b3 4 5" },
    { cat: "Séptimas y sextas", symbol: "6", label: "Sexta", formula: "1 3 5 6" },
    { cat: "Séptimas y sextas", symbol: "-6", label: "Menor sexta", formula: "1 b3 5 6" },
    { cat: "Séptimas y sextas", symbol: "maj7", label: "Séptima mayor", formula: "1 3 5 7" },
    { cat: "Séptimas y sextas", symbol: "-(maj7)", label: "Menor con séptima mayor", formula: "1 b3 5 7" },
    { cat: "Séptimas y sextas", symbol: "7", label: "Séptima dominante", formula: "1 3 5 b7" },
    { cat: "Séptimas y sextas", symbol: "-7", label: "Séptima menor", formula: "1 b3 5 b7" },
    { cat: "Séptimas alteradas", symbol: "7sus4", label: "Dominante suspendido 4", formula: "1 4 5 b7" },
    { cat: "Séptimas alteradas", symbol: "-7add4", label: "Menor 7 add 4", formula: "1 b3 4 5 b7" },
    { cat: "Séptimas alteradas", symbol: "7#5", label: "Dominante aumentado", formula: "1 3 #5 b7" },
    { cat: "Séptimas alteradas", symbol: "7b5", label: "Dominante con 5\u266D", formula: "1 3 b5 b7" },
    { cat: "Séptimas alteradas", symbol: "-7b5", label: "Semidisminuido", formula: "1 b3 b5 b7" },
    { cat: "Séptimas alteradas", symbol: "\u00B07", label: "Séptima disminuida", formula: "1 b3 b5 bb7" },
    { cat: "Séptimas alteradas", symbol: "maj7#5", label: "Séptima mayor aumentada", formula: "1 3 #5 7" },
    { cat: "Séptimas alteradas", symbol: "maj7b5", label: "Séptima mayor con 5\u266D", formula: "1 3 b5 7" },
    { cat: "Novenas", symbol: "add9", label: "Add 9", formula: "1 3 5 9" },
    { cat: "Novenas", symbol: "-(add9)", label: "Menor add 9", formula: "1 b3 5 9" },
    { cat: "Novenas", symbol: "maj9", label: "Novena mayor", formula: "1 3 5 7 9" },
    { cat: "Novenas", symbol: "9", label: "Novena dominante", formula: "1 3 5 b7 9" },
    { cat: "Novenas", symbol: "7b9", label: "Dominante con \u266D9", formula: "1 3 5 b7 b9" },
    { cat: "Novenas", symbol: "7#9", label: "Dominante con \u266F9", formula: "1 3 5 b7 #9" },
    { cat: "Novenas", symbol: "-9", label: "Menor novena", formula: "1 b3 5 b7 9" },
    { cat: "Novenas", symbol: "9#5", label: "Novena con 5 aumentada", formula: "1 3 #5 b7 9" },
    { cat: "Novenas", symbol: "9b5", label: "Novena con 5\u266D", formula: "1 3 b5 b7 9" },
    { cat: "Novenas", symbol: "6/9", label: "Sexta con novena", formula: "1 3 5 6 9" },
    { cat: "Novenas", symbol: "-6/9", label: "Menor sexta con novena", formula: "1 b3 5 6 9" },
    { cat: "Novenas", symbol: "9sus4", label: "Novena suspendida", formula: "1 4 5 b7 9" },
    { cat: "Onceavas y treceavas", symbol: "11", label: "Onceava (sin 3ª)", formula: "1 5 b7 9 11" },
    { cat: "Onceavas y treceavas", symbol: "-11", label: "Onceava menor", formula: "1 b3 5 b7 9 11" },
    { cat: "Onceavas y treceavas", symbol: "13", label: "Treceava dominante", formula: "1 3 5 b7 9 13" },
    { cat: "Onceavas y treceavas", symbol: "13sus4", label: "Treceava suspendida", formula: "1 4 5 b7 9 13" },
    { cat: "Onceavas y treceavas", symbol: "maj13", label: "Treceava mayor", formula: "1 3 5 7 9 13" },
    { cat: "Onceavas y treceavas", symbol: "13b9", label: "Treceava con \u266D9", formula: "1 3 5 b7 b9 13" },
    { cat: "Onceavas y treceavas", symbol: "13#9", label: "Treceava con \u266F9", formula: "1 3 5 b7 #9 13" },
    { cat: "Con #11", symbol: "7#11", label: "Dominante con \u266F11", formula: "1 3 5 b7 #11" },
    { cat: "Con #11", symbol: "maj7#11", label: "Séptima mayor con \u266F11", formula: "1 3 5 7 #11" },
    { cat: "Con #11", symbol: "9#11", label: "Novena con \u266F11", formula: "1 3 5 b7 9 #11" },
    { cat: "Con #11", symbol: "maj9#11", label: "Novena mayor con \u266F11", formula: "1 3 5 7 9 #11" },
    { cat: "Con #11", symbol: "13#11", label: "Treceava con \u266F11", formula: "1 3 5 b7 9 #11 13" },
    { cat: "Dominantes alterados", symbol: "7(#9b5)", label: "Alterado (\u266F9 \u266D5)", formula: "1 3 b5 b7 #9" },
    { cat: "Dominantes alterados", symbol: "7(b9#5)", label: "Alterado (\u266D9 \u266F5)", formula: "1 3 #5 b7 b9" }
  ];

  /* ============================ PIANO (1 o 2 octavas) ============================ */

  var BLACK_PC = { 1: true, 3: true, 6: true, 8: true, 10: true };

  function buildPianoLayout(totalSemis, root) {
    var whiteW = 30, blackW = 17;
    var margin = 4;
    var keys = [];
    var whiteCount = 0;
    // El teclado siempre empieza en Do. Así las teclas negras conservan su posición
    // física real al cambiar la fundamental y las octavas son comparables entre acordes.
    for (var absoluteStep = 0; absoluteStep < totalSemis; absoluteStep++) {
      var pc = absoluteStep % 12;
      var isBlack = !!BLACK_PC[pc];
      if (isBlack) {
        keys.push({ absoluteStep: absoluteStep, isBlack: true, x: margin + whiteCount * whiteW - blackW / 2 });
      } else {
        keys.push({ absoluteStep: absoluteStep, isBlack: false, x: margin + whiteCount * whiteW });
        whiteCount += 1;
      }
    }
    return { keys: keys, whiteCount: whiteCount, whiteW: whiteW, blackW: blackW, margin: margin };
  }

  function pianoSVG(root, tones, chordName) {
    var rootAbsolute = root.pc; // el primer Do del teclado corresponde a C4
    var highest = tones.reduce(function (m, t) { return Math.max(m, rootAbsolute + t.semi); }, rootAbsolute);
    // C4 hasta el final de la octava que contiene la nota más aguda.
    var keyboardStart = 0;
    var totalSemis = Math.max(12, Math.ceil((highest + 1) / 12) * 12);
    var layout = buildPianoLayout(totalSemis, root);
    var whiteH = 104, blackH = 64;
    var matched = {};
    tones.forEach(function (t) { matched[rootAbsolute + t.semi - keyboardStart] = t; });

    var w = layout.margin + layout.whiteCount * layout.whiteW + 4;
    var h = whiteH + 22;
    var parts = [];
    parts.push('<svg viewBox="0 0 ' + w + ' ' + h + '" class="jz-piano" role="img" aria-label="' + escapeXmlAttr(svgLabel(chordName, "Piano", tones)) + '">');

    layout.keys.filter(function (k) { return !k.isBlack; }).forEach(function (k) {
      var tone = matched[k.absoluteStep];
      var cls = "jz-key jz-key-w" + (tone ? " jz-key-on" : "") + (tone && tone.isRoot ? " jz-key-root" : "");
      parts.push('<rect x="' + (k.x + 2) + '" y="2" width="' + (layout.whiteW - 4) + '" height="' + whiteH + '" rx="3" class="' + cls + '"></rect>');
      if (tone) {
        parts.push('<text x="' + (k.x + layout.whiteW / 2) + '" y="' + (whiteH - 10) + '" text-anchor="middle" class="jz-piano-label">' + tone.name + '</text>');
      }
    });
    layout.keys.filter(function (k) { return k.isBlack; }).forEach(function (k) {
      var tone = matched[k.absoluteStep];
      var cls = "jz-key jz-key-b" + (tone ? " jz-key-on" : "") + (tone && tone.isRoot ? " jz-key-root" : "");
      parts.push('<rect x="' + k.x + '" y="2" width="' + layout.blackW + '" height="' + blackH + '" rx="2" class="' + cls + '"></rect>');
      if (tone) {
        parts.push('<text x="' + (k.x + layout.blackW / 2) + '" y="' + (blackH - 8) + '" text-anchor="middle" class="jz-piano-label jz-piano-label-b">' + tone.name + '</text>');
      }
    });

    parts.push("</svg>");
    return parts.join("");
  }

  global.__ChordCore = {
    NATURAL_LETTERS: NATURAL_LETTERS, ROOTS: ROOTS, CHORD_TYPES: CHORD_TYPES, DEG_SCORE: DEG_SCORE,
    rootInfo: rootInfo, parseFormula: parseFormula, spell: spell, chordTones: chordTones,
    pianoSVG: pianoSVG, buildPianoLayout: buildPianoLayout
  };

  /* ============================ GUITARRA (voicing real, horizontal) ============================ */
  /* Cuerdas de arriba a abajo: 1ª a 6ª = E B G D A E (agudo arriba, grave abajo). */

  var STRING_OPEN_PC = [4, 11, 7, 2, 9, 4];
  // Alturas MIDI reales, de 1ª a 6ª cuerda: E4, B3, G3, D3, A2, E2.
  var STRING_OPEN_MIDI = [64, 59, 55, 50, 45, 40];
  var STRING_LABELS = ["E", "B", "G", "D", "A", "E"];

  function trimToPlayable(tones, maxNotes) {
    if (tones.length <= maxNotes) return tones.slice();
    var sorted = tones.slice().sort(function (a, b) { return (DEG_SCORE[a.deg] || 50) - (DEG_SCORE[b.deg] || 50); });
    var drop = sorted.slice(0, tones.length - maxNotes);
    return tones.filter(function (t) { return drop.indexOf(t) === -1; });
  }

  function findGuitarVoicing(root, tones) {
    var work = trimToPlayable(tones, 6);
    // El orden de las voces es parte del acorde: fundamental, tercera, quinta,
    // séptima y extensiones deben ascender sin cruces ni saltos de octava evitables.
    var orderedTones = work.slice().sort(function (a, b) { return a.semi - b.semi; });

    function search(span, maxStart) {
      var bestResult = null;
      for (var start = 0; start <= maxStart; start++) {
        var allowedFrets = [0];
        for (var f = start; f <= start + span; f++) if (allowedFrets.indexOf(f) === -1) allowedFrets.push(f);
        var candidates = orderedTones.map(function (tone) {
          var result = [];
          for (var si = 0; si < 6; si++) {
            for (var fi = 0; fi < allowedFrets.length; fi++) {
              var fret = allowedFrets[fi];
              var pc = (STRING_OPEN_PC[si] + fret) % 12;
              if (pc === tone.pc) result.push({
                si: si,
                fret: fret,
                midi: STRING_OPEN_MIDI[si] + fret,
                tone: tone
              });
            }
          }
          return result;
        });

        function backtrack(index, usedStrings, assignment) {
          if (index === orderedTones.length) {
            var sounding = assignment.slice().sort(function (a, b) { return a.midi - b.midi; });
            // Rechazar inversiones o cruces: la sucesión física grave→agudo debe
            // coincidir con la sucesión teórica de la fórmula.
            var ordered = sounding.every(function (note, i) { return note.tone === orderedTones[i]; });
            if (!ordered) return;
            var fretted = assignment.filter(function (a) { return a.fret > 0; }).map(function (a) { return a.fret; });
            var actualSpan = fretted.length ? Math.max.apply(null, fretted) - Math.min.apply(null, fretted) : 0;
            var pitchSpan = sounding.length > 1 ? sounding[sounding.length - 1].midi - sounding[0].midi : 0;
            var openPenalty = start > 4 ? assignment.filter(function (a) { return a.fret === 0; }).length * 10 : 0;
            var fretCost = assignment.reduce(function (sum, a) { return sum + a.fret; }, 0);
            // Primero minimiza la extensión sonora; después la apertura de la mano.
            var score = pitchSpan * 100 + actualSpan * 20 + openPenalty + fretCost + start;
            if (!bestResult || score < bestResult.totalScore) {
              bestResult = { start: start, assignment: assignment.slice(), totalScore: score };
            }
            return;
          }
          candidates[index].forEach(function (candidate) {
            if (usedStrings[candidate.si]) return;
            usedStrings[candidate.si] = true;
            assignment.push(candidate);
            backtrack(index + 1, usedStrings, assignment);
            assignment.pop();
            delete usedStrings[candidate.si];
          });
        }
        backtrack(0, {}, []);
      }
      return bestResult;
    }

    // primero intenta una posición compacta (5 trastes); si el voicing no cabe (acordes muy densos),
    // amplía la ventana progresivamente hasta encontrar una disposición válida.
    return search(4, 9) || search(6, 11) || search(11, 11);
  }

  function guitarSVG(root, tones, chordName) {
    var voicing = findGuitarVoicing(root, tones);
    var nStrings = 6;
    var stringGap = 34, fretGap = 54;
    var marginL = 60, marginT = 14;
    var frettedNotes = voicing ? voicing.assignment.filter(function (a) { return a.fret > 0; }) : [];
    var minFret = frettedNotes.length ? Math.min.apply(null, frettedNotes.map(function (a) { return a.fret; })) : 0;
    var showNut = minFret === 0;
    // Si hay cejilla, la rejilla dibuja a partir del traste 1 (el 0/al aire se marca aparte a la izquierda).
    // Si no hay cejilla, el primer traste de la ventana SÍ es una celda de la rejilla.
    var firstGridFret = showNut ? 1 : minFret;
    var maxFretUsed = voicing ? voicing.assignment.reduce(function (m, a) { return Math.max(m, a.fret); }, firstGridFret) : 4;
    var nFrets = Math.max(4, Math.min(13, maxFretUsed - firstGridFret + 1));

    var w = marginL + nFrets * fretGap + 24;
    var h = marginT + stringGap * (nStrings - 1) + 30;

    var byString = {};
    if (voicing) voicing.assignment.forEach(function (a) { byString[a.si] = a; });

    var parts = [];
    parts.push('<svg viewBox="0 0 ' + w + ' ' + h + '" class="jz-guitar-h" role="img" aria-label="' + escapeXmlAttr(svgLabel(chordName, "Guitarra, voicing sugerido", tones)) + '">');

    // etiquetas de cuerdas (izquierda) y líneas horizontales
    for (var s = 0; s < nStrings; s++) {
      var y = marginT + s * stringGap;
      parts.push('<text x="' + (marginL - 14) + '" y="' + (y + 4) + '" text-anchor="end" class="jz-string-label-h">' + STRING_LABELS[s] + '</text>');
      parts.push('<line x1="' + marginL + '" y1="' + y + '" x2="' + (marginL + nFrets * fretGap) + '" y2="' + y + '" class="jz-string-h"></line>');
    }
    // trastes verticales: línea i = límite antes del traste (firstGridFret + i)
    for (var f = 0; f <= nFrets; f++) {
      var x = marginL + f * fretGap;
      var isNutLine = showNut && f === 0;
      parts.push('<line x1="' + x + '" y1="' + marginT + '" x2="' + x + '" y2="' + (marginT + stringGap * (nStrings - 1)) + '" class="' + (isNutLine ? "jz-nut-h" : "jz-fret-h") + '"></line>');
    }
    // números de traste (uno por celda, alineados con el centro de cada celda)
    for (var fn = 0; fn < nFrets; fn++) {
      var fretNum = firstGridFret + fn;
      var cellX = marginL + (fn + 0.5) * fretGap;
      parts.push('<text x="' + cellX + '" y="' + (marginT + stringGap * (nStrings - 1) + 20) + '" text-anchor="middle" class="jz-fret-num-h">' + fretNum + '</text>');
    }

    // notas
    for (var si = 0; si < nStrings; si++) {
      var a = byString[si];
      if (!a) continue;
      var yy = marginT + si * stringGap;
      var colX;
      if (a.fret === 0) {
        colX = marginL - 30; // notas al aire, a la izquierda del diapasón
        parts.push('<line x1="' + colX + '" y1="' + yy + '" x2="' + (marginL - 10) + '" y2="' + yy + '" class="jz-open-tick"></line>');
      } else {
        colX = marginL + (a.fret - firstGridFret + 0.5) * fretGap;
      }
      var isRoot = a.tone.isRoot;
      parts.push('<circle cx="' + colX + '" cy="' + yy + '" r="12" data-note="' + a.tone.name + '" data-string="' + (si + 1) + '" data-fret="' + a.fret + '" class="jz-note-dot' + (isRoot ? " jz-note-dot-root" : "") + '"></circle>');
      parts.push('<text x="' + colX + '" y="' + (yy + 4) + '" text-anchor="middle" class="jz-note-dot-label">' + a.tone.name + '</text>');
    }

    parts.push("</svg>");
    return parts.join("");
  }

  global.__ChordCore.guitarSVG = guitarSVG;
  global.__ChordCore.findGuitarVoicing = findGuitarVoicing;
  global.__ChordCore.STRING_LABELS = STRING_LABELS;
  global.__ChordCore.STRING_OPEN_MIDI = STRING_OPEN_MIDI;

  /* ============================ PENTAGRAMA ============================ */
  /* Clave de sol. Línea inferior = Mi4 (staffStep 0). Cada staffStep = medio espacio (línea o espacio). */

  var LETTER_ORDER = ["C", "D", "E", "F", "G", "A", "B"];

  function staffStepOf(root, tone) {
    var rootDiatonic = 4 * 7 + LETTER_ORDER.indexOf(root.letter); // octava de referencia = 4
    var toneDiatonic = rootDiatonic + tone.diatonicStepsFromRoot;
    var e4Diatonic = 4 * 7 + LETTER_ORDER.indexOf("E");
    return toneDiatonic - e4Diatonic;
  }

  function staffSVG(root, tones, chordName) {
    var base={midi:60+root.pc,diatonic:28+root.letterIdx};
    // Mantiene exactamente las alturas y grados del modelo de acordes.
    return global.CrescendoPractice.staff(tones.map(function(t){return global.CrescendoPractice.spell(base,t.semi,t.diatonicStepsFromRoot);}),{stack:true});
  }

  global.__ChordCore.staffSVG = staffSVG;

  /* ============================ EXPLORADOR (selector + montaje) ============================ */

  function legendHTML(tones) {
    return tones.map(function (t) { return t.name + ' <span class="jz-legend-tag">(' + t.tag + ')</span>'; }).join(' \u00B7 ');
  }

  function formulaText(tones) {
    return tones.map(function (t) { return t.tag; }).join(' ');
  }

  function render(rootEl, rootName, chordType) {
    var root = rootInfo(rootName);
    var tones = chordTones(root, chordType.formula);
    var symbolName = rootName + chordType.symbol;

    rootEl.querySelector('[data-cx="name"]').textContent = symbolName;
    rootEl.querySelector('[data-cx="label"]').textContent = chordType.label;
    rootEl.querySelector('[data-cx="formula"]').textContent = formulaText(tones);
    rootEl.querySelector('[data-cx="staff"]').innerHTML = staffSVG(root, tones, symbolName);
    rootEl.querySelector('[data-cx="guitar"]').innerHTML = guitarSVG(root, tones, symbolName);
    rootEl.querySelector('[data-cx="piano"]').innerHTML = pianoSVG(root, tones, symbolName);
    rootEl.querySelector('[data-cx="legend"]').innerHTML = legendHTML(tones);
    var live = rootEl.querySelector('[data-cx="live"]');
    if (live) live.textContent = symbolName + ". " + chordType.label + ". Fórmula: " + formulaText(tones) + ". Notas: " + tones.map(function(t){return t.name;}).join(", ") + ".";
  }

  function mount(rootEl) {
    var cats = [];
    CHORD_TYPES.forEach(function (ct) { if (cats.indexOf(ct.cat) === -1) cats.push(ct.cat); });

    var rootOptions = ROOTS.map(function (r, i) { return '<option value="' + i + '">' + r + '</option>'; }).join("");
    var typeOptions = cats.map(function (cat) {
      var opts = CHORD_TYPES.map(function (ct, i) {
        return ct.cat === cat ? '<option value="' + i + '">' + ct.label + ' &mdash; ' + (ct.symbol || "(sin sufijo)") + '</option>' : "";
      }).join("");
      return '<optgroup label="' + cat + '">' + opts + '</optgroup>';
    }).join("");

    rootEl.innerHTML =
      '<div class="chord-explorer" aria-label="Referencia interactiva de acordes">' +
      '<p class="chord-explorer-help">Selecciona una fundamental y un tipo de acorde. La fórmula, el deletreo y los tres diagramas se actualizan juntos. La fundamental se destaca en dorado.</p>' +
      '<div class="chord-explorer-controls">' +
      '<label class="field-inline">Fundamental<select data-cx="root" aria-label="Fundamental del acorde">' + rootOptions + '</select></label>' +
      '<label class="field-inline">Tipo de acorde<select data-cx="type" aria-label="Tipo de acorde">' + typeOptions + '</select></label>' +
      '</div>' +
      '<div class="chord-explorer-head">' +
      '<div class="chord-explorer-name" data-cx="name">C</div>' +
      '<div class="chord-explorer-sub"><span data-cx="label"></span> &middot; <code data-cx="formula"></code></div>' +
      '<div class="chord-explorer-legend" data-cx="legend"></div>' +
      '<p class="sr-only" data-cx="live" aria-live="polite"></p>' +
      '</div>' +
      '<div class="chord-explorer-panels">' +
      '<section class="chord-panel" aria-label="Representación en pentagrama"><div class="diagram-label">Pentagrama</div><div class="diagram-scroll" data-cx="staff"></div></section>' +
      '<section class="chord-panel" aria-label="Representación en guitarra"><div class="diagram-label">Guitarra · voicing sugerido</div><p class="diagram-note">Una disposición práctica posible; no es la única digitación válida.</p><div class="diagram-scroll" data-cx="guitar"></div></section>' +
      '<section class="chord-panel" aria-label="Representación en piano"><div class="diagram-label">Piano</div><div class="diagram-scroll" data-cx="piano"></div></section>' +
      '</div>' +
      '</div>';

    var rootSel = rootEl.querySelector('[data-cx="root"]');
    var typeSel = rootEl.querySelector('[data-cx="type"]');
    // por defecto: C mayor (tipo con symbol "" en la categoría Triadas)
    var defaultTypeIdx = 0;
    for (var i = 0; i < CHORD_TYPES.length; i++) { if (CHORD_TYPES[i].symbol === "" && CHORD_TYPES[i].cat === "Triadas") { defaultTypeIdx = i; break; } }
    typeSel.value = String(defaultTypeIdx);

    function update() {
      var rootName = ROOTS[Number(rootSel.value)];
      var chordType = CHORD_TYPES[Number(typeSel.value)];
      render(rootEl, rootName, chordType);
    }
    rootSel.addEventListener("change", update);
    typeSel.addEventListener("change", update);
    update();
  }

  global.ChordRef = {
    mount: mount,
    rootInfo: rootInfo,
    chordTones: chordTones,
    pianoSVG: pianoSVG,
    guitarSVG: guitarSVG,
    staffSVG: staffSVG,
    CHORD_TYPES: CHORD_TYPES,
    ROOTS: ROOTS
  };
})(typeof window !== "undefined" ? window : this);
