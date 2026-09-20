# Cinematic rebuild / September 2026

## Brief and architecture

Hero: large condensed type over the original titanium sculpture, now styled in greyscale. The supplied portrait sets the palette: charcoal from the jacket, cool grey from the background, and a restrained warm accent. Centered composition, small wordmark navigation, one main action.

Page read: a portfolio intended to prompt exploration and useful conversations. The visitor needs to see what Firegram builds, inspect the evidence, and know how he works. Existing products, career history, and links remain the source of truth. No invented client logos, endorsements, or performance metrics.

Sequence: hero; About me with the supplied portrait; Proof of work with WalletGPT first, GRAMVERTER second, and RiskMulate third; the work archive in the same chapter; experience; contact; a footer with 2026 Firegram and Back to top. About is section 01 and Proof of work is section 02.

The bright work section uses cool grey. The other sections use two charcoal tones. Copy follows Firegram’s STE-100 clarity preferences: short sentences, active voice, and concrete descriptions of the work. Arrow controls use one SVG icon. The hero cue rotates the icon down and sits at the bottom centre.

## Skill guides applied

- [VibeCurb hero](https://github.com/Yu-369/VibeCurb/blob/main/skills/awwwards-hero/SKILL.md): one architecture, clear focal point, typography hierarchy, restricted palette.
- [VibeCurb sections](https://github.com/Yu-369/VibeCurb/blob/main/skills/awwwards-sections/SKILL.md): alternating density, large work imagery, varied scales, visual break, single final action.
- [VibeCurb motion](https://github.com/Yu-369/VibeCurb/blob/main/skills/awwwards-motion/SKILL.md): cinematic personality, three easing tokens, limited signature effects, accessible fallbacks.
- [Dean W. Perkins reference](https://x.com/deanwperkins/status/2095271382783328463): the linked post advertises a cinematic website video tutorial. No skill pack was linked in the visible post. The full video workflow was not verified or copied.

These guides were read and applied to this rebuild, not installed as executable project dependencies or global skills.

## Motion map

| Element | Action | Timing |
| --- | --- | --- |
| Hero labels, heading, copy, CTA | Staggered opacity and 24px rise | 500ms each; total sequence 740ms |
| Hero sculpture | Small scroll-linked translate and scale | One scroll-scheduled animation frame, stops outside hero |
| Scroll cue | Down arrow moves 6px and returns | Three 1.4s cycles; reduced-motion aware |
| Sections and images | One-time rise/fade; image inset reveal | 650–750ms |
| Anchor links | Native smooth scroll | Browser controlled; immediate from keyboard |
| Full-screen menu | Clip entrance and short fade exit | 380ms entrance / 160ms exit |
| Work links and arrows | Image scale and arrow movement | 240–650ms |
| Proof filters | Short entrance on visible records | 350ms; capped 35ms stagger |
| Reading progress | Transform-based progress line | Scroll frame only |

No wheel or touch scroll hijacking. No artificial loader, sound, perpetual animation, or new runtime library. Native dialog handles focus containment and Escape. Anchors focus the destination heading. System reduced motion wins over the stored user preference; the menu can disable motion independently.

## Asset provenance

Barlow Condensed and Manrope are served locally, preloaded, and subset for this page's Latin text, punctuation, and arrows. Their SIL Open Font License files are in `assets/fonts/`. The condensed display fallback is sized to prevent heading overflow during font loading.

The three work images were captured from the real live sites on 2026-09-19:

- https://riskmulate.vercel.app
- https://wallet-gpt-2.vercel.app
- https://gramverter.vercel.app

They are saved product captures, not interactive embeds. Currency values in the GRAMVERTER capture are historical screen content.

The portrait was supplied by Firegram on 2026-09-20. The original JPEG is unchanged. `assets/firegram-portrait.webp` is a 1122 × 1402 WebP copy, compressed for delivery. No crop, face edits, or generated replacement was used.

The hero image was created with the built-in image-generation tool. Project asset: `assets/hero-sculpture.webp`. Source output was optimized to WebP for delivery. No generated image is presented as a product screenshot.

### Final hero prompt

Use case: stylized-concept
Asset type: full-bleed cinematic hero background for Firegram, a creative builder's portfolio
Primary request: a gallery-grade, photorealistic sculptural study of one continuous folded ribbon of dark brushed titanium, its finely machined edges catching a warm burnt-copper light, suspended in a vast near-black studio. The silhouette evokes a rising flame without depicting a literal flame. A monumental folded form, bold and elegant, not a torus, sphere or generic abstract blob.
Composition: widescreen 16:9, the sculpture rises vertically through the middle-right portion, taking about 55% of the frame height, leaving substantial dark negative space across the image for very large centered website typography. The edges curve through space with one sharp fold and precise grazing light. Far below, a faint soft shadow anchors it. Use restrained warm haze only near the object, deep matte charcoal at all outer edges, filmic grain and strong sculptural contrast.
Palette: near-black charcoal, muted copper highlights, tiny silver specular edges. No purple, blue or neon colors.
Style: high-end editorial CGI still, physically rendered metal surface with hairline brushing, cinematic gallery lighting, crisp crafted detail, subtle depth of field, quiet monumental mood.
Constraints: no text, no lettering, no logo, no watermark, no UI, no particles, no sparks, no other objects, no bright background, no glossy plastic.

## QA

The DOM suite checks structure, linked assets, proof filters, navigation and focus, menu state, legacy hashes, motion preference, and unavailable browser feature fallbacks.

The same-origin responsive fixture at `tests/responsive.html` provides actual 320, 390, 768, and 1280 CSS-pixel layouts for browser inspection. It is marked noindex and is not linked from the portfolio.
