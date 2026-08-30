/* ---------------------------------------------------------------
   Each feature below runs in its own try/catch so a failure in one
   (e.g. an unsupported API, a missing element) can never block the
   others — in particular, the language switch must always work even
   if something else on the page throws.
----------------------------------------------------------------- */

/* --- Language switch (English / Bahasa Malaysia) ------------------- */
(function () {
  const LANG_KEY = 'zhh-lang';
  const langGate = document.getElementById('lang-gate');
  const metaDescription = document.querySelector('meta[name="description"]');

  function applyLanguage(lang) {
    try {
      const dict = typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang];
      if (!dict) return;

      document.documentElement.lang = lang;
      document.title = dict['meta.title'];
      if (metaDescription) metaDescription.setAttribute('content', dict['meta.description']);

      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const value = dict[el.getAttribute('data-i18n')];
        if (value !== undefined) el.innerHTML = value;
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const value = dict[el.getAttribute('data-i18n-placeholder')];
        if (value !== undefined) el.setAttribute('placeholder', value);
      });

      document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
      });
    } catch (e) { /* translation failed — leave whatever is on screen */ }

    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage unavailable — ignore */ }
  }

  function hideLangGate() {
    if (!langGate || langGate.hidden) return;
    langGate.classList.add('is-hidden');
    setTimeout(() => { langGate.hidden = true; }, 300);
  }

  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Dismiss the gate first so a translation/storage error never leaves the user stuck.
      hideLangGate();
      applyLanguage(btn.getAttribute('data-lang'));
    });
  });

  let savedLang = null;
  try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) { /* storage unavailable — ignore */ }

  if (savedLang) {
    applyLanguage(savedLang);
  } else if (langGate) {
    langGate.hidden = false;
  }
})();

/* --- Contact form (submits to Formspree) --------------------------- */
try {
  const form = document.getElementById('contact-form');
  const status = form ? form.querySelector('.form-status') : null;

  function formText(key, fallback) {
    const lang = document.documentElement.lang || 'en';
    const dict = typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang];
    return (dict && dict[key]) || fallback;
  }

  if (form && status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        status.textContent = formText('form.error', "Something went wrong and your message wasn't sent. Please try again, or reach us on WhatsApp below.");
        status.className = 'form-status is-error';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      status.className = 'form-status';
      status.textContent = formText('form.sending', 'Sending…');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
        .then((response) => {
          if (response.ok) {
            status.textContent = formText('form.success', "Thank you — your message has been sent. We'll be in touch shortly.");
            status.className = 'form-status is-success';
            form.reset();
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(() => {
          status.textContent = formText('form.error', "Something went wrong and your message wasn't sent. Please try again, or reach us on WhatsApp below.");
          status.className = 'form-status is-error';
        })
        .finally(() => { submitBtn.disabled = false; });
    });
  }
} catch (e) { /* contact form unavailable */ }

/* --- Mobile navigation ------------------------------------------ */
try {
  const button = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('nav');
  if (button && navigation) {
    button.addEventListener('click', () => {
      const open = navigation.classList.toggle('open');
      button.setAttribute('aria-expanded', open);
      button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      button.textContent = open ? '×' : '☰';
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      navigation.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); button.textContent = '☰';
    }));
  }
} catch (e) { /* mobile nav toggle unavailable */ }

/* ---------------------------------------------------------------
   HERO SLIDESHOW IMAGES
   To add a photo: drop the file in this folder, then add one line
   below. Order here is the order they appear. That's the only edit
   needed — the dots and timing update automatically.
----------------------------------------------------------------- */
try {
  const HERO_IMAGES = [
    'taman-baiduri.jpg',
    // 'your-next-photo.jpg',
    // 'another-photo.jpg',
  ];

  const SLIDE_DURATION = 6000; // milliseconds each slide stays on screen

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
} catch (e) { /* hero slideshow unavailable */ }

/* --- Footer year -------------------------------------------------- */
try {
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
} catch (e) { /* ignore */ }

/* --- Scroll reveal + stat counters -------------------------------- */
try {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCount = (el) => {
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
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.querySelectorAll('.stat-number').forEach(animateCount);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
} catch (e) { /* reveal animation unavailable */ }
