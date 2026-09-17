import type { Page } from '@playwright/test'

export const addToCart = async (page: Page, slug: string): Promise<void> => {
  const card = page.locator(`[data-product="${slug}"]`)

  await card.hover()
  await card.locator('[data-cart-add]').click()
}

export const toggleCompare = async (
  page: Page,
  slug: string,
): Promise<void> => {
  const card = page.locator(`[data-product="${slug}"]`)

  await card.hover()
  await card.locator('[data-compare-add]').click()
}

export const signIn = async (page: Page, name: string): Promise<void> => {
  await page.locator('header [data-modal-open="login"]').click()

  const modal = page.locator('[data-modal="login"]')

  await modal.locator('[data-field="login"]').fill(name)
  await modal.locator('[data-field="password"]').fill('secret')
  await modal.locator('button[type="submit"]').click()
}
