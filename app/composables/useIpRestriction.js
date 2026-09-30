export const IP_RESTRICTED_MESSAGE = 'Access denied from this IP address.'

export const isIpRestrictedError = (err) => {
    const res = err?.response
    if (!res || res.status !== 403) return false
    const data = res.data
    if (!data || data.success !== false) return false
    if (data.code !== undefined && data.code !== 'ORGANIZATION_IP_RESTRICTED') return false
    return data.message === IP_RESTRICTED_MESSAGE
}

export const useIpRestriction = () => {
    const restricted = useState('ip-restricted', () => false)

    const showIpRestricted = () => {
        restricted.value = true
    }

    const clearIpRestricted = () => {
        restricted.value = false
    }

    return { restricted, showIpRestricted, clearIpRestricted }
}
