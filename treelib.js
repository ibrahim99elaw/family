const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dg = s => String(s || '').replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632).replace(/[۰-۹]/g, c => c.charCodeAt(0) - 1776);
// مفتاح السن: يقبل 2002-05-14 أو 14/5/2002 أو 5/2002 أو 2002 (واللي مفيش له تاريخ بيروح آخر الترتيب)
function bk(p) {
  const s = dg(p.birth); let m;
  if ((m = s.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/))) return +m[1] * 1e4 + +m[2] * 100 + +m[3];
  if ((m = s.match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/))) return +m[3] * 1e4 + +m[2] * 100 + +m[1];
  if ((m = s.match(/(\d{1,2})\D+(\d{4})/))) return +m[2] * 1e4 + +m[1] * 100;
  if ((m = s.match(/\d{4}/))) return +m[0] * 1e4;
  return 99991231;
}
const sibsOf = p => Object.values(P).filter(x => x.id !== p.id && ((p.fatherId && x.fatherId === p.fatherId) || (p.motherId && x.motherId === p.motherId))).sort((a, b) => bk(a) - bk(b));
const card = (p, self) => `<a class="pc ${p.gender === 'f' ? 'f' : 'm'}${self ? ' self' : ''}" href="index.html#${p.id}${self ? '/details' : ''}"><div class="pa">${p.photo ? `<img src="${esc(p.photo)}">` : esc((p.name || '?')[0])}</div><b>${esc(p.name)}</b></a>`;
// وحدة = شخص + أزواجه، وتحتها كل أبنائهم (الابن يظهر عند الأب وعند الأم لو من فرعين)
function unit(p, stack = [], self) {
  const st = [...stack, p.id];
  const sp = (p.spouseIds || []).map(i => P[i]).filter(s => s && !st.includes(s.id));
  const ids = [p.id, ...sp.map(s => s.id)], used = [...st, ...sp.map(s => s.id)];
  const ks = Object.values(P).filter(x => !used.includes(x.id) && (ids.includes(x.fatherId) || ids.includes(x.motherId))).sort((a, b) => bk(a) - bk(b));
  return `<li><div class="unit">${[p, ...sp].sort((a, b) => (a.gender === 'f') - (b.gender === 'f')).map(x => card(x, x.id === self)).join('<span class="lv">♥</span>')}</div>${ks.length ? `<ul>${ks.map(k => unit(k, used, self)).join('')}</ul>` : ''}</li>`;
}

// يكمّل بيانات الأزواج: الربط من الطرفين + الأب والأم لأي ابن يتعاملوا كزوجين
function normalize() {
  const add = (a, b) => { const s = P[a].spouseIds = P[a].spouseIds || []; if (!s.includes(b)) s.push(b); };
  Object.values(P).forEach(p => {
    (p.spouseIds || []).slice().forEach(s => P[s] && add(s, p.id));
    if (P[p.fatherId] && P[p.motherId]) { add(p.fatherId, p.motherId); add(p.motherId, p.fatherId); }
  });
}
