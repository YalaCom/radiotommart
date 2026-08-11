(async()=>{
'use strict';
const T=window.TM,e=T.el;
try{await T.loadDurations();if(T.IS_ADMIN){document.title='TomMart — Studio v12';await T.bootAdminV12()}else await T.bootListenerV12()}
catch(err){console.error(err);e.btn.disabled=true;e.btnText.textContent='ОШИБКА ЗАПУСКА';T.setStatus('bad','Не удалось подготовить радио');e.right.textContent='ERROR'}
})();