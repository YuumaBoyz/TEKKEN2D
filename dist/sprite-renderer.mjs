// Isolate each generated silhouette in memory. This prevents adjacent poses from
// leaking into a source rectangle without modifying the original PNG files.
export function prepareFrames(image,data){
 return data.frames.map(f=>{
  const canvas=document.createElement('canvas');canvas.width=f.w;canvas.height=f.h;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,f.x,f.y,f.w,f.h,0,0,f.w,f.h);
  const pixels=context.getImageData(0,0,f.w,f.h),rgba=pixels.data,w=f.w,h=f.h,n=w*h;
  const seen=new Uint8Array(n),queue=new Int32Array(n);let best=new Int32Array(0);
  for(let seed=0;seed<n;seed++){
   if(seen[seed]||rgba[seed*4+3]<=96)continue;
   let head=0,tail=1;queue[0]=seed;seen[seed]=1;
   while(head<tail){
    const p=queue[head++],x=p%w,y=Math.floor(p/w);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;
     const q=ny*w+nx;if(!seen[q]&&rgba[q*4+3]>96){seen[q]=1;queue[tail++]=q;}
    }
   }
   if(tail>best.length)best=queue.slice(0,tail);
  }
  const keep=new Uint8Array(n);
  for(const p of best){const x=p%w,y=Math.floor(p/w);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<w&&ny<h)keep[ny*w+nx]=1;}}
  for(let p=0;p<n;p++)if(!keep[p])rgba[p*4+3]=0;
  context.putImageData(pixels,0,0);return canvas;
 });
}
