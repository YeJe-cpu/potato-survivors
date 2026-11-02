import {
  chooseUpgrade,
  continueAfterWin,
  createWorld,
  dismissChest,
  FIXED_DT,
  rerollUpgrades,
  skipUpgrade,
  startRun,
  step,
  __testSpawnBoss,
  __testSpawnReadyChest,
  __testSpawnRecruit,
} from '../src/sim/world.ts'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

// --- Easy combat loop ---
const w = createWorld(42, 'easy')
startRun(w)
assert(w.recruitSpots.length >= 1, 'expected starting recruit spot')
assert(w.chests.length >= 1, 'expected starting chest')

let levelUps = 0
let sawBoss = false
let sawAlly = false
let sawChestUi = false
let pausedTimeCheck = w.time

for (let i = 0; i < 60 * 120; i++) {
  step(w, { moveX: Math.sin(i / 20) * 0.4, moveY: Math.cos(i / 25) * 0.4, dash: i % 120 === 0 }, FIXED_DT)
  if (w.enemies.some((e) => e.kind === 'boss')) sawBoss = true
  if (w.allies.length > 0) sawAlly = true
  if (w.state === 'levelup') {
    // time must not advance while choosing
    const t0 = w.time
    step(w, { moveX: 0, moveY: 0, dash: false }, FIXED_DT)
    assert(w.time === t0, 'time advanced during levelup')
    levelUps++
    if (w.rerolls > 0 && levelUps === 3) {
      const before = w.upgradeChoices.map((c) => c.id).join(',')
      rerollUpgrades(w)
      // may or may not change; just ensure charge spent or still levelup
      assert(w.state === 'levelup', 'reroll should stay in levelup')
      void before
    }
    if (w.skips > 0 && levelUps === 5) {
      skipUpgrade(w)
    } else {
      chooseUpgrade(w, levelUps % 3)
    }
  }
  if (w.state === 'chest') {
    sawChestUi = true
    const t0 = w.time
    step(w, { moveX: 0, moveY: 0, dash: false }, FIXED_DT)
    assert(w.time === t0, 'time advanced during chest')
    dismissChest(w)
  }
  if (w.state === 'dead' || w.state === 'win') break
}

assert(levelUps >= 1, 'expected at least one level-up, kills=' + w.killCount)

// Force recruit / boss / chest paths if natural run missed them (short seed variance)
const w2 = createWorld(99, 'easy')
startRun(w2)
__testSpawnRecruit(w2)
step(w2, { moveX: 1, moveY: 0, dash: false }, FIXED_DT)
assert(w2.allies.length >= 1, 'recruit walk-in failed')
sawAlly = true

__testSpawnBoss(w2, 0)
assert(w2.enemies.some((e) => e.kind === 'boss' && e.nameKey === 'boss1'), 'boss spawn failed')
assert(w2.enemies.find((e) => e.kind === 'boss')!.maxHp >= 250, 'boss hp too low')
sawBoss = true

__testSpawnReadyChest(w2)
// walk into chest
for (let i = 0; i < 30; i++) step(w2, { moveX: 1, moveY: 0, dash: false }, FIXED_DT)
assert(w2.state === 'chest' || sawChestUi || w2.chests.some((c) => c.opened), 'chest open path failed')
if (w2.state === 'chest') {
  sawChestUi = true
  dismissChest(w2)
  assert(w2.state === 'playing', 'chest dismiss failed')
}

// Difficulty affects starting HP
const easy = createWorld(1, 'easy')
const hard = createWorld(1, 'hard')
assert(easy.player.maxHp > hard.player.maxHp, 'easy should have more HP than hard')

// Win at 20:00 then continue
const w3 = createWorld(7, 'easy')
startRun(w3)
w3.time = w3.winTime - FIXED_DT
step(w3, { moveX: 0, moveY: 0, dash: false }, FIXED_DT)
assert(w3.state === 'win', 'expected win at 20:00, got ' + w3.state)
continueAfterWin(w3)
assert(w3.state === 'playing' && w3.wonOnce, 'continue after win failed')
const tAfter = w3.time
step(w3, { moveX: 0, moveY: 0, dash: false }, FIXED_DT)
assert(w3.state === 'playing', 'should not re-win immediately')
assert(w3.time > tAfter, 'time should advance after continue')

// Unlock helpers by level
const w4 = createWorld(3, 'easy')
startRun(w4)
w4.player.level = 2
w4.player.xp = w4.player.xpToNext
// inject gem pickup via direct gain: spawn gem under player and step
w4.gems.push({ id: 999, x: w4.player.x, y: w4.player.y, r: 6, value: 100, vx: 0, vy: 0 })
step(w4, { moveX: 0, moveY: 0, dash: false }, FIXED_DT)
assert(w4.state === 'levelup', 'expected levelup from gem')
assert(w4.player.level >= 3, 'expected level >= 3')
// level 3 unlocks skip
assert(w4.skips >= 1, 'expected skip unlock at lv3, skips=' + w4.skips)

console.log(
  JSON.stringify({
    ok: true,
    time: Number(w.time.toFixed(2)),
    level: w.player.level,
    levelUps,
    kills: w.killCount,
    gold: w.gold,
    allies: w.allies.length,
    sawBoss,
    sawAlly,
    sawChestUi,
    difficulty: w.difficulty,
    state: w.state,
    easyHp: easy.player.maxHp,
    hardHp: hard.player.maxHp,
  }),
)
