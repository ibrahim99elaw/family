let P = {}; const $ = s => document.querySelector(s);
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const byName = n => Object.values(P).find(p => p.fullName === n.trim());
const link = id => P[id] ? `<a class="chip" href="#${id}">${esc(P[id].name)}</a>` : '';
const avatar = p => p.photo ? `<img src="${esc(p.photo)}">` : `<span>${esc((p.name || '?')[0])}</span>`;
async function init() {
  (await db.collection('people').get()).forEach(d => P[d.id] = { id: d.id, ...d.data() });
  $('#names').innerHTML = Object.values(P).map(p => `<option value="${esc(p.fullName)}">`).join('');
  route(); addEventListener('hashchange', route);
}
function route() {
  const p = P[location.hash.slice(1)];
  $('#profile').innerHTML = p ? profile(p) : '';
  if (p) scrollTo({ top: 0, behavior: 'smooth' });
}
function profile(p) {
  const kids = Object.values(P).filter(x => x.fatherId === p.id || x.motherId === p.id).map(k => k.id);
  const sec = (t, a) => (a = a.filter(x => P[x])).length ? `<div class="card"><h3>${t}</h3>${a.map(link).join('')}</div>` : '';
  return `<div class="hero"><div class="av">${avatar(p)}</div><h2>${esc(p.fullName)}</h2>${p.nickname ? `<p class="nick">«${esc(p.nickname)}»</p>` : ''}<p>${[p.gender === 'f' ? 'أنثى' : 'ذكر', p.birth && 'مواليد ' + esc(p.birth), esc(p.job)].filter(Boolean).join(' • ')}</p></div>
  ${p.bio ? `<div class="card"><h3>نبذة</h3><p>${esc(p.bio)}</p></div>` : ''}
  ${sec('الأب', [p.fatherId])}${sec('الأم', [p.motherId])}${sec(p.gender === 'f' ? 'الزوج' : 'الزوجة', p.spouseIds || [])}${sec('الأبناء', kids)}`;
}
function calc() {
  const a = byName($('#a').value), b = byName($('#b').value), o = $('#out');
  if (!a || !b) return o.innerHTML = '<p class="err">اختار الاسمين من القائمة</p>';
  const path = findPath(P, a.id, b.id);
  if (!path) return o.innerHTML = '<p class="err">مفيش صلة مسجّلة بينهم</p>';
  const steps = path.slice(1).map(x => { const g = P[x.id].gender === 'm'; return (x.t === 's' ? (g ? 'زوجها' : 'زوجته') : x.t === 'd' ? (g ? 'ابنه' : 'بنته') : x.t === 'f' ? 'أبوه' : 'أمه') + ' ' + link(x.id); });
  o.innerHTML = `<div class="res"><p>${esc(b.name)} هو/هي</p><h2>${term(P, path)} ${esc(a.name)}</h2></div><div class="chain">${link(a.id)}${steps.map(s => `<i>←</i>${s}`).join('')}</div>`;
}
$('#go').onclick = calc;
$('#s').onchange = e => { const p = byName(e.target.value); if (p) { location.hash = p.id; e.target.value = ''; } };
init();
