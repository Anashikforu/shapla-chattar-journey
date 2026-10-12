/* ---------------- animals ---------------- */
const pigeons=[],crows=[],dogs=[];
function genAnimals(){
  for(let i=0;i<34;i++){const a=RND()*TAU,r=rr(11.3,15.4);pigeons.push({hx:Math.cos(a)*r,hy:Math.sin(a)*r,x:Math.cos(a)*r,y:Math.sin(a)*r,z:0,st:'ground',ph:RND()*TAU})}
  for(let i=0;i<40&&spans.length;i++){const s=rpick(spans);crows.push({span:s,t:rr(.15,.85),w:(RND()*s.n)|0,st:'sit',x:0,y:0,z:0,ph:RND()*TAU,cd:rr(5,40)})}
  const mk=(kind,x,y,cols)=>dogs.push({kind,x,y,col:rpick(cols),ph:RND()*TAU,fc:RND()<.5?1:-1,st:'rest',t:rr(1,12),fix:false,barkT:rr(5,30)});
  const DOGC=['#c9a36b','#8a6a4a','#e0d0b0','#5a4a3a','#b8a58a'],CATC=['#d9a066','#4a4440','#e8e0d0','#8a8a86','#c9824a'],GOATC=['#e8e0d0','#8a6a4a','#3a3430','#c9b89a'];
  for(const t of trees.slice(0,8))mk('dog',t.x+rr(-2,2),t.y+rr(1,3),DOGC);
  /* Motijheel's streets are full of strays: small packs of two to four sprawled along the footpaths, at the eateries, the station and the mosque */
  const pack=(x,y,n)=>{for(let k=0;k<n;k++)mk('dog',x+rr(-1.6,1.6),y+rr(-1.2,1.2),DOGC)};
  const fp=walks.filter(w=>!w.closed&&w.side!==0&&w.len>40);
  for(let i=0;i<22&&fp.length;i++){const P=rpick(fp),o=[];walkPos(P,rr(8,P.len-8),-(P.sw/2)+.7,o);if(inWorld(o[0],o[1],-20)&&Math.hypot(o[0],o[1])>RSW+6)pack(o[0],o[1],1+(RND()*3|0))}
  const eat=stalls.filter(s=>['hotel','grill','tea','singara'].includes(s.type));   // waiting for scraps where food is cooked
  for(let i=0;i<14&&eat.length;i++){const s=rpick(eat);mk('dog',s.x+s.nx*(s.d/2+1.4)+s.tx*rr(-1.5,1.5),s.y+s.ny*(s.d/2+1.4)+s.ty*rr(-1.5,1.5),DOGC)}
  if(sites.kamalapur)for(let i=0;i<3;i++){const c=FW(sites.kamalapur,rr(10,sites.kamalapur.L-10),rr(6,30));pack(c[0],c[1],2+(RND()*2|0))}
  if(sites.baitul){const c=FW(sites.baitul,rr(6,sites.baitul.L-6),rr(4,12));pack(c[0],c[1],2)}
  const food=stalls.filter(s=>['tea','hotel','grill','singara','fuchka','jhalmuri'].includes(s.type));   // cats hang about where food is
  for(let i=0;i<12&&food.length;i++){const s=rpick(food);mk('cat',s.x+s.nx*(s.d/2+1.1)+s.tx*rr(-1,1),s.y+s.ny*(s.d/2+1.1)+s.ty*rr(-1,1),CATC)}
  for(const F of[sites.baitul,sites.kamalapur,sites.green,sites.mgbhs])if(F)for(let i=0;i<2;i++){const c=FW(F,rr(8,F.L-8),rr(8,F.D-8));mk('goat',c[0],c[1],GOATC)}   // a few goats on the open grounds
}
const PACE={dog:1.5,cat:1.1,goat:.55},ROAM={dog:11,cat:4,goat:7};
const dogLazy=()=>HOUR>10&&HOUR<17?3:lightsOn()>.5?.6:1;   // strays sleep through the day's heat and roam at night
/* strays rest, trot to a spot near home, sniff about, rest again; dogs bark at the avatar and at night */
function updWander(dt){
  for(const d of dogs){
    if(!d.fix){const f=nearestFree(d.x,d.y,10);if(f){d.x=f[0];d.y=f[1]}d.home=[d.x,d.y];d.fix=true}
    d.barkT-=dt;d.t-=dt;
    if(d.st==='rest'){if(d.t<=0){const a=Math.random()*TAU,r=mr(2,ROAM[d.kind]),tx=d.home[0]+Math.cos(a)*r,ty=d.home[1]+Math.sin(a)*r;if(!navAt(tx,ty)&&cellAt(tx,ty)!==2){d.tx=tx;d.ty=ty;d.st='trot'}else d.t=mr(3,8)}}
    else if(d.st==='trot'){const dx=d.tx-d.x,dy=d.ty-d.y,L=Math.hypot(dx,dy),s=Math.min(L,PACE[d.kind]*dt);
      if(L<.2){d.st='sniff';d.t=mr(2,5)}else{const nx=d.x+dx/L*s,ny=d.y+dy/L*s;if(navAt(nx,ny)||cellAt(nx,ny)===2){d.st='rest';d.t=mr(4,12)}else{d.x=nx;d.y=ny;d.ph+=dt*9;const f=sdir(dx,dy);if(Math.abs(f)>.05)d.fc=f>0?1:-1}}}
    else if(d.st==='sniff'){if(d.t<=0){d.st='rest';d.t=mr(6,25)*(d.kind==='dog'?dogLazy():1)}}
    if(d.kind==='dog'&&d.barkT<=0){const near=Math.hypot(d.x-me.x,d.y-me.y)<6,night=lightsOn()>.5;if(near||(night&&Math.random()<.3)){sfx('sfx_bark',d.x,d.y);d.barkT=mr(near?18:25,60)}else d.barkT=mr(5,20)}}}
let flockT=20;
function updAnimals(dt){
  updWander(dt);
  flockT-=dt;if(flockT<=0){flockT=mr(25,60);for(const p of pigeons){p.st='fly';p.fa=Math.atan2(p.y,p.x);p.fr=mr(10,24);p.fz=mr(9,17);p.land=mr(10,20)}}
  for(const p of pigeons){p.ph+=dt*(p.st==='fly'?18:3);
    if(p.st==='fly'){p.fa+=dt*.55;p.x=lerp(p.x,Math.cos(p.fa)*p.fr,dt*1.5);p.y=lerp(p.y,Math.sin(p.fa)*p.fr,dt*1.5);p.z=lerp(p.z,p.fz,dt*1.2);p.land-=dt;if(p.land<=0){p.st='landing';const a=Math.random()*TAU,r=mr(11.3,15.4);p.hx=Math.cos(a)*r;p.hy=Math.sin(a)*r}}
    else if(p.st==='landing'){p.x=lerp(p.x,p.hx,dt*1.2);p.y=lerp(p.y,p.hy,dt*1.2);p.z=lerp(p.z,0,dt*1.3);if(p.z<.1){p.st='ground';p.z=0}}
    else{if(Math.random()<dt*.3){p.hx+=mr(-.5,.5);p.hy+=mr(-.5,.5);const r=Math.hypot(p.hx,p.hy);if(r<11.3||r>15.5){p.hx*=13.4/r;p.hy*=13.4/r}}p.x=lerp(p.x,p.hx,dt);p.y=lerp(p.y,p.hy,dt)}}
  for(const c of crows){c.ph+=dt*16;
    if(c.st==='sit'){const s=c.span,z=7.7-c.w*.45,m=4*c.t*(1-c.t);c.x=lerp(s.a.x,s.b.x,c.t);c.y=lerp(s.a.y,s.b.y,c.t);c.z=z-m*s.sag*(1+c.w*.2)/KZ;c.cd-=dt;
      if(c.cd<=0){c.cd=mr(15,60);c.st='fly';const s2=mpick(spans);c.span=s2;c.t=mr(.15,.85);c.w=(Math.random()*s2.n)|0;c.tx=lerp(s2.a.x,s2.b.x,c.t);c.ty=lerp(s2.a.y,s2.b.y,c.t);c.tz=7.2;c.fx=c.x;c.fy=c.y;c.fz=c.z;c.ft=0;c.fd=Math.max(2,Math.hypot(c.tx-c.x,c.ty-c.y)/9);if(Math.random()<.3)sfx('sfx_crow',c.x,c.y,.7)}}
    else{c.ft+=dt/c.fd;const t=Math.min(1,c.ft);c.x=lerp(c.fx,c.tx,t);c.y=lerp(c.fy,c.ty,t);c.z=lerp(c.fz,c.tz,t)+Math.sin(t*Math.PI)*8;if(t>=1)c.st='sit'}}
}

