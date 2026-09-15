export const LIFECYCLE_OPTIONS = [
    { value: '', label: 'All Documents' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'NO_EXPIRY', label: 'No Expiry' },
]

export function lifecycleLabel(status) {
    return { NO_EXPIRY: 'No Expiry', ACTIVE: 'Active', EXPIRING_SOON: 'Expiring Soon', EXPIRED: 'Expired' }[status] || status || 'No Expiry'
}

export function lifecycleBadgeClass(status) {
    return {
        NO_EXPIRY: 'bg-white/10 text-white/50',
        ACTIVE: 'bg-emerald-500/15 text-emerald-300',
        EXPIRING_SOON: 'bg-amber-500/15 text-amber-300',
        EXPIRED: 'bg-rose-500/15 text-rose-300',
    }[status] || 'bg-white/10 text-white/50'
}

export function lifecycleBadgeIcon(status) {
    return {
        NO_EXPIRY: 'ion:remove-circle-outline',
        ACTIVE: 'ion:checkmark-circle-outline',
        EXPIRING_SOON: 'ion:warning-outline',
        EXPIRED: 'ion:close-circle-outline',
    }[status] || 'ion:help-circle-outline'
}

export function daysUntilExpiry(expiryDate) {
    if (!expiryDate) return null
    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const exp = new Date(expiryDate)
    const expUtc = new Date(Date.UTC(exp.getUTCFullYear(), exp.getUTCMonth(), exp.getUTCDate()))
    return Math.ceil((expUtc.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

export function expiryDisplayText(doc) {
    if (!doc.ask_expiry_date || !doc.expiry_date) return ''
    const days = daysUntilExpiry(doc.expiry_date)
    if (days === null) return ''
    if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
    if (days === 0) return 'Expires today'
    if (days === 1) return 'Expires tomorrow'
    return `Expires in ${days} days`
}

export function formatFileSize(bytes) {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let size = bytes
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++ }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
