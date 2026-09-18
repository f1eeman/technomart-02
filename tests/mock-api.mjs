import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const PAGE_SIZE = 4
const PORT = Number(process.env.MOCK_API_PORT ?? 3999)

const products = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('fixtures/catalog.json', import.meta.url)),
    'utf8',
  ),
)

const CATEGORIES = [
  'virtual-reality',
  'monopods',
  'action-cameras',
  'fitness-bracelets',
  'smart-watches',
  'quadcopters',
]

const normalize = (text) =>
  text.toLowerCase().replaceAll('ё', 'е').replace(/\s+/gu, ' ').trim()

const searchTextOf = (product) =>
  normalize(
    [
      product.title,
      product.description,
      product.kind,
      product.categorySlug,
      ...product.specs.map((spec) => `${spec.label} ${spec.value}`),
    ].join(' '),
  )

const carts = new Map()
const orders = []
const users = new Map()
const signed = new Map()

const keyFrom = (request) => {
  const header = request.headers.cookie ?? ''

  for (const pair of header.split(';')) {
    const at = pair.indexOf('=')

    if (at > 0 && pair.slice(0, at).trim() === 'sid')
      return pair.slice(at + 1).trim()
  }

  return null
}

const cartView = (lines) => {
  const items = [...lines.entries()].map(([slug, quantity]) => {
    const product = products.find((one) => one.slug === slug)

    return {
      slug,
      title: product.title,
      imagePath: product.imagePath,
      price: product.price,
      quantity,
      sum: product.price * quantity,
    }
  })

  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.sum, 0),
  }
}

const readBody = async (request) => {
  const chunks = []

  for await (const chunk of request) chunks.push(chunk)

  if (chunks.length === 0) return {}

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

const send = (response, status, body) => {
  const payload = JSON.stringify(body)

  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  })
  response.end(payload)
}

const fail = (response, status, code, message) =>
  send(response, status, { error: { code, message } })

const pageOf = (params) => {
  const category = params.get('category') ?? ''
  const min = Number(params.get('min') ?? Number.NEGATIVE_INFINITY)
  const max = Number(params.get('max') ?? Number.POSITIVE_INFINITY)
  const colors = (params.get('colors') ?? '').split(',').filter(Boolean)
  const bt = params.get('bt') ?? 'any'
  const sort = params.get('sort') ?? 'price'
  const dir = params.get('dir') === 'desc' ? 'desc' : 'asc'
  const page = Math.max(Number(params.get('page') ?? 1), 1)
  const sign = dir === 'asc' ? 1 : -1

  const found = products
    .filter((product) => product.categorySlug === category)
    .filter((product) => product.price >= min && product.price <= max)
    .filter((product) => colors.length === 0 || colors.includes(product.color))
    .filter(
      (product) => bt === 'any' || (product.bluetooth ? 'yes' : 'no') === bt,
    )
    .sort((a, b) => {
      if (sort === 'kind') return a.kind.localeCompare(b.kind, 'ru') * sign

      if (sort === 'popularity') return (a.popularity - b.popularity) * sign

      return (a.price - b.price) * sign
    })

  const totalPages = Math.max(Math.ceil(found.length / PAGE_SIZE), 1)
  const from = (page - 1) * PAGE_SIZE

  return {
    items: found.slice(from, from + PAGE_SIZE),
    page,
    pageSize: PAGE_SIZE,
    total: found.length,
    totalPages,
    isLast: page >= totalPages,
  }
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${String(PORT)}`)
  const path = url.pathname

  // Спека про «магазин недоступен» просит мок прикинуться сломанным: держать
  // рядом настоящий погашенный API ради одного случая дороже, чем эта строка.
  if ((request.headers.cookie ?? '').includes('boom=1'))
    return fail(response, 500, 'internal_error', 'Сломалось нарочно')

  if (path === '/api/orders' || path.startsWith('/api/orders/')) {
    const key = keyFrom(request)
    const user = signed.get(key ?? '') ?? null

    if (path === '/api/orders' && request.method === 'GET') {
      if (user === null)
        return fail(
          response,
          401,
          'unauthorized',
          'Сюда пускают только вошедших',
        )

      return send(response, 200, {
        items: orders.filter((one) => one.userId === user.id),
      })
    }

    return void readBody(request).then((body) => {
      if (path === '/api/orders' && request.method === 'POST') {
        const lines = carts.get(key ?? '') ?? new Map()

        if (lines.size === 0)
          return fail(response, 409, 'conflict', 'Корзина пуста')

        const name = String(body.name ?? '').trim()
        const phone = String(body.phone ?? '').replace(/\D/gu, '')

        if (name.length === 0 || phone.length < 11)
          return fail(response, 400, 'bad_request', 'Запрос не разбирается')

        const items = [...lines.entries()].map(([slug, quantity]) => {
          const product = products.find((one) => one.slug === slug)

          return {
            slug,
            title: product.title,
            price: product.price,
            quantity,
            sum: product.price * quantity,
          }
        })

        const total = items.reduce((sum, item) => sum + item.sum, 0)

        if (body.expected !== undefined && Number(body.expected) !== total)
          return fail(response, 409, 'conflict', 'Состав корзины изменился')

        const order = {
          number: orders.length + 1,
          at: new Date().toISOString(),
          name,
          phone,
          total,
          status: 'fresh',
          items,
          userId: user?.id ?? null,
        }

        orders.unshift(order)
        lines.clear()

        return send(response, 201, order)
      }

      const number = Number(path.split('/')[3] ?? '')
      const order = orders.find((one) => one.number === number)

      if (user === null)
        return fail(
          response,
          401,
          'unauthorized',
          'Сюда пускают только вошедших',
        )

      if (order === undefined || order.userId !== user.id)
        return fail(response, 404, 'not_found', 'Такого заказа нет')

      if (order.status !== 'fresh')
        return fail(response, 422, 'unprocessable', 'Заказ уже в работе')

      order.status = 'cancelled'

      return send(response, 200, order)
    })
  }

  if (path.startsWith('/api/auth/')) {
    const key = keyFrom(request)

    if (path === '/api/auth/me')
      return send(response, 200, signed.get(key ?? '') ?? null)

    return void readBody(request).then((body) => {
      if (path === '/api/auth/restore') {
        response.writeHead(204)

        return response.end()
      }

      if (path === '/api/auth/reset') {
        const token = String(body.token ?? '')
        const password = String(body.password ?? '')

        if (password.length < 8)
          return fail(response, 400, 'bad_request', 'Запрос не разбирается')

        if (token !== 'mock-token')
          return fail(
            response,
            422,
            'unprocessable',
            'Ссылка не работает — попросите новую',
          )

        response.writeHead(204)

        return response.end()
      }

      if (path === '/api/auth/logout') {
        if (key !== null) signed.delete(key)

        response.writeHead(204, {
          'Set-Cookie': 'sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
        })

        return response.end()
      }

      const email = String(body.email ?? '')
        .trim()
        .toLowerCase()
      const password = String(body.password ?? '')
      const fresh = `mock-${randomUUID()}`

      const enter = (user) => {
        const lines = carts.get(key ?? '') ?? new Map()

        carts.set(fresh, lines)
        signed.set(fresh, user)
        response.setHeader(
          'Set-Cookie',
          `sid=${fresh}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        )
      }

      if (path === '/api/auth/register') {
        if (users.has(email))
          return fail(response, 409, 'conflict', 'Такой адрес уже занят')

        if (password.length < 8)
          return fail(response, 400, 'bad_request', 'Запрос не разбирается')

        const user = {
          id: fresh,
          email,
          name: String(body.name ?? '').trim(),
          phone: null,
        }

        users.set(email, { ...user, password })
        enter(user)

        return send(response, 201, user)
      }

      if (path === '/api/auth/login') {
        const known = users.get(email)

        if (known === undefined || known.password !== password)
          return fail(
            response,
            401,
            'unauthorized',
            'Неверная почта или пароль',
          )

        const user = {
          id: known.id,
          email: known.email,
          name: known.name,
          phone: null,
        }

        enter(user)

        return send(response, 200, user)
      }

      return fail(response, 404, 'not_found', `Адрес ${path} не обслуживается`)
    })
  }

  if (path === '/api/cart' || path.startsWith('/api/cart/')) {
    const known = keyFrom(request)
    const key = known ?? `mock-${randomUUID()}`

    if (known === null && request.method !== 'GET')
      response.setHeader(
        'Set-Cookie',
        `sid=${key}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
      )

    if (!carts.has(key)) carts.set(key, new Map())

    const lines = carts.get(key)
    const slug = decodeURIComponent(path.replace('/api/cart/items/', ''))

    const answer = () => send(response, 200, cartView(lines))

    if (path === '/api/cart' && request.method === 'GET') return answer()

    if (path === '/api/cart' && request.method === 'DELETE') {
      lines.clear()

      return answer()
    }

    return void readBody(request).then((body) => {
      if (path === '/api/cart/items' && request.method === 'POST') {
        const asked = String(body.slug ?? '')

        if (!products.some((one) => one.slug === asked))
          return fail(response, 404, 'not_found', `Товара «${asked}» нет`)

        const amount = Number(body.quantity ?? 1)

        if (!Number.isInteger(amount) || amount < 1 || amount > 99)
          return fail(response, 400, 'bad_request', 'Запрос не разбирается')

        lines.set(asked, Math.min((lines.get(asked) ?? 0) + amount, 99))

        return answer()
      }

      if (request.method === 'PATCH') {
        const amount = Number(body.quantity ?? 0)

        if (amount <= 0) lines.delete(slug)
        else lines.set(slug, Math.min(amount, 99))

        return answer()
      }

      if (request.method === 'DELETE') {
        lines.delete(slug)

        return answer()
      }

      return fail(response, 404, 'not_found', `Адрес ${path} не обслуживается`)
    })
  }

  if (path === '/api/health')
    return send(response, 200, { status: 'ok', uptime: 0, database: 'ok' })

  if (path === '/api/products/all')
    return send(response, 200, { items: products, total: products.length })

  if (path === '/api/categories')
    return send(response, 200, {
      items: CATEGORIES.map((slug) => {
        const inside = products.filter(
          (product) => product.categorySlug === slug,
        )
        const prices = inside.map((product) => product.price)

        return {
          slug,
          total: inside.length,
          priceMin: prices.length === 0 ? 0 : Math.min(...prices),
          priceMax: prices.length === 0 ? 0 : Math.max(...prices),
        }
      }),
    })

  const range = /^\/api\/categories\/([^/]+)\/price-range$/u.exec(path)

  if (range !== null) {
    const slug = range[1]

    if (!CATEGORIES.includes(slug))
      return fail(response, 404, 'not_found', `Раздела «${slug}» нет`)

    const prices = products
      .filter((product) => product.categorySlug === slug)
      .map((product) => product.price)

    return send(response, 200, {
      min: Math.min(...prices),
      max: Math.max(...prices),
    })
  }

  if (path === '/api/search') {
    const query = url.searchParams.get('q') ?? ''
    const words = normalize(query).split(' ').filter(Boolean)
    const items =
      words.length === 0
        ? []
        : products.filter((product) =>
            words.every((word) => searchTextOf(product).includes(word)),
          )

    return send(response, 200, { query, items, total: items.length })
  }

  if (path === '/api/products') {
    const category = url.searchParams.get('category') ?? ''

    if (!CATEGORIES.includes(category))
      return fail(response, 404, 'not_found', `Раздела «${category}» нет`)

    return send(response, 200, pageOf(url.searchParams))
  }

  const one = /^\/api\/products\/([^/]+)$/u.exec(path)

  if (one !== null) {
    const product = products.find((item) => item.slug === one[1])

    return product === undefined
      ? fail(response, 404, 'not_found', `Товара «${one[1]}» нет`)
      : send(response, 200, product)
  }

  if (path.startsWith('/uploads/')) {
    response.writeHead(200, { 'Content-Type': 'image/jpeg' })

    return response.end()
  }

  return fail(response, 404, 'not_found', `Адрес ${path} не обслуживается`)
})

server.listen(PORT, () => {
  console.log(`Мок каталога слушает http://localhost:${String(PORT)}`)
})
