// Explicit live integration test, two anonymous clients. Never prints invitation or resume credentials.
import assert from 'node:assert/strict';
const API=process.env.KART_GO_TEST_API||'https://kart-go-jaylenn.thijs30051970.workers.dev';
const health=await(await fetch(API+'/health')).json();assert.equal(health.version,'ultimate-repair-2','New server must be live before testing');
const wait=async(check,label,timeout=30000)=>{const end=Date.now()+timeout;while(!check()){if(Date.now()>end)throw Error('Timeout: '+label);await new Promise(r=>setTimeout(r,50));}};
const room=await(await fetch(API+'/rooms',{method:'POST'})).json(),base=API.replace(/^http/,'ws')+'/rooms/'+room.room+'/connect?secret='+encodeURIComponent(room.secret);
const clients=[],last=(c,t)=>c.messages.filter(m=>m.type===t).at(-1);
async function connect(resume){const ws=new WebSocket(base+(resume?'&resume='+encodeURIComponent(resume):'')),c={ws,messages:[]};clients.push(c);ws.onmessage=e=>c.messages.push(JSON.parse(e.data));c.send=m=>ws.readyState===1&&ws.send(JSON.stringify(m));await wait(()=>last(c,'welcome'),'welcome');return c;}
let interval;
try{
 const a=await connect(),b=await connect(),identity=last(a,'welcome');a.send({type:'profile',name:'QA Rejoin A',avatar:2,color:1});b.send({type:'profile',name:'QA Rejoin B',avatar:3,color:4});await wait(()=>last(a,'lobby')?.players.every(p=>p.name.startsWith('QA Rejoin')),'profiles');
 a.send({type:'ready',ready:true});b.send({type:'ready',ready:true});await wait(()=>last(a,'lobby')?.canStart,'ready');a.send({type:'start'});await wait(()=>last(b,'countdown'),'start');assert.equal(last(a,'countdown').startAt,last(b,'countdown').startAt);
 let driver=a;interval=setInterval(()=>{driver.send({type:'input',gas:true,steer:0});b.send({type:'input',gas:true,steer:0});},100);
 await wait(()=>last(a,'snapshot')?.players.every(p=>p.d>70),'shared movement');const distance=last(a,'snapshot').players.find(p=>p.id===identity.id).d;
 a.ws.close(1000);await wait(()=>last(b,'snapshot')?.players.find(p=>p.id===identity.id)?.connected===false,'disconnect');const resumed=await connect(identity.resume);assert.equal(last(resumed,'welcome').id,identity.id);await wait(()=>last(resumed,'snapshot'),'restored snapshot');assert.equal(last(resumed,'snapshot').players.length,2);assert.ok(last(resumed,'snapshot').players.find(p=>p.id===identity.id).d>=distance);driver=resumed;
 await wait(()=>last(resumed,'results')&&last(b,'results'),'shared finish after rejoin',65000);assert.deepEqual(last(resumed,'results').players,last(b,'results').players);assert.ok(last(b,'results').players.every(p=>p.finished&&p.d===1800));
 console.log(JSON.stringify({passed:true,liveServer:health.version,clients:2,sharedCountdown:true,positions:true,rejoinedSameIdentity:true,preservedDistance:true,noDuplicate:true,identicalFinish:true,physicalPhones:false}));
}finally{clearInterval(interval);for(const c of clients)try{c.ws.close(1000);}catch{}}
