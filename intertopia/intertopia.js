// © 2026 Víctor Hugo Ramírez Salgado — Intertopía©: consulta comparada en diccionarios
// y gráfica ilustrativa de 1ntertopía© (generación de valor). Todos los derechos reservados.
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Consulta en diccionarios ----------
  const PROPIA = 'Espacio intermedio entre la utopía y la distopía en el que la reflexión y la acción humanas generan un equilibrio dinámico capaz de transformar el futuro sin imponer un juicio absoluto sobre el bien y el mal.';
  const FUENTES = [
    { id: 'dle', n: 'Diccionario de la lengua española (RAE · ASALE, 24.ª ed.)', u: (w) => `https://dle.rae.es/${w}` },
    { id: 'damer', n: 'Diccionario de americanismos (ASALE)', u: (w) => `https://www.asale.org/damer/${w}` },
    { id: 'dpd', n: 'Diccionario panhispánico de dudas (RAE · ASALE)', u: (w) => `https://www.rae.es/dpd/${w}` },
    { id: 'dhle', n: 'Diccionario histórico de la lengua española (RAE)', u: (w) => `https://www.rae.es/dhle/${w}` },
    { id: 'obs', n: 'Observatorio de palabras (RAE)', u: (w) => `https://www.google.com/search?q=site%3Arae.es%2Fobservatorio-de-palabras+${w}` },
    { id: 'dem', n: 'Diccionario del español de México (El Colegio de México)', u: (w) => `https://www.google.com/search?q=site%3Adem.colmex.mx+${w}` },
    { id: 'aml', n: 'Academia Mexicana de la Lengua', u: (w) => `https://www.google.com/search?q=site%3Aacademia.org.mx+${w}` },
    { id: 'fundeu', n: 'FundéuRAE', u: (w) => `https://www.fundeu.es/?s=${w}` },
    { id: 'wikt', n: 'Wikcionario en español', u: (w) => `https://es.wiktionary.org/wiki/${w}`, auto: true },
    { id: 'wr', n: 'WordReference (definiciones en español)', u: (w) => `https://www.wordreference.com/definicion/${w}` }
  ];
  const clave = (w) => 'vhrs-dicc-' + w;
  const leer = (w) => { try { return JSON.parse(localStorage.getItem(clave(w)) || '{}'); } catch (e) { return {}; } };
  const guardar = (w, o) => { try { localStorage.setItem(clave(w), JSON.stringify(o)); } catch (e) {} };

  async function wikcionario(w) {
    try {
      const r = await fetch(`https://es.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(w)}&format=json&origin=*`);
      const j = await r.json();
      const p = Object.values(j.query.pages)[0];
      return p.missing === undefined ? 'si' : 'no';
    } catch (e) { return 'err'; }
  }
  async function usoWeb(w) {
    try {
      const r = await fetch(`https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=%22${encodeURIComponent(w)}%22&srlimit=1&format=json&origin=*`);
      const j = await r.json();
      return j.query.searchinfo.totalhits;
    } catch (e) { return null; }
  }

  async function consultar(ev) {
    if (ev) ev.preventDefault();
    const w = ($('dicc-palabra').value || '').trim().toLowerCase();
    if (!w) return;
    const we = encodeURIComponent(w);
    const marcas = leer(w);
    const filas = FUENTES.map((f) => {
      const m = marcas[f.id];
      const est = f.auto ? '<span class="dc-est" data-auto="wikt">Consultando…</span>'
        : m === 'si' ? '<span class="dc-est si">Sí está (verificado por ti)</span>'
        : m === 'no' ? '<span class="dc-est no">No está (verificado por ti)</span>'
        : '<span class="dc-est">Por revisar</span>';
      const botones = f.auto ? '' : `<button type="button" data-f="${f.id}" data-v="si">Sí está</button><button type="button" data-f="${f.id}" data-v="no">No está</button>`;
      return `<tr><td><a href="${f.u(we)}" target="_blank" rel="noopener">${esc(f.n)} ↗</a></td><td>${est}<div class="dc-bt">${botones}</div></td></tr>`;
    }).join('');
    const propia = (w === 'intertopía' || w === 'intertopia')
      ? `<tr class="dc-propia"><td>Propuesta del autor (Intertopía©, 13 feb 2026)</td><td><span class="dc-est si">Definición propuesta</span></td></tr><tr class="dc-propia"><td colspan="2">${esc(PROPIA)}</td></tr>` : '';
    $('dicc-resultado').innerHTML = `<table class="dc"><thead><tr><th>Fuente (toca para abrir)</th><th>¿Está «${esc(w)}»? · tu verificación</th></tr></thead><tbody>${propia}${filas}</tbody></table>
      <p class="nota" id="dicc-uso"></p>
      <p class="nota">Las academias no permiten consultas automáticas desde otros sitios: cada enlace abre la fuente oficial y tú marcas el resultado; queda guardado solo en tu navegador para comparar. Wikcionario y el uso en Wikipedia se revisan en automático.</p>`;
    const e = document.querySelector('[data-auto="wikt"]');
    const r = await wikcionario(w);
    e.textContent = r === 'si' ? 'Sí está (automático)' : r === 'no' ? 'No está (automático)' : 'Sin respuesta';
    e.className = 'dc-est ' + (r === 'si' ? 'si' : r === 'no' ? 'no' : '');
    const n = await usoWeb(w);
    if (n !== null) $('dicc-uso').textContent = `Uso documentado: «${w}» aparece en ${n.toLocaleString('es-MX')} artículo(s) de Wikipedia en español.`;
  }

  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('.dc-bt button');
    if (!b) return;
    const w = ($('dicc-palabra').value || '').trim().toLowerCase();
    const o = leer(w); o[b.dataset.f] = b.dataset.v; guardar(w, o); consultar();
  });
  const form = $('dicc-form');
  if (form) { form.addEventListener('submit', consultar); consultar(); }

  // ---------- Gráfica ilustrativa de 1ntertopía© ----------
  const cv = $('valor-lienzo');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const SERIES = [
    { n: 'ETF', c: '#7FA7D9' }, { n: 'Acciones', c: '#9AD1B0' },
    { n: 'Metales', c: '#C9CDD3' }, { n: 'Tipos de cambio', c: '#D99A9A' }
  ];
  const N = 160;
  SERIES.forEach((s, i) => { s.v = 50 + i * 3; s.d = []; for (let k = 0; k < N; k++) { s.v += (Math.random() - 0.5) * 2.2; s.d.push(s.v); } });
  const valor = []; let base = 50;
  for (let k = 0; k < N; k++) { base += 0.04 + (Math.random() - 0.45) * 0.5; valor.push(base); }
  const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function paso() {
    SERIES.forEach((s) => { s.v += (Math.random() - 0.5) * 2.2 + (50 - s.v) * 0.01; s.d.push(s.v); s.d.shift(); });
    const prom = SERIES.reduce((a, s) => a + s.d[N - 1] - s.d[N - 2], 0) / SERIES.length;
    base += 0.05 + Math.max(prom, 0) * 0.35 + (Math.random() - 0.5) * 0.12;
    valor.push(base); valor.shift();
  }
  function dibujar() {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#14171A'; ctx.fillRect(0, 0, W, H);
    const todos = SERIES.flatMap((s) => s.d).concat(valor);
    const mn = Math.min(...todos) - 4, mx = Math.max(...todos) + 4;
    const y = (v) => H - 24 - ((v - mn) / (mx - mn)) * (H - 48);
    const x = (k) => (k / (N - 1)) * W;
    // bandas utopía / distopía
    ctx.fillStyle = 'rgba(184,147,90,.10)'; ctx.fillRect(0, 0, W, H * 0.2);
    ctx.fillStyle = 'rgba(150,60,60,.12)'; ctx.fillRect(0, H * 0.8, W, H * 0.2);
    ctx.font = '12px Archivo, sans-serif'; ctx.fillStyle = '#B8935A'; ctx.fillText('UTOPÍA', 10, 16);
    ctx.fillStyle = '#C98A8A'; ctx.fillText('DISTOPÍA', 10, H - 8);
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
    for (let g = 1; g < 6; g++) { ctx.beginPath(); ctx.moveTo(0, (H / 6) * g); ctx.lineTo(W, (H / 6) * g); ctx.stroke(); }
    SERIES.forEach((s) => { ctx.strokeStyle = s.c; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.4; ctx.beginPath(); s.d.forEach((v, k) => (k ? ctx.lineTo(x(k), y(v)) : ctx.moveTo(x(k), y(v)))); ctx.stroke(); });
    ctx.globalAlpha = 1; ctx.strokeStyle = '#E2B868'; ctx.lineWidth = 3; ctx.shadowColor = '#E2B868'; ctx.shadowBlur = 8;
    ctx.beginPath(); valor.forEach((v, k) => (k ? ctx.lineTo(x(k), y(v)) : ctx.moveTo(x(k), y(v)))); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#E2B868'; ctx.beginPath(); ctx.arc(x(N - 1) - 2, y(valor[N - 1]), 4, 0, 7); ctx.fill();
    // cintas de variación
    const chips = SERIES.map((s) => { const c = ((s.d[N - 1] - s.d[N - 2]) / s.d[N - 2]) * 100; return `<span style="border-color:${s.c}">${s.n} <b class="${c >= 0 ? 'sube' : 'baja'}">${c >= 0 ? '▲' : '▼'} ${Math.abs(c).toFixed(2)} %</b></span>`; }).join('');
    const vc = ((valor[N - 1] - valor[0]) / valor[0]) * 100;
    $('valor-cintas').innerHTML = chips + `<span class="oro">Valor intertópico <b class="${vc >= 0 ? 'sube' : 'baja'}">${vc >= 0 ? '▲' : '▼'} ${Math.abs(vc).toFixed(2)} %</b></span>`;
  }
  dibujar();
  if (!quieto) setInterval(() => { paso(); dibujar(); }, 450);
  window.addEventListener('resize', dibujar);
})();
