import './style.css'
import { detectLang, type Lang } from './i18n.ts'
import {
  bindInput,
  consumeFlags,
  createInput,
  sampleMove,
  type InputState,
} from './input.ts'
import { drawFrame, hitTest, type Layout } from './render/draw.ts'
import {
  chooseUpgrade,
  continueAfterWin,
  createWorld,
  dismissChest,
  FIXED_DT,
  rerollUpgrades,
  setDifficulty,
  skipUpgrade,
  startRun,
  step,
  togglePause,
} from './sim/world.ts'
import type { Difficulty, World } from './sim/types.ts'

const canvas = document.querySelector<HTMLCanvasElement>('#game')!
const ctx = canvas.getContext('2d')!

const lang: Lang = detectLang()
document.documentElement.lang = lang

const world: World = createWorld()
const input: InputState = createInput()
bindInput(canvas, input)

let layout: Layout = {
  cardRects: [],
  startRect: null,
  restartRect: null,
  continueRect: null,
  chestContinueRect: null,
  rerollRect: null,
  skipRect: null,
  diffRects: [],
}
let acc = 0
let last = performance.now()

function resize(): void {
  const css = Math.min(window.innerWidth, window.innerHeight)
  const size = Math.max(240, Math.min(720, Math.floor(css)))
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size
    canvas.height = size
  }
}

function handleUiClicks(flags: ReturnType<typeof consumeFlags>): void {
  if (flags.pick !== null && world.state === 'levelup') {
    chooseUpgrade(world, flags.pick)
  }
  if (flags.pause) togglePause(world)
  if (flags.reroll) rerollUpgrades(world)
  if (flags.skip) skipUpgrade(world)

  if (flags.clickX !== null && flags.clickY !== null) {
    const x = flags.clickX
    const y = flags.clickY
    if (world.state === 'menu') {
      for (const d of layout.diffRects) {
        if (hitTest(d, x, y)) {
          setDifficulty(world, d.id)
          return
        }
      }
      if (hitTest(layout.startRect, x, y)) {
        startRun(world)
      }
    } else if (world.state === 'dead' && hitTest(layout.restartRect, x, y)) {
      startRun(world)
    } else if (world.state === 'win') {
      if (hitTest(layout.continueRect, x, y)) continueAfterWin(world)
      else if (hitTest(layout.restartRect, x, y)) startRun(world)
    } else if (world.state === 'levelup') {
      layout.cardRects.forEach((r, i) => {
        if (hitTest(r, x, y)) chooseUpgrade(world, i)
      })
      if (hitTest(layout.rerollRect, x, y)) rerollUpgrades(world)
      if (hitTest(layout.skipRect, x, y)) skipUpgrade(world)
    } else if (world.state === 'chest' && hitTest(layout.chestContinueRect, x, y)) {
      dismissChest(world)
    }
  }
}

function frame(now: number): void {
  resize()
  const rawDt = Math.min(0.05, (now - last) / 1000)
  last = now

  const flags = consumeFlags(input)
  handleUiClicks(flags)

  if (world.state === 'menu' && (flags.dash || input.keys.has('Enter'))) {
    startRun(world)
  }
  if (world.state === 'dead' && (flags.dash || input.keys.has('Enter'))) {
    startRun(world)
  }
  if (world.state === 'win' && input.keys.has('Enter')) {
    continueAfterWin(world)
  }
  if (world.state === 'chest' && (flags.dash || input.keys.has('Enter'))) {
    dismissChest(world)
  }

  if (world.state === 'playing') {
    acc += rawDt
    const move = sampleMove(input)
    while (acc >= FIXED_DT) {
      step(world, { moveX: move.x, moveY: move.y, dash: flags.dash }, FIXED_DT)
      flags.dash = false
      acc -= FIXED_DT
      if (world.state !== 'playing') break
    }
  } else {
    acc = 0
  }

  layout = drawFrame(ctx, world, lang, input, canvas.width, canvas.height)
  requestAnimationFrame(frame)
}

resize()
requestAnimationFrame(frame)

;(window as unknown as {
  __potato?: {
    world: World
    startRun: typeof startRun
    step: typeof step
    setDifficulty: (d: Difficulty) => void
  }
}).__potato = {
  world,
  startRun,
  step,
  setDifficulty: (d) => setDifficulty(world, d),
}
