export const priceLabel = (price: number): string => {
  const digits = String(Math.max(Math.round(price), 0))
  const groups: string[] = []

  for (let end = digits.length; end > 0; end -= 3)
    groups.unshift(digits.slice(Math.max(end - 3, 0), end))

  return `${groups.join(' ')} руб.`
}

export const countLabel = (count: number): string =>
  count > 0 ? ` (${String(count)})` : ''

export const plural = (
  count: number,
  one: string,
  few: string,
  many: string,
): string => {
  const tail = count % 10
  const teen = count % 100

  if (teen >= 11 && teen <= 14) return many

  if (tail === 1) return one

  if (tail >= 2 && tail <= 4) return few

  return many
}

export const goodsLabel = (count: number): string =>
  `${String(count)} ${plural(count, 'товар', 'товара', 'товаров')}`
