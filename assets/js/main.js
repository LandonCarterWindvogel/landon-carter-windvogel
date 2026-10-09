(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const year = $('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const header = $('[data-site-header]');
  const progress = document.createElement('div');
  progress.className = 'progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  const updateScrollState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--p', String(maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0));
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState, { passive: true });

  const toggle = $('.menu-toggle');
  const menu = $('#mobile-menu');
  const desktopBreakpoint = window.matchMedia('(min-width: 801px)');
  const menuLinks = () => menu ? $$('a[href]', menu) : [];

  const setMenu = (open) => {
    if (!menu || !toggle) return;
    const focusWasInMenu = menu.contains(document.activeElement);
    menu.classList.toggle('open', open);
    menu.inert = !open;
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    if (open) menuLinks()[0]?.focus();
    else if (focusWasInMenu) toggle.focus();
  };

  if (menu) {
    menu.inert = true;
    menu.setAttribute('aria-hidden', 'true');
  }
  toggle?.addEventListener('click', () => setMenu(!menu?.classList.contains('open')));
  menuLinks().forEach((link) => link.addEventListener('click', () => setMenu(false)));
  desktopBreakpoint.addEventListener('change', (event) => {
    if (event.matches && menu?.classList.contains('open')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (!menu?.classList.contains('open') || !toggle) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
      toggle.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const links = menuLinks();
    const lastLink = links[links.length - 1];
    if (event.shiftKey && document.activeElement === toggle) {
      event.preventDefault();
      lastLink?.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      toggle.focus();
    }
  });

  const hero = $('.hero');
  if (hero && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (event) => {
      const bounds = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (event.clientX - bounds.left) + 'px');
      hero.style.setProperty('--my', (event.clientY - bounds.top) + 'px');
    }, { passive: true });
  }

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const desktopLinks = $$('.desktop-nav a');
  if ('IntersectionObserver' in window && desktopLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        desktopLinks.forEach((link) => link.removeAttribute('aria-current'));
        desktopLinks.find((link) => link.hash === '#' + entry.target.id)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    desktopLinks.forEach((link) => {
      const sectionId = link.hash.slice(1);
      const section = sectionId && document.getElementById(sectionId);
      if (section) sectionObserver.observe(section);
    });
  }

  $$('.work-item img, .case-shot img').forEach((img) => {
    const showFailure = () => img.closest('figure')?.classList.add('image-failed');
    const tryFallback = () => {
      const fallback = img.dataset.fallback;
      if (!fallback) {
        showFailure();
        return;
      }
      delete img.dataset.fallback;
      img.src = fallback;
    };
    img.addEventListener('error', tryFallback);
    if (img.complete && img.naturalWidth === 0) tryFallback();
  });

  const form = $('.contact-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = $('.form-status', form);
    const submit = $('button[type="submit"]', form);
    if (!status || !submit) return;

    const offerEmailFallback = (message) => {
      const details = new FormData(form);
      const subject = 'Project enquiry: ' + (details.get('project-type') || 'New enquiry');
      const body = (details.get('message') || '') + '\n\n' +
        (details.get('name') || '') + ' — ' + (details.get('email') || '');
      const link = document.createElement('a');
      link.href = 'mailto:hello@landoncarterwindvogel.dev?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      link.textContent = 'email me directly';
      status.replaceChildren(document.createTextNode(message), link,
        document.createTextNode(' (your message is pre-filled).'));
    };

    // GitHub Pages is static hosting; never report a fake successful form submission.
    if (window.location.hostname.endsWith('.github.io')) {
      offerEmailFallback('This site is hosted on GitHub Pages, which cannot receive form submissions — ');
      return;
    }

    status.textContent = 'Sending…';
    submit.disabled = true;
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      form.reset();
      status.textContent = 'Sent. I’ll get back to you within a day or two.';
    } catch {
      offerEmailFallback('Couldn’t send from here — ');
    } finally {
      submit.disabled = false;
    }
  });
})();
