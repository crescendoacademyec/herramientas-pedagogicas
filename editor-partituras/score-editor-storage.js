(function () {
  function getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  window.JMLScoreStorage = Object.freeze({
    getItem,
    setItem
  });
})();
