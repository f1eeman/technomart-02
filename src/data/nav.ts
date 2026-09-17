export interface Crumb {
  title: string
  href?: string
}

export const HOME: Crumb = { title: 'Главная', href: '/' }
export const CATALOG: Crumb = { title: 'Каталог товаров', href: '/catalog' }
