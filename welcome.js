// رسالة/أغنية الترحيب: بتتحمّل أول ما الموقع يفتح، وبتشتغل لوحدها لو المتصفح سمح، وإلا مع أول لمسة
(async () => {
  let meta;
  try { const d = await db.collection('audio').doc('welcome').get(); if (!d.exists) return; meta = d.data(); } catch (e) { return; }
  const btn = document.createElement('button'); btn.id = 'snd'; btn.textContent = '⏳'; document.body.appendChild(btn);
  const au = new Audio(); au.loop = !!meta.loop; window.welcomeAudio = au; let ready = false;
  const label = () => { btn.textContent = !ready ? '⏳' : au.paused ? '🔊 ' + (meta.title || 'رسالة') : '⏸ ' + (meta.title || 'رسالة'); };
  const go = () => au.play().then(() => { try { sessionStorage.setItem('welcomed', '1'); } catch (e) { } return true; }).catch(() => false);
  au.onplay = au.onpause = au.onended = label;
  btn.onclick = () => { if (ready) au.paused ? go() : au.pause(); };
  try {
    const parts = await Promise.all([...Array(meta.chunks)].map((_, i) => db.collection('audioChunks').doc('welcome_' + i).get()));
    const blob = await (await fetch(`data:${meta.mime};base64,` + parts.map(p => p.data().d).join(''))).blob();
    au.src = URL.createObjectURL(blob); ready = true; label();
  } catch (e) { btn.remove(); return; }
  let done = false; try { done = sessionStorage.getItem('welcomed') === '1'; } catch (e) { }
  if (done) return;
  if (await go()) return;
  const h = e => { if (e.target.closest && e.target.closest('#snd')) return; ['pointerdown', 'keydown'].forEach(v => removeEventListener(v, h, true)); go(); };
  ['pointerdown', 'keydown'].forEach(v => addEventListener(v, h, true));
})();
