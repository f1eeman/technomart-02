import { defineConfig, devices } from '@playwright/test'

const PORT = 4331
const MOCK_API_PORT = 3999

export default defineConfig({
  testDir: './tests',
  retries: 0,
  fullyParallel: true,
  // Четыре воркера, а не «сколько ядер». При десяти анимации и запросы к моку
  // начинают не успевать за таймаутами, и спеки падают через раз — не потому,
  // что магазин сломан, а потому что машине не до него. Повторов по-прежнему
  // нет: спек, который проходит со второго раза, здесь считается сломанным.
  workers: 4,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  // Два сервера: мок каталога и сам сайт. Мок отдаёт фикстуры вместо живого API,
  // поэтому браузерные спеки не требуют ни Postgres, ни device-api. Сайт видит
  // мок через API_BASE, а клиентские запросы на /api проксирует его middleware.
  webServer: [
    {
      command: `node tests/mock-api.mjs`,
      url: `http://localhost:${String(MOCK_API_PORT)}/api/health`,
      timeout: 30_000,
      reuseExistingServer: false,
      env: { MOCK_API_PORT: String(MOCK_API_PORT) },
    },
    {
      command: `yarn build && node dist/server/entry.mjs`,
      url: `http://localhost:${String(PORT)}`,
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        HOST: '127.0.0.1',
        PORT: String(PORT),
        API_BASE: `http://localhost:${String(MOCK_API_PORT)}`,
      },
    },
  ],
})
