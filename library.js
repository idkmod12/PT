export const PAGE_SIZE = 20;
export const STORAGE_KEY = 'isaiahs-mlv:preferences:v1';
const palettes = [
 ['Default dark','#000000','#0c0c0e','#ff4949'],['Midnight','#060a19','#0e152a','#829bff'],
 ['Violet','#10091a','#1b112b','#ba91ff'],['Emerald','#040e0b','#0b1c15','#53dda4'],
 ['Crimson','#140607','#240d10','#ff6671'],['Amber','#120d05','#221b0d','#ffbd59'],
 ['Ocean','#041018','#0a1f2c','#55caff'],['Graphite','#101112','#1b1d20','#c1c6d0'],
 ['Rose','#170a12','#281321','#ff8ac5'],['Arctic','#081216','#12242c','#a0e1f5'],
 ['Lime','#0c1004','#19200c','#b1e75a'],['Copper','#150c08','#291b12','#eeb07b'],
 ['Indigo','#0b091c','#181333','#a096ff'],['Teal','#041211','#0b2421','#66ded0'],
 ['Plum','#140b18','#25142c','#d49de8'],['Coffee','#120e0b','#231c17','#d5b195'],
 ['Slate','#0b1018','#17212e','#9cb8dd'],['Forest','#080f08','#132014','#91c789'],
 ['Cherry','#16070d','#2a101c','#ff709b'],['Gold','#111005','#221e0c','#e7d26a'],
 ['Neon','#080808','#151515','#b9ff48'],['Sakura','#180d15','#291923','#eaaacb'],
 ['Ice','#091519','#142a30','#92e9e8'],['Light','#f5f6f8','#ffffff','#b92732',true],
 ['Paper','#f0ece6','#faf8f4','#7d4421',true],['Obsidian','#050505','#111111','#f07818'],['Cyber Blue','#03070f','#0b1728','#36a9ff'],
 ['Porcelain','#f7f7f5','#ffffff','#2f5d8c',true],['Lavender','#f4f0ff','#ffffff','#6d4cc4',true],['Mint','#effbf5','#ffffff','#258663',true],
 ['Sunrise','#fff5ec','#ffffff','#e16432',true],['Sky','#eef8ff','#ffffff','#287fc2',true],['Lemon','#fffde8','#ffffff','#9b7b00',true],
 ['Peach','#fff2ed','#ffffff','#ca5c3c',true],['Blush','#fff0f4','#ffffff','#bd4f73',true],['Cloud','#f1f5f9','#ffffff','#466581',true],
 ['Sand','#fbf7ed','#ffffff','#9a713d',true],['Lilac','#f7f2ff','#ffffff','#8457b9',true],['Seafoam','#ecfbf8','#ffffff','#1d8b7e',true],
 ['Rosewater','#fff2f0','#ffffff','#bd5951',true],['Glacier','#edf8fb','#ffffff','#2a839d',true],['Pistachio','#f4faec','#ffffff','#628b2c',true],
 ['Butter','#fff9df','#ffffff','#a87900',true],['Coral','#fff0eb','#ffffff','#d55438',true],['Denim','#eff4ff','#ffffff','#3d69b8',true],
 ['Orchid','#fdf0ff','#ffffff','#a54ab1',true],['Ivory','#fffdf7','#ffffff','#8a653d',true],['Aqua','#eafdff','#ffffff','#168ea3',true],
 ['Silver','#f4f5f6','#ffffff','#5c6976',true],['Spring','#f0fff4','#ffffff','#38884d',true],['Cherry Blossom','#fff0f6','#ffffff','#c14578',true],
 ['Citrus','#fffbea','#ffffff','#a87c00',true]
];
export const themes=palettes.map(([name,bg,surface,accent,light=false],index)=>({id:index===0?'default-dark':name.toLowerCase(),name,bg,surface,accent,light}));
export function readPreferences(storage) {
 try {
  const data=JSON.parse(storage.getItem(STORAGE_KEY)||'{}');
  return {theme:themes.some(t=>t.id===data?.theme)?data.theme:'default-dark',page:Number.isInteger(data?.page)&&data.page>=1&&data.page<=125?data.page:1,favorites:Array.isArray(data?.favorites)?[...new Set(data.favorites.filter(x=>typeof x==='string'))].slice(0,2500):[]};
 } catch {return {theme:'default-dark',page:1,favorites:[]};}
}
export function selectGames(games,query='',favorites=null) {
 const normalize=s=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
 const q=normalize(query);
 return games.filter(g=>(!favorites||favorites.includes(g.id))&&normalize(g.title+' '+g.category).includes(q));
}
export function paginate(games,page) {
 const pages=Math.max(1,Math.ceil(games.length/PAGE_SIZE));
 const current=Math.max(1,Math.min(pages,page));
 return {items:games.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE),page:current,pages,total:games.length};
}
