(()=>{
  const styles=['premium-v9.css?v=20260810-9','moldova-v10.css?v=20260810-10'];
  for(const href of styles){const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
  const files=['tm-config.js?v=20260810-7','radio-v7.js?v=20260810-7','chat-v1.js?v=20260810-8','premium-v9.js?v=20260810-9','moldova-v10.js?v=20260810-10'];
  let i=0;
  const next=()=>{if(i>=files.length)return;const s=document.createElement('script');s.src=files[i++];s.onload=next;s.onerror=()=>{console.error('TomMart v10 load error:',s.src);const t=document.getElementById('statusText');if(t)t.textContent='Ошибка загрузки TomMart. Обнови страницу.'};document.head.appendChild(s)};
  next();
})();
