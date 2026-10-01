/* ---------- schools ---------- */
function genSchools(){
  let F=null;for(const[r,dg]of[[330,60],[300,72],[360,52],[320,140],[340,-60],[300,160]]){F=reserveSite(r,dg,104,80);if(F)break}if(F){sites.mgbhs=F;paintPlaza(F,'#d6cbb0');court(F,6,52,30,76,'#8fb069','cricket');court(F,56,100,30,76,'#8fb069','foot');
    addBuilding([{q:FQ(F,4,100,4,20),h:12,kind:'school',col:'#e6cf8a',signText:['মতিঝিল সরকারি বালক উচ্চ বিদ্যালয়','Motijheel Govt Boys\' High School'],signCol:'#2e7d32'}],{name:['মতিঝিল সরকারি বালক উচ্চ বিদ্যালয়','Motijheel Govt Boys\' High School'],landmark:true});
    trees2(F,[[4,26,'raintree'],[102,28,'krishnachura']]);
    addCrowd(F,[[8,50,32,74],[58,98,32,74],[6,100,22,28]],()=>pupil(false),()=>HOUR>7&&HOUR<17.3&&!FRIDAY?(HOUR>15.5?70:40):4)}
  const G=reserveSite(250,106,58,44);if(G){sites.ideal=G;paintPlaza(G,'#d6cbb0');
    addBuilding([{q:FQ(G,4,54,10,40),h:34,kind:'school',col:'#dfe3e6',signText:['আইডিয়াল স্কুল অ্যান্ড কলেজ','Ideal School and College'],signCol:'#1a5276'}],{name:['আইডিয়াল স্কুল অ্যান্ড কলেজ','Ideal School and College'],landmark:true});
    addCrowd(G,[[4,54,1,8]],guardian,()=>HOUR>10.8&&HOUR<13.8&&!FRIDAY?45:HOUR>7&&HOUR<8.2&&!FRIDAY?25:0);
    addCrowd(G,[[4,54,1,9]],()=>pupil(Math.random()<.5),()=>(HOUR>12.4&&HOUR<13.6)||(HOUR>7&&HOUR<7.9)?50:0)}
}
