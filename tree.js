let P = {}, R = []; const $ = s => document.querySelector(s);
const fail = m => { $('#tree').innerHTML = '<p class="err"></p>'; $('#tree .err').textContent = m; };
function draw() {
  try { const r = R[$('#root').value || 0]; $('#tree').innerHTML = r ? `<ul>${unit(r)}</ul>` : '<p class="err">لسه مفيش بيانات</p>'; }
  catch (e) { fail('خطأ في رسم الشجرة: ' + e.message); }
}
(async () => {
  if (typeof unit === 'undefined') return fail('ملف treelib.js مش موجود جنب tree.html — لازم يترفع مع باقي الملفات');
  try {
    (await db.collection('people').get()).forEach(d => P[d.id] = { id: d.id, ...d.data() });
    normalize();
    const hasPar = p => P[p.fatherId] || P[p.motherId], skip = new Set(), all = Object.values(P).sort((a, b) => bd(a).localeCompare(bd(b)));
    R = all.filter(p => !hasPar(p) && !(p.spouseIds || []).some(s => P[s] && hasPar(P[s])))
      .filter(p => { if (skip.has(p.id)) return false; (p.spouseIds || []).forEach(s => skip.add(s)); return true; });
    if (!R.length) R = all.slice(0, 1);
    if (R.length > 1) { $('#root').hidden = false; $('#root').innerHTML = R.map((p, i) => `<option value="${i}">فرع: ${esc(p.fullName)}</option>`).join(''); $('#root').onchange = draw; }
    draw();
  } catch (e) { fail('تعذر تحميل البيانات: ' + e.message); }
})();
