(function () {
  "use strict";
  const E = window.CrescendoImprovisationEngine;
  const P = window.CrescendoPractice;
  const mount = document.getElementById("improvisationMount");
  if (!E || !P || !mount) return;

  const units = [
    { title: "Práctica deliberada", objective: "Convierte una intención musical concreta en una sesión breve, medible y cantada.", concept: "Una sesión útil no consiste en tocar mucho material sin dirección. Elige una sola habilidad, trabaja despacio, escucha el resultado y registra qué cambió. Los bloques de quince minutos son una estructura práctica, no una regla biológica.", tips: [["Foco", "Una dificultad por bloque."], ["Voz", "Canta antes o mientras tocas."], ["Registro", "Anota tempo y hallazgo."]], lab: "plan" },
    { title: "Mapa de la escala", objective: "Deja de recorrer la escala solamente de abajo hacia arriba.", concept: "La escala mayor es materia prima, no una respuesta universal para cualquier acorde. Aprende su sonido desde una tonalidad concreta y reorganiza sus grados para evitar que cada línea parezca un ejercicio mecánico.", tips: [["Dirección", "Alterna ascenso y descenso."], ["Registro", "Comienza desde distintos grados."], ["Armonía", "Comprueba siempre el acorde."]], lab: "scale" },
    { title: "Intervalos y arpegios", objective: "Construye movilidad interna con saltos, tétradas y permutaciones.", concept: "Los saltos diatónicos y los arpegios revelan la estructura armónica contenida en la escala. Practícalos con conducción suave y no como figuras aisladas: cada nota debe conducir a la siguiente.", tips: [["Terceras", "Conectan voces vecinas."], ["Séptimas", "Definen el color del acorde."], ["Permutación", "Cambia el orden, no el material."]], lab: "scaleAdvanced" },
    { title: "Motivo y desarrollo", objective: "Crea continuidad mediante repetición, secuencia y desplazamiento.", concept: "Una idea corta puede sostener un discurso completo si cambia de altura, dirección, final o ritmo. La repetición deliberada permite que el oyente reconozca la idea; la variación evita que se vuelva predecible.", tips: [["Identidad", "Conserva el contorno."], ["Secuencia", "Desplaza el motivo por grados."], ["Contraste", "Modifica solo un parámetro."]], lab: "motive" },
    { title: "Notas objetivo", objective: "Escucha la llegada a terceras y séptimas dentro de una progresión.", concept: "Una línea adquiere dirección cuando resuelve en una nota estructural del acorde. Primero localiza las notas del arpegio; después conecta los acordes con el movimiento más corto posible.", tips: [["Llegada", "Apunta a un tiempo fuerte."], ["Guías", "Prioriza tercera y séptima."], ["Conexión", "Busca semitonos y tonos."]], lab: "targets" },
    { title: "Aproximaciones", objective: "Rodea una nota objetivo sin perder la referencia armónica.", concept: "Una aproximación cromática funciona por su resolución. La nota externa no sustituye el acorde: crea tensión breve y llega con claridad al objetivo, desde abajo, desde arriba o mediante un cierre envolvente.", tips: [["Abajo", "Semitono inferior al objetivo."], ["Arriba", "Semitono superior al objetivo."], ["Envolvente", "Dos lados, una resolución."]], lab: "approach" },
    { title: "Time-feel y vocabulario rítmico", objective: "Haz que una sola altura produzca frases con dirección y respiración.", concept: "El ritmo puede estudiarse separado de la altura. Practica síncopas, silencios, tresillos y duraciones mixtas con palmas o una sola nota; luego transfiere exactamente ese contorno a una línea melódica.", tips: [["Silencio", "También articula la frase."], ["Acento", "No todo énfasis cae en el pulso."], ["Transferencia", "Conserva el ritmo al cambiar notas."]], lab: "rhythm" },
    { title: "Construcción de un chorus", objective: "Integra material, objetivos, cromatismo y ritmo en una forma completa.", concept: "La integración no significa usar todos los recursos a la vez. Diseña un arco: establece una idea, desarróllala, aumenta la tensión y deja una resolución reconocible. Graba una toma y evalúa decisiones concretas.", tips: [["Inicio", "Presenta una idea sencilla."], ["Desarrollo", "Aumenta densidad gradualmente."], ["Cierre", "Resuelve y deja espacio."]], lab: "integration" }
  ];
  const rootOptions = Object.keys(E.ROOTS).map(r => `<option>${r}</option>`).join("");
  let index = Number(localStorage.getItem("aj-improv-current") || 0);
  let completed = JSON.parse(localStorage.getItem("aj-improv-completed") || "[]");
  let player = null, audioContext = null, timer = null, remaining = 15 * 60;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function save() { localStorage.setItem("aj-improv-current", index); localStorage.setItem("aj-improv-completed", JSON.stringify(completed)); }
  function score(events, labels) { return P.sequence(events, { meter: "4/4", labels: !!labels }); }
  async function play(events, bpm) {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    if (!player) player = await window.Soundfont.instrument(audioContext, "acoustic_grand_piano", { soundfont: "MusyngKite" });
    const beat = 60 / bpm; let when = audioContext.currentTime + .08;
    events.forEach(event => { if (event.kind !== "rest") player.play(event.midi, when, { duration: Math.max(.12, event.beats * beat * .92), gain: .8 }); when += event.beats * beat; });
  }
  function selector(extra) { return `<div class="improv-controls"><label>Tonalidad<select data-root>${rootOptions}</select></label>${extra}<label>Tempo<input data-bpm type="number" min="40" max="220" value="80"></label><button class="primary" data-generate>Generar</button><button data-play>▶ Escuchar</button></div><div class="improv-score" data-score></div><p class="improv-feedback" data-feedback></p>`; }
  function labMarkup(type) {
    if (type === "plan" || type === "integration") return `<div class="improv-timer"><span class="improv-clock" data-clock>15:00</span><button class="primary" data-timer>Iniciar bloque</button><button data-reset-timer>Reiniciar</button></div><div class="improv-checks">${(type === "plan" ? ["Definí una habilidad concreta.", "Canté el material antes de tocarlo.", "Trabajé a un tempo controlable.", "Anoté un hallazgo y el siguiente paso."] : ["Presenté un motivo reconocible.", "Llegué a notas guía de los acordes.", "Usé cromatismo con resolución clara.", "Varié el ritmo e incluí silencios.", "Grabé y escuché una toma completa."]).map(x => `<label><input type="checkbox">${x}</label>`).join("")}</div>`;
    if (type === "scale") return selector(`<label>Recorrido<select data-mode><option value="stepwise">Por grados</option><option value="thirds">Terceras</option><option value="permutation">Permutación</option></select></label>`);
    if (type === "scaleAdvanced") return selector(`<label>Material<select data-mode><option value="thirds">Terceras</option><option value="fourths">Saltos</option><option value="sevenths">Arpegios de séptima</option><option value="permutation">Permutación</option></select></label>`);
    if (type === "approach") return selector(`<label>Aproximación<select data-mode><option value="below">Desde abajo</option><option value="above">Desde arriba</option><option value="enclosure">Envolvente</option><option value="double">Doble inferior</option></select></label>`);
    if (type === "rhythm") return selector(`<label>Patrón<select data-mode><option value="offbeat">Síncopas</option><option value="rests">Silencios</option><option value="triplets">Tresillos</option><option value="mixed">Duraciones mixtas</option></select></label>`);
    return selector("");
  }
  function generate(card) {
    const root = card.querySelector("[data-root]")?.value || "C";
    const type = units[index].lab, mode = card.querySelector("[data-mode]")?.value;
    let events = type === "motive" ? E.motive(root) : type === "targets" ? E.targets(root) : type === "approach" ? E.approaches(root, mode) : type === "rhythm" ? E.rhythm(root, mode) : E.scale(root, mode);
    card._events = events; card.querySelector("[data-score]").innerHTML = score(events, type === "targets" || type === "approach");
    card.querySelector("[data-feedback]").textContent = type === "rhythm" ? "Primero palméalas; después toca exactamente el mismo ritmo." : "Canta la línea, tócala despacio y transpórtala a otra tonalidad.";
  }
  function wireLab(card) {
    const generateButton = card.querySelector("[data-generate]");
    if (generateButton) { generateButton.onclick = () => generate(card); card.querySelector("[data-play]").onclick = () => play(card._events || [], Number(card.querySelector("[data-bpm]").value)); generate(card); }
    const timerButton = card.querySelector("[data-timer]");
    if (timerButton) {
      const clock = card.querySelector("[data-clock]");
      const paint = () => { clock.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`; };
      timerButton.onclick = () => { if (timer) { clearInterval(timer); timer = null; timerButton.textContent = "Continuar"; return; } timerButton.textContent = "Pausar"; timer = setInterval(() => { remaining = Math.max(0, remaining - 1); paint(); if (!remaining) { clearInterval(timer); timer = null; timerButton.textContent = "Bloque completo"; } }, 1000); };
      card.querySelector("[data-reset-timer]").onclick = () => { clearInterval(timer); timer = null; remaining = 15 * 60; timerButton.textContent = "Iniciar bloque"; paint(); };
    }
  }
  function render() {
    clearInterval(timer); timer = null; remaining = 15 * 60;
    const unit = units[index], percent = Math.round(completed.length / units.length * 100);
    mount.innerHTML = `<header class="improv-head"><p class="kicker">Laboratorio de lenguaje</p><h2>Improvisación jazz</h2><p>Ruta práctica de ocho unidades: escucha, canta, visualiza, toca, transforma y registra. Los ejercicios generan material original en todas las tonalidades.</p><div class="improv-progress" aria-label="${percent}% completado"><span style="width:${percent}%"></span></div></header><div class="improv-layout"><nav class="improv-nav" aria-label="Unidades de improvisación">${units.map((u, i) => `<button type="button" data-unit="${i}" class="${i === index ? "active" : ""}"><span class="unit-number">${i + 1}</span><span>${esc(u.title)}</span><small>${completed.includes(i) ? "✓" : ""}</small></button>`).join("")}</nav><article class="improv-card"><p class="kicker">Unidad ${index + 1} de ${units.length}</p><h3>${esc(unit.title)}</h3><p class="improv-objective">${esc(unit.objective)}</p><section class="improv-concept"><h4>Idea central</h4><p>${esc(unit.concept)}</p></section><div class="improv-tips">${unit.tips.map(t => `<div class="improv-tip"><b>${esc(t[0])}</b><span>${esc(t[1])}</span></div>`).join("")}</div><section class="improv-lab"><div class="improv-lab-head"><div><p class="kicker">Práctica interactiva</p><h4>${unit.lab === "plan" || unit.lab === "integration" ? "Bloque de trabajo" : "Generador musical"}</h4><p>Escucha, canta y toca. Cambia la tonalidad para comprobar que aprendiste el recurso y no una digitación.</p></div></div>${labMarkup(unit.lab)}</section><div class="improv-actions"><button data-prev ${index === 0 ? "disabled" : ""}>← Anterior</button><button data-complete>${completed.includes(index) ? "✓ Unidad completada" : "Marcar como completada"}</button><button data-next ${index === units.length - 1 ? "disabled" : ""}>Siguiente →</button></div></article></div>`;
    mount.querySelectorAll("[data-unit]").forEach(btn => btn.onclick = () => { index = Number(btn.dataset.unit); save(); render(); });
    mount.querySelector("[data-prev]").onclick = () => { index--; save(); render(); };
    mount.querySelector("[data-next]").onclick = () => { index++; save(); render(); };
    mount.querySelector("[data-complete]").onclick = () => { completed = completed.includes(index) ? completed.filter(x => x !== index) : completed.concat(index); save(); render(); };
    wireLab(mount.querySelector(".improv-card"));
  }
  render();
})();
