/* ---------------- paper grain ---------------- */
const grain=(()=>{const g=document.createElement('canvas');g.width=g.height=256;const c=g.getContext('2d');const R=mulberry32(4);
  for(let i=0;i<5200;i++){const v=R();c.fillStyle=v<.5?`rgba(90,80,60,${R()*.12})`:`rgba(255,255,250,${R()*.25})`;c.fillRect(R()*256,R()*256,1+R()*1.4,1+R()*1.4)}
  c.strokeStyle='rgba(120,105,80,.07)';for(let i=0;i<60;i++){c.beginPath();const x=R()*256,y=R()*256;c.moveTo(x,y);c.quadraticCurveTo(x+R()*20-10,y+R()*20-10,x+R()*30-15,y+R()*30-15);c.stroke()}
  return g})();
let grainPat=null;

