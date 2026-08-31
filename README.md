# FIREGRAM PORTFOLIO

Portfolio website for FIREGRAM / Olayemi Qudus.

The site presents product thinking, AI engineering, software engineering, startup product development, community operations, Web3, creative direction, teaching, selected work and Proof of Work.

## Source structure

- `index.html` · readable production entry point and shared navigation/footer shell
- `app.js` · loads the portfolio sections, then starts the POW and interaction scripts
- `script.js` · animations, mobile navigation, card tilt, cursor glow, optional sound and ambient particles
- `proof-data.js` · data-driven Proof of Work entries
- `sections/` · one readable HTML file per portfolio section
  - `hero.html`
  - `intro.html`
  - `strengths.html`
  - `work.html`
  - `proof.html`
  - `experience.html`
  - `experiments.html`
  - `contact.html`
- `styles/base.css` · foundation, navigation and hero styling
- `styles/components.css` · portfolio sections, cards, projects, POW, timeline and contact styling
- `styles/responsive.css` · tablet, mobile and reduced-motion behavior
- `assets/firegram-profile.webp` · portrait asset
- `assets/favicon.svg` · portfolio favicon
- `vercel.json` · Vercel headers and static deployment settings

The old compressed payload build has been removed. The repository now contains the actual editable source used by the site.

## Proof of Work

Add new proof entries in `proof-data.js`. Each entry supports category filters, links, image media and browser-playable video media.

Example:

```js
{
  title: "Name of proof",
  category: ["product", "software"],
  type: "Case study",
  description: "What this proof demonstrates.",
  link: "https://...",
  linkLabel: "Open proof",
  visual: "code",
  media: "assets/proof/example.jpg",
  mediaType: "image",
  mediaAlt: "Description of the proof image"
}
```

Supported filters: `product`, `ai`, `software`, `community`, `web3`, `creative`, `teaching`.

## Featured work

- RiskMulate · browser-based interactive risk-management simulation
- WalletGPT · AI-powered on-chain wallet explainer
- GRAMVERTER · live crypto and fiat conversion product

## Run locally

Use any static web server from the repository root:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment

The site is static and ready for Vercel. `vercel.json` is included in the repository.

Production is connected to the Vercel project `firegram-portfolio` from the `main` branch. A fresh commit after connecting the repository was made to trigger the first Git-based production deployment.
