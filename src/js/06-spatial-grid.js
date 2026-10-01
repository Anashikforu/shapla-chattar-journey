/* ---------------- spatial grid ---------------- */
const GS=10,grid=new Map();
const gk=(ix,iy)=>(ix+200)*1000+(iy+200);
function gridAdd(o){const k=gk(Math.floor(o.x/GS),Math.floor(o.y/GS));let a=grid.get(k);if(!a){a=[];grid.set(k,a)}a.push(o)}
function gridQuery(x,y,r,out){out.length=0;const x0=Math.floor((x-r)/GS),x1=Math.floor((x+r)/GS),y0=Math.floor((y-r)/GS),y1=Math.floor((y+r)/GS);
  for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++){const a=grid.get(gk(i,j));if(a)for(const o of a)out.push(o)}return out}
const QB=[];

