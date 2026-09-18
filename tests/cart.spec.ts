import { expect, test } from '@playwright/test'
import { addToCart, checkout, signUp } from './helpers'

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
    await signUp(page, 'Светлана Заказова')
    await page.goto('/catalog/monopods')
    await addToCart(page, 'pocket-selfie-stick')
    await page.goto('/cart')
    await checkout(page)

    await expect(page.locator('[data-cart-done]')).toBeVisible()
    await expect(page.locator('.user-tools-cart')).not.toContainText('(')

    await page.goto('/profile')

    await expect(page.locator('[data-orders] .order')).toHaveCount(1)
    await expect(page.locator('[data-orders]')).toContainText(
      'Карманная селфи-палка — 1 шт.',
    )
  })

  test('телефон набирается по цифре и уходит целиком', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await addToCart(page, 'amateur-selfie-stick')
    await page.goto('/cart')
    await page.locator('[data-cart-checkout]').click()

    const modal = page.locator('[data-modal="checkout"]')
    const phone = modal.locator('[data-field="phone"]')

    await modal.locator('[data-field="name"]').fill('Светлана Наборова')
    await phone.click()
    await phone.pressSequentially('9261234567')
    await expect(phone).toHaveValue('+7 926 123 45 67')

    const sent = page.waitForRequest(
      (request) =>
        request.url().includes('/api/orders') && request.method() === 'POST',
    )

    await modal.locator('button[type="submit"]').click()

    const body = (await sent).postDataJSON() as { phone: string }

    expect(body.phone).toBe('+79261234567')
    await expect(page.locator('[data-cart-done]')).toBeVisible()
  })

  test('заказ гостя в кабинет не попадает', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await addToCart(page, 'kids-selfie-stick')
    await page.goto('/cart')
    await checkout(page)

    await expect(page.locator('[data-cart-done]')).toBeVisible()

    await signUp(page, 'Светлана Гостева')

    await expect(page.locator('[data-orders] .order')).toHaveCount(0)
    await expect(page.locator('[data-orders-empty]')).toBeVisible()
  })

  test('новый заказ отменяется из кабинета', async ({ page }) => {
    await signUp(page, 'Светлана Отменова')
    await page.goto('/catalog/monopods')
    await addToCart(page, 'bluetooth-selfie-stick')
    await page.goto('/cart')
    await checkout(page)
    await page.goto('/profile')

    await page.locator('[data-order-cancel]').click()

    await expect(page.locator('[data-order-status]')).toHaveText('Отменён')
  })
})
