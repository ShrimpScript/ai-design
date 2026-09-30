# Brief — Tollgate Bakery weekend pre-orders

Mode: Quick (no human available). Assumptions: fictional neighbourhood bakery "Tollgate Bakery", 14 Tollgate Road, UK (British spelling, £). One page: see this weekend's bake, reserve loaves for Saturday or Sunday pickup, pay at the counter. Orders close Thursday 20:00. Static file, no backend: the order is held client-side and confirmed on screen.

## Recon (2 refs)
- Steal — poilane.com: product tiles show the loaf itself on a pale tone step (#faf8f6 / #eee9e3), 1px ink borders instead of shadows (19×1px borders), 0px radius buttons; slow eases cubic-bezier(0.86,0,0.07,1) 500ms. Fits: bread is the hero, not people.
- Steal — e5bakehouse.com: one deep enamel blue-teal (#225263) as the only strong accent on a light ground. Fits: bakery tiles/enamel, avoids cream+terracotta.
- Avoid — both: all-caps display everywhere, 14px body (e5), photo hero with blurred person, cookie banners covering task. We have no photography, so drawn loaves instead.

## Tokens
Colour: flour #F4F5F1 (bg) · tile #E3E8E4 (surface step) · ink #1D2427 · ink-soft #4E5A5E · enamel #1F5468 (primary/action) · crust #8C4A1E (prices, crust text) · wheat #E2B456 (highlight only, never text) · line #1D242726
Type: Caprasimo (display: key line, numbers, loaf names) + Onest 400/600 (UI/text). Scale 16 / 18 / 22 / 28 / 44 / 72 (key line 4.5× body).
Radius: 4 control · 10 card/bag · 999 day toggle. Elevation: 1px lines + tone steps; one shadow for the bag sheet.
Motion: 450ms cubic-bezier(.2,.8,.2,1); instant under reduced motion.

## Layout
[header: wordmark | This weekend | How it works | Find us | "Order by Thu 8pm" pill]
[hero: key line + sub + CTA (left 5/12) | bake rack SVG, 5 loaves on a board, "x left" under each (right 7/12)]
[order: day toggle Sat/Sun · loaf rows (drawn loaf, name, crumb note, £, stock bar, stepper) | sticky bag: items, pickup slot, name, phone, reserve]
[the week of a loaf: Thu 20:00 close → Fri levain & mix → Fri night cold proof → Sat 04:30 bake → Sat 08:00 pickup] (real sequence)
[find us: address, hours, leftovers walk-in shelf; footer]

## Craft
Display: Caprasimo for key line, loaf names, counts · Text: Onest · Key line: "38 loaves left for Saturday." at ~4.5× body (live from stock data)
Signature: parametric SVG bake board — every loaf in this weekend's bake drawn on a bread board, count left under each, fed by the same stock data as the order list; decrements live as you add to the bag.
Item graphics: drawLoaf(kind, state, size) — silhouettes: boule (round, cross score), batard (oval, single ear), baguette (long, 5 slashes), rye tin (box in tin, seeds), cardamom buns (3 knots). State: plenty / low (≤5, wheat ring) / sold out (flat grey, no crust tone).
Motion: moment = loaves "rise" (scaleY .82→1, staggered) on load; state = count ticks down, loaf mini drops into bag.
Material/light: crust tones (3 steps) + flour dust dots, oak board, kraft bag; light from top-left.
Slop pre-check: no cream+terracotta, no 3-up icon cards, no eyebrows, sentence case, numbered markers only in the real timeline.
