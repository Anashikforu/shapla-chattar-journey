/* ---------- Bangabhaban grounds: walled green with a pond (northwest) ---------- */
function genGreen(){let F=null;for(const[sz,r,dg]of[[120,300,-138],[120,330,-150],[110,280,-125],[100,360,-160],[100,320,-110],[90,260,-145],[90,380,-130]]){F=reserveSite(r,dg,sz,sz*.8);if(F)break}if(!F)return;sites.green=F;
  groundDecor.push(c=>{c.globalAlpha=1;c.fillStyle=wash('#7fa35a',.78);fillPoly(c,F.q);J=mulberry32(91);c.beginPath();for(let i=0;i<900;i++){const p=FW(F,J()*F.L,J()*F.D);c.moveTo(p[0],p[1]);c.lineTo(p[0]+.12,p[1]-.6)}pencil(c,'#4f7a45',.45,.8);c.stroke();
    const pc=FW(F,F.L*.42,F.D*.55);c.fillStyle=wash('#6f9fc8',.75);c.beginPath();c.ellipse(pc[0],pc[1],F.L*.2,F.D*.16,Math.atan2(F.t[1],F.t[0]),0,TAU);c.fill();pencil(c,INK,.6,1);c.stroke();
    c.beginPath();for(let k=0;k<5;k++){c.ellipse(pc[0],pc[1],F.L*.2*(k+1)/6,F.D*.16*(k+1)/6,Math.atan2(F.t[1],F.t[0]),0,TAU)}pencil(c,'#3f6f9f',.25,.8);c.stroke();
    c.strokeStyle=wash('#e3dccb',.95);c.lineWidth=2.2;c.beginPath();const a=FW(F,F.L*.5,0),b=FW(F,F.L*.5,F.D*.3),d=FW(F,F.L*.8,F.D*.7);c.moveTo(a[0],a[1]);c.quadraticCurveTo(b[0],b[1],d[0],d[1]);c.stroke();
    c.strokeStyle=wash('#a0523a',.9);c.lineWidth=.6;c.beginPath();ppath(c,F.q);c.stroke()});
  J=mulberry32(17);const tp=[];for(let i=0;i<34;i++){const a=J()*F.L,b=J()*F.D,pa=Math.abs(a/F.L-.42)/.2,pb=Math.abs(b/F.D-.55)/.16;if(pa*pa+pb*pb<1.3)continue;tp.push([a,b,J()<.4?'raintree':J()<.5?'banyan':'mehogoni'])}trees2(F,tp);
  addBuilding([{q:FQ(F,F.L*.45,F.L*.55,1,7),h:6,kind:'old',col:'#e8e2d4'}],{name:['বঙ্গভবন','Bangabhaban grounds'],landmark:true});
  addBuilding([{q:FQ(F,F.L*.7,F.L*.92,F.D*.12,F.D*.3),h:14,kind:'old',col:'#f2efe6'}],{})}
