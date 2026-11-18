importScripts('logic.js','solver.js');
let cur=0;
function refine(id,items,base,n){if(cur!==id)return;if(n>=40){postMessage({id,done:true});return}
  const r=solve(items,{iters:20000,restarts:3});if(cur!==id)return;if(r.best>base){base=r.best;postMessage({id,best:r.best,layout:r.layout})}
  setTimeout(()=>refine(id,items,base,n+1),0)}
onmessage=e=>{const m=e.data;
  if(m.type==='solve'){const r=solve(m.items,m.opts||{iters:20000,restarts:8});postMessage({id:m.id,best:r.best,layout:r.layout})}
  else if(m.type==='refine'){cur=m.id;setTimeout(()=>refine(m.id,m.items,m.base,0),0)}
  else if(m.type==='stop')cur=0};
