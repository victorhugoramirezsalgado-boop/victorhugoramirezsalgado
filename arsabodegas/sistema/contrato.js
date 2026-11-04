/* Arsa Bodegas© — plantilla de contrato de arrendamiento de mini bodega (v2026.11).
   Autor y titular: Víctor Hugo Ramírez Salgado. Asistencia-IA: herramienta de redacción.
   La misma plantilla se usa en el panel privado y en arsabodegas.com/firma. */
(function (g) {
  'use strict';
  var VERSION = 'v2026.11b';
  var PERIODOS = {
    dia:       { n: 'diario',     s: 'día',       p: 'días',       dias: 1 },
    semana:    { n: 'semanal',    s: 'semana',    p: 'semanas',    dias: 7 },
    quincena:  { n: 'quincenal',  s: 'quincena',  p: 'quincenas',  dias: 15 },
    mes:       { n: 'mensual',    s: 'mes',       p: 'meses',      dias: 30 },
    trimestre: { n: 'trimestral', s: 'trimestre', p: 'trimestres', dias: 90 },
    semestre:  { n: 'semestral',  s: 'semestre',  p: 'semestres',  dias: 180 },
    anio:      { n: 'anual',      s: 'año',       p: 'años',       dias: 360 }
  };
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  function r2(x) { return Math.round((Number(x) || 0) * 100) / 100; }
  function money(x) { return '$' + r2(x).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fechaLarga(iso) {
    if (!iso) return '____ de __________ de ______';
    var p = String(iso).slice(0, 10).split('-');
    return Number(p[2]) + ' de ' + MESES[Number(p[1]) - 1] + ' de ' + p[0];
  }
  /* Número a letras (pesos mexicanos) */
  var U = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  var D = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  var C = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  function cientos(n) {
    if (n === 0) return '';
    if (n === 100) return 'cien';
    var c = Math.floor(n / 100), r = n % 100, s = C[c];
    if (r) {
      var t = r < 30 ? U[r] : D[Math.floor(r / 10)] + (r % 10 ? ' y ' + U[r % 10] : '');
      s = (s ? s + ' ' : '') + t;
    }
    return s;
  }
  function enteroLetras(n) {
    if (n === 0) return 'cero';
    var mill = Math.floor(n / 1e6), miles = Math.floor((n % 1e6) / 1000), resto = n % 1000, out = [];
    if (mill) out.push(mill === 1 ? 'un millón' : cientos(mill) + ' millones');
    if (miles) out.push(miles === 1 ? 'mil' : cientos(miles) + ' mil');
    if (resto) out.push(cientos(resto));
    return out.join(' ');
  }
  function letras(x) {
    x = r2(x);
    var e = Math.floor(x), c = Math.round((x - e) * 100);
    var t = enteroLetras(e);
    var de = (e >= 1e6 && e % 1e6 === 0) ? ' de' : '';
    return (t.charAt(0).toUpperCase() + t.slice(1)) + de + ' ' + (e === 1 ? 'peso' : 'pesos') + ' ' + (c < 10 ? '0' : '') + c + '/100 M.N.';
  }
  function calcular(d) {
    var base = r2(d.monto), tasa = Number(d.iva || 0);
    var iva = r2(base * tasa / 100);
    return { base: base, iva: iva, total: r2(base + iva) };
  }
  function v(x, largo) { return (x && String(x).trim()) ? String(x).trim() : '_'.repeat(largo || 24); }


  /* Partes: con responsable → arrendatario = responsable y aval = empresa/cliente fiscal;
     sin responsable → arrendatario = cliente fiscal y aval = el mismo (mismo R.F.C.). */
  function partes(d) {
    var c = d.cli || {}, r = d.resp || {};
    var conResp = !!(r.nombre && String(r.nombre).trim());
    var contactoCli = [c.tel, c.correo].filter(Boolean).join(' / ') || c.contacto || '';
    var contactoResp = [r.tel, r.correo].filter(Boolean).join(' / ');
    return {
      conResp: conResp,
      arrNombre: conResp ? r.nombre.trim() : (c.nombre || ''),
      arrId: conResp ? (r.id || '') : (c.rfc || ''),
      arrContacto: conResp ? (contactoResp || contactoCli) : contactoCli,
      avalNombre: conResp ? (c.nombre || '') : 'el propio «EL ARRENDATARIO»',
      avalFirma: conResp ? (c.nombre || '') : 'El propio «EL ARRENDATARIO» (mismo R.F.C.)',
      fiscal: (c.nombre || '') + (c.rfc ? ', R.F.C. ' + c.rfc : '') + (c.regimen ? ', régimen fiscal ' + c.regimen : '') + (c.dom ? ', domicilio fiscal ' + c.dom : '') + (c.cp ? ', C.P. ' + c.cp : ''),
      moral: (c.tipo === 'moral') || (String(c.rfc || '').length === 12)
    };
  }
  /* Devuelve bloques: {k:'t'|'h'|'p'|'n', b?:'texto en negritas al inicio', x:'texto'} */
  function contrato(d) {
    d = d || {};
    var a = d.arr || {}, c = d.cli || {};
    var per = PERIODOS[d.periodo] || PERIODOS.mes;
    var m = calcular(d);
    var plazo = Number(d.plazo) || 1;
    var dep = r2(d.deposito);
    var B = [];
    B.push({ k: 't', x: 'CONTRATO DE ARRENDAMIENTO DE BIEN MUEBLE' });
    B.push({ k: 'n', x: 'Mini bodega en contenedor · Folio ' + v(d.folio, 10) + ' · ' + VERSION });
    var pa = partes(d);
    var otra = pa.conResp
      ? 'EL C. ' + v(pa.arrNombre, 30).toUpperCase() + ', CON C.U.R.P./R.F.C. ' + v(pa.arrId, 18) + ' Y TELÉFONO/CORREO ELECTRÓNICO ' + v(pa.arrContacto, 24) + ', EN SU CARÁCTER DE RESPONSABLE DEL CONTRATO, A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ «EL ARRENDATARIO»; CON LA COMPARECENCIA DE ' + v(c.nombre, 30).toUpperCase() + ', CON R.F.C. ' + v(c.rfc, 13) + ' Y DOMICILIO FISCAL EN ' + v(c.dom, 30) + (c.cp ? ', C.P. ' + c.cp : '') + ', COMO OBLIGADO SOLIDARIO Y AVAL'
      : v(c.nombre, 30).toUpperCase() + ', CON R.F.C. ' + v(c.rfc, 13) + (c.curp ? ' Y C.U.R.P. ' + c.curp : '') + ', DOMICILIO FISCAL EN ' + v(c.dom, 30) + (c.cp ? ', C.P. ' + c.cp : '') + ' Y TELÉFONO/CORREO ELECTRÓNICO ' + v(pa.arrContacto, 24) + (pa.moral ? ', POR CONDUCTO DE QUIEN FIRMA AL CALCE CON FACULTADES SUFICIENTES' : '') + ', A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ «EL ARRENDATARIO»';
    B.push({ k: 'p', x: 'CONTRATO DE ARRENDAMIENTO QUE CELEBRAN, POR UNA PARTE, LA PERSONA MORAL DENOMINADA ' + v(a.razon).toUpperCase() + ', REPRESENTADA EN ESTE ACTO POR EL C. ' + v(a.rep).toUpperCase() + ', EN SU CARÁCTER DE ADMINISTRADOR ÚNICO Y DIRECTOR DE PROYECTOS, CON R.F.C. ' + v(a.rfc, 13) + ' Y DOMICILIO EN ' + v(a.dom).toUpperCase() + ', A QUIEN EN LO SUCESIVO SE LE DENOMINARÁ «EL ARRENDADOR»; Y POR LA OTRA PARTE, ' + otra + ', AL TENOR DE LAS SIGUIENTES:' });
    B.push({ k: 'h', x: 'DECLARACIONES' });
    B.push({ k: 'p', b: 'I. Declara «EL ARRENDADOR»: ', x: 'Ser una sociedad mercantil legalmente constituida conforme a las leyes mexicanas, cuyo Administrador Único y Director de Proyectos cuenta con facultades plenas de dominio y administración que no le han sido revocadas ni limitadas, y ser legítimo propietario del bien mueble consistente en: contenedor metálico de 20 pies, número ' + v(d.contenedor, 13) + (d.bodega ? ' (' + d.bodega + ')' : '') + ', ubicado en las instalaciones de ' + v(a.dom) + '.' });
    B.push({ k: 'p', b: 'II. Declara «EL ARRENDATARIO»: ', x: 'Contar con plena capacidad jurídica, acreditar su identidad con documento oficial con fotografía y R.F.C. vigente, y tener interés directo en tomar en arrendamiento el bien mueble para destinarlo única y exclusivamente a labores lícitas de guarda, custodia, resguardo y depósito de mercancías permitidas por la ley en vigor. Los datos fiscales para la facturación son: ' + v(pa.fiscal, 30) + ', conforme a su Constancia de Situación Fiscal vigente.' });
    B.push({ k: 'h', x: 'CLÁUSULAS' });
    B.push({ k: 'p', b: 'PRIMERA. OBJETO. ', x: '«EL ARRENDADOR» otorga el uso y goce temporal a «EL ARRENDATARIO», y este recibe en arrendamiento, en óptimas condiciones de servicio, el bien mueble especificado en la Declaración I.' });
    B.push({ k: 'p', b: 'SEGUNDA. VIGENCIA Y MORA. ', x: 'La vigencia pactada será de ' + plazo + ' ' + (plazo === 1 ? per.s : per.p) + ', en periodos de ' + per.dias + ' ' + (per.dias === 1 ? 'día natural' : 'días naturales') + ', iniciando el día ' + fechaLarga(d.inicio) + ', fecha de ingreso a la bodega confirmada por escrito o de palabra, y cada periodo se generará por el monto con base en la tarifa vigente, concluyendo forzosamente al término del último periodo utilizado. Si al vencimiento el bien no es desocupado y entregado formalmente, se generará una penalización por concepto de mora del 5 % (cinco por ciento) mensual calculado sobre la renta aplicable de la tarifa y, posteriormente, por cada día natural después de los 3 (tres) meses de demora, sin perjuicio de la acción rescisoria.' });
    B.push({ k: 'p', b: 'TERCERA. DEVOLUCIÓN ANTICIPADA. ', x: 'Concluido el plazo o rescindido el contrato, «EL ARRENDATARIO» devolverá el bien libre de gravamen, adeudo y totalmente vacío. Si decidiera desocupar antes del término convenido, no habrá devolución de saldos ni bonificación en especie.' });
    B.push({ k: 'p', b: 'CUARTA. CONTRAPRESTACIÓN Y PAGO. ', x: 'La renta convenida es por la cantidad de ' + money(m.base) + ' (' + letras(m.base) + ') por periodo ' + per.n + ', más el I.V.A. del ' + Number(d.iva || 0) + ' % que corresponda (' + money(m.iva) + '), con un total de ' + money(m.total) + ' (' + letras(m.total) + ') por periodo, pagadera dentro de los primeros 5 (cinco) días naturales de cada ciclo mediante depósito o transferencia electrónica bancaria, o como se convenga con «EL ARRENDADOR», a la cuenta número ' + v(a.cuenta, 10) + ', CLABE interbancaria ' + v(a.clabe, 18) + ' de ' + v(a.banco, 12) + ', a nombre de ' + v(a.razon) + ' (validar la cuenta el día de pago).' });
    B.push({ k: 'p', b: 'QUINTA. EMISIÓN DE COMPROBANTES FISCALES. ', x: '«EL ARRENDADOR» expedirá el Comprobante Fiscal Digital por Internet (CFDI) correspondiente una vez confirmado el cobro líquido en cuenta bancaria, a nombre de ' + v(c.nombre, 20) + ' con los datos fiscales de la Declaración II (R.F.C., régimen fiscal y código postal) cuando así lo solicite, o en el comprobante global al público en general en caso contrario, conforme a las disposiciones fiscales vigentes.' });
    B.push({ k: 'p', b: 'SEXTA. OBLIGADO SOLIDARIO Y AVAL. ', x: (pa.conResp ? 'Comparece ' + v(c.nombre) + ', con R.F.C. ' + v(c.rfc, 13) + ', quien se constituye' : 'Funge como tal el propio «EL ARRENDATARIO», con el mismo R.F.C. ' + v(c.rfc, 13) + ', quien se constituye') + ' como Obligado Solidario de «EL ARRENDATARIO», respondiendo de manera indistinta e indivisible por todas las obligaciones patrimoniales, rentas y penalizaciones hasta la total entrega formal del bien.' });
    B.push({ k: 'p', b: 'SÉPTIMA. ESTADO DEL BIEN Y MANTENIMIENTO. ', x: 'El bien mueble se entrega en condiciones óptimas de conservación, estanqueidad y seguridad. «EL ARRENDATARIO» responderá de cualquier desperfecto, deformación estructural o daño directo o indirecto ocasionado durante el almacenaje, estiba, maniobras de carga o descarga, cubriendo el costo íntegro de reparación a precios comerciales.' });
    B.push({ k: 'p', b: 'OCTAVA. DESTINO LÍCITO Y CONDICIONES SANITARIAS. ', x: 'Queda estrictamente prohibido introducir, almacenar o custodiar sustancias tóxicas, corrosivas, explosivas, inflamables, animales vivos, perecederos susceptibles de putrefacción o cualquier mercancía clasificada como de procedencia o comercio ilícito.' });
    B.push({ k: 'p', b: 'NOVENA. RESCISIÓN DE PLENO DERECHO. ', x: 'Serán causas expresas de rescisión inmediata, sin necesidad de declaración judicial previa: a) el impago de una o más mensualidades; b) el subarriendo o cesión de derechos no autorizada; c) el ingreso de mercancías ilícitas, contaminantes o peligrosas; d) el incumplimiento reiterado de las normas de operación y protección civil del recinto.' });
    B.push({ k: 'p', b: 'DÉCIMA. RESPONSABILIDAD ANTE SINIESTROS. ', x: 'En caso fortuito o fuerza mayor que provoque daños, la indemnización operará únicamente conforme a los avalúos y coberturas periciales aplicables a mercancías formalmente declaradas en inventario, excluyendo lucro cesante o pérdidas no comprobadas pericialmente.' });
    B.push({ k: 'p', b: 'DÉCIMA PRIMERA. DEPÓSITO EN GARANTÍA. ', x: (dep > 0 ? '«EL ARRENDATARIO» entrega la cantidad de ' + money(dep) + ' (' + letras(dep) + '), ' : '«EL ARRENDATARIO» no entrega depósito (no aplica, conforme a lo convenido con el Administrador Único); en su caso, el depósito sería ') + 'equivalente a un mes de renta, monto destinado a garantizar daños a la estructura física del contenedor o saldos pendientes. No será imputable a rentas y será reembolsable dentro de los 30 días posteriores a la entrega formal a entera satisfacción de «EL ARRENDADOR».' });
    B.push({ k: 'p', b: 'DÉCIMA SEGUNDA. JURISDICCIÓN Y COMPETENCIA. ', x: 'Las partes se someten de manera expresa a las leyes vigentes en el Estado de Baja California y a la jurisdicción de los Tribunales competentes de la Ciudad de Ensenada, Baja California, renunciando a cualquier fuero por razón de domicilio presente o futuro.' });
    B.push({ k: 'p', b: 'DÉCIMA TERCERA. FIRMA ELECTRÓNICA. ', x: 'Las partes reconocen como válida y vinculante la firma electrónica asentada en este contrato por medio de un dispositivo electrónico, la cual identifica al firmante y expresa su aprobación del contenido, conforme a los artículos 89, 89 bis y 93 del Código de Comercio y 1803 del Código Civil Federal. La constancia de firma, con fecha, hora y huella digital SHA-256 del texto firmado, forma parte integral de este contrato; cualquier alteración posterior del texto cambia la huella y deja sin efecto la copia alterada.' });
    B.push({ k: 'p', b: 'DÉCIMA CUARTA. PROTECCIÓN DE DATOS PERSONALES. ', x: 'Los datos personales recabados con motivo de este contrato (identificación, contacto, datos fiscales y del obligado solidario) se tratarán bajo los principios de licitud, consentimiento, información, calidad, finalidad, lealtad, proporcionalidad y responsabilidad previstos en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente, únicamente para: a) identificación y verificación; b) formalización y cumplimiento del servicio; c) control de accesos y seguridad del recinto; d) facturación, cobranza y obligaciones fiscales. «EL ARRENDATARIO» puede ejercer sus derechos de acceso, rectificación, cancelación y oposición mediante solicitud por escrito al correo ' + v(a.correo, 20) + '.' });
    B.push({ k: 'p', x: 'Leído que fue el presente instrumento y enteradas las partes de su fuerza y alcance legal, lo firman en Ensenada, Baja California, el día ' + fechaLarga(d.fechaFirma) + '.' });
    B.push({ k: 'h', x: 'MARCO JURÍDICO APLICABLE' });
    B.push({ k: 'p', b: 'Federal / mercantil: ', x: 'Código de Comercio, artículos 75 (fracciones I y X), 78, 81, 89, 89 bis y 93; Ley General de Sociedades Mercantiles, artículos 10, 142 y 143; Código Fiscal de la Federación, artículos 29 y 29-A; Código Civil Federal, artículo 1803.' });
    B.push({ k: 'p', b: 'Estatal (Baja California): ', x: 'Código Civil para el Estado de Baja California, título «Del arrendamiento»; Código de Procedimientos Civiles del Estado de Baja California.' });
    B.push({ k: 'p', b: 'Municipal (Ensenada, B.C.): ', x: 'Reglamento de la Ley de Edificaciones; Reglamento para la Prevención, Control y Extinción de Incendios y Siniestros (extintores vigentes, NOM-100-STPS) y Reglamento de Protección Civil y Gestión Integral de Riesgos del Municipio de Ensenada.' });
    return B;
  }
  function textoPlano(d) {
    return contrato(d).map(function (b) { return (b.b || '') + b.x; }).join('\n');
  }
  async function sha256(txt) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(buf)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }
  g.ArsaContrato = { partes: partes, VERSION: VERSION, PERIODOS: PERIODOS, contrato: contrato, textoPlano: textoPlano, sha256: sha256, calcular: calcular, letras: letras, money: money, fechaLarga: fechaLarga, r2: r2 };
})(typeof window !== 'undefined' ? window : globalThis);
