import {Miniflare} from 'miniflare';import assert from 'node:assert/strict';import fs from 'node:fs';
const options={modules:true,scriptPath:'multiplayer/src/index.js',compatibilityDate:'2026-08-06',durableObjects:{RACE_ROOMS:{className:'RaceRoom',useSQLite:true}},bindings:{ALLOWED_ORIGIN:'https://contact-kaaete.github.io'}};
const mf=new Miniflare(options),clients=[],timers=[];
const wait=async(check,label,ms=10000)=>{const end=Date.now()+ms;while(!check()){if(Date.now()>end)throw Error('Timeout: '+label);await new Promise(r=>setTimeout(r,25));}};
const last=(c,type)=>c.messages.filter(m=>m.type===type).at(-1);
async function open(invitation,resume){const url=new URL('http://local/rooms/'+invitation.room+'/connect');url.searchParams.set('secret',invitation.secret);if(resume)url.searchParams.set('resume',resume);const result=await mf.dispatchFetch(url,{headers:{Upgrade:'websocket',Origin:'https://contact-kaaete.github.io'}});if(result.status!==101)return result;const c={ws:result.webSocket,messages:[]};c.ws.accept();c.ws.addEventListener('message',e=>c.messages.push(JSON.parse(e.data)));c.send=m=>c.ws.send(JSON.stringify(m));clients.push(c);await wait(()=>last(c,'welcome'),'welcome');return c;}
try{
 const health=await(await mf.dispatchFetch('http://local/health')).json();assert.equal(health.version,'boss-fair-4.1');
 assert.equal((await mf.dispatchFetch('http://local/rooms',{method:'POST',headers:{Origin:'https://evil.example'}})).status,403);
 const invitation=await(await mf.dispatchFetch('http://local/rooms',{method:'POST'})).json();
 assert.equal((await open({...invitation,secret:'A'.repeat(16)})).status,403);
 const a=await open(invitation),b=await open(invitation),wa=last(a,'welcome'),wb=last(b,'welcome');
 a.send({type:'profile',name:'Test A',avatar:2,color:1});b.send({type:'profile',name:'Test B',avatar:3,color:4});
 await wait(()=>last(a,'lobby')?.players.every(p=>p.name.startsWith('Test')),'profiles');
 assert.equal(last(a,'lobby').hostId,wa.id);assert.ok(!JSON.stringify(last(a,'lobby')).includes(wa.resume),'resume credential never broadcast');
 b.send({type:'start'});await wait(()=>last(b,'error'),'reject guest start');
 a.send({type:'ready',ready:true});b.send({type:'ready',ready:true});await wait(()=>last(a,'lobby')?.canStart,'ready');
 // Reconnection replaces this socket rather than registering another participant.
 const a2=await open(invitation,wa.resume);assert.equal(last(a2,'welcome').id,wa.id);assert.equal(last(a2,'lobby').players.length,2);assert.equal(last(a2,'lobby').hostId,wa.id);
 a2.send({type:'start'});await wait(()=>last(b,'countdown'),'shared start');assert.equal(last(a2,'countdown').startAt,last(b,'countdown').startAt);
 const blocked=await open(invitation);assert.equal(blocked.status,409,'new join rejected during race');
 const input=setInterval(()=>{for(const c of [a2,b])c.send({type:'input',gas:true,steer:.1});},100);
 timers.push(input);await wait(()=>last(a2,'snapshot')?.players.every(p=>p.d>30),'both driving',10000);clearInterval(input);
 const before=last(a2,'snapshot').players.find(p=>p.id===wa.id).d;a2.ws.close(1000);await wait(()=>last(b,'snapshot')?.players.find(p=>p.id===wa.id)?.connected===false,'disconnect detected');
 const resumed=await open(invitation,wa.resume);assert.equal(last(resumed,'welcome').id,wa.id);const restored=last(resumed,'snapshot').players.find(p=>p.id===wa.id);assert.ok(restored.d>=before);assert.equal(last(resumed,'snapshot').players.length,2);
 await wait(()=>last(resumed,'snapshot')?.players.every(p=>p.speed===0),'stale input released',6000);
 const finishInput=setInterval(()=>{for(const c of [resumed,b])c.send({type:'input',gas:true,steer:0});},100);timers.push(finishInput);await wait(()=>last(resumed,'results')&&last(b,'results'),'both finish',40000);clearInterval(finishInput);assert.deepEqual(last(resumed,'results').players,last(b,'results').players);assert.ok(last(b,'results').players.every(p=>p.finished&&p.d===1800));console.log('PASS runtime: both players finish after reconnect, identical authoritative results.');
 // Real persisted storage survives recreation of the runtime with a persistent directory.
 console.log('PASS runtime: CORS, invitation checks, explicit host/guest rights, shared countdown/movement, no token leakage, mid-race reconnect preserving position, no duplicate, stale input stop.');
 // Capacity and host departure in a fresh lobby.
 const room2=await(await mf.dispatchFetch('http://local/rooms',{method:'POST'})).json(),six=[];for(let i=0;i<6;i++)six.push(await open(room2));assert.equal((await open(room2)).status,409);
 const first=last(six[0],'welcome').id;six[0].ws.close(1000);await wait(()=>last(six[1],'lobby')?.hostId!==first,'host transfer');assert.equal(last(six[1],'lobby').hostId,last(six[1],'welcome').id);
 console.log('PASS runtime: six seats, seventh refused, host transfer.');
}finally{for(const timer of timers)clearInterval(timer);for(const c of clients)try{c.ws.close(1000);}catch{}await mf.dispose();}
// A clean runtime restart with SQLite persistence must still accept the invitation and resume token.
const persist=fs.mkdtempSync('/tmp/kart-go-runtime-');let runtime=new Miniflare({...options,durableObjectsPersist:persist});let invite,token,id;
try{
 invite=await(await runtime.dispatchFetch('http://local/rooms',{method:'POST'})).json();const r=await runtime.dispatchFetch('http://local/rooms/'+invite.room+'/connect?secret='+invite.secret,{headers:{Upgrade:'websocket'}});const ws=r.webSocket,received=[];ws.accept();ws.addEventListener('message',e=>received.push(JSON.parse(e.data)));await wait(()=>received.some(m=>m.type==='welcome'),'persistent welcome');const welcome=received.find(m=>m.type==='welcome');token=welcome.resume;id=welcome.id;ws.close(1000);await new Promise(r=>setTimeout(r,150));await runtime.dispose();
 runtime=new Miniflare({...options,durableObjectsPersist:persist});const result=await runtime.dispatchFetch('http://local/rooms/'+invite.room+'/connect?secret='+invite.secret+'&resume='+token,{headers:{Upgrade:'websocket'}});assert.equal(result.status,101);const ws2=result.webSocket,m=[];ws2.accept();ws2.addEventListener('message',e=>m.push(JSON.parse(e.data)));await wait(()=>m.some(x=>x.type==='welcome'),'restore after restart');assert.equal(m.find(x=>x.type==='welcome').id,id);ws2.close(1000);console.log('PASS runtime: invitation and identity restored after full SQLite runtime restart.');
}finally{await runtime.dispose();fs.rmSync(persist,{recursive:true,force:true});}
