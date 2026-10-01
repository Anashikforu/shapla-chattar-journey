
/* ---------------- status bar: wallet, clock, energy, goal ---------------- */
const STAT={wallet:300,energy:100,goal:0,idle:0,tiredWarned:false,ate:false,fine:false};
const bnTaka=n=>bnNum(Math.round(n));
function addMoney(n){STAT.wallet=Math.max(0,STAT.wallet+n)}
function addEnergy(n){STAT.energy=clamp(STAT.energy+n,0,100)}
const tiredK=()=>STAT.energy>25?1:STAT.energy>0?.75:.5;   // speed factor: tired legs are slow
const canSprint=()=>STAT.energy>0;
/* drain by distance (running costs double); rest slowly wins it back */
function updEnergy(dt,moved,running){
  if(moved>.01){STAT.idle=0;addEnergy(-moved*.012*(running?2:1)*(STAT.sandals?.85:1))}
  else{STAT.idle+=dt;if(STAT.idle>.8)addEnergy(dt*.25)}
  if(STAT.energy<=25&&!STAT.tiredWarned){STAT.tiredWarned=true;toast(STAT.energy<=0?'Exhausted. Stand still for a bit.':'Getting tired. Rest a moment, or find something to eat.')}
  else if(STAT.energy>40)STAT.tiredWarned=false}

/* goals: walk to a place. Each pays a little, and the pay will buy a meal. */
const bldCentre=en=>{const b=buildings.find(b=>b.name&&b.name[1]===en);return b?qCenter(b.foot):null};
const siteCentre=F=>F?FW(F,F.L/2,F.D/2):null;
const GOALS=[
 {bn:'শাপলা ফোয়ারার কাছে যান',en:'Walk to the Shapla fountain',at:()=>[0,0],r:24,pay:0},
 {bn:'কোনো রেস্তোরাঁয় খেয়ে নিন (মায়ের দোয়া হোটেল কাছেই)',en:'Eat a meal at a restaurant (Mayer Doa Hotel is close)',at:()=>RESTO.entry,r:0,pay:0,done:()=>STAT.ate},
 {bn:'বাংলাদেশ ব্যাংকে যান',en:'Walk to Bangladesh Bank',at:()=>bldCentre('Bangladesh Bank'),r:40,pay:100},
 {bn:'বায়তুল মোকাররমে যান',en:'Walk to Baitul Mukarram mosque',at:()=>siteCentre(sites.baitul),r:55,pay:100},
 {bn:'কমলাপুর রেল স্টেশনে যান',en:'Walk to Kamalapur railway station',at:()=>siteCentre(sites.kamalapur),r:55,pay:100},
 {bn:'দামি রেস্তোরাঁ দ্য স্কাইলাইনে খান',en:'Dine at The Skyline, the fine restaurant',at:()=>FINE&&FINE.entry,r:0,pay:0,done:()=>STAT.fine},
];
const goalNow=()=>{while(STAT.goal<GOALS.length&&!GOALS[STAT.goal].at())STAT.goal++;return STAT.goal<GOALS.length?GOALS[STAT.goal]:null};   // a goal whose place is missing is skipped
function goalPos(){const g=goalNow();return g?g.at():null}
function updGoal(){
  const g=goalNow();if(!g)return;const p=g.at();if(!p)return;
  if(g.done?g.done():Math.hypot(me.x-p[0],me.y-p[1])<=g.r){STAT.goal++;if(g.pay)addMoney(g.pay);
    if(!g.done)toast(`${LANG==='bn'?g.bn.replace(/যান$/,'পৌঁছেছেন'):'Reached: '+g.en.replace(/^Walk to /,'')}${g.pay?` · +৳${g.pay}`:''}`);
    if(!goalNow())toast('All goals done for now. Wander freely!')}}
function updStatus(dt,moved,running){updEnergy(dt,moved,running);updGoal()}

/* DOM */
function updateStatusUI(){
  const e=Math.round(STAT.energy);$('wallet').textContent=LANG==='bn'?bnTaka(STAT.wallet):STAT.wallet;
  $('energyFill').style.width=e+'%';$('energyBar').classList.toggle('low',STAT.energy<=25);$('energyBar').setAttribute('aria-valuenow',e);
  $('energyTxt').textContent=STAT.energy<=0?'exhausted':STAT.energy<=25?'tired':'';
  const g=goalNow(),p=g&&g.at();
  if(!g)$('goalTxt').textContent=LANG==='bn'?'আপাতত সব লক্ষ্য শেষ':'All done for now';
  else{$('goalTxt').textContent=LANG==='en'?g.en:g.bn;const d=p?Math.max(0,Math.hypot(me.x-p[0],me.y-p[1])-g.r):0;$('goalDist').textContent=p?` · ${Math.round(d/10)*10} m`:''}
  if(!g)$('goalDist').textContent=''}

/* on-screen pointer to the goal: a bobbing ring when it is in view, an edge arrow when it is not */
function drawGoalPointer(c){
  const p=goalPos();if(!p)return;const s=toScreen(p[0],p[1]),b=simT*3,m=36;
  c.save();c.globalAlpha=.9;c.strokeStyle='#b8432f';c.fillStyle=wash('#b8432f',.75);c.lineWidth=1.8;c.lineCap='round';c.lineJoin='round';J=mulberry32(21+BOIL);
  if(s[0]>m&&s[0]<W-m&&s[1]>m&&s[1]<H-m){const y=s[1]-14+Math.sin(b)*4;c.beginPath();const tri=[[s[0]-9,y-16],[s[0]+9,y-16],[s[0],y]];ppath(c,tri);c.fill();c.beginPath();spoly(c,tri,1.2);c.stroke();
    c.beginPath();const ring=[];for(let i=0;i<10;i++){const a=i/10*TAU;ring.push([s[0]+Math.cos(a)*14,s[1]+Math.sin(a)*7])}spoly(c,ring,1.2);c.stroke()}
  else{const dx=s[0]-W/2,dy=s[1]-H/2,a=Math.atan2(dy,dx),ex=W*.42,ey=H*.4,k=1/Math.sqrt((Math.cos(a)/ex)**2+(Math.sin(a)/ey)**2),x=W/2+Math.cos(a)*k,y=H/2+Math.sin(a)*k,u=[Math.cos(a),Math.sin(a)],n=[-u[1],u[0]],o=Math.sin(b)*3;
    const tri=[[x+u[0]*(14+o),y+u[1]*(14+o)],[x-u[0]*6+n[0]*10,y-u[1]*6+n[1]*10],[x-u[0]*6-n[0]*10,y-u[1]*6-n[1]*10]];c.beginPath();ppath(c,tri);c.fill();c.beginPath();spoly(c,tri,1.2);c.stroke()}
  c.restore()}
