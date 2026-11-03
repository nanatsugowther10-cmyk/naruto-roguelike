// ==========================================
// 1. CHARGEMENT ET PRÉPARATION DES IMAGES
// ==========================================
// Keep the Image objects alive and share loading/decoding across all callers.
const imageAssets = new Map();
let assetsReady = false;
let assetsPromise;

function imagePath(originalPath) {
  if (!originalPath) return null;
  const filename = originalPath.split('/').pop();
  // These curse cards deliberately use their emoji until artwork is available.
  if (filename === "card_miroir.png") return null;
  if (filename.startsWith("card_")) {
    return `assets/cards/${filename.replace(/\.png$/, ".webp")}`;
  }
  return originalPath.includes('/') ? originalPath : `assets/characters/${filename}`;
}

function loadImageAsset(path) {
  if (imageAssets.has(path)) return imageAssets.get(path).ready;
  const img = new Image();
  const entry = { img, ready: null };
  entry.ready = new Promise(resolve => {
    let finished = false;
    const finish = ok => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      img.onload = img.onerror = null;
      resolve(ok ? img : null);
    };
    // A failed or stalled asset must never trap the user at the menu.
    const timer = setTimeout(() => finish(false), 15000);
    img.onerror = () => finish(false);
    img.onload = async () => {
      try { if (img.decode) await img.decode(); } catch (_) { /* loaded fallback */ }
      finish(true);
    };
    img.src = path;
  });
  imageAssets.set(path, entry);
  return entry.ready;
}

function resolveImgSrc(imgElement, originalPath, fallbackEmoji = null) {
  const path = imagePath(originalPath);
  const placeholder = imgElement.nextElementSibling;
  const showPlaceholder = () => {
    imgElement.style.display = "none";
    if (placeholder && placeholder.classList.contains("card-art-placeholder")) {
      placeholder.textContent = fallbackEmoji || "🎴";
      placeholder.style.display = "block";
    }
  };
  showPlaceholder();
  imgElement.dataset.assetPath = path || "";
  if (!path) return;
  loadImageAsset(path).then(img => {
    // Ignore stale loads if an enemy image changed in the meantime.
    if (!img || imgElement.dataset.assetPath !== path) return;
    imgElement.src = img.src;
    imgElement.style.display = "";
    if (placeholder && placeholder.classList.contains("card-art-placeholder")) {
      placeholder.style.display = "none";
    }
  });
}

function preloadAllAssets() {
  if (assetsPromise) return assetsPromise;
  const names = ["naruto.png", "brigand.png", "freres_demons.png", "haku.png", "zabuza.png",
    ...CARDS_POOL.map(card => card.img)];
  const paths = [...new Set(names.map(imagePath).filter(Boolean))];
  assetsPromise = Promise.all(paths.map(loadImageAsset)).then(results => {
    assetsReady = true;
    document.querySelectorAll("[data-requires-assets]").forEach(btn => { btn.disabled = false; });
    const status = document.getElementById("asset-loading-status");
    if (status) status.textContent = results.some(img => !img)
      ? "Certaines images sont indisponibles. Tu peux quand même jouer." : "";
    return results;
  });
  return assetsPromise;
}

// ==========================================
// 2. MOTEUR AUDIO (M4A & MP3 DYNAMIQUES)
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
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.12);
    } else if (type === "block") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
      gain.gain.setValueAtTime(0.35 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.18);
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
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start(now);
    } else if (type === "slash") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);
      gain.gain.setValueAtTime(0.25 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.14);
    } else if (type === "kyubi") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.35);
      gain.gain.setValueAtTime(0.5 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.35);
    } else if (type === "water_dragon") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.55);
      gain.gain.setValueAtTime(0.6 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.55);
    } else if (type === "break") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      gain.gain.setValueAtTime(0.5 * sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.25);
    }
  },

  playMusic(filename) {
    if (this.currentTrack === filename) return;
    this.currentTrack = filename;

    const baseName = filename.replace(/\.(m4a|mp3)$/, "");
    const targetVolume = this.settings.master * this.settings.music;

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

    audio.play().catch(() => {});
    this.musicAudio = audio;
  },

  updateVolumes() {
    if (this.musicAudio) {
      this.musicAudio.volume = this.settings.master * this.settings.music;
    }
  }
};

// ==========================================
// 3. ÉTAT GLOBAL
// ==========================================
let currentStageIndex = 0;
let activeRelic = null;
let isGameOver = false;
let busy = false;

const state = {
  player: {
    hp: 60,
    maxHp: 60,
    shield: 0,
    chakra: 3,
    maxChakra: 3,
    clones: 0,
    willOfFire: false,
    cardsPlayedThisTurn: 0,
    nextAttackFree: false
  },
  enemy: {
    hp: 38,
    maxHp: 38,
    shield: 0,
    mist: false,
    denseMist: false,
    turnCount: 1,
    inPhase2: false,
    isChanneling: false,
    channelDmgRequired: 0,
    channelDmgTaken: 0,
    channelSpellDmg: 0
  },
  deck: [],
  hand: [],
  discard: [],
  exhausted: []
};

// ==========================================
// 4. ANIMATIONS & VISUELS (VFX)
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
  } else if (type === "water_dragon" && combatZone) {
    const el = document.createElement("div");
    el.className = "vfx-dragon";
    el.innerText = "🐉🌊";
    combatZone.appendChild(el);
    setTimeout(() => el.remove(), 650);
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
// 5. GESTION DU COMBAT & DES NIVEAUX
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

  busy = false;
  isGameOver = false;

  updateNodeMap(index);
  document.body.className = stage.bgClass;

  const stageTitle = document.getElementById("stage-title");
  if (stageTitle) stageTitle.innerText = stage.title;

  const enemyName = document.getElementById("enemy-name");
  if (enemyName) enemyName.innerText = stage.name;

  if (index <= 1) {
    AudioEngine.playMusic("first_level.m4a");
  } else {
    AudioEngine.playMusic("second_level.m4a");
  }

  // Remettre toutes les cartes en deck
  state.deck.push(...state.hand, ...state.discard, ...state.exhausted);
  state.hand = [];
  state.discard = [];
  state.exhausted = [];
  state.deck = state.deck.filter(c => !c.isCurse);
  shuffle(state.deck);

  // Réinitialisation de l'ennemi
  state.enemy.hp = stage.maxHp;
  state.enemy.maxHp = stage.maxHp;
  state.enemy.shield = 0;
  state.enemy.mist = false;
  state.enemy.denseMist = false;
  state.enemy.turnCount = 1;
  state.enemy.inPhase2 = false;
  state.enemy.isChanneling = false;
  state.enemy.channelDmgRequired = 0;
  state.enemy.channelDmgTaken = 0;
  state.enemy.channelSpellDmg = 0;

  const mistOverlay = document.getElementById("dense-mist-overlay");
  if (mistOverlay) mistOverlay.classList.remove("active");
  const enemyBox = document.getElementById("enemy-box");
  if (enemyBox) enemyBox.classList.remove("demon-aura");
  const channelBox = document.getElementById("boss-channel-box");
  if (channelBox) channelBox.style.display = "none";

  // Réinitialisation du joueur
  state.player.shield = 0;
  state.player.chakra = state.player.maxChakra;
  state.player.clones = 0;
  state.player.cardsPlayedThisTurn = 0;
  state.player.nextAttackFree = false;
  renderClones();

  if (activeRelic && activeRelic.onCombatStart) {
    activeRelic.onCombatStart(state);
  }

  const enemyImg = document.getElementById("enemy-img");
  if (enemyImg) resolveImgSrc(enemyImg, stage.sprite);

  saveGame();
  drawCards(4);
  updateUI();

  const logEl = document.getElementById("log");
  if (logEl) logEl.innerText = `Combat : ${stage.name} !`;
}

function checkBossPhaseTransition() {
  const stage = STAGES[currentStageIndex];
  if (!stage.hasPhase2 || state.enemy.inPhase2) return;

  if (state.enemy.hp <= (state.enemy.maxHp / 2) && state.enemy.hp > 0) {
    state.enemy.inPhase2 = true;
    
    const enemyBox = document.getElementById("enemy-box");
    if (enemyBox) enemyBox.classList.add("demon-aura");

    const mistOverlay = document.getElementById("dense-mist-overlay");
    if (mistOverlay) mistOverlay.classList.add("active");

    AudioEngine.play("kyubi");
    document.getElementById("log").innerText = "⚠️ ZABUZA ENRAGÉ : L'aura du Démon du Brouillard s'éveille !";
    spawnFloatingText("enemy-box", "PHASE 2 !", "damage");
  }
}

function dealDamageToEnemy(amt, piercing = false) {
  triggerShake("enemy-box");
  let directHpDmg = amt;

  if (!piercing && state.enemy.shield > 0) {
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

  // Rupture de canalisation
  if (state.enemy.isChanneling && amt > 0) {
    state.enemy.channelDmgTaken += amt;
    updateChannelUI();

    if (state.enemy.channelDmgTaken >= state.enemy.channelDmgRequired) {
      state.enemy.isChanneling = false;
      AudioEngine.play("break");
      spawnFloatingText("enemy-box", "RUPTURE !", "heal");
      document.getElementById("log").innerText = "💥 CANALISATION ROMPUE ! Le Dragon Aqueux s'effondre !";
      
      const channelBox = document.getElementById("boss-channel-box");
      if (channelBox) channelBox.style.display = "none";
    }
  }

  checkBossPhaseTransition();
}

function updateChannelUI() {
  const channelBox = document.getElementById("boss-channel-box");
  if (!channelBox) return;

  if (state.enemy.isChanneling) {
    channelBox.style.display = "flex";
    const fill = document.getElementById("channel-bar-fill");
    const txt = document.getElementById("channel-txt");

    const pct = Math.min(100, (state.enemy.channelDmgTaken / state.enemy.channelDmgRequired) * 100);

    if (fill) fill.style.width = `${pct}%`;
    if (txt) txt.innerText = `Dégâts requis : ${state.enemy.channelDmgTaken} / ${state.enemy.channelDmgRequired}`;
  } else {
    channelBox.style.display = "none";
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
    document.getElementById("overlay-sub").innerText = "Naruto est tombé au combat. La mission a échoué.";
    const picker = document.getElementById("rewards-picker");
    picker.innerHTML = `<button id="end-turn-btn" style="padding:12px 28px; font-size:15px; background:#b91c1c;" onclick="location.reload()">Retourner au Menu</button>`;
    return true;
  }
  return false;
}

// ==========================================
// 6. GESTION DU JEU DES CARTES
// ==========================================
function playCard(idx) {
  if (isGameOver || busy) return;
  const card = state.hand[idx];
  if (!card) return;

  let effectiveCost = card.cost;
  if ((card.type === "attaque" || card.type === "taijutsu") && state.player.nextAttackFree) {
    effectiveCost = 0;
  }

  if (state.player.chakra < effectiveCost) {
    document.getElementById("log").innerText = "Pas assez de Chakra !";
    return;
  }

  if (card.cloneCost && state.player.clones < card.cloneCost) {
    document.getElementById("log").innerText = `Il te faut au moins ${card.cloneCost} clone actif pour cette technique !`;
    return;
  }

  state.player.chakra -= effectiveCost;
  if (effectiveCost === 0 && state.player.nextAttackFree && (card.type === "attaque" || card.type === "taijutsu")) {
    state.player.nextAttackFree = false;
  }

  if (card.cloneCost) {
    state.player.clones -= card.cloneCost;
    renderClones();
    spawnVFX("smoke", "naruto-box");
  }

  if (card.isCurse) {
    AudioEngine.play("block");
    document.getElementById("log").innerText = `${card.name} a été retirée de ta main.`;
  } else if (card.type === "kyubi") {
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

  if (card.opening && state.player.cardsPlayedThisTurn === 0) {
    state.player.nextAttackFree = true;
    document.getElementById("log").innerText = "Ouverture réussie ! Prochaine attaque gratuite !";
    spawnFloatingText("naruto-box", "Combo !", "heal");
  }

  let finisherBonusDmg = 0;
  if (card.finisher && state.player.cardsPlayedThisTurn >= 2) {
    finisherBonusDmg = 8;
    state.player.shield += 5;
    document.getElementById("log").innerText = "Finisher ! +8 dégâts et +5 Bouclier !";
    spawnFloatingText("naruto-box", "Finisher !", "shield");
  }

  if (card.retain && card.channelBonus !== undefined) {
    const chakraGain = 1 + card.channelBonus;
    state.player.chakra = Math.min(state.player.maxChakra + 2, state.player.chakra + chakraGain);
    document.getElementById("log").innerText = `Mudrâ libéré : +${chakraGain} Chakra !`;
    card.channelBonus = 0;
  }

  if (card.drawBonus) {
    drawCards(card.drawBonus);
  }
  if (card.clearMist) {
    state.enemy.mist = false;
    state.enemy.denseMist = false;
    const mistOverlay = document.getElementById("dense-mist-overlay");
    if (mistOverlay) mistOverlay.classList.remove("active");
    document.getElementById("log").innerText = "Le brouillard ennemi est totalement dissipé !";
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
  let dmg = card.dmg ? (card.dmg + bonusDmg + finisherBonusDmg) : 0;

  if (card.fumaBonus && state.player.clones >= 2) {
    dmg = 22 + bonusDmg;
    document.getElementById("log").innerText = "Feinte de clone ! Shuriken Fûma dévastateur !";
  }

  if (card.name.includes("Naruto Rendan")) {
    dmg += (state.player.clones * 4);
  }

  // Précision en fonction de la brume
  if (dmg > 0) {
    let missChance = 0;
    if (state.enemy.denseMist) {
      missChance = state.player.clones >= 2 ? 0.15 : 0.60;
    } else if (state.enemy.mist) {
      missChance = state.player.clones >= 2 ? 0 : 0.50;
    }

    if (missChance > 0 && Math.random() < missChance) {
      document.getElementById("log").innerText = "Attaque perdue dans l'épaisse brume de Zabuza !";
      spawnFloatingText("enemy-box", "RATÉ !", "miss");
    } else {
      dealDamageToEnemy(dmg, !!card.piercing);
    }
  }

  const playedCard = state.hand.splice(idx, 1)[0];
  if (playedCard.exhaust) {
    state.exhausted.push(playedCard);
    spawnFloatingText("naruto-box", "Consumée", "heal");
  } else {
    state.discard.push(playedCard);
  }

  state.player.cardsPlayedThisTurn++;
  updateUI();
  renderHand();

  if (state.enemy.hp <= 0) handleStageVictory();
}

// ==========================================
// 7. FIN DU TOUR (AVEC BOSS PHASE 2 & SUIRYŪDAN)
// ==========================================
function endTurn() {
  if (isGameOver || busy || state.enemy.hp <= 0) return;
  busy = true;

  if (state.player.clones > 0) {
    const cDmg = state.player.clones * 3;
    dealDamageToEnemy(cDmg);
    AudioEngine.play("hit");
    document.getElementById("log").innerText = `Les clones frappent pour ${cDmg} dégâts !`;
  }

  state.hand.forEach(c => {
    if (c.isCurse && c.endTurnDmg) {
      hitPlayer(c.endTurnDmg);
      spawnFloatingText("naruto-box", `-${c.endTurnDmg}`, "damage");
    }
  });

  const retainedHand = [];
  while (state.hand.length > 0) {
    const c = state.hand.pop();
    if (c.retain && !c.isCurse) {
      if (c.channelBonus !== undefined) {
        c.channelBonus = (c.channelBonus || 0) + 1;
      }
      retainedHand.push(c);
    } else {
      state.discard.push(c);
    }
  }
  state.hand = retainedHand;
  renderHand();

  if (state.enemy.hp <= 0) {
    busy = false;
    updateUI();
    handleStageVictory();
    return;
  }

  const stage = STAGES[currentStageIndex];
  const activePattern = (stage.hasPhase2 && state.enemy.inPhase2) ? stage.phase2Pattern : stage.pattern;
  const move = activePattern[(state.enemy.turnCount - 1) % activePattern.length];

  // Résolution de la canalisation si non rompue
  if (state.enemy.isChanneling) {
    state.enemy.isChanneling = false;
    const channelBox = document.getElementById("boss-channel-box");
    if (channelBox) channelBox.style.display = "none";

    spawnVFX("water_dragon");
    AudioEngine.play("water_dragon");
    document.getElementById("log").innerText = "🌊 SUIRYŪDAN NO JUTSU ! Le Dragon Aqueux percute violemment Naruto !";
    
    setTimeout(() => {
      hitPlayer(state.enemy.channelSpellDmg || 28);
    }, 350);
  }

  if (move.shield) {
    state.enemy.shield += move.shield;
    AudioEngine.play("block");
  }

  // Démarrage de canalisation pour le prochain tour
  if (move.channeling) {
    state.enemy.isChanneling = true;
    state.enemy.channelDmgRequired = move.breakThreshold;
    state.enemy.channelDmgTaken = 0;
    state.enemy.channelSpellDmg = move.channelDmg;
    updateChannelUI();
    document.getElementById("log").innerText = move.message;
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

    if (move.addCurse) {
      for (let i = 0; i < move.addCurse.count; i++) {
        state.discard.push({ ...CURSE_POOL[move.addCurse.key] });
      }
      document.getElementById("log").innerText = move.addCurse.message;
      spawnFloatingText("naruto-box", "+Fléau", "miss");
    }

    state.enemy.mist = !!move.mist;
    state.enemy.denseMist = !!move.denseMist;

    const mistOverlay = document.getElementById("dense-mist-overlay");
    if (mistOverlay) {
      if (state.enemy.denseMist) mistOverlay.classList.add("active");
      else mistOverlay.classList.remove("active");
    }

    if (move.clearClones) {
      state.player.clones = 0;
      renderClones();
      spawnVFX("smoke", "naruto-box");
      AudioEngine.play("clone");
      document.getElementById("log").innerText = "Grande Cataracte ! Tous tes clones sont balayés !";
    }

    state.player.shield = 0;
    state.player.chakra = state.player.maxChakra;
    state.player.cardsPlayedThisTurn = 0;
    state.player.nextAttackFree = false;
    state.enemy.turnCount++;

    drawCards(4);
    updateUI();
    busy = false;
  }, Math.max(totalAnimTime, 120));
}

// ==========================================
// 8. INTERFACE & CARTES
// ==========================================
function renderHand() {
  const h = document.getElementById("hand");
  if (!h) return;
  h.innerHTML = "";
  if (isGameOver) return;

  state.hand.forEach((card, i) => {
    const el = document.createElement("div");
    el.className = `card card-${card.type} ${card.isCurse ? 'card-curse' : ''}`;
    el.onclick = () => playCard(i);

    let displayCost = card.cost;
    if ((card.type === "attaque" || card.type === "taijutsu") && state.player.nextAttackFree) {
      displayCost = 0;
    }

    let extraBadge = "";
    if (card.opening) extraBadge = `<span class="badge-tag">Ouverture</span>`;
    if (card.finisher) extraBadge = `<span class="badge-tag">Finisher</span>`;
    if (card.cloneCost) extraBadge = `<span class="badge-tag">Sacrifice (${card.cloneCost})</span>`;
    if (card.retain) extraBadge = `<span class="badge-tag">Mudrâ (+${card.channelBonus || 0})</span>`;
    if (card.exhaust) extraBadge = `<span class="badge-tag">Éphémère</span>`;
    if (card.isCurse) extraBadge = `<span class="badge-tag badge-curse">Fléau</span>`;

    el.innerHTML = `
      <div class="card-top">
        <span class="card-title">${card.name}</span>
        <span class="card-cost" style="${displayCost === 0 && card.cost > 0 ? 'color:#3fb950;' : ''}">${displayCost}</span>
      </div>
      <div class="card-art">
        <img class="card-img-el" alt="${card.name}">
        <span class="card-art-placeholder" style="display:none;">${card.icon || "🎴"}</span>
      </div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-footer-info">
        <span class="card-tag">${card.type}</span>
        ${extraBadge}
      </div>
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
  const activePattern = (stage.hasPhase2 && state.enemy.inPhase2) ? stage.phase2Pattern : stage.pattern;
  const nextMove = activePattern[state.enemy.turnCount % activePattern.length];
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
// 9. INSPECTEUR DE PIOCHES
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
    grid.innerHTML = `<p style="color: #8b949e; margin: 40px 0; font-size: 14px;">Cette pile est actuellement vide.</p>`;
  } else {
    const sortedCards = [...cardsList].sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

    sortedCards.forEach(card => {
      const el = document.createElement("div");
      el.className = `card card-${card.type} ${card.isCurse ? 'card-curse' : ''}`;
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
// 10. REPOS & AMÉLIORATION
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
// 11. VICTOIRES & RÉCOMPENSES
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
    document.getElementById("overlay-sub").innerText = "Le pont Naruto est achevé. Zabuza a été vaincu !";
    picker.innerHTML = `<button id="end-turn-btn" style="padding:12px 28px; font-size:15px;" onclick="location.reload()">Retourner au Menu</button>`;
    return;
  }

  if (currentStageIndex === 2) {
    document.getElementById("overlay-title").innerText = "VICTOIRE ÉLITE SUR HAKU !";
    document.getElementById("overlay-title").style.color = "#f59e0b";
    document.getElementById("overlay-sub").innerText = "Choisis une relique passive :";

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
  document.getElementById("overlay-sub").innerText = "Choisis une technique pour ton deck :";

  const randomOptions = [...REWARD_OPTIONS].sort(() => 0.5 - Math.random()).slice(0, 3);

  randomOptions.forEach(reward => {
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
// 12. SAUVEGARDE & MENU PRINCIPAL
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
  if (!assetsReady) return;
  resolveImgSrc(document.getElementById("naruto-img"), "naruto.png");
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
  if (!assetsReady) return;
  AudioEngine.init();
  MizukiTutorial.open();
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
  state.exhausted = [];

  const narutoImg = document.getElementById("naruto-img");
  if (narutoImg) resolveImgSrc(narutoImg, "naruto.png");

  loadStage(0);
}

// ==========================================
// 13. PARAMÈTRES / OPTIONS
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
// 14. CHARGEMENT INITIAL DE LA PAGE
// ==========================================
window.onload = () => {
  preloadAllAssets();
  AudioEngine.playMusic("main_menu.m4a");

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