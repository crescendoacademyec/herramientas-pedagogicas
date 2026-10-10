(function () {
  'use strict';

  const { CHORD_PRESETS, INTERVAL_PRESETS } = window.ETData;
  const DB_KEY = 'earTraining_db_v3';
  const DB_VERSION = 3;

  const DEFAULT_DB = () => ({
    version: DB_VERSION,
    stats: {},
    conceptStats: {},
    history: [],
    prefs: {
      volume: 0.78,
      autoplay: true,
      instrument: 'piano',
      challengeMinutes: 5,
      activeLevel: 1,
      mode: 'practice',
      intervalMode: 'random',
      register: 'random',
      chordVoicing: 'root',
      tonalReference: 'chord',
      level3Type: 'tetrad'
    },
    selections: {
      intervals: INTERVAL_PRESETS.complete.ids.slice(),
      chords: CHORD_PRESETS.basic.ids.slice(),
      level3Targets: [0,1,2,3,4,5,6],
      level3Refs: [0,1,2,3,4,5,6]
    }
  });


  function lsGet(key) { try { return window.localStorage ? localStorage.getItem(key) : null; } catch (_) { return null; } }
  function lsSet(key, value) { try { if (window.localStorage) localStorage.setItem(key, value); return true; } catch (_) { return false; } }
  function lsRemove(key) { try { if (window.localStorage) localStorage.removeItem(key); } catch (_) {} }

  function safeParse(raw, fallback) {
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeDb(input) {
    const base = DEFAULT_DB();
    if (!input || typeof input !== 'object') return base;
    return {
      ...base,
      ...input,
      version: DB_VERSION,
      stats: input.stats && typeof input.stats === 'object' ? input.stats : {},
      conceptStats: input.conceptStats && typeof input.conceptStats === 'object' ? input.conceptStats : {},
      history: Array.isArray(input.history) ? input.history : [],
      prefs: { ...base.prefs, ...(input.prefs || {}) },
      selections: { ...base.selections, ...(input.selections || {}) }
    };
  }

  function migrateLegacy(db) {
    // Importa de forma conservadora los datos de la versión monolítica anterior.
    const legacyStats = safeParse(lsGet('earTraining_stats'), null);
    const legacyHistory = safeParse(lsGet('earTraining_history_v1'), null);
    const legacyChords = safeParse(lsGet('earTraining_chords'), null);
    const legacyIntervals = safeParse(lsGet('earTraining_intervals'), null);
    const legacyL3 = safeParse(lsGet('earTraining_level3targets'), null);
    const legacyL3Refs = safeParse(lsGet('earTraining_level3refs'), null);
    const legacyL3Type = lsGet('earTraining_level3type');

    if (legacyStats && Object.keys(db.stats).length === 0) db.stats = legacyStats;
    if (Array.isArray(legacyHistory) && db.history.length === 0) db.history = legacyHistory;
    if (Array.isArray(legacyIntervals) && legacyIntervals.length) db.selections.intervals = legacyIntervals;
    if (Array.isArray(legacyL3) && legacyL3.length) db.selections.level3Targets = legacyL3;
    if (Array.isArray(legacyL3Refs) && legacyL3Refs.length) db.selections.level3Refs = legacyL3Refs;
    if (legacyL3Type === 'triad' || legacyL3Type === 'tetrad') db.prefs.level3Type = legacyL3Type;

    // Los ids antiguos de acordes contenían duplicados/alias; solo se importan ids que aún existen.
    if (Array.isArray(legacyChords) && legacyChords.length) {
      const validIds = new Set(window.ETData.CHORD_BANK.map(c => c.id));
      const aliasMap = {
        cmi7:'cm7', cmi7b:'cm7', cmi9:'cm9', cm9_99:'cm9', c9_99:'c9',
        c7sharp5:'c7s5', c7flat5:'c7b5', cm7flat5:'cm7b5', cdim7:'cdim7',
        c7sharp9:'c7s9', c9sharp5:'c9s5', c9flat5:'c9b5', c7sharp11:'c7s11',
        c9sharp11:'c9s11', c13sharp11:'c13s11', c13sharp9:'c13s9', cmaj7:'cmaj7'
      };
      const mapped = [...new Set(legacyChords.map(id => validIds.has(id) ? id : aliasMap[id]).filter(id => validIds.has(id)))];
      if (mapped.length) db.selections.chords = mapped;
    }
    return db;
  }

  let db = (() => {
    const parsed = safeParse(lsGet(DB_KEY), null);
    const merged = mergeDb(parsed);
    const migrated = migrateLegacy(merged);
    lsSet(DB_KEY, JSON.stringify(migrated));
    return migrated;
  })();

  function persist() {
    try {
      return lsSet(DB_KEY, JSON.stringify(db));
    } catch (err) {
      console.warn('No se pudo guardar en localStorage:', err);
      return false;
    }
  }

  function getDb() { return clone(db); }
  function getPref(key) { return db.prefs[key]; }
  function setPref(key, value) { db.prefs[key] = value; persist(); return value; }
  function getSelection(key) { return clone(db.selections[key] || []); }
  function setSelection(key, value) { db.selections[key] = clone(value); persist(); }

  function getLevelStats(levelId) {
    const st = db.stats[String(levelId)] || {};
    return { correct:Number(st.correct||0), total:Number(st.total||0), streakMax:Number(st.streakMax||0) };
  }

  function recordAnswer(levelId, correct, streakMax, meta) {
    const key = String(levelId);
    const st = getLevelStats(levelId);
    st.total += 1;
    if (correct) st.correct += 1;
    st.streakMax = Math.max(st.streakMax, Number(streakMax||0));
    db.stats[key] = st;

    if (meta && meta.targetId) {
      const conceptKey = `${levelId}:${meta.targetId}`;
      const cs = db.conceptStats[conceptKey] || {
        level:Number(levelId), targetId:meta.targetId, targetName:meta.targetName || meta.targetId,
        targetType:meta.targetType || 'concept', correct:0, total:0, lastSeen:null
      };
      cs.total += 1;
      if (correct) cs.correct += 1;
      cs.targetName = meta.targetName || cs.targetName;
      cs.targetType = meta.targetType || cs.targetType;
      cs.lastSeen = new Date().toISOString();
      db.conceptStats[conceptKey] = cs;
    }
    persist();
    return st;
  }

  function getConceptStats(levelId) {
    return Object.values(db.conceptStats)
      .filter(x => levelId == null || Number(x.level) === Number(levelId))
      .map(clone);
  }

  function addHistory(entry) {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      date: new Date().toISOString(),
      ...clone(entry)
    };
    db.history.unshift(item);
    db.history = db.history.slice(0, 250);
    persist();
    return clone(item);
  }

  function getHistory() { return clone(db.history); }
  function clearHistory() { db.history = []; persist(); }

  function totalsFromStats(stats) {
    return Object.values(stats || {}).reduce((a, st) => {
      a.correct += Number(st.correct||0);
      a.total += Number(st.total||0);
      a.streakMax = Math.max(a.streakMax, Number(st.streakMax||0));
      return a;
    }, {correct:0,total:0,streakMax:0});
  }

  function resetProgress() {
    const snapshot = clone(db.stats);
    const conceptSnapshot = clone(db.conceptStats);
    addHistory({ type:'reset', kind:'progress', statsByLevel:snapshot, conceptStats:conceptSnapshot, totals:totalsFromStats(snapshot) });
    db.stats = {};
    db.conceptStats = {};
    persist();
  }

  function resetConfiguration() {
    const fresh = DEFAULT_DB();
    db.prefs = fresh.prefs;
    db.selections = fresh.selections;
    persist();
  }

  function eraseAll() {
    db = DEFAULT_DB();
    persist();
    ['earTraining_stats','earTraining_history_v1','earTraining_chords','earTraining_intervals','earTraining_level3targets','earTraining_level3refs','earTraining_level3type'].forEach(k => {
      lsRemove(k)
    });
  }

  window.ETStorage = {
    DB_KEY, getDb, getPref, setPref, getSelection, setSelection,
    getLevelStats, recordAnswer, getConceptStats, addHistory, getHistory, clearHistory,
    resetProgress, resetConfiguration, eraseAll, totalsFromStats
  };
})();
