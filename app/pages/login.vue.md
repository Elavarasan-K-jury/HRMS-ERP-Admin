# `app/pages/login.vue` — Login Page

## Purpose

OTP-based authentication page with email/phone input and 6-digit OTP verification.

## Template Structure

```
┌─────────────────────────────────────────────────────┐
│  (Left - Promo Panel)        (Right - Login Card)   │
│  ┌─────────────────────┐    ┌────────────────────┐  │
│  │  Empower your       │    │  Welcome Back      │  │
│  │  workflow with ease │    │  Email / Mobile    │  │
│  │                     │    │  [input]           │  │
│  │  [Promo Image]      │    │  OTP (after send)  │  │
│  │  ● ○ ○             │    │  [6-digit input]   │  │
│  └─────────────────────┘    │  Remember me ☐    │  │
│                              │  [Login Button]    │  │
│                              └────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Script Logic

```js
definePageMeta({ public: true, layout: 'default' })

const authStore = useAuthStore()
const { username, otp, rememberMe } = storeToRefs(authStore)
const otpSent = computed(() => authStore.otpSent)

async function handleLogin() {
  if (!otpSent.value) await authStore.login()       // Send OTP
  else await authStore.verifyLogin()                 // Verify OTP
}
```

## Explanation

- **Left Panel**: Promotional carousel with auto-rotating slides (3 promos, 5-second interval).
- **Right Panel**: Glassmorphic login card with:
  - Email or phone number input
  - 6-digit OTP input (shown after OTP is sent via SMS/email)
  - "Remember me" checkbox
  - Gradient login/verify button with loading spinner
- **Promo Carousel**: 3 slides with images, titles, and descriptions; dot indicators for navigation.
- **OTP Input**: Uses `<UiOtp>` component with length=6 and `@complete` callback.
- **On Mount**: Clears preloader, checks for existing token, cleans up state.
