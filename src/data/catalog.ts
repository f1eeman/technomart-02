import item1 from '@/assets/images/item-1.jpg'
import item2 from '@/assets/images/item-2.jpg'
import item3 from '@/assets/images/item-3.jpg'
import item4 from '@/assets/images/item-4.jpg'
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
  slug: string
  title: string
  tileLines: string[]
  icon: string
}

export interface Spec {
  label: string
  value: string
}

export interface Brand {
  slug: string
  name: string
  image: ImageMetadata
  category: string
}

export interface Product {
  slug: string
  category: string
  titleLines: string[]
  price: number
  image: ImageMetadata
  color: ColorSlug
  bluetooth: boolean
  kind: string
  popularity: number
  specs: Spec[]
  description: string
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

const IMAGES = [item1, item2, item3, item4]

const imageFor = (index: number): ImageMetadata => {
  const picked = IMAGES[index % IMAGES.length]

  if (picked === undefined) throw new Error('Нет картинки для товара')

  return picked
}

interface Draft {
  slug: string
  titleLines: string[]
  price: number
  color: ColorSlug
  bluetooth: boolean
  kind: string
  popularity: number
  specs: Spec[]
  description: string
}

const MONOPODS: Draft[] = [
  {
    slug: 'amateur-selfie-stick',
    titleLines: ['Любительская селфи-палка'],
    price: 500,
    color: 'black',
    bluetooth: false,
    kind: 'Телескопический',
    popularity: 64,
    specs: [
      { label: 'Длина', value: '85 см' },
      { label: 'Вес', value: '180 г' },
      { label: 'Материал', value: 'Алюминий' },
    ],
    description:
      'Палка для тех, кто снимает себя два раза в год и не готов за это переплачивать.',
  },
  {
    slug: 'professional-selfie-stick',
    titleLines: ['Профессиональная', 'селфи-палка'],
    price: 1500,
    color: 'white',
    bluetooth: true,
    kind: 'Телескопический',
    popularity: 91,
    specs: [
      { label: 'Длина', value: '120 см' },
      { label: 'Вес', value: '240 г' },
      { label: 'Материал', value: 'Карбон' },
    ],
    description:
      'Профессионал отличается от любителя тем, что снимает себя каждый день и называет это работой.',
  },
  {
    slug: 'unsinkable-selfie-stick',
    titleLines: ['Непотопляемая селфи-палка'],
    price: 2500,
    color: 'blue',
    bluetooth: true,
    kind: 'Водостойкий',
    popularity: 78,
    specs: [
      { label: 'Длина', value: '95 см' },
      { label: 'Глубина', value: '10 м' },
      { label: 'Материал', value: 'Полимер' },
    ],
    description:
      'Не тонет вместе с вами, а всплывает отдельно. Кадры дороже, чем вы думаете.',
  },
  {
    slug: 'follow-me-selfie-stick',
    titleLines: ['Селфи-палка «Следуй за мной»'],
    price: 4900,
    color: 'red',
    bluetooth: true,
    kind: 'Моторизованный',
    popularity: 97,
    specs: [
      { label: 'Длина', value: '140 см' },
      { label: 'Поворот', value: '360°' },
      { label: 'Заряд', value: '6 часов' },
    ],
    description:
      'Палка сама поворачивается за вашим лицом. Убежать от неё пока никому не удалось.',
  },
  {
    slug: 'pocket-selfie-stick',
    titleLines: ['Карманная селфи-палка'],
    price: 750,
    color: 'pink',
    bluetooth: false,
    kind: 'Складной',
    popularity: 55,
    specs: [
      { label: 'Длина', value: '62 см' },
      { label: 'Вес', value: '120 г' },
      { label: 'Материал', value: 'Пластик' },
    ],
    description:
      'Складывается до размера ручки и теряется так же незаметно, как ручка.',
  },
  {
    slug: 'tripod-selfie-stick',
    titleLines: ['Селфи-палка со штативом'],
    price: 1900,
    color: 'black',
    bluetooth: true,
    kind: 'Штатив',
    popularity: 83,
    specs: [
      { label: 'Длина', value: '110 см' },
      { label: 'Опор', value: '3 шт.' },
      { label: 'Нагрузка', value: '800 г' },
    ],
    description:
      'Три ноги вместо одной руки. Руку при этом всё равно приходится держать в кадре.',
  },
  {
    slug: 'bluetooth-selfie-stick',
    titleLines: ['Селфи-палка с пультом'],
    price: 1200,
    color: 'white',
    bluetooth: true,
    kind: 'Телескопический',
    popularity: 72,
    specs: [
      { label: 'Длина', value: '100 см' },
      { label: 'Радиус пульта', value: '10 м' },
      { label: 'Заряд', value: '30 часов' },
    ],
    description:
      'Пульт отстёгивается и теряется первым. Палка остаётся с вами навсегда.',
  },
  {
    slug: 'winter-selfie-stick',
    titleLines: ['Зимняя селфи-палка'],
    price: 2100,
    color: 'blue',
    bluetooth: false,
    kind: 'Водостойкий',
    popularity: 41,
    specs: [
      { label: 'Длина', value: '105 см' },
      { label: 'Мороз', value: 'до −40 °C' },
      { label: 'Материал', value: 'Сталь' },
    ],
    description:
      'Не леденеет в руке, потому что руку в этот момент лучше держать в кармане.',
  },
  {
    slug: 'giant-selfie-stick',
    titleLines: ['Гигантская селфи-палка'],
    price: 8900,
    color: 'red',
    bluetooth: true,
    kind: 'Телескопический',
    popularity: 88,
    specs: [
      { label: 'Длина', value: '8,5 м' },
      { label: 'Вес', value: '5 кг' },
      { label: 'Материал', value: 'Карбон' },
    ],
    description:
      'Восемь с половиной метров. Восемь, Карл! В кадр помещается весь ваш район.',
  },
  {
    slug: 'gold-selfie-stick',
    titleLines: ['Позолоченная селфи-палка'],
    price: 15900,
    color: 'pink',
    bluetooth: true,
    kind: 'Моторизованный',
    popularity: 34,
    specs: [
      { label: 'Длина', value: '115 см' },
      { label: 'Покрытие', value: 'Золото 999' },
      { label: 'Вес', value: '900 г' },
    ],
    description:
      'Снимает ровно так же, как обычная, но об этом никто не должен догадаться.',
  },
  {
    slug: 'kids-selfie-stick',
    titleLines: ['Детская селфи-палка'],
    price: 600,
    color: 'pink',
    bluetooth: false,
    kind: 'Складной',
    popularity: 47,
    specs: [
      { label: 'Длина', value: '55 см' },
      { label: 'Вес', value: '90 г' },
      { label: 'Материал', value: 'Пластик' },
    ],
    description:
      'Мягкая, лёгкая и не бьётся. В отличие от телефона, который на неё крепится.',
  },
  {
    slug: 'drone-selfie-stick',
    titleLines: ['Летающая селфи-палка'],
    price: 24900,
    color: 'black',
    bluetooth: true,
    kind: 'Моторизованный',
    popularity: 99,
    specs: [
      { label: 'Высота', value: '30 м' },
      { label: 'Полёт', value: '18 минут' },
      { label: 'Вес', value: '640 г' },
    ],
    description:
      'Строго говоря, это квадрокоптер. Но продаётся он в разделе моноподов, и мы не спорим.',
  },
]

const VIRTUAL_REALITY: Draft[] = [
  {
    slug: 'vr-headset-start',
    titleLines: ['Шлем «Первый шаг»'],
    price: 7900,
    color: 'black',
    bluetooth: true,
    kind: 'Автономный',
    popularity: 70,
    specs: [
      { label: 'Разрешение', value: '1920×1080' },
      { label: 'Вес', value: '480 г' },
      { label: 'Заряд', value: '3 часа' },
    ],
    description:
      'Первый шлем, после которого реальность кажется недоработанной версией.',
  },
  {
    slug: 'vr-headset-pro',
    titleLines: ['Шлем «Полное погружение»'],
    price: 34900,
    color: 'white',
    bluetooth: true,
    kind: 'Проводной',
    popularity: 94,
    specs: [
      { label: 'Разрешение', value: '2880×1700' },
      { label: 'Частота', value: '120 Гц' },
      { label: 'Вес', value: '620 г' },
    ],
    description:
      'Погружение настолько полное, что мы обязаны напомнить: обед сам себя не приготовит.',
  },
  {
    slug: 'vr-glasses-cardboard',
    titleLines: ['Очки из картона'],
    price: 300,
    color: 'white',
    bluetooth: false,
    kind: 'Для смартфона',
    popularity: 28,
    specs: [
      { label: 'Материал', value: 'Картон' },
      { label: 'Вес', value: '60 г' },
      { label: 'Линзы', value: '34 мм' },
    ],
    description:
      'Виртуальная реальность за триста рублей. Ровно настолько виртуальная, насколько вы поверите.',
  },
  {
    slug: 'vr-gloves',
    titleLines: ['Перчатки обратной связи'],
    price: 18900,
    color: 'blue',
    bluetooth: true,
    kind: 'Аксессуар',
    popularity: 61,
    specs: [
      { label: 'Датчиков', value: '20 шт.' },
      { label: 'Заряд', value: '8 часов' },
      { label: 'Вес', value: '210 г' },
    ],
    description:
      'Теперь вы чувствуете виртуальные предметы. Виртуальные кирпичи, например.',
  },
  {
    slug: 'vr-treadmill',
    titleLines: ['Беговая платформа'],
    price: 129000,
    color: 'black',
    bluetooth: true,
    kind: 'Аксессуар',
    popularity: 52,
    specs: [
      { label: 'Диаметр', value: '125 см' },
      { label: 'Нагрузка', value: '130 кг' },
      { label: 'Вес', value: '68 кг' },
    ],
    description:
      'Бежите в игре — бежите в комнате. Соседи снизу узнают о вашем хобби первыми.',
  },
  {
    slug: 'vr-chair',
    titleLines: ['Кресло пилота'],
    price: 89000,
    color: 'red',
    bluetooth: true,
    kind: 'Аксессуар',
    popularity: 45,
    specs: [
      { label: 'Осей', value: '6' },
      { label: 'Наклон', value: '±25°' },
      { label: 'Нагрузка', value: '120 кг' },
    ],
    description:
      'Кресло наклоняется вместе с самолётом. Тошнота прилагается бесплатно.',
  },
]

const ACTION_CAMERAS: Draft[] = [
  {
    slug: 'action-camera-basic',
    titleLines: ['Экшн-камера «Начальная»'],
    price: 4500,
    color: 'black',
    bluetooth: false,
    kind: 'Компактная',
    popularity: 58,
    specs: [
      { label: 'Видео', value: '1080p60' },
      { label: 'Глубина', value: '10 м' },
      { label: 'Вес', value: '95 г' },
    ],
    description:
      'Снимает всё, кроме того момента, ради которого вы её включили.',
  },
  {
    slug: 'action-camera-4k',
    titleLines: ['Экшн-камера 4K'],
    price: 19900,
    color: 'white',
    bluetooth: true,
    kind: 'Компактная',
    popularity: 89,
    specs: [
      { label: 'Видео', value: '4K60' },
      { label: 'Глубина', value: '30 м' },
      { label: 'Вес', value: '126 г' },
    ],
    description:
      'Четыре тысячи пикселей по горизонтали, чтобы разглядеть, как вы падаете.',
  },
  {
    slug: 'action-camera-360',
    titleLines: ['Панорамная камера 360°'],
    price: 32900,
    color: 'blue',
    bluetooth: true,
    kind: 'Панорамная',
    popularity: 76,
    specs: [
      { label: 'Видео', value: '5,7K' },
      { label: 'Объективов', value: '2' },
      { label: 'Вес', value: '158 г' },
    ],
    description:
      'Снимает вообще всё вокруг. Спрятаться от неё в кадре невозможно.',
  },
  {
    slug: 'action-camera-mini',
    titleLines: ['Камера-клипса'],
    price: 8900,
    color: 'pink',
    bluetooth: true,
    kind: 'Носимая',
    popularity: 63,
    specs: [
      { label: 'Видео', value: '2,7K' },
      { label: 'Заряд', value: '90 минут' },
      { label: 'Вес', value: '38 г' },
    ],
    description:
      'Цепляется на воротник и снимает ваш день от первого лица. Пересматривать необязательно.',
  },
  {
    slug: 'action-camera-thermal',
    titleLines: ['Камера с тепловизором'],
    price: 64900,
    color: 'red',
    bluetooth: true,
    kind: 'Специальная',
    popularity: 39,
    specs: [
      { label: 'Видео', value: '1080p30' },
      { label: 'Диапазон', value: '−20…550 °C' },
      { label: 'Вес', value: '210 г' },
    ],
    description:
      'Показывает, что холоднее всего в вашей квартире — окно, а не отношения.',
  },
]

const FITNESS_BRACELETS: Draft[] = [
  {
    slug: 'fitness-bracelet-simple',
    titleLines: ['Браслет «Просто шаги»'],
    price: 1900,
    color: 'black',
    bluetooth: true,
    kind: 'Шагомер',
    popularity: 66,
    specs: [
      { label: 'Без подзарядки', value: '48 часов' },
      { label: 'Экран', value: '0,96″' },
      { label: 'Вес', value: '22 г' },
    ],
    description:
      'Считает шаги и молчит обо всём остальном. Иногда это лучшее качество устройства.',
  },
  {
    slug: 'fitness-bracelet-motivator',
    titleLines: ['Браслет «Мотиватор»'],
    price: 3900,
    color: 'red',
    bluetooth: true,
    kind: 'С пульсометром',
    popularity: 92,
    specs: [
      { label: 'Без подзарядки', value: '14 дней' },
      { label: 'Пульс', value: '24/7' },
      { label: 'Вес', value: '25 г' },
    ],
    description:
      'Вибрирует, когда вы сидите дольше часа. Через неделю вы научитесь его снимать.',
  },
  {
    slug: 'fitness-bracelet-sleep',
    titleLines: ['Браслет «Сонный»'],
    price: 2900,
    color: 'blue',
    bluetooth: true,
    kind: 'С пульсометром',
    popularity: 74,
    specs: [
      { label: 'Без подзарядки', value: '21 день' },
      { label: 'Фазы сна', value: '4' },
      { label: 'Вес', value: '23 г' },
    ],
    description:
      'Утром подробно объясняет, почему вы не выспались. Помочь при этом не предлагает.',
  },
  {
    slug: 'fitness-bracelet-swim',
    titleLines: ['Браслет для плавания'],
    price: 5400,
    color: 'white',
    bluetooth: true,
    kind: 'Водостойкий',
    popularity: 57,
    specs: [
      { label: 'Без подзарядки', value: '10 дней' },
      { label: 'Глубина', value: '50 м' },
      { label: 'Вес', value: '28 г' },
    ],
    description:
      'Считает бассейны. Море считать отказывается — говорит, что там один бассейн.',
  },
  {
    slug: 'fitness-bracelet-kids',
    titleLines: ['Детский браслет'],
    price: 2400,
    color: 'pink',
    bluetooth: true,
    kind: 'Шагомер',
    popularity: 48,
    specs: [
      { label: 'Без подзарядки', value: '7 дней' },
      { label: 'GPS', value: 'Есть' },
      { label: 'Вес', value: '19 г' },
    ],
    description:
      'Родители знают, где ребёнок. Ребёнок знает, где кнопка «выключить».',
  },
]

const SMART_WATCHES: Draft[] = [
  {
    slug: 'smart-watch-classic',
    titleLines: ['Часы «Классика»'],
    price: 12900,
    color: 'black',
    bluetooth: true,
    kind: 'Классические',
    popularity: 81,
    specs: [
      { label: 'Экран', value: '1,4″ AMOLED' },
      { label: 'Заряд', value: '5 дней' },
      { label: 'Вес', value: '48 г' },
    ],
    description:
      'Выглядят как обычные часы ровно до момента, когда на них приходит уведомление.',
  },
  {
    slug: 'smart-watch-sport',
    titleLines: ['Часы «Спорт»'],
    price: 21900,
    color: 'red',
    bluetooth: true,
    kind: 'Спортивные',
    popularity: 87,
    specs: [
      { label: 'Экран', value: '1,6″ AMOLED' },
      { label: 'GPS', value: 'Двухдиапазонный' },
      { label: 'Заряд', value: '3 дня' },
    ],
    description:
      'Знают 140 видов спорта. Вы попробуете два и вернётесь к прогулкам.',
  },
  {
    slug: 'smart-watch-diver',
    titleLines: ['Часы для дайвинга'],
    price: 46900,
    color: 'blue',
    bluetooth: true,
    kind: 'Водостойкие',
    popularity: 53,
    specs: [
      { label: 'Глубина', value: '100 м' },
      { label: 'Экран', value: '1,5″' },
      { label: 'Вес', value: '92 г' },
    ],
    description:
      'Выдерживают сто метров глубины. Вы выдерживаете три, и это уже неплохо.',
  },
  {
    slug: 'smart-watch-light',
    titleLines: ['Часы «Лёгкие»'],
    price: 8900,
    color: 'white',
    bluetooth: true,
    kind: 'Классические',
    popularity: 69,
    specs: [
      { label: 'Экран', value: '1,2″' },
      { label: 'Заряд', value: '9 дней' },
      { label: 'Вес', value: '31 г' },
    ],
    description:
      'Почти не чувствуются на руке. Про них и забывают почти сразу.',
  },
  {
    slug: 'smart-watch-kids',
    titleLines: ['Детские часы с GPS'],
    price: 6900,
    color: 'pink',
    bluetooth: true,
    kind: 'Детские',
    popularity: 44,
    specs: [
      { label: 'Экран', value: '1,3″' },
      { label: 'SIM', value: 'nano' },
      { label: 'Заряд', value: '2 дня' },
    ],
    description:
      'Звонят родителям одной кнопкой. Второй кнопкой — не звонят никому.',
  },
]

const QUADCOPTERS: Draft[] = [
  {
    slug: 'quadcopter-training',
    titleLines: ['Квадрокоптер «Учебный»'],
    price: 5900,
    color: 'white',
    bluetooth: true,
    kind: 'Учебный',
    popularity: 60,
    specs: [
      { label: 'Дальность полёта', value: '100 м' },
      { label: 'Полёт', value: '12 минут' },
      { label: 'Вес', value: '180 г' },
    ],
    description:
      'Переживает первые десять падений. Одиннадцатое становится последним.',
  },
  {
    slug: 'quadcopter-photo',
    titleLines: ['Квадрокоптер «Съёмочный»'],
    price: 74900,
    color: 'black',
    bluetooth: true,
    kind: 'Съёмочный',
    popularity: 95,
    specs: [
      { label: 'Дальность полёта', value: '8 км' },
      { label: 'Камера', value: '4K60' },
      { label: 'Полёт', value: '34 минуты' },
    ],
    description:
      'Снимает свадьбы, горы и соседский огород. Последнее — случайно.',
  },
  {
    slug: 'quadcopter-laser',
    titleLines: ['Квадрокоптер с лазером'],
    price: 149000,
    color: 'red',
    bluetooth: true,
    kind: 'Специальный',
    popularity: 98,
    specs: [
      { label: 'Дальность полёта', value: '800 м' },
      { label: 'Радиус поражения', value: '50 м' },
      { label: 'Полёт', value: '22 минуты' },
    ],
    description:
      'Обычный, на первый взгляд, квадрокоптер с мощным лазером под видом камеры.',
  },
  {
    slug: 'quadcopter-racing',
    titleLines: ['Гоночный квадрокоптер'],
    price: 38900,
    color: 'blue',
    bluetooth: true,
    kind: 'Гоночный',
    popularity: 79,
    specs: [
      { label: 'Скорость', value: '160 км/ч' },
      { label: 'Полёт', value: '6 минут' },
      { label: 'Вес', value: '520 г' },
    ],
    description:
      'Шесть минут полёта и час поиска в кустах. Соотношение считается нормальным.',
  },
  {
    slug: 'quadcopter-pocket',
    titleLines: ['Карманный квадрокоптер'],
    price: 15900,
    color: 'pink',
    bluetooth: true,
    kind: 'Учебный',
    popularity: 51,
    specs: [
      { label: 'Дальность полёта', value: '500 м' },
      { label: 'Полёт', value: '16 минут' },
      { label: 'Вес', value: '135 г' },
    ],
    description:
      'Складывается в карман куртки и взлетает оттуда же, если забыть его выключить.',
  },
]

const GROUPS: { category: string; drafts: Draft[] }[] = [
  { category: 'monopods', drafts: MONOPODS },
  { category: 'virtual-reality', drafts: VIRTUAL_REALITY },
  { category: 'action-cameras', drafts: ACTION_CAMERAS },
  { category: 'fitness-bracelets', drafts: FITNESS_BRACELETS },
  { category: 'smart-watches', drafts: SMART_WATCHES },
  { category: 'quadcopters', drafts: QUADCOPTERS },
]

export const PRODUCTS: Product[] = GROUPS.flatMap(({ category, drafts }) =>
  drafts.map((draft, index) => ({
    ...draft,
    category,
    image: imageFor(index),
  })),
)

export const PAGE_SIZE = 4

export const categoryBySlug = (slug: string): Category | undefined =>
  CATEGORIES.find((category) => category.slug === slug)

export const productsOf = (categorySlug: string): Product[] =>
  PRODUCTS.filter((product) => product.category === categorySlug)

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((product) => product.slug === slug)

export const titleOf = (product: Product): string =>
  product.titleLines.join(' ')

export const searchTextOf = (product: Product): string =>
  [
    titleOf(product),
    product.description,
    product.kind,
    categoryBySlug(product.category)?.title ?? '',
    ...product.specs.map((spec) => `${spec.label} ${spec.value}`),
  ]
    .join(' ')
    .toLowerCase()
    .replaceAll('ё', 'е')

export const brandBySlug = (slug: string): Brand | undefined =>
  BRANDS.find((brand) => brand.slug === slug)
export { priceLabel } from '@/scripts/format'
