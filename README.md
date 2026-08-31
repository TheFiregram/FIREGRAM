# FIREGRAM PORTFOLIO

Portfolio website for FIREGRAM / Olayemi Qudus.

The site presents product thinking, AI engineering, software engineering, startup product development, community operations, Web3, creative direction, teaching, selected work and Proof of Work.

## Current repository structure

- `index.html` · production entry point
- `payload-1.js` → `payload-4.js` · compressed production snapshot containing the complete portfolio UI, styling, content, interactions and embedded media
- `vercel.json` · static deployment headers and routing configuration
- `README.md` · project notes

The payload is split across four files so the current production build can be transferred reliably through the connected GitHub integration. The browser reconstructs the full portfolio at load time.

## Included portfolio areas

- Product Thinking & Problem Solving
- AI Engineering
- Software Engineering
- Startup Product Development
- Community Operations
- Web3
- Creative Direction & AI Media
- Teaching & Knowledge Sharing
- Selected Work
- POW / Proof of Work
- Career Experience
- Education
- Experimental Lab

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

Current Vercel naming is temporary while the final `*.vercel.app` alias is being decided.
