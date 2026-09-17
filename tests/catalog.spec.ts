import { expect, test, type Page } from '@playwright/test'

const shown = (page: Page) => page.locator('[data-product]:not([hidden])')

test.describe('Каталог раздела', () => {
  test('страница показывает четыре товара и три страницы', async ({ page }) => {
    await page.goto('/catalog/monopods')

    await expect(page.locator('[data-product]')).toHaveCount(12)
    await expect(shown(page)).toHaveCount(4)
    await expect(page.locator('[data-page-item]:not([hidden])')).toHaveCount(3)
  })

  test('пагинация листает и пишется в адрес', async ({ page }) => {
    await page.goto('/catalog/monopods')

    const first = await shown(page).first().getAttribute('data-product')

    await page.locator('[data-page="3"]').click()

    await expect(shown(page)).toHaveCount(4)
    expect(await shown(page).first().getAttribute('data-product')).not.toBe(
      first,
    )
    expect(page.url()).toContain('page=3')
  })

  test('сортировка по цене переставляет товары', async ({ page }) => {
    await page.goto('/catalog/monopods')

    const cheapest = await shown(page).first().getAttribute('data-price')

    await page.locator('[data-sort-dir="desc"]').click()

    const dearest = await shown(page).first().getAttribute('data-price')

    expect(Number(dearest)).toBeGreaterThan(Number(cheapest))
    expect(page.url()).toContain('dir=desc')
  })

  test('фильтр по цвету сужает выдачу', async ({ page }) => {
    await page.goto('/catalog/monopods')

    await page.locator('label[for="filter-pink-color"]').click()

    await expect(shown(page)).toHaveCount(3)

    for (const card of await shown(page).all())
      expect(await card.getAttribute('data-color')).toBe('pink')

    expect(page.url()).toContain('colors=pink')
  })

  test('фильтр по Bluetooth складывается с цветом', async ({ page }) => {
    await page.goto('/catalog/monopods')

    await page.locator('label[for="filter-pink-color"]').click()
    await page.locator('label[for="filter-bluetooth-no"]').click()

    await expect(shown(page)).toHaveCount(2)
    expect(page.url()).toContain('bt=no')
  })

  test('пустая выдача объясняется словами', async ({ page }) => {
    await page.goto('/catalog/monopods?colors=blue&bt=yes&max=600')

    await expect(shown(page)).toHaveCount(0)
    await expect(page.locator('[data-catalog-empty]')).toBeVisible()
    await expect(page.locator('[data-pagination]')).toBeHidden()
  })

  test('состояние из адреса восстанавливается', async ({ page }) => {
    await page.goto('/catalog/monopods?sort=popularity&dir=desc')

    const first = shown(page).first()

    expect(Number(await first.getAttribute('data-popularity'))).toBe(99)
  })
})
