/* ---------------- interaction ---------------- */
const pointers=new Map();let dragMoved=0,pinch0=null;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});dragMoved=0;cv.classList.add('dragging');if(pointers.size===2){const[p1,p2]=[...pointers.values()];pinch0={d:Math.hypot(p1.x-p2.x,p1.y-p2.y),z:cam.tz}}});
cv.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(pointers.size===1){dragMoved+=Math.abs(dx)+Math.abs(dy);if(dragMoved>4&&cam.follow){cam.follow=null;hideCard()}{const w=scrToWorldDelta(dx,dy,cam.zoom);cam.tx-=w[0];cam.ty-=w[1];cam.x-=w[0];cam.y-=w[1]}}
  else if(pointers.size===2&&pinch0){const[p1,p2]=[...pointers.values()];const d=Math.hypot(p1.x-p2.x,p1.y-p2.y);zoomAt((p1.x+p2.x)/2,(p1.y+p2.y)/2,clamp(pinch0.z*d/pinch0.d,ZMIN,ZMAX)/cam.tz);dragMoved=99}});
const endPtr=e=>{if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(pointers.size<2)pinch0=null;if(!pointers.size){cv.classList.remove('dragging');if(dragMoved<5)pick(e.clientX,e.clientY)}};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
function zoomAt(sx,sy,f){const d0=scrToWorldDelta(sx-W/2,sy-H/2,cam.tz),w=[cam.tx+d0[0],cam.ty+d0[1]];cam.tz=clamp(cam.tz*f,ZMIN,ZMAX);if(!cam.follow){const d1=scrToWorldDelta(sx-W/2,sy-H/2,cam.tz);cam.tx=w[0]-d1[0];cam.ty=w[1]-d1[1]}}
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*(e.ctrlKey?.01:.0016)))},{passive:false});
cv.addEventListener('dblclick',e=>zoomAt(e.clientX,e.clientY,2.2));
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'&&e.target.type!=='range')return;const k=e.key;
  if(e.ctrlKey||e.metaKey||e.altKey)return;if(k==='q')rotateView(-1);else if(k==='e')rotateView(1)
  else if(k==='+'||k==='='){zoomAt(W/2,H/2,1.4)}else if(k==='-'||k==='_'){zoomAt(W/2,H/2,1/1.4)}else if(k==='Escape'){unfollow();document.getElementById('voicePanel').hidden=true}else if(k===' '&&e.target===document.body){e.preventDefault();togglePause()}});
function unfollow(){if(cam.follow){cam.follow=null;hideCard()}}
document.getElementById('zin').onclick=()=>zoomAt(W/2,H/2,1.6);document.getElementById('zout').onclick=()=>zoomAt(W/2,H/2,1/1.6);
function pick(sx,sy){
  let best=null,bd=22;
  const test=(o,x,y,z)=>{const s=toScreen(x+KX*z,y-KZ*z),d=Math.hypot(s[0]-sx,s[1]-sy);if(d<bd){bd=d;best=o}};
  if(cam.zoom>1.4){for(const p of peds)if(onScreen(p.dx,p.dy))test(p,p.dx,p.dy,.9);for(const f of fixedPeople)if(!f.hidden&&onScreen(f.x,f.y))test(f,f.x,f.y,.8)}
  for(const v of vehicles)if(onScreen(v.dx,v.dy))test(v,v.dx,v.dy,1);
  if(best){cam.follow=best;if(cam.tz<7)cam.tz=Math.max(cam.tz,9);showCard(best)}else{unfollow();const w=toWorld(sx,sy);if(!tapRestaurant(w[0],w[1])&&!tapStall(w[0],w[1]))walkTo(w[0],w[1])}
}
function follow(o){cam.follow=o;if(cam.tz<9)cam.tz=10;showCard(o)}
document.getElementById('btnFollow').onclick=()=>{
  const pool=[...vehicles.filter(v=>!v.parked&&(v.type==='rickshaw'&&v.pax.length||v.type==='bus'||v.type==='dd')),...peds.filter(p=>p.st==='walk'&&!p.roam),...fixedPeople.filter(f=>f.stall&&!f.hidden)];
  if(pool.length)follow(mpick(pool))};

