import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { useThemeStore } from './theme.store'

export const useAuthStore = defineStore('Auth', {
    state: () => ({
        username: null,
        otp: '',
        purpose: 'login',
        otpSent: false,

        accessToken: null,
        refreshToken: null,
        rememberMe: false,
        admin: null,
        isLoggedIn: false,
        loading: false,

        organization: null,
        employee: null
    }),

    actions: {
        /* ---------------------- SET TOKEN ---------------------- */
        async setToken(token, refreshToken) {
            this.accessToken = token
            this.refreshToken = refreshToken
            const c = useCookie('ADMIN_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 })
            c.value = token || null
            const r = useCookie('ADMIN_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 })
            r.value = refreshToken || null
        },

        /* ---------------------- CLEAR TOKEN ---------------------- */
        clearToken() {
            this.accessToken = null
            this.refreshToken = null
            this.admin = null
            this.isLoggedIn = false
            this.otpSent = false

            if (!process.client) return
            const c = useCookie('ADMIN_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 })
            c.value = null
            const r = useCookie('ADMIN_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 })
            r.value = null
        },

        /* ---------------------- LOAD LOCAL DATA ---------------------- */
        async loadLocalData() {
            if (!process.client) return

            this.accessToken = useCookie('ADMIN_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
            this.refreshToken = useCookie('ADMIN_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 }).value

            if (this.accessToken) {
                await this.getUserDetails()
            }
        },

        /* ---------------------- DETECT USERNAME TYPE ---------------------- */
        detectPhoneOrEmail(username) {
            if (username.includes('@')) return 'email'
            if (/^\d+$/.test(username)) return 'phone'
            return false
        },

        /* ---------------------- LOGIN REQUEST (OTP) ---------------------- */
        async login() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const validUserName = this.detectPhoneOrEmail(this.username)
            if (!validUserName) return { code: 400, message: 'Invalid username' }

            try {
                this.loading = true
                const { data } = await $api.post('/admin/login/request-otp', {
                    [validUserName]: this.username,
                    purpose: this.purpose,
                })
                if (data.success) {
                    this.otpSent = true
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                }
                return data
            } catch (err) {
                console.error('[Auth] Login error:', err)
                toast.error({ title: 'Error!', message: err?.response?.data?.error?.split(':')?.[1] || err.message, timeout: 1500 })
                return { success: false, message: 'Login request failed' }
            } finally {
                this.loading = false
            }
        },

        /* ---------------------- VERIFY LOGIN ---------------------- */
        async verifyLogin() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const validUserName = this.detectPhoneOrEmail(this.username)
            if (!validUserName) return { code: 400, message: 'Invalid username' }
            const themeStore = useThemeStore()

            try {
                this.loading = true
                const { data } = await $api.post('/admin/login/verify', {
                    [validUserName]: this.username,
                    otp: this.otp,
                })

                if (data?.success) {
                    await this.setToken(data.access_token, data.refresh_token)

                    const redirectCookie = useCookie('REDIRECT_PATH', { maxAge: 60 * 5 })
                    const redirectTo = redirectCookie.value || '/'
                    redirectCookie.value = null

                    await this.getUserDetails()
                    await nextTick()
                    toast.success({ title: 'Success!', message: 'Logged in successfully!', timeout: 1500 })
                    await navigateTo(redirectTo, { replace: true })
                    themeStore.preloader = false
                    // 👇 This line fixes the blank white screen
                    window.location.reload()
                } else {
                    console.warn('[Auth] Verify failed:', data.message)
                    toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                }
                return data
            } catch (err) {
                console.error('[Auth] Verify error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                return { success: false, message: 'Verification failed' }
            } finally {
                this.loading = false
            }
        },

        /* ---------------------- VERIFY TOKEN / GET USER ---------------------- */
        async getUserDetails() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            if (!this.accessToken) {
                this.isLoggedIn = false
                return
            }

            this.loading = true
            try {
                const { data } = await $api.post('/auth/verify-token', {
                    token: this.accessToken,
                })

                if (data?.success) {
                    this.admin = data.user
                    this.isLoggedIn = true
                    // console.log('Redirecting to //dashboard');
                    // const redirectCookie = useCookie('REDIRECT_PATH', { maxAge: 60 * 5 })
                    // const redirectTo = redirectCookie.value || '//dashboard'
                    // await navigateTo(redirectTo, { replace: true })
                } else {
                    toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                    this.clearToken()
                    if (process.client && window.location.pathname !== '/auth') {
                        await navigateTo('/auth', { replace: true })
                    }
                }
            } catch (err) {
                console.error('[Auth] Token verification failed:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                this.clearToken()
                if (process.client && window.location.pathname !== '/auth') {
                    await navigateTo('/auth', { replace: true })
                }
            } finally {
                this.loading = false
            }
        },

        /* ---------------------- LOGOUT ---------------------- */
        async logout(redirectTo = '/auth') {
            this.clearToken()
            const toast = useToast()
            const redirectCookie = useCookie('REDIRECT_PATH', { maxAge: 60 * 5 })
            redirectCookie.value = null

            if (process.client) {
                const themeStore = useThemeStore()
                themeStore.preloader = true

                // ✅ Wait a moment for state and cookies to settle before navigating
                await nextTick()
                toast.success({ title: 'Success!', message: 'Logged out successfully', timeout: 1500 })
                await navigateTo(redirectTo, { replace: true })

                // ✅ Force refresh of router state to ensure login.vue renders immediately
                themeStore.preloader = false
                // 👇 This line fixes the blank white screen
                window.location.reload()
            }
        }
    },
})
