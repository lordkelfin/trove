'use strict';
/* ================= items, pack maths, world generation ================= */
const DX=[0,1,0,-1],DY=[-1,0,1,0];
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const RAR=['Common','Uncommon','Rare','Legendary'];
const TAGI={gem:'💎',metal:'🔩',relic:'🏺',nature:'🌿',fire:'🔥',ice:'❄️',cursed:'☠️'};
const SH={a:[[0,0]],b:[[0,0],[1,0]],c:[[0,0],[1,0],[2,0]],L:[[0,0],[0,1],[1,1]],J:[[0,0],[0,1],[0,2],[1,2]],T:[[0,0],[1,0],[2,0],[1,1]],S:[[1,0],[2,0],[0,1],[1,1]],O:[[0,0],[1,0],[0,1],[1,1]],U:[[0,0],[2,0],[0,1],[1,1],[2,1]],P:[[1,0],[0,1],[1,1],[2,1],[1,2]]};
const ARROWK=new Set(['mul','add','tagmul','rot','align','attract','modadd','modmul','pierce','relay','fang','mask','envy','bless','silence','sacrifice']);
const I=(id,icon,name,base,rar,tags,shape,k,n,desc,x)=>Object.assign({id,icon,name,base,rar,tags:tags?tags.split(' '):[],shape:SH[shape],big:shape!=='a',k,n,desc,arrow:ARROWK.has(k)},x);
const ITEMS=[
// plain treasure
I('copper','🪙','Copper Coins',6,0,'metal','a','none'),
I('feather','🪶','Griffin Feather',8,0,'nature','a','none'),
I('shell','🐚','Spiral Shell',9,0,'nature','a','none'),
I('amber','🟠','Amber Bead',12,0,'gem','a','none'),
I('rug','🧶','Rolled Rug',20,0,'','b','none'),
I('antler','🦌','Elk Antler',26,0,'nature','L','none'),
I('scroll','📜','Sealed Scroll',16,1,'relic','a','none'),
I('ring','💍','Silver Ring',18,1,'metal gem','a','none'),
I('goblet','🏆','Old Goblet',22,1,'metal relic','a','none'),
I('icepearl','🔵','Glacier Pearl',28,1,'gem ice','a','none'),
I('emberglass','🔴','Emberglass',26,1,'gem fire','a','none'),
I('idol','🗽','Golden Idol',50,1,'metal relic','b','none'),
I('tusk','🦴','Mammoth Tusk',48,1,'nature','J','none'),
I('tapestry','🖼️','Royal Tapestry',60,1,'relic','c','none'),
I('diamond','💎','Star Diamond',55,2,'gem','a','none'),
I('anchor','⚓','Sunken Anchor',95,2,'metal','T','none',0,'Heavy: bottom row only.',{heavy:true}),
I('serpent','🐍','Jade Serpent',110,2,'gem','S','none'),
I('dskull','🐲','Dragon Skull',150,2,'relic fire','O','none'),
I('crown','👑','Lost Crown',95,3,'metal relic','a','none'),
I('throne','🪑','Lost Throne',240,3,'metal relic','P','none',0,'Heavy: bottom row only.',{heavy:true}),
// small arrows
I('bell','🔔','Blessing Bell',6,0,'','a','add',12,'➜ +N'),
I('cloth','🧽','Polishing Cloth',4,0,'','a','add',6,'➜ +N'),
I('cog','⚙️','Clockwork Cog',9,0,'metal','a','rot',0,'➜ arrow turns ↻',{q:1}),
I('vane','🎏','Windvane',9,0,'','a','rot',0,'➜ arrow turns ↺',{q:3}),
I('wand','🪄','Gilding Wand',8,1,'','a','mul',2,'➜ ×N'),
I('loupe','🔍',"Jeweler's Loupe",10,1,'','a','tagmul',3,'➜ ×N if 💎',{tag:'gem'}),
I('quill','✒️',"Scholar's Quill",10,1,'','a','tagmul',3,'➜ ×N if 🏺',{tag:'relic'}),
I('tongs','🔧',"Smith's Tongs",10,1,'metal','a','tagmul',3,'➜ ×N if 🔩',{tag:'metal'}),
I('whirl','🌀','Whirl Charm',10,1,'','a','rot',0,'➜ arrow flips 180°',{q:2}),
I('hand','👉',"Herald's Hand",9,1,'','a','align',0,'➜ arrow copies mine'),
I('homing','🧿','Homing Eye',9,1,'','a','attract',0,'➜ arrow points back at me'),
I('conch','📯','Echo Conch',8,1,'','a','relay',0,'Arrows hitting me pass on ➜'),
I('fang','🦷','Vampire Fang',5,1,'cursed','a','fang',1.5,'➜ worth 0. I gain N× its base'),
I('mirror','🪞','Envious Mirror',5,1,'','a','envy',1,'+N× base of ➜'),
I('lead','🔒','Lead Seal',6,1,'metal','a','silence',0,'➜ has no effect'),
I('flask','⚗️','Leaky Flask',45,1,'cursed','a','mul',.6,'➜ ×N'),
I('spark','🔸','Spark Rune',8,1,'','a','modadd',1,"➜ effect number +N"),
I('bow','🏹','Spirit Bow',12,2,'','a','pierce',0,'➜ arrow hits its whole line'),
I('mask','🎭','Mimic Mask',10,2,'','a','mask',0,'I become a copy of ➜'),
I('water','💧','Holy Water',10,2,'','a','bless',0,'➜ curse becomes a blessing'),
I('dagger','🗡️','Sacrificial Dagger',12,2,'cursed metal','a','sacrifice',1.5,'➜ worth 0. Rest of my row ×N, if ➜ is occupied'),
I('lens','🔮','Focusing Lens',12,2,'','a','modmul',2,'➜ effect number ×N'),
I('rune','✴️','Power Rune',14,2,'','a','modadd',2,'➜ effect number +N'),
I('midas','☝️','Midas Finger',15,3,'','a','mul',3,'➜ ×N'),
I('prism','🔆','Grand Prism',20,3,'gem','a','modmul',3,'➜ effect number ×N'),
// big arrows (arrows turn with the piece)
I('lance','🌞','Sunbeam Lance',14,1,'metal','b','add',5,'Whole line ➜ +N',{ar:[[1,0,1]],line:true}),
I('twinstaff','🥢','Twin Staff',12,1,'','c','add',10,'Both ends ➜ +N',{ar:[[0,0,3],[2,0,1]]}),
I('fork','🔱',"Giant's Fork",20,2,'metal','T','add',8,'Three ➜ +N',{ar:[[0,0,0],[1,0,0],[2,0,0]]}),
I('sword','⚔️','Greatsword',30,2,'metal','c','mul',3,'Tip ➜ ×N',{ar:[[2,0,1]]}),
I('jaw','🦖',"Dragon's Jaw",30,2,'','U','mul',4,'Item in my jaws ×N',{ar:[[1,1,0]]}),
I('obelisk','🗼','Rune Obelisk',16,2,'relic','b','modadd',1,'Both ends ➜ effect number +N',{ar:[[0,0,3],[1,0,1]]}),
// touching / conditions
I('hearth','🔥','Hearthstone',10,0,'fire','a','aura4',6,'Touching me: +N'),
I('corner','🧱','Cornerstone',14,0,'','a','corner',3,'×N in a corner'),
I('dummy','🎯','Target Dummy',8,0,'','a','quiver',10,'+N per arrow hitting me'),
I('acorn','🌰',"Druid's Acorn",8,0,'nature','a','pertag',6,'+N per other 🌿',{tag:'nature'}),
I('spore','🍄','Rot Spore',32,0,'cursed nature','a','aura8',-6,'All around me: N'),
I('lantern','🏮','Festival Lantern',12,1,'fire','a','aura8',4,'All around me: +N'),
I('skull','💀','Cursed Skull',75,1,'cursed relic','a','auramul',.5,'Touching me: ×N'),
I('twin','🗿','Twin Idol',15,1,'relic','a','twin',3,'×N touching another Twin Idol'),
I('magnet','🧲','Magnet',8,1,'metal','a','pertag',7,'+N per other 🔩',{tag:'metal'}),
I('void','⚫','Void Orb',5,1,'','a','empty',3,'+N per empty slot'),
I('ruby','♦️','Ember Ruby',25,1,'gem fire','a','adjtag',.75,'+N× per 🔥 touching me',{tag:'fire'}),
I('sapphire','❄️','Frost Sapphire',25,1,'gem ice','a','adjtag',.75,'+N× per ❄️ touching me',{tag:'ice'}),
I('wine','🍷','Aging Wine',10,1,'','a','grow',0,'Base +6 per level',{g:6}),
I('rat','🐀',"Packrat's Charm",12,1,'','a','full',3,'×N if the pack is full'),
I('drum','🥁','War Drum',25,1,'','O','aura4',12,'Touching me: +N'),
I('chandelier','🕯️','Chandelier',20,1,'fire','T','aura8',6,'All around me: +N'),
I('tome','📚','Great Tome',10,1,'relic','b','distinct',5,'+N per different item kind'),
I('banner','🚩','Caravan Banner',10,2,'','a','row',1.5,'Rest of my row ×N'),
I('totem','🪵','Totem Pole',15,2,'nature','c','col',1.5,'Rest of my columns ×N'),
I('rod','⚡','Lightning Rod',10,2,'metal','a','rod',1,'×(1 + N per arrow hitting me)'),
I('hermit','🦪','Hermit Pearl',20,2,'gem','a','hermit',4,'×N if nothing touches me'),
I('steam','♨️','Steam Heart',20,2,'','a','steam',3,'×N touching both 🔥 and ❄️'),
I('scales','⚖️','Balance Scales',15,2,'metal','a','scales',4,'×N if left and right bases match'),
I('clover','🍀','Four-leaf Clover',7,2,'nature','a','global',3,'Everything else +N'),
I('seed','🌱','Sprouting Seed',3,2,'nature','a','growx',0,'Base doubles each level'),
I('cluster','💠','Crystal Cluster',30,2,'gem','L','pertag',12,'+N per other 💎',{tag:'gem'}),
I('coffin','⚰️','Cursed Coffin',150,2,'cursed relic','b','auramul',.5,'Touching me: ×N'),
I('kseal','🎖️',"King's Seal",20,3,'relic','a','kseal',2,'All 4 sides filled: they get ×N'),
I('egg','🥚','Dragon Egg',40,3,'nature fire','a','grow',0,'Base +25 per level',{g:25}),
I('cell','🔋','Storm Cell',15,3,'','a','modaura',1,'Touching me: effect number +N'),
];
const DEF={};ITEMS.forEach(d=>DEF[d.id]=d);
const fm=n=>Math.abs(n-Math.round(n))<1e-9?String(Math.round(n)):(Math.round(n*100)/100).toString();
function mk(id,r){const d=DEF[id];return{d:id,dir:d.arrow&&!d.ar?(r()*4|0):0,rot:0,x:0,y:0,base:d.base}}
function rollItem(r,depth,luck){let best=0;for(let i=0;i<=luck;i++){const w=[60,28+4*depth,8+3*depth,Math.min(1+1.2*depth,12)];let x=r()*w.reduce((a,b)=>a+b),k=0;while(k<3&&x>=w[k]){x-=w[k];k++}best=Math.max(best,k)}
  const pool=ITEMS.filter(d=>d.rar===best);return mk(pool[r()*pool.length|0].id,r)}
/* shape of an item after rotation: cells and arrows in local coordinates */
function geom(it){const d=DEF[it.d];let c=d.shape.map(a=>[a[0],a[1]]),ar=d.ar?d.ar.map(a=>[a[0],a[1],a[2]]):(d.arrow?[[0,0,it.dir]]:[]);
  if(d.big)for(let r=0;r<(it.rot||0);r++){const h=Math.max(...c.map(a=>a[1]))+1;c=c.map(([x,y])=>[h-1-y,x]);ar=ar.map(([x,y,q])=>[h-1-y,x,(q+1)%4])}
  return{cells:c,arrows:ar.map(a=>({x:a[0],y:a[1],dir:a[2]}))}}
function occ(g){const o=new Array(g.cols*g.rows).fill(null);for(const it of g.items)for(const[cx,cy]of geom(it).cells){const x=it.x+cx,y=it.y+cy;if(x>=0&&y>=0&&x<g.cols&&y<g.rows)o[y*g.cols+x]=it}return o}
function fits(g,it,gx,gy){const o=occ(g);let maxY=0;for(const[cx,cy]of geom(it).cells){const x=gx+cx,y=gy+cy;if(x<0||y<0||x>=g.cols||y>=g.rows)return false;const q=o[y*g.cols+x];if(q&&q!==it)return false;maxY=Math.max(maxY,y)}
  return!(DEF[it.d].heavy&&maxY!==g.rows-1)}
function findSpot(g,it){const r0=it.rot||0;for(let r=0;r<4;r++){const t=Object.assign({},it,{rot:(r0+r)%4});for(let y=g.rows-1;y>=0;y--)for(let x=0;x<g.cols;x++)if(fits(g,t,x,y))return{x,y,rot:t.rot};if(!DEF[it.d].big)break}return null}

/* Pack evaluation. Order: masks copy -> arrow-turners act (reading order) -> seals, bows, blessings ->
   effect numbers are modified -> value = (base + bonuses) x multipliers */
function evalPack(g){
  const W=g.cols,H=g.rows,grid=new Array(W*H).fill(null);
  const S=g.items.map(it=>{const d=DEF[it.d],ge=geom(it),s={it,def:d,base:it.base,cells:ge.cells.map(c=>[c[0]+it.x,c[1]+it.y]),arrows:ge.arrows.map(a=>({x:a.x+it.x,y:a.y+it.y,dir:a.dir})),add:0,mul:1,adds:[],muls:[],pierce:false,bless:false,sil:false,turned:false,copy:null,N:d.n,notes:[],links:[],tg:[],val:0};for(const c of s.cells)grid[c[1]*W+c[0]]=s;return s});
  S.sort((a,b)=>(a.it.y-b.it.y)||(a.it.x-b.it.x));
  const at=(x,y)=>(x<0||y<0||x>=W||y>=H)?null:grid[y*W+x];
  const around=(s,diag)=>{const o=[];for(const[cx,cy]of s.cells)for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b||(!diag&&a&&b))continue;const t=at(cx+a,cy+b);if(t&&t!==s&&!o.includes(t))o.push(t)}return o};
  const adj=(s,a)=>{const t=at(a.x+DX[a.dir],a.y+DY[a.dir]);return t===s?null:t};
  let empty=0;for(const c of grid)if(!c)empty++;
  for(const s of S)if(s.def.k==='mask'){const t=adj(s,s.arrows[0]);if(t&&t.def.k!=='mask'){s.def=t.def;s.base=t.base;s.N=t.def.n;s.copy=t.def;if(!t.def.arrow)s.arrows=[]}}
  for(const s of S){const k=s.def.k;if(k!=='rot'&&k!=='align'&&k!=='attract')continue;for(const a of s.arrows){const t=adj(s,a);if(!t||!t.arrows.length)continue;
    for(const b of t.arrows)b.dir=k==='rot'?(b.dir+s.def.q)%4:k==='align'?a.dir:(a.dir+2)%4;t.turned=true;t.notes.push({i:s.def.icon,t:'↻'})}}
  for(const s of S)if(s.def.k==='silence'&&!s.sil)for(const a of s.arrows){const t=adj(s,a);if(t){t.sil=true;t.notes.push({i:s.def.icon,t:'🔇'})}}
  const hit=(s,a,depth)=>{let c=[];
    if(s.pierce||s.def.line){let x=a.x+DX[a.dir],y=a.y+DY[a.dir];while(x>=0&&y>=0&&x<W&&y<H){const t=at(x,y);if(t&&t!==s&&!c.includes(t))c.push(t);x+=DX[a.dir];y+=DY[a.dir]}}
    else{const t=adj(s,a);if(t)c.push(t)}
    const out=[];for(const t of c){if(t.def.k==='relay'&&!t.sil&&depth<6){for(const b of t.arrows)for(const u of hit(t,b,depth+1))if(u!==s&&!out.includes(u))out.push(u)}else if(!out.includes(t))out.push(t)}
    return out};
  const useArr=s=>s.def.arrow?s.arrows:[];
  for(const s of S)if(s.def.k==='pierce'&&!s.sil)for(const a of useArr(s))for(const t of hit(s,a,0))if(t.arrows.length)t.pierce=true;
  for(const s of S){s.links=useArr(s).map(a=>({a,t:hit(s,a,0)}));for(const l of s.links)for(const t of l.t)if(!s.tg.includes(t))s.tg.push(t)}
  for(const s of S)if(s.def.k==='bless'&&!s.sil)for(const t of s.tg){t.bless=true;t.notes.push({i:s.def.icon,t:'✚'})}
  // effect numbers: N = (n + sum of +mods) x product of xmods
  const vis=new Set(),memo=new Map();
  const num=s=>{if(s.def.n===undefined||!s.def.n&&s.def.k!=='rod')return s.def.n;if(memo.has(s))return memo.get(s);if(vis.has(s))return s.def.n;vis.add(s);let add=0,mul=1;const np={a:[],m:[]};
    for(const m of S){if(m===s||m.sil)continue;const k=m.def.k;if(k==='modadd'){const c=m.links.filter(l=>l.t.includes(s)).length;if(c){const v=num(m)*c;add+=v;np.a.push({i:m.def.icon,v})}}else if(k==='modmul'){const c=m.links.filter(l=>l.t.includes(s)).length;for(let i=0;i<c;i++){mul*=num(m);np.m.push({i:m.def.icon,v:num(m)})}}else if(k==='modaura'&&around(m,false).includes(s)){add+=num(m);np.a.push({i:m.def.icon,v:num(m)})}}
    vis.delete(s);const v=Math.max(-99,Math.min(99,Math.round((s.def.n+add)*mul*100)/100));memo.set(s,v);s.Np=np;return v};
  for(const s of S)if(s.def.n)s.N=num(s);
  const mulT=(t,m,s)=>{t.mul*=m;t.muls.push(m);t.notes.push({i:s.def.icon,t:'×'+fm(m)})},addT=(t,a,s,ex)=>{if(!a)return;t.add+=a;t.adds.push(ex?{v:a,ex}:a);t.notes.push({i:s.def.icon,t:(a>0?'+':'−')+fm(Math.abs(a))})};
  const has=(t,tag)=>t.def.tags.includes(tag),hitsOn=s=>{let n=0;for(const o of S)if(o!==s&&!o.sil)for(const l of o.links)if(l.t.includes(s))n++;return n};
  for(const s of S){if(s.sil)continue;const d=s.def;let N=s.N;
    switch(d.k){
      case'mul':if(N<1&&N>0&&s.bless)N=1/N;s.tg.forEach(t=>mulT(t,N,s));break;
      case'add':s.tg.forEach(t=>addT(t,N,s));break;
      case'tagmul':s.tg.forEach(t=>{if(has(t,d.tag))mulT(t,N,s)});break;
      case'fang':s.tg.forEach(t=>{if(!s.bless)mulT(t,0,s);addT(s,N*t.base,s,`(${t.base}×${fm(N)})`)});break;
      case'envy':s.tg.forEach(t=>addT(s,N*t.base,s,`(${t.base}×${fm(N)})`));break;
      case'sacrifice':if(s.tg.length){s.tg.forEach(t=>{if(!s.bless)mulT(t,0,s)});const rows=new Set(s.cells.map(c=>c[1]));S.forEach(o=>{if(o!==s&&o.cells.some(c=>rows.has(c[1]))&&(s.bless||!s.tg.includes(o)))mulT(o,N,s)})}break;
      case'aura4':around(s,false).forEach(t=>addT(t,N,s));break;
      case'aura8':if(N<0&&s.bless)N=-N;around(s,true).forEach(t=>addT(t,N,s));break;
      case'auramul':if(N<1&&N>0&&s.bless)N=1/N;around(s,false).forEach(t=>mulT(t,N,s));break;
      case'kseal':{const c=s.cells[0];if([0,1,2,3].every(q=>at(c[0]+DX[q],c[1]+DY[q])))around(s,false).forEach(t=>mulT(t,N,s));break}
      case'hermit':if(!around(s,false).length)mulT(s,N,s);break;
      case'twin':if(around(s,false).some(t=>t.def.id==='twin'))mulT(s,N,s);break;
      case'distinct':addT(s,N*new Set(S.map(o=>o.def.id)).size,s);break;
      case'pertag':addT(s,N*S.filter(o=>o!==s&&has(o,d.tag)).length,s);break;
      case'row':{const rows=new Set(s.cells.map(c=>c[1]));S.forEach(o=>{if(o!==s&&o.cells.some(c=>rows.has(c[1])))mulT(o,N,s)});break}
      case'col':{const cols=new Set(s.cells.map(c=>c[0]));S.forEach(o=>{if(o!==s&&o.cells.some(c=>cols.has(c[0])))mulT(o,N,s)});break}
      case'corner':if(s.cells.some(c=>(c[0]===0||c[0]===W-1)&&(c[1]===0||c[1]===H-1)))mulT(s,N,s);break;
      case'rod':{const n=hitsOn(s);if(n)mulT(s,1+n*N,s);break}
      case'quiver':addT(s,N*hitsOn(s),s);break;
      case'empty':addT(s,N*empty,s);break;
      case'adjtag':{const n=around(s,false).filter(t=>has(t,d.tag)).length;if(n)mulT(s,1+N*n,s);break}
      case'steam':{const o=around(s,false);if(o.some(t=>has(t,'fire'))&&o.some(t=>has(t,'ice')))mulT(s,N,s);break}
      case'full':if(!empty)mulT(s,N,s);break;
      case'scales':{const c=s.cells[0],a=at(c[0]-1,c[1]),b=at(c[0]+1,c[1]);if(a&&b&&a.base===b.base)mulT(s,N,s);break}
      case'global':S.forEach(o=>{if(o!==s)addT(o,N,s)});break;
    }}
  let total=0;for(const s of S){s.val=Math.max(0,Math.round((s.base+s.add)*s.mul));total+=s.val}
  return{S,grid,total,W,H};
}

function packInto(items){const g={cols:5,rows:4,items:[]};for(const it of items){const sp=findSpot(g,it);if(sp){Object.assign(it,sp);g.items.push(it)}}return g.items}
/* first free spot scanning top-left to bottom-right */
function firstSpot(g,it){const r0=it.rot||0,nr=DEF[it.d].big?4:1;for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++)for(let r=0;r<nr;r++){const t=Object.assign({},it,{rot:(r0+r)%4});if(fits(g,t,x,y))return{x,y,rot:t.rot}}return null}
if(typeof module!=='undefined')module.exports={ITEMS,DEF,SH,evalPack,geom,fits,findSpot,firstSpot,packInto,rollItem,mulberry,DX,DY};
