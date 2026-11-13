// Explicit production check, two independent WebSockets. Never logs invitation secrets.
import assert from 'node:assert/strict';
import '../assets/race-worlds.js';
const K=globalThis.KartWorlds,api='https://kart-go-jaylenn.thijs30051970.workers.dev';
const wait=async(f,label,ms=15000)=>{const end=Date.now()+ms;while(!f()){if(Date.now()>end)throw Error('Timeout: '+label);await new Promise(r=>setTimeout(r,25));}};
const last=(c,t)=>c.messages.filter(m=>m.type===t).at(-1);
for(const level of [1,72]){
 const clients=[];let timer;
 try{
  const response=await fetch(api+'/rooms',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'content-type':'application/json'},body:JSON.stringify({selection:{level,mode:'free'}})});assert.ok(response.ok);const invite=await response.json();
  for(let i=0;i<2;i++){const c={messages:[]};c.ws=new WebSocket(api.replace('https:','wss:')+'/rooms/'+invite.room+'/connect?secret='+invite.secret);c.send=m=>c.ws.send(JSON.stringify(m));c.ws.onmessage=e=>c.messages.push(JSON.parse(e.data));clients.push(c);await wait(()=>last(c,'welcome'),'welcome');c.id=last(c,'welcome').id;c.send({type:'profile',name:'Item QA '+i,engine:250,avatar:i,color:i});}
  const [a,b]=clients;await wait(()=>last(a,'lobby')?.players.length===2,'two players');for(const c of clients)c.send({type:'ready',ready:true});await wait(()=>last(a,'lobby')?.canStart,'ready');a.send({type:'start'});await wait(()=>last(a,'countdown')&&last(b,'countdown'),'joint countdown');assert.equal(last(a,'countdown').startAt,last(b,'countdown').startAt);
  timer=setInterval(()=>{for(const c of clients){const s=last(c,'snapshot'),p=s?.players.find(p=>p.id===c.id);if(!p)continue;const block=K.layout(s.selection,s.seed).find(o=>o.type==='block'&&o.d>p.d-5),target=c===a&&block?block.x:0;const steer=Math.max(-.8,Math.min(.8,(target-p.x)*3+K.geometry(level,p.d).curve*.055));c.send({type:'input',gas:true,steer,brake:false});}},100);
  await wait(()=>{const s=last(a,'snapshot'),p=s?.players.find(p=>p.id===a.id);return p&&K.layout(s.selection,s.seed).filter(o=>o.type==='block').every(o=>Math.abs(o.d-p.d)>18)&&p.speed>15&&p.penalty===0&&p.freeze===0&&p.inventory.some(v=>v!==null);},'moving player collects real Lucky Block',25000);
  const before=last(a,'snapshot'),p=before.players.find(p=>p.id===a.id),slot=p.inventory.findIndex(v=>v!==null),item=p.inventory[slot];
  // Explicit simultaneous throttle + nonzero steering precedes the use message.
  a.send({type:'input',gas:true,steer:.12,brake:false});a.send({type:'use',slot});
  await wait(()=>{const s=last(a,'snapshot'),p=s?.players.find(p=>p.id===a.id);return s.now>before.now&&p.inventory[slot]===null;},'server consumes item without releasing throttle');
  const applied=last(a,'snapshot'),me=applied.players.find(p=>p.id===a.id),other=applied.players.find(p=>p.id===b.id);assert.ok(me.speed>0&&me.d>p.d,'user continues driving');
  assert.ok([other.slow>0,other.hyp>0,me.boost>0,applied.bananas.some(v=>v.owner===a.id),me.jump>0,other.freeze>0][item],'server applies the collected power-up');
  await wait(()=>b.messages.some(s=>s.type==='snapshot'&&s.now===applied.now),'guest receives same effect frame');const guest=b.messages.find(s=>s.type==='snapshot'&&s.now===applied.now);assert.deepEqual(guest.players,applied.players,'both clients see identical authoritative racer/effect state');
  await wait(()=>last(a,'snapshot').players.find(p=>p.id===a.id).d>me.d+10,'driving continues after use');
  console.log('PASS LIVE level '+level+': two clients, shared start, real pickup at speed, item consumed/effect synchronized while gas + steering stay active, continued movement. No physical phone test.');
 }finally{clearInterval(timer);for(const c of clients)c.ws.close(1000);}
}
