# Motion & diagrams

## Principles
1. **Motion answers an action**: open, close, move, confirm, reorder. It shows *where* something went and *what* changed.
2. **One orchestrated moment** at most for non-triggered motion (a page-load sequence *or* one scroll reveal). Never fade-up on every section.
3. **Animate `transform` and `opacity`** (plus `clip-path`/`filter` sparingly). Never animate layout properties in loops.
4. **Reduced motion is mandatory:** under `prefers-reduced-motion: reduce`, swap movement for opacity or instant, and stop infinite loops.
5. **Measure the reference before inventing:** recon's `Transitions`, `Easing`, `hover` diff, and `@keyframes` samples give real timings. Adopt the *timing system*, not the choreography.

## Starter tokens (tune to the brief)
```css
:root{
  --dur-1: 100ms;  /* hover, press, colour */
  --dur-2: 160ms;  /* small UI: menus, toggles, tooltips */
  --dur-3: 240ms;  /* drawers, dialogs, reorder */
  --dur-4: 400ms;  /* page/hero moment only */
  --ease-out: cubic-bezier(.2,.8,.2,1);      /* entering */
  --ease-in:  cubic-bezier(.4,0,1,1);        /* leaving (use shorter durations) */
  --ease-move: cubic-bezier(.3,.7,.1,1);     /* position changes */
}
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
}
```
Enter is slower than exit. Distance scales duration: 8px moves at 100ms, a full drawer at 240ms.

## Tool choice (lightest that works)
| Need | Use |
|---|---|
| State changes, hovers, drawers | CSS transitions |
| Page / route or list reorder | View Transitions API (`document.startViewTransition`); FLIP by hand if unsupported |
| Scroll-linked (progress, parallax, reveals) | CSS `animation-timeline: view()/scroll()` with `@supports` fallback |
| Complex sequencing, springs, gestures in React | Motion (motion.dev, formerly Framer Motion) |
| Timeline-heavy marketing pages | GSAP (free, including all plugins, since 2025) |
| Designer-made vector animation | Lottie / dotLottie (keep it < 150 KB; stop it when offscreen) |
| Interactive, stateful animated graphics | Rive (state machines, small runtime) |
| 3D | Only when the product is 3D; Three.js / Spline with a static fallback |

## Reading recon motion
- `Running on load: N` with many `∞` means ambient loops. Treat as a signature *or* noise, and decide per brief.
- `filmstrip.jpg`: frames at +120/350/700/1200/2000ms plus scroll states. Describe the sequence in one line ("nav fades 0–200ms, headline rises 12px 200–600ms, screenshot scales 0.98→1 at 700ms"), then design your own using that tempo.
- `Motion assets: *.riv / *.lottie` tells you the site uses designer-authored animation. Don't copy the file.

## Diagrams
- A diagram must show the **real mechanism** (the data flow, the states, the timeline), with labels in the product's vocabulary.
- Build it as inline SVG from the design tokens: the same font, stroke = border width (1–1.5px), one accent for the path that matters, and `currentColor` for dark mode.
- Recon saves big inline SVGs to `svg/`. Study their grid, stroke weight, arrowheads, and label placement, not their art.
- Mermaid is fine for internal docs, but not for product or marketing surfaces. Animate a diagram only to show sequence (step highlight on scroll or click).
