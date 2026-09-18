import { createApi, type Cart } from '@/scripts/api'
import { moveOldStorage } from '@/scripts/storage-move'

export type Lines = Record<string, number>

export interface CartStore {
  lines: () => Lines
  count: () => number
  total: () => number
  has: (slug: string) => boolean
  priceOf: (slug: string) => number
  add: (slug: string, amount?: number) => void
  set: (slug: string, amount: number) => void
  drop: (slug: string) => void
  clear: () => void
  refresh: () => Promise<void>
  watch: (listener: (lines: Lines) => void) => void
  ready: () => Promise<void>
}

const api = createApi('')

const linesOf = (cart: Cart): Lines =>
  Object.fromEntries(cart.items.map((item) => [item.slug, item.quantity]))

const pricesOf = (cart: Cart): Lines =>
  Object.fromEntries(cart.items.map((item) => [item.slug, item.price]))

export const createCart = (): CartStore => {
  let lines: Lines = {}
  let prices: Lines = {}
  let total = 0
  let known = false
  let flying = 0
  let queue: Promise<unknown> = Promise.resolve()

  const listeners = new Set<(lines: Lines) => void>()

  const tell = (): void => {
    if (!known) return

    for (const listener of listeners) listener({ ...lines })
  }

  const settle = (cart: Cart): void => {
    prices = { ...prices, ...pricesOf(cart) }

    if (flying > 0) return

    lines = linesOf(cart)
    total = cart.total
    known = true
    tell()
  }

  const send = (call: () => Promise<Cart>): void => {
    flying += 1

    let counted = false

    const done = (): void => {
      if (counted) return

      counted = true
      flying -= 1
    }

    queue = queue
      .then(call)
      .catch(async () => api.cart())
      .then((cart) => {
        done()
        settle(cart)
      })
      .catch(() => {
        done()
        known = true
      })
  }

  const guess = (slug: string, amount: number): void => {
    if (amount <= 0) {
      const { [slug]: _gone, ...rest } = lines

      lines = rest
    } else lines = { ...lines, [slug]: amount }

    total = Object.entries(lines).reduce(
      (sum, [key, count]) => sum + (prices[key] ?? 0) * count,
      0,
    )

    known = true
    tell()
  }

  const first = (queue = moveOldStorage()
    .then(async () => api.cart())
    .then(settle)
    .catch(() => {
      known = true
    }))

  return {
    lines: () => ({ ...lines }),
    count: () => Object.values(lines).reduce((sum, count) => sum + count, 0),
    total: () => total,
    has: (slug) => lines[slug] !== undefined,
    priceOf: (slug) => prices[slug] ?? 0,

    add: (slug, amount = 1) => {
      guess(slug, (lines[slug] ?? 0) + amount)
      send(async () => api.addToCart(slug, amount))
    },

    set: (slug, amount) => {
      guess(slug, amount)
      send(async () => api.setQuantity(slug, amount))
    },

    drop: (slug) => {
      guess(slug, 0)
      send(async () => api.dropFromCart(slug))
    },

    clear: () => {
      lines = {}
      total = 0
      known = true
      tell()
      send(async () => api.clearCart())
    },

    refresh: async () => {
      queue = queue
        .then(async () => api.cart())
        .then(settle)
        .catch(() => undefined)

      await queue
    },

    watch: (listener) => {
      listeners.add(listener)

      if (known) listener({ ...lines })
    },

    ready: async () => {
      await first
      await queue
    },
  }
}
