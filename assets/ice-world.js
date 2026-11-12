/* Jaylenn's Ice World: scoped extension of the existing Kart Go engine. */
'use strict';
const ICE_NAMES=['Sneeuwstart','Kristalbocht','De eerste ijsdeur','Bevroren vijver','IJsschans','Paleis van de sneeuw','Glijspoor','IJspegeltunnel','De smalle zaal','Winterbrug','Sneeuwstormpad','Spiegelijs','Geheime IJskamer','Het blauwe paleis','Dubbele ijsschans','De kristallen vallei','Grote ijsdeur','Laatste sneeuwtop','Koninklijke aanloop','Koning van de Burgers'];
const worldOf=level=>level>50?3:level>20?2:1;
const Ice=(()=>{
 const lanes=[-.62,0,.62];
 function profile(level){const n=level-50;return{stage:Math.floor((n-1)/5),difficulty:Math.round(16+(n-1)/19*13),bend:.75+n*.025,hill:540+Math.floor((n-1)/5)*150+n*9,theme:['snow','palace','crystal','royal'][Math.floor((n-1)/5)]};}
 function features(level){const n=level-50,f=[{kind:'bridge',from:46+level%4*3,to:70+level%4*3},{kind:'ramp',from:104,to:110},{kind:'bridge',from:193,to:218}];
  if(n>=3)f.push({kind:'palace',from:132,to:170+(n%4)*3});
  if(n>=10)f.push({kind:'ramp',from:226,to:232});
  if(level===70)f.push({kind:'palace',from:302,to:354},{kind:'ramp',from:397,to:403},{kind:'bridge',from:430,to:454});return f;
 }
 function width(level,d){if(level<=50)return 1;const i=courseWrap(d/SEG,COUNT),f=features(level).find(f=>f.kind==='palace'&&i>=f.from&&i<=f.to);return f?Math.max(.72,.96-Math.floor((i-f.from)/3)*.02):1;}
 function obstacles(level,rand){const n=level-50,count=3+Math.floor(n/4),out=[];
  for(let i=0;i<count;i++){let d=8500+i*(LENGTH-14000)/count+(rand()-.5)*300;if(features(level).some(f=>f.kind==='ramp'&&Math.abs(d-f.to*SEG)<3200))d+=3500;out.push({d:Math.min(LENGTH-3000,d),x:lanes[(i+level)%3],kind:n>=6&&i%3===1?'icicle':'spike',brokenUntil:0,hitLap:-1});}
  if(n>=4)out.push({d:LENGTH*.47,x:lanes[level%3],kind:'fissure',hitLap:-1});return out;
 }
 function init(s){s.ice=true;s.iceData={holes:[],nextBoostCrack:0,nextLettuce:12,nextBasket:20,attack:null,lastAttack:-10,waves:[],palaceLap:-1};
  for(const racer of [s,...s.opponents]){racer.lettuce=0;racer.basket=0;racer.rescue=0;racer.iceShield=0;racer.slide=0;racer.rescueTo=racer.d;racer.rescueLane=0;}
 }
 function crack(s,d=s.d,x=s.x){if(!s.ice)return;const h={d,x:clamp(x,-.66,.66),born:s.time,opens:s.time+2,closes:s.time+5};s.iceData.holes.push(h);s.iceData.holes=s.iceData.holes.slice(-28);}
 function penalty(s,racer,kind){if(racer.iceShield>0||racer.rescue>0)return false;
  if(kind==='hole'){racer.rescue=2;racer.iceShield=4;racer.rescueTo=Math.min(s.finishDistance-600,racer.d+500);racer.rescueLane=racer.x>0?-.52:.52;if(racer===s)racer.speed=0;}
  if(kind==='lettuce'){racer.lettuce=2;racer.iceShield=4;if(racer===s)racer.speed=Math.min(racer.speed,MAX*.6);}
  if(kind==='basket'){racer.basket=3;racer.iceShield=5;if(racer===s)racer.speed=Math.min(racer.speed,MAX*.5);}
  if(kind==='spike'){racer.slow=Math.max(racer.slow||0,1);racer.iceShield=2;}
  if(racer===s){s.impact=.25;addEffect(kind==='hole'?'ice':'impact');toast({hole:'Plons! Je wordt veilig teruggezet.',lettuce:'Sla op je kart! Twee seconden rustiger.',basket:'Drie seconden racen in een wasmand!',spike:'IJspegel! Hij groeit over 3 seconden terug.'}[kind]);}
  return true;
 }
 function timers(s,dt){for(const r of [s,...s.opponents]){const was=r.rescue>0;for(const k of ['lettuce','basket','rescue','iceShield'])r[k]=Math.max(0,(r[k]||0)-dt);if(was&&!r.rescue){r.d=r.rescueTo;r.x=r.rescueLane;r.slide=0;}}}
 function speedFactor(r){return r.basket>0?.5:r.lettuce>0?.6:1;}
 function lateral(s,value,dt){if(s.rescue>0){s.slide=0;return 0;}s.slide=lerp(s.slide||0,value,1-Math.exp(-dt*(input.brake?10:3.5)));return s.slide;}
 function update(s,dt){const data=s.iceData;
  if(s.boost>0&&s.time>=data.nextBoostCrack){crack(s,s.d-100,s.x);data.nextBoostCrack=s.time+.55;}
  for(const obstacle of s.obstacles){const gap=circularGap(obstacle.d,s.d),lap=Math.floor(s.d/LENGTH);
   if(obstacle.kind==='fissure'){if(gap>0&&gap<6500&&obstacle.hitLap!==lap){crack(s,lap*LENGTH+obstacle.d,obstacle.x);obstacle.hitLap=lap;}continue;}
   if(obstacle.brokenUntil>s.time)continue;
   for(const r of [s,...s.opponents]){if(Math.abs(circularGap(obstacle.d,r.d))<185&&Math.abs(obstacle.x-r.x)<.25&&(obstacle.kind==='icicle'?airborne(r):!airborne(r))){if(penalty(s,r,'spike'))obstacle.brokenUntil=s.time+3;}}
  }
  for(const h of data.holes)if(s.time>=h.opens&&s.time<h.closes){for(const r of [s,...s.opponents])if(Math.abs(h.d-r.d)<210&&Math.abs(h.x-r.x)<.29&&!airborne(r))penalty(s,r,'hole');}
  data.holes=data.holes.filter(h=>h.closes>s.time);data.waves=data.waves.filter(w=>s.time-w.born<1.1);
  if(s.level===70){
   if(data.attack&&s.time>=data.attack.at){const a=data.attack;for(const r of [s,...s.opponents.filter(o=>!o.boss)]){if(a.kind==='lettuce'?Math.abs(r.x-a.safe)>.30:Math.abs(r.x-a.lane)<.30)penalty(s,r,a.kind);}
    data.waves.push({...a,d:s.d+700,born:s.time});data.lastAttack=s.time;data.attack=null;
   }
   if(!data.attack&&s.time-data.lastAttack>=4){let kind=null;if(s.time>=data.nextLettuce){kind='lettuce';data.nextLettuce=s.time+12;}else if(s.time>=data.nextBasket){kind='basket';data.nextBasket=s.time+20;}
    if(kind){const cycle=Math.floor(s.time/6)%3;data.attack={kind,at:s.time+2,safe:lanes[cycle],lane:lanes[(cycle+1)%3]};}
   }
  }
  const palace=features(s.level).find(f=>f.kind==='palace'&&courseWrap(s.d/SEG,COUNT)>=f.from&&courseWrap(s.d/SEG,COUNT)<=f.to);
  if(palace&&data.palaceLap!==Math.floor(s.d/LENGTH)){data.palaceLap=Math.floor(s.d/LENGTH);toast('IJSPALEIS · ijsdeur 99 m · muren op veilige afstand.');}
 }
 function hud(s){let text='';const a=s.iceData.attack;
  if(a){const lane=x=>x<-.3?'LINKS':x>.3?'RECHTS':'MIDDEN';text=a.kind==='lettuce'?`SLA-GOLF over ${Math.ceil(a.at-s.time)}s · VEILIG: ${lane(a.safe)}`:`WASMAND over ${Math.ceil(a.at-s.time)}s · ONTWIJK ${lane(a.lane)}`;}
  else if(s.rescue>0)text=`Plons! Veilig terug over ${Math.ceil(s.rescue)}s`;
  else if(s.basket>0)text=`Wasmand · nog ${Math.ceil(s.basket)}s`;
  else if(s.lettuce>0)text=`Sla op je kart · nog ${Math.ceil(s.lettuce)}s`;
  else if(s.iceData.holes.some(h=>h.d>s.d&&h.d-s.d<5000))text='BARST IN HET IJS · kies een vrije strook!';
  else if(s.obstacles.some(o=>o.kind==='icicle'&&o.brokenUntil<=s.time&&circularGap(o.d,s.d)>0&&circularGap(o.d,s.d)<3000))text='LAGE IJSPEGELS · blijf op de grond!';
  const el=$('#iceCue');if(el){el.classList.toggle('hidden',!text);if(el.textContent!==text)el.textContent=text;}if(text)$('#danger').classList.add('hidden');
 }
 function snapshot(s){return{...s.iceData,player:{lettuce:s.lettuce,basket:s.basket,rescue:s.rescue,iceShield:s.iceShield,slide:s.slide,rescueTo:s.rescueTo??s.d,rescueLane:s.rescueLane??0}};}
 function restore(s,source){if(!source||typeof source!=='object')return;const data=s.iceData;
  for(const k of ['nextBoostCrack','nextLettuce','nextBasket','lastAttack','palaceLap'])if(Number.isFinite(source[k]))data[k]=source[k];
  if(Array.isArray(source.holes))data.holes=source.holes.filter(h=>['d','x','born','opens','closes'].every(k=>Number.isFinite(h[k]))&&h.opens>=h.born&&h.closes>h.opens).slice(-28).map(h=>({d:Math.max(0,h.d),x:clamp(h.x,-.8,.8),born:h.born,opens:h.opens,closes:h.closes}));
  const a=source.attack;if(a&&['lettuce','basket'].includes(a.kind)&&['at','safe','lane'].every(k=>Number.isFinite(a[k])))data.attack={kind:a.kind,at:a.at,safe:clamp(a.safe,-.62,.62),lane:clamp(a.lane,-.62,.62)};
  const p=source.player||{};for(const k of ['lettuce','basket','rescue','iceShield'])if(Number.isFinite(p[k]))s[k]=clamp(p[k],0,5);if(Number.isFinite(p.slide))s.slide=clamp(p.slide,-2,2);if(Number.isFinite(p.rescueTo))s.rescueTo=clamp(p.rescueTo,0,s.finishDistance-600);if(Number.isFinite(p.rescueLane))s.rescueLane=clamp(p.rescueLane,-.62,.62);
 }
 function prop(c,index,x,y,w,h=w){const im=GFX.tile('iceprops',3,3,index);if(!im)return false;c.drawImage(im,x-w/2,y-h,w,h);return true;}
 function scenery(c,type,x,y,k){const index={oak:0,pine:0,blossom:0,barn:1,mill:1,rocks:3,hay:3,fence:3,flowers:3,grass:3,pond:3,sign:3}[type]??0;const factor=index===1?2.1:index===0?1.4:.8;return prop(c,index,x,y,340*k*factor,370*k*factor);}
 function landscape(c,w,h,s){const im=GFX.image('winter');if(!im)return false;const drift=Math.sin(s.d/20000)*w*.025-s.x*w*.012,dw=w*1.08,dh=h*.42,scale=Math.max(dw/im.naturalWidth,dh/im.naturalHeight),sw=dw/scale,sh=dh/scale;c.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,-w*.04+drift,-h*.01,dw,dh);return true;}
 function road(c,a,b,s,terrain){
  const gradient=c.createLinearGradient(a.x-a.w,a.y,a.x+a.w,b.y);gradient.addColorStop(0,'#68b8d5');gradient.addColorStop(.45,'#c0edf6');gradient.addColorStop(.65,'#85c7e3');gradient.addColorStop(1,'#acdbe9');
  shape(c,[[a.x-a.w,a.y+1],[a.x+a.w,a.y+1],[b.x+b.w,b.y],[b.x-b.w,b.y]],gradient);
  c.strokeStyle='#efffff66';c.lineWidth=Math.max(.5,a.w*.006);if(a.segIndex%4===0){for(const side of [-.74,.48]){c.beginPath();c.moveTo(a.x+a.w*side,a.y);c.lineTo(b.x+b.w*(side+.12),b.y);c.stroke();}}
  if(terrain==='palace'){for(const side of [-1,1]){const x=a.x+side*(a.fullW||a.w)*2,nx=b.x+side*(b.fullW||b.w)*2,h=a.scale*4500*H*.62,nh=b.scale*4500*H*.62;shape(c,[[x,a.y],[x,a.y-h],[nx,b.y-nh],[nx,b.y]],a.segIndex%3?'#79cbeaa0':'#c0f7ffb0');}}
 }
 function sprites(s,projection,projectDist,out){
  for(const h of s.iceData.holes){const p=projectDist(h.d);if(p)out.push({p,x:h.x,type:'frozen-hole',hole:h});}
  for(const f of s.features)if(f.kind==='palace'){for(const endpoint of [f.from,f.to]){const p=projection.find(p=>p.segIndex===endpoint);if(p)out.push({p,x:0,type:'ice-gate'});}}
  for(const wave of s.iceData.waves){const p=projectDist(wave.d);if(p){if(wave.kind==='basket')out.push({p,x:wave.lane,type:'king-prop',kind:6});else for(const x of lanes)if(x!==wave.safe)out.push({p,x,type:'king-prop',kind:7});}}
 }
 function drawSprite(c,v,x,y,k,s){
  if(v.type==='ice-gate'){const fw=v.p.fullW||v.p.w;prop(c,2,v.p.x,y,fw*8,v.p.scale*29700*H*.62);return true;}
  if(v.type==='king-prop'){prop(c,v.kind,x,y,160*k,160*k);return true;}
  if(v.type==='frozen-hole'){const open=s.time>=v.hole.opens;c.save();c.strokeStyle=open?'#efffff':'#146685';c.lineWidth=Math.max(1,3*k);ellipse(c,x,y,Math.max(3,90*k),Math.max(2,24*k),open?'#10385c':'#8acbd888');c.beginPath();c.ellipse(x,y,Math.max(3,90*k),Math.max(2,24*k),0,0,Math.PI*2);c.stroke();if(!open){c.beginPath();c.moveTo(x-60*k,y);c.lineTo(x-10*k,y-12*k);c.lineTo(x+7*k,y+9*k);c.lineTo(x+55*k,y-5*k);c.stroke();}c.restore();return true;}
  if(v.type==='spike'||v.type==='icicle'){const o=v.obstacle;if(o?.brokenUntil>s.time)return true;prop(c,v.type==='spike'?4:5,x,v.type==='icicle'?y-600*k:y,100*k,110*k);return true;}
  if(v.type==='fissure')return true;return false;
 }
 function racerEffects(c,r,x,y,scale){if(r.basket>0)prop(c,6,x,y+15*scale,125*scale,100*scale);if(r.lettuce>0)prop(c,7,x+25*scale,y-15*scale,80*scale,65*scale);if(r.rescue>0){ellipse(c,x,y,48*scale,12*scale,'#a6efffb0');prop(c,3,x,y-15*scale,65*scale,55*scale);}}
 function weather(c,s){if(quality.level===0)return;c.fillStyle='#ffffffac';for(let i=0;i<(quality.level===2?24:12);i++){const x=(i*127+s.time*(i%2?13:-9)+W*8)%W,y=(i*71+s.time*25)%H;ellipse(c,x,y,1+i%2,1+i%2,'#ffffffe0');}}
 return{profile,features,width,obstacles,init,crack,penalty,timers,speedFactor,lateral,update,hud,snapshot,restore,prop,scenery,landscape,road,sprites,drawSprite,racerEffects,weather};
})();

// Local audio only: no voice API, account or tracking. Web Audio is unlocked by a user gesture.
const RaceAudio=(()=>{
 let context=null,ho=null,sources=[],token=0;
 const sentences={nl:"Help, ik heb zand in m'n mond!",en:'Help, I have sand in my mouth!',de:'Hilfe, ich habe Sand im Mund!',fr:"Au secours, j'ai du sable dans la bouche !",es:'¡Ayuda, tengo arena en la boca!',it:'Aiuto, ho la sabbia in bocca!',pt:'Socorro, tenho areia na boca!'};
 function unlock(){if(!saved.sound||typeof window.AudioContext==='undefined'&&typeof window.webkitAudioContext==='undefined')return;try{context??=new(window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});}catch{}}
 async function prepare(level){if(level<51||!saved.sound||!context||ho)return;try{const response=await fetch('./assets/audio/ho-ho-ho-v6.wav');if(response.ok)ho=await context.decodeAudioData(await response.arrayBuffer());}catch{}}
 function stop(){token++;for(const s of sources)try{s.stop();}catch{}sources=[];if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();}
 function tone(f,dur,when=0){if(!context||context.state!=='running')return;const o=context.createOscillator(),g=context.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f,context.currentTime+when);g.gain.setValueAtTime(.025,context.currentTime+when);g.gain.exponentialRampToValueAtTime(.001,context.currentTime+when+dur);o.connect(g);g.connect(context.destination);o.start(context.currentTime+when);o.stop(context.currentTime+when+dur);sources.push(o);}
 function start(level){stop();if(!saved.sound)return;unlock();const ticket=token;
  if(level>50){prepare(level).then(()=>{if(ticket!==token||!state||state.level!==level||state.count<1||state.paused||!ho||!context)return;const source=context.createBufferSource(),gain=context.createGain();source.buffer=ho;gain.gain.value=.7;source.connect(gain);gain.connect(context.destination);source.start();sources.push(source);});}
  else if(level>20&&typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined'){const lang=(navigator.language||'nl').split('-')[0],phrase=sentences[lang]||sentences.nl,u=new SpeechSynthesisUtterance(phrase);u.lang=sentences[lang]?lang:'nl';u.rate=1.15;u.volume=.65;speechSynthesis.speak(u);}
  else{tone(500,.22);tone(170,.65,.22);tone(440,.15,.9);tone(140,.45,1.05);}
 }
 function caption(level){if(level>50)return 'Ho ho ho!';if(level<=20)return 'IAAAA!';const lang=typeof navigator!=='undefined'?(navigator.language||'nl').split('-')[0]:'nl';return sentences[lang]||sentences.nl;}
 function lights(phase){const el=$('#startLights');if(el){el.classList.remove('hidden');el.setAttribute('data-phase',String(phase));}}
 function go(){if(!saved.sound)return;stop();unlock();tone(196,.65);tone(294,.55,.03);tone(392,.5,.06);}
 return{unlock,prepare,start,stop,go,caption,lights,status:()=>({ready:!!ho,context:context?.state||'closed',duration:ho?.duration||0,active:sources.length})};
})();
