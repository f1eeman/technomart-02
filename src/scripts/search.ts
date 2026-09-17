import { goodsLabel } from '@/scripts/format'

const normalize = (text: string): string =>
  text.toLowerCase().replaceAll('ё', 'е').replace(/\s+/gu, ' ').trim()

const wordsOf = (query: string): string[] =>
  normalize(query).split(' ').filter(Boolean)

export function initSearch(): void {
  const list = document.querySelector('[data-search-list]')

  if (list === null) return

  const field = document.querySelector('[data-search-query]')
  const found = document.querySelector('[data-search-found]')
  const empty = document.querySelector('[data-search-empty]')
  const idle = document.querySelector('[data-search-idle]')
  const echo = document.querySelector('[data-search-echo]')

  const cards = Array.from(
    list.querySelectorAll<HTMLElement>('[data-product]'),
  ).map((node) => ({ node, text: normalize(node.dataset['search'] ?? '') }))

  const query = new URLSearchParams(location.search).get('q') ?? ''
  const words = wordsOf(query)

  if (field instanceof HTMLInputElement) field.value = query

  if (echo !== null) echo.textContent = query.trim()

  if (words.length === 0) {
    for (const card of cards) card.node.hidden = true

    if (idle instanceof HTMLElement) idle.hidden = false

    if (empty instanceof HTMLElement) empty.hidden = true

    if (found instanceof HTMLElement) found.hidden = true

    return
  }

  let hits = 0

  for (const card of cards) {
    const match = words.every((word) => card.text.includes(word))

    card.node.hidden = !match

    if (match) hits += 1
  }

  if (idle instanceof HTMLElement) idle.hidden = true

  if (found instanceof HTMLElement) {
    found.hidden = hits === 0
    found.textContent = `Нашлось ${goodsLabel(hits)}`
  }

  if (empty instanceof HTMLElement) empty.hidden = hits > 0
}
