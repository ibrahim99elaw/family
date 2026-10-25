const $h = id => document.getElementById(id);
function showHero(v) { $h('hero').classList.toggle('off', !v); document.body.style.overflow = v ? 'hidden' : ''; }
showHero(!location.hash);
$h('hs').onclick = () => { showHero(false); $h('s').focus(); };
async function heroInit() {
  let imgs = [];
  try { imgs = (await db.collection('gallery').orderBy('ts').get()).docs.map(d => d.data()); } catch (e) { }
  if (!imgs.length) return;
  const sl = $h('slides'), dots = $h('dots'), cap = $h('cap');
  sl.innerHTML = imgs.map(g => `<div class="sl" style="background-image:url('${g.img}')"></div>`).join('');
  dots.innerHTML = imgs.map((_, i) => `<i data-i="${i}"></i>`).join('');
  let n = 0, t;
  const go = i => { n = i; [...sl.children].forEach((e, k) => e.classList.toggle('on', k === i)); [...dots.children].forEach((e, k) => e.classList.toggle('on', k === i)); cap.textContent = imgs[i].caption || ''; };
  const run = () => { clearInterval(t); t = setInterval(() => go((n + 1) % imgs.length), 5000); };
  dots.onclick = e => { if (e.target.dataset.i) { go(+e.target.dataset.i); run(); } };
  go(0); run();
}
