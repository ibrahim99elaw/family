// أقصر مسار بين شخصين (الدم أولًا، ولو مفيش نستخدم الزواج)
function findPath(P, a, b) {
  const kids = {};
  Object.values(P).forEach(p => [p.fatherId, p.motherId].forEach(x => { if (x && P[x]) (kids[x] = kids[x] || []).push(p.id); }));
  for (const sp of [false, true]) {
    const prev = { [a]: null }, q = [a];
    while (q.length) {
      const c = q.shift(); if (c === b) break;
      const p = P[c], n = [];
      if (p.fatherId && P[p.fatherId]) n.push([p.fatherId, 'f']);
      if (p.motherId && P[p.motherId]) n.push([p.motherId, 'm']);
      (kids[c] || []).forEach(k => n.push([k, 'd']));
      if (sp) (p.spouseIds || []).forEach(s => P[s] && n.push([s, 's']));
      n.forEach(([id, t]) => { if (!(id in prev)) { prev[id] = [c, t]; q.push(id); } });
    }
    if (b in prev) {
      const path = []; let c = b;
      while (c !== a) { path.unshift({ id: c, t: prev[c][1] }); c = prev[c][0]; }
      return [{ id: a, t: null }, ...path];
    }
  }
  return null;
}
// صلة قرابة الشخص الأخير بالنسبة للأول
function term(P, path) {
  const B = P[path.at(-1).id], m = B.gender === 'm';
  const ts = path.slice(1).map(x => x.t).join('');
  if (!ts) return 'نفس الشخص';
  if (ts.includes('s')) return ts === 's' ? (m ? 'زوج' : 'زوجة') : 'قرابة مصاهرة (بالزواج)';
  if (!/^[fm]*d*$/.test(ts)) return 'قريب';
  const u = ts.replace(/d/g, '').length, d = ts.length - u, s = ts[0] === 'f';
  const mid = P[path[u + 1] ? path[u + 1].id : ''], midM = mid && mid.gender === 'm';
  const unc = g => s ? (g ? 'عم' : 'عمة') : (g ? 'خال' : 'خالة');
  if (!d) return u === 1 ? (m ? 'أب' : 'أم') : u === 2 ? (m ? 'جد' : 'جدة') + (s ? ' لأب' : ' لأم') : (m ? 'جد' : 'جدة') + ' من الدرجة ' + u;
  if (!u) return d === 1 ? (m ? 'ابن' : 'بنت') : d === 2 ? (m ? 'حفيد' : 'حفيدة') : (m ? 'حفيد' : 'حفيدة') + ' من الجيل ' + d;
  if (u === 1 && d === 1) return m ? 'أخ' : 'أخت';
  if (u === 1 && d === 2) return (m ? 'ابن ' : 'بنت ') + (midM ? 'أخ' : 'أخت');
  if (u === 2 && d === 1) return unc(m);
  if (u === 2 && d === 2) return (m ? 'ابن ' : 'بنت ') + unc(midM);
  return 'قرابة من الدرجة ' + (u + d);
}
