'use strict';
// Standalone Party World. Separate save key: never touches the original 70-level progress.
const levels=[
{title:'Start-Line Ramp Madness',desc:'Spring over startlijnrampen en ontwijk feestobstakels.',emoji:'🚀',length:1800},
{title:'Lucky Block-trein',desc:'Pak oneindig nieuwe Lucky Blocks; ze verschijnen steeds opnieuw.',emoji:'🎁',length:2200},
{title:'De Vier Giga-Zones',desc:'Werkbank, Pizzeria, McDonald’s en KFC: vier verrassende zones.',emoji:'🍕',length:3200},
{title:'De 5 KM Kippen-Rodeo',desc:'Bij 1 km slingerende kippen, 2 km meteorieten, checkpoint op 2,5 km en bij 3 km de REUZENKAT!',emoji:'🐔',length:5000},
{title:'De Grote Finale-Megamix',desc:'Alle feesthindernissen in één grote race, inclusief kippen en de kat!',emoji:'👑',length:5000}
];
const $=s=>document.querySelector(s), canvas=$('#game'),ctx=canvas.getContext('2d');
let chosen=0,game=null,keys={left:false,right:false},last=0,frame=0,completed=[];
try{completed=JSON.parse(localStorage.getItem('kartgo-party-jaylenn-v1')||'[]');if(!Array.isArray(completed))completed=[]}catch{completed=[]}
function unlocked(i){return i===0||completed.includes(i-1)}
function menu(){game=null;$('#stage').style.display='none';$('#menu').style.display='block';renderCards()}
function renderCards(){$('#cards').innerHTML=levels.map((l,i)=>'<button class="card '+(chosen===i?'active ':'')+(!unlocked(i)?'locked':'')+'" data-level="'+i+'"><b>'+l.emoji+'</b>Level '+(i+1)+'<small>'+l.title+(completed.includes(i)?' ★':'')+'</small></button>').join('');document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{chosen=+b.dataset.level;renderCards()});$('#descriptionTitle').textContent='Level '+(chosen+1)+' — '+levels[chosen].title;$('#description').textContent=levels[chosen].desc;$('#play').disabled=!unlocked(chosen);$('#play').textContent=unlocked(chosen)?'🏁 Start race!':'🔒 Win eerst level '+chosen;}
function random(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296}}
function init(){if(!unlocked(chosen))return;const lev=levels[chosen],rng=random(9123+chosen*301);const objects=[];for(let d=170;d<lev.length-90;d+=85+rng()*70){let type='cone';if(chosen===1)type=rng()<.48?'star':'block';else if(chosen===2||chosen===4){type=['tool','pizza','burger','fire','star','cone'][Math.floor(rng()*6)]}else if(chosen===3){type=d>2000&&d<3000?'meteor':rng()<.3?'star':'cone'}else type=rng()<.3?'star':rng()<.3?'ramp':'cone';objects.push({d,lane:Math.floor(rng()*3),type,hit:false})}
game={level:chosen,d:0,lane:1,x:1,penalty:0,score:0,speed:chosen>=3?44:36,objects,checkpoint:false,cat:false,finished:false,elapsed:0};
$('#menu').style.display='none';$('#stage').style.display='block';last=0;resize();requestAnimationFrame(loop)}
function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',()=>{if(game)resize()});
function zone(g){if(g.level!==2&&g.level!==4)return '';let f=g.d/g.level===2?0:0;const n=Math.min(3,Math.floor(g.d/(levels[g.level].length/4)));return ['🔧 WERKBANK','🍕 PIZZERIA','🍔 McDONALD’S','🔥 KFC'][n]}
function draw(){
 const g=game;if(!g)return;
 const w=canvas.clientWidth,h=canvas.clientHeight,mid=w/2,hor=h*.32;
 const sky=ctx.createLinearGradient(0,0,0,h);
 sky.addColorStop(0,'#090c39');sky.addColorStop(.35,'#5631a6');sky.addColorStop(.67,'#db59b9');sky.addColorStop(1,'#271144');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 // Neon carnival skyline, twinkling lights and fireworks.
 for(let i=0;i<65;i++){const x=((i*197.3+g.d*.035)% (w+40))-20,y=(i*53.8)%(h*.33);ctx.globalAlpha=.35+(i%4)*.14;ctx.fillStyle=i%3===0?'#ffe684':i%3===1?'#72e8ff':'#ff8ff1';ctx.beginPath();ctx.arc(x,y,1+(i%3),0,7);ctx.fill()}ctx.globalAlpha=1;
 for(let i=0;i<4;i++){const x=w*(.15+i*.24),y=h*(.08+(i%2)*.06),r=12+(i%2)*12;for(let k=0;k<12;k++){const a=k*Math.PI/6+g.elapsed*.25;ctx.strokeStyle=k%2?'#ffc7ff':'#ffed83';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.35,y+Math.sin(a)*r*.35);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke()}}
 // Carnival silhouettes and ferris wheel.
 for(let i=0;i<15;i++){let x=i*w/13-20,hh=24+(i*37)%65;ctx.fillStyle=i%2?'#2a175d':'#321e71';ctx.fillRect(x,hor-hh,w/17,hh+30);ctx.fillStyle='#ffc557';for(let k=0;k<3;k++)ctx.fillRect(x+7+k*9,hor-hh+10,3,4)}
 const fx=w*.83,fy=hor-35,fr=Math.min(90,w*.13);ctx.strokeStyle='#ff74f4';ctx.lineWidth=5;ctx.beginPath();ctx.arc(fx,fy,fr,0,7);ctx.stroke();for(let i=0;i<10;i++){let a=i*Math.PI/5+g.elapsed*.12;ctx.strokeStyle='#7bfaff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(a)*fr,fy+Math.sin(a)*fr);ctx.stroke()}
 // Road and luminous rails, lane markings with real perspective.
 ctx.beginPath();ctx.moveTo(mid-w*.065,hor);ctx.lineTo(mid+w*.065,hor);ctx.lineTo(w*1.12,h);ctx.lineTo(-w*.12,h);ctx.closePath();const asphalt=ctx.createLinearGradient(0,hor,0,h);asphalt.addColorStop(0,'#40357b');asphalt.addColorStop(.6,'#312457');asphalt.addColorStop(1,'#151b40');ctx.fillStyle=asphalt;ctx.fill();
 for(let side of [-1,1]){const xx=mid+side*w*.065,xx2=mid+side*w*.62;ctx.shadowBlur=18;ctx.shadowColor=side<0?'#35ecff':'#ff62e7';ctx.strokeStyle=side<0?'#5cfaff':'#ff79ef';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(xx,hor);ctx.lineTo(xx2,h);ctx.stroke();ctx.shadowBlur=0}
 for(let lane=1;lane<3;lane++){ctx.strokeStyle='#d9e5ff55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mid+(lane-1.5)*w*.042,hor);ctx.lineTo(mid+(lane-1.5)*w*.39,h);ctx.stroke()}
 for(let i=0;i<15;i++){let t=((i/15+g.d/155)%1),p=t*t,y=hor+(h-hor)*p;ctx.strokeStyle=i%2?'#9f4dffbb':'#57f6ff77';ctx.lineWidth=2+p*9;ctx.beginPath();ctx.moveTo(mid-w*(.065+.56*p),y);ctx.lineTo(mid+w*(.065+.56*p),y);ctx.stroke()}
 // Perspective obstacles: detailed illustrated objects.
 const icons={cone:'🚧',star:'✨',block:'🎁',tool:'🔧',pizza:'🍕',burger:'🍔',fire:'🔥',meteor:'☄️',ramp:'🚀'};
 for(const o of g.objects.filter(o=>!o.hit&&o.d>g.d&&o.d<540+g.d).sort((a,b)=>b.d-a.d)){const t=1-(o.d-g.d)/540,p=t*t,y=hor+p*(h*.67),spread=w*(.04+.38*p),x=mid+(o.lane-1)*spread*.78,size=15+55*p;ctx.save();ctx.shadowBlur=15*p;ctx.shadowColor=o.type==='star'||o.type==='block'?'#fff14b':'#ff6dce';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.font=Math.round(size)+'px system-ui';ctx.fillText(icons[o.type],x,y);ctx.restore()}
 // Party world surprises are attached to the travelled distance.
 if(g.level>=3){const d=g.d;if(d>1000&&d<1900)banner('🐍 SLANGEN-WIEBEL!',w,h);if(d>2000&&d<3000)banner('☄️ METEORENREGEN!',w,h);if(d>=3000){ctx.save();ctx.shadowColor='#ff53c8';ctx.shadowBlur=20;ctx.textAlign='center';ctx.font=Math.round(Math.min(125,48+(d-3000)/30))+'px system-ui';ctx.fillText('🐈',w*.79,hor+25);ctx.restore();banner('🐈 DE REUZENKAT!',w,h)}if(d>2500&&d<2650)banner('🏁 CHECKPOINT!',w,h)}
 if(g.level===2||g.level===4){const n=Math.min(3,Math.floor(g.d/(levels[g.level].length/4)));banner(['🔧 WERKBANK','🍕 PIZZERIA','🍔 BURGER-ZONE','🔥 KFC VUURZONE'][n],w,h)}
 if(g.level===3||g.level===4){ctx.save();ctx.shadowColor='#ffe381';ctx.shadowBlur=12;ctx.font=Math.round(Math.min(76,w*.13))+'px system-ui';ctx.textAlign='center';ctx.fillText('🐔',w*.24,h*.70);ctx.fillText('🐔',w*.76,h*.70);if(g.d<3000)ctx.fillText('🐔',w*.5,h*.59);ctx.restore()}
 // Player kart: layered wheels, chassis, helmet, glow, headlights and exhaust.
 const x=mid+(g.x-1)*w*.24,y=h*.84,sz=Math.min(w*.26,h*.25);
 ctx.save();ctx.translate(x,y);ctx.shadowBlur=24;ctx.shadowColor='#13dfff';ctx.fillStyle='#30dfff88';ctx.beginPath();ctx.ellipse(0,sz*.44,sz*.73,sz*.18,0,0,7);ctx.fill();ctx.shadowBlur=0;
 for(let side of [-1,1]){ctx.fillStyle='#090b20';ctx.beginPath();ctx.ellipse(side*sz*.52,sz*.15,sz*.22,sz*.31,0,0,7);ctx.fill();ctx.strokeStyle='#55d8ff';ctx.lineWidth=3;ctx.stroke()}
 ctx.fillStyle='#103b9d';ctx.strokeStyle='#70e9ff';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-sz*.47,-sz*.14,sz*.94,sz*.52,sz*.15);ctx.fill();ctx.stroke();
 ctx.fillStyle='#178dff';ctx.beginPath();ctx.moveTo(-sz*.36,-sz*.14);ctx.lineTo(-sz*.19,-sz*.39);ctx.lineTo(sz*.19,-sz*.39);ctx.lineTo(sz*.36,-sz*.14);ctx.closePath();ctx.fill();
 ctx.fillStyle='#fbd748';ctx.beginPath();ctx.arc(0,-sz*.45,sz*.23,0,7);ctx.fill();ctx.fillStyle='#1953bd';ctx.beginPath();ctx.arc(0,-sz*.47,sz*.21,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle='#ffe45b';ctx.font='bold '+Math.round(sz*.21)+'px system-ui';ctx.textAlign='center';ctx.fillText('★',0,sz*.17);
 for(let side of [-1,1]){ctx.fillStyle='#ff3e55';ctx.shadowColor='#ff334d';ctx.shadowBlur=12;ctx.fillRect(side*sz*.30-sz*.08,sz*.22,sz*.16,sz*.075);ctx.shadowBlur=0}ctx.restore();
 if(g.penalty>0){ctx.fillStyle='#ad0b45e6';ctx.fillRect(0,h*.44,w,56);ctx.fillStyle='white';ctx.textAlign='center';ctx.font='bold 21px system-ui';ctx.fillText('💥 6 SECONDEN STRAF: '+Math.ceil(g.penalty)+' s',mid,h*.49)}
 $('#raceName').textContent='🎉 Level '+(g.level+1);$('#distance').textContent=Math.min(levels[g.level].length,Math.floor(g.d))+' / '+levels[g.level].length+' m';$('#penalty').textContent=g.penalty>0?'⏳ '+Math.ceil(g.penalty)+' s':'🏎️ Vol gas';$('#score').textContent='✨ '+g.score;
}
function banner(t,w,h){ctx.save();ctx.textAlign='center';ctx.shadowColor='#f52bff';ctx.shadowBlur=10;ctx.fillStyle='#fff4ac';ctx.font='bold '+Math.max(13,Math.min(21,w/21))+'px system-ui';ctx.fillText(t,w/2,h*.17);ctx.restore()}
function loop(now){if(!game)return;let dt=last?Math.min(.05,(now-last)/1000):0;last=now;const g=game;if(!g.finished){g.elapsed+=dt;if(g.penalty>0)g.penalty=Math.max(0,g.penalty-dt);else{if(keys.left)g.x-=dt*2.2;if(keys.right)g.x+=dt*2.2;g.x=Math.max(0,Math.min(2,g.x));let old=g.d;g.d+=g.speed*dt;for(const o of g.objects){if(!o.hit&&o.d>=old&&o.d<g.d+6&&Math.abs(g.x-o.lane)<.34){o.hit=true;if(o.type==='star'||o.type==='block'){g.score+=o.type==='block'?50:20}else if(o.type==='ramp'){g.score+=10}else{g.penalty=6;g.score=Math.max(0,g.score-10);break}}}if(g.d>=levels[g.level].length){g.d=levels[g.level].length;g.finished=true;complete()}}}draw();if(game)requestAnimationFrame(loop)}
function complete(){const g=game;if(!g)return;if(!completed.includes(g.level))completed.push(g.level);try{localStorage.setItem('kartgo-party-jaylenn-v1',JSON.stringify(completed))}catch{}setTimeout(()=>{if(!game)return;alert('🏆 GEWONNEN! Level '+(g.level+1)+' gehaald! ✨ '+g.score+' punten.');chosen=Math.min(4,g.level+1);menu()},100)}
function bind(id,key){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true;try{el.setPointerCapture(e.pointerId)}catch{}});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>keys[key]=false)}
bind('#left','left');bind('#right','right');window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=true;if(e.key==='ArrowRight'||e.key==='d')keys.right=true});window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=false;if(e.key==='ArrowRight'||e.key==='d')keys.right=false});window.addEventListener('blur',()=>{keys.left=keys.right=false});
$('#play').onclick=init;$('#restart').onclick=init;$('#back').onclick=menu;renderCards();
