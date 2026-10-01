/* ---------------- pencil primitives ---------------- */
function pencil(c,col,a,wpx){c.strokeStyle=col;c.globalAlpha=a;c.lineWidth=wpx/S;c.lineCap='round';c.lineJoin='round'}
function sl(c,x1,y1,x2,y2,j){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1e-6,ux=dx/L,uy=dy/L,m=Math.min(L*.08,j*2.2);
  const o1=J()*m,o2=J()*m;
  const ax=x1-ux*o1+(J()-.5)*j,ay=y1-uy*o1+(J()-.5)*j,bx=x2+ux*o2+(J()-.5)*j,by=y2+uy*o2+(J()-.5)*j;
  const b=(J()-.5)*Math.min(L*.03,j*3);
  c.moveTo(ax,ay);c.quadraticCurveTo((ax+bx)/2-uy*b,(ay+by)/2+ux*b,bx,by);
}
function spoly(c,pts,j){for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];sl(c,a[0],a[1],b[0],b[1],j)}}
function ppath(c,pts){c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath()}
function fillPoly(c,pts){c.beginPath();ppath(c,pts);c.fill()}
function hatch(c,pts,ang,gap,j){
  const cs=Math.cos(ang),sn=Math.sin(ang),n=pts.length;let mn=1e9,mx=-1e9;
  for(const p of pts){const d=-sn*p[0]+cs*p[1];if(d<mn)mn=d;if(d>mx)mx=d}
  if((mx-mn)/gap>400)gap=(mx-mn)/400;
  for(let d=mn+gap*J();d<mx;d+=gap*(.75+.5*J())){
    let t0=1e9,t1=-1e9;
    for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];const da=-sn*a[0]+cs*a[1]-d,db=-sn*b[0]+cs*b[1]-d;
      if((da<=0&&db>0)||(da>0&&db<=0)){const u=da/(da-db);const x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u,t=cs*x+sn*y;if(t<t0)t0=t;if(t>t1)t1=t}}
    if(t1<=t0)continue;
    const L=t1-t0,s0=t0+L*.05*J(),s1=t1-L*.05*J(),bx=-sn*d,by=cs*d;
    c.moveTo(bx+cs*s0+(J()-.5)*j,by+sn*s0+(J()-.5)*j);c.lineTo(bx+cs*s1+(J()-.5)*j,by+sn*s1+(J()-.5)*j);
  }
}
function circ(c,x,y,r){c.moveTo(x+r,y);c.arc(x,y,r,0,TAU)}
function cyl(c,x,y,r,z0,z1,col,out=true){ // vertical cylinder
  const b=[x+KX*z0,y-KZ*z0],t=[x+KX*z1,y-KZ*z1],L=Math.hypot(KX,KZ),nx=KZ/L,ny=KX/L;
  c.fillStyle=wash(col,.7);c.beginPath();circ(c,b[0],b[1],r);c.fill();
  c.beginPath();c.moveTo(b[0]+nx*r,b[1]+ny*r);c.lineTo(b[0]-nx*r,b[1]-ny*r);c.lineTo(t[0]-nx*r,t[1]-ny*r);c.lineTo(t[0]+nx*r,t[1]+ny*r);c.closePath();c.fill();
  c.fillStyle=wash(col,.45);c.beginPath();circ(c,t[0],t[1],r);c.fill();
  if(out){c.beginPath();circ(c,t[0],t[1],r);c.moveTo(b[0]+nx*r,b[1]+ny*r);c.lineTo(t[0]+nx*r,t[1]+ny*r);c.moveTo(b[0]-nx*r,b[1]-ny*r);c.lineTo(t[0]-nx*r,t[1]-ny*r);c.stroke()}
}
// oriented box; f=(fx,fy) forward; returns point fn pt(a along, b left, z)
function obox(c,cx,cy,fx,fy,len,wid,z0,z1,cTop,cSide,cFront,out=true){
  const lx=fy,ly=-fx,hl=len/2,hw=wid/2;
  const pt=(a,b,z)=>[cx+fx*a+lx*b+KX*z,cy+fy*a+ly*b-KZ*z];
  const F=[[fx,fy,hl,-hw,hl,hw,cFront],[-fx,-fy,-hl,hw,-hl,-hw,cSide],[lx,ly,hl,hw,-hl,hw,cSide],[-lx,-ly,-hl,-hw,hl,-hw,cSide]];
  for(const f of F){if(f[0]*VIS[0]+f[1]*VIS[1]<=0)continue;
    const q=[pt(f[2],f[3],z0),pt(f[4],f[5],z0),pt(f[4],f[5],z1),pt(f[2],f[3],z1)];
    c.fillStyle=f[6];fillPoly(c,q);if(out){c.beginPath();ppath(c,q);c.stroke()}}
  const top=[pt(hl,hw,z1),pt(hl,-hw,z1),pt(-hl,-hw,z1),pt(-hl,hw,z1)];
  c.fillStyle=cTop;fillPoly(c,top);if(out){c.beginPath();ppath(c,top);c.stroke()}
  return pt;
}
function screenText(c,X,Y,str,px,col,font=F_BN,align='center',weight=''){
  if(!VEC||px<6)return;
  c.save();c.setTransform(DPR,0,0,DPR,0,0);const s=toScreen(X,Y);
  c.font=`${weight} ${px.toFixed(1)}px ${font}`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.globalAlpha=1;c.fillText(str,s[0],s[1]);c.restore();
}

