// utils/client-info.js
export function detectBrowserAndOS(uaString) {
    const ua = uaString || (typeof navigator !== 'undefined' ? navigator.userAgent : '')

    let browser = 'Unknown'
    if (/edg\//i.test(ua)) browser = 'Edge'
    else if (/opr\//i.test(ua)) browser = 'Opera'
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome'
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
    else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = 'Safari'
    else if (/msie|trident/i.test(ua)) browser = 'Internet Explorer'

    let os = 'Unknown'
    if (/windows nt 10\.0/i.test(ua)) os = 'Windows 10/11'
    else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1'
    else if (/windows nt 6\.2/i.test(ua)) os = 'Windows 8'
    else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7'
    else if (/mac os x/i.test(ua)) os = 'macOS'
    else if (/android/i.test(ua)) os = 'Android'
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
    else if (/linux/i.test(ua)) os = 'Linux'

    return { browser, os }
}

export async function fetchPublicIp() {
    try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        return data.ip || null
    } catch (e) {
        console.error('IP fetch failed', e)
        return null
    }
}

export function getGeoLocation() {
    return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            resolve({ lattitude: null, longitude: null }) // keeping your keys
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                console.log('client-info.client.js @ Line 18', pos.coords)
                resolve({
                    lattitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                })
            },
            () => {
                resolve({ lattitude: 12.495644824, longitude: 77.503481597 })
            },
            { enableHighAccuracy: false, timeout: 5000 }
        )
    })
}
