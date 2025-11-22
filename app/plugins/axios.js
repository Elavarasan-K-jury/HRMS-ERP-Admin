// plugins/axios.js
import axios from 'axios'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const api = axios.create({
        baseURL: config.public.apiBase, // from .env
        timeout: 15000,
    })

    // (Optional) central error handling
    api.interceptors.response.use(
        (res) => res,
        (err) => Promise.reject(err)
    )

    return {
        provide: {
            api,       // use as $api
            axios: api // alias if you prefer $axios naming
        }
    }
})
