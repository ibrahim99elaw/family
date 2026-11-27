// طباعة الشجرة كاملة كبوستر للتبرويز: بتتظبط على مقاس الورق، وفيها عنوان وإطار و QR للموقع
const PAPER = { A4: [210, 297], A3: [297, 420], A2: [420, 594], A1: [594, 841], '50x70': [500, 700] };
const siteUrl = () => new URL('index.html', location.href).href;
function qrImg(text, px) {
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), s = Math.max(2, Math.floor(px / (n + 8))), c = document.createElement('canvas');
  c.width = c.height = s * (n + 8); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#2a2118';
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect((k + 4) * s, (r + 4) * s, s, s);
  return c.toDataURL('image/png');
}
function buildPoster(o) {
  const mm = 96 / 25.4, [pw, ph] = PAPER[o.paper];
  const roots = (o.all ? R : [R[$('#root').value || 0] || R[0]]).filter(Boolean);
  const inner = roots.map(r => `<div class="tree"><ul>${unit(r)}</ul></div>`).join('');
  const meas = document.createElement('div'); meas.className = 'poster'; meas.style.cssText = 'display:block;position:absolute;left:-99999px;top:0;width:max-content;height:auto;visibility:hidden';
  meas.innerHTML = `<div class="pt">${inner}</div>`; document.body.appendChild(meas);
  const nat = meas.firstChild.getBoundingClientRect(); meas.remove();
  const land = o.orient === 'land' || (o.orient === 'auto' && nat.width > nat.height);
  const W = land ? ph : pw, H = land ? pw : ph, Wp = W * mm, Hp = H * mm, u = Math.min(Wp, Hp) / 100;
  const edge = 5.2 * u, headH = 11 * u, footH = 15 * u, s = Math.min((Wp - 2 * edge) / nat.width, (Hp - 2 * edge - headH - footH) / nat.height, 2);
  const box = (a, st) => `<div style="position:absolute;top:${a}px;right:${a}px;bottom:${a}px;left:${a}px;${st}"></div>`;
  const el = document.createElement('div'); el.id = 'poster'; el.className = 'poster'; el.style.width = W + 'mm'; el.style.height = (H - 0.8) + 'mm';
  el.innerHTML = box(1.6 * u, `border:${.5 * u}px solid #b08a3c;border-radius:${1.2 * u}px`) + box(2.6 * u, `border:${.15 * u}px solid #b08a3c`) + `
  <div style="position:absolute;top:${edge}px;left:${edge}px;right:${edge}px;height:${headH}px;text-align:center"><div style="font-size:${4.6 * u}px;font-weight:800;color:#7a5a16;line-height:1.25">${esc(o.title)}</div><div style="font-size:${1.7 * u}px;color:#6b5d4a">${Object.keys(P).length} فرد</div></div>
  <div style="position:absolute;top:${edge + headH}px;left:${edge}px;right:${edge}px;bottom:${edge + footH}px;display:flex;align-items:center;justify-content:center;overflow:hidden"><div style="width:${nat.width * s}px;height:${nat.height * s}px;flex:none;direction:ltr"><div class="pt" style="transform:scale(${s});transform-origin:0 0">${inner}</div></div></div>
  <div style="position:absolute;bottom:${edge * .9}px;left:${edge}px;right:${edge}px;height:${footH}px;display:flex;align-items:center;justify-content:space-between"><div style="font-size:${1.5 * u}px;color:#6b5d4a;line-height:1.7">${esc(new URL(siteUrl()).host)}<br>${new Date().toLocaleDateString('ar-EG')}</div><div style="text-align:center"><img src="${qrImg(siteUrl(), 700)}" style="width:${11 * u}px;height:${11 * u}px;display:block"><div style="font-size:${1.3 * u}px;color:#6b5d4a">امسح للدخول للموقع</div></div></div>`;
  return { el, W, H };
}
function preparePoster(o) {
  const old = document.getElementById('poster'); if (old) old.remove();
  const { el, W, H } = buildPoster(o); document.body.appendChild(el);
  let st = document.getElementById('pgst'); if (!st) { st = document.createElement('style'); st.id = 'pgst'; document.head.appendChild(st); }
  st.textContent = `@page{size:${W}mm ${H}mm;margin:0}`;
}
$('#prBtn').onclick = () => { $('#prp').hidden = !$('#prp').hidden; $('#prB').hidden = R.length < 2; try { $('#prT').value = localStorage.getItem('ftTitle') || $('#prT').value; } catch (e) { } };
$('#prGo').onclick = () => {
  if (!R.length) return alert('مفيش بيانات تتطبع لسه');
  const title = $('#prT').value.trim() || 'شجرة العائلة'; try { localStorage.setItem('ftTitle', title); } catch (e) { }
  preparePoster({ title, paper: $('#prP').value, orient: $('#prO').value, all: R.length > 1 && $('#prB').value === 'all' });
  setTimeout(() => window.print(), 400);
};
window.addEventListener('afterprint', () => { const e = document.getElementById('poster'); if (e) e.remove(); });
