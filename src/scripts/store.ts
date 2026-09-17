import { readText, writeText } from '@/scripts/storage'

export type Items = Record<string, number>

export interface Store {
  items: () => Items
  count: () => number
  has: (slug: string) => boolean
  add: (slug: string, amount?: number) => void
  set: (slug: string, amount: number) => void
  drop: (slug: string) => void
  clear: () => void
  watch: (listener: (items: Items) => void) => void
}

const parse = (raw: string | null): Items => {
  if (raw === null) return {}

  let value: unknown

  try {
    value = JSON.parse(raw)
  } catch {
    return {}
  }

  if (typeof value !== 'object' || value === null) return {}

  const items: Items = {}

  for (const [slug, amount] of Object.entries(value))
    if (typeof amount === 'number' && Number.isFinite(amount) && amount >= 1)
      items[slug] = Math.floor(amount)

  return items
}

export const createStore = (key: string): Store => {
  const event = `device:${key}`
  let items = parse(readText(key))

  const save = (): void => {
    writeText(key, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(event))
  }

  return {
    items: () => ({ ...items }),
    count: () => Object.values(items).reduce((sum, amount) => sum + amount, 0),
    has: (slug) => items[slug] !== undefined,
    add: (slug, amount = 1) => {
      items[slug] = (items[slug] ?? 0) + amount
      save()
    },
    set: (slug, amount) => {
      if (amount < 1) delete items[slug]
      else items[slug] = Math.floor(amount)

      save()
    },
    drop: (slug) => {
      delete items[slug]
      save()
    },
    clear: () => {
      items = {}
      save()
    },
    watch: (listener) => {
      const run = (): void => {
        listener({ ...items })
      }

      window.addEventListener(event, run)
      window.addEventListener('storage', (incoming) => {
        if (incoming.key !== null && incoming.key !== key) return

        items = parse(readText(key))
        run()
      })

      run()
    },
  }
}
