/* ---------------- getting about: walk, rickshaw, battery auto, CNG or a local bus to Motijheel's renowned places ----------------
   Fares follow docs/research/motijheel-reality.md: a rickshaw asks Tk 40-50 for ~1-1.5 km and settles near 30-40 after haggling,
   CNGs run on "contract" (rarely the meter), refuse short trips or ask 100-150, local buses charge the Tk 10 minimum (Tk 2.70/km beyond).
   The sketch squeezes the city: one metre here is about three on the ground (Shapla Chattar to Baitul Mukarram is ~1 km). */
const TV_SCALE=3;
const TRIP={dest:null,mode:null,stage:null,v:null,path:null,fare:0,ask:0,floor:0,round:0,bus:null,route:null,src:null,dst:null,t:0,paid:false};
const TV_DESTS=[
 {id:'baitul',name:['বায়তুল মোকাররম','Baitul Mukarram'],at:()=>siteCentre(sites.baitul)},
 {id:'kamalapur',name:['কমলাপুর রেলস্টেশন','Kamalapur station'],at:()=>sites.kamalapur&&FW(sites.kamalapur,50,8)},
 {id:'ndc',name:['নটর ডেম কলেজ','Notre Dame College'],at:()=>bldCentre('Notre Dame College')},
 {id:'bb',name:['বাংলাদেশ ব্যাংক','Bangladesh Bank'],at:()=>bldCentre('Bangladesh Bank')},
 {id:'sonali',name:['সোনালী ব্যাংক','Sonali Bank'],at:()=>bldCentre('Sonali Bank')},
 {id:'field',name:['আরামবাগ মাঠ','Arambagh field'],at:()=>fields[0]&&FW(fields[0],fields[0].L/2,fields[0].D/2)},
 {id:'mgbhs',name:['মতিঝিল সরকারি বালক উচ্চ বিদ্যালয়','Motijheel Govt Boys\' High School'],at:()=>bldCentre('Motijheel Govt Boys\' High School')},
 {id:'ideal',name:['আইডিয়াল স্কুল অ্যান্ড কলেজ','Ideal School and College'],at:()=>bldCentre('Ideal School and College')},
 {id:'shapla',name:['শাপলা চত্বর','Shapla Chattar'],at:()=>[0,-30]},
];
const tvPos=D=>{if(!D._p){const p=D.at();if(p)D._p=nearestFree(p[0],p[1],30)||p}return D._p||null};
const tvKm=D=>{const p=tvPos(D);return p?Math.hypot(p[0]-me.x,p[1]-me.y)*1.25*TV_SCALE/1000:0};   // road distance on the ground, roughly
/* the fare a puller would settle for, what he asks first, and the least he takes */
function tvPrice(mode,km){
  if(mode==='rickshaw'){const f=r5(15+15*km);return{fair:f,ask:r5(f*1.4+5),floor:r5(f*.85),no:km>4?.5:.18}}
  if(mode==='auto'){const f=r5(10+14*km);return{fair:f,ask:r5(f*1.3+5),floor:r5(f*.85),no:km>5?.4:.12}}
  if(mode==='cng'){const f=Math.max(100,r5(60+40*km));return{fair:f,ask:Math.max(150,r5(f*1.5)),floor:f,no:km<1.5?.6:.25}}
  return{fair:km>4?r5(2.7*km):10}}
const TV_V={rickshaw:{type:'rickshaw',vmax:4,bn:'রিকশা',en:'rickshaw'},auto:{type:'auto',vmax:6,bn:'অটোরিকশা',en:'battery auto'},cng:{type:'cng',vmax:8.5,bn:'সিএনজি',en:'CNG'}};

/* ---- rides use the real traffic routes: keep left, stop at the lights, round the chattar, queue in the jam ---- */
const nearestArm=(x,y)=>{let best=-1,bd=1e9;ARMS.forEach((A,i)=>{const d=nearestS(A.P,x,y)[1];if(d<bd){bd=d;best=i}});return best};
/* the route (from any road into the destination's road) that passes nearest you, where you'd be picked up and dropped */
function tvRide0(D){const p=tvPos(D);if(!p)return null;const b=nearestArm(p[0],p[1]);if(b<0)return null;let best=null;
  ARMS.forEach((A,a)=>{if(a===b)return;const R=armRoutes[a]&&armRoutes[a][b];if(!R)return;const[s1,d1]=nearestS(R,me.x,me.y),[s2,d2]=nearestS(R,p[0],p[1]);
    if(s2<s1+25)return;const score=d1+d2*.4;if(!best||score<best.score)best={R,s1,s2,d1,score}});
  return best}
/* ---- the panel ---- */
function tvButton(){const b=$('btnGo');const show=!INSIDE&&!TRIP.stage&&!ACT.mode;if(b.hidden===show)b.hidden=!show}
function tvMenu(){closeAct();ACT.mode='trip';me.path=null;
  const opts=TV_DESTS.filter(D=>tvPos(D)).map(D=>{const km=tvKm(D);return actBtn(`<span class="bn">${D.name[0]}</span> <small>${D.name[1]}</small>`,km<.25?L2('এখানেই','here'):`${LANG==='en'?km.toFixed(1):bnNum(km.toFixed(1))} km`,()=>tvModes(D),km<.25)});
  opts.push(actBtn(L2('থাক','Never mind'),'',closeAct));
  actView(L2('<span class="bn">যাতায়াত</span>Where to?','<span class="bn">যাতায়াত</span>Where to?'),L2('কোথায় যাবেন? হেঁটে, রিকশায়, সিএনজিতে বা বাসে।','Walk, or take a rickshaw, battery auto, CNG or a local bus.'),'',opts)}
function tvModes(D){const km=tvKm(D),bus=tvBusPlan(D),walkMin=Math.round(km/4.5*60);
  const row=(mode,label,price,note,off)=>actBtn(`${label} <small>${note}</small>`,price,()=>tvGo(D,mode),off,off?note:'');
  const pr=m=>tvPrice(m,km),fmt=n=>LANG==='en'?`৳${n}`:`৳${bnNum(n)}`;
  actView(`<span class="bn">${D.name[0]}</span>${D.name[1]}`,L2(`প্রায় ${bnNum(km.toFixed(1))} কিমি। কীভাবে যাবেন?`,`About ${km.toFixed(1)} km. How will you go?`),'',[
    row('walk',L2('হেঁটে','Walk'),'',L2(`~${bnNum(walkMin)} মিনিট, ফুটপাতে হকার`,`~${walkMin} min; hawkers on the footpath`),false),
    row('rickshaw',L2('রিকশা','Rickshaw'),'~'+fmt(pr('rickshaw').fair),L2('দরদাম করে','haggle first'),STAT.wallet<pr('rickshaw').floor),
    row('auto',L2('অটোরিকশা','Battery auto'),'~'+fmt(pr('auto').fair),L2('একটু দ্রুত','a bit faster'),STAT.wallet<pr('auto').floor),
    row('cng',L2('সিএনজি','CNG'),'~'+fmt(pr('cng').fair),L2('মিটারে যায় না, কাছে যেতে চায় না','no meter; may refuse a short trip'),STAT.wallet<pr('cng').floor),
    row('bus',L2('লোকাল বাস','Local bus'),bus?fmt(tvPrice('bus',km).fair):'',bus?L2('স্টপ থেকে, ভিড়','from the stop; crowded'):L2('এই পথে বাস নেই','no bus this way'),!bus||STAT.wallet<tvPrice('bus',km).fair),
    actBtn(L2('অন্য জায়গা','Somewhere else'),'',tvMenu)])}
function tvSay(t,who){actView(TRIP.title,TRIP.sub||'',who?`${who}: ${t}`:t,TRIP.btns())}

/* ---- going ---- */
function tvGo(D,mode){ACT.mode='trip';TRIP.dest=D;TRIP.mode=mode;TRIP.round=0;TRIP.paid=false;TRIP.refused=false;const km=tvKm(D);
  if(mode==='walk'){closeAct();walkTo(...tvPos(D));toast(L2(`${D.name[0]} এর দিকে হাঁটছেন`,`Walking to ${D.name[1]}`));return}
  if(mode==='bus')return tvBusStart(D);
  const P=tvPrice(mode,km);Object.assign(TRIP,{fair:P.fair,ask:P.ask,floor:P.floor,no:P.no});tvHail()}
/* a rickshaw / auto / CNG pulls up at the kerb next to you */
function tvHail(){const V=TV_V[TRIP.mode],plan=tvRide0(TRIP.dest);if(!plan){toast(L2('গাড়িতে ওখানে যাওয়ার রাস্তা নেই, হেঁটে যান।','No road goes there; walk.'));tvCancel();return}
  TRIP.plan=plan;const pick=polyAt(plan.R,plan.s1),kx=pick.x+pick.ty*plan.R.hs[0]*.9,ky=pick.y-pick.tx*plan.R.hs[0]*.9;
  if(Math.hypot(me.x-kx,me.y-ky)>14){TRIP.stage='toPickup';TRIP.pick=[kx,ky];walkTo(kx,ky);TRIP.title=`<span class="bn">${V.bn}</span>${L2('বড় রাস্তায় চলুন','To the main road')}`;TRIP.sub=L2('সেখানে গাড়ি পাবেন','You will find one there');TRIP.btns=()=>[actBtn(L2('থাক','Never mind'),'',tvCancel)];tvSay(L2('বড় রাস্তায় গিয়ে ডাকুন।','Walk to the main road and call one.'));return}
  if(TRIP.v)TRIP.v.dead=true;const v=mkVeh(V.type,plan.R);v.ride=true;v.pax=[];v.hoodUp=v.hoodUp||rain>.3;v.s=plan.s1;v.u=1;v.tu=1;vPlace(v);v.hx=VP.hx;v.hy=VP.hy;v.dx=v.x;v.dy=v.y;v.spd=0;vehicles.push(v);TRIP.v=v;TRIP.stage='haggle';
  const who=TRIP.mode==='cng'?L2('সিএনজিওয়ালা','CNG driver'):L2('চালক','Driver'),D=TRIP.dest;
  TRIP.title=`<span class="bn">${V.bn}</span>${L2('দরদাম','Haggling')}`;TRIP.sub=L2(`${D.name[0]} যাবেন`,`To ${D.name[1]}`);
  TRIP.refused=false;if(Math.random()<TRIP.no){TRIP.refused=true;TRIP.btns=()=>[actBtn(L2('আরেকটা ডাকুন','Call another'),'',tvHail),actBtn(L2('থাক','Never mind'),'',tvCancel)];
    tvSay(TRIP.mode==='cng'?L2('এত কাছে যাব না মামা। অন্য গাড়ি দেখেন।','Not going that close, mama. Find another.'):L2('যাবো না।','Won\'t go.'),who);return}
  TRIP.btns=tvOffers;tvSay(TRIP.mode==='cng'?L2(`মিটারে যাবো না। ${bnNum(TRIP.ask)} দিয়েন।`,`No meter. Give ${TRIP.ask}.`):L2(`${bnNum(TRIP.ask)} টাকা দিয়েন মামা।`,`${TRIP.ask} taka, mama.`),who)}
function tvOffers(){const o=[...new Set([r5(TRIP.fair*.7),r5(TRIP.fair),r5((TRIP.fair+TRIP.ask)/2)])].filter(v=>v<TRIP.ask&&v>0);
  return[...o.map(v=>actBtn(L2(`${bnNum(v)} টাকা দিব`,`I'll give ৳${v}`),`৳${v}`,()=>tvOffer(v),STAT.wallet<v,L2('টাকা কম','Not enough taka'))),
    actBtn(L2(`${bnNum(TRIP.ask)} টাকাই সই, চলেন`,`${TRIP.ask} it is, let's go`),`৳${TRIP.ask}`,()=>tvRide(TRIP.ask),STAT.wallet<TRIP.ask,L2('টাকা কম','Not enough taka')),
    actBtn(L2('থাক, হেঁটে যাই','Forget it, I\'ll walk'),'',tvCancel)]}
function tvOffer(v){TRIP.round++;const who=L2('চালক','Driver');
  if(v>=TRIP.floor){tvRide(v);return}
  if(TRIP.round>=3||v<TRIP.floor*.65){TRIP.refused=true;TRIP.btns=()=>[actBtn(L2('আরেকটা ডাকুন','Call another'),'',tvHail),actBtn(L2('থাক','Never mind'),'',tvCancel)];
    tvSay(L2('এই ভাড়ায় হবে না, অন্য রিকশা দেখেন।','Not at that fare. Find someone else.'),who);if(TRIP.v){TRIP.v.dead=true;TRIP.v=null}return}
  TRIP.ask=Math.max(TRIP.floor,r5(TRIP.ask-(TRIP.ask-TRIP.floor)*.55));tvSay(L2(`কী বলেন! ${bnNum(TRIP.ask)} দেন, এর নিচে হবে না।`,`What! Give ${TRIP.ask}, no less.`),who)}
function tvRide(fare){const v=TRIP.v;if(!v)return tvCancel();
  TRIP.fare=fare;TRIP.stage='ride';TRIP.t=0;v.ride=false;v.tripEnd=TRIP.plan.s2;   // from here the ordinary traffic code drives it
  v.pax=[{look:me.look,name:'You',pose:'sit',fixed:true,ph:0,act:null,fc:1}];me.riding=v;me.path=null;cam.follow=v;if(cam.tz<5)cam.tz=6.5;
  const V=TV_V[TRIP.mode];TRIP.title=`<span class="bn">${V.bn}</span>${L2(`${TRIP.dest.name[0]} যাচ্ছেন`,`To ${TRIP.dest.name[1]}`)}`;TRIP.sub=L2(`ভাড়া ${bnNum(fare)} টাকা, নেমে দিবেন`,`Fare ৳${fare}, paid when you get down`);
  TRIP.btns=()=>[actBtn(L2('এখানে রাখেন','Stop here'),'',()=>tvArrive(true))];tvSay(L2('উঠেন।','Get on.'),L2('চালক','Driver'))}
function tvCancel(){if(TRIP.v){TRIP.v.dead=true;TRIP.v=null}if(TRIP.bus&&TRIP.stage!=='bus')TRIP.bus=null;TRIP.stage=null;TRIP.mode=null;closeAct()}
function tvArrive(early){const v=TRIP.v,D=TRIP.dest;me.riding=null;
  const kx=v.x+v.lx*(v.hs||3)*.6,ky=v.y+v.ly*(v.hs||3)*.6,at=nearestFree(kx,ky,12)||[v.x,v.y];me.x=me.dx=at[0];me.y=me.dy=at[1];cam.follow=me;
  addMoney(-TRIP.fare);updateStatusUI();toast(L2(`ভাড়া দিলেন ${bnNum(TRIP.fare)} টাকা`,`Paid ৳${TRIP.fare}`));
  v.pax=[];v.tripEnd=undefined;TRIP.v=null;TRIP.stage=null;closeAct();   // the puller rides on with the traffic
  if(!early){const p=tvPos(D);if(p&&Math.hypot(p[0]-me.x,p[1]-me.y)>3)walkTo(p[0],p[1])}}
/* ---- the local bus: walk to the stop on your road, wait, squeeze on, the helper takes the fare, get down at the stop nearest your place ---- */
function tvBusPlan(D){const p=tvPos(D);if(!p)return null;const a=nearestArm(me.x,me.y),b=nearestArm(p[0],p[1]);if(a<0||b<0||a===b)return null;
  const R=armRoutes[a]&&armRoutes[a][b];if(!R||!R.stops)return null;
  const best=(arm,x,y)=>R.stops.filter(e=>e.stop.arm===arm).sort((u,w)=>Math.hypot(u.stop.x-x,u.stop.y-y)-Math.hypot(w.stop.x-x,w.stop.y-y))[0];
  const src=best(a,me.x,me.y),dst=best(b,p[0],p[1]);return src&&dst&&src.s<dst.s?{R,src,dst}:null}
function tvBusStart(D){const plan=tvBusPlan(D);if(!plan){toast(L2('এই পথে বাস নেই।','No bus goes that way.'));return}
  Object.assign(TRIP,{route:plan.R,src:plan.src,dst:plan.dst,bus:null,stage:'toStop',fare:tvPrice('bus',tvKm(D)).fair,paid:false,t:0});
  walkTo(plan.src.stop.x,plan.src.stop.y);
  TRIP.title=`<span class="bn">লোকাল বাস</span>${L2('বাস স্টপে চলুন','To the bus stop')}`;TRIP.sub=L2(`${D.name[0]} এর দিকের বাস ধরবেন`,`Catch a bus towards ${D.name[1]}`);
  TRIP.btns=()=>[actBtn(L2('থাক','Never mind'),'',tvCancel)];tvSay(L2('স্টপে গিয়ে দাঁড়ান, বাস আসবে।','Stand at the stop; a bus will come.'))}
function tvBus(dt){const st=TRIP.src.stop;TRIP.t+=dt;
  if(TRIP.stage==='toStop'){const ds=Math.hypot(me.x-st.x,me.y-st.y);if(!me.path&&ds>=6&&TRIP.t>(TRIP.re||0)){TRIP.re=TRIP.t+2;walkTo(st.x,st.y)}   // blocked by the crowd or a crossing: keep going
    if(ds<6&&!me.path){TRIP.stage='wait';TRIP.t=0;   // a bus for your way is already coming down the road
      const b=mkVeh(Math.random()<.2?'dd':'bus',TRIP.route);b.s=Math.max(0,TRIP.src.s-mr(22,30));vPlace(b);b.hx=VP.hx;b.hy=VP.hy;b.dx=b.x;b.dy=b.y;b.spd=b.vmax*.6;b.tripBus=true;vehicles.push(b);TRIP.bus=b;
      TRIP.title=`<span class="bn">লোকাল বাস</span>${L2('বাসের অপেক্ষায়','Waiting for the bus')}`;TRIP.btns=()=>[actBtn(L2('থাক, হেঁটে যাই','Walk instead'),'',tvBusWalk)];tvSay(L2('ওই যে বাস আসতেছে!','There, a bus is coming!'))}return}
  const b=TRIP.bus;if(!b||b.dead){if(me.riding===b){me.riding=null;cam.follow=me;const p=tvPos(TRIP.dest);if(p)walkTo(p[0],p[1])}TRIP.stage=null;closeAct();return}
  if(TRIP.stage==='wait'&&b.dwell>0&&b.stopRef===st){TRIP.stage='bus';me.riding=b;me.path=null;cam.follow=b;TRIP.t=0;
    TRIP.title=`<span class="bn">বাসে</span>${L2('বাসে চড়ে','On the bus')}`;TRIP.sub=L2(`নামবেন ${TRIP.dest.name[0]} এর কাছের স্টপে`,`Getting down at the stop nearest ${TRIP.dest.name[1]}`);TRIP.btns=()=>[actBtn(L2('জ্যাম! নেমে হেঁটে যাই','Stuck! Get down and walk'),'',tvBusWalk)];
    tvSay(L2('উঠেন উঠেন, পিছনে চাপেন!','Get on, get on, squeeze to the back!'),L2('হেল্পার','Helper'));return}
  if(TRIP.stage==='bus'){me.x=b.x;me.y=b.y;
    if(!TRIP.paid&&TRIP.t>5){TRIP.paid=true;addMoney(-TRIP.fare);updateStatusUI();tvSay(L2(`ভাড়া দেন! ${bnNum(TRIP.fare)} টাকা।`,`Fare please! ${TRIP.fare} taka.`),L2('হেল্পার','Helper'))}
    if(b.dwell>0&&b.stopRef===TRIP.dst.stop){me.riding=null;const s2=TRIP.dst.stop,at=nearestFree(s2.x,s2.y,8)||[s2.x,s2.y];me.x=me.dx=at[0];me.y=me.dy=at[1];cam.follow=me;
      if(!TRIP.paid){addMoney(-TRIP.fare);updateStatusUI()}toast(L2('বাম পা দিয়া নামেন! নামলেন।','Step down left foot first! You\'re off.'));TRIP.stage=null;closeAct();const p=tvPos(TRIP.dest);if(p)walkTo(p[0],p[1])}}}
/* give up on the bus: get down (or leave the stop) and walk the rest */
function tvBusWalk(){const b=TRIP.bus;if(me.riding===b&&b){me.riding=null;const at=nearestFree(b.x+b.lx*(b.hs||3),b.y+b.ly*(b.hs||3),12)||[b.x,b.y];me.x=me.dx=at[0];me.y=me.dy=at[1];cam.follow=me;if(!TRIP.paid){addMoney(-TRIP.fare);updateStatusUI()}}
  TRIP.stage=null;closeAct();const p=tvPos(TRIP.dest);if(p)walkTo(p[0],p[1])}
function updTrip(dt){if(TRIP.stage==='haggle'&&ACT.mode!=='trip')tvCancel();tvButton();if(!TRIP.stage)return;
  if(TRIP.stage==='toPickup'){if(Math.hypot(me.x-TRIP.pick[0],me.y-TRIP.pick[1])<8)tvHail();else if(!me.path){TRIP.re=(TRIP.re||0)-dt;if(TRIP.re<=0){TRIP.re=2;walkTo(...TRIP.pick)}}return}
  if(TRIP.stage==='ride'){const v=TRIP.v;if(!v||v.dead||v.s>=v.tripEnd){if(v)tvArrive(false);else{TRIP.stage=null;me.riding=null;cam.follow=me}}return}
  if(TRIP.stage!=='haggle')tvBus(dt)}
$('btnGo').onclick=tvMenu;
