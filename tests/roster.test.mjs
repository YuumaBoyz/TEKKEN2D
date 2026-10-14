import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game,FIGHTERS,MOVES,moveFor,SPECIALS} from '../dist/engine.mjs';
import {SPRITES,LOW_SPRITES} from '../dist/sprite-data.mjs';
import {animationPose} from '../dist/sprite-renderer.mjs';
const step=(g,n=1,input=[{},{}])=>{for(let i=0;i<n;i++)g.update(1/60,input);};
const ready=(p1,p2=0)=>{const g=new Game({p1,p2,mode:'versus'});step(g,121);g.fighters[0].x=400;g.fighters[1].x=500;return g;};

test('all nine fighters have valid PNG crops and every combat animation resolves to an asset',()=>{
 assert.equal(FIGHTERS.length,9);assert.equal(SPRITES.length,9);assert.equal(SPECIALS.length,9);
 for(const [id,data] of SPRITES.entries()){
  const png=fs.readFileSync(new URL('../dist/'+data.file,import.meta.url)),width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  assert.equal(data.frames.length,id<4?16:25);
  for(const f of data.frames){assert.ok(f.x>=0&&f.y>=0&&f.w>0&&f.h>0&&f.x+f.w<=width&&f.y+f.h<=height);}
  const hasPose=pose=>assert.ok(pose===16&&LOW_SPRITES[id]||data.frames[pose],`${id}: missing ${pose}`);
  for(const kind of Object.keys(MOVES)){
   const f={...ready(id).fighters[0],move:kind},m=moveFor(f);
   for(const t of [0,m.startup+.01,m.startup+m.active+.04]){f.moveTime=t;hasPose(animationPose(f,{move:m}));}
  }
  for(const state of [{state:'walk'},{state:'hit'},{block:true},{crouch:true,block:true},{y:20},{dashTime:.1},{landTime:.1},{hp:0}])hasPose(animationPose({...ready(id).fighters[0],...state}));
 }
});
test('Noé charges evasions, spends charge on a faster kick, and rebounds from walls',()=>{
 const g=ready(4),f=g.fighters[0];g.action(0,'dashBack');step(g,27);g.action(0,'dashBack');step(g,27);assert.equal(f.charge,50);
 assert.equal(g.action(0,'kick'),true);assert.equal(f.charge,0);assert.equal(moveFor(f).startup,.10);assert.equal(moveFor(f).damage,17);
 step(g,40);f.x=150;assert.equal(g.action(0,'jump'),true);step(g,6);assert.ok(f.x>150&&f.y>0);assert.equal(f.charge,25);
});
test('Sekhem breaks a standing guard with his slow heavy strike',()=>{
 const g=ready(5);g.action(0,'power');step(g,23,[{},{block:true}]);assert.equal(g.fighters[1].hp,96);assert.ok(g.fighters[1].stun>.3);assert.equal(g.fighters[1].block,false);
});
test('MIRA glitch evades highs and mids but leaves throws and lows available',()=>{
 const g=ready(0,6),f=g.fighters[1];g.action(1,'dashBack');assert.equal(g.hit(0,moveFor(g.fighters[0],'jab')),false);assert.equal(g.hit(0,moveFor(g.fighters[0],'kick')),false);assert.equal(g.hit(0,moveFor(g.fighters[0],'low')),true);
 const t=ready(0,6);t.action(1,'dashBack');assert.equal(t.hit(0,moveFor(t.fighters[0],'throw')),true);
 step(g,10);assert.equal(f.evadeTime,0);
});
test('Veer absorbs three strikes with sand, recharges crouched, and has a stronger breakable throw',()=>{
 const g=ready(0,7),a=g.fighters[0],b=g.fighters[1];
 for(let n=0;n<3;n++){a.comboTime=0;g.deal(0,moveFor(a,'jab'));assert.equal(g.lastMove.damage,5);}
 assert.equal(b.sand,0);a.comboTime=0;g.deal(0,moveFor(a,'jab'));assert.equal(g.lastMove.damage,7);
 step(g,100,[{},{crouch:true}]);assert.ok(b.sand>20);
 const low=ready(0,7);low.deal(0,moveFor(low.fighters[0],'low'));assert.equal(low.fighters[1].sand,100);
 const t=ready(7);t.action(0,'throw');step(t,11);assert.ok(t.fighters[1].breakWindow>0);assert.equal(t.action(1,'throw'),true);step(t,30);assert.equal(t.fighters[1].hp,100);
 const slam=ready(7);slam.action(0,'throw');step(slam,40);assert.equal(slam.fighters[1].hp,72);
});
test('Luca has a short-range card and smoke only evades high attacks',()=>{
 const g=ready(8);g.fighters[1].x=565;g.action(0,'jab');step(g,14);assert.equal(g.fighters[1].hp,95);
 const s=ready(0,8);s.action(1,'dashBack');assert.equal(s.hit(0,moveFor(s.fighters[0],'jab')),false);assert.equal(s.hit(0,moveFor(s.fighters[0],'kick')),true);
});
test('new fighter resources replicate and malformed resource snapshots are rejected',()=>{
 const g=ready(4,7),remote=new Game({p1:4,p2:7,mode:'online'});g.action(0,'dashBack');assert.equal(remote.applySnapshot(g.snapshot()),true);assert.equal(remote.fighters[0].charge,25);assert.equal(remote.fighters[1].sand,100);
 const bad=g.snapshot();bad.fighters[1].sand=Infinity;assert.equal(remote.applySnapshot(bad),false);
});
