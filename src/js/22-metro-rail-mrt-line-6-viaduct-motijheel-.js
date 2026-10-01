/* ---------- Metro Rail (MRT Line 6) viaduct, Motijheel station, trains ---------- */
const MZ=11.5,metro={segs:[],P:null,ts:0,stop:0,st0:0,st1:0};
function genMetro(){const N=ARMS[0],Ea=ARMS[2];if(!N||!Ea)return;const r0=64;
  const inN=N.pts.filter(p=>{const r=Math.hypot(p[0],p[1]);return r>=r0&&r<=440}).reverse(),outE=Ea.pts.filter(p=>{const r=Math.hypot(p[0],p[1]);return r>=r0&&r<=430});
  const a0=Math.atan2(inN[inN.length-1][1],inN[inN.length-1][0]),a1=Math.atan2(outE[0][1],outE[0][0]);const arc=[];for(let k=1;k<12;k++){const a=a0+(a1-a0)*k/12;arc.push([r0*Math.cos(a),r0*Math.sin(a)])}
  const raw=mkPoly([...inN,...arc,...outE]);const pts=[];for(let s=0;s<=raw.len;s+=14){const q=polyAt(raw,s);pts.push([q.x,q.y])}metro.P=mkPoly(pts);
  metro.st0=metro.P.len*.17;metro.st1=metro.st0+130;
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],m=[(a[0]+b[0])/2,(a[1]+b[1])/2],s0=metro.P.cum[i],s1=metro.P.cum[i+1];
    const seg={a,b,m,s0,s1,pier:i%2===0,station:s1>metro.st0&&s0<metro.st1};metro.segs.push(seg);
    specials.push({kind:'metro',seg,depth:()=>Math.max(D(a[0],a[1]),D(b[0],b[1]))+.5,bb:()=>{const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),y0=Math.min(a[1],b[1]),y1=Math.max(a[1],b[1]),h=P3([m[0],m[1]],20);return[Math.min(x0,h[0])-8,Math.min(y0,h[1])-8,Math.max(x1,h[0])+8,Math.max(y1,h[1])+8]},draw:drawMetroSeg})}}
function updMetro(dt){if(!metro.P)return;const L=metro.P.len,spd=13,stn=(metro.st0+metro.st1)/2+60;
  if(metro.stop>0){metro.stop-=dt;return}const prev=metro.ts;metro.ts+=spd*dt;if(prev<stn&&metro.ts>=stn){metro.stop=22;const q=polyAt(metro.P,stn);sfx('sfx_train_horn',q.x,q.y,.5)}if(metro.ts>L+130)metro.ts=-10}
function drawMetroSeg(c,lod){const g=this.seg,{a,b,m}=g,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),fx=dx/len,fy=dy/len;pencil(c,INK,.8,1);
  if(g.pier){const ps=[[a[0],a[1]]];for(const p of ps){pencil(c,INK,.8,1);cyl(c,p[0],p[1],1.2,0,MZ-1.2,'#b9b3a6');obox(c,p[0],p[1],fx,fy,2.6,7,MZ-1.6,MZ-.9,wash('#c9c3b5',.9),wash('#a8a296',.9),wash('#b9b3a6',.9))}}
  const W2=g.station?20:9;obox(c,m[0],m[1],fx,fy,len+.3,W2,MZ-.9,MZ,wash('#d8d3c6',.92),wash('#a8a296',.9),wash('#b9b3a6',.9));
  if(lod>0){const lx=fy,ly=-fx;c.beginPath();for(const o of[-W2/2+.3,W2/2-.3]){const p0=P3([a[0]+lx*o,a[1]+ly*o],MZ+.9),p1=P3([b[0]+lx*o,b[1]+ly*o],MZ+.9);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}for(const o of[-1.6,1.6]){const p0=P3([a[0]+lx*o,a[1]+ly*o],MZ+.05),p1=P3([b[0]+lx*o,b[1]+ly*o],MZ+.05);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}pencil(c,INK,.5,.8);c.stroke()}
  // train cars on this segment
  const t0=metro.ts-120,t1=metro.ts;if(t1>g.s0&&t0<g.s1){const s0=Math.max(t0,g.s0),s1=Math.min(t1,g.s1);if(s1-s0>.5){const k0=(s0-g.s0)/len,k1=(s1-g.s0)/len,cx=a[0]+dx*(k0+k1)/2,cy=a[1]+dy*(k0+k1)/2;
    const pt=obox(c,cx,cy,fx,fy,(s1-s0)-.15,3,MZ+.25,MZ+3.9,wash('#e9ecef',.95),wash('#cfd4d8',.95),wash('#dfe3e6',.95));
    if(lod>0){for(const sd of[1,-1]){if(!sideVis(fx,fy,sd))continue;const bq=[pt(-(s1-s0)/2,sd*1.51,MZ+1.1),pt((s1-s0)/2,sd*1.51,MZ+1.1),pt((s1-s0)/2,sd*1.51,MZ+1.45),pt(-(s1-s0)/2,sd*1.51,MZ+1.45)];c.fillStyle='#c0392b';fillPoly(c,bq);const gq=[pt(-(s1-s0)/2,sd*1.51,MZ+1.45),pt((s1-s0)/2,sd*1.51,MZ+1.45),pt((s1-s0)/2,sd*1.51,MZ+1.7),pt(-(s1-s0)/2,sd*1.51,MZ+1.7)];c.fillStyle='#2e7d32';fillPoly(c,gq);c.fillStyle='rgba(50,60,70,.6)';fillPoly(c,[pt(-(s1-s0)/2+.4,sd*1.51,MZ+2.1),pt((s1-s0)/2-.4,sd*1.51,MZ+2.1),pt((s1-s0)/2-.4,sd*1.51,MZ+3.1),pt(-(s1-s0)/2+.4,sd*1.51,MZ+3.1)])}}}}
  if(g.station){const lx=fy,ly=-fx;for(const sd of[-1,1]){const p=[m[0]+lx*sd*7.5,m[1]+ly*sd*7.5];obox(c,p[0],p[1],fx,fy,len+.3,4.5,MZ,MZ+3.2,wash('#e3e6e8',.85),wash('#9fb3bf',.8),wash('#b9c6cf',.8))}
    obox(c,m[0],m[1],fx,fy,len+.3,W2+1,MZ+6,MZ+6.6,wash('#f2f0ea',.95),wash('#c9c3b5',.9),wash('#d8d3c6',.9));
    if(lod>0&&Math.abs(g.s0-metro.st0-56)<8){const t=P3(m,MZ+8);screenText(c,t[0],t[1],LANG==='en'?'Motijheel Metro Station':'মতিঝিল মেট্রো স্টেশন',clamp(1.6*S,14,24),'#2e7d32',LANG==='en'?F_EN:F_BN,'center','700')}}}

