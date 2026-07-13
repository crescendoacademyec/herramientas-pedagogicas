(function () {
  "use strict";

  const Recognition = window.JMLMidiRecognition || {};
  const ALL_INPUTS_VALUE = "__all_midi_inputs__";
  const NOTE_NAMES = Recognition.NOTE_NAMES || ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const SIMPLE_INTERVAL_LABELS = Recognition.SIMPLE_INTERVAL_LABELS || {
    0: "unisono",
    1: "b2",
    2: "2",
    3: "b3",
    4: "3",
    5: "4",
    6: "b5",
    7: "5",
    8: "#5/b6",
    9: "6",
    10: "b7",
    11: "7"
  };

  function midiToName(note) {
    if (Recognition.midiToName) return Recognition.midiToName(note);
    return `${NOTE_NAMES[((note % 12) + 12) % 12]}${Math.floor(note / 12) - 1}`;
  }

  function simpleIntervalName(interval) {
    if (Recognition.simpleIntervalName) return Recognition.simpleIntervalName(interval);
    return SIMPLE_INTERVAL_LABELS[((interval % 12) + 12) % 12] || `${interval}`;
  }

  function normalizeNotes(notes) {
    return [...new Set([...(notes || [])].map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
  }

  function parseWebMidiMessage(eventOrData) {
    const data = eventOrData && eventOrData.data ? eventOrData.data : eventOrData;
    if (!data || data.length < 3) {
      return { type: "unknown", raw: data || [] };
    }
    const status = data[0];
    const command = status & 0xf0;
    const channel = status & 0x0f;
    const data1 = data[1];
    const data2 = data[2];
    let type = "other";
    if (command === 0x90 && data2 > 0) type = "note_on";
    else if (command === 0x80 || (command === 0x90 && data2 === 0)) type = "note_off";
    else if (command === 0xb0) type = "control_change";
    return {
      type,
      command,
      channel,
      note: data1,
      velocity: data2,
      control: data1,
      value: data2,
      raw: data
    };
  }

  class MidiNoteCapture extends EventTarget {
    constructor(options = {}) {
      super();
      this.access = null;
      this.inputMode = ALL_INPUTS_VALUE;
      this.connectedInputs = new Map();
      this.activeNotes = new Set();
      this.sustainedNotes = new Set();
      this.sustainOn = false;
      this.learningChord = false;
      this.learningWaitingFirstNote = false;
      this.learningCaptureNotes = new Set();
      this.captureWindowMs = Number.isFinite(options.captureWindowMs) ? options.captureWindowMs : 500;
      this.captureTimer = null;
      this.lastError = null;
      this._boundHandleMIDIMessage = (event) => this.handleMIDIMessage(event);
      if (options.autoConnect) {
        queueMicrotask(() => {
          this.requestAccess(options.requestOptions || {})
            .then(() => this.connect(options.inputId || ALL_INPUTS_VALUE))
            .catch((error) => {
              this.lastError = error;
              this.dispatchEvent(new CustomEvent("error", { detail: { error } }));
            });
        });
      }
    }

    static get ALL_INPUTS_VALUE() {
      return ALL_INPUTS_VALUE;
    }

    get notes() {
      return new Set([...this.activeNotes, ...this.sustainedNotes]);
    }

    get orderedNotes() {
      return normalizeNotes(this.notes);
    }

    async requestAccess(options = {}) {
      if (!navigator.requestMIDIAccess) {
        throw new Error("Web MIDI no esta disponible en este navegador.");
      }
      this.access = await navigator.requestMIDIAccess({ sysex: false, ...options });
      this.access.onstatechange = () => {
        this.dispatchEvent(new CustomEvent("portschange", {
          detail: { inputs: this.listInputs(), connectedInputs: this.listConnectedInputs() }
        }));
      };
      return this.access;
    }

    listInputs() {
      if (!this.access) return [];
      return [...this.access.inputs.values()].map((input) => ({
        id: input.id,
        name: input.name,
        manufacturer: input.manufacturer,
        state: input.state,
        connection: input.connection
      }));
    }

    listConnectedInputs() {
      return [...this.connectedInputs.values()].map((input) => ({
        id: input.id,
        name: input.name,
        manufacturer: input.manufacturer,
        state: input.state,
        connection: input.connection
      }));
    }

    connect(inputId = ALL_INPUTS_VALUE) {
      if (!this.access) {
        throw new Error("Primero hay que pedir acceso MIDI con requestAccess().");
      }
      this.disconnect();
      const inputs = inputId === ALL_INPUTS_VALUE
        ? [...this.access.inputs.values()]
        : [this.access.inputs.get(inputId)].filter(Boolean);
      for (const input of inputs) {
        input.onmidimessage = this._boundHandleMIDIMessage;
        this.connectedInputs.set(input.id, input);
      }
      this.inputMode = inputId;
      this.dispatchEvent(new CustomEvent("connect", {
        detail: { inputMode: this.inputMode, inputs: this.listConnectedInputs() }
      }));
      return this.listConnectedInputs();
    }

    disconnect() {
      for (const input of this.connectedInputs.values()) {
        input.onmidimessage = null;
      }
      this.connectedInputs.clear();
      this.dispatchEvent(new CustomEvent("disconnect"));
    }

    handleMIDIMessage(eventOrData) {
      const message = parseWebMidiMessage(eventOrData);
      let changed = false;
      let newNoteOn = false;

      if (message.type === "control_change" && message.control === 64) {
        if (message.value >= 64) {
          this.sustainOn = true;
        } else {
          this.sustainOn = false;
          if (this.sustainedNotes.size) {
            this.sustainedNotes.clear();
            changed = true;
          }
        }
      } else if (message.type === "note_on" || message.type === "note_off") {
        const note = Number(message.note);
        if (Number.isFinite(note)) {
          if (message.type === "note_on" && message.velocity > 0) {
            this.activeNotes.add(note);
            this.sustainedNotes.delete(note);
            newNoteOn = true;
          } else if (this.sustainOn) {
            this.activeNotes.delete(note);
            this.sustainedNotes.add(note);
          } else {
            this.activeNotes.delete(note);
            this.sustainedNotes.delete(note);
          }
          changed = true;
        }
      }

      if (changed) this._emitChange(message, newNoteOn);
      return {
        changed,
        newNoteOn,
        message,
        activeNotes: normalizeNotes(this.activeNotes),
        sustainedNotes: normalizeNotes(this.sustainedNotes),
        notes: this.orderedNotes
      };
    }

    clear() {
      this.activeNotes.clear();
      this.sustainedNotes.clear();
      this.sustainOn = false;
      this._emitChange({ type: "clear" }, false);
    }

    startLearning() {
      const current = this.orderedNotes;
      this.learningChord = true;
      if (current.length) {
        this._finishLearningWithNotes(current);
        return;
      }
      this.learningWaitingFirstNote = true;
      this.learningCaptureNotes.clear();
      this.dispatchEvent(new CustomEvent("learnstart", { detail: { waitingFirstNote: true } }));
    }

    cancelLearning() {
      this._resetLearningState();
      this.dispatchEvent(new CustomEvent("learncancel"));
    }

    captureSummary(notes) {
      const ordered = normalizeNotes(notes);
      if (!ordered.length) return { valid: false, notes: [] };
      const rootNote = ordered[0];
      const intervals = ordered.map((note) => ((note - rootNote) % 12 + 12) % 12);
      return {
        valid: ordered.length >= 2,
        notes: ordered,
        noteNames: ordered.map(midiToName),
        rootNote,
        rootName: midiToName(rootNote),
        intervals,
        intervalNames: intervals.map((interval) => interval === 0 ? "fundamental" : simpleIntervalName(interval))
      };
    }

    _emitChange(message, newNoteOn) {
      const detail = {
        message,
        newNoteOn,
        activeNotes: normalizeNotes(this.activeNotes),
        sustainedNotes: normalizeNotes(this.sustainedNotes),
        notes: this.orderedNotes,
        sustainOn: this.sustainOn
      };
      this.dispatchEvent(new CustomEvent("change", { detail }));

      if (!this.learningChord) return;
      if (this.learningWaitingFirstNote && newNoteOn && detail.notes.length) {
        this._beginCaptureWindow(detail.notes);
      } else if (this.captureTimer) {
        this._absorbCaptureNotes(detail.notes);
      }
    }

    _beginCaptureWindow(notes) {
      this.learningWaitingFirstNote = false;
      this.learningCaptureNotes = new Set(notes);
      if (this.captureTimer) clearTimeout(this.captureTimer);
      this.captureTimer = setTimeout(() => this._finishCaptureWindow(), this.captureWindowMs);
      this.dispatchEvent(new CustomEvent("capturestart", {
        detail: { notes: normalizeNotes(this.learningCaptureNotes) }
      }));
    }

    _absorbCaptureNotes(notes) {
      for (const note of notes) this.learningCaptureNotes.add(note);
      this.dispatchEvent(new CustomEvent("captureupdate", {
        detail: { notes: normalizeNotes(this.learningCaptureNotes) }
      }));
    }

    _finishCaptureWindow() {
      const notes = normalizeNotes(this.learningCaptureNotes);
      this._finishLearningWithNotes(notes);
    }

    _finishLearningWithNotes(notes) {
      const summary = this.captureSummary(notes);
      this._resetLearningState();
      this.dispatchEvent(new CustomEvent("learnfinish", { detail: summary }));
    }

    _resetLearningState() {
      this.learningChord = false;
      this.learningWaitingFirstNote = false;
      this.learningCaptureNotes.clear();
      if (this.captureTimer) {
        clearTimeout(this.captureTimer);
        this.captureTimer = null;
      }
    }
  }

  window.JMLMidiCapture = {
    ALL_INPUTS_VALUE,
    normalizeNotes,
    parseWebMidiMessage,
    MidiNoteCapture,
    createCapture: (options) => new MidiNoteCapture(options)
  };
}());
