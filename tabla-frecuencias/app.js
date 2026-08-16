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
  const NOTES_KEY = 'crescendo-tabla-frecuencias-notas';

  // ---------- estado ----------
  let activeCat = 'todos';
  let searchTerm = '';
  let simpleMode = false;
  let compareMode = false;
  let selectedIds = [];       // modo normal: máx 1 ; modo comparar: máx 2
  let activeTab = 'eq';       // 'eq' | 'comp'

  // ---------- elementos ----------
  const rulerEl = $('freqRuler');
  const bandOverlayEl = $('bandOverlay');
  const rowsEl = $('rows');
  const detailOverlay = $('detailOverlay');
  const detailPanel = $('detailPanel');
  const detailContent = $('detailContent');
  const bandsToggle = $('bandsToggle');
  const categoryChips = $('categoryChips');
  const searchInput = $('searchInput');
  const simpleToggle = $('simpleToggle');
  const compareToggle = $('compareToggle');
  const glossaryBtn = $('glossaryBtn');
  const techniquesBtn = $('techniquesBtn');
  const glossaryOverlay = $('glossaryOverlay');
  const glossaryPanel = $('glossaryPanel');
  const glossaryClose = $('glossaryClose');
  const techOverlay = $('techOverlay');
  const techPanel = $('techPanel');
  const techClose = $('techClose');

  const TICKS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

  function renderRuler() {
    rulerEl.innerHTML = '';
    TICKS.forEach((f) => {
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.left = pct(f) + '%';
      const span = document.createElement('span');
      span.textContent = fmtHz(f);
      tick.appendChild(span);
      rulerEl.appendChild(tick);
    });
  }

  const BAND_COLORS = {
    sub: 'rgba(122,59,59,0.16)', bajo: 'rgba(212,168,79,0.09)', mb: 'rgba(212,168,79,0.05)',
    ma: 'rgba(71,99,87,0.10)', pres: 'rgba(71,99,87,0.16)', brillo: 'rgba(212,168,79,0.13)',
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

  function matchesFilters(inst) {
    if (activeCat !== 'todos' && inst.cat !== activeCat) return false;
    if (searchTerm && !inst.name.toLowerCase().includes(searchTerm)) return false;
    return true;
  }

  const COMPARE_COLORS = ['#d4a84f', '#7fb3c9'];

  function renderRows() {
    rowsEl.innerHTML = '';
    const list = INSTRUMENTS.filter(matchesFilters);
    if (!list.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:30px 10px;text-align:center;color:var(--text-dim);font-size:0.85rem;';
      empty.textContent = 'No se encontró ningún instrumento con ese filtro.';
      rowsEl.appendChild(empty);
      return;
    }
    list.forEach((inst) => {
      const row = document.createElement('div');
      row.className = 'row';

      const label = document.createElement('div');
      label.className = 'row-label';
      const cIdx = selectedIds.indexOf(inst.id);
      const dotColor = compareMode && cIdx > -1 ? COMPARE_COLORS[cIdx] : '';
      label.innerHTML = `<span class="dot"${dotColor ? ` style="background:${dotColor}"` : ''}></span>` + inst.name;
      row.appendChild(label);

      const track = document.createElement('div');
      track.className = 'row-track';

      if (inst.harm && !simpleMode) {
        const hLow = pct(inst.range[0]), hHigh = pct(inst.harm[1]);
        const harmBar = document.createElement('div');
        harmBar.className = 'bar-harm';
        harmBar.style.left = hLow + '%';
        harmBar.style.width = Math.max(0.5, hHigh - hLow) + '%';
        track.appendChild(harmBar);
      }

      const fLow = pct(inst.range[0]), fHigh = pct(inst.range[1]);
      const fundBar = document.createElement('div');
      const isSelected = selectedIds.includes(inst.id);
      fundBar.className = 'bar-fund' + (isSelected ? ' selected' : '');
      if (compareMode && isSelected) {
        const idx = selectedIds.indexOf(inst.id);
        fundBar.style.background = COMPARE_COLORS[idx];
        fundBar.style.boxShadow = `0 0 0 2px ${COMPARE_COLORS[idx]}, 0 4px 14px rgba(0,0,0,0.4)`;
      }
      fundBar.style.left = fLow + '%';
      fundBar.style.width = Math.max(0.6, fHigh - fLow) + '%';
      fundBar.tabIndex = 0;
      fundBar.setAttribute('role', 'button');
      fundBar.setAttribute('aria-label', inst.name + ', ' + fmtHz(inst.range[0]) + ' a ' + fmtHz(inst.range[1]));
      fundBar.addEventListener('click', () => handleBarClick(inst.id));
      fundBar.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBarClick(inst.id); } });
      track.appendChild(fundBar);

      row.appendChild(track);
      rowsEl.appendChild(row);
    });
  }

  function renderAll() { renderRuler(); renderBands(); renderRows(); }

  // ---------- notas persistentes (localStorage) ----------
  function loadNotes() { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); } catch (e) { return {}; } }
  function saveNote(id, text) {
    const notes = loadNotes();
    if (text.trim()) notes[id] = text; else delete notes[id];
    try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch (e) {}
  }

  // ---------- click en barra ----------
  function handleBarClick(id) {
    if (compareMode) {
      const idx = selectedIds.indexOf(id);
      if (idx > -1) selectedIds.splice(idx, 1);
      else {
        if (selectedIds.length >= 2) selectedIds.shift();
        selectedIds.push(id);
      }
      renderRows();
      if (selectedIds.length) openCompare(); else closePanel();
      return;
    }
    selectedIds = [id];
    activeTab = 'eq';
    renderRows();
    openDetail(id);
  }

  function tabButtons(hasComp) {
    return `
      <div style="display:flex;gap:8px;margin-bottom:18px;">
        <button class="chip${activeTab === 'eq' ? ' active' : ''}" data-tab="eq" style="font-size:0.72rem;padding:6px 14px;">Ecualización</button>
        ${hasComp ? `<button class="chip${activeTab === 'comp' ? ' active' : ''}" data-tab="comp" style="font-size:0.72rem;padding:6px 14px;">Compresión</button>` : ''}
      </div>`;
  }

  function eqHtml(inst) {
    const cutsHtml = inst.cuts.length
      ? '<ul class="detail-list cut">' + inst.cuts.map(c => `<li><span class="freq-tag">${c.f}</span>${c.r}</li>`).join('') + '</ul>'
      : '<p class="detail-tips">No suele necesitar cortes específicos — normalmente se trabaja con volumen y filtrado suave.</p>';
    const boostsHtml = inst.boosts.length
      ? '<ul class="detail-list boost">' + inst.boosts.map(b => `<li><span class="freq-tag">${b.f}</span>${b.r}</li>`).join('') + '</ul>'
      : '<p class="detail-tips">Aquí normalmente se resta más de lo que se añade (ver nota abajo).</p>';
    let deesserHtml = '';
    if (inst.deesser) {
      deesserHtml = `<div class="detail-section"><h4>De-esser — rango de sibilancia por tipo de voz</h4>
        <table class="sib-table"><tbody>
        ${SIBILANCE_TABLE.map(s => `<tr><td>${s.tipo}</td><td>${s.rango}</td></tr>`).join('')}
        </tbody></table></div>`;
    }
    return `
      <div class="detail-section"><h4>▾ Qué cortar</h4>${cutsHtml}</div>
      <div class="detail-section"><h4>▴ Qué realzar</h4>${boostsHtml}</div>
      ${inst.tip ? `<div class="detail-section"><h4>Nota</h4><div class="detail-tips">${inst.tip}</div></div>` : ''}
      ${deesserHtml}
    `;
  }

  function compHtml(inst) {
    if (!inst.comp) return '<p class="detail-tips">Sin guía de compresión específica para este instrumento.</p>';
    const c = inst.comp;
    return `
      <div class="detail-section">
        <ul class="detail-list comp">
          <li><span class="freq-tag">Tipo</span>${c.tipo}</li>
          <li><span class="freq-tag">Ratio</span>${c.ratio}</li>
          <li><span class="freq-tag">Attack</span>${c.attack}</li>
          <li><span class="freq-tag">Release</span>${c.release}</li>
        </ul>
      </div>
      <div class="detail-section"><h4>Nota</h4><div class="detail-tips">${c.nota}</div></div>
      <div class="detail-tips" style="margin-top:4px;font-size:0.76rem;opacity:0.75;">Valores orientativos de punto de partida — ajusta siempre según el músico, el micrófono y el contexto de la mezcla.</div>
    `;
  }

  function notesHtml(id) {
    const notes = loadNotes();
    const val = notes[id] || '';
    return `
      <div class="detail-section">
        <h4>Mis notas</h4>
        <textarea class="notes-area" id="notesArea" placeholder="Anota tus propios ajustes para esta pista o sesión...">${val.replace(/</g, '&lt;')}</textarea>
      </div>`;
  }

  function showPanel(withBackdrop) {
    detailPanel.classList.add('open');
    if (withBackdrop) detailOverlay.classList.add('open');
    else detailOverlay.classList.remove('open');
  }

  function openDetail(id) {
    const inst = INSTRUMENTS.find((i) => i.id === id);
    if (!inst) return;
    detailContent.innerHTML = `
      <p class="detail-eyebrow">${inst.cat}</p>
      <h3 class="detail-title">${inst.name}</h3>
      <div class="detail-range">${fmtHz(inst.range[0])} – ${fmtHz(inst.range[1])} · fundamental</div>
      ${tabButtons(!!inst.comp)}
      <div id="tabContent">${activeTab === 'comp' && inst.comp ? compHtml(inst) : eqHtml(inst)}</div>
      ${notesHtml(inst.id)}
    `;
    wireTabButtons(inst);
    wireNotes(inst.id);
    showPanel(true);
  }

  function openCompare() {
    const insts = selectedIds.map((id) => INSTRUMENTS.find((i) => i.id === id)).filter(Boolean);
    if (!insts.length) { closePanel(); return; }
    if (insts.length === 1) {
      const a = insts[0];
      detailContent.innerHTML = `
        <p class="detail-eyebrow">Comparación</p>
        <h3 class="detail-title" style="font-size:1.35rem;">${a.name}</h3>
        <div class="detail-range" style="color:${COMPARE_COLORS[0]};">${fmtHz(a.range[0])} – ${fmtHz(a.range[1])}</div>
        <div class="detail-tips">Ahora toca <b>otro instrumento</b> en el gráfico para comparar sus rangos de frecuencia.</div>
      `;
      showPanel(false);
      return;
    }
    const [a, b] = insts;
    const overlapLow = Math.max(a.range[0], b.range[0]);
    const overlapHigh = Math.min(a.range[1], b.range[1]);
    const overlaps = overlapLow < overlapHigh;
    detailContent.innerHTML = `
      <p class="detail-eyebrow">Comparación</p>
      <h3 class="detail-title" style="font-size:1.35rem;">${a.name} <span style="color:var(--text-dim);font-family:Inter,sans-serif;font-size:0.9rem;">vs</span> ${b.name}</h3>
      <div class="detail-section">
        <div style="display:flex;gap:16px;margin-bottom:14px;">
          <div style="flex:1;"><span class="freq-tag" style="color:${COMPARE_COLORS[0]};">${a.name}</span><br><span style="font-size:0.82rem;color:var(--text-dim);">${fmtHz(a.range[0])} – ${fmtHz(a.range[1])}</span></div>
          <div style="flex:1;"><span class="freq-tag" style="color:${COMPARE_COLORS[1]};">${b.name}</span><br><span style="font-size:0.82rem;color:var(--text-dim);">${fmtHz(b.range[0])} – ${fmtHz(b.range[1])}</span></div>
        </div>
        ${overlaps
          ? `<div class="detail-tips">Sus rangos fundamentales chocan entre <b style="color:var(--gold);">${fmtHz(overlapLow)} – ${fmtHz(overlapHigh)}</b>. Considera recortar uno de los dos en esa zona para que el otro tenga espacio — o, como sugiere el manual, mueve el realce de uno a una frecuencia ligeramente distinta.</div>`
          : `<div class="detail-tips">Sus rangos fundamentales <b>no se superponen</b> — buena señal, cada uno puede vivir en su propia franja de frecuencias sin competir directamente.</div>`}
      </div>
      <div class="detail-section"><h4>${a.name}: qué realzar</h4>${a.boosts.length ? '<ul class="detail-list boost">' + a.boosts.slice(0,3).map(x=>`<li><span class="freq-tag">${x.f}</span>${x.r}</li>`).join('') + '</ul>' : '<p class="detail-tips">Sin realces específicos.</p>'}</div>
      <div class="detail-section"><h4>${b.name}: qué realzar</h4>${b.boosts.length ? '<ul class="detail-list boost">' + b.boosts.slice(0,3).map(x=>`<li><span class="freq-tag">${x.f}</span>${x.r}</li>`).join('') + '</ul>' : '<p class="detail-tips">Sin realces específicos.</p>'}</div>
      <button class="link-btn" id="compareClearBtn" style="margin-top:6px;">Elegir otros dos instrumentos</button>
    `;
    showPanel(false);
    const clearBtn = $('compareClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', () => { selectedIds = []; renderRows(); closePanel(); });
  }

  function wireTabButtons(inst) {
    detailContent.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        detailContent.querySelector('#tabContent').innerHTML = activeTab === 'comp' ? compHtml(inst) : eqHtml(inst);
        detailContent.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b === btn));
      });
    });
  }

  function wireNotes(id) {
    const area = $('notesArea');
    if (!area) return;
    let t;
    area.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => saveNote(id, area.value), 400);
    });
  }

  function closeDetail() {
    detailOverlay.classList.remove('open');
    detailPanel.classList.remove('open');
    selectedIds = [];
    renderRows();
  }
  const closePanel = closeDetail;

  detailOverlay.addEventListener('click', closeDetail);
  $('detailClose').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDetail(); closeGlossary(); closeTechniques(); } });

  categoryChips.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    [...categoryChips.querySelectorAll('.chip')].forEach((c) => c.classList.toggle('active', c === btn));
    renderRows();
  });

  searchInput.addEventListener('input', () => { searchTerm = searchInput.value.trim().toLowerCase(); renderRows(); });

  simpleToggle.addEventListener('click', () => {
    simpleMode = !simpleMode;
    simpleToggle.classList.toggle('active', simpleMode);
    simpleToggle.textContent = simpleMode ? 'Modo: Oyente' : 'Modo: Mezclador';
    renderRows();
  });

  compareToggle.addEventListener('click', () => {
    compareMode = !compareMode;
    compareToggle.classList.toggle('active', compareMode);
    selectedIds = [];
    closeDetail();
  });

  bandsToggle.addEventListener('change', renderBands);
  window.addEventListener('resize', renderAll);

  // ---------- glosario ----------
  function renderGlossary() {
    glossaryPanel.querySelector('#glossaryContent').innerHTML = GLOSSARY.map(g =>
      `<div class="glossary-item"><b>${g.t}</b><p>${g.d}</p></div>`).join('');
  }
  function openGlossary() { glossaryOverlay.classList.add('open'); glossaryPanel.classList.add('open'); }
  function closeGlossary() { glossaryOverlay.classList.remove('open'); glossaryPanel.classList.remove('open'); }
  glossaryBtn.addEventListener('click', openGlossary);
  glossaryClose.addEventListener('click', closeGlossary);
  glossaryOverlay.addEventListener('click', closeGlossary);

  // ---------- técnicas serie vs paralela ----------
  function renderTechniques() {
    const t = TECHNIQUES;
    techPanel.querySelector('#techContent').innerHTML = ['serie', 'paralela'].map((k) => {
      const d = t[k];
      return `<div class="detail-section"><h3 style="font-family:Georgia,serif;font-size:1.2rem;margin:0 0 8px;">${d.title}</h3>
        <p style="font-size:0.86rem;color:var(--text-dim);line-height:1.7;">${d.body}</p>
        <ul class="detail-list boost">${d.tips.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>`;
    }).join('<div style="height:1px;background:var(--line);margin:20px 0;"></div>');
  }
  function openTechniques() { techOverlay.classList.add('open'); techPanel.classList.add('open'); }
  function closeTechniques() { techOverlay.classList.remove('open'); techPanel.classList.remove('open'); }
  techniquesBtn.addEventListener('click', openTechniques);
  techClose.addEventListener('click', closeTechniques);
  techOverlay.addEventListener('click', closeTechniques);

  // ---------- reglas de oro ----------
  function renderGoldenRules() {
    const el = $('goldenRulesList');
    if (!el) return;
    el.innerHTML = GOLDEN_RULES.map((r, i) => `<li><span class="rule-num">${i + 1}</span>${r}</li>`).join('');
  }

  renderAll();
  renderGlossary();
  renderTechniques();
  renderGoldenRules();
})();
