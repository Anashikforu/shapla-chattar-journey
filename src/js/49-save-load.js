/* ---------------- save & load (browser storage; safe when unavailable) ---------------- */
const SAVE_KEY='shapla-journey-v1';let LOADED=false;   // the key keeps its name so older saves are found
/* save format. 1: goal saved as a position in the chain. 2: goal saved by id. Add a step to migrate() whenever the format changes. */
const SAVE_VERSION=2;
const GOAL_CHAIN_V1_OLD=['fountain','bank','baitul','kamalapur'];                       // saves from before the meal goal existed
const GOAL_CHAIN_V1_NEW=['fountain','eat','bank','baitul','kamalapur','skyline'];       // v1 saves written after it
function migrate(d){
  if(d.v===1){const st=d.stat;if(st&&Number.isInteger(st.g)){const chain=typeof st.a==='undefined'?GOAL_CHAIN_V1_OLD:GOAL_CHAIN_V1_NEW;st.gid=chain[st.g]||'done'}d.v=2}
  return d.v===SAVE_VERSION?d:null}   // a save from a newer version is ignored rather than guessed at
function saveState(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:SAVE_VERSION,hour:HOUR,cam:{x:cam.tx,y:cam.ty,z:cam.tz},dir:VIEW.dir,th:VIEW.th,ang:angIdx,bmode:BMODE,lang:LANG,speed:sIdx,rain:RAIN_MODE,weekend:FRIDAY,sound:soundPref,me:{x:+me.x.toFixed(2),y:+me.y.toFixed(2)},follow:cam.follow===me,stat:{w:Math.round(STAT.wallet),e:+STAT.energy.toFixed(1),g:STAT.goal,gid:(GOALS[STAT.goal]||{}).id||'done',a:STAT.ate,f:STAT.fine,o:STAT.outfit||null,sa:!!STAT.sandals,gm:!!STAT.gamchha,al:STAT.alms||0}}))}catch(e){}}
function loadState(){let d=null;try{d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch(e){}d=d&&typeof d.v==='number'?migrate(d):null;if(!d)return false;
  if(typeof d.hour==='number')HOUR=d.hour%24;
  if(d.cam){cam.x=cam.tx=d.cam.x;cam.y=cam.ty=d.cam.y;cam.zoom=cam.tz=clamp(d.cam.z,ZMIN,ZMAX)}
  for(let i=0;i<3&&LANG!==d.lang;i++)$('btnLang').click();
  for(let i=0;i<3&&sIdx!==d.speed;i++)$('btnSpeed').click();
  for(let i=0;i<3&&RAIN_MODE!==d.rain;i++)$('btnRain').click();
  if(!!d.weekend!==FRIDAY)$('btnFriday').click();
  for(let i=0;i<3&&BMODE!==d.bmode;i++)cycleB();
  if(d.sound===false&&soundPref){soundPref=false;syncSoundUI()}
  if(d.me&&typeof d.me.x==='number'&&typeof d.me.y==='number'&&!navAt(d.me.x,d.me.y)){me.x=me.dx=d.me.x;me.y=me.dy=d.me.y}
  if(d.stat){if(typeof d.stat.w==='number')STAT.wallet=Math.max(0,d.stat.w);if(typeof d.stat.e==='number')STAT.energy=clamp(d.stat.e,0,100);STAT.ate=!!d.stat.a;STAT.fine=!!d.stat.f;STAT.outfit=d.stat.o||null;STAT.sandals=!!d.stat.sa;STAT.gamchha=!!d.stat.gm;STAT.alms=d.stat.al||0;restoreOutfit();if(typeof d.stat.gid==='string'){const i=GOALS.findIndex(g=>g.id===d.stat.gid);STAT.goal=i>=0?i:d.stat.gid==='done'?GOALS.length:0}}
  if(d.follow===false)cam.follow=null;else{cam.x=cam.tx=me.x+KX;cam.y=cam.ty=me.y-KZ}
  const dir=(d.dir|0)%4,ang=(d.ang|0)%ANGLES.length;
  const th=typeof d.th==='number'&&isFinite(d.th)?((d.th%TAU)+TAU)%TAU:dir*Math.PI/2;   // any angle; older saves only had the quarter turn
  if(Math.abs(th-VIEW.th)>1e-6||ang!==angIdx){VIEW.dir=dir;VIEW.th=th;angIdx=ang;const a=ANGLES[ang];VIEW.mode=a[0];VIEW.kx0=a[2];VIEW.kz0=a[3];$('btnAngle').textContent='Angle: '+a[1];applyView('Restoring your view…')}
  return true}
{const w=setInterval(()=>{if(document.getElementById('loading'))return;clearInterval(w);loadState();LOADED=true;setInterval(saveState,3000);addEventListener('pagehide',saveState);addEventListener('visibilitychange',()=>{if(document.hidden)saveState()})},200)}
