// middleware/auth.global.js
export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    // ⛔ Skip middleware on server redirect loops
    if (import.meta.server) return

    // ✅ Define public pages
    const publicPaths = ['/login', '/forgot-password']
    const redirectCookie = useCookie('REDIRECT_PATH', { maxAge: 60 * 5 })
    const accessTokenCookie = useCookie('ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 })

    const hasToken = !!accessTokenCookie.value
    const isPublic = publicPaths.includes(to.path)

    // 🧠 1️⃣ If no token & not public → redirect to login
    if (!hasToken && !isPublic) {
        redirectCookie.value = to.fullPath
        return navigateTo('/login', { replace: true })
    }

    // 🧠 2️⃣ If has token but store not initialized, verify it once
    if (hasToken && !authStore.isLoggedIn && !isPublic) {
        try {
            await authStore.getUserDetails()
        } catch (err) {
            console.warn('[auth.global] Token invalid, logging out:', err)
            await authStore.logout('/login')
            return
        }
    }

    // 🧠 3️⃣ If visiting login but already logged in → redirect to dashboard
    if (isPublic && hasToken) {
        // Try verifying before redirecting (avoid redirect loop)
        try {
            await authStore.getUserDetails()
            // const target = redirectCookie.value || '/panel/super-admin/dashboard'
            // redirectCookie.value = null
            // if (to.path !== target) return navigateTo(target, { replace: true })
        } catch {
            // Invalid token — stay on login, clear cookie
            accessTokenCookie.value = null
            redirectCookie.value = null
            return
        }
    }

    // 🧠 4️⃣ If login page & no token → clear stale cookies and continue
    if (isPublic && !hasToken) {
        redirectCookie.value = null
        // ✅ Add this
        authStore.isLoggedIn = false
        return
    }

    // ✅ 5️⃣ All good — continue navigation
})
