(() => {
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let globalReady = false;
  let soundOn = false;
  let audioCtx = null;

  function softClick(freq = 390, gain = .015) {
    if (!soundOn) return;
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, audioCtx.currentTime);
    amp.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .11);
    osc.connect(amp).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + .12);
  }

  function initGlobal() {
    if (globalReady) return;
    globalReady = true;

    const glow = $('#cursorGlow');
    if (glow && !reduceMotion && matchMedia('(pointer:fine)').matches) {
      addEventListener('pointermove', e => {
        glow.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 650, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)' });
      }, { passive: true });
    }

    const menuToggle = $('#menuToggle');
    const mobileMenu = $('#mobileMenu');
    if (menuToggle && mobileMenu) {
      const closeMenu = () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
      };
      menuToggle.addEventListener('click', () => {
        const open = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!open));
        mobileMenu.classList.toggle('open', !open);
        mobileMenu.setAttribute('aria-hidden', String(open));
      });
      $$('#mobileMenu a').forEach(a => a.addEventListener('click', closeMenu));
    }

    const soundToggle = $('#soundToggle');
    const soundLabel = $('.sound-label');
    soundToggle?.addEventListener('click', () => {
      soundOn = !soundOn;
      soundToggle.setAttribute('aria-pressed', String(soundOn));
      if (soundLabel) soundLabel.textContent = soundOn ? 'Sound on' : 'Sound off';
      if (soundOn) { audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); softClick(510, .035); }
    });

    document.addEventListener('pointerdown', e => {
      if (e.target.closest('a,button')) softClick();
    });

    initAmbient();
  }

  function initAmbient() {
    const canvas = $('#ambientCanvas');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, particles = [];
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5); w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const count = Math.min(34, Math.max(18, Math.floor(w / 52)));
      particles = Array.from({length:count}, () => ({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.2+.25,vx:(Math.random()-.5)*.07,vy:(Math.random()-.5)*.06,a:Math.random()*.16+.035}));
    };
    const frame = () => {
      ctx.clearRect(0,0,w,h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -8) p.x = w + 8; if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8; if (p.y > h + 8) p.y = -8;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(216,177,157,${p.a})`; ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    resize(); addEventListener('resize', resize, { passive:true }); frame();
  }

  function initReveal(root) {
    const els = $$('.reveal', root);
    els.forEach(el => el.style.setProperty('--delay', `${Number(el.dataset.delay || 0)}ms`));
    if (reduceMotion) return els.forEach(el => el.classList.add('visible'));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold:.08, rootMargin:'0px 0px -3% 0px' });
    els.forEach(el => observer.observe(el));
  }

  function initTilt(root) {
    if (reduceMotion || !matchMedia('(pointer:fine)').matches) return;
    $$('.tilt-card', root).forEach(card => {
      card.onpointermove = e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${-y*3.5}deg) rotateY(${x*4.2}deg) translateY(-2px)`;
      };
      card.onpointerleave = () => card.style.transform = '';
    });
  }

  function initMagnetic(root) {
    if (reduceMotion || !matchMedia('(pointer:fine)').matches) return;
    $$('.magnetic', root).forEach(btn => {
      btn.onpointermove = e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.11}px)`;
      };
      btn.onpointerleave = () => btn.style.transform = '';
    });
  }

  function renderProof(root) {
    const grid = $('#proofGrid', root);
    if (!grid) return;
    const proof = window.FIREGRAM_PROOF || [];
    const symbols = { risk:'⌁', code:'</>', wallet:'W', gram:'⇄', team:'◌', community:'◎', creative:'◐', teaching:'△', phone:'▯' };
    grid.innerHTML = '';
    proof.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = 'proof-card glass reveal';
      card.dataset.categories = item.category.join(' ');
      card.dataset.delay = String((idx % 4) * 45);
      const media = item.media
        ? (item.mediaType === 'video'
          ? `<video class="proof-media-asset" src="${item.media}" muted loop playsinline preload="metadata" aria-label="${item.title} proof video"></video>`
          : `<img class="proof-media-asset" src="${item.media}" alt="${item.mediaAlt || item.title}" loading="lazy" />`)
        : `<div class="proof-symbol">${symbols[item.visual] || '↗'}</div>`;
      card.innerHTML = `<div class="proof-media">${media}</div><div class="proof-card-body"><span class="proof-type">${item.type}</span><h3>${item.title}</h3><p>${item.description}</p><a href="${item.link}" target="_blank" rel="noreferrer">${item.linkLabel} ↗</a></div>`;
      const video = card.querySelector('video');
      if (video) {
        card.addEventListener('pointerenter', () => video.play().catch(() => {}));
        card.addEventListener('pointerleave', () => { video.pause(); video.currentTime = 0; });
      }
      grid.appendChild(card);
    });

    $$('#proofFilters button', root).forEach(button => {
      button.onclick = () => {
        $$('#proofFilters button', root).forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        const filter = button.dataset.filter;
        $$('.proof-card', root).forEach(card => card.classList.toggle('hidden', filter !== 'all' && !card.dataset.categories.split(' ').includes(filter)));
        softClick(330,.028);
      };
    });
  }

  window.FIREGRAM_INIT = () => {
    initGlobal();
    const root = $('#siteContent');
    if (!root) return;
    renderProof(root);
    initReveal(root);
    initTilt(root);
    initMagnetic(root);
  };
})();
