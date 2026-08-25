/* ---------------------------------------------------------------
   HERO SLIDESHOW IMAGES
   To add a photo: drop the file in this folder, then add one line
   below. Order here is the order they appear. That's the only edit
   needed — the dots and timing update automatically.
----------------------------------------------------------------- */
const HERO_IMAGES = [
  'taman-baiduri.jpg',
  // 'your-next-photo.jpg',
  // 'another-photo.jpg',
];

const SLIDE_DURATION = 6000; // milliseconds each slide stays on screen

/* --- Mobile navigation ------------------------------------------ */
const button = document.querySelector('.menu-toggle');
const navigation = document.querySelector('nav');
button.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  button.setAttribute('aria-expanded', open);
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  button.textContent = open ? '×' : '☰';
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); button.textContent = '☰';
}));

/* --- Hero slideshow --------------------------------------------- */
const slideHost = document.querySelector('.hero-slides');
const dotHost = document.querySelector('.hero-dots');

if (slideHost && HERO_IMAGES.length) {
  const slides = HERO_IMAGES.map((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' is-active' : '');
    slide.style.backgroundImage = `url("${src}")`;
    slideHost.appendChild(slide);
    return slide;
  });

  // Dots only make sense with more than one image.
  const dots = HERO_IMAGES.length > 1 ? HERO_IMAGES.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show slide ${i + 1} of ${HERO_IMAGES.length}`);
    dot.addEventListener('click', () => { show(i); restart(); });
    dotHost.appendChild(dot);
    return dot;
  }) : [];

  let current = 0;
  let timer;

  function show(next) {
    slides[current].classList.remove('is-active');
    if (dots.length) dots[current].classList.remove('is-active');
    current = (next + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    if (dots.length) dots[current].classList.add('is-active');
  }

  function restart() {
    clearInterval(timer);
    if (slides.length > 1) timer = setInterval(() => show(current + 1), SLIDE_DURATION);
  }

  // Preload the remaining images so transitions don't flash.
  HERO_IMAGES.slice(1).forEach((src) => { new Image().src = src; });

  restart();

  // Pause while the tab is hidden so slides don't race in the background.
  document.addEventListener('visibilitychange', () => {
    document.hidden ? clearInterval(timer) : restart();
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();

/* --- Scroll reveal + stat counters -------------------------------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el) {
  const target = el.hasAttribute('data-count-from')
    ? new Date().getFullYear() - Number(el.getAttribute('data-count-from'))
    : Number(el.getAttribute('data-target'));

  if (reduceMotion || !target) { el.textContent = target; return; }

  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    entry.target.querySelectorAll('.stat-number').forEach(animateCount);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.25 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
