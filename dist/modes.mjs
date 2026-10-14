export const MODE_CATALOG=[
 {id:'arcade',group:'combat',number:'01',title:'Arcade Classic',tag:'8 COMBATS',description:'Huit duels, des dialogues entre rivaux et un boss final renforcé. Le parcours rétro par excellence.',action:'LANCER LE PARCOURS',available:true},
 {id:'versus',group:'combat',number:'02',title:'Versus / Local',tag:'1V1 STANDARD',description:'Deux joueurs, un clavier. Choisissez vos combattants et réglez vos comptes dans l’arène.',action:'LANCER LE DUEL',available:true},
 {id:'team',group:'combat',number:'03',title:'Team Battle',tag:'2V2 / 3V3 · À VENIR',description:'Le projet : composer une équipe, appeler des assistances et passer le relais avec le Tag Team.',available:false},
 {id:'online',group:'combat',number:'04',title:'Combat en ligne',tag:'SALONS ENTRE AMIS',description:'Votre carte de combattant et un salon à partager. Connexion P2P ; rollback et matchmaking à développer.',action:'OUVRIR LE SALON',available:true},
 {id:'training',group:'training',number:'05',title:'Dojo / Training Room',tag:'LABORATOIRE DE COMBAT',description:'Distances, frames, hitboxes rouges et hurtboxes bleues. Enregistrez le mannequin puis rejouez ses attaques.',action:'ENTRER AU DOJO',available:true},
 {id:'trial',group:'training',number:'06',title:'Défi Combos',tag:'3 DÉFIS PROGRESSIFS',description:'Apprenez vos enchaînements, du jab au launcher suivi d’un Heat Smash. Chaque coup doit toucher.',action:'RELEVER LE DÉFI',available:true},
 {id:'story',group:'story',number:'07',title:'Les Chroniques de la 2D',tag:'HISTOIRE COURTE · 3 CHAPITRES',description:'Une rivalité sous la pluie, des choix de dialogues et des combats en un seul round. Une histoire originale de fan.',action:'OUVRIR LES CHRONIQUES',available:true},
 {id:'force',group:'story',number:'08',title:'Tekken Force 2D',tag:'BONUS · À VENIR',description:'Le projet : un beat ’em up horizontal à travers les rangs de la G Corp, avec des vagues de soldats.',available:false}
];

export function arcadeOpponent(selected,match){
 const rivals=[0,1,2,3].filter(id=>id!==selected),boss=selected===1?3:1;
 return match===8?boss:rivals[(match-1)%rivals.length];
}
export function arcadeDialogue(hero,rival,match){
 const lines=[
  ['Le tournoi commence ici. Je suis prêt.','Alors montre-moi ce dont tu es capable.'],
  ['Un combat de plus. Un pas vers la vérité.','La vérité se mérite, dans l’arène.'],
  ['Je reconnais cette garde. Tu as changé.','Et toi ? Prouve-le.'],
  ['La fatigue ne décidera pas à ma place.','Voyons combien de temps ta volonté tiendra.'],
  ['Le chemin se resserre. Je ne reculerai plus.','Il ne reste de place que pour l’un de nous.'],
  ['Chaque rival m’a appris quelque chose.','Alors utilise-le. Je ne retiendrai pas mes coups.'],
  ['La finale est derrière cette porte.','Tu devras d’abord me dépasser.'],
  ['C’est ici que le cycle prend fin.','Tu prétends me défier ? Affronte toute ma puissance.']
 ];
 return [{speaker:hero,text:lines[match-1][0]},{speaker:rival,text:lines[match-1][1]}];
}
export const TRIALS=[
 {title:'Les fondamentaux',moves:['jab','kick'],keys:'J → K',hint:'À courte portée, enchaînez un jab et un pied. Attendez la récupération du jab ou saisissez K juste avant sa fin.'},
 {title:'La relance',moves:['upper','jab','kick'],keys:'L → J → K',hint:'Le launcher active Heat s’il touche. Laissez votre personnage récupérer, puis enchaînez jab et pied.'},
 {title:'La frappe décisive',moves:['upper','heat'],keys:'L → U',hint:'Touchez avec le launcher pour activer Heat, puis utilisez U pour déclencher le Heat Smash.'}
];
export class TrialTracker{
 constructor(moves){this.moves=moves;this.index=0;this.lastCombo=0;this.complete=false;}
 hit(move,combo){
  if(this.complete)return true;
  if(combo<=this.lastCombo)this.index=0;
  this.index=move===this.moves[this.index]?this.index+1:move===this.moves[0]?1:0;
  this.lastCombo=combo;this.complete=this.index===this.moves.length;return this.complete;
 }
}
export class InputRecording{
 constructor(limit=600){this.limit=limit;this.frames=[];this.state='idle';this.cursor=0;}
 record(){this.frames=[];this.cursor=0;this.state='recording';}
 stop(){this.state='idle';this.cursor=0;}
 play(){if(!this.frames.length)return false;this.cursor=0;this.state='playing';return true;}
 step(input={},actions=[]){
  if(this.state==='recording'){
   this.frames.push({input:{...input},actions:[...actions]});
   if(this.frames.length>=this.limit)this.stop();return null;
  }
  if(this.state==='playing'){const frame=this.frames[this.cursor++];if(this.cursor>=this.frames.length)this.stop();return frame;}
  return null;
 }
}
export const STORY=[
 {title:'01 / Le sanctuaire',text:'Minuit. Les lanternes tremblent sous la pluie. Un message de la G Corp vous conduit au sanctuaire : « Le tournoi n’était que le début. » Une silhouette vous attend au pied des marches.',choices:[{label:'« Je veux des réponses. »',reply:'Votre rival baisse les yeux : « Alors gagne-les. »',rivalOffset:1},{label:'« Je protégerai ce lieu. »',reply:'La silhouette relève sa garde : « Montre-moi ta détermination. »',rivalOffset:2}]},
 {title:'02 / Le prix de la force',text:'Après le duel, une enveloppe glisse sur les dalles. Elle porte le sceau Mishima. Derrière les portes du sanctuaire, un autre combattant vous barre la route.',choices:[{label:'Ouvrir l’enveloppe.',reply:'Une seule phrase : « La force sans choix n’est qu’une prison. » Vous avancez.',rivalOffset:2},{label:'Demander l’aide du rival.',reply:'« Je garde la sortie. Va chercher tes réponses. » Un accord silencieux est conclu.',rivalOffset:3}]},
 {title:'03 / Briser le cycle',text:'À l’aube, la dernière porte s’ouvre. Le commanditaire vous attend. Il offre la puissance en échange de votre loyauté. Cette fois, le choix vous appartient.',choices:[{label:'« Ma force m’appartient. »',reply:'« Alors prouve que tu peux porter ce choix. » Le dernier duel commence.',rivalOffset:1},{label:'« Personne ne combattra plus pour vous. »',reply:'Vous déchirez l’enveloppe. Il ne reste plus que le bruit de la pluie et deux gardes levées.',rivalOffset:3}]}
];
