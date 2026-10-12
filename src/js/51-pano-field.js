/* ---------------- 360° scene: Arambagh "balur math", the club-para football ground ----------------
   You stand on the touchline of the artificial-turf ground beside BFF House, with the clubs (Mohammedan, Arambagh, Wanderers, Fakirerpool) round it.
   From docs/research/motijheel-reality.md and a news report (bdnews24 video, d7m_fDj5nCU): the sand went years ago but everyone still calls it the
   "balur math"; FIFA-funded artificial turf (relaid Oct 2025); used dawn to dusk by up to six groups at once, cricket academies included; locals play
   from about 3pm into the night; boots are required on the turf (no barefoot football); the national team trains here 2-3 days a week;
   several academies grew up round it (national player Sohel Rana came from here); it floods in the monsoon; "khep" = paid pickup matches.
   [U] = invented or unverified: floodlight towers, pitch size, ball-stop netting, portable goals, kits, the shouts, the academy fee, what the coach says,
   the tea vendor's kettle on a clay stove, the layout of the buildings round the ground.
   World: you at the origin; the touchline is 1.2 m in front of you along X=1.2; the pitch runs X 1.2..56.2 (away from you) and Y -46..46 (right..left as you face it). */
const FD_X0=1.2,FD_X1=56.2,FD_Y=46,FD_CX=(1.2+56.2)/2,FD_GW=7.32,FD_GH=2.44;
const FD={slot:'',key:'',grp:[],chk:0,shT:6,teaT:25,whT:10,blds:null,sky:null,lit:[],occ:[],flood:false,goals:[],cheer:0};
const FD_KIT={moha:{c1:'#f2f2ea',c2:'#1c1c1c',st:'#1c1c1c'},bib:{c1:'#ef7d2d',c2:'#2f3a4d'},red:{c1:'#c0392b',c2:'#f2f2ea'},blue:{c1:'#2e6fa7',c2:'#1c2b4a'},
  green:{c1:'#2e7d32',c2:'#f2f2ea'},acad:{c1:'#e3b23c',c2:'#1f3a6b'},white:{c1:'#f4f1ea',c2:'#f4f1ea'},coach:{c1:'#1f4f8b',c2:'#1f4f8b'}};
/* the shouts: all [U] (from the research notes' list, not heard on the ground) */
const FD_PASS=[['পাস দে!','Pass it!'],['এই পাস দে! খালি আছি!','Pass! I\'m free!'],['ডাইনে দে!','Right side!'],['বল দে!','Give it!']];
const FD_SHOOT=[['মার!','Shoot!'],['মার মামা!','Hit it, mama!'],['মার, মার!','Shoot, shoot!']];
const FD_CALL=[['ফাউল!','Foul!'],['পেছনে!','Behind you!'],['ছাড় ছাড়!','Leave it!'],['ধর ধর!','Close him down!'],['এই রেফারি, ফাউল!','Ref, that\'s a foul!']];
const FD_COACH=[['বল পায়ের কাছে রাখো!','Keep the ball close!'],['মাথা তোলো, মাঠ দেখো!','Head up, see the pitch!'],['শাবাশ! আবার!','Well done! Again!'],['বাঁ পা, বাঁ পা!','Left foot, left foot!'],['জোরে, আরো জোরে!','Faster, faster!']];

function fd_slot(){const h=HOUR;return h<5.2||h>=22.3?'night':h<6.5?'dawn':h<11?'morning':h<15?'noon':h<16.5?'afternoon':h<18?'late':'evening'}
const fd_wet=()=>rain>.5;
function fd_person(role,kit,female){const p=makePerson(role,!!female);
  if(kit){Object.assign(p.look,{dress:'pants',c1:kit.c1,c2:kit.c2||'#2f3a4d',cap:false,gamchha:false,tie:false,bag:false,hasUmb:false});p.jersey=kit.st||null}
  p.fixed=true;p.pose='stand';p.ph=Math.random()*9;return p}
function fd_add(kind,p,X,Y,extra){const a=Object.assign({kind,p,X,Y,tx:X,ty:Y,mode:'idle',wait:1e9,spd:1.2,ph0:Math.random()*9},extra||{});PAN.crowd.push(a);return a}
function fd_say(t,a,force){if(!force&&PAN.sayT>1.4)return;stSay(L2(t[0],t[1]),a)}
const fd_specs=()=>PAN.crowd.filter(a=>a.kind==='spec');
/* walk/run a towards (tx,ty); true while moving */
function fd_move(a,tx,ty,sp,dt){const dx=tx-a.X,dy=ty-a.Y,d=Math.hypot(dx,dy),p=a.p;
  if(d>.25){const m=Math.min(d,sp*dt);a.X+=dx/d*m;a.Y+=dy/d*m;p.pose='walk';p.ph+=m*(sp>3.2?3.4:5.5);const r=Math.hypot(a.X,a.Y)||1,tg=(-a.Y*dx+a.X*dy)/r;if(Math.abs(tg)>.15*d)p.fc=tg>0?1:-1;return true}
  p.pose='stand';return false}
function fd_ballPhys(b,dt,wet){b.X+=b.vx*dt;b.Y+=b.vy*dt;
  if(b.Z>0||b.vz>0){b.vz-=9.8*dt;b.Z+=b.vz*dt;if(b.Z<=0){b.Z=0;if(b.vz<-2.2)b.vz=-b.vz*(wet?.2:.45);else b.vz=0;b.vx*=.85;b.vy*=.85}}
  if(b.Z===0){const fr=Math.pow(wet?.22:.5,dt);b.vx*=fr;b.vy*=fr}}

/* ---- a match: goals G[0] at the low-Y end, G[1] at the high-Y end; team t attacks G[t] ---- */
const fd_goal=(y,big,net,out)=>({x:FD_CX,y,w:big?FD_GW:5,h:big?FD_GH:2,big,net,out});   // out: which way (±1 in Y) the goal's back stays point
function fd_match(G0,G1,n,k0,k1,label,khep){const y0=G0.y,y1=G1.y,box={x0:FD_X0,x1:FD_X1,y0,y1};
  const g={type:'match',box,G:[G0,G1],ball:{X:FD_CX,Y:(y0+y1)/2,Z:0,vx:0,vy:0,vz:0},score:[0,0],pause:1.5,label,khep,pl:[]};
  for(const G of[G0,G1])if(!FD.goals.includes(G))FD.goals.push(G);
  for(let t=0;t<2;t++){const own=g.G[1-t],opp=g.G[t],kit=t?k1:k0;
    for(let i=0;i<n;i++){const kp=i===0,p=fd_person(mpick(['student','labour','office','student']),kit||{c1:mpick(SHIRT),c2:mpick(PANTS)});
      if(kp)p.look.c1=t?'#3d8b4a':'#6b3f8a';   // keepers in their own shirt
      const hx=kp?own.x:mr(box.x0+4,box.x1-4),hy=kp?own.y+Math.sign(opp.y-own.y)*1.2:own.y+(opp.y-own.y)*mr(.15,.8);
      g.pl.push(fd_add('pl',p,clamp(hx+mr(-3,3),box.x0+.5,box.x1-.5),hy+mr(-2,2),{mode:'play',g,team:t,keeper:kp,hx,hy,spd:mr(4.2,5.6),cd:0,kT:0}))}}
  return g}
function fd_updMatch(g,dt){const b=g.ball,B=g.box,wet=fd_wet(),ylo=Math.min(B.y0,B.y1),yhi=Math.max(B.y0,B.y1);
  if(g.pause>0){g.pause-=dt;if(g.pause<=0){b.X=FD_CX;b.Y=(B.y0+B.y1)/2;b.Z=b.vx=b.vy=b.vz=0}}
  else{fd_ballPhys(b,dt,wet);
    if(b.X<B.x0+.3){b.X=B.x0+.3;b.vx=Math.abs(b.vx)*.3}else if(b.X>B.x1-.3){b.X=B.x1-.3;b.vx=-Math.abs(b.vx)*.3}   // out for a throw: put straight back in
    for(let k=0;k<2;k++){const G=g.G[k],sg=k?1:-1;
      if((b.Y-G.y)*sg>0){if(Math.abs(b.X-G.x)<G.w/2&&b.Z<G.h){g.score[k]++;g.pause=4;b.Y=G.y+sg*.7;b.vx=b.vy=b.vz=0;b.Z=0;fd_goalShout(g,k)}
        else{b.Y=G.y-sg*5.5;b.X=G.x+mr(-3,3);b.vx=b.vy=b.vz=0;b.Z=0}}}}   // wide: goal kick
  const live=g.pause<=0,ch=[null,null];
  if(live)for(let t=0;t<2;t++){let bd=1e9;for(const a of g.pl)if(a.team===t&&!a.keeper){const d=Math.hypot(a.X-b.X,a.Y-b.Y);if(d<bd){bd=d;ch[t]=a}}
    const own=g.G[1-t],kp=g.pl.find(a=>a.team===t&&a.keeper);if(kp&&Math.hypot(b.X-own.x,b.Y-own.y)<7&&Math.hypot(kp.X-b.X,kp.Y-b.Y)<bd)ch[t]=kp}
  for(const a of g.pl){const t=a.team,own=g.G[1-t],opp=g.G[t],dir=Math.sign(opp.y-own.y);let tx,ty,sp;
    if(a===ch[t]){tx=b.X;ty=b.Y-dir*.35;sp=a.spd*(wet?.7:1)}
    else if(a.keeper){tx=clamp(own.x+(b.X-own.x)*.3,own.x-own.w/2+.5,own.x+own.w/2-.5);ty=own.y+dir*1.2;sp=3}
    else if(live){tx=a.hx*.55+b.X*.45+Math.sin(PAN.t*.6+a.ph0)*1.5;ty=a.hy*.6+b.Y*.4+Math.cos(PAN.t*.5+a.ph0)*1.5;sp=2.6}
    else{tx=a.hx;ty=a.hy;sp=2}
    fd_move(a,clamp(tx,B.x0+.3,B.x1-.3),clamp(ty,ylo-1,yhi+1),sp,dt);
    if(a.cd>0)a.cd-=dt;if(a.kT>0){a.kT-=dt;if(a.kT<=0)a.p.act=null}
    if(live&&a===ch[t]&&a.cd<=0&&b.Z<.7&&Math.hypot(a.X-b.X,a.Y-b.Y)<.8&&Math.hypot(b.vx,b.vy)<7)fd_kick(g,a,opp,dir)}}
function fd_kick(g,a,G,dir){const b=g.ball,dg=Math.abs(b.Y-G.y)+Math.abs(b.X-G.x)*.5;a.cd=.7;a.p.act='kick';a.kT=.35;
  if(dg<18&&Math.random()<.65){const tx=G.x+mr(-G.w*.75,G.w*.75),ty=G.y+dir,dx=tx-b.X,dy=ty-b.Y,L=Math.hypot(dx,dy)||1,v=mr(13,20);b.vx=dx/L*v;b.vy=dy/L*v;b.vz=mr(0,4);
    if(Math.random()<.5){const s=fd_specs();if(s.length)fd_say(mpick(FD_SHOOT),mpick(s))}}
  else{let best=null,bs=-1e9;for(const m of g.pl){if(m.team!==a.team||m===a||m.keeper)continue;const fw=(m.Y-a.Y)*dir,d=Math.hypot(m.X-a.X,m.Y-a.Y),s=fw*.8-Math.abs(d-14)*.5+mr(-4,4);if(d>3&&s>bs){bs=s;best=m}}
    if(best&&Math.random()<.6){const dx=best.X-b.X,dy=best.Y+dir*1.5-b.Y,L=Math.hypot(dx,dy)||1,lob=L>20&&Math.random()<.5,v=lob?L*.55+4:clamp(L*.9+3,6,17);b.vx=dx/L*v;b.vy=dy/L*v;b.vz=lob?mr(5,8):0;
      if(Math.random()<.22){fd_say(mpick(FD_PASS),best);if(Math.random()<.3)playVoice('player_pass_1',me.x,me.y)}}
    else{const dx=G.x-b.X+mr(-8,8),dy=G.y-b.Y,L=Math.hypot(dx,dy)||1,v=mr(4.5,6.5);b.vx=dx/L*v;b.vy=dy/L*v;b.vz=0}}}
function fd_goalShout(g,k){let sc=null,bd=1e9;for(const a of g.pl)if(a.team===k){const d=Math.hypot(a.X-g.ball.X,a.Y-g.ball.Y);if(d<bd){bd=d;sc=a}}
  fd_say(['গো-ও-ও-ল!','Goooal!'],sc,true);playVoice('player_goal_1',me.x,me.y);FD.cheer=2.5;for(const s of fd_specs())if(Math.random()<.6){s.p.act='wave';s.p.pose='stand'}}

/* ---- the academy: kids queue, dribble through a line of cones, shoot at the goal, jog back ---- */
function fd_drill(n){const g={type:'drill',lanes:[],kids:[],cones:[],balls:[],coach:null};
  for(const lx of[FD_CX-9,FD_CX+9]){const L={x:lx,y0:9,q:[],t:mr(0,2)};for(let i=0;i<6;i++)g.cones.push([lx,12+i*2.6]);
    for(let k=0;k<n;k++){const p=fd_person('kid',FD_KIT.acad);p.look.h=mr(1.3,1.6);const a=fd_add('kid',p,lx+mr(-.2,.2),L.y0-k*1.1,{mode:'play',st:'q',lane:L,spd:mr(2.8,3.5)});L.q.push(a);g.kids.push(a)}
    g.lanes.push(L)}
  const cp=fd_person('office',FD_KIT.coach);cp.look.cap=true;cp.look.beard=Math.random()<.5;g.coach=fd_add('coach',cp,FD_CX,21,{mode:'play'});
  if(!FD.goals.includes(FD.G1))FD.goals.push(FD.G1);return g}
function fd_updDrill(g,dt){
  for(const L of g.lanes){L.t-=dt;L.q.forEach((a,k)=>fd_move(a,L.x,L.y0-k*1.1,2.4,dt));
    const f=L.q[0];if(f&&L.t<=0&&Math.hypot(f.X-L.x,f.Y-L.y0)<.5){L.q.shift();f.st='go';f.i=0;f.path=[];for(let i=0;i<6;i++)f.path.push([L.x+(i%2?-.9:.9),12+i*2.6]);f.path.push([L.x+mr(-1.5,1.5),30.5]);
      f.ball={X:f.X,Y:f.Y+.5,Z:0};L.t=mr(3.5,5.5)}}
  for(const a of g.kids){if(a.st==='q')continue;const L=a.lane;
    if(a.st==='go'){const q=a.path[a.i],mv=fd_move(a,q[0],q[1],a.spd,dt),dx=q[0]-a.X,dy=q[1]-a.Y,d=Math.hypot(dx,dy)||1;a.ball.X=a.X+dx/d*.55;a.ball.Y=a.Y+dy/d*.55;
      if(!mv&&++a.i>=a.path.length){const tx=FD_CX+mr(-4.5,4.5),ty=FD_Y+.5,ex=tx-a.ball.X,ey=ty-a.ball.Y,l=Math.hypot(ex,ey),v=mr(12,17);
        g.balls.push({X:a.ball.X,Y:a.ball.Y,Z:0,vx:ex/l*v,vy:ey/l*v,vz:mr(0,3.5),t:7,on:Math.abs(tx-FD_CX)<FD_GW/2});a.ball=null;a.p.act='kick';a.kT=.4;
        a.st='back';a.i=0;a.path=[[L.x-3,30],[L.x-3,L.y0-L.q.length*1.1-1.5]]}}
    else if(a.st==='back'){if(a.kT>0){a.kT-=dt;if(a.kT<=0)a.p.act=null}const q=a.path[a.i];if(!fd_move(a,q[0],q[1],2.6,dt)&&++a.i>=a.path.length){a.st='q';L.q.push(a)}}}
  for(let i=g.balls.length-1;i>=0;i--){const b=g.balls[i];fd_ballPhys(b,dt,fd_wet());if(b.Y>51.4){b.Y=51.4;b.vy=-Math.abs(b.vy)*.15;b.vx*=.3}   // the ball-stop net behind the goal
    if(b.on&&b.Y>FD_Y&&!b.said){b.said=true;if(Math.random()<.3)fd_say(mpick([['শাবাশ!','Well done!'],['গোল! আবার!','Goal! Again!']]),g.coach)}
    if((b.t-=dt)<=0)g.balls.splice(i,1)}
  const c=g.coach;c.p.act=Math.sin(PAN.t*.4)>.7?'wave':null;c.p.fc=Math.sin(PAN.t*.13)>0?1:-1}

/* ---- cricket in the sandy corner behind the left goal: a tennis ball, a bat, three stumps ---- */
function fd_cricket(academy){const kit=academy?FD_KIT.white:null,mk=()=>{const p=fd_person(academy?'student':'kid',kit);if(!academy){p.look.dress=Math.random()<.5?'lungi':'pants';p.look.c1=mpick(SHIRT)}return p};
  const g={type:'cricket',academy,ball:{X:12,Y:-54,Z:0,vx:0,vy:0,vz:0},st:'wait',t:2,stump:[2.2,-54]};
  g.bat=fd_add('cr',mk(),3.1,-54,{mode:'play',swing:0});g.bat.p.fc=1;
  g.bowl=fd_add('cr',mk(),15,-54,{mode:'play'});
  g.field=[[8,-50.2],[10.5,-58],[5,-58.5],[14,-50.5]].map(([x,y])=>fd_add('cr',mk(),x,y,{mode:'play',hx:x,hy:y}));
  return g}
function fd_updCricket(g,dt){const b=g.ball,bw=g.bowl,bt=g.bat;g.t-=dt;if(bt.swing>0)bt.swing-=dt;
  for(const f of g.field)if(f!==g.chaser)fd_move(f,f.hx,f.hy,2,dt);
  if(g.st==='wait'){b.X=bw.X+.3;b.Y=bw.Y;b.Z=1;const back=fd_move(bw,15.5,-54,1.6,dt);if(!back&&g.t<=0){g.st='run'}}
  else if(g.st==='run'){if(!fd_move(bw,11.6,-54,4.2,dt)){g.st='ball';bw.p.act='kick';b.X=11.3;b.Y=-54;b.Z=2;const v=mr(12,16);b.vx=-v;b.vy=mr(-.4,.4);b.vz=mr(-1.5,.5)}else{b.X=bw.X;b.Y=bw.Y;b.Z=1.1}}
  else if(g.st==='ball'){fd_ballPhys(b,dt,false);if(b.X<=3.6){bw.p.act=null;const r=Math.random();
      if(r<.66){bt.swing=.35;const a=mr(-1.2,1.2),v=mr(7,19);b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v*.8;b.vz=mr(1,7);g.st='hit';g.big=v>16&&b.vz>4;
        if(g.big)fd_say(mpick([['ছক্কা!','Six!'],['চার! চার!','Four! Four!']]),bt)}
      else{bt.swing=.35;g.st='dead';g.t=mr(1.5,2.5);b.vx*=.2;b.vy=0;b.Z=.3;if(r>.86)fd_say(mpick([['আউট! বোল্ড!','Out! Bowled!'],['হাউজ দ্যাট!','Howzat!']]),bw)}}}   // [U] the calls
  else if(g.st==='hit'){fd_ballPhys(b,dt,fd_wet());if(b.Y<-59.6){b.Y=-59.6;b.vy=Math.abs(b.vy)*.4}if(b.X<-3.6){b.X=-3.6;b.vx=Math.abs(b.vx)*.4}if(b.X>16&&b.Y<-49){b.X=16;b.vx=-Math.abs(b.vx)*.4}if(b.Y>-48.5){b.Y=-48.5;b.vy=-Math.abs(b.vy)*.3}
    if(!g.chaser){let bd=1e9;for(const f of g.field){const d=Math.hypot(f.X-b.X,f.Y-b.Y);if(d<bd){bd=d;g.chaser=f}}}
    const f=g.chaser;fd_move(f,b.X,b.Y,3.8,dt);if(Math.hypot(f.X-b.X,f.Y-b.Y)<.6&&b.Z<1.2){g.st='throw';const dx=bw.X-b.X,dy=bw.Y-b.Y,L=Math.hypot(dx,dy)||1,v=Math.max(8,L*1.1);b.X=f.X;b.Y=f.Y;b.Z=1.6;b.vx=dx/L*v;b.vy=dy/L*v;b.vz=L/v*4.9;f.p.act='wave';g.thrower=f}}
  else if(g.st==='throw'){fd_ballPhys(b,dt,false);if(Math.hypot(b.X-bw.X,b.Y-bw.Y)<1||b.Z<=0&&Math.hypot(b.vx,b.vy)<.5){g.st='wait';g.t=mr(1.5,3);if(g.thrower)g.thrower.p.act=null;g.chaser=null}}
  else if(g.st==='dead'&&g.t<=0){g.st='wait';g.t=mr(1,2)}}

/* ---- who is here: rebuilt when the hour, the rain or the day changes ---- */
function fd_specAdd(n){for(let i=0;i<n;i++){const r=Math.random(),side=Math.random()<.5?-1:1;let X,Y,Z=0,sit=false;
    if(r<.5){X=-4.1;Y=side*mr(3.5,44);Z=.8;sit=true}                                   // on the low wall behind you
    else if(r<.8){X=mr(-2.4,-.7);Y=side*mr(3.5,40)}                                    // standing at the touchline
    else if(r<.9){X=mr(58,62);Y=mr(-44,44)}else{X=mr(4,54);Y=side*mr(48.5,50)}         // the far side, behind the goals
    if(Math.hypot(X+3,Y+5)<2.5)Y-=4;
    const fem=FD.slot==='morning'&&Math.random()<.3||Math.random()<.05;   // mothers watching the academy kids
    const p=fd_person(fem?'customer':mpick(['student','labour','office','labour','kid','student']),null,fem);p.pose=sit?'sit':'stand';
    if(!sit&&Math.random()<.25)p.act=mpick(['phone','drink','smoke']);p.fc=Y>0?-1:1;
    fd_add('spec',p,X,Y,{Z,sit})}}
function fd_build(){PAN.crowd.length=0;FD.grp=[];FD.goals=[FD.G0,FD.G1];const s=FD.slot,wet=fd_wet(),fri=FRIDAY;
  FD.PA=fd_goal(-3,false,true,1);FD.PB=fd_goal(3,false,true,-1);
  if(s!=='night'&&!(wet&&(s==='noon'||s==='dawn'))){const t=stMk('tea',-3,-5.4);t.p.fc=1}
  if(s==='night'){const gd=fd_person('labour');Object.assign(gd.look,{dress:'lungi',c1:'#6b5a45',c2:'#3f5f8a'});gd.pose='sit';gd.act='smoke';fd_add('guard',gd,-4.1,7,{Z:.8,sit:true});
    PAN.crowd.push({kind:'sleep',p:makePerson('labour'),X:-3,Y:-11,col:'#7a4a4a',mode:'idle',wait:1e9});return}
  if(s==='dawn'){const C=[[-1.8,-49],[59.5,-49],[59.5,49],[-1.8,49]];for(let i=0;i<(wet?2:9);i++){const old=Math.random()<.6,p=fd_person(old?'customer':'office',old?null:{c1:mpick(['#2e6fa7','#3a3a3f','#c0392b']),c2:'#2f3a4d'},Math.random()<.15);
      if(old&&!p.look.female){p.look.dress=Math.random()<.5?'panjabi':'pants';p.look.c1='#f1eee6'}
      const k=i%4,a=fd_add('walker',p,C[k][0]+(C[(k+1)%4][0]-C[k][0])*Math.random(),C[k][1]+(C[(k+1)%4][1]-C[k][1])*Math.random(),{spd:old?1.25:2.6,ci:(k+1)%4});
      a.next=w=>{w.ci=(w.ci+1)%4;goTo(w,C[w.ci][0],C[w.ci][1])};goTo(a,C[a.ci][0],C[a.ci][1])}
    fd_specAdd(wet?0:2);return}
  if(s==='morning'){if(!wet){FD.grp.push(fd_match(FD.G0,FD.PA,7,FD_KIT.moha,FD_KIT.bib,['ক্লাবের অনুশীলন ম্যাচ','Club practice match'],false));FD.grp.push(fd_drill(5));FD.grp.push(fd_cricket(true))}
    else FD.grp.push(fd_match(FD.G0,FD.PA,4,FD_KIT.moha,FD_KIT.bib,['ক্লাবের অনুশীলন','Club practice'],false));
    fd_specAdd(wet?2:fri?10:7);return}
  if(s==='noon'){if(!wet)FD.grp.push(fd_cricket(false));const gs=fd_person('labour');gs.act='sweep';fd_add('ground',gs,22,-47.5,{});fd_specAdd(wet?1:4);return}
  if(s==='afternoon'||s==='late'){const late=s==='late';
    if(wet)FD.grp.push(fd_match(FD.G0,FD.G1,4,null,FD_KIT.bib,['বৃষ্টিতে পাড়ার খেলা','Rain game, locals'],false));
    else{FD.grp.push(late||fri?fd_match(FD.G0,FD.PA,7,FD_KIT.red,FD_KIT.blue,['খেপের ম্যাচ','Khep match'],true):fd_match(FD.G0,FD.PA,6,null,FD_KIT.bib,['পাড়ার খেলা','Local game'],false));
      FD.grp.push(fri||late?fd_match(FD.PB,FD.G1,fri?7:6,null,FD_KIT.bib,['পাড়ার খেলা','Local game'],false):fd_drill(5));FD.grp.push(fd_cricket(false))}
    fd_specAdd(Math.round((wet?3:late?24:16)*(fri?1.5:1)));return}
  /* evening, under the floodlights */
  if(wet)FD.grp.push(fd_match(FD.G0,FD.PA,4,null,FD_KIT.bib,['বৃষ্টিতে পাড়ার খেলা','Rain game, locals'],false));
  else if(fri){FD.grp.push(fd_match(FD.G0,FD.PA,7,FD_KIT.red,FD_KIT.blue,['খেপের ম্যাচ','Khep match'],true));FD.grp.push(fd_match(FD.PB,FD.G1,6,FD_KIT.green,FD_KIT.bib,['পাড়ার খেলা','Local game'],false))}
  else FD.grp.push(fd_match(FD.G0,FD.G1,8,FD_KIT.red,FD_KIT.blue,['খেপের ম্যাচ','Khep match'],true));
  fd_specAdd(Math.round((wet?2:11)*(fri?1.6:1)))}
function fd_key(){return FD.slot+(fd_wet()?'w':'')+(FRIDAY?'f':'')}
function fd_init(){FD.G0=fd_goal(-FD_Y,true,true,-1);FD.G1=fd_goal(FD_Y,true,false,1);FD.slot=fd_slot();FD.key=fd_key();FD.chk=0;fd_build();
  const s=FD.slot;stSay(s==='night'?L2('রাতে মাঠ ফাঁকা। শুধু পাহারাদার জেগে আছে।','The ground is empty at night. Only the watchman is up.'):s==='noon'?L2('দুপুরের রোদে মাঠ প্রায় ফাঁকা।','The midday sun has emptied the ground.'):fd_wet()?L2('বৃষ্টিতে মাঠে পানি জমেছে, তবু কয়েকজন খেলছে।','The rain has flooded the turf, but a few are still playing.'):s==='dawn'?L2('ভোরের মাঠ। কয়েকজন চারপাশে হাঁটছেন।','The ground at dawn. A few people walking laps.'):L2('আরামবাগের বালুর মাঠ! চারপাশে খেলা চলছে।','Arambagh\'s "balur math"! Games all round you.'))}
function fd_update(dt){
  FD.chk-=dt;if(FD.chk<=0){FD.chk=.5;const s=fd_slot();if(s!==FD.slot||fd_key()!==FD.key){FD.slot=s;FD.key=fd_key();fd_build()}}
  FD.flood=(FD.slot==='evening'||FD.slot==='late')&&HOUR>17.5&&lightsOn()>.1;
  panoWalk(dt);for(const a of PAN.crowd)if(a.kind==='walker'&&a.mode==='idle'&&a.wait>.6)a.wait=.6;
  for(const g of FD.grp)g.type==='match'?fd_updMatch(g,dt):g.type==='drill'?fd_updDrill(g,dt):fd_updCricket(g,dt);
  if(FD.cheer>0){FD.cheer-=dt;if(FD.cheer<=0)for(const s of fd_specs()){s.p.act=null;if(s.sit)s.p.pose='sit'}}
  FD.shT-=dt;if(FD.shT<=0){FD.shT=mr(5,10);const m=FD.grp.filter(g=>g.type==='match');if(m.length){const g=mpick(m),a=mpick(g.pl);fd_say(mpick(FD_CALL.concat(FD_PASS)),a)}}
  FD.whT-=dt;if(FD.whT<=0){FD.whT=mr(10,18);const d=FD.grp.find(g=>g.type==='drill');if(d){sfx('sfx_whistle',me.x,me.y,.5);fd_say(mpick(FD_COACH),d.coach)}}
  FD.teaT-=dt;if(FD.teaT<=0){FD.teaT=mr(35,70);const t=PAN.crowd.find(a=>a.kind==='tea');if(t){fd_say(['চা-আ! গরম চা!','Tea! Hot tea!'],t);playVoice('hawker_tea_1',me.x,me.y)}}}

/* ---- the drawing ---- */
function fd_mkBlds(){const B=[],R=mulberry32(4417),r2=(a,b)=>a+(b-a)*R(),OLD=['#d9a86c','#e0c090','#c98f7a','#b7c6a0','#e3d2a0','#c9a0a0','#a9bfc9','#e8d8c0'];
  const add=(x0,y0,x1,y1,h,col,kind,ex)=>B.push(Object.assign({x0,y0,x1,y1,h,col,kind,seed:B.length*7+1},ex||{}));
  /* behind you, across the lane: the clubs [U: their order and sizes] */
  add(-34,-62,-20,-46,18,OLD[0],'old');
  add(-36,-42,-20,-16,14,'#f2f2ea','club',{stripe:'#1c1c1c',name:['মোহামেডান স্পোর্টিং ক্লাব লিঃ','Mohammedan Sporting Club Ltd.']});
  add(-32,-14,-20,-4,21,OLD[5],'old');
  add(-34,-2,-20,13,11,'#e3e9dc','club',{stripe:'#2e7d32',name:['আরামবাগ ক্রীড়া সংঘ','Arambagh Krira Sangha']});
  add(-30,15,-20,19.5,16,OLD[1],'old');
  add(-32,21,-20,35,10,'#dde6ef','club',{stripe:'#1f4f8b',name:['ঢাকা ওয়ান্ডারার্স ক্লাব','Dhaka Wanderers Club']});
  add(-34,37,-20,60,17,OLD[3],'old');
  /* behind the left goal (+Y): BFF House, the federation's offices */
  add(2,68,36,84,27,'#e8ecef','bff',{name:['বাংলাদেশ ফুটবল ফেডারেশন · বাফুফে ভবন','Bangladesh Football Federation · BFF House']});
  add(40,68,62,80,15,OLD[7],'old');
  /* behind the right goal (-Y) */
  add(2,-82,22,-68,10,'#f1e3c8','club',{stripe:'#b8432f',name:['ফকিরেরপুল ইয়াংমেন্স ক্লাব','Fakirerpool Young Men\'s Club']});
  add(26,-84,46,-68,20,'#c8c1b0','office');add(50,-80,66,-68,12,OLD[4],'old');
  /* across the far touchline, and the corners */
  for(let y=-62;y<60;){const w=r2(12,22);add(74,y,90,Math.min(62,y+w),r2(10,26),OLD[(R()*8)|0],R()<.3?'office':'old');y+=w+r2(2,5)}
  add(-36,-86,-14,-68,22,OLD[2],'old');add(-36,66,-12,86,19,OLD[6],'old');add(70,-86,88,-68,24,'#c4c9c2','office');add(70,66,88,86,16,OLD[1],'old');
  for(const b of B){b.d=Math.hypot(clamp(0,b.x0,b.x1),clamp(0,b.y0,b.y1))}B.sort((a,b)=>b.d-a.d);return B}
function fd_mkSky(){const R=mulberry32(909),o=[];for(let i=0;i<70;i++){const a=R()*TAU-Math.PI,r=125+R()*190,back=Math.cos(a-Math.PI)>.2;   // Motijheel's towers rise behind the clubs [U: direction]
    o.push({a,w:(7+R()*15)/r,r,h:back?32+R()*70:14+R()*30,glass:back&&R()<.45,col:['#cdd3d6','#d8d0c0','#c7cfc4','#d6c9b8'][i%4]})}return o.sort((a,b)=>b.r-a.r)}
const fd_ang=(X,Y)=>wrapA(Math.atan2(Y,X)-PAN.yaw);
const FD_CLOUD=(()=>{const R=mulberry32(313),o=[];for(let i=0;i<11;i++)o.push({a:R()*TAU,r:380+R()*200,z:110+R()*220,w:50+R()*90,h:14+R()*20});return o})();
function fd_clouds(c,night,wet){c.globalAlpha=1;for(const k of FD_CLOUD){const a=k.a+PAN.t*.0015;if(Math.abs(wrapA(a-PAN.yaw))>PAN.half+.5)continue;const q=pj(Math.cos(a)*k.r,Math.sin(a)*k.r,k.z);if(q[1]<-60||q[1]>PAN.hor)continue;
    const s=PAN.F/q[3],w=k.w*s,h=k.h*s;c.fillStyle=night>.5?'rgba(90,96,120,.55)':wet>.4?'rgba(150,155,160,.7)':'rgba(251,248,239,.85)';c.beginPath();c.ellipse(q[0],q[1],w*.5,h*.45,0,0,TAU);c.ellipse(q[0]-w*.28,q[1]+h*.12,w*.3,h*.35,0,0,TAU);c.ellipse(q[0]+w*.3,q[1]+h*.1,w*.28,h*.32,0,0,TAU);c.fill();
    c.strokeStyle=INK;c.globalAlpha=.25;c.lineWidth=1;c.stroke();c.globalAlpha=1}
  if(night<.5&&wet<.5)for(let i=0;i<2;i++){const a=PAN.t*.12*(i?1:-1)+i*2.4,cx=40+i*30,cy=-20+i*50,X=cx+Math.cos(a)*35,Y=cy+Math.sin(a)*35,q=pj(X,Y,70+i*25);if(!seen(q[2]))continue;   // a pair of kites (chil) circling high up
    const f=Math.sin(PAN.t*2+i)*3;c.strokeStyle=INK;c.lineWidth=1.4;c.globalAlpha=.7;c.beginPath();c.moveTo(q[0]-9,q[1]-2+f*.3);c.quadraticCurveTo(q[0]-4,q[1]-5-f,q[0],q[1]);c.quadraticCurveTo(q[0]+4,q[1]-5-f,q[0]+9,q[1]-2+f*.3);c.stroke();c.globalAlpha=1}}
function fd_drawSky(c,night){for(const b of FD.sky){if(Math.abs(wrapA(b.a-PAN.yaw))>PAN.half+.4)continue;const A=[Math.cos(b.a-b.w)*b.r,Math.sin(b.a-b.w)*b.r],B=[Math.cos(b.a+b.w)*b.r,Math.sin(b.a+b.w)*b.r];
  const q=fill3(c,[[A[0],A[1],0],[B[0],B[1],0],[B[0],B[1],b.h],[A[0],A[1],b.h]],b.glass?wash('#8fb0c4',.6):wash(b.col,.7),INK,.35,.8,10);
  if(q&&b.glass){c.beginPath();for(let k=1;k<5;k++){const t=k/5,x=A[0]+(B[0]-A[0])*t,y=A[1]+(B[1]-A[1])*t;line3(c,[[x,y,0],[x,y,b.h]],20)}c.strokeStyle='#5f7f94';c.globalAlpha=.35;c.lineWidth=.8;c.stroke();c.globalAlpha=1}
  if(q&&night>.4){const qa=pj(A[0],A[1],0),qb=pj(B[0],B[1],b.h),J=mulberry32((b.r*1000)|0),x0=Math.min(qa[0],qb[0]),w=Math.abs(qb[0]-qa[0]);for(let k=0;k<6;k++)FD.lit.push([x0+w*(.1+.75*J()),qb[1]+(qa[1]-qb[1])*(.08+.85*J()),Math.max(1.5,w*.08),2])}}}
/* a box seen from outside: the faces that look towards you, with windows and the club stripes */
function fd_bld(c,b,night){const{x0,y0,x1,y1,h}=b,cx=(x0+x1)/2,cy=(y0+y1)/2;const span=Math.atan2(Math.hypot(x1-x0,y1-y0)/2,Math.max(1,b.d));if(Math.abs(fd_ang(cx,cy))>PAN.half+span+.1)return;
  const F=[];if(0<y0)F.push([[x0,y0],[x1,y0],.78,y0/Math.hypot(cx,y0)]);if(0>x1)F.push([[x1,y0],[x1,y1],.95,-x1/Math.hypot(x1,cy)]);if(0>y1)F.push([[x1,y1],[x0,y1],.7,-y1/Math.hypot(cx,y1)]);if(0<x0)F.push([[x0,y1],[x0,y0],.88,x0/Math.hypot(x0,cy)]);
  const J=mulberry32(b.seed),flen=f=>Math.hypot(f[1][0]-f[0][0],f[1][1]-f[0][1]),best=F.reduce((m,f)=>flen(f)>m?flen(f):m,-1);
  for(const[P,Q,lit]of F){const len=Math.hypot(Q[0]-P[0],Q[1]-P[1]),ux=(Q[0]-P[0])/len,uy=(Q[1]-P[1])/len,at=(u,z)=>[P[0]+ux*u,P[1]+uy*u,z],st=Math.max(2,b.d/8);
    const q=fill3(c,[at(0,0),at(len,0),at(len,h),at(0,h)],wash(shade(b.col,lit),b.kind==='bff'?.8:.72),INK,.7,1.1,st);if(!q)continue;
    const main=len>9&&(b.kind==='club'||b.kind==='bff')&&Math.abs(len-best)<.01;
    if(b.kind==='club'&&b.stripe&&main){c.beginPath();for(let u=.8;u<len-1;u+=2.6){const a=pj(...at(u,0)),e=pj(...at(u+1.3,h-1.6));if(seen(a[2]))c.rect(a[0],e[1],e[0]-a[0],a[1]-e[1])}c.fillStyle=b.stripe;c.globalAlpha=.5;c.fill();c.globalAlpha=1}
    if(b.kind==='bff'){c.beginPath();for(let z=3.3;z<h-1;z+=3.3){const a=pj(...at(.6,z)),e=pj(...at(len-.6,z+1.6));if(seen(a[2])&&seen(e[2]))c.rect(a[0],e[1],e[0]-a[0],a[1]-e[1])}c.fillStyle=wash('#4f86a8',.8);c.fill();c.strokeStyle=INK;c.globalAlpha=.4;c.lineWidth=.8;c.stroke();c.globalAlpha=1;
      c.beginPath();for(let u=2;u<len;u+=2.4)line3(c,[at(u,3.3),at(u,h-1)],30);c.strokeStyle='#e8ecef';c.globalAlpha=.6;c.lineWidth=1;c.stroke();c.globalAlpha=1}
    else{const fh=3.2,ww=1.1,wh=1.3,lt=[];c.beginPath();for(let z=1.1;z<h-1.6;z+=fh)for(let u=1;u<len-1.2;u+=2.4){const a=pj(...at(u,z)),e=pj(...at(u+ww,z+wh));if(!seen(a[2]))continue;c.rect(a[0],e[1],e[0]-a[0],a[1]-e[1]);if(night>.3&&J()<.3)lt.push([a[0],e[1],e[0]-a[0],a[1]-e[1]])}
      c.fillStyle=b.kind==='office'?'rgba(40,70,95,.3)':'rgba(47,45,42,.3)';c.fill();c.strokeStyle=INK;c.globalAlpha=.35;c.lineWidth=.7;c.stroke();c.globalAlpha=1;FD.lit.push(...lt)}
    if(main&&b.name){const m=at(len/2,h-.8),bw=Math.min(len-1,b.name[0].length*.72);fill3(c,[at(len/2-bw/2,h-1.5),at(len/2+bw/2,h-1.5),at(len/2+bw/2,h-.1),at(len/2-bw/2,h-.1)],b.kind==='bff'?'#1f4f8b':b.stripe==='#1c1c1c'?'#1c1c1c':shade(b.stripe,.8),INK,.6,1,4);
      label3(c,m[0],m[1],m[2],L2(b.name[0],b.name[1]),1,'#fbf8ef')}
    if(main&&b.kind==='club'){const f=at(len*.2,h),q2=pj(...f),q3=pj(f[0],f[1],h+6);if(seen(q2[2])){const s=PAN.F/q2[3];c.strokeStyle=INK;c.lineWidth=Math.max(1,.12*s);c.beginPath();c.moveTo(q2[0],q2[1]);c.lineTo(q3[0],q3[1]);c.stroke();   // the club flag
      const wv=Math.sin(PAN.t*3+b.seed)*.15*s;c.fillStyle=b.stripe;c.fillRect(q3[0],q3[1],2.2*s,.7*s+wv*.2);c.fillStyle=b.col;c.fillRect(q3[0],q3[1]+.7*s,2.2*s,.7*s)}}}
  if(b.kind==='old'){const tq=pj(cx,cy,h);if(seen(tq[2])){const s=PAN.F/tq[3];c.fillStyle='#2b2b2b';c.fillRect(tq[0]-.6*s,tq[1]-1.4*s,1.2*s,1.4*s)}}}   // the black water tank on the roof
function fd_wall(c,A,B,h,col){const L=Math.hypot(B[0]-A[0],B[1]-A[1]);fill3(c,[[A[0],A[1],0],[B[0],B[1],0],[B[0],B[1],h],[A[0],A[1],h]],wash(col,.8),INK,.55,1,Math.max(1,L/3));ink3(c,[[A[0],A[1],h],[B[0],B[1],h]],INK,.75,1.4,Math.max(1,L/3))}
function fd_tower(c,X,Y){const b=pj(X,Y,0);if(!seen(b[2]))return;const t=pj(X,Y,26),s=PAN.F/b[3];   // floodlight tower [U]
  c.strokeStyle=wash('#7a7d80',.95);c.lineWidth=Math.max(2,.55*s);c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(t[0],t[1]);c.stroke();c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=1;c.stroke();c.globalAlpha=1;
  const dx=FD_CX-X,dy=-Y,L=Math.hypot(dx,dy),vx=-dy/L,vy=dx/L;const P=(u,z)=>[X+vx*u,Y+vy*u,z];
  const q=fill3(c,[P(-2.4,25.3),P(2.4,25.3),P(2.4,28.4),P(-2.4,28.4)],'#3a3c40',INK,.8,1,1);if(!q)return;
  c.fillStyle=FD.flood?'#fffbe8':'#b9bcc0';for(let i=0;i<4;i++)for(let j=0;j<2;j++){const m=pj(...P(-1.8+i*1.2,26+j*1.5));c.beginPath();c.arc(m[0],m[1],Math.max(1,.38*s),0,TAU);c.fill()}}
function fd_net(c,y,x0,x1,h){const out=Math.sign(y);c.beginPath();for(let x=x0;x<=x1+.01;x+=4)line3(c,[[x,y,0],[x,y,h]],4);c.strokeStyle='#4a4d50';c.lineWidth=2;c.globalAlpha=.8;c.stroke();
  const q=fill3(c,[[x0,y,0],[x1,y,0],[x1,y,h],[x0,y,h]],'rgba(70,90,80,.12)',null,0,1,4);if(!q)return;
  c.beginPath();for(let x=x0;x<=x1;x+=1)line3(c,[[x,y,0],[x,y,h]],8);for(let z=1;z<=h;z+=1)line3(c,[[x0,y,z],[x1,y,z]],4);c.strokeStyle=INK;c.globalAlpha=.16;c.lineWidth=.6;c.stroke();c.globalAlpha=1;void out}
function fd_drawGoal(c,G){const d=Math.hypot(G.x,G.y),q=pj(G.x,G.y,0);if(Math.abs(q[2])>PAN.half+.4)return;const s=PAN.F/q[3],w=G.w/2,o=G.out,dp=G.big?1.8:1.1;
  const fr=[[G.x-w,G.y,0],[G.x-w,G.y,G.h],[G.x+w,G.y,G.h],[G.x+w,G.y,0]];
  if(G.net){c.beginPath();for(let x=-w;x<=w+.01;x+=.5)line3(c,[[G.x+x,G.y,G.h],[G.x+x,G.y+o*dp,0]],2);for(let z=.4;z<G.h;z+=.5){const k=1-z/G.h;line3(c,[[G.x-w,G.y+o*dp*k,z],[G.x+w,G.y+o*dp*k,z]],2)}c.strokeStyle=INK;c.globalAlpha=.22;c.lineWidth=.6;c.stroke();c.globalAlpha=1}
  c.beginPath();line3(c,[[G.x-w,G.y,G.h],[G.x-w,G.y+o*dp,0]],2);line3(c,[[G.x+w,G.y,G.h],[G.x+w,G.y+o*dp,0]],2);line3(c,[[G.x-w,G.y+o*dp,0],[G.x+w,G.y+o*dp,0]],2);c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=1;c.stroke();c.globalAlpha=1;
  c.beginPath();line3(c,fr,1);c.strokeStyle=G.big?'#fbf8ef':'#e8e2cf';c.lineWidth=Math.max(2,.12*s);c.stroke();c.strokeStyle=INK;c.globalAlpha=.6;c.lineWidth=.8;c.stroke();c.globalAlpha=1;void d}
function fd_ball(c,b){const g=pj(b.X,b.Y,0);if(!seen(g[2])||g[3]<1)return;const s=PAN.F/g[3],r=Math.max(1.4,.11*s),q=pj(b.X,b.Y,b.Z+.11);
  c.fillStyle='rgba(40,40,30,.25)';c.beginPath();c.ellipse(g[0],g[1],r*1.1,r*.35,0,0,TAU);c.fill();
  c.fillStyle=b.tennis?'#d9e04a':'#fbf8ef';c.beginPath();c.arc(q[0],q[1],r,0,TAU);c.fill();c.strokeStyle=INK;c.lineWidth=Math.max(.6,r*.25);c.stroke();if(r>3&&!b.tennis){c.fillStyle=INK;c.beginPath();c.arc(q[0]+r*.2,q[1]-r*.1,r*.35,0,TAU);c.fill()}}
function fd_cone(c,X,Y){const g=pj(X,Y,0);if(!seen(g[2]))return;const s=PAN.F/g[3];c.fillStyle='#e8762b';c.beginPath();c.moveTo(g[0]-.14*s,g[1]);c.lineTo(g[0]+.14*s,g[1]);c.lineTo(g[0],g[1]-.3*s);c.closePath();c.fill();c.strokeStyle=INK;c.lineWidth=.7;c.globalAlpha=.7;c.stroke();c.globalAlpha=1}
function fd_stumps(c,X,Y){c.beginPath();for(const dy of[-.11,0,.11])line3(c,[[X,Y+dy,0],[X,Y+dy,.71]],1);c.strokeStyle='#e8d9b0';c.lineWidth=2;c.stroke();c.strokeStyle=INK;c.lineWidth=.6;c.globalAlpha=.7;c.stroke();c.globalAlpha=1}
function fd_bat(c,a){const g=pj(a.X,a.Y,0);if(!seen(g[2]))return;const s=PAN.F/g[3],k=a.swing>0?1-a.swing/.35:0,ang=-.5+k*2.8,hx=g[0]+.18*s,hy=g[1]-.85*s;   // the bat, swung through when he hits
  c.strokeStyle='#c9a46a';c.lineWidth=Math.max(1.5,.09*s);c.beginPath();c.moveTo(hx,hy);c.lineTo(hx+Math.sin(ang)*.8*s,hy+Math.cos(ang)*.8*s);c.stroke()}
function fd_teaStall(c){const g=pj(-3.3,-4.2,0);if(!seen(g[2]))return;const s=PAN.F/g[3],x=g[0],y=g[1];   // a low stool, a clay stove with a kettle on it, glasses and a jar of biscuits [U]
  c.fillStyle=wash('#8a5a3a',.85);c.fillRect(x-.45*s,y-.45*s,.9*s,.45*s);c.strokeStyle=INK;c.lineWidth=1;c.strokeRect(x-.45*s,y-.45*s,.9*s,.45*s);
  c.fillStyle=wash('#a0522d',.8);c.fillRect(x-.38*s,y-.75*s,.32*s,.3*s);c.strokeRect(x-.38*s,y-.75*s,.32*s,.3*s);
  c.fillStyle='#6b6b6b';c.beginPath();c.ellipse(x-.22*s,y-.87*s,.15*s,.13*s,0,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(x-.1*s,y-.9*s);c.lineTo(x+.03*s,y-.98*s);c.lineWidth=Math.max(1,.03*s);c.stroke();
  c.fillStyle='#f4f1ea';for(let k=0;k<4;k++){c.fillRect(x+(.02+k*.09)*s,y-.55*s,.06*s,.1*s)}c.fillStyle=wash('#c9b48a',.9);c.fillRect(x+.1*s,y-.85*s,.22*s,.28*s);c.fillStyle='#c0392b';c.fillRect(x+.1*s,y-.88*s,.22*s,.05*s);
  if(lightsOn()<.5&&Math.sin(PAN.t*1.7)>-.2){c.strokeStyle='rgba(240,240,240,.5)';c.lineWidth=1.5;c.beginPath();const sx=x+.03*s,sy=y-1*s;c.moveTo(sx,sy);c.quadraticCurveTo(sx+.1*s,sy-.2*s,sx,sy-.35*s);c.stroke()}}   // steam
function fd_tree(c,X,Y){const b=pj(X,Y,0);if(!seen(b[2]))return;const s=PAN.F/b[3],t=pj(X,Y,5);c.strokeStyle='#5a4a3a';c.lineWidth=Math.max(1.5,.5*s);c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(t[0],t[1]);c.stroke();
  FD.occ.push([t[0],t[1]-1.5*s,6*s,3.2*s]);c.fillStyle=wash('#4f7f43',.75);c.beginPath();c.ellipse(t[0],t[1]-2*s,5*s,2.8*s,0,0,TAU);c.ellipse(t[0]-2.5*s,t[1]-.8*s,3*s,1.8*s,0,0,TAU);c.ellipse(t[0]+2.8*s,t[1]-1*s,3*s,2*s,0,0,TAU);c.fill();c.strokeStyle=INK;c.globalAlpha=.45;c.lineWidth=1;c.stroke();c.globalAlpha=1}
const FD_PUD=[[8,-40,8,5],[50,-42,6,4],[FD_CX,-42,6,3.5],[FD_CX,42,6,3.5],[6,36,7,4.5],[48,30,9,5],[18,-12,5,3],[40,12,6,3.5],[4,-18,3.5,2.6],[54,-6,6,4],[5,7,2.2,1.6],[22,24,5,3]];
function fd_pitch(c){const wet=rain,grass=wet>.5?'#527f45':'#5f9a4a';
  for(let k=0;k<20;k++){const y0=-FD_Y+k*4.6,y1=y0+4.6;fill3(c,[[FD_X0,y0,0],[FD_X1,y0,0],[FD_X1,y1,0],[FD_X0,y1,0]],wash(grass,k%2?.6:.7),null,0,1,3)}
  const ell=(X,Y,rx,ry,col,ink)=>{const P=[];for(let i=0;i<12;i++){const a=i/12*TAU;P.push([X+Math.cos(a)*rx,Y+Math.sin(a)*ry,0])}return fill3(c,P,col,ink,.35,1,2)};
  for(const y of[-FD_Y+3,FD_Y-3])ell(FD_CX,y,4,2.4,wash('#b8a77f',.55));ell(FD_CX,0,2.5,2,wash('#8fae6a',.55));   // worn turf in the goalmouths and the centre spot
  if(wet>.25){const k=Math.min(1,(wet-.25)/.5);for(const[X,Y,rx,ry]of FD_PUD)if(Math.abs(fd_ang(X,Y))<PAN.half+.6){const q=ell(X,Y,rx*k,ry*k,'rgba(150,170,182,.62)',INK);if(q){const m=pj(X-rx*k*.3,Y,0);c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.2;c.beginPath();c.moveTo(m[0]-8,m[1]);c.lineTo(m[0]+10,m[1]);c.stroke()}}}
  /* the lines */
  c.beginPath();const Y=FD_Y,cx=FD_CX,X0=FD_X0,X1=FD_X1;
  line3(c,[[X0,-Y,0],[X1,-Y,0],[X1,Y,0],[X0,Y,0],[X0,-Y,0]],2);line3(c,[[X0,0,0],[X1,0,0]],2);
  const circle=(r,a0,a1,ox,oy)=>{const P=[];for(let i=0;i<=24;i++){const a=a0+(a1-a0)*i/24;P.push([ox+Math.cos(a)*r,oy+Math.sin(a)*r,0])}line3(c,P,1.5)};
  circle(9.15,0,TAU,cx,0);
  for(const sg of[-1,1]){const gy=sg*Y;line3(c,[[cx-20.15,gy,0],[cx-20.15,gy-sg*16.5,0],[cx+20.15,gy-sg*16.5,0],[cx+20.15,gy,0]],2);line3(c,[[cx-9.15,gy,0],[cx-9.15,gy-sg*5.5,0],[cx+9.15,gy-sg*5.5,0],[cx+9.15,gy,0]],2);
    const a0=sg<0?Math.PI*.2:-Math.PI*.8;circle(9.15,a0,a0+Math.PI*.6,cx,gy-sg*11)}
  c.strokeStyle='#f6f2e6';c.globalAlpha=wet>.5?.6:.85;c.lineWidth=2;c.stroke();c.globalAlpha=1}
function fd_draw(c){const night=lightsOn(),wet=rain;FD.lit.length=0;FD.occ.length=0;if(!FD.blds)FD.blds=fd_mkBlds();if(!FD.sky)FD.sky=fd_mkSky();
  const sg=c.createLinearGradient(0,0,0,PAN.hor);sg.addColorStop(0,night>.5?'#34405a':wet>.4?'#a9b0b5':'#cfe0ea');sg.addColorStop(1,night>.5?'#56596a':wet>.4?'#d6d6d0':'#efe8d8');c.fillStyle=sg;c.fillRect(0,0,W,Math.max(0,PAN.hor));
  c.fillStyle=wash(wet>.5?'#a89a80':'#cdbf9f',.85);c.fillRect(0,PAN.hor,W,H-PAN.hor);   // the sandy run-off round the turf (the "balu" of the name)
  fd_clouds(c,night,wet);fd_drawSky(c,night);for(const b of FD.blds)fd_bld(c,b,night);
  for(let y=-60;y<60;y+=10)fill3(c,[[-20,y,0],[-4.3,y,0],[-4.3,y+10,0],[-20,y+10,0]],wash('#8a857c',.55),null,0,1,3);   // the lane behind you
  fd_pitch(c);
  const it=[],D=(X,Y)=>Math.hypot(X,Y),add=(d,f)=>it.push({d,f});
  for(let y=-60;y<60;y+=3)add(D(-4,y+1.5),()=>fd_wall(c,[-4,y],[-4,y+3],.8,'#ddd2bf'));
  for(const sy of[-1,1])for(let x=-4;x<64;x+=6.8)add(D(x+3.4,sy*60),()=>fd_wall(c,[x,sy*60],[x+6.8,sy*60],.8,'#ddd2bf'));
  for(let y=-60;y<60;y+=10)add(D(64,y+5),()=>fd_wall(c,[64,y],[64,y+10],.8,'#ddd2bf'));
  for(const sy of[-1,1]){for(let x=FD_CX-12;x<FD_CX+12;x+=8){const x0=x;add(D(x0+4,sy*52)+.5,()=>fd_net(c,sy*52,x0,x0+8,7.5))}}
  for(const[X,Y]of[[-3,-58],[-3,58],[63,-58],[63,58]])add(D(X,Y),()=>fd_tower(c,X,Y));
  for(const[X,Y]of[[69,-40],[70,-8],[69,22],[70,48],[-9,-62],[-9,62]])add(D(X,Y),()=>fd_tree(c,X,Y));
  for(const G of FD.goals)add(D(G.x,G.y)+.3,()=>fd_drawGoal(c,G));
  add(D(-3.3,-4.2),()=>fd_teaStall(c));
  for(const g of FD.grp){if(g.type==='match'){const b=g.ball;add(D(b.X,b.Y)-.05,()=>fd_ball(c,b))}
    else if(g.type==='drill'){for(const[X,Y]of g.cones)add(D(X,Y)+.1,()=>fd_cone(c,X,Y));for(const k of g.kids)if(k.ball){const b=k.ball;add(D(b.X,b.Y)-.05,()=>fd_ball(c,b))}for(const b of g.balls)add(D(b.X,b.Y)-.05,()=>fd_ball(c,b));
      const pile=[FD_CX+1.2,22];add(D(...pile),()=>{for(let k=0;k<4;k++)fd_ball(c,{X:pile[0]+(k%2)*.25,Y:pile[1]+(k>>1)*.25,Z:0})})}
    else{const b=g.ball;b.tennis=true;add(D(b.X,b.Y)-.05,()=>fd_ball(c,b));add(D(...g.stump)+.1,()=>fd_stumps(c,...g.stump));add(D(g.bat.X,g.bat.Y)-.02,()=>fd_bat(c,g.bat))}}
  for(const a of PAN.crowd)add(D(a.X,a.Y),()=>a.kind==='sleep'?sleeperAt(c,a):figAt(c,a.p,a.X,a.Y,a.Z||0));
  it.sort((a,b)=>b.d-a.d);for(const o of it)o.f();
  fd_night(c,night);
  if(wet>.15){const n=Math.round(170*wet);c.strokeStyle='rgba(80,92,110,.38)';c.lineWidth=1;c.beginPath();for(let i=0;i<n;i++){const x=((i*137.31+PAN.t*30)%W+W)%W,y=((i*71.7+PAN.t*(520+(i%5)*60))%(H+60))-30;c.moveTo(x,y);c.lineTo(x-3,y+15)}c.stroke()}}
function fd_night(c,n){if(n<=.05)return;const fl=FD.flood;
  c.globalCompositeOperation='multiply';c.fillStyle=`rgba(70,80,115,${(fl?.34:.58)*n})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';
  c.fillStyle=`rgba(255,205,120,${.55*n})`;for(const r of FD.lit){const x=r[0]+r[2]/2,y=r[1]+r[3]/2;if(!FD.occ.some(o=>((x-o[0])/o[2])**2+((y-o[1])/o[3])**2<1))c.fillRect(r[0],r[1],r[2],r[3])}
  const glow=(X,Y,Z,rad,a)=>{const q=pj(X,Y,Z);if(!seen(q[2]))return;const r=Math.min(260,rad*PAN.F/q[3]),g=c.createRadialGradient(q[0],q[1],0,q[0],q[1],r);g.addColorStop(0,`rgba(255,246,220,${a})`);g.addColorStop(1,'rgba(255,246,220,0)');c.fillStyle=g;c.fillRect(q[0]-r,q[1]-r,2*r,2*r)};
  if(fl){for(const[X,Y]of[[-3,-58],[-3,58],[63,-58],[63,58]])glow(X,Y,26.8,9,.5*n);
    for(let k=0;k<20;k++){const y0=-FD_Y+k*4.6;fill3(c,[[FD_X0,y0,0],[FD_X1,y0,0],[FD_X1,y0+4.6,0],[FD_X0,y0+4.6,0]],`rgba(255,244,214,${.09*n})`,null,0,1,3)}}
  else for(const Y of[-29,5,28])glow(-20.2,Y,4,2.5,.25*n);   // lamps over the club gates
  c.globalCompositeOperation='source-over'}

/* ---- the panel ---- */
function fd_mainMatch(){const m=FD.grp.filter(g=>g.type==='match');return m.find(g=>g.khep)||m[0]||null}
function fd_sub(){const t=L2(`এখন ${hhmm(HOUR)}। `,`It's ${hhmm(HOUR)}. `),s=FD.slot;
  if(s==='night')return t+L2('রাতে মাঠ ফাঁকা, আলো নেভানো।','The ground is empty and dark at night.');
  if(s==='dawn')return t+L2('ভোরে লোকজন মাঠের চারপাশে হাঁটছে।','At dawn people are walking laps round the ground.');
  const parts=FD.grp.map(g=>g.type==='match'?L2(`${g.label[0]} ${bnNum(g.score[0])}-${bnNum(g.score[1])}`,`${g.label[1]} ${g.score[0]}-${g.score[1]}`):g.type==='drill'?L2('একাডেমির অনুশীলন','academy drills'):g.academy?L2('ক্রিকেট একাডেমি','cricket academy'):L2('কোনায় খালি পায়ে ক্রিকেট','barefoot cricket in the corner'));
  const extra=fd_wet()?L2('। মাঠে পানি জমেছে।','. The turf is waterlogged.'):FD.flood?L2('। ফ্লাডলাইট জ্বলছে।','. The floodlights are on.'):'';
  return t+(parts.length?parts.join(L2(' · ',' · ')):L2('দুপুরে মাঠ প্রায় ফাঁকা।','Almost nobody out in the midday sun.'))+extra}
const FD_ACTS=[
 ['watch',()=>L2('খেলা দেখুন','Watch the match'),0],
 ['join',()=>L2('খেলতে চান?','Ask to join'),0],
 ['tea',()=>L2('এক কাপ চা','A cup of tea'),10],
 ['coach',()=>L2('কোচের সাথে কথা','Talk to the coach'),0],
];
function fd_act(k){const m=fd_mainMatch(),s=FD.slot;
  if(k==='watch'){if(!m){lookAt(FD_CX,0);stSay(s==='noon'?L2('এখন খেলা নেই। বিকাল তিনটার পর থেকে মাঠ জমে।','No match now. The ground fills up after three.'):L2('এখন কোনো খেলা নেই।','No game on right now.'));return}
    lookAt(m.ball.X,m.ball.Y);const[a,b]=m.score,club=m.label[0].startsWith('ক্লাবের');stSay(L2(`${m.label[0]}: ${bnNum(a)}-${bnNum(b)}। ${m.khep?'দুই দলেই টাকায় আনা খেলোয়াড়।':club?'ক্লাবের খেলোয়াড়রা নিজেদের মধ্যে খেলছে।':'পাড়ার ছেলেদের খেলা।'}`,`${m.label[1]}: ${a}-${b}. ${m.khep?'Both sides have paid players in.':club?'The club squad playing among themselves.':'Neighbourhood boys.'}`))}
  else if(k==='join'){if(s==='night'){stSay(L2('রাতে মাঠ বন্ধ, মামা। কাল বিকালে আসেন।','The ground is shut at night, mama. Come tomorrow afternoon.'),PAN.crowd.find(a=>a.kind==='guard'));return}
    if(!m){stSay(L2('বিকালে আসেন, তখন দল হয়। বুট নিয়া আসবেন, টার্ফে খালি পায়ে নামা মানা।','Come in the afternoon, that\'s when teams form. Bring boots: no bare feet on the turf.'));return}
    const a=mpick(m.pl.filter(p=>!p.keeper));lookAt(a.X,a.Y);
    if(m.khep)stSay(L2('এইটা খেপ ভাই, দুই দলই টাকা দিয়া প্লেয়ার আনছে। খেলতে চাইলে বুট নিয়া কাল আসেন, দেখি।','It\'s a khep, brother: both sides paid for players. Bring boots tomorrow and we\'ll see.'),a);
    else if(m.label[0].startsWith('ক্লাবের'))stSay(L2('এইটা ক্লাবের প্র্যাকটিস, বাইরের কেউ নামতে পারবে না।','This is club practice. No outsiders.'),a);
    else if((FRIDAY||fd_wet()||Math.random()<.35)&&STAT.energy>15){stSay(L2('আসেন মামা, ওই দলে একজন কম! বুট আছে তো?','Come on, mama, that side is one short! Got boots?'),a);addEnergy(-12);HOUR=(HOUR+20/60)%24;setTimeout(()=>PANO_ON&&stSay(L2('বিশ মিনিট দৌড়ে হাঁপিয়ে গেলেন। "ভালো খেলছেন!"','Twenty minutes of running and you\'re out of breath. "Good game!"'),a),4600);if(typeof updateStatusUI==='function')updateStatusUI()}
    else stSay(L2('দল ভরা মামা, পরের ম্যাচে আসেন।','Teams are full, mama. Catch the next game.'),a)}
  else if(k==='tea'){const t=PAN.crowd.find(a=>a.kind==='tea');if(!t){stSay(L2('চা-ওয়ালা এখন নেই।','The tea man isn\'t here now.'));return}if(STAT.wallet<10)return;
    lookAt(t.X,t.Y);addMoney(-10);addEnergy(4);HOUR=(HOUR+5/60)%24;playVoice('hawker_tea_1',me.x,me.y);fd_say(['নেন মামা, গরম চা। দশ টাকা।','Here you go, mama, hot tea. Ten taka.'],t,true);updateStatusUI()}
  else if(k==='coach'){const d=FD.grp.find(g=>g.type==='drill');
    if(d){lookAt(d.coach.X,d.coach.Y);fd_say(['সকালে আর বিকালে দুই ব্যাচ। মাসে দেড় হাজার টাকা, বুট নিজের। জাতীয় দলের সোহেল রানাও এই মাঠ থেকে উঠছে।','Two batches, morning and afternoon. Fifteen hundred taka a month, your own boots. Sohel Rana of the national team came up on this ground.'],d.coach,true)}   // [U] the fee and batches
    else{const a=fd_specs()[0]||PAN.crowd[0];if(a)lookAt(a.X,a.Y);stSay(L2('কোচ এখন নাই। সকালে আর বিকালে একাডেমির প্র্যাকটিস হয়। জাতীয় দলও সপ্তাহে দুই-তিন দিন এখানে অনুশীলন করে।','The coach isn\'t here. The academies train mornings and afternoons. The national team trains here two or three days a week too.'),a)}}}
function fd_marks(){const o=[[0,L2('মাঝমাঠ','Halfway')],[78,L2('বাফুফে ভবন','BFF House')],[-82,L2('ক্রিকেট','Cricket')],[-125,L2('মোহামেডান','Mohammedan')],[165,L2('আরামবাগ','Arambagh')],[126,L2('ওয়ান্ডারার্স','Wanderers')]];
  if(FD.grp.some(g=>g.type==='drill'))o.push([35,L2('একাডেমি','Academy')]);if(FD.grp.some(g=>g.type==='match'))o.push([-38,L2('খেলা','Match')]);return o}
PANO_SCENES.push({key:'field',indoor:false,
  places:()=>{const F=typeof fields!=='undefined'&&fields[0];if(!F)return[];const q=FQ(F,-6,F.L+6,-6,F.D+6);return[{name:['আরামবাগ বালুর মাঠ','Arambagh "balur math" (club practice ground)'],q,inside:(x,y)=>inQuad(q,x,y)}]},
  init:fd_init,update:fd_update,draw:fd_draw,sub:fd_sub,acts:FD_ACTS,act:fd_act,marks:fd_marks});
