# Sources: where references come from

Use galleries to **discover** sites (WebSearch/WebFetch). Then run `recon.mjs` on the **actual sites**, not on the gallery pages. Login-walled libraries (Mobbin, Page Flows, Refero) must not be scraped. If the user has an account, ask them to paste screenshots or export a flow. Screenshots dropped into the chat or `.design/refs/` count as references: read them as images and describe their measurable traits.

## Picking the set (3–5)
1. **User's picks** (always first).
2. **1–2 direct competitors**, measured so you can be *different* where it matters and conventional where users expect it.
3. **1–2 adjacent-world references**: from the subject's physical or cultural world (for a restaurant tool: a menu printer, a kitchen-equipment maker, a food magazine). This is the strongest antidote to slop.
4. **1 craft reference** for the hardest part (tables, motion, onboarding, editorial type).

## Discovery by need
| Need | Where |
|---|---|
| Product UI / SaaS screens | Public docs, changelogs, and template galleries of the product itself; saaspo.com, saaslandingpage.com; Mobbin / Refero (user-provided screenshots) |
| Flows (onboarding, checkout, signup, settings) | Recon `--flow` on public flows (never submit forms); pageflows.com, mobbin.com (user screenshots); goodux.appcues.com; growth.design case studies |
| Marketing / brand sites | godly.website, siteinspire.com, land-book.com, lapa.ninja, minimal.gallery, httpster.net, awwwards.com (craft, often motion-heavy), fontsinuse.com (type in context) |
| Design systems (token/anatomy truth) | primer.style, polaris.shopify.com, carbondesignsystem.com, atlassian.design, radix-ui.com, vercel.com/geist, design-system.service.gov.uk, m3.material.io, spectrum.adobe.com |
| Motion | godly.website, rive.app/community, lottiefiles.com, codrops (tympanus.net/codrops), motion.dev examples, gsap.com showcase; recon `--motion` on sites whose motion you want to measure |
| Diagrams / illustration | The product's own docs diagrams; Stripe/Linear/Vercel docs & blogs (recon saves large inline SVGs to `svg/`, so study their structure and stroke logic, don't reuse the art); undraw/humaaans only if the brief wants stock (usually no) |
| Editorial / content + ads | Publishers in the same vertical (recon reports ad slots); nytimes.com, theverge.com, polygon.com for type; iab.com ad specs |
| Fonts | fonts.google.com, fontshare.com (free commercial), velvetyne.fr, collletttivo.it, uncut.wtf, typewolf.com (pairing research), fontsinuse.com |
| Colour from the subject | Photos of the subject's materials, packaging, signage, uniforms, and maps; sample 5–7 hexes from them |

## Recon recipes
```
# SaaS: competitors + flow + key pages
node scripts/recon.mjs 7shifts.com linear.app --pages 3 --flow "Pricing"
# Brand site with a motion signature
node scripts/recon.mjs <site> --motion --pages 1
# Publisher with ads (mobile matters most)
node scripts/recon.mjs <publisher>/<article-url> --pages 0
# Then
node scripts/board.mjs .design/recon
```
A recon takes 20–60s per site. Run 3–5 sites in one command. If a site blocks the headless browser or shows only a bot challenge, drop it.
