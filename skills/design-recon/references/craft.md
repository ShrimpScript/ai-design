# Craft: the visual layer (build it, don't just avoid slop)

`slop.md` subtracts. This file adds. A blind A/B showed that a correct, accessible and plain app loses its first impression to one with a display serif and drawn pots. **Quick mode cuts process, never craft.** Every build ships the five layers below, sized to the context. `shoot.mjs` measures the first screen (`Craft:` line) and flags `FLAT TYPE`, `ONE VOICE` and `NO SIGNATURE VISUAL`.

## The five layers (every build)
1. **Type as image.** A display face with character, paired with a UI/text face (or one family used at its extremes: `opsz`, `wdth`, `ROND`, weight 400 vs 800). The key line is ≥ 3× body, ideally 4–6× on marketing pages. It is a data-driven sentence where possible ("Two plants need water today."), not a slogan.
2. **A signature visual from the subject**, on the first screen, that **carries information** (state, quantity, progress) rather than decorating. Choose its medium below.
3. **Item graphics.** Each repeated object (a plant, a ticket, a server, a shift) gets its own drawn representation, generated from its data: its kind sets the shape, and its state sets the fill, colour or pose. Never one generic icon repeated.
4. **Motion that shows change.** One orchestrated moment (a first-load sequence or a hero loop), plus state motion where the graphic reacts: the water rises, the leaf perks up, the ticket slides to "done". Spring or 300–500ms eased, and instant under `prefers-reduced-motion`.
5. **Material and light.** Surfaces come from the subject's materials (glazed ceramic, kraft paper, frosted acrylic, brushed metal): tone steps, a consistent light direction, a subtle grain or highlight. There's one light source across the SVG, the 3D and the CSS shadows.

## Choosing the signature medium
| Medium | Best for | Cost and rules |
|---|---|---|
| **Parametric SVG illustration** | Apps and any subject with physical objects | No dependencies. The default for item graphics |
| **3D object (three.js)** | Brand and marketing heroes, product objects, an app's hero or empty moment, onboarding | ~150 KB, lazy-loaded, with a static poster fallback. One clean object, not a scene. **Must pass `3d.md` (inspect3d plus cross-review)**. In apps, one 3D moment per screen and SVG for the rows, in the same palette and light |
| **Generative / canvas** | Abstract or data-rich subjects (networks, sound, weather, markets) | Seeded, so it's deterministic. It must encode real data |
| **Diagram as hero** | Infrastructure, dev tools, processes | Real nodes and real labels, animated along the true flow (`patterns.md` § diagrams) |
| **Kinetic type** | Brand sites where the name or number is the story | One line, one move. Never a typewriter cycling taglines |
| **Photography / art direction** | Only when real assets exist | Never stock people |

**Pick by fit, and don't skip 3D out of caution.** When a 3D object would make a brand or marketing hero, or an app's hero moment, clearly better, build it and verify it (3D is verified geometrically, so it's safe to attempt). When 3D isn't the right medium, the SVG system must still be rich.

## Parametric illustration system (SVG)
- **One grammar:** the same construction (geometric primitives on a 4px grid, or a single stroke weight), one light direction (top-left highlight, bottom-right shade), 3–5 tones taken from the tokens plus one highlight, and one corner radius.
- **Code, not clip art:** `draw(kind, state, size)` returns SVG.
  - Kinds differ in *silhouette*, not colour alone (monstera: split leaves; fern: fronds; snake plant: upright blades; cactus: ribs).
  - State is visible without reading (water level, soil tone, a droop angle).
- **Level of detail:** readable at 32px (merge small parts, thicker strokes) and at 240px (add highlight, texture and secondary shapes). Build both detail levels from the same function.
- **Composition:** an object sits *on* something (a shadow ellipse, a shelf line, a sill), with scale relationships consistent between items.
- **Avoid:** outline-only generic icons, mixed styles, blob people, gradient meshes as a stand-in for form, and emoji.

## Typography craft
- **Pairing:** (a) a soft or characterful display face plus a round, open UI sans. Clearly different: serif + sans, or wide + regular. (b) One family at its extremes. Candidates are in `fonts.md` § Pairing. Rotate them, and don't reuse the last project's pair.
- **The display line:** optical size at max, line-height 1.0–1.1, `text-wrap: balance`, tracking −0.01 to −0.02em (never below −0.025em), ≤ 16ch per line. Emphasis comes from the *sentence itself*. Don't colour one word.
- **Numbers as type:** the one number that matters (days, cost, count) is set in the display face at 2–4× body. Lists use `font-variant-numeric: tabular-nums`.
- **Hierarchy uses three levers:** face, weight and tone, not size alone. Keep ≤ 7 sizes.
- **Details that read as professional:**
  - Curly quotes, en dashes in ranges, and `&nbsp;` between a number and its unit.
  - `text-wrap: pretty` on body text, `hanging-punctuation: first`, and real italics.
  - The face's stylistic sets (`font-feature-settings: "ss01"`) when they improve legibility.

## Recon for craft (in addition to systems)
Add **1 craft reference** from Awwwards SOTD, Godly or Siteinspire in the subject's medium (illustrated app, 3D product hero, editorial type) and measure it with `recon.mjs` (plus `--motion`). Write **technique** lines in the brief: `Craft — "parametric plant illustrations, 2 tones plus a 1.5px ink line, from <site>"`. Steal *how it's made* (grammar, light, timing, pairing logic), never the art.

## Brief section (required, even in Quick mode)
```
## Craft
Display: <face> for <what> · Text: <face> · Key line: "<data-driven sentence>" at <n>× body
Signature: <medium> — <what it shows and which data drives it>
Item graphics: draw(<kinds>, <states>) — silhouettes: <list>
Motion: moment = <…>; state = <…>
Material/light: <materials>, light from <direction>
```

## Critique on the screenshot
- **Squint test:** at 25% size, is there a shape you'd remember?
- **Name-swap test:** rename the product. If the first screen would fit any to-do app, the craft layer is missing.
- **Side-by-side:** put the best reference's shot next to ours. Is ours at least as crafted? If not, fix the weakest layer first (usually the signature visual, then type).
