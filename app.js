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
  const wrap=node('div','cover-wrap'),img=node('img');img.src=game.image;img.alt='';img.loading='lazy';img.decoding='async';img.width=480;img.height=300;img.addEventListener('error',()=>{img.src=`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="100%" height="100%" fill="#151515"/><text x="50%" y="50%" fill="#f2f2f4" font-family="Arial,sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">${game.title.replace(/[<>&]/g,'')}</text></svg>`)}`;},{once:true});
  const overlay=node('div','play-overlay');overlay.setAttribute('aria-hidden','true');overlay.append(node('span','','▶'));wrap.append(img,overlay);
  const info=node('div','game-info');info.append(node('h3','',game.title),node('p','',game.category));open.append(wrap,info);open.addEventListener('click',()=>openGame(game,open));
  const favorite=node('button','favorite-button','☆');favorite.setAttribute('aria-label','Favorite '+game.title);favorite.setAttribute('aria-pressed',String(prefs.favorites.includes(game.id)));
  if(prefs.favorites.includes(game.id))favorite.textContent='★';
  favorite.addEventListener('click',()=>{
   const selected=prefs.favorites.includes(game.id);prefs.favorites=selected?prefs.favorites.filter(id=>id!==game.id):[...prefs.favorites,game.id];save();
   if(favoritesOnly){render();$('favorite-filter').focus();}else{favorite.setAttribute('aria-pressed',String(!selected));favorite.textContent=selected?'☆':'★';$('favorite-count').textContent=prefs.favorites.length;}
  });card.append(open,favorite);grid.append(card);
 }
 $('total-count').textContent=games.length;$('favorite-count').textContent=prefs.favorites.length;const footerCount=document.querySelector('.site-footer>span:nth-child(2)');if(footerCount)footerCount.textContent=`${games.length} GAMES / ${result.pages} PAGE${result.pages===1?'':'S'}`;
 $('result-summary').textContent=result.total?`${(result.page-1)*PAGE_SIZE+1}–${Math.min(result.page*PAGE_SIZE,result.total)} of ${result.total} games`:'0 games';
 $('empty-state').hidden=result.total>0;$('empty-title').textContent=favoritesOnly&&!query?'Your favorites start here':'No games found';$('empty-copy').textContent=favoritesOnly&&!query?'Tap the star on a game to keep it here.':'Try a different game name or category.';
 $('all-filter').classList.toggle('active',!favoritesOnly);$('favorite-filter').classList.toggle('active',favoritesOnly);$('all-filter').setAttribute('aria-pressed',String(!favoritesOnly));$('favorite-filter').setAttribute('aria-pressed',String(favoritesOnly));
 const pagination=$('pagination');pagination.replaceChildren();pagination.hidden=!result.total;
 function pageButton(label,page,disabled=false,active=false){
  const b=node('button','page-button'+(active?' active':'')+(typeof label==='string'?' page-arrow':''),label);b.disabled=disabled;b.setAttribute('aria-label',typeof label==='number'?'Page '+label:label==='←'?'Previous page':'Next page');if(active)b.setAttribute('aria-current','page');
  b.addEventListener('click',()=>{prefs.page=page;save();render();document.querySelector('.library-toolbar').scrollIntoView({block:'start'});$('pagination').querySelector('[aria-current="page"]')?.focus({preventScroll:true});});pagination.append(b);
 }
 pageButton('←',result.page-1,result.page===1);
 const pageNumbers=[...new Set([1,result.page-1,result.page,result.page+1,result.pages].filter(page=>page>=1&&page<=result.pages))].sort((a,b)=>a-b);
 let previous=0;
 for(const page of pageNumbers){if(page-previous>1)pagination.append(node('span','page-gap','…'));pageButton(page,page,false,page===result.page);previous=page;}
 pageButton('→',result.page+1,result.page===result.pages);
}
function view(name){const active=['library','ai','settings'].includes(name)?name:'library';$('library-view').hidden=active!=='library';$('ai-view').hidden=active!=='ai';$('settings-view').hidden=active!=='settings';
 for(const key of ['library','ai','settings']){const selected=key===active;$(key+'-tab').classList.toggle('active',selected);if(selected)$(key+'-tab').setAttribute('aria-current','page');else $(key+'-tab').removeAttribute('aria-current');}
}
function mountGame(){
 $('frame-container').querySelector('iframe')?.remove();$('game-loading').hidden=false;
 const frame=document.createElement('iframe');frame.title=currentGame.title;frame.src=currentGame.src;
 frame.allow='autoplay; fullscreen; gamepad; clipboard-write';frame.allowFullscreen=true;
 frame.addEventListener('load',()=>{$('game-loading').hidden=true;});
 $('frame-container').append(frame);
}
function openGame(game){window.open(`./play.html?game=${encodeURIComponent(game.id)}`,'_blank','noopener');}
async function closeGame(){if(document.fullscreenElement)await document.exitFullscreen().catch(()=>{});$('player-dialog').close();}
$('player-dialog').addEventListener('close',()=>{$('frame-container').querySelector('iframe')?.remove();currentGame=null;opener?.focus({preventScroll:true});});
$('close-player').addEventListener('click',closeGame);$('reload-player').addEventListener('click',()=>{if(currentGame)mountGame();});
$('fullscreen-player').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('player-shell').requestFullscreen();}catch{$('player-note').hidden=false;$('player-note').textContent='Fullscreen is unavailable in this browser. You can keep playing here.';}});
$('library-tab').addEventListener('click',()=>{location.hash='library';view('library');});$('ai-tab').addEventListener('click',()=>{location.hash='ai';view('ai');});$('settings-tab').addEventListener('click',()=>{location.hash='settings';view('settings');});window.addEventListener('hashchange',()=>view(location.hash.slice(1)));
$('search').addEventListener('input',e=>{query=e.target.value;prefs.page=1;render();});
$('all-filter').addEventListener('click',()=>{favoritesOnly=false;prefs.page=1;save();render();});$('favorite-filter').addEventListener('click',()=>{favoritesOnly=true;prefs.page=1;render();});
$('reset-filter').addEventListener('click',()=>{query='';$('search').value='';favoritesOnly=false;prefs.page=1;render();});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('player-dialog').open&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();view('library');$('search').focus();}});
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){prefs=readPreferences(storage);applyTheme();render();}});
const AI_KEY='isaiahs-mlv:ai:v1';let aiData={chats:[],folders:[],active:null};
try{aiData=Object.assign(aiData,JSON.parse(storage?.getItem(AI_KEY)||'{}'));}catch{}
function saveAI(){try{storage?.setItem(AI_KEY,JSON.stringify(aiData));}catch{}}
function renderAI(){const list=$('chat-list');list.replaceChildren();for(const chat of aiData.chats){const row=node('button','chat-item'+(chat.id===aiData.active?' active':''),chat.title);row.addEventListener('click',()=>{aiData.active=chat.id;saveAI();renderAI();});list.append(row);}const active=aiData.chats.find(chat=>chat.id===aiData.active);$('ai-heading').textContent=active?.title||'New chat';const messages=$('ai-messages');messages.replaceChildren();if(!active){messages.append(node('p','ai-empty','Start a chat to save your messages here.'));return;}for(const message of active.messages||[])messages.append(node('p','ai-message '+message.role,message.text));}
function createChat(folder=''){const chat={id:crypto.randomUUID(),title:'New chat',folder,messages:[]};aiData.chats.unshift(chat);aiData.active=chat.id;saveAI();renderAI();}
$('new-chat').addEventListener('click',()=>createChat());$('new-folder').addEventListener('click',()=>{const name=prompt('Folder name');if(name){aiData.folders.push(name.trim());saveAI();}});$('delete-chat').addEventListener('click',()=>{if(!aiData.active)return;aiData.chats=aiData.chats.filter(chat=>chat.id!==aiData.active);aiData.active=aiData.chats[0]?.id||null;saveAI();renderAI();});$('ai-form').addEventListener('submit',event=>{event.preventDefault();const text=$('ai-input').value.trim();if(!text)return;if(!aiData.active)createChat();const chat=aiData.chats.find(item=>item.id===aiData.active);chat.messages.push({role:'user',text});if(chat.title==='New chat')chat.title=text.slice(0,36);$('ai-input').value='';saveAI();renderAI();});
renderThemes();applyTheme();renderAI();view(location.hash.slice(1));
try{const response=await fetch('./games.json');if(!response.ok)throw Error('Catalog unavailable');games=await response.json();if(!Array.isArray(games)||games.length===0)throw Error('Incomplete catalog');prefs.favorites=prefs.favorites.filter(id=>games.some(g=>g.id===id));render();}
catch{$('result-summary').textContent='The library could not load. Please refresh to try again.';}
