/* © 2026 Víctor Hugo Ramírez Salgado — cambio entre vista de celular y vista de escritorio. Asistencia-IA. */
(function(){
const meta=document.querySelector('meta[name=viewport]');
const leer=()=>{try{return localStorage.getItem('vhrs-vista')}catch(e){return null}};
function aplica(v){
 const esc=v==='escritorio';
 meta.setAttribute('content',esc?'width=1280':'width=device-width,initial-scale=1');
 document.documentElement.classList.toggle('escritorio',esc);
 document.querySelectorAll('.vista-btn').forEach(b=>b.textContent=esc?'📱 Vista celular':'🖥 Vista escritorio');
}
function cambia(){const v=leer()==='escritorio'?'celular':'escritorio';try{localStorage.setItem('vhrs-vista',v)}catch(e){}aplica(v);window.scrollTo(0,0)}
document.querySelectorAll('.tema').forEach(t=>{const b=document.createElement('button');b.className='vista-btn';b.type='button';b.onclick=cambia;t.appendChild(b)});
const pie=document.querySelector('.pie-fin');
if(pie){const b=document.createElement('button');b.className='vista-btn';b.type='button';b.style.marginTop='10px';b.onclick=cambia;pie.appendChild(document.createElement('br'));pie.appendChild(b)}
aplica(leer()==='escritorio'?'escritorio':'celular');
})();
