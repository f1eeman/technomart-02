import {
  createApi,
  type Product,
  type ProductsPage,
  type ProductsQuery,
} from '@/scripts/api'
import { searchOf, type CatalogState } from '@/scripts/catalog-url'
import { priceLabel } from '@/scripts/format'
import { calm, flipFrom, OUT, spotsOf, type Spot } from '@/scripts/motion'
import { compare } from '@/scripts/compare'
import { curtain, ghostsOf, shiftPack, slideIn } from '@/scripts/scene'

type Reason = 'filter' | 'page'

const FLIP = 280
const FLIP_DELAY = 60

const api = createApi('')

const numberOf = (raw: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(raw ?? '', 10)

  return Number.isFinite(parsed) ? parsed : fallback
}

const isBluetooth = (value: string): value is CatalogState['bt'] =>
  value === 'yes' || value === 'no' || value === 'any'

const isField = (value: string): value is CatalogState['sort'] =>
  value === 'price' || value === 'kind' || value === 'popularity'

const isCategory = (value: string): value is ProductsQuery['category'] =>
  value.length > 0

const stateOf = (
  search: string,
  lowest: number,
  highest: number,
): CatalogState => {
  const params = new URLSearchParams(search)
  const sort = params.get('sort') ?? ''
  const bt = params.get('bt') ?? ''

  const min = Math.min(
    Math.max(numberOf(params.get('min') ?? undefined, lowest), lowest),
    highest,
  )

  return {
    min,
    max: Math.min(
      Math.max(numberOf(params.get('max') ?? undefined, highest), min),
      highest,
    ),
    colors: (params.get('colors') ?? '').split(',').filter(Boolean),
    bt: isBluetooth(bt) ? bt : 'any',
    sort: isField(sort) ? sort : 'price',
    dir: params.get('dir') === 'desc' ? 'desc' : 'asc',
    page: Math.max(numberOf(params.get('page') ?? undefined, 1), 1),
  }
}

const queryOf = (
  state: CatalogState,
  category: ProductsQuery['category'],
  lowest: number,
  highest: number,
): ProductsQuery => ({
  category,
  ...(state.min === lowest ? {} : { min: state.min }),
  ...(state.max === highest ? {} : { max: state.max }),
  ...(state.colors.length === 0 ? {} : { colors: state.colors.join(',') }),
  ...(state.bt === 'any' ? {} : { bt: state.bt }),
  ...(state.sort === 'price' ? {} : { sort: state.sort }),
  ...(state.dir === 'asc' ? {} : { dir: state.dir }),
  ...(state.page === 1 ? {} : { page: state.page }),
})

const fill = (card: HTMLElement, product: Product): HTMLElement => {
  card.dataset['product'] = product.slug
  card.dataset['price'] = String(product.price)
  card.dataset['color'] = product.color
  card.dataset['bluetooth'] = product.bluetooth ? 'yes' : 'no'
  card.dataset['kind'] = product.kind
  card.dataset['popularity'] = String(product.popularity)

  const image = card.querySelector<HTMLImageElement>('[data-card-image]')

  if (image !== null) {
    image.src = product.imagePath
    image.alt = `Картинка — ${product.title.toLowerCase()}`
  }

  const link = card.querySelector<HTMLAnchorElement>('[data-card-link]')

  if (link !== null) link.href = `/product/${product.slug}`

  const title = card.querySelector('[data-card-title]')

  if (title !== null) title.textContent = product.title

  const price = card.querySelector('[data-card-price]')

  if (price !== null) price.textContent = priceLabel(product.price)

  const toCart = card.querySelector<HTMLElement>('[data-cart-add]')

  if (toCart !== null) toCart.dataset['cartAdd'] = product.slug

  const toCompare = card.querySelector<HTMLElement>('[data-compare-add]')

  if (toCompare !== null) {
    toCompare.dataset['compareAdd'] = product.slug

    const picked = compare.has(product.slug)

    toCompare.textContent = picked
      ? 'Убрать из сравнения'
      : 'Добавить к сравнению'
    toCompare.setAttribute('aria-pressed', picked ? 'true' : 'false')
  }

  return card
}

export function initCatalog(): void {
  const list = document.querySelector<HTMLElement>('[data-catalog]')
  const form = document.querySelector<HTMLFormElement>('[data-filter]')
  const template = document.querySelector<HTMLTemplateElement>(
    '[data-product-template]',
  )

  if (list === null || form === null) return

  const category = list.dataset['catalog'] ?? ''

  if (!isCategory(category)) return

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

  const state = stateOf(location.search, lowest, highest)

  let dragging = false
  let cameFrom = state.page
  let generation = 0

  const paintRange = (): void => {
    if (range === null || bar === null) return

    const left = ((state.min - lowest) / span) * 100
    const right = ((state.max - lowest) / span) * 100

    bar.style.left = `${String(left)}%`
    bar.style.right = `${String(100 - right)}%`

    const min = toggles.get('min')
    const max = toggles.get('max')

    if (min !== undefined) min.style.left = `${String(left)}%`

    if (max !== undefined) max.style.left = `${String(right)}%`

    const minField = fields.get('min')
    const maxField = fields.get('max')

    if (minField !== undefined) minField.value = String(state.min)

    if (maxField !== undefined) maxField.value = String(state.max)
  }

  const syncUrl = (): void => {
    const query = searchOf(state, { lowest, highest })

    history.replaceState(
      null,
      '',
      query.length > 0 ? `?${query}` : location.pathname,
    )
  }

  const paintControls = (page: ProductsPage): void => {
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
      const number = numberOf(item.dataset['pageItem'], 1)

      item.hidden = number > page.totalPages
      item.classList.toggle('pagination-item-current', number === page.page)
      item
        .querySelector('[data-page]')
        ?.classList.toggle('link-current', number === page.page)
    }

    if (pagination !== null) pagination.hidden = page.items.length === 0

    if (empty !== null) empty.hidden = page.items.length > 0
  }

  const paint = (
    page: ProductsPage,
    reason: Reason,
    before: Map<Element, Spot> | null,
  ): void => {
    const wasEmpty = empty?.hidden ?? true
    const wasPage = cameFrom
    const moving = before !== null

    const kept = new Map<string, HTMLElement>()

    for (const node of list.querySelectorAll<HTMLElement>('[data-product]'))
      kept.set(node.dataset['product'] ?? '', node)

    const nodes = page.items.map((product) => {
      const known = kept.get(product.slug)

      if (known !== undefined) return known

      const clone = template?.content.firstElementChild?.cloneNode(true)

      return clone instanceof HTMLElement
        ? fill(clone, product)
        : document.createElement('li')
    })

    const arriving = nodes.filter(
      (node) => !kept.has(node.dataset['product'] ?? ''),
    )

    list.replaceChildren(...nodes)

    paintControls(page)

    if (moving && reason === 'page')
      shiftPack(list, page.page > wasPage ? 1 : -1)

    if (moving && reason === 'filter' && before !== null) {
      for (const node of arriving) before.delete(node)

      flipFrom(before, { duration: FLIP, easing: OUT, delay: FLIP_DELAY })
      curtain(arriving)
    }

    if (moving && empty !== null && wasEmpty && !empty.hidden) slideIn(empty)

    cameFrom = page.page
    state.page = Math.min(page.page, page.totalPages)

    if (state.page !== page.page) syncUrl()
  }

  const render = (reason: Reason): void => {
    const moving = !dragging && !calm()
    const shown = Array.from(
      list.querySelectorAll<HTMLElement>('[data-product]'),
    )
    const before = moving ? spotsOf(shown) : null

    paintRange()
    syncUrl()

    if (moving && reason === 'filter' && ghostLayer !== null && before !== null)
      ghostsOf(shown, before, ghostLayer)

    const token = (generation += 1)

    void api
      .products(queryOf(state, category, lowest, highest))
      .then((page) => {
        if (token !== generation) return

        paint(page, reason, before)
      })
      .catch(() => {
        if (token === generation) location.reload()
      })
  }

  const setBound = (which: 'min' | 'max', value: number): void => {
    const clamped = Math.min(Math.max(Math.round(value), lowest), highest)

    if (which === 'min') state.min = Math.min(clamped, state.max)
    else state.max = Math.max(clamped, state.min)

    state.page = 1
    render('filter')
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
          render('filter')
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

  for (const box of colorBoxes)
    box.addEventListener('change', () => {
      state.colors = colorBoxes
        .filter((item) => item.checked)
        .map((item) => item.value)
      state.page = 1
      render('filter')
    })

  for (const box of bluetoothBoxes)
    box.addEventListener('change', () => {
      if (!isBluetooth(box.value)) return

      state.bt = box.value
      state.page = 1
      render('filter')
    })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    render('filter')
  })

  for (const link of sortLinks)
    link.addEventListener('click', (event) => {
      const next = link.dataset['sortField'] ?? ''

      if (!isField(next)) return

      event.preventDefault()
      state.sort = next
      state.page = 1
      render('filter')
    })

  for (const link of dirLinks)
    link.addEventListener('click', (event) => {
      event.preventDefault()
      state.dir = link.dataset['sortDir'] === 'desc' ? 'desc' : 'asc'
      state.page = 1
      render('filter')
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

      const shown = pageItems.filter((item) => !item.hidden).length
      const last = Math.max(shown, 1)

      state.page = Math.min(
        Math.max(state.page + numberOf(link.dataset['pageStep'], 0), 1),
        last,
      )
      render('page')
    })

  window.addEventListener('resize', paintRange)

  paintRange()
}
