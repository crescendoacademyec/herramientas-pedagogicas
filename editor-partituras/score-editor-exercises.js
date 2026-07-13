(function () {
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
    if (!input || typeof input !== "object") return null;
    const payload = input.format === format
      ? input.payload
      : (input.payload || input.state || input);
    if (!payload || typeof payload !== "object") return null;
    return {
      format,
      version: Number(input.version) || version,
      id: String(input.id || `importado-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      title: String(input.title || input.name || "Ejercicio importado"),
      description: String(input.description || ""),
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
    storageSet(storageKey, JSON.stringify(items, null, 2));
  }

  window.JMLScoreExercises = Object.freeze({
    createDocument,
    loadLocalLibrary,
    normalizeDocument,
    saveLocalLibrary,
    slug
  });
})();
