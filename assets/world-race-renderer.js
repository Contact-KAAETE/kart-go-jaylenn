/* Original Blender chicken mounts + existing Kart Go raster drivers and scenery. */
'use strict';
const WorldRace=(()=>{
 const courses=new Map();let slowFrames=0;const images=new Map(),names=['Kuifkop','Professor Tok','Disco Tok'];let ready=false;
 function load(){return Promise.all([Promise.all(['fairground','train'].map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images.set(name,im);resolve();};im.onerror=reject;im.src='./assets/graphics/chickens/party-'+name+'.webp?v=worlds3.1';}))),Promise.all(['characters','charactersExtra','karts','landscapes','scenery','winter','iceprops','effects','terrain','bosses','dogRear','burger','familyFront','familyRear'].map(GFX.load)),...Array.from({length:3},(_,i)=>['rear','card'].map(v=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images.set(i+'-'+v,im);resolve();};im.onerror=reject;im.src='./assets/graphics/chickens/chicken-'+i+'-'+v+'.webp?v=worlds3.1';}))).flat(),new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images.set('cat',im);resolve();};im.onerror=reject;im.src='./assets/graphics/chickens/party-cat.webp?v=worlds3.1';})]).then(()=>ready=true);}
 function chicken(c,x,y,k,index,avatar,front=false,time=0,jump=0){const im=images.get((index||0)+'-'+(front?'card':'rear'));if(!im)return false;c.save();c.translate(x,y-jump);c.rotate(Math.sin(time*9+index)*.018);c.shadowColor='#02041499';c.shadowBlur=12*k;c.drawImage(im,-91*k,-204*k,182*k,228*k);c.shadowBlur=0;
  const rider=avatar===undefined?null:GFX.driverSprite(avatar, !front);if(rider){c.fillStyle='#163a72';for(const side of [-1,1]){c.beginPath();c.ellipse(side*28*k,-57*k,8*k,19*k,side*.2,0,7);c.fill();}c.drawImage(rider,-34*k,-130*k,68*k,68*k);}c.restore();return true;}
 function preview(c,w,h,p,party=false){c.clearRect(0,0,w,h);const k=Math.min(w/320,h/230);if(party)return chicken(c,w/2,h*.93,k,p.chicken,AVATARS[p.avatar],true,performance.now()/1000);const family=GFX.familyIndex(AVATARS[p.avatar])>=0,scale=family?Math.min(w/190,h/174):k*1.5;return GFX.drawKart(c,w/2,h*.94-(family?16*scale:0),scale,p.color,false,0,{avatar:AVATARS[p.avatar]},4);}
 const poly=(c,pts,fill)=>{c.fillStyle=fill;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 // One camera model for the player, rivals, collectibles and ground contact.
 function view(w,h,level,me,time=0){const K=globalThis.KartWorlds,world=K.world(level),horizon=h*.32,anchor=h*.86,distance=world===4?420:520,geo=K.geometry(level,me.d),unit=Math.min(w/420,h/570);
  // Integrate the actual bend over the view distance. A curvature difference alone
  // made most multiplayer roads appear straight even while their physics turned.
  const bend=[{d:0,heading:0,offset:0}],step=distance/32;
  for(let i=1;i<=32;i++){const prev=bend[i-1],curve=K.geometry(level,me.d+(i-.5)*step).curve;const heading=prev.heading+curve*step;bend.push({d:i*step,heading,offset:prev.offset+(prev.heading+heading)*.5*step});}
  const project=d=>{const delta=Math.max(0,Math.min(distance,d-me.d)),index=Math.min(31,Math.floor(delta/step)),part=(delta-bend[index].d)/step,offset=bend[index].offset+(bend[index+1].offset-bend[index].offset)*part;const t=Math.max(0,1-(d-me.d)/distance),q=t*t,g=K.geometry(level,d),wave=(level===74||level===75)&&me.d>1000?Math.sin(d/95+time)*w*.025*(1-Math.min(1,q)):0;
   return{x:w/2+offset*w/80000*(.08+.92*Math.min(1,q))-me.x*w*.025*Math.min(1,q)+wave,y:horizon+q*(anchor-horizon)-(g.height-geo.height)*h*.009*Math.sin(Math.min(1,q)*Math.PI),half:w*(.025+.48*q)*g.width,q,g};};
  const scale=d=>{const q=project(d).q;return(.15+.85*q)*unit;};
  const racer=p=>{const q=project(p.d);return{x:q.x+p.x*q.half*.8,y:q.y,k:scale(p.d)};};return{project,scale,racer,distance,behind:42};
 }
 function trainPose(level,time){if(level!==72&&level!==75)return null;return{d:100+(Math.max(0,time)*28)%(globalThis.KartWorlds.length(level)-180),x:-1.65};}
 function draw(c,w,h,s,myId,inputSteer=0){const renderStart=performance.now();const me=s.players.find(p=>p.id===myId);if(!me)return;const K=globalThis.KartWorlds,selection=s.selection||K.selection(),level=selection.level,world=K.world(level),time=s.elapsed||0,unit=Math.min(w/420,h/570),horizon=h*.32,viewDistance=world===4?420:520;
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,world===4?'#060c35':world===3?'#375a99':'#73b9d7');sky.addColorStop(1,world===4?'#431c77':world===2?'#d8a568':world===3?'#ccebf5':'#73ab4d');c.fillStyle=sky;c.fillRect(0,0,w,h);
  if(world===1||world===2)GFX.landscape(c,w,h,{sand:world===2,ice:false,d:me.d*25,x:me.x,time});
  if(world===3){const im=GFX.image('winter');if(im)c.drawImage(im,0,0,im.naturalWidth,im.naturalHeight,0,0,w,h*.45);for(let i=0;i<34;i++){c.fillStyle='#fff9';c.beginPath();c.arc((i*117+time*13)%w,(i*61+time*27)%(h*.7),1+i%3,0,7);c.fill();}}
  if(world===4){
   const background=images.get('fairground');if(background){const bh=h*.62,scale=Math.max(w/background.width,bh/background.height);c.drawImage(background,(w-background.width*scale)/2+Math.sin(me.d/1700)*8*unit,bh-background.height*scale,background.width*scale,background.height*scale);}
   for(let i=0;i<34;i++){const x=(i*117.9+time*5)%w,y=(i*43.1)%(h*.27);c.fillStyle=['#ffe18b','#8edfff','#eb97ed'][i%3];c.globalAlpha=.4+Math.sin(time+i)*.25;c.fillRect(x,y,2*unit,2*unit);}c.globalAlpha=1;
  }
  const camera=view(w,h,level,me,time),project=camera.project;
  const rodeo=level===74||level===75;
  const slices=slowFrames>90?28:48;for(let i=slices-1;i>=0;i--){const from=me.d-camera.behind,span=viewDistance+camera.behind,far=project(from+(i+1)/slices*span),near=project(from+i/slices*span);const party=world===4;
   poly(c,[[near.x-near.half*5,near.y+2],[near.x+near.half*5,near.y+2],[far.x+far.half*5,far.y],[far.x-far.half*5,far.y]],world===4?(i%2?'#221a46':'#282049'):world===3?(i%2?'#d4e8ef':'#c7e0eb'):world===2?(i%2?'#dcb67b':'#d2a870'):(i%2?'#609a46':'#659f49'));
   poly(c,[[near.x-near.half,near.y],[near.x+near.half,near.y],[far.x+far.half,far.y],[far.x-far.half,far.y]],world===2?(i%2?'#ba8d5e':'#bf9467'):world===3?(i%2?'#9fc7e2':'#afd9ec'):party?(i%2?'#292a52':'#242844'):(i%2?'#4c5660':'#46525b'));
   if(rodeo){for(let lane=0;lane<3;lane++){const offset=(lane-1)*.62,removed=s.event?.cat&&time>s.event.catAt+2.5&&Math.abs(offset-s.event.removedLane)<.2;const a=near.x+offset*near.half*.8,b=far.x+offset*far.half*.8;
     poly(c,[[a-near.half*.28,near.y],[a+near.half*.28,near.y],[b+far.half*.28,far.y],[b-far.half*.28,far.y]],removed?'#0a0e26':lane===0?(i%3===0?'#fff1c8':'#decaa0'):lane===1?(i%3===0?'#e4b979':'#be874e'):(i%3===0?'#d8b3eb':'#ab86ce'));if(!removed&&near.q>.15){c.strokeStyle='#fff4cb77';c.lineWidth=2*unit;c.beginPath();c.moveTo(a-near.half*.24,near.y);c.quadraticCurveTo(a,near.y+9*unit,a+near.half*.24,near.y);c.stroke();}}}
   for(const side of [-1,1]){c.strokeStyle=party?(side<0?'#53ecff':'#ef78ff'):i%2?'#fff2d8':'#e97565';c.lineWidth=(1+near.q*6)*unit;c.beginPath();c.moveTo(near.x+side*near.half,near.y);c.lineTo(far.x+side*far.half,far.y);c.stroke();if(['bridge','palace'].includes(near.g.feature)){c.strokeStyle=world===3?'#d0f6ff':'#bc9f70';c.lineWidth=(2+near.q*5)*unit;c.beginPath();c.moveTo(near.x+side*near.half,near.y-20*near.q*unit);c.lineTo(far.x+side*far.half,far.y-20*far.q*unit);c.stroke();}}
   if(i%4<2&&!rodeo){c.strokeStyle=world===3?'#e8ffffbb':'#fcf1cc88';c.lineWidth=(1+near.q*4)*unit;c.beginPath();c.moveTo(near.x,near.y);c.lineTo(far.x,far.y);c.stroke();}
  }
  // Scenery reuses the existing illustrated atlas, rather than flat new emoji props.
  for(let i=17;i>=0;i--){const d=Math.floor(me.d/38)*38+i*38+20,p=project(d);if(d<=me.d||d-me.d>viewDistance)continue;const k=(.05+p.q*.32)*unit;for(const side of [-1,1]){if(world===4){c.strokeStyle=side<0?'#65e6ff':'#fd77e2';c.lineWidth=3*k;c.beginPath();c.moveTo(p.x+side*p.half*1.15,p.y);c.lineTo(p.x+side*p.half*1.15,p.y-100*k);c.stroke();GFX.effect(c,7,p.x+side*p.half*1.15,p.y-108*k,25*k);continue;}let index=world===2?(i%3?9:10):world===3?null:i%7===0?4:i%5===0?3:i%3;const im=index===null?GFX.tile('iceprops',3,3,i%3):GFX.tile('scenery',4,3,index);if(im)c.drawImage(im,p.x+side*p.half*1.24-140*k,p.y-260*k,280*k,280*k);}}
  if(world===4){const zone=level===73||level===75?['WERKBANK','PIZZERIA','BURGER-ZONE','VUURZONE'][Math.min(3,Math.floor(me.d/K.length(level)*4))]:'PARTY-WERELD';c.save();c.textAlign='center';c.font='900 '+Math.round(18*unit)+'px system-ui';c.shadowBlur=15;c.shadowColor='#ff7df2';c.fillStyle='#ffe798';c.fillText(zone,w*.5,h*.13);c.restore();}
  const courseKey=level+':'+s.seed;if(!courses.has(courseKey)){if(courses.size>8)courses.clear();courses.set(courseKey,K.layout(selection,s.seed||1));}const objects=courses.get(courseKey),claimed=s.claimed||[];
  for(const o of objects.filter(o=>o.d>me.d-4&&o.d-me.d<viewDistance&&!claimed.includes(o.id)).sort((a,b)=>b.d-a.d)){const p=project(o.d),ox=o.x+(['pizza','person','meteor'].includes(o.type)?Math.sin(time*(o.type==='person'?1.8:2.6)+o.id)*.17:0),x=p.x+ox*p.half*.8,y=p.y,k=(.13+p.q*.8)*unit;prop(c,o.type,x,y,k,time,o.fullWidth?p.half*.94:0);}
  for(const section of K.stunts(level)){const d=section.at+42;if(d<me.d||d>me.d+viewDistance)continue;const p=project(d),k=camera.scale(d)*.8,x=p.x-section.dir*p.half*1.15,y=p.y-65*k;c.save();c.fillStyle='#293447';c.fillRect(x-3*k,y,6*k,65*k);c.fillStyle='#ffce45';c.strokeStyle='#3c2c1e';c.lineWidth=3*k;c.fillRect(x-27*k,y-27*k,54*k,43*k);c.strokeRect(x-27*k,y-27*k,54*k,43*k);c.strokeStyle='#243044';c.lineWidth=6*k;c.beginPath();for(const dx of [-12,10]){c.moveTo(x+(dx-section.dir*6)*k,y-17*k);c.lineTo(x+(dx+section.dir*5)*k,y-6*k);c.lineTo(x+(dx-section.dir*6)*k,y+5*k);}c.stroke();c.restore();}
  const railTrain=trainPose(level,time);
  if(railTrain){
   for(let i=23;i>=0;i--){const a=project(me.d-camera.behind+i/24*(viewDistance+camera.behind)),b=project(me.d-camera.behind+(i+1)/24*(viewDistance+camera.behind));
    const ax=a.x+railTrain.x*a.half*.8,bx=b.x+railTrain.x*b.half*.8;
    poly(c,[[ax-a.half*.31,a.y],[ax+a.half*.31,a.y],[bx+b.half*.31,b.y],[bx-b.half*.31,b.y]],i%2?'#635c78':'#756c86');
    c.strokeStyle='#a78b72';c.lineWidth=Math.max(1,4*a.q*unit);c.beginPath();c.moveTo(ax-a.half*.24,a.y);c.lineTo(ax+a.half*.24,a.y);c.stroke();
    for(const side of [-1,1]){c.strokeStyle='#d3def4';c.lineWidth=Math.max(1,2*a.q*unit);c.beginPath();c.moveTo(ax+side*a.half*.12,a.y);c.lineTo(bx+side*b.half*.12,b.y);c.stroke();}
   }
   const delta=railTrain.d-me.d,train=images.get('train');if(train&&delta>-35&&delta<viewDistance){const p=project(railTrain.d),k=camera.scale(railTrain.d),tw=220*k,th=tw*317/724,x=p.x+railTrain.x*p.half*.8;
    c.save();c.fillStyle='#090d2f88';c.beginPath();c.ellipse(x,p.y,tw*.42,7*k,0,0,7);c.fill();c.drawImage(train,161,97,724,317,x-tw/2,p.y-th,tw,th);c.restore();}
  }
  for(const b of s.bananas||[]){if(b.d>me.d&&b.d-me.d<viewDistance){const p=project(b.d);GFX.effect(c,4,p.x+b.x*p.half*.8,p.y,35*unit*p.q);}}
  for(const hole of s.holes||[]){if(hole.d>me.d&&hole.d-me.d<viewDistance){const p=project(hole.d);c.fillStyle=time<hole.open?'#183852aa':'#113b79';c.beginPath();c.ellipse(p.x+hole.x*p.half*.8,p.y,28*p.q*unit,10*p.q*unit,0,0,7);c.fill();}}
  for(const b of s.shots||[]){if(b.d>me.d&&b.d-me.d<viewDistance){const p=project(b.d);const x=p.x+b.x*p.half*.8,y=p.y-15*unit*p.q,size=(12+25*p.q)*unit;c.save();c.shadowBlur=18*unit;c.shadowColor=b.kind==='storm'?'#ffd749':b.kind==='hyp'?'#cf72ff':'#8aeaff';GFX.effect(c,b.kind==='storm'?2:b.kind==='hyp'?6:5,x,y,size,size,.95);c.strokeStyle=c.shadowColor;c.lineWidth=3*unit;for(let ring=0;ring<2;ring++){c.beginPath();c.ellipse(x,y,size*(.5+ring*.25),size*(.3+ring*.2),time*4,0,7);c.stroke();}c.restore();}}
  if(rodeo){for(let lane=0;lane<3;lane++){const x=(lane-1)*.62,catGone=s.event?.cat&&Math.abs(x-s.event.removedLane)<.2;if(catGone&&time>s.event.catAt+2.5)continue;const p=project(me.d+200),lift=catGone?Math.min(1,(time-s.event.catAt)/2.5):0;c.save();c.globalAlpha=1-lift;c.translate(lift*w*.17,-lift*h*.32);chicken(c,p.x+x*p.half*.8,p.y,(1-lift)*.7*unit,lane,undefined,false,time);c.restore();}}
  // All racers, including the player, share size, depth ordering and road coordinates.
  for(const p of [...s.players,...(s.npcs||[])].filter(p=>p.id===myId||(p.d>me.d-20&&p.d-me.d<viewDistance)).sort((a,b)=>b.d-a.d)){
   const q=camera.racer(p),own=p.id===myId;drawRacer(c,q.x,q.y,q.k,own?{...p,steer:inputSteer}:p,world,time,own);
   if(!own&&p.name){c.fillStyle='#fff';c.textAlign='center';c.font='700 '+Math.max(10,13*q.k)+'px system-ui';c.fillText(p.name,q.x,q.y-150*q.k);}
  }
  if(rodeo&&s.event?.d>2700){const cat=images.get('cat');if(cat){const swipe=s.event.cat?Math.min(1,(time-s.event.catAt)/2.5):0;const size=w*(.7+swipe*.35);c.save();c.globalAlpha=.9;c.translate(w*.60,h*.20+Math.sin(time)*3*unit);c.rotate(Math.sin(time*2)*.025);c.drawImage(cat,-size/2,-size*.48,size,size);c.restore();}}
  slowFrames=Math.max(0,Math.min(150,slowFrames+(performance.now()-renderStart>21?2:-.3)));
 }
 function drawRacer(c,x,y,k,p,world,time,own){const progress=1-Math.min(1,(p.jump||0)/(p.jumpDuration||1.4)),jump=(p.jump||0)>0?Math.sin(Math.PI*progress)*55*k*(p.jumpLift||1):0;c.save();c.fillStyle='#0a122a55';c.beginPath();c.ellipse(x,y+4*k,(42-Math.min(22,jump/5))*k,8*k,0,0,7);c.fill();c.translate(x,y-jump);if(jump>0)c.rotate(Math.sin(progress*Math.PI*2)*.09);if(world===4)c.rotate((p.steer||0)*.07);if(p.spin>0)c.rotate(time*12);if(p.penalty>0)c.rotate(Math.sin(time*8)*.12);
  if(world===4)chicken(c,0,0,k,p.chicken,AVATARS[p.avatar]||AVATARS[0],false,time);else GFX.drawKart(c,0,0,k,p.color===undefined?'#579be4':typeof p.color==='string'?p.color:Object.keys(PAINT_NAMES)[p.color],p.boss===20?true:p.boss===50?'pizza':p.boss===70?'burger':false,p.steer||0,{avatar:AVATARS[p.avatar]||AVATARS[0]});
  if(p.boost>0)GFX.effect(c,3,0,10*k,75*k,100*k,.8);if(p.freeze>0)GFX.effect(c,5,0,-60*k,110*k,110*k,.65);if(p.hyp>0)for(let i=0;i<5;i++)GFX.effect(c,2,Math.sin(time*3+i)*50*k,-70*k+Math.cos(time*4+i)*35*k,25*k,25*k,.65);if(p.splash>0)GFX.effect(c,8,0,0,130*k,90*k,.9);c.restore();
 }
 function prop(c,type,x,y,k,time,span=0){c.save();c.translate(x,y);if(type==='block'){GFX.effect(c,0,0,-18*k,53*k);c.restore();return;}if(type==='star'){GFX.effect(c,7,0,-16*k,40*k);c.restore();return;}if(type==='fire'){GFX.effect(c,9,0,-15*k,65*k);c.restore();return;}if(type==='ramp'){const half=span||42*k;poly(c,[[-half,0],[half,0],[half*.8,-30*k],[-half*.8,-30*k]],'#ffc65d');poly(c,[[-half,0],[half,0],[half,8*k],[-half,8*k]],'#bd6b25');c.strokeStyle='#fff1a4';c.lineWidth=3*k;c.beginPath();c.moveTo(-17*k,-8*k);c.lineTo(0,-22*k);c.lineTo(17*k,-8*k);c.stroke();c.restore();return;}
  if(type==='water'){const gr=c.createRadialGradient(0,0,1,0,0,40*k);gr.addColorStop(0,'#0b5ba8');gr.addColorStop(1,'#96e5ef');c.fillStyle=gr;c.beginPath();c.ellipse(0,0,45*k,15*k,0,0,7);c.fill();c.restore();return;}
  if(type==='spike'||type==='icicle'){poly(c,[[-20*k,0],[0,-65*k],[22*k,0]],'#c6f4ff');poly(c,[[0,-65*k],[4*k,0],[22*k,0]],'#5bb1d4');c.restore();return;}
  if(type==='pizza'){c.fillStyle='#dca85c';c.beginPath();c.ellipse(0,-5*k,36*k,14*k,0,0,7);c.fill();c.fillStyle='#ffe083';c.beginPath();c.ellipse(0,-8*k,31*k,11*k,0,0,7);c.fill();for(let i=0;i<5;i++){c.fillStyle='#bd3f38';c.beginPath();c.arc(Math.sin(i*2)*21*k,-9*k+Math.cos(i)*6*k,5*k,0,7);c.fill();}c.restore();return;}
  if(type==='meteor'){c.shadowColor='#ffae48';c.shadowBlur=22*k;c.fillStyle='#4e4562';c.beginPath();c.arc(0,-22*k,25*k,0,7);c.fill();c.strokeStyle='#ff9b40';c.lineWidth=8*k;c.beginPath();c.moveTo(0,-42*k);c.lineTo(30*k,-85*k);c.stroke();c.restore();return;}
  if(type==='person'){const driver=GFX.driverSprite(AVATARS[Math.floor(x)%12]||AVATARS[0]);if(driver)c.drawImage(driver,-21*k,-60*k,42*k,56*k);c.restore();return;}
  const grad=c.createLinearGradient(-30*k,0,30*k,0);grad.addColorStop(0,type==='tool'?'#b4c8d5':'#ffcf4c');grad.addColorStop(1,type==='tool'?'#4e6d81':'#e99a37');c.fillStyle=grad;c.fillRect(-35*k,-40*k,70*k,27*k);for(let i=-2;i<3;i++)poly(c,[[i*18*k,-40*k],[(i*18+9)*k,-40*k],[(i*18-4)*k,-13*k],[(i*18-13)*k,-13*k]],'#162637');c.fillStyle='#1b233c';c.fillRect(-28*k,-13*k,6*k,17*k);c.fillRect(22*k,-13*k,6*k,17*k);c.restore();
 }
 return{load,preview,draw,chicken,names,view,trainPose,ready:()=>ready};
})();
