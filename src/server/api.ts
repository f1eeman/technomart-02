import { API_BASE } from 'astro:env/server'

import { createApi, type Api, type Cart, type Me } from '@/scripts/api'

const headersOf = (request: Request): HeadersInit | undefined => {
  const cookie = request.headers.get('cookie')

  return cookie === null ? undefined : { cookie }
}

const EMPTY: Cart = { items: [], count: 0, total: 0 }

export const apiFor = (request: Request): Api =>
  createApi(API_BASE, headersOf(request))

export const cartOf = async (request: Request): Promise<Cart> =>
  apiFor(request)
    .cart()
    .catch(() => EMPTY)

export const meOf = async (request: Request): Promise<Me> =>
  apiFor(request)
    .me()
    .catch(() => null)

export const logoutOn = async (
  request: Request,
  headers: Headers,
): Promise<void> => {
  const cookie = request.headers.get('cookie')

  const answer = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    ...(cookie === null ? {} : { headers: { cookie } }),
  }).catch(() => null)

  if (answer === null) return

  for (const value of answer.headers.getSetCookie())
    headers.append('set-cookie', value)
}
