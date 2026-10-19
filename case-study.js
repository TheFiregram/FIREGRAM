(() => {
  "use strict";
  const all = window.FIREGRAM_CASE_STUDIES || {};
  const key = new URLSearchParams(window.location.search).get("project") || "walletgpt";
  const item = all[key] || all.walletgpt;
  const root = document.getElementById("case-content");
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  document.title = item.title + " · Firegram case study";
  document.querySelector('meta[name="description"]').content = item.intro;
  root.replaceChildren();
  const back = el("a", "case-back", "← Back to selected work"); back.href = "index.html#work";
  const kicker = el("p", "case-kicker", item.type + " / Case study");
  const title = el("h1", "case-title", item.title);
  const intro = el("p", "case-intro", item.intro);
  root.append(back, kicker, title, intro);
  if (item.visual) { const figure = el("figure", "case-visual"); const img = el("img"); img.src = item.visual; img.alt = item.title + " project visual"; img.loading = "eager"; figure.append(img); root.append(figure); }
  const grid = el("div", "case-grid");
  const problem = el("section"); problem.append(el("h2", "", "The problem"), el("p", "", item.problem));
  const work = el("section"); work.append(el("h2", "", "What I did")); const ul = el("ul"); item.work.forEach(line => ul.append(el("li", "", line))); work.append(ul);
  const outcome = el("section"); outcome.append(el("h2", "", "What it demonstrates"), el("p", "", item.outcome));
  grid.append(problem, work, outcome); root.append(grid);
  const actions = el("div", "case-actions");
  if (item.live) { const a = el("a", "", "Open project / supporting work ↗"); a.href = item.live; a.target = "_blank"; a.rel = "noopener noreferrer"; actions.append(a); }
  if (item.source) { const a = el("a", "", "View source code ↗"); a.href = item.source; a.target = "_blank"; a.rel = "noopener noreferrer"; actions.append(a); }
  root.append(actions, el("p", "case-note", "This case study describes the scope and work honestly. No unverified performance figures or client quotes are used."));
})();