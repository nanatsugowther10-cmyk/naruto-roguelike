// Short, isolated encounter: replay never mutates the story save or combat state.
const MizukiTutorial = {
  active: false,
  replay: false,
  phase: 0,
  hp: 24,
  playerHp: 30,
  shield: 0,
  chakra: 3,
  clones: 0,
  hand: [],
  message: '',
  open(replay = false) {
    if (!assetsReady) return;
    this.active = true;
    this.replay = replay;
    this.phase = 0;
    this.hp = 24;
    this.playerHp = 30;
    this.shield = 0;
    this.chakra = 3;
    this.clones = 0;
    this.hand = [0, 1];
    this.message = 'Iruka est blessé. Mizuki veut le parchemin : protège ton maître !';
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('mizuki-tutorial').hidden = false;
    this.render();
  },
  hint() {
    return [
      '1/3 · Clique sur Coup de Poing pour attaquer. Son coût en chakra est indiqué en haut.',
      '2/3 · Mizuki annonce 6 dégâts. Joue Kawarimi pour obtenir 6 de bouclier.',
      '2/3 · Ton bouclier est prêt. Termine le tour pour laisser Mizuki attaquer.',
      '3/3 · À toi de riposter : joue Kage Bunshin pour créer deux clones.',
      'À toi de jouer ! Les clones infligent chacun 3 dégâts à chaque fin de tour. Termine le combat.'
    ][this.phase];
  },
  play(index) {
    if (!this.active || this.hp <= 0 || this.playerHp <= 0) return;
    const id = this.hand[index];
    const expected = [0, 1, null, 2][this.phase];
    if (this.phase < 4 && id !== expected) return;
    const card = CARDS_POOL[id];
    if (!card || card.cost > this.chakra) return;
    this.chakra -= card.cost;
    this.hp = Math.max(0, this.hp - (card.dmg || 0));
    this.shield += card.shield || 0;
    this.clones += card.clones || 0;
    this.hand.splice(index, 1);
    this.message = `${card.name} : ${card.dmg ? card.dmg + ' dégâts.' : card.shield ? card.shield + ' de bouclier.' : 'Deux clones apparaissent !'}`;
    AudioEngine.play(card.clones ? 'clone' : card.shield ? 'block' : 'hit');
    if (this.phase === 0 || this.phase === 1 || this.phase === 3) this.phase++;
    this.render();
  },
  endTurn() {
    if (!this.active || this.hp <= 0 || this.playerHp <= 0 || ![2, 4].includes(this.phase)) return;
    const cloneDamage = this.clones * 3;
    this.hp = Math.max(0, this.hp - cloneDamage);
    if (this.hp === 0) { this.render(); return; }
    const damage = Math.max(0, 6 - this.shield);
    this.playerHp = Math.max(0, this.playerHp - damage);
    this.shield = 0;
    this.chakra = 3;
    this.message = `Mizuki attaque : ${damage} PV perdus.${cloneDamage ? ` Tes clones ont infligé ${cloneDamage} dégâts.` : ' Kawarimi a absorbé toute l’attaque !'}`;
    if (this.phase === 2) {
      this.phase = 3;
      this.hand = [2, 0, 1];
    } else {
      this.hand = [0, 0, 1];
    }
    this.render();
  },
  leave(startStory) {
    if (!this.active) return;
    const replay = this.replay;
    this.active = false;
    document.getElementById('mizuki-tutorial').hidden = true;
    if (startStory && !replay) {
      // Same starting deck and health whether the player wins or skips.
      clearSave();
      initNewGame();
    } else {
      document.getElementById('main-menu').style.display = 'flex';
    }
  },
  render() {
    const root = document.getElementById('mizuki-tutorial');
    const won = this.hp === 0;
    const lost = this.playerHp === 0;
    root.innerHTML = `
      <div class="tutorial-panel">
        <div class="tutorial-header"><h2>Prologue · Le parchemin de Mizuki</h2>
          <button class="menu-btn" id="tutorial-skip">${this.replay ? 'Quitter le tutoriel' : 'Passer le tutoriel →'}</button></div>
        <p id="tutorial-hint" role="status" aria-live="polite">${won ? 'Iruka reconnaît ta valeur. Tu es prêt pour ta première mission !' : lost ? 'Naruto est à terre. Réessaie ou passe directement à l’histoire.' : this.hint()}</p>
        <div class="tutorial-arena">
          <div><img class="tutorial-naruto" src="assets/characters/naruto.png" alt="Naruto"><p>Naruto · ${this.playerHp}/30 PV</p><p>Bouclier : ${this.shield} · Clones : ${this.clones}</p></div>
          <div><img class="tutorial-mizuki" src="assets/characters/mizuki.webp" alt="Mizuki" width="140" height="130"><p>Mizuki · ${this.hp}/24 PV</p><strong>Intention : attaque · 6 dégâts</strong></div>
        </div>
        <p id="tutorial-message" aria-live="polite">${this.message}</p>
        <p>Chakra : ${this.chakra}/3</p>
        <div id="tutorial-hand"></div>
        <div class="tutorial-actions"></div>
      </div>`;
    root.querySelector('#tutorial-skip').onclick = () => this.leave(true);
    const actions = root.querySelector('.tutorial-actions');
    const button = (label, action) => {
      const el = document.createElement('button'); el.className = 'menu-btn'; el.textContent = label; el.onclick = action; actions.appendChild(el); return el;
    };
    if (won) {
      button(this.replay ? 'Retour au menu' : 'Commencer le Pays des Vagues →', () => this.leave(true));
      return;
    }
    if (lost) {
      button('Réessayer', () => this.open(this.replay));
      return;
    }
    const hand = root.querySelector('#tutorial-hand');
    this.hand.forEach((id, index) => {
      const card = CARDS_POOL[id];
      const el = document.createElement('button');
      el.className = `card card-${card.type}`;
      el.disabled = card.cost > this.chakra || (this.phase < 4 && id !== [0, 1, null, 2][this.phase]);
      el.innerHTML = `<div class="card-top"><span>${card.name}</span><span class="card-cost">${card.cost}</span></div><div class="card-art"><img class="card-img-el" alt=""><span class="card-art-placeholder"></span></div><div class="card-desc">${card.desc}</div>`;
      resolveImgSrc(el.querySelector('img'), card.img, card.icon);
      el.onclick = () => this.play(index);
      hand.appendChild(el);
    });
    button('Fin du tour', () => this.endTurn()).disabled = ![2, 4].includes(this.phase);
  }
};
