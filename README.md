# TEKKEN 2D — Pixel Dojo v2

Fan game de combat web en pixel art. Quatre personnages, 17 poses chacun, quatre modes : arcade, versus local, dojo et duel en ligne. HTML/CSS/Canvas et JavaScript ; PeerJS 1.5.5 pour la connexion WebRTC.

## Jouer

Double-cliquer sur **TEKKEN-2D.html** pour jouer dans un navigateur. Les visuels, le code et la bibliothèque réseau sont intégrés au fichier. Les modes locaux fonctionnent sans connexion ; le mode online nécessite Internet.

Pour l'aperçu web :

```sh
npm run dev
```

Ouvrir http://localhost:5173, sélectionner un personnage et un mode, puis entrer dans l'arène. Le son s'active avec SON.

## Commandes

| Action | Joueur 1 et chaque joueur online | Joueur 2 local |
|---|---|---|
| Déplacement | Q / D (A / D aussi) | ← / → |
| Dash / backdash | Double pression sur une direction | Double pression sur une direction |
| Saut | Z, W ou Espace | ↑ |
| Garde debout | S | ↓ |
| Accroupir / garde basse | C / C+S | 5 / 5+↓ |
| Jab / pied / launcher | J / K / L | 1 / 2 / 3 |
| Balayage | V | 7 |
| Power Crush | O | 4 |
| Projection / déchoppe | H | 6 |
| Heat Burst / Heat Smash | U | 0 |
| Rage Art | I | 9 |
| Pause | Échap | Échap |

Les chiffres du clavier principal et du pavé numérique fonctionnent. Les boutons tactiles donnent les mêmes actions. Deux rounds gagnants ; chaque round dure 60 secondes.

Heat s'active une fois par round : U lance le Burst (10 secondes), ou un launcher réussi lance un Engager (15 secondes). U pendant Heat consomme sa durée restante pour le Smash. Rage Art est disponible à 25 PV ou moins, une fois par round. C esquive les hauts ; C+S bloque les bas, mais laisse passer les moyens. Le Power Crush absorbe les hauts/moyens tout en prenant les dégâts. Les bas et projections l'interrompent. H permet de casser une saisie pendant sa fenêtre de déchoppe.

## Multijoueur en ligne

1. Les deux joueurs choisissent leur personnage.
2. L'hôte ouvre ONLINE, crée un salon et partage le code de 8 caractères ou le lien.
3. L'invité choisit REJOINDRE et saisit le code.
4. Après connexion, l'hôte lance le duel. Chacun utilise les touches du Joueur 1.
5. Pause/reprise et résultats sont synchronisés. L'hôte peut relancer ; l'invité peut demander une revanche. Quitter le duel informe l'autre joueur.

PeerServer Cloud met les deux navigateurs en relation. Le match passe par une liaison WebRTC ; l'hôte simule à 60 pas/seconde et partage les états à 30 Hz. Sans relais TURN, certains NAT restrictifs peuvent empêcher la connexion. Le jeu ne propose pas de rollback ni de classement en ligne.

Le site conserve son accès privé. Un ami sans accès peut utiliser le fichier autonome que le propriétaire lui transmet lui-même. Le fichier est également disponible à télécharger dans le panneau ONLINE du site privé.

## Dojo et nouveaux systèmes

Contre-coups, punitions, récupération de PV, scaling des combos, relances aériennes limitées et impacts muraux. Le dojo affiche les frames du dernier coup, l'historique des saisies et les hitboxes, avec reset, inversion des côtés et IA activable.

- [Analyse et sources officielles](TEKKEN_ANALYSIS.md).
- [Rapport du contrôle des sprites](SPRITE_REVIEW.md).
- [Prompts ImageGen v2](ASSET_PROMPTS_V2.md).
- Contrôle visuel interactif : http://localhost:5173/sprite-audit.html.

## Vérification et fichiers

```sh
npm test
npm run standalone
```

26 tests automatisés, plus un test réel à deux pages indépendantes du salon, des commandes distantes, des dégâts identiques, de la pause/reprise et de la déconnexion. Les captures de contrôle sont dans `qa/`.

Le site à publier est dans `dist/`. Les quatre planches et leurs quatre balayages sont dans `dist/assets/sprites/`. La découpe et l'isolation alpha s'effectuent en mémoire pour afficher les poses entières sans fragments voisins ; les fichiers sources générés restent conservés. La bibliothèque PeerJS et sa licence MIT sont dans `dist/vendor/`.

## État de publication de la v2

La v2 est prête localement. La dernière tentative de publication a reçu `Sites project not found` pour le projet existant `appgprj_6ace7fdeeae0819190027ee53b2efe9d`. Il faut reconnecter Sites au compte ou à l’espace propriétaire avant de synchroniser et déployer. Ne pas créer un second site ni remplacer cet identifiant pour contourner ce blocage.
