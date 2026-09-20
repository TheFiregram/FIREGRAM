/* Native scrolling and progressive enhancement. No animation or routing framework. */
(() => {
  "use strict";

  const root = document.documentElement;
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.getElementById("site-header");
  const hero = document.getElementById("home");
  const heroImage = document.getElementById("hero-image");
  const progress = document.getElementById("reading-progress");
  const menu = document.getElementById("site-menu");
  const menuButton = document.getElementById("menu-toggle");
  const motionButton = document.getElementById("motion-toggle");
  const motionState = document.getElementById("motion-state");
  let storedMotion = null;
  let motionEnabled = false;
  let revealObserver;
  let menuAnimation;
  let scrollFrame = 0;

  try { storedMotion = localStorage.getItem("firegram-motion"); } catch { /* Storage is optional. */ }

  function revealContent() {
    revealObserver?.disconnect();
    const elements = [...document.querySelectorAll("[data-reveal]")];
    if (!motionEnabled || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    elements.forEach((element) => {
      if (element.classList.contains("is-visible")) return;
      element.classList.add("will-reveal");
      revealObserver.observe(element);
    });
  }

  function applyMotion() {
    motionEnabled = !reducedQuery.matches && storedMotion !== "off";
    root.classList.toggle("motion-enabled", motionEnabled);
    root.classList.toggle("reduced-motion", !motionEnabled);
    motionButton.hidden = false;
    motionButton.setAttribute("aria-pressed", String(motionEnabled));
    motionState.textContent = motionEnabled ? "on" : "off";
    motionButton.disabled = reducedQuery.matches;
    motionButton.title = reducedQuery.matches ? "Motion is off to match your device preference" : "Turn decorative motion on or off";
    if (!motionEnabled) heroImage.style.transform = "";
    revealContent();
    requestScrollFrame();
  }

  motionButton.addEventListener("click", () => {
    storedMotion = motionEnabled ? "off" : "on";
    try { localStorage.setItem("firegram-motion", storedMotion); } catch { /* No storage required. */ }
    applyMotion();
  });
  reducedQuery.addEventListener("change", applyMotion);

  function updateScroll() {
    scrollFrame = 0;
    const y = window.scrollY;
    const height = hero.offsetHeight;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 40);
    progress.style.transform = "scaleX(" + (maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0) + ")";
    if (motionEnabled && y < height && !root.classList.contains("keyboard-input")) {
      const fraction = Math.min(1, y / height);
      heroImage.style.transform = "translateY(" + (fraction * 60).toFixed(2) + "px) scale(" + (1.035 + fraction * 0.045).toFixed(3) + ")";
    }
  }

  function requestScrollFrame() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener("scroll", requestScrollFrame, { passive: true });
  window.addEventListener("resize", requestScrollFrame, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (["Tab", "Enter", " ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", "Escape"].includes(event.key)) {
      root.classList.add("keyboard-input");
      heroImage.style.transform = "";
    }
  });
  document.addEventListener("pointerdown", () => root.classList.remove("keyboard-input"), { passive: true });

  function finishMenuClose() {
    menu.close();
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuAnimation?.cancel();
    menuAnimation = undefined;
  }

  async function closeMenu(animate = true) {
    if (!menu.open) return;
    if (menuAnimation) { finishMenuClose(); return; }
    if (animate && motionEnabled && !root.classList.contains("keyboard-input") && menu.animate) {
      menuAnimation = menu.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-out", fill: "forwards" });
      try { await menuAnimation.finished; } catch { /* A repeated action can cancel the exit. */ }
    }
    finishMenuClose();
  }

  if (typeof menu.showModal === "function") {
    menuButton.hidden = false;
    menuButton.addEventListener("click", () => {
      menuAnimation?.cancel();
      menuAnimation = undefined;
      menu.showModal();
      menuButton.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    });
    document.getElementById("menu-close").addEventListener("click", (event) => closeMenu(event.detail !== 0));
    menu.addEventListener("cancel", (event) => { event.preventDefault(); closeMenu(false); });
    menu.addEventListener("close", () => {
      document.body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  } else {
    // Older browsers keep a simple, usable navigation instead of a dead menu.
    menuButton.hidden = true;
    document.querySelector(".desktop-nav").classList.add("fallback-nav");
  }

  const legacySections = { overview: "home", intro: "home", hero: "home", experiments: "proof" };
  function sectionFromHash(hash) {
    let id;
    try { id = decodeURIComponent(hash.replace(/^#\/?/, "")); } catch { return null; }
    return document.getElementById(legacySections[id] || id);
  }
  function focusSection(section) {
    const focusTarget = section.querySelector("h1, h2, h3") || section;
    focusTarget.setAttribute("tabindex", "-1");
    focusTarget.focus({ preventScroll: true });
    // Focused destinations should never be hidden by a pending reveal.
    focusTarget.classList.add("is-visible");
    focusTarget.closest("[data-reveal]")?.classList.add("is-visible");
  }
  async function navigateSection(section, { animate = false, updateHistory = false, focus = false } = {}) {
    await closeMenu(false);
    if (updateHistory) {
      const nextHash = "#" + section.id;
      if (window.location.hash !== nextHash) history.pushState(null, "", nextHash);
    }
    section.scrollIntoView({ behavior: animate && motionEnabled ? "smooth" : "auto", block: "start" });
    if (focus) focusSection(section);
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = sectionFromHash(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    navigateSection(target, { animate: event.detail !== 0, updateHistory: true, focus: true });
  });
  window.addEventListener("hashchange", () => {
    const target = sectionFromHash(window.location.hash);
    if (target) navigateSection(target, { focus: true });
  });
  window.addEventListener("popstate", () => {
    const target = sectionFromHash(window.location.hash || "#home");
    if (target) navigateSection(target);
  });

  if ("IntersectionObserver" in window) {
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll(".desktop-nav a").forEach((link) => {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-15% 0px -60% 0px", threshold: 0 });
    document.querySelectorAll(".chapter").forEach((section) => chapterObserver.observe(section));
  }

  const proofList = document.getElementById("proof-list");
  const proofCount = document.getElementById("proof-count");
  const proofButtons = [...document.querySelectorAll("[data-filter]")];
  const proofEntries = Array.isArray(window.FIREGRAM_PROOF) ? window.FIREGRAM_PROOF : [];
  const proofRows = proofEntries.map((entry, index) => {
    const link = document.createElement("a");
    link.className = "proof-row";
    link.href = entry.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", entry.title + ": " + entry.linkLabel + " (opens in a new tab)");
    const number = document.createElement("span");
    number.className = "proof-index";
    number.textContent = String(index + 1).padStart(2, "0");
    const content = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = entry.title;
    const description = document.createElement("p");
    description.textContent = entry.description;
    content.append(title, description);
    const type = document.createElement("span");
    type.className = "proof-type";
    type.textContent = entry.type;
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    arrow.setAttribute("class", "arrow-icon proof-arrow");
    arrow.setAttribute("aria-hidden", "true");
    arrow.setAttribute("focusable", "false");
    const arrowShape = document.createElementNS("http://www.w3.org/2000/svg", "use");
    arrowShape.setAttribute("href", "#icon-arrow");
    arrow.append(arrowShape);
    link.append(number, content, type, arrow);
    proofList.append(link);
    return { element: link, categories: entry.category };
  });

  function filterProof(category, animate = false) {
    let count = 0;
    proofRows.forEach(({ element, categories }) => {
      const visible = category === "all" || categories.includes(category) || (category === "ai" && categories.includes("creative"));
      element.hidden = !visible;
      element.classList.remove("filter-enter");
      if (visible) {
        count += 1;
        if (animate && motionEnabled && !root.classList.contains("keyboard-input")) {
          element.style.animationDelay = Math.min(count - 1, 5) * 35 + "ms";
          element.classList.add("filter-enter");
        }
      }
    });
    proofCount.textContent = String(count).padStart(2, "0") + (count === 1 ? " record" : " records");
    proofButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === category)));
    requestScrollFrame();
  }
  if (proofRows.length) {
    document.getElementById("proof-controls").hidden = false;
    proofButtons.forEach((button) => button.addEventListener("click", () => filterProof(button.dataset.filter, true)));
    filterProof("all");
  } else {
    proofList.textContent = "The full collection is available in the proof archive below.";
  }

  applyMotion();
  if (window.location.hash) {
    const target = sectionFromHash(window.location.hash);
    if (target) requestAnimationFrame(() => navigateSection(target));
  }
  window.addEventListener("load", requestScrollFrame, { once: true });
})();
