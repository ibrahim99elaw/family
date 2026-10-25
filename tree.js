let P = {}, R = []; const $ = s => document.querySelector(s);
function draw() { const r = R[$('#root').value || 0]; $('#tree').innerHTML = r ? `<ul>${unit(r)}</ul>` : '<p class="err">لسه مفيش بيانات</p>'; }
(async () => {
  (await db.collection('people').get()).forEach(d => P[d.id] = { id: d.id, ...d.data() });
  const hasPar = p => P[p.fatherId] || P[p.motherId], skip = new Set();
  R = Object.values(P).filter(p => !hasPar(p) && !(p.spouseIds || []).some(s => P[s] && hasPar(P[s]))).sort((a, b) => bd(a).localeCompare(bd(b)))
    .filter(p => { if (skip.has(p.id)) return false; (p.spouseIds || []).forEach(s => skip.add(s)); return true; });
  if (R.length > 1) { $('#root').hidden = false; $('#root').innerHTML = R.map((p, i) => `<option value="${i}">فرع: ${esc(p.fullName)}</option>`).join(''); $('#root').onchange = draw; }
  draw();
})();
