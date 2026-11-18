'use strict';
/* best-arrangement search: which of these items, where, and turned how, gives the highest load value */
function cands(it,cols,rows){const out=[],e={cols,rows,items:[]},nr=DEF[it.d].big?4:1;
  for(let r=0;r<nr;r++){const t=Object.assign({},it,{rot:(it.rot+r)%4});for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(fits(e,t,x,y))out.push({rot:t.rot,x,y,cells:geom(t).cells.map(c=>(c[1]+y)*cols+c[0]+x)})}
  return out}
function solve(items,opt){opt=opt||{};const cols=opt.cols||5,rows=opt.rows||4,iters=opt.iters||6000,restarts=opt.restarts||4,rnd=opt.rnd||Math.random;
  const n=items.length,C=items.map(it=>cands(it,cols,rows)),its=items.map(it=>Object.assign({},it));
  const val=asg=>{const g={cols,rows,items:[]};for(let i=0;i<n;i++)if(asg[i]){const p=asg[i];its[i].x=p.x;its[i].y=p.y;its[i].rot=p.rot;g.items.push(its[i])}return g.items.length?evalPack(g).total:0};
  const occOf=asg=>{const o=new Int16Array(cols*rows).fill(-1);for(let i=0;i<n;i++)if(asg[i])for(const c of asg[i].cells)o[c]=i;return o};
  // greedy start
  const greedy=order=>{const asg=new Array(n).fill(null);let cur=0;for(;;){let best=null,bv=cur;const o=occOf(asg);
      for(const i of order){if(asg[i])continue;for(const p of C[i]){if(p.cells.some(c=>o[c]>=0))continue;asg[i]=p;const v=val(asg);asg[i]=null;if(v>bv){bv=v;best=[i,p]}}}
      if(!best)return{asg,v:cur};asg[best[0]]=best[1];cur=bv}};
  let gBest=null,gV=-1;
  for(let r=0;r<restarts;r++){const order=[...Array(n).keys()];if(r)for(let i=n-1;i>0;i--){const j=(rnd()*(i+1))|0;[order[i],order[j]]=[order[j],order[i]]}
    let{asg,v}=r===0?greedy(order):(r%2?greedy(order):{asg:new Array(n).fill(null),v:0});let bA=asg.slice(),bV=v;
    const T0=Math.max(8,v*.15);
    for(let k=0;k<iters;k++){const T=T0*(1-k/iters)+.5,i=(rnd()*n)|0,nA=asg.slice();const mv=rnd();
      if(mv<.12&&nA[i])nA[i]=null;
      else if(mv<.24&&n>1){const j=(rnd()*n)|0;if(i===j||!nA[i]||!nA[j])continue;const pi=nA[i],pj=nA[j];
        const qi=C[i].find(p=>p.x===pj.x&&p.y===pj.y&&p.rot===pi.rot)||C[i].find(p=>p.x===pj.x&&p.y===pj.y),qj=C[j].find(p=>p.x===pi.x&&p.y===pi.y&&p.rot===pj.rot)||C[j].find(p=>p.x===pi.x&&p.y===pi.y);
        if(!qi||!qj)continue;nA[i]=qi;nA[j]=qj;const o=new Int16Array(cols*rows).fill(-1);let bad=false;for(let q=0;q<n&&!bad;q++)if(nA[q])for(const c of nA[q].cells){if(o[c]>=0){bad=true;break}o[c]=q}if(bad)continue}
      else{if(!C[i].length)continue;const p=C[i][(rnd()*C[i].length)|0];nA[i]=null;const o=occOf(nA);for(const c of p.cells)if(o[c]>=0)nA[o[c]]=null;nA[i]=p}
      const nv=val(nA);if(nv>=v||rnd()<Math.exp((nv-v)/T)){asg=nA;v=nv;if(v>bV){bV=v;bA=asg.slice()}}}
    if(bV>gV){gV=bV;gBest=bA}}
  const layout=[];for(let i=0;i<n;i++)if(gBest[i])layout.push(Object.assign({},items[i],{x:gBest[i].x,y:gBest[i].y,rot:gBest[i].rot}));
  return{best:gV,layout}}
if(typeof module!=='undefined')module.exports={solve,cands};
/* exact search: tries every arrangement (practical up to ~6 pieces). onBetter(best,layout) is called on each improvement */
function exactSolve(items,onBetter){const n=items.length,C=items.map(i=>cands(i,5,4)),abs=items.some(i=>{const d=DEF[i.d];return d.heavy||d.k==='corner'});
  const twin=items.map((it,i)=>{for(let j=i-1;j>=0;j--)if(items[j].d===it.d&&items[j].dir===it.dir&&items[j].base===it.base)return j;return -1});
  const idx=new Int32Array(n).fill(-1),g={cols:5,rows:4,items:[]},its=items.map(i=>Object.assign({},i));let best=-1;
  const rec=(k,occ,mx,my,cnt)=>{if(k===n){if(!cnt||(!abs&&(mx>0||my>0)))return;
      g.items.length=0;for(let i=0;i<n;i++)if(idx[i]>=0){const p=C[i][idx[i]];its[i].x=p.x;its[i].y=p.y;its[i].rot=p.rot;g.items.push(its[i])}
      const v=evalPack(g).total;if(v>best){best=v;onBetter&&onBetter(v,g.items.map(i=>Object.assign({},i)))}return}
    const tw=twin[k],lo=tw>=0?idx[tw]:-2;
    if(tw<0||idx[tw]===-1){idx[k]=-1;rec(k+1,occ,mx,my,cnt)}
    for(let q=0;q<C[k].length;q++){if(tw>=0&&q<=lo)continue;const p=C[k][q];let hit=false;for(const c of p.cells)if(occ[c]){hit=true;break}if(hit)continue;
      let ax=mx,ay=my;for(const c of p.cells){occ[c]=1;ax=Math.min(ax,c%5);ay=Math.min(ay,(c/5)|0)}idx[k]=q;rec(k+1,occ,ax,ay,cnt+1);for(const c of p.cells)occ[c]=0}
    idx[k]=-1};
  rec(0,new Uint8Array(20),9,9,0);return best}
if(typeof module!=='undefined')module.exports.exactSolve=exactSolve;
