(()=>{
  const VERSION='20261005-2';
  for(const file of ['premium-v9.css','moldova-v10.css']){
    const l=document.createElement('link');
    l.rel='stylesheet';l.href=file+'?v='+VERSION;document.head.appendChild(l);
  }
  const fail=()=>{
    const t=document.getElementById('statusText'),b=document.getElementById('mainBtn'),bt=document.getElementById('mainBtnText');
    if(t)t.textContent='Не удалось загрузить радио. Проверь интернет и обнови страницу.';
    if(b){b.disabled=false;b.onclick=()=>location.reload();}
    if(bt)bt.textContent='ОБНОВИТЬ РАДИО';
  };
  const s=document.createElement('script');
  s.src='radio-v17.js?v='+VERSION;s.defer=true;s.onerror=fail;document.head.appendChild(s);
})();