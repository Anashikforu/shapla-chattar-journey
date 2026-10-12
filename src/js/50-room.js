/* ---------------- inside a restaurant: the room is a 360° panorama (50-resto-pano.js); this file keeps its canvas, looks and greeting ---------------- */
const roomCv=document.getElementById('room'),rctx=roomCv.getContext('2d');
const ROOM={t:0,R:null,st:null};
function roomSay(t){panoSay(t,RS.waiter||null)}
/* looks per tier. Street eateries vary a little by name so no two feel identical. */
const WALLS=[['#e6d5ae','#7fa3a0'],['#ead9b8','#8fb0a0'],['#e3d0b0','#a6b58a'],['#efe0c4','#7e9fb0']];
function roomStyle(R){
  const h=[...R.name[1]].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)>>>0;
  if(R.tier===3)return{tier:3,wall:'#d8c3a0',dado:'#5a3a28',floor:'#8a2a30',cloth:'#f6f2e6',sign:['#1f1b18','#e8c98a'],curtain:'#8a1f2e',seed:h};
  if(R.tier===2)return{tier:2,wall:'#efe3d0',dado:'#e9dcc0',floor:'#d9c9a8',cloth:['#b8432f','#2e6fa7','#2f7a4f'][h%3],sign:['#2f5a46','#e8c98a'],curtain:'#c9a24a',seed:h};
  const w=WALLS[h%WALLS.length];return{tier:1,wall:w[0],dado:w[1],floor:'#c9b38c',cloth:null,sign:[['#b8432f','#f7f2e6'],['#2f5f8a','#f7f2e6'],['#6b3f8a','#f7f2e6']][h%3],curtain:null,seed:h};
}
function roomEnter(R){ROOM.R=R;ROOM.st=roomStyle(R);ROOM.t=0;
  PAN.scene=RESTO_SCENE;PAN.place={name:R.name,R};panoReset();RESTO_SCENE.init(PAN.place);
  roomSay(R.tier===1?L2('আসেন ভাই, বসেন! কী খাবেন?','Come in, bhai, sit down! What will you have?'):R.tier===2?L2('স্বাগতম, স্যার! টেবিল রেডি।','Welcome, sir! Your table is ready.'):L2('আসসালামু আলাইকুম, স্যার। আপনার টেবিল প্রস্তুত।','Good evening, sir. Your table is ready.'))}
/* only the meal's clock runs here; the engine draws the room */
function drawRoom(dt){ROOM.t+=dt;simT+=dt;if(eating.dish){eating.t+=dt;if(eating.t>2.2)finishEating()}drawPanoOn(roomCv,rctx,dt,false)}
bindPanoInput(roomCv);
