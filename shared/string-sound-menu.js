(() => {
  function initStringSoundMenu() {
    const select = document.querySelector('[data-string-sound-select]') || document.getElementById('soundType') || document.getElementById('articulation');
    const controls = document.querySelector('.sound-controls');
    if (!select || !controls || document.getElementById('stringSoundMenu')) return;

    const field = select.closest('.field');
    if (field) field.hidden = true;
    const isStrings = select.id === 'articulation';
    const menu = document.createElement('div');
    menu.className = 'string-sound-menu';
    menu.id = 'stringSoundMenu';
    menu.innerHTML = '<button type="button" class="string-sound-trigger" aria-haspopup="listbox" aria-expanded="false" title="Cambiar sonido"><span class="string-sound-value"></span><span class="string-sound-chevron" aria-hidden="true">▾</span></button><div class="string-sound-options" role="listbox" hidden></div>';
    controls.insertBefore(menu, controls.querySelector('.sound-source-indicator') || null);

    const trigger = menu.querySelector('.string-sound-trigger');
    const value = menu.querySelector('.string-sound-value');
    const list = menu.querySelector('.string-sound-options');
    const source = controls.querySelector('.sound-source-indicator');
    const setState = () => {
      const state = source?.classList.contains('loading') ? 'loading'
        : source?.classList.contains('osc') ? 'error' : 'ready';
      menu.dataset.state = state;
    };
    if (source) {
      source.hidden = true;
      source.setAttribute('aria-hidden', 'true');
      source.style.setProperty('display', 'none', 'important');
      new MutationObserver(setState).observe(source, { attributes: true, attributeFilter: ['class'] });
    }

    const selectedLabel = () => {
      const option = select.options[select.selectedIndex];
      if (!option) return 'Cargando…';
      if (!isStrings) return option.textContent.trim();
      const instrument = document.getElementById('instrument');
      const instrumentLabel = instrument?.options[instrument.selectedIndex]?.textContent?.trim() || 'Cuerdas';
      return instrumentLabel + ' · ' + option.textContent.trim();
    };
    const close = () => {
      list.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    };
    const render = () => {
      value.textContent = selectedLabel();
      list.replaceChildren(...[...select.options].map(option => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'string-sound-option' + (option.selected ? ' selected' : '');
        item.role = 'option';
        item.setAttribute('aria-selected', String(option.selected));
        item.textContent = option.textContent.trim();
        item.addEventListener('click', () => {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          render();
          close();
        });
        return item;
      }));
    };

    trigger.addEventListener('click', event => {
      event.stopPropagation();
      const opening = list.hidden;
      document.querySelectorAll('.string-sound-menu.open').forEach(other => {
        if (other !== menu) other.querySelector('.string-sound-trigger')?.click();
      });
      list.hidden = !opening;
      trigger.setAttribute('aria-expanded', String(opening));
      menu.classList.toggle('open', opening);
    });
    document.addEventListener('click', event => { if (!menu.contains(event.target)) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    select.addEventListener('change', render);
    document.getElementById('instrument')?.addEventListener('change', () => window.setTimeout(render, 0));
    new MutationObserver(render).observe(select, { childList: true, subtree: true });
    render();
    setState();
  }

  if (document.readyState === 'complete') initStringSoundMenu();
  else window.addEventListener('load', initStringSoundMenu, { once: true });
})();
