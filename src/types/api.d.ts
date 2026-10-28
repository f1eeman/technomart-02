export interface paths {
  '/api/health': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Живость сервера и базы */
    get: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description сервер и база отвечают */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              /** @constant */
              status: 'ok'
              uptime: number
              /** @constant */
              database: 'ok'
            }
          }
        }
        /** @description база недоступна */
        503: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/products': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Выдача раздела
     * @description Страница — 4 товара. Умолчания те же, что у каталога: цена во весь диапазон, цвета все, Bluetooth не важен, сортировка по цене по возрастанию, страница первая.
     */
    get: {
      parameters: {
        query: {
          /** @description раздел */
          category:
            | 'virtual-reality'
            | 'monopods'
            | 'action-cameras'
            | 'fitness-bracelets'
            | 'smart-watches'
            | 'quadcopters'
          /** @description нижняя граница цены */
          min?: number
          /** @description верхняя граница цены */
          max?: number
          /** @description цвета через запятую */
          colors?: string
          /** @description признак Bluetooth */
          bt?: 'yes' | 'no' | 'any'
          /** @description основание сортировки */
          sort?: 'price' | 'kind' | 'popularity'
          /** @description направление сортировки */
          dir?: 'asc' | 'desc'
          /** @description номер страницы с первой */
          page?: number
        }
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description страница выдачи */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                slug: string
                title: string
                /** @enum {string} */
                categorySlug:
                  | 'virtual-reality'
                  | 'monopods'
                  | 'action-cameras'
                  | 'fitness-bracelets'
                  | 'smart-watches'
                  | 'quadcopters'
                kind: string
                /** @enum {string} */
                color: 'black' | 'white' | 'blue' | 'red' | 'pink'
                price: number
                bluetooth: boolean
                popularity: number
                specs: {
                  label: string
                  value: string
                }[]
                description: string
                imagePath: string
              }[]
              page: number
              pageSize: number
              total: number
              totalPages: number
              isLast: boolean
            }
          }
        }
        /** @description параметры не разбираются */
        400: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description такого раздела нет */
        404: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/products/all': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Весь каталог без разбивки на страницы
     * @description Нужен страницам, которым важен полный список: корзина и сравнение знают товары по slug из хранилища браузера.
     */
    get: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description все товары */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                slug: string
                title: string
                /** @enum {string} */
                categorySlug:
                  | 'virtual-reality'
                  | 'monopods'
                  | 'action-cameras'
                  | 'fitness-bracelets'
                  | 'smart-watches'
                  | 'quadcopters'
                kind: string
                /** @enum {string} */
                color: 'black' | 'white' | 'blue' | 'red' | 'pink'
                price: number
                bluetooth: boolean
                popularity: number
                specs: {
                  label: string
                  value: string
                }[]
                description: string
                imagePath: string
              }[]
              total: number
            }
          }
        }
      }
    }
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/products/{slug}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Один товар */
    get: {
      parameters: {
        query?: never
        header?: never
        path: {
          /** @description адрес товара */
          slug: string
        }
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description товар */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              slug: string
              title: string
              /** @enum {string} */
              categorySlug:
                | 'virtual-reality'
                | 'monopods'
                | 'action-cameras'
                | 'fitness-bracelets'
                | 'smart-watches'
                | 'quadcopters'
              kind: string
              /** @enum {string} */
              color: 'black' | 'white' | 'blue' | 'red' | 'pink'
              price: number
              bluetooth: boolean
              popularity: number
              specs: {
                label: string
                value: string
              }[]
              description: string
              imagePath: string
            }
          }
        }
        /** @description такого товара нет */
        404: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/categories': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Сводка по разделам
     * @description Сколько товаров в разделе и в каких границах цены.
     */
    get: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description шесть разделов */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                /** @enum {string} */
                slug:
                  | 'virtual-reality'
                  | 'monopods'
                  | 'action-cameras'
                  | 'fitness-bracelets'
                  | 'smart-watches'
                  | 'quadcopters'
                total: number
                priceMin: number
                priceMax: number
              }[]
            }
          }
        }
      }
    }
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/categories/{slug}/price-range': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Границы цены по всему разделу
     * @description Считаются без оглядки на фильтр: иначе ползунок схлопнется после первой же фильтрации.
     */
    get: {
      parameters: {
        query?: never
        header?: never
        path: {
          /** @description раздел */
          slug:
            | 'virtual-reality'
            | 'monopods'
            | 'action-cameras'
            | 'fitness-bracelets'
            | 'smart-watches'
            | 'quadcopters'
        }
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description наименьшая и наибольшая цена */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              min: number
              max: number
            }
          }
        }
        /** @description такого раздела нет */
        404: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/cart': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Корзина покупателя
     * @description Гостя опознаёт cookie `sid`. Без неё корзина пустая, и сессия не заводится: строка в базе появляется только при первой покупке.
     */
    get: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description состав и суммы */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                slug: string
                title: string
                imagePath: string
                price: number
                quantity: number
                sum: number
              }[]
              count: number
              total: number
            }
          }
        }
      }
    }
    put?: never
    post?: never
    /** Очистить корзину */
    delete: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description пустая корзина */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                slug: string
                title: string
                imagePath: string
                price: number
                quantity: number
                sum: number
              }[]
              count: number
              total: number
            }
          }
        }
      }
    }
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/cart/items': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Положить товар
     * @description Количество складывается с тем, что уже лежало.
     */
    post: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody: {
        content: {
          'application/json': {
            slug: string
            /** @default 1 */
            quantity?: number
          }
        }
      }
      responses: {
        /** @description обновлённая корзина */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                slug: string
                title: string
                imagePath: string
                price: number
                quantity: number
                sum: number
              }[]
              count: number
              total: number
            }
          }
        }
        /** @description тело запроса не разбирается */
        400: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description такого товара нет */
        404: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/cart/items/{slug}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post?: never
    /** Убрать товар */
    delete: {
      parameters: {
        query?: never
        header?: never
        path: {
          /** @description адрес товара */
          slug: string
        }
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description обновлённая корзина */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                slug: string
                title: string
                imagePath: string
                price: number
                quantity: number
                sum: number
              }[]
              count: number
              total: number
            }
          }
        }
        /** @description такого товара нет */
        404: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    options?: never
    head?: never
    /**
     * Задать количество
     * @description Ноль убирает товар из корзины.
     */
    patch: {
      parameters: {
        query?: never
        header?: never
        path: {
          /** @description адрес товара */
          slug: string
        }
        cookie?: never
      }
      requestBody: {
        content: {
          'application/json': {
            quantity: number
          }
        }
      }
      responses: {
        /** @description обновлённая корзина */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                slug: string
                title: string
                imagePath: string
                price: number
                quantity: number
                sum: number
              }[]
              count: number
              total: number
            }
          }
        }
        /** @description тело запроса не разбирается */
        400: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description такого товара нет */
        404: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description количество больше потолка */
        422: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    trace?: never
  }
  '/api/orders': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Мои заказы
     * @description Только свои и только вошедшему; гостевые сюда не попадают.
     */
    get: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description последние двадцать */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              items: {
                number: number
                at: string
                name: string
                phone: string
                total: number
                /** @enum {string} */
                status: 'fresh' | 'working' | 'done' | 'cancelled'
                items: {
                  slug: string
                  title: string
                  price: number
                  quantity: number
                  sum: number
                }[]
              }[]
            }
          }
        }
        /** @description сюда пускают только вошедших */
        401: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    put?: never
    /**
     * Оформить заказ
     * @description Состав берётся из корзины на сервере, сумма считается заново. Если клиент прислал ожидаемый итог и он разошёлся — 409 с пересчитанной корзиной в details. Заказ и опустошение корзины — одна транзакция.
     */
    post: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody: {
        content: {
          'application/json': {
            name: string
            phone: string
            expected?: number
          }
        }
      }
      responses: {
        /** @description заказ создан */
        201: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              number: number
              at: string
              name: string
              phone: string
              total: number
              /** @enum {string} */
              status: 'fresh' | 'working' | 'done' | 'cancelled'
              items: {
                slug: string
                title: string
                price: number
                quantity: number
                sum: number
              }[]
            }
          }
        }
        /** @description тело запроса не разбирается */
        400: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description корзина пуста или её состав изменился */
        409: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/orders/{number}/cancel': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Отменить свой заказ
     * @description Пока заказ новый. Дальше отменяет только продавец.
     */
    post: {
      parameters: {
        query?: never
        header?: never
        path: {
          /** @description номер заказа */
          number: number
        }
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description заказ отменён */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              number: number
              at: string
              name: string
              phone: string
              total: number
              /** @enum {string} */
              status: 'fresh' | 'working' | 'done' | 'cancelled'
              items: {
                slug: string
                title: string
                price: number
                quantity: number
                sum: number
              }[]
            }
          }
        }
        /** @description сюда пускают только вошедших */
        401: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description такого заказа нет */
        404: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description заказ уже в работе */
        422: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/register': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Завести аккаунт
     * @description Подтверждение почты не требуется: зарегистрировался — вошёл. Корзина гостя складывается с корзиной аккаунта.
     */
    post: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody: {
        content: {
          'application/json': {
            email: string
            password: string
            /** @default false */
            remember?: boolean | ('0' | '1' | 'true' | 'false' | 'on' | 'off')
            name: string
          }
        }
      }
      responses: {
        /** @description покупатель заведён */
        201: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              id: string
              email: string
              name: string
            }
          }
        }
        /** @description тело запроса не разбирается */
        400: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description такой адрес уже занят */
        409: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/login': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Войти */
    post: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody: {
        content: {
          'application/json': {
            email: string
            password: string
            /** @default false */
            remember?: boolean | ('0' | '1' | 'true' | 'false' | 'on' | 'off')
          }
        }
      }
      responses: {
        /** @description вошли */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              id: string
              email: string
              name: string
            }
          }
        }
        /** @description неверная почта или пароль */
        401: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/logout': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Выйти
     * @description Удаляет сессию в базе, а не только cookie.
     */
    post: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description вышли */
        204: {
          headers: {
            [name: string]: unknown
          }
          content?: never
        }
      }
    }
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/restore': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Попросить новый пароль
     * @description Отвечает 204 всегда — и для существующего адреса, и для любого другого: иначе по ответу можно было бы перебирать покупателей.
     */
    post: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody: {
        content: {
          'application/json': {
            email: string
          }
        }
      }
      responses: {
        /** @description просьба принята */
        204: {
          headers: {
            [name: string]: unknown
          }
          content?: never
        }
      }
    }
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/reset': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /**
     * Задать новый пароль по ссылке из письма
     * @description Ссылка одноразовая и живёт час. Успешная смена закрывает все сессии этого покупателя.
     */
    post: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody: {
        content: {
          'application/json': {
            token: string
            password: string
          }
        }
      }
      responses: {
        /** @description пароль изменён */
        204: {
          headers: {
            [name: string]: unknown
          }
          content?: never
        }
        /** @description тело запроса не разбирается */
        400: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
        /** @description ссылка не работает или устарела */
        422: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/me': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Кто вошёл */
    get: {
      parameters: {
        query?: never
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description покупатель или null */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              id: string
              email: string
              name: string
              phone: string | null
            } | null
          }
        }
      }
    }
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/search': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Поиск по всему магазину
     * @description Ищет по названию, описанию, типу, названию раздела и характеристикам. Знает формы слов и прощает опечатки; точные совпадения идут выше похожих. Пустой запрос возвращает пустой список.
     */
    get: {
      parameters: {
        query: {
          /** @description слова запроса */
          q: string
        }
        header?: never
        path?: never
        cookie?: never
      }
      requestBody?: never
      responses: {
        /** @description найденные товары */
        200: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              query: string
              items: {
                slug: string
                title: string
                /** @enum {string} */
                categorySlug:
                  | 'virtual-reality'
                  | 'monopods'
                  | 'action-cameras'
                  | 'fitness-bracelets'
                  | 'smart-watches'
                  | 'quadcopters'
                kind: string
                /** @enum {string} */
                color: 'black' | 'white' | 'blue' | 'red' | 'pink'
                price: number
                bluetooth: boolean
                popularity: number
                specs: {
                  label: string
                  value: string
                }[]
                description: string
                imagePath: string
              }[]
              total: number
            }
          }
        }
        /** @description запрос не разбирается */
        400: {
          headers: {
            [name: string]: unknown
          }
          content: {
            'application/json': {
              error: {
                /** @enum {string} */
                code:
                  | 'bad_request'
                  | 'unauthorized'
                  | 'not_found'
                  | 'conflict'
                  | 'unprocessable'
                  | 'too_many_requests'
                  | 'internal_error'
                  | 'service_unavailable'
                message: string
                details?: unknown
              }
            }
          }
        }
      }
    }
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
export type webhooks = Record<string, never>
export interface components {
  schemas: {
    Spec: {
      label: string
      value: string
    }
    Product: {
      slug: string
      title: string
      /** @enum {string} */
      categorySlug:
        | 'virtual-reality'
        | 'monopods'
        | 'action-cameras'
        | 'fitness-bracelets'
        | 'smart-watches'
        | 'quadcopters'
      kind: string
      /** @enum {string} */
      color: 'black' | 'white' | 'blue' | 'red' | 'pink'
      price: number
      bluetooth: boolean
      popularity: number
      specs: {
        label: string
        value: string
      }[]
      description: string
      imagePath: string
    }
    Page: {
      items: {
        slug: string
        title: string
        /** @enum {string} */
        categorySlug:
          | 'virtual-reality'
          | 'monopods'
          | 'action-cameras'
          | 'fitness-bracelets'
          | 'smart-watches'
          | 'quadcopters'
        kind: string
        /** @enum {string} */
        color: 'black' | 'white' | 'blue' | 'red' | 'pink'
        price: number
        bluetooth: boolean
        popularity: number
        specs: {
          label: string
          value: string
        }[]
        description: string
        imagePath: string
      }[]
      page: number
      pageSize: number
      total: number
      totalPages: number
      isLast: boolean
    }
    Catalog: {
      items: {
        slug: string
        title: string
        /** @enum {string} */
        categorySlug:
          | 'virtual-reality'
          | 'monopods'
          | 'action-cameras'
          | 'fitness-bracelets'
          | 'smart-watches'
          | 'quadcopters'
        kind: string
        /** @enum {string} */
        color: 'black' | 'white' | 'blue' | 'red' | 'pink'
        price: number
        bluetooth: boolean
        popularity: number
        specs: {
          label: string
          value: string
        }[]
        description: string
        imagePath: string
      }[]
      total: number
    }
    Categories: {
      items: {
        /** @enum {string} */
        slug:
          | 'virtual-reality'
          | 'monopods'
          | 'action-cameras'
          | 'fitness-bracelets'
          | 'smart-watches'
          | 'quadcopters'
        total: number
        priceMin: number
        priceMax: number
      }[]
    }
    PriceRange: {
      min: number
      max: number
    }
    SearchResult: {
      query: string
      items: {
        slug: string
        title: string
        /** @enum {string} */
        categorySlug:
          | 'virtual-reality'
          | 'monopods'
          | 'action-cameras'
          | 'fitness-bracelets'
          | 'smart-watches'
          | 'quadcopters'
        kind: string
        /** @enum {string} */
        color: 'black' | 'white' | 'blue' | 'red' | 'pink'
        price: number
        bluetooth: boolean
        popularity: number
        specs: {
          label: string
          value: string
        }[]
        description: string
        imagePath: string
      }[]
      total: number
    }
    Health: {
      /** @constant */
      status: 'ok'
      uptime: number
      /** @constant */
      database: 'ok'
    }
    Cart: {
      items: {
        slug: string
        title: string
        imagePath: string
        price: number
        quantity: number
        sum: number
      }[]
      count: number
      total: number
    }
    Me: {
      id: string
      email: string
      name: string
      phone: string | null
    } | null
    Order: {
      number: number
      at: string
      name: string
      phone: string
      total: number
      /** @enum {string} */
      status: 'fresh' | 'working' | 'done' | 'cancelled'
      items: {
        slug: string
        title: string
        price: number
        quantity: number
        sum: number
      }[]
    }
    Error: {
      error: {
        /** @enum {string} */
        code:
          | 'bad_request'
          | 'unauthorized'
          | 'not_found'
          | 'conflict'
          | 'unprocessable'
          | 'too_many_requests'
          | 'internal_error'
          | 'service_unavailable'
        message: string
        details?: unknown
      }
    }
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}
export type $defs = Record<string, never>
export type operations = Record<string, never>
