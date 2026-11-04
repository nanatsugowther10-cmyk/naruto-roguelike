// Chapter 2 uses the existing card engine; each opponent owns independent HP and intentions.
const FOREST_STAGES = [
  { name: 'Éclaireur rival', icon: '🥷', maxHp: 48, pattern: [
    { intent: 'Kunai · 7 dégâts', dmg: 7 }, { intent: 'Préparation · 6 bouclier', shield: 6 }, { intent: 'Embuscade · 13 dégâts', dmg: 13 }] },
  { name: 'Serpent géant', icon: '🐍', maxHp: 62, pattern: [
    { intent: 'Morsure · 9 dégâts', dmg: 9 }, { intent: 'Constriction · 6 dégâts, prochaine pioche −1', dmg: 6, constrict: true }, { intent: 'Repli · 8 bouclier', shield: 8 }] },
  { name: 'Équipe rivale', members: [
    { name: 'Assaillant', icon: '🥷', maxHp: 36, pattern: [{ intent: 'Assaut · 8 dégâts', dmg: 8 }, { intent: 'Kunai · 6 dégâts', dmg: 6 }] },
    { name: 'Soutien', icon: '🛡️', maxHp: 28, pattern: [{ intent: 'Protège son allié · 8 bouclier', protect: 8 }, { intent: 'Shuriken · 4 dégâts', dmg: 4 }] }] },
  { name: 'Équipe du Son', scroll: 'Terre', members: [
    { name: 'Zaku', icon: '💨', maxHp: 38, pattern: [{ intent: 'Compression · 5 bouclier', shield: 5 }, { intent: 'Souffle · 11 dégâts, détruit les clones', dmg: 11, clearClones: true }] },
    { name: 'Kin', icon: '🔔', maxHp: 26, pattern: [{ intent: 'Clochettes · ajoute une Distraction', distraction: true }, { intent: 'Senbon · 4 dégâts', dmg: 4 }] },
    { name: 'Dosu', icon: '🎵', maxHp: 34, pattern: [{ intent: 'Onde sonore · 5 dégâts', dmg: 5 }, { intent: 'Résonance · prochaine protection −4', resonance: true }] }] },
  { name: 'Équipe de la Pluie', scroll: 'Ciel', members: [
    { name: 'Oboro', icon: '🌧️', maxHp: 32, pattern: [{ intent: 'Genjutsu · 2 doubles protecteurs', decoys: 2 }, { intent: 'Attaque · 6 dégâts', dmg: 6 }] },
    { name: 'Kagari', icon: '🌧️', maxHp: 28, pattern: [{ intent: 'Kunai · 5 dégâts', dmg: 5 }, { intent: 'Attaque · 7 dégâts', dmg: 7 }] },
    { name: 'Mubi', icon: '🌧️', maxHp: 28, pattern: [{ intent: 'Attaque · 5 dégâts', dmg: 5 }, { intent: 'Garde · 7 bouclier', shield: 7 }] }] },
  { name: 'Orochimaru', icon: '🐍', maxHp: 999, survival: 6, pattern: [
    { intent: 'Serpents · 10 dégâts', dmg: 10 },
    { intent: 'Étreinte · 14 dégâts', dmg: 14 },
    { intent: 'Assaut · 20 dégâts ; inflige 18 dégâts ce tour pour l’interrompre', dmg: 20, interrupt: 18 },
    { intent: 'Pression meurtrière · Distraction', distraction: true },
    { intent: 'Morsure · 14 dégâts', dmg: 14 },
    { intent: 'Assaut final · 22 dégâts ; inflige 18 dégâts ce tour pour l’interrompre', dmg: 22, interrupt: 18 }] }
];
FOREST_STAGES.forEach((stage, i) => STAGES.push({ ...stage, forest: true, maxHp: stage.maxHp || stage.members.reduce((n, e) => n + e.maxHp, 0), pattern: stage.pattern || stage.members[0].pattern, bgClass: 'bg-forest', title: `Chapitre 2 · Forêt de la Mort · ${i + 1}/6 : ${stage.name}` }));

// The following exam rounds keep the same target and card engine.
const EXAM_STAGES = [
  { name: 'Kiba et Akamaru', round: 'Éliminatoires', members: [
    { name: 'Kiba', icon: '🥷', maxHp: 52, pattern: [
      { intent: 'Griffes', dmg: 7, partnerBonus: 4 },
      { intent: 'Posture bestiale · 6 bouclier', shield: 6 },
      { intent: 'Gatsūga', dmg: 10, partnerBonus: 6 }] },
    { name: 'Akamaru', icon: '🐕', maxHp: 26, pattern: [
      { intent: 'Morsure · 3 dégâts', dmg: 3 },
      { intent: 'Couvre Kiba · 6 bouclier à son allié', protect: 6 },
      { intent: 'Assaut · 4 dégâts', dmg: 4 }] }
  ] },
  { name: 'Neji Hyūga', round: 'Finale', icon: '👁️', maxHp: 96, pattern: [
    { intent: 'Jūken · 8 dégâts ; prochain tour : −1 chakra', dmg: 8, chakraSeal: 1 },
    { intent: 'Byakugan · 12 bouclier', shield: 12 },
    { intent: '64 Paumes · 4 × 4 dégâts ; inflige 16 dégâts ce tour pour interrompre', multiHit: 4, hitDmg: 4, interrupt: 16 }
  ] }
];
EXAM_STAGES.forEach((stage, i) => STAGES.push({ ...stage, forest: true, exam: true,
  maxHp: stage.maxHp || stage.members.reduce((n, e) => n + e.maxHp, 0),
  pattern: stage.pattern || stage.members[0].pattern, bgClass: 'bg-exam',
  title: `Chapitre 3 · Examen Chūnin · ${stage.round} : ${stage.name}` }));
const EXAM_REWARDS = [
  { id: 'reserve_chakra', name: 'Réserve de chakra', cost: 0, chakraGain: 1, exhaust: true, type: 'chakra', icon: '🔵', img: 'card_chakra_rouge.png', desc: '+1 chakra. Consumée pour le reste du combat.' },
  { id: 'rafale_clones', name: 'Rafale de clones', cost: 1, dmg: 5, clones: 1, type: 'clone', icon: '👥', img: 'card_clones.png', desc: '5 dégâts et invoque 1 clone.' },
  { id: 'garde_concentree', name: 'Garde concentrée', cost: 1, shield: 9, retain: true, type: 'defense', icon: '🛡️', img: 'card_kawarimi.png', desc: '+9 bouclier. Reste en main si elle n’est pas jouée.' }
];

const Forest = {
  enemies: [], target: 0, turns: 0, turnDamage: 0, completed: false,
  active() { return !!STAGES[currentStageIndex]?.forest; },
  alive() { return this.enemies.filter(e => e.hp > 0); },
  move(e) {
    const move = { ...e.pattern[this.turns % e.pattern.length] };
    if (move.partnerBonus) {
      const coordinated = this.alive().some(ally => ally.name === 'Akamaru');
      move.dmg += coordinated ? move.partnerBonus : 0;
      move.intent += ` · ${move.dmg} dégâts${coordinated ? ' (coordination avec Akamaru)' : ' (Kiba seul)'}`;
    }
    return move;
  },
  prepare(stage) {
    this.enemies = []; this.target = 0; this.turns = 0; this.turnDamage = 0; this.completed = false;
    state.player.resonance = 0;
    state.player.chakraSeal = 0;
    document.body.classList.toggle('forest-combat', !!stage.forest);
    if (!stage.forest) { document.getElementById('forest-targets')?.remove(); return; }
    this.enemies = (stage.members || [stage]).map(e => ({ ...e, hp: e.maxHp, shield: 0, decoys: 0, turnCount: 1 }));
    this.ensureTarget();
  },
  ensureTarget() {
    if (!this.enemies[this.target] || this.enemies[this.target].hp <= 0) this.target = this.enemies.findIndex(e => e.hp > 0);
    if (this.target >= 0) state.enemy = this.enemies[this.target];
  },
  absorbDecoy(amt) {
    if (!this.active() || amt <= 0) return false;
    this.ensureTarget();
    this.turnDamage += amt;
    if (state.enemy.decoys > 0) { state.enemy.decoys--; spawnFloatingText('enemy-box', 'Double dissipé', 'miss'); return true; }
    return false;
  },
  afterCard() {
    if (!this.alive().length) { this.completed = true; handleStageVictory(); }
    else { this.ensureTarget(); updateUI(); }
  },
  render() {
    if (!this.active()) return;
    let root = document.getElementById('forest-targets');
    if (!root) { root = document.createElement('div'); root.id = 'forest-targets'; document.getElementById('enemy-box').appendChild(root); }
    root.replaceChildren();
    const stage = STAGES[currentStageIndex];
    const objective = document.createElement('p');
    objective.textContent = stage.exam ? `${stage.round} · ${stage.name}${stage.members ? ' — mettre Akamaru hors combat réduit les attaques de Kiba.' : ' — Jūken réduit le chakra du prochain tour ; interromps les 64 Paumes.'}` : stage.survival ? `Survis 6 tours · ${this.turns}/6 terminés · dégâts d’interruption : ${this.turnDamage}/18` : `Sélectionne une cible · Parchemins : ${currentStageIndex >= 9 ? 'Terre + Ciel' : currentStageIndex >= 8 ? 'Terre' : '—'}`;
    root.appendChild(objective);
    if (state.player.resonance) { const p = document.createElement('p'); p.textContent = 'Résonance : ta prochaine carte de protection donne 4 de bouclier en moins.'; root.appendChild(p); }
    if (state.player.chakraSeal) {
      const p = document.createElement('p'); p.textContent = `Tenketsu bloqués : −${state.player.chakraSeal} chakra pour ce tour. Le maximum permanent ne change pas.`; root.appendChild(p);
    }
    this.enemies.forEach((e, i) => {
      const b = document.createElement('button'); b.className = 'forest-target';
      b.disabled = e.hp <= 0 || busy || storyPhase !== 'combat'; b.setAttribute('aria-pressed', String(i === this.target));
      const label = stage.survival ? 'Survie · 6 tours' : `${e.hp}/${e.maxHp} PV`;
      b.textContent = `${e.icon} ${e.name} · ${e.hp <= 0 ? 'Hors combat' : label}\nBouclier : ${e.shield} · Doubles : ${e.decoys}\n${e.hp > 0 ? this.move(e).intent : ''}${e.hp > 0 && this.move(e).interrupt ? '\nInterruption : ' + this.turnDamage + '/' + this.move(e).interrupt : ''}`;
      b.onclick = () => { if (busy || storyPhase !== 'combat') return; this.target = i; this.ensureTarget(); updateUI(); };
      root.appendChild(b);
    });
  },
  endTurn() {
    if (busy || isGameOver || storyPhase !== 'combat') return;
    busy = true;
    // Each clone makes a separate strike: useful for removing illusion doubles.
    for (let i = 0; i < state.player.clones && this.alive().length; i++) { this.ensureTarget(); dealDamageToEnemy(3); }
    if (!this.alive().length) { busy = false; this.completed = true; handleStageVictory(); return; }
    const retained = [];
    for (const c of state.hand) {
      if (c.isCurse && c.endTurnDmg) hitPlayer(c.endTurnDmg);
      if (c.retain && !c.isCurse) { if (c.channelBonus !== undefined) c.channelBonus++; retained.push(c); }
      else state.discard.push(c);
    }
    state.hand = retained;
    if (isGameOver) { busy = false; return; }
    let draw = 4;
    let nextChakraSeal = 0;
    for (const e of [...this.alive()]) {
      if (e.hp <= 0) continue;
      const m = this.move(e);
      if (m.shield) e.shield += m.shield;
      if (m.protect) { const ally = this.alive().find(a => a !== e); if (ally) ally.shield += m.protect; }
      if (m.decoys) this.alive().forEach(a => { a.decoys = m.decoys; });
      if (m.distraction) state.discard.push({ id: 'distraction', name: 'Distraction', cost: 1, isCurse: true, temporary: true, type: 'curse', icon: '🔔', desc: 'Coûte 1 chakra. Disparaît lorsque jouée ; retirée après le combat.' });
      if (m.resonance) state.player.resonance = 4;
      if (m.constrict) draw = 3;
      if (m.clearClones) state.player.clones = 0;
      const interrupted = m.interrupt && this.turnDamage >= m.interrupt;
      if (interrupted) document.getElementById('log').innerText = `${e.name} : technique interrompue !`;
      if (!interrupted) {
        if (m.chakraSeal) nextChakraSeal = Math.max(nextChakraSeal, m.chakraSeal);
        const hits = m.multiHit ? Array(m.multiHit).fill(m.hitDmg) : m.dmg ? [m.dmg] : [];
        for (const damage of hits) { hitPlayer(damage); if (isGameOver) break; }
      }
      if (isGameOver) { busy = false; renderClones(); return; }
    }
    this.turns++; this.turnDamage = 0;
    if (STAGES[currentStageIndex].survival && this.turns >= 6) { busy = false; this.completed = true; handleStageVictory(); return; }
    if (!this.alive().length) { busy = false; this.completed = true; handleStageVictory(); return; }
    state.player.shield = 0; state.player.chakraSeal = nextChakraSeal;
    state.player.chakra = Math.max(0, state.player.maxChakra - nextChakraSeal);
    state.player.cardsPlayedThisTurn = 0; state.player.nextAttackFree = false;
    this.ensureTarget(); renderClones(); drawCards(draw); busy = false; updateUI();
  },
  reward() {
    this.completed = true; busy = true;
    saveGame();
    const stage = STAGES[currentStageIndex], overlay = document.getElementById('overlay'), picker = document.getElementById('rewards-picker');
    overlay.style.display = 'flex'; picker.replaceChildren();
    document.getElementById('overlay-title').style.color = '#f59e0b';
    document.getElementById('overlay-title').innerText = stage.survival ? 'Forêt de la Mort terminée !' : `Victoire · ${stage.name}`;
    document.getElementById('overlay-sub').innerText = stage.survival ? 'Tu as survécu à Orochimaru. Les deux parchemins sont réunis : accès à la tour validé.' : `${stage.scroll ? 'Parchemin du ' + stage.scroll + ' obtenu. ' : ''}Choisis une technique ou poursuis avec ton deck.`;
    const next = reward => {
      if (storyPhase !== 'reward') return;
      storyPhase = 'transition';
      if (reward) state.deck.push({ ...reward });
      overlay.style.display = 'none';
      // Full piles are merged by loadStage; the rest choice only changes HP or a card.
      if ([6, 8, 10].includes(currentStageIndex)) {
        state.deck.push(...state.hand, ...state.discard, ...state.exhausted); state.hand = []; state.discard = []; state.exhausted = [];
        state.deck = state.deck.filter(c => !c.isCurse && !c.temporary);
        openRestSite(currentStageIndex + 1);
      } else loadStage(currentStageIndex + 1);
    };
    const button = (text, action) => { const b = document.createElement('button'); b.className = 'menu-btn'; b.textContent = text; b.onclick = action; picker.appendChild(b); };
    if (stage.survival) {
      localStorage.setItem('naruto_forest_complete', 'true');
      button('Continuer · Examen Chūnin', () => {
        if (storyPhase !== 'reward') return;
        overlay.style.display = 'none'; state.player.hp = state.player.maxHp; loadStage(10);
      });
      return;
    }
    if (currentStageIndex === 11) {
      localStorage.setItem('naruto_chunin_complete', 'true'); clearSave();
      document.getElementById('overlay-title').innerText = 'Victoire sur Neji · Examen Chūnin terminé !';
      document.getElementById('overlay-sub').innerText = 'Les combats de Kiba et Neji sont terminés. La suite du mode histoire reste à venir.';
      button('Retour au menu', () => location.reload()); return;
    }
    const options = currentStageIndex === 10 ? [...EXAM_REWARDS] : [...REWARD_OPTIONS];
    if (currentStageIndex !== 10) shuffle(options);
    options.slice(0,3).forEach(c => button(`${c.name} · ${c.cost} chakra — ${c.desc}`, () => next(c)));
    button('Continuer sans ajouter de carte', () => next(null));
  },
  enterChapter() {
    document.getElementById('overlay').style.display = 'none';
    state.player.hp = state.player.maxHp;
    loadStage(4);
  },
  startExam() {
    if (!assetsReady) return;
    if (hasSavedGame() && !window.confirm('Commencer l’examen Chūnin remplacera ta partie sauvegardée. Continuer ?')) return;
    AudioEngine.init(); document.getElementById('main-menu').style.display = 'none';
    initNewGame();
    state.deck.push({ ...CARDS_POOL[5] }, { ...CARDS_POOL[7] });
    upgradeCard([...state.deck, ...state.hand, ...state.discard].find(c => c.id === 'kawarimi'));
    loadStage(10);
  },
  startChapter() {
    if (!assetsReady) return;
    if (hasSavedGame() && !window.confirm('Commencer le chapitre 2 remplacera ta partie sauvegardée. Continuer ?')) return;
    // Chapter selection lets existing players enter without replaying chapter 1.
    AudioEngine.init(); document.getElementById('main-menu').style.display = 'none';
    initNewGame();
    state.deck.push({ ...CARDS_POOL[5] }, { ...CARDS_POOL[7] });
    this.enterChapter();
  }
};

