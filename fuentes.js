/* © 2026 Víctor Hugo Ramírez Salgado — tipografía del sitio (opciones para elegir). Asistencia-IA.
   Todas son fuentes de Google Fonts con licencia libre (SIL Open Font License). */
window.VHRS_FUENTES={
 actual:   {n:'Actual: Cormorant + Inter',          tit:'Cormorant Garamond', txt:'Inter',            q:'Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600'},
 biblioteca:{n:'A · Biblioteca clásica',            tit:'Cormorant Garamond', txt:'EB Garamond',      q:'Cormorant+Garamond:ital,wght@0,600;0,700;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400'},
 editorial:{n:'B · Editorial',                      tit:'Playfair Display',   txt:'Lora',             q:'Playfair+Display:ital,wght@0,600;0,700;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400'},
 academica:{n:'C · Académica',                      tit:'Libre Baskerville',  txt:'Source Serif 4',   q:'Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400'},
 inscripcion:{n:'D · Inscripción',                  tit:'Cinzel',             txt:'Crimson Pro',      q:'Cinzel:wght@500;600;700&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400'},
 moderna:{n:'E · Clásica moderna',                  tit:'Fraunces',           txt:'Literata',         q:'Fraunces:ital,wght@0,600;0,700;1,500&family=Literata:ital,wght@0,400;0,500;0,600;1,400'}
};
window.VHRS_FUENTE_FIJA='actual'; // la que queda para todos cuando VHRS elija
(function(){
 let k=window.VHRS_FUENTE_FIJA; try{k=localStorage.getItem('vhrs-fuente')||k}catch(e){}
 const f=VHRS_FUENTES[k]||VHRS_FUENTES.actual;
 const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+f.q+'&display=swap';document.head.appendChild(l);
 const s=document.createElement('style');
 s.textContent=`:root{--f-tit:"${f.tit}",Georgia,serif!important;--f-txt:"${f.txt}",system-ui,sans-serif!important}`;
 document.head.appendChild(s);
})();
