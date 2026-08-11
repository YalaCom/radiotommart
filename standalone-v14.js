(()=>{
'use strict';
const T=window.TM,e=T.el;
T.IS_ADMIN=false;
document.body.classList.remove('tm-admin');
document.body.classList.add('tm-moldova');

const q=new URLSearchParams(location.search);if(q.has('admin')||q.has('turn')){q.delete('admin');q.delete('turn');try{history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:''))}catch(_){}}

const brand=document.querySelector('.brand');if(brand)brand.innerHTML='Tom<span>Mart</span>';
const pill=T.$('pillText');if(pill)pill.textContent='MOLDOVA RADIO';
const kicker=T.$('kicker');if(kicker)kicker.textContent='TOMMART • PREMIUM MOLDOVA RADIO';
const title=T.$('title');if(title)title.innerHTML='TOMMART<br><em>PREMIUM MOLDOVA RADIO</em>';
const lead=T.$('lead');if(lead)lead.textContent='Один общий эфир для всех устройств. Музыка, джинглы и реклама идут по единой синхронной временной шкале.';
T.$('micPanel')?.classList.add('hidden');T.$('studioCard')?.classList.add('hidden');T.$('playlistCard')?.classList.add('hidden');T.$('note')?.classList.add('hidden');
T.$('leftLabel').textContent='СЕЙЧАС';T.$('rightLabel').textContent='СИНХРОНИЗАЦИЯ';e.left.textContent='ГОТОВО';e.right.textContent='ОБЩИЙ ЭФИР';
document.title='TomMart — Moldova Radio';

let started=false,clockOffset=0,currentKey='',syncing=false,lastHardSync=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const keyOf=st=>[st.segment,st.track??'',st.ad??'',st.nextTrack??''].join(':');
const srcOf=st=>st.segment==='track'?T.pathFor(T.TRACKS[st.track].file):st.segment==='radioJingle'?T.pathFor(T.RADIO_JINGLE.file):st.segment==='adJingle'?T.pathFor(T.AD_JINGLE.file):st.segment==='ad'?T.pathFor((T.ADS[st.ad]||T.ADS[0]).file):T.pathFor(T.TRACKS[0].file);
const radioNow=()=>Date.now()+clockOffset;

async function calibrateClock(){
 const vals=[];
 for(let i=0;i<4;i++){
  try{
   const t0=Date.now();const r=await fetch(location.pathname+'?clock='+Date.now()+'-'+i,{method:'HEAD',cache:'no-store'});const t1=Date.now();const d=r.headers.get('date');
   if(d){const server=Date.parse(d)+500;if(Number.isFinite(server))vals.push(server-((t0+t1)/2));}
  }catch(_){}
  await sleep(80);
 }
 if(vals.length){vals.sort((a,b)=>a-b);clockOffset=vals[Math.floor(vals.length/2)];}
}

async function waitMeta(a){
 if(Number.isFinite(a.duration)&&a.duration>0)return;
 await new Promise(res=>{let done=false;const f=()=>{if(done)return;done=true;res()};a.addEventListener('loadedmetadata',f,{once:true});a.addEventListener('error',f,{once:true});setTimeout(f,3500)});
}

function paint(st){
 T.ui('music',st,true);
 if(st.segment==='track')e.left.textContent='MUSIC';else if(st.segment==='ad'||st.segment==='adJingle')e.left.textContent='РЕКЛАМА';else e.left.textContent='JINGLE';
 e.right.textContent='SYNC';
}

async function syncNow(force=false){
 if(!started||syncing)return;
 syncing=true;
 try{
  const st=T.timelineState(0,T.GLOBAL_ANCHOR,radioNow());
  const key=keyOf(st),src=srcOf(st),abs=new URL(src,location.href).href;
  const changed=key!==currentKey||e.music.src!==abs;
  paint(st);
  if(changed){
   currentKey=key;
   try{e.music.pause()}catch(_){}
   e.music.src=src;
   e.music.load();
   await waitMeta(e.music);
   const max=Number.isFinite(e.music.duration)?Math.max(0,e.music.duration-.08):Number(st.dur)||9999;
   try{e.music.currentTime=Math.max(0,Math.min(Number(st.offset)||0,max))}catch(_){}
   try{e.music.playbackRate=1}catch(_){}
   try{await e.music.play();T.setStatus('ok','TomMart играет • синхронный эфир')}catch(_){T.setStatus('warn','Нажми СЛУШАТЬ TOMMART ещё раз')}
   lastHardSync=Date.now();
  }else if(!e.music.paused){
   const wanted=Number(st.offset)||0,diff=(e.music.currentTime||0)-wanted,ad=Math.abs(diff);
   if(force||ad>.42){try{e.music.currentTime=wanted;e.music.playbackRate=1;lastHardSync=Date.now()}catch(_){}}
   else if(ad>.09){try{e.music.playbackRate=diff>0?0.97:1.03;setTimeout(()=>{try{e.music.playbackRate=1}catch(_){}},900)}catch(_){}}
   else try{e.music.playbackRate=1}catch(_){}
  }else{
   try{await e.music.play()}catch(_){}
  }
 }finally{syncing=false}
}

async function start(){
 started=true;e.btn.disabled=true;e.btnText.textContent='ПОДКЛЮЧАЮ…';
 try{await calibrateClock()}catch(_){}
 await syncNow(true);
 e.btn.disabled=false;e.btnText.textContent='СЛУШАЮ TOMMART';
}

e.music.onended=()=>{if(!started)return;currentKey='';setTimeout(()=>syncNow(true),60)};
e.music.onerror=()=>{if(started){currentKey='';T.setStatus('warn','Переключаю на следующий элемент эфира…');setTimeout(()=>syncNow(true),700)}};
e.btn.disabled=false;e.btnText.textContent='СЛУШАТЬ TOMMART';e.btn.onclick=start;T.setStatus('ok','Радио готово • нажми слушать');

setInterval(()=>syncNow(false),2200);
setInterval(async()=>{await calibrateClock();syncNow(true)},60000);
const revive=()=>{if(!started)return;setTimeout(()=>syncNow(true),120)};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')revive()});window.addEventListener('pageshow',revive);window.addEventListener('focus',revive);window.addEventListener('online',revive);

(async()=>{try{T.setStatus('warn','Подготавливаю музыку…');await T.loadDurations();T.setStatus('ok','Радио готово • нажми слушать')}catch(err){console.error(err);T.setStatus('bad','Не удалось подготовить музыку')}})();
})();