import { createApi } from '@/scripts/api'
import { dropText, readText, writeText } from '@/scripts/storage'

const CART = 'cart'

const ORDERS = 'orders'

const LOGIN = 'login'

const api = createApi('')

const linesOf = (raw: string | null): [string, number][] => {
  if (raw === null) return []

  let value: unknown

  try {
    value = JSON.parse(raw)
  } catch {
    return []
  }

  if (typeof value !== 'object' || value === null) return []

  return Object.entries(value).filter(
    (pair): pair is [string, number] =>
      typeof pair[1] === 'number' && Number.isFinite(pair[1]) && pair[1] > 0,
  )
}

export const moveOldStorage = async (): Promise<boolean> => {
  const raw = readText(CART)
  const lines = linesOf(raw)

  dropText(ORDERS)
  dropText(LOGIN)

  if (lines.length === 0) {
    dropText(CART)

    return false
  }

  dropText(CART)

  const left: [string, number][] = []

  for (const [slug, quantity] of lines) {
    const moved = await api
      .addToCart(slug, Math.min(Math.round(quantity), 99))
      .then(() => true)
      .catch(() => false)

    if (!moved) left.push([slug, quantity])
  }

  if (left.length > 0) writeText(CART, JSON.stringify(Object.fromEntries(left)))

  return left.length < lines.length
}
