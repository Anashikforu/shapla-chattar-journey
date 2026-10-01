/* ---------------- ground painting ---------------- */
const zebras=[];let hatchImg=null,hatchPat=null,groundSpr=null;const GPX=2.5;
function genZebras(){
  for(const A of ARMS){for(const rz of[48.5,120]){let s=0;for(let k=0;k<A.pts.length;k++){if(Math.hypot(A.pts[k][0],A.pts[k][1])>=rz){s=A.P.cum[k];break}}
    const r=polyAt(A.P,s),x=r.x,y=r.y,tx=r.tx,ty=r.ty,lx=ty,ly=-tx,q=[];
    for(let o=-A.hw+.6;o<A.hw-.4;o+=1.35){const cx=x+lx*o,cy=y+ly*o;q.push([[cx-tx*2-lx*.32,cy-ty*2-ly*.32],[cx+tx*2-lx*.32,cy+ty*2-ly*.32],[cx+tx*2+lx*.32,cy+ty*2+ly*.32],[cx-tx*2+lx*.32,cy-ty*2+ly*.32]])}
    zebras.push(q)}}
}
function makeHatch(){const g=document.createElement('canvas');g.width=g.height=128;const c=g.getContext('2d');const R=mulberry32(77);c.strokeStyle='rgba(47,45,42,.17)';c.lineWidth=1.1;c.beginPath();
  for(let i=-140;i<260;i+=4+R()*4){c.moveTo(i,130);c.lineTo(i+72,-2)}c.stroke();return g}
function paintGround(c,ppm,live){
  c.lineCap='round';c.lineJoin='round';c.globalAlpha=1;c.setLineDash([]);
  c.fillStyle=wash('#c9a86a',.4);c.fillRect(-E-120,-E-120,2*E+240,2*E+240);
  // outer footpath edges, then footpaths
  c.strokeStyle=INK;c.globalAlpha=.3;c.lineWidth=1.3/ppm;for(const R of roads)if(R.edgeL){c.stroke(R.edgeL);c.stroke(R.edgeR)}c.beginPath();circ(c,0,0,RSW);c.stroke();
  c.globalAlpha=1;const sw=wash('#ddd6c6',.8);c.strokeStyle=sw;for(const R of roads)if(R.sw>0){c.lineWidth=2*(R.hw+R.sw)-.2;c.stroke(R.path)}c.fillStyle=sw;c.beginPath();circ(c,0,0,RSW-.1);c.fill();
  if(live&&ppm>7&&hatchPat){hatchPat.setTransform(new DOMMatrix().scaleSelf(2.2/128).rotateSelf(70));c.strokeStyle=hatchPat;c.globalAlpha=.5;for(const R of roads)if(R.sw>0){c.lineWidth=2*(R.hw+R.sw);c.stroke(R.path)}c.globalAlpha=1}
  // curbs then carriageway
  c.strokeStyle=INK;c.globalAlpha=.8;c.lineWidth=3.4/ppm;for(const R of roads){c.stroke(R.curbL);c.stroke(R.curbR)}c.beginPath();circ(c,0,0,ROUT);c.stroke();
  c.globalAlpha=1;const rc=wash(rain>.3?'#7d7870':'#8f8a80',.8);c.strokeStyle=rc;for(const R of roads){c.lineWidth=2*R.hw-.25;c.stroke(R.path)}c.fillStyle=rc;c.beginPath();circ(c,0,0,ROUT-.12);c.fill();
  if(hatchPat){hatchPat.setTransform(new DOMMatrix().scaleSelf(6/128));c.strokeStyle=hatchPat;c.fillStyle=hatchPat;for(const R of roads){c.lineWidth=2*R.hw;c.stroke(R.path)}c.beginPath();circ(c,0,0,ROUT);c.fill()}
  // markings
  c.strokeStyle='#f7f3e8';c.globalAlpha=.82;c.lineWidth=.24;c.setLineDash([3.2,3.8]);for(const R of roads)if(R.center&&R.kind!=='lane')c.stroke(R.center);c.setLineDash([]);
  c.strokeStyle=wash('#7f9f5a',.8);c.globalAlpha=1;c.lineWidth=1.1;for(const A of ARMS)if(A.hw>=10&&A.center)c.stroke(A.center);
  c.strokeStyle=INK;c.globalAlpha=.4;c.lineWidth=.8/ppm;for(const A of ARMS)if(A.hw>=10&&A.center){c.save();c.lineWidth=1.3;c.globalAlpha=.25;c.stroke(A.center);c.restore()}
  c.fillStyle='#f7f3e8';c.globalAlpha=.9;for(const z of zebras){c.beginPath();for(const q of z)ppath(c,q);c.fill()}
  c.globalAlpha=1;
  paintFields(c);for(const g of groundDecor)g(c);
  // island
  c.fillStyle=wash('#8fb069',.7);c.beginPath();circ(c,0,0,RIN);c.fill();
  J=mulberry32(55);c.beginPath();for(let i=0;i<200;i++){const a=J()*TAU,r=POOL+.8+J()*(RIN-POOL-1.2),x=Math.cos(a)*r,y=Math.sin(a)*r;c.moveTo(x,y);c.lineTo(x+.1,y-.5)}pencil(c,'#4f7a45',.55,.9);S=ppm;c.stroke();
  c.fillStyle='#e67e22';c.globalAlpha=1;for(let i=0;i<56;i++){const a=i/56*TAU;c.beginPath();circ(c,Math.cos(a)*(RIN-.8),Math.sin(a)*(RIN-.8),.3);c.fill()}
  c.fillStyle=wash('#6f9fc8',.65);c.beginPath();circ(c,0,0,POOL);c.fill();
  if(live){c.beginPath();for(let i=0;i<4;i++){const r=4.4+((simT*.4+i/4)%1)*(POOL-4.6);c.moveTo(r,0);c.arc(0,0,r,0,TAU)}pencil(c,'#3f6f9f',.35,.9);c.stroke()}
  c.beginPath();circ(c,0,0,POOL);circ(c,0,0,RIN);pencil(c,INK,.8,1.1);c.stroke();
}
function buildGroundSprite(){const w=Math.round((2*E+160)*GPX);groundSpr=document.createElement('canvas');groundSpr.width=groundSpr.height=w;const c=groundSpr.getContext('2d');
  c.setTransform(GPX,0,0,GPX,(E+80)*GPX,(E+80)*GPX);const oS=S;S=GPX;paintGround(c,GPX,false);S=oS}

