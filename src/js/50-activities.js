
/* ---------------- things to do on the street: buy snacks and tea, bargain for clothes, talk to people ---------------- */
const ACT={mode:null,st:null,p:null,b:null,talked:new Set()};
const itm=(bn,en,price,gain,min,how)=>({bn,en,price,gain,min,how});
/* snacks and drinks: price in taka, energy gained, minutes it takes, and how the avatar does it */
const SNACKS={
 tea:[itm('দুধ চা','Milk tea',10,8,4,'drink'),itm('আদা চা','Ginger tea',15,9,4,'drink'),itm('বিস্কুট','Biscuits',5,4,2,'eat')],
 jhalmuri:[itm('ঝালমুড়ি','Jhalmuri',20,10,4,'eat'),itm('স্পেশাল ঝালমুড়ি','Special jhalmuri',30,13,5,'eat')],
 fuchka:[itm('ফুচকা (৬টি)','Fuchka, six',30,12,5,'eat'),itm('চটপটি','Chotpoti',40,15,6,'eat')],
 singara:[itm('সিঙ্গারা','Singara',15,10,3,'eat'),itm('সমুচা (২টি)','Samosa, two',25,14,4,'eat')],
 dab:[itm('ডাবের পানি','Coconut water',50,12,5,'drink')],
 akh:[itm('আখের রস','Sugarcane juice',20,10,4,'drink')],
 cutfruit:[itm('পেয়ারা মাখা','Spiced guava',20,8,3,'eat')],
 fruit:[itm('কলা (২টি)','Bananas, two',20,10,3,'eat'),itm('আপেল','Apple',40,12,3,'eat'),itm('মাল্টা','Malta orange',35,11,3,'eat')],
 van:[itm('কলা (২টি)','Bananas, two',20,10,3,'eat'),itm('আঙুর','Grapes',50,13,3,'eat')],
 sweets:[itm('রসগোল্লা (২টি)','Roshogolla, two',30,12,3,'eat'),itm('মিষ্টি দই','Sweet yoghurt',45,14,4,'eat')],
 paper:[itm('আজকের পত্রিকা','Today\'s newspaper',15,0,5,'read')],
};
const HEADLINES=[['রাজধানীতে আজ ভারী বৃষ্টির পূর্বাভাস','Heavy rain forecast for the capital today'],['মতিঝিলে যানজট কমাতে নতুন উদ্যোগ','New plan to ease Motijheel traffic'],['মেট্রোরেলে যাত্রী বেড়েছে','More passengers ride the metro'],['শেয়ারবাজারে সূচক বেড়েছে','Share index climbs'],['ঢাকার বাতাস আজ মধ্যম মানের','Dhaka air quality moderate today'],['ঈদের আগে কাপড়ের দাম বাড়ছে','Clothes prices rise before Eid']];
/* bargaining: every item has a fair price; the seller opens high and each stall hides its own lowest price */
const bi=(id,bn,en,fair)=>({id,bn,en,fair});
const BARGAIN={
 cloth:[bi('panjabi','পাঞ্জাবি','Panjabi',700),bi('tshirt','টি-শার্ট','T-shirt',350),bi('lungi','লুঙ্গি','Lungi',280),bi('gamchha','গামছা','Gamchha',120)],
 shoes:[bi('sandals','চামড়ার স্যান্ডেল','Leather sandals (less tiring walks)',420),bi('flip','হাওয়াই চপ্পল','Flip-flops',120)],
 attar:[bi('tupi','সুতি টুপি','Cotton prayer cap',140),bi('attar','আতর','Attar bottle',650)],
 book:[bi('novel','পুরোনো উপন্যাস','Used novel',160),bi('atlas','পুরোনো অ্যাটলাস','Old atlas',240)],
 cover:[bi('cover','মোবাইল কভার','Phone cover',120)],
};
const stallLabel=st=>st.name?L2(st.name[0],st.name[1]):L2(st.def.bn,st.def.en);
const isShop=st=>!st.dead&&st.open&&!st.hawker.hidden&&(SNACKS[st.type]||BARGAIN[st.type])&&!RESTOS.some(R=>R.st===st);
let NEARSTALL=null;
function nearStall(){let best=null,bd=3.2;for(const st of stalls){if(Math.abs(st.sx-me.x)>3.2||Math.abs(st.sy-me.y)>3.2||!isShop(st))continue;const d=Math.hypot(st.sx-me.x,st.sy-me.y);if(d<bd){bd=d;best=st}}return best}
let actLabel='';
function syncActBtn(){const b=$('btnAct');
  if(ACT.mode||INSIDE||restoState()!==0){NEARSTALL=null;if(!b.hidden)b.hidden=true;return}
  NEARSTALL=nearStall();if(!NEARSTALL){if(!b.hidden)b.hidden=true;return}
  const bargain=!!BARGAIN[NEARSTALL.type],nm=stallLabel(NEARSTALL);
  const t=bargain?L2(`দর-কষাকষি: ${nm} (Enter)`,`Bargain at ${nm} (Enter)`):L2(`কিনুন: ${nm} (Enter)`,`Buy from ${nm} (Enter)`);
  if(t!==actLabel){actLabel=t;b.textContent=t}if(b.hidden)b.hidden=false}
function tapStall(x,y){
  let hit=null,bd=2.3;for(const st of stalls){if(!isShop(st))continue;const d=Math.hypot(x-st.x,y-st.y);if(d<bd){bd=d;hit=st}}
  if(!hit)return false;
  if(Math.hypot(me.x-hit.sx,me.y-hit.sy)<3.2){openStall(hit);return true}
  const e=nearestFree(hit.sx,hit.sy,5);if(!e||!walkTo(e[0],e[1]))return true;me.actAfter=hit;return true}

/* the panel */
function showAct(){document.body.classList.add('acting');$('act').hidden=false;$('btnAct').hidden=true}
function closeAct(){if(!ACT.mode)return;if(ACT.p)ACT.p.talkUntil=0;ACT.mode=null;ACT.st=null;ACT.p=null;ACT.b=null;$('act').hidden=true;document.body.classList.remove('acting')}
const actBtn=(label,price,fn,off,note)=>{const b=document.createElement('button');b.className='dish';b.innerHTML=`<span class="dn">${label}</span><span class="dp">${price||''}</span>`;if(off){b.disabled=true;b.title=note||''}else b.onclick=fn;return b};
function actView(title,sub,say,opts){
  $('actTitle').innerHTML=title;$('actSub').textContent=sub||'';const s=$('actSay');s.textContent=say||'';s.hidden=!say;
  const o=$('actBody');o.innerHTML='';for(const b of opts)o.appendChild(b);showAct()}
const sayAs=st=>{const l=st.def.lines&&st.def.lines[0];if(l)say(pedAnchor(st.hawker),l,2.8,st.hawker)};

/* snacks and tea */
function openStall(st){
  ACT.mode=BARGAIN[st.type]?'bargain':'shop';ACT.st=st;ACT.p=null;ACT.b=null;me.path=null;me.goal=null;sayAs(st);
  if(BARGAIN[st.type])bargainList(st);else shopView(st)}
function shopView(st,note){
  const items=SNACKS[st.type],busy=simT<(me.busyUntil||0);
  actView(`<span class="bn">${st.name?st.name[0]:st.def.bn}</span>${st.name?st.name[1]:st.def.en}`,L2('কী নেবেন? দাম টাকায়, পাশে শক্তি।','What will you have? Price in taka, then the energy.'),note||L2('আসুন ভাই, কী দেব?','Come, bhai, what shall I give you?'),
    items.map((m,i)=>actBtn(`<span class="bn">${m.bn}</span> <small>${m.en}</small>`,m.how==='read'?`৳${m.price}`:`৳${m.price}<small> +${m.gain}</small>`,()=>buySnack(st,m),busy||STAT.wallet<m.price||(m.gain>0&&STAT.energy>=97),busy?L2('খাচ্ছেন…','Eating…'):STAT.wallet<m.price?L2('টাকা কম','Not enough taka'):L2('এখন খিদে নেই','Not hungry'))).concat([actBtn(L2('থাক, যাই','No thanks'),'',closeAct)]))}
function buySnack(st,m){
  if(STAT.wallet<m.price)return;addMoney(-m.price);const t=m.how==='read'?3:2.2;me.act=m.how==='read'?'carry':m.how;me.actT=simT+t;me.busyUntil=simT+t;me.spd=0;me.path=null;
  const head=m.how==='read'?mpick(HEADLINES):null;
  shopView(st,head?L2('শিরোনাম: '+head[0],'Headline: '+head[1]):L2('নিন ভাই।','Here you are.'));
  later(t,()=>{addEnergy(m.gain);HOUR=(HOUR+m.min/60)%24;updateStatusUI();if(ACT.st===st&&ACT.mode==='shop')shopView(st,m.gain?L2(`${m.bn} খেলেন · শক্তি +${m.gain}`,`Had ${m.en.toLowerCase()} · +${m.gain} energy`):head?L2('শিরোনাম: '+head[0],'Headline: '+head[1]):'');
    if(m.gain)toast(L2(`${m.bn} · শক্তি +${m.gain}`,`${m.en} · +${m.gain} energy`))})}

/* bargaining */
const r5=n=>Math.max(5,Math.round(n/5)*5);
function bargainList(st){
  const items=BARGAIN[st.type];
  actView(`<span class="bn">${st.def.bn}</span>${st.def.en}`,L2('জিনিস বেছে দর করুন। কমিয়ে চাইলে ভালো দাম পাবেন।','Pick something and haggle. Counter low and you may get a good price.'),L2('আসেন আপা-ভাই, দেখেন! এক দাম না, আপনার জন্য কম।','Come, have a look! Not a fixed price, a special one for you.'),
    items.map((it,i)=>actBtn(`<span class="bn">${it.bn}</span> <small>${it.en}</small>`,'',()=>startBargain(st,i),false)).concat([actBtn(L2('থাক, যাই','Never mind'),'',closeAct)]))}
function startBargain(st,i){
  const it=BARGAIN[st.type][i],R=mulberry32((st.seed^(i*7919))>>>0);R();
  const fair=it.fair,ask0=r5(fair*(1.8+R()*.5));let floor=fair*(.85+R()*.2);   // opens at about twice the fair price; the lowest he will go is around the fair price
  if(HOUR>=18)floor*=.96;if(rain>.3)floor*=.95;if(FRIDAY)floor*=1.03;floor=Math.max(5,r5(floor));
  ACT.b={st,it,ask0,ask:ask0,floor,patience:4,round:0};bargainView(L2(`${it.bn}? ${ACT.b.ask} টাকা!`,`${it.en}? ${ACT.b.ask} taka!`))}
function bargainView(sellerSays){
  const B=ACT.b,st=B.st,it=B.it,offers=[.4,.55,.7,.85].map(f=>r5(B.ask*f)).filter((v,i,a)=>v<B.ask&&a.indexOf(v)===i);
  const mood=B.patience>=4?'🙂':B.patience>=3?'😐':B.patience>=2?'😒':'😠';
  actView(`<span class="bn">${it.bn}</span>${it.en}`,L2(`দর: ${B.ask} টাকা · ধৈর্য ${mood}`,`Asking ৳${B.ask} · seller's patience ${mood}`),sellerSays,
    offers.map(v=>actBtn(L2(`আমি দেব ${v} টাকা`,`I'll give ৳${v}`),`৳${v}`,()=>makeOffer(v),false)).concat([
      actBtn(L2(`${B.ask} টাকাতেই নিলাম`,`Pay the asking price`),`৳${B.ask}`,()=>buyBargain(B.ask),STAT.wallet<B.ask,L2('টাকা কম','Not enough taka')),
      actBtn(L2('থাক, যাই','Walk away'),'',()=>{if(B.round>=2&&B.ask>B.floor*1.1){const last=r5(B.floor*1.08);ACT.b.ask=last;bargainView(L2(`আচ্ছা আচ্ছা, শেষ দাম ${last} টাকা! নিয়া যান!`,`Okay okay, last price ${last} taka! Take it!`))}else{bargainList(st)}})]))}
function makeOffer(v){
  const B=ACT.b;B.round++;
  if(v>=B.floor)return buyBargain(v,true);
  B.patience-=v<B.ask*.45?2:1;   // a silly-low offer offends
  if(B.patience<=0){const st=B.st;ACT.b=null;actView(`<span class="bn">${st.def.bn}</span>${st.def.en}`,'',L2('যান যান, অন্য কাস্টমার দেখি! এই দামে হবে না।','Go on, I will find another customer! Not at that price.'),[actBtn(L2('অন্য জিনিস দেখি','Look at something else'),'',()=>bargainList(st)),actBtn(L2('যাই','Leave'),'',closeAct)]);return}
  const next=Math.max(r5(B.floor*1.04),r5(v+(B.ask-v)*.55));B.ask=Math.min(B.ask,next);
  bargainView(v<B.ask0*.5?L2(`কী বলেন! এত কমে হয় নাকি? ${B.ask} টাকা দেন।`,`What are you saying! At that price? Give ${B.ask}.`):L2(`আরেকটু বাড়ান। ${B.ask} টাকা দেন, লস খাচ্ছি।`,`Go up a little. ${B.ask} taka, I am losing money.`))}
function buyBargain(price,deal){
  const B=ACT.b,it=B.it,st=B.st;if(STAT.wallet<price){bargainView(L2('টাকা তো নেই!','You do not have enough taka!'));return}
  addMoney(-price);applyPurchase(it.id);const saved=B.ask0-price;ACT.b=null;
  toast(L2(`${it.bn} কিনলেন ৳${price} · বাঁচালেন ৳${saved}`,`Bought ${it.en.split(' (')[0].toLowerCase()} for ৳${price} · saved ৳${saved}`));updateStatusUI();
  actView(`<span class="bn">${st.def.bn}</span>${st.def.en}`,'',deal?L2('ঠিক আছে, নিয়ে যান! আপনি ঘাগু লোক।','All right, take it! You drive a hard bargain.'):L2('ধন্যবাদ, আবার আসবেন!','Thank you, come again!'),
    [actBtn(L2('আরও দেখি','Look at more'),'',()=>bargainList(st)),actBtn(L2('যাই','Leave'),'',closeAct)])}
/* what a purchase does: clothes are worn, sandals ease the walk, a cap is worn */
function applyPurchase(id){
  const L=me.look,pick=a=>a[(Math.random()*a.length)|0];
  if(id==='panjabi'){L.dress='panjabi';L.c1=pick(['#f1eee6','#dfe7ee','#e8e2cf','#c9d8e8','#d9c6e8']);L.cap=false;STAT.outfit={dress:'panjabi',c1:L.c1,cap:false}}
  else if(id==='tshirt'){L.dress='pants';L.c1=pick(['#2e6fa7','#b24b4b','#7fa36b','#e2c46b','#5b7a99']);STAT.outfit={dress:'pants',c1:L.c1,cap:L.cap}}
  else if(id==='lungi'){L.dress='lungi';L.c2=pick(['#3f5f8a','#2f6b4f','#6b3f8a','#8a3f3f','#4a6f8a']);STAT.outfit={dress:'lungi',c1:L.c1,c2:L.c2,cap:L.cap}}
  else if(id==='gamchha'){L.gamchha=true;STAT.gamchha=true}
  else if(id==='tupi'){L.cap=true;STAT.outfit=Object.assign(STAT.outfit||{dress:L.dress,c1:L.c1},{cap:true})}
  else if(id==='sandals')STAT.sandals=true}
function restoreOutfit(){const o=STAT.outfit,L=me.look;if(!L)return;if(o){L.dress=o.dress||L.dress;if(o.c1)L.c1=o.c1;if(o.c2)L.c2=o.c2;L.cap=!!o.cap}if(STAT.gamchha)L.gamchha=true}

/* talking to people */
const TIPS=[['মামার টংয়ের চা নাকি দারুণ, গিয়ে দেখবেন।','They say the tea at the corner tong is the best around.'],['কাপড় কিনতে চাইলে সন্ধ্যায় যান, দাম কমে।','If you want clothes, go in the evening. Prices drop.'],['দাম শুনেই কিনবেন না, অর্ধেক বলে শুরু করেন!','Never pay the first price. Start at half!'],['বৃষ্টি এলে চায়ের দোকানে ভিড় হয়, আগে গিয়ে বসেন।','When it rains the tea stalls fill up. Go early.'],['দুপুরে অফিসপাড়ার হোটেলে লাইন লাগে।','At lunch the hotels near the offices have queues.']];
const COMPASS=[['east','পূর্ব'],['north-east','উত্তর-পূর্ব'],['north','উত্তর'],['north-west','উত্তর-পশ্চিম'],['west','পশ্চিম'],['south-west','দক্ষিণ-পশ্চিম'],['south','দক্ষিণ'],['south-east','দক্ষিণ-পূর্ব']];
const dirWords=(x,y)=>{const a=Math.atan2(-(y-me.y),x-me.x)*180/Math.PI,c=COMPASS[((Math.round(a/45)%8)+8)%8],d=Math.round(Math.hypot(x-me.x,y-me.y)/10)*10;return L2(`${c[1]} দিকে, প্রায় ${d} মিটার`,`${c[0]}, about ${d} m`)};
const talkable=p=>p&&!p.dead&&!p.hidden&&p.look&&p.role!=='me';
const pName=p=>`<span class="bn">${p.nameBn||''}</span>${p.name||''}`;
function nearPerson(){let best=null,bd=3;for(const list of[peds,fixedPeople])for(const p of list){if(!talkable(p))continue;const x=pedX(p),y=pedY(p);if(Math.abs(x-me.x)>3||Math.abs(y-me.y)>3)continue;const d=Math.hypot(x-me.x,y-me.y);if(d<bd){bd=d;best=p}}return best}
function openTalk(p){
  if(!talkable(p)){toast(L2('এর সাথে কথা বলা যাবে না।','You cannot talk to that one.'));return}
  if(Math.hypot(pedX(p)-me.x,pedY(p)-me.y)>3.2){toast(L2('আরেকটু কাছে যান।','Walk a little closer to talk.'));return}
  closeAct();ACT.mode='talk';ACT.p=p;me.path=null;me.goal=null;p.talkUntil=simT+60;p.fc=sdir(me.x-pedX(p),me.y-pedY(p))>0?1:-1;
  const first=!ACT.talked.has(p.id);ACT.talked.add(p.id);
  const greet=p.stall?(p.stall.def.lines&&p.stall.def.lines.length?LINE[p.stall.def.lines[0]][LANG==='en'?'en':'bn']:L2('আসুন ভাই!','Come, bhai!')):L2('জি, বলুন?','Yes, tell me?');
  talkView(greet,first)}
function talkView(reply,tip){
  const p=ACT.p;if(!p)return;p.talkUntil=simT+60;
  const role=p.roleText||(ROLES[p.role]?ROLES[p.role].en:'');
  const opts=[
    actBtn(L2('কেমন আছেন?','How is your day?'),'',()=>talkView(p.thought||(ROLES[p.role]?mpick(ROLES[p.role].th):L2('চলছে ভাই।','Getting by, bhai.')),Math.random()<.3)),
    actBtn(L2('আমার লক্ষ্যের পথ কোনদিকে?','Which way to my goal?'),'',()=>{const g=goalNow(),gp=goalPos();talkView(g&&gp?L2(`${g.bn.replace(/ যান$| খেয়ে নিন$/,'')}? ${dirWords(gp[0],gp[1])}।`,`${g.en.replace(/^Walk to /,'')}? ${dirWords(gp[0],gp[1])}.`):L2('জানি না ভাই, ঘুরে দেখেন।','No idea, friend. Wander and see.'),false)}),
    actBtn(L2('কাছে কোথায় ভালো খাবার পাব?','Where can I get a good meal?'),'',()=>{let best=null,bd=1e9;for(const R of RESTOS){if(!restoOpen(R))continue;const d=Math.hypot(R.entry[0]-me.x,R.entry[1]-me.y)-(R.tier>1?40:0);if(d<bd){bd=d;best=R}}
      talkView(best?L2(`${best.name[0]} ভালো${best.tier>1?', একটু দামি':''}। ${dirWords(best.entry[0],best.entry[1])}।`,`Try ${best.name[1]}${best.tier>1?' (a bit pricey)':''}. ${dirWords(best.entry[0],best.entry[1])}.`):L2('এখন সব বন্ধ, ভাই।','Everything is closed now, bhai.'),false)}),
  ];
  if(p.stall&&isShop(p.stall))opts.push(actBtn(L2('কী কী আছে?','What do you have?'),'',()=>{const st=p.stall;closeAct();openStall(st)}));
  opts.push(actBtn(L2('ধন্যবাদ, আসি','Thanks, goodbye'),'',closeAct));
  const tipLine=tip?TIPS[(Math.random()*TIPS.length)|0]:null;
  actView(pName(p),role,tipLine?`${reply}  ${L2('— '+tipLine[0],'— '+tipLine[1])}`:reply,opts)}

/* running it: prompts, keys, walking away closes the panel */
function actTick(){
  if(me.act&&simT>(me.actT||0))me.act=null;
  if(ACT.mode==='shop'||ACT.mode==='bargain'){if(Math.hypot(me.x-ACT.st.sx,me.y-ACT.st.sy)>6)closeAct()}
  else if(ACT.mode==='talk'){const p=ACT.p;if(!p||p.dead||p.hidden||Math.hypot(pedX(p)-me.x,pedY(p)-me.y)>7){toast(L2('উনি চলে গেলেন।','They walked off.'));closeAct()}}
  if(me.actAfter&&!me.path){const st=me.actAfter;me.actAfter=null;if(isShop(st)&&Math.hypot(me.x-st.sx,me.y-st.sy)<3.4)openStall(st)}
  syncActBtn()}
$('btnAct').onclick=()=>{if(NEARSTALL)openStall(NEARSTALL)};
$('actClose').onclick=closeAct;
$('cardTalk').onclick=()=>{const o=cam.follow;if(o&&o.look)openTalk(o);else toast(L2('শুধু মানুষের সাথে কথা বলা যায়।','You can only talk to people.'))};
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||INSIDE)return;const tag=e.target.tagName;
  if(e.key==='Escape'&&ACT.mode){closeAct();return}
  if(['INPUT','BUTTON','TEXTAREA','SELECT','A'].includes(tag))return;
  if(e.key==='Enter'&&!ACT.mode&&restoState()===0&&NEARSTALL)openStall(NEARSTALL);
  else if((e.key==='t'||e.key==='T')&&!ACT.mode){const p=nearPerson();if(p)openTalk(p);else toast(L2('কাছে কেউ নেই।','No one close enough to talk to.'))}});
