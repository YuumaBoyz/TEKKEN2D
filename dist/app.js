import {Game,FIGHTERS,MOVES,SPECIALS,moveFor} from './engine.mjs';
import {MODE_CATALOG,arcadeOpponent,arcadeDialogue,TRIALS,TrialTracker,InputRecording,STORY} from './modes.mjs';
import {SPRITES,LOW_SPRITES} from './sprite-data.mjs';
import {prepareFrames,animationPose} from './sprite-renderer.mjs';
import {PeerRoom,cleanInput,normalizeRoomCode} from './online.mjs';
import {SpriteVFX} from './vfx.mjs';
import {fighterEnergy} from './vfx-data.mjs';

const $=id=>document.getElementById(id);
const preview=$('preview'),pc=preview.getContext('2d'),canvas=$('game'),ctx=canvas.getContext('2d');
const stage=new Image();stage.src='assets/shrine.png';
const vfx=new SpriteVFX();
const preparedFrames=[],preparedLow=[];
const lowImages=LOW_SPRITES.map(data=>{const im=new Image();im.src=data.file;return im;});
const fighterImages=SPRITES.map(data=>{const im=new Image();im.src=data.file;return im;});
let selected=0,opponent=1,mode='arcade',game=null,screen='lobby',ambience=0,arcadeMatch=1;
let category='combat',storyChapter=0,storyChoice=0,trialIndex=0,trialTracker=null,dummyActions=[];
const recording=new InputRecording();
let identity={alias:'',color:'#ff354e'};
try{const saved=JSON.parse(localStorage.getItem('dojo-identity')||'{}');if(typeof saved.alias==='string')identity.alias=saved.alias.slice(0,20);if(/^#[0-9a-f]{6}$/i.test(saved.color))identity.color=saved.color;}catch{}
let particles=[],shake=0,hitstop=0,time=0,last=0,muted=true,audio=null,nextBeat=0,trainingAI=false,hitboxes=false;
let onlineMatch=false,localPlayer=0,remoteInput={},remoteInputTime=0,netAccumulator=0,netSendTime=0,lastInput='';
let inputHistory=[],modalKind='',roomTab='host',roomOperation=0,feedbackTimer=null;
let settings={vfx:true,difficulty:'normal',volume:.35,shake:true},stats={wins:0,matches:0,bestCombo:0};
try{settings={...settings,...JSON.parse(localStorage.getItem('dojo-settings')||'{}')};stats={...stats,...JSON.parse(localStorage.getItem('dojo-stats')||'{}')};}catch{}
const keys=new Set(),touch=new Set(),taps={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const net=new PeerRoom({onStatus:roomStatus,onMessage:networkMessage,onPing:ping=>{$('network-ping').textContent=`PING ${ping} MS · P2P`;}});
const actionKeys={KeyJ:[0,'jab'],KeyK:[0,'kick'],KeyL:[0,'upper'],KeyU:[0,'heat'],KeyV:[0,'low'],KeyO:[0,'power'],KeyH:[0,'throw'],KeyI:[0,'rage'],KeyZ:[0,'jump'],KeyW:[0,'jump'],Space:[0,'jump'],Numpad1:[1,'jab'],Numpad2:[1,'kick'],Numpad3:[1,'upper'],Numpad0:[1,'heat'],Numpad4:[1,'power'],Numpad6:[1,'throw'],Numpad7:[1,'low'],Numpad9:[1,'rage'],Digit1:[1,'jab'],Digit2:[1,'kick'],Digit3:[1,'upper'],Digit0:[1,'heat'],Digit4:[1,'power'],Digit6:[1,'throw'],Digit7:[1,'low'],Digit9:[1,'rage'],ArrowUp:[1,'jump']};
const movementKeys=['KeyQ','KeyA','KeyD','KeyS','KeyC','ArrowLeft','ArrowRight','ArrowDown','Digit5','Numpad5'];

function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),3000);}
function save(){try{localStorage.setItem('dojo-stats',JSON.stringify(stats));localStorage.setItem('dojo-settings',JSON.stringify(settings));}catch{}}
function initAudio(){if(!audio)try{audio=new (window.AudioContext||window.webkitAudioContext)();}catch{}audio?.resume();}
function tone(freq,duration=.1,type='square',gain=.08,slide=0){
 if(muted||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);
 if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),audio.currentTime+duration);
 g.gain.setValueAtTime(gain*settings.volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);
}
function noise(duration=.13,gain=.2){
 if(muted||!audio)return;const b=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate),data=b.getChannelData(0);
 for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
 const src=audio.createBufferSource(),g=audio.createGain();src.buffer=b;g.gain.value=gain*settings.volume;src.connect(g);g.connect(audio.destination);src.start();
}
function music(){
 if(muted||!audio||screen!=='fight'||game?.paused||audio.currentTime<nextBeat)return;nextBeat=audio.currentTime+.24;
 const notes=[55,55,82.41,55,65.41,55,73.42,82.41];music.beat=(music.beat||0)+1;tone(notes[music.beat%8],.15,'triangle',.08);
 if(music.beat%2===0)tone(110,.08,'sine',.14,-70);if(music.beat%FIGHTERS.length===2)noise(.06,.055);
}
function sprite(c,id,pose,x,y,w=245,h=265,face=1,alpha=1){
 const low=pose===16&&!!LOW_SPRITES[id],data=(low?LOW_SPRITES:SPRITES)[id],im=(low?lowImages:fighterImages)[id],index=low?0:pose,f=data?.frames[index];if(!f||!im.complete||!im.naturalWidth)return;
 // Each source rectangle contains the whole silhouette, even when it crosses a nominal grid cell.
 const scale=h/data.basis;
 c.save();c.imageSmoothingEnabled=false;c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y));c.scale(face,1);
 const frame=(low?preparedLow:preparedFrames)[id]?.[index];if(!frame){c.restore();return;}
 c.drawImage(frame,0,0,f.w,f.h,Math.round((f.x-f.anchorX)*scale),Math.round((f.y-f.baseline)*scale),Math.round(f.w*scale),Math.round(f.h*scale));c.restore();
}
function drawScene(c,t){
 c.imageSmoothingEnabled=false;c.fillStyle='#151020';c.fillRect(0,0,960,540);
 if(stage.complete&&stage.naturalWidth){c.save();if(ambience===1)c.filter='hue-rotate(35deg) saturate(.85)';if(ambience===2)c.filter='hue-rotate(170deg) brightness(.85)';c.drawImage(stage,0,0,960,540);c.restore();}
 c.fillStyle='#b1a9e022';for(let i=0;i<65;i++){const x=(i*137+t*48)%1000,y=(i*79+t*350)%540;c.fillRect(Math.round(x),Math.round(y),1,9);}
 c.fillStyle='#ff989b';c.globalAlpha=.3;for(let i=0;i<12;i++)c.fillRect((i*97+t*12)%1000,90+(i*37+t*20)%270,3,2);c.globalAlpha=1;
}
function shadow(c,x,y=455){c.fillStyle='#05051175';c.beginPath();c.ellipse(x,y,44,8,0,0,Math.PI*2);c.fill();}
function poseFor(f){
 return animationPose(f,{time,phase:game?.phase,winner:game?.winner,index:game?.fighters.indexOf(f),move:moveFor(f)});
}
function drawFighter(c,f,t){
 shadow(c,f.x);const pose=poseFor(f),sy=455-f.y;
 if(f.heatTime>0||f.dashTime>0){for(let i=3;i>0;i--)sprite(c,f.id,pose,f.x-f.face*i*13,sy,245,265,f.face,.07);}
 c.save();if(f.evadeTime>0){c.globalAlpha=.42;if(f.id===6)c.translate(Math.round(Math.sin(t*160)*6),0);}if(f.flash>0)c.filter='brightness(1.7)';
 sprite(c,f.id,pose,f.x,sy,245,265,f.face);c.restore();
 if(f.id===4&&f.charge>=50){c.fillStyle=FIGHTERS[f.id].color;for(let n=0;n<4;n++)c.fillRect(f.x-22+n*13,sy-22-Math.floor(t*70+n*11)%24,3,7);}
 if(f.id===7&&f.sand>=32){c.fillStyle='#e9a55e88';for(let n=0;n<5;n++)c.fillRect(f.x-28+n*12,sy-4,4,2);}
 if(f.id===8&&f.evadeTime>0){c.fillStyle='#b090e566';for(let n=0;n<5;n++)c.fillRect(f.x-45+n*15,sy-70+n%2*20,18,14);}
 if(f.hp<=25&&!f.rageUsed){c.fillStyle=FIGHTERS[f.id].color;c.globalAlpha=.35;for(let i=0;i<6;i++)c.fillRect(f.x-35+i*14,sy-8-(t*70+i*21)%65,2,6);c.globalAlpha=1;}
 if(hitboxes&&mode==='training'){
  c.strokeStyle='#6facff';c.lineWidth=1;c.strokeRect(f.x-27,sy-(f.crouch?90:190),54,f.crouch?90:190);
  if(f.move){const m=moveFor(f);if(f.moveTime>=m.startup&&f.moveTime<m.startup+m.active){c.strokeStyle='#ff7384';c.strokeRect(f.face>0?f.x:f.x-m.range,sy-(m.level==='low'?50:160),m.range,m.level==='low'?45:80);}}
 }
}
function burst(x,y,color,heavy=false,block=false,scale=1){
 const palette=block?'#acdfff':color;
 const count=settings.vfx?(heavy?9:5):(heavy?16:9);
 for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=60+Math.random()*(heavy?240:130);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.12+Math.random()*.2,max:.4,color:i%3===0?'#fff3cc':palette,size:heavy?4:2});}
 if(settings.vfx)vfx.spawn(block?'guard':heavy?'heavy':'hit',x,y,{scale});
}
function combatVFX(e){
 if(!settings.vfx||!game)return;
 const f=game.fighters[e.i],face=e.face||f?.face||1,move=e.attackMove||e.move;
 if(e.type==='swing'){
  if(['kick','low'].includes(e.move))vfx.spawn('kick',e.x+face*60,e.y+(e.move==='low'?55:0),{face,scale:e.move==='low'?.75:1,alpha:.80});
  if(e.move==='upper')vfx.spawn('upper',e.x+face*45,e.y-65,{face});
  if(['heat','smash','rage','power'].includes(e.move))vfx.spawn(fighterEnergy(f.id),e.x+face*50,e.y,{face,scale:e.move==='rage'?1.15:.8,alpha:.85});
 }
 if(e.type==='hit'){
  if(e.armor)vfx.spawn('armor',e.x,e.y,{face});
  if(['upper','smash','rage'].includes(move))vfx.spawn(move==='rage'?'rage':fighterEnergy(f.id),e.x,e.y,{face,scale:move==='smash'?1.20:.85,alpha:.9});
 }
 if(['heat','smash','rage'].includes(e.type)){
  vfx.spawn(e.type==='rage'?'rage':fighterEnergy(f.id),f.x,350-f.y,{face,scale:e.type==='heat'?1.45:1.7,layer:'back',follow:e.i,offsetY:-105,alpha:.9});
 }
 if(e.type==='land')vfx.spawn('dust',e.x,448,{scale:1,layer:'back'});
 if(e.type==='dash'){const dir=e.direction||f.dashDir||face;vfx.spawn('dash',(e.x??f.x)-dir*38,434,{face:dir,layer:'back',alpha:.8});}
 if(e.type==='throwBreak')vfx.spawn('armor',f.x,345-f.y,{scale:1.3});
}
function feedback(text){$('tech-feedback').textContent=text;clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>$('tech-feedback').textContent='',1000);}
function onEvent(e){
 if(onlineMatch&&net.isHost&&net.connected)net.send('event',{event:e});
 combatVFX(e);
 if(e.type==='hit'||e.type==='block'){
  const special=e.type==='hit'&&['upper','smash','rage'].includes(e.attackMove||e.move);
  burst(e.x,e.y,e.color,e.heavy,e.type==='block',special?.65:1);if(settings.shake)shake=e.heavy?9:3;hitstop=e.heavy?.045:.025;
  noise(e.heavy?.18:.08,e.type==='block'?.09:.21);tone(e.heavy?70:135,.12,'sawtooth',.1,-50);
  if(e.guardBreak)feedback('GARDE BRISÉE');else if(e.sand)feedback('SABLE PROTECTEUR');else if(e.counter)feedback('COUNTER HIT');else if(e.punish)feedback('PUNISH');else if(e.armor)feedback('POWER CRUSH');else if(e.level==='low'&&e.type==='block')feedback('LOW BLOCK');
  if(mode==='trial'&&e.i===0&&e.type==='hit'){trialTracker.hit(e.move,e.combo);updateTrial();}
  if(e.i===localPlayer&&e.type==='hit'){stats.bestCombo=Math.max(stats.bestCombo,e.combo);if(e.combo>=2){$('combo-label').textContent=`${e.combo} HIT COMBO\n${e.comboDamage} DAMAGE`;clearTimeout(onEvent.comboTimer);onEvent.comboTimer=setTimeout(()=>$('combo-label').textContent='',1100);}}
 }
 if(['heat','smash','rage'].includes(e.type)){if(!settings.vfx)burst(e.x,365,FIGHTERS[game.fighters[e.i].id].color,true);tone(100,.35,'sawtooth',.12,600);feedback(e.type==='heat'?'HEAT ENGAGED':e.type==='rage'?'RAGE ART':'HEAT SMASH');}
 if(e.type==='noheat'&&e.i===localPlayer)toast('Heat déjà utilisé dans ce round.');
 if(e.type==='norage'&&e.i===localPlayer)toast('Rage Art : disponible à 25 PV ou moins, une fois par round.');
 if(e.type==='throwBreak'){feedback('THROW BREAK');tone(540,.08,'triangle',.1);}
 if(e.type==='fight'){tone(330,.15,'square',.15);tone(660,.25,'square',.12);}
 if(e.type==='roundEnd'){noise(.3,.22);tone(80,.5,'sawtooth',.12,-45);releaseControls();}
 if(e.type==='wall'){burst(e.x,365,'#cfb8cc',true);feedback('WALL HIT');}
 if(e.type==='matchEnd')finish(e.winner);
}
function selectFighter(id){
 selected=id;const f=FIGHTERS[id];$('fighter-index').textContent=`${String(id+1).padStart(2,'0')} / ${String(FIGHTERS.length).padStart(2,'0')}`;$('fighter-first').textContent=f.first;$('fighter-last').textContent=f.last;$('fighter-tag').textContent=f.tag;$('fighter-origin').textContent=f.origin;$('fighter-description').textContent=f.description;$('fighter-style').textContent=f.style;$('fighter-mechanic').textContent=f.mechanic||'Heat, Rage et combos : consultez le guide de combat.';
 ['power','speed','range'].forEach(s=>{$('stat-'+s).innerHTML=Array.from({length:5},(_,i)=>`<i class="stat-segment ${i<f[s]?'filled':''}"></i>`).join('');});
 document.querySelectorAll('.fighter-card').forEach((el,i)=>{el.classList.toggle('selected',id===i);el.setAttribute('aria-pressed',String(id===i));el.querySelector('.card-selected').textContent=id===i?'P1 SELECTED':'';});
 if(opponent===selected){opponent=(selected+1)%FIGHTERS.length;$('opponent').value=opponent;}updateIdentity();tone(480+id*80,.05,'square',.05);
}
function createRoster(){
 $('roster-count').textContent=FIGHTERS.length;
 FIGHTERS.forEach((f,i)=>{const b=document.createElement('button');b.className='fighter-card';b.dataset.kanji=f.kanji;b.setAttribute('aria-label',`${f.first} ${f.last}`);b.innerHTML=`<span class="card-index">0${i+1} / ${f.origin}</span><span class="card-name">${f.first}<br>${f.last}</span><span class="card-style">${f.style}</span><span class="card-selected"></span><canvas width="220" height="250"></canvas>`;b.onclick=()=>selectFighter(i);$('roster').append(b);const o=document.createElement('option');o.value=i;o.textContent=f.first+' '+f.last;$('opponent').append(o);});$('opponent').value=opponent;selectFighter(0);
}
function drawCards(){document.querySelectorAll('.fighter-card canvas').forEach((el,i)=>{const c=el.getContext('2d');c.clearRect(0,0,220,250);sprite(c,i,0,110,246,230,270);});}
lowImages.forEach((im,i)=>{im.onload=()=>{preparedLow[i]=prepareFrames(im,LOW_SPRITES[i]);};im.onerror=()=>toast('Un sprite de balayage ne se charge pas.');});
createRoster();fighterImages.forEach((im,i)=>{im.onload=()=>{preparedFrames[i]=prepareFrames(im,SPRITES[i]);drawCards();};im.onerror=()=>toast('Un sprite ne se charge pas. Actualisez le jeu.');});
function renderMenu(){
 $('mode-cards').innerHTML=MODE_CATALOG.filter(m=>m.group===category).map(m=>`<button class="mode-card ${m.id===mode?'selected':''} ${m.available?'':'planned'}" data-mode="${m.id}" aria-pressed="${m.id===mode}"><span class="mode-number">${m.number} / ${m.available?'JOUABLE':'EN PRÉPARATION'}</span><span class="mode-arrow" aria-hidden="true">${m.available?'↗':'+'}</span><strong>${m.title}</strong><small>${m.tag}</small></button>`).join('');
 document.querySelectorAll('.mode-card').forEach(b=>b.onclick=()=>{const item=MODE_CATALOG.find(m=>m.id===b.dataset.mode);if(item.available)setMode(item.id);else showPlanned(item);});
 document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===category;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active);});
}
function setMode(value){
 const item=MODE_CATALOG.find(m=>m.id===value&&m.available);if(!item)return;
 mode=value;category=item.group;renderMenu();$('mode-title').textContent=item.title;$('mode-description').textContent=item.description;
 $('mode-status').textContent='MODE SÉLECTIONNÉ / '+item.tag;$('launch-mode-label').textContent=item.title;$('launch-detail').textContent=item.tag;
 $('opponent-group').classList.toggle('hidden',!['versus','training','trial'].includes(mode));$('fighter-identity').classList.toggle('hidden',mode!=='online');
 $('start').innerHTML=item.action+' <span>↗</span>';
}
function showPlanned(item){
 modal(`<span class="eyebrow">${item.tag} / EN PRÉPARATION</span><h2 class="modal-title">${item.title}</h2><p class="story-text">${item.description}</p><p class="modal-note">Ce mode n’est pas encore jouable dans cette version.</p>${item.id==='team'?'<ul class="planned-list"><li>Composition des équipes : 2v2 ou 3v3</li><li>Tag Team : relais en combat</li><li>Assistances du partenaire</li></ul>':'<ul class="planned-list"><li>Défilement horizontal</li><li>Vagues de soldats de la G Corp</li><li>Combat 2D avec votre personnage</li></ul>'}`);
}
function updateIdentity(){
 $('identity-name').textContent=identity.alias||'COMBATTANT';$('identity-fighter').textContent=(FIGHTERS[selected].first+' '+FIGHTERS[selected].last).trim();$('identity-card').style.setProperty('--identity-color',identity.color);
}
function saveIdentity(){try{localStorage.setItem('dojo-identity',JSON.stringify(identity));}catch{}updateIdentity();}
function dialogueArt(label){return `<div class="dialogue-art"><canvas id="dialogue-canvas" width="960" height="320" aria-label="${label}"></canvas><span>${label}</span></div>`;}
function drawDialogue(){const c=$('dialogue-canvas')?.getContext('2d');if(!c)return;c.save();c.translate(0,-220);drawScene(c,time);c.restore();sprite(c,selected,0,280,310,245,300);sprite(c,opponent,0,710,310,245,300,-1);}
function interlude(content){
 releaseControls();if(game)game.paused=true;modalKind='interlude';$('modal-content').innerHTML=content;if(!$('modal').open)$('modal').showModal();drawDialogue();
}
function arcadeInterlude(){
 const lines=arcadeDialogue(FIGHTERS[selected].first,FIGHTERS[opponent].first,arcadeMatch);
 interlude(`<span class="eyebrow">ARCADE CLASSIC / ${String(arcadeMatch).padStart(2,'0')} SUR 08${arcadeMatch===8?' / BOSS FINAL':''}</span><h2 class="modal-title">${arcadeMatch===8?'LA DERNIÈRE ÉPREUVE.':'LE PROCHAIN RIVAL.'}</h2>${dialogueArt(FIGHTERS[selected].first+' VS '+FIGHTERS[opponent].first)}<div class="dialogue-lines">${lines.map(l=>`<p><b>${l.speaker}</b>${l.text}</p>`).join('')}</div>${arcadeMatch===8?'<p class="story-reply">Boss : IA difficile, dégâts renforcés et résistance accrue.</p>':''}<button id="dialogue-fight" class="primary-button dialogue-launch">COMBATTRE →</button>`);
 $('dialogue-fight').onclick=()=>{modalKind='';$('modal').close();game.paused=false;};
}
function storyInterlude(){
 const chapter=STORY[storyChapter];opponent=(selected+chapter.choices[storyChoice].rivalOffset)%FIGHTERS.length;
 interlude(`<span class="eyebrow">LES CHRONIQUES DE LA 2D / ${chapter.title}</span><h2 class="modal-title">${chapter.title.slice(5).toUpperCase()}</h2>${dialogueArt('LES CHRONIQUES DE LA 2D')}<p class="story-text">${chapter.text}</p><div class="story-choices">${chapter.choices.map((c,i)=>`<button class="secondary-button" data-choice="${i}">${c.label}</button>`).join('')}</div><p id="story-reply" class="story-reply" role="status"></p><button id="story-fight" class="primary-button dialogue-launch hidden">COMBATTRE · UN ROUND →</button>`);
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{storyChoice=Number(b.dataset.choice);opponent=(selected+chapter.choices[storyChoice].rivalOffset)%FIGHTERS.length;document.querySelectorAll('[data-choice]').forEach(c=>c.setAttribute('aria-pressed',c===b));$('story-reply').textContent=chapter.choices[storyChoice].reply;$('story-fight').classList.remove('hidden');drawDialogue();});
 $('story-fight').onclick=()=>{game=new Game({p1:selected,p2:opponent,mode:'arcade',difficulty:settings.difficulty,roundsToWin:1,onEvent});showMatch();};
}
function updateTrial(){
 const trial=TRIALS[trialIndex];$('trial-number').textContent=`DÉFI ${trialIndex+1} / ${TRIALS.length}`;$('trial-title').textContent=trial.title;$('trial-keys').textContent=trial.keys;$('trial-hint').textContent=trial.hint;
 $('trial-progress').textContent=trialTracker.complete?'RÉUSSI ! Tous les coups ont touché dans le même enchaînement.':`${trialTracker.index} / ${trial.moves.length} coups validés`;
 $('trial-next').disabled=!trialTracker.complete;$('trial-next').textContent=trialIndex===TRIALS.length-1?'TERMINER →':'DÉFI SUIVANT →';
}
function resetTrial(){game.resetFighters();game.fighters[0].x=700;game.fighters[1].x=800;game.lastMove=null;trialTracker=new TrialTracker(TRIALS[trialIndex].moves);particles=[];vfx.clear();releaseControls();updateTrial();}
function updateRecording(){
 const active=recording.state==='recording';$('dummy-record').textContent=active?'ARRÊTER REC':'ENREGISTRER P2';$('dummy-play').textContent=recording.state==='playing'?'ARRÊTER LA LECTURE':'REJOUER P2';$('dummy-play').disabled=!recording.frames.length||active;
 $('dummy-status').textContent=active?`ENREGISTREMENT · ${(recording.frames.length/60).toFixed(1)} / 10 s · Utilisez les commandes J2`:recording.state==='playing'?'LECTURE DU MANNEQUIN':recording.frames.length?`SÉQUENCE : ${(recording.frames.length/60).toFixed(1)} s · Prête à rejouer`:'Mannequin : commandes J2 · 10 s max';
}
function showMatch(){
 screen='fight';initAudio();releaseControls();particles=[];vfx.clear();shake=0;hitstop=0;netAccumulator=0;inputHistory=[];
 $('lobby').classList.add('hidden');$('fight').classList.remove('hidden');$('pause-overlay').classList.add('hidden');$('result-overlay').classList.add('hidden');$('training-strip').classList.toggle('hidden',mode!=='training');$('trial-strip').classList.toggle('hidden',mode!=='trial');recording.stop();recording.frames=[];dummyActions=[];updateRecording();$('network-strip').classList.toggle('hidden',!onlineMatch);
 const [a,b]=game.ids;$('p1-name').textContent=(FIGHTERS[a].first+' '+FIGHTERS[a].last).trim();$('p2-name').textContent=(FIGHTERS[b].first+' '+FIGHTERS[b].last).trim();
 document.querySelector('#fight .hud-names span').textContent=onlineMatch&&localPlayer===1?'ADVERSAIRE':'PLAYER 01';$('p2-type').textContent=onlineMatch?(localPlayer===1?'VOUS':'ADVERSAIRE'):mode==='versus'?'PLAYER 02':'CPU';
 $('match-label').textContent=onlineMatch?`ONLINE / ${formattedCode(net.code)}`:mode==='arcade'?`ARCADE / MATCH 0${arcadeMatch} SUR 08`:mode==='versus'?'VERSUS / 1V1 LOCAL':mode==='story'?`CHRONIQUES / CHAPITRE ${storyChapter+1} SUR 3`:mode==='trial'?'DÉFI COMBOS / PERFECTIONNEMENT':'DOJO / ENTRAÎNEMENT';
 $('network-role').textContent=net.isHost?'VOUS : CÔTÉ GAUCHE · HÔTE':'VOUS : CÔTÉ DROIT · INVITÉ';$('network-ping').textContent='CONNEXION DIRECTE';$('combo-label').textContent='';$('tech-feedback').textContent='';
 $('rematch').disabled=false;$('rematch').textContent=onlineMatch&&!net.isHost?'DEMANDER UNE REVANCHE →':'REJOUER →';
 window.scrollTo({top:0,behavior:'instant'});if($('modal').open){modalKind='';$('modal').close();}
}
function startMatch(reset=true){
 if(mode==='online'&&!onlineMatch){openOnline();return;}
 if(reset){arcadeMatch=1;storyChapter=0;storyChoice=0;trialIndex=0;}
 onlineMatch=false;localPlayer=0;
 if(mode==='story'){storyInterlude();return;}
 if(mode==='arcade')opponent=arcadeOpponent(selected,arcadeMatch);
 game=new Game({p1:selected,p2:opponent,mode:mode==='trial'?'training':mode,difficulty:mode==='arcade'&&arcadeMatch===8?'hard':settings.difficulty,boss:mode==='arcade'&&arcadeMatch===8,onEvent});game.trainingAI=mode==='training'&&trainingAI;showMatch();
 if(mode==='arcade')arcadeInterlude();if(mode==='trial')resetTrial();
}
function beginOnline(config,broadcast=false){
 if(!net.connected)return;
 onlineMatch=true;mode='online';localPlayer=net.isHost?0:1;game=new Game({p1:config.p1,p2:config.p2,mode:'online',onEvent});ambience=config.ambience;
 remoteInput={};remoteInputTime=performance.now();if(broadcast)net.send('start',{config});showMatch();if(net.isHost)net.send('state',{state:game.snapshot()});
}
function lobby(){
 recording.stop();dummyActions=[];if($('modal').open){modalKind='';$('modal').close();}
 if(onlineMatch||net.peer){net.send('bye');net.close();roomOperation++;}onlineMatch=false;localPlayer=0;screen='lobby';game=null;vfx.clear();releaseControls();$('fight').classList.add('hidden');$('lobby').classList.remove('hidden');$('pause-overlay').classList.add('hidden');$('result-overlay').classList.add('hidden');selectFighter(selected);setMode(mode);
}
function finish(winner){
 stats.matches++;if(winner===localPlayer)stats.wins++;save();$('result-overlay').classList.remove('hidden');$('result-title').textContent=winner===localPlayer?'VICTORY':winner===-1?'DRAW':'DEFEAT';
 const name=FIGHTERS[game.fighters[Math.max(0,winner)].id].first;$('result-description').textContent=winner===-1?'Égalité. Le prochain duel vous départagera.':`${name} remporte le match ${game.wins[0]} – ${game.wins[1]}. `+(mode==='arcade'&&winner===0&&arcadeMatch===8?'Vous êtes le King of Iron Fist !':'Chaque combat est une nouvelle leçon.');
 if(mode==='story')$('result-description').textContent=winner===0?(storyChapter===2?(storyChoice===0?'Vous quittez le sanctuaire libre. Votre force vous appartient. FIN.':'Les portes de la G Corp se referment. À l’aube, vos rivaux marchent à vos côtés. FIN.'):'La porte suivante s’ouvre. Votre histoire continue.'):'Votre voyage s’arrête ici pour le moment. Relevez-vous et réessayez ce chapitre.';
 $('result-kicker').textContent=mode==='arcade'&&winner===0&&arcadeMatch===8?'KING OF IRON FIST':'MATCH TERMINÉ';$('rematch').disabled=false;$('rematch').textContent=onlineMatch&&!net.isHost?'DEMANDER UNE REVANCHE →':mode==='arcade'&&winner===0&&arcadeMatch<8?'ADVERSAIRE SUIVANT →':mode==='story'&&winner===0&&storyChapter<2?'CHAPITRE SUIVANT →':mode==='story'&&winner!==0?'RÉESSAYER LE CHAPITRE →':mode==='arcade'&&winner!==0?'RÉESSAYER CE COMBAT →':'REJOUER →';
}
function pause(value,fromNetwork=false){
 if(!game||game.phase==='done')return;
 if(onlineMatch&&!net.isHost&&!fromNetwork){releaseControls();net.send('pauseRequest',{value:!!value});return;}
 game.paused=!!value;$('pause-overlay').classList.toggle('hidden',!value);releaseControls();
 if(onlineMatch&&net.isHost&&!fromNetwork){net.send('pause',{value:!!value});net.send('state',{state:game.snapshot()});}
}
function updateHUD(){
 game.fighters.forEach((f,i)=>{const p='p'+(i+1);$(p+'-trait').textContent=f.id===4?`STATIQUE ${Math.round(f.charge)}%`:f.id===7?`SABLE ${Math.round(f.sand)}%`:f.id===6?(f.evadeTime>0?'GLITCH':'CQC / GLITCH'):f.id===8?(f.evadeTime>0?'FUMÉE':'CARTES / FEINTES'):f.id===5?'ANUBIS / BRISE-GARDE':'';$(p+'-health').style.width=f.hp+'%';$(p+'-ghost').style.width=f.hp+'%';$(p+'-recoverable').style.width=Math.min(100,f.hp+f.recoverable)+'%';$(p+'-heat').style.width=f.heat+'%';$(p+'-rage').textContent=f.hp<=25&&!f.rageUsed?'RAGE READY':'';$(p+'-rounds').textContent=Array.from({length:game.roundsToWin},(_,n)=>game.wins[i]>n?'●':'○').join(' ');});
 $('timer').textContent=game.mode==='training'?'∞':String(Math.ceil(game.time)).padStart(2,'0');$('round').textContent=game.mode==='training'?(mode==='trial'?'TRIAL':'FREE PLAY'):`ROUND 0${game.round}`;
 $('game-banner').textContent=game.phase==='intro'?(game.phaseTime<1.25?`ROUND ${game.round}`:'FIGHT!'):game.phase==='roundEnd'?(game.fighters.some(f=>f.hp===0)?'K.O.':'TIME UP'):'';
 if(mode==='training'&&game.lastMove){const m=game.lastMove;$('frame-data').textContent=`${m.name} · ${m.level.toUpperCase()} · STARTUP ${m.startup}F · ${m.advantage>=0?'+':''}${m.advantage}F ${m.blocked?'SUR GARDE':'SUR HIT'} · ${m.damage} DMG`;}
}
function playerInput(i=0){
 if(i===1)return {left:keys.has('ArrowLeft'),right:keys.has('ArrowRight'),block:keys.has('ArrowDown'),crouch:keys.has('Digit5')||keys.has('Numpad5')};
 return {left:keys.has('KeyQ')||keys.has('KeyA')||touch.has('left'),right:keys.has('KeyD')||touch.has('right'),block:keys.has('KeyS')||touch.has('block'),crouch:keys.has('KeyC')||touch.has('crouch')};
}
function syncInput(force=false){
 if(!onlineMatch||net.isHost||!net.connected)return;
 const input=playerInput(),serialized=JSON.stringify(input),now=performance.now();
 if(force||serialized!==lastInput||now-netSendTime>100){net.send('input',{input});lastInput=serialized;netSendTime=now;}
}
function releaseControls(){keys.clear();touch.clear();syncInput(true);}
function requestAction(index,kind){
 if(!game||game.paused)return;if(index===1&&mode==='training'&&recording.state!=='recording')return;let i=index;
 if(mode==='training'&&index===1)dummyActions.push(kind);
 if(onlineMatch){if(index!==0)return;i=localPlayer;if(!net.isHost){net.send('action',{action:kind});recordInput(kind);return;}}
 if(game.queueAction(i,kind))recordInput(kind);
}
function recordInput(kind){inputHistory.push(MOVES[kind]?.name||kind);inputHistory=inputHistory.slice(-6);$('input-history').textContent=inputHistory.join(' → ');}
function advance(dt){
 if(onlineMatch&&!net.isHost){syncInput();return;}
 if(hitstop>0){hitstop-=dt;return;}
 netAccumulator+=dt;let steps=0;
 while(netAccumulator>=1/60&&steps++<4){
  netAccumulator-=1/60;
  let second=onlineMatch?(performance.now()-remoteInputTime>600?{}:remoteInput):playerInput(1);
  if(mode==='training'&&!game.paused&&game.phase==='fight'){const wasRecording=recording.state==='recording',frame=recording.step(playerInput(1),dummyActions);dummyActions=[];if(frame){second=frame.input;frame.actions.forEach(a=>game.queueAction(1,a));}else if(!wasRecording)second={};updateRecording();}else if(mode==='trial')second={};
  game.update(1/60,[playerInput(),second]);if(onlineMatch&&game.tick%2===0)net.send('state',{state:game.snapshot()});
 }
}
function render(dt){
 time+=dt;if(screen==='lobby'){drawScene(pc,time);shadow(pc,540,476);sprite(pc,selected,Math.floor(time*3)%2,540,478,370,380);return;}
 if(!game)return;advance(dt);ctx.save();
 if(shake>0&&!game.paused){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake=Math.max(0,shake-dt*42);}
 drawScene(ctx,time);vfx.update(dt,game.paused);
 if(settings.vfx){vfx.draw(ctx,'back',game.fighters);game.fighters.forEach((f,i)=>vfx.aura(ctx,f,i,game.elapsed));}
 [...game.fighters].sort((a,b)=>a.y-b.y).forEach(f=>drawFighter(ctx,f,time));
 if(settings.vfx)vfx.draw(ctx,'front',game.fighters);
 particles.forEach(p=>{if(!game.paused){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=240*dt;}
  ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x/2)*2,Math.round(p.y/2)*2,p.size,p.size);
 });particles=particles.filter(p=>p.life>0);ctx.globalAlpha=1;ctx.restore();updateHUD();music();
}
function loop(now){const dt=Math.min((now-last)/1000||.016,.05);last=now;render(dt);requestAnimationFrame(loop);}requestAnimationFrame(loop);

function networkMessage(m){
 if(m.type==='start'&&!net.isHost){const c=m.config;if(c&&Number.isInteger(c.p1)&&c.p1===net.remoteFighter&&c.p2===net.fighter&&Number.isInteger(c.ambience)&&c.ambience>=0&&c.ambience<=2)beginOnline(c);return;}
 if(!onlineMatch||!game)return;
 if(m.type==='input'&&net.isHost){remoteInput=cleanInput(m.input);remoteInputTime=performance.now();}
 else if(m.type==='action'&&net.isHost&&(['jump','dashForward','dashBack',...Object.keys(MOVES).filter(x=>x!=='smash')].includes(m.action)))game.queueAction(1,m.action);
 else if(m.type==='state'&&!net.isHost){if(game.applySnapshot(m.state))$('pause-overlay').classList.toggle('hidden',!game.paused||game.phase==='done');}
 else if(m.type==='event'&&!net.isHost&&m.event&&['hit','block','heat','smash','rage','noheat','norage','throw','throwBreak','fight','roundEnd','round','land','jump','dash','wall','swing','matchEnd'].includes(m.event.type)){const e=m.event;if(e.i!==undefined&&![0,1].includes(e.i))return;if(e.type==='matchEnd'&&![-1,0,1].includes(e.winner))return;if(['heat','smash','rage','wall','hit','block','land','swing'].includes(e.type)&&(!Number.isFinite(e.x)||!Number.isInteger(e.i)))return;if(e.type==='swing'&&!MOVES[e.move])return;onEvent(e);}
 else if(m.type==='pauseRequest'&&net.isHost)pause(m.value===true);
 else if(m.type==='pause'&&!net.isHost)pause(m.value===true,true);
 else if(m.type==='rematch'&&net.isHost)toast('Votre adversaire demande une revanche. Appuyez sur REJOUER.');
 else if(m.type==='bye'){net.close();roomStatus('disconnected',"L'adversaire a quitté le duel.");}
}
function roomStatus(status,message){
 if($('room-status')){$('room-status').className='room-status '+status;$('room-status-text').textContent=message;}
 if(status==='error'&&$('room-fighter'))$('room-fighter').disabled=false;
 if(status==='connected'){
  if($('room-opponent'))$('room-opponent').textContent=FIGHTERS[net.remoteFighter].first;
  if($('room-launch')){$('room-launch').disabled=!net.isHost;$('room-launch').textContent=net.isHost?'LANCER LE DUEL →':"EN ATTENTE DU LANCEMENT PAR L'HÔTE";}
 }
 if((status==='error'||status==='disconnected')&&onlineMatch){
  game.paused=true;$('pause-overlay').classList.add('hidden');$('result-overlay').classList.remove('hidden');$('result-title').textContent='DISCONNECTED';$('result-kicker').textContent='DUEL INTERROMPU';$('result-description').textContent=message;$('rematch').textContent='RETOUR AU SALON →';$('rematch').disabled=false;
 }else if(status==='error')toast(message);
}
function formattedCode(code){return code?code.slice(0,4)+'-'+code.slice(4):'––––-––––';}
function onlineContent(){
 return `<span class="eyebrow">ONLINE / DUEL ENTRE AMIS</span><h2 class="modal-title">FIGHT TOGETHER.</h2><div class="online-tabs"><button id="room-host-tab" class="${roomTab==='host'?'selected':''}">CRÉER UN SALON</button><button id="room-join-tab" class="${roomTab==='join'?'selected':''}">REJOINDRE</button></div><div id="room-status" class="room-status"><i></i><span id="room-status-text">Choisissez votre combattant avant de créer ou rejoindre un salon.</span></div><div id="room-host-panel" class="${roomTab==='host'?'':'hidden'}"><span class="room-label">CODE À PARTAGER</span><div class="room-code" id="room-code">––––-––––</div><div class="room-buttons"><button id="room-create" class="primary-button">CRÉER LE SALON</button><button id="room-copy" class="secondary-button" disabled>COPIER LE CODE</button><button id="room-link" class="secondary-button" disabled>COPIER LE LIEN</button></div></div><div id="room-join-panel" class="${roomTab==='join'?'':'hidden'}"><label class="room-label" for="room-input">CODE DU SALON DE VOTRE AMI</label><input id="room-input" class="room-input" placeholder="ABCD-EFGH" maxlength="9" autocomplete="off" spellcheck="false"><button id="room-join" class="primary-button room-launch">REJOINDRE LE DUEL →</button></div><div class="room-players"><div><label for="room-fighter">VOUS </label><select id="room-fighter">${FIGHTERS.map((f,i)=>`<option value="${i}" ${i===selected?'selected':''}>${f.first}</option>`).join('')}</select></div><div>ADVERSAIRE <span id="room-opponent">EN ATTENTE</span></div></div><button id="room-launch" class="primary-button room-launch" disabled>EN ATTENTE D'UN ADVERSAIRE</button><p class="room-note">Deux appareils, un code. Chaque joueur utilise Q/D et J/K/L ; les commandes tactiles fonctionnent aussi. Gardez le jeu ouvert pendant le duel.<br>Votre ami doit avoir accès au site privé, ou utiliser <a href="TEKKEN-2D.html" download>la version autonome</a>. Une connexion directe peut être bloquée par certains réseaux.</p>`;
}
function openOnline(){
 if(screen==='fight')lobby();net.close();onlineMatch=false;setMode('online');modalKind='online';$('modal-content').innerHTML=onlineContent();$('modal').showModal();bindRoomUI();
}
function bindRoomUI(){
 $('room-fighter').onchange=e=>selectFighter(Number(e.target.value));
 $('room-host-tab').onclick=()=>switchRoomTab('host');$('room-join-tab').onclick=()=>switchRoomTab('join');
 $('room-create').onclick=async()=>{
  const operation=++roomOperation;$('room-create').disabled=true;$('room-fighter').disabled=true;
  try{const code=await net.host(selected);if(operation!==roomOperation)return;$('room-code').textContent=formattedCode(code);$('room-copy').disabled=false;$('room-link').disabled=false;}
  catch(e){if(operation===roomOperation)roomStatus('error',e.message);}finally{if($('room-create')&&operation===roomOperation)$('room-create').disabled=false;}
 };
 $('room-join').onclick=async()=>{const operation=++roomOperation;$('room-join').disabled=true;$('room-fighter').disabled=true;try{await net.join($('room-input').value,selected);}catch(e){if(operation===roomOperation)roomStatus('error',e.message);}finally{if($('room-join')&&operation===roomOperation)$('room-join').disabled=false;}};
 $('room-copy').onclick=()=>copyText(formattedCode(net.code));$('room-link').onclick=()=>copyText(location.protocol==='file:'?formattedCode(net.code):location.origin+'/?room='+net.code);
 $('room-launch').onclick=()=>{if(net.isHost&&net.connected)beginOnline({p1:net.fighter,p2:net.remoteFighter,ambience},true);};
}
function switchRoomTab(value){net.close();roomOperation++;roomTab=value;$('modal-content').innerHTML=onlineContent();bindRoomUI();}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('Copié. Envoyez-le à votre ami.');}catch{toast('Sélectionnez le code affiché puis copiez-le.');}}
function closeModal(){const wasInterlude=modalKind==='interlude';if(modalKind==='online'&&!onlineMatch){net.close();roomOperation++;}modalKind='';$('modal').close();if(wasInterlude)lobby();}
function modal(content){if(screen==='fight'&&game.phase!=='done')pause(true);modalKind='guide';$('modal-content').innerHTML=content;$('modal').showModal();}

window.addEventListener('keydown',e=>{
 if(e.target.matches('input,select,textarea')||$('modal').open)return;
 if(e.code==='Escape'){e.preventDefault();if(screen==='fight')pause(!game.paused);return;}
 if(screen==='lobby'){if(e.code==='ArrowRight')selectFighter((selected+1)%FIGHTERS.length);if(e.code==='ArrowLeft')selectFighter((selected+FIGHTERS.length-1)%FIGHTERS.length);if(e.code==='Enter'&&e.target===document.body){e.preventDefault();startMatch();}return;}
 if(actionKeys[e.code]||movementKeys.includes(e.code)){
  e.preventDefault();keys.add(e.code);syncInput();
  if(!e.repeat&&actionKeys[e.code]){const [i,a]=actionKeys[e.code];if(i===0||mode==='versus'||mode==='training'&&recording.state==='recording')requestAction(i,a);}
  if(!e.repeat&&['KeyQ','KeyA','KeyD','ArrowLeft','ArrowRight'].includes(e.code)){
   const i=e.code.startsWith('Arrow')?1:0;if(!onlineMatch||i===0){const now=performance.now(),f=game.fighters[onlineMatch?localPlayer:i];if(taps[e.code]&&now-taps[e.code]<230){const dir=['KeyD','ArrowRight'].includes(e.code)?1:-1;requestAction(i,dir===f.face?'dashForward':'dashBack');}taps[e.code]=now;}
  }
 }
});
window.addEventListener('keyup',e=>{keys.delete(e.code);syncInput();});
window.addEventListener('blur',()=>{releaseControls();if(screen==='fight'&&!onlineMatch)pause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='fight'){releaseControls();if(!onlineMatch||net.isHost)pause(true);}});
document.querySelectorAll('[data-hold],[data-action]').forEach(b=>{
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);initAudio();if(b.dataset.hold){touch.add(b.dataset.hold);syncInput();}if(b.dataset.action)requestAction(0,b.dataset.action);});
 const release=()=>{if(b.dataset.hold){touch.delete(b.dataset.hold);syncInput();}};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$('opponent').onchange=e=>opponent=Number(e.target.value);
$('start').onclick=()=>startMatch();$('back-lobby').onclick=lobby;$('pause').onclick=()=>pause(true);$('resume').onclick=()=>pause(false);
$('restart').onclick=()=>{if(onlineMatch){if(net.isHost)beginOnline({p1:net.fighter,p2:net.remoteFighter,ambience},true);else{net.send('rematch');toast("Demande envoyée à l'hôte.");}}else startMatch(false);};$('quit').onclick=lobby;$('result-quit').onclick=lobby;
$('rematch').onclick=()=>{
 if(onlineMatch){if(!net.connected){lobby();openOnline();}else if(net.isHost)beginOnline({p1:net.fighter,p2:net.remoteFighter,ambience},true);else{net.send('rematch');$('rematch').textContent="EN ATTENTE DE L'HÔTE";$('rematch').disabled=true;}return;}
 if(mode==='arcade'&&game.winner===0&&arcadeMatch<8){arcadeMatch++;startMatch(false);}else if(mode==='arcade'&&game.winner!==0)startMatch(false);else if(mode==='story'&&game.winner===0&&storyChapter<2){storyChapter++;storyChoice=0;storyInterlude();}else if(mode==='story'&&game.winner!==0)storyInterlude();else startMatch();
};
$('stage-switch').onclick=()=>{ambience=(ambience+1)%3;toast(['Ambiance : clair de lune','Ambiance : brume pourpre','Ambiance : nuit électrique'][ambience]);};
$('training-reset').onclick=()=>{recording.stop();dummyActions=[];releaseControls();updateRecording();game.resetFighters();game.lastMove=null;inputHistory=[];$('input-history').textContent='';particles=[];vfx.clear();toast('Positions, Heat et Rage réinitialisés.');};
$('training-ai').onclick=()=>{recording.stop();dummyActions=[];updateRecording();trainingAI=!trainingAI;game.trainingAI=trainingAI;$('training-ai').textContent='IA : '+(trainingAI?'ON':'OFF');};
$('training-side').onclick=()=>{[game.fighters[0].x,game.fighters[1].x]=[game.fighters[1].x,game.fighters[0].x];game.fighters.forEach((f,i)=>f.face=game.fighters[1-i].x>f.x?1:-1);};
$('hitboxes-toggle').onclick=()=>{hitboxes=!hitboxes;$('hitboxes-toggle').textContent='HITBOXES : '+(hitboxes?'ON':'OFF');};
$('sound-toggle').onclick=()=>{initAudio();muted=!muted;$('sound-state').textContent=muted?'OFF':'ON';$('sound-toggle').setAttribute('aria-label',muted?'Activer le son':'Couper le son');tone(660,.1,'square',.1);};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Le plein écran est indisponible dans ce navigateur.');}};
$('modal-close').onclick=closeModal;$('modal').addEventListener('cancel',e=>{e.preventDefault();closeModal();});$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal();});
const row=(label,key)=>`<div class="guide-row"><span>${label}</span><span>${key.split(' ').map(k=>`<kbd>${k}</kbd>`).join('')}</span></div>`;
function guide(){modal(`<span class="eyebrow">LE DOJO / GUIDE DE COMBAT</span><h2 class="modal-title">MASTER YOUR MOVES.</h2><div class="guide-grid"><div><h3>JOUEUR 01 / ONLINE</h3>${row('Déplacement / double-tap dash','Q D')}${row('Saut','Z')}${row('Garde debout','S')}${row('Accroupir / garde basse','C C+S')}${row('Jab / pied / launcher','J K L')}${row('Balayage bas','V')}${row('Power Crush','O')}${row('Projection / déchoppe','H')}${row('Heat Burst / Smash','U')}${row('Rage Art','I')}</div><div><h3>JOUEUR 02 LOCAL</h3>${row('Déplacement','← →')}${row('Saut','↑')}${row('Garde debout','↓')}${row('Accroupir / garde basse','5 5+↓')}${row('Jab / pied / launcher','1 2 3')}${row('Balayage bas','7')}${row('Power Crush','4')}${row('Projection / déchoppe','6')}${row('Heat Burst / Smash','0')}${row('Rage Art','9')}</div></div><p class="modal-note"><b>Heat :</b> une activation par round. U active le Burst pendant 10 secondes ; un launcher L qui touche active un Engager pendant 15 secondes. U pendant Heat déclenche le Smash et consomme le reste du temps.<br><b>Rage :</b> à 25 PV ou moins, I déclenche une Rage Art une fois par round. Elle est puissante mais très punissable sur garde.<br><b>Défense :</b> C évite les attaques hautes. C+S bloque les balayages, mais laisse passer les coups moyens. Power Crush absorbe les coups hauts/moyens ; les balayages et projections interrompent son armure.<br><b>Projections :</b> H à courte portée ; H pendant la saisie permet de se libérer.<br><b>Combos :</b> J → J → K ou L → J → K. Une petite fenêtre de saisie en récupération facilite les enchaînements. Les dégâts diminuent à chaque coup ; les jugglés finissent par retomber.<br><b>En ligne :</b> les deux joueurs utilisent les touches du Joueur 01. L'hôte simule le match et synchronise les deux écrans. Le duel local utilise un seul clavier. Deux rounds gagnants, 60 secondes par round.</p>`);}
$('nav-guide').onclick=guide;$('help-link').onclick=guide;$('nav-play').onclick=lobby;
$('nav-stats').onclick=()=>modal(`<span class="eyebrow">VOTRE PARCOURS / SAUVEGARDE LOCALE</span><h2 class="modal-title">FIGHTER RECORD.</h2><div class="score-grid"><div><strong>${stats.matches}</strong><span>MATCHS JOUÉS</span></div><div><strong>${stats.wins}</strong><span>VICTOIRES</span></div><div><strong>${stats.bestCombo}</strong><span>MEILLEUR COMBO</span></div></div><p class="modal-note">Votre progression reste enregistrée dans ce navigateur.</p>`);
$('nav-settings').onclick=()=>{modal(`<span class="eyebrow">AJUSTEZ VOTRE EXPÉRIENCE</span><h2 class="modal-title">GAME SETTINGS.</h2><label class="settings-row">Difficulté de l'IA<select id="difficulty"><option value="easy">Facile</option><option value="normal">Normale</option><option value="hard">Difficile</option></select></label><label class="settings-row">Volume<input id="volume" aria-label="Volume" type="range" min="0" max="1" step=".05" value="${settings.volume}"></label><label class="settings-row">Secousses d'impact<input id="shake-option" type="checkbox" ${settings.shake?'checked':''}></label><label class="settings-row">Sprites VFX animés<input id="vfx-option" type="checkbox" ${settings.vfx?'checked':''}></label><p class="modal-note">La difficulté s'applique au prochain match. Le son s'active avec SON en haut de l'écran.</p>`);$('difficulty').value=settings.difficulty;$('difficulty').onchange=e=>{settings.difficulty=e.target.value;save();};$('volume').oninput=e=>{settings.volume=Number(e.target.value);save();};$('shake-option').onchange=e=>{settings.shake=e.target.checked;save();};$('vfx-option').onchange=e=>{settings.vfx=e.target.checked;vfx.clear();save();};};
document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>setMode(MODE_CATALOG.find(m=>m.group===b.dataset.category&&m.available).id));
$('fighter-alias').value=identity.alias;$('fighter-color').value=identity.color;
$('fighter-alias').oninput=e=>{identity.alias=e.target.value.slice(0,20);saveIdentity();};$('fighter-color').oninput=e=>{identity.color=e.target.value;saveIdentity();};
$('dummy-record').onclick=()=>{if(recording.state==='recording')recording.stop();else{if(game.phase!=='fight'){toast('Attendez le début du combat pour enregistrer.');return;}trainingAI=false;game.trainingAI=false;$('training-ai').textContent='IA : OFF';recording.record();}dummyActions=[];releaseControls();updateRecording();};
$('dummy-play').onclick=()=>{if(recording.state==='playing')recording.stop();else{trainingAI=false;game.trainingAI=false;$('training-ai').textContent='IA : OFF';recording.play();}dummyActions=[];releaseControls();updateRecording();};
$('trial-reset').onclick=resetTrial;$('trial-next').onclick=()=>{if(!trialTracker.complete)return;if(trialIndex===TRIALS.length-1){lobby();toast('Les trois défis sont réussis. Bravo !');}else{trialIndex++;resetTrial();}};
setMode(mode);
const invitedRoom=normalizeRoomCode(new URLSearchParams(location.search).get('room')||'');
if(invitedRoom){roomTab='join';setMode('online');openOnline();$('room-input').value=formattedCode(invitedRoom);}
window.dojo={getState:()=>({screen,selected,category,arcadeMatch,storyChapter,trialIndex,trialProgress:trialTracker?.index,trialComplete:trialTracker?.complete,recording:recording.state,recordedFrames:recording.frames.length,mode,phase:game?.phase,paused:game?.paused,time:game?.time,wins:game?.wins,online:onlineMatch,vfx:vfx.getState(),role:net.isHost?'host':'guest',connected:net.connected,ping:net.ping,fighters:game?.fighters.map(f=>({id:f.id,x:f.x,y:f.y,hp:f.hp,heat:f.heat,state:f.state}))})};
