/* © 2026 Víctor Hugo Ramírez Salgado — música de fondo suave para la biblioteca. Asistencia-IA.
   Se reproduce con el reproductor oficial de YouTube (videos publicados por cada disquera).
   · Siempre empieza en STOP: no suena nada hasta que el visitante toca «▶ Activar música»
     (así no interrumpe la música que ya esté escuchando en su teléfono o computadora).
   · Volumen 2 que sube poco a poco hasta 30.
   · Si se sale del sitio, la música se apaga. Si se va a otra página del sitio y se regresa a la principal,
     la música sigue en la misma canción y en el punto donde iba (como si no se hubiera detenido).
   · Solo suena una pestaña a la vez: si la principal ya está sonando, las demás páginas no se enciman.
   · Con «■ Detener» se apaga; en la siguiente visita vuelve a empezar en stop. */
(function(){
const LISTA=[
 ['NfOg7uNLolA','Gibran Alcocer','Idea 10'],
 ['tGNiP5kbctE','Gibran Alcocer','Idea 12'],
 ['8Da7RgPXCmU','Gibran Alcocer','Idea 22'],
 ['znfYwABeSZ0','Yann Tiersen','Comptine d’un autre été (Amélie)'],
 ['7GlsxNI4LVI','Hans Zimmer','Cornfield Chase (Interstellar)'],
 ['vPA6T0la6uI','Hans Zimmer','Day One (Interstellar)']];
const VOL_INI=2, VOL_MAX=30, PASO_MS=4000;   // sube 1 cada 4 s: llega a 30 en unos 2 minutos
const VIGENCIA_MS=30*60*1000;                // si regresa antes de 30 min, continúa donde iba
const POS='vhrs-musica-pos';
const leer=()=>{try{return localStorage.getItem('vhrs-musica')}catch(e){return null}};
const guardar=v=>{try{localStorage.setItem('vhrs-musica',v)}catch(e){}};
const sesLeer=()=>{try{return JSON.parse(sessionStorage.getItem(POS)||'null')}catch(e){return null}};
const sesGuardar=o=>{try{sessionStorage.setItem(POS,JSON.stringify(o))}catch(e){}};

let i=0, inicio=0, vol=VOL_INI, reanuda=false;
const previo=sesLeer();
if(previo&&previo.on&&Date.now()-previo.ts<VIGENCIA_MS){
 i=(previo.i|0)%LISTA.length; vol=Math.min(VOL_MAX,Math.max(VOL_INI,previo.vol|0));
 inicio=Math.max(0,(+previo.t||0)+(Date.now()-previo.ts)/1000); reanuda=true;
}
let pendiente=false, yt=null, listo=false, sonando=false, mudo=false, rampa=null, pausaNuestra=false, pausaAjena=false, otraSuena=false;

const css=document.createElement('style');
css.textContent=`.mus{position:fixed;left:14px;bottom:14px;z-index:40;display:flex;align-items:center;gap:8px;font:500 12px var(--f-txt,system-ui);opacity:.85;transition:opacity .3s}
.mus:hover,.mus.resalta,.mus.espera{opacity:1}
.mus.resalta #mus-btn,.mus.espera #mus-btn{background:var(--acento,#8A6A3B);color:#fff;border-color:var(--acento,#8A6A3B);box-shadow:0 0 0 4px rgba(201,165,90,.35)}
.mus.espera #mus-btn{animation:mus-lat 1.6s ease-in-out infinite}
@keyframes mus-lat{50%{box-shadow:0 0 0 8px rgba(201,165,90,.15)}}
.mus #mus-btn{padding:0 12px;font-weight:600;white-space:nowrap;transition:background .8s,box-shadow .8s,color .8s}
.mus button{min-width:30px;height:30px;border-radius:999px;border:1px solid var(--linea,#E2D3B4);background:var(--papel,#FBF7EE);color:var(--tinta,#2B2620);cursor:pointer;font-size:12px;line-height:1;padding:0}
.mus .tema-son{max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--mut,#6E6457);font-style:italic;letter-spacing:.02em;pointer-events:none}
body.biblioteca .mus .tema-son{color:#D9CBA8}
.mus .tema-son:empty{display:none}
#mus-yt{position:fixed;width:1px;height:1px;left:-10px;bottom:-10px;opacity:0;pointer-events:none}`;
document.head.appendChild(css);
const caja=document.createElement('div'); caja.className='mus';
caja.innerHTML='<button id="mus-btn" aria-label="Activar música para leer (play)" title="Activar música para leer (play)">▶ Activar música</button><button id="mus-sig" aria-label="Siguiente canción" title="Siguiente canción" hidden>›</button><span class="tema-son" id="mus-tema" aria-live="polite"></span><div id="mus-yt"></div>';
document.body.appendChild(caja);
const btn=caja.querySelector('#mus-btn'), sigb=caja.querySelector('#mus-sig'), tema=caja.querySelector('#mus-tema');

function rotulo(){
 const [,a,t]=LISTA[i];
 caja.classList.toggle('espera',sonando&&mudo);
 tema.textContent=!sonando?'':mudo?'♪ Toque la pantalla para escuchar':`♪ ${t} · ${a}`;
 btn.textContent=sonando&&!mudo?'■ Detener':'▶ Activar música';
 btn.title=sonando&&!mudo?'Detener la música (stop)':'Activar música para leer (play)';btn.setAttribute('aria-label',btn.title);
 sigb.hidden=!sonando||mudo;
}
let tRes=null;function resalta(){caja.classList.add('resalta');clearTimeout(tRes);tRes=setTimeout(()=>caja.classList.remove('resalta'),5000)}
function subir(desde){clearInterval(rampa);vol=desde;yt.setVolume(vol);rampa=setInterval(()=>{if(vol>=VOL_MAX){clearInterval(rampa);return}vol+=1;yt.setVolume(vol)},PASO_MS)}

// ---- solo una pestaña a la vez ----
const yo=Math.random().toString(36).slice(2);
const bc=('BroadcastChannel' in window)?new BroadcastChannel('vhrs-musica'):null;
const avisa=m=>{if(bc)try{bc.postMessage(Object.assign({de:yo},m))}catch(e){}};
if(bc)bc.onmessage=({data:m})=>{
 if(!m||m.de===yo)return;
 if(m.pregunta&&sonando&&!mudo)avisa({suena:true});
 if(m.suena)otraSuena=true;
 if(m.toma&&sonando){pausar();pausaAjena=true}
};
avisa({pregunta:true});

// ---- posición: para continuar al regresar a la página ----
function anota(on){
 if(!yt||!listo||typeof yt.getCurrentTime!=='function')return;
 sesGuardar({i,t:yt.getCurrentTime()||0,vol,ts:Date.now(),on:on!==undefined?on:(sonando||pausaAjena)});
}
setInterval(()=>{if(sonando)anota(true)},2000);
addEventListener('pagehide',()=>anota());

// ---- reproductor ----
function cargar(){if(window.YT&&YT.Player){window.onYouTubeIframeAPIReady();return}const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s)}
window.onYouTubeIframeAPIReady=function(){
 if(yt)return;
 yt=new YT.Player('mus-yt',{width:1,height:1,videoId:LISTA[i][0],
  playerVars:{controls:0,disablekb:1,playsinline:1,rel:0,start:Math.floor(inicio)},
  events:{
   onReady:()=>{listo=true;if(pendiente){tocar();return}
    // solo continúa sola si el visitante la activó en esta misma visita (y otra pestaña no suena)
    if(reanuda)setTimeout(()=>{if(!otraSuena)arrancar()},350)},
   onStateChange:e=>{
    const S=YT.PlayerState;
    if(e.data===S.ENDED)siguiente();
    if(e.data===S.PLAYING){
     if(reanuda&&inicio){const d=yt.getDuration();if(d&&inicio>d-2){inicio=0;reanuda=false;siguiente();return}}
     sonando=true;pausaAjena=false;mudo=yt.isMuted();if(!mudo)avisa({toma:true});rotulo()}
    if(e.data===S.PAUSED&&!pausaNuestra&&document.hidden){pausaAjena=true;sonando=false;rotulo()}
    pausaNuestra=false;
   },
   onError:()=>siguiente()}});
};
// Intenta sonar de inmediato; si el navegador lo bloquea, arranca en silencio y se oye al primer toque.
function arrancar(){
 yt.unMute();yt.setVolume(vol);
 if(reanuda&&inicio)yt.seekTo(inicio,true);
 yt.playVideo();
 if(!reanuda)subir(VOL_INI);else if(vol<VOL_MAX)subir(vol);
 setTimeout(()=>{
  const st=yt.getPlayerState();
  if(st!==YT.PlayerState.PLAYING&&st!==YT.PlayerState.BUFFERING){yt.mute();yt.playVideo();mudo=true;sonando=true;rotulo()}
  else if(!yt.isMuted()){mudo=false;resalta();rotulo()}
 },1500);
}
function oir(){ // primer toque: quita el silencio
 if(!yt||!listo)return;
 yt.unMute();yt.setVolume(vol);mudo=false;
 if(yt.getPlayerState()!==YT.PlayerState.PLAYING)yt.playVideo();
 sonando=true;avisa({toma:true});rotulo();resalta();
}
function tocar(){if(!listo){pendiente=true;if(!yt)cargar();return}pendiente=false;reanuda=false;inicio=0;yt.unMute();yt.setVolume(VOL_INI);yt.playVideo();subir(VOL_INI);sonando=true;mudo=false;avisa({toma:true});rotulo();resalta()}
function pausar(){pausaNuestra=true;if(yt&&listo)yt.pauseVideo();clearInterval(rampa);sonando=false;rotulo()}
function detener(){caja.classList.remove('resalta');pausar();pausaAjena=false;anota(false)}
function siguiente(){i=(i+1)%LISTA.length;reanuda=false;inicio=0;if(!yt)return;yt.loadVideoById(LISTA[i][0]);yt.setVolume(vol);rotulo()}
function retomar(){ // al volver a la pestaña o con el botón «atrás»
 if(!yt||!listo||!pausaAjena)return;
 pausaAjena=false;yt.playVideo();sonando=true;if(!mudo)avisa({toma:true});rotulo();
}

btn.onclick=e=>{e.stopPropagation();if(sonando&&mudo){oir()}else if(sonando){detener()}else{tocar()}};
sigb.onclick=e=>{e.stopPropagation();siguiente()};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)retomar()});
addEventListener('pageshow',e=>{if(e.persisted){pausaAjena=pausaAjena||(!!yt&&listo&&yt.getPlayerState()!==YT.PlayerState.PLAYING&&true);retomar()}});
const primerToque=e=>{ // solo quita el silencio de una música que el visitante ya había activado
 if(e.target.closest&&e.target.closest('.mus'))return;
 if(sonando&&mudo){oir();quitar()}
};
function quitar(){document.removeEventListener('pointerdown',primerToque,true);document.removeEventListener('keydown',primerToque,true)}
document.addEventListener('pointerdown',primerToque,true);document.addEventListener('keydown',primerToque,true);
if(reanuda)cargar();   // si no, el reproductor se carga hasta que se toque «Activar música»
})();
