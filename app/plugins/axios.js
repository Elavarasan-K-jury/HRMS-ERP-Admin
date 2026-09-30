// plugins/axios.js
import axios from 'axios'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const api = axios.create({
        baseURL: config.public.apiBase,
        timeout: 15000,
    })

    const setOrganizationId = (id) => {
        if (id) {
            api.defaults.headers.common['x-org-id'] = id
        } else {
            delete api.defaults.headers.common['x-org-id']
        }
    }
    const setEmpId = (id) => {
        if (id) {
            api.defaults.headers.common['x-employee-id'] = id
        } else {
            delete api.defaults.headers.common['x-employee-id']
        }
    }

    api.interceptors.request.use((config) => {
        if (process.client && !config.headers.Authorization) {
            const cookies = document.cookie.split('; ')
            const portalScopeMatch = cookies.find(r => r.startsWith('PORTAL_SCOPE='))
            const scope = portalScopeMatch ? portalScopeMatch.split('=').slice(1).join('=') : null

            let token = null
            if (scope === 'admin') {
                const match = cookies.find(r => r.startsWith('ADMIN_ACCESS_KEY='))
                if (match) token = decodeURIComponent(match.slice('ADMIN_ACCESS_KEY='.length))
            } else if (scope === 'employee') {
                const match = cookies.find(r => r.startsWith('EMPLOYEE_ACCESS_KEY='))
                if (match) token = decodeURIComponent(match.slice('EMPLOYEE_ACCESS_KEY='.length))
            } else {
                const adminMatch = cookies.find(r => r.startsWith('ADMIN_ACCESS_KEY='))
                const empMatch = cookies.find(r => r.startsWith('EMPLOYEE_ACCESS_KEY='))
                const match = adminMatch || empMatch
                if (match) {
                    const key = adminMatch ? 'ADMIN_ACCESS_KEY=' : 'EMPLOYEE_ACCESS_KEY='
                    token = decodeURIComponent(match.slice(key.length))
                }
            }

            if (token) config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    api.interceptors.response.use(
        (res) => res,
        (err) => {
            if (process.client && isIpRestrictedError(err)) {
                const { showIpRestricted } = useIpRestriction()
                showIpRestricted()
            }
            return Promise.reject(err)
        }
    )

    return {
        provide: {
            api,
            axios: api,
            setOrganizationId,
            setEmpId,
        }
    }
})
