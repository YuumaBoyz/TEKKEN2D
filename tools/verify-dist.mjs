import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const root=path.resolve('dist');
let checked=0;
async function requireFile(reference,source){
 if(/^(?:https?:|data:|#)/.test(reference))return;
 const target=path.resolve(path.dirname(source),reference.split(/[?#]/)[0]);
 if(!target.startsWith(root+path.sep))throw new Error(`Référence hors dist : ${reference}`);
 const stat=await fs.stat(target).catch(()=>null);
 if(!stat?.isFile()||!stat.size)throw new Error(`Fichier absent ou vide : ${reference} (${path.relative(root,source)})`);
 checked++;
}
for(const entry of await fs.readdir(root)){
 const source=path.join(root,entry);
 if(!/\.(?:html|m?js)$/.test(entry))continue;
 const text=await fs.readFile(source,'utf8');
 if(/\.m?js$/.test(entry)){
  const result=spawnSync(process.execPath,['--check',source],{encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr||`JavaScript invalide : ${entry}`);
  for(const match of text.matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g))await requireFile(match[1],source);
  for(const match of text.matchAll(/['"](assets\/[^'"]+\.(?:png|json))['"]/g))await requireFile(match[1],source);
 }else{
  for(const match of text.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)=["']([^"']+)["']/g))await requireFile(match[1],source);
  if(entry==='TEKKEN-2D.html'){
   for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
    if(/\bsrc=/.test(match[1]))throw new Error('Le jeu autonome dépend encore d’un script externe.');
    new vm.Script(match[2],{filename:entry});
   }
  }
 }
}
for(const entry of ['index.html','TEKKEN-2D.html','sprite-audit.html','vfx-audit.html'])await requireFile('./'+entry,path.join(root,'index.html'));
console.log(`Publication vérifiée : ${checked} références locales, modules valides et jeu autonome prêt.`);
