import UnoCSS from '@unocss/astro'
import AstroPureIntegration from 'astro-pure'
import { defineConfig } from 'astro/config'

import config from './src/site.config'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://coolai.example.com',
  trailingSlash: 'never',
  integrations: [UnoCSS({ injectReset: true }), AstroPureIntegration(config)],
  prefetch: true,
  server: {
    host: true
  }
})
