
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const names=['Groene start','Madeliefjespad','Klaverbocht','Houten hekjes','Heuvelpret','Windmolenweg','Bloemenbocht','Kronkelgras','Zonnedal','Kikkerplas','Bosrand','Dubbele bocht','Hooibalenpad','Heuvelsprint','Klaverveld','Bochtenfeest','Grasstorm','Laatste sprint','Grote aanloop','Hotdog-finale'];
const icons=['⚡','🌀','🚀','🍌','🦘'], itemNames=['Onweer','Hypnose','Boost','Banaan','Jump'];
const STORAGE_KEY='kartgo-jaylenn-v1';
const DEFAULTS={wins:[],best:{},mode:'buttons',auto:true,sound:false,assist:true,sensitivity:'normal',controlsVersion:3,quality:'auto',session:null};
function cleanProgress(source={}){
 const p=source&&typeof source==='object'&&!Array.isArray(source)?source:{};
 const result={...DEFAULTS,wins:[],best:{}};
 result.wins=[...new Set(Array.isArray(p.wins)?p.wins.filter(n=>Number.isInteger(n)&&n>=1&&n<=20):[])];
 if(p.best&&typeof p.best==='object')for(let i=1;i<=20;i++)if(Number.isFinite(p.best[i])&&p.best[i]>0)result.best[i]=p.best[i];
 result.mode=['buttons','wheel','joystick'].includes(p.mode)?p.mode:'buttons';
 for(const key of ['auto','sound','assist'])if(typeof p[key]==='boolean')result[key]=p[key];
 if(['calm','normal','direct'].includes(p.sensitivity))result.sensitivity=p.sensitivity;
 if(['auto','high','low'].includes(p.quality))result.quality=p.quality;
 if(p.session&&p.session.version===3&&Number.isInteger(p.session.level)&&p.session.level>=1&&p.session.level<=20&&Number.isFinite(p.session.d)&&p.session.d>=0&&p.session.d<104000)result.session=p.session;
 return result;
}
let saved={...DEFAULTS,wins:[],best:{}},storageAvailable=true;
try{
 const raw=localStorage.getItem(STORAGE_KEY);
 if(raw){if(!localStorage.getItem(STORAGE_KEY+'-backup-before-v3'))localStorage.setItem(STORAGE_KEY+'-backup-before-v3',raw);saved=cleanProgress(JSON.parse(raw));}
}catch{storageAvailable=false;}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));storageAvailable=true;return true;}catch{storageAvailable=false;return false;}}
function checkpoint(){
 if(!state||state.finished)return;
 const keys=['level','d','x','speed','time','inventory','boost','jump','freeze','slow','nextShot','opponents','blocks','shots','bananas','obstacles'];
 const session={version:3};for(const key of keys)session[key]=JSON.parse(JSON.stringify(state[key]));
 saved.session=session;persist();
}
function renderResume(){const b=$('#resumeRace');b.classList.toggle('hidden',!saved.session);if(saved.session){b.textContent=`Hervat race · level ${saved.session.level}`;b.onclick=()=>start(saved.session.level,saved.session);}}
$('#exportProgress').onclick=()=>{
 checkpoint();const payload={format:'kart-go-progress',version:3,created:new Date().toISOString(),...cleanProgress(saved)};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='Kart_Go_voortgang.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('#importProgress').onclick=()=>$('#progressFile').click();
$('#progressFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>300000)throw new Error();const source=JSON.parse(await file.text());
  if(!Array.isArray(source.wins)||!source.best||typeof source.best!=='object')throw new Error();
  const incoming=cleanProgress(source);saved.wins=[...new Set([...saved.wins,...incoming.wins])];
  for(const key of Object.keys(incoming.best))saved.best[key]=Math.min(saved.best[key]||Infinity,incoming.best[key]);
  if(!saved.session&&incoming.session)saved.session=incoming.session;
  persist();renderMap();showModal('<h2>Je voortgang staat klaar.</h2><p>Je ingelezen en bestaande overwinningen zijn samengevoegd.</p>');
 }catch{showModal('<h2>Dit bestand lukt niet.</h2><p>Kies een voortgangsbestand dat je in Kart Go hebt bewaard.</p>');}
 e.target.value='';
});

let audioCtx;
function beep(freq=500,dur=.09,type='sine',vol=.06){if(!saved.sound)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>{});const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime);g.gain.setValueAtTime(vol,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur);}catch{}}
function soundLabel(){$('#sound').textContent=saved.sound?'♫':'♪';$('#sound').setAttribute('aria-label',saved.sound?'Geluid uitzetten':'Geluid aanzetten');$('#sound').style.opacity=saved.sound?'1':'.55';}
$('#sound').onclick=()=>{saved.sound=!saved.sound;persist();soundLabel();beep();};soundLabel();
const modal=$('#modal');function showModal(html){$('#modalBody').innerHTML=html;if(!modal.open)modal.showModal();}function closeModal(){modal.close();}$('#closeModal').onclick=()=>{if(state?.finished)backMap();else if(state?.paused)resume();else closeModal();};modal.addEventListener('cancel',e=>{if(state?.finished){e.preventDefault();backMap();}else if(state?.paused){e.preventDefault();resume();}});
function help(){showModal(`<span class="eyebrow">KLAAR VOOR DE START?</span><h2>Racen is zo geleerd.</h2><p>Stuur met je linkerduim en blijf op het asfalt. Met autogas rijd je vanzelf. Rem staat links en gas rechts; tik op ‘wissel’ voor een stuurwiel of joystick. Op een computer: pijltjes of WASD.</p><div class="tip">Pak de zwevende Lucky Blocks. Tik op een gevuld vakje om een power-up te gebruiken (toetsen 1, 2, 3). Je hebt drie vakjes. Win om het volgende level te openen.</div><div class="items-guide"><div>⚡ Onweer · 50%<small>Remt alle tegenstanders af.</small></div><div>🌀 Hypnose · 20%<small>Laat de kart vóór je slingeren.</small></div><div>🚀 Boost · 15%<small>Vier seconden extra snelheid.</small></div><div>🍌 Banaan · 10%<small>Leg een schil achter je neer.</small></div><div>🦘 Jump · 5%<small>Spring over ijs en bananen.</small></div></div><p>De nood-balk waarschuwt voor gevaar achter je. In level 20 schiet de hotdog-hond elke 10 seconden een ijsblok. Geraakt? Twee seconden bevroren!</p><button class="primary" id="helpDone">Begrepen! ›</button>`);$('#helpDone').onclick=closeModal;}
$('#how').onclick=help;
function settings(){showModal(`<span class="eyebrow">MAAK HET JOUW RACE</span><h2>Kies je besturing.</h2><p>Gas staat rechts en rem links. Het stuur staat ertussen. Autogas helpt je om alleen op sturen te letten.</p>${[['wheel','◉ Autowiel','Sleep het stuur naar links of rechts.'],['buttons','◀ ▶ Knoppen','Houd een pijl ingedrukt.'],['joystick','🟢 Groene joystick','Sleep de groene knop naar links of rechts.']].map(([v,n,d])=>`<button class="choice ${saved.mode===v?'selected':''}" data-mode="${v}"><span><b>${n}</b><small style="display:block;margin-top:5px;color:#6c7e65">${d}</small></span><span>${saved.mode===v?'✓':''}</span></button>`).join('')}<button class="choice" id="autoSetting"><span>Autogas</span><b>${saved.auto?'Aan ✓':'Uit'}</b></button><button class="choice" id="assistSetting"><span>Hulp langs de baanrand</span><b>${saved.assist?'Aan ✓':'Uit'}</b></button><button class="choice" id="sensitivitySetting"><span>Stuurgevoeligheid</span><b>${{calm:'Rustig',normal:'Normaal',direct:'Direct'}[saved.sensitivity]||'Normaal'}</b></button><button class="choice" id="qualitySetting"><span>Beeldkwaliteit</span><b>${{auto:'Automatisch',high:'Hoog',low:'Licht'}[saved.quality]}</b></button><p class="saved-note">Je keuze en voortgang blijven op dit apparaat bewaard.</p><button class="primary" id="settingDone">Klaar ›</button>`);$$('[data-mode]').forEach(b=>b.onclick=()=>{saved.mode=b.dataset.mode;persist();settings();});$('#autoSetting').onclick=()=>{saved.auto=!saved.auto;persist();settings();};$('#assistSetting').onclick=()=>{saved.assist=!saved.assist;persist();settings();};$('#sensitivitySetting').onclick=()=>{const a=['calm','normal','direct'];saved.sensitivity=a[(a.indexOf(saved.sensitivity)+1)%3];persist();settings();};$('#qualitySetting').onclick=()=>{const modes=['auto','high','low'];saved.quality=modes[(modes.indexOf(saved.quality)+1)%3];applyQuality(saved.quality==='low'?0:2);persist();settings();};$('#settingDone').onclick=closeModal;}
$('#settings').onclick=settings;
function renderMap(){const won=new Set(saved.wins),next=Array.from({length:20},(_,i)=>i+1).find(n=>!won.has(n))||20;$('#progressText').textContent=`${won.size} / 20 gewonnen`;$('#levels').innerHTML=names.map((name,i)=>{const n=i+1,open=n===1||won.has(n-1)||won.has(n);return `<button class="level ${won.has(n)?'won':n===next?'next':''} ${!open?'locked':''} ${n===20?'boss':''}" data-level="${n}" aria-label="Level ${n}: ${name}${!open?', vergrendeld':''}"><span class="star">${won.has(n)?'★':!open?'🔒':''}</span><b>${n===20?'🌭':String(n).padStart(2,'0')}</b><small>${name}</small></button>`;}).join('');$$('[data-level]').forEach(b=>b.onclick=()=>{const n=+b.dataset.level;if(n>1&&!won.has(n-1)&&!won.has(n)){showModal(`<h2>Nog even racen!</h2><p>Win eerst level ${n-1} om ${names[n-1]} te openen. Eerdere levels kun je altijd opnieuw spelen.</p><button class="primary" id="lockedDone">Terug naar de kaart</button>`);$('#lockedDone').onclick=closeModal;return;}start(n);});$('#play').onclick=()=>start(next);renderResume();}
renderMap();
const canvas=$('#game'),ctx=canvas.getContext('2d',{alpha:false}),art=$('#art'),ac=art.getContext('2d');let W=0,H=0,DPR=1,state=null,last=0,toastTimer;const SEG=200,COUNT=260,LENGTH=SEG*COUNT,MAX=2650,LAPS=2;const quality={level:saved.quality==='low'?0:2,dpr:saved.quality==='low'?1:Math.min(devicePixelRatio||1,1.75),frames:0,elapsed:0};const view={horizon:0,playerY:0,cameraOffset:1050};
function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function kart(c,x,y,s,color='#f66545',dog=false,steer=0){
 if(s<.015)return;c.save();c.translate(x,y);c.scale(s,s);c.rotate(steer*.055);
 const tick=performance.now()/95;
 ellipse(c,3,7,60,14,'#153d3033');
 function tire(xx,yy,front){c.save();c.translate(xx,yy);if(front)c.rotate(steer*.13);rr(c,-10,-18,20,36,6,'#25382d');rr(c,-8,-16,6,31,3,'#506052');c.strokeStyle='#83937c';c.lineWidth=1.3;for(let i=0;i<4;i++){const ty=((i*10+tick*8)%35)-17;c.beginPath();c.moveTo(-6,ty);c.lineTo(6,ty+2);c.stroke();}c.restore();}
 tire(-37,-52,true);tire(37,-52,true);tire(-47,-11,false);tire(47,-11,false);
 if(dog){
  rr(c,-41,-77,82,80,28,gradient(c,-41,0,41,0,[[0,'#dca052'],[.45,'#ffe0a0'],[1,'#c58c40']]));
  rr(c,-28,-86,56,86,22,gradient(c,-28,-80,28,0,[[0,'#bd7451'],[.5,'#a64d39'],[1,'#823e32']]));
  c.strokeStyle='#f6d64c';c.lineWidth=6;c.lineCap='round';c.beginPath();for(let i=0;i<8;i++){const p=[i%2?13:-13,-76+i*9];i?c.lineTo(...p):c.moveTo(...p);}c.stroke();
  const bob=Math.sin(tick*.7)*2;
  ellipse(c,-24,-84+bob,12,28,'#71472e');ellipse(c,24,-84+bob,12,28,'#71472e');
  ellipse(c,0,-91,25,29,gradient(c,-25,-120,25,-65,[[0,'#dca364'],[.5,'#b37644'],[1,'#8c5937']]));
  ellipse(c,-9,-98,5,6,'#fff9df');ellipse(c,9,-98,5,6,'#fff9df');ellipse(c,-8,-97,2.5,3.4,'#29352c');ellipse(c,10,-97,2.5,3.4,'#29352c');
  ellipse(c,0,-82,16,11,'#e2b77b');ellipse(c,0,-87,6,4,'#3f3b2b');c.strokeStyle='#724d30';c.lineWidth=2;c.beginPath();c.arc(0,-80,8,0,Math.PI);c.stroke();ellipse(c,5,-73,5,8,'#f1968b');
  rr(c,-23,-4,46,7,3,'#c65d43');
 }else{
  rr(c,-36,-61,72,66,16,gradient(c,-36,-60,36,5,[[0,'#fff1bf'],[.09,color],[.7,color],[1,'#b64737']]));
  rr(c,-25,-76,50,27,12,color);rr(c,-22,-71,44,6,3,'#fff2cd');
  rr(c,-20,-43,40,29,7,'#294a38');rr(c,-15,-37,30,19,5,'#476451');
  ellipse(c,0,-61,18,21,'#f1c385');ellipse(c,0,-74,23,17,gradient(c,-20,-87,23,-61,[[0,'#fffce8'],[.7,'#f6e6ae'],[1,'#c7b883']]));
  rr(c,-21,-77,42,9,4,'#306b4c');rr(c,-16,-75,32,3,2,'#80ad7e');
  rr(c,-31,-8,62,10,4,'#edeac9');rr(c,-26,-14,12,5,2,'#f5bc6b');rr(c,14,-14,12,5,2,'#f5bc6b');
  c.strokeStyle='#fff5cb88';c.lineWidth=2;c.beginPath();c.moveTo(-32,-48);c.lineTo(-28,-24);c.moveTo(31,-49);c.lineTo(27,-24);c.stroke();
 }
 c.restore();
}

function tree(c,x,y,s){c.fillStyle='#83684a';c.fillRect(x-3*s,y-30*s,6*s,33*s);ellipse(c,x,y-46*s,24*s,28*s,'#427f3d');ellipse(c,x-12*s,y-37*s,18*s,20*s,'#548f3c');ellipse(c,x+9*s,y-54*s,15*s,19*s,'#6ba344');}
function drawArt(){const r=art.getBoundingClientRect();if(!r.width)return;art.width=r.width*2;art.height=r.height*2;ac.setTransform(2,0,0,2,0,0);const w=r.width,h=r.height;let grad=ac.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#c9e7bd');grad.addColorStop(1,'#eff3bc');ac.fillStyle=grad;ac.fillRect(0,0,w,h);ellipse(ac,w*.79,h*.2,29,29,'#fff9b5');ellipse(ac,w*.3,h*.6,w*.65,h*.36,'#a9ce80');ellipse(ac,w*.95,h*.64,w*.6,h*.37,'#90bd65');ellipse(ac,w*.4,h*.96,w*.8,h*.4,'#7dac50');ac.beginPath();ac.moveTo(w*.15,h);ac.bezierCurveTo(w*1.3,h*.34,-w*.3,h*.58,w*.65,h*.32);ac.lineTo(w*.73,h*.32);ac.bezierCurveTo(-w*.12,h*.61,w*1.6,h*.34,w*.75,h);ac.closePath();ac.fillStyle='#efdfac';ac.fill();ac.strokeStyle='#fff8da';ac.lineWidth=2;ac.setLineDash([10,10]);ac.beginPath();ac.moveTo(w*.45,h);ac.bezierCurveTo(w*1.4,h*.35,-w*.2,h*.59,w*.69,h*.32);ac.stroke();ac.setLineDash([]);tree(ac,w*.1,h*.6,.9);tree(ac,w*.87,h*.53,.75);tree(ac,w*.97,h*.7,.8);tree(ac,w*.17,h*.8,.5);for(let i=0;i<23;i++){let x=(i*47+21)%w,y=h*.65+(i*37)%(h*.32);ellipse(ac,x,y,2,2,i%2?'#f9f3c1':'#fff');}if(sceneryCache.size){drawScenic(ac,'mill',w*.83,h*.50,.27);drawScenic(ac,'barn',w*.16,h*.57,.24);drawScenic(ac,'flowers',w*.18,h*.81,.37);drawScenic(ac,'blossom',w*.94,h*.72,.24);}kart(ac,w*.67,h*.58,1.05,'',true,-1);kart(ac,w*.42,h*.84,1.6,'#f66b49',false,-.4);ac.save();ac.translate(w*.29,h*.49);ac.rotate(-.15);rr(ac,-16,-16,32,32,6,'#f8d858','#fff7c1');ac.fillStyle='#fff9db';ac.font='bold 25px sans-serif';ac.textAlign='center';ac.fillText('?',0,9);ac.restore();}
function resize(){
 const wasRacing=state&&!state.paused&&!state.finished;
 const changed=W>0&&(Math.abs(W-innerWidth)>40||Math.abs(H-innerHeight)>120);
 W=innerWidth;H=window.visualViewport?.height||innerHeight;DPR=Math.min(devicePixelRatio||1,quality.dpr);
 canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
 const top=$('#controls').getBoundingClientRect().top;
 view.horizon=H*(W/H<.8?.34:.32);view.playerY=Math.min(H*.83,top>0?top-13:H*.8);
 view.cameraOffset=.9*900*H*.62/Math.max(H*.22,view.playerY-view.horizon);
 landscapeCache=null;drawArt();if(changed&&wasRacing){resetInput();pause();}
}
window.addEventListener('resize',resize);buildScenery(1);resize();
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2100);}
function modeUI(){const mode=saved.mode;$('#wheel').classList.toggle('hidden',mode!=='wheel');$('#left').classList.toggle('hidden',mode!=='buttons');$('#right').classList.toggle('hidden',mode!=='buttons');$('#joystick').classList.toggle('hidden',mode!=='joystick');$('#auto').classList.toggle('active',saved.auto);$('#auto').textContent=`AUTOGAS ${saved.auto?'AAN':'UIT'}`;$('#modeSwitch').textContent=({wheel:'Stuurwiel',buttons:'Stuurknoppen',joystick:'Joystick'}[mode])+' · wissel';}
function trackProfile(level){
 const stage=Math.min(3,Math.floor((level-1)/5));
 return{stage,difficulty:Math.round(3+(level-1)/19*26),bend:.36+level*.038,hill:45+stage*70+(level%5)*12,theme:['meadow','farm','forest','valley'][stage]};
}
function trackFeatures(level){
 const features=[];
 if(level>=4){const from=35+(level*7)%35;features.push({kind:'bridge',from,to:from+20});}
 if(level>=8){const from=142+(level*3)%28;features.push({kind:'tunnel',from,to:from+21});}
 return features;
}
function surfaceAt(index){const i=(index%COUNT+COUNT)%COUNT;return state?.features?.find(f=>i>=f.from&&i<=f.to)?.kind||'road';}
function makeObstacles(level,rand){
 if(level<6)return[];const count=2+Math.floor((level-6)/5)*2;
 return Array.from({length:count},(_,i)=>({d:11500+i*(LENGTH-15000)/count+(rand()-.5)*1000,x:[-.64,0,.64][Math.floor(rand()*3)],kind:i%3===1?'puddle':'cone',hitLap:-1}));
}
function addEffect(type){if(state){state.effects??=[];state.effects.push({type,age:0,life:type==='lightning'?.45:.8});state.effects=state.effects.slice(-12);}}

function seedRandom(seed){let s=seed;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function start(level,session=null){closeModal();resetInput();const rand=seedRandom(level*39871),profile=trackProfile(level),curves=[];for(let i=0;i<COUNT;i++){const phase=i/COUNT*Math.PI*2;curves.push((Math.sin(phase*(level<3?2:3)+level*.25)*1.7+Math.sin(phase*5)*.45)*profile.bend);}const boss=level===20,blocks=[];const amount=boss?9:10;for(let i=0;i<amount;i++)blocks.push({d:3500+i*(LENGTH-6000)/amount+(rand()-.5)*1000,x:(rand()-.5)*1.25,lap:-1});state={level,boss,profile,features:trackFeatures(level),obstacles:makeObstacles(level,rand),effects:[],impact:0,curves,blocks,opponents:Array.from({length:boss?1:3},(_,i)=>({d:(boss?1700:500)+i*650,x:[-.52,.08,.58][i],target:0,speed:MAX*(.70+profile.difficulty*.0058+i*.01),slow:0,hyp:0,color:['#f2b933','#719dd4','#cb81ac'][i],boss})),d:0,x:0,speed:0,time:0,count:3.3,inventory:[null,null,null],boost:0,jump:0,freeze:0,slow:0,paused:false,finished:false,shots:[],bananas:[],particles:[],nextShot:10,bossWarning:0,hitFlash:0,rank:1};$('#home').classList.add('hidden');$('#race').classList.remove('hidden');$('#levelLabel').textContent=`LEVEL ${String(level).padStart(2,'0')} · BOTS ${profile.difficulty}%`;$('#trackLabel').textContent=names[level-1];$('#danger').classList.add('hidden');$('#toast').classList.remove('show');$('#countdown').textContent='3';state.rank=state.opponents.length+1;$('#position').innerHTML=`${state.rank}<span>/${state.opponents.length+1}</span>`;$('#lap').innerHTML='1<span>/2</span>';$('#time').textContent='0:00';$('#speed').textContent='0';state.steer=0;state.checkpointAt=0;if(session)restoreSession(session);saved.session=null;buildScenery(level);modeUI();renderInventory();resize();beep(320,.2);}
function renderInventory(){$('#inventory').innerHTML=state.inventory.map((item,i)=>`<button class="slot ${item===null?'empty':''}" aria-label="${item===null?'Leeg vak':itemNames[item]+' gebruiken'}" data-slot="${i}">${item===null?'+':icons[item]}<small>${i+1}</small></button>`).join('');$$('[data-slot]').forEach(b=>b.onclick=()=>useItem(+b.dataset.slot));}
function randomItem(){const v=Math.random()*100;return v<50?0:v<70?1:v<85?2:v<95?3:4;}
function useItem(slot){const s=state;if(!s||s.paused||s.finished||s.count>0)return;const item=s.inventory[slot];if(!Number.isInteger(slot)||slot<0||slot>2||!Number.isInteger(item)||item<0||item>4)return;let msg='';if(item===0){s.opponents.forEach(o=>o.slow=3);s.hitFlash=.16;addEffect('lightning');msg='⚡ Onweer! Iedereen remt af.';}if(item===1){const target=s.opponents.filter(o=>o.d>s.d).sort((a,b)=>a.d-b.d)[0];if(target){target.hyp=4;target.slow=2;msg='🌀 Je tegenstander slingert!';}else{msg='🌀 Niemand vóór je. Bewaar hem!';toast(msg);return;}}if(item===2){s.boost=4;addEffect('boost');msg='🚀 Vier seconden boost!';}if(item===3){s.bananas.push({d:s.d-450,x:s.x,owner:'player'});msg='🍌 Banaan achter je!';}if(item===4){s.jump=1.4;addEffect('jump');msg='🦘 Daar ga je!';}s.inventory[slot]=null;renderInventory();toast(msg);beep(item===0?130:780,.15,'triangle');}
// Pointer ownership prevents a second finger or an unrelated release clearing another control.
const input={left:false,right:false,gas:false,brake:false,analog:0};
const activePointers=new Map(), heldKeys=new Set(), controllerResets=[];
const keyMap={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'gas',w:'gas',W:'gas',ArrowDown:'brake',s:'brake',S:'brake',' ':'brake'};
function syncInput(){
 for(const key of ['left','right','gas','brake'])input[key]=[...heldKeys].some(k=>keyMap[k]===key)||[...activePointers.values()].some(p=>p.key===key);
}
function releasePointer(id){
 const p=activePointers.get(id);if(!p)return;
 activePointers.delete(id);if(p.release)p.release();
 if(![...activePointers.values()].some(o=>o.el===p.el))p.el.classList.remove('pressed');
 try{if(p.el.hasPointerCapture?.(id))p.el.releasePointerCapture(id);}catch{}
 syncInput();
}
function resetInput(){
 for(const id of [...activePointers.keys()])releasePointer(id);
 activePointers.clear();heldKeys.clear();controllerResets.forEach(fn=>fn());
 Object.assign(input,{left:false,right:false,gas:false,brake:false,analog:0});
 $$('.pressed').forEach(e=>e.classList.remove('pressed'));
}
function validPointer(e){return state&&!state.finished&&!state.paused&&(e.pointerType!=='mouse'||e.button===0);}
function capture(el,e){try{el.setPointerCapture(e.pointerId);}catch{}el.classList.add('pressed');}
function hold(id,key){
 const el=$(id);
 el.addEventListener('pointerdown',e=>{if(!validPointer(e)||activePointers.has(e.pointerId))return;e.preventDefault();activePointers.set(e.pointerId,{el,key});capture(el,e);syncInput();});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>releasePointer(e.pointerId));
 el.addEventListener('contextmenu',e=>e.preventDefault());
}
for(const [id,key] of [['#left','left'],['#right','right'],['#gas','gas'],['#brake','brake']])hold(id,key);
function analog(id,isWheel){
 const el=$(id);let pointer=null,originX=0;
 const reset=()=>{pointer=null;input.analog=0;el.style.transform='';el.setAttribute('aria-valuenow','0');$('#joystick i').style.transform='';};
 controllerResets.push(reset);
 function move(e){
  if(e.pointerId!==pointer)return;e.preventDefault();const r=el.getBoundingClientRect();
  const range=isWheel?Math.max(45,r.width*.58):r.width*.32;
  const raw=clamp((e.clientX-originX)/range,-1,1),value=Math.abs(raw)<.045?0:Math.sign(raw)*(Math.abs(raw)-.045)/.955;
  input.analog=value;el.setAttribute('aria-valuenow',String(Math.round(value*100)));
  if(isWheel)el.style.transform=`rotate(${value*72}deg)`;else $('#joystick i').style.transform=`translateX(${value*range}px)`;
 }
 el.addEventListener('pointerdown',e=>{
  if(!validPointer(e)||pointer!==null||activePointers.has(e.pointerId))return;e.preventDefault();
  pointer=e.pointerId;const r=el.getBoundingClientRect();originX=isWheel?e.clientX:r.left+r.width/2;
  activePointers.set(e.pointerId,{el,key:'analog',release:reset});capture(el,e);move(e);
 });
 el.addEventListener('pointermove',move);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>releasePointer(e.pointerId));
 el.addEventListener('contextmenu',e=>e.preventDefault());
}
analog('#wheel',true);analog('#joystick',false);
window.addEventListener('pointerup',e=>releasePointer(e.pointerId));
window.addEventListener('pointercancel',e=>releasePointer(e.pointerId));
$('#modeSwitch').onclick=()=>{resetInput();const modes=['buttons','wheel','joystick'];saved.mode=modes[(modes.indexOf(saved.mode)+1)%3];persist();modeUI();};
$('#auto').onclick=()=>{saved.auto=!saved.auto;persist();modeUI();};
window.addEventListener('keydown',e=>{
 if(!state||state.finished||modal.open&&!state.paused)return;
 if(keyMap[e.key]){e.preventDefault();heldKeys.add(e.key);syncInput();}
 if(['1','2','3'].includes(e.key)&&!e.repeat)useItem(+e.key-1);
 if((e.key==='Escape'||e.key==='p')&&!e.repeat){e.preventDefault();state.paused?resume():pause();}
});
window.addEventListener('keyup',e=>{heldKeys.delete(e.key);syncInput();});
window.addEventListener('blur',()=>{if(state&&!state.finished&&!state.paused)pause();resetInput();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(state&&!state.finished&&!state.paused)pause();checkpoint();resetInput();}});
window.addEventListener('pagehide',()=>{checkpoint();resetInput();});

function pause(){if(!state||state.finished)return;state.paused=true;checkpoint();resetInput();showModal(`<span class="eyebrow">EVEN UITROLLEN</span><h2>Motor op pauze.</h2><p>Je race staat voor je klaar.</p><div class="result-actions"><button class="primary" id="resume">Verder racen ›</button><button class="secondary" id="retry">Opnieuw</button><button class="secondary" id="backMap">Wereldkaart</button></div>`);$('#resume').onclick=resume;$('#retry').onclick=()=>start(state.level);$('#backMap').onclick=backMap;}
function resume(){closeModal();if(state)state.paused=false;resetInput();}$('#pause').onclick=pause;
function backMap(){checkpoint();state=null;closeModal();$('#race').classList.add('hidden');$('#home').classList.remove('hidden');renderMap();resize();}
function finish(){const s=state;if(s.finished)return;s.finished=true;s.speed=0;saved.session=null;resetInput();const rank=1+s.opponents.filter(o=>o.d>s.d).length,won=rank===1;if(won){if(!saved.wins.includes(s.level))saved.wins.push(s.level);if(!saved.best[s.level]||s.time<saved.best[s.level])saved.best[s.level]=s.time;persist();}else persist();beep(won?880:220,.35,'triangle');showModal(`<span class="eyebrow">${won?'FINISH! HEEL NETJES.':'FINISH! NOG EEN KEER?'}</span><div class="result-big">${rank}${rank===1?' 🏆':''}<small style="font-size:22px">e plaats</small></div><h2>${won?(s.level===20?'Hotdog-hond verslagen!':'Die is binnen!'):'Je zit er dichtbij.'}</h2><p>${names[s.level-1]} · ${formatTime(s.time)}${won&&s.level<20?`<br>Level ${s.level+1} is nu open.`:''}${won&&s.level===20?'<br>Alle 20 levels van Jaylenns Gras-wereld gewonnen!':''}</p><div class="tip">${won?'Goed gestuurd! Probeer je beste tijd te verbeteren.':'Tip: blijf op de baan, rem kort voor bochten en gebruik onweer om de anderen af te remmen.'}</div><div class="result-actions">${won&&s.level<20?'<button class="primary" id="nextRace">Volgende race ›</button>':''}<button class="secondary" id="again">Nog een race</button><button class="secondary" id="backMap">Wereldkaart</button></div><p class="saved-note">${storageAvailable?'Voortgang opgeslagen op dit apparaat.':'Opslaan is geblokkeerd in deze browser. Bewaar je voortgang via de wereldkaart.'}</p>`);if($('#nextRace'))$('#nextRace').onclick=()=>start(s.level+1);$('#again').onclick=()=>start(s.level);$('#backMap').onclick=backMap;}
function formatTime(t){return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function circularGap(a,b){let d=(a-b)%LENGTH;if(d< -LENGTH/2)d+=LENGTH;if(d>LENGTH/2)d-=LENGTH;return d;}
function update(dt){const s=state;if(!s||s.paused||s.finished)return;if(s.count>0){const before=Math.ceil(s.count);s.count-=dt;const now=Math.ceil(s.count);$('#countdown').textContent=s.count>.35?String(Math.min(3,Math.max(1,now))):'GO!';if(now!==before)beep(now<=0?800:440,.13);if(s.count<=0){$('#countdown').textContent='';toast('Sturen: linkerduim. Autogas staat '+(saved.auto?'aan!':'uit.')); }return;}s.time+=dt;for(const fx of s.effects)fx.age+=dt;s.effects=s.effects.filter(fx=>fx.age<fx.life);s.impact=Math.max(0,s.impact-dt);for(const k of ['boost','jump','freeze','slow','hitFlash'])s[k]=Math.max(0,s[k]-dt);const steer=clamp((input.right?1:0)-(input.left?1:0)+input.analog,-1,1),curve=s.curves[Math.floor((s.d%LENGTH)/SEG)];if(s.freeze>0)s.speed=0;else{let target=(saved.auto||input.gas)?MAX:0;if(s.boost>0)target*=1.42;if(input.brake)target=MAX*.24;if(Math.abs(s.x)>1.02)target*=.48;if(s.slow>0)target*=.55;s.speed=lerp(s.speed,target,Math.min(1,dt*(target<s.speed?3.2:1.4)));}const speedRatio=s.speed/MAX;const sensitivity={calm:1.02,normal:1.35,direct:1.68}[saved.sensitivity]||1.35;s.steer=lerp(s.steer||0,steer,1-Math.exp(-dt*15));let lateral=s.speed>30?s.steer*sensitivity*(.55+Math.min(speedRatio,1)*.45):0;const drift=curve*.055*speedRatio*speedRatio;lateral-=drift;if(saved.assist&&Math.abs(s.x)>.84&&steer*Math.sign(s.x)<=0)lateral-=Math.sign(s.x)*Math.min(.32,(Math.abs(s.x)-.84)*1.1);s.x+=lateral*dt;s.x=clamp(s.x,-1.65,1.65);s.d+=s.speed*dt;const lap=Math.floor(s.d/LENGTH);for(const b of s.blocks){const near=lap*LENGTH+b.d;if((s.boss?(lap===0&&b.lap<0):b.lap!==lap)&&Math.abs(near-s.d)<210&&Math.abs(b.x-s.x)<.28&&s.jump<.9){if(s.inventory.includes(null)){const item=randomItem();s.inventory[s.inventory.indexOf(null)]=item;b.lap=lap;renderInventory();addEffect('pickup');toast(`${icons[item]} ${itemNames[item]} gevonden!`);beep(960,.09);}else{b.lap=lap;toast('Alle drie vakjes vol! Gebruik een power-up.');}}}
for(let i=0;i<s.opponents.length;i++){const o=s.opponents[i];o.slow=Math.max(0,o.slow-dt);o.hyp=Math.max(0,o.hyp-dt);let ideal=[-.54,0,.54][i]+Math.sin(s.time*.34+i)*.12;if(s.profile.difficulty>9){const hazard=s.obstacles.find(b=>{const gap=circularGap(b.d,o.d);return gap>0&&gap<2200&&Math.abs(o.x-b.x)<.42;});if(hazard)ideal=hazard.x>0?-.56:.56;if(s.profile.difficulty>19&&o.d<s.d&&s.d-o.d<2500)ideal=clamp(s.x+(s.x>0?-.4:.4),-.72,.72);}o.x=lerp(o.x,ideal+(o.hyp>0?Math.sin(s.time*8)*.45:0),dt*2);let speed=o.speed*(o.slow>0?.35:1);if(o.d<s.d-6500)speed*=1.08;o.d+=speed*dt;if(Math.abs(o.d-s.d)<170&&Math.abs(o.x-s.x)<(o.boss?.44:.24)&&s.jump<=0){s.speed*=Math.pow(.58,dt*5);s.x+=Math.sign(s.x-o.x||1)*dt*.35;s.impact=.35;}for(const b of s.bananas){if(!b.used&&b.owner==='player'&&Math.abs(b.d-o.d)<180&&Math.abs(b.x-o.x)<.28){b.used=true;o.slow=2.5;toast('🍌 Je tegenstander glijdt uit!');}}}
for(const obstacle of s.obstacles){const gap=circularGap(obstacle.d,s.d);if(obstacle.hitLap!==lap&&Math.abs(gap)<190&&Math.abs(obstacle.x-s.x)<.27&&s.jump<=0){obstacle.hitLap=lap;s.slow=obstacle.kind==='cone'?1.25:.75;s.impact=.5;addEffect('impact');toast(obstacle.kind==='cone'?'Oeps, een pion!':'Spetters! Even minder grip.');}}
// Ordinary bots occasionally leave a visible banana. Their frequency rises gently.
if(!s.boss&&Math.floor((s.time-dt)/11)!==Math.floor(s.time/11)){const o=s.opponents[Math.floor(s.time/11)%3];s.bananas.push({d:o.d-300,x:o.x,owner:'bot'});}
for(const b of s.bananas){if(!b.used&&b.owner==='bot'&&Math.abs(b.d-s.d)<160&&Math.abs(b.x-s.x)<.25&&s.jump<=0){b.used=true;s.slow=2;toast('🍌 Uitgegleden!');beep(160,.2);}}
if(s.boss&&s.time>=s.nextShot){const dog=s.opponents[0];s.shots.push({d:dog.d,x:s.x,speed:dog.d>s.d?-3000:MAX*1.9,life:10});s.nextShot+=10;s.bossWarning=1;toast('🧊 IJsblok! Ontwijk of spring!');beep(180,.15,'square',.03);}
for(const shot of s.shots){const old=shot.d-s.d;shot.d+=shot.speed*dt;shot.life-=dt;const near=Math.abs(shot.d-s.d)<210||old*(shot.d-s.d)<0;if(!shot.used&&near&&Math.abs(shot.x-s.x)<.27){shot.used=true;if(s.jump>0){toast('🦘 Mooi over het ijs gesprongen!');}else{s.freeze=2;s.speed=0;s.hitFlash=.3;addEffect('ice');toast('🧊 Twee seconden bevroren!');beep(100,.3,'triangle');}}}
s.shots=s.shots.filter(x=>x.life>0&&!x.used);s.bananas=s.bananas.filter(x=>!x.used&&x.d>s.d-15000);s.rank=1+s.opponents.filter(o=>o.d>s.d).length;const behind=s.opponents.some(o=>s.d-o.d>0&&s.d-o.d<1300)||s.shots.some(o=>o.d<s.d&&s.d-o.d<4500),frontIce=s.shots.some(o=>Math.abs(o.d-s.d)<4500);$('#danger').classList.toggle('hidden',!behind&&!frontIce);$('#danger').firstChild.textContent=frontIce?'⚠ IJSBLOK IN DE BUURT ':'⚠ GEVAAR ACHTER JE ';$('#danger i').style.width=`${frontIce?95:65}%`;$('#speed').textContent=Math.round(s.speed/MAX*120);$('#position').innerHTML=`${s.rank}<span>/${s.opponents.length+1}</span>`;$('#lap').innerHTML=`${Math.min(2,lap+1)}<span>/2</span>`;$('#time').textContent=formatTime(s.time);if(s.boss)$('#trackLabel').textContent=`Hotdog-Hond · ijs over ${Math.ceil(Math.max(0,s.nextShot-s.time))}s`;if(s.time-s.checkpointAt>3){checkpoint();s.checkpointAt=s.time;}if(s.d>=LENGTH*LAPS)finish();}
function poly(points,fill){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
let projection=[];
function draw(){const s=state;if(!s)return;const horizon=view.horizon;ctx.fillStyle='#78ae50';ctx.fillRect(0,0,W,H);drawLandscape(ctx,W,H,s);const camera=s.d-view.cameraOffset,base=Math.floor(camera/SEG),pct=(camera%SEG+SEG)%SEG/SEG;projection=[];let curveX=0,dx=-s.curves[(base%COUNT+COUNT)%COUNT]*pct;const roadW=1800;const cameraElevation=elevation(s.d);for(let n=0;n<(quality.level===2?165:quality.level===1?135:105);n++){const index=base+n,segIndex=(index%COUNT+COUNT)%COUNT,z=index*SEG-camera;if(z<50){dx+=s.curves[segIndex];curveX+=dx;continue;}const scale=.9/z;projection.push({index,segIndex,z,scale,x:W/2+scale*(curveX-s.x*roadW)*W/2,y:horizon+scale*(900+cameraElevation-elevation(index*SEG))*H*.62,w:scale*roadW*W/2});curveX+=dx;dx+=s.curves[segIndex];}
if(surfaceAt(Math.floor(s.d/SEG))==='tunnel'){ctx.fillStyle='#183229bb';ctx.fillRect(0,0,W,H);}
for(let j=projection.length-2;j>=0;j--){const a=projection[j],b=projection[j+1];if(a.y>H*1.7||b.y>H*1.5)continue;const alt=Math.floor(a.index/3)%2===0,terrain=surfaceAt(a.segIndex);poly([[0,a.y+1],[a.x-a.w*1.1,a.y+1],[b.x-b.w*1.1,b.y],[0,b.y]],terrain==='bridge'?(alt?'#73b4b2':'#76b8b4'):terrain==='tunnel'?(alt?'#78b04e':'#7ab24f'):(alt?'#7eb653':'#80b854'));poly([[a.x+a.w*1.1,a.y+1],[W,a.y+1],[W,b.y],[b.x+b.w*1.1,b.y]],terrain==='bridge'?(alt?'#73b4b2':'#76b8b4'):(alt?'#7eb653':'#80b854'));poly([[a.x-a.w*1.1,a.y+1],[a.x+a.w*1.1,a.y+1],[b.x+b.w*1.1,b.y],[b.x-b.w*1.1,b.y]],terrain==='bridge'?'#c9aa71':terrain==='tunnel'?'#79907e':(alt?'#fff6d5':'#d69a63'));poly([[a.x-a.w,a.y+1],[a.x+a.w,a.y+1],[b.x+b.w,b.y],[b.x-b.w,b.y]],terrain==='bridge'?(alt?'#ad996c':'#b09d70'):terrain==='tunnel'?'#56695e':(alt?'#637368':'#647469'));if(alt){for(const lane of [-.333,.333])poly([[a.x+a.w*(lane-.012),a.y+1],[a.x+a.w*(lane+.012),a.y+1],[b.x+b.w*(lane+.012),b.y],[b.x+b.w*(lane-.012),b.y]],'#eaf0d6aa');}drawRoadFurniture(ctx,a,b,terrain);if(a.segIndex===0||a.segIndex===1){for(let col=0;col<12;col++)poly([[a.x-a.w+a.w*col/6,a.y+1],[a.x-a.w+a.w*(col+1)/6,a.y+1],[b.x-b.w+b.w*(col+1)/6,b.y],[b.x-b.w+b.w*col/6,b.y]],(col+a.segIndex)%2?'#faf5df':'#243f34');}}
const sprites=[];for(const p of projection){if(p.y>H*1.35)continue;const idx=p.segIndex;
 if(idx%(quality.level===2?4:quality.level===1?6:8)===0&&surfaceAt(idx)!=='tunnel'){sprites.push({p,x:1.42+(idx%3)*.23,type:'scenery',kind:idx%16===0?'blossom':'oak'});sprites.push({p,x:-1.5-(idx%5)*.19,type:'scenery',kind:idx%12===0?'pine':'oak'});}
 if(quality.level>0&&idx%3===0&&surfaceAt(idx)!=='tunnel'){sprites.push({p,x:idx%2?-1.13:1.15,type:'scenery',kind:idx%9===0?'flowers':'grass'});}
 if(idx%12===2)sprites.push({p,x:idx%2?1.30:-1.27,type:'scenery',kind:'fence'});
 if(idx%37===8)sprites.push({p,x:idx%2?2.15:-2.1,type:'scenery',kind:'barn'});
 if(idx%61===15)sprites.push({p,x:idx%2?-2.3:2.4,type:'scenery',kind:'mill'});
 if(idx%49===5)sprites.push({p,x:idx%2?2.2:-2.4,type:'scenery',kind:'pond'});
 if(idx%19===6)sprites.push({p,x:idx%2?1.65:-1.6,type:'scenery',kind:'hay'});
 if(idx%23===9)sprites.push({p,x:idx%2?-1.3:1.35,type:'scenery',kind:'rocks'});
 if(idx===3||idx===127)sprites.push({p,x:1.3,type:'scenery',kind:'sign'});
}
for(const f of s.features)if(f.kind==='tunnel'){for(const endpoint of [f.from,f.to]){const p=projection.find(p=>p.segIndex===endpoint);if(p&&p.y<H*1.2)sprites.push({p,x:0,type:'portal'});}}
function projectDist(d){const z=d-camera;if(z<100||z>31500)return null;const idx=Math.floor(d/SEG),p=projection[idx-(base+1)];const actual=p?.index===idx?p:projection.find(a=>a.index===idx);if(!actual)return null;const next=projection[projection.indexOf(actual)+1]||actual,t=(d/SEG)%1;return{scale:.9/z,x:lerp(actual.x,next.x,t),y:lerp(actual.y,next.y,t),w:lerp(actual.w,next.w,t),z};}
const lap=Math.floor(s.d/LENGTH);for(let l=Math.max(0,lap-1);l<=lap+1;l++)for(const b of s.blocks){if(s.boss?(l!==0||b.lap>=0):b.lap===l)continue;const p=projectDist(l*LENGTH+b.d);if(p)sprites.push({p,x:b.x,type:'block',seed:b.d});}for(let l=Math.max(0,lap-1);l<=lap+1;l++)for(const obstacle of s.obstacles){const p=projectDist(l*LENGTH+obstacle.d);if(p)sprites.push({p,x:obstacle.x,type:obstacle.kind});}for(const o of s.opponents){const p=projectDist(o.d);if(p)sprites.push({p,x:o.x,type:'kart',o});}for(const b of s.bananas){const p=projectDist(b.d);if(p)sprites.push({p,x:b.x,type:'banana'});}for(const shot of s.shots){const p=projectDist(shot.d);if(p)sprites.push({p,x:shot.x,type:'ice'});}
sprites.sort((a,b)=>b.p.z-a.p.z);for(const v of sprites){const p=v.p,x=p.x+p.w*v.x,y=p.y,k=p.scale*W*.65;if(x< -W*.4||x>W*1.4)continue;if(v.type==='portal'){drawTunnelPortal(ctx,p);continue;}if(v.type==='cone'||v.type==='puddle')drawHazard(ctx,v.type,x,y,k*2);if(v.type==='scenery')drawScenic(ctx,v.kind,x,y,k);if(v.type==='tree')tree(ctx,x,y,k*1.8);if(v.type==='flower'){for(let f=0;f<5;f++)ellipse(ctx,x+f*7*k,y-(f%2)*9*k,3*k,3*k,f%2?'#fff5c2':'#ffe6ed');}if(v.type==='fence'){ctx.strokeStyle='#e8d3a5';ctx.lineWidth=Math.max(1,k*4);ctx.beginPath();ctx.moveTo(x-25*k,y-16*k);ctx.lineTo(x+25*k,y-16*k);ctx.moveTo(x-20*k,y);ctx.lineTo(x-20*k,y-30*k);ctx.moveTo(x+20*k,y);ctx.lineTo(x+20*k,y-30*k);ctx.stroke();}if(v.type==='kart'){kart(ctx,x,y,k*(Math.min(1.7,W/340,H/390)*.95/(.9/view.cameraOffset*W*.65))*(v.o.boss?2.15:1),v.o.color,v.o.boss);if(v.o.hyp>0){ctx.fillStyle='#fff';ctx.font=`${Math.max(8,k*24)}px sans-serif`;ctx.fillText('🌀',x,y-100*k);}}if(v.type==='block'){const size=90*k,bob=Math.sin(performance.now()/300+v.seed)*5*k;ctx.save();ctx.translate(x,y-size*.8+bob);ctx.rotate(Math.sin(performance.now()/700+v.seed)*.12);rr(ctx,-size/2,-size/2,size,size,5*k,'#f7ce42','#fff0a4');ctx.fillStyle='#fffbe6';ctx.textAlign='center';ctx.font=`bold ${size*.8}px sans-serif,sans-serif`;ctx.fillText('?',0,size*.29);ctx.restore();}if(v.type==='banana'){ctx.font=`${Math.max(8,33*k)}px sans-serif`;ctx.textAlign='center';ctx.fillText('🍌',x,y);}if(v.type==='ice'){rr(ctx,x-24*k,y-42*k,48*k,42*k,8*k,'#b5f2ff','#f0ffff');ctx.strokeStyle='#fff';ctx.lineWidth=2*k;ctx.beginPath();ctx.moveTo(x-17*k,y-30*k);ctx.lineTo(x+10*k,y-10*k);ctx.stroke();}}
const steer=s.steer||0,jump=s.jump>0?Math.sin((1.4-s.jump)/1.4*Math.PI)*H*.14:0,ps=Math.min(1.7,W/340,H/390)*.95;let bob=s.speed>100?Math.sin(performance.now()/65)*1.1:0;const py=view.playerY;const shake=s.impact>0?Math.sin(performance.now()/17)*s.impact*7:0;if(s.boost>0){for(let i=0;i<8;i++){const xx=W*.5+(i-3.5)*W*.12;ctx.strokeStyle='#fff7b370';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx,H*.65);ctx.lineTo(xx+(xx-W*.5)*.3,H);ctx.stroke();}ellipse(ctx,W/2,view.playerY+4,18*ps,25*ps,'#ffb74a');}kart(ctx,W/2+shake,py-jump+bob,ps,'#f56a48',false,-steer);if(s.jump>0)ellipse(ctx,W/2,py+5,45*ps,8*ps,'#21452e33');if(s.freeze>0){rr(ctx,W/2-51*ps,py-105*ps,102*ps,112*ps,18*ps,'#c5f5ff88','#eaffff');ctx.fillStyle='#f2ffff';ctx.textAlign='center';ctx.font=`bold ${25*ps}px sans-serif`;ctx.fillText(`${s.freeze.toFixed(1)}s`,W/2,py-110*ps);}if(s.hitFlash>0){ctx.fillStyle=`rgba(225,250,255,${s.hitFlash*1.8})`;ctx.fillRect(0,0,W,H);}if(Math.abs(s.x)>1.02&&s.speed>500){ctx.fillStyle='#dbc58f99';for(let i=0;i<8;i++){const t=(performance.now()/400+i*.17)%1;ellipse(ctx,W/2+(i%2?1:-1)*(35+t*35)*ps,py+5+t*30,5*t*ps,4*t*ps);}}drawRaceEffects(ctx,s,view.playerY);drawMini();}
function drawMini(){const c=$('#minimap').getContext('2d'),s=state;c.clearRect(0,0,130,90);c.lineWidth=8;c.strokeStyle='#deedc355';c.beginPath();c.ellipse(65,45,48,28,0,0,Math.PI*2);c.stroke();for(const o of s.opponents){const a=o.d/LENGTH*Math.PI*2-Math.PI/2;ellipse(c,65+48*Math.cos(a),45+28*Math.sin(a),3,3,o.boss?'#f8bc60':o.color);}const a=s.d/LENGTH*Math.PI*2-Math.PI/2;ellipse(c,65+48*Math.cos(a),45+28*Math.sin(a),5,5,'#eeffae');}
function applyQuality(level){quality.level=level;quality.dpr=level===2?Math.min(devicePixelRatio||1,1.75):level===1?Math.min(devicePixelRatio||1,1.25):1;if(W)resize();}
function loop(t){const elapsed=Math.min((t-last)/1000||.016,.12);last=t;if(state&&!state.paused&&!state.finished){quality.frames++;quality.elapsed+=elapsed;if(quality.elapsed>=5){const fps=quality.frames/quality.elapsed;if(saved.quality==='auto'&&fps<43&&quality.level>0)applyQuality(quality.level-1);quality.frames=0;quality.elapsed=0;}}if(state){let remaining=elapsed;while(remaining>0){const dt=Math.min(remaining,1/60);update(dt);remaining-=dt;}draw();}requestAnimationFrame(loop);}requestAnimationFrame(loop);


function restoreSession(session){
 const s=state;if(session.level!==s.level)return;
 for(const key of ['d','x','speed','time','boost','jump','freeze','slow','nextShot'])if(Number.isFinite(session[key]))s[key]=session[key];
 s.x=clamp(s.x,-1.65,1.65);s.speed=clamp(s.speed,0,MAX*1.42);s.time=Math.max(0,s.time);s.count=2;
 if(Array.isArray(session.inventory)&&session.inventory.length===3)s.inventory=session.inventory.map(i=>Number.isInteger(i)&&i>=0&&i<5?i:null);
 if(Array.isArray(session.opponents)&&session.opponents.length===s.opponents.length)session.opponents.forEach((o,i)=>{for(const key of ['d','x','slow','hyp'])if(Number.isFinite(o[key]))s.opponents[i][key]=o[key];});
 if(Array.isArray(session.blocks)&&session.blocks.length===s.blocks.length)session.blocks.forEach((b,i)=>{if(Number.isInteger(b.lap))s.blocks[i].lap=b.lap;});
 if(Array.isArray(session.obstacles)&&session.obstacles.length===s.obstacles.length)session.obstacles.forEach((o,i)=>{if(Number.isInteger(o.hitLap))s.obstacles[i].hitLap=o.hitLap;});
 if(Array.isArray(session.bananas))s.bananas=session.bananas.filter(b=>Number.isFinite(b.d)&&Number.isFinite(b.x)&&['player','bot'].includes(b.owner)).slice(-30);
 if(Array.isArray(session.shots))s.shots=session.shots.filter(b=>Number.isFinite(b.d)&&Number.isFinite(b.x)&&Number.isFinite(b.speed)&&b.life>0).slice(-4);
}
