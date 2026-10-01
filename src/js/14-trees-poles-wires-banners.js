/* ---------------- trees, poles, wires, banners ---------------- */
const trees=[],poles=[],spans=[],banners=[];
function mkTree(x,y,kind){kind=kind||rpick(['krishnachura','raintree','mehogoni','banyan']);const big=kind==='banyan'?rr(7,10):rr(4.5,7);return{x,y,kind,r:big,h:big*1.35+rr(1,3),seed:(RND()*1e9)|0,blobs:null,sway:RND()*TAU}}
function genTrees(){
  const gaps=[];const ang=ARM_DEFS.map(a=>a.deg[0]).sort((a,b)=>a-b);for(let i=0;i<ang.length;i++){const a=ang[i],b=i<ang.length-1?ang[i+1]:ang[0]+360;gaps.push((a+b)/2)}
  for(const g of gaps)for(const r of[50,58]){const p=polar(r,g+rr(-6,6));if(cellAt(p[0],p[1])!==2&&!occ[mk(p[0],p[1])]){trees.push(mkTree(p[0],p[1],RND()<.5?'banyan':'krishnachura'))}}
  for(let n=0;n<70;n++){const w=rpick(walks);if(w.side===0||w.closed)continue;const s=rr(4,w.len-4),o=[];walkPos(w,s,-(w.sw/2)+.5,o);if(Math.hypot(o[0],o[1])<70||!inWorld(o[0],o[1],-10))continue;if(trees.some(t=>Math.hypot(t.x-o[0],t.y-o[1])<14))continue;const t=mkTree(o[0],o[1]);t.walk=w.id;t.s=s;trees.push(t)}
}
function genPoles(){
  for(const w of walks){if(w.side===0||w.closed)continue;let prev=null;for(let s=6;s<w.len-3;s+=rr(24,32)){const o=[];walkPos(w,s,w.sw/2-.5,o);if(!inWorld(o[0],o[1],10))continue;const lx=-o[3]*w.side,ly=o[2]*w.side;// toward road
      const p={x:o[0],y:o[1],lx:-lx,ly:-ly,coil:RND()<.25,walk:w.id};poles.push(p);if(prev&&Math.hypot(prev.x-p.x,prev.y-p.y)<40)spans.push({a:prev,b:p,sag:rr(.6,1.4),n:3+(RND()*3|0),loop:RND()<.25});prev=p}}
  // banners across the main roads near the chattar
  for(const p of poles){if(Math.hypot(p.x,p.y)>230||RND()>.14)continue;const w=walks[p.walk];if(w.sib<0)continue;let best=null,bd=1e9;for(const q of poles)if(q.walk===w.sib){const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;best=q}}
    if(best&&bd<34)banners.push({a:p,b:best,col:rpick(SIGNCOL),t:rpick([['ট্রাফিক আইন মেনে চলুন','Obey traffic rules'],['সড়ক দুর্ঘটনা নয়, নিরাপদ সড়ক চাই','We want safe roads'],['শুভ নববর্ষ ১৪৩৩','Happy New Year 1433'],['বাণিজ্য মেলা চলছে','Trade fair is on'],['রক্ত দিন, জীবন বাঁচান','Give blood, save lives']])})}
}
function drawPole(c,p,lod){
  const top=P3([p.x,p.y],8.5);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(top[0],top[1]);pencil(c,INK,.85,lod>1?1.6:1.1);c.stroke();if(lod<1)return;
  const lh=P3([p.x+p.lx*1.8,p.y+p.ly*1.8],8);c.beginPath();c.moveTo(top[0]-KX*.5,top[1]+KZ*.5);c.lineTo(lh[0],lh[1]);c.moveTo(top[0]-.8,top[1]+.6);c.lineTo(top[0]+.8,top[1]+.6);pencil(c,INK,.7,1);c.stroke();
  c.fillStyle='#5a5a55';c.globalAlpha=.9;c.beginPath();c.ellipse(lh[0],lh[1]+.1,.45,.2,0,0,TAU);c.fill();
  if(p.coil&&lod>1){c.beginPath();for(let i=0;i<7;i++)c.ellipse(top[0]+.2,top[1]+1.8+i*.06,.5+i*.05,.35,0,0,TAU);pencil(c,INK,.5,.7);c.stroke();c.fillStyle='#3a3a38';c.globalAlpha=.9;c.fillRect(top[0]-.35,top[1]+3,.7,.9)}
}
function drawSpan(c,s){const A=s.a,B=s.b;c.beginPath();
  for(let i=0;i<s.n;i++){const z=7.7-i*.45,a=P3([A.x,A.y],z),b=P3([B.x,B.y],z),sag=s.sag*(1+i*.2);const mm=P3([(A.x+B.x)/2,(A.y+B.y)/2],z-sag*2.4);c.moveTo(a[0],a[1]);c.quadraticCurveTo(mm[0],mm[1],b[0],b[1])}
  if(s.loop){const m=P3([(A.x+B.x)/2,(A.y+B.y)/2],6.4-s.sag*1.5);for(let i=0;i<3;i++)c.ellipse(m[0]+i*.3,m[1],.9,.6,0,0,TAU)}pencil(c,INK,.55,.7);c.stroke()}
function drawBanner(c,bn,lod){const A=P3([bn.a.x,bn.a.y],7.2),B=P3([bn.b.x,bn.b.y],7.2),M0=[(bn.a.x+bn.b.x)/2,(bn.a.y+bn.b.y)/2],Mc=P3(M0,6.4);c.beginPath();c.moveTo(A[0],A[1]);c.quadraticCurveTo(Mc[0],Mc[1],B[0],B[1]);pencil(c,INK,.6,.8);c.stroke();
  const dx=bn.b.x-bn.a.x,dy=bn.b.y-bn.a.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,w=Math.min(L*.36,9),h=1.3;const E3=(k,z)=>P3([M0[0]+ux*w*k,M0[1]+uy*w*k],z);
  const q=[E3(-1,6.9),E3(1,6.9),E3(1,6.9-h),E3(-1,6.9-h)],m=P3(M0,6.9-h/2);c.fillStyle=wash(bn.col,.8);c.globalAlpha=1;fillPoly(c,q);c.beginPath();ppath(c,q);pencil(c,INK,.6,.8);c.stroke();
  if(lod>1)screenText(c,m[0],m[1],LANG==='en'?bn.t[1]:bn.t[0],Math.min(h*.6*S,w*2*S/(bn.t[0].length*.55)),'#fbf8ef',LANG==='en'?F_EN:F_BN,'center','600')}
function drawTree(c,t,lod){c.save();c.translate(t.x,t.y);if(VIEW.th)c.rotate(-VIEW.th);const k1=KX,k2=KZ;KX=VIEW.kx0;KZ=VIEW.kz0;const ox=t.x,oy=t.y;t.x=0;t.y=0;try{drawTree0(c,t,lod)}finally{t.x=ox;t.y=oy;KX=k1;KZ=k2;c.restore()}}
function drawTree0(c,t,lod){
  J=mulberry32(t.seed);
  if(!t.blobs){t.blobs=[];const n=t.kind==='banyan'?9:6;for(let i=0;i<n;i++){const a=J()*TAU,rd=J()*t.r*.55;t.blobs.push([Math.cos(a)*rd,Math.sin(a)*rd*.5+(J()-.5)*t.r*.3,t.r*(.38+J()*.25)])}}
  const sway=REDUCED?0:Math.sin(simT*.8+t.sway)*.15,topZ=t.h*.62,tc=[t.x+KX*topZ+sway,t.y-KZ*topZ];
  c.beginPath();c.moveTo(t.x,t.y);c.lineTo(tc[0],tc[1]);c.strokeStyle='#6b4a32';c.globalAlpha=.9;c.lineWidth=Math.max(t.r*.09,1.2/S);c.lineCap='round';c.stroke();
  if(lod>0){c.beginPath();for(const b of t.blobs.slice(0,4)){c.moveTo(tc[0],tc[1]+t.r*.1);c.lineTo(tc[0]+b[0]*.8,tc[1]+b[1]*.6-t.r*.15)}c.lineWidth=Math.max(t.r*.035,1/S);c.stroke()}
  if(t.kind==='banyan'&&lod>1){c.beginPath();for(let i=0;i<9;i++){const x=tc[0]+(J()-.5)*t.r*1.3,y=tc[1]+(J()-.3)*t.r*.3;c.moveTo(x,y);c.lineTo(x+(J()-.5)*.6-KX*topZ*.7,y+topZ*KZ*.75)}pencil(c,'#6b4a32',.45,.8);c.stroke()}
  const g=t.kind==='krishnachura'?'#6e9a4a':t.kind==='mehogoni'?'#4f7a45':'#5f8a4a';
  c.globalAlpha=1;c.fillStyle=wash(g,.6);c.beginPath();for(const b of t.blobs)circ(c,tc[0]+b[0],tc[1]+b[1]-t.r*.35,b[2]);c.fill();
  if(lod>0){c.beginPath();for(const b of t.blobs){const cx=tc[0]+b[0],cy=tc[1]+b[1]-t.r*.35;hatch(c,[[cx,cy],[cx+b[2],cy],[cx+b[2]*.5,cy+b[2]],[cx-b[2]*.3,cy+b[2]*.8]],-1,.45,.05)}pencil(c,shade(g,.55),.35,.8);c.stroke();
    J=mulberry32(t.seed+BOIL*13);c.beginPath();for(const b of t.blobs){const cx=tc[0]+b[0],cy=tc[1]+b[1]-t.r*.35,n=Math.max(6,b[2]*2.2|0);
      for(let i=0;i<n;i++){const a0=i/n*TAU+J()*.3,a1=a0+TAU/n*1.15,q=b[2]*(1+J()*.08);c.moveTo(cx+Math.cos(a0)*q,cy+Math.sin(a0)*q);c.quadraticCurveTo(cx+Math.cos((a0+a1)/2)*q*1.18,cy+Math.sin((a0+a1)/2)*q*1.18,cx+Math.cos(a1)*q,cy+Math.sin(a1)*q)}}
    pencil(c,shade(g,.5),.75,.9);c.stroke();
    if(t.kind==='krishnachura'){J=mulberry32(t.seed+7);c.beginPath();for(let i=0;i<60;i++){const b=t.blobs[i%t.blobs.length],a=J()*TAU,rd=J()*b[2];circ(c,tc[0]+b[0]+Math.cos(a)*rd,tc[1]+b[1]-t.r*.35+Math.sin(a)*rd,.28)}c.fillStyle='#d8402a';c.globalAlpha=.8;c.fill()}}
}

/* ================================================================
   PLACES: Baitul Mukarram, Kamalapur Station, Notre Dame College & University,
   Motijheel Govt Boys' High School, Ideal School, foot overbridges, unipole billboards,
   crowds that live on plazas and campuses.
   ================================================================ */
function frameQ(q){const t=[q[1][0]-q[0][0],q[1][1]-q[0][1]],n=[q[3][0]-q[0][0],q[3][1]-q[0][1]],L=Math.hypot(t[0],t[1]),Dd=Math.hypot(n[0],n[1]);return{q,q0:q[0],t:[t[0]/L,t[1]/L],n:[n[0]/Dd,n[1]/Dd],L,D:Dd}}
const FW=(F,a,b)=>[F.q0[0]+F.t[0]*a+F.n[0]*b,F.q0[1]+F.t[1]*a+F.n[1]*b];
const FQ=(F,a0,a1,b0,b1)=>[FW(F,a0,b0),FW(F,a1,b0),FW(F,a1,b1),FW(F,a0,b1)];
function reserveSite(r,deg,f,d){for(let k=0;k<160;k++){const q=lmQuad(r+(k>>3)*5,deg+((k%8)-3.5)*1.8,f,d);if(quadFree(q)){occMark(q);return frameQ(q)}}return null}
const groundDecor=[],specials=[],crowds=[],sites={};
const HOTEL_SIGNS=[['আবাসিক হোটেল মিতালী','Residential Hotel Mitali'],['হোটেল স্টেশন ভিউ','Hotel Station View'],['কমলাপুর ভাত ঘর','Kamalapur Rice House'],['মামা হোটেল অ্যান্ড রেস্টুরেন্ট','Mama Hotel & Restaurant'],['নিউ রেলওয়ে হোটেল','New Railway Hotel'],['আবাসিক হোটেল সোনারগাঁও','Residential Hotel Sonargaon'],['বিসমিল্লাহ কাবাব ঘর','Bismillah Kabab Ghor'],['হাজী মাসুদ বিরিয়ানি','Haji Masud Biryani']];
const WALL_WRITING=[['এখানে প্রস্রাব করিবেন না','Do not urinate here'],['পোস্টার লাগাবেন না','Stick no posters'],['এখানে ময়লা ফেলিবেন না','Do not dump rubbish here'],['ভাড়া দেওয়া হইবে','To let'],['সাবধান! পকেটমার','Beware of pickpockets']];
const POSTER_COL=['#e8d44d','#e07b28','#d94f70','#4f86bd','#7fb24f','#f2efe6','#b24bc0'];

function paintPlaza(F,col){groundDecor.push(c=>{c.globalAlpha=1;c.fillStyle=wash(col,.7);fillPoly(c,F.q);c.strokeStyle=INK;c.globalAlpha=.35;c.lineWidth=.3;c.beginPath();ppath(c,F.q);c.stroke();c.globalAlpha=1})}
function paintRect(F,a0,a1,b0,b1,col,alpha=.7,lines){groundDecor.push(c=>{c.globalAlpha=1;c.fillStyle=wash(col,alpha);fillPoly(c,FQ(F,a0,a1,b0,b1));if(lines)lines(c);c.globalAlpha=1})}
function court(F,a0,a1,b0,b1,col,kind){paintRect(F,a0,a1,b0,b1,col,.75,c=>{c.strokeStyle='#f7f3e8';c.globalAlpha=.85;c.lineWidth=.18;c.beginPath();ppath(c,FQ(F,a0+.8,a1-.8,b0+.8,b1-.8));const m0=FW(F,(a0+a1)/2,b0+.8),m1=FW(F,(a0+a1)/2,b1-.8);c.moveTo(m0[0],m0[1]);c.lineTo(m1[0],m1[1]);const cc=FW(F,(a0+a1)/2,(b0+b1)/2);c.moveTo(cc[0]+2,cc[1]);c.arc(cc[0],cc[1],2,0,TAU);
  if(kind==='cricket'){const p0=FW(F,(a0+a1)/2-10,(b0+b1)/2),p1=FW(F,(a0+a1)/2+10,(b0+b1)/2);c.stroke();c.strokeStyle=wash('#c9a36b',.9);c.globalAlpha=1;c.lineWidth=3;c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}c.stroke()})}
function trees2(F,pts){for(const[a,b,kind]of pts){const p=FW(F,a,b);trees.push(mkTree(p[0],p[1],kind))}}
