
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const names=['Groene start','Madeliefjespad','Klaverbocht','Houten hekjes','Heuvelpret','Windmolenweg','Bloemenbocht','Kronkelgras','Zonnedal','Kikkerplas','Bosrand','Dubbele bocht','Hooibalenpad','Heuvelsprint','Klaverveld','Bochtenfeest','Grasstorm','Laatste sprint','Grote aanloop','Hotdog-finale'];
names.push('Het warme zand','Duinenpad','Zandbocht','Oaseroute','Gouden heuvels','Palmenpad','Zandspoor','Woestijnwind','Kronkelduin','Zandvlakte','Hoge duinen','Droge bocht','Rotsenpad','Duintop','Zandgolf','Palmenbocht','Zonnige lus','Zandkronkels','Lange duin','Woestijnsprint','Rotsbocht','Zandvallei','Hoge pas','Duinenslinger','Gouden route','Zandstormpad','Laatste oase','Grote zandlus','Aanloop naar pizza','Pizzaman-finale');

names.push(...ICE_NAMES);
const TOTAL_LEVELS=70;
const icons=['⚡','🌀','🚀','🍌','🦘','🧊'], itemNames=['Onweer','Hypnose','Boost','Banaan','Jump','IJs'];
const STORAGE_KEY='kartgo-jaylenn-v1';
const DEFAULTS={wins:[],best:{},mode:'buttons',auto:true,sound:false,assist:true,sensitivity:'normal',controlsVersion:3,quality:'auto',engine:250,session:null,xp:0,rewards:{glitter:false},player:null};
function cleanProgress(source={}){
 const p=source&&typeof source==='object'&&!Array.isArray(source)?source:{};
 const result={...DEFAULTS,wins:[],best:{},player:cleanPlayer(p.player||{}),rewards:{glitter:p.rewards?.glitter===true}};
 result.wins=[...new Set(Array.isArray(p.wins)?p.wins.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL_LEVELS):[])];
 if(p.best&&typeof p.best==='object')for(let i=1;i<=TOTAL_LEVELS;i++)if(Number.isFinite(p.best[i])&&p.best[i]>0)result.best[i]=p.best[i];
 result.xp=Math.max(result.wins.length*100,Number.isInteger(p.xp)&&p.xp>=0?Math.min(p.xp,1000000):0);
 result.mode=['buttons','wheel','joystick'].includes(p.mode)?p.mode:'buttons';
 for(const key of ['auto','sound','assist'])if(typeof p[key]==='boolean')result[key]=p[key];
 if(['calm','normal','direct'].includes(p.sensitivity))result.sensitivity=p.sensitivity;
 if(['auto','high','low'].includes(p.quality))result.quality=p.quality;
 result.engine=engineValue(p.engine);
 if(p.session&&[3,4].includes(p.session.version)&&Number.isInteger(p.session.level)&&p.session.level>=1&&p.session.level<=TOTAL_LEVELS&&Number.isFinite(p.session.d)&&p.session.d>=0&&p.session.d<104000)result.session=p.session;
 return result;
}
let saved=cleanProgress(),storageAvailable=true;
try{
 const raw=localStorage.getItem(STORAGE_KEY);
 if(raw){saved=cleanProgress(JSON.parse(raw));try{if(!localStorage.getItem(STORAGE_KEY+'-backup-before-v4'))localStorage.setItem(STORAGE_KEY+'-backup-before-v4',raw);if(!localStorage.getItem(STORAGE_KEY+'-backup-before-v3'))localStorage.setItem(STORAGE_KEY+'-backup-before-v3',raw);if(!localStorage.getItem(STORAGE_KEY+'-backup-before-v6'))localStorage.setItem(STORAGE_KEY+'-backup-before-v6',raw);}catch{}}
 const old=JSON.parse(localStorage.getItem('kartgo-jaylenn-friends-prototype-v1')||'null');if(old&&!JSON.parse(raw||'{}').player){saved.player=cleanPlayer({name:old.nickname,avatar:old.character,paint:old.paint,code:old.code});}
}catch{storageAvailable=false;}
// Save the newly generated local identity once, including before a first race.
persist();
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));storageAvailable=true;return true;}catch{storageAvailable=false;return false;}}
function checkpoint(){
 if(!state||state.finished||state.freeRace)return;
 const keys=['level','d','x','speed','time','inventory','boost','jump','rampAir','rampDuration','freeze','slow','spin','nextShot','opponents','blocks','shots','bananas','obstacles'];
 const session={version:4};for(const key of keys)session[key]=JSON.parse(JSON.stringify(state[key]));
 session.engine=state.engine;session.adventure=RaceAdventure.snapshot(state);if(state.ice)session.iceState=Ice.snapshot(state);saved.session=session;persist();
}
function renderResume(){const b=$('#resumeRace');b.classList.toggle('hidden',!saved.session);if(saved.session){b.textContent=`Hervat race · level ${saved.session.level}`;b.onclick=()=>requestRace(()=>start(saved.session.level,saved.session));}}
function progressText(){return JSON.stringify({format:'kart-go-progress',version:4,created:new Date().toISOString(),...cleanProgress(saved)},null,2);}
function mergeProgress(text){
 if(typeof text!=='string'||text.length>300000)throw new Error('Bestand is te groot.');
 const source=JSON.parse(text);if(!source||!Array.isArray(source.wins)||!source.best||typeof source.best!=='object')throw new Error('Geen Kart Go-voortgang.');
 const incoming=cleanProgress(source);saved.wins=[...new Set([...saved.wins,...incoming.wins])];
 for(const key of Object.keys(incoming.best))saved.best[key]=Math.min(saved.best[key]||Infinity,incoming.best[key]);
 if(!saved.session&&incoming.session)saved.session=incoming.session;saved.xp=Math.max(saved.xp,incoming.xp,saved.wins.length*100);saved.rewards.glitter ||= incoming.rewards.glitter;if(source.player)saved.player=incoming.player;
 for(const k of ['mode','auto','sound','assist','sensitivity','quality','engine'])if(k in source)saved[k]=incoming[k];
 const ok=persist();renderPlayer();renderMap();soundLabel();applyQuality(saved.quality==='low'?0:2);return ok;
}
function importText(text){try{const ok=mergeProgress(text);showModal(`<h2>Je voortgang staat klaar.</h2><p>Je ingelezen en bestaande overwinningen zijn samengevoegd.</p><p>${ok?'Opgeslagen op dit apparaat.':'Opslaan is geblokkeerd. Bewaar de tekst als back-up.'}</p>`);}catch{showModal('<h2>Dit bestand lukt niet.</h2><p>Kies een Kart Go-voortgangsbestand of plak de complete back-uptekst.</p>');}}
$('#exportProgress').onclick=()=>{
 checkpoint();const text=progressText();
 showModal('<h2>Bewaar je racewereld.</h2><p>Bewaar het bestand, of kopieer de back-uptekst naar je eigen notities. Zo kun je je voortgang later weer inlezen.</p><button class="primary" id="downloadProgress">Bewaar bestand</button> <button class="secondary" id="copyProgress">Kopieer back-uptekst</button><label for="backupText">Jouw complete back-up</label><textarea id="backupText" rows="6" readonly></textarea><p id="backupMessage" role="status"></p>');$('#backupText').value=text;
 $('#downloadProgress').onclick=()=>{const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='Kart_Go_voortgang.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);$('#backupMessage').textContent='Bestand aangeboden. Geen download zichtbaar? Gebruik Kopieer back-uptekst.';};
 $('#copyProgress').onclick=async()=>{try{await navigator.clipboard.writeText(text);$('#backupMessage').textContent='Back-uptekst gekopieerd. Bewaar hem in je eigen notities.';}catch{$('#backupText').select();$('#backupMessage').textContent='Selecteer de tekst en kies Kopieer.';}};
};
$('#importProgress').onclick=()=>{showModal('<h2>Verder met je racewereld.</h2><p>Bestaande overwinningen blijven bewaard. Je profiel en instellingen worden overgenomen uit de back-up die je kiest.</p><button class="secondary" id="chooseProgress">Kies bestand</button><label for="restoreText">Of plak je complete back-uptekst</label><textarea id="restoreText" rows="6" placeholder="Plak hier je Kart Go-back-up"></textarea><button class="primary" id="restoreProgress">Lees back-uptekst in</button>');$('#chooseProgress').onclick=()=>$('#progressFile').click();$('#restoreProgress').onclick=()=>importText($('#restoreText').value);};
$('#progressFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>300000)throw new Error();importText(await file.text());}catch{showModal('<h2>Dit bestand lukt niet.</h2><p>Kies een Kart Go-bestand kleiner dan 300 kB.</p>');}e.target.value='';});

let audioCtx;
function beep(freq=500,dur=.09,type='sine',vol=.06){if(!saved.sound)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>{});const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime);g.gain.setValueAtTime(vol,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur);}catch{}}
function soundLabel(){$('#sound').textContent=saved.sound?'♫':'♪';$('#sound').setAttribute('aria-label',saved.sound?'Geluid uitzetten':'Geluid aanzetten');$('#sound').style.opacity=saved.sound?'1':'.55';}
$('#sound').onclick=()=>{saved.sound=!saved.sound;if(saved.sound)RaceAudio.unlock();else RaceAudio.stop();persist();soundLabel();beep();};soundLabel();
const modal=$('#modal');function showModal(html){$('#modalBody').innerHTML=html;if(!modal.open)modal.showModal();}function closeModal(){modal.close();pendingPlayerAction=null;}$('#closeModal').onclick=()=>{if(state?.finished)backMap();else if(state?.paused)resume();else closeModal();};modal.addEventListener('cancel',e=>{if(state?.finished){e.preventDefault();backMap();}else if(state?.paused){e.preventDefault();resume();}});
function help(){showModal(`<span class="eyebrow">KLAAR VOOR DE START?</span><h2>Racen is zo geleerd.</h2><p>Stuur met je linkerduim en blijf op het asfalt. Met autogas rijd je vanzelf. Rem staat links en gas rechts; tik op ‘wissel’ voor een stuurwiel of joystick. Op een computer: pijltjes of WASD.</p><div class="tip">Kies in de garage 250, 509 of 1000 pk. Meer vermogen geeft echt meer snelheid. Rem voor scherpe bochten. Vlieg je eruit? Twee seconden stofwolk; in het water drie seconden plons. Daarna kom je vanzelf terug op de baan, met je items intact.</div><div class="tip">Pak de zwevende Lucky Blocks. Tik op een gevuld vakje om een power-up te gebruiken (toetsen 1, 2, 3). Je hebt drie vakjes. Win om het volgende level te openen.</div><div class="items-guide"><div>⚡ Onweer · 50%<small>Remt alle tegenstanders af.</small></div><div>🌀 Hypnose · 20%<small>Tien seconden verwarring, met paarse schitteringen.</small></div><div>🚀 Boost · 15%<small>Vier seconden extra snelheid.</small></div><div>🍌 Banaan · 10%<small>Een treffer laat je tegenstander twee seconden draaien.</small></div><div>🦘 Jump · 5%<small>Spring over ijs en bananen.</small></div></div><div class="tip">🏜️ Zandwereld (21–50): alleen Hypnose, IJs en Banaan. Geen boosts door de hitte. IJs bevriest een tegenstander twee seconden. Pizzaman wacht bij level 50.</div><div class="tip">Schans vanaf level 5: houd je koers en geef gas. Je kart springt vanzelf en landt weer op de baan. Gele pijlborden waarschuwen voor scherpe bochten.</div><p>Met geluid aan heeft elke wereld een eigen startgeluid. De ijzige stem roept ‘Ho ho ho!’ vóór het startsignaal.</p><p>De nood-balk waarschuwt voor gevaar achter je. In level 20 schiet de hotdog-hond elke 10 seconden een ijsblok. Geraakt? Twee seconden bevroren!</p><div class="tip">❄️ IJs-Wereld (51–70): rem voor meer grip. Jump en Boost maken barsten die na 2s opengaan en na 3s dichtvriezen. Een plons wordt na 3s hersteld. Luchtpegels: blijf op de grond. Level 63 heeft negen IJs Lucky Blocks. De Burgerkoning op 70 heeft één lange ronde: sla vertraagt 2s, wasmand 3s. De waarschuwing toont de veilige strook.</div><button class="primary" id="helpDone">Begrepen! ›</button>`);$('#helpDone').onclick=closeModal;}
$('#how').onclick=help;
function settings(){showModal(`<span class="eyebrow">MAAK HET JOUW RACE</span><h2>Kies je besturing.</h2><p>Gas staat rechts en rem links. Het stuur staat ertussen. Autogas helpt je om alleen op sturen te letten.</p>${[['wheel','◉ Autowiel','Sleep het stuur naar links of rechts.'],['buttons','◀ ▶ Knoppen','Houd een pijl ingedrukt.'],['joystick','🟢 Groene joystick','Sleep de groene knop naar links of rechts.']].map(([v,n,d])=>`<button class="choice ${saved.mode===v?'selected':''}" data-mode="${v}"><span><b>${n}</b><small style="display:block;margin-top:5px;color:#6c7e65">${d}</small></span><span>${saved.mode===v?'✓':''}</span></button>`).join('')}<button class="choice" id="autoSetting"><span>Autogas</span><b>${saved.auto?'Aan ✓':'Uit'}</b></button><button class="choice" id="assistSetting"><span>Hulp langs de baanrand</span><b>${saved.assist?'Aan ✓':'Uit'}</b></button><button class="choice" id="sensitivitySetting"><span>Stuurgevoeligheid</span><b>${{calm:'Rustig',normal:'Normaal',direct:'Direct'}[saved.sensitivity]||'Normaal'}</b></button><button class="choice" id="engineSetting"><span>Motorvermogen · nieuwe race</span><b>${ENGINE_CLASSES[saved.engine].name}</b></button><button class="choice" id="qualitySetting"><span>Beeldkwaliteit</span><b>${{auto:'Automatisch',high:'Hoog',low:'Licht'}[saved.quality]}</b></button><p class="saved-note">Je keuze en voortgang blijven op dit apparaat bewaard.</p><button class="primary" id="settingDone">Klaar ›</button>`);$$('[data-mode]').forEach(b=>b.onclick=()=>{saved.mode=b.dataset.mode;persist();settings();});$('#autoSetting').onclick=()=>{saved.auto=!saved.auto;persist();settings();};$('#assistSetting').onclick=()=>{saved.assist=!saved.assist;persist();settings();};$('#sensitivitySetting').onclick=()=>{const a=['calm','normal','direct'];saved.sensitivity=a[(a.indexOf(saved.sensitivity)+1)%3];persist();settings();};$('#qualitySetting').onclick=()=>{const modes=['auto','high','low'];saved.quality=modes[(modes.indexOf(saved.quality)+1)%3];applyQuality(saved.quality==='low'?0:2);persist();settings();};$('#engineSetting').onclick=()=>{const options=[250,509,1000];saved.engine=options[(options.indexOf(saved.engine)+1)%3];persist();settings();};$('#settingDone').onclick=closeModal;}
$('#settings').onclick=settings;
let raceMode='adventure';
let selectedWorld=saved.wins.includes(50)?3:saved.wins.includes(20)?2:1;
function renderMap(){if(document.querySelector('[data-party-world]')){document.querySelector('[data-party-world]').href='./party/?mode='+raceMode;document.querySelector('[data-party-world] small').textContent='71–75 · '+(raceMode==='free'?'Vrij racen':'Avontuur');}const won=new Set(saved.wins),next=Array.from({length:TOTAL_LEVELS},(_,i)=>i+1).find(n=>!won.has(n))||TOTAL_LEVELS;$('#progressText').textContent=`${won.size} / ${TOTAL_LEVELS} gewonnen`;$('#worldHint').textContent=selectedWorld===3?'❄️ De IJs-Wereld · 51–70 · paleizen, barsten en de Burgerkoning':selectedWorld===1?'🌿 De Groene Wereld · levels 1–20 · vijf power-ups':'🏜️ De Zandwereld · levels 21–50 · Hypnose, IJs, Banaan · geen boosts door de hitte';$$('[data-world]').forEach(b=>{b.classList.toggle('selected',+b.dataset.world===selectedWorld);b.setAttribute('aria-pressed',String(+b.dataset.world===selectedWorld));b.onclick=()=>{selectedWorld=+b.dataset.world;renderMap();};});$('#levels').innerHTML=names.map((name,i)=>{const n=i+1;if(worldOf(n)!==selectedWorld)return '';const open=raceMode==='free'||n===1||won.has(n-1)||won.has(n);return `<button class="level ${won.has(n)?'won':n===next?'next':''} ${!open?'locked':''} ${[20,50,70].includes(n)?'boss':''}" data-level="${n}" aria-label="Level ${n}: ${n===63&&!open?'Geheime ijskamer':name}${!open?', vergrendeld':''}"><span class="star">${won.has(n)?'★':!open?'🔒':''}</span><b>${n===20?'🌭':n===50?'🍕':n===70?'🍔':n===63&&!open?'?':String(n).padStart(2,'0')}</b><small>${n===63&&!open?'Geheim · ontdek na 62':name}</small></button>`;}).join('');$$('[data-level]').forEach(b=>b.onclick=()=>{const n=+b.dataset.level;if(raceMode!=='free'&&n>1&&!won.has(n-1)&&!won.has(n)){showModal(`<h2>Nog even racen!</h2><p>Win eerst level ${n-1} om ${names[n-1]} te openen. Eerdere levels kun je altijd opnieuw spelen.</p><button class="primary" id="lockedDone">Terug naar de kaart</button>`);$('#lockedDone').onclick=closeModal;return;}requestRace(()=>start(n));});$('#play').onclick=()=>requestRace(()=>start(next));$('#claimGlitter').textContent=saved.rewards.glitter?'✨ Glitters opgehaald ✓':'✨ Haal je glitters op';renderResume();}
renderMap();
for(const b of $$('[data-race-mode]'))b.onclick=()=>{raceMode=b.dataset.raceMode;for(const button of $$('[data-race-mode]'))button.setAttribute('aria-pressed',String(button===b));$('#modeHint').textContent=raceMode==='free'?'Alle levels direct beschikbaar. Je avonturenvoortgang blijft bewaard.':'Win een race om de volgende vrij te spelen.';renderMap();};
$('#chooseWorld').onclick=()=>{raceMode='free';for(const button of $$('[data-race-mode]'))button.setAttribute('aria-pressed',String(button.dataset.raceMode==='free'));$('#modeHint').textContent='Alle levels direct beschikbaar. Je avonturenvoortgang blijft bewaard.';showWorldMap();};
const canvas=$('#game'),ctx=canvas.getContext('2d',{alpha:false}),art=$('#art'),ac=art.getContext('2d');let W=0,H=0,DPR=1,state=null,last=0,toastTimer;const SEG=200,LAPS=2;let MAX=ENGINE_CLASSES[saved.engine].speed,COUNT=260,LENGTH=SEG*COUNT;const quality={level:saved.quality==='low'?0:2,dpr:saved.quality==='low'?1:Math.min(devicePixelRatio||1,1.75),frames:0,elapsed:0};const view={horizon:0,playerY:0,cameraOffset:1050};
function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function kart(c,x,y,s,color='#f66545',dog=false,steer=0,player=null){
 if(GFX.drawKart(c,x,y,s,color,dog,steer,player))return;
 if(s<.015)return;c.save();c.translate(x,y);c.scale(s,s);c.rotate(steer*.055);
 const tick=performance.now()/95;
 ellipse(c,3,7,60,14,'#153d3033');
 function tire(xx,yy,front){c.save();c.translate(xx,yy);if(front)c.rotate(steer*.13);rr(c,-10,-18,20,36,6,'#25382d');rr(c,-8,-16,6,31,3,'#506052');c.strokeStyle='#83937c';c.lineWidth=1.3;for(let i=0;i<4;i++){const ty=((i*10+tick*8)%35)-17;c.beginPath();c.moveTo(-6,ty);c.lineTo(6,ty+2);c.stroke();}c.restore();}
 tire(-37,-52,true);tire(37,-52,true);tire(-47,-11,false);tire(47,-11,false);
 if(dog==='pizza'){
  ellipse(c,0,-48,44,47,'#ba7540');ellipse(c,0,-51,37,40,'#ffe08a');
  for(const [xx,yy] of [[-20,-39],[24,-62],[-21,-70],[18,-23]]){ellipse(c,xx,yy,7,7,'#d65c42');ellipse(c,xx-2,yy-2,2,2,'#f49962');}
  ellipse(c,-7,-96,25,27,'#ffdf8b');ellipse(c,-26,-103,9,11,'#d78345');
  ellipse(c,-16,-101,7,9,'#fffde7');ellipse(c,4,-98,9,7,'#fffde7');ellipse(c,-14,-99,3,4,'#435b38');ellipse(c,7,-98,3,3,'#435b38');
  c.strokeStyle='#79523b';c.lineWidth=3;c.beginPath();c.moveTo(-12,-82);c.quadraticCurveTo(3,-70,16,-84);c.stroke();
  ellipse(c,11,-72,10,13,'#e85039');c.strokeStyle='#6e9541';c.lineWidth=3;c.beginPath();c.moveTo(8,-83);c.lineTo(12,-88);c.lineTo(15,-82);c.stroke();
  shape(c,[[-29,-119],[2,-146],[25,-115]],'#e9ad5e');shape(c,[[-23,-120],[2,-140],[18,-117]],'#fff1a6');ellipse(c,1,-128,4,4,'#d85c45');
  rr(c,-24,-5,48,8,3,'#7c9655');
 }else if(dog){
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
  rr(c,-21,-77,42,9,4,player?.helmet||'#306b4c');rr(c,-16,-75,32,3,2,'#80ad7e');
  rr(c,-31,-8,62,10,4,'#edeac9');rr(c,-26,-14,12,5,2,'#f5bc6b');rr(c,14,-14,12,5,2,'#f5bc6b');
  c.strokeStyle='#fff5cb88';c.lineWidth=2;c.beginPath();c.moveTo(-32,-48);c.lineTo(-28,-24);c.moveTo(31,-49);c.lineTo(27,-24);c.stroke();
 }
 // Race-car upgrade: polished bodywork, front splitter, vents and headlights.
 if(!dog){
  c.save();
  rr(c,-37,-17,74,11,4,'#101c2c');rr(c,-32,-20,64,5,2,'#a7c9e4');
  rr(c,-32,-55,9,28,4,'#ffffff55');rr(c,23,-55,9,28,4,'#08182966');
  rr(c,-32,-26,16,8,3,'#e9faff');rr(c,16,-26,16,8,3,'#e9faff');
  rr(c,-31,-24,12,3,1,'#5ddaff');rr(c,19,-24,12,3,1,'#5ddaff');
  rr(c,-10,-26,20,14,4,'#102539');rr(c,-7,-24,14,9,3,'#e9f7ff');
  c.strokeStyle='#ffffffb0';c.lineWidth=2;c.beginPath();c.moveTo(-28,-57);c.lineTo(-25,-39);c.moveTo(28,-57);c.lineTo(25,-39);c.stroke();
  c.restore();
 }
 if(player){
  // Character silhouettes are rendered in the kart, not as floating emoji.
  const avatar=player.avatar;const isFox=avatar==='🦊',isPanda=avatar==='🐼',isFrog=avatar==='🐸',isRobot=avatar==='🤖',isNinja=avatar==='🥷';
  c.save();c.translate(0,-89);
  const head=isFox?'#ef9747':isPanda?'#f6f6f6':isFrog?'#78c96b':isRobot?'#8ed5e5':isNinja?'#1a273d':'#f2bf8e';
  if(isFox||isPanda){const ear=isFox?'#c36d35':'#253247';ellipse(c,-15,-13,8,13,ear);ellipse(c,15,-13,8,13,ear);}
  if(isFrog){ellipse(c,-13,-12,8,8,head);ellipse(c,13,-12,8,8,head);}
  ellipse(c,0,0,21,20,head);
  if(isRobot){rr(c,-20,-16,40,32,8,'#8bd4e7');rr(c,-14,-8,28,15,4,'#1d496a');}
  if(isNinja){rr(c,-20,-6,40,14,4,'#101928');rr(c,-14,-3,28,8,3,'#e5b58b');}
  if(avatar==='🧑‍🚀'){rr(c,-22,-19,44,38,15,'#e4f2ff');rr(c,-18,-12,36,21,9,'#5bb9e0');}
  const eye=isRobot?'#a9fffc':'#152b35';
  ellipse(c,-8,-2,3.5,4.5,eye);ellipse(c,8,-2,3.5,4.5,eye);
  if(isFox){ellipse(c,0,8,10,7,'#fff3d9');ellipse(c,0,5,4,3,'#202632');}
  if(isPanda){ellipse(c,-8,-2,7,9,'#29303d');ellipse(c,8,-2,7,9,'#29303d');ellipse(c,-8,-2,2.5,3,'#fff');ellipse(c,8,-2,2.5,3,'#fff');}
  c.strokeStyle=isRobot?'#a9fffc':'#633c37';c.lineWidth=2;c.beginPath();c.arc(0,5,5,0,Math.PI);c.stroke();
  c.restore();
  if(xpLevel()>=5){c.strokeStyle='#fff7a6';c.lineWidth=3;c.beginPath();c.moveTo(-30,-57);c.lineTo(-22,-50);c.lineTo(-30,-43);c.moveTo(-37,-50);c.lineTo(-23,-50);c.stroke();}}
 c.restore();
}

function tree(c,x,y,s){c.fillStyle='#83684a';c.fillRect(x-3*s,y-30*s,6*s,33*s);ellipse(c,x,y-46*s,24*s,28*s,'#427f3d');ellipse(c,x-12*s,y-37*s,18*s,20*s,'#548f3c');ellipse(c,x+9*s,y-54*s,15*s,19*s,'#6ba344');}
function drawArt(){const r=art.getBoundingClientRect();if(!r.width)return;art.width=r.width*2;art.height=r.height*2;ac.setTransform(2,0,0,2,0,0);const w=r.width,h=r.height;let grad=ac.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#c9e7bd');grad.addColorStop(1,'#eff3bc');ac.fillStyle=grad;ac.fillRect(0,0,w,h);ellipse(ac,w*.79,h*.2,29,29,'#fff9b5');ellipse(ac,w*.3,h*.6,w*.65,h*.36,'#a9ce80');ellipse(ac,w*.95,h*.64,w*.6,h*.37,'#90bd65');ellipse(ac,w*.4,h*.96,w*.8,h*.4,'#7dac50');ac.beginPath();ac.moveTo(w*.15,h);ac.bezierCurveTo(w*1.3,h*.34,-w*.3,h*.58,w*.65,h*.32);ac.lineTo(w*.73,h*.32);ac.bezierCurveTo(-w*.12,h*.61,w*1.6,h*.34,w*.75,h);ac.closePath();ac.fillStyle='#efdfac';ac.fill();ac.strokeStyle='#fff8da';ac.lineWidth=2;ac.setLineDash([10,10]);ac.beginPath();ac.moveTo(w*.45,h);ac.bezierCurveTo(w*1.4,h*.35,-w*.2,h*.59,w*.69,h*.32);ac.stroke();ac.setLineDash([]);tree(ac,w*.1,h*.6,.9);tree(ac,w*.87,h*.53,.75);tree(ac,w*.97,h*.7,.8);tree(ac,w*.17,h*.8,.5);for(let i=0;i<23;i++){let x=(i*47+21)%w,y=h*.65+(i*37)%(h*.32);ellipse(ac,x,y,2,2,i%2?'#f9f3c1':'#fff');}if(sceneryCache.size){drawScenic(ac,'mill',w*.83,h*.50,.27);drawScenic(ac,'barn',w*.16,h*.57,.24);drawScenic(ac,'flowers',w*.18,h*.81,.37);drawScenic(ac,'blossom',w*.94,h*.72,.24);}kart(ac,w*.67,h*.58,1.05,'',true,-1);kart(ac,w*.42,h*.84,1.6,'#f66b49',false,-.4);ac.save();ac.translate(w*.29,h*.49);ac.rotate(-.15);rr(ac,-16,-16,32,32,6,'#f8d858','#fff7c1');ac.fillStyle='#fff9db';ac.font='bold 25px sans-serif';ac.textAlign='center';ac.fillText('?',0,9);ac.restore();}
function resize(options={}){
 const wasRacing=!options.fresh&&state&&!state.paused&&!state.finished;
 const changed=W>0&&(Math.abs(W-innerWidth)>40||Math.abs(H-innerHeight)>120);
 W=innerWidth;H=window.visualViewport?.height||innerHeight;DPR=Math.min(devicePixelRatio||1,quality.dpr);
 canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
 const top=$('#controls').getBoundingClientRect().top;
 view.horizon=H*(W/H<.8?.34:.32);view.playerY=Math.min(H*(W/H<.8?.77:.79),top>0?top-(W/H<.8?38:20):H*.77);
 view.cameraOffset=.9*900*H*.62/Math.max(H*.22,view.playerY-view.horizon);
 landscapeCache=null;drawArt();if(changed&&wasRacing){resetInput();pause();}
}
window.addEventListener('resize',resize);buildScenery(1);resize();
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2100);}
function modeUI(){const mode=saved.mode;$('#wheel').classList.toggle('hidden',mode!=='wheel');$('#left').classList.toggle('hidden',mode!=='buttons');$('#right').classList.toggle('hidden',mode!=='buttons');$('#joystick').classList.toggle('hidden',mode!=='joystick');$('#auto').classList.toggle('active',saved.auto);$('#auto').textContent=`AUTOGAS ${saved.auto?'AAN':'UIT'}`;$('#modeSwitch').textContent=({wheel:'Stuurwiel',buttons:'Stuurknoppen',joystick:'Joystick'}[mode])+' · wissel';}
function trackProfile(level){
 if(level>50)return Ice.profile(level);
 if(level>20){const n=level-20;return{stage:Math.min(5,Math.floor((n-1)/5)),difficulty:Math.round(15+(n-1)/29*14),bend:.85+n*.017,hill:650+Math.floor((n-1)/5)*130+(n%5)*24,theme:'desert'};}
 const stage=Math.min(3,Math.floor((level-1)/5));
 return{stage,difficulty:Math.round(3+(level-1)/19*26),bend:.36+level*.038,hill:135+stage*245+level*22,theme:['meadow','farm','forest','valley'][stage]};
}
function trackFeatures(level){
 if(level>50)return Ice.features(level);
 const features=[];
 if(level>=4){const from=35+(level*7)%35;features.push({kind:'bridge',from,to:from+20});}
 if(level>=8){const from=142+(level*3)%28;features.push({kind:'tunnel',from,to:from+21});}
 if(level>=7){const from=194+(level*3)%9;features.push({kind:'bridge',from,to:from+23});}
 if(level>=5&&level!==20&&level!==50){const from=104+(level%4)*3;features.push({kind:'ramp',from,to:from+6});}
 if(level>=14&&level!==20&&level!==50)features.push({kind:'ramp',from:232,to:238});
 return features;
}
function surfaceAt(index){const i=(index%COUNT+COUNT)%COUNT;return state?.features?.find(f=>i>=f.from&&i<=f.to)?.kind||'road';}
function makeObstacles(level,rand){
 if(level>50)return Ice.obstacles(level,rand);
 if(level<6)return[];const count=2+Math.floor((level-6)/5)*2;
 return Array.from({length:count},(_,i)=>({d:11500+i*(LENGTH-15000)/count+(rand()-.5)*1000,x:[-.64,0,.64][Math.floor(rand()*3)],kind:i%3===1?'puddle':'cone',hitLap:-1}));
}
function addEffect(type){if(state){state.effects??=[];state.effects.push({type,age:0,life:type==='lightning'?.45:.8});state.effects=state.effects.slice(-12);}}

function seedRandom(seed){let s=seed;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function start(level,session=null){if(!GFX.canRace(level)){GFX.prepare(level,()=>start(level,session));return;}closeModal();resetInput();const engine=session?engineValue(session.engine,saved.engine):saved.engine;MAX=ENGINE_CLASSES[engine].speed;COUNT=level===70?520:260;LENGTH=COUNT*SEG;const rand=seedRandom(level*39871),profile=trackProfile(level),curves=courseCurves(level,profile);const boss=[20,50,70].includes(level),blocks=[];const amount=level===20||level===63?9:10;for(let i=0;i<amount;i++)blocks.push({d:3500+i*(LENGTH-6000)/amount+(rand()-.5)*1000,x:(rand()-.5)*1.25,lap:-1});state={level,engine,freeRace:!session&&raceMode==='free',boss,singleBlocks:boss||level===63,sand:level>20&&level<=50,ice:level>50,laps:level===70?1:2,finishDistance:LENGTH*(level===70?1:2),profile,features:trackFeatures(level),obstacles:makeObstacles(level,rand),effects:[],impact:0,curves,blocks,opponents:Array.from({length:boss?1:3},(_,i)=>({d:(boss?1700:500)+i*650,x:[-.52,.08,.58][i],target:0,speed:MAX*(.70+profile.difficulty*.0058+i*.01),slow:0,hyp:0,spin:0,freeze:0,color:['#f2b933','#719dd4','#cb81ac'][i],boss,pizza:level===50,burger:level===70})),d:0,x:0,speed:0,time:0,count:3.3,inventory:[null,null,null],boost:0,jump:0,rampAir:0,rampDuration:1,freeze:0,slow:0,paused:false,finished:false,shots:[],bananas:[],particles:[],nextShot:10,bossWarning:0,hitFlash:0,rank:1,nextBoem:0,spin:0};if(state.ice)Ice.init(state);RaceAdventure.init(state);renderPlayer();$('#recoveryCue').classList.add('hidden');$('#iceCue').classList.add('hidden');$('#home').classList.add('hidden');$('#race').classList.remove('hidden');$('#levelLabel').textContent=`L${String(level).padStart(2,'0')} · ${engine} PK · ${profile.difficulty}%`;$('#trackLabel').textContent=names[level-1];$('#danger').classList.add('hidden');$('#toast').classList.remove('show');$('#countdown').textContent='3';$('#startVoice').textContent=RaceAudio.caption(level);$('#startVoice').classList.remove('hidden');RaceAudio.lights(3);state.rank=state.opponents.length+1;$('#position').innerHTML=`${state.rank}<span>/${state.opponents.length+1}</span>`;$('#lap').innerHTML=`1<span>/${state.laps}</span>`;$('#time').textContent='0:00';$('#speed').textContent='0';state.steer=0;state.checkpointAt=0;if(session)restoreSession(session);if(!state.freeRace)saved.session=null;buildScenery(level);modeUI();renderInventory();resize({fresh:true});RaceAudio.start(level);beep(320,.2);}
// Keep slot nodes stable: collecting a block cannot replace a finger's touch target.
function renderInventory(){
 const root=$('#inventory');
 if(!root.children.length)root.innerHTML=[0,1,2].map(i=>`<button type="button" class="slot empty" data-slot="${i}"></button>`).join('');
 [...root.children].forEach((b,i)=>{const item=state.inventory[i];b.classList.toggle('empty',item===null);b.setAttribute('aria-label',item===null?'Leeg vak':itemNames[item]+' gebruiken');b.innerHTML=`${item===null?'+':powerMarkup(item)}<small>${i+1}</small>`;});
}
$('#inventory').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-slot]');if(!b||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();useItem(+b.dataset.slot);});
$('#inventory').addEventListener('click',e=>{if(e.detail===0){const b=e.target.closest('[data-slot]');if(b)useItem(+b.dataset.slot);}});
function allowedItems(level){return level>50?[0,1,2,3,4,5]:level>20?[1,3,5]:[0,1,2,3,4];}
function randomItem(level=state?.level||1){if(level>50){const v=Math.random()*100;return v<35?5:v<55?1:v<75?4:v<85?2:v<95?3:0;}if(level>20)return [1,3,5][Math.floor(Math.random()*3)];const v=Math.random()*100;return v<50?0:v<70?1:v<85?2:v<95?3:4;}
function targetOpponent(s){return s.opponents.filter(o=>o.d>s.d).sort((a,b)=>a.d-b.d)[0]||s.opponents.slice().sort((a,b)=>Math.abs(a.d-s.d)-Math.abs(b.d-s.d))[0];}
function useItem(slot){const s=state;if(!s||s.paused||s.finished)return;if(s.recovery>0||s.rescue>0){toast('Even wachten op je redding. Je item blijft bewaard.');return;}if(s.count>0){toast('Wacht op GO! Daarna kun je je item gebruiken.');return;}const item=s.inventory[slot];if(!Number.isInteger(slot)||slot<0||slot>2||!Number.isInteger(item)||item<0||item>5)return;if(!allowedItems(s.level).includes(item)){toast('Dit item hoort niet bij deze wereld.');return;}let msg='';if(item===0){s.opponents.forEach(o=>o.slow=3);s.hitFlash=.16;addEffect('lightning');msg='⚡ Onweer! Iedereen remt af.';}if(item===1){const target=targetOpponent(s);if(target){target.hyp=10;msg='🌀 Tien seconden verwarring!';}else{msg='🌀 Geen tegenstander beschikbaar. Je item blijft bewaard.';toast(msg);return;}}if(item===2){s.boost=4;addEffect('boost');msg='🚀 Vier seconden boost!';}if(item===3){s.bananas.push({d:s.d-450,x:s.x,owner:'player'});msg='🍌 Banaan achter je!';}if(item===5){const target=targetOpponent(s);if(!target)return;target.freeze=2;addEffect('ice');msg='🧊 Je tegenstander is twee seconden bevroren!';}if(item===4){s.jump=1.4;if(s.ice)Ice.crack(s);addEffect('jump');msg='🦘 Daar ga je!';}s.inventory[slot]=null;s.fullNotified=false;renderInventory();toast(msg);beep(item===0?130:780,.15,'triangle');}
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

function pause(){if(!state||state.finished)return;state.paused=true;RaceAudio.stop();checkpoint();resetInput();showModal(`<span class="eyebrow">EVEN UITROLLEN</span><h2>Motor op pauze.</h2><p>Je race staat voor je klaar.</p><div class="result-actions"><button class="primary" id="resume">Verder racen ›</button><button class="secondary" id="retry">Opnieuw</button><button class="secondary" id="backMap">Wereldkaart</button></div>`);$('#resume').onclick=resume;$('#retry').onclick=()=>start(state.level);$('#backMap').onclick=backMap;}
function resume(){closeModal();if(state)state.paused=false;resetInput();}$('#pause').onclick=pause;
function backMap(){RaceAudio.stop();$('#startLights').classList.add('hidden');$('#startVoice').classList.add('hidden');checkpoint();if(state)selectedWorld=worldOf(state.level);$('#recoveryCue').classList.add('hidden');$('#iceCue').classList.add('hidden');state=null;closeModal();$('#race').classList.add('hidden');$('#home').classList.remove('hidden');renderMap();renderPlayer();showWorldMap();resize();}
function finish(){const s=state;if(s.finished)return;s.finished=true;s.speed=0;RaceAudio.stop();if(!s.freeRace)saved.session=null;resetInput();const rank=1+s.opponents.filter(o=>o.d>s.d).length,won=rank===1;if(won&&!s.freeRace){if(!saved.wins.includes(s.level)){saved.wins.push(s.level);saved.xp+=100;}if(!saved.best[s.level]||s.time<saved.best[s.level])saved.best[s.level]=s.time;persist();}else persist();beep(won?880:220,.35,'triangle');showModal(`<span class="eyebrow">${won?'FINISH! HEEL NETJES.':'FINISH! NOG EEN KEER?'}</span>${won?victoryMarkup():''}<div class="result-big">${rank}${rank===1?' 🏆':''}<small style="font-size:22px">e plaats</small></div><h2>${won?(s.level===20?'Hotdog-hond verslagen!':s.level===50?'Pizzaman verslagen!':s.level===70?'Burgerkoning verslagen!':'Die is binnen!'):'Je zit er dichtbij.'}</h2><p>${names[s.level-1]} · ${formatTime(s.time)}${won&&!s.freeRace&&s.level<TOTAL_LEVELS?`<br>Level ${s.level+1} is nu open.`:''}${won&&s.level===20?'<br>De Zandwereld is nu open! Nog 30 races om te ontdekken.':''}${won&&s.level===50?'<br>De IJs-Wereld is nu open! Twintig nieuwe races wachten op je.':''}${won&&s.level===62?'<br>Geheime IJskamer ontdekt: level 63 heeft negen IJs Lucky Blocks!':''}${won&&s.level===70?'<br>Alle zeventig levels van Jaylenns Racewereld gewonnen!':''}</p><div class="tip">${won?'Goed gestuurd! Probeer je beste tijd te verbeteren.':'Tip: blijf op de baan, rem kort voor bochten en gebruik je items op tijd.'}</div><div class="result-actions">${won&&s.level<TOTAL_LEVELS?'<button class="primary" id="nextRace">Volgende race ›</button>':''}<button class="secondary" id="again">Nog een race</button><button class="secondary" id="backMap">Wereldkaart</button></div><p class="saved-note">${s.freeRace?'Vrije race · je avonturenvoortgang blijft ongewijzigd.':storageAvailable?'Voortgang opgeslagen op dit apparaat.':'Opslaan is geblokkeerd in deze browser. Bewaar je voortgang via de wereldkaart.'}</p>`);if($('#nextRace'))$('#nextRace').onclick=()=>start(s.level+1);$('#again').onclick=()=>start(s.level);$('#backMap').onclick=backMap;}
function formatTime(t){return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function circularGap(a,b){let d=(a-b)%LENGTH;if(d< -LENGTH/2)d+=LENGTH;if(d>LENGTH/2)d-=LENGTH;return d;}
function update(dt){const s=state;if(!s||s.paused||s.finished)return;if(s.count>0){const before=Math.ceil(s.count);s.count-=dt;RaceAudio.lights(s.count>.8?3:1);const now=Math.ceil(s.count);$('#countdown').textContent=s.count>.35?String(Math.min(3,Math.max(1,now))):'GO!';if(now!==before)beep(now<=0?800:440,.13);if(s.count<=0){$('#countdown').textContent='';$('#startVoice').classList.add('hidden');RaceAudio.lights(0);RaceAudio.go();toast('Sturen: linkerduim. Autogas staat '+(saved.auto?'aan!':'uit.')); }return;}s.time+=dt;if(s.time<1.2)RaceAudio.lights(0);else $('#startLights').classList.add('hidden');RaceAdventure.timers(s,dt);if(s.ice)Ice.timers(s,dt);for(const fx of s.effects)fx.age+=dt;s.effects=s.effects.filter(fx=>fx.age<fx.life);s.impact=Math.max(0,s.impact-dt);for(const k of ['boost','jump','freeze','slow','spin','hitFlash'])s[k]=Math.max(0,s[k]-dt);const steer=clamp((input.right?1:0)-(input.left?1:0)+input.analog,-1,1),curve=s.curves[Math.floor((s.d%LENGTH)/SEG)];if(s.freeze>0||s.rescue>0||s.recovery>0)s.speed=0;else{let target=(saved.auto||input.gas)?MAX:0;if(s.boost>0)target*=1.42;if(input.brake)target=MAX*.24;if(Math.abs(s.x)>(s.ice?Ice.width(s.level,s.d):1.02))target*=.48;if(s.slow>0||s.spin>0)target*=.55;if(s.ice&&(s.basket>0||s.lettuce>0))target=Math.min(target,MAX*Ice.speedFactor(s));s.speed=lerp(s.speed,target,Math.min(1,dt*(target<s.speed?3.2:1.4)));}const speedRatio=s.speed/MAX;const sensitivity={calm:1.02,normal:1.35,direct:1.68}[saved.sensitivity]||1.35;s.steer=lerp(s.steer||0,steer,1-Math.exp(-dt*15));let lateral=s.speed>30?s.steer*sensitivity*(.55+Math.min(speedRatio,1)*.45):0;const drift=curve*.055*speedRatio*speedRatio*(1+(MAX/3100-1)*.65);lateral-=drift;if(saved.assist&&Math.abs(s.x)>.84&&steer*Math.sign(s.x)<=0)lateral-=Math.sign(s.x)*Math.min(.32,(Math.abs(s.x)-.84)*1.1);if(s.ice)lateral=Ice.lateral(s,lateral,dt);if(s.recovery>0||s.rescue>0)lateral=0;s.x+=lateral*dt;s.x=clamp(s.x,-1.65,1.65);const previousDistance=s.d;s.d+=s.speed*dt;updateRampFlight(s,previousDistance,dt,true);const lap=Math.floor(s.d/LENGTH);for(const b of s.blocks){const near=lap*LENGTH+b.d;if((s.singleBlocks?(lap===0&&b.lap<0):b.lap!==lap)&&Math.abs(near-s.d)<210&&Math.abs(b.x-s.x)<.28&&s.jump<.9&&s.rampAir<.8&&!s.recovery&&!s.rescue){if(s.inventory.includes(null)){const item=randomItem();s.inventory[s.inventory.indexOf(null)]=item;b.lap=lap;renderInventory();addEffect('pickup');toast(`${icons[item]} ${itemNames[item]} gevonden!`);beep(960,.09);}else{b.lap=lap;if(!s.fullNotified){toast('Alle drie vakjes vol! Gebruik een power-up.');s.fullNotified=true;}}}}
for(let i=0;i<s.opponents.length;i++){const o=s.opponents[i];o.slow=Math.max(0,o.slow-dt);o.hyp=Math.max(0,o.hyp-dt);o.spin=Math.max(0,(o.spin||0)-dt);o.freeze=Math.max(0,(o.freeze||0)-dt);const tactic=botTactic(s,o,i),ideal=tactic.ideal,previousX=o.x;if(!o.recovery)o.x=lerp(o.x,ideal+(o.hyp>0?Math.sin(s.time*8)*.45:0),dt*2);o.steer=clamp((o.x-previousX)/Math.max(dt,.001)*1.6,-1,1);let speed=o.freeze>0||o.rescue>0||o.recovery>0?0:o.speed*tactic.factor*(s.ice?Ice.speedFactor(o):1)*(o.slow>0?.35:o.spin>0?.45:1);if(o.d<s.d-6500)speed*=1.08;const previousOpponent=o.d;o.d+=speed*dt;updateRampFlight(o,previousOpponent,dt);if(!s.recovery&&!s.rescue&&!o.recovery&&!o.rescue&&Math.abs(o.d-s.d)<170&&Math.abs(o.x-s.x)<(o.boss?.44:.24)&&!airborne(s)&&!airborne(o)){s.speed*=Math.pow(.58,dt*5);s.x+=Math.sign(s.x-o.x||1)*dt*.35;s.impact=.35;}for(const b of s.bananas){if(!b.used&&b.owner==='player'&&!airborne(o)&&Math.abs(b.d-o.d)<180&&Math.abs(b.x-o.x)<.28){b.used=true;o.spin=2;toast('🍌 Twee seconden draaien!');}}}
if(!s.ice)for(const obstacle of s.obstacles){const gap=circularGap(obstacle.d,s.d);if(obstacle.hitLap!==lap&&Math.abs(gap)<190&&Math.abs(obstacle.x-s.x)<.27&&!airborne(s)){obstacle.hitLap=lap;s.slow=obstacle.kind==='cone'?1.25:.75;s.impact=.5;addEffect('impact');toast(obstacle.kind==='cone'?'Oeps, een pion!':'Spetters! Even minder grip.');}}
// Ordinary bots occasionally leave a visible banana. Their frequency rises gently.
if(!s.boss&&Math.floor((s.time-dt)/11)!==Math.floor(s.time/11)){const o=s.opponents[Math.floor(s.time/11)%3];s.bananas.push({d:o.d-300,x:o.x,owner:'bot'});}
for(const b of s.bananas){if(!s.recovery&&!s.rescue&&!b.used&&b.owner==='bot'&&Math.abs(b.d-s.d)<160&&Math.abs(b.x-s.x)<.25&&!airborne(s)){b.used=true;s.spin=2;addEffect('impact');toast('🍌 Twee seconden draaien!');beep(160,.2);}}
if(s.level===20&&s.time>=s.nextShot){const dog=s.opponents[0];s.shots.push({d:dog.d,x:s.x,speed:dog.d>s.d?-3000:MAX*1.9,life:10});s.nextShot+=10;s.bossWarning=1;toast('🧊 IJsblok! Ontwijk of spring!');beep(180,.15,'square',.03);}
for(const shot of s.shots){const old=shot.d-s.d;shot.d+=shot.speed*dt;shot.life-=dt;const near=Math.abs(shot.d-s.d)<210||old*(shot.d-s.d)<0;if(!s.recovery&&!s.rescue&&!shot.used&&near&&Math.abs(shot.x-s.x)<.27){shot.used=true;if(airborne(s)){toast('🦘 Mooi over het ijs gesprongen!');}else{s.freeze=2;s.speed=0;s.hitFlash=.3;addEffect('ice');toast('🧊 Twee seconden bevroren!');beep(100,.3,'triangle');}}}
RaceAdventure.check(s,dt);if(s.ice)Ice.update(s,dt);s.shots=s.shots.filter(x=>x.life>0&&!x.used);s.bananas=s.bananas.filter(x=>!x.used&&x.d>s.d-15000);s.rank=1+s.opponents.filter(o=>o.d>s.d).length;const behind=s.opponents.some(o=>s.d-o.d>0&&s.d-o.d<1300)||s.shots.some(o=>o.d<s.d&&s.d-o.d<4500),frontIce=s.shots.some(o=>Math.abs(o.d-s.d)<4500);$('#danger').classList.toggle('hidden',!behind&&!frontIce);$('#danger').firstChild.textContent=frontIce?'⚠ IJSBLOK IN DE BUURT ':'⚠ GEVAAR ACHTER JE ';$('#danger i').style.width=`${frontIce?95:65}%`;$('#speed').textContent=Math.round(s.speed/MAX*ENGINE_CLASSES[s.engine].kph);$('#position').innerHTML=`${s.rank}<span>/${s.opponents.length+1}</span>`;$('#lap').innerHTML=`${Math.min(s.laps,lap+1)}<span>/${s.laps}</span>`;$('#time').textContent=formatTime(s.time);if(s.level===20)$('#trackLabel').textContent=`Hotdog-Hond · ijs over ${Math.ceil(Math.max(0,s.nextShot-s.time))}s`;if(s.time-s.checkpointAt>3){checkpoint();s.checkpointAt=s.time;}if(s.ice)Ice.hud(s);RaceAdventure.hud(s);if(!s.recovery&&!s.rescue&&s.d>=s.finishDistance)finish();}
function poly(points,fill){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
let projection=[];
function draw(){const s=state;if(!s)return;const horizon=view.horizon;ctx.fillStyle=s.ice?'#d2eef6':s.sand?'#ddb46e':'#78ae50';ctx.fillRect(0,0,W,H);drawLandscape(ctx,W,H,s);const camera=s.d-view.cameraOffset,base=Math.floor(camera/SEG),pct=(camera%SEG+SEG)%SEG/SEG;projection=[];const bendScale=3+Math.min(3,s.profile.stage*.6+s.level*.05);let curveX=0,dx=-s.curves[(base%COUNT+COUNT)%COUNT]*pct*bendScale;const roadW=1800;const cameraElevation=elevation(s.d);for(let n=0;n<(quality.level===2?165:quality.level===1?135:105);n++){const index=base+n,segIndex=(index%COUNT+COUNT)%COUNT,z=index*SEG-camera;if(z<50){dx+=s.curves[segIndex]*bendScale;curveX+=dx;continue;}const scale=.9/z;projection.push({index,segIndex,z,scale,x:W/2+scale*(curveX-s.x*roadW)*W/2,y:horizon+scale*(900+cameraElevation-elevation(index*SEG))*H*.62,w:scale*roadW*W/2*(s.ice?Ice.width(s.level,index*SEG):1),fullW:scale*roadW*W/2});curveX+=dx;dx+=s.curves[segIndex]*bendScale;}
let crest=H;for(let i=0;i<projection.length-1;i++){const a=projection[i],b=projection[i+1];a.clipY=crest;a.visible=b.y<a.y&&b.y<crest;crest=Math.min(crest,a.y,b.y);}if(projection.length)projection[projection.length-1].clipY=crest;
if(surfaceAt(Math.floor(s.d/SEG))==='tunnel'){ctx.fillStyle='#183229bb';ctx.fillRect(0,0,W,H);}
for(let j=projection.length-2;j>=0;j--){const a=projection[j],b=projection[j+1];if(!a.visible||a.y>H*1.7||b.y>H*1.5)continue;ctx.save();ctx.beginPath();ctx.rect(0,0,W,Math.max(0,a.clipY));ctx.clip();const alt=Math.floor(a.index/3)%2===0,terrain=surfaceAt(a.segIndex);poly([[0,a.y+1],[a.x-a.w*1.1,a.y+1],[b.x-b.w*1.1,b.y],[0,b.y]],terrain==='bridge'?(alt?'#73b4b2':'#76b8b4'):terrain==='tunnel'?(alt?'#78b04e':'#7ab24f'):(s.ice?(alt?'#e4f5fa':'#d7eef6'):s.sand?(alt?'#ddb46e':'#dfb772'):(alt?'#7eb653':'#80b854')));poly([[a.x+a.w*1.1,a.y+1],[W,a.y+1],[W,b.y],[b.x+b.w*1.1,b.y]],terrain==='bridge'?(alt?'#73b4b2':'#76b8b4'):(s.ice?(alt?'#e4f5fa':'#d7eef6'):s.sand?(alt?'#ddb46e':'#dfb772'):(alt?'#7eb653':'#80b854')));poly([[a.x-a.w*1.1,a.y+1],[a.x+a.w*1.1,a.y+1],[b.x+b.w*1.1,b.y],[b.x-b.w*1.1,b.y]],terrain==='bridge'?'#c9aa71':terrain==='tunnel'?'#79907e':(s.sand?(alt?'#fff0c5':'#bd8657'):(alt?'#f4f3df':'#b44439')));poly([[a.x-a.w,a.y+1],[a.x+a.w,a.y+1],[b.x+b.w,b.y],[b.x-b.w,b.y]],terrain==='bridge'?(alt?'#ad996c':'#b09d70'):terrain==='tunnel'?'#56695e':(s.sand?(alt?'#cba975':'#cead79'):(alt?'#5d6d74':'#607177')));GFX.trackTexture(ctx,a,b,s,terrain);if(alt){for(const lane of [-.333,.333])poly([[a.x+a.w*(lane-.012),a.y+1],[a.x+a.w*(lane+.012),a.y+1],[b.x+b.w*(lane+.012),b.y],[b.x+b.w*(lane-.012),b.y]],'#eaf0d6aa');}if(s.ice)Ice.road(ctx,a,b,s,terrain);RaceAdventure.ground(ctx,a,b,s);drawRoadFurniture(ctx,a,b,terrain);if(a.segIndex===0||a.segIndex===1){for(let col=0;col<12;col++)poly([[a.x-a.w+a.w*col/6,a.y+1],[a.x-a.w+a.w*(col+1)/6,a.y+1],[b.x-b.w+b.w*(col+1)/6,b.y],[b.x-b.w+b.w*col/6,b.y]],(col+a.segIndex)%2?'#faf5df':'#243f34');}ctx.restore();}
const sprites=[];for(const p of projection){if(p.y>H*1.35)continue;const idx=p.segIndex;if(surfaceAt(idx)==='bridge'||s.ice&&surfaceAt(idx)==='palace')continue;
 if(idx%(quality.level===2?4:quality.level===1?6:8)===0&&surfaceAt(idx)!=='tunnel'){sprites.push({p,x:1.42+(idx%3)*.23,type:'scenery',kind:courseTree(s,idx,1)});sprites.push({p,x:-1.5-(idx%5)*.19,type:'scenery',kind:courseTree(s,idx,-1)});}
 if(quality.level>0&&idx%3===0&&surfaceAt(idx)!=='tunnel'){sprites.push({p,x:idx%2?-1.13:1.15,type:'scenery',kind:idx%9===0?'flowers':'grass'});}
 if(idx%12===2)sprites.push({p,x:idx%2?1.30:-1.27,type:'scenery',kind:'fence'});
 if(idx%(s.profile.theme==='farm'?23:47)===8)sprites.push({p,x:idx%2?2.15:-2.1,type:'scenery',kind:'barn'});
 if(idx%(s.profile.theme==='farm'?37:71)===15)sprites.push({p,x:idx%2?-2.3:2.4,type:'scenery',kind:'mill'});
 if(idx%(s.profile.theme==='valley'?29:59)===5)sprites.push({p,x:idx%2?2.2:-2.4,type:'scenery',kind:'pond'});
 if(idx%19===6)sprites.push({p,x:idx%2?1.65:-1.6,type:'scenery',kind:'hay'});
 if(idx%23===9)sprites.push({p,x:idx%2?-1.3:1.35,type:'scenery',kind:'rocks'});
 if(idx===3||idx===127)sprites.push({p,x:1.3,type:'scenery',kind:'sign'});
}
for(const corner of courseCorners(s.level)){for(const index of [corner.from-5,corner.from+3,corner.from+11]){const p=projection.find(p=>p.segIndex===index);if(p)sprites.push({p,x:corner.dir>0?-1.18:1.18,type:'corner',direction:corner.dir});}}
for(const f of s.features)if(f.kind==='ramp'){const p=projection.find(p=>p.segIndex===f.from-4);if(p)sprites.push({p,x:1.18,type:'rampSign'});}
for(const f of s.features)if(f.kind==='tunnel'){for(const endpoint of [f.from,f.to]){const p=projection.find(p=>p.segIndex===endpoint);if(p&&p.y<H*1.2)sprites.push({p,x:0,type:'portal'});}}
function projectDist(d){const z=d-camera;if(z<100||z>31500)return null;const idx=Math.floor(d/SEG),p=projection[idx-(base+1)];const actual=p?.index===idx?p:projection.find(a=>a.index===idx);if(!actual)return null;const next=projection[projection.indexOf(actual)+1]||actual,t=(d/SEG)%1;return{scale:.9/z,x:lerp(actual.x,next.x,t),y:lerp(actual.y,next.y,t),w:lerp(actual.fullW||actual.w,next.fullW||next.w,t),fullW:lerp(actual.fullW||actual.w,next.fullW||next.w,t),clipY:actual.clipY,z};}
const lap=Math.floor(s.d/LENGTH);for(let l=Math.max(0,lap-1);l<=lap+1;l++)for(const b of s.blocks){if(s.singleBlocks?(l!==0||b.lap>=0):b.lap===l)continue;const p=projectDist(l*LENGTH+b.d);if(p)sprites.push({p,x:b.x,type:'block',seed:b.d});}for(let l=Math.max(0,lap-1);l<=lap+1;l++)for(const obstacle of s.obstacles){const p=projectDist(l*LENGTH+obstacle.d);if(p)sprites.push({p,x:obstacle.x,type:obstacle.kind,obstacle});}for(const o of s.opponents){const p=projectDist(o.d);if(p)sprites.push({p,x:o.x,type:'kart',o});}for(const b of s.bananas){const p=projectDist(b.d);if(p)sprites.push({p,x:b.x,type:'banana'});}for(const shot of s.shots){const p=projectDist(shot.d);if(p)sprites.push({p,x:shot.x,type:'ice'});}
if(s.ice)Ice.sprites(s,projection,projectDist,sprites);sprites.sort((a,b)=>b.p.z-a.p.z);for(const v of sprites){const p=v.p,x=p.x+p.w*v.x,y=p.y,k=p.scale*W*.65;if(x< -W*.4||x>W*1.4)continue;ctx.save();ctx.beginPath();ctx.rect(0,0,W,Math.max(0,p.clipY??H));ctx.clip();if(s.ice&&Ice.drawSprite(ctx,v,x,y,k,s)){ctx.restore();continue;}if(v.type==='corner'||v.type==='rampSign')drawCourseSign(ctx,x,y,k,v.type==='rampSign'?0:v.direction);if(v.type==='portal'){drawTunnelPortal(ctx,p);ctx.restore();continue;}if(v.type==='cone'||v.type==='puddle')drawHazard(ctx,v.type,x,y,k*2);if(v.type==='scenery')drawScenic(ctx,v.kind,x,y,k);if(v.type==='tree')tree(ctx,x,y,k*1.8);if(v.type==='flower'){for(let f=0;f<5;f++)ellipse(ctx,x+f*7*k,y-(f%2)*9*k,3*k,3*k,f%2?'#fff5c2':'#ffe6ed');}if(v.type==='fence'){ctx.strokeStyle='#e8d3a5';ctx.lineWidth=Math.max(1,k*4);ctx.beginPath();ctx.moveTo(x-25*k,y-16*k);ctx.lineTo(x+25*k,y-16*k);ctx.moveTo(x-20*k,y);ctx.lineTo(x-20*k,y-30*k);ctx.moveTo(x+20*k,y);ctx.lineTo(x+20*k,y-30*k);ctx.stroke();}if(v.type==='kart'){ctx.save();if(v.o.recovery>0){const pose=RaceAdventure.pose(v.o,W*.2,H*.2);ctx.globalAlpha=pose.alpha;ctx.translate(x,y);ctx.rotate(pose.angle);ctx.translate(-x,-y);}if(v.o.spin>0){ctx.translate(x,y);ctx.rotate(s.time*10);ctx.translate(-x,-y);}kart(ctx,x,y-rampLift(v.o)*80*k,k*(Math.min(1.7,W/340,H/390)*.95/(.9/view.cameraOffset*W*.65))*(v.o.boss?2.15:1),v.o.color,v.o.burger?'burger':v.o.pizza?'pizza':v.o.boss,v.o.steer||0);ctx.restore();RaceAdventure.effect(ctx,v.o,x,y,k);if(s.ice)Ice.racerEffects(ctx,v.o,x,y,k);if(v.o.slow>0)GFX.effect(ctx,1,x,y-105*k,48*k,undefined,.8);if(v.o.mistake>0)ellipse(ctx,x-34*k,y+2*k,18*k,6*k,'#dbcaa277');if(v.o.freeze>0)rr(ctx,x-45*k,y-120*k,90*k,125*k,9*k,'#bbf5ff88','#e6ffff');if(v.o.hyp>0){ctx.fillStyle='#e3acff';ctx.font=`${Math.max(8,k*24)}px sans-serif`;ctx.fillText('🌀',x,y-100*k);for(let i=0;i<6;i++){const a=s.time*4+i*Math.PI/3;ellipse(ctx,x+Math.cos(a)*45*k,y-75*k+Math.sin(a)*35*k,3*k,3*k,'#e0a0ff');}}}if(v.type==='block'){const size=90*k,bob=Math.sin(performance.now()/300+v.seed)*5*k;if(!GFX.effect(ctx,0,x,y-size*.8+bob,size*1.6)){ctx.save();ctx.translate(x,y-size*.8+bob);ctx.rotate(Math.sin(performance.now()/700+v.seed)*.12);rr(ctx,-size/2,-size/2,size,size,5*k,'#f7ce42','#fff0a4');ctx.fillStyle='#fffbe6';ctx.textAlign='center';ctx.font=`bold ${size*.8}px sans-serif,sans-serif`;ctx.fillText('?',0,size*.29);ctx.restore();}}if(v.type==='banana'){if(!GFX.effect(ctx,4,x,y-15*k,58*k)){ctx.font=`${Math.max(8,33*k)}px sans-serif`;ctx.textAlign='center';ctx.fillText('🍌',x,y);}}if(v.type==='ice'){if(!GFX.effect(ctx,5,x,y-22*k,67*k)){rr(ctx,x-24*k,y-42*k,48*k,42*k,8*k,'#b5f2ff','#f0ffff');ctx.strokeStyle='#fff';ctx.lineWidth=2*k;ctx.beginPath();ctx.moveTo(x-17*k,y-30*k);ctx.lineTo(x+10*k,y-10*k);ctx.stroke();}}ctx.restore();}
const steer=s.steer||0,jump=Math.max(s.jump>0?Math.sin((1.4-s.jump)/1.4*Math.PI)*H*.14:0,rampLift(s)*Math.min(H*.19,150)),ps=Math.min(1.7,W/340,H/390)*.95;let bob=s.speed>100?Math.sin(performance.now()/65)*1.1:0;const py=view.playerY;const shake=s.impact>0?Math.sin(performance.now()/17)*s.impact*7:0;if(s.boost>0){for(let i=0;i<8;i++){const xx=W*.5+(i-3.5)*W*.12;ctx.strokeStyle='#fff7b370';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx,H*.65);ctx.lineTo(xx+(xx-W*.5)*.3,H);ctx.stroke();}ellipse(ctx,W/2,view.playerY+4,18*ps,25*ps,'#ffb74a');}ctx.save();const exitPose=RaceAdventure.pose(s,W,H);ctx.translate(exitPose.dx,exitPose.dy);ctx.globalAlpha=exitPose.alpha;if(s.recovery>0||s.rescue>0){ctx.translate(W/2,py-50*ps);ctx.rotate(exitPose.angle);ctx.translate(-W/2,-py+50*ps);}if(s.spin>0){ctx.translate(W/2,py-50*ps);ctx.rotate(s.time*10);ctx.translate(-W/2,-py+50*ps);}kart(ctx,W/2+shake,py-jump+bob,ps,saved.player.color,false,steer,saved.player);ctx.restore();if(airborne(s))ellipse(ctx,W/2,py+5,45*ps,8*ps,'#21452e33');if(s.freeze>0){rr(ctx,W/2-51*ps,py-105*ps,102*ps,112*ps,18*ps,'#c5f5ff88','#eaffff');ctx.fillStyle='#f2ffff';ctx.textAlign='center';ctx.font=`bold ${25*ps}px sans-serif`;ctx.fillText(`${s.freeze.toFixed(1)}s`,W/2,py-110*ps);}if(s.hitFlash>0){ctx.fillStyle=`rgba(225,250,255,${s.hitFlash*1.8})`;ctx.fillRect(0,0,W,H);}if(Math.abs(s.x)>1.02&&s.speed>500){ctx.fillStyle='#dbc58f99';for(let i=0;i<8;i++){const t=(performance.now()/400+i*.17)%1;ellipse(ctx,W/2+(i%2?1:-1)*(35+t*35)*ps,py+5+t*30,5*t*ps,4*t*ps);}}RaceAdventure.effect(ctx,s,W/2,py,ps,true);if(s.ice){Ice.racerEffects(ctx,s,W/2,py,ps);Ice.weather(ctx,s);}drawRaceEffects(ctx,s,view.playerY);drawMini();}
function drawMini(){const c=$('#minimap').getContext('2d'),s=state;c.clearRect(0,0,130,90);c.lineWidth=8;c.strokeStyle='#deedc355';c.beginPath();c.ellipse(65,45,48,28,0,0,Math.PI*2);c.stroke();for(const o of s.opponents){const a=o.d/LENGTH*Math.PI*2-Math.PI/2;ellipse(c,65+48*Math.cos(a),45+28*Math.sin(a),3,3,o.boss?'#f8bc60':o.color);}const a=s.d/LENGTH*Math.PI*2-Math.PI/2;ellipse(c,65+48*Math.cos(a),45+28*Math.sin(a),5,5,'#eeffae');}
function applyQuality(level){quality.level=level;quality.dpr=level===2?Math.min(devicePixelRatio||1,1.75):level===1?Math.min(devicePixelRatio||1,1.25):1;if(W)resize();}
function loop(t){const elapsed=Math.min((t-last)/1000||.016,.12);last=t;if(state&&!state.paused&&!state.finished){quality.frames++;quality.elapsed+=elapsed;if(quality.elapsed>=5){const fps=quality.frames/quality.elapsed;if(saved.quality==='auto'&&fps<43&&quality.level>0)applyQuality(quality.level-1);quality.frames=0;quality.elapsed=0;}}if(state){let remaining=elapsed;while(remaining>0){const dt=Math.min(remaining,1/60);update(dt);remaining-=dt;}draw();}requestAnimationFrame(loop);}requestAnimationFrame(loop);


function restoreSession(session){
 const s=state;if(session.level!==s.level)return;
 for(const key of ['d','x','speed','time','boost','jump','rampAir','rampDuration','freeze','slow','spin','nextShot'])if(Number.isFinite(session[key]))s[key]=session[key];
 s.rampDuration=clamp(s.rampDuration,.85,1.2);s.rampAir=clamp(s.rampAir,0,s.rampDuration);s.x=clamp(s.x,-1.65,1.65);s.speed=clamp(s.speed,0,MAX*1.42);s.time=Math.max(0,s.time);s.count=2;if(s.sand){s.boost=0;s.jump=0;}
 if(Array.isArray(session.inventory)&&session.inventory.length===3)s.inventory=session.inventory.map(i=>Number.isInteger(i)&&allowedItems(s.level).includes(i)?i:null);
 if(Array.isArray(session.opponents)&&session.opponents.length===s.opponents.length)session.opponents.forEach((o,i)=>{for(const key of ['d','x','slow','hyp','spin','freeze','rampAir','rampDuration','lettuce','basket','rescue','iceShield','rescueTo','rescueLane'])if(Number.isFinite(o[key]))s.opponents[i][key]=o[key];});
 for(const o of s.opponents){o.rescue=clamp(o.rescue||0,0,3);o.rampDuration=clamp(o.rampDuration||1,.85,1.2);o.rampAir=clamp(o.rampAir||0,0,o.rampDuration);}
 if(Array.isArray(session.blocks)&&session.blocks.length===s.blocks.length)session.blocks.forEach((b,i)=>{if(Number.isInteger(b.lap))s.blocks[i].lap=b.lap;});
 if(Array.isArray(session.obstacles)&&session.obstacles.length===s.obstacles.length)session.obstacles.forEach((o,i)=>{if(Number.isInteger(o.hitLap))s.obstacles[i].hitLap=o.hitLap;if(Number.isFinite(o.brokenUntil))s.obstacles[i].brokenUntil=o.brokenUntil;});
 if(Array.isArray(session.bananas))s.bananas=session.bananas.filter(b=>Number.isFinite(b.d)&&Number.isFinite(b.x)&&['player','bot'].includes(b.owner)).slice(-30);
 if(Array.isArray(session.shots))s.shots=session.shots.filter(b=>Number.isFinite(b.d)&&Number.isFinite(b.x)&&Number.isFinite(b.speed)&&b.life>0).slice(-4);
 if(s.ice)Ice.restore(s,session.iceState);RaceAdventure.restore(s,session.adventure);
}

initPlayerUI();
GFX.init();
