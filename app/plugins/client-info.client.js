// plugins/client-info.client.js
import { useUtilsStore } from '../stores/shared/utils.store'
import { detectBrowserAndOS, fetchPublicIp, getGeoLocation } from '../utils/client-info'

export default defineNuxtPlugin(async () => {
    const utilsStore = useUtilsStore()
    
    // Skip if already fetched
    if (utilsStore.clientInfo?.IpAddress) return

    const userAgent = navigator.userAgent
    const { browser, os } = detectBrowserAndOS(userAgent)

    // Run IP + GEO in parallel but don't block initial render
    Promise.all([
        fetchPublicIp(),
        getGeoLocation(),
    ]).then(([IpAddress, geo]) => {
        utilsStore.setClientInfo({
            IpAddress,
            lattitude: geo.lattitude,
            longitude: geo.longitude,
            browser,
            os,
            userAgent,
            source: `${browser} on ${os}`,
        })
    }).catch(() => {
        // Fail silently - don't block UI
        utilsStore.setClientInfo({
            browser,
            os,
            userAgent,
            source: `${browser} on ${os}`,
        })
    })
})
