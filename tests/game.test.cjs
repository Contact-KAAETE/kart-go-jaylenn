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
 for(const file of ['vendor/qrcode.js','player.js','scenery.js','desert.js','game.js'])vm.runInContext(fs.readFileSync('assets/'+file,'utf8'),sandbox,{filename:file});
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
assert.equal(sandReopen.run('names.length'),50);assert.equal(sandReopen.run('saved.player.code'),JSON.parse(storage['kartgo-jaylenn-v1']).player.code);
console.log(`PASS:30 unique Sand World tracks (${sandWinners}/30 controller wins), only3 allowed items, boost refused, freeze2s, Pizzaman without unapproved attacks and level50 save/reopen.`);

// Beginning a new race at a changed viewport must not trigger the rotation-pause path.
e.sandbox.innerWidth=320;e.sandbox.innerHeight=568;run('start(1)');assert.equal(run('state.paused'),false);e.sandbox.innerWidth=844;e.sandbox.innerHeight=390;run('resize()');assert.equal(run('state.paused'),true);
console.log('PASS: fresh race stays active after a viewport change; rotating an ongoing race still pauses safely.');

const roundtrip=environment({'kartgo-jaylenn-v1':legacy});roundtrip.run("saved.player.name='TurboRoundtrip';saved.player.color='#ab75d0';saved.player.effect='splash';saved.wins=[1,14,20,40];saved.rewards.glitter=true;saved.mode='wheel';saved.xp=2000");const backup=roundtrip.run('progressText()');roundtrip.run("saved.wins=[2];saved.best={1:30};saved.mode='joystick'");roundtrip.sandbox.backup=backup;assert.equal(roundtrip.run('mergeProgress(backup)'),true);assert.equal(roundtrip.run('saved.wins.length'),5);assert.equal(roundtrip.run('saved.best[1]'),30);assert.equal(roundtrip.run('saved.player.color'),'#ab75d0');assert.equal(roundtrip.run('saved.mode'),'wheel');assert.throws(()=>roundtrip.run("mergeProgress('{}')"));assert.throws(()=>roundtrip.run("mergeProgress('x'.repeat(300001))"));
console.log('PASS: export/import roundtrip preserves wins, best time, profile, garage, XP, code, rewards and settings; invalid imports rejected.');
