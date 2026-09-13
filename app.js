import {themes,readPreferences,selectGames,paginate,PAGE_SIZE,STORAGE_KEY} from './library.js';
const $=id=>document.getElementById(id);
let storage;
try{storage=window.localStorage;}catch{}
let prefs=readPreferences(storage),games=[],query='',favoritesOnly=false,currentGame=null,opener=null;
function save(){try{storage.setItem(STORAGE_KEY,JSON.stringify(prefs));}catch{$('storage-warning').hidden=false;}}
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function applyTheme(){
 const theme=themes.find(t=>t.id===prefs.theme)||themes[0],s=document.documentElement.style;
 const values={bg:theme.bg,surface:theme.surface,surface2:theme.light?'#e5e4e4':`color-mix(in srgb, ${theme.surface}, white 5%)`,line:theme.light?'#d3d2d2':`color-mix(in srgb, ${theme.surface}, white 12%)`,text:theme.light?'#19191e':'#f2f2f4',muted:theme.light?'#62626a':'#a0a0ac',accent:theme.accent,'on-accent':theme.light?'#fff':'#080808'};
 for(const [key,value] of Object.entries(values))s.setProperty('--'+key,value);
 s.colorScheme=theme.light?'light':'dark';document.querySelector('meta[name="theme-color"]').content=theme.bg;
 $('current-theme').textContent=theme.name;
 document.querySelectorAll('.theme-option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===theme.id)));
}
function renderThemes(){
 for(const theme of themes){
  const b=node('button','theme-option');b.dataset.theme=theme.id;b.setAttribute('aria-label',theme.name+' theme');b.setAttribute('aria-pressed','false');
  const preview=node('span','theme-preview');preview.setAttribute('aria-hidden','true');preview.style.setProperty('--theme-bg',theme.bg);preview.style.setProperty('--theme-panel',theme.surface);preview.style.setProperty('--theme-accent',theme.accent);
  for(let i=0;i<4;i++)preview.append(node('i'));
  const label=node('span','theme-option-label',theme.name);label.append(node('span','theme-check','✓'));b.append(preview,label);
  b.addEventListener('click',()=>{prefs.theme=theme.id;applyTheme();save();});$('theme-grid').append(b);
 }
}
function render(){
 const filtered=selectGames(games,query,favoritesOnly?prefs.favorites:null),result=paginate(filtered,prefs.page);
 prefs.page=result.page;
 const grid=$('games-grid');grid.replaceChildren();
 for(const game of result.items){
  const card=node('article','game-card'),open=node('button','game-open');open.setAttribute('aria-label','Play '+game.title);
  const wrap=node('div','cover-wrap'),img=node('img');img.src=game.image;img.alt='';img.loading='lazy';img.decoding='async';img.width=480;img.height=300;
  const overlay=node('div','play-overlay');overlay.setAttribute('aria-hidden','true');overlay.append(node('span','','▶'));wrap.append(img,overlay);
  const info=node('div','game-info');info.append(node('h3','',game.title),node('p','',game.category));open.append(wrap,info);open.addEventListener('click',()=>openGame(game,open));
  const favorite=node('button','favorite-button','♡');favorite.setAttribute('aria-label','Favorite '+game.title);favorite.setAttribute('aria-pressed',String(prefs.favorites.includes(game.id)));
  if(prefs.favorites.includes(game.id))favorite.textContent='♥';
  favorite.addEventListener('click',()=>{
   const selected=prefs.favorites.includes(game.id);prefs.favorites=selected?prefs.favorites.filter(id=>id!==game.id):[...prefs.favorites,game.id];save();
   if(favoritesOnly){render();$('favorite-filter').focus();}else{favorite.setAttribute('aria-pressed',String(!selected));favorite.textContent=selected?'♡':'♥';$('favorite-count').textContent=prefs.favorites.length;}
  });card.append(open,favorite);grid.append(card);
 }
 $('total-count').textContent=games.length;$('favorite-count').textContent=prefs.favorites.length;
 $('result-summary').textContent=result.total?`${(result.page-1)*PAGE_SIZE+1}–${Math.min(result.page*PAGE_SIZE,result.total)} of ${result.total} games`:'0 games';
 $('empty-state').hidden=result.total>0;$('empty-title').textContent=favoritesOnly&&!query?'Your favorites start here':'No games found';$('empty-copy').textContent=favoritesOnly&&!query?'Tap the heart on a game to keep it here.':'Try a different game name or category.';
 $('all-filter').classList.toggle('active',!favoritesOnly);$('favorite-filter').classList.toggle('active',favoritesOnly);$('all-filter').setAttribute('aria-pressed',String(!favoritesOnly));$('favorite-filter').setAttribute('aria-pressed',String(favoritesOnly));
 const pagination=$('pagination');pagination.replaceChildren();pagination.hidden=!result.total;
 function pageButton(label,page,disabled=false,active=false){
  const b=node('button','page-button'+(active?' active':'')+(typeof label==='string'?' page-arrow':''),label);b.disabled=disabled;b.setAttribute('aria-label',typeof label==='number'?'Page '+label:label==='←'?'Previous page':'Next page');if(active)b.setAttribute('aria-current','page');
  b.addEventListener('click',()=>{prefs.page=page;save();render();document.querySelector('.library-toolbar').scrollIntoView({block:'start'});$('pagination').querySelector('[aria-current="page"]')?.focus({preventScroll:true});});pagination.append(b);
 }
 pageButton('←',result.page-1,result.page===1);for(let i=1;i<=result.pages;i++)pageButton(i,i,false,i===result.page);pageButton('→',result.page+1,result.page===result.pages);
}
function view(name){const settings=name==='settings';$('library-view').hidden=settings;$('settings-view').hidden=!settings;
 for(const key of ['library','settings']){const active=(key==='settings')===settings;$(key+'-tab').classList.toggle('active',active);if(active)$(key+'-tab').setAttribute('aria-current','page');else $(key+'-tab').removeAttribute('aria-current');}
}
function mountGame(){
 $('frame-container').querySelector('iframe')?.remove();$('game-loading').hidden=false;
 const frame=document.createElement('iframe');frame.title=currentGame.title;frame.src=currentGame.src;
 frame.allow='autoplay; fullscreen; gamepad; clipboard-write';frame.allowFullscreen=true;
 frame.addEventListener('load',()=>{$('game-loading').hidden=true;});
 $('frame-container').append(frame);
}
function openGame(game,button){currentGame=game;opener=button;$('player-title').textContent=game.title;$('player-category').textContent=game.category;
 const poly=game.id==='polytrack';$('polytrack-credit').hidden=!poly;$('player-note').hidden=poly;mountGame();$('player-dialog').showModal();$('close-player').focus();}
async function closeGame(){if(document.fullscreenElement)await document.exitFullscreen().catch(()=>{});$('player-dialog').close();}
$('player-dialog').addEventListener('close',()=>{$('frame-container').querySelector('iframe')?.remove();currentGame=null;opener?.focus({preventScroll:true});});
$('close-player').addEventListener('click',closeGame);$('reload-player').addEventListener('click',()=>{if(currentGame)mountGame();});
$('fullscreen-player').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('player-shell').requestFullscreen();}catch{$('player-note').hidden=false;$('player-note').textContent='Fullscreen is unavailable in this browser. You can keep playing here.';}});
$('library-tab').addEventListener('click',()=>{location.hash='library';view('library');});$('settings-tab').addEventListener('click',()=>{location.hash='settings';view('settings');});window.addEventListener('hashchange',()=>view(location.hash.slice(1)));
$('search').addEventListener('input',e=>{query=e.target.value;prefs.page=1;render();});
$('all-filter').addEventListener('click',()=>{favoritesOnly=false;prefs.page=1;save();render();});$('favorite-filter').addEventListener('click',()=>{favoritesOnly=true;prefs.page=1;render();});
$('reset-filter').addEventListener('click',()=>{query='';$('search').value='';favoritesOnly=false;prefs.page=1;render();});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('player-dialog').open&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();view('library');$('search').focus();}});
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){prefs=readPreferences(storage);applyTheme();render();}});
renderThemes();applyTheme();view(location.hash.slice(1));
try{const response=await fetch('./games.json');if(!response.ok)throw Error('Catalog unavailable');games=await response.json();if(!Array.isArray(games)||games.length!==1000)throw Error('Incomplete catalog');prefs.favorites=prefs.favorites.filter(id=>games.some(g=>g.id===id));render();}
catch{$('result-summary').textContent='The library could not load. Please refresh to try again.';}
