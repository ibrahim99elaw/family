let P = {}; const $ = s => document.querySelector(s);
const byName = n => Object.values(P).find(p => p.fullName === n.trim());
const link = id => P[id] ? `<a class="chip" href="#${id}">${esc(P[id].name)}</a>` : '';
const avatar = p => p.photo ? `<img src="${esc(p.photo)}">` : `<span>${esc((p.name || '?')[0])}</span>`;
async function init() {
  heroInit();
  (await db.collection('people').get()).forEach(d => P[d.id] = { id: d.id, ...d.data() });
  normalize();
  $('#names').innerHTML = Object.values(P).map(p => `<option value="${esc(p.fullName)}">`).join('');
  route(); addEventListener('hashchange', route);
}
function route() {
  const [id, mode] = location.hash.slice(1).split('/'), p = P[id];
  $('#profile').innerHTML = p ? (mode === 'details' ? profile(p) : branch(p)) : '';
  if (p) { showHero(false); scrollTo({ top: 0, behavior: 'smooth' }); }
}
function branch(p) {
  const par = [p.fatherId, p.motherId].filter(x => P[x]);
  return `<div class="card" style="text-align:center"><h3>شجرة ${esc(p.name)}</h3>${par.length ? `<p style="color:#9fb0c6;font-size:13px;margin:0 0 6px">من: ${par.map(link).join('')}</p>` : ''}
  <div class="tw"><div class="tree"><ul>${unit(p, [], p.id)}</ul></div></div><p style="font-size:12px;color:#9fb0c6">اضغط على أي شخص لفتح شجرته، واضغط على ${esc(p.name)} لعرض تفاصيله</p>
  <a class="chip" href="#${p.id}/details">📄 تفاصيل ${esc(p.name)}</a></div>`;
}
function profile(p) {
  const kids = Object.values(P).filter(x => x.fatherId === p.id || x.motherId === p.id).sort((a, b) => bk(a) - bk(b)).map(k => k.id), sibs = sibsOf(p).map(k => k.id);
  const sec = (t, a) => (a = a.filter(x => P[x])).length ? `<div class="card"><h3>${t}</h3>${a.map(link).join('')}</div>` : '';
  return `<div class="hero"><div class="av">${avatar(p)}</div><h2>${esc(p.fullName)}</h2>${p.nickname ? `<p class="nick">«${esc(p.nickname)}»</p>` : ''}<p>${[p.gender === 'f' ? 'أنثى' : 'ذكر', p.birth && 'مواليد ' + esc(p.birth), esc(p.job)].filter(Boolean).join(' • ')}</p></div>
  <p style="text-align:center"><a class="chip" href="#${p.id}">🌳 شجرة ${esc(p.name)}</a></p>\n  ${p.bio ? `<div class="card"><h3>نبذة</h3><p>${esc(p.bio)}</p></div>` : ''}
  ${sec('الأب', [p.fatherId])}${sec('الأم', [p.motherId])}${sec('الإخوة والأخوات', sibs)}${sec(p.gender === 'f' ? 'الزوج' : 'الزوجة', p.spouseIds || [])}${sec('الأبناء', kids)}<div class="dl"><button data-dl="card" data-id="${p.id}">⬇️ تحميل الكارت</button><button data-dl="qr" data-id="${p.id}">⬇️ تحميل QR</button><button class="sec" data-dl="card" data-share="1" data-id="${p.id}">📤 مشاركة الكارت</button></div>`;
}
// تسلسل مختصر: لو الطريق بيطلع لأب/أم وينزل لأخ/أخت، نختصره (أمه ← أختها ← ابنها)
function chain(path) {
  const T = path.slice(1), out = []; let prev = P[path[0].id];
  for (let i = 0; i < T.length; i++) {
    let k = T[i].t, node = P[T[i].id];
    if ((k === 'f' || k === 'm') && T[i + 1] && T[i + 1].t === 'd') { node = P[T[i + 1].id]; k = 'b'; i++; }
    const m = node.gender === 'm', suf = prev.gender === 'f' ? 'ها' : 'ه';
    const w = { f: 'أبو', m: 'أم', d: m ? 'ابن' : 'بنت', b: m ? 'أخو' : 'أخت', s: m ? 'زوج' : 'زوجت' }[k];
    out.push(w + suf + ' ' + link(node.id)); prev = node;
  }
  return out;
}
function calc() {
  const a = byName($('#a').value), b = byName($('#b').value), o = $('#out');
  if (!a || !b) return o.innerHTML = '<p class="err">اختار الاسمين من القائمة</p>';
  const path = findPath(P, a.id, b.id);
  if (!path) return o.innerHTML = '<p class="err">مفيش صلة مسجّلة بينهم</p>';
  const steps = chain(path);
  o.innerHTML = `<div class="res"><p>${esc(b.name)} هو/هي</p><h2>${term(P, path)} ${esc(a.name)}</h2></div><div class="chain">${link(a.id)}${steps.map(s => `<i>←</i>${s}`).join('')}</div>`;
}
$('#go').onclick = calc;
$('#s').onchange = e => { const p = byName(e.target.value); if (p) { location.hash = p.id; e.target.value = ''; } };
init();
