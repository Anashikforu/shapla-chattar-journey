/* ---------------- people ---------------- */
const MALE=['Karim','Rahim','Jamal','Babul','Shafiq','Hasan','Kamal','Anwar','Sohel','Liton','Mamun','Sumon','Habib','Rafiq','Monir','Abul','Alamgir','Jashim','Nurul','Tareq','Rubel','Shahin','Faruk','Mizan','Selim','Belal'];
const MALE_BN={Karim:'করিম',Rahim:'রহিম',Jamal:'জামাল',Babul:'বাবুল',Shafiq:'শফিক',Hasan:'হাসান',Kamal:'কামাল',Anwar:'আনোয়ার',Sohel:'সোহেল',Liton:'লিটন',Mamun:'মামুন',Sumon:'সুমন',Habib:'হাবিব',Rafiq:'রফিক',Monir:'মনির',Abul:'আবুল',Alamgir:'আলমগীর',Jashim:'জসিম',Nurul:'নুরুল',Tareq:'তারেক',Rubel:'রুবেল',Shahin:'শাহীন',Faruk:'ফারুক',Mizan:'মিজান',Selim:'সেলিম',Belal:'বেলাল'};
const FEMALE=['Salma','Nasrin','Rina','Mitu','Fatema','Ruma','Tania','Parvin','Shirin','Jahanara','Sumi','Rokeya','Lipi','Moushumi','Shapla','Nazma'];
const FEMALE_BN={Salma:'সালমা',Nasrin:'নাসরিন',Rina:'রিনা',Mitu:'মিতু',Fatema:'ফাতেমা',Ruma:'রুমা',Tania:'তানিয়া',Parvin:'পারভীন',Shirin:'শিরিন',Jahanara:'জাহানারা',Sumi:'সুমি',Rokeya:'রোকেয়া',Lipi:'লিপি',Moushumi:'মৌসুমী',Shapla:'শাপলা',Nazma:'নাজমা'};
const HOME=['Rangpur','Kurigram','Gaibandha','Jamalpur','Mymensingh','Bhola','Barishal','Kishoreganj','Netrokona','Sirajganj','Cumilla','Noakhali','Faridpur','Bogura'];
const ROLES={
 office:{bn:'অফিসকর্মী',en:'Office worker',w:3,f:.35,th:['Boss wants the quarterly report by three.','If I miss the 6:10 bus, I reach Mirpur at nine.','Salary day. First stop: Mayer Doa Hotel.','The lift in our building broke again. Eleventh floor.']},
 banker:{bn:'ব্যাংক কর্মকর্তা',en:'Bank officer',w:2,f:.4,th:['Three loan files, one signature missing.','Clearing closes at 2:30. Walk faster.','The ATM downstairs keeps eating cards.']},
 peon:{bn:'অফিস পিয়ন',en:'Office peon',w:1,f:0,th:['This file goes to the 14th floor, then tea.','Twenty-two years at this office. Four bosses.']},
 student:{bn:'ছাত্র',en:'Student',w:1.2,f:.45,th:['Coaching at four, then tuition in Arambagh.','Admission fee has to be paid at a bank counter today.']},
 labour:{bn:'দিনমজুর',en:'Day labourer',w:1.2,f:.05,th:['Unloading paper rolls at the press on Dilkusha.','Sent three thousand taka home this week.']},
 customer:{bn:'ব্যাংকের গ্রাহক',en:'Bank customer',w:1.5,f:.5,th:['Pension paperwork, third visit this month.','Need a pay order before the counter closes.']},
 garment:{bn:'পোশাককর্মী',en:'Garment worker',w:.7,f:.85,th:['Overtime tonight. Will call Amma from the bus.']},
 courier:{bn:'কুরিয়ারকর্মী',en:'Courier',w:.5,f:0,th:['Eleven parcels left. The 23rd floor one first.']},
};
let PID=1;
function makeLook(role,female){
  const L={female,skin:mpick(SKIN),h:(female?1.54:1.67)*mr(.95,1.05),hair:'#1f1b18'};
  if(role==='kid')L.h=1.15;
  if(female){L.dress=role==='garment'||Math.random()<.42?'sari':Math.random()<.65?'salwar':'borka';L.c1=mpick(SARI);L.c2=mpick(SARI);L.headCover=L.dress==='borka'||Math.random()<.45;if(L.dress==='borka')L.c1=mpick(['#1c1c28','#2a2a3a','#3a2a2a'])}
  else{const poor=['labour','hawker','puller','kid','roam','helper'].includes(role);L.dress=poor?(Math.random()<.65?'lungi':'pants'):(Math.random()<.12?'panjabi':'pants');
    L.c1=L.dress==='panjabi'?mpick(['#f1eee6','#e8e2cf','#dfe7ee']):mpick(SHIRT);L.c2=L.dress==='lungi'?mpick(LUNGI):mpick(PANTS);
    L.cap=L.dress==='panjabi'||Math.random()<.08;L.beard=Math.random()<.25;L.tie=(role==='banker'||role==='office')&&Math.random()<.35;L.gamchha=role==='puller'||(role==='labour'&&Math.random()<.5)}
  L.bag=['office','student','banker','customer'].includes(role)&&Math.random()<.55;L.umbCol=mpick(UMB);L.hasUmb=Math.random()<.7;
  return L;
}
function makePerson(role,female){
  if(female===undefined)female=Math.random()<(ROLES[role]?ROLES[role].f:.1);
  const name=female?mpick(FEMALE):mpick(MALE);
  const p={id:PID++,role,look:makeLook(role,female),name,nameBn:female?FEMALE_BN[name]:MALE_BN[name],age:role==='kid'?(10+Math.random()*4|0):(20+Math.random()*40|0),home:mpick(HOME),
    x:0,y:0,dx:0,dy:0,fc:Math.random()<.5?1:-1,ph:Math.random()*TAU,pose:'stand',act:null,actT:0,sayUntil:0};
  p.thought=ROLES[role]?mpick(ROLES[role].th):'';
  return p;
}
const VT={
 rickshaw:{len:2.5,wid:1.15,v:[3.2,4.4],acc:1.2,bn:'রিকশা',en:'Cycle rickshaw'},
 cng:{len:2.8,wid:1.4,v:[7,10],acc:2.5,bn:'সিএনজি',en:'CNG auto-rickshaw'},
 car:{len:4.4,wid:1.8,v:[8,12],acc:3,bn:'প্রাইভেট কার',en:'Private car'},
 bus:{len:10,wid:2.5,v:[6,9],acc:1.4,bn:'লোকাল বাস',en:'Local bus'},
 dd:{len:10.8,wid:2.5,v:[6,8],acc:1.2,bn:'বিআরটিসি দোতলা বাস',en:'BRTC double-decker'},
 bike:{len:2,wid:.8,v:[9,13],acc:3.5,bn:'মোটরসাইকেল',en:'Motorbike'},
 leguna:{len:3.8,wid:1.6,v:[6,9],acc:2,bn:'লেগুনা',en:'Leguna minibus'},
};
const BUS_LIVERY=[['#2e6fa7','#f2f2ea'],['#c8453a','#f2c14e'],['#2f7a4f','#f2f2ea'],['#6a3f8a','#e7d9a8'],['#d98a2b','#3a3a3f']];
const BUS_ROUTES=[['গুলিস্তান - কমলাপুর','Gulistan - Kamalapur','helper_kamalapur_1'],['সায়েদাবাদ - গুলিস্তান','Sayedabad - Gulistan','helper_gulistan_1'],['মিরপুর - মতিঝিল','Mirpur - Motijheel','helper_namen_1']];
const HOOD=['#1d2b4a','#6b1f2a','#1f4a3a','#3a1f4a'];
let VID=1;
function mkVehicle(type,route){
  const T=VT[type],v={id:VID++,type,T,r:route,s:0,i:0,x:0,y:0,dx:0,dy:0,hx:1,hy:0,spd:0,vmax:mr(T.v[0],T.v[1]),len:T.len,wid:T.wid,stuck:0,squeeze:0,dwell:0,served:false,honkT:mr(2,8)};
  if(type==='car')v.col=mpick(['#e9e7e1','#b9bcc0','#2d2f33','#9b2d2d','#3c5a7a','#c9b27a']);
  if(type==='cng')v.col='#3d8b4a';
  if(type==='leguna')v.col=mpick(['#3b7f86','#8a6d3b','#56708a']);
  if(type==='bike')v.col=mpick(['#b71c1c','#222','#1f3a6b']);
  if(type==='bus'){const l=mpick(BUS_LIVERY);v.col=l[0];v.col2=l[1];v.brt=mpick(BUS_ROUTES)}
  if(type==='dd'){v.col='#c0392b';v.col2='#f2f2ea';v.brt=['বিআরটিসি','BRTC','helper_gulistan_1']}
  if(type==='rickshaw'){v.puller=makePerson('puller',false);v.hood=mpick(HOOD);v.art=[mpick(SARI),mpick(SARI),mpick(['#f9a825','#2e7d32','#1565c0'])];v.pax=[];if(Math.random()<.6){v.pax.push(makePerson(mpick(['office','customer','student','garment'])));if(Math.random()<.3)v.pax.push(makePerson('customer'))}v.fare=[40,50,60,70,80][Math.random()*5|0];v.hoodUp=Math.random()<.35}
  if(type==='bus'||type==='dd'){v.helper=makePerson('helper',false);v.helper.look.dress='pants';v.driverName=mpick(MALE);v.paxN=20+(Math.random()*40|0)}
  if(type==='bike'){v.rider=makePerson(mpick(['office','courier','student']),false);v.rider.helmet=mpick(['#b71c1c','#222','#e0a526','#1f3a6b']);v.pillion=Math.random()<.35?makePerson('customer'):null}
  if(type==='car'||type==='cng'||type==='leguna'){v.driverName=mpick(MALE);v.home=mpick(HOME)}
  return v;
}
