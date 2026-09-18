import { expect, test, type Page } from '@playwright/test'

const shown = (page: Page) => page.locator('[data-product]:not([hidden])')

test.describe('Страницы, которых не было', () => {
  test('«Подробнее о нас» ведёт на страницу о магазине', async ({ page }) => {
    await page.goto('/')
    await page.locator('.more-details-us').click()

    await expect(page).toHaveURL(/\/about$/u)
    await expect(page.locator('h1')).toHaveText('О нас')
    await expect(page.locator('.about-figures')).toContainText('48 317')
  })

  test('логотип производителя ведёт на его страницу', async ({ page }) => {
    await page.goto('/')

    const logos = page.locator('.companie-logo-item a')

    await expect(logos).toHaveCount(4)
    await logos.first().click()

    await expect(page).toHaveURL(/\/brand\/dji$/u)
    await expect(page.locator('h1')).toHaveText('DJI')
  })

  test('страница производителя уводит в свой раздел', async ({ page }) => {
    await page.goto('/brand/gopro')

    await expect(page.locator('h1')).toHaveText('GoPro')
    await expect(page.locator('.brand-others a')).toHaveCount(4)

    await page.locator('.brand-button').click()

    await expect(page).toHaveURL(/\/catalog\/action-cameras$/u)
  })

  test('«Я забыл пароль» ведёт на восстановление', async ({ page }) => {
    await page.goto('/login')
    await page.locator('[data-login-page] .restore').click()

    await expect(page).toHaveURL(/\/restore$/u)
    await expect(page.locator('h1')).toHaveText('Восстановление пароля')
  })

  test('восстановление требует адрес и подтверждает приём', async ({
    page,
  }) => {
    await page.goto('/restore')

    const form = page.locator('[data-restore] form')

    await form.locator('button[type="submit"]').click()

    await expect(page.locator('[data-restore-error]')).toBeVisible()
    await expect(page.locator('[data-restore-done]')).toBeHidden()

    await form.locator('[data-field="email"]').fill('sv@example.com')
    await form.locator('button[type="submit"]').click()

    await expect(page.locator('[data-restore-done]')).toBeVisible()
    await expect(form).toBeHidden()
  })

  test('404 отвечает и уводит в каталог', async ({ page }) => {
    await page.goto('/404')

    await expect(page.locator('h1')).toHaveText('Страница не найдена')
    await expect(page.locator('.breadcrumbs')).toHaveCount(0)

    await page.locator('.lost-button').click()

    await expect(page).toHaveURL(/\/catalog$/u)
  })
})

test.describe('Поиск', () => {
  test('форма в шапке уводит на страницу поиска', async ({ page }) => {
    await page.goto('/')
    await page.locator('#user-search').fill('квадрокоптер')
    await page.locator('#user-search').press('Enter')

    await expect(page).toHaveURL(/\/search\?q=/u)
    await expect(page.locator('#user-search')).toHaveValue('квадрокоптер')
  })

  test('пустой запрос показывает подсказку, а не товары', async ({ page }) => {
    await page.goto('/search')

    await expect(page.locator('[data-search-idle]')).toBeVisible()
    await expect(page.locator('[data-search-found]')).toBeHidden()
    await expect(shown(page)).toHaveCount(0)
  })

  test('запрос находит товары и считает их', async ({ page }) => {
    await page.goto('/search?q=' + encodeURIComponent('палка'))

    await expect(shown(page)).toHaveCount(12)
    await expect(page.locator('[data-search-found]')).toHaveText(
      'Нашлось 12 товаров',
    )
    await expect(page.locator('[data-search-idle]')).toBeHidden()
  })

  test('регистр и склонение не мешают', async ({ page }) => {
    await page.goto('/search?q=' + encodeURIComponent('Водостойкий'))

    await expect(shown(page)).toHaveCount(3)
    await expect(page.locator('[data-search-found]')).toHaveText(
      'Нашлось 3 товара',
    )
  })

  test('ничего не нашлось — объясняется словами', async ({ page }) => {
    await page.goto('/search?q=' + encodeURIComponent('зарядка'))

    await expect(shown(page)).toHaveCount(0)
    await expect(page.locator('[data-search-empty]')).toBeVisible()
    await expect(page.locator('[data-search-echo]')).toHaveText('зарядка')
  })

  test('подсказка-пример сама ищет', async ({ page }) => {
    await page.goto('/search')
    await page.locator('.search-hints a').first().click()

    await expect(page).toHaveURL(/\/search\?q=/u)
    await expect(shown(page)).not.toHaveCount(0)
  })

  test('найденный товар кладётся в корзину', async ({ page }) => {
    await page.goto('/search?q=' + encodeURIComponent('гигантская'))

    const card = shown(page).first()

    await card.hover()
    await card.locator('[data-cart-add]').click()

    await expect(page.locator('.user-tools-cart')).toContainText('(1)')
  })
})

test.describe('Новый пароль', () => {
  test('ссылка без токена сразу объясняет, что не так', async ({ page }) => {
    await page.goto('/reset')

    await expect(page.locator('[data-reset-error]')).toContainText('токена')
  })

  test('короткий пароль не принимается', async ({ page }) => {
    await page.goto('/reset?token=mock-token')

    const form = page.locator('[data-reset-page] form')

    await form.locator('[data-field="password"]').fill('123')
    await form.locator('[data-field="repeat"]').fill('123')
    await form.locator('button[type="submit"]').click()

    await expect(page.locator('[data-reset-error]')).toContainText('восьми')
  })

  test('пароли должны совпасть', async ({ page }) => {
    await page.goto('/reset?token=mock-token')

    const form = page.locator('[data-reset-page] form')

    await form.locator('[data-field="password"]').fill('палка-палка-1')
    await form.locator('[data-field="repeat"]').fill('палка-палка-2')
    await form.locator('button[type="submit"]').click()

    await expect(page.locator('[data-reset-error]')).toContainText('не совпали')
  })

  test('годная ссылка меняет пароль', async ({ page }) => {
    await page.goto('/reset?token=mock-token')

    const form = page.locator('[data-reset-page] form')

    await form.locator('[data-field="password"]').fill('палка-палка-1')
    await form.locator('[data-field="repeat"]').fill('палка-палка-1')
    await form.locator('button[type="submit"]').click()

    await expect(page.locator('[data-reset-done]')).toBeVisible()
  })

  test('негодная ссылка объясняет отказ', async ({ page }) => {
    await page.goto('/reset?token=протухший')

    const form = page.locator('[data-reset-page] form')

    await form.locator('[data-field="password"]').fill('палка-палка-1')
    await form.locator('[data-field="repeat"]').fill('палка-палка-1')
    await form.locator('button[type="submit"]').click()

    await expect(page.locator('[data-reset-error]')).toContainText('Ссылка')
  })
})

test.describe('Магазин недоступен', () => {
  test('каталог отвечает 503 и объясняет словами', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: 'boom', value: '1', url: 'http://localhost:4331' },
    ])

    const response = await page.goto('/catalog/monopods')

    expect(response?.status()).toBe(503)
    expect(response?.headers()['retry-after']).toBe('30')
    await expect(page.locator('h1')).toHaveText('Магазин временно недоступен')
  })

  test('страницы без товаров переживают отказ', async ({ page, context }) => {
    await context.addCookies([
      { name: 'boom', value: '1', url: 'http://localhost:4331' },
    ])

    const response = await page.goto('/')

    expect(response?.status()).toBe(200)
    await expect(page.locator('.catalog-list')).toBeVisible()
  })
})

test.describe('Стойкость страниц', () => {
  test('слишком длинный запрос не роняет поиск', async ({ page }) => {
    const long = 'палка '.repeat(80)

    const response = await page.goto(`/search?q=${encodeURIComponent(long)}`)

    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Поиск по сайту')
  })
})
