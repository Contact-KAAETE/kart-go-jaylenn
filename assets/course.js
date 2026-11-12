/* V5.1 course geometry: original race engine, richer routes and forgiving launch ramps. */
'use strict';
const smoothCourse=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
const courseWrap=(v,period)=>(v%period+period)%period;
function courseCorners(level){
 const n=level>20?level-20+6:level;
 if(n<3)return[];
 const strength=Math.min(4.8,.9+n*.17),sections=[{from:75+level%3*5,length:23,dir:level%2?1:-1}];
 if(n>=9)sections.push({from:172+level%3*4,length:23,dir:level%2?-1:1});
 if(n>=16)sections.push({from:14,length:24,dir:level%2?1:-1});
 return sections.map(c=>({...c,to:c.from+c.length,strength}));
}
function courseCurves(level,profile){
 const corners=courseCorners(level);
 return Array.from({length:COUNT},(_,i)=>{
  const phase=i/COUNT*Math.PI*2;
  let bend=(Math.sin(phase*(level<3?2:3)+level*.25)*1.7+Math.sin(phase*5)*.45)*profile.bend;
  for(const c of corners){const t=(i-c.from)/(c.to-c.from);if(t>0&&t<1)bend=lerp(bend,c.dir*(2+c.strength),Math.sin(Math.PI*t)**2);}
  return bend;
 });
}
function courseElevation(d,level){
 const profile=trackProfile(level),segment=courseWrap(d/SEG,COUNT),phase=segment/COUNT*Math.PI*2;
 // Periodic smooth summits keep the start/finish seam continuous.
 let height=profile.hill*(Math.sin(phase*2+level*.2)*.54+Math.sin(phase*3)*.22);
 const summit=(center,width,amount)=>{const delta=Math.abs(courseWrap(segment-center+COUNT/2,COUNT)-COUNT/2);return delta<width?amount*(.5+.5*Math.cos(Math.PI*delta/width)):0;};
 height+=summit(114+level%3*6,42,profile.hill*.9)+summit(223,32,profile.hill*.58);
 for(const f of trackFeatures(level)){
  if(f.kind==='bridge'){
   const climb=smoothCourse((segment-f.from+13)/15),descent=1-smoothCourse((segment-f.to+1)/15);
   height+=Math.min(climb,descent)*profile.hill*.56;
  }else if(f.kind==='ramp'){
   height+=smoothCourse((segment-f.from)/(f.to-f.from))*(1-smoothCourse((segment-f.to)/12))*115;
  }
 }
 return height;
}
function airborne(s){return s.jump>0||s.rampAir>0;}
function rampLift(s){return s.rampAir>0?Math.sin(Math.PI*(1-s.rampAir/s.rampDuration)):0;}
function updateRampFlight(racer,previousDistance,dt,isPlayer=false){
 const wasAir=racer.rampAir>0;
 racer.rampAir=Math.max(0,(racer.rampAir||0)-dt);
 if(wasAir&&!racer.rampAir&&isPlayer){state.impact=Math.max(state.impact,.12);addEffect('landing');}
 if(racer.rampAir>0||racer.jump>0||racer.freeze>0||Math.abs(racer.x)>1.03)return;
 const speed=isPlayer?racer.speed:(racer.d-previousDistance)/dt;
 if(speed<MAX*.35)return;
 for(const f of state.features){
  if(f.kind!=='ramp')continue;
  const launch=f.to*SEG,lap=Math.floor((racer.d-launch)/LENGTH),crossing=lap*LENGTH+launch;
  if(previousDistance<crossing&&racer.d>=crossing){
   racer.rampDuration=.85+Math.min(1.42,speed/MAX)*.22;racer.rampAir=racer.rampDuration;
   if(isPlayer){addEffect('jump');toast('Springschans! Houd je koers vast.');beep(680,.12,'triangle');}
   break;
  }
 }
}

// Deterministic traffic decisions: readable overtakes and occasional recoverable mistakes.
function botTactic(s,o,i){
 let ideal=[-.54,0,.54][i]+Math.sin(s.time*.34+i)*.12;
 if(o.boss)return {ideal,factor:1};
 const traffic=[...s.opponents.filter(other=>other!==o),{d:s.d,x:s.x}];
 const ahead=traffic.find(other=>other.d-o.d>0&&other.d-o.d<1700&&Math.abs(other.x-o.x)<.34);
 if(ahead){
  const lanes=[-.66,0,.66].map(x=>({x,cost:traffic.reduce((n,other)=>n+(Math.abs(other.d-o.d)<1800&&Math.abs(other.x-x)<.38?3:0),0)+Math.abs(x-o.x)*.25})).sort((a,b)=>a.cost-b.cost);
  ideal=lanes[0].x;
 }
 if(s.profile.difficulty>9){const hazard=s.obstacles.find(b=>{const gap=circularGap(b.d,o.d);return gap>0&&gap<2200&&Math.abs(ideal-b.x)<.42;});if(hazard)ideal=hazard.x>0?-.56:.56;}
 const phase=(s.time+i*5.7+s.level*.61)%19;
 o.mistake=s.time>5&&phase<1.2?1-phase/1.2:0;
 if(o.mistake)ideal+=Math.sin(s.time*8+i)*.12*o.mistake;
 return {ideal:clamp(ideal,-.78,.78),factor:(.98+.02*Math.sin(s.time*.6+i*2))*(1-o.mistake*.18)};
}
function courseTree(s,index,side){
 if(s.profile.theme==='forest')return (index+side)%3?'pine':'oak';
 if(s.profile.theme==='farm')return 'oak';
 if(s.profile.theme==='valley')return index%3?'pine':'blossom';
 return index%3?'blossom':'oak';
}
