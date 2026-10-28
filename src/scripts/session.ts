import { createApi, type Me } from '@/scripts/api'

const EVENT = 'device:session'

const api = createApi('')

let known: Me = null

export const currentUser = (): Me => known

export const currentName = (): string | null => known?.name ?? null

const tell = (): void => {
  window.dispatchEvent(new CustomEvent(EVENT))
}

export const signIn = async (
  email: string,
  password: string,
  remember = false,
): Promise<void> => {
  const signed = await api.login({ email, password, remember })

  known = { ...signed, phone: null }
  tell()
}

export const signUp = async (
  email: string,
  password: string,
  name: string,
  remember = false,
): Promise<void> => {
  const signed = await api.register({ email, password, name, remember })

  known = { ...signed, phone: null }
  tell()
}

export const signOut = async (): Promise<void> => {
  await api.logout()

  known = null
  tell()
}

export function initSession(): void {
  const render = (): void => {
    document.body.dataset['session'] = known === null ? 'guest' : 'member'

    if (known === null) return

    for (const slot of document.querySelectorAll('[data-session-name]'))
      slot.textContent = known.name
  }

  window.addEventListener(EVENT, render)

  void api
    .me()
    .then((me) => {
      known = me
      render()
      tell()
    })
    .catch(() => undefined)
}
