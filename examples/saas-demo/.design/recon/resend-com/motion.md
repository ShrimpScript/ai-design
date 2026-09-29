# resend.com — motion
https://resend.com

## Scroll
Scroll engine: native
Reveals: 10 of 160 tracked elements change when scrolled into view
  ×7: y 0→-32px
  ×3: y 0→-166px
  timing: not exposed (JS-driven, see GSAP below)
Scroll-linked (scrub/parallax): none
Pinned sections: none
CSS scroll-driven: none
GSAP: not present

## Page transition
Click "Pricing" → / · client-side route (no reload) · view transitions: none · see nav frames

## In-page state changes
- Tab "Serverless": border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) ×2, border-left-color 200ms cubic-bezier(0.4, 0, 0.2, 1) ×2, --tw-gradient-from 200ms cubic-bezier(0.4, 0, 0.2, 1) ×2, border-right-color 200ms cubic-bezier(0.4, 0, 0.2, 1) ×2
- Accordion "Delivered delivered@resend.dev": opacity 200ms cubic-bezier(0, 0, 0.2, 1), scale 200ms cubic-bezier(0, 0, 0.2, 1), translate 200ms cubic-bezier(0, 0, 0.2, 1), waapi 1050ms spring (linear())

Reduced motion: 9 animations still running with prefers-reduced-motion: reduce (not honoured)
Frames: motion-sheet.jpg (scroll states, nav +ms, state changes)