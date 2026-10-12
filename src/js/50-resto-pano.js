/* ---------------- inside a restaurant, in 360°: you sit at a table; look round at the room. The tier sets the room. ----------------
   +X the back (the kitchen, or the bar), -X the front (cash counter and the street), -Y the wall with the wash basin, +Y the menu wall.
   Street "hotel" (tier 1): open shopfront with big aluminium pots, the cashier at his box, benches, tiled dado, fans and tube lights,
   a cook at the burners in the back; the waiter ("mama") carries plates and the water jug. Better places: glass front and tablecloths (2),
   carpet, chandeliers and a window over the city (3). */
const RS={x0:-5,x1:6,y0:-3.6,y1:3.6,h:3.2,st:null,tables:[],fans:[],waiter:null};
/* a wall from p0 to p1 (floor points), cut into strips so the part in view draws even when the rest is behind you */
function rsWall(c,p0,p1,z0,z1,col,ink=INK,n=12){for(let i=0;i<n;i++){const a=i/n,b=(i+1)/n,A=[p0[0]+(p1[0]-p0[0])*a,p0[1]+(p1[1]-p0[1])*a],B=[p0[0]+(p1[0]-p0[0])*b,p0[1]+(p1[1]-p0[1])*b];
  fill3(c,[[A[0],A[1],z0],[B[0],B[1],z0],[B[0],B[1],z1],[A[0],A[1],z1]],col,null,0,1,.6)}
  if(ink){ink3(c,[[p0[0],p0[1],z0],[p1[0],p1[1],z0]],ink,.55,1,.5);ink3(c,[[p0[0],p0[1],z1],[p1[0],p1[1],z1]],ink,.55,1,.5)}}
/* a horizontal surface in tiles (floor or ceiling); lines between them if asked */
function rsPlane(c,z,col,line,step=1){const{x0,x1,y0,y1}=RS;for(let x=x0;x<x1;x+=step)for(let y=y0;y<y1;y+=step)fill3(c,[[x,y,z],[x+step,y,z],[x+step,y+step,z],[x,y+step,z]],col,null,0,1,.5);
  if(line){c.beginPath();for(let x=x0;x<=x1;x+=step)line3(c,[[x,y0,z],[x,y1,z]],.4);for(let y=y0;y<=y1;y+=step)line3(c,[[x0,y,z],[x1,y,z]],.4);c.strokeStyle=line;c.globalAlpha=.35;c.lineWidth=.8;c.stroke();c.globalAlpha=1}}
function rsBox(c,x0,x1,y0,y1,z0,z1,top,side,ink=INK){   // a box seen from wherever you are: its top (if below your eyes) and the faces turned to you
  const F=(pts,col)=>fill3(c,pts,col,ink,.6,1,.4);
  if(x0>0)F([[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]],side);if(x1<0)F([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],side);
  if(y0>0)F([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],side);if(y1<0)F([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],side);
  if(z1<PAN.eye)F([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],top)}
function rsPot(c,X,Y,Z,r,col){const q=pj(X,Y,Z);if(!seen(q[2]))return;const s=PAN.F/q[3],R=r*s,h=r*1.3*s;c.globalAlpha=1;c.fillStyle=col;c.fillRect(q[0]-R,q[1]-h,2*R,h);
  c.fillStyle=shade(col,1.12);c.beginPath();c.ellipse(q[0],q[1]-h,R,R*.32,0,0,TAU);c.fill();c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=1;c.strokeRect(q[0]-R,q[1]-h,2*R,h);c.beginPath();c.ellipse(q[0],q[1]-h,R,R*.32,0,0,TAU);c.stroke();c.globalAlpha=1}
function rsSteam(c,X,Y,Z){const q=pj(X,Y,Z);if(!seen(q[2]))return;const s=PAN.F/q[3];c.beginPath();for(let i=0;i<3;i++){const ph=PAN.t*1.6+i*2.1;c.moveTo(q[0]+(i-1)*.12*s,q[1]);for(let k=1;k<=8;k++){const f=k/8;c.lineTo(q[0]+(i-1)*.12*s+Math.sin(ph+f*4)*.08*s*f,q[1]-f*.7*s)}}c.strokeStyle=INK2;c.globalAlpha=.3;c.lineWidth=1;c.stroke();c.globalAlpha=1}
function rsFan(c,X,Y){const q=pj(X,Y,RS.h-.35);if(!seen(q[2]))return;const a0=PAN.t*7;c.beginPath();for(let k=0;k<3;k++){const a=a0+k*TAU/3,e=pj(X+Math.cos(a)*.7,Y+Math.sin(a)*.7,RS.h-.38);c.moveTo(q[0],q[1]);c.lineTo(e[0],e[1])}
  c.strokeStyle=wash('#6b655c',.9);c.lineWidth=Math.max(2,.12*PAN.F/q[3]);c.stroke();const t=pj(X,Y,RS.h);c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(t[0],t[1]);c.strokeStyle=INK;c.lineWidth=1;c.stroke()}
function rsTube(c,y,x){const a=pj(x-.6,y,2.6),b=pj(x+.6,y,2.6);if(!seen(a[2])||!seen(b[2]))return;c.strokeStyle='#fffbe8';c.lineWidth=Math.max(2,.07*PAN.F/a[3]);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.strokeStyle=INK;c.lineWidth=.7;c.globalAlpha=.5;c.stroke();c.globalAlpha=1}
function rsRickshaw(c,X,Y,col){const g=pj(X,Y,0);if(!seen(g[2]))return;const s=PAN.F/g[3],x=g[0],y=g[1];c.lineWidth=Math.max(.8,s*.05);c.strokeStyle=INK;c.beginPath();c.arc(x-.6*s,y-.34*s,.34*s,0,TAU);c.arc(x+.75*s,y-.3*s,.3*s,0,TAU);c.globalAlpha=.8;c.stroke();c.globalAlpha=1;
  c.fillStyle=wash('#b8432f',.75);c.fillRect(x-.85*s,y-.95*s,.8*s,.35*s);c.fillStyle=wash(col,.8);c.beginPath();c.moveTo(x-.95*s,y-.9*s);c.quadraticCurveTo(x-1.05*s,y-2.05*s,x-.1*s,y-1.95*s);c.lineTo(x-.25*s,y-.95*s);c.closePath();c.fill()}
/* your own plate on the table in front of you, while you eat */
function rsPlate(c,m){if(!m)return;const X=.75,Y=0,Z=.76,q=pj(X,Y,Z);if(!seen(q[2]))return;const s=PAN.F/q[3];
  if(m.cup){c.fillStyle='#f4f1ea';c.fillRect(q[0]-.05*s,q[1]-.09*s,.1*s,.09*s);c.fillStyle=m.cup;c.beginPath();c.ellipse(q[0],q[1]-.09*s,.05*s,.015*s,0,0,TAU);c.fill();rsSteam(c,X,Y,Z+.1);return}
  const[pl,fd]=m.art||['#f6f2e6','#8a5a2a'];c.fillStyle=RS.st.tier===1?'#cfd3d6':'#f6f2e6';c.beginPath();c.ellipse(q[0],q[1],.17*s,.05*s,0,0,TAU);c.fill();c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=1;c.stroke();c.globalAlpha=1;   // a steel plate in a hotel, china elsewhere
  c.fillStyle=pl;c.beginPath();c.ellipse(q[0]-.04*s,q[1]-.02*s,.08*s,.03*s,0,0,TAU);c.fill();c.fillStyle=fd;c.beginPath();c.ellipse(q[0]+.07*s,q[1]-.015*s,.055*s,.022*s,0,0,TAU);c.fill();rsSteam(c,X,Y,Z+.05)}

function rsInit(place){const R=place.R,T=R.tier,S0=roomStyle(R);RS.st=S0;PAN.eye=1.2;PAN.pitch=.02;PAN.yaw=0;
  RS.tables=[];const rows=T===1?[[-2.6,0],[0,0],[2.6,0]]:[[-2.2,-1.8],[-2.2,1.8],[1.4,-1.8],[1.4,1.8],[3.8,0]];
  const tw=T===1?1.0:.9,tl=T===1?2.2:1.0;
  for(const[X,Y]of rows)for(const yy of T===1?[-2.2,2.2]:[0]){const ty=T===1?yy:Y;if(Math.hypot(X,ty)<.6)continue;RS.tables.push({X,Y:ty,w:tw,l:tl})}
  RS.tables.push({X:.75,Y:0,w:.8,l:T===1?1.6:.9,mine:true});   // yours, right in front of you
  /* diners, staff */
  const seat=(X,Y,role,fem)=>{const a=stMk('trav',X,Y,{seat:true});a.p=makePerson(role,fem);a.p.pose='sit';a.p.act=Math.random()<.7?'eat':null;a.p.fixed=true;a.p.fc=Y>0?-1:1;a.p.look.bag=false;return a};
  for(const t of RS.tables){if(t.mine)continue;const n=T===1?(Math.random()<.85?2+(Math.random()*3|0):0):(Math.random()<.6?2:0);
    for(let k=0;k<n;k++){const side=k%2?1:-1,dx=(k>>1)*.8-.4;seat(t.X+dx,t.Y+side*(t.w/2+.35),mpick(T===1?['labour','office','courier','student','peon']:['office','banker','customer','student']),T>1&&Math.random()<.4)}}
  const staff=(role,X,Y,c1,c2,act)=>{const a=stMk('trav',X,Y,{staff:true});a.p=makePerson(role,false);Object.assign(a.p.look,{dress:T===1&&role==='hawker'?'lungi':'pants',c1,c2,cap:T===1&&role==='hawker',tie:T===3});a.p.act=act;a.p.pose='stand';a.p.fixed=true;return a};
  if(T===1){staff('hawker',5.3,-1.2,'#f1eee6','#3f5f8a','chop');staff('banker',-4.2,-2.6,'#e8e2cf','#3a3a3f',null).p.pose='sit'}   // the cook at the back; the cashier (manager) at his box by the door
  else staff('banker',-4.3,-2.4,T===3?'#f7f2e6':'#e8e2cf','#1f1b18',null);
  const w=staff('helper',2.5,1.2,T===3?'#1f1b18':'#f7f2e6',T===3?'#1f1b18':'#2f2d2a','serve');w.p.act='carry';RS.waiter=w;w.next=a=>{const q=Math.random()<.4?[4.8,mr(-1,1)]:[mr(-3,4),mr(-2.6,2.6)];goTo(a,q[0],q[1]);a.p.act='serve'};w.wait=1;
  if(T===1)for(let i=0;i<2;i++){const a=stMk('trav',-6.5,mr(-3,3),{street:true});a.next=b=>goTo(b,-6.5,mr(-4,4));a.wait=mr(0,3)}   // people passing on the footpath
  RS.cars=[{y:-12,v:4,col:mpick(HOOD)},{y:4,v:3.4,col:mpick(HOOD)}]}
function rsUpdate(dt){panoWalk(dt);for(const r of RS.cars){r.y+=r.v*dt;if(r.y>14){r.y=-14;r.col=mpick(HOOD)}}}
function rsDraw(c){const S0=RS.st,T=S0.tier,{x0,x1,y0,y1,h}=RS,night=lightsOn();
  c.fillStyle=wash(S0.wall,.6);c.fillRect(0,0,W,H);
  /* the street seen through the front (tier 1 open shopfront, tier 2 glass), or the city through the window (tier 3) */
  if(T<3){fill3(c,[[x0-12,-20,0],[x0,-20,0],[x0,20,0],[x0-12,20,0]],wash('#8f8a80',.7),null,0,1,3);fill3(c,[[x0-14,-20,0],[x0-14,20,0],[x0-14,20,9],[x0-14,-20,9]],wash(night>.5?'#3a4660':'#d8d0c0',.75),INK,.4,1,3);
    for(const r of RS.cars)rsRickshaw(c,x0-5,r.y,r.col)}
  /* floor, ceiling, walls */
  rsPlane(c,0,T===3?wash(S0.floor,.75):wash(S0.floor,.6),T===1?'#8a7a55':null,T===3?1.2:.8);
  rsPlane(c,h,wash(T===3?'#e8dcc4':'#efe9dc',.9),null,1.4);
  const wall=wash(S0.wall,.6),dado=wash(S0.dado,.55);
  for(const[p0,p1]of[[[x1,y0],[x1,y1]],[[x0,y0],[x1,y0]],[[x1,y1],[x0,y1]]]){rsWall(c,p0,p1,1.4,h,wall);rsWall(c,p0,p1,0,1.4,dado)}
  if(T===3)rsWall(c,[x0,y1],[x0,y0],0,h,wall);
  else{rsWall(c,[x0,y1],[x0,2.2],0,h,wall);rsWall(c,[x0,-2.2],[x0,y0],0,h,wall);rsWall(c,[x0,2.2],[x0,-2.2],2.6,h,wall);   // the open front, with the rolled-up shutter
    if(T===1){c.beginPath();for(let z=2.65;z<3.1;z+=.08)line3(c,[[x0,-2.2,z],[x0,2.2,z]],.5);c.strokeStyle=INK;c.globalAlpha=.4;c.lineWidth=.8;c.stroke();c.globalAlpha=1}
    else fill3(c,[[x0,-2.2,0],[x0,2.2,0],[x0,2.2,2.6],[x0,-2.2,2.6]],'rgba(160,200,215,.18)',INK,.4,1,.5)}   // glass front
  if(T===1){c.beginPath();for(let x=x0;x<=x1;x+=.3){line3(c,[[x,y0,0],[x,y0,1.4]],.5);line3(c,[[x,y1,0],[x,y1,1.4]],.5)}for(let z=.3;z<1.4;z+=.3){line3(c,[[x0,y0,z],[x1,y0,z]],.5);line3(c,[[x0,y1,z],[x1,y1,z]],.5)}c.strokeStyle='#4a6d6a';c.globalAlpha=.3;c.lineWidth=.7;c.stroke();c.globalAlpha=1}   // tiles
  /* the back: kitchen hatch with burners and steam (hotel), a counter and bar (better places) */
  if(T===1){fill3(c,[[x1-.01,-2.2,.9],[x1-.01,.4,.9],[x1-.01,.4,2.3],[x1-.01,-2.2,2.3]],'rgba(40,36,32,.7)',INK,.6,1,.5);rsBox(c,4.6,x1-.05,-2.2,.4,0,.9,wash('#8a8478',.8),wash('#6b655c',.8));
    for(const y of[-1.6,-.6]){rsPot(c,5.4,y,.9,.3,'#9aa0a6');rsSteam(c,5.4,y,1.3)}label3(c,x1-.02,-.9,2.5,L2('রান্নাঘর','Kitchen'),.22,'#b8432f')}
  else{rsBox(c,4.9,5.6,-2.4,2.4,0,1.05,wash(T===3?'#5a3a28':'#8a5a3a',.8),wash(T===3?'#4a2a1a':'#6b4a32',.8));if(T===2){rsPot(c,5.2,-1.2,1.05,.45,'#9aa0a6');label3(c,5.2,-1.2,1.95,L2('কাচ্চি','Kacchi'),.3,'#b8432f')}}
  /* the front: pots on the display counter and the cash box (hotel), or the cash counter */
  if(T===1){rsBox(c,x0+.2,x0+1.1,-2.1,2.1,0,.95,wash('#8a5a3a',.8),wash('#6b4a32',.85));const cols=['#c9742a','#8a5a2a','#e3b052','#4a2f22','#c9d6d9'];for(let k=0;k<5;k++)rsPot(c,x0+.65,-1.7+k*.85,.95,.28,'#b0b6bf');
    for(let k=0;k<5;k++){const q=pj(x0+.65,-1.7+k*.85,1.32);if(seen(q[2])){const s=PAN.F/q[3];c.fillStyle=cols[k];c.beginPath();c.ellipse(q[0],q[1],.26*s,.08*s,0,0,TAU);c.fill()}}
    rsBox(c,x0+.3,x0+1.4,-3.4,-2.5,0,1,wash('#6b4a32',.85),wash('#5a3a28',.85));label3(c,x0+.85,-2.95,1.25,L2('ক্যাশ','Cash'),.28,'#b8432f')}
  else rsBox(c,x0+.3,x0+1.5,-3.4,-1.8,0,1.05,wash(T===3?'#5a3a28':'#c9b48a',.85),wash(T===3?'#4a2a1a':'#8a6a4a',.85));
  /* walls: sign, menu, clock, wash basin with a mirror */
  const sign=S0.sign;fill3(c,[[x1-.01,1.1,2.35],[x1-.01,3.3,2.35],[x1-.01,3.3,2.95],[x1-.01,1.1,2.95]],T===1?sign[0]:wash(sign[0],.9),INK,.7,1,.4);label3(c,x1-.02,2.2,2.65,L2(PAN.place.name[0],PAN.place.name[1]),.24,sign[1]);
  fill3(c,[[-2.6,y1-.01,1.6],[1.6,y1-.01,1.6],[1.6,y1-.01,2.8],[-2.6,y1-.01,2.8]],T===3?'#f1e8d2':wash('#2f3a33',.9),T===3?'#c9a24a':INK,.8,1.4,.4);
  const menu=PAN.place.R.menu;label3(c,-.5,y1-.02,2.62,L2('মেন্যু','Menu'),.26,T===3?'#8a1f2e':'#f1eee6');menu.slice(0,5).forEach((m,i)=>label3(c,-.5,y1-.02,2.38-i*.17,`${LANG==='en'?m.en:m.bn}  ৳${LANG==='en'?m.price:bnNum(m.price)}`,.14,T===3?'#3a2a1a':'#e9e4d6','400'));
  {const q=pj(3,y1-.01,2.5);if(seen(q[2])){const r=.22*PAN.F/q[3];c.fillStyle='#f7f2e6';c.beginPath();c.arc(q[0],q[1],r,0,TAU);c.fill();c.strokeStyle=INK;c.lineWidth=1.2;c.stroke();const hh=(HOUR%12)/12*TAU,mm=(HOUR%1)*TAU;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]+Math.sin(hh)*r*.55,q[1]-Math.cos(hh)*r*.55);c.moveTo(q[0],q[1]);c.lineTo(q[0]+Math.sin(mm)*r*.8,q[1]-Math.cos(mm)*r*.8);c.stroke()}}   // the wall clock shows the real hour
  if(T===1){rsBox(c,2.4,3.1,y0+.01,y0+.5,.75,.9,wash('#e8ece8',.9),wash('#c9cfcf',.9));fill3(c,[[2.45,y0+.01,1.2],[3.05,y0+.01,1.2],[3.05,y0+.01,1.9],[2.45,y0+.01,1.9]],'rgba(170,200,210,.55)',INK,.6,1,.3);label3(c,2.75,y0+.02,2.1,L2('হাত ধোয়ার জায়গা','Wash your hands'),.16,INK)}
  else for(const X of[-2.5,2.5]){fill3(c,[[X-.5,y0+.01,1.5],[X+.5,y0+.01,1.5],[X+.5,y0+.01,2.2],[X-.5,y0+.01,2.2]],wash(T===3?'#8a1f2e':'#7fa36b',.7),T===3?'#c9a24a':INK,.8,2,.4)}   // pictures in frames
  if(T===3){fill3(c,[[x0+.01,-2,1],[x0+.01,2,1],[x0+.01,2,2.7],[x0+.01,-2,2.7]],wash(night>.5?'#2a3348':'#bcd0de',.8),INK,.7,1.5,.4);c.beginPath();for(let k=0;k<7;k++){const yy=-1.8+k*.6,hh2=1+(k*37%5)*.25;line3(c,[[x0+.02,yy,1],[x0+.02,yy,1+hh2*.5]],.3)}c.strokeStyle=INK;c.globalAlpha=.35;c.lineWidth=3;c.stroke();c.globalAlpha=1}   // the city through the window
  /* ceiling: fans (hotel, restaurant) or chandeliers; tube lights on the walls */
  if(T<3)for(const X of[-2.5,1,4])rsFan(c,X,0);else for(const X of[-2,2]){const q=pj(X,0,h-.5);if(seen(q[2])){const r=.35*PAN.F/q[3];c.fillStyle='rgba(255,215,140,.85)';c.beginPath();c.arc(q[0],q[1],r*.5,0,TAU);c.fill();c.strokeStyle='#c9a24a';c.lineWidth=1.5;c.beginPath();c.arc(q[0],q[1],r,0,Math.PI);c.stroke()}}
  if(T<3)for(const x of[-2,2.5]){rsTube(c,y0+.02,x);rsTube(c,y1-.02,x)}
  /* tables and the people at them, far to near */
  const items=[];for(const t of RS.tables){const d=Math.hypot(t.X,t.Y);items.push({d:d+.01,f:()=>{rsBox(c,t.X-t.w/2,t.X+t.w/2,t.Y-t.l/2,t.Y+t.l/2,.72,.76,wash(T===1?'#c9b48a':S0.cloth||'#f6f2e6',T===1?.85:.9),wash(T===1?'#8a6a4a':'#e8e2d4',.85));
    if(T===1)for(const s of[-1,1])rsBox(c,t.X-t.w/2,t.X+t.w/2,t.Y+s*(t.l/2+.25)-.12,t.Y+s*(t.l/2+.25)+.12,.42,.46,wash('#8a6a4a',.85),wash('#6b4a32',.85));
    if(!t.mine){const q=pj(t.X,t.Y,.77);if(seen(q[2])){const s=PAN.F/q[3];c.fillStyle='#b0b6bf';c.fillRect(q[0]-.05*s,q[1]-.18*s,.1*s,.18*s)}}   // the steel water jug
    else rsPlate(c,eating.dish)}})}
  for(const a of PAN.crowd)items.push({d:Math.hypot(a.X,a.Y),f:()=>figAt(c,a.p,a.X,a.Y)});
  items.sort((a,b)=>b.d-a.d);for(const it of items)it.f();
  if(night>.05&&T<3){c.globalCompositeOperation='multiply';c.fillStyle=`rgba(255,240,210,${.25*night})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}}
const RESTO_SCENE={key:'resto',indoor:true,places:()=>[],init:rsInit,update:rsUpdate,draw:rsDraw,acts:[],act:()=>{},
  marks:()=>RS.st&&RS.st.tier===1?[[0,L2('রান্নাঘর','Kitchen')],[180,L2('ক্যাশ · রাস্তা','Cash · street')],[-90,L2('হাত ধোয়া','Wash basin')],[90,L2('মেন্যু','Menu')]]:[[0,L2('কাউন্টার','Counter')],[180,L2(RS.st&&RS.st.tier===3?'জানালা':'দরজা',RS.st&&RS.st.tier===3?'Window':'Door')],[90,L2('মেন্যু','Menu')]]};
