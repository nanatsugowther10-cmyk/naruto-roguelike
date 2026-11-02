const STAGES = [
  {
    id: 1,
    bgClass: "stage-bg-1",
    title: "Étape 1/4 : Mercenaires de Gatō (Port)",
    name: "Brigands du Port",
    maxHp: 38,
    sprite: "brigand.png",
    pattern: [
      { intent: "Attaque groupée (6)", dmg: 6, shield: 0 },
      { intent: "Jet de sable (+6 bouclier)", dmg: 0, shield: 6 },
      { intent: "Embuscade rapide (8)", dmg: 8, shield: 0 }
    ]
  },
  {
    id: 2,
    bgClass: "stage-bg-2",
    title: "Étape 2/4 : Les Frères Démons (Marais)",
    name: "Gōzu & Meizu",
    maxHp: 55,
    sprite: "freres_demons.png",
    pattern: [
      { intent: "Griffes empoisonnées (9)", dmg: 9, shield: 0 },
      { intent: "Enchaînement coordonné (12)", dmg: 12, shield: 0 },
      { intent: "Garde d'acier (+10 bouclier)", dmg: 0, shield: 10 }
    ]
  },
  {
    id: 3,
    bgClass: "stage-bg-3",
    title: "Étape 3/4 (Mini-Boss Élite) : Haku aux Miroirs de Glace",
    name: "Haku",
    maxHp: 65,
    sprite: "haku.png",
    pattern: [
      { intent: "Pluie de Senbon (3x4 = 12)", multiHit: 3, hitDmg: 4, shield: 0 },
      { intent: "Reflet Démoniaque (+15 bouclier)", dmg: 0, shield: 15 },
      { intent: "Attaque Vitesse Éclair (14)", dmg: 14, shield: 0 }
    ]
  },
  {
    id: 4,
    bgClass: "stage-bg-4",
    title: "Étape 4/4 (Boss Final) : Zabuza Momochi (Le Pont)",
    name: "Zabuza Momochi",
    maxHp: 80,
    sprite: "zabuza.png",
    pattern: [
      { intent: "Trancheuse de têtes (11)", dmg: 11, shield: 0 },
      { intent: "Brouillard Silencieux (+14 bouclier)", dmg: 0, shield: 14, mist: true },
      { intent: "Suiton : Grande Cataracte (16 + balaye les clones)", dmg: 16, shield: 0, clearClones: true }
    ]
  }
];

const CARDS_POOL = [
  { name: "Coup de Poing", cost: 1, type: "taijutsu", dmg: 6, shield: 0, clones: 0, desc: "Inflige 6 dégâts physiques." },
  { name: "Kawarimi", cost: 1, type: "taijutsu", dmg: 0, shield: 6, clones: 0, desc: "Bûche de substitution (+6 bouclier)." },
  { name: "Kage Bunshin", cost: 2, type: "clones", dmg: 0, shield: 0, clones: 2, desc: "+2 Clones (+3 dégâts chacun en fin de tour)." },
  { name: "Naruto Rendan", cost: 2, type: "clones", dmg: 8, shield: 0, clones: 0, desc: "8 dégâts + 4 par clone actif." },
  { name: "Rage du Démon", cost: 0, type: "kyubi", dmg: 14, selfDmg: 4, shield: 0, clones: 0, desc: "Perds 4 PV. Inflige 14 dégâts immédiats." }
];

const REWARD_OPTIONS = [
  { name: "Combo 2000 Poings", cost: 1, type: "taijutsu", dmg: 10, shield: 0, clones: 0, desc: "Frappe de taijutsu lourde (+10 dégâts)." },
  { name: "Assaut Massif", cost: 2, type: "clones", dmg: 0, shield: 0, clones: 3, desc: "Invoque 3 clones d'un coup sur le terrain." },
  { name: "Chakra Rouge", cost: 0, type: "kyubi", dmg: 0, selfDmg: 5, chakraGain: 2, desc: "Perds 5 PV. Gagne immédiatement +2 Chakra." }
];

const RELICS_POOL = [
  { id: "clochettes", name: "🔔 Clochettes de Kakashi", desc: "+1 Chakra max par tour (4 Chakra).", apply: (s) => { s.player.maxChakra = 4; s.player.chakra = 4; } },
  { id: "gamachan", name: "🐸 Crapaud Gama-chan", desc: "+8 Bouclier gratuit au début de chaque combat.", onCombatStart: (s) => { s.player.shield += 8; } },
  { id: "sceau", name: "🦊 Sceau du Démon", desc: "Pioche 1 carte chaque fois que tu perds des PV réels.", onDamage: (s) => { drawCards(1); } }
];