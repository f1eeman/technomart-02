import { expect, test } from '@playwright/test'
import { addToCart } from './helpers'

test.describe('Корзина', () => {
  test('товар из каталога доезжает до корзины', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await addToCart(page, 'amateur-selfie-stick')

    await expect(page.locator('.user-tools-cart')).toContainText('(1)')

    await page.goto('/cart')

    const rows = page.locator('[data-cart-row]:not([hidden])')

    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('Любительская селфи-палка')
    await expect(page.locator('[data-cart-total]')).toHaveText('500 руб.')
  })

  test('количество пересчитывает сумму', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await addToCart(page, 'amateur-selfie-stick')
    await page.goto('/cart')

    const row = page.locator('[data-cart-row="amateur-selfie-stick"]')

    await row.locator('[data-cart-step="1"]').click()
    await row.locator('[data-cart-step="1"]').click()

    await expect(row.locator('[data-cart-amount]')).toHaveValue('3')
    await expect(page.locator('[data-cart-total]')).toHaveText('1 500 руб.')
  })

  test('удаление опустошает корзину', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await addToCart(page, 'amateur-selfie-stick')
    await page.goto('/cart')

    await page
      .locator('[data-cart-row="amateur-selfie-stick"] [data-cart-remove]')
      .click()

    await expect(page.locator('[data-cart-empty]')).toBeVisible()
    await expect(page.locator('[data-cart-filled]')).toBeHidden()
  })

  test('карточка товара тоже кладёт в корзину', async ({ page }) => {
    await page.goto('/product/giant-selfie-stick')
    await page.locator('[data-cart-add]').click()

    await expect(page.locator('.user-tools-cart')).toContainText('(1)')

    await page.goto('/cart')

    await expect(page.locator('[data-cart-total]')).toHaveText('8 900 руб.')
  })

  test('заказ уходит в историю профиля', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await addToCart(page, 'pocket-selfie-stick')
    await page.goto('/cart')
    await page.locator('[data-cart-checkout]').click()

    await expect(page.locator('[data-cart-done]')).toBeVisible()
    await expect(page.locator('.user-tools-cart')).not.toContainText('(')

    await page.goto('/login')

    const form = page.locator('[data-login-page] form')

    await form.locator('[data-field="login"]').fill('Светлана Дурова')
    await form.locator('[data-field="password"]').fill('secret')
    await form.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/profile/u)
    await expect(page.locator('[data-orders] .order')).toHaveCount(1)
    await expect(page.locator('[data-orders]')).toContainText(
      'Карманная селфи-палка — 1 шт.',
    )
  })
})
