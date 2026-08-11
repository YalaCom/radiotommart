(()=>{
'use strict';
const LIB=[
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
const RADIO_JINGLE={file:'gemini_generated_video_5EC56A5E 2.mp3',title:'TomMart Radio Jingle'};
const AD_JINGLE={file:'gemini_music_[cut_6sec].mp3',title:'TomMart — реклама'};
const ADS=[
 {file:'ae6bf76f_-2000108951_1786361749_fc88336ec2613f77119364255812d4c5 (mp3cut.net).mp3',title:'Реклама TomMart 1'},
 {file:'14e75fcb_-2000108951_1786363277_2b854cbe448c07c9e0df74898841a74b.mp3',title:'Реклама TomMart 2'},
 {file:'726f0355_-2000108951_1786433837_87a38f1f3fcf228627af966624732aad.mp3',title:'Реклама TomMart 3'}
];
const $=id=>document.getElementById(id),audio=$('musicAudio'),btn=$('mainBtn'),btnText=$('mainBtnText'),dot=$('dot'),status=$('statusText'),left=$('leftValue'),right=$('rightValue'),nowTitle=$('nowTitle'),nowSub=$('nowSub'),chip=$('chip'),disc=$('disc');
const pathFor=f=>'music/'+encodeURIComponent(f),sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{const p=new URLSearchParams(location.search);if(p.has('admin')||p.has('turn')){p.delete('admin');p.delete('turn');history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''));}}catch(_){}
document.body.classList.remove('tm-admin');document.body.classList.add('tm-moldova');
const brand=document.querySelector('.brand');if(brand)brand.innerHTML='Tom<span>Mart</span>';if($('pillText'))$('pillText').textContent='MOLDOVA RADIO';if($('kicker'))$('kicker').textContent='TOMMART • SYNCHRONIZED RADIO';if($('title'))$('title').innerHTML='TOMMART<br><em>ONE RADIO • ONE TIME</em>';if($('lead'))$('lead').textContent='Один общий эфир для всех устройств. Песни, реклама и джинглы идут по одной точной временной шкале.';
$('micPanel')?.classList.add('hidden');$('studioCard')?.classList.add('hidden');$('playlistCard')?.classList.add('hidden');$('note')?.classList.add('hidden');if($('leftLabel'))$('leftLabel').textContent='СЕЙЧАС';if($('rightLabel'))$('rightLabel').textContent='СИНХРОН';left.textContent='ЗАГРУЗКА';right.textContent='ГОТОВЛЮ';document.title='TomMart — Sync Radio';
let manifest=null,clockOffset=0,started=false,currentKey='',switchToken=0,boundaryTimer=null,dayCache=null,dayCacheStart=0,preloader=null;
const setStatus=(kind,text)=>{dot.className='dot '+(kind||'');status.textContent=text},radioNow=()=>Date.now()+clockOffset;
function hash32(n){n|=0;n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);n^=n>>>16;return n>>>0;}
function makeRng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function shuffleIndices(r){const a=LIB.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function dur(file){const v=Number(manifest?.[file]);if(!Number.isFinite(v)||v<=0)throw new Error('NO_DURATION:'+file);return v;}
function dayStartUtc(ms){const d=new Date(ms);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());}
function buildDay(startMs){const dayNo=Math.floor(startMs/86400000),r=makeRng(hash32(dayNo^0x54a3c91d)),out=[];let t=0,songsAd=0,songsJ=0,nextAd=r()<.5?2:3,nextJ=r()<.5?3:4,adCursor=Math.floor(r()*ADS.length),cycle=0;const add=x=>{x.start=t;x.end=t+x.dur;out.push(x);t=x.end;};while(t<86430){const order=shuffleIndices(r);cycle++;for(const track of order){add({type:'track',track,file:LIB[track].file,title:LIB[track].title,dur:dur(LIB[track].file),cycle});songsAd++;songsJ++;const adDue=songsAd>=nextAd,jDue=songsJ>=nextJ;if(adDue){const ad=adCursor++%ADS.length;add({type:'adJingle',ad,file:AD_JINGLE.file,title:AD_JINGLE.title,dur:dur(AD_JINGLE.file)});add({type:'ad',ad,file:ADS[ad].file,title:ADS[ad].title,dur:dur(ADS[ad].file)});songsAd=0;nextAd=r()<.5?2:3;}if(jDue&&!adDue){add({type:'radioJingle',file:RADIO_JINGLE.file,title:RADIO_JINGLE.title,dur:dur(RADIO_JINGLE.file)});songsJ=0;nextJ=r()<.5?3:4;}else if(jDue&&adDue){songsJ=Math.max(1,songsJ-1);}if(t>=86430)break;}}return out;}
function scheduleFor(ms){const ds=dayStartUtc(ms);if(!dayCache||dayCacheStart!==ds){dayCacheStart=ds;dayCache=buildDay(ds);}return dayCache;}
function stateAt(ms){const ds=dayStartUtc(ms),seq=scheduleFor(ms),sec=(ms-ds)/1000;let lo=0,hi=seq.length-1;while(lo<=hi){const mid=(lo+hi)>>1,s=seq[mid];if(sec<s.start)hi=mid-1;else if(sec>=s.end)lo=mid+1;else return{...s,offset:sec-s.start,index:mid,dayStart:ds};}const i=Math.max(0,Math.min(seq.length-1,lo)),s=seq[i];return{...s,offset:Math.max(0,sec-s.start),index:i,dayStart:ds};}
const keyOf=s=>s.dayStart+':'+s.index+':'+s.type+':'+(s.track??'')+':'+(s.ad??'');
function paint(s){disc?.classList.toggle('live',false);if(s.type==='track'){left.textContent='MUSIC';nowTitle.textContent=s.title;nowSub.textContent='Музыка • общий эфир';chip.textContent='SYNC';chip.classList.remove('hot');}else if(s.type==='adJingle'){left.textContent='РЕКЛАМА';nowTitle.textContent=AD_JINGLE.title;nowSub.textContent='Рекламный джингл';chip.textContent='AD';chip.classList.add('hot');}else if(s.type==='ad'){left.textContent='РЕКЛАМА';nowTitle.textContent=s.title;nowSub.textContent='Рекламный блок';chip.textContent='AD';chip.classList.add('hot');}else{left.textContent='JINGLE';nowTitle.textContent=RADIO_JINGLE.title;nowSub.textContent='Фирменный джингл TomMart';chip.textContent='JINGLE';chip.classList.add('hot');}right.textContent='ONLINE';}
async function calibrateClock(){const vals=[];for(let i=0;i<5;i++){try{const t0=Date.now(),r=await fetch('v15.html?tmclock='+t0+'-'+i,{method:'HEAD',cache:'no-store'}),t1=Date.now(),h=r.headers.get('date');if(h){const server=Date.parse(h)+500,localMid=(t0+t1)/2;if(Number.isFinite(server))vals.push(server-localMid);}}catch(_){}await sleep(70);}if(vals.length){vals.sort((a,b)=>a-b);clockOffset=vals[Math.floor(vals.length/2)];}}
async function waitReady(token){if(audio.readyState>=1&&Number.isFinite(audio.duration))return;await new Promise(res=>{let done=false;const finish=()=>{if(done)return;done=true;res();};audio.addEventListener('loadedmetadata',finish,{once:true});audio.addEventListener('canplay',finish,{once:true});audio.addEventListener('error',finish,{once:true});setTimeout(finish,5000);});if(token!==switchToken)throw new Error('STALE');}
function clearBoundary(){if(boundaryTimer){clearTimeout(boundaryTimer);boundaryTimer=null;}}
function scheduleBoundary(s){clearBoundary();boundaryTimer=setTimeout(()=>sync(true,'boundary'),Math.max(80,(s.dur-s.offset)*1000+35));}
function preloadNext(s){try{const seq=scheduleFor(radioNow()),n=seq[s.index+1];if(!n)return;if(preloader){preloader.src='';preloader=null;}preloader=new Audio();preloader.preload='auto';preloader.src=pathFor(n.file);}catch(_){}}
async function switchTo(initial,reason='switch'){const token=++switchToken;clearBoundary();let s=initial;currentKey=keyOf(s);paint(s);setStatus('warn','Синхронизирую эфир…');try{audio.pause();}catch(_){}audio.src=pathFor(s.file);audio.load();try{await waitReady(token);}catch(e){if(e.message==='STALE')return;}if(token!==switchToken)return;const fresh=stateAt(radioNow());if(keyOf(fresh)!==currentKey)return switchTo(fresh,'changed-during-load');s=fresh;paint(s);try{audio.currentTime=Math.max(0,Math.min(s.offset,Math.max(0,(Number.isFinite(audio.duration)?audio.duration:s.dur)-0.06)));}catch(_){}try{audio.playbackRate=1;}catch(_){}try{await audio.play();setStatus('ok','TomMart играет • синхронный эфир');}catch(_){setStatus('warn','Нажми СЛУШАТЬ TOMMART ещё раз');}scheduleBoundary(s);preloadNext(s);}
async function sync(force=false,reason='tick'){if(!started)return;const s=stateAt(radioNow()),key=keyOf(s);paint(s);if(key!==currentKey||!audio.src)return switchTo(s,reason);if(audio.paused||audio.ended)return switchTo(s,'paused-or-ended');const diff=(audio.currentTime||0)-s.offset,ad=Math.abs(diff);if(force||ad>.28){try{audio.currentTime=s.offset;audio.playbackRate=1;}catch(_){}scheduleBoundary(s);}else if(ad>.055){try{audio.playbackRate=diff>0?0.985:1.015;}catch(_){}}else try{audio.playbackRate=1;}catch(_){} }
async function loadManifest(){const r=await fetch('durations-v15.json?v=20260811-15',{cache:'no-store'});if(!r.ok)throw new Error('MANIFEST_HTTP_'+r.status);manifest=await r.json();const needed=[...LIB.map(x=>x.file),RADIO_JINGLE.file,AD_JINGLE.file,...ADS.map(x=>x.file)];for(const f of needed)dur(f);}
async function boot(){btn.disabled=true;btnText.textContent='ПОДГОТОВКА…';setStatus('warn','Загружаю точный таймлайн…');try{await Promise.all([loadManifest(),calibrateClock()]);scheduleFor(radioNow());left.textContent='ГОТОВО';right.textContent='SYNC';btn.disabled=false;btnText.textContent='СЛУШАТЬ TOMMART';setStatus('ok','Радио готово • один эфир для всех');}catch(e){console.error(e);left.textContent='ERROR';right.textContent='ERROR';btn.disabled=true;btnText.textContent='ОШИБКА';setStatus('bad','Не удалось загрузить точный таймлайн');}}
async function start(){if(!manifest)return;started=true;btn.disabled=true;btnText.textContent='ПОДКЛЮЧАЮ…';await calibrateClock();await sync(true,'start');btn.disabled=false;btnText.textContent='СЛУШАЮ TOMMART';}
btn.onclick=start;
audio.addEventListener('ended',()=>{if(started){currentKey='';setTimeout(()=>sync(true,'ended'),20);}});audio.addEventListener('error',()=>{if(started){currentKey='';setStatus('warn','Переключаю эфир…');setTimeout(()=>sync(true,'error'),350);}});audio.addEventListener('stalled',()=>{if(started)setTimeout(()=>sync(true,'stalled'),700);});
setInterval(()=>sync(false,'watchdog'),700);setInterval(async()=>{if(!started)return;await calibrateClock();sync(true,'clock');},30000);const revive=()=>{if(started)setTimeout(()=>sync(true,'resume'),80);};document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')revive();});window.addEventListener('pageshow',revive);window.addEventListener('focus',revive);window.addEventListener('online',revive);
boot();
})();
