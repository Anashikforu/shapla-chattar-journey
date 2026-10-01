/* ---------------- step ---------------- */
let STEPN=0;
const onScreen=(x,y)=>x>VX0-22&&x<VX1+22&&y>VY0-22&&y<VY1+22;
function step(dt){
  simT+=dt;HOUR=(HOUR+dt*CLOCK_RATE/60)%24;
  if(RAIN_MODE==='auto'){rainTimer-=dt*CLOCK_RATE/60;if(rainTimer<=0){if(rainTarget>0){rainTarget=0;rainTimer=mr(1.5,5)}else if(Math.random()<.08){rainTarget=mr(.55,1);rainTimer=mr(.3,.8)}else rainTimer=mr(2,5)}}else rainTarget=RAIN_MODE==='on'?1:0;
  const was=rain;rain+=clamp(rainTarget-rain,-dt*.08,dt*.08);flood=clamp(flood+(rain>.7?dt*.006:-dt*.0025),0,1);
  if(was<.3&&rain>=.3){const vis=peds.filter(p=>p.st==='walk'&&onScreen(p.x,p.y));for(let i=0;i<2&&vis.length;i++){const p=mpick(vis);say(pedAnchor(p),'rain_1',2.6,p)}}
  phaseT+=dt;if(phaseT>=PHASE_LEN){phaseT=0;phase=1-phase;const pd=mpick(podiums.filter(p=>p.cop));if(pd){sfx('sfx_whistle',pd.x,pd.y);say(pedAnchor(pd.cop),Math.random()<.5?'police_stop_1':'police_go_1',2.6,pd.cop)}}
  for(let i=events.length-1;i>=0;i--)if(events[i].t<=simT){const e=events[i];events.splice(i,1);e.f()}
  spawnVehicles(dt);
  const tgt=pedTarget();if(peds.length<tgt){for(let i=0;i<6&&peds.length<tgt;i++)spawnPed()}else if(peds.length>tgt+30){const p=peds[(Math.random()*peds.length)|0];if(p.st==='walk'&&!onScreen(p.x,p.y)&&p!==cam.follow)removePed(p)}
  grid.clear();for(const v of vehicles)gridAdd(v);for(const o of staticObs)gridAdd(o);for(const p of peds)if(p.onRoad)gridAdd({x:p.x,y:p.y,len:.6,wid:.6,ped:true});
  for(const v of vehicles)updVehicle(v,dt);
  for(let i=vehicles.length-1;i>=0;i--)if(vehicles[i].dead){const v=vehicles[i];if(cam.follow===v){cam.follow=null;toast('They rode off the edge of the sketch.');hideCard()}vehicles.splice(i,1)}
  STEPN++;for(let i=0;i<peds.length;i++){const p=peds[i];if(Math.abs(p.x-cam.x)>260||Math.abs(p.y-cam.y)>200){if((i+STEPN)%3===0)updPed(p,dt*3)}else updPed(p,dt)}
  for(let i=peds.length-1;i>=0;i--)if(peds[i].dead)peds.splice(i,1);
  updFixed(dt);updPlayers(dt);updCrowds(dt);updTrain(dt);updBridges(dt);updSnatch(dt);updMetro(dt);updAnimals(dt);
  for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];if(simT-b.t0>b.dur||(b.owner&&b.owner.dead))bubbles.splice(i,1)}
  const k=Math.min(1,dt*8);for(const v of vehicles){v.dx+=(v.x-v.dx)*k;v.dy+=(v.y-v.dy)*k}for(const p of peds){p.dx+=(p.x-p.dx)*k;p.dy+=(p.y-p.dy)*k}
  audioTick(dt);
}
