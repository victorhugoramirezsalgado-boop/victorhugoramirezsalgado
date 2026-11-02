// © 2026 Víctor Hugo Ramírez Salgado — panel: estado.json, Morse sonoro y selector de idiomas
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clase = (e) => ({ 'Activo': 'ok', 'En desarrollo': 'dev', 'En preparación': 'prep' }[e] || 'prep');

  // ---------- Contenido desde estado.json ----------
  fetch('estado.json', { cache: 'no-store' })
    .then((r) => r.json())
    .then((d) => {
      $('actualizado').textContent = d.actualizado || '—';
      if (d.lema) $('lema').textContent = d.lema;
      $('lista-proyectos').innerHTML = (d.proyectos || []).map((p) => `
        <article class="tarjeta">
          <div class="cab"><h3 data-morse="${esc(p.nombre)}">${esc(p.nombre)}</h3><span class="estatus ${clase(p.estatus)}">${esc(p.estatus)}</span></div>
          <p>${esc(p.nota)}</p>
          <a href="https://${esc(p.dominio)}" target="_blank" rel="noopener">${esc(p.dominio)} ↗</a>${p.copia ? `<br><a href="${esc(p.copia)}">Ver copia en vhrs.com</a>` : ''}
        </article>`).join('');
      $('lista-trayectoria').innerHTML = (d.trayectoria || []).map((t) => `<li><b>${esc(t.periodo)}</b><span>${esc(t.texto)}</span></li>`).join('');
      $('lista-registros').innerHTML = (d.registros || []).map((r) => `<li><span>${esc(r.obra)}</span><a href="https://www.safecreative.org/work/${esc(r.registro)}" target="_blank" rel="noopener"><code>${esc(r.registro)}</code> ↗</a></li>`).join('');
      $('lista-formacion').innerHTML = (d.formacion || []).map((t) => `<li><b>${esc(t.periodo)}</b><span>${esc(t.texto)}${t.liga ? ` <a href="${esc(t.liga)}" target="_blank" rel="noopener">fuente ↗</a>` : ''}</span></li>`).join('');
      $('lista-prensa').innerHTML = (d.prensa || []).map((n) => `<li><div><a href="${esc(n.liga)}" target="_blank" rel="noopener">${esc(n.titulo)} ↗</a><br><small>${esc(n.medio)}${n.fecha ? ' · ' + esc(n.fecha) : ''}${n.nota ? ' — ' + esc(n.nota) : ''}</small></div><span class="estatus ${n.verificada ? 'ok' : 'prep'}">${n.verificada ? 'Verificada' : 'Por verificar'}</span></li>`).join('');
      $('lista-sistemas').innerHTML = (d.sistemas || []).map((f) => `<h3 class="familia">${esc(f.familia)}</h3><ul class="tabla">` + f.items.map((i) => {
        const nom = i.liga ? `<a href="${esc(i.liga)}"${/^https?:/.test(i.liga) ? ' target="_blank" rel="noopener"' : ''}>${i.privado ? '🔒 ' : ''}${esc(i.nombre)}${/^https?:/.test(i.liga) ? ' ↗' : ''}</a>` : esc(i.nombre);
        const regs = (i.registros || []).map((n) => `<a href="https://www.safecreative.org/work/${esc(n)}" target="_blank" rel="noopener"><code>${esc(n)}</code></a>`).join(' ');
        return `<li><span>${nom}${i.nota ? `<br><small>${esc(i.nota)}</small>` : ''}</span><span>${regs || (i.privado ? '<small>privado</small>' : '')}</span></li>`;
      }).join('') + '</ul>').join('') + (d.en_registro ? `<p class="nota">⏳ ${esc(d.en_registro)}.</p>` : '');
      const ligas = (arr, cand) => (arr || []).map((f) => `<li><a href="${esc(f.liga)}" target="_blank" rel="noopener">${cand}${esc(f.titulo)} ↗</a></li>`).join('');
      $('lista-fuentes').innerHTML = ligas(d.fuentes, '');
      $('lista-privado').innerHTML = ligas(d.privado, '🔒 ');
    })
    .catch(() => { $('lista-proyectos').innerHTML = '<p class="nota">No se pudo cargar el estatus.</p>'; });

  // ---------- Morse sonoro (al tocar) ----------
  const M = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--','?':'..--..','/':'-..-.','@':'.--.-.' };
  const limpia = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const aMorse = (t) => limpia(t).split(' ').map((p) => p.split('').map((c) => M[c] || '').filter(Boolean).join(' ')).join(' / ');
  let ctx = null, sonando = false;
  function toca(texto) {
    if (sonando) return;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    if (ctx.state === 'suspended') ctx.resume();
    const u = 0.07; let t = ctx.currentTime + 0.05;
    const codigo = aMorse(texto); $('morse').textContent = codigo; sonando = true;
    for (const s of codigo) {
      if (s === '.' || s === '-') {
        const o = ctx.createOscillator(), g = ctx.createGain(), dur = s === '.' ? u : 3 * u;
        o.frequency.value = 620; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.005);
        g.gain.setValueAtTime(0.25, t + dur - 0.005); g.gain.linearRampToValueAtTime(0, t + dur);
        o.start(t); o.stop(t + dur); t += dur + u;
      } else if (s === ' ') t += 2 * u; else if (s === '/') t += 4 * u;
    }
    setTimeout(() => { sonando = false; }, (t - ctx.currentTime) * 1000);
  }
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-morse]');
    if (el) toca(el.dataset.morse);
  });

  // ---------- Selector de idiomas (traducción de la página completa) ----------
  $('idioma').addEventListener('change', (e) => {
    const l = e.target.value; if (!l) return;
    const host = location.hostname.replace(/-/g, '--').replace(/\./g, '-');
    location.href = `https://${host}.translate.goog${location.pathname}?_x_tr_sl=es&_x_tr_tl=${l}&_x_tr_hl=${l}`;
  });
})();
