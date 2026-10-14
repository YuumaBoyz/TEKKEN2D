# Contrôle des sprites v2

Chaque combattant a été généré séparément avec ImageGen à partir de son identité et de son costume. Le fichier de sprites partagé de la v1 reste conservé, mais n'est plus utilisé par le jeu.

| Personnage | Planche de 16 poses | Pose supplémentaire |
|---|---|---|
| Jin | `dist/assets/sprites/jin-v2.png` | `jin-low-v2.png` |
| Kazuya | `dist/assets/sprites/kazuya-v2.png` | `kazuya-low-v2.png` |
| Jun | `dist/assets/sprites/jun-v2.png` | `jun-low-v2.png` |
| Reina | `dist/assets/sprites/reina-v2.png` | `reina-low-v2.png` |

Les 68 poses servent à la garde, respiration, marche, anticipation, extension et récupération du jab, pied, launcher, garde basse/haute, impact reçu, chute, victoire, frappe puissante et balayage.

## Défauts trouvés et corrections d'affichage

Les planches générées mesurent 1254 × 1254 pixels. Leurs personnages ne respectent pas parfaitement une grille uniforme : des semelles et quelques extensions dépassent la case théorique. Une découpe régulière rognait des pieds ou récupérait des fragments de la pose voisine.

L'inspection alpha a identifié 16 silhouettes principales séparées sur chaque planche. `dist/sprite-data.mjs` définit leurs rectangles réels, leurs points d'ancrage et leurs lignes de sol. Le rendu extrait en mémoire la composante alpha principale de chaque pose et conserve son contour voisin ; cela exclut les fragments d'autres poses présents dans un rectangle. Les PNG sources restent inchangés.

Les quatre balayages ont leur propre image. Le jeu n'utilise plus un coup de pied haut réduit pour simuler une frappe basse.

## Contrôle visuel

Inspection sur damier dans `dist/sprite-audit.html`, puis dans le décor du jeu :

- Silhouette complète, y compris mains, coiffures, pans de vêtement et bottes.
- Membres lisibles, appuis et articulation des poses.
- Continuité du costume, des couleurs et de l'identité entre les poses.
- Pieds alignés sur une ligne de sol stable ; absence de morceaux de la pose voisine après isolation.
- Rendu sans lissage ; contours lisibles et effets d'impact construits en pixels.

Les captures de contrôle sont conservées dans `qa/`. Les assets restent générés : ce contrôle décrit les défauts visibles recherchés et corrigés, et ne prétend pas certifier une absence absolue de défaut artistique.
