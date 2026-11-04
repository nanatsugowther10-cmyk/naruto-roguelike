const assert=require('assert/strict'),{context}=require('./forest.cjs');
(async()=>{
 const t=context(),{a,run}=t;t.c.tracks=[];
 run('AudioEngine.playMusic=track=>tracks.push(track);initNewGame();loadStage(1);loadStage(2);loadStage(3);loadStage(4)');
 assert.deepEqual(Array.from(t.c.tracks),['first_level.m4a','first_level.m4a','first_level.m4a','first_level.m4a','second_level.m4a']);
 const names=run('Object.values(ENEMY_ART)');assert.equal(names.length,14);
 for(const stage of a.STAGES.filter(s=>s.forest))for(const e of stage.members||[stage])assert(e.sprite.endsWith('.webp'));
 t.c.requested=[];
 run('loadImageAsset=path=>{requested.push(path);return Promise.resolve({src:path})}');
 await run('preloadAllAssets()');
 for(const n of names)assert(t.c.requested.includes('assets/characters/'+n+'.webp'),n+' was not preloaded');
 console.log('PASS: correct soundtrack across all four Waves fights, forest soundtrack, 14 sprite mappings and preload paths');
})().catch(e=>{console.error(e);process.exitCode=1});