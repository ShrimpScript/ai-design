# Fonts

## Choosing
1. State the job first: dense data (tall x-height, tabular figures, clear 1/l/I), long reading (a comfortable text cut, a serif option), display identity (character at large sizes), or brand match.
2. One family with real range (weights plus a width or optical-size axis) beats two faces fighting. If you use two, make them clearly different (a serif display + sans text, or a condensed display + a normal text cut).
3. Check the details before committing: tabular numerals (`font-variant-numeric: tabular-nums`), language coverage, italics, and variable axes.
4. Set the scale from a ratio: 1.2 for dense apps, 1.25–1.333 for marketing, larger for display-led pages. Cap it at ~7 sizes.
5. Tracking: tighten large display text (-0.01 to -0.03em), and leave body text at 0. Use line-height ~1.1 for display, 1.4–1.6 for UI and body.

## Defaults to avoid (unless the brief chooses them for a stated reason)
Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, DM Sans, Space Grotesk, Plus Jakarta Sans, Outfit, Geist, Playfair Display, Instrument Serif, and a system-font-only stack on a brand site. These are good fonts, but they are what every generated page uses. If you keep one, add `lint-allow: default-font` to the brief with the reason.

## Free faces with character (starting points, not a new default list)
- **Sans:** Archivo (width axis 62–125), Schibsted Grotesk, Hanken Grotesk, Familjen Grotesk, Public Sans, Figtree, Albert Sans, Onest, Rethink Sans, Bricolage Grotesque (optical-size axis), Instrument Sans, Mona Sans / Hubot Sans (width axes), Atkinson Hyperlegible Next (legibility)
- **Fontshare (ITF free licence):** Satoshi, General Sans, Switzer, Cabinet Grotesk, Clash Display, Zodiak, Erode, Sentient, Supreme, Chillax
- **Serif:** Newsreader (opsz), Source Serif 4 (opsz), Literata, Fraunces (opsz/soft, used a lot lately), Young Serif, Gloock, Bodoni Moda, Libre Caslon, Spectral, Petrona
- **Mono (only where it helps):** JetBrains Mono, IBM Plex Mono, Commit Mono, Martian Mono, Geist Mono
- **Condensed / display:** Barlow Condensed, Big Shoulders, Oswald (overused), Antonio, Bebas Neue (overused), Anton

## Recon saw a commercial face → free approximations
| Commercial (seen in recon) | Closest free options |
|---|---|
| Söhne | Hanken Grotesk, Schibsted Grotesk |
| Circular / Cera | Figtree, Outfit |
| GT America / Graphik | Public Sans, Instrument Sans |
| Neue Haas / Helvetica Now | Albert Sans, Archivo (wdth 100) |
| Aeonik / ABC Diatype / PP Neue Montreal | Switzer, General Sans, Satoshi |
| Founders Grotesk / Maison Neue | Familjen Grotesk, Schibsted Grotesk |
| Proxima Nova / Gilroy | Figtree, Onest |
| Futura | Jost |
| Tiempos / Lyon | Newsreader, Source Serif 4 |
| GT Sectra / Canela / PP Editorial New | Fraunces (high opsz), Gloock, Young Serif |
| SF Pro | the system stack on Apple, else Inter (with a reason) |
| Berkeley Mono / Söhne Mono | Commit Mono, JetBrains Mono |
These are approximations: match proportion and mood, then judge at real sizes. Never download or self-host a commercial file found during recon.

## Fetching and loading
```
node scripts/fetch-font.mjs "Archivo:wdth,wght@62..125,100..900" --out public/fonts
node scripts/fetch-font.mjs "satoshi@400,500,700" --provider fontshare --out public/fonts
```
It writes woff2 (latin + latin-ext) plus `fonts.css` with `font-display: swap`. Import that CSS, preload the one file used above the fold, and set a metric-compatible fallback (`size-adjust` or `@fontsource`-style fallback) if CLS matters. In Next.js, `next/font/google` or `next/font/local` do the same. `shoot.mjs` reports families that fell back to a system font.
