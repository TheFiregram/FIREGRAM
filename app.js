const routes = {
  home: { file: 'sections/home.html', index: '01', title: 'Overview', meta: 'FIREGRAM / PORTFOLIO' },
  work: { file: 'sections/work.html', index: '02', title: 'Selected Work', meta: 'PRODUCTS / BUILDS' },
  strengths: { file: 'sections/strengths.html', index: '03', title: 'Strengths', meta: 'CAPABILITIES / VALUE' },
  proof: { file: 'sections/proof.html', index: '04', title: 'Proof of Work', meta: 'EVIDENCE / OUTPUT' },
  experience: { file: 'sections/experience.html', index: '05', title: 'Experience', meta: 'CAREER / BACKGROUND' },
  about: { file: 'sections/about.html', index: '06', title: 'About', meta: 'THINKING / EXPERIMENTS' },
  contact: { file: 'sections/contact.html', index: '07', title: 'Contact', meta: 'REMOTE / WORLDWIDE' },
};

const siteContent = document.querySelector('#siteContent');
let scriptsReady = false;

function currentRoute() {
  const raw = location.hash.replace(/^#\/?/, '').split('/')[0];
  return routes[raw] ? raw : 'home';
}

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if ([...document.scripts].some(s => s.src.endsWith(src))) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

async function ensureScripts() {
  if (scriptsReady) return;
  await loadScript('proof-data.js');
  await loadScript('script.js');
  scriptsReady = true;
}

function updateChrome(route) {
  const data = routes[route];
  document.querySelector('#routeIndex').textContent = data.index;
  document.querySelector('#routeTitle').textContent = data.title;
  document.querySelector('#routeMeta').textContent = data.meta;
  document.title = `${data.title} · FIREGRAM`;
  document.querySelectorAll('[data-route]').forEach(link => link.classList.toggle('active', link.dataset.route === route));
}

async function renderRoute() {
  const route = currentRoute();
  const data = routes[route];
  updateChrome(route);
  siteContent.classList.add('is-loading');

  try {
    const response = await fetch(data.file, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Could not load ${data.file}`);
    siteContent.innerHTML = await response.text();
    siteContent.scrollTop = 0;
    await ensureScripts();
    window.FIREGRAM_INIT?.();
  } catch (error) {
    console.error(error);
    siteContent.innerHTML = '<section class="section load-error"><p>Portfolio content could not be loaded. Please refresh the page.</p></section>';
  } finally {
    requestAnimationFrame(() => siteContent.classList.remove('is-loading'));
  }
}

addEventListener('hashchange', renderRoute);
if (!location.hash || location.hash === '#') history.replaceState(null, '', '#/home');
renderRoute();
