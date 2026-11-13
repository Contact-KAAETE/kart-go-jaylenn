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
// Shared stunt sections in world metres: long braking corners, S-bends and raised launches.
// A clear run-out follows every full-width ramp; geometry and collisions share these markers.
const stuntCache=new Map();
function stunts(level){if(!level)return[];if(stuntCache.has(level))return stuntCache.get(level);const result=[],total=length(level);for(let at=80;at+590<total;at+=700)result.push({at,dir:(result.length+level)%2?1:-1,ramp:at+426,end:at+590});stuntCache.set(level,result);return result;}
function launch(p,duration=1.4,lift=1){p.jump=Math.max(p.jump||0,duration);p.jumpDuration=p.jump;p.jumpLift=lift;}
// The original course's harmonic bends and sharp corner windows, expressed in metres.
function geometry(level,d){if(!level)return{curve:0,height:0,width:1,feature:'road'};const count=level===70?520:260,lap=length(level)/(level===70||level>70?1:2),segment=((d/lap*count)%count+count)%count,phase=segment/count*Math.PI*2,p=profile(level);let curve=(Math.sin(phase*(level<3?2:3)+level*.25)*1.7+Math.sin(phase*5)*.45)*p.bend;
 const n=level>50?level-50+2:level>20?level-20+6:level;
 if(n>=3)for(const [start,dir] of [[75+level%3*5,level%2?1:-1],...(n>=9?[[172+level%3*4,level%2?-1:1]]:[]),...(n>=16?[[14,level%2?1:-1]]:[])]){const t=(segment-start)/23;if(t>0&&t<1)curve=mix(curve,dir*(2+Math.min(4.8,.9+n*.17)),Math.sin(Math.PI*t)**2);}
 let feature='road',width=1;const ranges=[];
 if(level>50&&level<71){ranges.push(['bridge',46+level%4*3,70+level%4*3],['ramp',104,110],['bridge',193,218]);if(level>=53)ranges.push(['palace',132,170+((level-50)%4)*3]);if(level>=60)ranges.push(['ramp',226,232]);if(level===70)ranges.push(['palace',302,354],['ramp',397,403],['bridge',430,454]);}
 else{if(level>=4)ranges.push(['bridge',35+(level*7)%35,55+(level*7)%35]);if(level>=8)ranges.push(['tunnel',142+(level*3)%28,163+(level*3)%28]);if(level>=7)ranges.push(['bridge',194+(level*3)%9,217+(level*3)%9]);if(level>=5&&![20,50].includes(level))ranges.push(['ramp',104+level%4*3,110+level%4*3]);}
 for(const [kind,from,to] of ranges)if(segment>=from&&segment<=to){feature=kind;if(kind==='palace')width=Math.max(.72,.96-Math.floor((segment-from)/3)*.02);}
 let height=p.hill/100*(Math.sin(phase*2+level*.2)*.54+Math.sin(phase*3)*.22)+Math.sin(phase)*p.hill/130;
 for(const section of stunts(level)){const t=d-section.at;if(t>=50&&t<165){curve+=section.dir*5.8*Math.sin(Math.PI*(t-50)/115)**2;feature='hairpin';}if(t>=195&&t<275)curve-=section.dir*3.8*Math.sin(Math.PI*(t-195)/80)**2;if(t>=290&&t<590)height+=18*Math.sin(Math.PI*(t-290)/300)**2;if(t>=400&&t<=426){feature='ramp';height+=3*(t-400)/26;}else if(t>426&&t<510)height+=3*(1-(t-426)/84);}
 return{curve:clamp(curve,-8,8),height,width,feature};
}
function layout(config,seed){const level=config.level,w=world(level),random=rng((seed||1)^Math.imul(level+1,39871)),total=length(level),objects=[];let i=0;
 const add=(type,d,x=lanes[Math.floor(random()*3)])=>objects.push({id:i++,type,d,x});
 for(const section of stunts(level))add('ramp',section.ramp,0),objects.at(-1).fullWidth=true;
 const blocks=level===20||level===63?9:level===72?24:level>70?16:10;
 for(let n=0;n<blocks;n++)add('block',120+(total-260)*(n+.3)/blocks+(random()-.5)*30);
 if(!level)return objects;
 const count=level<6?0:level>70?Math.floor(total/100):3+Math.floor(profile(level).difficulty/4);
 for(let n=0;n<count;n++){let d=200+n*(total-360)/Math.max(1,count)+(random()-.5)*35;let type=w===3?(n%3===1?'icicle':'spike'):w===4?['cone','tool','pizza','person','fire','meteor'][n%6]:(n%3===1?'water':'cone');
 if(level===71)type=n%3===0?'ramp':'cone';if(level===72)type=n%3===0?'ramp':'cone';if(level===73){const zone=Math.min(3,Math.floor(d/total*4));type=['tool','pizza','person','fire'][zone];}if(level===74)type=d>2000?'meteor':'cone';add(type,d);if(w===4&&n%3===0)add('star',d+30,lanes[(n+1)%3]);}
 if(level>=5&&! [20,50].includes(level))for(const f of [.24,.48,.77])add('ramp',total*f,0);
 if(w===4)add('ramp',60,0);
 // Keep the launch and landing corridor clear of unavoidable hazards.
 const ramps=objects.filter(o=>o.fullWidth);return objects.filter(o=>['block','star','ramp'].includes(o.type)||!ramps.some(r=>o.d>r.d-28&&o.d<r.d+210)).sort((a,b)=>a.d-b.d);
}
function item(level,r){const v=r*100;if(world(level)===2)return[1,3,5][Math.min(2,Math.floor(r*3))];if(world(level)===3)return v<35?5:v<55?1:v<75?4:v<85?2:v<95?3:0;return v<50?0:v<70?1:v<85?2:v<95?3:4;}
function initRacer(p){Object.assign(p,{d:0,x:0,speed:0,steer:0,gas:false,brake:false,finished:false,finishAt:null,boost:0,jump:0,jumpDuration:1.4,jumpLift:1,freeze:0,spin:0,hyp:0,slow:0,penalty:0,splash:0,invincible:0,slide:0,score:0,checkpoint:0,inventory:[null,null,null],seen:[],itemCount:0,catHit:false});return p;}
function setup(room){room.selection=selection(room.selection);room.seed ||=1;room.course=layout(room.selection,room.seed);room.claimed=[];room.bananas=[];room.holes=[];room.shots=[];room.event={cat:false,catAt:0,removedLane:room.seed%2?-.62:.62,d:0};room.nextShot=10;room.shotCount=0;room.nextRoyal=12;room.royal=null;for(const p of room.players)initRacer(p);
 const level=room.selection.level,boss=[20,50,70].includes(level),engine=Math.max(250,...room.players.map(p=>p.engine||250));room.npcs=[];
 if(boss){const p=initRacer({id:'boss',bot:true,name:level===20?'Hotdog-Hond':level===50?'Pizzaman':'Burgerkoning',boss:level,avatar:0,color:3,engine});p.d=0;p.x=-.62;room.npcs.push(p);}
 if(level&&!boss)for(let i=room.npcs.length;i<Math.max(room.npcs.length,6-room.players.length);i++){const p=initRacer({id:'bot'+i,bot:true,name:['Turbo Vos','Bliksem Panda','Nitro Ninja','Drift Draak','Raketracer'][i%5]+' · BOT',avatar:[2,3,1,6,5][i%5],chicken:i%3,color:[1,4,8,12,16][i%5],engine});p.d=10+i*7;p.x=lanes[i%3];room.npcs.push(p);}
 for(const [i,p] of room.npcs.entries()){p.botIndex=i;p.inventory=p.boss?[null,null,null]:[world(level)===2?5:0,1,3];p.nextAttack=5+i*1.4;}
}
function projectile(room,p,kind,target){if(!target)return false;const direction=target.d>=p.d?1:-1;room.shots.push({d:p.d+direction*9,x:p.x,owner:p.id,kind,direction,velocity:direction*(Math.max(p.speed||0,target.speed||0)+110),target:target.id,born:room.elapsed,used:false});return true;}
function driveBot(room,p,dt){if(p.finished)return;const level=room.selection.level,w=world(level),i=p.botIndex||0;p.bot=true;p.engine=Math.max(250,...room.players.map(t=>t.engine||250));p.gas=true;p.brake=false;
 const look=Math.max(100,p.speed*1.6),ahead=room.course.filter(o=>o.d>p.d&&o.d-p.d<look&&!room.claimed.includes(o.id)),dangers=ahead.filter(o=>!['block','star','ramp'].includes(o.type));
 const cat=(level===74||level===75)&&room.event.cat&&room.elapsed>=room.event.catAt;
 const costs=lanes.map(x=>({x,cost:Math.abs(x-p.x)*.65+Math.abs(x-lanes[i%3])*.12+(cat&&Math.abs(x-room.event.removedLane)<.3?20:0)+dangers.reduce((v,o)=>v+(Math.abs(o.x-x)<.4?8*(1-(o.d-p.d)/look):0),0)+room.bananas.reduce((v,b)=>v+(b.owner!==p.id&&b.d>p.d&&b.d-p.d<look&&Math.abs(b.x-x)<.35?6:0),0)-ahead.filter(o=>o.type==='block'&&Math.abs(o.x-x)<.3&&p.inventory.includes(null)).reduce((v,o)=>v+.8*(1-(o.d-p.d)/look),0)})).sort((a,b)=>a.cost-b.cost);
 const target=costs[0].x,shape=geometry(level,p.d),max=({250:62,509:76,1000:90}[p.engine]||62)*(1.08+i*.012),ratio=p.speed/max;
 p.steer=clamp((target-p.x)*3.8+shape.curve*(w===4?.018:.055)*ratio*ratio/(w===4?1.1:1.2),-1,1);
 // Fast racing line, with a short lift for a genuinely sharp corner.
 p.cornerPace=Math.abs(geometry(level,p.d+Math.max(20,p.speed*.35)).curve)>5.8?.9:1;
 if(cat&&Math.abs(p.x-room.event.removedLane)<.35&&p.jump<=0)launch(p);
 const near=dangers.find(o=>o.d-p.d<Math.max(18,p.speed*.35)&&Math.abs(o.x-p.x)<.32&&o.type!=='icicle');if(near&&p.jump<=0&&w===4)launch(p);
 if(!p.boss&&room.elapsed>=(p.nextAttack??(5+i*1.4))&&p.freeze<=0&&p.penalty<=0){const rivals=[...room.players,...room.npcs].filter(t=>t.id!==p.id&&!t.finished&&Math.abs(t.d-p.d)<400).sort((a,b)=>Math.abs(a.d-p.d)-Math.abs(b.d-p.d)),target=rivals[0];
  const slot=p.inventory.findIndex(v=>v!==null&&v!==undefined);if(slot>=0&&target){const v=p.inventory[slot];if([0,1,5].includes(v)){projectile(room,p,v===0?'storm':v===1?'hyp':'ice',target);p.inventory[slot]=null;}else use(room,p,slot);p.lastWeapon=v;}
  p.nextAttack=room.elapsed+5.5+(i%3)*.8;
 }
}
function effect(room,p,kind,duration){if(p.invincible>0)return;p[kind]=Math.max(p[kind]||0,duration);if(['freeze','penalty'].includes(kind))p.speed=0;p.invincible=duration+.7;}
function use(room,p,slot){if(!Number.isInteger(slot)||slot<0||slot>2||p.penalty>0||p.freeze>0)return false;const v=p.inventory[slot];if(v===null||v===undefined)return false;const targets=[...room.players,...(room.npcs||[])].filter(t=>t.id!==p.id&&!t.finished).sort((a,b)=>Math.abs(a.d-p.d)-Math.abs(b.d-p.d));if([1,5].includes(v)&&!targets.length)return false;
 if(v===0)for(const t of targets)t.slow=3;if(v===1)targets[0].hyp=10;if(v===2&&world(room.selection.level)!==2){p.boost=4;if(world(room.selection.level)===3)room.holes.push({d:p.d,x:p.x,born:room.elapsed,open:room.elapsed+2,close:room.elapsed+5});}if(v===3)room.bananas.push({id:room.elapsed+':'+p.id,d:p.d-6,x:p.x,owner:p.id});if(v===4){launch(p);if(world(room.selection.level)===3)room.holes.push({d:p.d,x:p.x,born:room.elapsed,open:room.elapsed+2,close:room.elapsed+5});}if(v===5){targets[0].freeze=1.2;targets[0].speed=0;}p.inventory[slot]=null;return true;}
function step(room,p,dt,now,active=true){const level=room.selection.level,w=world(level),total=length(level);if(p.finished)return;
 for(const k of ['boost','jump','freeze','spin','hyp','slow','penalty','splash','invincible'])p[k]=Math.max(0,(p[k]||0)-dt);
 const old=p.d;if(!active){p.speed=0;return;}let max=({250:62,509:76,1000:90}[p.engine]||62);if(!level)max=85;if(p.bot)max*=1.08+(p.botIndex||0)*.012;const inputSteer=p.hyp>0?Math.sin(room.elapsed*8)*.6:p.steer||0;
 const slope=(geometry(level,p.d+5).height-geometry(level,p.d-5).height)/10;let target=p.gas&&!p.brake?max*(p.bot?p.cornerPace||1:1)*clamp(1-slope*.24,.9,1.12):0;if(p.boost>0)target*=1.42;if(p.slow>0||p.spin>0)target*=.4;if(p.freeze>0||p.penalty>0)target=0;
 p.speed+=clamp(target-p.speed,-(p.brake?150:90)*dt,55*dt);const shape=geometry(level,p.d),ratio=p.speed/max;let lateral=p.speed>1?(inputSteer*(w===4?1.1:1.2)-shape.curve*(w===4?.018:.055)*ratio*ratio):0;if(p.penalty>0||p.freeze>0)lateral=0;if(w===3){p.slide=mix(p.slide||0,lateral,1-Math.exp(-dt*(p.brake?10:3.5)));lateral=p.slide;}
 p.x=clamp(p.x+lateral*dt,-1.65,1.65);p.d=Math.min(total,p.d+Math.max(0,p.speed)*dt);
 if(Math.abs(p.x)>1.23&&p.invincible<=0){effect(room,p,'penalty',w===3?3:2);p.splash=w===3?3:0;p.x=0;p.slide=0;}
 if((level===74||level===75)&&p.d>=2500)p.checkpoint=Math.max(2500,p.checkpoint);
 if((level===74||level===75)&&room.event.cat&&room.elapsed>=room.event.catAt+2.5){p.catHit=true;if(Math.abs(p.x-room.event.removedLane)<.3&&p.jump<=0&&p.invincible<=0){effect(room,p,'penalty',6);p.x=0;p.d=Math.max(p.checkpoint,Math.min(p.d,2500));}}
 for(const o of room.course){if(o.d<old-10||o.d>p.d+4||p.seen.includes(o.id))continue;let ox=o.x;if(['pizza','person','meteor'].includes(o.type))ox+=Math.sin(room.elapsed*(o.type==='person'?1.8:2.6)+o.id)*.17;if(!o.fullWidth&&Math.abs(p.x-ox)>.28)continue;
 if(o.type==='block'){if(p.boss)continue;if(room.claimed.includes(o.id))continue;if(p.inventory.includes(null)){p.inventory[p.inventory.indexOf(null)]=item(level,rng(room.seed^Math.imul(o.id+1,199)^Math.imul(++p.itemCount,173))());if(level!==72)room.claimed.push(o.id);p.score+=20;}if(level!==72)p.seen.push(o.id);}
 else if(o.type==='star'){p.score+=20;p.seen.push(o.id);}
 else if(o.type==='ramp'){launch(p,1.45+p.speed/150,o.fullWidth?1.8:1.25);p.boost=Math.max(p.boost,.8);p.score+=5;p.seen.push(o.id);}
 else if((o.type==='icicle'?p.jump>0:p.jump<=0)&&p.invincible<=0){p.seen.push(o.id);if(o.type==='water'){effect(room,p,'penalty',3);p.splash=3;}else effect(room,p,w===4?'penalty':'slow',w===4?6:1);}
 }
 for(const b of room.bananas)if(b.owner!==p.id&&!b.used&&Math.abs(b.d-p.d)<5&&Math.abs(b.x-p.x)<.28&&p.jump<=0){b.used=true;effect(room,p,'spin',2);}
 for(const h of room.holes)if(room.elapsed>=h.open&&room.elapsed<h.close&&Math.abs(h.d-p.d)<6&&Math.abs(h.x-p.x)<.3&&p.jump<=0){effect(room,p,'penalty',3);p.splash=3;}
 for(const s of room.shots)if(!s.used&&s.owner!==p.id&&Math.abs(s.d-p.d)<Math.max(9,Math.abs(s.velocity||95)*dt+4)&&Math.abs(s.x-p.x)<.34&&p.jump<=0){s.used=true;effect(room,p,s.kind==='storm'?'slow':s.kind==='hyp'?'hyp':'freeze',s.kind==='storm'?3:s.kind==='hyp'?4:1.2);}
 if(p.d>=total){p.finished=true;p.speed=0;p.finishAt=now;}
}
function tick(room,dt,now,connected){room.elapsed=Math.max(0,(now-room.startAt)/1000);room.course ||=layout(room.selection,room.seed);room.event.d=Math.max(room.event.d,...room.players.map(p=>p.d));const level=room.selection.level;
 if((level===74||level===75)&&!room.event.cat&&room.event.d>=3000){room.event.cat=true;room.event.catAt=room.elapsed;}
 for(const p of room.players){if(now-p.lastInput>1200){p.gas=false;p.steer=0;p.brake=false;}step(room,p,dt,now,connected(p.id));}
 for(const p of room.npcs||[]){driveBot(room,p,dt);step(room,p,dt,now,true);}
 if([20,50,70].includes(level)&&room.elapsed>=room.nextShot){room.nextShot+=10;const target=room.players.filter(p=>!p.finished).sort((a,b)=>b.d-a.d)[0];if(target)room.shots.push({d:target.d+140,x:target.x,owner:'boss',kind:['ice','storm','hyp'][(room.shotCount||0)%3],direction:-1,born:room.elapsed,used:false});room.shotCount=(room.shotCount||0)+1;}
 for(const s of room.shots){s.d+=(s.velocity||-95)*dt;const target=[...room.players,...room.npcs].find(p=>p.id===s.target);if(target&&!target.finished&&Math.abs(target.d-s.d)>30)s.x+=clamp(target.x-s.x,-dt*.7,dt*.7);if(s.born!==undefined&&room.elapsed-s.born>5)s.used=true;}
 if(level===70){if(!room.royal&&room.elapsed>=room.nextRoyal){const kind=Math.floor(room.elapsed/12)%2?'lettuce':'basket';room.royal={kind,at:room.elapsed+2,lane:lanes[Math.floor(room.elapsed/12)%3]};room.nextRoyal+=12;}if(room.royal&&room.elapsed>=room.royal.at){for(const p of room.players)if(room.royal.kind==='lettuce'?Math.abs(p.x-room.royal.lane)>.31:Math.abs(p.x-room.royal.lane)<.31){effect(room,p,'slow',room.royal.kind==='lettuce'?2:3);}room.royal=null;}}
 room.bananas=room.bananas.filter(b=>!b.used).slice(-24);room.holes=room.holes.filter(h=>h.close>room.elapsed).slice(-24);room.shots=room.shots.filter(s=>!s.used&&s.d>0).slice(-12);
}
function eventText(room,p){const l=room.selection.level;if(p.penalty>0)return(p.splash>0?'PLONS · ':'OEPSS! · ')+Math.ceil(p.penalty)+' s terug naar de race';if(p.freeze>0)return'BEVROREN · '+Math.ceil(p.freeze)+' s';if(p.hyp>0)return'HYPNOSE · '+Math.ceil(p.hyp)+' s';if(l===20)return'Hotdog-Hond · ijs, onweer en hypnose!';if(room.royal)return(room.royal.kind==='lettuce'?'SLA-TSUNAMI':'WASMAND')+(room.royal.kind==='lettuce'?' · veilig ':' · ontwijk ')+(room.royal.lane<0?'LINKS':room.royal.lane>0?'RECHTS':'MIDDEN');if(l===74||l===75){if(room.event.d>=2800&&!room.event.cat)return'REUZENKAT! Spring weg van de '+(room.event.removedLane<0?'LINKER':'RECHTER')+' kip!';if(room.event.cat)return'Nog twee kippen! Kies de veilige rug.';if(p.d>=2500)return'CHECKPOINT · 2,5 KM';if(p.d>=2000)return'METEORENREGEN!';if(p.d>=1000)return'SLANGEN-WIEBEL!';if(l===74)return'Drie reuzenkippen · vijf kilometer rodeo';}if(l===73||l===75)return['WERKBANK · gereedschap','PIZZERIA · glijdende pizza’s','BURGER-ZONE · overstekers','VUURZONE · hete hindernissen'][Math.min(3,Math.floor(p.d/length(l)*4))];if((room.shots||[]).some(s=>s.d>p.d&&s.d-p.d<100)||room.players.some(t=>t.id!==p.id&&p.d-t.d>0&&p.d-t.d<30&&Math.abs(t.x-p.x)<.4))return'GEVAAR ACHTER JE · let op!';const shape=geometry(l,p.d+45);if(p.jump>0)return'SCHANS! · pak je voorsprong in de lucht';if(shape.feature==='hairpin')return'SCHERPE BOCHT · rem en stuur in!';if(shape.feature==='ramp')return'SCHANS VOOR JE · vol gas!';return'';}
globalThis.KartWorlds={titles,worlds,world,selection,length,rng,profile,geometry,stunts,layout,item,initRacer,setup,launch,use,step,tick,eventText};
})();
