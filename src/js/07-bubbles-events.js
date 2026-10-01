/* ---------------- bubbles & events ---------------- */
const bubbles=[],events=[];
function later(dt,f){events.push({t:simT+dt,f})}
const lastSaid={};
function say(anchor,id,dur=3.4,owner){const l=LINE[id];if(!l)return;{const cd=owner&&owner.stall?5:9;if(lastSaid[id]&&simT-lastSaid[id]<cd)return;lastSaid[id]=simT}if(owner){if(owner.sayUntil>simT)return;owner.sayUntil=simT+dur}
  bubbles.push({anchor,l,t0:simT,dur,owner});const a=anchor();if(a)playVoice(id,a[0],a[1],a[2]);}
const pedAnchor=p=>()=>[p.dx,p.dy,p.look.h*1.12*(p.pose==='sit'?.78:p.pose==='squat'?.66:1)+.35];

