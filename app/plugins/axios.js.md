# `app/plugins/axios.js` — Axios HTTP Client Plugin

## Purpose

Creates and provides a centralized Axios instance with dynamic header injection for organization and employee context.

## Key Code

```js
export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: config.public.apiBase,
    timeout: 15000,
  })

  // Dynamic header setters
  const setOrganizationId = (id) => {
    if (id) api.defaults.headers.common['x-org-id'] = id
    else delete api.defaults.headers.common['x-org-id']
  }
  const setEmpId = (id) => {
    if (id) api.defaults.headers.common['x-employee-id'] = id
    else delete api.defaults.headers.common['x-employee-id']
  }

  // Response interceptor (pass-through)
  api.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(err)
  )

  return {
    provide: { api, axios: api, setOrganizationId, setEmpId }
  }
})
```

## Explanation

- **Base URL**: From runtime config `apiBase` (defaults to `/api`).
- **Dynamic Headers**: `x-org-id` and `x-employee-id` are set by layouts based on route params, scoping all API requests to the correct organization/employee.
- **Timeout**: 15 seconds.
- **Provide**: Makes `$api`, `$axios`, `$setOrganizationId`, and `$setEmpId` available throughout the app via `useNuxtApp()`.
