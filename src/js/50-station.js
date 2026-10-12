/* ---------------- 360° panoramas: the engine, and the first scene (inside Kamalapur) ----------------
   Every place you can step into is a scene drawn round you on a cylinder: drag, swipe or use the arrow keys to look round and up.
   Points are projected onto the cylinder, so straight lines bend as they sweep past, the way they do in a real panorama.
   A scene is {key, places() -> [{name:[bn,en], inside(x,y)}], init(place), update(dt), draw(c), marks() -> [[deg,label]], acts:[[key,label(),cost]], act(key), sub()}.
   Scenes live in their own files and register themselves with PANO_SCENES.push(scene). */
const stCv=document.getElementById('stationCv'),sctx=stCv.getContext('2d');
let PANO_ON=false;const PANO_SCENES=[];
const PAN={scene:null,place:null,yaw:0,pitch:.1,lastH:0,vy:0,goal:null,t:0,F:400,hor:300,half:1,eye:1.6,crowd:[],keys:new Set(),drag:null,say:'',sayT:0,sayAt:null,ann:'',annT:0,coolieT:14,teaT:22,touT:9,bus:{y:-160,v:9,col:'#b8432f'},sky:null};
const KR={x0:-38.5,x1:27.5,y0:-38.5,y1:27.5,cell:11,H:17};   // the roof: 6 x 6 shells on 49 columns
const PLAT=[];for(let k=0;k<8;k++){const x=31+k*9;PLAT.push({n:k+1,x0:x,x1:x+5,tx:x+7})}   // platform k: surface x0..x1; its track (where trains stand) is centred on tx

/* departures. Intercity times are from 2025-26 news (Turna Nishitha is "about 23:00"); the Narayanganj commuter slots are illustrative */
const TT=[
 ['পারাবত এক্সপ্রেস','Parabat Express',['সিলেট','Sylhet'],6+20/60,3,1],['সোনার বাংলা এক্সপ্রেস','Sonar Bangla Express',['চট্টগ্রাম','Chattogram'],7,1,1],
 ['একতা এক্সপ্রেস','Ekota Express',['পঞ্চগড়','Panchagarh'],10.25,5,1],['চট্টলা এক্সপ্রেস','Chattala Express',['চট্টগ্রাম','Chattogram'],14.25,2,1],
 ['সুবর্ণ এক্সপ্রেস','Subarna Express',['চট্টগ্রাম','Chattogram'],16.5,3,1],['তূর্ণা নিশীথা','Turna Nishitha',['চট্টগ্রাম','Chattogram'],23,1,1],
 ...[7.5,9.5,12,15,17.5,19.5,21.5].map((h,i)=>['নারায়ণগঞ্জ কমিউটার','Narayanganj Commuter',['নারায়ণগঞ্জ','Narayanganj'],h,i%2?8:7,0])
].map(([bn,en,to,h,pl,ic])=>({bn,en,to,h,pl,ic:!!ic,late:Math.random()<.35?10+(Math.random()*30|0):0,st:'away',y:0,v:0,ann:false,n:ic?14:8}));
const sinceH=(h,a)=>((h-a)%24+24)%24;   // hours from a to h, round the clock
const depH=t=>(t.h+t.late/60)%24;
const hhmm=h=>{const m=Math.round(h*60)%1440,s=`${String(m/60|0).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;return LANG==='en'?s:bnNum(s)};

/* ---- projection ---- */
const wrapA=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI};
function pj(X,Y,Z){const r=Math.max(.3,Math.hypot(X,Y)),d=wrapA(Math.atan2(Y,X)-PAN.yaw);return[W/2+d*PAN.F,PAN.hor-(Z-PAN.eye)*PAN.F/r,d,r]}
const seen=d=>Math.abs(d)<PAN.half+.3;
/* a closed world polygon, edges cut into short pieces so they curve; null when it reaches round behind you or is out of view */
function poly3(pts,step=1.5){const out=[];let any=false;
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],n=Math.min(160,Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/step)));
    for(let s=0;s<n;s++){const t=s/n,q=pj(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t);if(Math.abs(q[2])>2.75)return null;if(seen(q[2]))any=true;out.push(q)}}
  return any?out:null}
function fill3(c,pts,col,ink,a=.7,w=1,step){const q=poly3(pts,step);if(!q)return null;c.beginPath();c.moveTo(q[0][0],q[0][1]);for(const p of q)c.lineTo(p[0],p[1]);c.closePath();if(col){c.globalAlpha=1;c.fillStyle=col;c.fill()}if(ink){c.strokeStyle=ink;c.globalAlpha=a;c.lineWidth=w;c.stroke();c.globalAlpha=1}return q}
/* an open polyline; the pen lifts where it passes behind you */
function line3(c,pts,step=1.5){let pen=false;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.min(160,Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/step)));
  for(let s=i?1:0;s<=n;s++){const t=s/n,q=pj(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t);if(Math.abs(q[2])>2.75){pen=false;continue}if(!pen){c.moveTo(q[0],q[1]);pen=true}else c.lineTo(q[0],q[1])}}}
function ink3(c,pts,col=INK,a=.75,w=1,step){c.beginPath();line3(c,pts,step);c.strokeStyle=col;c.globalAlpha=a;c.lineWidth=w;c.stroke();c.globalAlpha=1}
function label3(c,X,Y,Z,str,m,col,weight='600'){const q=pj(X,Y,Z);if(!seen(q[2]))return;const px=clamp(m*PAN.F/q[3],9,34);c.font=`${weight} ${px.toFixed(1)}px ${LANG==='en'?F_EN:F_BN}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=col;c.fillText(str,q[0],q[1])}
/* a person standing (or sitting) on the floor at X,Y: drawn with the street's figure code, scaled to the distance */
function figAt(c,p,X,Y,Z=0){const q=pj(X,Y,Z);if(!seen(q[2])||q[3]<2.6)return;const s=PAN.F/q[3],k1=KX,k2=KZ;KX=0;KZ=1;S=s;
  c.setTransform(DPR*s,0,0,DPR*s,DPR*q[0],DPR*q[1]);try{drawPerson0(c,p,0,0,s>40?3:s>14?2:1,{noUmb:true})}finally{KX=k1;KZ=k2;c.setTransform(DPR,0,0,DPR,0,0)}}
function sleeperAt(c,a){const q=pj(a.X,a.Y,0);if(!seen(q[2])||q[3]<1.4)return;const s=PAN.F/q[3],x=q[0],y=q[1];   // someone asleep on the floor under a thin blanket
  c.globalAlpha=1;c.fillStyle=wash(a.col,.85);c.beginPath();c.ellipse(x,y-.18*s,.85*s,.2*s,0,0,TAU);c.fill();c.fillStyle=wash(a.p.look.skin,.95);c.beginPath();c.arc(x+(a.p.fc>0?.9:-.9)*s,y-.2*s,.13*s,0,TAU);c.fill();
  c.beginPath();c.ellipse(x,y-.18*s,.85*s,.2*s,0,0,TAU);c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=1;c.stroke();c.globalAlpha=1}

/* ---- the people ---- */
function stMk(kind,X,Y,extra){const p=kind==='coolie'?coolie():kind==='tea'?makePerson('hawker',false):kind==='police'?makePerson('police',false):kind==='beggar'?makePerson('labour'):kind==='tout'?makePerson('labour',false):traveller();
  if(kind==='tea'){Object.assign(p.look,{dress:'lungi',c1:'#f1eee6',c2:'#3f5f8a'});p.act='pour'}
  if(kind==='police'){Object.assign(p.look,{dress:'pants',c1:'#d9dccf',c2:'#2f3a4d'});p.act='police';p.vest=true}
  if(kind==='beggar'){p.act='stick'}
  if(kind==='tout'){p.act=Math.random()<.5?'wave':'phone'}
  p.pose='stand';p.fixed=true;p.ph=Math.random()*9;p.fc=Math.random()<.5?1:-1;
  const a=Object.assign({kind,p,X,Y,tx:X,ty:Y,mode:'idle',wait:mr(2,9),plat:0,spd:mr(1,1.35),col:mpick(['#8a6a4a','#5a6b7a','#7a4a4a','#6b7a5a'])},extra||{});PAN.crowd.push(a);return a}
const exitPt=()=>[-46,mr(-20,20)],platPt=()=>[29,mr(-24,24)],counterPt=i=>[-28+i*3.6,-27.6];
function busy(){const h=HOUR;return h<4.8||h>23.6?.2:(h>6&&h<10)||(h>15.5&&h<20)?1:.7}
function panoReset(){PAN.eye=1.6;PAN.crowd.length=0;PAN.t=0;PAN.yaw=0;PAN.pitch=.1;PAN.vy=0;PAN.goal=null;PAN.say='';PAN.sayT=0;PAN.ann='';PAN.annT=0;PAN.sayAt=null}
function stInit(){
  syncTrains(false);
  stMk('tea',-4.4,6.6);stMk('police',9,-11);stMk('police',-20,14);stMk('beggar',-35,-4).p.pose='squat';
  for(let i=0;i<4;i++)stMk('coolie',mr(12,26),mr(-20,20),{roam:true});
  for(let i=0;i<5;i++)stMk('tout',mr(-41,-37),mr(-24,24));
  for(let i=0;i<11;i++){const n=Math.round(busy()*mr(1,5));for(let j=0;j<n;j++){const c=counterPt(i);stMk('trav',c[0]+mr(-.2,.2),c[1]+.9+j*.9,{queue:i}).p.fc=Math.random()<.5?1:-1}}
  const night=HOUR>22.5||HOUR<5.3;
  for(let i=0;i<(night?14:6);i++){const a=stMk('trav',mr(-34,22),mpick([mr(-25,-12),mr(12,20)]),{sit:true});a.p.pose='sit';if(night){a.sleep=true}}
  for(let i=0;i<Math.round(26*busy());i++){const a=stMk('trav',mr(-34,24),mr(-24,20));stRoute(a)}
  for(const t of TT)if(t.st==='standing')boardCrowd(t,t.ic?14:8)}
/* where every train should be at this hour: on entering, and when the clock is moved by hand */
function syncTrains(fresh){for(const t of TT){const d=depH(t),win=sinceH(HOUR,d-.75)<.75;
  if(win&&t.st!=='standing'){t.st='standing';t.y=60;t.v=0;if(fresh){for(const a of PAN.crowd)if(a.train===t)a.gone=true;boardCrowd(t,t.ic?14:8)}}
  else if(!win&&t.st==='standing'&&sinceH(HOUR,d)<.3){t.st='leaving';t.v=2;sfx('sfx_train_horn',me.x,me.y,1);for(const a of PAN.crowd)if(a.train===t)a.gone=true}   // the clock went just past its time: watch it pull out
  else if(!win&&t.st!=='away'&&t.st!=='leaving'){t.st='away';t.y=-600;for(const a of PAN.crowd)if(a.train===t)a.gone=true}
  t.ann=fresh?false:sinceH(HOUR,d-.25)<.25}
  PAN.lastH=HOUR}
function stRoute(a){const r=Math.random(),q=r<.4?platPt():r<.75?exitPt():[mr(-30,22),mr(-22,18)];a.tx=q[0];a.ty=q[1];a.mode='walk';a.p.pose='walk';a.p.act=null}
/* waiting on the platform of a standing train; they board when it leaves */
function boardCrowd(t,n){const P=PLAT[t.pl-1];for(let i=0;i<n;i++){const a=stMk(Math.random()<.15?'coolie':'trav',mr(P.x0+.6,P.x1-.6),mr(-70,55),{plat:t.pl,train:t});if(Math.random()<.3){a.p.pose='squat'}}}
function alight(t){for(let i=0;i<(t.ic?16:10);i++){const a=stMk(Math.random()<.2?'coolie':'trav',mr(27,29.5),mr(-26,26));const q=exitPt();a.tx=q[0];a.ty=q[1];a.mode='walk';a.p.pose='walk';a.wait=mr(0,6);a.delay=a.wait}}

function stUpdate(dt){
  if(Math.abs(wrapA((HOUR-PAN.lastH)/24*TAU))/TAU*24>.15)syncTrains(true);PAN.lastH=HOUR;   // the clock was moved: put the trains where they should be
  /* trains: roll in 45 minutes before departure, stand, leave on time (or late) */
  for(const t of TT){const d=depH(t),inWin=sinceH(HOUR,d-.75)<.75;
    if(t.st==='away'&&inWin&&sinceH(HOUR,d-.75)<.08){t.st='arriving';t.y=-560;t.v=16;sfx('sfx_train_horn',me.x,me.y,.6)}
    if(t.st==='arriving'){t.v=Math.max(1.2,Math.sqrt(2*.9*Math.max(0,60-t.y)));t.y+=t.v*dt;if(t.y>=60){t.y=60;t.st='standing';alight(t);boardCrowd(t,t.ic?14:8)}}
    if((t.st==='standing'||t.st==='arriving')&&!inWin){t.st='leaving';t.v=0;sfx('sfx_whistle',me.x,me.y,.9);setTimeout(()=>PANO_ON&&sfx('sfx_train_horn',me.x,me.y,1),1200);
      for(const a of PAN.crowd)if(a.train===t)a.gone=true}
    if(t.st==='leaving'){t.v=Math.min(16,t.v+.55*dt);t.y+=t.v*dt;if(t.y-t.n*20>420){t.st='away';t.ann=false}}
    if(!t.ann&&sinceH(HOUR,d-.25)<.25&&t.st!=='leaving'){t.ann=true;PAN.annT=12;
      PAN.ann=L2(`যাত্রী সাধারণের দৃষ্টি আকর্ষণ করছি… ${t.to[0]}গামী ${t.ic?'আন্তঃনগর ':''}${t.bn} ট্রেনটি ${bnNum(t.pl)} নম্বর প্ল্যাটফর্ম থেকে ছেড়ে যাবে।`,`Attention please… the ${t.ic?'intercity ':''}${t.en} to ${t.to[1]} will leave from platform ${t.pl}.`)}}
  /* people */
  const want=Math.round(26*busy());let walkers=0;
  for(let i=PAN.crowd.length-1;i>=0;i--){const a=PAN.crowd[i],p=a.p;
    if(a.gone){PAN.crowd.splice(i,1);continue}
    if(a.delay>0){a.delay-=dt;continue}
    if(a.mode==='walk'){walkers++;const dx=a.tx-a.X,dy=a.ty-a.Y,L=Math.hypot(dx,dy);
      if(L<.3){if(a.tx<-44||a.tx>28.5){PAN.crowd.splice(i,1);continue}a.mode='idle';a.wait=mr(3,14);p.pose='stand';continue}
      const s=Math.min(L,a.spd*dt);a.X+=dx/L*s;a.Y+=dy/L*s;p.ph+=dt*a.spd*5.5;
      const r=Math.hypot(a.X,a.Y)||1,tan=(-a.Y*dx+a.X*dy)/r;p.fc=tan>0?1:-1}   // facing: which way they move across your view
    else if(!a.plat&&a.queue===undefined&&!a.sit&&a.kind==='trav'){a.wait-=dt;if(a.wait<=0)stRoute(a)}
    else if(a.roam){a.wait-=dt;if(a.wait<=0){a.tx=mr(10,27);a.ty=mr(-24,22);a.mode='walk';p.pose='walk'}}}
  if(walkers<want&&Math.random()<dt*1.5){const q=Math.random()<.5?exitPt():platPt(),a=stMk('trav',q[0],q[1]);stRoute(a)}
  /* the street outside: a bus going past, touts calling */
  const B=PAN.bus;B.y+=B.v*dt;if(B.y>160){B.y=-160;B.col=mpick(['#b8432f','#2f6b4f','#e0a526','#2e6fa7'])}
  PAN.touT-=dt;if(PAN.touT<=0){PAN.touT=mr(16,30);const tt=PAN.crowd.filter(a=>a.kind==='tout');if(tt.length){const a=mpick(tt);stSay(L2('সিএনজি লাগবে? মতিঝিল! গুলিস্তান!','Need a CNG? Motijheel! Gulistan!'),a)}}
  PAN.coolieT-=dt;if(PAN.coolieT<=0){PAN.coolieT=mr(28,55);const cc=PAN.crowd.filter(a=>a.kind==='coolie'&&!a.plat).sort((a,b)=>Math.hypot(a.X,a.Y)-Math.hypot(b.X,b.Y));if(cc.length){stSay(L2('কুলি লাগবে স্যার? কুলি!','Need a porter, sir? Porter!'),cc[0]);playVoice('coolie_1',me.x,me.y)}}
  PAN.teaT-=dt;if(PAN.teaT<=0){PAN.teaT=mr(30,60);const t=PAN.crowd.find(a=>a.kind==='tea');if(t){stSay(L2('চা-আ! গরম চা!','Tea! Hot tea!'),t);playVoice('hawker_tea_1',me.x,me.y)}}
}
function stSay(t,a){PAN.say=t;PAN.sayT=4.5;PAN.sayAt=a||null}
const panoSay=stSay;
/* the walking people every scene shares: walk to (tx,ty), then idle; a.next(a) picks somewhere new, a.leaveAt(x,y) says when they have gone */
function panoWalk(dt){for(let i=PAN.crowd.length-1;i>=0;i--){const a=PAN.crowd[i],p=a.p;if(a.gone){PAN.crowd.splice(i,1);continue}if(a.delay>0){a.delay-=dt;continue}
  if(a.mode==='walk'){const dx=a.tx-a.X,dy=a.ty-a.Y,L=Math.hypot(dx,dy);if(L<.3){if(a.leave){PAN.crowd.splice(i,1);continue}a.mode='idle';a.wait=mr(3,14);p.pose=a.sit?'sit':'stand';continue}
    const st=Math.min(L,a.spd*dt);a.X+=dx/L*st;a.Y+=dy/L*st;p.ph+=dt*a.spd*5.5;const r=Math.hypot(a.X,a.Y)||1;p.fc=(-a.Y*dx+a.X*dy)/r>0?1:-1}
  else if(a.next){a.wait-=dt;if(a.wait<=0)a.next(a)}}}
function goTo(a,X,Y,leave){a.tx=X;a.ty=Y;a.mode='walk';a.leave=!!leave;a.p.pose='walk';if(a.p.act!=='load')a.p.act=null}

/* ---- drawing ---- */
function roofEdgeT(phi){const c=Math.cos(phi),s=Math.sin(phi);let t=1e9;if(c>1e-6)t=Math.min(t,KR.x1/c);else if(c<-1e-6)t=Math.min(t,KR.x0/c);if(s>1e-6)t=Math.min(t,KR.y1/s);else if(s<-1e-6)t=Math.min(t,KR.y0/s);return t}
function drawSkyline(c){if(!PAN.sky){const R=mulberry32(77);PAN.sky=[];for(let i=0;i<70&&PAN.sky.length<46;i++){const a=R()*TAU,r=130+R()*150,X=Math.cos(a)*r;if(X>18&&X<128)continue;PAN.sky.push({a,w:(6+R()*14)/r,r,h:12+R()*48,col:['#cdd3d6','#d8d0c0','#c7cfc4','#d6c9b8'][i%4]})}PAN.sky.sort((a,b)=>b.r-a.r)}
  for(const b of PAN.sky){const p=a=>[Math.cos(a)*b.r,Math.sin(a)*b.r];const A=p(b.a-b.w),B=p(b.a+b.w);fill3(c,[[A[0],A[1],0],[B[0],B[1],0],[B[0],B[1],b.h],[A[0],A[1],b.h]],wash(b.col,.75),INK,.35,.8,8)}}
function drawMetro(c){   // MRT Line 6 coming to Kamalapur: viaduct and the station box, nearly finished, scaffolding still up
  const X=-96;fill3(c,[[X,-260,11.6],[X,260,11.6],[X,260,13.2],[X,-260,13.2]],wash('#c9c6be',.9),INK,.5,1,6);
  c.beginPath();for(let y=-240;y<=240;y+=30)line3(c,[[X,y,0],[X,y,11.6]],4);c.strokeStyle=wash('#a9a49a',.95);c.lineWidth=3;c.stroke();
  const q=fill3(c,[[X+4,-32,9],[X+4,32,9],[X+4,32,21],[X+4,-32,21]],wash('#d9d4c8',.9),INK,.55,1,3);
  if(q){c.beginPath();for(let y=-30;y<=30;y+=4)line3(c,[[X+3.6,y,8],[X+3.6,y,22]],3);for(let z=10;z<=21;z+=2.2)line3(c,[[X+3.6,-32,z],[X+3.6,32,z]],3);c.strokeStyle='#8a6a3a';c.globalAlpha=.45;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
    label3(c,X+4,0,23.5,L2('মেট্রো রেল · কমলাপুর (নির্মাণাধীন)','Metro rail · Kamalapur (being built)'),1.6,'#5a534a')}}
function drawForecourt(c){
  fill3(c,[[-84,-80,0],[KR.x0,-80,0],[KR.x0,80,0],[-84,80,0]],wash('#a9a296',.6),null,0,1,6);
  ink3(c,[[-72,-160,0],[-72,160,0]],'#f1eee6',.5,1.5,6);
  const B=PAN.bus,bx=-78,q=fill3(c,[[bx,B.y,0.4],[bx,B.y+11,0.4],[bx,B.y+11,3.3],[bx,B.y,3.3]],wash(B.col,.75),INK,.7,1,1);
  if(q){c.beginPath();for(let y=B.y+1;y<B.y+10;y+=1.6){const a=pj(bx-.01,y,1.9),b=pj(bx-.01,y+1.1,2.8);c.rect(a[0],b[1],b[0]-a[0],a[1]-b[1])}c.fillStyle='rgba(40,45,50,.55)';c.fill()}
  const parked=PAN.park||(PAN.park=(()=>{const R=mulberry32(91),o=[];for(let i=0;i<22;i++)o.push({X:-47-R()*14,Y:-34+R()*68,k:R()<.62?'rk':'cng',col:['#1d2b4a','#6b2f3f','#2f4f3a','#4a3a6b'][i%4]});return o.sort((a,b)=>Math.hypot(b.X,b.Y)-Math.hypot(a.X,a.Y))})());
  for(const v of parked){const g=pj(v.X,v.Y,0);if(!seen(g[2]))continue;const s=PAN.F/g[3],x=g[0],y=g[1];c.lineWidth=Math.max(.8,s*.06);c.strokeStyle=INK;
    if(v.k==='rk'){c.beginPath();c.arc(x-.6*s,y-.34*s,.34*s,0,TAU);c.arc(x+.75*s,y-.3*s,.3*s,0,TAU);c.globalAlpha=.8;c.stroke();c.globalAlpha=1;c.fillStyle=wash('#b8432f',.75);c.fillRect(x-.85*s,y-.95*s,.8*s,.35*s);
      c.fillStyle=wash(v.col,.8);c.beginPath();c.moveTo(x-.95*s,y-.9*s);c.quadraticCurveTo(x-1.05*s,y-2.05*s,x-.1*s,y-1.95*s);c.lineTo(x-.25*s,y-.95*s);c.closePath();c.fill();c.globalAlpha=.7;c.stroke();c.globalAlpha=1}
    else{c.beginPath();c.arc(x-.7*s,y-.24*s,.24*s,0,TAU);c.arc(x+.95*s,y-.22*s,.22*s,0,TAU);c.fillStyle='#2a2826';c.fill();c.fillStyle=wash('#3d8b4a',.8);c.beginPath();c.moveTo(x-1.3*s,y-.3*s);c.lineTo(x-1.3*s,y-1.6*s);c.quadraticCurveTo(x-.2*s,y-1.85*s,x+.9*s,y-1.55*s);c.lineTo(x+1.25*s,y-.75*s);c.lineTo(x+1.2*s,y-.3*s);c.closePath();c.fill();c.globalAlpha=.7;c.stroke();
      c.beginPath();for(let k=-1.1;k<.6;k+=.18){c.moveTo(x+k*s,y-.95*s);c.lineTo(x+k*s,y-1.5*s)}c.strokeStyle='#1d4a26';c.globalAlpha=.6;c.stroke();c.globalAlpha=1}}}
function drawTrain(c,t,P){if(t.st==='away')return;const X=P.tx-1.5;
  for(let i=0;i<t.n;i++){const y1=t.y-i*20-.6,y0=y1-18.8;if(y1<-420||y0>420)continue;const loco=i===0,body=loco?(t.ic?'#2f6b4f':'#5a4a3a'):t.ic?'#eef0e8':'#2f4f7a';
    const q=fill3(c,[[X,y0,.5],[X,y1,.5],[X,y1,4.2],[X,y0,4.2]],wash(body,.8),INK,.7,1,2);if(!q)continue;
    if(loco)fill3(c,[[X-.01,y0,1.1],[X-.01,y1,1.1],[X-.01,y1,1.6],[X-.01,y0,1.6]],wash('#e3b23c',.85),null,0,1,2);   // a boxy diesel in green with a yellow band
    else if(t.ic){fill3(c,[[X-.01,y0,1.05],[X-.01,y1,1.05],[X-.01,y1,1.4],[X-.01,y0,1.4]],wash('#3f8f5a',.85),null,0,1,2);ink3(c,[[X-.01,y0,1.5],[X-.01,y1,1.5]],'#c0392b',.9,1.4,2)}   // white INKA coach, green band, red line
    c.beginPath();for(let y=y0+1.2;y<y1-1.2;y+=loco?6:1.9){const a=pj(X-.02,y,2.2),b=pj(X-.02,y+(loco?1.6:1.15),3.3);if(seen(a[2])&&seen(b[2]))c.rect(a[0],b[1],b[0]-a[0],a[1]-b[1])}c.fillStyle='rgba(38,44,52,.6)';c.fill();
    if(!t.ic&&!loco){c.beginPath();for(let y=y0+1.2;y<y1-1.2;y+=.38){const a=pj(X-.03,y,2.2),b=pj(X-.03,y,3.3);if(seen(a[2]))c.moveTo(a[0],a[1]),c.lineTo(b[0],b[1])}c.strokeStyle=INK;c.globalAlpha=.4;c.lineWidth=.7;c.stroke();c.globalAlpha=1}   // barred windows on the old commuter coaches
    if(loco&&y1<0)fill3(c,[[X,y1,.5],[X+3,y1,.5],[X+3,y1,4.2],[X,y1,4.2]],wash(body,.7),INK,.7,1,1);
    if(i===t.n-1&&y0>0)fill3(c,[[X,y0,.5],[X+3,y0,.5],[X+3,y0,4.2],[X,y0,4.2]],wash(body,.7),INK,.7,1,1)}
  if(t.st==='standing'&&t.ic){const q=pj(X,10,5.2);if(seen(q[2]))label3(c,X,10,5.4,`${t.bn.split(' ')[0]} · ${t.to[0]}`,1.1,'#b8432f')}}
function drawPlatforms(c){
  for(let k=PLAT.length-1;k>=0;k--){const P=PLAT[k];
    fill3(c,[[P.tx-1.7,-420,0],[P.tx+1.7,-420,0],[P.tx+1.7,420,0],[P.tx-1.7,420,0]],wash('#8a8278',.55),null,0,1,8);
    ink3(c,[[P.tx-.75,-420,.15],[P.tx-.75,420,.15]],'#5a534a',.8,1,6);ink3(c,[[P.tx+.75,-420,.15],[P.tx+.75,420,.15]],'#5a534a',.8,1,6);
    for(const t of TT)if(t.pl===P.n)drawTrain(c,t,P);
    fill3(c,[[P.x0,-160,.9],[P.x1,-160,.9],[P.x1,160,.9],[P.x0,160,.9]],wash('#c9c3b5',.85),null,0,1,6);
    fill3(c,[[P.x0,-160,0],[P.x0,160,0],[P.x0,160,.9],[P.x0,-160,.9]],wash('#9a9286',.8),INK,.5,.8,6);
    ink3(c,[[P.x0+.25,-160,.91],[P.x0+.25,160,.91]],'#e3b23c',.8,1.2,6);
    const m=(P.x0+P.x1)/2;fill3(c,[[P.x0-.4,-130,4.8],[P.x1+.4,-130,4.8],[P.x1+.4,130,4.8],[P.x0-.4,130,4.8]],wash('#b9b4aa',.8),INK,.4,.8,6);   // the platform shed, seen from below
    c.beginPath();for(let y=-126;y<=126;y+=14)line3(c,[[m,y,.9],[m,y,4.8]],2);c.strokeStyle=wash('#6b655c',.9);c.lineWidth=2;c.stroke();
    label3(c,P.x0+.5,14,5.5,L2(`প্ল্যাটফর্ম ${bnNum(P.n)}`,`Platform ${P.n}`),.8,'#2f5f8a');
    const ppl=PAN.crowd.filter(a=>a.plat===P.n).sort((a,b)=>Math.hypot(b.X,b.Y)-Math.hypot(a.X,a.Y));for(const a of ppl)figAt(c,a.p,a.X,a.Y,.9)}}
function drawShells(c){const{x0,y0,cell,H}=KR,cells=[];
  for(let i=0;i<6;i++)for(let j=0;j<6;j++){const A=x0+i*cell,B=y0+j*cell;if(A<0&&A+cell>0&&B<0&&B+cell>0)continue;cells.push({A,B,d:Math.hypot(A+cell/2,B+cell/2)})}
  cells.sort((a,b)=>b.d-a.d);
  for(const cl of cells){const{A,B}=cl,cr=[[A,B],[A+cell,B],[A+cell,B+cell],[A,B+cell]],pts=[];
    for(let e=0;e<4;e++){const a=cr[e],b=cr[(e+1)%4];for(let s=0;s<8;s++){const t=s/8;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,H+2.4*4*t*(1-t)])}}
    fill3(c,pts,wash(((A/cell+B/cell)&1)?'#e4dfd3':'#dcd6c9',.95),INK,.55,1,3);
    const ctr=[A+cell/2,B+cell/2,H+3.2];c.beginPath();for(let e=0;e<4;e++){const a=cr[e],b=cr[(e+1)%4];line3(c,[[(a[0]+b[0])/2,(a[1]+b[1])/2,H+2.4],ctr],1.5)}c.strokeStyle=INK;c.globalAlpha=.25;c.lineWidth=.8;c.stroke();c.globalAlpha=1}}
function drawColumn(c,X,Y){const b=pj(X,Y,0);if(!seen(b[2]))return;const t=pj(X,Y,KR.H-3.5),w=.75*PAN.F/b[3];
  c.lineCap='butt';c.strokeStyle=wash('#d4cdbd',.95);c.lineWidth=w;c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(t[0],t[1]);c.stroke();
  c.strokeStyle=INK;c.globalAlpha=.7;c.lineWidth=1;c.beginPath();c.moveTo(b[0]-w/2,b[1]);c.lineTo(t[0]-w/2,t[1]);c.moveTo(b[0]+w/2,b[1]);c.lineTo(t[0]+w/2,t[1]);c.stroke();c.globalAlpha=1;
  c.lineCap='round';c.beginPath();for(const[dx,dy]of[[1,1],[1,-1],[-1,1],[-1,-1]])line3(c,[[X,Y,KR.H-3.5],[X+dx*3.4,Y+dy*3.4,KR.H]],1);c.strokeStyle=wash('#c9c2b2',.95);c.lineWidth=w*.55;c.stroke();
  const l=pj(X-.01,Y,6.5);if(lightsOn()>.2){c.fillStyle='#fff6cf';c.fillRect(l[0]-w*.35,l[1]-w*.12,w*.7,w*.24)}}
function drawBlockFront(c,y,x0,x1,h,col,signs,label){   // a low building under the roof, its face towards you at Y=y
  const q=fill3(c,[[x0,y,0],[x1,y,0],[x1,y,h],[x0,y,h]],wash(col,.85),INK,.7,1.1,1);if(!q)return;
  const out=-Math.sign(y);   // towards you
  for(const s of signs){fill3(c,[[s.x-s.w/2,y,s.z0],[s.x+s.w/2,y,s.z0],[s.x+s.w/2,y,s.z1],[s.x-s.w/2,y,s.z1]],s.fill,INK,.6,.8,.5);
    if(s.awn){const n=Math.max(3,Math.round(s.w/.7));for(let k=0;k<n;k++){const a=s.x-s.w/2+k*s.w/n,b=a+s.w/n;fill3(c,[[a,y,s.z1+.35],[b,y,s.z1+.35],[b,y+out*1.1,s.z1-.15],[a,y+out*1.1,s.z1-.15]],wash(k%2?'#f1eee6':s.awn,.85),k===n-1?INK:null,.5,.8,.5)}}
    if(s.goods)s.goods(c,s,y,out);
    if(s.t)label3(c,s.x,y,s.awn?s.z1+.6:(s.z0+s.z1)/2,s.t,s.m||.38,s.ink||INK)}
  if(label)label3(c,(x0+x1)/2,y,h-.35,label,.55,'#b8432f')}
/* what is on show in each shop front */
function counter3(c,s,y,out,col){fill3(c,[[s.x-s.w/2+.2,y+out*.6,0],[s.x+s.w/2-.2,y+out*.6,0],[s.x+s.w/2-.2,y+out*.6,1],[s.x-s.w/2+.2,y+out*.6,1]],wash(col,.8),INK,.6,.8,.5)}
function shopTea(c,s,y,out){counter3(c,s,y,out,'#8a5a3a');for(let k=0;k<3;k++){const q=pj(s.x-2+k*1.6,y+out*.6,1.05);if(!seen(q[2]))continue;const r=.22*PAN.F/q[3];c.fillStyle=k===1?'#9aa0a6':'#c9b48a';c.beginPath();c.ellipse(q[0],q[1]-r,r,r*1.1,0,0,TAU);c.fill();c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=1;c.stroke();c.globalAlpha=1}
  for(let k=0;k<6;k++){const q=pj(s.x-2.8+k*.5,y,1.9);if(seen(q[2])){const r=.12*PAN.F/q[3];c.fillStyle=['#e3b23c','#c0392b','#f1eee6'][k%3];c.fillRect(q[0]-r,q[1]-r*2,r*2,r*2.4)}}}   // a kettle, cups, packets of biscuits on a string
function shopBooks(c,s,y,out){counter3(c,s,y,out,'#6b5a45');const cols=['#b8432f','#2f5f8a','#e3b23c','#2f6b4f','#6b3f8a','#f1eee6'];for(let r=0;r<3;r++)for(let k=0;k<9;k++){const x=s.x-2.4+k*.55;fill3(c,[[x,y,.6+r*.6],[x+.45,y,.6+r*.6],[x+.45,y,1.05+r*.6],[x,y,1.05+r*.6]],wash(cols[(k+r*2)%6],.8),null,0,1,1)}}
function shopFood(c,s,y,out){counter3(c,s,y,out,'#8a5a3a');for(let k=0;k<3;k++){const q=pj(s.x-1.6+k*1.6,y+out*.6,1.05);if(!seen(q[2]))continue;const r=.4*PAN.F/q[3];c.fillStyle='#b0b6bf';c.fillRect(q[0]-r,q[1]-r*.9,r*2,r*.9);c.strokeStyle=INK;c.globalAlpha=.6;c.strokeRect(q[0]-r,q[1]-r*.9,r*2,r*.9);c.globalAlpha=1}}   // big aluminium pots
function shopWait(c,s,y,out){for(const dx of[-3.5,0,3.5])fill3(c,[[s.x+dx-1.4,y+out*.3,.45],[s.x+dx+1.4,y+out*.3,.45],[s.x+dx+1.4,y+out*.3,.6],[s.x+dx-1.4,y+out*.3,.6]],wash('#6b5a45',.85),INK,.5,.8,.5)}   // benches inside the open door
let BOARD_ROWS=[];
function drawBoard(c,textOnly){const bx=13,by=-8,phi=Math.atan2(by,bx),ux=-Math.sin(phi),uy=Math.cos(phi),hw=4.2;
  const P=(u,z)=>[bx+ux*u,by+uy*u,z];
  if(!textOnly){ink3(c,[P(-3,7.1),P(-3,KR.H)],'#5a534a',.8,1.2,2);ink3(c,[P(3,7.1),P(3,KR.H)],'#5a534a',.8,1.2,2);if(!fill3(c,[P(-hw,4.5),P(hw,4.5),P(hw,7.1),P(-hw,7.1)],'#1f1d1b',INK,.9,1.4,.5))return}
  const top=pj(...P(0,7.1)),bot=pj(...P(0,4.5));if(!seen(top[2]))return;const hpx=bot[1]-top[1],lh=hpx/6,wpx=Math.abs(pj(...P(hw,5.8))[0]-pj(...P(-hw,5.8))[0]);
  c.save();c.beginPath();c.rect(top[0]-wpx/2+3,top[1]+2,wpx-6,hpx-4);c.clip();c.textBaseline='middle';const fnt=LANG==='en'?F_EN:F_BN;
  c.font=`700 ${(lh*.72).toFixed(1)}px ${fnt}`;c.textAlign='center';c.fillStyle='#ffd27a';c.fillText(L2('ছাড়ার সময়সূচি','DEPARTURES'),top[0],top[1]+lh*.75);
  c.font=`${(lh*.62).toFixed(1)}px ${fnt}`;c.textAlign='left';
  BOARD_ROWS.forEach((r,i)=>{const y=top[1]+lh*(1.85+i);c.fillStyle=r.late?'#ff9a6a':'#ffb347';c.fillText(r.txt,top[0]-wpx/2+lh*.5,y)});c.restore()}
function boardRows(){const up=TT.filter(t=>t.st!=='leaving').map(t=>({t,u:sinceH(depH(t),HOUR)})).sort((a,b)=>a.u-b.u).slice(0,4);
  BOARD_ROWS=up.map(({t})=>({late:t.late>0,txt:`${hhmm(t.h)}  ${LANG==='en'?t.en:t.bn} → ${LANG==='en'?t.to[1]:t.to[0]}  ${L2('প্ল্যা.','Pl.')}${LANG==='en'?t.pl:bnNum(t.pl)}  ${t.late?L2(`বিলম্ব ${bnNum(t.late)} মি.`,`Late ${t.late} min`):L2('সময়মতো','On time')}`}));return up}
const compassY=()=>W<700?150:46;   // on a phone the status card owns the top, so the compass sits below it
function drawCompass(c,marks){const cx=W/2,y=compassY(),w=Math.min(420,W-40),deg=PAN.yaw*180/Math.PI;c.save();c.globalAlpha=.92;c.fillStyle='#f7f2e6';c.strokeStyle=INK;c.lineWidth=1.2;c.beginPath();c.rect(cx-w/2,y-16,w,32);c.fill();c.globalAlpha=.6;c.stroke();c.globalAlpha=1;
  c.beginPath();c.rect(cx-w/2,y-16,w,32);c.clip();const pxd=w/140;
  c.beginPath();for(let d=Math.ceil((deg-70)/15)*15;d<=deg+70;d+=15){const x=cx+(d-deg)*pxd;c.moveTo(x,y+16);c.lineTo(x,y+(d%45?11:7))}c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=1;c.stroke();c.globalAlpha=1;
  c.font=`600 13px ${LANG==='en'?F_EN:F_BN}`;c.textAlign='center';c.textBaseline='middle';
  for(const[m,t]of marks){let d=m-deg;d=((d+180)%360+360)%360-180;if(Math.abs(d)>75)continue;c.fillStyle=Math.abs(d)<12?'#b8432f':INK;c.fillText(t,cx+d*pxd,y-3)}
  c.restore();c.fillStyle='#b8432f';c.beginPath();c.moveTo(cx-6,y+20);c.lineTo(cx+6,y+20);c.lineTo(cx,y+13);c.fill()}
function bubble(c,x,y,t,anchor){c.font=`${LANG==='en'?'':'600'} 15px ${LANG==='en'?F_EN:F_BN}`;const tw=Math.min(W-40,c.measureText(t).width+22),bx=clamp(x-tw/2,10,W-tw-10),by=y-44;
  c.globalAlpha=1;c.fillStyle='#f7f2e6';c.strokeStyle=INK;c.lineWidth=1.2;c.beginPath();c.rect(bx,by,tw,30);c.fill();c.stroke();if(anchor){c.beginPath();c.moveTo(clamp(x,bx+10,bx+tw-10)-6,by+30);c.lineTo(clamp(x,bx+10,bx+tw-10)+2,by+30);c.lineTo(x,y-6);c.closePath();c.fill();c.stroke()}
  c.fillStyle=INK;c.textAlign='center';c.textBaseline='middle';c.fillText(t,bx+tw/2,by+15,tw-16)}

/* one frame of whichever scene is open, onto canvas cv. The restaurant draws its room this way too (with its own menu panel). */
function drawPanoOn(cv,c,dt,advanceClock=true){const S=PAN.scene;
  PAN.t+=dt;if(advanceClock&&!PAUSED)HOUR=(HOUR+dt*CLOCK_RATE/60)%24;audioIndoors(S.indoor===false?2:1);
  const kd=(PAN.keys.has('ArrowRight')||PAN.keys.has('d')||PAN.keys.has('D')?1:0)-(PAN.keys.has('ArrowLeft')||PAN.keys.has('a')||PAN.keys.has('A')?1:0);
  const kp=(PAN.keys.has('ArrowUp')||PAN.keys.has('w')||PAN.keys.has('W')?1:0)-(PAN.keys.has('ArrowDown')||PAN.keys.has('s')||PAN.keys.has('S')?1:0);if(kp)PAN.pitch=clamp(PAN.pitch+kp*.6*dt,-.12,.85);
  if(kd){PAN.yaw+=kd*1.3*dt;PAN.goal=null;PAN.vy=0}else if(PAN.goal!==null){const d=wrapA(PAN.goal-PAN.yaw);PAN.yaw+=d*Math.min(1,dt*4);if(Math.abs(d)<.002)PAN.goal=null}else if(!PAN.drag&&PAN.vy){PAN.yaw+=PAN.vy*dt;PAN.vy*=Math.pow(.05,dt);if(Math.abs(PAN.vy)<.01)PAN.vy=0}
  PAN.yaw=wrapA(PAN.yaw);S.update(dt);if(PAN.sayT>0)PAN.sayT-=dt;if(PAN.annT>0)PAN.annT-=dt;
  const w=Math.round(W*DPR),h=Math.round(H*DPR);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  PAN.F=Math.max(W/1.75,H*.62);PAN.half=(W/2)/PAN.F;PAN.hor=H*(.47+PAN.pitch);VEC=true;BOIL=REDUCED?0:Math.floor(PAN.t*5)%3;
  c.setTransform(DPR,0,0,DPR,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.lineCap='round';c.lineJoin='round';
  S.draw(c);c.setTransform(DPR,0,0,DPR,0,0);c.globalAlpha=1;
  /* paper grain and vignette, as on the street */
  if(!grainPat)grainPat=c.createPattern(grain,'repeat');c.globalCompositeOperation='multiply';c.globalAlpha=.5;c.fillStyle=grainPat;c.fillRect(0,0,W,H);c.globalAlpha=1;
  const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(1,'rgba(150,130,100,.3)');c.fillStyle=vg;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';
  drawCompass(c,S.marks());
  if(PAN.annT>0&&PAN.ann){c.globalAlpha=Math.min(1,PAN.annT);c.font=`600 14px ${LANG==='en'?F_EN:F_BN}`;const tw=Math.min(W-30,c.measureText(PAN.ann).width+60);const ay=compassY()+28;c.fillStyle='#fff6cf';c.strokeStyle='#b8432f';c.lineWidth=1.5;c.beginPath();c.rect(W/2-tw/2,ay,tw,30);c.fill();c.stroke();
    c.fillStyle='#b8432f';c.textAlign='left';c.textBaseline='middle';c.fillText(L2('ঘোষণা','Notice'),W/2-tw/2+10,ay+15);c.fillStyle=INK;c.textAlign='center';c.fillText(PAN.ann,W/2+22,ay+15,tw-70);c.globalAlpha=1}
  if(PAN.sayT>0&&PAN.say){c.globalAlpha=Math.min(1,PAN.sayT);const a=PAN.sayAt,q=a?pj(a.X,a.Y,(a.Z||0)+(a.plat?2.9:2)):null;if(q&&seen(q[2])&&q[1]>110)bubble(c,q[0],q[1],PAN.say,true);else bubble(c,W/2,H*.62,PAN.say,false);c.globalAlpha=1}}
function drawPanorama(dt){drawPanoOn(stCv,sctx,dt);stSyncUI()}
/* ---- the Kamalapur scene ---- */
function drawStationScene(c){
  const night=lightsOn();
  /* sky and the open ground, then the roof's underside down to its edge */
  const sg=c.createLinearGradient(0,0,0,PAN.hor);sg.addColorStop(0,night>.5?'#3a4660':rain>.4?'#b9bdc0':'#cfe0ea');sg.addColorStop(1,night>.5?'#5a5f70':'#efe8d8');c.fillStyle=sg;c.fillRect(0,0,W,PAN.hor);
  c.fillStyle=wash('#cfc6b3',.9);c.fillRect(0,PAN.hor,W,H-PAN.hor);
  drawSkyline(c);drawMetro(c);drawForecourt(c);
  fill3(c,[[KR.x1,-200,0],[110,-200,0],[110,200,0],[KR.x1,200,0]],wash('#bdb6a8',.7),null,0,1,8);
  drawPlatforms(c);
  /* the concourse floor: big tiles, in perspective */
  c.beginPath();for(let x=KR.x0;x<=KR.x1;x+=2.75)line3(c,[[x,KR.y0,0],[x,KR.y1,0]],1.2);for(let y=KR.y0;y<=KR.y1;y+=2.75)line3(c,[[KR.x0,y,0],[KR.x1,y,0]],1.2);c.strokeStyle='#8a8478';c.globalAlpha=.22;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  /* roof: underside from the top of the view down to where the roof ends, then the shells */
  c.beginPath();c.moveTo(0,0);c.lineTo(W,0);for(let x=W;x>=-6;x-=6){const t=roofEdgeT(PAN.yaw+(x-W/2)/PAN.F),y=PAN.hor-(KR.H-PAN.eye)*PAN.F/t;c.lineTo(x,Math.max(-1,y))}c.closePath();c.fillStyle=wash('#dcd6c9',.95);c.fill();
  drawShells(c);
  /* everything standing on the concourse, far to near */
  const items=[];
  for(let i=0;i<=6;i++)for(let j=0;j<=6;j++){const X=KR.x0+i*KR.cell,Y=KR.y0+j*KR.cell;items.push({d:Math.hypot(X,Y),f:()=>drawColumn(c,X,Y)})}
  items.push({d:30.5,f:()=>drawBlockFront(c,-30,-30.5,10,3.4,'#e8dfc9',Array.from({length:11},(_,i)=>({x:-28+i*3.6,w:2.6,z0:1.05,z1:2.25,fill:'rgba(52,60,66,.75)',t:LANG==='en'?String(i+1):bnNum(i+1),m:.42,ink:'#ffd27a'})),L2('টিকিট কাউন্টার','Ticket counters'))});
  items.push({d:23,f:()=>drawBlockFront(c,22,-30,20,3.6,'#e6dccb',[{x:-24,w:7,z0:.2,z1:2.4,fill:'rgba(60,50,40,.55)',awn:'#c97a3a',t:L2('চা · নাস্তা','Tea · snacks'),goods:shopTea},{x:-13,w:6,z0:.2,z1:2.4,fill:'rgba(60,50,40,.55)',awn:'#2f5f8a',t:L2('বই · পত্রিকা','Books · papers'),goods:shopBooks},
    {x:2,w:12,z0:.2,z1:2.8,fill:'rgba(70,64,56,.6)',t:L2('বিশ্রামাগার','Waiting room'),goods:shopWait},{x:15,w:6,z0:.2,z1:2.4,fill:'rgba(60,50,40,.55)',awn:'#b8432f',t:L2('খাবার হোটেল','Food'),goods:shopFood}],null)});
  items.push({d:15.3,f:()=>drawBoard(c,false)});
  for(const a of PAN.crowd)if(!a.plat)items.push({d:Math.hypot(a.X,a.Y),f:()=>a.sleep?sleeperAt(c,a):(a.sit&&(a.p.pose='sit'),figAt(c,a.p,a.X,a.Y))});
  items.sort((a,b)=>b.d-a.d);for(const it of items)it.f();
  /* night: the lights come on under the roof */
  if(night>.05){c.globalCompositeOperation='multiply';c.fillStyle=`rgba(70,80,115,${.55*night})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';
    for(let i=0;i<=6;i++)for(let j=0;j<=6;j++){const q=pj(KR.x0+i*KR.cell,KR.y0+j*KR.cell,6.5);if(!seen(q[2]))continue;const r=Math.min(170,2.4*PAN.F/q[3]),g=c.createRadialGradient(q[0],q[1],0,q[0],q[1],r);g.addColorStop(0,`rgba(255,236,190,${.22*night})`);g.addColorStop(1,'rgba(255,236,190,0)');c.fillStyle=g;c.fillRect(q[0]-r,q[1]-r,2*r,2*r)}
    c.globalCompositeOperation='source-over';drawBoard(c,true)}}
/* the night shade for an outdoor scene, with lamps at the given world points */
function panoNight(c,lamps){const night=lightsOn();if(night<=.05)return;c.globalCompositeOperation='multiply';c.fillStyle=`rgba(70,80,115,${.55*night})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';
  for(const L of lamps||[]){const q=pj(L[0],L[1],L[2]);if(!seen(q[2]))continue;const r=Math.min(170,2.4*PAN.F/q[3]),g=c.createRadialGradient(q[0],q[1],0,q[0],q[1],r);g.addColorStop(0,`rgba(255,236,190,${.22*night})`);g.addColorStop(1,'rgba(255,236,190,0)');c.fillStyle=g;c.fillRect(q[0]-r,q[1]-r,2*r,2*r)}
  c.globalCompositeOperation='source-over'}

/* ---- the panel, going in and out ---- */
let stUiT=0;
function stSyncUI(){stUiT-=1/60;if(stUiT>0)return;stUiT=.5;const S=PAN.scene;$('stSub').textContent=S.sub?S.sub():'';
  for(const b of $('stActs').querySelectorAll('button')){const A=S.acts.find(a=>a[0]===b.dataset.a),cost=A&&A[2];b.disabled=!!cost&&STAT.wallet<cost;b.title=b.disabled?L2('টাকা কম','Not enough taka'):''}}
function stationSub(){const up=boardRows(),n=up[0]&&up[0].t;
  return n?L2(`এখন ${hhmm(HOUR)}। পরের ট্রেন ${n.bn}, ${hhmm(depH(n))}, ${bnNum(n.pl)} নম্বর প্ল্যাটফর্ম। টেনে বা তীরচিহ্ন দিয়ে চারপাশে, ওপরে দেখুন।`,`It's ${hhmm(HOUR)}. Next: ${n.en} at ${hhmm(depH(n))}, platform ${n.pl}. Drag, or use the arrow keys, to look around and up.`):''}
const ST_ACTS=[
 ['next',()=>L2('পরের ট্রেনটা দেখুন','Look at the next train'),0],
 ['tea',()=>L2('এক কাপ চা','A cup of tea'),10],
 ['ticket',()=>L2('টিকিটের খোঁজ নিন','Ask about tickets'),0],
 ['coolie',()=>L2('কুলির সাথে কথা','Talk to a porter'),0],
];
function lookAt(X,Y){PAN.goal=Math.atan2(Y,X);PAN.vy=0}
function stAct(k){
  if(k==='next'){const up=boardRows(),t=up[0]&&up[0].t;if(!t)return;const P=PLAT[t.pl-1];lookAt(P.tx,t.st==='away'?-60:Math.min(30,t.y-30));stSay(t.st==='away'?L2(`${t.bn} এখনো আসেনি। ${bnNum(t.pl)} নম্বরে আসবে।`,`The ${t.en} isn't in yet. It comes in on platform ${t.pl}.`):L2(`${t.bn} দাঁড়িয়ে আছে, ${bnNum(t.pl)} নম্বর প্ল্যাটফর্মে।`,`The ${t.en} is standing at platform ${t.pl}.`))}
  else if(k==='tea'){if(STAT.wallet<10)return;const a=PAN.crowd.find(a=>a.kind==='tea');if(a)lookAt(a.X,a.Y);addMoney(-10);addEnergy(4);HOUR=(HOUR+5/60)%24;playVoice('hawker_tea_1',me.x,me.y);stSay(L2('নেন মামা, গরম চা! দশ টাকা।','Here you go, mama, hot tea! Ten taka.'),a);updateStatusUI()}
  else if(k==='ticket'){lookAt(-8,-30);stSay(L2('আন্তঃনগরের টিকিট অনলাইনে, এনআইডি দিয়ে। কাউন্টারে শুধু যাত্রার দিনের স্ট্যান্ডিং টিকিট। চট্টগ্রাম শোভন চেয়ার ৪০৫ টাকা।','Intercity tickets are sold online, with your NID. The counter only sells standing tickets on the day. Chattogram, Shovan Chair: 405 taka.'))}
  else if(k==='coolie'){const a=PAN.crowd.filter(a=>a.kind==='coolie'&&!a.plat).sort((a,b)=>Math.hypot(a.X,a.Y)-Math.hypot(b.X,b.Y))[0];if(a)lookAt(a.X,a.Y);playVoice('coolie_1',me.x,me.y);stSay(L2('২৮ কেজির নিচে ব্যাগ ১৫ টাকা, বড় হইলে ৩৫। আপনার তো মাল নাই স্যার!','15 taka a bag under 28 kilos, 35 for the big ones. But you have no luggage, sir!'),a)}}
function buildPanoPanel(){const S=PAN.scene,n=PAN.place.name;
  $('stTitle').innerHTML=`<span class="bn">${n[0]}</span>${n[1]}`;
  $('stActs').innerHTML=S.acts.map(([k,t,cost])=>`<button class="dish" data-a="${k}"><span class="dn">${t()}</span>${cost?`<span class="dp">৳${cost}</span>`:''}</button>`).join('');
  for(const b of $('stActs').querySelectorAll('button'))b.onclick=()=>S.act(b.dataset.a);stUiT=0}
/* which place (if any) you are standing in */
function panoNear(){if(INSIDE)return null;for(const S of PANO_SCENES)for(const P of S.places())if(P.inside(me.x,me.y))return{S,P};return null}
const stationNear=()=>{const n=panoNear();return!!n&&n.S.key==='station'};
function enterPano(){const n=panoNear();if(!n)return;
  closeAct();INSIDE=true;PANO_ON=true;heldKeys.clear();me.path=null;me.goal=null;me.spd=0;me.enterOnArrive=null;
  hideCard();document.body.classList.add('inside');$('station').hidden=false;$('station').setAttribute('aria-label','Inside '+n.P.name[1]);$('btnEnter').hidden=true;
  PAN.scene=n.S;PAN.place=n.P;panoReset();n.S.init(n.P);buildPanoPanel()}
const enterStation=()=>{if(stationNear())enterPano()};
function leavePano(){if(!PANO_ON)return;INSIDE=false;PANO_ON=false;PAN.keys.clear();document.body.classList.remove('inside');$('station').hidden=true;heldKeys.clear();syncEnterBtn()}
const leaveStation=leavePano;
function enterNear(){if(panoNear())enterPano();else enterRestaurant()}
PANO_SCENES.push({key:'station',
  places:()=>{const F=sites.kamalapur;return F?[{name:['কমলাপুর রেলওয়ে স্টেশন','Kamalapur Railway Station'],inside:(x,y)=>inQuad(FQ(F,17,83,14,80),x,y)}]:[]},
  init:()=>{stInit();stSay(L2('কমলাপুর! চারদিকে ঘুরে দেখুন।','Kamalapur! Have a look around.'))},update:stUpdate,draw:drawStationScene,sub:stationSub,acts:ST_ACTS,act:stAct,
  marks:()=>[[0,L2('প্ল্যাটফর্ম','Platforms')],[-90,L2('টিকিট কাউন্টার','Ticket counters')],[180,L2('বাইরে · রিকশা, সিএনজি','Way out · rickshaws, CNGs')],[90,L2('বিশ্রামাগার · খাবার','Waiting room · food')]]});
$('btnStLeave').onclick=leavePano;
/* looking round: drag with a mouse or finger (it keeps turning a little when you let go), the wheel, or the arrow keys */
function bindPanoInput(cv){
cv.addEventListener('pointerdown',e=>{PAN.drag={x:e.clientX,y:e.clientY,pitch:PAN.pitch,yaw:PAN.yaw,lx:e.clientX,lt:performance.now()};PAN.vy=0;PAN.goal=null;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
cv.addEventListener('pointermove',e=>{const d=PAN.drag;if(!d)return;PAN.yaw=d.yaw-(e.clientX-d.x)/PAN.F;PAN.pitch=clamp(d.pitch+(e.clientY-d.y)/H,-.12,.85);const now=performance.now(),ddt=Math.max(1,now-d.lt);PAN.vy=-(e.clientX-d.lx)/PAN.F/(ddt/1000);d.lx=e.clientX;d.lt=now});
const up=()=>{if(!PAN.drag)return;if(performance.now()-PAN.drag.lt>90)PAN.vy=0;PAN.vy=clamp(PAN.vy,-4,4);PAN.drag=null;cv.style.cursor=''};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();PAN.yaw+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*.0025;PAN.goal=null;PAN.vy=0},{passive:false})}
bindPanoInput(stCv);
addEventListener('keydown',e=>{if(!INSIDE||e.target.tagName==='INPUT')return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','A','d','D','w','W','s','S'].includes(e.key)){PAN.keys.add(e.key);e.preventDefault()}});
addEventListener('keyup',e=>PAN.keys.delete(e.key));
