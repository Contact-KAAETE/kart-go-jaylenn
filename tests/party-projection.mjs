import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import '../assets/race-worlds.js';
const K=globalThis.KartWorlds,context=vm.createContext({performance,Map,Math,globalThis:{KartWorlds:K}});vm.runInContext(fs.readFileSync('assets/world-race-renderer.js','utf8')+';globalThis.viewRenderer=WorldRace;',context);const R=context.globalThis.viewRenderer;
for(const [w,h] of [[390,520],[844,240],[1280,720]])for(const level of [1,51,71,72,73,74,75]){
 const me={id:'me',d:1000,x:.2},v=R.view(w,h,level,me,3),same=v.racer({id:'rival',d:me.d,x:me.x}),own=v.racer(me);assert.deepEqual(same,own,'same location means same size and feet, independent of player identity');
 const ahead=v.racer({d:me.d+100,x:me.x});assert.ok(ahead.k<own.k);assert.ok(ahead.y<own.y,'ahead is further up the road');assert.ok(v.racer({...me,x:.5}).x>v.racer({...me,x:-.5}).x,'right input appears right');assert.ok(Math.abs(own.y-h*.86)<1e-8);
 const point=v.project(me.d);assert.equal(own.x,point.x+me.x*point.half*.8,'racer and obstacle use identical lane mapping');assert.ok(v.project(me.d-v.behind).y>h*.95,'road remains under the player');
}
assert.equal(R.trainPose(74,10),null);assert.equal(R.trainPose(73,10),null);assert.equal(R.trainPose(71,10),null);assert.equal(R.trainPose(72,11).d-R.trainPose(72,10).d,28,'train travels in world metres, not attached to camera');assert.equal(R.trainPose(75,10).x,R.trainPose(72,10).x);
for(const level of [71,72,73,74,75])for(const engine of [250,509,1000])for(const dir of [-1,1]){
 const room={selection:K.selection({level}),seed:19,players:[{id:'p',engine}],startAt:0};K.setup(room);room.course=[];room.npcs=[];room.elapsed=0;const p=room.players[0];p.d=100;p.gas=true;p.steer=dir;p.speed=60;
 for(let i=0;i<30;i++){room.elapsed+=1/60;K.step(room,p,1/60,i*1000/60);}
 assert.ok(dir*p.x>.45,'held steering can cross a former invisible lane boundary without getting stuck');assert.equal(p.penalty,0);assert.equal(p.jump,0,'repair does not silently grant jump power-ups');
}
console.log('PASS shared player/rival sizes and ground points, monotonic perspective, visual/physics lane agreement, world-bound train, no train in Rodeo, steering both ways in all five Party levels and all motors.');
