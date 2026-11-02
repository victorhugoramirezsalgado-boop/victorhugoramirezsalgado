// © 2026 Víctor Hugo Ramírez Salgado — Morse sonoro (al tocar) y selector de idiomas
(() => {
  const M = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--','?':'..--..','/':'-..-.','@':'.--.-.' };
  const limpia = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const aMorse = (t) => limpia(t).split(' ').map((p) => p.split('').map((c) => M[c] || '').filter(Boolean).join(' ')).join(' / ');
  const salida = document.getElementById('morse');
  let ctx = null, sonando = false;
  function toca(texto) {
    if (sonando) return;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    if (ctx.state === 'suspended') ctx.resume();
    const u = 0.07; let t = ctx.currentTime + 0.05;
    const codigo = aMorse(texto); if (salida) salida.textContent = codigo; sonando = true;
    for (const s of codigo) {
      if (s === '.' || s === '-') {
        const o = ctx.createOscillator(), g = ctx.createGain(), d = s === '.' ? u : 3 * u;
        o.frequency.value = 620; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.005);
        g.gain.setValueAtTime(0.25, t + d - 0.005); g.gain.linearRampToValueAtTime(0, t + d);
        o.start(t); o.stop(t + d); t += d + u;
      } else if (s === ' ') t += 2 * u; else if (s === '/') t += 4 * u;
    }
    setTimeout(() => { sonando = false; }, (t - ctx.currentTime) * 1000);
  }
  document.addEventListener('click', (e) => { const el = e.target.closest('[data-morse]'); if (el) toca(el.dataset.morse); });

  const sel = document.getElementById('idioma');
  if (sel) sel.addEventListener('change', (e) => {
    const l = e.target.value; if (!l) return;
    const host = location.hostname.replace(/-/g, '--').replace(/\./g, '-');
    location.href = `https://${host}.translate.goog${location.pathname}?_x_tr_sl=es&_x_tr_tl=${l}&_x_tr_hl=${l}`;
  });
})();
