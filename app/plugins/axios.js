// plugins/axios.js
import axios from 'axios'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const api = axios.create({
        baseURL: config.public.apiBase,
        timeout: 15000,
    })

    // Set or remove the custom header
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

    // Attach the admin access token from the cookie to every request
    api.interceptors.request.use((config) => {
        if (process.client && !config.headers.Authorization) {
            const match = document.cookie.split('; ').find(r => r.startsWith('ADMIN_ACCESS_KEY='))
            if (match) {
                const token = decodeURIComponent(match.slice('ADMIN_ACCESS_KEY='.length))
                if (token) config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    })

    api.interceptors.response.use(
        (res) => res,
        (err) => Promise.reject(err)
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
