
/* ---------------- beggars: people sitting with a bowl at the mosque, the station, the bridges and the busy footpaths ---------------- */
const BEGGAR_THOUGHTS=[
 ['কুড়িগ্রাম থেকে এসেছি, বন্যায় জমি ভেসে গেছে।','I came from Kurigram. The flood took our land.'],
 ['দুই দিন ভালো করে খাওয়া হয়নি, বেশি কিছু চাই না।','Two days without a proper meal. I do not ask for much.'],
 ['আমার ছেলে স্টেশনের কাছে বাদাম বেচে, আমি এখানে বসি।','My son sells peanuts near the station. I sit here.'],
 ['কারখানার কাজটা চলে গেছে। এখন যা পাই তাই।','I lost my job at the factory. Now it is whatever comes.'],
 ['ওষুধের টাকা জোগাড় করছি, পা ভালো না।','I am collecting for medicine. My leg is bad.']];
const GIVE_THANKS=[['আল্লাহ আপনার ভালো করুক।','May God be good to you.'],['দোয়া করি বাবা, অনেক বড় হন।','My blessings on you, child.'],['জাযাকাল্লাহ, ভাই।','Thank you, brother.']];
function genBeggars(){
  const spots=[],add=(x,y)=>{if(x!=null)spots.push([x,y])};
  const B=sites.baitul,K=sites.kamalapur;   // the mosque forecourt and the station front
  if(B)for(const[a,b]of[[12,6],[B.L-12,6],[B.L/2+4,B.D-6]])add(...FW(B,a,b));
  if(K)for(const[a,b]of[[15,8],[50,6],[85,8]])add(...FW(K,a,b));
  for(const br of bridges.slice(0,4))add(br.x+br.lx*(br.half+1.3),br.y+br.ly*(br.half+1.3));   // at the foot of overbridge stairs
  const fp=walks.filter(w=>!w.closed&&w.side!==0&&w.len>60);
  for(let i=0;i<6&&fp.length;i++){const P=rpick(fp),o=[];walkPos(P,rr(10,P.len-10),-(P.sw/2)+.6,o);if(inWorld(o[0],o[1],-20))add(o[0],o[1])}
  const placed=[];
  for(const[x,y]of spots){const f=nearestFree(x,y,5);if(!f||cellAt(f[0],f[1])===2)continue;
    if(placed.some(q=>Math.hypot(q[0]-f[0],q[1]-f[1])<8)||RESTOS.some(R=>Math.hypot(R.entry[0]-f[0],R.entry[1]-f[1])<5))continue;   // not on top of each other, never in a doorway
    placed.push(f);const fem=Math.random()<.45,p=makePerson('beggar',fem),L=p.look;
    Object.assign(L,{skin:mpick(['#6b4028','#7a4a30','#8d5a3b']),hair:'#9a958c',h:L.h*.94,bag:false,tie:false,cap:false,gamchha:false,beard:!fem&&Math.random()<.6});
    if(fem){L.dress='sari';L.c1=mpick(['#8a7a68','#7a6a5a','#9a8a78']);L.c2=L.c1;L.headCover=true}else{L.dress='lungi';L.c1=mpick(['#bfae8a','#a89a7a','#b5a68c']);L.c2=mpick(['#6b6b5a','#5a5a4a']);L.cap=Math.random()<.4}
    const th=mpick(BEGGAR_THOUGHTS);
    Object.assign(p,{fixed:true,beggar:true,bowl:true,pose:'sit',act:null,fc:Math.random()<.5?1:-1,x:f[0],y:f[1],dx:f[0],dy:f[1],age:40+(Math.random()*30|0),thought:th[0],thoughtEn:th[1],roleText:fem?'Woman asking for alms':'Man asking for alms',callT:mr(5,20)});
    fixedPeople.push(p);beggars.push(p)}
}
const beggars=[];
/* they call out softly when you pass close; never loud, never following */
function updBeggars(dt){
  for(const p of beggars){p.callT-=dt;if(p.callT>0)continue;p.callT=mr(25,50);
    if(Math.hypot(p.x-me.x,p.y-me.y)<9)say(pedAnchor(p),p.look.female?'beggar_2':'beggar_1',3.2,p)}}
/* giving: the talk panel for a beggar offers 5, 10 or 20 taka */
function beggarOptions(p){
  const give=n=>actBtn(L2(`${n} টাকা দিন`,`Give ৳${n}`),`৳${n}`,()=>{addMoney(-n);STAT.alms=(STAT.alms||0)+n;updateStatusUI();const t=GIVE_THANKS[(Math.random()*GIVE_THANKS.length)|0];
      toast(L2(`${n} টাকা দিলেন`,`You gave ৳${n}`));talkView(L2(t[0],t[1]),n>=20)},STAT.wallet<n,L2('টাকা কম','Not enough taka'));
  return[give(5),give(10),give(20),actBtn(L2('দুঃখিত, আজ না','Sorry, not today'),'',closeAct)]}
