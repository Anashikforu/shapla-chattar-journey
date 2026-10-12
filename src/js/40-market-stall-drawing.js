/* ---------------- market stall drawing ---------------- */
function mpickSeeded(a,n){return a[Math.floor(Math.abs(Math.sin(n*12.9898)*43758.5453)%1*a.length)]}
function drawStall(c,st,lod){
  const{x,y,tx,ty,nx,ny,w,d,type}=st,G=st.goods;J=mulberry32(st.seed+BOIL);
  const pt=(a,b,z)=>[x+tx*a+nx*b+KX*z,y+ty*a+ny*b-KZ*z];
  const quad=(a0,a1,b0,b1,z0,z1)=>z0===z1?[pt(a0,b0,z0),pt(a1,b0,z0),pt(a1,b1,z1),pt(a0,b1,z1)]:[pt(a0,b0,z0),pt(a1,b0,z0),pt(a1,b0,z1),pt(a0,b0,z1)];
  const bx=(a,b,L,D,z0,z1,col)=>obox(c,x+tx*a+nx*b,y+ty*a+ny*b,tx,ty,L,D,z0,z1,wash(col,.5),wash(shade(col,.75),.8),wash(col,.7));
  const dot=(a,b,z,r,col)=>{const p=pt(a,b,z);c.fillStyle=col;c.beginPath();circ(c,p[0],p[1],r);c.fill()};
  c.globalAlpha=1;
  if(!st.open){if(lod===0)return;pencil(c,INK,.6,.8);bx(0,0,Math.max(w,1),d,0,.75,st.canCol);if(lod>1){c.beginPath();const a=pt(-w/2,0,.75),b=pt(w/2,0,.75);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);pencil(c,'#c9b27a',.8,1);c.stroke()}return}
  if(lod===0){c.fillStyle=st.can==='tarp'?st.canCol:st.can==='umb'?st.umb[0]:G[0];fillPoly(c,quad(-w/2,w/2,-d/2,d/2+(st.can?1.1:0),0,0));return}
  if(lod===1){pencil(c,INK,.6,.8);const th=['shoes','book','paper','flower','toys','shoe'].includes(type)?.12:.8;bx(0,0,Math.max(w,.6),d,0,th,STALL[type].col);c.fillStyle=wash(type==='cloth'||type==='shoes'?G[3]:G[0],.85);fillPoly(c,quad(-w*.4,w*.4,-d*.3,d*.3,th+.01,th+.01));
    drawPerson(c,st.hawker,st.hawker.x,st.hawker.y,1);
    if(st.can==='tarp'){c.globalAlpha=.9;c.fillStyle=wash(st.canCol,.62);fillPoly(c,[pt(-w/2-.3,-d/2-.25,2.4),pt(w/2+.3,-d/2-.25,2.4),pt(w/2+.3,d/2+1.25,2.05),pt(-w/2-.3,d/2+1.25,2.05)]);c.globalAlpha=1}
    else if(st.can==='umb'){const ca=pt(0,d*.25,2.55);c.fillStyle=wash(st.umb[0],.85);c.beginPath();circ(c,ca[0],ca[1],1.45);c.fill()}return}
  const h=st.hawker,hb=D(h.x,h.y)<D(x,y);h.fc=sdir(nx,ny)>=0?1:-1;if(hb)drawPerson(c,h,h.x,h.y,lod);
  pencil(c,INK,.72,.9);const near=lod>1;
  switch(type){
  case 'tea':{bx(0,0,w,d,0,1.05,'#8a6a4a');const k=pt(w*.28,0,1.05);cyl(c,x+tx*w*.28,y+ty*w*.28,.22,1.05,1.3,'#8a4a2a');cyl(c,x+tx*w*.28,y+ty*w*.28,.17,1.3,1.55,'#6b6b6b');
    for(const o of[-.55,-.25,.05]){const j=pt(o,-d*.2,1.05);c.fillStyle='rgba(200,220,230,.75)';c.fillRect(j[0]-.1,j[1]-.28,.2,.28)}
    const bn=pt(-w*.4,-d*.3,1.8);c.fillStyle='#e0c040';c.beginPath();c.ellipse(bn[0],bn[1],.14,.3,0,0,TAU);c.fill();
    bx(0,d/2+.75,2.1,.35,.38,.46,'#8a6a4a');
    if(near){c.beginPath();for(let i=0;i<3;i++){const t=(simT*.6+i/3)%1,sx=k[0]+KX*(.4+t*1.3)+Math.sin(t*6+i)*.12,sy=k[1]-KZ*(.4+t*1.3);c.moveTo(sx,sy);c.quadraticCurveTo(sx+.15,sy-.2,sx,sy-.4)}pencil(c,INK2,.45,.9);c.stroke()}
    break}
  case 'fruit':case 'van':case 'dab':{
    if(type==='fruit')bx(0,0,w,d,0,.8,'#8a6a4a');else{bx(0,0,w,d,.5,.66,'#8a6a4a');for(const a of[-w*.35,w*.35]){const p=pt(a,d/2,.28);c.beginPath();circ(c,p[0],p[1],.28);pencil(c,INK,.8,.9);c.stroke()}}
    const zt=type==='fruit'?.8:.66,np=type==='dab'?1:Math.max(2,Math.round(w/.6));
    for(let i=0;i<np;i++){const a0=-w/2+w*(i+.5)/np,col=type==='dab'?'#6e9a3a':G[i%3];for(let row=0;row<3;row++)for(let k=0;k<4-row;k++){const a=a0+(k-(3-row)/2)*.13,b=(J()-.5)*d*.5;dot(a,b,zt+.12+row*.13,type==='dab'?.19:.085,wash(col,.95))}}
    if(near&&type==='fruit'){const bn=pt(w*.3,-d*.2,2);c.fillStyle='#e8c33a';c.beginPath();c.ellipse(bn[0],bn[1],.16,.34,.2,0,TAU);c.fill();c.beginPath();c.ellipse(bn[0]+.3,bn[1]+.05,.14,.3,-.2,0,TAU);c.fill()}
    break}
  case 'cloth':{bx(0,0,w,d,0,.7,'#6b6b6b');for(let i=0;i<5;i++){const a=-w/2+w*(i+.5)/5;const q=[pt(a-.2,0,.7),pt(a+.2,0,.7),pt(a+.2,0,.9),pt(a-.2,0,.9)];c.fillStyle=wash(mpickSeeded(SARI,st.seed+i),.85);fillPoly(c,q)}
    c.beginPath();for(const a of[-w/2,w/2]){const p0=pt(a,-d/2,0),p1=pt(a,-d/2,2.1);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}const r0=pt(-w/2,-d/2,2.1),r1=pt(w/2,-d/2,2.1);c.moveTo(r0[0],r0[1]);c.lineTo(r1[0],r1[1]);pencil(c,INK,.8,.9);c.stroke();
    for(let i=0;i<7;i++){const a=-w/2+.2+i*(w-.4)/6,sw=Math.sin(simT*1.3+i)*.04;const q=[pt(a-.2+sw,-d/2,2.05),pt(a+.2+sw,-d/2,2.05),pt(a+.26+sw,-d/2,1.25),pt(a-.26+sw,-d/2,1.25)];c.fillStyle=wash(mpickSeeded(i%2?SHIRT:SARI,st.seed*3+i),.9);fillPoly(c,q);if(near){c.beginPath();ppath(c,q);pencil(c,INK,.4,.6);c.stroke()}}
    break}
  case 'singara':{bx(0,0,w,d,0,.85,'#8a6a4a');const kc=pt(w*.25,0,.95);c.fillStyle='#2b2b2b';c.beginPath();c.ellipse(kc[0],kc[1],.42,.26,0,0,TAU);c.fill();c.fillStyle='rgba(200,140,40,.85)';c.beginPath();c.ellipse(kc[0],kc[1]-.03,.34,.19,0,0,TAU);c.fill();
    if(near){const f=pt(w*.25,0,.55);const fl=.12+Math.random()*.08;c.fillStyle='#f39c12';c.beginPath();c.moveTo(f[0]-.2,f[1]);c.lineTo(f[0],f[1]-fl*2);c.lineTo(f[0]+.2,f[1]);c.fill();
      c.beginPath();for(let i=0;i<3;i++){const t=(simT*.5+i/3)%1;c.moveTo(kc[0]+Math.sin(t*5+i)*.2,kc[1]-t*1.3);c.lineTo(kc[0]+Math.sin(t*5+i+1)*.2,kc[1]-t*1.3-.3)}pencil(c,INK2,.35,.9);c.stroke()}
    for(let i=0;i<9;i++){const p=pt(-w*.3+(i%3)*.18,-d*.1+((i/3)|0)*.16,.9);c.fillStyle=wash('#c98a3a',.95);c.beginPath();c.moveTo(p[0]-.08,p[1]+.05);c.lineTo(p[0],p[1]-.1);c.lineTo(p[0]+.08,p[1]+.05);c.fill()}break}
  case 'fuchka':case 'cutfruit':{bx(0,0,w,d,.35,.95,type==='fuchka'?'#b8432f':'#3f5f8a');for(const a of[-w*.35,w*.35]){const p=pt(a,d/2,.25);c.beginPath();circ(c,p[0],p[1],.24);pencil(c,INK,.8,.9);c.stroke()}
    const gl=quad(-w*.4,w*.4,0,0,.95,1.5);c.fillStyle='rgba(190,220,235,.55)';fillPoly(c,gl);
    for(let i=0;i<10;i++){const p=pt(-w*.35+i*w*.07,0,1.05+(i%2)*.12);c.fillStyle=type==='fuchka'?'#d9b36a':mpickSeeded(['#f2c14e','#9bc53d','#f4a261','#e76f51'],i+st.seed);c.fillRect(p[0]-.07,p[1]-.07,.14,.12)}
    c.beginPath();ppath(c,gl);pencil(c,INK,.5,.7);c.stroke();break}
  case 'jhalmuri':{bx(0,0,w,d,0,.8,'#6b4a32');cyl(c,x+tx*.2,y+ty*.2,.22,.8,1.25,'#c0392b');for(const a of[-.35,-.1]){const p=pt(a,.1,.85);c.fillStyle='#d9b36a';c.beginPath();c.ellipse(p[0],p[1],.12,.07,0,0,TAU);c.fill()}break}
  case 'akh':{bx(0,0,w,d,.3,1.1,'#2e7d32');const wc=pt(-w*.3,d/2+.05,1.1);const a=simT*3;c.beginPath();c.ellipse(wc[0],wc[1],.45,.45,0,0,TAU);c.moveTo(wc[0],wc[1]);c.lineTo(wc[0]+Math.cos(a)*.45,wc[1]+Math.sin(a)*.45);pencil(c,INK,.85,1.1);c.stroke();
    c.beginPath();for(let i=0;i<7;i++){const p0=pt(w/2+.1+i*.06,-d/2,0),p1=pt(w/2+.25+i*.06,-d/2,2.3);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}pencil(c,'#7a8a3a',.9,1.6);c.stroke();
    for(const o of[.1,.3]){const g=pt(o,0,1.1);c.fillStyle='rgba(190,200,120,.85)';c.fillRect(g[0]-.06,g[1]-.18,.12,.18)}break}
  case 'shoes':case 'book':case 'paper':{const q=quad(-w/2-.4,w/2+.4,-d/2,d/2,0,0);c.fillStyle=wash(type==='shoes'?'#c0392b':'#3f5f8a',.35);fillPoly(c,q);J=mulberry32(st.seed);
    for(let i=0;i<12;i++){const a=(J()-.5)*w*1.1,b=(J()-.5)*d*.8,p=pt(a,b,0);if(type==='shoes'){c.fillStyle=mpickSeeded(['#3a2f28','#6b4a32','#1c1c1c','#8a3f3f'],i+st.seed);c.fillRect(p[0]-.12,p[1]-.05,.1,.2);c.fillRect(p[0]+.02,p[1]-.05,.1,.2)}else{c.fillStyle=type==='paper'?wash('#e9e4d6',1):wash(mpickSeeded(SIGNCOL,i+st.seed),.7);c.fillRect(p[0]-.18,p[1]-.13,.36,.26)}}break}
  case 'cover':case 'sim':{bx(0,0,w,d,0,.85,type==='sim'?'#e0a526':'#8a8a86');const bd=quad(-w*.45,w*.45,-d/2,-d/2,.85,2);c.fillStyle=wash('#f2efe6',1);fillPoly(c,bd);
    for(let i=0;i<12;i++){const a=-w*.4+(i%4)*w*.26,z=1+((i/4)|0)*.32;const p=pt(a,-d/2,z);c.fillStyle=mpickSeeded(SARI,i+st.seed);c.fillRect(p[0],p[1]-.2,.14,.22)}c.beginPath();ppath(c,bd);pencil(c,INK,.6,.7);c.stroke();break}
  case 'flower':{for(let i=0;i<4;i++){const a=-w/2+.2+i*.3;cyl(c,x+tx*a,y+ty*a,.14,0,.45,'#3f5f8a',false);for(let k=0;k<5;k++)dot(a+(J()-.5)*.25,(J()-.5)*.2,.5+J()*.35,.07,mpickSeeded(['#d81b60','#f9a825','#e53935','#fdfdfd','#ff7043'],i*5+k))}break}
  case 'toys':{const s0=pt(0,0,0),s1=pt(0,0,2.2);c.beginPath();c.moveTo(s0[0],s0[1]);c.lineTo(s1[0],s1[1]);pencil(c,INK,.8,.9);c.stroke();
    for(let i=0;i<9;i++){const a=Math.sin(i*2.4)*.55,z=2.2+Math.cos(i*1.7)*.35+.3+Math.sin(simT*1.4+i)*.04;const p=pt(a,Math.cos(i*3.1)*.2,z);c.beginPath();c.moveTo(s1[0],s1[1]);c.lineTo(p[0],p[1]+.2);pencil(c,INK,.3,.5);c.stroke();c.fillStyle=mpickSeeded(['#e53935','#fdd835','#43a047','#1e88e5','#8e24aa','#ff7043'],i);c.beginPath();c.ellipse(p[0],p[1],.2,.25,0,0,TAU);c.fill()}break}
  case 'pan':{bx(0,0,w,d,0,.75,'#6b4a32');for(let i=0;i<5;i++)dot(-w*.35+i*.18,0,.8,.09,'#4f8a3a');for(const a of[.35,.5]){const j=pt(a,-.1,.75);c.fillStyle='rgba(200,220,230,.8)';c.fillRect(j[0]-.06,j[1]-.2,.12,.2)}break}
  case 'shoe':bx(0,0,w,d,0,.35,'#6b4a32');break;
  case 'counter':{bx(0,0,w,d,0,2.4,st.cCol||'#1f4f8b');const bd=quad(-w/2-.4,w/2+.4,-d/2,-d/2,2.6,3.5);c.fillStyle=wash(st.cCol||'#1f4f8b',.85);fillPoly(c,bd);c.beginPath();ppath(c,bd);c.stroke();if(lod>1&&st.name){const m=pt(0,-d/2,3.05);screenText(c,m[0],m[1],LANG==='en'?st.name[1]:st.name[0],.38*S,'#fbf8ef',LANG==='en'?F_EN:F_BN,'center','600')}break}
  case 'hotel':{bx(-w*.25,0,w*.5,d,0,.9,'#8a6a4a');cyl(c,x-tx*w*.35,y-ty*w*.35,.45,.9,1.5,'#9a9a92');const tw=pt(-w*.1,0,.95);c.fillStyle='#2b2b2b';c.beginPath();c.ellipse(tw[0],tw[1],.4,.25,0,0,TAU);c.fill();
    for(let i=0;i<3;i++){const p=pt(-w*.1+(i-1)*.14,.05,1);c.fillStyle='#e8c98a';c.beginPath();circ(c,p[0],p[1],.12);c.fill()}
    bx(w*.28,d/2+.3,1.6,.7,.7,.78,'#b24b4b');for(const k2 of[-.55,.55])bx(w*.28+k2,d/2+1,.3,.3,0,.45,'#3f5f8a');
    if(near){c.beginPath();for(let i=0;i<3;i++){const t=(simT*.5+i/3)%1,sx=tw[0]+Math.sin(t*5+i)*.2,sy=tw[1]-t*1.6;c.moveTo(sx,sy);c.lineTo(sx+.1,sy-.35)}pencil(c,INK2,.35,.9);c.stroke()}break}
  case 'grill':{bx(0,0,w,d,0,.9,'#6b4a32');const g=quad(-w*.4,w*.4,-.2,.2,.92,.92);c.fillStyle='#3a2f28';fillPoly(c,g);c.fillStyle='#e67e22';for(let i=0;i<6;i++){const p=pt(-w*.35+i*w*.14,0,.95);c.fillRect(p[0]-.04,p[1]-.2,.08,.2)}
    if(near){c.beginPath();for(let i=0;i<4;i++){const t=(simT*.4+i/4)%1,p=pt(-w*.2+i*.3,0,1+t*2.5);c.moveTo(p[0],p[1]);c.quadraticCurveTo(p[0]+.3,p[1]-.3,p[0],p[1]-.6)}pencil(c,INK2,.3,1.2);c.stroke()}break}
  case 'sweets':{bx(0,0,w,d,0,1.3,'#8a6a4a');const gl=quad(-w*.45,w*.45,d/2,d/2,.35,1.25);c.fillStyle='rgba(190,220,235,.6)';fillPoly(c,gl);for(let i=0;i<12;i++){const p=pt(-w*.4+(i%6)*w*.16,d/2,.5+((i/6)|0)*.4);c.fillStyle=mpickSeeded(['#f4f1ea','#c98a3a','#e8c98a','#d4a0a0','#8a5a3a'],i+st.seed);c.beginPath();circ(c,p[0],p[1],.09);c.fill()}break}
  case 'attar':{bx(0,0,w,d,0,.85,'#6b4a32');for(let i=0;i<10;i++){const p=pt(-w*.4+i*w*.09,0,.9);c.fillStyle=mpickSeeded(['#d4af37','#6aa84f','#bf1f1f','#4f86bd'],i+st.seed);c.fillRect(p[0]-.03,p[1]-.14,.06,.14)}
    for(let i=0;i<4;i++){const p=pt(-w*.3+i*.3,-d*.3,1.1);c.fillStyle='#f4f1ea';c.beginPath();c.arc(p[0],p[1],.13,Math.PI,TAU);c.fill()}const pm=quad(-w/2-.3,-w/2+.3,-d/2,-d/2,.2,1.7);c.fillStyle=wash('#2e7d32',.8);fillPoly(c,pm);break}
  }
  if(!hb)drawPerson(c,h,h.x,h.y,lod);
  if(st.can==='tarp'){const lo=st.curb?0:-d/2-.25,hi=d/2+1.25;const q=[pt(-w/2-.3,lo,2.4),pt(w/2+.3,lo,2.4),pt(w/2+.3,hi,2.05),pt(-w/2-.3,hi,2.05)];
    c.beginPath();for(const a of[-w/2-.25,w/2+.25]){const p0=pt(a,hi-.05,0),p1=pt(a,hi-.05,2.05);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}pencil(c,INK,.7,.9);c.stroke();
    c.globalAlpha=.9;c.fillStyle=wash(st.canCol,.62);fillPoly(c,q);c.globalAlpha=1;if(near){c.beginPath();hatch(c,q,.9,.55,.04);pencil(c,shade(st.canCol,.6),.3,.7);c.stroke()}c.beginPath();spoly(c,q,.05);pencil(c,INK,.6,.8);c.stroke()}
  else if(st.can==='umb'){const cz=2.55,ca=pt(0,d*.25,cz),r=1.45,b0=pt(0,d*.25,0);c.beginPath();c.moveTo(b0[0],b0[1]);c.lineTo(ca[0],ca[1]);pencil(c,INK,.8,.9);c.stroke();
    for(let i=0;i<8;i++){c.fillStyle=wash(st.umb[i%2],.85);c.beginPath();c.moveTo(ca[0],ca[1]-.25);c.arc(ca[0],ca[1],r,i/8*TAU,(i+1)/8*TAU);c.closePath();c.fill()}c.beginPath();circ(c,ca[0],ca[1],r);pencil(c,INK,.6,.8);c.stroke()}
  if(lod>2&&st.name){const m=pt(0,0,2.8);screenText(c,m[0],m[1],LANG==='en'?st.name[1]:st.name[0],.36*S,'#b8432f',LANG==='en'?F_EN:F_BN,'center','600')}
}
function drawPodium(c,pd,lod){
  pencil(c,INK,.8,.9);
  if(pd.kiosk){obox(c,pd.x,pd.y,1,0,2.4,1.8,0,2.5,wash('#f2f2ea',.9),wash('#2f5f8a',.8),wash('#2f5f8a',.75));if(lod>1){const m=[pd.x+KX*2.1,pd.y-KZ*2.1+.4];screenText(c,m[0],m[1],LANG==='en'?'Traffic police box':'ট্রাফিক পুলিশ বক্স',.34*S,'#fbf8ef',LANG==='en'?F_EN:F_BN,'center','600')}return}
  cyl(c,pd.x,pd.y,.95,0,.55,'#e8e4da');if(lod>0){c.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;const p=[pd.x+Math.cos(a)*.95+KX*.1,pd.y+Math.sin(a)*.95-KZ*.1];c.moveTo(p[0],p[1]);c.lineTo(p[0]+KX*.4,p[1]-KZ*.4)}pencil(c,'#c0392b',.9,2);c.stroke()}
  if(pd.cop)drawPerson(c,pd.cop,pd.x+KX*.55,pd.y-KZ*.55,lod);
  const ca=[pd.x+KX*3.1,pd.y-KZ*3.1];const b0=[pd.x+KX*.55+.35,pd.y-KZ*.55];c.beginPath();c.moveTo(b0[0],b0[1]);c.lineTo(ca[0]+.35,ca[1]);pencil(c,INK,.8,1);c.stroke();
  for(let i=0;i<10;i++){c.fillStyle=wash(i%2?pd.umb[1]:pd.umb[0],.9);c.beginPath();c.moveTo(ca[0],ca[1]-.3);c.arc(ca[0],ca[1],1.75,i/10*TAU,(i+1)/10*TAU);c.closePath();c.fill()}c.beginPath();circ(c,ca[0],ca[1],1.75);pencil(c,INK,.7,.9);c.stroke();
}
function drawShapla(c,lod){
  pencil(c,INK,.85,1);cyl(c,0,0,4.6,0,.7,'#c9c4b8');cyl(c,0,0,2.9,.7,1.6,'#d6d1c6');cyl(c,0,0,.95,1.6,7.2,'#b9b2a4');
  if(lod>0){c.beginPath();const t=simT;for(let i=0;i<14;i++){const a=i/14*TAU,r0=9.4;for(let k=0;k<6;k++){const s=((t*.9+k/6+i*.13)%1),r=lerp(r0,5,s),z=.5+Math.sin(s*Math.PI)*3.8;const px=Math.cos(a)*r+KX*z,py=Math.sin(a)*r-KZ*z;c.moveTo(px,py);c.lineTo(px-Math.cos(a)*.35+KX*.25,py-Math.sin(a)*.35-KZ*.25)}}pencil(c,'#4f86bd',.7,1.2);c.stroke()}
  const petals=[],rings=[{n:12,r0:.8,r1:5,zb:7,zt:9.4,w:1.2,o:0},{n:9,r0:.5,r1:3.4,zb:7.4,zt:11,w:1,o:.3},{n:6,r0:.3,r1:1.6,zb:7.8,zt:12.2,w:.78,o:.1}];
  rings.forEach((R,ri)=>{for(let i=0;i<R.n;i++){const a=i/R.n*TAU+R.o,cs=Math.cos(a),sn=Math.sin(a),px=-sn,py=cs;const B=[cs*R.r0,sn*R.r0,R.zb],T=[cs*R.r1,sn*R.r1,R.zt],M=[(B[0]+T[0])/2,(B[1]+T[1])/2,(B[2]+T[2])/2+.3];const P=q=>[q[0]+KX*q[2],q[1]-KZ*q[2]];
    petals.push({d:D(M[0],M[1])+ri*.01,pts:[P(B),P([M[0]+px*R.w,M[1]+py*R.w,M[2]]),P(T),P([M[0]-px*R.w,M[1]-py*R.w,M[2]])],ri})}});
  petals.sort((a,b)=>a.d-b.d);for(const p of petals){const[a,b,t,d]=p.pts;c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(b[0],b[1],t[0],t[1]);c.quadraticCurveTo(d[0],d[1],a[0],a[1]);c.fillStyle=p.ri===0?wash('#f3d6dc',.85):wash('#fbeef0',.95);c.globalAlpha=1;c.fill();pencil(c,INK,.8,1);c.stroke()}
}
function drawPigeons(c){c.globalAlpha=1;for(const p of pigeons){const X=p.x+KX*p.z,Y=p.y-KZ*p.z;if(p.st==='ground'){c.fillStyle='#8a8f99';c.beginPath();c.ellipse(X,Y-.1,.18,.1,0,0,TAU);c.fill();c.fillStyle='#5a6070';c.beginPath();circ(c,X+.14,Y-.18-Math.max(0,Math.sin(p.ph))*.06,.06);c.fill()}
  else{const f=Math.sin(p.ph)*.25;c.beginPath();c.moveTo(X-.35,Y-f);c.lineTo(X,Y);c.lineTo(X+.35,Y-f);pencil(c,'#5a6070',.9,1.1);c.stroke()}}}
function drawCrows(c){c.globalAlpha=1;for(const k of crows){const X=k.x+KX*k.z,Y=k.y-KZ*k.z;if(!onScreen(k.x,k.y))continue;if(k.st==='sit'){c.fillStyle='#1c1c1c';c.beginPath();c.ellipse(X,Y-.18,.14,.2,.3,0,TAU);c.fill();c.beginPath();circ(c,X+.08,Y-.38,.08);c.fill()}
  else{const f=Math.sin(k.ph)*.3;c.beginPath();c.moveTo(X-.45,Y-f);c.lineTo(X,Y);c.lineTo(X+.45,Y-f);pencil(c,'#1c1c1c',.95,1.4);c.stroke()}}}
function drawDog(c,d,lod){
  const x=d.x,y=d.y,f=d.fc||1,k=d.kind||'dog',trot=d.st==='trot',sw=trot?Math.sin(d.ph)*.12:0;c.globalAlpha=1;c.fillStyle=wash(d.col,.9);
  if(k==='cat'){c.beginPath();c.ellipse(x,y-.12,.26,.13,0,0,TAU);c.fill();c.beginPath();circ(c,x+.24*f,y-.2,.1);c.fill();c.beginPath();c.moveTo(x+.19*f,y-.28);c.lineTo(x+.22*f,y-.38);c.lineTo(x+.27*f,y-.29);c.moveTo(x+.27*f,y-.29);c.lineTo(x+.32*f,y-.37);c.lineTo(x+.31*f,y-.25);c.fill();
    if(lod>1){pencil(c,INK,.6,.8);c.beginPath();c.ellipse(x,y-.12,.26,.13,0,0,TAU);c.moveTo(x-.26*f,y-.1);c.quadraticCurveTo(x-.5*f,y-.25-sw,x-.42*f,y-.42);if(trot){c.moveTo(x-.1,y-.02);c.lineTo(x-.1+sw,y);c.moveTo(x+.12,y-.02);c.lineTo(x+.12-sw,y)}c.stroke()}return}
  if(k==='goat'){c.beginPath();c.ellipse(x,y-.42,.45,.22,0,0,TAU);c.fill();c.beginPath();c.ellipse(x+.46*f,y-.58,.14,.1,.3*f,0,TAU);c.fill();c.fillStyle=wash('#6b5a45',.9);c.beginPath();c.moveTo(x+.5*f,y-.66);c.lineTo(x+.46*f,y-.82);c.lineTo(x+.55*f,y-.68);c.fill();
    pencil(c,INK,.7,.9);c.beginPath();for(const l of[-.3,-.12,.14,.32]){c.moveTo(x+l,y-.25);c.lineTo(x+l+(l>0?sw:-sw),y)}c.moveTo(x+.58*f,y-.5);c.lineTo(x+.6*f,y-.4);if(lod>1){c.ellipse(x,y-.42,.45,.22,0,0,TAU)}c.stroke();return}
  if(d.st!=='rest'){   // up on its legs: walking, or nose down sniffing
    const sn=d.st==='sniff';pencil(c,wash(d.col,.9),1,2.2);c.beginPath();for(const l of[-.32,-.2,.22,.34]){c.moveTo(x+l*f,y-.4);c.lineTo(x+l*f+(l>0?-sw:sw)*1.5,y)}c.stroke();
    c.fillStyle=wash(d.col,.9);c.beginPath();c.ellipse(x,y-.46,.46,.17,0,0,TAU);c.fill();c.beginPath();circ(c,x+.48*f,sn?y-.22:y-.62,.14);c.fill();
    c.beginPath();c.moveTo(x+.44*f,sn?y-.32:y-.72);c.lineTo(x+.4*f,sn?y-.42:y-.86);c.lineTo(x+.52*f,sn?y-.34:y-.74);c.fill();
    pencil(c,INK,.6,.8);c.beginPath();if(lod>1){c.ellipse(x,y-.46,.46,.17,0,0,TAU)}c.moveTo(x-.44*f,y-.5);c.quadraticCurveTo(x-.66*f,y-.62+sw,x-.6*f,y-.8);c.stroke();return}
  c.beginPath();c.ellipse(x,y-.18,.5,.24,0,0,TAU);c.fill();c.beginPath();circ(c,x+.42*f,y-.22,.16);c.fill();
  if(lod>1){pencil(c,INK,.6,.8);c.beginPath();if(lod>1){c.ellipse(x,y-.18,.5,.24,0,0,TAU);c.moveTo(x-.5*f,y-.15);c.quadraticCurveTo(x-.7*f,y-.1,x-.55*f,y)}
    c.stroke()}}

