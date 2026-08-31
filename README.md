# FIREGRAM PORTFOLIO

A single-page portfolio for FIREGRAM / Olayemi Qudus.

## Structure

- `index.html` · page content and sections
- `styles.css` · liquid-glass UI, responsive layout and visual effects
- `script.js` · animation, filters, optional interface sound and ambient canvas
- `proof-data.js` · Proof of Work entries
- `assets/firegram-profile.webp` · profile portrait

## Add Proof of Work

Open `proof-data.js` and add an object to `window.FIREGRAM_PROOF`.

```js
{
  title: "Name of proof",
  category: ["product", "software"],
  type: "Case study",
  description: "Short explanation of what the proof demonstrates.",
  link: "https://...",
  linkLabel: "Open proof",
  visual: "code",
  media: "assets/proof/example.jpg",
  mediaType: "image",
  mediaAlt: "Description of the proof image"
}
```

For a video, set `mediaType: "video"` and point `media` to an MP4 or browser-playable video file. Leave `media` out to use the built-in visual placeholder.

Supported filters: `product`, `ai`, `software`, `community`, `web3`, `creative`, `teaching`.

## Run locally

Any static server works:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment

This is a static site and can be deployed directly to Vercel, Netlify or GitHub Pages.
