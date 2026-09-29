// robots.txt check (RFC 9309). Recon identifies as design-recon and otherwise follows the * group.
export async function robotsAllows(url) {
  try {
    const u = new URL(url);
    const res = await fetch(u.origin + '/robots.txt', { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return true;
    // RFC 9309: consecutive user-agent lines form one group; longest matching rule wins; allow wins ties.
    const groups = []; let g = null, lastUA = false;
    for (const raw of (await res.text()).split('\n')) {
      const line = raw.replace(/#.*/, '').trim(); if (!line.includes(':')) continue;
      const key = line.slice(0, line.indexOf(':')).trim().toLowerCase(), val = line.slice(line.indexOf(':') + 1).trim();
      if (key === 'user-agent') { if (!lastUA) groups.push(g = { ua: [], rules: [] }); g.ua.push(val.toLowerCase()); lastUA = true; continue; }
      lastUA = false;
      if (g && (key === 'allow' || key === 'disallow') && val) g.rules.push([key === 'allow', val]);
    }
    const mine = groups.filter(x => x.ua.some(a => a.includes('design-recon')));
    const rules = (mine.length ? mine : groups.filter(x => x.ua.includes('*'))).flatMap(x => x.rules);
    const target = u.pathname + u.search;
    let best = [-1, true];
    for (const [ok, pat] of rules) {
      const re = new RegExp('^' + pat.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
      if (re.test(target) && (pat.length > best[0] || (pat.length === best[0] && ok))) best = [pat.length, ok];
    }
    return best[1];
  } catch { return true; }
}
