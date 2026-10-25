let P = {}, R = []; const $ = s => document.querySelector(s), seen = new Set();
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bd = p => p.birth || '9999';
const card = p => `<a class="pc ${p.gender === 'f' ? 'f' : 'm'}" href="index.html#${p.id}"><div class="pa">${p.photo ? `<img src="${esc(p.photo)}">` : esc((p.name || '?')[0])}</div><b>${esc(p.name)}</b></a>`;
function unit(p) {
  seen.add(p.id);
  const sp = (p.spouseIds || []).map(i => P[i]).filter(s => s && !seen.has(s.id));
  sp.forEach(s => seen.add(s.id));
  const ids = [p.id, ...sp.map(s => s.id)];
  const ks = Object.values(P).filter(x => !seen.has(x.id) && (ids.includes(x.fatherId) || ids.includes(x.motherId))).sort((a, b) => bd(a).localeCompare(bd(b)));
  return `<li><div class="unit">${[p, ...sp].map(card).join('<span class="lv">♥</span>')}</div>${ks.length ? `<ul>${ks.map(unit).join('')}</ul>` : ''}</li>`;
}
function draw() { seen.clear(); const r = R[$('#root').value || 0]; $('#tree').innerHTML = r ? `<ul>${unit(r)}</ul>` : '<p class="err">لسه مفيش بيانات</p>'; }
(async () => {
  (await db.collection('people').get()).forEach(d => P[d.id] = { id: d.id, ...d.data() });
  const hasPar = p => P[p.fatherId] || P[p.motherId], skip = new Set();
  R = Object.values(P).filter(p => !hasPar(p) && !(p.spouseIds || []).some(s => P[s] && hasPar(P[s]))).sort((a, b) => bd(a).localeCompare(bd(b)))
    .filter(p => { if (skip.has(p.id)) return false; (p.spouseIds || []).forEach(s => skip.add(s)); return true; });
  if (R.length > 1) { $('#root').hidden = false; $('#root').innerHTML = R.map((p, i) => `<option value="${i}">فرع: ${esc(p.fullName)}</option>`).join(''); $('#root').onchange = draw; }
  draw();
})();
