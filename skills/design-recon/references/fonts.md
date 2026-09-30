# Fonts

## House preference (default; the brief can override)
**Round, open, regular-width faces at comfortable weights for UI and text, paired with a display face that has character** (§ Pairing). A single round sans on everything reads as a template: a blind judge called it "a Google-Sans-style template". Prefer round bowls, open apertures, soft or rounded terminals, and a generous x-height. Avoid squished type (condensed or narrow families, `wdth` < 95, tracking tighter than −0.025em) and extremely thin weights (< 300 for text, < 300 for display below 48px). `slop-lint` (`condensed-font`, `squished-type`, `thin-type`) and `shoot` enforce this; `specimen` and `brandboard` mark round faces `ROUND ✓`.
- **Round candidates (Google Fonts, verified). Rotate: a house favourite used everywhere becomes the next AI tell** (a blind judge called a Google Sans Flex UI "a Google-Sans-style template"). Specimen at least 3, and never reuse the face from `.design/log.md`'s last project: Google Sans Flex (has a `ROND` roundness axis 0–100 plus `opsz`/`wdth`/`wght`; load it with `family=Google+Sans+Flex:opsz,wdth,wght,ROND@6..144,25..151,100..1000,0..100`), Google Sans, Parkinsans, Gabarito, Rubik, Readex Pro, Varela Round, M PLUS Rounded 1c, Zen Maru Gothic, Red Hat Display/Text, Be Vietnam Pro, Commissioner, Kumbh Sans, Afacad, SUSE, Onest, Albert Sans, Golos Text, Wix Madefor, Rethink Sans, Funnel Sans/Display, Jost, League Spartan.
- **Backups, in order:** (1) Google's own families: Google Sans Flex, Google Sans, Google Sans Code for mono. (2) Anthropic-style: Anthropic's brand faces (the Styrene/Tiempos pairing and its custom Anthropic Sans/Serif) are proprietary, so use free equivalents: Albert Sans or Rethink Sans for the sans, Source Serif 4 or Newsreader for the serif. (3) The round list above.
- Round faces that are **also** AI-default (Nunito, Poppins, Manrope, DM Sans, Outfit, Sora, Urbanist, Lexend, Figtree) still need a stated reason.

## Pairing (display voice + UI text)
The display face gives the product its voice (the key line, big numbers, item names). The text face does the work. They must differ clearly: soft serif + round sans, or wide display + regular text. "Soft" display faces (rounded serifs, ball terminals, soft wedges) satisfy the round preference at large sizes.
| Display (character, soft) | Pairs with (round/open UI) | Mood |
|---|---|---|
| Young Serif | Schibsted Grotesk, Rethink Sans | Warm, botanical, homely |
| Caprasimo (heavy, soft) | Onest, Albert Sans | Friendly, confident, food/retail |
| Corben (round serif) | Golos Text, Hanken Grotesk | Gentle, crafty, hobby |
| Gloock | Hanken Grotesk, Public Sans | Editorial, premium |
| Hedvig Letters Serif | Hedvig Letters Sans | Calm, a matched superfamily |
| Gabarito 800 / Parkinsans 700 | the same family at 400 | Round geometric, one-family range |
| Google Sans Flex (`ROND` 100, `opsz` 144, `wght` 750) | the same family (`ROND` 0, `opsz` 14) | One-family extremes; don't use it plain |
| Funnel Display | Funnel Sans | Modern product, soft grotesque |
| Bodoni Moda (≥ 48px only) | Albert Sans | Luxury, fashion |
Rotate: log the pair in `.design/log.md` and don't reuse it on the next project. Fraunces and Instrument Serif are saturated; use them only with a reason.

## Choosing (in this order)
1. **The job:** dense UI (tall x-height, tabular figures, clear 1/l/I), long reading (a text cut, comfortable spacing), display identity (character at large sizes), code or data (a monospace, only where alignment matters).
2. **Display + text** (§ Pairing), or one family used at its extremes. Two similar sans faces fighting is worse than either.
3. **Check the details:** `tabular-nums`, language coverage, a real italic, and variable axes. Look at it at real size before committing.
4. **Scale:** ratio 1.2 for apps, 1.25–1.333 for marketing, ≤ 7 sizes. Tighten display tracking (-0.01 to -0.03em), and use line-height ~1.05–1.15 for display, 1.4–1.6 for text.

## Tiers (enforced by slop-lint, shoot and recon via `scripts/lib/fonts.mjs`)
- **AI defaults (MED):** Inter / Inter Tight, Roboto, Open Sans, Lato, Arial, Helvetica, Poppins, Montserrat, Space Grotesk, DM Sans, Geist, Plus Jakarta Sans, Outfit, Manrope, Sora, Urbanist, Lexend, Nunito, Raleway, Work Sans, Mulish.
- **Trend-saturated (LOW):** the faces that widely copied "use these instead of Inter" prompt lists made ubiquitous: Clash Display, Satoshi, Cabinet Grotesk, General Sans, Switzer, Bricolage Grotesque, Fraunces, Playfair Display, Instrument Serif, Syne, Unbounded, JetBrains Mono, Fira Code, Space Mono, IBM Plex, Crimson Pro, Cormorant, DM Serif Display, Source Sans 3, Geist Mono, Figtree. They are good faces, but the combination now reads as "an AI picked a font". Use one only when you can name a reason specific to this brief.
- **Condensed / squished (MED):** Oswald, Bebas Neue, Anton, Barlow Condensed, Roboto Condensed, Archivo Narrow, Big Shoulders, Sofia Sans Condensed, Fjalla One, League Gothic, Antonio, Teko, Saira Condensed, and more in `lib/fonts.mjs`.
- **Novelty / genre cliché (HIGH):** cyber and sci-fi (Orbitron, Audiowide, Exo, Rajdhani, Oxanium, Share Tech, Michroma, Syncopate, Tektur, Chakra Petch, Aldrich, Electrolize, Quantico, Russo One, Black Ops One, Wallpoet, Zen Dots, Major Mono Display), pixel/retro (Press Start 2P, VT323, Silkscreen, Pixelify), party/cartoon (Lobster, Pacifico, Bangers, Luckiest Guy, Chewy, Comic Sans/Neue), horror/fantasy (Creepster, Nosifer, Metal Mania, Cinzel Decorative, Uncial Antiqua), glitch/neon (Rubik Glitch, Monoton, Nabla, Bungee Shade). "AI" or "futuristic" is **not** a reason to use a sci-fi face. Futurity comes from restraint, precise spacing, and product proof. Use these only when the brief is literally that genre (a retro game, a horror film).

Keep a flagged face by writing its reason into the brief: `lint-allow: default-font` plus one line, e.g. "Inter: matches the customer's existing product UI".

## Less-worn picks by job (all on Google Fonts, verified 2026-09)
Starting points, not a new default list. Rotate, and don't reuse the previous project's pick (check `.design/log.md`).
| Job | Options |
|---|---|
| UI / product sans | Schibsted Grotesk, Hanken Grotesk, Onest, Rethink Sans, Albert Sans, Public Sans, Golos Text, Host Grotesk, Inclusive Sans, Atkinson Hyperlegible Next (accessibility-first) |
| Display with character | Google Sans Flex (`ROND` 100 at display sizes), Parkinsans, Gabarito, Funnel Display, Wix Madefor Display, Radio Canada Big, Geologica, Familjen Grotesk, Mona Sans / Hubot Sans (keep `wdth` ≥ 100) |
| Serif, reading or editorial | Source Serif 4 (opsz), Literata, Petrona, Spectral, Libre Caslon Text, Brygada 1918, Besley, Newsreader |
| Serif display | Young Serif, Gloock, Bodoni Moda |
| Mono (code, logs, IDs only) | Martian Mono (width axis), Red Hat Mono, Spline Sans Mono, Azeret Mono, Sometype Mono, Reddit Mono |

## Recon saw a commercial face → free approximations
| Commercial | Closest free |
|---|---|
| Söhne, Lausanne | Hanken Grotesk, Schibsted Grotesk |
| Circular, Cera | Onest, Albert Sans |
| GT America, Graphik | Public Sans, Host Grotesk |
| Neue Haas / Helvetica Now | Albert Sans, Archivo (wdth 100) |
| Aeonik, ABC Diatype, PP Neue Montreal | Rethink Sans, Golos Text |
| Founders Grotesk, Maison Neue | Familjen Grotesk, Schibsted Grotesk |
| Proxima Nova, Gilroy | Onest, Radio Canada Big |
| Futura | Jost |
| Tiempos, Lyon | Newsreader, Source Serif 4 |
| GT Sectra, Canela, PP Editorial New | Gloock, Young Serif, Bodoni Moda |
| Berkeley Mono, Söhne Mono | Martian Mono, Red Hat Mono |
These are approximations: match proportion and mood at real sizes. Never download or self-host a commercial file found during recon.

## Fetching and loading
```
node scripts/fetch-font.mjs "Schibsted Grotesk:wght@400..900" --out public/fonts
node scripts/fetch-font.mjs "satoshi@400,700" --provider fontshare --out public/fonts
```
This writes woff2 (latin + latin-ext) plus `fonts.css` with `font-display: swap`. Preload the one file used above the fold. In Next.js, `next/font/google` does the same. `shoot.mjs` prints each family with its tier and flags any that fell back to a system font.
