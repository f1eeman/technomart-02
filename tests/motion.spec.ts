import { expect, test, type Page } from '@playwright/test'
import { addToCart } from './helpers'

const flying = (page: Page) => page.locator('body > img[aria-hidden="true"]')

const ghosts = (page: Page) => page.locator('[data-catalog-ghosts] > *')

test.describe('Движение', () => {
  test('товар улетает в корзину', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await addToCart(page, 'amateur-selfie-stick')

    await expect(flying(page)).toHaveCount(1)
    await expect(flying(page)).toHaveCount(0, { timeout: 2000 })
  })

  test('счётчик шапки отзывается на добавление', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await addToCart(page, 'amateur-selfie-stick')

    await expect(page.locator('.user-tools-cart')).toHaveAttribute(
      'data-bump',
      'up',
      { timeout: 2000 },
    )
  })

  test('отсеянные карточки оставляют призраков', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await page.locator('label[for="filter-pink-color"]').click()

    await expect(ghosts(page)).not.toHaveCount(0)
    await expect(ghosts(page)).toHaveCount(0, { timeout: 2000 })
  })

  test('призрак не считается товаром', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await page.locator('label[for="filter-pink-color"]').click()

    await expect(page.locator('[data-product]:not([hidden])')).toHaveCount(3)
    await expect(ghosts(page).locator('[data-product]')).toHaveCount(0)
    await expect(ghosts(page).locator('[data-cart-add]')).toHaveCount(0)
  })

  test('переполненное сравнение отвечает отказом', async ({ page }) => {
    await page.goto('/catalog/monopods')

    await page.addInitScript(() => {
      localStorage.setItem(
        'compare',
        JSON.stringify({
          'amateur-selfie-stick': 1,
          'kids-selfie-stick': 1,
          'pocket-selfie-stick': 1,
          'bluetooth-selfie-stick': 1,
        }),
      )
    })
    await page.goto('/catalog/monopods?colors=blue')

    const card = page.locator('[data-product="winter-selfie-stick"]')

    await card.hover()
    await card.locator('[data-compare-add]').click()

    await expect(card.locator('[data-compare-add]')).toHaveAttribute(
      'data-full',
      'on',
    )
    await expect(page.locator('.user-tools-compare')).toContainText('(4)')
  })
})

test.describe('Движение под prefers-reduced-motion', () => {
  test('ничего не летит и не оставляет призраков', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/catalog/monopods')
    await addToCart(page, 'amateur-selfie-stick')

    await expect(flying(page)).toHaveCount(0)
    await expect(page.locator('.user-tools-cart')).toContainText('(1)')
    await expect(page.locator('.user-tools-cart')).not.toHaveAttribute(
      'data-bump',
      /.*/u,
    )

    await page.locator('label[for="filter-pink-color"]').click()

    await expect(ghosts(page)).toHaveCount(0)
    await expect(page.locator('[data-product]:not([hidden])')).toHaveCount(3)
  })

  test('корзина считает и удаляет без задержки', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/catalog/monopods')
    await addToCart(page, 'amateur-selfie-stick')
    await page.goto('/cart')

    const row = page.locator('[data-cart-row="amateur-selfie-stick"]')

    await row.locator('[data-cart-step="1"]').click()

    await expect(page.locator('[data-cart-total]')).toHaveText('1 000 руб.')

    await row.locator('[data-cart-remove]').click()

    await expect(row).toBeHidden()
    await expect(page.locator('[data-cart-empty]')).toBeVisible()
  })
})
