export type Lang = 'zh' | 'en'

const dict = {
  title: { zh: '薯仔幸存者', en: 'Potato Survivors' },
  subtitle: { zh: '土豆皮自动开火 · 狗狗助阵 · 活下去', en: 'Auto potato-skin · Dogs · Survive' },
  start: { zh: '开始', en: 'Start' },
  pause: { zh: '暂停', en: 'Paused' },
  resume: { zh: '继续 (P)', en: 'Resume (P)' },
  levelUp: { zh: '升级！选一张', en: 'Level up! Pick one' },
  dead: { zh: '阵亡了', en: 'You died' },
  win: { zh: '存活成功！', en: 'You survived!' },
  winContinue: { zh: '继续浪', en: 'Keep going' },
  restart: { zh: '再来一局', en: 'Play again' },
  hp: { zh: '血量', en: 'HP' },
  lv: { zh: '等级', en: 'LV' },
  gold: { zh: '金币', en: 'Gold' },
  hintMove: { zh: 'WASD / 方向键移动', en: 'WASD / arrows to move' },
  hintDash: { zh: '空格冲刺', en: 'Space to dash' },
  hintTouch: { zh: '按住屏幕虚拟摇杆', en: 'Hold screen for joystick' },
  hintPause: { zh: 'P 暂停', en: 'P to pause' },
  hintRecruit: { zh: '靠近虚线圈招募狗狗', en: 'Walk into dashed ring to recruit' },
  dmg: { zh: '伤害 +', en: 'Damage +' },
  amount: { zh: '弹数 +', en: 'Projectiles +' },
  moveSpeed: { zh: '移速 +', en: 'Move speed +' },
  fireRate: { zh: '射速 +', en: 'Fire rate +' },
  maxHp: { zh: '最大生命 +', en: 'Max HP +' },
  magnet: { zh: '吸铁范围 +', en: 'Magnet +' },
  pickHint: { zh: '按 1 / 2 / 3 或点击', en: 'Press 1 / 2 / 3 or tap' },
  reroll: { zh: '刷新', en: 'Reroll' },
  skip: { zh: '跳过', en: 'Skip' },
  chestTitle: { zh: '宝箱！', en: 'Chest!' },
  chestUpgrade: { zh: '获得升级', en: 'Weapon upgrade' },
  chestGold: { zh: '获得金币', en: 'Gold reward' },
  chestContinue: { zh: '继续', en: 'Continue' },
  diffEasy: { zh: '简单', en: 'Easy' },
  diffNormal: { zh: '普通', en: 'Normal' },
  diffHard: { zh: '困难', en: 'Hard' },
  difficulty: { zh: '难度', en: 'Difficulty' },
  dog: { zh: '狗狗', en: 'Doggo' },
  recruit: { zh: '招募', en: 'Recruit' },
  boss1: { zh: '尖刺虫', en: 'Spike Bug' },
  boss2: { zh: '厚壳虫', en: 'Shell Bug' },
  boss3: { zh: '潮汐王', en: 'Tide King' },
  boss4: { zh: '根须主', en: 'Root Lord' },
  boss5: { zh: '暗潮霸', en: 'Dark Tide' },
} as const

export type I18nKey = keyof typeof dict

export function detectLang(): Lang {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en'
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

export function t(key: I18nKey, lang: Lang): string {
  return dict[key][lang]
}
