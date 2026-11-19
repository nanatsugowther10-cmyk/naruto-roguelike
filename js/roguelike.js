// ==========================================
// MODE ROGUELIKE (RUNS REJOUABLES À EMBRANCHEMENTS)
// ==========================================
const RoguelikeMode = {
  active: false,
  act: 1,
  floor: 0,
  maxFloors: 6,
  rows: [],
  currentNodeId: null,
  completedIds: new Set(),
  runScore: 0,
  elitesDefeated: 0,

  nodeTypes: {
    combat: { icon: "⚔️", label: "Combat", color: "#f59e0b" },
    elite:  { icon: "👹", label: "Élite", color: "#ef4444" },
    event:  { icon: "📜", label: "Événement", color: "#38bdf8" },
    rest:   { icon: "🔥", label: "Campement", color: "#22c55e" },
    boss:   { icon: "👑", label: "Boss", color: "#a855f7" }
  },

  generateMap() {
    this.rows = [];
    this.completedIds.clear();
    this.floor = 0;

    // Rangée 0 : départ unique
    this.rows.push([
      { id: "r0_n0", row: 0, col: 0, type: "combat", stagePool: [0, 1, 4], next: ["r1_n0", "r1_n1"] }
    ]);

    // Rangée 1 : choix tactique (Élite ou Événement)
    this.rows.push([
      { id: "r1_n0", row: 1, col: 0, type: "elite", stagePool: [2, 7, 8], next: ["r2_n0"] },
      { id: "r1_n1", row: 1, col: 1, type: "event", eventIdx: 0, next: ["r2_n0"] }
    ]);

    // Rangée 2 : Campement ou Combat intermédiaire
    this.rows.push([
      { id: "r2_n0", row: 2, col: 0, type: "rest", next: ["r3_n0", "r3_n1"] }
    ]);

    // Rangée 3 : double embranchement (Événement ou Élite)
    this.rows.push([
      { id: "r3_n0", row: 3, col: 0, type: "event", eventIdx: 1, next: ["r4_n0"] },
      { id: "r3_n1", row: 3, col: 1, type: "elite", stagePool: [2, 10, 11], next: ["r4_n0"] }
    ]);

    // Rangée 4 : dernier campement avant le Boss
    this.rows.push([
      { id: "r4_n0", row: 4, col: 0, type: "rest", next: ["r5_n0"] }
    ]);

    // Rangée 5 : Boss final du run
    this.rows.push([
      { id: "r5_n0", row: 5, col: 0, type: "boss", stagePool: [3, 9, 14], next: [] }
    ]);

    this.currentNodeId = null;
  },

  startRun() {
    if (typeof assetsReady !== "undefined" && !assetsReady) return;
    if (typeof AudioEngine !== "undefined" && AudioEngine.init) AudioEngine.init();
    if (typeof TimerManager !== "undefined" && TimerManager.clearAll) TimerManager.clearAll();
    if (typeof JuiceFX !== "undefined" && JuiceFX.reset) JuiceFX.reset();
    if (typeof EventEngine !== "undefined" && EventEngine.reset) EventEngine.reset();

    this.active = true;
    this.runScore = 0;
    this.elitesDefeated = 0;

    // Prépare un deck de départ propre sans toucher à la sauvegarde Histoire
    isGameOver = false;
    busy = false;
    storyPhase = "roguelike_map";
    activeRelic = null;
    state.player.hp = cfg.startingHp;
    state.player.maxHp = cfg.startingHp;
    state.player.shield = 0;
    state.player.chakra = cfg.startingChakra;
    state.player.maxChakra = cfg.startingChakra;
    state.player.clones = 0;
    state.player.willOfFire = false;
    state.player.cardsPlayedThisTurn = 0;
    state.player.nextAttackFree = false;

    const relicsBar = document.getElementById("relics-bar");
    if (relicsBar) relicsBar.innerText = "Relique : Aucune";

    state.deck = [
      { ...CARDS_POOL[0] }, { ...CARDS_POOL[0] }, { ...CARDS_POOL[0] },
      { ...CARDS_POOL[1] }, { ...CARDS_POOL[1] }, { ...CARDS_POOL[1] },
      { ...CARDS_POOL[2] }, { ...CARDS_POOL[2] },
      { ...CARDS_POOL[3] },
      { ...CARDS_POOL[4] }
    ];
    state.hand = [];
    state.discard = [];
    state.exhausted = [];

    const narutoImg = document.getElementById("naruto-img");
    if (narutoImg) resolveImgSrc(narutoImg, "naruto.png");

    const mainMenu = document.getElementById("main-menu");
    if (mainMenu) mainMenu.style.display = "none";

    this.generateMap();
    this.openMapModal();
  },

  getSelectableNodes() {
    if (!this.currentNodeId) return this.rows[0] || [];
    const curr = this.rows.flat().find(n => n.id === this.currentNodeId);
    if (!curr || !curr.next) return [];
    return this.rows.flat().filter(n => curr.next.includes(n.id));
  },

  openMapModal() {
    if (!this.active) return;
    storyPhase = "roguelike_map";
    let modal = document.getElementById("roguelike-map-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "roguelike-map-modal";
      modal.innerHTML = `<div class="modal-box roguelike-map-box">
        <div class="event-badge">Mode Roguelike · Run Shinobi</div>
        <h2 id="rl-map-title">Carte d'Embranchements</h2>
        <p id="rl-map-sub">Choisis la prochaine étape de ton run.</p>
        <div id="rl-map-grid"></div>
        <div class="rl-map-footer">
          <button type="button" class="menu-btn menu-btn-back" onclick="RoguelikeMode.abandonRun()">Abandonner le run</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
    }

    const selectableIds = new Set(this.getSelectableNodes().map(n => n.id));
    const grid = modal.querySelector("#rl-map-grid");
    grid.replaceChildren();

    document.getElementById("rl-map-title").innerText =
      `Run Shinobi · PV ${state.player.hp}/${state.player.maxHp} · Score ${this.runScore}`;

    [...this.rows].reverse().forEach(rowNodes => {
      const rowEl = document.createElement("div");
      rowEl.className = "rl-map-row";

      rowNodes.forEach(node => {
        const meta = this.nodeTypes[node.type] || this.nodeTypes.combat;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rl-node-btn";
        const isDone = this.completedIds.has(node.id);
        const isAvailable = selectableIds.has(node.id) && !isDone;

        if (isDone) btn.classList.add("rl-node-done");
        else if (isAvailable) btn.classList.add("rl-node-available");
        else btn.classList.add("rl-node-locked");

        btn.disabled = !isAvailable;
        btn.innerHTML = `<span class="rl-node-icon">${meta.icon}</span><span>${meta.label}</span>`;
        btn.onclick = () => this.selectNode(node);
        rowEl.appendChild(btn);
      });

      grid.appendChild(rowEl);
    });

    modal.style.display = "flex";
  },

  closeMapModal() {
    const modal = document.getElementById("roguelike-map-modal");
    if (modal) modal.style.display = "none";
  },

  selectNode(node) {
    this.currentNodeId = node.id;
    this.floor = node.row + 1;
    this.closeMapModal();

    if (node.type === "rest") {
      storyPhase = "rest";
      openRestSite(currentStageIndex);
      return;
    }

    if (node.type === "event" && typeof EventEngine !== "undefined" && typeof STORY_EVENTS_POOL !== "undefined") {
      const ev = STORY_EVENTS_POOL[node.eventIdx % STORY_EVENTS_POOL.length];
      storyPhase = "event_resolved";
      EventEngine.open(ev, () => {
        this.completedIds.add(node.id);
        this.runScore += 25;
        this.openMapModal();
      });
      return;
    }

    const pool = node.stagePool || [0];
    const stageIdx = pool[Math.floor(Math.random() * pool.length)];
    this.pendingNode = node;
    storyPhase = "combat";

    // Lance le combat directement sans déclencher un événement imbriqué
    const prevSeen = EventEngine && EventEngine.seenEvents ? new Set(EventEngine.seenEvents) : null;
    if (prevSeen) {
      STORY_EVENTS_POOL.forEach(e => EventEngine.seenEvents.add(e.id));
    }
    loadStage(stageIdx);
    if (prevSeen) {
      EventEngine.seenEvents = prevSeen;
    }
  },

  onNodeCleared() {
    if (!this.active || !this.pendingNode) return;
    const node = this.pendingNode;
    this.pendingNode = null;
    this.completedIds.add(node.id);
    this.runScore += node.type === "boss" ? 150 : node.type === "elite" ? 80 : 40;
    if (node.type === "elite") this.elitesDefeated++;

    if (node.type === "boss") {
      this.showRunSummary(true);
      return;
    }

    this.openMapModal();
  },

  showRunSummary(victory) {
    this.active = false;
    this.closeMapModal();
    const overlay = document.getElementById("overlay");
    if (!overlay) return;
    overlay.style.display = "flex";
    document.getElementById("overlay-title").innerText = victory
      ? "RUN ROGUELIKE REMPORTÉ !"
      : "FIN DU RUN ROGUELIKE";
    document.getElementById("overlay-title").style.color = victory ? "#22c55e" : "#ef4444";
    document.getElementById("overlay-sub").innerText =
      `Score final : ${this.runScore} pts · Étapes franchies : ${this.completedIds.size} · Élites vaincus : ${this.elitesDefeated}`;
    const picker = document.getElementById("rewards-picker");
    picker.innerHTML = `<button class="menu-btn primary-btn" style="padding:12px 24px;" onclick="RoguelikeMode.startRun()">Nouveau Run</button>
      <button class="menu-btn" style="padding:12px 24px;" onclick="location.reload()">Menu Principal</button>`;
  },

  abandonRun() {
    this.active = false;
    this.closeMapModal();
    location.reload();
  }
};

// Active le bouton Roguelike dans le menu principal
if (typeof MenuController !== "undefined") {
  MenuController.selectRoguelike = function() {
    RoguelikeMode.startRun();
  };
}

// Intercepte les transitions de fin de combat / repos en mode Roguelike
const _baseHandleVictoryForRL = handleStageVictory;
handleStageVictory = function() {
  if (RoguelikeMode.active) {
    if (storyPhase === "reward") return;
    storyPhase = "reward";
    TimerManager.clearAll();
    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    const picker = document.getElementById("rewards-picker");
    picker.innerHTML = "";
    document.getElementById("overlay-title").innerText = `Victoire · ${STAGES[currentStageIndex].name}`;
    document.getElementById("overlay-title").style.color = "#f59e0b";
    document.getElementById("overlay-sub").innerText = "Ajoute une technique à ton run ou poursuis :";

    const options = [...REWARD_OPTIONS].sort(() => 0.5 - Math.random()).slice(0, 3);
    options.forEach(reward => {
      const el = document.createElement("div");
      el.className = `card card-${reward.type}`;
      el.style.transform = "scale(1.05)";
      el.innerHTML = `<div class="card-top"><span class="card-title">${reward.name}</span><span class="card-cost">${reward.cost}</span></div><div class="card-art"><img class="card-img-el" alt="${reward.name}"><span class="card-art-placeholder" style="display:none;">${reward.icon || "🎴"}</span></div><div class="card-desc">${reward.desc}</div><div class="card-tag">${reward.type}</div>`;
      resolveImgSrc(el.querySelector(".card-img-el"), reward.img, reward.icon);
      el.onclick = () => {
        state.deck.push({ ...reward });
        overlay.style.display = "none";
        RoguelikeMode.onNodeCleared();
      };
      picker.appendChild(el);
    });

    const skipBtn = document.createElement("button");
    skipBtn.className = "menu-btn";
    skipBtn.style.padding = "10px 20px";
    skipBtn.textContent = "Continuer sans carte";
    skipBtn.onclick = () => {
      overlay.style.display = "none";
      RoguelikeMode.onNodeCleared();
    };
    picker.appendChild(skipBtn);
    return;
  }
  _baseHandleVictoryForRL();
};

const _baseTakeRestForRL = takeRest;
takeRest = function() {
  if (RoguelikeMode.active) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + cfg.restHealAmount);
    AudioEngine.play("kyubi");
    spawnFloatingText("naruto-box", `+${cfg.restHealAmount}`, "heal");
    const restScreen = document.getElementById("rest-screen");
    if (restScreen) restScreen.style.display = "none";
    updateUI();
    if (RoguelikeMode.currentNodeId) RoguelikeMode.completedIds.add(RoguelikeMode.currentNodeId);
    RoguelikeMode.runScore += 20;
    RoguelikeMode.openMapModal();
    return;
  }
  _baseTakeRestForRL();
};
