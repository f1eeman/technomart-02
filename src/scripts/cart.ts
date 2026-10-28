import { createApi } from '@/scripts/api'
import { createCart, type Lines } from '@/scripts/cart-store'
import { countLabel, priceLabel } from '@/scripts/format'
import { flyToCart, LANDED } from '@/scripts/fly'
import { closeModal, openModal, OPENED, shakeModal } from '@/scripts/modal'
import { calm, countUp, mark } from '@/scripts/motion'
import { attachPhoneMask, LEAD } from '@/scripts/phone-mask'
import { currentName } from '@/scripts/session'
import { readText, writeText } from '@/scripts/storage'

const api = createApi('')

export const cart = createCart()

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
  document.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof Element)) return

    const button = target.closest<HTMLElement>('[data-cart-add]')
    const slug = button?.dataset['cartAdd']

    if (button === null || button === undefined || slug === undefined) return

    event.preventDefault()
    cart.add(slug)
    mark(button, 'ran', 'on')
    flyToCart(sourceFor(button))
  })

  const slots = document.querySelectorAll<HTMLElement>('[data-cart-count]')
  const hosts = document.querySelectorAll<HTMLElement>('[data-cart-bump]')

  const shownCount = (): number | null => {
    const text = slots[0]?.textContent?.trim() ?? ''

    if (text === '') return 0

    const digits = text.replace(/\D/gu, '')

    return digits === '' ? null : Number.parseInt(digits, 10)
  }

  let known: number | null = shownCount()
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
  const checkout = document.querySelector<HTMLElement>('[data-cart-checkout]')
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

  const render = (items: Lines): void => {
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

  const modal = document.querySelector<HTMLElement>('[data-modal="checkout"]')
  const nameField = modal?.querySelector('[data-field="name"]')
  const phoneField = modal?.querySelector('[data-field="phone"]')
  const changed = modal?.querySelector<HTMLElement>('[data-checkout-changed]')
  const sumSlot = modal?.querySelector<HTMLElement>('[data-checkout-total]')
  const modalForm = modal?.querySelector('form')

  const mask =
    phoneField instanceof HTMLInputElement ? attachPhoneMask(phoneField) : null

  modal?.addEventListener(OPENED, () => {
    if (nameField instanceof HTMLInputElement && nameField.value === '')
      nameField.value = currentName() ?? readText('name') ?? ''

    const stored = readText('phone')

    if (
      phoneField instanceof HTMLInputElement &&
      phoneField.value === '' &&
      stored !== null &&
      stored.length > 0
    ) {
      phoneField.value = stored
      phoneField.dispatchEvent(new Event('input', { bubbles: true }))
    }
  })

  checkout?.addEventListener('click', (event) => {
    event.preventDefault()

    if (cart.count() === 0 || modal === null) return

    if (changed !== null && changed !== undefined) changed.hidden = true

    if (sumSlot !== null && sumSlot !== undefined)
      sumSlot.textContent = priceLabel(cart.total())

    openModal(modal, checkout)
  })

  let placing = false

  modalForm?.addEventListener('submit', (event) => {
    event.preventDefault()

    if (placing) return

    if (
      modal === null ||
      !(nameField instanceof HTMLInputElement) ||
      !(phoneField instanceof HTMLInputElement)
    )
      return

    const who = nameField.value.trim()
    const digits = mask?.digits() ?? phoneField.value

    if (who.length === 0 || digits.length < 10) {
      shakeModal(modal)

      return
    }

    writeText('name', who)
    writeText('phone', digits)

    placing = true

    void api
      .placeOrder({
        name: who,
        phone: `+${LEAD}${digits}`,
        expected: cart.total(),
      })
      .then(() => {
        placing = false
        ordered = true
        instant = true
        cart.clear()
        closeModal(modal)
      })
      .catch(() => {
        placing = false

        if (changed !== null && changed !== undefined) changed.hidden = false

        void cart.refresh().then(() => {
          if (sumSlot !== null && sumSlot !== undefined)
            sumSlot.textContent = priceLabel(cart.total())
        })
      })
  })

  cart.watch(render)
}
