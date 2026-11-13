# Copia las herramientas del Cubo (de sosistem.com) a páginas propias en victorhugoramirezsalgado.com
import re, os, shutil
SRC='/home/claude/sosistem'; DST='/home/claude/victorhugoramirezsalgado'
s=open(f'{SRC}/anterior.html',encoding='utf-8').read()
head=s[:s.find('</head>')]
scripts=re.findall(r'<script[^>]*src="assets/[^"]+"[^>]*></script>',s)
def seccion(sid):
    m=re.search(r'<section[^>]*id="%s"'%sid,s); st=m.start()
    # balanceo de <section>
    i=st; depth=0
    for t in re.finditer(r'<(/?)section\b',s[st:]):
        depth+= -1 if t.group(1) else 1
        if depth==0:
            return s[st:st+t.end()+s[st+t.end():].find('>')+1]
PAGINAS={
 'cubo33/aprende':('Aprendizaje del Cubo 33© · Juego del Cubo','El Cubo de la Comunicación (33)©',['aprende']),
 'cubo33/morse':('Cubo Morse©','El Cubo de la Comunicación (33)©',['cubo-morse']),
 'codigocubico/mensajero':('Mensajero del Cubo y Receptor Morse · Código Cúbico©','Código Cúbico©',['mensajero','receptor']),
}
usados=set()
for ruta,(titulo,padre,ids) in PAGINAS.items():
    cuerpo='\n'.join(seccion(i) for i in ids)
    h=re.sub(r'<title>.*?</title>',f'<title>{titulo}</title>',head,flags=re.S)
    h=h.replace('<head>','<head>\n<base href="/cubo-base/">',1)
    h=re.sub(r'<link rel="canonical"[^>]*>','',h)
    c=cuerpo.replace('anterior.html#','#').replace('href="#','href="/'+ruta+'/#')
    for m in re.findall(r'(?:src|href)="assets/([^"?]+)',h+c): usados.add(m)
    sc='\n'.join(scripts)
    for m in re.findall(r'src="assets/([^"?]+)','\n'.join(scripts)): usados.add(m)
    barra=(f'<header class="top"><div class="wrap"><a class="logo" href="/'+ruta.split('/')[0]+f'/"><span class="logo-text"><span class="mk">{padre}</span></span></a>'
           f'<nav><a class="btn" href="/'+ruta.split('/')[0]+f'/">← Volver a {padre}</a></nav></div></header>')
    pie=('<footer class="wrap" style="padding:24px 0;font-size:13px">© 2026 Víctor Hugo Ramírez Salgado. Todos los derechos reservados. '
         'Prohibida su reproducción total o parcial y su uso para entrenar inteligencia artificial sin autorización escrita del titular. '
         'Copia propia de esta página; el sistema integral está en <a href="https://sosistem.com">SOSistem™</a>.</footer>')
    html=h+'</head>\n<body>\n'+barra+'\n<main data-nombre="'+padre+'">\n'+c+'\n</main>\n'+pie+'\n'+sc+'\n</body>\n</html>\n'
    os.makedirs(f'{DST}/{ruta}',exist_ok=True)
    open(f'{DST}/{ruta}/index.html','w',encoding='utf-8').write(html)
shutil.rmtree(f'{DST}/cubo-assets',ignore_errors=True)
B=f'{DST}/cubo-base'
os.makedirs(B+'/assets',exist_ok=True)
for u in sorted(usados):
    a=f'{SRC}/assets/{u}'
    if os.path.isfile(a):
        os.makedirs(os.path.dirname(f'{B}/assets/{u}'),exist_ok=True); shutil.copy2(a,f'{B}/assets/{u}')
    else: print('falta',u)
print(len(usados),'archivos')

shutil.copytree(f'{SRC}/assets/img/lsm',f'{B}/assets/img/lsm',dirs_exist_ok=True)
os.makedirs(B+'/datos',exist_ok=True)
for f in ['config.json','version.json','idiomas.json']:
    if os.path.isfile(f'{SRC}/datos/{f}'): shutil.copy2(f'{SRC}/datos/{f}',f'{B}/datos/{f}')
shutil.copytree(f'{SRC}/datos/textos',f'{B}/datos/textos',dirs_exist_ok=True)
shutil.copytree(f'{SRC}/datos/idiomas-aprende',f'{B}/datos/idiomas-aprende',dirs_exist_ok=True)
