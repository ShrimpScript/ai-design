// Rail — weekly schedule for one restaurant. Plain JS, no build step.
const DAYS = [
  { key: 'mon', short: 'Mon', date: 5, dot: 'var(--d-mon)' },
  { key: 'tue', short: 'Tue', date: 6, dot: 'var(--d-tue)' },
  { key: 'wed', short: 'Wed', date: 7, dot: 'var(--d-wed)' },
  { key: 'thu', short: 'Thu', date: 8, dot: 'var(--d-thu)' },
  { key: 'fri', short: 'Fri', date: 9, dot: 'var(--d-fri)' },
  { key: 'sat', short: 'Sat', date: 10, dot: 'var(--d-sat)' },
  { key: 'sun', short: 'Sun', date: 11, dot: 'var(--d-sun)' },
];
const STATIONS = { kitchen: 'Kitchen', floor: 'Floor', bar: 'Bar' };
const ROLES = {
  Sous: { station: 'kitchen', wage: 26 }, Line: { station: 'kitchen', wage: 20 }, Prep: { station: 'kitchen', wage: 17 }, Dish: { station: 'kitchen', wage: 16 },
  Server: { station: 'floor', wage: 9 }, Host: { station: 'floor', wage: 15 }, Runner: { station: 'floor', wage: 12 },
  Bartender: { station: 'bar', wage: 11 }, Barback: { station: 'bar', wage: 14 },
};
const FORECAST = [2300, 2500, 2900, 3300, 4800, 5400, 3700];
const TARGET = 0.28;

const PEOPLE = [
  ['maria', 'Maria Reyes', 'Sous'], ['tomas', 'Tomás Aguilar', 'Line'], ['jaewon', 'Jae-won Park', 'Line'],
  ['aisha', 'Aisha Bello', 'Prep'], ['colm', 'Colm Byrne', 'Dish'],
  ['dani', 'Dani Okafor', 'Server'], ['marco', 'Marco Bellini', 'Server'], ['sofia', 'Sofia Lindqvist', 'Server'],
  ['priya', 'Priya Nair', 'Host'], ['kofi', 'Kofi Mensah', 'Runner'],
  ['luca', 'Luca Ferri', 'Bartender'], ['hannah', 'Hannah Weiss', 'Bartender'], ['ben', 'Ben Adler', 'Barback'],
].map(([id, name, role]) => ({ id, name, role, station: ROLES[role].station }));
const person = (id) => PEOPLE.find(p => p.id === id);

let seq = 0;
const S = (who, days, start, end, role) => days.map(d => ({ id: 's' + ++seq, who, day: d, start, end, role: role || person(who).role }));
const seedShifts = () => { seq = 0; return [
  ...S('maria', [1, 2, 3, 4], '14:00', '23:00'), ...S('maria', [5], '15:00', '23:00'),
  ...S('tomas', [0, 1, 2, 4, 5], '15:00', '23:00'),
  ...S('jaewon', [0, 3, 4, 5, 6], '15:00', '23:00'), ...S('jaewon', [3], '10:00', '16:00', 'Prep'),
  ...S('aisha', [0, 1, 2, 3, 4], '08:00', '14:00'),
  ...S('colm', [2, 3, 4, 5, 6], '17:00', '23:30'),
  ...S('dani', [1, 2, 4], '16:00', '22:30'), ...S('dani', [5], '11:00', '16:00'),
  ...S('marco', [0, 3, 5, 6], '16:00', '22:30'), ...S('marco', [4], '11:00', '16:00'),
  ...S('sofia', [2, 3, 4, 5], '17:00', '23:00'), ...S('sofia', [6], '11:00', '17:00'),
  ...S('priya', [3, 4, 5, 6], '17:00', '22:00'),
  ...S('kofi', [4, 5], '17:00', '23:00'), ...S('kofi', [6], '11:00', '17:00'),
  ...S('luca', [0, 1, 2, 3], '16:00', '23:30'),
  ...S('hannah', [3, 4, 5, 6], '16:00', '23:30'),
  ...S('ben', [4, 5], '18:00', '23:30'),
  ...S(null, [0, 1], '17:00', '23:30', 'Dish'), ...S(null, [6], '11:00', '16:00', 'Host'),
]; };

const state = {
  week: 0,
  weeks: { 0: { shifts: seedShifts(), off: [], posted: null, dirty: false } },
  station: 'all',
  mDay: 4,
  requests: [
    { id: 'r1', kind: 'Swap', text: 'Dani → Marco, Fri 9 Oct, 4–10:30p', why: 'Dani: “Exam that evening.”', shift: () => cur().shifts.find(s => s.who === 'dani' && s.day === 4), to: 'marco', status: 'open' },
    { id: 'r2', kind: 'Time off', text: 'Sofia, Sat 10 Oct, all day', why: 'Her Sat 5–11p shift becomes an open shift.', who: 'sofia', day: 5, status: 'open' },
    { id: 'r3', kind: 'Pick up', text: 'Priya takes open Host, Sun 11 Oct, 11a–4p', why: 'She already closes Sunday at 10p.', shift: () => cur().shifts.find(s => !s.who && s.day === 6 && s.role === 'Host'), to: 'priya', status: 'open' },
  ],
  confirmPost: false,
  animatePost: false,
};
const cur = () => state.weeks[state.week];
const dayDate = (d) => new Date(2026, 9, 5 + state.week * 7 + d);
const dayLabel = (d) => `${DAYS[d].short} ${dayDate(d).getDate()}`;

// ---------- time helpers
const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const hours = (s) => (mins(s.end) - mins(s.start)) / 60;
const fmt = (t) => { let [h, m] = t.split(':').map(Number); const ap = h >= 12 && h < 24 ? 'p' : 'a'; h = h % 12 || 12; return h + (m ? ':' + String(m).padStart(2, '0') : '') + ap; };
const range = (s) => { const a = fmt(s.start), b = fmt(s.end); return (a.slice(-1) === b.slice(-1) ? a.slice(0, -1) : a) + '–' + b; };
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const k = (n) => '$' + (n / 1000).toFixed(1) + 'k';

function conflicts(shifts) {
  const bad = new Set();
  for (const a of shifts) for (const b of shifts)
    if (a !== b && a.who && a.who === b.who && a.day === b.day && mins(a.start) < mins(b.end) && mins(b.start) < mins(a.end)) bad.add(a.id);
  return bad;
}
const cost = (s) => hours(s) * ROLES[s.role].wage;
function labour(week) {
  const perDay = DAYS.map((_, d) => week.shifts.filter(s => s.day === d).reduce((a, s) => a + cost(s), 0));
  return { perDay, total: perDay.reduce((a, b) => a + b, 0), forecast: FORECAST.reduce((a, b) => a + b, 0) };
}
const hoursFor = (id) => cur().shifts.filter(s => s.who === id).reduce((a, s) => a + hours(s), 0);
const markDirty = () => { cur().dirty = true; state.confirmPost = false; };

// ---------- render
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function ticketHTML(s, bad, i) {
  const cls = ['ticket', s.who ? '' : 'open', bad.has(s.id) ? 'conflict' : '', pendingIds().has(s.id) ? 'pending' : ''].join(' ');
  const who = s.who ? person(s.who).name : 'Open shift';
  return `<button type="button" class="${cls}" data-shift="${s.id}" style="--i:${i}" aria-label="${esc(who)}, ${DAYS[s.day].short} ${range(s)}, ${s.role}${bad.has(s.id) ? ', overlaps another shift' : ''}">
    <span class="t-time">${range(s)}</span><span class="t-hrs">${hours(s)}h</span><span class="t-role">${s.who ? s.role : s.role + ' needed'}</span></button>`;
}
function pendingIds() {
  const ids = new Set();
  for (const r of state.requests) if (r.status === 'open') { const s = r.shift?.(); if (s) ids.add(s.id); }
  return ids;
}

function render() {
  const week = cur();
  const has = !!week && week.shifts.length > 0;
  const ws = dayDate(0), we = dayDate(6), mo = (d) => d.toLocaleString('en-GB', { month: 'short' });
  $('#week-label').textContent = `Week of ${ws.getDate()}${mo(ws) === mo(we) ? '' : ' ' + mo(ws)}–${we.getDate()} ${mo(we)}`;
  document.title = `Schedule, week of ${ws.getDate()} ${mo(ws)} · Rail`;
  $('#copy-week').hidden = has;
  $('#grid').hidden = !has; $('#empty').hidden = has; $('#mobile').hidden = !has;
  $('#post').setAttribute('aria-disabled', has ? 'false' : 'true');

  // stations
  $('#stations').innerHTML = [['all', 'All'], ...Object.entries(STATIONS)].map(([id, label]) =>
    `<button type="button" role="radio" aria-checked="${state.station === id}" data-station="${id}">${label}</button>`).join('');

  if (!has) { $('#status').innerHTML = 'Nothing scheduled'; $('#labour').innerHTML = `Forecast sales <b>${money(FORECAST.reduce((a, b) => a + b))}</b>`; renderRequests(); return; }

  const bad = conflicts(week.shifts);
  const L = labour(week);
  const open = week.shifts.filter(s => !s.who).length;
  const reqOpen = state.requests.filter(r => r.status === 'open').length;

  // status line
  let status;
  if (state.confirmPost) status = `<b>${bad.size / 2 >= 1 ? Math.ceil(bad.size / 2) : bad.size} overlap${bad.size > 2 ? 's' : ''}</b> — ${[...bad].map(id => { const s = week.shifts.find(x => x.id === id); return person(s.who).name.split(' ')[0] + ', ' + DAYS[s.day].short; }).filter((v, i, a) => a.indexOf(v) === i).join('; ')}. Fix it or post anyway.`;
  else if (week.posted && !week.dirty) status = `Posted ${week.posted} · staff notified`;
  else if (week.posted) status = `<b>Changes not posted</b> · last posted ${week.posted}`;
  else status = `<b>Draft</b>${open ? ` · <span class="wait">${open} open shift${open > 1 ? 's' : ''}</span>` : ''}${bad.size ? ` · <span class="wait">${Math.ceil(bad.size / 2)} overlap</span>` : ''}`;
  $('#status').innerHTML = status;
  const postBtn = $('#post');
  postBtn.textContent = state.confirmPost ? 'Post anyway' : week.posted && !week.dirty ? 'Posted' : week.posted ? 'Post changes' : 'Post schedule';
  if (week.posted && !week.dirty) postBtn.setAttribute('aria-disabled', 'true');

  const pct = L.total / L.forecast;
  $('#labour').innerHTML = `Labour <b>${money(L.total)}</b> = <b>${(pct * 100).toFixed(1)}%</b> of ${money(L.forecast)} forecast · target ${Math.round(TARGET * 100)}%`;

  // grid
  const rows = [];
  rows.push(`<div class="hd hd-name"><span>Forecast · labour</span><div class="rail"></div></div>`);
  DAYS.forEach((d, i) => {
    const p = L.perDay[i] / FORECAST[i];
    rows.push(`<div class="hd hd-day" role="columnheader"><span class="day-name"><span class="dot" style="background:${d.dot}" aria-hidden="true"></span>${dayLabel(i)}</span>
      <span class="day-meta"><span>${k(FORECAST[i])}</span><span class="pct ${p > TARGET ? 'over' : ''}" title="Labour ${money(L.perDay[i])}">${Math.round(p * 100)}%${p > TARGET ? ' ▲' : ''}</span></span><div class="rail"></div></div>`);
  });
  rows.push(`<div class="hd hd-hrs"><span>Hours</span><div class="rail"></div></div>`);

  let ti = 0;
  const cell = (who, d, list) => {
    const off = who && week.off.some(o => o.who === who && o.day === d);
    return `<div class="cell ${off ? 'off' : ''}" role="gridcell">${off ? '<span class="off-tag">Off</span>' : ''}${list.map(s => ticketHTML(s, bad, ti++)).join('')}${off ? '' : `<button type="button" class="add${list.length ? ' mini' : ''}" data-add="${who || ''}" data-day="${d}" aria-label="Add shift${who ? ' for ' + esc(person(who).name) : ''}, ${DAYS[d].short}">${list.length ? '+' : '+ Add'}</button>`}</div>`;
  };
  const inStation = (st) => state.station === 'all' || state.station === st;

  const openShifts = week.shifts.filter(s => !s.who && inStation(ROLES[s.role].station));
  rows.push(`<div class="group open">Open shifts <small>${openShifts.length ? openShifts.length + ' to fill' : 'all filled'}</small></div>`);
  rows.push(`<div class="person"><b>Unassigned</b><span>Waiting on the pass</span></div>`);
  DAYS.forEach((_, d) => rows.push(cell(null, d, openShifts.filter(s => s.day === d))));
  rows.push(`<div class="hrs"></div>`);

  for (const [st, label] of Object.entries(STATIONS)) {
    if (!inStation(st)) continue;
    const people = PEOPLE.filter(p => p.station === st);
    rows.push(`<div class="group">${label} <small>${people.length} people</small></div>`);
    for (const p of people) {
      const h = hoursFor(p.id);
      rows.push(`<div class="person"><b>${esc(p.name)}</b><span>${p.role}</span></div>`);
      DAYS.forEach((_, d) => rows.push(cell(p.id, d, week.shifts.filter(s => s.who === p.id && s.day === d).sort((a, b) => mins(a.start) - mins(b.start)))));
      rows.push(`<div class="hrs ${h > 40 ? 'ot' : ''}">${h}${h > 40 ? `<small>${h - 40}h over</small>` : ''}</div>`);
    }
  }
  const grid = $('#grid');
  grid.innerHTML = rows.join('');
  grid.classList.toggle('posted', state.animatePost);
  state.animatePost = false;

  renderMobile(week, bad);
  renderRequests();
}

function renderMobile(week, bad) {
  const d = state.mDay, L = labour(week);
  const tabs = DAYS.map((x, i) => `<button type="button" role="tab" aria-selected="${i === d}" data-mday="${i}"><span class="dot" style="background:${x.dot}" aria-hidden="true"></span><b>${x.short}</b>${dayDate(i).getDate()}</button>`).join('');
  const p = L.perDay[d] / FORECAST[d];
  let html = `<div class="m-days" role="tablist" aria-label="Day">${tabs}</div>
    <div class="m-head"><span>${dayLabel(d)} ${dayDate(d).toLocaleString('en-GB', { month: 'short' })} · forecast ${k(FORECAST[d])}</span><span class="${p > TARGET ? 'wait' : ''}">labour ${Math.round(p * 100)}%</span></div>`;
  const inStation = (st) => state.station === 'all' || state.station === st;
  const open = week.shifts.filter(s => !s.who && s.day === d && inStation(ROLES[s.role].station));
  if (open.length) html += `<div class="group open">Open shifts</div>` + open.map(s => `<div class="m-row"><span>${s.role} needed</span>${ticketHTML(s, bad, 0)}</div>`).join('');
  for (const [st, label] of Object.entries(STATIONS)) {
    if (!inStation(st)) continue;
    const list = week.shifts.filter(s => s.who && s.day === d && person(s.who).station === st).sort((a, b) => mins(a.start) - mins(b.start));
    html += `<div class="group">${label} <small>${list.length} on</small></div>`;
    html += list.map(s => `<div class="m-row"><span><b>${esc(person(s.who).name)}</b><br><small>${s.role}</small></span>${ticketHTML(s, bad, 0)}</div>`).join('') || `<p class="req-none">Nobody scheduled.</p>`;
  }
  $('#mobile').innerHTML = html;
}

function renderRequests() {
  const open = state.requests.filter(r => r.status === 'open');
  $('#req-count').textContent = open.length || '';
  $('#req-list').innerHTML = state.requests.map(r => r.status === 'open'
    ? `<li class="req"><span class="req-kind">${r.kind}</span><p>${esc(r.text)}</p><p class="why">${esc(r.why)}</p>
       <div class="req-actions"><button type="button" class="btn" data-req="${r.id}" data-act="approve">Approve</button><button type="button" class="btn btn-quiet" data-req="${r.id}" data-act="decline">Decline</button></div></li>`
    : `<li class="req done"><span class="req-kind">${r.kind} · ${r.status}</span><p>${esc(r.text)}</p></li>`).join('')
    + (open.length ? '' : '<li class="req-none">No requests waiting.</li>');
}

// ---------- editor
let editing = null, anchor = null;
function openEditor(el, { shiftId, who, day }) {
  const week = cur();
  const s = shiftId ? week.shifts.find(x => x.id === shiftId) : null;
  editing = { shiftId, day: s ? s.day : day };
  anchor = el;
  const whoId = s ? s.who || '' : who || '';
  $('#ed-title').textContent = s ? (s.who ? 'Edit shift' : 'Fill open shift') : 'New shift';
  $('#ed-sub').textContent = dayDate(editing.day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#ed-person').innerHTML = `<option value="">Open shift (unassigned)</option>` + Object.entries(STATIONS).map(([st, label]) =>
    `<optgroup label="${label}">${PEOPLE.filter(p => p.station === st).map(p => `<option value="${p.id}">${esc(p.name)} · ${p.role}</option>`).join('')}</optgroup>`).join('');
  $('#ed-person').value = whoId;
  $('#ed-role').innerHTML = Object.keys(ROLES).map(r => `<option>${r}</option>`).join('');
  $('#ed-role').value = s ? s.role : whoId ? person(whoId).role : 'Line';
  $('#ed-start').value = s ? s.start : '16:00';
  $('#ed-end').value = s ? s.end : '22:00';
  $('#ed-delete').hidden = !s;
  $('#ed-save').textContent = s ? 'Save shift' : 'Add shift';
  validate();
  const ed = $('#editor');
  ed.hidden = false;
  if (innerWidth > 760) {
    const r = el.getBoundingClientRect(), w = 300, h = ed.offsetHeight;
    let left = r.right + 8; if (left + w > innerWidth - 12) left = Math.max(12, r.left - w - 8);
    let top = Math.min(Math.max(12, r.top - 8), innerHeight - h - 12);
    ed.style.left = left + 'px'; ed.style.top = top + 'px';
  }
  $('#ed-person').focus();
}
function closeEditor() { $('#editor').hidden = true; editing = null; if (anchor && document.contains(anchor)) anchor.focus(); anchor = null; }
function validate() {
  const start = $('#ed-start').value, end = $('#ed-end').value, who = $('#ed-person').value;
  let msg = '';
  if (start && end && mins(end) <= mins(start)) msg = 'End is before start. For shifts past midnight, end at 11:59p and add the rest to the next day.';
  else if (who && editing) {
    const clash = cur().shifts.find(s => s.id !== editing.shiftId && s.who === who && s.day === editing.day && mins(s.start) < mins(end) && mins(start) < mins(s.end));
    if (clash) msg = `Overlaps ${person(who).name.split(' ')[0]}’s ${range(clash)} shift. You can save it, but it will show as a conflict.`;
    else if (cur().off.some(o => o.who === who && o.day === editing.day)) msg = `${person(who).name.split(' ')[0]} has this day off.`;
    else {
      const extra = (mins(end) - mins(start)) / 60 - (editing.shiftId ? hours(cur().shifts.find(s => s.id === editing.shiftId)) * (cur().shifts.find(s => s.id === editing.shiftId).who === who ? 1 : 0) : 0);
      const total = hoursFor(who) + extra;
      if (total > 40) msg = `Puts ${person(who).name.split(' ')[0]} at ${total}h this week (${total - 40}h overtime).`;
    }
  }
  $('#ed-warn').textContent = msg;
  $('#ed-save').disabled = start && end && mins(end) <= mins(start);
}

// ---------- events
document.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!$('#editor').hidden && !e.target.closest('#editor') && !(t && (t.dataset.shift || t.dataset.add !== undefined))) closeEditor();
  if (!t) return;
  if (t.dataset.shift) return openEditor(t, { shiftId: t.dataset.shift });
  if (t.dataset.add !== undefined && t.classList.contains('add')) return openEditor(t, { who: t.dataset.add || null, day: +t.dataset.day });
  if (t.dataset.station) { state.station = t.dataset.station; return render(); }
  if (t.dataset.mday) { state.mDay = +t.dataset.mday; return render(); }
  if (t.dataset.week) { state.week += +t.dataset.week; state.confirmPost = false; return render(); }
  if (t.dataset.req) return handleRequest(t.dataset.req, t.dataset.act);
  if (t.id === 'copy-week' || t.id === 'empty-copy') {
    const src = state.weeks[0];
    state.weeks[state.week] = { shifts: src.shifts.map(s => ({ ...s, id: 's' + ++seq })), off: [], posted: null, dirty: false };
    return render();
  }
  if (t.id === 'post' && t.getAttribute('aria-disabled') !== 'true') {
    const week = cur();
    if (conflicts(week.shifts).size && !state.confirmPost) { state.confirmPost = true; return render(); }
    week.posted = 'Tue 29 Sep, 2:14p'; week.dirty = false; state.confirmPost = false; state.animatePost = true;
    return render();
  }
  if (t.id === 'ed-cancel') return closeEditor();
  if (t.id === 'ed-delete') {
    const week = cur(); week.shifts = week.shifts.filter(s => s.id !== editing.shiftId); markDirty(); closeEditor(); return render();
  }
});

function handleRequest(id, act) {
  const r = state.requests.find(x => x.id === id), week = cur();
  if (act === 'approve') {
    if (r.kind === 'Time off') {
      week.off.push({ who: r.who, day: r.day });
      for (const s of week.shifts) if (s.who === r.who && s.day === r.day) s.who = null;
    } else { const s = r.shift(); if (s) s.who = r.to; }
    markDirty();
  }
  r.status = act === 'approve' ? 'approved' : 'declined';
  render();
  const next = document.querySelector('.req-actions .btn'); if (next) next.focus();
}

$('#ed-form').addEventListener('input', validate);
$('#ed-person').addEventListener('change', () => { const w = $('#ed-person').value; if (w) $('#ed-role').value = person(w).role; validate(); });
$('#ed-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const week = cur();
  const data = { who: $('#ed-person').value || null, day: editing.day, start: $('#ed-start').value, end: $('#ed-end').value, role: $('#ed-role').value };
  if (editing.shiftId) Object.assign(week.shifts.find(s => s.id === editing.shiftId), data);
  else week.shifts.push({ id: 's' + ++seq, ...data });
  markDirty(); closeEditor(); render();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#editor').hidden) closeEditor(); });

render();
