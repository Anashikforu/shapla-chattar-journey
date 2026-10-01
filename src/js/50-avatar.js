
/* ---------------- player avatar: walk with WASD / arrows, or tap the ground ---------------- */
const nav=new Uint8Array(MW*MW);   // 1 = the avatar cannot stand here (building lots, island, trunks, stalls)
const me={role:'me',name:'You',x:0,y:0,dx:0,dy:0,fc:1,ph:0,pose:'stand',act:null,spd:0,path:null,goal:null,stuck:0,look:null};
const navAt=(x,y)=>{const k=mk(x,y);return k<0||nav[k]===1||Math.abs(x)>E-8||Math.abs(y)>E-8};   // true = blocked
function initNav(){
  for(let k=0;k<nav.length;k++)if(occ[k]||mask[k]===3)nav[k]=1;
  const cells=(x,y,r,f)=>{for(let j=Math.floor(y-r+MO);j<=Math.floor(y+r+MO);j++)for(let i=Math.floor(x-r+MO);i<=Math.floor(x+r+MO);i++){if(i<0||j<0||i>=MW||j>=MW)continue;if(f(i+.5-MO-x,j+.5-MO-y))nav[j*MW+i]=1}};
  for(const t of trees)cells(t.x,t.y,.7,(u,v)=>u*u+v*v<=.49);
  for(const s of stalls){const hw=s.w/2+.2,hd=s.d/2+.2;cells(s.x,s.y,Math.hypot(hw,hd),(u,v)=>Math.abs(u*s.tx+v*s.ty)<=hw&&Math.abs(u*s.nx+v*s.ny)<=hd)}
  for(const o of staticObs){const r=Math.min(o.len,o.wid)/2;cells(o.x,o.y,r,(u,v)=>u*u+v*v<=r*r)}
}
function nearestFree(x,y,R=16){if(!navAt(x,y))return[x,y];for(let r=1;r<=R;r++)for(let a=0,n=r*8;a<n;a++){const t=a/n*TAU,px=x+Math.cos(t)*r,py=y+Math.sin(t)*r;if(!navAt(px,py))return[px,py]}return null}
function initAvatar(){
  initNav();
  const L=makeLook('office',false);Object.assign(L,{skin:'#a0694a',h:1.66,dress:'pants',c1:'#b8432f',c2:'#3a3a3f',hair:'#1f1b18',cap:false,beard:false,tie:false,gamchha:false,bag:true,hasUmb:true,umbCol:'#b8432f'});me.look=L;
  let p=null;for(let r=1;r<=80&&!p;r++)for(let a=0,n=r*8;a<n&&!p;a++){const t=a/n*TAU,x=Math.cos(t)*r,y=-22+Math.sin(t)*r;if(!navAt(x,y)&&cellAt(x,y)===1)p=[x,y]}   // nearest footpath to the first view
  p=p||nearestFree(0,-22,60)||[0,-45];me.x=me.dx=p[0];me.y=me.dy=p[1];
  cam.follow=me;cam.x=cam.tx=me.x+KX;cam.y=cam.ty=me.y-KZ;
}

/* A* over the 1 m nav grid, then string-pulled into a few straight legs */
const AG=new Float32Array(MW*MW),ASEEN=new Uint32Array(MW*MW),APAR=new Int32Array(MW*MW);let ASEEN_ID=0;
function findPath(ax,ay,bx,by){
  const s=mk(ax,ay),g=mk(bx,by);if(s<0||g<0)return null;const gi=g%MW,gj=(g/MW)|0,id=++ASEEN_ID;
  const hk=[],hv=[];
  const push=(f,n)=>{let i=hk.length;hk.push(f);hv.push(n);while(i>0){const p=(i-1)>>1;if(hk[p]<=f)break;hk[i]=hk[p];hv[i]=hv[p];i=p}hk[i]=f;hv[i]=n};
  const pop=()=>{const top=hv[0],f=hk.pop(),n=hv.pop();if(hk.length){let i=0;for(;;){let c=2*i+1;if(c>=hk.length)break;if(c+1<hk.length&&hk[c+1]<hk[c])c++;if(hk[c]>=f)break;hk[i]=hk[c];hv[i]=hv[c];i=c}hk[i]=f;hv[i]=n}return top};
  const h=(i,j)=>{const dx=Math.abs(i-gi),dy=Math.abs(j-gj);return(dx+dy+(Math.SQRT2-2)*Math.min(dx,dy))*1.15};
  ASEEN[s]=id;AG[s]=0;APAR[s]=-1;push(h(s%MW,(s/MW)|0),s);let found=false;
  for(let n=0;hk.length&&n<300000;n++){
    const c=pop();if(c===g){found=true;break}const ci=c%MW,cj=(c/MW)|0,cg=AG[c];
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=MW||nj>=MW)continue;const k=nj*MW+ni;if(nav[k])continue;
      if(di&&dj&&(nav[cj*MW+ni]||nav[nj*MW+ci]))continue;   // no cutting corners
      const ng=cg+(di&&dj?Math.SQRT2:1);if(ASEEN[k]===id&&AG[k]<=ng)continue;ASEEN[k]=id;AG[k]=ng;APAR[k]=c;push(ng+h(ni,nj),k)}}
  if(!found)return null;
  const cellsRev=[];for(let k=g;k>=0;k=APAR[k])cellsRev.push([k%MW-MO+.5,((k/MW)|0)-MO+.5]);const pts=cellsRev.reverse();pts[0]=[ax,ay];pts[pts.length-1]=[bx,by];
  const clear=(x0,y0,x1,y1)=>{const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/.4);for(let i=1;i<=n;i++)if(navAt(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n))return false;return true};
  const out=[];let i=0;while(i<pts.length-1){let j=Math.min(pts.length-1,i+80);while(j>i+1&&!clear(pts[i][0],pts[i][1],pts[j][0],pts[j][1]))j--;out.push(pts[j]);i=j}
  return out;
}
function followMe(){if(cam.follow!==me){cam.follow=me;hideCard()}if(cam.tz<5)cam.tz=6.5}
function walkTo(wx,wy){
  const g=nearestFree(wx,wy);if(!g){toast("Can't walk there.");return false}
  const p=findPath(me.x,me.y,g[0],g[1]);if(!p){toast('No way through to there.');return false}
  me.path=p;me.goal=g;me.stuck=0;me.replanned=false;followMe();return true}

/* held movement keys (physical positions, so WASD works on any layout) */
const MKEYS={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
const heldKeys=new Set();let sprint=false;
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.ctrlKey||e.metaKey||e.altKey)return;sprint=e.shiftKey;if(MKEYS[e.code]){heldKeys.add(e.code);e.preventDefault()}});
addEventListener('keyup',e=>{sprint=e.shiftKey;heldKeys.delete(e.code)});
addEventListener('blur',()=>{heldKeys.clear();sprint=false});
$('btnMe').onclick=()=>{followMe()};
addEventListener('keydown',e=>{if((e.key==='f'||e.key==='F')&&e.target.tagName!=='INPUT'&&!e.ctrlKey&&!e.metaKey&&!e.altKey)followMe()});

/* things that move or stand about: vehicles are oriented boxes, people are discs. Both block the avatar. */
const ME_R=.3,PED_R=.28;
const pedX=o=>(o.fixed?o.x:o.dx)+(o.gx||0),pedY=o=>(o.fixed?o.y:o.dy)+(o.gy||0);
function hitDyn(x,y){
  for(const v of vehicles){if(v.hx===undefined)continue;const ux=x-v.dx,uy=y-v.dy;if(ux>v.len||ux<-v.len||uy>v.len||uy<-v.len)continue;
    if(Math.abs(ux*v.hx+uy*v.hy)<v.len/2+ME_R&&Math.abs(-ux*v.hy+uy*v.hx)<v.wid/2+ME_R)return v}
  const r=ME_R+PED_R;
  for(const list of[peds,fixedPeople])for(const o of list){if(o.hidden||o.dead)continue;const ux=x-pedX(o),uy=y-pedY(o);if(ux>r||ux<-r||uy>r||uy<-r)continue;if(ux*ux+uy*uy<r*r)return o}
  return null}
function stepMove(dx,dy){   // slide along walls and bodies; returns metres actually moved; me.hit = what stopped us
  const x0=me.x,y0=me.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.4)),sx=dx/n,sy=dy/n,inside=hitDyn(me.x,me.y);me.hit=null;
  const can=(x,y)=>{if(navAt(x,y))return false;if(inside)return true;const h=hitDyn(x,y);if(h){me.hit=h;return false}return true};
  for(let i=0;i<n;i++){if(can(me.x+sx,me.y+sy)){me.x+=sx;me.y+=sy}else if(sx&&can(me.x+sx,me.y))me.x+=sx;else if(sy&&can(me.x,me.y+sy))me.y+=sy;else break}
  return Math.hypot(me.x-x0,me.y-y0)}
function pushOut(dt){   // if something walked or drove into us, get shoved clear
  const h=hitDyn(me.x,me.y);if(!h)return;let ux,uy;
  if(h.T){const rx=me.x-h.dx,ry=me.y-h.dy,a=rx*h.hx+ry*h.hy,l=-rx*h.hy+ry*h.hx;
    if(h.wid/2+ME_R-Math.abs(l)<h.len/2+ME_R-Math.abs(a)){const g=l>=0?1:-1;ux=-h.hy*g;uy=h.hx*g}else{const g=a>=0?1:-1;ux=h.hx*g;uy=h.hy*g}}
  else{ux=me.x-pedX(h);uy=me.y-pedY(h);const d=Math.hypot(ux,uy);if(d<1e-3){ux=1;uy=0}else{ux/=d;uy/=d}}
  const m=Math.min(4*dt,.3);if(!navAt(me.x+ux*m,me.y+uy*m)){me.x+=ux*m;me.y+=uy*m}else if(!navAt(me.x+ux*m,me.y))me.x+=ux*m;else if(!navAt(me.x,me.y+uy*m))me.y+=uy*m}

/* crowds give way: walkers near the avatar sidestep (a drawing offset gx,gy that eases in and out), never onto obstacles or off the footpath */
const YIELD_R=1.7;let yieldStamp=0;const yielding=new Set();
function canYield(o){return!(o.hidden||o.dead||o.stall||o.onPod||o.role==='police'||o.pose==='sit'||o.pose==='squat'||o.st==='flee'||o.st==='chase'||o.st==='stalk'||o.st==='bargain'||o.st==='board')}
function updYield(dt){
  yieldStamp++;const mvx=me.vx||0,mvy=me.vy||0,moving=Math.hypot(mvx,mvy)>.5;
  for(const list of[peds,fixedPeople])for(const o of list){
    const bx=o.fixed?o.x:o.dx,by=o.fixed?o.y:o.dy,ox=bx-me.x,oy=by-me.y;if(ox>YIELD_R||ox<-YIELD_R||oy>YIELD_R||oy<-YIELD_R||!canYield(o))continue;
    const d=Math.hypot(ox,oy);if(d>=YIELD_R)continue;const k=(YIELD_R-d)/YIELD_R,ax=d>.01?ox/d:1,ay=d>.01?oy/d:0;
    let tx=ax*k*.7,ty=ay*k*.7;
    if(moving){const l=Math.hypot(mvx,mvy),px=-mvy/l,py=mvx/l,sg=ox*px+oy*py>=0?1:-1;tx+=px*sg*k*.9;ty+=py*sg*k*.9}
    const m=Math.hypot(tx,ty);if(m>.95){tx*=.95/m;ty*=.95/m}
    const road=isRoad(bx,by);for(let t=0;t<2&&(tx||ty);t++){if(navAt(bx+tx,by+ty)||(!road&&isRoad(bx+tx,by+ty))){tx*=.5;ty*=.5}else break}
    if(navAt(bx+tx,by+ty)||(!road&&isRoad(bx+tx,by+ty))){tx=0;ty=0}
    o.gt=[tx,ty];o.gs=yieldStamp;yielding.add(o)}
  const e=Math.min(1,dt*5);
  for(const o of yielding){const t=o.gs===yieldStamp?o.gt:null;o.gx=(o.gx||0)+((t?t[0]:0)-(o.gx||0))*e;o.gy=(o.gy||0)+((t?t[1]:0)-(o.gy||0))*e;
    if(!t&&Math.abs(o.gx)<.02&&Math.abs(o.gy)<.02){o.gx=o.gy=0;yielding.delete(o)}}
}
const HORNS={bus:'sfx_horn_bus',dd:'sfx_horn_bus',cng:'sfx_horn_cng',bike:'sfx_horn_bike',rickshaw:'sfx_rickshaw_bell'};
function honkAt(v){if(v.bumpHonk>simT)return;v.bumpHonk=simT+4;v.honk=simT;sfx(HORNS[v.type]||'sfx_horn_car',v.x,v.y)}
function bumpInto(h,speed){   // hard knock: stagger, mark, and let the other side react
  me.bumpT=.45;me.bumpAt=[(me.x+(h.T?h.dx:pedX(h)))/2,(me.y+(h.T?h.dy:pedY(h)))/2];me.spd=Math.min(me.spd,speed*.2);
  if(h.T){honkAt(h);if(h.honkT>3)h.honkT=mr(3,8)}
  else{h.fc=sdir(me.x-pedX(h),me.y-pedY(h))>0?1:-1;say(pedAnchor(h),mpick(['bump_1','bump_2']),2.6,h)}}
function honkIfBlocking(){   // a vehicle stopped right in front of us leans on its horn
  for(const v of vehicles){if(v.hx===undefined||v.parked||v.spd>1)continue;const ux=me.x-v.dx,uy=me.y-v.dy;if(ux>9||ux<-9||uy>9||uy<-9)continue;
    const a=ux*v.hx+uy*v.hy,l=-ux*v.hy+uy*v.hx;if(a>0&&a<v.len/2+6&&Math.abs(l)<v.wid/2+1&&v.honkT>1.5)v.honkT=mr(.4,1.4)}}
function updAvatar(dt){
  let vx=0,vy=0,want=0,movedNow=0;
  if(heldKeys.size){let sx=0,sy=0;for(const k of heldKeys){sx+=MKEYS[k][0];sy+=MKEYS[k][1]}
    if(sx||sy){const l=Math.hypot(sx,sy),w=scrToWorldDelta(sx/l,sy/l,1);vx=w[0];vy=w[1];want=1;me.path=null;me.goal=null;me.enterOnArrive=false;if(cam.follow!==me)followMe()}}
  else if(me.path){const wp=me.path[0],dx=wp[0]-me.x,dy=wp[1]-me.y,d=Math.hypot(dx,dy);
    if(d<.35){me.path.shift();if(!me.path.length){me.path=null;me.goal=null}}else{vx=dx/d;vy=dy/d;want=Math.min(1,d/.8+.25)}}
  const run=sprint&&canSprint(),top=clamp(100/cam.zoom,3,12)*(run?1.7:1)*tiredK();
  me.spd+=clamp(top*want-me.spd,-60*dt,45*dt);
  if(me.spd>.05&&(vx||vy)){const moved=movedNow=stepMove(vx*me.spd*dt,vy*me.spd*dt);
    if(me.path){me.stuck=moved<me.spd*dt*.3?me.stuck+dt:0;
      if(me.stuck>(me.hit?3:.7)){   // a wall is final, but traffic and crowds move on: wait, re-plan once, then give up
        const np=!me.replanned&&me.goal&&findPath(me.x,me.y,me.goal[0],me.goal[1]);
        if(np){me.path=np;me.stuck=0;me.replanned=true}else{me.path=null;me.goal=null;me.spd=0}}}
    if(me.hit&&me.spd>2.5&&moved<me.spd*dt*.6)bumpInto(me.hit,me.spd);
    const fx=sdir(vx,vy);if(Math.abs(fx)>.05)me.fc=fx>0?1:-1}
  else if(!want)me.spd=Math.max(0,me.spd-60*dt);
  updStatus(dt,movedNow,run);
  me.vx=vx*me.spd;me.vy=vy*me.spd;if(me.bumpT>0)me.bumpT-=dt;
  pushOut(dt);updYield(dt);honkIfBlocking();
  if(me.enterOnArrive&&!me.path){me.enterOnArrive=false;if(restoState()===1)enterRestaurant()}
  syncEnterBtn();
  me.pose=me.spd>.2?'walk':'stand';if(me.pose==='walk')me.ph+=Math.min(me.spd*5.4,14)*dt;
  const k=Math.min(1,dt*20);me.dx+=(me.x-me.dx)*k;me.dy+=(me.y-me.dy)*k;
}

/* drawing: the usual figure, plus a red pencil ring and a bobbing "you" arrow so it can be found at any zoom */
function drawAvatar(c,lod){
  const x=me.dx,y=me.dy,z=cam.zoom,r=Math.max(.8,8/z);
  J=mulberry32(5+BOIL);c.beginPath();const ring=[];for(let i=0;i<9;i++){const a=i/9*TAU;ring.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}spoly(c,ring,r*.1);pencil(c,'#b8432f',.8,1.5);c.stroke();c.globalAlpha=1;
  drawPerson(c,me,x,y,Math.max(lod,1));
}
function drawAvatarMarker(c){   // drawn after everything else so bridges and buildings never hide it
  c.save();c.translate(me.dx,me.dy);if(VIEW.th)c.rotate(-VIEW.th);
  const H=me.look.h*1.12,s=Math.max(.34,7/cam.zoom),bob=Math.sin(simT*4)*s*.18,hx=VIEW.kx0*1.05*H,hy=-VIEW.kz0*1.05*H-.3-s*.4-bob;
  const tri=[[hx-s*.75,hy-s*1.2],[hx+s*.75,hy-s*1.2],[hx,hy]];c.globalAlpha=1;c.fillStyle=wash('#b8432f',.8);fillPoly(c,tri);
  J=mulberry32(9+BOIL);c.beginPath();spoly(c,tri,s*.08);pencil(c,'#7a2a1e',.9,1.2);c.stroke();c.globalAlpha=1;c.restore();
  if(me.bumpT>0){const[bx,by]=me.bumpAt,u=Math.max(.5,9/cam.zoom),t=1-me.bumpT/.45,c0=P3([bx,by],1);   // impact strokes, spreading and fading
    J=mulberry32(13+BOIL);c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.7;sl(c,c0[0]+Math.cos(a)*u*(.5+t*.5),c0[1]+Math.sin(a)*u*(.5+t*.5),c0[0]+Math.cos(a)*u*(1.2+t*.9),c0[1]+Math.sin(a)*u*(1.2+t*.9),u*.08)}
    pencil(c,'#b8432f',1-t,1.8);c.stroke();c.globalAlpha=1}
}
function drawGoalMark(c){   // pencil circle and cross where a tap sent you
  if(!me.path)return;const gx=me.goal[0],gy=me.goal[1],r=Math.max(.7,7/S)*(1+.08*Math.sin(simT*6)),q=r*.45;
  J=mulberry32(11+BOIL);c.beginPath();const ring=[];for(let i=0;i<8;i++){const a=i/8*TAU;ring.push([gx+Math.cos(a)*r,gy+Math.sin(a)*r])}spoly(c,ring,r*.1);sl(c,gx-q,gy-q,gx+q,gy+q,r*.1);sl(c,gx-q,gy+q,gx+q,gy-q,r*.1);
  pencil(c,'#b8432f',.85,1.6);c.stroke();c.globalAlpha=1}
