# Patterns: heroes, scroll, page transitions, in-page updates

Measure before you design motion: `node scripts/motion.mjs <exemplar> <competitor>` gives reveal values, timings, scroll-linked and pinned elements, GSAP/ScrollTrigger configs, page-transition type, and tab/toggle/accordion behaviour. Copy the **numbers and the restraint**, not the choreography. Motion recon takes 20–120s per site, so start it in the background alongside `recon.mjs`.

## Hero: clean, specific, complete at rest
Recon's `## Hero` line measures this anatomy on references. Targets for a clean SaaS hero:
- Headline 4–9 words in ≤ 2 lines. It says what changes for the user, not what the product "is". Subhead 80–160 chars.
- **One** primary action, and at most one quiet secondary. Name the action ("Replay a past incident"), not "Get started".
- The product is visible in the first viewport: real UI, a live demo, or its output. No abstract art standing in for the product.
- Eyebrow only when it carries news (a dated launch), and a logo strip only if the logos are real.
- It is complete at rest: nothing important waits on an animation, and the LCP element is text or a sized image.

| Pattern | Use when |
|---|---|
| **Product-as-hero**: UI beside or under the headline | Tools people operate (dashboards, editors) |
| **Live demo**: the visitor runs it on a sample | AI products: proof beats adjectives |
| **Output-as-hero**: show the result (the report, the fix, the email) | The output is the value |
| **Statement**: type only, brand-led | The product isn't visual; strong copy |
| **Scroll scene**: a pinned scene that transforms | The story has 3–6 real steps. The most expensive option |

AI-SaaS hero slop: glowing orb, neural-net or particle background, sparkle icon, a typewriter cycling buzzwords ("for sales / for support / for …"), a chat bubble saying "How can I help you today?", purple-to-blue glow, and a fake dashboard of random charts.

## Scroll transitions
**Budget:** one scroll-linked signature per page, plus reveals on at most ~3 content groups. Everything else is static. (Linear measures 2 reveals on the whole homepage.)

| Kind | Recipe | Notes |
|---|---|---|
| Reveal (enter once) | opacity 0→1 plus y 12–24px→0, 400–700ms, ease-out, stagger 40–80ms | Only for groups that arrive together. Never hide content that has no JS or reduced-motion fallback |
| Scroll-linked (scrub) | CSS `animation-timeline: view()` or `scroll()` | Progress bars, a theme or colour shift, parallax ≤ 10% of travel |
| Pinned story | `position: sticky` stage plus steps. The active step comes from `view()` or IntersectionObserver | 3–6 steps, ≤ 3 viewports of pin, and unpin to a plain list on mobile |
| Smooth scroll (Lenis) | Only for scroll-narrative marketing pages | Never on apps or docs. Respect reduced motion |

```css
/* Reveal with no JS; content stays visible where unsupported */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% cover 25%; }
  }
}
@keyframes rise { from { opacity: 0; translate: 0 20px; } }
/* Scroll-linked page theme: animate custom properties registered with @property */
```
Scroll-driven animations ship in Chrome 115+ and Safari 26+. Firefox stable still has them behind a flag (mid-2026), so treat the effect as progressive enhancement or drive a class with IntersectionObserver. GSAP ScrollTrigger (free) is the right tool when you need pinning with scrub, sequencing, or cross-browser parity.

## Page-to-page transitions
- **Multi-page sites:** `@view-transition { navigation: auto; }` on both pages. It is supported in Chrome 126+ and Safari 18.2+. Firefox doesn't have it yet and gets an instant load, which is fine. Keep it ≤ 300ms. It waits for the new page to render, so slow pages feel slower.
- **SPA:** `document.startViewTransition(() => render())` behind a feature check. The equivalents are Astro `<ClientRouter />`, React's `<ViewTransition>` (check its current release status), and Motion `layoutId` for shared elements.
- **What moves:** the thing that was clicked morphs into the destination (`view-transition-name` on both, unique per page), and the rest crossfades. Use directional slides only for sequences (onboarding steps, back/forward). Motion recon reports whether an exemplar reloads or routes client-side, and whether it uses view transitions.

## In-page updates (state changes)
- **Numbers:** `tabular-nums`. For a new value, a 150–250ms crossfade or roll, with `aria-live="polite"` on it.
- **Tabs / segmented controls:** the indicator slides (FLIP or a shared view-transition-name) for 200ms. The content crossfades for 150ms; don't slide it.
- **Expand / collapse:** `interpolate-size: allow-keywords` (Chromium) or the `grid-template-rows: 0fr → 1fr` trick, 200–250ms.
- **Lists:** FLIP on reorder. New rows get a brief background tint, not a bounce.
- **Feedback:** optimistic UI plus skeletons that match the final layout. Toast only when the change happened off-screen.
- **Interruptible gestures** (drag, sheets): springs via Motion or CSS `linear()` easings. Motion recon labels these "spring".

## Exemplars worth measuring (verify with motion.mjs; sites change)
| Good at | Sites |
|---|---|
| Restraint, product-as-hero, micro-motion | linear.app, raycast.com, vercel.com |
| Springs and in-page state motion | resend.com (springs measured on accordions), emilkowal.ski (Sonner/Vaul author), family.co |
| Scroll storytelling, pinning, scrub | apple.com product pages (e.g. AirPods), stripe.com, gsap.com/showcase |
| Page transitions | vercel.com, astro.build (view transitions), framer.com |
| Craft, WebGL (only if the brief wants spectacle) | lusion.co, igloo.inc, awwwards.com Sites of the Day |
| Technique demos, not references to copy | tympanus.net/codrops, motion.dev examples, scroll-driven-animations.style |
