// --- MOTEUR AUDIO SYNTHÉTIQUE (Web Audio API) ---
const AudioEngine = {
  ctx: null,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  play(type) {
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (type === "hit") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

    } else if (type === "block") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);

    } else if (type === "clone") {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(250, now + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

    } else if (type === "slash") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);

    } else if (type === "kyubi") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.35);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }
};

// --- ÉTAT DU JEU ---
let currentStageIndex = 0;
let activeRelic = null;
let isGameOver = false;

const state = {
  player: { hp: 60, maxHp: 60, shield: 0, chakra: 3, maxChakra: 3, clones: 0 },
  enemy: { hp: 38, maxHp: 38, shield: 0, mist: false, turnCount: 1 },
  deck: [],
  hand: [],
  discard: []
};

function initGame() {
  isGameOver = false;
  state.deck = [
    { ...CARDS_POOL[0] }, { ...CARDS_POOL[0] }, { ...CARDS_POOL[0] },
    { ...CARDS_POOL[1] }, { ...CARDS_POOL[1] }, { ...CARDS_POOL[1] },
    { ...CARDS_POOL[2] }, { ...CARDS_POOL[2] },
    { ...CARDS_POOL[3] },
    { ...CARDS_POOL[4] }
  ];
  loadStage(0);
}

function loadStage(index) {
  currentStageIndex = index;
  const stage = STAGES[index];
  
  document.body.className = stage.bgClass;
  document.getElementById("stage-title").innerText = stage.title;

  // Réinitialisation de l'ennemi
  state.enemy.hp = stage.maxHp;
  state.enemy.maxHp = stage.maxHp;
  state.enemy.shield = 0;
  state.enemy.mist = false;
  state.enemy.turnCount = 1;

  // Réinitialisation du joueur pour le nouveau combat (Fix Bug Chakra & Bouclier)
  state.player.shield = 0;
  state.player.chakra = state.player.maxChakra;
  state.player.clones = 0;
  renderClones();

  if (activeRelic && activeRelic.onCombatStart) {
    activeRelic.onCombatStart(state);
  }

  const enemyImg = document.getElementById("enemy-img");
  enemyImg.src = stage.sprite;

  // Recyclage complet des cartes (pioche + main + défausse mélangées)
  state.deck.push(...state.hand, ...state.discard);
  state.hand = [];
  state.discard = [];
  shuffle(state.deck);

  drawCards(4);
  updateUI();
  document.getElementById("log").innerText = `Combat : ${stage.name} !`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function drawCards(n) {
  for (let i = 0; i < n; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break;
      state.deck = state.discard.slice();
      state.discard = [];
      shuffle(state.deck);
    }
    if (state.deck.length > 0) state.hand.push(state.deck.pop());
  }
  renderHand();
  updateCounters();
}

function renderClones() {
  const container = document.getElementById("clones-container");
  container.innerHTML = "";
  for (let i = 0; i < Math.min(state.player.clones, 4); i++) {
    const img = document.createElement("img");
    img.src = "assets/characters/naruto.png";
    img.className = "clone-sprite";
    img.onerror = () => { img.style.display = "none"; };
    container.appendChild(img);
  }
  document.getElementById("player-clones-txt").innerText = `Clones actifs : ${state.player.clones}`;
}

function triggerShake(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function checkPlayerDeath() {
  if (state.player.hp <= 0 && !isGameOver) {
    isGameOver = true;
    state.player.hp = 0;
    updateUI();
    showGameOverScreen();
    return true;
  }
  return false;
}

function showGameOverScreen() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "flex";
  document.getElementById("overlay-title").innerText = "DÉFAITE...";
  document.getElementById("overlay-title").style.color = "#ef4444";
  document.getElementById("overlay-sub").innerText = "Naruto est tombé au combat. La mission du Pays des Vagues a échoué.";
  
  const picker = document.getElementById("rewards-picker");
  picker.innerHTML = `
    <button id="end-turn-btn" style="padding:14px 32px; font-size:16px; background:#b91c1c;" onclick="location.reload()">
      Réessayer la mission
    </button>
  `;
}

function playCard(idx) {
  if (isGameOver) return;
  const card = state.hand[idx];
  if (!card || state.player.chakra < card.cost) return;

  state.player.chakra -= card.cost;

  if (card.type === "kyubi") AudioEngine.play("kyubi");
  else if (card.shield > 0) AudioEngine.play("block");
  else if (card.clones > 0) AudioEngine.play("clone");
  else AudioEngine.play("hit");

  // Dégâts personnels (Kyûbi)
  if (card.selfDmg) {
    state.player.hp = Math.max(0, state.player.hp - card.selfDmg);
    triggerShake("naruto-box");
    if (activeRelic && activeRelic.onDamage) activeRelic.onDamage(state);
    if (checkPlayerDeath()) return;
  }

  if (card.chakraGain) state.player.chakra += card.chakraGain;
  if (card.shield) state.player.shield += card.shield;
  if (card.clones) {
    state.player.clones += card.clones;
    renderClones();
  }

  // Bonus passif Volonté du Feu
  if (card.buffWill) {
    state.player.willOfFire = true;
    document.getElementById("log").innerText = "Volonté du Feu éveillée ! Dégâts augmentés à bas PV !";
  }

  let bonusDmg = 0;
  if (state.player.willOfFire && state.player.hp <= (state.player.maxHp / 2)) {
    bonusDmg += 4;
  }

  let dmg = card.dmg ? (card.dmg + bonusDmg) : 0;

  // Synergie Shuriken Fûma avec clones
  if (card.fumaBonus) {
    if (state.player.clones >= 2) {
      dmg = 22 + bonusDmg;
      document.getElementById("log").innerText = "Feinte de clone ! Shuriken Fûma dévastateur !";
    }
  }

  if (card.name === "Naruto Rendan") {
    dmg += (state.player.clones * 4);
  }

  if (dmg > 0) {
    if (state.enemy.mist && state.player.clones < 2 && Math.random() < 0.5) {
      document.getElementById("log").innerText = "Attaque ratée dans le brouillard !";
    } else {
      dealDamageToEnemy(dmg);
    }
  }

  state.discard.push(state.hand.splice(idx, 1)[0]);
  updateUI();
  renderHand();

  if (state.enemy.hp <= 0) handleStageVictory();
}

function dealDamageToEnemy(amt) {
  triggerShake("enemy-box");
  if (state.enemy.shield > 0) {
    if (amt <= state.enemy.shield) {
      state.enemy.shield -= amt; amt = 0;
    } else {
      amt -= state.enemy.shield; state.enemy.shield = 0;
    }
  }
  state.enemy.hp = Math.max(0, state.enemy.hp - amt);
}

function endTurn() {
  if (isGameOver || state.enemy.hp <= 0) return;

  // Attaque des clones
  if (state.player.clones > 0) {
    const cDmg = state.player.clones * 3;
    dealDamageToEnemy(cDmg);
    AudioEngine.play("hit");
    document.getElementById("log").innerText = `Les clones frappent pour ${cDmg} dégâts !`;
  }

  while (state.hand.length > 0) state.discard.push(state.hand.pop());
  renderHand();

  if (state.enemy.hp <= 0) { handleStageVictory(); return; }

  // Tour ennemi
  const stage = STAGES[currentStageIndex];
  const move = stage.pattern[(state.enemy.turnCount - 1) % stage.pattern.length];

  if (move.multiHit) {
    for (let i = 0; i < move.multiHit; i++) {
      setTimeout(() => {
        if (!isGameOver) {
          hitPlayer(move.hitDmg);
          AudioEngine.play("slash");
        }
      }, i * 160);
    }
  } else if (move.dmg) {
    hitPlayer(move.dmg);
    AudioEngine.play("slash");
  }

  if (move.shield) {
    state.enemy.shield += move.shield;
    AudioEngine.play("block");
  }
  state.enemy.mist = !!move.mist;
  if (move.clearClones) {
    state.player.clones = 0;
    renderClones();
    AudioEngine.play("clone");
    document.getElementById("log").innerText = "Grande Cataracte ! Tous tes clones sont balayés !";
  }

  if (checkPlayerDeath()) return;

  // Reset début de nouveau tour
  state.player.shield = 0;
  state.player.chakra = state.player.maxChakra;
  state.enemy.turnCount++;
  drawCards(4);
  updateUI();
}

function hitPlayer(amt) {
  triggerShake("naruto-box");
  if (state.player.shield > 0) {
    if (amt <= state.player.shield) {
      state.player.shield -= amt; amt = 0;
    } else {
      amt -= state.player.shield; state.player.shield = 0;
    }
  }
  if (amt > 0) {
    state.player.hp = Math.max(0, state.player.hp - amt);
    if (activeRelic && activeRelic.onDamage) activeRelic.onDamage(state);
  }
  checkPlayerDeath();
}

function renderHand() {
  const h = document.getElementById("hand");
  h.innerHTML = "";
  if (isGameOver) return;

  state.hand.forEach((card, i) => {
    const el = document.createElement("div");
    el.className = `card card-${card.type}`;
    el.onclick = () => playCard(i);

    // Si l'image n'est pas encore présente, affiche l'émoji de repli
    const artSrc = card.img || "";
    const iconFallback = card.icon || "🎴";

    el.innerHTML = `
      <div class="card-top">
        <span class="card-title">${card.name}</span>
        <span class="card-cost">${card.cost}</span>
      </div>
      <div class="card-art">
        <img src="${artSrc}" alt="${card.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <span class="card-art-placeholder" style="display:none;">${iconFallback}</span>
      </div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-tag">${card.type}</div>
    `;
    h.appendChild(el);
  });

function updateUI() {
  document.getElementById("player-hp-txt").innerText = `${state.player.hp} / ${state.player.maxHp} PV`;
  document.getElementById("player-hp-bar").style.width = `${Math.max(0, (state.player.hp / state.player.maxHp) * 100)}%`;
  document.getElementById("player-shield").innerText = `Bouclier : ${state.player.shield}`;

  document.getElementById("enemy-hp-txt").innerText = `${state.enemy.hp} / ${state.enemy.maxHp} PV`;
  document.getElementById("enemy-hp-bar").style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
  document.getElementById("enemy-shield").innerText = `Bouclier : ${state.enemy.shield}`;
  document.getElementById("chakra-display").innerText = `Chakra : ${state.player.chakra} / ${state.player.maxChakra}`;

  const stage = STAGES[currentStageIndex];
  const nextMove = stage.pattern[state.enemy.turnCount % stage.pattern.length];
  document.getElementById("enemy-intent").innerText = `Prépare : ${nextMove.intent}`;
  updateCounters();
}

function updateCounters() {
  document.getElementById("deck-info").innerText = `Pioche : ${state.deck.length} | Défausse : ${state.discard.length}`;
}

// --- FEU DE CAMP & AMÉLIORATIONS ---
function openRestSite() {
  document.getElementById("rest-screen").style.display = "flex";
  document.getElementById("rest-choices").style.display = "flex";
  document.getElementById("upgrade-picker").style.display = "none";
}

function takeRest() {
  const healAmount = 25;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmount);
  AudioEngine.play("kyubi");
  document.getElementById("rest-screen").style.display = "none";
  updateUI();
  loadStage(3); // Passage au Boss Final Zabuza
}

function openUpgradePicker() {
  document.getElementById("rest-choices").style.display = "none";
  const picker = document.getElementById("upgrade-picker");
  picker.style.display = "flex";
  picker.innerHTML = "";

  const upgradable = state.deck.filter(c => !c.upgraded && (c.name === "Coup de Poing" || c.name === "Kawarimi" || c.name === "Kage Bunshin"));

  if (upgradable.length === 0) {
    picker.innerHTML = `<p style="color:#ef4444;">Toutes tes cartes de base sont déjà améliorées !</p>`;
    setTimeout(() => { takeRest(); }, 1200);
    return;
  }

  upgradable.forEach((card) => {
    const el = document.createElement("div");
    el.className = `card card-${card.type}`;
    el.style.transform = "scale(1.05)";
    
    let previewDesc = "";
    if (card.name === "Coup de Poing") previewDesc = "Passe à 10 dégâts.";
    if (card.name === "Kawarimi") previewDesc = "Passe à 10 de bouclier.";
    if (card.name === "Kage Bunshin") previewDesc = "Coût réduit à 1 Chakra !";

    el.innerHTML = `
      <div class="card-top">
        <span class="card-title">${card.name}+</span>
        <span class="card-cost">${card.name === "Kage Bunshin" ? 1 : card.cost}</span>
      </div>
      <div class="card-desc" style="color:#38bdf8;">${previewDesc}</div>
      <div class="card-tag">Amélioration</div>
    `;

    el.onclick = () => {
      upgradeCard(card);
      AudioEngine.play("block");
      document.getElementById("rest-screen").style.display = "none";
      loadStage(3);
    };
    picker.appendChild(el);
  });
}

function upgradeCard(cardRef) {
  cardRef.upgraded = true;
  cardRef.name = `${cardRef.name}+`;
  if (cardRef.name.startsWith("Coup de Poing")) {
    cardRef.dmg = 10;
    cardRef.desc = "Inflige 10 dégâts physiques renforcés.";
  } else if (cardRef.name.startsWith("Kawarimi")) {
    cardRef.shield = 10;
    cardRef.desc = "Substitution parfaite (+10 bouclier).";
  } else if (cardRef.name.startsWith("Kage Bunshin")) {
    cardRef.cost = 1;
    cardRef.desc = "+2 Clones (+3 dégâts chacun). Coût réduit.";
  }
}

// --- VICTOIRE D'ÉTAPE ---
function handleStageVictory() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "flex";
  const picker = document.getElementById("rewards-picker");
  picker.innerHTML = "";

  // Victoire Zabuza
  if (currentStageIndex === STAGES.length - 1) {
    document.getElementById("overlay-title").innerText = "VICTOIRE TOTALE SUR LE PAYS DES VAGUES !";
    document.getElementById("overlay-title").style.color = "#f59e0b";
    document.getElementById("overlay-sub").innerText = "Le grand pont Naruto est achevé. Zabuza a été vaincu !";
    picker.innerHTML = `<button id="end-turn-btn" style="padding:14px 30px; font-size:16px;" onclick="location.reload()">Recommencer la campagne</button>`;
    return;
  }

  // Victoire Haku -> Choix Relique -> Feu de camp
  if (currentStageIndex === 2) {
    document.getElementById("overlay-title").innerText = "VICTOIRE ÉLITE SUR HAKU !";
    document.getElementById("overlay-title").style.color = "#f59e0b";
    document.getElementById("overlay-sub").innerText = "Choisis un trésor ninja légendaire (Relique passive) :";
    
    RELICS_POOL.forEach(relic => {
      const el = document.createElement("div");
      el.className = "card";
      el.style.borderColor = "#38bdf8";
      el.style.transform = "scale(1.05)";
      el.innerHTML = `
        <div class="card-top"><span class="card-title" style="color:#38bdf8">${relic.name}</span></div>
        <div class="card-desc" style="color:#f0f6fc; margin:10px 0;">${relic.desc}</div>
        <div class="card-tag">Relique Élite</div>
      `;
      el.onclick = () => {
        activeRelic = relic;
        if (relic.apply) relic.apply(state);
        document.getElementById("relics-bar").innerText = `Relique : ${relic.name}`;
        overlay.style.display = "none";
        openRestSite();
      };
      picker.appendChild(el);
    });
    return;
  }

  // Victoires classiques (1 et 2)
  document.getElementById("overlay-title").innerText = `Victoire sur ${STAGES[currentStageIndex].name} !`;
  document.getElementById("overlay-title").style.color = "#f59e0b";
  document.getElementById("overlay-sub").innerText = "Choisis une technique pour renforcer ton deck :";

  REWARD_OPTIONS.forEach(reward => {
    const el = document.createElement("div");
    el.className = `card card-${reward.type}`;
    el.style.transform = "scale(1.05)";
    el.innerHTML = `
      <div class="card-top"><span class="card-title">${reward.name}</span><span class="card-cost">${reward.cost}</span></div>
      <div class="card-desc">${reward.desc}</div>
      <div class="card-tag">${reward.type}</div>
    `;
    el.onclick = () => {
      state.deck.push({ ...reward });
      overlay.style.display = "none";
      loadStage(currentStageIndex + 1);
    };
    picker.appendChild(el);
  });
}

window.onload = initGame;
