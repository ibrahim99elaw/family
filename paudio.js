// رسالة صوتية خاصة بكل شخص: بتتحمّل لما حد يفتح صفحته، وبتشتغل لوحدها لو المتصفح سمح، وإلا بزرار أو مع أول لمسة
let pAu = null, pId = null, pTok = 0; window.pAuPlaying = false;
function stopPersonAudio() { pTok++; if (pAu) { pAu.pause(); pAu = null; } pId = null; window.pAuPlaying = false; }
function bindPerson(p, au) {
  const btn = document.getElementById('pauBtn'); if (!btn) return;
  const lab = () => { window.pAuPlaying = !au.paused; btn.textContent = au.paused ? `🔊 اسمع رسالة ${p.name}` : '⏸ إيقاف الرسالة'; };
  au.onplay = au.onpause = au.onended = lab; lab(); btn.onclick = () => au.paused ? play(au) : au.pause();
}
function play(au) { if (window.welcomeAudio) welcomeAudio.pause(); return au.play().then(() => true).catch(() => false); }
async function personAudio(p) {
  const slot = document.getElementById('pau'); if (!slot) return;
  if (pAu && pId === p.id) { slot.innerHTML = '<div class="card"><button type="button" id="pauBtn"></button></div>'; bindPerson(p, pAu); return; }   // نفس الشخص: من غير ما الصوت يرجع من الأول
  stopPersonAudio(); const tok = pTok;
  let meta; try { const d = await db.collection('audio').doc('p_' + p.id).get(); if (!d.exists) return; meta = d.data(); } catch (e) { return; }
  if (tok !== pTok) return;
  slot.innerHTML = '<div class="card"><button type="button" id="pauBtn">⏳ جاري تحميل الرسالة الصوتية...</button></div>';
  try {
    const parts = await Promise.all([...Array(meta.chunks)].map((_, i) => db.collection('audioChunks').doc('p_' + p.id + '_' + i).get()));
    const blob = await (await fetch(`data:${meta.mime};base64,` + parts.map(x => x.data().d).join(''))).blob();
    if (tok !== pTok) return;
    const au = pAu = new Audio(URL.createObjectURL(blob)); pId = p.id; bindPerson(p, au);
    if (!(await play(au))) { const h = e => { if (e.target.closest && e.target.closest('#pauBtn')) return; ['pointerdown', 'keydown'].forEach(v => removeEventListener(v, h, true)); if (pAu === au && au.paused) play(au); }; ['pointerdown', 'keydown'].forEach(v => addEventListener(v, h, true)); }
  } catch (e) { slot.innerHTML = ''; }
}
