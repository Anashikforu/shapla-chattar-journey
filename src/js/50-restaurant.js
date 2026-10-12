
/* ---------------- restaurants you can walk into: street eateries, good restaurants, fine dining ---------------- */
let INSIDE=false;
const L2=(bn,en)=>LANG==='en'?en:LANG==='both'?`${bn} · ${en}`:bn;
/* menus: [bn, en, taka, energy, minutes, is a meal, plate colours or cup colour]. Better places charge more and feed you better. */
const dish=(id,bn,en,price,gain,min,meal,art,cup)=>({id,bn,en,price,gain,min,meal,art,cup});
const MENU=[
 dish('rice','ভাত, ডাল, ভর্তা','Rice, dal and bhorta',80,35,20,true,['#f6f2e6','#8a5a2a']),
 dish('chicken','মুরগির ঝোল, ভাত','Chicken curry and rice',140,50,25,true,['#f6f2e6','#c9742a']),
 dish('kala','গরুর কালা ভুনা, পরোটা','Beef kala bhuna and paratha',120,45,20,true,['#4a2f22','#d9b46a']),
 dish('kacchi','কাচ্চি বিরিয়ানি','Kacchi biryani',220,75,30,true,['#e3b052','#f6f2e6']),
 dish('tea','দুধ চা','Milk tea',10,8,5,false,null,'#a0662a'),
];
const MENU_GRILL=[
 dish('pkebab','কাবাব-পরোটা','Kebab and paratha',90,35,15,true,['#6b3a22','#e3c27a']),
 dish('roll','চিকেন রোল','Chicken roll',70,25,10,true,['#d9b46a','#8a5a2a']),
 dish('seekh','সিক কাবাব, রুটি','Seekh kebab and roti',110,40,15,true,['#8a4a2a','#f1e6c8']),
 dish('beefp','গরুর ভুনা, পরোটা','Beef bhuna and paratha',130,48,20,true,['#4a2f22','#e3c27a']),
 dish('tea','দুধ চা','Milk tea',10,8,5,false,null,'#a0662a'),
];
const MENU_GOOD=[
 dish('tehari','বিফ তেহারি','Beef tehari',220,55,25,true,['#e3b052','#6b3a22']),
 dish('polao','মোরগ পোলাও, রোস্ট','Chicken polao and roast',320,68,30,true,['#f6f2e6','#c9742a']),
 dish('kacchiL','কাচ্চি বিরিয়ানি (বড়)','Kacchi biryani, large',380,82,30,true,['#e3b052','#f6f2e6']),
 dish('ilish','ইলিশ ভাপা, ভাত','Steamed hilsa and rice',420,72,30,true,['#c9d6d9','#f6f2e6']),
 dish('firni','ফিরনি','Firni dessert',90,12,5,false,['#f4efe0','#c2185b']),
 dish('lassi','ঘোল','Cold ghol',60,10,5,false,null,'#f1ede0'),
];
const MENU_FINE=[
 dish('rezala','মাটন রেজালা, নান','Mutton rezala and naan',650,78,40,true,['#e8d8b0','#8a4a2a']),
 dish('prawn','চিংড়ি মালাইকারি, পোলাও','Prawn malai curry and polao',780,88,40,true,['#f6f2e6','#e08a4a']),
 dish('fish','গ্রিলড ফিশ প্ল্যাটার','Grilled fish platter',850,92,45,true,['#c9d6d9','#e0b25a']),
 dish('steak','বিফ স্টেক','Beef steak',900,96,45,true,['#5a3326','#7fa36b']),
 dish('shahi','শাহী টুকরা','Shahi tukra',350,20,10,false,['#f4efe0','#b8432f']),
 dish('juice','তাজা ফলের জুস','Fresh fruit juice',180,12,5,false,null,'#e08a2a'),
];
/* a restaurant: door = where you stand to go in; reach is measured from the door. Stalls open with their stall; buildings keep set hours. */
const RESTOS=[];
const TIER={
 1:{menu:MENU,reach:4.5},
 2:{menu:MENU_GOOD,reach:4,hours:[10,23]},
 3:{menu:MENU_FINE,reach:4,hours:[12,23.5]},
};
const RESTO={st:null,entry:null,tier:1,menu:MENU,name:['মায়ের দোয়া হোটেল','Mayer Doa Hotel'],id:0};   // the first one, near the start; goals point at it
const STREET_NAMES=[['হোটেল আল-আমিন','Hotel Al-Amin'],['নিউ ঢাকা হোটেল','New Dhaka Hotel'],['রহমানিয়া হোটেল','Rahmania Hotel'],['ভাই ভাই হোটেল','Bhai Bhai Hotel'],['মদিনা হোটেল','Madina Hotel'],['সাগর হোটেল','Sagar Hotel'],['মা-বাবার দোয়া হোটেল','Ma-Babar Doa Hotel'],['স্টার হোটেল','Star Hotel'],['আলাউদ্দিন হোটেল','Alauddin Hotel'],['শান্তি হোটেল','Shanti Hotel'],['মোতালেব হোটেল','Motaleb Hotel'],['কাশেম হোটেল','Kashem Hotel']];
const GRILL_NAMES=[['বিসমিল্লাহ কাবাব','Bismillah Kebab'],['তোফা কাবাব ঘর','Tofa Kebab Ghor'],['আল-মদিনা পরোটা','Al-Madina Paratha'],['রাজা কাবাব','Raja Kebab'],['পুরান ঢাকার পরোটা','Puran Dhakar Porota']];
/* the good restaurants and the fine-dining place go into existing buildings near these spots (radius from the centre, bearing in degrees) */
const BUILDING_RESTOS=[
 {name:['হাজী মাসুদ বিরিয়ানি','Haji Masud Biryani'],tier:2,r:75,deg:-110},
 {name:['মামা হোটেল অ্যান্ড রেস্টুরেন্ট','Mama Hotel & Restaurant'],tier:2,r:110,deg:-20},
 {name:['কমলাপুর ভাত ঘর','Kamalapur Rice House'],tier:2,r:140,deg:60},
 {name:['বিসমিল্লাহ কাবাব ঘর','Bismillah Kabab Ghor'],tier:2,r:100,deg:150},
 {name:['দ্য স্কাইলাইন রেস্তোরাঁ','The Skyline Restaurant'],tier:3,r:90,deg:20,fine:true},
];
let FINE=null;
function restoOpen(R){return R.st?R.st.open:HOUR>=R.hours[0]&&HOUR<R.hours[1]}

/* the first hotel replaces whatever stalls stood on the footpath nearest the first view, in a gap clear of trees and poles */
function genRestaurant(){
  let best=null;
  for(const P of walks){if(P.closed||P.side===0||P.road<0)continue;const[s,d]=nearestS(P,0,-22);if(!best||d<best.d)best={P,s,d}}
  if(!best)return;const P=best.P;
  for(let k=0;k<40;k++){
    const s=best.s+(k%2?1:-1)*Math.ceil(k/2)*3;if(s<8||s>P.len-8)continue;const o=[];walkPos(P,s,0,o);
    if(Math.hypot(o[0],o[1])<RSW+4||!inWorld(o[0],o[1],-12))continue;
    if(trees.some(t=>t.walk===P.id&&Math.abs(t.s-s)<4.5)||poles.some(p=>Math.hypot(p.x-o[0],p.y-o[1])<3.5))continue;
    for(let i=P.stalls.length-1;i>=0;i--)if(Math.abs(P.stalls[i].s-s)<6.5){P.stalls[i].dead=true;P.stalls.splice(i,1)}
    mkStall('hotel',P,s);const st=stalls[stalls.length-1];st.name=RESTO.name;st.hawker.roleText='Cook and owner of Mayer Doa Hotel';st.hawker.years=24;
    for(let i=stalls.length-1;i>=0;i--)if(stalls[i].dead){const j=fixedPeople.indexOf(stalls[i].hawker);if(j>=0)fixedPeople.splice(j,1);stalls.splice(i,1)}
    P.stalls.sort((a,b)=>a.s-b.s);RESTO.st=st;return}
}
/* needs the nav grid and the avatar's start, so it runs after initAvatar */
function initRestaurantEntry(){
  const reachable=e=>{const p=findPath(me.x,me.y,e[0],e[1]);return p&&!p.partial};
  const add=R=>{RESTOS.push(R);R.id=RESTOS.length};
  // 1. every roadside hotel and grill stall can be walked into (street eatery)
  let hn=0,gn=0;
  for(const st of stalls){if(st.type!=='hotel'&&st.type!=='grill')continue;
    const isFirst=st===RESTO.st,e=nearestFree(st.sx,st.sy,6);if(!e||!reachable(e))continue;
    if(isFirst){RESTO.entry=e;RESTO.x=st.x;RESTO.y=st.y;RESTO.hours=null;add(RESTO);continue}
    if(!st.name)st.name=st.type==='grill'?GRILL_NAMES[gn++%GRILL_NAMES.length]:STREET_NAMES[hn++%STREET_NAMES.length];
    add({st,tier:1,menu:st.type==='grill'?MENU_GRILL:MENU,name:st.name,entry:e,x:st.x,y:st.y,grill:st.type==='grill'})}
  // 2. a few real restaurants in existing buildings: good ones, and one fine-dining place
  const used=new Set();
  for(const spec of BUILDING_RESTOS){
    const tx=Math.cos(spec.deg*Math.PI/180)*spec.r,ty=Math.sin(spec.deg*Math.PI/180)*spec.r;
    const cand=buildings.filter(b=>!b.landmark&&!b.name&&!b.mosque&&!used.has(b)&&b.top>=8&&b.parts[0].z0===0).map(b=>{const c=qCenter(b.foot);return{b,c,d:Math.hypot(c[0]-tx,c[1]-ty)}}).filter(o=>o.d<90).sort((a,b)=>a.d-b.d);
    for(const o of cand.slice(0,25)){
      const q=o.b.foot;let door=null;   // an edge whose outside is footpath, the one nearest the middle of town
      for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];let nx=b[1]-a[1],ny=-(b[0]-a[0]);const L=Math.hypot(nx,ny)||1;nx/=L;ny/=L;
        if(nx*(m[0]-o.c[0])+ny*(m[1]-o.c[1])<0){nx=-nx;ny=-ny}
        for(const off of[1.6,2.4]){const p=[m[0]+nx*off,m[1]+ny*off];if(!navAt(p[0],p[1])&&cellAt(p[0],p[1])===1&&(!door||Math.hypot(...p)<Math.hypot(...door)))door=p}}
      if(!door||!reachable(door))continue;
      used.add(o.b);o.b.name=spec.name;o.b.resto=true;
      const R={st:null,bld:o.b,tier:spec.tier,menu:TIER[spec.tier].menu,hours:TIER[spec.tier].hours,name:spec.name,entry:door,x:door[0],y:door[1],fine:!!spec.fine};add(R);if(spec.fine)FINE=R;break}}
}
/* what is within reach of the avatar right now */
let NEAR=null,CUR=null;
const resR=R=>TIER[R.tier].reach;
function nearResto(){let best=null,bd=1e9;for(const R of RESTOS){const d=Math.hypot(me.x-R.entry[0],me.y-R.entry[1]);if(d<resR(R)&&d<bd){bd=d;best=R}}return best}
/* 0 = out of reach, 1 = can walk in, 2 = closed */
function restoState(){if(INSIDE){return 0}NEAR=nearResto();if(!NEAR)return 0;return restoOpen(NEAR)?1:2}
let enterLabel='';
function syncEnterBtn(){const rs=restoState(),b=$('btnEnter');
  const pn=panoNear();if(pn){const n=pn.P.name,t=L2(`ঢুকুন: ${n[0]} (Enter)`,`Enter ${n[1]} (Enter)`);if(t!==enterLabel){enterLabel=t;b.textContent=t}b.disabled=false;if(b.hidden)b.hidden=false;return}
  if(!rs){if(!b.hidden)b.hidden=true;return}
  const R=NEAR,n=L2(R.name[0],R.name[1]),h=R.hours?R.hours[0]:6;
  const t=rs===1?L2(`ঢুকুন: ${R.name[0]} (Enter)`,`Enter ${R.name[1]} (Enter)`):L2(`${R.name[0]} এখন বন্ধ`,`${R.name[1]} is closed${R.hours?`, opens at ${h>12?h-12:h} ${h>=12?'PM':'AM'}`:', opens at 6 AM'}`);
  if(t!==enterLabel){enterLabel=t;b.textContent=t}b.disabled=rs!==1;if(b.hidden)b.hidden=false}
function tapRestaurant(x,y){
  let hit=null;for(const R of RESTOS){const ok=R.st?Math.hypot(x-R.st.x,y-R.st.y)<3.6:(inQuad(R.bld.foot,x,y)||Math.hypot(x-R.entry[0],y-R.entry[1])<2.6);if(ok){hit=R;break}}
  if(!hit)return false;
  if(restoState()===1&&NEAR===hit){enterRestaurant();return true}
  if(!restoOpen(hit)){toast(L2(`${hit.name[0]} এখন বন্ধ।`,`${hit.name[1]} is closed right now.`));return true}
  if(!walkTo(hit.entry[0],hit.entry[1]))return true;me.enterOnArrive=hit;return true}
function drawRestaurantLabel(c,z){   // names of street eateries while zoomed out (buildings are labelled with the others)
  if(z>=7||z<2.5)return;c.save();c.textAlign='center';c.textBaseline='middle';const px=clamp(9+z*1.4,10,14);c.font=`600 ${px}px ${F_BN}`;c.lineWidth=4;c.strokeStyle='rgba(247,242,230,.9)';
  for(const R of RESTOS){if(!R.st||!onScreen(R.st.x,R.st.y))continue;const s=toScreen(R.st.x+KX*3,R.st.y-KZ*3),t=LANG==='en'?R.name[1]:R.name[0];c.strokeText(t,s[0],s[1]);c.fillStyle=INK;c.fillText(t,s[0],s[1])}
  c.restore()}

/* walking in and out */
let simT0=0;const eating={dish:null,t:0};
function enterRestaurant(){
  if(INSIDE||restoState()!==1)return;closeAct();CUR=NEAR;INSIDE=true;simT0=simT;heldKeys.clear();me.path=null;me.goal=null;me.spd=0;me.enterOnArrive=null;eating.dish=null;
  hideCard();document.body.classList.add('inside');$('inside').hidden=false;$('btnEnter').hidden=true;buildMenu();roomEnter(CUR);
  if(CUR.tier===1)playVoice('hotel_welcome_1',me.x,me.y,1)}
function leaveRestaurant(){
  if(!INSIDE||PANO_ON||eating.dish)return;INSIDE=false;simT=simT0;document.body.classList.remove('inside');$('inside').hidden=true;heldKeys.clear();syncEnterBtn()}
function buildMenu(){
  $('menuTitle').innerHTML=`<span class="bn">${CUR.name[0]}</span>${CUR.name[1]}<small class="tier">${CUR.tier===3?L2('দামি রেস্তোরাঁ','Fine dining'):CUR.tier===2?L2('ভালো রেস্তোরাঁ','Restaurant'):''}</small>`;
  $('dishes').innerHTML=CUR.menu.map((m,i)=>`<button class="dish" data-i="${i}"><span class="dn"><span class="bn">${m.bn}</span> <small>${m.en}</small></span><span class="dp">৳${m.price}<small> +${m.gain}</small></span></button>`).join('');
  for(const b of $('dishes').querySelectorAll('.dish'))b.onclick=()=>orderDish(+b.dataset.i);syncMenu()}
function menuNote(m){return eating.dish?L2('খাচ্ছেন…','Eating…'):STAT.wallet<m.price?L2('টাকা কম','Not enough taka'):''}   // you can always eat; a full stomach just gains no more energy
function syncMenu(){
  $('menuSub').textContent=L2('খাবার বেছে নিন। দাম টাকায়, পাশে শক্তি।','Pick something. Price in taka, then the energy it gives.');
  $('btnLeave').disabled=!!eating.dish;
  for(const b of $('dishes').querySelectorAll('.dish')){const m=CUR.menu[+b.dataset.i],why=menuNote(m);b.disabled=!!why;b.title=why}}
function orderDish(i){
  const m=CUR.menu[i];if(!INSIDE||menuNote(m))return;
  addMoney(-m.price);eating.dish=m;eating.t=0;roomSay(CUR.tier===1?L2('নেন ভাই, গরম গরম!','Here you go, bhai, piping hot!'):CUR.tier===2?L2('এই যে স্যার, আপনার অর্ডার।','Here is your order, sir.'):L2('বন অ্যাপেটিট, স্যার।','Bon appétit, sir.'));
  if(CUR.fine)STAT.fine=true;syncMenu();updateStatusUI()}
function finishEating(){
  const m=eating.dish;eating.dish=null;addEnergy(m.gain);HOUR=(HOUR+m.min/60)%24;if(m.meal)STAT.ate=true;
  toast(L2(`${m.bn} খেলেন · শক্তি +${m.gain}`,`Ate ${m.en.toLowerCase()} · +${m.gain} energy`));roomSay(CUR.tier===1?L2('আবার আসবেন ভাই!','Come again, bhai!'):L2('আবার আসবেন, স্যার।','Please come again, sir.'));syncMenu();updateStatusUI()}

$('btnEnter').onclick=enterNear;$('btnLeave').onclick=leaveRestaurant;
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&INSIDE){if(PANO_ON)leavePano();else leaveRestaurant();return}
  if(e.key==='Enter'&&!INSIDE&&!['INPUT','BUTTON','TEXTAREA','SELECT','A'].includes(e.target.tagName)&&(panoNear()||restoState()===1))enterNear()});
