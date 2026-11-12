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
 try{await Promise.all(['characters','karts','scenery','landscapes','effects','terrain','bosses','garage'].map(GFX.load));}catch(err){result(false,'graphics laden: '+err.message);return;}
 if(action==='steerCheck'){
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
   const heads=AVATARS.map((_,i)=>hash(GFX.tile('characters',3,4,i+6)));result(new Set(heads).size===6,'zes werkelijk verschillende rugaanzichtsprites');
   const cv=document.createElement('canvas');cv.width=300;cv.height=300;const c=cv.getContext('2d'),paints=[];
   for(const color of ['#f56a48','#579be4','#78b747']){c.clearRect(0,0,300,300);GFX.drawKart(c,150,265,1.8,color,false,0,saved.player);paints.push(hash(cv));}result(new Set(paints).size===3,'kartkleur verandert werkelijk de racepixels');
   for(const avatar of AVATARS){saved.player.avatar=avatar;persist();const copy=cleanProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)));result(copy.player.avatar===avatar,'coureur blijft bewaard: '+RACER_NAMES[racerIndex(avatar)]);}
   for(const level of [1,5,10,15,20,21,30,40,50]){start(level);state.count=0;draw();result(GFX.canRace(level),'grafische race klaar op level '+level);}
   result(GFX.metrics().loaded.length===9,'alle negen productie-assets gedecodeerd');result(GFX.metrics().decodedBytes<64000000,'atlasgeheugen onder64MB exclusief rendercaches');
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
 if(state&&state.count<=0)document.querySelector('#countdown').textContent='';
});
setInterval(()=>send('status',{viewport:`${innerWidth}×${innerHeight}`,mode:saved.mode,input:{...input},activePointers:activePointers.size,level:state?.level,paused:state?.paused,finished:state?.finished,distance:Math.round(state?.d||0),speed:Math.round(state?.speed||0),position:state?.rank,inventory:state?.inventory,boost:state?.boost,jump:state?.jump,rampAir:state?.rampAir,freeze:state?.freeze,time:state?.time?.toFixed(2),shots:state?.shots?.length,nextIce:state?.nextShot,won:saved.wins,quality:quality.level,raster:GFX.metrics()}),200);
})();
