(()=>{
'use strict';
const T=window.TM;
const e=T.el;
const M=window.TM13;

T.bootAdminV13=async()=>{
  T.$('pillText').textContent='STUDIO';
  T.$('kicker').textContent='MOBILE BROADCAST STUDIO';
  T.$('title').innerHTML='ТВОЙ<br><span>ЭФИР.</span>';
  T.$('lead').textContent='TomMart v13: админка — единственный хозяин музыки, рекламы и синхронизации.';
  T.$('disc').classList.add('hidden');
  T.$('micPanel').classList.remove('hidden');
  T.$('studioCard').classList.remove('hidden');
  T.$('playlistCard').classList.remove('hidden');
  T.$('note').classList.remove('hidden');
  T.$('leftLabel').textContent='СЛУШАТЕЛЕЙ';
  T.$('rightLabel').textContent='ЭФИР';
  e.left.textContent='0';
  e.right.textContent='OFF';

  const ms=T.$('micState');
  const mm=T.$('micMeter');
  const copy=T.$('copyBtn');
  const rows=T.$('playlistRows');
  const pstate=T.$('playlistState');
  const head=T.$('playlistCard').querySelector('.playlist-title span');
  if(head) head.textContent='УПРАВЛЕНИЕ РАДИО';
  M.setSyncLabel('CONNECTING');

  let link;
  let mic=null;
  let stopMeter=null;
  let wake=null;
  let busy=false;
  let hold=false;
  let mode='music';
  let sid=1;
  let rev=1;
  let segStart=performance.now();
  let seg={segment:'track',track:0,dur:T.TRACK_DURS[0]};
  let adCursor=0;
  let songsSinceAd=0;
  let songsSinceJ=0;
  let adPattern=0;
  let jPattern=0;
  let nextAdAt=3;
  let nextJAt=4;
  let bag=[];
  let liveNext=0;

  const listeners=new Map();
  const pcs=new Map();
  const pendingIce=new Map();

  function refillBag(exclude){
    bag=[];
    for(let i=0;i<T.TRACKS.length;i++) if(i!==exclude) bag.push(i);
    for(let i=bag.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [bag[i],bag[j]]=[bag[j],bag[i]];
    }
  }

  function takeNext(){
    const cur=Number.isInteger(seg.track)?seg.track:-1;
    if(!bag.length) refillBag(cur);
    let n=bag.pop();
    if(n===cur&&bag.length) n=bag.pop();
    return Number.isInteger(n)?n:(cur+1+T.TRACKS.length)%T.TRACKS.length;
  }

  function peekNext(){
    if(!bag.length) refillBag(Number.isInteger(seg.track)?seg.track:-1);
    return bag[bag.length-1]??0;
  }

  function elapsed(){
    return Math.max(0,(performance.now()-segStart)/1000);
  }

  function statePacket(){
    return {
      type:'state',v:13,rev,sid,mode,
      segment:mode==='live'?'live':seg.segment,
      track:seg.track,ad:seg.ad,nextTrack:seg.nextTrack,
      dur:mode==='live'?0:seg.dur,
      position:mode==='live'?0:elapsed(),
      sentAt:Date.now()
    };
  }

  function publishState(){
    if(link?.connected()) link.pub(M.TOPICS.state,statePacket(),{retain:true});
  }

  function setSeg(x){
    mode='music';
    seg=x;
    segStart=performance.now();
    sid++;
    rev++;
    draw();
    publishState();
  }

  function setTrack(i){
    setSeg({segment:'track',track:i,dur:T.TRACK_DURS[i]});
  }

  function setLive(){
    mode='live';
    segStart=performance.now();
    sid++;
    rev++;
    draw();
    publishState();
    for(const id of listeners.keys()) offerTo(id);
  }

  function nextAdTarget(){
    const p=[3,2,3,3,2];
    nextAdAt=p[adPattern++%p.length];
  }

  function nextJTarget(){
    const p=[4,3,4,3];
    nextJAt=p[jPattern++%p.length];
  }

  function naturalAdvance(overrun=0){
    const old=seg;
    if(old.segment==='track'){
      songsSinceAd++;
      songsSinceJ++;
      const next=takeNext();
      if(songsSinceAd>=nextAdAt){
        const ad=adCursor++%T.ADS.length;
        songsSinceAd=0;
        songsSinceJ=0;
        nextAdTarget();
        nextJTarget();
        setSeg({segment:'adJingle',ad,nextTrack:next,dur:T.AD_JINGLE_DUR});
      }else if(songsSinceJ>=nextJAt){
        songsSinceJ=0;
        nextJTarget();
        setSeg({segment:'radioJingle',nextTrack:next,dur:T.RADIO_JINGLE_DUR});
      }else{
        setTrack(next);
      }
    }else if(old.segment==='adJingle'){
      setSeg({segment:'ad',ad:old.ad,nextTrack:old.nextTrack,dur:T.AD_DURS[old.ad]});
    }else if(old.segment==='ad'){
      setTrack(old.nextTrack);
    }else if(old.segment==='radioJingle'){
      setTrack(old.nextTrack);
    }
    if(overrun>0&&mode!=='live'){
      segStart-=Math.min(overrun,Math.max(0,seg.dur-.1))*1000;
    }
  }

  function tick(){
    if(hold||mode==='live') return;
    let guard=0;
    while(elapsed()>=Number(seg.dur||9999)&&guard++<8){
      const over=elapsed()-Number(seg.dur||0);
      naturalAdvance(over);
    }
  }

  function closePc(id){
    const pc=pcs.get(id);
    if(pc){
      try{pc.close()}catch(_){}
      pcs.delete(id);
    }
    pendingIce.delete(id);
  }

  function count(){
    const n=Date.now();
    for(const [id,t] of listeners){
      if(n-t>20000){
        listeners.delete(id);
        closePc(id);
      }
    }
    e.left.textContent=listeners.size;
  }

  async function offerTo(id){
    if(!mic||mode!=='live'||!link?.connected()) return;
    closePc(id);
    let ice;
    try{
      ice=await T.getIce();
    }catch(_){
      T.setStatus('warn','TURN недоступен для LIVE');
      return;
    }
    const pc=new RTCPeerConnection({iceServers:ice,sdpSemantics:'unified-plan',bundlePolicy:'max-bundle'});
    pcs.set(id,pc);
    pendingIce.set(id,[]);
    mic.getTracks().forEach(t=>pc.addTrack(t,mic));
    pc.onicecandidate=ev=>{
      if(ev.candidate){
        link.pub(M.signal(id),{type:'ice',candidate:ev.candidate.toJSON?ev.candidate.toJSON():ev.candidate});
      }
    };
    pc.onconnectionstatechange=()=>{
      if(['failed','closed','disconnected'].includes(pc.connectionState)) closePc(id);
    };
    try{
      const off=await pc.createOffer();
      await pc.setLocalDescription(off);
      link.pub(M.signal(id),{type:'offer',sdp:pc.localDescription.sdp});
    }catch(_){}
  }

  async function onMessage(topic,m){
    if(topic===M.TOPICS.presence&&m.id){
      listeners.set(m.id,Date.now());
      count();
      if(m.type==='join'&&mode==='live'&&mic) setTimeout(()=>offerTo(m.id),180);
      return;
    }
    if(topic===M.TOPICS.ping&&m.id){
      listeners.set(m.id,Date.now());
      count();
      link.pub(M.pong(m.id),{type:'pong',t0:m.t0,state:statePacket()});
      return;
    }
    if(topic!==M.TOPICS.adminSignal) return;
    const id=m.from;
    if(!id) return;
    if(m.type==='answer'){
      const pc=pcs.get(id);
      if(pc){
        try{
          await pc.setRemoteDescription({type:'answer',sdp:m.sdp});
          const q=pendingIce.get(id)||[];
          for(const c of q){
            try{await pc.addIceCandidate(c)}catch(_){}
          }
          pendingIce.set(id,[]);
        }catch(_){}
      }
      return;
    }
    if(m.type==='ice'&&m.candidate){
      const pc=pcs.get(id);
      if(pc&&pc.remoteDescription){
        pc.addIceCandidate(m.candidate).catch(()=>{});
      }else{
        const q=pendingIce.get(id)||[];
        q.push(m.candidate);
        pendingIce.set(id,q);
      }
    }
  }

  link=M.connect('admin','admin',onMessage,ok=>{
    M.setSyncLabel(ok?'ONLINE':'RECONNECT');
    if(ok){
      T.setStatus('ok','Студия онлайн • MQTT синхронизация');
      publishState();
    }else if(!busy){
      T.setStatus('warn','Восстанавливаю связь со слушателями…');
    }
  });

  async function requestWake(){
    if(document.visibilityState!=='visible'||!('wakeLock'in navigator)||wake) return;
    try{
      wake=await navigator.wakeLock.request('screen');
      wake.addEventListener('release',()=>wake=null);
    }catch(_){wake=null}
  }

  function render(){
    const info=T.titleFor(seg);
    const n=T.TRACKS[peekNext()];
    rows.innerHTML='';
    const r1=document.createElement('div');
    r1.className='track-row';
    r1.innerHTML='<div class="track-num">↻</div><div class="track-info"><strong></strong><small></small></div><button class="track-play">СЛЕДУЮЩИЙ ТРЕК</button>';
    r1.querySelector('strong').textContent=mode==='live'?'ПРЯМОЙ ЭФИР':info.title;
    r1.querySelector('small').textContent='RANDOM NEXT: '+n.title;
    const b1=r1.querySelector('button');
    b1.disabled=busy||mode==='live';
    b1.onclick=skipNext;
    rows.appendChild(r1);

    const r2=document.createElement('div');
    r2.className='track-row';
    r2.innerHTML='<div class="track-num">AD</div><div class="track-info"><strong>Рекламный блок</strong><small>ДЖИНГЛ → 1 ИЗ 3 РЕКЛАМ → МУЗЫКА</small></div><button class="track-play">ВКЛЮЧИТЬ РЕКЛАМУ</button>';
    const b2=r2.querySelector('button');
    b2.disabled=busy||mode==='live';
    b2.onclick=playAdNow;
    rows.appendChild(r2);
  }

  function draw(){
    e.btn.disabled=busy;
    e.btn.classList.toggle('on',mode==='live');
    e.btnText.textContent=mode==='live'?'ЗАВЕРШИТЬ ЭФИР':busy?'ПОДОЖДИ…':'ВЫЙТИ В ЭФИР';
    e.right.textContent=mode==='live'?'ON AIR':seg.segment==='ad'||seg.segment==='adJingle'?'AD':seg.segment==='radioJingle'?'JINGLE':'OFF';
    ms.textContent=mic?'ACTIVE':'OFF';
    T.ui(mode==='live'?'live':'music',seg);
    render();
    pstate.textContent=busy?'ВЫПОЛНЯЮ':link?.connected()?'SYNC ONLINE':'RECONNECT';
  }

  async function skipNext(){
    if(busy||mode==='live') return;
    busy=true;
    draw();
    setTrack(takeNext());
    busy=false;
    draw();
    publishState();
    T.setStatus('ok','Трек переключён у всех слушателей');
  }

  async function playAdNow(){
    if(busy||mode==='live') return;
    busy=true;
    hold=true;
    draw();
    const next=takeNext();
    const ad=adCursor++%T.ADS.length;
    songsSinceAd=0;
    songsSinceJ=0;
    nextAdTarget();
    nextJTarget();
    setSeg({segment:'adJingle',ad,nextTrack:next,dur:T.AD_JINGLE_DUR});
    await T.playOneShot(seg);
    setSeg({segment:'ad',ad,nextTrack:next,dur:T.AD_DURS[ad]});
    await T.playOneShot(seg);
    setTrack(next);
    hold=false;
    busy=false;
    draw();
    publishState();
    T.setStatus('ok','Реклама закончилась • музыка синхронна');
  }

  async function startAir(){
    if(busy||mode==='live') return;
    busy=true;
    hold=true;
    liveNext=takeNext();
    draw();
    T.setStatus('warn','Запрашиваю микрофон…');
    try{
      await T.unlock();
      await T.getIce();
      mic=await navigator.mediaDevices.getUserMedia({video:false,audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});
      stopMeter=T.meter(mic,l=>mm.style.width=Math.max(3,Math.round(l*100))+'%');
      await requestWake();
      setSeg({segment:'radioJingle',nextTrack:liveNext,dur:T.RADIO_JINGLE_DUR});
      await T.playOneShot(seg);
      setLive();
      hold=false;
      busy=false;
      draw();
      T.setStatus('live','ТЫ В ПРЯМОМ ЭФИРЕ');
    }catch(x){
      if(mic) mic.getTracks().forEach(t=>t.stop());
      mic=null;
      if(stopMeter) stopMeter();
      stopMeter=null;
      mm.style.width='3%';
      setTrack(liveNext);
      hold=false;
      busy=false;
      draw();
      T.setStatus('bad',x?.name==='NotAllowedError'?'Нет доступа к микрофону':x?.message==='TURN_KEY_MISSING'?'Нужна ссылка с TURN':'Не удалось включить эфир');
    }
  }

  async function stopAir(){
    if(busy||mode!=='live') return;
    busy=true;
    hold=true;
    for(const id of listeners.keys()) link.pub(M.signal(id),{type:'close'});
    for(const id of [...pcs.keys()]) closePc(id);
    if(mic) mic.getTracks().forEach(t=>t.stop());
    mic=null;
    if(stopMeter) stopMeter();
    stopMeter=null;
    mm.style.width='3%';
    setSeg({segment:'radioJingle',nextTrack:liveNext,dur:T.RADIO_JINGLE_DUR});
    await T.playOneShot(seg);
    setTrack(liveNext);
    hold=false;
    busy=false;
    draw();
    T.setStatus('ok','Музыка снова играет у всех');
  }

  e.btn.onclick=()=>mode==='live'?stopAir():startAir();

  copy.onclick=async()=>{
    let k='';
    try{k=localStorage.getItem('tommart_turn_key')||''}catch(_){}
    const u=new URL(location.origin+location.pathname.replace(/v13\.html$/,'v13.html'));
    if(k) u.searchParams.set('turn',k);
    try{
      await navigator.clipboard.writeText(u.toString());
      copy.textContent='СКОПИРОВАНО';
      setTimeout(()=>copy.textContent='КОПИРОВАТЬ',1400);
    }catch(_){}
  };

  setInterval(tick,220);
  setInterval(publishState,800);
  setInterval(()=>{count();draw()},1800);

  const revive=()=>{
    if(document.visibilityState!=='visible') return;
    requestWake();
    setTimeout(()=>{tick();publishState()},200);
  };
  document.addEventListener('visibilitychange',revive);
  window.addEventListener('pageshow',revive);
  window.addEventListener('online',revive);
  window.addEventListener('focus',revive);

  await requestWake();
  refillBag(0);
  draw();
  publishState();
};
})();
