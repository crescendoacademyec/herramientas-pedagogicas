(function () {
  const MAX_DOCUMENT_NODES = 250000;
  const MAX_ARRAY_LENGTH = 50000;
  const MAX_STRING_LENGTH = 1000000;
  const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

  function isPlainObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function validateJsonTree(value) {
    const stack = [{ value, depth: 0 }];
    let nodes = 0;
    while (stack.length) {
      const current = stack.pop();
      nodes += 1;
      if (nodes > MAX_DOCUMENT_NODES) return "El documento es demasiado grande.";
      if (current.depth > 80) return "El documento tiene una estructura inválida.";
      const item = current.value;
      if (item === null || typeof item === "boolean") continue;
      if (typeof item === "number") {
        if (!Number.isFinite(item)) return "El documento contiene números inválidos.";
        continue;
      }
      if (typeof item === "string") {
        if (item.length > MAX_STRING_LENGTH) return "El documento contiene texto demasiado extenso.";
        continue;
      }
      if (Array.isArray(item)) {
        if (item.length > MAX_ARRAY_LENGTH) return "El documento contiene una lista demasiado grande.";
        item.forEach((child) => stack.push({ value: child, depth: current.depth + 1 }));
        continue;
      }
      if (!isPlainObject(item)) return "El documento contiene datos no admitidos.";
      for (const [key, child] of Object.entries(item)) {
        if (FORBIDDEN_KEYS.has(key)) return "El documento contiene claves no admitidas.";
        stack.push({ value: child, depth: current.depth + 1 });
      }
    }
    return "";
  }

  function validateMeasure(measure, label) {
    if (!isPlainObject(measure)) return `${label} no es un compás válido.`;
    if (measure.entries != null && !Array.isArray(measure.entries)) {
      return `${label} contiene una lista de figuras inválida.`;
    }
    return "";
  }

  function validatePayload(payload) {
    if (!isPlainObject(payload)) {
      return { valid: false, error: "El archivo no contiene un estado de partitura válido." };
    }
    const treeError = validateJsonTree(payload);
    if (treeError) return { valid: false, error: treeError };

    const systems = Array.isArray(payload.systems) ? payload.systems : [];
    const measures = Array.isArray(payload.measures) ? payload.measures : [];
    if (!systems.length && !measures.length) {
      return { valid: false, error: "El archivo no contiene sistemas ni compases." };
    }
    for (let index = 0; index < systems.length; index += 1) {
      const system = systems[index];
      if (!isPlainObject(system) || !Array.isArray(system.measures)) {
        return { valid: false, error: `El sistema ${index + 1} no tiene compases válidos.` };
      }
      for (let measureIndex = 0; measureIndex < system.measures.length; measureIndex += 1) {
        const error = validateMeasure(system.measures[measureIndex], `El compás ${measureIndex + 1} del sistema ${index + 1}`);
        if (error) return { valid: false, error };
      }
    }
    for (let index = 0; index < measures.length; index += 1) {
      const error = validateMeasure(measures[index], `El compás ${index + 1}`);
      if (error) return { valid: false, error };
    }
    if (payload.marks != null && !Array.isArray(payload.marks)) {
      return { valid: false, error: "La lista de marcas del documento es inválida." };
    }
    if (payload.textItems != null && !Array.isArray(payload.textItems)) {
      return { valid: false, error: "La lista de textos del documento es inválida." };
    }
    return { valid: true, error: "" };
  }

  function slug(value) {
    return String(value || "ejercicio")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 56) || "ejercicio";
  }

  function createDocument(options = {}) {
    const {
      format = "jml-score-exercise",
      version = 1,
      metadata = {},
      payload = {},
      scenes = [],
      editor = "editor-partituras"
    } = options;
    return {
      format,
      version,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: metadata.title,
      description: metadata.description,
      createdAt: new Date().toISOString(),
      editor,
      payload,
      scenes: Array.isArray(scenes) ? scenes : []
    };
  }

  function normalizeDocument(input, options = {}) {
    const {
      format = "jml-score-exercise",
      version = 1,
      editor = "editor-partituras"
    } = options;
    if (!isPlainObject(input)) return null;
    const payload = input.format === format
      ? input.payload
      : (input.payload || input.state || input);
    const validation = validatePayload(payload);
    if (!validation.valid) return null;
    return {
      format,
      version: Number(input.version) || version,
      id: String(input.id || `importado-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      title: String(input.title || input.name || "Ejercicio importado").slice(0, 160),
      description: String(input.description || "").slice(0, 1000),
      createdAt: input.createdAt || new Date().toISOString(),
      editor: input.editor || editor,
      payload,
      scenes: Array.isArray(input.scenes) ? input.scenes : []
    };
  }

  function loadLocalLibrary(options = {}) {
    const { storageGet, storageKey, format, version } = options;
    try {
      const parsed = JSON.parse(storageGet(storageKey) || "[]");
      return Array.isArray(parsed)
        ? parsed.map((item) => normalizeDocument(item, { format, version })).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }

  function saveLocalLibrary(options = {}) {
    const { storageSet, storageKey, items = [] } = options;
    return storageSet(storageKey, JSON.stringify(items));
  }

  window.JMLScoreExercises = Object.freeze({
    createDocument,
    loadLocalLibrary,
    normalizeDocument,
    saveLocalLibrary,
    slug,
    validatePayload
  });
})();
