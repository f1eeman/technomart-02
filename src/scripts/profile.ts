import { priceLabel } from '@/scripts/format'
import { createApi, type Order } from '@/scripts/api'
import { attachPhoneMask } from '@/scripts/phone-mask'
import { currentName } from '@/scripts/session'
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

const STATUS: Record<Order['status'], string> = {
  fresh: 'Новый',
  working: 'В работе',
  done: 'Выполнен',
  cancelled: 'Отменён',
}

const api = createApi('')

const renderOrders = (page: ParentNode, orders: Order[]): void => {
  const list = page.querySelector('[data-orders]')
  const template = page.querySelector('[data-order-template]')
  const empty = page.querySelector('[data-orders-empty]')

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
    const status = item.querySelector('[data-order-status]')
    const cancel = item.querySelector('[data-order-cancel]')

    if (date !== null)
      date.textContent = `№ ${String(order.number)} от ${dateLabel(order.at)}`

    if (total !== null) total.textContent = priceLabel(order.total)

    if (status !== null) status.textContent = STATUS[order.status]

    if (lines !== null)
      for (const line of order.items) {
        const row = document.createElement('li')

        row.textContent = `${line.title} — ${String(line.quantity)} шт.`
        lines.append(row)
      }

    if (cancel instanceof HTMLElement) {
      cancel.hidden = order.status !== 'fresh'
      cancel.addEventListener('click', (event) => {
        event.preventDefault()

        void api.cancelOrder(order.number).then(() => {
          void loadOrders(page)
        })
      })
    }

    list.append(item)
  }
}

const loadOrders = async (page: ParentNode): Promise<void> => {
  const { items } = await api.orders().catch(() => ({ items: [] }))

  renderOrders(page, items)
}

export function initProfile(): void {
  const page = document.querySelector('[data-profile]')

  if (page === null) return

  void loadOrders(page)

  const form = page.querySelector('form')
  const name = fieldIn(page, 'name')
  const email = fieldIn(page, 'email')
  const phone = fieldIn(page, 'phone')
  const saved = page.querySelector('[data-profile-saved]')

  if (form === null || name === null || email === null || phone === null) return

  const mask = attachPhoneMask(phone)

  const fillName = (): void => {
    name.value = currentName() ?? name.value
  }

  fillName()
  window.addEventListener('device:session', fillName)
  email.value = readText('email') ?? ''

  const storedPhone = readText('phone')

  if (storedPhone !== null && storedPhone.length > 0) {
    phone.value = storedPhone
    phone.dispatchEvent(new Event('input', { bubbles: true }))
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    writeText('email', email.value.trim())
    writeText('phone', mask.digits())

    if (saved instanceof HTMLElement) saved.hidden = false
  })
}
