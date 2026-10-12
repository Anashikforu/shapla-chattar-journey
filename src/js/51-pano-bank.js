/* ---------------- 360° panorama: the ground-floor banking hall of a big Motijheel bank ----------------
   You stand in the public hall: a long counter with glass and steel-grille cash windows in front (+X), the glass door to the street
   behind you (-X, Motijheel traffic going past), the ATM booth, writing table and notice boards on the left (-Y), steel benches and the
   enquiry desk on the right (+Y). Officers work at desks behind the counter among files and steel almirahs.
   Hours: Bangladesh Bank set bank office hours 10:00-17:00 and transactions 10:00-15:00, Sunday-Thursday (Daily Star, 4 April 2026,
   an energy-saving measure; before that transactions ran to 15:30). [U] whether that is still in force at the game's date.
   Bangladesh Bank stopped all direct counter service at its offices (torn-note exchange, prize bonds, savings certificates,
   treasury challans) on 23 November 2025; these moved to commercial banks (Prothom Alo / Dhaka Tribune / Ittefaq, Nov 2025).
   So the Bangladesh Bank hall here shows its old currency-counter windows closed, with the notice, and a few people who did not know.
   Torn notes: full value if about 90% of the note is intact (UNB report on the BB rule). Prize bond: ৳100.
   [U] window numbering and labels, the bank colours, the lunch break pattern, the Ansar guard's uniform colour, the ATM booth at
   Bangladesh Bank, the "Local Office" names, the account balance and the once-a-day ATM habit (a game rule to keep the money sane). */
const BK_R={x0:-8,x1:15,y0:-12,y1:12,h:4.6};
const BK_CX=6.5;   // the counter's front face
const BK_NW=8,bk_winY=i=>-10.1+i*2.6;
const BK_BANKS={
 bb:{acc:'#2f6b4f',fascia:['বাংলাদেশ ব্যাংক · মতিঝিল অফিস · ক্যাশ বিভাগ','Bangladesh Bank · Motijheel Office · Cash Department'],
  win:[['ছেঁড়া-ফাটা নোট বদল','Torn notes exchange'],['ছেঁড়া-ফাটা নোট বদল','Torn notes exchange'],['প্রাইজবন্ড','Prize bonds'],['সঞ্চয়পত্র','Savings certificates'],['ট্রেজারি চালান','Treasury challan'],['ট্রেজারি চালান','Treasury challan'],['ভাংতি · নতুন নোট','Change · new notes'],['অনুসন্ধান','Enquiry']],mgr:['পরিচালক (ক্যাশ)','Director (Cash)']},
 sonali:{acc:'#c8891e',fascia:['সোনালী ব্যাংক পিএলসি · স্থানীয় কার্যালয়, মতিঝিল','Sonali Bank PLC · Local Office, Motijheel'],
  win:[['ক্যাশ জমা','Cash deposit'],['ক্যাশ জমা','Cash deposit'],['ক্যাশ উত্তোলন','Cash withdrawal'],['ক্যাশ উত্তোলন','Cash withdrawal'],['ছেঁড়া-ফাটা নোট বদল','Torn notes exchange'],['প্রাইজবন্ড · সঞ্চয়পত্র','Prize bonds · Savings cert.'],['চালান · বিল জমা','Challan · bills'],['পেনশন','Pension']],pension:7,mgr:['ব্যবস্থাপক','Manager']},
 janata:{acc:'#2f5f8a',fascia:['জনতা ব্যাংক পিএলসি · স্থানীয় কার্যালয়, মতিঝিল','Janata Bank PLC · Local Office, Motijheel'],
  win:[['ক্যাশ জমা','Cash deposit'],['ক্যাশ জমা','Cash deposit'],['ক্যাশ উত্তোলন','Cash withdrawal'],['ক্যাশ উত্তোলন','Cash withdrawal'],['রেমিট্যান্স','Remittance'],['সঞ্চয়পত্র','Savings certificates'],['বিল জমা','Utility bills'],['হিসাব খোলা','Account opening']],mgr:['ব্যবস্থাপক','Manager']},
};
const BK_LUNCH=[1,3,6];   // windows whose teller is away 13:00-14:00 (Zuhr and lunch, staggered) [U]
const bk_n=n=>LANG==='en'?String(n):bnNum(n);
const bk_tokS=n=>bk_n(String(Math.max(0,n)).padStart(3,'0'));
let BK=null;   // this visit: {kind,cfg,place,st,...}
let bk_places=null,bk_gh=0,bk_lastH=null,bk_atmDay=null,bk_bal=2350;
/* game hours that have passed (for "once a day" at the ATM): watched all the time, not just inside */
setInterval(()=>{if(bk_lastH!==null){let d=HOUR-bk_lastH;if(d<0)d+=24;if(d<=12)bk_gh+=d}bk_lastH=HOUR},500);

/* ---- where: every building called "... Bank" ---- */
function bk_distQ(q,x,y){if(inQuad(q,x,y))return 0;let m=1e9;for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);m=Math.min(m,Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t))}return m}
function bk_getPlaces(){if(bk_places)return bk_places;if(!buildings||!buildings.length)return[];
  bk_places=buildings.filter(b=>b.name&&/Bank/.test(b.name[1])&&b.foot).map(b=>{const en=b.name[1],kind=en==='Bangladesh Bank'?'bb':/Sonali/.test(en)?'sonali':/Janata/.test(en)?'janata':'gen';
    return{name:b.name,kind,b,inside:(x,y)=>bk_distQ(b.foot,x,y)<5&&!RESTOS.some(R=>R.entry&&Math.hypot(x-R.entry[0],y-R.entry[1])<6)&&!(sites.kamalapur&&inQuad(FQ(sites.kamalapur,10,90,8,86),x,y))}});
  return bk_places}

/* ---- time: closed | pre (staff arriving) | open | lunch | post (cash closed, office working) ---- */
function bk_state(){const h=HOUR;if(FRIDAY||h<9.5||h>=17.5)return'closed';if(h<10)return'pre';if(h<15)return h>=13&&h<14?'lunch':'open';return'post'}
const bk_isOpen=()=>BK&&(BK.st==='open'||BK.st==='lunch');
function bk_busy(){const h=HOUR;let b=h<10.5?.6:h<13?1:h<14?.55:.85;return BK.kind==='bb'?.12:b}
function bk_winOpen(i){if(!bk_isOpen()||BK.kind==='bb')return false;return!(BK.st==='lunch'&&BK_LUNCH.includes(i))}

/* ---- people ---- */
function bk_person(role){let p;
  if(role==='pens'){const f=Math.random()<.3;p=makePerson('customer',f);const L=p.look;L.old=true;L.hair=mpick(['#b5b0a8','#d6d2ca','#8a8580']);if(!f){L.dress='panjabi';L.c1=mpick(['#f1eee6','#e8e2cf','#dfe7ee']);L.c2='#efece4';L.cap=Math.random()<.7;L.beard=Math.random()<.6;L.henna=L.beard&&Math.random()<.3}else{L.dress='sari';L.c1=mpick(['#f1eee6','#e6e0cc','#d9e2e8']);L.c2=L.c1;L.headCover=true}}
  else if(role==='cust')p=makePerson(mpick(['customer','customer','customer','office','student','labour','garment']));
  else if(role==='teller'||role==='officer')p=makePerson('banker');
  else if(role==='peon'){p=makePerson('peon',false);p.act='carry'}
  else if(role==='guard'){p=makePerson('labour',false);Object.assign(p.look,{dress:'pants',c1:'#5f6b45',c2:'#4f5a3a',gamchha:false});p.guardCap=true}   // an armed Ansar guard, olive uniform [U]
  else if(role==='sweep'){p=makePerson('labour',Math.random()<.6);p.act='sweep'}
  else p=makePerson('customer');
  return p}
function bk_mk(role,X,Y,o){const p=bk_person(role);p.pose='stand';p.fixed=true;p.ph=Math.random()*9;p.fc=Math.random()<.5?1:-1;
  const a=Object.assign({kind:role,p,X,Y,path:[],spd:mr(.85,1.2),t:mr(2,8)},o||{});PAN.crowd.push(a);if(a.face)bk_faceTo(a);if(a.sit){a.sitting=true;p.pose='sit'}return a}
function bk_faceTo(a){if(!a.face)return;const r=Math.hypot(a.X,a.Y)||1,v=(-a.Y*a.face[0]+a.X*a.face[1])/r;if(Math.abs(v)>.05)a.p.fc=v>0?1:-1}
/* a path that walks round you rather than through you (figures closer than 2.6 m are not drawn) */
function bk_plan(x0,y0,x1,y1){const dx=x1-x0,dy=y1-y0,ll=dx*dx+dy*dy||1,t=clamp(-(x0*dx+y0*dy)/ll,0,1),cx=x0+dx*t,cy=y0+dy*t,r=Math.hypot(cx,cy);
  if(r<3.1&&t>0&&t<1){let ux=cx/r,uy=cy/r;if(r<.01){const l=Math.sqrt(ll);ux=-dy/l;uy=dx/l}return[[ux*3.5,uy*3.5],[x1,y1]]}return[[x1,y1]]}
function bk_go(a,X,Y,o={}){a.path=a.inBooth?[[X,Y]]:bk_plan(a.X,a.Y,X,Y);a.p.pose='walk';a.sitting=false;a.face=o.face||null;a.leave=!!o.leave;a.onArrive=o.then||null;a.onIdle=null}
const bk_spot=(i,k)=>[5.85-k*.62,bk_winY(i)+(k%2?.12:-.12)];
const bk_qMax=i=>Math.abs(bk_winY(i))<3?4:5;   // the lines in front of you stay short enough not to walk into you
function bk_freeA(a){if(a.seat){a.seat.who=null;a.seat=null}if(a.slot){a.slot.who=null;a.slot=null}if(a.q!==undefined){const Q=BK.Q[a.q],k=Q.indexOf(a);if(k>=0){Q.splice(k,1);bk_reQ(a.q)}a.q=undefined}}
function bk_leave(a){bk_freeA(a);bk_go(a,-7.7,mr(-1.7,1.7),{leave:true})}
function bk_reQ(i){BK.Q[i].forEach((a,k)=>{const s=bk_spot(i,k);if(Math.hypot(a.tx-s[0],a.ty-s[1])>.05){a.tx=s[0];a.ty=s[1];bk_go(a,s[0],s[1],{face:[1,0]})}})}
function bk_toQueue(a){const c=[];for(let i=0;i<BK_NW;i++)if(bk_winOpen(i)&&BK.Q[i].length<bk_qMax(i))c.push(i);
  if(!c.length){if(!bk_toBench(a))bk_leave(a);return}
  let i=a.kind==='pens'&&BK.cfg.pension!==undefined&&c.includes(BK.cfg.pension)?BK.cfg.pension:c.sort((x,y)=>BK.Q[x].length-BK.Q[y].length+(Math.random()-.5)*1.5)[0];
  if(a.kind!=='pens'&&i===BK.cfg.pension&&c.length>1)i=c.find(j=>j!==BK.cfg.pension);
  a.q=i;BK.Q[i].push(a);const s=bk_spot(i,BK.Q[i].length-1);a.tx=s[0];a.ty=s[1];bk_go(a,s[0],s[1],{face:[1,0]})}
function bk_toBench(a){const free=BK.seats.filter(s=>!s.who);if(!free.length)return false;const s=mpick(free);s.who=a;a.seat=s;
  bk_go(a,s.X,s.Y,{face:[1,0],then:b=>{b.sitting=true;b.p.pose='sit';b.t=mr(8,30);b.onIdle=c=>{bk_freeA(c);bk_isOpen()&&BK.kind!=='bb'?bk_toQueue(c):bk_leave(c)}}});return true}
function bk_toWrite(a){const free=BK.slots.filter(s=>!s.who);if(!free.length)return false;const s=mpick(free);s.who=a;a.slot=s;
  bk_go(a,s.X,s.Y,{face:[0,-1],then:b=>{b.t=mr(6,15);b.onIdle=c=>{bk_freeA(c);if(Math.random()<.7||!bk_toBench(c))bk_toQueue(c)}}});return true}
function bk_decide(a){if(BK.kind==='bb'){bk_go(a,mr(3.9,4.2),mpick([mr(-5.2,-4.7),mr(-2.1,-1.6)]),{face:[1,0],then:b=>{b.t=mr(5,10);b.onIdle=bk_leave}});return}   // reads the notice, leaves
  const r=Math.random();if(r<.3&&bk_toWrite(a))return;if(r<.6&&bk_toBench(a))return;bk_toQueue(a)}
function bk_arrive(){const a=bk_mk(Math.random()<(BK.kind==='sonali'&&HOUR<12.5?.3:.1)?'pens':'cust',-7.6,mr(-1.6,1.6),{cust:true});
  if(BK.kind==='bb'){bk_decide(a);return a}
  BK.tk.issued++;bk_go(a,-3.95,-3.25+mr(-.25,.25),{face:[-1,0],then:b=>{b.t=mr(1.2,2.6);b.onIdle=bk_decide}});return a}
function bk_atmUser(){if(PAN.crowd.some(a=>a.inBooth))return;const a=bk_mk('cust',-7.75,-10.6,{inBooth:true,spd:.7});
  bk_go(a,-6.85,-10.75,{face:[0,-1],then:b=>{b.t=mr(6,12);b.onIdle=c=>bk_go(c,-7.8,-10.6,{leave:true})}})}

/* staff for the state of the day */
function bk_staff(){for(const a of PAN.crowd)if(a.staff)a.gone=true;const st=BK.st,on=st!=='closed';
  const g=bk_mk('guard',-6.7,3.4,{staff:true,face:[1,0]});if(!on){g.sitting=true;g.p.pose='sit';g.X=-6.9;g.Y=3.6}BK.guard=g;
  if(!on)return;
  const desks=BK.desks,occ=st==='pre'?.5:BK.kind==='bb'?.7:.85;
  for(const d of desks)if(Math.random()<occ){const o=bk_mk('officer',d.X+.6,d.Y+mr(-.2,.2),{staff:true,sit:true,face:[-1,0],desk:d});if(Math.random()<.2)o.p.act='phone'}
  if(BK.kind!=='bb'&&st!=='pre')for(let i=0;i<BK_NW;i++)if(st!=='lunch'||!BK_LUNCH.includes(i)){const t=bk_mk('teller',7.55,bk_winY(i),{staff:true,sit:true,face:[-1,0],win:i});t.p.act=Math.random()<.5?'serve':null}
  if(st==='open'||st==='lunch')bk_mk('officer',-3.9,10.95,{staff:true,sit:true,face:[0,-1],enq:true});
  const pe=bk_mk('peon',9.1,mr(-9,7),{staff:true,spd:.8});pe.onIdle=function loop(a){bk_go(a,9.1,mr(-10,8),{then:b=>{b.t=mr(3,9);b.onIdle=loop}})};
  if(st==='post'){const s=bk_mk('sweep',mr(-5,3),mr(-8,8),{staff:true,spd:.35});s.onIdle=function loop(a){bk_go(a,mr(-6,4.5),mr(-9,9),{then:b=>{b.p.act='sweep';b.t=mr(2,5);b.onIdle=loop}});a.p.act='sweep'}}}
function bk_populate(){PAN.crowd.length=0;BK.Q=Array.from({length:BK_NW},()=>[]);for(const s of BK.seats)s.who=null;for(const s of BK.slots)s.who=null;
  BK.st=bk_state();bk_staff();if(!bk_isOpen())return;const b=bk_busy();
  if(BK.kind==='bb'){for(let i=0;i<3;i++){const a=bk_mk('cust',mr(3.9,4.2),mpick([mr(-5.2,-4.7),mr(-2.1,-1.6)]),{cust:true,face:[0,i%2?1:-1]});a.t=mr(1,8);a.onIdle=bk_leave}return}
  for(let i=0;i<BK_NW;i++)if(bk_winOpen(i)){const n=Math.min(bk_qMax(i),Math.round(b*mr(1,5.4)));for(let k=0;k<n;k++){const s=bk_spot(i,k),a=bk_mk(i===BK.cfg.pension&&Math.random()<.8?'pens':'cust',s[0],s[1],{cust:true,face:[1,0],q:i,tx:s[0],ty:s[1]});BK.Q[i].push(a)}}
  for(const s of BK.seats)if(Math.random()<.75*b){const a=bk_mk(Math.random()<.25?'pens':'cust',s.X,s.Y,{cust:true,face:[1,0],sit:true,seat:s});s.who=a;a.t=mr(4,30);a.onIdle=c=>{bk_freeA(c);bk_toQueue(c)}}
  for(const s of BK.slots)if(Math.random()<.6*b){const a=bk_mk('cust',s.X,s.Y,{cust:true,face:[0,-1],slot:s});s.who=a;a.t=mr(3,12);a.onIdle=c=>{bk_freeA(c);bk_toQueue(c)}}
  for(let i=0;i<2;i++)bk_arrive().delay=0}
function bk_init(place){
  const kind=place.kind,cfg=kind==='gen'?Object.assign({},BK_BANKS.janata,{acc:'#7a3f5a',fascia:[`${place.name[0]} · মতিঝিল শাখা`,`${place.name[1]} · Motijheel Branch`]}):BK_BANKS[kind];
  BK={kind,cfg,place,st:null,Q:[],tk:{now:0,issued:0,win:0},svc:new Array(BK_NW).fill(0).map(()=>mr(3,12)),my:null,fan:0,chatT:mr(4,8),atmT:mr(5,20),traf:[],peds:[],lastH:HOUR,
    seats:[],slots:[],desks:[]};
  for(const X of[-1.8,.6])for(const[y0]of[[3.4],[6.5]])for(let k=0;k<3;k++)BK.seats.push({X,Y:y0+.42+k*.83,who:null});
  for(const X of[-4.1,-3,-1.9])BK.slots.push({X,Y:-10.75,who:null});
  for(const Y of[-9.5,-5.8,-2.1,1.6,5.3])BK.desks.push({X:10.6,Y});for(const Y of[-8,-4,0,4])BK.desks.push({X:12.9,Y});
  const done=clamp(Math.round((HOUR-10)*34),0,170);BK.tk.now=done+1;BK.tk.issued=done+8;BK.tk.win=3;
  const R=mulberry32(4242),SG=[['ফার্মেসি','Pharmacy'],['হোটেল ও রেস্টুরেন্ট','Hotel & Restaurant'],['ট্রাভেলস','Travels'],['স্টেশনারি ও ফটোকপি','Stationery · Photocopy'],['ইন্স্যুরেন্স','Insurance'],['মানি চেঞ্জার','Money changer'],['মোবাইল ব্যাংকিং','Mobile banking'],['টি স্টল','Tea stall']];BK.ob=[];for(let y=-62;y<62;){const w=7+R()*7;BK.ob.push({y0:y,y1:y+w-.4,h:14+R()*38,col:['#d8d0c0','#cdd3d6','#c9bfae','#d6c9b8','#bfc7c2'][R()*5|0],sign:SG[(R()*SG.length)|0],sc:['#b8432f','#2f5f8a','#2f6b4f','#e0a526','#6b3f8a'][(R()*5)|0],lit:R()});y+=w}
  for(let i=0;i<24;i++)BK.traf.push(bk_veh(mr(-62,62)));for(let i=0;i<3;i++)BK.traf.push({k:'rk',X:-12.4,Y:mr(-8,8),v:0,col:mpick(['#1d2b4a','#6b2f3f','#2f4f3a'])});for(let i=0;i<12;i++)BK.peds.push(bk_ped(mr(-25,25)));
  bk_populate();
  const g=BK.guard;
  if(BK.st==='closed')stSay(FRIDAY?L2('আজ সাপ্তাহিক ছুটি, ব্যাংক বন্ধ। এটিএম বুথ খোলা আছে।','Weekend today, the bank is closed. The ATM booth is open.'):L2('ব্যাংক বন্ধ, স্যার। সকাল দশটায় খোলে।','The bank is closed, sir. It opens at ten.'),g);
  else if(kind==='bb'&&bk_isOpen())stSay(L2('স্যার, এখানে এখন আর কাউন্টারে লেনদেন হয় না। নোটিশটা পড়েন।','Sir, there is no counter service here any more. Read the notice.'),g);
  else if(bk_isOpen())stSay(L2('আসসালামু আলাইকুম। টোকেন নিয়া লাইনে দাঁড়ান।','Assalamu alaikum. Take a token and stand in line.'),g);
  else stSay(L2('লেনদেনের সময় শেষ, স্যার। এটিএম খোলা।','Banking hours are over, sir. The ATM is open.'),g)}

/* the street through the door */
function bk_veh(Y){const k=mpick(['rk','rk','rk','cng','cng','bus','car','car']),lane=mpick([-14,-16.5,-23,-25.5]);
  return{k,X:lane,Y,v:(lane>-20?1:-1)*(k==='rk'?mr(2.5,3.6):k==='bus'?mr(4,6):mr(5,8)),col:k==='bus'?mpick(['#b8432f','#2f6b4f','#e0a526','#2e6fa7']):k==='car'?mpick(['#e9e7e1','#b9bcc0','#2d2f33','#9b2d2d','#3c5a7a']):mpick(['#1d2b4a','#6b2f3f','#2f4f3a','#4a3a6b'])}}
function bk_ped(Y){const p=makePerson(mpick(['office','customer','labour','student','hawker']));p.pose='walk';p.fixed=true;p.ph=Math.random()*9;const X=mpick([-9.4,-10.4,-10.9,-27.6]);return{p,X,Y,v:mpick([-1,1])*mr(.9,1.3)}}

function bk_update(dt){const st=bk_state();
  if(st!==BK.st){const natural=Math.abs(wrapA((HOUR-BK.lastH)/24*TAU))/TAU*24<.25,old=BK.st;
    if(natural&&(old==='open'||old==='lunch')&&(st==='open'||st==='lunch')){BK.st=st;bk_staff()}
    else if(natural&&(old==='open'||old==='lunch')){BK.st=st;bk_staff();for(const a of PAN.crowd)if(a.cust&&!a.inBooth)bk_leave(a);
      if(BK.kind!=='bb')PAN.annT=8,PAN.ann=L2('লেনদেনের সময় শেষ। লাইনে যাঁরা আছেন, শুধু তাঁদের কাজ হবে।','Banking hours are over. Only those already in line will be served.')}
    else bk_populate()}
  BK.lastH=HOUR;
  /* walking */
  for(let i=PAN.crowd.length-1;i>=0;i--){const a=PAN.crowd[i],p=a.p;if(a.gone){PAN.crowd.splice(i,1);continue}
    if(a.path.length){const[tx,ty]=a.path[0],dx=tx-a.X,dy=ty-a.Y,L=Math.hypot(dx,dy);
      if(L<.06){a.path.shift();if(!a.path.length){if(a.leave){PAN.crowd.splice(i,1);continue}p.pose=a.sitting?'sit':'stand';bk_faceTo(a);const f=a.onArrive;a.onArrive=null;if(f)f(a)}continue}
      const s=Math.min(L,a.spd*dt);a.X+=dx/L*s;a.Y+=dy/L*s;p.ph+=dt*a.spd*5.5;const r=Math.hypot(a.X,a.Y)||1;p.fc=(-a.Y*dx+a.X*dy)/r>0?1:-1}
    else if(a.onIdle){a.t-=dt;if(a.t<=0){const f=a.onIdle;a.onIdle=null;f(a)}}}
  /* the windows serve the person in front */
  if(bk_isOpen()&&BK.kind!=='bb')for(let i=0;i<BK_NW;i++){if(!bk_winOpen(i))continue;const Q=BK.Q[i],a=Q[0];BK.svc[i]-=dt;if(BK.svc[i]>0)continue;
    const my=BK.my;
    if(my&&!my.called&&BK.tk.now+1>=my.n){my.called=true;BK.tk.now=my.n;BK.tk.win=i;BK.svc[i]=mr(7,10);lookAt(BK_CX,bk_winY(i));
      PAN.ann=L2(`টোকেন নম্বর ${bk_tokS(my.n)}, ${bk_n(i+1)} নম্বর কাউন্টারে আসুন।`,`Token number ${bk_tokS(my.n)}, please come to counter ${i+1}.`);PAN.annT=9;
      const t=PAN.crowd.find(b=>b.win===i);setTimeout(()=>{if(PANO_ON&&PAN.scene===BK_SCENE)stSay(L2(`জি, বলেন? ব্যালান্স দেখবেন? আপনার হিসাবে আছে ৳${bnNum(bk_bal.toLocaleString('en-IN'))}। পরের জন!`,`Yes? Balance enquiry? You have ৳${bk_bal.toLocaleString('en-IN')} in your account. Next!`),t)},2600);continue}
    if(!a||a.path.length){BK.svc[i]=.5;continue}
    BK.tk.now=Math.min(BK.tk.issued,BK.tk.now+1);BK.tk.win=i;BK.svc[i]=mr(10,26)*(i===4&&BK.kind==='sonali'?1.6:1);
    Q.shift();a.q=undefined;bk_reQ(i);bk_go(a,-7.7,mr(-1.7,1.7),{leave:true})}
  /* new arrivals */
  if(bk_isOpen()){const n=PAN.crowd.filter(a=>a.cust&&!a.inBooth).length,want=Math.round((BK.kind==='bb'?5:34)*bk_busy());if(n<want&&Math.random()<dt*(BK.kind==='bb'?.15:1.1))bk_arrive()}
  BK.atmT-=dt;if(BK.atmT<=0){BK.atmT=mr(14,40)*(lightsOn()>.5?2:1);bk_atmUser()}
  /* fans, the street */
  const on=BK.st!=='closed';BK.fan=on?BK.fan+dt*7:BK.fan;
  const jam=bk_isOpen()&&!FRIDAY?.55:1;
  for(const v of BK.traf){v.Y+=v.v*jam*dt;if(v.Y>65)v.Y=-65;if(v.Y<-65)v.Y=65}
  for(const q of BK.peds){q.Y+=q.v*dt;q.p.ph+=dt*5.5;if(q.Y>25)q.Y=-25;if(q.Y<-25)q.Y=25;const r=Math.hypot(q.X,q.Y)||1;q.p.fc=(-q.Y*0+q.X*Math.sign(q.v))/r>0?1:-1}
  /* voices */
  BK.chatT-=dt;if(BK.chatT<=0){BK.chatT=mr(9,18);bk_chat()}}
function bk_pick(f){const c=PAN.crowd.filter(a=>f(a)&&Math.hypot(a.X,a.Y)>2.6);return c.length?mpick(c):null}
function bk_chat(){const st=BK.st,r=Math.random();
  if(st==='closed'){if(r<.3&&BK.guard)stSay(L2('কে? ব্যাংক বন্ধ। রবিবার আসেন।','Who is it? The bank is closed. Come on Sunday.'),BK.guard);return}
  if(BK.kind==='bb'&&bk_isOpen()){const v=bk_pick(a=>a.cust);if(r<.5&&v)stSay(L2('তাহলে ছেঁড়া টাকা কোথায় বদলাবো, ভাই?','Then where do I change torn notes, bhai?'),v);else stSay(L2('খালাম্মা, এখানে আর নোট বদলায় না। রাস্তার ওপারে সোনালী ব্যাংকে যান।','Khalamma, notes aren\'t changed here any more. Go to Sonali Bank across the road.'),BK.guard);return}
  if(st==='post'){const t=bk_pick(a=>a.kind==='teller');if(t)stSay(mpick([L2('ক্যাশ মিলাইতে হবে… আজকে পাঁচশো টাকা কম!','Have to tally the cash… five hundred short today!'),L2('ভল্টে টাকা তুলতে হবে, তাড়াতাড়ি।','The cash has to go into the vault, hurry.')]),t);return}
  if(st==='pre'){const o=bk_pick(a=>a.kind==='officer');if(o)stSay(L2('সার্ভার চালু হইছে? দশটা বাজতে পাঁচ মিনিট।','Is the server up? Five minutes to ten.'),o);return}
  const q=bk_pick(a=>a.q!==undefined),t=bk_pick(a=>a.kind==='teller'),pn=bk_pick(a=>a.kind==='pens');
  const opts=[];
  if(q&&q.p.look.female){opts.push(()=>{const L=LINE.bank_queue_1;stSay(L2(L.bn,L.en),q);playVoice('bank_queue_1',me.x,me.y)})}
  if(q)opts.push(()=>stSay(L2('সার্ভার ডাউন নাকি, ভাই? আধা ঘণ্টা দাঁড়ায় আছি।','Is the server down, bhai? I\'ve been standing here half an hour.'),q));
  if(t)opts.push(()=>stSay(mpick([L2('পরের জন! টোকেন দেখান।','Next! Show your token.'),L2('স্লিপের পেছনে মোবাইল নম্বর লেখেন।','Write your mobile number on the back of the slip.'),L2('নোটগুলো কাউন্টারেই গুনে নেন।','Count the notes here at the counter.')]),t));
  if(pn)opts.push(()=>stSay(L2('বাবা, পেনশনের টাকাটা ঢুকছে কিনা একটু দেখবেন?','Son, could you check whether my pension has come in?'),pn));
  if(BK.guard)opts.push(()=>stSay(L2('লাইনে দাঁড়ান, লাইনে! ভিড় করবেন না।','Stand in line, in line! Don\'t crowd.'),BK.guard));
  if(opts.length)mpick(opts)()}

/* ---- drawing helpers: quads on the planes X=const, Y=const, Z=const ---- */
const bk_qx=(X,y0,y1,z0,z1)=>[[X,y0,z0],[X,y1,z0],[X,y1,z1],[X,y0,z1]];
const bk_qy=(Y,x0,x1,z0,z1)=>[[x0,Y,z0],[x1,Y,z0],[x1,Y,z1],[x0,Y,z1]];
const bk_qz=(Z,x0,x1,y0,y1)=>[[x0,y0,Z],[x1,y0,Z],[x1,y1,Z],[x0,y1,Z]];
function bk_wallT(phi){const R=BK_R,c=Math.cos(phi),s=Math.sin(phi);let t=1e9;if(c>1e-6)t=Math.min(t,R.x1/c);else if(c<-1e-6)t=Math.min(t,R.x0/c);if(s>1e-6)t=Math.min(t,R.y1/s);else if(s<-1e-6)t=Math.min(t,R.y0/s);return t}
function bk_text(c,X,Y,Z,s,m,col,w){label3(c,X,Y,Z,s,m,col,w)}
/* the room: wall band, ceiling, floor, dado, floor tiles */
function bk_shell(c){const R=BK_R,e=PAN.eye,F=PAN.F,top=[],bot=[],dad=[];
  for(let x=-8;x<=W+8;x+=6){const t=bk_wallT(PAN.yaw+(x-W/2)/F),k=F/t;top.push(PAN.hor-(R.h-e)*k);bot.push(PAN.hor+e*k);dad.push(PAN.hor-(1.15-e)*k)}
  const X=i=>-8+i*6,n=top.length;
  c.fillStyle=wash('#e9e1cc',.95);c.fillRect(0,0,W,H);
  c.fillStyle=wash('#f1ece0',.95);c.beginPath();c.moveTo(-8,-2);for(let i=0;i<n;i++)c.lineTo(X(i),top[i]);c.lineTo(W+8,-2);c.closePath();c.fill();
  c.fillStyle=wash('#b8b2a4',.75);c.beginPath();c.moveTo(-8,H+2);for(let i=0;i<n;i++)c.lineTo(X(i),bot[i]);c.lineTo(W+8,H+2);c.closePath();c.fill();
  c.fillStyle=wash('#8fa39a',.6);c.beginPath();for(let i=0;i<n;i++)c.lineTo(X(i),dad[i]);for(let i=n-1;i>=0;i--)c.lineTo(X(i),bot[i]);c.closePath();c.fill();   // the old oil-painted dado, green-grey
  c.strokeStyle=INK;c.lineWidth=1;c.globalAlpha=.55;c.beginPath();for(let i=0;i<n;i++)i?c.lineTo(X(i),top[i]):c.moveTo(X(i),top[i]);c.stroke();
  c.beginPath();for(let i=0;i<n;i++)i?c.lineTo(X(i),bot[i]):c.moveTo(X(i),bot[i]);c.stroke();c.globalAlpha=.3;c.beginPath();for(let i=0;i<n;i++)i?c.lineTo(X(i),dad[i]):c.moveTo(X(i),dad[i]);c.stroke();c.globalAlpha=1;
  /* corners */
  c.beginPath();for(const[x,y]of[[R.x0,R.y0],[R.x0,R.y1],[R.x1,R.y0],[R.x1,R.y1]])line3(c,[[x,y,0],[x,y,R.h]],1);c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=1;c.stroke();c.globalAlpha=1;
  /* floor: 60 cm mosaic tiles, drawn every second joint; ceiling beams */
  c.beginPath();for(let x=R.x0+1.2;x<R.x1;x+=1.2)line3(c,[[x,R.y0,0],[x,R.y1,0]],1.2);for(let y=R.y0+1.2;y<R.y1;y+=1.2)line3(c,[[R.x0,y,0],[R.x1,y,0]],1.2);c.strokeStyle='#8a8478';c.globalAlpha=.2;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  c.beginPath();for(const x of[-2.4,4.2,10.8])for(const d of[-.25,.25])line3(c,[[x+d,R.y0,R.h],[x+d,R.y1,R.h]],1.2);c.strokeStyle=INK;c.globalAlpha=.25;c.lineWidth=.8;c.stroke();c.globalAlpha=1}

/* outside, seen through the glass door, the two windows and the ATM booth's own door */
const BK_OPEN=[[-2.5,2.5,0,2.8],[4.4,7.6,1.1,2.7],[-7.6,-4.4,1.1,2.7],[-11.2,-9.9,0,2.3]];
function bk_outside(c){const nt=lightsOn(),qs=[];for(const o of BK_OPEN){const q=poly3(bk_qx(BK_R.x0,o[0],o[1],o[2],o[3]),.6);if(q)qs.push(q)}if(!qs.length)return;
  c.save();c.beginPath();for(const q of qs){c.moveTo(q[0][0],q[0][1]);for(const p of q)c.lineTo(p[0],p[1]);c.closePath()}c.clip();
  const sg=c.createLinearGradient(0,0,0,PAN.hor);sg.addColorStop(0,nt>.5?'#2e3850':rain>.4?'#b9bdc0':'#cfe0ea');sg.addColorStop(1,nt>.5?'#4a5068':'#efe8d8');c.fillStyle=sg;c.fillRect(0,0,W,PAN.hor);c.fillStyle=wash('#a9a296',.7);c.fillRect(0,PAN.hor,W,H-PAN.hor);
  const OX=-31;
  for(const b of BK.ob.slice().sort((a,b)=>Math.abs(b.y0+b.y1)-Math.abs(a.y0+a.y1))){const q=fill3(c,bk_qx(OX,b.y0,b.y1,0,b.h),wash(b.col,.8),INK,.45,.8,4);if(!q)continue;
    c.beginPath();for(let z=4.4;z<b.h-1;z+=3.3)line3(c,[[OX+.1,b.y0+.6,z],[OX+.1,b.y1-.6,z]],3);c.strokeStyle=INK;c.globalAlpha=.22;c.lineWidth=.7;c.stroke();c.globalAlpha=1;
    for(let y=b.y0+.5;y<b.y1-2;y+=3.1)fill3(c,bk_qx(OX+.05,y,y+2.6,.15,2.55),nt>.5&&b.lit>.4?'rgba(255,214,140,.85)':'rgba(58,56,54,.62)',INK,.4,.7,3);   // shop openings
    fill3(c,bk_qx(OX+.1,b.y0+.3,b.y1-.3,2.8,3.9),wash(b.sc,.85),INK,.5,.8,3);bk_text(c,OX+.15,(b.y0+b.y1)/2,3.35,L2(b.sign[0],b.sign[1]),.75,'#fff8e6');
    if(nt>.3){c.fillStyle=`rgba(255,214,130,${.7*nt})`;for(let z=5.2;z<b.h-1;z+=3.3)for(let y=b.y0+1;y<b.y1-1;y+=2.2)if(((y*7+z*13+b.lit*50)|0)%3===0){const p=pj(OX+.2,y,z),s=PAN.F/p[3];if(seen(p[2]))c.fillRect(p[0],p[1]-s*.9,s*1,s*.9)}}}
  fill3(c,[[OX,-70,0],[-28.5,-70,0],[-28.5,70,0],[OX,70,0]],wash('#bdb6a6',.7),null,0,1,10);
  fill3(c,[[-28.5,-70,0],[-11.5,-70,0],[-11.5,70,0],[-28.5,70,0]],wash('#6d6a66',.6),null,0,1,10);
  fill3(c,[[-11.5,-70,0],[R0x(),-70,0],[R0x(),70,0],[-11.5,70,0]],wash('#c9c1b0',.8),null,0,1,10);
  c.beginPath();for(const x of[-11.5,-28.5])line3(c,[[x,-70,0],[x,70,0]],4);c.strokeStyle=INK;c.globalAlpha=.45;c.lineWidth=1;c.stroke();c.globalAlpha=1;
  fill3(c,[[-20.6,-70,.35],[-19.4,-70,.35],[-19.4,70,.35],[-20.6,70,.35]],wash('#7c9a5a',.7),INK,.4,.8,10);   // the road divider, with grass
  ink3(c,[[-20.6,-70,.02],[-20.6,70,.02]],INK,.4,.8,6);
  for(let y=-60;y<=60;y+=24){ink3(c,[[-11.9,y,0],[-11.9,y,7.5],[-13.2,y,7.8]],'#5a534a',.8,1.4,2)}
  const items=[];for(const v of BK.traf)items.push({d:Math.hypot(v.X,v.Y),f:()=>bk_drawVeh(c,v)});for(const q of BK.peds)items.push({d:Math.hypot(q.X,q.Y),f:()=>figAt(c,q.p,q.X,q.Y)});
  items.sort((a,b)=>b.d-a.d);for(const it of items)it.f();
  if(nt>.05){c.fillStyle=`rgba(40,48,80,${.45*nt})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';for(let y=-60;y<=60;y+=24){const q=pj(-13.2,y,7.6);if(!seen(q[2]))continue;const r=Math.min(140,4*PAN.F/q[3]),g=c.createRadialGradient(q[0],q[1],0,q[0],q[1],r);g.addColorStop(0,`rgba(255,226,170,${.4*nt})`);g.addColorStop(1,'rgba(255,226,170,0)');c.fillStyle=g;c.fillRect(q[0]-r,q[1]-r,2*r,2*r)}c.globalCompositeOperation='source-over'}
  /* the rolling shutter, half down when the hall is shut */
  if(BK.st!=='open'&&BK.st!=='lunch'){const z0=BK.st==='closed'&&(HOUR>21||HOUR<6)?.75:1.25,q=fill3(c,bk_qx(-8.15,-2.7,2.7,z0,2.85),wash('#8d9094',.85),INK,.7,1,.6);
    if(q){c.beginPath();for(let z=z0+.12;z<2.85;z+=.12)line3(c,[[-8.14,-2.7,z],[-8.14,2.7,z]],.6);c.strokeStyle=INK;c.globalAlpha=.3;c.lineWidth=.7;c.stroke();c.globalAlpha=1;fill3(c,bk_qx(-8.14,-.25,.25,z0,z0+.08),'#3a3836',null)}}
  c.restore();
  /* glass, frames and grilles */
  for(const o of BK_OPEN){const pts=bk_qx(BK_R.x0+.02,o[0],o[1],o[2],o[3]);fill3(c,pts,'rgba(200,222,226,.18)',INK,.75,1.4,.6)}
  c.beginPath();line3(c,[[-7.97,0,0],[-7.97,0,2.8]],1);for(const y of[-.35,.35])line3(c,[[-7.96,y,.9],[-7.96,y,1.3]],1);c.strokeStyle='#5a5652';c.lineWidth=2;c.globalAlpha=.85;c.stroke();c.globalAlpha=1;
  c.beginPath();for(const[y0,y1]of[[4.4,7.6],[-7.6,-4.4]])for(let y=y0+.25;y<y1;y+=.25)line3(c,[[-7.97,y,1.1],[-7.97,y,2.7]],.5);c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=.8;c.stroke();c.globalAlpha=1;   // window grilles
  bk_text(c,-7.95,-1.25,1.55,L2('টানুন','PULL'),.13,'#b8432f');bk_text(c,-7.95,1.25,1.55,L2('টানুন','PULL'),.13,'#b8432f');
  fill3(c,bk_qx(-7.96,-1.6,1.6,2.95,3.45),wash(BK.cfg.acc,.85),INK,.6,1,.5);bk_text(c,-7.95,0,3.2,L2('প্রবেশ ও প্রস্থান','Entrance · Exit'),.2,'#fff8e6')}
const R0x=()=>BK_R.x0-.05;
function bk_drawVeh(c,v){const g=pj(v.X,v.Y,0);if(!seen(g[2]))return;const s=PAN.F/g[3],x=g[0],y=g[1],sx=Math.sign(pj(v.X,v.Y+1,0)[0]-x)*Math.sign(v.v)||1;
  c.lineWidth=Math.max(.8,s*.06);c.strokeStyle=INK;
  if(v.k==='bus'){const q=fill3(c,bk_qx(v.X,v.Y-5.5,v.Y+5.5,.45,3.2),wash(v.col,.75),INK,.7,1,1.2);if(q){c.beginPath();for(let yy=v.Y-4.8;yy<v.Y+4.6;yy+=1.6){const a=pj(v.X+.01,yy,1.8),b=pj(v.X+.01,yy+1.1,2.75);c.rect(Math.min(a[0],b[0]),b[1],Math.abs(b[0]-a[0]),a[1]-b[1])}c.fillStyle='rgba(40,45,50,.55)';c.fill();
    c.fillStyle='#2a2826';for(const d of[-3.8,3.6]){const w=pj(v.X+.02,v.Y+d,.45);c.beginPath();c.arc(w[0],w[1],.45*s,0,TAU);c.fill()}}return}
  if(v.k==='car'){const q=fill3(c,bk_qx(v.X,v.Y-2.2,v.Y+2.2,.3,1.0),wash(v.col,.8),INK,.7,1,1);if(q){fill3(c,bk_qx(v.X,v.Y-1.3,v.Y+1.2,1.0,1.45),'rgba(60,68,76,.6)',INK,.6,.8,1);c.fillStyle='#2a2826';for(const d of[-1.4,1.4]){const w=pj(v.X+.02,v.Y+d,.32);c.beginPath();c.arc(w[0],w[1],.32*s,0,TAU);c.fill()}}return}
  const X=k=>x+sx*k*s;
  if(v.k==='rk'){c.beginPath();c.arc(X(-.6),y-.34*s,.34*s,0,TAU);c.arc(X(.75),y-.3*s,.3*s,0,TAU);c.globalAlpha=.8;c.stroke();c.globalAlpha=1;c.fillStyle=wash('#b8432f',.75);c.fillRect(Math.min(X(-.85),X(-.05)),y-.95*s,.8*s,.35*s);
    c.fillStyle=wash(v.col,.8);c.beginPath();c.moveTo(X(-.95),y-.9*s);c.quadraticCurveTo(X(-1.05),y-2.05*s,X(-.1),y-1.95*s);c.lineTo(X(-.25),y-.95*s);c.closePath();c.fill();c.globalAlpha=.7;c.stroke();c.globalAlpha=1;
    c.beginPath();c.moveTo(X(.75),y-.3*s);c.lineTo(X(.45),y-1.1*s);c.lineTo(X(-.2),y-.95*s);c.stroke()}
  else{c.beginPath();c.arc(X(-.7),y-.24*s,.24*s,0,TAU);c.arc(X(.95),y-.22*s,.22*s,0,TAU);c.fillStyle='#2a2826';c.fill();c.fillStyle=wash('#3d8b4a',.8);c.beginPath();c.moveTo(X(-1.3),y-.3*s);c.lineTo(X(-1.3),y-1.6*s);c.quadraticCurveTo(X(-.2),y-1.85*s,X(.9),y-1.55*s);c.lineTo(X(1.25),y-.75*s);c.lineTo(X(1.2),y-.3*s);c.closePath();c.fill();c.globalAlpha=.7;c.stroke();
    c.beginPath();for(let k=-1.1;k<.6;k+=.18){c.moveTo(X(k),y-.95*s);c.lineTo(X(k),y-1.5*s)}c.strokeStyle='#1d4a26';c.globalAlpha=.6;c.stroke();c.globalAlpha=1}}

/* things fixed to the walls */
function bk_paper(c,X0,X1,Z0,Z1,Y,seed){const R=mulberry32(seed);for(let i=0;i<7;i++){const w=.28+R()*.25,h=.3+R()*.15,x=X0+.08+R()*(X1-X0-w-.16),z=Z0+.08+R()*(Z1-Z0-h-.16);fill3(c,bk_qy(Y,x,x+w,z,z+h),wash(['#fbf8ee','#f3ecd2','#e8f0f3','#fff3c4'][i%4],.95),INK,.35,.6,.5)}}
function bk_clock(c,X,Y,Z){const q=pj(X,Y,Z);if(!seen(q[2]))return;const r=.32*PAN.F/q[3];
  c.fillStyle='#fbf8ee';c.beginPath();c.arc(q[0],q[1],r,0,TAU);c.fill();c.strokeStyle=INK;c.lineWidth=Math.max(1,r*.09);c.globalAlpha=.8;c.stroke();c.globalAlpha=1;
  c.beginPath();for(let k=0;k<12;k++){const a=k/12*TAU;c.moveTo(q[0]+Math.sin(a)*r*.78,q[1]-Math.cos(a)*r*.78);c.lineTo(q[0]+Math.sin(a)*r*.9,q[1]-Math.cos(a)*r*.9)}c.lineWidth=1;c.stroke();
  const hA=(HOUR%12)/12*TAU,mA=(HOUR%1)*TAU;c.lineWidth=Math.max(1.4,r*.09);c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]+Math.sin(hA)*r*.5,q[1]-Math.cos(hA)*r*.5);c.stroke();
  c.lineWidth=Math.max(1,r*.05);c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]+Math.sin(mA)*r*.78,q[1]-Math.cos(mA)*r*.78);c.stroke()}
function bk_walls(c){const acc=BK.cfg.acc;
  /* left wall (-Y): beware-of-touts sign over the writing table, the notice board, the rates board */
  fill3(c,bk_qy(-11.97,-4.4,-1.2,2.05,2.45),wash('#b8432f',.85),INK,.6,.8,.5);bk_text(c,-2.8,-11.95,2.25,L2('দালাল হইতে সাবধান','Beware of touts'),.2,'#fff8e6');
  fill3(c,bk_qy(-11.97,.2,2.9,1.3,2.55),wash('#8a6a42',.8),INK,.7,1,.5);fill3(c,bk_qy(-11.96,.3,2.8,1.4,2.45),wash('#5f7a5a',.75),null);bk_paper(c,.3,2.8,1.4,2.3,-11.95,7);bk_text(c,1.55,-11.94,2.5,L2('নোটিশ বোর্ড','Notice board'),.14,'#fff8e6');
  fill3(c,bk_qy(-11.97,3.4,5.9,1.3,2.55),wash('#f3ecd2',.95),INK,.7,1,.5);bk_text(c,4.65,-11.95,2.4,L2('সুদ ও মুনাফার হার','Interest & profit rates'),.15,'#2f2d2a');
  c.beginPath();for(let z=1.5;z<2.25;z+=.1)line3(c,[[3.6,-11.95,z],[5.7,-11.95,z]],.5);c.strokeStyle=INK;c.globalAlpha=.3;c.lineWidth=.7;c.stroke();c.globalAlpha=1;
  /* right wall (+Y): enquiry sign, clock, count-your-cash, water filter */
  fill3(c,bk_qy(11.97,-5.4,-2.4,2.2,2.65),wash(acc,.85),INK,.6,.8,.5);bk_text(c,-3.9,11.95,2.42,L2('অনুসন্ধান','Enquiry'),.24,'#fff8e6');
  bk_clock(c,1.8,11.95,3.25);
  fill3(c,bk_qy(11.97,.4,3.2,1.75,2.35),wash('#fff3c4',.95),INK,.6,.8,.5);bk_text(c,1.8,11.95,2.12,L2('টাকা কাউন্টারেই গুনে নিন','Count your cash at the counter'),.14,'#2f2d2a');bk_text(c,1.8,11.95,1.92,L2('পরে কোনো অভিযোগ গ্রহণযোগ্য নয়','No complaints afterwards'),.11,'#b8432f');
  fill3(c,bk_qx(-7.97,8.6,10.4,2.1,2.5),'#fbf8ee',INK,.6,.8,.5);bk_text(c,-7.95,9.5,2.3,L2('ধূমপান নিষেধ','No smoking'),.13,'#b8432f');
  /* entrance wall: complaint box, CCTV notice */
  fill3(c,bk_qx(-7.97,9.2,9.8,1.25,1.75),wash('#b8432f',.85),INK,.7,1,.4);bk_text(c,-7.95,9.5,1.88,L2('অভিযোগ বাক্স','Complaints'),.11,'#2f2d2a');
  fill3(c,bk_qx(-7.97,-3.9,-2.9,2.4,2.75),'#fbf8ee',INK,.6,.8,.4);bk_text(c,-7.95,-3.4,2.57,L2('সিসি ক্যামেরা চালু','CCTV in use'),.09,'#2f2d2a');
  /* back wall behind the counter: the strong-room grille and a big wall clock seen over the partition */
  fill3(c,bk_qx(14.97,-3.2,-1.2,0,2.3),wash('#6b6f72',.8),INK,.7,1,.4);c.beginPath();for(let y=-3.1;y<-1.2;y+=.16)line3(c,[[14.95,y,0],[14.95,y,2.3]],.5);c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
  bk_text(c,14.94,-2.2,2.5,L2('ভল্ট','Vault'),.18,'#2f2d2a')}

/* the ceiling: tube lights and fans */
function bk_ceiling(c){const h=BK_R.h,on=BK.st!=='closed',nt=lightsOn();
  for(const X of[-3.2,1.2,5.2,9.2,13])for(const Y of[-10,-5.4,-.4,4.6,9.6]){const lit=on||(nt>.3&&((X===1.2&&Y===-.4)||(X===9.2&&Y===4.6)));
    fill3(c,bk_qz(h-.04,X-.62,X+.62,Y-.07,Y+.07),lit?'#fffdf2':wash('#d8d4c8',.9),INK,.55,.8,2)}
  for(const X of[-5,-.6,3.6,10.9])for(const Y of(X>9?[-7.5,-1.5,4.5]:[-8,-3,2.4,7.5])){const hub=h-.55;const top=pj(X,Y,h),hq=pj(X,Y,hub);if(!seen(hq[2]))continue;
    c.strokeStyle=INK;c.globalAlpha=.75;c.lineWidth=1.2;c.beginPath();c.moveTo(top[0],top[1]);c.lineTo(hq[0],hq[1]);c.stroke();c.globalAlpha=1;
    for(let k=0;k<3;k++){const a=BK.fan+k*TAU/3+X*.7+Y,ca=Math.cos(a),sa=Math.sin(a),px=-sa*.07,py=ca*.07;
      fill3(c,[[X+ca*.14+px,Y+sa*.14+py,hub],[X+ca*.72+px,Y+sa*.72+py,hub],[X+ca*.72-px,Y+sa*.72-py,hub],[X+ca*.14-px,Y+sa*.14-py,hub]],wash('#8a8f88',.8),INK,.5,.7,5)}
    const r=.13*PAN.F/hq[3];c.fillStyle=wash('#6b6f6a',.9);c.beginPath();c.ellipse(hq[0],hq[1],r,r*.5,0,0,TAU);c.fill()}}

/* behind the counter: almirahs, file racks, the manager's glass cabin, desks and the people at them */
function bk_desk(c,d){const X=d.X,Y=d.Y;fill3(c,bk_qz(.76,X-.4,X+.4,Y-.75,Y+.75),wash('#a0784e',.85),INK,.5,.8,1);fill3(c,bk_qx(X-.4,Y-.75,Y+.75,0,.76),wash('#7a5536',.85),INK,.6,.8,1);
  fill3(c,bk_qx(X-.02,Y-.28,Y+.22,.8,1.18),'#2c2e30',INK,.5,.8,1);fill3(c,bk_qx(X-.03,Y-.05,Y,.76,.8),'#2c2e30',null);   // the back of a monitor
  const R=mulberry32((X*100+Y*10)|0);for(let k=0;k<2;k++){const y0=Y+.3+k*.2,hh=.06+R()*.16;fill3(c,bk_qx(X-.36,y0,y0+.17,.76,.76+hh),wash(['#b8432f','#c9a24a','#7fa36b'][(R()*3)|0],.85),INK,.5,.6,1)}}
function bk_back(c){const items=[],acc=BK.cfg.acc;
  for(let i=0;i<6;i++){const y0=-11.6+i*1.1;items.push({d:Math.hypot(14.6,y0+.5),f:()=>{fill3(c,bk_qx(14.6,y0,y0+1.02,0,2.05),wash('#9aa3a8',.8),INK,.65,1,.6);ink3(c,[[14.58,y0+.51,.1],[14.58,y0+.51,1.95]],INK,.5,.8);ink3(c,[[14.57,y0+.45,1.05],[14.57,y0+.57,1.05]],INK,.8,1.6)}})}   // steel almirahs
  items.push({d:Math.hypot(14.4,3.5),f:()=>{fill3(c,bk_qx(14.4,-.5,7.6,0,2.3),wash('#7a7f80',.6),INK,.6,1,.6);for(let z=.35;z<2.3;z+=.55){ink3(c,[[14.38,-.5,z],[14.38,7.6,z]],INK,.6,1.2,1);const R=mulberry32(z*99|0);for(let y=-.4;y<7.4;y+=.28+R()*.2)fill3(c,bk_qx(14.37,y,y+.22,z,z+.32+R()*.12),wash(R()<.6?'#b8432f':'#e8dfc4',.75),null)}}});   // open racks of red-cloth file bundles
  items.push({d:Math.hypot(11.6,9),f:()=>{fill3(c,bk_qy(8.2,11.6,15,0,2.6),'rgba(190,212,214,.3)',INK,.6,1,.6);fill3(c,bk_qx(11.6,8.2,12,0,2.6),'rgba(190,212,214,.3)',INK,.6,1,.6);fill3(c,bk_qx(11.6,8.2,12,0,.9),wash('#7a5536',.8),INK,.5,.8,.6);
    bk_text(c,11.58,10.1,2.35,L2(...BK.cfg.mgr),.17,'#2f2d2a');ink3(c,[[11.58,9.9,0],[11.58,9.9,2.6]],INK,.6,1.2,.6)}});
  for(const d of BK.desks)items.push({d:Math.hypot(d.X-.4,d.Y),f:()=>bk_desk(c,d)});
  for(const a of PAN.crowd)if(a.X>BK_CX+.2)items.push({d:Math.hypot(a.X,a.Y),f:()=>figAt(c,a.p,a.X,a.Y)});
  items.sort((a,b)=>b.d-a.d);for(const it of items)it.f()}

/* the counter: wood front, top, glass partition with grille windows and numbered signs; the fascia and the token display above */
function bk_counter(c){const acc=BK.cfg.acc,bb=BK.kind==='bb';
  for(let i=0;i<BK_NW;i++){const y=bk_winY(i),y0=y-1.3,y1=y+1.3,open=bk_winOpen(i);
    fill3(c,bk_qx(BK_CX,y0,y1,0,1.05),wash('#9a6a42',.8),INK,.55,.9,.6);ink3(c,[[BK_CX-.01,y0,.12],[BK_CX-.01,y1,.12]],INK,.35,.8,.6);
    fill3(c,[[BK_CX-.05,y0,1.05],[BK_CX+.6,y0,1.05],[BK_CX+.6,y1,1.05],[BK_CX-.05,y1,1.05]],wash('#cdbb9c',.9),INK,.5,.8,.6);
    fill3(c,bk_qx(BK_CX+.3,y0,y1,1.05,2.36),'rgba(188,214,220,.22)',INK,.3,.8,.6);
    const g=fill3(c,bk_qx(BK_CX+.29,y-.36,y+.36,1.07,1.42),'rgba(70,74,76,.45)',INK,.6,.9,.3);if(g){c.beginPath();for(let k=-.3;k<=.31;k+=.1)line3(c,[[BK_CX+.28,y+k,1.07],[BK_CX+.28,y+k,1.42]],.4);c.strokeStyle=INK;c.globalAlpha=.55;c.lineWidth=.8;c.stroke();c.globalAlpha=1}
    fill3(c,bk_qx(BK_CX+.28,y-.12,y+.12,1.55,1.79),'rgba(60,64,66,.35)',null);   // the speaking grille
    fill3(c,bk_qx(BK_CX+.27,y0+.05,y1-.05,2.4,2.86),wash(acc,.82),INK,.6,.9,.6);
    bk_text(c,BK_CX+.26,y,2.63,`${bk_n(i+1)} · ${L2(...BK.cfg.win[i])}`,.19,'#fff8e6');
    if(!open&&(BK.st!=='closed'||bb)){fill3(c,bk_qx(BK_CX+.27,y-.45,y+.45,1.55,1.9),'#fbf8ee',INK,.6,.8,.5);
      bk_text(c,BK_CX+.26,y,1.72,bb?L2('সেবা বন্ধ','Service closed'):BK.st==='lunch'&&BK_LUNCH.includes(i)?L2('বিরতি','Break'):L2('বন্ধ','Closed'),.12,'#b8432f')}
    ink3(c,[[BK_CX+.3,y0,1.05],[BK_CX+.3,y0,2.88]],'#5a5652',.85,2.2,.6)}
  const yE=bk_winY(BK_NW-1)+1.3;fill3(c,[[BK_CX,yE,0],[BK_CX+.6,yE,0],[BK_CX+.6,yE,1.05],[BK_CX,yE,1.05]],wash('#8a5e3a',.8),INK,.6,.9,.6);
  ink3(c,[[BK_CX+.3,-11.4,2.36],[BK_CX+.3,yE,2.36]],'#5a5652',.85,2,.6);
  fill3(c,bk_qx(BK_CX+.25,yE+.6,11.95,1.9,2.25),'#fbf8ee',INK,.5,.8,.5);bk_text(c,BK_CX+.24,yE+1.6,2.07,L2('শুধু কর্মকর্তাদের জন্য','Staff only'),.11,'#b8432f');
  /* the fascia with the bank's name, hung over the counter */
  const fq=fill3(c,bk_qx(BK_CX+.2,-7.2,7.2,3.55,4.25),wash(acc,.9),INK,.7,1.2,.6);if(fq)bk_text(c,BK_CX+.18,0,3.9,L2(...BK.cfg.fascia),.3,'#fff8e6');
  /* the token display */
  ink3(c,[[BK_CX+.2,-1,3.48],[BK_CX+.2,-1,3.55]],INK,.7,1);ink3(c,[[BK_CX+.2,1,3.48],[BK_CX+.2,1,3.55]],INK,.7,1);
  if(fill3(c,bk_qx(BK_CX+.18,-1.35,1.35,2.95,3.48),'#1f1d1b',INK,.9,1.2,.5)){const live=bk_isOpen()&&!bb;
    bk_text(c,BK_CX+.16,0,3.22,live?L2(`টোকেন ${bk_tokS(BK.tk.now)} → কাউন্টার ${bk_n(BK.tk.win+1)}`,`Token ${bk_tokS(BK.tk.now)} → Counter ${BK.tk.win+1}`):'— — —',.2,live?'#ff5a3a':'#7a3a2a','700')}}

/* the hall: people, benches, columns, token machine, writing table, enquiry desk, ATM booth, guard */
function bk_bench(c,X,y0,y1){const pts=bk_qz(.45,X-.24,X+.24,y0,y1);fill3(c,pts,wash('#a9b0b4',.85),INK,.6,.8,.6);
  c.beginPath();for(const y of[y0+.1,y1-.1])for(const dx of[-.2,.2])line3(c,[[X+dx,y,0],[X+dx,y,.45]],1);c.strokeStyle='#5a5652';c.lineWidth=1.4;c.globalAlpha=.8;c.stroke();c.globalAlpha=1;
  c.beginPath();for(let y=y0+.15;y<y1;y+=.15)line3(c,[[X-.2,y,.451],[X+.2,y,.451]],1);c.strokeStyle=INK;c.globalAlpha=.2;c.lineWidth=.6;c.stroke();c.globalAlpha=1}   // perforated steel seats
function bk_benchBack(c,X,y0,y1){fill3(c,bk_qx(X-.28,y0,y1,.55,.9),wash('#a9b0b4',.85),INK,.6,.8,.6)}
function bk_gun(c,a){const p=a.p,q=pj(a.X,a.Y,0);if(!seen(q[2])||q[3]<2.6)return;const s=PAN.F/q[3],Hh=p.look.h*1.12,fc=p.fc||1,up=p.pose==='sit'?-.2:0,P=(u,v)=>[q[0]+u*fc*s,q[1]-(v+up)*Hh*s];
  const b=P(.13,.42),m=P(.04,.62),t=P(-.1,1.06);c.lineCap='round';c.strokeStyle='#6b4a2a';c.lineWidth=Math.max(1.5,.07*s);c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(m[0],m[1]);c.stroke();
  c.strokeStyle='#2a2826';c.lineWidth=Math.max(1,.035*s);c.beginPath();c.moveTo(m[0],m[1]);c.lineTo(t[0],t[1]);c.stroke();
  const s1=P(-.14,.8),s2=P(.13,.5);c.strokeStyle='#3a3226';c.lineWidth=Math.max(.8,.02*s);c.beginPath();c.moveTo(s1[0],s1[1]);c.lineTo(s2[0],s2[1]);c.stroke()}   // a pump shotgun slung on the shoulder
function bk_hall(c){const items=[],bb=BK.kind==='bb';
  for(const[X,Y]of[[-3.4,-6.6],[3,-6.6],[-3.4,6.6],[3,6.6]])items.push({d:Math.hypot(X,Y),f:()=>{const b=pj(X,Y,0);if(!seen(b[2]))return;const tt=pj(X,Y,BK_R.h),w=.6*PAN.F/b[3];c.lineCap='butt';c.strokeStyle=wash('#e4dccb',.95);c.lineWidth=w;c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(tt[0],tt[1]);c.stroke();
    const dd=pj(X,Y,1.15);c.strokeStyle=wash('#8fa39a',.6);c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(dd[0],dd[1]);c.stroke();c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=1;c.beginPath();c.moveTo(b[0]-w/2,b[1]);c.lineTo(tt[0]-w/2,tt[1]);c.moveTo(b[0]+w/2,b[1]);c.lineTo(tt[0]+w/2,tt[1]);c.stroke();c.globalAlpha=1;c.lineCap='round'}});
  for(const X of[-1.8,.6])for(const y0 of[3.4,6.5]){const y1=y0+2.5,sit=PAN.crowd.filter(a=>a.seat&&a.seat.X===X&&a.seat.Y>y0&&a.seat.Y<y1&&a.sitting);
    items.push({d:Math.hypot(X,y0+1.25)+.4,f:()=>{const backNear=X-.28>0;if(!backNear)bk_benchBack(c,X,y0,y1);bk_bench(c,X,y0,y1);for(const a of sit.sort((a,b)=>Math.hypot(b.X,b.Y)-Math.hypot(a.X,a.Y)))figAt(c,a.p,a.X,a.Y);if(backNear)bk_benchBack(c,X,y0,y1)}})}
  items.push({d:Math.hypot(-4.7,-3.3),f:()=>{const X=-4.7,Y=-3.3;fill3(c,bk_qx(X+.25,Y-.3,Y+.3,0,1.45),wash(bb?'#a9a49a':'#e8e2d2',.9),INK,.7,1,.4);fill3(c,bk_qy(Y+.3,X-.25,X+.25,0,1.45),wash('#cfc8b6',.9),INK,.6,.8,.4);
    fill3(c,bk_qx(X+.26,Y-.2,Y+.2,1.0,1.3),bb?'#3a3836':'#2f5f8a',INK,.6,.8,.3);fill3(c,bk_qx(X+.26,Y-.08,Y+.08,.78,.84),'#2a2826',null);
    bk_text(c,X+.27,Y,1.58,bb?L2('বন্ধ','Off'):L2('টোকেন নিন','Take a token'),.12,'#b8432f')}});
  items.push({d:Math.hypot(-2.9,-11.4),f:()=>{fill3(c,bk_qz(.9,-4.6,-1.2,-12,-11.35),wash('#a0784e',.85),INK,.6,.8,.6);fill3(c,bk_qy(-11.35,-4.6,-1.2,.75,.9),wash('#7a5536',.85),INK,.6,.8,.6);
    c.beginPath();for(const x of[-4.5,-1.3])line3(c,[[x,-11.4,0],[x,-11.4,.75]],1);c.strokeStyle=INK;c.lineWidth=1.4;c.globalAlpha=.7;c.stroke();c.globalAlpha=1;
    fill3(c,bk_qy(-11.95,-3.3,-2.4,.9,1.35),wash('#c9cfd2',.9),INK,.6,.8,.4);bk_text(c,-2.85,-11.9,1.45,L2('জমা স্লিপ','Deposit slips'),.09,'#2f2d2a');
    for(const x of[-4,-3,-1.8])ink3(c,[[x,-11.9,.91],[x+.1,-11.6,.92]],'#3a3836',.7,1.2,.3)}});   // pens on strings
  for(const a of PAN.crowd)if(a.slot&&a.p.pose!=='walk')items.push({d:Math.hypot(a.X,a.Y),f:()=>figAt(c,a.p,a.X,a.Y)});
  items.push({d:Math.hypot(-3.9,10.2),f:()=>{const e=PAN.crowd.find(a=>a.enq);if(e)figAt(c,e.p,e.X,e.Y);fill3(c,bk_qz(.85,-5.3,-2.5,10.2,10.9),wash('#a0784e',.85),INK,.6,.8,.6);fill3(c,bk_qy(10.2,-5.3,-2.5,0,.85),wash('#7a5536',.85),INK,.6,.9,.6);
    fill3(c,bk_qy(10.19,-4.4,-3.4,.45,.7),'#fbf8ee',INK,.5,.7,.5);bk_text(c,-3.9,10.18,.58,L2('তথ্য','Help desk'),.1,'#2f2d2a')}});
  items.push({d:Math.hypot(-7.2,11.3),f:()=>{fill3(c,bk_qy(10.9,-7.6,-6.8,0,.8),wash('#8a8f88',.85),INK,.6,.8,.4);const q=pj(-7.2,11.2,1.1);if(seen(q[2])){const r=.2*PAN.F/q[3];c.fillStyle='rgba(120,170,210,.75)';c.fillRect(q[0]-r,q[1]-r*1.5,r*2,r*2.4);c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=1;c.strokeRect(q[0]-r,q[1]-r*1.5,r*2,r*2.4);c.globalAlpha=1}}});   // the water filter
  /* the ATM booth in the front corner: machine, whoever is using it, then the glass */
  items.push({d:Math.hypot(-5.6,-9.4),f:()=>{const X0=-8,X1=-5.6,Y0=-12,Y1=-9.4;fill3(c,bk_qy(-11.4,-7.25,-6.45,0,1.75),wash('#d8dcdf',.9),INK,.7,1,.4);fill3(c,bk_qy(-11.39,-7.05,-6.65,1.15,1.5),'#2f5f8a',INK,.6,.8,.3);fill3(c,bk_qz(.95,-7.2,-6.5,-11.4,-11.15),wash('#9aa3a8',.9),INK,.6,.8,.3);
    for(const a of PAN.crowd)if(a.inBooth)figAt(c,a.p,a.X,a.Y);
    fill3(c,bk_qx(X1,Y0,Y1,0,2.5),'rgba(196,220,226,.28)',INK,.7,1.2,.5);fill3(c,bk_qy(Y1,X0,X1,0,2.5),'rgba(196,220,226,.28)',INK,.7,1.2,.5);
    fill3(c,bk_qx(X1-.01,Y0,Y1,2.12,2.5),wash(BK.cfg.acc,.88),INK,.7,1,.5);fill3(c,bk_qy(Y1+.01,X0,X1,2.12,2.5),wash(BK.cfg.acc,.88),INK,.7,1,.5);
    bk_text(c,X1-.02,(Y0+Y1)/2,2.31,L2('এটিএম বুথ · ২৪ ঘণ্টা','ATM booth · 24 hours'),.12,'#fff8e6');bk_text(c,(X0+X1)/2,Y1+.02,2.31,'ATM',.17,'#fff8e6')}});
  if(bb)items.push({d:Math.hypot(4.6,-3.4),f:()=>{const X=4.6,Y=-3.4;c.beginPath();line3(c,[[X,Y-.9,0],[X,Y-.9,1.75]],1);line3(c,[[X,Y+.9,0],[X,Y+.9,1.75]],1);c.strokeStyle='#5a5652';c.lineWidth=2;c.stroke();
    if(fill3(c,bk_qx(X-.02,Y-1.05,Y+1.05,.75,1.8),'#fbf8ee',INK,.75,1,.4)){bk_text(c,X-.03,Y,1.68,L2('বিজ্ঞপ্তি','NOTICE'),.12,'#b8432f','700');
      bk_text(c,X-.03,Y,1.48,L2('২৩ নভেম্বর ২০২৫ থেকে','From 23 November 2025'),.075,'#2f2d2a');bk_text(c,X-.03,Y,1.34,L2('বাংলাদেশ ব্যাংকের কাউন্টারে','direct counter service at'),.075,'#2f2d2a');
      bk_text(c,X-.03,Y,1.2,L2('সরাসরি গ্রাহকসেবা বন্ধ।','Bangladesh Bank has stopped.'),.075,'#2f2d2a');bk_text(c,X-.03,Y,1.02,L2('নোট বদল, প্রাইজবন্ড, সঞ্চয়পত্র:','Torn notes, prize bonds, savings'),.07,'#2f2d2a');bk_text(c,X-.03,Y,.9,L2('বাণিজ্যিক ব্যাংকের শাখায়','certificates: at commercial banks'),.07,'#2f2d2a')}}});   // the notice on a stand
  for(const a of PAN.crowd){if(a.X>BK_CX+.2||a.inBooth||a.enq||(a.seat&&a.sitting)||(a.slot&&a.p.pose!=='walk'))continue;
    items.push({d:Math.hypot(a.X,a.Y),f:a.kind==='guard'?()=>{if(a.sitting){const q=pj(a.X,a.Y,.42);if(seen(q[2])){const w=.4*PAN.F/q[3];c.fillStyle=wash('#7a5536',.85);c.fillRect(q[0]-w/2,q[1],w,.42*PAN.F/q[3])}}figAt(c,a.p,a.X,a.Y);bk_gun(c,a)}:()=>figAt(c,a.p,a.X,a.Y)})}
  items.sort((a,b)=>b.d-a.d);for(const it of items)it.f()}

/* light: dim when shut, lamps glowing at night */
function bk_light(c){const nt=lightsOn(),on=BK.st!=='closed',dark=on?nt*.18:.3+.32*nt;if(dark<.03)return;
  c.globalCompositeOperation='multiply';c.fillStyle=`rgba(70,78,108,${dark})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';
  const lamps=on?[[1.2,-5.4],[1.2,4.6],[-3.2,-.4],[5.2,-.4],[9.2,-5.4],[9.2,4.6]]:nt>.3?[[1.2,-.4],[9.2,4.6]]:[];
  for(const[X,Y]of lamps){const q=pj(X,Y,BK_R.h-.1);if(!seen(q[2]))continue;const r=Math.min(200,3.2*PAN.F/q[3]),g=c.createRadialGradient(q[0],q[1],0,q[0],q[1],r);g.addColorStop(0,`rgba(240,248,255,${.25*Math.max(dark,.3)})`);g.addColorStop(1,'rgba(240,248,255,0)');c.fillStyle=g;c.fillRect(q[0]-r,q[1]-r,2*r,2*r)}
  c.globalCompositeOperation='source-over'}
function bk_draw(c){bk_shell(c);bk_outside(c);bk_walls(c);bk_ceiling(c);bk_back(c);bk_counter(c);bk_hall(c);bk_light(c)}

/* ---- the panel ---- */
function bk_sub(){const st=BK.st,t=hhmm(HOUR),bb=BK.kind==='bb';
  if(st==='closed')return FRIDAY?L2(`এখন ${t}। আজ সাপ্তাহিক ছুটি (শুক্র-শনি) — ব্যাংক বন্ধ। শুধু এটিএম বুথ খোলা।`,`It's ${t}. Weekend (Friday-Saturday): the bank is closed. Only the ATM booth is open.`):L2(`এখন ${t}। ব্যাংক বন্ধ — রবি থেকে বৃহস্পতি, সকাল ১০টা থেকে লেনদেন। শুধু এটিএম বুথ খোলা।`,`It's ${t}. The bank is closed; it opens Sunday to Thursday at 10:00. Only the ATM booth is open.`);
  if(st==='pre')return L2(`এখন ${t}। কর্মকর্তারা আসছেন; লেনদেন শুরু সকাল ১০টায়।`,`It's ${t}. The staff are coming in; the counters open at 10:00.`);
  if(st==='post')return L2(`এখন ${t}। লেনদেন শেষ (বিকেল ৩টা); অফিস চলবে ৫টা পর্যন্ত। এটিএম খোলা।`,`It's ${t}. Counters closed at 15:00; the office works till 17:00. The ATM is open.`);
  if(bb)return L2(`এখন ${t}। ২৩ নভেম্বর ২০২৫ থেকে বাংলাদেশ ব্যাংকের কাউন্টারে সরাসরি সেবা বন্ধ — নোট বদল, প্রাইজবন্ড, সঞ্চয়পত্র এখন বাণিজ্যিক ব্যাংকে।`,`It's ${t}. Since 23 November 2025 Bangladesh Bank serves no one at its counters: torn notes, prize bonds and savings certificates are now at commercial banks.`);
  const my=BK.my&&!BK.my.called?L2(`, আপনার টোকেন ${bk_tokS(BK.my.n)}`,`, your token ${bk_tokS(BK.my.n)}`):'';
  return L2(`এখন ${t}। লেনদেন সকাল ১০টা–বিকেল ৩টা${st==='lunch'?' (এখন মধ্যাহ্ন বিরতি, কিছু কাউন্টার বন্ধ)':''}। ডাকা হচ্ছে টোকেন ${bk_tokS(BK.tk.now)}${my}।`,`It's ${t}. Counters open 10:00-15:00${st==='lunch'?' (lunch break: some counters shut)':''}. Now serving token ${bk_tokS(BK.tk.now)}${my}.`)}
const BK_ACTS=[
 ['token',()=>L2('টোকেন নিন','Take a token'),0],
 ['ask',()=>L2('অনুসন্ধানে জিজ্ঞেস করুন','Ask at the enquiry desk'),0],
 ['atm',()=>L2('এটিএম থেকে ৳৫০০ তুলুন','Withdraw ৳500 at the ATM'),0],
 ['bench',()=>L2('বেঞ্চে একটু বসুন','Sit on a bench a while'),0],
];
function bk_act(k){const st=BK.st,open=bk_isOpen(),bb=BK.kind==='bb',g=BK.guard;
  if(k==='token'){lookAt(-4.7,-3.3);
    if(bb){stSay(L2('টোকেন মেশিন বন্ধ। এখানে আর কাউন্টারে সেবা হয় না।','The token machine is off. There is no counter service here any more.'),g);return}
    if(!open){stSay(st==='closed'?L2('ব্যাংক বন্ধ, টোকেন মেশিনও বন্ধ।','The bank is closed, and so is the token machine.'):L2('লেনদেনের সময় শেষ, আর টোকেন দেওয়া হবে না।','Banking hours are over: no more tokens today.'),g);return}
    if(BK.my&&!BK.my.called){stSay(L2(`আপনার টোকেন ${bk_tokS(BK.my.n)}। আগে আছে ${bk_n(Math.max(0,BK.my.n-BK.tk.now-1))} জন।`,`Your token is ${bk_tokS(BK.my.n)}. ${Math.max(0,BK.my.n-BK.tk.now-1)} ahead of you.`));return}
    BK.my={n:++BK.tk.issued,called:false};stSay(L2(`টোকেন ${bk_tokS(BK.my.n)}। আগে আছে ${bk_n(BK.my.n-BK.tk.now-1)} জন — বেঞ্চে বসে অপেক্ষা করুন।`,`Token ${bk_tokS(BK.my.n)}. ${BK.my.n-BK.tk.now-1} ahead of you: wait on a bench.`))}
  else if(k==='ask'){const e=PAN.crowd.find(a=>a.enq);lookAt(-3.9,10.6);
    if(!e){stSay(st==='closed'?(FRIDAY?L2('আজ ছুটি, স্যার। রবিবার সকাল দশটায় আসেন।','It\'s the weekend, sir. Come on Sunday at ten.'):L2('ব্যাংক বন্ধ। রবি থেকে বৃহস্পতি, সকাল দশটা থেকে তিনটা লেনদেন।','The bank is closed. Counters open Sunday to Thursday, ten to three.')):
      L2('অনুসন্ধানে কেউ নাই এখন। লেনদেন সকাল দশটা থেকে বিকাল তিনটা।','Nobody at the enquiry desk now. Counters are open ten to three.'),g);return}
    const R=bb?[L2('২৩ নভেম্বর ২০২৫ থেকে এখানে সরাসরি গ্রাহকসেবা বন্ধ। ছেঁড়া নোট, প্রাইজবন্ড, সঞ্চয়পত্র — সব এখন বাণিজ্যিক ব্যাংকের শাখায়। কাছেই সোনালী ব্যাংক।','Since 23 November 2025 there is no direct service here. Torn notes, prize bonds, savings certificates: all at commercial bank branches now. Sonali Bank is close by.'),
        L2('ছেঁড়া নোটের ৯০ ভাগ ঠিক থাকলে পুরা দাম পাবেন — সোনালী ব্যাংকে যান।','If about 90% of a torn note is intact you get its full value. Go to Sonali Bank.')]
      :BK.kind==='sonali'?[L2('ছেঁড়া-ফাটা নোট ৫ নম্বরে বদলায়। নোটের প্রায় ৯০ ভাগ ঠিক থাকলে পুরা দাম।','Torn notes are changed at counter 5. If about 90% of the note is intact, you get full value.'),
        L2('প্রাইজবন্ড একশো টাকা করে, ৬ নম্বরে। সঞ্চয়পত্রে এনআইডি আর নিজের ব্যাংক হিসাব লাগবে।','Prize bonds are 100 taka each, at counter 6. For savings certificates you need your NID and your own bank account.'),
        L2('পেনশনের কাজ ৮ নম্বরে। লেনদেন বিকাল তিনটা পর্যন্ত — আগে টোকেন নেন।','Pensions at counter 8. Counters close at three: take a token first.')]
      :[L2('হিসাব খোলার ফরম ৮ নম্বরে; এনআইডি আর দুই কপি ছবি আনবেন।','Account opening forms at counter 8: bring your NID and two photos.'),
        L2('বিদেশ থেকে টাকা আসলে রেমিট্যান্স কাউন্টারে যান, পিন নম্বর আর এনআইডি নিয়া।','Money from abroad: go to the remittance counter with the PIN number and your NID.'),
        L2('লেনদেন বিকাল তিনটা পর্যন্ত। আগে টোকেন নেন।','Counters are open till three. Take a token first.')];
    BK.askI=((BK.askI||0)+1)%R.length;stSay(R[BK.askI],e)}
  else if(k==='atm'){const atm={X:-6.85,Y:-11.2};lookAt(-6.8,-10.8);
    if(bk_atmDay!==null&&bk_gh-bk_atmDay<20){stSay(L2('আজ একবার টাকা তুলেছেন। বাকিটা মাসের খরচের জন্য থাক।','You took cash once today. Leave the rest for the month.'),atm);return}
    if(bk_bal<500){stSay(L2(`অপর্যাপ্ত ব্যালান্স। হিসাবে আছে ৳${bnNum(bk_bal)}।`,`Insufficient balance. ৳${bk_bal} left in the account.`),atm);return}
    bk_bal-=500;bk_atmDay=bk_gh;addMoney(500);HOUR=(HOUR+4/60)%24;updateStatusUI();
    stSay(L2(`এটিএম থেকে ৳৫০০ তুললেন। হিসাবে বাকি ৳${bnNum(bk_bal.toLocaleString('en-IN'))}।`,`You withdrew ৳500. ৳${bk_bal.toLocaleString('en-IN')} left in your account.`),atm)}
  else if(k==='bench'){lookAt(-.6,6.2);
    if(st==='closed'||st==='pre'){stSay(L2('হল বন্ধ, স্যার। বসা যাবে না।','The hall is shut, sir. You can\'t sit here.'),g);return}
    addEnergy(6);HOUR=(HOUR+15/60)%24;updateStatusUI();stSay(L2('স্টিলের বেঞ্চে পনেরো মিনিট বসলেন। মাথার ওপর ফ্যান ঘুরছে।','You sit on the steel bench for fifteen minutes. The fan creaks overhead.'))}}
const BK_SCENE={key:'bank',indoor:true,places:bk_getPlaces,init:bk_init,update:bk_update,draw:bk_draw,sub:bk_sub,acts:BK_ACTS,act:bk_act,
  marks:()=>[[0,L2('কাউন্টার','Counters')],[-125,L2('এটিএম','ATM')],[-85,L2('নোটিশ · জমা স্লিপ','Notices · slips')],[95,L2('বেঞ্চ','Benches')],[115,L2('অনুসন্ধান','Enquiry')],[180,L2('দরজা · রাস্তা','Door · street')]]};
PANO_SCENES.push(BK_SCENE);
