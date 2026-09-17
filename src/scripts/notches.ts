import { onEnter } from '@/scripts/motion'

export function initNotches(): void {
  onEnter(document.querySelectorAll('[data-notch]'), (node) => {
    if (node instanceof HTMLElement) node.dataset['notch'] = 'in'
  })
}
