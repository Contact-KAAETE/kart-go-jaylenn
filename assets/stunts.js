/* V8 stunt course: suspension bridges, narrow bridges, tube tunnels, big jumps over water gaps
   and an animated looping. Green and sand worlds only (levels 1-50); the ice world keeps its own rules.
   Uses the existing road projection, ramp flight and water recovery; no new physics engine. */
'use strict';
const Stunts=(()=>{
 const LOOP_FROM=128,LOOP_LEN=12,GAP_LEN=6,NARROW=.62;
 // ---------- course layout ----------
 function boss(level){return level===20||level===50;}
 function extend(level,features){
  if(level>50)return features;
  for(const f of features){
   if(f.kind==='bridge'&&f.from>=190&&level>=12&&!boss(level))f.narrow=true;
  }
  if(level>=10&&!boss(level)){
   for(const ramp of features.filter(f=>f.kind==='ramp')){features.push({kind:'gap',from:ramp.to+1,to:ramp.to+GAP_LEN});}
  }
  if(level>=9&&!boss(level))features.push({kind:'loop',from:LOOP_FROM,to:LOOP_FROM+LOOP_LEN});
  return features;
 }
 const wrapSeg=d=>courseWrap(Math.floor(d/SEG),COUNT);
 function featureAt(s,seg){return s?.features?.find(f=>seg>=f.from&&seg<=f.to);}
 // Width factor of the drivable deck: narrow bridges taper in over three segments.
 function width(s,d){
  if(!s||s.ice)return 1;const seg=courseWrap(d/SEG,COUNT);
  for(const f of s.features)if(f.kind==='bridge'&&f.narrow&&seg>=f.from-3&&seg<=f.to+3){
   const t=Math.min(1,(seg-(f.from-3))/3,((f.to+3)-seg)/3);return 1-(1-NARROW)*smoothCourse(Math.max(0,t));
  }
  return 1;
 }
 // ---------- physics hooks ----------
 function racerSpeed(s,r){return r===s?s.speed:MAX*.7;}
 function update(s,dt){
  if(!s||s.ice||s.finished)return;
  for(const r of [s,...s.opponents]){
   if(r.recovery>0||r.rescue>0||r.safeFor>0||airborne(r))continue;
   const seg=wrapSeg(r.d),f=featureAt(s,seg);
   if(!f)continue;
   if(f.kind==='gap'&&!(r===s&&s.loopShow)){
    if(RaceAdventure.begin(s,r,'water')&&r===s)toast('PLONS! Te traag voor de sprong. Volgende keer meer gas!');
   }else if(f.kind==='bridge'&&f.narrow&&Math.abs(r.x)>NARROW+.07){
    if(r!==s&&!r.boss){r.x=clamp(r.x,-NARROW+.05,NARROW-.05);continue;}
    if(RaceAdventure.begin(s,r,'water')&&r===s)toast('PLONS! Van de smalle brug gevallen.');
   }
  }
  // Rivals steer to the middle before a narrow bridge so they do not fall off by surprise.
  for(const o of s.opponents){const ahead=wrapSeg(o.d+SEG*6),f=featureAt(s,ahead);if(f?.kind==='bridge'&&f.narrow)o.x=lerp(o.x,clamp(o.x,-.4,.4),Math.min(1,dt*2));}
  warn(s);
  loopUpdate(s,dt);
 }
 function warn(s){
  const seg=wrapSeg(s.d+SEG*14),f=featureAt(s,seg);if(!f)return;
  const key=f.kind+':'+f.from+':'+Math.floor(s.d/LENGTH);if(s.stuntWarned===key)return;
  const text=f.kind==='loop'?'🌀 Looping! Vol gas erin!':f.kind==='bridge'&&f.narrow?'⚠️ Smalle brug zonder reling! Blijf in het midden.':f.kind==='ramp'&&s.features.some(g=>g.kind==='gap'&&g.from===f.to+1)?'🚀 Schans over het water! Vol gas!':'';
  if(text){s.stuntWarned=key;toast(text);}
 }
 // ---------- looping ----------
 const LOOP_TIME=2.3;
 function loopUpdate(s,dt){
  if(s.loopShow){
   const L=s.loopShow;L.age+=dt;s.steer=0;s.x=lerp(s.x,0,Math.min(1,dt*6));
   if(L.ok)s.speed=Math.max(s.speed,MAX*.8);
   if(L.age>=LOOP_TIME){
    s.loopShow=null;
    if(!L.ok){s.d=Math.max(0,L.at-SEG*3);s.speed=0;s.safeFor=1.5;toast('Te langzaam! Neem een aanloop en probeer opnieuw.');}
    else{s.boost=Math.max(s.boost||0,1.5);toast('WOW! Looping gelukt! ⭐');}
   }
   return;
  }
  const f=s.features.find(g=>g.kind==='loop');if(!f||s.recovery>0||s.rescue>0)return;
  const prev=s.stuntPrevD??s.d;s.stuntPrevD=s.d;
  const lap=Math.floor(s.d/LENGTH),at=lap*LENGTH+f.from*SEG;
  if(prev<at&&s.d>=at){
   const ok=s.speed>=MAX*.42;s.loopShow={age:0,ok,at,car:carIndex(saved.player.kart)};
   if(typeof beep==='function'){beep(ok?520:200,.15,'triangle');setTimeout(()=>beep(ok?780:150,.2,'triangle'),260);}
  }
 }
 // ---------- drawing on the road ----------
 const shapeFill=(c,pts,fill)=>{c.fillStyle=fill;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 function tube(c,a,b){
  const A=a.fullW||a.w,B=b.fullW||b.w,alt=a.segIndex%2;
  const pts=(p,W,k)=>({x:p.x+k*W*1.12,y:p.y});
  // Inside the tube the ground beside the road is the dark tunnel wall, seen from close by.
  for(const side of [-1,1])shapeFill(c,[[a.x+side*A*1.12,a.y+1],[a.x+side*A*4,a.y+1],[b.x+side*B*4,b.y],[b.x+side*B*1.12,b.y]],alt?'#2c343c':'#283037');
  for(const side of [-1,1]){
   const a0=pts(a,A,side),b0=pts(b,B,side);
   // wall
   shapeFill(c,[[a0.x,a.y],[a0.x,a.y-A*.82],[b0.x,b.y-B*.82],[b0.x,b.y]],alt?'#3a434c':'#353d46');
   // roof slope
   shapeFill(c,[[a0.x,a.y-A*.82],[a.x+side*A*.55,a.y-A*1.18],[b.x+side*B*.55,b.y-B*1.18],[b0.x,b.y-B*.82]],alt?'#2b3138':'#272d33');
   // orange guide light strip on the wall
   shapeFill(c,[[a0.x,a.y-A*.3],[a0.x,a.y-A*.34],[b0.x,b.y-B*.34],[b0.x,b.y-B*.3]],a.segIndex%6<3?'#ff9b3d':'#c86a22');
  }
  shapeFill(c,[[a.x-A*.55,a.y-A*1.18],[a.x+A*.55,a.y-A*1.18],[b.x+B*.55,b.y-B*1.18],[b.x-B*.55,b.y-B*1.18]],alt?'#22272d':'#1f2429');
  if(a.segIndex%3===0&&A>3){
   const y=a.y-A*1.16,w=A*.32;c.save();c.globalAlpha=.9;shapeFill(c,[[a.x-w,y],[a.x+w,y],[b.x+w*B/A,b.y-B*1.16+(A-B)*.02],[b.x-w*B/A,b.y-B*1.16]],'#fff2b8');
   c.globalAlpha=.16;c.fillStyle='#ffe9a0';c.beginPath();c.ellipse(a.x,a.y-A*.2,A*.9,A*.18,0,0,7);c.fill();c.restore();
  }
  // darken the road surface inside the tube
  c.save();c.globalAlpha=.42;shapeFill(c,[[a.x-A*1.12,a.y+1],[a.x+A*1.12,a.y+1],[b.x+B*1.12,b.y],[b.x-B*1.12,b.y]],'#0b0f15');c.restore();
 }
 function cableHeight(s,f,seg,w){const t=(seg-f.from)/Math.max(1,f.to-f.from),u=2*t-1;return w*(.55+1.75*u*u);}
 function suspension(c,a,b,f,s){
  const A=a.fullW||a.w,B=b.fullW||b.w;
  for(const side of [-1,1]){
   const ax=a.x+side*A*1.14,bx=b.x+side*B*1.14,ha=cableHeight(s,f,a.segIndex,A),hb=cableHeight(s,f,a.segIndex+1,B);
   c.strokeStyle='#d3412f';c.lineWidth=Math.max(1,A*.03);c.beginPath();c.moveTo(ax,a.y-ha);c.lineTo(bx,b.y-hb);c.stroke();
   if(a.segIndex%2===0){c.strokeStyle='#f0e6d0';c.lineWidth=Math.max(1,A*.008);c.beginPath();c.moveTo(ax,a.y-A*.12);c.lineTo(ax,a.y-ha);c.stroke();}
  }
 }
 function narrowDeck(c,a,b){
  // Water on both sides of a narrow plank deck, a white danger edge and wooden planks.
  const A=a.fullW||a.w,B=b.fullW||b.w;
  for(const side of [-1,1]){
   shapeFill(c,[[a.x+side*a.w*1.02,a.y+1],[a.x+side*A*3,a.y+1],[b.x+side*B*3,b.y],[b.x+side*b.w*1.02,b.y]],a.segIndex%2?'#3f93b4':'#4fa4c2');
   shapeFill(c,[[a.x+side*a.w,a.y+1],[a.x+side*a.w*1.06,a.y+1],[b.x+side*b.w*1.06,b.y],[b.x+side*b.w,b.y]],a.segIndex%2?'#ffffff':'#e0463a');
   if(a.segIndex%3===0){c.strokeStyle='#d9fbffaa';c.lineWidth=Math.max(1,A*.006);c.beginPath();c.moveTo(a.x+side*A*1.3,a.y);c.lineTo(a.x+side*A*1.7,a.y);c.stroke();}
  }
  shapeFill(c,[[a.x-a.w,a.y+1],[a.x+a.w,a.y+1],[b.x+b.w,b.y],[b.x-b.w,b.y]],a.segIndex%2?'#a7814f':'#b58c58');
  c.strokeStyle='#6f5232';c.lineWidth=Math.max(1,a.w*.012);c.beginPath();c.moveTo(a.x-a.w,a.y);c.lineTo(a.x+a.w,a.y);c.stroke();
 }
 function ramp(c,a,b,f){
  const t=(a.segIndex-f.from)/Math.max(1,f.to-f.from),A=a.w,B=b.w,ha=A*.32*t,hb=B*.32*Math.min(1,t+1/(f.to-f.from));
  for(const side of [-1,1]){
   shapeFill(c,[[a.x+side*A*.98,a.y],[a.x+side*A*.98,a.y+ha],[b.x+side*B*.98,b.y+hb],[b.x+side*B*.98,b.y]],a.segIndex%2?'#d9382c':'#f3f1e6');
  }
 }
 function gap(c,a,b,f){
  const A=a.fullW||a.w,B=b.fullW||b.w;
  shapeFill(c,[[a.x-A*1.6,a.y+1],[a.x+A*1.6,a.y+1],[b.x+B*1.6,b.y],[b.x-B*1.6,b.y]],a.segIndex%2?'#2f86ad':'#3a95bb');
  if(a.segIndex%2===0){c.strokeStyle='#d9fbffbb';c.lineWidth=Math.max(1,A*.01);for(const x of [-.6,.1,.7]){c.beginPath();c.moveTo(a.x+A*(x-.15),a.y);c.lineTo(a.x+A*(x+.15),a.y);c.stroke();}}
  if(a.segIndex===f.to){shapeFill(c,[[b.x-B*1.05,b.y],[b.x+B*1.05,b.y],[b.x+B*1.05,b.y+B*.16],[b.x-B*1.05,b.y+B*.16]],'#5b4635');}
 }
 // Returns true when this module fully drew the furniture for the segment.
 function furniture(c,a,b,terrain){
  const s=state;if(!s||s.ice)return false;const f=featureAt(s,a.segIndex);
  if(terrain==='tunnel'){tube(c,a,b);return true;}
  if(terrain==='gap'&&f){gap(c,a,b,f);return true;}
  if(terrain==='ramp'&&f){ramp(c,a,b,f);return false;}
  if(terrain==='bridge'&&f){if(f.narrow){narrowDeck(c,a,b);return true;}suspension(c,a,b,f,s);return false;}
  return false;
 }
 // ---------- sprites: bridge towers and the loop arch ----------
 let lastProjection=[];
 function sprites(s,projection,list){
  lastProjection=projection;if(s.ice)return;
  for(const f of s.features){
   if(f.kind==='bridge'&&!f.narrow)for(const seg of [f.from+1,f.to-1]){const p=projection.find(q=>q.segIndex===seg);if(p&&p.y<H*1.3)for(const side of [-1,1])list.push({p,x:side*1.22,stunt:'tower',side});}
   if(f.kind==='bridge'&&f.narrow){const p=projection.find(q=>q.segIndex===f.from-2);if(p)list.push({p,x:1.35,stunt:'sign',text:'SMAL'});}
   if(f.kind==='loop'){const p=projection.find(q=>q.segIndex===f.from+4);if(p&&p.y<H*1.4)list.push({p,x:0,stunt:'loop'});}
   if(f.kind==='gap'){const p=projection.find(q=>q.segIndex===f.from-10);if(p)list.push({p,x:-1.35,stunt:'sign',text:'SPRING!'});}
  }
 }
 function drawSprite(c,v,x,y,k,s){
  const p=v.p,w=p.fullW||p.w;if(w<2)return;
  if(v.stunt==='tower'){
   const h=w*2.6,tw=Math.max(2,w*.12);c.fillStyle='#c8382a';c.fillRect(x-tw/2,y-h,tw,h);c.fillStyle='#e4574a';c.fillRect(x-tw/2,y-h,tw*.35,h);
   if(v.side<0){c.fillStyle='#b23024';c.fillRect(x,y-h*.78,w*2.44,Math.max(2,w*.07));c.fillRect(x,y-h*.98,w*2.44,Math.max(2,w*.05));}
   c.fillStyle='#ffd25a';c.beginPath();c.arc(x,y-h-tw*.3,tw*.45,0,7);c.fill();return;
  }
  if(v.stunt==='sign'){
   const sw=w*.62,sh=w*.24,top=y-w*.7;c.fillStyle='#4b5965';c.fillRect(x-2,top,4,w*.7);
   c.fillStyle='#ffd04e';c.strokeStyle='#2b2b2b';c.lineWidth=Math.max(1,w*.02);c.beginPath();c.roundRect(x-sw/2,top-sh,sw,sh,sh*.2);c.fill();c.stroke();
   c.fillStyle='#2b2b2b';c.font=`900 ${Math.max(6,sh*.62)}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(v.text,x,top-sh/2);return;
  }
  if(v.stunt==='loop'){
   const r=w*1.35,cy=y-r,band=w*.42,t=performance.now()/1000;
   c.save();
   // supports
   c.fillStyle='#5a6770';for(const side of [-1,1])c.fillRect(x+side*r*1.05-w*.05,cy,w*.1,r);
   // track ring with rumble edges
   c.lineWidth=band;c.strokeStyle='#59666e';c.beginPath();c.arc(x,cy,r,Math.PI*.62,Math.PI*2.38);c.stroke();
   for(const edge of [-1,1]){c.lineWidth=Math.max(1,band*.12);c.setLineDash([band*.5,band*.5]);c.lineDashOffset=-t*band*3;c.strokeStyle=edge<0?'#ffffff':'#e0463a';c.beginPath();c.arc(x,cy,r+edge*band*.44,Math.PI*.62,Math.PI*2.38);c.stroke();}
   c.setLineDash([]);
   // banner
   const bw=r*1.1,bh=w*.32,by=cy-r-band*.5-bh*1.3;
   const g=c.createLinearGradient(x-bw/2,0,x+bw/2,0);g.addColorStop(0,'#ff8a1f');g.addColorStop(.5,'#ffd34a');g.addColorStop(1,'#ff8a1f');
   c.fillStyle=g;c.beginPath();c.roundRect(x-bw/2,by,bw,bh,bh*.3);c.fill();
   c.fillStyle='#3a1e08';c.font=`900 ${Math.max(7,bh*.68)}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('LOOPING',x,by+bh/2);
   c.restore();
  }
 }
 // ---------- full-screen overlays ----------
 const sideCache={};
 function sideImage(i){if(i<0)return null;const name='car'+i+'Side';if(!GFX.image(name)&&!sideCache[i]){sideCache[i]=1;GFX.load(name).catch(()=>{});}return GFX.image(name);}
 function tunnelGlow(c,s){
  const seg=courseWrap(s.d/SEG,COUNT),f=featureAt(s,Math.floor(seg));if(f?.kind!=='tunnel')return;
  const inside=Math.max(0,Math.min(1,(seg-f.from)/2,(f.to+1-seg)/2));
  // The walls and ceiling converge on the tunnel exit, so the open road beyond it stays uncovered.
  const exit=lastProjection.find(q=>q.segIndex===f.to),ew=exit?(exit.fullW||exit.w)*1.12:W*.1,ex=exit?exit.x:W/2,ey=exit?exit.y:(view.horizon||H*.34),top=ey-ew*1.05;
  c.save();c.globalAlpha=inside;
  const shade=(x0)=>{const g=c.createLinearGradient(x0,0,ex,0);g.addColorStop(0,'#12161b');g.addColorStop(1,'#2d353d');return g;};
  c.fillStyle=shade(0);c.beginPath();c.moveTo(0,0);c.lineTo(ex-ew,top);c.lineTo(ex-ew,ey);c.lineTo(0,ey+(H-ey)*.12);c.closePath();c.fill();
  c.fillStyle=shade(W);c.beginPath();c.moveTo(W,0);c.lineTo(ex+ew,top);c.lineTo(ex+ew,ey);c.lineTo(W,ey+(H-ey)*.12);c.closePath();c.fill();
  c.fillStyle='#1b2025';c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(ex+ew,top);c.lineTo(ex-ew,top);c.closePath();c.fill();
  c.strokeStyle='#ff9b3d';c.lineWidth=Math.max(2,W*.007);for(const side of [-1,1]){c.beginPath();c.moveTo(ex+side*ew,ey-ew*.35);c.lineTo(side<0?0:W,ey+(H-ey)*.12-(H*.12));c.stroke();}
  for(let i=0;i<7;i++){const t=((i/7)+(s.d/1400))%1,e=t*t,y=top-e*top,w=ew*.5+e*W*.3,h=Math.max(2,H*(.004+e*.03));c.globalAlpha=inside*(.35+e*.65);c.fillStyle='#fff3c4';c.fillRect(ex+(W/2-ex)*e-w/2,y-h/2,w,h);}
  c.restore();
  const g=c.createRadialGradient(W/2,H*.62,H*.08,W/2,H*.55,Math.max(W,H)*.75);g.addColorStop(0,'rgba(255,240,190,0)');g.addColorStop(.55,'rgba(5,8,14,.18)');g.addColorStop(1,'rgba(5,8,14,.72)');
  c.fillStyle=g;c.fillRect(0,0,W,H);
 }
 function loopScene(c,s){
  const L=s.loopShow;if(!L)return;const u=Math.min(1,L.age/LOOP_TIME);
  const cx=W/2,cy=H*.52,R=Math.min(W*.36,H*.24),band=R*.2,ground=cy+R+band*.5;
  c.save();
  // sky, hills and ground of the current world
  const sky=c.createLinearGradient(0,0,0,ground);sky.addColorStop(0,s.sand?'#f6b46b':'#4aa8ef');sky.addColorStop(1,s.sand?'#fde3b0':'#bfe7ff');c.fillStyle=sky;c.fillRect(0,0,W,H);
  c.fillStyle=s.sand?'#e2a35d':'#7fbf5c';for(let i=0;i<5;i++){c.beginPath();c.ellipse((i+.5)*W/4-(L.age*40)%(W/4),ground,W*.22,H*.1,0,Math.PI,0);c.fill();}
  c.fillStyle=s.sand?'#d9a865':'#5f9f45';c.fillRect(0,ground,W,H-ground);
  // road and loop
  c.fillStyle='#59666e';c.fillRect(0,ground-band*.5,W,band);
  c.lineWidth=band;c.strokeStyle='#59666e';c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.stroke();
  c.lineWidth=Math.max(2,band*.14);c.setLineDash([band*.6,band*.6]);
  for(const [rad,col] of [[R+band*.43,'#ffffff'],[R-band*.43,'#e0463a']]){c.strokeStyle=col;c.beginPath();c.arc(cx,cy,rad,0,Math.PI*2);c.stroke();}
  c.setLineDash([]);c.fillStyle='#4b565e';for(const side of [-1,1])c.fillRect(cx+side*R*.75-band*.25,cy+R*.6,band*.5,ground-cy-R*.6);
  // car position along approach, loop and exit
  let px,py,ang,phi=0;const carW=R*.95;
  const fail=!L.ok;
  if(u<.2){const t=u/.2;px=-carW+t*(cx+carW);py=ground-band*.5;ang=0;}
  else if(u<.8){const t=(u-.2)/.6;phi=fail?(t<.5?t*2*Math.PI*.85:Math.PI*.85*(1-(t-.5)*2)):t*Math.PI*2;px=cx+R*Math.sin(phi);py=cy+R*Math.cos(phi)-band*.5*Math.cos(phi);ang=-phi;}
  else{const t=(u-.8)/.2;px=cx+t*(W-cx+carW);py=ground-band*.5;ang=0;if(fail){px=cx-t*W*.15;}}
  // speed trail along the loop
  if(u>.2&&u<.8&&!fail){c.lineWidth=band*.5;c.lineCap='round';const g=c.createLinearGradient(cx-R,cy,cx+R,cy);g.addColorStop(0,'rgba(255,220,90,.0)');g.addColorStop(1,'rgba(255,220,90,.75)');c.strokeStyle=g;c.beginPath();c.arc(cx,cy,R-band*.1,Math.PI/2-phi+.9,Math.PI/2-phi,true);c.stroke();}
  const im=sideImage(L.car>=0?L.car:-1);
  c.save();c.translate(px,py);c.rotate(ang+(fail&&u>.5&&u<.8?Math.sin(L.age*20)*.4:0));
  if(im){const h=carW*im.naturalHeight/im.naturalWidth;c.scale(-1,1);c.drawImage(im,-carW/2,-h,carW,h);}
  else{const kart=GFX.tile('karts',3,2,3);if(kart){c.scale(-1,1);c.drawImage(kart,-carW*.36,-carW*.66,carW*.72,carW*.72);}else{c.fillStyle='#f56a48';c.fillRect(-carW*.3,-carW*.25,carW*.6,carW*.25);}}
  c.restore();
  // speed lines and banner
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;for(let i=0;i<10;i++){const yy=(i*97+L.age*900)%H,xx=(i*173)%W;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-W*.18,yy);c.stroke();}
  const pop=Math.min(1,L.age*4),txt=fail?(u>.5?'TE LANGZAAM!':'LOOPING!'):(u>.85?'GELUKT!':'LOOPING!');
  c.globalAlpha=pop;c.font=`900 ${Math.round(Math.min(W,H)*.11)}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';
  c.lineWidth=8;c.strokeStyle='#1d2a3a';c.strokeText(txt,cx,H*.25);c.fillStyle=fail&&u>.5?'#ff8a7a':'#ffd34a';c.fillText(txt,cx,H*.25);
  // white flash on entry and exit
  const flash=Math.max(0,1-L.age*6,1-(LOOP_TIME-L.age)*6);if(flash>0){c.globalAlpha=flash;c.fillStyle='#fff';c.fillRect(0,0,W,H);}
  c.restore();
 }
 function overlay(c,s){if(!s||s.ice)return;tunnelGlow(c,s);loopScene(c,s);}
 return{extend,width,update,furniture,sprites,drawSprite,overlay,featureAt,LOOP_FROM,NARROW};
})();
