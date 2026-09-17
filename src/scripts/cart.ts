import { countLabel, priceLabel } from '@/scripts/format'
import { flyToCart, LANDED } from '@/scripts/fly'
import { calm, countUp, mark } from '@/scripts/motion'
import { addOrder } from '@/scripts/orders'
import { createStore, type Items } from '@/scripts/store'

export const cart = createStore('cart')

const COLLAPSE = 240
const TOTAL_COUNT = 380
const LINE_COUNT = 220
const STEP = 10

const priceOf = (row: HTMLElement): number => {
  const raw = Number.parseInt(row.dataset['price'] ?? '', 10)

  return Number.isFinite(raw) ? raw : 0
}

const sourceFor = (button: HTMLElement): Element | null =>
  button.closest('[data-product]')?.querySelector('[data-fly-source]') ??
  document.querySelector('[data-fly-source]')

export function initCartControls(): void {
  for (const button of document.querySelectorAll<HTMLElement>(
    '[data-cart-add]',
  )) {
    const slug = button.dataset['cartAdd']

    if (slug === undefined) continue

    button.addEventListener('click', (event) => {
      event.preventDefault()
      cart.add(slug)
      mark(button, 'ran', 'on')
      flyToCart(sourceFor(button))
    })
  }

  const slots = document.querySelectorAll<HTMLElement>('[data-cart-count]')
  const hosts = document.querySelectorAll<HTMLElement>('[data-cart-bump]')

  let known: number | null = null
  let pending: 'up' | 'down' | null = null

  const bump = (way: 'up' | 'down'): void => {
    for (const host of hosts) mark(host, 'bump', way)
  }

  cart.watch(() => {
    const count = cart.count()
    const label = countLabel(count)

    for (const slot of slots) slot.textContent = label

    if (known === null) {
      known = count

      return
    }

    if (count === known) return

    const way = count > known ? 'up' : 'down'

    known = count

    if (way === 'down') {
      bump(way)

      return
    }

    pending = way
  })

  window.addEventListener(LANDED, () => {
    if (pending === null) return

    bump(pending)
    pending = null
  })
}

export function initCartPage(): void {
  const list = document.querySelector('[data-cart-list]')

  if (list === null) return

  const empty = document.querySelector('[data-cart-empty]')
  const filled = document.querySelector('[data-cart-filled]')
  const total = document.querySelector('[data-cart-total]')
  const checkout = document.querySelector('[data-cart-checkout]')
  const done = document.querySelector('[data-cart-done]')

  let ordered = false
  let instant = true

  const closing = new Set<HTMLElement>()
  const rows = Array.from(
    list.querySelectorAll<HTMLElement>('[data-cart-row]'),
  ).map((row) => ({ row, slug: row.dataset['cartRow'] ?? '' }))

  const shut = (row: HTMLElement): void => {
    if (calm() || instant) {
      row.hidden = true

      return
    }

    if (closing.has(row)) return

    const height = row.offsetHeight

    closing.add(row)
    row.style.overflow = 'hidden'

    const run = row.animate(
      [
        { height: `${String(height)}px`, paddingBlock: '20px', opacity: 1 },
        { height: '0px', paddingBlock: '0px', opacity: 0 },
      ],
      { duration: COLLAPSE, easing: 'ease-in', fill: 'forwards' },
    )

    const away = (): void => {
      row.hidden = true
      row.style.removeProperty('overflow')
      run.cancel()
      closing.delete(row)
    }

    run.finished.then(away, away)
  }

  for (const { row, slug } of rows) {
    const remove = row.querySelector('[data-cart-remove]')

    remove?.addEventListener('click', (event) => {
      event.preventDefault()
      cart.drop(slug)
    })

    const amount = row.querySelector('[data-cart-amount]')

    if (!(amount instanceof HTMLInputElement)) continue

    amount.addEventListener('change', () => {
      cart.set(slug, Number.parseInt(amount.value, 10) || 0)
    })

    for (const step of row.querySelectorAll<HTMLElement>('[data-cart-step]')) {
      const shift = Number.parseInt(step.dataset['cartStep'] ?? '', 10)

      step.addEventListener('click', (event) => {
        event.preventDefault()
        cart.set(slug, (Number.parseInt(amount.value, 10) || 0) + shift)
      })
    }
  }

  const render = (items: Items): void => {
    let sum = 0
    let lines = 0

    for (const { row, slug } of rows) {
      const amount = items[slug] ?? 0

      if (amount === 0) {
        if (!row.hidden) shut(row)
        else row.hidden = true

        continue
      }

      if (closing.has(row)) closing.delete(row)

      row.hidden = false
      lines += 1

      const cost = priceOf(row) * amount

      sum += cost

      const field = row.querySelector('[data-cart-amount]')

      if (field instanceof HTMLInputElement) field.value = String(amount)

      const money = row.querySelector<HTMLElement>('[data-cart-sum]')

      if (money !== null)
        countUp(money, cost, priceLabel, instant ? 0 : LINE_COUNT, STEP)
    }

    if (total instanceof HTMLElement)
      countUp(total, sum, priceLabel, instant ? 0 : TOTAL_COUNT, STEP)

    if (lines > 0) ordered = false

    if (done instanceof HTMLElement) done.hidden = !ordered

    if (empty instanceof HTMLElement) empty.hidden = lines > 0 || ordered

    if (filled instanceof HTMLElement) filled.hidden = lines === 0

    instant = false
  }

  checkout?.addEventListener('click', (event) => {
    event.preventDefault()

    if (cart.count() === 0) return

    const items = cart.items()
    const lines: string[] = []
    let sum = 0

    for (const { row, slug } of rows) {
      const amount = items[slug] ?? 0

      if (amount === 0) continue

      sum += priceOf(row) * amount

      const name = row.querySelector('[data-cart-title]')?.textContent?.trim()

      lines.push(`${name ?? slug} — ${String(amount)} шт.`)
    }

    addOrder({ at: new Date().toISOString(), total: sum, lines })
    ordered = true
    instant = true
    cart.clear()
  })

  cart.watch(render)
}
