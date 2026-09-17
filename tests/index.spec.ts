import { expect, test } from '@playwright/test'

test.describe('Главная', () => {
  test('переключатели меняют слайд', async ({ page }) => {
    await page.goto('/')

    const slides = page.locator('[data-slide]')
    const dots = page.locator('[data-slide-to]')

    await expect(slides).toHaveCount(3)
    await expect(dots).toHaveCount(3)
    await expect(slides.nth(0)).toBeVisible()
    await expect(slides.nth(2)).toBeHidden()

    await dots.nth(2).click()

    await expect(slides.nth(2)).toBeVisible()
    await expect(slides.nth(0)).toBeHidden()
    await expect(dots.nth(2)).toHaveAttribute('aria-pressed', 'true')
  })

  test('вкладки сервисов открывают свою панель', async ({ page }) => {
    await page.goto('/')

    const panels = page.locator('[data-panel]')

    await expect(panels).toHaveCount(3)
    await expect(page.locator('[data-panel="warranty"]')).toBeVisible()

    await page.locator('[data-tab="credit"]').click()

    await expect(page.locator('[data-panel="credit"]')).toBeVisible()
    await expect(page.locator('[data-panel="warranty"]')).toBeHidden()
    expect(page.url()).toContain('#service-credit')
  })

  test('якорь из шапки открывает нужную вкладку', async ({ page }) => {
    await page.goto('/#service-delivery')

    await expect(page.locator('[data-panel="delivery"]')).toBeVisible()
    await expect(page.locator('[data-panel="warranty"]')).toBeHidden()
  })

  test('плитки каталога ведут в разделы', async ({ page }) => {
    await page.goto('/')

    const tiles = page.locator('.catalog-item a')

    await expect(tiles).toHaveCount(6)
    await tiles.nth(1).click()

    await expect(page).toHaveURL(/\/catalog\/monopods$/u)
    await expect(page.locator('h1')).toHaveText('Моноподы для селфи')
  })
})
