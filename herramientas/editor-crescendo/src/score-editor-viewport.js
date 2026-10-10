(function () {
  function clampZoom(value, fallback = 1) {
    return Math.max(0.45, Math.min(2.4, Number(value) || fallback));
  }

  function zoomLabel(value) {
    return `${Math.round((Number(value) || 1) * 100)}%`;
  }

  function shellHeight(svgHeight, zoom) {
    return Math.max(520, svgHeight * (Number(zoom) || 1));
  }

  function visibleShellHeight(options = {}) {
    const totalHeight = Number(options.totalHeight) || 0;
    const windowHeight = Number(options.windowHeight) || 900;
    const workbenchRect = options.workbenchRect;
    const shellRect = options.shellRect;
    const midiHeight = Number(options.midiHeight) || 0;
    const bottomLimit = workbenchRect?.bottom || windowHeight;
    const shellTop = shellRect?.top || workbenchRect?.top || 0;
    const available = bottomLimit - shellTop - midiHeight - 2;
    const workbenchHeight = workbenchRect?.height || windowHeight || 680;
    const minimumVisible = Math.max(110, Math.min(240, workbenchHeight * 0.34));
    return Math.max(minimumVisible, Math.min(totalHeight, Math.floor(available)));
  }

  function minWidth(options = {}) {
    const zoom = clampZoom(options.zoom);
    const visibleWidth = Number(options.visibleWidth) || 0;
    const configuredWidth = Number(options.configuredWidth) || 0;
    return Math.max(configuredWidth, visibleWidth / zoom);
  }

  window.JMLScoreViewport = Object.freeze({
    clampZoom,
    minWidth,
    shellHeight,
    visibleShellHeight,
    zoomLabel
  });
})();
