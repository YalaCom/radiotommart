(async()=>{
'use strict';
const T=window.TM,e=T.el;
try{
 await T.loadDurations();
 if(T.IS_ADMIN){document.title='TomMart — Студия';await T.bootAdminV11()}
 else await T.bootListenerV11();
}catch(err){
 console.error(err);e.btn.disabled=true;e.btnText.textContent='ОШИБКА ЗАПУСКА';T.setStatus('bad','Не удалось подготовить радио');e.right.textContent='ERROR';
}
})();