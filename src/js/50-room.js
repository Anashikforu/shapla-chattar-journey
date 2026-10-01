
/* ---------------- inside the hotel: a pencil-sketched room, drawn live like the street ---------------- */
const roomCv=document.getElementById('room'),rctx=roomCv.getContext('2d');
const ROOM={t:0,k:20,oy:0,cook:null,crowd:[],roomMe:null,say:'',sayT:0};
function roomSay(t){ROOM.say=t;ROOM.sayT=4}
function roomEnter(){
  ROOM.t=0;ROOM.cook=makePerson('hawker',false);Object.assign(ROOM.cook.look,{dress:'lungi',c1:'#f1eee6',c2:'#3f5f8a',cap:true});Object.assign(ROOM.cook,{fixed:true,act:'serve',pose:'stand',fc:1});
  ROOM.crowd=[[0,-3.6,1,'labour'],[1,-2.4,-1,'office'],[2,4.6,1,'student'],[3,6.2,-1,'customer']].map(([i,x,fc,role])=>{const p=makePerson(role,false);Object.assign(p,{fixed:true,pose:'sit',fc,ph:i});p.rx=x;return p});
  ROOM.roomMe={look:me.look,fixed:true,pose:'sit',fc:1,ph:0,act:null};
  roomSay(L2('আসেন ভাই, বসেন! কী খাবেন?','Come in, bhai, sit down! What will you have?'))}
const RT=(c,x,y,str,m,col,align='left',font=F_BN,weight='')=>{c.save();c.setTransform(DPR,0,0,DPR,0,0);c.font=`${weight} ${(m*ROOM.k).toFixed(1)}px ${font}`;c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(str,W/2+x*ROOM.k,ROOM.oy+y*ROOM.k);c.restore()};
const RTW=(c,str,m,font=F_BN)=>{c.save();c.setTransform(DPR,0,0,DPR,0,0);c.font=`${(m*ROOM.k).toFixed(1)}px ${font}`;const w=c.measureText(str).width/ROOM.k;c.restore();return w};
function fig(c,p,x,y){const k1=KX,k2=KZ;KX=0;KZ=1;try{drawPerson0(c,p,x,y,3,{noUmb:true})}finally{KX=k1;KZ=k2}}
function rpoly(c,pts,fill,ink,seed,j=.04,a=.8,w=1.1){J=mulberry32(seed+BOIL);if(fill){c.fillStyle=fill;c.globalAlpha=1;fillPoly(c,pts)}if(ink){c.beginPath();spoly(c,pts,j);pencil(c,ink,a,w);c.stroke();c.globalAlpha=1}}
const rrect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
function steam(c,x,y,n,h,seed){c.beginPath();for(let i=0;i<n;i++){const ph=ROOM.t*1.6+i*2.1+seed;c.moveTo(x+(i-(n-1)/2)*.16,y);for(let s=1;s<=8;s++){const f=s/8;c.lineTo(x+(i-(n-1)/2)*.16+Math.sin(ph+f*4)*.1*f,y-f*h)}}pencil(c,INK2,.32,1);c.stroke();c.globalAlpha=1}
function dishArt(c,m,x,y){   // what is on the plate, drawn on the table top at (x,y)
  c.globalAlpha=1;c.fillStyle='#f4f1ea';c.beginPath();c.ellipse(x,y,.42,.11,0,0,TAU);c.fill();c.beginPath();c.ellipse(x,y,.42,.11,0,0,TAU);pencil(c,INK,.8,1);c.stroke();
  const food={rice:['#f6f2e6','#8a5a2a'],chicken:['#f6f2e6','#c9742a'],kala:['#4a2f22','#d9b46a'],kacchi:['#e3b052','#f6f2e6'],tea:['#a0662a','#f4f1ea']}[m.id];
  if(m.id==='tea'){c.fillStyle='#f4f1ea';c.beginPath();c.rect(x-.12,y-.3,.24,.26);c.fill();c.fillStyle='#a0662a';c.fillRect(x-.1,y-.28,.2,.08);c.beginPath();c.rect(x-.12,y-.3,.24,.26);pencil(c,INK,.8,1);c.stroke();return}
  c.fillStyle=food[0];c.beginPath();c.ellipse(x-.1,y-.06,.24,.1,0,Math.PI,TAU);c.fill();c.fillStyle=food[1];c.beginPath();c.arc(x+.17,y-.03,.1,Math.PI,TAU);c.fill();
  c.beginPath();c.ellipse(x-.1,y-.06,.24,.1,0,Math.PI,TAU);pencil(c,INK,.6,.9);c.stroke();c.globalAlpha=1}
function drawRoom(dt){
  ROOM.t+=dt;simT+=dt;if(ROOM.sayT>0)ROOM.sayT-=dt;if(eating.dish){eating.t+=dt;if(eating.t>2.2)finishEating()}
  const w=Math.round(W*DPR),h=Math.round(H*DPR);if(roomCv.width!==w||roomCv.height!==h){roomCv.width=w;roomCv.height=h}
  const c=rctx,k=Math.min(W/17,H*.6/8.6);ROOM.k=k;ROOM.oy=H*.1+5.2*k;S=k;VEC=true;BOIL=REDUCED?0:Math.floor(ROOM.t*5)%3;
  c.setTransform(DPR,0,0,DPR,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#efe8d8';c.fillRect(0,0,W,H);
  c.setTransform(DPR*k,0,0,DPR*k,DPR*W/2,DPR*ROOM.oy);c.lineCap='round';c.lineJoin='round';
  /* wall, tiled dado, floor */
  rpoly(c,rrect(-8,-5,8,0),wash('#e6d5ae',.6),INK,1,.05,.8,1.3);J=mulberry32(2+BOIL);c.beginPath();hatch(c,rrect(-8,-5,8,-1.5),.9,.34,.05);pencil(c,'#8a7a55',.22,.7);c.stroke();c.globalAlpha=1;
  rpoly(c,rrect(-8,-1.5,8,0),wash('#7fa3a0',.5),null,3);c.beginPath();for(let x=-8;x<=8;x+=.5){c.moveTo(x,-1.5);c.lineTo(x,0)}for(let y=-1.5;y<=0;y+=.5){c.moveTo(-8,y);c.lineTo(8,y)}pencil(c,'#4a6d6a',.35,.7);c.stroke();c.globalAlpha=1;
  rpoly(c,[[-8,0],[8,0],[9.3,3.3],[-9.3,3.3]],wash('#c9b38c',.5),INK,4,.05,.8,1.3);c.beginPath();for(let x=-8;x<=8;x+=2){c.moveTo(x,0);c.lineTo(x*1.16,3.3)}for(const y of[.7,1.5,2.4])c.moveTo(-8-y*.4,y),c.lineTo(8+y*.4,y);pencil(c,'#8a7a55',.3,.7);c.stroke();c.globalAlpha=1;
  /* window onto the street, with a rickshaw going by */
  {const x0=-3.1,x1=-.3,y0=-3.7,y1=-1.9,ww=x1-x0;c.save();c.beginPath();c.rect(x0,y0,ww,y1-y0);c.clip();c.fillStyle=wash('#cfe3ee',.75);c.fillRect(x0,y0,ww,y1-y0);
  c.fillStyle=wash('#b9b2a0',.7);c.fillRect(x0,-2.5,ww,.6);const rx=x0+((ROOM.t*.5)%1)*(ww+1.6)-.8;c.fillStyle='#c0392b';c.fillRect(rx,-2.9,.9,.5);c.fillStyle='#2f2d2a';c.beginPath();circ(c,rx+.15,-2.35,.14);circ(c,rx+.75,-2.35,.14);c.fill();
  const rx2=x0+((ROOM.t*.3+.5)%1)*(ww+1.2)-.6;c.fillStyle='#2e7d32';c.fillRect(rx2,-3.3,.7,.55);c.restore();
  rpoly(c,rrect(x0,y0,x1,y1),null,INK,5,.04,.85,1.5);c.beginPath();for(let x=x0+ww/4;x<x1-.1;x+=ww/4){c.moveTo(x,y0);c.lineTo(x,y1)}pencil(c,INK,.6,1);c.stroke();c.globalAlpha=1;rpoly(c,rrect(x0-.2,y1,x1+.2,y1+.12),wash('#8a6a4a',.7),INK,6)}
  /* sign and shelf above the counter */
  rpoly(c,rrect(-7.6,-4.55,-3.9,-3.45),wash('#b8432f',.85),INK,7,.05,.85,1.3);RT(c,-5.75,-4.0,L2(RESTO.name[0],RESTO.name[1]),.5,'#f7f2e6','center',LANG==='en'?F_EN:F_BN,'600');
  rpoly(c,rrect(-7.8,-2.95,-3.6,-2.85),wash('#6b4a32',.8),INK,8);J=mulberry32(9+BOIL);for(let i=0;i<7;i++){const x=-7.5+i*.58,hh=.28+(i*37%5)*.05;rpoly(c,rrect(x,-2.95-hh,x+.34,-2.95),wash(['#c9742a','#7fa36b','#c2185b','#e0b25a','#6d7fb3','#b24b4b','#9c7bb5'][i],.7),INK,10+i,.02,.7,.9)}
  /* wall clock showing the real hour, chalk menu board */
  {const cx=1.0,cy=-3.2;c.fillStyle='#f4f1ea';c.beginPath();circ(c,cx,cy,.55);c.fill();J=mulberry32(20+BOIL);c.beginPath();spoly(c,Array.from({length:12},(_,i)=>[cx+Math.cos(i/12*TAU)*.55,cy+Math.sin(i/12*TAU)*.55]),.02);pencil(c,INK,.85,1.4);c.stroke();
  c.beginPath();for(let i=0;i<12;i++){const a=i/12*TAU;c.moveTo(cx+Math.cos(a)*.46,cy+Math.sin(a)*.46);c.lineTo(cx+Math.cos(a)*.52,cy+Math.sin(a)*.52)}pencil(c,INK,.7,.8);c.stroke();
  const ha=(HOUR%12)/12*TAU-Math.PI/2,ma=(HOUR%1)*TAU-Math.PI/2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ha)*.27,cy+Math.sin(ha)*.27);pencil(c,INK,.95,2.2);c.stroke();c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ma)*.42,cy+Math.sin(ma)*.42);pencil(c,INK,.9,1.3);c.stroke();c.globalAlpha=1}
  rpoly(c,rrect(2.7,-4.55,6.9,-2.05),wash('#2f3a33',.9),INK,21,.04,.9,1.6);RT(c,2.95,-4.2,L2('মেন্যু','Menu'),.34,'#f1eee6','left',F_BN,'600');
  MENU.forEach((m,i)=>{const y=-3.75+i*.32;RT(c,2.95,y,LANG==='en'?m.en:m.bn,.25,'#e9e4d6','left',LANG==='en'?F_EN:F_BN);RT(c,6.65,y,'৳'+m.price,.25,'#e8c98a','right',F_EN)});
  /* tube light and ceiling fan, kept clear of the window, clock and sign */
  c.fillStyle='rgba(255,248,210,.55)';c.fillRect(1.4,-4.95,2.6,.2);rpoly(c,rrect(1.4,-4.95,4,-4.75),null,INK,22,.02,.8,1);
  {const fx=-1.7,fy=-4.5;c.beginPath();c.moveTo(fx,-5);c.lineTo(fx,fy-.12);pencil(c,INK,.8,1.2);c.stroke();for(let i=0;i<3;i++){const a=ROOM.t*7+i*TAU/3,ex=fx+Math.cos(a)*1.4,ey=fy+Math.sin(a)*.22;c.beginPath();c.moveTo(fx,fy);c.lineTo(ex,ey);pencil(c,INK,.75,3.2);c.stroke()}c.fillStyle=wash('#6b4a32',.9);c.beginPath();c.ellipse(fx,fy,.2,.1,0,0,TAU);c.fill();c.globalAlpha=1}
  /* the cook behind the counter, then the counter on top of his legs */
  fig(c,ROOM.cook,-5.2,-.25);
  rpoly(c,rrect(-7.8,-1.15,-3.6,0),wash('#8a6a4a',.55),INK,30,.04,.85,1.4);c.beginPath();for(let x=-7.3;x<-3.7;x+=.55){c.moveTo(x,-1.1);c.lineTo(x,-.03)}pencil(c,'#5a432e',.4,.8);c.stroke();c.globalAlpha=1;
  rpoly(c,[[-7.9,-1.15],[-3.5,-1.15],[-3.35,-1.42],[-7.75,-1.42]],wash('#6b4a32',.75),INK,31,.03,.85,1.2);
  for(const[x,r,hh]of[[-7.1,.5,.8],[-6.1,.38,.6]]){rpoly(c,rrect(x-r,-1.42-hh,x+r,-1.42),wash('#9a9a92',.75),INK,32+x,.03,.8,1.1);c.fillStyle=wash('#6f6f68',.8);c.beginPath();c.ellipse(x,-1.42-hh,r,r*.28,0,0,TAU);c.fill();c.beginPath();c.ellipse(x,-1.42-hh,r,r*.28,0,0,TAU);pencil(c,INK,.8,1);c.stroke();steam(c,x,-1.42-hh-.1,3,1.1,x);c.globalAlpha=1}
  rpoly(c,rrect(-4.45,-1.8,-3.9,-1.42),wash('#b8b2a0',.8),INK,35,.02,.8,1);steam(c,-4.18,-1.85,2,.8,3);
  /* tables, benches and diners; the player's seat is the middle table */
  const tables=[-3.1,1.4,5.4];
  tables.forEach((tx,ti)=>{
    const ty=2.35;rpoly(c,rrect(tx-1.45,ty-1.07,tx+1.45,ty-.95),wash('#7a5a3a',.75),INK,40+ti,.03,.8,1.1);for(const lx of[-1.3,1.3]){c.beginPath();c.moveTo(tx+lx,ty-.95);c.lineTo(tx+lx,ty-.62);pencil(c,INK,.8,1.6);c.stroke()}c.globalAlpha=1;
    for(const p of ROOM.crowd)if(Math.abs(p.rx-tx)<1.5){p.act=(Math.floor(ROOM.t/2.4+p.ph)%3===0)?null:'eat';p.dx=p.x=p.rx;fig(c,p,p.rx,ty-.55)}
    if(ti===1){ROOM.roomMe.act=eating.dish&&eating.t>.5&&Math.floor(ROOM.t*2)%2?'eat':null;fig(c,ROOM.roomMe,tx-.7,ty-.55)}
    rpoly(c,[[tx-1.5,ty-.95],[tx+1.5,ty-.95],[tx+1.2,ty-1.52],[tx-1.2,ty-1.52]],wash('#a88456',.65),INK,50+ti,.03,.85,1.3);
    c.beginPath();for(let i=1;i<6;i++){const f=i/6;c.moveTo(tx-1.5+3*f,ty-.95);c.lineTo(tx-1.2+2.4*f,ty-1.52)}pencil(c,'#6b4a32',.28,.7);c.stroke();c.globalAlpha=1;
    rpoly(c,rrect(tx-1.5,ty-.95,tx+1.5,ty-.82),wash('#6b4a32',.8),INK,70+ti,.02,.85,1.1);
    c.fillStyle='#f4f1ea';c.beginPath();c.rect(tx+.85,ty-1.5,.14,.2);c.fill();pencil(c,INK,.7,.8);c.stroke();c.globalAlpha=1;
    if(ti===1){if(eating.dish){dishArt(c,eating.dish,tx-.1,ty-1.25);steam(c,tx-.1,ty-1.4,3,.9,5)}}else dishArt(c,MENU[ti===0?0:3],tx-.1+(ti?0:.3),ty-1.25)});
  /* the cook's bubble */
  if(ROOM.sayT>0&&ROOM.say){const tw=RTW(c,ROOM.say,.3,LANG==='en'?F_EN:F_BN)+.5,bx=-5.2,by=-3.1,pts=rrect(bx-tw/2+.8,by-.28,bx+tw/2+.8,by+.28);c.globalAlpha=Math.min(1,ROOM.sayT);rpoly(c,pts,'#f7f2e6',INK,80,.03,.9,1.2);rpoly(c,[[bx,by+.28],[bx+.15,by+.28],[bx-.1,by+.58]],'#f7f2e6',INK,81,.01,.9,1.1);RT(c,bx+.8,by,ROOM.say,.3,INK,'center',LANG==='en'?F_EN:F_BN);c.globalAlpha=1}
  /* paper grain and vignette, as on the street */
  c.setTransform(DPR,0,0,DPR,0,0);if(!grainPat)grainPat=c.createPattern(grain,'repeat');c.globalCompositeOperation='multiply';c.globalAlpha=.55;c.fillStyle=grainPat;c.fillRect(0,0,W,H);
  c.globalAlpha=1;const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(1,'rgba(150,130,100,.35)');c.fillStyle=vg;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}
