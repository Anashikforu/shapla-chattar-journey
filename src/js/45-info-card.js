/* ---------------- info card ---------------- */
const card=document.getElementById('card');const $=id=>document.getElementById(id);
function hideCard(){card.hidden=true}
function statusOf(o){
  if(o.T){const v=o;if(v.parked)return v.sleepy?'Napping on the seat until the afternoon rush.':'Waiting at the rickshaw stand for a fare.';if(v.dwell>0)return'Stopped in the road, taking passengers.';
    const r=v.r;if(r.stopS!==undefined&&v.s<r.stopS&&!green(r.arm)&&r.stopS-v.s<60)return'Held at Shapla Chattar by the traffic sergeant.';if(v.spd<.4)return'Stuck in the jam, squeezing sideways for a gap.';return`Moving at ${Math.round(v.spd*3.6)} km/h.`}
  if(o.role==='police')return o.kind==='constable'?'Standing in the road with a stick, waving rickshaws aside.':o.act==='wave'?'Waving his road through.':'Holding his road with a raised palm.';
  if(o.stall)return o.hidden?'Stall closed for now.':`Selling at the ${o.stall.def.en}. ${o.stall.served} customers so far.`;
  switch(o.st){case'walk':return o.onRoad?'Walking in the road; the footpath is full of stalls.':o.act==='phone'?'Walking and talking on the phone.':o.roam==='porter'?'Carrying a load on his head through the crowd.':o.roam?'Walking the footpath, calling out to buyers.':'Walking along the footpath.';
    case'go':return o.crossing?(o.wait>0?'Waiting for a gap to dash across.':'Crossing through the traffic.'):o.after==='stay'?`Heading to the ${o.stall?o.stall.def.en:'stall'}.`:o.after==='boarded'?'Running for the bus.':o.after==='bargain'?'Walking up to a rickshaw.':'Back to the footpath.';
    case'stay':return o.stall?(o.stall.type==='tea'?(o.pose==='sit'?'Sitting on the bench with a cup of tea.':'Standing with a cup of tea.'):`Buying from the ${o.stall.def.en}.`):'Taking a break.';
    case'waitBus':return'Waiting at the road edge for a bus.';case'plaza':return o.pose==='sit'?'Sitting for a while.':o.pose==='walk'?'Walking across the grounds.':'Standing around, chatting.';case'stalk':return'Following someone a little too closely…';case'flee':return'Running off with a snatched phone!';case'chase':return'Chasing the snatcher, shouting.';case'shock':return'Just got robbed. Shouting for help.';case'bargain':return'Bargaining over the fare.'}
  return''}
function showCard(o){card.hidden=false;updateCard()}
function updateCard(){const o=cam.follow;if(!o||card.hidden)return;
  if(o.T){const v=o,T=v.T;
    if(v.type==='rickshaw'){const pl=v.puller;$('cardName').innerHTML=`<span class="bn">${pl.nameBn}</span>${pl.name}`;$('cardRole').textContent=`Rickshaw puller, ${pl.age}. From ${pl.home}.`;$('cardThought').textContent=v.pax.length?`${v.pax[0].name} is paying ${v.fare} taka for this ride.`:'Pays 150 taka a day to rent this rickshaw from the garage owner.';$('cardFacts').textContent=`Hood ${v.hoodUp?'up':'down'} · ${v.pax.length} passenger${v.pax.length===1?'':'s'}`}
    else if(v.type==='bus'||v.type==='dd'){$('cardName').innerHTML=`<span class="bn">${v.coach?'দূরপাল্লার কোচ':T.bn}</span>${v.type==='dd'?'BRTC':(v.brt?v.brt[1]:'')}`;$('cardRole').textContent=`Driver ${v.driverName}, helper ${v.helper.name} (${v.helper.age}) at the door.`;$('cardThought').textContent=`About ${v.paxN} people inside, ${v.hangers.length+1} hanging at the door.`;$('cardFacts').textContent=v.type==='dd'?'State-run double-decker':'Private company bus, stops wherever someone waves'}
    else if(v.type==='bike'){$('cardName').innerHTML=`<span class="bn">${T.bn}</span>${v.rider.name}`;$('cardRole').textContent=`${ROLES[v.rider.role]?ROLES[v.rider.role].en:'Rider'}, ${v.rider.age}${v.pillion?', with a passenger':''}.`;$('cardThought').textContent=v.rider.thought||'';$('cardFacts').textContent=''}
    else if(v.type==='cash'){$('cardName').innerHTML=`<span class="bn">${T.bn}</span>Cash carrier`;$('cardRole').textContent='Moving bundles of notes between bank branches.';$('cardThought').textContent='Two guards with shotguns ride in the back. It never stops for anyone.';$('cardFacts').textContent=''}
    else if(v.type==='thela'){$('cardName').innerHTML=`<span class="bn">${T.bn}</span>${v.pusher.name}`;$('cardRole').textContent=`Pushes a cart for a Dilkusha wholesaler. ${v.pusher.age}, from ${v.pusher.home}.`;$('cardThought').textContent=`Carrying ${v.load} to a shop two roads away. 200 taka a trip.`;$('cardFacts').textContent=''}
    else{$('cardName').innerHTML=`<span class="bn">${T.bn}</span>${T.en}`;$('cardRole').textContent=`Driver ${v.driverName||mpick(MALE)}, from ${v.home||mpick(HOME)}.`;$('cardThought').textContent=v.type==='cng'?'Meter says one fare, the passenger will pay another.':v.type==='car'?'Office car. The boss is late for a board meeting.':'Shared ride, 10 taka a seat.';$('cardFacts').textContent=''}}
  else{const p=o;$('cardName').innerHTML=`<span class="bn">${p.nameBn||''}</span>${p.name}`;
    const role=p.roleText?p.roleText:p.role==='police'?(p.kind==='constable'?'Traffic constable':'Traffic sergeant'):p.stall?`${cap(p.stall.def.en)} seller`:p.roam==='badam'?'Peanut seller':p.roam==='water'?'Water seller':p.roam==='paper'?'Newspaper hawker':p.roam==='porter'?'Porter':ROLES[p.role]?ROLES[p.role].en:'';
    $('cardRole').textContent=`${role}, ${p.age}. From ${p.home}.`;
    $('cardThought').textContent=p.role==='player'?'Evening kickabout on the club ground before the light goes.':p.stall?`Has sold on this footpath for ${p.years} years. Pays 200 taka a day to keep the spot.`:p.role==='police'?`On duty since 7 in the morning. ${p.years} years in traffic.`:p.thought||'';
    $('cardFacts').textContent=p.stall&&p.stall.name?(LANG==='en'?p.stall.name[1]:p.stall.name[0]):''}
  $('cardNow').textContent=statusOf(o)}
const cap=s=>s[0].toUpperCase()+s.slice(1);
$('cardClose').onclick=()=>unfollow();

