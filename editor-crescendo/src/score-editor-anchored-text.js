(function (global) {
  const KINDS = Object.freeze({
    TEXT: "text",
    CHORD: "chord",
    DYNAMIC: "dynamic"
  });

  const ANCHORED_KINDS = Object.freeze([KINDS.CHORD, KINDS.DYNAMIC]);

  const CONFIG = Object.freeze({
    [KINDS.TEXT]: {
      placeholder: "",
      sample: "Texto",
      minWidth: 180,
      itemClass: ""
    },
    [KINDS.CHORD]: {
      placeholder: "C7",
      sample: "C7",
      minWidth: 76,
      itemClass: " canvas-chord-item"
    },
    [KINDS.DYNAMIC]: {
      placeholder: "mf",
      sample: "mf",
      minWidth: 76,
      itemClass: " canvas-dynamic-item"
    }
  });

  function kindOf(item = null, createData = null) {
    return item?.kind || createData?.kind || KINDS.TEXT;
  }

  function configFor(kind) {
    return CONFIG[kind] || CONFIG[KINDS.TEXT];
  }

  function isKind(value, kind) {
    const resolved = typeof value === "string" ? value : value?.kind;
    return resolved === kind;
  }

  function isChord(value) {
    return isKind(value, KINDS.CHORD);
  }

  function isDynamic(value) {
    return isKind(value, KINDS.DYNAMIC);
  }

  function isAnchored(value) {
    const resolved = typeof value === "string" ? value : value?.kind;
    return ANCHORED_KINDS.includes(resolved);
  }

  function placeholder(kind) {
    return configFor(kind).placeholder;
  }

  function sampleText(kind) {
    return configFor(kind).sample;
  }

  function minWidth(kind) {
    return configFor(kind).minWidth;
  }

  function itemClass(kind) {
    return configFor(kind).itemClass;
  }

  function shouldNavigate(kind, key) {
    return isAnchored(kind) && (key === "ArrowLeft" || key === "ArrowRight" || key === " ");
  }

  function directionForKey(key) {
    return key === "ArrowLeft" ? -1 : 1;
  }

  function matchesAnchor(item, kind, measureIndex, tick, epsilon = 0.0001) {
    return item?.kind === kind &&
      Number(item.measureIndex) === measureIndex &&
      Math.abs(Number(item.tick) - tick) < epsilon;
  }

  global.JMLScoreAnchoredText = Object.freeze({
    KINDS,
    kindOf,
    isChord,
    isDynamic,
    isAnchored,
    placeholder,
    sampleText,
    minWidth,
    itemClass,
    shouldNavigate,
    directionForKey,
    matchesAnchor
  });
})(window);
