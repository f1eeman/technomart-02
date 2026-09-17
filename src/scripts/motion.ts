const QUERY = '(prefers-reduced-motion: reduce)'

export const OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'
export const OVERSHOOT = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
export const SHARP = 'cubic-bezier(0.4, 0, 0.2, 1)'

export const calm = (): boolean =>
  typeof matchMedia === 'function' && matchMedia(QUERY).matches

export function play(
  node: Element,
  frames: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | null {
  if (calm()) return null

  return node.animate(frames, { fill: 'none', ...options })
}

export function onEnter(
  nodes: Iterable<Element>,
  enter: (node: Element, index: number) => void,
  margin = '0px 0px -12% 0px',
): void {
  const list = Array.from(nodes)

  if (list.length === 0) return

  if (calm() || typeof IntersectionObserver !== 'function') {
    list.forEach(enter)

    return
  }

  const order = new Map(list.map((node, index) => [node, index]))

  const watcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        watcher.unobserve(entry.target)
        enter(entry.target, order.get(entry.target) ?? 0)
      }
    },
    { rootMargin: margin, threshold: 0 },
  )

  for (const node of list) watcher.observe(node)
}

export function mark(node: HTMLElement, name: string, value: string): void {
  if (calm()) return

  delete node.dataset[name]
  void node.offsetWidth
  node.dataset[name] = value

  const clear = (): void => {
    delete node.dataset[name]
    node.removeEventListener('animationend', clear)
    node.removeEventListener('animationcancel', clear)
  }

  node.addEventListener('animationend', clear)
  node.addEventListener('animationcancel', clear)
}

export interface Spot {
  x: number
  y: number
  width: number
  height: number
}

export const spotOf = (node: Element): Spot => {
  const box = node.getBoundingClientRect()

  return { x: box.left, y: box.top, width: box.width, height: box.height }
}

export const spotsOf = (nodes: Iterable<Element>): Map<Element, Spot> => {
  const spots = new Map<Element, Spot>()

  for (const node of nodes) spots.set(node, spotOf(node))

  return spots
}

export function flipFrom(
  before: Map<Element, Spot>,
  options: { duration: number; easing: string; delay?: number },
): void {
  if (calm()) return

  for (const [node, was] of before) {
    if (!node.isConnected) continue

    const now = spotOf(node)
    const shiftX = was.x - now.x
    const shiftY = was.y - now.y

    if (Math.abs(shiftX) < 1 && Math.abs(shiftY) < 1) continue

    play(
      node,
      [
        { transform: `translate(${String(shiftX)}px, ${String(shiftY)}px)` },
        { transform: 'none' },
      ],
      {
        duration: options.duration,
        easing: options.easing,
        delay: options.delay ?? 0,
        fill: 'backwards',
      },
    )
  }
}

const running = new WeakMap<Element, number>()

export function countUp(
  node: HTMLElement,
  to: number,
  render: (value: number) => string,
  duration: number,
  step = 1,
): void {
  const previous = running.get(node)

  if (previous !== undefined) cancelAnimationFrame(previous)

  const raw = Number.parseInt(node.dataset['countFrom'] ?? '', 10)
  const from = Number.isFinite(raw) ? raw : to

  if (calm() || from === to || duration <= 0) {
    node.textContent = render(to)
    node.dataset['countFrom'] = String(to)

    return
  }

  const began = performance.now()

  const frame = (now: number): void => {
    const share = Math.min((now - began) / duration, 1)
    const eased = 1 - (1 - share) ** 3
    const value = from + (to - from) * eased

    if (share < 1) {
      node.textContent = render(Math.round(value / step) * step)
      running.set(node, requestAnimationFrame(frame))

      return
    }

    node.textContent = render(to)
    node.dataset['countFrom'] = String(to)
    running.delete(node)
  }

  running.set(node, requestAnimationFrame(frame))
}
