// ==========================================
// MÉCANIQUES TACTIQUES FUN : TRIPLE SIGNE & CANALISATION RISQUÉE
// ==========================================
const JutsuFlow = {
  typesPlayedThisTurn: new Set(),
  sealTriggeredThisTurn: false,
  channelUsedThisTurn: false,

  resetTurn() {
    this.typesPlayedThisTurn.clear();
    this.sealTriggeredThisTurn = false;
    this.channelUsedThisTurn = false;
    this.renderChannelButton();
  },

  onCardPlayed(card) {
    if (!card || this.sealTriggeredThisTurn) return;
    if (card.type) {
      this.typesPlayedThisTurn.add(card.type);
    }
    // Synergie de variété : 3 types de cartes différents dans le même tour déclenche le Triple Signe !
    if (this.typesPlayedThisTurn.size >= 3) {
      this.sealTriggeredThisTurn = true;
      state.player.chakra += 1;
      state.player.shield += 5;
      if (state.enemy && state.enemy.hp > 0 && !STAGES[currentStageIndex]?.forest) {
        dealDamageToEnemy(7);
      } else if (typeof Forest !== "undefined" && Forest.active && Forest.active() && Forest.alive().length > 0) {
        Forest.ensureTarget();
        dealDamageToEnemy(7);
      }
      AudioEngine.play("break");
      EventBus.emit("combat:break");
      spawnFloatingText("naruto-box", "TRIPLE SIGNE !", "heal");
      const logEl = document.getElementById("log");
      if (logEl) {
        logEl.innerText = "⚡ TRIPLE SIGNE NINJA (3 types de cartes) ! +1 Chakra, +5 Bouclier et 7 dégâts !";
      }
      updateUI();
    }
  },

  channelRiskChakra() {
    if (typeof isGameOver !== "undefined" && isGameOver) return;
    if (typeof busy !== "undefined" && busy) return;
    if (typeof storyPhase !== "undefined" && storyPhase !== "combat") return;
    if (this.channelUsedThisTurn) return;
    if (state.player.hp <= 6) {
      const logEl = document.getElementById("log");
      if (logEl) logEl.innerText = "PV trop bas pour forcer le flux de Chakra !";
      return;
    }

    this.channelUsedThisTurn = true;
    state.player.hp = Math.max(1, state.player.hp - 5);
    state.player.chakra += 1;
    triggerShake("naruto-box");
    spawnFloatingText("naruto-box", "-5 PV", "damage");
    spawnFloatingText("naruto-box", "+1 Chakra", "heal");
    EventBus.emit("combat:hit", { targetBoxId: "naruto-box", amount: 5 });
    JuiceFX.popStat("chakra-display");
    AudioEngine.play("kyubi");

    const logEl = document.getElementById("log");
    if (logEl) {
      logEl.innerText = "🔥 Flux forcé : -5 PV pour gagner +1 Chakra supplémentaire ce tour !";
    }

    this.renderChannelButton();
    updateUI();
    checkPlayerDeath();
  },

  renderChannelButton() {
    const footer = document.querySelector("footer");
    if (!footer) return;
    let btn = document.getElementById("force-chakra-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "force-chakra-btn";
      btn.type = "button";
      btn.className = "menu-btn";
      btn.onclick = () => this.channelRiskChakra();
      const endBtn = document.getElementById("end-turn-btn");
      if (endBtn && endBtn.parentNode === footer) {
        footer.insertBefore(btn, endBtn);
      } else {
        footer.appendChild(btn);
      }
    }
    btn.disabled = this.channelUsedThisTurn || (typeof isGameOver !== "undefined" && isGameOver) || (typeof busy !== "undefined" && busy);
    btn.innerText = this.channelUsedThisTurn
      ? "Flux forcé utilisé ce tour"
      : "🔥 Forcer le Chakra (+1 Chakra / -5 PV)";
  }
};

// Hooks propres sur la boucle de jeu
const _basePlayCardForFlow = playCard;
playCard = function(idx) {
  const beforeLen = state.hand.length;
  _basePlayCardForFlow(idx);
  if (state.hand.length < beforeLen) {
    const playedCard = state.discard[state.discard.length - 1] || state.exhausted[state.exhausted.length - 1];
    JutsuFlow.onCardPlayed(playedCard);
  }
};

const _baseEndTurnForFlow = endTurn;
endTurn = function() {
  _baseEndTurnForFlow();
  JutsuFlow.resetTurn();
};

const _baseLoadStageForFlow = loadStage;
loadStage = function(index) {
  _baseLoadStageForFlow(index);
  JutsuFlow.resetTurn();
};
