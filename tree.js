let P = {}, R = [], mode = 'T', nav = []; const $ = s => document.querySelector(s);
try { mode = localStorage.getItem('ftmode') === 'C' ? 'C' : 'T'; } catch (e) { }
const fail = m => { const t = $(mode === 'T' ? '#tree' : '#cards'); t.innerHTML = '<p class="err"></p>'; t.querySelector('.err').textContent = m; };
const kidsOf = p => { const ids = [p.id, ...(p.spouseIds || [])]; return Object.values(P).filter(x => !ids.includes(x.id) && (ids.includes(x.fatherId) || ids.includes(x.motherId))).sort((a, b) => bk(a) - bk(b)); };
const bcard = (p, big) => `<div class="bc ${p.gender === 'f' ? 'f' : 'm'}${big ? ' big' : ''}" data-go="${p.id}"><div class="ba">${p.photo ? `<img src="${esc(p.photo)}">` : esc((p.name || '?')[0])}</div><b>${esc(p.name)}</b>${p.nickname ? `<small>«${esc(p.nickname)}»</small>` : ''}<div class="bb"><button data-peek="${p.id}">👁 لمحة</button><button data-go="${p.id}">👨‍👩‍👧 العائلة</button></div></div>`;
function showCards() {
  const c = $('#cards'), cur = nav.length ? P[nav[nav.length - 1]] : null;
  const crumbs = `<div class="crumbs"><a data-nav="-1">🏠 البداية</a>${nav.map((id, i) => `<i>‹</i><a data-nav="${i}">${esc(P[id].name)}</a>`).join('')}</div>`;
  if (!cur) { const r = R[$('#root').value || 0]; c.innerHTML = crumbs + (r ? `<p class="hint">اضغط على الكارت لعرض العائلة</p><div class="cg one">${bcard(r, true)}</div>` : '<p class="err">لسه مفيش بيانات</p>'); return; }
  const sp = (cur.spouseIds || []).map(i => P[i]).filter(Boolean), ks = kidsOf(cur);
  c.innerHTML = crumbs + `<h3 class="ct">عائلة ${esc(cur.name)}</h3><div class="cg">${[cur, ...sp].map(p => bcard(p)).join('')}</div>` + (ks.length ? `<h3 class="ct">الأبناء (${ks.length})</h3><div class="cg">${ks.map(k => bcard(k)).join('')}</div>` : '<p class="hint">مفيش أبناء مسجلين</p>');
}
function peek(id) {
  const p = P[id], sp = (p.spouseIds || []).map(i => P[i]).filter(Boolean), ks = kidsOf(p), nm = x => x ? esc(x.name) : '';
  const row = (t, v) => v ? `<p><span>${t}</span>${v}</p>` : '';
  const m = document.createElement('div'); m.className = 'md';
  m.innerHTML = `<div class="mb"><button class="x">✕</button><div class="ba lg">${p.photo ? `<img src="${esc(p.photo)}">` : esc((p.name || '?')[0])}</div><h2 style="margin:6px 0">${esc(p.fullName)}</h2>${p.nickname ? `<p class="nick" style="text-align:center">«${esc(p.nickname)}»</p>` : ''}
  ${row('الأب', nm(P[p.fatherId]))}${row('الأم', nm(P[p.motherId]))}${row(p.gender === 'f' ? 'الزوج' : 'الزوجة', sp.map(nm).join('، '))}${row('الإخوة', sibsOf(p).map(nm).join('، '))}${row('الأبناء', ks.map(nm).join('، '))}${row('الميلاد', esc(p.birth))}${row('الوظيفة', esc(p.job))}${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ''}
  <a class="hbtn g" style="margin-top:10px" href="index.html#${p.id}/details">📄 الصفحة الكاملة</a></div>`;
  m.onclick = e => { if (e.target === m || e.target.classList.contains('x')) m.remove(); };
  document.body.appendChild(m);
}
function draw() {
  $('#tw').style.display = mode === 'T' ? 'flex' : 'none'; $('#cards').style.display = mode === 'C' ? 'block' : 'none';
  $('#mT').classList.toggle('on', mode === 'T'); $('#mC').classList.toggle('on', mode === 'C');
  try { if (mode === 'T') { const r = R[$('#root').value || 0]; $('#tree').innerHTML = r ? `<ul>${unit(r)}</ul>` : '<p class="err">لسه مفيش بيانات</p>'; } else showCards(); }
  catch (e) { fail('خطأ في العرض: ' + e.message); }
}
function setMode(m) { mode = m; try { localStorage.setItem('ftmode', m); } catch (e) { } draw(); }
$('#mT').onclick = () => setMode('T'); $('#mC').onclick = () => setMode('C');
$('#cards').onclick = e => {
  const nv = e.target.closest('[data-nav]'); if (nv) { nav = nav.slice(0, +nv.dataset.nav + 1); return showCards(); }
  const pk = e.target.closest('[data-peek]'); if (pk) return peek(pk.dataset.peek);
  const g = e.target.closest('[data-go]'); if (g && g.dataset.go !== nav[nav.length - 1]) { nav.push(g.dataset.go); showCards(); scrollTo({ top: 0, behavior: 'smooth' }); }
};
(async () => {
  if (typeof unit === 'undefined') return fail('ملف treelib.js مش موجود جنب tree.html — لازم يترفع مع باقي الملفات');
  try {
    (await db.collection('people').get()).forEach(d => P[d.id] = { id: d.id, ...d.data() });
    normalize();
    const hasPar = p => P[p.fatherId] || P[p.motherId], skip = new Set(), all = Object.values(P).sort((a, b) => bk(a) - bk(b));
    R = all.filter(p => !hasPar(p) && !(p.spouseIds || []).some(s => P[s] && hasPar(P[s])))
      .filter(p => { if (skip.has(p.id)) return false; (p.spouseIds || []).forEach(s => skip.add(s)); return true; });
    R = R.map(p => p.gender === 'f' ? ((p.spouseIds || []).map(i => P[i]).find(s => s && s.gender === 'm' && !hasPar(s)) || p) : p).sort((a, b) => bk(a) - bk(b));
    if (!R.length) R = [all.find(p => p.gender === 'm') || all[0]].filter(Boolean);
    if (R.length > 1) { $('#root').hidden = false; $('#root').innerHTML = R.map((p, i) => `<option value="${i}">فرع: ${esc(p.fullName)}</option>`).join(''); $('#root').onchange = () => { nav = []; draw(); }; }
    draw();
  } catch (e) { fail('تعذر تحميل البيانات: ' + e.message); }
})();
