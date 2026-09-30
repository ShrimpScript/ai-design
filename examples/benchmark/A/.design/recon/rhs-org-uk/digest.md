# rhs.org.uk — recon
https://www.rhs.org.uk
Title: RHS - UK's leading gardening charity / RHS
Meta: The Royal Horticultural Society is the UK's leading gardening charity, join us for days out at stunning gardens, exclusive access to flower shows & expert advice. 

## Colour
Page bg #ffffff (light) · gradients: 4
Surfaces (area %): #b5cbc8 32%, #ffffff 22%, #004447 17%, #e7eeed 9%, #004f52 6%, #f5f2ee 4%
Text (char %): #3b3630 66%, #ffffff 28%, #006e50 4%, #e83458 2%
Accent (links/buttons): #006e50 (20), #e83458 (6)
Borders: 1px #3c363080 (bottom) (12), 1px null (9), 1px #b5cbc8 (5), 1px #b91959 (3), 1px #006e50 (bottom) (1)

## Type
Families by text share: freight-sans-pro 400 54%, freight-sans-pro 600 21%, freight-sans-pro 300 14%, GT-Super-Text-Black 600 4%, freight-sans-pro 500 4%, GT-Super-Text-Black 400 3%
Scale px: 15 16 18 22 24 26 28 32 37 38 42 (avg step ×1.12)
h1 28/1.2 500 "freight-sans-pro" | h2 26/1.23 600 "GT-Super-Text-Black" | h3 42/1.2 600 "GT-Super-Text-Black" | body 16/1.3 400 "freight-sans-pro" | button 22/1.45 400 "freight-sans-pro"
Font sources: self-hosted
@font-face: RHS Headline, RHS Regular, freight-sans-pro, GT-Super-Text-Black, rhs-icons, Font Awesome 5 Pro

## Space, shape, layout
Spacing top values: 13 16 8 10 26 48 4 14 40 6 20 32 → base irregular
Radii: 50% (12), 8px (9), 21.5px (7), 6px (7), 20px (4), pill (1) · Shadows: [#b5cbc8 0px 0px 0px 1px inset] ×5, [#b5cbc8 0px 0px 0px 1px] ×3
Container widths: 1184 (15), 1248 (2) · grid 1 / flex 51
Header: 95px static bg transparent
H1: 28px start, top 253px, width 299px · above-fold media: img 300x226, img 292x195, img 292x195
Page height: 4009px

## Hero
H1 13 words / 3 lines, start · sub 50 chars · eyebrow none · CTAs 2 ("Start growing better veg", "Read more") · logo strip no · media img right of headline · bg image · section 226px

## Components
Button 1 (×9): bg none · fg #006e50 · r 0px · pad 0px/13.75px · 18px/600 · border 1px null · h 64
Button 2 (×3): bg #e83458 · fg #ffffff · r 21.5px · pad 0px/25.888px · 18px/600 · border 1px #b91959 · h 43
Button 3 (×1): bg #e7eeed · fg #006e50 · r 0px · pad 6px/16px · 22px/400 · h 43
Button 4 (×1): bg none · fg #ffffff · r pill · pad 2px/16px · 16px/600 · border 1px #ffffff · h 33
Repeated card (×2): r 8px · bg #ffffff · border none · shadow yes · pad 0px
Repeated card (×1): r 8px · bg #b5cbc780 · border none · shadow yes · pad 0px
Counts: buttons 25, inputs 34, tables 0, forms 1, dialogs 2
Primary CTA hover: color rgb(0, 110, 80) → rgb(59, 54, 48) (0.125s ease-in-out)

## Motion
Libraries/stack: Tailwind
Transitions: color 0.125s (45), all 0.125s (12), all 0.25s (4)
Easing: ease-in-out (61)
Running on load: 1 (spin 1000ms ∞ (1))
@keyframes: tooltip-v#, show-nav-cto, flash, bounce, zoomIn, fa-spin, fadeOut, spin, reverse-a#_o ×11, forward-a#_o ×11, onetrust-fade-in, slide-down-* ×2
  @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes zoomIn { 0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 50% { opacity: 1; } }
  @keyframes slide-down-custom { 0% { } 100% { bottom: 0px; } }
prefers-reduced-motion rules: yes · scroll-driven CSS: no · view transitions: no

## Imagery & diagrams
Large media: no large svg/canvas · saved: —

## Copy voice
H1: "The RHS is the UK’s gardening charity, helping people and plants to grow"
H2: "Grow better, taste more" / "Win a £250 RHS voucher to spend on your garden" / "Get involved" / "Join the RHS"
CTAs: "Submit", "Become a member", "Sign up", "Join now", "Get involved", "Gardening", "Shows", "Gardens", "Learn", "Science"
Nav: Get involved | Gardening | Shows | Gardens | Learn | Science | Shop | About | My RHS

## Mobile (390)
H1 20px/1.24 · body 16px · menu button no · sticky bottom bar yes

Files: sheet.jpg desktop.jpg full.jpg mobile.jpg mobile-full.jpg