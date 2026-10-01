/* ---------------- footpaths (walks) ---------------- */
const walks=[];
function addWalk(pts,side,sw,road,closed=false){const P=mkPoly(pts);Object.assign(P,{side,sw,road,closed,id:walks.length,links:[[],[]],stalls:[],sib:-1,exits:[]});walks.push(P);return P}
function walkPos(P,s,lat,o){if(P.closed)s=((s%P.len)+P.len)%P.len;const r=polyAt(P,s),k=P.side===0?1:-P.side;o[0]=r.x+r.ty*k*lat;o[1]=r.y-r.tx*k*lat;o[2]=r.tx;o[3]=r.ty;return o}
function genWalks(){
  for(const R of roads){if(R.kind==='lane'){addWalk(R.pts.filter(p=>inWorld(p[0],p[1],20)),0,R.hw*2,R.id);continue}
    const ids={};for(const side of[-1,1]){const off=offsetPts(R.pts,side*(R.hw+R.sw/2));let run=[];const flush=()=>{if(run.length>3){const w=addWalk(run,side,R.sw,R.id);(ids[side]=ids[side]||[]).push(w)}run=[]};
      for(const p of off){if(inWorld(p[0],p[1],15)&&Math.hypot(p[0],p[1])>RSW+.5)run.push(p);else flush()}flush()}
    for(const a of ids[-1]||[])for(const b of ids[1]||[]){if(a.sib<0)a.sib=b.id;if(b.sib<0)b.sib=a.id}}
  const ring=[];for(let i=0;i<=96;i++){const a=i/96*TAU;ring.push([RWALK*Math.cos(a),RWALK*Math.sin(a)])}const RW=addWalk(ring,1,RSW-ROUT,-1,true);
  // crossing links from each walk end to nearby footpaths
  for(const P of walks){if(P.closed)continue;for(const end of[0,1]){const e=end?P.pts[P.pts.length-1]:P.pts[0];if(!inWorld(e[0],e[1],-4))continue;const cand=[];
      for(const Q of walks){if(Q===P)continue;const[s,d]=nearestS(Q,e[0],e[1]);if(d<42)cand.push({w:Q.id,s,d})}cand.sort((a,b)=>a.d-b.d);P.links[end]=cand.slice(0,6)}}
  for(const P of walks){if(P.closed||P.road<0)continue;const R=roads[P.road];if(R.kind!=='arm')continue;const e=Math.hypot(P.pts[0][0],P.pts[0][1])<Math.hypot(P.pts[P.pts.length-1][0],P.pts[P.pts.length-1][1])?P.pts[0]:P.pts[P.pts.length-1];
    const[s]=nearestS(RW,e[0],e[1]);RW.exits.push({s,w:P.id,ws:nearestS(P,e[0],e[1])[0]})}
}

