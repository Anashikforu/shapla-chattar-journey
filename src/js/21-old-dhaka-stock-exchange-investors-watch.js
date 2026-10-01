/* ---------- old Dhaka Stock Exchange: investors watching the price board ---------- */
const TICK=[['PADMAOIL',48.2],['MEGHNACEM',131.5],['NBDBANK',22.8],['SAMATATA',17.4],['JAMUNATEX',9.6],['BARENDRA',64.1],['SONARGAON',38.9],['SURMATEA',212.0],['CHATTALA',15.3],['MOHONA',27.7]];
function investor(){const p=makePerson(mpick(['customer','office','banker']),Math.random()<.15);p.roleText='Share investor at the old Stock Exchange';p.thought=mpick(['Bought at 120, it is 96 now. One more week.','Index up 40 points today, finally.','My whole pension is in these shares.','Everyone says buy bank shares. Everyone said that last year too.']);return p}
function genDSE(){let F=null;for(const[r,dg]of[[150,-58],[175,-36],[205,-62],[140,-86],[190,-78]]){F=reserveSite(r,dg,44,42);if(F)break}if(!F)return;sites.dse=F;paintPlaza(F,'#d6d0c2');
  addBuilding([{q:FQ(F,4,40,16,40),h:36,kind:'office',col:'#cfc6b4',signText:['ঢাকা স্টক এক্সচেঞ্জ','Dhaka Stock Exchange'],signCol:'#1a5276'}],{name:['ঢাকা স্টক এক্সচেঞ্জ (পুরোনো ভবন)','Dhaka Stock Exchange (old building)'],landmark:true});
  const bd={F,kind:'ticker',depth:()=>D(...FW(F,22,5)),bb:()=>{const p=FW(F,22,5);return[p[0]-26,p[1]-26,p[0]+26,p[1]+26]},draw:drawTicker};specials.push(bd);
  addCrowd(F,[[3,41,6,14]],investor,()=>!FRIDAY&&HOUR>9.8&&HOUR<14.8?55:HOUR>7&&HOUR<18?6:0)}
let tickT=0;
function drawTicker(c,lod){const F=this.F,P=(a,z)=>{const p=FW(F,a,5);return[p[0]+KX*z,p[1]-KZ*z]};pencil(c,INK,.85,1.1);c.beginPath();for(const a of[9,35]){const p0=P(a,0),p1=P(a,2.6);c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1])}c.stroke();
  const q=[P(7,2.6),P(37,2.6),P(37,6.2),P(7,6.2)];c.globalAlpha=1;c.fillStyle='#1c2226';fillPoly(c,q);c.beginPath();ppath(c,q);c.stroke();
  if(simT-tickT>2.5){tickT=simT;for(const t of TICK){t[2]=(Math.random()-.47)*t[1]*.03;t[1]=Math.max(1,t[1]+t[2])}}
  if(lod>0&&S>3)for(let row=0;row<3;row++){const i0=(Math.floor(simT/3)+row*3)%TICK.length;let str='';const col=[];for(let k=0;k<3;k++){const t=TICK[(i0+k)%TICK.length];str+=`${t[0]} ${t[1].toFixed(1)}${(t[2]||0)>=0?'▲':'▼'}   `}
    const m=P(22,5.4-row*1.05);const up=(TICK[i0][2]||0)>=0;screenText(c,m[0],m[1],str,clamp(.55*S,7,15),up?'#5fd46a':'#ff6b5b',"ui-monospace,Menlo,monospace",'center','600')}}


