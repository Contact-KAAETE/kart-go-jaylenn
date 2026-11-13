import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import '../assets/race-worlds.js';
const K=globalThis.KartWorlds;
const make=(level=1,count=2,engine=1000)=>{const r={selection:K.selection({level}),seed:31,startAt:0,players:Array.from({length:count},(_,i)=>({id:'p'+i,engine,lastInput:0}))};K.setup(r);r.elapsed=0;return r;};
for(let level=1;level<=75;level++){
 const r=make(level),ramps=r.course.filter(o=>o.fullWidth);assert.ok(ramps.length>=2,'multiple wide launches, even in the first level');
 const curves=Array.from({length:K.length(level)},(_,d)=>K.geometry(level,d));assert.ok(Math.max(...curves.map(g=>g.curve))>2.5&&Math.min(...curves.map(g=>g.curve))< -2.5,'left and right turns');assert.ok(Math.max(...curves.map(g=>g.height))-Math.min(...curves.map(g=>g.height))>12,'substantial elevation');
 const p=r.players[0],ramp=ramps[0];Object.assign(p,{d:ramp.d-2,x:.7,speed:80,gas:true});K.step(r,p,.05,50);assert.ok(p.jump>1.4&&p.jumpLift>1.5,'full width jump launches off centre');assert.ok(p.boost>0);assert.equal(p.penalty,0);assert.ok(p.seen.includes(ramp.id));
 K.launch(p);assert.equal(p.jumpDuration,p.jump,'manual and ramp jumps share their duration');
 for(const n of [2,3,4,5,6]){const room=make(level,n);assert.equal(room.npcs.length,[20,50,70].includes(level)?1:6-n);assert.ok(room.npcs.every(bot=>bot.bot));}
}
// Full-rate bot simulation: no 0.88 time multiplier, a racing line compensates bends.
for(const engine of [250,509,1000]){
 const r=make(1,2,engine);r.course=[];for(const p of r.npcs)p.inventory=[null,null,null];
 for(let i=1;i<=200;i++){for(const p of r.players){p.lastInput=i*100;p.gas=true;p.steer=Math.max(-1,Math.min(1,-p.x*3+K.geometry(1,p.d).curve*.055));}K.tick(r,.1,i*100,()=>true);}
 assert.ok(r.npcs.every(p=>p.d>r.players[0].d+20),'bots challenge full throttle at every engine class');assert.ok(r.npcs.every(p=>p.penalty===0&&Math.abs(p.x)<1.1),'bots stay on their racing line');
}
// Real AI emits visible, finite projectiles, spends ammunition, and banana traps.
for(const [level,item,kind] of [[1,0,'storm'],[1,1,'hyp'],[21,5,'ice'],[51,5,'ice']]){
 const r=make(level),bot=r.npcs[0];r.npcs=[bot];r.course=[];bot.d=40;bot.x=0;bot.inventory=[item,null,null];bot.nextAttack=0;const p=r.players[0];p.d=60;p.x=0;p.lastInput=100;K.tick(r,.1,100,()=>true);assert.equal(bot.inventory[0],null);assert.ok(r.shots.some(s=>s.owner===bot.id&&s.kind===kind));
 const shot=r.shots[0];Object.assign(p,{d:shot.d,x:shot.x,jump:0,invincible:0});K.step(r,p,.01,110);assert.ok(p[item===0?'slow':item===1?'hyp':'freeze']>0,'a shot has a real collision effect');assert.ok(shot.used);
}
{const r=make(1),bot=r.npcs[0];r.npcs=[bot];r.course=[];bot.inventory=[3,null,null];bot.nextAttack=0;r.players[0].d=30;r.players[0].lastInput=100;K.tick(r,.1,100,()=>true);assert.equal(bot.inventory[0],null);assert.equal(r.bananas[0].owner,bot.id);}
// Every boss alternates its attack types, keeping the original 10 second cadence.
for(const level of [20,50,70]){const r=make(level);r.course=[];const kinds=[];for(const now of [10000,20000,30000]){for(const p of r.players)p.lastInput=now;K.tick(r,.01,now,()=>true);kinds.push(r.shots.at(-1)?.kind);}assert.deepEqual(kinds,['ice','storm','hyp']);}
// Same camera for all racers; integration yields a visible road bend on phone sizes.
const context=vm.createContext({performance,Map,Math,globalThis:{KartWorlds:K}});vm.runInContext(fs.readFileSync('assets/world-race-renderer.js','utf8')+';globalThis.renderer=WorldRace;',context);const R=context.globalThis.renderer;
for(const [w,h] of [[390,520],[844,240]])for(const level of [1,21,51,71,74]){
 let maxOffset=0;for(let d=0;d<600;d+=20){const camera=R.view(w,h,level,{d,x:0},0);for(let ahead=20;ahead<=400;ahead+=20){const point=camera.project(d+ahead);assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));maxOffset=Math.max(maxOffset,Math.abs(point.x-w/2));}}
 assert.ok(maxOffset>w*.1,'curve is visible in the actual renderer');
}
console.log('PASS all 75 courses: full-width jumps, elevations, sharp left/right turns; 2–6 human grids; fast bots at all engines, weapons and real hits, boss variation and phone-size bend projection.');
