import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/engine.mjs';
const step=(g,n=30,controls=[{},{}])=>{for(let i=0;i<n;i++)g.update(1/60,controls);};
function duel(){const events=[],g=new Game({mode:'versus',onEvent:e=>events.push(e)});step(g,125);g.fighters[0].x=400;g.fighters[1].x=500;return {g,events};}
test('crouching evades a high jab but a mid kick beats crouch guard',()=>{
 const {g}=duel();g.action(0,'jab');step(g,25,[{},{crouch:true}]);assert.equal(g.fighters[1].hp,100);
 g.action(0,'kick');step(g,36,[{},{crouch:true,block:true}]);assert.ok(g.fighters[1].hp<100);
});
test('low attacks beat standing guard and are stopped by crouch guard',()=>{
 const a=duel().g;a.action(0,'low');step(a,40,[{},{block:true}]);assert.ok(a.fighters[1].hp<100);
 const b=duel().g;b.action(0,'low');step(b,40,[{},{block:true,crouch:true}]);assert.equal(b.fighters[1].hp,100);
});
test('Power Crush takes damage without interruption from highs; lows interrupt it',()=>{
 const a=duel().g;a.action(1,'power');a.action(0,'jab');step(a,9);assert.equal(a.fighters[1].move,'power');assert.ok(a.fighters[1].hp<100);
 const b=duel().g;b.action(1,'power');b.action(0,'low');step(b,13);assert.equal(b.fighters[1].move,null);assert.ok(b.fighters[1].hp<100);
});
test('an Engager grants Heat on hit, but does not grant Heat on block',()=>{
 const a=duel().g;a.action(0,'upper');step(a,17);assert.equal(a.fighters[0].heatUsed,true);assert.ok(a.fighters[0].heatTimer>14);
 const b=duel().g;b.action(0,'upper');step(b,17,[{},{block:true}]);assert.equal(b.fighters[0].heatUsed,false);
});
test('Rage Art is restricted to low health and one use per round',()=>{
 const {g}=duel();assert.equal(g.action(0,'rage'),false);g.fighters[0].hp=25;assert.equal(g.action(0,'rage'),true);step(g,80);assert.equal(g.action(0,'rage'),false);
});
test('throws bypass standing guard and can be broken during the window',()=>{
 const a=duel().g;a.action(0,'throw');step(a,40,[{},{block:true}]);assert.ok(a.fighters[1].hp<100);
 const {g,events}=duel();g.action(0,'throw');step(g,8);assert.ok(g.fighters[1].breakWindow>0);assert.equal(g.action(1,'throw'),true);step(g,40);assert.equal(g.fighters[1].hp,100);assert.ok(events.some(e=>e.type==='throwBreak'));
});
test('counter hits and punishments are reported from the actual attack windows',()=>{
 const b=duel();b.g.action(1,'upper');b.g.action(0,'jab');step(b.g,8);assert.ok(b.events.some(e=>e.type==='hit'&&e.counter));
 const c=duel();c.g.fighters[1].move='kick';c.g.fighters[1].moveTime=.36;c.g.action(0,'jab');step(c.g,8);assert.ok(c.events.some(e=>e.type==='hit'&&e.punish));
});
test('recoverable health is restored by successful offense',()=>{
 const {g}=duel();g.fighters[0].hp=70;g.fighters[0].recoverable=10;g.action(0,'jab');step(g,9);assert.equal(g.fighters[0].hp,73);assert.equal(g.fighters[0].recoverable,7);
});
test('buffering during recovery starts the next attack after recovery ends',()=>{
 const {g}=duel();g.action(0,'jab');step(g,17);assert.equal(g.queueAction(0,'kick'),true);step(g,5);assert.equal(g.fighters[0].move,'kick');
});
test('an authoritative snapshot replicates state and rejects stale/wrong-fighter data',()=>{
 const a=duel().g,b=new Game({p1:0,p2:1,mode:'online'});a.action(0,'kick');step(a,40);const state=a.snapshot();assert.equal(b.applySnapshot(state),true);assert.equal(b.fighters[1].hp,a.fighters[1].hp);
 assert.equal(b.applySnapshot({...state,tick:state.tick-1}),false);
 const bad=structuredClone(state);bad.fighters[0].id=3;assert.equal(b.applySnapshot(bad),false);
});
test('smash cannot be invoked directly to bypass Heat resources',()=>{const {g}=duel();assert.equal(g.action(0,'smash'),false);});

test('corner pressure keeps both complete fighters inside the arena without overlap',()=>{const {g}=duel();g.fighters[0].x=150;g.fighters[1].x=160;step(g,1);assert.equal(g.fighters[0].x,150);assert.equal(g.fighters[1].x,250);assert.equal(g.fighters[1].face,-1);});
