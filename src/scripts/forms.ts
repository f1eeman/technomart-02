import { closeModal, OPENED, shakeModal } from '@/scripts/modal'
import { signIn } from '@/scripts/session'
import { readText, writeText } from '@/scripts/storage'

const fieldIn = (
  root: ParentNode,
  name: string,
): HTMLInputElement | HTMLTextAreaElement | null => {
  const found = root.querySelector(`[data-field='${name}']`)

  return found instanceof HTMLInputElement ||
    found instanceof HTMLTextAreaElement
    ? found
    : null
}

const blank = (field: HTMLInputElement | HTMLTextAreaElement | null): boolean =>
  field === null || field.value.trim().length === 0

export function initLoginForm(): void {
  const modal = document.querySelector<HTMLElement>('[data-modal="login"]')

  if (modal === null) return

  const form = modal.querySelector('form')
  const login = fieldIn(modal, 'login')
  const password = fieldIn(modal, 'password')

  if (form === null || login === null || password === null) return

  modal.addEventListener(OPENED, () => {
    const stored = readText('login')

    if (stored === null) {
      login.focus()

      return
    }

    login.value = stored
    password.focus()
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (blank(login) || blank(password)) {
      shakeModal(modal)

      return
    }

    signIn(login.value.trim())
    password.value = ''
    closeModal(modal)
  })
}

export function initLoginPage(): void {
  const page = document.querySelector('[data-login-page]')

  if (page === null) return

  const form = page.querySelector('form')
  const login = fieldIn(page, 'login')
  const password = fieldIn(page, 'password')
  const error = page.querySelector('[data-login-error]')

  if (form === null || login === null || password === null) return

  login.value = readText('login') ?? ''

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const bad = blank(login) || blank(password)

    if (error instanceof HTMLElement) error.hidden = !bad

    if (bad) return

    signIn(login.value.trim())
    location.href = '/profile'
  })
}

export function initRestoreForm(): void {
  const page = document.querySelector('[data-restore]')

  if (page === null) return

  const form = page.querySelector('form')
  const email = fieldIn(page, 'email')
  const error = page.querySelector('[data-restore-error]')
  const done = page.querySelector('[data-restore-done]')

  if (form === null || email === null) return

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const bad =
      blank(email) ||
      !(email instanceof HTMLInputElement) ||
      !email.checkValidity()

    if (error instanceof HTMLElement) error.hidden = !bad

    if (bad) return

    writeText('email', email.value.trim())
    form.hidden = true

    if (done instanceof HTMLElement) done.hidden = false
  })
}

export function initWriteForm(): void {
  const modal = document.querySelector<HTMLElement>('[data-modal="write-us"]')

  if (modal === null) return

  const form = modal.querySelector('form')
  const name = fieldIn(modal, 'name')
  const email = fieldIn(modal, 'email')
  const text = fieldIn(modal, 'text')
  const done = modal.querySelector('[data-write-done]')

  if (form === null || name === null || email === null || text === null) return

  modal.addEventListener(OPENED, () => {
    if (done instanceof HTMLElement) done.hidden = true

    form.hidden = false

    const storedName = readText('name')
    const storedEmail = readText('email')

    if (storedName === null || storedEmail === null) {
      name.focus()

      return
    }

    name.value = storedName
    email.value = storedEmail
    text.focus()
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (blank(name) || blank(email) || blank(text)) {
      shakeModal(modal)

      return
    }

    if (!(email instanceof HTMLInputElement) || !email.checkValidity()) {
      shakeModal(modal)

      return
    }

    writeText('name', name.value.trim())
    writeText('email', email.value.trim())
    text.value = ''
    form.hidden = true

    if (done instanceof HTMLElement) done.hidden = false
  })
}
