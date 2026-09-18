import type { CategorySlug } from '@/scripts/api'

import logo1 from '@/assets/images/logo-1.jpg'
import logo2 from '@/assets/images/logo-2.jpg'
import logo3 from '@/assets/images/logo-3.jpg'
import logo4 from '@/assets/images/logo-4.jpg'

export type ColorSlug = 'black' | 'white' | 'blue' | 'red' | 'pink'

export interface Color {
  slug: ColorSlug
  title: string
}

export interface Category {
  slug: CategorySlug
  title: string
  tileLines: string[]
  icon: string
}

export interface Brand {
  slug: string
  name: string
  image: ImageMetadata
  category: string
}

export const COLORS: Color[] = [
  { slug: 'black', title: 'Черный' },
  { slug: 'white', title: 'Белый' },
  { slug: 'blue', title: 'Синий' },
  { slug: 'red', title: 'Красный' },
  { slug: 'pink', title: 'Розовый' },
]

export const CATEGORIES: Category[] = [
  {
    slug: 'virtual-reality',
    title: 'Виртуальная реальность',
    tileLines: ['Виртуальная реальность'],
    icon: 'virtual-reality',
  },
  {
    slug: 'monopods',
    title: 'Моноподы для селфи',
    tileLines: ['Моноподы', 'для селфи'],
    icon: 'monopod',
  },
  {
    slug: 'action-cameras',
    title: 'Экшн-камеры',
    tileLines: ['Экшн-камеры'],
    icon: 'action-camera',
  },
  {
    slug: 'fitness-bracelets',
    title: 'Фитнес-браслеты',
    tileLines: ['Фитнес-браслеты'],
    icon: 'fitness-bracelet',
  },
  {
    slug: 'smart-watches',
    title: 'Умные часы',
    tileLines: ['Умные часы'],
    icon: 'smart-watch',
  },
  {
    slug: 'quadcopters',
    title: 'Квадрокоптеры',
    tileLines: ['Квадрокоптеры'],
    icon: 'quadrocopter',
  },
]

export const BRANDS: Brand[] = [
  { slug: 'dji', name: 'DJI', image: logo1, category: 'quadcopters' },
  {
    slug: 'sp-gadgets',
    name: 'SP Gadgets',
    image: logo2,
    category: 'monopods',
  },
  { slug: 'gopro', name: 'GoPro', image: logo3, category: 'action-cameras' },
  { slug: 'vive', name: 'Vive', image: logo4, category: 'virtual-reality' },
]

export const PAGE_SIZE = 4

export const categoryBySlug = (slug: string): Category | undefined =>
  CATEGORIES.find((category) => category.slug === slug)

export const brandBySlug = (slug: string): Brand | undefined =>
  BRANDS.find((brand) => brand.slug === slug)

export { priceLabel } from '@/scripts/format'
