(()=>{
'use strict';
const T=window.TM=window.TM||{};
T.CFG={host:'tommart-moldova-studio-91c4e2d7a8',metered:'tommart-radio.metered.live',region:'europe',reconnect:2500,adEvery:4};
T.TRACKS=[
 {file:'%d0%9c%d0%be%d0%bb%d0%b4%d0%b0%d0%b2%d1%81%d0%ba%d0%b0%d1%8f%20-%20%d0%9c%d0%be%d0%bb%d0%b4%d0%b0%d0%b2%d1%81%d0%ba%d0%b0%d1%8f.mp3.mp3',title:'Молдавская — Молдавская'},
 {file:'Kleopatra_Stratan_-_Ghi_Gicu_(musportal.org).mp3',title:'Cleopatra Stratan — Ghi Gicu'},
 {file:'Akmal_Grigorijj_Leps_-_SHutka_80838502.mp3',title:'Akmal’ & Григорий Лепс — Шутка'},
 {file:'Grigorijj_Leps_Andrejj_Davinchi_-_Zanovo_nachat_79421060.mp3',title:'Григорий Лепс & Андрей Davinchi — Заново начать'},
 {file:'Leonid_Agutin_DJ_DANI_WOO_-_Ostrov_78425583.mp3',title:'Леонид Агутин & DJ DANI WOO — Остров'},
 {file:'ace-of-base-beautiful-life.mp3',title:'Ace of Base — Beautiful Life'},
 {file:'elton-john-dua-lipa-cold-heart-pnau-remix.mp3',title:'Elton John & Dua Lipa — Cold Heart'},
 {file:'luis-fonsi-feat.-daddy-yankee-despacito.mp3',title:'Luis Fonsi feat. Daddy Yankee — Despacito'},
 {file:'madcon-beggin.mp3',title:'Madcon — Beggin'},
 {file:'nico-vinz-am-i-wrong.mp3',title:'Nico & Vinz — Am I Wrong'},
 {file:'the-weeknd-blinding-lights.mp3',title:'The Weeknd — Blinding Lights'}
];
T.RADIO_JINGLE={file:'gemini_generated_video_5EC56A5E 2.mp3',title:'TomMart Radio Jingle'};
T.AD_JINGLE={file:'gemini_music_[cut_6sec].mp3',title:'TomMart — реклама'};
T.ADS=[
 {file:'ae6bf76f_-2000108951_1786361749_fc88336ec2613f77119364255812d4c5 (mp3cut.net).mp3',title:'Реклама TomMart 1'},
 {file:'14e75fcb_-2000108951_1786363277_2b854cbe448c07c9e0df74898841a74b.mp3',title:'Реклама TomMart 2'}
];
T.GLOBAL_ANCHOR=Date.UTC(2026,0,1,0,0,0);
T.IS_ADMIN=new URLSearchParams(location.search).get('admin')==='1';
T.pathFor=f=>'music/'+encodeURIComponent(f);
T.$=id=>document.getElementById(id);
T.el={btn:T.$('mainBtn'),btnText:T.$('mainBtnText'),dot:T.$('dot'),status:T.$('statusText'),left:T.$('leftValue'),right:T.$('rightValue'),chip:T.$('chip'),disc:T.$('disc'),nowTitle:T.$('nowTitle'),nowSub:T.$('nowSub'),music:T.$('musicAudio'),live:T.$('liveAudio')};
T.setStatus=(kind,text)=>{T.el.dot.className='dot '+(kind||'');T.el.status.textContent=text};
T.readKey=()=>{const p=new URLSearchParams(location.search),k=p.get('turn');if(k){try{localStorage.setItem('tommart_turn_key',k)}catch(_){}p.delete('turn');try{history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''))}catch(_){}return k}try{return localStorage.getItem('tommart_turn_key')||''}catch(_){return''}};
T.getIce=async()=>{const k=T.readKey();if(!k)throw Error('TURN_KEY_MISSING');const u=new URL('https://'+T.CFG.metered+'/api/v1/turn/credentials');u.searchParams.set('apiKey',k);u.searchParams.set('region',T.CFG.region);const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error('TURN '+r.status);const x=await r.json();if(!Array.isArray(x)||!x.length)throw Error('TURN_EMPTY');return x};
T.peerOpts=iceServers=>({debug:1,config:{iceServers,sdpSemantics:'unified-plan'}});
T.titleFor=st=>{if(!st)return{title:'TomMart',sub:'Radio'};if(st.segment==='track'){const x=T.TRACKS[st.track]||T.TRACKS[0];return{title:x.title,sub:'Музыка • TomMart Radio'}}if(st.segment==='radioJingle')return{title:T.RADIO_JINGLE.title,sub:'Джингл между песнями'};if(st.segment==='adJingle')return{title:T.AD_JINGLE.title,sub:'Сейчас будет реклама'};if(st.segment==='ad'){const a=T.ADS[st.ad]||T.ADS[0];return{title:a.title,sub:'Рекламный блок'}}return{title:'TomMart',sub:'Radio'}};
T.setNow=(kind,st)=>{const e=T.el;if(kind==='live'){e.nowTitle.textContent='Прямой эфир TomMart';e.nowSub.textContent='Живой микрофон студии';e.chip.textContent='ON AIR';e.chip.classList.add('hot');return}if(kind==='radioJingle'){e.nowTitle.textContent=T.RADIO_JINGLE.title;e.nowSub.textContent='Фирменный джингл';e.chip.textContent='JINGLE';e.chip.classList.add('hot');return}if(kind==='adJingle'){e.nowTitle.textContent=T.AD_JINGLE.title;e.nowSub.textContent='Рекламный джингл';e.chip.textContent='AD';e.chip.classList.add('hot');return}if(kind==='ad'){const a=T.ADS[st?.ad||0]||T.ADS[0];e.nowTitle.textContent=a.title;e.nowSub.textContent='Реклама';e.chip.textContent='AD';e.chip.classList.add('hot');return}const x=T.titleFor(st);e.nowTitle.textContent=x.title;e.nowSub.textContent=x.sub;e.chip.textContent=T.IS_ADMIN?'STUDIO':'24/7';e.chip.classList.remove('hot')};
T.ui=(mode,st,wanted=true)=>{const e=T.el;e.disc.classList.toggle('live',mode==='live');if(mode==='live'){if(!T.IS_ADMIN)e.left.textContent='LIVE';T.setNow('live');e.btnText.textContent=T.IS_ADMIN?'ЗАВЕРШИТЬ ЭФИР':'СЛУШАЮ LIVE';return}if(['intro','outro','switching'].includes(mode)){if(!T.IS_ADMIN)e.left.textContent='JINGLE';T.setNow('radioJingle');if(!T.IS_ADMIN)e.btnText.textContent='СЛУШАЮ TOMMART';return}if(st?.segment==='radioJingle'){if(!T.IS_ADMIN)e.left.textContent='JINGLE';T.setNow('radioJingle',st)}else if(st?.segment==='adJingle'){if(!T.IS_ADMIN)e.left.textContent='РЕКЛАМА';T.setNow('adJingle',st)}else if(st?.segment==='ad'){if(!T.IS_ADMIN)e.left.textContent='РЕКЛАМА';T.setNow('ad',st)}else{if(!T.IS_ADMIN)e.left.textContent='MUSIC';T.setNow('music',st)}if(!T.IS_ADMIN)e.btnText.textContent=wanted?'СЛУШАЮ TOMMART':'СЛУШАТЬ TOMMART'};
T.probe=(src,fallback)=>new Promise(res=>{const a=new Audio();let done=false;const f=v=>{if(done)return;done=true;res(v)};a.preload='metadata';a.onloadedmetadata=()=>f(Number.isFinite(a.duration)&&a.duration>0?a.duration:fallback);a.onerror=()=>f(fallback);a.src=src;setTimeout(()=>f(fallback),8000)});
T.TRACK_DURS=T.TRACKS.map(()=>240);T.RADIO_JINGLE_DUR=3;T.AD_JINGLE_DUR=6;T.AD_DURS=T.ADS.map(()=>8);
T.loadDurations=async()=>{T.TRACK_DURS=await Promise.all(T.TRACKS.map(x=>T.probe(T.pathFor(x.file),240)));T.RADIO_JINGLE_DUR=await T.probe(T.pathFor(T.RADIO_JINGLE.file),3);T.AD_JINGLE_DUR=await T.probe(T.pathFor(T.AD_JINGLE.file),6);T.AD_DURS=await Promise.all(T.ADS.map(x=>T.probe(T.pathFor(x.file),8)))};
T.adAfter=i=>((i+1)%T.CFG.adEvery)===0;
T.adIndexAfter=i=>(Math.floor((i+1)/T.CFG.adEvery)-1+T.ADS.length)%T.ADS.length;
T.sequenceFrom=anchor=>{const q=[];for(let n=0;n<T.TRACKS.length;n++){const i=(anchor+n)%T.TRACKS.length,next=(i+1)%T.TRACKS.length;q.push({segment:'track',track:i,dur:T.TRACK_DURS[i]});if(T.adAfter(i)){const a=T.adIndexAfter(i);q.push({segment:'adJingle',ad:a,nextTrack:next,dur:T.AD_JINGLE_DUR},{segment:'ad',ad:a,nextTrack:next,dur:T.AD_DURS[a]})}q.push({segment:'radioJingle',nextTrack:next,dur:T.RADIO_JINGLE_DUR})}return q};
T.timelineState=(anchor=0,at=T.GLOBAL_ANCHOR,now=Date.now())=>{const q=T.sequenceFrom(anchor),total=q.reduce((s,x)=>s+x.dur,0);let e=((now-at)/1000%total+total)%total;for(const x of q){if(e<x.dur)return{...x,offset:e};e-=x.dur}return{segment:'track',track:anchor,offset:0,dur:T.TRACK_DURS[anchor]}};
T.nextTrackFrom=(st,anchor=0)=>!st?(anchor+1)%T.TRACKS.length:st.segment==='track'?((st.track??anchor)+1)%T.TRACKS.length:Number.isInteger(st.nextTrack)?st.nextTrack:(anchor+1)%T.TRACKS.length;
})();
