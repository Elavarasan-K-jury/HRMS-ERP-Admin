# `nuxt.config.js` — Nuxt Application Configuration

## Purpose

Main configuration file for the Nuxt 4 application. Defines modules, dev server settings, runtime config, Vite options, and page/layout transitions.

## Key Configuration

```js
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
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
  devServer: { port: 3030 },
  runtimeConfig: {
    public: {
      encSecret: process.env.NUXT_PUBLIC_ENC_SECRET || 'SECRET KEY',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      apiTrafficBase: process.env.NUXT_PUBLIC_API_TRAFFIC_BASE || '/api',
      apiUsageUrl: process.env.NUXT_PUBLIC_API_USAGE_BASE || '/api',
    },
  },
  nitro: {
    devErrorHandler: async (error, event) => { /* custom error handler */ },
  },
  vite: {
    server: { hmr: { protocol: 'ws', host: 'localhost' } },
  },
})
```

## Explanation

- **Modules**: Tailwind CSS for styling, Pinia for state management, Icon library, Toast notifications.
- **Runtime Config**: Public environment variables for API base URLs and encryption secret, accessible on both client and server.
- **Transitions**: Page fade/slide and layout scale transitions.
- **Dev Server**: Runs on port 3030.
- **Nitro Error Handler**: Custom handler for server-side errors to prevent crashes.
- **Vite HMR**: WebSocket HMR configured for localhost.
