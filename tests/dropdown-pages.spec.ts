import { expect, test } from '@playwright/test'

const PAGES = [
  '/',
  '/catalog',
  '/catalog/monopods',
  '/product/giant-selfie-stick',
  '/cart',
  '/compare',
  '/profile',
  '/login',
  '/logout',
]

for (const path of PAGES)
  test(`плашка выдвигается на ${path}`, async ({ page }) => {
    await page.goto(path)

    const panel = page.locator('.site-navigation__catalog-shell')

    await expect(panel).toBeHidden()

    const shut = await panel.evaluate((node) => getComputedStyle(node).clipPath)

    expect(shut).toContain('100%')

    await page.locator('.site-navigation__main-link').hover()

    await expect(panel).toBeVisible()

    const open = await panel.evaluate((node) => ({
      clip: getComputedStyle(node).clipPath,
      shadow: getComputedStyle(
        node.querySelector('.site-navigation__catalog-list') as Element,
      ).boxShadow,
      underLink: (() => {
        const link = document.querySelector('.site-navigation__main-link')

        return link === null
          ? -1
          : Math.round(
              node.getBoundingClientRect().top -
                link.getBoundingClientRect().bottom,
            )
      })(),
    }))

    expect(open.clip).not.toContain('100%')
    expect(open.shadow).not.toBe('none')
    expect(open.underLink).toBe(0)
  })
