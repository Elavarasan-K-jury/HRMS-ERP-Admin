# `app/stores/auth.store.js` — Authentication & Session Store

## Purpose

Pinia store managing all authentication state: login, OTP verification, token management, session persistence, and logout.

## State

| Field | Type | Description |
|-------|------|-------------|
| `username` | String | Email or phone for login |
| `otp` | String | 6-digit OTP code |
| `otpSent` | Boolean | Whether OTP has been sent |
| `accessToken` | String | JWT access token |
| `refreshToken` | String | JWT refresh token |
| `rememberMe` | Boolean | Persist refresh token |
| `admin` | Object | Admin user details |
| `isLoggedIn` | Boolean | Session active flag |
| `loading` | Boolean | API loading state |
| `organization` | String | Current organization ID |
| `employee` | String | Current employee ID |

## Key Actions

```js
// Login: sends OTP to email or phone
async login() {
  const validUserName = this.detectPhoneOrEmail(this.username)
  const { data } = await $api.post('/admin/login/request-otp', {
    [validUserName]: this.username, purpose: this.purpose
  })
  if (data.success) this.otpSent = true
}

// Verify OTP and get tokens
async verifyLogin() {
  const { data } = await $api.post('/admin/login/verify', {
    [validUserName]: this.username, otp: this.otp
  })
  if (data.success) {
    await this.setToken(data.access_token, data.refresh_token)
    await this.getUserDetails()
    navigateTo(redirectTo)
  }
}

// Token refresh
async refresh_token() {
  const { data } = await $api.post('/admin/token/refresh', {
    refresh_token: this.refreshToken
  })
  if (data.success) await this.setToken(data.access_token, data.refresh_token)
}

// Token verification
async getUserDetails() {
  const { data } = await $api.post('/auth/verify-token', { token: this.accessToken })
  if (data.success) { this.admin = data.user; this.isLoggedIn = true }
  else if (this.refreshToken) return this.refresh_token()
}

// Logout
async logout(redirectTo = '/auth') {
  this.clearToken()
  navigateTo(redirectTo)
  window.location.reload()
}
```

## Cookie Management

- `ADMIN_ACCESS_KEY` — 7-day access token cookie
- `ADMIN_REFRESH_KEY` — 7-day refresh token cookie (only if `rememberMe`)
- `REDIRECT_PATH` — 5-min cookie for post-login redirect (stored by middleware)
