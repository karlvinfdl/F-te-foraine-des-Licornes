# 🎮 Jeu de Devinette — Concept & Fonctionnement

## 🧠 Concept général

Un **jeu de devinettes de mots** à durée limitée, inspiré des jeux **arcade rétro (8-bit)**.

Le joueur devine un mot à partir d'un **indice unique**, tout en affrontant un **personnage fictif** représenté par une licorne géométrique qui se dégrade progressivement.

---

## 🎯 Objectif du joueur

- Deviner le mot correspondant à l'indice affiché
- Réussir avant :
    - la fin du temps imparti
    - la perte de toutes les vies

---

## 🧩 Mécanique principale

1. Un mot est sélectionné aléatoirement dans une base de données
2. Un **indice** est affiché (un mot ou une courte phrase)
3. Le joueur saisit sa réponse dans un champ de texte
4. Le joueur valide sa réponse

### Résultat de la validation

- ✅ **Bonne réponse**
    - Le score augmente
    - La licorne passe à un état de dégradation supérieur
- ❌ **Mauvaise réponse**
    - Une vie est retirée

---

## ❤️ Système de vies

- Le joueur commence avec **3 vies**
- Chaque mauvaise réponse fait perdre **1 cœur**
- Toutes les vies perdues → **fin de partie**

---

## ⏱️ Système de temps

- Chaque manche dure **45 secondes**
- Un **timer visible** est affiché dans le HUD
- Timer à 0 → **fin de partie**

---

## 🦄 Personnage fictif (licorne)

Une **licorne low-poly en pixel art** qui représente la progression du joueur.

### États du personnage

| Niveau | État |
| --- | --- |
| 0 | Normal |
| 1 | Légèrement affaibli |
| 2 | Un peu affaibli |
| 3 | Affaibli |
| 4 | Très affaibli |
| 5 | À terre (K-O) |

Chaque bonne réponse provoque :

- une **dégradation visuelle**
- une **fragmentation progressive**

---

## 🎨 Direction artistique

- Style : **rétro / arcade / 8-bit**
- Personnage :
    - Corps : blanc
    - Crinière : bleu clair
    - Corne : jaune
- Fond principal : `#074151`
- Interface :
    - HUD / Timer : police **Orbitron**
    - Textes / indices : police **Oxanium**

---

## 🖥️ Interface utilisateur

- HUD :
    - Vies (cœurs)
    - Timer
- Zone centrale :
    - Personnage
- Zone de jeu :
    - Indice
    - Champ de saisie
    - Bouton « Valider »
- Feedback immédiat :
    - Message d'erreur en cas de mauvaise réponse

---

## 🏁 Conditions de fin

La partie se termine lorsque :

- le joueur perd toutes ses vies
- le timer atteint zéro
- le personnage est totalement K-O

## 🔁 Boucle de jeu

Indice → Saisie → Validation

Bonne réponse → Dégradation du personnage → Mot suivant

Mauvaise réponse / Fin du timer → Perte de vie → Recommencer ou passer