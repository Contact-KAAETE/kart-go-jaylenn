import '../../assets/race-worlds.js';
const Worlds=globalThis.KartWorlds;
// KART GO — Bedacht door Jaylenn. Shared online worlds, protocol 3.
// One self-contained module for the existing Cloudflare Worker and RaceRoom binding.
const VERSION='boss-fair-4.1', MAX=6, LENGTH=1800, TICK_MS=100;
const MAX_AGE=7200000, REJOIN=90000, ORIGIN='https://contact-kaaete.github.io';
const clean=x=>String(x??'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,18);
const reply=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':ORIGIN}});
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code(){return Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>alphabet[n%32]).join('');}
function token(){return crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');}
export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('Origin');
  if(origin&&origin!==(env.ALLOWED_ORIGIN||ORIGIN))return reply({error:'Origin blocked'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':ORIGIN,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}});
  if(url.pathname==='/health')return reply({ok:true,phase:'worlds',version:VERSION,protocol:3,maxPlayers:MAX,features:['resume','durable-rooms','explicit-host','worlds','items','chicken-riders','stunts','armed-bots']});
  if(!env.RACE_ROOMS)return reply({error:'RaceRoom binding ontbreekt.'},503);
  if(url.pathname==='/rooms'&&request.method==='POST'){
   let body={};try{const text=await request.text();if(text.length>2048)return reply({error:'Aanvraag te groot'},413);if(text)body=JSON.parse(text);}catch{return reply({error:'Ongeldige kamerkeuze'},400);}
   const room=code(),secret=code()+code();
   const result=await env.RACE_ROOMS.get(env.RACE_ROOMS.idFromName(room)).fetch(new Request('https://room.local/init',{method:'POST',headers:{'x-room-secret':secret,'content-type':'application/json'},body:JSON.stringify({selection:Worlds.selection(body.selection)})}));
   if(!result.ok)return reply({error:'Kamer maken mislukt.'},503);
   return reply({room,secret,version:VERSION,endpoint:new URL('/rooms/'+room+'/connect',url).href.replace(/^http/,'ws')},201);
  }
  const match=/^\/rooms\/([A-HJ-NP-Z2-9]{8})\/connect$/.exec(url.pathname);
  if(!match||request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return reply({error:'Not found'},404);
  return env.RACE_ROOMS.get(env.RACE_ROOMS.idFromName(match[1])).fetch(request);
 }
};
export class RaceRoom {
 constructor(ctx,env){
  this.ctx=ctx;this.env=env;this.room=null;this.sockets=new Map();this.timer=null;this.lastSaved=0;this.rate=new Map();this.busy=false;
  ctx.blockConcurrencyWhile(async()=>{
   this.room=await ctx.storage.get('room-v2')||null;
   if(!this.room)return;
   this.upgrade();
   for(const socket of ctx.getWebSockets()){const a=socket.deserializeAttachment();if(a?.id)this.sockets.set(a.id,socket);}
   for(const p of this.room.players){p.gas=false;p.steer=0;p.brake=false;p.lastInput=0;if(!this.sockets.has(p.id))p.disconnectedAt ||= Date.now();}
   this.room.lastTick=Date.now();this.ensureTimer();
  });
 }
 upgrade(){const r=this.room;if(!r.selection)r.selection=Worlds.selection();r.seed ||=1;r.event ||= {cat:false,catAt:0,removedLane:-.62,d:0};r.claimed ||= [];r.bananas ||= [];r.holes ||= [];r.shots ||= [];r.npcs ||= [];r.nextShot ||=10;r.nextRoyal ||=12;for(const p of r.players)if(!p.inventory){const old={...p};Worlds.initRacer(p);Object.assign(p,old);}}
 async save(){if(this.room){await this.ctx.storage.put('room-v2',this.room);this.lastSaved=Date.now();}}
 async fetch(req){
  const url=new URL(req.url),now=Date.now();
  if(url.pathname==='/init'){
   if(req.method!=='POST')return reply({error:'Method not allowed'},405);
   if(this.room)return reply({error:'Exists'},409);
   const secret=req.headers.get('x-room-secret');if(!/^[A-HJ-NP-Z2-9]{16}$/.test(secret||''))return reply({error:'Invalid initialization'},400);
   const payload=await req.json();this.room={secret,created:now,phase:'lobby',hostId:null,players:[],startAt:0,lastTick:0,pauseAt:0,selection:Worlds.selection(payload.selection),seed:crypto.getRandomValues(new Uint32Array(1))[0]};this.upgrade();
   await this.save();await this.ctx.storage.setAlarm(now+MAX_AGE);return reply({ok:true});
  }
  if(!this.room||url.searchParams.get('secret')!==this.room.secret)return reply({error:'Deze uitnodiging is verlopen.'},403);
  if(now-this.room.created>=MAX_AGE)return reply({error:'Deze uitnodiging is verlopen.'},410);
  const resume=url.searchParams.get('resume'),r=this.room;
  this.prune(now);let p=resume?r.players.find(p=>p.resume===resume):null;
  if(resume&&!p)return reply({error:'Je plek is verlopen. Vraag een nieuwe uitnodiging.'},403);
  if(!p&&r.phase!=='lobby')return reply({error:'Deze race is al begonnen.'},409);
  if(!p&&r.players.length>=MAX)return reply({error:'Deze kamer is vol.'},409);
  const pair=new WebSocketPair(),client=pair[0],socket=pair[1];
  if(!p){p={id:crypto.randomUUID(),resume:token(),name:'Coureur',avatar:0,color:0,ready:false,d:0,x:0,speed:0,steer:0,gas:false,brake:false,finished:false,finishAt:null,lastInput:0,disconnectedAt:0};Worlds.initRacer(p);p.engine=250;p.chicken=0;p.wins=[];r.players.push(p);}
  const old=this.sockets.get(p.id);this.sockets.set(p.id,socket);
  socket.serializeAttachment({id:p.id});this.ctx.acceptWebSocket(socket);
  if(old)try{old.close(1000,'Vervangen door herverbinding');}catch{}
  p.disconnectedAt=0;p.gas=false;p.steer=0;p.brake=false;p.lastInput=0;
  if(r.pauseAt){const pause=now-r.pauseAt;r.startAt+=pause;r.lastTick=now;r.pauseAt=0;}
  this.chooseHost();await this.save();
  this.send(socket,{type:'welcome',id:p.id,resume:p.resume,maxPlayers:MAX,protocol:3,version:VERSION,phase:r.phase,resumed:!!resume,startAt:r.startAt,now});
  if(r.phase==='lobby')this.lobby();else{if(r.phase==='race')this.send(socket,{type:'countdown',startAt:r.startAt});this.send(socket,this.snapshot());if(r.phase==='done')this.send(socket,this.results());}
  this.ensureTimer();return new Response(null,{status:101,webSocket:client});
 }
 chooseHost(){if(!this.sockets.has(this.room.hostId))this.room.hostId=this.room.players.find(p=>this.sockets.has(p.id))?.id||null;}
 prune(now){if(this.room.phase==='lobby')this.room.players=this.room.players.filter(p=>this.sockets.has(p.id)||!p.disconnectedAt||now-p.disconnectedAt<REJOIN);}
 send(socket,data){try{socket.send(JSON.stringify(data));}catch{}}
 broadcast(data){for(const s of this.sockets.values())this.send(s,data);}
 publicPlayers(){return this.room.players.map(p=>({engine:p.engine||250,chicken:p.chicken||0,inventory:p.inventory,boost:p.boost,jump:p.jump,jumpDuration:p.jumpDuration,jumpLift:p.jumpLift,freeze:p.freeze,spin:p.spin,hyp:p.hyp,slow:p.slow,penalty:p.penalty,splash:p.splash,score:p.score,checkpoint:p.checkpoint,id:p.id,name:p.name,avatar:p.avatar,color:p.color,ready:p.ready&&this.sockets.has(p.id),connected:this.sockets.has(p.id),d:p.d,x:p.x,speed:p.finished?0:p.speed,steer:p.steer,finished:p.finished,finishAt:p.finishAt}));}
 lobby(){const players=this.publicPlayers(),active=players.filter(p=>p.connected);this.broadcast({type:'lobby',selection:this.room.selection,seed:this.room.seed,players,hostId:this.room.hostId,canStart:active.length>=2&&active.every(p=>p.ready)});}
 snapshot(){return{type:'snapshot',hostId:this.room.hostId,players:this.publicPlayers(),length:Worlds.length(this.room.selection.level),now:Date.now(),startAt:this.room.startAt,selection:this.room.selection,seed:this.room.seed,npcs:this.room.npcs,claimed:this.room.claimed,event:this.room.event,elapsed:this.room.elapsed||0,shots:this.room.shots,holes:this.room.holes,bananas:this.room.bananas,royal:this.room.royal};}
 results(){return{type:'results',selection:this.room.selection,players:[...this.publicPlayers(),...this.room.npcs].sort((a,b)=>(a.finishAt??Infinity)-(b.finishAt??Infinity)||b.d-a.d)};}
 async webSocketMessage(socket,data){
  const id=socket.deserializeAttachment()?.id,p=this.room?.players.find(p=>p.id===id);
  if(!p||this.sockets.get(id)!==socket)return;
  if(typeof data!=='string'||data.length>1024){socket.close(1009,'Bericht te groot');return;}
  const now=Date.now();let rate=this.rate.get(id);if(!rate||now-rate.at>=1000){rate={at:now,n:0};this.rate.set(id,rate);}if(++rate.n>40)return;
  let m;try{m=JSON.parse(data);}catch{return;}if(!m||typeof m!=='object')return;
  const r=this.room;
  if(now-r.created>=MAX_AGE){await this.alarm();return;}
  if(m.type==='ping'){this.send(socket,{type:'pong',time:now});return;}
  if(m.type==='profile'&&r.phase==='lobby'){p.name=clean(m.name)||'Coureur';p.avatar=Number.isInteger(m.avatar)?Math.max(0,Math.min(11,m.avatar)):0;p.color=Number.isInteger(m.color)?Math.max(0,Math.min(19,m.color)):0;p.engine=[250,509,1000].includes(m.engine)?m.engine:250;p.chicken=Number.isInteger(m.chicken)?Math.max(0,Math.min(2,m.chicken)):0;p.wins=Array.isArray(m.wins)?[...new Set(m.wins.filter(n=>Number.isInteger(n)&&n>=1&&n<=75))].slice(0,75):[];p.ready=false;}
  else if(m.type==='selection'&&id===r.hostId&&['lobby','done'].includes(r.phase)){r.selection=Worlds.selection(m.selection);r.phase='lobby';for(const p of r.players)p.ready=false;}
  else if(m.type==='use'&&r.phase==='race'&&now>=r.startAt){Worlds.use(r,p,m.slot);return;}
  else if(m.type==='jump'&&r.phase==='race'&&r.selection.world===4&&now>=r.startAt){if(p.jump<=0&&p.penalty<=0)Worlds.launch(p);return;}
  else if(m.type==='ready'&&r.phase==='lobby')p.ready=m.ready===true;
  else if(m.type==='start'&&r.phase==='lobby'){
   const active=r.players.filter(p=>this.sockets.has(p.id));
   if(id!==r.hostId||active.length<2||!active.every(p=>p.ready)){this.send(socket,{type:'error',message:'Alleen de organisator start als minstens twee coureurs klaar zijn.'});return;}
   // A disconnected participant may rejoin the lobby but must not gain a race seat after start.
   if(r.selection.mode==='adventure'&&!active.some(p=>p.wins?.includes(r.selection.level))){this.send(socket,{type:'error',message:'Avontuur: minstens één coureur moet dit level al gewonnen hebben. Kies anders Vrij racen.'});return;}
   r.players=active;Worlds.setup(r);r.phase='race';r.startAt=now+3000;r.lastTick=r.startAt;
   await this.save();this.broadcast({type:'countdown',startAt:r.startAt});this.ensureTimer();return;
  }
  else if(m.type==='input'&&r.phase==='race'){p.gas=m.gas===true;p.brake=m.brake===true;p.steer=Number.isFinite(m.steer)?Math.max(-1,Math.min(1,m.steer)):0;p.lastInput=now;return;}
  else return;
  await this.save();if(r.phase==='lobby')this.lobby();
 }
 async webSocketClose(socket){await this.disconnect(socket);}
 async webSocketError(socket){await this.disconnect(socket);}
 async disconnect(socket){
  const id=socket.deserializeAttachment()?.id;if(this.sockets.get(id)!==socket||!this.room)return;
  this.sockets.delete(id);this.rate.delete(id);const p=this.room.players.find(p=>p.id===id);
  if(p){p.disconnectedAt=Date.now();p.gas=false;p.steer=0;p.speed=0;p.brake=false;p.ready=false;}
  this.chooseHost();if(!this.sockets.size){this.stopTimer();if(this.room.phase==='race')this.room.pauseAt=Date.now();}
  await this.save();if(this.room.phase==='lobby')this.lobby();else this.broadcast(this.snapshot());
 }
 ensureTimer(){if(this.room?.phase==='race'&&this.sockets.size&&!this.timer)this.timer=setInterval(()=>{if(!this.busy){this.busy=true;this.tick().catch(()=>{this.stopTimer();this.broadcast({type:'error',message:'De server kan de race niet bewaren. Verbind opnieuw.'});}).finally(()=>this.busy=false);}},TICK_MS);}
 stopTimer(){if(this.timer)clearInterval(this.timer);this.timer=null;}
 async tick(){
  const r=this.room,now=Date.now();if(!r||r.phase!=='race'||now<r.startAt)return;
  const dt=Math.min(.2,Math.max(0,(now-r.lastTick)/1000));r.lastTick=now;
  Worlds.tick(r,dt,now,id=>this.sockets.has(id));
  this.broadcast(this.snapshot());
  if(r.players.every(p=>p.finished)||now-r.startAt>=(r.selection.level?360000:120000)){r.phase='done';this.stopTimer();await this.save();this.broadcast(this.results());}
  else if(now-this.lastSaved>=1000)await this.save();
 }
 async alarm(){
  if(this.room&&Date.now()-this.room.created<MAX_AGE){await this.ctx.storage.setAlarm(this.room.created+MAX_AGE);return;}
  this.stopTimer();for(const socket of this.sockets.values())try{socket.close(1000,'Deze uitnodiging is verlopen.');}catch{}
  this.sockets.clear();this.room=null;await this.ctx.storage.deleteAll();
 }
}
