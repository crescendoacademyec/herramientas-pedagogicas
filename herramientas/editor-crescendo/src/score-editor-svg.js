(function () {
  const NS = "http://www.w3.org/2000/svg";

  function el(name, attrs = {}, children = []) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, String(value));
    });
    children.forEach((child) => node.appendChild(child));
    return node;
  }

  function htmlEl(name, attrs = {}, children = []) {
    const node = document.createElement(name);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === "class") node.className = String(value);
      else if (key === "text") node.textContent = String(value);
      else node.setAttribute(key, String(value));
    });
    children.forEach((child) => node.appendChild(child));
    return node;
  }

  function textNode(x, y, text, attrs = {}) {
    const node = el("text", { x, y, ...attrs });
    node.textContent = text;
    return node;
  }

  window.JMLScoreSvg = Object.freeze({
    NS,
    el,
    htmlEl,
    textNode
  });
})();
