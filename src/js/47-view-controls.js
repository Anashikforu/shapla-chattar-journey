/* ---------------- view controls ---------------- */
const ANGLES=[['bird',"bird's-eye",-0.32,0.8],['street','street level',-0.26,1.35],['top','top-down',-0.14,0.38]];let angIdx=0;
const FACING=['north','west','south','east'];
function applyView(msg){toast(msg||'Turning the sketchbook…');setTimeout(()=>{setViewConsts();for(const b of buildings){geomBuilding(b);b.spr=null;b.mip=null}for(const b of buildings)makeSprite(b);$('facing').textContent='Looking '+FACING[VIEW.dir];toastT=1.2},40)}
function rotateView(d){VIEW.dir=(VIEW.dir+d+4)%4;VIEW.th=VIEW.dir*Math.PI/2;applyView()}
const BMODES=[['full','full'],['cut','cut away'],['flat','footprints']];function cycleB(){const i=(BMODES.findIndex(m=>m[0]===BMODE)+1)%3;BMODE=BMODES[i][0];$('btnBld').textContent='Buildings: '+BMODES[i][1]}
$('btnBld').onclick=cycleB;addEventListener('keydown',e=>{if((e.key==='b'||e.key==='B')&&e.target.tagName!=='INPUT')cycleB()});
$('btnRotL').onclick=()=>rotateView(-1);$('btnRotR').onclick=()=>rotateView(1);
$('btnAngle').onclick=()=>{angIdx=(angIdx+1)%ANGLES.length;const a=ANGLES[angIdx];VIEW.mode=a[0];VIEW.kx0=a[2];VIEW.kz0=a[3];$('btnAngle').textContent='Angle: '+a[1];applyView('Changing the angle…')};
