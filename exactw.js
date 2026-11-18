importScripts('logic.js','solver.js');
onmessage=e=>{const m=e.data;let last=0;
  const best=exactSolve(m.items,(v,layout)=>{if(v>m.base){m.base=v;postMessage({best:v,layout})}});
  postMessage({done:true,best})};
