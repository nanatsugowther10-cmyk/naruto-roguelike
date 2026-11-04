# Forêt de la Mort — première version jouable

Six rencontres ajoutées après les quatre du Pays des Vagues : éclaireur, serpent, duo rival, trio du Son, trio de la Pluie et Orochimaru. Le Son donne Terre ; la Pluie donne Ciel. Ordre adapté pour placer Orochimaru en dernier. Pas de séquences narratives.

- Cibles indépendantes avec PV, bouclier, doubles et intentions. Cible sélectionnée encadrée en orange. Les clones frappent séparément, 3 dégâts chacun, et changent de cible lorsque la précédente tombe.
- Son : Zaku détruit les clones ; Kin ajoute une Distraction temporaire ; Dosu réduit de 4 la prochaine protection issue d'une carte.
- Pluie : Oboro crée deux doubles par survivant. Chaque double absorbe un coup.
- Orochimaru : survivre à six actions ennemies. Les attaques des tours 3 et 6 sont interrompues par 18 dégâts infligés dans le tour, clones compris. Une mort au sixième tour reste une défaite.
- Repos après le duo et la Pluie : soin de 25 PV ou amélioration. Récompenses de cartes avec possibilité de passer.
- Transition depuis Zabuza : conserve deck/relique, restaure les PV. Accès direct au chapitre 2 depuis le menu : deck de départ + Feinte au Kunai et Clone Bouclier, sans relique ; avertit avant de remplacer une sauvegarde existante.
- Sauvegarde v2 : checkpoint de début de combat, ou écran de repos/récompense. Toutes les piles permanentes sont sauvegardées. Les reprises de combat recommencent le combat ; pas de reprise à un tour précis. Compatibilité avec les indices de chapitre 1 inchangés. Relique de chakra réappliquée depuis une base de 3 pour éviter les cumuls à la reprise.
- Correction : intention affichée alignée sur l'action réellement exécutée, y compris au chapitre 1.

## Vérifications exécutées

`node --check js/game.js`, `node --check js/forest.js`, `node tests/forest.cjs`, `node tests/mizuki.cjs`.

Le test forêt couvre les transitions, cibles mortes, illusions, Distraction, résonance, constriction, interruptions, priorité de la défaite au dernier tour, sauvegarde du deck, reprise repos/récompense et absence de cumul de relique. Simulation ponctuelle : 30 réussites / 50 avec une stratégie automatique simple, sans bonus artificiels de PV/bouclier. Ce n'est pas une validation d'équilibrage humain.

## Limites et prochaine action

Pas de vérification visuelle exécutée : exécutable Chromium Playwright absent. Les nouveaux adversaires sont des panneaux nommés avec icônes provisoires, à remplacer par des illustrations tournées vers la gauche. Les cartes réutilisent les images déjà présentes ; aucun téléchargement d'illustration supplémentaire.

Tester depuis « Chapitre 2 · Forêt de la Mort », en particulier lisibilité des trois cibles, difficulté du Son et survie contre Orochimaru. Puis ajuster les valeurs et intégrer les illustrations définitives.
