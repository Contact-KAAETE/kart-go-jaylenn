/* V9 combat: weapon crates with Raket, Bom and Duwschild, explosions that blow racers aside,
   real side-to-side bumping and rivals that fight back. Levels 1-50 except the boss levels.
   Jaylenn's own power-up blocks and their odds stay unchanged; weapons come from separate crates. */
'use strict';
const Combat=(()=>{
 const ROCKET=6,BOMB=7,SHIELD=8,ITEMS=[ROCKET,BOMB,SHIELD];
 const NAMES={6:'Raket',7:'Bom',8:'Duwschild'},ICONS={6:'🎯',7:'💣',8:'🛡️'};
 const CRATE_SEGS=[30,60,92,146,175,248],CRATE_LANES=[-.6,0,.6];
 function active(level){return level<=50&&level!==20&&level!==50;}
 function allowed(level,item){return active(level)&&ITEMS.includes(item);}
 // ---------- inventory icons (inline SVG, no extra image files) ----------
 const SVG={
  6:'<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="kgR" x1="0" x2="1"><stop offset="0" stop-color="#ff6b5a"/><stop offset="1" stop-color="#c81e2b"/></linearGradient></defs><path d="M18 46c-6 2-9 9-9 9s7-3 9-9" fill="#ffb02e"/><path d="M14 50c-2 1-3 4-3 4s3-1 4-3" fill="#fff3a0"/><path d="M22 42 46 18c4-4 10-6 12-6 0 2-2 8-6 12L28 48z" fill="url(#kgR)" stroke="#5b0f16" stroke-width="2.5" stroke-linejoin="round"/><path d="M46 18c4-4 10-6 12-6 0 2-2 8-6 12" fill="#f4f1e8" stroke="#5b0f16" stroke-width="2.5"/><circle cx="41" cy="27" r="4" fill="#9fe3ff" stroke="#5b0f16" stroke-width="2"/><path d="M22 42 13 41 20 34 28 33M28 48 29 57 36 50 37 42" fill="#ffd34a" stroke="#5b0f16" stroke-width="2.5" stroke-linejoin="round"/></svg>',
  7:'<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="kgB" cx=".35" cy=".35"><stop offset="0" stop-color="#6b7480"/><stop offset=".6" stop-color="#262b33"/><stop offset="1" stop-color="#0d0f13"/></radialGradient></defs><circle cx="30" cy="38" r="19" fill="url(#kgB)" stroke="#05070a" stroke-width="2.5"/><rect x="26" y="14" width="10" height="7" rx="2" transform="rotate(25 31 17)" fill="#8b949e" stroke="#05070a" stroke-width="2"/><path d="M36 14c4-6 10-6 13-3" fill="none" stroke="#c99a5b" stroke-width="3" stroke-linecap="round"/><path d="M50 4l2 6 6 1-5 3 1 6-4-4-6 2 3-5-3-5 5 1z" fill="#ffd34a" stroke="#ff7a1a" stroke-width="1.5"/><circle cx="23" cy="31" r="4" fill="#fff" opacity=".35"/><circle cx="30" cy="40" r="3" fill="#ff3b30"/></svg>',
  8:'<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="kgS" y2="1"><stop offset="0" stop-color="#7fe0ff"/><stop offset="1" stop-color="#1f6fd1"/></linearGradient></defs><path d="M32 6 52 14v16c0 13-9 22-20 28C21 52 12 43 12 30V14z" fill="url(#kgS)" stroke="#0b2c5a" stroke-width="3" stroke-linejoin="round"/><path d="M20 32h-8m0 0 5-5m-5 5 5 5M44 32h8m0 0-5-5m5 5-5 5" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M32 18v26" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".6"/></svg>'
 };
 function iconMarkup(item){return `<span class="power-sprite combat-icon" style="background:none;display:grid;place-items:center" aria-hidden="true">${SVG[item].replace('<svg ','<svg width="100%" height="100%" ')}</span>`;}
 function extendNames(icons,names){for(const i of ITEMS){icons[i]=ICONS[i];names[i]=NAMES[i];}}
 // ---------- race state ----------
 function init(s){
  s.combat={on:active(s.level),rockets:[],bombs:[],blasts:[],sparks:[],crates:[],warned:0};
  for(const r of [s,...s.opponents]){r.pushV=0;r.shield=0;r.blast=0;r.bumpCool=0;r.weaponCool=6+Math.random()*6;r.ram=0;}
  if(!s.combat.on)return;
  for(const seg of CRATE_SEGS)for(const x of CRATE_LANES)s.combat.crates.push({d:seg*SEG+100,x,lap:-1});
 }
 function ensure(s){if(!s.combat)init(s);return s.combat;}
 function racers(s){return [s,...s.opponents];}
 function dodge(r){return airborne(r)||r.recovery>0||r.rescue>0||(r.safeFor||0)>0;}
 function pickWeapon(){const v=Math.random()*100;return v<45?ROCKET:v<85?BOMB:SHIELD;}
 // ---------- using weapons ----------
 function fireRocket(s,from,target){
  const C=ensure(s);C.rockets.push({d:from.d+160,x:from.x,owner:from,target,life:6,speed:Math.max(from===s?s.speed:MAX*.7,MAX*.5)+1800});
  if(typeof beep==='function')beep(300,.12,'sawtooth',.04);
  if(target===s){toast('⚠️ Raket op je af! Stuur opzij of spring!');}
 }
 function dropBomb(s,from){const C=ensure(s);C.bombs.push({d:from.d-260,x:from.x,owner:from,fuse:7,arm:.6});}
 function use(s,item){
  const C=ensure(s);if(!C.on)return '';
  if(item===ROCKET){const t=s.opponents.filter(o=>o.d>s.d&&o.d-s.d<9000).sort((a,b)=>a.d-b.d)[0]||null;fireRocket(s,s,t);return t?'🎯 Raket! Hij zoekt de auto vóór je.':'🎯 Raket recht vooruit!';}
  if(item===BOMB){dropBomb(s,s);return '💣 Bom achter je gelegd!';}
  if(item===SHIELD){s.shield=6;return '🛡️ Duwschild! 6 seconden duw je iedereen opzij.';}
  return '';
 }
 // ---------- explosions ----------
 function explode(s,d,x,power=1,owner=null){
  const C=ensure(s);C.blasts.push({d,x,age:0,power});
  for(const r of racers(s)){
   const dd=Math.abs(r.d-d),dx=r.x-x;if(dd>650||Math.abs(dx)>.85||r===owner&&dd>200)continue;
   if(dodge(r))continue;
   if(r.shield>0){r.shield=Math.max(0,r.shield-2.5);if(r===s)toast('🛡️ Je schild ving de explosie op!');continue;}
   const side=Math.sign(dx)||(Math.random()<.5?-1:1),strength=(1-dd/650)*power;
   r.pushV+=side*(2.2+strength*1.8);r.blast=.9;r.spin=Math.max(r.spin||0,1.4);
   if(r===s){s.speed*=.2;s.impact=Math.max(s.impact||0,.6);s.hitFlash=.3;toast('💥 BOEM! Je bent geraakt!');}
   else if(r.boss){r.pushV*=.25;}
  }
  if(typeof beep==='function'){beep(70,.35,'sawtooth',.06);setTimeout(()=>beep(45,.3,'square',.05),80);}
 }
 // ---------- per-frame update ----------
 function update(s,dt){
  const C=ensure(s);if(!C.on||s.finished)return;
  const lap=Math.floor(s.d/LENGTH);
  // weapon crates
  for(const c of C.crates){const near=lap*LENGTH+c.d;if(c.lap!==lap&&Math.abs(near-s.d)<210&&Math.abs(c.x-s.x)<.3*HB&&!airborne(s)&&!s.recovery&&!s.rescue){c.lap=lap;
   if(s.inventory.includes(null)){const item=pickWeapon();s.inventory[s.inventory.indexOf(null)]=item;renderInventory();addEffect('pickup');toast(`${ICONS[item]} ${NAMES[item]} uit de wapenkist!`);if(typeof beep==='function')beep(1100,.08);}
   else if(!s.fullNotified){toast('Alle drie vakjes vol! Gebruik een power-up.');s.fullNotified=true;}}}
  // rockets home in on their target with a limited turning speed, so a hard swerve dodges them
  for(const m of C.rockets){
   m.life-=dt;const tSpeed=m.target?(m.target===s?s.speed:MAX*.75):0;m.d+=Math.max(m.speed,tSpeed+1600)*dt;
   if(m.target&&!m.target.finished){const tx=m.target.x,dd=m.target.d-m.d;if(dd>-200)m.x+=clamp(tx-m.x,-1,1)*Math.min(1,dt*(dd<1200?1.1:2.4));}
   for(const r of racers(s)){if(r===m.owner||m.used)continue;if(Math.abs(r.d-m.d)<170&&Math.abs(r.x-m.x)<.3*HB){if(airborne(r)){if(r===s)toast('🦘 Over de raket gesprongen!');continue;}m.used=true;explode(s,m.d,m.x,1,m.owner);}}
   if(m.target&&m.d>m.target.d+600)m.used=true;
  }
  C.rockets=C.rockets.filter(m=>!m.used&&m.life>0);
  // bombs explode when someone comes close, or when the fuse runs out
  for(const b of C.bombs){b.fuse-=dt;b.arm-=dt;if(b.arm>0)continue;let hit=b.fuse<=0;for(const r of racers(s)){if(Math.abs(r.d-b.d)<260&&Math.abs(r.x-b.x)<.42&&!airborne(r))hit=true;}if(hit){b.used=true;explode(s,b.d,b.x,1.2,null);}}
  C.bombs=C.bombs.filter(b=>!b.used);
  // bumping: racers side by side shove each other; the shield and a boost make you much stronger
  const list=racers(s);
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
   const a=list[i],b=list[j];if(dodge(a)||dodge(b)||(a.bumpCool>0&&b.bumpCool>0))continue;
   const dd=Math.abs(a.d-b.d),dx=b.x-a.x;if(dd>200||Math.abs(dx)>.32*HB)continue;
   const force=r=>(r.boss?2.6:r===s?1:r.ram>0?1.6:.9)*(r.shield>0?3:1)*((r.boost||0)>0?1.5:1);
   const side=Math.sign(dx)||1,fa=force(a),fb=force(b);
   a.pushV-=side*2*fb/(fa+fb)*2;b.pushV+=side*2*fa/(fa+fb)*2;
   const behind=a.d<b.d?a:b;if(behind===s)s.speed*=.85;
   a.bumpCool=b.bumpCool=.35;
   C.sparks.push({d:(a.d+b.d)/2,x:(a.x+b.x)/2,age:0});
   if(a===s||b===s){s.impact=Math.max(s.impact||0,.25);if(typeof beep==='function')beep(95,.08,'square',.05);
    const other=a===s?b:a;if(s.shield>0)toast('🛡️ Weggeduwd!');else if(Math.abs(other.x)>.9&&Math.random()<.5)toast('💥 Van de baan geduwd!');}
  }
  for(const r of list){
   r.bumpCool=Math.max(0,(r.bumpCool||0)-dt);r.shield=Math.max(0,(r.shield||0)-dt);r.blast=Math.max(0,(r.blast||0)-dt);
   if(r.pushV){r.x=clamp(r.x+r.pushV*dt,-1.65,1.65);
    // Shoved over the edge of the road: the normal off-track or splash recovery takes over.
    if(Math.abs(r.pushV)>.5&&!r.boss&&!dodge(r)&&Math.abs(r.x)>Stunts.width(s,r.d)+.12&&Math.sign(r.x)===Math.sign(r.pushV)){const side=RaceAdventure.waterSide(s,Math.floor(r.d/SEG)),wet=side===2||side===Math.sign(r.x);RaceAdventure.begin(s,r,wet?'water':'dust');r.pushV=0;}
    r.pushV*=Math.exp(-dt*4.2);if(Math.abs(r.pushV)<.02)r.pushV=0;}
  }
  // rivals fight back: rockets at a player ahead, bombs for a player right behind, and the odd ram
  const fierce=Math.min(1.2,.45+s.level/50);
  for(const o of s.opponents){
   if(o.boss||o.recovery>0||o.rescue>0||s.count>0)continue;
   o.weaponCool-=dt*fierce;
   const gap=s.d-o.d;
   if(o.weaponCool<=0){
    if(gap>400&&gap<4500&&C.rockets.filter(m=>m.target===s).length<1){fireRocket(s,o,s);o.weaponCool=8+Math.random()*6;}
    else if(gap<-200&&gap>-2200&&C.bombs.length<3){dropBomb(s,o);o.weaponCool=6+Math.random()*6;if(Math.random()<.6)toast('💣 Pas op, een bom op de weg!');}
    else o.weaponCool=1.5;
   }
   o.ram=Math.max(0,(o.ram||0)-dt);
   if(!o.ram&&Math.abs(gap)<420&&Math.abs(o.x-s.x)<.8&&Math.random()<dt*1.1*fierce)o.ram=1.5;
   if(o.ram>0)o.x=lerp(o.x,s.x,Math.min(1,dt*1.6));
  }
  for(const e of C.blasts)e.age+=dt;C.blasts=C.blasts.filter(e=>e.age<1.1);
  for(const e of C.sparks)e.age+=dt;C.sparks=C.sparks.filter(e=>e.age<.4);
 }
 // ---------- drawing ----------
 function sprites(s,projectDist,list){
  const C=s.combat;if(!C?.on)return;const lap=Math.floor(s.d/LENGTH);
  for(const c of C.crates){for(const l of [lap,lap+1]){if(c.lap===l)continue;const p=projectDist(l*LENGTH+c.d);if(p)list.push({p,x:c.x,combat:'crate'});}}
  for(const m of C.rockets){const p=projectDist(m.d);if(p)list.push({p,x:m.x,combat:'rocket',m});}
  for(const b of C.bombs){const p=projectDist(b.d);if(p)list.push({p,x:b.x,combat:'bomb',b});}
  for(const e of C.blasts){const p=projectDist(e.d);if(p)list.push({p,x:e.x,combat:'blast',e});}
  for(const e of C.sparks){const p=projectDist(e.d);if(p)list.push({p,x:e.x,combat:'spark',e});}
 }
 function drawCrate(c,x,y,k){
  const t=performance.now()/1000,s=70*k,bob=Math.sin(t*3+x*.01)*6*k,top=y-s-20*k+bob;if(s<2)return;
  c.save();c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(x,y,s*.55,s*.14,0,0,7);c.fill();
  c.translate(x,top+s/2);c.rotate(Math.sin(t*2)*.08);
  const g=c.createLinearGradient(-s/2,-s/2,s/2,s/2);g.addColorStop(0,'#ff7448');g.addColorStop(1,'#b3261e');
  c.fillStyle=g;c.strokeStyle='#4a0e0a';c.lineWidth=Math.max(1,4*k);c.beginPath();c.roundRect(-s/2,-s/2,s,s,s*.14);c.fill();c.stroke();
  c.fillStyle='#ffd34a';c.fillRect(-s/2,-s*.08,s,s*.16);c.fillRect(-s*.08,-s/2,s*.16,s);
  c.fillStyle='#2a0805';c.font=`900 ${Math.max(6,s*.42)}px system-ui,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('!',0,s*.03);
  c.globalAlpha=.4+Math.sin(t*6)*.2;c.strokeStyle='#fff3b0';c.lineWidth=Math.max(1,3*k);c.beginPath();c.roundRect(-s/2-4*k,-s/2-4*k,s+8*k,s+8*k,s*.2);c.stroke();
  c.restore();
 }
 function drawRocket(c,x,y,k,m){
  const t=performance.now()/1000,L=120*k,h=y-40*k;if(L<2)return;c.save();c.translate(x,h);
  for(let i=0;i<6;i++){const f=(t*8+i/6)%1;c.globalAlpha=(1-f)*.5;c.fillStyle='#d9d9d9';c.beginPath();c.arc(Math.sin(i*2.1)*8*k,L*.25+f*L*.9,(10+f*24)*k,0,7);c.fill();}
  c.globalAlpha=1;const flame=c.createRadialGradient(0,L*.28,2,0,L*.28,26*k);flame.addColorStop(0,'#fff6b0');flame.addColorStop(.5,'#ff9b2e');flame.addColorStop(1,'rgba(255,60,20,0)');c.fillStyle=flame;c.beginPath();c.ellipse(0,L*.3,16*k,(30+Math.sin(t*40)*8)*k,0,0,7);c.fill();
  c.fillStyle='#c81e2b';c.strokeStyle='#4b0b12';c.lineWidth=Math.max(1,3*k);c.beginPath();c.ellipse(0,0,22*k,L*.3,0,0,7);c.fill();c.stroke();
  c.fillStyle='#f4f1e8';c.beginPath();c.ellipse(0,-L*.18,15*k,L*.1,0,0,7);c.fill();
  c.fillStyle='#ffd34a';for(const s of [-1,1]){c.beginPath();c.moveTo(s*18*k,L*.12);c.lineTo(s*38*k,L*.3);c.lineTo(s*16*k,L*.26);c.closePath();c.fill();c.stroke();}
  c.restore();
 }
 function drawBomb(c,x,y,k,b){
  const t=performance.now()/1000,r=34*k;if(r<1.5)return;c.save();c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x,y,r*1.1,r*.3,0,0,7);c.fill();
  const g=c.createRadialGradient(x-r*.35,y-r*1.3,2,x,y-r,r);g.addColorStop(0,'#77808c');g.addColorStop(.6,'#262b33');g.addColorStop(1,'#0b0d11');c.fillStyle=g;c.beginPath();c.arc(x,y-r,r,0,7);c.fill();
  const blink=(b.fuse<2?t*10:t*4)%1<.5;c.fillStyle=blink?'#ff3b30':'#5a1210';c.beginPath();c.arc(x,y-r,r*.22,0,7);c.fill();
  c.strokeStyle='#c99a5b';c.lineWidth=Math.max(1,4*k);c.beginPath();c.moveTo(x+r*.4,y-r*1.85);c.quadraticCurveTo(x+r*.9,y-r*2.5,x+r*1.2,y-r*2.2);c.stroke();
  c.fillStyle='#ffd34a';c.beginPath();c.arc(x+r*1.2,y-r*2.2,(5+Math.sin(t*30)*3)*k,0,7);c.fill();c.restore();
 }
 function drawBlast(c,x,y,k,e){
  const a=e.age,R=(120+a*380)*k*(e.power||1);if(R<2)return;c.save();
  // shockwave ring
  c.globalAlpha=Math.max(0,1-a*1.4);c.strokeStyle='#fff7d6';c.lineWidth=Math.max(1,14*k*(1-a));c.beginPath();c.ellipse(x,y,R*1.3,R*.38,0,0,7);c.stroke();
  // fireball
  const f=Math.max(0,1-a*1.1),r=(70+a*170)*k;c.globalAlpha=f;const g=c.createRadialGradient(x,y-r*.8,r*.1,x,y-r*.8,r);g.addColorStop(0,'#fffbe0');g.addColorStop(.3,'#ffd34a');g.addColorStop(.65,'#ff6a1a');g.addColorStop(1,'rgba(150,20,10,0)');c.fillStyle=g;c.beginPath();c.arc(x,y-r*.8,r,0,7);c.fill();
  // smoke and debris
  // smoke puffs drift up and outward; glowing debris flies in arcs
  for(let i=0;i<8;i++){const ang=-Math.PI*(.1+.8*((i*.618)%1)),dist=(40+i*14)*a*k*3,px=x+Math.cos(ang)*dist,py=y-r*.9+Math.sin(ang)*dist-a*120*k;c.globalAlpha=Math.max(0,.55-a*.5)*(a>.12?1:a/.12);c.fillStyle=i%3?'#5d636b':'#7d838a';c.beginPath();c.arc(px,py,(18+a*55+i*3)*k,0,7);c.fill();}
  for(let i=0;i<12;i++){const ang=i*.52,v=(260+(i*37)%140)*k,px=x+Math.cos(ang)*v*a,py=y-r*.8-Math.abs(Math.sin(ang))*v*a+a*a*420*k;c.globalAlpha=Math.max(0,1-a*1.6);c.fillStyle=i%2?'#ffd34a':'#ff7a1a';c.fillRect(px-4*k,py-4*k,8*k,8*k);}
  c.globalAlpha=Math.max(0,1-a*1.3);c.font=`900 ${Math.max(8,Math.min(W*.14,52*k))}px system-ui,sans-serif`;c.textAlign="center";c.lineWidth=Math.max(2,7*k);c.strokeStyle='#40160a';c.strokeText('BOEM!',x,y-r*2.1);c.fillStyle='#ffd34a';c.fillText('BOEM!',x,y-r*2.1);
  c.restore();
 }
 function drawSpark(c,x,y,k,e){c.save();const a=e.age/.4;for(let i=0;i<10;i++){const ang=i*.63,d=a*70*k;c.globalAlpha=1-a;c.strokeStyle=i%2?'#ffd34a':'#fff';c.lineWidth=Math.max(1,3*k);c.beginPath();c.moveTo(x+Math.cos(ang)*d*.3,y-40*k-Math.sin(ang)*d*.3);c.lineTo(x+Math.cos(ang)*d,y-40*k-Math.sin(ang)*d);c.stroke();}c.restore();}
 function drawSprite(c,v,x,y,k){
  // Same world-to-screen factor the race uses for karts, so weapons match the cars in size.
  k=k*(Math.min(1.7,W/340,H/390)*.95/(.9/view.cameraOffset*W*.65));
  if(v.combat==='crate')drawCrate(c,x,y,k);else if(v.combat==='rocket')drawRocket(c,x,y,k,v.m);else if(v.combat==='bomb')drawBomb(c,x,y,k,v.b);else if(v.combat==='blast')drawBlast(c,x,y,k,v.e);else if(v.combat==='spark')drawSpark(c,x,y,k,v.e);
 }
 function overlay(c,s){
  const C=s.combat;if(!C?.on||s.loopShow)return;
  const ps=Math.min(1.7,W/340,H/390)*.95,px=W/2,py=view.playerY-55*ps;
  if(s.shield>0){const t=performance.now()/1000;c.save();c.globalAlpha=.35+Math.sin(t*8)*.1+(s.shield<1.5?Math.sin(t*30)*.2:0);const g=c.createRadialGradient(px,py,20*ps,px,py,120*ps);g.addColorStop(0,'rgba(127,224,255,0)');g.addColorStop(.8,'rgba(127,224,255,.45)');g.addColorStop(1,'rgba(31,111,209,.9)');c.fillStyle=g;c.beginPath();c.ellipse(px,py,125*ps,90*ps,0,0,7);c.fill();c.restore();}
  // incoming rocket warning arrow at the bottom of the screen
  const threat=C.rockets.find(m=>m.target===s&&m.d<s.d&&s.d-m.d<4000);
  if(threat){const t=performance.now()/1000;c.save();c.globalAlpha=.6+Math.sin(t*14)*.4;c.fillStyle='#ff3b30';c.beginPath();const ax=W/2+(threat.x-s.x)*W*.3,ay=H*.93;c.moveTo(ax,ay-22);c.lineTo(ax+20,ay+8);c.lineTo(ax-20,ay+8);c.closePath();c.fill();c.restore();}
 }
 return{ROCKET,BOMB,SHIELD,ITEMS,active,allowed,iconMarkup,extendNames,init,use,update,explode,sprites,drawSprite,overlay};
})();
