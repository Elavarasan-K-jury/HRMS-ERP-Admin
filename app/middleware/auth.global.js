// middleware/auth.global.js
import { useAuthStore } from '~/stores/shared/auth.store'

export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    const publicPaths = ['/login', '/forgot-password']
    const redirectCookie = useCookie('REDIRECT_PATH', { maxAge: 60 * 5 })
    const isPublic = publicPaths.includes(to.path)

    const portalScope = useCookie('PORTAL_SCOPE').value
    const adminToken = useCookie('ADMIN_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
    const employeeToken = useCookie('EMPLOYEE_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 }).value

    let activeToken = null
    if (portalScope === 'admin' && adminToken) activeToken = adminToken
    else if (portalScope === 'employee' && employeeToken) activeToken = employeeToken
    else if (adminToken) activeToken = adminToken
    else if (employeeToken) activeToken = employeeToken

    const hasToken = !!activeToken

    // No token & not public → redirect to login
    if (!hasToken && !isPublic) {
        redirectCookie.value = to.fullPath
        return navigateTo('/login', { replace: true })
    }

    // Has token but store not initialized → verify (client only — needs API)
    if (import.meta.client && hasToken && !authStore.isLoggedIn && !isPublic) {
        try {
            if (portalScope) {
                authStore.scope = portalScope
            }
            authStore.accessToken = activeToken
            const refreshToken = portalScope === 'employee'
                ? useCookie('EMPLOYEE_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
                : useCookie('ADMIN_REFRESH_KEY', { maxAge: 60 * 60 * 24 * 7 }).value
            if (refreshToken) authStore.refreshToken = refreshToken
            await authStore.getUserDetails()
        } catch (err) {
            console.warn('[auth.global] Token invalid, logging out:', err)
            await authStore.logout('/login')
            return
        }
    }

    // Org admin (non-super) visiting super-admin home → redirect to org dashboard
    if (authStore.isLoggedIn && authStore.isAdmin && !authStore.isSuperAdmin && authStore.admin?.organization_id) {
        const orgPath = `/organization/${authStore.admin.organization_id}/dashboard`
        if (to.path === '/' && to.path !== orgPath) {
            return navigateTo(orgPath, { replace: true })
        }
    }

    // Employee visiting admin-only pages → redirect to employee dashboard
    if (authStore.isLoggedIn && authStore.isEmployee) {
        if (to.path === '/') {
            return navigateTo(authStore.defaultRoute, { replace: true })
        }
        // Employee Portal is restricted to /employee/* only.
        // Organization Employee routing (/organization/:org/employee/:employee/*)
        // is admin-facing and must not be reachable with employee scope.
        if (to.path.startsWith('/organization/')) {
            return navigateTo(authStore.defaultRoute, { replace: true })
        }
        const superAdminOnlyPaths = ['/modules', '/settings/admins', '/settings/roles', '/settings/audit-logs', '/organization/list', '/reports/traffic', '/reports/usage']
        if (superAdminOnlyPaths.some(p => to.path.startsWith(p))) {
            return navigateTo(authStore.defaultRoute, { replace: true })
        }
    }

    // Visiting login but already logged in → redirect to dashboard (client only — needs API)
    if (import.meta.client && isPublic && hasToken) {
        try {
            if (!authStore.isLoggedIn) {
                if (portalScope) authStore.scope = portalScope
                // getUserDetails early-returns without accessToken — seed it from cookie
                if (!authStore.accessToken) authStore.accessToken = activeToken
                await authStore.getUserDetails()
            }
            if (authStore.isLoggedIn) {
                return navigateTo(authStore.defaultRoute, { replace: true })
            }
        } catch {
            const ac = useCookie('ADMIN_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 })
            ac.value = null
            const ec = useCookie('EMPLOYEE_ACCESS_KEY', { maxAge: 60 * 60 * 24 * 7 })
            ec.value = null
            const ps = useCookie('PORTAL_SCOPE', { maxAge: 60 * 60 * 24 * 7 })
            ps.value = null
            redirectCookie.value = null
            return
        }
    }

    // Login page & no token → clear stale cookies
    if (isPublic && !hasToken) {
        redirectCookie.value = null
        authStore.isLoggedIn = false
        return
    }
})
