import { calm } from '@/scripts/motion'

const LIMIT = 3
const LIFT = 90
const DURATION = 460

export const LANDED = 'device:cart-landed'

let flying = 0

export function flyToCart(source: Element | null | undefined): void {
  if (calm() || source === null || source === undefined) return

  if (flying >= LIMIT) return

  const target = document.querySelector('[data-cart-target]')

  if (target === null) return

  const from = source.getBoundingClientRect()
  const to = target.getBoundingClientRect()

  if (from.width === 0 || from.height === 0 || to.width === 0) return

  const clone = source.cloneNode(true)

  if (!(clone instanceof HTMLElement)) return

  clone.removeAttribute('id')
  clone.setAttribute('aria-hidden', 'true')
  clone.style.cssText = [
    'position:fixed',
    `left:${String(from.left)}px`,
    `top:${String(from.top)}px`,
    `width:${String(from.width)}px`,
    `height:${String(from.height)}px`,
    'margin:0',
    'padding:0',
    'z-index:1000',
    'pointer-events:none',
    'object-fit:cover',
  ].join(';')

  document.body.append(clone)
  flying += 1

  const shiftX = to.left + 20 - (from.left + from.width / 2)
  const shiftY = to.top + to.height / 2 - (from.top + from.height / 2)

  const done = (): void => {
    clone.remove()
    flying -= 1
    window.dispatchEvent(new CustomEvent(LANDED))
  }

  const run = clone.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      {
        transform: `translate(${String(shiftX * 0.55)}px, ${String(shiftY * 0.55 - LIFT)}px) scale(0.55)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(${String(shiftX)}px, ${String(shiftY)}px) scale(0.1)`,
        opacity: 0.2,
      },
    ],
    { duration: DURATION, easing: 'ease-in-out', fill: 'forwards' },
  )

  run.finished.then(done, done)
}
