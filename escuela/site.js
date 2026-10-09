document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroChangingText = document.getElementById('heroChangingText');
const heroMessages = [
  'Escucha una idea y hazla sonar.',
  'Comprende lo que estás tocando.',
  'Practica a tu ritmo y crea música.'
];
let heroMessageIndex = 0;
if (heroChangingText && !reducedMotion.matches) {
  window.setInterval(() => {
    if (document.hidden) return;
    heroChangingText.classList.add('is-changing');
    window.setTimeout(() => {
      heroMessageIndex = (heroMessageIndex + 1) % heroMessages.length;
      heroChangingText.textContent = heroMessages[heroMessageIndex];
      heroChangingText.classList.remove('is-changing');
    }, 350);
  }, 4400);
}

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const reveals = document.querySelectorAll('.reveal');
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: .1, rootMargin: '0px 0px -28px 0px' });
  reveals.forEach(element => revealObserver.observe(element));
}

const header = document.getElementById('siteHeader');
const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 16);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const updateHeaderHeight = () => {
  document.documentElement.style.setProperty('--navigation-height', `${header.getBoundingClientRect().height}px`);
};
updateHeaderHeight();
if ('ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(header);

const navigationLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const contactLink = document.querySelector('.header-contact[href^="#"]');
const navigationTargets = navigationLinks
  .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(item => item.section);
if (contactLink) {
  const contactSection = document.querySelector(contactLink.getAttribute('href'));
  if (contactSection) navigationTargets.push({ link: contactLink, section: contactSection });
}

const setActiveNavigation = activeLink => {
  for (const { link } of navigationTargets) {
    const active = link === activeLink;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
};

const updateActiveNavigation = () => {
  const marker = window.innerHeight * .38;
  let current = null;
  for (const item of navigationTargets) {
    if (item.section.getBoundingClientRect().top <= marker) current = item;
  }
  setActiveNavigation(current?.link);
};
window.addEventListener('scroll', updateActiveNavigation, { passive: true });
window.addEventListener('hashchange', updateActiveNavigation);
updateActiveNavigation();

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
  const offset = header.getBoundingClientRect().height;
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
