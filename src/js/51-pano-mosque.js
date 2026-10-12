/* ---------------- 360° scene: the east courtyard (shahan) of Baitul Mukarram National Mosque ----------------
   You stand in the paved east courtyard facing west, towards the main building (+X here; +Y is north, -Y south, -X east, behind you).
   From Wikipedia / Banglapedia: architect Abdulhusein M. Thariani; work began 1960, first prayers 1963, finished 1968; a cube modelled on the
   Kaaba, eight storeys and 30.18 m high, on a raised platform; verandas on three sides of the prayer hall; no central dome, but two shallow-domed
   entrance porticoes on the south and north with horseshoe arches; the east shahan is about 2,694 m² with ablution (wudu) spaces on its south
   and north sides; 40,000+ worshippers; shops (the Baitul Mukarram market, famous for gold and jewellery) are part of the complex.
   Invented or unverified [U]: the exact facade pattern of window slits; which faces of the porticoes carry the arches; the minaret's place and height
   (the original plan had a ~160 ft minaret on the south wing; Banglapedia says new minars were built to a new plan); the shop mix along the east edge;
   the women's prayer entrance on the north side; jamaat times (approximate, Dhaka, they move with the seasons); the stadium lying east, beyond the gate. */
const MQ={pig:[],slot:new Map(),t0:0,lastPh:'',lastH:0,annFor:'',fixKey:'',lookI:0,callT:12,begT:30,sky:null};
/* jamaat times [U]: approximate year-round Dhaka times; Friday (the weekend toggle) has Jumma at 13:30 instead of Dhuhr.
   pre: hours before the jamaat that people start coming; dur: the fard prayer; vf: how full the veranda gets, sf: how much of the shahan */
const MQ_PR=[
 {k:'fajr',bn:'ফজর',bg:'ফজরের',en:'Fajr',h:5.0,dur:.12,pre:.5,vf:.45,sf:0,az:.33},
 {k:'dhuhr',bn:'যোহর',bg:'যোহরের',en:'Dhuhr',h:13.25,dur:.16,pre:.55,vf:1,sf:.09,az:.5},
 {k:'asr',bn:'আসর',bg:'আসরের',en:'Asr',h:16.5,dur:.15,pre:.5,vf:.8,sf:0,az:.33},
 {k:'maghrib',bn:'মাগরিব',bg:'মাগরিবের',en:'Maghrib',h:17.95,dur:.13,pre:.4,vf:1,sf:.05,az:.08},
 {k:'isha',bn:'এশা',bg:'এশার',en:'Isha',h:19.75,dur:.16,pre:.5,vf:.65,sf:0,az:.33}];
const MQ_JUMMA={k:'jumma',bn:'জুমা',bg:'জুমার',en:'Jumma',h:13.5,dur:.17,pre:1.5,vf:1,sf:.96,az:.75,jm:true};   // first azan ~12:45, bayan and khutba, jamaat ~13:30 [U]
const mq_prayers=()=>FRIDAY?MQ_PR.map(P=>P.k==='dhuhr'?MQ_JUMMA:P):MQ_PR;
const mq_rel=h=>{let r=((HOUR-h)%24+24)%24;return r>12?r-24:r};   // hours since h, -12..12
const mq_hash=(a,b)=>{const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s)};
/* where in its cycle the mosque is: gather (people come, wudu), khutba (Jumma), pray, dua (sitting after the salam), leave, or idle */
function mq_state(){
  for(const P of mq_prayers()){const r=mq_rel(P.h),end=P.dur+.12;
    if(r<-P.pre||r>end+.4)continue;
    let ph,g;
    if(r<0){ph=P.jm&&r>-.6?'khutba':'gather';const t=clamp((r+P.pre)/(P.pre-(P.jm?.1:.03)),0,1);g=Math.pow(t,P.jm?1.2:1.6)}
    else if(r<P.dur){ph='pray';g=1}else if(r<end){ph='dua';g=1}else{ph='leave';g=clamp(1-(r-end)/.38,0,1)}
    const wet=rain>.6?(P.jm?.6:.4):1;
    return{P,r,ph,g,u:r/P.dur,vf:P.vf*g,sf:P.sf*g*wet}}
  return{P:null,ph:'idle',g:0,vf:0,sf:0}}
function mq_next(){let best=null,bd=99;for(const P of mq_prayers()){const d=((P.h-HOUR)%24+24)%24;if(d<bd){bd=d;best=P}}return best}
/* the rows (saf): three on the veranda behind the arches, and the courtyard rows that fill for Jumma, front first; you stand in a gap */
const MQ_VR=[32.1,33.2,34.3].map((X,i)=>({X,Z:1.5,y0:-25.6,n:72,i:100+i}));
const MQ_SR=[];for(let X=27.2,i=0;X>-20.6;X-=1.3,i++)if(Math.abs(X)>4.4)MQ_SR.push({X,Z:0,y0:-23,n:65,i});
const MQ_SP=.72;   // shoulder to shoulder
function mq_rowFrac(st,row){if(row.Z>0){const k=row.i-100;return clamp(st.vf*3-k,0,1)}const k=MQ_SR.indexOf(row);return clamp(st.sf*MQ_SR.length-k,0,1)}
/* one rak'ah, drawn simply: standing, bowing, prostration (shown as a low kneel), sitting, prostration */
function mq_cyc(t){t=((t%9)+9)%9;return t<3.6?'stand':t<5?'ruku':t<5.6?'stand':t<6.9?'sujud':t<7.6?'sit':t<8.9?'sujud':'stand'}
function mq_pose(st,row,k){
  if(st.ph==='pray')return st.u>.86?'sit':mq_cyc(PAN.t-MQ.t0);
  if(st.ph==='gather'){const h=mq_hash(row.i,k);if(h<.2)return mq_cyc(PAN.t+h*45)}   // a few pray their sunnah alone while the rest sit and wait
  return'sit'}

/* ---- people ---- */
function mq_mk(kind,X,Y,p,extra){p.pose='stand';p.fixed=true;p.ph=Math.random()*9;p.fc=Math.random()<.5?1:-1;
  const a=Object.assign({kind,p,X,Y,tx:X,ty:Y,mode:'idle',wait:mr(2,9),spd:mr(1.05,1.4)},extra||{});PAN.crowd.push(a);return a}
const mq_face=(a,dx,dy)=>{a.p.fc=(-a.Y*dx+a.X*dy)>0?1:-1};
const mq_fz=(X,Y)=>X>28&&Math.abs(Y)<27.5?Math.min(1.5,(X-28)*.5):0;   // the steps up to the veranda
const MQ_TAPS=[];for(const s of[-1,1])for(let X=-16.6;X<=20;X+=1.3)MQ_TAPS.push({X,Y:s*27.7,s,who:null});
const mq_exit=()=>Math.random()<.65?[-21.8,mr(-5,5)]:[mr(23.2,26.5),Math.random()<.5?-29.6:29.6];
function mq_shahanSpot(st){const rows=MQ_SR.filter(r=>mq_rowFrac(st,r)>0);if(!rows.length)return null;const r=mpick(rows),hw=mq_rowFrac(st,r)*r.n*MQ_SP/2;return[r.X,mr(-hw,hw)]}
function mq_worshipper(){const p=worshipper();if(p.look.female){p.look.headCover=true;if(Math.random()<.5){p.look.dress='borka';p.look.c1=mpick(['#1c1c28','#2a2a3a','#3a2a2a']);p.look.c2=p.look.c1}}else p.look.cap=Math.random()<.92;return p}
function mq_inbound(st,X,Y){const p=mq_worshipper(),q=X===undefined?mq_exit():[X,Y],a=mq_mk('wor',q[0],q[1],p,{spd:mr(1.15,1.5)});
  if(p.look.female){goTo(a,28.4,mr(25.6,27),true);return a}   // women go round to their own entrance on the north side [U]
  const toRow=()=>{const s=st.sf>0&&Math.random()<.85?mq_shahanSpot(mq_state()):null;if(s)goTo(a,s[0],s[1],true);else goTo(a,31.3,mr(-22,22),true)};
  const free=MQ_TAPS.filter(t=>!t.who);
  if(free.length&&Math.random()<.6){const t=mpick(free);t.who=a;a.tap=t;a.sit=true;goTo(a,t.X,t.Y);
    a.next=b=>{if(b.tap){b.tap.who=null;b.tap=null}b.sit=false;b.next=null;toRow()}}
  else toRow();return a}
function mq_outbound(st){const s=st.sf>0&&Math.random()<.7?mq_shahanSpot(st):null,q=s||[31.2,mr(-22,22)],p=mq_worshipper(),a=mq_mk('wor',q[0],q[1],p,{spd:mr(1.05,1.35)});
  const e=mq_exit();goTo(a,e[0],e[1],true);return a}
function mq_visitor(){const r=Math.random(),p=r<.15?makePerson('kid'):makePerson(mpick(['customer','office','student','customer','labour']));
  if(p.look.female)p.look.headCover=true;else if(Math.random()<.4){p.look.dress='panjabi';p.look.c1=mpick(['#f1eee6','#e8e2cf','#dfe7ee']);p.look.c2='#efece4';p.look.cap=Math.random()<.7}
  const e=mq_exit(),a=mq_mk('vis',e[0],e[1],p);a.next=mq_wander;mq_wander(a);a.delay=mr(0,4);return a}
function mq_wander(a){const r=Math.random();a.sit=false;
  if(r<.12){const e=mq_exit();goTo(a,e[0],e[1],true);return}
  if(r<.3){a.sit=true;goTo(a,28.25,mr(-24,24));return}   // sit on the steps in the building's shade
  let X,Y;do{X=mr(-18,25);Y=mr(-22,22)}while(Math.hypot(X,Y)<3.5);goTo(a,X,Y)}
function mq_beggarP(fem){const p=makePerson('beggar',fem),L=p.look;Object.assign(L,{skin:mpick(['#6b4028','#7a4a30','#8d5a3b']),hair:'#9a958c',h:L.h*.94,bag:false,tie:false,cap:false,gamchha:false,beard:!fem&&Math.random()<.6});
  if(fem){L.dress='sari';L.c1=mpick(['#8a7a68','#7a6a5a','#9a8a78']);L.c2=L.c1;L.headCover=true}else{L.dress='lungi';L.c1=mpick(['#bfae8a','#a89a7a','#b5a68c']);L.c2=mpick(['#6b6b5a','#5a5a4a']);L.cap=Math.random()<.5}
  p.bowl=true;return p}
/* the people who are always there at this hour: beggars at the gate, the attar and tupi seller, a tasbih seller on a cloth, a khadem sweeping, a night guard */
function mq_fixed(){const h=HOUR,night=h>22.5||h<4.5,vend=h>7.5&&h<21.8,beg=h>5.5&&h<22,sweep=h>5.8&&h<9.5;return{night,vend,beg,sweep,key:`${night}${vend}${beg}${sweep}${FRIDAY}`}}
function mq_placeFixed(){for(let i=PAN.crowd.length-1;i>=0;i--)if(PAN.crowd[i].fix)PAN.crowd.splice(i,1);
  const f=mq_fixed();MQ.fixKey=f.key;
  if(f.beg){const spots=[[-20.6,-8.3,0],[-20.6,8.5,1],[-19.9,-11.8,1],[-19.9,12,0]];for(let i=0;i<(FRIDAY?4:2);i++){const s=spots[i],a=mq_mk('beg',s[0],s[1],mq_beggarP(!!s[2]),{fix:true});a.p.pose='sit';a.sit=true;mq_face(a,1,0)}}
  if(f.vend){const v=makePerson('hawker',false);Object.assign(v.look,{dress:'panjabi',c1:'#e8e2cf',c2:'#efece4',cap:true,beard:true});v.act='serve';const a=mq_mk('attar',-14.2,7.6,v,{fix:true});mq_face(a,1,0);
    const t=makePerson('hawker',false);Object.assign(t.look,{dress:'lungi',c1:'#dfe7ee',c2:'#3f5f8a',cap:true,beard:Math.random()<.5});const b=mq_mk('tasbih',18,-13.7,t,{fix:true});b.p.pose='sit';b.sit=true;mq_face(b,-1,0)}
  if(f.sweep){const k=makePerson('labour',false);Object.assign(k.look,{dress:'panjabi',c1:'#d6e2cf',c2:'#efece4',cap:true});k.act='sweep';const a=mq_mk('khadem',-6,-14,k,{fix:true,spd:.45});
    a.next=b=>{goTo(b,mr(-17,24),mr(-20,20));b.p.act='sweep'};a.next(a)}
  if(f.night){const g=makePerson('police',false);Object.assign(g.look,{dress:'pants',c1:'#8a8a5a',c2:'#5a5a3a'});g.act='stick';const a=mq_mk('guard',-20.8,3.2,g,{fix:true});mq_face(a,1,0)}}
function mq_visTarget(st){const h=HOUR;let n=h>22.5||h<4.5?0:h<6.5?2:h<9?5:h<17.5?10:h<21?7:3;if(st.P&&st.P.jm&&st.ph!=='idle'&&st.ph!=='leave')n=0;return Math.round(n*(rain>.5?.4:1))}
/* everything that comes and goes, for this hour (on entering, and when the clock is moved by hand) */
function mq_populate(){for(let i=PAN.crowd.length-1;i>=0;i--)if(!PAN.crowd[i].fix)PAN.crowd.splice(i,1);for(const t of MQ_TAPS)t.who=null;
  mq_placeFixed();const st=mq_state();
  for(let i=0;i<mq_visTarget(st);i++){const a=mq_visitor();let X,Y;do{X=mr(-18,25);Y=mr(-22,22)}while(Math.hypot(X,Y)<3.5);a.X=X;a.Y=Y;a.delay=0;mq_wander(a)}
  if(st.ph==='gather'||st.ph==='khutba'){const n=Math.round(14*(st.P.jm?2:st.P.vf));for(let i=0;i<n;i++){const a=mq_inbound(st,mr(-20,24),mr(-20,20));if(a.tap){a.X=a.tap.X;a.Y=a.tap.Y;a.mode='idle';a.wait=mr(1,10);a.p.pose='sit'}}}
  if(st.ph==='leave'){for(let i=0;i<Math.round(16*(st.P.jm?2:st.P.vf)*st.g);i++){const a=mq_outbound(st);a.X+=(a.tx-a.X)*mr(0,.6);a.Y+=(a.ty-a.Y)*mr(0,.6)}}
  MQ.lastPh=st.ph;if(st.ph==='pray')MQ.t0=PAN.t;MQ.annFor=st.P&&st.r>-st.P.az?st.P.k:MQ.annFor}
function mq_pigeons(){MQ.pig=[];const R=mulberry32(5);for(let i=0;i<34;i++){const X=4+R()*14,Y=-9+R()*16;MQ.pig.push({X,Y,Z:0,tx:X,ty:Y,tz:0,st:'g',ph:R()*9,a:R()*TAU,col:R()<.2?'#b9b4ac':R()<.3?'#6f6a66':'#8a8c94'})}}
function mq_init(){MQ.slot.clear();mq_pigeons();if(mq_state().sf>.04||lightsOn()>.7)for(const g of MQ.pig){g.st='p';g.X=g.tx=31.2;g.Y=g.ty=mr(-25,25);g.Z=g.tz=9.95}MQ.lastH=HOUR;MQ.callT=mr(6,14);MQ.begT=mr(20,40);mq_populate();PAN.yaw=0;PAN.pitch=.12;
  stSay(L2('আসসালামু আলাইকুম! বায়তুল মোকাররমের পূর্ব চত্বরে স্বাগতম।','Assalamu alaikum! Welcome to the east courtyard of Baitul Mukarram.'))}

function mq_update(dt){
  if(Math.abs(mq_rel(MQ.lastH))>.15){MQ.lastH=HOUR;mq_populate();return}MQ.lastH=HOUR;   // the clock was moved: start this hour afresh
  if(mq_fixed().key!==MQ.fixKey)mq_placeFixed();
  const st=mq_state(),P=st.P;
  /* the azan, the khutba, the iqamah: shown as notices */
  if(P&&st.r>-P.az&&st.r<-P.az+.15&&MQ.annFor!==P.k){MQ.annFor=P.k;PAN.annT=12;sfx('amb_azan',me.x,me.y,.9);
    PAN.ann=L2(`আযান: ${P.bg} ওয়াক্ত হয়েছে। জামাত ${hhmm(P.h)}-এ (আনুমানিক)।`,`The azan: it is time for ${P.en}. The jamaat is at about ${hhmm(P.h)}.`);for(const g of MQ.pig)if(g.st==='g'&&Math.random()<.7)mq_fly(g)}
  if(st.ph!==MQ.lastPh){
    if(st.ph==='khutba'){PAN.ann=L2('জুমার খুতবা চলছে — মুসল্লিরা চুপচাপ বসে শুনছেন।','The Jumma khutba has begun: the worshippers sit and listen quietly.');PAN.annT=9}
    if(st.ph==='pray'){MQ.t0=PAN.t;PAN.ann=L2(`${P.bg} জামাত দাঁড়িয়ে গেছে। কাতার সোজা।`,`The ${P.en} jamaat has stood up. The rows are straight.`);PAN.annT=7}
    MQ.lastPh=st.ph}
  /* the flow of worshippers: in before the jamaat, out after */
  let walkers=0;for(const a of PAN.crowd)if(a.kind==='wor')walkers++;
  if((st.ph==='gather'||st.ph==='khutba')&&walkers<(P.jm?46:30)&&Math.random()<dt*(P.jm?2.6:1.3*P.vf+.3))mq_inbound(st);
  if(st.ph==='pray'&&walkers<6&&Math.random()<dt*.25)mq_inbound(st);   // a late-comer hurrying to join
  if((st.ph==='leave'||st.ph==='dua')&&walkers<(P.jm?46:30)&&Math.random()<dt*(st.ph==='dua'?.6:(P.jm?3.2:1.6*P.vf+.4)))mq_outbound(st);
  let vis=0;for(const a of PAN.crowd)if(a.kind==='vis')vis++;const vt=mq_visTarget(st);
  if(vis<vt&&Math.random()<dt*.35)mq_visitor();
  if(vis>vt+1){const a=PAN.crowd.find(a=>a.kind==='vis'&&!a.leave);if(a){const e=mq_exit();a.sit=false;goTo(a,e[0],e[1],true)}}
  panoWalk(dt);
  for(const a of PAN.crowd)if(a.tap&&a.mode==='idle'){mq_face(a,0,a.tap.s);a.p.act=null}
  for(const t of MQ_TAPS)if(t.who&&!PAN.crowd.includes(t.who))t.who=null;
  /* voices: the attar seller calls, a beggar asks softly near prayer times */
  MQ.callT-=dt;if(MQ.callT<=0){MQ.callT=mr(24,45);const v=PAN.crowd.find(a=>a.kind==='attar');if(v&&st.ph!=='pray'&&st.ph!=='khutba'){stSay(L2('আতর! সুরমা! সুতি টুপি, জায়নামাজ! আসল খাঁটি আতর নেন ভাই!','Attar! Surma! Cotton tupi, prayer mats! Pure attar, bhai!'),v);playVoice('hawker_attar_1',me.x,me.y)}}
  MQ.begT-=dt;if(MQ.begT<=0){MQ.begT=mr(30,60);const b=PAN.crowd.filter(a=>a.kind==='beg');if(b.length&&st.ph!=='pray'&&st.ph!=='khutba'){const a=mpick(b);stSay(a.p.look.female?L2('মা, একটু সাহায্য করেন, আল্লাহ আপনার ভালো করবে।','Please help a little; God will reward you.'):L2('আল্লাহর ওয়াস্তে কিছু দিন ভাই।','For the sake of God, give a little, bhai.'),a);playVoice(a.p.look.female?'beggar_2':'beggar_1',me.x,me.y)}}
  mq_pigUpdate(dt,st)}
/* pigeons: they peck about the paving, lift off together now and then, circle and come down; when the courtyard fills with rows they sit on the veranda parapet */
function mq_fly(g){g.st='f';g.ft=mr(5,10);g.a=Math.atan2(g.Y,g.X);g.R=mr(9,16);g.w=mr(.5,.8)*(Math.random()<.5?1:-1);g.cz=mr(7,12)}
function mq_pigUpdate(dt,st){const full=st.sf>.04,walk=PAN.crowd.filter(a=>a.mode==='walk');
  if(Math.random()<dt/45)for(const g of MQ.pig)if(g.st==='g'&&Math.random()<.8)mq_fly(g);
  for(const g of MQ.pig){g.ph+=dt;
    if(g.st==='g'){if(g.Z>0)continue;if(full||lightsOn()>.7&&Math.random()<dt*.1||walk.some(a=>Math.abs(a.X-g.X)<1.2&&Math.abs(a.Y-g.Y)<1.2)){mq_fly(g);continue}
      if(Math.random()<dt*.6){g.tx=g.X+mr(-.5,.5);g.ty=g.Y+mr(-.5,.5)}g.X+=(g.tx-g.X)*Math.min(1,dt*2);g.Y+=(g.ty-g.Y)*Math.min(1,dt*2)}
    else if(g.st==='f'){g.a+=g.w*dt;g.X=12+Math.cos(g.a)*g.R;g.Y=Math.sin(g.a)*g.R;g.Z+=(g.cz-g.Z)*Math.min(1,dt*1.5);g.ft-=dt;
      if(g.ft<=0){g.st='l';if(full||lightsOn()>.7){g.tx=31.2;g.ty=mr(-25,25);g.tz=9.95}else{g.tx=mr(4,18);g.ty=mr(-9,8);g.tz=0}}}
    else if(g.st==='l'){const dx=g.tx-g.X,dy=g.ty-g.Y,dz=g.tz-g.Z,L=Math.hypot(dx,dy,dz);if(L<.2){g.X=g.tx;g.Y=g.ty;g.Z=g.tz;g.st=g.tz>0?'p':'g';continue}const s=Math.min(L,7*dt);g.X+=dx/L*s;g.Y+=dy/L*s;g.Z+=dz/L*s}
    if(g.st==='p'&&!full&&lightsOn()<.5&&Math.random()<dt/30){g.st='l';g.tx=mr(4,18);g.ty=mr(-9,8);g.tz=0}}}

/* ---- drawing helpers ---- */
const mq_wX=(c,x,y0,y1,z0,z1,col,a=.6,w=1,step=2)=>fill3(c,[[x,y0,z0],[x,y1,z0],[x,y1,z1],[x,y0,z1]],col,INK,a,w,step);
const mq_wY=(c,y,x0,x1,z0,z1,col,a=.6,w=1,step=2)=>fill3(c,[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]],col,INK,a,w,step);
/* a flat shape turned to face you (for round things: the minaret, domes, tree crowns) */
function mq_bb(X,Y){const ph=Math.atan2(Y,X),ux=-Math.sin(ph),uy=Math.cos(ph);return(u,z)=>[X+ux*u,Y+uy*u,z]}
function mq_qp(c,pts){const q=pts.map(p=>pj(p[0],p[1],p[2]));if(q.some(p=>Math.abs(p[2])>2.6)||!q.some(p=>seen(p[2])))return false;c.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)c.lineTo(q[i][0],q[i][1]);c.closePath();return true}
function mq_dome(c,X,Y,z,r,rise,col){const B=mq_bb(X,Y),pts=[];for(let k=0;k<=12;k++){const t=k/12*Math.PI;pts.push(B(Math.cos(t)*r,z+Math.sin(t)*rise))}fill3(c,pts,col,INK,.65,1,1);
  ink3(c,[B(0,z+rise),B(0,z+rise+1.6)],'#8a7a4a',.9,1.2,1);const q=pj(...B(0,z+rise+2));if(seen(q[2])){const s=PAN.F/q[3];c.beginPath();c.arc(q[0],q[1]+.2*s,.4*s,-Math.PI/2+.9,-Math.PI/2-.9+TAU,false);c.strokeStyle='#8a7a4a';c.lineWidth=Math.max(1,.12*s);c.globalAlpha=.9;c.stroke();c.globalAlpha=1}}
function mq_tree(c,X,Y,h,R,col){const B=mq_bb(X,Y);fill3(c,[B(-.3,0),B(.3,0),B(.22,h*.6),B(-.22,h*.6)],wash('#6b5240',.8),INK,.5,1,1);
  const blobs=[[0,h*.7,R],[-R*.6,h*.62,R*.7],[R*.6,h*.64,R*.75],[0,h*.95,R*.65]];for(const[u,z,r]of blobs){const q=pj(...B(u,z));if(!seen(q[2]))continue;const s=PAN.F/q[3];c.beginPath();c.ellipse(q[0],q[1],r*s,r*.7*s,0,0,TAU);c.fillStyle=wash(col,.62);c.fill();c.strokeStyle=INK;c.globalAlpha=.3;c.lineWidth=1;c.stroke();c.globalAlpha=1}}


/* ---- far things ---- */
function mq_skyline(c){if(!MQ.sky){const R=mulberry32(321);MQ.sky=[];for(let i=0;i<60;i++){const a=R()*TAU,r=110+R()*140;MQ.sky.push({a,w:(7+R()*16)/r,r,h:14+R()*44,col:['#cdd3d6','#d8d0c0','#c7cfc4','#d6c9b8','#dcd2c6'][i%5]})}MQ.sky.sort((a,b)=>b.r-a.r)}
  for(const b of MQ.sky){const A=[Math.cos(b.a-b.w)*b.r,Math.sin(b.a-b.w)*b.r],B=[Math.cos(b.a+b.w)*b.r,Math.sin(b.a+b.w)*b.r];const q=fill3(c,[[A[0],A[1],0],[B[0],B[1],0],[B[0],B[1],b.h],[A[0],A[1],b.h]],wash(b.col,.7),INK,.3,.8,8);
    if(q&&b.h>30&&lightsOn()>.4){c.fillStyle=`rgba(255,226,150,${.5*lightsOn()})`;const m=pj((A[0]+B[0])/2,(A[1]+B[1])/2,b.h*.6),s=PAN.F/m[3];for(let k=0;k<4;k++)c.fillRect(m[0]-2*s+k*1.3*s,m[1]+(k%2)*3*s,.5*s,.7*s)}}}
function mq_stadium(c){   // across the road to the east: the stadium market and, beyond, the National Stadium's stands and floodlight masts [U]
  fill3(c,[[-27,-30,-3],[-41,-30,-3],[-41,30,-3],[-27,30,-3]],wash('#8f8a80',.6),null,0,1,4);
  for(let y=-40;y<40;y+=16)mq_wX(c,-110,y,y+16,-3,22,wash('#c9c3b6',.85),.45,1,6);
  for(const[X,Y]of[[-112,-46],[-112,34],[-190,-46],[-190,34]]){const B=mq_bb(X,Y);ink3(c,[B(0,-3),B(0,56)],'#7a7468',.8,1.6,4);fill3(c,[B(-4,52),B(4,52),B(4,58),B(-4,58)],wash('#9a948a',.9),INK,.6,1,2);
    if(lightsOn()>.5)fill3(c,[B(-3.6,52.6),B(3.6,52.6),B(3.6,57.4),B(-3.6,57.4)],'#fff3c8',null,0,1,2)}
  label3(c,-110,-4,24.5,L2('জাতীয় স্টেডিয়াম','National Stadium'),2.4,'#5a534a');
  for(let y=-40;y<40;y+=10){const col=['#d8cdb8','#cfc8ba','#d9d2c2','#c9bfae'][((y+40)/10)%4];mq_wX(c,-42,y,y+10,-3,8+((y/10)&1)*2,wash(col,.85),.5,1,3);mq_wX(c,-41.9,y+.6,y+9.4,-2.8,-.4,'rgba(60,55,50,.5)',.4,.8,3)}}
function mq_minaret(c){const X=52,Y=-46,B=mq_bb(X,Y),col=wash('#f2efe8',.95);   // the tall new minaret on the south side [U]
  fill3(c,[B(-2.6,0),B(2.6,0),B(2.6,9),B(-2.6,9)],col,INK,.6,1,1);
  fill3(c,[B(-1.5,9),B(1.5,9),B(1.3,45),B(-1.3,45)],col,INK,.6,1,1);
  for(const z of[19,31,43]){fill3(c,[B(-2.1,z),B(2.1,z),B(2.1,z+.8),B(-2.1,z+.8)],wash('#e3dccc',.95),INK,.6,1,1);c.beginPath();for(let u=-1.9;u<=1.9;u+=.42)line3(c,[B(u,z+.8),B(u,z+1.7)],2);ink3(c,[B(-2.1,z+1.7),B(2.1,z+1.7)],INK,.6,1,1);c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=.8;c.stroke();c.globalAlpha=1}
  c.beginPath();for(let z=11;z<43;z+=4){mq_qp(c,[B(-.25,z),B(.25,z),B(.25,z+1.8),B(-.25,z+1.8)])}c.fillStyle='rgba(60,60,70,.45)';c.fill();
  fill3(c,[B(-1.4,45),B(1.4,45),B(1.4,48.4),B(-1.4,48.4)],col,INK,.6,1,1);mq_dome(c,X,Y,48.4,1.5,1.7,wash('#e9e4d8',.95))}
function mq_portico(c,s){const y0=s*27.2,y1=s*37,X0=40,X1=54,z0=1.5,z1=12.5,col=wash('#efece4',.95);   // the domed entrance porticoes, south and north
  fill3(c,[[X0,y0,z0],[X1,y0,z0],[X1,y0,z1],[X0,y0,z1]],wash('#e2ddd0',.95),INK,.5,1,1.5);
  const q=mq_wX(c,X0,y0,y1,z0,z1,col,.6,1,1.5);if(!q)return;
  c.beginPath();for(let k=0;k<3;k++){const w=k===1?3.2:2.4,m=y0+(y1-y0)*(k+.5)/3,top=k===1?9.6:8.6,pts=[[X0,m-w/2,z0],[X0,m-w/2,top-w*.55]];   // three horseshoe arches, the middle one larger [U which faces]
    for(let j=0;j<=10;j++){const t=-.25*Math.PI+j/10*1.5*Math.PI;pts.push([X0,m-Math.cos(t)*w*.62,top-w*.55+Math.sin(t)*w*.62])}pts.push([X0,m+w/2,top-w*.55],[X0,m+w/2,z0]);mq_qp(c,pts)}
  c.fillStyle='rgba(70,64,56,.55)';c.fill();ink3(c,[[X0,y0,z1-1],[X0,y1,z1-1]],INK,.4,1,1.5);
  mq_dome(c,(X0+X1)/2,(y0+y1)/2,z1,5.2,2.6,wash('#ece7db',.95))}
function mq_cube(c){const X=35.5,col=wash('#f2f0ea',.97);
  for(let y=-22;y<22;y+=11)mq_wX(c,X,y,y+11,1.5,31.5,col,.55,1,1.5);
  c.beginPath();for(const z of[11,14.6,18.2,21.8,25.4])for(let i=0;i<14;i++){const y=-20.6+i*3.1;mq_qp(c,[[X-.02,y,z],[X-.02,y+.62,z],[X-.02,y+.62,z+2.3],[X-.02,y,z+2.3]])}   // bands of narrow windows [U pattern]
  c.fillStyle='rgba(70,72,82,.5)';c.fill();
  c.beginPath();for(let i=0;i<=44;i++){const y=-22+i;mq_qp(c,[[X-.03,y+.25,29.3],[X-.03,y+.75,29.3],[X-.03,y+.75,30.6],[X-.03,y+.25,30.6]])}c.fillStyle='rgba(90,86,80,.35)';c.fill();   // a pierced band under the cornice [U]
  ink3(c,[[X-.02,-22,29],[X-.02,22,29]],INK,.5,1,1.5);ink3(c,[[X-.02,-22,31],[X-.02,22,31]],INK,.5,1,1.5);
  c.beginPath();for(const y of[-22,-11,0,11,22])line3(c,[[X-.02,y,9.9],[X-.02,y,29]],2);c.strokeStyle=INK;c.globalAlpha=.18;c.lineWidth=1;c.stroke();c.globalAlpha=1}
/* the veranda: ceiling and back wall seen through the arches, the rows inside, then the arcade itself */
function mq_veranda(c,st){const X0=31,X1=35.5,zf=1.5,zc=9;
  for(let y=-27;y<27;y+=9){fill3(c,[[X0,y,zc],[X1,y,zc],[X1,y+9,zc],[X0,y+9,zc]],wash('#c9c1b0',.9),null,0,1,2);mq_wX(c,X1-.02,y,y+9,zf,zc,wash('#b5ab98',.85),.3,1,2);fill3(c,[[X0,y,zf],[X1,y,zf],[X1,y+9,zf],[X0,y+9,zf]],wash('#d9d3c6',.9),null,0,1,2)}
  c.beginPath();for(let i=0;i<8;i++){const y=-24.4+i*6.75;mq_qp(c,[[X1-.04,y,zf],[X1-.04,y+2.4,zf],[X1-.04,y+2.4,zf+4.2],[X1-.04,y,zf+4.2]])}c.fillStyle='rgba(55,50,45,.55)';c.fill();   // doorways into the hall
  if(lightsOn()>.3){c.beginPath();for(let i=0;i<16;i++){const q=pj(33,-25.3+i*3.375,8.6);if(seen(q[2])){const r=.18*PAN.F/q[3];c.moveTo(q[0]+r,q[1]);c.arc(q[0],q[1],r,0,TAU)}}c.fillStyle='#fff3c8';c.fill()}
  for(const row of MQ_VR)mq_rowDraw(c,st,row,row.y0,row.y0+row.n*MQ_SP);
  /* the arcade: 16 bays, a round arch in each [U shape] */
  const bw=54/16;
  for(let i=0;i<16;i++){const y0=-27+i*bw,y1=y0+bw,m=(y0+y1)/2,hw=1.25,spring=6.7;
    const outer=poly3([[X0,y0,0],[X0,y1,0],[X0,y1,10],[X0,y0,10]],1.2);if(!outer)continue;
    c.beginPath();c.moveTo(outer[0][0],outer[0][1]);for(const p of outer)c.lineTo(p[0],p[1]);c.closePath();
    const arch=[[X0,m-hw,zf],[X0,m-hw,spring]];for(let j=1;j<10;j++){const t=Math.PI-j/10*Math.PI;arch.push([X0,m+Math.cos(t)*hw,spring+Math.sin(t)*hw])}arch.push([X0,m+hw,spring],[X0,m+hw,zf]);mq_qp(c,arch);
    c.fillStyle=wash('#f1eee7',.97);c.fill('evenodd');c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=1;c.stroke();c.globalAlpha=1}
  ink3(c,[[X0,-27,9.1],[X0,27,9.1]],INK,.45,1,1.5);ink3(c,[[X0,-27,1.5],[X0,27,1.5]],INK,.35,1,1.5);
  label3(c,X0,0,9.55,L2('বায়তুল মোকাররম জাতীয় মসজিদ','Baitul Mukarram National Mosque'),.7,'#2f5f3a','700')}
function mq_steps(c){const X0=28,X1=31;
  for(let y=-27.5;y<27.5;y+=11){fill3(c,[[X0,y,0],[X1,y,1.5],[X1,y+11,1.5],[X0,y+11,0]],wash('#e6e1d4',.95),null,0,1,2)}
  c.beginPath();for(let k=0;k<6;k++){const x=X0+k*.5,z=k*.25;line3(c,[[x,-27.5,z],[x,27.5,z]],2);line3(c,[[x,-27.5,z+.25],[x,27.5,z+.25]],2)}c.strokeStyle=INK;c.globalAlpha=.28;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  for(const s of[-1,1]){fill3(c,[[X0-.4,s*27.5,0],[X1,s*27.5,0],[X1,s*27.5,2.4],[X0-.4,s*27.5,.9]],wash('#dcd5c6',.95),INK,.55,1,1);
    /* shoe racks at both ends of the steps */
    const y0=s>0?19:-25,y1=s>0?25:-19,X=27.1;const q=mq_wX(c,X,y0,y1,0,1.5,wash('#7a5a3a',.8),.6,1,1);
    if(q){c.beginPath();for(const z of[.4,.8,1.2])line3(c,[[X-.01,y0,z],[X-.01,y1,z]],1);c.strokeStyle='#3f2f20';c.globalAlpha=.7;c.lineWidth=1;c.stroke();c.globalAlpha=1;
      c.beginPath();for(const z of[.05,.45,.85])for(let y=y0+.3;y<y1-.2;y+=.42){if(mq_hash(y,z)<.25)continue;const p=pj(X-.03,y,z+.08);if(!seen(p[2]))continue;const r=.13*PAN.F/p[3];c.moveTo(p[0]+r,p[1]);c.ellipse(p[0],p[1],r,r*.45,0,0,TAU)}c.fillStyle='#3a2f28';c.globalAlpha=.75;c.fill();c.globalAlpha=1;
      label3(c,X,(y0+y1)/2,1.85,L2('জুতা রাখুন','Shoes here'),.36,'#5a3a20')}}
  /* the jamaat timetable board by the steps, and the sign to the women's prayer place [U] */
  const B=mq_bb(26.4,-7.5),ok=fill3(c,[B(-1.4,1.2),B(1.4,1.2),B(1.4,3.4),B(-1.4,3.4)],'#f7f4ea',INK,.8,1.1,.5);
  if(ok){ink3(c,[B(-1.1,0),B(-1.1,1.2)],INK,.7,1.2,1);ink3(c,[B(1.1,0),B(1.1,1.2)],INK,.7,1.2,1);label3(c,...B(0,3.15),L2('জামাতের সময়','Jamaat times'),.2,'#2f5f3a','700');
    mq_prayers().forEach((P,i)=>label3(c,...B(0,2.85-i*.31),`${LANG==='en'?P.en:P.bn}  ${hhmm(P.h)}`,.17,INK,'500'))}
  const G=mq_bb(26.2,23.6);if(fill3(c,[G(-1.1,1.9),G(1.1,1.9),G(1.1,2.6),G(-1.1,2.6)],'#e9f1e4',INK,.7,1,.5)){ink3(c,[G(0,0),G(0,1.9)],INK,.7,1.2,1);label3(c,...G(0,2.25),L2('মহিলাদের নামাজের স্থান →','Women\'s prayer area →'),.17,'#2f5f3a','600')}}
function mq_wudu(c,st){for(const s of[-1,1]){const yw=s*28.8,yf=s*25.4,X0=-18,X1=21;   // the ablution places on the south and north sides
  for(let x=X0;x<X1;x+=6.5){mq_wY(c,yw,x,x+6.5,0,3.3,wash('#dfe7ee',.9),.45,1,2);fill3(c,[[x,yf,3.3],[x+6.5,yf,3.3],[x+6.5,yw,3.3],[x,yw,3.3]],wash('#c9c6be',.9),null,0,1,2)}
  c.beginPath();for(let x=X0;x<=X1;x+=.8)line3(c,[[x,yw-s*.02,0],[x,yw-s*.02,1.9]],2);for(let z=.4;z<1.9;z+=.4)line3(c,[[X0,yw-s*.02,z],[X1,yw-s*.02,z]],2);c.strokeStyle='#8aa0b0';c.globalAlpha=.35;c.lineWidth=.7;c.stroke();c.globalAlpha=1;   // glazed tiles
  for(let x=X0;x<X1;x+=6.5){fill3(c,[[x,s*28.5,0],[x+6.5,s*28.5,0],[x+6.5,s*28.5,.75],[x,s*28.5,.75]],wash('#bfc6c9',.9),INK,.4,.8,2);fill3(c,[[x,s*28.5,.75],[x+6.5,s*28.5,.75],[x+6.5,s*28.8,.75],[x,s*28.8,.75]],wash('#d5dadc',.9),null,0,1,2)}
  ink3(c,[[X0,s*28.1,.02],[X1,s*28.1,.02]],'#7a8a90',.6,1.2,2);   // the drain channel
  c.beginPath();for(const t of MQ_TAPS){if(t.s!==s)continue;const a=pj(t.X,s*28.6,.95),b=pj(t.X,s*28.3,.95),d=pj(t.X,s*28.3,.82);if(!seen(a[2]))continue;c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1])}c.strokeStyle='#6b7378';c.lineWidth=1.6;c.stroke();
  c.beginPath();for(const t of MQ_TAPS){if(t.s!==s)continue;mq_qp(c,[[t.X-.2,s*27.5,.32],[t.X+.2,s*27.5,.32],[t.X+.2,s*27.5,0],[t.X-.2,s*27.5,0]])}c.fillStyle=wash('#9a948a',.9);c.fill();   // low seats
  for(let x=X0;x<=X1;x+=6.5)ink3(c,[[x,yf+s*.1,0],[x,yf+s*.1,3.3]],wash('#c9c3b5',.95),.9,3,1);
  mq_wY(c,yf,X0,X1,3.3,3.9,wash('#e8e3d6',.95),.6,1,2);label3(c,(X0+X1)/2-6,yf,3.6,L2('অজুখানা','Wudu khana · ablutions'),.42,'#2f5f8a')}}
const MQ_SHOPS=[   // the Baitul Mukarram market along the east edge [U which shop is where]
 [-29.5,-23.6,'জুয়েলার্স · সোনা','Jewellers · gold','#c79a2a','gold'],[-23.4,-18,'জুয়েলার্স','Jewellers','#c79a2a','gold'],[-17.8,-12.6,'টুপি · আতর · তসবিহ','Tupi · attar · tasbih','#2f6b4f','cap'],[-12.4,-7.4,'কুরআন · ইসলামি বই','Quran · Islamic books','#2f5f8a','book'],
 [7.4,12.6,'জায়নামাজ · বোরকা','Prayer mats · borka','#6b3f5a','mat'],[12.8,18.4,'ইলেকট্রনিক্স','Electronics','#3a4a6b','elec'],[18.6,24,'মোবাইল · ঘড়ি','Mobiles · watches','#3a4a6b','elec'],[24.2,29.5,'স্বর্ণালংকার','Gold ornaments','#c79a2a','gold']];
function mq_shops(c){const X=-23,open=HOUR>9.8&&HOUR<21.2&&!(FRIDAY&&HOUR>12.3&&HOUR<14.5);
  for(const s of[-1,1]){const y0=s<0?-30:7,y1=s<0?-7:30;mq_wX(c,X,y0,y1,0,7.8,wash('#e6dcc8',.92),.6,1,1.5);
    c.beginPath();for(let y=y0+.5;y<y1-1;y+=2.9){const m=y+1.2;const arch=[[X+.01,m-1,4.2],[X+.01,m-1,6]];for(let j=1;j<8;j++){const t=Math.PI-j/8*Math.PI;arch.push([X+.01,m+Math.cos(t),6+Math.sin(t)*.9])}arch.push([X+.01,m+1,6],[X+.01,m+1,4.2]);mq_qp(c,arch)}c.fillStyle='rgba(80,70,60,.45)';c.fill();
    ink3(c,[[X+.01,y0,3.9],[X+.01,y1,3.9]],INK,.4,1,1.5)}
  for(const[y0,y1,bn,en,col,k]of MQ_SHOPS){const q=mq_wX(c,X+.03,y0,y1,.1,2.9,open?'rgba(60,52,44,.6)':wash('#9aa0a6',.85),.6,.8,1);if(!q)continue;
    if(!open){c.beginPath();for(let z=.3;z<2.9;z+=.22)line3(c,[[X+.04,y0,z],[X+.04,y1,z]],1);c.strokeStyle=INK;c.globalAlpha=.25;c.lineWidth=.7;c.stroke();c.globalAlpha=1}
    else{const m=(y0+y1)/2;
      if(k==='gold'){fill3(c,[[X+.6,y0+.4,0],[X+.6,y1-.4,0],[X+.6,y1-.4,1],[X+.6,y0+.4,1]],'rgba(205,225,230,.55)',INK,.5,.8,1);c.beginPath();for(let y=y0+.7;y<y1-.6;y+=.35)for(const z of[.55,.8,1.7,2.1]){const p=pj(X+.5,y,z);if(seen(p[2])){const r=.06*PAN.F/p[3];c.moveTo(p[0]+r,p[1]);c.arc(p[0],p[1],r,0,TAU)}}c.fillStyle='#e3b23c';c.fill()}
      else if(k==='cap'){c.beginPath();for(let y=y0+.6;y<y1-.5;y+=.45)for(const z of[.9,1.4,1.9]){const p=pj(X+.4,y,z);if(seen(p[2])){const r=.17*PAN.F/p[3];c.moveTo(p[0]+r,p[1]);c.arc(p[0],p[1],r,Math.PI,TAU)}}c.fillStyle='#f7f5ee';c.fill();c.strokeStyle=INK;c.globalAlpha=.4;c.lineWidth=.6;c.stroke();c.globalAlpha=1}
      else if(k==='book'){const cols=['#2f6b4f','#7a2f35','#2f5f8a','#c79a2a','#f1eee6'];for(let r=0;r<3;r++)for(let y=y0+.5;y<y1-.6;y+=.5)fill3(c,[[X+.3,y,.7+r*.65],[X+.3,y+.4,.7+r*.65],[X+.3,y+.4,1.15+r*.65],[X+.3,y,1.15+r*.65]],wash(cols[(Math.abs(y*2|0)+r)%5],.8),null,0,1,1)}
      else if(k==='mat'){const cols=['#2f6b4f','#7a2f35','#3a4a6b','#6b3f5a'];for(let y=y0+.5,i=0;y<y1-.8;y+=.9,i++)fill3(c,[[X+.3,y,.2],[X+.3,y+.7,.2],[X+.3,y+.7,2.4],[X+.3,y,2.4]],wash(cols[i%4],.75),INK,.4,.6,1)}
      else{c.beginPath();for(let y=y0+.6;y<y1-.8;y+=.9)for(const z of[.5,1.3,2]){mq_qp(c,[[X+.3,y,z],[X+.3,y+.7,z],[X+.3,y+.7,z+.5],[X+.3,y,z+.5]])}c.fillStyle='#2a2d33';c.globalAlpha=.75;c.fill();c.globalAlpha=1}
      if(lightsOn()>.3){const p=pj(X+.2,m,2.6);if(seen(p[2])){const r=.15*PAN.F/p[3];c.fillStyle='#fff6d8';c.fillRect(p[0]-r*3,p[1]-r*.3,r*6,r*.6)}}}
    fill3(c,[[X+.05,y0+.1,3],[X+.05,y1-.1,3],[X+.05,y1-.1,3.75],[X+.05,y0+.1,3.75]],wash(col,.85),INK,.6,.8,1);label3(c,X+.06,(y0+y1)/2,3.38,L2(bn,en),.36,'#f7f2e6','700')}
  /* the east gate: two pylons and a lintel; through it the stairs down to the road */
  fill3(c,[[-22,-6,0],[-27,-6,-3],[-27,6,-3],[-22,6,0]],wash('#cfc8b8',.9),null,0,1,1);c.beginPath();for(let k=1;k<10;k++){const x=-22-k*.5;line3(c,[[x,-6,-k*.3],[x,6,-k*.3]],2)}c.strokeStyle=INK;c.globalAlpha=.25;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  for(const s of[-1,1]){mq_wX(c,-23,s*6,s*7,0,7.4,wash('#ece7db',.95),.65,1,1);mq_wY(c,s*6,-23,-24.2,0,7.4,wash('#ddd6c8',.95),.5,1,1)}
  mq_wX(c,-23,-7,7,6.2,7.8,wash('#ece7db',.95),.65,1,1);fill3(c,[[-22.98,-4.6,6.45],[-22.98,4.6,6.45],[-22.98,4.6,7.55],[-22.98,-4.6,7.55]],wash('#2f6b4f',.85),INK,.6,.8,1);
  label3(c,-22.97,0,7,L2('বায়তুল মোকাররম · পূর্ব গেট','Baitul Mukarram · East gate'),.5,'#f7f2e6','700')}
function mq_floor(c){c.beginPath();for(let y=-24;y<=24;y+=3)line3(c,[[-22,y,0],[28,y,0]],1.6);for(let x=-21;x<=28;x+=3)line3(c,[[x,-25.4,0],[x,25.4,0]],1.6);c.strokeStyle='#8a8478';c.globalAlpha=.2;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  c.beginPath();for(const y of[-25.3,25.3])line3(c,[[-22,y,0],[28,y,0]],1.6);c.strokeStyle='#7a7468';c.globalAlpha=.35;c.lineWidth=1.2;c.stroke();c.globalAlpha=1}
/* a stretch of one row: prayer mats under it, then each person, drawn simply when far and as full figures when close */
const MQ_CLOTH=['#f4f1ea','#efe8d8','#e6e6de','#dfe7ee','#e9e1cc'],MQ_SKIN=['#8d5a3b','#a0694a','#7a4a30','#94603f'];
function mq_rowDraw(c,st,row,ya,yb){const frac=mq_rowFrac(st,row);if(frac<=0)return;const hw=frac*row.n*MQ_SP/2,lo=Math.max(ya,-hw),hi=Math.min(yb,hw);if(hi<=lo)return;
  if(row.Z===0)fill3(c,[[row.X-.55,lo,.01],[row.X+.6,lo,.01],[row.X+.6,hi,.01],[row.X-.55,hi,.01]],wash(row.i%2?'#7a2f35':'#2f6b4f',.55),INK,.25,.6,2);
  const k0=Math.ceil((lo-row.y0)/MQ_SP-1e-6),k1=Math.floor((hi-row.y0)/MQ_SP+1e-6),bands={};let heads=[],caps=[],near=[],laps=[],sz=0,cnt=0;
  for(let k=k0;k<=k1;k++){if(k<0||k>=row.n)continue;const Y=row.y0+k*MQ_SP,q=pj(row.X,Y,row.Z);if(!seen(q[2]))continue;const pose=mq_pose(st,row,k);
    if(row.Z===0&&q[3]<8){near.push([k,Y,pose,q[3]]);continue}
    const s=PAN.F/q[3],h=mq_hash(row.i,k),col=MQ_CLOTH[(h*5)|0];sz+=s;cnt++;
    const top=pose==='stand'?1.38:pose==='ruku'?1.02:pose==='sit'?.8:.45,hd=pose==='stand'?1.55:pose==='ruku'?1.02:pose==='sit'?.97:.28,dx=pose==='ruku'||pose==='sujud'?(Y<0?1:-1)*.22*s:0;
    (bands[col]||(bands[col]=[])).push([q[0],q[1],q[1]-top*s,pose==='sujud'?.62*s:.4*s]);if(pose==='sit')laps.push([q[0],q[1],s,col]);heads.push([q[0]+dx,q[1]-hd*s,.115*s,MQ_SKIN[(h*17|0)%4]]);if(h<.93)caps.push([q[0]+dx,q[1]-hd*s,.12*s])}
  const av=cnt?sz/cnt:1;c.lineCap='butt';
  for(const col in bands){c.beginPath();let w=0;for(const b of bands[col]){c.moveTo(b[0],b[1]-b[3]*.3);c.lineTo(b[0],b[2]+b[3]*.3);w+=b[3]}c.strokeStyle=col;c.lineWidth=w/bands[col].length;c.stroke()}
  c.lineCap='round';
  if(av>3){c.beginPath();for(const col in bands)for(const b of bands[col]){c.moveTo(b[0]-b[3]/2,b[1]-b[3]*.3);c.lineTo(b[0]-b[3]/2,b[2]+b[3]*.3)}c.strokeStyle=INK;c.globalAlpha=.35;c.lineWidth=.7;c.stroke();c.globalAlpha=1}
  if(laps.length){c.beginPath();for(const l of laps){c.moveTo(l[0]+.34*l[2],l[1]-.12*l[2]);c.ellipse(l[0],l[1]-.12*l[2],.34*l[2],.13*l[2],0,0,TAU)}c.fillStyle=MQ_CLOTH[1];c.fill()}
  for(let si=0;si<4;si++){c.beginPath();let any=false;for(const h of heads)if(h[3]===MQ_SKIN[si]){const r=Math.max(.6,h[2]);c.moveTo(h[0]+r,h[1]);c.arc(h[0],h[1],r,0,TAU);any=true}if(any){c.fillStyle=MQ_SKIN[si];c.fill()}}
  c.beginPath();for(const h of caps){c.moveTo(h[0]+h[2],h[1]);c.arc(h[0],h[1],Math.max(.6,h[2]),Math.PI,TAU)}c.fillStyle='#faf8f2';c.fill();
  for(const[k,Y,pose]of near.sort((a,b)=>b[3]-a[3])){const key=row.i*1000+k;let p=MQ.slot.get(key);if(!p){p=worshipper();if(p.look.female)p=worshipper();p.look.female=false;p.look.cap=true;p.look.dress='panjabi';p.fixed=true;MQ.slot.set(key,p)}
    p.pose=pose==='sujud'?'squat':pose==='sit'?'sit':'stand';p.act=null;p.fc=Y<0?1:-1;figAt(c,p,row.X,Y,row.Z)}}
function mq_lamp(c,X,Y){const B=mq_bb(X,Y);ink3(c,[B(0,0),B(0,4.6)],'#4a4a4a',.85,Math.max(1,.14*PAN.F/Math.hypot(X,Y)),1);const q=pj(X,Y,4.8);if(!seen(q[2]))return;const s=PAN.F/q[3];
  c.fillStyle=lightsOn()>.3?'#fff3c8':'#e8e3d6';c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.rect(q[0]-.22*s,q[1]-.35*s,.44*s,.6*s);c.fill();c.globalAlpha=.6;c.stroke();c.globalAlpha=1}
function mq_vendorTable(c){if(!PAN.crowd.some(a=>a.kind==='attar'))return;const X=-13.4,Y=7.5;
  fill3(c,[[X,Y-.8,.8],[X,Y+.8,.8],[X+.6,Y+.8,.8],[X+.6,Y-.8,.8]],wash('#8a5a3a',.85),INK,.6,1,.5);mq_wX(c,X+.6,Y-.8,Y+.8,0,.8,wash('#6b4a30',.8),.6,1,.5);
  c.beginPath();for(let k=0;k<7;k++){const p=pj(X+.3,Y-.65+k*.22,.86);if(!seen(p[2]))continue;const r=.05*PAN.F/p[3];c.rect(p[0]-r,p[1]-r*3,r*2,r*3)}c.fillStyle='#c79a2a';c.fill();   // little attar bottles
  c.beginPath();for(let k=0;k<4;k++){const p=pj(X+.3,Y-.5+k*.32,1.04);if(!seen(p[2]))continue;const r=.12*PAN.F/p[3];c.moveTo(p[0]+r,p[1]);c.arc(p[0],p[1],r,Math.PI,TAU)}c.fillStyle='#faf8f2';c.fill();c.strokeStyle=INK;c.globalAlpha=.4;c.stroke();c.globalAlpha=1;
  label3(c,X+.62,Y,.45,L2('আতর · টুপি','Attar · tupi'),.18,'#f7f2e6')}
function mq_tasbihCloth(c){if(!PAN.crowd.some(a=>a.kind==='tasbih'))return;const X=17.4,Y=-13.6;fill3(c,[[X-.8,Y-.9,.01],[X+.1,Y-.9,.01],[X+.1,Y+.9,.01],[X-.8,Y+.9,.01]],wash('#7a2f35',.7),INK,.4,.8,.5);
  c.beginPath();for(let k=0;k<9;k++){const p=pj(X-.35,Y-.75+k*.19,.03);if(!seen(p[2]))continue;const r=.07*PAN.F/p[3];c.moveTo(p[0]+r,p[1]);c.ellipse(p[0],p[1],r,r*.5,0,0,TAU)}c.strokeStyle=['#e3b23c','#2f6b4f','#f1eee6'][0];c.lineWidth=1.2;c.stroke()}
function mq_pigeon(c,g){const q=pj(g.X,g.Y,g.Z);if(!seen(q[2])||q[3]<3.2)return;const s=PAN.F/q[3];if(s<3)return;const x=q[0],y=q[1];c.fillStyle=g.col;
  if(g.st==='f'||g.st==='l'){const f=Math.sin(PAN.t*18+g.ph*3)*.25;c.beginPath();c.ellipse(x,y,.16*s,.06*s,0,0,TAU);c.fill();c.beginPath();c.moveTo(x-.22*s,y-f*s);c.lineTo(x,y);c.lineTo(x+.22*s,y-f*s);c.strokeStyle=g.col;c.lineWidth=Math.max(1,.05*s);c.stroke();return}
  const peck=Math.sin(g.ph*3)>.6?.06:0,d=Math.sin(g.ph*.37)>0?1:-1;c.beginPath();c.ellipse(x,y-.1*s,.15*s,.08*s,0,0,TAU);c.fill();c.beginPath();c.arc(x+d*.13*s,y-(.18-peck)*s,.05*s,0,TAU);c.fillStyle=shade(g.col,.75);c.fill();
  c.strokeStyle=INK;c.globalAlpha=.4;c.lineWidth=.6;c.beginPath();c.ellipse(x,y-.1*s,.15*s,.08*s,0,0,TAU);c.stroke();c.globalAlpha=1}
const MQ_LAMPS=[[-12,-19],[-12,19],[4,-19],[4,19],[20,-19],[20,19]];

function mq_draw(c){const night=lightsOn(),st=mq_state();
  const sg=c.createLinearGradient(0,0,0,PAN.hor);sg.addColorStop(0,night>.5?'#34405a':rain>.4?'#b9bdc0':'#cfe0ea');sg.addColorStop(1,night>.5?'#5a5f70':'#efe8d8');c.fillStyle=sg;c.fillRect(0,0,W,PAN.hor);
  if(night>.6){c.fillStyle='rgba(255,255,240,.7)';const R=mulberry32(9);for(let i=0;i<40;i++){const a=R()*TAU,e=.3+R()*.9,d=wrapA(a-PAN.yaw);if(!seen(d))continue;c.fillRect(W/2+d*PAN.F,PAN.hor-Math.tan(e)*PAN.F*.8,1.4,1.4)}}
  c.fillStyle=wash('#d9d3c4',.9);c.fillRect(0,PAN.hor,W,H-PAN.hor);
  mq_skyline(c);mq_stadium(c);
  for(const[X,Y,h,R,col]of[[-30,-30,11,4.5,'#4f7a3a'],[-30,30,12,5,'#3f6b35'],[-12,-36,10,4,'#5a8a45'],[2,-37,12,4.6,'#4f7a3a'],[-12,36,11,4.4,'#5a8a45'],[2,37,10,4,'#4f7a3a'],[16,-38,9,3.6,'#3f6b35'],[16,39,10,4,'#5a8a45'],[30,-42,10,4,'#4f7a3a'],[30,43,11,4.4,'#3f6b35']].sort((a,b)=>Math.hypot(b[0],b[1])-Math.hypot(a[0],a[1])))mq_tree(c,X,Y,h,R,col);
  mq_minaret(c);mq_portico(c,-1);mq_portico(c,1);mq_cube(c);mq_veranda(c,st);mq_steps(c);mq_wudu(c,st);mq_shops(c);mq_floor(c);
  /* everything on the courtyard floor, far to near */
  const items=[];
  for(const row of MQ_SR){if(mq_rowFrac(st,row)<=0)continue;for(let y=-23;y<23;y+=4){const ya=y,yb=y+4;items.push({d:Math.hypot(row.X,y+2),f:()=>mq_rowDraw(c,st,row,ya,yb)})}}
  for(const a of PAN.crowd){const Z=mq_fz(a.X,a.Y)+(a.sit&&a.mode==='idle'&&a.X>28?.25:0);items.push({d:Math.hypot(a.X,a.Y),f:()=>{if(a.sit&&a.mode==='idle')a.p.pose='sit';figAt(c,a.p,a.X,a.Y,Z)}})}
  for(const g of MQ.pig)items.push({d:Math.hypot(g.X,g.Y)-.01,f:()=>mq_pigeon(c,g)});
  for(const[X,Y]of MQ_LAMPS)items.push({d:Math.hypot(X,Y),f:()=>mq_lamp(c,X,Y)});
  items.push({d:Math.hypot(-13.1,7.5),f:()=>mq_vendorTable(c)},{d:Math.hypot(17,-13.6)+.4,f:()=>mq_tasbihCloth(c)});
  items.sort((a,b)=>b.d-a.d);for(const it of items)it.f();
  if(rain>.3){c.beginPath();const n=Math.round(rain*140),R=mulberry32((PAN.t*20|0));for(let i=0;i<n;i++){const x=R()*W,y=R()*H;c.moveTo(x,y);c.lineTo(x-2,y+12)}c.strokeStyle='rgba(90,100,120,.35)';c.lineWidth=1;c.stroke()}
  /* night: the courtyard lamps, the veranda lights, the floodlit cube */
  const lamps=MQ_LAMPS.map(([X,Y])=>[X,Y,4.8]);for(let i=0;i<8;i++)lamps.push([31.2,-24+i*6.9,8]);for(const s of[-1,1])for(let x=-15;x<21;x+=7)lamps.push([x,s*26,3]);
  panoNight(c,lamps);
  if(night>.05){c.globalCompositeOperation='lighter';c.fillStyle=`rgba(255,244,214,${.2*night})`;for(let y=-22;y<22;y+=11){const q=poly3([[35.45,y,9.2],[35.45,y+11,9.2],[35.45,y+11,31.5],[35.45,y,31.5]],1.5);if(q){c.beginPath();c.moveTo(q[0][0],q[0][1]);for(const p of q)c.lineTo(p[0],p[1]);c.closePath();c.fill()}}
    c.fillStyle=`rgba(255,226,170,${.12*night})`;for(let y=-27;y<27;y+=9){const q=poly3([[31,y,1.5],[31,y+9,1.5],[31,y+9,9.9],[31,y,9.9]],1.5);if(q){c.beginPath();c.moveTo(q[0][0],q[0][1]);for(const p of q)c.lineTo(p[0],p[1]);c.closePath();c.fill()}}
    const m=mq_bb(52,-46),q=poly3([m(-1.5,9),m(1.5,9),m(1.5,50),m(-1.5,50)],2);if(q){c.fillStyle=`rgba(220,255,225,${.14*night})`;c.beginPath();c.moveTo(q[0][0],q[0][1]);for(const p of q)c.lineTo(p[0],p[1]);c.closePath();c.fill()}
    c.globalCompositeOperation='source-over'}}

/* ---- the panel ---- */
function mq_sub(){const st=mq_state(),P=st.P,t=hhmm(HOUR);
  if(st.ph==='gather')return L2(`এখন ${t}। ${P.bg} জামাত ${hhmm(P.h)}-এ (আনুমানিক) — মুসল্লিরা আসছেন, অজু করছেন।`,`It's ${t}. ${P.en} jamaat at about ${hhmm(P.h)}: worshippers are arriving and making wudu.`);
  if(st.ph==='khutba')return L2(`এখন ${t}। জুমার খুতবা চলছে; জামাত ${hhmm(P.h)}-এ। কাতার চত্বর পর্যন্ত ছড়িয়ে গেছে।`,`It's ${t}. The Jumma khutba is on; the jamaat is at ${hhmm(P.h)}. The rows reach out across the courtyard.`);
  if(st.ph==='pray')return L2(`এখন ${t}। ${P.bg} জামাত চলছে।`,`It's ${t}. The ${P.en} prayer is under way.`);
  if(st.ph==='dua'||st.ph==='leave')return L2(`এখন ${t}। ${P.bg} নামাজ শেষ — মুসল্লিরা বের হচ্ছেন।`,`It's ${t}. ${P.en} is over; the worshippers are coming out.`);
  const n=mq_next();return L2(`এখন ${t}। পরের জামাত: ${n.bn}, ${hhmm(n.h)} (আনুমানিক)। টেনে বা তীরচিহ্ন দিয়ে চারপাশে দেখুন।`,`It's ${t}. Next jamaat: ${n.en}, about ${hhmm(n.h)}. Drag, or use the arrow keys, to look around.`)}
const MQ_ACTS=[
 ['look',()=>L2('মূল ভবনটি দেখুন','Look at the main building'),0],
 ['wudu',()=>L2('অজু করুন','Make wudu'),0],
 ['attar',()=>L2('এক শিশি আতর','A vial of attar'),80],
 ['give',()=>L2('গেটে দান করুন','Give at the gate'),10]];
const MQ_FACTS=[
 ['কাবার আদলে গড়া সাদা ঘনক — আট তলা, প্রায় ৩০ মিটার উঁচু। মাথায় কোনো গম্বুজ নেই।','A white cube modelled on the Kaaba: eight storeys, about 30 m high, and no dome on top.'],
 ['স্থপতি আবদুল হুসেন থারিয়ানি। কাজ শুরু ১৯৬০-এ, প্রথম নামাজ ১৯৬৩, শেষ ১৯৬৮।','Architect Abdulhusein Thariani. Work began in 1960, the first prayers were in 1963, it was finished in 1968.'],
 ['একসাথে চল্লিশ হাজারের বেশি মানুষ নামাজ পড়তে পারেন। জুমায় কাতার এই চত্বর পেরিয়ে যায়।','More than forty thousand can pray here at once. At Jumma the rows run right across this courtyard.'],
 ['উত্তর আর দক্ষিণে গম্বুজওয়ালা দুটি প্রবেশপথ, তিনটি করে ঘোড়ার খুরের মতো খিলান।','North and south are two domed entrance porticoes, each with three horseshoe arches.']];
function mq_act(k){
  if(k==='look'){lookAt(40,0);PAN.pitch=.3;const f=MQ_FACTS[MQ.lookI++%MQ_FACTS.length];stSay(L2(f[0],f[1]))}
  else if(k==='wudu'){const t=MQ_TAPS.find(t=>!t.who&&t.s<0&&t.X>-6)||MQ_TAPS[8];lookAt(t.X,t.Y);PAN.pitch=.06;addEnergy(3);HOUR=(HOUR+6/60)%24;MQ.lastH=HOUR;updateStatusUI();
    const st=mq_state();stSay(st.P&&(st.ph==='gather'||st.ph==='khutba')?L2(`ঠান্ডা পানিতে অজু করলেন। ${st.P.bg} জামাত ${hhmm(st.P.h)}-এ — কাতারে দাঁড়ান।`,`You make wudu in the cool water. ${st.P.en} jamaat at ${hhmm(st.P.h)}: join the rows.`):L2('ঠান্ডা পানিতে হাত, মুখ, পা ধুলেন — শরীর জুড়াল, মনও শান্ত।','You wash hands, face and feet in cool water. Refreshed, and calmer.'))}
  else if(k==='attar'){const v=PAN.crowd.find(a=>a.kind==='attar');if(!v){stSay(L2('আতরওয়ালা এখন নেই। মার্কেটও বন্ধ।','The attar seller has gone home for now.'));return}if(STAT.wallet<80)return;
    lookAt(v.X,v.Y);PAN.pitch=.05;addMoney(-80);updateStatusUI();playVoice('hawker_attar_1',me.x,me.y);stSay(L2('নেন ভাই, খাঁটি আতর — বেলি ফুলের ঘ্রাণ। আশি টাকা।','Here, bhai: pure attar, scent of beli flowers. Eighty taka.'),v)}
  else if(k==='give'){const b=PAN.crowd.filter(a=>a.kind==='beg').sort((a,b)=>Math.hypot(a.X,a.Y)-Math.hypot(b.X,b.Y))[0];if(!b){stSay(L2('গেটে এখন কেউ বসে নেই।','No one is sitting at the gate now.'));return}if(STAT.wallet<10)return;
    lookAt(b.X,b.Y);PAN.pitch=.05;addMoney(-10);STAT.alms=(STAT.alms||0)+10;updateStatusUI();const t=mpick(GIVE_THANKS);toast(L2('১০ টাকা দিলেন','You gave ৳10'));stSay(L2(t[0],t[1]),b)}}
PANO_SCENES.push({key:'mosque',indoor:false,
  places:()=>{const F=sites.baitul;if(!F)return[];const q=FQ(F,-4,F.L+4,-4,F.D+4),K=sites.kamalapur,kq=K?FQ(K,0,K.L,0,K.D):null;
    return[{name:['বায়তুল মোকাররম জাতীয় মসজিদ','Baitul Mukarram National Mosque'],inside:(x,y)=>inQuad(q,x,y)&&!(kq&&inQuad(kq,x,y))&&!(typeof RESTOS!=='undefined'&&RESTOS.some(R=>R.entry&&Math.hypot(R.entry[0]-x,R.entry[1]-y)<6))}]},
  init:mq_init,update:mq_update,draw:mq_draw,sub:mq_sub,acts:MQ_ACTS,act:mq_act,
  marks:()=>[[0,L2('মূল ভবন · কিবলা (পশ্চিম)','Main hall · qibla (west)')],[-55,L2('মিনার','Minaret')],[-90,L2('দক্ষিণ · অজুখানা','South · wudu')],[90,L2('উত্তর · অজুখানা','North · wudu')],[55,L2('মহিলাদের নামাজ','Women\'s prayer')],[180,L2('পূর্ব গেট · মার্কেট · স্টেডিয়াম','East gate · market · stadium')]]});
