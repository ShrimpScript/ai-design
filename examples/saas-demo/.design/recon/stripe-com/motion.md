# stripe.com — motion
https://stripe.com

## Scroll
Scroll engine: native
Reveals: 1 of 145 tracked elements change when scrolled into view
  ×1: opacity 0→1
  timing: opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1) (×1)
Scroll-linked (scrub/parallax): none
Pinned sections: none
CSS scroll-driven: none
GSAP: not present

## Page transition
Click "Pricing" → /pricing · full document load · view transitions: none · see nav frames

## In-page state changes
- Billing toggle "Enable any billing model Pro P": transform 1000ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease, transform 800ms cubic-bezier(0.22, 1, 0.36, 1), opacityAnimation 1ms linear
- Accordion "Accept and optimize payments g": no CSS/WAAPI animation (instant or JS-driven)

Reduced motion: 3 animations still running with prefers-reduced-motion: reduce
Frames: motion-sheet.jpg (scroll states, nav +ms, state changes)