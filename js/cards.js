// ==========================================
// 1. CARTE DE BASE & NOUVELLES TECHNIQUES
// ==========================================
const CARDS_POOL = [
  // --- Cartes de départ ---
  {
    id: "poing",
    name: "Coup de Poing",
    cost: 0,
    dmg: 6,
    shield: 0,
    clones: 0,
    type: "taijutsu",
    desc: "Inflige 6 dégâts de Taijutsu.",
    img: "card_poing.png",
    icon: "👊"
  },
  {
    id: "kawarimi",
    name: "Kawarimi",
    cost: 1,
    dmg: 0,
    shield: 6,
    clones: 0,
    type: "defense",
    desc: "Permutation ninja (+6 Bouclier).",
    img: "card_kawarimi.png",
    icon: "🪵"
  },
  {
    id: "kage_bunshin",
    name: "Kage Bunshin",
    cost: 2,
    dmg: 0,
    shield: 0,
    clones: 2,
    type: "clone",
    desc: "+2 Clones (+3 dégâts chacun en fin de tour).",
    img: "card_clones.png",
    icon: "👥"
  },
  {
    id: "rendan",
    name: "Naruto Rendan",
    cost: 1,
    dmg: 8,
    shield: 0,
    clones: 0,
    type: "attaque",
    desc: "8 dégâts + 4 dégâts par clone actif.",
    img: "card_rendan.png",
    icon: "🌪️"
  },
  {
    id: "kyubi",
    name: "Chakra de Kyûbi",
    cost: 1,
    dmg: 14,
    shield: 0,
    clones: 0,
    selfDmg: 4,
    type: "kyubi",
    desc: "14 dégâts brutaux, mais Naruto perd 4 PV.",
    img: "card_kyubi.png",
    icon: "🦊"
  },

  // --- NOUVELLES TECHNIQUES AVANCÉES ---
  // Séquence (Ouverture)
  {
    id: "feinte_kunai",
    name: "Feinte au Kunai",
    cost: 1,
    dmg: 6,
    type: "attaque",
    opening: true,
    desc: "6 dégâts. [Ouverture] Si jouée en 1er ce tour : la prochaine attaque coûte 0 Chakra.",
    img: "card_fuma.png",
    icon: "🗡️"
  },
  // Séquence (Finisher)
  {
    id: "tornade_konoha",
    name: "Tornade de Konoha",
    cost: 1,
    dmg: 8,
    type: "taijutsu",
    finisher: true,
    desc: "8 dégâts. [Finisher] Si au moins 2 cartes ont été jouées avant : +8 dégâts et +5 Bouclier.",
    img: "card_poing.png",
    icon: "🌪️"
  },
  // Sacrifice de Clone
  {
    id: "bouclier_clone",
    name: "Clone Bouclier",
    cost: 0,
    cloneCost: 1,
    shield: 14,
    type: "defense",
    desc: "Détruit 1 Clone actif. Octroie immédiatement 14 de Bouclier.",
    img: "card_kawarimi.png",
    icon: "🛡️"
  },
  // Sacrifice de Clone & Anti-Brouillard
  {
    id: "clone_explosif",
    name: "Clone Piégé",
    cost: 1,
    cloneCost: 1,
    dmg: 18,
    clearMist: true,
    type: "attaque",
    desc: "Fait exploser 1 Clone : 18 dégâts et dissipe le brouillard ennemi.",
    img: "card_clones.png",
    icon: "💥"
  },
  // Rétention (Mudrâ)
  {
    id: "mook_mudra",
    name: "Concentration Mudrâ",
    cost: 1,
    retain: true,
    channelBonus: 0,
    type: "chakra",
    desc: "[Rétention] Reste en main en fin de tour. Chaque tour retenue : +1 Chakra rendu lors du jeu.",
    img: "card_volonte.png",
    icon: "🧘"
  },
  // Éphémère (Exhaust)
  {
    id: "pilule_militaire",
    name: "Pilule Militaire",
    cost: 0,
    exhaust: true,
    chakraGain: 2,
    drawBonus: 2,
    type: "objet",
    desc: "[Éphémère] Rend 2 Chakra et pioche 2 cartes. Consumée pour le reste du combat.",
    img: "card_chakra_rouge.png",
    icon: "💊"
  },
  // Éphémère Perce-Bouclier
  {
    id: "parchemin_scelle",
    name: "Parchemin Explosif",
    cost: 1,
    exhaust: true,
    dmg: 22,
    piercing: true,
    type: "objet",
    desc: "[Éphémère] 22 dégâts directs perçant le bouclier. Consumée pour le combat.",
    img: "card_2000poings.png",
    icon: "📜"
  },
  {
    id: "fuma",
    name: "Shuriken Fûma",
    cost: 2,
    dmg: 10,
    shield: 0,
    clones: 0,
    fumaBonus: true,
    type: "attaque",
    desc: "10 dégâts. Passe à 22 dégâts si tu as au moins 2 clones.",
    img: "card_fuma.png",
    icon: "⚔️"
  },
  {
    id: "volonte",
    name: "Volonté du Feu",
    cost: 1,
    dmg: 0,
    shield: 0,
    clones: 0,
    buffWill: true,
    type: "buff",
    desc: "Éveille ta détermination : +4 dégâts sur toutes tes attaques si tes PV <= 50%.",
    img: "card_volonte.png",
    icon: "🔥"
  },
  {
    id: "assaut",
    name: "Assaut Massif",
    cost: 2,
    dmg: 8,
    clones: 3,
    type: "clone",
    desc: "8 dégâts immédiats et invoque 3 Clones solides.",
    img: "card_assaut.png",
    icon: "👥"
  },
  {
    id: "combo_2000",
    name: "2000 Poings de Naruto",
    cost: 2,
    dmg: 18,
    type: "taijutsu",
    desc: "Un barrage dévastateur de 18 dégâts physiques.",
    img: "card_2000poings.png",
    icon: "👊"
  }
];

// ==========================================
// 2. FLÉAUX DE BOSS
// ==========================================
const CURSE_POOL = {
  senbon: {
    id: "curse_senbon",
    name: "Aiguille Senbon",
    cost: 1,
    isCurse: true,
    endTurnDmg: 3,
    type: "curse",
    desc: "[Fléau d'Haku] Coûte 1 Chakra pour être retirée. Si gardée en main : inflige 3 dégâts directs.",
    img: "card_miroir.png",
    icon: "🪡"
  },
  peur: {
    id: "curse_peur",
    name: "Pression Meurtrière",
    cost: 1,
    isCurse: true,
    endTurnDmg: 0,
    type: "curse",
    desc: "[Fléau de Zabuza] Soif de sang glaciale. Coûte 1 Chakra pour être surmontée et défaussée.",
    img: "card_miroir.png",
    icon: "💀"
  }
};

const REWARD_OPTIONS = [
  CARDS_POOL[5],
  CARDS_POOL[6],
  CARDS_POOL[7],
  CARDS_POOL[8],
  CARDS_POOL[9],
  CARDS_POOL[10],
  CARDS_POOL[11],
  CARDS_POOL[12],
  CARDS_POOL[13],
  CARDS_POOL[14],
  CARDS_POOL[15]
];

// ==========================================
// 3. RELIQUES
// ==========================================
const RELICS_POOL = [
  {
    id: "bandeau",
    name: "Bandeau Protecteur de Konoha",
    desc: "Débute chaque combat avec 5 de Bouclier automatique.",
    onCombatStart: (state) => { state.player.shield += 5; }
  },
  {
    id: "rouleau",
    name: "Rouleau du Premier Hokage",
    desc: "Naruto gagne +1 point de Chakra maximum pour tout le run.",
    apply: (state) => { state.player.maxChakra += 1; state.player.chakra += 1; }
  },
  {
    id: "gourde",
    name: "Poche de Shurikens Lestée",
    desc: "Chaque fois que Naruto subit des dégâts, ses clones infligent +2 dégâts supplémentaires.",
    onDamage: (state) => {
      if (state.player.clones > 0) {
        state.enemy.hp = Math.max(0, state.enemy.hp - 2);
      }
    }
  }
];

// ==========================================
// 4. ÉTAPES & BOSS PATTERNS
// ==========================================
const STAGES = [
  {
    name: "Mercenaires de Gatô",
    title: "Étape 1/4 : Port de Nami no Kuni",
    sprite: "brigand.png",
    maxHp: 38,
    bgClass: "bg-port",
    pattern: [
      { intent: "Attaque (6 dmg)", dmg: 6 },
      { intent: "Défense (8 shield)", shield: 8 },
      { intent: "Frappe Lourde (10 dmg)", dmg: 10 }
    ]
  },
  {
    name: "Frères Démons (Gôzu & Meizu)",
    title: "Étape 2/4 : Embuscade dans les Marais",
    sprite: "freres_demons.png",
    maxHp: 48,
    bgClass: "bg-marais",
    pattern: [
      { intent: "Chaîne d'Acier (4x2 dmg)", multiHit: 2, hitDmg: 4 },
      { intent: "Lames Empoisonnées (9 dmg)", dmg: 9 },
      { intent: "Repli & Défense (10 shield)", shield: 10 }
    ]
  },
  {
    name: "Haku aux Miroirs de Glace",
    title: "Étape 3/4 : Miroirs Démoniaques (Élite)",
    sprite: "haku.png",
    maxHp: 58,
    bgClass: "bg-pont",
    pattern: [
      { intent: "Aiguilles Senbon (3x3 dmg) + 2 Fléaux", multiHit: 3, hitDmg: 3, addCurse: { key: "senbon", count: 2, message: "Haku crible ta pioche d'Aiguilles Senbon !" } },
      { intent: "Miroir Démoniaque (12 shield)", shield: 12 },
      { intent: "Transpercement Rapide (14 dmg)", dmg: 14 }
    ]
  },
  {
    name: "Zabuza Momochi",
    title: "Étape Finale : Combat sur le Grand Pont",
    sprite: "zabuza.png",
    maxHp: 75,
    bgClass: "bg-pont",
    pattern: [
      { intent: "Camouflage dans la Brume + Peur", mist: true, addCurse: { key: "peur", count: 1, message: "Zabuza projette une aura meurtrière dans ton deck !" } },
      { intent: "Décapitation au Kubikiribôchô (18 dmg)", dmg: 18 },
      { intent: "Grande Cataracte (Balaye tous les clones)", clearClones: true, dmg: 8 },
      { intent: "Garde de Fer (15 shield)", shield: 15 }
    ]
  }
];