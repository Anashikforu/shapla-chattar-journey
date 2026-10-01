/* ---------------- shadows ---------------- */
function sunVec(){if(HOUR<6.2||HOUR>17.8)return null;const a=(HOUR-6)/12*Math.PI,s=Math.sin(a),L=clamp(.35+.9*(1-s),.35,2.2);return{x:-Math.cos(a)*L,y:-.32*L,k:clamp(s*1.6,0,1)}}
function drawShadows(c){const sun=sunVec();if(!sun)return;c.fillStyle=`rgba(60,55,70,${.1*sun.k*(1-rain*.7)})`;c.globalAlpha=1;
  for(const b of buildings){if(!inView(b.bb[0]-80,b.bb[1]-20,b.bb[2]+80,b.bb[3]+80))continue;for(const p of b.parts){const h=p.top,sx=sun.x*h,sy=sun.y*h;fillPoly(c,hull([...p.q.map(q=>q.slice()),...p.q.map(q=>[q[0]+sx,q[1]+sy])]))}}
  for(const t of trees){if(!onScreen(t.x,t.y))continue;c.beginPath();c.ellipse(t.x+sun.x*t.h*.7,t.y+sun.y*t.h*.7,t.r*.9,t.r*.5,0,0,TAU);c.fill()}}

