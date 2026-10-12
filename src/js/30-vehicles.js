/* ---------------- vehicles ---------------- */
VT.thela={len:2.6,wid:1.2,v:[1,1.4],acc:.6,bn:'ঠেলাগাড়ি',en:'Push cart'};
VT.covan={len:3.6,wid:1.6,v:[5,8],acc:1.8,bn:'কাভার্ড ভ্যান',en:'Covered van'};
VT.coach={len:12,wid:2.5,v:[6,9],acc:1.3,bn:'দূরপাল্লার কোচ',en:'Long-distance coach'};
VT.cash={len:4.6,wid:1.8,v:[7,10],acc:2,bn:'ক্যাশ ক্যারিয়ার ভ্যান',en:'Cash-in-transit van'};
const COACHES=[['সোনার বাংলা পরিবহন','Sonar Bangla Paribahan'],['নীলাচল এক্সপ্রেস','Nilachal Express'],['সুরমা লাইন','Surma Line'],['পদ্মা ট্রাভেলস','Padma Travels'],['চট্টলা কোচ','Chattala Coach']];
const PREF_U={auto:[-.4,1],cash:[-.6,.6],coach:[.2,1],rickshaw:[.2,1],bus:[.2,1],dd:[.3,1],leguna:[0,1],thela:[.5,1],cng:[-1,.6],car:[-1,.5],bike:[-1,1],covan:[-.6,.8]};
const LAT_SPD={auto:1.7,cash:1,coach:.7,rickshaw:1.3,bike:2.2,cng:1.6,car:1.1,bus:.8,dd:.7,leguna:1,thela:.5,covan:.9};
function mkVeh(type,route){const coach=type==='coach';if(coach)type='bus';const v=mkVehicle(type,route);if(coach){v.coach=true;v.len=12;v.col='#f2f2ea';v.col2=mpick(['#c0392b','#1f6f8b','#2e7d32','#e0a526']);const co=mpick(COACHES);v.brt=[co[0],co[1],'helper_kamalapur_1'];v.hangers=[]}if(type==='cash'){v.col='#55605a';v.guards=2}if(type==='car'){v.sub=wpick({sedan:5,hatch:2,suv:2,micro:3});const dims={sedan:[4.5,1.75],hatch:[3.9,1.7],suv:[4.7,1.9],micro:[4.8,1.75]}[v.sub];v.len=dims[0];v.wid=dims[1];if(v.sub==='micro')v.col=mpick(['#f2f2ea','#d9d9d4','#b9bcc0','#e9e7e1'])}const pr=PREF_U[type];v.u=mr(pr[0],pr[1]);v.tu=v.u;v.pu=v.u;v.latCd=Math.random();v.latSpd=LAT_SPD[type];
  if(type==='thela'){v.col='#8a6a4a';v.pusher=makePerson('labour',false);v.load=mpick(['sacks','boxes','bamboo'])}if(type==='covan')v.col=mpick(['#2f5f8a','#8a3f3f','#3f6f4f']);
  if(type==='bus'||type==='dd'){v.hangers=[];const n=Math.random()*3|0;for(let i=0;i<n;i++)v.hangers.push(makePerson(mpick(['labour','student','office']),false))}
  return v}
const VP={x:0,y:0,hx:1,hy:0,hs:1};
function vPose(v){const R=v.r,r=polyAt(R,v.s),h0=R.hs[r.i],h1=R.hs[Math.min(r.i+1,R.hs.length-1)],hs=h0+(h1-h0)*r.t;VP.hs=hs;VP.x=r.x+r.ty*v.u*hs;VP.y=r.y-r.tx*v.u*hs;VP.hx=r.tx;VP.hy=r.ty;return VP}
function vPlace(v){const p=vPose(v);v.x=p.x;v.y=p.y;v.hs=p.hs;v.lx=p.hy;v.ly=-p.hx;v.hx+=(p.hx-v.hx)*.3;v.hy+=(p.hy-v.hy)*.3;const n=Math.hypot(v.hx,v.hy)||1;v.hx/=n;v.hy/=n}
/* set the heading straight from the route (vPlace eases it), for vehicles placed rather than driven in */
function vSnap(v){vPlace(v);v.hx=VP.hx;v.hy=VP.hy;v.dx=v.x;v.dy=v.y}
/* clear road ahead of v. o's half-size is measured along and across v's heading, so a crossing car counts by its length.
   Anything overlapping with its centre ahead of ours blocks us (a negative gap); one beside or behind is only "side", so the front one drives off.
   margin: the spare room kept at the sides (a squeezing vehicle keeps less, but never drives through); squeeze: walkers step aside, so they don't block.
   Two vehicles whose paths cross: the one whose nose is further from the crossing point gives way, so exactly one of them waits */
function gapAt(v,ox,oy,look,margin=.22,squeeze=false,nose=false){const x=v.x+ox,y=v.y+oy,hx=v.hx,hy=v.hy;gridQuery(x+hx*look*.5,y+hy*look*.5,look*.5+6,QB);let gap=1e9,side=false,blk=null;
  for(const o of QB){if(o===v||o.parked===true&&o.stand||squeeze&&o.ped||nose&&noseable(v,o))continue;const dx=o.x-x,dy=o.y-y,al=dx*hx+dy*hy,lat=Math.abs(-dx*hy+dy*hx);
    if(o.hx!==undefined&&!o.static&&o.r){const cr=hx*o.hy-hy*o.hx;if(Math.abs(cr)>.3){const t=(dx*o.hy-dy*o.hx)/cr,s=(dx*hy-dy*hx)/cr,mine=t-v.len/2,theirs=s-o.len/2;
      if(mine<theirs||mine===theirs&&v.id<o.id)continue}}
    let ea,ec;if(o.hx!==undefined){const c=Math.abs(o.hx*hx+o.hy*hy),s=Math.sqrt(Math.max(0,1-c*c)),L=(o.len||.6)/2,w=(o.wid||.6)/2;ea=L*c+w*s;ec=L*s+w*c}else ea=ec=(o.len||.6)/2;
    const touch=v.wid/2+ec;if(lat>touch+margin){if(!(o.mergeU!==undefined&&al>v.len/2))continue;   // zipper: one beside-and-ahead (past our nose; one level with us we just drive past) that wants to move over is let in
      const sh=(o.mergeU-o.u)*(o.hs||1),mx=dx+o.lx*sh,my=dy+o.ly*sh;if(Math.abs(-mx*hy+my*hx)>touch+margin)continue}
    if(o.hx!==undefined&&!o.static&&o.hx*hx+o.hy*hy<-.5&&lat>touch)continue;   // oncoming traffic only matters when we would actually hit it
    const hl=v.len/2+ea;
    if(al>-hl&&al<hl){if(al>0){const g=al-hl;if(g<gap){gap=g;blk=o}}else side=true}else if(al>0&&al<look+hl){const g=al-hl;if(g<gap){gap=g;blk=o}}}
  return{gap,side,blk}}
/* would sliding sideways by sh (metres, along v.lx,v.ly) push v into something level with it? Moving away is always allowed */
function sideBlocked(v,sh,squeeze,nose){gridQuery(v.x,v.y,v.len/2+6,QB);
  for(const o of QB){if(o===v||o.parked===true&&o.stand||squeeze&&o.ped||nose&&noseable(v,o))continue;const dx=o.x-v.x,dy=o.y-v.y,al=dx*v.hx+dy*v.hy,lt=dx*v.lx+dy*v.ly;
    let ea,ec;if(o.hx!==undefined){const c=Math.abs(o.hx*v.hx+o.hy*v.hy),s=Math.sqrt(Math.max(0,1-c*c)),L=(o.len||.6)/2,w=(o.wid||.6)/2;ea=L*c+w*s;ec=L*s+w*c}else ea=ec=(o.len||.6)/2;
    if(Math.abs(al)>=v.len/2+ea)continue;const after=Math.abs(lt-sh);if(after<v.wid/2+ec+(squeeze?0:.05)&&after<Math.abs(lt))return true}
  return false}
/* a stall or post in our line within `look` metres: the lateral position (u, within um..uM) that just clears it on whichever side is nearer and has room, or null */
function clearOfStatic(v,look,um,uM){gridQuery(v.x+v.hx*look*.5,v.y+v.hy*look*.5,look*.5+3,QB);let best=null,bd=1e9;
  for(const o of QB){if(!o.static)continue;const dx=o.x-v.x,dy=o.y-v.y,al=dx*v.hx+dy*v.hy;if(al<0||al>look||al>bd)continue;
    const lt=dx*v.lx+dy*v.ly,ec=o.hx!==undefined?(o.len*Math.abs(o.hx*v.lx+o.hy*v.ly)+o.wid*Math.abs(o.hx*v.hx+o.hy*v.hy))/2:o.len/2,need=v.wid/2+ec+.3;if(Math.abs(lt)>=need)continue;
    const h=v.hs||1,a=v.u+(lt-need)/h,b=v.u+(lt+need)/h,okA=a>=um,okB=b<=uM;if(!okA&&!okB)continue;
    bd=al;best=okA&&okB?(Math.abs(a-v.u)<Math.abs(b-v.u)?a:b):okA?a:b}
  return best}
/* gridlock breaker: after half a minute jammed, a driver noses slowly past crossing traffic that is itself standing still (it is how Dhaka knots untie) */
const noseable=(v,o)=>o.hx!==undefined&&!o.static&&o.r&&o.spd<.3&&Math.abs(o.hx*v.hx+o.hy*v.hy)<.7;
const vehicles=[];
function spawnVehicles(dt){
  const rate=trafficRate(),active=vehicles.length;
  for(const sp of spawners){sp.t-=dt*rate*sp.rate;if(sp.t>0)continue;sp.t=mr(.5,1.5);if(active>(FRIDAY?200:620))continue;
    let type,route;if(sp.arm!==undefined){type=wpick({rickshaw:12,auto:28,cng:16,car:16,bus:14,dd:4,bike:14,leguna:5,covan:3,thela:2,cash:HOUR>9&&HOUR<16&&!FRIDAY?1.6:0,coach:HOUR>18||HOUR<1?7:1.2});const ex=wpick(sp.exits);route=armRoutes[sp.arm][+ex]}
    else{route=sp.route;type=route.kind==='lane'?wpick({rickshaw:7,auto:4,bike:2,thela:1}):wpick({rickshaw:28,auto:36,cng:12,bike:14,car:8,thela:6,leguna:4,covan:4})}
    if(!route||route.len<20)continue;const p0=route.pts[0];gridQuery(p0[0],p0[1],14,QB);if(QB.some(o=>Math.hypot(o.x-p0[0],o.y-p0[1])<(VT[type].len+3)))continue;
    const v=mkVeh(type,route);v.s=0;vPlace(v);v.hx=route.pts[1][0]-p0[0];v.hy=route.pts[1][1]-p0[1];const n=Math.hypot(v.hx,v.hy);v.hx/=n;v.hy/=n;v.dx=v.x;v.dy=v.y;v.spd=v.vmax*.5;vehicles.push(v)}
}
const spawners=[];
function genSpawners(){ARMS.forEach((A,a)=>{const ex={};ARMS.forEach((B,b)=>{if(a!==b)ex[b]=B.hw>=10?3:1.6});spawners.push({arm:a,exits:ex,rate:A.hw>=10?1.7:.9,t:Math.random()})});for(const r of sideRoutes)spawners.push({route:r,rate:r.kind==='lane'?.05:.22,t:Math.random()*4})}
function seedQueues(){for(let a=0;a<ARMS.length;a++){const rs=armRoutes[a].filter(Boolean);if(!rs.length)continue;const R0=rs[0];
  for(let s=R0.stopS-2;s>R0.stopS-150;s-=mr(2.2,4)){for(let k=0;k<3;k++){const R=mpick(rs);const type=wpick({rickshaw:12,auto:30,cng:16,car:18,bus:12,bike:16,leguna:4,covan:3,dd:2});const v=mkVeh(type,R);v.s=s-v.len/2;v.u=mr(-1,1);v.tu=v.u;vSnap(v);
    gridQuery(v.x,v.y,8,QB);if(QB.some(o=>Math.abs((o.x-v.x)*v.hx+(o.y-v.y)*v.hy)<(v.len+(o.len||.6))/2&&Math.abs(-(o.x-v.x)*v.hy+(o.y-v.y)*v.hx)<(v.wid+(o.wid||.6))/2+.1))continue;v.spd=0;vehicles.push(v);gridAdd(v)}}}}
function seedTraffic(){seedQueues();for(const R of[...armRoutes.flat(),...sideRoutes]){if(!R)continue;const n=R.kind==='main'?1.6:R.kind==='lane'?1:3;for(let i=0;i<n;i++){const s=R.kind==='main'?clamp(R.stopS-Math.random()*Math.random()*R.stopS,0,R.len):Math.random()*R.len;
  const type=R.kind==='main'?wpick({rickshaw:12,auto:28,cng:16,car:16,bus:14,dd:4,bike:14,leguna:5,covan:3}):wpick({rickshaw:30,auto:36,cng:12,bike:14,car:8,thela:6});const v=mkVeh(type,R);v.s=s;vSnap(v);gridQuery(v.x,v.y,8,QB);if(QB.some(o=>Math.hypot(o.x-v.x,o.y-v.y)<v.len+.5))continue;vehicles.push(v);gridAdd(v)}}}
function helperAnchor(v){return()=>{if(v.dead)return null;const lx=v.hy,ly=-v.hx;return[v.dx+v.hx*(v.len/2-1.6)+lx*(v.wid/2+.35),v.dy+v.hy*(v.len/2-1.6)+ly*(v.wid/2+.35),3.3]}}
function updVehicle(v,dt){
  if(v.parked||v.ride)return;const R=v.r,bus=v.type==='bus'||v.type==='dd';let gap=1e9;
  if(R.stopS!==undefined&&v.s<R.stopS&&!green(R.arm)){const g=R.stopS-v.s-v.len/2;if(g>-1.5)gap=g}
  if(bus){if(v.dwell>0){v.dwell-=dt;gap=0;v.tu=1;if(v.dwell<=0){v.served=v.nextStop;if(v.stopRef){v.stopRef.bus=null;v.stopRef=null}if(Math.random()<.6)say(helperAnchor(v),'helper_ostad_1',2.6,v);sfx('sfx_bus_slap',v.x,v.y)}}
    else{const ns=R.stops&&R.stops.find(x=>x.s>v.s-1&&x!==v.served);v.nextStop=ns;if(ns&&ns.s-v.s<35){v.tu=1;const g=ns.s-v.s;if(g<gap)gap=g;if(g<1.5&&v.spd<.5)busArrive(v,ns)}
      else if(v.spd<.3&&Math.random()<dt*.02&&v.u>.6){v.dwell=mr(3,6);v.nextStop=null;say(helperAnchor(v),mpick(['helper_namen_1','helper_pechone_1','helper_gulistan_1']),2.8,v)}}}
  const look=Math.max(8,v.spd*2.4+v.len);
  const sq=v.squeeze>0,nose=(v.jam||0)>30;if(sq)v.squeeze-=dt;{const g=gapAt(v,0,0,look,sq?.02:.22,sq,nose);if(g.gap<gap)gap=g.gap;v.byPed=!!(g.blk&&g.blk.ped)}   // squeezing: brush past with no spare room, never through
  v.latCd-=dt;const want=Math.max(4.5,v.spd*1.6);
  if(gap<want&&v.latCd<=0&&v.dwell<=0){v.latCd=mr(.5,1.1);let best=null,bg=gap+1.5;const um=v.type==='bike'||v.type==='rickshaw'||v.type==='auto'?-1.15:-1,uM=1.05;
    for(const du of[.35,-.35,.8,-.8]){const u2=clamp(v.u+du,um,uM);if(Math.abs(u2-v.u)<.05)continue;const sh=(u2-v.u)*v.hs;const g=gapAt(v,v.lx*sh,v.ly*sh,look*.85,sq?.02:.22,sq);if(!g.side&&g.gap>bg){bg=g.gap;best=u2}}
    if(best!==null)v.tu=best}
  else if(gap>22&&v.latCd<=0&&!bus){v.latCd=1.2;v.tu+=(v.pu-v.tu)*.35}
  if(v.dwell<=0&&!(bus&&v.tu===1)){v.scanT=(v.scanT||Math.random()*.4)-dt;if(v.scanT<=0){v.scanT=.4;const um=v.type==='bike'||v.type==='rickshaw'||v.type==='auto'?-1.15:-1,u2=clearOfStatic(v,40,um,1.05);if(u2!==null)v.tu=u2}}   // a kerb stall ahead: drift out early, while there is still room
  const du=v.tu-v.u,mx=v.latSpd*dt/Math.max(1,v.hs||1),st=clamp(du,-mx,mx);if(st){if(!sideBlocked(v,st*(v.hs||1),sq,nose)){v.u+=st;v.mergeU=undefined}else v.mergeU=v.tu}else v.mergeU=undefined;
  const minGap=v.type==='rickshaw'||v.type==='auto'||v.type==='bike'||v.type==='thela'?.5:1.1;
  let target=gap<minGap?0:Math.min(v.vmax*(rain>.4?.8:1)*(1-.55*flood),Math.sqrt(2*3.5*(gap-minGap)));if(R.kind==='main'&&Math.hypot(v.x,v.y)<60)target=Math.min(target,v.vmax*.6);if(nose)target=Math.min(target,1.2);
  v.spd+=clamp(target-v.spd,-7*dt,v.T.acc*dt);if(v.spd<0)v.spd=0;v.s+=v.spd*dt;
  const atRed=R.stopS!==undefined&&v.s<R.stopS&&!green(R.arm)&&R.stopS-v.s<v.len+4;
  if(v.spd<.25&&v.dwell<=0&&!atRed){v.stuck+=dt;if(v.stuck>(v.byPed?mr(2,4):mr(7,13))){v.squeeze=1.2;v.stuck=0}}else v.stuck=Math.max(0,v.stuck-dt*2);
  v.honkT-=dt;if(v.honkT<=0){v.honkT=mr(3,11);if(v.spd<v.vmax*.4){v.honk=simT;sfx(bus?'sfx_horn_bus':v.type==='cng'?'sfx_horn_cng':v.type==='bike'||v.type==='auto'?'sfx_horn_bike':v.type==='rickshaw'?'sfx_rickshaw_bell':'sfx_horn_car',v.x,v.y);
    if((v.type==='rickshaw'||v.type==='auto')&&Math.random()<.05)say(()=>[v.dx,v.dy,2],'rickshaw_side_1',2.2,v);if(bus&&Math.random()<.12)say(helperAnchor(v),'helper_vara_1',2.8,v)}}
  v.jam=v.spd<.25&&!atRed&&v.dwell<=0?(v.jam||0)+dt:v.spd>1?0:v.jam||0;if(v.jam>45&&!onScreen(v.x,v.y)){v.dead=true;return}   // hopelessly jammed out of sight: it turns off down a lane
  if(v.s>=R.len){v.dead=true;return}vPlace(v);
}
function busArrive(v,ns){const stop=ns.stop;v.dwell=mr(6,12);v.stopRef=stop;stop.bus=v;v.served=ns;
  say(helperAnchor(v),v.brt?v.brt[2]:'helper_gulistan_1',3,v);sfx('sfx_bus_slap',v.x,v.y);
  const n=1+(Math.random()*3|0);for(let i=0;i<n;i++)later(.5+i*.6,()=>{const ha=helperAnchor(v)();if(!ha)return;const p=spawnPed(true);p.w=stop.walk;p.s=stop.s+mr(-2,2);p.st='go';p.x=ha[0];p.y=ha[1];p.dx=p.x;p.dy=p.y;const o=[];walkPos(walks[p.w],p.s,p.lat,o);p.tx=o[0];p.ty=o[1];p.after='walk';v.paxN=Math.max(4,(v.paxN||20)-1)});
  let ladies=false;for(const p of stop.waiting.slice()){if(p.dead)continue;p.st='board';p.bus=v;if(p.look.female)ladies=true}stop.waiting.length=0;if(ladies)later(2.2,()=>say(helperAnchor(v),'helper_aste_1',2.4))}

