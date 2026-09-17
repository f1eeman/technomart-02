import { readText, writeText } from '@/scripts/storage'

const KEY = 'orders'
const LIMIT = 20

export interface Order {
  at: string
  total: number
  lines: string[]
}

const isOrder = (value: unknown): value is Order => {
  if (typeof value !== 'object' || value === null) return false

  const shape = value as Partial<Order>

  return (
    typeof shape.at === 'string' &&
    typeof shape.total === 'number' &&
    Array.isArray(shape.lines)
  )
}

export const readOrders = (): Order[] => {
  const raw = readText(KEY)

  if (raw === null) return []

  let value: unknown

  try {
    value = JSON.parse(raw)
  } catch {
    return []
  }

  return Array.isArray(value) ? value.filter(isOrder) : []
}

export const addOrder = (order: Order): void => {
  writeText(KEY, JSON.stringify([order, ...readOrders()].slice(0, LIMIT)))
}
