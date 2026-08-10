(()=>{
'use strict';
const admin=new URLSearchParams(location.search).get('admin')==='1';
document.body.classList.toggle('tm-admin',admin);
const brand=document.querySelector('.brand');if(brand)brand.innerHTML='Tom<span>Mart</span>';
const pill=document.getElementById('pillText');if(pill)pill.textContent=admin?'PRIVATE STUDIO':'LIVE RADIO';
const kicker=document.getElementById('kicker');if(kicker)kicker.textContent=admin?'TOMMART • BROADCAST SUITE':'TOMMART • PREMIUM GOLD RADIO';
const title=document.getElementById('title');
const lead=document.getElementById('lead');
if(title){title.innerHTML=admin?'STUDIO<br><em>PREMIUM CONTROL</em>':'TOMMART<br><em>PREMIUM GOLD RADIO</em>'}
if(lead){lead.textContent=admin?'Управляй музыкой, рекламой и прямым эфиром из одной премиальной студии.':'Музыка, живой эфир и общение — в одном приватном пространстве TomMart.'}
const left=document.getElementById('leftLabel');if(left&&!admin)left.textContent='СЕЙЧАС В ЭФИРЕ';
const right=document.getElementById('rightLabel');if(right&&!admin)right.textContent='СТУДИЯ';
const now=document.querySelector('.now small');if(now)now.textContent='NOW PLAYING • TOMMART';
const chatTitle=document.querySelector('.tm-chat-title');if(chatTitle)chatTitle.textContent='TOMMART LISTENERS CLUB';
const note=document.getElementById('note');if(note&&admin)note.textContent='Premium Studio • держи вкладку открытой во время прямого эфира.';
document.title=admin?'TomMart — Premium Studio':'TomMart — Premium Gold Radio';
})();
