// ==========================================
// 1. CONTRÔLEUR DU MENU PRINCIPAL (HISTOIRE / ROGUELIKE / OPTIONS)
// ==========================================
const MenuController = {
  view: "root",

  openStory() {
    this.view = "story";
    const root = document.getElementById("menu-root-view");
    const story = document.getElementById("menu-story-view");
    const sub = document.getElementById("menu-view-subtitle");
    const notice = document.getElementById("menu-mode-notice");
    if (root) root.hidden = true;
    if (story) story.hidden = false;
    if (sub) sub.innerText = "Mode Histoire";
    if (notice) notice.innerText = "";

    const btnContinue = document.getElementById("btn-continue");
    if (btnContinue) {
      btnContinue.style.display = hasSavedGame() ? "block" : "none";
    }
  },

  backToRoot() {
    this.view = "root";
    const root = document.getElementById("menu-root-view");
    const story = document.getElementById("menu-story-view");
    const sub = document.getElementById("menu-view-subtitle");
    const notice = document.getElementById("menu-mode-notice");
    if (root) root.hidden = false;
    if (story) story.hidden = true;
    if (sub) sub.innerText = "Shinobi Deckbuilder";
    if (notice) notice.innerText = "";
  },

  selectRoguelike() {
    const notice = document.getElementById("menu-mode-notice");
    if (notice) {
      notice.innerText = "Le mode Roguelike (runs aléatoires en 3 actes) arrive prochainement.";
    }
    if (typeof AudioEngine !== "undefined" && AudioEngine.play) {
      AudioEngine.play("block");
    }
  }
};

// Assure que quitter le tutoriel ou revenir au menu réinitialise proprement la vue
if (typeof MizukiTutorial !== "undefined" && MizukiTutorial.leave) {
  const _baseTutorialLeave = MizukiTutorial.leave.bind(MizukiTutorial);
  MizukiTutorial.leave = function(startStory) {
    const replay = this.replay;
    _baseTutorialLeave(startStory);
    if (!startStory || replay) {
      MenuController.backToRoot();
    }
  };
}

// ==========================================
// 2. CARTE DE PROGRESSION INTERACTIVE (BRANCHING)
// ==========================================
const STORY_BRANCHES = {
  // Arc 1 : Pays des Vagues
  1: {
    prompt: "Carrefour de Nami no Kuni : choisis ton itinéraire vers le pont !",
    choices: [
      { label: "❄️ Affronter Haku (Élite · Relique)", action: () => loadStage(2) },
      { label: "🍜 Sentier caché · Maison de Tazuna (Campement)", action: () => openRestSite(3) }
    ]
  },
  // Arc 2 : Forêt de la Mort (après l'Équipe Rivale à l'index 6)
  6: {
    prompt: "Carrefour de la Forêt : quelle équipe embusquer pour obtenir un parchemin ?",
    choices: [
      { label: "🎵 Équipe du Son (Parchemin Terre)", action: () => loadStage(7) },
      { label: "🌧️ Équipe de la Pluie (Parchemin Ciel)", action: () => loadStage(8) }
    ]
  },
  // Arc 3 : Examen Chûnin (après Kiba & Akamaru à l'index 10)
  10: {
    prompt: "Entraînement avant la finale : choisis ton maître !",
    choices: [
      { label: "🥷 Jiraiya (Contrôle du Chakra)", action: () => loadStage(12) },
      { label: "🐸 Gamabunta (Garde de l'Invocateur)", action: () => loadStage(13) }
    ]
  }
};

// Surcharge de la frise supérieure pour afficher les embranchements de chaque arc
const _baseUpdateNodeMap = updateNodeMap;
updateNodeMap = function(currentIndex) {
  const nodeMap = document.getElementById("node-map");
  if (!nodeMap) return;

  const arcNodes = currentIndex < 4
    ? [
        { idx: 0, icon: "⚓", label: "Port" },
        { idx: 1, icon: "🌲", label: "Marais" },
        { branch: [
          { idx: 2, icon: "❄️", label: "Haku (Élite)" },
          { idx: 3, icon: "🍜", label: "Tazuna" }
        ]},
        { idx: 3, icon: "🌉", label: "Zabuza" }
      ]
    : currentIndex < 10
      ? [
          { idx: 4, icon: "🥷", label: "Éclaireur" },
          { idx: 5, icon: "🐍", label: "Serpent" },
          { idx: 6, icon: "⚔️", label: "Rivaux" },
          { branch: [
            { idx: 7, icon: "🎵", label: "Son" },
            { idx: 8, icon: "🌧️", label: "Pluie" }
          ]},
          { idx: 9, icon: "🐍", label: "Orochimaru" }
        ]
      : [
          { idx: 10, icon: "🐕", label: "Kiba" },
          { branch: [
            { idx: 12, icon: "🥷", label: "Jiraiya" },
            { idx: 13, icon: "🐸", label: "Gamabunta" }
          ]},
          { idx: 11, icon: "👁️", label: "Neji" },
          { idx: 14, icon: "🏜️", label: "Gaara" }
        ];

  nodeMap.innerHTML = arcNodes.map((item, pos) => {
    const line = pos > 0 ? `<div class="node-line"></div>` : "";
    if (item.branch) {
      const sub = item.branch.map(b => {
        const cls = b.idx === currentIndex ? "active" : b.idx < currentIndex ? "completed" : "";
        return `<div class="node ${cls}" style="flex-direction:row;gap:4px;">
          <span class="node-icon" style="width:20px;height:20px;font-size:10px;">${b.icon}</span>
          <span class="node-label" style="margin:0;">${b.label}</span>
        </div>`;
      }).join("");
      return `${line}<div class="node-branch-group">${sub}</div>`;
    }
    const cls = item.idx === currentIndex ? "active" : item.idx < currentIndex ? "completed" : "";
    return `${line}<div class="node ${cls}" id="node-${item.idx}">
      <span class="node-icon">${item.icon}</span>
      <span class="node-label">${item.label}</span>
    </div>`;
  }).join("");
};

// Surcharge de l'écran de récompense pour proposer l'embranchement après choix de carte
const _baseHandleStageVictory = handleStageVictory;
handleStageVictory = function() {
  const branch = STORY_BRANCHES[currentStageIndex];
  _baseHandleStageVictory();
  if (!branch) return;

  const picker = document.getElementById("rewards-picker");
  if (!picker) return;

  const renderBranchChoice = () => {
    document.getElementById("overlay-title").innerText = "Embranchement Tactique";
    document.getElementById("overlay-sub").innerText = branch.prompt;
    picker.replaceChildren();
    branch.choices.forEach(ch => {
      const btn = document.createElement("button");
      btn.className = "menu-btn node-choice";
      btn.style.padding = "14px 20px";
      btn.style.width = "auto";
      btn.textContent = ch.label;
      btn.onclick = () => {
        document.getElementById("overlay").style.display = "none";
        ch.action();
      };
      picker.appendChild(btn);
    });
  };

  [...picker.children].forEach(child => {
    child.onclick = () => {
      if (child.classList.contains("reward-card") || child.classList.contains("card")) {
        const cardName = child.querySelector(".card-title")?.innerText;
        const found = [...REWARD_OPTIONS, ...EXAM_REWARDS, ...TRAINING_REWARDS].find(c => c.name === cardName);
        if (found) state.deck.push({ ...found });
      }
      renderBranchChoice();
    };
  });
};

// ==========================================
// 3. ÉPURATION DE DECK AU CAMPEMENT (-1 CARTE)
// ==========================================
function openPurgePicker() {
  const restChoices = document.getElementById("rest-choices");
  const picker = document.getElementById("upgrade-picker");
  if (restChoices) restChoices.style.display = "none";
  if (!picker) return;

  picker.style.display = "flex";
  picker.innerHTML = "";

  if (state.deck.length <= 5) {
    picker.innerHTML = `<p style="color:#ef4444;">Ton deck est déjà minimal (5 cartes minimum).</p>`;
    TimerManager.set(() => { takeRest(); }, 1200);
    return;
  }

  state.deck.forEach((card, idx) => {
    const el = document.createElement("div");
    el.className = `card card-${card.type} card-purge-hover`;
    el.innerHTML = `
      <div class="card-top">
        <span class="card-title">${card.name}</span>
        <span class="card-cost">${card.cost}</span>
      </div>
      <div class="card-art">
        <img class="card-img-el" alt="${card.name}">
        <span class="card-art-placeholder" style="display:none;">${card.icon || "🎴"}</span>
      </div>
      <div class="card-desc" style="color:#fca5a5;">Retirer définitivement cette carte du deck.</div>
      <div class="card-tag">Épuration</div>
    `;
    resolveImgSrc(el.querySelector(".card-img-el"), card.img, card.icon);

    el.onclick = () => {
      state.deck.splice(idx, 1);
      AudioEngine.play("clone");
      spawnFloatingText("naruto-box", "-1 Carte", "miss");
      const restScreen = document.getElementById("rest-screen");
      if (restScreen) restScreen.style.display = "none";
      loadStage(restNextStage);
    };
    picker.appendChild(el);
  });
}
