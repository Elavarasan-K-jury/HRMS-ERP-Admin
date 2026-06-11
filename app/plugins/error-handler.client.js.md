# `app/plugins/error-handler.client.js` — Global Error Handler

## Purpose

Client-side only plugin that intercepts and handles unhandled promise rejections, global errors, and Vue errors to prevent the app from crashing, especially on socket/connection errors.

## Key Code

```js
export default defineNuxtPlugin((nuxtApp) => {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault()
    if (event.reason?.message?.includes('ECONNRESET') || ...) {
      console.warn('Socket error suppressed')
    }
  })

  // Global errors
  window.addEventListener('error', (event) => {
    if (event.message?.includes('ECONNRESET')) event.preventDefault()
  })

  // Vue error handler
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    if (err?.message?.includes('ECONNRESET')) return
    throw err  // Re-throw non-socket errors
  }

  // Nuxt vue:error hook
  nuxtApp.hook('vue:error', (err) => {
    if (err?.message?.includes('ECONNRESET')) return
  })
})
```

## Explanation

- **Socket Error Suppression**: Specifically catches `ECONNRESET` and socket-related errors that occur during development HMR (Hot Module Replacement) to prevent unnecessary app crashes.
- **Three Layers**: Catches errors at window-level (unhandledrejection, error), Vue-level (errorHandler), and Nuxt-level (vue:error hook).
- **Non-socket errors** are re-thrown for debugging.
