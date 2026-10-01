/* ---------- Kamalapur Railway Station ---------- */
let train={a:-40,dir:1,wait:0,state:'in'};
function genKamalapur(){
  let F=null;for(const[r,dg]of[[330,32],[350,40],[320,50],[360,20],[300,60]]){F=reserveSite(r,dg,100,100);if(F)break}if(!F)return;sites.kamalapur=F;paintPlaza(F,'#d9d4c6');
  paintRect(F,0,F.L,82,100,'#8a8278',.55,c=>{c.strokeStyle='#5a534a';c.globalAlpha=.8;c.lineWidth=.12;c.beginPath();for(const b of[84,85.4,90,91.4,96,97.4]){const p0=FW(F,-60,b),p1=FW(F,F.L+60,b);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}c.stroke();
    c.globalAlpha=.35;c.beginPath();for(let a=-60;a<F.L+60;a+=1.2)for(const b of[84,90,96]){const p0=FW(F,a,b-.4),p1=FW(F,a,b+1.8);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}c.stroke()});
  paintRect(F,14,86,80,83,'#c9c3b5',.8);
  const st={F,depth:()=>D(...FW(F,50,80)),kind:'station'};specials.push(st);
  st.bb=()=>{const pts=[FW(F,17,14),FW(F,83,14),FW(F,17,80),FW(F,83,80)];let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts)for(const z of[0,22]){const q=P3(p,z);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}return[x0,y0,x1,y1]};
  st.draw=drawStation;
  const tr={F,kind:'train',depth:()=>D(...FW(F,50,97)),bb:()=>{const p=FW(F,F.L/2,90);return[p[0]-120,p[1]-120,p[0]+120,p[1]+120]},draw:drawTrains};specials.push(tr);
  addCrowd(F,[[6,94,2,12],[20,80,16,78]],()=>Math.random()<.18?coolie():traveller(),()=>(HOUR<5||HOUR>23.5?15:95)*(FRIDAY?.8:1));
  addBuilding([{q:FQ(F,88,99,16,40),h:6,kind:'mosque',col:'#e8ece6'}],{mosque:true});
}
function drawStation(c,lod){const F=this.F,n=6,cell=11,a0=17,b0=14,H=17;pencil(c,INK,.85,1);
  // floor shade and life under the roof
  c.globalAlpha=1;c.fillStyle='rgba(60,55,50,.18)';fillPoly(c,FQ(F,a0,a0+n*cell,b0,b0+n*cell));
  if(lod>0){for(let i=0;i<5;i++){const p=FW(F,a0+8+i*14,b0+n*cell-8);obox(c,p[0],p[1],F.t[0],F.t[1],6,2,0,2.4,wash('#2f5f8a',.7),wash('#2f5f8a',.85),wash('#2f5f8a',.8))}}
  // columns with four branches
  c.beginPath();for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const g=FW(F,a0+i*cell,b0+j*cell),bt=P3(g,0),tp=P3(g,H-3.5);c.moveTo(bt[0],bt[1]);c.lineTo(tp[0],tp[1]);
    if(lod>0)for(const[da,db]of[[1,1],[1,-1],[-1,1],[-1,-1]]){const e=P3([g[0]+(F.t[0]*da+F.n[0]*db)*3.2,g[1]+(F.t[1]*da+F.n[1]*db)*3.2],H);c.moveTo(tp[0],tp[1]);c.lineTo(e[0],e[1])}}
  pencil(c,INK,.8,lod>1?1.8:1.1);c.stroke();
  // 36 shallow concrete shells: arched edges rising to a crown
  const cells=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++){const m=FW(F,a0+(i+.5)*cell,b0+(j+.5)*cell);cells.push({i,j,d:D(m[0],m[1])})}cells.sort((a,b)=>a.d-b.d);
  for(const cl of cells){const A=a0+cl.i*cell,B=b0+cl.j*cell,cr=[[A,B],[A+cell,B],[A+cell,B+cell],[A,B+cell]].map(([a,b])=>FW(F,a,b)),ctr=FW(F,A+cell/2,B+cell/2);
    const tp=P3(ctr,H+3.2),edge=k=>{const p=cr[k],q=cr[(k+1)%4];return P3([(p[0]+q[0])/2,(p[1]+q[1])/2],H+2.4)};
    const CC=cr.map(q=>P3(q,H));c.beginPath();c.moveTo(CC[0][0],CC[0][1]);for(let k=0;k<4;k++){const e=edge(k),a=CC[k],q=CC[(k+1)%4];c.quadraticCurveTo(2*e[0]-(a[0]+q[0])/2,2*e[1]-(a[1]+q[1])/2,q[0],q[1])}c.closePath();
    c.fillStyle=wash('#e9e6de',.95);c.globalAlpha=1;c.fill();pencil(c,INK,.75,1);c.stroke();
    if(lod>0){c.beginPath();for(let k=0;k<4;k++){const e=edge(k);c.moveTo(e[0],e[1]);c.quadraticCurveTo((e[0]+tp[0])/2,(e[1]+tp[1])/2-.4,tp[0],tp[1])}pencil(c,INK,.3,.8);c.stroke();
      c.beginPath();hatch(c,[P3(cr[1],H),P3(cr[2],H),tp],-1.1,.9,.05);pencil(c,'#8a8478',.28,.8);c.stroke()}}
  if(lod>0){const m=P3(FW(F,a0+n*cell/2,b0-1),H+6);screenText(c,m[0],m[1],LANG==='en'?'Kamalapur Railway Station':'কমলাপুর রেলওয়ে স্টেশন',clamp(1.8*S,15,26),'#b8432f',LANG==='en'?F_EN:F_BN,'center','600')}
}
function updTrain(dt){if(!sites.kamalapur)return;const F=sites.kamalapur;
  if(train.state==='in'){train.a+=dt*6*train.dir;if(train.a>18){train.state='stop';train.wait=mr(25,45);sfx('sfx_train_horn',...FW(F,train.a,86),1)}}
  else if(train.state==='stop'){train.wait-=dt;if(train.wait<=0){train.state='out';sfx('sfx_train_horn',...FW(F,train.a,86),1)}}
  else{train.a+=dt*7;if(train.a>F.L+80){train.a=-170;train.state='in'}}}
function drawTrains(c,lod){const F=this.F;pencil(c,INK,.75,.9);
  const coach=(a,b,col,loco)=>{const p=FW(F,a,b);obox(c,p[0],p[1],F.t[0],F.t[1],loco?16:19,3,.7,4.1,wash(col,.55),wash(shade(col,.8),.85),wash(col,.75));if(lod>1){const P=(u,z)=>[p[0]+F.t[0]*u-F.n[0]*1.51+KX*z,p[1]+F.t[1]*u-F.n[1]*1.51-KZ*z];c.fillStyle='rgba(40,45,50,.55)';for(let u=-8;u<7;u+=1.8)fillPoly(c,[P(u,2.2),P(u+1.1,2.2),P(u+1.1,3.2),P(u,3.2)])}};
  for(let k=0;k<5;k++)coach(-10+k*20,91.5,k%3===2?'#8a3f3f':'#2f6b4f',false);
  for(let k=0;k<8;k++){const a=train.a-k*20;if(a<-70||a>F.L+70)continue;coach(a,85.5,k===0?'#e07b28':'#2f5f8a',k===0)}
  for(let k=0;k<4;k++)coach(5+k*20,97.5,'#6b3f2f',false);
}
