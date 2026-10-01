/* ---------------- animals ---------------- */
const pigeons=[],crows=[],dogs=[];
function genAnimals(){
  for(let i=0;i<34;i++){const a=RND()*TAU,r=rr(11.3,15.4);pigeons.push({hx:Math.cos(a)*r,hy:Math.sin(a)*r,x:Math.cos(a)*r,y:Math.sin(a)*r,z:0,st:'ground',ph:RND()*TAU})}
  for(let i=0;i<40&&spans.length;i++){const s=rpick(spans);crows.push({span:s,t:rr(.15,.85),w:(RND()*s.n)|0,st:'sit',x:0,y:0,z:0,ph:RND()*TAU,cd:rr(5,40)})}
  for(const t of trees.slice(0,8))dogs.push({x:t.x+rr(-2,2),y:t.y+rr(1,3),col:rpick(['#c9a36b','#8a6a4a','#e0d0b0','#5a4a3a']),ph:RND()*TAU});
}
let flockT=20;
function updAnimals(dt){
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

