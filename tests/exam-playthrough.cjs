// A repeatable smoke simulation, not a substitute for human balance or visual tests.
const {context}=require('./forest.cjs');
const assert=require('assert/strict');
let wins=0;
for(let seed=1;seed<=40;seed++){
 const t=context(),{a,run}=t;t.c.window.confirm=()=>true;
 run(`let randomSeed=${seed};Math.random=()=>{randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/4294967296;};Forest.startExam()`);
 for(let turns=0;turns<50&&a.state.player.hp>0;turns++){
  if(t.storage.has('naruto_chunin_complete')){wins++;break;}
  if(a.getPhase()==='reward'){
   // Pick defensive reward, then heal at the rest site.
   t.document.getElementById('rewards-picker').children[2].onclick();continue;
  }
  if(a.getPhase()==='rest'){run('takeRest()');continue;}
  if(a.getStage()===10&&a.Forest.enemies[1].hp>0)run('Forest.target=1;Forest.ensureTarget()');
  for(let actions=0;actions<20&&a.getPhase()==='combat';actions++){
   let incoming=a.Forest.alive().reduce((n,e)=>{const m=a.Forest.move(e);return n+(m.dmg||m.multiHit*m.hitDmg||0)},0);
   const hand=a.state.hand.map((c,i)=>({c,i})).filter(({c})=>c.cost<=a.state.player.chakra&&(!c.cloneCost||a.state.player.clones>=c.cloneCost));
   hand.sort((x,y)=>score(y.c)-score(x.c));
   function score(c){return ((c.shield||0)&&a.state.player.shield<incoming?100:0)+(c.clones||0)*12+(c.dmg||0)+(c.chakraGain||0)*20-(c.selfDmg||0);}
   if(!hand.length)break;
   run(`playCard(${hand[0].i})`);
  }
  if(a.getPhase()==='combat')run('endTurn()');
 }
}
assert(wins>0,'No automated starter run could complete the new rounds');
console.log(`Starter deck exam smoke simulation: ${wins}/40 completions (fixed seeds; no artificial HP, shields or damage).`);
