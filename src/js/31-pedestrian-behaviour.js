/* ---------------- pedestrian behaviour ---------------- */
function vehicleNear(x,y,r){gridQuery(x,y,r,QB);for(const o of QB)if(o.hx!==undefined&&!o.static&&!o.parked&&o.spd>1.8&&Math.hypot(o.x-x,o.y-y)<r)return true;return false}
function removePed(p){p.dead=true;if(p.slot){p.slot.who=null;p.slot=null}if(cam.follow===p){cam.follow=null;hideCard();toast(`${p.name} walked out of the sketch.`)}}
function startCross(p,w2,s2){const P=walks[w2],lr=latRange(P),o=[];const lat=mr(lr[0],lr[1]);walkPos(P,s2,lat,o);p.st='go';p.tx=o[0];p.ty=o[1];p.after='walk';p.nw=w2;p.ns=s2;p.nlat=lat;p.crossing=true}
function updPed(p,dt){
  if(p.act&&p.actT<=simT)p.act=null;const rainy=rain>.35;
  switch(p.st){
  case 'walk':{const P=walks[p.w];let spd=p.spd*(rainy&&!p.look.hasUmb?1.5:1);
    p.s+=spd*dt*p.dir;p.pose='walk';p.ph+=spd*dt*5.4;
    if(!P.closed&&(p.s<0||p.s>P.len)){const end=p.s>P.len?1:0;p.s=clamp(p.s,0,P.len);const e=end?P.pts[P.pts.length-1]:P.pts[0];
      if(!inWorld(e[0],e[1],-6)){removePed(p);return}const L=P.links[end];if(!L.length){p.dir*=-1;break}const l=L[(Math.random()*Math.min(L.length,4))|0];startCross(p,l.w,l.s);break}
    if(P.closed){for(const ex of P.exits){let d=((ex.s-p.s)%P.len+P.len)%P.len;if(p.dir<0)d=P.len-d;if(d<spd*dt*1.5&&Math.random()<.35){p.w=ex.w;p.s=ex.ws;p.dir=nearestDirOut(ex.w);const lr=latRange(walks[p.w]);p.lat=clamp(p.lat,lr[0],lr[1]);break}}}
    if(P.sib>=0&&Math.random()<dt*(Math.hypot(p.x,p.y)<200?.004:.0015)){const Q=walks[P.sib];const[s2,d]=nearestS(Q,p.x,p.y);if(d<30){startCross(p,Q.id,s2);break}}
    pedPlace(p);p.onRoad=isRoad(p.x,p.y);
    p.poiT-=dt;if(p.poiT<=0){p.poiT=.5;pedPOI(p)}
    if(p.roam==='sweeper'&&!RHY.dawn()&&Math.random()<dt*.05){removePed(p);return}
    if(p.roam&&p.roam!=='porter'&&p.roam!=='sweeper'){p.callT-=dt;if(p.callT<=0){p.callT=mr(10,22);say(pedAnchor(p),p.roam==='badam'?'hawker_badam_1':p.roam==='water'?'kid_water_1':'hawker_paper_1',3,p)}}
    else if(Math.random()<dt/300){if((p.role==='office'||p.role==='banker')&&HOUR>8&&HOUR<10.5){p.act='phone';p.actT=simT+6;say(pedAnchor(p),'office_late_1',3.6,p)}
      else if(p.role==='peon'){p.act='carry';p.actT=simT+20;say(pedAnchor(p),'office_file_1',3,p)}
      else if((p.role==='office'||p.role==='banker')&&HOUR>12.8&&HOUR<14.2)say(pedAnchor(p),'office_lunch_1',3,p);
      else if(p.look.female&&Math.random()<.4){p.act='phone';p.actT=simT+7;say(pedAnchor(p),'phone_1',4.2,p)}
      else if(Math.random()<.3)say(pedAnchor(p),'passer_jam_1',3.4,p)}
    if(p.role==='peon'&&!p.act){p.act='carry';p.actT=simT+1e5}
    if(p.roam==='porter'&&!p.act){p.act='load';p.actT=simT+1e5}
    break}
  case 'go':{const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy);p.pose='walk';p.ph+=p.spd*dt*5.4;if(Math.abs(dx)>.1)p.fc=dx>0?1:-1;
    if(p.bus){const ha=helperAnchor(p.bus)();if(!ha||p.bus.dead||p.bus.dwell<=0){p.bus=null;p.after='walk';const o=[];walkPos(walks[p.w],p.s,p.lat,o);p.tx=o[0];p.ty=o[1]}else{p.tx=ha[0];p.ty=ha[1]}}
    if(d<.35){p.x=p.tx;p.y=p.ty;goArrive(p);return}
    const ahead=isRoad(p.x+dx/d*1.2,p.y+dy/d*1.2);p.onRoad=isRoad(p.x,p.y);
    if(p.crossing&&!p.onRoad&&ahead&&p.wait<3.5&&vehicleNear(p.x+dx/d*2,p.y+dy/d*2,7)){p.wait+=dt;p.pose='stand';return}if(!ahead)p.wait=0;
    const s=Math.min(d,p.spd*(p.onRoad?1.15:1.05)*dt);p.x+=dx/d*s;p.y+=dy/d*s;break}
  case 'stay':{p.stayT-=dt;p.pose=p.slot&&p.slot.pose==='sit'?'sit':'stand';
    if(p.stall&&p.stall.type==='tea'&&Math.random()<dt*.4){p.act=(!p.look.female&&p.smoker&&Math.random()<.55)?'smoke':'drink';p.actT=simT+(p.act==='smoke'?2.6:1.2)}
    if(p.stall&&p.stall.type==='pan'&&!p.look.female&&Math.random()<dt*.3){p.act='smoke';p.actT=simT+2.6}
    if(p.stall&&['jhalmuri','fuchka','singara','cutfruit'].includes(p.stall.type)&&Math.random()<dt*.5){p.act='eat';p.actT=simT+1}
    if(p.stayT<=0||(p.stall&&!p.stall.open)){if(p.slot){p.slot.who=null;p.slot=null}p.stall=null;p.st='go';const o=[];walkPos(walks[p.w],p.s,p.lat,o);p.tx=o[0];p.ty=o[1];p.after='walk'}break}
  case 'waitBus':{p.pose='stand';p.stayT-=dt;p.onRoad=true;if(p.stayT<=0){const st=p.stop;const i=st.waiting.indexOf(p);if(i>=0)st.waiting.splice(i,1);p.st='walk'}break}
  case 'board':{p.st='go';p.tx=p.x;p.ty=p.y;p.after='boarded';break}
  case 'bargain':{p.pose='stand';break}
  case 'stalk':case 'flee':updSnatcher(p,dt);break;
  case 'chase':updChase(p,dt);break;
  case 'shock':{p.pose='stand';p.shockT-=dt;if(p.shockT<=0)p.st='walk';break}
  }
}
function nearestDirOut(w){const P=walks[w],a=P.pts[0],b=P.pts[P.pts.length-1];return Math.hypot(a[0],a[1])<Math.hypot(b[0],b[1])?1:-1}
function goArrive(p){const a=p.after;p.crossing=false;p.wait=0;
  if(a==='stay')p.st='stay';else if(a==='waitBus')p.st='waitBus';
  else if(a==='walk'){if(p.nw!==undefined){p.w=p.nw;p.s=p.ns;p.lat=p.nlat;p.nw=undefined;const P=walks[p.w];p.dir=P.closed?(Math.random()<.5?1:-1):(p.s<P.len/2?1:-1);if(Math.random()<.3)p.dir*=-1}p.st='walk'}
  else if(a==='boarded'){if(p.bus){p.bus.paxN=(p.bus.paxN||20)+1;if(cam.follow===p){cam.follow=p.bus;toast(`${p.name} squeezed onto the ${p.bus.T.en.toLowerCase()}.`)}}p.dead=true;if(p.slot)p.slot.who=null}
  else if(a==='bargain'){p.st='bargain';runBargain(p)}
}
function pedPOI(p){
  if(p.roam||p.visits>2)return;const P=walks[p.w];
  const arr=P.stalls;if(arr.length){let lo=0,hi=arr.length-1;while(lo<hi){const m=(lo+hi)>>1;if(arr[m].s<p.s-2.5)lo=m+1;else hi=m}
    for(let i=lo;i<arr.length&&arr[i].s<p.s+2.5;i++){const st=arr[i];let pr=st.def.prob;if((st.type==='hotel'||st.type==='grill')&&(RHY.lunch()||RHY.dinner()))pr*=(p.role==='office'||p.role==='banker'?6:4);if(st.type==='tea'&&RHY.teaPeak())pr*=2.2;if(st.type==='pan'&&RHY.teaPeak())pr*=1.8;if(!st.open||Math.random()>pr)continue;const slot=st.slots.find(s=>!s.who);if(!slot)continue;
      slot.who=p;p.slot=slot;p.stall=st;p.stayT=st.type==='tea'?mr(14,40):mr(6,18);p.visits++;st.served++;p.st='go';p.tx=slot.x;p.ty=slot.y;p.after='stay';return}}
  for(const bs of busStops){if(bs.walk!==p.w||Math.abs(bs.s-p.s)>4)continue;if(Math.random()<(RHY.exodus()?.4:.12)&&bs.waiting.length<14){bs.waiting.push(p);p.stop=bs;p.stayT=mr(50,140);p.visits++;p.st='go';const o=[];walkPos(P,bs.s+mr(-4,4),P.sw/2+mr(.3,1.4),o);p.tx=o[0];p.ty=o[1];p.after='waitBus';return}}
  for(const s of stands){if(s.busy||!s.parked.length||Math.hypot(s.x-p.x,s.y-p.y)>8)continue;if(Math.random()<.06){s.busy=true;p.standRef=s;p.visits=9;const v=s.parked[0];p.st='go';p.tx=v.x-v.lx*1.2;p.ty=v.y-v.ly*1.2;p.after='bargain';return}}
}
/* rickshaw stands: parked rickshaws on side-street curbs */
const stands=[];
function genStands(){for(const R of sideRoutes){if(R.kind!=='side'||R.len<80)continue;for(const f of[.25,.6]){const s0=R.len*f;const st={route:R,s0,parked:[],busy:false,refillT:0};stands.push(st);for(let i=0;i<3;i++)addParked(st,i)}}}
function addParked(st,i){const v=mkVeh('rickshaw',st.route);v.s=st.s0-i*2.9;v.u=1.15;vPlace(v);v.hx=v.lx!==undefined?-v.ly:1;const r=polyAt(st.route,v.s);v.hx=r.tx;v.hy=r.ty;v.parked=true;v.stand=st;v.dx=v.x;v.dy=v.y;v.spd=0;st.parked.push(v);vehicles.push(v);if(i===0){st.x=v.x;st.y=v.y}}
function runBargain(p){const s=p.standRef,v=s.parked[0];if(!v){s.busy=false;p.st='walk';return}
  const pa=pedAnchor(p),va=()=>[v.dx,v.dy,1.9];p.fc=v.x>p.x?1:-1;
  say(pa,'rickshaw_ask_1',2.2);later(2.1,()=>say(va,'rickshaw_price_1',2));later(4,()=>say(pa,'rickshaw_bargain_1',2.2));later(6.1,()=>say(va,rain>.4?'rain_2':'rickshaw_ok_1',2.2));
  later(8.6,()=>{if(p.dead){s.busy=false;return}s.parked.shift();v.parked=false;v.stand=null;v.pax=[p];v.fare=50;v.tu=.6;v.spd=.4;
    if(cam.follow===p){cam.follow=v;toast(`${p.name} is off in ${v.puller.name}'s rickshaw for 50 taka.`)}p.dead=true;s.busy=false;s.refillT=mr(20,50);sfx('sfx_rickshaw_bell',v.x,v.y)})}

