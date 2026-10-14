import {VFX_ATLASES,VFX_TYPES,fighterEnergy} from './vfx-data.mjs';

// Build small, isolated game frames once at load time. Keep intentional detached
// shards; only discard sub-pixel alpha fringe and isolated one/two-pixel noise.
export function cleanVFXPixels(rgba,w,h){
 const n=w*h,seen=new Uint8Array(n),keep=new Uint8Array(n),queue=new Int32Array(n);let bottom=0;
 for(let seed=0;seed<n;seed++){
  if(seen[seed]||rgba[seed*4+3]<160)continue;
  let head=0,tail=1;queue[0]=seed;seen[seed]=1;
  while(head<tail){
   const p=queue[head++],x=p%w,y=Math.floor(p/w);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;
    const q=ny*w+nx;if(!seen[q]&&rgba[q*4+3]>=160){seen[q]=1;queue[tail++]=q;}
   }
  }
  if(tail>=3)for(let j=0;j<tail;j++){keep[queue[j]]=1;bottom=Math.max(bottom,Math.floor(queue[j]/w)+1);}
 }
 for(let p=0;p<n;p++)rgba[p*4+3]=keep[p]?255:0;
 return bottom/h;
}
function prepareVFXFrames(image,atlas){
 const sw=image.naturalWidth/atlas.columns;
 return Array.from({length:atlas.rows*atlas.columns},(_,i)=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
  // Generated row spacing is not perfectly uniform. Measured empty bands keep
  // the neighboring row out; fit proportionally without stretching the effect.
  const row=Math.floor(i/atlas.columns),band=atlas.bands[row],ratio=image.naturalHeight/1254;
  const sy=band[0]*ratio,sh=(band[1]-band[0])*ratio,fit=64/Math.max(sw,sh),dw=sw*fit,dh=sh*fit;
  ctx.drawImage(image,(i%atlas.columns)*sw,sy,sw,sh,(64-dw)/2,(64-dh)/2,dw,dh);
  const pixels=ctx.getImageData(0,0,64,64),baseline=cleanVFXPixels(pixels.data,64,64);
  ctx.putImageData(pixels,0,0);return {canvas,baseline};
 });
}
export class SpriteVFX{
 constructor({ImageClass=globalThis.Image,limit=48}={}){
  this.limit=limit;this.effects=[];this.images={};this.frames={};this.failed=[];
  for(const [key,atlas] of Object.entries(VFX_ATLASES)){
   const im=new ImageClass();this.images[key]=im;
   im.onload=()=>{try{this.frames[key]=prepareVFXFrames(im,atlas);}catch{this.failed.push(key);}};
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
   const prepared=this.frames[type.atlas]?.[type.row*atlas.columns+frame];
   ctx.save();ctx.globalAlpha=e.alpha;ctx.translate(Math.round(x),Math.round(y));ctx.scale(e.face,1);
   const top=type.ground?-size*(prepared?.baseline||.9):-size/2;
   if(prepared)ctx.drawImage(prepared.canvas,-size/2,top,size,size);
   else ctx.drawImage(im,frame*sw,type.row*sh,sw,sh,-size/2,top,size,size);
   ctx.restore();
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
  const prepared=this.frames[type.atlas]?.[type.row*4+frame];
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=heat?.22:.18;
  ctx.translate(Math.round(fighter.x),Math.round(350-fighter.y));ctx.scale(fighter.face,1);
  if(prepared)ctx.drawImage(prepared.canvas,-size/2,-size/2,size,size);
  else ctx.drawImage(im,frame*sw,type.row*sh,sw,sh,-size/2,-size/2,size,size);
  ctx.restore();
 }
 getState(){return {active:this.effects.length,loaded:Object.keys(this.frames).length,failed:[...this.failed]};}
}
