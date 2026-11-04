const assert=require('assert/strict'),{context}=require('./forest.cjs');
const t=context(),{a,run,document,storage}=t;
// Reward UI: three genuine illustrated cards, then a separate full-width skip action.
run('initNewGame();loadStage(4);state.enemy.hp=0;Forest.afterCard()');
const choices=document.getElementById('rewards-picker').children;
assert.equal(choices.length,4);
for(const c of choices.slice(0,3)){assert.match(c.className,/reward-card/);assert.match(c.innerHTML,/card-img-el/);assert.match(c.innerHTML,/card-art/);assert.match(c.innerHTML,/card-cost/);}
assert.match(choices[3].textContent,/Continuer sans/);
// Akamaru alone gets the smaller image; both portraits occupy equal baseline frames.
run('loadStage(10)');
let panels=document.getElementById('forest-targets').children.filter(e=>e.className==='forest-target');
assert.equal(panels.length,2);
assert.equal(panels[0].children[0].className,'enemy-art-frame');
assert(!panels[0].children[0].children[0].className.includes('small'));
assert(panels[1].children[0].children[0].className.includes('small'));
// Training completion requires both the duration and the relevant card action, not enemy HP.
run('loadStage(12);state.player.hp=60;Forest.turns=3;Forest.trainingChakra=8;state.player.shield=100;endTurn()');assert.equal(a.getPhase(),'combat');
run('state.hand=[{...CARDS_POOL[1]}];state.player.chakra=3;playCard(0)');assert.equal(a.Forest.trainingChakra,9);
run('state.player.shield=100;endTurn()');assert.equal(a.getPhase(),'reward');
run('loadStage(12);dealDamageToEnemy(10000);Forest.afterCard()');assert.equal(a.state.enemy.hp,1);assert.equal(a.getPhase(),'combat');
run('loadStage(13);Forest.turns=3;Forest.trainingBlocked=17;state.player.hp=60;state.player.shield=1;endTurn()');assert.equal(a.Forest.trainingBlocked,18);assert.equal(a.getPhase(),'reward');
// Exact snapshots keep objective progress, selected cards and turn counters.
run('document.getElementById("main-menu").style.display="none";loadStage(12);Forest.trainingChakra=5;Forest.turns=2;saveFromOptions();continueGame()');assert.equal(a.Forest.trainingChakra,5);assert.equal(a.Forest.turns,2);
run('loadStage(13);Forest.trainingBlocked=11;saveFromOptions();continueGame()');assert.equal(a.Forest.trainingBlocked,11);
// Old Neji index stays valid, now leading to Gaara instead of clearing the save.
run('loadStage(11);state.enemy.hp=0;Forest.afterCard()');assert(storage.has('naruto_deckbuilder_save'));
let buttons=document.getElementById('rewards-picker').children;buttons[3].onclick();assert.equal(a.getPhase(),'rest');run('takeRest()');assert.equal(a.getStage(),14);
// Gaara switches patterns at half health and preserves phase after exact resume.
assert.match(a.Forest.move(a.state.enemy).intent,/Vague/);
run('dealDamageToEnemy(70);Forest.afterCard()');assert.match(a.Forest.move(a.state.enemy).intent,/Shukaku/);
run('saveFromOptions();continueGame()');assert.match(a.Forest.move(a.state.enemy).intent,/Shukaku/);
run('Forest.turns=2;Forest.turnDamage=20;state.player.hp=60;endTurn()');assert.equal(a.state.player.hp,60);
run('state.enemy.hp=0;Forest.afterCard()');assert(storage.has('naruto_konoha_complete'));assert(!storage.has('naruto_deckbuilder_save'));assert.match(document.getElementById('overlay-title').innerText,/Gaara/);
let reloads=0;t.c.location.reload=()=>reloads++;run('returnToMainMenu()');assert.equal(reloads,1);assert(!storage.has('naruto_deckbuilder_save'));
console.log('PASS: illustrated rewards, Akamaru sizing marker and baseline frames, chakra/block training goals, objective snapshots, old Neji index continuity, Gaara phases/interruption, final completion and menu return');
