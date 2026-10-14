export const FIGHTERS=[
 {id:0,first:'JIN',last:'KAZAMA',tag:"L'ÉCLAIR DU DESTIN",origin:'JAPON',style:'Karaté Mishima',description:"Le sang des Mishima. La volonté d'un Kazama. Frappez vite, enchaînez fort, et laissez parler la foudre.",power:4,speed:4,range:3,color:'#ff435d',kanji:'仁'},
 {id:1,first:'KAZUYA',last:'MISHIMA',tag:'LE POUVOIR DU DÉMON',origin:'JAPON',style:'Karaté Mishima',description:'Une puissance implacable. Punissez chaque erreur avec des coups électriques et des frappes dévastatrices.',power:5,speed:2,range:4,color:'#b287ff',kanji:'魔'},
 {id:2,first:'JUN',last:'KAZAMA',tag:'LA LUMIÈRE SILENCIEUSE',origin:'JAPON',style:'Arts martiaux Kazama',description:'La grâce rencontre la force. Gardez votre calme, trouvez une ouverture et transformez la défense en victoire.',power:3,speed:4,range:4,color:'#a8e5ed',kanji:'純'},
 {id:3,first:'REINA',last:'',tag:'LA FOUDRE POURPRE',origin:'JAPON',style:'Taido × Karaté Mishima',description:'Insaisissable et électrique. Imposez votre rythme avec une vitesse explosive et des attaques imprévisibles.',power:3,speed:5,range:3,color:'#c096ff',kanji:'麗'}
];
// These frame values are designed for this 2D adaptation, not copied move data.
export const MOVES={
 jab:{name:'Jab',startup:.10,active:.07,recovery:.17,range:122,damage:7,knock:12,stun:.24,blockStun:.12,level:'high',pose:5,windup:4,recover:6},
 kick:{name:'Side kick',startup:.17,active:.12,recovery:.26,range:154,damage:12,knock:32,stun:.34,blockStun:.16,level:'mid',pose:7,windup:2,recover:3,wall:true},
 upper:{name:'Heat Engager',startup:.22,active:.12,recovery:.32,range:126,damage:14,knock:15,stun:.55,blockStun:.15,launch:235,level:'mid',pose:9,windup:8,recover:6,engager:true},
 low:{name:'Low sweep',startup:.20,active:.10,recovery:.30,range:135,damage:9,knock:18,stun:.30,blockStun:.14,level:'low',pose:16,windup:10,recover:10},
 power:{name:'Power Crush',startup:.24,active:.12,recovery:.38,range:145,damage:16,knock:50,stun:.42,blockStun:.16,level:'mid',armor:true,pose:15,windup:11,recover:6,wall:true},
 throw:{name:'Throw',startup:.12,active:.08,recovery:.42,range:114,damage:16,knock:45,stun:.45,blockStun:0,level:'throw',pose:5,windup:4,recover:6},
 heat:{name:'Heat Burst',startup:.19,active:.12,recovery:.27,range:160,damage:10,knock:22,stun:.40,blockStun:.38,level:'mid',armor:true,pose:15,windup:8,recover:6},
 smash:{name:'Heat Smash',startup:.24,active:.15,recovery:.44,range:185,damage:25,knock:75,stun:.65,blockStun:.17,level:'mid',pose:15,windup:8,recover:6},
 rage:{name:'Rage Art',startup:.30,active:.16,recovery:.65,range:175,damage:30,knock:80,stun:.70,blockStun:.15,level:'mid',armor:true,pose:15,windup:11,recover:6}
};
export const SPECIALS=['Electric Kazama','Demon Uppercut','Kazama Purification','Sentai Thunder'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ARENA_LEFT=150,ARENA_RIGHT=810;
export class Game{
 constructor({p1=0,p2=1,mode='arcade',difficulty='normal',onEvent=()=>{},random=Math.random,roundsToWin=2,boss=false}={}){
  this.roundsToWin=roundsToWin;this.boss=boss;this.ids=[p1,p2];this.mode=mode;this.difficulty=difficulty;this.onEvent=onEvent;this.random=random;
  this.wins=[0,0];this.round=1;this.phase='intro';this.phaseTime=0;this.elapsed=0;this.tick=0;this.paused=false;this.trainingAI=false;this.lastMove=null;this.resetFighters();
 }
 resetFighters(){
  this.fighters=this.ids.map((id,i)=>({id,x:i?690:270,y:0,vy:0,hp:100,recoverable:0,heat:100,heatUsed:false,heatTimer:0,rageUsed:false,face:i?-1:1,state:'idle',move:null,moveTime:0,hitDone:false,stun:0,block:false,crouch:false,combo:0,comboDamage:0,comboTime:0,airHits:0,aiWait:0,walk:0,flash:0,heatTime:0,dashTime:0,dashCooldown:0,dashDir:0,buffer:null,bufferTime:0,grab:null,breakWindow:0}));this.time=60;
 }
 emit(type,data={}){this.onEvent({type,...data});}
 activateHeat(i,duration){const f=this.fighters[i];f.heatUsed=true;f.heatTimer=duration;f.heatDuration=duration;f.heat=100;f.heatTime=.7;this.emit('heat',{i,x:f.x,duration});}
 queueAction(i,kind){
  const f=this.fighters[i];if(!f)return false;
  if(this.action(i,kind))return true;
  if(f.move&&f.moveTime>MOVES[f.move].startup+MOVES[f.move].active&&MOVES[kind]){f.buffer=kind;f.bufferTime=.20;return true;}return false;
 }
 action(i,kind){
  const f=this.fighters[i];if(!f||this.paused||this.phase!=='fight')return false;
  if(kind==='throw'&&f.breakWindow>0){
   const other=this.fighters[1-i];other.grab=null;other.move=null;other.stun=.25;f.breakWindow=0;f.stun=0;this.emit('throwBreak',{i});return true;
  }
  if(f.stun>0)return false;
  if(kind==='jump'){if(f.y===0&&!f.move&&!f.block){f.vy=330;f.state='jump';this.emit('jump',{i});return true;}return false;}
  if(kind==='dashForward'||kind==='dashBack'){
   if(f.move||f.block||f.y>0||f.dashCooldown>0)return false;
   f.dashDir=f.face*(kind==='dashForward'?1:-1);f.dashTime=.13;f.dashCooldown=.42;this.emit('dash',{i});return true;
  }
  if(kind==='smash'||!MOVES[kind]||f.move||f.block||f.y>0&&['rage','throw','power','heat'].includes(kind))return false;
  if(kind==='rage'){if(f.hp>25||f.rageUsed){this.emit('norage',{i});return false;}f.rageUsed=true;f.heatTime=.9;this.emit('rage',{i,x:f.x});}
  if(kind==='heat'){
   if(f.heatTimer>0){kind='smash';f.heatTimer=0;f.heat=0;f.heatTime=.9;this.emit('smash',{i,x:f.x});}
   else if(f.heatUsed){this.emit('noheat',{i});return false;}
   else this.activateHeat(i,10);
  }
  f.move=kind;f.moveTime=0;f.hitDone=false;f.swingDone=false;f.state=kind;f.crouch=kind==='low';f.buffer=null;f.bufferTime=0;f.dashTime=0;return true;
 }
 ai(dt){
  const f=this.fighters[1],p=this.fighters[0],d=Math.abs(f.x-p.x),difficulty=this.difficulty;f.aiWait-=dt;
  const c={left:false,right:false,block:false,crouch:false};if(f.stun>0){if(f.breakWindow>0&&difficulty==='hard'&&this.random()<.2)this.action(1,'throw');return c;}
  if(d>120)c[f.x>p.x?'left':'right']=true;
  const defend=difficulty==='hard'?.8:difficulty==='normal'?.42:.15;
  if(p.move&&d<190&&f.aiWait<0&&this.random()<defend){f.aiWait=.2;c.block=true;c.crouch=MOVES[p.move].level==='low';return c;}
  if(f.aiWait>0&&f.state==='block'){c.block=true;c.crouch=f.crouch;return c;}
  if(f.aiWait<0&&d<165){
   const r=this.random();let move=f.hp<=25&&!f.rageUsed&&r<.2?'rage':f.heatTimer>0&&r<.25?'heat':!f.heatUsed&&r<.12?'heat':p.block&&r<.45?(p.crouch?'kick':'low'):r<.40?'jab':r<.65?'kick':r<.83?'upper':r<.94?'low':'power';
   if(d<MOVES[move].range+(FIGHTERS[f.id].range-3)*8-4&&this.action(1,move))f.aiWait=difficulty==='easy'?.65+this.random()*.5:difficulty==='hard'?.2+this.random()*.2:.37+this.random()*.3;
  }return c;
 }
 hit(i,move){
  const a=this.fighters[i],b=this.fighters[1-i],meta=FIGHTERS[a.id];
  if(Math.abs(a.x-b.x)>move.range+(meta.range-3)*8||Math.abs(a.y-b.y)>105||(b.x-a.x)*a.face<0)return false;
  if((move.level==='high'||move.level==='throw')&&b.crouch||move.level==='low'&&b.y>25||move.level==='throw'&&b.y>0)return false;
  if(move.level==='throw'){
   b.breakWindow=.22;b.stun=.28;b.move=null;b.state='hit';a.grab={target:1-i,delay:.22};this.emit('throw',{i});return true;
  }
  const blocked=b.block&&b.y===0&&(move.level==='low'?b.crouch:!b.crouch);
  this.deal(i,move,blocked);return true;
 }
 deal(i,move,blocked=false){
  const a=this.fighters[i],b=this.fighters[1-i],meta=FIGHTERS[a.id];
  const armor=!blocked&&b.move&&MOVES[b.move].armor&&b.moveTime>=.07&&b.moveTime<MOVES[b.move].startup+MOVES[b.move].active&&['high','mid'].includes(move.level);
  const counter=!blocked&&!armor&&b.move&&b.moveTime<MOVES[b.move].startup;
  const punish=!blocked&&!armor&&b.move&&b.moveTime> MOVES[b.move].startup+MOVES[b.move].active;
  const combo=a.comboTime>0?a.combo:0,scale=Math.max(.35,1-combo*.12)*(b.y>0?.8:1);
  const rageBonus=a.hp<=25&&!a.rageUsed?1.10:1;
  let damage=blocked?(a.heatTimer>0||a.move==='smash'?Math.ceil(move.damage*.12):0):Math.round(move.damage*(.9+meta.power*.04)*scale*rageBonus*(counter?1.2:1));
  if(this.boss){if(i===1)damage=Math.round(damage*1.35);else damage=Math.round(damage*.8);}
  if(a.move==='rage'&&!blocked)damage=Math.round(damage*(1+(25-a.hp)*.008));
  b.hp=Math.max(0,b.hp-damage);b.flash=.12;
  if(blocked||armor||b.y>0)b.recoverable=clamp(b.recoverable+damage*(blocked?1:.45),0,100-b.hp);
  if(a.move==='rage'&&!blocked)b.recoverable=0;
  if(!armor){
   b.stun=blocked?move.blockStun:move.stun+(counter?.10:0);
   const next=b.x+a.face*(blocked?7:move.knock);b.x=clamp(next,ARENA_LEFT,ARENA_RIGHT);
   if(!blocked){
    b.move=null;b.buffer=null;b.state='hit';
    if(move.launch&&b.airHits<3){b.vy=move.launch;b.airHits++;}
    else if(b.y>0){b.airHits++;b.vy=b.airHits>=3?-180:Math.max(b.vy,105);}
    if(move.wall&&(next<ARENA_LEFT||next>ARENA_RIGHT)){b.stun+=.18;this.emit('wall',{i:1-i,x:b.x});}
   }
  }
  if(!blocked){a.combo=combo+1;a.comboDamage=(combo?a.comboDamage:0)+damage;a.comboTime=1.05;}
  const recover=Math.min(a.recoverable,blocked?1:3);a.hp=Math.min(100,a.hp+recover);a.recoverable=Math.max(0,a.recoverable-recover);
  if(move.engager&&!blocked&&!armor&&!a.heatUsed){this.activateHeat(i,15);const healing=Math.min(a.recoverable,10);a.hp+=healing;a.recoverable-=healing;}
  const remaining=move.startup+move.active+move.recovery-a.moveTime;
  this.lastMove={i,name:move.engager?SPECIALS[a.id]:move.name,level:move.level,startup:Math.round(move.startup*60),advantage:Math.round(((blocked?move.blockStun:move.stun)-remaining)*60),damage,blocked,counter,punish};
  this.emit(blocked?'block':'hit',{i,move:a.move==='smash'?'heat':a.move,damage,combo:a.combo,comboDamage:a.comboDamage,counter,punish,armor,level:move.level,name:this.lastMove.name,x:(a.x+b.x)/2+15*a.face,y:move.level==='low'?425:375-(a.y+b.y)/2,heavy:['smash','rage','upper','power'].includes(a.move),move:a.move,face:a.face,color:meta.color});
 }
 update(dt,input=[{},{}]){
  dt=clamp(dt,0,.05);if(this.paused||this.phase==='done')return;this.tick++;this.elapsed+=dt;this.phaseTime+=dt;
  if(this.phase==='intro'){if(this.phaseTime>=2){this.phase='fight';this.phaseTime=0;this.emit('fight');}return;}
  if(this.phase==='roundEnd'){
   if(this.phaseTime>=2.4){if(this.wins.some(w=>w>=this.roundsToWin)){this.phase='done';this.emit('matchEnd',{winner:this.winner,wins:[...this.wins]});}else{this.round++;this.resetFighters();this.phase='intro';this.phaseTime=0;this.emit('round',{round:this.round});}}return;
  }
  if(this.mode!=='training')this.time=Math.max(0,this.time-dt);
  const controls=[input[0]||{},['versus','online'].includes(this.mode)?input[1]||{}:(this.mode==='training'&&!this.trainingAI?input[1]||{}:this.ai(dt))];
  // Both guards are sampled before resolving any strikes in this tick.
  this.fighters.forEach((f,i)=>{const c=controls[i];f.face=this.fighters[1-i].x>=f.x?1:-1;f.crouch=!!c.crouch&&f.y===0&&!f.move&&f.stun===0;f.block=!!c.block&&!f.move&&f.stun===0&&f.y===0;});
  this.fighters.forEach((f,i)=>{
   const c=controls[i];for(const timer of ['stun','flash','heatTime','comboTime','dashTime','dashCooldown','bufferTime','breakWindow'])f[timer]=Math.max(0,f[timer]-dt);
   f.heatTimer=Math.max(0,f.heatTimer-dt);f.heat=!f.heatUsed?100:f.heatTimer/(f.heatDuration||15)*100;
   if(f.comboTime===0){f.combo=0;f.comboDamage=0;}if(f.bufferTime===0)f.buffer=null;
   if(f.grab){f.grab.delay-=dt;if(f.grab.delay<=0){this.deal(i,MOVES.throw);f.grab=null;this.fighters[1-i].breakWindow=0;}}
   let movement=0;
   if(!f.move&&f.stun===0&&!f.block){movement=f.dashTime>0?f.dashDir*480*dt:(Number(!!c.right)-Number(!!c.left))*(165+FIGHTERS[f.id].speed*13)*(f.crouch?.4:1)*dt;f.x=clamp(f.x+movement,ARENA_LEFT,ARENA_RIGHT);f.state=f.crouch?'crouch':movement?'walk':f.y>0?'jump':'idle';}
   if(f.block)f.state='block';if(f.stun>0)f.state='hit';f.walk+=Math.abs(movement)*.045;
   if(f.y>0||f.vy>0){f.y=Math.max(0,f.y+f.vy*dt);f.vy-=840*dt;if(f.y===0&&f.vy<0){f.vy=0;f.airHits=0;this.emit('land',{i,x:f.x});}}
   if(f.move){
    const move=MOVES[f.move];f.moveTime+=dt;
    if(f.moveTime>=move.startup&&f.moveTime<=move.startup+move.active){
     if(!f.swingDone){f.swingDone=true;this.emit('swing',{i,move:f.move,x:f.x,y:375-f.y,face:f.face});}
     if(!f.hitDone)f.hitDone=this.hit(i,move);
    }
    if(f.moveTime>move.startup+move.active+move.recovery){f.move=null;f.state='idle';}
   }
   if(!f.move&&f.buffer&&f.stun===0){const queued=f.buffer;f.buffer=null;this.action(i,queued);}
  });
  const [a,b]=this.fighters,dist=b.x-a.x;
  if(Math.abs(dist)<100&&Math.abs(a.y-b.y)<95){const center=clamp((a.x+b.x)/2,ARENA_LEFT+50,ARENA_RIGHT-50),sign=dist>=0?1:-1;a.x=center-sign*50;b.x=center+sign*50;}
  a.face=b.x>=a.x?1:-1;b.face=-a.face;
  if(this.mode==='training'){this.fighters.forEach(f=>{if(f.hp<=0){f.hp=100;f.recoverable=0;f.heatUsed=false;f.heatTimer=0;f.rageUsed=false;f.stun=0;f.move=null;this.emit('resetTraining');}});return;}
  if(a.hp<=0||b.hp<=0||this.time<=0){this.winner=a.hp===b.hp?-1:a.hp>b.hp?0:1;if(this.winner>=0)this.wins[this.winner]++;this.phase='roundEnd';this.phaseTime=0;this.emit('roundEnd',{winner:this.winner,ko:a.hp<=0||b.hp<=0});}
 }
 snapshot(){return {ids:this.ids,round:this.round,phase:this.phase,phaseTime:this.phaseTime,time:this.time,elapsed:this.elapsed,tick:this.tick,paused:this.paused,wins:[...this.wins],winner:this.winner??-1,lastMove:this.lastMove,fighters:this.fighters.map(f=>({...f}))};}
 applySnapshot(s){
  if(!s||!Array.isArray(s.fighters)||s.fighters.length!==2||!['intro','fight','roundEnd','done'].includes(s.phase)||!Number.isFinite(s.tick)||s.tick<this.tick)return false;
  if(!Number.isInteger(s.round)||s.round<1||typeof s.paused!=='boolean'||!Number.isFinite(s.time)||s.time<0||s.time>60||!Number.isFinite(s.phaseTime)||!Number.isFinite(s.elapsed)||!Array.isArray(s.wins)||s.wins.length!==2||s.wins.some(w=>!Number.isInteger(w)||w<0||w>2))return false;
  if(s.fighters.some((f,i)=>f.id!==this.ids[i]||!['x','y','hp','heat','recoverable','moveTime','stun','walk','flash'].every(k=>Number.isFinite(f[k]))||f.x<ARENA_LEFT||f.x>ARENA_RIGHT||f.y<0||f.y>1000||f.hp<0||f.hp>100||f.heat<0||f.heat>100||f.recoverable<0||f.recoverable>100||![1,-1].includes(f.face)||f.move&&!MOVES[f.move]))return false;
  for(const key of ['round','phase','phaseTime','time','elapsed','tick','paused','wins','winner','lastMove'])this[key]=s[key];this.fighters=s.fighters.map(f=>({...f}));return true;
 }
}
