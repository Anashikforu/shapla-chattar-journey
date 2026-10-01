/* ---------------- canvas & camera ---------------- */
const cv=document.getElementById('scene'), ctx=cv.getContext('2d');
const lightCv=document.createElement('canvas'), lctx=lightCv.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=1;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);lightCv.width=cv.width;lightCv.height=cv.height}
resize();addEventListener('resize',resize);

const cam={x:0,y:-22,zoom:4.4,tx:0,ty:-22,tz:4.4,follow:null};
const ZMIN=0.8,ZMAX=46;
let S=1;          // pixels per metre for current drawing target
let VEC=true;     // live vector drawing (enables screen text)
let J=Math.random;// jitter rng for sketch strokes
let BOIL=0;
function applyCam(c){const z=DPR*cam.zoom,a=z*VIEW.c,b=z*VIEW.s,cc=-z*VIEW.s,d=z*VIEW.c;c.setTransform(a,b,cc,d,DPR*W/2-(a*cam.x+cc*cam.y),DPR*H/2-(b*cam.x+d*cam.y))}
const toScreen=(X,Y)=>{const dx=X-cam.x,dy=Y-cam.y;return[cam.zoom*(VIEW.c*dx-VIEW.s*dy)+W/2,cam.zoom*(VIEW.s*dx+VIEW.c*dy)+H/2]};
const toWorld=(sx,sy)=>{const u=(sx-W/2)/cam.zoom,v=(sy-H/2)/cam.zoom;return[cam.x+VIEW.c*u+VIEW.s*v,cam.y-VIEW.s*u+VIEW.c*v]};
const scrToWorldDelta=(dx,dy,z)=>[(VIEW.c*dx+VIEW.s*dy)/z,(-VIEW.s*dx+VIEW.c*dy)/z];
let VX0,VY0,VX1,VY1;
const inView=(x0,y0,x1,y1)=>x1>=VX0&&x0<=VX1&&y1>=VY0&&y0<=VY1;

