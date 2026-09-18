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

export const PASSWORD = 'палка-палка-1'

let counter = 0

export const freshEmail = (): string => {
  counter += 1

  return `user-${String(process.pid)}-${String(counter)}-${String(
    Math.floor(Math.random() * 100000),
  )}@device.example`
}

export const signUp = async (
  page: Page,
  name: string,
  email = freshEmail(),
): Promise<string> => {
  await page.goto('/register')

  const form = page.locator('[data-register-page] form')

  await form.locator('[data-field="email"]').fill(email)
  await form.locator('[data-field="name"]').fill(name)
  await form.locator('[data-field="password"]').fill(PASSWORD)
  await form.locator('[data-field="repeat"]').fill(PASSWORD)
  await form.locator('button[type="submit"]').click()
  await page.waitForURL(/\/profile/u)

  return email
}

export const signIn = async (page: Page, email: string): Promise<void> => {
  await page.locator('header [data-modal-open="login"]').click()

  const modal = page.locator('[data-modal="login"]')

  await modal.locator('[data-field="login"]').fill(email)
  await modal.locator('[data-field="password"]').fill(PASSWORD)
  await modal.locator('button[type="submit"]').click()
}

export const checkout = async (
  page: Page,
  name = 'Светлана Дурова',
  phone = '9260000000',
): Promise<void> => {
  await page.locator('[data-cart-checkout]').click()

  const modal = page.locator('[data-modal="checkout"]')

  await modal.locator('[data-field="name"]').fill(name)
  await modal.locator('[data-field="phone"]').fill(phone)
  await modal.locator('button[type="submit"]').click()
}
