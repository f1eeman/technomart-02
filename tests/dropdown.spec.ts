import { expect, test, type Page } from '@playwright/test'

const PANEL = '.site-navigation__catalog-shell'
const LINK = '.site-navigation__main-link'

const panel = (page: Page) => page.locator(PANEL)

const insetBottom = (clip: string): number => {
  const inner = /inset\(([^)]+)\)/u.exec(clip)?.[1]

  if (inner === undefined) return 0

  const parts = inner.trim().split(/\s+/u)
  const raw = parts.length >= 3 ? parts[2] : parts[0]

  return Number.parseFloat(raw ?? '0')
}

const watchTransitions = async (page: Page): Promise<void> => {
  await page.evaluate((selector) => {
    const node = document.querySelector(selector)

    if (node === null) return

    const seen: string[] = []

    Object.defineProperty(window, 'seenTransitions', {
      value: seen,
      configurable: true,
    })

    node.addEventListener('transitionstart', (event) => {
      seen.push((event as TransitionEvent).propertyName)
    })
  }, PANEL)

  await panel(page).evaluate(
    (node) =>
      new Promise((resolve) => {
        void getComputedStyle(node).clipPath
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve(null)
          })
        })
      }),
  )
}

const started = (page: Page): Promise<string[]> =>
  page.evaluate(
    () => (window as unknown as { seenTransitions: string[] }).seenTransitions,
  )

const clipOf = (page: Page): Promise<string> =>
  panel(page).evaluate((node) => getComputedStyle(node).clipPath)

test.describe('Плашка каталога', () => {
  test('в покое срезана целиком и спрятана', async ({ page }) => {
    await page.goto('/catalog/monopods')

    await expect(panel(page)).toBeHidden()
    expect(insetBottom(await clipOf(page))).toBe(100)
  })

  test('выдвигается переходом, а не возникает целиком', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await watchTransitions(page)
    await page.locator(LINK).hover()

    await expect.poll(() => started(page)).toContain('clip-path')
    await expect(panel(page)).toBeVisible()
    await expect.poll(async () => insetBottom(await clipOf(page))).toBe(0)
  })

  test('плита несёт тень, чтобы выдвижение было видно на жёлтом', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator(LINK).hover()

    const shadow = await page
      .locator('.site-navigation__catalog-list')
      .evaluate((node) => getComputedStyle(node).boxShadow)

    expect(shadow).not.toBe('none')
  })

  test('задвигается, когда курсор ушёл', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await page.locator(LINK).hover()

    await expect(panel(page)).toBeVisible()

    await page.locator('.page-title').hover()

    await expect(panel(page)).toBeHidden()
  })

  test('раскрывается с клавиатуры', async ({ page }) => {
    await page.goto('/catalog/monopods')
    await page.locator(LINK).focus()

    await expect(panel(page)).toBeVisible()
  })

  test('не накрывает страницу, пока закрыта', async ({ page }) => {
    await page.goto('/catalog/monopods')

    const under = await page.evaluate((selector) => {
      const node = document.querySelector(selector)

      if (node === null) return 'нет плашки'

      const box = node.getBoundingClientRect()
      const found = document.elementFromPoint(box.x + 40, box.bottom - 10)

      return found === null ? 'ничего' : found.className
    }, PANEL)

    expect(under).not.toContain('catalog-shell')
  })

  test('под reduce открывается без перехода', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/catalog/monopods')
    await watchTransitions(page)
    await page.locator(LINK).hover()

    await expect(panel(page)).toBeVisible()
    await expect.poll(async () => insetBottom(await clipOf(page))).toBe(0)
    expect(await started(page)).not.toContain('clip-path')
  })
})
