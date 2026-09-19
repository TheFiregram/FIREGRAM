const routes = {
  home: { file: 'sections/home.html', index: '01', title: 'Overview', meta: 'FIREGRAM / PORTFOLIO' },
  work: { file: 'sections/work.html', index: '02', title: 'Selected Work', meta: 'PRODUCTS / BUILDS' },
  strengths: { file: 'sections/strengths.html', index: '03', title: 'Strengths', meta: 'CAPABILITIES / VALUE' },
  proof: { file: 'sections/proof.html', index: '04', title: 'Proof of Work', meta: 'EVIDENCE / OUTPUT' },
  experience: { file: 'sections/experience.html', index: '05', title: 'Experience', meta: 'CAREER / BACKGROUND' },
  about: { file: 'sections/about.html', index: '06', title: 'About', meta: 'THINKING / EXPERIMENTS' },
  contact: { file: 'sections/contact.html', index: '07', title: 'Contact', meta: 'REMOTE / WORLDWIDE' },
};

const routeOrder = Object.keys(routes);
const siteContent = document.querySelector('#siteContent');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopLayout = matchMedia('(min-width: 901px)');

let scriptsReady = false;
let navigationLocked = false;
let pendingDirection = 0;
let pendingScrollPosition = 'start';
let lastRenderedRoute = null;
let renderSequence = 0;
let unlockTimer = 0;
let wheelResetTimer = 0;
let wheelTotal = 0;
let wheelDirection = 0;
let touchStartY = null;

const EDGE_TOLERANCE = 4;
const WHEEL_SWITCH_THRESHOLD = 48;
const TOUCH_SWITCH_THRESHOLD = 64;

function currentRoute() {
  const raw = location.hash.replace(/^#\/?/, '').split('/')[0];
  return routes[raw] ? raw : 'home';
}

function routePosition(route) {
  return routeOrder.indexOf(route);
}

function activeScroller() {
  return desktopLayout.matches ? siteContent : document.scrollingElement;
}

function atScrollEdge(direction) {
  const scroller = activeScroller();
  if (!scroller) return false;

  if (direction > 0) {
    return scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - EDGE_TOLERANCE;
  }

  return scroller.scrollTop <= EDGE_TOLERANCE;
}

function resetWheelIntent() {
  wheelTotal = 0;
  wheelDirection = 0;
  clearTimeout(wheelResetTimer);
}

function routeByOffset(direction) {
  const currentIndex = routePosition(currentRoute());
  const nextRoute = routeOrder[currentIndex + direction];
  return nextRoute || null;
}

function requestRoute(route, direction = 0, scrollPosition = 'start') {
  if (!routes[route] || route === currentRoute() || navigationLocked) return false;

  pendingDirection = direction;
  pendingScrollPosition = scrollPosition;
  navigationLocked = true;
  resetWheelIntent();
  location.hash = `#/${route}`;
  return true;
}

function switchByScroll(direction) {
  const nextRoute = routeByOffset(direction);
  if (!nextRoute) return false;
  return requestRoute(nextRoute, direction, direction < 0 ? 'end' : 'start');
}

function setRouteScrollPosition(position) {
  requestAnimationFrame(() => {
    if (desktopLayout.matches) {
      siteContent.scrollTop = position === 'end'
        ? Math.max(0, siteContent.scrollHeight - siteContent.clientHeight)
        : 0;
      return;
    }

    const page = document.scrollingElement;
    const top = position === 'end'
      ? Math.max(0, page.scrollHeight - page.clientHeight)
      : 0;
    window.scrollTo(0, top);
  });
}

function setRouteScrollPositionNow(position) {
  if (desktopLayout.matches) {
    siteContent.scrollTop = position === 'end'
      ? Math.max(0, siteContent.scrollHeight - siteContent.clientHeight)
      : 0;
    return;
  }

  const page = document.scrollingElement;
  const top = position === 'end'
    ? Math.max(0, page.scrollHeight - page.clientHeight)
    : 0;
  window.scrollTo(0, top);
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

function finishRouteTransition() {
  clearTimeout(unlockTimer);
  unlockTimer = setTimeout(() => {
    siteContent.classList.remove('is-route-switching', 'route-enter');
    siteContent.removeAttribute('data-route-direction');
    navigationLocked = false;
  }, reduceMotion ? 0 : 680);
}

async function renderRoute() {
  const sequence = ++renderSequence;
  const route = currentRoute();
  const data = routes[route];
  const previousRoute = lastRenderedRoute;
  const inferredDirection = previousRoute
    ? Math.sign(routePosition(route) - routePosition(previousRoute))
    : 0;
  const direction = pendingDirection || inferredDirection;
  const scrollPosition = pendingScrollPosition;
  const useNativeTransition = !reduceMotion && Boolean(document.startViewTransition) && Boolean(previousRoute);

  navigationLocked = true;
  updateChrome(route);
  siteContent.classList.remove('route-enter');
  siteContent.classList.add('is-route-switching');
  if (!useNativeTransition) siteContent.classList.add('is-loading');
  siteContent.dataset.routeDirection = direction < 0 ? 'previous' : 'next';

  try {
    const response = await fetch(data.file, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Could not load ${data.file}`);
    const html = await response.text();
    if (sequence !== renderSequence) return;

    await ensureScripts();
    if (sequence !== renderSequence) return;

    const swapRouteContent = () => {
      siteContent.innerHTML = html;
      window.FIREGRAM_INIT?.();
      lastRenderedRoute = route;
      setRouteScrollPositionNow(scrollPosition);
      siteContent.classList.remove('is-loading');
    };

    if (useNativeTransition) {
      document.documentElement.dataset.routeDirection = direction < 0 ? 'previous' : 'next';
      const transition = document.startViewTransition(swapRouteContent);

      transition.finished.finally(() => {
        delete document.documentElement.dataset.routeDirection;
      });
    } else {
      swapRouteContent();
      requestAnimationFrame(() => siteContent.classList.add('route-enter'));
    }
  } catch (error) {
    console.error(error);
    siteContent.innerHTML = '<section class="section load-error"><p>Portfolio content could not be loaded. Please refresh the page.</p></section>';
    siteContent.classList.remove('is-loading');
  } finally {
    if (sequence === renderSequence) {
      pendingDirection = 0;
      pendingScrollPosition = 'start';
      finishRouteTransition();
    }
  }
}

function ignoreNavigationGesture(target) {
  return Boolean(target?.closest('input, textarea, select, [contenteditable="true"], #mobileMenu.open'));
}

function handleWheel(event) {
  if (navigationLocked || ignoreNavigationGesture(event.target)) return;
  if (!event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

  const direction = event.deltaY > 0 ? 1 : -1;
  if (!routeByOffset(direction) || !atScrollEdge(direction)) {
    resetWheelIntent();
    return;
  }

  event.preventDefault();

  if (wheelDirection !== direction) {
    wheelTotal = 0;
    wheelDirection = direction;
  }

  wheelTotal += Math.abs(event.deltaY);
  clearTimeout(wheelResetTimer);
  wheelResetTimer = setTimeout(resetWheelIntent, 180);

  if (wheelTotal >= WHEEL_SWITCH_THRESHOLD) switchByScroll(direction);
}

function handleTouchStart(event) {
  if (navigationLocked || ignoreNavigationGesture(event.target)) return;
  touchStartY = event.touches[0]?.clientY ?? null;
}

function handleTouchEnd(event) {
  if (navigationLocked || touchStartY === null || ignoreNavigationGesture(event.target)) {
    touchStartY = null;
    return;
  }

  const endY = event.changedTouches[0]?.clientY;
  if (endY === undefined) {
    touchStartY = null;
    return;
  }

  const distance = touchStartY - endY;
  touchStartY = null;
  if (Math.abs(distance) < TOUCH_SWITCH_THRESHOLD) return;

  const direction = distance > 0 ? 1 : -1;
  if (routeByOffset(direction) && atScrollEdge(direction)) switchByScroll(direction);
}

function handleKeyboard(event) {
  if (navigationLocked || ignoreNavigationGesture(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;

  let direction = 0;
  if (event.key === 'PageDown' || event.key === 'ArrowDown') direction = 1;
  if (event.key === 'PageUp' || event.key === 'ArrowUp') direction = -1;
  if (!direction || !routeByOffset(direction) || !atScrollEdge(direction)) return;

  event.preventDefault();
  switchByScroll(direction);
}

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest('a[href^="#/"]');
  if (!link) return;

  const route = link.getAttribute('href').replace(/^#\/?/, '').split('/')[0];
  if (!routes[route]) return;

  event.preventDefault();
  if (route === currentRoute()) {
    setRouteScrollPosition('start');
    return;
  }

  const direction = Math.sign(routePosition(route) - routePosition(currentRoute()));
  pendingDirection = direction;
  pendingScrollPosition = 'start';
  navigationLocked = true;
  location.hash = `#/${route}`;
});

addEventListener('wheel', handleWheel, { passive: false });
addEventListener('touchstart', handleTouchStart, { passive: true });
addEventListener('touchend', handleTouchEnd, { passive: true });
addEventListener('keydown', handleKeyboard);
addEventListener('hashchange', renderRoute);

if (!location.hash || location.hash === '#') history.replaceState(null, '', '#/home');
renderRoute();
