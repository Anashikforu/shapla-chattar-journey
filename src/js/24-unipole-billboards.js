/* ---------- unipole billboards ---------- */
function genUnipoles(){
  const gaps=ARM_DEFS.map(a=>a.deg[0]).sort((a,b)=>a-b);const mids=[];for(let i=0;i<gaps.length;i++)mids.push((gaps[i]+(i<gaps.length-1?gaps[i+1]:gaps[0]+360))/2);
  const spots=mids.slice(0,4).map(m=>[48,m]);for(const A of ARMS)for(const r of[95,210])spots.push(['arm',A,r]);
  for(const sp of spots){let x,y,fx,fy;if(sp[0]==='arm'){const A=sp[1];let s=0;for(let k=0;k<A.pts.length;k++)if(Math.hypot(A.pts[k][0],A.pts[k][1])>=sp[2]){s=A.P.cum[k];break}const q=polyAt(A.P,s);const side=RND()<.5?-1:1;x=q.x+q.ty*side*(A.hw+A.sw*.4);y=q.y-q.tx*side*(A.hw+A.sw*.4);fx=q.tx;fy=q.ty}
    else{const p=polar(sp[0],sp[1]);x=p[0];y=p[1];fx=-Math.sin(sp[1]*D2R);fy=Math.cos(sp[1]*D2R)}
    const u={x,y,fx,fy,ad:rpick(ADS),col:rpick(SIGNCOL),col2:rpick(SIGNCOL)};specials.push({kind:'unipole',u,depth:()=>D(x,y),bb:()=>{const p=P3([x,y],15);return[Math.min(x,p[0])-8,Math.min(y,p[1])-8,Math.max(x,p[0])+8,Math.max(y,p[1])+8]},draw:drawUnipole})}
}
function drawUnipole(c,lod){const u=this.u,{x,y,fx,fy}=u,w=4.6,z0=9,z1=13.6;pencil(c,INK,.85,lod>1?2:1.2);const b0=P3([x,y],0),b1=P3([x,y],z0);c.beginPath();c.moveTo(b0[0],b0[1]);c.lineTo(b1[0],b1[1]);c.stroke();
  const q=[P3([x-fx*w,y-fy*w],z0),P3([x+fx*w,y+fy*w],z0),P3([x+fx*w,y+fy*w],z1),P3([x-fx*w,y-fy*w],z1)];c.globalAlpha=1;c.fillStyle=wash('#f8f4ea',1);fillPoly(c,q);
  c.fillStyle=wash(u.col,.8);fillPoly(c,[q[0],P3([x-fx*w*.2,y-fy*w*.2],z0),P3([x-fx*w*.45,y-fy*w*.45],z1),q[3]]);c.fillStyle=wash(u.col2,.7);c.beginPath();const cc=P3([x+fx*w*.55,y+fy*w*.55],(z0+z1)/2);circ(c,cc[0],cc[1],1.2);c.fill();
  c.beginPath();spoly(c,q,.1);pencil(c,INK,.85,1);c.stroke();if(lod>0){const m=P3([x+fx*w*.1,y+fy*w*.1],(z0+z1)/2);screenText(c,m[0],m[1],LANG==='en'?u.ad[1]:u.ad[0],Math.min(1.1*S,24),shade(u.col,.6),LANG==='en'?F_EN:F_BN,'center','700')}}
