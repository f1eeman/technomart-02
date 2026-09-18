import { API_BASE } from 'astro:env/server'
import type { MiddlewareHandler } from 'astro'

import { ApiError } from '@/scripts/api'

const DOWN = '/503'

const PROXIED = ['/api/', '/uploads/']

const PERSONAL = ['/cart', '/compare', '/profile', '/login', '/register']

const unreachable = (error: unknown): boolean => {
  if (error instanceof ApiError) return error.status >= 500

  if (!(error instanceof Error)) return false

  const cause = error.cause

  return (
    error.name === 'TypeError' &&
    (error.message.includes('fetch failed') ||
      (cause instanceof Error && cause.message.length > 0))
  )
}

const refused = (message: string, status: number): Response =>
  new Response(
    JSON.stringify({ error: { code: 'service_unavailable', message } }),
    {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    },
  )

const proxy = async (request: Request, path: string): Promise<Response> => {
  const target = new URL(path + new URL(request.url).search, API_BASE)

  const headers = new Headers(request.headers)

  headers.delete('host')
  headers.delete('content-length')
  headers.delete('accept-encoding')

  const answer = await fetch(target, {
    method: request.method,
    headers,
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? null
        : request.body,
    redirect: 'manual',
    signal: request.signal,
    // @ts-expect-error duplex требуется Node при теле запроса, в типах его нет
    duplex: 'half',
  }).catch(() => null)

  if (answer === null) return refused('Магазин не отвечает', 502)

  const back = new Headers(answer.headers)

  back.delete('content-encoding')
  back.delete('content-length')

  if (path.startsWith('/api/')) back.set('Cache-Control', 'private, no-store')

  return new Response(answer.body, { status: answer.status, headers: back })
}

const personal = (path: string): boolean =>
  PERSONAL.some((one) => path === one || path.startsWith(`${one}/`))

export const onRequest: MiddlewareHandler = async (context, next) => {
  const path = context.url.pathname

  if (PROXIED.some((prefix) => path.startsWith(prefix)))
    return proxy(context.request, path)

  try {
    const response = await next()

    if (response.headers.get('content-type')?.includes('text/html') === true) {
      response.headers.set(
        'Cache-Control',
        personal(path) ? 'private, no-store' : 'no-cache',
      )
      response.headers.append('Vary', 'Cookie')
    }

    return response
  } catch (error) {
    if (path === DOWN || !unreachable(error)) throw error

    const response = await context.rewrite(DOWN)

    return new Response(response.body, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Retry-After': '30',
      },
    })
  }
}
