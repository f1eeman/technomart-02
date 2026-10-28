import { closeModal, OPENED, shakeModal } from '@/scripts/modal'
import { createApi } from '@/scripts/api'
import { signIn, signUp } from '@/scripts/session'
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

const api = createApi('')

const blank = (field: HTMLInputElement | HTMLTextAreaElement | null): boolean =>
  field === null || field.value.trim().length === 0

const remembered = (root: ParentNode): boolean => {
  const box = root.querySelector('[name="remember"]')

  return box instanceof HTMLInputElement && box.checked
}

export function initLoginForm(): void {
  const modal = document.querySelector<HTMLElement>('[data-modal="login"]')

  if (modal === null) return

  const form = modal.querySelector('form')
  const login = fieldIn(modal, 'login')
  const password = fieldIn(modal, 'password')

  if (form === null || login === null || password === null) return

  modal.addEventListener(OPENED, () => {
    const stored = readText('email')

    if (stored === null || stored === '') {
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

    void signIn(login.value.trim(), password.value, remembered(modal))
      .then(() => {
        password.value = ''
        closeModal(modal)
      })
      .catch(() => {
        shakeModal(modal)
      })
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

  login.value = readText('email') ?? ''

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const bad = blank(login) || blank(password)

    if (error instanceof HTMLElement) error.hidden = !bad

    if (bad) return

    void signIn(login.value.trim(), password.value, remembered(page))
      .then(() => {
        location.href = '/profile'
      })
      .catch(() => {
        if (error instanceof HTMLElement) error.hidden = false
      })
  })
}

export function initRegisterPage(): void {
  const page = document.querySelector('[data-register-page]')

  if (page === null) return

  const form = page.querySelector('form')
  const email = fieldIn(page, 'email')
  const name = fieldIn(page, 'name')
  const password = fieldIn(page, 'password')
  const repeat = fieldIn(page, 'repeat')
  const error = page.querySelector('[data-register-error]')

  if (
    form === null ||
    email === null ||
    name === null ||
    password === null ||
    repeat === null
  )
    return

  const complain = (text: string): void => {
    if (!(error instanceof HTMLElement)) return

    error.textContent = text
    error.hidden = false
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (error instanceof HTMLElement) error.hidden = true

    if (blank(email) || blank(name) || blank(password)) {
      complain('Заполните все поля — без них аккаунт не завести.')

      return
    }

    if (password.value.length < 8) {
      complain('Пароль короче восьми знаков.')

      return
    }

    if (password.value !== repeat.value) {
      complain('Пароли не совпали.')

      return
    }

    void signUp(
      email.value.trim(),
      password.value,
      name.value.trim(),
      remembered(page),
    )
      .then(() => {
        location.href = '/profile'
      })
      .catch((reason: unknown) => {
        complain(
          reason instanceof Error && reason.message.includes('занят')
            ? 'Такой адрес уже занят. Попробуйте войти.'
            : 'Завести аккаунт не вышло. Попробуйте ещё раз.',
        )
      })
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

    void api.askReset(email.value.trim())

    form.hidden = true

    if (done instanceof HTMLElement) done.hidden = false
  })
}

export function initResetPage(): void {
  const page = document.querySelector('[data-reset-page]')

  if (page === null) return

  const form = page.querySelector('form')
  const password = fieldIn(page, 'password')
  const repeat = fieldIn(page, 'repeat')
  const error = page.querySelector('[data-reset-error]')
  const done = page.querySelector('[data-reset-done]')
  const token = new URLSearchParams(location.search).get('token') ?? ''

  if (form === null || password === null || repeat === null) return

  const complain = (text: string): void => {
    if (!(error instanceof HTMLElement)) return

    error.textContent = text
    error.hidden = false
  }

  if (token === '') complain('Ссылка без токена — попросите новую.')

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (error instanceof HTMLElement) error.hidden = true

    if (password.value.length < 8) {
      complain('Пароль короче восьми знаков.')

      return
    }

    if (password.value !== repeat.value) {
      complain('Пароли не совпали.')

      return
    }

    void api
      .applyReset(token, password.value)
      .then(() => {
        form.hidden = true

        if (done instanceof HTMLElement) done.hidden = false
      })
      .catch((reason: unknown) => {
        complain(
          reason instanceof Error
            ? reason.message
            : 'Ссылка не сработала — попросите новую.',
        )
      })
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
