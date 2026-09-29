# incident.io — motion
https://incident.io

## Scroll
Scroll engine: native (scroll-behavior: smooth)
Reveals: 4 of 119 tracked elements change when scrolled into view
  ×1: x 0→-3px
  ×1: y 0→-14px, x 0→-14px
  ×1: y -35→0px, scale 0.92→1.00
  ×1: y -52→-17px, scale 0.88→0.96
  timing: opacity 0.3s cubic-bezier(0.2, 0, 0, 1) (×2); all 0.5s cubic-bezier(0.4, 0, 0.2, 1) (×2)
Scroll-linked (scrub/parallax): none
Pinned sections: none
CSS scroll-driven: none
GSAP: not present

## Page transition
Click "Pricing" → /pricing · client-side route (no reload) · view transitions: none · see nav frames

## In-page state changes
- Tab "Alerting": opacity 300ms cubic-bezier(0.2, 0, 0, 1), transform 300ms cubic-bezier(0.2, 0, 0, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1) ×4, transform 750ms ease

Reduced motion: 0 animations still running with prefers-reduced-motion: reduce
Frames: motion-sheet.jpg (scroll states, nav +ms, state changes)