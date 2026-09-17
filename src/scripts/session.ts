import { dropText, readText, writeText } from '@/scripts/storage'

const KEY = 'login'
const EVENT = 'device:session'

export const currentName = (): string | null => readText(KEY)

export const signIn = (name: string): void => {
  writeText(KEY, name)
  window.dispatchEvent(new CustomEvent(EVENT))
}

export const signOut = (): void => {
  dropText(KEY)
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function initSession(): void {
  const render = (): void => {
    const name = currentName()

    document.body.dataset['session'] = name === null ? 'guest' : 'member'

    if (name === null) return

    for (const slot of document.querySelectorAll('[data-session-name]'))
      slot.textContent = name
  }

  window.addEventListener(EVENT, render)
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== KEY) return

    render()
  })

  render()
}
