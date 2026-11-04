# Examen et attaque de Konoha — extension et corrections

Cette livraison étend la première version de l'examen. Le parcours est désormais : Kiba/Akamaru → Jiraiya → Gamabunta → Neji → Gaara, avec récompenses et préparation entre rencontres. Aucun dialogue ou scène narrative ajouté.

## Corrections d'affichage

- Les récompenses des chapitres 2 et 3 utilisent trois boutons-cartes illustrés (titre, coût, image déjà disponible, description et type), une grille de trois colonnes sur grand écran et une colonne sur écran étroit. « Continuer sans ajouter de carte » occupe sa propre ligne. La fenêtre défile verticalement si nécessaire.
- Akamaru a un sprite de 76 px contre 170 px pour les humains (50 contre 110 sur petit écran), dans un cadre de même hauteur aligné en bas. La zone cliquable et les informations restent accessibles.

## Rencontres ajoutées

- Jiraiya : dépenser au moins 9 chakra en jouant des cartes et survivre à 4 tours. Les gains de chakra ne comptent pas comme de la dépense. Les dégâts subis restent réels. La vie du mentor ne peut pas descendre sous 1 : l'objectif valide l'entraînement.
- Gamabunta : absorber au moins 18 dégâts avec le bouclier et survivre à 4 tours. Seuls les dégâts effectivement absorbés comptent. L'objectif peut être terminé plus tard si nécessaire, tant que Naruto survit.
- Les entraînements offrent trois nouvelles récompenses au choix : Contrôle du chakra, Garde de l'invocateur, Renfort de clones. Elles réutilisent les illustrations de cartes existantes.
- Gaara : 140 PV. À mi-vie, son cycle passe à la forme de Shukaku : attaques renforcées, dissipation des clones et tempête à interrompre. La victoire termine cette portion de campagne.

## Sauvegardes et compatibilité

Kiba reste à l'indice 10 et Neji à l'indice 11. Les nouveaux combats sont ajoutés aux indices 12, 13 et 14 et les transitions définissent leur ordre. Une sauvegarde existante devant Neji reste devant Neji ; elle peut ensuite poursuivre vers Gaara. Les sauvegardes manuelles comprennent les compteurs d'entraînement. Les checkpoints de récompense/repos conservent leur fonctionnement. Les contrôles de fin de campagne dans les options sont déplacés de Neji à Gaara.

## Vérifications réellement exécutées

- Syntaxe : `node --check js/game.js`, `node --check js/forest.js`.
- Régressions : `node tests/menu.cjs`, `node tests/exams.cjs`, `node tests/art.cjs`, `node tests/mizuki.cjs` ; les tests forêt sont également exécutés par leurs imports.
- Nouveautés : `node tests/konoha.cjs` vérifie les cartes illustrées, les cadres/tailles d'Akamaru, les deux objectifs, l'impossibilité de terminer l'entraînement par les dégâts, les sauvegardes des compteurs, la transition Neji → Gaara, le changement de phase, l'interruption et la fin de campagne.
- Parcours simulé : `node tests/exam-playthrough.cjs`, 40/40 réussites avec graines fixes et stratégie automatique simple sur le parcours étendu. Cela vérifie que le parcours est franchissable, sans remplacer l'équilibrage humain.

## Limites et suite

Aucun rendu complet du jeu dans un navigateur n'a été vérifié dans cet environnement. Jiraiya, Gamabunta et Gaara utilisent provisoirement leur nom et une icône ; leurs illustrations restent à créer, orientées vers la gauche. Aucun fichier lourd supplémentaire n'est chargé.

Prochaine vérification humaine : trois cartes avec images à l'écran de récompense, taille d'Akamaru à côté de Kiba, lisibilité des objectifs des mentors et difficulté de Gaara. Le regroupement futur des niveaux sous « Histoire » avec « Roguelike » séparé reste consigné dans ART-NOTES.md.
