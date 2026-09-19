const { strict: assert } = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require(process.env.JSDOM_MODULE_PATH || "jsdom");
const base = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(base, "index.html"), "utf8");
const script = fs.readFileSync(path.join(base, "portfolio.js"), "utf8");
const data = fs.readFileSync(path.join(base, "proof-data.js"), "utf8");
let assertions = 0;
function check(value, message) { assert.ok(value, message); assertions += 1; }
async function flush() { await new Promise((resolve) => setTimeout(resolve, 40)); }
function boot({ reduced = false, storage = null, hash = "", dialog = true, observer = true, brokenStorage = false, proof = true } = {}) {
  const dom = new JSDOM(html, { url: "https://firegram-portfolio.vercel.app/" + hash, runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  const calls = [];
  const media = { matches: reduced, addEventListener() {} };
  window.matchMedia = () => media;
  window.HTMLElement.prototype.scrollIntoView = function(options) { calls.push({ id: this.id, ...options }); };
  if (observer) window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(element) { this.callback([{ target: element, isIntersecting: true }]); }
    unobserve() {}
    disconnect() {}
  };
  if (dialog) {
    window.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
    window.HTMLDialogElement.prototype.close = function() { this.open = false; this.dispatchEvent(new window.Event("close")); };
  }
  if (storage !== null) window.localStorage.setItem("firegram-motion", storage);
  if (brokenStorage) Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage disabled"); } });
  if (proof) window.eval(data);
  window.eval(script);
  return { dom, window, document: window.document, calls };
}

(async () => {
  const app = boot();
  const d = app.document;
  check(d.querySelectorAll("h1").length === 1, "A single h1");
  const ids = [...d.querySelectorAll("[id]")].map((el) => el.id);
  check(new Set(ids).size === ids.length, "Unique IDs");
  [...d.querySelectorAll("a[href^='#']")].forEach((link) => check(d.getElementById(link.hash.slice(1)), "Anchor target exists: " + link.hash));
  [...d.querySelectorAll("img[src],script[src],link[rel='stylesheet'][href],link[rel='icon'][href]")].forEach((element) => {
    const asset = element.getAttribute("src") || element.getAttribute("href");
    if (!asset.startsWith("https://")) check(fs.existsSync(path.join(base, asset)), "Asset exists: " + asset);
  });
  [...d.querySelectorAll("img")].forEach((img) => {
    check(img.hasAttribute("alt"), "Image has alt");
    check(img.hasAttribute("width") && img.hasAttribute("height"), "Image dimensions reserve layout space");
  });
  [...d.querySelectorAll("a[target='_blank']")].forEach((link) => check(link.rel.includes("noopener") && link.rel.includes("noreferrer"), "External tab safety"));
  check(d.querySelectorAll(".proof-row").length === 10, "All ten proof records");
  check(d.querySelector(".proof-count").textContent === "10 records", "Initial live count");
  const expected = { ai: 3, software: 5, community: 3, web3: 4, teaching: 2, product: 6, all: 10 };
  for (const [filter, count] of Object.entries(expected)) {
    d.querySelector('[data-filter="' + filter + '"]').click();
    check(d.querySelectorAll(".proof-row:not([hidden])").length === count, filter + " count");
    check(d.querySelectorAll('[data-filter][aria-pressed="true"]').length === 1, "One active filter");
    check(d.querySelector(".proof-count").textContent === String(count).padStart(2, "0") + " records", filter + " announcement");
  }
  d.querySelector(".desktop-nav a").click();
  await flush();
  check(app.window.location.hash === "#work", "Section URL updates");
  check(app.calls.at(-1).id === "work", "Navigation reaches selected section");
  check(app.calls.at(-1).behavior === "auto", "Keyboard click is immediate");
  check(d.activeElement.id === "work-title", "Heading receives focus");
  d.getElementById("menu-toggle").click();
  check(d.getElementById("site-menu").open, "Menu opens");
  check(d.body.classList.contains("menu-open"), "Menu scroll lock");
  check(d.getElementById("menu-toggle").getAttribute("aria-expanded") === "true", "Menu expanded state");
  d.getElementById("site-menu").dispatchEvent(new app.window.Event("cancel", { cancelable: true }));
  await flush();
  check(!d.getElementById("site-menu").open, "Escape closes menu");
  check(!d.body.classList.contains("menu-open"), "Menu scroll lock clears");
  d.getElementById("menu-toggle").click();
  d.querySelector(".menu-nav a[href='#experience']").click();
  await flush();
  check(!d.getElementById("site-menu").open && app.calls.at(-1).id === "experience", "Menu navigation closes and reaches section");
  d.getElementById("motion-toggle").click();
  check(d.documentElement.classList.contains("reduced-motion"), "Motion toggle off");
  check(app.window.localStorage.getItem("firegram-motion") === "off", "Motion setting persists");
  d.getElementById("motion-toggle").click();
  check(d.documentElement.classList.contains("motion-enabled"), "Motion toggle on");
  check(!script.includes("wheel") && !script.includes("touchmove"), "No scroll interception");
  check(!/transition:\s*all/.test(fs.readFileSync(path.join(base, "styles/portfolio.css"), "utf8")), "No blanket CSS transitions");
  app.dom.window.close();

  for (const options of [
    { reduced: true }, { storage: "off" }, { brokenStorage: true }, { dialog: false },
    { observer: false }, { proof: false }, { hash: "#/about" }, { hash: "#/strengths" }, { hash: "#/%invalid" }
  ]) {
    const fallback = boot(options);
    await flush();
    if (options.reduced || options.storage === "off") {
      check(fallback.document.documentElement.classList.contains("reduced-motion"), "Reduced-motion initial mode");
      check(fallback.document.querySelectorAll("[data-reveal]:not(.is-visible)").length === 0, "Reduced-motion content visible");
    }
    if (options.reduced) check(fallback.document.getElementById("motion-toggle").disabled, "System reduced motion takes priority");
    if (options.dialog === false) check(fallback.document.querySelector(".desktop-nav").classList.contains("fallback-nav"), "Dialog fallback navigation");
    if (options.observer === false) check(fallback.document.querySelectorAll("[data-reveal]:not(.is-visible)").length === 0, "Observer fallback visible");
    if (options.proof === false) check(fallback.document.getElementById("proof-list").textContent.includes("archive"), "Missing data fallback");
    if (options.hash === "#/about") check(fallback.calls.at(-1).id === "about", "Legacy route preserved");
    if (options.hash === "#/strengths") check(fallback.calls.at(-1).id === "strengths", "Legacy strengths link preserved");
    fallback.dom.window.close();
  }
  console.log("PASS: " + assertions + " portfolio checks.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
