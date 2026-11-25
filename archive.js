const $ = s => document.querySelector(s);
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const yrOf = x => +((String(x.year || '').replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632).match(/\d{4}/) || [9999])[0]);
const secOf = x => x.section || x.caption || 'بدون قسم';   // الصور القديمة بتتحط تحت قسم بنفس وصفها
let ALL = [], secs = [], items = [], cur = 0, tx = 0;
function albums() {
  $('#back').style.display = 'none'; $('#ttl').textContent = '🗂 الأرشيف'; $('#grid').className = 'ag';
  $('#grid').innerHTML = secs.length ? secs.map((s, i) => `<figure class="al" data-s="${i}">${s.cover ? `<img loading="lazy" src="${s.cover}">` : '<div class="ph">🗂</div>'}<figcaption><b>${esc(s.name)}</b><br>${s.count} صورة</figcaption></figure>`).join('') : '<p class="err">الأرشيف لسه فاضي</p>';
}
function openSec(i) {
  const s = secs[i]; items = ALL.filter(x => secOf(x) === s.name).sort((a, b) => yrOf(a) - yrOf(b) || a.ts - b.ts);
  $('#back').style.display = 'inline-block'; $('#ttl').textContent = '🗂 ' + s.name;
  $('#grid').innerHTML = items.length ? items.map((x, k) => `<figure data-i="${k}"><img loading="lazy" src="${x.thumb}"><figcaption>${x.year ? `<b>${esc(x.year)}</b> ` : ''}${x.section ? esc(x.caption) : ''}</figcaption></figure>`).join('') : '<p class="err">القسم فاضي لسه</p>';
  scrollTo(0, 0);
}
function show(i) {
  cur = (i + items.length) % items.length; const it = items[cur];
  $('#lbi').src = it.full || it.thumb; $('#lbc').textContent = (it.year ? it.year + ' — ' : '') + (it.section ? it.caption || '' : ''); $('#lbd').removeAttribute('href'); $('#lb').classList.add('on');
  if (!it.full) db.collection('archiveFull').doc(it.id).get().then(d => { if (d.exists) { it.full = d.data().img; if (items[cur] === it) { $('#lbi').src = it.full; $('#lbd').href = it.full; $('#lbd').download = 'archive-' + (it.year || it.id) + '.jpg'; } } }).catch(() => { });
  else { $('#lbd').href = it.full; $('#lbd').download = 'archive-' + (it.year || it.id) + '.jpg'; }
}
(async () => {
  try {
    const docs = (await db.collection('archive').orderBy('ts').get()).docs.map(d => ({ id: d.id, ...d.data() })), map = new Map();
    ALL = docs.filter(x => x.thumb);
    docs.filter(x => x.isSection).forEach(x => map.set(x.name, { name: x.name, ts: x.ts, count: 0, cover: '' }));
    ALL.forEach(x => { const n = secOf(x); if (!map.has(n)) map.set(n, { name: n, ts: x.ts, count: 0, cover: '' }); const m = map.get(n); m.count++; m.ts = Math.min(m.ts, x.ts); if (!m.cover) m.cover = x.thumb; });
    secs = [...map.values()].sort((a, b) => a.ts - b.ts); albums();
  } catch (e) { $('#grid').innerHTML = '<p class="err"></p>'; $('#grid .err').textContent = 'تعذر تحميل الأرشيف: ' + e.message; }
})();
$('#grid').onclick = e => { const f = e.target.closest('figure'); if (!f) return; if (f.dataset.s !== undefined) openSec(+f.dataset.s); else if (f.dataset.i !== undefined) show(+f.dataset.i); };
$('#back').onclick = e => { e.preventDefault(); albums(); };
$('#lbx').onclick = () => $('#lb').classList.remove('on');
$('#lbp').onclick = () => show(cur - 1); $('#lbn').onclick = () => show(cur + 1);
$('#lb').onclick = e => { if (e.target.id === 'lb') $('#lb').classList.remove('on'); };
$('#lb').addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; });
$('#lb').addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 60) show(cur + (d < 0 ? 1 : -1)); });
document.addEventListener('keydown', e => { if (!$('#lb').classList.contains('on')) return; if (e.key === 'Escape') $('#lbx').click(); if (e.key === 'ArrowLeft') show(cur + 1); if (e.key === 'ArrowRight') show(cur - 1); });
