const $=id=>document.getElementById(id);
const id=new URLSearchParams(location.search).get('game');
try{
 const response=await fetch('./games.json');const games=await response.json();const game=games.find(item=>item.id===id);
 if(!game)throw Error('Game not found');
 document.title=`${game.title} | Isaiah's MLV`;$('player-title').textContent=game.title;$('player-category').textContent=game.category;
 const frame=document.createElement('iframe');frame.title=game.title;frame.src=game.src;frame.allow='autoplay; fullscreen; gamepad; clipboard-write';frame.allowFullscreen=true;frame.addEventListener('load',()=>{$('game-loading').hidden=true;});$('frame-container').append(frame);
 const container=$('frame-container');
 function repaintFrame(){frame.style.display='none';void frame.offsetHeight;requestAnimationFrame(()=>{frame.style.display='block';frame.contentWindow?.postMessage({type:'resize'},'*');});}
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)requestAnimationFrame(repaintFrame);});
 $('fullscreen-player').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else container.requestFullscreen().catch(()=>{});});
}catch{$('player-title').textContent='Game unavailable';$('game-loading').textContent='Return to the library and choose another game.';}
