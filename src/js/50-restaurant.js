
/* ---------------- Mayer Doa Hotel: the first place you can walk into ---------------- */
let INSIDE=false;
const RESTO={st:null,entry:null,name:['মায়ের দোয়া হোটেল','Mayer Doa Hotel']};
const L2=(bn,en)=>LANG==='en'?en:LANG==='both'?`${bn} · ${en}`:bn;
const MENU=[
 {id:'rice',bn:'ভাত, ডাল, ভর্তা',en:'Rice, dal and bhorta',price:80,gain:35,min:20,meal:true},
 {id:'chicken',bn:'মুরগির ঝোল, ভাত',en:'Chicken curry and rice',price:140,gain:50,min:25,meal:true},
 {id:'kala',bn:'গরুর কালা ভুনা, পরোটা',en:'Beef kala bhuna and paratha',price:120,gain:45,min:20,meal:true},
 {id:'kacchi',bn:'কাচ্চি বিরিয়ানি',en:'Kacchi biryani',price:220,gain:75,min:30,meal:true},
 {id:'tea',bn:'দুধ চা',en:'Milk tea',price:10,gain:8,min:5,meal:false},
];
/* the hotel replaces whatever stalls stood on the footpath nearest the first view, in a gap clear of trees and poles */
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
function initRestaurantEntry(){const st=RESTO.st;if(st)RESTO.entry=nearestFree(st.sx,st.sy,6)}   // needs the nav grid
/* 0 = out of reach, 1 = can walk in, 2 = closed */
function restoState(){const st=RESTO.st;if(!st||!RESTO.entry||INSIDE)return 0;if(Math.hypot(me.x-st.x,me.y-st.y)>4.5)return 0;return st.open?1:2}
let enterLabel='';
function syncEnterBtn(){const rs=restoState(),b=$('btnEnter');
  if(!rs){if(!b.hidden)b.hidden=true;return}
  const t=rs===1?L2('ঢুকুন: মায়ের দোয়া হোটেল (Enter)','Enter Mayer Doa Hotel (Enter)'):L2('মায়ের দোয়া হোটেল এখন বন্ধ, খুলবে সকাল ৬টায়','Mayer Doa Hotel is closed, opens at 6 AM');
  if(t!==enterLabel){enterLabel=t;b.textContent=t}b.disabled=rs!==1;if(b.hidden)b.hidden=false}
function tapRestaurant(x,y){const st=RESTO.st;if(!st||Math.hypot(x-st.x,y-st.y)>3.6)return false;
  const rs=restoState();if(rs===1){enterRestaurant();return true}if(rs===2){toast(L2('হোটেল এখন বন্ধ।','The hotel is closed right now.'));return true}
  if(!walkTo(RESTO.entry[0],RESTO.entry[1]))return true;me.enterOnArrive=true;return true}
function drawRestaurantLabel(c,z){   // name on the map while zoomed out; up close it is on the sign
  const st=RESTO.st;if(!st||z>=7||!onScreen(st.x,st.y))return;const s=toScreen(st.x+KX*3,st.y-KZ*3),px=clamp(10+z*1.6,11,15);
  c.save();c.textAlign='center';c.textBaseline='middle';c.font=`600 ${px}px ${F_BN}`;c.lineWidth=4;c.strokeStyle='rgba(247,242,230,.9)';const t=LANG==='en'?RESTO.name[1]:RESTO.name[0];c.strokeText(t,s[0],s[1]);c.fillStyle=INK;c.fillText(t,s[0],s[1]);c.restore()}

/* walking in and out */
let simT0=0;const eating={dish:null,t:0};
function enterRestaurant(){
  if(INSIDE||restoState()!==1)return;INSIDE=true;simT0=simT;heldKeys.clear();me.path=null;me.goal=null;me.spd=0;me.enterOnArrive=false;eating.dish=null;
  hideCard();document.body.classList.add('inside');$('inside').hidden=false;$('btnEnter').hidden=true;buildMenu();roomEnter();
  playVoice('hotel_welcome_1',me.x,me.y,1)}
function leaveRestaurant(){
  if(!INSIDE||eating.dish)return;INSIDE=false;simT=simT0;document.body.classList.remove('inside');$('inside').hidden=true;heldKeys.clear();syncEnterBtn()}
function buildMenu(){
  $('menuTitle').innerHTML=`<span class="bn">${RESTO.name[0]}</span>${RESTO.name[1]}`;
  $('dishes').innerHTML=MENU.map((m,i)=>`<button class="dish" data-i="${i}"><span class="dn"><span class="bn">${m.bn}</span> <small>${m.en}</small></span><span class="dp">৳${m.price}<small> +${m.gain}</small></span></button>`).join('');
  for(const b of $('dishes').querySelectorAll('.dish'))b.onclick=()=>orderDish(+b.dataset.i);syncMenu()}
function menuNote(m){return eating.dish?L2('খাচ্ছেন…','Eating…'):STAT.wallet<m.price?L2('টাকা কম','Not enough taka'):m.meal&&STAT.energy>=97?L2('এখন খিদে নেই','Not hungry'):''}
function syncMenu(){
  $('menuSub').textContent=L2('খাবার বেছে নিন। দাম টাকায়, পাশে শক্তি।','Pick something. Price in taka, then the energy it gives.');
  $('btnLeave').disabled=!!eating.dish;
  for(const b of $('dishes').querySelectorAll('.dish')){const m=MENU[+b.dataset.i],why=menuNote(m);b.disabled=!!why;b.title=why}}
function orderDish(i){
  const m=MENU[i];if(!INSIDE||menuNote(m))return;
  addMoney(-m.price);eating.dish=m;eating.t=0;roomSay(L2('নেন ভাই, গরম গরম!','Here you go, bhai, piping hot!'));syncMenu();updateStatusUI()}
function finishEating(){
  const m=eating.dish;eating.dish=null;addEnergy(m.gain);HOUR=(HOUR+m.min/60)%24;if(m.meal)STAT.ate=true;
  toast(L2(`${m.bn} খেলেন · শক্তি +${m.gain}`,`Ate ${m.en.toLowerCase()} · +${m.gain} energy`));roomSay(L2('আবার আসবেন ভাই!','Come again, bhai!'));syncMenu();updateStatusUI()}

$('btnEnter').onclick=enterRestaurant;$('btnLeave').onclick=leaveRestaurant;
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&INSIDE){leaveRestaurant();return}
  if(e.key==='Enter'&&!INSIDE&&!['INPUT','BUTTON','TEXTAREA','SELECT','A'].includes(e.target.tagName)&&restoState()===1)enterRestaurant()});
