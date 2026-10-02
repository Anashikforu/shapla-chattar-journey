/* ---------------- audio ---------------- */
const A={ctx:null,master:null,on:false,clips:new Map(),hum:null,humG:null,rainG:null,nightG:null,loops:{},active:0,noise:null};
function audioInit(){
  if(A.ctx)return;A.ctx=new (window.AudioContext||window.webkitAudioContext)();
  const comp=A.ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(A.ctx.destination);
  A.master=A.ctx.createGain();A.master.gain.value=.9;A.master.connect(comp);
  const n=A.ctx.sampleRate*2,buf=A.ctx.createBuffer(1,n,A.ctx.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.2}
  const wbuf=A.ctx.createBuffer(1,n,A.ctx.sampleRate),wd=wbuf.getChannelData(0);for(let i=0;i<n;i++)wd[i]=Math.random()*2-1;A.noise=wbuf;
  const hs=A.ctx.createBufferSource();hs.buffer=buf;hs.loop=true;const lp=A.ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;A.humG=A.ctx.createGain();A.humG.gain.value=0;hs.connect(lp);lp.connect(A.humG);A.humG.connect(A.master);hs.start();
  const rs=A.ctx.createBufferSource();rs.buffer=wbuf;rs.loop=true;const hp=A.ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=1400;A.rainG=A.ctx.createGain();A.rainG.gain.value=0;rs.connect(hp);hp.connect(A.rainG);A.rainG.connect(A.master);rs.start();
  const cs=A.ctx.createBufferSource();cs.buffer=wbuf;cs.loop=true;const bp=A.ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=850;bp.Q.value=.7;A.crowdG=A.ctx.createGain();A.crowdG.gain.value=0;cs.connect(bp);bp.connect(A.crowdG);A.crowdG.connect(A.master);cs.start();   // crowd murmur, from the people near you
  for(const id of['amb_city','amb_rain','amb_night'])startLoop(id);
}
function startLoop(id){if(!A.ctx||A.loops[id]||!A.clips.has(id))return;const s=A.ctx.createBufferSource();s.buffer=A.clips.get(id)[0];s.loop=true;const g=A.ctx.createGain();g.gain.value=0;s.connect(g);g.connect(A.master);s.start();A.loops[id]=g}
/* the listener is the avatar. How far a sound carries depends on what it is; pan follows the direction relative to the camera's facing. */
const AUDIO_R={voice:40,horn:120,bell:45,whistle:80,crow:90,slap:35,train:260};
const audioKind=id=>id.startsWith('sfx_horn')?'horn':id==='sfx_rickshaw_bell'?'bell':id==='sfx_whistle'?'whistle':id==='sfx_crow'?'crow':id==='sfx_bus_slap'?'slap':id==='sfx_train_horn'?'train':'voice';
const rolloff=(d,R)=>d<2?1:Math.pow(clamp(1-(d-2)/(R-2),0,1),1.6);
/* metres of building between two points, walked in 2 m steps over the building-footprint raster */
function occlusion(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0);if(d<6)return 0;const n=Math.min(70,Math.ceil(d/2)),sx=(x1-x0)/n,sy=(y1-y0)/n;let hits=0;for(let i=1;i<n;i++){const k=mk(x0+sx*i,y0+sy*i);if(k>=0&&WALL[k])hits++}return hits*(d/n)}
const LIS={x:0,y:0};
function listener(){const k=cam.follow===me?0:clamp((4-cam.zoom)/3,0,.5);LIS.x=me.x+(cam.x-me.x)*k;LIS.y=me.y+(cam.y-me.y)*k;return LIS}
function spatial(x,y,id=''){
  const l=listener(),dx=x-l.x,dy=y-l.y,d=Math.hypot(dx,dy);let g=rolloff(d,AUDIO_R[audioKind(id)]);if(g<.01)return{g:0,pan:0,lp:0};
  const pan=clamp((dx*RXW+dy*RYW)/Math.max(d,6),-1,1);   // RXW,RYW = which way is screen-right in the world
  const wall=occlusion(l.x,l.y,x,y);let lp=0;if(wall>3){lp=clamp(5000/(1+wall/6),450,5000);g*=1-Math.min(.45,wall/70)}   // behind buildings: duller and quieter
  return{g,pan,lp}}
function outNode(g,pan,lp){const gn=A.ctx.createGain();gn.gain.value=g;let last=gn;if(lp){const f=A.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;last.connect(f);last=f}if(A.ctx.createStereoPanner){const p=A.ctx.createStereoPanner();p.pan.value=pan;last.connect(p);last=p}last.connect(A.master);return gn}
function playClip(id,sp,rate=1){const arr=A.clips.get(id);if(!arr)return false;if(A.active>5)return true;const src=A.ctx.createBufferSource();src.buffer=arr[(Math.random()*arr.length)|0];src.playbackRate.value=rate;src.connect(outNode(sp.g,sp.pan,sp.lp));A.active++;src.onended=()=>A.active--;src.start();return true}
function playVoice(id,x,y){if(!A.on||!A.clips.has(id))return;const sp=spatial(x,y,id);if(sp.g<.03)return;playClip(id,sp,mr(.98,1.02))}
function env(g,t,a,peak,dec){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+a+dec)}
function osc(type,f,t,dur,out,peak=.3,a=.01){const o=A.ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);const g=A.ctx.createGain();env(g,t,a,peak,dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+a+dur+.05);return o}
const SYN={
  sfx_horn_car(o,t){const f=A.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=2400;f.connect(o);const n=Math.random()<.5?2:1;for(let i=0;i<n;i++){osc('square',415,t+i*.3,.22,f,.18);osc('square',440,t+i*.3,.22,f,.14)}},
  sfx_horn_bus(o,t){const f=A.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=1700;f.connect(o);for(const fr of[311,392,466])osc('sawtooth',fr,t,.7,f,.12,.04)},
  sfx_horn_cng(o,t){const f=A.ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=1300;f.Q.value=2;f.connect(o);osc('square',720,t,.1,f,.35);osc('square',720,t+.16,.12,f,.35)},
  sfx_horn_bike(o,t){osc('square',880,t,.13,o,.12);if(Math.random()<.5)osc('square',880,t+.2,.13,o,.12)},
  sfx_rickshaw_bell(o,t){for(let i=0;i<(Math.random()<.5?2:3);i++){osc('sine',2350,t+i*.13,.28,o,.16,.002);osc('sine',3420,t+i*.13,.2,o,.07,.002)}},
  sfx_whistle(o,t){const w=A.ctx.createOscillator();w.frequency.value=2650;const l=A.ctx.createOscillator();l.frequency.value=32;const lg=A.ctx.createGain();lg.gain.value=140;l.connect(lg);lg.connect(w.frequency);const g=A.ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.02);g.gain.setValueAtTime(.16,t+.45);g.gain.linearRampToValueAtTime(0,t+.5);g.gain.setValueAtTime(0,t+.62);g.gain.linearRampToValueAtTime(.16,t+.64);g.gain.linearRampToValueAtTime(0,t+.8);w.connect(g);g.connect(o);w.start(t);l.start(t);w.stop(t+.9);l.stop(t+.9)},
  sfx_crow(o,t){const f=A.ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=1000;f.Q.value=3;f.connect(o);for(let i=0;i<2;i++){const s=A.ctx.createOscillator();s.type='sawtooth';s.frequency.setValueAtTime(640,t+i*.32);s.frequency.exponentialRampToValueAtTime(470,t+i*.32+.24);const g=A.ctx.createGain();env(g,t+i*.32,.02,.35,.24);s.connect(g);g.connect(f);s.start(t+i*.32);s.stop(t+i*.32+.3)}},
  sfx_train_horn(o,t){const f=A.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=1200;f.connect(o);for(const[fr,d]of[[233,0],[294,0],[233,1.3],[294,1.3]])osc('sawtooth',fr,t+d,1,f,.14,.08)},
  sfx_bus_slap(o,t){for(let i=0;i<2;i++){const s=A.ctx.createBufferSource();s.buffer=A.noise;const f=A.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=500;const g=A.ctx.createGain();env(g,t+i*.18,.003,.5,.09);s.connect(f);f.connect(g);g.connect(o);s.start(t+i*.18,Math.random());s.stop(t+i*.18+.12)}},
};
function sfx(id,x,y,gm=1){if(!A.on)return;const sp=spatial(x,y,id);sp.g*=gm;if(sp.g<.02)return;if(A.clips.has(id)){playClip(id,sp,mr(.95,1.05));return}const f=SYN[id];if(f)f(outNode(sp.g,sp.pan,sp.lp),A.ctx.currentTime+.01)}
/* how much traffic and how many people are around the avatar: nearer counts more, parked cars barely, buses double */
function nearbyLevels(){
  let tr=0,cr=0;
  for(const v of vehicles){const dx=v.x-me.x,dy=v.y-me.y;if(dx>70||dx<-70||dy>70||dy<-70)continue;const d=Math.hypot(dx,dy);if(d>=70)continue;const w=(1-d/70)**2;tr+=w*(v.parked?.15:1)*(v.type==='bus'||v.type==='dd'?2:1)}
  for(const list of[peds,fixedPeople])for(const p of list){if(p.hidden||p.dead)continue;const dx=(p.fixed?p.x:p.dx)-me.x,dy=(p.fixed?p.y:p.dy)-me.y;if(dx>28||dx<-28||dy>28||dy<-28)continue;const d=Math.hypot(dx,dy);if(d>=28)continue;cr+=(1-d/28)**2}
  let traffic=1-Math.exp(-tr/5),crowd=1-Math.exp(-cr/8),rainMul=1;
  const G=sites.green;if(G&&inQuad(G.q,me.x,me.y)){traffic*=.4;crowd*=.6}   // the park is calmer
  for(const st of stalls){if(!st.can||Math.abs(st.x-me.x)>2.5||Math.abs(st.y-me.y)>2.5)continue;rainMul=1.35;break}   // rain drumming on a tarp
  return{traffic,crowd,rainMul}}
let audioN=0;
function audioTick(dt){
  if(!A.on||!A.ctx)return;const t=A.ctx.currentTime;
  if(audioN++%8===0)A.lvl=nearbyLevels();const L=A.lvl||{traffic:0,crowd:0,rainMul:1},tl=L.traffic,cl=L.crowd,rm=L.rainMul||1;
  const city=A.loops.amb_city;if(city){city.gain.setTargetAtTime(.55*(.18+.82*clamp(tl*.8+cl*.35,0,1)),t,.5);A.humG.gain.setTargetAtTime(0,t,.5)}else A.humG.gain.setTargetAtTime(.22*(.15+.85*tl),t,.5);
  if(A.crowdG)A.crowdG.gain.setTargetAtTime(.07*cl,t,.6);
  const rl=A.loops.amb_rain;if(rl){rl.gain.setTargetAtTime(rain*.7*rm,t,.8);A.rainG.gain.setTargetAtTime(0,t,.5)}else A.rainG.gain.setTargetAtTime(rain*.09*rm,t,.8);
  const nl=A.loops.amb_night;if(nl)nl.gain.setTargetAtTime(lightsOn()*.35*(1-tl*.5),t,1);
  // horns from vehicles that are actually within earshot keep the street breathing
  if(Math.random()<dt*1.4*trafficRate()&&vehicles.length){for(let k=0;k<6;k++){const v=mpick(vehicles);if(v.parked||Math.hypot(v.x-me.x,v.y-me.y)>130)continue;sfx(v.type==='bus'||v.type==='dd'?'sfx_horn_bus':v.type==='cng'?'sfx_horn_cng':v.type==='bike'?'sfx_horn_bike':v.type==='rickshaw'?'sfx_rickshaw_bell':'sfx_horn_car',v.x,v.y,.5);break}}
}
/* inside a restaurant the world is paused, so this runs from the room's own frame instead of audioTick */
function audioIndoors(tier){
  if(!A.on||!A.ctx)return;const t=A.ctx.currentTime,L=A.lvl||{traffic:0,crowd:0},mu=.28;
  const city=A.loops.amb_city;if(city)city.gain.setTargetAtTime(.55*(.18+.82*clamp(L.traffic*.8+L.crowd*.35,0,1))*mu,t,.4);A.humG.gain.setTargetAtTime(city?0:.22*(.15+.85*L.traffic)*mu,t,.4);
  if(A.crowdG)A.crowdG.gain.setTargetAtTime(.07*(tier===1?.9:.5),t,.5);   // chatter in the room itself
  const rm=tier===1?1.5:.3,rl=A.loops.amb_rain;if(rl)rl.gain.setTargetAtTime(rain*.7*rm,t,.5);else A.rainG.gain.setTargetAtTime(rain*.09*rm,t,.5)}
async function loadAudioFiles(files){
  if(!A.ctx)audioInit();let n=0;
  for(const f of files){const base=f.name.replace(/\.[a-z0-9]+$/i,'').toLowerCase();const id=ALL_IDS.filter(i=>base===i||base.startsWith(i+'-')).sort((a,b)=>b.length-a.length)[0];if(!id)continue;
    try{const buf=await A.ctx.decodeAudioData(await f.arrayBuffer());if(!A.clips.has(id))A.clips.set(id,[]);A.clips.get(id).push(buf);n++}catch(e){console.warn('Could not decode',f.name)}}
  for(const id of['amb_city','amb_rain','amb_night'])startLoop(id);
  updateVoiceUI();toast(n?`Loaded ${n} clip${n>1?'s':''}. ${n&&!A.on?'Turn Sound on to hear them.':''}`:'No files matched a clip ID. Name them like hawker_tea_1.mp3');
}
async function loadBundled(){ // every clip in voices/: the voices.js manifest, plus anything listed in voices/files.json that the manifest lacks
  audioInit();const jobs=[];let list=null;
  try{const r=await fetch('voices/files.json');if(r.ok)list=await r.json()}catch(e){}
  if(!list){await new Promise(r=>{const s=document.createElement('script');s.src='voices/voices.js';s.onload=s.onerror=r;document.head.appendChild(s)})}   // opened from a file: only the embedded manifest can work
  const m=list?{}:(window.SHAPLA_VOICES||{});
  for(const [id,v] of Object.entries(m))for(const src of[].concat(v))jobs.push([id,src]);
  try{if(list)for(const f of list){const stem=f.replace(/\.[a-z0-9]+$/i,''),id=ALL_IDS.find(i=>stem===i||stem.startsWith(i+'-'));if(id&&!(id in m))jobs.push([id,'voices/'+f])}}catch(e){}   // a stale manifest must not hide files
  let next=0,done=0;
  const worker=async()=>{while(next<jobs.length){const[id,src]=jobs[next++];
    try{const r=await fetch(src);const buf=await A.ctx.decodeAudioData(await r.arrayBuffer());if(!A.clips.has(id))A.clips.set(id,[]);A.clips.get(id).push(buf)}catch(e){}
    if(++done%4===0)updateVoiceUI()}};
  await Promise.all(Array.from({length:Math.min(6,jobs.length)},worker));   // six at a time, the count in the Voices button climbs as they arrive
  for(const id of['amb_city','amb_rain','amb_night'])startLoop(id);updateVoiceUI();
}

/* ================================================================
   WORLD: organic road network around the chattar, packed buildings,
   footpath markets, lane-free traffic, crowds.
   ================================================================ */
const E=450,RIN=16,ROUT=38,RSW=44,RMID=27,POOL=10.5,RWALK=41;
const D2R=Math.PI/180;
const polar=(r,deg)=>[r*Math.cos(deg*D2R),r*Math.sin(deg*D2R)];
function smoothPts(ctrl,step){const out=[];for(let i=0;i<ctrl.length-1;i++){const p0=ctrl[Math.max(0,i-1)],p1=ctrl[i],p2=ctrl[i+1],p3=ctrl[Math.min(ctrl.length-1,i+2)];
  const n=Math.max(1,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,f=j=>.5*(2*p1[j]+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3);out.push([f(0),f(1)])}}
  out.push(ctrl[ctrl.length-1].slice());return out}
function offsetPts(pts,d){return pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1];const L=Math.hypot(tx,ty)||1;tx/=L;ty/=L;return[p[0]+ty*d,p[1]-tx*d]})}
function mkPoly(pts){const cum=new Float64Array(pts.length);for(let i=1;i<pts.length;i++)cum[i]=cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return{pts,cum,len:cum[pts.length-1]}}
const PA={x:0,y:0,tx:1,ty:0,i:0,t:0};
function polyAt(P,s){const c=P.cum,n=c.length;if(s<0)s=0;else if(s>P.len)s=P.len;let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<=s)lo=m;else hi=m}
  const a=P.pts[lo],b=P.pts[hi],L=(c[hi]-c[lo])||1e-6,t=(s-c[lo])/L;PA.x=a[0]+(b[0]-a[0])*t;PA.y=a[1]+(b[1]-a[1])*t;PA.tx=(b[0]-a[0])/L;PA.ty=(b[1]-a[1])/L;PA.i=lo;PA.t=t;return PA}
function nearestS(P,x,y){let best=0,bd=1e18;const p=P.pts;for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1e-9;let t=((x-a[0])*dx+(y-a[1])*dy)/L2;t=t<0?0:t>1?1:t;const qx=a[0]+dx*t-x,qy=a[1]+dy*t-y,d=qx*qx+qy*qy;if(d<bd){bd=d;best=P.cum[i]+t*Math.sqrt(L2)}}return[best,Math.sqrt(bd)]}
function pathOf(pts){const p=new Path2D();p.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)p.lineTo(pts[i][0],pts[i][1]);return p}
function hull(pts){pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}up.pop();lo.pop();return lo.concat(up)}
const inWorld=(x,y,m=0)=>x>-E-m&&x<E+m&&y>-E-m&&y<E+m;

