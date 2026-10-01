/* ---------------- boot ---------------- */
function boot(){
  genRoads();genMask();genZebras();hatchImg=makeHatch();hatchPat=ctx.createPattern(hatchImg,'repeat');
  genBuildings();genWalks();genTrees();genPoles();genStalls();genStops();genPolice();genCounters();genBridges();genUnipoles();genMetro();genRoutes();genStands();genSpawners();genAnimals();
  buildGroundSprite();buildMini();
  for(let i=0;i<pedTarget();i++)spawnPed(true);
  grid.clear();for(const o of staticObs)gridAdd(o);for(const v of vehicles)gridAdd(v);seedTraffic();
  for(let k=0;k<260;k++){spawnVehicles(.2);grid.clear();for(const v of vehicles)gridAdd(v);for(const o of staticObs)gridAdd(o);for(const v of vehicles)updVehicle(v,.2);for(let i=vehicles.length-1;i>=0;i--)if(vehicles[i].dead)vehicles.splice(i,1);phaseT+=.2;if(phaseT>=PHASE_LEN){phaseT=0;phase=1-phase}}
  for(const v of vehicles){v.dx=v.x;v.dy=v.y}bubbles.length=0;events.length=0;
  for(const b of buildings)makeSprite(b);
  initAvatar();
  simT=0;updateVoiceUI();loadBundled();
  $('loading').classList.add('done');setTimeout(()=>$('loading').remove(),700);
  let last=performance.now(),acc=0,uiT=0,miniT=0;
  function frame(now){let dt=Math.min(.1,(now-last)/1000);last=now;
    if(!PAUSED){acc+=dt;let n=0;while(acc>=1/30&&n<3){step(1/30);acc-=1/30;n++}if(n===3)acc=0}
    if(cam.follow){const f=cam.follow;cam.tx=(f.fixed?f.x:f.dx)+KX;cam.ty=(f.fixed?f.y:f.dy)-KZ}
    cam.tx=clamp(cam.tx,-E-40,E+40);cam.ty=clamp(cam.ty,-E-120,E+40);const k=1-Math.pow(.0015,dt);cam.zoom+=(cam.tz-cam.zoom)*k;cam.x+=(cam.tx-cam.x)*k;cam.y+=(cam.ty-cam.y)*k;
    render();uiT-=dt;if(uiT<=0){uiT=.4;updateClock();updateCard()}miniT-=dt;if(miniT<=0&&getComputedStyle(mini).display!=='none'){miniT=.2;drawMini()}if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').hidden=true}
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
}
(document.fonts&&document.fonts.load?Promise.race([Promise.all([document.fonts.load('16px Atma'),document.fonts.load('16px Kalam')]),new Promise(r=>setTimeout(r,1500))]):Promise.resolve()).then(()=>setTimeout(boot,30));
