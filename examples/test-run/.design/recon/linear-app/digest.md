# linear.app — recon
https://linear.app
Title: Linear – The system for product development
Meta: Purpose-built for planning and building products with AI agents.

## Colour
Page bg #08090a (dark, color-scheme dark) · gradients: 42
Surfaces (area %): #0f1011 43%, #08090a 26%, #090a0b 8%, #101112 8%, #ffffff03 7%, #161718 2%
Text (char %): #d0d6e0 33%, #8a8f98 32%, #62666d 9%, #f7f8f8 8%, #08090a 3%
Accent (links/buttons): #e4f222 (1)
Borders: 1px #ffffff14 (66), 1px #ffffff1f (11), 1px #ffffff0d (3), 1px #23252a (3), 1px #ffffff14 (bottom) (2)

## Type
Families by text share: Inter Variable 400 53%, Inter Variable 510 24%, Berkeley Mono 400 16%, Inter Variable 300 4%, Inter Variable 500 2%, Inter Variable 590 1%
Scale px: 10 12 13 14 15 16 18 24 32 48 64 72 (avg step ×1.2)
h1 64/1 510 ls -0.022em "Inter Variable" | h2 48/1 510 ls -0.022em "Inter Variable" | h3 20/1.33 590 ls -0.012em "Inter Variable" | body 15/1.6 400 ls -0.011em "Inter Variable" | button 13/1.5 400 "Inter Variable"
Font sources: static.linear.app
@font-face: — (cross-origin CSS)

## Space, shape, layout
Spacing top values: 8 6 4 32 12 10 2 7 24 36 5 11 → base irregular
Radii: pill (82), 8px (29), 50% (28), 12px (26), 4px (21), 9px (18) · Shadows: [#00000033 0px 0px 0px 1px] ×8, [#00000033 0px 0px 12px 0px inset] ×7, [#00000040 0px 2px 32px 0px] ×5, [#ffffff14 0px 0px 0px 0.5px inset] ×5
Container widths: 1344 (5), 720 (1) · grid 177 / flex 531
Header: 73px fixed bg transparent blur(20px)
H1: 64px start, top 272px, width 1282px · above-fold media: img 1440x804
Page height: 9960px

## Components
Button 1 (×3): bg #ffffff05 · fg #8a8f98 · r pill · pad 0px/7px · 13px/400 · h 28
Button 2 (×2): bg none · fg #d0d6e0 · r 16px · pad 0px/7px · 12px/400 · border 1px #2e2e32 · h 24
Button 3 (×1): bg #e5e5e6 · fg #08090a · r pill · pad 0px/12px · 13px/510 · border 1px #e5e5e6 · h 32
Button 4 (×1): bg #ffffff05 · fg #e2e4e7 · r pill · pad 0px/0px · 13px/400 · border 1px #24282c · h 28
Repeated cards: none
Counts: buttons 76, inputs 2, tables 0, forms 0, dialogs 0
Primary CTA hover: bg rgba(255, 255, 255, 0.02) → rgba(255, 255, 255, 0.05); color rgb(138, 143, 152) → rgb(208, 214, 224); border rgb(138, 143, 152) → rgb(208, 214, 224) (0.16s cubic-bezier(0.25, 0.46, 0.45, 0.94))

## Motion
Libraries/stack: Next.js
Transitions: color 0.1s (221), filter, transform 0.16s (26), color 0.16s (20), background 0.4s (19), filter 0.16s (8), background-color, border-left-color 0.1s (8)
Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94) (271), ease (38), ease-out (19), cubic-bezier(0.32, 0.72, 0, 1) (10)
Running on load: 200 (*_dotIn 420ms (124), grid-dot-#-#-* 2800ms ∞ (25), grid-dot-#-#-pong 1600ms ∞ (25), grid-dot-#-#-* 3200ms ∞ (25), qM#FAa_cursorBlink 1250ms ∞ (1))
@keyframes: grid-dot-#-#-* ×100, grid-dot-#-#-pong ×50, swipe-out-left, swipe-out-*, swipe-out-up, swipe-out-down, sonner-fade-in, sonner-fade-out, sonner-spin, fadeIn, fadeOut, slideFromBottom, slideToBottom, slideFromTop, slideToTop, slideFromLeft
  @keyframes slideToRight { 100% { transform: translate3d(var(--initial-transform,100%),0,0); } }
  @keyframes slideToBottom { 100% { transform: translate3d(0,var(--initial-transform,100%),0); } }
  @keyframes slideToTop { 100% { transform: translate3d(0,calc(var(--initial-transform,100%) * -1),0); } }
prefers-reduced-motion rules: yes · scroll-driven CSS: no · view transitions: no

## Imagery & diagrams
Large media: svg 304x281 @y1929, svg 825x400 @y4210, svg 1200x1200 @y7878 · saved: svg/art-0.svg, svg/art-1.svg, svg/art-2.svg

## Copy voice
H1: —
H2: "Intake and integrations" / "Planning and monitoring" / "AI and automations" / "Build, review, and ship" / "Changelog" / "Built for the future. Available today."
CTAs: "Sign up", "Faster app launch", "Performance", "iOS", "Get started", "Contact sales"
Nav: Customers | Pricing | Now | Contact | Log in | Sign up

## Mobile (390)
H1 38px/1.10 · body 15px · menu button yes · sticky bottom bar no

## Flow / pages
page "Customers" /customers · h1 "Customers" · forms 0 inputs 0 tables 0
page "Pricing" /pricing · h1 "Pricing" · forms 0 inputs 2 tables 0

Files: sheet.jpg desktop.jpg full.jpg filmstrip.jpg page-customers.jpg page-pricing.jpg mobile.jpg mobile-full.jpg svg/art-0.svg svg/art-1.svg svg/art-2.svg