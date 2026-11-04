/* Arsa Bodegas© — patio 3D de contenedores (motor propio en canvas, proyección ortográfica).
   Ubicación: Arsa mini bodegas, México 3 #5, El Sauzal, Ensenada, B.C. (31.9089, −116.6953).
   Autor y titular: Víctor Hugo Ramírez Salgado. Asistencia-IA. */
(function (g) {
  'use strict';
  var L = 6.06, W = 2.44, H = 2.59, GAP = 0.05, AISLE = 9;
  /* color físico del contenedor; el estado se ve en el punto del techo y en la etiqueta */
  var COL = { beige: ['#D9CBAE', '#C7B794', '#B5A47E'], azul: ['#4F7FB0', '#3F6C9A', '#335A82'] };
  var TAG = { disp: '#2F6B45', rentado: '#2C5C82', ocupado: '#A3322A', mant: '#6F6A60' };
  function Patio(canvas, opt) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.opt = opt || {};
    this.yaw = -1.38; this.pitch = 0.5; this.zoom = 1; this.items = []; this.sel = null; this.lugares = 21;
    this.logo = null; if (this.opt.logo) { var im = new Image(); var self = this; im.onload = function () { self.logo = im; self.draw(); }; im.src = this.opt.logo; }
    this._bind(); this.resize();
  }
  Patio.prototype.slotPos = function (n) {
    var porFila = Math.ceil(this.lugares / 2), fila = n <= porFila ? 0 : 1, k = fila === 0 ? n - 1 : n - 1 - porFila;
    var x = k * (W + GAP) - (porFila * (W + GAP)) / 2 + W / 2;
    var z = fila === 0 ? -(AISLE / 2 + L / 2) : (AISLE / 2 + L / 2);
    return { x: x, z: z, fila: fila };
  };
  Patio.prototype.set = function (items, lugares) { this.items = items || []; if (lugares) this.lugares = lugares; this.draw(); };
  Patio.prototype.select = function (num) { this.sel = num; this.draw(); };
  Patio.prototype.resize = function () {
    var r = this.cv.getBoundingClientRect(), k = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(200, r.width); this.h = Math.max(160, r.height);
    this.cv.width = Math.round(this.w * k); this.cv.height = Math.round(this.h * k); this.k = k; this.draw();
  };
  Patio.prototype.P = function (x, y, z) {
    var c = Math.cos(this.yaw), s = Math.sin(this.yaw), xr = x * c - z * s, zr = x * s + z * c;
    var sc = this.scale(), sp = Math.sin(this.pitch), cp = Math.cos(this.pitch);
    return { x: this.w / 2 + xr * sc, y: this.h * 0.5 + (zr * sp - y * cp) * sc, d: zr * cp + y * sp };
  };
  Patio.prototype.scale = function () { var largo = Math.ceil(this.lugares / 2) * (W + GAP) + 30, prof = AISLE + 2 * L + 20; var vx = Math.abs(Math.cos(this.yaw)) * largo + Math.abs(Math.sin(this.yaw)) * prof; var vy = (Math.abs(Math.sin(this.yaw)) * largo + Math.abs(Math.cos(this.yaw)) * prof) * Math.sin(this.pitch) + 8; return Math.min(this.w / vx, this.h / vy) * 1.1 * this.zoom; };
  function area(p) { var a = 0; for (var i = 0; i < p.length; i++) { var q = p[(i + 1) % p.length]; a += p[i].x * q.y - q.x * p[i].y; } return a / 2; }
  function poly(ctx, p, fill, stroke, lw) { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (var i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } }
  /* Dibuja algo en el plano de una cara (paralelogramo) con transformación afín: o = origen, u = eje "a lo largo", v = eje "hacia arriba" */
  Patio.prototype.enCara = function (o, u, v, fn) {
    var ctx = this.ctx; ctx.save();
    ctx.setTransform(this.k * (u.x - o.x), this.k * (u.y - o.y), this.k * (v.x - o.x), this.k * (v.y - o.y), this.k * o.x, this.k * o.y);
    fn(ctx); ctx.restore(); ctx.setTransform(this.k, 0, 0, this.k, 0, 0);
  };
  Patio.prototype.caja = function (it, pos) {
    var self = this, ctx = this.ctx, x0 = pos.x - W / 2, x1 = pos.x + W / 2, z0 = pos.z - L / 2, z1 = pos.z + L / 2, P = function (x, y, z) { return self.P(x, y, z); };
    var c = COL[it.color] || COL.beige, selec = this.sel === it.num;
    var y0 = pos.y0 || 0, yH = y0 + H;
    var v = { a: P(x0, y0, z0), b: P(x1, y0, z0), c: P(x1, y0, z1), d: P(x0, y0, z1), A: P(x0, yH, z0), B: P(x1, yH, z0), C: P(x1, yH, z1), D: P(x0, yH, z1) };
    var puertas = pos.fila === 0 ? 'z1' : pos.fila === 1 ? 'z0' : 'x0';
    var caras = [
      { p: [v.a, v.b, v.B, v.A], k: 'z0', t: 1 }, { p: [v.c, v.d, v.D, v.C], k: 'z1', t: 1 },
      { p: [v.d, v.a, v.A, v.D], k: 'x0', t: 2 }, { p: [v.b, v.c, v.C, v.B], k: 'x1', t: 2 },
      { p: [v.A, v.B, v.C, v.D], k: 'top', t: 0 }
    ];
    var hit = [];
    caras.forEach(function (f) {
      if (area(f.p) <= 0) return;
      poly(ctx, f.p, c[f.t], selec ? '#DB641C' : 'rgba(40,36,28,.55)', selec ? 2.2 : 0.8);
      hit.push(f.p);
      var o = f.p[0], u = f.p[1], w = f.p[3];
      if (f.k !== 'top' && u.x < o.x) { var o2 = u; u = o; w = { x: w.x + o2.x - u.x, y: w.y + o2.y - u.y }; o = o2; }
      if (f.k === 'x0' || f.k === 'x1') {
        /* costado largo: corrugado vertical, logo y número */
        self.enCara(o, u, w, function (cx) {
          cx.scale(0.01, 0.01);
          cx.strokeStyle = 'rgba(60,50,35,.28)'; cx.lineWidth = 0.5;
          for (var i = 1; i < 40; i++) { var t = i * 2.5; cx.beginPath(); cx.moveTo(t, 5); cx.lineTo(t, 95); cx.stroke(); }
          cx.scale(1, -1);
          if (self.logo && !it.sinLogo) { cx.save(); cx.translate(12, -82); cx.scale(0.3, 1); cx.drawImage(self.logo, 0, 0, 60, 56); cx.restore(); }
          cx.fillStyle = it.color === 'azul' ? 'rgba(240,244,250,.95)' : 'rgba(70,64,56,.92)'; cx.textBaseline = 'middle';
          if (!it.sinLogo) { cx.save(); cx.translate(36, -55); cx.scale(0.33, 1); cx.font = '24px Georgia, serif'; cx.fillText('ARSA', 0, 0); cx.restore(); }
          cx.save(); cx.translate(36, -28); cx.scale(0.3, 1); cx.font = '15px monospace'; cx.fillText(it.txt || it.num || '', 0, 0); cx.restore();
        });
      }
      if (f.k === 'top') {
        self.enCara(o, u, w, function (cx) {
          cx.scale(0.01, 0.01); cx.translate(50, 50);
          var et = it.bod ? 'B' + it.bod : String(it.lugar);
          cx.fillStyle = TAG[it.estado] || TAG.disp; cx.beginPath(); cx.arc(0, -26, 7, 0, 7); cx.fill();
          cx.fillStyle = it.color === 'azul' ? 'rgba(245,248,252,.95)' : 'rgba(38,36,30,.9)'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = 'bold 26px system-ui, sans-serif';
          cx.save(); cx.scale(1, 0.55); cx.fillText(et, 0, 14); cx.restore();
        });
      }
      if (f.k === puertas) {
        self.enCara(o, u, w, function (cx) {
          cx.scale(0.01, 0.01);
          cx.strokeStyle = 'rgba(45,38,28,.7)'; cx.lineWidth = 1.2;
          cx.beginPath(); cx.moveTo(50, 4); cx.lineTo(50, 96); cx.stroke();
          cx.lineWidth = 0.8; [17, 33, 67, 83].forEach(function (x) { cx.beginPath(); cx.moveTo(x, 6); cx.lineTo(x, 94); cx.stroke(); });
          cx.scale(1, -1); cx.fillStyle = it.color === 'azul' ? 'rgba(245,248,252,.95)' : 'rgba(40,36,30,.92)'; cx.font = 'bold 18px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
          cx.fillText(it.bod ? 'B' + it.bod : '', 50, -78);
        });
      }
    });
    if (it.abierto) {
      var zd = puertas === 'z1' ? z1 : z0, dir = puertas === 'z1' ? 1 : -1, hh = y0 + H * 0.94, ab = 1.0, yb = y0 + 0.05;
      var hueco = [P(x0 + 0.08, yb, zd), P(x1 - 0.08, yb, zd), P(x1 - 0.08, hh, zd), P(x0 + 0.08, hh, zd)];
      if (area(hueco) > 0 || area(hueco.slice().reverse()) > 0) poly(ctx, hueco, '#2B2620', null);
      [[x0, -0.02], [x1, 0.02]].forEach(function (h) {
        var hx = h[0] + h[1], hoja = [P(hx, yb, zd), P(hx, yb, zd + dir * ab), P(hx, hh, zd + dir * ab), P(hx, hh, zd)];
        poly(ctx, hoja, c[2], 'rgba(40,36,28,.7)', 0.9);
        var m1 = P(hx, yb + (hh - yb) * 0.15, zd + dir * ab * 0.5), m2 = P(hx, yb + (hh - yb) * 0.85, zd + dir * ab * 0.5); ctx.strokeStyle = 'rgba(40,36,28,.55)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y); ctx.stroke();
      });
      var tq = P((x0 + x1) / 2, y0, zd + dir * (ab + 0.5)); ctx.fillStyle = '#7A7262'; ctx.font = '600 8px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('1 m', tq.x, tq.y);
    }
    /* etiqueta flotante */
    var top = P(pos.x, yH + 1.1, pos.z), txt = it.titulo || ((it.bod ? 'B' + it.bod : 'Lugar ' + it.lugar) + ' · ' + (it.txt || it.num || ''));
    var box = this.etiqueta(top, txt, it.estado, selec, false);
    if (selec) this._selEt = [top, txt, it.estado];
    hit.push(box);
    return hit;
  };
  Patio.prototype.etiqueta = function (top, txt, estado, selec, pintar) {
    var ctx = this.ctx; ctx.font = (selec ? '700 ' : '600 ') + '10px system-ui, sans-serif'; var tw = ctx.measureText(txt).width + 18;
    top = { x: Math.max(tw / 2 + 4, Math.min(this.w - tw / 2 - 4, top.x)), y: top.y };
    var box = [{ x: top.x - tw / 2, y: top.y - 11 }, { x: top.x + tw / 2, y: top.y - 11 }, { x: top.x + tw / 2, y: top.y + 9 }, { x: top.x - tw / 2, y: top.y + 9 }];
    if (!pintar) return box;
    ctx.fillStyle = selec ? '#DB641C' : 'rgba(255,253,248,.94)'; ctx.strokeStyle = 'rgba(40,36,28,.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(top.x - tw / 2, top.y - 11, tw, 20, 10); else ctx.rect(top.x - tw / 2, top.y - 11, tw, 20); ctx.fill(); ctx.stroke();
    ctx.fillStyle = TAG[estado] || TAG.disp; ctx.beginPath(); ctx.arc(top.x - tw / 2 + 8, top.y - 1, 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = selec ? '#fff' : '#26272A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, top.x + 4, top.y - 1);
    return box;
  };
  Patio.prototype.vacio = function (n, pos) {
    var self = this, ctx = this.ctx, x0 = pos.x - W / 2, x1 = pos.x + W / 2, z0 = pos.z - L / 2, z1 = pos.z + L / 2;
    var p = [self.P(x0, 0, z0), self.P(x1, 0, z0), self.P(x1, 0, z1), self.P(x0, 0, z1)];
    ctx.save(); ctx.setLineDash([4, 4]); poly(ctx, p, pos.fila === 1 ? 'rgba(63,108,154,.14)' : 'rgba(120,110,90,.10)', pos.fila === 1 ? 'rgba(63,108,154,.7)' : 'rgba(110,100,80,.6)', 1); ctx.restore();
    var c = self.P(pos.x, 0.05, pos.z); ctx.fillStyle = 'rgba(90,82,69,.85)'; ctx.font = '600 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), c.x, c.y);
  };
  Patio.prototype.bloque = function (x0, x1, y0, y1, z0, z1, c, stroke) {
    var P = this.P.bind(this), ctx = this.ctx;
    var v = { a: P(x0, y0, z0), b: P(x1, y0, z0), c: P(x1, y0, z1), d: P(x0, y0, z1), A: P(x0, y1, z0), B: P(x1, y1, z0), C: P(x1, y1, z1), D: P(x0, y1, z1) };
    var caras = [{ p: [v.a, v.b, v.B, v.A], t: 1, k: 'z0' }, { p: [v.c, v.d, v.D, v.C], t: 1, k: 'z1' }, { p: [v.d, v.a, v.A, v.D], t: 2, k: 'x0' }, { p: [v.b, v.c, v.C, v.B], t: 2, k: 'x1' }, { p: [v.A, v.B, v.C, v.D], t: 0, k: 'top' }];
    var vis = [];
    caras.forEach(function (f) { if (area(f.p) <= 0) return; poly(ctx, f.p, c[f.t], stroke || 'rgba(40,36,28,.5)', 0.8); vis.push(f); });
    return vis;
  };
  Patio.prototype.oficina = function (x0, x1, y0, y1, z0, z1) {
    var self = this, vis = this.bloque(x0, x1, y0, y1, z0, z1, COL.beige, 'rgba(40,36,28,.6)');
    vis.forEach(function (f) {
      if (f.k === 'top') return;
      var o = f.p[0], u = f.p[1], w = f.p[3];
      if (u.x < o.x) { var o2 = u; u = o; w = { x: w.x + o2.x - u.x, y: w.y + o2.y - u.y }; o = o2; }
      self.enCara(o, u, w, function (cx) {
        cx.scale(0.01, 0.01);
        var largo = f.k === 'z0' || f.k === 'z1';
        cx.strokeStyle = 'rgba(60,50,35,.28)'; cx.lineWidth = 0.4; for (var j = 1; j < (largo ? 80 : 16); j++) { var t = j * 100 / (largo ? 80 : 16); cx.beginPath(); cx.moveTo(t, 5); cx.lineTo(t, 95); cx.stroke(); }
        cx.fillStyle = 'rgba(80,120,160,.55)'; cx.strokeStyle = 'rgba(60,60,60,.6)'; cx.lineWidth = 0.6;
        var vent = largo ? [18, 68] : [38]; vent.forEach(function (wx) { cx.fillRect(wx, 42, 14, 32); cx.strokeRect(wx, 42, 14, 32); });
        if (largo) { cx.scale(1, -1); cx.fillStyle = 'rgba(50,50,50,.9)'; cx.font = 'bold 20px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.save(); cx.scale(0.45, 1); cx.fillText('OFICINA', 50 / 0.45, -20); cx.restore(); }
      });
    });
  };
  /* rabón de reversa: caja seca blanca con puertas traseras abiertas hacia afuera, al ras de la línea del negocio */
  Patio.prototype.coche = function (xr, zc) {
    var ctx = this.ctx, self = this, Wc = 2.45, z0 = zc - Wc / 2, z1 = zc + Wc / 2;
    var cajaL = 6.4, cabL = 2.3, gap = 0.25, xb1 = xr, xb0 = xr - cajaL, xc1 = xb0 - gap, xc0 = xc1 - cabL;
    var blanco = ['#FAFAF8', '#E6E7E8', '#CDD0D4'], chasis = ['#3A3B3E', '#2E2F31', '#242527'];
    [[xc0 + 0.9, z0], [xc0 + 0.9, z1], [xb1 - 1.6, z0], [xb1 - 1.6, z1], [xb1 - 2.7, z0], [xb1 - 2.7, z1]].forEach(function (r) { self.bloque(r[0] - 0.48, r[0] + 0.48, 0, 0.96, r[1] - 0.15, r[1] + 0.15, ['#1B1B1C', '#151516', '#101011']); });
    this.bloque(xc0 + 0.2, xb1, 0.45, 0.95, z0 + 0.25, z1 - 0.25, chasis, 'rgba(0,0,0,.6)');
    this.bloque(xc0, xc1, 0.9, 3.0, z0 + 0.05, z1 - 0.05, blanco, 'rgba(60,64,70,.7)');
    var p = [this.P(xc0 - 0.01, 2.0, z0 + 0.25), this.P(xc0 - 0.01, 2.0, z1 - 0.25), this.P(xc0 - 0.01, 2.75, z1 - 0.25), this.P(xc0 - 0.01, 2.75, z0 + 0.25)];
    poly(ctx, p, '#7C93AA', 'rgba(40,44,52,.7)', 0.8);
    this.bloque(xb0, xb1, 1.05, 3.65, z0, z1, blanco, 'rgba(60,64,70,.7)');
    var hh = 3.55, hb = 1.15;
    [[z0, -1], [z1, 1]].forEach(function (d) {
      var q = [self.P(xb1, hb, d[0]), self.P(xb1 + 0.04, hb, d[0] + d[1] * 1.2), self.P(xb1 + 0.04, hh, d[0] + d[1] * 1.2), self.P(xb1, hh, d[0])];
      poly(ctx, q, blanco[1], 'rgba(60,64,70,.8)', 0.9);
    });
    var hueco = [this.P(xb1, hb, z0 + 0.05), this.P(xb1, hb, z1 - 0.05), this.P(xb1, hh, z1 - 0.05), this.P(xb1, hh, z0 + 0.05)];
    poly(ctx, hueco, '#4A4C50', null);
  };
  /* cliente con una caja en mano frente a su bodega */
  Patio.prototype.persona = function (x, z) {
    var self = this, ctx = this.ctx, piel = ['#C99A74', '#B5865F', '#A0724D'];
    this.bloque(x - 0.12, x - 0.02, 0, 0.85, z - 0.08, z + 0.08, ['#2F3B52', '#26304A', '#1E2740']);
    this.bloque(x + 0.02, x + 0.12, 0, 0.85, z - 0.08, z + 0.08, ['#2F3B52', '#26304A', '#1E2740']);
    this.bloque(x - 0.18, x + 0.18, 0.85, 1.45, z - 0.11, z + 0.11, ['#3E7D5A', '#336A4B', '#2A583E']);
    this.bloque(x - 0.25, x + 0.25, 1.0, 1.32, z - 0.42, z - 0.1, ['#C8A06A', '#B48C58', '#9E7846'], 'rgba(80,60,30,.8)');
    var h = this.P(x, 1.62, z), r = Math.max(3, this.scale() * 0.12); ctx.fillStyle = piel[0]; ctx.strokeStyle = 'rgba(60,40,25,.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(h.x, h.y, r, 0, 7); ctx.fill(); ctx.stroke();
  };
  /* auto del cliente estacionado en el pasillo */
  Patio.prototype.carro = function (xc, zc) {
    var Lc = 4.5, Wc = 1.8, x0 = xc - Lc / 2, x1 = xc + Lc / 2, z0 = zc - Wc / 2, z1 = zc + Wc / 2, self = this, ctx = this.ctx;
    [[x0 + 0.8, z0], [x0 + 0.8, z1], [x1 - 0.8, z0], [x1 - 0.8, z1]].forEach(function (r) { self.bloque(r[0] - 0.33, r[0] + 0.33, 0, 0.6, r[1] - 0.12, r[1] + 0.12, ['#1B1B1C', '#151516', '#101011']); });
    this.bloque(x0, x1, 0.3, 0.9, z0, z1, ['#B23A32', '#9A322B', '#842A24'], 'rgba(40,20,20,.7)');
    this.bloque(x0 + 1.1, x1 - 1.0, 0.9, 1.42, z0 + 0.12, z1 - 0.12, ['#9FB4C8', '#8AA0B6', '#7890A6'], 'rgba(40,44,52,.7)');
  };
  /* texto pintado en el piso, a lo ancho del acceso */
  Patio.prototype.piso = function (x, za, zb, prof, txt) {
    var o = this.P(x, 0.02, za), u = this.P(x, 0.02, zb), w = this.P(x + prof, 0.02, za);
    this.enCara(o, u, w, function (cx) {
      cx.scale(0.01, 0.01); cx.scale(1, -1);
      cx.fillStyle = 'rgba(255,255,255,.92)'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = 'bold 46px system-ui, sans-serif';
      cx.save(); cx.translate(50, -50); cx.scale(0.42, 1); cx.fillText(txt, 0, 0); cx.restore();
    });
  };
  Patio.prototype.mallaX = function (z, xa, xb) {
    var ctx = this.ctx, hM = 2;
    poly(ctx, [this.P(xa, 0, z), this.P(xb, 0, z), this.P(xb, hM, z), this.P(xa, hM, z)], 'rgba(255,255,255,.18)', 'rgba(255,255,255,.95)', 1.2);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,1)'; ctx.lineWidth = 1.4;
    for (var x = xa; x <= xb + 0.01; x += 3) { var p0 = this.P(x, 0, z), p1 = this.P(x, hM, z); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); }
    ctx.restore();
  };
  Patio.prototype.malla = function (x, za, zb) {
    var ctx = this.ctx, hM = 2;
    var q = [this.P(x, 0, za), this.P(x, 0, zb), this.P(x, hM, zb), this.P(x, hM, za)];
    poly(ctx, q, 'rgba(255,255,255,.22)', 'rgba(255,255,255,.95)', 1.2);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.6;
    for (var z = za; z <= zb + 0.01; z += 0.8) { var a = this.P(x, 0, z), b = this.P(x, hM, Math.min(zb, z + 0.8)); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); var c = this.P(x, hM, z), d = this.P(x, 0, Math.min(zb, z + 0.8)); ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,1)'; ctx.lineWidth = 1.6;
    for (var z2 = za; z2 <= zb + 0.01; z2 += 3) { var p0 = this.P(x, 0, z2), p1 = this.P(x, hM, z2); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); }
    ctx.restore();
  };
  Patio.prototype.draw = function () {
    var ctx = this.ctx, self = this; if (!this.w) return;
    ctx.setTransform(this.k, 0, 0, this.k, 0, 0);
    var oscuro = this.opt.oscuro && this.opt.oscuro();
    var cielo = ctx.createLinearGradient(0, 0, 0, this.h);
    cielo.addColorStop(0, oscuro ? '#1C2430' : '#DCE7EE'); cielo.addColorStop(1, oscuro ? '#15140F' : '#F4EFE5');
    ctx.fillStyle = cielo; ctx.fillRect(0, 0, this.w, this.h);
    var porFila = Math.ceil(this.lugares / 2), fila0 = -(porFila * (W + GAP)) / 2;
    var oeste = fila0 - 3, este = -fila0, ANDEN = 3.4, AH = 1.0, fondo = este + ANDEN, prof = AISLE / 2 + L, zS = AISLE / 2 + L;
    /* terreno de grava */
    poly(ctx, [this.P(oeste, 0, -prof), this.P(fondo, 0, -prof), this.P(fondo, 0, zS), this.P(oeste, 0, zS)], oscuro ? '#2E2A22' : '#E3D9C6', 'rgba(110,100,80,.55)', 1.4);
    /* carretera federal 3 del lado oeste (izquierdo) */
    var rx0 = oeste - 17, rx1 = oeste - 7.5, rz = prof + 40;
    poly(ctx, [this.P(rx0, 0, -rz), this.P(rx1, 0, -rz), this.P(rx1, 0, rz), this.P(rx0, 0, rz)], oscuro ? '#2A2A2C' : '#5E5E62', null);
    ctx.save(); ctx.setLineDash([10, 10]); ctx.strokeStyle = '#E9D27A'; ctx.lineWidth = 1.5; var a = this.P((rx0 + rx1) / 2, 0, -rz), b = this.P((rx0 + rx1) / 2, 0, rz); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
    ctx.fillStyle = oscuro ? '#CFC6B4' : '#3F3B34'; ctx.font = '600 11px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(this.w < 420 ? 'Carr. Federal 3 · Tecate–Ensenada' : 'Carretera Federal 3 · Tecate–Ensenada', 10, 16);
    ctx.font = '400 ' + (this.w < 420 ? 10 : 13) + 'px Georgia, serif'; ctx.textAlign = 'right'; ctx.fillStyle = oscuro ? '#E6DCC6' : '#5C5245'; ctx.fillText('ARSA BODEGAS · MATRIZ', this.w - 10, 16); ctx.textAlign = 'left';
    /* pasillo de 5 m desde el acceso */
    var acc = 2.5;
    poly(ctx, [this.P(oeste, 0, -acc), this.P(este, 0, -acc), this.P(este, 0, acc), this.P(oeste, 0, acc)], oscuro ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.35)', null);
    var pa = this.P(0, 0, 0); ctx.fillStyle = oscuro ? '#A9A08F' : '#7A7262'; ctx.font = '500 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('pasillo', pa.x, pa.y);
    /* estacionamiento afuera de la malla: 5 cajones junto al acceso, sin invadir los 5 m */
    poly(ctx, [this.P(oeste - 7.5, 0, -prof), this.P(oeste, 0, -prof), this.P(oeste, 0, zS), this.P(oeste - 7.5, 0, zS)], oscuro ? '#2B2924' : '#D3CBBB', null);
    /* 6 cajones en batería inclinada: 3 al norte y 3 al sur del acceso */
    var cx0 = oeste - 6.5, cw = 2.6, cl = 5, sesgo = 0, numC = 0;
    [-1, 1].forEach(function (lado) {
      for (var e = 0; e < 3; e++) {
        var zA = lado > 0 ? acc + 0.6 + e * cw : -acc - 0.6 - (e + 1) * cw, zB = zA + cw, sk = -sesgo * lado;
        var q = [self.P(cx0, 0, zA + sk), self.P(cx0 + cl, 0, zA), self.P(cx0 + cl, 0, zB), self.P(cx0, 0, zB + sk)];
        poly(ctx, q, oscuro ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.28)', oscuro ? '#CFC6B4' : '#FFFFFF', 1.4);
        numC++; var pc = self.P(cx0 + cl / 2, 0, (zA + zB) / 2 + sk / 2); ctx.fillStyle = oscuro ? '#CFC6B4' : '#5E5E62'; ctx.font = '700 9px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('P' + numC, pc.x, pc.y);
      }
    });
    /* malla blanca trasera y del fondo, al ras de las filas (se dibuja antes que los contenedores) */
    this.mallaX(-prof, oeste, fondo); this.malla(fondo, -prof, zS); this.mallaX(zS, oeste, fondo);
    /* andén trasero: plataforma de 1 m con un contenedor beige y uno azul arriba; escalera al centro, frente al pasillo */
    this.bloque(este + 0.1, fondo, 0, AH, -prof, zS, oscuro ? ['#5B5750', '#4C4943', '#3F3C37'] : ['#CFCAC0', '#BDB8AE', '#A9A49A'], 'rgba(60,56,48,.6)');
    var anA = { x: este + 0.25 + W / 2, z: -(AISLE / 2 + L / 2), fila: 0, y0: AH }, anB = { x: este + 0.25 + W / 2, z: AISLE / 2 + L / 2, fila: 1, y0: AH };
    this.hits = this.hits || [];
    this.caja({ num: 'ANDEN-A', titulo: 'Andén · beige', color: 'beige', estado: 'disp', bod: '', lugar: 'A1', sinLogo: true }, anA);
    this.caja({ num: 'ANDEN-B', titulo: 'Andén · azul', color: 'azul', estado: 'disp', bod: '', lugar: 'A2', sinLogo: true, abierto: true }, anB);
    var ep = 6, eh = AH / ep, ef = 0.3;
    for (var es = ep - 1; es >= 0; es--) this.bloque(este - (es + 1) * ef, este - es * ef + 0.1, 0, AH - es * eh, -1, 1, ['#B9BCC0', '#A4A7AB', '#8E9195']);
    /* objetos con profundidad: contenedores, lugares vacíos, oficina y escalera */
    var porLugar = {}; this.items.forEach(function (it) { if (it.lugar) porLugar[it.lugar] = it; });
    var objs = [];
    for (var n = 1; n <= this.lugares; n++) { (function (n) { var pos = self.slotPos(n), it = porLugar[n]; objs.push({ d: self.P(pos.x, it ? H / 2 : 0, pos.z).d, f: function () { if (it) { var h = self.caja(it, pos); self.hits.push({ num: it.num, polys: h }); } else self.vacio(n, pos); } }); })(n); }
    /* oficina: contenedor beige de 40' (12.19 m × 2.5 m) sobre los beige 1 a 5; arranca 1 m adentro del 1 hacia el 2 y va pegada a la orilla trasera de la fila */
    var p1 = this.slotPos(1), OL = 12.19, OW = 2.5, oz0 = p1.z - L / 2, oz1 = oz0 + OW, ox0 = p1.x - W / 2 + 1.0, ox1 = ox0 + OL;
    var dOf = -1e9; for (var m = 1; m <= Math.min(5, porFila); m++) { var pp = this.slotPos(m); dOf = Math.max(dOf, this.P(pp.x, H / 2, pp.z).d); }
    objs.push({ d: dOf + 0.01, f: function () { self.oficina(ox0, ox1, H, H + 2.59, oz0, oz1); } });
    /* escalera de 1 m junto al beige 1, del lado oeste */
    var ex1 = p1.x - W / 2 - 0.15, ex0 = ex1 - 1.0, pasos = 10, alto = H / pasos, fondo = L / pasos, sz1 = p1.z + L / 2;
    for (var k = 0; k < pasos; k++) { (function (k) { var za = sz1 - (k + 1) * fondo, zb = sz1 - k * fondo; objs.push({ d: self.P((ex0 + ex1) / 2, (k + 1) * alto / 2, (za + zb) / 2).d + 0.02, f: function () { self.bloque(ex0, ex1, 0, (k + 1) * alto, za, zb, ['#B9BCC0', '#A4A7AB', '#8E9195']); } }); })(k); }
    objs.sort(function (p, q) { return p.d - q.d; });
    this.hits = []; this._selEt = null;
    objs.forEach(function (o) { o.f(); });
    /* escena: cliente con caja y su auto frente a la bodega marcada */
    this.items.forEach(function (it) {
      if (!it.persona || !it.lugar) return; var ps = self.slotPos(it.lugar), lado = ps.fila === 0 ? 1 : -1, zp = ps.z + lado * (L / 2 + 1.5);
      /* cliente entrando/saliendo de su bodega con una caja */
      self.persona(ps.x - 0.1, ps.z + lado * (L / 2 + 0.45));
    });
    /* malla blanca al frente de la carretera, con el acceso de 5 m */
    this.malla(oeste, -prof, -acc); this.malla(oeste, acc, zS);
    /* letrero ARSA en la malla del lado azul, junto al acceso */
    var l0 = this.P(oeste, 2.1, acc + 1), l1 = this.P(oeste, 2.1, acc + 5), l2 = this.P(oeste, 3.3, acc + 5), l3 = this.P(oeste, 3.3, acc + 1);
    poly(ctx, [l0, l1, l2, l3], '#FFFDF8', '#5C5245', 1.2);
    var lc = this.P(oeste, 2.7, acc + 3); ctx.fillStyle = '#5C5245'; ctx.font = '700 10px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ARSA', lc.x, lc.y);
    var s0 = this.P(oeste, 0, acc + 1.2), s1 = this.P(oeste, 2.1, acc + 1.2), s2 = this.P(oeste, 0, acc + 4.8), s3 = this.P(oeste, 2.1, acc + 4.8); ctx.strokeStyle = '#5C5245'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.moveTo(s2.x, s2.y); ctx.lineTo(s3.x, s3.y); ctx.stroke();
    /* señal tipo bandera de 3.7 m con luz LED, dentro del polígono frente a la oficina */
    var bz = -(AISLE / 2 + L / 2) - 1.2, bx = oeste + 0.9;
    this.bloque(bx - 0.08, bx + 0.08, 0, 3.7, bz - 0.08, bz + 0.08, ['#6E6F72', '#5A5B5E', '#48494C']);
    var f0 = this.P(bx, 2.55, bz - 1.6), f1 = this.P(bx, 2.55, bz + 1.6), f2 = this.P(bx, 3.6, bz + 1.6), f3 = this.P(bx, 3.6, bz - 1.6);
    ctx.save(); ctx.shadowColor = 'rgba(255,214,120,.9)'; ctx.shadowBlur = 14; poly(ctx, [f0, f1, f2, f3], '#1F1D1A', '#F2C14E', 1.4); ctx.restore();
    var fc = this.P(bx, 3.07, bz); ctx.save(); ctx.shadowColor = 'rgba(255,220,140,1)'; ctx.shadowBlur = 8; ctx.fillStyle = '#FFE7A8'; ctx.font = '700 9px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ARSA BODEGAS', fc.x, fc.y); ctx.restore();
    var ft = this.P(bx, 3.95, bz); ctx.fillStyle = oscuro ? '#CFC6B4' : '#5E5E62'; ctx.font = '600 8px system-ui, sans-serif'; ctx.fillText('3.7 m · LED', ft.x, ft.y);
    var g0 = this.P(oeste, 0, -acc), g1 = this.P(oeste, 0, acc); ctx.strokeStyle = '#DB641C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y); ctx.stroke();
    this.piso(oeste + 2.5, -acc + 0.2, acc - 0.2, 2.2, 'ENTRADA / SALIDA');
    /* auto del cliente entrando al cajón P3, lejos del rabón */
    if (this.items.some(function (it) { return it.persona; })) this.carro(oeste - 6.5 + 2.4, -acc - 0.6 - 2.5 * 2.6);
    /* rabón de reversa en el acceso, al ras de la línea del negocio */
    this.coche(oeste, 0);
    if (this._selEt) this.etiqueta(this._selEt[0], this._selEt[1], this._selEt[2], true, true);
    ctx.fillStyle = oscuro ? '#A9A08F' : '#6F6A60'; ctx.font = '500 10px system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(this.w < 420 ? 'Matriz Ensenada · El Sauzal · México 3 #5' : 'Arsa mini bodegas · Matriz Ensenada · El Sauzal · México 3 #5 · 31.9089, −116.6953', 10, this.h - 10);
  };
  function dentro(pt, p) { var c = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { if (((p[i].y > pt.y) !== (p[j].y > pt.y)) && (pt.x < (p[j].x - p[i].x) * (pt.y - p[i].y) / (p[j].y - p[i].y) + p[i].x)) c = !c; } return c; }
  Patio.prototype._bind = function () {
    var self = this, cv = this.cv, ptrs = {}, inicio = null, mov = 0, dist0 = 0, zoom0 = 1;
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', function (e) { ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); inicio = { x: e.clientX, y: e.clientY, yaw: self.yaw, pitch: self.pitch }; mov = 0; var ks = Object.keys(ptrs); if (ks.length === 2) { var a = ptrs[ks[0]], b = ptrs[ks[1]]; dist0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = self.zoom; } });
    cv.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return; ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; var ks = Object.keys(ptrs);
      if (ks.length === 2) { var a = ptrs[ks[0]], b = ptrs[ks[1]]; self.zoom = Math.max(0.6, Math.min(3, zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / (dist0 || 1))); mov = 99; self.draw(); return; }
      var dx = e.clientX - inicio.x, dy = e.clientY - inicio.y; mov = Math.max(mov, Math.abs(dx) + Math.abs(dy));
      if (mov > 6) { self.yaw = inicio.yaw + dx * 0.008; self.pitch = Math.max(0.35, Math.min(1.45, inicio.pitch + dy * 0.006)); self.draw(); }
    });
    function fin(e) {
      if (!ptrs[e.pointerId]) return; delete ptrs[e.pointerId];
      if (mov <= 6 && e.type === 'pointerup') { var r = cv.getBoundingClientRect(), pt = { x: e.clientX - r.left, y: e.clientY - r.top }, hit = null;
        (self.hits || []).forEach(function (h) { h.polys.forEach(function (p) { if (dentro(pt, p)) hit = h.num; }); });
        if (hit) { self.sel = hit; self.draw(); if (self.opt.onSelect) self.opt.onSelect(hit); } }
    }
    cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); self.zoom = Math.max(0.6, Math.min(3, self.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); self.draw(); }, { passive: false });
    if (window.ResizeObserver) new ResizeObserver(function () { self.resize(); }).observe(cv); else window.addEventListener('resize', function () { self.resize(); });
  };
  Patio.prototype.vista = function (k) {
    if (k === 'izq') this.yaw -= Math.PI / 8; else if (k === 'der') this.yaw += Math.PI / 8;
    else if (k === 'arriba') { this.pitch = 1.45; this.yaw = 0; } else { this.yaw = -1.38; this.pitch = 0.5; this.zoom = 1; }
    this.draw();
  };
  g.ArsaPatio = Patio;
})(typeof window !== 'undefined' ? window : globalThis);
