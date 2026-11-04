# Examen Chūnin — première version jouable

## Contenu

Deux rencontres ajoutées aux indices 10 et 11, après la Forêt de la Mort : Kiba/Akamaru (éliminatoires), puis Neji (finale). Le mode histoire reste une suite de combats et de préparations, sans scènes narratives.

- Kiba : 52 PV. Griffes à 7 dégâts et Gatsūga à 10 dégâts, augmentés respectivement de 4 et 6 tant qu'Akamaru est actif. L'intention est recalculée dès qu'Akamaru est mis hors combat.
- Akamaru : 26 PV. Attaque à 3 ou 4 dégâts et protection de Kiba à 6 bouclier. Cible indépendante ; mettre Akamaru hors combat supprime ses actions et les bonus de Kiba.
- Neji : 96 PV. Cycle Jūken (8 dégâts, prochain tour −1 chakra), Byakugan (12 bouclier), 64 Paumes (4 coups à 4 dégâts). Une puissance d'attaque cumulée de 16 dans le tour interrompt les 64 Paumes, frappes des clones comprises. Le blocage du chakra dure un seul tour et ne modifie pas le maximum permanent ; les cartes de gain de chakra restent utilisables.
- Après Kiba : choisir Réserve de chakra (0, +1 chakra, consommée), Rafale de clones (1, 5 dégâts + 1 clone), Garde concentrée (1, 9 bouclier, rétention), ou ne pas ajouter de carte. Puis soin de 25 PV ou amélioration avant Neji.

## Progression et sauvegardes

La victoire sur Orochimaru conserve maintenant un checkpoint de récompense avec un bouton pour poursuivre vers l'examen. L'entrée dans cette nouvelle partie restaure les PV et conserve deck/relique. Le repos avant Neji, la récompense de Kiba et les cartes choisies utilisent les checkpoints existants. La victoire sur Neji marque la portion terminée, efface la sauvegarde active et propose le retour au menu ; aucune tentative de charger un niveau inexistant.

Accès direct « Chapitre 3 · Examen Chūnin » pour tester sans rejouer : deck de base + Feinte au Kunai et Clone Bouclier, une Kawarimi améliorée, 60 PV, 3 chakra, aucune relique. Cet accès avertit avant de remplacer une sauvegarde existante. L'amélioration cherche parmi toutes les piles, y compris la main, pour ne pas dépendre de la pioche initiale.

## Vérifications exécutées

- `node --check js/game.js` et `node --check js/forest.js`.
- `node tests/exams.cjs` : réexécute les régressions forêt, puis teste transition, coordination et soutien de Kiba/Akamaru, disparition des bonus, récompense sans duplication, reprise du repos, durée du blocage du chakra, cartes de gain de chakra, quatre frappes et leur interruption, contribution des clones, rétention, reprise sans blocage résiduel, fin de progression et démarrage direct.
- `node tests/mizuki.cjs` : tutoriel toujours valide.
- `node tests/exam-playthrough.cjs` : 40/40 simulations terminées avec graines fixes, deck d'accès direct et stratégie simple, sans bonus artificiels de vie/bouclier/dégâts. Cela vérifie que le parcours est franchissable, pas son équilibrage pour un joueur humain.

## Limites et prochaine action

Pas de test visuel en navigateur exécuté. Les adversaires utilisent les panneaux nommés et icônes provisoires, comme le chapitre 2. Les cartes réutilisent les illustrations déjà chargées. Les futurs sprites ennemis devront regarder à gauche.

Tester d'abord le parcours forêt → Kiba → récompense/repos → Neji. Vérifier le choix de cible et le nouveau montant d'attaque de Kiba, le chakra après Jūken et les dégâts des 64 Paumes interrompues ou non. Ajuster ensuite la difficulté et intégrer les illustrations définitives.
