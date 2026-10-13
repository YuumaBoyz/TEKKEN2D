# TEKKEN 2D — Pixel Dojo

Jeu de combat web jouable, fan game inspiré de Tekken. HTML/CSS, Canvas 2D et JavaScript sans dépendance de production.

## Jouer en local

Double-cliquer sur **TEKKEN-2D.html** pour jouer directement dans un navigateur, sans serveur. Les sprites et le décor sont intégrés dans ce fichier autonome. Pour le régénérer : `node build-standalone.mjs`.

Autre option : le serveur local.

```sh
npm run dev
```

Ouvrir http://localhost:5173. Choisir un combattant, un adversaire, un mode puis **ENTER THE ARENA**. Activer le son dans la barre supérieure. Il est désactivé au départ pour respecter les règles des navigateurs.

## Modes et contenu

- Jin, Kazuya, Jun et Reina, chacun avec ses valeurs de puissance, vitesse et portée.
- Arcade : trois adversaires, deux rounds gagnants par match, 60 secondes par round.
- Versus : deux joueurs sur le même clavier.
- Dojo : jauge Heat pleine au départ, adversaire réinitialisé à zéro PV, IA activable et reset manuel.
- Trois ambiances colorées du même décor, sprites animés, pluie, particules, impacts, traînées, secousses, sons synthétisés et musique rythmique.
- Pause, revanche, paramètres de difficulté/volume, commandes tactiles, plein écran et statistiques locales.

| Action | Joueur 1 | Joueur 2 |
|---|---|---|
| Déplacement | Q / D (A / D aussi) | ← / → |
| Saut | Z, W ou Espace | ↑ |
| Garde | S maintenu | ↓ maintenu |
| Poing | J | 1 |
| Pied | K | 2 |
| Launcher | L | 3 |
| Heat Burst | U | 0 |
| Pause | Échap | Échap |

J → J → K ou L → J → K enchaînés après la récupération de chaque attaque. La jauge Heat se remplit avec les coups donnés et reçus ; le Burst coûte 100 %. Les chiffres du clavier principal et du pavé numérique fonctionnent.

## Vérification

```sh
npm test
```

Neuf tests du moteur : dégâts et portée, garde, Heat, saut et collision, pause, rounds et victoire, entraînement, IA et combos. Vérification dans le navigateur de la sélection, du lancement, des déplacements, du Heat, de la pause et du rendu mobile à 390 px.

## Visuels

Générés avec l'outil intégré **ImageGen**, puis enregistrés dans le projet :

- `dist/assets/fighters.png` : atlas transparent de 24 poses, 6 colonnes × 4 lignes.
- `dist/assets/shrine.png` : décor pixel art Moonlit Shrine.
- Prompts complets : `ASSET_PROMPTS.md`.

Chaque combattant utilise six poses (garde, pas, poing, pied, impact, victoire), animées par le moteur avec respiration, déplacement, startup, impact et récupération. Les VFX sont dessinés en Canvas ; aucun service externe n'est requis pour jouer. La police web utilise Google Fonts avec une police de secours locale.

Le site statique à déployer se trouve entièrement dans `dist/`. Aucun multijoueur en ligne ; le mode deux joueurs est local.
