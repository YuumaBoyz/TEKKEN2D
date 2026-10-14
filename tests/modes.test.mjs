import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,FIGHTERS} from '../dist/engine.mjs';
import {arcadeOpponent,TRIALS,TrialTracker,InputRecording} from '../dist/modes.mjs';
const step=(g,n=1,controls=[{},{}])=>{for(let i=0;i<n;i++)g.update(1/60,controls);};

test('arcade has eight rival fights and a final boss distinct from the player',()=>{
 for(let hero=0;hero<FIGHTERS.length;hero++){
  const route=Array.from({length:8},(_,i)=>arcadeOpponent(hero,i+1));
  assert.ok(route.every(id=>id!==hero&&id>=0&&id<FIGHTERS.length));
  assert.equal(new Set(route).size,8);
  assert.equal(route[7],hero===1?3:1);
 }
});
test('story ends after one won round while the default duel needs two',()=>{
 const g=new Game({mode:'versus',roundsToWin:1});step(g,121);g.fighters[1].hp=0;step(g,150);
 assert.equal(g.phase,'done');assert.deepEqual(g.wins,[1,0]);
 const duel=new Game({mode:'versus'});step(duel,121);duel.fighters[1].hp=0;step(duel,150);
 assert.equal(duel.round,2);assert.notEqual(duel.phase,'done');
});
test('boss hits harder and resists player attacks',()=>{
 function damage(boss,i){const g=new Game({mode:'versus',boss});step(g,121);g.fighters[0].x=400;g.fighters[1].x=500;g.action(i,'jab');step(g,9);return 100-g.fighters[1-i].hp;}
 assert.ok(damage(true,1)>damage(false,1));assert.ok(damage(true,0)<damage(false,0));
});
test('recorded input and actions replay once and stop at the frame limit',()=>{
 const r=new InputRecording(2);assert.equal(r.play(),false);r.record();
 r.step({left:true},['jab']);r.step({right:true},[]);assert.equal(r.state,'idle');assert.equal(r.frames.length,2);
 r.play();assert.deepEqual(r.step(),{input:{left:true},actions:['jab']});assert.deepEqual(r.step(),{input:{right:true},actions:[]});assert.equal(r.state,'idle');assert.equal(r.step(),null);
});
test('recorded mannequin movement and attack execute in the training engine',()=>{
 const g=new Game({mode:'training'});step(g,121);g.fighters[0].x=400;g.fighters[1].x=510;
 const r=new InputRecording();r.record();r.step({left:true},['jab']);r.stop();r.play();const frame=r.step();
 frame.actions.forEach(a=>g.queueAction(1,a));step(g,9,[{},frame.input]);assert.ok(g.fighters[0].hp<100);
});
test('trial rejects disconnected hits and an incorrect sequence',()=>{
 const t=new TrialTracker(['jab','kick']);t.hit('jab',1);t.hit('kick',1);assert.equal(t.complete,false);
 t.hit('jab',1);t.hit('upper',2);assert.equal(t.index,0);t.hit('jab',1);t.hit('kick',2);assert.equal(t.complete,true);
});
test('every trial is achievable using actual consecutive hit events',()=>{
 for(const trial of TRIALS){
  const tracker=new TrialTracker(trial.moves),events=[];
  const g=new Game({mode:'training',onEvent:e=>{if(e.type==='hit'&&e.i===0){tracker.hit(e.move,e.combo);events.push(e.move);}}});
  step(g,121);g.fighters[0].x=700;g.fighters[1].x=800;
  for(const move of trial.moves){assert.equal(g.queueAction(0,move),true);while(g.fighters[0].move)step(g);}
  assert.equal(tracker.complete,true,`${trial.title}: ${events.join(', ')}`);
 }
});
