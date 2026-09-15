// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  experimental: {
    appManifest: false,
  },
  devtools: { enabled: true },
  pages: true,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
    'nuxt-toast',
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  devServer: {
    port: 3030
  },
  icon: {
    mode: 'css', // or 'svg' if you want inline
    autoInstall: true
  },
  nitro: {
    devErrorHandler: async (error, event) => {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.stack || String(error);

      console.error('[Nitro Error]:', errorMessage);
    },
  },

  // Minimal Vite config
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },
  },

  runtimeConfig: {
    // public (available client + server)
    public: {
      encSecret: process.env.NUXT_PUBLIC_ENC_SECRET || 'SECRET KEY',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      apiTrafficBase: process.env.NUXT_PUBLIC_API_TRAFFIC_BASE || '/api',
      apiUsageUrl: process.env.NUXT_PUBLIC_API_USAGE_BASE || '/api',
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    },
  },
})