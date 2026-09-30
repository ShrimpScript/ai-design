# Brand, advanced typography & graphic design

Use this when the brief says "no brand yet", "create a light identity", or the surface is brand-led (marketing, launch, portfolio). A brand here is a **small system**: name, mark, wordmark, palette, type, voice, and 1–2 graphic devices. Output it as `.design/brand.json` and run `node scripts/brandboard.mjs`. That produces one board image plus `og.png`, `favicon.svg`, `mark-ink.svg`, `mark-light.svg`, and `tokens.css`.

## 1. Find the metaphor (5 minutes, before drawing anything)
Write 3 candidate metaphors from the product's **mechanism**, not its category. "We host AI" gives cloud, brain, sparkle, which are all clichés. "You bring subscriptions you already own and we hold them safely" gives keys, a keyring, a coat check, a locker. Pick the one that:
- explains the product in one glance (it could be the hero object),
- yields a simple shape that survives at 16px,
- nobody in recon's competitor set already uses.

## 2. Mark
- Draw **2–4 candidates** as inline SVG in a 32×32 viewBox and render them at 96/48/32/16px on light and dark (the brandboard "favicon test" does this). Reject any that:
  - read as a common UI icon (ring + handle = search, padlock = security, cloud + keyhole = every security vendor, chat bubble, sparkle, brain, circuit, hexagon, infinity loop, swoosh, generic letter-in-rounded-square),
  - turn to mush at 16px,
  - need colour to be recognised (it must work in one colour).
- Construction: 2–3 primitives, one stroke weight (≈ 10–11% of the box), shared corner radius, one accent part at most. Use `fill="currentColor"` for ink parts and `class="acc"` for the accent part. Cut holes with `fill-rule="evenodd"` so the background shows through; never paint a hole white.
- Clear space ≈ mark height ÷ 1.5. Minimum size 16px (favicon).

## 3. Wordmark and lockups
- Set the name in the brand face at display optical size, weight 550–700, tracking −0.02 to 0em (never tighter), and case chosen on purpose (lowercase = approachable, caps = institutional). Check the letter pairs that break (`rn` → `m`, `cl` → `d`, `ll`, `ff`) and kern by hand if needed.
- Lockups: horizontal (mark left, gap ≈ 0.45em), stacked (for avatars), and mark-only. Test each on paper, on dark, and on the accent colour.

## 4. Palette as a system (checked by `palette.mjs` / brandboard)
- **Roles, not swatches:** paper/surface, ink/ink-2, line, one **accent** plus an `accent-ink` shade for text on light, status colours, and data/categorical colours if the product has categories.
- Build it in OKLCH. Tint neutrals toward the accent's hue (C ≈ 0.005–0.015). Keep accents within ~2× chroma of each other. Separate saturated complements by ΔL ≥ 0.25.
- The source is the metaphor's physical world: brass keys, thermal paper, night sky. Not "tech = blue" or "AI = purple".
- The audit flags AI palettes (purple pair, cream + clay, black + acid, cyberpunk cyan + magenta, pastel rainbow) and awkward ones (muddy mid-tones, vibrating complements, neon pairs, intensity mismatch, > 3 accents, warm/cool grey mix, near-duplicate tokens, low-contrast text).

## 5. Advanced, integrated typography
Type is part of the image, not a caption on it. Pick 1–2 of these per project, not all:
- **Variable axes as expression:** Google Sans Flex has `ROND` (roundness 0–100), `opsz`, `wdth`, `wght`, and `slnt`; Mona Sans has `wdth`. Round the display (`"ROND" 100`), keep text at `"ROND" 0–40` for crispness, and match `opsz` to size. Animate an axis only on interaction (hover `wght` +60, 160ms).
- **Numerals as graphics:** big `tabular-nums` figures (prices, hours, counts) in the display face, with the unit in the text face at 40% size.
- **Optical details:** `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs, `hanging-punctuation: first` where supported, `font-feature-settings` for `ss01`/`cv**` alternates the face offers, `font-variant-numeric: tabular-nums` in tables and prices, and `initial-letter` only in editorial.
- **Type + object:** let the headline and the hero object share a baseline or a grid line, or let the object overlap one word by ~10%. That is integration, not decoration.
- **Mixed-case labels over tracked caps.** If caps carry real information (a status), track them +0.04em and keep them ≥ 12px.
- **Code and IDs:** a mono from the same family as the text face where one exists (Google Sans Code, Red Hat Mono, Geist Mono only with a reason).
- Limits: ≤ 7 sizes, ≤ 3 weights, tracking never tighter than −0.025em, weights < 300 only above 48px.

## 6. Graphic devices (choose 1–2, derived from the metaphor)
Shape language (the mark's corner radius reused on buttons and cards), a pattern from the mark (tag holes, key teeth, contour lines), one hero object (2D or 3D, see `3d.md`), and illustration rules (one stroke weight, the brand palette only, no gradients unless material). Every device must appear at least 3 times or it isn't a system.

## 7. Awkward branding: reject on sight
- **Names:** Nexus, Synapse, Nova, Quantum, Aether, Lumina, Neura/Cogni-, anything-AI, "-ify/-ly" suffixes stacked on a generic noun, names that need the logo to be understood.
- **Personality mismatch:** a playful mark with enterprise copy (or the reverse), a round friendly face on a compliance tool with a stern voice, or copy that doesn't sound like the logo looks.
- **Too many brand colours**, or a mark that relies on a gradient; a logo that only works large; a mascot nobody asked for.
- **Borrowed identity:** looking like a competitor measured in recon (same colour + same face), or like a big platform (Google-blue/red/yellow/green rainbows, Apple minimal clones). When referencing third-party products, use their names as plain text, never their logos or colours, and state compatibility, not partnership.
