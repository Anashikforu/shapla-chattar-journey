/* ---------------- save & load (browser storage; safe when unavailable) ---------------- */
const SAVE_KEY='shapla-journey-v1';let LOADED=false;
function saveState(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,hour:HOUR,cam:{x:cam.tx,y:cam.ty,z:cam.tz},dir:VIEW.dir,ang:angIdx,bmode:BMODE,lang:LANG,speed:sIdx,rain:RAIN_MODE,weekend:FRIDAY,sound:soundPref,me:{x:+me.x.toFixed(2),y:+me.y.toFixed(2)},follow:cam.follow===me,stat:{w:Math.round(STAT.wallet),e:+STAT.energy.toFixed(1),g:STAT.goal,a:STAT.ate}}))}catch(e){}}
function loadState(){let d=null;try{d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch(e){}if(!d||d.v!==1)return false;
  if(typeof d.hour==='number')HOUR=d.hour%24;
  if(d.cam){cam.x=cam.tx=d.cam.x;cam.y=cam.ty=d.cam.y;cam.zoom=cam.tz=clamp(d.cam.z,ZMIN,ZMAX)}
  for(let i=0;i<3&&LANG!==d.lang;i++)$('btnLang').click();
  for(let i=0;i<3&&sIdx!==d.speed;i++)$('btnSpeed').click();
  for(let i=0;i<3&&RAIN_MODE!==d.rain;i++)$('btnRain').click();
  if(!!d.weekend!==FRIDAY)$('btnFriday').click();
  for(let i=0;i<3&&BMODE!==d.bmode;i++)cycleB();
  if(d.sound===false&&soundPref){soundPref=false;syncSoundUI()}
  if(d.me&&typeof d.me.x==='number'&&typeof d.me.y==='number'&&!navAt(d.me.x,d.me.y)){me.x=me.dx=d.me.x;me.y=me.dy=d.me.y}
  if(d.stat){if(typeof d.stat.w==='number')STAT.wallet=Math.max(0,d.stat.w);if(typeof d.stat.e==='number')STAT.energy=clamp(d.stat.e,0,100);STAT.ate=!!d.stat.a;if(Number.isInteger(d.stat.g))STAT.goal=clamp(d.stat.g,0,GOALS.length)}
  if(d.follow===false)cam.follow=null;else{cam.x=cam.tx=me.x+KX;cam.y=cam.ty=me.y-KZ}
  const dir=(d.dir|0)%4,ang=(d.ang|0)%ANGLES.length;
  if(dir!==VIEW.dir||ang!==angIdx){VIEW.dir=dir;VIEW.th=dir*Math.PI/2;angIdx=ang;const a=ANGLES[ang];VIEW.mode=a[0];VIEW.kx0=a[2];VIEW.kz0=a[3];$('btnAngle').textContent='Angle: '+a[1];applyView('Restoring your view…')}
  return true}
{const w=setInterval(()=>{if(document.getElementById('loading'))return;clearInterval(w);loadState();LOADED=true;setInterval(saveState,3000);addEventListener('pagehide',saveState);addEventListener('visibilitychange',()=>{if(document.hidden)saveState()})},200)}
