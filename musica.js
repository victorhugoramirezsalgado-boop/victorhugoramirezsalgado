/* © 2026 Víctor Hugo Ramírez Salgado — música de fondo suave para la biblioteca. Asistencia-IA.
   Se reproduce con el reproductor oficial de YouTube (videos publicados por cada disquera).
   Empieza al primer toque en la página, con volumen 2 que sube poco a poco hasta 30.
   En celulares y tabletas solo suena al tocar ♪: así no se corta la música que el visitante ya esté escuchando.
   Al empezar, el botón de parar se ve más claro 5 segundos y luego vuelve a su tono tenue.
   Si el visitante la apaga, queda apagada en sus siguientes visitas. */
(function(){
const LISTA=[
 ['NfOg7uNLolA','Gibran Alcocer','Idea 10'],
 ['tGNiP5kbctE','Gibran Alcocer','Idea 12'],
 ['8Da7RgPXCmU','Gibran Alcocer','Idea 22'],
 ['znfYwABeSZ0','Yann Tiersen','Comptine d’un autre été (Amélie)'],
 ['7GlsxNI4LVI','Hans Zimmer','Cornfield Chase (Interstellar)'],
 ['vPA6T0la6uI','Hans Zimmer','Day One (Interstellar)']];
const VOL_INI=2, VOL_MAX=30, PASO_MS=4000; // empieza en 2 y sube 1 cada 4 s: llega a 30 en unos 2 minutos
const MOVIL=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const IOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let i=0, yt=null, listo=false, sonando=false, rampa=null, vol=VOL_INI;
const leer=()=>{try{return localStorage.getItem('vhrs-musica')}catch(e){return null}};
const guardar=v=>{try{localStorage.setItem('vhrs-musica',v)}catch(e){}};

const css=document.createElement('style');
css.textContent=`.mus{position:fixed;left:14px;bottom:14px;z-index:40;display:flex;align-items:center;gap:8px;font:500 12px var(--f-txt,system-ui);opacity:.55;transition:opacity .3s}
.mus:hover,.mus.resalta{opacity:1}
.mus.resalta #mus-btn{background:var(--acento,#8A6A3B);color:#fff;border-color:var(--acento,#8A6A3B);box-shadow:0 0 0 4px rgba(201,165,90,.35)}
.mus #mus-btn{transition:background .8s,box-shadow .8s,color .8s}
.mus button{width:30px;height:30px;border-radius:50%;border:1px solid var(--linea,#E2D3B4);background:var(--papel,#FBF7EE);color:var(--tinta,#2B2620);cursor:pointer;font-size:12px;line-height:1;padding:0}
.mus .tema-son{max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--mut,#6E6457);font-style:italic;letter-spacing:.02em;pointer-events:none}
body.biblioteca .mus .tema-son{color:#D9CBA8}
.mus .tema-son:empty{display:none}
#mus-yt{position:fixed;width:1px;height:1px;left:-10px;bottom:-10px;opacity:0;pointer-events:none}`;
document.head.appendChild(css);
const caja=document.createElement('div'); caja.className='mus';
caja.innerHTML='<button id="mus-btn" aria-label="Música de fondo" title="Música de fondo">♪</button><button id="mus-sig" aria-label="Siguiente canción" title="Siguiente canción" hidden>›</button><span class="tema-son" id="mus-tema" aria-live="polite"></span><div id="mus-yt"></div>';
document.body.appendChild(caja);
const btn=caja.querySelector('#mus-btn'), sigb=caja.querySelector('#mus-sig'), tema=caja.querySelector('#mus-tema');

function rotulo(){const [,a,t]=LISTA[i];tema.textContent=sonando?`♪ ${t} · ${a}`:'';btn.textContent=sonando?'❚❚':'♪';btn.title=sonando?'Detener la música':'Música de fondo';sigb.hidden=!sonando}
function subir(){clearInterval(rampa);vol=VOL_INI;yt.setVolume(vol);rampa=setInterval(()=>{if(vol>=VOL_MAX){clearInterval(rampa);return}vol+=1;yt.setVolume(vol)},PASO_MS)}
function cargar(){const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s)}
window.onYouTubeIframeAPIReady=function(){
 yt=new YT.Player('mus-yt',{width:1,height:1,videoId:LISTA[i][0],playerVars:{controls:0,disablekb:1,playsinline:1,rel:0},
  events:{onReady:()=>{listo=true;if(pendiente)tocar()},
   onStateChange:e=>{if(e.data===YT.PlayerState.ENDED)siguiente();if(e.data===YT.PlayerState.PLAYING){sonando=true;rotulo()}},
   onError:()=>siguiente()}});
};
let pendiente=false;
let tRes=null;function resalta(){caja.classList.add('resalta');btn.title='Detener la música';clearTimeout(tRes);tRes=setTimeout(()=>caja.classList.remove('resalta'),5000)}
function tocar(){if(!listo){pendiente=true;if(!yt&&!window.YT)cargar();return}pendiente=false;yt.setVolume(VOL_INI);yt.playVideo();subir();sonando=true;rotulo();resalta()}
function detener(){caja.classList.remove('resalta');if(yt&&listo)yt.pauseVideo();clearInterval(rampa);sonando=false;rotulo()}
function siguiente(){i=(i+1)%LISTA.length;if(!yt)return;yt.loadVideoById(LISTA[i][0]);yt.setVolume(vol);rotulo()}
btn.onclick=e=>{e.stopPropagation();if(sonando){detener();guardar('off')}else{guardar('on');tocar()}};
sigb.onclick=e=>{e.stopPropagation();siguiente()};
// Los navegadores no dejan sonar música sin un toque: empieza al primer toque, suave, salvo que el visitante la haya apagado.
cargar();
const primerToque=e=>{if(e.target.closest&&e.target.closest('.mus'))return;document.removeEventListener('pointerdown',primerToque,true);document.removeEventListener('keydown',primerToque,true);if(leer()!=='off'&&!MOVIL)tocar()};
document.addEventListener('pointerdown',primerToque,true);document.addEventListener('keydown',primerToque,true);
})();
