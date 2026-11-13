/* V5 raster presentation. Physics, level rules and saved avatar IDs stay in the original engine. */
'use strict';
const RACER_NAMES=['Astronaut','Ninja','Vos','Panda','Kikker','Robot','Draak','Konijn','Tijger','Pinguïn','Kat','Piraat'];
function racerIndex(avatar){return Math.max(0,AVATARS.indexOf(avatar));}
function portraitMarkup(avatar,extra=''){const i=racerIndex(avatar);return `<span class="portrait-sprite ${i>=6?'extra-racer':''} ${extra}" data-character="${i}" role="img" aria-label="${RACER_NAMES[i]}"></span>`;}
function powerMarkup(item){const i=[1,2,3,4,6,5][item]??0;return `<span class="power-sprite" style="background-position:${(i%5)*25}% ${i>=5?100:0}%" aria-hidden="true"></span>`;}
function showWorldMap(){
 $('#home').classList.add('world-open');$('#worldPanel').classList.remove('hidden');$('#home .hero').classList.add('hidden');$('#home .player-hub').classList.add('hidden');$('#home .menu-tools').classList.add('hidden');renderMap();window.scrollTo?.({top:0,behavior:'smooth'});
}
function showHomeMenu(){
 $('#home').classList.remove('world-open');$('#worldPanel').classList.add('hidden');$('#home .hero').classList.remove('hidden');$('#home .player-hub').classList.remove('hidden');$('#home .menu-tools').classList.remove('hidden');window.scrollTo?.({top:0,behavior:'smooth'});
}
// Tint only the red lacquer. Pixel operations work without Canvas 2D filters.
function recolorKartPixels(data,color){
 const hex=/^#[\da-f]{6}$/i.test(color)?color:'#f56a48';
 const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,light=(max+min)/2;
 let hue=0;if(delta){hue=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;hue=(hue*60+360)%360;}
 const sat=delta===0?0:delta/(1-Math.abs(2*light-1)),sector=hue/60,x=1-Math.abs(sector%2-1),unit=sector<1?[1,x,0]:sector<2?[x,1,0]:sector<3?[0,1,x]:sector<4?[0,x,1]:sector<5?[x,0,1]:[1,0,x];
 for(let i=0;i<data.length;i+=4){
  if(!data[i+3])continue;
  const sr=data[i]/255,sg=data[i+1]/255,sb=data[i+2]/255,hi=Math.max(sr,sg,sb),lo=Math.min(sr,sg,sb),d=hi-lo;
  if(d<.06||hi!==sr)continue;
  const sourceHue=((sg-sb)/d*60+360)%360;if(sourceHue>22&&sourceHue<338)continue;
  const sourceLight=(hi+lo)/2,base=.62,adjusted=light<.3||light>.85?(sourceLight<base?sourceLight/base*light:light+(sourceLight-base)/(1-base)*(1-light)):sourceLight*(.55+light*.9);
  const l=Math.max(0,Math.min(1,adjusted)),chroma=(1-Math.abs(2*l-1))*sat,offset=l-chroma/2;
  for(let c=0;c<3;c++)data[i+c]=Math.round((offset+chroma*unit[c])*255);
 }
 return data;
}
const GFX=(()=>{
 const pictures=new Map(),pending=new Map(),frames=new Map(),tinted=new Map(),counts={karts:0,drivers:0,scenery:0,landscapes:0,effects:0,terrain:0};let loadingRace=false,allowFallback=false;
 const files={menu:'menu',characters:'characters',charactersExtra:'characters-extra',karts:'karts',scenery:'scenery',landscapes:'landscapes',bosses:'bosses',effects:'effects',garage:'garage',terrain:'terrain',winter:'winter',iceprops:'iceprops',burger:'burger'};
 const source=name=>name==='dogRear'?'./assets/graphics/hotdog-rear-v7.webp?v=boss-fair-1':name==='charactersExtra'?'./assets/graphics/characters-extra-v6-1.webp?v=6.1.0':`./assets/graphics/${files[name]}-v${['winter','iceprops','burger'].includes(name)?'6':'5'}.webp?v=${['winter','iceprops','burger'].includes(name)?'6.0':'5.0'}`;
 function image(name){const im=pictures.get(name);return im?.naturalWidth?im:null;}
 function load(name){
  if(typeof Image==='undefined')return Promise.resolve(null);if(pending.has(name))return pending.get(name);
  const task=new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>{pictures.set(name,im);resolve(im);};im.onerror=()=>{pending.delete(name);reject(new Error(name));};im.src=source(name);});pending.set(name,task);return task;
 }
 function tile(name,columns,rows,index){
  const key=`${name}:${index}`;if(frames.has(key))return frames.get(key);const im=image(name);if(!im)return null;
  const sw=im.naturalWidth/columns,sh=im.naturalHeight/rows,cv=document.createElement('canvas');cv.width=Math.round(sw);cv.height=Math.round(sh);cv.getContext('2d').drawImage(im,index%columns*sw,Math.floor(index/columns)*sh,sw,sh,0,0,cv.width,cv.height);frames.set(key,cv);return cv;
 }
 function coloredKart(index,color){const key=index+':'+color;if(tinted.has(key))return tinted.get(key);const base=tile('karts',3,2,index);if(!base)return null;const cv=document.createElement('canvas');cv.width=base.width;cv.height=base.height;const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(base,0,0);const pixels=c.getImageData(0,0,cv.width,cv.height);recolorKartPixels(pixels.data,color);c.putImageData(pixels,0,0);if(tinted.size>30)tinted.delete(tinted.keys().next().value);tinted.set(key,cv);return cv;}
 function driverSprite(avatar,rear=false){const i=racerIndex(avatar);return tile(i>=6?'charactersExtra':'characters',3,4,i%6+(rear?6:0));}
 const kartFx={lastAir:0};
 function drawKart(c,x,y,scale,color,dog,steer,player,angle=null){
  if(scale<.015)return true;
  if(dog){const boss=dog===true?(tile('dogRear',1,1,0)||tile('bosses',2,2,1)):dog==='burger'?tile('burger',2,1,1):tile('bosses',2,2,dog==='pizza'?3:1);if(!boss)return false;counts.karts++;c.save();c.translate(x,y);c.drawImage(boss,-77*scale,-138*scale,154*scale,154*scale);c.restore();return true;}
  const variant=angle===null?(steer<-.23?0:steer>.23?2:1):angle;
  const kart=coloredKart(variant,color),driver=driverSprite(player?.avatar||AVATARS[color==='#719dd4'?2:color==='#cb81ac'?3:4],variant<3);if(!kart||!driver)return false;counts.karts++;counts.drivers++;
  // Lightweight suspension, steering lean and driver reactions. No new assets or engine.
  const t=performance.now()/1000;
  const racing=typeof state!=='undefined'&&state&&!state.paused&&!state.finished;
  const speed=racing?Math.max(0,Math.min(1,(state.speed||0)/350)):0;
  const isPlayer=Boolean(player);
  const lean=Math.max(-1,Math.min(1,steer||0));
  const airborne=isPlayer&&racing?Math.max(0,Math.min(1,(state.rampAir||state.jump||0))):0;
  const suspension=racing?Math.sin(t*(12+speed*23))*(.35+speed*1.3):0;
  const lift=airborne*15;
  c.save();c.translate(x,y);
  // Drift dust and landing burst are visual-only and never alter steering physics.
  // Draw in road space, before the body moves with the suspension.
  if(isPlayer&&racing&&speed>.18){
   const corner=Math.abs(lean);
   const drifting=corner>.32&&speed>.32&&airborne<.12;
   const landing=airborne<.09&&kartFx.lastAir>.28;
   const dust=drifting?Math.min(1,(corner-.25)*1.4)*speed:0;
   const count=drifting?8:landing?13:0;
   if(count){
    c.save();
    for(let i=0;i<count;i++){
     const seed=i*2.39996+t*(drifting?3.4:7);
     const phase=(t*(drifting?2.3:4.8)+i*.173)%1;
     const side=i%2?-1:1;
     const radius=(drifting?5+phase*26:8+phase*47)*scale;
     const px=(side*(34+phase*35)+Math.sin(seed)*9)*scale;
     const py=(14+phase*(drifting?43:30))*scale;
     const alpha=(1-phase)*(drifting?.29*dust:.42);
     c.globalAlpha=alpha;
     c.fillStyle=i%3===0?'#f6e5c2':i%3===1?'#c9b28a':'#e8e4da';
     c.beginPath();c.ellipse(px,py,radius,radius*.64,0,0,Math.PI*2);c.fill();
    }
    c.restore();
   }
   // Short-lived sparks when taking a fast, hard corner.
   if(drifting&&corner>.7&&speed>.55){
    c.save();c.strokeStyle='#ffd46a';c.lineWidth=1.5*scale;c.globalAlpha=.6;
    for(let i=0;i<3;i++){const sx=(lean>0?-48:48)*scale;const sy=(12+i*5)*scale;
     c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+(lean>0?-1:1)*(10+i*6)*scale,sy+(4+i*3)*scale);c.stroke();}
    c.restore();
   }
  }
  if(isPlayer&&racing)kartFx.lastAir=airborne;
  else if(isPlayer)kartFx.lastAir=0;
  // Shadow stays on the road while the chassis lifts over jumps.
  ellipse(c,0,3*scale,57*scale*(1-airborne*.14),11*scale*(1-airborne*.14),'#071b2c4f');
  c.translate(0,(-lift+suspension)*scale);
  c.rotate(lean*(.025+speed*.055));
  c.transform(1,0,lean*.035,1,0,0);
  if(isPlayer&&racing&&state.boost>0)effect(c,3,0,5*scale,70*scale,65*scale,.85);
  c.drawImage(kart,-77*scale,-138*scale,154*scale,154*scale);
  // Driver leans a little into turns, with independent spring motion.
  const driverLean=lean*4*scale;
  const driverBob=racing?Math.sin(t*(10+speed*16))*.8*scale:0;
  c.save();c.translate(driverLean,driverBob);
  if(variant<3){c.drawImage(driver,-32*scale,-129*scale,64*scale,64*scale);}else{c.drawImage(driver,-31*scale,-129*scale,62*scale,62*scale);}
  c.restore();
  if(player?.helmet){c.strokeStyle=player.helmet;c.lineWidth=3*scale;c.beginPath();c.moveTo(-19*scale,-76*scale);c.lineTo(19*scale,-76*scale);c.stroke();}
  // Small moving highlights suggest tire rotation without regenerating or mutating the sprite.
  if(typeof state!=='undefined'&&state?.speed>100){c.globalAlpha=.22;const tick=performance.now()/45;for(const side of [-1,1]){for(let i=0;i<3;i++){c.fillStyle='#e8f7ff';c.fillRect(side*53*scale-2*scale,(-48+(i*9+tick)%27)*scale,3*scale,2*scale);}}c.globalAlpha=1;}
  if(player&&typeof xpLevel==='function'&&xpLevel()>=5){const t=performance.now()/900;c.globalAlpha=.75+Math.sin(t)*.2;c.strokeStyle='#fff5b5';c.lineWidth=1.8*scale;c.beginPath();c.moveTo(-47*scale,-76*scale);c.lineTo(-34*scale,-68*scale);c.lineTo(-47*scale,-60*scale);c.moveTo(-54*scale,-68*scale);c.lineTo(-34*scale,-68*scale);c.stroke();}
  c.restore();return true;
 }
 function drawScenery(c,type,x,y,k){
  if(sceneryLevel>50)return Ice.scenery(c,type,x,y,k);
  let index={oak:0,pine:1,blossom:2,barn:3,mill:4,fence:5,flowers:6,grass:6,rocks:7,pond:11,hay:7,sign:5}[type];
  if(typeof sceneryLevel!=='undefined'&&sceneryLevel>20)index={oak:9,pine:8,blossom:8,barn:10,mill:10,fence:9,flowers:9,grass:9,rocks:10,pond:11,hay:10,sign:9}[type];
  const prop=tile('scenery',4,3,index??0);if(!prop||k<.004)return false;const factor={oak:1.6,pine:1.65,blossom:1.6,barn:2.2,mill:2.4,fence:1.3,flowers:1.2,grass:.65,rocks:1.4,pond:2.3,hay:1.3,sign:1}[type]||1;
  counts.scenery++;c.drawImage(prop,x-195*k*factor,y-370*k*factor,390*k*factor,390*k*factor);return true;
 }
 function landscape(c,w,h,s){
  if(s.ice){counts.landscapes++;return Ice.landscape(c,w,h,s);}
  const im=image('landscapes');if(!im)return false;counts.landscapes++;const sh=im.naturalHeight/2,sy=s.sand?sh:0;
  const hh=h*.405,drift=Math.sin(s.d/18000)*w*.027-s.x*w*.012+Math.sin(s.time*.04)*w*.008;c.drawImage(im,0,sy,im.naturalWidth,sh,-w*.05+drift,-h*.02,w*1.1,hh+h*.02);
  return true;
 }
 function effect(c,index,x,y,w,h=w,alpha=1,rotation=0){const fx=index===0&&typeof state!=='undefined'&&state?.ice?tile('iceprops',3,3,8):tile('effects',5,2,index);if(!fx)return false;counts.effects++;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(rotation);c.drawImage(fx,-w/2,-h/2,w,h);c.restore();return true;}
 function trackTexture(c,a,b,s,terrain){
  if(s.ice||terrain!=='road'||a.y<=b.y||a.y<view.horizon+4||b.y>H||a.w<5)return;
  const road=tile('terrain',2,2,s.sand?3:0),ground=tile('terrain',2,2,s.sand?2:1);if(!road||!ground)return;counts.terrain++;
  const y=Math.max(b.y,0),height=Math.min(H+2,a.y+1)-y;if(height<.3)return;
  function stamp(points,im,left,width,opacity){if(width<1)return;c.save();c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip();c.globalAlpha=opacity;const sy=((a.segIndex%16+16)%16)*im.height/16;c.drawImage(im,0,sy,im.width,im.height/16,left,y,width,height+1);c.restore();}
  stamp([[a.x-a.w,a.y+1],[a.x+a.w,a.y+1],[b.x+b.w,b.y],[b.x-b.w,b.y]],road,a.x-a.w,a.w*2,.32);
  const opacity=typeof quality!=='undefined'&&quality.level===0?.3:.55;
  stamp([[0,a.y+1],[a.x-a.w*1.1,a.y+1],[b.x-b.w*1.1,b.y],[0,b.y]],ground,0,W,opacity);
  stamp([[a.x+a.w*1.1,a.y+1],[W,a.y+1],[W,b.y],[b.x+b.w*1.1,b.y]],ground,0,W,opacity);
 }
 function canRace(level){if(typeof Image==='undefined'||allowFallback)return true;return ['characters','karts','scenery','landscapes','effects','terrain',...(racerIndex(saved.player.avatar)>=6?['charactersExtra']:[]),...(level===20?['bosses','dogRear']:level===50?['bosses']:[]),...(level>50?['winter','iceprops']:[]),...(level===70?['burger']:[])].every(image);}
 function prepare(level,callback){
  if(loadingRace)return;loadingRace=true;showModal('<div class="loading-art"><span class="eyebrow">JE RACEWERELD WORDT KLAARGEZET</span><h2>Even de motor warmdraaien…</h2><div class="loading-wheel"></div><p>De nieuwe karts en omgeving worden geladen.</p></div>');
  const loader=document.querySelector('.loading-art');Promise.all(['characters','karts','scenery','landscapes','effects','terrain',...(racerIndex(saved.player.avatar)>=6?['charactersExtra']:[]),...(level===20?['bosses','dogRear']:level===50?['bosses']:[]),...(level>50?['winter','iceprops']:[]),...(level===70?['burger']:[])].map(load).concat([RaceAudio.prepare(level)])).then(()=>{loadingRace=false;if(loader?.isConnected&&modal.open)callback();}).catch(()=>{loadingRace=false;allowFallback=true;showModal('<h2>Een beeldbestand kon niet laden.</h2><p>Je kunt met de bestaande tekeningen verder racen, of opnieuw proberen.</p><button class="primary" id="retryArt">Opnieuw laden</button> <button class="secondary" id="fallbackRace">Verder racen</button>');$('#retryArt').onclick=()=>location.reload();$('#fallbackRace').onclick=callback;});
 }
 function init(){
  $('#openWorldMap').onclick=showWorldMap;$('#closeWorldMap').onclick=showHomeMenu;$('#menuSettings').onclick=settings;
  $('#home .brand').onclick=e=>{e.preventDefault();showHomeMenu();};
  if(typeof Image==='undefined')return;$('#assetStatus').textContent='Nieuwe racegraphics laden…';
  Promise.all(['menu','characters'].map(load)).then(()=>{$('#assetStatus').textContent='';renderPlayer();}).catch(()=>{$('#assetStatus').textContent='Een beeldbestand ontbreekt. Herlaad bij een trage verbinding.';});
 }
 function metrics(){return{...counts,loaded:[...pictures.keys()],frameCache:frames.size,tintCache:tinted.size,decodedBytes:[...pictures.values()].reduce((n,im)=>n+im.naturalWidth*im.naturalHeight*4,0)};}function resetMetrics(){for(const k of Object.keys(counts))counts[k]=0;}
 return {metrics,resetMetrics,image,load,tile,driverSprite,drawKart,drawScenery,landscape,effect,trackTexture,canRace,prepare,init,source};
})();
