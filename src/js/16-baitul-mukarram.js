/* ---------- Baitul Mukarram ---------- */
function genBaitul(){
  const F=reserveSite(330,176,112,96);if(!F)return;sites.baitul=F;paintPlaza(F,'#e8e3d6');
  paintRect(F,8,32,6,26,'#7fa35a',.7);paintRect(F,80,104,6,26,'#7fa35a',.7);
  groundDecor.push(c=>{c.strokeStyle=INK;c.globalAlpha=.18;c.lineWidth=.12;c.beginPath();for(let a=0;a<F.L;a+=3){const p0=FW(F,a,0),p1=FW(F,a,F.D);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}c.stroke();c.globalAlpha=1});
  trees2(F,[[14,12,'mehogoni'],[26,20,'raintree'],[88,12,'mehogoni'],[98,20,'krishnachura']]);
  const cube=FQ(F,F.L/2-21,F.L/2+21,34,76),plinth=FQ(F,F.L/2-28,F.L/2+28,28,82);
  addBuilding([{q:plinth,h:3,kind:'plinth',col:'#ddd8cc'},{q:cube,z0:3,h:30,kind:'baitul',col:'#f2f0ea'}],{name:['বায়তুল মোকাররম মসজিদ','Baitul Mukarram National Mosque'],landmark:true,mosque:true});
  for(const[a0,a1]of[[F.L/2-35,F.L/2-21],[F.L/2+21,F.L/2+35]]){addBuilding([{q:FQ(F,a0,a1,46,64),h:10,kind:'portico',col:'#efece4'}],{landmark:false})}
  for(const[a0,a1,b0,b1]of[[2,30,86,94],[82,110,86,94],[2,10,34,82],[102,110,34,82]]){addBuilding([{q:FQ(F,a0,a1,b0,b1),h:7,kind:'arcade',col:'#e6dcc8',market:true}],{})}
  addCrowd(F,[[10,102,2,30],[34,78,26,34]],worshipper,()=>{const pray=[4.9,13.2,16.6,18.2,19.6].some(h=>Math.abs(HOUR-h)<.35);return(FRIDAY&&HOUR>12.4&&HOUR<14.2?180:pray?90:22)*(rain>.6?.4:1)});
}
