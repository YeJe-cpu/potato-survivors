import type { UpgradeDef, UpgradeId, World } from './types.ts'

export const UPGRADE_POOL: UpgradeDef[] = [
  { id: 'damage', i18n: 'dmg', color: '#e85d04' },
  { id: 'amount', i18n: 'amount', color: '#f4a261' },
  { id: 'moveSpeed', i18n: 'moveSpeed', color: '#2a9d8f' },
  { id: 'fireRate', i18n: 'fireRate', color: '#e9c46a' },
  { id: 'maxHp', i18n: 'maxHp', color: '#e76f51' },
  { id: 'magnet', i18n: 'magnet', color: '#90e0ef' },
]

function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickUpgradeChoices(world: World, count = 3): UpgradeDef[] {
  const rand = mulberry32((world.seed + world.player.level * 9973 + Math.floor(world.time * 100)) >>> 0)
  const pool = [...UPGRADE_POOL]
  const out: UpgradeDef[] = []
  while (out.length < count && pool.length > 0) {
    const i = Math.floor(rand() * pool.length)
    out.push(pool.splice(i, 1)[0]!)
  }
  return out
}

export function applyUpgrade(world: World, id: UpgradeId): void {
  const p = world.player
  const w = world.weapon
  switch (id) {
    case 'damage':
      w.damage += 4
      break
    case 'amount':
      w.amount += 1
      break
    case 'moveSpeed':
      p.moveSpeed *= 1.12
      break
    case 'fireRate':
      w.cooldown = Math.max(0.12, w.cooldown * 0.85)
      break
    case 'maxHp':
      p.maxHp += 20
      p.hp = Math.min(p.maxHp, p.hp + 20)
      break
    case 'magnet':
      world.magnet *= 1.35
      break
  }
}
