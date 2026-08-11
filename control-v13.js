(()=>{
'use strict';
const M=window.TM13=window.TM13||{};
M.BROKER='wss://broker.emqx.io:8084/mqtt';
M.BASE='tommart/v13/91c4e2d7a8-7f3b9a21';
M.TOPICS={state:M.BASE+'/state',presence:M.BASE+'/presence',ping:M.BASE+'/ping',adminSignal:M.BASE+'/signal/admin'};
M.pong=id=>M.BASE+'/pong/'+id;
M.signal=id=>M.BASE+'/signal/'+id;
M.makeId=()=>{try{let id=localStorage.getItem('tommart_v13_listener_id');if(!id){id=(crypto.randomUUID?crypto.randomUUID():'u-'+Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem('tommart_v13_listener_id',id)}return id}catch(_){return'u-'+Math.random().toString(36).slice(2)+Date.now().toString(36)}};
M.json=x=>{try{return JSON.parse(x.toString())}catch(_){return null}};
M.connect=(role,id,onMessage,onStatus)=>{
 const clientId='tm13_'+role+'_'+String(id||'admin').replace(/[^a-zA-Z0-9]/g,'').slice(-12)+'_'+Math.random().toString(16).slice(2,8);
 const c=mqtt.connect(M.BROKER,{clientId,clean:true,keepalive:20,reconnectPeriod:1500,connectTimeout:10000,protocolVersion:4,resubscribe:true});
 const subs=role==='admin'?[M.TOPICS.presence,M.TOPICS.ping,M.TOPICS.adminSignal]:[M.TOPICS.state,M.pong(id),M.signal(id)];
 c.on('connect',()=>{c.subscribe(subs,{qos:0},()=>{try{onStatus&&onStatus(true)}catch(_){}})});
 c.on('reconnect',()=>{try{onStatus&&onStatus(false,'reconnect')}catch(_){}});
 c.on('offline',()=>{try{onStatus&&onStatus(false,'offline')}catch(_){}});
 c.on('close',()=>{try{onStatus&&onStatus(false,'close')}catch(_){}});
 c.on('error',()=>{try{onStatus&&onStatus(false,'error')}catch(_){}});
 c.on('message',(topic,payload)=>{const m=M.json(payload);if(m)try{onMessage&&onMessage(topic,m)}catch(err){console.error('TM13 message',err)}});
 const pub=(topic,obj,opt={})=>{if(!c)return false;try{c.publish(topic,JSON.stringify(obj),{qos:opt.qos||0,retain:!!opt.retain});return true}catch(_){return false}};
 return{client:c,pub,connected:()=>!!c.connected,end:()=>{try{c.end(true)}catch(_){}}};
};
M.setSyncLabel=text=>{const T=window.TM,card=T.$('studioCard'),ps=T.$('peerState');if(card){const first=card.querySelector('.row span');if(first)first.textContent='TomMart MQTT'}if(ps)ps.textContent=text};
})();
