/* ---------------- club para: Mohammedan & neighbours, the practice ground ---------------- */
const fields=[],players=[];const ball={a:31,b:20,va:0,vb:0,x:0,y:0};
const CLUBS=[
 {name:['মোহামেডান স্পোর্টিং ক্লাব','Mohammedan Sporting Club'],col:'#f2f2ea',stripe:'#1c1c1c',h:14,f:24,d:15},
 {name:['আরামবাগ ক্রীড়া সংঘ','Arambagh Krira Sangha'],col:'#e3e9dc',stripe:'#2e7d32',h:11,f:18,d:13},
 {name:['ঢাকা ওয়ান্ডারার্স ক্লাব','Dhaka Wanderers Club'],col:'#dde6ef',stripe:'#1f4f8b',h:10,f:18,d:13},
 {name:['ফকিরেরপুল ইয়াংমেন্স ক্লাব','Fakirerpool Young Men\'s Club'],col:'#f1e3c8',stripe:'#b8432f',h:10,f:18,d:12},
 {name:['মতিঝিল থানা','Motijheel Police Station'],col:'#e3d6c0',stripe:null,h:15,f:22,d:14,thana:true},
];
function genClubs(){
  let Fq=null;for(let k=0;k<80&&!Fq;k++){const q=lmQuad(205+(k>>2)*4,-27+((k%4)-1.5)*3,62,40);if(quadFree(q))Fq=q}
  if(!Fq)return;occMark(Fq);const t=[Fq[1][0]-Fq[0][0],Fq[1][1]-Fq[0][1]],n=[Fq[3][0]-Fq[0][0],Fq[3][1]-Fq[0][1]];const L=Math.hypot(...t),D=Math.hypot(...n);t[0]/=L;t[1]/=L;n[0]/=D;n[1]/=D;
  const F={q:Fq,q0:Fq[0],t,n,L,D};fields.push(F);
  const spots=[{u:.2,v:1,a:t,o:n},{u:.55,v:1,a:t,o:n},{u:.86,v:1,a:t,o:n},{u:.3,v:0,a:t,o:[-n[0],-n[1]]},{u:.75,v:0,a:t,o:[-n[0],-n[1]]},{u:0,v:.5,a:n,o:[-t[0],-t[1]]},{u:1,v:.5,a:n,o:t}];
  let ci=0;
  for(const sp of spots){if(ci>=CLUBS.length)break;const C=CLUBS[ci],base=qPoint(Fq,sp.u,sp.v);let ok=false;
    for(let g=1.5;g<14&&!ok;g+=1.5)for(const slide of[0,-4,4,-8,8]){const cx=base[0]+sp.o[0]*(C.d/2+g)+sp.a[0]*slide,cy=base[1]+sp.o[1]*(C.d/2+g)+sp.a[1]*slide;
      const q0=[cx-sp.a[0]*C.f/2-sp.o[0]*C.d/2,cy-sp.a[1]*C.f/2-sp.o[1]*C.d/2],q=[q0,[q0[0]+sp.a[0]*C.f,q0[1]+sp.a[1]*C.f],[q0[0]+sp.a[0]*C.f+sp.o[0]*C.d,q0[1]+sp.a[1]*C.f+sp.o[1]*C.d],[q0[0]+sp.o[0]*C.d,q0[1]+sp.o[1]*C.d]];
      if(quadFree(q)){occMark(q);addBuilding([{q,h:C.h,kind:'club',col:C.col,stripe:C.stripe,clubName:C.name,thana:C.thana}],{name:C.name,landmark:true,club:true});ok=true;break}}
    if(ok)ci++}
  const TEAM=[{jersey:'#1c1c1c',c1:'#f2f2ea'},{jersey:null,c1:'#2e7d32'}];
  for(let i=0;i<10;i++){const tm=i%2,p=makePerson(mpick(['student','labour']),false);p.look.dress='pants';p.look.c1=TEAM[tm].c1;p.look.c2='#2f3a4d';p.jersey=TEAM[tm].jersey;p.team=tm;p.fixed=true;p.role='player';
    p.home_a=tm?rr(8,30):rr(32,54);p.home_b=rr(5,35);p.fa=p.home_a;p.fb=p.home_b;p.spd=mr(2.6,3.6);p.roleText=tm?'Plays for the evening side of the Arambagh boys':'Kicks about in a Mohammedan-striped shirt';p.years=0;players.push(p);fixedPeople.push(p);placePlayer(p)}
}
function fieldPt(a,b){const F=fields[0];return[F.q0[0]+F.t[0]*a+F.n[0]*b,F.q0[1]+F.t[1]*a+F.n[1]*b]}
function placePlayer(p){const w=fieldPt(p.fa,p.fb);p.x=w[0];p.y=w[1];p.dx=p.x;p.dy=p.y}
function updPlayers(dt){if(!fields.length)return;const F=fields[0];const on=HOUR>6.5&&HOUR<17.8&&rain<.6;for(const p of players)p.hidden=!on;if(!on)return;
  ball.a+=ball.va*dt;ball.b+=ball.vb*dt;const fr=Math.pow(.45,dt);ball.va*=fr;ball.vb*=fr;
  if(ball.b<1||ball.b>F.D-1){ball.vb*=-.7;ball.b=clamp(ball.b,1,F.D-1)}
  if(ball.a<1||ball.a>F.L-1){if(Math.abs(ball.b-F.D/2)<3.6){const sc=players.find(p=>!p.hidden);if(sc)say(pedAnchor(sc),'player_goal_1',2.4,sc);ball.a=F.L/2;ball.b=F.D/2;ball.va=ball.vb=0}else{ball.va*=-.7;ball.a=clamp(ball.a,1,F.L-1)}}
  const w=fieldPt(ball.a,ball.b);ball.x=w[0];ball.y=w[1];
  for(const tm of[0,1]){let best=null,bd=1e9;for(const p of players)if(p.team===tm){const d=Math.hypot(p.fa-ball.a,p.fb-ball.b);if(d<bd){bd=d;best=p}}
    for(const p of players){if(p.team!==tm)continue;let ta,tb,sp;if(p===best){ta=ball.a;tb=ball.b;sp=p.spd}else{ta=p.home_a*.6+ball.a*.4;tb=p.home_b*.7+ball.b*.3;sp=1.4}
      const dx=ta-p.fa,db=tb-p.fb,d=Math.hypot(dx,db);if(d>.3){const m=Math.min(d,sp*dt);p.fa+=dx/d*m;p.fb+=db/d*m;p.pose='walk';p.ph+=m*5;p.act=p===best?'kick':null}else p.pose='stand';
      const old=[p.x,p.y];placePlayer(p);{const sx=sdir(p.x-old[0],p.y-old[1]);if(Math.abs(sx)>.001)p.fc=sx>0?1:-1}
      if(p===best&&d<.8&&Math.hypot(ball.va,ball.vb)<4){const ga=tm?0:F.L,gb=F.D/2+mr(-6,6),ka=ga-ball.a,kb=gb-ball.b,kl=Math.hypot(ka,kb)||1,v=mr(6,12);ball.va=ka/kl*v+mr(-2,2);ball.vb=kb/kl*v+mr(-3,3);if(Math.random()<.15)say(pedAnchor(p),'player_pass_1',2,p)}}}}
function paintFields(c){for(const F of fields){const P=(a,b)=>[F.q0[0]+F.t[0]*a+F.n[0]*b,F.q0[1]+F.t[1]*a+F.n[1]*b];c.globalAlpha=1;c.fillStyle=wash('#7fa35a',.7);fillPoly(c,F.q);
  c.fillStyle='rgba(150,110,70,.28)';for(const[a,b,r]of[[4,F.D/2,4],[F.L-4,F.D/2,4],[F.L/2,F.D/2,5]]){const p=P(a,b);c.beginPath();c.ellipse(p[0],p[1],r*1.3,r,Math.atan2(F.t[1],F.t[0]),0,TAU);c.fill()}
  c.strokeStyle='#f7f3e8';c.globalAlpha=.85;c.lineWidth=.22;c.beginPath();ppath(c,[P(2,2),P(F.L-2,2),P(F.L-2,F.D-2),P(2,F.D-2)]);const m0=P(F.L/2,2),m1=P(F.L/2,F.D-2);c.moveTo(m0[0],m0[1]);c.lineTo(m1[0],m1[1]);const cc=P(F.L/2,F.D/2);c.moveTo(cc[0]+5,cc[1]);c.arc(cc[0],cc[1],5,0,TAU);
  ppath(c,[P(2,F.D/2-8),P(9,F.D/2-8),P(9,F.D/2+8),P(2,F.D/2+8)]);ppath(c,[P(F.L-2,F.D/2-8),P(F.L-9,F.D/2-8),P(F.L-9,F.D/2+8),P(F.L-2,F.D/2+8)]);c.stroke();
  c.globalAlpha=1;c.strokeStyle=wash('#a0523a',.85);c.lineWidth=.45;c.beginPath();const w=[P(0,0),P(F.L,0),P(F.L,F.D),P(0,F.D)];c.moveTo(w[3][0],w[3][1]);for(const q of w)c.lineTo(q[0],q[1]);c.stroke()}}
function drawGoal(c,g){const F=fields[0];const P=(a,b,z)=>{const p=fieldPt(a,b);return[p[0]+KX*z,p[1]-KZ*z]};const a=g.a,b0=F.D/2-3.6,b1=F.D/2+3.6,back=a<F.L/2?-1.2:1.2;
  c.beginPath();const p1=P(a,b0,0),p2=P(a,b0,2.4),p3=P(a,b1,2.4),p4=P(a,b1,0);c.moveTo(p1[0],p1[1]);c.lineTo(p2[0],p2[1]);c.lineTo(p3[0],p3[1]);c.lineTo(p4[0],p4[1]);pencil(c,'#fbf8ef',1,2.2);c.stroke();pencil(c,INK,.7,.8);c.stroke();
  c.beginPath();for(let b=b0;b<=b1;b+=.9){const q0=P(a,b,2.4),q1=P(a+back,b,0);c.moveTo(q0[0],q0[1]);c.lineTo(q1[0],q1[1])}pencil(c,INK,.3,.6);c.stroke()}
function drawBall(c){const p=[ball.x,ball.y];c.fillStyle='#fbf8ef';c.globalAlpha=1;c.beginPath();circ(c,p[0],p[1]-.12,.13);c.fill();c.fillStyle=INK;c.beginPath();circ(c,p[0]+.03,p[1]-.13,.045);c.fill()}

function genBuildings(){
  for(const L of LANDMARKS){let q=null;for(let k=0;k<40;k++){const t=lmQuad(L.r+k*3,L.deg+(k%2?1:-1)*(k>>1)*.8,L.f,L.d);if(quadFree(t)){q=t;break}}if(!q)continue;occMark(q);addBuilding(L.parts(q),{name:L.name,landmark:true,mosque:L.mosque,spire:L.spire})}
  genClubs();genBaitul();genKamalapur();genNDC();genSchools();genDSE();genGreen();genGalis();
  const mkB=(q,r0,kindHint)=>{
    let kind,h,col;const nearArm=kindHint==='arm';
    if(nearArm&&r0<340&&RND()<.36*(1-r0/420)+.08){kind=RND()<.45?'glass':'tower';h=rr(42,92)}
    else if(kindHint==='lane'||kindHint==='gali'||kindHint==='infill'){kind='old';h=rr(9,26)}
    else if(RND()<.45){kind='office';h=rr(16,40)}else{kind='old';h=rr(12,30)}
    if(RND()<.07&&kind!=='old'){kind='frame';h=rr(30,70)}
    if(r0>360)h*=.8;
    col=kind==='glass'?rpick(['#7fa7b5','#6f97a8','#8fb0a0','#5f8fa8','#86a0b8']):kind==='tower'?rpick(['#cfc6b4','#bdb8ad','#d8cdb6','#c2b49a','#b9c0c4']):kind==='office'?rpick(['#d4c7a8','#c8c1b0','#bfb3a0','#d0b89a','#c4c9c2']):rpick(['#d9a86c','#e0c090','#c98f7a','#b7c6a0','#e3d2a0','#c9a0a0','#a9bfc9','#e8d8c0']);
    if(kind!=='old'&&h>40&&RND()<.5){const ph=rr(10,16);addBuilding([{q,h:ph,kind:'office',col:shade(col,1.03)},{q:inset(q,rr(.62,.8)),z0:ph,h:h-ph,kind,col}])}
    else addBuilding([{q,h,kind,col}]);
  };
  // street frontage, shoulder to shoulder
  for(const R of roads){const off0=R.hw+R.sw;for(const side of[-1,1]){let s=rr(0,5);
    while(s<R.len-4){const r=polyAt(R.P,s),x=r.x,y=r.y,tx=r.tx,ty=r.ty;if(!inWorld(x,y,-5)){s+=6;continue}
      const nx=ty*side,ny=-tx*side,r0=Math.hypot(x,y);
      const nar=R.kind==='lane'||R.kind==='gali',f=R.kind==='arm'&&r0<260?rr(12,30):nar?rr(5,11):rr(7,20),d=nar?rr(7,13):rr(12,28),off=off0+(nar?rr(.1,.5):rr(.25,1.4));
      const q0=[x+nx*off,y+ny*off];let q=[q0,[q0[0]+tx*f,q0[1]+ty*f],[q0[0]+tx*f+nx*d,q0[1]+ty*f+ny*d],[q0[0]+nx*d,q0[1]+ny*d]];
      if(side<0)q=[q[1],q[0],q[3],q[2]];
      if(quadFree(q)){occMark(q);mkB(q,r0,R.kind);s+=f+rr(0,.9)}else s+=2.5}}}
  // infill behind the frontage
  const angAt=(x,y)=>{let best=0,bd=1e9;for(const R of roads){const[s,d]=nearestS(R.P,x,y);if(d<bd){bd=d;const r=polyAt(R.P,s);best=Math.atan2(r.ty,r.tx)}}return best};
  for(let n=0;n<7000;n++){const x=rr(-E+5,E-5),y=rr(-E+5,E-5);if(cellAt(x,y)!==0)continue;const a=angAt(x,y),tx=Math.cos(a),ty=Math.sin(a),nx=ty,ny=-tx,big=n<2600,f=big?rr(8,20):rr(5,11),d=big?rr(8,18):rr(5,10);   // Motijheel is packed: after the bigger blocks, small old buildings fill every gap
    const q0=[x-tx*f/2-nx*d/2,y-ty*f/2-ny*d/2],q=[q0,[q0[0]+tx*f,q0[1]+ty*f],[q0[0]+tx*f+nx*d,q0[1]+ty*f+ny*d],[q0[0]+nx*d,q0[1]+ny*d]];
    if(quadFree(q)){occMark(q);mkB(q,Math.hypot(x,y),'infill')}}
}
/* building drawing */
function drawWindows(c,p){
  if(!p.win.length)return;c.globalAlpha=1;c.beginPath();for(let i=0;i<p.win.length;i++)if(!p.winCol[i])ppath(c,p.win[i]);
  c.fillStyle=p.kind==='glass'?'rgba(40,70,95,.22)':'rgba(47,45,42,.27)';c.fill();
  if(p.kind==='old'){c.beginPath();for(let i=0;i<p.win.length;i++)if(p.winCol[i])ppath(c,p.win[i]);c.fillStyle='rgba(63,122,90,.35)';c.fill()}
  c.beginPath();for(const q of p.win)ppath(c,q);pencil(c,INK,p.kind==='glass'?.22:.38,.7);c.stroke();
}
/* while the city is turning and seen from far off: shaded blocks and outlines only (the full drawing returns when it stops) */
function drawPartFast(c,p){const col=p.col||'#c9c3b5';c.globalAlpha=1;c.fillStyle=p.kind==='glass'?wash('#9cc0d4',.7):wash(shade(col,.82),.55);if(p.roof)fillPoly(c,p.roof);
  if(p.faces)for(const f of p.faces){c.fillStyle=wash(shade(col,.62+.38*f.lit),.6+.2*(1-f.lit));fillPoly(c,f.poly)}if(p.hull){c.beginPath();ppath(c,p.hull);pencil(c,INK,.5,.8);c.stroke();c.globalAlpha=1}}
function drawPart(c,p,b){
  const col=p.col,k=p.kind;J=mulberry32(p.seed);c.globalAlpha=1;const top=p.top;
  if(k==='frame'){c.globalAlpha=1;c.fillStyle=wash('#b9b4aa',.5);fillPoly(c,p.roof);c.beginPath();for(const f of p.faces){for(let v=0;v<=p.top;v+=3.6){const a=FPt(f,0,v),q=FPt(f,f.len,v);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}for(let u=0;u<=f.len;u+=Math.max(4,f.len/5)){const a=FPt(f,u,0),q=FPt(f,u,p.top);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}}pencil(c,INK,.75,1.2);c.stroke();
    const f0=p.faces[0];if(f0){const net=[FPt(f0,0,p.top*.45),FPt(f0,f0.len,p.top*.45),FPt(f0,f0.len,p.top),FPt(f0,0,p.top)];c.fillStyle='rgba(60,140,80,.32)';fillPoly(c,net);c.beginPath();for(let u=0;u<=f0.len;u+=1.2){const a=FPt(f0,u,0),q=FPt(f0,u,p.top*.6);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,'#b59a52',.45,.7);c.stroke()}return}
  c.fillStyle=k==='glass'?wash('#9cc0d4',.7):k==='old'?wash(shade(col,.9),.62):k==='bb'||k==='baitul'?wash('#f6f4ee',.9):wash(shade(col,.82),.55);fillPoly(c,p.roof);
  for(const f of p.faces){c.fillStyle=wash(shade(col,.62+.38*f.lit),.6+.2*(1-f.lit));fillPoly(c,f.poly)}
  c.beginPath();for(const f of p.faces)hatch(c,f.poly,-1.12,f.lit>.75?1.7:.95,.14);pencil(c,shade(col,.55),.3,.9);c.stroke();
  c.beginPath();for(const f of p.faces)if(f.lit<.75)hatch(c,f.poly,.5,1.4,.12);pencil(c,shade(col,.45),.24,.9);c.stroke();
  c.beginPath();hatch(c,p.roof,.35,2.3,.2);pencil(c,shade(col,.72),.22,.8);c.stroke();
  if(k==='mosque'){drawMosqueBits(c,p);}
  c.beginPath();
  for(const f of p.faces){
    if(k==='glass'){for(let u=1.6;u<f.len;u+=2.1){const a=FPt(f,u,p.z0),q=FPt(f,u,top);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}for(let v=p.z0+3.6;v<top;v+=3.6){const a=FPt(f,0,v),q=FPt(f,f.len,v);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}}
    else if(k==='bb'){for(let u=1.1;u<f.len;u+=2.2){for(const du of[0,.55]){const a=FPt(f,u+du,p.z0),q=FPt(f,u+du,top-3);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}}const a=FPt(f,0,top-3),q=FPt(f,f.len,top-3);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}
    else if(k==='sonali'){for(let v=p.z0+3.6;v<top;v+=3.6){const a=FPt(f,0,v),q=FPt(f,f.len,v);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}for(let u=1.8;u<f.len;u+=1.8){const a=FPt(f,u,p.z0+3.6),q=FPt(f,u,top);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}}
  }
  pencil(c,k==='glass'?shade(col,.5):INK,k==='glass'?.45:k==='sonali'?.45:.5,k==='sonali'?1:.8);c.stroke();
  if(k==='janata'||k==='bands'){c.beginPath();for(const f of p.faces)for(let v=p.z0+1.2;v<top-1;v+=3.6){ppath(c,[FPt(f,.5,v),FPt(f,f.len-.5,v),FPt(f,f.len-.5,v+(k==='bands'?1.4:1.8)),FPt(f,.5,v+(k==='bands'?1.4:1.8))])}c.fillStyle=k==='janata'?'rgba(60,40,30,.34)':'rgba(40,50,60,.28)';c.globalAlpha=1;c.fill()}
  if(k==='bb'){c.beginPath();for(const f of p.faces)for(let v=p.z0+1.4;v<top-4;v+=3.6)for(let u=1.75;u<f.len-.6;u+=2.2)ppath(c,[FPt(f,u,v),FPt(f,u+1.35,v),FPt(f,u+1.35,v+1.9),FPt(f,u,v+1.9)]);c.fillStyle='rgba(47,45,42,.22)';c.globalAlpha=1;c.fill()}
  if(k==='glass'){c.beginPath();for(const f of p.faces)for(let i=0;i<3;i++){const u=f.len*(.15+i*.27),v=p.z0+p.h*(.3+i*.12);const a=FPt(f,u,v),q=FPt(f,u+f.len*.12,v+p.h*.22);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}c.strokeStyle='#fbf8ef';c.globalAlpha=.7;c.lineWidth=2.4/S;c.stroke()}
  if(k==='club'&&p.stripe){c.beginPath();for(const f of p.faces)for(let u=.6;u<f.len-.6;u+=2.4)ppath(c,[FPt(f,u,p.z0),FPt(f,u+1.2,p.z0),FPt(f,u+1.2,top),FPt(f,u,top)]);c.fillStyle=p.stripe;c.globalAlpha=.5;c.fill();c.globalAlpha=1}
  if(k==='club'&&p.thana){c.beginPath();for(const f of p.faces){const a=FPt(f,0,3.6),q=FPt(f,f.len,3.6);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,'#b8432f',.8,2);c.stroke()}
  if(k!=='janata'&&k!=='sonali'&&k!=='bb'&&k!=='bands')drawWindows(c,p);
  if(k==='club'){const fp=p.q[1],b0=P3(fp,top),b1=P3(fp,top+7);c.beginPath();c.moveTo(b0[0],b0[1]);c.lineTo(b1[0],b1[1]);pencil(c,INK,.85,1.1);c.stroke();const fc1=p.thana?'#006a4e':(p.stripe||'#2e7d32'),fc2=p.thana?'#f42a41':p.col;
    c.globalAlpha=1;c.fillStyle=wash(fc1,.9);fillPoly(c,[b1,[b1[0]+2.6,b1[1]+.2],[b1[0]+2.6,b1[1]+1.7],[b1[0],b1[1]+1.5]]);if(p.thana){c.fillStyle=fc2;c.beginPath();circ(c,b1[0]+1.2,b1[1]+.85,.45);c.fill()}else{c.fillStyle=wash(fc2,.95);fillPoly(c,[[b1[0],b1[1]+.75],[b1[0]+2.6,b1[1]+.95],[b1[0]+2.6,b1[1]+1.7],[b1[0],b1[1]+1.5]])}}
  if(k==='old'){
    c.beginPath();for(const f of p.faces)for(let fl=1;fl<p.floors;fl++){const v=fl*p.fh+1.05;const a=FPt(f,.4,v),q=FPt(f,f.len-.4,v);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,INK,.4,.8);c.stroke();
    for(const i of p.laundry){const q=p.win[i];const wd=q[1][0]-q[0][0];for(let j=0;j<3;j++){c.fillStyle=rpickSeeded(SARI,i*7+j);c.globalAlpha=.85;c.fillRect(q[3][0]+j*wd/3,q[3][1]+.3,wd/3.4,.9)}}
    c.globalAlpha=1;for(const i of p.acs){const q=p.win[i];c.fillStyle=wash('#d8d6cf',.95);c.fillRect(q[0][0],q[0][1]-.2,.9,.55);c.strokeStyle=INK;c.lineWidth=.6/S;c.strokeRect(q[0][0],q[0][1]-.2,.9,.55)}
    c.beginPath();for(const[f,u,len]of p.stains){const a=FPt(f,u,top),q=FPt(f,u+.2,top-len);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,INK,.1,3);c.stroke();
  }
  if(p.posters&&p.posters.length){c.globalAlpha=1;for(const o of p.posters){const q=[FPt(o.f,o.u,o.v),FPt(o.f,o.u+o.w,o.v),FPt(o.f,o.u+o.w,o.v+o.h),FPt(o.f,o.u,o.v+o.h)];c.fillStyle=wash(o.col,.85);fillPoly(c,q);c.beginPath();ppath(c,q);pencil(c,INK,.35,.5);c.stroke()}}
  if(p.wall&&VEC&&S>9){const m=FPt(p.wall.f,p.wall.u+1.5,1.4);screenText(c,m[0],m[1],LANG==='en'?p.wall.t[1]:p.wall.t[0],.42*S,'rgba(40,40,40,.75)',LANG==='en'?F_EN:F_BN,'left')}
  if(k==='plinth'){c.beginPath();for(const f of p.faces)for(let v=.5;v<p.top;v+=.5){const a=FPt(f,0,v),q=FPt(f,f.len,v);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,INK,.35,.7);c.stroke()}
  if(k==='baitul'){c.beginPath();for(const f of p.faces)for(let v=p.z0+3.7;v<top;v+=3.7){const a=FPt(f,0,v),q=FPt(f,f.len,v);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,INK,.3,.8);c.stroke();
    c.beginPath();for(const f of p.faces){const a=FPt(f,0,top-1.2),q=FPt(f,f.len,top-1.2);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,INK,.6,1.2);c.stroke()}
  if(k==='portico'||k==='arcade'){for(const f of p.faces){const arches=k==='portico'?[[.18,2.6,5.4],[.5,3.6,7.4],[.82,2.6,5.4]]:[];if(k==='arcade')for(let u=2;u<f.len-1.5;u+=3.6)arches.push([u/f.len,2.6,4.6]);
      for(const[fr,w,h]of arches){const u=f.len*fr,a0=FPt(f,u-w/2,p.z0),a1=FPt(f,u+w/2,p.z0),s0=FPt(f,u-w/2,p.z0+h-w/2),s1=FPt(f,u+w/2,p.z0+h-w/2),tp=FPt(f,u,p.z0+h+w*.15);c.beginPath();c.moveTo(a0[0],a0[1]);c.lineTo(s0[0],s0[1]);c.quadraticCurveTo(tp[0]+(s0[0]-s1[0])*0,tp[1],s1[0],s1[1]);c.lineTo(a1[0],a1[1]);c.closePath();c.fillStyle='rgba(47,45,42,.32)';c.globalAlpha=1;c.fill();pencil(c,INK,.6,.8);c.stroke()}}
    if(k==='portico'){const cc=qCenter(p.q);dome(c,P3(cc,top),3.4,1.1,'#f2f0ea')}}
  if(k==='ndc'){c.beginPath();for(const f of p.faces){for(let u=1;u<f.len;u+=2.4){const a=FPt(f,u,p.z0),q=FPt(f,u,top);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}for(let v=3.6;v<top;v+=3.6){const a=FPt(f,0,v),q=FPt(f,f.len,v);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}}pencil(c,'#f4f0e6',.9,2.2);c.stroke()}
  if(k==='school'){c.beginPath();for(const f of p.faces)for(let v=p.z0+3.4;v<top;v+=3.4){const a=FPt(f,0,v+.9),q=FPt(f,f.len,v+.9);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1]);for(let u=.6;u<f.len;u+=.8){const b0=FPt(f,u,v),b1=FPt(f,u,v+.9);c.moveTo(b0[0],b0[1]);c.lineTo(b1[0],b1[1])}}pencil(c,INK,.4,.7);c.stroke()}
  for(const s of p.signs){const f=s.f;
    if(s.shutter){const sh=[FPt(f,s.u0+.2,0),FPt(f,s.u1-.2,0),FPt(f,s.u1-.2,2.6),FPt(f,s.u0+.2,2.6)];c.globalAlpha=1;c.fillStyle=wash('#8a8a86',.55);fillPoly(c,sh);c.beginPath();for(let v=.3;v<2.6;v+=.35){const a=FPt(f,s.u0+.2,v),q=FPt(f,s.u1-.2,v);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,INK,.25,.6);c.stroke()}
    const bd=[FPt(f,s.u0,s.v0),FPt(f,s.u1,s.v0),FPt(f,s.u1,s.v1),FPt(f,s.u0,s.v1)];c.globalAlpha=1;c.fillStyle=wash(s.col,.82);fillPoly(c,bd);c.beginPath();ppath(c,bd);pencil(c,INK,.6,.8);c.stroke();
    if(VEC&&S>7&&!s.vert){const m=FPt(f,(s.u0+s.u1)/2,(s.v0+s.v1)/2);screenText(c,m[0],m[1],LANG==='en'?s.t[1]:s.t[0],Math.min((s.v1-s.v0)*.6*S,(s.u1-s.u0)*S/(s.t[0].length*.55)),'#fbf8ef',LANG==='en'?F_EN:F_BN)}}
  if(p.shed){const sq=[qPoint(p.q,p.shed.u,p.shed.v),qPoint(p.q,p.shed.u+p.shed.w,p.shed.v),qPoint(p.q,p.shed.u+p.shed.w,p.shed.v+p.shed.w),qPoint(p.q,p.shed.u,p.shed.v+p.shed.w)].map(q=>P3(q,top+2.4));c.globalAlpha=1;c.fillStyle=wash(p.shed.col,.75);fillPoly(c,sq);c.beginPath();hatch(c,sq,.2,.5,.03);pencil(c,shade(p.shed.col,.6),.5,.7);c.stroke();c.beginPath();ppath(c,sq);pencil(c,INK,.7,.9);c.stroke()}
  for(const t of p.tanks){pencil(c,INK,.7,.8);cyl(c,t.x,t.y,t.r,top,top+t.h,'#2b2b2b')}
  if(p.dish){const q=P3(p.dish,top+1);c.beginPath();c.ellipse(q[0],q[1],.8,.5,-.5,0,TAU);c.fillStyle=wash('#cfcac0',.9);c.globalAlpha=1;c.fill();pencil(c,INK,.6,.7);c.stroke()}
  if(p.mast){const b0=P3(p.mast,top),tp=P3(p.mast,top+13);c.beginPath();c.moveTo(b0[0]-1,b0[1]);c.lineTo(tp[0],tp[1]);c.lineTo(b0[0]+1,b0[1]);for(let z=2;z<13;z+=2){const w=1*(1-z/13);const a=P3(p.mast,top+z);c.moveTo(a[0]-w,a[1]);c.lineTo(a[0]+w,a[1])}pencil(c,INK,.7,.8);c.stroke()}
  if(p.billboard){const bb=p.billboard,f=bb.f;const Q=(u,z)=>FPt(f,u,z);c.beginPath();for(const u of[bb.u0+1,bb.u1-1]){const a=Q(u,top),q=Q(u,top+2);c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1])}pencil(c,INK,.7,1.1);c.stroke();
    const q=[Q(bb.u0,top+2),Q(bb.u1,top+2),Q(bb.u1,top+2+bb.h),Q(bb.u0,top+2+bb.h)];c.globalAlpha=1;c.fillStyle=wash('#f8f4ea',1);fillPoly(c,q);
    c.fillStyle=wash(bb.col,.75);fillPoly(c,[Q(bb.u0,top+2),Q(bb.u0+(bb.u1-bb.u0)*.35,top+2),Q(bb.u0+(bb.u1-bb.u0)*.25,top+2+bb.h),Q(bb.u0,top+2+bb.h)]);
    c.beginPath();spoly(c,q,.2);pencil(c,INK,.8,1);c.stroke();
    if(VEC){const m=Q(bb.u0+(bb.u1-bb.u0)*.63,top+2+bb.h/2);screenText(c,m[0],m[1],LANG==='en'?bb.ad[1]:bb.ad[0],Math.min(bb.h*.28*S,(bb.u1-bb.u0)*.6*S/Math.max(6,bb.ad[0].length*.5)),shade(bb.col,.7),LANG==='en'?F_EN:F_BN,'center','600')}}
  J=mulberry32(p.seed+BOIL*101);c.beginPath();for(const f of p.faces)spoly(c,f.poly,.22);spoly(c,p.roof,.22);pencil(c,INK,.85,1.15);c.stroke();
  if(b&&b.spire&&p===b.parts[b.parts.length-1]){const cc=qCenter(p.q),a=P3(cc,top),q=P3(cc,top+b.spire);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1]);pencil(c,INK,.9,1.6);c.stroke()}
  if(p.topSign&&VEC&&p.faces[0]){const f=p.faces.reduce((a,b)=>a.len>b.len?a:b);const m=FPt(f,f.len/2,top-2.2);screenText(c,m[0],m[1],LANG==='en'?p.topSign[1]:p.topSign[0],Math.min(1.7*S,f.len*S/9),shade(col,.35),LANG==='en'?F_EN:F_BN,'center','600')}
}
function rpickSeeded(a,n){return a[Math.floor(mulberry32(n)()*a.length)]}
/* screen-upright dome at a projected base point: r = half width (m), k = height ratio */
function dome(c,base,r,k,col){const U=(u,h)=>[base[0]+RXW*u+KX*h,base[1]+RYW*u-KZ*h];const a=U(-r,0),b=U(r,0),c1=U(-r,r*k),c2=U(r,r*k),tp=U(0,r*k*.95),sp=U(0,r*k*1.3);
  c.beginPath();c.moveTo(a[0],a[1]);c.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],b[0],b[1]);c.closePath();c.fillStyle=wash(col,.75);c.globalAlpha=1;c.fill();pencil(c,INK,.8,1.1);c.stroke();c.beginPath();c.moveTo(tp[0],tp[1]);c.lineTo(sp[0],sp[1]);c.stroke()}
function drawMosqueBits(c,p){
  const top=p.top,cc=qCenter(p.q),base=P3(cc,top),r=6;dome(c,base,r,1.25,'#4f9a6a');
  const m=p.q[2];pencil(c,INK,.8,.9);cyl(c,m[0],m[1],1.1,0,26,'#e8ece6');cyl(c,m[0],m[1],1.6,20,21,'#e8ece6');
  const mt=P3(m,26);dome(c,mt,1.1,2.2,'#4f9a6a');
  p.minaret=[mt[0],mt[1]-2];
}
const SS=3;let spriteBudget=0;
/* building images are made on demand and capped; the one drawn longest ago goes first, so memory stays bounded on phones */
const SPR={set:new Set(),frame:0,made:0,cap:(innerWidth<700||(navigator.deviceMemory&&navigator.deviceMemory<=4))?260:700};
function dropSprite(b){if(b.mip)for(const m of b.mip){m.width=0;m.height=0}b.mip=null;b.spr=null;SPR.set.delete(b)}
function evictSprites(){while(SPR.set.size>SPR.cap){let old=null;for(const b of SPR.set)if(!old||b.sprT<old.sprT)old=b;if(!old||old.sprT>=SPR.frame)break;dropSprite(old)}}   // never one that is on screen this frame
function primeSprites(){const fx=cam.x,fy=cam.y;const near=buildings.map(b=>({b,d:Math.hypot((b.bb[0]+b.bb[2])/2-fx,(b.bb[1]+b.bb[3])/2-fy)})).sort((a,b)=>a.d-b.d).slice(0,SPR.cap>>1);for(const o of near)if(!o.b.spr)makeSprite(o.b)}   // the buildings around the first view; the rest appear as you go
function makeSprite(b){
  const[x0,y0,x1,y1]=b.bb,w=Math.ceil((x1-x0)*SS),h=Math.ceil((y1-y0)*SS);const cvs=document.createElement('canvas');cvs.width=w;cvs.height=h;const c=cvs.getContext('2d');
  c.setTransform(SS,0,0,SS,-x0*SS,-y0*SS);const oS=S,oV=VEC,oB=BOIL;S=SS;VEC=false;BOIL=0;for(const p of b.parts)drawPart(c,p,b);S=oS;VEC=oV;BOIL=oB;
  b.mip=[cvs];let src=cvs;for(let i=0;i<2;i++){const m=document.createElement('canvas');m.width=Math.max(1,src.width>>1);m.height=Math.max(1,src.height>>1);m.getContext('2d').drawImage(src,0,0,m.width,m.height);b.mip.push(m);src=m}
  b.spr=cvs;b.sprT=SPR.frame;SPR.set.add(b);SPR.made++;if(SPR.set.size>SPR.cap)evictSprites();
}

