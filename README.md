# Firegram portfolio

A cinematic, continuous-scroll portfolio for Firegram / Olayemi Qudus.

## Current source

- `index.html`: complete semantic page, navigation, work, about, proof, experience, and contact.
- `styles/portfolio.css`: the design system, responsive layouts, motion, and print styles.
- `portfolio.js`: accessible menu, native anchor navigation, progressive reveals, motion preference, and proof filters.
- `proof-data.js`: nine editable proof records and their original links.
- `assets/firegram-portrait.webp`: the supplied portrait, optimized for the web.
- `assets/hero-sculpture.webp`: original generated editorial artwork.
- `assets/fonts/`: preloaded, self-hosted fonts and their license files.
- `assets/riskmulate.webp`, `assets/walletgpt.webp`, `assets/gramverter.webp`: actual product captures.
- `tests/portfolio.test.cjs`: DOM-level regression checks.
- `tests/responsive.html`: noindex, same-origin responsive preview at 320, 390, 768, and 1280 CSS pixels.
- `docs/design-direction.md`: design decisions, motion map, and asset provenance.

The older `app.js`, `script.js`, `sections/`, and previous stylesheets remain for reference. None is loaded by the new site.

Page order: hero, About me, Proof of work, Experience, Contact. Featured work and the archive both start with WalletGPT, GRAMVERTER, then RiskMulate. The footer contains only 2026 Firegram and Back to top.

## Run

No build or production dependency is required. Serve this folder with any static HTTP server, for example:

```bash
python3 -m http.server 4173
```

## Test

Install jsdom 26.1.0 in a separate tools directory, then run:

```bash
JSDOM_MODULE_PATH=/absolute/path/to/tools/node_modules/jsdom node tests/portfolio.test.cjs
node --check portfolio.js
```

The DOM tests model scroll, media queries, dialog, and intersection observation. They do not replace visual browser testing. Open `/tests/responsive` to test actual responsive layouts in an iframe.

## Interaction notes

Native page scroll is never intercepted. Anchor navigation uses smooth scrolling for pointer actions only. Keyboard navigation is immediate and focuses the destination heading. Legacy `#/work`, `#/about`, `#/strengths`, and the other previous section links still resolve.

Motion respects the OS reduced-motion preference. The menu control can disable decorative motion and saves the choice locally. The down arrow moves for three short cycles. No scrolling library, autoplay media, sound, custom cursor, or perpetual animation is loaded.

JavaScript failure leaves the main content and links readable. The proof archive remains available without the interactive filters.

## Deploy

Vercel project `firegram-portfolio` deploys the `main` branch of `TheFiregram/FIREGRAM`. Static hosting configuration is in `vercel.json`.
