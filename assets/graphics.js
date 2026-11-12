/* V5 raster presentation. Physics, level rules and saved avatar IDs stay in the original engine. */
'use strict';
const RACER_NAMES=['Astronaut','Ninja','Vos','Panda','Kikker','Robot'];
function racerIndex(avatar){return Math.max(0,AVATARS.indexOf(avatar));}
function portraitMarkup(avatar,extra=''){const i=racerIndex(avatar);return `<span class="portrait-sprite ${extra}" data-character="${i}" role="img" aria-label="${RACER_NAMES[i]}"></span>`;}
function powerMarkup(item){const i=[1,2,3,4,6,5][item]??0;return `<span class="power-sprite" style="background-position:${(i%5)*25}% ${i>=5?100:0}%" aria-hidden="true"></span>`;}
function showWorldMap(){
 $('#worldPanel').classList.remove('hidden');$('#home .hero').classList.add('hidden');$('#home .player-hub').classList.add('hidden');$('#home .menu-tools').classList.add('hidden');renderMap();window.scrollTo?.({top:0,behavior:'smooth'});
}
function showHomeMenu(){
 $('#worldPanel').classList.add('hidden');$('#home .hero').classList.remove('hidden');$('#home .player-hub').classList.remove('hidden');$('#home .menu-tools').classList.remove('hidden');window.scrollTo?.({top:0,behavior:'smooth'});
}
const GFX=(()=>{
 const pictures=new Map(),pending=new Map(),frames=new Map(),tinted=new Map(),counts={karts:0,drivers:0,scenery:0,landscapes:0,effects:0,terrain:0};let loadingRace=false,allowFallback=false;
 const files={menu:'menu',characters:'characters',karts:'karts',scenery:'scenery',landscapes:'landscapes',bosses:'bosses',effects:'effects',garage:'garage',terrain:'terrain'};
 const source=name=>`./assets/graphics/${files[name]}-v5.webp?v=5.0`;
 function image(name){const im=pictures.get(name);return im?.naturalWidth?im:null;}
 function load(name){
  if(typeof Image==='undefined')return Promise.resolve(null);if(pending.has(name))return pending.get(name);
  const task=new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>{pictures.set(name,im);resolve(im);};im.onerror=()=>{pending.delete(name);reject(new Error(name));};im.src=source(name);});pending.set(name,task);return task;
 }
 function tile(name,columns,rows,index){
  const key=`${name}:${index}`;if(frames.has(key))return frames.get(key);const im=image(name);if(!im)return null;
  const sw=im.naturalWidth/columns,sh=im.naturalHeight/rows,cv=document.createElement('canvas');cv.width=Math.round(sw);cv.height=Math.round(sh);cv.getContext('2d').drawImage(im,index%columns*sw,Math.floor(index/columns)*sh,sw,sh,0,0,cv.width,cv.height);frames.set(key,cv);return cv;
 }
 function paintColor(color){
  const hex=/^#[\da-f]{6}$/i.test(color)?color:'#f56a48',r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
  let hue=0;if(d){hue=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;hue*=60;}return {hue:(hue+360)%360,saturation:d===0?0:Math.min(1.6,d/Math.max(.05,1-Math.abs(max+min-1))),light:(max+min)/2};
 }
 function coloredKart(index,color){const key=index+':'+color;if(tinted.has(key))return tinted.get(key);const base=tile('karts',3,2,index);if(!base)return null;const cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height;const c=cv.getContext('2d'),p=paintColor(color);c.filter=`hue-rotate(${p.hue-355}deg) saturate(${p.saturation*1.05}) brightness(${.75+p.light*.5})`;c.drawImage(base,0,0);if(tinted.size>30)tinted.delete(tinted.keys().next().value);tinted.set(key,cv);return cv;}
 function drawKart(c,x,y,scale,color,dog,steer,player,angle=null){
  if(scale<.015)return true;
  if(dog){const boss=tile('bosses',2,2,dog==='pizza'?3:1);if(!boss)return false;counts.karts++;c.save();c.translate(x,y);c.rotate(steer*.035);c.drawImage(boss,-80*scale,-157*scale,160*scale,170*scale);c.restore();return true;}
  const variant=angle===null?(steer<-.23?0:steer>.23?2:1):angle;
  const kart=coloredKart(variant,color),driver=tile('characters',3,4,racerIndex(player?.avatar||AVATARS[color==='#719dd4'?2:color==='#cb81ac'?3:4])+(variant>=3?0:6));if(!kart||!driver)return false;counts.karts++;counts.drivers++;
  c.save();c.translate(x,y);c.rotate(steer*.035);const bob=(typeof state!=='undefined'&&state?.speed>100)?Math.sin(performance.now()/53)*.65:0;c.translate(0,bob);ellipse(c,0,2*scale,57*scale,11*scale,'#071b2c4f');
  if(player&&typeof state!=='undefined'&&state?.boost>0)effect(c,3,0,5*scale,70*scale,65*scale,.85);c.drawImage(kart,-77*scale,-138*scale,154*scale,154*scale);
  if(variant<3){c.drawImage(driver,-32*scale,-129*scale,64*scale,64*scale);}else{c.drawImage(driver,-31*scale,-129*scale,62*scale,62*scale);}
  if(player?.helmet){c.strokeStyle=player.helmet;c.lineWidth=3*scale;c.beginPath();c.moveTo(-19*scale,-76*scale);c.lineTo(19*scale,-76*scale);c.stroke();}
  // Small moving highlights suggest tire rotation without regenerating or mutating the sprite.
  if(typeof state!=='undefined'&&state?.speed>100){c.globalAlpha=.22;const tick=performance.now()/45;for(const side of [-1,1]){for(let i=0;i<3;i++){c.fillStyle='#e8f7ff';c.fillRect(side*53*scale-2*scale,(-48+(i*9+tick)%27)*scale,3*scale,2*scale);}}c.globalAlpha=1;}
  if(player&&typeof xpLevel==='function'&&xpLevel()>=5){const t=performance.now()/900;c.globalAlpha=.75+Math.sin(t)*.2;c.strokeStyle='#fff5b5';c.lineWidth=1.8*scale;c.beginPath();c.moveTo(-47*scale,-76*scale);c.lineTo(-34*scale,-68*scale);c.lineTo(-47*scale,-60*scale);c.moveTo(-54*scale,-68*scale);c.lineTo(-34*scale,-68*scale);c.stroke();}
  c.restore();return true;
 }
 function drawScenery(c,type,x,y,k){
  let index={oak:0,pine:1,blossom:2,barn:3,mill:4,fence:5,flowers:6,grass:6,rocks:7,pond:11,hay:7,sign:5}[type];
  if(typeof sceneryLevel!=='undefined'&&sceneryLevel>20)index={oak:9,pine:8,blossom:8,barn:10,mill:10,fence:9,flowers:9,grass:9,rocks:10,pond:11,hay:10,sign:9}[type];
  const prop=tile('scenery',4,3,index??0);if(!prop||k<.004)return false;const factor={oak:1.6,pine:1.65,blossom:1.6,barn:2.2,mill:2.4,fence:1.3,flowers:1.2,grass:.65,rocks:1.4,pond:2.3,hay:1.3,sign:1}[type]||1;
  counts.scenery++;c.drawImage(prop,x-195*k*factor,y-370*k*factor,390*k*factor,390*k*factor);return true;
 }
 function landscape(c,w,h,s){
  const im=image('landscapes');if(!im)return false;counts.landscapes++;const sh=im.naturalHeight/2,sy=s.sand?sh:0;
  const hh=h*.405,drift=Math.sin(s.d/18000)*w*.027-s.x*w*.012+Math.sin(s.time*.04)*w*.008;c.drawImage(im,0,sy,im.naturalWidth,sh,-w*.05+drift,-h*.02,w*1.1,hh+h*.02);
  return true;
 }
 function effect(c,index,x,y,w,h=w,alpha=1,rotation=0){const fx=tile('effects',5,2,index);if(!fx)return false;counts.effects++;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(rotation);c.drawImage(fx,-w/2,-h/2,w,h);c.restore();return true;}
 function trackTexture(c,a,b,s,terrain){
  if(terrain!=='road'||a.y<=b.y||a.y<view.horizon+4||b.y>H||a.w<5)return;
  const road=tile('terrain',2,2,s.sand?3:0),ground=tile('terrain',2,2,s.sand?2:1);if(!road||!ground)return;counts.terrain++;
  const y=Math.max(b.y,0),height=Math.min(H+2,a.y+1)-y;if(height<.3)return;
  function stamp(points,im,left,width,opacity){if(width<1)return;c.save();c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip();c.globalAlpha=opacity;const sy=((a.segIndex%16+16)%16)*im.height/16;c.drawImage(im,0,sy,im.width,im.height/16,left,y,width,height+1);c.restore();}
  stamp([[a.x-a.w,a.y+1],[a.x+a.w,a.y+1],[b.x+b.w,b.y],[b.x-b.w,b.y]],road,a.x-a.w,a.w*2,.32);
  const opacity=typeof quality!=='undefined'&&quality.level===0?.3:.55;
  stamp([[0,a.y+1],[a.x-a.w*1.1,a.y+1],[b.x-b.w*1.1,b.y],[0,b.y]],ground,0,W,opacity);
  stamp([[a.x+a.w*1.1,a.y+1],[W,a.y+1],[W,b.y],[b.x+b.w*1.1,b.y]],ground,0,W,opacity);
 }
 function canRace(level){if(typeof Image==='undefined'||allowFallback)return true;return ['characters','karts','scenery','landscapes','effects','terrain',...(level===20||level===50?['bosses']:[])].every(image);}
 function prepare(level,callback){
  if(loadingRace)return;loadingRace=true;showModal('<div class="loading-art"><span class="eyebrow">JE RACEWERELD WORDT KLAARGEZET</span><h2>Even de motor warmdraaien…</h2><div class="loading-wheel"></div><p>De nieuwe karts en omgeving worden geladen.</p></div>');
  const loader=document.querySelector('.loading-art');Promise.all(['characters','karts','scenery','landscapes','effects','terrain',...(level===20||level===50?['bosses']:[])].map(load)).then(()=>{loadingRace=false;if(loader?.isConnected&&modal.open)callback();}).catch(()=>{loadingRace=false;allowFallback=true;showModal('<h2>Een beeldbestand kon niet laden.</h2><p>Je kunt met de bestaande tekeningen verder racen, of opnieuw proberen.</p><button class="primary" id="retryArt">Opnieuw laden</button> <button class="secondary" id="fallbackRace">Verder racen</button>');$('#retryArt').onclick=()=>location.reload();$('#fallbackRace').onclick=callback;});
 }
 function init(){
  $('#openWorldMap').onclick=showWorldMap;$('#closeWorldMap').onclick=showHomeMenu;$('#menuSettings').onclick=settings;
  $('#home .brand').onclick=e=>{e.preventDefault();showHomeMenu();};
  if(typeof Image==='undefined')return;$('#assetStatus').textContent='Nieuwe racegraphics laden…';
  Promise.all(['menu','characters'].map(load)).then(()=>{$('#assetStatus').textContent='';renderPlayer();}).catch(()=>{$('#assetStatus').textContent='Een beeldbestand ontbreekt. Herlaad bij een trage verbinding.';});
 }
 function metrics(){return{...counts,loaded:[...pictures.keys()],frameCache:frames.size,tintCache:tinted.size,decodedBytes:[...pictures.values()].reduce((n,im)=>n+im.naturalWidth*im.naturalHeight*4,0)};}function resetMetrics(){for(const k of Object.keys(counts))counts[k]=0;}
 return {metrics,resetMetrics,image,load,tile,drawKart,drawScenery,landscape,effect,trackTexture,canRace,prepare,init,source};
})();
