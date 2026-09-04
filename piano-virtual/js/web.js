// ---------- CARGA DE PÁGINA WEB ----------
function normalizeWebUrl(raw) {
  let url = (raw || '').trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { return new URL(url).href; } catch(e) { return null; }
}

function toEmbeddableUrl(url) {
  let u; try { u = new URL(url); } catch(e) { return url; }
  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
  let videoId = null;
  if (host === 'youtube.com' || host === 'music.youtube.com') {
    if (u.pathname === '/watch') videoId = u.searchParams.get('v');
    else if (u.pathname.startsWith('/shorts/')) videoId = u.pathname.split('/')[2];
    else if (u.pathname.startsWith('/embed/')) return url;
  } else if (host === 'youtu.be') {
    videoId = u.pathname.slice(1);
  }
  if (videoId) {
    const start = u.searchParams.get('t') || u.searchParams.get('start');
    let embedUrl = `https://www.youtube.com/embed/${videoId}`;
    if (start) embedUrl += `?start=${parseInt(start, 10) || 0}`;
    return embedUrl;
  }
  return url;
}

function toWatchUrlIfEmbed(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' && u.pathname.startsWith('/embed/')) {
      const id = u.pathname.split('/')[2];
      if (id) return `https://www.youtube.com/watch?v=${id}`;
    }
  } catch(e) {}
  return url;
}

function loadWebPage() {
  const url = normalizeWebUrl(webUrlInput.value);
  if (!url) { alert('Introduce un enlace válido (ej. https://ejemplo.com).'); return; }
  resetScoreView();
  pdfUpload.value = '';
  if (currentPdfUrl) { URL.revokeObjectURL(currentPdfUrl); currentPdfUrl = null; }
  const finalUrl = toEmbeddableUrl(url);
  webViewer.src = finalUrl;
  webUrlInput.value = finalUrl;
  webViewer.classList.add('visible');
  webClearBtn.classList.add('visible');
  const isYouTubeEmbed = /^https:\/\/www\.youtube\.com\/embed\//.test(finalUrl);
  if (isYouTubeEmbed && location.protocol === 'file:') {
    webLoadNote.textContent = '⚠ YouTube suele bloquear la reproducción embebida en archivos locales (file://). Si no se ve, usa el botón ↗ para abrirlo en otra pestaña.';
    webLoadNote.style.display = 'block';
  } else {
    webLoadNote.textContent = '';
    webLoadNote.style.display = 'none';
  }
}

webLoadBtn.addEventListener('click', loadWebPage);
webUrlInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); loadWebPage(); }
});
webOpenNewTabBtn.addEventListener('click', function() {
  const url = normalizeWebUrl(webUrlInput.value);
  if (!url) { alert('Introduce un enlace válido.'); return; }
  window.open(toWatchUrlIfEmbed(url), '_blank', 'noopener');
});
webClearBtn.addEventListener('click', function() {
  webViewer.src = '';
  webViewer.classList.remove('visible');
  webClearBtn.classList.remove('visible');
  webLoadNote.textContent = '';
  webLoadNote.style.display = 'none';
});

// ---------- CAMBIO DE MODO (Principiante / Intermedio / Pro) ----------
function setMode(mode, preserveDisplay = true) {
  currentMode = mode; currentMidiRange = RANGES[currentMode];
  [['beginner',modeBeginnerBtn],['intermediate',modeIntermediateBtn],['pro',modeProBtn]].forEach(([m,b])=>{const on=m===mode;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});
  if(!preserveDisplay && !savedSettings.display){ currentDisplay = mode==='beginner'?'mostrar':mode==='intermediate'?'mostrar':'ocultar'; noteDisplaySelect.value=currentDisplay; qsNotes.sync(); }
  requestAnimationFrame(()=>buildKeyboard(currentMidiRange.min,currentMidiRange.max)); saveSettings();
}
modeBeginnerBtn.addEventListener('click', () => setMode('beginner'));
modeIntermediateBtn.addEventListener('click', () => setMode('intermediate'));
modeProBtn.addEventListener('click', () => setMode('pro'));

// ---------- CAMBIO DE VISUALIZACIÓN ----------
noteDisplaySelect.addEventListener('change', function() {
  currentDisplay = this.value;
  updateLabels(); saveSettings();
});

// ---------- CAMBIO DE IDIOMA DE NOTAS (independiente del modo) ----------
noteLangSelect.addEventListener('change', function() {
  currentLang = this.value;
  updateKeyLanguage();
  updateLabels();
  updateChordDisplay();
  saveSettings();
});

// ---------- TONALIDAD (para mostrar grados junto al acorde) ----------
keySelect.addEventListener('change', function() {
  currentKeyPc = this.value === '' ? null : parseInt(this.value, 10);
  drawKeySignature();
  updateChordDisplay(); saveSettings();
});
keyModeSelect.addEventListener('change', function(){ currentScaleMode=this.value; drawKeySignature(); updateChordDisplay(); saveSettings(); });

// ---------- TOGGLE DE MANOS (independientes) ----------
handLeftBtn.addEventListener('click', function() {
  showHandLeft = !showHandLeft;
  keyboardEl.classList.toggle('show-hand-left', showHandLeft);
  handLeftBtn.classList.toggle('active', showHandLeft);
  handLeftBtn.setAttribute('aria-pressed', String(showHandLeft)); saveSettings();
});
handRightBtn.addEventListener('click', function() {
  showHandRight = !showHandRight;
  keyboardEl.classList.toggle('show-hand-right', showHandRight);
  handRightBtn.classList.toggle('active', showHandRight);
  handRightBtn.setAttribute('aria-pressed', String(showHandRight)); saveSettings();
});
