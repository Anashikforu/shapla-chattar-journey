/* ---------------- time, signals ---------------- */
let HOUR=8.5,simT=0,PAUSED=false,CLOCK_RATE=2,FRIDAY=false,RAIN_MODE='auto',rain=0,rainTarget=0,rainTimer=4,LANG='bn',phase=0,phaseT=0,PHASE_LEN=36;
const keyf=(k,h)=>{for(let i=0;i<k.length-1;i++){if(h>=k[i][0]&&h<=k[i+1][0]){const t=(h-k[i][0])/(k[i+1][0]-k[i][0]);return k[i].slice(1).map((v,j)=>lerp(v,k[i+1][j+1],t))}}return k[0].slice(1)};
const PED_K=[[0,.06],[5,.06],[6.5,.3],[8,.85],[9.5,1],[11,.85],[13,.95],[14.5,.85],[17,1],[18.5,1],[20,.7],[22,.3],[24,.06]];
const TRAF_K=[[0,.15],[5,.15],[6.5,.4],[8,.95],[9.5,1],[12,.85],[14,.9],[17,1],[19,1],[21,.6],[23,.25],[24,.15]];
const SKY_K=[[0,52,62,118,.72],[4.8,52,62,118,.72],[5.8,170,150,190,.35],[6.8,255,228,196,.1],[8,255,255,255,0],[16,255,255,255,0],[17.2,255,196,140,.2],[18.2,190,120,110,.4],[19.2,62,72,126,.66],[24,52,62,118,.72]];
const pedTarget=()=>Math.round(3000*keyf(PED_K,HOUR)[0]*(FRIDAY?.3:1)*(rain>.5?.7:1));
const trafficRate=()=>keyf(TRAF_K,HOUR)[0]*(FRIDAY?.25:1);
const lightsOn=()=>HOUR<5.6||HOUR>18.1?1:HOUR<6.4?(6.4-HOUR)/.8:HOUR>17.3?(HOUR-17.3)/.8:0;
/* daily rhythm */
const RHY={lunch:()=>HOUR>12.6&&HOUR<14.5,dinner:()=>HOUR>19.5&&HOUR<22.2,teaPeak:()=>(HOUR>9.3&&HOUR<12.2)||(HOUR>15&&HOUR<18.6),dawn:()=>HOUR>=5&&HOUR<7.2,night:()=>HOUR<5||HOUR>=23.4,exodus:()=>HOUR>16.9&&HOUR<19.6};
const footfall=()=>keyf(PED_K,HOUR)[0]*(FRIDAY?.3:1);
let flood=0;
const green=arm=>phaseT>PHASE_LEN-4?false:ARMS[arm].phase===phase;

