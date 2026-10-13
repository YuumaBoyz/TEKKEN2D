import fs from 'node:fs/promises';
const read=p=>fs.readFile(p,'utf8');
const engine=(await read('dist/engine.mjs')).replace(/^export /gm,'');
let app=(await read('dist/app.js')).replace(/^import .*;\n/,'');
for(const [asset,file] of [['fighters','fighters.png'],['shrine','shrine.png']]){
 const data=(await fs.readFile('dist/assets/'+file)).toString('base64');
 app=app.replace('assets/'+file,'data:image/png;base64,'+data);
}
const js='const {Game,FIGHTERS,MOVES}=(()=>{\n'+engine+'\nreturn {Game,FIGHTERS,MOVES};})();\n'+app;
let html=await read('dist/index.html');
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+await read('dist/style.css')+'</style>');
html=html.replace('<script type="module" src="app.js"></script>','<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
await fs.writeFile('TEKKEN-2D.html',html);
console.log('Version autonome prête : TEKKEN-2D.html');
