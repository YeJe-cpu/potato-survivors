import type {
  Ally,
  BossNameKey,
  Chest,
  Difficulty,
  Enemy,
  EnemyKind,
  GameState,
  Player,
  Projectile,
  RecruitSpot,
  WeaponStats,
  World,
  XpGem,
} from './types.ts'
import { applyUpgrade, pickUpgradeChoices, UPGRADE_POOL } from './upgrades.ts'

export const WORLD_W = 2000
export const WORLD_H = 2000
export const FIXED_DT = 1 / 60
export const MAX_ALLIES = 3

const BOSS_HP = [300, 450, 650, 850, 1100]
const BOSS_KEYS: BossNameKey[] = ['boss1', 'boss2', 'boss3', 'boss4', 'boss5']

function makePlayer(diff: Difficulty): Player {
  const hp = diff === 'easy' ? 120 : diff === 'hard' ? 85 : 100
  return {
    x: WORLD_W / 2,
    y: WORLD_H / 2,
    vx: 0,
    vy: 0,
    r: 14,
    hp,
    maxHp: hp,
    level: 1,
    xp: 0,
    xpToNext: diff === 'easy' ? 10 : 12,
    moveSpeed: 140,
    dashCd: 0,
    dashTimer: 0,
    facingX: 1,
    facingY: 0,
    invuln: 0,
  }
}

function makeWeapon(): WeaponStats {
  return {
    damage: 8,
    amount: 1,
    cooldown: 0.55,
    timer: 0,
    projectileSpeed: 320,
    projectileLife: 1.2,
  }
}

export function createWorld(seed = Date.now(), difficulty: Difficulty = 'easy'): World {
  return {
    state: 'menu',
    prevState: 'menu',
    time: 0,
    winTime: 20 * 60,
    wonOnce: false,
    difficulty,
    player: makePlayer(difficulty),
    enemies: [],
    projectiles: [],
    gems: [],
    allies: [],
    recruitSpots: [],
    chests: [],
    weapon: makeWeapon(),
    magnet: 70,
    gold: 0,
    nextId: 1,
    spawnAcc: 0,
    upgradeChoices: [],
    seed,
    killCount: 0,
    bossSlot: -1,
    recruitSpawned: 0,
    chestSpawnAcc: 0,
    rerolls: 0,
    skips: 0,
    chestReward: null,
    pendingLevelUnlock: false,
  }
}

export function startRun(world: World, difficulty?: Difficulty): void {
  const seed = world.seed
  const diff = difficulty ?? world.difficulty
  Object.assign(world, createWorld(seed, diff))
  world.state = 'playing'
  world.prevState = 'playing'
  // first recruit ring near player
  spawnRecruitSpot(world, world.player.x + 120, world.player.y - 40)
  // first chest a bit further, 30s countdown like Easy
  spawnChest(world, world.player.x - 140, world.player.y + 90, 30)
}

export function setDifficulty(world: World, d: Difficulty): void {
  if (world.state !== 'menu') return
  world.difficulty = d
  world.player = makePlayer(d)
}

export function setState(world: World, next: GameState): void {
  if (world.state === next) return
  world.prevState = world.state
  world.state = next
}

function nextId(world: World): number {
  return world.nextId++
}

function len(x: number, y: number): number {
  return Math.hypot(x, y)
}

function norm(x: number, y: number): { x: number; y: number } {
  const l = len(x, y)
  if (l < 1e-6) return { x: 0, y: 0 }
  return { x: x / l, y: y / l }
}

export interface InputFrame {
  moveX: number
  moveY: number
  dash: boolean
}

function diffMul(world: World): { spawn: number; xp: number; enemyHp: number } {
  switch (world.difficulty) {
    case 'easy':
      return { spawn: 0.85, xp: 1.25, enemyHp: 0.9 }
    case 'hard':
      return { spawn: 1.25, xp: 0.85, enemyHp: 1.2 }
    default:
      return { spawn: 1, xp: 1, enemyHp: 1 }
  }
}

function spawnRate(time: number): number {
  // Easy-feel warmup: sparse 0–1m → denser 3–5m
  if (time < 20) return 0.55
  if (time < 45) return 0.9
  if (time < 60) return 1.2
  if (time < 120) return 1.7
  if (time < 180) return 2.4
  if (time < 300) return 3.2
  if (time < 600) return 3.8
  return 4.2
}

function pickMobKind(time: number): EnemyKind {
  const r = Math.random()
  if (time < 40) return 'crawler'
  if (time < 100) {
    if (r < 0.7) return 'crawler'
    return 'biter'
  }
  if (r < 0.55) return 'crawler'
  if (r < 0.82) return 'biter'
  return 'tank'
}

function spawnEnemyAt(
  world: World,
  kind: EnemyKind,
  x: number,
  y: number,
  opts?: { nameKey?: BossNameKey; hp?: number; xp?: number },
): Enemy {
  const t = world.time
  const mul = diffMul(world)
  const hpScale = (1 + t / 100) * mul.enemyHp
  const spdScale = 1 + Math.min(0.55, t / 200)

  let enemy: Enemy
  if (kind === 'boss') {
    const hp = (opts?.hp ?? 300) * mul.enemyHp
    enemy = {
      id: nextId(world),
      x,
      y,
      r: 26,
      hp,
      maxHp: hp,
      speed: 48 * spdScale,
      xp: opts?.xp ?? 40,
      kind: 'boss',
      tint: '#9b2226',
      nameKey: opts?.nameKey,
      contactDmg: 22,
    }
  } else if (kind === 'biter') {
    enemy = {
      id: nextId(world),
      x,
      y,
      r: 10,
      hp: 9 * hpScale,
      maxHp: 9 * hpScale,
      speed: 95 * spdScale,
      xp: 3,
      kind: 'biter',
      tint: '#bc6c25',
      contactDmg: 8,
    }
  } else if (kind === 'tank') {
    enemy = {
      id: nextId(world),
      x,
      y,
      r: 16,
      hp: 28 * hpScale,
      maxHp: 28 * hpScale,
      speed: 48 * spdScale,
      xp: 6,
      kind: 'tank',
      tint: '#354f52',
      contactDmg: 14,
    }
  } else {
    enemy = {
      id: nextId(world),
      x,
      y,
      r: 11,
      hp: 12 * hpScale,
      maxHp: 12 * hpScale,
      speed: 70 * spdScale,
      xp: 3,
      kind: 'crawler',
      tint: '#52796f',
      contactDmg: 10,
    }
  }
  world.enemies.push(enemy)
  return enemy
}

function spawnEnemyNearPlayer(world: World, kind: EnemyKind, opts?: { nameKey?: BossNameKey; hp?: number; xp?: number }): void {
  const p = world.player
  const angle = Math.random() * Math.PI * 2
  const dist = kind === 'boss' ? 340 + Math.random() * 80 : 280 + Math.random() * 180
  let x = p.x + Math.cos(angle) * dist
  let y = p.y + Math.sin(angle) * dist
  x = Math.max(40, Math.min(WORLD_W - 40, x))
  y = Math.max(40, Math.min(WORLD_H - 40, y))
  spawnEnemyAt(world, kind, x, y, opts)
}

function spawnRecruitSpot(world: World, x?: number, y?: number): void {
  if (world.allies.length + world.recruitSpots.length >= MAX_ALLIES) return
  const p = world.player
  const angle = Math.random() * Math.PI * 2
  const dist = 160 + Math.random() * 120
  const spot: RecruitSpot = {
    id: nextId(world),
    x: x ?? Math.max(60, Math.min(WORLD_W - 60, p.x + Math.cos(angle) * dist)),
    y: y ?? Math.max(60, Math.min(WORLD_H - 60, p.y + Math.sin(angle) * dist)),
    r: 36,
  }
  world.recruitSpots.push(spot)
  world.recruitSpawned += 1
}

function spawnChest(world: World, x?: number, y?: number, countdown = 25): void {
  const p = world.player
  const angle = Math.random() * Math.PI * 2
  const dist = 180 + Math.random() * 140
  const chest: Chest = {
    id: nextId(world),
    x: x ?? Math.max(60, Math.min(WORLD_W - 60, p.x + Math.cos(angle) * dist)),
    y: y ?? Math.max(60, Math.min(WORLD_H - 60, p.y + Math.sin(angle) * dist)),
    countdown,
    opened: false,
  }
  world.chests.push(chest)
}

function tryFire(world: World): void {
  const w = world.weapon
  if (w.timer > 0) return
  const p = world.player
  if (world.enemies.length === 0) return

  let nearest: Enemy | null = null
  let best = Infinity
  for (const e of world.enemies) {
    const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2
    if (d < best) {
      best = d
      nearest = e
    }
  }
  if (!nearest) return

  const base = norm(nearest.x - p.x, nearest.y - p.y)
  const n = w.amount
  const spread = n === 1 ? 0 : Math.min(0.55, 0.12 * (n - 1))
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2 * spread
    const c = Math.cos(t)
    const s = Math.sin(t)
    const dx = base.x * c - base.y * s
    const dy = base.x * s + base.y * c
    const proj: Projectile = {
      id: nextId(world),
      x: p.x,
      y: p.y,
      vx: dx * w.projectileSpeed,
      vy: dy * w.projectileSpeed,
      r: 5,
      dmg: w.damage,
      life: w.projectileLife,
    }
    world.projectiles.push(proj)
  }
  w.timer = w.cooldown
}

function allyFire(world: World, ally: Ally): void {
  if (ally.fireTimer > 0) return
  let nearest: Enemy | null = null
  let best = Infinity
  for (const e of world.enemies) {
    const d = (e.x - ally.x) ** 2 + (e.y - ally.y) ** 2
    if (d < best) {
      best = d
      nearest = e
    }
  }
  // only shoot if reasonably close
  if (!nearest || best > 320 * 320) return
  const base = norm(nearest.x - ally.x, nearest.y - ally.y)
  world.projectiles.push({
    id: nextId(world),
    x: ally.x,
    y: ally.y,
    vx: base.x * ally.projectileSpeed,
    vy: base.y * ally.projectileSpeed,
    r: 4,
    dmg: ally.damage,
    life: 1.0,
    fromAlly: true,
  })
  ally.fireTimer = ally.cooldown
}

function maybeUnlockHelpers(world: World): void {
  const lv = world.player.level
  // slowly unlock charges (start 0)
  if (lv === 3 && world.skips < 1) world.skips += 1
  if (lv === 5 && world.rerolls < 1) world.rerolls += 1
  if (lv === 8 && world.skips < 2) world.skips += 1
  if (lv === 10 && world.rerolls < 2) world.rerolls += 1
  if (lv === 14 && world.skips < 3) world.skips += 1
  if (lv === 16 && world.rerolls < 3) world.rerolls += 1
}

function gainXp(world: World, amount: number): boolean {
  const p = world.player
  const mul = diffMul(world)
  p.xp += amount * mul.xp
  let leveled = false
  while (p.xp >= p.xpToNext) {
    p.xp -= p.xpToNext
    p.level += 1
    p.xpToNext = Math.floor(12 + p.level * 6 + p.level * p.level * 0.4)
    maybeUnlockHelpers(world)
    world.upgradeChoices = pickUpgradeChoices(world, 3)
    setState(world, 'levelup')
    leveled = true
  }
  return leveled
}

function dropGem(world: World, x: number, y: number, value: number): void {
  const gem: XpGem = {
    id: nextId(world),
    x,
    y,
    r: value >= 20 ? 9 : 6,
    value,
    vx: (Math.random() - 0.5) * 40,
    vy: (Math.random() - 0.5) * 40,
  }
  world.gems.push(gem)
}

function killEnemy(world: World, index: number): void {
  const e = world.enemies[index]!
  dropGem(world, e.x, e.y, e.xp)
  // bosses drop a burst of gems for "lots of XP / gold feel"
  if (e.kind === 'boss') {
    for (let k = 0; k < 6; k++) {
      dropGem(world, e.x + (Math.random() - 0.5) * 40, e.y + (Math.random() - 0.5) * 40, Math.max(4, Math.floor(e.xp / 4)))
    }
    world.gold += 15 + e.xp
  }
  world.enemies.splice(index, 1)
  world.killCount += 1
}

export function chooseUpgrade(world: World, index: number): void {
  if (world.state !== 'levelup') return
  const choice = world.upgradeChoices[index]
  if (!choice) return
  applyUpgrade(world, choice.id)
  world.upgradeChoices = []
  setState(world, 'playing')
}

export function rerollUpgrades(world: World): void {
  if (world.state !== 'levelup') return
  if (world.rerolls <= 0) return
  world.rerolls -= 1
  world.upgradeChoices = pickUpgradeChoices(world, 3)
}

export function skipUpgrade(world: World): void {
  if (world.state !== 'levelup') return
  if (world.skips <= 0) return
  world.skips -= 1
  world.upgradeChoices = []
  world.gold += 5
  setState(world, 'playing')
}

export function continueAfterWin(world: World): void {
  if (world.state !== 'win') return
  world.wonOnce = true
  setState(world, 'playing')
}

export function dismissChest(world: World): void {
  if (world.state !== 'chest') return
  if (world.chestReward?.kind === 'upgrade' && world.chestReward.upgradeId) {
    applyUpgrade(world, world.chestReward.upgradeId)
  } else if (world.chestReward?.kind === 'gold') {
    world.gold += world.chestReward.gold ?? 10
  }
  world.chestReward = null
  setState(world, 'playing')
}

export function togglePause(world: World): void {
  if (world.state === 'playing') setState(world, 'paused')
  else if (world.state === 'paused') setState(world, 'playing')
}

export function step(world: World, input: InputFrame, dt: number): void {
  if (world.state !== 'playing') return

  world.time += dt
  if (!world.wonOnce && world.time >= world.winTime) {
    setState(world, 'win')
    return
  }

  const p = world.player
  if (p.invuln > 0) p.invuln -= dt
  if (p.dashCd > 0) p.dashCd -= dt
  if (world.weapon.timer > 0) world.weapon.timer -= dt

  let mx = input.moveX
  let my = input.moveY
  const ml = len(mx, my)
  if (ml > 1) {
    mx /= ml
    my /= ml
  }
  if (ml > 0.05) {
    p.facingX = mx
    p.facingY = my
  }

  let speed = p.moveSpeed
  if (input.dash && p.dashCd <= 0 && p.dashTimer <= 0) {
    p.dashTimer = 0.18
    p.dashCd = 1.4
    p.invuln = Math.max(p.invuln, 0.2)
  }
  if (p.dashTimer > 0) {
    p.dashTimer -= dt
    speed = p.moveSpeed * 3.2
  }

  p.vx = mx * speed
  p.vy = my * speed
  p.x += p.vx * dt
  p.y += p.vy * dt
  p.x = Math.max(p.r, Math.min(WORLD_W - p.r, p.x))
  p.y = Math.max(p.r, Math.min(WORLD_H - p.r, p.y))

  // spawn mobs
  const mul = diffMul(world)
  world.spawnAcc += spawnRate(world.time) * mul.spawn * dt
  while (world.spawnAcc >= 1) {
    world.spawnAcc -= 1
    spawnEnemyNearPlayer(world, pickMobKind(world.time))
  }

  // named bosses ~every 70s starting ~55s
  if (world.time > 55) {
    const slot = Math.floor((world.time - 55) / 70)
    if (slot > world.bossSlot && slot < BOSS_HP.length) {
      world.bossSlot = slot
      spawnEnemyNearPlayer(world, 'boss', {
        nameKey: BOSS_KEYS[slot],
        hp: BOSS_HP[slot],
        xp: 28 + slot * 12,
      })
    } else if (slot > world.bossSlot && slot >= BOSS_HP.length) {
      // later bosses keep scaling
      world.bossSlot = slot
      const hp = 1100 + (slot - 4) * 250
      spawnEnemyNearPlayer(world, 'boss', {
        nameKey: BOSS_KEYS[Math.min(slot, BOSS_KEYS.length - 1)],
        hp,
        xp: 60 + slot * 8,
      })
    }
  }

  // recruit spots: second at ~90s, third at ~180s if room
  if (world.recruitSpawned < 2 && world.time > 90) spawnRecruitSpot(world)
  if (world.recruitSpawned < 3 && world.time > 180) spawnRecruitSpot(world)

  // chests every ~55s
  world.chestSpawnAcc += dt
  if (world.chestSpawnAcc >= 55 && world.chests.filter((c) => !c.opened).length < 2) {
    world.chestSpawnAcc = 0
    spawnChest(world)
  }

  // chest countdown
  for (const c of world.chests) {
    if (c.opened) continue
    if (c.countdown > 0) c.countdown -= dt
  }

  // recruit on approach
  for (let i = world.recruitSpots.length - 1; i >= 0; i--) {
    const s = world.recruitSpots[i]!
    if (world.allies.length >= MAX_ALLIES) break
    if (len(s.x - p.x, s.y - p.y) < s.r + p.r) {
      const ally: Ally = {
        id: nextId(world),
        x: s.x,
        y: s.y,
        r: 11,
        fireTimer: 0.3,
        damage: Math.max(3, Math.floor(world.weapon.damage * 0.45)),
        cooldown: 0.85,
        projectileSpeed: 260,
      }
      world.allies.push(ally)
      world.recruitSpots.splice(i, 1)
    }
  }

  // open ready chest
  for (const c of world.chests) {
    if (c.opened || c.countdown > 0) continue
    if (len(c.x - p.x, c.y - p.y) < 28 + p.r) {
      c.opened = true
      // 55% weapon upgrade, 45% gold
      if (Math.random() < 0.55) {
        const pool = [...UPGRADE_POOL]
        const pick = pool[Math.floor(Math.random() * pool.length)]!
        world.chestReward = { kind: 'upgrade', upgradeId: pick.id }
      } else {
        world.chestReward = { kind: 'gold', gold: 12 + Math.floor(Math.random() * 18) }
      }
      setState(world, 'chest')
      return
    }
  }

  tryFire(world)

  // allies follow + shoot
  for (const a of world.allies) {
    if (a.fireTimer > 0) a.fireTimer -= dt
    // soft follow player
    const dx = p.x - a.x
    const dy = p.y - a.y
    const d = len(dx, dy)
    if (d > 48) {
      const nrm = norm(dx, dy)
      const follow = Math.min(p.moveSpeed * 0.95, 40 + d)
      a.x += nrm.x * follow * dt
      a.y += nrm.y * follow * dt
    }
    // keep damage weakly scaled to player weapon
    a.damage = Math.max(3, Math.floor(world.weapon.damage * 0.45))
    allyFire(world, a)
  }

  // projectiles
  for (let i = world.projectiles.length - 1; i >= 0; i--) {
    const pr = world.projectiles[i]!
    pr.x += pr.vx * dt
    pr.y += pr.vy * dt
    pr.life -= dt
    if (pr.life <= 0 || pr.x < 0 || pr.y < 0 || pr.x > WORLD_W || pr.y > WORLD_H) {
      world.projectiles.splice(i, 1)
      continue
    }
    for (let j = world.enemies.length - 1; j >= 0; j--) {
      const e = world.enemies[j]!
      const d = len(pr.x - e.x, pr.y - e.y)
      if (d < pr.r + e.r) {
        e.hp -= pr.dmg
        world.projectiles.splice(i, 1)
        if (e.hp <= 0) killEnemy(world, j)
        break
      }
    }
  }

  // enemies chase + contact damage
  for (const e of world.enemies) {
    const d = norm(p.x - e.x, p.y - e.y)
    e.x += d.x * e.speed * dt
    e.y += d.y * e.speed * dt
    if (p.invuln <= 0 && len(e.x - p.x, e.y - p.y) < e.r + p.r) {
      p.hp -= e.contactDmg
      p.invuln = 0.6
      p.x -= d.x * 28
      p.y -= d.y * 28
      if (p.hp <= 0) {
        p.hp = 0
        setState(world, 'dead')
        return
      }
    }
  }

  // gems magnet + pickup
  for (let i = world.gems.length - 1; i >= 0; i--) {
    const g = world.gems[i]!
    const dx = p.x - g.x
    const dy = p.y - g.y
    const dist = len(dx, dy)
    if (dist < world.magnet) {
      const pull = norm(dx, dy)
      const force = 220 + (1 - dist / world.magnet) * 280
      g.vx = pull.x * force
      g.vy = pull.y * force
    } else {
      g.vx *= 0.9
      g.vy *= 0.9
    }
    g.x += g.vx * dt
    g.y += g.vy * dt
    if (dist < p.r + g.r + 4) {
      const leveled = gainXp(world, g.value)
      world.gems.splice(i, 1)
      if (leveled) return
    }
  }
}

/** Test helpers */
export function __testSpawnBoss(world: World, slot = 0): Enemy {
  return spawnEnemyAt(world, 'boss', world.player.x + 80, world.player.y, {
    nameKey: BOSS_KEYS[Math.min(slot, BOSS_KEYS.length - 1)],
    hp: BOSS_HP[Math.min(slot, BOSS_HP.length - 1)],
    xp: 40,
  })
}

export function __testSpawnRecruit(world: World): void {
  spawnRecruitSpot(world, world.player.x + 20, world.player.y)
}

export function __testSpawnReadyChest(world: World): void {
  spawnChest(world, world.player.x + 20, world.player.y, 0)
}
