'use strict';
/* routes, cargo per stop */
const STOPS=5;
/* f = share of the bot's perfect earnings (stops 1-4) that the fuel costs */
const TIERS=[{name:'Easy',f:.62,xp:0},{name:'Medium',f:.78,xp:250},{name:'Hard',f:.9,xp:800}];
function makeCosts(bests,f,r){const B=[];let acc=0;for(let k=0;k<STOPS-1;k++){acc+=bests[k];B.push(acc)}
  const T=f*B[STOPS-2],w=[.17,.22,.28,.33].map(x=>x*(.85+r()*.3)),ws=w.reduce((a,b)=>a+b);
  const c=w.map(x=>Math.max(10,Math.round(T*x/ws/5)*5));
  // perfect play must always cover the fuel: push any excess on a leg to later legs
  let C=0;for(let k=0;k<c.length;k++){C+=c[k];const over=C-B[k];if(over>0){const cut=Math.ceil(over/5)*5;c[k]-=cut;C-=cut;if(k+1<c.length)c[k+1]+=cut}}
  return[0].concat(c)}
const STAGE_W=6,STAGE_H=4;
function pick(r,depth,want){for(let k=0;k<40;k++){const it=rollItem(r,depth,0),t=DEF[it.d].k==='none';if(want===null||t===want)return it}return rollItem(r,depth,0)}
/* Endless adds pieces as levels climb (5 always possible, max 12) */
function cargoSize(r,stop,endless){if(!endless)return 5+(r()<.5?1:0);const p=Math.min(.85,(stop+1)*.04);let n=5;while(n<12&&r()<p)n++;return n}
const curbRows=n=>n<=7?4:n<=10?5:6;
function cargo(seed,tier,stop,endless){const r=mulberry(Math.imul(seed,2654435761)^(stop*40503+tier*977+1)),depth=tier*1.2+stop*.7,n=cargoSize(r,stop,endless),items=[];
  // usual mix: 2 plain treasures, 2 effect pieces, the rest anything. 5% of the time the whole cargo is one kind
  const mono=r()<.05?(r()<.5?'plain':'effect'):null;
  for(let i=0;i<n;i++)items.push(pick(r,depth,mono?mono==='plain':i<2?true:i<4?false:null));
  items.forEach((it,i)=>{it.uid=stop*100+i;const d=DEF[it.d];if(d.k==='grow')it.base+=d.g*stop;else if(d.k==='growx')it.base=Math.min(250,it.base*Math.pow(2,stop))});
  const g={cols:STAGE_W,rows:endless?curbRows(n):STAGE_H,items:[]};for(const it of items){it.rot=DEF[it.d].big?(r()*4|0):0;let sp=findSpot(g,it);while(!sp&&endless&&g.rows<9){g.rows++;sp=findSpot(g,it)}if(sp){Object.assign(it,sp);g.items.push(it)}}
  if(endless&&g.items.length){const top=Math.min(...g.items.map(i=>i.y+Math.min(...geom(i).cells.map(c=>c[1])))),lift=Math.max(0,Math.min(top,g.rows-curbRows(n)));for(const i of g.items)i.y-=lift}
  return g.items}
if(typeof module!=='undefined')module.exports={STOPS,TIERS,makeCosts,cargo,cargoSize,curbRows,STAGE_W,STAGE_H};
