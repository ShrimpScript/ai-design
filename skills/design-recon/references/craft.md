# Craft: the visual layer (build it, don't just avoid slop)

`slop.md` subtracts. This file adds. A blind A/B showed that a correct, accessible and plain app loses its first impression to one with a display serif and drawn pots. **Quick mode cuts process, never craft.** Every build ships the five layers below, sized to the context. `shoot.mjs` measures the first screen (`Craft:` line) and flags `FLAT TYPE`, `ONE VOICE` and `NO SIGNATURE VISUAL`.

## The five layers (every build)
1. **Type as image.** A display face with character, paired with a UI/text face (or one family used at its extremes: `opsz`, `wdth`, `ROND`, weight 400 vs 800). The key line is ≥ 3× body, ideally 4–6× on marketing pages. It is a data-driven sentence where possible ("Two plants need water today."), not a slogan.
2. **A signature visual from the subject**, on the first screen, that **carries information** (state, quantity, progress) rather than decorating. Choose its medium below.
3. **Item graphics.** Each repeated object (a plant, a ticket, a server, a shift) gets its own drawn representation, generated from its data: its kind sets the shape, and its state sets the fill, colour or pose. Never one generic icon repeated.
4. **Motion that shows change.** One orchestrated moment (a first-load sequence or a hero loop), plus state motion where the graphic reacts: the water rises, the leaf perks up, the ticket slides to "done". Spring or 300–500ms eased, and instant under `prefers-reduced-motion`.
5. **Material and light.** Surfaces come from the subject's materials (glazed ceramic, kraft paper, frosted acrylic, brushed metal): tone steps, a consistent light direction, a subtle grain or highlight. There's one light source across the SVG, the 3D and the CSS shadows.

**Guardrails (from blind judging):**
- **The visual never costs the task.** On a 390px screen, the key line, the signature visual and the first actionable item all fit in the first screen. Make a compact phone version of the visual (the 3 most urgent objects, ≤ 35% of the screen height, no sideways-scrolling hero). `shoot.mjs` flags `TASK BELOW FOLD`.
- **Every encoding reads without a legend, or it carries a label.** A bar or fill needs its meaning in words nearby ("water left", "3 of 7 days"), and colour and length must not contradict each other.
- **The display face is for the key line, numbers and object names.** Heavy display type on every heading reads as loud (round 1).
- **One face per heading level, applied everywhere.** Mixing a display H2 in one section and a sans H2 in the next reads as "two systems" (round 2). Pick a level (e.g. H1 and H2 display, H3 and below text) and never break it.
- **Keep the subject's temperature.** Avoiding the cream + clay cliché must not produce a clinical palette. A bakery in grey-teal read as "cold" to 2 of 4 judges. Choose a *different* warm family (crust browns, rye, wheat, butter) rather than a cool one.
- **On phones, the commit step follows the user.** When a list feeds a bag, cart or form, show a sticky summary bar ("3 loaves · £13.20 · Reserve") instead of placing the form after the whole list.
- **The hero visual doesn't duplicate the section below.** If the hero shows the items, the list below adds detail (or the hero *is* the list).
- **One clock drives everything on screen (round 3).** In a data motion graphic, the caption, map, counters and chart read the same state at every frame. Judges caught a story caption saying "T+8 h" beside a map at T+27 h, and a counter disagreeing with its own histogram. Derive each label from the value being drawn, never from a separate step index. Check by pausing at 3 random scroll positions.
- **Legible before moody.** A map or chart encodes magnitude with area and a colour ramp over enough context (basemap, labels, a legend in words). Brighter lines on a dark void looked striking, but judges found them less trustworthy than a plainer depth heatmap on a light map.
- **The page transition carries the brand.** A plain fade to blank reads as "no transition". Use the brand device: a waterline wipe, the mark morphing, the clicked card expanding (`patterns.md` § Page-to-page).
- **Big quotes get a wide measure.** Display-size pull quotes need 20–30ch and a wide column. In a narrow column they wrap into a tower.
