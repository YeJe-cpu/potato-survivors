export type GameState = 'menu' | 'playing' | 'levelup' | 'chest' | 'paused' | 'win' | 'dead'
export type Difficulty = 'easy' | 'normal' | 'hard'
export type EnemyKind = 'crawler' | 'biter' | 'tank' | 'boss'

export interface Vec2 {
  x: number
  y: number
}

export interface Player {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hp: number
  maxHp: number
  level: number
  xp: number
  xpToNext: number
  moveSpeed: number
  dashCd: number
  dashTimer: number
  facingX: number
  facingY: number
  invuln: number
}

export interface Enemy {
  id: number
  x: number
  y: number
  r: number
  hp: number
  maxHp: number
  speed: number
  xp: number
  kind: EnemyKind
  tint: string
  nameKey?: BossNameKey
  contactDmg: number
}

export type BossNameKey = 'boss1' | 'boss2' | 'boss3' | 'boss4' | 'boss5'

export interface Projectile {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  dmg: number
  life: number
  fromAlly?: boolean
}

export interface XpGem {
  id: number
  x: number
  y: number
  r: number
  value: number
  vx: number
  vy: number
}

export interface Ally {
  id: number
  x: number
  y: number
  r: number
  fireTimer: number
  damage: number
  cooldown: number
  projectileSpeed: number
}

export interface RecruitSpot {
  id: number
  x: number
  y: number
  r: number
}

export interface Chest {
  id: number
  x: number
  y: number
  countdown: number
  opened: boolean
}

export type ChestRewardKind = 'upgrade' | 'gold'

export interface ChestReward {
  kind: ChestRewardKind
  gold?: number
  upgradeId?: UpgradeId
}

export type UpgradeId = 'damage' | 'amount' | 'moveSpeed' | 'fireRate' | 'maxHp' | 'magnet'

export interface UpgradeDef {
  id: UpgradeId
  i18n: 'dmg' | 'amount' | 'moveSpeed' | 'fireRate' | 'maxHp' | 'magnet'
  color: string
}

export interface WeaponStats {
  damage: number
  amount: number
  cooldown: number
  timer: number
  projectileSpeed: number
  projectileLife: number
}

export interface World {
  state: GameState
  prevState: GameState
  time: number
  winTime: number
  wonOnce: boolean
  difficulty: Difficulty
  player: Player
  enemies: Enemy[]
  projectiles: Projectile[]
  gems: XpGem[]
  allies: Ally[]
  recruitSpots: RecruitSpot[]
  chests: Chest[]
  weapon: WeaponStats
  magnet: number
  gold: number
  nextId: number
  spawnAcc: number
  upgradeChoices: UpgradeDef[]
  seed: number
  killCount: number
  bossSlot: number
  recruitSpawned: number
  chestSpawnAcc: number
  rerolls: number
  skips: number
  chestReward: ChestReward | null
  pendingLevelUnlock: boolean
}
