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
