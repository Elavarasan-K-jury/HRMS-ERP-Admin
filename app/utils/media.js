import { useAuthStore } from '~/stores/shared/auth.store'

const getAuthToken = () => {
    if (process.client) {
        const match = document.cookie.split('; ').find((r) => r.startsWith('ADMIN_ACCESS_KEY='))
        if (match) {
            const token = decodeURIComponent(match.slice('ADMIN_ACCESS_KEY='.length))
            if (token) return token
        }
    }
    return ''
}

/**
 * Resolve a file reference to a URL the browser can display.
 * Accepts either a Files.id (preferred) or a legacy URL/string.
 *  - Files.id            -> {apiBase}/file/{id}?token=...
 *  - /uploads/... (legacy)-> {apiBase}/uploads/...  (old static files)
 *  - absolute/data/blob  -> unchanged
 */
export const resolveMediaUrl = (url, { auth = true } = {}) => {
    if (!url) return ''
    if (/^(https?:|data:|blob:)/i.test(url)) return url

    const { public: config } = useRuntimeConfig()

    if (String(url).startsWith('/file/')) {
        const base = `${config.apiBase}${url}`
        if (!auth) return base
        const token = getAuthToken()
        return token ? `${base}?token=${encodeURIComponent(token)}` : base
    }

    if (String(url).startsWith('/uploads/')) {
        return `${config.apiBase}${url}` // legacy static files
    }

    return url
}

/**
 * Upload a file through the centralized file API.
 * Returns the Files.id on success (empty string on failure).
 *
 * formData: file + storePath (organizations/{orgId}/<module>)
 */
export const uploadMediaFile = async (file, { storePath, organizationId } = {}) => {
    const { $api } = useNuxtApp()
    const auth = useAuthStore()

    const orgId = organizationId || auth.organization || auth.admin?.organization_id
    if (!orgId) throw new Error('Missing organization id')

    const path = storePath || `organizations/${orgId}/misc`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('storePath', path)

    const { data } = await $api.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    return data?.data?.id || ''
}