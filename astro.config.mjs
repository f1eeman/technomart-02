import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://device.example',
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Gilroy ExtraBold',
      cssVariable: '--font-gilroy-extrabold',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: [
              './src/assets/fonts/gilroy-extrabold.woff2',
              './src/assets/fonts/gilroy-extrabold.woff',
            ],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Gilroy Light',
      cssVariable: '--font-gilroy-light',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: [
              './src/assets/fonts/gilroy-light.woff2',
              './src/assets/fonts/gilroy-light.woff',
            ],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Open Sans',
      cssVariable: '--font-open-sans',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/open-sans-400.woff2'],
          },
        ],
      },
    },
  ],
})
