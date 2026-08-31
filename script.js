(() => {
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Glass navigation behavior
  const topbar = $('#topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', scrollY > 28);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
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
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', closeMenu));

  // Scroll reveal
  $$('.reveal').forEach(el => {
    const delay = Number(el.dataset.delay || 0);
    el.style.setProperty('--delay', `${delay}ms`);
  });
  if (reduceMotion) {
    $$('.reveal').forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    $$('.reveal').forEach(el => observer.observe(el));
  }

  // Pointer glow
  const glow = $('#cursorGlow');
  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      glow.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 650, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)' });
    }, { passive: true });
  }

  // Card tilt
  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    $$('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Magnetic buttons
  if (!reduceMotion && matchMedia('(pointer:fine)').matches) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .11;
        const y = (e.clientY - r.top - r.height / 2) * .16;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('pointerleave', () => btn.style.transform = '');
    });
  }

  // POW renderer + filters
  const symbols = { risk:'⌁', code:'</>', wallet:'W', gram:'⇄', team:'◌', community:'◎', creative:'◐', teaching:'△', phone:'▯' };
  const proofGrid = $('#proofGrid');
  const proof = window.FIREGRAM_PROOF || [];
  proof.forEach((item, idx) => {
    const card = document.createElement('article');
    card.className = 'proof-card glass reveal';
    card.dataset.categories = item.category.join(' ');
    card.style.setProperty('--delay', `${(idx % 3) * 60}ms`);
    const mediaMarkup = item.media
      ? (item.mediaType === 'video'
        ? `<video class="proof-media-asset" src="${item.media}" muted loop playsinline preload="metadata" aria-label="${item.title} proof video"></video>`
        : `<img class="proof-media-asset" src="${item.media}" alt="${item.mediaAlt || item.title}" loading="lazy" />`)
      : `<div class="proof-symbol">${symbols[item.visual] || '↗'}</div>`;
    card.innerHTML = `
      <div class="proof-media">${mediaMarkup}</div>
      <div class="proof-card-body">
        <span class="proof-type">${item.type}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <a href="${item.link}" target="_blank" rel="noreferrer">${item.linkLabel} ↗</a>
      </div>`;
    const proofVideo = card.querySelector('video');
    if (proofVideo) {
      card.addEventListener('pointerenter', () => proofVideo.play().catch(() => {}));
      card.addEventListener('pointerleave', () => { proofVideo.pause(); proofVideo.currentTime = 0; });
    }
    proofGrid.appendChild(card);
  });
  // Observe POW cards added after initial observer setup
  if (!reduceMotion) {
    const powObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); powObserver.unobserve(entry.target); }
    }), { threshold:.08 });
    $$('.proof-card').forEach(card => powObserver.observe(card));
  } else $$('.proof-card').forEach(card => card.classList.add('visible'));

  $$('#proofFilters button').forEach(button => {
    button.addEventListener('click', () => {
      $$('#proofFilters button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      $$('.proof-card').forEach(card => {
        const match = filter === 'all' || card.dataset.categories.split(' ').includes(filter);
        card.classList.toggle('hidden', !match);
      });
      softClick(330, .028);
    });
  });

  // Opt-in interface sound via Web Audio. No auto-play.
  let audioCtx = null;
  let soundOn = false;
  const soundToggle = $('#soundToggle');
  const soundLabel = $('.sound-label');
  function softClick(freq = 420, gain = .022) {
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
  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    soundLabel.textContent = soundOn ? 'Sound on' : 'Sound off';
    if (soundOn) { audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); softClick(510,.035); }
  });
  $$('a,button').forEach(el => el.addEventListener('pointerdown', () => softClick(390,.015)));

  // Ambient canvas: slow glassy particles
  const canvas = $('#ambientCanvas');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, particles = [];
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.6);
    w = innerWidth; h = innerHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.min(42, Math.max(20, Math.floor(w/40)));
    particles = Array.from({length:count}, () => ({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.3+.3,vx:(Math.random()-.5)*.09,vy:(Math.random()-.5)*.08,a:Math.random()*.22+.05}));
  };
  const frame = () => {
    ctx.clearRect(0,0,w,h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w+10; if (p.x > w+10) p.x = -10;
      if (p.y < -10) p.y = h+10; if (p.y > h+10) p.y = -10;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(207,220,255,${p.a})`; ctx.fill();
    }
    requestAnimationFrame(frame);
  };
  resize(); addEventListener('resize', resize, { passive:true }); if (!reduceMotion) frame();
})();
