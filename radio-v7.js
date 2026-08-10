(()=>{
'use strict';
const T=window.TM,e=T.el;
const ROOM='tommart-radio-013b88770c4c666505cac664ed9d43d8-v7';
const TOPIC='https://ntfy.sh/'+ROOM;
const SSE=TOPIC+'/sse?since=15s';
const BOOT=Date.now();
const now=()=>Date.now();

function persistentId(){
  try{
    let id=localStorage.getItem('tommart_listener_id_v7');
    if(!id){id=(crypto.randomUUID?crypto.randomUUID():'u-'+Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem('tommart_listener_id_v7',id)}
    return id;
  }catch(_){return 'u-'+Math.random().toString(36).slice(2)+Date.now().toString(36)}
}

let publishQueue=Promise.resolve();
function publish(msg){
  const packet={...msg,room:ROOM,ts:now()};
  const send=()=>fetch(TOPIC,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8','Cache-Control':'no-cache'},body:JSON.stringify(packet),cache:'no-store',keepalive:true});
  publishQueue=publishQueue.then(async()=>{
    try{const r=await send();if(!r.ok)throw Error('HTTP '+r.status);return true}
    catch(_){await new Promise(r=>setTimeout(r,650));try{const r=await send();return r.ok}catch(__){return false}}
  });
  return publishQueue;
}

function createBus(handler,statusCb){
  let es=null,closed=false,retryTimer=null,lastEvent=0,lastOpen=0;
  const notify=ok=>{try{statusCb&&statusCb(ok)}catch(_){}};
  function closeSource(){if(es){try{es.close()}catch(_){}es=null}}
  function open(force=false){
    if(closed)return;
    if(es&&!force)return;
    clearTimeout(retryTimer);closeSource();
    try{
      es=new EventSource(SSE);
      es.onopen=()=>{lastOpen=now();lastEvent=now();notify(true)};
      es.onmessage=ev=>{
        lastEvent=now();
        try{
          const outer=JSON.parse(ev.data);
          if(outer.event!=='message'||!outer.message)return;
          const m=JSON.parse(outer.message);
          if(m.room!==ROOM||!m.ts||m.ts<BOOT-20000)return;
          handler(m);
        }catch(_){}
      };
      es.onerror=()=>{notify(false);closeSource();retryTimer=setTimeout(()=>open(true),2200)};
    }catch(_){notify(false);retryTimer=setTimeout(()=>open(true),2200)}
  }
  function revive(){if(closed)return;const stale=!es||!lastOpen||(lastEvent&&now()-lastEvent>22000);if(stale)open(true)}
  open(true);
  const watchdog=setInterval(revive,7000);
  const onVisible=()=>{if(document.visibilityState==='visible')setTimeout(()=>open(true),180)};
  const onOnline=()=>setTimeout(()=>open(true),180);
  const onFocus=()=>setTimeout(()=>revive(),120);
  document.addEventListener('visibilitychange',onVisible);
  window.addEventListener('pageshow',onVisible);
  window.addEventListener('online',onOnline);
  window.addEventListener('focus',onFocus);
  return {
    restart:()=>open(true),
    close:()=>{closed=true;clearInterval(watchdog);clearTimeout(retryTimer);closeSource();document.removeEventListener('visibilitychange',onVisible);window.removeEventListener('pageshow',onVisible);window.removeEventListener('online',onOnline);window.removeEventListener('focus',onFocus)},
    age:()=>lastEvent?now()-lastEvent:Infinity
  };
}

T.ac=null;T.localKey='';T.playEpoch=0;
T.audioCtx=()=>{if(!T.ac){const A=window.AudioContext||window.webkitAudioContext;T.ac=new A}return T.ac};
T.unlock=async()=>{const c=T.audioCtx();if(c.state!=='running')try{await c.resume()}catch(_){}};
T.meter=(stream,cb)=>{const c=T.audioCtx(),src=c.createMediaStreamSource(stream),an=c.createAnalyser();an.fftSize=512;src.connect(an);const d=new Uint8Array(an.frequencyBinCount);let raf;const run=()=>{an.getByteFrequencyData(d);let s=0;for(const x of d)s+=x;cb(Math.min(1,(s/d.length)/100));raf=requestAnimationFrame(run)};run();return()=>{cancelAnimationFrame(raf);try{src.disconnect()}catch(_){}}};
T.srcFor=st=>st.segment==='track'?T.pathFor(T.TRACKS[st.track].file):st.segment==='radioJingle'?T.pathFor(T.RADIO_JINGLE.file):st.segment==='adJingle'?T.pathFor(T.AD_JINGLE.file):st.segment==='ad'?T.pathFor((T.ADS[st.ad]||T.ADS[0]).file):T.pathFor(T.TRACKS[0].file);
T.stateKey=st=>st?[st.segment,st.track??'',st.ad??'',st.nextTrack??''].join(':'):'none';
T.stopProgram=()=>{T.playEpoch++;try{e.music.onended=null;e.music.pause()}catch(_){}T.localKey=''};
T.setAudio=async(src,offset=0)=>{
  const abs=new URL(src,location.href).href;
  if(e.music.src!==abs)e.music.src=src;
  if(!e.music.duration||!Number.isFinite(e.music.duration))await new Promise(res=>{let done=false;const f=()=>{if(done)return;done=true;res()};e.music.addEventListener('loadedmetadata',f,{once:true});setTimeout(f,3200)});
  if(Number.isFinite(offset)&&offset>=0&&e.music.duration)try{e.music.currentTime=Math.min(offset,Math.max(0,e.music.duration-.08))}catch(_){}
  try{await e.music.play();return true}catch(_){return false}
};
T.nextStateAfter=st=>{
  if(st.segment==='track'){
    const next=(st.track+1)%T.TRACKS.length;
    if(T.adAfter(st.track)){const a=T.adIndexAfter(st.track);return{segment:'adJingle',ad:a,nextTrack:next,offset:0,dur:T.AD_JINGLE_DUR}}
    return{segment:'radioJingle',nextTrack:next,offset:0,dur:T.RADIO_JINGLE_DUR};
  }
  if(st.segment==='adJingle')return{segment:'ad',ad:st.ad,nextTrack:st.nextTrack,offset:0,dur:T.AD_DURS[st.ad]};
  if(st.segment==='ad')return{segment:'radioJingle',nextTrack:st.nextTrack,offset:0,dur:T.RADIO_JINGLE_DUR};
  if(st.segment==='radioJingle')return{segment:'track',track:st.nextTrack??0,offset:0,dur:T.TRACK_DURS[st.nextTrack??0]};
  return{segment:'track',track:0,offset:0,dur:T.TRACK_DURS[0]};
};
T.playState=async(st,opt={})=>{
  if(!st)return false;
  const key=T.stateKey(st),src=T.srcFor(st),abs=new URL(src,location.href).href,same=key===T.localKey&&e.music.src===abs&&!e.music.paused;
  T.ui('music',st,true);
  if(same&&!opt.force){
    const wanted=Number(st.offset)||0,diff=(e.music.currentTime||0)-wanted;
    if(Math.abs(diff)>0.45)try{e.music.currentTime=wanted}catch(_){}
    else if(Math.abs(diff)>0.16&&'playbackRate'in e.music){try{e.music.playbackRate=diff>0?0.985:1.015;setTimeout(()=>{try{e.music.playbackRate=1}catch(_){}},900)}catch(_){}}
    return true;
  }
  T.stopProgram();const epoch=T.playEpoch;T.localKey=key;
  const ok=await T.setAudio(src,Number(st.offset)||0);
  if(epoch!==T.playEpoch)return false;
  e.music.playbackRate=1;
  if(opt.autonext===false)e.music.onended=null;else e.music.onended=()=>{if(epoch!==T.playEpoch)return;T.playState(T.nextStateAfter(st),{force:true})};
  if(!ok)T.setStatus('warn','Нажми кнопку ещё раз, чтобы включить звук');else if(opt.status)T.setStatus('ok',opt.status);
  return ok;
};
T.playGlobalProgram=()=>T.playState(T.timelineState(),{force:true});
T.playOneShot=async st=>{T.stopProgram();const epoch=T.playEpoch;const ok=await T.setAudio(T.srcFor(st),Number(st.offset)||0);if(!ok)return false;await new Promise(res=>{let done=false;const finish=()=>{if(done)return;done=true;if(epoch===T.playEpoch){try{e.music.onended=null;e.music.pause()}catch(_){}}res()};e.music.onended=finish;setTimeout(finish,((st.dur||5)+1.25)*1000)});return true};

function setSyncLabel(text){const card=T.$('studioCard'),ps=T.$('peerState');if(card){const first=card.querySelector('.row span');if(first)first.textContent='TomMart Sync'}if(ps)ps.textContent=text}

async function bootListener(){
  const id=persistentId();let wanted=false,lastRevision=0,livePc=null,pendingIce=[],bus;
  function closeLive(){if(livePc){try{livePc.close()}catch(_){}livePc=null}pendingIce=[];try{e.live.pause()}catch(_){}e.live.srcObject=null}
  async function applyState(m){
    if(!wanted||m.to&&m.to!==id)return;
    const rev=Number(m.revision)||0;if(rev&&rev<lastRevision)return;if(rev)lastRevision=rev;
    if(m.mode==='live'){T.stopProgram();T.ui('live');T.setStatus('live','Подключаю прямой эфир…');return}
    if(m.mode!=='music'&&m.segment){
      closeLive();const st={segment:m.segment,track:m.track,ad:m.ad,nextTrack:m.nextTrack,dur:Number(m.dur)||5,offset:Number(m.position)||0};
      T.ui(m.mode,st,true);await T.playState(st,{force:true,autonext:false});
      T.setStatus('live',st.segment==='adJingle'?'Рекламный джингл…':st.segment==='ad'?'Реклама…':'Джингл TomMart…');return;
    }
    if(m.mode==='music'){
      closeLive();const st={segment:m.segment||'track',track:m.track,ad:m.ad,nextTrack:m.nextTrack,offset:Number(m.position)||0,dur:m.dur};
      const same=T.stateKey(st)===T.localKey;
      await T.playState(st,{force:!same,status:'TomMart играет • синхронизация онлайн'});
    }
  }
  async function handleOffer(m){
    if(!wanted||m.to!==id)return;closeLive();
    let servers;try{servers=await T.getIce()}catch(_){T.setStatus('warn','Не удалось обновить TURN для эфира');return}
    const pc=new RTCPeerConnection({iceServers:servers,sdpSemantics:'unified-plan',bundlePolicy:'max-bundle'});livePc=pc;
    pc.ontrack=async ev=>{const s=ev.streams?.[0]||new MediaStream([ev.track]);e.live.srcObject=s;try{await e.live.play();T.setStatus('live','Ты слушаешь прямой эфир TomMart')}catch(_){e.btnText.textContent='ВКЛЮЧИТЬ ЗВУК LIVE';T.setStatus('warn','Эфир подключён — нажми кнопку')}};
    pc.onicecandidate=ev=>{if(ev.candidate)publish({type:'ice',from:id,to:'admin',candidate:ev.candidate.toJSON?ev.candidate.toJSON():ev.candidate})};
    pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState))closeLive()};
    try{
      await pc.setRemoteDescription({type:'offer',sdp:m.sdp});
      for(const c of pendingIce.splice(0))try{await pc.addIceCandidate(c)}catch(_){}
      const ans=await pc.createAnswer();await pc.setLocalDescription(ans);
      await publish({type:'answer',from:id,to:'admin',sdp:pc.localDescription.sdp,revision:m.revision});
    }catch(_){T.setStatus('warn','Не удалось подключить микрофон')}
  }
  async function onMessage(m){
    if(m.type==='state')return applyState(m);
    if(m.type==='offer')return handleOffer(m);
    if(m.type==='ice'&&m.to===id&&m.candidate){if(livePc&&livePc.remoteDescription)try{await livePc.addIceCandidate(m.candidate)}catch(_){}else pendingIce.push(m.candidate);return}
    if(m.type==='close-live'&&m.to===id)closeLive();
  }
  bus=createBus(onMessage,ok=>{e.right.textContent=ok?'ONLINE':'СВЯЗЬ…';setSyncLabel(ok?'ONLINE':'RECONNECT');if(ok&&wanted){publish({type:'join',id});publish({type:'sync-request',id})}});
  e.btn.disabled=false;e.btnText.textContent='СЛУШАТЬ TOMMART';e.right.textContent='ГОТОВО';T.setStatus('ok','Радио готово • нажми слушать');
  e.btn.onclick=async()=>{wanted=true;e.btn.disabled=true;await T.unlock();if(e.live.srcObject&&e.live.paused){try{await e.live.play()}catch(_){}e.btn.disabled=false;return}await T.playGlobalProgram();await publish({type:'join',id});await publish({type:'sync-request',id});setTimeout(()=>e.btn.disabled=false,450)};
  setInterval(()=>{if(wanted)publish({type:'heartbeat',id})},9000);
  const revive=()=>{if(!wanted)return;bus.restart();setTimeout(()=>{publish({type:'join',id});publish({type:'sync-request',id})},450)};
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')revive()});window.addEventListener('pageshow',revive);window.addEventListener('online',revive);
  window.addEventListener('beforeunload',()=>{try{bus.close()}catch(_){}closeLive()});
}

async function bootAdmin(){
  T.$('pillText').textContent='STUDIO';T.$('kicker').textContent='MOBILE BROADCAST STUDIO';T.$('title').innerHTML='ТВОЙ<br><span>ЭФИР.</span>';
  T.$('lead').textContent='TomMart держит слушателей в одной позиции и сам восстанавливает связь после сна, блокировки экрана и перебоев сети.';
  T.$('disc').classList.add('hidden');T.$('micPanel').classList.remove('hidden');T.$('studioCard').classList.remove('hidden');T.$('playlistCard').classList.remove('hidden');T.$('note').classList.remove('hidden');T.$('leftLabel').textContent='СЛУШАТЕЛЕЙ';T.$('rightLabel').textContent='ЭФИР';e.left.textContent='0';e.right.textContent='OFF';
  const ms=T.$('micState'),mm=T.$('micMeter'),copy=T.$('copyBtn'),rows=T.$('playlistRows'),state=T.$('playlistState'),head=T.$('playlistCard').querySelector('.playlist-title span');if(head)head.textContent='УПРАВЛЕНИЕ РАДИО';setSyncLabel('CONNECTING');
  let mic,stopMeter,mode='music',busy=false,wake=null,anchorTrack=0,anchorWall=Date.now(),modeStartedWall=0,special=null,revision=Date.now(),manualAd=0,afterLiveTrack=0,bus;
  const listeners=new Map(),pcs=new Map(),pendingIce=new Map();
  const bump=()=>++revision;
  function stateAt(){return T.timelineState(anchorTrack,anchorWall,Date.now())}
  function positionOf(st){if(mode==='music')return Number(st.offset)||0;return Math.max(0,(Date.now()-modeStartedWall)/1000)}
  function count(){const n=Date.now();for(const [id,t] of listeners)if(n-t>30000)listeners.delete(id);e.left.textContent=listeners.size;return listeners.size}
  function payload(to){
    if(mode==='live')return{type:'state',to,mode:'live',revision,startedAt:modeStartedWall,position:0};
    if(mode!=='music'&&special)return{type:'state',to,mode,revision,startedAt:modeStartedWall,position:positionOf(special),...special};
    const s=stateAt();return{type:'state',to,mode:'music',revision,segment:s.segment,track:s.track,ad:s.ad,nextTrack:s.nextTrack,position:Number(s.offset)||0,dur:s.dur};
  }
  const broadcast=()=>publish(payload());
  function closePc(id){const pc=pcs.get(id);if(pc){try{pc.close()}catch(_){}pcs.delete(id)}pendingIce.delete(id)}
  async function offerTo(id){
    if(!mic||mode!=='live')return;closePc(id);
    let servers;try{servers=await T.getIce()}catch(_){return}
    const pc=new RTCPeerConnection({iceServers:servers,sdpSemantics:'unified-plan',bundlePolicy:'max-bundle'});pcs.set(id,pc);pendingIce.set(id,[]);mic.getTracks().forEach(t=>pc.addTrack(t,mic));
    pc.onicecandidate=ev=>{if(ev.candidate)publish({type:'ice',from:'admin',to:id,candidate:ev.candidate.toJSON?ev.candidate.toJSON():ev.candidate})};
    pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState))closePc(id)};
    try{const off=await pc.createOffer();await pc.setLocalDescription(off);await publish({type:'offer',from:'admin',to:id,sdp:pc.localDescription.sdp,revision})}catch(_){}
  }
  async function onMessage(m){
    if(m.type==='join'||m.type==='heartbeat'){listeners.set(m.id,Date.now());count();if(m.type==='join'){await publish(payload(m.id));if(mode==='live'&&mic)setTimeout(()=>offerTo(m.id),300)}return}
    if(m.type==='sync-request'){listeners.set(m.id,Date.now());count();await publish(payload(m.id));if(mode==='live'&&mic)setTimeout(()=>offerTo(m.id),250);return}
    if(m.type==='answer'&&m.to==='admin'){
      const pc=pcs.get(m.from);if(pc)try{await pc.setRemoteDescription({type:'answer',sdp:m.sdp});const q=pendingIce.get(m.from)||[];for(const c of q)try{await pc.addIceCandidate(c)}catch(_){}pendingIce.set(m.from,[])}catch(_){}return
    }
    if(m.type==='ice'&&m.to==='admin'&&m.candidate){const pc=pcs.get(m.from);if(pc&&pc.remoteDescription)try{await pc.addIceCandidate(m.candidate)}catch(_){}else{const q=pendingIce.get(m.from)||[];q.push(m.candidate);pendingIce.set(m.from,q)}return}
  }
  async function requestWake(){if(document.visibilityState!=='visible'||!('wakeLock'in navigator)||wake)return;try{wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>{wake=null})}catch(_){wake=null}}
  bus=createBus(onMessage,ok=>{setSyncLabel(ok?'ONLINE':'RECONNECT');T.setStatus(ok?'ok':'warn',ok?'Студия онлайн • синхронизация активна':'Восстанавливаю связь…');if(ok){broadcast();requestWake()}});
  function setSpecial(newMode,st){mode=newMode;modeStartedWall=Date.now();special={segment:st.segment,track:st.track,ad:st.ad,nextTrack:st.nextTrack,dur:st.dur};bump();draw();broadcast()}
  function setMusic(track){anchorTrack=track;anchorWall=Date.now();mode='music';modeStartedWall=0;special=null;bump();draw();broadcast()}
  function render(){
    const cp=stateAt(),info=T.titleFor(cp),next=T.nextTrackFrom(cp,anchorTrack),n=T.TRACKS[next];rows.innerHTML='';
    const r1=document.createElement('div');r1.className='track-row';r1.innerHTML='<div class="track-num">›</div><div class="track-info"><strong></strong><small></small></div><button class="track-play">СЛЕДУЮЩИЙ ТРЕК</button>';r1.querySelector('strong').textContent=info.title;r1.querySelector('small').textContent='ДАЛЬШЕ: '+n.title;const b1=r1.querySelector('button');b1.disabled=busy||mode!=='music';b1.onclick=skipNext;rows.appendChild(r1);
    const r2=document.createElement('div');r2.className='track-row';r2.innerHTML='<div class="track-num">AD</div><div class="track-info"><strong>Рекламный блок</strong><small>ДЖИНГЛ → РЕКЛАМА → ДЖИНГЛ → МУЗЫКА</small></div><button class="track-play">ВКЛЮЧИТЬ РЕКЛАМУ</button>';const b2=r2.querySelector('button');b2.disabled=busy||mode!=='music';b2.onclick=playAdNow;rows.appendChild(r2)
  }
  function draw(){const cp=stateAt();e.btn.disabled=busy;e.btn.classList.toggle('on',mode==='live');e.btnText.textContent=mode==='live'?'ЗАВЕРШИТЬ ЭФИР':busy?'ПОДОЖДИ…':'ВЫЙТИ В ЭФИР';e.right.textContent=mode==='live'?'ON AIR':mode==='music'?'OFF':special?.segment==='ad'||special?.segment==='adJingle'?'AD':'JINGLE';ms.textContent=mic?'ACTIVE':'OFF';T.ui(mode==='music'?'music':mode,special||cp);render();state.textContent=busy?'ВЫПОЛНЯЮ':mode==='live'?'ЭФИР':'SYNC'}
  const run=st=>T.playOneShot({...st,offset:0});
  async function skipNext(){if(busy||mode!=='music')return;const target=T.nextTrackFrom(stateAt(),anchorTrack);busy=true;setSpecial('switching',{segment:'radioJingle',nextTrack:target,dur:T.RADIO_JINGLE_DUR});T.setStatus('live','Радиоджингл • переключаю следующий трек…');await run({segment:'radioJingle',nextTrack:target,dur:T.RADIO_JINGLE_DUR});setMusic(target);busy=false;draw();broadcast();T.setStatus('ok','Сейчас играет: '+T.TRACKS[target].title)}
  async function playAdNow(){if(busy||mode!=='music')return;busy=true;const target=T.nextTrackFrom(stateAt(),anchorTrack),ad=manualAd++%T.ADS.length;setSpecial('manualAd',{segment:'adJingle',ad,nextTrack:target,dur:T.AD_JINGLE_DUR});await run({segment:'adJingle',ad,nextTrack:target,dur:T.AD_JINGLE_DUR});setSpecial('manualAd',{segment:'ad',ad,nextTrack:target,dur:T.AD_DURS[ad]});await run({segment:'ad',ad,nextTrack:target,dur:T.AD_DURS[ad]});setSpecial('manualAd',{segment:'radioJingle',nextTrack:target,dur:T.RADIO_JINGLE_DUR});await run({segment:'radioJingle',nextTrack:target,dur:T.RADIO_JINGLE_DUR});setMusic(target);busy=false;draw();broadcast();T.setStatus('ok','Реклама закончилась • '+T.TRACKS[target].title)}
  async function startAir(){
    if(busy||mode==='live')return;busy=true;afterLiveTrack=T.nextTrackFrom(stateAt(),anchorTrack);draw();T.setStatus('warn','Запрашиваю микрофон…');
    try{
      await T.unlock();mic=await navigator.mediaDevices.getUserMedia({video:false,audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});stopMeter=T.meter(mic,l=>mm.style.width=Math.max(3,Math.round(l*100))+'%');await requestWake();
      setSpecial('intro',{segment:'radioJingle',nextTrack:afterLiveTrack,dur:T.RADIO_JINGLE_DUR});await run({segment:'radioJingle',nextTrack:afterLiveTrack,dur:T.RADIO_JINGLE_DUR});mode='live';modeStartedWall=Date.now();special=null;bump();busy=false;draw();broadcast();for(const id of listeners.keys())offerTo(id);T.setStatus('live','ТЫ В ПРЯМОМ ЭФИРЕ');
    }catch(x){if(mic)mic.getTracks().forEach(t=>t.stop());mic=null;if(stopMeter)stopMeter();stopMeter=null;mm.style.width='3%';busy=false;setMusic(afterLiveTrack);T.setStatus('bad',x?.name==='NotAllowedError'?'Нет доступа к микрофону':'Не удалось включить микрофон')}
  }
  async function stopAir(){if(busy||mode!=='live')return;busy=true;for(const id of listeners.keys())publish({type:'close-live',to:id});for(const id of [...pcs.keys()])closePc(id);if(mic)mic.getTracks().forEach(t=>t.stop());mic=null;if(stopMeter)stopMeter();stopMeter=null;mm.style.width='3%';setSpecial('outro',{segment:'radioJingle',nextTrack:afterLiveTrack,dur:T.RADIO_JINGLE_DUR});await run({segment:'radioJingle',nextTrack:afterLiveTrack,dur:T.RADIO_JINGLE_DUR});setMusic(afterLiveTrack);busy=false;draw();broadcast();T.setStatus('ok','Музыка снова играет • студия готова')}
  e.btn.onclick=()=>mode==='live'?stopAir():startAir();
  copy.onclick=async()=>{let k='';try{k=localStorage.getItem('tommart_turn_key')||''}catch(_){}const u=new URL(location.origin+location.pathname.replace(/v7\.html$/,'v7.html'));if(k)u.searchParams.set('turn',k);try{await navigator.clipboard.writeText(u.toString());copy.textContent='СКОПИРОВАНО';setTimeout(()=>copy.textContent='КОПИРОВАТЬ',1500)}catch(_){}};
  setInterval(()=>{count();broadcast()},3000);
  setInterval(()=>publish({type:'admin-ping',revision}),10000);
  const revive=()=>{if(document.visibilityState!=='visible')return;bus.restart();requestWake();setTimeout(()=>{broadcast();for(const id of listeners.keys())if(mode==='live'&&mic)offerTo(id)},500)};
  document.addEventListener('visibilitychange',revive);window.addEventListener('pageshow',revive);window.addEventListener('online',revive);window.addEventListener('focus',revive);
  await requestWake();draw();
}

(async()=>{
  try{await T.loadDurations();if(T.IS_ADMIN){document.title='TomMart — Студия';await T.getIce();await bootAdmin()}else{await T.getIce();await bootListener()}}
  catch(err){console.error(err);e.btn.disabled=true;e.btnText.textContent=err.message==='TURN_KEY_MISSING'?'НУЖНА НАСТРОЙКА TURN':'ОШИБКА СВЯЗИ';T.setStatus('bad',err.message==='TURN_KEY_MISSING'?'Открой специальную ссылку TomMart для первого запуска':'Не удалось подготовить радио');e.right.textContent='ERROR'}
})();
})();
