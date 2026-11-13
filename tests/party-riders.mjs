// Run the real local controller and simulation; only raster drawing is stubbed.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM(fs.readFileSync('party/index.html','utf8'),{url:'https://contact-kaaete.github.io/kart-go-jaylenn/party/?mode=free&level=74',runScripts:'outside-only'}),w=dom.window,d=w.document;
const progress={wins:[1,20,70],xp:1400,best:{20:80},session:{level:50,d:99},engine:509,player:{name:'Saved Racer',avatar:'🦊',color:'#579be4'}};
w.localStorage.setItem('kartgo-jaylenn-v1',JSON.stringify(progress));w.localStorage.setItem('kartgo-party-jaylenn-v1','[0,1]');
let sequence=0,time=1;const frames=new Map();w.requestAnimationFrame=cb=>{frames.set(++sequence,cb);return sequence;};w.cancelAnimationFrame=id=>frames.delete(id);
w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>({});
const pump=(count=1)=>{for(let i=0;i<count;i++){assert.equal(frames.size,1,'exactly one animation loop');const cb=frames.values().next().value;frames.clear();time+=50;cb(time);}};
const pointer=(id,type,n,x=50)=>{const e=new w.Event(type,{bubbles:true,cancelable:true});Object.defineProperties(e,{pointerId:{value:n},clientX:{value:x}});d.querySelector('#'+id).dispatchEvent(e);return e;};
w.eval(fs.readFileSync('assets/player.js','utf8')+'\n'+fs.readFileSync('assets/race-worlds.js','utf8')+"\nconst RACER_NAMES=['Astronaut','Ninja','Vos','Panda','Kikker','Robot','Draak','Konijn','Tijger','Pinguïn','Kat','Piraat','Jaylenn','Ezra'];const WorldRace={names:['Kuifkop','Professor Tok','Disco Tok'],load:()=>Promise.resolve(),preview(){},draw(_c,_w,_h,scene){globalThis.lastRaceFrame=JSON.parse(JSON.stringify(scene));}};function portraitMarkup(){return '<span></span>';}function powerMarkup(){return '';}\n"+fs.readFileSync('party/party-riders.js','utf8')+'\nglobalThis.qaRacer=()=>state;');
try{
 await new Promise(r=>setTimeout(r,0));
 const link=()=>new URL(d.querySelector('#menu a').href);assert.equal(link().searchParams.get('level'),'74');
 d.querySelector('[data-level="4"]').click();assert.equal(link().searchParams.get('level'),'75');
 d.querySelector('#partyMode').value='adventure';d.querySelector('#partyMode').dispatchEvent(new w.Event('change'));assert.equal(link().searchParams.get('mode'),'adventure');assert.equal(d.querySelector('#play').disabled,true);
 d.querySelector('#partyMode').value='free';d.querySelector('#partyMode').dispatchEvent(new w.Event('change'));
 d.querySelector('[data-chicken="2"]').click();const stored=JSON.parse(w.localStorage.getItem('kartgo-jaylenn-v1'));for(const key of ['wins','xp','best','session'])assert.deepEqual(stored[key],progress[key]);assert.equal(stored.player.chicken,2);assert.equal(stored.player.name,progress.player.name);
 d.querySelector('#play').click();pump(30);assert.equal(w.lastRaceFrame.players[0].d,0,'countdown prevents early movement');assert.ok(d.querySelector('#partyCountdown').textContent);
 pointer('right','pointerdown',88);assert.ok(!d.querySelector('#right').classList.contains('pressed'),'countdown ignores driving');pump(40);
 pointer('right','pointerdown',99);pump(20);assert.ok(w.lastRaceFrame.players[0].x>.5,'right pointer moves right');pointer('right','pointerup',99);
 pointer('left','pointerdown',98);pump(30);assert.ok(w.lastRaceFrame.players[0].x<0,'left pointer moves left');pointer('left','pointerup',98);
 pointer('gas','pointerdown',10);pointer('right','pointerdown',11);pointer('gas','pointerup',10);assert.ok(d.querySelector('#right').classList.contains('pressed'));assert.ok(!d.querySelector('#gas').classList.contains('pressed'));pointer('right','pointercancel',11);
 for(const type of ['contextmenu','selectstart'])assert.equal(pointer('right',type,100).defaultPrevented,true,'iOS menu/selection suppressed');
 pointer('left','pointerdown',12);d.querySelector('#pause').click();assert.ok(!d.querySelector('#left').classList.contains('pressed'));assert.equal(d.querySelector('#partyPause').hidden,false);pump();const frozen=w.lastRaceFrame.players[0].d;pump(20);assert.equal(w.lastRaceFrame.players[0].d,frozen);
 pointer('right','pointerdown',15);assert.ok(!d.querySelector('#right').classList.contains('pressed'),'paused input ignored');d.querySelector('#resumeParty').click();assert.equal(d.querySelector('#partyPause').hidden,true);
 for(let i=0;i<8;i++){d.querySelector('#restart').click();pump();}assert.equal(frames.size,1,'restarts never multiply RAF chains');
 pump(70);w.dispatchEvent(new w.Event('orientationchange'));assert.equal(d.querySelector('#partyPause').hidden,false);d.querySelector('#resumeParty').click();
 // Wheel and green joystick own one finger independently of the pedals.
 for(const mode of ['wheel','joystick']){
  d.querySelector('#back').click();d.querySelector('#partyControlMode').value=mode;d.querySelector('#partyControlMode').dispatchEvent(new w.Event('change'));assert.equal(JSON.parse(w.localStorage.getItem('kartgo-jaylenn-v1')).mode,mode);d.querySelector('#play').click();pump(80);
  const pad=d.querySelector('#partySteer');pad.getBoundingClientRect=()=>({left:0,width:100});pointer('partySteer','pointerdown',301,50);pointer('partySteer','pointermove',301,90);pointer('gas','pointerdown',302);pump(10);assert.ok(w.lastRaceFrame.players[0].steer>.8,mode+' steers with gas');pointer('gas','pointerup',302);pump();assert.ok(w.lastRaceFrame.players[0].steer>.8,mode+' survives gas release');pointer('partySteer','pointercancel',301);pump();assert.equal(w.lastRaceFrame.players[0].steer,0);
 }
 d.querySelector('#back').click();d.querySelector('#partyControlMode').value='buttons';d.querySelector('#partyControlMode').dispatchEvent(new w.Event('change'));d.querySelector('#play').click();pump(65);
 // A collected item can be spent at speed with two other fingers still held.
 Object.assign(w.qaRacer(),{d:100,x:0,speed:30,penalty:0,freeze:0,inventory:[2,3,4]});pump();
 const slots=[...d.querySelector('#partyItems').children];pointer('gas','pointerdown',501);pointer('right','pointerdown',502);const beforeD=w.lastRaceFrame.players[0].d;
 const itemTouch=new w.Event('pointerdown',{bubbles:true,cancelable:true});Object.defineProperties(itemTouch,{pointerId:{value:503},pointerType:{value:'touch'},isPrimary:{value:false}});slots[0].dispatchEvent(itemTouch);assert.ok(itemTouch.defaultPrevented);pump();
 assert.equal(w.lastRaceFrame.players[0].inventory[0],null);assert.ok(w.lastRaceFrame.players[0].boost>0);assert.ok(w.lastRaceFrame.players[0].d>beforeD);assert.ok(w.lastRaceFrame.players[0].gas);assert.equal(w.lastRaceFrame.players[0].steer,1);assert.ok(d.querySelector('#gas').classList.contains('pressed'));assert.ok(d.querySelector('#right').classList.contains('pressed'));
 slots[1].dispatchEvent(new w.MouseEvent('click',{bubbles:true,detail:1}));pump();assert.equal(w.lastRaceFrame.players[0].inventory[1],3,'synthetic click never spends another item');slots[1].click();pump();assert.equal(w.lastRaceFrame.players[0].inventory[1],null,'keyboard fallback works');
 assert.ok(slots.every((b,i)=>b===d.querySelector('#partyItems').children[i]),'inventory updates retain touch targets');pointer('gas','pointerup',501);pointer('right','pointerup',502);w.qaRacer().boost=0;
 // Pedals override autogas and return to a complete standstill.
 pump(30);pointer('brake','pointerdown',401);pump(50);assert.equal(w.lastRaceFrame.players[0].speed,0,'brake overrides autogas');pointer('brake','pointerup',401);
 d.querySelector('#partyAuto').checked=false;d.querySelector('#partyAuto').dispatchEvent(new w.Event('change'));pump(40);assert.equal(w.lastRaceFrame.players[0].speed,0,'autogas off coasts to rest');assert.equal(JSON.parse(w.localStorage.getItem('kartgo-jaylenn-v1')).auto,false);pointer('gas','pointerdown',402);pump(10);assert.ok(w.lastRaceFrame.players[0].speed>0,'manual throttle works');pointer('gas','pointerup',402);d.querySelector('#partyAuto').checked=true;d.querySelector('#partyAuto').dispatchEvent(new w.Event('change'));
 // All five actual Party controllers reach the finish using ordinary steering/jump controls.
 for(let level=0;level<5;level++){
  d.querySelector('#back').click();assert.equal(frames.size,0,'menu cancels animation');d.querySelector('[data-level="'+level+'"]').click();d.querySelector('#play').click();pump(65);
  let steps=0;while(d.querySelector('#partyFinish').hidden&&steps++<9000){const p=w.lastRaceFrame.players[0];pointer('left','pointerup',201);pointer('right','pointerup',202);if(p.x>.09)pointer('left','pointerdown',201);else if(p.x<-.09)pointer('right','pointerdown',202);if(p.jump<=0&&p.penalty<=0)d.querySelector('#jump').click();pump();}
  assert.ok(!d.querySelector('#partyFinish').hidden,'Party '+(71+level)+' finishes');assert.equal(w.lastRaceFrame.players[0].d,w.KartWorlds.length(71+level));
 }
 assert.equal(w.localStorage.getItem('kartgo-party-jaylenn-v1'),'[0,1]','free finishes preserve adventure');
 d.querySelector('#nextParty').click();d.querySelector('#partyMode').value='adventure';d.querySelector('#partyMode').dispatchEvent(new w.Event('change'));d.querySelector('[data-level="2"]').click();d.querySelector('#play').click();pump(65);
 // Reuse regular controls to complete the next unlocked adventure level.
 for(let steps=0;d.querySelector('#partyFinish').hidden&&steps<9000;steps++){const p=w.lastRaceFrame.players[0];pointer('left','pointerup',201);pointer('right','pointerup',202);if(p.x>.09)pointer('left','pointerdown',201);else if(p.x<-.09)pointer('right','pointerdown',202);if(p.jump<=0&&p.penalty<=0)d.querySelector('#jump').click();pump();}
 assert.deepEqual(JSON.parse(w.localStorage.getItem('kartgo-party-jaylenn-v1')),[0,1,2]);
 const after=JSON.parse(w.localStorage.getItem('kartgo-jaylenn-v1'));for(const key of ['wins','xp','best','session'])assert.deepEqual(after[key],progress[key]);
 console.log('PASS actual Party 71–75 start/countdown, steer, third-finger power-ups at speed, stable slots, multitouch, native selection guard, pause/resume, rotate, restart ownership, five complete races, free/adventure and original saves.');
}finally{w.close();}
