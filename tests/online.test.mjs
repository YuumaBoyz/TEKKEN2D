import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {PeerRoom,cleanInput,normalizeRoomCode} from '../dist/online.mjs';
test('room codes reject malformed or missing codes',()=>{assert.equal(normalizeRoomCode('abcd-efgh'),'ABCDEFGH');assert.equal(normalizeRoomCode('123'),null);assert.equal(normalizeRoomCode('OOOO-0000'),null);});
test('remote movement accepts only explicit boolean fields',()=>{assert.deepEqual(cleanInput({left:true,right:'yes',block:1,crouch:true,hp:999}),{left:true,right:false,block:false,crouch:true});});
class FakeConnection extends EventEmitter{
 constructor(metadata){super();this.metadata=metadata;this.open=false;}
 send(message){setImmediate(()=>{if(this.remote.open)this.remote.emit('data',JSON.parse(JSON.stringify(message)));});}
 close(){if(this.open){this.open=false;this.emit('close');if(this.remote.open){this.remote.open=false;this.remote.emit('close');}}}
}
class FakePeer extends EventEmitter{
 static peers=new Map();static next=0;
 constructor(id){super();this.id=id||'guest-'+FakePeer.next++;FakePeer.peers.set(this.id,this);setImmediate(()=>this.emit('open',this.id));}
 connect(id,options){const a=new FakeConnection(options.metadata),b=new FakeConnection(options.metadata);a.remote=b;b.remote=a;setImmediate(()=>{FakePeer.peers.get(id)?.emit('connection',b);setImmediate(()=>{a.open=b.open=true;a.emit('open');b.emit('open');});});return a;}
 destroy(){FakePeer.peers.delete(this.id);}
}
async function until(condition){for(let n=0;n<100;n++){if(condition())return;await new Promise(resolve=>setImmediate(resolve));}assert.fail('Handshake did not complete');}
test('host and guest handshake, exchange messages and disconnect cleanly',async()=>{
 const messages=[],statuses=[];
 const host=new PeerRoom({PeerClass:FakePeer,onMessage:m=>messages.push(m),onStatus:s=>statuses.push(s)}),guest=new PeerRoom({PeerClass:FakePeer});
 try{const code=await host.host(8);await guest.join(code,7);await until(()=>host.connected&&guest.connected);assert.equal(host.remoteFighter,7);assert.equal(guest.remoteFighter,8);guest.send('action',{action:'jab'});await until(()=>messages.length>0);assert.equal(messages[0].action,'jab');guest.close();await until(()=>!host.connected);assert.ok(statuses.includes('disconnected'));}finally{host.close();guest.close();}
});
test('a room rejects a third player while preserving the first connection',async()=>{
 const host=new PeerRoom({PeerClass:FakePeer}),first=new PeerRoom({PeerClass:FakePeer}),errors=[],third=new PeerRoom({PeerClass:FakePeer,onStatus:(s,m)=>{if(s==='error')errors.push(m);}});
 try{const code=await host.host(0);await first.join(code,1);await until(()=>host.connected&&first.connected);await third.join(code,2);await until(()=>errors.length>0);assert.equal(host.connected,true);assert.equal(first.connected,true);assert.match(errors[0],/déjà deux joueurs/);}finally{host.close();first.close();third.close();}
});
test('late events from a previous connection cannot corrupt a new room',async()=>{
 const host=new PeerRoom({PeerClass:FakePeer}),guest=new PeerRoom({PeerClass:FakePeer});
 try{
  let code=await host.host(0);await guest.join(code,1);await until(()=>host.connected&&guest.connected);
  const oldConnection=host.conn;guest.close();host.close();
  code=await host.host(2);await guest.join(code,3);await until(()=>host.connected&&guest.connected);
  oldConnection.emit('data',{v:2,type:'hello',fighter:0,sequence:1000});oldConnection.emit('close');
  assert.equal(host.connected,true);assert.equal(host.remoteFighter,3);
 }finally{host.close();guest.close();}
});
