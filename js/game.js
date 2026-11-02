// ==========================================
// 1. GESTION DU CACHE & CHARGEUR D'IMAGES
// ==========================================
const resolvedPathCache = {};

function resolveImgSrc(imgElement, originalPath, fallbackEmoji = null) {
  if (!originalPath) return;
  const filename = originalPath.split('/').pop();

  if (resolvedPathCache[filename]) {
    imgElement.src = resolvedPathCache[filename];
    return;
  }

  const candidatePaths = [
    originalPath,
    `assets/characters/${filename}`,
    `assets/cards/${filename}`,
    `assets/${filename}`,
    filename
  ];
  const uniquePaths = [...new Set(candidatePaths)];
  let idx = 0;

  imgElement.src = uniquePaths[0];

  imgElement.onload = function () {
    resolvedPathCache[filename] = imgElement.src;
  };

  imgElement.onerror = function () {
    idx++;
    if (idx < uniquePaths.length) {
      imgElement.src = uniquePaths[idx];
    } else {
      imgElement.onerror = null;
      if (fallbackEmoji) {
        imgElement.style.display = "none";
        const placeholder = imgElement.nextElementSibling;
        if (placeholder && placeholder.classList.contains("card-art-placeholder")) {
          placeholder.style.display = "block";
        }
      }
    }
  };
}

function preloadAllAssets() {
  const imagesToPreload = [
    "naruto.png", "brigand.png", "freres_demons.png", "haku.png", "zabuza.png",
    "card_poing.png", "card_kawarimi.png", "card_clones.png", "card_rendan.png",
    "card_kyubi.png", "card_fuma.png", "card_volonte.png", "card_2000poings.png",
    "card_assaut.png", "card_chakra_rouge.png", "card_miroir.png"
  ];

  imagesToPreload.forEach(name => {
    const dummyImg = new Image();
    resolveImgSrc(dummyImg, name);
  });
}

// ==========================================
// 2. MOTEUR AUDIO (SFX & MUSIQUES)
// ==========================================
const AudioEngine = {
  ctx: null,
  musicAudio: null,
  currentTrack: null,
  settings: {
    master: 0.8,
    music: 0.4,
    sfx: 0.8
  },

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },

  play(type) {
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const sfxVol = this.settings.master * this.settings.sfx;
    if (sfxVol <= 0.001) return;

    if (type === "hit") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
      gain.gain.setValueAtTime(0.4 * sfxVol, now);
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
      gain.gain.setValueAtTime(0.35 * sfxVol, now);
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
      gain.gain.setValueAtTime(0.3 * sfxVol, now);
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
      gain.gain.setValueAtTime(0.25 * sfxVol, now);
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
      gain.gain.setValueAtTime(0.5 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  },

  playMusic(filename) {
    if (this.currentTrack === filename) return;
    this.currentTrack = filename;

    const baseName = filename.replace(/\.(m4a|mp3)$/, "");
    const targetVolume = this.settings.master * this.settings.music;

    // Teste .m4a d'abord, puis .mp3 dans tous les dossiers possibles
    const candidatePaths = [
      `assets/audio/${baseName}.m4a`,
      `assets/${baseName}.m4a`,
      `${baseName}.m4a`,
      `assets/audio/${baseName}.mp3`,
      `assets/${baseName}.mp3`,
      `${baseName}.mp3`
    ];

    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio = null;
    }

    const audio = new Audio();
    audio.loop = true;
    audio.volume = targetVolume;

    let pathIdx = 0;
    audio.src = candidatePaths[pathIdx];

    audio.onerror = () => {
      pathIdx++;
      if (pathIdx < candidatePaths.length) {
        audio.src = candidatePaths[pathIdx];
        audio.play().catch(() => {});
      }
    };

    audio.play().catch(() => {
      // Bloqué par le navigateur tant qu'il n'y a pas eu de clic utilisateur
    });
    this.musicAudio = audio;
  },

  updateVolumes() {
    if (this.musicAudio) {
      this.musicAudio.volume = this.settings.master * this.settings.music;
    }
  }
};

// ==========================================
// 3. ÉTAT DU JEU & VARIABLES GLOBALES
// ==========================================
let currentStageIndex = 0;
let activeRelic = null;
let isGameOver = false;
let busy = false;

const state = {
  player: { hp: 60, maxHp: 60, shield: 0, chakra: 3, maxChakra: 3, clones: 0, willOfFire: false },
  enemy: { hp: 38, maxHp: 38, shield: 0, mist: false, turnCount: 1 },
  deck: [],
  hand: [],
  discard: []
};

// ==========================================
// 4. GESTION DES ANIMATIONS & VISUELS (VFX)
// ==========================================
function spawnFloatingText(targetBoxId, text, type = "damage") {
  const box = document.getElementById(targetBoxId);
  if (!box) return;

  const el = document.createElement("div");
  el.className = `floating-text float-${type}`;
  el.innerText = text;

  const randomX = Math.floor(Math.random() * 30) - 15;
  el.style.left = `calc(50% + ${randomX}px)`;
  el.style.top = "35%";

  box.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function triggerShake(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function triggerRush(fighterBoxId, isPlayer = true) {
  const box = document.getElementById(fighterBoxId);
  if (!box) return;
  const animClass = isPlayer ? "player-rush" : "enemy-rush";
  box.classList.remove(animClass);
  void box.offsetWidth;
  box.classList.add(animClass);
}

function spawnVFX(type, targetBoxId = "enemy-box") {
  const targetBox = document.getElementById(targetBoxId);
  const combatZone = document.getElementById("combat-zone");

  if (type === "slash" && targetBox) {
    const el = document.createElement("div");
    el.className = "vfx-slash";
    targetBox.appendChild(el);
    setTimeout(() => el.remove(), 260);
  } else if (type === "smoke" && targetBox) {
    const el = document.createElement("div");
    el.className = "vfx-smoke";
    el.innerText = "💨";
    targetBox.appendChild(el);
    setTimeout(() => el.remove(), 460);
  } else if (type === "fuma" && combatZone) {
    const el = document.createElement("div");
    el.className = "vfx-projectile";
    el.innerText = "⚔️";
    combatZone.appendChild(el);
    setTimeout(() => el.remove(), 310);
  }
}

function updateNodeMap(currentIndex) {
  for (let i = 0; i <= 4; i++) {
    const nodeEl = document.getElementById(`node-${i}`);
    if (!nodeEl) continue;
    nodeEl.classList.remove("active", "completed");

    if (i < currentIndex) {
      nodeEl.classList.add("completed");
    } else if (i === currentIndex) {
      nodeEl.classList.add("active");
    }
  }
}

function renderClones() {
  const container = document.getElementById("clones-container");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < Math.min(state.player.clones, 4); i++) {
    const img = document.createElement("img");
    img.className = "clone-sprite";
    resolveImgSrc(img, "naruto.png");
    container.appendChild(img);
  }
  const clonesTxt = document.getElementById("player-clones-txt");
  if (clonesTxt) clonesTxt.innerText = `Clones actifs : ${state.player.clones}`;
}

// ==========================================
// 5. GESTION DES COMBATS & DES ÉTAPES
// ==========================================
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
    if (state.deck.length > 0) {
      state.hand.push(state.deck.pop());
    }
  }
  renderHand();
  updateCounters();
}

function loadStage(index) {
  currentStageIndex = index;
  const stage = STAGES[index];

  updateNodeMap(index);
  document.body.className = stage.bgClass;

  const stageTitle = document.getElementById("stage-title");
  if (stageTitle) stageTitle.innerText = stage.title;

  // Lancement de la musique correspondante
  if (index <= 1) {
    AudioEngine.playMusic("first_level.m4a");
  } else {
    AudioEngine.playMusic("second_level.m4a");
  }

  // Initialisation de l'ennemi
  state.enemy.hp = stage.maxHp;
  state.enemy.maxHp = stage.maxHp;
  state.enemy.shield = 0;
  state.enemy.mist = false;
  state.enemy.turnCount = 1;

  // Initialisation du tour du joueur
  state.player.shield = 0;
  state.player.chakra = state.player.maxChakra;
  state.player.clones = 0;
  renderClones();

  if (activeRelic && activeRelic.onCombatStart) {
    activeRelic.onCombatStart(state);
  }

  const enemyImg = document.getElementById("enemy-img");
  if (enemyImg) resolveImgSrc(enemyImg, stage.sprite);

  // Remise en deck de toutes les cartes
  state.deck.push(...state.hand, ...state.discard);
  state.hand = [];
  state.discard = [];
  shuffle(state.deck);

  saveGame();

  drawCards(4);
  updateUI();

  const logEl = document.getElementById("log");
  if (logEl) logEl.innerText = `Combat : ${stage.name} !`;
}

function dealDamageToEnemy(amt) {
  triggerShake("enemy-box");
  let directHpDmg = amt;

  if (state.enemy.shield > 0) {
    if (amt <= state.enemy.shield) {
      state.enemy.shield -= amt;
      spawnFloatingText("enemy-box", `-${amt}`, "shield");
      directHpDmg = 0;
    } else {
      const absorbed = state.enemy.shield;
      directHpDmg = amt - absorbed;
      state.enemy.shield = 0;
      spawnFloatingText("enemy-box", `-${absorbed}`, "shield");
    }
  }

  if (directHpDmg > 0) {
    state.enemy.hp = Math.max(0, state.enemy.hp - directHpDmg);
    spawnFloatingText("enemy-box", `-${directHpDmg}`, "damage");
  }
}

function hitPlayer(amt) {
  triggerShake("naruto-box");
  let directHpDmg = amt;

  if (state.player.shield > 0) {
    if (amt <= state.player.shield) {
      state.player.shield -= amt;
      spawnFloatingText("naruto-box", `-${amt}`, "shield");
      directHpDmg = 0;
    } else {
      const absorbed = state.player.shield;
      directHpDmg = amt - absorbed;
      state.player.shield = 0;
      spawnFloatingText("naruto-box", `-${absorbed}`, "shield");
    }
  }

  if (directHpDmg > 0) {
    state.player.hp = Math.max(0, state.player.hp - directHpDmg);
    spawnFloatingText("naruto-box", `-${directHpDmg}`, "damage");
    if (activeRelic && activeRelic.onDamage) activeRelic.onDamage(state);
  }
  checkPlayerDeath();
}

function checkPlayerDeath() {
  if (state.player.hp <= 0 && !isGameOver) {
    isGameOver = true;
    state.player.hp = 0;
    clearSave();
    updateUI();

    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";
    document.getElementById("overlay-title").innerText = "DÉFAITE...";
    document.getElementById("overlay-title").style.color = "#ef4444";
    document.getElementById("overlay-sub").innerText = "Naruto est tombé au combat. La mission du Pays des Vagues a échoué.";
    const picker = document.getElementById("rewards-picker");
    picker.innerHTML = `<button id="end-turn-btn" style="padding:14px 32px; font-size:16px; background:#b91c1c;" onclick="location.reload()">Retourner au Menu</button>`;
    return true;
  }
  return false;
}

function playCard(idx) {
  if (isGameOver || busy) return;
  const card = state.hand[idx];
  if (!card || state.player.chakra < card.cost) return;

  state.player.chakra -= card.cost;

  // Effets d'impact et sons
  if (card.type === "kyubi") {
    AudioEngine.play("kyubi");
    triggerRush("naruto-box", true);
    spawnVFX("slash", "enemy-box");
  } else if (card.shield > 0) {
    AudioEngine.play("block");
    spawnVFX("smoke", "naruto-box");
  } else if (card.clones > 0) {
    AudioEngine.play("clone");
    spawnVFX("smoke", "naruto-box");
  } else if (card.name.includes("Fûma")) {
    AudioEngine.play("slash");
    triggerRush("naruto-box", true);
    spawnVFX("fuma");
  } else {
    AudioEngine.play("hit");
    triggerRush("naruto-box", true);
    spawnVFX("slash", "enemy-box");
  }

  if (card.selfDmg) {
    state.player.hp = Math.max(0, state.player.hp - card.selfDmg);
    triggerShake("naruto-box");
    spawnFloatingText("naruto-box", `-${card.selfDmg}`, "damage");
    if (activeRelic && activeRelic.onDamage) activeRelic.onDamage(state);
    if (checkPlayerDeath()) return;
  }

  if (card.chakraGain) state.player.chakra += card.chakraGain;
  if (card.shield) state.player.shield += card.shield;
  if (card.clones) {
    state.player.clones += card.clones;
    renderClones();
  }

  if (card.buffWill) {
    state.player.willOfFire = true;
    document.getElementById("log").innerText = "Volonté du Feu éveillée !";
  }

  let bonusDmg = (state.player.willOfFire && state.player.hp <= (state.player.maxHp / 2)) ? 4 : 0;
  let dmg = card.dmg ? (card.dmg + bonusDmg) : 0;

  if (card.fumaBonus && state.player.clones >= 2) {
    dmg = 22 + bonusDmg;
    document.getElementById("log").innerText = "Feinte de clone ! Shuriken Fûma dévastateur !";
  }

  if (card.name.includes("Naruto Rendan")) {
    dmg += (state.player.clones * 4);
  }

  if (dmg > 0) {
    if (state.enemy.mist && state.player.clones < 2 && Math.random() < 0.5) {
      document.getElementById("log").innerText = "Attaque ratée dans le brouillard !";
      spawnFloatingText("enemy-box", "RATÉ !", "miss");
    } else {
      dealDamageToEnemy(dmg);
    }
  }

  state.discard.push(state.hand.splice(idx, 1)[0]);
  updateUI();
  renderHand();

  if (state.enemy.hp <= 0) handleStageVictory();
}

function endTurn() {
  if (isGameOver || busy || state.enemy.hp <= 0) return;
  busy = true;

  if (state.player.clones > 0) {
    const cDmg = state.player.clones * 3;
    dealDamageToEnemy(cDmg);
    AudioEngine.play("hit");
    document.getElementById("log").innerText = `Les clones frappent pour ${cDmg} dégâts !`;
  }

  while (state.hand.length > 0) state.discard.push(state.hand.pop());
  renderHand();

  if (state.enemy.hp <= 0) {
    busy = false;
    updateUI();
    handleStageVictory();
    return;
  }

  const stage = STAGES[currentStageIndex];
  const move = stage.pattern[(state.enemy.turnCount - 1) % stage.pattern.length];

  if (move.shield) {
    state.enemy.shield += move.shield;
    AudioEngine.play("block");
  }

  const hits = move.multiHit ? Array(move.multiHit).fill(move.hitDmg) : (move.dmg ? [move.dmg] : []);

  if (hits.length > 0) {
    triggerRush("enemy-box", false);
  }

  const totalAnimTime = hits.length * 160;
  hits.forEach((d, i) => {
    setTimeout(() => {
      if (isGameOver) return;
      spawnVFX("slash", "naruto-box");
      hitPlayer(d);
      AudioEngine.play("slash");
    }, i * 160);
  });

  setTimeout(() => {
    if (isGameOver) {
      busy = false;
      return;
    }

    state.enemy.mist = !!move.mist;
    if (move.clearClones) {
      state.player.clones = 0;
      renderClones();
      spawnVFX("smoke", "naruto-box");
      AudioEngine.play("clone");
      document.getElementById("log").innerText = "Grande Cataracte ! Tous tes clones sont balayés !";
    }

    state.player.shield = 0;
    state.player.chakra = state.player.maxChakra;
    state.enemy.turnCount++;
    drawCards(4);
    updateUI();
    busy = false;
  }, Math.max(totalAnimTime, 100));
}

// ==========================================
// 6. INTERFACE UTILISATEUR & CARTES EN MAIN
// ==========================================
function renderHand() {
  const h = document.getElementById("hand");
  if (!h) return;
  h.innerHTML = "";
  if (isGameOver) return;

  state.hand.forEach((card, i) => {
    const el = document.createElement("div");
    el.className = `card card-${card.type}`;
    el.onclick = () => playCard(i);

    el.innerHTML = `
      <div class="card-top">
        <span class="card-title">${card.name}</span>
        <span class="card-cost">${card.cost}</span>
      </div>
      <div class="card-art">
        <img class="card-img-el" alt="${card.name}">
        <span class="card-art-placeholder" style="display:none;">${card.icon || "🎴"}</span>
      </div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-tag">${card.type}</div>
    `;

    const imgEl = el.querySelector(".card-img-el");
    resolveImgSrc(imgEl, card.img, card.icon);
    h.appendChild(el);
  });
}

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
  const intentEl = document.getElementById("enemy-intent");
  if (intentEl) intentEl.innerText = `Prépare : ${nextMove.intent}`;

  updateCounters();
}

function updateCounters() {
  const drawEl = document.getElementById("draw-count");
  const discardEl = document.getElementById("discard-count");
  if (drawEl) drawEl.innerText = state.deck.length;
  if (discardEl) discardEl.innerText = state.discard.length;
}

// ==========================================
// 7. INSPECTEUR DE PIOCHE ET DÉFAUSSE
// ==========================================
function openInspector(pileType) {
  const modal = document.getElementById("inspector-modal");
  const title = document.getElementById("inspector-title");
  const grid = document.getElementById("inspector-grid");
  if (!modal || !title || !grid) return;

  const cardsList = pileType === "deck" ? state.deck : state.discard;
  const pileName = pileType === "deck" ? "Pioche" : "Défausse";

  title.innerText = `${pileName} (${cardsList.length} carte${cardsList.length > 1 ? "s" : ""})`;
  grid.innerHTML = "";

  if (cardsList.length === 0) {
    grid.innerHTML = `<p style="color: #8b949e; margin: 40px 0; font-size: 15px;">Cette pile est actuellement vide.</p>`;
  } else {
    const sortedCards = [...cardsList].sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

    sortedCards.forEach(card => {
      const el = document.createElement("div");
      el.className = `card card-${card.type}`;
      el.innerHTML = `
        <div class="card-top">
          <span class="card-title">${card.name}</span>
          <span class="card-cost">${card.cost}</span>
        </div>
        <div class="card-art">
          <img class="card-img-el" alt="${card.name}">
          <span class="card-art-placeholder" style="display:none;">${card.icon || "🎴"}</span>
        </div>
        <div class="card-desc">${card.desc}</div>
        <div class="card-tag">${card.type}</div>
      `;

      const imgEl = el.querySelector(".card-img-el");
      resolveImgSrc(imgEl, card.img, card.icon);
      grid.appendChild(el);
    });
  }

  modal.style.display = "flex";
}

function closeInspector(event) {
  if (event && event.target && event.target.id !== "inspector-modal" && !event.target.classList.contains("inspector-close-btn")) {
    return;
  }
  const modal = document.getElementById("inspector-modal");
  if (modal) modal.style.display = "none";
}

// ==========================================
// 8. FEU DE CAMP & AMÉLIORATION DE CARTES
// ==========================================
function openRestSite() {
  updateNodeMap(3);
  saveGame();

  const restScreen = document.getElementById("rest-screen");
  const restChoices = document.getElementById("rest-choices");
  const upgradePicker = document.getElementById("upgrade-picker");

  if (restScreen) restScreen.style.display = "flex";
  if (restChoices) restChoices.style.display = "flex";
  if (upgradePicker) upgradePicker.style.display = "none";
}

function takeRest() {
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 25);
  AudioEngine.play("kyubi");
  spawnFloatingText("naruto-box", "+25", "heal");

  const restScreen = document.getElementById("rest-screen");
  if (restScreen) restScreen.style.display = "none";

  updateUI();
  loadStage(3);
}

function openUpgradePicker() {
  const restChoices = document.getElementById("rest-choices");
  const picker = document.getElementById("upgrade-picker");
  if (restChoices) restChoices.style.display = "none";
  if (!picker) return;

  picker.style.display = "flex";
  picker.innerHTML = "";

  const upgradable = state.deck.filter(c => !c.upgraded && (c.name === "Coup de Poing" || c.name === "Kawarimi" || c.name === "Kage Bunshin"));

  if (upgradable.length === 0) {
    picker.innerHTML = `<p style="color:#ef4444;">Toutes tes techniques de base sont déjà améliorées !</p>`;
    setTimeout(() => { takeRest(); }, 1200);
    return;
  }

  upgradable.forEach(card => {
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
      <div class="card-art">
        <img class="card-img-el" alt="${card.name}">
        <span class="card-art-placeholder" style="display:none;">${card.icon || "🎴"}</span>
      </div>
      <div class="card-desc" style="color:#38bdf8;">${previewDesc}</div>
      <div class="card-tag">Amélioration</div>
    `;

    const imgEl = el.querySelector(".card-img-el");
    resolveImgSrc(imgEl, card.img, card.icon);

    el.onclick = () => {
      upgradeCard(card);
      AudioEngine.play("block");
      const restScreen = document.getElementById("rest-screen");
      if (restScreen) restScreen.style.display = "none";
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

// ==========================================
// 9. VICTOIRES & RÉCOMPENSES
// ==========================================
function handleStageVictory() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "flex";
  const picker = document.getElementById("rewards-picker");
  picker.innerHTML = "";

  if (currentStageIndex === STAGES.length - 1) {
    clearSave();
    document.getElementById("overlay-title").innerText = "VICTOIRE TOTALE SUR LE PAYS DES VAGUES !";
    document.getElementById("overlay-title").style.color = "#f59e0b";
    document.getElementById("overlay-sub").innerText = "Le grand pont Naruto est achevé. Zabuza a été vaincu !";
    picker.innerHTML = `<button id="end-turn-btn" style="padding:14px 30px; font-size:16px;" onclick="location.reload()">Retourner au Menu</button>`;
    return;
  }

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

  document.getElementById("overlay-title").innerText = `Victoire sur ${STAGES[currentStageIndex].name} !`;
  document.getElementById("overlay-title").style.color = "#f59e0b";
  document.getElementById("overlay-sub").innerText = "Choisis une technique pour renforcer ton deck :";

  REWARD_OPTIONS.forEach(reward => {
    const el = document.createElement("div");
    el.className = `card card-${reward.type}`;
    el.style.transform = "scale(1.05)";
    el.innerHTML = `
      <div class="card-top"><span class="card-title">${reward.name}</span><span class="card-cost">${reward.cost}</span></div>
      <div class="card-art">
        <img class="card-img-el" alt="${reward.name}">
        <span class="card-art-placeholder" style="display:none;">${reward.icon || "🎴"}</span>
      </div>
      <div class="card-desc">${reward.desc}</div>
      <div class="card-tag">${reward.type}</div>
    `;

    const imgEl = el.querySelector(".card-img-el");
    resolveImgSrc(imgEl, reward.img, reward.icon);

    el.onclick = () => {
      state.deck.push({ ...reward });
      overlay.style.display = "none";
      loadStage(currentStageIndex + 1);
    };
    picker.appendChild(el);
  });
}

// ==========================================
// 10. SAUVEGARDE LOCALE & MENU PRINCIPAL
// ==========================================
const SAVE_KEY = "naruto_deckbuilder_save";

function saveGame() {
  if (isGameOver) return;
  const saveData = {
    currentStageIndex,
    activeRelicId: activeRelic ? activeRelic.id : null,
    playerHp: state.player.hp,
    playerMaxHp: state.player.maxHp,
    playerWillOfFire: state.player.willOfFire,
    deck: state.deck
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function hasSavedGame() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

function continueGame() {
  AudioEngine.init();
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  const data = JSON.parse(raw);

  isGameOver = false;
  state.player.hp = data.playerHp;
  state.player.maxHp = data.playerMaxHp;
  state.player.willOfFire = !!data.playerWillOfFire;
  state.deck = data.deck;

  if (data.activeRelicId) {
    activeRelic = RELICS_POOL.find(r => r.id === data.activeRelicId) || null;
    if (activeRelic && activeRelic.apply) activeRelic.apply(state);
    if (activeRelic) document.getElementById("relics-bar").innerText = `Relique : ${activeRelic.name}`;
  }

  document.getElementById("main-menu").style.display = "none";
  loadStage(data.currentStageIndex);
}

function startNewGamePrompt() {
  AudioEngine.init();
  clearSave();
  document.getElementById("main-menu").style.display = "none";
  initNewGame();
}

function initNewGame() {
  isGameOver = false;
  activeRelic = null;
  state.player.hp = 60;
  state.player.maxHp = 60;
  state.player.maxChakra = 3;
  state.player.willOfFire = false;
  document.getElementById("relics-bar").innerText = "Relique : Aucune";

  state.deck = [
    { ...CARDS_POOL[0] }, { ...CARDS_POOL[0] }, { ...CARDS_POOL[0] },
    { ...CARDS_POOL[1] }, { ...CARDS_POOL[1] }, { ...CARDS_POOL[1] },
    { ...CARDS_POOL[2] }, { ...CARDS_POOL[2] },
    { ...CARDS_POOL[3] },
    { ...CARDS_POOL[4] }
  ];
  state.hand = [];
  state.discard = [];

  const narutoImg = document.getElementById("naruto-img");
  if (narutoImg) resolveImgSrc(narutoImg, "naruto.png");

  loadStage(0);
}

// ==========================================
// 11. OPTIONS & PARAMÈTRES
// ==========================================
function openSettingsModal() {
  document.getElementById("settings-modal").style.display = "flex";
}

function closeSettingsModal(event) {
  if (event && event.target && event.target.id !== "settings-modal" && !event.target.classList.contains("inspector-close-btn") && event.target.tagName !== "BUTTON") {
    return;
  }
  document.getElementById("settings-modal").style.display = "none";
}

function updateAudioSettings() {
  const master = parseFloat(document.getElementById("vol-master").value);
  const music = parseFloat(document.getElementById("vol-music").value);
  const sfx = parseFloat(document.getElementById("vol-sfx").value);

  document.getElementById("val-vol-master").innerText = `${Math.round(master * 100)}%`;
  document.getElementById("val-vol-music").innerText = `${Math.round(music * 100)}%`;
  document.getElementById("val-vol-sfx").innerText = `${Math.round(sfx * 100)}%`;

  AudioEngine.settings.master = master;
  AudioEngine.settings.music = music;
  AudioEngine.settings.sfx = sfx;
  AudioEngine.updateVolumes();
}

function updateDisplaySettings() {
  const scale = parseFloat(document.getElementById("card-size").value);
  document.getElementById("val-card-size").innerText = `${Math.round(scale * 100)}%`;
  document.documentElement.style.setProperty("--card-scale", scale);

  const fontChoice = document.getElementById("font-size-select").value;
  let fontPx = "14px";
  if (fontChoice === "small") fontPx = "12px";
  if (fontChoice === "large") fontPx = "16px";
  document.documentElement.style.setProperty("--game-font-size", fontPx);
}

// ==========================================
// 12. DÉMARRAGE AU CHARGEMENT DE LA PAGE
// ==========================================
window.onload = () => {
  preloadAllAssets();
  
  // Prépare le morceau du menu
  AudioEngine.playMusic("main_menu.m4a");
  
  // Si le navigateur bloque l'autoplay, le premier clic n'importe où lance la musique
  document.addEventListener("click", () => {
    AudioEngine.init();
    if (AudioEngine.musicAudio && AudioEngine.musicAudio.paused) {
      AudioEngine.musicAudio.play().catch(() => {});
    }
  }, { once: true });

  if (hasSavedGame()) {
    const btnContinue = document.getElementById("btn-continue");
    if (btnContinue) btnContinue.style.display = "block";
  }
};
