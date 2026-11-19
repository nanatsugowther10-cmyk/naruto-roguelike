// ==========================================
// MÉCANIQUE SIMPLE & FUN : SECOND SOUFFLE (1X PAR COMBAT)
// ==========================================
const SecondWind = {
  triggeredThisCombat: false,

  resetCombat() {
    this.triggeredThisCombat = false;
  },

  checkTrigger() {
    if (this.triggeredThisCombat) return;
    if (typeof isGameOver !== "undefined" && isGameOver) return;
    if (!state || !state.player || state.player.hp <= 0) return;

    const thresholdHp = Math.floor(state.player.maxHp * 0.35);
    if (state.player.hp <= thresholdHp) {
      this.triggeredThisCombat = true;
      state.player.shield += 8;
      state.player.chakra += 1;

      if (typeof AudioEngine !== "undefined" && AudioEngine.play) {
        AudioEngine.play("break");
      }
      if (typeof EventBus !== "undefined" && EventBus.emit) {
        EventBus.emit("combat:shield", { targetBoxId: "naruto-box" });
      }
      if (typeof JuiceFX !== "undefined" && JuiceFX.popStat) {
        JuiceFX.popStat("chakra-display");
        JuiceFX.popStat("player-shield");
      }
      if (typeof spawnFloatingText === "function") {
        spawnFloatingText("naruto-box", "SECOND SOUFFLE !", "heal");
        spawnFloatingText("naruto-box", "+8 Bouclier · +1 Chakra", "shield");
      }
      const logEl = document.getElementById("log");
      if (logEl) {
        logEl.innerText = "🔥 SECOND SOUFFLE ! Acculé, Naruto gagne +8 Bouclier et +1 Chakra !";
      }
      if (typeof updateUI === "function") updateUI();
    }
  }
};

// Réinitialise à chaque chargement d'étape
const _baseLoadStageForSecondWind = loadStage;
loadStage = function(index) {
  SecondWind.resetCombat();
  _baseLoadStageForSecondWind(index);
};

// Vérifie après les coups reçus ou le contrecoup d'une carte
const _baseHitPlayerForSecondWind = hitPlayer;
hitPlayer = function(amt) {
  _baseHitPlayerForSecondWind(amt);
  SecondWind.checkTrigger();
};

const _basePlayCardForSecondWind = playCard;
playCard = function(idx) {
  _basePlayCardForSecondWind(idx);
  SecondWind.checkTrigger();
};
