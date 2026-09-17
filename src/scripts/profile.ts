import { priceLabel } from '@/scripts/format'
import { readOrders } from '@/scripts/orders'
import { attachPhoneMask } from '@/scripts/phone-mask'
import { currentName, signIn } from '@/scripts/session'
import { readText, writeText } from '@/scripts/storage'

const fieldIn = (root: ParentNode, name: string): HTMLInputElement | null => {
  const found = root.querySelector(`[data-field='${name}']`)

  return found instanceof HTMLInputElement ? found : null
}

const dateLabel = (iso: string): string => {
  const at = new Date(iso)

  if (Number.isNaN(at.getTime())) return 'Дата неизвестна'

  return at.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const renderOrders = (page: ParentNode): void => {
  const list = page.querySelector('[data-orders]')
  const template = page.querySelector('[data-order-template]')
  const empty = page.querySelector('[data-orders-empty]')
  const orders = readOrders()

  if (empty instanceof HTMLElement) empty.hidden = orders.length > 0

  if (
    !(list instanceof HTMLElement) ||
    !(template instanceof HTMLTemplateElement)
  )
    return

  list.hidden = orders.length === 0
  list.replaceChildren()

  for (const order of orders) {
    const item = template.content.cloneNode(true)

    if (!(item instanceof DocumentFragment)) continue

    const date = item.querySelector('[data-order-date]')
    const total = item.querySelector('[data-order-total]')
    const lines = item.querySelector('[data-order-lines]')

    if (date !== null) date.textContent = dateLabel(order.at)

    if (total !== null) total.textContent = priceLabel(order.total)

    if (lines !== null)
      for (const line of order.lines) {
        const row = document.createElement('li')

        row.textContent = line
        lines.append(row)
      }

    list.append(item)
  }
}

export function initProfile(): void {
  const page = document.querySelector('[data-profile]')

  if (page === null) return

  renderOrders(page)

  const form = page.querySelector('form')
  const name = fieldIn(page, 'name')
  const email = fieldIn(page, 'email')
  const phone = fieldIn(page, 'phone')
  const saved = page.querySelector('[data-profile-saved]')

  if (form === null || name === null || email === null || phone === null) return

  const mask = attachPhoneMask(phone)

  name.value = currentName() ?? ''
  email.value = readText('email') ?? ''

  const storedPhone = readText('phone')

  if (storedPhone !== null && storedPhone.length > 0) {
    phone.value = storedPhone
    phone.dispatchEvent(new Event('input', { bubbles: true }))
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (name.value.trim().length > 0) signIn(name.value.trim())

    writeText('email', email.value.trim())
    writeText('phone', mask.digits())

    if (saved instanceof HTMLElement) saved.hidden = false
  })
}
