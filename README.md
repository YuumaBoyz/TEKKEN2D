# TEKKEN 2D — Pixel Dojo v2.1

Fan game de combat web en pixel art. Neuf personnages : 17 poses pour chacun des quatre originaux, 25 poses pour chacun des cinq nouveaux, six modes jouables répartis dans trois espaces : Combat, Perfectionnement et Histoire & Bonus. HTML/CSS/Canvas et JavaScript ; PeerJS 1.5.5 pour la connexion WebRTC.

## Jouer

Double-cliquer sur **TEKKEN-2D.html** pour jouer dans un navigateur. Les visuels, le code et la bibliothèque réseau sont intégrés au fichier. Les modes locaux fonctionnent sans connexion ; le mode online nécessite Internet.

Pour l'aperçu web :

```sh
npm run dev
```

Ouvrir http://localhost:5173, sélectionner un personnage et un mode, puis entrer dans l'arène. Le son s'active avec SON.

## Menu principal v2.1

- **Combat** : Arcade Classic (8 combats avec dialogues fixes, boss final avec IA difficile, dégâts ×1,35 et dégâts reçus ×0,8), Versus 1v1 local et salons en ligne entre amis.
- **Perfectionnement** : Dojo avec frames, hitboxes rouges et hurtboxes bleues, enregistrement et lecture du mannequin ; trois Défis Combos validés sur les impacts réellement enchaînés (J → K, L → J → K, L → U).
- **Histoire & Bonus** : Les Chroniques de la 2D, courte histoire originale de fan en trois chapitres avec choix de dialogues et duels en un round. Les choix changent l’adversaire et le dernier choix détermine la conclusion.

Team Battle 2v2/3v3, Tag Team, assistances et Tekken Force 2D ont des entrées explicatives **En préparation** ; ces modes ne sont pas jouables. La carte de combattant en ligne permet de conserver un pseudo et une couleur dans le navigateur. Le rang affiche Non classé ; la recherche classée est désactivée, car aucun matchmaking, classement ou rollback n’est implémenté.

Pour enregistrer le mannequin, entrer au dojo, attendre FIGHT puis cliquer **ENREGISTRER P2**. Utiliser les commandes du Joueur 2 (flèches, 1/2/3, etc.), puis arrêter l’enregistrement (10 secondes maximum). **RESET** restaure les positions et conserve la séquence ; **REJOUER P2** la lit une fois. L’IA est désactivée pendant l’enregistrement et la lecture.

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

Les chiffres du clavier principal et du pavé numérique fonctionnent. Les boutons tactiles donnent les mêmes actions. Deux rounds gagnants (un seul en Histoire) ; chaque round dure 60 secondes.

Heat s'active une fois par round : U lance le Burst (10 secondes), ou un launcher réussi lance un Engager (15 secondes). U pendant Heat consomme sa durée restante pour le Smash. Rage Art est disponible à 25 PV ou moins, une fois par round. C esquive les hauts ; C+S bloque les bas, mais laisse passer les moyens. Le Power Crush absorbe les hauts/moyens tout en prenant les dégâts. Les bas et projections l'interrompent. H permet de casser une saisie pendant sa fenêtre de déchoppe.

## Cinq nouveaux combattants

| Combattant | Origine / style | Mécanique |
|---|---|---|
| Noé Volt | France / Parkour × Savate | Double-tap arrière charge 25 points ; à 50, K déclenche un pied plus rapide et puissant. Z près du mur fait rebondir. |
| Sekhem | Égypte / Tahtib à mains nues | O brise la garde avec 4 dégâts et une longue interruption. |
| MIRA-0 | Néo-Tokyo / Systema × CQC | Dash avec esquive des hauts/moyens pendant 0,09 s ; bras télescopique sur J. |
| Veer Singh | Inde / Kushti | Trois protections de sable contre hauts/moyens, recharge avec C immobile ; projection H renforcée et déchoppable. |
| Luca Mirage | Italie / Acrobaties et ruse | J projette une carte à courte portée ; backdash fumigène qui évite les hauts pendant 0,12 s. |

Chaque nouveau combattant possède 25 poses originales : garde et respiration, deux pas, jab en trois phases, pied, launcher en deux phases, gardes basse/haute, impact, K.O., victoire, Power Crush, balayage, saut, dash, projection en deux phases, Heat Burst, Heat Smash, Rage Art et réception. Les animations utilisent les durées réelles des coups. Le lecteur [Sprites & animations](http://localhost:5173/sprite-audit.html) permet de les regarder et d’inverser leur orientation.

Sources PNG sans retouche dans `dist/assets/sprites/*-v3.png`, prompts dans [ASSET_PROMPTS_ROSTER.md](ASSET_PROMPTS_ROSTER.md), découpes calculées par `tools/inspect_roster.py`. Les cartes détachées de Luca sont conservées explicitement sans inclure de fragments voisins. Le protocole online v3 accepte les neuf personnages et synchronise charge, sable et esquives ; les deux joueurs doivent utiliser cette version.

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

### Sprites VFX

12 animations de quatre frames créées avec ImageGen : impacts léger/puissant, garde, poussière, électricité rouge/violette, purification, Rage, traînées de pied/launcher, dash et déchoppe. Les trois PNG transparents sont dans `dist/assets/vfx/` et leurs prompts dans [ASSET_PROMPTS_VFX.md](ASSET_PROMPTS_VFX.md). La page `http://localhost:5173/vfx-audit.html` permet de figer les images, inverser le sens et contrôler la transparence sur fond clair.

Le moteur découpe les rangées mesurées des planches 1254 × 1254, prépare 48 frames en 64 × 64 sans lissage, nettoie les îlots parasites et ancre les effets de sol. Les contacts et traînées utilisent les événements de combat partagés par l'hôte ; les animations se figent en pause et s'effacent au reset. Les VFX peuvent être désactivés dans les paramètres. Le fichier autonome contient également ces images.

```sh
npm test
npm run standalone
```

46 tests automatisés, dont sept couvrant les parcours, le boss, l’enregistrement et la faisabilité des défis. La passe VFX vérifie le nettoyage alpha, les fragments détachés, la pause, la durée de vie, l'ancrage au sol et les événements de frappe. Contrôle navigateur des 48 frames sur damier et fond clair, puis essai d'un launcher avec effets dans le jeu autonome. Captures : `qa/vfx-review.png` et `qa/vfx-combat.png`. Le salon et la synchronisation ont également été testés précédemment à deux pages indépendantes.

Le site à publier est dans `dist/`. Les neuf planches et les quatre balayages séparés des combattants originaux sont dans `dist/assets/sprites/`. La découpe et l'isolation alpha s'effectuent en mémoire pour afficher les poses entières sans fragments voisins ; les fichiers sources générés restent conservés. La bibliothèque PeerJS et sa licence MIT sont dans `dist/vendor/`.

## État de publication de la v2.1

### Déploiement Netlify depuis GitHub

Importer le dépôt `YuumaBoyz/TEKKEN2D` dans Netlify, sélectionner la branche `main` et laisser le dossier de base vide. La configuration versionnée dans `netlify.toml` définit Node 22, la commande `npm test && npm run build` et le dossier publié `dist`. Aucune clé API ni variable secrète n’est nécessaire pour le jeu.

Le build régénère le jeu autonome et vérifie la présence des images, bibliothèques et modules JavaScript publiés. Les 46 tests doivent réussir avant publication. `package-lock.json` permet aussi une installation reproductible avec `npm ci`.

Les fichiers sont revalidés dans le navigateur à chaque nouvelle visite afin de récupérer les mises à jour. Le site utilise des fichiers statiques : les ressources manquantes renvoient une vraie 404, sans fallback HTML qui casserait le chargement des modules. Les pages `/sprite-audit.html`, `/vfx-audit.html` et `/TEKKEN-2D.html` restent disponibles, ainsi que les invitations `/?room=CODE`.

Pour vérifier localement les mêmes étapes :

```sh
npm ci
npm test
npm run build
```

Une fois le dépôt connecté au projet Netlify, les pushes sur `main` déclenchent son pipeline de déploiement selon les paramètres du projet. Voir la [configuration des builds Netlify](https://docs.netlify.com/build/configure-builds/file-based-configuration/).

### Ancienne publication Sites

La v2.1 est prête localement. La dernière tentative de publication a reçu `Sites project not found` pour le projet existant `appgprj_6ace7fdeeae0819190027ee53b2efe9d`. Il faut reconnecter Sites au compte ou à l’espace propriétaire avant de synchroniser et déployer. Ne pas créer un second site ni remplacer cet identifiant pour contourner ce blocage.
