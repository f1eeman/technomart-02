const SHOW = 'modal-show'
const SHOW_SIDEWAYS = 'modal-show-map'
const ERROR = 'modal-error'
const OVERLAY_SHOW = 'overlay-show'

export const OPENED = 'device:modal-open'

const shownClass = (modal: HTMLElement): string =>
  modal.dataset['modalAnimation'] === 'sideways' ? SHOW_SIDEWAYS : SHOW

let opener: HTMLElement | null = null

const overlay = (): HTMLElement | null =>
  document.querySelector('[data-modal-overlay]')

export const isOpen = (modal: HTMLElement): boolean =>
  modal.classList.contains(shownClass(modal))

export const closeModal = (modal: HTMLElement): void => {
  modal.classList.remove(shownClass(modal), ERROR)
  overlay()?.classList.remove(OVERLAY_SHOW)

  const back = opener

  opener = null
  back?.focus()
}

export const openModal = (modal: HTMLElement, from?: HTMLElement): void => {
  opener = from ?? null
  modal.classList.add(shownClass(modal))
  overlay()?.classList.add(OVERLAY_SHOW)

  const focus = modal.querySelector('[data-modal-focus]')

  if (focus instanceof HTMLElement) focus.focus()

  modal.dispatchEvent(new CustomEvent(OPENED))
}

export const shakeModal = (modal: HTMLElement): void => {
  modal.classList.remove(ERROR)
  void modal.offsetWidth
  modal.classList.add(ERROR)
}

const openModals = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-modal]')).filter(
    isOpen,
  )

export function initModals(): void {
  const byId = new Map<string, HTMLElement>()

  for (const modal of document.querySelectorAll<HTMLElement>('[data-modal]')) {
    const id = modal.dataset['modal']

    if (id !== undefined) byId.set(id, modal)
  }

  if (byId.size === 0) return

  for (const button of document.querySelectorAll<HTMLElement>(
    '[data-modal-open]',
  )) {
    const modal = byId.get(button.dataset['modalOpen'] ?? '')

    if (modal === undefined) continue

    button.addEventListener('click', (event) => {
      event.preventDefault()
      openModal(modal, button)
    })
  }

  for (const modal of byId.values())
    for (const button of modal.querySelectorAll('[data-modal-close]'))
      button.addEventListener('click', (event) => {
        event.preventDefault()
        closeModal(modal)
      })

  overlay()?.addEventListener('click', () => {
    for (const modal of openModals()) closeModal(modal)
  })

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return

    const open = openModals()

    if (open.length === 0) return

    event.preventDefault()

    for (const modal of open) closeModal(modal)
  })
}
