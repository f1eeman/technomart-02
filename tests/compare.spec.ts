import { expect, test } from '@playwright/test'
import { toggleCompare } from './helpers'

test.describe('Сравнение', () => {
  test('пустое состояние объясняет, что делать', async ({ page }) => {
    await page.goto('/compare')

    await expect(page.locator('[data-compare-empty]')).toBeVisible()
    await expect(page.locator('[data-compare-table]')).toBeHidden()
  })

  test('две позиции встают колонками', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await toggleCompare(page, 'amateur-selfie-stick')
    await toggleCompare(page, 'kids-selfie-stick')

    await expect(page.locator('.user-tools-compare')).toContainText('(2)')

    await page.goto('/compare')

    await expect(page.locator('[data-compare-table]')).toBeVisible()
    await expect(
      page.locator('th[data-compare-cell]:not([hidden])'),
    ).toHaveCount(2)
    await expect(page.locator('[data-compare-table]')).toContainText(
      'Любительская селфи-палка',
    )
  })

  test('кнопка переключается и убирает позицию', async ({ page }) => {
    await page.goto('/catalog/monopods')

    const card = page.locator('[data-product="amateur-selfie-stick"]')
    const button = card.locator('[data-compare-add]')

    await toggleCompare(page, 'amateur-selfie-stick')

    await expect(button).toHaveText('Убрать из сравнения')
    await expect(button).toHaveAttribute('aria-pressed', 'true')

    await toggleCompare(page, 'amateur-selfie-stick')

    await expect(button).toHaveText('Добавить к сравнению')
    await expect(page.locator('.user-tools-compare')).not.toContainText('(')
  })

  test('крестик в таблице убирает колонку', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await toggleCompare(page, 'amateur-selfie-stick')
    await page.goto('/compare')

    await page
      .locator('[data-compare-remove="amateur-selfie-stick"]')
      .first()
      .click()

    await expect(page.locator('[data-compare-empty]')).toBeVisible()
  })
})
