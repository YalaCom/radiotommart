(()=>{
 const styles=['premium-v9.css?v=20260810-9','moldova-v10.css?v=20260810-10'];for(const href of styles){const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
 const files=['https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js','tm-config-v12.js?v=20260811-12','control-v13.js?v=20260811-131','audio-v13.js?v=20260811-131','listener-v13.js?v=20260811-131','admin-v13.js?v=20260811-131','premium-v9.js?v=20260810-9','moldova-v11.js?v=20260810-11','boot-v13.js?v=20260811-131'];let i=0;
 const next=()=>{if(i>=files.length)return;const s=document.createElement('script');s.src=files[i++];s.onload=next;s.onerror=()=>{console.error('TomMart v13 load error:',s.src);const t=document.getElementById('statusText');if(t)t.textContent='Ошибка загрузки v13. Обнови страницу.'};document.head.appendChild(s)};next();
})();
