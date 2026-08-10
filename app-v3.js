(async()=>{
'use strict';
const T=window.TM;
try{await T.loadDurations();const servers=await T.getIce();if(T.IS_ADMIN){document.title='TomMart — Студия';await T.bootAdmin(servers)}else await T.bootListener(servers)}catch(e){console.error(e);T.el.btn.disabled=true;T.el.btnText.textContent=e.message==='TURN_KEY_MISSING'?'НУЖНА НАСТРОЙКА TURN':'ОШИБКА СВЯЗИ';T.setStatus('bad',e.message==='TURN_KEY_MISSING'?'Открой специальную ссылку TomMart для первого запуска':'Не удалось подключить TURN');T.el.right.textContent='ERROR'}
})();
