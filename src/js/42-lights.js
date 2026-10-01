/* ---------------- lights ---------------- */
function glow(c,x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r)}
function lightsPass(items,L){
  const c=lctx;c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.clearRect(0,0,lightCv.width,lightCv.height);applyCam(c);const late=HOUR>22.5||HOUR<5?.45:1;
  for(const it of items){const o=it.o;switch(it.t){
    case 'b':{c.globalCompositeOperation='destination-out';c.globalAlpha=1;c.fillStyle='#000';for(const p of o.parts)fillPoly(c,p.hull);c.globalCompositeOperation='source-over';c.globalAlpha=.9*L*late;c.fillStyle='#ffd27a';for(const p of o.parts)c.fill(p.litPath);
      if(o.mosque){const m=o.parts[0].minaret;if(m){c.globalAlpha=.8*L;glow(c,m[0],m[1],5,'rgba(140,255,170,.9)')}}break}
    case 'po':{const lx=o.x+o.lx*1.8,ly=o.y+o.ly*1.8;c.globalAlpha=L;glow(c,lx,ly,11,'rgba(255,190,90,.55)');const h=P3([lx,ly],8);glow(c,h[0],h[1],2.2,'rgba(255,230,160,1)');break}
    case 'v':{if(o.parked)break;const x=o.dx+o.hx*(o.len/2),y=o.dy+o.hy*(o.len/2),R=o.type==='rickshaw'||o.type==='thela'?2.2:6.5;c.globalAlpha=L*.6;glow(c,x+o.hx*R*.7,y+o.hy*R*.7,R,'rgba(255,240,200,.7)');
      c.globalAlpha=L*.9;c.fillStyle='rgba(255,60,40,.9)';const bx=o.dx-o.hx*o.len/2+KX*.8,by=o.dy-o.hy*o.len/2-KZ*.8;c.beginPath();circ(c,bx,by,o.type==='rickshaw'?.12:.25);c.fill();
      if(o.type==='rickshaw'){const l=P3([o.dx,o.dy],1.1);glow(c,l[0],l[1],1.4,'rgba(255,210,120,.9)')}break}
    case 's':{if(!o.open)break;const l=P3([o.x+o.nx*.4,o.y+o.ny*.4],2.1);c.globalAlpha=L;glow(c,l[0],l[1],o.can?4.5:3,'rgba(255,225,150,.95)');
      if(o.can==='tarp'){c.fillStyle='rgba(255,240,190,1)';for(let i=0;i<5;i++){const a=-o.w/2+i*o.w/4,p=P3([o.x+o.tx*a+o.nx*(o.d/2+1.2),o.y+o.ty*a+o.ny*(o.d/2+1.2)],2);c.beginPath();circ(c,p[0],p[1],.09);c.fill()}}break}
    case 'sh':{c.globalAlpha=L*.7;glow(c,0,-4,15,'rgba(170,210,255,.6)');break}
    case 'pod':{if(o.kiosk){const l=P3([o.x,o.y],2.2);c.globalAlpha=L;glow(c,l[0],l[1],4,'rgba(200,230,255,.8)')}break}
  }}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1;ctx.drawImage(lightCv,0,0);ctx.restore();
}

