(function () {
  const MIN_F = 20, MAX_F = 20000;
  const LOG_MIN = Math.log10(MIN_F), LOG_MIN_MAX = Math.log10(MAX_F) - LOG_MIN;

  function pct(f) {
    const clamped = Math.max(MIN_F, Math.min(MAX_F, f));
    return ((Math.log10(clamped) - LOG_MIN) / LOG_MIN_MAX) * 100;
  }

  function fmtHz(f) {
    return f >= 1000 ? (f % 1000 === 0 ? (f / 1000) + ' kHz' : (f / 1000).toFixed(1) + ' kHz') : f + ' Hz';
  }

  const $ = (id) => document.getElementById(id);
  const rulerEl = $('freqRuler');
  const bandOverlayEl = $('bandOverlay');
  const rowsEl = $('rows');
  const detailOverlay = $('detailOverlay');
  const detailPanel = $('detailPanel');
  const detailContent = $('detailContent');
  const bandsToggle = $('bandsToggle');
  const categoryChips = $('categoryChips');

  let activeCat = 'todos';
  let selectedId = null;

  const TICKS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

  function renderRuler() {
    rulerEl.innerHTML = '';
    TICKS.forEach((f) => {
      const p = pct(f);
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.left = p + '%';
      const span = document.createElement('span');
      span.textContent = fmtHz(f);
      tick.appendChild(span);
      rulerEl.appendChild(tick);
    });
  }

  const BAND_COLORS = {
    sub: 'rgba(122,59,59,0.16)',
    bajo: 'rgba(212,168,79,0.09)',
    mb: 'rgba(212,168,79,0.05)',
    ma: 'rgba(71,99,87,0.10)',
    pres: 'rgba(71,99,87,0.16)',
    brillo: 'rgba(212,168,79,0.13)',
  };

  function renderBands() {
    bandOverlayEl.innerHTML = '';
    if (!bandsToggle.checked) return;
    BANDS.forEach((b) => {
      const p1 = pct(b.low), p2 = pct(b.high);
      const div = document.createElement('div');
      div.className = 'band';
      div.style.left = p1 + '%';
      div.style.width = (p2 - p1) + '%';
      div.style.background = BAND_COLORS[b.id] || 'transparent';
      const label = document.createElement('span');
      label.className = 'band-label';
      label.textContent = b.label;
      label.style.left = '4px';
      div.appendChild(label);
      bandOverlayEl.appendChild(div);
    });
  }

  function renderRows() {
    rowsEl.innerHTML = '';
    const list = INSTRUMENTS.filter((i) => activeCat === 'todos' || i.cat === activeCat);
    list.forEach((inst) => {
      const row = document.createElement('div');
      row.className = 'row';

      const label = document.createElement('div');
      label.className = 'row-label';
      label.innerHTML = '<span class="dot"></span>' + inst.name;
      row.appendChild(label);

      const track = document.createElement('div');
      track.className = 'row-track';

      if (inst.harm) {
        const hLow = pct(inst.range[0]);
        const hHigh = pct(inst.harm[1]);
        const harmBar = document.createElement('div');
        harmBar.className = 'bar-harm';
        harmBar.style.left = hLow + '%';
        harmBar.style.width = Math.max(0.5, hHigh - hLow) + '%';
        track.appendChild(harmBar);
      }

      const fLow = pct(inst.range[0]);
      const fHigh = pct(inst.range[1]);
      const fundBar = document.createElement('div');
      fundBar.className = 'bar-fund' + (selectedId === inst.id ? ' selected' : '');
      fundBar.style.left = fLow + '%';
      fundBar.style.width = Math.max(0.6, fHigh - fLow) + '%';
      fundBar.tabIndex = 0;
      fundBar.setAttribute('role', 'button');
      fundBar.setAttribute('aria-label', inst.name + ', ' + fmtHz(inst.range[0]) + ' a ' + fmtHz(inst.range[1]));
      fundBar.addEventListener('click', () => openDetail(inst.id));
      fundBar.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(inst.id); } });
      track.appendChild(fundBar);

      row.appendChild(track);
      rowsEl.appendChild(row);
    });
  }

  function renderAll() {
    renderRuler();
    renderBands();
    renderRows();
  }

  function openDetail(id) {
    const inst = INSTRUMENTS.find((i) => i.id === id);
    if (!inst) return;
    selectedId = id;
    renderRows();

    const cutsHtml = inst.cuts.length
      ? '<ul class="detail-list cut">' + inst.cuts.map(c => `<li><span class="freq-tag">${c.f}</span>${c.r}</li>`).join('') + '</ul>'
      : '<p class="detail-tips">No suele necesitar cortes específicos — normalmente se trabaja con volumen y filtrado suave.</p>';

    const boostsHtml = inst.boosts.length
      ? '<ul class="detail-list boost">' + inst.boosts.map(b => `<li><span class="freq-tag">${b.f}</span>${b.r}</li>`).join('') + '</ul>'
      : '<p class="detail-tips">Aquí normalmente se resta más de lo que se añade (ver nota abajo).</p>';

    detailContent.innerHTML = `
      <p class="detail-eyebrow">${inst.cat}</p>
      <h3 class="detail-title">${inst.name}</h3>
      <div class="detail-range">${fmtHz(inst.range[0])} – ${fmtHz(inst.range[1])} · fundamental</div>
      <div class="detail-section">
        <h4>▾ Qué cortar</h4>
        ${cutsHtml}
      </div>
      <div class="detail-section">
        <h4>▴ Qué realzar</h4>
        ${boostsHtml}
      </div>
      ${inst.tip ? `<div class="detail-section"><h4>Nota</h4><div class="detail-tips">${inst.tip}</div></div>` : ''}
    `;

    detailOverlay.classList.add('open');
    detailPanel.classList.add('open');
  }

  function closeDetail() {
    detailOverlay.classList.remove('open');
    detailPanel.classList.remove('open');
    selectedId = null;
    renderRows();
  }

  detailOverlay.addEventListener('click', closeDetail);
  $('detailClose').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

  categoryChips.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    [...categoryChips.querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
    renderRows();
  });

  bandsToggle.addEventListener('change', renderBands);
  window.addEventListener('resize', renderAll);

  renderAll();
})();
