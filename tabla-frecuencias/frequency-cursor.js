(function (root) {
  'use strict';
  function frequencyAtPosition(x, left, width) {
    if (!Number.isFinite(width) || width <= 0) return null;
    const position = Math.max(0, Math.min(1, (x - left) / width));
    return 20 * Math.pow(1000, position);
  }
  root.FrequencyCursor = { frequencyAtPosition };
  if (typeof document === 'undefined') return;
  const tooltip = document.createElement('div');
  tooltip.className = 'frequency-cursor-label';
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  const guides = [];
  function hide() {
    tooltip.hidden = true;
    guides.forEach(line => { line.hidden = true; });
  }
  document.querySelectorAll('.chart-inner').forEach(chart => {
    const ruler = chart.querySelector('.freq-ruler');
    if (!ruler) return;
    const guide = document.createElement('div');
    guide.className = 'frequency-cursor-line';
    guide.hidden = true;
    guide.setAttribute('aria-hidden', 'true');
    chart.appendChild(guide);
    guides.push(guide);
    chart.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const bounds = ruler.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || !bounds.width) {
        hide(); return;
      }
      const frequency = frequencyAtPosition(event.clientX, bounds.left, bounds.width);
      tooltip.textContent = frequency < 1000 ? `≈ ${Math.round(frequency)} Hz` : `≈ ${(frequency / 1000).toLocaleString('es', {maximumFractionDigits: 2})} kHz`;
      tooltip.hidden = false;
      guide.hidden = false;
      guide.style.left = `${event.clientX - chart.getBoundingClientRect().left}px`;
      const label = tooltip.getBoundingClientRect();
      tooltip.style.left = `${Math.max(8, Math.min(event.clientX + 14, innerWidth - label.width - 8))}px`;
      tooltip.style.top = `${Math.max(8, Math.min(event.clientY - label.height - 12, innerHeight - label.height - 8))}px`;
    });
    chart.addEventListener('pointerleave', hide);
    chart.addEventListener('pointerdown', hide);
  });
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
  window.addEventListener('crescendo:view-change', hide);
  window.addEventListener('crescendo:catalog-filter', hide);
})(typeof module === 'object' ? module.exports : window);
