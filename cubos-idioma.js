/* © 2026 Víctor Hugo Ramírez Salgado — idioma de los cubos impresos (Cubo 33© en 2D, Cubo del Idioma© y bases). Asistencia-IA.
   Toma el idioma elegido en el sitio (traducción) o en el selector «Idioma del cubo» y cambia las ligas de los PDF. */
(function(){
const L=[['es','Español'],['en','English'],['fr','Français'],['pt','Português'],['it','Italiano'],['de','Deutsch'],['nl','Nederlands'],['ca','Català'],['gl','Galego'],['eu','Euskara'],['da','Dansk'],['sv','Svenska'],['nb','Norsk bokmål'],['ga','Gaeilge'],['el','Ελληνικά'],['ru','Русский'],['uk','Українська'],['ar','العربية'],['he','עברית'],['hi','हिन्दी'],['zh','中文'],['ja','日本語']];
const OK=new Set(L.map(x=>x[0]));const G={no:'nb',iw:'he','zh-CN':'zh','zh-TW':'zh'};
const A='/cubo-base/assets/';
const url={c33:c=>c==='es'?A+'cubo33-nivel1-prototipo-carta.pdf':A+'cubos33-idioma/cubo33-2d-'+c+'-carta.pdf',
 cubo:c=>A+'cubos-idioma/cubo-idioma-'+c+'-carta.pdf',bases:c=>A+'idiomas/idioma-'+c+'-carta.pdf'};
const nom=c=>(L.find(x=>x[0]===c)||L[0])[1];
function inicial(){
 let t=new URLSearchParams(location.search).get('_x_tr_tl');if(t){t=G[t]||t.split('-')[0];if(OK.has(t))return t}
 try{const g=localStorage.getItem('vhrs-idioma-cubo');if(OK.has(g))return g}catch(e){}
 return 'es';
}
let cur=inicial();
function aplica(){
 document.querySelectorAll('[data-cubo-pdf]').forEach(a=>{const k=a.dataset.cuboPdf;a.setAttribute('href',url[k](cur));if(a.tagName==='U')a.dataset.href=url[k](cur);a.dataset.titulo=(k==='c33'?'Cubo 33© en 2D':k==='cubo'?'Cubo del Idioma':'Bases del idioma')+' · '+nom(cur)});
 document.querySelectorAll('[data-cubo-nombre]').forEach(x=>x.textContent=nom(cur));
 document.querySelectorAll('select.idioma-cubo').forEach(s=>s.value=cur);
}
window.VHRS_cubos={url,nom,get idioma(){return cur},set idioma(c){if(OK.has(c)){cur=c;try{localStorage.setItem('vhrs-idioma-cubo',c)}catch(e){}aplica()}}};
document.querySelectorAll('select.idioma-cubo').forEach(s=>{s.innerHTML=L.map(([c,n])=>`<option value="${c}">${n}</option>`).join('');s.onchange=()=>{window.VHRS_cubos.idioma=s.value}});
aplica();
})();
