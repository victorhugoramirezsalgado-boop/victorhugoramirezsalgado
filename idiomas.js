/* © 2026 Víctor Hugo Ramírez Salgado — idioma del sitio y del currículum (22 idiomas del sistema del Cubo). Asistencia-IA.
   Español es el original; inglés tiene versión propia del currículum; los demás idiomas usan la traducción automática de Google. */
(function(){
const L=[['es','Español'],['en','English'],['pt','Português'],['fr','Français'],['it','Italiano'],['de','Deutsch'],['nl','Nederlands'],['ca','Català'],['gl','Galego'],['eu','Euskara'],['da','Dansk'],['sv','Svenska'],['nb','Norsk'],['ga','Gaeilge'],['el','Ελληνικά'],['ru','Русский'],['uk','Українська'],['ar','العربية'],['he','עברית'],['hi','हिन्दी'],['zh','简体中文'],['ja','日本語']];
const G={nb:'no',he:'iw',zh:'zh-CN'};
const BASE='https://victorhugoramirezsalgado.com/';
const trad=(ruta,l)=>`https://victorhugoramirezsalgado-com.translate.goog/${ruta}?_x_tr_sl=es&_x_tr_tl=${G[l]||l}&_x_tr_hl=es`;
const opciones=sel=>L.map(([c,n])=>`<option value="${c}"${c===sel?' selected':''}>${n}</option>`).join('');
// idioma del sitio (arriba)
document.querySelectorAll('.tema').forEach(t=>{const s=document.createElement('select');s.className='idioma-sel';s.setAttribute('aria-label','Idioma del sitio');s.innerHTML=opciones('es');
 s.onchange=()=>{if(s.value!=='es')location.href=trad(location.pathname.replace(/^\//,''),s.value)};t.prepend(s)});
// currículum (pie)
const cv=document.getElementById('cv-idioma');
if(cv){cv.innerHTML=opciones('es');document.getElementById('cv-abrir').onclick=()=>{const l=cv.value;window.open(l==='es'?BASE+'cv/':l==='en'?BASE+'cv/en/':trad('cv/',l),'_blank','noopener')}}
})();
