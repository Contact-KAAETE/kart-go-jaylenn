/* The second world uses the same projection and physics as Jaylenn's original game. */
'use strict';
const desertScenery=new Map();
function buildDesertScenery(){
 if(desertScenery.size)return;
 for(const type of ['cactus','palm','sandrocks','oasis','arch','tuft','marker']){
  const cv=scenicCanvas(),c=cv.getContext('2d');c.translate(200,425);ellipse(c,15,-2,100,15,'#825a352c');
  if(type==='cactus'){
   c.strokeStyle='#517b4b';c.lineWidth=39;c.lineCap='round';c.beginPath();c.moveTo(0,-5);c.lineTo(0,-205);c.moveTo(-7,-91);c.lineTo(-67,-91);c.lineTo(-67,-151);c.moveTo(10,-132);c.lineTo(59,-132);c.lineTo(59,-192);c.stroke();
   c.strokeStyle='#91aa63';c.lineWidth=9;c.beginPath();c.moveTo(-10,-11);c.lineTo(-10,-204);c.moveTo(-70,-99);c.lineTo(-70,-148);c.stroke();for(let j=0;j<23;j++){const x=Math.sin(j*3.2)*13,y=-15-j*8;c.strokeStyle='#d5d9a2';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y-7);c.stroke();}ellipse(c,9,-222,9,6,'#e99589');
  }
  if(type==='palm'){
   c.strokeStyle='#987149';c.lineWidth=23;c.beginPath();c.moveTo(-7,0);c.quadraticCurveTo(18,-135,-8,-225);c.stroke();c.strokeStyle='#d5af70';c.lineWidth=3;for(let j=0;j<16;j++){c.beginPath();c.moveTo(-12,-8-j*13);c.lineTo(10,-14-j*13);c.stroke();}
   for(let j=0;j<8;j++){const a=j/8*Math.PI*2;c.save();c.translate(-8,-232);c.rotate(a);shape(c,[[0,0],[32,-40],[107,-25],[157,15],[72,-7]],j%2?'#648448':'#80a358');c.strokeStyle='#b5bb6f';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(80,-29,153,14);c.stroke();c.restore();}for(const x of [-16,3,15])ellipse(c,x,-227,11,12,'#8b643b');
  }
  if(type==='sandrocks'||type==='arch'){
   for(let j=0;j<(type==='arch'?2:3);j++){const x=type==='arch'?(j?91:-91):j*60-65,h=type==='arch'?215:65+(j%2)*55;shape(c,[[x-46,0],[x-39,-h*.7],[x-18,-h],[x+27,-h],[x+48,-h*.4],[x+49,0]],'#bc8156');shape(c,[[x-46,0],[x-39,-h*.7],[x-18,-h],[x+8,-h],[x+5,0]],'#e1a775');c.strokeStyle='#f6c18a';c.lineWidth=3;for(let k=1;k<4;k++){c.beginPath();c.moveTo(x-30,-h*k/4);c.lineTo(x+30,-h*k/4-7);c.stroke();}}
   if(type==='arch'){shape(c,[[-137,-171],[-99,-229],[74,-234],[135,-179],[85,-155],[41,-190],[-49,-189],[-83,-156]],'#d19a69');shape(c,[[-125,-192],[-99,-229],[74,-234],[122,-197]],'#edbd86');}
  }
  if(type==='oasis'){ellipse(c,0,-8,175,45,'#a6ad62');ellipse(c,0,-12,151,34,'#64b5b3');ellipse(c,-15,-15,121,23,'#90d1c3');c.strokeStyle='#d7f3cf';c.lineWidth=3;c.beginPath();c.ellipse(10,-14,81,12,0,0,Math.PI);c.stroke();}
  if(type==='tuft'){for(let j=0;j<20;j++){const x=Math.sin(j*7)*75;c.strokeStyle=j%2?'#b29552':'#d8bd70';c.lineWidth=3;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+Math.sin(j)*15,-25,x+Math.sin(j)*30,-45-(j%4)*8);c.stroke();}}
  if(type==='marker'){rr(c,-7,-137,14,137,3,'#9d7850');shape(c,[[-2,-137],[95,-115],[0,-80]],'#e97f52');shape(c,[[0,-133],[40,-124],[0,-103]],'#ffe6a4');}
  desertScenery.set(type,cv);
 }
}
function drawDesertScenic(c,type,x,y,k){
 const mapped={oak:'cactus',blossom:'palm',pine:'palm',flowers:'tuft',grass:'tuft',rocks:'sandrocks',fence:'marker',barn:'arch',mill:'arch',pond:'oasis',hay:'sandrocks',sign:'marker'}[type]||'tuft';
 const img=desertScenery.get(mapped);if(!img||k<.004)return;const size=k*({arch:2.1,palm:1.8,oasis:2.4,cactus:1.5}[mapped]||1.1);c.drawImage(img,x-200*size,y-425*size,400*size,440*size);
}
function drawDesertLandscape(c,w,h,s){
 const hh=h*.40;
 if(!landscapeCache||landscapeCache.w!==w||landscapeCache.h!==h){
  const cv=scenicCanvas(Math.ceil(w*1.2),Math.ceil(hh+5)),p=cv.getContext('2d'),bw=cv.width,bh=cv.height;
  p.fillStyle=gradient(p,0,0,0,bh,[[0,'#72c8db'],[.58,'#c1e2d9'],[1,'#fff0c7']]);p.fillRect(0,0,bw,bh);
  const sun=p.createRadialGradient(bw*.78,bh*.24,10,bw*.78,bh*.24,bh*.46);sun.addColorStop(0,'#fff1a9c0');sun.addColorStop(1,'#fff3ae00');p.fillStyle=sun;p.fillRect(0,0,bw,bh);ellipse(p,bw*.78,bh*.24,26,26,'#fff1b4');
  for(let layer=0;layer<4;layer++){const points=[[0,bh]];for(let i=0;i<=80;i++){const x=i/80*bw,y=bh*(.66+layer*.085)-Math.sin(i*.10+layer*2+s.level*.4)*bh*(.14-layer*.02)-Math.sin(i*.24)*bh*.015;points.push([x,y]);}points.push([bw,bh]);shape(p,points,['#d2a58b','#d4a570','#e6bd79','#f0ce89'][layer]);}
  for(let i=0;i<4;i++){const x=bw*(i*.31+.06),y=bh*.79;shape(p,[[x-30,y],[x-26,y-30],[x-14,y-31],[x-10,y-65],[x+25,y-65],[x+39,y],[x+50,bh]],'#c7946c55');}
  landscapeCache={cv,w,h};
 }
 const drift=Math.sin(s.d/17000)*w*.035-s.x*w*.018;c.drawImage(landscapeCache.cv,-w*.1+drift,0);
 c.save();c.globalAlpha=.4;for(let j=0;j<3;j++){const x=((s.time*4+j*w*.45)%(w*1.4))-w*.15,y=h*(.08+j*.025);for(let i=0;i<5;i++)ellipse(c,x+i*17,y-Math.sin(i)*4,26,5,'#fff8df');}c.restore();
}
