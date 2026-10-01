/* ---------- foot overbridges ---------- */
const bridges=[];
function genBridges(){
  const spots=[[0,150],[2,128],[3,172],[4,150],[2,330],[4,300],[1,190]];
  for(const[a,r]of spots){const A=ARMS[a];if(!A)continue;let s=0;for(let k=0;k<A.pts.length;k++)if(Math.hypot(A.pts[k][0],A.pts[k][1])>=r){s=A.P.cum[k];break}
    const q=polyAt(A.P,s),x=q.x,y=q.y,tx=q.tx,ty=q.ty,lx=ty,ly=-tx,half=A.hw+A.sw-.6;
    const b={x,y,tx,ty,lx,ly,half,ad:[rpick(ADS),rpick(ADS)],adCol:[rpick(SIGNCOL),rpick(SIGNCOL)],walkers:[]};bridges.push(b);
    for(const P of walks){if(P.road!==A.id)continue;for(let i=P.stalls.length-1;i>=0;i--){const st=P.stalls[i];if(Math.hypot(st.x-x,st.y-y)<half+9){st.dead=true;P.stalls.splice(i,1)}}}
    for(let i=0;i<7;i++){const p=makePerson(mpick(['office','student','customer','labour']));p.fixed=true;p.bridge=b;p.bt=Math.random();p.bdir=Math.random()<.5?1:-1;p.roleText='Crossing the foot overbridge';b.walkers.push(p)}}
  for(let i=stalls.length-1;i>=0;i--)if(stalls[i].dead){const st=stalls[i];const j=fixedPeople.indexOf(st.hawker);if(j>=0)fixedPeople.splice(j,1);stalls.splice(i,1)}
  for(const b of bridges)specials.push({kind:'bridge',b,depth:()=>D(b.x,b.y)+b.half*.2,bb:()=>{const e=b.half+10;const p=P3([b.x,b.y],6);return[Math.min(b.x,p[0])-e,Math.min(b.y,p[1])-e,Math.max(b.x,p[0])+e,Math.max(b.y,p[1])+e]},draw:drawBridge});
}
const BZ=5.6;
function bridgePath(b,t){// t in 0..1: stairs up (side -1) -> deck -> stairs down (side +1)
  const st=9,L=[st,2*b.half,st],tot=L[0]+L[1]+L[2];let d=t*tot;
  const side=sg=>[b.x+b.lx*sg*b.half,b.y+b.ly*sg*b.half];
  if(d<L[0]){const k=d/L[0],p=side(-1);return[p[0]-b.tx*(st*(1-k)),p[1]-b.ty*(st*(1-k)),BZ*k]}
  d-=L[0];if(d<L[1]){const k=d/L[1];return[b.x+b.lx*(-b.half+2*b.half*k),b.y+b.ly*(-b.half+2*b.half*k),BZ]}
  d-=L[1];const k=d/L[2],p=side(1);return[p[0]+b.tx*(st*k),p[1]+b.ty*(st*k),BZ*(1-k)]}
function updBridges(dt){for(const b of bridges)for(const p of b.walkers){p.bt+=dt*p.bdir*.025;if(p.bt>1)p.bt-=1;if(p.bt<0)p.bt+=1;const q=bridgePath(b,p.bt),q2=bridgePath(b,clamp(p.bt+.01*p.bdir,0,1));p.x=q[0];p.y=q[1];p.bz=q[2];p.dx=p.x;p.dy=p.y;p.pose='walk';p.ph+=dt*6;const sx=sdir(q2[0]-q[0],q2[1]-q[1]);if(Math.abs(sx)>1e-5)p.fc=sx>0?1:-1}}
function drawBridge(c,lod){const b=this.b,W2=1.3;pencil(c,INK,.85,1);const L=(sg,u,dz)=>[b.x+b.lx*sg*b.half+b.tx*u,b.y+b.ly*sg*b.half+b.ty*u];
  // stairs on both sides
  for(const sg of[-1,1]){const dir=sg<0?-1:1;const foot=L(sg,dir*9),top=L(sg,0);const q=[P3([foot[0]-b.lx*W2,foot[1]-b.ly*W2],0),P3([foot[0]+b.lx*W2,foot[1]+b.ly*W2],0),P3([top[0]+b.lx*W2,top[1]+b.ly*W2],BZ),P3([top[0]-b.lx*W2,top[1]-b.ly*W2],BZ)];
    c.globalAlpha=1;c.fillStyle=wash('#b9b3a6',.85);fillPoly(c,q);c.beginPath();ppath(c,q);c.stroke();if(lod>0){c.beginPath();for(let k=1;k<12;k++){const t=k/12,a=[foot[0]+(top[0]-foot[0])*t,foot[1]+(top[1]-foot[1])*t],p0=P3([a[0]-b.lx*W2,a[1]-b.ly*W2],BZ*t),p1=P3([a[0]+b.lx*W2,a[1]+b.ly*W2],BZ*t);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}pencil(c,INK,.35,.7);c.stroke()}
    pencil(c,INK,.85,1);c.beginPath();for(const o of[-W2,W2]){const p0=P3([top[0]+b.tx*o,top[1]+b.ty*o],0),p1=P3([top[0]+b.tx*o,top[1]+b.ty*o],BZ);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}c.stroke()}
  // columns in the median
  c.beginPath();for(const o of[-W2,W2]){const p0=P3([b.x+b.tx*o,b.y+b.ty*o],0),p1=P3([b.x+b.tx*o,b.y+b.ty*o],BZ);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}pencil(c,INK,.85,1.6);c.stroke();
  // deck
  const A=L(-1,0),B=L(1,0),dk=[P3([A[0]-b.tx*W2,A[1]-b.ty*W2],BZ),P3([B[0]-b.tx*W2,B[1]-b.ty*W2],BZ),P3([B[0]+b.tx*W2,B[1]+b.ty*W2],BZ),P3([A[0]+b.tx*W2,A[1]+b.ty*W2],BZ)];
  c.fillStyle=wash('#c9c3b5',.9);fillPoly(c,dk);pencil(c,INK,.85,1);c.beginPath();ppath(c,dk);c.stroke();
  for(const p of b.walkers){const q=P3([p.x,p.y],p.bz);drawPerson(c,p,q[0],q[1],lod>1?2:1)}
  // ad panels on both deck faces
  for(const k of[0,1]){const o=k?W2:-W2,sgn=k?1:-1;const nrm=[b.tx*sgn,b.ty*sgn];if(nrm[0]*VIS[0]+nrm[1]*VIS[1]<=0&&lod<2)continue;
    const q=[P3([A[0]+b.tx*o,A[1]+b.ty*o],BZ-.1),P3([B[0]+b.tx*o,B[1]+b.ty*o],BZ-.1),P3([B[0]+b.tx*o,B[1]+b.ty*o],BZ+1.4),P3([A[0]+b.tx*o,A[1]+b.ty*o],BZ+1.4)];
    c.fillStyle=wash(b.adCol[k],.8);c.globalAlpha=nrm[0]*VIS[0]+nrm[1]*VIS[1]>0?1:.5;fillPoly(c,q);c.globalAlpha=1;c.beginPath();ppath(c,q);pencil(c,INK,.7,.9);c.stroke();
    if(lod>1&&nrm[0]*VIS[0]+nrm[1]*VIS[1]>0){const m=P3([b.x+b.tx*o,b.y+b.ty*o],BZ+.65);screenText(c,m[0],m[1],LANG==='en'?b.ad[k][1]:b.ad[k][0],.7*S,'#fbf8ef',LANG==='en'?F_EN:F_BN,'center','600')}}
}
