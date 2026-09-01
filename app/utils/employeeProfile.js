// Convert the API address (JSON string from mapEmployee, or object) into the
// store's address shape used by the employee form.
export function apiAddressToStore(raw) {
    if (!raw) return { address_line1: null, address_line2: null, city: null, state: null, country: null, postal_code: null }
    let a = raw
    if (typeof raw === 'string') {
        try { a = JSON.parse(raw) } catch { return { address_line1: raw, address_line2: null, city: null, state: null, country: null, postal_code: null } }
    }
    if (!a || typeof a !== 'object') return { address_line1: String(a ?? ''), address_line2: null, city: null, state: null, country: null, postal_code: null }
    return {
        address_line1: a.addressLine1 ?? a.address_line1 ?? a.line1 ?? null,
        address_line2: a.addressLine2 ?? a.address_line2 ?? a.line2 ?? null,
        city: a.city ?? null,
        state: a.state ?? null,
        country: a.country ?? null,
        postal_code: a.postalCode ?? a.postal_code ?? a.pincode ?? a.zip ?? null,
    }
}

// Render a structured address (object or JSON string) as a readable one-liner.
export function formatAddress(raw) {
    if (!raw) return ''
    let a = raw
    if (typeof raw === 'string') {
        try { a = JSON.parse(raw) } catch { return raw }
    }
    if (!a || typeof a !== 'object') return String(a ?? '')
    const line1 = [a.addressLine1 ?? a.address_line1 ?? a.line1, a.addressLine2 ?? a.address_line2 ?? a.line2]
        .filter(Boolean).join(', ')
    const city = a.city || ''
    const state = a.state || ''
    const zip = a.postalCode ?? a.postal_code ?? a.pincode ?? a.zip ?? ''
    const line2 = [city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
    const country = a.country || ''
    return [line1, line2, country].filter(Boolean).join(', ')
}
