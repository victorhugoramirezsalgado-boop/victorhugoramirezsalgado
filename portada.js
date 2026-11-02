// © 2026 Víctor Hugo Ramírez Salgado — Portada: cara 1 del Cubo de la Comunicación (33)©.
// El nombre del autor se escribe por pares de letras: columna = 1.ª letra, fila = 2.ª letra.
(() => {
  const cara = document.getElementById('cara'); if (!cara) return;
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const pares = 'VICTORHUGORAMIREZSALGADO'.match(/../g);
  const luz = new Map(pares.map((p, i) => [A.indexOf(p[1]) * 26 + A.indexOf(p[0]), i]));
  const f = document.createDocumentFragment();
  for (let r = -1; r <= 26; r++) for (let c = -1; c <= 26; c++) {
    const s = document.createElement('span');
    const borde = r === -1 || r === 26 || c === -1 || c === 26;
    if (borde) {
      s.className = 'borde';
      if ((r === -1 || r === 26) && c >= 0 && c < 26) s.textContent = A[c];
      else if ((c === -1 || c === 26) && r >= 0 && r < 26) s.textContent = A[r];
    } else {
      const n = r * 26 + c;
      if (luz.has(n)) { s.className = 'on'; s.style.setProperty('--i', luz.get(n)); s.textContent = n + 1; s.title = pares[luz.get(n)] + ' · ' + (n + 1); }
    }
    f.appendChild(s);
  }
  cara.appendChild(f);
})();
