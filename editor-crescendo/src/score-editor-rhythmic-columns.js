(function (root) {
  const EPSILON = 0.0001;

  function tickKey(tick) {
    return String(Math.round((Number(tick) || 0) * 1000000) / 1000000);
  }

  function normalizeAnchors(anchors = []) {
    const byTick = new Map();
    anchors.forEach((anchor) => {
      const tick = Number(anchor?.tick);
      const x = Number(anchor?.x);
      if (!Number.isFinite(tick) || !Number.isFinite(x)) return;
      const score = Number(anchor?.score) || 0;
      const key = tickKey(tick);
      const current = byTick.get(key);
      if (!current || score > current.score || (score === current.score && x < current.x)) {
        byTick.set(key, { tick, x, score });
      }
    });
    return [...byTick.values()].sort((a, b) => a.tick - b.tick || a.x - b.x);
  }

  function xAtTick(anchors = [], tick, fallback = null) {
    const normalized = normalizeAnchors(anchors);
    const target = Number(tick) || 0;
    const exact = normalized.find((anchor) => Math.abs(anchor.tick - target) < EPSILON);
    if (exact) return exact.x;
    const previous = normalized.filter((anchor) => anchor.tick < target).at(-1);
    const next = normalized.find((anchor) => anchor.tick > target);
    if (previous && next && next.tick > previous.tick + EPSILON) {
      const ratio = (target - previous.tick) / (next.tick - previous.tick);
      return previous.x + (next.x - previous.x) * ratio;
    }
    if (previous) return previous.x;
    if (next) return next.x;
    return typeof fallback === "function" ? fallback(target) : fallback;
  }

  function createIndex() {
    const values = new Map();
    return {
      clear() {
        values.clear();
      },
      get(systemIndex, measureIndex, tick) {
        return values.get(`${Number(systemIndex) || 0}:${Number(measureIndex) || 0}:${tickKey(tick)}`);
      },
      set(systemIndex, measureIndex, tick, x) {
        if (!Number.isFinite(Number(x))) return false;
        values.set(`${Number(systemIndex) || 0}:${Number(measureIndex) || 0}:${tickKey(tick)}`, Number(x));
        return true;
      }
    };
  }

  const api = Object.freeze({ createIndex, normalizeAnchors, tickKey, xAtTick });
  root.JMLScoreRhythmicColumns = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
