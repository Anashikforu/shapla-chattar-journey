/* ---------------- minimap ---------------- */
const mini=document.getElementById('mini'),mctx=mini.getContext('2d');let miniBase=null;
function buildMini(){const s=mini.width,k=(2*E+40)/s;miniBase=document.createElement('canvas');miniBase.width=miniBase.height=s;const c=miniBase.getContext('2d');const img=c.createImageData(s,s);
  const COL=[[240,233,214],[205,197,178],[150,145,136],[143,176,105]];
  for(let j=0;j<s;j++)for(let i=0;i<s;i++){const x=(i-s/2)*k,y=(j-s/2)*k,m=cellAt(x,y),col=COL[m>3?0:m],o=(j*s+i)*4;img.data[o]=col[0];img.data[o+1]=col[1];img.data[o+2]=col[2];img.data[o+3]=255}
  c.putImageData(img,0,0);c.setTransform(1/k,0,0,1/k,s/2,s/2);for(const b of buildings){c.fillStyle=b.landmark?'#b8432f':wash(b.parts[0].col,.85);fillPoly(c,b.foot)}}
function drawMini(){const s=mini.width,k=s/(2*E+40);mctx.setTransform(1,0,0,1,0,0);mctx.drawImage(miniBase,0,0);mctx.setTransform(k,0,0,k,s/2,s/2);
  mctx.fillStyle='#2f2d2a';for(const v of vehicles)if(!v.parked)mctx.fillRect(v.x-2,v.y-2,4,4);const q=[toWorld(0,0),toWorld(W,0),toWorld(W,H),toWorld(0,H)];mctx.strokeStyle='#b8432f';mctx.lineWidth=3/k;mctx.beginPath();ppath(mctx,q);mctx.stroke();const gp=goalPos();if(gp){mctx.strokeStyle='#b8432f';mctx.lineWidth=2/k;mctx.beginPath();circ(mctx,gp[0],gp[1],9/k);mctx.stroke();mctx.beginPath();circ(mctx,gp[0],gp[1],3/k);mctx.stroke()}mctx.fillStyle='#b8432f';mctx.beginPath();circ(mctx,me.x,me.y,5/k);mctx.fill();mctx.strokeStyle='#f7f2e6';mctx.lineWidth=1.5/k;mctx.stroke()}
mini.addEventListener('pointerdown',e=>{const r=mini.getBoundingClientRect(),k=(2*E+40)/r.width;cam.follow=null;hideCard();cam.tx=(e.clientX-r.left-r.width/2)*k;cam.ty=(e.clientY-r.top-r.height/2)*k-10});

