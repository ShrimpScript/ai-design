# Contexts: what changes per kind of project

Read only the section for this brief.

## A. Product / SaaS app (people use it repeatedly)
**Goal:** speed of the core task and legibility at a glance, with a crafted first screen (`craft.md`). Brand chrome stays quiet; the craft layer does not.
- **Lead with the work object**, not a greeting or KPI cards. A scheduler opens on the schedule, a CRM on the pipeline, an editor on the document.
- **Density follows frequency.** Daily tools: 13–14px UI text, 28–32px controls, 4px base grid, tables. Occasional tools: 15–16px, more guidance.
- **Numbers live in context.** Put the labour cost in the day's column header, not in a "Total Cost" card with an icon and a "+12%" pill.
- **Colour is semantic first.** Neutral surfaces, one brand accent for primary action and selection, and status colours reserved for status. Distinguish categories by position or label as well as hue (colour-blind safe).
- **Elevation:** use borders or tone steps for structure. Save shadows for things that float (menus, dialogs, drag ghosts).
- **First load shows the product working:** labelled example data ("Example plants — clear"), never an empty screen that explains what the app would do.
- **States are the design.** Empty (it teaches the first action), loading (skeleton matching the final layout), error (what happened and the fix), partial, no-permission, long names, 0 / 1 / 1,000 items.
- **Keyboard:** visible focus, a logical tab order, Esc closes, Enter confirms, and shortcuts for power actions.
- **Motion** is 100–200ms for controls and functional: it shows where something went or what changed. The exception is the object graphics, which react to actions (300–500ms or a spring). No entrance choreography on every section.
- **Distinctive even when utilitarian:** a blind A/B showed that a usable but plain app loses to a characterful one on first impression. Required:
  - a display-face key line;
  - a **signature visual** that shows state (a 3D or illustrated hero object for the most urgent item, the water level as a pot's fill);
  - **drawn item graphics** per object, from `draw(kind, state)`, not a generic icon (`craft.md`);
  - an accent taken from the subject, not the framework blue (`palette.mjs` flags `default-blue`).
- **Where brand shows:** the type choice, the one accent, iconography style, empty-state illustrations or copy, the logo mark, and the loading moment.
- **Recon targets:** the product's public screens (docs screenshots, changelog, templates gallery, help centre), pricing and signup flows, and public design systems (Primer, Polaris, Carbon, Atlassian, Radix, GOV.UK) for component anatomy.
- **Slop to avoid in apps:** "Welcome back, Name 👋"; four identical stat cards; sidebar icons in coloured tiles; gradient area charts; avatar stacks; everything in cards; charts nobody asked for.

## B. Brand / marketing site (it must persuade and be remembered)
**Goal:** a distinct identity, one clear story, and a remembered moment.
- **Hero = the most characteristic thing in the subject's world**: the product working (a real screenshot or a live demo), an object, a sentence, or a number that matters. Not a centred headline over a blurred gradient.
- **Typography carries identity.** Pick a display face with a point of view (or one family with strong width/weight contrast), set tight, and let type be image.
- **One narrative:** problem in the user's words → the product doing the thing → proof (real customers, real numbers) → one action.
- **If the brand is missing, make a light one** (in the brief): wordmark treatment (face, weight, tracking), a palette pulled from the subject's physical materials, and a voice (3 IS / 3 IS NOT).
- **Performance is design:** LCP under 2.5s, font preload, images sized, and no animation library for one fade.
- **Recon targets:** 2 direct competitors (to be different from them), 2 adjacent-world sites (materials, culture, print), and 1 motion reference if a signature moment is planned.
- **Deliver as well:** OG image, favicon, and a 404 page in the same voice.

## C. Content / ad-supported (people read, ads pay)
**Goal:** reading comfort plus ad revenue without eroding trust.
- **Reading:** 17–20px body, 1.5–1.7 line height, 60–75ch measure, a strong heading scale, and dates and bylines visible.
- **Reserve ad space** with fixed `min-height` per slot, so ads cause no layout shift (CLS < 0.1).
- **Standard slots (IAB):** 300×250 and 336×280 (in-content/sidebar), 728×90 and 970×90/250 (leaderboard/billboard), 300×600 and 160×600 (sidebar), 320×50 and 320×100 (mobile). Choose per breakpoint.
- **Better Ads Standards (Coalition) must be avoided:** pop-ups; prestitials with countdown; auto-play video with sound; flashing ads; large sticky ads (> 30% of the viewport on mobile); ad density > 30% of the mobile main content; full-screen scroll-overs.
- **Label every ad** ("Advertisement" / "Sponsored"), visually separate it from editorial, and never style ads as content or place them where people will misclick next to navigation.
- **Consent (CMP) banner:** "Reject all" is as easy to reach as "Accept all" (GDPR/UK), with no pre-ticked boxes and no dark patterns.
- **Rhythm:** first in-content ad after paragraph 2–3, then every ~5–6 paragraphs; a sidebar sticky ad only on wide screens.
- **Recon targets:** publishers in the same vertical. Recon reports ad slots (size, IAB match, y-position, sticky). Map them as a pattern, not a copy.

## D. Personal / portfolio / experimental (it expresses someone)
**Goal:** personality and one strong idea, executed well.
- Take real risk on one axis (type, layout, interaction, or colour) and keep the rest disciplined.
- **The work is the hero.** Projects show outcomes and process images, not "Passionate developer who loves to code".
- No fake metrics, skill-percentage bars, or tech-logo walls.
- Motion can be the signature here, but still respect reduced motion.
- Keep scope tiny: one page done beautifully beats five pages done generically.
- **Recon targets:** designer portfolios and curated galleries (see `sources.md`), plus something from the person's own world (a hobby, city, or material).

## Cross-cutting: quality floor, never announced
Responsive down to 360px, WCAG AA contrast, visible focus, `prefers-reduced-motion`, a `prefers-color-scheme` decision (support it, or deliberately choose one theme), real alt text, 44px touch targets on mobile, and no horizontal scroll.
