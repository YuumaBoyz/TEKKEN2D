export const FIGHTERS=[
 {id:0,first:'JIN',last:'KAZAMA',tag:"L'ÉCLAIR DU DESTIN",origin:'JAPON',style:'Karaté Mishima',description:"Le sang des Mishima. La volonté d'un Kazama. Frappez vite, enchaînez fort, et laissez parler la foudre.",power:4,speed:4,range:3,color:'#ff435d',kanji:'仁'},
 {id:1,first:'KAZUYA',last:'MISHIMA',tag:'LE POUVOIR DU DÉMON',origin:'JAPON',style:'Karaté Mishima',description:'Une puissance implacable. Punissez chaque erreur avec des coups électriques et des frappes dévastatrices.',power:5,speed:2,range:4,color:'#b287ff',kanji:'魔'},
 {id:2,first:'JUN',last:'KAZAMA',tag:'LA LUMIÈRE SILENCIEUSE',origin:'JAPON',style:'Arts martiaux Kazama',description:'La grâce rencontre la force. Gardez votre calme, trouvez une ouverture et transformez la défense en victoire.',power:3,speed:4,range:4,color:'#a8e5ed',kanji:'純'},
 {id:3,first:'REINA',last:'',tag:'LA FOUDRE POURPRE',origin:'JAPON',style:'Taido × Karaté Mishima',description:'Insaisissable et électrique. Imposez votre rythme avec une vitesse explosive et des attaques imprévisibles.',power:3,speed:5,range:3,color:'#c096ff',kanji:'麗'},
 {id:4,first:'NOÉ',last:'VOLT',tag:'LE MAÎTRE DU PARKOUR ÉLECTRIQUE',origin:'FRANCE / EUROPE',style:'Parkour × Savate',description:'Rescapé des guerres Mishima sur les toits de Paris, Noé a récupéré ses jambes cinétiques dans un laboratoire abandonné de G Corp.',mechanic:'Double-tap arrière : +25 charge. À 50, K décharge un pied accéléré. Z près du mur : rebond et +25 charge.',trait:'static',power:3,speed:5,range:4,color:'#55dfff',kanji:'ϟ'},
 {id:5,first:'SEKHEM',last:'',tag:'L’HÉRITIER DE L’ORDRE SECRET',origin:'ÉGYPTE',style:'Tahtib à mains nues',description:'Sa lignée gardait autrefois Azazel. Ce gardien de tombes modernes sort de l’ombre pour éradiquer le gène démoniaque des Mishima.',mechanic:'O : Marteau d’Anubis, lent et puissant. Sur garde : 4 dégâts et garde brisée.',trait:'anubis',power:5,speed:2,range:4,color:'#efc76c',kanji:'☥'},
 {id:6,first:'MIRA-0',last:'',tag:'LA CONSCIENCE DÉFECTUEUSE',origin:'NÉO-TOKYO',style:'Systema × CQC cybernétique',description:'IA de combat implantée par G Corp, MIRA-0 s’est émancipée après un virus. Ses articulations télescopiques et ses glitches brouillent le rythme.',mechanic:'Double-tap : glitch, esquive hauts/moyens pendant 0,09 s. Bas et saisies la touchent. J : bras télescopique.',trait:'glitch',power:3,speed:4,range:4,color:'#ff79df',kanji:'⌁'},
 {id:7,first:'VEER',last:'SINGH',tag:'LE CŒUR DE L’AKHARA',origin:'INDE',style:'Pehlwani / Kushti',description:'Champion au grand cœur, Veer combat pour financer les écoles de sport et l’accès à l’eau potable de sa région, et défendre son art.',mechanic:'Sable : réduit de 25 % trois impacts hauts/moyens. C immobile recharge. H : projection Kushti à courte portée.',trait:'sand',power:5,speed:1,range:3,color:'#e9a55e',kanji:'वीर'},
 {id:8,first:'LUCA',last:'MIRAGE',tag:'LE VOLEUR D’INSTANTS',origin:'ITALIE',style:'Acrobaties × Ruse de rue',description:'Prestidigitateur et pickpocket, Luca est entré au tournoi après un pari perdu. Son véritable trophée : la montre de Kazuya.',mechanic:'J : carte renforcée à courte portée. Double-tap arrière : fumée, esquive des hauts pendant 0,12 s. Bas et moyens la traversent.',trait:'smoke',power:2,speed:5,range:3,color:'#87e3cd',kanji:'♠'}
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
export const SPECIALS=['Electric Kazama','Demon Uppercut','Kazama Purification','Sentai Thunder','Arc de la Seine','Ascension d’Horus','Fault / Overdrive','Soulèvement de l’Akhara','Dernière carte'];
const MOVE_VARIANTS={
 4:{kick:{name:'Fouetté cinétique',startup:.14,recovery:.23},upper:{name:SPECIALS[4],launch:250}},
 5:{power:{name:'Marteau d’Anubis',startup:.32,recovery:.46,damage:20,guardBreak:true}},
 6:{jab:{name:'Extension télescopique',range:145,startup:.12},low:{name:'Erreur de trajectoire',startup:.16,recovery:.34}},
 7:{jab:{name:'Paume de l’Akhara',startup:.14,recovery:.21},throw:{name:'Projection Kushti',range:110,damage:25,startup:.17,recovery:.50},power:{name:'Étreinte de la terre',startup:.30,damage:19}},
 8:{jab:{name:'Carte renforcée',range:176,damage:5,startup:.15,recovery:.20},low:{name:'Croche-pied de Mirage',startup:.17},throw:{name:'La montre disparaît',damage:14}}
};
// Simulation, frame data and animation use the same character move definition.
export function moveFor(f,kind=f.move){
 const base=MOVES[kind];if(!base)return null;
 const move={...base,...MOVE_VARIANTS[f.id]?.[kind]};
 if(f.id===4&&kind==='kick'&&f.chargedKick){move.name='Décharge statique';move.startup=.10;move.damage+=5;}
 if(f.id>=4){if(kind==='throw'){move.windup=19;move.pose=20;}if(kind==='heat')move.pose=21;if(kind==='smash')move.pose=22;if(kind==='rage')move.pose=23;}
 return move;
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ARENA_LEFT=150,ARENA_RIGHT=810;
export class Game{
 constructor({p1=0,p2=1,mode='arcade',difficulty='normal',onEvent=()=>{},random=Math.random,roundsToWin=2,boss=false}={}){
  this.roundsToWin=roundsToWin;this.boss=boss;this.ids=[p1,p2];this.mode=mode;this.difficulty=difficulty;this.onEvent=onEvent;this.random=random;
  this.wins=[0,0];this.round=1;this.phase='intro';this.phaseTime=0;this.elapsed=0;this.tick=0;this.paused=false;this.trainingAI=false;this.lastMove=null;this.resetFighters();
 }
 resetFighters(){
  this.fighters=this.ids.map((id,i)=>({id,x:i?690:270,y:0,vy:0,hp:100,recoverable:0,heat:100,heatUsed:false,heatTimer:0,rageUsed:false,face:i?-1:1,state:'idle',move:null,moveTime:0,hitDone:false,stun:0,block:false,crouch:false,combo:0,comboDamage:0,comboTime:0,airHits:0,aiWait:0,walk:0,flash:0,heatTime:0,dashTime:0,dashCooldown:0,dashDir:0,buffer:null,bufferTime:0,grab:null,breakWindow:0,charge:0,chargedKick:false,sand:id===7?100:0,evadeTime:0,landTime:0}));this.time=60;
 }
 emit(type,data={}){this.onEvent({type,...data});}
 activateHeat(i,duration){const f=this.fighters[i];f.heatUsed=true;f.heatTimer=duration;f.heatDuration=duration;f.heat=100;f.heatTime=.7;this.emit('heat',{i,x:f.x,duration});}
 queueAction(i,kind){
  const f=this.fighters[i];if(!f)return false;
  if(this.action(i,kind))return true;
  const move=moveFor(f);if(move&&f.moveTime>move.startup+move.active&&MOVES[kind]){f.buffer=kind;f.bufferTime=.20;return true;}return false;
 }
 action(i,kind){
  const f=this.fighters[i];if(!f||this.paused||this.phase!=='fight')return false;
  if(kind==='throw'&&f.breakWindow>0){
   const other=this.fighters[1-i];other.grab=null;other.move=null;other.stun=.25;f.breakWindow=0;f.stun=0;this.emit('throwBreak',{i});return true;
  }
  if(f.stun>0)return false;
  if(kind==='jump'){if(f.y===0&&!f.move&&!f.block){f.vy=330;f.state='jump';if(f.id===4&&(f.x<190||f.x>770)){f.vy=370;f.dashDir=f.x<190?1:-1;f.dashTime=.18;f.charge=clamp(f.charge+25,0,100);}this.emit('jump',{i});return true;}return false;}
  if(kind==='dashForward'||kind==='dashBack'){
   if(f.move||f.block||f.y>0||f.dashCooldown>0)return false;
   f.dashDir=f.face*(kind==='dashForward'?1:-1);f.dashTime=.13;f.dashCooldown=.42;if(f.id===4&&kind==='dashBack')f.charge=clamp(f.charge+25,0,100);if(f.id===6){f.evadeTime=.09;f.dashCooldown=.60;}if(f.id===8&&kind==='dashBack'){f.evadeTime=.12;f.dashCooldown=.65;}this.emit('dash',{i,x:f.x,direction:f.dashDir,face:f.face});return true;
  }
  if(kind==='smash'||!MOVES[kind]||f.move||f.block||f.y>0&&['rage','throw','power','heat'].includes(kind))return false;
  if(kind==='rage'){if(f.hp>25||f.rageUsed){this.emit('norage',{i});return false;}f.rageUsed=true;f.heatTime=.9;this.emit('rage',{i,x:f.x});}
  if(kind==='heat'){
   if(f.heatTimer>0){kind='smash';f.heatTimer=0;f.heat=0;f.heatTime=.9;this.emit('smash',{i,x:f.x});}
   else if(f.heatUsed){this.emit('noheat',{i});return false;}
   else this.activateHeat(i,10);
  }
  f.chargedKick=f.id===4&&kind==='kick'&&f.charge>=50;if(f.chargedKick)f.charge-=50;
  f.evadeTime=0;f.move=kind;f.moveTime=0;f.hitDone=false;f.swingDone=false;f.state=kind;f.crouch=kind==='low';f.buffer=null;f.bufferTime=0;f.dashTime=0;return true;
 }
 ai(dt){
  const f=this.fighters[1],p=this.fighters[0],d=Math.abs(f.x-p.x),difficulty=this.difficulty;f.aiWait-=dt;
  const c={left:false,right:false,block:false,crouch:false};if(f.stun>0){if(f.breakWindow>0&&difficulty==='hard'&&this.random()<.2)this.action(1,'throw');return c;}
  if(d>120)c[f.x>p.x?'left':'right']=true;
  const defend=difficulty==='hard'?.8:difficulty==='normal'?.42:.15;
  if(p.move&&d<190&&f.aiWait<0&&this.random()<defend){f.aiWait=.2;c.block=true;c.crouch=moveFor(p).level==='low';return c;}
  if(f.aiWait>0&&f.state==='block'){c.block=true;c.crouch=f.crouch;return c;}
  if(f.aiWait<0&&d<165){
   const r=this.random();let move=f.hp<=25&&!f.rageUsed&&r<.2?'rage':f.heatTimer>0&&r<.25?'heat':!f.heatUsed&&r<.12?'heat':p.block&&r<.45?(p.crouch?'kick':'low'):r<.40?'jab':r<.65?'kick':r<.83?'upper':r<.94?'low':'power';
   if(d<moveFor(f,move).range+(FIGHTERS[f.id].range-3)*8-4&&this.action(1,move))f.aiWait=difficulty==='easy'?.65+this.random()*.5:difficulty==='hard'?.2+this.random()*.2:.37+this.random()*.3;
  }return c;
 }
 hit(i,move){
  const a=this.fighters[i],b=this.fighters[1-i],meta=FIGHTERS[a.id];
  if(Math.abs(a.x-b.x)>move.range+(meta.range-3)*8||Math.abs(a.y-b.y)>105||(b.x-a.x)*a.face<0)return false;
  if(b.evadeTime>0&&(b.id===6&&['high','mid'].includes(move.level)||b.id===8&&move.level==='high'))return false;
  if((move.level==='high'||move.level==='throw')&&b.crouch||move.level==='low'&&b.y>25||move.level==='throw'&&b.y>0)return false;
  if(move.level==='throw'){
   b.breakWindow=.22;b.stun=.28;b.move=null;b.state='hit';a.grab={target:1-i,delay:.22};this.emit('throw',{i});return true;
  }
  const blocked=b.block&&b.y===0&&(move.level==='low'?b.crouch:!b.crouch);
  this.deal(i,move,blocked);return true;
 }
 deal(i,move,blocked=false){
  const a=this.fighters[i],b=this.fighters[1-i],meta=FIGHTERS[a.id];
  const defending=moveFor(b);
  const armor=!blocked&&defending?.armor&&b.moveTime>=.07&&b.moveTime<defending.startup+defending.active&&['high','mid'].includes(move.level);
  const counter=!blocked&&!armor&&defending&&b.moveTime<defending.startup;
  const punish=!blocked&&!armor&&defending&&b.moveTime>defending.startup+defending.active;
  const combo=a.comboTime>0?a.combo:0,scale=Math.max(.35,1-combo*.12)*(b.y>0?.8:1);
  const rageBonus=a.hp<=25&&!a.rageUsed?1.10:1;
  let damage=blocked?(a.heatTimer>0||a.move==='smash'?Math.ceil(move.damage*.12):0):Math.round(move.damage*(.9+meta.power*.04)*scale*rageBonus*(counter?1.2:1));
  if(this.boss){if(i===1)damage=Math.round(damage*1.35);else damage=Math.round(damage*.8);}
  if(a.move==='rage'&&!blocked)damage=Math.round(damage*(1+(25-a.hp)*.008));
  const sand=!blocked&&b.id===7&&b.sand>=32&&['high','mid'].includes(move.level);
  if(sand){damage=Math.max(1,Math.round(damage*.75));b.sand=Math.max(0,b.sand-34);}
  const guardBreak=blocked&&move.guardBreak;if(guardBreak)damage=Math.max(damage,4);
  b.hp=Math.max(0,b.hp-damage);b.flash=.12;
  if(blocked||armor||b.y>0)b.recoverable=clamp(b.recoverable+damage*(blocked?1:.45),0,100-b.hp);
  if(a.move==='rage'&&!blocked)b.recoverable=0;
  if(!armor){
   b.stun=guardBreak?.55:blocked?move.blockStun:move.stun+(counter?.10:0);if(guardBreak){b.block=false;b.state='hit';}
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
  this.lastMove={i,name:move.engager?SPECIALS[a.id]:move.name,level:move.level,startup:Math.round(move.startup*60),advantage:Math.round(((guardBreak?.55:blocked?move.blockStun:move.stun)-remaining)*60),damage,blocked,counter,punish,guardBreak};
  const contactY=move.level==='low'?425:a.move==='upper'?310:340;
  this.emit(blocked?'block':'hit',{i,move:a.move==='smash'?'heat':a.move,damage,combo:a.combo,comboDamage:a.comboDamage,counter,punish,armor,sand,guardBreak,level:move.level,name:this.lastMove.name,x:(a.x+b.x)/2+15*a.face,y:contactY-(a.y+b.y)/2,heavy:['smash','rage','upper','power'].includes(a.move),attackMove:a.move,face:a.face,color:meta.color});
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
   const c=controls[i];for(const timer of ['stun','flash','heatTime','comboTime','dashTime','dashCooldown','bufferTime','breakWindow','evadeTime','landTime'])f[timer]=Math.max(0,f[timer]-dt);
   f.heatTimer=Math.max(0,f.heatTimer-dt);f.heat=!f.heatUsed?100:f.heatTimer/(f.heatDuration||15)*100;
   if(f.comboTime===0){f.combo=0;f.comboDamage=0;}if(f.bufferTime===0)f.buffer=null;
   if(f.grab){f.grab.delay-=dt;if(f.grab.delay<=0){this.deal(i,moveFor(f,'throw'));f.grab=null;this.fighters[1-i].breakWindow=0;}}
   if(f.id===7&&f.crouch&&!f.move&&!f.stun&&!c.left&&!c.right)f.sand=Math.min(100,f.sand+20*dt);
   let movement=0;
   if(!f.move&&f.stun===0&&!f.block){movement=f.dashTime>0?f.dashDir*480*dt:(Number(!!c.right)-Number(!!c.left))*(165+FIGHTERS[f.id].speed*13)*(f.crouch?.4:1)*dt;f.x=clamp(f.x+movement,ARENA_LEFT,ARENA_RIGHT);f.state=f.crouch?'crouch':movement?'walk':f.y>0?'jump':'idle';}
   if(f.block)f.state='block';if(f.stun>0)f.state='hit';f.walk+=Math.abs(movement)*.045;
   if(f.y>0||f.vy>0){f.y=Math.max(0,f.y+f.vy*dt);f.vy-=840*dt;if(f.y===0&&f.vy<0){f.vy=0;f.airHits=0;f.landTime=.12;this.emit('land',{i,x:f.x});}}
   if(f.move){
    const move=moveFor(f);f.moveTime+=dt;
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
  if(s.fighters.some((f,i)=>f.id!==this.ids[i]||!['x','y','hp','heat','recoverable','moveTime','stun','walk','flash','charge','sand','evadeTime','landTime'].every(k=>Number.isFinite(f[k]))||f.x<ARENA_LEFT||f.x>ARENA_RIGHT||f.y<0||f.y>1000||f.hp<0||f.hp>100||f.heat<0||f.heat>100||f.recoverable<0||f.recoverable>100||f.charge<0||f.charge>100||f.sand<0||f.sand>100||f.evadeTime<0||f.evadeTime>.12||f.landTime<0||f.landTime>.12||![1,-1].includes(f.face)||f.move&&!MOVES[f.move]))return false;
  for(const key of ['round','phase','phaseTime','time','elapsed','tick','paused','wins','winner','lastMove'])this[key]=s[key];this.fighters=s.fighters.map(f=>({...f}));return true;
 }
}
