// This helper is injected only by the local QA page and refuses production hosts.
(()=>{
if(!['127.0.0.1','localhost'].includes(location.hostname)||new URLSearchParams(location.search).get('qa')!=='1')return;
const send=(type,value)=>parent.postMessage(type==='result'?{type,text:value}:{type,value},location.origin);
const pointer=(selector,type,id,x=0)=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',isPrimary:id===81,button:0,buttons:type==='pointerdown'||type==='pointermove'?1:0,clientX:r.left+r.width/2+x,clientY:r.top+r.height/2,bubbles:true,cancelable:true}));};
function result(ok,text){send('result',(ok?'PASS: ':'FAIL: ')+text)}
function layout(){const ids=['brake','left','right','wheel','joystick','gas'];const boxes=ids.map(id=>document.getElementById(id)).filter(el=>el.getClientRects().length&&getComputedStyle(el).display!=='none').map(el=>({id:el.id,r:el.getBoundingClientRect()}));let overlaps=[];for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++){const p=boxes[a],q=boxes[b];if(p.r.left<q.r.right&&p.r.right>q.r.left&&p.r.top<q.r.bottom&&p.r.bottom>q.r.top)overlaps.push(p.id+'/'+q.id)}const outside=boxes.filter(p=>p.r.left<0||p.r.right>innerWidth||p.r.top<0||p.r.bottom>innerHeight);result(!overlaps.length&&!outside.length,`${innerWidth}×${innerHeight}: geen overlap/buiten beeld (${saved.mode})`);}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent||e.data.source!=='kartgo-local-qa')return;
 const action=e.data.action;
 if(action==='multitouch'){
  start(1);state.count=0;saved.auto=false;saved.mode='buttons';modeUI();
  pointer('#right','pointerdown',81);pointer('#gas','pointerdown',82);
  result(input.right&&input.gas,'sturen en gas tegelijk');pointer('#gas','pointerup',99);result(input.gas,'andere pointer kan gas niet loslaten');
  setTimeout(()=>{result(state.speed>0&&state.x>0,'echte race reageert op touch');pointer('#gas','pointerup',82);result(input.right&&!input.gas,'alleen gas wordt losgelaten');pointer('#right','pointercancel',81);result(!input.right&&!input.gas&&activePointers.size===0,'pointercancel maakt bediening vrij');pointer('#left','pointerdown',83);pointer('#brake','pointerdown',84);result(input.left&&input.brake,'sturen en remmen tegelijk');pause();result(activePointers.size===0&&!input.left&&!input.brake,'pauze wist alle aanrakingen');},650);
 }else if(action==='analog'){
  start(1);state.count=0;
  for(const mode of ['wheel','joystick']){saved.mode=mode;modeUI();pointer('#'+mode,'pointerdown',85);pointer('#'+mode,'pointermove',85,45);pointer('#gas','pointerdown',86);result(input.analog>.3&&input.gas,mode+' met gelijktijdig gas');pointer('#'+mode,'pointerup',85);pointer('#gas','pointerup',86);result(input.analog===0&&!input.gas,mode+' keert terug na loslaten');pointer('#'+mode,'pointerdown',87);pointer('#'+mode,'pointermove',87,-45);resetInput();pointer('#'+mode,'pointerdown',88);pointer('#'+mode,'pointermove',88,45);result(input.analog>.3,mode+' werkt opnieuw na reset');resetInput();layout();}
  saved.mode='buttons';saved.auto=true;persist();modeUI();
 }else if(action==='pickup'){if(!state||state.finished)start(1);state.count=0;saved.auto=true;state.x=0;state.blocks[0]={d:(state.d%LENGTH)+600,x:0,lap:-1};state.inventory=[null,null,null];renderInventory();
 }else if(action==='items'){if(!state||state.finished)start(1);state.count=0;state.inventory=[0,2,4];renderInventory();
 }else if(action==='finish'){start(1);state.count=0;state.d=LENGTH*2-1200;state.speed=MAX;state.opponents.forEach(o=>o.d=state.d-2000);saved.auto=true;
 }else if(action==='boss'){start(20);state.count=0;state.time=9.4;saved.auto=true;
 }else if(action==='ice'||action==='jumpIce'){start(20);state.count=0;saved.auto=true;state.shots=[{d:state.d+1500,x:0,speed:-3000,life:5}];state.inventory=action==='jumpIce'?[4,null,null]:[null,null,null];renderInventory();if(action==='jumpIce')document.querySelector('[data-slot="0"]').click();setTimeout(()=>result(action==='jumpIce'?state.freeze===0:state.freeze>0,action==='jumpIce'?'Jump voorkomt ijs-bevriezing':'ijs bevriest de speler'),750);
 }else if(action==='bridge'||action==='tunnel'){start(12);state.count=0;saved.auto=true;state.d=(state.features.find(f=>f.kind===action).from-7)*SEG;state.speed=MAX;
 }else if(action==='layout'){setTimeout(layout,100);}
 if(state&&state.count<=0)document.querySelector('#countdown').textContent='';
});
setInterval(()=>send('status',{viewport:`${innerWidth}×${innerHeight}`,mode:saved.mode,input:{...input},activePointers:activePointers.size,level:state?.level,paused:state?.paused,finished:state?.finished,distance:Math.round(state?.d||0),speed:Math.round(state?.speed||0),position:state?.rank,inventory:state?.inventory,boost:state?.boost,jump:state?.jump,freeze:state?.freeze,time:state?.time?.toFixed(2),shots:state?.shots?.length,nextIce:state?.nextShot,won:saved.wins,quality:quality.level}),200);
})();
