(function () {
  let lastError = null;

  function getItem(key) {
    try {
      const value = localStorage.getItem(key);
      lastError = null;
      return value;
    } catch (error) {
      lastError = error;
      return null;
    }
  }

  function setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      lastError = null;
      return true;
    } catch (error) {
      lastError = error;
      return false;
    }
  }

  function removeItem(key) {
    try {
      localStorage.removeItem(key);
      lastError = null;
      return true;
    } catch (error) {
      lastError = error;
      return false;
    }
  }

  function errorMessage() {
    if (!lastError) return "";
    if (lastError.name === "QuotaExceededError") {
      return "El almacenamiento local está lleno.";
    }
    return "El navegador bloqueó el almacenamiento local.";
  }

  window.JMLScoreStorage = Object.freeze({
    errorMessage,
    getItem,
    removeItem,
    setItem
  });
})();
