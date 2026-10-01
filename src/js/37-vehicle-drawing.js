/* ---------------- vehicle drawing ---------------- */
/* frustum: bottom rect B=[halfLen,halfWid,fwdOffset], top rect T likewise; faces culled by 3D normal vs view dir (0.32,0.8,1) */
function frustum(c,cx,cy,fx,fy,B,T,z0,z1,cols,out=true){
  const lx=fy,ly=-fx,P=(a,b,z)=>[cx+fx*a+lx*b+KX*z,cy+fy*a+ly*b-KZ*z];
  const bc=[[B[2]+B[0],-B[1]],[B[2]+B[0],B[1]],[B[2]-B[0],B[1]],[B[2]-B[0],-B[1]]],tc=[[T[2]+T[0],-T[1]],[T[2]+T[0],T[1]],[T[2]-T[0],T[1]],[T[2]-T[0],-T[1]]];
  const fc=[cols.front,cols.side,cols.back||cols.side,cols.side],polys=[];
  for(let i=0;i<4;i++){const j=(i+1)%4;
    const ax=fx*bc[i][0]+lx*bc[i][1],ay=fy*bc[i][0]+ly*bc[i][1],bx=fx*bc[j][0]+lx*bc[j][1],by=fy*bc[j][0]+ly*bc[j][1],tx=fx*tc[i][0]+lx*tc[i][1],ty=fy*tc[i][0]+ly*tc[i][1];
    const ux=bx-ax,uy=by-ay,vx=tx-ax,vy=ty-ay,vz=z1-z0;let nx=uy*vz,ny=-ux*vz,nz=ux*vy-uy*vx;
    if(nx*(ax+bx)+ny*(ay+by)<0){nx=-nx;ny=-ny;nz=-nz}
    if(nx*VIS[0]+ny*VIS[1]+nz<=1e-6)continue;
    const q=[P(bc[i][0],bc[i][1],z0),P(bc[j][0],bc[j][1],z0),P(tc[j][0],tc[j][1],z1),P(tc[i][0],tc[i][1],z1)];c.fillStyle=fc[i];fillPoly(c,q);if(out){c.beginPath();ppath(c,q);c.stroke()}polys[i]=q}
  const top=tc.map(p=>P(p[0],p[1],z1));c.fillStyle=cols.top;fillPoly(c,top);if(out){c.beginPath();ppath(c,top);c.stroke()}
  return{P,polys,top};
}
const sideVis=(fx,fy,sd)=>(fy*sd)*VIS[0]+(-fx*sd)*VIS[1]>0;
function wheelV(c,P,a,b,r,lod){c.beginPath();for(let i=0;i<=14;i++){const t=i/14*TAU,p=P(a+Math.cos(t)*r,b,r+Math.sin(t)*r);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.fillStyle='#2a2826';c.globalAlpha=1;c.fill();
  if(lod>1){const h=P(a,b,r);c.fillStyle='#9a9690';c.beginPath();circ(c,h[0],h[1],r*.38);c.fill()}}
function lampQuad(c,P,a,b,z,w,h,col){c.fillStyle=col;fillPoly(c,[P(a,b-w,z),P(a,b+w,z),P(a,b+w,z+h),P(a,b-w,z+h)])}
function drawVehicle(c,v,lod){
  const x=v.dx,y=v.dy,fx=v.hx,fy=v.hy,T=v.type;
  if(lod===0){c.fillStyle=T==='rickshaw'?(v.hood||'#1d2b4a'):v.col||'#555';c.globalAlpha=1;c.beginPath();const hl=v.len/2,hw=v.wid/2+.2,lx=fy,ly=-fx;
    c.moveTo(x+fx*hl+lx*hw,y+fy*hl+ly*hw);c.lineTo(x+fx*hl-lx*hw,y+fy*hl-ly*hw);c.lineTo(x-fx*hl-lx*hw,y-fy*hl-ly*hw);c.lineTo(x-fx*hl+lx*hw,y-fy*hl+ly*hw);c.fill();return}
  pencil(c,INK,.72,lod>1?.95:.8);
  if(T==='rickshaw')return drawRickshaw(c,v,x,y,fx,fy,lod);
  if(lod===1){const hh={car:v.sub==='micro'?1.9:1.4,cng:1.7,bus:3,dd:4.3,bike:1.3,leguna:1.9,covan:2.2,cash:2.2,thela:.9}[T]||1.5;const cc=T==='cng'?'#3d8b4a':T==='thela'?'#8a6a4a':v.col;
    obox(c,x,y,fx,fy,v.len,T==='bike'?.5:v.wid,.3,hh,wash(T==='bus'||T==='dd'?v.col2:cc,.55),wash(shade(cc,.78),.82),wash(cc,.72));return}
  const L=v.len/2,Wd=v.wid/2,col=v.col,side=wash(shade(col,.78),.82),front=wash(col,.72),top=wash(col,.5),glass='rgba(62,86,110,.72)',glassTop='rgba(90,120,150,.55)';
  const lx=fy,ly=-fx,P=(a,b,z)=>[x+fx*a+lx*b+KX*z,y+fy*a+ly*b-KZ*z];
  const wheels=(pairs,r)=>{for(const sd of[-1,1]){if(!sideVis(fx,fy,sd))continue;for(const a of pairs)wheelV(c,P,a,sd*(Wd+.02),r,lod)}};
  const TY={cash:[L*.6,-L*.5],car:[L*.62,-L*.62],cng:[-L*.45],bus:[L*.62,-L*.55],dd:[L*.62,-L*.55],leguna:[L*.6,-L*.55],covan:[L*.6,-L*.5]}[T];
  if(TY){c.fillStyle='#2a2826';c.globalAlpha=1;const tl=T==='bus'||T==='dd'?.55:.34,tw=.14;for(const a of TY)for(const sd of[-1,1]){const b=sd*(Wd+.01);fillPoly(c,[P(a-tl,b-tw,0),P(a+tl,b-tw,0),P(a+tl,b+tw,0),P(a-tl,b+tw,0)])}
    if(T==='cng'){fillPoly(c,[P(L*.72-.26,-.1,0),P(L*.72+.26,-.1,0),P(L*.72+.26,.1,0),P(L*.72-.26,.1,0)])}}
  if(T==='car'&&lod>1&&v.sub!=='micro'){c.fillStyle=wash(col,.6);for(const sd of[-1,1]){const m=P(L*.18,sd*(Wd+.12),.85);c.fillRect(m[0]-.07,m[1]-.05,.14,.1)}}
  if(T==='car'){const sub=v.sub||'sedan';
    if(sub==='micro'){frustum(c,x,y,fx,fy,[L,Wd,0],[L-.25,Wd-.06,-.12],.3,1.95,{top,side,front:glass,back:side});const f=frustum;wheels([L*.62,-L*.6],.3);
      if(lod>1)for(const sd of[-1,1]){if(!sideVis(fx,fy,sd))continue;const b=sd*(Wd-.02);c.fillStyle=glass;fillPoly(c,[P(-L+.4,b,1.15),P(L-.7,b,1.15),P(L-.55,b,1.7),P(-L+.4,b,1.7)]);c.beginPath();for(let a=-L+1.4;a<L-.8;a+=1.1){const p0=P(a,b,1.15),p1=P(a,b,1.7);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}c.stroke()}}
    else{const hBody=sub==='suv'?1.0:.78,hTop=sub==='suv'?1.72:1.42,cabL=sub==='hatch'?L*.34:sub==='suv'?L*.42:L*.3,cabO=sub==='hatch'?-L*.12:-L*.06;
      frustum(c,x,y,fx,fy,[L,Wd,0],[L-.12,Wd-.04,0],.26,hBody,{top,side,front,back:side});
      wheels([L*.62,-L*.62],sub==='suv'?.36:.31);
      const cab=frustum(c,x,y,fx,fy,[cabL+.28,Wd-.1,cabO+.06],[cabL,Wd-.22,cabO-.05],hBody,hTop,{top,side:glass,front:glass,back:glass});
      if(lod>1){c.beginPath();for(const sd of[-1,1]){if(!sideVis(fx,fy,sd))continue;const p0=P(cabO,sd*(Wd-.14),hBody),p1=P(cabO-.02,sd*(Wd-.22),hTop);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);const d0=P(cabO,sd*Wd,.3),d1=P(cabO,sd*Wd,hBody);c.moveTo(d0[0],d0[1]);c.lineTo(d1[0],d1[1])}pencil(c,INK,.7,.8);c.stroke()}}
    if(lod>1&&fx*VIS[0]+fy*VIS[1]>0){lampQuad(c,P,L+.01,Wd*.62,.55,.16,.12,'#fff6cf');lampQuad(c,P,L+.01,-Wd*.62,.55,.16,.12,'#fff6cf')}
    if(lod>1&&-(fx*VIS[0]+fy*VIS[1])>0){lampQuad(c,P,-L-.01,Wd*.62,.6,.16,.1,'#c0392b');lampQuad(c,P,-L-.01,-Wd*.62,.6,.16,.1,'#c0392b')}}
  else if(T==='cng'){const g='#3d8b4a',gs=wash(shade(g,.75),.85);
    wheels([-L*.45],.24);wheelV(c,P,L*.72,0,.22,lod);
    frustum(c,x,y,fx,fy,[.5,.42,L*.55],[.28,.34,L*.62],.3,1.05,{top:wash(g,.6),side:gs,front:wash(g,.75)});
    const cab=frustum(c,x,y,fx,fy,[L*.62,Wd,-L*.22],[L*.58,Wd-.06,-L*.24],.28,1.5,{top:wash(g,.55),side:gs,front:glass,back:gs});
    frustum(c,x,y,fx,fy,[L*.86,Wd+.04,-L*.05],[L*.8,Wd-.02,-L*.07],1.5,1.72,{top:wash('#2e3b2f',.88),side:wash('#2e3b2f',.92),front:wash('#2e3b2f',.92)});
    if(lod>1){c.beginPath();for(const sd of[-1,1]){if(!sideVis(fx,fy,sd))continue;const b=sd*Wd;for(let a=-L*.8;a<=L*.35;a+=.2){const p0=P(a,b,.62),p1=P(a,b,1.48);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}const h0=P(-L*.8,b,1.05),h1=P(L*.35,b,1.05);c.moveTo(h0[0],h0[1]);c.lineTo(h1[0],h1[1])}pencil(c,INK,.55,.7);c.stroke();
      if(fx*VIS[0]+fy*VIS[1]>0)lampQuad(c,P,L*.84,0,.85,.1,.1,'#fff6cf')}}
  else if(T==='bus'||T==='dd'){const top2=T==='dd'?4.35:3.05;
    const body=frustum(c,x,y,fx,fy,[L,Wd,0],[L-.15,Wd-.1,-.05],.35,top2,{top:wash(v.col2,.45),side,front,back:side});
    wheels([L*.62,-L*.55],.48);
    if(lod>0){const bands=T==='dd'?[[1.25,2.05],[2.7,3.7]]:[[1.5,2.5]];
      for(const sd of[-1,1]){if(!sideVis(fx,fy,sd))continue;const b=sd*(Wd+.01);c.globalAlpha=1;c.fillStyle=wash(v.col2,.85);fillPoly(c,[P(-L,b,.85),P(L,b,.85),P(L,b,1.12),P(-L,b,1.12)]);
        c.fillStyle='rgba(47,50,60,.6)';for(const bd of bands)fillPoly(c,[P(-L+.5,b,bd[0]),P(L-.9,b,bd[0]),P(L-.9,b,bd[1]),P(-L+.5,b,bd[1])]);
        if(sd>0){c.fillStyle='rgba(30,30,32,.8)';fillPoly(c,[P(L-2.2,b,.4),P(L-1.3,b,.4),P(L-1.3,b,2.5),P(L-2.2,b,2.5)])}
        if(lod>1){c.beginPath();for(const bd of bands)for(let a=-L+1.4;a<L-1;a+=1.15){const p0=P(a,b,bd[0]),p1=P(a,b,bd[1]);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}
          J=mulberry32(v.id);for(let k=0;k<5;k++){const a=-L+J()*v.len,zz=.5+J()*.6,p0=P(a,b,zz),p1=P(a+.6+J()*.8,b,zz+J()*.2-.1);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}pencil(c,INK,.55,.7);c.stroke();
          if(lod>2&&v.brt){const m=P(0,b,T==='dd'?2.4:1.3);screenText(c,m[0],m[1],LANG==='en'?v.brt[1]:v.brt[0],.5*S,shade(v.col,.45),LANG==='en'?F_EN:F_BN,'center','600')}}}
      if(fx*VIS[0]+fy*VIS[1]>0){c.fillStyle='rgba(80,110,140,.6)';fillPoly(c,[P(L,-Wd+.15,1.3),P(L,Wd-.15,1.3),P(L-.1,Wd-.2,top2-.35),P(L-.1,-Wd+.2,top2-.35)]);if(lod>1){lampQuad(c,P,L+.01,Wd*.7,.7,.2,.15,'#fff6cf');lampQuad(c,P,L+.01,-Wd*.7,.7,.2,.15,'#fff6cf')}}}
    if(lod>1&&v.helper&&sideVis(fx,fy,1)){const h=helperAnchor(v)();if(h){const ppl=[v.helper,...(v.hangers||[])];ppl.forEach((pp,i)=>{pp.fc=sdir(fx,fy)>=0?1:-1;pp.pose='stand';pp.act='hang';drawPerson(c,pp,h[0]-fx*i*.45+lx*i*.12+KX*.4,h[1]-fy*i*.45+ly*i*.12-KZ*.4,lod,{noUmb:true})})}}}
  else if(T==='bike'){const r=v.rider;
    c.beginPath();const fw=P(L*.62,0,.32),bw=P(-L*.62,0,.32);c.moveTo(bw[0],bw[1]);const tk=P(.15,0,.78),hb=P(L*.5,0,1.05);c.lineTo(tk[0],tk[1]);c.lineTo(fw[0],fw[1]);c.moveTo(hb[0],hb[1]);c.lineTo(fw[0],fw[1]);pencil(c,INK,.85,1.2);c.stroke();
    wheelV(c,P,L*.62,0,.32,lod);wheelV(c,P,-L*.62,0,.32,lod);
    frustum(c,x,y,fx,fy,[.32,.17,.18],[.26,.14,.18],.6,.84,{top:wash(v.col,.7),side:wash(v.col,.85),front:wash(v.col,.85)});
    frustum(c,x,y,fx,fy,[.34,.14,-.35],[.3,.12,-.38],.72,.82,{top:wash('#2a2826',.9),side:wash('#2a2826',.95),front:wash('#2a2826',.95)});
    c.beginPath();const h1=P(L*.5,-.36,1.05),h2=P(L*.5,.36,1.05);c.moveTo(h1[0],h1[1]);c.lineTo(h2[0],h2[1]);pencil(c,INK,.85,1.2);c.stroke();
    if(lod>1){r.fc=sdir(fx,fy)>=0?1:-1;r.pose='sit';r.act='handle';r.helmet=r.helmet||'#222';const s=P(-.2,0,.4);drawPerson(c,r,s[0],s[1],lod,{noUmb:true});
      if(v.pillion){v.pillion.fc=r.fc;v.pillion.pose='sit';v.pillion.act=null;const s2=P(-.72,0,.42);drawPerson(c,v.pillion,s2[0],s2[1],lod,{noUmb:true})}}}
  else if(T==='leguna'){wheels([L*.6,-L*.55],.3);frustum(c,x,y,fx,fy,[L*.3,Wd,L*.68],[L*.22,Wd-.08,L*.62],.3,1.75,{top:top,side,front:glass});
    frustum(c,x,y,fx,fy,[L*.66,Wd,-L*.32],[L*.66,Wd,-L*.32],.35,.75,{top:wash('#6b4a32',.7),side,front:side});
    frustum(c,x,y,fx,fy,[L*.68,Wd+.03,-L*.3],[L*.64,Wd-.02,-L*.3],1.85,2,{top:wash(v.col,.7),side:wash(v.col,.8),front:wash(v.col,.8)});
    c.beginPath();for(const a of[-L+.1,-.1])for(const sd of[-1,1]){const p0=P(a,sd*Wd,.75),p1=P(a,sd*Wd,1.85);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}c.stroke()}
  else if(T==='covan'||T==='cash'){if(T==='cash'&&lod>2){const m=P(-L*.3,0,2.6);screenText(c,m[0],m[1],LANG==='en'?'CASH CARRIER':'ক্যাশ ক্যারিয়ার',.42*S,'#f2c14e',LANG==='en'?F_EN:F_BN,'center','700')}wheels([L*.6,-L*.5],.34);frustum(c,x,y,fx,fy,[L*.22,Wd,L*.76],[L*.14,Wd-.1,L*.7],.35,1.85,{top,side,front:glass});
    frustum(c,x,y,fx,fy,[L*.7,Wd+.05,-L*.28],[L*.7,Wd+.05,-L*.28],.55,2.25,{top:wash('#4a5a3a',.75),side:wash('#4a5a3a',.85),front:wash('#4a5a3a',.85)})}
  else if(T==='thela'){wheels([-.1],.36);frustum(c,x,y,fx,fy,[L*.9,Wd,0],[L*.9,Wd,0],.45,.58,{top:wash('#8a6a4a',.75),side:wash('#6b4a32',.85),front:wash('#6b4a32',.85)});
    const hd=P(-L*.9,0,.58),hh=P(-L*1.25,0,.95);c.beginPath();c.moveTo(hd[0],hd[1]);c.lineTo(hh[0],hh[1]);c.stroke();
    J=mulberry32(v.id);if(v.load==='bamboo'){c.beginPath();for(let i=0;i<6;i++){const p0=P(-L-.6,(i-2.5)*.14,.7),p1=P(L+.9,(i-2.5)*.14,.7);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}pencil(c,'#b59a52',.95,2);c.stroke()}
    else for(let i=0;i<6;i++){const a=(i%3-1)*.7,b=((i/3)|0)-.5,z=.75+(i>2?.3:0);if(v.load==='sacks'){const p=P(a,b*.5,z);c.fillStyle=wash('#d8c9a0',.95);c.beginPath();c.ellipse(p[0],p[1],.38,.22,0,0,TAU);c.fill();pencil(c,INK,.5,.7);c.stroke()}else frustum(c,x+fx*a+lx*b*.5,y+fy*a+ly*b*.5,fx,fy,[.3,.25,0],[.3,.25,0],z-.2,z+.2,{top:wash('#c9a36b',.8),side:wash('#a8834e',.85),front:wash('#a8834e',.85)})}
    if(lod>1&&v.pusher){const pu=v.pusher;pu.fc=sdir(fx,fy)>=0?1:-1;pu.pose='walk';pu.ph=(v.s||0)*3;pu.act='carry';const s=P(-L*1.45,0,0);drawPerson(c,pu,s[0],s[1],lod,{noUmb:true})}}
  if(v.honk&&simT-v.honk<.6&&lod>1){const a=[x+fx*v.len*.6+KX*2.5,y+fy*v.len*.6-KZ*2.5];c.beginPath();for(let i=0;i<5;i++){const an=i/5*TAU;c.moveTo(a[0]+Math.cos(an)*.5,a[1]+Math.sin(an)*.5);c.lineTo(a[0]+Math.cos(an)*1.1,a[1]+Math.sin(an)*1.1)}pencil(c,'#b8432f',.8,1.2);c.stroke()}
}
function drawRickshaw(c,v,x,y,fx,fy,lod){
  const lx=fy,ly=-fx,pt=(a,b,z)=>[x+fx*a+lx*b+KX*z,y+fy*a+ly*b-KZ*z];
  const wheel=(a,b,r)=>{c.beginPath();for(let i=0;i<=12;i++){const t=i/12*TAU,p=pt(a+Math.cos(t)*r,b,r+Math.sin(t)*r);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.stroke()};
  pencil(c,INK,.8,.9);
  if(lod===1){obox(c,x,y,fx,fy,v.len*.8,v.wid,.5,1.1,wash('#b8432f',.6),wash('#6b4a32',.7),wash('#6b4a32',.7));if(v.hoodUp){obox(c,x-fx*.5,y-fy*.5,fx,fy,.8,v.wid,1.1,1.9,wash(v.hood,.7),wash(v.hood,.8),wash(v.hood,.8))}return}
  const pulFront=fx*VIS[0]+fy*VIS[1]>0;
  const drawPuller=()=>{const pl=v.puller;pl.fc=sdir(fx,fy)>=0?1:-1;if(v.parked){return}pl.pose='pedal';pl.act='handle';pl.ph=(v.s||0)*2.2;const b=pt(.55,0,.25);drawPerson(c,pl,b[0],b[1],lod,{noUmb:true})};
  if(!pulFront)drawPuller();
  wheel(-.55,.55,.34);wheel(-.55,-.55,.34);wheel(1,0,.3);
  c.beginPath();let p=pt(1,0,.34);c.moveTo(p[0],p[1]);p=pt(.45,0,.62);c.lineTo(p[0],p[1]);p=pt(-.55,0,.55);c.lineTo(p[0],p[1]);p=pt(.95,0,1.05);const hb=pt(1,0,.34);c.moveTo(hb[0],hb[1]);c.lineTo(p[0],p[1]);c.stroke();
  obox(c,x-fx*.5,y-fy*.5,fx,fy,.62,1.08,.6,.88,wash('#b8432f',.75),wash('#6b4a32',.8),wash('#6b4a32',.8));
  // painted back panel
  const bp=[pt(-.82,-.52,.85),pt(-.82,.52,.85),pt(-.82,.52,1.4),pt(-.82,-.52,1.4)];c.fillStyle=wash(v.art[0],.8);fillPoly(c,bp);
  if(lod>1){c.fillStyle=wash(v.art[1],.9);const m=pt(-.82,0,1.12);c.beginPath();circ(c,m[0],m[1],.14);c.fill();c.fillStyle=v.art[2];for(const b of[-.33,.33]){const q=pt(-.82,b,1.12);c.beginPath();circ(c,q[0],q[1],.07);c.fill()}}
  c.beginPath();ppath(c,bp);c.stroke();
  // passengers or resting puller
  const seatP=(b)=>pt(-.48,b,.45);
  if(v.parked){const pl=v.puller;pl.fc=sdir(fx,fy)>=0?-1:1;pl.pose='sit';pl.act=null;pl.sleepFace=v.sleepy;const s=seatP(0);drawPerson(c,pl,s[0],s[1],lod,{noUmb:true})}
  else{const n=v.pax.length;v.pax.forEach((pp,i)=>{pp.fc=sdir(fx,fy)>=0?1:-1;pp.pose='sit';pp.act=null;const s=seatP(n>1?(i?-.24:.24):0);drawPerson(c,pp,s[0],s[1],lod,{noUmb:true})})}
  // hood
  if(v.hoodUp){c.globalAlpha=1;const arc=(a)=>{const r=[];for(let i=0;i<=10;i++){const t=i/10*Math.PI;r.push(pt(a,Math.cos(t)*.56,1.38+Math.sin(t)*.62))}return r};
    const back=arc(-.88),front=arc(-.12);c.fillStyle=wash(v.hood,.8);c.beginPath();c.moveTo(back[0][0],back[0][1]);for(const q of back)c.lineTo(q[0],q[1]);for(let i=front.length-1;i>=0;i--)c.lineTo(front[i][0],front[i][1]);c.closePath();c.fill();
    c.beginPath();c.moveTo(front[0][0],front[0][1]);for(const q of front)c.lineTo(q[0],q[1]);c.strokeStyle=v.art[2];c.lineWidth=2/S;c.stroke();
    c.beginPath();c.moveTo(back[0][0],back[0][1]);for(const q of back)c.lineTo(q[0],q[1]);pencil(c,INK,.8,.9);c.stroke();
    if(rain>.4&&!v.parked){c.fillStyle='rgba(90,140,200,.35)';fillPoly(c,[pt(-.15,-.56,.7),pt(-.15,.56,.7),pt(-.15,.56,1.5),pt(-.15,-.56,1.5)])}}
  if(pulFront)drawPuller();
}

function drawRain(c){
  const n=Math.round(420*rain*(W*H)/(1400*900));c.beginPath();const t=simT;
  for(let i=0;i<n;i++){const h1=Math.abs(Math.sin(i*127.1)*43758.5)%1,h2=Math.abs(Math.sin(i*311.7)*24634.6)%1;const x=(h1*W*1.2+t*-160)%(W*1.2),y=((h2*H+t*820*(0.8+h1*.4))%(H+40))-20;const xx=x<0?x+W*1.2:x;c.moveTo(xx,y);c.lineTo(xx-4,y+14)}
  c.strokeStyle='rgba(70,85,110,.42)';c.lineWidth=1;c.stroke();
}
function drawBubbles(c,z){
  if(z<3.6)return;let shown=0;
  const list=bubbles.map(b=>{const a=b.anchor();if(!a)return null;const s=toScreen(a[0]+KX*a[2],a[1]-KZ*a[2]);return{b,s,d:Math.hypot(s[0]-W/2,s[1]-H/2)}}).filter(x=>x&&x.s[0]>-80&&x.s[0]<W+80&&x.s[1]>-20&&x.s[1]<H+60).sort((a,b)=>a.d-b.d);
  const placed=[];
  for(const{b,s}of list){if(shown>9)break;const age=simT-b.t0,al=clamp(Math.min(age*5,(b.dur-age)*3),0,1);if(al<=0)continue;
    const cleanB = s => (s||'').replace(/<[^>]+>|\|[^|]+\|/g, '').trim();
    const bnStr = cleanB(b.l.bn), enStr = cleanB(b.l.en);
    const lines=LANG==='bn'?[[bnStr,F_BN,15]]:LANG==='en'?[[enStr,F_EN,14]]:[[bnStr,F_BN,15],[enStr,F_EN,12]];
    let w=0;for(const l of lines){c.font=`${l[2]}px ${l[1]}`;w=Math.max(w,c.measureText(l[0]).width)}
    w=Math.min(w,300);const h=lines.reduce((a,l)=>a+l[2]*1.35,0)+8,x=clamp(s[0]-w/2-9,6,W-w-24),y=s[1]-h-16-(1-al)*6;
    if(placed.some(r=>x<r[2]&&x+w+18>r[0]&&y<r[3]&&y+h>r[1]))continue;placed.push([x,y,x+w+18,y+h]);shown++;
    c.globalAlpha=al;J=mulberry32((b.t0*1000|0)+BOIL);
    c.fillStyle='#fbf8f0';c.beginPath();c.roundRect?c.roundRect(x,y,w+18,h,9):c.rect(x,y,w+18,h);c.fill();
    c.beginPath();c.moveTo(clamp(s[0]-6,x+8,x+w+4),y+h-.5);c.lineTo(s[0],s[1]-4);c.lineTo(clamp(s[0]+5,x+14,x+w+10),y+h-.5);c.fill();
    c.beginPath();const S0=S;S=1;sl(c,x+6,y,x+w+12,y,1.2);sl(c,x+w+18,y+5,x+w+18,y+h-5,1.2);sl(c,x+w+12,y+h,clamp(s[0]+5,x+14,x+w+10),y+h,1.2);sl(c,clamp(s[0]-6,x+8,x+w+4),y+h,x+6,y+h,1.2);sl(c,x,y+h-5,x,y+5,1.2);
    c.moveTo(clamp(s[0]-6,x+8,x+w+4),y+h);c.lineTo(s[0],s[1]-4);c.lineTo(clamp(s[0]+5,x+14,x+w+10),y+h);S=S0;
    c.strokeStyle=INK;c.lineWidth=1.3;c.stroke();
    let ty=y+6;for(const l of lines){c.font=`${l[2]}px ${l[1]}`;c.fillStyle=l[1]===F_BN?INK:INK2;c.textAlign='left';c.textBaseline='top';c.fillText(l[0],x+9,ty,w+2);ty+=l[2]*1.35}
    c.globalAlpha=1}
}

