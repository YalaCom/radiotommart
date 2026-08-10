(()=>{
'use strict';
const admin=new URLSearchParams(location.search).get('admin')==='1';
document.body.classList.add('tm-moldova');
const pill=document.getElementById('pillText');if(pill)pill.textContent=admin?'MOLDOVA STUDIO':'MOLDOVA LIVE';
const kicker=document.getElementById('kicker');if(kicker)kicker.textContent=admin?'TOMMART • PREMIUM MOLDOVA STUDIO':'TOMMART • PREMIUM MOLDOVA RADIO';
const title=document.getElementById('title');
const lead=document.getElementById('lead');
if(title)title.innerHTML=admin?'STUDIO<br><em>MOLDOVA • PREMIUM CONTROL</em>':'TOMMART<br><em>PREMIUM MOLDOVA RADIO</em>';
if(lead)lead.textContent=admin?'Премиальная студия TomMart с молдавским характером — музыка, реклама и прямой эфир в одном месте.':'Премиальное радио с характером Молдовы: музыка, живой эфир и чат слушателей.';
const now=document.querySelector('.now small');if(now)now.textContent='NOW PLAYING • TOMMART MOLDOVA';
const chatTitle=document.querySelector('.tm-chat-title');if(chatTitle)chatTitle.textContent='TOMMART • MOLDOVA LISTENERS CLUB';
const note=document.getElementById('note');if(note&&admin)note.textContent='TomMart Premium Moldova Studio • не закрывай вкладку во время прямого эфира.';
document.title=admin?'TomMart — Premium Moldova Studio':'TomMart — Premium Moldova Radio';
})();
