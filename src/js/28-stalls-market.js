/* ---------------- stalls & market ---------------- */
const STALL={
 tea:{bn:'চায়ের টং',en:'tea stall',h:[6,23.5],lines:['hawker_tea_1','hawker_tea_2'],act:'pour',w:3,wd:[1.9,1],can:'tarp',prob:.08,col:'#8a6a4a'},
 fruit:{bn:'ফলের দোকান',en:'fruit stall',h:[8,22.5],lines:['hawker_fruit_1'],act:'stand',w:3.4,wd:[2.2,1.1],can:'tarp',prob:.05,col:'#8a6a4a'},
 cloth:{bn:'কাপড়ের দোকান',en:'clothes stall',h:[10,22],lines:['hawker_cloth_1'],act:'wave',w:3,wd:[2.4,1.2],can:'tarp',prob:.05,col:'#6b6b6b'},
 singara:{bn:'সিঙ্গারা-সমুচা',en:'singara fryer',h:[14.5,21.5],lines:['hawker_singara_1'],act:'serve',w:2,wd:[1.5,.9],can:'tarp',prob:.07,col:'#8a6a4a'},
 fuchka:{bn:'ফুচকা-চটপটি',en:'fuchka cart',h:[14,22.5],lines:['hawker_fuchka_1'],act:'serve',w:1.5,wd:[1.5,.9],can:'umb',prob:.06,col:'#b8432f'},
 jhalmuri:{bn:'ঝালমুড়ি',en:'jhalmuri seller',h:[11,21.5],lines:['hawker_jhalmuri_1','hawker_jhalmuri_2'],act:'shake',w:1.5,wd:[1.1,.8],can:null,prob:.06,col:'#6b4a32'},
 cutfruit:{bn:'পেয়ারা মাখা',en:'spiced guava cart',h:[10,20],lines:['hawker_peyara_1'],act:'chop',w:1.5,wd:[1.4,.8],can:'umb',prob:.05,col:'#3f5f8a'},
 akh:{bn:'আখের রস',en:'sugarcane juice press',h:[10,19],lines:['hawker_akh_1'],act:'crank',w:1,wd:[1.4,.9],can:'umb',prob:.05,col:'#2e7d32'},
 dab:{bn:'ডাবের ভ্যান',en:'coconut van',h:[9,18.5],lines:['hawker_dab_1'],act:'chop',w:1,wd:[1.9,1],can:null,prob:.04,col:'#8a6a4a'},
 shoes:{bn:'জুতা-স্যান্ডেল',en:'sandal spread',h:[10,21],lines:['hawker_cloth_1'],act:'squat',w:1.2,wd:[2,1.2],can:'umb',prob:.03,col:'#3f5f8a'},
 cover:{bn:'মোবাইল কভার',en:'phone-cover stall',h:[10,21],lines:['hawker_cover_1'],act:'stand',w:1.4,wd:[1.2,.7],can:'umb',prob:.035,col:'#8a8a86'},
 book:{bn:'পুরোনো বই',en:'second-hand books',h:[10,20],lines:['hawker_book_1'],act:'squat',w:.7,wd:[2,1.2],can:null,prob:.03,col:'#3f5f8a'},
 paper:{bn:'পত্রিকা',en:'newspaper spread',h:[6,12.5],lines:['hawker_paper_1'],act:'squat',w:.8,wd:[1.8,1.1],can:null,prob:.04,col:'#3f5f8a'},
 flower:{bn:'ফুল',en:'flower seller',h:[9,21],lines:[],act:'stand',w:.5,wd:[1.2,.8],can:null,prob:.02,col:'#6b4a32'},
 toys:{bn:'খেলনা',en:'toy and balloon seller',h:[10,21],lines:[],act:'stand',w:.6,wd:[1,.6],can:null,prob:.02,col:'#6b4a32'},
 pan:{bn:'পান-বিড়ি',en:'paan and cigarette box',h:[7,23.5],lines:[],act:'stand',w:1.4,wd:[.9,.6],can:null,prob:.05,col:'#6b4a32'},
 shoe:{bn:'জুতা পালিশ',en:'shoe-polish box',h:[9,18],lines:['hawker_shoe_1'],act:'squat',w:.8,wd:[.6,.45],can:null,prob:.025,col:'#6b4a32'},
 sim:{bn:'সিম কার্ড',en:'SIM card booth',h:[10,20],lines:['hawker_sim_1'],act:'stand',w:.5,wd:[1,.6],can:'umb',prob:.02,col:'#e0a526'},
 hotel:{bn:'খাবার হোটেল',en:'roadside eatery',h:[6,23.8],lines:['hotel_call_1'],act:'serve',w:0,wd:[3.6,1.8],can:'tarp',prob:.08,col:'#8a6a4a'},
 grill:{bn:'কাবাব-পরোটা',en:'kebab and paratha grill',h:[16,23.8],lines:['hotel_call_1'],act:'serve',w:0,wd:[2,1.1],can:'tarp',prob:.07,col:'#6b4a32'},
 sweets:{bn:'মিষ্টির দোকান',en:'sweet shop showcase',h:[8,23],lines:[],act:'stand',w:0,wd:[2.2,.9],can:'tarp',prob:.04,col:'#8a6a4a'},
 attar:{bn:'আতর-টুপি',en:'attar, tupi and prayer mats',h:[8,22],lines:['hawker_attar_1'],act:'stand',w:0,wd:[1.6,.9],can:'umb',prob:.04,col:'#6b4a32'},
 counter:{bn:'বাস কাউন্টার',en:'long-distance bus counter',h:[5.5,24],lines:[],act:'stand',w:0,wd:[2,1.3],can:null,prob:.03,col:'#1f4f8b'},
 van:{bn:'ফলের ভ্যান',en:'fruit van',h:[9,21.5],lines:['hawker_fruit_1'],act:'stand',w:0,wd:[2.2,1.3],can:null,prob:.05,col:'#8a6a4a'},
};
const TARP=['#2f6fb0','#e07b28','#2f8a4a','#c0392b','#6a1b9a','#1f8a8a','#d9b21f'];
const UMBC=[['#c0392b','#f2f2ea'],['#1f6f8b','#f2c14e'],['#2e7d32','#f2f2ea'],['#6a1b9a','#e67e22'],['#e0a526','#1f3a6b']];
const FRUIT=['#e67e22','#d62d20','#f2c14e','#6aa84f','#8e3b8e','#f4a261','#bf1f1f'];
const TEA_NAMES=[['মামার টং','Mamar Tong'],['ভাই ভাই টি স্টল','Bhai Bhai Tea Stall'],['বিসমিল্লাহ টি হাউস','Bismillah Tea House'],['রহিমের চা','Rahim\'s Tea'],['নিউ মা টি স্টল','New Ma Tea Stall']];
const stalls=[],busStops=[],podiums=[],staticObs=[];
function genStalls(){
  const types=Object.fromEntries(Object.entries(STALL).filter(([k])=>!['van','hotel','grill','sweets','attar'].includes(k)).map(([k,v])=>[k,v.w]));types.hotel=1.2;types.grill=.8;types.sweets=.5;
  const near=(F,a,b,r,x,y)=>{if(!F)return 0;const c=FW(F,a,b);return Math.exp(-Math.hypot(x-c[0],y-c[1])/r)};
  const TK={hotel:5,grill:3,tea:4,fruit:3,cloth:2,singara:2,pan:2,sweets:1.5,cover:1.5,dab:1},TB={attar:5,cloth:3,shoes:2,book:3,flower:1,tea:2,sweets:1.5,fruit:1.5};
  for(const P of walks){if(P.side===0)continue;let s=rr(1,4);
    while(s<P.len-2){const o=[];walkPos(P,s,0,o);const r=Math.hypot(o[0],o[1]);if(!inWorld(o[0],o[1],-8)){s+=8;continue}
      const nk=near(sites.kamalapur,66,40,120,o[0],o[1]),nb=near(sites.baitul,56,20,110,o[0],o[1]);const dens=clamp((P.closed?.35:clamp(1.12-r/290,.04,.94)*(P.sw>=5?1:.55))+nk*.9+nb*.9,0,.96);
      if(RND()<dens&&!trees.some(t=>t.walk===P.id&&Math.abs(t.s-s)<2.5)){const type=wpick(nk>.35?TK:nb>.35?TB:types,RND),def=STALL[type],w=def.wd[0];mkStall(type,P,s+w/2);s+=w+rr(.15,.9);
        if(!P.closed&&RND()<dens*.18&&r>60){mkStall('van',P,s+1.2,true);s+=2.6}}
      else s+=rr(3,9)}}
}
function mkStall(type,P,s,curb){
  const def=STALL[type],[w,d]=def.wd,o=[];const lat=curb?P.sw/2+1.25:-(P.sw/2)+d/2+.15;walkPos(P,s,lat,o);
  const tx=o[2],ty=o[3],k=-P.side,nx=ty*k,ny=-tx*k;// toward road
  const st={type,def,x:o[0],y:o[1],tx,ty,nx,ny,w,d,walk:P.id,s,curb,open:true,slots:[],callT:mr(3,14),chatT:mr(8,20),served:0,seed:(RND()*1e9)|0,
    can:def.can,canCol:rpick(TARP),umb:rpick(UMBC),goods:[rpick(FRUIT),rpick(FRUIT),rpick(FRUIT),rpick(SARI),rpick(SARI)],name:type==='tea'?TEA_NAMES[stalls.length%TEA_NAMES.length]:null};
  st.sx=o[0]+nx*(d/2+.9);st.sy=o[1]+ny*(d/2+.9);
  if(type==='tea'){for(const k2 of[-.65,0,.65])st.slots.push({x:o[0]+nx*(d/2+.75)+tx*k2,y:o[1]+ny*(d/2+.75)+ty*k2,pose:'sit',who:null});for(const k2 of[-1.5,1.5])st.slots.push({x:o[0]+nx*(d/2+1.5)+tx*k2,y:o[1]+ny*(d/2+1.5)+ty*k2,pose:'stand',who:null})}
  else if(type==='hotel'){for(const k2 of[-.55,.55])for(const b2 of[.1,.9])st.slots.push({x:o[0]+nx*(d/2+.3+b2)+tx*(w*.28+k2),y:o[1]+ny*(d/2+.3+b2)+ty*(w*.28+k2),pose:'sit',who:null});for(const k2 of[-w*.35,0])st.slots.push({x:st.sx+tx*k2,y:st.sy+ty*k2,pose:'stand',who:null})}
  else if(!curb)for(const k2 of[-w*.35,w*.35,0])st.slots.push({x:st.sx+tx*k2,y:st.sy+ty*k2,pose:'stand',who:null});
  else for(const k2 of[-.9,.9])st.slots.push({x:o[0]-nx*1.2+tx*k2,y:o[1]-ny*1.2+ty*k2,pose:'stand',who:null});
  const h=makePerson('hawker',Math.random()<.08);if(!h.look.female){h.look.dress=Math.random()<.6?'lungi':'pants';h.look.c2=h.look.dress==='lungi'?mpick(LUNGI):mpick(PANTS)}
  const back=curb?-1.2:-(d/2+.45);h.x=o[0]+nx*back+tx*(type==='shoe'?0:.2);h.y=o[1]+ny*back+ty*.2;
  if(['paper','book','shoes','shoe'].includes(type)){h.x=o[0]-nx*(d/2-.2)+tx*(w/2+.2);h.y=o[1]-ny*(d/2-.2)+ty*(w/2+.2)}
  if(curb){h.x=o[0]-tx*1.5;h.y=o[1]-ty*1.5}
  h.dx=h.x;h.dy=h.y;h.stall=st;h.fixed=true;h.pose=def.act==='squat'?'squat':'stand';h.act=def.act;h.years=2+(Math.random()*28|0);h.fc=(nx>.1||(Math.abs(nx)<=.1&&tx>0))?1:-1;
  st.hawker=h;fixedPeople.push(h);stalls.push(st);P.stalls.push(st);
  if(curb)staticObs.push({x:o[0],y:o[1],len:2.4,wid:1.4,static:true,hx:tx,hy:ty});
}
function genCounters(){const A=ARMS[2];if(!A)return;let k=0;for(const P of walks){if(P.road!==A.id||P.side!==-1)continue;for(let s=0;s<P.len;s+=10){const o=[];walkPos(P,s,0,o);const r=Math.hypot(o[0],o[1]);if(r<170||r>290)continue;
    for(let i=P.stalls.length-1;i>=0;i--)if(Math.abs(P.stalls[i].s-s)<5.5){const st=P.stalls[i];st.dead=true;P.stalls.splice(i,1)}
    mkStall('counter',P,s);const st=stalls[stalls.length-1];st.name=COACHES[k%COACHES.length];st.cCol=['#1f4f8b','#c0392b','#2e7d32','#6a1b9a','#d35400'][k%5];st.hawker.roleText='Ticket clerk at a long-distance bus counter';k++}}
  for(let i=stalls.length-1;i>=0;i--)if(stalls[i].dead){const st=stalls[i];const j=fixedPeople.indexOf(st.hawker);if(j>=0)fixedPeople.splice(j,1);stalls.splice(i,1)}
  for(const P of walks)P.stalls.sort((a,b)=>a.s-b.s)}
function genStops(){
  for(const A of ARMS)for(const side of[-1,1])for(const r of[108,228]){const P=walks.find(w=>w.road===A.id&&w.side===side&&w.len>60);if(!P)continue;
    let s=0;for(let k=0;k<P.pts.length;k++){if(Math.hypot(P.pts[k][0],P.pts[k][1])>=r){s=P.cum[k];break}}
    const o=[];walkPos(P,s,P.sw/2+.6,o);busStops.push({x:o[0],y:o[1],walk:P.id,s,arm:A.arm,side,waiting:[],bus:null});
    // clear the market off the stop
    for(let i=P.stalls.length-1;i>=0;i--)if(Math.abs(P.stalls[i].s-s)<6){const st=P.stalls[i];st.dead=true}}
  for(let i=stalls.length-1;i>=0;i--)if(stalls[i].dead){const st=stalls[i];const P=walks[st.walk];P.stalls.splice(P.stalls.indexOf(st),1);fixedPeople.splice(fixedPeople.indexOf(st.hawker),1);stalls.splice(i,1)}
  for(const P of walks)P.stalls.sort((a,b)=>a.s-b.s);
}
function genPolice(){
  for(const A of ARMS){let s=0;for(let k=0;k<A.pts.length;k++)if(Math.hypot(A.pts[k][0],A.pts[k][1])>=ROUT+4){s=A.P.cum[k];break}
    const r=polyAt(A.P,s),x=r.x,y=r.y;const pod={x,y,arm:A.arm,umb:rpick(UMBC)};podiums.push(pod);staticObs.push({x,y,len:1.9,wid:1.9,static:true});
    const sg=mkCop(x,y,'police');sg.onPod=true;pod.cop=sg;
    // two constables on the inbound half near the stop line
    for(const k of[1,2]){const s2=nearestS(A.P,x,y)[0]+4+k*5;const q=polyAt(A.P,s2);const lx=q.ty,ly=-q.tx;const off=-(k===1?A.hw*.25:A.hw*.7);const c=mkCop(q.x+lx*off,q.y+ly*off,'constable');staticObs.push({x:c.x,y:c.y,len:.7,wid:.7,static:true})}}
  const kiosk=polar(52,-8);podiums.push({x:kiosk[0],y:kiosk[1],kiosk:true});
}
function mkCop(x,y,kind){const p=makePerson('police',false);p.look.dress='pants';p.look.c1='#d9dccf';p.look.c2='#2f3a4d';p.fixed=true;p.x=x;p.y=y;p.dx=x;p.dy=y;p.pose='stand';p.act=kind==='police'?'police':'stick';p.role='police';p.kind=kind;p.years=4+(Math.random()*20|0);p.vest=true;fixedPeople.push(p);return p}

