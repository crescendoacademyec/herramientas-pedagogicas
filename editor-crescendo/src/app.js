import { createInitialState, clone, getDuration, scoreBeats, serialize, DURATION_OPTIONS } from "./store.js";
import { renderScore, renderMeasureSummary } from "./renderer.js";

const STORAGE_KEY = "editor-crescendo.score.v1";
let state = createInitialState();

const tools = [
  ["select", "Seleccionar", "Esc"],
  ["note", "Notas", "N"],
  ["rest", "Silencios", "R"],
  ["erase", "Borrar", "⌫"],
];

const pitches = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5"];

function checkpoint() {
  state.history.push(clone(state.score));
  if (state.history.length > 40) state.history.shift();
  state.future = [];
}

function setStatus(status) { state.status = status; }

function render() {
  const app = document.querySelector("#app");
  const duration = getDuration(state.duration);
  const activeTool = tools.find(([id]) => id === state.tool)?.[1] ?? "Seleccionar";
  app.innerHTML = `
    <div class="shell">
      <aside class="rail" aria-label="Navegación principal">
        <a class="brand" href="#inicio" aria-label="Editor Crescendo"><span>EC</span><small>Crescendo</small></a>
        <nav>${["Archivo", "Escribir", "Notación", "Texto", "Escenas", "Reproducir"].map((name, index) => `<button class="nav-item ${index === 1 ? "active" : ""}" data-nav="${name}">${name}</button>`).join("")}</nav>
        <span class="rail-bottom">v0.1</span>
      </aside>
      <main class="workspace">
        <header class="topbar">
          <div><p class="eyebrow">EDITOR CRESCENDO</p><h1>${state.score.title}</h1><p class="subtitle">Partitura editable</p></div>
          <div class="top-actions">
            <button class="icon-button" data-action="save" title="Guardar ejercicio">Guardar</button>
            <button class="icon-button" data-action="undo" ${state.history.length ? "" : "disabled"} title="Deshacer">↶</button>
            <button class="icon-button" data-action="redo" ${state.future.length ? "" : "disabled"} title="Rehacer">↷</button>
            <span class="save-state ${state.dirty ? "dirty" : ""}">${state.dirty ? "Cambios sin guardar" : "Guardado local"}</span>
          </div>
        </header>
        <div class="editor-layout ${state.inspectorOpen ? "" : "inspector-hidden"}">
          <aside class="tool-panel">
            <div class="panel-head"><div><p class="eyebrow">HERRAMIENTAS</p><h2>Escribir</h2></div></div>
            <section><p class="eyebrow">ESCRITURA</p><h2>Notas y figuras</h2><p class="muted">Elige un modo y escribe sobre el pentagrama o desde el teclado.</p></section>
            <section><h3>Herramientas</h3><div class="tool-grid">${tools.map(([id, label, key]) => `<button class="tool ${state.tool === id ? "active" : ""}" data-tool="${id}"><strong>${label}</strong><small>${key}</small></button>`).join("")}</div></section>
            <section><h3>Figura</h3><select id="duration" aria-label="Duración de nota">${DURATION_OPTIONS.map((item) => `<option value="${item.value}" ${state.duration === item.value ? "selected" : ""}>${item.label}</option>`).join("")}</select></section>
            <section><h3>Documento</h3><label class="field-label">Título<input id="score-title" value="${state.score.title}" maxlength="60" /></label></section>
          </aside>
          <section class="score-area" aria-label="Editor de partituras">
            <div class="score-status"><span>${activeTool} · Compás ${state.cursor.measure + 1} · ${state.cursor.beat + 1}/4</span><span>${renderMeasureSummary(state.score)}</span></div>
            <div id="score-canvas" class="score-canvas">${renderScore(state)}</div>
            <section class="keyboard-area ${state.keyboardOpen ? "" : "closed"}" aria-label="Teclado MIDI virtual">
              <div class="keyboard-header"><span>TECLADO VIRTUAL</span><span>${duration.label}</span></div>
              <div class="piano">${pitches.map((pitch) => `<button class="key ${pitch.includes("#") ? "black" : ""}" data-pitch="${pitch}">${pitch.replace(/[0-9]/, "")}${pitch.endsWith("4") || pitch.endsWith("5") ? `<small>${pitch.slice(-1)}</small>` : ""}</button>`).join("")}</div>
            </section>
            <p class="hint">Atajos: N notas · R silencios · Esc selección · ⌘/Ctrl + Z deshacer</p>
          </section>
          <aside class="inspector">
            <button class="close-inspector" data-action="toggle-inspector" aria-label="Ocultar inspector">×</button>
            <p class="eyebrow">INSPECTOR</p><h2>Estado actual</h2>
            <section><h3>Escritura</h3><dl><div><dt>Modo</dt><dd>${activeTool}</dd></div><div><dt>Figura</dt><dd>${duration.label}</dd></div><div><dt>Cursor</dt><dd>Compás ${state.cursor.measure + 1}</dd></div></dl></section>
            <section><h3>Selección</h3><p class="muted">${state.selection ? "Nota seleccionada. Usa Borrar o ⌫ para eliminarla." : "Selecciona una nota para editarla."}</p></section>
            <section><h3>Estado</h3><p class="muted">${state.status}</p></section>
          </aside>
        </div>
        <button class="show-inspector ${state.inspectorOpen ? "hidden" : ""}" data-action="toggle-inspector">Mostrar inspector</button>
      </main>
    </div>`;
  bindEvents();
}

function noteAtCursor(pitch, isRest = false) {
  const measure = state.score.measures[state.cursor.measure];
  const duration = getDuration(state.duration);
  if (state.cursor.beat + duration.beats > 4) return setStatus("No hay espacio suficiente en este compás."), render();
  checkpoint();
  measure.notes = measure.notes.filter((note) => note.beat !== state.cursor.beat);
  measure.notes.push({ id: crypto.randomUUID(), pitch, duration: state.duration, beat: state.cursor.beat, rest: isRest });
  measure.notes.sort((a, b) => a.beat - b.beat);
  moveCursor(duration.beats);
  state.dirty = true;
  setStatus(isRest ? "Silencio añadido" : `${pitch} añadido`);
  render();
}

function moveCursor(beats) {
  const total = state.cursor.beat + beats;
  state.cursor.measure += Math.floor(total / 4);
  state.cursor.beat = total % 4;
  if (state.cursor.measure >= state.score.measures.length) {
    state.cursor.measure = state.score.measures.length - 1;
    state.cursor.beat = 4 - beats;
  }
}

function clickScore(event) {
  const noteElement = event.target.closest("[data-note-id]");
  if (noteElement) {
    const id = noteElement.dataset.noteId;
    if (state.tool === "erase") return removeNote(id);
    state.selection = id;
    setStatus("Nota seleccionada");
    return render();
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const point = event.clientX - rect.left;
  const measure = Math.max(0, Math.min(3, Math.floor((point / rect.width) * 4)));
  state.cursor.measure = measure;
  state.cursor.beat = 0;
  state.selection = null;
  setStatus(`Cursor en compás ${measure + 1}`);
  render();
}

function removeNote(id = state.selection) {
  if (!id) return;
  checkpoint();
  state.score.measures.forEach((measure) => { measure.notes = measure.notes.filter((note) => note.id !== id); });
  state.selection = null;
  state.dirty = true;
  setStatus("Nota eliminada");
  render();
}

function undo() { if (!state.history.length) return; state.future.push(clone(state.score)); state.score = state.history.pop(); state.selection = null; state.dirty = true; setStatus("Último cambio deshecho"); render(); }
function redo() { if (!state.future.length) return; state.history.push(clone(state.score)); state.score = state.future.pop(); state.selection = null; state.dirty = true; setStatus("Cambio rehecho"); render(); }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(state))); state.dirty = false; setStatus("Ejercicio guardado en este navegador"); render(); }

function bindEvents() {
  document.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => { state.tool = button.dataset.tool; state.selection = null; setStatus(`Modo ${button.textContent.trim()} activo`); render(); }));
  document.querySelectorAll("[data-pitch]").forEach((button) => button.addEventListener("click", () => state.tool === "rest" ? noteAtCursor("B4", true) : noteAtCursor(button.dataset.pitch)));
  document.querySelector("#score-canvas").addEventListener("click", clickScore);
  document.querySelector("#duration").addEventListener("change", (event) => { state.duration = event.target.value; setStatus("Figura actualizada"); render(); });
  document.querySelector("#score-title").addEventListener("change", (event) => { checkpoint(); state.score.title = event.target.value.trim() || "Ejercicio sin título"; state.dirty = true; setStatus("Título actualizado"); render(); });
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => ({ save, undo, redo, "toggle-inspector": () => { state.inspectorOpen = !state.inspectorOpen; render(); } }[button.dataset.action]())));
}

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey) { if (event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); } if (event.key.toLowerCase() === "s") { event.preventDefault(); save(); } return; }
  if (event.target.matches("input, select")) return;
  if (event.key === "Escape") { state.tool = "select"; render(); }
  if (event.key.toLowerCase() === "n") { state.tool = "note"; render(); }
  if (event.key.toLowerCase() === "r") { state.tool = "rest"; render(); }
  if (event.key === "Backspace" || event.key === "Delete") removeNote();
});

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved?.score?.measures) { state.score = saved.score; state.status = "Ejercicio restaurado desde este navegador"; }
} catch { /* A malformed saved document should never stop the editor. */ }

render();
