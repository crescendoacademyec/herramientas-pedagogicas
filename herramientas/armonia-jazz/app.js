/* Armonía Jazz — Crescendo Academy
   Lógica de la aplicación: selector de nivel, navegación, teoría y cuestionario. */

(function () {
  "use strict";

  var STORAGE_KEY = "armonia-jazz-state-v1";

  var state = {
    levelIndex: 0,
    view: "home",
    topicIndex: 0,
    studiedTopics: {},   // { "n1-0": true, ... }
    practiceChecks: {},
    curriculumEvidence: {},
    curriculumVersion: 2,
    quiz: null           // Incluye una copia ordenada de las preguntas de cada intento nuevo.
  };

  function currentLevel() {
    return LEVELS[state.levelIndex];
  }

  // ---------- Persistencia local ----------
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* almacenamiento no disponible: continuar sin persistir */ }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      state.levelIndex = Number.isInteger(saved.levelIndex) && saved.levelIndex >= 0 && saved.levelIndex < LEVELS.length ? saved.levelIndex : 0;
      // La versión 2 añade una estación de preparación al inicio de cada nivel.
      // Conserva al estudiante en el mismo tema que estaba viendo antes del cambio.
      state.topicIndex = Math.min(currentLevel().topics.length - 1, Math.max(0,
        (saved.topicIndex || 0) + ((saved.curriculumVersion || 1) < 2 ? 1 : 0)));
      state.studiedTopics = saved.studiedTopics || {};
      state.practiceChecks = saved.practiceChecks || {};
      state.curriculumEvidence = saved.curriculumEvidence || {};
      state.curriculumVersion = 2;
      if (saved.quiz && saved.quiz.startedAt && LEVELS.some(function (level) { return level.slug === saved.quiz.levelSlug; })) {
        state.quiz = saved.quiz;
        if (!Array.isArray(state.quiz.questionSnapshot)) {
          // Los intentos anteriores conservan sus índices de respuesta originales.
          state.quiz.questionSnapshot = LEVELS.find(function (level) { return level.slug === state.quiz.levelSlug; }).quiz;
        }
        if (!Array.isArray(state.quiz.answers) || state.quiz.answers.length !== state.quiz.questionSnapshot.length) state.quiz = null;
      }
    } catch (e) { /* ignorar estado corrupto */ }
  }

  // ---------- Render: selector de nivel ----------
  function renderLevelsOverview() {
    var grid = document.getElementById("levelsOverviewGrid");
    grid.innerHTML = "";
    LEVELS.forEach(function (lvl, idx) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "level-card" + (idx === state.levelIndex ? " active" : "");
      card.innerHTML =
        '<span class="level-card-num">Nivel ' + lvl.id + '</span>' +
        '<h4>' + lvl.name + '</h4>' +
        '<p>' + lvl.subtitle + '</p>' +
        '<span class="level-card-meta">' + lvl.topics.length + ' temas · ' + lvl.quiz.length + ' preguntas</span>';
      card.addEventListener("click", function () {
        if (state.quiz && !state.quiz.submitted) return;
        state.levelIndex = idx;
        state.topicIndex = 0;
        saveState();
        renderAll();
      });
      grid.appendChild(card);
    });
  }

  function populateGeneratedDiagrams(scope) {
    var bluesMount = scope.querySelector("#bluesFormMount");
    if (bluesMount && window.BluesForm) window.BluesForm.mount(bluesMount);
    var turnaroundMount = scope.querySelector("#turnaroundFormMount");
    if (turnaroundMount && window.BluesForm) window.BluesForm.mountTurnaround(turnaroundMount);
    var labMount = scope.querySelector("#instrumentLabMount");
    if (labMount && window.ChordLab) window.ChordLab.mount(labMount);
    var visualMounts = scope.querySelectorAll(".theory-visual-mount");
    for (var j = 0; j < visualMounts.length; j++) {
      if (window.TheoryVisuals) window.TheoryVisuals.mount(visualMounts[j], visualMounts[j].getAttribute("data-viz"));
    }
    if (!window.ChordRef) return; // chords-ref.js no cargó: continuar sin diagramas
    var chordMount = scope.querySelector("#chordRefMount");
    if (chordMount) chordMount.innerHTML = window.ChordRef.renderChordReferenceGrid();
    var octChordMount = scope.querySelector("#octatonicChordMount");
    if(octChordMount){
      var octRoot = 10;
      function drawOctChord(){
        octChordMount.innerHTML = window.ChordRef.renderOctatonicChord(octRoot);
        octChordMount.querySelector('[data-octatonic-root]').addEventListener('change', function(event){
          octRoot = Number(event.target.value);
          drawOctChord();
          octChordMount.querySelector('[data-octatonic-root]').focus();
        });
        octChordMount.querySelectorAll('[data-octatonic-play]').forEach(function(button){
          button.addEventListener('click', function(){
            var notes = button.dataset.octatonicPlay === 'guitar'
              ? window.ChordRef.octatonicGuitar(octRoot).midis
              : window.ChordRef.octatonicChord(octRoot).midis;
            if(window.TheoryVisuals) window.TheoryVisuals.playNotes(
              button.dataset.octatonicPlay === 'triad' ? notes.slice(1) : notes,
              {duration:1.8, gain:.5, instrument:button.dataset.octatonicPlay === 'guitar' ? 'guitar' : undefined}
            );
          });
        });
      }
      drawOctChord();
    }
    var octMount = scope.querySelector("#octatonicMount");
    if (octMount && window.ChordLab) window.ChordLab.mount(octMount, { group: "scale", item: "diminishedWH", title: "Escalas octatónicas" });
    else if (octMount) octMount.innerHTML = window.ChordRef.renderOctatonicSection();
    var minorSixMount = scope.querySelector("#minorSixPentatonicMount");
    if (minorSixMount && window.ChordLab) window.ChordLab.mount(minorSixMount, { group: "scale", item: "minorSixPentatonic", title: "Pentatónica menor 6 y sus aplicaciones" });
    var glossaryMount = scope.querySelector("#jazzGlossaryLabMount");
    if (glossaryMount && window.ChordLab) window.ChordLab.mount(glossaryMount, { group: "scale", item: "bebopDominant", title: "Glosario visual interactivo" });
    var usMount = scope.querySelector("#upperStructMount");
    if (usMount) usMount.innerHTML = window.ChordRef.renderUpperStructuresSection();
    var dropMount = scope.querySelector("#dropVoicingMount");
    if (dropMount && window.ChordLab) window.ChordLab.mount(dropMount, { group: "chord", item: "maj7", title: "Tétradas y regiones para voicings" });
    else if (dropMount) dropMount.innerHTML = window.ChordRef.renderDropVoicingsSection();
    var progMounts = scope.querySelectorAll(".progression-mount");
    for (var i = 0; i < progMounts.length; i++) {
      var el = progMounts[i];
      try {
        var items = JSON.parse(el.getAttribute("data-progression"));
        if (window.ChordLab) window.ChordLab.mountProgression(el, items);
        else el.innerHTML = window.ChordRef.renderProgressionGrid(items);
      } catch (e) { /* atributo mal formado: se ignora silenciosamente */ }
    }
  }

  var TOPIC_VISUALS = {
    "1.1 Cifrado de acordes jazz": "symbols",
    "1.4 Extensiones diatónicas básicas": "extensions",
    "1.6 Inversiones y bajo (slash chords)": "inversions",
    "1.7 Relación básica acorde-escala": "chordScale",
    "1.8 Lectura de lead sheets y el Real Book": "leadSheet",
    "1.9 Funciones armónicas: tónico, subdominante y dominante": "functions",
    "1.9b Ritmo armónico y peso métrico": "harmonicRhythm",
    "1.9c Relación melodía–armonía y notas disponibles": "melodyHarmony",
    "2.3 Dominantes secundarios": "secondary",
    "2.4 Sustitución tritonal": "tritone",
    "2.5 Modos y relación acorde-escala": "modes",
    "2.7 ii-V encadenados y ciclo de quintas": "chain",
    "2.8 Campo armónico completo: menor armónica y menor melódica": "minorFields",
    "2.10 Tipos de cadencia: auténtica, plagal, semicadencia y deceptiva": "cadences",
    "2.10b Modos completos de la menor melódica": "melodicModes",
    "2.10c Escala mayor armónica y cuatro centros tonales": "tonalCenters",
    "3.1 Intercambio modal": "modalInterchange",
    "3.2 Dominantes sustitutos extendidos": "dominantExt",
    "3.3 Técnicas básicas de reharmonización": "reharm",
    "3.5 Forma AABA y rhythm changes": "aaba",
    "3.9 Ciclo de Coltrane y sustituciones por terceras mayores": "coltrane",
    "3.10 Constant structure (CSCP)": "constant",
    "3.11 Modulación: directa y por acorde pivote": "modulation",
    "3.11b Cromatismo modal y sustitución escalar": "scaleSubstitution",
    "3.11c Rearmonización desde la melodía": "melodyReharm",
    "4.3 Armonía no funcional y pandiatonicismo": "pandiatonic",
    "4.4 Escalas modales contemporáneas": "contemporaryModes",
    "4.5 Fundamentos de composición jazz": "composition",
    "4.8 Pedal de bajo y pedal armónico": "pedal",
    "4.9 Armonía negativa": "negative",
    "4.10 Acordes de función especial": "specialFunctions",
    "4.11 Acordes compuestos: sobre bajo, inversión, híbrido y acorde sobre acorde": "compound",
    "4.12 Conducción de voces básica para arreglo": "voiceLeading"
    ,"4.12b Triad pairs y permutaciones": "triadPairs"
    ,"4.12c Armonización desde la voz superior y ostinato": "topVoiceOstinato"
    ,"5.1 Pentatónicas, blues y superposiciones": "pentatonicLab"
    ,"5.2 Swing, articulación y anticipación": "swingMap"
    ,"5.3 Cromatismo y vocabulario bebop": "bebopLine"
    ,"5.4 Notas objetivo y líneas de guide tones": "guideToneLine"
    ,"5.5 Desarrollo motívico y permutaciones": "motiveLab"
    ,"5.6 Improvisación sobre ii–V–I y turnarounds": "iiVImprovisation"
    ,"5.7 Triad pairs, cuartas y recursos outside": "outsideLab"
    ,"5.8 Entrenamiento auditivo y práctica sobre standards": "earPath"
    ,"5.9 Glosario práctico de interpretación jazz": "jazzTerms"
    ,"5.10 Referencia rápida de escalas y voicings": "symmetricFamilies"
  };

  // ---------- Navegación entre vistas ----------
  function setView(view) {
    if (state.quiz && !state.quiz.submitted && view === "theory") {
      // bloqueado: forzar a permanecer en cuestionario
      view = "quiz";
    }
    state.view = view;
    ["home", "theory", "improv", "library", "quiz"].forEach(function (v) {
      document.getElementById(v + "View").classList.toggle("hidden", v !== view);
    });
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-view") === view);
    });
    document.getElementById("lockBanner").classList.toggle("hidden", !(state.quiz && !state.quiz.submitted));
    if (history.replaceState) history.replaceState(null, "", "#" + view + "View");
    saveState();
  }

  // ---------- Render: inicio ----------
  function renderHome() {
    var lvl = currentLevel();
    document.getElementById("moduleLabel").textContent = "Nivel " + lvl.id + " · " + lvl.name;
    document.getElementById("moduleIntro").textContent = lvl.subtitle;
    document.getElementById("topicCount").textContent = lvl.topics.length;
    document.getElementById("questionCount").textContent = lvl.quiz.length;
    var subtitleEl = document.getElementById("levelSubtitle");
    var subtitleText = "Nivel " + lvl.id + " · " + lvl.name + " — " + lvl.subtitle;
    if (subtitleEl) {
      subtitleEl.textContent = subtitleText;
      subtitleEl.title = subtitleText;
    }
    renderLevelsOverview();
  }

  var CURRICULUM = {
    1: { prerequisite: "Cifrado básico, escala mayor y lectura de símbolos de acorde.", diagnostic: ["Construyo Cmaj7, Dm7, G7 y Bm7♭5 sin ayuda.", "Canto la función ii–V–I y reconozco tensión y resolución.", "Toco shells de ii–V–I en C, F y Bb."], project: "Analiza y acompaña un ii–V–I de un standard sencillo con shells y notas guía.", repertoire: "Autumn Leaves o Blue Bossa" },
    2: { prerequisite: "Nivel 1: campo mayor, ii–V–I y notas guía.", diagnostic: ["Distingo ii–V–I mayor de iiø–V7(♭9)–i.", "Localizo el dominante secundario de un grado.", "Escucho el tritono que resuelve en un dominante."], project: "Analiza ocho compases menores y prueba una sustitución que conserve la resolución.", repertoire: "Alone Together, Equinox o There Will Never Be Another You" },
    3: { prerequisite: "Nivel 2: campo menor, cadencias, dominantes secundarios y sustitución tritonal.", diagnostic: ["Separo intercambio modal de una modulación.", "Conduzco terceras y séptimas en un ii–V–I.", "Relaciono una nota larga de melodía con una tensión disponible."], project: "Rearmoniza cuatro compases y explica función, bajo, melodía y conducción de voces.", repertoire: "Stella by Starlight, Footprints o Have You Met Miss Jones" },
    4: { prerequisite: "Nivel 3: reharmonización funcional, formas y voicings rootless.", diagnostic: ["Puedo usar un voicing cuartal como color, sin confundirlo con función tonal.", "Diferencio una estructura superior de una inversión.", "Escribo una voz superior que se mantenga reconocible."], project: "Compón una sección de ocho compases con motivo, contraste y retorno; justifica un color contemporáneo.", repertoire: "So What, Maiden Voyage o Giant Steps" },
    5: { prerequisite: "Nivel 1 como mínimo; los niveles 2–4 enriquecen el material armónico disponible.", diagnostic: ["Mantengo pulso con una nota antes de tocar muchas alturas.", "Resuelvo en tercera o séptima de cada acorde.", "Canto y reproduzco un motivo breve."], project: "Registra un chorus con motivo, desarrollo, aproximación resuelta y cierre claro.", repertoire: "Blues en F, Autumn Leaves o un standard ya analizado" }
  };

  function renderCurriculumMounts(scope) {
    scope.querySelectorAll(".jazz-curriculum-mount").forEach(function (mount) {
      var level = Number(mount.dataset.curriculumLevel);
      var kind = mount.dataset.curriculumKind;
      var guide = CURRICULUM[level];
      if (!guide) return;
      var key = "n" + level + "-" + kind;
      var evidence = state.curriculumEvidence[key] || {};
      if (kind === "entry") {
        mount.innerHTML = '<section class="curriculum-card"><p class="kicker">Antes de avanzar</p><h4>Diagnóstico de entrada</h4><p><b>Base esperada:</b> ' + guide.prerequisite + '</p><div class="curriculum-checks">' + guide.diagnostic.map(function (item, index) {
          return '<label><input type="checkbox" data-evidence="' + key + '" data-evidence-step="' + index + '"' + (evidence[index] ? ' checked' : '') + '> <span>' + item + '</span></label>';
        }).join("") + '</div><p class="small-note">Si una afirmación aún no se cumple, úsala como meta breve antes de pasar al siguiente tema.</p></section>';
      } else {
        mount.innerHTML = '<section class="curriculum-card curriculum-project"><p class="kicker">Evidencia aplicada</p><h4>Proyecto de cierre</h4><p>' + guide.project + '</p><p><b>Repertorio sugerido:</b> ' + guide.repertoire + '</p><div class="curriculum-checks"><label><input type="checkbox" data-evidence="' + key + '" data-evidence-step="analysis"' + (evidence.analysis ? ' checked' : '') + '> <span>Anoté función, forma y decisiones armónicas.</span></label><label><input type="checkbox" data-evidence="' + key + '" data-evidence-step="sound"' + (evidence.sound ? ' checked' : '') + '> <span>Lo canté o lo toqué a un tempo controlable.</span></label><label><input type="checkbox" data-evidence="' + key + '" data-evidence-step="review"' + (evidence.review ? ' checked' : '') + '> <span>Escuché el resultado y escribí una mejora concreta.</span></label></div></section>';
      }
    });
    scope.querySelectorAll("[data-evidence]").forEach(function (input) {
      input.addEventListener("change", function () {
        var key = input.dataset.evidence;
        if (!state.curriculumEvidence[key]) state.curriculumEvidence[key] = {};
        state.curriculumEvidence[key][input.dataset.evidenceStep] = input.checked;
        saveState();
        var index = currentLevel().topics.findIndex(function (topic) { return topic.curriculumRole === key.split("-")[1]; });
        if (index >= 0) updateTopicProgress(currentLevel().slug + "-" + index);
      });
    });
  }

  function renderTopicClosure(level, topic, index) {
    if (topic.curriculumRole) return "";
    var key = level.slug + "-" + index;
    var checks = state.practiceChecks[key] || {};
    return '<aside class="topic-transfer"><p class="kicker">Cierre activo</p><h4>Escucha, canta, toca y aplica</h4><p>Antes de marcar <b>' + topic.title + '</b> como estudiado, convierte la idea en una decisión musical.</p><div class="curriculum-checks"><label><input type="checkbox" data-practice="' + key + '" data-practice-step="hear"' + (checks.hear ? ' checked' : '') + '> <span>Escuché o identifiqué el recurso en contexto.</span></label><label><input type="checkbox" data-practice="' + key + '" data-practice-step="sing"' + (checks.sing ? ' checked' : '') + '> <span>Canté las fundamentales, notas guía o tensión principal.</span></label><label><input type="checkbox" data-practice="' + key + '" data-practice-step="apply"' + (checks.apply ? ' checked' : '') + '> <span>Lo toqué o escribí en una tonalidad distinta.</span></label></div></aside>';
  }

  function wireTopicPractice(scope) {
    scope.querySelectorAll("[data-practice]").forEach(function (input) {
      input.addEventListener("change", function () {
        var key = input.dataset.practice;
        if (!state.practiceChecks[key]) state.practiceChecks[key] = {};
        state.practiceChecks[key][input.dataset.practiceStep] = input.checked;
        saveState();
        updateTopicProgress(key);
      });
    });
  }

  function topicProgressLabel(level, index) {
    var topic = level.topics[index];
    var key = level.slug + "-" + index;
    var studied = !!state.studiedTopics[key];
    var checks = topic.curriculumRole
      ? state.curriculumEvidence[level.slug + "-" + topic.curriculumRole] || {}
      : state.practiceChecks[key] || {};
    var steps = topic.curriculumRole === "entry" ? ["0", "1", "2"]
      : topic.curriculumRole === "project" ? ["analysis", "sound", "review"]
      : ["hear", "sing", "apply"];
    var completed = steps.every(function (step) { return !!checks[step]; });
    var progress = completed ? (topic.curriculumRole === "entry" ? "Diagnóstico completo"
      : topic.curriculumRole === "project" ? "Proyecto completo" : "Práctica completa") : "";
    return [studied ? "Estudiado" : "Pendiente", progress].filter(Boolean).join(" · ");
  }

  function updateTopicProgress(key) {
    var level = currentLevel();
    var index = Number(key.split("-")[1]);
    if (!Number.isInteger(index) || !level.topics[index]) return;
    var label = document.querySelector('#jazzTopicNav [data-topic-index="' + index + '"] small');
    if (label) label.textContent = topicProgressLabel(level, index);
  }

  // ---------- Render: teoría ----------
  function renderTheory() {
    var lvl = currentLevel();
    document.getElementById("theoryTitle").textContent = "Nivel " + lvl.id + " · " + lvl.name;
    document.getElementById("theoryDesc").textContent = lvl.subtitle;

    var list = document.getElementById("topicsList");
    list.innerHTML = "";
    var nav = document.getElementById("jazzTopicNav");
    nav.innerHTML = "";

    lvl.topics.forEach(function (topic, idx) {
      var key = lvl.slug + "-" + idx;
      var isOpen = idx === state.topicIndex;
      var isStudied = !!state.studiedTopics[key];
      var link = document.createElement("button");
      link.type = "button";
      link.className = "course-topic-link" + (isOpen ? " active" : "");
      link.dataset.topicIndex = idx;
      link.innerHTML = '<span class="course-topic-number">' + (idx + 1) + '</span><span><b>' + topic.title + '</b><small>' + topicProgressLabel(lvl, idx) + '</small></span>';
      if (isOpen) link.setAttribute("aria-current", "page");
      link.addEventListener("click", function () { state.topicIndex = idx; saveState(); renderTheory(); });
      nav.appendChild(link);
      if (!isOpen) return;

      var card = document.createElement("article");
      card.className = "topic-card" + (isOpen ? " open" : "") + (isStudied ? " studied" : "");

      var head = document.createElement("h3");
      head.className = "topic-head";
      head.innerHTML =
        '<span class="topic-title">' + topic.title + '</span>' +
        '<span class="topic-flags">' + (isStudied ? '<span class="check">✓ estudiado</span>' : '') + '</span>';

      var body = document.createElement("div");
      body.className = "topic-body";
      if (isOpen) {
        body.innerHTML = topic.html + (TOPIC_VISUALS[topic.title] ? '<div class="theory-visual-mount" data-viz="' + TOPIC_VISUALS[topic.title] + '"></div>' : '') + renderTopicClosure(lvl, topic, idx);
        populateGeneratedDiagrams(body);
        renderCurriculumMounts(body);
        wireTopicPractice(body);
        window.CrescendoJazzPiano?.attach(body, topic.title);
        window.CrescendoBagaLab?.mount(body);
      }

      card.appendChild(head);
      card.appendChild(body);
      list.appendChild(card);
      window.CrescendoLab?.attach(body,'jazz');
    });

    var studyBtn = document.getElementById("studyToggleBtn");
    var currentKey = lvl.slug + "-" + state.topicIndex;
    studyBtn.textContent = state.studiedTopics[currentKey] ? "Desmarcar como estudiado" : "Marcar tema como estudiado";
    document.getElementById("prevTopicBtn").disabled = state.topicIndex === 0;
    document.getElementById("nextTopicBtn").disabled = state.topicIndex === lvl.topics.length - 1;
  }

  function stepTopic(delta) {
    var lvl = currentLevel();
    var next = state.topicIndex + delta;
    if (next < 0 || next >= lvl.topics.length) return;
    state.topicIndex = next;
    saveState();
    renderTheory();
  }

  function toggleStudy() {
    var lvl = currentLevel();
    var key = lvl.slug + "-" + state.topicIndex;
    state.studiedTopics[key] = !state.studiedTopics[key];
    saveState();
    renderTheory();
  }

  // ---------- Cuestionario ----------
  function shuffledQuestions(questions) {
    return questions.map(function (question) {
      var order = question.options.map(function (_, index) { return index; });
      for (var index = order.length - 1; index > 0; index--) {
        var other = Math.floor(Math.random() * (index + 1));
        var swap = order[index]; order[index] = order[other]; order[other] = swap;
      }
      return {
        prompt: question.prompt,
        options: order.map(function (original) { return question.options[original]; }),
        correctIndex: order.indexOf(question.correctIndex),
        explanation: question.explanation
      };
    });
  }

  function quizQuestions() {
    return state.quiz && Array.isArray(state.quiz.questionSnapshot)
      ? state.quiz.questionSnapshot : currentLevel().quiz;
  }

  function startQuiz() {
    var name = document.getElementById("studentName").value.trim();
    var course = document.getElementById("studentCourse").value.trim();
    var date = document.getElementById("studentDate").value || new Date().toISOString().slice(0, 10);

    if (!name) {
      document.getElementById("studentName").focus();
      return;
    }

    var lvl = currentLevel();
    state.quiz = {
      levelSlug: lvl.slug,
      levelId: lvl.id,
      levelName: lvl.name,
      student: name,
      course: course,
      date: date,
      answers: new Array(lvl.quiz.length).fill(null),
      questionSnapshot: shuffledQuestions(lvl.quiz),
      submitted: false,
      startedAt: Date.now()
    };
    saveState();
    renderQuiz();
  }

  function renderQuiz() {
    var lvl = currentLevel();
    var startPanel = document.getElementById("quizStartPanel");
    var activePanel = document.getElementById("quizActivePanel");
    var resultPanel = document.getElementById("quizResultPanel");

    if (!state.quiz || state.quiz.levelSlug !== lvl.slug) {
      // No hay intento activo para este nivel
      startPanel.classList.remove("hidden");
      activePanel.classList.add("hidden");
      resultPanel.classList.add("hidden");
      document.getElementById("lockBanner").classList.add("hidden");
      return;
    }

    if (state.quiz.submitted) {
      startPanel.classList.add("hidden");
      activePanel.classList.add("hidden");
      resultPanel.classList.remove("hidden");
      document.getElementById("lockBanner").classList.add("hidden");
      renderResult();
      return;
    }

    // Intento en curso
    startPanel.classList.add("hidden");
    activePanel.classList.remove("hidden");
    resultPanel.classList.add("hidden");
    document.getElementById("lockBanner").classList.remove("hidden");
    document.getElementById("activeStudent").textContent = state.quiz.student;

    var list = document.getElementById("questionList");
    list.innerHTML = "";
    quizQuestions().forEach(function (item, qIdx) {
      var qCard = document.createElement("div");
      qCard.className = "question-card";
      var qHead = document.createElement("p");
      qHead.className = "question-prompt";
      qHead.textContent = (qIdx + 1) + ". " + item.prompt;
      qCard.appendChild(qHead);

      var optWrap = document.createElement("div");
      optWrap.className = "options";
      item.options.forEach(function (opt, oIdx) {
        var id = "q" + qIdx + "_o" + oIdx;
        var label = document.createElement("label");
        label.className = "option";
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "q" + qIdx;
        input.id = id;
        input.value = oIdx;
        input.checked = state.quiz.answers[qIdx] === oIdx;
        input.addEventListener("change", function () {
          state.quiz.answers[qIdx] = oIdx;
          saveState();
          updateAnsweredCount();
        });
        var span = document.createElement("span");
        span.textContent = opt;
        label.appendChild(input);
        label.appendChild(span);
        optWrap.appendChild(label);
      });
      qCard.appendChild(optWrap);
      list.appendChild(qCard);
    });

    updateAnsweredCount();
  }

  function updateAnsweredCount() {
    var lvl = currentLevel();
    var answered = state.quiz.answers.filter(function (a) { return a !== null; }).length;
    document.getElementById("answeredCount").textContent = answered + "/" + lvl.quiz.length + " respondidas";
    var pct = Math.round((answered / lvl.quiz.length) * 100);
    document.getElementById("quizBar").style.width = pct + "%";
  }

  function submitQuiz() {
    var lvl = currentLevel();
    var unanswered = state.quiz.answers.filter(function (a) { return a === null; }).length;
    if (unanswered > 0) {
      var proceed = window.confirm("Quedan " + unanswered + " preguntas sin responder. ¿Entregar de todas formas?");
      if (!proceed) return;
    }
    state.quiz.submitted = true;
    saveState();
    renderQuiz();
  }

  function scoreQuiz() {
    var lvl = LEVELS.find(function (l) { return l.slug === state.quiz.levelSlug; });
    var correct = 0;
    quizQuestions().forEach(function (item, idx) {
      if (state.quiz.answers[idx] === item.correctIndex) correct++;
    });
    var total = quizQuestions().length;
    var grade = total > 0 ? (correct / total) * 5 : 0;
    return { correct: correct, total: total, grade: grade, lvl: lvl };
  }

  function renderResult() {
    var res = scoreQuiz();
    document.getElementById("finalScore").textContent = res.grade.toFixed(1);
    document.getElementById("rawPoints").textContent = res.correct + "/" + res.total + " puntos correctos";
    document.getElementById("resultStudent").textContent = state.quiz.student;
    document.getElementById("resultCourse").textContent = state.quiz.course || "-";
    document.getElementById("resultDate").textContent = state.quiz.date;
    document.getElementById("resultLevel").textContent = "Nivel " + res.lvl.id + " · " + res.lvl.name;

    var circle = document.getElementById("scoreCircle");
    circle.classList.remove("grade-low", "grade-mid", "grade-high");
    if (res.grade >= 4) circle.classList.add("grade-high");
    else if (res.grade >= 3) circle.classList.add("grade-mid");
    else circle.classList.add("grade-low");

    var reviewList = document.getElementById("reviewList");
    reviewList.innerHTML = "<h3>Revisión de respuestas</h3>";
    quizQuestions().forEach(function (item, idx) {
      var userAns = state.quiz.answers[idx];
      var isCorrect = userAns === item.correctIndex;
      var row = document.createElement("div");
      row.className = "review-row " + (isCorrect ? "review-correct" : "review-wrong");
      var userText = userAns === null ? "(sin responder)" : item.options[userAns];
      row.innerHTML =
        '<p class="review-q">' + (idx + 1) + ". " + item.prompt + '</p>' +
        '<p class="review-a">Respuesta: <b>' + userText + '</b>' + (isCorrect ? "" : ' · Correcta: <b>' + item.options[item.correctIndex] + '</b>') + '</p>';
      reviewList.appendChild(row);
    });
  }

  function downloadCsv() {
    var res = scoreQuiz();
    var rows = [["Estudiante", "Curso", "Fecha", "Nivel", "Correctas", "Total", "Nota (0-5)"]];
    rows.push([state.quiz.student, state.quiz.course || "", state.quiz.date, "Nivel " + res.lvl.id + " - " + res.lvl.name, res.correct, res.total, res.grade.toFixed(1)]);
    rows.push([]);
    rows.push(["#", "Pregunta", "Respuesta del estudiante", "Correcta", "¿Acertó?"]);
    quizQuestions().forEach(function (item, idx) {
      var userAns = state.quiz.answers[idx];
      var userText = userAns === null ? "(sin responder)" : item.options[userAns];
      var ok = userAns === item.correctIndex ? "Sí" : "No";
      rows.push([idx + 1, item.prompt, userText, item.options[item.correctIndex], ok]);
    });
    var csv = rows.map(function (r) {
      return r.map(function (cell) {
        var s = String(cell === undefined ? "" : cell).replace(/"/g, '""');
        return '"' + s + '"';
      }).join(",");
    }).join("\r\n");

    var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "armonia-jazz-" + res.lvl.slug + "-" + state.quiz.student.replace(/\s+/g, "_") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function newAttempt() {
    state.quiz = null;
    saveState();
    renderQuiz();
  }

  // ---------- Render general ----------
  function renderAll() {
    renderHome();
    renderTheory();
    renderQuiz();
    var libraryMount = document.getElementById("ataLibraryMount");
    if (libraryMount && window.AtaLibrary && !libraryMount.dataset.mounted) {
      window.AtaLibrary.mount(libraryMount);
      libraryMount.dataset.mounted = "true";
    }
    setView(state.view);
  }

  // ---------- Listeners ----------
  function bindEvents() {
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var view = btn.getAttribute("data-view");
        if (view) setView(view);
      });
    });

    document.getElementById("goTheoryBtn").addEventListener("click", function () { setView("theory"); });
    document.getElementById("startQuizBtn2").addEventListener("click", function () { setView("quiz"); });
    document.getElementById("openImprovRoute").addEventListener("click", function () { setView("improv"); });

    document.getElementById("prevTopicBtn").addEventListener("click", function () { stepTopic(-1); });
    document.getElementById("nextTopicBtn").addEventListener("click", function () { stepTopic(1); });
    document.getElementById("studyToggleBtn").addEventListener("click", toggleStudy);
    document.getElementById("resetTopicsBtn").addEventListener("click", function () {
      if (!confirm("¿Reiniciar el progreso de estudio de este nivel?")) return;
      var lvl = currentLevel();
      lvl.topics.forEach(function (_, idx) { delete state.studiedTopics[lvl.slug + "-" + idx]; });
      saveState(); renderTheory();
    });

    document.getElementById("startQuizBtn").addEventListener("click", startQuiz);
    document.getElementById("submitQuizBtn").addEventListener("click", submitQuiz);
    document.getElementById("downloadCsvBtn").addEventListener("click", downloadCsv);
    document.getElementById("printResultBtn").addEventListener("click", function () { window.print(); });
    document.getElementById("newAttemptBtn").addEventListener("click", newAttempt);
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadState();
    var params = new URLSearchParams(location.search);
    var directLevel = Number(params.get("level"));
    if (Number.isInteger(directLevel) && directLevel >= 1 && directLevel <= LEVELS.length) state.levelIndex = directLevel - 1;
    var directTopic = Number(params.get("topic"));
    if (Number.isInteger(directTopic) && directTopic >= 1 && directTopic <= currentLevel().topics.length) state.topicIndex = directTopic - 1;
    var directView = location.hash.match(/^#(home|theory|improv|library|quiz)View$/);
    if (directView) state.view = directView[1];
    bindEvents();
    renderAll();
  });
})();
