const CURRENT = 'service-item-current'
const ACTIVE = 'description-active'

export function initTabs(): void {
  const tabs = document.querySelector('[data-tabs]')

  if (tabs === null) return

  const buttons = Array.from(tabs.querySelectorAll<HTMLElement>('[data-tab]'))
  const panels = Array.from(tabs.querySelectorAll<HTMLElement>('[data-panel]'))

  if (buttons.length === 0) return

  const show = (name: string): void => {
    for (const button of buttons) {
      const picked = button.dataset['tab'] === name

      button.closest('li')?.classList.toggle(CURRENT, picked)
      button.setAttribute('aria-current', picked ? 'true' : 'false')
    }

    for (const panel of panels)
      panel.classList.toggle(ACTIVE, panel.dataset['panel'] === name)
  }

  for (const button of buttons)
    button.addEventListener('click', (event) => {
      const name = button.dataset['tab']

      if (name === undefined) return

      event.preventDefault()
      show(name)
      history.replaceState(null, '', `#service-${name}`)
    })

  const fromHash = /^#service-(?<name>[a-z-]+)$/u.exec(location.hash)?.groups?.[
    'name'
  ]

  if (
    fromHash !== undefined &&
    panels.some((p) => p.dataset['panel'] === fromHash)
  )
    show(fromHash)

  window.addEventListener('hashchange', () => {
    const next = /^#service-(?<name>[a-z-]+)$/u.exec(location.hash)?.groups?.[
      'name'
    ]

    if (next !== undefined && panels.some((p) => p.dataset['panel'] === next))
      show(next)
  })
}
