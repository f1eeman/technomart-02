import { countLabel } from '@/scripts/format'
import { mark } from '@/scripts/motion'
import { createStore, type Items } from '@/scripts/store'

export const compare = createStore('compare')

const LIMIT = 4

export function initCompareControls(): void {
  const hosts = document.querySelectorAll<HTMLElement>('[data-compare-bump]')

  const refuse = (button: HTMLElement): void => {
    mark(button, 'full', 'on')

    for (const host of hosts) mark(host, 'full', 'on')
  }

  for (const button of document.querySelectorAll<HTMLElement>(
    '[data-compare-add]',
  )) {
    const slug = button.dataset['compareAdd']

    if (slug === undefined) continue

    button.addEventListener('click', (event) => {
      event.preventDefault()

      if (compare.has(slug)) {
        compare.drop(slug)

        return
      }

      if (compare.count() >= LIMIT) {
        refuse(button)

        return
      }

      compare.add(slug)
    })
  }

  let known: number | null = null

  compare.watch((items) => {
    const count = compare.count()
    const label = countLabel(count)

    for (const slot of document.querySelectorAll('[data-compare-count]'))
      slot.textContent = label

    for (const button of document.querySelectorAll<HTMLElement>(
      '[data-compare-add]',
    )) {
      const slug = button.dataset['compareAdd'] ?? ''
      const picked = items[slug] !== undefined

      button.textContent = picked
        ? 'Убрать из сравнения'
        : 'Добавить к сравнению'
      button.setAttribute('aria-pressed', picked ? 'true' : 'false')
    }

    if (known === null) {
      known = count

      return
    }

    if (count === known) return

    const way = count > known ? 'up' : 'down'

    known = count

    for (const host of hosts) mark(host, 'bump', way)
  })
}

export function initComparePage(): void {
  const table = document.querySelector('[data-compare-table]')

  if (table === null) return

  const empty = document.querySelector('[data-compare-empty]')
  const cells = Array.from(
    table.querySelectorAll<HTMLElement>('[data-compare-cell]'),
  )

  for (const button of table.querySelectorAll<HTMLElement>(
    '[data-compare-remove]',
  )) {
    const slug = button.dataset['compareRemove']

    if (slug === undefined) continue

    button.addEventListener('click', (event) => {
      event.preventDefault()
      compare.drop(slug)
    })
  }

  const render = (items: Items): void => {
    let shown = 0

    for (const cell of cells) {
      const picked = items[cell.dataset['compareCell'] ?? ''] !== undefined

      cell.hidden = !picked
    }

    for (const slug of Object.keys(items)) if (slug.length > 0) shown += 1

    if (empty instanceof HTMLElement) empty.hidden = shown > 0

    if (table instanceof HTMLElement) table.hidden = shown === 0
  }

  compare.watch(render)
}
