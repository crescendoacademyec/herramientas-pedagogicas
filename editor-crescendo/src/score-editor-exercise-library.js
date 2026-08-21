(function () {
  function allItems(bundled = [], local = []) {
    return [
      ...bundled.map((item) => ({ ...item, source: "bundled" })),
      ...local.map((item) => ({ ...item, source: "local" }))
    ];
  }

  function currentMetadata(titleInput, descriptionInput) {
    const title = String(titleInput?.value || "").trim() || "Ejercicio sin título";
    return {
      title,
      description: String(descriptionInput?.value || "").trim()
    };
  }

  function renderSelect(select, items, htmlEl) {
    if (!select) return;
    const previous = select.value;
    select.innerHTML = "";
    select.appendChild(htmlEl("option", {
      value: "",
      text: items.length ? "Selecciona un ejercicio..." : "Sin ejercicios guardados"
    }));
    if (items.length) {
      items.forEach((item, index) => {
        const sourceLabel = item.source === "bundled" ? "incluido" : "local";
        select.appendChild(htmlEl("option", {
          value: `${item.source}:${item.id}:${index}`,
          text: `${item.title} · ${sourceLabel}`
        }));
      });
    }
    if ([...select.options].some((option) => option.value === previous)) {
      select.value = previous;
    }
  }

  function selectedDocument(select, items) {
    if (!select?.value) return null;
    const [source, id] = select.value.split(":");
    return items.find((item) => item.source === source && item.id === id) || null;
  }

  function updateForm(selected, elements = {}) {
    if (elements.copyMetadata && elements.titleInput && selected) elements.titleInput.value = selected.title || "";
    if (elements.copyMetadata && elements.descriptionInput && selected) elements.descriptionInput.value = selected.description || "";
    if (elements.deleteButton) elements.deleteButton.disabled = selected?.source !== "local";
    if (elements.loadButton) elements.loadButton.disabled = !selected;
  }

  const MAX_VERSION_HISTORY = 15;

  function upsertLocal(library, exerciseDocument, selected, slug) {
    const nextDocument = { ...exerciseDocument };
    let nextLibrary = [...library];
    if (selected?.source === "local") {
      nextDocument.id = selected.id;
      nextDocument.createdAt = selected.createdAt || nextDocument.createdAt;
      nextDocument.updatedAt = new Date().toISOString();
      const previousVersions = Array.isArray(selected.versions) ? selected.versions : [];
      const archivedPrevious = {
        savedAt: selected.updatedAt || selected.createdAt || nextDocument.updatedAt,
        payload: selected.payload,
        scenes: selected.scenes
      };
      nextDocument.versions = [archivedPrevious, ...previousVersions].slice(0, MAX_VERSION_HISTORY);
      nextLibrary = nextLibrary.map((item) => (
        item.id === selected.id ? nextDocument : item
      ));
    } else {
      nextDocument.id = `local-${slug(nextDocument.title)}-${Date.now()}`;
      nextDocument.versions = [];
      nextLibrary.push(nextDocument);
    }
    return { document: nextDocument, library: nextLibrary };
  }

  function importedLocalLibrary(library, exercise, slug) {
    const exists = library.some((item) => item.id === exercise.id);
    if (exists) return library.map((item) => item.id === exercise.id ? exercise : item);
    return [...library, { ...exercise, id: `local-${slug(exercise.title)}-${Date.now()}` }];
  }

  function downloadJson(exercise, slug) {
    const blob = new Blob([JSON.stringify(exercise, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slug(exercise.title)}.jml-score-exercise.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function loadBundled(options = {}) {
    const { fetchImpl = window.fetch, normalizeDocument, protocol = window.location.protocol } = options;
    if (!fetchImpl || protocol === "file:") return Promise.resolve([]);
    return fetchImpl("exercises/index.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Sin manifest");
        return response.json();
      })
      .then(async (manifest) => {
        const entries = Array.isArray(manifest?.exercises) ? manifest.exercises : [];
        const documents = await Promise.all(entries.map(async (entry) => {
          if (entry.document) return normalizeDocument(entry.document);
          if (!entry.file) return null;
          const itemResponse = await fetchImpl(`exercises/${entry.file}`, { cache: "no-store" });
          if (!itemResponse.ok) return null;
          return normalizeDocument(await itemResponse.json());
        }));
        return documents.filter(Boolean);
      })
      .catch(() => []);
  }

  window.JMLScoreExerciseLibrary = Object.freeze({
    allItems,
    currentMetadata,
    downloadJson,
    importedLocalLibrary,
    loadBundled,
    renderSelect,
    selectedDocument,
    updateForm,
    upsertLocal
  });
})();
