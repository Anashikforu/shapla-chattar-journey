/* ---------------- render ---------------- */
const items=[];
let BMODE='full';
function drawStub(c,b,h){for(const p of b.parts){if(p.z0>0)continue;const q=p.q,cen=qCenter(q);c.globalAlpha=1;
  for(let i=0;i<4;i++){const a=q[i],e=q[(i+1)%4];let nx=e[1]-a[1],ny=-(e[0]-a[0]);if(nx*(a[0]+e[0]-2*cen[0])+ny*(a[1]+e[1]-2*cen[1])<0){nx=-nx;ny=-ny}if(nx*VIS[0]+ny*VIS[1]<=0)continue;
    const f=[P3(a,0),P3(e,0),P3(e,h),P3(a,h)];c.fillStyle=wash(shade(p.col,.78),.75);fillPoly(c,f);c.beginPath();ppath(c,f);pencil(c,INK,.7,1);c.stroke()}
  const r=q.map(pt=>P3(pt,h));c.fillStyle=wash(p.col,.45);fillPoly(c,r);c.beginPath();hatch(c,r,.8,1.2,.05);pencil(c,shade(p.col,.6),.3,.7);c.stroke();c.beginPath();ppath(c,r);pencil(c,INK,.85,1.2);c.stroke()}}
function drawFoot(c,b){for(const p of b.parts){if(p.z0>0)continue;c.globalAlpha=1;c.fillStyle=b.landmark?wash('#b8432f',.35):wash(p.col,.55);fillPoly(c,p.q);c.beginPath();ppath(c,p.q);pencil(c,INK,.8,1.1);c.stroke()}}
function inQuad(q,x,y){let s0=0;for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],cr=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);if(cr!==0){const sg=cr>0?1:-1;if(s0&&sg!==s0)return false;s0=sg}}return true}
function scrBox(bb){const a=toScreen(bb[0],bb[1]),b=toScreen(bb[2],bb[1]),c=toScreen(bb[0],bb[3]),d=toScreen(bb[2],bb[3]);return[Math.min(a[0],b[0],c[0],d[0]),Math.min(a[1],b[1],c[1],d[1]),Math.max(a[0],b[0],c[0],d[0]),Math.max(a[1],b[1],c[1],d[1])]}
function render(){
  SPR.frame++;const L=lightsOn(),z=cam.zoom;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#efe8d8';ctx.fillRect(0,0,W,H);
  applyCam(ctx);S=z;VEC=true;BOIL=REDUCED?0:Math.floor(simT*5)%3;{const cs=[toWorld(0,0),toWorld(W,0),toWorld(0,H),toWorld(W,H)];VX0=Math.min(...cs.map(q=>q[0]));VX1=Math.max(...cs.map(q=>q[0]));VY0=Math.min(...cs.map(q=>q[1]));VY1=Math.max(...cs.map(q=>q[1]))}
  if(z<6&&groundSpr){ctx.imageSmoothingEnabled=true;ctx.drawImage(groundSpr,-E-80,-E-80,2*E+160,2*E+160)}else paintGround(ctx,z,true);
  if(flood>.03){ctx.lineCap='round';ctx.globalAlpha=1;ctx.strokeStyle=`rgba(80,120,160,${.42*flood})`;for(const R of roads){ctx.lineWidth=2*(R.hw+R.sw*flood*.6);ctx.stroke(R.path)}ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();circ(ctx,0,0,ROUT);ctx.fill();
    if(z>4){ctx.beginPath();const tt=simT;for(const v of vehicles){if(v.parked||!onScreen(v.dx,v.dy)||v.spd<.3)continue;const r=(tt*1.5+v.id*.37)%1;ctx.moveTo(v.dx-v.hx*v.len*.5+r*2.2,v.dy-v.hy*v.len*.5);ctx.ellipse(v.dx-v.hx*v.len*.5,v.dy-v.hy*v.len*.5,.4+r*2.2,.2+r*1.1,Math.atan2(v.hy,v.hx),0,TAU)}ctx.strokeStyle='rgba(220,235,245,.55)';ctx.lineWidth=1/z;ctx.stroke()}}
  if(z>1.4)drawShadows(ctx);
  const lodP=z<2?0:z<6.5?1:z<14?2:3,lodV=z<1.6?0:z<7?1:z<12?2:3,lodT=z<2?0:z<6?1:2,lodS=z<3?0:z<7?1:z<14?2:3;
  items.length=0;
  for(const b of buildings)if(inView(...b.bb))items.push({d:b.depth,t:'b',o:b});
  for(const t of trees)if(onScreen(t.x,t.y))items.push({d:D(t.x,t.y),t:'tr',o:t});
  if(z>1.6)for(const p of poles)if(onScreen(p.x,p.y))items.push({d:D(p.x,p.y),t:'po',o:p});
  if(z>2.2){for(const s of spans){const x0=Math.min(s.a.x,s.b.x)-4,x1=Math.max(s.a.x,s.b.x)+2,y0=Math.min(s.a.y,s.b.y)-8,y1=Math.max(s.a.y,s.b.y);if(inView(x0,y0,x1,y1))items.push({d:Math.max(D(s.a.x,s.a.y),D(s.b.x,s.b.y))+.01,t:'sp',o:s})}
    for(const bn of banners){const x0=Math.min(bn.a.x,bn.b.x)-4,x1=Math.max(bn.a.x,bn.b.x)+2,y0=Math.min(bn.a.y,bn.b.y)-8,y1=Math.max(bn.a.y,bn.b.y);if(inView(x0,y0,x1,y1))items.push({d:Math.max(D(bn.a.x,bn.a.y),D(bn.b.x,bn.b.y))+.02,t:'bn',o:bn})}}
  for(const v of vehicles)if(onScreen(v.dx,v.dy))items.push({d:D(v.dx,v.dy),t:'v',o:v});
  if(z>1.1)for(const p of peds)if(onScreen(p.dx,p.dy))items.push({d:D(p.dx,p.dy),t:'p',o:p});
  if(z>1.3)for(const s of stalls)if(onScreen(s.x,s.y))items.push({d:D(s.x,s.y),t:'s',o:s});
  for(const pd of podiums)if(onScreen(pd.x,pd.y))items.push({d:D(pd.x,pd.y),t:'pod',o:pd});
  if(z>1.6)for(const f of fixedPeople)if(!f.stall&&!f.onPod&&onScreen(f.x,f.y))items.push({d:D(f.x,f.y),t:'p',o:f});
  if(onScreen(0,0))items.push({d:(RIN-4)*Math.hypot(VIS[0],VIS[1]),t:'sh',o:null});
  if(z>2)for(const d of dogs)if(onScreen(d.x,d.y))items.push({d:D(d.x,d.y),t:'dog',o:d});
  for(const sp of specials){if(sp.kind==='bridge'&&z<1.6)continue;if(inView(...sp.bb()))items.push({d:sp.depth(),t:'sx',o:sp})}
  if(fields.length&&z>1.8){const F=fields[0];for(const a of[2,F.L-2]){const g=fieldPt(a,F.D/2);if(onScreen(g[0],g[1]))items.push({d:D(g[0],g[1]),t:'goal',o:{a}})}if(!players[0]?.hidden&&onScreen(ball.x,ball.y))items.push({d:D(ball.x,ball.y),t:'ball',o:ball})}
  if(onScreen(me.dx,me.dy))items.push({d:D(me.dx,me.dy),t:'me',o:me});
  drawGoalMark(ctx);
  items.sort((a,b)=>a.d-b.d);
  const fo=cam.follow,fX=fo?(fo.fixed?fo.x:fo.dx):cam.x,fY=fo?(fo.fixed?fo.y:fo.dy):cam.y,hw=W*.16/z,hh=H*.1/z;let budget=5;
  
  for(const it of items){const o=it.o;switch(it.t){
    case 'b':{let ghost=false;if(z>2.2&&!inQuad(o.foot,fX,fY)){const fd=D(fX,fY),sb=scrBox(o.bb),fs=toScreen(fX,fY),cs=toScreen(KX*6,-KZ*6);ghost=(z>3.2&&o.depth>fd+2&&sb[0]<fs[0]+W*(BMODE==='cut'?.35:.08)&&sb[2]>fs[0]-W*(BMODE==='cut'?.35:.08)&&sb[1]<fs[1]-H*.01&&sb[3]>fs[1]-H*(BMODE==='cut'?.4:.06))||(o.depth>(RIN)*Math.hypot(VIS[0],VIS[1])&&sb[0]<cs[0]&&sb[2]>cs[0]&&sb[1]<cs[1]&&sb[3]>cs[1])}
      if(z<6.8&&!o.spr&&budget-->0)makeSprite(o);
      if(BMODE==='flat'){drawFoot(ctx,o);break}
      if(ghost&&BMODE==='cut'){drawStub(ctx,o,3.2);break}
      if(ghost){ctx.save();ctx.globalAlpha=.24;if(o.spr)ctx.drawImage(o.mip[0],o.bb[0],o.bb[1],o.bb[2]-o.bb[0],o.bb[3]-o.bb[1]);ctx.restore();ctx.beginPath();for(const p of o.parts){J=mulberry32(p.seed+BOIL);spoly(ctx,p.hull,.2)}pencil(ctx,INK,.35,1);ctx.stroke();ctx.globalAlpha=1;break}
      if(z<6.8&&o.spr){o.sprT=SPR.frame;ctx.drawImage(o.mip[z*DPR<1.4?2:z*DPR<2.8?1:0],o.bb[0],o.bb[1],o.bb[2]-o.bb[0],o.bb[3]-o.bb[1])}else for(const p of o.parts)drawPart(ctx,p,o);break}
    case 'tr':drawTree(ctx,o,lodT);break;
    case 'po':drawPole(ctx,o,lodT);break;
    case 'sp':drawSpan(ctx,o);break;
    case 'bn':drawBanner(ctx,o,lodT);break;
    case 'v':drawVehicle(ctx,o,lodV);break;
    case 'p':drawPerson(ctx,o,(o.fixed?o.x:o.dx)+(o.gx||0),(o.fixed?o.y:o.dy)+(o.gy||0),lodP);break;
    case 's':drawStall(ctx,o,lodS);break;
    case 'pod':drawPodium(ctx,o,lodT);break;
    case 'sh':drawShapla(ctx,lodT);drawPigeons(ctx);break;
    case 'dog':drawDog(ctx,o,lodT);break;
    case 'goal':drawGoal(ctx,o);break;
    case 'sx':o.draw(ctx,lodT);break;
    case 'ball':drawBall(ctx);break;
    case 'me':drawAvatar(ctx,lodP);break;
  }}
  if(z>2.2)drawCrows(ctx);drawAvatarMarker(ctx);ctx.globalAlpha=1;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(rain>0){ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgba(150,160,178,${.38*rain})`;ctx.fillRect(0,0,W,H)}
  const sky=keyf(SKY_K,HOUR);if(sky[3]>.01){ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgba(${sky[0]|0},${sky[1]|0},${sky[2]|0},${sky[3]})`;ctx.fillRect(0,0,W,H)}
    ctx.globalCompositeOperation='source-over';if(L>.02)lightsPass(items,L);ctx.setTransform(DPR,0,0,DPR,0,0);
  if(rain>.02)drawRain(ctx);
  if(cam.follow&&cam.follow!==me){const f=cam.follow,x=f.fixed?f.x:f.dx,y=f.fixed?f.y:f.dy,s=toScreen(x,y);ctx.beginPath();ctx.ellipse(s[0],s[1],Math.max(10,(f.len||1)*z*.7),Math.max(5,(f.len||1)*z*.35),0,0,TAU);ctx.strokeStyle='#b8432f';ctx.lineWidth=1.6;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([])}
  drawLabels(ctx,z);drawRestaurantLabel(ctx,z);drawGoalPointer(ctx);drawBubbles(ctx,z);
  if(!grainPat)grainPat=ctx.createPattern(grain,'repeat');ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.55;ctx.fillStyle=grainPat;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=1;const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(1,'rgba(150,130,100,.35)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
}
function drawLabels(c,z){
  c.textAlign='center';c.textBaseline='middle';if(z>=7)return;
  const lab=(X,Y,t1,t2,px,col)=>{const s=toScreen(X,Y);if(s[0]<-100||s[0]>W+100||s[1]<-40||s[1]>H+40)return;c.font=`600 ${px}px ${F_BN}`;c.lineWidth=4;c.strokeStyle='rgba(247,242,230,.9)';c.strokeText(t1,s[0],s[1]);c.fillStyle=col;c.fillText(t1,s[0],s[1]);
    if(t2){c.font=`${px*.72}px ${F_EN}`;c.strokeText(t2,s[0],s[1]+px);c.fillStyle=INK;c.fillText(t2,s[0],s[1]+px)}};
  const px=clamp(10+z*2.2,12,20);
  for(const b of buildings)if(b.name)lab(b.labelAt[0],b.labelAt[1],LANG==='en'?b.name[1]:b.name[0],LANG==='both'?b.name[1]:'',px,'#b8432f');
  if(z<5)lab(KX*14,-KZ*14,LANG==='en'?'Shapla Chattar':'শাপলা চত্বর',LANG==='both'?'Shapla Chattar':'',clamp(12+z*2.5,14,24),INK);
  for(const A of ARMS){const r=polyAt(A.P,Math.min(A.len-10,z<2?330:170));lab(r.x+r.ty*(A.hw+8),r.y-r.tx*(A.hw+8),LANG==='en'?A.name[1]:A.name[0],LANG==='both'?A.name[1]:'',clamp(10+z*1.5,11,16),INK2)}
}

