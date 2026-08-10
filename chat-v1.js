(()=>{
'use strict';
const IS_ADMIN=new URLSearchParams(location.search).get('admin')==='1';
const TOPIC_NAME='tommart-chat-f96c7a13e7444b7ab6f30d2a-v1';
const TOPIC='https://ntfy.sh/'+TOPIC_NAME;
const SSE=TOPIC+'/sse?since=30s';
const HISTORY=TOPIC+'/json?poll=1&since=12h';
const NAME_KEY='tommart_chat_name_v1';
const ID_KEY='tommart_chat_client_v1';
const MAX_NAME=18,MAX_MSG=300;
const seen=new Set(),online=new Map();
let source=null,retryTimer=null,lastSend=0;

const escId=()=>{try{let x=localStorage.getItem(ID_KEY);if(!x){x=(crypto.randomUUID?crypto.randomUUID():'u-'+Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem(ID_KEY,x)}return x}catch(_){return 'u-'+Math.random().toString(36).slice(2)+Date.now().toString(36)}};
const clientId=escId();
const getName=()=>IS_ADMIN?'TOMMART • ВЕДУЩИЙ':(()=>{try{return (localStorage.getItem(NAME_KEY)||'').trim().slice(0,MAX_NAME)}catch(_){return''}})();
const saveName=n=>{try{localStorage.setItem(NAME_KEY,n)}catch(_){}};
const shortTime=ts=>new Date(ts||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});

function addStyles(){
 const s=document.createElement('style');s.textContent=`
 .tm-chat{margin-top:12px;border:1px solid var(--line);background:var(--panel);border-radius:22px;overflow:hidden}
 .tm-chat-head{display:flex;align-items:center;justify-content:space-between;padding:15px 16px 12px;border-bottom:1px solid #ffffff10}
 .tm-chat-title{font-size:10px;font-weight:950;letter-spacing:.16em;color:#c8cfdb}.tm-chat-online{font-size:9px;font-weight:900;color:#43d17d;letter-spacing:.09em}
 .tm-chat-messages{height:250px;overflow:auto;padding:13px 13px 7px;display:flex;flex-direction:column;gap:9px;scroll-behavior:smooth}
 .tm-chat-empty{margin:auto;text-align:center;color:#69758b;font-size:11px;line-height:1.45;padding:28px}
 .tm-msg{max-width:88%;padding:10px 12px;border:1px solid #ffffff10;border-radius:15px;background:#ffffff09;align-self:flex-start}
 .tm-msg.mine{align-self:flex-end;background:#0046a828;border-color:#2475d74d}.tm-msg.host{background:#ffd20016;border-color:#ffd20055}
 .tm-msg-top{display:flex;align-items:center;gap:8px;margin-bottom:5px}.tm-msg-name{font-size:10px;font-weight:950;color:#eef2f8;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tm-msg.host .tm-msg-name{color:var(--y)}.tm-msg-time{font-size:8px;color:#68758b}
 .tm-msg-text{font-size:13px;line-height:1.35;color:#eef1f6;word-break:break-word;white-space:pre-wrap}
 .tm-chat-who{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 13px;border-top:1px solid #ffffff0c;color:#7f8ba0;font-size:10px}.tm-chat-name{border:0;background:none;color:var(--y);font-weight:900;font-size:10px;padding:5px;cursor:pointer}
 .tm-chat-form{display:flex;gap:8px;padding:0 12px 12px}.tm-chat-input{flex:1;min-width:0;border:1px solid #ffffff18;background:#050a14;color:#fff;border-radius:14px;padding:12px 13px;font:inherit;font-size:13px;outline:none}.tm-chat-input:focus{border-color:#ffd20066}.tm-chat-send{border:0;border-radius:14px;background:var(--y);color:#07101f;font-size:10px;font-weight:950;padding:0 14px;letter-spacing:.05em}.tm-chat-send:disabled{opacity:.45}
 .tm-chat-modal{position:fixed;inset:0;z-index:1000;background:#02050bd9;display:grid;place-items:center;padding:20px}.tm-chat-modal.hidden{display:none}.tm-chat-modal-card{width:min(100%,390px);border:1px solid #ffffff18;border-radius:24px;background:#0c1425;padding:22px;box-shadow:0 30px 90px #000b}.tm-chat-modal-card h3{margin:0;font-size:22px}.tm-chat-modal-card p{color:#8f9aaf;font-size:12px;line-height:1.45}.tm-chat-name-input{width:100%;border:1px solid #ffffff20;background:#050a14;color:#fff;border-radius:14px;padding:13px;font:inherit;outline:none}.tm-chat-modal-actions{display:flex;gap:8px;margin-top:12px}.tm-chat-modal-actions button{flex:1;border:0;border-radius:13px;padding:12px;font-weight:900}.tm-chat-save{background:var(--y);color:#08111f}.tm-chat-cancel{background:#ffffff0d;color:#fff}
 @media(max-width:390px){.tm-chat-messages{height:230px}.tm-chat-form{padding-left:10px;padding-right:10px}.tm-chat-send{padding:0 11px}}
 `;document.head.appendChild(s);
}

function build(){
 const host=document.querySelector('main.app');if(!host)return;
 const card=document.createElement('section');card.className='tm-chat';card.id='tmChat';card.innerHTML=`
  <div class="tm-chat-head"><div class="tm-chat-title">ЧАТ СЛУШАТЕЛЕЙ</div><div class="tm-chat-online" id="tmChatOnline">0 ONLINE</div></div>
  <div class="tm-chat-messages" id="tmChatMessages"><div class="tm-chat-empty" id="tmChatEmpty">Здесь можно общаться во время эфира.<br>Напиши первое сообщение.</div></div>
  <div class="tm-chat-who"><span id="tmChatStatus">ЧАТ ПОДКЛЮЧАЕТСЯ…</span><button class="tm-chat-name" id="tmChatName" type="button"></button></div>
  <form class="tm-chat-form" id="tmChatForm"><input class="tm-chat-input" id="tmChatInput" maxlength="${MAX_MSG}" autocomplete="off" placeholder="Сообщение…"><button class="tm-chat-send" id="tmChatSend" type="submit">ОТПРАВИТЬ</button></form>`;
 const note=document.getElementById('note');host.insertBefore(card,note||null);
 const modal=document.createElement('div');modal.className='tm-chat-modal hidden';modal.id='tmChatModal';modal.innerHTML=`<div class="tm-chat-modal-card"><h3>Твоё имя в чате</h3><p>Его будут видеть остальные слушатели TomMart.</p><input class="tm-chat-name-input" id="tmChatNameInput" maxlength="${MAX_NAME}" placeholder="Например: Женя"><div class="tm-chat-modal-actions"><button class="tm-chat-cancel" id="tmChatCancel" type="button">ОТМЕНА</button><button class="tm-chat-save" id="tmChatSave" type="button">СОХРАНИТЬ</button></div></div>`;document.body.appendChild(modal);
}

const $=id=>document.getElementById(id);
function updateName(){const n=getName();$('tmChatName').textContent=IS_ADMIN?'TOMMART • ВЕДУЩИЙ':n?('ИМЯ: '+n):'ВЫБРАТЬ ИМЯ'}
function openName(){if(IS_ADMIN)return;const m=$('tmChatModal'),i=$('tmChatNameInput');i.value=getName();m.classList.remove('hidden');setTimeout(()=>i.focus(),80)}
function closeName(){$('tmChatModal').classList.add('hidden')}
function commitName(){const n=$('tmChatNameInput').value.trim().replace(/\s+/g,' ').slice(0,MAX_NAME);if(!n)return;$('tmChatNameInput').value=n;saveName(n);updateName();closeName();$('tmChatInput').focus();presence()}

function renderMessage(p,ntfyId){
 if(!p||p.kind!=='chat'||!p.text||!p.name)return;
 const id=p.id||ntfyId||'';if(id&&seen.has(id))return;if(id)seen.add(id);
 const empty=$('tmChatEmpty');if(empty)empty.remove();
 const box=document.createElement('div');box.className='tm-msg'+(p.client===clientId?' mine':'')+(p.host?' host':'');
 const top=document.createElement('div');top.className='tm-msg-top';
 const name=document.createElement('div');name.className='tm-msg-name';name.textContent=p.host?'TOMMART • ВЕДУЩИЙ':String(p.name).slice(0,MAX_NAME);
 const time=document.createElement('div');time.className='tm-msg-time';time.textContent=shortTime(p.ts);
 const text=document.createElement('div');text.className='tm-msg-text';text.textContent=String(p.text).slice(0,MAX_MSG);
 top.append(name,time);box.append(top,text);$('tmChatMessages').appendChild(box);
 const list=$('tmChatMessages');list.scrollTop=list.scrollHeight;
}

function parseOuter(o){if(!o||o.event!=='message'||!o.message)return;try{return JSON.parse(o.message)}catch(_){return null}}
async function loadHistory(){
 try{const r=await fetch(HISTORY,{cache:'no-store'});if(!r.ok)return;const lines=(await r.text()).split('\n').filter(Boolean);for(const line of lines){try{const o=JSON.parse(line),p=parseOuter(o);if(p?.kind==='chat')renderMessage(p,o.id)}catch(_){}}}catch(_){}
}

async function publishPacket(packet,cache=true){
 try{const r=await fetch(TOPIC,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8','Cache':cache?'yes':'no'},body:JSON.stringify(packet),cache:'no-store',keepalive:true});return r.ok}catch(_){return false}
}
function presence(){const n=getName();return publishPacket({kind:'presence',client:clientId,name:n||'Слушатель',host:IS_ADMIN,ts:Date.now()},false)}
function markOnline(p){if(!p?.client)return;online.set(p.client,{ts:Date.now(),host:!!p.host});updateOnline()}
function updateOnline(){const n=Date.now();for(const [id,v] of online)if(n-v.ts>23000)online.delete(id);$('tmChatOnline').textContent=online.size+' ONLINE'}

function connect(){
 clearTimeout(retryTimer);if(source)try{source.close()}catch(_){}
 $('tmChatStatus').textContent='ЧАТ ПОДКЛЮЧАЕТСЯ…';
 try{
  source=new EventSource(SSE);
  source.onopen=()=>{$('tmChatStatus').textContent='ЧАТ ONLINE';presence()};
  source.onmessage=e=>{try{const o=JSON.parse(e.data),p=parseOuter(o);if(!p)return;if(p.kind==='chat')renderMessage(p,o.id);else if(p.kind==='presence')markOnline(p)}catch(_){}};
  source.onerror=()=>{$('tmChatStatus').textContent='ПЕРЕПОДКЛЮЧАЮ ЧАТ…';try{source.close()}catch(_){}retryTimer=setTimeout(connect,2200)};
 }catch(_){retryTimer=setTimeout(connect,2200)}
}

async function sendMessage(){
 const input=$('tmChatInput'),text=input.value.trim();if(!text)return;
 let name=getName();if(!name&&!IS_ADMIN){openName();return}
 const now=Date.now();if(now-lastSend<700)return;lastSend=now;
 const btn=$('tmChatSend');btn.disabled=true;
 const p={kind:'chat',id:clientId+'-'+now,client:clientId,name:IS_ADMIN?'TOMMART • ВЕДУЩИЙ':name,host:IS_ADMIN,text:text.slice(0,MAX_MSG),ts:now};
 const ok=await publishPacket(p,true);if(ok){input.value='';renderMessage(p,p.id);$('tmChatStatus').textContent='ЧАТ ONLINE'}else $('tmChatStatus').textContent='НЕ УДАЛОСЬ ОТПРАВИТЬ';
 setTimeout(()=>btn.disabled=false,350);
}

function start(){
 addStyles();build();updateName();
 $('tmChatName').onclick=openName;$('tmChatCancel').onclick=closeName;$('tmChatSave').onclick=commitName;$('tmChatNameInput').addEventListener('keydown',e=>{if(e.key==='Enter')commitName()});
 $('tmChatModal').addEventListener('click',e=>{if(e.target===$('tmChatModal'))closeName()});
 $('tmChatInput').addEventListener('focus',()=>{if(!IS_ADMIN&&!getName())openName()});
 $('tmChatForm').addEventListener('submit',e=>{e.preventDefault();sendMessage()});
 loadHistory().finally(connect);presence();setInterval(presence,8000);setInterval(updateOnline,5000);
 const revive=()=>{connect();presence()};document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')revive()});window.addEventListener('online',revive);window.addEventListener('pageshow',revive);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();