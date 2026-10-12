/* ---------------- view controls ---------------- */
const ANGLES=[['bird',"bird's-eye",-0.32,0.8],['street','street level',-0.26,1.35],['top','top-down',-0.14,0.38]];let angIdx=0;
const FACING=['north','west','south','east'],FACING8=['north','north-west','west','south-west','south','south-east','east','north-east'];
const facingTxt=()=>'Looking '+FACING8[((Math.round(VIEW.th/(Math.PI/4))%8)+8)%8];
function applyView(msg){toast(msg||'Turning the sketchbook…');setTimeout(()=>{setViewConsts();for(const b of buildings){geomBuilding(b);dropSprite(b)}primeSprites();$('facing').textContent=facingTxt();toastT=1.2},40)}
/* free rotation: the city turns to any angle (right-drag, alt-drag, two-finger twist, hold Q / E, or the turn buttons, which glide a quarter turn).
   While it turns, buildings near the view get fresh geometry every frame and are drawn live; their cached pictures are rebuilt once it stops. */
const ROT={on:false,idle:0,hold:0,holdT:0,goal:null,dirty:false};
const QT=Math.PI/2;
function turnTo(th){VIEW.th=((th%TAU)+TAU)%TAU;VIEW.dir=((Math.round(VIEW.th/QT)%4)+4)%4;ROT.on=true;ROT.idle=0;ROT.dirty=true}
const turnBy=d=>{ROT.goal=null;turnTo(VIEW.th+d)};
function rotateView(d){const base=ROT.goal!==null?ROT.goal:Math.round(VIEW.th/QT)*QT;ROT.goal=base+d*QT}
function rotTick(dt){
  if(ROT.hold){ROT.holdT+=dt;turnBy(ROT.hold*1.5*dt)}
  if(ROT.goal!==null){const d=ROT.goal-VIEW.th,dd=Math.atan2(Math.sin(d),Math.cos(d)),st=Math.sign(dd)*Math.min(Math.abs(dd),dt*3.2);turnTo(VIEW.th+st);if(Math.abs(dd)<1e-3){turnTo(ROT.goal);ROT.goal=null}}
  if(ROT.dirty){ROT.dirty=false;setViewConsts();const R=Math.hypot(W,H)/cam.zoom*.7+90;for(const b of buildings){if(b.cx===undefined){const c=qCenter(b.foot);b.cx=c[0];b.cy=c[1]}if(Math.abs(b.cx-cam.x)<R&&Math.abs(b.cy-cam.y)<R)geomBuilding(b)}$('facing').textContent=facingTxt()}
  else if(ROT.on){ROT.idle+=dt;if(ROT.idle>.3&&!ROT.hold&&ROT.goal===null){ROT.on=false;for(const b of buildings){geomBuilding(b);dropSprite(b)}primeSprites()}}}
const BMODES=[['full','full'],['cut','cut away'],['flat','footprints']];function cycleB(){const i=(BMODES.findIndex(m=>m[0]===BMODE)+1)%3;BMODE=BMODES[i][0];$('btnBld').textContent='Buildings: '+BMODES[i][1]}
$('btnBld').onclick=cycleB;addEventListener('keydown',e=>{if((e.key==='b'||e.key==='B')&&e.target.tagName!=='INPUT')cycleB()});
$('btnRotL').onclick=()=>rotateView(-1);$('btnRotR').onclick=()=>rotateView(1);
$('btnAngle').onclick=()=>{angIdx=(angIdx+1)%ANGLES.length;const a=ANGLES[angIdx];VIEW.mode=a[0];VIEW.kx0=a[2];VIEW.kz0=a[3];$('btnAngle').textContent='Angle: '+a[1];applyView('Changing the angle…')};
