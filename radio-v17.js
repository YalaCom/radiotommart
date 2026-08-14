(()=>{
'use strict';

const SPECIAL = {
  radioJingle: 'gemini_generated_video_5EC56A5E 2.mp3',
  adJingle: 'gemini_music_[cut_6sec].mp3',
  jokeJingle: 'gemini-generated-video-347EB0A2-1786537580748-z3e2i.mp3',
  selfDefenseJingle: 'gemini-generated-video-A93026D7-1786537444359-7upq5.mp3',
  laugh: 'a2ae7f65eb5f5fd.mp3',
  jokes: [
    '6a7f0303a9b67742643247_[cut_5sec].mp3',
    '6a7f0303a9b67742643247_[cut_7sec].mp3',
    '6a7f043678133238779034_[cut_14sec].mp3',
    '6a7f043678133238779034_[cut_8sec].mp3'
  ],
  ads: [
    'ae6bf76f_-2000108951_1786361749_fc88336ec2613f77119364255812d4c5 (mp3cut.net).mp3',
    '14e75fcb_-2000108951_1786363277_2b854cbe448c07c9e0df74898841a74b.mp3',
    '726f0355_-2000108951_1786433837_87a38f1f3fcf228627af966624732aad.mp3',
    '1f8ea9b0_-2000108951_1786451950_78db1e424f3590d5ecf6b3c8cf087211.mp3'
  ]
};

const OLD_TITLES = {
 '%d0%9c%d0%be%d0%bb%d0%b4%d0%b0%d0%b2%d1%81%d0%ba%d0%b0%d1%8f%20-%20%d0%9c%d0%be%d0%bb%d0%b4%d0%b0%d0%b2%d1%81%d0%ba%d0%b0%d1%8f.mp3.mp3':'Молдавская — Молдавская',
 'Akmal_Grigorijj_Leps_-_SHutka_80838502.mp3':'Akmal’ & Григорий Лепс — Шутка',
 'Grigorijj_Leps_Andrejj_Davinchi_-_Zanovo_nachat_79421060.mp3':'Григорий Лепс & Андрей Davinchi — Заново начать',
 'Kipelov_-_YA_svoboden_(musmore.org).mp3':'Кипелов — Я свободен',
 'Kleopatra_Stratan_-_Ghi_Gicu_(musportal.org).mp3':'Cleopatra Stratan — Ghi Gicu',
 'Korol_i_SHut_-_Durak_i_molniya_(musmore.org).mp3':'Король и Шут — Дурак и молния',
 'Korol_i_SHut_-_Kukla_kolduna_(musmore.org).mp3':'Король и Шут — Кукла колдуна',
 'Leonid_Agutin_DJ_DANI_WOO_-_Ostrov_78425583.mp3':'Леонид Агутин & DJ DANI WOO — Остров',
 'Leprikonsy_-_KHali-gali_paratruper_(musmore.org).mp3':'Леприконсы — Хали-гали, паратрупер',
 'Sektor_Gaza_-_Pora_domojj_(musmore.org).mp3':'Сектор Газа — Пора домой',
 'Sektor_Gaza_-_Tuman_(musmore.org).mp3':'Сектор Газа — Туман',
 'Splin_-_Vykhoda_net_(musmore.org).mp3':'Сплин — Выхода нет',
 'ace-of-base-beautiful-life.mp3':'Ace of Base — Beautiful Life',
 'basta-vypusknojj-medljachok.mp3':'Баста — Выпускной (Медлячок)',
 'chajj-vdvoem-malchishka-malchishka-kotoromu-dazhe-16-net.mp3':'Чай вдвоём — Мальчишка',
 'ed-sheeran-shape-of-you.mp3':'Ed Sheeran — Shape of You',
 'elton-john-dua-lipa-cold-heart-pnau-remix.mp3':'Elton John & Dua Lipa — Cold Heart',
 'imagine-dragons-thunder.mp3':'Imagine Dragons — Thunder',
 'luis-fonsi-feat.-daddy-yankee-despacito.mp3':'Luis Fonsi feat. Daddy Yankee — Despacito',
 'madcon-beggin.mp3':'Madcon — Beggin',
 'nico-vinz-am-i-wrong.mp3':'Nico & Vinz — Am I Wrong',
 'ruki-vverkh-plachesh-v-temnote.mp3':'Руки Вверх! — Плачешь в темноте',
 'the-weeknd-blinding-lights.mp3':'The Weeknd — Blinding Lights',
 'grigorijj-leps-chto-zh-ty-natvorila.mp3':'Григорий Лепс — Что ж ты натворила',
 'jony-titry.mp3':'JONY — Титры',
 'coldplay-a-sky-full-of-stars.mp3':'Coldplay — A Sky Full of Stars',
 'Liliana_-_Mariana_(Zvyki.com).mp3':'Liliana — Mariana',
 'Miyagi_-_Marlboro_(eu.monfons.com).mp3':'Miyagi — Marlboro',
 'Stas_Mikhajjlov_-_Tam_(eu.monfons.com).mp3':'Стас Михайлов — Там'
};

const $ = id => document.getElementById(id);
const audio=$('musicAudio'), btn=$('mainBtn'), btnText=$('mainBtnText'), dot=$('dot'),
      status=$('statusText'), left=$('leftValue'), right=$('rightValue'),
      nowTitle=$('nowTitle'), nowSub=$('nowSub'), chip=$('chip'), disc=$('disc');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pathFor=f=>'music/'+encodeURIComponent(f);

try{
  const p=new URLSearchParams(location.search);
  if(p.has('admin')||p.has('turn')){
    p.delete('admin'); p.delete('turn');
    history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''));
  }
}catch(_){}

document.body.classList.remove('tm-admin');
document.body.classList.add('tm-moldova');
const brand=document.querySelector('.brand'); if(brand)brand.innerHTML='Tom<span>Mart</span>';
if($('pillText'))$('pillText').textContent='MOLDOVA RADIO';
if($('kicker'))$('kicker').textContent='TOMMART • SYNCHRONIZED RADIO';
if($('title'))$('title').innerHTML='TOMMART<br><em>ONE RADIO • ONE TIME</em>';
if($('lead'))$('lead').textContent='Один общий эфир для всех устройств. Музыка, реклама, джинглы и программа «Анекдоты» идут по одной точной временной шкале.';
$('micPanel')?.classList.add('hidden');
$('studioCard')?.classList.add('hidden');
$('playlistCard')?.classList.add('hidden');
$('note')?.classList.add('hidden');
if($('leftLabel'))$('leftLabel').textContent='СЕЙЧАС';
if($('rightLabel'))$('rightLabel').textContent='СИНХРОН';
left.textContent='ЗАГРУЗКА';
right.textContent='ГОТОВЛЮ';
document.title='TomMart — Sync Radio';

let manifest=null, LIB=[], ADS=[], JOKES=[];
let clockOffset=0, started=false, currentKey='', switchToken=0, boundaryTimer=null;
let dayCache=null, dayCacheStart=0, preloader=null, syncing=false;

const setStatus=(kind,text)=>{dot.className='dot '+(kind||'');status.textContent=text;};
const radioNow=()=>Date.now()+clockOffset;

function prettyTitle(file){
  if(OLD_TITLES[file]) return OLD_TITLES[file];
  let s=file;
  try{s=decodeURIComponent(s);}catch(_){}
  s=s.replace(/\.mp3(?:\.mp3)?$/i,'')
     .replace(/\((?:musmore\.org|musportal\.org|eu\.monfons\.com|Zvyki\.com)\)/gi,'')
     .replace(/_\d{6,}$/,'')
     .replace(/_-_/g,' — ')
     .replace(/_/g,' ')
     .replace(/\s+/g,' ')
     .trim();
  if(s.includes(' - ')){
    const parts=s.split(' - ');
    if(parts.length===2) return parts[1].trim()+' — '+parts[0].trim();
  }
  return s;
}

function hash32(n){
  n|=0;n^=n>>>16;n=Math.imul(n,0x7feb352d);n^=n>>>15;n=Math.imul(n,0x846ca68b);n^=n>>>16;
  return n>>>0;
}
function makeRng(seed){
  let s=seed>>>0;
  return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
}
function shuffleArray(a,r){
  const out=a.slice();
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
function shuffleIndices(r){
  return shuffleArray(LIB.map((_,i)=>i),r);
}
function dur(file){
  const v=Number(manifest?.[file]);
  if(!Number.isFinite(v)||v<=0) throw new Error('NO_DURATION:'+file);
  return v;
}
function dayStartUtc(ms){
  const d=new Date(ms);
  return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());
}

function buildLibrary(){
  const excluded=new Set([
    SPECIAL.radioJingle,SPECIAL.adJingle,SPECIAL.jokeJingle,SPECIAL.selfDefenseJingle,SPECIAL.laugh,
    ...SPECIAL.jokes,...SPECIAL.ads
  ]);
  LIB=Object.keys(manifest)
    .filter(f=>/\.mp3$/i.test(f) && !excluded.has(f))
    .sort((a,b)=>a.localeCompare(b,'ru'))
    .map(file=>({file,title:prettyTitle(file)}));
  ADS=SPECIAL.ads.map((file,i)=>({file,title:'Реклама TomMart '+(i+1)}));
  JOKES=SPECIAL.jokes.map((file,i)=>({file,title:'Анекдот '+(i+1)}));
  if(!LIB.length) throw new Error('NO_TRACKS');
  for(const x of LIB) dur(x.file);
  for(const x of ADS) dur(x.file);
  for(const x of JOKES) dur(x.file);
  dur(SPECIAL.radioJingle);dur(SPECIAL.adJingle);dur(SPECIAL.jokeJingle);dur(SPECIAL.selfDefenseJingle);dur(SPECIAL.laugh);
}

function buildDay(startMs){
  const dayNo=Math.floor(startMs/86400000);
  const r=makeRng(hash32(dayNo^0x17a6c7d3));
  const out=[];
  let t=0,songsAd=0,songsJ=0,songsJoke=0;
  let nextAd=r()<.5?2:3;
  let nextJ=r()<.5?3:4;
  let nextJoke=5+Math.floor(r()*3);
  let adCursor=Math.floor(r()*ADS.length),cycle=0;
  let jokeOrder=shuffleArray(JOKES.map((_,i)=>i),r),jokeCursor=0,lastJoke=-1;
  const add=x=>{x.start=t;x.end=t+x.dur;out.push(x);t=x.end;};
  const takeJoke=()=>{
    if(jokeCursor>=jokeOrder.length){
      jokeOrder=shuffleArray(JOKES.map((_,i)=>i),r);
      jokeCursor=0;
      if(jokeOrder.length>1 && jokeOrder[0]===lastJoke){
        [jokeOrder[0],jokeOrder[1]]=[jokeOrder[1],jokeOrder[0]];
      }
    }
    const j=jokeOrder[jokeCursor++];
    lastJoke=j;
    return j;
  };

  while(t<86430){
    const order=shuffleIndices(r);
    cycle++;
    for(const track of order){
      const tr=LIB[track];
      add({type:'track',track,file:tr.file,title:tr.title,dur:dur(tr.file),cycle});
      songsAd++;songsJ++;songsJoke++;

      const adDue=songsAd>=nextAd;
      const jokeDue=songsJoke>=nextJoke;
      const jDue=songsJ>=nextJ;

      if(adDue){
        const ad=adCursor++%ADS.length;
        add({type:'adJingle',ad,file:SPECIAL.adJingle,title:'TomMart — реклама',dur:dur(SPECIAL.adJingle)});
        add({type:'ad',ad,file:ADS[ad].file,title:ADS[ad].title,dur:dur(ADS[ad].file)});
        songsAd=0;nextAd=r()<.5?2:3;
      }else if(jokeDue){
        const joke=takeJoke();
        add({type:'jokeJingle',joke,file:SPECIAL.jokeJingle,title:'TomMart — Анекдоты',dur:dur(SPECIAL.jokeJingle)});
        add({type:'joke',joke,file:JOKES[joke].file,title:JOKES[joke].title,dur:dur(JOKES[joke].file)});
        add({type:'laugh',joke,file:SPECIAL.laugh,title:'Смех в студии',dur:dur(SPECIAL.laugh)});
        songsJoke=0;nextJoke=5+Math.floor(r()*3);
        if(jDue) songsJ=Math.max(1,songsJ-2);
      }else if(jDue){
        add({type:'radioJingle',file:SPECIAL.radioJingle,title:'TomMart Radio Jingle',dur:dur(SPECIAL.radioJingle)});
        songsJ=0;nextJ=r()<.5?3:4;
      }

      if(t>=86430) break;
    }
  }
  return out;
}

function scheduleFor(ms){
  const ds=dayStartUtc(ms);
  if(!dayCache||dayCacheStart!==ds){
    dayCacheStart=ds;
    dayCache=buildDay(ds);
  }
  return dayCache;
}

function stateAt(ms){
  const ds=dayStartUtc(ms),seq=scheduleFor(ms),sec=(ms-ds)/1000;
  let lo=0,hi=seq.length-1;
  while(lo<=hi){
    const mid=(lo+hi)>>1,s=seq[mid];
    if(sec<s.start)hi=mid-1;
    else if(sec>=s.end)lo=mid+1;
    else return {...s,offset:sec-s.start,index:mid,dayStart:ds};
  }
  const i=Math.max(0,Math.min(seq.length-1,lo)),s=seq[i];
  return {...s,offset:Math.max(0,sec-s.start),index:i,dayStart:ds};
}

const keyOf=s=>s.dayStart+':'+s.index+':'+s.type+':'+(s.track??'')+':'+(s.ad??'')+':'+(s.joke??'');

function paint(s){
  disc?.classList.toggle('live',false);
  if(s.type==='track'){
    left.textContent='MUSIC';nowTitle.textContent=s.title;nowSub.textContent='Музыка • случайный общий эфир';
    chip.textContent='SYNC';chip.classList.remove('hot');
  }else if(s.type==='adJingle'){
    left.textContent='РЕКЛАМА';nowTitle.textContent='TomMart — реклама';nowSub.textContent='Рекламный джингл';
    chip.textContent='AD';chip.classList.add('hot');
  }else if(s.type==='ad'){
    left.textContent='РЕКЛАМА';nowTitle.textContent=s.title;nowSub.textContent='Рекламный блок';
    chip.textContent='AD';chip.classList.add('hot');
  }else if(s.type==='jokeJingle'){
    left.textContent='АНЕКДОТ';nowTitle.textContent='TomMart — Анекдоты';nowSub.textContent='Начинается короткий анекдот';
    chip.textContent='SHOW';chip.classList.add('hot');
  }else if(s.type==='joke'){
    left.textContent='АНЕКДОТ';nowTitle.textContent=s.title;nowSub.textContent='Программа «Анекдоты»';
    chip.textContent='SHOW';chip.classList.add('hot');
  }else if(s.type==='laugh'){
    left.textContent='АНЕКДОТ';nowTitle.textContent='Смех в студии';nowSub.textContent='TomMart • Анекдоты';
    chip.textContent='SHOW';chip.classList.add('hot');
  }else{
    left.textContent='JINGLE';nowTitle.textContent='TomMart Radio Jingle';nowSub.textContent='Фирменный джингл TomMart';
    chip.textContent='JINGLE';chip.classList.add('hot');
  }
  right.textContent='ONLINE';
}

async function calibrateClock(){
  const vals=[];
  for(let i=0;i<5;i++){
    try{
      const t0=Date.now();
      const r=await fetch('v17.html?tmclock='+t0+'-'+i,{method:'HEAD',cache:'no-store'});
      const t1=Date.now(),h=r.headers.get('date');
      if(h){
        const server=Date.parse(h)+500,localMid=(t0+t1)/2;
        if(Number.isFinite(server))vals.push(server-localMid);
      }
    }catch(_){}
    await sleep(70);
  }
  if(vals.length){
    vals.sort((a,b)=>a-b);
    clockOffset=vals[Math.floor(vals.length/2)];
  }
}

async function waitReady(token){
  if(audio.readyState>=1&&Number.isFinite(audio.duration))return;
  await new Promise(res=>{
    let done=false;
    const finish=()=>{if(done)return;done=true;res();};
    audio.addEventListener('loadedmetadata',finish,{once:true});
    audio.addEventListener('canplay',finish,{once:true});
    audio.addEventListener('error',finish,{once:true});
    setTimeout(finish,5000);
  });
  if(token!==switchToken)throw new Error('STALE');
}

function clearBoundary(){
  if(boundaryTimer){clearTimeout(boundaryTimer);boundaryTimer=null;}
}
function scheduleBoundary(s){
  clearBoundary();
  boundaryTimer=setTimeout(()=>{
    currentKey='';
    sync(true,'boundary');
  },Math.max(80,(s.dur-s.offset)*1000+30));
}
function preloadNext(s){
  try{
    const seq=scheduleFor(radioNow()),n=seq[s.index+1];
    if(!n)return;
    if(preloader){preloader.src='';preloader=null;}
    preloader=new Audio();
    preloader.preload='auto';
    preloader.src=pathFor(n.file);
  }catch(_){}
}

async function switchTo(initial,reason='switch'){
  const token=++switchToken;
  clearBoundary();
  let s=initial;
  currentKey=keyOf(s);
  paint(s);
  setStatus('warn','Синхронизирую эфир…');

  try{audio.pause();}catch(_){}
  audio.src=pathFor(s.file);
  audio.load();

  try{await waitReady(token);}catch(e){if(e.message==='STALE')return;}
  if(token!==switchToken)return;

  const fresh=stateAt(radioNow());
  if(keyOf(fresh)!==currentKey)return switchTo(fresh,'changed-during-load');
  s=fresh;
  paint(s);

  const mediaDur=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:s.dur;
  try{audio.currentTime=Math.max(0,Math.min(s.offset,Math.max(0,mediaDur-.06)));}catch(_){}
  try{audio.playbackRate=1;}catch(_){}

  try{
    await audio.play();
    setStatus('ok','TomMart играет • синхронный эфир');
  }catch(_){
    setStatus('warn','Нажми СЛУШАТЬ TOMMART ещё раз');
  }
  scheduleBoundary(s);
  preloadNext(s);
}

async function sync(force=false,reason='tick'){
  if(!started||syncing)return;
  syncing=true;
  try{
    const s=stateAt(radioNow()),key=keyOf(s);
    paint(s);

    if(key!==currentKey||!audio.src){
      await switchTo(s,reason);
      return;
    }

    if(audio.paused||audio.ended){
      currentKey='';
      await switchTo(s,'paused-or-ended');
      return;
    }

    const diff=(audio.currentTime||0)-s.offset,ad=Math.abs(diff);
    if(force||ad>.24){
      try{audio.currentTime=s.offset;audio.playbackRate=1;}catch(_){}
      scheduleBoundary(s);
    }else if(ad>.05){
      try{audio.playbackRate=diff>0?0.985:1.015;}catch(_){}
    }else{
      try{audio.playbackRate=1;}catch(_){}
    }
  }finally{
    syncing=false;
  }
}

async function loadManifest(){
  const r=await fetch('durations-v15.json?v=20260814-17',{cache:'no-store'});
  if(!r.ok)throw new Error('MANIFEST_HTTP_'+r.status);
  manifest=await r.json();
  buildLibrary();
}

async function boot(){
  btn.disabled=true;btnText.textContent='ПОДГОТОВКА…';
  setStatus('warn','Загружаю точный таймлайн…');
  try{
    await Promise.all([loadManifest(),calibrateClock()]);
    scheduleFor(radioNow());
    left.textContent='ГОТОВО';right.textContent='SYNC';
    btn.disabled=false;btnText.textContent='СЛУШАТЬ TOMMART';
    setStatus('ok','Радио готово • '+LIB.length+' песен • '+JOKES.length+' анекдота');
  }catch(e){
    console.error(e);
    left.textContent='ERROR';right.textContent='ERROR';
    btn.disabled=true;btnText.textContent='ОШИБКА';
    setStatus('bad','Не удалось загрузить точный таймлайн');
  }
}

async function start(){
  if(!manifest)return;
  started=true;
  btn.disabled=true;btnText.textContent='ПОДКЛЮЧАЮ…';
  await calibrateClock();
  currentKey='';
  await sync(true,'start');
  btn.disabled=false;btnText.textContent='СЛУШАЮ TOMMART';
}

btn.onclick=start;

audio.addEventListener('ended',()=>{
  if(started){
    currentKey='';
    setTimeout(()=>sync(true,'ended'),15);
  }
});
audio.addEventListener('error',()=>{
  if(started){
    currentKey='';
    setStatus('warn','Переключаю эфир…');
    setTimeout(()=>sync(true,'error'),350);
  }
});
audio.addEventListener('stalled',()=>{
  if(started)setTimeout(()=>sync(true,'stalled'),500);
});

setInterval(()=>sync(false,'watchdog'),700);
setInterval(async()=>{
  if(!started)return;
  await calibrateClock();
  currentKey='';
  sync(true,'minute-resync');
},60000);

const revive=()=>{
  if(!started)return;
  currentKey='';
  setTimeout(()=>sync(true,'resume'),100);
};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')revive();});
window.addEventListener('pageshow',revive);
window.addEventListener('focus',revive);
window.addEventListener('online',revive);

boot();
})();