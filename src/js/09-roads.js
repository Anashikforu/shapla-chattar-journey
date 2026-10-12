/* ---------------- roads ---------------- */
const ARM_DEFS=[
 {id:'N', deg:[-96,-100,-104,-109],r:[30,140,280,600],hw:11, sw:5.5,phase:1,name:['দৈনিক বাংলা মোড়ের দিকে','to Dainik Bangla More']},
 {id:'NE',deg:[-44,-49,-46,-42],  r:[30,150,300,600],hw:7.5,sw:4.5,phase:1,name:['দিলকুশা বা/এ','Dilkusha C/A']},
 {id:'E', deg:[-5,-1,4,8],        r:[30,150,310,600],hw:10, sw:5,  phase:0,name:['আরামবাগ-কমলাপুরের দিকে','to Arambagh & Kamalapur']},
 {id:'S', deg:[88,84,78,73],      r:[30,150,320,600],hw:11, sw:5.5,phase:1,name:['ইত্তেফাক মোড়ের দিকে','to Ittefaq More']},
 {id:'W', deg:[177,181,187,184],  r:[30,130,270,600],hw:10, sw:5,  phase:0,name:['পল্টনের দিকে','to Paltan']},
];
const SIDE_DEFS=[
 {c:[[-490,-176],[-300,-150],[-150,-178],[0,-206],[150,-218],[300,-256],[490,-262]],hw:5.5,sw:3},
 {c:[[-490,196],[-310,160],[-160,172],[-20,216],[140,202],[300,172],[490,208]],hw:5.5,sw:3},
 {c:[[252,-490],[232,-300],[215,-120],[240,40],[226,220],[252,490]],hw:5,sw:3},
 {c:[[-252,-490],[-226,-290],[-240,-100],[-206,60],[-230,250],[-210,490]],hw:5,sw:3},
 {c:[[-100,-7],[-98,-60],[-122,-122],[-150,-180]],hw:4,sw:2.2},
 {c:[[100,5],[113,70],[128,140],[142,204]],hw:4,sw:2.2},
];
const LANE_DEFS=[
 [[-92,-98],[-62,-120],[-30,-126]],[[74,-26],[112,-58],[170,-62],[228,-86]],[[-66,60],[-110,94],[-168,108],[-214,98]],
 [[66,116],[44,150],[24,214]],[[150,-118],[178,-158],[214,-150]],[[-150,-60],[-180,-30],[-232,-40]],[[140,280],[180,320],[236,300]],[[-120,300],[-160,260],[-222,270]],
];
const roads=[],ARMS=[];
function addRoad(ctrl,hw,sw,kind,extra){const pts=smoothPts(ctrl,5);const P=mkPoly(pts);
  const R=Object.assign({pts,P,len:P.len,hw,sw,kind,id:roads.length,path:pathOf(pts),curbL:pathOf(offsetPts(pts,hw)),curbR:pathOf(offsetPts(pts,-hw))},extra||{});
  if(sw>0){R.edgeL=pathOf(offsetPts(pts,hw+sw));R.edgeR=pathOf(offsetPts(pts,-hw-sw))}
  const cp=pts.filter(p=>Math.hypot(p[0],p[1])>50);if(cp.length>1)R.center=pathOf(cp);
  roads.push(R);return R}
/* galis: narrow lanes that wind off the roads between the buildings, for people on foot. They start at a road's footpath and stop
   at another road, a footpath, a reserved plot (station, mosque, schools) or another gali. Called after the big plots are reserved. */
function genGalis(){const cand=[];
  for(const R of roads){if(R.kind==='lane'||R.kind==='gali')continue;for(let s=24;s<R.len-24;s+=rr(38,70))cand.push([R,s])}
  for(const[R,s]of cand){if(RND()<.3)continue;const r=polyAt(R.P,s);if(Math.hypot(r.x,r.y)<75)continue;
    for(const side of[-1,1]){if(RND()<.35)continue;let a=Math.atan2(-r.tx*side,r.ty*side),a0=a;const off=R.hw+R.sw+.6;let p=[r.x+r.ty*side*off,r.y-r.tx*side*off];if(!inWorld(p[0],p[1],-10))continue;
      const pts=[p];let ok=false;
      for(let st=0;st<36;st++){a+=rr(-.28,.28);a=a0+clamp(a-a0,-.7,.7);p=[p[0]+Math.cos(a)*5,p[1]+Math.sin(a)*5];if(!inWorld(p[0],p[1],-8))break;
        const k=mk(p[0],p[1]);if(k<0||occ[k])break;pts.push(p);
        if(st>3&&mask[k]>=1){ok=true;break}}   // reached another road or footpath (or a gali stamped earlier)
      if(pts.length<6&&!ok)continue;
      for(let i=0;i<pts.length-1;i++)stamp(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],1.5,1);
      addRoad(pts,1.4,0,'gali')}}}
function genRoads(){
  ARM_DEFS.forEach((a,i)=>{const R=addRoad(a.deg.map((d,k)=>polar(a.r[k],d)),a.hw,a.sw,'arm',{def:a,arm:i,name:a.name,phase:a.phase});ARMS.push(R)});
  for(const s of SIDE_DEFS)addRoad(s.c,s.hw,s.sw,'side');
  for(const l of LANE_DEFS)addRoad(l,2.4,0,'lane');
}
