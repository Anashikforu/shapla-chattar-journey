/* ---------------- ground raster: 0 lot, 1 walk, 2 road, 3 island ---------------- */
const MW=1000,MO=500,mask=new Uint8Array(MW*MW),occ=new Uint8Array(MW*MW);
const mk=(x,y)=>{const i=Math.floor(x+MO),j=Math.floor(y+MO);return(i<0||j<0||i>=MW||j>=MW)?-1:j*MW+i};
const cellAt=(x,y)=>{const k=mk(x,y);return k<0?9:mask[k]};
const isRoad=(x,y)=>cellAt(x,y)===2;
function stamp(ax,ay,bx,by,r,val){
  const x0=Math.max(0,Math.floor(Math.min(ax,bx)-r+MO)),x1=Math.min(MW-1,Math.ceil(Math.max(ax,bx)+r+MO)),y0=Math.max(0,Math.floor(Math.min(ay,by)-r+MO)),y1=Math.min(MW-1,Math.ceil(Math.max(ay,by)+r+MO));
  const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1e-9,r2=r*r;
  for(let j=y0;j<=y1;j++)for(let i=x0;i<=x1;i++){const px=i-MO+.5,py=j-MO+.5;let t=((px-ax)*dx+(py-ay)*dy)/L2;t=t<0?0:t>1?1:t;const qx=ax+dx*t-px,qy=ay+dy*t-py;if(qx*qx+qy*qy<=r2){const k=j*MW+i;if(mask[k]<val)mask[k]=val}}
}
function genMask(){
  for(const R of roads)if(R.sw>0)for(let i=0;i<R.pts.length-1;i++)stamp(R.pts[i][0],R.pts[i][1],R.pts[i+1][0],R.pts[i+1][1],R.hw+R.sw,1);
  for(const R of roads)for(let i=0;i<R.pts.length-1;i++)stamp(R.pts[i][0],R.pts[i][1],R.pts[i+1][0],R.pts[i+1][1],R.hw,2);
  for(let j=-RSW-1;j<=RSW+1;j++)for(let i=-RSW-1;i<=RSW+1;i++){const d=Math.hypot(i+.5,j+.5),k=mk(i+.5,j+.5);if(k<0)continue;
    if(d<=RIN)mask[k]=3;else if(d<=ROUT)mask[k]=2;else if(d<=RSW&&mask[k]<1)mask[k]=1}
}
