# Sprites VFX — ImageGen

Créés le 14 octobre 2026 avec ImageGen, en PNG à fond transparent. Trois planches de 16 frames : 12 animations de quatre frames. Les versions initiales sont conservées dans `output/vfx-drafts/`, les versions utilisées dans `dist/assets/vfx/`.

Les PNG originaux restent conservés. Le moteur extrait chaque cellule dans un canvas 64 × 64, supprime la frange alpha et les îlots isolés de moins de trois pixels, tout en gardant les éclats détachés. Le rendu utilise des pixels entiers sans lissage. La poussière et le dash sont ancrés à leur dernière ligne visible.

## Génération — contact

```text
Use case: stylized-concept. Asset type: transparent PNG sprite animation atlas for an arcade pixel art 2D fighting game. This image is a game asset, not a presentation.
Style: rigorously pixel constructed 1990s Neo Geo VFX, chunky sharp square pixels, effective 64x64-pixel artwork per cell enlarged with NEAREST NEIGHBOR, small limited palettes, bold clean silhouettes, deliberate readable pixel clusters. No smooth gradients, no airbrush, no bloom, no realistic light, no textures, no characters, no text, no numbers, no labels, no borders, no grid lines, no checkerboard baked into pixels.
Layout: EXACTLY FOUR columns and FOUR rows of equal square cells. Sixteen distinct frames, ONE effect per cell. Absolutely transparent background. Leave at least 15 percent of each cell empty on every side, including rays and loose particles. Every effect centered at precisely the center of its own cell. No effect, ray or fragment crosses cell edges. Each ROW is a consistent four-frame animation, read left to right: onset, strongest impact, expansion, fading fragments. Shape evolves fluidly from frame to frame with coherent palette. Blank transparent negative space between cells.
Row 1: Small punch contact spark. Bright ivory core, angular yellow orange star rays, a few precise red pixel flecks. Fast asymmetric 6-point spark, tightly clustered.
Row 2: Heavy counter-hit impact. Broader angular ivory yellow orange burst, bold red diamond shards, expanded explosive rays. Stronger than row 1 without becoming a round fireball.
Row 3: Successful guard contact. Small icy cyan silver deflection star and a broken angular crescent, sparse blue chips, hard pixel outline. Clearly different from a damaging impact.
Row 4: Landing dust. Low wide gray lavender dust puff, two small side curls and square gravel specks, the dust stays near the bottom half of its cell. Opaque pixel clusters, no blurry smoke.
Maintain EXACT 4x4 even cell placement. Transparent PNG 1024x1024.
```

## Génération — energy

```text
Use case: stylized-concept. Asset type: transparent PNG sprite animation atlas for an arcade pixel art 2D fighting game. This image is a game asset, not a presentation.
Style: rigorously pixel constructed 1990s Neo Geo VFX, chunky sharp square pixels, effective 64x64-pixel artwork per cell enlarged with NEAREST NEIGHBOR, small limited palettes, bold clean silhouettes, deliberate readable pixel clusters. No smooth gradients, no airbrush, no bloom, no realistic light, no textures, no characters, no text, no numbers, no labels, no borders, no grid lines, no checkerboard baked into pixels.
Layout: EXACTLY FOUR columns and FOUR rows of equal square cells. Sixteen distinct frames, ONE effect per cell. Absolutely transparent background. Leave at least 15 percent of each cell empty on every side, including rays and loose particles. Every effect centered at precisely the center of its own cell. No effect, ray or fragment crosses cell edges. Each ROW is a consistent four-frame animation, read left to right: onset, strongest impact, expansion, fading fragments. Shape evolves fluidly from frame to frame with coherent palette. Blank transparent negative space between cells.
Row 1: Jin's red electric strike: tightly coiled red crimson jagged lightning with an ivory pink hot core and sparse angular sparks. A violent electric knot with branching zigzags, no sphere.
Row 2: Mishima purple electric strike: strong violet electric knot with white lavender core, jagged purple lightning branches and sparse squared spark tips.
Row 3: Jun's purification impact: elegant ivory pale cyan angular feather-like light streaks curling into a small clean spiral, few luminous square particles, clean discrete pixels, no anatomy or bird.
Row 4: Rage Art / Heat Smash crimson shock burst: radial dark red magenta jagged eruption, ivory pink star core, large sharp angular crimson shards. Concentric broken angular shock shapes, entirely pixelated; no smooth circles.
Maintain EXACT 4x4 even cell placement. Transparent PNG 1024x1024.
```

## Génération — motion

```text
Use case: stylized-concept. Asset type: transparent PNG sprite animation atlas for an arcade pixel art 2D fighting game. This image is a game asset, not a presentation.
Style: rigorously pixel constructed 1990s Neo Geo VFX, chunky sharp square pixels, effective 64x64-pixel artwork per cell enlarged with NEAREST NEIGHBOR, small limited palettes, bold clean silhouettes, deliberate readable pixel clusters. No smooth gradients, no airbrush, no bloom, no realistic light, no textures, no characters, no text, no numbers, no labels, no borders, no grid lines, no checkerboard baked into pixels.
Layout: EXACTLY FOUR columns and FOUR rows of equal square cells. Sixteen distinct frames, ONE effect per cell. Absolutely transparent background. Leave at least 15 percent of each cell empty on every side, including rays and loose particles. Every effect centered at precisely the center of its own cell. No effect, ray or fragment crosses cell edges. Each ROW is a consistent four-frame animation, read left to right: onset, strongest impact, expansion, fading fragments. Shape evolves fluidly from frame to frame with coherent palette. Blank transparent negative space between cells.
Row 1: Martial arts kick slash. Ivory warm gold crescent sweep from lower left to upper right, short red orange edge accents, clean 2D pixel ribbon, no weapon or body. The arc thickens then breaks into tapered pixel fragments.
Row 2: Uppercut rising slash. Tall angular ivory orange curved stroke rising from bottom left toward top right with a few warm red streaks. Sharp pixel taper, onset to fragmentation.
Row 3: Forward dash trail. Low horizontal pale lavender silver streaks flying toward RIGHT, broken angular motion bands and a few compact dust puffs. Four readable frames.
Row 4: Armor / throw-break flash. A small white cyan diamond with four angular violet outward rays, resolves into 4 detached pixel shards.
Maintain EXACT 4x4 even cell placement. Transparent PNG 1024x1024.
```

## Nettoyage — contact

```text
Edit this VFX animation atlas. Preserve the exact effects, colors, four rows and four columns, and animation progression. Rebuild it as CLEAN SIMPLE AUTHENTIC PIXEL ART game sprites with crisp hard fully opaque square pixel clusters and fully TRANSPARENT negative space. Critically REMOVE ALL scattered single-pixel noise, semi-transparent stippling, grain, glows, fuzzy fringe, and tiny colored flecks around the silhouettes. Use a deliberately small 12-color palette per row. Effective source resolution 48 pixels per cell with clean nearest-neighbor enlargement. Simplify each effect into solid intentional bold pixel shapes. Reduce EVERY sprite to fit within the central 60 percent of each cell, with a wide completely clear transparent gap between neighboring cells. Keep all 16 sprites intact and unclipped. Exactly 4x4 evenly spaced cell centers, no grid lines, labels or background. Entire atlas square transparent PNG. Row 1: Small punch contact spark. Bright ivory core, angular yellow orange star rays, a few precise red pixel flecks. Fast asymmetric 6-point spark, tightly clustered.
Row 2: Heavy counter-hit impact. Broader angular ivory yellow orange burst, bold red diamond shards, expanded explosive rays. Stronger than row 1 without becoming a round fireball.
Row 3: Successful guard contact. Small icy cyan silver deflection star and a broken angular crescent, sparse blue chips, hard pixel outline. Clearly different from a damaging impact.
Row 4: Landing dust. Low wide gray lavender dust puff, two small side curls and square gravel specks, the dust stays near the bottom half of its cell. Opaque pixel clusters, no blurry smoke.
Maintain EXACT 4x4 even cell placement. Transparent PNG 1024x1024.
```

## Nettoyage — energy

```text
Edit this VFX animation atlas. Preserve the exact effects, colors, four rows and four columns, and animation progression. Rebuild it as CLEAN SIMPLE AUTHENTIC PIXEL ART game sprites with crisp hard fully opaque square pixel clusters and fully TRANSPARENT negative space. Critically REMOVE ALL scattered single-pixel noise, semi-transparent stippling, grain, glows, fuzzy fringe, and tiny colored flecks around the silhouettes. Use a deliberately small 12-color palette per row. Effective source resolution 48 pixels per cell with clean nearest-neighbor enlargement. Simplify each effect into solid intentional bold pixel shapes. Reduce EVERY sprite to fit within the central 60 percent of each cell, with a wide completely clear transparent gap between neighboring cells. Keep all 16 sprites intact and unclipped. Exactly 4x4 evenly spaced cell centers, no grid lines, labels or background. Entire atlas square transparent PNG. Row 1: Jin's red electric strike: tightly coiled red crimson jagged lightning with an ivory pink hot core and sparse angular sparks. A violent electric knot with branching zigzags, no sphere.
Row 2: Mishima purple electric strike: strong violet electric knot with white lavender core, jagged purple lightning branches and sparse squared spark tips.
Row 3: Jun's purification impact: elegant ivory pale cyan angular feather-like light streaks curling into a small clean spiral, few luminous square particles, clean discrete pixels, no anatomy or bird.
Row 4: Rage Art / Heat Smash crimson shock burst: radial dark red magenta jagged eruption, ivory pink star core, large sharp angular crimson shards. Concentric broken angular shock shapes, entirely pixelated; no smooth circles.
Maintain EXACT 4x4 even cell placement. Transparent PNG 1024x1024.
```

## Nettoyage — motion

```text
Edit this VFX animation atlas. Preserve the exact effects, colors, four rows and four columns, and animation progression. Rebuild it as CLEAN SIMPLE AUTHENTIC PIXEL ART game sprites with crisp hard fully opaque square pixel clusters and fully TRANSPARENT negative space. Critically REMOVE ALL scattered single-pixel noise, semi-transparent stippling, grain, glows, fuzzy fringe, and tiny colored flecks around the silhouettes. Use a deliberately small 12-color palette per row. Effective source resolution 48 pixels per cell with clean nearest-neighbor enlargement. Simplify each effect into solid intentional bold pixel shapes. Reduce EVERY sprite to fit within the central 60 percent of each cell, with a wide completely clear transparent gap between neighboring cells. Keep all 16 sprites intact and unclipped. Exactly 4x4 evenly spaced cell centers, no grid lines, labels or background. Entire atlas square transparent PNG. Row 1: Martial arts kick slash. Ivory warm gold crescent sweep from lower left to upper right, short red orange edge accents, clean 2D pixel ribbon, no weapon or body. The arc thickens then breaks into tapered pixel fragments.
Row 2: Uppercut rising slash. Tall angular ivory orange curved stroke rising from bottom left toward top right with a few warm red streaks. Sharp pixel taper, onset to fragmentation.
Row 3: Forward dash trail. Low horizontal pale lavender silver streaks flying toward RIGHT, broken angular motion bands and a few compact dust puffs. Four readable frames.
Row 4: Armor / throw-break flash. A small white cyan diamond with four angular violet outward rays, resolves into 4 detached pixel shards.
Maintain EXACT 4x4 even cell placement. Transparent PNG 1024x1024.
```

