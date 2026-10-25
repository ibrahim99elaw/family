const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bd = p => p.birth || '9999';
const card = (p, self) => `<a class="pc ${p.gender === 'f' ? 'f' : 'm'}${self ? ' self' : ''}" href="index.html#${p.id}${self ? '/details' : ''}"><div class="pa">${p.photo ? `<img src="${esc(p.photo)}">` : esc((p.name || '?')[0])}</div><b>${esc(p.name)}</b></a>`;
// وحدة = شخص + أزواجه، وتحتها كل أبنائهم (الابن يظهر عند الأب وعند الأم لو من فرعين)
function unit(p, stack = [], self) {
  const st = [...stack, p.id];
  const sp = (p.spouseIds || []).map(i => P[i]).filter(s => s && !st.includes(s.id));
  const ids = [p.id, ...sp.map(s => s.id)], used = [...st, ...sp.map(s => s.id)];
  const ks = Object.values(P).filter(x => !used.includes(x.id) && (ids.includes(x.fatherId) || ids.includes(x.motherId))).sort((a, b) => bd(a).localeCompare(bd(b)));
  return `<li><div class="unit">${[p, ...sp].map(x => card(x, x.id === self)).join('<span class="lv">♥</span>')}</div>${ks.length ? `<ul>${ks.map(k => unit(k, used, self)).join('')}</ul>` : ''}</li>`;
}

// يكمّل بيانات الأزواج: الربط من الطرفين + الأب والأم لأي ابن يتعاملوا كزوجين
function normalize() {
  const add = (a, b) => { const s = P[a].spouseIds = P[a].spouseIds || []; if (!s.includes(b)) s.push(b); };
  Object.values(P).forEach(p => {
    (p.spouseIds || []).slice().forEach(s => P[s] && add(s, p.id));
    if (P[p.fatherId] && P[p.motherId]) { add(p.fatherId, p.motherId); add(p.motherId, p.fatherId); }
  });
}
