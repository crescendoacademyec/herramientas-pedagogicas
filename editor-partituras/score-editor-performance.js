(function () {
  const CACHE_KEY = "__jmlScoreEditorCache";
  const frameTasks = new Map();

  function layoutCache(layout, namespace) {
    if (!layout || typeof layout !== "object") return new Map();
    if (!Object.prototype.hasOwnProperty.call(layout, CACHE_KEY)) {
      Object.defineProperty(layout, CACHE_KEY, {
        value: new Map(),
        enumerable: false,
        configurable: true
      });
    }
    const root = layout[CACHE_KEY];
    if (!root.has(namespace)) root.set(namespace, new Map());
    return root.get(namespace);
  }

  function cached(layout, namespace, key, factory) {
    const cache = layoutCache(layout, namespace);
    if (cache.has(key)) return cache.get(key);
    const value = factory();
    cache.set(key, value);
    return value;
  }

  function scheduleFrame(key, callback) {
    if (frameTasks.has(key)) return frameTasks.get(key);
    const handle = requestAnimationFrame(() => {
      frameTasks.delete(key);
      callback();
    });
    frameTasks.set(key, handle);
    return handle;
  }

  function cancelFrame(key) {
    const handle = frameTasks.get(key);
    if (handle === undefined) return false;
    cancelAnimationFrame(handle);
    frameTasks.delete(key);
    return true;
  }

  window.ScoreEditorPerformance = Object.freeze({
    cached,
    cancelFrame,
    layoutCache,
    scheduleFrame
  });
})();
