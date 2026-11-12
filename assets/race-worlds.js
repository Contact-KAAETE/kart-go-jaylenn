/* Shared authoritative courses: Jaylenn's 70 original levels + five Party races. */
'use strict';
(()=>{
const titles=["Groene start", "Madeliefjespad", "Klaverbocht", "Houten hekjes", "Heuvelpret", "Windmolenweg", "Bloemenbocht", "Kronkelgras", "Zonnedal", "Kikkerplas", "Bosrand", "Dubbele bocht", "Hooibalenpad", "Heuvelsprint", "Klaverveld", "Bochtenfeest", "Grasstorm", "Laatste sprint", "Grote aanloop", "Hotdog-finale", "Het warme zand", "Duinenpad", "Zandbocht", "Oaseroute", "Gouden heuvels", "Palmenpad", "Zandspoor", "Woestijnwind", "Kronkelduin", "Zandvlakte", "Hoge duinen", "Droge bocht", "Rotsenpad", "Duintop", "Zandgolf", "Palmenbocht", "Zonnige lus", "Zandkronkels", "Lange duin", "Woestijnsprint", "Rotsbocht", "Zandvallei", "Hoge pas", "Duinenslinger", "Gouden route", "Zandstormpad", "Laatste oase", "Grote zandlus", "Aanloop naar pizza", "Pizzaman-finale", "Sneeuwstart", "Kristalbocht", "De eerste ijsdeur", "Bevroren vijver", "IJsschans", "Paleis van de sneeuw", "Glijspoor", "IJspegeltunnel", "De smalle zaal", "Winterbrug", "Sneeuwstormpad", "Spiegelijs", "Geheime IJskamer", "Het blauwe paleis", "Dubbele ijsschans", "De kristallen vallei", "Grote ijsdeur", "Laatste sneeuwtop", "Koninklijke aanloop", "Koning van de Burgers", "Start-Line Ramp Madness", "Lucky Block-trein", "De Vier Giga-Zones", "De 5 KM Kippen-Rodeo", "De Grote Finale-Megamix"];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,lanes=[-.62,0,.62];
const worlds=[{id:1,name:'Groene Wereld',from:1,to:20},{id:2,name:'Zandwereld',from:21,to:50},{id:3,name:'IJs-Wereld',from:51,to:70},{id:4,name:'Party-Wereld',from:71,to:75}];
function world(level){return level>70?4:level>50?3:level>20?2:1;}
function selection(value={}){const level=Number.isInteger(value.level)?clamp(value.level,0,75):0;return{level,world:level?world(level):1,mode:value.mode==='adventure'?'adventure':'free'};}
function length(level){return level===74||level===75?5000:level===73?3200:level===72?2200:level===70?5200:level>0&&level<71?2600:1800;}
function rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function profile(level){if(level>70)return{difficulty:20+(level-71)*2,bend:1.15,hill:950};if(level>50){const n=level-50;return{difficulty:Math.round(16+(n-1)/19*13),bend:.75+n*.025,hill:540+Math.floor((n-1)/5)*150+n*9};}if(level>20){const n=level-20;return{difficulty:Math.round(15+(n-1)/29*14),bend:.85+n*.017,hill:650+Math.floor((n-1)/5)*130+(n%5)*24};}return{difficulty:Math.round(3+(level-1)/19*26),bend:.36+level*.038,hill:135+Math.min(3,Math.floor((level-1)/5))*245+level*22};}
// The original course's harmonic bends and sharp corner windows, expressed in metres.
function geometry(level,d){if(!level)return{curve:0,height:0,width:1,feature:'road'};const count=level===70?520:260,lap=length(level)/(level===70||level>70?1:2),segment=((d/lap*count)%count+count)%count,phase=segment/count*Math.PI*2,p=profile(level);let curve=(Math.sin(phase*(level<3?2:3)+level*.25)*1.7+Math.sin(phase*5)*.45)*p.bend;
 const n=level>50?level-50+2:level>20?level-20+6:level;
 if(n>=3)for(const [start,dir] of [[75+level%3*5,level%2?1:-1],...(n>=9?[[172+level%3*4,level%2?-1:1]]:[]),...(n>=16?[[14,level%2?1:-1]]:[])]){const t=(segment-start)/23;if(t>0&&t<1)curve=mix(curve,dir*(2+Math.min(4.8,.9+n*.17)),Math.sin(Math.PI*t)**2);}
 let feature='road',width=1;const ranges=[];
 if(level>50&&level<71){ranges.push(['bridge',46+level%4*3,70+level%4*3],['ramp',104,110],['bridge',193,218]);if(level>=53)ranges.push(['palace',132,170+((level-50)%4)*3]);if(level>=60)ranges.push(['ramp',226,232]);if(level===70)ranges.push(['palace',302,354],['ramp',397,403],['bridge',430,454]);}
 else{if(level>=4)ranges.push(['bridge',35+(level*7)%35,55+(level*7)%35]);if(level>=8)ranges.push(['tunnel',142+(level*3)%28,163+(level*3)%28]);if(level>=7)ranges.push(['bridge',194+(level*3)%9,217+(level*3)%9]);if(level>=5&&![20,50].includes(level))ranges.push(['ramp',104+level%4*3,110+level%4*3]);}
 for(const [kind,from,to] of ranges)if(segment>=from&&segment<=to){feature=kind;if(kind==='palace')width=Math.max(.72,.96-Math.floor((segment-from)/3)*.02);}
 const height=p.hill/100*(Math.sin(phase*2+level*.2)*.54+Math.sin(phase*3)*.22)+Math.sin(phase)*p.hill/130;
 return{curve,height,width,feature};
}
function layout(config,seed){const level=config.level,w=world(level),random=rng((seed||1)^Math.imul(level+1,39871)),total=length(level),objects=[];let i=0;
 const add=(type,d,x=lanes[Math.floor(random()*3)])=>objects.push({id:i++,type,d,x});
 const blocks=level===20||level===63?9:level===72?24:level>70?16:10;
 for(let n=0;n<blocks;n++)add('block',120+(total-260)*(n+.3)/blocks+(random()-.5)*30);
 if(!level)return objects;
 const count=level<6?0:level>70?Math.floor(total/100):3+Math.floor(profile(level).difficulty/4);
 for(let n=0;n<count;n++){let d=200+n*(total-360)/Math.max(1,count)+(random()-.5)*35;let type=w===3?(n%3===1?'icicle':'spike'):w===4?['cone','tool','pizza','person','fire','meteor'][n%6]:(n%3===1?'water':'cone');
 if(level===71)type=n%3===0?'ramp':'cone';if(level===72)type=n%3===0?'ramp':'cone';if(level===73){const zone=Math.min(3,Math.floor(d/total*4));type=['tool','pizza','person','fire'][zone];}if(level===74)type=d>2000?'meteor':'cone';add(type,d);if(w===4&&n%3===0)add('star',d+30,lanes[(n+1)%3]);}
 if(level>=5&&! [20,50].includes(level))for(const f of [.24,.48,.77])add('ramp',total*f,0);
 if(w===4)add('ramp',60,0);
 return objects.sort((a,b)=>a.d-b.d);
}
function item(level,r){const v=r*100;if(world(level)===2)return[1,3,5][Math.min(2,Math.floor(r*3))];if(world(level)===3)return v<35?5:v<55?1:v<75?4:v<85?2:v<95?3:0;return v<50?0:v<70?1:v<85?2:v<95?3:4;}
function initRacer(p){Object.assign(p,{d:0,x:0,speed:0,steer:0,gas:false,brake:false,finished:false,finishAt:null,boost:0,jump:0,freeze:0,spin:0,hyp:0,slow:0,penalty:0,splash:0,invincible:0,slide:0,score:0,checkpoint:0,inventory:[null,null,null],seen:[],itemCount:0,catHit:false});return p;}
function setup(room){room.selection=selection(room.selection);room.seed ||=1;room.course=layout(room.selection,room.seed);room.claimed=[];room.bananas=[];room.holes=[];room.shots=[];room.event={cat:false,catAt:0,removedLane:room.seed%2?-.62:.62,d:0};room.nextShot=10;room.nextRoyal=12;room.royal=null;for(const p of room.players)initRacer(p);room.npcs=[20,50,70].includes(room.selection.level)?[initRacer({id:'boss',name:room.selection.level===20?'Hotdog-Hond':room.selection.level===50?'Pizzaman':'Burgerkoning',boss:room.selection.level,avatar:0,color:3,engine:250})]:[];if(room.npcs.length)room.npcs[0].d=70;}
function effect(room,p,kind,duration){if(p.invincible>0)return;p[kind]=Math.max(p[kind]||0,duration);if(['freeze','penalty'].includes(kind))p.speed=0;p.invincible=duration+.7;}
function use(room,p,slot){if(!Number.isInteger(slot)||slot<0||slot>2||p.penalty>0||p.freeze>0)return false;const v=p.inventory[slot];if(v===null||v===undefined)return false;const targets=[...room.players,...(room.npcs||[])].filter(t=>t.id!==p.id&&!t.finished).sort((a,b)=>Math.abs(a.d-p.d)-Math.abs(b.d-p.d));if([1,5].includes(v)&&!targets.length)return false;
 if(v===0)for(const t of targets)t.slow=3;if(v===1)targets[0].hyp=10;if(v===2&&world(room.selection.level)!==2){p.boost=4;if(world(room.selection.level)===3)room.holes.push({d:p.d,x:p.x,born:room.elapsed,open:room.elapsed+2,close:room.elapsed+5});}if(v===3)room.bananas.push({id:room.elapsed+':'+p.id,d:p.d-6,x:p.x,owner:p.id});if(v===4){p.jump=1.4;if(world(room.selection.level)===3)room.holes.push({d:p.d,x:p.x,born:room.elapsed,open:room.elapsed+2,close:room.elapsed+5});}if(v===5){targets[0].freeze=2;targets[0].speed=0;}p.inventory[slot]=null;return true;}
function step(room,p,dt,now,active=true){const level=room.selection.level,w=world(level),total=length(level);if(p.finished)return;
 for(const k of ['boost','jump','freeze','spin','hyp','slow','penalty','splash','invincible'])p[k]=Math.max(0,(p[k]||0)-dt);
 const old=p.d;if(!active){p.speed=0;return;}let max=({250:62,509:76,1000:90}[p.engine]||62);if(!level)max=85;const inputSteer=p.hyp>0?Math.sin(room.elapsed*8)*.6:p.steer||0;
 let target=p.gas&&!p.brake?max:0;if(p.boost>0)target*=1.42;if(p.slow>0||p.spin>0)target*=.4;if(p.freeze>0||p.penalty>0)target=0;
 p.speed+=clamp(target-p.speed,-(p.brake?150:90)*dt,55*dt);const shape=geometry(level,p.d),ratio=p.speed/max;let lateral=p.speed>1?(inputSteer*(w===4?1.1:1.2)-shape.curve*(w===4?.018:.055)*ratio*ratio):0;if(p.penalty>0||p.freeze>0)lateral=0;if(w===3){p.slide=mix(p.slide||0,lateral,1-Math.exp(-dt*(p.brake?10:3.5)));lateral=p.slide;}
 p.x=clamp(p.x+lateral*dt,-1.65,1.65);p.d=Math.min(total,p.d+Math.max(0,p.speed)*dt);
 if(Math.abs(p.x)>1.23&&p.invincible<=0){effect(room,p,'penalty',w===3?3:2);p.splash=w===3?3:0;p.x=0;p.slide=0;}
 if((level===74||level===75)&&p.d>=2500)p.checkpoint=Math.max(2500,p.checkpoint);
 if((level===74||level===75)&&room.event.cat&&room.elapsed>=room.event.catAt+2.5){p.catHit=true;if(Math.abs(p.x-room.event.removedLane)<.3&&p.jump<=0&&p.invincible<=0){effect(room,p,'penalty',6);p.x=0;p.d=Math.max(p.checkpoint,Math.min(p.d,2500));}}
 for(const o of room.course){if(o.d<old-10||o.d>p.d+4||p.seen.includes(o.id))continue;let ox=o.x;if(['pizza','person','meteor'].includes(o.type))ox+=Math.sin(room.elapsed*(o.type==='person'?1.8:2.6)+o.id)*.17;if(Math.abs(p.x-ox)>.28)continue;
 if(o.type==='block'){if(p.boss)continue;if(room.claimed.includes(o.id))continue;if(p.inventory.includes(null)){p.inventory[p.inventory.indexOf(null)]=item(level,rng(room.seed^Math.imul(o.id+1,199)^Math.imul(++p.itemCount,173))());if(level!==72)room.claimed.push(o.id);p.score+=20;}if(level!==72)p.seen.push(o.id);}
 else if(o.type==='star'){p.score+=20;p.seen.push(o.id);}
 else if(o.type==='ramp'){p.jump=Math.max(p.jump,1.2);p.score+=5;p.seen.push(o.id);}
 else if((o.type==='icicle'?p.jump>0:p.jump<=0)&&p.invincible<=0){p.seen.push(o.id);if(o.type==='water'){effect(room,p,'penalty',3);p.splash=3;}else effect(room,p,w===4?'penalty':'slow',w===4?6:1);}
 }
 for(const b of room.bananas)if(b.owner!==p.id&&!b.used&&Math.abs(b.d-p.d)<5&&Math.abs(b.x-p.x)<.28&&p.jump<=0){b.used=true;effect(room,p,'spin',2);}
 for(const h of room.holes)if(room.elapsed>=h.open&&room.elapsed<h.close&&Math.abs(h.d-p.d)<6&&Math.abs(h.x-p.x)<.3&&p.jump<=0){effect(room,p,'penalty',3);p.splash=3;}
 for(const s of room.shots)if(!s.used&&s.owner!==p.id&&Math.abs(s.d-p.d)<7&&Math.abs(s.x-p.x)<.34&&p.jump<=0){s.used=true;effect(room,p,'freeze',2);}
 if(p.d>=total){p.finished=true;p.speed=0;p.finishAt=now;}
}
function tick(room,dt,now,connected){room.elapsed=Math.max(0,(now-room.startAt)/1000);room.course ||=layout(room.selection,room.seed);room.event.d=Math.max(room.event.d,...room.players.map(p=>p.d));const level=room.selection.level;
 if((level===74||level===75)&&!room.event.cat&&room.event.d>=3000){room.event.cat=true;room.event.catAt=room.elapsed;}
 for(const p of room.players){if(now-p.lastInput>1200){p.gas=false;p.steer=0;p.brake=false;}step(room,p,dt,now,connected(p.id));}
 for(const p of room.npcs||[]){p.gas=true;if(!p.bot){p.engine=250;p.steer=clamp(-p.x*.5+Math.sin(room.elapsed*.5)*.15,-1,1);}step(room,p,dt*.88,now,true);}
 if(level===20&&room.elapsed>=room.nextShot){room.nextShot+=10;const target=room.players.filter(p=>!p.finished).sort((a,b)=>b.d-a.d)[0];if(target)room.shots.push({d:target.d+140,x:target.x,owner:'boss',used:false});}
 for(const s of room.shots)s.d-=95*dt;
 if(level===70){if(!room.royal&&room.elapsed>=room.nextRoyal){const kind=Math.floor(room.elapsed/12)%2?'lettuce':'basket';room.royal={kind,at:room.elapsed+2,lane:lanes[Math.floor(room.elapsed/12)%3]};room.nextRoyal+=12;}if(room.royal&&room.elapsed>=room.royal.at){for(const p of room.players)if(room.royal.kind==='lettuce'?Math.abs(p.x-room.royal.lane)>.31:Math.abs(p.x-room.royal.lane)<.31){effect(room,p,'slow',room.royal.kind==='lettuce'?2:3);}room.royal=null;}}
 room.bananas=room.bananas.filter(b=>!b.used).slice(-24);room.holes=room.holes.filter(h=>h.close>room.elapsed).slice(-24);room.shots=room.shots.filter(s=>!s.used&&s.d>0).slice(-12);
}
function eventText(room,p){const l=room.selection.level;if(p.penalty>0)return(p.splash>0?'PLONS · ':'OEPSS! · ')+Math.ceil(p.penalty)+' s terug naar de race';if(p.freeze>0)return'BEVROREN · '+Math.ceil(p.freeze)+' s';if(p.hyp>0)return'HYPNOSE · '+Math.ceil(p.hyp)+' s';if(l===20)return'Hotdog-Hond · ijsblok om de 10 seconden';if(room.royal)return(room.royal.kind==='lettuce'?'SLA-TSUNAMI':'WASMAND')+(room.royal.kind==='lettuce'?' · veilig ':' · ontwijk ')+(room.royal.lane<0?'LINKS':room.royal.lane>0?'RECHTS':'MIDDEN');if(l===74||l===75){if(room.event.d>=2800&&!room.event.cat)return'REUZENKAT! Spring weg van de '+(room.event.removedLane<0?'LINKER':'RECHTER')+' kip!';if(room.event.cat)return'Nog twee kippen! Kies de veilige rug.';if(p.d>=2500)return'CHECKPOINT · 2,5 KM';if(p.d>=2000)return'METEORENREGEN!';if(p.d>=1000)return'SLANGEN-WIEBEL!';if(l===74)return'Drie reuzenkippen · vijf kilometer rodeo';}if(l===73||l===75)return['WERKBANK · gereedschap','PIZZERIA · glijdende pizza’s','BURGER-ZONE · overstekers','VUURZONE · hete hindernissen'][Math.min(3,Math.floor(p.d/length(l)*4))];if((room.shots||[]).some(s=>s.d>p.d&&s.d-p.d<100)||room.players.some(t=>t.id!==p.id&&p.d-t.d>0&&p.d-t.d<30&&Math.abs(t.x-p.x)<.4))return'GEVAAR ACHTER JE · let op!';return'';}
globalThis.KartWorlds={titles,worlds,world,selection,length,rng,profile,geometry,layout,item,initRacer,setup,use,step,tick,eventText};
})();
