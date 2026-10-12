/* ---------------- 360° panorama: a school or college campus ----------------
   You stand in the courtyard of Motijheel Govt Boys' High School, Ideal School and College, Notre Dame College or Notre Dame University Bangladesh.
   Round you: classroom blocks with long open verandas (corridors) and grilled windows, the Shaheed Minar replica, the national flag,
   the main gate with the darwan (guard), a jhalmuri seller at the grille, guardians waiting outside, rickshaws on the road beyond.
   The day follows the real timetable: school days Sunday to Thursday (Friday and Saturday off since 2022);
   assembly with the national anthem, classes, tiffin, dismissal with guardians at the gate; nights and weekends only the darwan.
   Checked facts (Wikipedia, news):
   - MGBHS: founded 14 June 1957, Outer Circular Road; morning shift 7:15-11:30, day shift 12:30-17:00; boys; uniform white shirt with the monogram,
     white trousers, black belt, white shoes; a six-storey college building (2008); two playgrounds.
   - Ideal: founded 1965; motto "হে রব আমার জ্ঞান বৃদ্ধি কর"; girls in the morning shift 6:45-11:30, boys in the day shift 12:00-16:40;
     5-storey main building and a 10-storey college building; girls wear a long-sleeved blue frock (kameez), white salwar, white collar and belt, and a head scarf.
   - NDC: founded 1949, boys; college colours cream shirt and black trousers.
   [U] marks what is guessed: tiffin times, assembly time of the day shifts, Ideal boys' trousers, NDC/NDU hours, building colours, the wall slogans' places. */
const SC_CFG={
 mgbhs:{bld:"Motijheel Govt Boys' High School",site:'mgbhs',kind:'school',
  sign:['মতিঝিল সরকারি বালক উচ্চ বিদ্যালয়',"Motijheel Govt Boys' High School"],arch:['মতিঝিল সরকারি বালক উচ্চ বিদ্যালয় · স্থাপিত ১৯৫৭',"Motijheel Govt Boys' High School · est. 1957"],
  col:'#e6cf8a',trim:'#2e7d32',board:'#2e7d32',
  main:{y:24,x0:-46,x1:30,fl:3,D:9},side:{x:36,y0:-14,y1:33,fl:6,D:9,ver:2.2,col:'#ece2c4',label:['কলেজ ভবন','College building']},   // the six-storey college block of 2008
  gateY:-22,gateX:-6,wallW:-62,wallE:48,ground:'grass',pitch:[-32,-6],goal:[-58,-6],minar:[-40,6],flag:[-8,16],notice:[12,-20.6],
  trees:[[-57,-18,'krishnachura'],[42,-18,'raintree'],[-58,20,'raintree'],[24,-19,'krishnachura'],[-34,27,'mehogoni']],
  shifts:[{g:'m',a:7.25,b:11.5,asm:1,tif:[9.4,9.75],n:['প্রভাতি','Morning']},{g:'m',a:12.5,b:17,asm:1,tif:[14.6,15],n:['দিবা','Day']}],   // assembly of the day shift and both tiffins [U]
  grd:8,est:['১৯৫৭ সালে, হোসেন শহীদ সোহরাওয়ার্দী','1957, by Huseyn Shaheed Suhrawardy']},
 ideal:{bld:'Ideal School and College',site:'ideal',kind:'school',
  sign:['আইডিয়াল স্কুল অ্যান্ড কলেজ','Ideal School and College'],arch:['হে রব আমার জ্ঞান বৃদ্ধি কর','O Lord, increase my knowledge'],
  col:'#dfe3e6',trim:'#1a5276',board:'#1a5276',
  main:{y:20,x0:-22,x1:18,fl:5,D:9},side:{x:18,y0:-8,y1:29,fl:10,D:10,ver:0,col:'#d2d9de',label:['কলেজ ভবন','College building']},
  gateY:-11,gateX:-2,wallW:-24,wallE:28,ground:'paved',minar:[-19,2],flag:[-8,14],notice:[8,-10.6],
  trees:[[-21,-8,'krishnachura'],[-20,17,'mehogoni']],
  shifts:[{g:'f',a:6.75,b:11.5,asm:1,tif:[9.1,9.4],n:['প্রভাতি (ছাত্রী)','Morning (girls)']},{g:'m',a:12,b:16.67,asm:1,tif:[14.25,14.55],n:['দিবা (ছাত্র)','Day (boys)']}],
  grd:22,est:['১৯৬৫ সালে','1965']},
 ndc:{bld:'Notre Dame College',site:'ndc',kind:'college',
  sign:['নটর ডেম কলেজ','Notre Dame College'],arch:['নটর ডেম কলেজ · স্থাপিত ১৯৪৯ · Diligite Lumen','Notre Dame College · est. 1949 · Diligite Lumen'],   // the Latin motto ("love the light") [U]
  col:'#b5603f',trim:'#f1e6cf',board:'#1f3a6b',
  main:{y:22,x0:-38,x1:24,fl:4,D:10},side:{x:30,y0:-16,y1:32,fl:3,D:9,ver:2.4,col:'#b86a48',label:['বিজ্ঞান ভবন','Science building']},   // brick-red blocks as on the map [U]
  gateY:-28,gateX:-4,wallW:-46,wallE:40,ground:'lawn',court:[8,24,-24,-10],minar:[-38,-6],flag:[-8,15],notice:[-16,-27.6],
  trees:[[-43,-24,'raintree'],[26,-25,'krishnachura'],[-42,16,'banyan'],[-24,-25,'mehogoni']],
  shifts:[{g:'m',a:8,b:13.5,asm:0,tif:[10.75,11.25],n:['কলেজ','College']}],   // college hours [U]
  grd:0,est:['১৯৪৯ সালে, হলি ক্রস ফাদারদের হাতে','1949, by the Holy Cross fathers']},
 ndu:{bld:'Notre Dame University Bangladesh',kind:'uni',
  sign:['নটর ডেম বিশ্ববিদ্যালয় বাংলাদেশ','Notre Dame University Bangladesh'],arch:['নটর ডেম বিশ্ববিদ্যালয় বাংলাদেশ','Notre Dame University Bangladesh'],
  col:'#e3e6e8',trim:'#1f3a6b',board:'#1f3a6b',
  main:{y:26,x0:-20,x1:18,fl:4,D:12,glass:1},side:null,
  gateY:-14,gateX:4,wallW:-24,wallE:24,ground:'paved',minar:[-20,0],flag:[-12,12],notice:[-10,-13.6],
  trees:[[21,-11,'krishnachura'],[-21,19,'raintree'],[20,14,'mehogoni']],
  shifts:[{g:'x',a:9,b:17,asm:0,tif:[13,14],n:['বিশ্ববিদ্যালয়','University']}],   // [U]
  grd:0,est:['২০১৩ সালে','2013']}};   // NDUB's founding year [U]
for(const k in SC_CFG)SC_CFG[k].id=k;
const SC={cfg:null,key:'',lastH:0,sky:null,shops:null,trees:null,rk:[],flag:0,ball:null,fb:null,talkT:8,venT:12,spawnT:0,bellT:0};

/* ---- where the campuses are on the map ---- */
let sc_places=null;
function sc_dq(q,x,y){if(inQuad(q,x,y))return 0;let d=1e9;for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],ex=b[0]-a[0],ey=b[1]-a[1],t=clamp(((x-a[0])*ex+(y-a[1])*ey)/(ex*ex+ey*ey),0,1);d=Math.min(d,Math.hypot(a[0]+ex*t-x,a[1]+ey*t-y))}return d}
function sc_free(x,y){if(sites.kamalapur&&inQuad(sites.kamalapur.q,x,y))return false;try{for(const R of RESTOS)if(Math.hypot(x-R.entry[0],y-R.entry[1])<resR(R)+1)return false}catch(e){}return true}
function sc_getPlaces(){if(sc_places)return sc_places;if(!buildings.length)return[];const out=[];
  for(const k in SC_CFG){const cf=SC_CFG[k],b=buildings.find(b=>b.name&&b.name[1]===cf.bld);if(!b)continue;const F=cf.site&&sites[cf.site];
    out.push({name:b.name,cfg:cf,inside:(x,y)=>(sc_dq(b.foot,x,y)<5||(F&&inQuad(F.q,x,y)))&&sc_free(x,y)})}
  if(out.length)sc_places=out;return out}

/* ---- the timetable ---- */
function sc_phase(){const cf=SC.cfg,h=HOUR;if(FRIDAY)return{ph:'closed',wk:true};
  for(let i=0;i<cf.shifts.length;i++){const s=cf.shifts[i];
    if(h>=s.a-.5&&h<s.a)return{ph:'arrive',s,i};
    if(h>=s.a&&h<s.a+(s.asm?.33:0))return{ph:'assembly',s,i};
    if(h>=s.tif[0]&&h<s.tif[1])return{ph:'tiffin',s,i};
    if(h>=s.a&&h<s.b)return{ph:'class',s,i};
    if(h>=s.b&&h<s.b+.5)return{ph:'leave',s,i}}
  if(h>=6.5&&h<18)return{ph:'idle'};return{ph:'closed'}}
const sc_open=ph=>ph==='arrive'||ph==='leave'||ph==='idle';
/* which kinds of people each part of the day has */
const SC_WANT={arrive:['darwan','vendor','grd','teach'],assembly:['darwan','vendor','grd','rows','dais'],class:['darwan','vendor','grd','ver','teach','walk','heads'],
  tiffin:['darwan','vendor','grd','play','gatekid','ver','run'],leave:['darwan','vendor','grd','ver'],idle:['darwan','vendor','peon','loiter'],closed:['darwan','weekend']};

/* ---- people ---- */
function sc_kid(female){const cf=SC.cfg;let p;
  if(cf.kind==='college'){p=collegian();for(let k=0;k<12&&p.look.female;k++)p=collegian();if(p.look.female)Object.assign(p.look,{female:false,dress:'pants',headCover:false,bangles:null,nosePin:false,bun:false});/* a boys' college */Object.assign(p.look,{dress:'pants',c1:'#efe4c6',c2:'#2a2a30',cap:false});p.scBelt='#1d1d1d'}
  else if(cf.kind==='uni'){p=makePerson('student',female===undefined?Math.random()<.45:female);p.age=19+(Math.random()*5|0);p.look.bag=Math.random()<.7;p.roleText='Student at Notre Dame University Bangladesh'}
  else{const g=SC.shift?SC.shift.g:'m';if(female===undefined)female=g==='f';p=pupil(female);
    if(cf.id==='mgbhs'){Object.assign(p.look,{c1:'#f6f5ef',c2:'#ecebe2'});p.scBelt='#1d1d1d';p.roleText="Pupil at Motijheel Govt Boys' High School"}
    else if(female){Object.assign(p.look,{dress:'salwar',c1:'#2d56a8',c2:'#f4f2ea',headCover:true,bangles:null});p.scBelt='#f4f2ea';p.roleText='Pupil at Ideal School (morning shift)'}
    else{Object.assign(p.look,{c1:'#f6f5ef',c2:'#22325c'});p.look.cap=Math.random()<.35;p.scBelt='#1d1d1d';p.roleText='Pupil at Ideal School (day shift)'}}   // navy trousers and the white cap for some boys [U]
  p.look.hasUmb=false;p.pose='stand';p.ph=Math.random()*9;p.fc=Math.random()<.5?1:-1;return p}
function sc_adult(kind){let p;
  if(kind==='teach'){const f=SC.shift&&SC.shift.g==='f'?Math.random()<.75:Math.random()<.4;p=makePerson('office',f);if(f){p.look.dress='sari';p.look.headCover=Math.random()<.5}else if(Math.random()<.3){p.look.dress='panjabi';p.look.c1='#efece4'}p.act='carry';p.roleText='Teacher'}
  else if(kind==='darwan'){p=makePerson('labour',false);Object.assign(p.look,{dress:'pants',c1:'#7d7a5a',c2:'#3d3a30',gamchha:false});p.guardCap=true;p.roleText='Darwan (gate guard)'}
  else if(kind==='vendor'){p=makePerson('hawker',false);Object.assign(p.look,{dress:'lungi',c1:mpick(['#f1eee6','#d9c9a6','#c7d3dc'])});p.act='shake';p.roleText='Jhalmuri seller'}
  else if(kind==='peon'){p=makePerson('labour',false);p.look.dress='lungi';p.act='sweep';p.roleText='School peon'}
  else if(kind==='grd'){p=Math.random()<.78?guardian():makePerson('office',false);p.look.hasUmb=false}
  else p=makePerson(kind==='local'?'kid':'student');
  p.pose='stand';p.ph=Math.random()*9;p.fc=Math.random()<.5?1:-1;return p}
function sc_mk(cat,p,X,Y,extra){const a=Object.assign({cat,p,X,Y,Z:0,tx:X,ty:Y,mode:'idle',wait:mr(2,9),spd:mr(1,1.4)},extra||{});PAN.crowd.push(a);return a}
/* walk a list of points; the last one is where they leave the scene (or stay, if stay) */
function sc_route(a,pts,stay){a.route=pts.slice(1);a.quick=.05;goTo(a,pts[0][0],pts[0][1],!stay&&pts.length===1);a.next=b=>{if(b.route.length){const q=b.route.shift();goTo(b,q[0],q[1],!stay&&!b.route.length)}}}
function sc_doors(){const cf=SC.cfg,m=cf.main,o=[];for(let k=1;k<5;k++)o.push([m.x0+(m.x1-m.x0)*k/5,m.y-.4]);if(cf.side)for(let k=1;k<3;k++)o.push([cf.side.x-.4,cf.side.y0+(cf.side.y1-cf.side.y0)*k/4]);return o}
const sc_door=()=>mpick(sc_doors()),sc_gateIn=()=>[SC.cfg.gateX+mr(-1.2,1.2),SC.cfg.gateY+1.6],sc_gateOut=()=>[SC.cfg.gateX+mr(-2,2),SC.cfg.gateY-3.5];
function sc_yardPt(){const cf=SC.cfg;return[mr(cf.wallW+4,(cf.side?cf.side.x:cf.wallE)-4),mr(cf.gateY+4,cf.main.y-3)]}
/* a spot on a veranda: floor k, along the main or side block */
function sc_verPt(k){const cf=SC.cfg,m=cf.main,s=cf.side;if(m.glass)return null;
  if(s&&s.ver&&Math.random()<.4){k=Math.min(k,s.fl-1);return{blk:'side',X:s.x+.8,Y:mr(s.y0+2,s.y1-cf.main.D-2),Z:k*3.3+(k?0:.45)}}
  k=Math.min(k,m.fl-1);
  return{blk:'main',X:mr(m.x0+2,m.x1-2),Y:m.y+.8,Z:k*3.3+(k?0:.45)}}

function sc_fill(cat){const cf=SC.cfg,ph=SC.ph.ph,school=cf.kind==='school',g=SC.shift?SC.shift.g:'m';
  const fg=()=>g==='f'||(g==='x'&&Math.random()<.45);
  if(cat==='darwan'){const night=ph==='closed';const a=sc_mk('darwan',sc_adult('darwan'),cf.gateX-3.2,cf.gateY+1.3);if(night||ph==='class'){a.p.pose='sit';a.sit=true}a.p.fc=1}
  else if(cat==='vendor'){if(HOUR<6.5||HOUR>17.6)return;const a=sc_mk('vendor',sc_adult('vendor'),cf.gateX+2.4,cf.gateY-1.5);a.p.fc=-1}
  else if(cat==='grd'){const n=school?Math.round(cf.grd*(ph==='leave'?1.4:ph==='class'||ph==='tiffin'?(g==='f'?1:.4):.7)):ph==='leave'?2:0;
    for(let i=0;i<n;i++){const a=sc_mk('grd',sc_adult('grd'),cf.gateX+mr(-10,10),cf.gateY-mr(1.3,4.5));if(ph!=='leave'&&Math.random()<.3){a.p.pose='squat'}else if(Math.random()<.3)a.p.act='phone'}}
  else if(cat==='rows'){const f=cf.flag,cols=cf.id==='ideal'?7:9,deep=cf.id==='ideal'?4:5,y1=f[1]-4;
    for(let i=0;i<cols;i++)for(let j=0;j<deep;j++){const p=sc_kid();p.look.bag=false;p.fc=1;sc_mk('rows',p,f[0]+(i-(cols-1)/2)*2.3+mr(-.15,.15),y1-j*1.15)}}
  else if(cat==='dais'){const f=cf.flag;for(let i=0;i<2;i++){const p=sc_adult('teach');p.act=i?null:'carry';p.fc=-1;sc_mk('dais',p,f[0]+2.2+i*1.1,f[1]-.6,{Z:.4})}}
  else if(cat==='ver'){if(cf.main.glass)return;const n=ph==='tiffin'?(rain>.4?18:9):ph==='leave'?4:7;
    for(let i=0;i<n;i++){const k=Math.random()<.35?0:1+(Math.random()*Math.min(cf.main.fl-1,3)|0),v=sc_verPt(k);if(!v)continue;const p=sc_kid();p.look.bag=ph==='leave';sc_mk('ver',p,v.X,v.Y,{Z:v.Z,blk:v.blk})}}
  else if(cat==='teach'){if(ph==='arrive'){const a=sc_mk('teach',sc_adult('teach'),...sc_gateOut());sc_route(a,[sc_gateIn(),sc_door()]);return}
    if(cf.main.glass){for(let i=0;i<2;i++){const a=sc_mk('teach',sc_adult('teach'),...sc_yardPt());a.p.act=Math.random()<.5?'phone':'carry'}return}
    const m=cf.main,nb=Math.floor((m.x1-m.x0)/3.6),bw=(m.x1-m.x0)/nb;
    for(let i=0;i<2;i++){const b=1+(Math.random()*(nb-2)|0),k=i?Math.min(m.fl-1,1):0;sc_mk('teach',sc_adult('teach'),m.x0+b*bw+.95,m.y+(m.ver||2.2)-.25,{Z:k*3.3+(k?0:.45),blk:'main'})}}
  else if(cat==='walk'){for(let i=0;i<2;i++){const a=sc_mk('walk',sc_kid(fg()),...sc_yardPt());a.next=b=>goTo(b,...sc_yardPt())}}
  else if(cat==='peon'){const a=sc_mk('peon',sc_adult('peon'),mr(-8,8),mr(cf.gateY+6,cf.main.y-6));a.next=b=>{goTo(b,b.X+mr(-4,4),clamp(b.Y+mr(-3,3),cf.gateY+3,cf.main.y-3));b.p.act='sweep'};a.wait=mr(5,12)}
  else if(cat==='loiter'){const n=cf.kind==='school'?3:6;for(let i=0;i<n;i++){const a=sc_mk('loiter',sc_kid(fg()),...sc_yardPt());a.next=b=>goTo(b,...sc_yardPt())}if(cf.kind!=='school')sc_sitters('loiter',3)
    if(cf.court)sc_court()}
  else if(cat==='play'){if(rain>.4)return;if(cf.pitch)sc_cricket(false);if(cf.court)sc_court();
    if(cf.kind==='school'){SC.fb={x:cf.pitch?cf.pitch[0]+6:-6,y:cf.pitch?cf.pitch[1]+11:-4,vx:0,vy:0};const n=cf.id==='ideal'?5:7;for(let i=0;i<n;i++){const p=sc_kid(fg());p.look.bag=false;const a=sc_mk('play',p,SC.fb.x+mr(-4,4),SC.fb.y+mr(-4,4),{foot:true,spd:mr(2,2.8),quick:.4});a.next=b=>{goTo(b,SC.fb.x+mr(-1.2,1.2),SC.fb.y+mr(-1.2,1.2))}}}
    else sc_sitters('play',SC.benches.length)}
  else if(cat==='run'){if(rain>.4||cf.kind!=='school')return;for(let i=0;i<10;i++){const p=sc_kid(fg());p.look.bag=false;const a=sc_mk('run',p,...sc_yardPt(),{spd:mr(2.2,3.2),quick:.3});a.next=b=>goTo(b,...sc_yardPt())}}
  else if(cat==='gatekid'){if(!SC.vendorOn())return;for(let i=0;i<6;i++){const p=sc_kid(fg());p.look.bag=false;p.fc=-1;sc_mk('gatekid',p,cf.gateX+mr(0,3.6),cf.gateY+mr(.5,1.6))}}
  else if(cat==='heads'){}
  else if(cat==='weekend'){if(!SC.ph.wk||HOUR<7||HOUR>17.3||!cf.pitch||rain>.4)return;sc_cricket(true)}}   // the neighbourhood boys get the field on Friday [U]
/* students sitting along the benches, three to a bench */
function sc_sitters(cat,nb){const B=SC.benches.slice().sort(()=>Math.random()-.5).slice(0,nb);for(const b of B)for(let j=-1;j<=1;j++){if(Math.random()<.2)continue;const p=sc_kid();p.pose='sit';p.look.bag=false;p.act=Math.random()<.3?'phone':null;sc_mk(cat,p,b.X+b.ux*j*.9,b.Y+b.uy*j*.9,{sit:true})}}
SC.vendorOn=()=>PAN.crowd.some(a=>a.cat==='vendor');
/* a game of cricket on the pitch: bowler, batsman, keeper, fielders; the ball goes round them */
function sc_cricket(local){const cf=SC.cfg,[px,py]=cf.pitch,mk=(X,Y,role)=>{const p=local?sc_adult('local'):sc_kid();p.look.bag=false;if(local){p.look.dress=Math.random()<.5?'pants':'lungi';p.look.h=mr(1.25,1.6)}p.fc=role==='bat'?-1:1;return sc_mk(local?'weekend':'play',p,X,Y,{crk:role})};
  const bowl=mk(px-11,py,'bowl'),bat=mk(px+10.6,py+.5,'bat'),keep=mk(px+12.5,py,'keep');keep.p.pose='squat';const f=[];
  for(let i=0;i<5;i++){const an=-1.2+i*.6;f.push(mk(px+Math.cos(an)*mr(14,19),py+Math.sin(an)*mr(12,16),'field'))}
  SC.ball={kind:'crk',from:bowl,to:bat,t:0,dur:.75,arc:.6,bowl,bat,keep,f}}
function sc_court(){const cf=SC.cfg,[x0,x1,y0,y1]=cf.court,pl=[];for(let i=0;i<5;i++){const p=sc_kid();p.look.bag=false;pl.push(sc_mk('play',p,mr(x0+2,x1-2),mr(y0+2,y1-2),{spd:mr(1.8,2.4),quick:.5}))}
  for(const a of pl)a.next=b=>goTo(b,mr(x0+2,x1-2),mr(y0+2,y1-2));SC.ball={kind:'bask',from:pl[0],to:pl[1],t:0,dur:.8,arc:1.2,pl}}

/* the clock moved or a new part of the day began: send off who is not wanted, bring who is */
function sc_sync(hard){const old=SC.ph,ph=sc_phase();SC.ph=ph;SC.shift=ph.s||null;SC.key=ph.ph+(ph.i||0)+(ph.wk?'w':'');
  const want=new Set(SC_WANT[ph.ph]);
  if(hard){PAN.crowd.length=0;SC.ball=null;SC.fb=null}
  else{for(const a of PAN.crowd){if(a.route&&a.mode==='walk')continue;   // already on their way somewhere
      if(a.cat==='darwan'||a.cat==='vendor'){if(!want.has(a.cat))a.gone=true;continue}
      if(a.cat==='grd'){if(want.has('grd'))continue;a.sit=false;a.p.pose='stand';sc_route(a,[[a.X+(a.X>SC.cfg.gateX?30:-30),a.Y]]);continue}
      if(want.has(a.cat)&&a.cat!=='ver')continue;
      if(a.cat==='ver'||a.cat==='heads'||a.Z>0&&a.cat!=='dais'){a.gone=true;continue}   // into the classroom
      a.Z=0;a.sit=false;a.p.pose='stand';a.p.act=null;a.foot=false;a.crk=null;a.spd=Math.max(a.spd,a.cat==='dais'?1.2:1.9);   // the bell has gone: hurry
      if(ph.ph==='leave'||ph.ph==='closed'||a.cat==='weekend'||a.cat==='loiter'&&SC.cfg.kind!=='school')sc_route(a,[sc_gateIn(),sc_gateOut(),[SC.cfg.gateX+mr(-25,25),SC.cfg.gateY-4.5]]);else sc_route(a,[sc_door()])}
    if(!want.has('play')&&!want.has('weekend')&&!want.has('loiter'))SC.ball=null;if(!want.has('play'))SC.fb=null}
  for(const cat of want)if(!PAN.crowd.some(a=>a.cat===cat&&!a.gone&&!a.route)||!hard&&cat==='grd'&&ph.ph==='leave')sc_fill(cat);
  /* the darwan sits down at night and in class time; stands at the gate when it is open */
  for(const a of PAN.crowd)if(a.cat==='darwan'){const sit=!sc_open(ph.ph);a.p.pose=sit?'sit':'stand';a.sit=sit}
  if(hard&&(ph.ph==='leave'||ph.ph==='arrive')){const cf=SC.cfg;for(let i=0;i<(cf.kind==='school'?26:10);i++){const g=sc_gateIn(),d=sc_door(),t=Math.random(),a=sc_mk('flow',sc_kid(),d[0]+(g[0]-d[0])*t,d[1]+(g[1]-d[1])*t);a.p.look.bag=true;
    if(ph.ph==='leave')sc_route(a,[g,sc_gateOut(),[cf.gateX+mr(-25,25),cf.gateY-mr(3,5)]]);else sc_route(a,[d])}}   // the stream is already flowing when you walk in
  if(ph.ph==='assembly'&&!hard){PAN.annT=14;PAN.ann=L2('জাতীয় সংগীত: আমার সোনার বাংলা, আমি তোমায় ভালোবাসি…','National anthem: "Amar Sonar Bangla, ami tomay bhalobashi…"')}
  SC.lastH=HOUR}

/* ---- sound: the brass bell (ghonta) a peon strikes, synthesised ---- */
function sc_bell(n=6){if(!A.on||!A.ctx)return;try{const out=outNode(.18,0,0),t=A.ctx.currentTime+.02;for(let i=0;i<n;i++){osc('sine',1180,t+i*.42,.5,out,.35,.004);osc('sine',2950,t+i*.42,.25,out,.12,.004)}}catch(e){}}

/* ---- update ---- */
function sc_update(dt){const cf=SC.cfg;
  if(Math.abs(wrapA((HOUR-SC.lastH)/24*TAU))/TAU*24>.15){sc_sync(true);SC.lastH=HOUR}else SC.lastH=HOUR;
  const ph=sc_phase(),key=ph.ph+(ph.i||0)+(ph.wk?'w':'');if(key!==SC.key){const was=SC.ph&&SC.ph.ph;sc_sync(false);if(!ph.wk&&was&&was!=='closed'&&ph.ph!=='idle'&&ph.ph!=='closed'||ph.ph==='leave')sc_bell(ph.ph==='leave'?12:6)}
  /* arriving and leaving streams through the gate */
  SC.spawnT-=dt;const P=SC.ph.ph,n=PAN.crowd.length;
  if(SC.spawnT<=0&&n<110&&(P==='arrive'||P==='leave'||SC.nextIn())){SC.spawnT=cf.kind==='school'?mr(.15,.45):mr(.4,1);
    if(P==='leave'){const d=sc_door(),a=sc_mk('flow',sc_kid(),d[0],d[1]);a.p.look.bag=true;a.spd=mr(1.1,1.7);sc_route(a,[sc_gateIn(),sc_gateOut(),[cf.gateX+mr(-25,25),cf.gateY-mr(3,5)]])}
    if(P==='arrive'||SC.nextIn()){const o=[cf.gateX+mr(-25,25),cf.gateY-mr(3,5)],a=sc_mk('flow',SC.nextIn()&&P!=='arrive'?sc_kidFor(SC.nextIn()):sc_kid(),o[0],o[1]);a.p.look.bag=true;sc_route(a,[sc_gateOut(),sc_gateIn(),sc_door()])}}
  /* guardians leave with their children at dismissal */
  if(P==='leave'&&Math.random()<dt*.25){const g=PAN.crowd.filter(a=>a.cat==='grd'&&!a.route);if(g.length>3){const a=mpick(g);a.sit=false;sc_route(a,[[a.X+(Math.random()<.5?30:-30),a.Y-mr(0,1)]])}}
  panoWalk(dt);
  if(PAN.crowd.length>130){let k=PAN.crowd.length-130;for(const a of PAN.crowd)if(k>0&&a.route&&!a.gone){a.gone=true;k--}}   // keep the crowd bounded when the clock races
  for(const a of PAN.crowd){if(a.mode==='idle'&&a.quick!==undefined&&a.wait>a.quick)a.wait=a.quick;if(a.mode==='idle'&&a.foot)a.p.act='kick'}
  /* the balls */
  const B=SC.ball;if(B){B.t+=dt/B.dur;if(B.t>=1){B.t=0;const f=B.to;
    if(B.kind==='crk'){if(f===B.bat){const hit=Math.random()<.7;B.from=B.bat;B.to=hit?mpick(B.f):B.keep;B.dur=hit?1.4:.4;B.arc=hit?(Math.random()<.25?7:2):.2;if(hit&&B.arc>5&&Math.random()<.5)SC.cheer=1}
      else if(f===B.bowl){B.from=B.bowl;B.to=B.bat;B.dur=.75;B.arc=.6}else{B.from=f;B.to=B.bowl;B.dur=1.2;B.arc=2.5}}
    else{B.from=f;const o=B.pl.filter(a=>a!==f&&!a.gone);B.to=o.length?mpick(o):f;B.dur=mr(.6,1);B.arc=mr(.6,1.6)}}
    if(B.from.gone||B.to.gone)SC.ball=null}
  const F=SC.fb;if(F){F.x+=F.vx*dt;F.y+=F.vy*dt;F.vx*=Math.pow(.25,dt);F.vy*=Math.pow(.25,dt);
    for(const a of PAN.crowd)if(a.foot&&Math.hypot(a.X-F.x,a.Y-F.y)<.8&&Math.hypot(F.vx,F.vy)<1.5){const an=Math.random()*TAU,v=mr(4,8);F.vx=Math.cos(an)*v;F.vy=Math.sin(an)*v;break}
    const lim=sc_yardBox();if(F.x<lim[0]||F.x>lim[1])F.vx*=-1;if(F.y<lim[2]||F.y>lim[3])F.vy*=-1;F.x=clamp(F.x,lim[0],lim[1]);F.y=clamp(F.y,lim[2],lim[3])}
  /* the flag goes up at the first assembly and comes down at dusk; not on the weekend */
  const up=!FRIDAY&&HOUR>=cf.shifts[0].a&&HOUR<18;SC.flag=up?Math.min(1,SC.flag+dt*(P==='assembly'?.06:1)):Math.max(0,SC.flag-dt*.5);
  /* the road */
  for(const r of SC.rk){if(r.park){continue}r.x+=r.v*dt;if(r.x>90)r.x=-90;if(r.x<-90)r.x=90}
  /* voices */
  SC.venT-=dt;if(SC.venT<=0){SC.venT=mr(20,40);const v=PAN.crowd.find(a=>a.cat==='vendor');if(v&&(P==='tiffin'||P==='leave'||P==='arrive'||Math.random()<.3)){stSay(L2('ঝালমুড়ি! মজার ঝালমুড়ি, দশ-বিশ টাকা!','Jhalmuri! Tasty jhalmuri, ten or twenty taka!'),v);playVoice(Math.random()<.5?'hawker_jhalmuri_1':'hawker_jhalmuri_2',me.x,me.y)}}
  SC.talkT-=dt;if(SC.talkT<=0){SC.talkT=mr(14,26);sc_chatter(P)}
  if(SC.cheer){SC.cheer=0;const b=SC.ball&&SC.ball.bat;if(b){stSay(L2('ছক্কা! ছক্কা!','Six! Six!'),b);playVoice('player_goal_1',me.x,me.y)}}
  if(Math.random()<dt*.04)sfx('sfx_rickshaw_bell',me.x,me.y,.25);if(Math.random()<dt*.02)sfx('sfx_crow',me.x,me.y,.35)}
SC.nextIn=()=>{const cf=SC.cfg;if(FRIDAY)return null;for(const s of cf.shifts)if(HOUR>=s.a-.5&&HOUR<s.a&&SC.ph.ph==='leave')return s;return null};
function sc_kidFor(s){const k=SC.shift;SC.shift=s;const p=sc_kid();SC.shift=k;return p}
function sc_yardBox(){const cf=SC.cfg;return[cf.wallW+3,(cf.side?cf.side.x:cf.wallE)-3,cf.gateY+3,cf.main.y-3]}
function sc_chatter(P){const cf=SC.cfg,near=k=>PAN.crowd.filter(a=>a.cat===k&&!a.gone).sort((a,b)=>Math.hypot(a.X,a.Y)-Math.hypot(b.X,b.Y))[0];
  if(P==='class'){const t=near('teach');if(t){stSay(L2(mpick(['এই, চুপ! বই খোলো, পৃষ্ঠা বাহাত্তর।','কাল বাড়ির কাজ না আনলে খাতায় সই নিয়ে আসবে।','রোল তেত্রিশ, বোর্ডে এসো।']),mpick(['Quiet! Open your books, page seventy-two.','No homework tomorrow and you bring a guardian\'s signature.','Roll thirty-three, come to the board.'])),t)}}
  else if(P==='tiffin'||P==='idle'&&cf.kind!=='school'){const k=near('play')||near('run')||near('loiter');if(k){stSay(L2(mpick(['এই, বল দে! পাস!','আমি ব্যাট করব এবার!','টিফিনে খিচুড়ি আনছি, খাবি?','কাল কোচিংয়ে যাবি?']),mpick(['Hey, pass the ball!','My turn to bat!','I brought khichuri for tiffin, want some?','Going to coaching tomorrow?'])),k);playVoice(Math.random()<.5?'pupil_1':'player_pass_1',me.x,me.y)}}
  else if(P==='leave'||P==='arrive'){const g=near('grd');if(g){stSay(L2(mpick(['এই যে বাবু, এদিকে!','টিফিন বক্স ফেরত আনছ তো?','তাড়াতাড়ি চলো, কোচিং আছে।']),mpick(['Over here, baby!','Did you bring back the tiffin box?','Hurry, there\'s coaching.'])),g);playVoice('guardian_1',me.x,me.y)}}
  else if(P==='closed'&&!SC.ph.wk){const d=near('darwan');if(d&&Math.random()<.5)stSay(L2('কে? এত রাতে স্কুলে কী?','Who\'s there? What are you doing here at this hour?'),d)}}

/* ---- drawing helpers ---- */
/* a small flat quad, projected corner by corner (no bending), added to the current path */
function sc_pq(c,P){let any=false;const q=[];for(const p of P){const r=pj(p[0],p[1],p[2]);if(Math.abs(r[2])>2.75)return false;if(seen(r[2]))any=true;q.push(r)}if(!any)return false;c.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)c.lineTo(q[i][0],q[i][1]);c.closePath();return true}
function sc_seg(c,a,b){const p=pj(a[0],a[1],a[2]),q=pj(b[0],b[1],b[2]);if(Math.abs(p[2])>2.75||Math.abs(q[2])>2.75||!seen(p[2])&&!seen(q[2]))return;c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1])}
function sc_fig(c,a){figAt(c,a.p,a.X,a.Y,a.Z||0);const p=a.p;if(!p.scBelt||p.pose==='sit'||p.pose==='squat')return;const q=pj(a.X,a.Y,(a.Z||0)+.585*p.look.h*1.12);if(!seen(q[2])||q[3]<2.6)return;const s=PAN.F/q[3];if(s<14)return;
  c.strokeStyle=p.scBelt;c.globalAlpha=.95;c.lineWidth=Math.max(1,.045*s);c.beginPath();c.moveTo(q[0]-.16*s,q[1]);c.lineTo(q[0]+.16*s,q[1]);c.stroke();c.globalAlpha=1}
/* a tree from the street, drawn standing up at its distance */
function sc_tree(c,t){const q=pj(t.X,t.Y,0);if(Math.abs(q[2])>PAN.half+.5||q[3]<3)return;const s=PAN.F/q[3],k1=KX,k2=KZ;KX=0;KZ=1;S=s;
  c.setTransform(DPR*s,0,0,DPR*s,DPR*q[0],DPR*q[1]);try{drawTree0(c,t.t,2)}finally{KX=k1;KZ=k2;c.setTransform(DPR,0,0,DPR,0,0);c.globalAlpha=1}}

/* a classroom block: P(u,d,z) with u along the front, d into the building. Open verandas (ver>0) show the classroom wall behind columns and parapets */
function sc_block(c,B){const{o,t,n,L,D,fl,col}=B,fh=3.3,H=fl*fh,vd=B.ver||0,P=(u,d,z)=>[o[0]+t[0]*u+n[0]*d,o[1]+t[1]*u+n[1]*d,z];
  const uv=-(o[0]*t[0]+o[1]*t[1]),wall=wash(col,.82),back=wash(shade(col,.8),.8),night=lightsOn();
  if(uv<0)fill3(c,[P(0,0,0),P(0,D,0),P(0,D,H+.9),P(0,0,H+.9)],wash(shade(col,.88),.85),INK,.6,1,3);
  if(uv>L)fill3(c,[P(L,0,0),P(L,D,0),P(L,D,H+.9),P(L,0,H+.9)],wash(shade(col,.88),.85),INK,.6,1,3);
  if(B.glass){sc_glass(c,B,P);return}
  fill3(c,[P(0,vd,0),P(L,vd,0),P(L,vd,H),P(0,vd,H)],vd?back:wall,INK,.55,1,3);
  const nb=Math.max(1,Math.floor(L/3.6)),bw=L/nb,lit=night>.3;
  /* doors and grilled windows */
  c.beginPath();if(vd)for(let k=0;k<fl;k++)for(let i=0;i<nb;i++){const u=i*bw,z=k*fh+(k?0:.45);sc_pq(c,[P(u+.5,vd-.01,z),P(u+1.4,vd-.01,z),P(u+1.4,vd-.01,z+2.2),P(u+.5,vd-.01,z+2.2)])}
  c.fillStyle=wash(B.door||'#4f6a4a',.8);c.fill();c.strokeStyle=INK;c.globalAlpha=.45;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  c.beginPath();const win=[];for(let k=0;k<fl;k++)for(let i=0;i<nb;i++){const u=i*bw,z=k*fh+(k?0:.45),u0=vd?u+1.9:u+.6,u1=vd?u+3.2:u+3,z0=z+.9,z1=z+2.1;if(sc_pq(c,[P(u0,vd-.01,z0),P(u1,vd-.01,z0),P(u1,vd-.01,z1),P(u0,vd-.01,z1)]))win.push([u0,u1,z0,z1,k])}
  c.fillStyle=lit?'rgba(60,58,48,.85)':vd?'rgba(48,54,62,.72)':'rgba(60,70,80,.5)';c.fill();
  if(B.heads){c.beginPath();for(const w of win){if(w[4]>1)continue;for(let h=0;h<3;h++){const q=pj(...P(w[0]+.3+h*.4,vd+.5,w[2]+.02));if(!seen(q[2]))continue;const r=.13*PAN.F/q[3];c.moveTo(q[0]+r,q[1]);c.arc(q[0],q[1],r,Math.PI,TAU)}}c.fillStyle=SC.shift&&SC.shift.g==='f'?'#e9e5da':'#2a221c';c.globalAlpha=.7;c.fill();c.globalAlpha=1}   // heads (or white scarves) just above the sill: a class at its desks
  c.beginPath();for(const w of win){for(let u=w[0]+.18;u<w[1];u+=.2)sc_seg(c,P(u,vd-.02,w[2]),P(u,vd-.02,w[3]));sc_seg(c,P(w[0],vd-.02,(w[2]+w[3])/2),P(w[1],vd-.02,(w[2]+w[3])/2))}c.strokeStyle='#3a3530';c.globalAlpha=.55;c.lineWidth=.7;c.stroke();c.globalAlpha=1;
  /* veranda ceilings, the people on the verandas, then columns and parapets in front of them */
  if(vd)for(let k=1;k<=fl;k++)fill3(c,[P(0,0,k*fh-.3),P(L,0,k*fh-.3),P(L,vd,k*fh-.3),P(0,vd,k*fh-.3)],wash(shade(col,.62),.8),null,0,1,4);
  for(const a of B.ppl)sc_fig(c,a);
  c.beginPath();for(let i=0;i<=nb;i++){const u=i*bw;sc_pq(c,[P(u-.2,-.01,0),P(u+.2,-.01,0),P(u+.2,-.01,H),P(u-.2,-.01,H)])}c.fillStyle=wall;c.fill();c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  fill3(c,[P(0,-.02,0),P(L,-.02,0),P(L,-.02,.45),P(0,-.02,.45)],wash(shade(col,.85),.85),INK,.5,.8,4);
  for(let k=1;k<=fl;k++){const z0=k*fh-.35,z1=k===fl?H+.9:k*fh+(vd?1:.15);fill3(c,[P(-.2,-.02,z0),P(L+.2,-.02,z0),P(L+.2,-.02,z1),P(-.2,-.02,z1)],wall,INK,.55,1,4);
    if(B.trim)ink3(c,[P(-.2,-.03,z1-.12),P(L+.2,-.03,z1-.12)],B.trim,.8,1.8,4)}
  if(B.sign){const u=B.sign.u,w=B.sign.w,z0=H+.9,z1=H+3.1;fill3(c,[P(u-w/2,-.04,z0),P(u+w/2,-.04,z0),P(u+w/2,-.04,z1),P(u-w/2,-.04,z1)],wash(B.sign.col,.9),INK,.8,1.2,2);
    const m=P(u,-.05,0);label3(c,m[0],m[1],H+2.3,B.sign.t[0],1,'#fbf7ea');label3(c,m[0],m[1],H+1.4,B.sign.t[1],.6,'#fbf7ea','500')}
  if(B.label){const m=P(L/2,-.05,0);label3(c,m[0],m[1],H+.35,L2(...B.label),.55,INK)}}
/* the university: a podium with ribbon windows and a glass tower above it */
function sc_glass(c,B,P){const{L,D}=B,ph=16,th=50;
  fill3(c,[P(3,3,ph),P(L-3,3,ph),P(L-3,3,th),P(3,3,th)],wash('#7fa7bf',.75),INK,.6,1,3);
  c.beginPath();for(let u=3;u<=L-3;u+=1.8)sc_seg(c,P(u,2.98,ph),P(u,2.98,th));for(let z=ph;z<=th;z+=3.4)ink3(c,[P(3,2.98,z),P(L-3,2.98,z)],'#4f6f85',.45,.8,4);c.strokeStyle='#4f6f85';c.globalAlpha=.45;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  fill3(c,[P(0,0,0),P(L,0,0),P(L,0,ph),P(0,0,ph)],wash(B.col,.85),INK,.6,1,3);
  for(let k=0;k<4;k++)fill3(c,[P(1,-.01,k*4+1.2),P(L-1,-.01,k*4+1.2),P(L-1,-.01,k*4+3),P(1,-.01,k*4+3)],k?wash('#6f97b0',.7):wash('#4a5560',.6),INK,.4,.8,3);
  c.beginPath();for(let k=0;k<4;k++)for(let u=1;u<=L-1;u+=1.5)sc_seg(c,P(u,-.02,k*4+1.2),P(u,-.02,k*4+3));c.strokeStyle='#e3e6e8';c.globalAlpha=.8;c.lineWidth=1.2;c.stroke();c.globalAlpha=1;
  fill3(c,[P(L/2-3,-.03,0),P(L/2+3,-.03,0),P(L/2+3,-.03,3),P(L/2-3,-.03,3)],wash('#2f3a44',.7),INK,.6,1,1);   // the glass doors of the lobby
  for(const a of B.ppl)sc_fig(c,a);
  if(B.sign){const m=P(L/2,-.05,0);fill3(c,[P(L/2-9,-.04,ph+.3),P(L/2+9,-.04,ph+.3),P(L/2+9,-.04,ph+2.3),P(L/2-9,-.04,ph+2.3)],wash(B.sign.col,.9),INK,.7,1,2);label3(c,m[0],m[1],ph+1.65,B.sign.t[0],.8,'#fbf7ea');label3(c,m[0],m[1],ph+.85,B.sign.t[1],.5,'#fbf7ea','500')}}

/* the Shaheed Minar: three steps, the tall central frame bowing forward, two pairs of side frames, the red sun behind */
function sc_minar(c,M,sz){const dx=-M[0],dy=-M[1],L=Math.hypot(dx,dy),fx=dx/L,fy=dy/L,ux=-fy,uy=fx,P=(u,d,z)=>[M[0]+ux*u*sz-fx*d*sz,M[1]+uy*u*sz-fy*d*sz,z*sz];
  for(let k=0;k<3;k++){const w=5.6-k*.6,d0=-1.6+k*.5,z0=k*.3;fill3(c,[P(-w,d0,z0),P(w,d0,z0),P(w,d0,z0+.3),P(-w,d0,z0+.3)],wash('#cfc8b8',.85),INK,.6,.8,1);fill3(c,[P(-w,d0,z0+.3),P(w,d0,z0+.3),P(w,2.6,z0+.3),P(-w,2.6,z0+.3)],wash('#ddd7c9',.85),INK,.3,.6,1)}
  const sq=pj(...P(0,1.4,3.6));if(seen(sq[2])){const r=2.1*sz*PAN.F/sq[3];c.fillStyle=wash('#c0392b',.85);c.beginPath();c.arc(sq[0],sq[1],r,0,TAU);c.fill();c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=1;c.stroke();c.globalAlpha=1}
  const fr=[[0,1,5.2,1.1,.9],[-2.7,.65,4.1,.4,.5],[2.7,.65,4.1,.4,.5],[-4.1,.55,3.3,.25,.25],[4.1,.55,3.3,.25,.25]];   // centre u, half width, height before the bend, bend length, d
  const q0=pj(...P(0,0,.9)),w=Math.max(1.5,.2*sz*PAN.F/q0[3]);
  for(const pass of[0,1]){c.beginPath();for(const[u,hw,h,bl,d]of fr){const z0=.9,dd=d*.4,top=[P(u-hw,dd-bl,h+bl*.9),P(u+hw,dd-bl,h+bl*.9)];
      sc_seg(c,P(u-hw,dd,z0),P(u-hw,dd,h));sc_seg(c,P(u-hw,dd,h),top[0]);sc_seg(c,P(u+hw,dd,z0),P(u+hw,dd,h));sc_seg(c,P(u+hw,dd,h),top[1]);sc_seg(c,top[0],top[1]);
      if(pass)for(let b=1;b<4;b++){const uu=u-hw+b*hw/2;sc_seg(c,P(uu,dd,z0+.3),P(uu,dd,h))}}
    c.strokeStyle=pass?'#f6f4ec':INK;c.globalAlpha=pass?1:.7;c.lineWidth=pass?w:w+2;c.stroke();c.globalAlpha=1}
  if(SC.ph&&(SC.ph.ph==='assembly'||HOUR>7&&HOUR<16&&!FRIDAY)){c.beginPath();for(let k=-2;k<=2;k++){const q=pj(...P(k*.5,-1.2,.92));if(!seen(q[2]))continue;const r=.13*sz*PAN.F/q[3];c.moveTo(q[0]+r,q[1]);c.arc(q[0],q[1],r,0,TAU)}c.fillStyle=wash('#d84a3a',.8);c.fill()}   // a few flowers left at the steps
}
/* the national flag on its pole, and the dais in front of the assembly */
function sc_flag(c,F){const top=9,b=pj(F[0],F[1],0);if(!seen(b[2]))return;
  fill3(c,[[F[0]+1,F[1]-1.4,.4],[F[0]+4.6,F[1]-1.4,.4],[F[0]+4.6,F[1]-1.4,0],[F[0]+1,F[1]-1.4,0]],wash('#b9b0a0',.85),INK,.6,.8,1);
  fill3(c,[[F[0]-1,F[1]-1,0],[F[0]+1,F[1]-1,0],[F[0]+1,F[1]+1,0],[F[0]-1,F[1]+1,0]],wash('#cfc8b8',.85),INK,.5,.8,1);
  const t=pj(F[0],F[1],top),s=PAN.F/b[3];c.strokeStyle='#7a7a78';c.lineWidth=Math.max(1.2,.1*s);c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(t[0],t[1]);c.stroke();c.fillStyle='#c9a34a';c.beginPath();c.arc(t[0],t[1]-2,Math.max(2,.12*s),0,TAU);c.fill();
  if(SC.flag<=0)return;const z=1.6+(top-1.75)*SC.flag,q=pj(F[0],F[1],z),fw=1.5*s,fh=.9*s,tt=PAN.t*3;
  const pt=(u,v)=>[q[0]+u*fw,q[1]+v*fh+Math.sin(tt+u*4)*u*.12*fh];
  c.beginPath();for(let i=0;i<=8;i++){const p=pt(i/8,0);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}for(let i=8;i>=0;i--){const p=pt(i/8,1);c.lineTo(p[0],p[1])}c.closePath();c.fillStyle='#1d6b4c';c.fill();c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=1;c.stroke();c.globalAlpha=1;
  const d=pt(.45,.5);c.fillStyle='#d8343f';c.beginPath();c.arc(d[0],d[1],.3*s*.95,0,TAU);c.fill()}
/* the notice board by the gate */
function sc_notice(c,N){const X=N[0],Y=N[1],P=(u,z)=>[X+u,Y,z];
  c.beginPath();sc_seg(c,P(-1.1,0),P(-1.1,1));sc_seg(c,P(1.1,0),P(1.1,1));c.strokeStyle='#5a4632';c.lineWidth=2;c.stroke();
  if(!fill3(c,[P(-1.4,1),P(1.4,1),P(1.4,2.5),P(-1.4,2.5)],wash('#6b4a32',.85),INK,.7,1,.5))return;fill3(c,[P(-1.25,1.1),P(1.25,1.1),P(1.25,2.3),P(-1.25,2.3)],wash('#9fb0a8',.6),null,0,1,.5);
  c.beginPath();const R=mulberry32(5);for(let i=0;i<7;i++){const u=-1.15+(i%4)*.6+R()*.08,z=i<4?1.7:1.18;sc_pq(c,[P(u,z),P(u+.45,z),P(u+.45,z+.5),P(u,z+.5)])}c.fillStyle='#f4f1e6';c.fill();c.strokeStyle=INK;c.globalAlpha=.3;c.lineWidth=.6;c.stroke();c.globalAlpha=1;
  label3(c,X,Y,2.75,L2('নোটিশ বোর্ড','Notice board'),.3,INK)}
/* the jhalmuri box: a tin with a glass front on four legs, jars of muri, chanachur, onion and chilli */
function sc_muriBox(c,a){const X=a.X+.9,Y=a.Y-.1,q=pj(X,Y,0);if(!seen(q[2]))return;const s=PAN.F/q[3],x=q[0],y=q[1];
  c.strokeStyle='#5a4632';c.lineWidth=Math.max(1,.05*s);c.beginPath();c.moveTo(x-.3*s,y);c.lineTo(x-.3*s,y-.8*s);c.moveTo(x+.3*s,y);c.lineTo(x+.3*s,y-.8*s);c.stroke();
  c.fillStyle=wash('#b9bcc0',.9);c.fillRect(x-.4*s,y-1.3*s,.8*s,.5*s);c.fillStyle='rgba(220,235,240,.8)';c.fillRect(x-.34*s,y-1.24*s,.68*s,.32*s);
  ['#f2ead2','#d9a441','#c0392b','#3f8f3a'].forEach((col,i)=>{c.fillStyle=col;c.fillRect(x+(-.3+i*.16)*s,y-1.08*s,.12*s,.15*s)});
  c.strokeStyle=INK;c.globalAlpha=.7;c.lineWidth=1;c.strokeRect(x-.4*s,y-1.3*s,.8*s,.5*s);c.globalAlpha=1;
  if(s>18){c.font=`700 ${Math.max(8,.14*s).toFixed(1)}px ${F_BN}`;c.fillStyle='#b8432f';c.textAlign='center';c.textBaseline='middle';c.fillText('ঝালমুড়ি',x,y-1.4*s)}}
/* a cycle rickshaw on the road with its puller (and maybe a passenger) */
function sc_rick(c,r){const q=pj(r.x,r.y,0);if(!seen(q[2]))return;const s=PAN.F/q[3],x=q[0],y=q[1],e=pj(r.x+1,r.y,0),dir=Math.sign((e[0]-q[0])*(r.v||r.f))||1,X=k=>x+dir*k*s;
  if(r.pax)figAt(c,r.pax,r.x-Math.sign(r.v||r.f)*.35,r.y,.45);
  c.lineWidth=Math.max(.8,s*.05);c.strokeStyle=INK;c.beginPath();c.moveTo(X(-.35)+.34*s,y-.34*s);c.arc(X(-.35),y-.34*s,.34*s,0,TAU);c.moveTo(X(1.05)+.3*s,y-.3*s);c.arc(X(1.05),y-.3*s,.3*s,0,TAU);c.moveTo(X(-.35),y-.34*s);c.lineTo(X(1.05),y-.3*s);c.globalAlpha=.8;c.stroke();c.globalAlpha=1;
  c.fillStyle=wash(r.col,.8);c.fillRect(Math.min(X(-.75),X(.05)),y-1*s,.8*s,.32*s);
  if(r.hood){c.fillStyle=wash(r.hood,.8);c.beginPath();c.moveTo(X(-.85),y-.95*s);c.quadraticCurveTo(X(-.95),y-2*s,X(.05),y-1.95*s);c.lineTo(X(-.1),y-.98*s);c.closePath();c.fill();c.globalAlpha=.7;c.stroke();c.globalAlpha=1}
  r.p.fc=dir;if(r.pax)r.pax.fc=dir;figAt(c,r.p,r.x+Math.sign(r.v||r.f)*.75,r.y,.35)}

/* ---- the scene ---- */
function sc_initPlace(cf){const R=mulberry32(cf.id.length*97+cf.main.y*13);
  SC.sky=[];for(let i=0;i<60;i++){const a=R()*TAU,r=90+R()*110;SC.sky.push({a,w:(6+R()*12)/r,r,h:14+R()*(R()<.25?55:26),col:['#cdd3d6','#d8d0c0','#c7cfc4','#d6c9b8','#c9cfd8'][i%5]})}SC.sky.sort((a,b)=>b.r-a.r);
  const y=cf.gateY-14,cols=['#d9c7a3','#c7b8a8','#e0d6c0','#bfc9c6','#d6b8a0','#cfc2b0'],SG=[['আলোকিত কোচিং সেন্টার','Alokito Coaching Centre'],['ফটোকপি · প্রিন্ট','Photocopy · print'],['বই ঘর · স্টেশনারি','Boi Ghor · stationery'],['চা · বিস্কুট','Tea · biscuits'],['মডেল টেস্ট · ভর্তি চলছে','Model tests · admissions open'],['স্কুল ড্রেস টেইলার্স','School uniform tailors']];
  SC.shops=[];for(let x=-96,i=0;x<96;i++){const w=8+R()*9;SC.shops.push({y:y-R()*3,x0:x,x1:x+w,h:8+R()*16,col:cols[i%6],sign:SG[i%6]});x+=w+.6}
  SC.trees=cf.trees.map(([X,Y,kind],i)=>{const r=kind==='banyan'?8:5+R()*1.6;return{X,Y,t:{x:0,y:0,kind,r,h:r*1.35+2+R()*2,seed:(cf.id.length*1000+i*77)|0,blobs:null,sway:R()*TAU}}});
  SC.rk=[];for(let i=0;i<7;i++){const f=i%2?1:-1;SC.rk.push({x:-90+R()*180,y:cf.gateY-(f>0?5:8),v:f*(3+R()*1.4),f,col:['#1d2b4a','#6b2f3f','#2f4f3a','#4a3a6b'][i%4],hood:R()<.6?['#b8432f','#2f6b4f','#e0a526','#2e6fa7'][i%4]:null,p:makePerson('puller',false),pax:R()<.6?makePerson(mpick(['customer','office','student'])):null})}
  SC.benches=[];if(cf.kind!=='school')for(let i=0;i<14&&SC.benches.length<6;i++){const X=sc_mr0(R,cf.wallW+5,(cf.side?cf.side.x:cf.wallE)-5),Y=sc_mr0(R,cf.gateY+5,cf.main.y-5);
    if(SC.benches.some(b=>Math.hypot(b.X-X,b.Y-Y)<6)||cf.court&&X>cf.court[0]-2&&X<cf.court[1]+2&&Y>cf.court[2]-2&&Y<cf.court[3]+2||Math.hypot(X,Y)<6||Math.hypot(X-cf.flag[0],Y-cf.flag[1])<5||Math.hypot(X-cf.minar[0],Y-cf.minar[1])<7)continue;const r=Math.hypot(X,Y);SC.benches.push({X,Y,ux:-Y/r,uy:X/r,L:3})}   // concrete benches round the lawn
  for(const r of SC.rk){r.p.pose='pedal';r.p.fixed=true;if(r.pax){r.pax.pose='sit';r.pax.fixed=true}}
  /* rickshaws waiting at the gate for the children going home */
  for(let i=0;i<4;i++){const p=makePerson('puller',false);p.pose='sit';p.fixed=true;SC.rk.push({x:cf.gateX+7+i*3.2,y:cf.gateY-3.6,v:0,f:1,park:true,col:['#1d2b4a','#6b2f3f'][i%2],hood:'#2f6b4f',p,pax:null})}}
function sc_init(place){const cf=place.cfg;SC.cfg=cf;SC.flag=0;sc_initPlace(cf);SC.ph=null;sc_sync(true);SC.flag=SC.ph.wk||HOUR<cf.shifts[0].a||HOUR>=18?0:1;
  PAN.yaw=Math.atan2(cf.main.y,(cf.main.x0+cf.main.x1)/2)-.15;SC.talkT=6;SC.venT=10;
  const P=SC.ph.ph,g=cf.kind!=='school';
  stSay(P==='closed'?(SC.ph.wk?L2('আজ ছুটির দিন। মাঠ ফাঁকা, শুধু দারোয়ান।','It\'s the weekend. The yard is empty but for the darwan.'):L2('ক্যাম্পাস বন্ধ। গেটে দারোয়ান বসে।','The campus is shut. The darwan sits at the gate.'))
    :P==='assembly'?L2('সমাবেশ চলছে। সবাই সারি বেঁধে দাঁড়িয়ে।','Assembly: everyone stands in rows.'):P==='tiffin'?(g?L2('বিরতি চলছে। বেঞ্চে আড্ডা।','Break time: chatting on the benches.'):L2('টিফিনের ঘণ্টা পড়েছে!','The tiffin bell has gone!')):P==='leave'?L2('ছুটি! গেটে অভিভাবকদের ভিড়।','Home time! Guardians crowd the gate.')
    :L2(g?'ক্যাম্পাসে আপনি। চারপাশে ঘুরে দেখুন।':'স্কুলের মাঠে আপনি। চারপাশে ঘুরে দেখুন।',g?'You are on the campus. Have a look around.':'You are in the school yard. Have a look around.'))}
function sc_drawScene(c){const cf=SC.cfg,night=lightsOn(),hor=PAN.hor,P=SC.ph.ph;
  const sg=c.createLinearGradient(0,0,0,hor);const dusk=HOUR>16.8&&HOUR<18.6?1-Math.abs(HOUR-17.7)/.9:0;
  sg.addColorStop(0,night>.5?'#3a4660':rain>.4?'#b9bdc0':'#cfe0ea');sg.addColorStop(1,night>.5?'#5a5f70':dusk>0?'#f0d2a8':'#efe8d8');c.fillStyle=sg;c.fillRect(0,0,W,hor);
  c.fillStyle=cf.ground==='paved'?wash('#c9c0ae',.85):wash('#8fb069',.55);c.fillRect(0,hor,W,H-hor);   // you stand on the yard, so it fills the ground; the walls hide whatever lies beyond
  for(const b of SC.sky){const p=a=>[Math.cos(a)*b.r,Math.sin(a)*b.r],A=p(b.a-b.w),Bq=p(b.a+b.w);if(!fill3(c,[[A[0],A[1],0],[Bq[0],Bq[1],0],[Bq[0],Bq[1],b.h],[A[0],A[1],b.h]],wash(b.col,.6),INK,.3,.8,8))continue;
    c.beginPath();for(let z=5;z<b.h-2;z+=4)for(let k=.15;k<.86;k+=.18){const a=b.a-b.w+2*b.w*k,P0=p(a),P1=p(a+b.w*.16);sc_pq(c,[[P0[0],P0[1],z],[P1[0],P1[1],z],[P1[0],P1[1],z+1.6],[P0[0],P0[1],z+1.6]])}c.fillStyle=night>.4?'rgba(255,214,140,.35)':'rgba(90,96,104,.22)';c.fill()}
  /* the road and the shops across it */
  const gy=cf.gateY;fill3(c,[[-160,gy-1.6,0],[160,gy-1.6,0],[160,gy-11,0],[-160,gy-11,0]],wash('#8f8b84',.6),null,0,1,6);
  fill3(c,[[-160,gy,0],[160,gy,0],[160,gy-1.6,0],[-160,gy-1.6,0]],wash('#b5ab98',.7),null,0,1,6);
  for(const s of SC.shops){drawBlockFront(c,s.y,s.x0,s.x1,s.h,s.col,[{x:(s.x0+s.x1)/2,w:s.x1-s.x0-1.2,z0:3,z1:4.2,fill:wash(mpickSeeded(['#2e6fa7','#b8432f','#2f6b4f','#e0a526'],s.x0|0),.85),t:L2(...s.sign),m:.5,ink:'#fbf7ea'},{x:(s.x0+s.x1)/2,w:s.x1-s.x0-2,z0:0,z1:2.6,fill:'rgba(60,50,40,.5)'}],null);
    c.beginPath();for(let z=6;z<s.h-1.5;z+=3.2)for(let x=s.x0+1;x<s.x1-1.6;x+=2.6)sc_pq(c,[[x,s.y+.01,z],[x+1.4,s.y+.01,z],[x+1.4,s.y+.01,z+1.5],[x,s.y+.01,z+1.5]]);c.fillStyle=night>.4?'rgba(255,214,140,.55)':'rgba(70,74,80,.45)';c.fill()}
  for(const r of SC.rk)if(!r.park||P==='leave'||P==='arrive')sc_rick(c,r);
  const out=PAN.crowd.filter(a=>a.Y<gy-.2).sort((a,b)=>Math.hypot(b.X,b.Y)-Math.hypot(a.X,a.Y));for(const a of out){sc_fig(c,a);if(a.cat==='vendor')sc_muriBox(c,a)}
  /* the campus ground */
  const yb=sc_yardBox(),gx0=cf.wallW,gx1=cf.side?cf.side.x:cf.wallE,gy1=cf.main.y;
  if(cf.ground==='grass'||cf.ground==='lawn'){c.beginPath();const R=mulberry32(11);for(let i=0;i<14;i++){const X=sc_mr0(R,yb[0],yb[1]),Y=sc_mr0(R,yb[2],yb[3]),r=cf.ground==='lawn'?1+R()*1.6:1.5+R()*3;sc_pq(c,[[X-r,Y-r*.6,0],[X+r,Y-r*.7,0],[X+r*.8,Y+r*.6,0],[X-r*.9,Y+r*.5,0]])}c.fillStyle=wash('#b9a37a',.45);c.fill()}   // worn bare patches
  c.beginPath();for(let y=gy;y<gy1;y+=2)sc_pq(c,[[cf.gateX-1.3,y,0],[cf.gateX+1.3,y,0],[cf.gateX+1.3,y+2.02,0],[cf.gateX-1.3,y+2.02,0]]);c.fillStyle=wash('#b0705a',.45);c.fill();   // the brick path from the gate
  if(cf.pitch){const[px,py]=cf.pitch;fill3(c,[[px-11.5,py-1.4,0],[px+11.5,py-1.4,0],[px+11.5,py+1.4,0],[px-11.5,py+1.4,0]],wash('#c9a36b',.8),INK,.3,.8,2);
    c.beginPath();for(const sx of[px-10.06,px+10.06]){for(let k=-1;k<=1;k++)sc_seg(c,[sx,py+k*.11,0],[sx,py+k*.11,.71])}c.strokeStyle='#e8dcc0';c.lineWidth=2;c.stroke()}
  if(cf.goal){const[gx,gy2]=cf.goal;c.beginPath();sc_seg(c,[gx,gy2-3.6,0],[gx,gy2-3.6,2.4]);sc_seg(c,[gx,gy2+3.6,0],[gx,gy2+3.6,2.4]);line3(c,[[gx,gy2-3.6,2.4],[gx,gy2+3.6,2.4]],2);c.strokeStyle='#f6f4ec';c.lineWidth=3;c.stroke();ink3(c,[[gx,gy2-3.6,2.4],[gx,gy2+3.6,2.4]],INK,.4,.8,2)}
  if(cf.court){const[x0,x1,y0,y1]=cf.court;fill3(c,[[x0,y0,0],[x1,y0,0],[x1,y1,0],[x0,y1,0]],wash('#c9803f',.7),'#f7f3e8',.9,1.5,2);ink3(c,[[x0,(y0+y1)/2,0],[x1,(y0+y1)/2,0]],'#f7f3e8',.9,1.5,2);
    c.beginPath();for(const yy of[y0+1.2,y1-1.2]){const m=(x0+x1)/2;sc_seg(c,[m,yy,0],[m,yy,3.4]);sc_pq(c,[[m-.9,yy,2.9],[m+.9,yy,2.9],[m+.9,yy,4],[m-.9,yy,4]])}c.strokeStyle=INK;c.lineWidth=1.4;c.stroke()}
  /* the boundary wall and the gate */
  sc_walls(c);
  /* everything in the yard, far to near */
  const it=[],m=cf.main,s=cf.side;
  const mainB={o:[m.x0,m.y],t:[1,0],n:[0,1],L:m.x1-m.x0,D:m.D,fl:m.fl,col:cf.col,ver:m.glass?0:2.2,trim:cf.trim,glass:m.glass,heads:P==='class',sign:{u:(m.x1-m.x0)/2,w:Math.min(m.x1-m.x0-4,cf.kind==='school'?22:16),col:cf.board,t:cf.sign},ppl:[]};
  it.push({d:m.y,f:()=>sc_block(c,mainB)});
  let sideB=null;if(s){sideB={o:[s.x,s.y0],t:[0,1],n:[1,0],L:s.y1-s.y0,D:s.D,fl:s.fl,col:s.col,ver:s.ver,trim:cf.trim,heads:P==='class',label:s.label,ppl:[]};it.push({d:s.x,f:()=>sc_block(c,sideB)})}
  if(cf.minar)it.push({d:Math.hypot(...cf.minar),f:()=>sc_minar(c,cf.minar,cf.kind==='uni'?.7:cf.id==='ideal'?.75:1)});
  it.push({d:Math.hypot(...cf.flag),f:()=>sc_flag(c,cf.flag)});it.push({d:Math.hypot(...cf.notice),f:()=>sc_notice(c,cf.notice)});
  for(const t of SC.trees)it.push({d:Math.hypot(t.X,t.Y),f:()=>sc_tree(c,t)});
  for(const b of SC.benches)it.push({d:Math.hypot(b.X,b.Y)+.2,f:()=>sc_bench(c,b)});
  for(const a of PAN.crowd){if(a.Y<gy-.2)continue;if(a.blk==='main'){mainB.ppl.push(a);continue}if(a.blk==='side'&&sideB){sideB.ppl.push(a);continue}it.push({d:Math.hypot(a.X,a.Y),f:()=>{if(a.cat==='darwan'&&a.sit)sc_stool(c,a);sc_fig(c,a);if(a.crk==='bat')sc_bat(c,a)}})}
  mainB.ppl.sort((a,b)=>Math.hypot(b.X,b.Y)-Math.hypot(a.X,a.Y));if(sideB)sideB.ppl.sort((a,b)=>Math.hypot(b.X,b.Y)-Math.hypot(a.X,a.Y));
  for(const bp of sc_balls())it.push({d:Math.hypot(bp[0],bp[1])-.3,f:()=>{const q=pj(bp[0],bp[1],bp[2]);if(!seen(q[2]))return;const r=Math.max(1.6,bp[3]*PAN.F/q[3]);c.fillStyle=bp[4];c.beginPath();c.arc(q[0],q[1],r,0,TAU);c.fill();c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=.8;c.stroke();c.globalAlpha=1}});
  it.sort((a,b)=>b.d-a.d);for(const x of it)x.f();
  /* dusk and night: tube lights on the verandas, a bulb over the gate */
  const lamps=[[cf.gateX-3.6,gy+.3,3.2],[cf.gateX+3.6,gy+.3,3.2]];if(!m.glass)for(let x=m.x0+6;x<m.x1;x+=14)lamps.push([x,m.y+1,2.9]);if(s&&s.ver)for(let y=s.y0+6;y<s.y1-8;y+=14)lamps.push([s.x+1,y,2.9]);
  panoNight(c,lamps)}
const sc_mr0=(R,a,b)=>a+(b-a)*R();
function sc_bench(c,b){const P=(u,d,z)=>[b.X+b.ux*u+b.uy*d*0,b.Y+b.uy*u-b.ux*d*0,z],h=b.L/2,r=Math.hypot(b.X,b.Y),rx=b.X/r,ry=b.Y/r,Q=(u,d,z)=>[b.X+b.ux*u+rx*d,b.Y+b.uy*u+ry*d,z];
  c.beginPath();for(const u of[-h+.2,h-.2])sc_pq(c,[Q(u-.08,-.15,0),Q(u+.08,-.15,0),Q(u+.08,-.15,.42),Q(u-.08,-.15,.42)]);c.fillStyle=wash('#a9a294',.9);c.fill();
  c.beginPath();sc_pq(c,[Q(-h,-.2,.42),Q(h,-.2,.42),Q(h,.2,.42),Q(-h,.2,.42)]);sc_pq(c,[Q(-h,-.2,.36),Q(h,-.2,.36),Q(h,-.2,.42),Q(-h,-.2,.42)]);c.fillStyle=wash('#c9c2b2',.9);c.fill();c.strokeStyle=INK;c.globalAlpha=.55;c.lineWidth=.8;c.stroke();c.globalAlpha=1}
function sc_stool(c,a){const q=pj(a.X,a.Y,0);if(!seen(q[2])||q[3]<2.6)return;const s=PAN.F/q[3];c.fillStyle=wash('#2e6fa7',.8);c.fillRect(q[0]-.2*s,q[1]-.46*s,.4*s,.07*s);c.strokeStyle=wash('#2e6fa7',.9);c.lineWidth=Math.max(1,.04*s);c.beginPath();c.moveTo(q[0]-.17*s,q[1]-.4*s);c.lineTo(q[0]-.2*s,q[1]);c.moveTo(q[0]+.17*s,q[1]-.4*s);c.lineTo(q[0]+.2*s,q[1]);c.stroke()}   // a blue plastic stool
function sc_bat(c,a){const q=pj(a.X,a.Y,.95),e=pj(a.X+.2,a.Y,.1);if(!seen(q[2])||q[3]<2.6)return;const s=PAN.F/q[3];c.strokeStyle='#c9a36b';c.lineWidth=Math.max(1.5,.08*s);c.beginPath();c.moveTo(q[0]+a.p.fc*.15*s,q[1]);c.lineTo(q[0]+a.p.fc*.45*s,e[1]-.05*s);c.stroke()}
function sc_balls(){const o=[];if(SC.fb)o.push([SC.fb.x,SC.fb.y,.11,.11,'#f6f4ec']);const B=SC.ball;if(!B)return o;const t=B.t,a=B.from,b=B.to,bowled=B.kind==='crk'&&a===B.bowl;
  const h=bowled?(t<.7?(1-t/.7)*.9:Math.sin((t-.7)/.3*Math.PI)*.6):4*B.arc*t*(1-t);   // the bowled ball bounces once before the bat
  o.push([a.X+(b.X-a.X)*t,a.Y+(b.Y-a.Y)*t,(bowled?.1:B.kind==='bask'?1.5:.9)+h,B.kind==='bask'?.12:.04,B.kind==='bask'?'#c8642a':'#b02a2a']);return o}
function sc_walls(c){const cf=SC.cfg,gy=cf.gateY,gx=cf.gateX,yN=cf.main.y+cf.main.D,wh=2.4,col=wash('#e8e2d2',.85),cap=wash('#cfc6b4',.85),open=sc_open(SC.ph.ph);
  const seg=(a,b)=>{fill3(c,[[a[0],a[1],0],[b[0],b[1],0],[b[0],b[1],wh],[a[0],a[1],wh]],col,INK,.55,1,3);fill3(c,[[a[0],a[1],wh],[b[0],b[1],wh],[b[0],b[1],wh+.18],[a[0],a[1],wh+.18]],cap,INK,.4,.7,3)};
  seg([cf.wallW,yN],[cf.wallW,gy]);seg([cf.wallE,gy],[cf.wallE,cf.side?cf.side.y0:yN]);seg([cf.wallW,yN],[cf.main.x0,yN]);if(!cf.side)seg([cf.main.x1,yN],[cf.wallE,yN]);
  /* the street side: a low wall with an iron grille on top, so the road shows through */
  const low=(a,b)=>{fill3(c,[[a,gy,0],[b,gy,0],[b,gy,1.2],[a,gy,1.2]],col,INK,.55,1,3);fill3(c,[[a,gy,1.2],[b,gy,1.2],[b,gy,1.32],[a,gy,1.32]],cap,INK,.4,.7,3);
    c.beginPath();for(let x=a+.12;x<b;x+=.24)sc_seg(c,[x,gy,1.32],[x,gy,2.5]);line3(c,[[a,gy,2.45],[b,gy,2.45]],3);line3(c,[[a,gy,1.9],[b,gy,1.9]],3);c.strokeStyle='#3d3833';c.globalAlpha=.7;c.lineWidth=.9;c.stroke();c.globalAlpha=1;
    for(let x=a;x<=b;x+=6)fill3(c,[[x-.2,gy+.02,0],[x+.2,gy+.02,0],[x+.2,gy+.02,2.6],[x-.2,gy+.02,2.6]],col,INK,.5,.8,1)};
  low(cf.wallW,gx-3.3);low(gx+3.3,cf.wallE);
  const lw=(gx-3.3+cf.wallW)/2,rw=(gx+3.3+cf.wallE)/2;
  label3(c,lw,gy+.03,.7,L2('শিক্ষাই জাতির মেরুদণ্ড','Education is the backbone of the nation'),.5,'#2f5f8a','700');
  label3(c,rw,gy+.03,.7,L2('ধূমপানমুক্ত এলাকা','No smoking on campus'),.42,'#b8432f','700');
  label3(c,cf.wallW+.02,(gy+yN)/2,1.4,L2('পরিষ্কার-পরিচ্ছন্ন থাকুন','Keep the campus clean'),.42,'#2e7d32','700');
  /* pillars, the arch with the name, the grille gate */
  for(const x of[gx-3.6,gx+3.6]){fill3(c,[[x-.35,gy+.05,0],[x+.35,gy+.05,0],[x+.35,gy+.05,4.6],[x-.35,gy+.05,4.6]],wash('#e0d8c6',.9),INK,.7,1,1)}
  fill3(c,[[gx-4,gy+.06,4.6],[gx+4,gy+.06,4.6],[gx+4,gy+.06,5.8],[gx-4,gy+.06,5.8]],wash(cf.board,.85),INK,.8,1,1);label3(c,gx,gy+.07,5.2,L2(...cf.arch),.42,'#fbf7ea');
  c.beginPath();const bars=(x0,y0,x1,y1)=>{const L=Math.hypot(x1-x0,y1-y0),n=Math.ceil(L/.16);for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;sc_seg(c,[x,y,.08],[x,y,2.2])}for(const z of[.1,1.15,2.2])sc_seg(c,[x0,y0,z],[x1,y1,z])};
  if(open){bars(gx-3.25,gy+.1,gx-3.25+.4,gy+3.1);bars(gx+3.25,gy+.1,gx+3.25-.4,gy+3.1)}else{bars(gx-3.25,gy+.1,gx,gy+.1);bars(gx,gy+.1,gx+3.25,gy+.1)}
  c.strokeStyle='#3d3833';c.globalAlpha=.85;c.lineWidth=1.1;c.stroke();c.globalAlpha=1}

/* ---- the panel ---- */
function sc_schedule(){const cf=SC.cfg;return cf.shifts.map(s=>L2(`${s.n[0]} ${hhmm(s.a)}–${hhmm(s.b)}`,`${s.n[1]} ${hhmm(s.a)}–${hhmm(s.b)}`)).join(' · ')}
function sc_sub(){const ph=SC.ph,s=ph.s,P=ph.ph;
  const what=P==='closed'?(ph.wk?L2('সাপ্তাহিক ছুটি (শুক্র–শনি)। ক্যাম্পাস বন্ধ।','Weekend (Friday–Saturday). The campus is shut.'):L2('বন্ধ। শুধু দারোয়ান পাহারায়।','Shut for the night. Only the darwan on watch.'))
    :P==='arrive'?(SC.cfg.kind==='school'?L2(`${s.n[0]} শাখা শুরু হচ্ছে, সবাই ঢুকছে।`,`${s.n[1]} shift starting: everyone is coming in.`):L2('ক্লাস শুরু হচ্ছে, সবাই ঢুকছে।','Classes are starting: everyone is coming in.')):P==='assembly'?L2('সমাবেশ: জাতীয় সংগীত আর শপথ।','Assembly: the national anthem and the oath.')
    :P==='class'?(SC.cfg.kind==='school'?L2(`${s.n[0]} শাখা: ক্লাস চলছে।`,`${s.n[1]} shift: classes in session.`):L2('ক্লাস চলছে।','Classes in session.')):P==='tiffin'?(SC.cfg.kind==='school'?L2('টিফিনের বিরতি!','Tiffin break!'):L2('দুপুরের বিরতি।','Midday break.')):P==='leave'?L2('ছুটির ঘণ্টা! গেটে অভিভাবকেরা।','Home time! Guardians at the gate.')
    :SC.cfg.kind==='school'?L2('শিফটের বাইরে, মাঠ প্রায় ফাঁকা।','Between shifts: the yard is nearly empty.'):L2('ক্লাস শেষ; কেউ কেউ আড্ডায়, খেলায়।','Classes are over; a few stay on to chat and play.');
  return L2(`এখন ${hhmm(HOUR)}। ${what} রবি–বৃহস্পতি: ${sc_schedule()}`,`It's ${hhmm(HOUR)}. ${what} Sun–Thu: ${sc_schedule()}`)}
const SC_ACTS=[
 ['watch',()=>L2('মাঠের দিকে তাকান','Look at the yard'),0],
 ['student',()=>L2('একজন ছাত্রের সাথে কথা','Talk to a student'),0],
 ['muri',()=>L2('গেটে ঝালমুড়ি কিনুন','Buy jhalmuri at the gate'),20],   // a paper cone of jhalmuri, 20 taka [U]
 ['darwan',()=>L2('দারোয়ানকে জিজ্ঞেস করুন','Ask the darwan'),0]];
function sc_act(k){const cf=SC.cfg,P=SC.ph.ph,near=f=>PAN.crowd.filter(a=>!a.gone&&f(a)).sort((a,b)=>Math.hypot(a.X,a.Y)-Math.hypot(b.X,b.Y))[0];
  if(k==='watch'){if(P==='assembly'){lookAt(cf.flag[0],cf.flag[1]-3);stSay(L2('“আমার সোনার বাংলা, আমি তোমায় ভালোবাসি…” তারপর শপথ: “আমি শপথ করিতেছি যে…”','"Amar Sonar Bangla, ami tomay bhalobashi…" then the oath: "I solemnly swear that…"'))}
    else if(P==='tiffin'||P==='idle'||P==='closed'&&SC.ph.wk){const b=SC.fb||(SC.ball&&SC.ball.from);if(b)lookAt(b.X!==undefined?b.X:b.x,b.Y!==undefined?b.Y:b.y);else lookAt(...sc_yardPt());
      stSay(SC.ph.wk?L2('ছুটির দিনে পাড়ার ছেলেরা মাঠে ক্রিকেট খেলছে।','On the weekend the neighbourhood boys have the field for cricket.'):cf.kind==='school'?L2('টিফিনে মাঠ জুড়ে দৌড়ঝাঁপ, ক্রিকেট, ফুটবল।','Tiffin: running, cricket and football all over the yard.'):L2('আড্ডা, বাস্কেটবল, ক্যান্টিনে চা।','Chatting, basketball, tea at the canteen.'))}
    else if(P==='class'){const t=near(a=>a.cat==='teach');if(t)lookAt(t.X,t.Y);stSay(L2('ক্লাস চলছে। শিক্ষক দরজায়, বারান্দায় দু-একজন।','Classes are on. A teacher at a door, a few pupils on the verandas.'))}
    else if(P==='leave'||P==='arrive'){lookAt(cf.gateX,cf.gateY);stSay(L2('গেটে ভিড়: অভিভাবক, রিকশা, ঝালমুড়িওয়ালা।','A crowd at the gate: guardians, rickshaws, the jhalmuri man.'))}
    else{lookAt(...(cf.minar||cf.flag));stSay(L2('ফাঁকা মাঠ, শহীদ মিনার, পতাকার খুঁটি।','An empty yard, the Shaheed Minar, the flag pole.'))}}
  else if(k==='student'){const a=near(a=>['rows','ver','play','run','gatekid','walk','loiter','flow'].includes(a.cat)&&a.p.role==='student');
    if(!a){const d=near(a=>a.cat==='darwan');if(d)lookAt(d.X,d.Y);stSay(L2('এখন কোনো ছাত্র নেই, বাবা। স্কুল খুললে আসেন।','No students now. Come when school is open.'),d);return}
    lookAt(a.X,a.Y);playVoice('pupil_1',me.x,me.y);const f=a.p.look.female;
    const L=cf.kind==='college'?[['এইচএসসির প্র্যাকটিক্যাল সামনের সপ্তাহে। ক্লাসের পর বাস্কেটবল।','HSC practicals next week. Basketball after class.'],['নটর ডেমে উপস্থিতি কড়া, ৭৫ শতাংশ না হলে পরীক্ষা দিতে দেবে না।','Attendance is strict at Notre Dame: under 75% and they won\'t let you sit the exam.']]
      :cf.kind==='uni'?[['মিডটার্ম শেষ, এখন প্রজেক্ট। ক্যান্টিনে চা খাবেন?','Midterms are over, now projects. Tea at the canteen?'],['এখানে ক্লাস সারাদিন, সেকশন অনুযায়ী।','Classes all day here, depending on your section.']]
      :[[f?'আমি ক্লাস সেভেনে। আম্মু গেটের বাইরে বসে আছে।':'আমি ক্লাস সেভেনে পড়ি। টিফিনে ক্রিকেট খেলি।',f?'I\'m in class seven. Ammu is waiting outside the gate.':'I\'m in class seven. We play cricket at tiffin.'],['সামনে বার্ষিক পরীক্ষা। স্কুলের পরে কোচিং আছে।','Annual exams are coming. Coaching after school.'],['টিফিনে সিঙ্গারা আর ঝালমুড়ি খাই।','At tiffin I have a singara and jhalmuri.']];
    stSay(L2(...mpick(L)),a)}
  else if(k==='muri'){const v=near(a=>a.cat==='vendor');if(!v){const d=near(a=>a.cat==='darwan');if(d)lookAt(d.X,d.Y);stSay(L2('ঝালমুড়িওয়ালা এখন নেই। স্কুলের দিনে সকালে আসে।','The jhalmuri man isn\'t here now. He comes on school days.'),d);return}
    if(STAT.wallet<20)return;lookAt(v.X,v.Y);addMoney(-20);addEnergy(5);HOUR=(HOUR+4/60)%24;playVoice('hawker_jhalmuri_1',me.x,me.y);stSay(L2('মুড়ি, চানাচুর, পেঁয়াজ, কাঁচামরিচ, সরিষার তেল… ঝাঁকিয়ে দিলাম! বিশ টাকা।','Puffed rice, chanachur, onion, green chilli, mustard oil… all shaken up! Twenty taka.'),v);updateStatusUI()}
  else if(k==='darwan'){const d=near(a=>a.cat==='darwan');if(d)lookAt(d.X,d.Y);playVoice('guard_1',me.x,me.y);
    const open=sc_open(P),bn=`${cf.sign[0]}, প্রতিষ্ঠা ${cf.est[0]}। ${sc_schedule()}, রবি থেকে বৃহস্পতি।`,en=`${cf.sign[1]}, founded ${cf.est[1]}. ${sc_schedule()}, Sunday to Thursday.`;
    stSay(open?L2(bn,en):L2(`ক্লাসের সময় বাইরের লোক ঢোকা নিষেধ, ভাই। ${bn}`,`No outsiders while classes are on, brother. ${en}`),d)}}
function sc_marks(){const cf=SC.cfg,deg=(x,y)=>Math.atan2(y,x)*180/Math.PI,m=cf.main,o=[[deg((m.x0+m.x1)/2,m.y),L2(cf.kind==='school'?'স্কুল ভবন':'মূল ভবন',cf.kind==='school'?'School building':'Main building')],[deg(cf.gateX,cf.gateY),L2('গেট · ঝালমুড়ি','Gate · jhalmuri')]];
  if(cf.side)o.push([deg(cf.side.x,(cf.side.y0+cf.side.y1)/2),L2(...cf.side.label)]);if(cf.minar)o.push([deg(...cf.minar),L2('শহীদ মিনার','Shaheed Minar')]);return o}
PANO_SCENES.push({key:'school',indoor:false,places:sc_getPlaces,init:sc_init,update:sc_update,draw:sc_drawScene,sub:sc_sub,acts:SC_ACTS,act:sc_act,marks:sc_marks});
