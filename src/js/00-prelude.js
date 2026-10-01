'use strict';
/* ================================================================
   SHAPLA CHATTAR LIVE — every line below is drawn by code each frame.
   World units are metres. Oblique projection: screen = (x + KX*z, y - KZ*z)
   ================================================================ */
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let RND=mulberry32(19710326);
const rr=(a,b)=>a+(b-a)*RND(), rpick=a=>a[(RND()*a.length)|0];
const mr=(a,b)=>a+(b-a)*Math.random(), mpick=a=>a[(Math.random()*a.length)|0];
function wpick(obj,rng=Math.random){let s=0;for(const k in obj)s+=obj[k];let r=rng()*s;for(const k in obj){r-=obj[k];if(r<=0)return k}return Object.keys(obj)[0]}
let KX=-0.32,KZ=0.8;const VIS=[0.32,0.8];
/* view: th = camera rotation, kx0/kz0 = screen lean & height factor; RXW/RYW = screen-right in world */
const VIEW={th:0,c:1,s:0,kx0:-0.32,kz0:0.8,dir:0,mode:'bird'};let RXW=1,RYW=0;
const D=(x,y)=>x*VIS[0]+y*VIS[1];
const sdir=(fx,fy)=>VIEW.c*fx-VIEW.s*fy;
function setViewConsts(){const c=VIEW.c=Math.cos(VIEW.th),s=VIEW.s=Math.sin(VIEW.th),kx=VIEW.kx0,kz=VIEW.kz0;KX=c*kx-s*kz;KZ=s*kx+c*kz;VIS[0]=-KX;VIS[1]=KZ;RXW=c;RYW=-s}
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;

