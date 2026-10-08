document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('siteHeader');
const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 16);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const updateHeaderHeight = () => {
  document.documentElement.style.setProperty('--navigation-height', `${header.getBoundingClientRect().height}px`);
};
updateHeaderHeight();
if ('ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(header);

// Keep the gentle section settling used on the institutional site limited to desktop.
const sectionMotion = window.matchMedia('(min-width:901px) and (prefers-reduced-motion:no-preference)');
let settleTimer;
let frameId = 0;
let animating = false;
let lastY = window.scrollY;
let direction = 0;
let suppressSettleUntil = 0;

const cancelSettle = () => {
  clearTimeout(settleTimer);
  cancelAnimationFrame(frameId);
  animating = false;
  lastY = window.scrollY;
};

const syncSectionMotion = () => {
  cancelSettle();
  document.documentElement.classList.toggle('fast-section-scroll', sectionMotion.matches);
};

const settleSection = () => {
  if (!sectionMotion.matches || performance.now() < suppressSettleUntil) return;
  const offset = header.getBoundingClientRect().height + 18;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const targets = [...document.querySelectorAll('.home-slide')]
    .map(section => Math.max(0, Math.min(maxY, section.getBoundingClientRect().top + window.scrollY - offset)));
  if (!targets.length) return;
  const nearest = targets.reduce((best, y) => Math.abs(y - window.scrollY) < Math.abs(best - window.scrollY) ? y : best, targets[0]);
  const distance = nearest - window.scrollY;
  if (Math.abs(distance) < 2 || Math.abs(distance) > window.innerHeight * .38 || distance * direction < 0) return;

  const startY = window.scrollY;
  const startTime = performance.now();
  animating = true;
  const tick = now => {
    const progress = Math.min(1, (now - startTime) / 180);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo({ top: startY + distance * eased, behavior: 'instant' });
    if (progress < 1) frameId = requestAnimationFrame(tick);
    else {
      animating = false;
      lastY = window.scrollY;
    }
  };
  frameId = requestAnimationFrame(tick);
};

window.addEventListener('scroll', () => {
  if (animating) return;
  const change = window.scrollY - lastY;
  if (Math.abs(change) > 1) direction = Math.sign(change);
  lastY = window.scrollY;
  clearTimeout(settleTimer);
  if (sectionMotion.matches && performance.now() >= suppressSettleUntil) settleTimer = setTimeout(settleSection, 80);
}, { passive: true });

for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
  window.addEventListener(event, cancelSettle, { passive: true });
}
for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', () => {
    cancelSettle();
    suppressSettleUntil = performance.now() + 1200;
  });
}
window.addEventListener('hashchange', () => {
  cancelSettle();
  suppressSettleUntil = performance.now() + 1200;
});
sectionMotion.addEventListener('change', syncSectionMotion);
syncSectionMotion();
