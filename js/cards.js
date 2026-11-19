// ==========================================
// 1. CONFIGURATION & CONSTANTES DU JEU
// ==========================================
const GAME_CONFIG = {
  startingHp: 60,
  startingChakra: 3,
  baseDrawCount: 4,
  maxVisibleClones: 4,
  cloneDamagePerClone: 3,
  restHealAmount: 25,
  willOfFireBonus: 4,
  finisherMinCards: 2,
  finisherBonusDmg: 8,
  finisherBonusShield: 5,
  fumaCloneThreshold: 2,
  fumaBonusDmg: 22,
  rendanCloneBonus: 4,
  rasenganPerCardBonus: 3,
  shadowTransferDrawPerClone: 1,
  kawarimiEchoShieldPerCard: 3,
  mistMissChance: 0.50,
  denseMistMissChance: 0.60,
  denseMistCloneMissChance: 0.15,
  saveKey: "naruto_deckbuilder_save"
};

// ==========================================
// 2. POOL DE CARTES DE BASE & TECHNIQUES
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

  // --- Techniques avancées ---
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
  },

  // --- NOUVELLES CARTES DE SYNERGIE (GAMEPLAY PUR) ---
  {
    id: "rasengan_tourbillon",
    name: "Orbe Tourbillonnant",
    cost: 2,
    dmg: 12,
    scaleCardsPlayed: true,
    type: "attaque",
    desc: "12 dégâts + 3 dégâts par carte déjà jouée ce tour.",
    img: "card_rendan.png",
    icon: "🌀"
  },
  {
    id: "transfert_ombre",
    name: "Transfert d'Expérience",
    cost: 0,
    sacrificeAllClones: true,
    type: "clone",
    desc: "Sacrifie tous tes Clones actifs : pioche 1 carte et gagne +1 Chakra par clone sacrifié.",
    img: "card_clones.png",
    icon: "🔄"
  },
  {
    id: "dissipation_chakra",
    name: "Kai ! Dissipation",
    cost: 0,
    purgeHandCurses: true,
    shield: 4,
    type: "chakra",
    desc: "+4 Bouclier. Dissipe tous les Fléaux/Distractions de ta main (+1 Chakra par carte dissipée).",
    img: "card_volonte.png",
    icon: "✨"
  },
  {
    id: "permutation_reactive",
    name: "Permutation Réactive",
    cost: 1,
    shield: 5,
    scaleShieldCardsPlayed: true,
    type: "defense",
    desc: "5 Bouclier + 3 Bouclier par carte jouée ce tour.",
    img: "card_kawarimi.png",
    icon: "🪵"
  },
  {
    id: "manteau_renard",
    name: "Manteau du Démon",
    cost: 1,
    dmg: 10,
    selfDmg: 3,
    lowHpDouble: true,
    type: "kyubi",
    desc: "Perds 3 PV. Inflige 10 dégâts (20 dégâts si tes PV sont <= 50%).",
    img: "card_kyubi.png",
    icon: "🔥"
  }
];

// ==========================================
// 3. FLÉAUX DE BOSS
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

const REWARD_OPTIONS = CARDS_POOL.slice(5);

// ==========================================
// 4. RELIQUES
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
// 5. ÉTAPES & BOSS PATTERNS (ARC PAYS DES VAGUES)
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
    maxHp: 80,
    hasPhase2: true,
    bgClass: "bg-pont",
    pattern: [
      { intent: "Camouflage dans la Brume + Peur", mist: true, addCurse: { key: "peur", count: 1, message: "Zabuza projette une aura meurtrière dans ton deck !" } },
      { intent: "Décapitation au Kubikiribôchô (14 dmg)", dmg: 14 },
      { intent: "Grande Cataracte (Balaye tous les clones)", clearClones: true, dmg: 8 },
      { intent: "Garde de Fer (12 shield)", shield: 12 }
    ],
    phase2Pattern: [
      { 
        intent: "Canalisation : Dragon Aqueux (Suiryūdan) !", 
        channeling: true, 
        breakThreshold: 18, 
        channelDmg: 28, 
        denseMist: true,
        message: "Zabuza malaxe une énorme quantité de chakra aqueux ! Brise sa canalisation en lui infligeant 18 dégâts !" 
      },
      { intent: "Frénésie du Démon (6x3 dmg)", multiHit: 3, hitDmg: 6 },
      { intent: "Brume Meurtrière Absolue + 2 Fléaux", denseMist: true, addCurse: { key: "peur", count: 2, message: "La soif de sang de Zabuza t'étouffe !" } },
      { intent: "Tranchage Brutal (16 dmg) + Garde (10)", dmg: 16, shield: 10 }
    ]
  }
];
