// ==========================================
// PATTERNS ENNEMIS TACTIQUES & COHÉRENCE D'ARC
// ==========================================

// Correction de cohérence narrative :
// - Après Haku (index 2) dans l'Arc 1 (Pays des Vagues), la suite logique est le Repos chez Tazuna (3) puis Zabuza (4).
// - Dans l'Arc 3 (Examen Chūnin), après Kiba & Akamaru (10), on choisit Jiraiya (12) ou Gamabunta (13), puis Neji (11) et enfin Gaara (14).
if (typeof STORY_BRANCHES !== "undefined") {
  STORY_BRANCHES[1] = {
    prompt: "Carrefour de Nami no Kuni : choisis ton approche vers le pont !",
    choices: [
      { label: "❄️ Défi d'Haku (Élite · +1 Relique)", action: () => loadStage(2) },
      { label: "🍜 Maison de Tazuna (Campement · Soin/Forge/Épuration)", action: () => openRestSite(3) }
    ]
  };
  STORY_BRANCHES[2] = {
    prompt: "Haku vaincu ! Prépare-toi avant d'affronter Zabuza sur le Grand Pont.",
    choices: [
      { label: "🍜 Maison de Tazuna (Campement avant Zabuza)", action: () => openRestSite(3) },
      { label: "🌉 Foncer vers le Pont (Combat contre Zabuza)", action: () => loadStage(3) }
    ]
  };
}

// Patterns tactiques supplémentaires (contre-mesures claires : clones, tempo, bouclier)
const TACTICAL_PATTERNS = {
  // Brigands du Port (index 0) : punition si le joueur a 0 clone en fin de tour
  0: [
    { intent: "Attaque (6 dmg)", dmg: 6 },
    { intent: "Défense (8 shield)", shield: 8 },
    { intent: "Coup sournois (7 dmg ; +4 si 0 clone)", dmg: 7, noCloneBonus: 4 }
  ],
  // Frères Démons (index 1) : punition si le joueur joue >= 3 cartes dans le tour
  1: [
    { intent: "Chaîne d'Acier (4x2 dmg)", multiHit: 2, hitDmg: 4 },
    { intent: "Riposte Vigilante (8 dmg ; +5 si ≥3 cartes jouées)", dmg: 8, busyTurnBonus: 5 },
    { intent: "Repli & Défense (10 shield)", shield: 10 }
  ]
};

// Applique les patterns tactiques enrichis aux étapes correspondantes
if (typeof STAGES !== "undefined") {
  for (const [idxStr, pat] of Object.entries(TACTICAL_PATTERNS)) {
    const idx = Number(idxStr);
    if (STAGES[idx]) STAGES[idx].pattern = pat;
  }
}

// Résolution tactique en fin de tour (Arc 1 : indices 0..3)
const _baseEndTurnForTactics = endTurn;
endTurn = function() {
  if (typeof Forest !== "undefined" && Forest.active && Forest.active()) {
    _baseEndTurnForTactics();
    return;
  }
  if (isGameOver || busy || state.enemy.hp <= 0) {
    _baseEndTurnForTactics();
    return;
  }

  const stage = STAGES[currentStageIndex];
  const activePattern = (stage && stage.hasPhase2 && state.enemy.inPhase2) ? stage.phase2Pattern : stage?.pattern;
  const move = activePattern ? activePattern[(state.enemy.turnCount - 1) % activePattern.length] : null;

  let extraTacticalDmg = 0;
  let tacticalReason = "";
  if (move) {
    if (move.noCloneBonus && state.player.clones === 0) {
      extraTacticalDmg += move.noCloneBonus;
      tacticalReason = ` (+${move.noCloneBonus} sans clone)`;
    }
    if (move.busyTurnBonus && state.player.cardsPlayedThisTurn >= 3) {
      extraTacticalDmg += move.busyTurnBonus;
      tacticalReason = ` (+${move.busyTurnBonus} pour ≥3 cartes jouées)`;
    }
  }

  if (extraTacticalDmg > 0 && move) {
    // Applique le bonus tactique temporairement sur le coup en cours pour ce tour
    const origDmg = move.dmg || 0;
    const origIntent = move.intent;
    move.dmg = origDmg + extraTacticalDmg;
    move.intent = `${origIntent}${tacticalReason}`;
    const logEl = document.getElementById("log");
    if (logEl) {
      logEl.innerText = `⚠️ Contre-attaque tactique : ${stage.name}${tacticalReason} !`;
    }
    _baseEndTurnForTactics();
    move.dmg = origDmg;
    move.intent = origIntent;
    return;
  }

  _baseEndTurnForTactics();
};
