// تحميل كارت الشخص و QR كصور PNG (من غير أي سيرفر)
const FONT = '"Segoe UI",Tahoma,Arial,sans-serif';
const pUrl = p => location.href.split('#')[0] + '#' + p.id + '/details';
const loadImg = src => new Promise(r => { if (!src) return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
const fit = (x, t, max) => { t = String(t); while (t.length > 1 && x.measureText(t).width > max) t = t.slice(0, -2) + '…'; return t; };
function lines(x, t, max, n) {
  const out = []; let cur = '';
  String(t || '').split(' ').forEach(w => { const nx = cur ? cur + ' ' + w : w; if (x.measureText(nx).width > max && cur) { out.push(cur); cur = w; } else cur = nx; });
  if (cur) out.push(cur); return out.slice(0, n);
}
function drawQR(x, text, cx, top, size) {
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), s = Math.floor(size / n), tot = s * n, pad = s * 4, left = cx - tot / 2;
  x.fillStyle = '#fff'; x.fillRect(left - pad, top - pad, tot + 2 * pad, tot + 2 * pad);
  x.fillStyle = '#0f1b2d';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect(left + c * s, top + r * s, s, s);
  return top + tot + pad;
}
const toBlob = c => new Promise(r => c.toBlob(r, 'image/png'));
async function makeCard(p) {
  const W = 1080, H = 1600, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), cx = W / 2; x.direction = 'rtl';
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f1b2d'); g.addColorStop(1, '#24477a'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = '#d4a954'; x.lineWidth = 6; x.strokeRect(30, 30, W - 60, H - 60);
  x.textAlign = 'center'; x.fillStyle = '#d4a954'; x.font = `bold 40px ${FONT}`; x.fillText('🌳 شجرة العائلة', cx, 125);
  const r = 170, cy = 340, img = await loadImg(p.photo);
  x.save(); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.closePath(); x.clip();
  if (img) { const m = Math.min(img.width, img.height); x.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, cx - r, cy - r, 2 * r, 2 * r); }
  else { x.fillStyle = '#d4a954'; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.fillStyle = '#1a1405'; x.font = `bold 170px ${FONT}`; x.textBaseline = 'middle'; x.fillText((p.name || '?')[0], cx, cy + 10); x.textBaseline = 'alphabetic'; }
  x.restore(); x.strokeStyle = '#d4a954'; x.lineWidth = 8; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke();
  let y = 590; x.fillStyle = '#fff'; x.font = `bold 58px ${FONT}`;
  lines(x, p.fullName || p.name, W - 160, 2).forEach(l => { x.fillText(l, cx, y); y += 70; });
  x.font = `38px ${FONT}`;
  if (p.nickname) { x.fillStyle = '#d4a954'; x.fillText('«' + p.nickname + '»', cx, y); y += 56; }
  if (p.job) { x.fillStyle = '#eef2f7'; x.fillText(fit(x, p.job, W - 160), cx, y); y += 56; }
  y = Math.max(y + 30, 790);
  const sp = (p.spouseIds || []).map(i => P[i]).filter(Boolean), ks = Object.values(P).filter(k => k.fatherId === p.id || k.motherId === p.id).sort((a, b) => bk(a) - bk(b));
  const rows = [['الميلاد', p.birth], ['الأب', P[p.fatherId] && P[p.fatherId].name], ['الأم', P[p.motherId] && P[p.motherId].name], [p.gender === 'f' ? 'الزوج' : 'الزوجة', sp.map(s => s.name).join('، ')], ['الأبناء', ks.map(k => k.name).join('، ')]];
  rows.forEach(([lab, val]) => {
    if (!val) return;
    x.textAlign = 'right'; x.font = `bold 36px ${FONT}`; x.fillStyle = '#d4a954'; x.fillText(lab + ':', W - 100, y);
    const w = x.measureText(lab + ':').width; x.font = `36px ${FONT}`; x.fillStyle = '#eef2f7'; x.fillText(fit(x, val, W - 200 - w - 20), W - 100 - w - 20, y); y += 62;
  });
  const bottom = drawQR(x, pUrl(p), cx, 1140, 300);
  x.textAlign = 'center'; x.fillStyle = '#9fb0c6'; x.font = `30px ${FONT}`; x.fillText('امسح الكود لفتح صفحته', cx, bottom + 48);
  return toBlob(c);
}
async function makeQR(p) {
  const c = document.createElement('canvas'); c.width = 900; c.height = 1080;
  const x = c.getContext('2d'); x.direction = 'rtl'; x.fillStyle = '#fff'; x.fillRect(0, 0, 900, 1080);
  const bottom = drawQR(x, pUrl(p), 450, 90, 700);
  x.textAlign = 'center'; x.fillStyle = '#0f1b2d'; x.font = `bold 54px ${FONT}`; x.fillText(fit(x, p.fullName || p.name, 800), 450, bottom + 70);
  x.fillStyle = '#6b7a90'; x.font = `32px ${FONT}`; x.fillText('امسح الكود لفتح صفحة التفاصيل', 450, bottom + 130);
  return toBlob(c);
}
function save(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-dl]'); if (!b) return;
  const p = P[b.dataset.id]; if (!p) return; const old = b.textContent; b.textContent = '⏳ لحظة...';
  try {
    const qr = b.dataset.dl === 'qr', blob = await (qr ? makeQR(p) : makeCard(p)), name = (qr ? 'qr-' : 'card-') + p.name + '.png';
    if (b.dataset.share) { const f = new File([blob], name, { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: p.fullName }); else save(blob, name); }
    else save(blob, name);
  } catch (err) { if (err.name !== 'AbortError') alert('تعذر إنشاء الصورة: ' + err.message); }
  b.textContent = old;
});
