// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
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
  runtimeConfig: {
    // public (available client + server)
    public: {
      encSecret: process.env.NUXT_PUBLIC_ENC_SECRET || 'SECRET KEY',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },
})