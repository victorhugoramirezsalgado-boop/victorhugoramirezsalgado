# © 2026 Víctor Hugo Ramírez Salgado — canal RSS para el registro automatizado en Safe Creative de todas sus páginas públicas.
# Cada entrada lleva como identificador la página y el último cambio publicado, así cada actualización genera un registro nuevo. Asistencia-IA.
import re, subprocess, unicodedata, html, datetime, os
H='/home/claude'
def ultimo(repo, ruta='.'):
    try:
        o=subprocess.run(['git','-C',f'{H}/{repo}','log','-1','--format=%h|%cI','--',ruta],capture_output=True,text=True).stdout.strip()
        h,f=o.split('|'); return h, datetime.datetime.fromisoformat(f)
    except Exception: return 'x', datetime.datetime.now(datetime.timezone.utc)
slug=lambda n: re.sub(r'^-|-$','',re.sub(r'[^a-z0-9]+','-',''.join(c for c in unicodedata.normalize('NFD',n) if unicodedata.category(c)!='Mn').replace('©','').replace('™','').strip().lower()))
V='https://victorhugoramirezsalgado.com/'
E=[  # título, liga, repo, ruta en el repo, descripción
 ('Biblioteca de obras de Víctor Hugo Ramírez Salgado',V,'victorhugoramirezsalgado','index.html','Registro maestro de las obras del autor.'),
 ('CCTT · Centro de Control de Tráfico Terrestre (sistema)','https://tcontenedores.com/cctt/','tcontenedores','cctt','Prototipo del CCTT: tablero, citas, gráficas y reporte ejecutivo, patio de vacíos, buque y puerto.'),
 ('CCTT · imágenes del programa',V+'cctt/','victorhugoramirezsalgado','cctt','Galería del CCTT.'),
 ('Trazabilidad de contenedores© · tcontenedores.com','https://tcontenedores.com/','tcontenedores','index.html','Consulta ISO 6346 y trazabilidad.'),
 ('Trazabilidad de contenedores© · tablero','https://tcontenedores.com/tablero/','tcontenedores','tablero','Tablero de trazabilidad.'),
 ('Cubo 33© · cubo33.com','https://cubo33.com/','cubo33','index.html','Plataforma de aprendizaje de la familia Gran Intertopía.'),
 ('Cubo 33© · aprende (traductor y pronunciación en 22 idiomas)','https://cubo33.com/aprende/','cubo33','aprende','Traductor y práctica de pronunciación.'),
 ('SOSistem™ · sosistem.com','https://sosistem.com/','sosistem','index.html','Sistema de alerta sin cámaras.'),
]
for t,r in [('ContenedorEns©','contenedorens/'),('SOS767','sos767/'),('Intertopía©','intertopia/'),('Econotopía©','econotopia/'),('Cubo 33© (VHRS)','cubo33/'),('Hipercubo 33©','hipercubo33/'),('Código Cúbico©','codigocubico/'),('Trazabilidad© (VHRS)','tcontenedores/')]:
    E.append((t+' · página',V+r,'victorhugoramirezsalgado',r.rstrip('/'),'Página de la obra en el registro maestro.'))
s=open(f'{H}/victorhugoramirezsalgado/obras.js').read(); blk=s[s.index('const P=['):]
vistos=[]
for sec,t in re.findall(r"^\s*(?:P\.push\()?\[\s*'([^']*)'\s*,\s*'([^']*)'",blk,re.M):
    if t not in vistos: vistos.append(t); E.append((t+' · ficha de la obra',V+'obra.html?id='+slug(t),'victorhugoramirezsalgado','obras.js',f'Ficha de la obra «{t}» ({sec}).'))
it=[]
for t,l,repo,ruta,d in E:
    h,f=ultimo(repo,ruta)
    it.append(f'<item><title>{html.escape(t)}</title><link>{html.escape(l)}</link><guid isPermaLink="false">{html.escape(l)}#{h}</guid><pubDate>{f.strftime("%a, %d %b %Y %H:%M:%S %z")}</pubDate><description>{html.escape(d)} © Víctor Hugo Ramírez Salgado. Todos los derechos reservados.</description><author>victorhugoramirezsalgado@gmail.com (Víctor Hugo Ramírez Salgado)</author></item>')
ahora=datetime.datetime.now(datetime.timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
x=f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Obras de Víctor Hugo Ramírez Salgado · registro de actualizaciones</title>
<link>{V}</link>
<atom:link href="{V}registro.xml" rel="self" type="application/rss+xml"/>
<description>Páginas públicas de las obras de Víctor Hugo Ramírez Salgado. Cada actualización publicada aparece como una entrada nueva para su registro.</description>
<language>es-mx</language>
<copyright>© Víctor Hugo Ramírez Salgado. Todos los derechos reservados.</copyright>
<lastBuildDate>{ahora}</lastBuildDate>
{chr(10).join(it)}
</channel>
</rss>
'''
open(f'{H}/victorhugoramirezsalgado/registro.xml','w').write(x); print(len(it),'entradas')
