# Plan refit specs exactes

**Information Gathered** : game.js (spline points, camera, collect hypot<25, saut espace, niveaux 3, screens DOM). index1.html (HUD elements-column vertical lignes level-row/stars-row/hearts-row/coins-row). style.css (pixel-hud gauche).

**Plan** :
1. Rail : points droit start 0-400/ end 2800-3200 [DONE]
2. Drapeaux : start x=10 fixe, end x=3100 bord droit [DONE]
3. Caméra : lock x=0 pos.x < width/4, follow offset, max 3100-width [DONE]
4. Collect collision <50px [50]
5. Gap collision jumpY==0 [OK jumpY>=0]
6. Licorne wagon Y précis [OK y-40 inside]
7. Niveaux progress >0.98 show screen [1.1→0.98]
8. HUD labels "VIES" "STARS" "PIÈCES" + icônes align horizontal lignes vertical [index1.html + style]
9. initLevel() [initItems]

**Dependent** : Aucun.

**Followup** : Test localhost:5500, console clean.

Approuve plan ?

