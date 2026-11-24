# © 2026 Víctor Hugo Ramírez Salgado — generador de las páginas SOS767 (sos767.com, sos767.org, 767sos.com). Asistencia-IA.
import re
R = '/home/claude/victorhugoramirezsalgado/'
SEL = open('/tmp/sel.html', encoding='utf-8').read()
PROGS = open('/tmp/progs.html', encoding='utf-8').read()

def page(path, depth, title, desc, body, lab=False, noindex=False, marca='sos767.com'):
    up = '../' * depth
    robots = '<meta name="robots" content="noindex,nofollow">' if noindex else ''
    theme = '#000000' if lab else '#2A2C2E'
    html = f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="author" content="Víctor Hugo Ramírez Salgado">
<meta name="theme-color" content="{theme}">{robots}
<meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{up}sos767/sos767.css?v=1">
</head>
<body{' class="lab"' if lab else ''}>
<!-- © 2026 Víctor Hugo Ramírez Salgado. SOS767, programa de SOSistem™. Autor y titular al 100 %. Asistencia-IA. -->
<header class="barra">
  <a class="logo" href="{up}sos767/" data-morse="SOS767" title="Toca para oír SOS767 en Morse"><b>SOS</b>767 <i>{marca}</i></a>
  {SEL}
</header>
<main>
{body}
  <nav class="red" aria-label="Proyectos relacionados">
    <a href="{up}sos767/">SOS767 · sos767.com</a><a href="{up}sos767/apoyo/">Apoyos · sos767.org</a><a href="{up}sos767/laboratorio/">Laboratorio · 767sos.com</a><a href="https://sosistem.com">SOSistem™</a><a href="https://victorhugoramirezsalgado.com">Víctor Hugo Ramírez Salgado</a><a href="{up}contenedorens/">ContenedorEns©</a><a href="https://cubo33.com">El Cubo de la Comunicación (33)©</a>
  </nav>
  <footer>
    <p><a href="{up}legal/terminos.html">Términos</a> · <a href="{up}legal/privacidad.html">Aviso de privacidad</a> · <a href="{up}legal/reembolsos.html">Reembolsos</a> · Contacto: <a href="https://wa.me/526462270490">WhatsApp 646 227 0490</a> · <a href="mailto:sos@sosistem.com">sos@sosistem.com</a></p>
    <p>© 2026 Víctor Hugo Ramírez Salgado. SOS767 y SOSistem™ · Sistema S.O.S.© (Safe Creative 2609046908578) · Cubo Morse© (2610257441754) · ContenedorEns© (2609046908752). SOSistem™: modelo de utilidad y marca en trámite ante el IMPI. Todos los derechos reservados. Prohibida su reproducción total o parcial y su uso para entrenar inteligencia artificial sin autorización escrita del titular.</p>
  </footer>
</main>
<script src="{up}sitio.js"></script>
</body>
</html>
'''
    open(R + path, 'w', encoding='utf-8').write(html)

NOMEN = '''<h2>Índice de nomenclaturas</h2>
  <table class="nomen"><tr><th>Sigla</th><th>Significado</th></tr>
  <tr><td>SOS</td><td>Señal internacional de auxilio; en Morse, · · · − − − · · ·</td></tr>
  <tr><td>767</td><td>Números del teclado telefónico que forman «SOS» (7 = PQRS, 6 = MNO)</td></tr>
  <tr><td>SOSistem™</td><td>Plataforma de alerta sin cámaras de Víctor Hugo Ramírez Salgado (sosistem.com)</td></tr>
  <tr><td>CFDI</td><td>Comprobante Fiscal Digital por Internet (factura electrónica, SAT)</td></tr>
  <tr><td>IMPI</td><td>Instituto Mexicano de la Propiedad Industrial</td></tr>
  <tr><td>INEGI</td><td>Instituto Nacional de Estadística y Geografía</td></tr>
  <tr><td>Conavi · Sedatu</td><td>Comisión Nacional de Vivienda · Secretaría de Desarrollo Agrario, Territorial y Urbano</td></tr>
  <tr><td>DIF</td><td>Sistema para el Desarrollo Integral de la Familia</td></tr>
  <tr><td>Beta</td><td>Versión de prueba, en revisión, antes de publicarse como oficial</td></tr>
  </table>'''

# ---------- sos767.com: portada pública ----------
home = f'''  <section class="hero">
    <span class="eti">Programa de ciudadanía de SOSistem™</span>
    <h1 data-morse="SOS" title="Toca para oír SOS en Morse"><span>SOS</span>767</h1>
    <p class="lema">Tres números para pedir ayuda, en cualquier idioma, desde cualquier teléfono.</p>
    <div class="teclado" aria-label="En el teclado, 7 6 7 forman SOS">
      <div class="tecla" data-morse="S" title="Toca: S en Morse"><span><b>7</b><small>PQRS</small></span></div>
      <div class="tecla" data-morse="O" title="Toca: O en Morse"><span><b>6</b><small>MNO</small></span></div>
      <div class="tecla" data-morse="S" title="Toca: S en Morse"><span><b>7</b><small>PQRS</small></span></div>
      <span class="igual">=</span><span class="sos" data-morse="SOS">SOS</span>
    </div>
    <p class="morse-linea" id="morse" aria-live="polite"></p>
    <div class="acciones">
      <a class="btn naranja" href="https://sosistem.com/sos/?origen=sos767">Activar SOS ahora<small>Terminal SOSistem™ en este teléfono</small></a>
      <a class="btn blanco" href="apoyo/">Apoyar un programa<small>sos767.org</small></a>
    </div>
    <p><span class="estatus dev">Número 767: en gestión</span></p>
  </section>

  <section><h2>Qué es SOS767</h2>
    <p>SOS767 es el programa de ciudadanía de SOSistem™. Su objetivo es mejorar la prevención, la atención y la identificación de emergencias de personas y familias. En el teclado de cualquier teléfono, los números 7, 6 y 7 corresponden a las letras S, O y S, por lo que el número es fácil de recordar en cualquier idioma, incluso para niñas, niños y personas con capacidades diferentes.</p>
    <p>SOS767 no sustituye al 9-1-1. En una emergencia, la persona usuaria debe llamar al 9-1-1; SOS767 suma un aviso inmediato a sus familiares y una red de apoyo.</p>
  </section>

  <section><h2>Cómo funcionará</h2>
    <ol class="pasos">
      <li><b>Enviar un SOS.</b> Desde la Terminal SOSistem™ del teléfono, o con un mensaje al 767 (vacío o con un solo carácter, en cualquier idioma).</li>
      <li><b>Aviso a la familia.</b> El mensaje llega a un chat de la plataforma con los familiares registrados, con la ubicación del teléfono.</li>
      <li><b>Canal al 9-1-1.</b> En una emergencia real, la plataforma indica de inmediato la llamada al 9-1-1.</li>
      <li><b>Confirmación «recibido».</b> El teléfono responde con la letra R en Morse (· − ·) por vibración.</li>
    </ol>
    <p class="nota">SOSistem™ no graba voz, video ni imágenes. Solo conserva el registro del evento de emergencia, conforme a su aviso de privacidad.</p>
  </section>

  <section><h2>Tres sitios, una sola red</h2>
    <div class="rejilla">
      <article class="tarjeta n"><h3>sos767.com</h3><p>Portada pública: qué es SOS767, cómo pedir ayuda y acceso directo a la Terminal SOSistem™.</p><span class="estatus ok">Este sitio</span></article>
      <article class="tarjeta v"><h3>sos767.org</h3><p>Programas de apoyo: Casa Contenedor SOS767, Celular SOS para personas mayores y padrinos de línea, con transparencia por folio.</p><a class="btn verde" href="apoyo/">Ver programas</a></article>
      <article class="tarjeta m"><h3>767sos.com</h3><p>Laboratorio privado de pruebas: actualizaciones por etapas antes de pasar a sosistem.com. Acceso solo con autorización del administrador.</p><a class="btn mar" href="laboratorio/">Entrar al laboratorio</a></article>
    </div>
  </section>

  <section><h2>Para quién es</h2>
    <div class="rejilla">
      <article class="tarjeta a"><h3>Personas mayores</h3><p>Un celular que avisa a su familia en caso de caída o de una palabra de auxilio.</p></article>
      <article class="tarjeta a"><h3>Niñas, niños y jóvenes</h3><p>Un número fácil de recordar y un aviso inmediato a quienes los cuidan.</p></article>
      <article class="tarjeta a"><h3>Capacidades diferentes</h3><p>Activación por toque, por Morse dibujado en la pantalla o por golpes en la parte de atrás del teléfono.</p></article>
      <article class="tarjeta a"><h3>Desastres naturales</h3><p>Aviso de sismo y comunicación con la familia cuando las redes están saturadas.</p></article>
    </div>
    <div class="kpis">
      <div class="kpi"><b>19.2 millones</b><span>personas de 60 años o más en México</span><span class="fuente">Fuente: INEGI, Encuesta Intercensal 2025.</span></div>
      <div class="kpi"><b>8.33 millones</b><span>viviendas en rezago habitacional en México</span><span class="fuente">Fuente: Sedatu y Conavi, con base en la Encuesta Intercensal 2025.</span></div>
    </div>
  </section>

  <section><h2>Estado del proyecto</h2>
    <ul>
      <li><b>Terminal SOSistem™ (sosistem.com/sos/):</b> <span class="estatus ok">En operación de prueba</span></li>
      <li><b>Número corto 767:</b> <span class="estatus dev">En gestión</span>. Todavía no está asignado; al marcarlo hoy no conecta.</li>
      <li><b>Programas de apoyo (sos767.org):</b> <span class="estatus dev">Abiertos al patrocinio</span></li>
      <li><b>Laboratorio (767sos.com):</b> <span class="estatus prep">Privado</span></li>
    </ul>
  </section>

  {NOMEN}

  <h2>Referencias (APA 7)</h2>
  <ul class="refs">
    <li>Instituto Nacional de Estadística y Geografía. (2025). <i>Encuesta Intercensal 2025</i>. INEGI. https://www.inegi.org.mx/</li>
    <li>Secretaría de Desarrollo Agrario, Territorial y Urbano y Comisión Nacional de Vivienda. (2025). <i>Rezago habitacional</i>. Gobierno de México. https://www.gob.mx/conavi</li>
  </ul>
'''
page('sos767/index.html', 1, 'SOS767 · Tres números para pedir ayuda', 'SOS767, programa de ciudadanía de SOSistem™: en el teclado, 767 forma SOS. Aviso inmediato a la familia y canal al 9-1-1.', home)

# ---------- sos767.org: apoyos ----------
progs = PROGS.replace('<section><h2>', '<section><h2>')
progs = re.sub(r'class="pago"', 'class="btn verde"', progs)
progs = progs.replace('<div class="progs">', '<div class="rejilla">').replace('class="prog"', 'class="tarjeta v prog"').replace('<ol class="puntos">', '<ol class="pasos">').replace('<ul class="puntos">', '<ul>')
apoyo = f'''  <section class="hero">
    <span class="eti">sos767.org · Programas de apoyo</span>
    <h1 data-morse="SOS767" title="Toca para oír en Morse"><span>SOS</span>767<span style="color:#2F7D5B">.org</span></h1>
    <p class="lema">Un techo digno y un celular que avisa, para quien más lo necesita.</p>
    <p class="morse-linea" id="morse" aria-live="polite"></p>
    <div class="acciones">
      <a class="btn verde" href="#casa">Casa Contenedor SOS767</a>
      <a class="btn amarillo" href="#celular">Celular SOS</a>
      <a class="btn blanco" href="../../verifica/?p=767">Verificar mi certificado</a>
    </div>
  </section>
  <div class="kpis">
    <div class="kpi"><b>8.33 millones</b><span>viviendas en rezago habitacional en México</span><span class="fuente">Fuente: Sedatu y Conavi, con base en la Encuesta Intercensal 2025.</span></div>
    <div class="kpi"><b>4.º lugar</b><span>Ensenada, entre los municipios con mayor rezago habitacional absoluto</span><span class="fuente">Fuente: Conavi (2023).</span></div>
    <div class="kpi"><b>19.2 millones</b><span>personas de 60 años o más</span><span class="fuente">Fuente: INEGI, Encuesta Intercensal 2025.</span></div>
  </div>
{progs}
  {NOMEN}
  <h2>Referencias (APA 7)</h2>
  <ul class="refs">
    <li>Comisión Nacional de Vivienda. (2023). <i>Rezago habitacional por municipio</i>. Gobierno de México. https://www.gob.mx/conavi</li>
    <li>Instituto Nacional de Estadística y Geografía. (2025). <i>Encuesta Intercensal 2025</i>. INEGI. https://www.inegi.org.mx/</li>
    <li>Secretaría de Desarrollo Agrario, Territorial y Urbano y Comisión Nacional de Vivienda. (2025). <i>Rezago habitacional</i>. Gobierno de México. https://www.gob.mx/conavi</li>
  </ul>
'''
apoyo = apoyo.replace('<section><h2>Casa Contenedor SOS767</h2>', '<section id="casa"><h2>Casa Contenedor SOS767</h2>').replace('<section><h2>Celular SOS', '<section id="celular"><h2>Celular SOS')
page('sos767/apoyo/index.html', 2, 'SOS767.org · Programas de apoyo', 'Patrocina una Casa Contenedor SOS767 o un Celular SOS para personas mayores. Transparencia por folio y certificado de patrocinio.', apoyo, marca='sos767.org')

# ---------- 767sos.com: laboratorio ----------
lab = '''  <section class="hero">
    <span class="eti">767sos.com · Laboratorio privado de pruebas</span>
    <h1 data-morse="SOS" title="Toca para oír SOS en Morse"><span>767</span>SOS</h1>
    <p class="lema">Aquí se prueban las versiones nuevas de SOSistem™ antes de publicarse en sosistem.com.</p>
    <p class="morse-linea" id="morse" aria-live="polite"></p>
    <p><span class="estatus alerta">Acceso restringido</span> <span class="estatus prep">Versión de prueba, en revisión</span></p>
    <div class="acciones">
      <a class="btn naranja" href="https://sosistem.com/beta/?origen=767sos">Entrar como administrador<small>usuario y clave de la Beta</small></a>
      <a class="btn blanco" href="https://sosistem.com/sos/?origen=767sos">Terminal de pruebas<small>sensores de este teléfono</small></a>
    </div>
  </section>

  <section><h2>Reglas del laboratorio</h2>
    <ul>
      <li>Solo entran las personas que el administrador autoriza; cada una recibe su propio usuario y clave.</li>
      <li>La pantalla es negra por seguridad: el fondo blanco gasta batería y delata el teléfono en una emergencia.</li>
      <li>El Morse sonoro solo suena en pruebas del administrador o del colaborador, nunca por sí solo.</li>
      <li>Nada de lo que se prueba aquí se publica, imprime ni fotografía hasta que el administrador lo libera.</li>
      <li>A sosistem.com solo pasan las versiones ya seguras y autorizadas.</li>
    </ul>
  </section>

  <section><h2>Etapas en prueba</h2>
    <div class="rejilla">
      <article class="tarjeta n"><h3>Alerta en todas las marcas</h3><p>Luz SOS de bajo consumo en todos los teléfonos, ondas casi inaudibles y tres puntos que confirman el envío con la pantalla apagada.</p><span class="estatus dev">En prueba</span></article>
      <article class="tarjeta n"><h3>SOS por toque y por dibujo</h3><p>Activar el SOS tocando el Morse en la pantalla o atrás del teléfono, o dibujando puntos y rayas sin mover el dedo.</p><span class="estatus dev">En prueba</span></article>
      <article class="tarjeta n"><h3>Confirmación «recibido»</h3><p>Al recibir un SOS, el teléfono responde con la R en Morse (· − ·) por vibración.</p><span class="estatus dev">En prueba</span></article>
      <article class="tarjeta m"><h3>Calibración de sensores</h3><p>Sismo a nivel moderado y ruido solo ante grito de auxilio o explosión; los giros normales del teléfono en la mano no disparan alertas.</p><span class="estatus dev">En prueba</span></article>
      <article class="tarjeta m"><h3>Mensaje al 767</h3><p>Reenvío de la primera emergencia a los contactos registrados.</p><span class="estatus prep">En preparación</span></article>
      <article class="tarjeta m"><h3>Nodo físico (Hipersensor)</h3><p>Armado del primer nodo de prueba en protoboard, con bitácora de evidencia.</p><span class="estatus prep">En preparación</span></article>
    </div>
  </section>

  <section><h2>Cómo colaborar en las pruebas</h2>
    <ol class="pasos">
      <li>Escribe por WhatsApp al 646 227 0490 y pide tu alta como colaborador de pruebas.</li>
      <li>El administrador te envía tu usuario y tu clave.</li>
      <li>Haz las pruebas durante al menos 7 días, 2 horas diarias, con la Terminal de pruebas.</li>
      <li>Recibes tu constancia de agradecimiento como colaborador.</li>
    </ol>
  </section>
'''
page('sos767/laboratorio/index.html', 2, '767SOS · Laboratorio de pruebas de SOSistem™', 'Laboratorio privado de pruebas de SOSistem™.', lab, lab=True, noindex=True, marca='767sos.com')
print('ok')
