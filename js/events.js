// ==========================================
// SYSTÈME D'ÉVÉNEMENTS & RENCONTRES À CHOIX
// ==========================================
const STORY_EVENTS_POOL = [
  {
    id: "ichiraku_stand",
    arc: "Pays des Vagues · Halte imprévue",
    icon: "🍜",
    title: "Marchand Ambulant d'Ichiraku",
    desc: "Un cuisinier itinérant reconnaît le bandeau de Konoha et te propose un bol fumant avant la traversée.",
    choices: [
      {
        title: "Dévorer un bol Miso Chāshū (+10 PV Max & +15 PV)",
        sub: "Renforce durablement ton endurance pour la suite du run.",
        apply() {
          state.player.maxHp += 10;
          state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
          AudioEngine.play("kyubi");
          spawnFloatingText("naruto-box", "+10 PV Max", "heal");
        }
      },
      {
        title: "Méditer au calme (Améliore 1 technique aléatoire)",
        sub: "Renforce gratuitement une carte de base de ton deck.",
        apply() {
          const upgradable = state.deck.filter(c => !c.upgraded && ["Coup de Poing", "Kawarimi", "Kage Bunshin"].includes(c.name));
          if (upgradable.length > 0) {
            const pick = upgradable[Math.floor(Math.random() * upgradable.length)];
            upgradeCard(pick);
            AudioEngine.play("block");
            spawnFloatingText("naruto-box", `${pick.name} !`, "shield");
          } else {
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + 12);
          }
        }
      },
      {
        title: "Poursuivre immédiatement (+5 Bouclier au prochain combat)",
        sub: "Garde ton rythme sans perdre de temps.",
        apply() {
          state.player.shield += 5;
          AudioEngine.play("block");
        }
      }
    ]
  },
  {
    id: "rouleau_interdit",
    arc: "Forêt de la Mort · Cachette Ninja",
    icon: "📜",
    title: "Parchemin Scellé Abandonné",
    desc: "Au pied d'un arbre géant repose un rouleau couvert de sceaux de confinement. Une aura sombre s'en dégage.",
    choices: [
      {
        title: "Briser le sceau (Obtiens 1 technique rare, perds 8 PV)",
        sub: "Ajoute une carte avancée à ton deck au prix d'un contrecoup.",
        apply() {
          state.player.hp = Math.max(1, state.player.hp - 8);
          const pool = REWARD_OPTIONS.filter(c => !state.deck.some(d => d.id === c.id));
          const reward = (pool.length ? pool : REWARD_OPTIONS)[Math.floor(Math.random() * (pool.length || REWARD_OPTIONS.length))];
          state.deck.push({ ...reward });
          AudioEngine.play("kyubi");
          spawnFloatingText("naruto-box", `+${reward.name}`, "heal");
        }
      },
      {
        title: "Purifier le rouleau (Retire 1 carte faible de ton deck)",
        sub: "Épure ton deck pour piocher tes combos plus régulièrement.",
        apply() {
          const idx = state.deck.findIndex(c => c.id === "poing" && !c.upgraded);
          if (idx !== -1 && state.deck.length > 5) {
            state.deck.splice(idx, 1);
            AudioEngine.play("clone");
            spawnFloatingText("naruto-box", "-1 Coup de Poing", "miss");
          } else {
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + 10);
          }
        }
      },
      {
        title: "Ignorer le piège (+10 PV)",
        sub: "Prudence ninja : récupère ton souffle.",
        apply() {
          state.player.hp = Math.min(state.player.maxHp, state.player.hp + 10);
          AudioEngine.play("block");
        }
      }
    ]
  },
  {
    id: "conseil_kakashi",
    arc: "Examen Chūnin · Vestiaires de l'Arène",
    icon: "⚡",
    title: "Briefing Tactique de Kakashi",
    desc: "Kakashi apparaît dans un nuage de fumée : « Tes adversaires analysent tes habitudes. Adapte ton style. »",
    choices: [
      {
        title: "Entraînement au contrôle du Chakra (+15 PV)",
        sub: "Stabilise ton flux avant les combats d'éliminatoires.",
        apply() {
          state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
          AudioEngine.play("block");
          spawnFloatingText("naruto-box", "+15 PV", "heal");
        }
      },
      {
        title: "Apprendre l'Orbe Tourbillonnant (Ajoute Orbe Tourbillonnant)",
        sub: "Technique de combo qui gagne +3 dégâts par carte jouée ce tour.",
        apply() {
          const rasengan = CARDS_POOL.find(c => c.id === "rasengan_tourbillon") || CARDS_POOL[5];
          state.deck.push({ ...rasengan });
          AudioEngine.play("kyubi");
          spawnFloatingText("naruto-box", "+Orbe Tourbillonnant", "heal");
        }
      }
    ]
  }
];

const EventEngine = {
  active: false,
  pendingCallback: null,
  seenEvents: new Set(),

  eventForStage(stageIndex) {
    if (stageIndex === 0) return STORY_EVENTS_POOL[0];
    if (stageIndex === 5) return STORY_EVENTS_POOL[1];
    if (stageIndex === 12 || stageIndex === 13) return STORY_EVENTS_POOL[2];
    return null;
  },

  open(eventObj, onComplete) {
    const modal = document.getElementById("event-modal");
    if (!modal || !eventObj) {
      if (onComplete) onComplete();
      return;
    }
    this.active = true;
    this.pendingCallback = onComplete;
    this.seenEvents.add(eventObj.id);

    document.getElementById("event-arc-badge").innerText = eventObj.arc;
    document.getElementById("event-icon").innerText = eventObj.icon;
    document.getElementById("event-title").innerText = eventObj.title;
    document.getElementById("event-desc").innerText = eventObj.desc;

    const choicesBox = document.getElementById("event-choices");
    choicesBox.replaceChildren();

    eventObj.choices.forEach(ch => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "event-choice-btn";
      btn.innerHTML = `
        <span class="event-choice-title">${ch.title}</span>
        <span class="event-choice-sub">${ch.sub}</span>
      `;
      btn.onclick = () => {
        if (!this.active) return;
        this.active = false;
        modal.style.display = "none";
        ch.apply();
        updateUI();
        saveGame();
        const cb = this.pendingCallback;
        this.pendingCallback = null;
        if (cb) cb();
      };
      choicesBox.appendChild(btn);
    });

    modal.style.display = "flex";
  },

  reset() {
    this.active = false;
    this.pendingCallback = null;
    this.seenEvents.clear();
    const modal = document.getElementById("event-modal");
    if (modal) modal.style.display = "none";
  }
};

// Hook sur loadStage pour intercaler l'événement narratif avant certains combats clés
const _baseLoadStageForEvents = loadStage;
loadStage = function(index) {
  const ev = EventEngine.eventForStage(index);
  if (ev && !EventEngine.seenEvents.has(ev.id) && storyPhase !== "event_resolved") {
    storyPhase = "event_resolved";
    EventEngine.open(ev, () => _baseLoadStageForEvents(index));
    return;
  }
  _baseLoadStageForEvents(index);
};

// Réinitialise les événements vus lors d'une nouvelle partie
const _baseInitNewGameForEvents = initNewGame;
initNewGame = function() {
  EventEngine.reset();
  _baseInitNewGameForEvents();
};
