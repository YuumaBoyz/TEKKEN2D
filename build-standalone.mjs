import fs from 'node:fs/promises';
const read=p=>fs.readFile(p,'utf8');
const engine=(await read('dist/engine.mjs')).replace(/^export /gm,'');
let app=(await read('dist/app.js')).replace(/^import .*;\n/gm,'');
let spriteData=(await read('dist/sprite-data.mjs')).replace(/^export /gm,'');
const renderer=(await read('dist/sprite-renderer.mjs')).replace(/^export /gm,'');
const net=(await read('dist/online.mjs')).replace(/^export /gm,'');
const modes=(await read('dist/modes.mjs')).replace(/^export /gm,'');
let vfxData=(await read('dist/vfx-data.mjs')).replace(/^export /gm,'');
const vfxCode=(await read('dist/vfx.mjs')).replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
const {VFX_ATLASES}=await import('./dist/vfx-data.mjs');
const {SPRITES,LOW_SPRITES}=await import('./dist/sprite-data.mjs');
for(const file of ['assets/shrine.png',...[...SPRITES,...LOW_SPRITES].map(s=>s.file),...Object.values(VFX_ATLASES).map(s=>s.file)]){
 const uri='data:image/png;base64,'+(await fs.readFile('dist/'+file)).toString('base64');
 app=app.replace(file,uri);spriteData=spriteData.replace(file,uri);vfxData=vfxData.replace(file,uri);
}
const js='const {Game,FIGHTERS,MOVES,SPECIALS}=(()=>{\n'+engine+'\nreturn {Game,FIGHTERS,MOVES,SPECIALS};})();\n'+spriteData+'\n'+renderer+'\n'+net+'\n'+vfxData+'\n'+vfxCode+'\n'+app;
let html=await read('dist/index.html');
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+await read('dist/style.css')+'</style>');
html=html.replace('<script type="module" src="app.js"></script>','<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
html=html.replace('<script src="vendor/peerjs.min.js"></script>','<script>'+await read('dist/vendor/peerjs.min.js')+'</script>');
await fs.writeFile('TEKKEN-2D.html',html);
await fs.writeFile('dist/TEKKEN-2D.html',html);
console.log('Version autonome prête : TEKKEN-2D.html');
