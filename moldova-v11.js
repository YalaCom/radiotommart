(()=>{
'use strict';
const apply=()=>{
 const admin=new URLSearchParams(location.search).get('admin')==='1';
 document.body.classList.add('tm-moldova');document.body.classList.toggle('tm-admin',admin);
 const brand=document.querySelector('.brand');if(brand)brand.innerHTML='Tom<span>Mart</span>';
 const pill=document.getElementById('pillText');if(pill)pill.textContent=admin?'MOLDOVA STUDIO':'MOLDOVA LIVE';
 const kicker=document.getElementById('kicker');if(kicker)kicker.textContent=admin?'TOMMART • PREMIUM MOLDOVA STUDIO':'TOMMART • PREMIUM MOLDOVA RADIO';
 const title=document.getElementById('title');if(title)title.innerHTML=admin?'STUDIO<br><em>MOLDOVA • PREMIUM CONTROL</em>':'TOMMART<br><em>PREMIUM MOLDOVA RADIO</em>';
 const lead=document.getElementById('lead');if(lead)lead.textContent=admin?'Музыка, реклама и прямой эфир — управление TomMart в одном месте.':'Премиальное радио с характером Молдовы: музыка и живой эфир TomMart.';
 const left=document.getElementById('leftLabel');if(left&&!admin)left.textContent='СЕЙЧАС В ЭФИРЕ';
 const right=document.getElementById('rightLabel');if(right&&!admin)right.textContent='СТУДИЯ';
 const now=document.querySelector('.now small');if(now)now.textContent='NOW PLAYING • TOMMART MOLDOVA';
 const note=document.getElementById('note');if(note&&admin)note.textContent='TomMart Premium Moldova Studio • держи вкладку открытой во время прямого эфира.';
 document.title=admin?'TomMart — Premium Moldova Studio':'TomMart — Premium Moldova Radio';
};
apply();
window.addEventListener('tommart-ready',apply);
setTimeout(apply,2500);
})();