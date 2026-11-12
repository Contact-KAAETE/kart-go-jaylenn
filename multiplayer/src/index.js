// Standalone six-player Kart Go multiplayer proof of concept.
// This is NOT the existing Kart Go physics or its 70 levels.
const MAX = 6, LENGTH = 1800, TICK_MS = 100, MAX_AGE = 2 * 60 * 60 * 1000;
const clean = x => String(x ?? '').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,18);
const reply = (value,status=200) => new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':'*'}});
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code() { const b=crypto.getRandomValues(new Uint8Array(8));return Array.from(b,n=>alphabet[n%alphabet.length]).join(''); }
export default {
 async fetch(request,env) {
  const url=new URL(request.url), origin=request.headers.get('Origin');
  if(origin && origin!==env.ALLOWED_ORIGIN) return reply({error:'Origin blocked'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':env.ALLOWED_ORIGIN,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}});
  if(url.pathname==='/health')return reply({ok:true,phase:'prototype',maxPlayers:MAX});
  if(url.pathname==='/rooms' && request.method==='POST') {
   const room=code(), secret=code()+code();
   const id=env.RACE_ROOMS.idFromName(room);
   const response=await env.RACE_ROOMS.get(id).fetch(new Request('https://room.local/init',{method:'POST',headers:{'x-room-secret':secret}}));
   if(!response.ok)return reply({error:'Room creation failed'},500);
   return reply({room,secret,endpoint:new URL('/rooms/'+room+'/connect',request.url).toString().replace(/^http/,'ws')},201);
  }
  const m=/^\/rooms\/([A-HJ-NP-Z2-9]{8})\/connect$/.exec(url.pathname);
  if(!m||request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return reply({error:'Not found'},404);
  return env.RACE_ROOMS.get(env.RACE_ROOMS.idFromName(m[1])).fetch(new Request('https://room.local/connect?secret='+encodeURIComponent(url.searchParams.get('secret')||''),request));
 }
};
export class RaceRoom {
 constructor(state,env) {this.state=state;this.env=env;this.players=new Map();this.phase='lobby';this.startAt=0;this.lastTick=0;this.created=0;this.timer=null;this.secret=null;}
 async fetch(req) {
  const url=new URL(req.url);
  if(url.pathname==='/init') {
   if(this.secret)return reply({error:'Exists'},409);
   this.secret=req.headers.get('x-room-secret');this.created=Date.now();
   return reply({ok:true});
  }
  if(!this.secret||url.searchParams.get('secret')!==this.secret)return reply({error:'Invalid room invitation'},403);
  if(Date.now()-this.created>MAX_AGE)return reply({error:'Room expired'},410);
  if(this.phase!=='lobby'||this.players.size>=MAX)return reply({error:'Race started or room full'},409);
  const pair=new WebSocketPair(), client=pair[0], socket=pair[1];socket.accept();
  const p={id:crypto.randomUUID(),name:'Coureur',avatar:0,color:0,ready:false,d:0,x:0,speed:0,steer:0,gas:false,finished:false,finishAt:null};
  this.players.set(socket,p);
  socket.addEventListener('message',e=>{
   try {
    if(typeof e.data!=='string'||e.data.length>512)return;
    const msg=JSON.parse(e.data);
    if(msg.type==='profile'&&this.phase==='lobby'){p.name=clean(msg.name)||'Coureur';p.avatar=Number.isInteger(msg.avatar)?Math.max(0,Math.min(11,msg.avatar)):0;p.color=Number.isInteger(msg.color)?Math.max(0,Math.min(19,msg.color)):0;p.ready=false;}
    else if(msg.type==='ready'&&this.phase==='lobby')p.ready=msg.ready===true;
    else if(msg.type==='start'&&this.phase==='lobby'&&this.players.values().next().value===p&&this.players.size>=2&&[...this.players.values()].every(v=>v.ready))this.start();
    else if(msg.type==='input'&&this.phase==='race'){p.gas=msg.gas===true;p.steer=Number.isFinite(msg.steer)?Math.max(-1,Math.min(1,msg.steer)):0;}
    else if(msg.type==='ping'){socket.send(JSON.stringify({type:'pong',time:Date.now()}));return;}
    else return;
    if(this.phase==='lobby')this.broadcast({type:'lobby',players:[...this.players.values()].map(v=>({id:v.id,name:v.name,avatar:v.avatar,color:v.color,ready:v.ready})),canStart:this.players.size>=2&&[...this.players.values()].every(v=>v.ready)});
   }catch{}
  });
  const leave=()=>{this.players.delete(socket);if(this.phase==='lobby')this.broadcast({type:'lobby',players:[...this.players.values()].map(v=>({id:v.id,name:v.name,avatar:v.avatar,color:v.color,ready:v.ready})),canStart:false});if(!this.players.size&&this.timer){clearInterval(this.timer);this.timer=null;}};
  socket.addEventListener('close',leave);socket.addEventListener('error',leave);
  socket.send(JSON.stringify({type:'welcome',id:p.id,maxPlayers:MAX}));
  this.broadcast({type:'lobby',players:[...this.players.values()].map(v=>({id:v.id,name:v.name,avatar:v.avatar,color:v.color,ready:v.ready})),canStart:false});
  return new Response(null,{status:101,webSocket:client});
 }
 broadcast(obj){const data=JSON.stringify(obj);for(const s of this.players.keys())try{s.send(data)}catch{}}
 start(){this.phase='race';this.startAt=Date.now()+3000;this.lastTick=this.startAt;this.broadcast({type:'countdown',startAt:this.startAt});this.timer=setInterval(()=>this.tick(),TICK_MS);}
 tick(){
  const now=Date.now();if(now<this.startAt)return;
  const dt=Math.min(.2,Math.max(0,(now-this.lastTick)/1000));this.lastTick=now;
  for(const p of this.players.values()){
   if(p.finished)continue;
   const target=p.gas?85:0;
   p.speed+=Math.max(-80*dt,Math.min(55*dt,target-p.speed));
   p.d=Math.min(LENGTH,p.d+p.speed*dt);
   p.x=Math.max(-1,Math.min(1,p.x+p.steer*dt*1.6));
   if(p.d>=LENGTH){p.finished=true;p.finishAt=now;}
  }
  const players=[...this.players.values()].map(p=>({id:p.id,name:p.name,avatar:p.avatar,color:p.color,d:p.d,x:p.x,speed:p.speed,finished:p.finished,finishAt:p.finishAt}));
  this.broadcast({type:'snapshot',players,length:LENGTH,now});
  if(players.every(p=>p.finished)||now-this.startAt>120000){this.phase='done';clearInterval(this.timer);this.timer=null;this.broadcast({type:'results',players:players.sort((a,b)=>(a.finishAt??Infinity)-(b.finishAt??Infinity)||b.d-a.d)});}
 }
}
