
/* Hand-painted procedural scenery, cached once; no external models or image services. */
const sceneryCache=new Map();let sceneryLevel=1,landscapeCache=null;
function shape(c,points,color){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();}
function gradient(c,x,y,x2,y2,stops){const g=c.createLinearGradient(x,y,x2,y2);stops.forEach(([at,color])=>g.addColorStop(at,color));return g;}
function scenicCanvas(w=400,h=440){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function buildScenery(level){sceneryLevel=level;landscapeCache=null;if(sceneryCache.size)return;
 for(const type of ['oak','pine','blossom','flowers','grass','rocks','fence','barn','mill','pond','hay','sign']){
  const cv=scenicCanvas(),c=cv.getContext('2d');c.translate(200,425);
  if(['oak','pine','blossom'].includes(type)){
   ellipse(c,12,-3,91,13,'#254b2c28');c.fillStyle=gradient(c,-17,-10,20,-10,[[0,'#5c5138'],[.5,'#9c7d4d'],[1,'#67543b']]);c.beginPath();c.moveTo(-14,0);c.lineTo(-9,-155);c.lineTo(13,-155);c.lineTo(23,0);c.fill();
   c.strokeStyle='#72603f';c.lineWidth=11;c.beginPath();c.moveTo(0,-130);c.lineTo(-45,-188);c.moveTo(8,-120);c.lineTo(54,-177);c.stroke();
   if(type==='pine'){for(let j=0;j<5;j++){const y=-285+j*42,w=28+j*18;shape(c,[[0,y-53],[-w,y+70],[-w*.5,y+58],[0,y+80],[w*.55,y+58],[w,y+70]],j%2?'#366e47':'#2b6245');shape(c,[[0,y-53],[-w*.8,y+62],[0,y+42]],'#59905a');}}
   else{const pink=type==='blossom';for(const [x,y,r] of [[-58,-192,55],[62,-196,56],[0,-245,79],[-70,-238,48],[57,-266,51],[-23,-291,58],[29,-198,65]]){ellipse(c,x+7,y+9,r,r*.88,pink?'#c78094':'#34754b');ellipse(c,x,y,r,r*.88,gradient(c,x-r,y-r,x+r,y+r,[[0,pink?'#ffe0d6':'#a7c85c'],[.45,pink?'#f2b1c0':'#6fa547'],[1,pink?'#d68fa6':'#3c824a']]));}for(let j=0;j<60;j++){const x=Math.sin(j*7.19)*112,y=-220+Math.cos(j*4.13)*75;ellipse(c,x,y,3+j%4,2+j%3,pink?'#fff0d4aa':'#d3e69155');}}
   c.strokeStyle='#b7996050';c.lineWidth=2;for(let j=0;j<5;j++){c.beginPath();c.moveTo(j*4-7,-4);c.lineTo(j*3-5,-78);c.stroke();}
  }
  if(type==='grass'||type==='flowers'){
   ellipse(c,0,-5,140,19,'#4c833342');for(let j=0;j<48;j++){const x=Math.sin(j*78.2)*140,y=-8-((j*37)%55);c.strokeStyle=j%2?'#57943c':'#8cb648';c.lineWidth=2;c.beginPath();c.moveTo(x,y+10);c.quadraticCurveTo(x+2,y-12,x+(j%2?8:-8),y-20);c.stroke();if(type==='flowers'&&j%2===0){const white=j%3===0;for(let k=0;k<5;k++){const a=k/5*Math.PI*2;ellipse(c,x+Math.cos(a)*5,y-20+Math.sin(a)*5,3.5,3.5,white?'#fff5dc':j%3===1?'#f5ac8e':'#d0b6ed');}ellipse(c,x,y-20,2.8,2.8,'#f5c952');}}
  }
  if(type==='rocks'){ellipse(c,10,-2,108,15,'#31553e30');for(const [x,y,r] of [[-57,-23,40],[23,-35,65],[79,-16,27]]){shape(c,[[x-r,y+20],[x-r*.8,y-r*.6],[x-r*.2,y-r],[x+r*.7,y-r*.6],[x+r,y+20]],'#8b9987');shape(c,[[x-r,y+20],[x-r*.8,y-r*.6],[x-r*.2,y-r],[x+8,y-6]],'#b6bc9a');shape(c,[[x-r*.2,y-r],[x+r*.7,y-r*.6],[x+r,y+20],[x+8,y-6]],'#7b8e7a');ellipse(c,x-12,y+14,r*.54,7,'#6b914a');}}
  if(type==='fence'){c.lineCap='round';c.strokeStyle='#755d3a';c.lineWidth=12;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*115,0);c.lineTo(i*115,-100);c.stroke();}for(const y of [-35,-77]){rr(c,-131,y,262,13,3,'#a78953');rr(c,-131,y,262,4,2,'#ddc58b');}for(const x of [-115,0,115])rr(c,x-8,-108,17,111,4,'#c6a56a');}
  if(type==='barn'){ellipse(c,0,0,158,18,'#24482b33');rr(c,-126,-170,252,171,3,'#ae634c');for(let i=0;i<16;i++)rr(c,-120+i*16,-164,3,165,1,'#d6946b');shape(c,[[-144,-164],[0,-275],[145,-164]],'#e0cda3');shape(c,[[-154,-168],[-5,-286],[150,-175],[147,-157],[-7,-264],[-150,-151]],'#3e6358');rr(c,-49,-113,98,114,2,'#754c3c','#e5cf99');c.strokeStyle='#ebd6a0';c.lineWidth=5;c.beginPath();c.moveTo(-43,-106);c.lineTo(43,-3);c.moveTo(43,-106);c.lineTo(-43,-3);c.moveTo(0,-109);c.lineTo(0,0);c.stroke();rr(c,-91,-133,31,40,2,'#cbe5d1','#e9d7a5');rr(c,63,-133,31,40,2,'#cbe5d1','#e9d7a5');ellipse(c,0,-193,18,18,'#6f8c80');c.strokeStyle='#ebd6a0';c.lineWidth=4;c.beginPath();c.arc(0,-193,18,0,Math.PI*2);c.stroke();}
  if(type==='mill'){ellipse(c,0,0,98,13,'#264e3033');shape(c,[[-72,0],[-44,-242],[44,-242],[72,0]],gradient(c,-72,0,72,0,[[0,'#d7bc8b'],[.5,'#fff0c0'],[1,'#bfa476']]));shape(c,[[-62,-238],[0,-295],[62,-238]],'#586d54');rr(c,-17,-53,34,53,15,'#6e7250');rr(c,-12,-188,24,30,4,'#5b8378');for(let j=0;j<4;j++){c.save();c.translate(0,-226);c.rotate(j*Math.PI/2+.55);rr(c,8,-5,130,10,2,'#b79b62');rr(c,48,-36,79,30,2,'#f4e8bd','#a68d5b');c.strokeStyle='#b29c6e';c.lineWidth=2;for(let n=0;n<6;n++){c.beginPath();c.moveTo(52+n*14,-36);c.lineTo(52+n*14,-7);c.stroke();}c.restore();}ellipse(c,0,-226,12,12,'#98774e');}
  if(type==='pond'){ellipse(c,0,-10,180,55,'#a8b76a');ellipse(c,0,-14,166,46,gradient(c,0,-64,0,30,[[0,'#58a49b'],[.55,'#83c6ae'],[1,'#b6dfb8']]));c.strokeStyle='#e6f4d299';c.lineWidth=3;for(let n=0;n<7;n++){c.beginPath();c.ellipse(Math.sin(n*12)*100,-14+n*3,10+n*7,2,0,0,Math.PI);c.stroke();}for(let n=0;n<12;n++){const x=Math.sin(n*4)*163,y=12+Math.cos(n*4)*14;c.strokeStyle='#678149';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y-43);c.stroke();rr(c,x-7,y-52,7,16,3,'#8b7240');}ellipse(c,45,-15,13,5,'#5c9951');ellipse(c,-45,-20,12,5,'#5c9951');}
  if(type==='hay'){ellipse(c,0,0,105,13,'#31552e22');rr(c,-94,-83,187,84,14,'#c49b43');ellipse(c,-55,-42,45,42,'#e0bc61');ellipse(c,-55,-42,30,28,'#cfa951');ellipse(c,-55,-42,19,17,'#e1bd65');ellipse(c,-55,-42,8,8,'#b78e3b');rr(c,-6,-78,6,77,2,'#a7863d');rr(c,65,-77,6,77,2,'#a7863d');for(let j=0;j<14;j++)rr(c,-4+j*6,-69+(j%3)*5,2,53,1,'#f1d37e88');}
  if(type==='sign'){rr(c,-8,-138,16,140,3,'#b49b64');rr(c,-95,-173,190,69,12,'#f6e5b3','#9c8357');c.fillStyle='#466044';c.textAlign='center';c.font='bold 27px sans-serif';c.fillText('KART GO',0,-130);rr(c,-62,-103,124,7,2,'#8fa654');}
  sceneryCache.set(type,cv);
 }
}
function drawScenic(c,type,x,y,k){const image=sceneryCache.get(type);if(!image||k<.004)return;const factors={oak:1.5,pine:1.65,blossom:1.4,flowers:1.1,grass:1,rocks:1.2,fence:1.4,barn:2.2,mill:2.5,pond:2.5,hay:1.4,sign:1.2};const scale=k*(factors[type]||1);c.drawImage(image,x-200*scale,y-425*scale,400*scale,440*scale);}
function drawLandscape(c,w,h,s){
 const hh=h*.40;if(!landscapeCache||landscapeCache.w!==w||landscapeCache.h!==h){
  const cv=scenicCanvas(Math.ceil(w*1.2),Math.ceil(hh+5)),p=cv.getContext('2d'),bw=cv.width,bh=cv.height;
  p.fillStyle=gradient(p,0,0,0,bh,[[0,'#73c8db'],[.65,'#b6e4dd'],[1,'#edf1bd']]);p.fillRect(0,0,bw,bh);
  const glow=p.createRadialGradient(bw*.76,bh*.28,5,bw*.76,bh*.28,bh*.5);glow.addColorStop(0,'#fff5c8a0');glow.addColorStop(1,'#fff5c800');p.fillStyle=glow;p.fillRect(0,0,bw,bh);ellipse(p,bw*.76,bh*.28,23,23,'#fff3b4');
  for(let i=0;i<8;i++){const x=bw*(i*.19-.1),y=bh*(.20+(i%3)*.10),sc=.7+i%3*.25;for(let j=0;j<5;j++)ellipse(p,x+j*21*sc,y+Math.sin(j*2)*7,28*sc,9*sc,'#f8f8de99');}
  for(let layer=0;layer<3;layer++){const points=[[0,bh]];for(let i=0;i<=80;i++){const xx=i/80*bw,yy=bh*(.69+layer*.095)-Math.sin(i*.12+layer*1.7)*bh*(.14-layer*.025)-Math.sin(i*.37+layer)*bh*.027;points.push([xx,yy]);}points.push([bw,bh]);shape(p,points,['#8ab8a1','#88b882','#75a968'][layer]);}
  for(let n=0;n<22;n++){let xx=(n*.157*bw)%bw,yy=bh*.84+Math.sin(n*2.6)*bh*.09;p.save();p.translate(xx,yy);p.scale(.10,.10);const tree=sceneryCache.get(n%3?'oak':'pine');p.drawImage(tree,-200,-425);p.restore();}
  // Fields and hedgerows on the lower hill make the horizon a place, not a flat backdrop.
  shape(p,[[0,bh],[bw*.10,bh*.85],[bw*.36,bh*.92],[bw*.42,bh]],'#b6be6a');shape(p,[[bw*.48,bh],[bw*.66,bh*.82],[bw*.9,bh*.88],[bw,bh]],'#a4b963');p.strokeStyle='#d4ce8870';p.lineWidth=2;for(let i=0;i<10;i++){p.beginPath();p.moveTo(bw*(.49+i*.045),bh);p.lineTo(bw*(.66+i*.025),bh*.84);p.stroke();}
  p.save();p.translate(bw*.19,bh*.92);p.scale(.15,.15);p.drawImage(sceneryCache.get('barn'),-200,-425);p.restore();p.save();p.translate(bw*.84,bh*.88);p.scale(.16,.16);p.drawImage(sceneryCache.get('mill'),-200,-425);p.restore();
  landscapeCache={cv,w,h};
 }
 const drift=Math.sin(s.d/18000)*w*.035-s.x*w*.018;c.drawImage(landscapeCache.cv,-w*.10+drift,0);
 // Separate foreground clouds slide over the cached panorama.
 c.save();c.globalAlpha=.42;for(let j=0;j<3;j++){const cx=((s.time*6+j*w*.39)%(w*1.3))-w*.15,cy=h*(.09+(j%2)*.055);for(let k=0;k<4;k++)ellipse(c,cx+k*16,cy-Math.sin(k*1.7)*5,22,7,'#fffde6');}c.restore();
 // A few birds move above the distant hills.
 c.strokeStyle='#4f827680';c.lineWidth=1.4;for(let i=0;i<4;i++){const x=w*.40+i*17+Math.sin(s.time*.2)*25,y=h*.15+Math.sin(i*3)*12;c.beginPath();c.moveTo(x-5,y);c.quadraticCurveTo(x-2,y-4,x,y);c.quadraticCurveTo(x+3,y-4,x+6,y);c.stroke();}
}
function elevation(d){const profile=trackProfile(sceneryLevel);return Math.sin(d/LENGTH*Math.PI*4+sceneryLevel*.2)*profile.hill+Math.sin(d/LENGTH*Math.PI*8)*profile.hill*.28;}

// Road furniture is projected with the same points as the track.
function drawRoadFurniture(c,a,b,terrain){
 if(terrain==='bridge'){
  for(const side of [-1,1]){
   const ax=a.x+side*a.w*1.10,bx=b.x+side*b.w*1.10,ah=a.scale*150*H*.62,bh=b.scale*150*H*.62;
   shape(c,[[ax-4,a.y-ah],[ax+4,a.y-ah],[bx+2,b.y-bh],[bx-2,b.y-bh]],'#e5ce96');
   if(a.segIndex%2===0){c.strokeStyle='#786447';c.lineWidth=Math.max(1,a.w*.018);c.beginPath();c.moveTo(ax,a.y);c.lineTo(ax,a.y-ah-3);c.stroke();}
  }
  c.strokeStyle='#876e4e44';c.lineWidth=1;c.beginPath();c.moveTo(a.x-a.w,a.y);c.lineTo(a.x+a.w,a.y);c.stroke();
 }else if(terrain==='tunnel'){
  for(const side of [-1,1]){
   const heightA=a.scale*720*H*.62,heightB=b.scale*720*H*.62;
   shape(c,[[a.x+side*a.w*1.02,a.y],[a.x+side*a.w*1.30,a.y-heightA],[b.x+side*b.w*1.30,b.y-heightB],[b.x+side*b.w*1.02,b.y]],a.segIndex%2?'#455e4f':'#4a6351');
   if(a.segIndex%4===0){c.fillStyle='#ffed9a';const size=Math.max(1,a.w*.025);c.fillRect(a.x+side*a.w*1.17-size,a.y-heightA*.6,size*2,size*.55);}
  }
 }
}
function drawTunnelPortal(c,p){
 if(p.w<4)return;const x=p.x,y=p.y,w=p.w;c.save();
 c.beginPath();c.moveTo(x-w*1.42,y+2);c.lineTo(x-w*1.42,y-w*.58);c.ellipse(x,y-w*.58,w*1.42,w*1.01,0,Math.PI,Math.PI*2);c.lineTo(x+w*1.42,y+2);c.closePath();
 c.moveTo(x-w*1.04,y+3);c.lineTo(x-w*1.04,y-w*.58);c.ellipse(x,y-w*.58,w*1.04,w*.73,0,Math.PI,Math.PI*2);c.lineTo(x+w*1.04,y+3);c.closePath();
 c.fillStyle=gradient(c,x-w,y-w*1.6,x+w,y,[[0,'#cccca5'],[.5,'#9caa86'],[1,'#6c826d']]);c.fill('evenodd');
 c.lineWidth=Math.max(1,w*.015);c.strokeStyle='#63785b';
 for(let i=0;i<=12;i++){const a=Math.PI+i/12*Math.PI;c.beginPath();c.moveTo(x+Math.cos(a)*w*1.05,y-w*.58+Math.sin(a)*w*.74);c.lineTo(x+Math.cos(a)*w*1.4,y-w*.58+Math.sin(a)*w);c.stroke();}
 for(const side of [-1,1]){for(let j=0;j<4;j++){c.beginPath();c.moveTo(x+side*w*1.04,y-j*w*.14);c.lineTo(x+side*w*1.42,y-j*w*.14);c.stroke();}}
 c.restore();
}
function drawHazard(c,type,x,y,k){
 if(type==='puddle'){ellipse(c,x,y-2*k,49*k,12*k,'#b7e6d7b0');ellipse(c,x-5*k,y-4*k,34*k,6*k,'#81bcb4');c.strokeStyle='#ecfff18a';c.lineWidth=Math.max(1,k);c.beginPath();c.ellipse(x,y-5*k,24*k,3*k,0,0,Math.PI);c.stroke();return;}
 ellipse(c,x,y,25*k,5*k,'#263f2d40');rr(c,x-24*k,y-6*k,48*k,7*k,2*k,'#4b654a');
 shape(c,[[x-17*k,y-6*k],[x-5*k,y-58*k],[x+5*k,y-58*k],[x+17*k,y-6*k]],'#f19848');
 shape(c,[[x-12*k,y-27*k],[x-9*k,y-40*k],[x+9*k,y-40*k],[x+12*k,y-27*k]],'#fff1d0');
}
function drawRaceEffects(c,s,py){
 for(const fx of s.effects){
  const t=fx.age/fx.life;c.save();c.globalAlpha=1-t;
  if(fx.type==='lightning'){
   c.strokeStyle='#fff6ab';c.lineWidth=3;
   for(let j=0;j<3;j++){const x=W*(.25+j*.25);c.beginPath();c.moveTo(x,H*.08);c.lineTo(x-14,H*.23);c.lineTo(x+8,H*.21);c.lineTo(x-12,H*.42);c.stroke();}
  }else{
   const color={pickup:'#fff4a2',jump:'#eaffaa',boost:'#ffcb65',impact:'#f3d09b',ice:'#b7f1ff'}[fx.type]||'#efffcf';
   for(let j=0;j<(quality.level>0?12:7);j++){const a=j/12*Math.PI*2,r=(18+t*75)*Math.min(W/400,1.5);ellipse(c,W/2+Math.cos(a)*r,py-35+Math.sin(a)*r*.5,Math.max(1,4*(1-t)),Math.max(1,4*(1-t)),color);}
  }c.restore();
 }
 if(surfaceAt(Math.floor(s.d/SEG))==='tunnel'){
  const g=c.createRadialGradient(W*.5,H*.60,Math.min(W,H)*.16,W*.5,H*.55,Math.max(W,H)*.65);g.addColorStop(0,'#112f1c00');g.addColorStop(1,'#0c241aba');c.fillStyle=g;c.fillRect(0,0,W,H);
 }
}
