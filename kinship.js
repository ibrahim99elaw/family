const kidsMap = P => { const kids = {}; Object.values(P).forEach(p => [p.fatherId, p.motherId].forEach(x => { if (x && P[x]) (kids[x] = kids[x] || []).push(p.id); })); return kids; };
// قرابة الدم: ممنوع النزول ثم الطلوع (عشان الزوجين ميتحسبوش قرايب عن طريق أولادهم)
function bloodPath(P, a, b) {
  const kids = kidsMap(P), prev = { [a + '|0']: null }, q = [[a, 0]]; let end = null;
  while (q.length) {
    const [c, ph] = q.shift(); if (c === b) { end = c + '|' + ph; break; }
    const p = P[c], n = [];
    if (!ph) { if (P[p.fatherId]) n.push([p.fatherId, 0, 'f']); if (P[p.motherId]) n.push([p.motherId, 0, 'm']); }
    (kids[c] || []).forEach(x => n.push([x, 1, 'd']));
    n.forEach(([id, ph2, t]) => { const key = id + '|' + ph2; if (!(key in prev)) { prev[key] = [c + '|' + ph, t]; q.push([id, ph2]); } });
  }
  if (!end) return null;
  const path = []; let key = end;
  while (prev[key]) { path.unshift({ id: key.split('|')[0], t: prev[key][1] }); key = prev[key][0]; }
  return [{ id: a, t: null }, ...path];
}
function bfsPath(P, a, b) {   // أي طريق (بيعدّي على الزواج) — آخر حل
  const kids = kidsMap(P), prev = { [a]: null }, q = [a];
  while (q.length) {
    const c = q.shift(); if (c === b) break;
    const p = P[c], n = [];
    if (P[p.fatherId]) n.push([p.fatherId, 'f']); if (P[p.motherId]) n.push([p.motherId, 'm']);
    (kids[c] || []).forEach(x => n.push([x, 'd'])); (p.spouseIds || []).forEach(s => P[s] && n.push([s, 's']));
    n.forEach(([id, t]) => { if (!(id in prev)) { prev[id] = [c, t]; q.push(id); } });
  }
  if (!(b in prev)) return null;
  const path = []; let c = b; while (c !== a) { path.unshift({ id: c, t: prev[c][1] }); c = prev[c][0]; }
  return [{ id: a, t: null }, ...path];
}
const findPath = (P, a, b) => bloodPath(P, a, b) || bfsPath(P, a, b);
const nom = t => t === 'أخ' ? 'أخو' : t === 'أب' ? 'أبو' : t, gen = t => t === 'أخ' ? 'أخي' : t === 'أب' ? 'أبي' : t;
// كل صلات القرابة بين شخصين مرتبة من الأقرب: زواج مباشر، قرابة دم، مصاهرة (حما، كنة، عديل، سلفة...)
function relations(P, a, b) {
  const A = P[a], B = P[b], out = [], sp = id => (P[id].spouseIds || []).filter(s => P[s]), zw = g => g === 'f' ? 'زوجة' : 'زوج', mB = B.gender === 'm';
  if (sp(a).includes(b)) out.push({ label: zw(B.gender), path: [{ id: a, t: null }, { id: b, t: 's' }], d: 0, m: 1 });
  const bl = bloodPath(P, a, b), bd = bl ? bl.length - 1 : Infinity;
  if (bl) out.push({ label: term(P, bl), path: bl, d: bd, m: 0 });
  const one = [], dbl = [];
  sp(a).forEach(s => { if (s === b) return; const p = bloodPath(P, s, b); if (!p) return; const t = term(P, p);
    one.push({ label: t === 'أب' ? 'حما' : t === 'أم' ? 'حماة' : nom(t) + ' ' + zw(P[s].gender), path: [{ id: a, t: null }, { id: s, t: 's' }, ...p.slice(1)], d: p.length, m: 1 }); });
  sp(b).forEach(x => { if (x === a) return; const p = bloodPath(P, a, x); if (!p) return; const t = term(P, p);
    one.push({ label: t === 'ابن' && !mB ? 'كنة' : t === 'بنت' && mB ? 'صهر' : zw(B.gender) + ' ' + gen(t), path: [...p, { id: b, t: 's' }], d: p.length, m: 1 }); });
  sp(a).forEach(s => sp(b).forEach(x => {
    if (s === x || s === b || x === a) return; const p = bloodPath(P, s, x); if (!p || p.length !== 3) return; const t = term(P, p); if (t !== 'أخ' && t !== 'أخت') return;
    dbl.push({ label: A.gender === B.gender ? (A.gender === 'm' ? 'عديل' : 'سلفة') : zw(B.gender) + ' ' + gen(t) + ' ' + zw(P[s].gender), path: [{ id: a, t: null }, { id: s, t: 's' }, ...p.slice(1), { id: b, t: 's' }], d: p.length + 1, m: 1 }); }));
  if (!(out.length && out[0].d === 0)) one.sort((p, q) => p.d - q.d).filter(r => r.d < bd).slice(0, 2).forEach(r => out.push(r));
  dbl.forEach(r => out.push(r));
  out.sort((p, q) => p.d - q.d || q.m - p.m);
  if (!out.length) { const p = bfsPath(P, a, b); if (p) out.push({ label: 'قرابة مصاهرة (بالزواج)', path: p }); }
  return out.map(({ label, path }) => ({ label, path }));
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
