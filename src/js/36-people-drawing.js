/* ---------------- people drawing ---------------- */
function drawPerson(c,p,x,y,lod,extra){if(p.hidden)return;c.save();c.translate(x,y);if(VIEW.th)c.rotate(-VIEW.th);const k1=KX,k2=KZ;KX=VIEW.kx0;KZ=VIEW.kz0;try{drawPerson0(c,p,0,0,lod,extra)}finally{KX=k1;KZ=k2;c.restore()}}
function drawPerson0(c,p,x,y,lod,extra){
  const L=p.look,H=L.h*1.12,fc=p.fc||1,pose=p.pose||'stand';
  const q=(u,v)=>[x+u*fc+KX*v*H,y-KZ*v*H];
  if(p.hidden)return;
  if(lod===0){c.fillStyle=L.c1;c.globalAlpha=1;const a=q(0,.5);c.fillRect(a[0]-.45,a[1]-.6,.9,1.2);return}
  const ph=p.ph||0,sw=pose==='walk'?Math.sin(ph):0;
  c.lineCap='round';c.lineJoin='round';c.globalAlpha=1;
  if(lod===1){
    const lo=pose==='sit'?.28:pose==='squat'?.18:.08,hi=pose==='sit'?.62:pose==='squat'?.5:.84;
    c.strokeStyle=L.c1;c.lineWidth=.42;c.beginPath();let a=q(0,lo+.1),b=q(0,hi);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
    c.strokeStyle=L.dress==='lungi'?L.c2:INK;c.lineWidth=.14;c.beginPath();a=q(sw*.18,0);b=q(0,lo+.15);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);a=q(-sw*.18,0);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
    const hd=q(0,hi+.1);c.fillStyle=L.skin;c.beginPath();circ(c,hd[0],hd[1],.16);c.fill();
    if(rain>.35&&L.hasUmb&&!p.fixed&&pose!=='sit'){c.fillStyle=L.umbCol;c.beginPath();c.ellipse(hd[0],hd[1]-.35,.6,.25,0,Math.PI,TAU);c.fill()}
    return}
  // ---- full figure ----
  let up=0,hip,kL,kR,fL,fR,lean=0;
  if(pose==='sit'){hip=[0,.3];kL=[.27,.31];kR=[.31,.29];fL=[.29,.0];fR=[.35,.01];up=-.2}
  else if(pose==='squat'){hip=[-.06,.2];kL=[.18,.34];kR=[.22,.31];fL=[.1,0];fR=[.16,0];up=-.3}
  else if(pose==='pedal'){const a=ph,cx=.24,cy=.2,r=.1;hip=[-.04,.54];fL=[cx+Math.cos(a)*r,cy+Math.sin(a)*r];fR=[cx-Math.cos(a)*r,cy-Math.sin(a)*r];kL=[(hip[0]+fL[0])/2+.13,(hip[1]+fL[1])/2+.07];kR=[(hip[0]+fR[0])/2+.13,(hip[1]+fR[1])/2+.07];up=.04;lean=.08}
  else{const s=sw*.2;hip=[0,.5];if(pose==='walk'){fL=[s,0];fR=[-s,0];kL=[s*.55+.02,.26];kR=[-s*.55+.02,.26]}else{fL=[-.07,0];fR=[.07,0];kL=[-.06,.26];kR=[.06,.26]}}
  const long=L.dress==='sari'||L.dress==='borka';
  const legCol=L.dress==='lungi'||L.dress==='sari'||L.dress==='borka'?L.skin:L.female?shade(L.c2,1.1):L.c2;
  const LW=v=>{c.lineWidth=v};
  const line=(pts,col,w)=>{c.strokeStyle=col;LW(w);c.beginPath();let a=q(pts[0][0],pts[0][1]);c.moveTo(a[0],a[1]);for(let i=1;i<pts.length;i++){a=q(pts[i][0],pts[i][1]);c.lineTo(a[0],a[1])}c.stroke()};
  const poly=(pts,col)=>{c.fillStyle=col;c.beginPath();let a=q(pts[0][0],pts[0][1]);c.moveTo(a[0],a[1]);for(let i=1;i<pts.length;i++){a=q(pts[i][0],pts[i][1]);c.lineTo(a[0],a[1])}c.closePath();c.fill()};
  // legs
  if(!(long&&(pose==='stand'||pose==='walk'))){line([hip,kR,fR],legCol,.12);line([hip,kL,fL],legCol,.12)}
  else{line([[-.05,.1],fR],legCol,.1);line([[.05,.1],fL],legCol,.1)}
  c.fillStyle='#3a2f28';for(const f of[fL,fR]){const a=q(f[0]+.05,f[1]);c.fillRect(a[0]-.1,a[1]-.05,.2,.08)}
  // lower garments
  const wv=.57+up,sh=.82+up,ls=lean;
  if(pose==='sit'||pose==='squat'){
    const gc=L.dress==='lungi'?L.c2:long?L.c1:L.dress==='salwar'?L.c1:L.c2;
    if(L.dress!=='pants'&&L.dress!=='panjabi'){line([[hip[0],hip[1]+.03],[kR[0],kR[1]+.02]],gc,.26);if(long)line([kR,[fR[0],.04]],gc,.2)}
  }else if(L.dress==='lungi')poly([[-.17,wv],[.17,wv],[.2,.2],[-.2,.2]],L.c2);
  else if(L.dress==='sari')poly([[-.16,wv],[.16,wv],[.24,.02],[-.24,.02]],L.c1);
  else if(L.dress==='borka')poly([[-.18,sh+.02],[.18,sh+.02],[.26,.02],[-.26,.02]],L.c1);
  if(L.dress==='lungi'&&lod>2&&pose!=='sit'&&pose!=='squat'){line([[-.18,.42],[.18,.42]],shade(L.c2,.6),.025);line([[-.18,.3],[.19,.3]],shade(L.c2,.6),.025);line([[0,wv],[.02,.2]],shade(L.c2,.6),.025)}
  if(L.dress==='sari'&&pose!=='sit'&&pose!=='squat')line([[-.24,.05],[.24,.05]],L.c2,.06);
  // torso
  const topEnd=L.dress==='panjabi'||L.dress==='salwar'?(pose==='sit'||pose==='squat'?hip[1]+up*0:.3):wv;
  const tc=L.dress==='sari'?L.c2:L.dress==='borka'?L.c1:L.c1;
  poly([[-.19+ls,sh],[.19+ls,sh],[.16,Math.min(wv,topEnd+ (pose==='sit'?.2:0))],[-.16,Math.min(wv,topEnd+(pose==='sit'?.2:0))]].map((v,i)=>v),tc);
  if(L.dress==='panjabi'&&pose!=='sit')poly([[-.17,wv],[.17,wv],[.19,.3],[-.19,.3]],L.c1);
  if(L.dress==='salwar'&&pose!=='sit')poly([[-.17,wv],[.17,wv],[.2,.32],[-.2,.32]],L.c1);
  if(L.dress==='sari')poly([[.16,wv],[.2+ls,sh],[.06+ls,sh],[-.16,wv-.06]],L.c1);
  if(L.dress==='salwar')line([[-.18+ls,sh-.04],[.18+ls,sh-.1]],L.c2,.07);
  if(L.tie)line([[.02+ls,sh-.02],[.02,wv+.02]],'#7b1f2e',.04);
  if(p.vest){poly([[-.18+ls,sh-.02],[.18+ls,sh-.02],[.15,wv+.02],[-.15,wv+.02]],'#c8e63c');line([[-.16,(sh+wv)/2],[.17+ls,(sh+wv)/2]],'#f39c12',.05);line([[-.16,(sh+wv)/2-.1],[.16+ls,(sh+wv)/2-.1]],'#f39c12',.05)}
  if(p.jersey){for(let k=-2;k<=2;k++)line([[k*.07+ls,sh-.02],[k*.06,wv+.02]],p.jersey,.03)}
  if(p.guardCap||p.role==='police')line([[-.16,wv+.02],[.16,wv+.02]],'#3a2f28',.04);
  // outline torso
  c.strokeStyle=INK;c.globalAlpha=.55;LW(.9/S);c.beginPath();let a=q(-.19+ls,sh),b=q(-.16,wv);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);a=q(.19+ls,sh);b=q(.16,wv);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.globalAlpha=1;
  // arms
  const shL=[-.15+ls,sh-.03],shR=[.15+ls,sh-.03];let hL=[-sw*.2+ls,.5+up],hR=[sw*.2+ls+.02,.5+up];
  const act=p.act,t=simT;
  if(act==='phone')hR=[.12+ls,.92+up];
  else if(act==='pour'){const k=(Math.sin(t*2.6)+1)/2;hR=[.28+ls,.8+up+k*.28];hL=[.3+ls,.55+up]}
  else if(act==='shake'){const k=Math.sin(t*22)*.05;hR=[.3+ls,.72+up+k];hL=[.26+ls,.66+up+k]}
  else if(act==='chop'){const k=Math.max(0,Math.sin(t*5));hR=[.3+ls-k*.05,.62+up+k*.35];hL=[.28,.55+up]}
  else if(act==='serve'){const k=Math.sin(t*3);hR=[.3+ls,.66+up+k*.05];hL=[.25,.62+up]}
  else if(act==='police'){if(phase===0){hL=[-.55,sh-.02];hR=[.55,sh-.02]}else{const k=Math.sin(t*4);hR=[.25+k*.12,sh+.28];hL=[-.2,.5]}}
  else if(act==='drink')hR=[.1+ls,.88+up];
  else if(act==='smoke')hR=[.08+ls,.9+up];
  else if(act==='sweep'){const k=Math.sin(t*3+x);hR=[.25+k*.15,.55+up];hL=[.15+k*.15,.72+up]}
  else if(act==='eat')hR=[.1+ls,.86+up],hL=[.18,.7+up];
  else if(act==='carry'){hR=[.14+ls,.66+up];hL=[.1+ls,.64+up]}
  else if(act==='hang'){hR=[.06,sh+.3];hL=[-.3,.62]}
  else if(act==='handle'){hR=[.4+ls,.72+up];hL=[.38+ls,.7+up]}
  else if(act==='wave'){const k=Math.sin(t*6);hR=[.22+k*.1,sh+.3]}
  else if(act==='stick'){const k=Math.sin(t*2+x);hR=[.3,sh+.12+k*.12];hL=[-.12,.5+up]}
  else if(act==='load'){hL=[-.12,.99+up];hR=[.12,.99+up]}
  else if(act==='crank'){hR=[.32+Math.cos(t*3)*.12,.74+up+Math.sin(t*3)*.12];hL=[.25,.6+up]}
  else if(act==='kick'){const k=Math.sin(ph);hR=[-.25*k,.55+up];hL=[.25*k,.55+up]}
  if(pose==='sit'&&!act){hL=[.12,.52+up*.3];hR=[.18,.5+up*.3]}
  const umb=rain>.35&&L.hasUmb&&!p.fixed&&pose!=='sit'&&!extra?.noUmb;
  if(umb)hL=[.05+ls,.95+up];
  const sleeve=L.dress==='sari'?L.c2:L.dress==='borka'?L.c1:L.c1;
  const elbow=(s,h)=>[(s[0]+h[0])/2+(h[1]>s[1]?.06:0),(s[1]+h[1])/2-.02];
  line([shL,elbow(shL,hL),hL],sleeve,.085);line([shR,elbow(shR,hR),hR],sleeve,.085);
  c.fillStyle=L.skin;for(const h of[hL,hR]){const a=q(h[0],h[1]);c.beginPath();circ(c,a[0],a[1],.05);c.fill()}
  // held things
  if(act==='phone'){const a=q(hR[0]+.02,hR[1]);c.fillStyle='#222';c.fillRect(a[0]-.03,a[1]-.09,.07,.14)}
  if(act==='smoke'){const a=q(hR[0]+.05,hR[1]);c.strokeStyle='#f4f1ea';LW(.035);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[0]+.12,a[1]-.02);c.stroke();c.fillStyle='#e0572a';c.fillRect(a[0]+.11,a[1]-.035,.03,.03);c.strokeStyle=INK2;c.globalAlpha=.45;LW(.02);c.beginPath();const tt=(simT*.8)%1;c.moveTo(a[0]+.13,a[1]-.05);c.quadraticCurveTo(a[0]+.25,a[1]-.25-tt*.2,a[0]+.15,a[1]-.45-tt*.3);c.stroke();c.globalAlpha=1}
  if(act==='sweep'){const a=q(hL[0],hL[1]),b=q(hR[0]+.35,.02);c.strokeStyle='#8a6a3a';LW(.04);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.strokeStyle='#b59a52';LW(.1);c.beginPath();c.moveTo(b[0]-.18,b[1]);c.lineTo(b[0]+.18,b[1]);c.stroke()}
  if(act==='drink'||(p.stall&&p.stall.type==='tea'&&p.st==='stay'&&act!=='smoke')){const a=q(hR[0],hR[1]+.02);c.fillStyle='#f4f1ea';c.fillRect(a[0]-.04,a[1]-.07,.08,.08)}
  if(act==='carry'){const a=q(hR[0]-.05,hR[1]+.06);c.fillStyle=p.fileCol||(p.fileCol=mpick(['#c9a24a','#7fa36b','#c0392b']));c.fillRect(a[0]-.14,a[1]-.18,.26,.2)}
  if(act==='pour'){const a=q(hR[0],hR[1]),b=q(hL[0],hL[1]);c.fillStyle='#6b6b6b';c.fillRect(a[0]-.08,a[1]-.1,.16,.12);c.fillStyle='#f4f1ea';c.fillRect(b[0]-.04,b[1]-.08,.08,.09);c.strokeStyle='#a0662a';c.globalAlpha=.8;LW(.03);c.beginPath();c.moveTo(a[0]+.06,a[1]);c.lineTo(b[0],b[1]-.08);c.stroke();c.globalAlpha=1}
  if(act==='shake'){const a=q(hR[0]+.02,hR[1]);c.fillStyle='#c0392b';c.fillRect(a[0]-.1,a[1]-.22,.2,.26);c.strokeStyle=INK;LW(.7/S);c.strokeRect(a[0]-.1,a[1]-.22,.2,.26)}
  if(act==='chop'){const a=q(hR[0],hR[1]),b=q(hR[0]+.12,hR[1]+.22);c.strokeStyle='#8a8a8a';LW(.05);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}
  if(L.bag&&pose==='walk'&&!act){const a=q(hL[0],hL[1]-.02);c.fillStyle='#3a3a3f';c.fillRect(a[0]-.12,a[1],.24,.18)}
  // head
  const hc=q(.02+ls,.93+up),hr=.12;
  if(L.headCover){c.fillStyle=L.dress==='borka'?L.c1:L.c2;c.beginPath();circ(c,hc[0],hc[1]+.01,hr*1.25);c.fill();const s1=q(-.22+ls,sh-.04),s2=q(.22+ls,sh-.04);c.beginPath();c.moveTo(hc[0]-hr*1.2,hc[1]);c.lineTo(s1[0],s1[1]);c.lineTo(s2[0],s2[1]);c.lineTo(hc[0]+hr*1.2,hc[1]);c.fill()}
  c.fillStyle=L.skin;c.beginPath();circ(c,hc[0],hc[1]+(L.headCover?.02:0),L.headCover?hr*.78:hr);c.fill();
  if(!L.headCover){c.fillStyle=L.hair;c.beginPath();c.arc(hc[0],hc[1],hr*1.02,Math.PI*1.02,TAU*.99);c.fill();if(L.female){c.beginPath();circ(c,hc[0]-fc*hr*.9,hc[1]+.02,hr*.45);c.fill()}}
  if(L.beard&&!L.female){c.fillStyle='#2a2420';c.beginPath();c.arc(hc[0]+fc*.02,hc[1]+.04,hr*.72,.15*Math.PI,.85*Math.PI);c.fill()}
  if(L.cap&&!L.female){c.fillStyle='#f4f1ea';c.beginPath();c.arc(hc[0],hc[1]-.02,hr*1.02,Math.PI,TAU);c.fill()}
  if(L.gamchha){c.strokeStyle='#c0392b';LW(.06);c.beginPath();c.moveTo(hc[0]-hr,hc[1]-.03);c.lineTo(hc[0]+hr,hc[1]-.06);c.stroke();if(p.sleepFace){c.fillStyle='#c0392b';c.globalAlpha=.85;c.beginPath();circ(c,hc[0],hc[1],hr*.95);c.fill();c.globalAlpha=1}}
  if(p.helmet){c.fillStyle=p.helmet;c.beginPath();c.arc(hc[0],hc[1]+.01,hr*1.25,Math.PI*.95,TAU*1.01);c.fill()}
  if(p.guardCap||p.role==='police'){c.fillStyle=p.role==='police'?'#2f3a4d':'#3f4a33';c.fillRect(hc[0]-hr*1.1,hc[1]-hr*1.25,hr*2.2,hr*.7);c.fillRect(hc[0]+(fc>0?0:-hr*1.5),hc[1]-hr*.62,hr*1.5,hr*.18)}
  c.strokeStyle=INK;c.globalAlpha=.6;LW(.8/S);c.beginPath();circ(c,hc[0],hc[1],hr*(L.headCover?1.25:1));c.stroke();c.globalAlpha=1;
  if(lod>2&&!p.sleepFace){c.fillStyle=INK;c.beginPath();circ(c,hc[0]+fc*.05,hc[1]+.0,.014);c.fill()}
  if(umb){const a=q(hL[0],hL[1]),top=q(.05+ls,1.2+up);c.strokeStyle=INK;LW(.02);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(top[0],top[1]);c.stroke();c.fillStyle=L.umbCol;c.beginPath();c.moveTo(top[0]-.62,top[1]+.12);c.quadraticCurveTo(top[0],top[1]-.42,top[0]+.62,top[1]+.12);c.closePath();c.fill();c.strokeStyle=INK;c.globalAlpha=.6;LW(.8/S);c.stroke();c.globalAlpha=1}
  if(p.roam==='badam'){c.fillStyle='#a0763a';c.beginPath();c.ellipse(hc[0],hc[1]-hr*1.3,.32,.1,0,0,TAU);c.fill()}
  if(p.roam==='water'){const a=q(hL[0],hL[1]);c.fillStyle='rgba(120,170,210,.8)';c.fillRect(a[0]-.1,a[1]-.05,.2,.25)}
  if(p.roam==='paper'){const a=q(hR[0],hR[1]);c.fillStyle='#e9e4d6';c.fillRect(a[0]-.15,a[1]-.25,.3,.3)}
  if(act==='load'){c.fillStyle=p.loadCol||(p.loadCol=mpick(['#d8c9a0','#c9a36b','#8a6a4a','#b0b6bf']));c.beginPath();c.ellipse(hc[0],hc[1]-hr*1.9,.42,.2,0,0,TAU);c.fill();c.strokeStyle=INK;c.globalAlpha=.6;LW(.8/S);c.stroke();c.globalAlpha=1}
  if(act==='stick'){const a=q(hR[0],hR[1]),b=q(hR[0]+.1,hR[1]+.55);c.strokeStyle='#8a5a2a';LW(.05);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}
}

