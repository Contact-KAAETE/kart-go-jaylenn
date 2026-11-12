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
function draw(){const g=game;if(!g)return;const w=canvas.clientWidth,h=canvas.clientHeight;const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#271066');sky.addColorStop(.52,'#7344c9');sky.addColorStop(1,'#ed6cd1');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
for(let i=0;i<30;i++){const x=(i*137+Math.sin(i*5)*55)%w,y=(i*61)%(h*.56);ctx.fillStyle=i%2?'#ffef7b':'#6ef4ff';ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,7);ctx.fill()}
const horizon=h*.32;ctx.fillStyle='#37277b';for(let i=0;i<9;i++){let x=i*w/8-20;ctx.fillRect(x,horizon-25-(i%3)*25,w/12,80)}
ctx.beginPath();ctx.moveTo(w*.43,horizon);ctx.lineTo(w*.57,horizon);ctx.lineTo(w*1.1,h);ctx.lineTo(-w*.1,h);ctx.closePath();ctx.fillStyle='#30265e';ctx.fill();
ctx.strokeStyle='#f5e5ff';ctx.lineWidth=5;for(let k=0;k<=3;k++){const near=w*(.12+k*.25),far=w*(.44+k*.04);ctx.beginPath();ctx.moveTo(far,horizon);ctx.lineTo(near,h);ctx.stroke()}
for(let i=0;i<11;i++){let t=((i/11+g.d/120)%1);let y=horizon+(h-horizon)*t*t;ctx.strokeStyle=i%2?'#ffb2fd':'#5eeeff';ctx.lineWidth=2+t*8;ctx.beginPath();ctx.moveTo(w*(.43-.5*t),y);ctx.lineTo(w*(.57+.5*t),y);ctx.stroke()}
const visible=g.objects.filter(o=>!o.hit&&o.d>g.d&&o.d<g.d+520).sort((a,b)=>b.d-a.d);
for(const o of visible){const t=1-(o.d-g.d)/520,p=t*t,y=horizon+p*(h*.68),width=(.10+.55*p)*w,xx=w/2+(o.lane-1)*width*.52;ctx.font=Math.round(15+48*p)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='bottom';const sym={cone:'🚧',star:'✨',block:'🎁',tool:'🔧',pizza:'🍕',burger:'🍔',fire:'🔥',meteor:'☄️',ramp:'🚀'}[o.type];ctx.fillText(sym,xx,y)}
if(g.level>=3){const dist=g.d;if(dist>1000&&dist<1900){ctx.fillStyle='#ffdb52';ctx.font='bold 20px system-ui';ctx.fillText('🐍 SLANGEN-WIEBEL!',w/2,h*.18)}if(dist>2000&&dist<3000){ctx.font='bold 20px system-ui';ctx.fillText('☄️ METEOREN!',w/2,h*.18)}if(dist>=3000){ctx.font=Math.round(Math.min(110,35+(dist-3000)/35))+'px system-ui';ctx.fillText('🐈',w*.72,h*.3);ctx.font='bold 18px system-ui';ctx.fillText('REUZENKAT!',w*.72,h*.1)}if(dist>2500&&dist<2650){ctx.font='bold 18px system-ui';ctx.fillText('🏁 CHECKPOINT!',w/2,h*.22)}}
if(g.level===3||g.level===4){ctx.font='45px system-ui';ctx.fillText('🐔',w*.25,h*.72);ctx.fillText('🐔',w*.75,h*.72);if(g.d<3000){ctx.fillText('🐔',w*.5,h*.62)}}
const playerX=w/2+(g.x-1)*w*.24;ctx.font=Math.round(Math.min(95,w*.19))+'px system-ui';ctx.textAlign='center';ctx.fillText('🏎️',playerX,h*.91);
if(g.penalty>0){ctx.fillStyle='#a90035d9';ctx.fillRect(0,h*.43,w,58);ctx.fillStyle='white';ctx.font='bold 22px system-ui';ctx.fillText('💥 STRAF: '+Math.ceil(g.penalty)+' SECONDEN',w/2,h*.49)}
$('#raceName').textContent='🎉 Level '+(g.level+1);$('#distance').textContent=Math.min(levels[g.level].length,Math.floor(g.d))+' / '+levels[g.level].length+' m';$('#penalty').textContent=g.penalty>0?'⏳ '+Math.ceil(g.penalty)+' s':'🏎️ Vol gas';$('#score').textContent='✨ '+g.score;
}
function loop(now){if(!game)return;let dt=last?Math.min(.05,(now-last)/1000):0;last=now;const g=game;if(!g.finished){g.elapsed+=dt;if(g.penalty>0)g.penalty=Math.max(0,g.penalty-dt);else{if(keys.left)g.x-=dt*2.2;if(keys.right)g.x+=dt*2.2;g.x=Math.max(0,Math.min(2,g.x));let old=g.d;g.d+=g.speed*dt;for(const o of g.objects){if(!o.hit&&o.d>=old&&o.d<g.d+6&&Math.abs(g.x-o.lane)<.34){o.hit=true;if(o.type==='star'||o.type==='block'){g.score+=o.type==='block'?50:20}else if(o.type==='ramp'){g.score+=10}else{g.penalty=6;g.score=Math.max(0,g.score-10);break}}}if(g.d>=levels[g.level].length){g.d=levels[g.level].length;g.finished=true;complete()}}}draw();if(game)requestAnimationFrame(loop)}
function complete(){const g=game;if(!g)return;if(!completed.includes(g.level))completed.push(g.level);try{localStorage.setItem('kartgo-party-jaylenn-v1',JSON.stringify(completed))}catch{}setTimeout(()=>{if(!game)return;alert('🏆 GEWONNEN! Level '+(g.level+1)+' gehaald! ✨ '+g.score+' punten.');chosen=Math.min(4,g.level+1);menu()},100)}
function bind(id,key){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true;try{el.setPointerCapture(e.pointerId)}catch{}});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>keys[key]=false)}
bind('#left','left');bind('#right','right');window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=true;if(e.key==='ArrowRight'||e.key==='d')keys.right=true});window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.left=false;if(e.key==='ArrowRight'||e.key==='d')keys.right=false});window.addEventListener('blur',()=>{keys.left=keys.right=false});
$('#play').onclick=init;$('#restart').onclick=init;$('#back').onclick=menu;renderCards();
