/* ---------------- people ---------------- */
const peds=[],fixedPeople=[];
let wCum=null;
function pickWalkBiased(){if(!wCum){wCum=[];let t=0;for(const P of walks){const m=P.pts[P.pts.length>>1];t+=P.len*(Math.exp(-Math.hypot(m[0],m[1])/170)+.05)*(P.closed?2.5:1);wCum.push(t)}}
  const r=Math.random()*wCum[wCum.length-1];let lo=0,hi=wCum.length-1;while(lo<hi){const m=(lo+hi)>>1;if(wCum[m]<r)lo=m+1;else hi=m}return walks[lo]}
function latRange(P){return P.side===0?[-P.sw/2+.4,P.sw/2-.4]:[-P.sw*.12,P.sw/2+1.1]}
function spawnPed(anywhere){
  let role=wpick(Object.fromEntries(Object.entries(ROLES).map(([k,v])=>[k,v.w])));
  if(FRIDAY&&(role==='office'||role==='banker'))role=Math.random()<.5?'labour':'customer';
  let roam=null;const r=Math.random();if(RHY.dawn()&&r<.22)roam='sweeper';else if(r<.03)roam='badam';else if(r<.05)roam='water';else if(r<.06&&HOUR<12)roam='paper';else if(r<.085)roam='porter';
  const p=makePerson(roam?(roam==='water'?'kid':roam==='porter'?'labour':'roam'):role);if(roam){p.roam=roam;if(roam!=='porter')p.role='roam';p.callT=mr(4,15)}
  let P=null,s=0;const o=[];
  for(let k=0;k<14;k++){P=pickWalkBiased();s=Math.random()*P.len;if(anywhere)break;walkPos(P,s,0,o);const sc=toScreen(o[0],o[1]);if(sc[0]<-60||sc[0]>W+60||sc[1]<-60||sc[1]>H+60)break}
  const lr=latRange(P);Object.assign(p,{w:P.id,s,dir:Math.random()<.5?1:-1,lat:mr(lr[0],lr[1]),spd:(p.role==='office'||p.role==='banker'?mr(1.2,1.5):mr(.9,1.25))*(roam==='porter'?.8:1),st:'walk',poiT:Math.random(),visits:0,wait:0});
  p.smoker=Math.random()<.45;
  if(roam==='sweeper'){p.roam='sweeper';p.role='labour';p.look.dress=Math.random()<.55?'sari':'lungi';if(p.look.dress==='sari'){p.look.female=true;p.name=mpick(FEMALE);p.nameBn=FEMALE_BN[p.name]}p.vest=true;p.act='sweep';p.actT=1e9;p.spd=.35;p.lat=latRange(walks[p.w])[1];p.roleText='City corporation sweeper';p.thought='Finish this road before the office crowd comes.'}
  pedPlace(p);p.dx=p.x;p.dy=p.y;
  const inWin=(HOUR>6.8&&HOUR<8.3)||(HOUR>12.2&&HOUR<13.8)||(HOUR>15.8&&HOUR<17.2);if(inWin&&!FRIDAY&&!roam)for(const k of['ideal','mgbhs','ndc']){const F=sites[k];if(!F)continue;const c=FW(F,F.L/2,F.D/2);if(Math.hypot(p.x-c[0],p.y-c[1])<220&&Math.random()<.55){const u=k==='ndc'?collegian():pupil(Math.random()<(k==='ideal'?.5:0));p.look=u.look;p.age=u.age;p.role='student';p.roleText=k==='ndc'?'Student at Notre Dame College':'School pupil in uniform';p.thought=k==='ndc'?u.thought:mpick(['Homework: two pages of Bangla handwriting.','Coaching after school, then home.','Tiffin: bread, egg and a banana.']);break}}
  peds.push(p);return p}
const _o=[0,0,0,0];
function pedPlace(p){const P=walks[p.w];walkPos(P,p.s,p.lat,_o);p.x=_o[0];p.y=_o[1];p.ux=_o[2]*p.dir;p.uy=_o[3]*p.dir;{const sx=sdir(p.ux,p.uy);if(Math.abs(sx)>.3)p.fc=sx>0?1:-1}}

