/* ---------------- vehicle routes ---------------- */
const armRoutes=[],sideRoutes=[];
function clipWorld(pts,hs){const P=[],H=[];for(let i=0;i<pts.length;i++)if(inWorld(pts[i][0],pts[i][1],70)){P.push(pts[i]);H.push(hs[i])}return[P,H]}
function mkRoute(pts,hs,extra){[pts,hs]=clipWorld(pts,hs);const R=mkPoly(pts);R.hs=hs;return Object.assign(R,extra||{})}
function bez(a,c,b,n,out,hsOut,h0,h1){for(let i=1;i<=n;i++){const t=i/n,u=1-t;out.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]);hsOut.push(lerp(h0,h1,t))}}
function genRoutes(){
  const HS_R=9;
  const armIn=A=>{const off=offsetPts(A.pts.slice().reverse(),A.hw/2);const out=[];for(const p of off){if(Math.hypot(p[0],p[1])<ROUT+3)break;out.push(p)}return out};
  const armOut=A=>{const off=offsetPts(A.pts,A.hw/2);const i=off.findIndex(p=>Math.hypot(p[0],p[1])>=ROUT+3);return off.slice(i)};
  ARMS.forEach((A,a)=>{armRoutes[a]=[];const IN=armIn(A),hA=A.hw/2-.6;
    ARMS.forEach((B,b)=>{if(a===b)return;const OUT=armOut(B),hB=B.hw/2-.6;const pts=IN.slice(),hs=IN.map(()=>hA);
      const E1=IN[IN.length-1],E0=IN[IN.length-2],di=[E1[0]-E0[0],E1[1]-E0[1]],dl=Math.hypot(di[0],di[1]);di[0]/=dl;di[1]/=dl;
      const th1=Math.atan2(E1[1],E1[0])+.3,R1=[RMID*Math.cos(th1),RMID*Math.sin(th1)];bez(E1,[E1[0]+di[0]*8,E1[1]+di[1]*8],R1,7,pts,hs,hA,HS_R);
      const S2=OUT[0],S3=OUT[1],dO=[S3[0]-S2[0],S3[1]-S2[1]],dm=Math.hypot(dO[0],dO[1]);dO[0]/=dm;dO[1]/=dm;
      let th2=Math.atan2(S2[1],S2[0])-.3;while(th2<=th1+.15)th2+=TAU;for(let th=th1+.1;th<th2;th+=.1){pts.push([RMID*Math.cos(th),RMID*Math.sin(th)]);hs.push(HS_R)}
      const R2=[RMID*Math.cos(th2),RMID*Math.sin(th2)];pts.push(R2);hs.push(HS_R);bez(R2,[S2[0]-dO[0]*8,S2[1]-dO[1]*8],S2,7,pts,hs,HS_R,hB);
      for(let i=1;i<OUT.length;i++){pts.push(OUT[i]);hs.push(hB)}
      const R=mkRoute(pts,hs,{arm:a,kind:'main',turn:b});
      for(let i=0;i<R.pts.length;i++)if(Math.hypot(R.pts[i][0],R.pts[i][1])<48.5){R.stopS=R.cum[i];break}
      R.stops=[];for(const st of busStops){if(st.arm!==a&&st.arm!==b)continue;const[s,d]=nearestS(R,st.x,st.y);if(d<(st.arm===a?A.hw:B.hw)+1)R.stops.push({s,stop:st})}R.stops.sort((x,y)=>x.s-y.s);
      armRoutes[a][b]=R})});
  for(const Rd of roads){if(Rd.kind==='arm')continue;if(Rd.kind==='lane'){for(const rev of[0,1]){const p=rev?Rd.pts.slice().reverse():Rd.pts;sideRoutes.push(mkRoute(p,p.map(()=>Rd.hw-.9),{kind:'lane'}))}continue}
    for(const rev of[0,1]){const p=offsetPts(rev?Rd.pts.slice().reverse():Rd.pts,Rd.hw/2);sideRoutes.push(mkRoute(p,p.map(()=>Math.max(.4,Rd.hw/2-.5)),{kind:'side'}))}}
}

