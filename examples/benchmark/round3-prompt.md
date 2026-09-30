Task: Design and build the marketing website for **Tidemark**, an AI company.

Premise (fixed — do not change the product): Tidemark trains a forecasting model that predicts urban flooding up to 72 hours ahead, street by street, by combining rainfall radar, tide gauges, river levels, drain-network maps and ground elevation. Customers are city emergency-management teams, water utilities and port authorities. Products: **Tidemark Forecast** (a live map dashboard with street-level flood depth and timing), **Tidemark Alerts** (automated warnings to crews and residents by SMS/app when a street crosses a depth threshold) and the **Tidemark API** (forecast tiles and time series for insurers and logistics). Everything else — brand identity, name treatment, logo mark, palette, typography, voice, copy, customers, numbers — is yours to design. Invent plausible content; do not use real company logos.

Build it as a production-grade web application, not a single HTML page:
- Vite + React + TypeScript. Any npm packages you choose (animation, 3D, charts, routing) are allowed.
- Client-side routing with at least these pages: Home, Product (covering all three products), How it works (the model and data), Customers (one detailed case study), Pricing, and Request a demo (a validated form with success and error states).
- A shared design system: tokens, reusable components, consistent header/footer and navigation (including a mobile menu).
- `npm run build` must produce a static `dist/` that works when served from any static file server (use hash routing or a base of `./` so it works from a sub-path).

Motion and graphics are a primary part of this brief:
- A signature hero motion graphic that expresses the product (not decorative blobs), responsive from 360px phones to 1440px+ desktops and responsive to the user (pointer, scroll or time).
- Scroll-driven storytelling on the Home and How it works pages (animated data visualisation, diagrams or sequences that advance with scroll).
- Page-to-page transitions between routes, and meaningful micro-interactions on controls and state changes.
- Everything must respect `prefers-reduced-motion`, stay accessible (keyboard, focus, contrast, semantics) and perform well (no layout shift, sensible bundle size, lazy-load heavy assets).

Quality bar: this should look and feel like the site of a well-funded, credible company in 2026, with a real brand and polish at every breakpoint. No human is available to answer questions, so make your own decisions.
