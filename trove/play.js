'use strict';
/* ================= TROVE ================= */
const $=id=>document.getElementById(id);
const UI={mode:'routes',held:null,ev:null,dev:null,grids:{},cs:64,sel:new Set(),peek:null,busy:null};
let run=null,mouse={x:0,y:0},lastMove=null,anim=null;
function sfx(f,d=.08,type='sine',v=.05){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
let PROG={xp:0,best:{},routes:null,endless:0,timed:0,rv:0,exact:false,dark:false};try{const j=localStorage.getItem('wayward-truck-v2');if(j)PROG=Object.assign(PROG,JSON.parse(j))}catch(e){}
if(PROG.rv!==4){PROG.routes=null;PROG.rv=4}
function applyTheme(){document.body.classList.toggle('dark',!!PROG.dark)}
function saveProg(){try{localStorage.setItem('wayward-truck-v2',JSON.stringify(PROG))}catch(e){}}
const packGrid=()=>({cols:5,rows:4,items:run.pack});
const LW=()=>run&&!run.endless?'stop':'level';
const FAMC={mul:'#d99a12',add:'#3f9a4a',turn:'#8a5fc0',meta:'#2f7fc9',curse:'#c8402e'},INKS=['#4b3829','#2f7a3a','#2f62b8','#c47a10'];
let AC=null;
let toastT=0;
function toast(m,ms=1800){const t=$('toast');t.textContent=m;t.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>t.style.opacity=0,ms)}
const NT=(i,t)=>`<span class="nt"><em>${i}</em>${t}</span>`;
function fam(d){const k=d.k;if(k==='mul')return d.n<1?'curse':'mul';if(k==='tagmul')return'mul';if(k==='add')return'add';if(k==='rot'||k==='align'||k==='attract')return'turn';if(k==='fang'||k==='sacrifice'||k==='silence')return'curse';return'meta'}
function pillOf(s){const d=s.def,N=fm(s.N||0);switch(d.k){case'mul':return'×'+N;case'tagmul':return'×'+N+TAGI[d.tag];case'add':return'+'+N;case'rot':return['','↻','⇅','↺'][d.q];case'align':return'⇉';case'attract':return'⇄';case'modadd':return'✦+'+N;case'modmul':return'✦×'+N;case'pierce':return'⇶';case'relay':return'»';case'fang':return'🩸';case'envy':return'+'+N+'×';case'mask':return'🎭';case'bless':return'✚';case'silence':return'🔇';case'sacrifice':return'☠'}return''}
function chipOf(d,n){const N=fm(n||0),sg=n<0?N:'+'+N;switch(d.k){case'aura4':return'⊕+'+N;case'aura8':return'✱'+sg;case'auramul':return'⊕×'+N;case'kseal':return'⊕×'+N;case'corner':return'◣×'+N;case'quiver':return'+'+N+'/➜';case'pertag':return'+'+N+'/'+TAGI[d.tag];case'twin':return'🗿×'+N;case'distinct':return'+'+N+'/kind';case'empty':return'+'+N+'/▢';case'adjtag':return'+'+N+'×/'+TAGI[d.tag];case'row':return'↔×'+N;case'col':return'↕×'+N;case'rod':return'×➜';case'hermit':return'◌×'+N;case'steam':return'🔥❄×'+N;case'scales':return'=×'+N;case'global':return'∀+'+N;case'full':return'▣×'+N;case'modaura':return'⊕✦+'+N;case'grow':return'+'+d.g+'/'+(LW()==='level'?'lvl':'stop');case'growx':return'×2/'+(LW()==='level'?'lvl':'stop')}return d.heavy?'⏬':''}
function itemHTML(it,s,CS,pos,compact){const d=DEF[it.d],ge=geom(it),cells=ge.cells,has=(x,y)=>cells.some(c=>c[0]===x&&c[1]===y),ed=s?s.def:d;
  let bg='linear-gradient(160deg,#eadbb4,#d6c08e)';if(s){if(s.sil)bg='#b9b4a8';else if(s.val>it.base)bg='linear-gradient(160deg,#ffe98a,#f0c64a)';else if(s.val<it.base)bg='linear-gradient(160deg,#e6b3a2,#d08f7c)'}
  let h=`<div class="itm${UI.sel.has(it)?' sel':''}${UI.peek!=null&&UI.diff&&UI.diff.has(it.uid)&&pos===undefined?' chg':''}" style="left:${(pos?pos[0]:it.x)*CS}px;top:${(pos?pos[1]:it.y)*CS}px">`;
  for(const[cx,cy]of cells){const l=has(cx-1,cy)?0:2,r=has(cx+1,cy)?0:2,t=has(cx,cy-1)?0:2,b=has(cx,cy+1)?0:2,R=(a,c)=>a&&c?'7px':'0';
    h+=`<i class="blk" style="left:${cx*CS+l}px;top:${cy*CS+t}px;width:${CS-l-r}px;height:${CS-t-b}px;background:${bg};border-color:${INKS[d.rar]};border-width:${t}px ${r}px ${b}px ${l}px;border-radius:${R(t,l)} ${R(t,r)} ${R(b,r)} ${R(b,l)}"></i>`}
  if(ART[d.id]){const w0=Math.max(...d.shape.map(c=>c[0]))+1,h0=Math.max(...d.shape.map(c=>c[1]))+1,r=it.rot||0,tf=r===1?`translate(${h0*CS}px,0) rotate(90deg)`:r===2?`translate(${w0*CS}px,${h0*CS}px) rotate(180deg)`:r===3?`translate(0,${w0*CS}px) rotate(-90deg)`:'none';
    h+=`<svg class="art" style="width:${w0*CS}px;height:${h0*CS}px;transform:${tf}" viewBox="0 0 ${w0*100} ${h0*100}"><g stroke="#3a2a1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${ART[d.id]}</g></svg>`}
  else{let mx=0,my=0;for(const c of cells){mx+=c[0];my+=c[1]}mx=mx/cells.length+.5;my=my/cells.length+.5;h+=`<span class="ico" style="left:${mx*CS}px;top:${my*CS}px;font-size:${Math.round(CS*.58)}px">${d.icon}</span>`}
  if(s&&s.copy)h+=`<span class="mini" style="left:${CS-20}px;top:2px">${s.copy.icon}</span>`;
  const arr=s?s.arrows.map(a=>({x:a.x-it.x,y:a.y-it.y,dir:a.dir})):ge.arrows,col=s&&s.turned?FAMC.turn:FAMC[fam(ed)];
  for(const a of arr)h+=`<i class="arw" style="left:${(a.x+.5+DX[a.dir]*.36)*CS}px;top:${(a.y+.5+DY[a.dir]*.36)*CS}px;transform:translate(-50%,-50%) rotate(${a.dir*90}deg);background:${col}"></i>`;
  let tl=cells[0],br=cells[0];for(const c of cells){if(c[1]<tl[1]||c[1]===tl[1]&&c[0]<tl[0])tl=c;if(c[1]>br[1]||c[1]===br[1]&&c[0]>br[0])br=c}
  const chip=(s&&s.sil?'🔇':'')+chipOf(ed,s?s.N:d.n);if(chip&&!compact)h+=`<span class="chip" style="left:${tl[0]*CS+5}px;top:${tl[1]*CS+3}px">${chip}</span>`;
  const v=s?s.val:it.base;h+=`<span class="val${compact?' sm':''}${s&&v>it.base?' up':s&&v<it.base?' dn':''}" style="top:${(br[1]+1)*CS-21}px;left:${br[0]*CS}px;width:${CS-5}px">${v}</span>`;
  return h+'</div>'}
function gridHTML(name,label){const g=UI.grids[name],CS=UI.cs,ev=name==='pack'?UI.ev:name==='demo'?UI.dev:null;let c='',m='',p='',it='';
  for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++)c+=`<i class="gc${(x+y)%2?' alt':''}" style="left:${x*CS}px;top:${y*CS}px;width:${CS}px;height:${CS}px"></i>`;
  if(ev)for(const s of ev.S){if(s.sil||!s.def.arrow)continue;const col=FAMC[fam(s.def)],lab=pillOf(s);
    for(const l of s.links){const a=l.a;let x=a.x+DX[a.dir],y=a.y+DY[a.dir],first=true;
      while(x>=0&&y>=0&&x<g.cols&&y<g.rows){const q=ev.grid[y*g.cols+x];if(q!==s)m+=`<i class="mark" style="left:${x*CS+3}px;top:${y*CS+3}px;width:${CS-6}px;height:${CS-6}px;border-color:${col};background:${col}${first?'44':'22'}"></i>`;first=false;if(!(s.pierce||s.def.line))break;x+=DX[a.dir];y+=DY[a.dir]}
      p+=`<span class="pill" style="left:${(a.x+.5+DX[a.dir]*.5)*CS}px;top:${(a.y+.5+DY[a.dir]*.5)*CS}px;background:${col}">${lab}</span>`}}
  for(const i of g.items)it+=itemHTML(i,ev?ev.S.find(s=>s.it===i):null,CS);
  return`<div class="gwrap"><div class="glabel">${label}</div><div class="grid"><div class="gin" data-g="${name}" style="width:${g.cols*CS}px;height:${g.rows*CS}px">${c}${m}${it}${p}<div class="hl"></div><div class="ghost"></div></div></div></div>`}
function placeGroup(g,h,nx,ny,keep){const added=[];let ok=true;for(const q of h.items){q.it.x=nx+q.dx;q.it.y=ny+q.dy;if(fits(g,q.it,q.it.x,q.it.y)){g.items.push(q.it);added.push(q.it)}else{ok=false;break}}
  if(!ok||!keep)for(const a of added)g.items.splice(g.items.indexOf(a),1);return ok}
function numHTML(d,s){const N=s?s.N:d.n,np=s&&s.Np;if(!np||!np.a.length&&!np.m.length)return fm(N||0);
  const sg=v=>(v<0?'−':'+')+fm(Math.abs(v));let h='<span class="nexp">';h+=np.a.length?'('+fm(d.n)+np.a.map(a=>NT(a.i,sg(a.v))).join('')+')':fm(d.n);h+=np.m.map(m=>NT(m.i,'×'+fm(m.v))).join('');return h+'</span>'}
function infoHTML(it,s){const d=s?s.def:DEF[it.d],N=s?s.N:d.n,od=DEF[it.d];
  let desc=d.desc||'';
  if(d.k==='grow'||d.k==='growx'){const w=LW(),b0=d.base;
    if(d.k==='grow'){const lv=Math.max(1,Math.round((it.base-(b0-d.g))/d.g));desc=`Base +${d.g} per ${w}: ${b0-d.g} + (${d.g} × ${w} ${lv}) = <b>${it.base}</b>`}
    else{const lv=Math.round(Math.log2(it.base/b0))+1;desc=it.base>=250?`Base doubles each ${w}, up to 250 = <b>250</b>`:`Base doubles each ${w}: ${b0} × 2<sup>${lv-1}</sup> (${w} ${lv}) = <b>${it.base}</b>`}}
  const dirs=[...new Set((s?s.arrows:geom(it).arrows).map(a=>a.dir))],ar=dirs.length?'<b class="dar">'+dirs.map(q=>'↑→↓←'[q]).join('')+'</b>':'➜';
  let h=`<div class="top">${od.tags.length?od.tags.map(t=>TAGI[t]).join('')+' ':''}<b style="color:${INKS[od.rar]}">${od.name}</b>${s&&s.copy?' = '+d.icon:''}${desc?' · '+desc.replace(/\bN\b/g,()=>numHTML(d,s)).replace(/➜/g,ar):''}</div>`;
  if(s){const f=[String(s.base)].concat(s.adds.map(a=>typeof a==='object'?' + '+a.ex:(a<0?' − ':' + ')+fm(Math.abs(a)))).join(''),m=s.muls.map(x=>' × '+fm(x)).join('');
    h+=`<div class="calc">${s.adds.length?'('+f+')':f}${m} = <b>${s.val}</b>${s.notes.length?'<span class="nts">'+s.notes.slice(0,9).map(n=>NT(n.i,n.t)).join('')+'</span>':''}</div>`}
  return h}
function cellAt(e){const el=document.elementFromPoint(e.clientX,e.clientY),gin=el&&el.closest&&el.closest('.gin');if(!gin)return null;const r=gin.getBoundingClientRect(),name=gin.dataset.g,g=UI.grids[name],cx=Math.floor((e.clientX-r.left)/UI.cs),cy=Math.floor((e.clientY-r.top)/UI.cs);if(cx<0||cy<0||cx>=g.cols||cy>=g.rows)return null;return{gin,name,g,cx,cy}}
function applause(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();const sr=AC.sampleRate,buf=AC.createBuffer(1,sr*.08,sr),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
  const t0=AC.currentTime;for(let k=0;k<34;k++){const src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();src.buffer=buf;f.type='bandpass';f.frequency.value=900+Math.random()*1600;f.Q.value=1.2;g.gain.value=.06+Math.random()*.08;src.connect(f);f.connect(g);g.connect(AC.destination);src.start(t0+Math.random()*1.9*Math.pow(Math.random(),.6))}
  for(const[f,dl]of[[523,0],[659,.08],[784,.16],[1047,.26]]){const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t0+dl);g.gain.exponentialRampToValueAtTime(.018,t0+dl+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+dl+.6);o.connect(g);g.connect(AC.destination);o.start(t0+dl);o.stop(t0+dl+.65)}}catch(e){}}
function cheer(){applause();const c=$('cheer');c.classList.remove('on');void c.offsetWidth;c.classList.add('on');let h='';for(let i=0;i<26;i++)h+=`<i style="left:${Math.random()*100}%;animation-delay:${Math.random()*.5}s;background:${['#f0c24a','#3f9a4a','#2f7fc9','#c8402e','#8a5fc0'][i%5]}"></i>`;c.querySelector('.conf').innerHTML=h}
function placeHeld(){const he=$('held'),h=UI.held;if(!h){he.style.display='none';return}he.innerHTML=h.items.map(q=>itemHTML(q.it,null,UI.cs,[q.dx,q.dy])).join('');he.style.display='block';he.style.left=(mouse.x-(h.gx+.5)*UI.cs)+'px';he.style.top=(mouse.y-(h.gy+.5)*UI.cs)+'px'}
function dropHeld(){const h=UI.held;if(!h)return true;const g=UI.grids[h.from];let all=true;
  for(const q of h.items){const it=q.it;it.rot=q.orot;if(fits(g,it,q.ox,q.oy)){it.x=q.ox;it.y=q.oy;g.items.push(it);q.done=true;continue}
    for(const gg of[g,UI.grids.curb,UI.grids.pack]){if(q.done)break;const sp=findSpot(gg,it);if(sp){Object.assign(it,sp);gg.items.push(it);q.done=true}}if(!q.done)all=false}
  if(all)UI.held=null;else h.items=h.items.filter(q=>!q.done);return all}
function swapWith(g,h,nx,ny){if(h.items.length!==1)return null;const it=h.items[0].it,o=occ(g),hit=new Set();
  for(const[cx,cy]of geom(it).cells){const x=nx+cx,y=ny+cy;if(x<0||y<0||x>=g.cols||y>=g.rows)return null;const q=o[y*g.cols+x];if(q)hit.add(q)}
  if(hit.size!==1)return null;const other=[...hit][0],rest={cols:g.cols,rows:g.rows,items:g.items.filter(i=>i!==other)};return fits(rest,it,nx,ny)?other:null}
function rotateHeld(){const h=UI.held;if(!h||h.items.length!==1||!DEF[h.items[0].it.d].big)return;const it=h.items[0].it;it.rot=((it.rot||0)+1)%4;h.info=null;const inf=$('info');if(inf)inf.innerHTML=infoHTML(it,null);const c=geom(it).cells[0];h.gx=c[0];h.gy=c[1];sfx(600,.04);placeHeld();hover(lastMove)}
function hideHl(){document.querySelectorAll('.ghost,.hl').forEach(x=>x.innerHTML='')}
function areaHTML(s,g,CS){const k=s.def.k,own=new Set(s.cells.map(c=>c[1]*g.cols+c[0])),set=new Set(),W=g.cols,H=g.rows,add=(x,y)=>{if(x>=0&&y>=0&&x<W&&y<H&&!own.has(y*W+x))set.add(y*W+x)};
  const nb=diag=>{for(const[cx,cy]of s.cells)for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if((a||b)&&(diag||!a||!b))add(cx+a,cy+b)};
  if(['aura4','auramul','kseal','modaura','adjtag','steam','hermit','twin'].includes(k))nb(false);else if(k==='aura8')nb(true);
  else if(k==='row'){const rows=new Set(s.cells.map(c=>c[1]));for(const y of rows)for(let x=0;x<W;x++)add(x,y)}
  else if(k==='col'){const cols=new Set(s.cells.map(c=>c[0]));for(const x of cols)for(let y=0;y<H;y++)add(x,y)}
  else if(k==='global'){for(let y=0;y<H;y++)for(let x=0;x<W;x++)add(x,y)}
  else if(k==='sacrifice'&&s.tg.length){const rows=new Set(s.cells.map(c=>c[1])),tg=new Set();for(const t of s.tg)for(const c of t.cells)tg.add(c[1]*W+c[0]);for(const y of rows)for(let x=0;x<W;x++)if(!tg.has(y*W+x))add(x,y)}
  else if(k==='scales'){const c=s.cells[0];add(c[0]-1,c[1]);add(c[0]+1,c[1])}
  else if(k==='corner'){for(const[x,y]of[[0,0],[W-1,0],[0,H-1],[W-1,H-1]])add(x,y)}
  if(!set.size)return'';const bad=(s.N<0&&!s.bless)||(k==='auramul'&&s.N<1&&!s.bless);
  return[...set].map(i=>`<i class="area${bad?' neg':''}" style="left:${(i%W)*CS+2}px;top:${Math.floor(i/W)*CS+2}px;width:${CS-4}px;height:${CS-4}px"></i>`).join('')}
function toPack(it){const sp=firstSpot(packGrid(),it);if(!sp)return false;Object.assign(it,sp);run.pack.push(it);return true}
/* ---------- the bot (runs in a background worker when it can) ---------- */
let SW=null,swId=0;const pend={};
try{SW=new Worker('solverw.js');SW.onmessage=e=>{const f=pend[e.data.id];if(f)f(e.data)};SW.onerror=()=>{SW=null;for(const k in pend){const f=pend[k];delete pend[k];f(null)}}}catch(e){SW=null}
const plainOf=items=>items.map(i=>({d:i.d,dir:i.dir,rot:i.rot||0,x:0,y:0,base:i.base,uid:i.uid}));
const budget=n=>n>=11?{iters:50000,restarts:12}:n>=9?{iters:35000,restarts:10}:{iters:20000,restarts:8};
function solveP(items){return new Promise(res=>{const plain=plainOf(items),id=++swId,opts=budget(plain.length);
  const local=()=>setTimeout(()=>res(solve(plain,{iters:Math.round(opts.iters*.7),restarts:opts.restarts-2})),20);
  if(SW){pend[id]=r=>{delete pend[id];r?res(r):local()};SW.postMessage({type:'solve',id,items:plain,opts})}else local()})}
/* exact check of every arrangement, for levels with up to 6 pieces; its own worker so it can be stopped any time */
let XW=null;const EXACT_MAX=6;
function stopExact(){if(XW){XW.terminate();XW=null}UI.exact=null}
function exactStop(){stopExact();if(!PROG.exact||!run||typeof Worker==='undefined')return;const R=run,s=run.stop,items=plainOf(cargoFor(s));if(items.length>EXACT_MAX)return;
  try{XW=new Worker('exactw.js')}catch(e){XW=null;return}UI.exact='running';const me=XW;
  XW.onerror=()=>{if(XW===me){XW=null;UI.exact=null;softRender()}};
  XW.onmessage=e=>{if(R!==run||R.stop!==s||XW!==me)return;const m=e.data;
    if(m.best!=null&&m.best>R.route.bests[s-1]){R.route.bests[s-1]=m.best;if(m.layout)R.route.layouts[s-1]=m.layout}
    if(m.done){UI.exact='done';XW=null;me.terminate();softRender()}};
  XW.postMessage({items,base:run.route.bests[s-1]})}
let refineId=0;
function refineStop(){exactStop();if(!SW||!run)return;const R=run,s=run.stop,id=++swId;refineId=id;UI.refining=true;
  pend[id]=r=>{if(r.done){delete pend[id];if(refineId===id){UI.refining=false;softRender()}return}if(R!==run)return;
    if(r.best>R.route.bests[s-1]){R.route.bests[s-1]=r.best;R.route.layouts[s-1]=r.layout}};
  SW.postMessage({type:'refine',id,items:plainOf(cargoFor(s)),base:run.route.bests[s-1]})}
function stopRefine(){refineId=0;UI.refining=false;if(SW)SW.postMessage({type:'stop'});stopExact()}
/* ---------- route generation: the bot plays every stop, then fuel is priced from what it found ---------- */
async function genRoute(tier,progress){const seed=(Math.random()*1e9)|0,bests=[],layouts=[];
  for(let s=0;s<STOPS;s++){progress&&progress(s);const r=await solveP(cargo(seed,tier,s));bests.push(r.best);layouts.push(r.layout)}
  return{tier,seed,bests,layouts,costs:makeCosts(bests,TIERS[tier].f,mulberry(seed^99))}}
const unlocked=t=>PROG.xp>=TIERS[t].xp;
async function genAll(onlyMissing){if(UI.busy)return;if(!PROG.routes||PROG.routes.length!==TIERS.length)PROG.routes=TIERS.map(()=>null);
  for(let t=0;t<TIERS.length;t++){if(!unlocked(t)||(onlyMissing&&PROG.routes[t]))continue;UI.busy={tier:t,stop:0};renderRoutes();
    PROG.routes[t]=await genRoute(t,s=>{UI.busy={tier:t,stop:s};if(UI.mode==='routes')renderRoutes()});saveProg()}
  UI.busy=null;if(UI.mode==='routes')renderRoutes()}
function routesScreen(){stopRefine();run=null;renderRoutes()}
async function freshRoute(tier){UI.busy={tier,stop:0,single:true};render();const r=await genRoute(tier,s=>{UI.busy={tier,stop:s,single:true};render()});
  PROG.routes[tier]=r;saveProg();UI.busy=null;startRun(tier)}
/* ---------- routes screen ---------- */
function renderRoutes(){UI.mode='routes';$('held').style.display='none';const st=n=>n?`Best streak <b>${n}</b>`:'No streak yet';
  let h=`<div class="phead"><h2 class="title">Trove</h2><button class="icon sp2" data-act="settings" title="Settings">⚙</button></div>
  <p class="lead">Each level brings a set of pieces. Arrange them on the board for the best possible sale. Hit it and you move on; anything less ends the run.</p><div class="modes">
  <div class="mode" data-act="endless"><div class="mi">♾</div><b>Endless</b><span>Take your time</span><span class="ms">${st(PROG.endless)}</span></div>
  <div class="mode timed" data-act="timed"><div class="mi">⏱</div><b>Timed Endless</b><span>A bar drains each level. When it runs out, whatever is on the board is sold</span><span class="ms">${st(PROG.timed)}</span></div>`;
  $('app').innerHTML=h+'</div>'+(UI.settings?settingsHTML():'')}
/* ---------- run ---------- */
function startRun(tier){const R=PROG.routes[tier];UI.peek=null;UI.held=null;UI.sel.clear();stopRefine();
  run={tier,route:JSON.parse(JSON.stringify(R)),stop:0,gold:0,pack:[],curb:[],sales:[],mine:[],lost:null,result:null};UI.mode='run';render();drive()}
const nextCost=()=>run.stop<STOPS?run.route.costs[run.stop]:0;
function drive(){const from=run.stop,to=from+1,t0=performance.now(),dur=from?1100:700;sfx(110,.4,'sawtooth',.03);anim={from,to,t:0};render();
  const step=now=>{anim.t=Math.min(1,(now-t0)/dur);drawMap();if(anim.t<1){requestAnimationFrame(step);return}
    anim=null;run.stop=to;run.curb=cargoFor(to);sfx(520,.12);refineStop();render()};requestAnimationFrame(step)}
/* would perfect play at every later stop still cover the fuel? */
function routeCheck(stop,gold){let G=gold;for(let k=stop;k<STOPS;k++){G-=run.route.costs[k];if(G<0)return{short:-G,at:k+1};G+=run.route.bests[k]}return null}
function commit(){if(anim||run.result||run.lost)return;if(!dropHeld()){render();return}
  const s=run.stop,v=evalPack(packGrid()).total,best=run.route.bests[s-1],last=s===STOPS;
  if(!last&&run.gold+v<nextCost())return;
  stopRefine();if(v>best){run.route.bests[s-1]=v;run.route.layouts[s-1]=run.pack.map(i=>Object.assign({},i))}
  if(v>0&&v>=run.route.bests[s-1])cheer();
  run.sales[s-1]=v;run.mine[s-1]=run.pack.map(i=>Object.assign({},i));run.gold+=v;run.pack.length=0;run.curb.length=0;UI.sel.clear();UI.peek=null;sfx(880,.12);sfx(1320,.2);
  if(last){finish();return}
  const lost=routeCheck(s,run.gold);if(lost&&!run.ignoreLost){run.lost=lost;render();return}
  run.gold-=nextCost();drive()}
function keepGoing(){run.ignoreLost=true;run.lost=null;run.gold-=nextCost();drive()}
function finish(){const score=run.gold;PROG.xp+=score;const t=run.tier;run.newBest=!PROG.best[t]||score>PROG.best[t];if(run.newBest)PROG.best[t]=score;saveProg();sfx(660,.2);sfx(990,.3);run.result={ok:true,score};render()}
function giveUp(){stopRefine();run.result={ok:false};render()}
const cargoFor=k=>run.endless?cargo(run.route.seed,0,k-1,true):cargo(run.route.seed,run.tier,k-1);
const curbH=()=>run.endless?Math.max(STAGE_H,run.curbRows||0,...run.curb.map(i=>i.y+Math.max(...geom(i).cells.map(c=>c[1]))+1)):STAGE_H;
/* ---------- best load, rearranged to be as close as possible to the player's own load ---------- */
function withUids(layout,items){const used=new Set();return layout.map(L=>{if(L.uid!=null){used.add(L.uid);return L}const m=items.find(i=>!used.has(i.uid)&&i.d===L.d&&i.dir===L.dir&&i.base===L.base);used.add(m.uid);return Object.assign({},L,{uid:m.uid})})}
function nearestBest(k){UI.near=UI.near||{};const key=k+':'+run.route.bests[k-1];if(UI.near[key])return UI.near[key];
  const R=run.route,items=cargoFor(k),V=R.bests[k-1],byU={},U=items.map(i=>i.uid),C={},P={},S0={};
  for(const i of items){byU[i.uid]=i;C[i.uid]=cands(i,5,4)}
  for(const i of run.mine[k-1]||[])P[i.uid]={x:i.x,y:i.y,rot:i.rot||0};
  for(const i of withUids(R.layouts[k-1],items))S0[i.uid]={x:i.x,y:i.y,rot:i.rot||0};
  const same=(a,b)=>(!a&&!b)||(!!a&&!!b&&a.x===b.x&&a.y===b.y&&a.rot===b.rot);
  const dist=S=>U.reduce((n,u)=>n+(same(S[u],P[u])?0:1),0);
  const cellsOf=(u,p)=>geom(Object.assign({},byU[u],p)).cells.map(c=>(c[1]+p.y)*5+c[0]+p.x);
  const legal=(u,p)=>C[u].some(c=>c.x===p.x&&c.y===p.y&&c.rot===p.rot);
  const valid=S=>{const o=new Int16Array(20).fill(-1);for(const u of U){const p=S[u];if(!p)continue;if(!legal(u,p))return false;for(const c of cellsOf(u,p)){if(o[c]>=0)return false;o[c]=u}}return true};
  const val=S=>{const g={cols:5,rows:4,items:[]};for(const u of U)if(S[u])g.items.push(Object.assign({},byU[u],S[u]));return g.items.length?evalPack(g).total:0};
  let S=Object.assign({},S0),D=dist(S);
  for(let dy=-3;dy<=3;dy++)for(let dx=-4;dx<=4;dx++){if(!dx&&!dy)continue;const T={};for(const u of U)T[u]=S0[u]?{x:S0[u].x+dx,y:S0[u].y+dy,rot:S0[u].rot}:null;if(valid(T)&&val(T)>=V){const d=dist(T);if(d<D){S=T;D=d}}}
  const rnd=mulberry(R.seed+k*7919);let best=S,bD=D;
  for(let it=0;it<6000&&bD>0;it++){const u=U[(rnd()*U.length)|0],q=rnd(),T=Object.assign({},S);
    T[u]=q<.55?P[u]:q<.7?null:(C[u].length?(c=>({x:c.x,y:c.y,rot:c.rot}))(C[u][(rnd()*C[u].length)|0]):null);
    if(same(T[u],S[u]))continue;
    if(T[u]){const mine=new Set(cellsOf(u,T[u]));for(const v of U){if(v===u||!T[v])continue;if(cellsOf(v,T[v]).some(c=>mine.has(c))){const opts=[P[v]].concat(C[v].map(c=>({x:c.x,y:c.y,rot:c.rot})));let moved=null;
      for(const o of opts.slice(0,1).concat(opts.slice(1).sort(()=>rnd()-.5).slice(0,8))){if(!o)continue;const W2=Object.assign({},T,{[v]:o});if(valid(W2)){moved=o;break}}T[v]=moved}}}
    if(!valid(T)||val(T)<V)continue;const d=dist(T);
    if(d<=D||rnd()<.04){S=T;D=d;if(d<bD){bD=d;best=T}}}
  const lay=U.filter(u=>best[u]).map(u=>Object.assign({},byU[u],best[u])),ch=new Set(U.filter(u=>!same(best[u],P[u])));
  const out={layout:lay,changed:ch,add:U.filter(u=>best[u]&&!P[u]),move:U.filter(u=>best[u]&&P[u]&&!same(best[u],P[u])),drop:U.filter(u=>!best[u]&&P[u]),byU};
  UI.near[key]=out;return out}
/* ---------- map ---------- */
function nodePos(i,n,w){const x=40+(w-80)*i/n,y=46+(i%2?-18:18);return[x,y]}
function drawMap(){const svg=$('map');if(!svg||!run)return;const n=STOPS,w=svg.clientWidth||900;let h='';
  const pts=[];for(let i=0;i<=n;i++)pts.push(nodePos(i,n,w));
  for(let i=0;i<n;i++){const a=pts[i],b=pts[i+1],done=i<run.stop;h+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="road${done?' done':''}"/>`;
    if(i>0)h+=`<text x="${(a[0]+b[0])/2}" y="${(a[1]+b[1])/2-10}" class="fuel${i===run.stop?' now':''}">⛽${run.route.costs[i]}</text>`}
  pts.forEach((p,i)=>{h+=`<circle cx="${p[0]}" cy="${p[1]}" r="${i===0?10:13}" class="node${i<=run.stop?' seen':''}${i===n?' end':''}"/><text x="${p[0]}" y="${p[1]+5}" class="nlab">${i===0?'🏠':i===n?'🏁':i}</text>`;
    if(i>0&&run.sales[i-1]!=null)h+=`<text x="${p[0]}" y="${p[1]+32}" class="sold">+${run.sales[i-1]}</text>`});
  let tp=pts[run.stop];if(anim){const a=pts[anim.from],b=pts[anim.to],t=anim.t*anim.t*(3-2*anim.t);tp=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
  h+=`<text x="${tp[0]}" y="${tp[1]-16}" class="truck">🚚</text>`;svg.innerHTML=h}
/* ---------- render ---------- */
function botLine(w){return UI.exact==='done'?`✔ Every possible arrangement checked: the best for this ${w} is certain.`:UI.exact==='running'?`🤖 Checking every possible arrangement of this ${w}…`:UI.refining?`🤖 Bot is still double-checking this ${w}…`:`🤖 Bot finished checking this ${w}.`}
function settingsHTML(){return`<div class="modal"><div class="mbox set"><h2>Settings</h2>
  <label class="tog" data-act="exacttog"><i class="sw${PROG.exact?' on':''}"></i><span><b>Exact check</b><br><small>On levels with up to 6 pieces, also try every possible arrangement in the background, so the best sale is certain. Takes seconds to minutes and makes your device work harder. When off, only the smart bot searches.</small></span></label>
  <label class="tog" data-act="darktog"><i class="sw${PROG.dark?' on':''}"></i><span><b>Dark mode</b></span></label>
  <button class="pri" data-act="closeset">Done</button></div></div>`}
function showSettings(){UI.settings=true;if(UI.mode==='run')render();else renderRoutes()}
/* a redraw (e.g. when the bot finishes) keeps showing whatever the pointer is over */
function rehover(){if(lastMove&&UI.mode==='run'&&!UI.settings)hover(lastMove)}
function softRender(){if(UI.mode==='run'&&run&&!UI.held)render()}
function peekGrid(k,word){const mine=UI.mine,NB=nearestBest(k);UI.diff=NB.changed;const src=mine?run.mine[k-1]||[]:NB.layout,dg=UI.grids.demo={cols:5,rows:4,items:src.map(i=>Object.assign({},i))};UI.dev=evalPack(dg);
  return'<div class="demo'+(mine?' mine':'')+'">'+gridHTML('demo',mine?`👤 Your layout at ${word} ${k} · ${run.sales[k-1]} 🪙`:`👁 Best possible at ${word} ${k} · ${run.route.bests[k-1]} 🪙`)+'</div>'}
function peekSide(k,word){const NB=nearestBest(k);
  const diff=NB.changed.size?'':'<div class="chlist">🏆 Your layout was already the best.</div>';
  return`<div class="hint">Best layout from ${word} ${k}'s pieces: <b>${run.route.bests[k-1]} 🪙</b>.<br>${run.sales[k-1]!=null?`You sold for <b>${run.sales[k-1]} 🪙</b>.`:'You didn\'t sell this one.'}<br>${NB.changed.size?`<small>${NB.changed.size} piece${NB.changed.size===1?'':'s'} differ from your layout (highlighted).</small>`:''}${diff}</div><button class="act" data-act="peek">↩ Back</button><button class="act peekb" data-act="mine">${UI.mine?'👁 Show best layout':'👤 Show my layout'}</button>`}
/* ---------- endless mode: hit the best possible sale every level ---------- */
function startEndless(timed){stopRefine();UI.peek=null;UI.held=null;UI.sel.clear();UI.near={};
  run={endless:true,timed:!!timed,tier:0,route:{seed:(Math.random()*1e9)|0,bests:[],layouts:[]},stop:0,gold:0,pack:[],curb:[],sales:[],mine:[],result:null,lost:null};UI.mode='run';nextLevel()}
async function nextLevel(){const R=run;stopRefine();run.stop++;run.pack=[];run.curb=cargoFor(run.stop);run.curbRows=curbRows(run.curb.length);run.loading=true;UI.peek=null;render();
  const r=await solveP(run.curb);if(R!==run)return;run.route.bests[run.stop-1]=r.best;run.route.layouts[run.stop-1]=r.layout;run.loading=false;if(run.timed){run.tDur=levelTime(run.curb.length,run.stop);run.tLeft=run.tDur}sfx(520,.12);refineStop();render()}
function commitEndless(force){if(run.loading||run.result)return;if(run.practice){practiceSell();return}if(!dropHeld()){render();return}const s=run.stop,v=evalPack(packGrid()).total,best=run.route.bests[s-1];if(!v&&!force)return;stopRefine();run.tLeft=null;
  run.sales[s-1]=v;run.mine[s-1]=run.pack.map(i=>Object.assign({},i));
  if(v>=best){if(v>best){run.route.bests[s-1]=v;run.route.layouts[s-1]=run.mine[s-1]}cheer();run.pack=[];run.curb=[];render();setTimeout(()=>{if(run&&run.endless&&!run.result)nextLevel()},1300);return}
  endEndless()}
function replayLevel(){const s=run.stop;stopRefine();run.practice=true;run.result=null;run.practiceRes=null;UI.peek=null;UI.held=null;UI.sel.clear();
  run.pack=[];run.curb=cargoFor(s);refineStop();render()}
function practiceSell(){if(!dropHeld()){render();return}const s=run.stop,v=evalPack(packGrid()).total;if(!v)return;stopRefine();
  const best=run.route.bests[s-1];run.sales[s-1]=v;run.mine[s-1]=run.pack.map(i=>Object.assign({},i));
  if(v>best){run.route.bests[s-1]=v;run.route.layouts[s-1]=run.mine[s-1]}if(v>=best)cheer();else sfx(160,.2,'square');
  run.practiceRes={v,best:run.route.bests[s-1]};run.result=Object.assign({},run.streakRes);render()}
/* seconds for a level: more pieces, more time; a little less as levels climb */
function levelTime(n,lv){return Math.round((14+5*n)*Math.max(.6,1-(lv-1)*.012))}
/* when time is up: a held piece over a free spot in the bed is placed first, then the layout is sold */
function timeUp(){if(!run||run.result||run.loading)return;const h=UI.held;
  if(h&&lastMove){const c=cellAt(lastMove);if(c&&c.name==='pack'&&placeGroup(c.g,h,c.cx-h.gx,c.cy-h.gy,true))UI.held=null}
  if(UI.held)dropHeld();sfx(300,.25,'square');commitEndless(true)}
let lastT=0;function timerLoop(now){const dt=Math.min(.1,(now-(lastT||now))/1000);lastT=now;
  if(run&&run.timed&&run.tLeft!=null&&!run.result&&!run.loading&&!UI.settings){run.tLeft-=dt;const f=$('tfill'),t=$('tsec');
    if(f){const p=Math.max(0,run.tLeft/run.tDur);f.style.width=(p*100)+'%';f.className=p<.2?'low':p<.45?'mid':''}if(t)t.textContent=Math.max(0,Math.ceil(run.tLeft))+'s';
    if(run.tLeft<=0){run.tLeft=null;timeUp()}}
  requestAnimationFrame(timerLoop)}
requestAnimationFrame(timerLoop);
function endEndless(){const streak=run.stop-1,key=run.timed?'timed':'endless';run.tLeft=null;run.newBest=streak>(PROG[key]||0);if(run.newBest)PROG[key]=streak;saveProg();sfx(120,.3,'square');run.result={endless:true,streak};run.streakRes=run.result;render()}
function cellSize(cols,rows){const compact=innerHeight<560||innerWidth<900,side=compact?150:210,
    hc=compact?(run&&run.timed?166:150):(run&&run.timed?266:246),wc=compact?96:150;
  return Math.max(26,Math.min(64,Math.floor((innerWidth-side-wc)/cols),Math.floor((innerHeight-hc)/Math.max(4,rows))))}
function renderEndless(){const s=run.stop,g=UI.grids.pack=packGrid(),ch=curbH();UI.grids.curb={cols:STAGE_W,rows:ch,items:run.curb};
  UI.cs=cellSize(STAGE_W+5,ch);
  const ev=UI.ev=evalPack(g),v=ev.total,best=run.route.bests[s-1],hit=!run.loading&&v>0&&v>=best;
  let h=`<div class="phead"><h2>${run.timed?'⏱ Timed':'♾ Endless'}</h2><span class="lvl">Level <b>${s}</b></span>${run.practice?'<span class="prac">Replay · run over</span>':''}<span class="stopn">Best ${PROG[run.timed?'timed':'endless']||0}</span><button class="icon sp2" data-act="settings" title="Settings">⚙</button><button class="ghostb" data-act="giveup">End run</button></div>${run.timed&&!run.practice?`<div class="tbar"><i id="tfill" style="width:${run.tLeft!=null&&run.tDur?Math.max(0,run.tLeft/run.tDur)*100:100}%"></i><span id="tsec">${run.tLeft!=null?Math.max(0,Math.ceil(run.tLeft))+'s':''}</span></div>`:''}<div class="grids">`;
  h+=gridHTML('curb',`Pieces for level ${s} <small>· ${run.curb.length}</small>`);
  if(UI.peek!=null)h+=peekGrid(UI.peek,'level');else h+=gridHTML('pack','Board');
  h+='<div class="side">';
  if(UI.peek!=null)h+=peekSide(UI.peek,'level');
  else{if(run.loading)h+=`<div class="hint think">🤖 Working out the best possible layout…</div>`;
    else h+=`<button class="act go" data-act="commit" ${v?'':'disabled'}><span>Sell for</span><b>${v} 🪙</b></button>`;
    if(s>1&&run.sales[s-2]!=null)h+=`<button class="act peekb" data-act="peek">👁 Best layout at level ${s-1}</button>`;
    if(!run.loading)h+=`<div class="bot">${botLine('level')}</div>`}
  h+=`</div></div><div id="info">${UI.held?(UI.held.info||(UI.held.items.length===1?infoHTML(UI.held.items[0].it,null):UI.held.items.length+' pieces · worth '+UI.held.val)):IDLE}</div>`;
  if(run.result&&UI.peek==null){const r=run.result,P=run.practiceRes;h+=`<div class="modal"><div class="mbox">${P?`<h2>${P.v>=P.best?'🎯 Got it!':'Not quite'}</h2><p>Replay of level ${s}: you sold for <b>${P.v}</b>${P.v>=P.best?', the best possible.':`, best is <b>${P.best}</b>.`}</p><p>Your run ended at a streak of <b>${r.streak}</b>.</p>`:`<p class="kick">Streak over</p><p class="score">${r.streak}</p><p>level${r.streak===1?'':'s'} beaten in a row${run.newBest?' · <b class="nb">new best!</b>':''}</p>`}
    ${!P&&run.route.bests[s-1]!=null?`<p>Level ${s}: ${run.sales[s-1]!=null?`you sold for <b>${run.sales[s-1]}</b>, `:''}best was <b>${run.route.bests[s-1]}</b>.</p>`:''}${P?'':''}${run.route.bests[s-1]!=null?`<div class="mrow"><button data-act="peekfinal">👁 Best layout</button><button data-act="replay">↺ Replay level ${s}</button></div>`:''}<button class="pri" data-act="again">Start a new run</button><button data-act="routes">Menu</button></div></div>`}
  if(UI.settings)h+=settingsHTML();$('app').innerHTML=h;placeHeld();rehover()}
function render(){if(UI.mode!=='run'||!run){renderRoutes();return}
  if(run.endless){renderEndless();return}
  const s=run.stop,last=s===STOPS,g=UI.grids.pack=packGrid();UI.grids.curb={cols:STAGE_W,rows:STAGE_H,items:run.curb};
  UI.cs=Math.max(40,Math.min(64,Math.floor((innerWidth-330)/11),Math.floor((innerHeight-330)/4)));
  const ev=UI.ev=evalPack(g),cost=nextCost(),v=ev.total,can=last||run.gold+v>=cost,prev=s>1?s-1:null;
  let h=`<div class="phead"><h2>🚚 ${TIERS[run.tier].name} route</h2><span class="big">🪙 ${run.gold}</span><span class="big tot">📦 ${v}</span><span class="stopn">${s?'Stop '+s+' / '+STOPS:'Leaving the depot'}</span><button class="sp2" data-act="settings" title="Settings">⚙</button><button data-act="giveup">End run</button></div>
  <svg id="map"></svg><div class="grids">`;
  h+=gridHTML('curb',s?`📦 Cargo at stop ${s} <small>· left behind when you drive</small>`:'📦 Cargo');
  if(UI.peek!=null)h+=peekGrid(UI.peek,'stop');
  else h+=gridHTML('pack','Board');
  h+='<div class="side">';
  if(UI.peek!=null)h+=peekSide(UI.peek,'stop');
  else if(s>0&&!anim){
    if(last)h+=`<button class="act go" data-act="commit" ${v?'':'disabled'}>💰 Sell <b>+${v}</b> & deliver 🏁</button><div class="hint">Final stop. Your gold after this sale is your score.</div>`;
    else{h+=`<button class="act go" data-act="commit" ${can&&v?'':'disabled'}>💰 Sell <b>+${v}</b> & drive<br>to ${s+1===STOPS?'🏁 final stop':'stop '+(s+1)} · ⛽ ${cost}</button>`;
      if(!can)h+=`<div class="hint bad">This load is ${cost-run.gold-v} 🪙 short of the fuel. Make it worth more.</div>`}
    if(prev)h+=`<button class="act peekb" data-act="peek">👁 Best layout at stop ${prev}</button>`;
    h+=`<div class="bot">${botLine('stop')}</div>`}
  h+=`</div></div><div id="info">${UI.held?(UI.held.items.length===1?infoHTML(UI.held.items[0].it,null):UI.held.items.length+' pieces · worth '+UI.held.val):IDLE}</div>`;
  if(run.lost&&!UI.busy)h+=`<div class="modal"><div class="mbox"><h2>📉 Route can't be finished</h2><p>Even with the best possible load at every remaining stop,<br>you'd be <b>${run.lost.short} 🪙</b> short of fuel before stop ${run.lost.at}.</p>
    <button data-act="retry">↺ Retry this route</button><button data-act="newroute">🎲 New route</button><button data-act="keep">Keep driving anyway</button></div></div>`;
  if(run.result&&UI.peek==null&&!UI.busy){const r=run.result;h+=`<div class="modal"><div class="mbox">${r.ok?`<h2>📦 Delivered!</h2><p class="score">🪙 ${r.score}</p><p>+${r.score} XP${run.newBest?' · new best!':''} · total ⭐ ${PROG.xp}</p>`:`<h2>Route abandoned</h2>`}
    ${r.ok?`<button data-act="peekfinal">👁 Best final load</button>`:''}<button data-act="retry">↺ Same route again</button><button data-act="newroute">🎲 New route</button><button data-act="routes">🗺 Routes</button></div></div>`}
  if(UI.busy&&UI.busy.single)h+=`<div class="modal"><div class="mbox"><h2>🤖 Checking route…</h2><p>Playing stop ${UI.busy.stop+1} of ${STOPS} perfectly to set fair fuel prices.</p></div></div>`;
  if(UI.settings)h+=settingsHTML();$('app').innerHTML=h;drawMap();placeHeld();rehover()}
const TOUCH=matchMedia('(pointer:coarse)').matches;
const IDLE=TOUCH?'<span class="tip">Tap a piece to pick it up, tap a square to place it, or drag it · double-tap: turn · long-press board pieces: select several</span>':'<span class="tip">Click: lift · click a piece while holding: swap · <kbd>R</kbd>: turn · <kbd>Shift</kbd>-click: send to board / select several</span>';
/* ---------- hover ---------- */
function hover(e){if(!e||UI.mode!=='run'||!run||(run.result&&UI.peek==null)||run.lost)return;hideHl();const c=cellAt(e),h=UI.held,CS=UI.cs,info=$('info');if(!info)return;
  if(h&&!UI.peek){if(c&&c.name!=='demo'){const nx=c.cx-h.gx,ny=c.cy-h.gy,ok=placeGroup(c.g,h,nx,ny,false),sw=!ok&&swapWith(c.g,h,nx,ny);let s='';for(const q of h.items)for(const[sx,sy]of geom(q.it).cells){const x=nx+q.dx+sx,y=ny+q.dy+sy;if(x>=0&&y>=0&&x<c.g.cols&&y<c.g.rows)s+=`<i class="gh ${ok?'ok':sw?'sw':'no'}" style="left:${x*CS+2}px;top:${y*CS+2}px;width:${CS-4}px;height:${CS-4}px"></i>`}c.gin.querySelector('.ghost').innerHTML=s}return}
  if(!c){info.innerHTML=IDLE;return}
  const it=occ(c.g)[c.cy*c.g.cols+c.cx];if(!it){info.innerHTML=IDLE;return}
  const E=c.name==='pack'?UI.ev:c.name==='demo'?UI.dev:null,s=E?E.S.find(q=>q.it===it):null;info.innerHTML=infoHTML(it,s);
  if(s){let o=areaHTML(s,c.g,CS);const box=(q,cl)=>{for(const[x,y]of q.cells)o+=`<i class="${cl}" style="left:${x*CS+1}px;top:${y*CS+1}px;width:${CS-2}px;height:${CS-2}px"></i>`};s.tg.forEach(t=>box(t,'tgt'));E.S.forEach(q=>{if(q!==s&&!q.sil&&q.tg.includes(s))box(q,'src')});c.gin.querySelector('.hl').innerHTML=o}}
/* ---------- input ---------- */
function onDown(e){if(e.button===2){rotateHeld();return}const a=e.target.closest('[data-act]');
  if(a){if(a.disabled)return;const k=a.dataset.act;
    if(k==='settings')showSettings();else if(k==='closeset'){UI.settings=false;UI.mode==='run'?render():renderRoutes()}
    else if(k==='exacttog'){PROG.exact=!PROG.exact;saveProg();if(run&&UI.mode==='run'&&!run.result){if(PROG.exact)exactStop();else stopExact()}e.preventDefault();UI.mode==='run'?render():renderRoutes()}
    else if(k==='darktog'){PROG.dark=!PROG.dark;saveProg();applyTheme();UI.mode==='run'?render():renderRoutes()}
    else if(k==='gen')genAll();else if(k==='start')startRun(+a.dataset.r);else if(k==='commit'){run.endless?commitEndless():commit()}else if(k==='giveup'){if(!run.result){if(run.endless&&run.practice){stopRefine();run.practiceRes=null;run.result=Object.assign({},run.streakRes);render()}else run.endless?endEndless():giveUp()}}else if(k==='endless')startEndless(false);else if(k==='timed')startEndless(true);else if(k==='again')startEndless(run.timed);else if(k==='replay')replayLevel();
    else if(k==='retry'){startRun(run.tier)}else if(k==='newroute'){freshRoute(run.tier)}else if(k==='routes')routesScreen();else if(k==='keep')keepGoing();
    else if(k==='peek'){UI.peek=UI.peek!=null?null:run.stop-1;UI.mine=false;hideHl();render()}else if(k==='peekfinal'){UI.peek=run.endless?run.stop:STOPS;UI.mine=false;render()}else if(k==='mine'){UI.mine=!UI.mine;hideHl();render()}return}
  if(!run||UI.mode!=='run')return;
  if(UI.peek!=null){if(!e.target.closest('.gin')){UI.peek=null;render()}return}
  if(run.result||run.lost||anim)return;const c=cellAt(e),h=UI.held;
  if(!h&&UI.sel.size&&!e.shiftKey&&(!c||(c.name==='pack'&&!occ(c.g)[c.cy*c.g.cols+c.cx]))){UI.sel.clear();render();return}
  if(!c)return;
  if(h){const nx=c.cx-h.gx,ny=c.cy-h.gy;if(placeGroup(c.g,h,nx,ny,true)){UI.held=null;sfx(500,.05)}
    else{const o=swapWith(c.g,h,nx,ny);if(!o){sfx(140,.06,'square');return}
      c.g.items.splice(c.g.items.indexOf(o),1);const it=h.items[0].it;it.x=nx;it.y=ny;c.g.items.push(it);
      const inside=geom(o).cells.some(q=>q[0]+o.x===c.cx&&q[1]+o.y===c.cy),f=geom(o).cells[0],s=c.name==='pack'?UI.ev.S.find(v=>v.it===o):null;
      UI.held={items:[{it:o,dx:0,dy:0,ox:o.x,oy:o.y,orot:o.rot||0}],from:c.name,gx:inside?c.cx-o.x:f[0],gy:inside?c.cy-o.y:f[1],val:s?s.val:o.base,info:infoHTML(o,s)};sfx(560,.05)}}
  else{const it=occ(c.g)[c.cy*c.g.cols+c.cx];if(!it)return;
    if(e.shiftKey){if(c.name==='curb'){c.g.items.splice(c.g.items.indexOf(it),1);if(toPack(it))sfx(500,.05);else{c.g.items.push(it);toast('No room on the board')}}else{if(UI.sel.has(it))UI.sel.delete(it);else UI.sel.add(it);sfx(650,.03)}}
    else{const grp=c.name==='pack'&&UI.sel.has(it)?[...UI.sel]:[it];let val=0;const items=grp.map(q=>{const s=c.name==='pack'?UI.ev.S.find(v=>v.it===q):null;val+=s?s.val:q.base;return{it:q,dx:q.x-it.x,dy:q.y-it.y,ox:q.x,oy:q.y,orot:q.rot||0}});
      const info=grp.length===1?infoHTML(it,c.name==='pack'?UI.ev.S.find(v=>v.it===it):null):grp.length+' pieces · worth '+val;
      for(const q of grp)c.g.items.splice(c.g.items.indexOf(q),1);UI.sel.clear();UI.held={items,from:c.name,gx:c.cx-it.x,gy:c.cy-it.y,val,info};sfx(600,.04)}}
  render();hover(e)}
$('app').addEventListener('mousedown',onDown);
/* ---------- touch ---------- */
const T={x0:null};let lastTap=null;
function fakeEv(x,y,shift){return{clientX:x,clientY:y,target:document.elementFromPoint(x,y)||document.body,shiftKey:!!shift,button:0,preventDefault(){}}}
function moveHeldTo(x,y){mouse.x=x;mouse.y=y;if(UI.held){const h=$('held');h.style.left=(x-(UI.held.gx+.5)*UI.cs)+'px';h.style.top=(y-(UI.held.gy+.5)*UI.cs)+'px'}}
function doubleTap(c,f){let h=UI.held;if(!h){onDown(f);h=UI.held;if(!h)return}
  const q=h.items[0];if(h.items.length!==1||!DEF[q.it.d].big){onDown(f);return}
  rotateHeld();const g=UI.grids[h.from],it=q.it,cells=geom(it).cells,tries=[[q.ox,q.oy]].concat(cells.map(k=>[c.cx-k[0],c.cy-k[1]]));
  if(c.name===h.from)for(const[x,y]of tries)if(fits(g,it,x,y)){it.x=x;it.y=y;g.items.push(it);UI.held=null;break}
  sfx(600,.05);render()}
function tap(f){const now=performance.now(),c=cellAt(f);
  if(UI.peek!=null){if(!c){UI.peek=null;render()}else hover(f);return}
  if(c&&lastTap&&now-lastTap.t<330&&lastTap.c&&lastTap.c.name===c.name&&lastTap.c.cx===c.cx&&lastTap.c.cy===c.cy){lastTap=null;doubleTap(c,f);return}
  lastTap={t:now,c};
  if(c&&c.name==='pack'&&UI.sel.size&&!UI.held&&occ(c.g)[c.cy*c.g.cols+c.cx]){onDown(fakeEv(f.clientX,f.clientY,true));return}
  onDown(f)}
document.addEventListener('touchstart',e=>{if(e.touches.length>1||UI.mode!=='run'||!run)return;const p=e.touches[0],el=document.elementFromPoint(p.clientX,p.clientY);
  if(!el||!el.closest('.gin')||el.closest('[data-act]'))return;e.preventDefault();
  /* the touched element may be redrawn away mid-gesture, so listen on it directly (events keep going to it) */
  const tg=e.target,off=()=>{tg.removeEventListener('touchmove',tMove);tg.removeEventListener('touchend',tEnd);tg.removeEventListener('touchcancel',tCancel)};T.off&&T.off();T.off=off;
  tg.addEventListener('touchmove',tMove,{passive:false});tg.addEventListener('touchend',tEnd,{passive:false});tg.addEventListener('touchcancel',tCancel);
  Object.assign(T,{x0:p.clientX,y0:p.clientY,moved:false,lp:false,drag:false});moveHeldTo(p.clientX,p.clientY);clearTimeout(T.timer);
  const c=cellAt(fakeEv(p.clientX,p.clientY));
  if(!UI.held&&UI.peek==null&&!run.result&&c&&c.name==='pack'&&occ(c.g)[c.cy*c.g.cols+c.cx])
    T.timer=setTimeout(()=>{if(T.moved||T.x0==null)return;T.lp=true;onDown(fakeEv(T.x0,T.y0,true));try{navigator.vibrate&&navigator.vibrate(18)}catch(_){}},430)},{passive:false});
function tMove(e){if(T.x0==null)return;e.preventDefault();const p=e.touches[0],x=p.clientX,y=p.clientY;
  if(!T.moved&&Math.hypot(x-T.x0,y-T.y0)>9){T.moved=true;clearTimeout(T.timer);
    if(UI.peek==null&&!run.result){if(!UI.held&&!T.lp)onDown(fakeEv(T.x0,T.y0));if(UI.held)T.drag=true}}
  moveHeldTo(x,y);const f=fakeEv(x,y);lastMove=f;hover(f)}
function tEnd(e){if(T.x0==null)return;e.preventDefault();T.off&&T.off();T.off=null;clearTimeout(T.timer);const p=e.changedTouches[0],f=fakeEv(p.clientX,p.clientY);lastMove=f;
  if(T.drag){if(UI.held&&cellAt(f))onDown(f)}else if(!T.moved&&!T.lp)tap(f);T.x0=null}
function tCancel(){clearTimeout(T.timer);T.x0=null;T.off&&T.off();T.off=null}
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='r')rotateHeld();else if(k==='escape'){if(UI.peek!=null){UI.peek=null;render()}else if(UI.held&&run){dropHeld();render()}}});
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;lastMove=e;if(UI.held){const h=$('held');h.style.left=(e.clientX-(UI.held.gx+.5)*UI.cs)+'px';h.style.top=(e.clientY-(UI.held.gy+.5)*UI.cs)+'px'}hover(e)});
addEventListener('resize',()=>{if(UI.mode==='run')render()});
applyTheme();renderRoutes();
window.__game={get run(){return run},get UI(){return UI},PROG,commit,startRun,genAll};
