#!/usr/bin/env python3
# © 2026 Víctor Hugo Ramírez Salgado — Generador de las páginas de apoyo, SOS767 y avisos legales.
# Uso: python3 herramientas/generar_apoyo.py
# Lee herramientas/pagos.json: si una liga de Stripe está vacía, el botón abre WhatsApp con el mensaje prellenado.
import json, html
from pathlib import Path
from urllib.parse import quote

RAIZ = Path(__file__).resolve().parent.parent
P = json.loads((RAIZ / 'herramientas/pagos.json').read_text(encoding='utf-8'))
e = html.escape
IVA = P['iva']
FECHA = '14 de noviembre de 2026'

IDIOMAS = '''<option value="">Español</option>
<optgroup label="ONU"><option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option><option value="zh-CN">中文</option><option value="ru">Русский</option></optgroup>
<optgroup label="Europa"><option value="pt">Português</option><option value="de">Deutsch</option><option value="it">Italiano</option><option value="nl">Nederlands</option><option value="pl">Polski</option><option value="uk">Українська</option><option value="el">Ελληνικά</option><option value="sv">Svenska</option><option value="ro">Română</option><option value="ca">Català</option><option value="eu">Euskara</option><option value="gl">Galego</option></optgroup>
<optgroup label="Asia"><option value="ja">日本語</option><option value="ko">한국어</option><option value="hi">हिन्दी</option><option value="vi">Tiếng Việt</option><option value="th">ไทย</option><option value="id">Bahasa Indonesia</option><option value="tr">Türkçe</option><option value="he">עברית</option><option value="fa">فارسی</option></optgroup>
<optgroup label="Regionales"><option value="yua">Maya yucateco</option><option value="nhe">Náhuatl</option></optgroup>'''

RED = [('Víctor Hugo Ramírez Salgado', 'https://victorhugoramirezsalgado.com'), ('Apoya los proyectos', '/apoya/'),
       ('SOS767', '/sos767/'), ('SOSistem™', 'https://sosistem.com'), ('ContenedorEns©', '/contenedorens/'),
       ('Intertopía©', '/intertopia/'), ('Econotopía©', '/econotopia/'), ('El Cubo de la Comunicación (33)©', '/cubo33/'),
       ('Código Cúbico©', '/codigocubico/')]


def pesos(v):
    return '$' + f'{v:,.0f}' + ' MXN'


def boton(clave, texto, mensaje):
    liga = P['ligas'].get(clave, '')
    if liga:
        return f'<a class="pago" href="{e(liga)}" target="_blank" rel="noopener">{e(texto)} <small>pago seguro con tarjeta, OXXO o transferencia</small></a>'
    wa = f"https://wa.me/{P['whatsapp']}?text={quote(mensaje)}"
    return f'<a class="pago wa" href="{e(wa)}" target="_blank" rel="noopener">{e(texto)} <small>por WhatsApp · el pago en línea se activa en breve</small></a>'


def pagina(ruta, titulo, desc, morse, lema, cuerpo, estatus=('En preparación', 'prep')):
    prof = '../' * (ruta.count('/'))
    red = ''.join(f'<a href="{e(l)}">{e(n)}</a>' for n, l in RED if l != f'/{ruta.split("/")[0]}/')
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(titulo)}</title>
<meta name="description" content="{e(desc)}">
<meta name="author" content="Víctor Hugo Ramírez Salgado">
<meta property="og:type" content="website"><meta property="og:title" content="{e(titulo)}"><meta property="og:description" content="{e(lema)}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{prof}estilo.css">
<link rel="stylesheet" href="{prof}apoyo.css">
</head>
<body>
<header class="barra">
  <a class="marca" href="https://victorhugoramirezsalgado.com" title="Panel del autor">VHRS</a>
  <label class="idioma">🌐 <select id="idioma" aria-label="Idioma">{IDIOMAS}</select></label>
</header>
<main data-nombre="{e(titulo)}">
  <section class="portada">
    <div class="esc"><div class="cubo"><div class="cara"></div><div class="cara"></div><div class="cara"></div><div class="cara"></div><div class="cara"></div><div class="cara"></div></div></div>
    <p><span class="estatus {estatus[1]}">{e(estatus[0])}</span></p>
    <h1 data-morse="{e(morse)}" title="Toca para oír en Morse">{e(titulo)}</h1>
    <p class="lema">{e(lema)}</p>
    <p class="morse-linea" id="morse" aria-live="polite"></p>
  </section>
{cuerpo}
  <nav class="red" aria-label="Proyectos relacionados">{red}</nav>
  <footer>
    <p><a href="{prof}legal/terminos.html">Términos</a> · <a href="{prof}legal/privacidad.html">Aviso de privacidad</a> · <a href="{prof}legal/reembolsos.html">Reembolsos</a> · Contacto: <a href="https://wa.me/{P['whatsapp']}">WhatsApp 646 227 0490</a> · <a href="mailto:sos@sosistem.com">sos@sosistem.com</a></p>
    <p>© 2026 Víctor Hugo Ramírez Salgado. SOSistem™ · Sistema S.O.S.© (Safe Creative 2609046908578) · ContenedorEns© (2609046908752) · Econotopía© (2610077261709). Todos los derechos reservados. Prohibida su reproducción total o parcial y su uso para entrenar inteligencia artificial sin autorización escrita del titular.</p>
  </footer>
</main>
<script src="{prof}cubo.js"></script>
<script src="{prof}sitio.js"></script>
</body>
</html>
'''


def tarjeta(nombre, monto, incluye, clave, msg, extra=''):
    con = f'{pesos(monto)} + IVA' if monto else 'Tú eliges el monto'
    tot = f'<span class="total">Total con IVA de {int(IVA*100)} %: {pesos(monto*(1+IVA))}</span>' if monto else ''
    lis = ''.join(f'<li>{e(i)}</li>' for i in incluye)
    return f'''<article class="prog"><h3>{e(nombre)}</h3><p class="monto">{con}</p>{tot}<ul class="puntos">{lis}</ul>{extra}{boton(clave, 'Patrocinar', msg)}</article>'''


# ---------- SOS767 ----------
sos = f'''  <section><h2>Qué es SOS767</h2>
    <p>SOS767 es el programa de ciudadanía de SOSistem™. En el teclado del teléfono, 767 equivale a «SOS». Reúne a personas y empresas que patrocinan soluciones concretas para quien más lo necesita: un techo digno y un celular que avise en una emergencia.</p>
    <div class="kpis"><div class="kpi"><b>8.33 millones</b><span>viviendas en rezago habitacional en México</span><small>Sedatu y Conavi, Encuesta Intercensal 2025</small></div><div class="kpi"><b>4.º lugar</b><span>Ensenada, entre los municipios con mayor rezago habitacional absoluto</span><small>Conavi, 2023</small></div><div class="kpi"><b>19.2 millones</b><span>personas de 60 años o más</span><small>INEGI, Encuesta Intercensal 2025</small></div></div>
  </section>
  <section><h2>Casa Contenedor SOS767</h2>
    <p>Casas habitables en contenedor marítimo para personas sin vivienda o que la perdieron por un desastre o una situación de emergencia. Las construye ContenedorEns©, con 10 años de experiencia en venta, renta y modificación de contenedores en Ensenada.</p>
    <div class="progs">
      {tarjeta('Casa de hasta 15 m²', 120000, ['Contenedor de 20 pies', 'Superficie exterior ≈ 14.8 m²; interior útil ≈ 13.8 m²', 'Folio único de la casa (Casa 001, 002…)', 'Certificado de patrocinio con el folio'], 'casa15', 'Hola, quiero patrocinar una Casa Contenedor SOS767 de 15 m² ($120,000 MXN + IVA).')}
      {tarjeta('Casa de hasta 30 m²', 180000, ['Contenedor de 40 pies, de preferencia High Cube (2.69 m de altura interior)', 'Superficie exterior ≈ 29.7 m²; interior útil ≈ 28.3 m²', 'Folio único de la casa', 'Certificado de patrocinio con el folio'], 'casa30', 'Hola, quiero patrocinar una Casa Contenedor SOS767 de 30 m² ($180,000 MXN + IVA).')}
      {tarjeta('Patrocina por metro cuadrado', 0, ['Cualquier persona aporta desde $100 MXN', 'Cada aportación suma a la casa en construcción', 'Barra de avance pública por folio', 'Certificado de patrocinio con el monto aportado'], 'm2', 'Hola, quiero patrocinar metros cuadrados de una Casa Contenedor SOS767.')}
    </div>
    <p class="nota">Lo que incluye cada casa (aislamiento, ventanas, puerta, instalación eléctrica, baño, cocineta y flete) se publicará en su ficha técnica antes de abrir el primer folio.</p>
  </section>
  <section><h2>Celular SOS para personas mayores</h2>
    <p>Un celular Android configurado con SOSistem™, letra grande y los contactos de su familia, para que ninguna persona mayor esté sola en una emergencia. SOSistem no graba voz ni video.</p>
    <div class="progs">
      {tarjeta('Celular SOS', 2000, ['Celular Android nuevo, con acelerómetro y GPS', 'Funda, mica y cordón', 'Chip y 6 meses de línea', 'Configuración de SOSistem™ y de los contactos familiares'], 'celular', 'Hola, quiero patrocinar un Celular SOS para una persona mayor ($2,000 MXN + IVA).')}
      {tarjeta('Padrino de línea', 35, ['Paga la línea mensual de un Celular SOS', 'El celular nunca se queda sin servicio', 'Certificado de padrino'], 'linea', 'Hola, quiero ser padrino de línea de un Celular SOS ($35 MXN + IVA al mes).')}
    </div>
  </section>
  <section><h2>Transparencia</h2>
    <ul class="puntos"><li>Cada casa y cada celular llevan un folio público.</li><li>Fotos del antes, del durante y de la entrega, con el consentimiento de la familia.</li><li>Acta de entrega firmada por la persona beneficiaria.</li><li>Informe público de ingresos y destino de cada peso.</li><li>Las personas beneficiarias se validan con un aliado institucional (DIF, Protección Civil o Cruz Roja).</li></ul>
  </section>
  <section><h2>Cómo funciona el patrocinio</h2>
    <ol class="puntos"><li>Eliges un programa y pagas el monto más IVA.</li><li>Recibes tu certificado de patrocinio con el folio. Si necesitas factura (CFDI), la pides con tus datos fiscales.</li><li>Las casas las factura y construye la persona moral que opera ContenedorEns©. Los demás programas los factura Víctor Hugo Ramírez Salgado, persona física con actividad empresarial.</li><li>La casa se entrega a la familia en comodato, con contrato; el celular, con acta de entrega.</li></ol>
    <p class="nota">El patrocinio no es un donativo deducible de impuestos. Cuando SOS767 se constituya como asociación civil autorizada por el SAT, se abrirá la opción de donativo deducible.</p>
  </section>'''

# ---------- APOYA ----------
apoya = f'''  <section><h2>Elige qué quieres apoyar</h2>
    <p>Todos los proyectos son obra de Víctor Hugo Ramírez Salgado. Cada apoyo recibe un certificado de patrocinio con folio y, si lo solicitas, factura (CFDI).</p>
    <div class="progs">
      {tarjeta('SOSistem™', 0, ['Sistema de alerta sin cámaras para recintos confinados', 'Tu apoyo financia sensores y pruebas reales', 'Modelo de utilidad en trámite ante el IMPI'], 'sosistem', 'Hola, quiero apoyar SOSistem.', '<p class="nota"><a href="https://sosistem.com">sosistem.com</a></p>')}
      {tarjeta('Investigación', 0, ['Patrocina la investigación en seguridad de recintos y estadística portuaria', 'Mención en el reporte o la publicación', 'Certificado de patrocinio'], 'investigacion', 'Hola, quiero patrocinar la investigación de Víctor Hugo Ramírez Salgado.')}
      {tarjeta('SOS767', 0, ['Casas en contenedor para quien perdió su vivienda', 'Celulares SOS para personas mayores'], 'm2', 'Hola, quiero apoyar el programa SOS767.', '<p class="nota"><a href="/sos767/">Ver programas de SOS767</a></p>')}
      {tarjeta('Intertopía©', 0, ['Sistema de generación de valor', 'Certificado de patrocinio'], 'intertopia', 'Hola, quiero apoyar Intertopía.')}
      {tarjeta('Econotopía©', 0, ['Comunicación, aprendizaje y escritura cifrada del Cubo', 'Certificado de patrocinio'], 'econotopia', 'Hola, quiero apoyar Econotopía.')}
      {tarjeta('El Cubo de la Comunicación (33)© y Código Cúbico©', 0, ['Herramienta educativa para aprender idiomas y alfabetos', 'Certificado de patrocinio'], 'cubo33', 'Hola, quiero apoyar El Cubo de la Comunicación (33).')}
    </div>
  </section>
  <section><h2>Contenedores y bodegas</h2>
    <p>La venta, renta y modificación de contenedores y la renta de mini bodegas son servicios de la empresa, no patrocinios. Se cotizan y se facturan por la persona moral que opera ContenedorEns© y Arsa Bodegas.</p>
    <div class="herr"><a class="herr-i" href="/contenedorens/"><b>ContenedorEns©</b><span>Venta, renta y modificación de contenedores.</span></a><a class="herr-i" href="https://arsabodegas.com"><b>Arsa Bodegas</b><span>Mini bodegas en contenedores en El Sauzal.</span></a></div>
  </section>'''

# ---------- LEGAL ----------
priv = f'''  <section><h2>Responsable</h2><p>Víctor Hugo Ramírez Salgado, persona física con actividad empresarial, con domicilio en Ensenada, Baja California, México, es responsable del tratamiento de tus datos personales en los programas de apoyo y patrocinio publicados en victorhugoramirezsalgado.com, sos767.org y sosistem.com. Contacto: sos@sosistem.com.</p></section>
  <section><h2>Datos que tratamos</h2><ul class="puntos"><li>Identificación y contacto: nombre, correo electrónico y teléfono.</li><li>Datos fiscales, solo si pides factura: RFC, razón social, régimen fiscal y código postal.</li><li>Datos patrimoniales: monto y fecha de tu aportación.</li><li>No tratamos datos sensibles.</li></ul><p>Los datos de tu tarjeta los procesa directamente Stripe; nunca los recibimos ni los guardamos.</p></section>
  <section><h2>Finalidades</h2><p>Necesarias: registrar tu patrocinio, emitir tu certificado y tu factura, y cumplir obligaciones fiscales. Voluntarias: enviarte informes de avance de los programas y publicar tu nombre como patrocinador, solo si lo autorizas.</p></section>
  <section><h2>Consentimiento</h2><p>Al pagar aceptas expresamente el tratamiento de tus datos patrimoniales para las finalidades necesarias. Puedes negarte a las finalidades voluntarias escribiendo a sos@sosistem.com.</p></section>
  <section><h2>Derechos ARCO</h2><p>Puedes solicitar el acceso, la rectificación, la cancelación u oposición al tratamiento de tus datos, o revocar tu consentimiento, escribiendo a sos@sosistem.com con tu nombre y la descripción de tu solicitud. Respondemos en un máximo de 20 días hábiles.</p></section>
  <section><h2>Transferencias</h2><p>Solo compartimos tus datos con Stripe (procesamiento del pago), con el proveedor de facturación electrónica y con las autoridades que lo requieran por ley.</p></section>
  <section><h2>Cambios</h2><p>Cualquier cambio a este aviso se publicará en esta misma página. Última actualización: {FECHA}.</p></section>'''

term = f'''  <section><h2>Qué recibes</h2><p>El patrocinio es una aportación económica a un programa o proyecto de Víctor Hugo Ramírez Salgado. A cambio recibes un certificado digital de patrocinio con folio y, si lo autorizas, la mención de tu nombre como patrocinador. En SOS767, tu aportación se destina a la casa o al celular del folio indicado.</p></section>
  <section><h2>Precios e impuestos</h2><p>Los montos están en pesos mexicanos y no incluyen IVA, que se suma al pagar. No es un donativo deducible de impuestos ni una inversión, y no otorga derechos sobre las obras, marcas o sistemas del autor.</p></section>
  <section><h2>Factura</h2><p>Si necesitas CFDI, pídelo a sos@sosistem.com con tus datos fiscales dentro del mismo mes del pago. Las casas las factura la persona moral que opera ContenedorEns©; los demás programas, Víctor Hugo Ramírez Salgado, persona física con actividad empresarial. Las aportaciones sin solicitud de factura se incluyen en la factura global a público en general.</p></section>
  <section><h2>Entrega</h2><p>El certificado se envía por correo en un máximo de 5 días hábiles. Las casas y los celulares se entregan a las personas beneficiarias validadas por un aliado institucional; los plazos dependen de completar el monto de cada folio y se informan en la página del programa.</p></section>
  <section><h2>Propiedad intelectual</h2><p>Todas las obras, marcas y sistemas mencionados son de Víctor Hugo Ramírez Salgado y están registrados en Safe Creative; SOSistem™ tiene modelo de utilidad en trámite ante el IMPI.</p></section>
  <section><h2>Jurisdicción</h2><p>Para cualquier controversia, las partes se someten a las leyes de México y a los tribunales de Ensenada, Baja California. Última actualización: {FECHA}.</p></section>'''

reemb = f'''  <section><h2>Reembolsos</h2><ul class="puntos"><li>Puedes pedir el reembolso total dentro de los 30 días naturales siguientes a tu pago, siempre que tu aportación no se haya aplicado todavía a un folio en construcción o entregado.</li><li>Escribe a sos@sosistem.com o por WhatsApp al 646 227 0490 con tu nombre, fecha y monto.</li><li>El reembolso se hace por el mismo medio de pago en un máximo de 10 días hábiles. Los pagos en OXXO se reembolsan por transferencia bancaria.</li><li>Si ya recibiste factura, se emite la nota de crédito correspondiente.</li></ul></section>
  <section><h2>Cargos no reconocidos</h2><p>Si no reconoces un cargo, escríbenos antes de acudir a tu banco: lo revisamos y lo resolvemos de inmediato. Última actualización: {FECHA}.</p></section>'''

SAL = {
    'sos767/index.html': ('SOS767', 'SOS767: programa de ciudadanía de SOSistem. Casas en contenedor para quien perdió su vivienda y celulares SOS para personas mayores.', 'SOS767', 'Un techo digno y un celular que avisa: ciudadanía para quien más lo necesita', sos),
    'apoya/index.html': ('Apoya los proyectos', 'Apoya los proyectos de Víctor Hugo Ramírez Salgado: SOSistem, investigación, SOS767, Intertopía, Econotopía y El Cubo de la Comunicación.', 'APOYA', 'Patrocina la investigación y los proyectos de Víctor Hugo Ramírez Salgado', apoya),
    'legal/privacidad.html': ('Aviso de privacidad', 'Aviso de privacidad de los programas de apoyo y patrocinio de Víctor Hugo Ramírez Salgado.', 'PRIVACIDAD', 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares', priv),
    'legal/terminos.html': ('Términos y condiciones', 'Términos y condiciones de los patrocinios de Víctor Hugo Ramírez Salgado.', 'TERMINOS', 'Patrocinios, certificados y facturación', term),
    'legal/reembolsos.html': ('Política de reembolsos', 'Política de reembolsos de los patrocinios de Víctor Hugo Ramírez Salgado.', 'REEMBOLSOS', 'Claridad antes y después de tu pago', reemb),
}
for ruta, (t, d, m, l, c) in SAL.items():
    est = ('Vigente', 'ok') if ruta.startswith('legal') else ('En preparación', 'prep')
    f = RAIZ / ruta
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(pagina(ruta, t, d, m, l, c, est), encoding='utf-8')
    print('ok', ruta)
