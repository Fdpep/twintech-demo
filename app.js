'use strict';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const desktopMotion=matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
const mobileLayout=matchMedia('(max-width: 900px)');
const menu=document.getElementById('menu');
const menuButton=document.querySelector('.menu-toggle');
function setMenu(open){
 menu.classList.toggle('open',open);
 menuButton.setAttribute('aria-expanded',String(open));
 menuButton.setAttribute('aria-label',open?'Chiudi menu':'Apri menu');
 document.body.classList.toggle('menu-open',open);
}
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!menuButton.contains(e.target))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){setMenu(false);menuButton.focus()}});
mobileLayout.addEventListener('change',()=>setMenu(false));

// I servizi sono già presenti nell'HTML: navigabili anche senza JavaScript.
const serviceCards=[...document.querySelectorAll('.service-card')];
const cardAnimations=new WeakMap();
function animateService(card,open){
 const height=card.getBoundingClientRect().height;
 const previous=cardAnimations.get(card);
 if(previous){previous.onfinish=null;previous.cancel()}
 card.dataset.expanded=String(open);
 if(reducedMotion.matches||!card.animate){card.open=open;card.style.height='';return}
 card.style.height=height+'px';
 card.open=true;
 const summary=card.querySelector('summary');
 const content=card.querySelector('.service-content');
 const target=summary.getBoundingClientRect().height+2+(open?content.getBoundingClientRect().height:0);
 const animation=card.animate({height:[height+'px',target+'px']},{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
 cardAnimations.set(card,animation);
 animation.onfinish=()=>{card.open=open;card.style.height='';cardAnimations.delete(card)};
}
serviceCards.forEach(card=>{
 card.removeAttribute('name');
 card.dataset.expanded=String(card.open);
 card.querySelector('summary').addEventListener('click',event=>{
  event.preventDefault();
  const open=card.dataset.expanded!=='true';
  if(open)serviceCards.forEach(other=>{if(other!==card&&other.dataset.expanded==='true')animateService(other,false)});
  animateService(card,open);
 });
});

if('IntersectionObserver'in window){
 document.body.classList.add('motion');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}
 }),{threshold:.04});
 document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
 const navObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting)menu.querySelectorAll('a').forEach(a=>{
   const active=a.getAttribute('href')==='#'+e.target.id;
   a.classList.toggle('active',active);
   if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
  });
 }),{rootMargin:'-15% 0px -65% 0px'});
 document.querySelectorAll('main section[id]').forEach(e=>navObserver.observe(e));
}

const form=document.getElementById('preventivo');
form.addEventListener('submit',e=>{
 e.preventDefault();
 if(!form.reportValidity())return;
 const values=[...new FormData(form)].map(([key,value])=>`${key}: ${String(value).trim()}`).join('\n');
 const subject='Richiesta preventivo — '+form.elements.Intervento.value;
 const url='mailto:twintech2005@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent('Buongiorno Twintech Motor,\nvorrei informazioni per un intervento sulla mia auto.\n\n'+values);
 window.location.href=url;
 const status=document.getElementById('form-status');
 status.hidden=false;
 status.textContent='Conferma l’invio nella tua app email. Se non si apre, scrivi a twintech2005@gmail.com o chiama il 339 602 1831. Il sito non invia messaggi automaticamente.';
});
function updateFormFocus(){
 const active=document.activeElement;
 document.body.classList.toggle('editing-form',form.contains(active)&&active.matches('input,textarea,select'));
}
form.addEventListener('focusin',updateFormFocus);
form.addEventListener('focusout',()=>setTimeout(updateFormFocus,0));

const lightbox=document.getElementById('lightbox');
const privacyDialog=document.getElementById('privacy-dialog');
function openDialog(dialog){dialog.showModal();document.body.classList.add('dialog-open')}
document.querySelectorAll('.gallery-item').forEach(button=>button.addEventListener('click',()=>{
 const img=lightbox.querySelector('img');
 img.src=button.dataset.image;img.alt=button.dataset.caption;
 lightbox.querySelector('p').textContent=button.dataset.caption+' · Immagine illustrativa';
 openDialog(lightbox);
}));
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
 dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
});
document.getElementById('privacy-open').addEventListener('click',()=>openDialog(privacyDialog));
document.getElementById('load-map').addEventListener('click',()=>{
 const iframe=document.createElement('iframe');
 iframe.title='Mappa Twintech Motor, Via Marcello Pucci Boncambi 10, Lido di Ostia';
 iframe.src='https://maps.google.com/maps?q=Via%20Marcello%20Pucci%20Boncambi%2010%2000121%20Lido%20di%20Ostia%20RM&t=&z=16&ie=UTF8&iwloc=&output=embed';
 iframe.allowFullscreen=true;iframe.referrerPolicy='no-referrer-when-downgrade';
 document.getElementById('map-container').append(iframe);
 document.getElementById('map-cover').hidden=true;
 document.getElementById('map-cover').style.display='none';
});
document.getElementById('year').textContent=new Date().getFullYear();

// Profondità su desktop; su telefono solo progressione e comparsa leggera.
const hero=document.querySelector('.hero');
const brandObject=document.querySelector('.brand-object');
const heroPhoto=document.querySelector('.hero-photo');
const progress=document.querySelector('.scroll-progress');
let scrollFrame=0,heroFrame=0,heroVisible=true;
function renderScroll(){
 scrollFrame=0;
 const max=document.documentElement.scrollHeight-innerHeight;
 progress.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;
 if(reducedMotion.matches||!desktopMotion.matches)return;
 if(heroVisible)heroPhoto.style.transform=`translateY(${Math.min(scrollY*.1,80)}px) scale(1.08)`;
}
function scheduleScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(renderScroll)}
window.addEventListener('scroll',scheduleScroll,{passive:true});
window.addEventListener('resize',scheduleScroll,{passive:true});
renderScroll();
function resetMotion(){
 cancelAnimationFrame(heroFrame);
 brandObject.style.transform='';heroPhoto.style.transform='';
 document.querySelectorAll('.gallery-item').forEach(c=>c.style.transform='');
 hero.classList.toggle('motion-paused',!desktopMotion.matches||reducedMotion.matches||!heroVisible||document.hidden);
 renderScroll();
}
if('IntersectionObserver'in window){
 new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;hero.classList.toggle('motion-paused',!heroVisible||!desktopMotion.matches||reducedMotion.matches||document.hidden)},{threshold:0}).observe(hero);
}
desktopMotion.addEventListener('change',resetMotion);
reducedMotion.addEventListener('change',resetMotion);
document.addEventListener('visibilitychange',resetMotion);
resetMotion();
hero.addEventListener('pointermove',e=>{
 if(!desktopMotion.matches||reducedMotion.matches)return;
 const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
 cancelAnimationFrame(heroFrame);
 heroFrame=requestAnimationFrame(()=>{brandObject.style.transform=`rotateX(${9-y*13}deg) rotateY(${-16+x*22}deg) rotateZ(${-4+x*3}deg)`});
});
hero.addEventListener('pointerleave',()=>{cancelAnimationFrame(heroFrame);brandObject.style.transform=''});
document.querySelectorAll('.gallery-item').forEach(card=>{
 let frame=0;
 card.addEventListener('pointermove',e=>{
  if(!desktopMotion.matches||reducedMotion.matches)return;
  const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{card.style.transform=`perspective(1000px) rotateX(${(.5-y)*5}deg) rotateY(${(x-.5)*6}deg)`});
 });
 card.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);card.style.transform=''});
});

// Scorrimento delle recensioni: touch, tastiera e pulsanti desktop.
const reviewTrack=document.getElementById('review-track');
const reviewButtons=[...document.querySelectorAll('[data-review-direction]')];
function updateReviewControls(){
 const max=Math.max(0,reviewTrack.scrollWidth-reviewTrack.clientWidth);
 reviewButtons.forEach(button=>button.disabled=Number(button.dataset.reviewDirection)<0?reviewTrack.scrollLeft<=2:reviewTrack.scrollLeft>=max-2);
}
function moveReview(direction){
 const first=reviewTrack.querySelector('.review-card');
 const distance=first.getBoundingClientRect().width+parseFloat(getComputedStyle(reviewTrack).gap||0);
 reviewTrack.scrollBy({left:direction*distance,behavior:reducedMotion.matches?'instant':'smooth'});
}
reviewButtons.forEach(button=>button.addEventListener('click',()=>moveReview(Number(button.dataset.reviewDirection))));
reviewTrack.addEventListener('keydown',event=>{if(event.target!==reviewTrack)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveReview(event.key==='ArrowRight'?1:-1)}});
reviewTrack.addEventListener('scroll',updateReviewControls,{passive:true});
window.addEventListener('resize',updateReviewControls,{passive:true});
updateReviewControls();

// Dissolvenza automatica; nessun controllo manuale nella copertina.
const heroSlides=[...document.querySelectorAll('.hero-slide')];
let heroSlideIndex=0,heroTimer=null,carouselInView=true;
function showHeroSlide(index){
 heroSlideIndex=(index+heroSlides.length)%heroSlides.length;
 heroSlides.forEach((slide,i)=>slide.classList.toggle('is-active',i===heroSlideIndex));
}
function syncHeroCarousel(){
 clearInterval(heroTimer);heroTimer=null;
 if(!reducedMotion.matches&&carouselInView&&!document.hidden)heroTimer=setInterval(()=>showHeroSlide(heroSlideIndex+1),6000);
}
reducedMotion.addEventListener('change',syncHeroCarousel);
document.addEventListener('visibilitychange',syncHeroCarousel);
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{carouselInView=entries[0].isIntersecting;syncHeroCarousel()},{threshold:0}).observe(hero);
syncHeroCarousel();
