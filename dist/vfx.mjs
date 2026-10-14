import {VFX_ATLASES,VFX_TYPES,fighterEnergy} from './vfx-data.mjs';

export class SpriteVFX{
 constructor({ImageClass=globalThis.Image,limit=48}={}){
  this.limit=limit;this.effects=[];this.images={};this.failed=[];
  for(const [key,atlas] of Object.entries(VFX_ATLASES)){
   const im=new ImageClass();this.images[key]=im;
   im.onerror=()=>this.failed.push(key);im.src=atlas.file;
  }
 }
 spawn(type,x,y,{face=1,scale=1,alpha=1,layer='front',follow=null,offsetX=0,offsetY=0}={}){
  if(!VFX_TYPES[type]||!Number.isFinite(x)||!Number.isFinite(y))return false;
  this.effects.push({type,x,y,face:face<0?-1:1,scale:Math.min(2,Math.max(.25,scale)),alpha:Math.min(1,Math.max(0,alpha)),layer,follow,offsetX,offsetY,age:0});
  if(this.effects.length>this.limit)this.effects.splice(0,this.effects.length-this.limit);return true;
 }
 update(dt,paused=false){
  if(paused)return;const step=Math.max(0,Math.min(.05,dt));
  for(const e of this.effects)e.age+=step;
  this.effects=this.effects.filter(e=>e.age<VFX_TYPES[e.type].frameTime*4);
 }
 clear(){this.effects.length=0;}
 draw(ctx,layer='front',fighters=[]){
  ctx.save();ctx.imageSmoothingEnabled=false;
  for(const e of this.effects){
   if(e.layer!==layer)continue;
   const type=VFX_TYPES[e.type],atlas=VFX_ATLASES[type.atlas],im=this.images[type.atlas];
   if(!im?.complete||!im.naturalWidth)continue;
   const frame=Math.min(3,Math.floor(e.age/type.frameTime));
   const sw=im.naturalWidth/atlas.columns,sh=im.naturalHeight/atlas.rows;
   const fighter=e.follow===null?null:fighters[e.follow];
   const x=fighter?fighter.x+e.offsetX*e.face:e.x,y=fighter?455-fighter.y+e.offsetY:e.y;
   const size=Math.round(type.size*e.scale/2)*2;
   ctx.save();ctx.globalAlpha=e.alpha;ctx.translate(Math.round(x),Math.round(y));ctx.scale(e.face,1);
   // Source PNGs keep their original alpha. Never use a screen blend to hide a background.
   ctx.drawImage(im,frame*sw,type.row*sh,sw,sh,-size/2,-size/2,size,size);ctx.restore();
  }
  ctx.restore();
 }
 aura(ctx,fighter,index,elapsed){
  if(fighter.hp<=0)return;
  const heat=fighter.heatTimer>0,rage=fighter.hp<=25&&!fighter.rageUsed;
  if(!heat&&!rage)return;
  const key=heat?fighterEnergy(fighter.id):'rage',type=VFX_TYPES[key],im=this.images[type.atlas];
  if(!im?.complete||!im.naturalWidth)return;
  const frame=Math.floor(elapsed*(heat?9:6)+index)%4,sw=im.naturalWidth/4,sh=im.naturalHeight/4;
  const size=heat?230:210;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=heat?.22:.18;
  ctx.translate(Math.round(fighter.x),Math.round(350-fighter.y));ctx.scale(fighter.face,1);
  ctx.drawImage(im,frame*sw,type.row*sh,sw,sh,-size/2,-size/2,size,size);ctx.restore();
 }
 getState(){return {active:this.effects.length,loaded:Object.values(this.images).filter(im=>im.complete&&im.naturalWidth).length,failed:[...this.failed]};}
}
