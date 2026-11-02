/* TContenedores · utilidades comunes: idiomas, Morse sonoro, modo incrustado e ISO 6346.
   © Víctor Hugo Ramírez Salgado · ContenedorEns© · Código Cúbico© */
(function(){
"use strict";
const LANGS=[['es','Español'],['en','English'],['fr','Français'],['pt','Português'],['it','Italiano'],['de','Deutsch'],['zh','中文'],['ja','日本語'],['ko','한국어'],['ar','العربية'],['ru','Русский'],['hi','हिन्दी']];
const T={
 nav_traza:{es:'Trazabilidad',en:'Traceability',fr:'Traçabilité',pt:'Rastreabilidade',it:'Tracciabilità',de:'Rückverfolgung',zh:'追溯',ja:'トレーサビリティ',ko:'추적',ar:'التتبع',ru:'Прослеживаемость',hi:'ट्रेसबिलिटी'},
 nav_portal:{es:'Portal de clientes',en:'Customer portal',fr:'Portail clients',pt:'Portal do cliente',it:'Portale clienti',de:'Kundenportal',zh:'客户门户',ja:'顧客ポータル',ko:'고객 포털',ar:'بوابة العملاء',ru:'Портал клиентов',hi:'ग्राहक पोर्टल'},
 h_traza:{es:'Trazabilidad de contenedores',en:'Container traceability',fr:'Traçabilité des conteneurs',pt:'Rastreabilidade de contêineres',it:'Tracciabilità dei container',de:'Container-Rückverfolgung',zh:'集装箱追溯',ja:'コンテナ追跡',ko:'컨테이너 추적',ar:'تتبع الحاويات',ru:'Прослеживаемость контейнеров',hi:'कंटेनर ट्रेसबिलिटी'},
 h_portal:{es:'Estado de cuenta',en:'Account statement',fr:'Relevé de compte',pt:'Extrato de conta',it:'Estratto conto',de:'Kontoauszug',zh:'账户对账单',ja:'取引明細',ko:'계정 명세서',ar:'كشف الحساب',ru:'Выписка по счёту',hi:'खाता विवरण'},
 buscar:{es:'Buscar',en:'Search',fr:'Rechercher',pt:'Buscar',it:'Cerca',de:'Suchen',zh:'搜索',ja:'検索',ko:'검색',ar:'بحث',ru:'Найти',hi:'खोजें'},
 entrar:{es:'Ver mi estado de cuenta',en:'View my statement',fr:'Voir mon relevé',pt:'Ver meu extrato',it:'Vedi il mio estratto',de:'Kontoauszug anzeigen',zh:'查看我的对账单',ja:'明細を見る',ko:'내 명세서 보기',ar:'عرض كشف حسابي',ru:'Показать выписку',hi:'मेरा विवरण देखें'},
 padron:{es:'Padrón de empresas con clave única',en:'Registry of companies with unique key',fr:'Registre des entreprises',pt:'Cadastro de empresas',it:'Registro delle aziende',de:'Unternehmensregister',zh:'企业唯一编码名录',ja:'登録企業一覧',ko:'등록 기업 명부',ar:'سجل الشركات',ru:'Реестр компаний',hi:'कंपनियों की सूची'},
 ultimos:{es:'Movimientos recientes',en:'Recent movements',fr:'Mouvements récents',pt:'Movimentos recentes',it:'Movimenti recenti',de:'Letzte Bewegungen',zh:'最近动态',ja:'最近の移動',ko:'최근 이동',ar:'أحدث الحركات',ru:'Последние движения',hi:'हाल की गतिविधियाँ'}
};
const C={};
C.lang=(()=>{try{return localStorage.getItem('tc_lang')||'es'}catch(e){return 'es'}})();
C.t=k=>(T[k]&&(T[k][C.lang]||T[k].es))||'';
C.apply=()=>{document.querySelectorAll('[data-t]').forEach(el=>{const v=C.t(el.dataset.t);if(v)el.textContent=v;});document.documentElement.lang=C.lang;document.documentElement.dir=C.lang==='ar'?'rtl':'ltr';};
C.langSelect=sel=>{sel.innerHTML=LANGS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');sel.value=C.lang;
  sel.onchange=()=>{C.lang=sel.value;try{localStorage.setItem('tc_lang',C.lang)}catch(e){}C.apply();C.resize();};C.apply();};
/* Morse sonoro */
const MO={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
let ac=null,busy=false;
C.morse=(btn,word)=>{btn.title=word.split('').map(c=>MO[c]||'').join(' ');btn.onclick=()=>{if(busy)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  busy=true;const u=.07;let t=ac.currentTime+.05;for(const ch of word){const m=MO[ch];if(!m){t+=4*u;continue}for(const s of m){const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=640;o.connect(g);g.connect(ac.destination);const d=s==='.'?u:3*u;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.25,t+.005);g.gain.setValueAtTime(.25,t+d-.005);g.gain.linearRampToValueAtTime(0,t+d);o.start(t);o.stop(t+d+.01);t+=d+u;}t+=2*u;}
  setTimeout(()=>busy=false,(t-ac.currentTime)*1000);};};
/* Incrustado en arsabodegas.com u otro sitio: avisa la altura para que el marco crezca */
C.embedded=(()=>{try{return window.self!==window.top}catch(e){return true}})();
if(C.embedded)document.documentElement.classList.add('embed');
C.resize=()=>{if(!C.embedded)return;try{parent.postMessage({tcontenedores:true,h:Math.ceil(document.documentElement.scrollHeight)},'*')}catch(e){}};
window.addEventListener('load',C.resize);new ResizeObserver(()=>C.resize()).observe(document.documentElement);
/* ISO 6346 */
const V={};(()=>{let v=10;for(const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){if(v%11===0)v++;V[c]=v++;}})();
C.digit=s=>{let t=0;for(let i=0;i<10;i++){const ch=s[i];t+=(/\d/.test(ch)?+ch:V[ch])*2**i;}return t%11%10;};
C.clean=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
C.valid=s=>/^[A-Z]{3}[UJZ]\d{7}$/.test(s)&&C.digit(s)===+s[10];
C.showCN=s=>/^[A-Z]{4}\d{7}$/.test(s)?`${s.slice(0,4)} ${s.slice(4,10)}<i>${s[10]}</i>`:C.esc(s);
C.esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
C.fecha=iso=>{if(!iso)return '—';const d=String(iso).slice(0,10);return `${+d.slice(8,10)} ${MES[+d.slice(5,7)-1]} ${d.slice(0,4)}`;};
C.money=(n,m)=>(m==='USD'?'US':'')+new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Math.round((+n||0)*100)/100);
window.TC=C;
})();
