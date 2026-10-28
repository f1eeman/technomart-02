# Выкладка на хостинг

Магазин больше не статический. Сайт — Node-приложение (Astro на SSR), рядом
работает API на Express и Postgres. Раздавать файлы недостаточно: каждая страница
строится на запрос и ходит за товарами в API.

Почему так — `docs/adr/0010-server-rendered-catalog-and-separate-api.md`.

## Что из чего состоит

| Служба | Что это                                  | Порт по умолчанию |
| ------ | ---------------------------------------- | ----------------- |
| `web`  | этот репозиторий, Astro на адаптере node | 4321              |
| `api`  | репозиторий `device-api`, Express        | 3000              |
| `db`   | Postgres 17                              | 5432              |
| `mail` | SMTP для писем о сбросе пароля           | 25 / 587          |

В разработке место `mail` занимает ловушка Mailpit из `docker-compose.yml` в
репозитории API: SMTP на 1025, письма видно на 8025. В бою это настоящий SMTP —
адрес и учётные данные приходят переменными `SMTP_*`.

Браузер видит **один домен**: `/` уходит в `web`, `/api` — в `api`, `/uploads` —
в картинки товаров, которые раздаёт тот же `api`. Разных доменов нет намеренно:
корзина переезжает на сервер, а cookie между доменами тянет за собой
`SameSite=None` и CORS.

## Порядок выкладки

1. Накатить миграции: в `device-api` — `yarn db:deploy`. Схема меняется до того,
   как новый код её увидит.
2. Залить и запустить `api`.
3. Собрать и запустить `web`.
4. Поставить на расписание `yarn db:sweep` (раз в сутки): он убирает протухшие
   сессии, брошенные корзины и просроченные ссылки на сброс пароля.

Оба репозитория собираются в образы: `Dockerfile` есть и там, и там, а
`docker-compose.yml` в `device-api` поднимает базу, почту, разовую миграцию и
API; `docker-compose.yml` во фронте — сам сайт. Так же выкладывается и в бою,
если не разворачивать вручную.

Обратный порядок даёт окно, в котором страница просит поля, которых в базе ещё
нет.

## Сборка

Зависимости — **только Yarn**. `npm install` при наличии `yarn.lock` перепишет
его под себя и сломает установку у коллег на других платформах; почему именно —
в `CLAUDE.md`.

```
yarn install --frozen-lockfile
yarn api:types          # типы из схемы API; нужен поднятый api
yarn build              # astro check && astro build
node dist/server/entry.mjs
```

На выходе — `dist/client` (статика: `_astro`, шрифты, `robots.txt`, карта сайта)
и `dist/server` (серверная часть). Точка входа — `dist/server/entry.mjs`.

## Окружение

| Переменная | Кому  | Значение                                               |
| ---------- | ----- | ------------------------------------------------------ |
| `API_BASE` | `web` | адрес API **изнутри** сети, например `http://api:3000` |
| `HOST`     | `web` | `0.0.0.0` в контейнере                                 |
| `PORT`     | `web` | `4321`                                                 |

`API_BASE` читается в рантайме, а не зашивается в сборку: в `astro.config.mjs`
переменная объявлена как `access: 'secret'`. С `access: 'public'` Astro
подставил бы значение на этапе сборки, и образ оказался бы привязан к адресу
разработчика — на этом уже спотыкались.

Переменные API перечислены в его собственном README: `DATABASE_URL` обязательна,
остальные имеют умолчания.

## nginx

```nginx
upstream device_web { server 127.0.0.1:4321; }
upstream device_api { server 127.0.0.1:3000; }

server {
    listen 443 ssl;
    server_name device.ru;

    location /_astro/ {
        root /var/www/device/dist/client;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /api/ {
        proxy_pass http://device_api;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://device_api;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://device_web;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`/_astro/` отдаётся напрямую с диска, мимо Node: файлы названы по хешу
содержимого и меняются только вместе со сборкой.

**Путь `/api` в бою один — через nginx.** Внутри сайта есть свой прокси
(`src/middleware.ts`), но он нужен для разработки и тестов: если nginx перехватил
`/api` раньше, до Node эти запросы не доходят вовсе. Поэтому `no-store` на ответы
API в бою ставит nginx — встроенный прокси до них не дотягивается.

**SPA-фолбэк по-прежнему не включать.** Несуществующий путь должен отвечать 404,
и он отвечает: неизвестный раздел, несуществующий товар и мусорный адрес
возвращают 404 вместе со страницей 404 — проверено обходом.

## Заголовки кэша

| Что                                            | `Cache-Control`                       |
| ---------------------------------------------- | ------------------------------------- |
| `/_astro/*`                                    | `public, max-age=31536000, immutable` |
| обычные страницы                               | `no-cache` + `Vary: Cookie`           |
| корзина, сравнение, кабинет, вход, регистрация | `private, no-store` + `Vary: Cookie`  |
| ответы `/api/*`                                | `private, no-store`                   |
| `/og-image.png`, `/favicon.svg`                | `public, max-age=3600`                |
| `/robots.txt`, `/sitemap*.xml`                 | `public, max-age=3600`                |

Заголовки страниц ставит сам сайт (`src/middleware.ts`) — в nginx их настраивать
не нужно, важно лишь не перетирать. А вот `/api/*` в бою идёт мимо Node, и
`private, no-store` на эти ответы вешает nginx:

````nginx
location /api/ {
    proxy_pass http://device_api;
    add_header Cache-Control "private, no-store" always;
    ...
}
``` Страницы кэшировать
нельзя: выдача зависит от параметров адреса, а корзина и кабинет — от того, кто
смотрит.

## Домен и протокол

`canonical`, `og:url` и карта сайта содержат абсолютный адрес из `site` в
`astro.config.mjs`; второе место — `Sitemap:` в `public/robots.txt`. Сменить домен
правкой на сервере нельзя, только пересборкой; сейчас там стоит заглушка
`https://device.example`.

Нужны постоянные редиректы `http://` → `https://` и `www.<домен>` → `<домен>`.

## Что проверить после заливки

````

curl -I https://<домен>/ # 200, text/html
curl -I https://<домен>/catalog/monopods # 200
curl -I https://<домен>/product/giant-selfie-stick
curl -s https://<домен>/api/health # {"status":"ok","database":"ok"}
curl -I https://<домен>/uploads/item-1.jpg # 200, image/jpeg
curl -I https://<домен>/такого-нет # 404

```

Плюс один прогон глазами: открыть раздел, переключить сортировку, положить товар
в корзину, оформить заказ, зайти в кабинет, отменить заказ. Корзина и вход живут
на сервере, а сравнение — в `localStorage`; если он заблокирован политикой
браузера, молча перестанет работать именно сравнение.

## `public/og-image.png` в репозитории нет

Ссылка на него стоит в мета-тегах, а файла нет — превью в мессенджерах будет
пустым. Размер 1200×630, разбор — в `docs/adr/0005-seo-metadata-and-indexing.md`.
Имя без хеша, поэтому после замены картинку придётся протолкнуть через отладчики
WhatsApp и Telegram вручную.
```
