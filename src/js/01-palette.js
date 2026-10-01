/* ---------------- palette ---------------- */
const PAPER=[239,232,216], INK='#2f2d2a', INK2='#6b655b';
const F_BN="'Atma','Kalam','Noto Sans Bengali',sans-serif", F_EN="'Kalam','Comic Sans MS',cursive";
function hexRgb(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
const _w=new Map(),_s=new Map();
function wash(h,t){const k=h+t;let v=_w.get(k);if(v)return v;const c=hexRgb(h);v=`rgb(${Math.round(PAPER[0]+(c[0]-PAPER[0])*t)},${Math.round(PAPER[1]+(c[1]-PAPER[1])*t)},${Math.round(PAPER[2]+(c[2]-PAPER[2])*t)})`;_w.set(k,v);return v}
function shade(h,k){const key=h+k;let v=_s.get(key);if(v)return v;v='#'+hexRgb(h).map(x=>clamp(Math.round(x*k),0,255).toString(16).padStart(2,'0')).join('');_s.set(key,v);return v}
const SKIN=['#8d5a3b','#a0694a','#7a4a30','#b07a55','#6b4028','#95603f'];
const SHIRT=['#f1eee6','#8fb3d9','#c9d8e8','#d98c6a','#7fa36b','#b24b4b','#e2c46b','#6d7fb3','#9c7bb5','#dfe7ee','#e8e2cf','#5b7a99'];
const PANTS=['#3a3a3f','#4b4a52','#6b5b45','#2f3a4d','#7a7263'];
const SARI=['#c2185b','#e65100','#2e7d32','#6a1b9a','#d81b60','#f9a825','#00838f','#b71c1c','#ad1457','#1565c0'];
const LUNGI=['#3f5f8a','#2f6b4f','#6b3f8a','#8a3f3f','#4a6f8a'];
const UMB=['#222222','#1f3a6b','#7b1f2e','#2f5f3f','#6a1b9a'];

