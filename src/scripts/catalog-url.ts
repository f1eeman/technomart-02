import type { SortDir, SortField } from '@/scripts/api'

export interface CatalogState {
  min: number
  max: number
  colors: string[]
  bt: 'yes' | 'no' | 'any'
  sort: SortField
  dir: SortDir
  page: number
}

export interface CatalogBounds {
  lowest: number
  highest: number
}

export const searchOf = (
  state: CatalogState,
  bounds: CatalogBounds,
): string => {
  const next = new URLSearchParams()

  if (state.min !== bounds.lowest) next.set('min', String(state.min))

  if (state.max !== bounds.highest) next.set('max', String(state.max))

  if (state.colors.length > 0) next.set('colors', state.colors.join(','))

  if (state.bt !== 'any') next.set('bt', state.bt)

  if (state.sort !== 'price') next.set('sort', state.sort)

  if (state.dir !== 'asc') next.set('dir', state.dir)

  if (state.page !== 1) next.set('page', String(state.page))

  return next.toString()
}

export const linkOf = (
  state: CatalogState,
  bounds: CatalogBounds,
  patch: Partial<CatalogState>,
): string => {
  const query = searchOf({ ...state, ...patch }, bounds)

  return query === '' ? '?' : `?${query}`
}
