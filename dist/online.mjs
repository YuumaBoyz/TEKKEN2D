export const NET_VERSION=2;
const ROOM_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function normalizeRoomCode(value){
 const code=String(value).toUpperCase().replace(/[^A-Z0-9]/g,'');
 return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(code)?code:null;
}
export function cleanInput(value){return {left:value?.left===true,right:value?.right===true,block:value?.block===true,crouch:value?.crouch===true};}
const errors={
 'peer-unavailable':"Ce salon n'existe plus. Vérifiez le code et demandez à l'hôte de garder le jeu ouvert.",
 'network':'La connexion au service de salons est interrompue. Réessayez.',
 'server-error':'Le service de salons est indisponible. Réessayez dans un instant.',
 'socket-error':'Le réseau bloque la connexion au service de salons.',
 'browser-incompatible':'Ce navigateur ne prend pas en charge le multijoueur WebRTC.',
 'unavailable-id':'Ce code est déjà utilisé. Créez un nouveau salon.'
};
export class PeerRoom{
 constructor({PeerClass=globalThis.Peer,onStatus=()=>{},onMessage=()=>{},onPing=()=>{}}={}){
  this.PeerClass=PeerClass;this.onStatus=onStatus;this.onMessage=onMessage;this.onPing=onPing;this.peer=null;this.conn=null;this.connected=false;this.isHost=false;this.remoteFighter=null;this.code='';this.closing=false;this.sequence=0;this.receivedSequence=-1;this.ping=0;
 }
 async makePeer(id){
  if(!this.PeerClass)throw new Error('Le module réseau est indisponible. Actualisez le jeu.');
  this.closing=false;
  return new Promise((resolve,reject)=>{
   const peer=new this.PeerClass(id,{secure:true,debug:0});this.peer=peer;
   const timeout=setTimeout(()=>{reject(new Error('Le service de salons ne répond pas. Vérifiez votre connexion.'));this.close();},18000);this.peerTimer=timeout;
   peer.on('open',()=>{clearTimeout(timeout);if(peer!==this.peer){reject(new Error('Connexion annulée.'));return;}resolve(peer);});
   peer.on('error',e=>{if(peer!==this.peer)return;clearTimeout(timeout);const message=errors[e.type]||'Connexion impossible. Essayez un autre réseau.';reject(new Error(message));if(!this.closing)this.onStatus('error',message);});
   peer.on('disconnected',()=>{if(peer===this.peer&&!this.closing&&!this.connected)this.onStatus('error','Connexion au salon perdue. Créez un nouveau salon.');});
  });
 }
 async host(fighter){
  this.close();this.isHost=true;this.fighter=fighter;
  const bytes=crypto.getRandomValues(new Uint8Array(8));this.code=[...bytes].map(x=>ROOM_ALPHABET[x%ROOM_ALPHABET.length]).join('');
  this.onStatus('connecting','Création du salon…');
  const peer=await this.makePeer('pixel-dojo-v2-'+this.code);
  peer.on('connection',conn=>{
   if(this.conn||conn.metadata?.v!==NET_VERSION){conn.on('open',()=>{conn.send({v:NET_VERSION,type:'busy',sequence:0});setTimeout(()=>conn.close(),200);});return;}
   this.bind(conn);
  });
  this.onStatus('waiting','Salon ouvert. Partagez le code avec votre ami.');return this.code;
 }
 async join(value,fighter){
  const code=normalizeRoomCode(value);if(!code)throw new Error('Saisissez les 8 caractères du code de salon.');
  this.close();this.isHost=false;this.code=code;this.fighter=fighter;this.onStatus('connecting',"Connexion à l'hôte…");
  const peer=await this.makePeer(undefined);
  this.bind(peer.connect('pixel-dojo-v2-'+code,{reliable:true,serialization:'json',metadata:{v:NET_VERSION}}));
 }
 bind(conn){
  this.conn=conn;
  const timeout=setTimeout(()=>{if(conn===this.conn&&!this.connected){this.onStatus('error','Connexion directe impossible. Essayez un autre réseau ou le duel local.');this.close();}},20000);this.connTimer=timeout;
  conn.on('open',()=>{if(conn!==this.conn){conn.close();return;}this.send('hello',{fighter:this.fighter});});
  conn.on('data',data=>{
   if(conn!==this.conn)return;
   if(!data||data.v!==NET_VERSION||typeof data.type!=='string'||!Number.isInteger(data.sequence)||data.sequence<=this.receivedSequence)return;
   this.receivedSequence=data.sequence;
   if(data.type==='busy'){clearTimeout(timeout);this.onStatus('error','Le salon accueille déjà deux joueurs.');this.close();return;}
   if(data.type==='hello'){
    if(!Number.isInteger(data.fighter)||data.fighter<0||data.fighter>3){this.close();return;}
    this.remoteFighter=data.fighter;this.connected=true;clearTimeout(timeout);this.onStatus('connected','Deux combattants connectés.');
    clearInterval(this.pingTimer);this.pingTimer=setInterval(()=>this.send('ping',{stamp:Date.now()}),1000);return;
   }
   if(data.type==='ping'){if(Number.isFinite(data.stamp))this.send('pong',{stamp:data.stamp});return;}
   if(data.type==='pong'){this.ping=Math.max(0,Math.min(9999,Date.now()-data.stamp));this.onPing(this.ping);return;}
   if(this.connected)this.onMessage(data);
  });
  conn.on('close',()=>{clearTimeout(timeout);if(conn!==this.conn)return;clearInterval(this.pingTimer);if(!this.closing){this.connected=false;this.onStatus('disconnected',"L'autre joueur a quitté le duel.");}});
  conn.on('error',()=>{clearTimeout(timeout);if(conn===this.conn&&!this.closing)this.onStatus('error','La liaison entre les deux joueurs a été interrompue.');});
 }
 send(type,body={}){
  if(this.conn?.open){this.conn.send({v:NET_VERSION,type,...body,sequence:this.sequence++});return true;}return false;
 }
 close(){
  this.closing=true;clearTimeout(this.peerTimer);clearTimeout(this.connTimer);clearInterval(this.pingTimer);this.conn?.close();this.peer?.destroy();this.conn=null;this.peer=null;this.connected=false;this.remoteFighter=null;this.sequence=0;this.receivedSequence=-1;
 }
}
