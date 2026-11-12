// This helper is injected only by the local QA page and refuses production hosts.
(()=>{
if(!['127.0.0.1','localhost'].includes(location.hostname)||new URLSearchParams(location.search).get('qa')!=='1')return;
const send=(type,value)=>parent.postMessage(type==='result'?{type,text:value}:{type,value},location.origin);
const pointer=(selector,type,id,x=0)=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===81,button:0,buttons:type==='pointerdown'||type==='pointermove'?1:0,clientX:r.left+r.width/2+x,clientY:r.top+r.height/2,bubbles:true,cancelable:true}));};
function result(ok,text){send('result',(ok?'PASS: ':'FAIL: ')+text)}
function layout(){const ids=['brake','left','right','wheel','joystick','gas'];const boxes=ids.map(id=>document.getElementById(id)).filter(el=>el.getClientRects().length&&getComputedStyle(el).display!=='none').map(el=>({id:el.id,r:el.getBoundingClientRect()}));let overlaps=[];for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++){const p=boxes[a],q=boxes[b];if(p.r.left<q.r.right&&p.r.right>q.r.left&&p.r.top<q.r.bottom&&p.r.bottom>q.r.top)overlaps.push(p.id+'/'+q.id)}const outside=boxes.filter(p=>p.r.left<0||p.r.right>innerWidth||p.r.top<0||p.r.bottom>innerHeight);result(!overlaps.length&&!outside.length,`${innerWidth}×${innerHeight}: geen overlap/buiten beeld (${saved.mode})`);}
window.addEventListener('message',async e=>{
 if(e.origin!==location.origin||e.source!==parent||e.data.source!=='kartgo-local-qa')return;
 const action=e.data.action;
 try{await Promise.all(['characters','karts','scenery','landscapes','effects','terrain','bosses','garage','charactersExtra'].map(GFX.load));}catch(err){result(false,'graphics laden: '+err.message);return;}
 if(action.startsWith('winter')){
  try{await Promise.all(['winter','iceprops','burger'].map(GFX.load));}catch(err){result(false,'ijsbeelden: '+err.message);return;}
 }
 if(action==='choiceSuite'){
  const prior=JSON.parse(JSON.stringify(saved)),fronts=[],backs=[];
  const hash=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let h=2166136261;for(let i=0;i<d.length;i+=19)h=Math.imul(h^d[i],16777619);return h>>>0;};
  try{
   saved.player.name='KeuzeTester';
   for(const avatar of AVATARS){
    profile();document.querySelector('[data-avatar="'+avatar+'"]').click();document.querySelector('#savePlayer').click();
    result(saved.player.avatar===avatar&&cleanProgress(JSON.parse(localStorage.getItem(STORAGE_KEY))).player.avatar===avatar,'echte selectie/opslaan: '+RACER_NAMES[racerIndex(avatar)]);
    profile();result(document.querySelector('[data-avatar="'+avatar+'"]').getAttribute('aria-pressed')==='true','heropenen: '+RACER_NAMES[racerIndex(avatar)]);
    result(modal.scrollWidth<=modal.clientWidth+1,'geen horizontale profiel-overflow '+innerWidth);closeModal();
    start(1);state.count=0;draw();fronts.push(hash(GFX.driverSprite(avatar,false)));backs.push(hash(GFX.driverSprite(avatar,true)));
   }
   result(new Set(fronts).size===12&&new Set(backs).size===12,'12 unieke vooraanzichten EN12 unieke race-rugaanzichten');
   result(cleanProgress(JSON.parse(progressText())).player.avatar===saved.player.avatar,'nieuwe coureur overleeft voortgangsexport/import');
   const swatches=Object.values(PAINTS).map(color=>{const p=new Uint8ClampedArray([220,30,50,255]);recolorKartPixels(p,color);return [...p].join();});result(new Set(swatches).size===20,'20 verschillende lakpixels inclusief wit/zwart');
  }catch(err){result(false,'keuzes: '+err.message);}finally{saved=prior;persist();state=null;backMap();renderPlayer();send('result','DONE:12 coureurs en20 kleuren '+innerWidth+'×'+innerHeight);}
 }else if(action==='winterSuite'){
  const prior=JSON.parse(JSON.stringify(saved));
  try{
   for(let level=51;level<=70;level++){start(level);state.count=0;state.time=2;draw();result(state.ice&&GFX.canRace(level),'echte ijsrace/beelden klaar '+level);}
   start(54);state.count=0;state.d=(state.features.find(f=>f.kind==='palace').from+25)*SEG;draw();result(Ice.width(54,state.d)<.85,'paleis wordt werkelijk smaller');
   start(63);state.count=0;result(state.blocks.length===9&&state.singleBlocks,'geheim level heeft negen eenmalige ijsblokken');
   start(51);state.count=0;saved.auto=false;state.inventory=[4,2,5];useItem(0);result(state.iceData.holes.length===1&&state.iceData.holes[0].opens===state.time+2,'Jump maakt echte barst met2s waarschuwing');useItem(1);update(.1);result(state.iceData.holes.length>=2,'Boost trekt een breuklijn');
   start(51);state.count=0;saved.auto=false;state.iceData.holes=[{d:1,x:0,born:-2,opens:0,closes:5}];update(.01);result(state.rescue===2,'wak geeft2s veilige redding');pause();const remaining=state.rescue;update(.3);result(state.rescue===remaining,'pauze stopt reddingstimer');closeModal();state.paused=false;checkpoint();const session=JSON.parse(localStorage.getItem(STORAGE_KEY)).session;start(51,session);state.count=0;for(let i=0;i<125;i++)update(1/60);result(state.rescue===0&&state.d>=500,'heropenen en veilig landen buiten wak');
   start(70);state.count=0;saved.auto=false;state.time=12;update(.01);result(state.iceData.attack?.kind==='lettuce','sla-golf echt aangekondigd');state.x=-state.iceData.attack.safe;update(2.01);result(state.lettuce===2,'sla raakt en vertraagt2s');
   start(70);state.count=0;saved.auto=false;state.time=20;state.iceData.nextLettuce=999;update(.01);state.x=state.iceData.attack.lane;update(2.01);result(state.basket===3,'wasmandstraf duurt3s');result(state.finishDistance===104000&&state.laps===1,'Burgerkoning heeft één echt lange ronde');
   for(const mode of ['buttons','wheel','joystick']){saved.mode=mode;modeUI();layout();}
   const roundtrip=cleanProgress(JSON.parse(progressText()));result(roundtrip.player.code===saved.player.code&&roundtrip.wins.join()===saved.wins.join(),'bestaande profiel/voortgang behouden');
   result(GFX.metrics().decodedBytes<96000000,'atlasgeheugen onder96MB inclusief winter (exclusief caches)');
  }catch(err){result(false,'IJs-Wereld: '+err.message);}finally{saved=prior;persist();state=null;backMap();renderPlayer();send('result','DONE: IJs-Wereld '+innerWidth+'×'+innerHeight);}
 }else if(action==='winterStart'){start(51);saved.auto=true;
 }else if(['winterView','winterPalace','winterSecret','winterKing'].includes(action)){
  const level=action==='winterKing'?70:action==='winterSecret'?63:action==='winterPalace'?54:51;start(level);state.count=0;state.speed=MAX;state.time=3;saved.auto=true;
  if(action==='winterPalace')state.d=(state.features.find(f=>f.kind==='palace').from-10)*SEG;
  if(action==='winterKing'){state.d=10000;state.opponents[0].d=state.d+1800;state.time=12;update(.01);}
  state.opponents.forEach((o,i)=>{o.d=state.d+1200+i*1000;});state.paused=true;draw();
 }else if(action==='winterFinish'){start(70);state.count=0;state.d=state.finishDistance;state.time=52;state.opponents[0].d=state.d-2000;finish();
 }else if(action==='paintSuite'){
  const prior=JSON.parse(JSON.stringify(saved)),desc=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'filter');
  const click=el=>{el.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',pointerId:81,bubbles:true}));el.dispatchEvent(new PointerEvent('pointerup',{pointerType:'touch',pointerId:81,bubbles:true}));el.click();};
  const hashes=[];const hash=cv=>{const data=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=2166136261;for(let i=0;i<data.length;i+=19)n=Math.imul(n^data[i],16777619);return n>>>0;};
  try{
   Object.defineProperty(CanvasRenderingContext2D.prototype,'filter',{configurable:true,get:()=> 'none',set:()=>{throw new Error('Canvas filter used');}});
   state=null;garage();
   for(const color of Object.values(PAINTS)){
    click(document.querySelector('[data-paint="'+color+'"]'));
    result(document.querySelector('#kartColor').value===color,'kleurknop selecteert '+PAINT_NAMES[color]);
    result(document.querySelectorAll('[data-paint][aria-pressed="true"]').length===1,'exact één vinkje bij '+PAINT_NAMES[color]);
    hashes.push(hash(document.querySelector('#garageArt')));
    click(document.querySelector('#saveGarage'));closeModal();garage();
    result(saved.player.color===color&&document.querySelector('#kartColor').value===color&&JSON.parse(localStorage.getItem(STORAGE_KEY)).player.color===color,'kleur blijft bewaard en heropent: '+PAINT_NAMES[color]);
   }
   result(new Set(hashes).size===Object.values(PAINTS).length,'twintig verschillende echte kartvoorvertoningen zonder Canvas filter');
   closeModal();start(1);state.count=0;const c=document.createElement('canvas');c.width=300;c.height=300;const ctx=c.getContext('2d'),raceHashes=[];
   for(const color of Object.values(PAINTS)){ctx.clearRect(0,0,300,300);GFX.drawKart(ctx,150,275,1.8,color,false,0,saved.player);raceHashes.push(hash(c));}result(new Set(raceHashes).size===Object.values(PAINTS).length,'twintig echte racekarts hebben verschillende lak zonder Canvas filter');
  }catch(err){result(false,'garage: '+err.message);}finally{if(desc)Object.defineProperty(CanvasRenderingContext2D.prototype,'filter',desc);else delete CanvasRenderingContext2D.prototype.filter;saved=prior;persist();state=null;backMap();renderPlayer();send('result','DONE: garagekleuren');}
 }else if(action==='v52suite'){
  const prior=JSON.parse(JSON.stringify(saved));
  try{
   start(12);state.count=0;draw();const top=document.querySelector('#controls').getBoundingClientRect().top;result(view.playerY<=top-(innerWidth/innerHeight<.8?35:18),'meer ruimte tussen kart en bediening');
   for(const mode of ['buttons','wheel','joystick']){saved.mode=mode;modeUI();layout();}
   state.d=0;state.opponents[0].d=1000;state.opponents[0].x=-.54;state.opponents[1].d=1800;state.opponents[1].x=-.54;state.opponents[2].d=10000;result(botTactic(state,state.opponents[0],0).ideal>-.4,'bot kiest echt een vrije inhaalstrook');
   saved.player.name='Papa';saved.player.avatar=AVATARS[4];start(1);state.d=LENGTH*2;state.opponents.forEach(o=>o.d=state.d-3000);finish();result(document.querySelector('.victory-scene')!==null,'winnaars-podium wordt echt geopend');result(document.querySelector('.podium strong small').textContent==='Papa','eigen naam op podium');result(document.querySelector('.podium-racer [data-character="4"]')!==null,'eigen kikker en beker op podium');result(document.querySelector('#nextRace')!==null&&document.querySelector('#backMap')!==null,'vervolgknoppen blijven beschikbaar');
  }catch(err){result(false,'V5.2: '+err.message);}finally{saved=prior;persist();send('result','DONE: V5.2');}
 }else if(action==='steerCheck'){
  const prior=JSON.parse(JSON.stringify(saved)),original=GFX.drawKart;
  try{for(const mode of ['buttons','wheel','joystick']){for(const direction of [-1,1]){
   start(1);state.count=0;state.speed=MAX;state.curves.fill(0);saved.mode=mode;modeUI();resetInput();
   if(mode==='buttons')pointer(direction<0?'#left':'#right','pointerdown',81);else{pointer('#'+mode,'pointerdown',81);pointer('#'+mode,'pointermove',81,direction*45);}
   let drawn=null;GFX.drawKart=(...args)=>{if(args[7]===saved.player)drawn=args[6];return original(...args);};
   for(let i=0;i<12;i++)update(1/60);draw();result(state.x*direction>0&&drawn*direction>0,mode+': '+(direction<0?'links':'rechts')+' input/physics/rasterrichting gelijk');
   GFX.drawKart=original;resetInput();for(let i=0;i<60;i++)update(1/60);result(Math.abs(state.steer)<.001,mode+': loslaten centreert kart');
  }}}catch(err){result(false,'sturen: '+err.message);}finally{GFX.drawKart=original;saved=prior;persist();state=null;backMap();renderPlayer();send('result','DONE: stuurrichting');}
 }else if(action==='steerLeft'||action==='steerRight'){
  start(1);state.count=0;state.speed=MAX;state.curves.fill(0);saved.mode='buttons';modeUI();const dir=action==='steerLeft'?-1:1;pointer(dir<0?'#left':'#right','pointerdown',81);for(let i=0;i<12;i++)update(1/60);state.paused=true;draw();
 }else if(action==='terrainSuite'){
  const prior=JSON.parse(JSON.stringify(saved));
  try{
   for(const level of [1,5,12,20,21,35,50]){start(level);state.count=0;
    for(const d of [0,9000,21000,32000,43000,51800]){state.d=d;draw();result(projection.every(p=>[p.x,p.y,p.w,p.clipY].every(Number.isFinite)),'geen ongeldige projectie '+level+'/'+d);}
   }
   start(12);state.count=0;state.speed=MAX;saved.auto=true;const lip=state.features.find(f=>f.kind==='ramp').to*SEG;state.d=lip-2;update(1/60);result(state.rampAir>0&&state.jump===0,'springschans lanceert werkelijk zonder Jump-item');
   update(.3);draw();result(rampLift(state)>.6,'zichtbare hoogte tijdens sprong');const air=state.rampAir;pause();update(.2);result(state.rampAir===air,'pauzeren stopt de sprong');state.paused=false;closeModal();checkpoint();const stored=JSON.parse(localStorage.getItem(STORAGE_KEY));start(12,stored.session);state.count=0;result(state.rampAir===air,'sprong blijft correct na heropenen');for(let i=0;i<100;i++)update(1/60);result(state.rampAir===0,'kart landt vanzelf');
   result(state.features.filter(f=>f.kind==='bridge').length===2,'twee echte brugpassages');
   result(projection.some(p=>p.visible===false),'heuveltop verbergt achterliggende weg');
   for(const mode of ['buttons','wheel','joystick']){saved.mode=mode;modeUI();layout();}
  }catch(err){result(false,'terrein: '+err.message);}finally{saved=prior;persist();state=null;backMap();renderPlayer();send('result','DONE: hoogtes/springschans');}
 }else if(['viewHill','viewCorner','viewRamp','viewAir'].includes(action)){
  start(12);state.count=0;saved.auto=true;state.speed=MAX;
  const f=action==='viewCorner'?courseCorners(12)[0]:state.features.find(f=>f.kind===(action==='viewHill'?'bridge':'ramp'));state.d=(f.from-(action==='viewHill'?12:action==='viewCorner'?-3:9))*SEG;
  if(action==='viewAir'){state.d=f.to*SEG-2;update(1/60);for(let i=0;i<30;i++)update(1/60);}
  state.opponents.forEach((o,i)=>{o.d=state.d+900+i*1100;o.x=[-.5,0,.5][i];});state.paused=true;draw();send('result','SNAPSHOT: '+action+' (gepauzeerde echte renderer)');
 }else if(action==='v5visual'){
  const prior=JSON.parse(JSON.stringify(saved));
  try{
   start(1);state.count=0;state.speed=0;saved.xp=0;GFX.resetMetrics();draw();const m=GFX.metrics();
   result(m.karts>=4&&m.drivers>=4,'rasterkarts EN gekozen coureurs worden in echte race getekend');result(m.scenery>0&&m.landscapes>0&&m.terrain>0,'echte rasteromgeving, panorama en wegtextuur actief');
   const hash=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let h=2166136261;for(let i=0;i<d.length;i+=29)h=Math.imul(h^d[i],16777619);return h>>>0;};
   const heads=AVATARS.map(avatar=>hash(GFX.driverSprite(avatar,true)));result(new Set(heads).size===AVATARS.length,'twaalf werkelijk verschillende rugaanzichtsprites');
   const cv=document.createElement('canvas');cv.width=300;cv.height=300;const c=cv.getContext('2d'),paints=[];
   for(const color of ['#f56a48','#579be4','#78b747']){c.clearRect(0,0,300,300);GFX.drawKart(c,150,265,1.8,color,false,0,saved.player);paints.push(hash(cv));}result(new Set(paints).size===3,'kartkleur verandert werkelijk de racepixels');
   for(const avatar of AVATARS){saved.player.avatar=avatar;persist();const copy=cleanProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)));result(copy.player.avatar===avatar,'coureur blijft bewaard: '+RACER_NAMES[racerIndex(avatar)]);}
   for(const level of [1,5,10,15,20,21,30,40,50]){start(level);state.count=0;draw();result(GFX.canRace(level),'grafische race klaar op level '+level);}
   result(['menu','characters','karts','scenery','landscapes','bosses','effects','garage','terrain'].every(k=>GFX.metrics().loaded.includes(k)),'alle negen productie-assets gedecodeerd');result(GFX.metrics().decodedBytes<96000000,'atlasgeheugen onder96MB exclusief rendercaches');
   for(const world of [1,2]){selectedWorld=world;backMap();result(!document.querySelector('#worldPanel').classList.contains('hidden'),'wereldkaart opent werkelijk');}
  }catch(err){result(false,'V5: '+err.message);}finally{saved=prior;persist();state=null;backMap();renderPlayer();send('result','DONE: V5 rastercontrole '+innerWidth+'×'+innerHeight);}
 }else if(action==='v4suite'){
  const prior=JSON.parse(JSON.stringify(saved));
  try{
   for(const level of [1,20,21,35,50]){start(level);state.count=0;state.speed=MAX;const d=state.opponents[0].d;update(.1);result(state.opponents[0].d>d,'bots rijden mee level '+level);draw();result(state.blocks.length===(level===20?9:10),'Lucky Blocks level '+level);}
   start(1);state.count=0;state.inventory=[0,2,4];renderInventory();const original=document.querySelector('[data-slot="0"]');renderInventory();result(original===document.querySelector('[data-slot="0"]'),'inventarisknoppen blijven stabiel');
   for(let i=0;i<3;i++)pointer('[data-slot="'+i+'"]','pointerdown',100+i);
   result(state.inventory.every(v=>v===null)&&state.boost===4&&state.jump===1.4,'Onweer Boost Jump reageren via touch');
   state.d=10000;state.opponents.forEach(o=>o.d=0);state.inventory=[1,3,null];renderInventory();pointer('[data-slot="0"]','pointerdown',105);result(state.opponents.some(o=>o.hyp===10),'hypnose10s werkt ook vooraan');pointer('[data-slot="1"]','pointerdown',106);result(state.bananas.length===1,'banaan wordt echt neergelegd');
   start(21);state.count=0;state.inventory=[5,1,3];renderInventory();pointer('[data-slot="0"]','pointerdown',107);result(state.opponents[0].freeze===2,'Zandwereld ijs bevriest2s');result(Array.from({length:100},()=>randomItem()).every(i=>[1,3,5].includes(i)),'Zandwereld heeft uitsluitend hypnose ijs banaan');
   saved.wins=Array.from({length:39},(_,i)=>i+1);saved.xp=3900;saved.rewards.glitter=true;saved.player={...saved.player,name:'TurboQA',avatar:'🐸',color:'#ab75d0',effect:'boem'};start(40);state.count=0;cosmeticBurst();cosmeticBurst();result(state.effects.filter(e=>e.type==='boem').length===1,'Boem heeft2s afkoeling');state.time=2;cosmeticBurst();result(state.effects.length===2,'Boem werkt na2s opnieuw');saved.player.effect='none';state.time=4;cosmeticBurst();result(state.effects.length===2,'Geen effect schakelt Boem uit');
   checkpoint();const stored=JSON.parse(localStorage.getItem(STORAGE_KEY));result(stored.session.level===40&&stored.player.color==='#ab75d0'&&stored.player.avatar==='🐸','voortgang profiel en garage worden echt opgeslagen');
   saved=prior;persist();start(20);state.count=0;state.time=9.99;update(.02);result(state.shots.length===1&&state.nextShot===20,'Hotdog-Hond vuurt op10s');state.shots=[{d:state.d+1,x:state.x,speed:-3000,life:5}];update(.01);result(state.freeze===2,'Hotdog-ijs bevriest2s');state.freeze=0;state.jump=1;state.shots=[{d:state.d+1,x:state.x,speed:-3000,life:5}];update(.01);result(state.freeze===0,'Jump ontwijkt ijs');
   start(50);state.count=0;state.time=10;update(.01);draw();result(state.opponents[0].pizza&&state.shots.length===0,'Pizzaman heeft eigen uiterlijk en geen verzonnen ijsaanval');
   for(const mode of ['buttons','wheel','joystick']){saved.mode=mode;modeUI();layout();const rects=[...document.querySelectorAll('[data-slot]')].map(b=>{const r=b.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-slot]')===b;});result(rects.every(Boolean),'alle items bereikbaar via hit-test '+mode);}
  }catch(e){result(false,'V4 suite: '+e.message);}finally{saved=prior;persist();state=null;backMap();renderPlayer();}
 }else if(action==='sand'){start(28);state.count=0;saved.auto=true;state.inventory=[1,5,3];renderInventory();
 }else if(action==='pizza'){start(50);state.count=0;saved.auto=true;state.inventory=[1,5,3];renderInventory();
 }else if(action==='rewards'){saved.wins=Array.from({length:39},(_,i)=>i+1);saved.xp=3900;saved.rewards.glitter=true;persist();state=null;backMap();renderPlayer();
 }else if(action==='multitouch'){
  start(1);state.count=0;saved.auto=false;saved.mode='buttons';modeUI();
  pointer('#right','pointerdown',81);pointer('#gas','pointerdown',82);
  result(input.right&&input.gas,'sturen en gas tegelijk');pointer('#gas','pointerup',99);result(input.gas,'andere pointer kan gas niet loslaten');
  // Fixed simulation steps isolate input/physics from cloud-browser RAF throttling.
  {for(let i=0;i<40;i++)update(1/60);result(state.speed>0&&state.x>0,'echte racephysics reageert op touch (40 vaste stappen)');pointer('#gas','pointerup',82);result(input.right&&!input.gas,'alleen gas wordt losgelaten');pointer('#right','pointercancel',81);result(!input.right&&!input.gas&&activePointers.size===0,'pointercancel maakt bediening vrij');pointer('#left','pointerdown',83);pointer('#brake','pointerdown',84);result(input.left&&input.brake,'sturen en remmen tegelijk');pause();result(activePointers.size===0&&!input.left&&!input.brake,'pauze wist alle aanrakingen');}
 }else if(action==='analog'){
  start(1);state.count=0;
  for(const mode of ['wheel','joystick']){saved.mode=mode;modeUI();pointer('#'+mode,'pointerdown',85);pointer('#'+mode,'pointermove',85,45);pointer('#gas','pointerdown',86);result(input.analog>.3&&input.gas,mode+' met gelijktijdig gas');pointer('#'+mode,'pointerup',85);pointer('#gas','pointerup',86);result(input.analog===0&&!input.gas,mode+' keert terug na loslaten');pointer('#'+mode,'pointerdown',87);pointer('#'+mode,'pointermove',87,-45);resetInput();pointer('#'+mode,'pointerdown',88);pointer('#'+mode,'pointermove',88,45);result(input.analog>.3,mode+' werkt opnieuw na reset');resetInput();layout();}
  saved.mode='buttons';saved.auto=true;persist();modeUI();
 }else if(action==='pickup'){if(!state||state.finished)start(1);state.count=0;saved.auto=true;state.x=0;state.blocks[0]={d:(state.d%LENGTH)+600,x:0,lap:-1};state.inventory=[null,null,null];renderInventory();
 }else if(action==='items'){if(!state||state.finished)start(1);state.count=0;state.inventory=[0,2,4];renderInventory();
 }else if(action==='finish'){start(1);state.count=0;state.d=LENGTH*2-1200;state.speed=MAX;state.opponents.forEach(o=>o.d=state.d-2000);saved.auto=true;
 }else if(action==='boss'){start(20);state.count=0;state.time=9.4;saved.auto=true;const watch=setInterval(()=>{if(!state||state.level!==20){clearInterval(watch);return;}if(state.nextShot>=20){clearInterval(watch);result(state.time>=10&&state.time<10.3,'automatisch ijs afgevuurd na 10 seconden');}},100);
 }else if(action==='ice'||action==='jumpIce'){start(20);state.count=0;saved.auto=true;state.shots=[{d:state.d+1500,x:0,speed:-3000,life:5}];state.inventory=action==='jumpIce'?[4,null,null]:[null,null,null];renderInventory();if(action==='jumpIce')document.querySelector('[data-slot="0"]').click();const deadline=performance.now()+10000;const poll=setInterval(()=>{if((state.time>.1&&state.shots.length===0)||performance.now()>deadline){clearInterval(poll);result(action==='jumpIce'?state.freeze===0:state.freeze>0,action==='jumpIce'?'Jump voorkomt ijs-bevriezing':'ijs bevriest de speler');}},100);
 }else if(action==='bridge'||action==='tunnel'){start(12);state.count=0;saved.auto=true;state.d=(state.features.find(f=>f.kind===action).from-7)*SEG;state.speed=MAX;
 }else if(action==='layout'){setTimeout(layout,100);}
 if(state&&state.count<=0){document.querySelector('#countdown').textContent='';document.querySelector('#startLights').classList.add('hidden');document.querySelector('#startVoice').classList.add('hidden');}
});
setInterval(()=>send('status',{viewport:`${innerWidth}×${innerHeight}`,mode:saved.mode,input:{...input},activePointers:activePointers.size,level:state?.level,paused:state?.paused,finished:state?.finished,distance:Math.round(state?.d||0),speed:Math.round(state?.speed||0),position:state?.rank,inventory:state?.inventory,boost:state?.boost,jump:state?.jump,rampAir:state?.rampAir,freeze:state?.freeze,time:state?.time?.toFixed(2),shots:state?.shots?.length,nextIce:state?.nextShot,won:saved.wins,quality:quality.level,raster:GFX.metrics(),audio:RaceAudio.status(),ice:state?.ice,sliding:state?.slide,rescue:state?.rescue,iceHoles:state?.iceData?.holes.length,kingAttack:state?.iceData?.attack?.kind}),200);
})();
