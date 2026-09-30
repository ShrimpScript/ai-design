// Google Fonts <link> tags that actually resolve: variable weight range first, static weights, then plain.
import './net.mjs';
export async function googleLinks(families) {
  const out = [];
  for (const n of new Set(families.filter(Boolean))) {
    if (n.includes(':')) { out.push(`https://fonts.googleapis.com/css2?family=${n.replace(/ /g, '+')}&display=swap`); continue; } // explicit axis spec
    const base = `https://fonts.googleapis.com/css2?family=${n.replace(/ /g, '+')}`;
    const tries = [`${base}:wght@300..800&display=swap`, `${base}:wght@400;500;600;700&display=swap`, `${base}&display=swap`];
    let href = tries.at(-1);
    for (const t of tries) { try { if ((await fetch(t)).status === 200) { href = t; break; } } catch {} }
    out.push(href);
  }
  return out;
}
export const familyName = (spec) => String(spec || '').split(':')[0];
