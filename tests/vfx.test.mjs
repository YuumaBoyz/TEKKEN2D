import test from 'node:test';
import assert from 'node:assert/strict';
import {SpriteVFX,cleanVFXPixels} from '../dist/vfx.mjs';
import {Game} from '../dist/engine.mjs';
class FakeImage{complete=true;naturalWidth=1024;naturalHeight=1024;}
const make=()=>new SpriteVFX({ImageClass:FakeImage,limit:3});
test('VFX preserves detached shards while removing noise and alpha fringe',()=>{
 const w=12,h=12,rgba=new Uint8ClampedArray(w*h*4);
 const set=(x,y,a=255)=>{rgba[(y*w+x)*4]=200;rgba[(y*w+x)*4+3]=a;};
 [[2,2],[2,3],[3,2],[8,8],[8,9],[9,8]].forEach(([x,y])=>set(x,y));set(0,0);set(6,1,90);
 const bottom=cleanVFXPixels(rgba,w,h);
 assert.equal(rgba[(8*w+8)*4+3],255);assert.equal(rgba[(2*w+2)*4+3],255);
 assert.equal(rgba[3],0);assert.equal(rgba[(1*w+6)*4+3],0);assert.equal(bottom,10/12);
});
test('effects freeze on pause, expire after four frames, and reject invalid events',()=>{
 const vfx=make();assert.equal(vfx.spawn('hit',20,30),true);assert.equal(vfx.spawn('unknown',0,0),false);assert.equal(vfx.spawn('hit',NaN,0),false);
 vfx.update(.05,true);assert.equal(vfx.effects[0].age,0);
 for(let i=0;i<4;i++)vfx.update(.05);assert.equal(vfx.effects.length,0);
 for(let i=0;i<9;i++)vfx.spawn('heavy',i,10);assert.equal(vfx.effects.length,3);assert.equal(vfx.effects[0].x,6);vfx.clear();assert.equal(vfx.effects.length,0);
});
test('frame selection, orientation and ground anchoring use the actual prepared frame',()=>{
 const vfx=make(),calls=[],dust={canvas:{width:64,height:64},baseline:.75};
 vfx.frames.contact=Array.from({length:16},()=>dust);
 const ctx={save(){},restore(){},translate(...a){calls.push(['translate',...a]);},scale(...a){calls.push(['scale',...a]);},drawImage(...a){calls.push(['draw',...a]);}};
 vfx.spawn('dust',200,448,{face:-1,layer:'back'});vfx.update(.05);vfx.draw(ctx,'front');assert.equal(calls.length,0);
 vfx.draw(ctx,'back');assert.deepEqual(calls[0],['translate',200,448]);assert.deepEqual(calls[1],['scale',-1,1]);
 const draw=calls[2];assert.equal(draw[1],dust.canvas);assert.equal(draw[3]+draw[5]*.75,0);
});
test('attack VFX trigger once in the active window even when a strike misses',()=>{
 const events=[],game=new Game({mode:'versus',onEvent:e=>events.push(e)});
 for(let i=0;i<125;i++)game.update(1/60,[{},{}]);
 game.fighters[0].x=250;game.fighters[1].x=700;game.action(0,'kick');
 for(let i=0;i<6;i++)game.update(1/60,[{},{}]);assert.equal(events.filter(e=>e.type==='swing').length,0);
 for(let i=0;i<60;i++)game.update(1/60,[{},{}]);
 const swings=events.filter(e=>e.type==='swing');assert.equal(swings.length,1);assert.equal(swings[0].move,'kick');assert.equal(events.filter(e=>e.type==='hit').length,0);
});
test('contact VFX carry the authoritative move and facing without duplicate damage',()=>{
 const events=[],game=new Game({mode:'versus',onEvent:e=>events.push(e)});
 for(let i=0;i<125;i++)game.update(1/60,[{},{}]);game.fighters[0].x=400;game.fighters[1].x=500;game.action(0,'jab');
 for(let i=0;i<40;i++)game.update(1/60,[{},{}]);
 const hits=events.filter(e=>e.type==='hit');assert.equal(hits.length,1);assert.equal(hits[0].move,'jab');assert.equal(hits[0].attackMove,'jab');assert.equal(hits[0].face,1);assert.equal(events.filter(e=>e.type==='swing').length,1);
});
test('Heat Smash keeps the combo-trial action while carrying its distinct VFX move',()=>{
 const events=[],game=new Game({mode:'versus',onEvent:e=>events.push(e)});
 for(let i=0;i<125;i++)game.update(1/60,[{},{}]);game.fighters[0].x=400;game.fighters[1].x=500;
 game.activateHeat(0,10);game.action(0,'heat');for(let i=0;i<55;i++)game.update(1/60,[{},{}]);
 const hit=events.find(e=>e.type==='hit');assert.equal(hit.move,'heat');assert.equal(hit.attackMove,'smash');
 game.action(0,'dashBack');const dash=events.find(e=>e.type==='dash');assert.equal(dash.direction,-1);assert.ok(Number.isFinite(dash.x));
});
