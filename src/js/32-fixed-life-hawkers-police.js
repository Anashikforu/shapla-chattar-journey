/* ---------------- fixed life: hawkers, police ---------------- */
function updFixed(dt){
  for(const st of stalls){const h=st.def.h;const open=HOUR>=h[0]&&HOUR<h[1]&&!(rain>.7&&['paper','book','shoes','cloth'].includes(st.type));
    if(st.open&&!open)for(const s of st.slots)if(s.who)s.who.stayT=0;st.open=open;st.hawker.hidden=!open;if(!open||!st.def.lines.length)continue;
    st.callT-=dt;if(st.callT<=0){const ff=footfall();st.callT=mr(10,26)/(.3+ff)*((st.type==='hotel'||st.type==='grill')&&(RHY.lunch()||RHY.dinner())?.5:1);if(ff>.12&&(onScreen(st.x,st.y)||Math.random()<.2))say(pedAnchor(st.hawker),mpick(st.def.lines),3.2,st.hawker)}
    if(st.type==='tea'){st.chatT-=dt;if(st.chatT<=0){st.chatT=mr(18,35);const sit=st.slots.filter(s=>s.who&&s.who.st==='stay');if(sit.length>=2){const A1=sit[0].who,B1=sit[1].who,pair=mpick([['tea_chat_1','tea_chat_2'],['tea_chat_3','tea_chat_4']]);
      say(pedAnchor(A1),pair[0],3.2,A1);later(3.2,()=>{if(!B1.dead)say(pedAnchor(B1),pair[1],3,B1)});if(pair[1]==='tea_chat_4')later(6.4,()=>say(pedAnchor(st.hawker),'hawker_tea_2',2.6,st.hawker))}}}}
  for(const s of stands){if(s.parked.length<3&&!s.busy){s.refillT-=dt;if(s.refillT<=0){addParked(s,s.parked.length);s.refillT=mr(25,60)}}for(const v of s.parked){v.sleepy=(HOUR>13&&HOUR<15.5)||RHY.night();v.hoodUp=rain>.3||v.sleepy}}
  for(const pd of podiums){if(!pd.cop)continue;const g=green(pd.arm);pd.cop.act=g?'wave':'police'}
  for(const f of fixedPeople)if(f.kind==='constable'){f.fc=Math.sin(simT*.3+f.x)>0?1:-1;if(Math.random()<dt/90&&onScreen(f.x,f.y))say(pedAnchor(f),mpick(['police_side_1','police_stop_1']),2.4,f)}
}

