#!/usr/bin/env python3
# © 2026 Víctor Hugo Ramírez Salgado — Generador de las páginas de proyecto.
# Uso: python3 herramientas/generar_sitios.py <control REGISTROS-SAFE-CREATIVE.md> <salida>
# Crea <salida>/<slug>/ (para el repo propio, con CNAME) y la copia en <raíz de vhrs>/<slug>/.
import json, re, sys, shutil, html
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
datos = json.loads((RAIZ / 'herramientas/sitios.json').read_text(encoding='utf-8'))
control = Path(sys.argv[1]).read_text(encoding='utf-8')
salida = Path(sys.argv[2])
nombres = {m.group(2): m.group(3).strip() for m in re.finditer(r'\|\s*([^|]*)\|\s*(\d{13})\s*\|\s*([^|]*)\|', control)}
e = html.escape

IDIOMAS = '''<option value="">Español</option>
<optgroup label="ONU"><option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option><option value="zh-CN">中文</option><option value="ru">Русский</option></optgroup>
<optgroup label="Europa"><option value="pt">Português</option><option value="de">Deutsch</option><option value="it">Italiano</option><option value="nl">Nederlands</option><option value="pl">Polski</option><option value="uk">Українська</option><option value="el">Ελληνικά</option><option value="sv">Svenska</option><option value="ro">Română</option><option value="ca">Català</option><option value="eu">Euskara</option><option value="gl">Galego</option></optgroup>
<optgroup label="Asia"><option value="ja">日本語</option><option value="ko">한국어</option><option value="hi">हिन्दी</option><option value="vi">Tiếng Việt</option><option value="th">ไทย</option><option value="id">Bahasa Indonesia</option><option value="tr">Türkçe</option><option value="he">עברית</option><option value="fa">فارسی</option></optgroup>
<optgroup label="Regionales"><option value="yua">Maya yucateco</option><option value="nhe">Náhuatl</option></optgroup>'''

def clase(est): return {'Activo': 'ok', 'En desarrollo': 'dev'}.get(est, 'prep')

def pagina(s, rel):
    url = f"https://{s.get('cname', s['dominio'])}/"
    secc = []
    for x in s['secciones']:
        cuerpo = ''.join(f"<p>{e(p)}</p>" for p in x.get('parrafos', []))
        if x.get('lista'): cuerpo += '<ul class="puntos">' + ''.join(f"<li>{e(i)}</li>" for i in x['lista']) + '</ul>'
        secc.append(f"<section><h2>{e(x['titulo'])}</h2>{cuerpo}</section>")
    regs = ''.join(
        f'<li><span>{e(nombres.get(n, "Obra registrada"))}</span><a href="https://www.safecreative.org/work/{n}" target="_blank" rel="noopener"><code>{n}</code> ↗</a></li>'
        for n in s['registros'])
    red = ''.join(f'<a href="{e(r["liga"])}">{e(r["nombre"])}</a>' for r in datos['comun']['red'] if s.get('cname', s['dominio']) not in r['liga'] and s['dominio'] not in r['liga'])
    nums = ' · '.join(s['registros'][:3])
    ld = json.dumps({"@context": "https://schema.org", "@type": "CreativeWork", "name": s['titulo'], "description": s['descripcion'],
                     "url": url, "author": {"@type": "Person", "name": datos['comun']['autor'], "url": datos['comun']['panel']},
                     "copyrightHolder": {"@type": "Person", "name": datos['comun']['autor']}, "copyrightYear": 2026,
                     "inLanguage": "es"}, ensure_ascii=False)
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(s['titulo'])}</title>
<meta name="description" content="{e(s['descripcion'])}">
<meta name="author" content="{e(datos['comun']['autor'])}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:url" content="{url}">
<meta property="og:title" content="{e(s['titulo'])}"><meta property="og:description" content="{e(s['lema'])}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="{rel}estilo.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="barra">
  <a class="marca" href="{e(datos['comun']['panel'])}" title="Panel del autor">VHRS</a>
  <label class="idioma">🌐 <select id="idioma" aria-label="Idioma">{IDIOMAS}</select></label>
</header>
<main data-nombre="{e(s['titulo'])}">
  <section class="portada">
    <div class="esc"><div class="cubo"><div class="cara"></div><div class="cara"></div><div class="cara"></div><div class="cara"></div><div class="cara"></div><div class="cara"></div></div></div>
    <p><code>{e(s['dominio'])}</code> <span class="estatus {clase(s['estatus'])}">{e(s['estatus'])}</span></p>
    <h1 data-morse="{e(s['morse'])}" title="Toca para oír en Morse">{e(s['titulo'])}</h1>
    <p class="lema">{e(s['lema'])}</p>
    <p class="morse-linea" id="morse" aria-live="polite"></p>
  </section>
  {''.join(secc)}
  <section><h2>Registros © en Safe Creative</h2>
    <p class="nota">Toca un número para ver su certificado.</p>
    <ul class="tabla">{regs}</ul></section>
  <section><h2>Autor</h2>
    <p>{e(s['relacion'])}</p>
    <p>Autor y titular: <a href="{e(datos['comun']['panel'])}">{e(datos['comun']['autor'])}</a>.</p></section>
  <nav class="red" aria-label="Proyectos relacionados">{red}</nav>
  <footer>
    <p>© 2026 {e(datos['comun']['autor'])} · Safe Creative {nums}. Todos los derechos reservados.</p>
    <p>Prohibida su reproducción total o parcial y su uso para entrenar inteligencia artificial sin autorización escrita del titular.</p>
  </footer>
</main>
<script src="{rel}cubo.js"></script>
<script src="{rel}sitio.js"></script>
</body>
</html>
'''

LICENCIA = '''© 2026 Víctor Hugo Ramírez Salgado. Todos los derechos reservados.

El contenido de este repositorio y del sitio {dom} (textos, diseño, código, logotipos y demás obras)
es propiedad exclusiva de Víctor Hugo Ramírez Salgado. Obras registradas en Safe Creative: {regs}.

Que el repositorio sea público solo permite consultarlo. No se concede licencia alguna para copiar,
modificar, distribuir, sublicenciar, usar para entrenar inteligencia artificial ni usar total o
parcialmente este contenido sin autorización previa y por escrito del titular.

---
© 2026 Víctor Hugo Ramírez Salgado. All rights reserved. Public visibility grants no license.
'''

for s in datos['sitios']:
    # 1) Sitio propio (repo del dominio)
    d = salida / s['slug']; d.mkdir(parents=True, exist_ok=True)
    (d / 'index.html').write_text(pagina(s, ''), encoding='utf-8')
    for f in ('estilo.css', 'cubo.js', 'sitio.js'): shutil.copy(RAIZ / f, d / f)
    host = s.get('cname', s['dominio'])
    (d / 'CNAME').write_text(host + '\n')
    (d / '.nojekyll').write_text('')
    (d / 'robots.txt').write_text(f"User-agent: *\nAllow: /\nSitemap: https://{host}/sitemap.xml\n")
    (d / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://{host}/</loc></url></urlset>\n')
    (d / 'LICENSE').write_text(LICENCIA.format(dom=s['dominio'], regs=', '.join(s['registros'])), encoding='utf-8')
    (d / 'README.md').write_text(f"# {s['titulo']}\n\n{s['descripcion']}\n\nSitio: https://{s['dominio']} · Copia en https://victorhugoramirezsalgado.com/{s['slug']}/\n\n© 2026 Víctor Hugo Ramírez Salgado. Todos los derechos reservados. Ver LICENSE.\n", encoding='utf-8')
    # 2) Copia dentro de vhrs.com
    c = RAIZ / s['slug']; c.mkdir(exist_ok=True)
    (c / 'index.html').write_text(pagina(s, '../'), encoding='utf-8')
    print('ok', s['slug'], len(s['registros']), 'registros')
