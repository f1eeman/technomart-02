import type { paths } from '@/types/api'

type Json<T> = T extends { content: { 'application/json': infer B } }
  ? B
  : never

type Get<P extends keyof paths> = paths[P] extends { get: infer G } ? G : never

type Ok<P extends keyof paths> =
  Get<P> extends { responses: { 200: infer R } } ? Json<R> : never

type Query<P extends keyof paths> =
  Get<P> extends { parameters: { query?: infer Q } } ? NonNullable<Q> : never

export type ProductsQuery = Query<'/api/products'>

export type ProductsPage = Ok<'/api/products'>

export type PriceRange = Ok<'/api/categories/{slug}/price-range'>

export type SearchResult = Ok<'/api/search'>

export type Catalog = Ok<'/api/products/all'>

export type Cart = Ok<'/api/cart'>

export type CartLine = Cart['items'][number]

export type Me = Ok<'/api/auth/me'>

export type Order = Extract<
  paths['/api/orders']['post']['responses'][201]['content']['application/json'],
  { number: number }
>

export type Orders = Ok<'/api/orders'>

type Body<P extends keyof paths> = paths[P] extends {
  post: { requestBody: { content: { 'application/json': infer B } } }
}
  ? B
  : never

type PatchBody<P extends keyof paths> = paths[P] extends {
  patch: { requestBody: { content: { 'application/json': infer B } } }
}
  ? B
  : never

export type PlaceOrderBody = Body<'/api/orders'>

export type LoginBody = Body<'/api/auth/login'>

export type RegisterBody = Body<'/api/auth/register'>

export type ResetBody = Body<'/api/auth/reset'>

export type PutItemBody = Body<'/api/cart/items'>

export type QuantityBody = PatchBody<'/api/cart/items/{slug}'>

export type Signed = Extract<
  paths['/api/auth/login']['post']['responses'][200]['content']['application/json'],
  { id: string }
>

export type Categories = Ok<'/api/categories'>

export type Product = ProductsPage['items'][number]

export type CategorySlug = ProductsQuery['category']

export type Bluetooth = NonNullable<ProductsQuery['bt']>

export type SortField = NonNullable<ProductsQuery['sort']>

export type SortDir = NonNullable<ProductsQuery['dir']>

export interface ApiFailure {
  status: number
  code: string
  message: string
}

const isFailure = (value: unknown): value is { error: ApiFailure } => {
  if (typeof value !== 'object' || value === null || !('error' in value))
    return false

  const { error } = value

  return typeof error === 'object' && error !== null && 'message' in error
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const ask = async <T>(
  url: string,
  init?: RequestInit,
  always?: HeadersInit,
): Promise<T> => {
  const headers = new Headers(always)

  for (const [name, value] of new Headers(init?.headers))
    headers.set(name, value)

  const response = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers,
  })

  const body: unknown = await response
    .clone()
    .json()
    .catch(() => null)

  if (response.ok) return body as T

  if (isFailure(body))
    throw new ApiError(response.status, body.error.code, body.error.message)

  throw new ApiError(response.status, 'internal_error', 'Магазин не отвечает')
}

const search = (query: Record<string, string | number | undefined>): string => {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))

  return params.toString()
}

export const createApi = (base: string, always?: HeadersInit) => ({
  products: async (
    query: ProductsQuery,
    init?: RequestInit,
  ): Promise<ProductsPage> =>
    ask<ProductsPage>(`${base}/api/products?${search(query)}`, init, always),

  priceRange: async (slug: string, init?: RequestInit): Promise<PriceRange> =>
    ask<PriceRange>(`${base}/api/categories/${slug}/price-range`, init, always),

  search: async (query: string, init?: RequestInit): Promise<SearchResult> =>
    ask<SearchResult>(
      `${base}/api/search?${search({ q: query })}`,
      init,
      always,
    ),

  all: async (init?: RequestInit): Promise<Catalog> =>
    ask<Catalog>(`${base}/api/products/all`, init, always),

  bySlug: async (slug: string, init?: RequestInit): Promise<Product> =>
    ask<Product>(`${base}/api/products/${slug}`, init, always),

  categories: async (init?: RequestInit): Promise<Categories> =>
    ask<Categories>(`${base}/api/categories`, init, always),

  cart: async (init?: RequestInit): Promise<Cart> =>
    ask<Cart>(`${base}/api/cart`, init, always),

  addToCart: async (slug: string, quantity = 1): Promise<Cart> => {
    const body: PutItemBody = { slug, quantity }

    return ask<Cart>(`${base}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },

  setQuantity: async (slug: string, quantity: number): Promise<Cart> => {
    const body: QuantityBody = { quantity }

    return ask<Cart>(`${base}/api/cart/items/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },

  dropFromCart: async (slug: string): Promise<Cart> =>
    ask<Cart>(`${base}/api/cart/items/${slug}`, { method: 'DELETE' }),

  clearCart: async (): Promise<Cart> =>
    ask<Cart>(`${base}/api/cart`, { method: 'DELETE' }),

  me: async (init?: RequestInit): Promise<Me> =>
    ask<Me>(`${base}/api/auth/me`, init, always),

  register: async (body: RegisterBody): Promise<Signed> =>
    ask<Signed>(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  login: async (body: LoginBody): Promise<Signed> =>
    ask<Signed>(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  placeOrder: async (body: PlaceOrderBody): Promise<Order> =>
    ask<Order>(`${base}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  orders: async (init?: RequestInit): Promise<Orders> =>
    ask<Orders>(`${base}/api/orders`, init, always),

  cancelOrder: async (number: number): Promise<Order> =>
    ask<Order>(`${base}/api/orders/${String(number)}/cancel`, {
      method: 'POST',
    }),

  askReset: async (email: string): Promise<void> => {
    await fetch(`${base}/api/auth/restore`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  },

  applyReset: async (token: string, password: string): Promise<void> => {
    const body: ResetBody = { token, password }

    const response = await fetch(`${base}/api/auth/reset`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) return

    const answer: unknown = await response.json().catch(() => null)

    throw new ApiError(
      response.status,
      isFailure(answer) ? answer.error.code : 'internal_error',
      isFailure(answer) ? answer.error.message : 'Ссылка не сработала',
    )
  },

  logout: async (): Promise<void> => {
    await fetch(`${base}/api/auth/logout`, {
      method: 'POST',
      credentials: 'same-origin',
    })
  },
})

export type Api = ReturnType<typeof createApi>
