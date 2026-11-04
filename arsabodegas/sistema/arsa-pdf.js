/* Arsa Bodegas© — generador de PDF (contrato, constancia de firma y recibo) con pdf-lib.
   Autor y titular: Víctor Hugo Ramírez Salgado. Asistencia-IA. */
(function (g) {
  'use strict';
  var A = g.ArsaContrato;
  var W = 612, H = 792, M = 50;
  function limpiar(s) {
    return String(s == null ? '' : s)
      .replace(/[‐-‒−]/g, '-').replace(/[   ]/g, ' ')
      .replace(/[^\x09\x0a\x0d\x20-\x7e¡-ÿ–—‘’“”•…€™]/g, '');
  }
  function Lienzo(doc, fonts, logo) {
    this.doc = doc; this.f = fonts; this.logo = logo; this.page = null; this.y = 0; this.n = 0;
  }
  Lienzo.prototype.nueva = function () {
    this.page = this.doc.addPage([W, H]); this.n++; this.y = H - M;
    var gris = PDFLib.rgb(0.45, 0.45, 0.47);
    this.page.drawText(limpiar('Arsa Bodegas© · Mini bodegas en contenedor · Ensenada, B.C.'), { x: M, y: 24, size: 7, font: this.f.r, color: gris });
    this.page.drawText(String(this.n), { x: W - M - 8, y: 24, size: 7, font: this.f.r, color: gris });
  };
  Lienzo.prototype.espacio = function (h) { if (!this.page || this.y - h < M) this.nueva(); };
  Lienzo.prototype.parrafo = function (bold, txt, o) {
    o = o || {}; var size = o.size || 9, lh = size * 1.38, maxW = o.w || (W - 2 * M), x0 = o.x || M;
    var toks = [];
    if (bold) limpiar(bold).split(/(\s+)/).forEach(function (t) { if (t) toks.push({ t: t, f: this.f.b }); }, this);
    limpiar(txt).split(/(\s+)/).forEach(function (t) { if (t) toks.push({ t: t, f: o.bold ? this.f.b : this.f.r }); }, this);
    var lines = [], line = [], w = 0;
    toks.forEach(function (k) {
      var tw = k.f.widthOfTextAtSize(k.t, size);
      if (/^\s+$/.test(k.t)) { if (line.length) { line.push(k); w += tw; } return; }
      if (w + tw > maxW && line.length) { while (line.length && /^\s+$/.test(line[line.length - 1].t)) line.pop(); lines.push(line); line = []; w = 0; }
      line.push(k); w += tw;
    });
    if (line.length) lines.push(line);
    lines.forEach(function (ln) {
      this.espacio(lh);
      var x = x0;
      if (o.center) { var tw = ln.reduce(function (s, k) { return s + k.f.widthOfTextAtSize(k.t, size); }, 0); x = x0 + (maxW - tw) / 2; }
      ln.forEach(function (k) {
        if (!/^\s+$/.test(k.t)) this.page.drawText(k.t, { x: x, y: this.y - size, size: size, font: k.f, color: o.color || PDFLib.rgb(0.13, 0.13, 0.14) });
        x += k.f.widthOfTextAtSize(k.t, size);
      }, this);
      this.y -= lh;
    }, this);
    this.y -= o.after == null ? 4 : o.after;
  };
  Lienzo.prototype.encabezado = function (titulo, sub) {
    this.espacio(80);
    if (this.logo) { var d = this.logo.scale(56 / this.logo.width); this.page.drawImage(this.logo, { x: M, y: this.y - d.height, width: d.width, height: d.height }); }
    this.page.drawText(limpiar(titulo), { x: M + 72, y: this.y - 20, size: 14, font: this.f.b, color: PDFLib.rgb(0.2, 0.2, 0.22) });
    if (sub) this.page.drawText(limpiar(sub), { x: M + 72, y: this.y - 36, size: 8.5, font: this.f.r, color: PDFLib.rgb(0.4, 0.4, 0.42) });
    this.y -= 62;
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: W - M, y: this.y }, thickness: 0.6, color: PDFLib.rgb(0.78, 0.73, 0.62) });
    this.y -= 10;
  };
  Lienzo.prototype.tabla = function (cols, filas, o) {
    o = o || {}; var size = 8.5, lh = 15, x;
    var self = this;
    function fila(cells, bold, fill) {
      self.espacio(lh + 2);
      if (fill) self.page.drawRectangle({ x: M, y: self.y - lh + 3, width: W - 2 * M, height: lh, color: PDFLib.rgb(0.93, 0.9, 0.84) });
      x = M + 4;
      cells.forEach(function (c, i) {
        var t = limpiar(c), f = bold ? self.f.b : self.f.r, cw = cols[i].w;
        while (t.length > 1 && f.widthOfTextAtSize(t, size) > cw - 6) t = t.slice(0, -1);
        var tx = cols[i].r ? x + cw - 6 - f.widthOfTextAtSize(t, size) : x;
        self.page.drawText(t, { x: tx, y: self.y - 9, size: size, font: f, color: PDFLib.rgb(0.13, 0.13, 0.14) });
        x += cw;
      });
      self.y -= lh;
    }
    fila(cols.map(function (c) { return c.t; }), true, true);
    filas.forEach(function (r) { fila(r.c, r.b, r.fill); });
    this.y -= 6;
  };
  async function base(logoBytes) {
    var doc = await PDFLib.PDFDocument.create();
    var f = { r: await doc.embedFont(PDFLib.StandardFonts.Helvetica), b: await doc.embedFont(PDFLib.StandardFonts.HelveticaBold) };
    var logo = null; try { if (logoBytes) logo = await doc.embedPng(logoBytes); } catch (e) {}
    doc.setCreator('Arsa Bodegas© · sistema de contratos'); doc.setProducer('Arsa Bodegas©'); doc.setAuthor('Víctor Hugo Ramírez Salgado');
    return { doc: doc, L: new Lienzo(doc, f, logo) };
  }
  function firmaBloque(L, rol, nombre, extra, png) {
    L.espacio(92);
    var y0 = L.y;
    if (png) { var d = png.scale(Math.min(180 / png.width, 52 / png.height)); L.page.drawImage(png, { x: M, y: y0 - 56, width: d.width, height: d.height }); }
    L.page.drawLine({ start: { x: M, y: y0 - 60 }, end: { x: M + 230, y: y0 - 60 }, thickness: 0.7, color: PDFLib.rgb(0.3, 0.3, 0.3) });
    L.page.drawText(limpiar(rol), { x: M, y: y0 - 72, size: 8.5, font: L.f.b });
    L.page.drawText(limpiar(nombre || ''), { x: M, y: y0 - 83, size: 8.5, font: L.f.r });
    var yy = L.y; L.y = y0 - 64;
    if (extra) L.parrafo('', extra, { size: 7.5, x: M + 250, w: W - 2 * M - 250, color: PDFLib.rgb(0.35, 0.35, 0.37), after: 0 });
    L.y = Math.min(L.y, y0 - 96);
  }
  /* d: datos del contrato · f: firma {png(Uint8Array), nombre, fechaISO, local, hash, ua, ids, aceptacion} */
  async function pdfContrato(d, logoBytes, f) {
    var o = await base(logoBytes), L = o.L;
    L.nueva();
    L.encabezado('Contrato de arrendamiento', 'Folio ' + (d.folio || '') + ' · Contenedor ' + (d.contenedor || '') + ' · ' + A.VERSION);
    A.contrato(d).forEach(function (b) {
      if (b.k === 't') L.parrafo('', b.x, { size: 12, bold: true, center: true, after: 2 });
      else if (b.k === 'n') L.parrafo('', b.x, { size: 8, center: true, color: PDFLib.rgb(0.4, 0.4, 0.42), after: 8 });
      else if (b.k === 'h') { L.y -= 4; L.parrafo('', b.x, { size: 10, bold: true, center: true, after: 6 }); }
      else L.parrafo(b.b || '', b.x, { size: 9 });
    });
    L.y -= 8;
    var png = null; if (f && f.png) { try { png = await o.doc.embedPng(f.png); } catch (e) {} }
    firmaBloque(L, '«EL ARRENDADOR»', (d.arr && d.arr.rep ? 'C. ' + d.arr.rep : '') , d.arr && d.arr.razon ? 'Administrador Único y Director de Proyectos, ' + d.arr.razon : '', null);
    var pa = A.partes(d);
    firmaBloque(L, '«EL ARRENDATARIO»' + (pa.conResp ? ' · RESPONSABLE DEL CONTRATO' : ''), pa.arrNombre, f ? 'Firmado electrónicamente el ' + f.local : (pa.conResp ? 'C.U.R.P./R.F.C.: ' : 'R.F.C.: ') + (pa.arrId || '________________'), png);
    firmaBloque(L, 'OBLIGADO SOLIDARIO Y AVAL', pa.avalFirma, pa.conResp && d.cli && d.cli.rfc ? 'R.F.C. ' + d.cli.rfc + (f ? ' · comparece y acepta por conducto del responsable' : '') : '', pa.conResp ? null : null);
    L.espacio(120);
    L.parrafo('', 'REGISTRO DE IDENTIFICACIONES OFICIALES Y COTEJO DOCUMENTAL', { size: 9.5, bold: true, after: 6 });
    var ids = (f && f.ids) || {};
    L.tabla([{ t: 'Parte contractual', w: 150 }, { t: 'Nombre completo', w: 190 }, { t: 'Identificación y número / R.F.C.', w: 172 }], [
      { c: ['El arrendador (rep. legal)', (d.arr && d.arr.rep) || '', (d.arr && d.arr.rfc) ? 'R.F.C. ' + d.arr.rfc : ''] },
      { c: ['El arrendatario', pa.arrNombre, ids.cliente || ''] },
      { c: ['Obligado solidario y aval', pa.conResp ? (d.cli && d.cli.nombre) || '' : 'El mismo arrendatario', pa.conResp ? 'R.F.C. ' + ((d.cli && d.cli.rfc) || '') : (ids.aval || '')] }
    ]);
    if (f) {
      L.nueva();
      L.encabezado('Constancia de firma electrónica', 'Folio ' + d.folio + ' · forma parte integral del contrato');
      var filas = [
        ['Firmante', f.nombre], ['Fecha y hora local', f.local], ['Fecha y hora UTC', f.fechaISO],
        ['Huella SHA-256 del texto', f.hash.slice(0, 32)], ['', f.hash.slice(32)],
        ['Huella de los datos', (f.hashDatos || '').slice(0, 32)], ['', (f.hashDatos || '').slice(32)],
        ['Dispositivo', (f.ua || '').slice(0, 90)], ['Versión de plantilla', A.VERSION]
      ];
      L.tabla([{ t: 'Dato', w: 150 }, { t: 'Valor', w: 362 }], filas.map(function (r) { return { c: r }; }));
      L.parrafo('Manifestación de voluntad: ', f.aceptacion || '', { size: 9 });
      L.parrafo('', 'La huella SHA-256 se calcula sobre el texto íntegro del contrato con los datos de las partes. Cualquier cambio en el texto produce una huella distinta, lo que permite comprobar que el documento no fue alterado después de la firma (Código de Comercio, arts. 89, 89 bis y 93).', { size: 8.5, color: PDFLib.rgb(0.35, 0.35, 0.37) });
      if (png) { L.espacio(70); var dd = png.scale(Math.min(220 / png.width, 60 / png.height)); L.page.drawImage(png, { x: M, y: L.y - 60, width: dd.width, height: dd.height }); L.y -= 70; }
      o.doc.setSubject('Contrato Arsa ' + d.folio + ' firmado');
      o.doc.setKeywords(['ARSAFIRMA', JSON.stringify({ v: 1, folio: d.folio, hash: f.hash, hashDatos: f.hashDatos, fechaISO: f.fechaISO, local: f.local, nombre: f.nombre, ua: f.ua, ids: ids, aceptacion: f.aceptacion, d: d })]);
    } else {
      o.doc.setSubject('Contrato Arsa ' + (d.folio || '') + ' (sin firma)');
    }
    if (f && f.csf) { try { await o.doc.attach(f.csf, 'Constancia-Situacion-Fiscal.pdf', { mimeType: 'application/pdf', description: 'Constancia de situación fiscal (confidencial)', creationDate: new Date(), modificationDate: new Date() }); } catch (e) {} }
    o.doc.setTitle('Contrato ' + (d.folio || '') + ' · Arsa Bodegas');
    return await o.doc.save();
  }
  /* r: recibo · cfg: arrendador */
  async function pdfRecibo(r, cfg, logoBytes) {
    var o = await base(logoBytes), L = o.L;
    L.nueva();
    L.encabezado('Recibo de pago ' + r.folio, 'Contrato ' + (r.contrato || 's/n') + ' · Fecha de pago ' + A.fechaLarga(r.fechaPago));
    L.tabla([{ t: 'Arrendador', w: 256 }, { t: 'Arrendatario', w: 256 }], [
      { c: [cfg.razon || '', r.cliente || ''] },
      { c: ['R.F.C. ' + (cfg.rfc || '________'), 'R.F.C. ' + (r.rfc || 'XAXX010101000')] },
      { c: [(cfg.dom || '').slice(0, 60), (r.regimen ? 'Régimen ' + r.regimen : '') + (r.cp ? ' · C.P. ' + r.cp : '')] },
      { c: ['', 'Contenedor ' + (r.contenedor || '') + (r.bodega ? ' · ' + r.bodega : '') + (r.responsable ? ' · Resp. ' + r.responsable : '')] }
    ]);
    var filas = (r.periodos || []).map(function (p) { return { c: ['Renta ' + p.etiqueta, p.desde + ' a ' + p.hasta, A.money(p.base), A.money(p.iva), A.money(p.total)] }; });
    if (r.mora > 0) filas.push({ c: ['Mora (5 % mensual, prorrateada)', '', A.money(r.mora), '', A.money(r.mora)] });
    if (r.descuento > 0) filas.push({ c: ['Descuento cliente distinguido', '', '-' + A.money(r.descuento), '', '-' + A.money(r.descuento)] });
    filas.push({ c: ['Total pagado', '', A.money(r.subtotal), A.money(r.iva), A.money(r.total)], b: true, fill: true });
    L.tabla([{ t: 'Concepto', w: 150 }, { t: 'Periodo', w: 132 }, { t: 'Importe', w: 76, r: 1 }, { t: 'IVA ' + (r.tasa || 0) + ' %', w: 70, r: 1 }, { t: 'Total', w: 84, r: 1 }], filas);
    L.parrafo('Son: ', A.letras(r.total), { size: 9 });
    L.parrafo('Método de pago: ', (r.metodo || '') + (r.referencia ? ' · Referencia ' + r.referencia : ''), { size: 9 });
    L.parrafo('Comprobante fiscal: ', r.facturar === 'si' ? ('CFDI a nombre del cliente' + (r.factura ? ' · Folio fiscal ' + r.factura : ' (en trámite)')) : 'Incluido en el CFDI global al público en general del periodo.', { size: 9 });
    if (r.nota) L.parrafo('Nota: ', r.nota, { size: 9 });
    L.y -= 6;
    L.parrafo('', 'Este recibo ampara el pago de la renta indicada. No es comprobante fiscal; el CFDI se emite conforme a la cláusula quinta del contrato.', { size: 8, color: PDFLib.rgb(0.4, 0.4, 0.42) });
    L.y -= 20;
    firmaBloque(L, 'Recibió', cfg.rep ? 'C. ' + cfg.rep : '', 'Director de Proyectos · ' + (cfg.razon || ''), null);
    o.doc.setTitle('Recibo ' + r.folio + ' · Arsa Bodegas');
    return await o.doc.save();
  }
  g.ArsaPDF = { pdfContrato: pdfContrato, pdfRecibo: pdfRecibo, limpiar: limpiar };
})(typeof window !== 'undefined' ? window : globalThis);
