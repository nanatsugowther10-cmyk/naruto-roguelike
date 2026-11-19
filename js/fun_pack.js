// ==========================================
// GAMEPLAY FUN PACK (RYTHME, RACCOURCIS & STYLE COMBO)
// ==========================================
const FunEngine = {
  comboChain: 0,
  lastTurnDamage: 0,

  onCardPlayed(card) {
    this.comboChain++;
    const logEl = document.getElementById("log");
    if (this.comboChain >= 3 && logEl && !logEl.innerText.includes("Finisher") && !logEl.innerText.includes("Combo")) {
      logEl.innerText = `⚡ Enchaînement x${this.comboChain} ! ${logEl.innerText}`;
    }
    this.updateStyleBadge();
  },

  onTurnReset() {
    this.comboChain = 0;
    this.updateStyleBadge();
  },

  updateStyleBadge() {
    let badge = document.getElementById("combo-style-badge");
    if (!badge) {
      const footer = document.querySelector("footer");
      if (!footer) return;
      badge = document.createElement("div");
      badge.id = "combo-style-badge";
      footer.insertBefore(badge, document.getElementById("hand"));
    }
    if (this.comboChain <= 1) {
      badge.style.display = "none";
      return;
    }
    badge.style.display = "inline-flex";
    const tier = this.comboChain >= 5 ? "🔥 SHINOBI FURIE" : this.comboChain >= 3 ? "⚡ RYTHME SOUTENU" : "✨ ENCHAÎNEMENT";
    badge.innerText = `${tier} · ${this.comboChain} cartes jouées ce tour`;
  }
};

// Hook sur playCard pour suivre la chaîne de combo et ajouter un micro-feedback
const _basePlayCardForFun = playCard;
playCard = function(idx) {
  const beforeHandLen = state.hand.length;
  const beforeHp = state.enemy.hp;
  _basePlayCardForFun(idx);
  if (state.hand.length < beforeHandLen) {
    const playedCard = state.discard[state.discard.length - 1] || state.exhausted[state.exhausted.length - 1];
    FunEngine.onCardPlayed(playedCard);
    if (state.enemy.hp < beforeHp && (beforeHp - state.enemy.hp) >= 16) {
      spawnFloatingText("enemy-box", "FRAPPE LOURDE !", "damage");
    }
  }
};

// Hook sur endTurn pour réinitialiser le compteur de combo
const _baseEndTurnForFun = endTurn;
endTurn = function() {
  _baseEndTurnForFun();
  FunEngine.onTurnReset();
};

// Hook sur loadStage pour réinitialiser le badge de combo entre les combats
const _baseLoadStageForFun = loadStage;
loadStage = function(index) {
  FunEngine.onTurnReset();
  _baseLoadStageForFun(index);
};

// Raccourcis clavier pratiques (1-9 pour jouer une carte, E pour finir le tour)
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("keydown", (ev) => {
    if (isGameOver || busy) return;
    const mainMenu = document.getElementById("main-menu");
    if (mainMenu && mainMenu.style.display !== "none") return;
    if (typeof EventEngine !== "undefined" && EventEngine.active) return;
    if (typeof RoguelikeMode !== "undefined" && RoguelikeMode.active && storyPhase === "roguelike_map") return;
    if (ev.target && ["INPUT", "SELECT", "TEXTAREA"].includes(ev.target.tagName)) return;

    if (ev.key === "e" || ev.key === "E") {
      if (storyPhase === "combat" && typeof endTurn === "function") {
        endTurn();
      }
    } else if (/^[1-9]$/.test(ev.key)) {
      const cardIdx = Number(ev.key) - 1;
      if (storyPhase === "combat" && state.hand[cardIdx] && typeof playCard === "function") {
        playCard(cardIdx);
      }
    }
  });
}
