# `app/middleware/auth.global.js` — Global Authentication Middleware

## Purpose

Global route guard that runs on every navigation. Manages authentication state by checking for an access token cookie and redirects unauthenticated users to `/login`.

## Logic Flow

```js
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  if (import.meta.server) return  // skip on server
  const publicPaths = ['/login', '/forgot-password']
  const accessTokenCookie = useCookie('ADMIN_ACCESS_KEY', { maxAge: 60*60*24*7 })
  const hasToken = !!accessTokenCookie.value
  const isPublic = publicPaths.includes(to.path)

  // 1️⃣ No token & not public → redirect to login
  if (!hasToken && !isPublic) { /* redirect with saved path */ }

  // 2️⃣ Has token but store not initialized → verify it
  if (hasToken && !authStore.isLoggedIn && !isPublic) { /* verify */ }

  // 3️⃣ Visiting login but already logged in → stay / redirect
  if (isPublic && hasToken) { /* verify or clear */ }

  // 4️⃣ Login page & no token → clear cookies
  if (isPublic && !hasToken) { /* clear & continue */ }
})
```

## Explanation

- **Cookie-based auth**: Uses `ADMIN_ACCESS_KEY` cookie with 7-day expiry.
- **Redirect path**: Saves the attempted URL in `REDIRECT_PATH` cookie (5 min expiry) for post-login redirect.
- **Token verification**: Calls `authStore.getUserDetails()` which hits `/auth/verify-token`.
- **Token refresh**: If access token is expired, tries `refresh_token()` with refresh token.
