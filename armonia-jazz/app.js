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
    quiz: null           // { levelSlug, student, course, date, answers: [], submitted:false, startedAt }
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
      state.levelIndex = saved.levelIndex || 0;
      state.topicIndex = saved.topicIndex || 0;
      state.studiedTopics = saved.studiedTopics || {};
      if (saved.quiz && saved.quiz.startedAt && !saved.quiz.submitted) {
        state.quiz = saved.quiz;
      }
    } catch (e) { /* ignorar estado corrupto */ }
  }

  // ---------- Render: selector de nivel ----------
  function renderLevelTabs() {
    var wrap = document.getElementById("levelTabs");
    wrap.innerHTML = "";
    LEVELS.forEach(function (lvl, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "level-tab" + (idx === state.levelIndex ? " active" : "");
      btn.innerHTML = '<span class="level-num">Nivel ' + lvl.id + '</span><span class="level-name">' + lvl.name + '</span>';
      btn.addEventListener("click", function () {
        if (state.quiz && !state.quiz.submitted) return; // bloqueado durante evaluación
        state.levelIndex = idx;
        state.topicIndex = 0;
        saveState();
        renderAll();
      });
      wrap.appendChild(btn);
    });
  }

  function renderLevelsOverview() {
    var grid = document.getElementById("levelsOverviewGrid");
    grid.innerHTML = "";
    LEVELS.forEach(function (lvl, idx) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "level-card";
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
    if (!window.ChordRef) return; // chords-ref.js no cargó: continuar sin diagramas
    var chordMount = scope.querySelector("#chordRefMount");
    if (chordMount) chordMount.innerHTML = window.ChordRef.renderChordReferenceGrid();
    var octMount = scope.querySelector("#octatonicMount");
    if (octMount) octMount.innerHTML = window.ChordRef.renderOctatonicSection();
    var usMount = scope.querySelector("#upperStructMount");
    if (usMount) usMount.innerHTML = window.ChordRef.renderUpperStructuresSection();
  }

  // ---------- Navegación entre vistas ----------
  function setView(view) {
    if (state.quiz && !state.quiz.submitted && view === "theory") {
      // bloqueado: forzar a permanecer en cuestionario
      view = "quiz";
    }
    state.view = view;
    ["home", "theory", "quiz"].forEach(function (v) {
      document.getElementById(v + "View").classList.toggle("hidden", v !== view);
    });
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-view") === view);
    });
    document.getElementById("lockBanner").classList.toggle("hidden", !(state.quiz && !state.quiz.submitted));
    saveState();
  }

  // ---------- Render: inicio ----------
  function renderHome() {
    var lvl = currentLevel();
    document.getElementById("moduleLabel").textContent = "Nivel " + lvl.id + " · " + lvl.name;
    document.getElementById("moduleIntro").textContent = lvl.subtitle;
    document.getElementById("topicCount").textContent = lvl.topics.length;
    document.getElementById("questionCount").textContent = lvl.quiz.length;
    document.getElementById("levelSubtitle").textContent = "Nivel " + lvl.id + " · " + lvl.name + " — " + lvl.subtitle;
    renderLevelsOverview();
  }

  // ---------- Render: teoría ----------
  function renderTheory() {
    var lvl = currentLevel();
    document.getElementById("theoryTitle").textContent = "Nivel " + lvl.id + " · " + lvl.name;
    document.getElementById("theoryDesc").textContent = lvl.subtitle;

    var list = document.getElementById("topicsList");
    list.innerHTML = "";

    lvl.topics.forEach(function (topic, idx) {
      var key = lvl.slug + "-" + idx;
      var isOpen = idx === state.topicIndex;
      var isStudied = !!state.studiedTopics[key];

      var card = document.createElement("article");
      card.className = "topic-card" + (isOpen ? " open" : "") + (isStudied ? " studied" : "");

      var head = document.createElement("button");
      head.type = "button";
      head.className = "topic-head";
      head.innerHTML =
        '<span class="topic-title">' + topic.title + '</span>' +
        '<span class="topic-flags">' + (isStudied ? '<span class="check">✓ estudiado</span>' : '') + '<span class="chevron">' + (isOpen ? "–" : "+") + '</span></span>';
      head.addEventListener("click", function () {
        state.topicIndex = idx;
        saveState();
        renderTheory();
      });

      var body = document.createElement("div");
      body.className = "topic-body";
      if (isOpen) {
        body.innerHTML = topic.html;
        populateGeneratedDiagrams(body);
      }

      card.appendChild(head);
      card.appendChild(body);
      list.appendChild(card);
    });

    var studyBtn = document.getElementById("studyToggleBtn");
    var currentKey = lvl.slug + "-" + state.topicIndex;
    studyBtn.textContent = state.studiedTopics[currentKey] ? "Desmarcar como estudiado" : "Marcar tema como estudiado";
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
    lvl.quiz.forEach(function (item, qIdx) {
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
    lvl.quiz.forEach(function (item, idx) {
      if (state.quiz.answers[idx] === item.correctIndex) correct++;
    });
    var total = lvl.quiz.length;
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
    res.lvl.quiz.forEach(function (item, idx) {
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
    res.lvl.quiz.forEach(function (item, idx) {
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
    renderLevelTabs();
    renderHome();
    renderTheory();
    renderQuiz();
    setView(state.view);
  }

  // ---------- Listeners ----------
  function bindEvents() {
    document.querySelectorAll(".nav-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setView(btn.getAttribute("data-view"));
      });
    });

    document.getElementById("goTheoryBtn").addEventListener("click", function () { setView("theory"); });
    document.getElementById("startQuizBtn2").addEventListener("click", function () { setView("quiz"); });

    document.getElementById("prevTopicBtn").addEventListener("click", function () { stepTopic(-1); });
    document.getElementById("nextTopicBtn").addEventListener("click", function () { stepTopic(1); });
    document.getElementById("studyToggleBtn").addEventListener("click", toggleStudy);

    document.getElementById("startQuizBtn").addEventListener("click", startQuiz);
    document.getElementById("submitQuizBtn").addEventListener("click", submitQuiz);
    document.getElementById("downloadCsvBtn").addEventListener("click", downloadCsv);
    document.getElementById("printResultBtn").addEventListener("click", function () { window.print(); });
    document.getElementById("newAttemptBtn").addEventListener("click", newAttempt);
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadState();
    bindEvents();
    renderAll();
  });
})();
