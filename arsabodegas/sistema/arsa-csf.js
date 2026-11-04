/* Arsa Bodegas© — lector de la Constancia de Situación Fiscal (SAT) y validadores de R.F.C. y C.U.R.P.
   Todo se procesa en el dispositivo; el PDF no se envía a ningún servidor.
   Autor y titular: Víctor Hugo Ramírez Salgado. Asistencia-IA. */
(function (g) {
  'use strict';
  /* Catálogo c_RegimenFiscal del SAT (CFDI 4.0) */
  var REGIMENES = [
    ['601', 'General de Ley Personas Morales', /general de ley/i],
    ['603', 'Personas Morales con Fines no Lucrativos', /fines no lucrativos/i],
    ['605', 'Sueldos y Salarios e Ingresos Asimilados a Salarios', /sueldos y salarios/i],
    ['606', 'Arrendamiento', /^\s*(r[ée]gimen de )?arrendamiento/i],
    ['607', 'Régimen de Enajenación o Adquisición de Bienes', /enajenaci[óo]n o adquisici[óo]n/i],
    ['608', 'Demás ingresos', /dem[áa]s ingresos/i],
    ['610', 'Residentes en el Extranjero sin Establecimiento Permanente en México', /residentes en el extranjero/i],
    ['611', 'Ingresos por Dividendos (socios y accionistas)', /dividendos/i],
    ['612', 'Personas Físicas con Actividades Empresariales y Profesionales', /actividades empresariales y profesionales/i],
    ['614', 'Ingresos por intereses', /ingresos por intereses/i],
    ['615', 'Régimen de los ingresos por obtención de premios', /premios/i],
    ['616', 'Sin obligaciones fiscales', /sin obligaciones fiscales/i],
    ['620', 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos', /cooperativas/i],
    ['621', 'Incorporación Fiscal', /incorporaci[óo]n fiscal/i],
    ['622', 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', /agr[íi]colas|ganaderas|silv[íi]colas|pesqueras/i],
    ['623', 'Opcional para Grupos de Sociedades', /grupos de sociedades/i],
    ['624', 'Coordinados', /coordinados/i],
    ['625', 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', /plataformas tecnol[óo]gicas/i],
    ['626', 'Régimen Simplificado de Confianza', /simplificado de confianza/i]
  ];
  function claveRegimen(txt) {
    for (var i = 0; i < REGIMENES.length; i++) if (REGIMENES[i][2].test(txt)) return REGIMENES[i][0] + ' ' + REGIMENES[i][1];
    return txt;
  }
  /* R.F.C.: formato y dígito verificador (homoclave) */
  function validarRFC(rfc) {
    rfc = String(rfc || '').toUpperCase().replace(/[\s-]/g, '');
    var m = rfc.match(/^([A-ZÑ&]{3,4})(\d{2})(\d{2})(\d{2})([A-Z\d]{2})([A\d])$/);
    if (!m) return { ok: false, msg: 'Formato de R.F.C. no válido' };
    var tipo = m[1].length === 3 ? 'moral' : 'fisica';
    var dic = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ';
    var base = (tipo === 'moral' ? ' ' : '') + rfc.slice(0, -1), suma = 0;
    for (var i = 0; i < 12; i++) { var v = dic.indexOf(base[i]); suma += (v < 0 ? 0 : v) * (13 - i); }
    var r = 11 - (suma % 11), dv = r === 11 ? '0' : r === 10 ? 'A' : String(r);
    return { ok: true, tipo: tipo, rfc: rfc, digito: dv === rfc.slice(-1), msg: dv === rfc.slice(-1) ? 'R.F.C. válido (' + (tipo === 'moral' ? 'persona moral' : 'persona física') + ')' : 'Formato correcto, pero el dígito verificador no coincide; revísalo con la constancia' };
  }
  /* C.U.R.P.: formato, dígito verificador y datos que contiene */
  var EDOS = { AS: 'Aguascalientes', BC: 'Baja California', BS: 'Baja California Sur', CC: 'Campeche', CL: 'Coahuila', CM: 'Colima', CS: 'Chiapas', CH: 'Chihuahua', DF: 'Ciudad de México', DG: 'Durango', GT: 'Guanajuato', GR: 'Guerrero', HG: 'Hidalgo', JC: 'Jalisco', MC: 'Estado de México', MN: 'Michoacán', MS: 'Morelos', NT: 'Nayarit', NL: 'Nuevo León', OC: 'Oaxaca', PL: 'Puebla', QT: 'Querétaro', QR: 'Quintana Roo', SP: 'San Luis Potosí', SL: 'Sinaloa', SR: 'Sonora', TC: 'Tabasco', TS: 'Tamaulipas', TL: 'Tlaxcala', VZ: 'Veracruz', YN: 'Yucatán', ZS: 'Zacatecas', NE: 'Nacido en el extranjero' };
  function validarCURP(curp) {
    curp = String(curp || '').toUpperCase().replace(/\s/g, '');
    var m = curp.match(/^([A-Z][AEIOUX][A-Z]{2})(\d{2})(\d{2})(\d{2})([HMX])([A-Z]{2})([B-DF-HJ-NP-TV-Z]{3})([A-Z\d])(\d)$/);
    if (!m) return { ok: false, msg: 'Formato de C.U.R.P. no válido' };
    var dic = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', s = 0;
    for (var i = 0; i < 17; i++) s += dic.indexOf(curp[i]) * (18 - i);
    var dv = (10 - (s % 10)) % 10, siglo = /\d/.test(m[8]) ? '19' : '20';
    return { ok: true, curp: curp, digito: dv === Number(m[9]), nacimiento: siglo + m[2] + '-' + m[3] + '-' + m[4], sexo: m[5] === 'H' ? 'Hombre' : m[5] === 'M' ? 'Mujer' : 'No binario', estado: EDOS[m[6]] || m[6], msg: dv === Number(m[9]) ? 'C.U.R.P. válida' : 'Formato correcto, pero el dígito verificador no coincide' };
  }
  function validarID(x) { x = String(x || '').toUpperCase().replace(/\s/g, ''); return x.length === 18 ? validarCURP(x) : validarRFC(x); }

  var ETIQ = ['RFC:', 'CURP:', 'Nombre (s):', 'Primer Apellido:', 'Segundo Apellido:', 'Fecha inicio de operaciones:', 'Estatus en el padrón:', 'Fecha de último cambio de estado:', 'Nombre Comercial:', 'Denominación/Razón Social:', 'Denominación / Razón Social:', 'Régimen Capital:', 'Régimen de capital:', 'Código Postal:', 'Tipo de Vialidad:', 'Nombre de Vialidad:', 'Número Exterior:', 'Número Interior:', 'Nombre de la Colonia:', 'Nombre de la Localidad:', 'Nombre del Municipio o Demarcación Territorial:', 'Nombre de la Entidad Federativa:', 'Entre Calle:', 'Y Calle:', 'Correo Electrónico:', 'Tel. Fijo Lada:', 'Número:', 'Tel. Móvil Lada:', 'Estado de la vialidad:', 'Características del domicilio:', 'Actividades Económicas:', 'Regímenes:', 'Obligaciones:', 'Datos de Ubicación', 'Datos de Identificación', 'Lugar y Fecha de Emisión', 'idCIF:', 'Página'];
  function norm(t) { return t.replace(/\s+/g, ' ').trim(); }
  function campos(txt) {
    var pos = [];
    ETIQ.forEach(function (e) { var re = new RegExp(e.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&').replace(/\s+/g, '\\s*'), 'gi'), m; while ((m = re.exec(txt))) pos.push({ e: e.toLowerCase(), i: m.index, f: m.index + m[0].length }); });
    pos.sort(function (a, b) { return a.i - b.i; });
    var out = {};
    pos.forEach(function (p, k) { var fin = k + 1 < pos.length ? pos[k + 1].i : Math.min(txt.length, p.f + 160); var v = norm(txt.slice(p.f, fin)); if (v && !(p.e in out)) out[p.e] = v; });
    return out;
  }
  async function textoPDF(bytes) {
    var lib = g.pdfjsLib; if (!lib) throw new Error('No se cargó el lector de PDF.');
    var pdf = await lib.getDocument({ data: bytes }).promise, partes = [];
    for (var n = 1; n <= Math.min(pdf.numPages, 6); n++) { var p = await pdf.getPage(n), tc = await p.getTextContent(); partes.push(tc.items.map(function (it) { return it.str; }).join(' ')); }
    return partes.join(' \n ');
  }
  function analizar(txt) {
    var c = campos(txt), get = function (k) { return c[k.toLowerCase()] || ''; };
    var rfc = (get('RFC:').match(/[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}/) || (txt.match(/\b[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}\b/) || []))[0] || '';
    var curp = (get('CURP:').match(/[A-Z]{4}\d{6}[A-Z]{6}[A-Z\d]\d/) || [])[0] || '';
    var nombre = norm([get('Nombre (s):'), get('Primer Apellido:'), get('Segundo Apellido:')].join(' '));
    var razon = get('Denominación/Razón Social:') || get('Denominación / Razón Social:');
    var capital = get('Régimen Capital:') || get('Régimen de capital:');
    var tipo = rfc.length === 12 ? 'moral' : rfc.length === 13 ? 'fisica' : (razon ? 'moral' : 'fisica');
    var nom = tipo === 'moral' ? norm(razon + (capital ? ' ' + capital : '')) : nombre;
    var dom = [get('Tipo de Vialidad:') && get('Nombre de Vialidad:') ? get('Tipo de Vialidad:') + ' ' + get('Nombre de Vialidad:') : get('Nombre de Vialidad:'),
      get('Número Exterior:') ? 'No. ' + get('Número Exterior:') : '', get('Número Interior:') ? 'Int. ' + get('Número Interior:') : '',
      get('Nombre de la Colonia:') ? 'Col. ' + get('Nombre de la Colonia:') : '', get('Nombre de la Localidad:'), get('Nombre del Municipio o Demarcación Territorial:'), get('Nombre de la Entidad Federativa:')]
      .map(norm).filter(Boolean).join(', ');
    var cp = (get('Código Postal:').match(/\d{5}/) || [])[0] || '';
    var regs = [], seg = '';
    var i = txt.search(/Reg[íi]menes\s*:/i), j = txt.search(/Obligaciones\s*:/i);
    if (i >= 0) seg = txt.slice(i, j > i ? j : i + 1200).replace(/Reg[íi]menes\s*:/i, '').replace(/R[ée]gimen\s+Fecha\s+Inicio\s+Fecha\s+Fin/i, '');
    var re = /([A-Za-zÁÉÍÓÚÑáéíóúñ ,.]+?)\s+(\d{2}\/\d{2}\/\d{4})(\s+\d{2}\/\d{2}\/\d{4})?/g, m;
    while ((m = re.exec(seg))) { var t = norm(m[1]); if (t.length > 5 && !m[3]) regs.push({ texto: t, desde: m[2], clave: claveRegimen(t) }); }
    var correo = (get('Correo Electrónico:').match(/[^\s@]+@[^\s@]+\.[^\s@]+/) || [])[0] || '';
    var estatus = get('Estatus en el padrón:').split(' ')[0] || '';
    var emision = (txt.match(/Lugar y Fecha de Emisi[óo]n\s*([^\n]{0,80}?\d{4})/i) || [])[1] || '';
    return { rfc: rfc, curp: curp, tipo: tipo, nombre: nom, razon: razon, capital: capital, comercial: get('Nombre Comercial:'), cp: cp, dom: dom, regimenes: regs, correo: correo, estatus: estatus, emision: norm(emision), esCSF: /constancia de situaci[óo]n fiscal|c[ée]dula de identificaci[óo]n fiscal/i.test(txt) };
  }
  async function leerCSF(bytes) { var t = await textoPDF(bytes); var r = analizar(t); if (!r.rfc) throw new Error('No encontré un R.F.C. en el PDF. ¿Es la Constancia de Situación Fiscal del SAT?'); return r; }
  g.ArsaCSF = { leerCSF: leerCSF, analizar: analizar, validarRFC: validarRFC, validarCURP: validarCURP, validarID: validarID, REGIMENES: REGIMENES, claveRegimen: claveRegimen };
})(typeof window !== 'undefined' ? window : globalThis);
