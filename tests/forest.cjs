const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
function context() {
  const elements=new Map(), storage=new Map();
  const el=()=>({style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},children:[],appendChild(c){this.children.push(c)},replaceChildren(){this.children=[]},setAttribute(){},remove(){},querySelector(){return el()},querySelectorAll(){return []},innerText:'',innerHTML:''});
  const document={getElementById(id){if(!elements.has(id))elements.set(id,el());return elements.get(id)},createElement:el,querySelector:()=>el(),querySelectorAll:()=>[],body:el()};
  const c=vm.createContext({console,document,window:{},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:()=>0,clearTimeout(){},location:{reload(){}},Image:function(){}});
  for (const file of ['js/cards.js','js/game.js','js/tutorial.js','js/forest.js']) vm.runInContext(fs.readFileSync(file,'utf8'),c);
  vm.runInContext(`AudioEngine.play=()=>{}; AudioEngine.playMusic=()=>{}; AudioEngine.init=()=>{};
    spawnFloatingText=()=>{}; triggerShake=()=>{}; triggerRush=()=>{}; spawnVFX=()=>{};
    renderHand=()=>{}; renderClones=()=>{}; resolveImgSrc=()=>{}; assetsReady=true;
    this.api={state,Forest,STAGES,CARDS_POOL,RELICS_POOL,getStage:()=>currentStageIndex,getPhase:()=>storyPhase,setRelic:r=>activeRelic=r,reset:()=>{isGameOver=false;busy=false;storyPhase='combat'},getBusy:()=>busy};`,c);
  return {c, run:s=>vm.runInContext(s,c), a:c.api, document,storage};
}
const t=context(), {a,run}=t;
run('initNewGame()'); assert.equal(a.STAGES.length,15);
// Chapter 1 intentions must show the same move that resolves, not the next entry.
assert.match(t.document.getElementById('enemy-intent').innerText,/Attaque \(6/);
run('loadStage(3); state.enemy.hp=0; handleStageVictory()');
assert.match(t.document.getElementById('rewards-picker').innerHTML,/Forest.enterChapter/);
run('Forest.enterChapter()');assert.equal(a.getStage(),4);assert.equal(a.state.player.hp,60);
// Target selection, shielding and removal of defeated actors.
run('loadStage(6); Forest.target=1; Forest.ensureTarget(); dealDamageToEnemy(100); Forest.afterCard()');
assert.equal(a.Forest.alive().length,1);assert.equal(a.state.enemy.name,'Assaillant');
a.state.player.shield=100;run('Forest.endTurn()');assert.equal(a.state.player.hp,60);
// Illusions absorb one strike each; clones strike independently.
run('loadStage(8); state.enemy.decoys=2; dealDamageToEnemy(22)');assert.equal(a.state.enemy.hp,32);assert.equal(a.state.enemy.decoys,1);
run('dealDamageToEnemy(22); dealDamageToEnemy(6)');assert.equal(a.state.enemy.hp,26);
// Kin inserts temporary Distraction, playing it removes it entirely.
run('loadStage(7); state.player.shield=100; Forest.endTurn()');
assert([...a.state.hand,...a.state.discard,...a.state.deck].some(c=>c.temporary));
run(`state.discard=[];state.hand=[{name:'Distraction',cost:1,isCurse:true,temporary:true}];state.player.chakra=3;playCard(0)`);
assert(!a.state.discard.some(c=>c.name==='Distraction'));assert.equal(a.state.player.chakra,2);
// Dosu weakens exactly the next defense card.
run('state.player.resonance=4;state.player.shield=0;state.hand=[{...CARDS_POOL[1]}];playCard(0)');assert.equal(a.state.player.shield,2);assert.equal(a.state.player.resonance,0);
// Serpent constricts only the next draw.
run('initNewGame();loadStage(5); Forest.turns=1;state.player.shield=100;Forest.endTurn()');assert.equal(a.state.hand.length,3);
run('state.player.shield=100;Forest.endTurn()');assert.equal(a.state.hand.length,4);
// Interruption prevents announced damage, but surviving the sixth attack is mandatory.
run('loadStage(9);Forest.turns=2;Forest.turnDamage=18;state.player.hp=60;Forest.endTurn()');assert.equal(a.state.player.hp,60);
run('Forest.turns=5;Forest.turnDamage=0;state.player.hp=1;Forest.endTurn()');assert.equal(a.state.player.hp,0);assert(!t.storage.has('naruto_forest_complete'));
run('loadStage(9);Forest.turns=5;Forest.turnDamage=18;state.player.hp=60;Forest.endTurn()');assert(t.storage.has('naruto_forest_complete'));
// Save full deck, exclude temporary/curse cards; rest and rewards resume without duplicating relics.
run('initNewGame();loadStage(8);state.hand.push({name:"Distraction",temporary:true});openRestSite(9)');
let save=JSON.parse(t.storage.get('naruto_deckbuilder_save'));assert.equal(save.deck.length,10);assert.equal(save.storyPhase,'rest');
run('continueGame()');assert.equal(a.getPhase(),'rest');run('takeRest()');assert.equal(a.getStage(),9);
run('activeRelic=RELICS_POOL[1];state.player.maxChakra=4;saveGame();continueGame();continueGame()');assert.equal(a.state.player.maxChakra,4);
run('loadStage(7);Forest.enemies.forEach(e=>e.hp=0);handleStageVictory()');save=JSON.parse(t.storage.get('naruto_deckbuilder_save'));assert.equal(save.storyPhase,'reward');
run('continueGame()');assert.equal(a.getPhase(),'reward');
console.log('PASS: 15 encounters, chapter transition, target deaths, illusions, clones, Distraction removal, resonance, constriction, interruption, survival/death precedence, full-deck save, rest/reward resume, relic idempotence');


module.exports = { context };
