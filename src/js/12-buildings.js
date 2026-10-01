/* ---------------- buildings ---------------- */
const SIGNS=[['মায়ের দোয়া হোটেল','Mayer Doa Hotel'],['নিউ মডার্ন টেইলার্স','New Modern Tailors'],['আল-মদিনা ফার্মেসী','Al-Madina Pharmacy'],['রহমান ট্রেডার্স','Rahman Traders'],['বিসমিল্লাহ ফটোকপি','Bismillah Photocopy'],
 ['জননী ইলেকট্রনিক্স','Janani Electronics'],['সততা ট্রাভেলস','Shotota Travels'],['ঢাকা প্রিন্টার্স','Dhaka Printers'],['নিউ বিসমিল্লাহ বিরিয়ানি','New Bismillah Biryani'],['কাজী এন্টারপ্রাইজ','Kazi Enterprise'],
 ['মা মনি স্টোর','Ma Moni Store'],['হক ল্যামিনেটিং','Haque Laminating'],['রূপালী কম্পিউটার','Rupali Computer'],['খান ইন্স্যুরেন্স এজেন্সি','Khan Insurance Agency'],['স্টার কাবাব','Star Kabab'],['ভাই ভাই মোবাইল সেন্টার','Bhai Bhai Mobile Centre'],
 ['নিউ ঢাকা হোটেল','New Dhaka Hotel'],['আদর্শ লাইব্রেরি','Adarsha Library'],['সোনার বাংলা ট্রেডিং','Sonar Bangla Trading'],['মেসার্স আলম অ্যান্ড সন্স','M/S Alam & Sons'],['ডিজিটাল স্টুডিও','Digital Studio'],['হাজী বিরিয়ানি ঘর','Haji Biryani Ghor']];
const ADS=[['নবদিগন্ত ব্যাংক','Nabadiganta Bank'],['এক কাপ চায়ে সতেজতা','Freshness in one cup'],['সমতট ইন্স্যুরেন্স','Samatata Insurance'],['মোবাইলে টাকা পাঠান','Send money by mobile'],['বরেন্দ্র সিমেন্ট','Barendra Cement'],['পদ্মা লাইফ','Padma Life'],['ট্রাফিক আইন মেনে চলুন','Obey traffic rules']];
const TOWERSIGN=[['নবদিগন্ত ব্যাংক','Nabadiganta Bank'],['সমতট ব্যাংক লিঃ','Samatata Bank Ltd'],['বরেন্দ্র লাইফ','Barendra Life'],['মেঘলা টাওয়ার','Meghla Tower'],['পূবালী ভবন','Purbachal Bhaban'],['যমুনা ট্রেড সেন্টার','Jamuna Trade Centre'],['উত্তরণ ইন্স্যুরেন্স','Uttoron Insurance']];
const SIGNCOL=['#c0392b','#1f6f8b','#2e7d32','#e0a526','#6a1b9a','#d35400','#1a5276','#b03a6f','#0e7c66'];
const buildings=[];
function qCenter(q){return[(q[0][0]+q[1][0]+q[2][0]+q[3][0])/4,(q[0][1]+q[1][1]+q[2][1]+q[3][1])/4]}
function inset(q,k){const c=qCenter(q);return q.map(p=>[c[0]+(p[0]-c[0])*k,c[1]+(p[1]-c[1])*k])}
function qPoint(q,u,v){return[q[0][0]+(q[1][0]-q[0][0])*u+(q[3][0]-q[0][0])*v,q[0][1]+(q[1][1]-q[0][1])*u+(q[3][1]-q[0][1])*v]}
function quadFree(q){const f=Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1]),d=Math.hypot(q[3][0]-q[0][0],q[3][1]-q[0][1]);const nu=Math.ceil(f/1.2)+1,nv=Math.ceil(d/1.2)+1;
  for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const p=qPoint(q,i/nu,j/nv),k=mk(p[0],p[1]);if(k<0||mask[k]||occ[k])return false}return true}
function occMark(q,v=1){const f=Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1]),d=Math.hypot(q[3][0]-q[0][0],q[3][1]-q[0][1]);const nu=Math.ceil(f/.6)+1,nv=Math.ceil(d/.6)+1;
  for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const p=qPoint(q,i/nu,j/nv),k=mk(p[0],p[1]);if(k>=0)occ[k]=v}}
const P3=(pt,z)=>[pt[0]+KX*z,pt[1]-KZ*z];
const FPt=(f,u,v)=>[f.a[0]+f.ux*u+KX*v,f.a[1]+f.uy*u-KZ*v];
function partGeom(p){
  const q=p.q,z0=p.z0,z1=p.z0+p.h;p.top=z1;const c=qCenter(q);p.faces=[];
  for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],ex=b[0]-a[0],ey=b[1]-a[1],L=Math.hypot(ex,ey)||1e-6,ux=ex/L,uy=ey/L;let nx=uy,ny=-ux;
    if(nx*((a[0]+b[0])/2-c[0])+ny*((a[1]+b[1])/2-c[1])<0){nx=-nx;ny=-ny}
    if(nx*VIS[0]+ny*VIS[1]>.02){const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,cl=cellAt(mx+nx*4,my+ny*4);
      p.faces.push({a,ux,uy,len:L,nx,ny,lit:clamp(.52+.45*(nx*.35+ny*.94),.35,1),poly:[P3(a,z0),P3(b,z0),P3(b,z1),P3(a,z1)],road:cl===1||cl===2})}}
  p.roof=q.map(pt=>P3(pt,z1));p.hull=hull([...q.map(pt=>P3(pt,z0)),...p.roof.map(x=>x.slice())]);
}
function genWindows(p){
  const k=p.kind;p.win=[];p.winCol=[];p.litPath=new Path2D();if(k==='frame'){p.fh=3.6;p.floors=Math.floor(p.h/3.6);return}if(k==='mosque'||k==='crown'||k==='plinth'||k==='portico'||k==='arcade')return;
  if(k==='baitul'){p.fh=3.7;p.floors=8;for(const f of p.faces){const cw=2.6,cols=Math.floor((f.len-2)/cw),off=(f.len-cols*cw)/2;for(let fl=0;fl<8;fl++){const v0=p.z0+fl*3.7+.8,v1=v0+2.2;for(let i=0;i<cols;i++){const u0=off+i*cw+cw*.36,u1=u0+cw*.28;const q=[FPt(f,u0,v0),FPt(f,u1,v0),FPt(f,u1,v1),FPt(f,u0,v1)];p.win.push(q);p.winCol.push(null);if(RND()<.4){p.litPath.moveTo(q[0][0],q[0][1]);p.litPath.lineTo(q[1][0],q[1][1]);p.litPath.lineTo(q[2][0],q[2][1]);p.litPath.lineTo(q[3][0],q[3][1]);p.litPath.closePath()}}}}return}
  const fh=k==='old'?3.1:3.5;p.fh=fh;p.floors=Math.max(1,Math.floor(p.h/fh));
  for(const f of p.faces){const cw=k==='old'?rr(2.6,3.4):k==='glass'?rr(1.8,2.2):rr(2.3,3),cols=Math.max(1,Math.floor((f.len-1)/cw)),off=(f.len-cols*cw)/2;
    for(let fl=(p.z0>0?0:1);fl<p.floors;fl++){const v0=p.z0+fl*fh+fh*(k==='glass'?.08:.3),v1=v0+fh*(k==='glass'?.84:k==='old'?.48:.5);
      for(let i=0;i<cols;i++){const u0=off+i*cw+cw*(k==='glass'?.05:.2),u1=u0+cw*(k==='glass'?.9:.6);const q=[FPt(f,u0,v0),FPt(f,u1,v0),FPt(f,u1,v1),FPt(f,u0,v1)];
        p.win.push(q);p.winCol.push(k==='old'&&RND()<.35?rpick(['#3f7a5a','#3f5f8a','#8a6a3f']):null);
        if(RND()<(k==='old'?.5:k==='glass'?.3:.36)){p.litPath.moveTo(q[0][0],q[0][1]);p.litPath.lineTo(q[1][0],q[1][1]);p.litPath.lineTo(q[2][0],q[2][1]);p.litPath.lineTo(q[3][0],q[3][1]);p.litPath.closePath()}}}}
}
function genExtras(p){
  p.tanks=[];p.billboard=null;p.signs=[];p.laundry=[];p.stains=[];p.acs=[];const k=p.kind;
  if(k==='old'||k==='tower'||k==='office'){const n=1+(RND()*3|0);for(let i=0;i<n;i++){const pt=qPoint(p.q,rr(.15,.85),rr(.15,.85));p.tanks.push({x:pt[0],y:pt[1],r:rr(.7,1.1),h:rr(1.3,2)})}p.tanks.sort((a,b)=>a.y-b.y);
    p.dish=RND()<.5?qPoint(p.q,rr(.2,.8),rr(.2,.8)):null;p.shed=k==='old'&&RND()<.35?{u:rr(.1,.5),v:rr(.1,.5),w:rr(.25,.45),col:rpick(['#b8432f','#2e7d32','#1f6f8b'])}:null;p.mast=(k==='old'&&RND()<.12)?qPoint(p.q,rr(.3,.7),rr(.3,.7)):null}
  const rf=p.faces.find(f=>f.road&&f.len>10);
  if(rf&&(k==='tower'||k==='old'||k==='office')&&RND()<.5)p.billboard={f:rf,u0:rf.len*.1,u1:rf.len*.9,h:rr(5,8),col:rpick(SIGNCOL),ad:rpick(ADS)};
  const qc=qCenter(p.q),nearK=sites.kamalapur&&Math.hypot(qc[0]-FW(sites.kamalapur,66,60)[0],qc[1]-FW(sites.kamalapur,66,60)[1])<200;
  p.posters=[];p.wall=null;
  if((k==='old'||k==='office')&&p.z0===0){for(const f of p.faces){if(!f.road)continue;let u=.5;while(u<f.len-2.5){const w=Math.min(rr(3.5,8),f.len-.5-u);if(w<2.2)break;p.signs.push({f,u0:u,u1:u+w,v0:2.8,v1:3.9,col:rpick(SIGNCOL),t:nearK&&RND()<.6?rpick(HOTEL_SIGNS):rpick(SIGNS),shutter:true});u+=w+.3}
      for(let i=0;i<(RND()*8|0);i++){const pu=rr(.2,Math.max(.3,f.len-1)),pv=rr(.3,2);p.posters.push({f,u:pu,v:pv,w:rr(.45,.8),h:rr(.6,.9),col:rpick(POSTER_COL)})}if(!p.wall&&RND()<.12)p.wall={f,u:rr(1,Math.max(1.2,f.len-4)),t:rpick(WALL_WRITING)}
      const fh=p.fh||3.1;for(let fl=1;fl<Math.min(4,p.floors);fl++)if(RND()<.55){const w=rr(3,Math.min(10,f.len-1));const u0=rr(.3,Math.max(.4,f.len-w-.3));p.signs.push({f,u0,u1:u0+w,v0:fl*fh+.5,v1:fl*fh+1.6,col:rpick(SIGNCOL),t:rpick(SIGNS)})}
      if(RND()<.5&&p.h>9){const u0=RND()<.5?.2:f.len-1.1;p.signs.push({f,u0,u1:u0+.9,v0:4.2,v1:Math.min(p.h-.5,rr(9,14)),col:rpick(SIGNCOL),t:rpick(SIGNS),vert:true})}}}
  if(k==='old'){for(let i=0;i<p.win.length;i++){if(RND()<.07)p.laundry.push(i);if(RND()<.05)p.acs.push(i)}const f0=p.faces[0];if(f0)for(let i=0;i<5;i++)p.stains.push([f0,rr(.5,f0.len-.5),rr(p.h*.2,p.h*.7)])}
  if((k==='tower'||k==='glass'||k==='bands')&&p.h>35&&RND()<.7)p.topSign=rpick(TOWERSIGN);
  if(k==='arcade')for(const f of p.faces)if(f.len>6){let u=.4;while(u<f.len-3){const w=Math.min(rr(3,6),f.len-.4-u);p.signs.push({f,u0:u,u1:u+w,v0:4.6,v1:5.5,col:rpick(SIGNCOL),t:rpick([['বায়তুল মোকাররম মার্কেট','Baitul Mukarram Market'],['নিউ জুয়েলার্স','New Jewellers'],['আতর হাউস','Attar House'],['ইসলামিয়া লাইব্রেরি','Islamia Library'],['টুপি-জায়নামাজ ঘর','Tupi & Prayer Mat Shop']])});u+=w+.4}}
  if(p.signText)for(const f of p.faces)if(f.len>12)p.signs.push({f,u0:f.len*.15,u1:f.len*.85,v0:p.top-2.6,v1:p.top-.6,col:p.signCol||'#1a5276',t:p.signText});
  if(k==='club'&&p.clubName)for(const f of p.faces)if(f.len>8)p.signs.push({f,u0:f.len*.08,u1:f.len*.92,v0:p.h-3.1,v1:p.h-.9,col:p.thana?'#2f5f8a':(p.stripe==='#1c1c1c'?'#1c1c1c':p.stripe),t:p.clubName});
}
function geomBuilding(b){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,dep=-1e9,topP=null,topZ=-1;const oR=RND;
  for(const p of b.parts){RND=mulberry32(p.seed^0x5bd1e995);partGeom(p);genWindows(p);genExtras(p);
    for(const q of p.hull){x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}
    for(const q of p.q)dep=Math.max(dep,D(q[0],q[1]));if(p.top>topZ){topZ=p.top;topP=p}}
  RND=oR;const sp=b.spire||0,ex=14+sp;const hx=KX*ex,hy=-KZ*ex;
  b.bb=[Math.min(x0,x0+hx)-3,Math.min(y0,y0+hy)-3,Math.max(x1,x1+hx)+3,Math.max(y1,y1+hy)+3];b.depth=dep;b.top=topZ;const c=qCenter(topP.q);b.labelAt=[c[0]+KX*(topZ+5+sp),c[1]-KZ*(topZ+5+sp)]}
function addBuilding(parts,meta={}){
  const b=Object.assign({parts,seed:(RND()*1e9)|0},meta);for(const p of parts){p.z0=p.z0||0;p.seed=(RND()*1e9)|0}
  geomBuilding(b);b.foot=parts[0].q;buildings.push(b);return b}
function lmQuad(r,deg,f,d){const a=deg*D2R,ox=Math.cos(a),oy=Math.sin(a),tx=-oy,ty=ox,cx=ox*r,cy=oy*r;const q0=[cx-tx*f/2-ox*d/2,cy-ty*f/2-oy*d/2];
  return[q0,[q0[0]+tx*f,q0[1]+ty*f],[q0[0]+tx*f+ox*d,q0[1]+ty*f+oy*d],[q0[0]+ox*d,q0[1]+oy*d]]}
const LANDMARKS=[
 {name:['বাংলাদেশ ব্যাংক','Bangladesh Bank'],deg:-71,r:66,f:30,d:42,parts:q=>[{q,h:14,kind:'office',col:'#d9d6cf'},{q:inset(q,.7),z0:14,h:97,kind:'bb',col:'#e6e3dc'},{q:inset(q,.46),z0:111,h:4,kind:'crown',col:'#cfcac0'}]},
 {name:['জনতা ব্যাংক ভবন','Janata Bank Bhaban'],deg:36,r:66,f:44,d:36,parts:q=>[{q,h:16,kind:'office',col:'#c9a07e'},{q:inset(q,.66),z0:16,h:78,kind:'janata',col:'#a8704f'},{q:inset(q,.4),z0:94,h:3,kind:'crown',col:'#8a5a40'}]},
 {name:['সোনালী ব্যাংক','Sonali Bank'],deg:132,r:60,f:46,d:32,parts:q=>[{q,h:62,kind:'sonali',col:'#b3b1a6'}]},
 {name:['সিটি সেন্টার','City Centre'],deg:-148,r:110,f:34,d:32,spire:16,parts:q=>[{q,h:14,kind:'office',col:'#9fb3bf'},{q:inset(q,.86),z0:14,h:88,kind:'glass',col:'#6f97b0'},{q:inset(q,.68),z0:102,h:9,kind:'glass',col:'#6f97b0'},{q:inset(q,.45),z0:111,h:7,kind:'glass',col:'#7fa7bf'}]},
 {name:['জীবন বীমা টাওয়ার','Jiban Bima Tower'],deg:-120,r:185,f:30,d:24,parts:q=>[{q,h:76,kind:'tower',col:'#d8cdb6'},{q:inset(q,.6),z0:76,h:6,kind:'crown',col:'#c0b49a'}]},
 {name:['সেনা কল্যাণ ভবন','Sena Kalyan Bhaban'],deg:-24,r:170,f:34,d:26,parts:q=>[{q,h:18,kind:'office',col:'#c8c1b0'},{q:inset(q,.8),z0:18,h:58,kind:'bands',col:'#bfb3a0'}]},
 {name:['বিমান ভবন','Biman Bhaban'],deg:196,r:210,f:44,d:28,parts:q=>[{q,h:40,kind:'old',col:'#e3e6e8'}]},
 {name:['মসজিদ','Mosque'],deg:150,r:240,f:26,d:22,mosque:true,parts:q=>[{q,h:9,kind:'mosque',col:'#e8ece6'}]},
];

