(function (root) {
  const COMMON_COMMANDS = Object.freeze([
    { command: "note-input.toggle", code: "KeyN", shift: true },
    { command: "note-input.chord", code: "KeyQ" },
    { command: "note-input.insert", code: "KeyI" },
    { command: "note-input.lock-duration", code: "KeyL" },
    { command: "note-input.force-duration", code: "KeyO" },
    { command: "note-input.pitch-before-duration", code: "KeyK" },
    { command: "note-input.next-voice", code: "KeyV" },
    { command: "note-input.create-voice", code: "KeyV", shift: true },
    { command: "note-input.rest", code: "Comma" },
    { command: "note-input.advance", code: "Space" },
    { command: "note-input.pitch-current", code: "KeyY" },
    { command: "duration.dot", code: "Period" },
    { command: "duration.cycle-dots", code: "Period", alt: true },
    { command: "notation.tie", code: "KeyT" },
    { command: "notation.slur", code: "KeyS" },
    { command: "notation.slur-stop", code: "KeyS", shift: true },
    { command: "dynamic.crescendo", key: "<" },
    { command: "dynamic.diminuendo", key: ">" },
    { command: "edit.flip", code: "KeyF" },
    { command: "edit.repeat", code: "KeyR" },
    { command: "edit.move-left", code: "ArrowLeft", alt: true },
    { command: "edit.move-right", code: "ArrowRight", alt: true },
    { command: "duration.shorten-by-grid", code: "ArrowLeft", shift: true, alt: true },
    { command: "duration.lengthen-by-grid", code: "ArrowRight", shift: true, alt: true },
    { command: "popover.bars", code: "KeyB", shift: true },
    { command: "popover.clef", code: "KeyC", shift: true },
    { command: "popover.dynamics", code: "KeyD", shift: true },
    { command: "popover.holds", code: "KeyH", shift: true },
    { command: "popover.note-tools", code: "KeyI", shift: true },
    { command: "popover.key-signature", code: "KeyK", shift: true },
    { command: "popover.meter", code: "KeyM", shift: true },
    { command: "popover.ornaments", code: "KeyO", shift: true },
    { command: "popover.playing-techniques", code: "KeyP", shift: true },
    { command: "popover.chord-symbol", code: "KeyQ", shift: true },
    { command: "popover.repeats", code: "KeyR", shift: true },
    { command: "popover.tempo", code: "KeyT", shift: true },
    { command: "popover.text", code: "KeyX", shift: true },
    { command: "popover.system-text", code: "KeyX", shift: true, alt: true }
  ]);

  const LAYOUT_COMMANDS = Object.freeze({
    en: Object.freeze([
      { command: "note-input.tuplet", key: ";", shift: false },
      { command: "note-input.stop-tuplet", key: ":" },
      { command: "grid.coarser", code: "BracketLeft", alt: true },
      { command: "grid.finer", code: "BracketRight", alt: true },
      { command: "articulation.accent", key: "[" },
      { command: "articulation.staccato", key: "]" },
      { command: "articulation.marcato", key: "'" },
      { command: "articulation.stress", key: "{" },
      { command: "articulation.staccatissimo", key: "}" },
      { command: "articulation.tenuto", key: "\\" },
      { command: "articulation.portato", key: "|" },
      { command: "articulation.unstress", key: "\"" }
    ]),
    es: Object.freeze([
      { command: "note-input.tuplet", key: "ñ", shift: false },
      { command: "note-input.stop-tuplet", key: "ñ", shift: true },
      { command: "grid.coarser", code: "Digit1", alt: true },
      { command: "grid.finer", code: "Digit2", alt: true },
      { command: "articulation.accent", key: "!" },
      { command: "articulation.staccato", key: "\"" },
      { command: "articulation.marcato", key: "·" },
      { command: "articulation.stress", key: "%" },
      { command: "articulation.staccatissimo", key: "&" },
      { command: "articulation.tenuto", key: "$" },
      { command: "articulation.portato", key: "(" },
      { command: "articulation.unstress", key: "/" }
    ])
  });

  const ACCIDENTAL_KEYS = Object.freeze({
    en: Object.freeze([
      { accidental: "natural", key: "0" },
      { accidental: "flat", key: "-" },
      { accidental: "sharp", key: "=" }
    ]),
    es: Object.freeze([
      { accidental: "natural", key: "0" },
      { accidental: "flat", key: "'" },
      { accidental: "sharp", key: "¡" }
    ])
  });

  const DURATION_KEYS = Object.freeze({
    Digit1: "one-twenty-eighth",
    Digit2: "sixty-fourth",
    Digit3: "thirty-second",
    Digit4: "sixteenth",
    Digit5: "eighth",
    Digit6: "quarter",
    Digit7: "half",
    Digit8: "whole",
    Digit9: "breve"
  });

  function normalizeLayout(value) {
    return String(value || "").toLowerCase().startsWith("es") ? "es" : "en";
  }

  function activeLayout() {
    const documentLanguage = root.document?.documentElement?.lang;
    const browserLanguage = root.navigator?.language;
    return normalizeLayout(documentLanguage || browserLanguage || "en");
  }

  function normalizedKey(value) {
    return String(value || "").toLocaleLowerCase();
  }

  function modifiersMatch(event, binding) {
    const shiftMatches = typeof binding.shift === "boolean"
      ? (event.shiftKey === true) === binding.shift
      : binding.key
        ? true
        : event.shiftKey !== true;
    return shiftMatches &&
      (event.altKey === true) === (binding.alt === true) &&
      (event.metaKey === true) === (binding.meta === true) &&
      (event.ctrlKey === true) === (binding.ctrl === true);
  }

  function bindingMatches(event, binding) {
    if (!modifiersMatch(event, binding)) return false;
    if (binding.code) return binding.code === event.code;
    return normalizedKey(binding.key) === normalizedKey(event.key);
  }

  function commandsForLayout(layout = activeLayout()) {
    return [...COMMON_COMMANDS, ...(LAYOUT_COMMANDS[normalizeLayout(layout)] || [])];
  }

  function commandForEvent(event, options = {}) {
    return commandsForLayout(options.layout).find((binding) => bindingMatches(event, binding))?.command || null;
  }

  function accidentalForEvent(event, options = {}) {
    const bindings = ACCIDENTAL_KEYS[normalizeLayout(options.layout || activeLayout())] || [];
    return bindings.find((binding) => bindingMatches(event, binding))?.accidental || null;
  }

  function durationKeyMap() {
    return DURATION_KEYS;
  }

  function durationIdForEvent(event) {
    if (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return null;
    const code = String(event.code || "").replace("Numpad", "Digit");
    return DURATION_KEYS[code] || null;
  }

  const api = Object.freeze({
    ACCIDENTAL_KEYS,
    COMMON_COMMANDS,
    DURATION_KEYS,
    LAYOUT_COMMANDS,
    accidentalForEvent,
    activeLayout,
    commandForEvent,
    commandsForLayout,
    durationIdForEvent,
    durationKeyMap
  });
  root.JMLScoreKeymap = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
