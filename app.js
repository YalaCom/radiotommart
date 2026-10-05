(()=>{
  const VERSION='20261005-1';
  const styles=['premium-v9.css','moldova-v10.css'];
  for(const file of styles){
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href=file+'?v='+VERSION;
    document.head.appendChild(l);
  }

  const setBootError=()=>{
    const t=document.getElementById('statusText');
    const b=document.getElementById('mainBtn');
    const bt=document.getElementById('mainBtnText');
    if(t)t.textContent='Не удалось загрузить радио. Обнови страницу.';
    if(b)b.disabled=false;
    if(bt)bt.textContent='ОБНОВИТЬ СТРАНИЦУ';
    if(b)b.onclick=()=>location.reload();
  };

  window.addEventListener('error',e=>{
    if(String(e?.message||'').includes('radio-v18'))setBootError();
  });

  const s=document.createElement('script');
  s.src='radio-v18.js?v='+VERSION;
  s.defer=true;
  s.onerror=setBootError;
  document.head.appendChild(s);
})();