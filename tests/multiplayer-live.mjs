// Opt-in integration test: creates one temporary room, prints no invitation credentials.
import assert from 'node:assert/strict';
const API=process.env.KART_GO_TEST_API||'https://kart-go-jaylenn.thijs30051970.workers.dev';
const wait=async(condition,label,timeout=30000)=>{const end=Date.now()+timeout;while(!condition()){if(Date.now()>end)throw Error('Timeout: '+label);await new Promise(r=>setTimeout(r,50));}};
const response=await fetch(API+'/rooms',{method:'POST'});assert.equal(response.status,201);const invitation=await response.json(),url=API.replace(/^http/,'ws')+'/rooms/'+invitation.room+'/connect?secret='+encodeURIComponent(invitation.secret);
const received=[[],[]],sockets=[];let allDone=false;
try{
 for(let i=0;i<2;i++){const ws=new WebSocket(url);sockets.push(ws);ws.onopen=()=>ws.send(JSON.stringify({type:'profile',name:'QA Racer '+(i+1),avatar:i+1,color:i+2}));ws.onmessage=e=>received[i].push(JSON.parse(e.data));await wait(()=>received[i].some(m=>m.type==='welcome'),'player welcome');}
 await wait(()=>received.every(ms=>ms.some(m=>m.type==='lobby'&&m.players.length===2&&m.players.every(p=>p.name.startsWith('QA Racer')))),'shared participants');
 for(const ws of sockets)ws.send(JSON.stringify({type:'ready',ready:true}));await wait(()=>received.every(ms=>ms.some(m=>m.type==='lobby'&&m.canStart)),'both ready');
 const mine=received[0].find(m=>m.type==='welcome').id,leader=received[0].filter(m=>m.type==='lobby').at(-1).players[0].id;const host=mine===leader?0:1;sockets[host].send(JSON.stringify({type:'start'}));
 await wait(()=>received.every(ms=>ms.some(m=>m.type==='countdown')),'shared countdown');assert.equal(received[0].find(m=>m.type==='countdown').startAt,received[1].find(m=>m.type==='countdown').startAt);
 const input=setInterval(()=>{for(let i=0;i<2;i++)if(sockets[i].readyState===1)sockets[i].send(JSON.stringify({type:'input',gas:true,steer:i?-.15:.15}));},100);
 try{await wait(()=>received.every(ms=>ms.some(m=>m.type==='snapshot'&&m.players.every(p=>p.d>50))),'shared movement');await wait(()=>received.every(ms=>ms.some(m=>m.type==='results')),'shared finish',65000);}finally{clearInterval(input);}
 const result=received.map(ms=>ms.find(m=>m.type==='results').players.map(p=>({id:p.id,name:p.name,d:p.d,finished:p.finished,finishAt:p.finishAt})));assert.deepEqual(result[0],result[1]);assert.ok(result[0].every(p=>p.finished&&p.d===1800));
 console.log(JSON.stringify({passed:true,clients:2,sharedRoster:true,bothReady:true,sameCountdown:true,sharedMovement:true,identicalFinish:true,notes:'Independent Node WebSocket clients; not physical phones. Existing training circuit only.'}));allDone=true;
}finally{for(const ws of sockets)ws.close(1000);if(!allDone)process.exitCode=1;}
