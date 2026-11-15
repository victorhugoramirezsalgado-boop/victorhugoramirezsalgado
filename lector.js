/* © 2026 Víctor Hugo Ramírez Salgado — lector de la biblioteca de obras (libro abierto). Asistencia-IA. */
const slug=n=>n.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[©™]/g,'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const APA=(r,f,tit)=>`Ramírez Salgado, V. H. (${anio(f)}). <i>${tit}</i> [Obra registrada n.º ${r}]. Safe Creative. https://www.safecreative.org/work/${r}`;
const paginaObra=k=>`obra.html?id=${slug(P[k][1])}`;

// Páginas de cada vista. k=-1 es el índice; v='a' ficha, v='b' ver más.
function vista(k,v){
 if(k<0){
  let g='',lis='';
  P.forEach(([gr,n],i)=>{if(gr!==g){g=gr;lis+=`<li class="g">${gr}</li>`}lis+=`<li><a data-ir="${i}">${n}</a><span class="n">${i+1}</span></li>`});
  return [`<div class="cap">Biblioteca de obras</div><div class="img">${I.cubo}</div><h3>Índice</h3><div class="dom">Víctor Hugo Ramírez Salgado</div><div class="dom">${P.length} obras registradas</div><p class="abrir">Toca una obra o usa «Siguiente» para pasar la página</p>`,
          `<ol class="indice-l">${lis}</ol>`];
 }
 const [g,n,d,i,t,r,f,tit,desde,vis,s]=P[k], m=MAS[k];
 const izq=`<div class="cap">${g}</div><div class="img">${I[i]}</div><h3>${n}</h3><div class="dom">${d}</div><div class="dom">desde ${desde}</div><p class="abrir">Toca esta página para abrir la obra completa ›</p><span class="folio">${k*2+1}</span>`;
 if(v==='a') return [izq,`${CLIP}<p>${t}</p>
  <table class="ficha"><tr><th>Registro</th><td>Safe Creative n.º ${r}</td></tr><tr><th>Fecha de registro</th><td>${f}</td></tr><tr><th>Autor y titular</th><td>Víctor Hugo Ramírez Salgado (100 %)</td></tr><tr><th>Derechos</th><td>Todos los derechos reservados</td></tr></table>
  <p class="apa-t">Referencia (APA 7.ª ed.)</p><p class="apa">${APA(r,f,tit)}</p>
  <div class="acciones"><button class="btn" data-mas>Ver más ›</button><a class="btn ghost" href="${paginaObra(k)}">Abrir obra</a><a class="btn ghost" href="${s}">Apoyar</a></div><span class="folio">${k*2+2}</span>`];
 return [izq,`${CLIP}<p class="apa-t">Más sobre la obra</p><p>${m.t}</p>
  <p class="apa-t">Obras relacionadas</p><ul class="lista">${m.rel.map(([o,num])=>`<li><span>${o}</span><span>${num}</span></li>`).join('')}</ul>
  <p class="apa-t">Herramientas</p><ul class="lista">${m.h.map(([l,u])=>`<li><a href="${u}">${l}</a><span>›</span></li>`).join('')}</ul>
  <div class="acciones"><button class="btn ghost" data-ficha>‹ Ficha</button><a class="btn" href="${paginaObra(k)}">Abrir obra completa</a></div><span class="folio">${k*2+2}</span>`];
}

const L=document.getElementById('libro'), cuenta=document.getElementById('cuenta'), puntos=document.getElementById('puntos');
let k=-1, v='a';
const m=location.hash.match(/obra-(\d+)/); if(m){k=Math.min(P.length,+m[1])-1}
puntos.innerHTML='<button aria-label="Índice"></button>'+P.map((p,i)=>`<button aria-label="${p[1]}"></button>`).join('');

function pinta(){
 const [a,b]=vista(k,v);
 L.innerHTML=`<div class="pag izq">${a}</div><div class="pag der">${b}</div>`;
 cuenta.textContent=k<0?'Índice':`${k+1} de ${P.length} · ${P[k][0]}${v==='b'?' · más':''}`;
 document.getElementById('ant').disabled=k<0&&v==='a';
 document.getElementById('sig').disabled=k===P.length-1&&v==='b';
 [...puntos.children].forEach((x,i)=>x.classList.toggle('on',i===k+1));
 if(document.body.classList.contains('ampliado')||k>=0&&m) history.replaceState(null,'',(location.hash.includes('biblioteca')?'#biblioteca':'')+(k>=0?`${location.hash.includes('biblioteca')?'&':'#'}obra-${k+1}`:''));
}
function ir(nk,nv,dir){
 if(nk===k&&nv===v)return;
 const lado=dir>0?'der':'izq', vieja=L.querySelector('.pag.'+lado);
 const hoja=document.createElement('div'); hoja.className='hoja '+(dir>0?'adelante':'atras'); hoja.appendChild(vieja.cloneNode(true));
 k=nk;v=nv;pinta();L.appendChild(hoja);setTimeout(()=>hoja.remove(),720);
}
const sig=()=>{ if(k<0)ir(0,'a',1); else if(k<P.length-1)ir(k+1,'a',1); else if(v==='a')ir(k,'b',1)};
const ant=()=>{ if(v==='b')ir(k,'a',-1); else if(k>0)ir(k-1,'a',-1); else if(k===0)ir(-1,'a',-1)};
document.getElementById('sig').onclick=sig; document.getElementById('ant').onclick=ant;
puntos.onclick=e=>{const i=[...puntos.children].indexOf(e.target); if(i>=0)ir(i-1,'a',i-1>k?1:-1)};
L.onclick=e=>{
 const t=e.target.closest('[data-ir],[data-mas],[data-ficha],a,.pag.izq');
 if(!t)return;
 if(t.dataset.ir!==undefined){ir(+t.dataset.ir,'a',1);return}
 if(t.hasAttribute('data-mas')){ir(k,'b',1);return}
 if(t.hasAttribute('data-ficha')){ir(k,'a',-1);return}
 if(t.tagName==='A')return;
 if(t.classList.contains('izq')&&k>=0)verObra(k,true);
};
const amp=document.getElementById('ampliar');
const ampliar=on=>{document.body.classList.toggle('ampliado',on);if(!on)history.replaceState(null,'',location.hash.includes('biblioteca')?'#biblioteca':location.pathname)};
amp.onclick=()=>ampliar(false);
// estante: cada obra como libro cerrado; al tocarlo se abre el libro en esa obra
const est=document.getElementById('estante');
est.innerHTML=P.map(([g,n,d,i,t,r],k)=>`<article class="tapa" tabindex="0" data-k="${k}" aria-label="Abrir ${n}">${k%3===1?CLIP:''}<div class="cap">${g}</div><div class="img">${I[i]}</div><h3>${n}</h3><div class="dom">${d}</div><div class="reg">Safe Creative n.º ${r}</div><span class="num">${k+1}</span></article>`).join('');
const abrir=nk=>{k=nk;v='a';ampliar(true);pinta()};
est.onclick=e=>{const t=e.target.closest('.tapa');if(t)abrir(+t.dataset.k)};
est.onkeydown=e=>{const t=e.target.closest('.tapa');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();abrir(+t.dataset.k)}};
document.addEventListener('keydown',e=>{if(!document.body.classList.contains('ampliado'))return;if(e.key==='ArrowRight')sig();if(e.key==='ArrowLeft')ant();if(e.key==='Escape')ampliar(false)});
let x0=null;L.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
L.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>60)(dx<0?sig:ant)();x0=null});
pinta();
if(m)ampliar(true);
// Obra completa dentro de la biblioteca: no recarga la página, así la música sigue sonando.
const VO=document.createElement('div'); VO.id='vista-obra';
VO.innerHTML='<nav class="migas"><button class="nav" data-vo="volver">‹ Volver al libro</button><span><button class="nav" data-vo="ant">‹ Anterior</button> <button class="nav oro" data-vo="sig">Siguiente ›</button></span></nav><article class="obra" id="vo-obra"></article>';
document.body.appendChild(VO);
let ko=-1;
function verObra(nk,push){
 ko=(nk+P.length)%P.length; document.getElementById('vo-obra').innerHTML=htmlObra(ko);
 document.body.classList.add('en-obra'); VO.scrollTop=0;
 document.title=`${P[ko][1]} · Víctor Hugo Ramírez Salgado`;
 const url=`obra.html?id=${slugObra(P[ko][1])}`;
 if(push)history.pushState({obra:ko},'',url); else history.replaceState({obra:ko},'',url);
}
function cerrarObra(){document.body.classList.remove('en-obra');document.title='Víctor Hugo Ramírez Salgado · Obras, sistemas y registros';if(ko>=0){k=ko;v='a';ampliar(true);pinta()}ko=-1}
VO.addEventListener('click',e=>{
 const b=e.target.closest('[data-vo]');
 if(b){const a=b.dataset.vo; if(a==='volver')history.back(); else verObra(ko+(a==='sig'?1:-1),false); return}
 const a=e.target.closest('a'); if(a&&a.target!=='_blank'){e.preventDefault();window.open(a.href,'_blank','noopener')}
});
window.addEventListener('popstate',e=>{if(e.state&&e.state.obra!=null)verObra(e.state.obra,false);else if(document.body.classList.contains('en-obra'))cerrarObra()});
// En el libro: «Abrir obra» y la portada abren la obra aquí mismo; las demás ligas abren en otra pestaña.
L.addEventListener('click',e=>{
 const a=e.target.closest('a'); if(!a)return;
 e.preventDefault(); e.stopImmediatePropagation();
 if(a.getAttribute('href').startsWith('obra.html'))verObra(k,true); else window.open(a.href,'_blank','noopener');
},true);
// Ligas del pie y de la constancia que salen de la portada: en otra pestaña para no cortar la música.
document.querySelectorAll('.pie a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"])').forEach(a=>{a.target='_blank';a.rel='noopener'});
