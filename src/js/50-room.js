
/* ---------------- inside a restaurant: a pencil-sketched room, drawn live like the street. The tier sets the look. ---------------- */
const roomCv=document.getElementById('room'),rctx=roomCv.getContext('2d');
const ROOM={t:0,k:20,oy:0,R:null,st:null,cook:null,waiter:null,host:null,crowd:[],roomMe:null,say:'',sayT:0,sayAt:[-5.2,-3.1]};
function roomSay(t,at){ROOM.say=t;ROOM.sayT=4;ROOM.sayAt=at||(ROOM.R&&ROOM.R.tier>1?[ROOM.st.speakX,-2.6]:[-5.2,-3.1])}
/* looks per tier. Street eateries vary a little by name so no two feel identical. */
const WALLS=[['#e6d5ae','#7fa3a0'],['#ead9b8','#8fb0a0'],['#e3d0b0','#a6b58a'],['#efe0c4','#7e9fb0']];
function roomStyle(R){
  const h=[...R.name[1]].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)>>>0;
  if(R.tier===3)return{tier:3,wall:'#d8c3a0',dado:'#5a3a28',floor:'#8a2a30',cloth:'#f6f2e6',sign:['#1f1b18','#e8c98a'],curtain:'#8a1f2e',seed:h};
  if(R.tier===2)return{tier:2,wall:'#efe3d0',dado:'#e9dcc0',floor:'#d9c9a8',cloth:['#b8432f','#2e6fa7','#2f7a4f'][h%3],sign:['#2f5a46','#e8c98a'],curtain:'#c9a24a',seed:h};
  const w=WALLS[h%WALLS.length];return{tier:1,wall:w[0],dado:w[1],floor:'#c9b38c',cloth:null,sign:[['#b8432f','#f7f2e6'],['#2f5f8a','#f7f2e6'],['#6b3f8a','#f7f2e6']][h%3],curtain:null,seed:h};
}
function roomEnter(R){
  const S0=roomStyle(R);ROOM.R=R;ROOM.st=S0;ROOM.t=0;
  const cook=makePerson('hawker',false);Object.assign(cook.look,{dress:R.tier===1?'lungi':'pants',c1:R.tier===1?'#f1eee6':'#f7f2e6',c2:R.tier===1?'#3f5f8a':'#2f2d2a',cap:true});Object.assign(cook,{fixed:true,act:'serve',pose:'stand',fc:1});ROOM.cook=cook;
  const staff=(role,c1,c2)=>{const p=makePerson(role,false);Object.assign(p.look,{dress:'pants',c1,c2,cap:false,tie:R.tier===3});Object.assign(p,{fixed:true,act:'serve',pose:'stand',fc:-1});return p};
  ROOM.waiter=R.tier>1?staff('helper',R.tier===3?'#1f1b18':'#f7f2e6',R.tier===3?'#1f1b18':'#2f2d2a'):null;ROOM.host=R.tier===3?staff('banker','#f7f2e6','#1f1b18'):null;
  S0.speakX=R.tier>1?-1.6:-5.2;
  ROOM.crowd=[[0,-3.6,1,'labour'],[1,-2.4,-1,'office'],[2,4.6,1,'student'],[3,6.2,-1,'customer']].map(([i,x,fc,role])=>{const p=makePerson(role,i===3&&R.tier>1);Object.assign(p,{fixed:true,pose:'sit',fc,ph:i});p.rx=x;if(R.tier>1)Object.assign(p.look,{dress:p.look.female?'salwar':'pants',c1:mpick(['#f1eee6','#8fb3d9','#c9d8e8','#9c7bb5'])});return p});
  ROOM.roomMe={look:me.look,fixed:true,pose:'sit',fc:1,ph:0,act:null};
  roomSay(R.tier===1?L2('আসেন ভাই, বসেন! কী খাবেন?','Come in, bhai, sit down! What will you have?'):R.tier===2?L2('স্বাগতম, স্যার! টেবিল রেডি।','Welcome, sir! Your table is ready.'):L2('আসসালামু আলাইকুম, স্যার। আপনার টেবিল প্রস্তুত।','Good evening, sir. Your table is ready.'))}
const RT=(c,x,y,str,m,col,align='left',font=F_BN,weight='')=>{c.save();c.setTransform(DPR,0,0,DPR,0,0);c.font=`${weight} ${(m*ROOM.k).toFixed(1)}px ${font}`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(str,W/2+x*ROOM.k,ROOM.oy+y*ROOM.k);c.restore()};
const RTW=(c,str,m,font=F_BN)=>{c.save();c.setTransform(DPR,0,0,DPR,0,0);c.font=`${(m*ROOM.k).toFixed(1)}px ${font}`;const w=c.measureText(str).width/ROOM.k;c.restore();return w};
function fig(c,p,x,y){const k1=KX,k2=KZ;KX=0;KZ=1;try{drawPerson0(c,p,x,y,3,{noUmb:true})}finally{KX=k1;KZ=k2}}
function rpoly(c,pts,fill,ink,seed,j=.04,a=.8,w=1.1){J=mulberry32(seed+BOIL);if(fill){c.fillStyle=fill;c.globalAlpha=1;fillPoly(c,pts)}if(ink){c.beginPath();spoly(c,pts,j);pencil(c,ink,a,w);c.stroke();c.globalAlpha=1}}
const rrect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
function steam(c,x,y,n,h,seed){c.beginPath();for(let i=0;i<n;i++){const ph=ROOM.t*1.6+i*2.1+seed;c.moveTo(x+(i-(n-1)/2)*.16,y);for(let s=1;s<=8;s++){const f=s/8;c.lineTo(x+(i-(n-1)/2)*.16+Math.sin(ph+f*4)*.1*f,y-f*h)}}pencil(c,INK2,.32,1);c.stroke();c.globalAlpha=1}
function dishArt(c,m,x,y){   // what is on the plate or in the cup, drawn on the table top at (x,y)
  c.globalAlpha=1;
  if(m.cup){c.fillStyle='#f4f1ea';c.beginPath();c.rect(x-.12,y-.3,.24,.26);c.fill();c.fillStyle=m.cup;c.fillRect(x-.1,y-.28,.2,.1);c.beginPath();c.rect(x-.12,y-.3,.24,.26);pencil(c,INK,.8,1);c.stroke();c.globalAlpha=1;return}
  c.fillStyle='#f4f1ea';c.beginPath();c.ellipse(x,y,.42,.11,0,0,TAU);c.fill();c.beginPath();c.ellipse(x,y,.42,.11,0,0,TAU);pencil(c,INK,.8,1);c.stroke();
  const food=m.art||['#f6f2e6','#8a5a2a'];
  c.fillStyle=food[0];c.beginPath();c.ellipse(x-.1,y-.06,.24,.1,0,Math.PI,TAU);c.fill();c.fillStyle=food[1];c.beginPath();c.arc(x+.17,y-.03,.1,Math.PI,TAU);c.fill();
  c.beginPath();c.ellipse(x-.1,y-.06,.24,.1,0,Math.PI,TAU);pencil(c,INK,.6,.9);c.stroke();c.globalAlpha=1}
function curtains(c,x0,x1,y0,y1,col,gold){   // drapes either side of the window, tied back
  for(const sd of[-1,1]){const ex=sd<0?x0:x1,ox=sd*.55;const pts=[[ex-ox*.2,y0-.2],[ex+ox*1.6,y0-.2],[ex+ox*1.2,y1-.5],[ex+ox*.9,y1],[ex-ox*.6,y1+.05]];
    rpoly(c,pts,wash(col,.85),INK,90+sd,.03,.8,1.1);c.beginPath();for(let i=1;i<4;i++){const f=i/4;c.moveTo(ex+(-ox*.2+(ox*1.6-ox*.2)*f)*1,y0-.2);c.lineTo(ex+(-ox*.6+(ox*.9+ox*.6)*f)*1,y1)}pencil(c,shade(col,.6),.4,.8);c.stroke();c.globalAlpha=1;
    if(gold){c.fillStyle='#e8c98a';c.beginPath();circ(c,ex+ox*.45,y1-.9,.09);c.fill()}}
  rpoly(c,rrect(x0-.7,y0-.3,x1+.7,y0-.2),wash('#6b4a32',.9),INK,92)}
function drawRoom(dt){
  ROOM.t+=dt;simT+=dt;audioIndoors(ROOM.R.tier);if(ROOM.sayT>0)ROOM.sayT-=dt;if(eating.dish){eating.t+=dt;if(eating.t>2.2)finishEating()}
  const w=Math.round(W*DPR),h=Math.round(H*DPR);if(roomCv.width!==w||roomCv.height!==h){roomCv.width=w;roomCv.height=h}
  const c=rctx,k=Math.min(W/17,H*.6/8.6),R=ROOM.R,ST=ROOM.st,T=ST.tier,menu=R.menu;ROOM.k=k;ROOM.oy=H*.1+5.2*k;S=k;VEC=true;BOIL=REDUCED?0:Math.floor(ROOM.t*5)%3;
  c.setTransform(DPR,0,0,DPR,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#efe8d8';c.fillRect(0,0,W,H);
  c.setTransform(DPR*k,0,0,DPR*k,DPR*W/2,DPR*ROOM.oy);c.lineCap='round';c.lineJoin='round';
  /* wall, dado, floor: tiles, cream wainscot or dark panelling; tiles, chequer or carpet */
  rpoly(c,rrect(-8,-5,8,0),wash(ST.wall,.6),INK,1,.05,.8,1.3);J=mulberry32(2+BOIL);c.beginPath();hatch(c,rrect(-8,-5,8,-1.5),.9,.34,.05);pencil(c,'#8a7a55',.22,.7);c.stroke();c.globalAlpha=1;
  if(T===1){rpoly(c,rrect(-8,-1.5,8,0),wash(ST.dado,.5),null,3);c.beginPath();for(let x=-8;x<=8;x+=.5){c.moveTo(x,-1.5);c.lineTo(x,0)}for(let y=-1.5;y<=0;y+=.5){c.moveTo(-8,y);c.lineTo(8,y)}pencil(c,'#4a6d6a',.35,.7);c.stroke();c.globalAlpha=1}
  else{const top=T===3?-2.2:-1.3;rpoly(c,rrect(-8,top,8,0),wash(ST.dado,.85),null,3);c.beginPath();for(let x=-8;x<8;x+=1.6){c.moveTo(x+.15,top+.18);c.lineTo(x+1.45,top+.18);c.lineTo(x+1.45,-.18);c.lineTo(x+.15,-.18);c.closePath()}pencil(c,T===3?'#2b1a10':'#a89a78',.55,.9);c.stroke();c.globalAlpha=1;
    c.beginPath();c.moveTo(-8,top);c.lineTo(8,top);pencil(c,T===3?'#e8c98a':'#8a7a55',.8,T===3?2:1.2);c.stroke();c.globalAlpha=1}
  const fl=[[-8,0],[8,0],[9.3,3.3],[-9.3,3.3]];rpoly(c,fl,wash(ST.floor,T===3?.8:.5),INK,4,.05,.8,1.3);
  if(T===1){c.beginPath();for(let x=-8;x<=8;x+=2){c.moveTo(x,0);c.lineTo(x*1.16,3.3)}for(const y of[.7,1.5,2.4])c.moveTo(-8-y*.4,y),c.lineTo(8+y*.4,y);pencil(c,'#8a7a55',.3,.7);c.stroke();c.globalAlpha=1}
  else if(T===2){for(let r=0;r<4;r++)for(let cc=0;cc<8;cc++){if((r+cc)%2)continue;const y0=r*.825,y1=y0+.825,s0=1+y0*.0485,s1=1+y1*.0485,x0=-8+cc*2,x1=x0+2;rpoly(c,[[x0*s0,y0],[x1*s0,y0],[x1*s1,y1],[x0*s1,y1]],wash('#3f3a35',.4),null,5)}c.beginPath();for(let x=-8;x<=8;x+=2){c.moveTo(x,0);c.lineTo(x*1.16,3.3)}pencil(c,'#8a7a55',.3,.7);c.stroke();c.globalAlpha=1}
  else{c.beginPath();c.moveTo(-7.4,.3);c.lineTo(7.4,.3);c.lineTo(8.6,3.0);c.lineTo(-8.6,3.0);c.closePath();pencil(c,'#e8c98a',.85,2);c.stroke();c.beginPath();c.moveTo(-6.9,.55);c.lineTo(6.9,.55);c.lineTo(8,2.75);c.lineTo(-8,2.75);c.closePath();pencil(c,'#e8c98a',.5,1);c.stroke();c.globalAlpha=1}
  /* window onto the street, with a rickshaw going by (curtains in the better places) */
  {const x0=-3.1,x1=-.3,y0=-3.7,y1=-1.9,ww=x1-x0;c.save();c.beginPath();c.rect(x0,y0,ww,y1-y0);c.clip();c.fillStyle=wash(T===3?'#3a4a66':'#cfe3ee',.75);c.fillRect(x0,y0,ww,y1-y0);
  c.fillStyle=wash('#b9b2a0',.7);c.fillRect(x0,-2.5,ww,.6);const rx=x0+((ROOM.t*.5)%1)*(ww+1.6)-.8;c.fillStyle='#c0392b';c.fillRect(rx,-2.9,.9,.5);c.fillStyle='#2f2d2a';c.beginPath();circ(c,rx+.15,-2.35,.14);circ(c,rx+.75,-2.35,.14);c.fill();
  const rx2=x0+((ROOM.t*.3+.5)%1)*(ww+1.2)-.6;c.fillStyle='#2e7d32';c.fillRect(rx2,-3.3,.7,.55);c.restore();
  rpoly(c,rrect(x0,y0,x1,y1),null,INK,5,.04,.85,1.5);c.beginPath();for(let x=x0+ww/4;x<x1-.1;x+=ww/4){c.moveTo(x,y0);c.lineTo(x,y1)}pencil(c,INK,.6,1);c.stroke();c.globalAlpha=1;rpoly(c,rrect(x0-.2,y1,x1+.2,y1+.12),wash('#8a6a4a',.7),INK,6);
  if(ST.curtain)curtains(c,x0,x1,y0,y1,ST.curtain,T===3)}
  /* sign and shelf above the counter */
  rpoly(c,rrect(-7.6,-4.55,-3.9,-3.45),T===1?wash(ST.sign[0],.85):ST.sign[0],T===3?'#e8c98a':INK,7,.05,.85,T===3?2:1.3);{const nm=L2(R.name[0],R.name[1]),fnt=LANG==='en'?F_EN:F_BN,w0=RTW(c,nm,.5,fnt);RT(c,-5.75,-4.0,nm,Math.min(.5,.5*3.4/w0),ST.sign[1],'center',fnt,'600')}   // long names shrink to fit the sign
  rpoly(c,rrect(-7.8,-2.95,-3.6,-2.85),wash('#6b4a32',.8),INK,8);J=mulberry32(9+BOIL);for(let i=0;i<7;i++){const x=-7.5+i*.58,hh=.28+(i*37%5)*.05;rpoly(c,rrect(x,-2.95-hh,x+.34,-2.95),wash(['#c9742a','#7fa36b','#c2185b','#e0b25a','#6d7fb3','#b24b4b','#9c7bb5'][i],.7),INK,10+i,.02,.7,.9)}
  /* wall clock showing the real hour; menu board (chalk) or framed card; pictures in the better places */
  {const cx=1.0,cy=-3.2;c.fillStyle='#f4f1ea';c.beginPath();circ(c,cx,cy,.55);c.fill();J=mulberry32(20+BOIL);c.beginPath();spoly(c,Array.from({length:12},(_,i)=>[cx+Math.cos(i/12*TAU)*.55,cy+Math.sin(i/12*TAU)*.55]),.02);pencil(c,T===3?'#c9a24a':INK,.85,1.4);c.stroke();
  c.beginPath();for(let i=0;i<12;i++){const a=i/12*TAU;c.moveTo(cx+Math.cos(a)*.46,cy+Math.sin(a)*.46);c.lineTo(cx+Math.cos(a)*.52,cy+Math.sin(a)*.52)}pencil(c,INK,.7,.8);c.stroke();
  const ha=(HOUR%12)/12*TAU-Math.PI/2,ma=(HOUR%1)*TAU-Math.PI/2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ha)*.27,cy+Math.sin(ha)*.27);pencil(c,INK,.95,2.2);c.stroke();c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ma)*.42,cy+Math.sin(ma)*.42);pencil(c,INK,.9,1.3);c.stroke();c.globalAlpha=1}
  const board=T===3?'#f1e8d2':T===2?'#2f3a33':'#2f3a33',ink=T===3?'#3a2a1a':'#e9e4d6',gold=T===3?'#8a1f2e':'#e8c98a';
  rpoly(c,rrect(2.7,-4.55,6.9,-2.05),T===3?board:wash('#2f3a33',.9),T===3?'#c9a24a':INK,21,.04,.9,T===3?3:1.6);RT(c,2.95,-4.2,L2('মেন্যু','Menu'),.34,T===3?'#8a1f2e':'#f1eee6','left',F_BN,'600');
  menu.forEach((m,i)=>{const y=-3.8+i*.3;RT(c,2.95,y,LANG==='en'?m.en:m.bn,.25,ink,'left',LANG==='en'?F_EN:F_BN);RT(c,6.65,y,'৳'+m.price,.25,gold,'right',F_EN)});
  if(T>1){for(const[fx,fy,fw,fh,col]of[[7.15,-4.3,.7,.9,'#9fb3bf'],[7.15,-3.2,.7,.7,'#c9a07e']]){rpoly(c,rrect(fx,fy,fx+fw,fy+fh),T===3?'#c9a24a':'#6b4a32',INK,40+fy,.02,.8,1.2);rpoly(c,rrect(fx+.08,fy+.08,fx+fw-.08,fy+fh-.08),wash(col,.8),null,41)}}
  /* lighting: tube and fan (street, good), chandelier (fine), air-conditioner (good) */
  if(T<3){c.fillStyle='rgba(255,248,210,.55)';c.fillRect(1.4,-4.95,2.6,.2);rpoly(c,rrect(1.4,-4.95,4,-4.75),null,INK,22,.02,.8,1);
    const fx=-1.7,fy=-4.5;c.beginPath();c.moveTo(fx,-5);c.lineTo(fx,fy-.12);pencil(c,INK,.8,1.2);c.stroke();for(let i=0;i<3;i++){const a=ROOM.t*7+i*TAU/3,ex=fx+Math.cos(a)*1.4,ey=fy+Math.sin(a)*.22;c.beginPath();c.moveTo(fx,fy);c.lineTo(ex,ey);pencil(c,INK,.75,3.2);c.stroke()}c.fillStyle=wash('#6b4a32',.9);c.beginPath();c.ellipse(fx,fy,.2,.1,0,0,TAU);c.fill();c.globalAlpha=1}
  if(T===2){rpoly(c,rrect(-2.7,-4.85,-.6,-4.3),wash('#f4f1ea',.95),INK,23,.02,.85,1.2);c.beginPath();for(let i=0;i<4;i++){c.moveTo(-2.55,-4.62+i*.1);c.lineTo(-.75,-4.62+i*.1)}pencil(c,INK2,.5,.8);c.stroke();c.globalAlpha=1}
  if(T===3){const cx=0,cy=-4.2;c.beginPath();c.moveTo(cx,-5);c.lineTo(cx,cy-.4);pencil(c,'#c9a24a',.9,1.4);c.stroke();
    c.fillStyle='rgba(255,236,170,.35)';c.beginPath();c.ellipse(cx,cy,2.2,.9,0,0,TAU);c.fill();
    c.beginPath();for(const bx of[-1.3,-.65,0,.65,1.3]){c.moveTo(cx,cy-.35);c.quadraticCurveTo(cx+bx*.5,cy+.05,cx+bx,cy+.15+Math.abs(bx)*.08)}pencil(c,'#c9a24a',.9,1.6);c.stroke();
    for(const bx of[-1.3,-.65,0,.65,1.3]){const by=cy+.15+Math.abs(bx)*.08;c.fillStyle='#fff3c4';c.beginPath();circ(c,cx+bx,by-.08,.1+.012*Math.sin(ROOM.t*5+bx));c.fill();c.beginPath();c.moveTo(cx+bx,by+.02);c.lineTo(cx+bx,by+.3);pencil(c,'#9fb3bf',.7,.8);c.stroke()}c.globalAlpha=1}
  /* staff and the counter on top of the cook's legs */
  fig(c,ROOM.cook,-5.2,-.25);
  if(ROOM.waiter)fig(c,ROOM.waiter,-1.6,1.15);
  if(ROOM.host)fig(c,ROOM.host,7.1,1.1);
  rpoly(c,rrect(-7.8,-1.15,-3.6,0),wash(T===3?'#4a2f22':'#8a6a4a',.6),INK,30,.04,.85,1.4);c.beginPath();for(let x=-7.3;x<-3.7;x+=.55){c.moveTo(x,-1.1);c.lineTo(x,-.03)}pencil(c,'#5a432e',.4,.8);c.stroke();c.globalAlpha=1;
  rpoly(c,[[-7.9,-1.15],[-3.5,-1.15],[-3.35,-1.42],[-7.75,-1.42]],wash(T===3?'#2b1a10':'#6b4a32',.8),INK,31,.03,.85,1.2);
  for(const[x,r,hh]of[[-7.1,.5,.8],[-6.1,.38,.6]]){rpoly(c,rrect(x-r,-1.42-hh,x+r,-1.42),wash(T===1?'#9a9a92':'#c9a24a',.75),INK,32+x,.03,.8,1.1);c.fillStyle=wash(T===1?'#6f6f68':'#8a6a24',.8);c.beginPath();c.ellipse(x,-1.42-hh,r,r*.28,0,0,TAU);c.fill();c.beginPath();c.ellipse(x,-1.42-hh,r,r*.28,0,0,TAU);pencil(c,INK,.8,1);c.stroke();steam(c,x,-1.42-hh-.1,3,1.1,x);c.globalAlpha=1}
  rpoly(c,rrect(-4.45,-1.8,-3.9,-1.42),wash('#b8b2a0',.8),INK,35,.02,.8,1);steam(c,-4.18,-1.85,2,.8,3);
  /* tables, linen, flowers and candles; the player's seat is the middle table */
  const tables=[-3.1,1.4,5.4];
  tables.forEach((tx,ti)=>{
    const ty=2.35;rpoly(c,rrect(tx-1.45,ty-1.07,tx+1.45,ty-.95),wash('#7a5a3a',.75),INK,40+ti,.03,.8,1.1);for(const lx of[-1.3,1.3]){c.beginPath();c.moveTo(tx+lx,ty-.95);c.lineTo(tx+lx,ty-.62);pencil(c,INK,.8,1.6);c.stroke()}c.globalAlpha=1;
    for(const p of ROOM.crowd)if(Math.abs(p.rx-tx)<1.5){p.act=(Math.floor(ROOM.t/2.4+p.ph)%3===0)?null:'eat';p.dx=p.x=p.rx;fig(c,p,p.rx,ty-.55)}
    if(ti===1){ROOM.roomMe.act=eating.dish&&eating.t>.5&&Math.floor(ROOM.t*2)%2?'eat':null;fig(c,ROOM.roomMe,tx-.7,ty-.55)}
    rpoly(c,[[tx-1.5,ty-.95],[tx+1.5,ty-.95],[tx+1.2,ty-1.52],[tx-1.2,ty-1.52]],wash(T===1?'#a88456':ST.cloth,T===1?.65:.9),INK,50+ti,.03,.85,1.3);
    if(T===1){c.beginPath();for(let i=1;i<6;i++){const f=i/6;c.moveTo(tx-1.5+3*f,ty-.95);c.lineTo(tx-1.2+2.4*f,ty-1.52)}pencil(c,'#6b4a32',.28,.7);c.stroke();c.globalAlpha=1}
    rpoly(c,rrect(tx-1.5,ty-.95,tx+1.5,T===1?ty-.82:ty-.5),T===1?wash('#6b4a32',.8):wash(ST.cloth,.85),INK,70+ti,.02,.85,1.1);   // apron, or the cloth hanging down
    if(T>1){c.beginPath();for(let i=1;i<10;i++){c.moveTo(tx-1.5+i*.3,ty-.95);c.lineTo(tx-1.5+i*.3,ty-.5)}pencil(c,shade(ST.cloth,.7),.3,.7);c.stroke();c.globalAlpha=1}
    c.fillStyle='#f4f1ea';c.beginPath();c.rect(tx+.85,ty-1.5,.14,.2);c.fill();pencil(c,INK,.7,.8);c.stroke();c.globalAlpha=1;
    if(T===2){c.fillStyle='#4a7a3a';c.beginPath();c.rect(tx-.95,ty-1.55,.12,.22);c.fill();c.fillStyle='#e0572a';c.beginPath();circ(c,tx-.89,ty-1.6,.1);c.fill();c.fillStyle='#e8c98a';c.beginPath();circ(c,tx-.78,ty-1.57,.07);c.fill()}
    if(T===3){c.fillStyle='#f4f1ea';c.fillRect(tx-.95,ty-1.62,.1,.3);c.fillStyle='#ffb347';c.beginPath();c.ellipse(tx-.9,ty-1.68+.02*Math.sin(ROOM.t*9+ti),.05,.09,0,0,TAU);c.fill();c.fillStyle='rgba(255,200,100,.25)';c.beginPath();circ(c,tx-.9,ty-1.68,.3);c.fill();
      for(const gx of[.55,.75]){c.beginPath();c.moveTo(tx+gx,ty-1.5);c.lineTo(tx+gx,ty-1.35);c.moveTo(tx+gx-.06,ty-1.62);c.lineTo(tx+gx+.06,ty-1.62);c.lineTo(tx+gx,ty-1.5);c.closePath();pencil(c,'#9fb3bf',.9,1);c.stroke();c.globalAlpha=1}}
    if(ti===1){if(eating.dish){dishArt(c,eating.dish,tx-.1,ty-1.25);steam(c,tx-.1,ty-1.4,3,.9,5)}}else dishArt(c,menu[ti===0?0:3],tx-.1+(ti?0:.3),ty-1.25)});
  /* plants in the corners of the fine-dining room */
  if(T===3)for(const px of[-7.5,7.5]){rpoly(c,[[px-.35,2.2],[px+.35,2.2],[px+.25,3.1],[px-.25,3.1]],wash('#8a5a3a',.85),INK,95+px,.02,.8,1.1);c.fillStyle=wash('#4a7a3a',.8);c.beginPath();c.ellipse(px,1.4,.55,.9,0,0,TAU);c.fill();c.beginPath();c.ellipse(px,1.4,.55,.9,0,0,TAU);pencil(c,INK,.6,.9);c.stroke();c.globalAlpha=1}
  /* the speaker's bubble */
  if(ROOM.sayT>0&&ROOM.say){const tw=RTW(c,ROOM.say,.3,LANG==='en'?F_EN:F_BN)+.5,bx=ROOM.sayAt[0],by=ROOM.sayAt[1],pts=rrect(bx-tw/2+.8,by-.28,bx+tw/2+.8,by+.28);c.globalAlpha=Math.min(1,ROOM.sayT);rpoly(c,pts,'#f7f2e6',INK,80,.03,.9,1.2);rpoly(c,[[bx,by+.28],[bx+.15,by+.28],[bx-.1,by+.58]],'#f7f2e6',INK,81,.01,.9,1.1);RT(c,bx+.8,by,ROOM.say,.3,INK,'center',LANG==='en'?F_EN:F_BN);c.globalAlpha=1}
  /* paper grain and vignette, as on the street */
  c.setTransform(DPR,0,0,DPR,0,0);if(!grainPat)grainPat=c.createPattern(grain,'repeat');c.globalCompositeOperation='multiply';c.globalAlpha=.55;c.fillStyle=grainPat;c.fillRect(0,0,W,H);
  c.globalAlpha=1;const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(1,'rgba(150,130,100,.35)');c.fillStyle=vg;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}
