# Ajouts fondés sur les règles de Tekken

Sources primaires consultées le 13 octobre 2026 :

- [Systèmes de combat officiels de Tekken 8](https://tk8.tekken-official.jp/en/battle/system.php).
- [Équilibrage officiel version 3.00](https://www.bandainamcoent.com/news/tekken-8-patch-notes-v3-00).
- [Politique d'équilibrage version 2.01](https://www.bandainamcoent.com/news/tekken-8-ver-2-01-balance-adjustment-policy).

## Ce que l'analyse apporte au jeu 2D

| Principe observé | Adaptation réalisée |
|---|---|
| Heat est une ressource limitée à une activation par round | Burst de 10 secondes ou Engager de 15 secondes après un launcher réussi. U pendant Heat consomme le reste pour un Smash. |
| La garde et la hauteur d'attaque créent des décisions défensives | Jabs hauts esquivables en s'accroupissant, moyens qui battent la garde basse, balayages bloqués par C+S. |
| Power Crush absorbe certaines attaques | Armure contre hauts et moyens pendant la fenêtre d'armure ; les dégâts restent appliqués. Les coups bas et projections interrompent. |
| Rage renforce le potentiel de retour | À 25 PV ou moins : bonus de dégâts et Rage Art disponible une fois. Startup visible, récupération longue, punissable sur garde. |
| Santé récupérable | Dégâts en l'air, dégâts absorbés et chip pendant Heat alimentent une réserve. Toucher ou forcer la garde rend une partie des PV. |
| Risque/récompense des attaques et punitions | Fenêtres distinctes de startup, activité et récupération ; contre-coup et punition détectés par le moteur. |
| Réduction des avantages excessifs des longs combos | Scaling progressif, seuil de dégâts minimal, limite des relances aériennes. |
| Heat Smash sans wall splat dans la version 3.00 | Smash n'ajoute pas de stun mural. Les coups de pied et Power Crush peuvent produire un impact mural. |
| Practice fournit des outils pour apprendre | Informations de frames, historique de saisies, hitboxes, reset, inversion des côtés et IA activable. |

Les timings, dégâts et commandes sont propres à cette adaptation. Le jeu original est en 3D ; cette version reste un jeu de combat 2D, sans simulation de déplacement latéral en profondeur. Elle ne reproduit pas toute la movelist officielle.

## Multijoueur

Salons à code de 8 caractères, avec copie du code ou du lien et choix de personnage avant connexion. PeerJS 1.5.5 est inclus localement sous sa licence MIT. Le service PeerServer Cloud assure la mise en relation ; les commandes et états du match passent ensuite par WebRTC.

L'hôte simule à 60 pas par seconde et transmet les états à 30 Hz. L'invité transmet ses commandes. Les deux joueurs ont les mêmes ressources, résultats et pauses. Il n'y a pas de rollback ni de matchmaking classé : c'est un duel entre amis. Les données réseau sont limitées aux identifiants temporaires, choix de combattants, entrées et états du jeu.

Les salons accueillent deux joueurs. Les demandes d'un troisième joueur sont rejetées. Les codes périmés, erreurs réseau, déconnexions et sorties de match sont traités dans l'interface. Sans relais TURN configuré, certains réseaux à NAT restrictif peuvent empêcher la connexion. [Limites documentées par PeerJS](https://peerjs.com/client/faq).

Le site demeure privé. Pour une personne n'ayant pas accès à ce site, le propriétaire peut transmettre lui-même le fichier autonome. Aucune modification de l'audience du site n'a été effectuée.

## Vérification

26 tests automatisés couvrent les mécaniques et le protocole de salon. Test réel de deux pages indépendantes : création, connexion WebRTC, lancement, déplacement de l'invité, jab distant faisant passer les PV de l'hôte de 100 à 93 sur les deux écrans, pause/reprise partagées et sortie du joueur avec notification de déconnexion. Second test sur la version finale : Kazuya contre Reina, coup de pied distant faisant passer les PV de Kazuya à 88 sur les deux pages, puis relance du match et retour simultané à 60 secondes.
