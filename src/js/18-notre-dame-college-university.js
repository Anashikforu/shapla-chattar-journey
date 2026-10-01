/* ---------- Notre Dame College & University ---------- */
function genNDC(){
  const F=reserveSite(300,-9,88,64);if(!F)return;sites.ndc=F;paintPlaza(F,'#cfc6ae');paintRect(F,50,86,6,40,'#8fb069',.72);court(F,54,82,44,60,'#c9803f','basket');
  addBuilding([{q:FQ(F,4,46,4,18),h:15,kind:'ndc',col:'#b5603f',signText:['নটর ডেম কলেজ','Notre Dame College'],signCol:'#1f3a6b'}],{name:['নটর ডেম কলেজ','Notre Dame College'],landmark:true});
  addBuilding([{q:FQ(F,4,20,24,58),h:11,kind:'ndc',col:'#b86a48'}],{});
  addBuilding([{q:FQ(F,26,44,40,58),h:7,kind:'mosque',col:'#e8ece6'}],{mosque:true});
  trees2(F,[[56,10,'raintree'],[74,12,'krishnachura'],[64,30,'banyan'],[30,28,'mehogoni']]);
  addCrowd(F,[[22,48,20,36],[50,86,6,40]],collegian,()=>HOUR>7.5&&HOUR<16.5&&!FRIDAY?60:6);
  const U=reserveSite(360,-18,34,30);if(U)addBuilding([{q:U.q,h:16,kind:'office',col:'#e3e6e8'},{q:inset(U.q,.78),z0:16,h:34,kind:'glass',col:'#7fa7bf'}],{name:['নটর ডেম বিশ্ববিদ্যালয়','Notre Dame University Bangladesh'],landmark:true});
}
