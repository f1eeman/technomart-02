import { calm, OUT, play, type Spot } from '@/scripts/motion'

const GHOST = 220
const CURTAIN = 260
const CURTAIN_DELAY = 140
const PACK = 300
const PACK_SHIFT = 40
const EMPTY = 320
const EMPTY_SHIFT = 28

const HOOKS = [
  'id',
  'data-product',
  'data-cart-add',
  'data-cart-title',
  'data-compare-add',
  'data-fly-source',
]

const strip = (root: HTMLElement): void => {
  const all: HTMLElement[] = [
    root,
    ...Array.from(root.querySelectorAll<HTMLElement>('*')),
  ]

  for (const node of all) for (const hook of HOOKS) node.removeAttribute(hook)
}

export function ghostsOf(
  nodes: Iterable<HTMLElement>,
  before: Map<Element, Spot>,
  layer: HTMLElement,
): void {
  if (calm()) return

  const frame = layer.getBoundingClientRect()

  for (const node of nodes) {
    const was = before.get(node)

    if (was === undefined) continue

    const clone = node.cloneNode(true)

    if (!(clone instanceof HTMLElement)) continue

    strip(clone)
    clone.hidden = false
    clone.inert = true
    clone.setAttribute('aria-hidden', 'true')
    clone.style.cssText = [
      'position:absolute',
      `left:${String(was.x - frame.left)}px`,
      `top:${String(was.y - frame.top)}px`,
      `width:${String(was.width)}px`,
      `height:${String(was.height)}px`,
      'margin:0',
      'pointer-events:none',
    ].join(';')

    layer.append(clone)

    const away = (): void => {
      clone.remove()
    }

    const run = play(
      clone,
      [
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: 'translateY(14px) scale(0.96)' },
      ],
      { duration: GHOST, easing: 'ease-in', fill: 'forwards' },
    )

    if (run === null) {
      away()

      continue
    }

    run.finished.then(away, away)
  }
}

export function curtain(nodes: Iterable<Element>): void {
  for (const node of nodes)
    play(
      node,
      [
        { clipPath: 'inset(0 0 100% 0)', opacity: 0.4 },
        { clipPath: 'inset(0 0 0 0)', opacity: 1 },
      ],
      {
        duration: CURTAIN,
        easing: OUT,
        delay: CURTAIN_DELAY,
        fill: 'backwards',
      },
    )
}

export function shiftPack(list: Element, direction: number): void {
  play(
    list,
    [
      {
        transform: `translateX(${String(direction * PACK_SHIFT)}px)`,
        opacity: 0.25,
      },
      { transform: 'none', opacity: 1 },
    ],
    { duration: PACK, easing: OUT },
  )
}

export function slideIn(node: Element): void {
  play(
    node,
    [
      { transform: `translateX(${String(-EMPTY_SHIFT)}px)`, opacity: 0 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: EMPTY, easing: OUT },
  )
}
