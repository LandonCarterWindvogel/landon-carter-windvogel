(() => {
  'use strict';
  const year=document.querySelector('[data-current-year]');
  if(year) year.textContent=String(new Date().getFullYear());

  const header=document.querySelector('[data-site-header]');
  const menuToggle=document.querySelector('.menu-toggle');
  const mobileMenu=document.querySelector('#mobile-menu');
  const form=document.querySelector('.contact-form');

  const onScroll=()=>header?.classList.toggle('is-scrolled',window.scrollY>24);
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});

  const setMenu=(open)=>{
    if(!mobileMenu||!menuToggle)return;
    mobileMenu.classList.toggle('open',open);
    mobileMenu.setAttribute('aria-hidden',String(!open));
    menuToggle.setAttribute('aria-expanded',String(open));
    menuToggle.setAttribute('aria-label',open?'Close menu':'Open menu');
    document.body.classList.toggle('menu-open',open);
    if(open) mobileMenu.querySelector('a')?.focus();
    else if(mobileMenu.contains(document.activeElement)) menuToggle.focus();
  };
  menuToggle?.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));
  mobileMenu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')setMenu(false)});

  const reveal=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
      });
    },{threshold:.08,rootMargin:'0px 0px -35px'});
    reveal.forEach((item)=>observer.observe(item));
  }else reveal.forEach((item)=>item.classList.add('is-visible'));

  document.querySelectorAll('.work-item img').forEach((img)=>{
    img.addEventListener('error',()=>img.closest('figure')?.classList.add('image-failed'),{once:true});
  });

  form?.addEventListener('submit',async(event)=>{
    event.preventDefault();
    const status=form.querySelector('.form-status');
    const submit=form.querySelector('button[type="submit"]');
    if(!status||!submit)return;
    status.textContent='Sending…';
    submit.disabled=true;
    try{
      const response=await fetch('/',{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams(new FormData(form)).toString()
      });
      if(!response.ok)throw new Error('Submission failed');
      form.reset();
      status.textContent='Sent. I’ll get back to you within a day or two.';
    }catch{
      status.textContent='Something went wrong. Please email me directly.';
    }finally{submit.disabled=false;}
  });
})();