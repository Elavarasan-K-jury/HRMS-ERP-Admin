# `app/stores/dashboard.store.js` — Dashboard Metrics Store

## Purpose

Pinia store for fetching and managing platform service health metrics.

## State & Actions

```js
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    error: null,
    service_health: [],
  }),
  actions: {
    async fetchServicesHealth() {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.get('/service-metrics')
        this.service_health = data
      } catch (err) {
        this.error = err
      } finally {
        setTimeout(() => { this.loading = false }, 1000)
      }
    },
  }
})
```

## Explanation

- Fetches service health metrics from `/service-metrics` API.
- Used by the `ChartsPlatformServiceHealth` component on the super admin dashboard.
- 1-second minimum loading delay for UI smoothness.
