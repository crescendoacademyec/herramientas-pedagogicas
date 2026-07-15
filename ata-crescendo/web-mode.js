/*
 * ATA web adapter.
 * Keeps the complete desktop UI and engine while replacing its local Node API
 * with static resources plus private browser storage.
 */
(function () {
  "use strict";

  window.ATA_WEB_FULL_MODE = true;
  document.body.classList.add("webFullMode");

  const nativeFetch = window.fetch.bind(window);
  const APP_ROOT = new URL("./", document.baseURI);
  const DB_NAME = "ata-web";
  const STORE_NAME = "records";
  const STATIC_CACHE = new Map();
  let databasePromise;

  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }

  function normalizeUrl(input) {
    const raw = typeof input === "string" ? input : input?.url || "";
    return new URL(raw, window.location.href);
  }

  function requestMethod(input, init) {
    return String(init?.method || input?.method || "GET").toUpperCase();
  }

  async function requestJson(input, init) {
    if (typeof init?.body === "string") return JSON.parse(init.body || "{}");
    if (input instanceof Request) {
      const text = await input.clone().text();
      return JSON.parse(text || "{}");
    }
    return init?.body && typeof init.body === "object" ? init.body : {};
  }

  function staticUrl(relativePath) {
    return new URL(relativePath.replace(/^\.\//, ""), APP_ROOT).href;
  }

  async function staticJson(relativePath, fallback) {
    if (STATIC_CACHE.has(relativePath)) return structuredClone(STATIC_CACHE.get(relativePath));
    const response = await nativeFetch(staticUrl(relativePath));
    if (!response.ok) {
      if (arguments.length > 1) return structuredClone(fallback);
      throw new Error(`No se pudo cargar ${relativePath}`);
    }
    const data = await response.json();
    STATIC_CACHE.set(relativePath, data);
    return structuredClone(data);
  }

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Error de almacenamiento local"));
    });
  }

  function openDatabase() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        const store = database.objectStoreNames.contains(STORE_NAME)
          ? request.transaction.objectStore(STORE_NAME)
          : database.createObjectStore(STORE_NAME, { keyPath: "key" });
        if (!store.indexNames.contains("type")) store.createIndex("type", "type", { unique: false });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("No se pudo abrir la biblioteca privada"));
      request.onblocked = () => reject(new Error("La biblioteca privada esta bloqueada por otra pestana"));
    });
    return databasePromise;
  }

  async function getRecord(key) {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readonly");
    return requestResult(transaction.objectStore(STORE_NAME).get(key));
  }

  async function recordsOfType(type) {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readonly");
    return requestResult(transaction.objectStore(STORE_NAME).index("type").getAll(IDBKeyRange.only(type)));
  }

  async function writeRequest(callback) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const request = callback(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("No se pudo actualizar la biblioteca"));
      transaction.onabort = () => reject(transaction.error || new Error("La actualizacion fue cancelada"));
    });
  }

  function putRecord(record) {
    return writeRequest(store => store.put(record));
  }

  function deleteRecord(key) {
    return writeRequest(store => store.delete(key));
  }

  function slugify(value) {
    return String(value || "sin-titulo")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || "sin-titulo";
  }

  function titleCaseFilenameBase(value) {
    const cleaned = String(value || "Sin titulo")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\.json$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/[^a-zA-Z0-9 .]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned.split(" ").filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ").slice(0, 90) || "Sin Titulo";
  }

  function safeJsonFilename(value, label = "Archivo") {
    const clean = String(value || "").split(/[\\/]/).pop();
    if (!clean || !clean.toLowerCase().endsWith(".json")) throw new Error(`${label} invalido`);
    return clean;
  }

  function stateDocument(state) {
    return state?.document || state?.song || state || {};
  }

  async function saveBackup(kind, filename, value) {
    if (!value) return "";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backup = `${String(filename).replace(/\.json$/i, "")}-${stamp}.json`;
    await putRecord({
      key: `backup:${kind}:${filename}:${stamp}`,
      type: "backup",
      kind,
      filename: backup,
      originalFilename: filename,
      savedAt: new Date().toISOString(),
      value
    });
    return backup;
  }

  async function listSongs() {
    const records = await recordsOfType("song");
    return records.map(record => {
      const documentState = stateDocument(record.state);
      return {
        filename: record.filename,
        title: titleCaseFilenameBase(documentState.title || record.filename),
        composer: documentState.composer || "",
        modified: record.modified || record.state?.savedAt || new Date().toISOString()
      };
    }).sort((left, right) => left.title.localeCompare(right.title, "es", { sensitivity: "base" }));
  }

  async function saveSong(payload) {
    const state = payload.state ? payload.state : payload.document ? payload : null;
    const song = state?.document || payload.song || payload;
    const filenameBase = payload.filename
      ? slugify(String(payload.filename).replace(/\.json$/i, ""))
      : slugify(song.title || "sin-titulo");
    const filename = `${filenameBase}.json`;
    const normalizedDocument = {
      ...(song || {}),
      version: song.version || 7,
      title: song.title || "Sin titulo",
      composer: song.composer || "",
      updatedAt: new Date().toISOString(),
      settings: song.settings || {},
      pages: Array.isArray(song.pages) ? song.pages : []
    };
    const normalized = {
      app: "analizador-armonico-svg-pro",
      exportVersion: Math.max(34, Number(state?.exportVersion || 7)),
      savedAt: new Date().toISOString(),
      document: normalizedDocument,
      uiState: state?.uiState || {}
    };
    await putRecord({
      key: `song:${filename}`,
      type: "song",
      filename,
      modified: normalized.savedAt,
      state: normalized
    });
    return { ok: true, filename, state: normalized, song: normalizedDocument };
  }

  async function normalizeSongFilenames() {
    const songs = (await recordsOfType("song"))
      .sort((left, right) => left.filename.localeCompare(right.filename, "es", { sensitivity: "base" }));
    const used = new Set();
    const renamed = {};
    for (const record of songs) {
      const base = titleCaseFilenameBase(record.filename);
      let nextName = `${base}.json`;
      let index = 2;
      while (used.has(nextName)) nextName = `${base} ${index++}.json`;
      used.add(nextName);
      if (nextName === record.filename) continue;
      const nextState = structuredClone(record.state);
      nextState.uiState = { ...(nextState.uiState || {}), currentFilename: nextName };
      await putRecord({ ...record, key: `song:${nextName}`, filename: nextName, state: nextState });
      await deleteRecord(record.key);
      renamed[record.filename] = nextName;
    }
    return { ok: true, renamed, songs: await listSongs() };
  }

  async function getStaticOrLocal(kind, filename, staticDirectory) {
    const record = await getRecord(`${kind}:${filename}`);
    if (record?.state !== undefined) return record.state;
    const response = await nativeFetch(staticUrl(`${staticDirectory}/${encodeURIComponent(filename)}`));
    return response.ok ? response.json() : null;
  }

  async function curatedMetadata() {
    const staticItems = await staticJson("data/curated-index.json", []);
    const localItems = await recordsOfType("curated");
    const map = new Map(staticItems.map(item => [item.filename, { ...item, static: true }]));
    localItems.forEach(record => {
      const documentState = stateDocument(record.state);
      map.set(record.filename, {
        filename: record.filename,
        title: documentState.title || record.filename.replace(/\.json$/i, ""),
        composer: documentState.composer || "",
        sourceStandardFilename: record.sourceStandardFilename || record.state?.sourceStandardFilename || "",
        modified: record.modified,
        static: false
      });
    });
    return [...map.values()];
  }

  async function listStandards() {
    const baseItems = await staticJson("data/standards-index.json", []);
    const curated = await curatedMetadata();
    const curatedBySource = new Map();
    curated.forEach(item => {
      if (item.sourceStandardFilename) curatedBySource.set(item.sourceStandardFilename.toLowerCase(), item);
      curatedBySource.set(item.filename.toLowerCase(), item);
    });
    const represented = new Set();
    const originals = baseItems.map(item => {
      const expectedName = `${slugify(String(item.filename).replace(/\.json$/i, ""))}.json`.toLowerCase();
      const match = curatedBySource.get(String(item.filename).toLowerCase()) || curatedBySource.get(expectedName);
      if (match) represented.add(match.filename);
      return { ...item, curatedFilename: match?.filename || "", curated: Boolean(match) };
    });
    const standalone = curated.filter(item => !represented.has(item.filename)).map(item => ({
      filename: "",
      curatedFilename: item.filename,
      curated: true,
      standaloneCurated: true,
      title: item.title || item.filename.replace(/\.json$/i, ""),
      composer: item.composer || "",
      key: "",
      rhythm: "ATA-Standards",
      timeSignature: ""
    }));
    return [...originals, ...standalone]
      .sort((left, right) => String(left.title || "").localeCompare(String(right.title || ""), "es", { sensitivity: "base" }));
  }

  async function saveCurated(payload) {
    const state = payload.state || null;
    const documentState = state?.document || null;
    if (!state || !documentState) throw new Error("Standard curado invalido");
    const filenameBase = payload.filename
      ? slugify(String(payload.filename).replace(/\.json$/i, ""))
      : slugify(documentState.title || "standard-curado");
    const filename = `${filenameBase}.json`;
    const previous = await getStaticOrLocal("curated", filename, "data/curated");
    const backup = await saveBackup("curated", filename, previous);
    const normalized = {
      ...state,
      savedAt: new Date().toISOString(),
      curatedStandard: true,
      sourceStandardFilename: payload.sourceFilename || state.uiState?.currentStandardFilename || ""
    };
    await putRecord({
      key: `curated:${filename}`,
      type: "curated",
      filename,
      sourceStandardFilename: normalized.sourceStandardFilename,
      modified: normalized.savedAt,
      state: normalized
    });
    return { ok: true, filename, backup, state: normalized };
  }

  async function listThemes() {
    const staticItems = await staticJson("data/admin/themes-index.json", []);
    const localItems = await recordsOfType("theme");
    const map = new Map(staticItems.map(item => [item.filename, { ...item, modified: "2026-01-01T00:00:00.000Z" }]));
    localItems.forEach(record => {
      const documentState = stateDocument(record.state);
      map.set(record.filename, {
        filename: record.filename,
        title: documentState.title || record.filename.replace(/\.json$/i, ""),
        composer: documentState.composer || "",
        modified: record.modified
      });
    });
    return [...map.values()].sort((left, right) => new Date(right.modified) - new Date(left.modified));
  }

  async function saveTheme(payload) {
    const state = payload.state || null;
    const documentState = state?.document || null;
    if (!state || !documentState) throw new Error("Tema administrativo invalido");
    const filename = `${titleCaseFilenameBase(payload.filename || documentState.title || "tema-admin")}.json`;
    const normalized = { ...state, savedAt: new Date().toISOString(), adminTheme: true };
    await putRecord({
      key: `theme:${filename}`,
      type: "theme",
      filename,
      modified: normalized.savedAt,
      state: normalized
    });
    return { ok: true, filename, state: normalized };
  }

  async function defaultSettings() {
    const record = await getRecord("settings:default");
    return record?.settings || staticJson("data/admin/default-settings.json", null);
  }

  async function saveDefaultSettings(payload) {
    const settings = payload.settings || null;
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      throw new Error("Apariencia administrativa invalida");
    }
    const previous = await getRecord("settings:default");
    const backup = await saveBackup("settings", "default-settings.json", previous?.settings || await defaultSettings());
    await putRecord({ key: "settings:default", type: "settings", modified: new Date().toISOString(), settings });
    return { ok: true, settings, backup };
  }

  async function engineExamples() {
    const record = await getRecord("engine:examples");
    return Array.isArray(record?.examples) ? record.examples : [];
  }

  async function saveEngineExample(payload) {
    const example = payload.example || null;
    if (!example || !Array.isArray(example.chords) || !Array.isArray(example.results)) {
      throw new Error("Ejemplo administrativo invalido");
    }
    const examples = await engineExamples();
    examples.push({
      ...example,
      id: example.id || `${slugify(example.name || "ejemplo")}-${Date.now()}`,
      savedAt: new Date().toISOString()
    });
    await putRecord({ key: "engine:examples", type: "engine-examples", modified: new Date().toISOString(), examples });
    return { ok: true, examples };
  }

  async function routeApi(path, method, input, init) {
    if (path === "/api/songs" && method === "GET") return jsonResponse({ songs: await listSongs() });
    if (path === "/api/songs" && method === "POST") return jsonResponse(await saveSong(await requestJson(input, init)));
    if (path === "/api/songs/normalize-filenames" && method === "POST") {
      return jsonResponse(await normalizeSongFilenames());
    }
    if (path.startsWith("/api/songs/") && method === "GET") {
      const filename = safeJsonFilename(decodeURIComponent(path.replace("/api/songs/", "")));
      const record = await getRecord(`song:${filename}`);
      return record ? jsonResponse(record.state) : jsonResponse({ error: "No existe ese analisis" }, 404);
    }
    if (path.startsWith("/api/songs/") && method === "DELETE") {
      const filename = safeJsonFilename(decodeURIComponent(path.replace("/api/songs/", "")));
      await deleteRecord(`song:${filename}`);
      return jsonResponse({ ok: true });
    }

    if (path === "/api/standards" && method === "GET") return jsonResponse({ standards: await listStandards() });
    if (path.startsWith("/api/standards/") && method === "GET") {
      const filename = safeJsonFilename(decodeURIComponent(path.replace("/api/standards/", "")), "Standard");
      const override = await getRecord(`standard:${filename}`);
      if (override?.standard) return jsonResponse(override.standard);
      const response = await nativeFetch(staticUrl(`data/standards/${encodeURIComponent(filename)}`));
      return response.ok ? response : jsonResponse({ error: "No existe ese standard" }, 404);
    }
    if (path.startsWith("/api/standards/") && method === "POST") {
      const filename = safeJsonFilename(decodeURIComponent(path.replace("/api/standards/", "")), "Standard");
      const standard = (await requestJson(input, init)).standard || null;
      if (!standard || !standard.Title || !Array.isArray(standard.Sections)) {
        return jsonResponse({ error: "Standard corregido invalido" }, 400);
      }
      const previousRecord = await getRecord(`standard:${filename}`);
      let previous = previousRecord?.standard;
      if (!previous) {
        const response = await nativeFetch(staticUrl(`data/standards/${encodeURIComponent(filename)}`));
        if (!response.ok) return jsonResponse({ error: "No existe ese standard" }, 404);
        previous = await response.json();
      }
      const backup = await saveBackup("standard", filename, previous);
      await putRecord({ key: `standard:${filename}`, type: "standard", filename, modified: new Date().toISOString(), standard });
      return jsonResponse({ ok: true, filename, backup, standard });
    }

    if (path.startsWith("/api/curated-standards/") && method === "GET") {
      const filename = safeJsonFilename(decodeURIComponent(path.replace("/api/curated-standards/", "")), "Standard curado");
      const state = await getStaticOrLocal("curated", filename, "data/curated");
      return state ? jsonResponse(state) : jsonResponse({ error: "No existe ese standard curado" }, 404);
    }
    if (path === "/api/curated-standards" && method === "POST") {
      return jsonResponse(await saveCurated(await requestJson(input, init)));
    }

    if (path === "/api/admin/default-settings" && method === "GET") {
      return jsonResponse({ settings: await defaultSettings() });
    }
    if (path === "/api/admin/default-settings" && method === "POST") {
      return jsonResponse(await saveDefaultSettings(await requestJson(input, init)));
    }
    if (path === "/api/admin/engine-examples" && method === "GET") {
      return jsonResponse({ examples: await engineExamples() });
    }
    if (path === "/api/admin/engine-examples" && method === "POST") {
      return jsonResponse(await saveEngineExample(await requestJson(input, init)));
    }
    if (path === "/api/admin/themes" && method === "GET") return jsonResponse({ themes: await listThemes() });
    if (path === "/api/admin/themes" && method === "POST") {
      return jsonResponse(await saveTheme(await requestJson(input, init)));
    }
    if (path.startsWith("/api/admin/themes/") && method === "GET") {
      const filename = safeJsonFilename(decodeURIComponent(path.replace("/api/admin/themes/", "")), "Tema administrativo");
      const state = await getStaticOrLocal("theme", filename, "data/admin/themes");
      return state ? jsonResponse(state) : jsonResponse({ error: "No existe ese tema administrativo" }, 404);
    }
    return jsonResponse({ error: "Ruta ATA no encontrada" }, 404);
  }

  window.fetch = async function ataFullFetch(input, init) {
    const url = normalizeUrl(input);
    if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/")) {
      return nativeFetch(input, init);
    }
    try {
      return await routeApi(url.pathname, requestMethod(input, init), input, init);
    } catch (error) {
      console.error("ATA web storage error", error);
      return jsonResponse({ error: error?.message || "Error de almacenamiento privado" }, 500);
    }
  };

  const style = document.createElement("style");
  style.textContent = `
    body.webFullMode #status::before {
      content: "ATA · ";
      color: #d9781f;
      font-weight: 800;
    }
  `;
  document.head.appendChild(style);
})();
