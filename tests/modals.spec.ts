import { expect, test } from '@playwright/test'
import { signIn } from './helpers'

test.describe('Модалки', () => {
  test('вход открывается, пустую форму трясёт', async ({ page }) => {
    await page.goto('/')

    const modal = page.locator('[data-modal="login"]')

    await expect(modal).toBeHidden()

    await page.locator('header [data-modal-open="login"]').click()

    await expect(modal).toBeVisible()
    await expect(page.locator('[data-modal-overlay]')).toBeVisible()

    await modal.locator('button[type="submit"]').click()

    await expect(modal).toHaveClass(/modal-error/u)
    await expect(modal).toBeVisible()
  })

  test('вход меняет шапку и запоминает имя', async ({ page }) => {
    await page.goto('/')
    await signIn(page, 'Светлана Дурова')

    await expect(page.locator('[data-modal="login"]')).toBeHidden()
    await expect(page.locator('body')).toHaveAttribute('data-session', 'member')
    await expect(page.locator('.name-link')).toHaveText('Светлана Дурова')

    await page.goto('/catalog')

    await expect(page.locator('.name-link')).toHaveText('Светлана Дурова')
  })

  test('Esc закрывает модалку', async ({ page }) => {
    await page.goto('/')
    await page.locator('header [data-modal-open="login"]').click()

    const modal = page.locator('[data-modal="login"]')

    await expect(modal).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(modal).toBeHidden()
    await expect(page.locator('[data-modal-overlay]')).toBeHidden()
  })

  test('письмо валидируется и подтверждается', async ({ page }) => {
    await page.goto('/')

    const modal = page.locator('[data-modal="write-us"]')

    await page.locator('[data-modal-open="write-us"]').click()

    await expect(modal).toBeVisible()

    await modal.locator('button[type="submit"]').click()

    await expect(modal).toHaveClass(/modal-error/u)

    await modal.locator('[data-field="name"]').fill('Светлана')
    await modal.locator('[data-field="email"]').fill('sv@example.com')
    await modal.locator('[data-field="text"]').fill('Где мой квадрокоптер?')
    await modal.locator('button[type="submit"]').click()

    await expect(modal.locator('[data-write-done]')).toBeVisible()
    await expect(modal.locator('form')).toBeHidden()
  })

  test('карта открывается своей анимацией', async ({ page }) => {
    await page.goto('/')

    const modal = page.locator('[data-modal="map"]')

    await page.locator('[data-modal-open="map"]').click()

    await expect(modal).toBeVisible()
    await expect(modal).toHaveClass(/modal-show-map/u)
  })

  test('выход возвращает гостя', async ({ page }) => {
    await page.goto('/')
    await signIn(page, 'Светлана Дурова')
    await page.goto('/logout')

    await expect(page.locator('body')).toHaveAttribute('data-session', 'guest')
    await expect(page.locator('.login-link')).toBeVisible()
  })
})
