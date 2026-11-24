# © 2026 Víctor Hugo Ramírez Salgado. Generador de las versiones del CV (ES/EN/IT/ZH). Asistencia-IA.
import re, html, sys, json

CFG = {
 'es': dict(lang='es', css='cv.css', home='../', title='Currículum académico — Víctor Hugo Ramírez Salgado',
   eti='Currículum académico · Curriculum vitae', rol='Consultor portuario — operaciones, estadística portuaria, recintos fiscalizados y contenedores',
   ver='Versión académica para el Doctorado en Negocios, CETYS Universidad. Actualizada: 24/11/2026.',
   back='‹ Biblioteca de obras', prev='Versión anterior', prevurl='historial/2026-11-10/', print='Imprimir o guardar PDF',
   refs='Referencias', notes=('Las notas',), src=('Fuente',), rights='Todos los derechos reservados.', firma='Firma:'),
 'en': dict(lang='en', css='../cv.css', home='../../', title='Academic CV — Víctor Hugo Ramírez Salgado',
   eti='Academic curriculum vitae', rol='Port Consultant — port operations, port statistics, customs-bonded facilities and containers',
   ver='Academic version for the Doctorate in Business, CETYS Universidad. Updated: 24 Nov 2026.',
   back='‹ Library of works', prev='Previous version', prevurl='../historial/2026-11-10/en/', print='Print or save PDF',
   refs='References', notes=('The articles',), src=('Source',), rights='All rights reserved.', firma='Signature:'),
 'it': dict(lang='it', css='../cv.css', home='../../', title='Curriculum accademico — Víctor Hugo Ramírez Salgado',
   eti='Curriculum vitae accademico', rol='Consulente portuale — operazioni, statistica portuale, recinti doganali e container',
   ver='Versione accademica per il Dottorato in Business, CETYS Universidad. Aggiornata: 24/11/2026.',
   back='‹ Biblioteca delle opere', prev='Versione precedente', prevurl='../historial/2026-11-10/', print='Stampa o salva PDF',
   refs='Bibliografia', notes=('Gli articoli',), src=('Fonte',), rights='Tutti i diritti riservati.', firma='Firma:'),
 'zh': dict(lang='zh-Hans', css='../cv.css', home='../../', title='学术简历 — Víctor Hugo Ramírez Salgado',
   eti='学术简历 · Curriculum vitae', rol='港口顾问 — 港口运营、港口统计、海关监管区与集装箱',
   ver='CETYS 大学商业博士项目学术版。更新日期：2026年11月24日。',
   back='‹ 作品库', prev='旧版本', prevurl='../historial/2026-11-10/', print='打印或保存为 PDF',
   refs='参考文献', notes=('《',), src=('来源',), rights='版权所有。', firma='签名：'),
}
LANGS = [('es','Español','cv/'),('en','English','cv/en/'),('it','Italiano','cv/it/'),('zh','中文','cv/zh/')]

def inl(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
    s = re.sub(r'(?<!href=")(?<!">)(https?://[^\s<]+?)([.,;)]?)(?=\s|$|<)',
               lambda m: f'<a href="{m.group(1)}" target="_blank" rel="noopener">{m.group(1)}</a>{m.group(2)}', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', s)
    return s

def build(code, md, out):
    c = CFG[code]
    lines = md.replace('****', '').split('\n')
    o = []; i = 0; inref = False
    while i < len(lines):
        l = lines[i]
        if l.startswith('## '):
            inref = c['refs'] in l; o.append(f'<h2>{inl(l[3:])}</h2>')
        elif l.startswith('### '):
            o.append(f'<h3>{inl(l[4:])}</h3>')
        elif l.startswith('| '):
            rows = []
            while i < len(lines) and lines[i].startswith('| '):
                rows.append([x.strip() for x in lines[i].strip()[2:-2].split(' | ')]); i += 1
            heads = [re.sub('<[^>]+>', '', inl(h)) for h in rows[0]]
            t = '<div class="tabla"><table><tr>' + ''.join(f'<th>{inl(x)}</th>' for x in rows[0]) + '</tr>'
            for r in rows[1:]:
                t += '<tr>' + ''.join(f'<td data-l="{heads[k] if k < len(heads) else ""}">{inl(x)}</td>' for k, x in enumerate(r)) + '</tr>'
            o.append(t + '</table></div>'); continue
        elif l.startswith('- '):
            items = []
            while i < len(lines) and lines[i].startswith('- '):
                items.append(lines[i][2:]); i += 1
            o.append('<ul>' + ''.join((f'<li class="fuente">{inl(x)}</li>' if x.startswith(c['src']) else f'<li>{inl(x)}</li>') for x in items) + '</ul>'); continue
        elif l.strip() in ('', c['firma']):
            pass
        else:
            cls = ' class="ref"' if inref and not l.startswith(c['notes']) else ''
            o.append(f'<p{cls}>{inl(l.strip())}</p>')
        i += 1
    body = '\n'.join(o)
    body = re.sub(r'<p>Víctor Hugo Ramírez Salgado</p>\n<p>', '<p class="firma">Víctor Hugo Ramírez Salgado</p>\n<p class="nota">', body)
    links = ''.join(f'<a href="{c["home"]}{p}">{n}</a>' for k, n, p in LANGS if k != code)
    head = f'''<!doctype html><html lang='{c["lang"]}'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>{c["title"]}</title><meta name="author" content="Víctor Hugo Ramírez Salgado"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="{c["css"]}?v=2026-11-24b"></head><body>
<!-- © 2026 Víctor Hugo Ramírez Salgado. CV académico (Doctorado en Negocios, CETYS), {code}, 24/11/2026. Asistencia-IA. -->
<div class="acciones"><a href="{c["home"]}">{c["back"]}</a>{links}<a href="{c["prevurl"]}">{c["prev"]}</a><button onclick="window.print()">{c["print"]}</button></div>
<div class="hoja"><header class="cab"><span class="eti">{c["eti"]}</span><h1>Víctor Hugo Ramírez Salgado<sup>©</sup></h1><p class="rol">{c["rol"]}</p><p class="datos">Ensenada, Baja California, México · <a href="https://victorhugoramirezsalgado.com">victorhugoramirezsalgado.com</a> · ORCID 0009-0002-7831-8433</p><p class="datos">{c["ver"]}</p></header><main class="cuerpo">
'''
    foot = f'\n</main><footer class="pie">© 2026 Víctor Hugo Ramírez Salgado · <a href="{c["home"]}">victorhugoramirezsalgado.com</a> · {c["rights"]}</footer></div></body></html>\n'
    open(out, 'w', encoding='utf-8').write(head + body + foot)

if __name__ == '__main__':
    code, src, out = sys.argv[1:4]
    build(code, open(src, encoding='utf-8').read(), out)
