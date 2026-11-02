export interface InputState {
  keys: Set<string>
  moveX: number
  moveY: number
  dashPressed: boolean
  pausePressed: boolean
  pickIndex: number | null
  rerollPressed: boolean
  skipPressed: boolean
  pointerDown: boolean
  pointerX: number
  pointerY: number
  joyActive: boolean
  joyOriginX: number
  joyOriginY: number
  joyX: number
  joyY: number
  clickX: number | null
  clickY: number | null
}

export function createInput(): InputState {
  return {
    keys: new Set(),
    moveX: 0,
    moveY: 0,
    dashPressed: false,
    pausePressed: false,
    pickIndex: null,
    rerollPressed: false,
    skipPressed: false,
    pointerDown: false,
    pointerX: 0,
    pointerY: 0,
    joyActive: false,
    joyOriginX: 0,
    joyOriginY: 0,
    joyX: 0,
    joyY: 0,
    clickX: null,
    clickY: null,
  }
}

function isTextKey(code: string): boolean {
  return (
    code.startsWith('Key') ||
    code.startsWith('Arrow') ||
    code === 'Space' ||
    code === 'Digit1' ||
    code === 'Digit2' ||
    code === 'Digit3' ||
    code === 'Enter'
  )
}

export function bindInput(canvas: HTMLCanvasElement, input: InputState): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    if (!isTextKey(e.code) && e.code !== 'KeyP' && e.code !== 'KeyR' && e.code !== 'KeyF') return
    e.preventDefault()
    input.keys.add(e.code)
    if (e.code === 'Space') input.dashPressed = true
    if (e.code === 'KeyP') input.pausePressed = true
    if (e.code === 'Digit1') input.pickIndex = 0
    if (e.code === 'Digit2') input.pickIndex = 1
    if (e.code === 'Digit3') input.pickIndex = 2
    if (e.code === 'KeyR') input.rerollPressed = true
    if (e.code === 'KeyF') input.skipPressed = true
  }
  const onKeyUp = (e: KeyboardEvent) => {
    input.keys.delete(e.code)
  }

  const toLocal = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * canvas.width
    const y = ((clientY - rect.top) / rect.height) * canvas.height
    return { x, y }
  }

  const onPointerDown = (e: PointerEvent) => {
    canvas.setPointerCapture(e.pointerId)
    const { x, y } = toLocal(e.clientX, e.clientY)
    input.pointerDown = true
    input.pointerX = x
    input.pointerY = y
    input.clickX = x
    input.clickY = y
    input.joyActive = true
    input.joyOriginX = x
    input.joyOriginY = y
    input.joyX = 0
    input.joyY = 0
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!input.pointerDown) return
    const { x, y } = toLocal(e.clientX, e.clientY)
    input.pointerX = x
    input.pointerY = y
    if (input.joyActive) {
      const dx = x - input.joyOriginX
      const dy = y - input.joyOriginY
      const max = 48
      const l = Math.hypot(dx, dy)
      const scale = l > max ? max / l : 1
      input.joyX = (dx * scale) / max
      input.joyY = (dy * scale) / max
    }
  }
  const onPointerUp = (e: PointerEvent) => {
    input.pointerDown = false
    input.joyActive = false
    input.joyX = 0
    input.joyY = 0
    try {
      canvas.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)

  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
  }
}

export function sampleMove(input: InputState): { x: number; y: number } {
  let x = 0
  let y = 0
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft')) x -= 1
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) x += 1
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp')) y -= 1
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown')) y += 1
  if (input.joyActive) {
    x += input.joyX
    y += input.joyY
  }
  const l = Math.hypot(x, y)
  if (l > 1) {
    x /= l
    y /= l
  }
  return { x, y }
}

export function consumeFlags(input: InputState): {
  dash: boolean
  pause: boolean
  pick: number | null
  reroll: boolean
  skip: boolean
  clickX: number | null
  clickY: number | null
} {
  const dash = input.dashPressed
  const pause = input.pausePressed
  const pick = input.pickIndex
  const reroll = input.rerollPressed
  const skip = input.skipPressed
  const clickX = input.clickX
  const clickY = input.clickY
  input.dashPressed = false
  input.pausePressed = false
  input.pickIndex = null
  input.rerollPressed = false
  input.skipPressed = false
  input.clickX = null
  input.clickY = null
  return { dash, pause, pick, reroll, skip, clickX, clickY }
}
