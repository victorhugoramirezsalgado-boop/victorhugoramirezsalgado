/* © 2026 Víctor Hugo Ramírez Salgado — visor de documentos y de páginas del sitio. Asistencia-IA.
   · Los PDF se ven dentro de la página, sin guardarlos: Guardar, Compartir, Correo, WhatsApp e Imprimir.
   · Las páginas de los proyectos se abren encima de la portada: al regresar, la portada queda donde estaba
     y la música sigue sonando (no se recarga nada).
   · El botón «atrás» del teléfono también cierra el visor. */
(function(){
if(window.VHRS_visor)return;
const PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/';
const css=document.createElement('style');
css.textContent=`.vz{position:fixed;inset:0;z-index:35;background:#F3EDE2;display:flex;flex-direction:column;font:500 14px Inter,system-ui,-apple-system,sans-serif;color:#2B2620}
.vz[hidden]{display:none}
.vz-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 10px;background:#2C3A32;color:#EADBB8;box-shadow:0 2px 8px rgba(0,0,0,.18)}
.vz-bar .t{flex:1 1 160px;min-width:0;font:600 15px Georgia,serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vz-bar button,.vz-bar a{appearance:none;border:1px solid #C9A55A;background:transparent;color:#EADBB8;border-radius:999px;padding:7px 12px;font:600 13px Inter,system-ui,sans-serif;text-decoration:none;cursor:pointer;white-space:nowrap}
.vz-bar .reg{background:#C9A55A;color:#2C3A32;border-color:#C9A55A}
.vz-bar .acc{display:flex;gap:6px;flex-wrap:wrap}
.vz-cuerpo{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 8px 70px;text-align:center}
.vz-cuerpo canvas{display:block;margin:0 auto 12px;max-width:100%;height:auto!important;background:#fff;box-shadow:0 2px 10px rgba(44,58,50,.18)}
.vz-cuerpo iframe{width:100%;height:100%;border:0;background:#fff}
.vz.pag .vz-cuerpo{padding:0;overflow:hidden}
.vz-msg{padding:30px 10px;color:#6E6457}
@media (max-width:620px){.vz-bar .acc{width:100%;justify-content:space-between}.vz-bar button,.vz-bar a{padding:7px 9px;font-size:12px}}
@media print{body.vz-abierto>*:not(.vz){display:none!important}.vz-bar{display:none}.vz{position:static}.vz-cuerpo{overflow:visible;padding:0}.vz-cuerpo canvas{box-shadow:none;page-break-after:always;margin:0 auto}}`;
document.head.appendChild(css);
const vz=document.createElement('div');vz.className='vz';vz.hidden=true;vz.setAttribute('role','dialog');vz.setAttribute('aria-modal','true');
vz.innerHTML='<div class="vz-bar"><button class="reg" data-a="cerrar">‹ Regresar</button><span class="t"></span><div class="acc"></div></div><div class="vz-cuerpo"></div>';
document.body.appendChild(vz);
const tit=vz.querySelector('.t'),acc=vz.querySelector('.acc'),cuerpo=vz.querySelector('.vz-cuerpo');
let y=0,abierto=false,actual=null,blob=null;
const abs=u=>new URL(u,location.href).href;
const nombre=u=>decodeURIComponent(abs(u).split('/').pop().split('?')[0]);
function mostrar(){if(!abierto){y=window.scrollY;abierto=true;try{history.pushState({vz:1},'',location.href.split('#')[0]+'#ver')}catch(e){}}vz.hidden=false;document.body.classList.add('vz-abierto');document.documentElement.style.overflow='hidden'}
function cerrar(desdeHist){if(!abierto)return;abierto=false;vz.hidden=true;cuerpo.innerHTML='';blob=null;document.body.classList.remove('vz-abierto');document.documentElement.style.overflow='';window.scrollTo(0,y);if(!desdeHist)try{history.back()}catch(e){}}
window.addEventListener('popstate',()=>cerrar(true));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&abierto)cerrar()});
vz.querySelector('[data-a="cerrar"]').onclick=()=>cerrar();

async function compartir(u,t){
 try{
  if(blob&&navigator.canShare){const f=new File([blob],nombre(u),{type:'application/pdf'});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:t});return}}
  if(navigator.share){await navigator.share({title:t,url:abs(u)});return}
 }catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(abs(u));alertita('Liga copiada')}catch(e){}
}
function alertita(m){const s=document.createElement('div');s.textContent=m;s.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#2C3A32;color:#EADBB8;padding:8px 14px;border-radius:999px;z-index:60;font:600 13px Inter,sans-serif';document.body.appendChild(s);setTimeout(()=>s.remove(),1800)}
function imprimir(u){
 const ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 if(ios||!blob){window.open(abs(u),'_blank','noopener');return}
 const f=document.createElement('iframe');f.style.cssText='position:fixed;width:0;height:0;border:0;right:0;bottom:0';f.src=URL.createObjectURL(blob);
 f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){window.open(abs(u),'_blank','noopener')}setTimeout(()=>f.remove(),60000)};document.body.appendChild(f);
}
function barraPDF(u,t){
 const L=abs(u),txt=`${t} · documento de Víctor Hugo Ramírez Salgado: ${L}`;
 acc.innerHTML='';
 const b=(lab,fn,ti)=>{const x=document.createElement('button');x.textContent=lab;x.title=ti||lab;x.onclick=fn;acc.appendChild(x)};
 const a=document.createElement('a');a.href=L;a.download=nombre(u);a.textContent='⬇ Guardar';a.title='Guardar en el dispositivo';acc.appendChild(a);
 b('↗ Compartir',()=>compartir(u,t),'Compartir el PDF (WhatsApp, correo, AirDrop…)');
 b('✉ Correo',()=>{location.href='mailto:?subject='+encodeURIComponent(t)+'&body='+encodeURIComponent(txt)},'Enviar por correo electrónico');
 b('WhatsApp',()=>window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank','noopener'),'Enviar por WhatsApp');
 b('🖨 Imprimir',()=>imprimir(u),'Imprimir');
}
let pdfjs=null;
async function cargaPdfjs(){if(pdfjs)return pdfjs;pdfjs=await import(PDFJS+'pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.mjs';return pdfjs}
async function abrirPDF(u,t){
 t=t||nombre(u).replace(/\.pdf$/i,'').replace(/[-_]/g,' ');actual=u;
 vz.classList.remove('pag');tit.textContent=t;barraPDF(u,t);cuerpo.innerHTML='<p class="vz-msg">Abriendo documento…</p>';mostrar();
 try{
  const r=await fetch(u);if(!r.ok)throw 0;blob=await r.blob();if(actual!==u)return;
  const lib=await cargaPdfjs();const doc=await lib.getDocument({data:await blob.arrayBuffer()}).promise;if(actual!==u)return;
  cuerpo.innerHTML='';const ancho=Math.min(cuerpo.clientWidth-16,980),dpr=Math.min(window.devicePixelRatio||1,2);
  for(let i=1;i<=doc.numPages;i++){
   if(actual!==u||!abierto)return;
   const p=await doc.getPage(i),v0=p.getViewport({scale:1}),esc=ancho/v0.width,v=p.getViewport({scale:esc*dpr});
   const c=document.createElement('canvas');c.width=v.width;c.height=v.height;c.style.width=(v.width/dpr)+'px';c.setAttribute('aria-label','Página '+i);cuerpo.appendChild(c);
   await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;
  }
 }catch(e){if(actual!==u)return;cuerpo.innerHTML='';const f=document.createElement('iframe');f.src=u;f.title=t;cuerpo.appendChild(f);cuerpo.style.padding='0'}
}
function abrirPagina(u,t){
 actual=u;vz.classList.add('pag');tit.textContent=t||'';acc.innerHTML='';cuerpo.style.padding='';
 const a=document.createElement('a');a.href=abs(u);a.target='_blank';a.rel='noopener';a.textContent='Abrir en pestaña nueva ↗';acc.appendChild(a);
 cuerpo.innerHTML='';const f=document.createElement('iframe');f.src=u;f.title=t||u;f.setAttribute('allow','autoplay; clipboard-write; fullscreen');cuerpo.appendChild(f);mostrar();
}
window.VHRS_visor={abrirPDF,abrirPagina,cerrar};
// Cualquier PDF del sitio se abre en el visor (también las ligas con «download»).
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-pdf],a[href$=".pdf"],a[href*=".pdf?"],u[data-href$=".pdf"]');
 if(!el||e.metaKey||e.ctrlKey||e.shiftKey)return;
 const u=el.dataset.pdf||el.dataset.href||el.getAttribute('href');if(!u)return;
 e.preventDefault();e.stopPropagation();abrirPDF(u,el.dataset.titulo||el.title||'');
},true);
})();
