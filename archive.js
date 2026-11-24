const $ = s => document.querySelector(s);
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const yrOf = x => +((String(x.year || '').replace(/[٠-٩]/g, c => c.charCodeAt(0) - 1632).match(/\d{4}/) || [9999])[0]);
let items = [], cur = 0, tx = 0;
function show(i) {
  cur = (i + items.length) % items.length; const it = items[cur];
  $('#lbi').src = it.full || it.thumb; $('#lbc').textContent = (it.year ? it.year + ' — ' : '') + (it.caption || ''); $('#lbd').removeAttribute('href'); $('#lb').classList.add('on');
  if (!it.full) db.collection('archiveFull').doc(it.id).get().then(d => { if (d.exists) { it.full = d.data().img; if (items[cur] === it) { $('#lbi').src = it.full; $('#lbd').href = it.full; $('#lbd').download = 'archive-' + (it.year || it.id) + '.jpg'; } } }).catch(() => { });
  else { $('#lbd').href = it.full; $('#lbd').download = 'archive-' + (it.year || it.id) + '.jpg'; }
}
(async () => {
  try {
    const s = await db.collection('archive').orderBy('ts').get();
    items = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => yrOf(a) - yrOf(b) || a.ts - b.ts);
    $('#grid').innerHTML = items.length ? items.map((x, i) => `<figure data-i="${i}"><img loading="lazy" src="${x.thumb}"><figcaption>${x.year ? `<b>${esc(x.year)}</b> ` : ''}${esc(x.caption)}</figcaption></figure>`).join('') : '<p class="err">الأرشيف لسه فاضي</p>';
  } catch (e) { $('#grid').innerHTML = '<p class="err"></p>'; $('#grid .err').textContent = 'تعذر تحميل الأرشيف: ' + e.message; }
})();
$('#grid').onclick = e => { const f = e.target.closest('figure'); if (f) show(+f.dataset.i); };
$('#lbx').onclick = () => $('#lb').classList.remove('on');
$('#lbp').onclick = () => show(cur - 1); $('#lbn').onclick = () => show(cur + 1);
$('#lb').onclick = e => { if (e.target.id === 'lb') $('#lb').classList.remove('on'); };
$('#lb').addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; });
$('#lb').addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 60) show(cur + (d < 0 ? 1 : -1)); });
document.addEventListener('keydown', e => { if (!$('#lb').classList.contains('on')) return; if (e.key === 'Escape') $('#lbx').click(); if (e.key === 'ArrowLeft') show(cur + 1); if (e.key === 'ArrowRight') show(cur - 1); });
