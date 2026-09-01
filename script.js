(() => {
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let globalReady = false;

  function initGlobal() {
    if (globalReady) return;
    globalReady = true;

    const menuToggle = $('#menuToggle');
    const mobileMenu = $('#mobileMenu');

    if (menuToggle && mobileMenu) {
      const closeMenu = () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
      };

      menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        mobileMenu.classList.toggle('open', !isOpen);
        mobileMenu.setAttribute('aria-hidden', String(isOpen));
      });

      $$('#mobileMenu a').forEach(link => link.addEventListener('click', closeMenu));
      addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
      });
      document.addEventListener('pointerdown', event => {
        if (!mobileMenu.classList.contains('open')) return;
        if (event.target.closest('#mobileMenu, #menuToggle')) return;
        closeMenu();
      });
    }
  }

  function initReveal(root) {
    const elements = $$('.reveal', root);
    if (!elements.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .06, rootMargin: '0px 0px -2% 0px' });

    elements.forEach(element => observer.observe(element));
  }

  function renderProof(root) {
    const grid = $('#proofGrid', root);
    if (!grid) return;

    const proof = window.FIREGRAM_PROOF || [];
    const symbols = {
      risk: '⌁', code: '</>', wallet: 'W', gram: '⇄', team: '◌',
      community: '◎', creative: '◐', teaching: '△', phone: '▯'
    };

    grid.innerHTML = '';

    proof.forEach(item => {
      const card = document.createElement('article');
      card.className = 'proof-card glass reveal';
      card.dataset.categories = item.category.join(' ');

      const media = item.media
        ? (item.mediaType === 'video'
          ? `<video class="proof-media-asset" src="${item.media}" muted loop playsinline preload="metadata" aria-label="${item.title} proof video"></video>`
          : `<img class="proof-media-asset" src="${item.media}" alt="${item.mediaAlt || item.title}" loading="lazy" />`)
        : `<div class="proof-symbol">${symbols[item.visual] || '↗'}</div>`;

      card.innerHTML = `
        <div class="proof-media">${media}</div>
        <div class="proof-card-body">
          <span class="proof-type">${item.type}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <a href="${item.link}" target="_blank" rel="noreferrer">${item.linkLabel} ↗</a>
        </div>`;

      const video = card.querySelector('video');
      if (video && matchMedia('(hover:hover)').matches) {
        card.addEventListener('pointerenter', () => video.play().catch(() => {}));
        card.addEventListener('pointerleave', () => {
          video.pause();
          video.currentTime = 0;
        });
      }

      grid.appendChild(card);
    });

    $$('#proofFilters button', root).forEach(button => {
      button.onclick = () => {
        $$('#proofFilters button', root).forEach(item => item.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;
        $$('.proof-card', root).forEach(card => {
          const visible = filter === 'all' || card.dataset.categories.split(' ').includes(filter);
          card.classList.toggle('hidden', !visible);
        });
      };
    });
  }

  window.FIREGRAM_INIT = () => {
    initGlobal();
    const root = $('#siteContent');
    if (!root) return;
    renderProof(root);
    initReveal(root);
  };
})();
