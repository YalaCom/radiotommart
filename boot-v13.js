(async()=>{
'use strict';
const T=window.TM,e=T.el;
try{await T.loadDurations();if(T.IS_ADMIN)await T.bootAdminV13();else await T.bootListenerV13()}catch(err){console.error(err);e.btn.disabled=true;e.btnText.textContent='ОШИБКА ЗАПУСКА';T.setStatus('bad','Не удалось подготовить TomMart v13');e.right.textContent='ERROR'}
})();
