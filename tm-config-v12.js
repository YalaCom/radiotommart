(()=>{
'use strict';
const T=window.TM=window.TM||{};
T.CFG={metered:'tommart-radio.metered.live',region:'europe',reconnect:1800};
const BASE=[
 {file:'%d0%9c%d0%be%d0%bb%d0%b4%d0%b0%d0%b2%d1%81%d0%ba%d0%b0%d1%8f%20-%20%d0%9c%d0%be%d0%bb%d0%b4%d0%b0%d0%b2%d1%81%d0%ba%d0%b0%d1%8f.mp3.mp3',title:'Молдавская — Молдавская'},
 {file:'Akmal_Grigorijj_Leps_-_SHutka_80838502.mp3',title:'Akmal’ & Григорий Лепс — Шутка'},
 {file:'Grigorijj_Leps_Andrejj_Davinchi_-_Zanovo_nachat_79421060.mp3',title:'Григорий Лепс & Андрей Davinchi — Заново начать'},
 {file:'Kipelov_-_YA_svoboden_(musmore.org).mp3',title:'Кипелов — Я свободен'},
 {file:'Kleopatra_Stratan_-_Ghi_Gicu_(musportal.org).mp3',title:'Cleopatra Stratan — Ghi Gicu'},
 {file:'Korol_i_SHut_-_Durak_i_molniya_(musmore.org).mp3',title:'Король и Шут — Дурак и молния'},
 {file:'Korol_i_SHut_-_Kukla_kolduna_(musmore.org).mp3',title:'Король и Шут — Кукла колдуна'},
 {file:'Leonid_Agutin_DJ_DANI_WOO_-_Ostrov_78425583.mp3',title:'Леонид Агутин & DJ DANI WOO — Остров'},
 {file:'Leprikonsy_-_KHali-gali_paratruper_(musmore.org).mp3',title:'Леприконсы — Хали-гали, паратрупер'},
 {file:'Sektor_Gaza_-_Pora_domojj_(musmore.org).mp3',title:'Сектор Газа — Пора домой'},
 {file:'Sektor_Gaza_-_Tuman_(musmore.org).mp3',title:'Сектор Газа — Туман'},
 {file:'Splin_-_Vykhoda_net_(musmore.org).mp3',title:'Сплин — Выхода нет'},
 {file:'ace-of-base-beautiful-life.mp3',title:'Ace of Base — Beautiful Life'},
 {file:'basta-vypusknojj-medljachok.mp3',title:'Баста — Выпускной (Медлячок)'},
 {file:'chajj-vdvoem-malchishka-malchishka-kotoromu-dazhe-16-net.mp3',title:'Чай вдвоём — Мальчишка'},
 {file:'ed-sheeran-shape-of-you.mp3',title:'Ed Sheeran — Shape of You'},
 {file:'elton-john-dua-lipa-cold-heart-pnau-remix.mp3',title:'Elton John & Dua Lipa — Cold Heart'},
 {file:'imagine-dragons-thunder.mp3',title:'Imagine Dragons — Thunder'},
 {file:'luis-fonsi-feat.-daddy-yankee-despacito.mp3',title:'Luis Fonsi feat. Daddy Yankee — Despacito'},
 {file:'madcon-beggin.mp3',title:'Madcon — Beggin'},
 {file:'nico-vinz-am-i-wrong.mp3',title:'Nico & Vinz — Am I Wrong'},
 {file:'ruki-vverkh-plachesh-v-temnote.mp3',title:'Руки Вверх! — Плачешь в темноте'},
 {file:'the-weeknd-blinding-lights.mp3',title:'The Weeknd — Blinding Lights'}
];
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffle(a,seed){const out=a.map((x,i)=>({...x,baseIndex:i})),r=rng(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
T.TRACKS=shuffle(BASE,0x5A17C0DE);
T.ORDER=T.TRACKS.map((_,i)=>i);
T.RADIO_JINGLE={file:'gemini_generated_video_5EC56A5E 2.mp3',title:'TomMart Radio Jingle'};
T.AD_JINGLE={file:'gemini_music_[cut_6sec].mp3',title:'TomMart — реклама'};
T.ADS=[
 {file:'ae6bf76f_-2000108951_1786361749_fc88336ec2613f77119364255812d4c5 (mp3cut.net).mp3',title:'Реклама TomMart 1'},
 {file:'14e75fcb_-2000108951_1786363277_2b854cbe448c07c9e0df74898841a74b.mp3',title:'Реклама TomMart 2'},
 {file:'726f0355_-2000108951_1786433837_87a38f1f3fcf228627af966624732aad.mp3',title:'Реклама TomMart 3'}
];
T.GLOBAL_ANCHOR=Date.UTC(2026,7,11,0,0,0);
T.IS_ADMIN=new URLSearchParams(location.search).get('admin')==='1';
T.pathFor=f=>'music/'+encodeURIComponent(f);
T.$=id=>document.getElementById(id);
T.el={btn:T.$('mainBtn'),btnText:T.$('mainBtnText'),dot:T.$('dot'),status:T.$('statusText'),left:T.$('leftValue'),right:T.$('rightValue'),chip:T.$('chip'),disc:T.$('disc'),nowTitle:T.$('nowTitle'),nowSub:T.$('nowSub'),music:T.$('musicAudio'),live:T.$('liveAudio')};
T.setStatus=(kind,text)=>{T.el.dot.className='dot '+(kind||'');T.el.status.textContent=text};
T.readKey=()=>{const p=new URLSearchParams(location.search),k=p.get('turn');if(k){try{localStorage.setItem('tommart_turn_key',k)}catch(_){}p.delete('turn');try{history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''))}catch(_){}return k}try{return localStorage.getItem('tommart_turn_key')||''}catch(_){return''}};
T.getIce=async()=>{const k=T.readKey();if(!k)throw Error('TURN_KEY_MISSING');const u=new URL('https://'+T.CFG.metered+'/api/v1/turn/credentials');u.searchParams.set('apiKey',k);u.searchParams.set('region',T.CFG.region);const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error('TURN '+r.status);const x=await r.json();if(!Array.isArray(x)||!x.length)throw Error('TURN_EMPTY');return x};
T.titleFor=st=>{if(!st)return{title:'TomMart',sub:'Radio'};if(st.segment==='track'){const x=T.TRACKS[st.track]||T.TRACKS[0];return{title:x.title,sub:'Музыка • Random Mix'}}if(st.segment==='radioJingle')return{title:T.RADIO_JINGLE.title,sub:'Фирменный джингл TomMart'};if(st.segment==='adJingle')return{title:T.AD_JINGLE.title,sub:'Сейчас будет реклама'};if(st.segment==='ad'){const a=T.ADS[st.ad]||T.ADS[0];return{title:a.title,sub:'Рекламный блок'}}return{title:'TomMart',sub:'Radio'}};
T.setNow=(kind,st)=>{const e=T.el;if(kind==='live'){e.nowTitle.textContent='Прямой эфир TomMart';e.nowSub.textContent='Живой микрофон студии';e.chip.textContent='ON AIR';e.chip.classList.add('hot');return}if(kind==='radioJingle'){e.nowTitle.textContent=T.RADIO_JINGLE.title;e.nowSub.textContent='Фирменный джингл';e.chip.textContent='JINGLE';e.chip.classList.add('hot');return}if(kind==='adJingle'){e.nowTitle.textContent=T.AD_JINGLE.title;e.nowSub.textContent='Рекламный джингл';e.chip.textContent='AD';e.chip.classList.add('hot');return}if(kind==='ad'){const a=T.ADS[st?.ad||0]||T.ADS[0];e.nowTitle.textContent=a.title;e.nowSub.textContent='Реклама';e.chip.textContent='AD';e.chip.classList.add('hot');return}const x=T.titleFor(st);e.nowTitle.textContent=x.title;e.nowSub.textContent=x.sub;e.chip.textContent=T.IS_ADMIN?'STUDIO':'RANDOM';e.chip.classList.remove('hot')};
T.ui=(mode,st,wanted=true)=>{const e=T.el;e.disc.classList.toggle('live',mode==='live');if(mode==='live'){if(!T.IS_ADMIN)e.left.textContent='LIVE';T.setNow('live');e.btnText.textContent=T.IS_ADMIN?'ЗАВЕРШИТЬ ЭФИР':'СЛУШАЮ LIVE';return}if(['intro','outro','switching'].includes(mode)){if(!T.IS_ADMIN)e.left.textContent='JINGLE';T.setNow('radioJingle');if(!T.IS_ADMIN)e.btnText.textContent='СЛУШАЮ TOMMART';return}if(st?.segment==='radioJingle'){if(!T.IS_ADMIN)e.left.textContent='JINGLE';T.setNow('radioJingle',st)}else if(st?.segment==='adJingle'){if(!T.IS_ADMIN)e.left.textContent='РЕКЛАМА';T.setNow('adJingle',st)}else if(st?.segment==='ad'){if(!T.IS_ADMIN)e.left.textContent='РЕКЛАМА';T.setNow('ad',st)}else{if(!T.IS_ADMIN)e.left.textContent='MUSIC';T.setNow('music',st)}if(!T.IS_ADMIN)e.btnText.textContent=wanted?'СЛУШАЮ TOMMART':'СЛУШАТЬ TOMMART'};
T.probe=(src,fallback)=>new Promise(res=>{const a=new Audio();let done=false;const f=v=>{if(done)return;done=true;res(v)};a.preload='metadata';a.onloadedmetadata=()=>f(Number.isFinite(a.duration)&&a.duration>0?a.duration:fallback);a.onerror=()=>f(fallback);a.src=src;setTimeout(()=>f(fallback),9000)});
T.TRACK_DURS=T.TRACKS.map(()=>240);T.RADIO_JINGLE_DUR=3;T.AD_JINGLE_DUR=6;T.AD_DURS=T.ADS.map(()=>8);
T.loadDurations=async()=>{T.TRACK_DURS=await Promise.all(T.TRACKS.map(x=>T.probe(T.pathFor(x.file),240)));T.RADIO_JINGLE_DUR=await T.probe(T.pathFor(T.RADIO_JINGLE.file),3);T.AD_JINGLE_DUR=await T.probe(T.pathFor(T.AD_JINGLE.file),6);T.AD_DURS=await Promise.all(T.ADS.map(x=>T.probe(T.pathFor(x.file),8)))};
const AD_COUNTS=new Set([2,5,7,10,13,15,18,21,23]);
const J_COUNTS=new Set([4,8,12,16,20]);
T.posOf=i=>((i%T.TRACKS.length)+T.TRACKS.length)%T.TRACKS.length;
T.adAfter=i=>AD_COUNTS.has(T.posOf(i)+1);
T.jingleAfter=i=>J_COUNTS.has(T.posOf(i)+1);
T.adIndexAfter=i=>{let n=0;for(let p=0;p<=T.posOf(i);p++)if(AD_COUNTS.has(p+1))n++;return Math.max(0,n-1)%T.ADS.length};
T.nextTrackIndex=i=>(T.posOf(i)+1)%T.TRACKS.length;
T.sequenceFrom=anchor=>{const q=[],start=T.posOf(anchor);for(let n=0;n<T.TRACKS.length;n++){const i=(start+n)%T.TRACKS.length,next=T.nextTrackIndex(i),doAd=T.adAfter(i),doJ=T.jingleAfter(i),ad=T.adIndexAfter(i);q.push({segment:'track',track:i,sourceTrack:i,dur:T.TRACK_DURS[i]});if(doAd)q.push({segment:'adJingle',ad,sourceTrack:i,afterJingle:false,nextTrack:next,dur:T.AD_JINGLE_DUR},{segment:'ad',ad,sourceTrack:i,afterJingle:false,nextTrack:next,dur:T.AD_DURS[ad]});if(doJ&&!doAd)q.push({segment:'radioJingle',sourceTrack:i,nextTrack:next,dur:T.RADIO_JINGLE_DUR})}return q};
T.timelineState=(anchor=0,at=T.GLOBAL_ANCHOR,ts=Date.now())=>{const q=T.sequenceFrom(anchor),total=q.reduce((s,x)=>s+x.dur,0);let e=((ts-at)/1000%total+total)%total;for(const x of q){if(e<x.dur)return{...x,offset:e};e-=x.dur}return{segment:'track',track:anchor,sourceTrack:anchor,offset:0,dur:T.TRACK_DURS[anchor]}};
T.nextTrackFrom=(st,anchor=0)=>!st?T.nextTrackIndex(anchor):st.segment==='track'?T.nextTrackIndex(st.track??anchor):Number.isInteger(st.nextTrack)?st.nextTrack:T.nextTrackIndex(anchor);
})();