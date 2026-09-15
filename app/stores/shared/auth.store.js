import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { useThemeStore } from '../shared/theme.store'
import { getMenu } from '../../data/menu'
import { useOrganizationSubscriptionStore } from '../shared/organizationSubscription.store'

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
        employee: null,

        permissions: [],

        scope: null,
        view: 'EMPLOYEE',
        menu: [],
        user: null,
        permissionKeys: [],
        moduleKeys: [],

        resolvedScope: null,
    }),

    getters: {
        isSuperAdmin: (state) => state.admin?.is_super_admin === true,
        isEmployee: (state) => state.scope === 'employee',
        isAdmin: (state) => state.scope === 'admin',
        hasPermission: (state) => (key) => {
            if (state.admin?.is_super_admin) return true
            return state.permissions.includes(key)
        },
        defaultRoute: (state) => {
            if (state.scope === 'employee') {
                return '/employee'
            }
            if (state.admin?.is_super_admin) return '/'
            if (state.admin?.organization_id) return `/organization/${state.admin.organization_id}/dashboard`
            return '/'
        },
    },

    actions: {
        /* ---------------------- SET TOKEN ---------------------- */
        async setToken(token, refreshToken, scope = 'admin') {
            this.accessToken = token
            this.refreshToken = refreshToken
            this.scope = scope

            const portalScopeCookie = useCookie('PORTAL_SCOPE', { maxAge: 60 * 60 * 24 * 7 })
            portalScopeCookie.value = scope

            const cookieKey = scope === 'employee' ? 'EMPLOYEE_ACCESS_KEY' : 'ADMIN_ACCESS_KEY'
            const refreshKey = scope === 'employee' ? 'EMPLOYEE_REFRESH_KEY' : 'ADMIN_REFRESH_KEY'
            const c = useCookie(cookieKey, { maxAge: 60 * 60 * 24 * 7 })
            c.value = token || null
            if (this.rememberMe) {
                const r = useCookie(refreshKey, { maxAge: 60 * 60 * 24 * 7 })
                r.value = refreshToken || null
            }
        },

        /* ---------------------- CLEAR TOKEN ---------------------- */
        clearToken() {
            this.accessToken = null
            this.refreshToken = null
            this.admin = null
            this.user = null
            this.isLoggedIn = false
            this.otpSent = false
            this.permissions = []
            this.permissionKeys = []
            this.moduleKeys = []
            this.menu = []
            this.scope = null
            this.view = 'EMPLOYEE'
            this.organization = null
            this.employee = null
            this.resolvedScope = null

            if (!process.client) return
            const ac = useCookie('ADMIN_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 })
            ac.value = null
            const ar = useCookie('ADMIN_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 })
            ar.value = null
            const ec = useCookie('EMPLOYEE_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 })
            ec.value = null
            const er = useCookie('EMPLOYEE_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 })
            er.value = null
            const ps = useCookie('PORTAL_SCOPE', { maxAge: 60 * 60 * 24 * 7 })
            ps.value = null
        },

        /* ---------------------- LOAD LOCAL DATA ---------------------- */
        async loadLocalData() {
            if (!process.client) return

            const portalScope = useCookie('PORTAL_SCOPE').value
            const adminToken = useCookie('ADMIN_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
            const employeeToken = useCookie('EMPLOYEE_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 }).value

            if (portalScope === 'admin' && adminToken) {
                this.accessToken = adminToken
                this.refreshToken = useCookie('ADMIN_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
                this.scope = 'admin'
                await this.getUserDetails()
            } else if (portalScope === 'employee' && employeeToken) {
                this.accessToken = employeeToken
                this.refreshToken = useCookie('EMPLOYEE_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
                this.scope = 'employee'
                await this.getUserDetails()
            } else if (adminToken) {
                this.accessToken = adminToken
                this.refreshToken = useCookie('ADMIN_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
                this.scope = 'admin'
                await this.getUserDetails()
            } else if (employeeToken) {
                this.accessToken = employeeToken
                this.refreshToken = useCookie('EMPLOYEE_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
                this.scope = 'employee'
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

                try {
                    const { data } = await $api.post('/admin/login/request-otp', {
                        [validUserName]: this.username,
                        purpose: this.purpose,
                    })
                    if (data.success) {
                        this.resolvedScope = 'admin'
                        this.otpSent = true
                        toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                        return data
                    }
                } catch (_adminErr) {
                    // Admin endpoint failed, try employee
                }

                try {
                    const { data } = await $api.post('/employee/login/request-otp', {
                        [validUserName]: this.username,
                        purpose: this.purpose,
                    })
                    if (data.success) {
                        this.resolvedScope = 'employee'
                        this.otpSent = true
                        toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                        return data
                    }
                } catch (empErr) {
                    const errMsg = empErr?.response?.data?.error?.split(':')?.[1] || empErr.message
                    toast.error({ title: 'Error!', message: errMsg, timeout: 1500 })
                    return { success: false, message: 'Login request failed' }
                }

                return { success: false, message: 'Login request failed' }
            } catch (err) {
                console.error('[Auth] Login error:', err)
                toast.error({ title: 'Error!', message: err?.response?.data?.error?.split(':')?.[1] || err.message, timeout: 1500 })
                return { success: false, message: 'Login request failed' }
            } finally {
                this.loading = false
            }
        },

        /* ---------------------- REFRESH TOKEN ---------------------- */
        async refresh_token() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const themeStore = useThemeStore()

            try {
                this.loading = true
                const endpoint = this.scope === 'employee'
                    ? '/employee/token/refresh'
                    : '/admin/token/refresh'
                const { data } = await $api.post(endpoint, {
                    refresh_token: this.refreshToken
                })
                if (data.success) {
                    await this.setToken(data.access_token, data.refresh_token, this.scope)

                    await this.getUserDetails()
                    const redirectCookie = useCookie('REDIRECT_PATH', { maxAge: 60 * 5 })
                    const redirectTo = redirectCookie.value || this.defaultRoute
                    redirectCookie.value = null

                    await nextTick()
                    toast.success({ title: 'Success!', message: 'Logged in successfully!', timeout: 1500 })

                    themeStore.preloader = false
                    window.location.href = redirectTo
                } else {
                    toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                    this.clearToken()
                    this.logout()
                }
            } catch (err) {
                console.error('[Auth] Refresh error:', err)
                toast.error({ title: 'Error!', message: err?.response?.data?.error?.split(':')?.[1] || err.message, timeout: 1500 })
                this.clearToken()
                this.logout()
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

            const scope = this.resolvedScope || 'admin'
            const endpoint = scope === 'employee'
                ? '/employee/login/verify'
                : '/admin/login/verify'

            try {
                this.loading = true
                const { data } = await $api.post(endpoint, {
                    [validUserName]: this.username,
                    otp: this.otp,
                })

                if (data?.success) {
                    this.scope = scope
                    await this.setToken(data.access_token, data.refresh_token, scope)

                    if (scope === 'employee') {
                        if (data.permission_keys || data.module_keys) {
                            this.permissionKeys = data.permission_keys || []
                            this.moduleKeys = data.module_keys || []
                        }
                    }

                    await this.getUserDetails()
                    const redirectCookie = useCookie('REDIRECT_PATH', { maxAge: 60 * 5 })
                    const redirectTo = redirectCookie.value || this.defaultRoute
                    redirectCookie.value = null

                    await nextTick()
                    toast.success({ title: 'Success!', message: 'Logged in successfully!', timeout: 1500 })

                    themeStore.preloader = false
                    window.location.href = redirectTo
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
                const endpoint = this.scope === 'employee'
                    ? '/employee/auth/verify-token'
                    : '/auth/verify-token'
                const { data } = await $api.post(endpoint, {
                    token: this.accessToken,
                })

                if (data?.success) {
                    if (this.scope === 'employee') {
                        this.user = data.user
                        this.permissionKeys = data.permission_keys || []
                        this.moduleKeys = data.module_keys || []
                        this.isLoggedIn = true
                        this.organization = data.user.organization_id
                        this.employee = data.sub

                        try {
                            const organizationSubscriptionStore = useOrganizationSubscriptionStore()
                            await organizationSubscriptionStore.fetchOrganizationSubscriptionByOrganization()
                        } catch (e) {
                            console.warn('[Auth] Failed to fetch subscription:', e)
                        }

                        this.toggleView('EMPLOYEE', true)
                    } else {
                        this.admin = data.user
                        this.isLoggedIn = true
                        await this.fetchPermissions()
                    }
                } else {
                    if (this.refreshToken) {
                        return this.refresh_token()
                    } else {
                        toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                        this.clearToken()
                    }
                    if (process.client && window.location.pathname !== '/login') {
                        window.location.href = '/login'
                    }
                }
            } catch (err) {
                console.error('[Auth] Token verification failed:', err)
                if (this.refreshToken) {
                    return this.refresh_token()
                } else {
                    toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                    this.clearToken()
                }
                if (process.client && window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            } finally {
                this.loading = false
            }
        },

        /* ---------------------- FETCH PERMISSIONS ---------------------- */
        async fetchPermissions() {
            if (!process.client || !this.accessToken) return
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/admin/admins/${this.admin?.id}/permissions`)
                if (data?.success) {
                    this.permissions = data.permission_keys || []
                    this.admin.is_super_admin = data.is_super_admin || false
                }
            } catch (err) {
                console.error('[Auth] Failed to fetch permissions:', err)
            }
        },

        /* ---------------------- TOGGLE VIEW (Employee only) ---------------------- */
        toggleView(view = 'EMPLOYEE', skipNavigation = false) {
            const themeStore = useThemeStore()
            try {
                if (!skipNavigation) themeStore.preloader = true
                const toast = useToast()
                const validOptions = ['EMPLOYEE', 'ORGANIZATION']
                if (!validOptions.includes(view)) {
                    return toast.error({ title: 'Error!', message: 'EMPLOYEE & ORGANIZATION are the valid options.', timeout: 1500 })
                }
                if (!this.user?.admin_of_organization && view === 'ORGANIZATION') {
                    return toast.error({ title: 'Error!', message: 'You dont have permission.', timeout: 1500 })
                }
                this.view = view
                const organizationSubscriptionStore = useOrganizationSubscriptionStore()
                const paidOrNot = !organizationSubscriptionStore.pendingPayment || !organizationSubscriptionStore.trialEnded
                if (this.view === 'EMPLOYEE') {
                    this.menu = getMenu(false, this.organization, paidOrNot, this.moduleKeys, this.permissionKeys)
                    if (!skipNavigation) navigateTo(this.defaultRoute, { replace: true })
                }
                if (this.view === 'ORGANIZATION') {
                    this.menu = getMenu(this.user?.admin_of_organization, this.organization, paidOrNot, this.moduleKeys, this.permissionKeys)
                    if (!skipNavigation) navigateTo(`/organization/${this.organization}/dashboard`, { replace: true })
                    toast.success({ title: 'Success!', message: 'Viewing as an organization!', timeout: 1500 })
                }
            } catch (err) {
                console.error('[Auth] Toggle view error:', err)
            } finally {
                themeStore.preloader = false
            }
        },

        /* ---------------------- LOGOUT ---------------------- */
        async logout(redirectTo = '/login') {
            const toast = useToast()
            const redirectCookie = useCookie('REDIRECT_PATH', { maxAge: 60 * 5 })
            redirectCookie.value = null

            if (process.client) {
                const themeStore = useThemeStore()

                this.clearToken()
                await nextTick()
                themeStore.preloader = false
                toast.success({ title: 'Success!', message: 'Logged out successfully', timeout: 1500 })

                window.location.href = redirectTo
            }
        }
    },
})
