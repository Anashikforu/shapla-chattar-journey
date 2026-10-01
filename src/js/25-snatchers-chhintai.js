/* ---------- snatchers (chhintai) ---------- */
let snatchT=60;
function updSnatch(dt){snatchT-=dt;if(snatchT>0)return;snatchT=mr(70,160);if(cam.zoom<3||HOUR<6||HOUR>23)return;
  const vs=peds.filter(p=>p.st==='walk'&&!p.roam&&onScreen(p.x,p.y)&&(p.act==='phone'||p.look.bag||p.look.female));if(!vs.length)return;const v=mpick(vs);
  const s=spawnPed(true);Object.assign(s,{role:'snatcher',roleText:'Chhintai-kari (snatcher)',w:v.w,s:v.s-v.dir*7,dir:v.dir,lat:v.lat,st:'stalk',victim:v,spd:1.7,visits:9,roam:null});s.look=makeLook('labour',false);s.look.dress='pants';s.look.c1=mpick(['#3a3a3f','#6d7fb3','#8a3f3f']);s.look.cap=Math.random()<.4;pedPlace(s);s.dx=s.x;s.dy=s.y}
function updSnatcher(p,dt){const v=p.victim;
  if(p.st==='stalk'){if(!v||v.dead||v.st!=='walk'){removePed(p);return}const dx=v.x-p.x,dy=v.y-p.y,d=Math.hypot(dx,dy);p.pose='walk';p.ph+=dt*8;if(Math.abs(dx)>.05)p.fc=sdir(dx,dy)>0?1:-1;
    if(d<.9){v.st='shock';v.shockT=5;v.act=null;say(pedAnchor(v),'snatch_victim_1',3,v);p.st='flee';p.fleeT=12;const a=Math.random()*TAU;p.tx=p.x+Math.cos(a)*60;p.ty=p.y+Math.sin(a)*60;
      for(const q of peds){if(q===p||q===v||q.st!=='walk'||q.roam)continue;if(Math.hypot(q.x-p.x,q.y-p.y)<14&&Math.random()<.5){q.st='chase';q.chaseT=mr(4,7);q.target=p}}later(1.2,()=>{const ch=peds.find(q=>q.st==='chase'&&q.target===p);if(ch)say(pedAnchor(ch),'chase_1',2.6,ch)});return}
    const m=Math.min(d,p.spd*dt*(d>4?1.4:1));p.x+=dx/d*m;p.y+=dy/d*m;p.onRoad=isRoad(p.x,p.y);return}
  if(p.st==='flee'){p.fleeT-=dt;const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy)||1;const m=4.8*dt;p.x+=dx/d*m;p.y+=dy/d*m;p.pose='walk';p.ph+=dt*14;p.fc=sdir(dx,dy)>0?1:-1;p.act='run';p.onRoad=isRoad(p.x,p.y);if(p.fleeT<=0)removePed(p)}}
function updChase(p,dt){const t=p.target;p.chaseT-=dt;if(!t||t.dead||p.chaseT<=0){p.st='go';const o=[];walkPos(walks[p.w],p.s,p.lat,o);p.tx=o[0];p.ty=o[1];p.after='walk';if(Math.random()<.4)say(pedAnchor(p),'chase_giveup_1',2.8,p);return}
  const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy)||1,m=3.6*dt;p.x+=dx/d*m;p.y+=dy/d*m;p.pose='walk';p.ph+=dt*12;p.fc=sdir(dx,dy)>0?1:-1;p.onRoad=isRoad(p.x,p.y)}

