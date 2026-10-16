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

  // Upgrade the project selector while retaining the real select as the form value.
  // The native control remains in the DOM for Netlify and browser validation.
  function initCustomProjectSelects() {
    const controls = [];

    $$('[data-custom-select]').forEach((root) => {
      const select = $('select', root);
      const field = root.closest('.field');
      const label = field ? $('.field__label', field) : null;
      if (!select || !label || !select.id || !select.options.length) return;

      const trigger = document.createElement('button');
      trigger.className = 'select-control__trigger';
      trigger.type = 'button';
      trigger.setAttribute('role', 'combobox');
      trigger.setAttribute('aria-autocomplete', 'none');
      trigger.setAttribute('aria-haspopup', 'listbox');
      if (select.required) trigger.setAttribute('aria-required', 'true');
      trigger.setAttribute('aria-expanded', 'false');

      const value = document.createElement('span');
      value.className = 'select-control__value';
      value.id = select.id + '-value';

      const chevron = document.createElement('span');
      chevron.className = 'select-control__chevron';
      chevron.setAttribute('aria-hidden', 'true');

      trigger.append(value, chevron);
      trigger.setAttribute('aria-labelledby', label.id + ' ' + value.id);

      const popup = document.createElement('div');
      popup.className = 'select-control__popup';
      popup.id = select.id + '-options';
      popup.setAttribute('role', 'listbox');
      popup.setAttribute('aria-labelledby', label.id);
      popup.setAttribute('aria-hidden', 'true');
      popup.inert = true;
      trigger.setAttribute('aria-controls', popup.id);

      const control = {
        root,
        select,
        trigger,
        value,
        popup,
        options: [],
        activeIndex: -1,
        isOpen: false,
        typeahead: '',
        typeaheadTimer: null
      };

      Array.from(select.options).forEach((nativeOption, optionIndex) => {
        const option = document.createElement('div');
        option.className = 'select-control__option';
        option.id = select.id + '-option-' + optionIndex;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', String(nativeOption.selected));
        option.setAttribute('aria-disabled', String(nativeOption.disabled));
        option.dataset.optionIndex = String(optionIndex);
        option.textContent = nativeOption.textContent.trim();
        popup.append(option);
        control.options.push(option);

        option.addEventListener('click', () => {
          if (nativeOption.disabled) return;
          chooseOption(control, optionIndex);
        });
      });

      root.append(trigger, popup);
      root.classList.add('is-enhanced');
      select.setAttribute('aria-hidden', 'true');
      select.tabIndex = -1;

      // Clicking the visible label should focus the custom control, not the clipped select.
      label.addEventListener('click', (event) => {
        event.preventDefault();
        trigger.focus();
      });

      const firstEnabledIndex = () => control.options.findIndex((option) =>
        option.getAttribute('aria-disabled') !== 'true'
      );
      const lastEnabledIndex = () => {
        for (let index = control.options.length - 1; index >= 0; index -= 1) {
          if (control.options[index].getAttribute('aria-disabled') !== 'true') return index;
        }
        return -1;
      };
      const selectedEnabledIndex = () => {
        const index = select.selectedIndex;
        return index >= 0 && control.options[index]?.getAttribute('aria-disabled') !== 'true'
          ? index
          : firstEnabledIndex();
      };

      control.updateValue = () => {
        const selectedOption = select.options[select.selectedIndex];
        value.textContent = selectedOption ? selectedOption.textContent.trim() : 'Choose a project type';
        trigger.dataset.placeholder = String(!select.value);
        control.options.forEach((option, index) => {
          option.setAttribute('aria-selected', String(index === select.selectedIndex));
        });
        if (select.value) {
          root.classList.remove('is-invalid');
          trigger.removeAttribute('aria-invalid');
        }
      };

      control.setActive = (index) => {
        const option = control.options[index];
        if (!option || option.getAttribute('aria-disabled') === 'true') return;
        control.activeIndex = index;
        control.options.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === index));
        trigger.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
      };

      control.open = () => {
        if (control.isOpen) return;
        control.isOpen = true;
        root.dataset.open = 'true';
        trigger.setAttribute('aria-expanded', 'true');
        popup.setAttribute('aria-hidden', 'false');
        popup.inert = false;
        control.setActive(selectedEnabledIndex());
      };

      control.close = (restoreFocus = false) => {
        if (!control.isOpen) {
          if (restoreFocus) trigger.focus();
          return;
        }
        control.isOpen = false;
        delete root.dataset.open;
        trigger.setAttribute('aria-expanded', 'false');
        trigger.removeAttribute('aria-activedescendant');
        popup.setAttribute('aria-hidden', 'true');
        popup.inert = true;
        control.options.forEach((option) => option.classList.remove('is-active'));
        control.activeIndex = -1;
        if (restoreFocus) trigger.focus();
      };

      function chooseOption(controlRef, index) {
        const nativeOption = controlRef.select.options[index];
        if (!nativeOption || nativeOption.disabled) return;
        controlRef.select.selectedIndex = index;
        controlRef.select.dispatchEvent(new Event('input', { bubbles: true }));
        controlRef.select.dispatchEvent(new Event('change', { bubbles: true }));
        controlRef.updateValue();
        controlRef.close(true);
      }

      control.moveActive = (direction) => {
        const enabled = control.options
          .map((option, index) => ({ option, index }))
          .filter(({ option }) => option.getAttribute('aria-disabled') !== 'true')
          .map(({ index }) => index);
        if (!enabled.length) return;
        const currentPosition = enabled.indexOf(control.activeIndex);
        const nextPosition = Math.max(0, Math.min(enabled.length - 1,
          (currentPosition < 0 ? 0 : currentPosition) + direction));
        control.setActive(enabled[nextPosition]);
      };

      trigger.addEventListener('click', () => {
        if (control.isOpen) control.close();
        else control.open();
      });

      trigger.addEventListener('keydown', (event) => {
        const key = event.key;
        if (key === 'Escape' && control.isOpen) {
          event.preventDefault();
          control.close(true);
          return;
        }
        if (key === 'Tab') {
          if (control.isOpen) control.close();
          return;
        }
        if (key === 'ArrowDown' || key === 'ArrowUp') {
          event.preventDefault();
          if (!control.isOpen) {
            control.open();
          } else {
            control.moveActive(key === 'ArrowDown' ? 1 : -1);
          }
          return;
        }
        if (key === 'Home' || key === 'End') {
          event.preventDefault();
          if (!control.isOpen) control.open();
          control.setActive(key === 'Home' ? firstEnabledIndex() : lastEnabledIndex());
          return;
        }
        if (key === 'Enter' || key === ' ') {
          event.preventDefault();
          if (!control.isOpen) control.open();
          else if (control.activeIndex >= 0) chooseOption(control, control.activeIndex);
          return;
        }

        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          control.typeahead += key.toLocaleLowerCase();
          window.clearTimeout(control.typeaheadTimer);
          control.typeaheadTimer = window.setTimeout(() => { control.typeahead = ''; }, 700);
          const start = Math.max(0, control.activeIndex + 1);
          const ordered = control.options.map((option, index) => ({ option, index }));
          const searchOrder = ordered.slice(start).concat(ordered.slice(0, start));
          const match = searchOrder.find(({ option }) =>
            option.getAttribute('aria-disabled') !== 'true' &&
            option.textContent.trim().toLocaleLowerCase().startsWith(control.typeahead)
          );
          if (match) {
            event.preventDefault();
            if (!control.isOpen) control.open();
            control.setActive(match.index);
          }
        }
      });

      select.addEventListener('change', control.updateValue);
      select.addEventListener('invalid', () => {
        root.classList.add('is-invalid');
        trigger.setAttribute('aria-invalid', 'true');
        trigger.focus();
      });

      control.updateValue();
      controls.push(control);
    });

    document.addEventListener('pointerdown', (event) => {
      controls.forEach((control) => {
        if (!control.root.contains(event.target)) control.close();
      });
    });

    return controls;
  }

  const customProjectSelects = initCustomProjectSelects();

  const form = $('.contact-form');
  form?.addEventListener('reset', () => {
    // Native form reset does not emit change on the hidden select, so refresh after reset completes.
    window.setTimeout(() => {
      customProjectSelects.forEach((control) => {
        control.close();
        control.updateValue();
        control.root.classList.remove('is-invalid');
        control.trigger.removeAttribute('aria-invalid');
      });
    }, 0);
  });

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
