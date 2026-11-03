# Tutoriel Mizuki — première version

Nouvelle partie ouvre un prologue guidé et skippable. Rejouer le tutoriel depuis le menu conserve la sauvegarde. Le départ au Pays des Vagues est identique après victoire ou passage. Aucun déblocage permanent supplémentaire n'est introduit.

Séquence : Coup de Poing → Kawarimi → fin du tour → Kage Bunshin → combat libre avec mains préparées. Mizuki annonce 6 dégâts ; les clones infligent 3 dégâts chacun à la fin du tour. Les données des cartes viennent de CARDS_POOL.

Vérifications exécutées : node --check js/game.js ; node --check js/tutorial.js ; node tests/mizuki.cjs ; git diff --check. Les tests de logique couvrent les étapes, actions invalides, victoire, passage à chaque phase, rejeu sans mutation de sauvegarde et défaite/reprise. Le rendu est remplacé dans ces tests : ils ne vérifient pas le DOM ni les interactions visuelles.

Limites : silhouette emoji provisoire pour Mizuki ; durée cible de 2–3 minutes non mesurée ; pas de test visuel navigateur. Le tutoriel utilise un petit contrôleur isolé, et non la boucle complète de combat : dégâts simples tirés des cartes, sans reliques ni effets avancés. Prochaine étape : vérifier le rendu sur ordinateur/mobile, le passage et la reprise d'une sauvegarde existante ; ajuster le rythme avec un joueur.
