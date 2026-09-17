import { calm, flipFrom, OUT, spotsOf } from '@/scripts/motion'
import { curtain, ghostsOf, shiftPack, slideIn } from '@/scripts/scene'

type Field = 'price' | 'kind' | 'popularity'
type Dir = 'asc' | 'desc'
type Bluetooth = 'yes' | 'no' | 'any'

const PAGE_SIZE = 4
const TOGGLE = 20
const FLIP = 280
const FLIP_DELAY = 60

type Reason = 'first' | 'page' | 'filter'

interface Card {
  node: HTMLElement
  price: number
  color: string
  bluetooth: string
  kind: string
  popularity: number
}

const numberOf = (raw: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(raw ?? '', 10)

  return Number.isFinite(parsed) ? parsed : fallback
}

const isField = (value: string | null): value is Field =>
  value === 'price' || value === 'kind' || value === 'popularity'

const isBluetooth = (value: string | null): value is Bluetooth =>
  value === 'yes' || value === 'no' || value === 'any'

export function initCatalog(): void {
  const list = document.querySelector<HTMLElement>('[data-catalog]')
  const form = document.querySelector<HTMLFormElement>('[data-filter]')

  if (list === null || form === null) return

  const cards: Card[] = Array.from(
    list.querySelectorAll<HTMLElement>('[data-product]'),
  ).map((node) => ({
    node,
    price: numberOf(node.dataset['price'], 0),
    color: node.dataset['color'] ?? '',
    bluetooth: node.dataset['bluetooth'] ?? 'no',
    kind: node.dataset['kind'] ?? '',
    popularity: numberOf(node.dataset['popularity'], 0),
  }))

  const lowest = numberOf(form.dataset['lowest'], 0)
  const highest = numberOf(form.dataset['highest'], 0)
  const span = Math.max(highest - lowest, 1)

  const range = form.querySelector<HTMLElement>('[data-range]')
  const bar = form.querySelector<HTMLElement>('[data-range-bar]')
  const toggles = new Map<string, HTMLElement>()
  const fields = new Map<string, HTMLInputElement>()

  for (const node of form.querySelectorAll<HTMLElement>('[data-range-toggle]'))
    toggles.set(node.dataset['rangeToggle'] ?? '', node)

  for (const node of form.querySelectorAll<HTMLInputElement>(
    '[data-range-field]',
  ))
    fields.set(node.dataset['rangeField'] ?? '', node)

  const colorBoxes = Array.from(
    form.querySelectorAll<HTMLInputElement>('[data-filter-color]'),
  )
  const bluetoothBoxes = Array.from(
    form.querySelectorAll<HTMLInputElement>('[data-filter-bluetooth]'),
  )

  const sortLinks = Array.from(
    document.querySelectorAll<HTMLElement>('[data-sort-field]'),
  )
  const dirLinks = Array.from(
    document.querySelectorAll<HTMLElement>('[data-sort-dir]'),
  )

  const pagination = document.querySelector<HTMLElement>('[data-pagination]')
  const pageItems = Array.from(
    document.querySelectorAll<HTMLElement>('[data-page-item]'),
  )
  const empty = document.querySelector<HTMLElement>('[data-catalog-empty]')
  const ghostLayer = document.querySelector<HTMLElement>(
    '[data-catalog-ghosts]',
  )

  let dragging = false
  let cameFrom = 1

  const params = new URLSearchParams(location.search)

  const state = {
    min: numberOf(params.get('min') ?? undefined, lowest),
    max: numberOf(params.get('max') ?? undefined, highest),
    colors: new Set((params.get('colors') ?? '').split(',').filter(Boolean)),
    bluetooth: isBluetooth(params.get('bt')) ? params.get('bt') : 'any',
    sort: isField(params.get('sort')) ? params.get('sort') : 'price',
    dir: params.get('dir') === 'desc' ? 'desc' : 'asc',
    page: Math.max(numberOf(params.get('page') ?? undefined, 1), 1),
  } as {
    min: number
    max: number
    colors: Set<string>
    bluetooth: Bluetooth
    sort: Field
    dir: Dir
    page: number
  }

  state.min = Math.min(Math.max(state.min, lowest), highest)
  state.max = Math.min(Math.max(state.max, state.min), highest)

  const paintRange = (): void => {
    if (range === null || bar === null) return

    const width = range.clientWidth || 200
    const from = (state.min - lowest) / span
    const to = (state.max - lowest) / span

    bar.style.marginLeft = `${String(from * width)}px`
    bar.style.width = `${String((to - from) * width)}px`

    const min = toggles.get('min')
    const max = toggles.get('max')

    if (min !== undefined)
      min.style.left = `${String(from * width - TOGGLE / 2)}px`

    if (max !== undefined)
      max.style.left = `${String(to * width - TOGGLE / 2)}px`

    const minField = fields.get('min')
    const maxField = fields.get('max')

    if (minField !== undefined) minField.value = String(state.min)

    if (maxField !== undefined) maxField.value = String(state.max)
  }

  const syncUrl = (): void => {
    const next = new URLSearchParams()

    if (state.min !== lowest) next.set('min', String(state.min))

    if (state.max !== highest) next.set('max', String(state.max))

    if (state.colors.size > 0)
      next.set('colors', Array.from(state.colors).join(','))

    if (state.bluetooth !== 'any') next.set('bt', state.bluetooth)

    if (state.sort !== 'price') next.set('sort', state.sort)

    if (state.dir !== 'asc') next.set('dir', state.dir)

    if (state.page !== 1) next.set('page', String(state.page))

    const query = next.toString()

    history.replaceState(
      null,
      '',
      query.length > 0 ? `?${query}` : location.pathname,
    )
  }

  const matches = (card: Card): boolean => {
    if (card.price < state.min || card.price > state.max) return false

    if (state.colors.size > 0 && !state.colors.has(card.color)) return false

    if (state.bluetooth !== 'any' && card.bluetooth !== state.bluetooth)
      return false

    return true
  }

  const compare = (a: Card, b: Card): number => {
    const sign = state.dir === 'asc' ? 1 : -1

    if (state.sort === 'kind') return a.kind.localeCompare(b.kind, 'ru') * sign

    if (state.sort === 'popularity') return (a.popularity - b.popularity) * sign

    return (a.price - b.price) * sign
  }

  const render = (reason: Reason = 'filter'): void => {
    const moving = reason !== 'first' && !dragging && !calm()
    const seen = cards.filter((card) => !card.node.hidden).map((c) => c.node)
    const before = moving ? spotsOf(seen) : null
    const wasEmpty = empty?.hidden ?? true
    const wasPage = cameFrom

    const found = cards.filter(matches).sort(compare)
    const pages = Math.max(Math.ceil(found.length / PAGE_SIZE), 1)

    if (state.page > pages) state.page = pages

    const from = (state.page - 1) * PAGE_SIZE
    const shown = new Set(
      found.slice(from, from + PAGE_SIZE).map((c) => c.node),
    )

    const stayed = new Set(seen)
    const leaving = moving ? seen.filter((node) => !shown.has(node)) : []
    const arriving = moving
      ? Array.from(shown).filter((node) => !stayed.has(node))
      : []

    if (moving && reason === 'filter' && ghostLayer !== null && before !== null)
      ghostsOf(leaving, before, ghostLayer)

    for (const card of cards) card.node.hidden = !shown.has(card.node)

    for (const card of found) list.append(card.node)

    for (const link of sortLinks)
      link.classList.toggle(
        'current-sort-type',
        link.dataset['sortField'] === state.sort,
      )

    for (const link of dirLinks)
      link.classList.toggle(
        'current-sort-type',
        link.dataset['sortDir'] === state.dir,
      )

    for (const item of pageItems) {
      const page = numberOf(item.dataset['pageItem'], 1)

      item.hidden = page > pages
      item.classList.toggle('pagination-item-current', page === state.page)
      item
        .querySelector('[data-page]')
        ?.classList.toggle('link-current', page === state.page)
    }

    if (pagination !== null) pagination.hidden = found.length === 0

    if (empty !== null) empty.hidden = found.length > 0

    if (moving && reason === 'page')
      shiftPack(list, state.page > wasPage ? 1 : -1)

    if (moving && reason === 'filter' && before !== null) {
      for (const node of leaving) before.delete(node)

      for (const node of arriving) before.delete(node)

      flipFrom(before, { duration: FLIP, easing: OUT, delay: FLIP_DELAY })
      curtain(arriving)
    }

    if (moving && empty !== null && wasEmpty && !empty.hidden) slideIn(empty)

    cameFrom = state.page

    paintRange()
    syncUrl()
  }

  const setBound = (which: 'min' | 'max', value: number): void => {
    const clamped = Math.min(Math.max(Math.round(value), lowest), highest)

    if (which === 'min') state.min = Math.min(clamped, state.max)
    else state.max = Math.max(clamped, state.min)

    state.page = 1
    render()
  }

  if (range !== null)
    for (const [which, toggle] of toggles) {
      const bound = which === 'max' ? 'max' : 'min'

      toggle.addEventListener('pointerdown', (event) => {
        event.preventDefault()
        toggle.setPointerCapture(event.pointerId)
        dragging = true

        const box = range.getBoundingClientRect()

        const move = (moving: PointerEvent): void => {
          const ratio = (moving.clientX - box.left) / (box.width || 200)

          setBound(bound, lowest + ratio * span)
        }

        const stop = (): void => {
          dragging = false
          toggle.removeEventListener('pointermove', move)
          toggle.removeEventListener('pointerup', stop)
          toggle.removeEventListener('pointercancel', stop)
        }

        toggle.addEventListener('pointermove', move)
        toggle.addEventListener('pointerup', stop)
        toggle.addEventListener('pointercancel', stop)
      })

      toggle.addEventListener('keydown', (event) => {
        const step = Math.max(Math.round(span / 20), 1)

        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          event.preventDefault()
          setBound(bound, (bound === 'min' ? state.min : state.max) - step)
        }

        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          event.preventDefault()
          setBound(bound, (bound === 'min' ? state.min : state.max) + step)
        }
      })
    }

  for (const [which, field] of fields)
    field.addEventListener('change', () => {
      setBound(
        which === 'max' ? 'max' : 'min',
        Number.parseInt(field.value, 10),
      )
    })

  for (const box of colorBoxes) {
    box.checked = state.colors.has(box.value)

    box.addEventListener('change', () => {
      if (box.checked) state.colors.add(box.value)
      else state.colors.delete(box.value)

      state.page = 1
      render()
    })
  }

  for (const box of bluetoothBoxes) {
    box.checked = box.value === state.bluetooth

    box.addEventListener('change', () => {
      if (!isBluetooth(box.value)) return

      state.bluetooth = box.value
      state.page = 1
      render()
    })
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    render()
  })

  for (const link of sortLinks)
    link.addEventListener('click', (event) => {
      event.preventDefault()

      const next = link.dataset['sortField']

      if (!isField(next ?? null)) return

      state.sort = next as Field
      state.page = 1
      render()
    })

  for (const link of dirLinks)
    link.addEventListener('click', (event) => {
      event.preventDefault()
      state.dir = link.dataset['sortDir'] === 'desc' ? 'desc' : 'asc'
      state.page = 1
      render()
    })

  for (const link of document.querySelectorAll<HTMLElement>('[data-page]'))
    link.addEventListener('click', (event) => {
      event.preventDefault()
      state.page = numberOf(link.dataset['page'], 1)
      render('page')
    })

  for (const link of document.querySelectorAll<HTMLElement>('[data-page-step]'))
    link.addEventListener('click', (event) => {
      event.preventDefault()
      state.page = Math.max(
        state.page + numberOf(link.dataset['pageStep'], 0),
        1,
      )
      render('page')
    })

  window.addEventListener('resize', paintRange)

  render('first')
}
