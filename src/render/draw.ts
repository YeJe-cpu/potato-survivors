import type { Lang } from '../i18n.ts'
import { t, type I18nKey } from '../i18n.ts'
import type { InputState } from '../input.ts'
import type { Difficulty, UpgradeDef, UpgradeId, World } from '../sim/types.ts'
import { UPGRADE_POOL } from '../sim/upgrades.ts'
import { WORLD_H, WORLD_W } from '../sim/world.ts'

export interface Layout {
  cardRects: { x: number; y: number; w: number; h: number }[]
  startRect: { x: number; y: number; w: number; h: number } | null
  restartRect: { x: number; y: number; w: number; h: number } | null
  continueRect: { x: number; y: number; w: number; h: number } | null
  chestContinueRect: { x: number; y: number; w: number; h: number } | null
  rerollRect: { x: number; y: number; w: number; h: number } | null
  skipRect: { x: number; y: number; w: number; h: number } | null
  diffRects: { id: Difficulty; x: number; y: number; w: number; h: number }[]
}

function emptyLayout(): Layout {
  return {
    cardRects: [],
    startRect: null,
    restartRect: null,
    continueRect: null,
    chestContinueRect: null,
    rerollRect: null,
    skipRect: null,
    diffRects: [],
  }
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function upgradeLabel(id: UpgradeId, lang: Lang): string {
  const def = UPGRADE_POOL.find((u) => u.id === id)
  return def ? t(def.i18n, lang) : id
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  world: World,
  lang: Lang,
  input: InputState,
  viewW: number,
  viewH: number,
): Layout {
  const layout = emptyLayout()
  const camX = world.player.x - viewW / 2
  const camY = world.player.y - viewH / 2

  ctx.fillStyle = '#1a1c22'
  ctx.fillRect(0, 0, viewW, viewH)

  ctx.save()
  ctx.translate(-camX, -camY)
  ctx.strokeStyle = '#2a2d36'
  ctx.lineWidth = 1
  const grid = 64
  const x0 = Math.floor(camX / grid) * grid
  const y0 = Math.floor(camY / grid) * grid
  for (let x = x0; x < camX + viewW + grid; x += grid) {
    ctx.beginPath()
    ctx.moveTo(x, camY)
    ctx.lineTo(x, camY + viewH)
    ctx.stroke()
  }
  for (let y = y0; y < camY + viewH + grid; y += grid) {
    ctx.beginPath()
    ctx.moveTo(camX, y)
    ctx.lineTo(camX + viewW, y)
    ctx.stroke()
  }
  ctx.strokeStyle = '#4a5568'
  ctx.lineWidth = 4
  ctx.strokeRect(0, 0, WORLD_W, WORLD_H)

  // recruit spots (dashed rings)
  for (const s of world.recruitSpots) {
    ctx.setLineDash([6, 6])
    ctx.strokeStyle = '#90e0ef'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#90e0ef'
    ctx.font = '11px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(t('recruit', lang), s.x, s.y - s.r - 6)
    // dog silhouette hint
    ctx.fillStyle = '#8d99ae'
    ctx.beginPath()
    ctx.ellipse(s.x, s.y, 10, 8, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // chests
  for (const c of world.chests) {
    if (c.opened) continue
    ctx.fillStyle = c.countdown > 0 ? '#6c584c' : '#e9c46a'
    roundRect(ctx, c.x - 14, c.y - 12, 28, 24, 4)
    ctx.fill()
    ctx.strokeStyle = '#3d2b1f'
    ctx.lineWidth = 2
    roundRect(ctx, c.x - 14, c.y - 12, 28, 24, 4)
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    if (c.countdown > 0) {
      ctx.fillText(String(Math.ceil(c.countdown)), c.x, c.y + 4)
    } else {
      ctx.fillText('!', c.x, c.y + 4)
    }
  }

  // gems
  for (const g of world.gems) {
    ctx.fillStyle = g.value >= 20 ? '#ffd166' : '#48cae4'
    ctx.beginPath()
    ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // projectiles
  for (const pr of world.projectiles) {
    ctx.fillStyle = pr.fromAlly ? '#adb5bd' : '#c4a35a'
    ctx.beginPath()
    ctx.ellipse(pr.x, pr.y, pr.r * 1.4, pr.r * 0.8, Math.atan2(pr.vy, pr.vx), 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = pr.fromAlly ? '#495057' : '#6b4226'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // enemies
  for (const e of world.enemies) {
    if (e.kind === 'tank') {
      ctx.fillStyle = e.tint
      roundRect(ctx, e.x - e.r, e.y - e.r * 0.85, e.r * 2, e.r * 1.7, 4)
      ctx.fill()
    } else if (e.kind === 'biter') {
      ctx.fillStyle = e.tint
      ctx.beginPath()
      ctx.moveTo(e.x, e.y - e.r)
      ctx.lineTo(e.x + e.r, e.y + e.r * 0.7)
      ctx.lineTo(e.x - e.r, e.y + e.r * 0.7)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.fillStyle = e.tint
      ctx.beginPath()
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#ffedd8'
    ctx.beginPath()
    ctx.arc(e.x - e.r * 0.3, e.y - e.r * 0.2, Math.max(2, e.r * 0.22), 0, Math.PI * 2)
    ctx.arc(e.x + e.r * 0.3, e.y - e.r * 0.2, Math.max(2, e.r * 0.22), 0, Math.PI * 2)
    ctx.fill()
    if (e.kind === 'boss') {
      ctx.strokeStyle = '#ffba08'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(e.x, e.y, e.r + 4, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // allies (狗狗)
  for (const a of world.allies) {
    ctx.fillStyle = '#8d99ae'
    ctx.beginPath()
    ctx.ellipse(a.x, a.y, a.r * 1.2, a.r, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#212529'
    ctx.beginPath()
    ctx.arc(a.x - 3, a.y - 2, 1.5, 0, Math.PI * 2)
    ctx.arc(a.x + 3, a.y - 2, 1.5, 0, Math.PI * 2)
    ctx.fill()
    // ear
    ctx.fillStyle = '#6c757d'
    ctx.beginPath()
    ctx.ellipse(a.x - 8, a.y - 6, 3, 5, -0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // player
  const p = world.player
  const blink = p.invuln > 0 && Math.floor(p.invuln * 20) % 2 === 0
  if (!blink) {
    ctx.fillStyle = '#d4a373'
    ctx.beginPath()
    ctx.ellipse(p.x, p.y, p.r * 1.1, p.r, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#3d2b1f'
    ctx.beginPath()
    ctx.arc(p.x - 4, p.y - 2, 2, 0, Math.PI * 2)
    ctx.arc(p.x + 4, p.y - 2, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#588157'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(p.x, p.y - p.r)
    ctx.quadraticCurveTo(p.x + 6, p.y - p.r - 10, p.x + 2, p.y - p.r - 14)
    ctx.stroke()
  }
  if (p.dashTimer > 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()

  if (world.state !== 'menu') {
    drawHud(ctx, world, lang, viewW, viewH)
  }

  if (world.state === 'menu') {
    Object.assign(layout, drawMenu(ctx, world, lang, viewW, viewH))
  } else if (world.state === 'levelup') {
    Object.assign(layout, drawLevelUp(ctx, world, lang, viewW, viewH))
  } else if (world.state === 'chest') {
    layout.chestContinueRect = drawChest(ctx, world, lang, viewW, viewH)
  } else if (world.state === 'paused') {
    drawPaused(ctx, lang, viewW, viewH)
  } else if (world.state === 'dead' || world.state === 'win') {
    Object.assign(layout, drawEnd(ctx, world, lang, viewW, viewH))
  }

  if (input.joyActive && (world.state === 'playing' || world.state === 'paused')) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath()
    ctx.arc(input.joyOriginX, input.joyOriginY, 48, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.beginPath()
    ctx.arc(
      input.joyOriginX + input.joyX * 48,
      input.joyOriginY + input.joyY * 48,
      18,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }

  return layout
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  world: World,
  lang: Lang,
  viewW: number,
  _viewH: number,
): void {
  const p = world.player
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f8f9fa'
  ctx.font = 'bold 18px system-ui, sans-serif'
  ctx.fillText(formatTime(world.time), viewW / 2, 24)

  // boss bar (first boss on field)
  const boss = world.enemies.find((e) => e.kind === 'boss')
  if (boss) {
    const barW = Math.min(280, viewW * 0.7)
    const barX = (viewW - barW) / 2
    const barY = 48
    const name = boss.nameKey ? t(boss.nameKey as I18nKey, lang) : 'Boss'
    ctx.fillStyle = '#ffba08'
    ctx.font = 'bold 12px system-ui, sans-serif'
    ctx.fillText(name, viewW / 2, barY - 4)
    ctx.fillStyle = '#2b2d34'
    roundRect(ctx, barX, barY, barW, 8, 3)
    ctx.fill()
    const ratio = boss.maxHp > 0 ? Math.max(0, boss.hp / boss.maxHp) : 0
    ctx.fillStyle = '#e63946'
    roundRect(ctx, barX, barY, barW * ratio, 8, 3)
    ctx.fill()
  }

  const barW = Math.min(200, viewW * 0.5)
  const barX = (viewW - barW) / 2
  const barY = boss ? 62 : 34
  ctx.fillStyle = '#2b2d34'
  roundRect(ctx, barX, barY, barW, 10, 4)
  ctx.fill()
  const ratio = p.maxHp > 0 ? p.hp / p.maxHp : 0
  ctx.fillStyle = ratio > 0.3 ? '#52b788' : '#e63946'
  roundRect(ctx, barX, barY, barW * ratio, 10, 4)
  ctx.fill()

  ctx.textAlign = 'left'
  ctx.font = '12px system-ui, sans-serif'
  ctx.fillStyle = '#ced4da'
  ctx.fillText(`${t('lv', lang)} ${p.level}`, 10, 20)
  ctx.fillText(`${t('gold', lang)} ${world.gold}`, 10, 48)
  if (world.allies.length > 0) {
    ctx.fillText(`${t('dog', lang)} ${world.allies.length}/${3}`, 10, 64)
  }

  const xpW = Math.min(120, viewW * 0.3)
  ctx.fillStyle = '#2b2d34'
  ctx.fillRect(10, 28, xpW, 5)
  ctx.fillStyle = '#4cc9f0'
  ctx.fillRect(10, 28, xpW * (p.xp / p.xpToNext), 5)

  ctx.textAlign = 'right'
  ctx.fillStyle = p.dashCd <= 0 ? '#95d5b2' : '#6c757d'
  ctx.fillText(p.dashCd <= 0 ? 'DASH' : `DASH ${p.dashCd.toFixed(1)}`, viewW - 10, 20)
}

function drawMenu(
  ctx: CanvasRenderingContext2D,
  world: World,
  lang: Lang,
  viewW: number,
  viewH: number,
): Pick<Layout, 'startRect' | 'diffRects'> {
  ctx.fillStyle = 'rgba(10,12,16,0.72)'
  ctx.fillRect(0, 0, viewW, viewH)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f4a261'
  ctx.font = `bold ${Math.min(36, viewW * 0.09)}px system-ui, sans-serif`
  ctx.fillText(t('title', lang), viewW / 2, viewH * 0.22)
  ctx.fillStyle = '#adb5bd'
  ctx.font = `${Math.min(14, viewW * 0.035)}px system-ui, sans-serif`
  ctx.fillText(t('subtitle', lang), viewW / 2, viewH * 0.22 + 26)
  ctx.fillText(t('hintMove', lang), viewW / 2, viewH * 0.38)
  ctx.fillText(t('hintDash', lang), viewW / 2, viewH * 0.38 + 16)
  ctx.fillText(t('hintTouch', lang), viewW / 2, viewH * 0.38 + 32)
  ctx.fillText(t('hintRecruit', lang), viewW / 2, viewH * 0.38 + 48)

  ctx.fillStyle = '#ced4da'
  ctx.font = '12px system-ui, sans-serif'
  ctx.fillText(t('difficulty', lang), viewW / 2, viewH * 0.58)

  const diffs: Difficulty[] = ['easy', 'normal', 'hard']
  const labels = [t('diffEasy', lang), t('diffNormal', lang), t('diffHard', lang)]
  const bw = Math.min(90, viewW * 0.28)
  const bh = 32
  const gap = 8
  const total = diffs.length * bw + (diffs.length - 1) * gap
  const startX = (viewW - total) / 2
  const by = viewH * 0.58 + 12
  const diffRects: Layout['diffRects'] = []
  diffs.forEach((id, i) => {
    const x = startX + i * (bw + gap)
    const selected = world.difficulty === id
    ctx.fillStyle = selected ? '#e76f51' : '#343a40'
    roundRect(ctx, x, by, bw, bh, 8)
    ctx.fill()
    if (selected) {
      ctx.strokeStyle = '#ffd166'
      ctx.lineWidth = 2
      roundRect(ctx, x, by, bw, bh, 8)
      ctx.stroke()
    }
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.fillText(labels[i]!, x + bw / 2, by + 21)
    diffRects.push({ id, x, y: by, w: bw, h: bh })
  })

  const sbw = Math.min(180, viewW * 0.5)
  const sbh = 44
  const sbx = (viewW - sbw) / 2
  const sby = viewH * 0.78
  ctx.fillStyle = '#e76f51'
  roundRect(ctx, sbx, sby, sbw, sbh, 10)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 18px system-ui, sans-serif'
  ctx.fillText(t('start', lang), viewW / 2, sby + 28)
  return { startRect: { x: sbx, y: sby, w: sbw, h: sbh }, diffRects }
}

function drawLevelUp(
  ctx: CanvasRenderingContext2D,
  world: World,
  lang: Lang,
  viewW: number,
  viewH: number,
): Pick<Layout, 'cardRects' | 'rerollRect' | 'skipRect'> {
  const choices = world.upgradeChoices
  ctx.fillStyle = 'rgba(10,12,16,0.55)'
  ctx.fillRect(0, 0, viewW, viewH)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffe8a3'
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillText(t('levelUp', lang), viewW / 2, viewH * 0.18)
  ctx.fillStyle = '#adb5bd'
  ctx.font = '12px system-ui, sans-serif'
  ctx.fillText(t('pickHint', lang), viewW / 2, viewH * 0.18 + 20)

  const n = choices.length
  const gap = 10
  const cardW = Math.min(120, (viewW - gap * (n + 1)) / Math.max(1, n))
  const cardH = Math.min(140, viewH * 0.34)
  const totalW = n * cardW + (n - 1) * gap
  const startX = (viewW - totalW) / 2
  const y = viewH * 0.32
  const rects: { x: number; y: number; w: number; h: number }[] = []

  choices.forEach((c, i) => {
    const x = startX + i * (cardW + gap)
    ctx.fillStyle = '#212529'
    roundRect(ctx, x, y, cardW, cardH, 10)
    ctx.fill()
    ctx.strokeStyle = c.color
    ctx.lineWidth = 3
    roundRect(ctx, x, y, cardW, cardH, 10)
    ctx.stroke()

    ctx.fillStyle = c.color
    ctx.beginPath()
    ctx.arc(x + cardW / 2, y + 36, 16, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#f8f9fa'
    ctx.font = 'bold 13px system-ui, sans-serif'
    wrapText(ctx, t(c.i18n, lang), x + cardW / 2, y + 70, cardW - 12, 16)

    ctx.fillStyle = '#868e96'
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText(String(i + 1), x + cardW / 2, y + cardH - 14)
    rects.push({ x, y, w: cardW, h: cardH })
  })

  let rerollRect: Layout['rerollRect'] = null
  let skipRect: Layout['skipRect'] = null
  const btnY = y + cardH + 16
  const btnW = Math.min(100, viewW * 0.28)
  const btnH = 30
  const pairGap = 12
  const pairW = btnW * 2 + pairGap
  const bx0 = (viewW - pairW) / 2

  // Reroll
  ctx.fillStyle = world.rerolls > 0 ? '#457b9d' : '#343a40'
  roundRect(ctx, bx0, btnY, btnW, btnH, 8)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '12px system-ui, sans-serif'
  ctx.fillText(`${t('reroll', lang)} (${world.rerolls})`, bx0 + btnW / 2, btnY + 20)
  rerollRect = { x: bx0, y: btnY, w: btnW, h: btnH }

  // Skip
  ctx.fillStyle = world.skips > 0 ? '#6c757d' : '#343a40'
  roundRect(ctx, bx0 + btnW + pairGap, btnY, btnW, btnH, 8)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.fillText(`${t('skip', lang)} (${world.skips})`, bx0 + btnW + pairGap + btnW / 2, btnY + 20)
  skipRect = { x: bx0 + btnW + pairGap, y: btnY, w: btnW, h: btnH }

  return { cardRects: rects, rerollRect, skipRect }
}

function drawChest(
  ctx: CanvasRenderingContext2D,
  world: World,
  lang: Lang,
  viewW: number,
  viewH: number,
): { x: number; y: number; w: number; h: number } {
  ctx.fillStyle = 'rgba(10,12,16,0.6)'
  ctx.fillRect(0, 0, viewW, viewH)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffd166'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText(t('chestTitle', lang), viewW / 2, viewH * 0.32)
  ctx.fillStyle = '#f8f9fa'
  ctx.font = '16px system-ui, sans-serif'
  const reward = world.chestReward
  if (reward?.kind === 'upgrade' && reward.upgradeId) {
    ctx.fillText(`${t('chestUpgrade', lang)}: ${upgradeLabel(reward.upgradeId, lang)}`, viewW / 2, viewH * 0.42)
  } else {
    ctx.fillText(`${t('chestGold', lang)} +${reward?.gold ?? 0}`, viewW / 2, viewH * 0.42)
  }

  const bw = Math.min(160, viewW * 0.45)
  const bh = 40
  const bx = (viewW - bw) / 2
  const by = viewH * 0.55
  ctx.fillStyle = '#e9c46a'
  roundRect(ctx, bx, by, bw, bh, 10)
  ctx.fill()
  ctx.fillStyle = '#212529'
  ctx.font = 'bold 16px system-ui, sans-serif'
  ctx.fillText(t('chestContinue', lang), viewW / 2, by + 26)
  return { x: bx, y: by, w: bw, h: bh }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
): void {
  if (ctx.measureText(text).width <= maxW) {
    ctx.fillText(text, x, y)
    return
  }
  const mid = Math.ceil(text.length / 2)
  ctx.fillText(text.slice(0, mid), x, y)
  ctx.fillText(text.slice(mid), x, y + lineH)
}

function drawPaused(ctx: CanvasRenderingContext2D, lang: Lang, viewW: number, viewH: number): void {
  ctx.fillStyle = 'rgba(10,12,16,0.55)'
  ctx.fillRect(0, 0, viewW, viewH)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText(t('pause', lang), viewW / 2, viewH / 2 - 10)
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillStyle = '#adb5bd'
  ctx.fillText(t('resume', lang), viewW / 2, viewH / 2 + 20)
}

function drawEnd(
  ctx: CanvasRenderingContext2D,
  world: World,
  lang: Lang,
  viewW: number,
  viewH: number,
): Pick<Layout, 'restartRect' | 'continueRect'> {
  ctx.fillStyle = 'rgba(10,12,16,0.75)'
  ctx.fillRect(0, 0, viewW, viewH)
  ctx.textAlign = 'center'
  ctx.fillStyle = world.state === 'win' ? '#95d5b2' : '#e63946'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText(world.state === 'win' ? t('win', lang) : t('dead', lang), viewW / 2, viewH * 0.32)
  ctx.fillStyle = '#ced4da'
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText(
    `${formatTime(world.time)} · ${t('lv', lang)} ${world.player.level} · ${world.killCount} · ${t('gold', lang)} ${world.gold}`,
    viewW / 2,
    viewH * 0.32 + 28,
  )

  const bw = Math.min(160, viewW * 0.42)
  const bh = 40
  let continueRect: Layout['continueRect'] = null
  let restartY = viewH * 0.55

  if (world.state === 'win') {
    const cx = (viewW - bw) / 2
    const cy = viewH * 0.48
    ctx.fillStyle = '#52b788'
    roundRect(ctx, cx, cy, bw, bh, 10)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.fillText(t('winContinue', lang), viewW / 2, cy + 26)
    continueRect = { x: cx, y: cy, w: bw, h: bh }
    restartY = viewH * 0.62
  }

  const bx = (viewW - bw) / 2
  ctx.fillStyle = '#457b9d'
  roundRect(ctx, bx, restartY, bw, bh, 10)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 15px system-ui, sans-serif'
  ctx.fillText(t('restart', lang), viewW / 2, restartY + 26)
  return { restartRect: { x: bx, y: restartY, w: bw, h: bh }, continueRect }
}

export function hitTest(
  rect: { x: number; y: number; w: number; h: number } | null | undefined,
  x: number,
  y: number,
): boolean {
  if (!rect) return false
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
}

// silence unused UpgradeDef import warning path for tsc — used via choices typing in callers
export type { UpgradeDef }
