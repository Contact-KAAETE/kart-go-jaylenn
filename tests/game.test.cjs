const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function environment(initial={}){
 const nodes=new Map(),storage={...initial},events={};let nextCanvas=0;
 const gradient={addColorStop(){}};
 const paint=new Proxy({}, {get:(o,k)=>k in o?o[k]:['createLinearGradient','createRadialGradient'].includes(k)?()=>gradient:()=>{},set:(o,k,v)=>(o[k]=v,true)});
 function element(id){if(!nodes.has(id)){
  const classes=new Set();
  nodes.set(id,{id,style:{},listeners:{},classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),contains:v=>classes.has(v),toggle(v,force){if(force===true)classes.add(v);else if(force===false)classes.delete(v);else classes.has(v)?classes.delete(v):classes.add(v);}},
   addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)},setAttribute(){},setPointerCapture(){},hasPointerCapture:()=>false,releasePointerCapture(){},
   getBoundingClientRect:()=>id==='#controls'?{left:12,top:710,width:366,height:118}:{left:0,top:0,width:130,height:130},
   children:[],getContext:()=>paint,showModal(){this.open=true},close(){this.open=false},click(){},innerHTML:'',textContent:'',firstChild:{textContent:''}});
 }return nodes.get(id);}
 const math=Object.create(Math);let seed=123456;const seededRandom=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};math.random=seededRandom;
 const win={addEventListener(type,fn){(events[type]??=[]).push(fn)}};
 const sandbox={document:{querySelector:element,querySelectorAll:()=>[],addEventListener(type,fn){(events[type]??=[]).push(fn)},createElement:tag=>element(tag+(nextCanvas++)),hidden:false},window:win,localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},location:{hash:''},innerWidth:390,innerHeight:844,devicePixelRatio:2,requestAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},performance:{now:()=>0},crypto:require('node:crypto').webcrypto,console,Math:math,URL,Blob,Date};
 vm.createContext(sandbox);
 for(const file of ['vendor/qrcode.js','graphics.js','player.js','scenery.js','desert.js','course.js','ice-world.js','race-adventure.js','game.js'])vm.runInContext(fs.readFileSync('assets/'+file,'utf8'),sandbox,{filename:file});
 return{random:seededRandom,run:code=>vm.runInContext(code,sandbox),nodes,storage,math,events,sandbox};
}
const e=environment(),{run,nodes,storage}=e;const event=(id,x=65,y=65)=>({pointerId:id,clientX:x,clientY:y,button:0,pointerType:'touch',preventDefault(){}});
function dispatch(selector,type,ev){for(const fn of nodes.get(selector).listeners[type]||[])fn(ev);}
run('start(1);state.count=0;');
// Distinct fingers may operate throttle and steering, and releases cannot steal each other.
dispatch('#right','pointerdown',event(11));dispatch('#gas','pointerdown',event(12));
assert.equal(run('input.right&&input.gas'),true);
dispatch('#gas','pointerup',event(99));assert.equal(run('input.gas'),true,'unowned release ignored');
dispatch('#gas','pointerup',event(12));assert.equal(run('input.right&&!input.gas'),true);
dispatch('#right','pointercancel',event(11));assert.equal(run('input.right||input.gas'),false);
dispatch('#left','pointerdown',event(20));dispatch('#left','pointerdown',event(21));dispatch('#left','pointerup',event(20));assert.equal(run('input.left'),true,'second finger remains held');
run('resetInput()');assert.equal(run('activePointers.size'),0);
for(const mode of ['wheel','joystick']){
 run(`saved.mode='${mode}';modeUI()`);dispatch('#'+mode,'pointerdown',event(30));dispatch('#'+mode,'pointermove',event(30,120));dispatch('#gas','pointerdown',event(31));
 assert.ok(run('input.analog')>.5,mode+' steers');assert.equal(run('input.gas'),true);
 run('pause();');assert.equal(run('input.analog'),0);assert.equal(run('activePointers.size'),0);
 run('resume();');dispatch('#'+mode,'pointerdown',event(33));dispatch('#'+mode,'pointermove',event(33,15));assert.ok(run('input.analog')<0,mode+' accepts a new touch after pause');
 dispatch('#'+mode,'lostpointercapture',event(33));assert.equal(run('input.analog'),0);
}
run('start(1);state.count=0;saved.auto=false;input.right=true;update(1/60)');assert.equal(run('state.x'),0);
const positions=[];for(const hz of [30,60,120]){run('start(1);state.count=0;state.speed=MAX;saved.auto=true;saved.assist=false;input.right=true');for(let i=0;i<hz/2;i++)run(`update(${1/hz})`);positions.push(run('state.x'));}
assert.ok(Math.max(...positions)-Math.min(...positions)<.025);
run('input.right=false;update(1/60)');assert.ok(run('state.steer')>0&&run('state.steer')<1);
// Braking takes priority over simultaneous throttle, and acceleration is gradual.
run('start(1);state.count=0;saved.auto=false;input.gas=true;update(.1)');assert.ok(run('state.speed')>0&&run('state.speed')<500);
run('state.speed=MAX;input.brake=true;update(.1)');assert.ok(run('state.speed')<2650);
run('start(1);state.count=0;state.inventory=[0,2,4];useItem(0)');assert.equal(run('state.opponents.every(o=>o.slow===3)'),true);
run('useItem(1)');assert.equal(run('state.boost'),4);
run('useItem(2)');assert.equal(run('state.jump'),1.4);
run('state.inventory=[1,3,null];state.opponents.forEach(o=>o.d=5000);state.opponents[0].d=2000;useItem(0);useItem(1)');assert.equal(run('state.opponents[0].hyp'),10);assert.equal(run('state.bananas.length'),1);
run('state.inventory=[0,1,2];state.d=state.blocks[0].d;state.x=state.blocks[0].x;update(.001)');assert.equal(run('state.inventory.every(x=>x!==null)'),true);
run('useItem(-1);useItem(10);useItem(undefined)');
// Exact probability boundaries, independent of sampling noise.
for(const [v,item] of [[0,0],[.499999,0],[.5,1],[.699999,1],[.7,2],[.849999,2],[.85,3],[.949999,3],[.95,4],[.999999,4]]){e.math.random=()=>v;assert.equal(run('randomItem()'),item);}
e.math.random=e.random;
// Boss: exactly nine blocks, no collection by the dog, ten-second cadence, two-second freeze and Jump protection.
run('start(20);state.count=0;state.time=9.99;update(.02)');assert.equal(run('state.blocks.length'),9);assert.equal(run('state.shots.length'),1);assert.equal(run('state.nextShot'),20);
run('state.shots=[{d:state.d+1,x:state.x,speed:-3000,life:5}];update(.01)');assert.equal(run('state.freeze'),2);
run('state.freeze=0;state.jump=1;state.shots=[{d:state.d+1,x:state.x,speed:-3000,life:5}];update(.01)');assert.equal(run('state.freeze'),0);
run('state.jump=0;state.inventory=[null,null,null];state.d=LENGTH+state.blocks[0].d;state.x=state.blocks[0].x;update(.001)');assert.equal(run('state.inventory.every(x=>x===null)'),true);
run('start(20);state.count=0;state.opponents[0].d=state.blocks[0].d;state.d=0;update(.001)');assert.equal(run('state.blocks[0].lap'),-1,'dog never takes blocks');
run('state.freeze=2;state.speed=0;state.shots=[]');for(let i=0;i<120;i++)run('update(1/60)');assert.ok(run('state.freeze')<.0001);
// Finish writes progression, and reopening preserves it and the chosen control.
run('start(1);state.count=0;state.d=LENGTH*LAPS-5;state.opponents.forEach(o=>o.d=0);state.speed=MAX;update(.02)');assert.equal(run('state.finished'),true);assert.equal(run('saved.wins.includes(1)'),true);nodes.get('#closeModal').onclick();assert.equal(run('state===null'),true,'closing results returns to the map');
run("saved.mode='joystick';persist();");const reopened=environment(storage);assert.equal(reopened.run('saved.wins.includes(1)'),true);assert.equal(reopened.run('saved.mode'),'joystick');
run('start(3);state.count=0;state.d=12345;state.inventory=[0,2,4];state.time=15;pause()');const session=JSON.parse(storage['kartgo-jaylenn-v1']).session;assert.equal(session.d,12345);run('resume();');
const resumeEnv=environment(storage);resumeEnv.run('start(saved.session.level,saved.session)');assert.equal(resumeEnv.run('state.d'),12345);assert.equal(resumeEnv.run('state.inventory.join()'),'0,2,4');
const legacy=JSON.stringify({wins:[1,2,2],best:{1:49},mode:'wheel',auto:false});const migrated=environment({'kartgo-jaylenn-v1':legacy});assert.equal(migrated.storage['kartgo-jaylenn-v1-backup-before-v3'],legacy);assert.equal(migrated.run('saved.wins.join()'),'1,2');assert.equal(migrated.run('saved.mode'),'wheel');const low=environment({'kartgo-jaylenn-v1':JSON.stringify({quality:'low',wins:[]})});assert.equal(low.run('quality.level'),0,'low graphics preference survives reopening');
// Resize/orientation change releases fingers and pauses the race.
run('start(1);state.count=0;');dispatch('#right','pointerdown',event(80));e.sandbox.innerWidth=844;e.sandbox.innerHeight=390;run('resize()');assert.equal(run('state.paused'),true);assert.equal(run('activePointers.size'),0);
// All twenty distinct courses can be completed with bounded steering; bridges, tunnels and hazards render.
const tracks=new Set();let winners=0;
for(let level=1;level<=20;level++){
 run(`start(${level});state.count=0;saved.auto=true;saved.assist=true;`);tracks.add(run('state.curves.map(v=>v.toFixed(3)).join()'));
 let steps=0;while(!run('state.finished')&&steps++<10000){
  run(`{const s=state;let tx=0;const upcoming=s.blocks.filter(b=>s.boss?b.lap<0:b.lap!==Math.floor(s.d/LENGTH)).map(b=>({x:b.x,gap:circularGap(b.d,s.d)})).filter(b=>b.gap>0&&b.gap<2200).sort((a,b)=>a.gap-b.gap)[0];if(upcoming&&s.inventory.includes(null))tx=upcoming.x;const close=s.opponents.find(o=>o.d-s.d>0&&o.d-s.d<700&&Math.abs(o.x-tx)<.35);if(close)tx=close.x>=0?-.64:.64;const hazard=s.obstacles.find(o=>{const gap=circularGap(o.d,s.d);return gap>0&&gap<2300});if(hazard)tx=hazard.x>=0?-.6:.6;const ice=s.shots.find(o=>Math.abs(o.d-s.d)<6000);if(ice)tx=ice.x>=0?-.65:.65;const cv=s.curves[Math.floor((s.d%LENGTH)/SEG)];input.analog=clamp((tx-s.x)*4+cv*.055/1.35,-1,1);s.inventory.forEach((item,i)=>{if(item===0||item===2||item===1)useItem(i)});update(1/60);}`);
 }
 assert.equal(run('state.finished'),true,`level ${level} finishes`);assert.ok(run('state.time')<130);assert.ok(run('state.profile.difficulty')<=29);if(run('state.rank===1'))winners++;
 run('draw()');
 if(level>=8){run("state.d=(state.features.find(f=>f.kind==='tunnel').from+5)*SEG;draw()");run("state.d=(state.features.find(f=>f.kind==='bridge').from+5)*SEG;draw()");}
}
assert.equal(tracks.size,20);assert.ok(winners>=18,`controller won ${winners}/20`);assert.equal(run('state.profile.difficulty'),29);
console.log(`PASS: 20 unique playable tracks (${winners}/20 controller wins), multitouch ownership, all 3 controls, simultaneous pedals, cancellation, rotation, pause/resume, exact item thresholds, 9-block boss, 10-second ice, 2-second freeze, jump, legacy save migration, checkpoints and scenery.`);

// V4 player migration, rewards and garage survive reopening and import sanitization.
const proto=JSON.stringify({nickname:'TurboJay',character:'🐸',paint:'🔵',code:'KG-ABC234',friends:['KG-DEF567']});
const v4=environment({'kartgo-jaylenn-v1':legacy,'kartgo-jaylenn-friends-prototype-v1':proto});
assert.equal(v4.storage['kartgo-jaylenn-v1-backup-before-v4'],legacy);
assert.equal(v4.run('saved.player.name'),'TurboJay');assert.equal(v4.run('saved.player.avatar'),'🐸');assert.equal(v4.run('saved.player.color'),'#579be4');
assert.equal(v4.run('saved.xp'),200);assert.equal(v4.run("effectOpen('splash')"),false);
v4.run('saved.wins=Array.from({length:14},(_,i)=>i+1)');assert.equal(v4.run("effectOpen('splash')"),true);assert.equal(v4.run("effectOpen('boem')"),false);
v4.run('saved.wins=Array.from({length:39},(_,i)=>i+1);saved.xp=2000');assert.equal(v4.run("effectOpen('boem')"),true);assert.equal(v4.run('xpLevel()'),5);
v4.run("saved.player.color='#ab75d0';saved.player.effect='boem';saved.rewards.glitter=true;persist()");const v4again=environment(v4.storage);assert.equal(v4again.run('saved.player.effect'),'boem');assert.equal(v4again.run('saved.rewards.glitter'),true);assert.equal(v4again.run('saved.player.code'),'KG-ABC234');
assert.equal(v4.run("cleanPlayer({name:'<Turbo>',color:'javascript:x',avatar:'<img>',effect:'fake'}).name"),'Turbo');assert.equal(v4.run("cleanPlayer({color:'red'}).color"),'#f56a48');
v4.run('start(1);state.count=0;cosmeticBurst()');assert.equal(v4.run("state.effects.filter(e=>e.type==='boem').length"),1);v4.run('cosmeticBurst()');assert.equal(v4.run('state.effects.length'),1);v4.run('state.time=2;cosmeticBurst()');assert.equal(v4.run('state.effects.length'),2);
v4.run("saved.player.effect='none';state.time=4;cosmeticBurst()");assert.equal(v4.run('state.effects.length'),2);
console.log('PASS: V4 prototype migration, safe profile, rewards 15/40, XP5, persistent paint/avatar/code and Boem 2-second cooldown.');

run('start(1);state.count=0;state.d=10000;state.opponents.forEach(o=>o.d=0);state.inventory=[1,3,null];useItem(0)');assert.equal(run('state.inventory[0]'),null);assert.equal(run('state.opponents.some(o=>o.hyp===10)'),true,'hypnosis also works while leading');
run('useItem(1);state.opponents[0].d=state.bananas[0].d;state.opponents[0].x=state.bananas[0].x;update(.001)');assert.equal(run('state.opponents[0].spin'),2);run('state.bananas=[]');for(let i=0;i<121;i++)run('update(1/60)');assert.equal(run('state.opponents[0].spin'),0);
console.log('PASS: hypnose10s with leading player, purple feedback and banana spin2s ending automatically.');

// All Sand World courses are actual races, not additional map labels.
const sandTracks=new Set();let sandWinners=0;
for(let level=21;level<=50;level++){
 run(`start(${level});state.count=0;saved.auto=true;saved.assist=true;`);assert.equal(run('state.sand'),true);sandTracks.add(run('state.curves.map(v=>v.toFixed(3)).join()'));
 for(let i=0;i<150;i++)assert.ok([1,3,5].includes(run('randomItem()')));
 let steps=0;while(!run('state.finished')&&steps++<10000){run(`{const s=state;let tx=0;const upcoming=s.blocks.filter(b=>s.boss?b.lap<0:b.lap!==Math.floor(s.d/LENGTH)).map(b=>({x:b.x,gap:circularGap(b.d,s.d)})).filter(b=>b.gap>0&&b.gap<2200).sort((a,b)=>a.gap-b.gap)[0];if(upcoming&&s.inventory.includes(null))tx=upcoming.x;const hazard=s.obstacles.find(o=>{const gap=circularGap(o.d,s.d);return gap>0&&gap<2300});if(hazard)tx=hazard.x>=0?-.6:.6;const close=s.opponents.find(o=>o.d-s.d>0&&o.d-s.d<700&&Math.abs(o.x-tx)<.35);if(close)tx=close.x>=0?-.64:.64;const cv=s.curves[Math.floor((s.d%LENGTH)/SEG)];input.analog=clamp((tx-s.x)*4+cv*.055/1.35,-1,1);s.inventory.forEach((item,i)=>{if(item===1||item===5)useItem(i)});update(1/60);}`);}
 assert.equal(run('state.finished'),true,`sand level${level} finishes`);assert.ok(run('state.time')<140);assert.ok(run('state.profile.difficulty')<=29);if(run('state.rank===1'))sandWinners++;run('draw()');
}
assert.equal(sandTracks.size,30);assert.ok(sandWinners>=27,`sand controller won${sandWinners}/30`);
run('start(21);state.count=0;state.inventory=[5,2,1];useItem(0)');assert.equal(run('state.opponents[0].freeze'),2);run('useItem(1)');assert.equal(run('state.boost'),0,'Sand refuses manually inserted boost');const frozen=run('state.opponents[0].d');for(let i=0;i<119;i++)run('update(1/60)');assert.equal(run('state.opponents[0].d'),frozen);for(let i=0;i<3;i++)run('update(1/60)');assert.ok(run('state.opponents[0].d')>frozen);
run('start(50);state.count=0;state.time=10;update(.01)');assert.equal(run('state.opponents[0].pizza'),true);assert.equal(run('state.shots.length'),0,'no invented Pizzaman ice attack');
run('checkpoint()');const sandReopen=environment(storage);assert.equal(sandReopen.run('saved.session.level'),50);sandReopen.run('start(50,saved.session)');assert.equal(sandReopen.run('state.sand'),true);
assert.equal(sandReopen.run('names.length'),70);assert.equal(sandReopen.run('saved.player.code'),JSON.parse(storage['kartgo-jaylenn-v1']).player.code);
console.log(`PASS:30 unique Sand World tracks (${sandWinners}/30 controller wins), only3 allowed items, boost refused, freeze2s, Pizzaman without unapproved attacks and level50 save/reopen.`);

// Beginning a new race at a changed viewport must not trigger the rotation-pause path.
e.sandbox.innerWidth=320;e.sandbox.innerHeight=568;run('start(1)');assert.equal(run('state.paused'),false);e.sandbox.innerWidth=844;e.sandbox.innerHeight=390;run('resize()');assert.equal(run('state.paused'),true);
console.log('PASS: fresh race stays active after a viewport change; rotating an ongoing race still pauses safely.');

const roundtrip=environment({'kartgo-jaylenn-v1':legacy});roundtrip.run("saved.player.name='TurboRoundtrip';saved.player.color='#ab75d0';saved.player.effect='splash';saved.wins=[1,14,20,40];saved.rewards.glitter=true;saved.mode='wheel';saved.xp=2000");const backup=roundtrip.run('progressText()');roundtrip.run("saved.wins=[2];saved.best={1:30};saved.mode='joystick'");roundtrip.sandbox.backup=backup;assert.equal(roundtrip.run('mergeProgress(backup)'),true);assert.equal(roundtrip.run('saved.wins.length'),5);assert.equal(roundtrip.run('saved.best[1]'),30);assert.equal(roundtrip.run('saved.player.color'),'#ab75d0');assert.equal(roundtrip.run('saved.mode'),'wheel');assert.throws(()=>roundtrip.run("mergeProgress('{}')"));assert.throws(()=>roundtrip.run("mergeProgress('x'.repeat(300001))"));
console.log('PASS: export/import roundtrip preserves wins, best time, profile, garage, XP, code, rewards and settings; invalid imports rejected.');

// V5.1: real, repeatable terrain changes and gameplay launches without changing item timers.
for(let level=1;level<=50;level++){
 run(`start(${level});state.count=0;`);
 const heights=run('Array.from({length:COUNT},(_,i)=>courseElevation(i*SEG,state.level))');
 assert.ok(heights.every(Number.isFinite));
 assert.ok(Math.max(...heights)-Math.min(...heights)>200,'terrain has visible elevation');
 assert.ok(Math.abs(run('courseElevation(0,state.level)-courseElevation(LENGTH,state.level)'))<1e-8,'lap seam matches');
 assert.ok(Math.abs(run('courseElevation(-1,state.level)-courseElevation(LENGTH-1,state.level)'))<1e-8,'negative camera distance wraps');
 if(level>=7)assert.ok(run("state.features.filter(f=>f.kind==='bridge').length")>=2);
 if(level>=3)assert.ok(run('courseCorners(state.level).length')>0);
 if(level===20||level===50)assert.equal(run("state.features.some(f=>f.kind==='ramp')"),false,'boss rules stay unchanged');
 for(let segment=0;segment<260;segment+=13){run(`state.d=${segment}*SEG;draw()`);assert.ok(run('projection.every(p=>[p.x,p.y,p.w,p.clipY].every(Number.isFinite))'),'finite hill projection');assert.ok(run('projection.some(p=>p.visible)'), 'road stays visible');}
}
run("start(5);state.count=0;saved.auto=true;state.speed=MAX;state.d=state.features.find(f=>f.kind==='ramp').to*SEG-2;state.x=0;update(1/60)");
assert.ok(run('state.rampAir>1&&state.jump===0'),'ramp launches kart without spending or changing Jump');
assert.equal(run('state.inventory.every(i=>i===null)'),true);
run('update(.3);');assert.ok(run('rampLift(state)>.6'),'airborne animation has height');
const during=run('state.rampAir');run('pause();update(.2)');assert.equal(run('state.rampAir'),during,'pause freezes flight');
run('state.paused=false;checkpoint()');const rampSave=run('JSON.parse(JSON.stringify(saved.session))');
run(`start(5,${JSON.stringify(rampSave)});state.count=0`);assert.equal(run('state.rampAir'),during,'flight resumes after reopen');
run('for(let i=0;i<100;i++)update(1/60)');assert.equal(run('state.rampAir'),0,'lands automatically');
run("start(5);state.count=0;saved.auto=false;state.speed=MAX*.2;state.d=state.features.find(f=>f.kind==='ramp').to*SEG-1;update(.01)");assert.equal(run('state.rampAir'),0,'slow kart rolls over ramp');
run("start(5);state.count=0;state.speed=MAX;state.x=1.4;state.d=state.features.find(f=>f.kind==='ramp').to*SEG-1;update(.01)");assert.equal(run('state.rampAir'),0,'off-road kart cannot launch');
run("start(5);state.count=0;state.opponents[0].d=state.features.find(f=>f.kind==='ramp').to*SEG-1;update(.01)");assert.ok(run('state.opponents[0].rampAir>0'),'bots use the same launch ramps');
run("start(5);state.count=0;state.rampAir=.8;state.rampDuration=1;state.shots=[{d:state.d+1,x:state.x,speed:-3000,life:5}];update(.01)");assert.equal(run('state.freeze'),0,'physical airborne kart clears ice');
run('state.inventory=[4,null,null];useItem(0)');assert.equal(run('state.jump'),1.4,'original Jump remains 1.4 seconds');
console.log('PASS: V5.1 all50 terrain profiles/seams and finite projections, extra bridges, sharper curves, real player/bot ramps, pause/save/reopen/landing, slow and off-road rejection, ice clearance, unchanged Jump duration.');

// Real input -> lateral motion -> actual renderer argument must agree for every control mode.
for(const mode of ['buttons','wheel','joystick']){
 for(const direction of [-1,1]){
  run(`start(1);state.count=0;state.speed=MAX;state.curves.fill(0);saved.mode='${mode}';modeUI();resetInput();`);
  if(mode==='buttons')dispatch(direction<0?'#left':'#right','pointerdown',event(401));
  else{dispatch('#'+mode,'pointerdown',event(401));dispatch('#'+mode,'pointermove',event(401,65+direction*50));}
  run(`{const original=GFX.drawKart;let rendered=null;GFX.drawKart=(...args)=>{if(args[7]===saved.player)rendered=args[6];return original(...args);};for(let i=0;i<12;i++)update(1/60);draw();GFX.drawKart=original;globalThis.lastRenderedSteer=rendered;}`);
  assert.ok(run('state.x')*direction>0,mode+' moves with input');
  assert.ok(run('lastRenderedSteer')*direction>0,mode+' artwork points with lateral movement');
  run('resetInput();for(let i=0;i<60;i++)update(1/60)');assert.ok(Math.abs(run('state.steer'))<.001,'released steering recentres');
 }
}
console.log('PASS: left/right touch input, lateral physics and kart renderer agree for buttons, wheel and joystick; release recentres.');

run('start(12);state.count=0;state.d=0;state.opponents[0].d=1000;state.opponents[0].x=-.54;state.opponents[1].d=1800;state.opponents[1].x=-.54;state.opponents[2].d=10000;state.time=3');
assert.ok(run('botTactic(state,state.opponents[0],0).ideal')>-.4,'bot selects free overtaking lane');
run('state.time=19-12*.61');assert.ok(run('botTactic(state,state.opponents[0],0).factor')<.9,'recoverable mistake slows bot');
run('state.time+=2;botTactic(state,state.opponents[0],0)');assert.equal(run('state.opponents[0].mistake'),0,'mistake ends');
for(let t=0;t<60;t++){run(`state.time=${t}`);assert.ok(run('botTactic(state,state.opponents[0],0).factor')<=1,'traffic never exceeds original bot speed');}
run('start(20)');assert.equal(run('botTactic(state,state.opponents[0],0).factor'),1,'boss speed unchanged');
run("saved.player.name='Papa';saved.player.avatar=AVATARS[4]");assert.ok(run('victoryMarkup()').includes('Papa'));assert.ok(run('victoryMarkup()').includes('data-character="4"'),'podium uses selected actual driver');
console.log('PASS: overtaking free lane, temporary recoverable mistakes, original speed cap and bosses, selected Papa/driver podium.');

// Safari-independent tinting: red lacquer changes, chrome/tires/gold/alpha stay intact.
run("globalThis.paintSample=new Uint8ClampedArray([220,30,50,255,180,180,180,255,25,25,25,255,220,170,30,255,220,30,50,0]);recolorKartPixels(paintSample,'#579be4')");
const paintPixels=Array.from(run('paintSample'));assert.ok(paintPixels[2]>paintPixels[0],'blue lacquer');assert.deepEqual(paintPixels.slice(4),[180,180,180,255,25,25,25,255,220,170,30,255,220,30,50,0],'neutral materials and alpha preserved');
run("globalThis.greenSample=new Uint8ClampedArray([220,30,50,255]);recolorKartPixels(greenSample,'#78b747')");assert.ok(run('greenSample[1]>greenSample[0]&&greenSample[1]>greenSample[2]'),'green lacquer');
console.log('PASS: pixel tint without Canvas filters; blue/green paint changes while neutral materials, gold and transparency remain unchanged.');

// Ice World rules and full-course controller: the first fifty regressions above are untouched.
assert.equal(run('names.length'),70);
const iceTracks=new Set();let iceWins=0;
for(let level=51;level<=70;level++){
 run(`start(${level});state.count=0;saved.auto=true;saved.assist=true;`);
 assert.equal(run('state.ice'),true);assert.equal(run('state.sand'),false);assert.ok(run('state.profile.difficulty')<=29);
 assert.equal(run('state.blocks.length'),level===63?9:10);iceTracks.add(run('state.curves.map(n=>n.toFixed(3)).join()'));
 let steps=0;while(!run('state.finished')&&steps++<12000){run(`{const s=state;let tx=0;const near=s.obstacles.filter(o=>o.kind==='spike'&&o.brokenUntil<=s.time).map(o=>({...o,gap:circularGap(o.d,s.d)})).filter(o=>o.gap>0&&o.gap<2700).sort((a,b)=>a.gap-b.gap)[0];const hole=s.iceData.holes.find(h=>h.d>s.d&&h.d-s.d<4000);if(near)tx=near.x>=0?-.6:.6;if(hole)tx=hole.x>=0?-.6:.6;const attack=s.iceData.attack;if(attack)tx=attack.kind==='lettuce'?attack.safe:attack.lane>=0?-.6:.6;const close=s.opponents.find(o=>o.d>s.d&&o.d-s.d<650&&Math.abs(o.x-tx)<.3);if(close&&!attack)tx=close.x>=0?-.64:.64;const cv=s.curves[Math.floor((s.d%LENGTH)/SEG)];input.analog=clamp((tx-s.x)*4-(s.slide||0)*.7+cv*.055/1.35,-1,1);s.inventory.forEach((item,i)=>{if(item===0||item===1||item===5||item===3||item===2&&!near&&!hole)useItem(i);});update(1/60);}`);}
 assert.equal(run('state.finished'),true,'ice level '+level+' finishes');assert.ok(run('state.time')<160,'fair course duration');if(run('state.rank')===1)iceWins++;
 run('draw()');assert.ok(run('projection.every(p=>[p.x,p.y,p.w,p.clipY].every(Number.isFinite))'));
 if(level>=53){run("state.d=(state.features.find(f=>f.kind==='palace').from+25)*SEG;draw()");assert.ok(run('Ice.width(state.level,state.d)')>=.72);}
}
assert.equal(iceTracks.size,20);assert.ok(iceWins>=14,'most ice courses winnable by bounded controller');
console.log(`PASS:20 unique Ice World courses (${iceWins}/20 controller wins), all completed, nine secret blocks, gradual difficulty<=29, palace projection and narrowing.`);
run('start(51);state.count=0;saved.auto=false;state.speed=MAX;input.analog=1;update(.1)');const slip=run('state.slide');assert.ok(slip>0);run('input.analog=0;update(.1)');assert.ok(run('state.slide')>0,'ice retains momentum');run('input.brake=true;for(let i=0;i<40;i++)update(1/60);resetInput()');assert.ok(Math.abs(run('state.slide'))<.03,'braking restores grip');
run('start(51);state.count=0;state.inventory=[4,2,5];useItem(0)');assert.equal(run('state.jump'),1.4);assert.equal(run('state.iceData.holes[0].opens-state.time'),2);assert.equal(run('state.iceData.holes[0].closes-state.time'),5);run('useItem(1);update(.1)');assert.ok(run('state.iceData.holes.length')>=2,'boost leaves a real crack');
run('start(51);state.count=0;saved.auto=false;state.iceData.holes=[{d:1,x:0,born:-2,opens:0,closes:5}];state.inventory=[2,4,5];update(.01)');assert.equal(run('state.rescue'),3);assert.equal(run('state.iceShield'),5);run('checkpoint()');const frozenSession=run('JSON.parse(JSON.stringify(saved.session))');
run(`start(51,${JSON.stringify(frozenSession)});state.count=0;state.paused=true;update(1)`);assert.equal(run('state.rescue'),3,'paused rescue preserved');run('state.paused=false;for(let i=0;i<185;i++)update(1/60)');assert.equal(run('state.rescue'),0);assert.ok(run('state.d')>=500,'rescued outside hole');assert.equal(run('state.inventory.join()'),'2,4,5','items preserved');assert.ok(run('state.iceShield')>1.8,'two seconds post-rescue protection');
// A bot's speed is its base pace, unlike the player's current speed: water rescue must not erase it.
run('start(51);state.count=0;saved.auto=false;state.opponents[0].d=10000;state.opponents[0].x=0;state.iceData.holes=[{d:10000,x:0,born:-2,opens:0,closes:5}];update(.01)');
assert.equal(run('state.opponents[0].rescue'),3,'bot falls into real hole');
const botPace=run('state.opponents[0].speed');assert.ok(botPace>0,'rescue preserves base pace');
run('checkpoint()');const botRescueSession=run('JSON.parse(JSON.stringify(saved.session))');
run(`start(51,${JSON.stringify(botRescueSession)});state.count=0;for(let i=0;i<185;i++)update(1/60)`);
assert.equal(run('state.opponents[0].rescue'),0,'bot rescue ends after save/reopen');const rescuedBotDistance=run('state.opponents[0].d');run('for(let i=0;i<60;i++)update(1/60)');assert.ok(run('state.opponents[0].d')>rescuedBotDistance+1000,'rescued bot actually resumes racing');
run("start(51);state.count=0;saved.auto=false;state.d=state.obstacles[0].d;state.x=state.obstacles[0].x;update(.01)");assert.ok(run('state.obstacles[0].brokenUntil-state.time')===3);run('state.d+=1000;for(let i=0;i<181;i++)update(1/60)');assert.ok(run('state.obstacles[0].brokenUntil<=state.time'),'spikes regrow after3s');
run('start(70);state.count=0;saved.auto=false;state.time=12;update(.01)');assert.equal(run('COUNT'),520);assert.equal(run('state.laps'),1);assert.equal(run('state.finishDistance'),104000);assert.equal(run('state.iceData.attack.kind'),'lettuce');assert.equal(run('state.iceData.attack.at-state.time'),2);
run('state.x=state.iceData.attack.safe;update(2.01)');assert.equal(run('state.lettuce'),0,'safe lane avoids wave');
run('start(70);state.count=0;saved.auto=false;state.time=12;update(.01);state.x=-state.iceData.attack.safe;state.speed=MAX;update(2.01)');assert.equal(run('state.lettuce'),2);assert.ok(run('state.speed')<=run('MAX*.6'));
run('start(70);state.count=0;saved.auto=false;state.iceData.nextLettuce=999;state.time=20;update(.01);state.x=state.iceData.attack.lane;state.speed=MAX;update(2.01)');assert.equal(run('state.basket'),3);assert.ok(run('state.speed')<=run('MAX*.5'));run('for(let i=0;i<181;i++)update(1/60)');assert.equal(run('state.basket'),0,'basket ends automatically');
run('start(70);state.count=0;state.d=52000;update(.01)');assert.equal(run('state.finished'),false,'king is one genuinely long lap');run('state.d=state.finishDistance-1;state.speed=MAX;state.opponents[0].d=0;update(.01)');assert.equal(run('state.finished'),true);assert.equal(run('saved.wins.includes(70)'),true);assert.equal(run('cleanProgress(saved).wins.includes(70)'),true,'level70 save kept');
console.log('PASS: ice momentum/brake, Jump and Boost cracks2s/open3s, rescue3s/shield/save/pause, spike regrowth3s, king warning2s/safe lane/lettuce2s/basket3s, genuine long single lap and level70 progression.');

// V6.2: genuine road departures and all three arcade engine classes.
const oldWins=run('saved.wins.join()'),oldName=run('saved.player.name');
assert.equal(run("cleanProgress({engine:'__proto__'}).engine"),250,'invalid engine import falls back safely');
let classSpeeds=[];
for(const engine of [250,509,1000]){run(`saved.engine=${engine};persist();start(1);state.count=0;saved.auto=true;for(let i=0;i<120;i++)update(1/60)`);classSpeeds.push(run('state.speed'));assert.equal(run('state.engine'),engine);assert.equal(run('cleanProgress(JSON.parse(progressText())).engine'),engine,'engine survives backup');}
assert.ok(classSpeeds[0]<classSpeeds[1]&&classSpeeds[1]<classSpeeds[2],'higher pk genuinely accelerates and travels faster');
run('saved.engine=509;start(1);state.count=0;saved.auto=true;state.d=4000;state.x=1.6;state.speed=MAX;state.inventory=[2,4,1];update(.1)');assert.equal(run('state.recoveryKind'),'dust');assert.equal(run('state.recovery'),2);const outDistance=run('state.d');run('update(.5);useItem(0)');assert.equal(run('state.d'),outDistance,'dust stops progress during penalty');assert.equal(run('state.inventory[0]'),2,'recovery cannot consume item');run('state.paused=true;update(1)');assert.equal(run('state.recovery'),1.5,'pause stops recovery timer');run('state.paused=false;checkpoint()');const dustSave=run('JSON.parse(JSON.stringify(saved.session))');
run(`saved.engine=1000;start(1,${JSON.stringify(dustSave)});state.count=0`);assert.equal(run('state.engine'),509,'resume retains race class even after garage changes');assert.equal(run('state.recovery'),1.5);run('for(let i=0;i<91;i++)update(1/60)');assert.equal(run('state.recovery'),0);assert.ok(Math.abs(run('state.x'))<.1,'dust returns to actual road centre');assert.ok(run('state.safeFor')>1.9,'safe return protection');assert.equal(run('state.inventory.join()'),'2,4,1');
run("saved.engine=250;start(12);state.count=0;saved.auto=true;state.d=(state.features.find(f=>f.kind==='bridge').from+3)*SEG;state.x=-1.6;state.speed=MAX;update(.1)");assert.equal(run('state.recoveryKind'),'water');assert.equal(run('state.recovery'),3,'bridge departure is three-second water splash');run('for(let i=0;i<179;i++)update(1/60)');assert.ok(run('state.recovery')>0,'not returned before three seconds');run('update(1/60+.0001)');assert.equal(run('state.recovery'),0);assert.ok(Math.abs(run('state.x'))<.1);
run("start(12);state.count=0;saved.auto=false;state.d=(state.features.find(f=>f.kind==='bridge').from+3)*SEG;state.x=1.6;state.speed=10;update(.1)");assert.equal(run('state.recovery'),3,'water also catches a slowly moving kart');
run('start(12);state.count=0;state.opponents[0].d=9000;state.opponents[0].x=1.6;state.opponents[0].mistake=0;RaceAdventure.begin(state,state.opponents[0],"dust")');const baseBotSpeed=run('state.opponents[0].speed');const baseBotDistance=run('state.opponents[0].d');run('update(1)');assert.equal(run('state.opponents[0].d'),baseBotDistance);run('for(let i=0;i<121;i++)update(1/60)');assert.equal(run('state.opponents[0].recovery'),0);assert.equal(run('state.opponents[0].speed'),baseBotSpeed);assert.ok(run('state.opponents[0].d')>baseBotDistance,'bot resumes after crash');
for(const engine of [250,509,1000])for(const level of [1,12,35,54,70]){run(`saved.engine=${engine};start(${level});state.count=0;saved.auto=true;`);let frames=0;while(!run('state.finished')&&frames++<12000){run(`{const s=state,cv=s.curves[Math.floor((s.d%LENGTH)/SEG)],factor=1+(MAX/3100-1)*.65;let tx=0;const hole=s.iceData?.holes.find(h=>h.d>s.d&&h.d-s.d<4000);if(hole)tx=hole.x>=0?-.6:.6;const attack=s.iceData?.attack;if(attack)tx=attack.kind==='lettuce'?attack.safe:attack.lane>=0?-.6:.6;input.analog=clamp((tx-s.x)*4-(s.slide||0)*.7+cv*.055*factor/1.35,-1,1);update(1/60);}`);}assert.equal(run('state.finished'),true,'engine '+engine+' completes real course '+level);}
assert.equal(run('saved.player.name'),oldName,'driver identity retained');for(const n of oldWins.split(',').filter(Boolean))assert.ok(run(`saved.wins.includes(${n})`),'old wins retained');run('saved.engine=250;persist()');
console.log('PASS:250/509/1000 real acceleration, safe engine import/save/resume, real dust2s and water3s collisions, pause/items/progress protection, bot recovery and15 full-course engine tests.');
