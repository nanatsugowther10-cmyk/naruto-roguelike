const assert=require('assert/strict');
const {context}=require('./forest.cjs');
const t=context(), {a,run,document,storage}=t;
// New chapter joins existing progression and preserves permanent state.
run('initNewGame(); activeRelic=RELICS_POOL[1];activeRelic.apply(state);loadStage(9);Forest.turns=5;Forest.turnDamage=18;state.player.hp=20;endTurn()');
assert.equal(a.getPhase(),'reward');
assert(storage.has('naruto_forest_complete'));assert(storage.has('naruto_deckbuilder_save'));
let buttons=document.getElementById('rewards-picker').children;
assert.match(buttons[0].textContent,/Examen/);buttons[0].onclick();
assert.equal(a.getStage(),10);assert.equal(a.state.player.hp,60);assert.equal(a.state.player.maxChakra,4);
assert.equal(a.Forest.enemies.length,2);
// Kiba's announced and resolved damage both depend on Akamaru remaining active.
assert.equal(a.Forest.move(a.Forest.enemies[0]).dmg,11);
assert.match(a.Forest.move(a.Forest.enemies[0]).intent,/coordination/);
run('Forest.target=1;Forest.ensureTarget();dealDamageToEnemy(26);Forest.afterCard()');
assert.equal(a.getPhase(),'combat');assert.equal(a.state.enemy.name,'Kiba');
assert.equal(a.Forest.move(a.state.enemy).dmg,7);
a.state.player.shield=0;run('endTurn()');assert.equal(a.state.player.hp,53);
// Support shield is granted only if Akamaru is active.
run('loadStage(10);Forest.turns=1;endTurn()');assert.equal(a.Forest.enemies[0].shield,12);
run('loadStage(10);Forest.enemies[1].hp=0;Forest.turns=1;endTurn()');assert.equal(a.Forest.enemies[0].shield,6);
// Rewards, rest and restoration preserve the whole deck and selected technique exactly once.
run('Forest.enemies.forEach(e=>e.hp=0);handleStageVictory()');
assert.equal(a.getPhase(),'reward');assert.equal(JSON.parse(storage.get('naruto_deckbuilder_save')).currentStageIndex,10);
buttons=document.getElementById('rewards-picker').children;assert.equal(buttons.length,4);
buttons[0].onclick();buttons[0].onclick(); // Double-click must not duplicate the technique.
assert.equal(a.getPhase(),'rest');
assert.equal(a.state.deck.filter(c=>c.id==='reserve_chakra').length,1);
run('continueGame()');assert.equal(a.getPhase(),'rest');
run('takeRest()');assert.equal(a.getStage(),12);run('loadStage(11)');assert.equal(a.state.player.maxChakra,4);
// Juken costs one chakra for one player turn, then restores the permanent maximum.
run('state.player.hp=60;state.player.shield=0;endTurn()');
assert.equal(a.state.player.chakra,3);assert.equal(a.state.player.maxChakra,4);assert.equal(a.state.player.chakraSeal,1);
run('endTurn()');assert.equal(a.state.player.chakra,4);assert.equal(a.state.player.chakraSeal,0);
// An extra chakra source still works under the seal, and consumes for this combat only.
run(`loadStage(11);state.player.chakra=2;state.hand=[{...EXAM_REWARDS[0]}];playCard(0)`);
assert.equal(a.state.player.chakra,3);assert.equal(a.state.exhausted.length,1);
// Neji's four strikes interact with shield individually; 16 power interrupts all four.
run('loadStage(11);Forest.turns=2;state.player.hp=60;state.player.shield=6;endTurn()');assert.equal(a.state.player.hp,50);
run('loadStage(11);Forest.turns=2;Forest.turnDamage=16;state.player.hp=60;endTurn()');assert.equal(a.state.player.hp,60);
// Clone strikes can complete the interruption threshold.
run('loadStage(11);Forest.turns=2;Forest.turnDamage=13;state.player.clones=1;state.player.hp=60;endTurn()');assert.equal(a.state.player.hp,60);
// Retained reward remains in hand if unused. It disappears from hand when played normally.
run('loadStage(11);state.hand=[{...EXAM_REWARDS[2]}];state.player.shield=100;endTurn()');
assert(a.state.hand.some(c=>c.id==='garde_concentree'));
run('state.hand=[{...EXAM_REWARDS[2]}];state.player.chakra=3;state.player.shield=0;playCard(0)');assert.equal(a.state.player.shield,9);assert.equal(a.state.hand.length,0);
// Reset and save-resume never carry over combat-only chakra seal.
run('loadStage(11);state.player.chakraSeal=1;saveGame();continueGame()');assert.equal(a.state.player.chakraSeal,0);assert.equal(a.state.player.chakra,4);
// The campaign finale at Gaara ends cleanly without loading a missing stage.
run('loadStage(14);state.enemy.hp=0;Forest.afterCard()');assert(storage.has('naruto_chunin_complete'));assert(!storage.has('naruto_deckbuilder_save'));
assert.match(document.getElementById('overlay-title').innerText,/Gaara/);
buttons=document.getElementById('rewards-picker').children;assert.equal(buttons.length,1);assert.match(buttons[0].textContent,/Retour/);
// Direct chapter start uses a full valid starter even when every Kawarimi is in the hand.
const d=context();d.c.window.confirm=()=>true;
for(let i=0;i<30;i++){
 d.run('Forest.startExam()');assert.equal(d.a.getStage(),10);
 const all=[...d.a.state.deck,...d.a.state.hand];assert.equal(all.length,12);
 assert.equal(all.filter(c=>c.upgraded).length,1);assert.equal(d.a.state.player.maxChakra,3);
}
console.log('PASS: forest-to-exam transition, Kiba/Akamaru coordination and support removal, reward/rest resume, seal duration, extra chakra, multihit/interruption including clones, retention, finale completion and direct chapter start');
