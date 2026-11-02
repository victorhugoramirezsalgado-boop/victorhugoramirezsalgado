// © 2026 Víctor Hugo Ramírez Salgado — Archivo privado de vhrs.com.
// Lee en vivo los repositorios del titular con su clave de GitHub (solo lectura).
// La clave nunca sale del navegador salvo hacia api.github.com.
(() => {
  const TITULAR = 'victorhugoramirezsalgado-boop';
  const API = 'https://api.github.com';
  const LLAVE = 'vhrs_clave';
  const ACCESOS = [
    { t: 'Expedientes institucionales', r: 'cv-rizoma', p: 'expedientes/README.md' },
    { t: 'Registros en Safe Creative', r: 'ligas-y-fuentes-de-proyectos-', p: 'REGISTROS-SAFE-CREATIVE.md' },
    { t: 'Pendientes de SOSistem', r: 'sistema-sos', p: 'PENDIENTES.md' },
    { t: 'Ligas y fuentes del CV', r: 'cv-rizoma', p: 'LIGAS.md' },
    { t: 'Paquetes de registro', r: 'sistema-sos', p: 'registros', dir: true },
    { t: 'Documentos escaneados', r: 'ligas-y-fuentes-de-proyectos-', p: 'documentos-escaneados/salida', dir: true }
  ];
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = (p) => p.split('/').map(encodeURIComponent).join('/');

  let clave = null, repo = null, rama = null, arbol = [], dir = '', urlBlob = null;

  const guarda = {
    lee() { try { return localStorage.getItem(LLAVE) || sessionStorage.getItem(LLAVE); } catch (e) { return null; } },
    pon(v, siempre) { try { (siempre ? localStorage : sessionStorage).setItem(LLAVE, v); } catch (e) {} },
    borra() { try { localStorage.removeItem(LLAVE); sessionStorage.removeItem(LLAVE); } catch (e) {} }
  };

  async function api(ruta, modo) {
    const h = { Authorization: 'Bearer ' + clave, 'X-GitHub-Api-Version': '2022-11-28', Accept: modo === 'raw' ? 'application/vnd.github.raw' : 'application/vnd.github+json' };
    const r = await fetch(API + ruta, { headers: h, cache: 'no-store' });
    if (r.status === 401) throw new Error('La clave no es válida o ya venció. Crea una nueva y vuelve a entrar.');
    if (r.status === 403) throw new Error('GitHub negó el acceso. Revisa que la clave tenga Contents: Read-only en todos tus repositorios.');
    if (r.status === 404) throw new Error('No se encontró. Puede que la clave no incluya ese repositorio.');
    if (!r.ok) throw new Error('GitHub respondió con un error (' + r.status + '). Intenta de nuevo.');
    return modo === 'raw' ? r : r.json();
  }

  async function entrar(v, siempre) {
    clave = v.trim(); $('aviso').textContent = '';
    try {
      const u = await api('/user');
      if (u.login !== TITULAR) { clave = null; throw new Error('Esta clave no pertenece al titular del sitio.'); }
      if (siempre !== undefined) guarda.pon(clave, siempre);
      $('entrada').hidden = true; $('archivo').hidden = false; $('cerrar').hidden = false;
      $('saludo').textContent = 'Hola, ' + (u.name || 'Víctor Hugo');
      pintaAccesos(); await pintaRepos();
    } catch (e) { $('aviso').textContent = e.message; guarda.borra(); clave = null; }
  }

  function salir() { guarda.borra(); clave = null; location.reload(); }

  function pintaAccesos() {
    $('accesos').innerHTML = ACCESOS.map((a, i) => `<button class="acceso" data-i="${i}"><b>${esc(a.t)}</b><small>${esc(a.r)}</small></button>`).join('');
  }

  async function pintaRepos() {
    $('repos').innerHTML = '<p class="nota">Cargando repositorios…</p>';
    const rs = await api('/user/repos?per_page=100&affiliation=owner&sort=pushed');
    $('repos').innerHTML = rs.map((r) => `<button class="repo" data-r="${esc(r.name)}"><b>${esc(r.name)}</b><small>${r.private ? 'Privado' : 'Público'} · ${new Date(r.pushed_at).toLocaleDateString('es-MX')}</small></button>`).join('');
  }

  async function abreRepo(nombre, ruta, esDir) {
    $('visor').hidden = false; $('lista').innerHTML = '<li>Cargando…</li>'; $('archivo-ver').hidden = true;
    if (repo !== nombre) {
      const info = await api('/repos/' + TITULAR + '/' + encodeURIComponent(nombre));
      rama = info.default_branch; repo = nombre;
      const t = await api('/repos/' + TITULAR + '/' + encodeURIComponent(nombre) + '/git/trees/' + encodeURIComponent(rama) + '?recursive=1');
      arbol = t.tree || [];
    }
    if (ruta && !esDir) { dir = ruta.split('/').slice(0, -1).join('/'); pintaLista(); return abreArchivo(ruta); }
    dir = ruta || ''; pintaLista();
    $('visor').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function pintaLista(filtro) {
    $('ruta').textContent = repo + (dir ? ' / ' + dir : '');
    $('subir').disabled = !dir && !filtro;
    let items;
    if (filtro) {
      const q = filtro.toLowerCase();
      items = arbol.filter((x) => x.type === 'blob' && x.path.toLowerCase().includes(q)).slice(0, 200).map((x) => ({ n: x.path, p: x.path, d: false, s: x.size }));
    } else {
      const pre = dir ? dir + '/' : '';
      items = arbol.filter((x) => x.path.startsWith(pre) && !x.path.slice(pre.length).includes('/') && x.path !== dir)
        .map((x) => ({ n: x.path.slice(pre.length), p: x.path, d: x.type === 'tree', s: x.size }))
        .sort((a, b) => (b.d - a.d) || a.n.localeCompare(b.n, 'es'));
    }
    $('lista').innerHTML = items.length ? items.map((i) => `<li><button class="fila" data-p="${esc(i.p)}" data-d="${i.d ? 1 : 0}">${i.d ? '📁' : '📄'} ${esc(i.n)}</button><small>${i.d ? 'carpeta' : tam(i.s)}</small></li>`).join('') : '<li>Esta carpeta está vacía.</li>';
  }

  const tam = (b) => b == null ? '' : b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
  const TEXTO = /\.(md|txt|json|csv|tsv|yml|yaml|py|js|html|css|bib|sh|xml|toml|ini)$|(^|\/)(README|LICENSE|CNAME|AUTORIZADO\.txt)$/i;
  const MIME = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', mp4: 'video/mp4', mov: 'video/quicktime' };

  async function abreArchivo(p) {
    const ver = $('archivo-ver'); ver.hidden = false; ver.innerHTML = '<p class="nota">Abriendo…</p>';
    if (urlBlob) { URL.revokeObjectURL(urlBlob); urlBlob = null; }
    const r = await api('/repos/' + TITULAR + '/' + encodeURIComponent(repo) + '/contents/' + enc(p) + '?ref=' + encodeURIComponent(rama), 'raw');
    const nombre = p.split('/').pop(), ext = (nombre.split('.').pop() || '').toLowerCase();
    let cuerpo;
    if (TEXTO.test(p)) {
      const t = await r.text();
      cuerpo = ext === 'md' ? md(t) : `<pre>${esc(t)}</pre>`;
    } else {
      const b = new Blob([await r.arrayBuffer()], { type: MIME[ext] || 'application/octet-stream' });
      urlBlob = URL.createObjectURL(b);
      if (ext === 'pdf') cuerpo = `<iframe src="${urlBlob}" title="${esc(nombre)}"></iframe>`;
      else if (/^(png|jpe?g|gif|webp|svg)$/.test(ext)) cuerpo = `<img src="${urlBlob}" alt="${esc(nombre)}">`;
      else if (/^(mp4|mov)$/.test(ext)) cuerpo = `<video src="${urlBlob}" controls playsinline></video>`;
      else cuerpo = '<p class="nota">Este tipo de archivo no se puede mostrar aquí. Descárgalo para abrirlo.</p>';
    }
    ver.innerHTML = `<div class="ver-cab"><b>${esc(nombre)}</b><span>${urlBlob ? `<a class="boton" href="${urlBlob}" download="${esc(nombre)}">Descargar</a>` : ''}</span></div>${cuerpo}`;
    ver.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Markdown sencillo y seguro (todo el texto se escapa antes de dar formato).
  function md(t) {
    const linea = (s) => esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    const out = []; let lista = false, tabla = [];
    const cierraTabla = () => {
      if (!tabla.length) return;
      const filas = tabla.filter((f) => !/^\|?\s*:?-{2,}/.test(f)).map((f) => f.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      out.push('<div class="tabla-md"><table>' + filas.map((f, i) => '<tr>' + f.map((c) => `<${i ? 'td' : 'th'}>${linea(c)}</${i ? 'td' : 'th'}>`).join('') + '</tr>').join('') + '</table></div>');
      tabla = [];
    };
    for (const l of t.split('\n')) {
      if (/^\s*\|/.test(l)) { tabla.push(l.trim()); continue; } else cierraTabla();
      const m = l.match(/^(#{1,4})\s+(.*)/), li = l.match(/^\s*(?:[-*]|\d+\.)\s+(.*)/);
      if (li) { if (!lista) { out.push('<ul>'); lista = true; } out.push('<li>' + linea(li[1]) + '</li>'); continue; }
      if (lista) { out.push('</ul>'); lista = false; }
      if (m) out.push(`<h${m[1].length + 1}>${linea(m[2])}</h${m[1].length + 1}>`);
      else if (/^>\s?/.test(l)) out.push('<blockquote>' + linea(l.replace(/^>\s?/, '')) + '</blockquote>');
      else if (l.trim()) out.push('<p>' + linea(l) + '</p>');
    }
    cierraTabla(); if (lista) out.push('</ul>');
    return '<div class="md">' + out.join('') + '</div>';
  }

  // Eventos
  $('form').addEventListener('submit', (e) => { e.preventDefault(); entrar($('clave').value, $('recordar').checked); $('clave').value = ''; });
  $('cerrar').addEventListener('click', salir);
  $('repos').addEventListener('click', (e) => { const b = e.target.closest('.repo'); if (b) abreRepo(b.dataset.r).catch(falla); });
  $('accesos').addEventListener('click', (e) => { const b = e.target.closest('.acceso'); if (!b) return; const a = ACCESOS[b.dataset.i]; abreRepo(a.r, a.p, a.dir).catch(falla); });
  $('lista').addEventListener('click', (e) => {
    const b = e.target.closest('.fila'); if (!b) return;
    if (b.dataset.d === '1') { dir = b.dataset.p; $('buscar').value = ''; pintaLista(); $('archivo-ver').hidden = true; }
    else abreArchivo(b.dataset.p).catch(falla);
  });
  $('subir').addEventListener('click', () => { $('buscar').value = ''; dir = dir.split('/').slice(0, -1).join('/'); pintaLista(); });
  $('buscar').addEventListener('input', (e) => { if (repo) pintaLista(e.target.value.trim()); });
  function falla(e) { const v = $('archivo-ver'); v.hidden = false; v.innerHTML = `<p class="aviso">${esc(e.message)}</p>`; }

  const previa = guarda.lee(); if (previa) entrar(previa);
})();
