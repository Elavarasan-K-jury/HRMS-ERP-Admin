export const IP_TYPE = {
    SINGLE: 'SINGLE',
    RANGE: 'RANGE',
}

export function ipNetworkAddress(row) {
    if (!row) return ''
    if (row.ipType === IP_TYPE.RANGE && row.toIp) return `${row.fromIp} - ${row.toIp}`
    return row.fromIp || ''
}

export function mapNetwork(n) {
    if (!n) return null
    return {
        id: n.id,
        organizationId: n.organization_id || '',
        name: n.name,
        ipType: n.ip_type,
        fromIp: n.from_ip,
        toIp: n.to_ip || null,
        isEnabled: !!n.is_enabled,
    }
}

export function toNetworkPayload(payload) {
    return {
        name: payload.name,
        ip_type: payload.ipType,
        from_ip: payload.fromIp,
        to_ip: payload.ipType === IP_TYPE.RANGE ? (payload.toIp || '') : '',
        is_enabled: !!payload.isEnabled,
    }
}

export function toNetworkPayloadFromRow(row, overrides = {}) {
    const merged = { ...row, ...overrides }
    return toNetworkPayload({
        name: merged.name,
        ipType: merged.ipType,
        fromIp: merged.fromIp,
        toIp: merged.toIp,
        isEnabled: merged.isEnabled,
    })
}

// Normalizes GET /ip-networks/current-ip (gateway-observed IP) into a
// display-ready result. The gateway is the only source: never replace this
// with a browser-detected or third-party IP service.
// `body` is the response JSON itself: { success, data: { ip, ipType, source } }
export function mapCurrentHrmsIp(body) {
    if (body?.success && body?.data?.ip) {
        return {
            ok: true,
            ip: body.data.ip,
            ipType: body.data.ipType || null,
            source: body.data.source || 'gateway',
            error: null,
        }
    }
    return {
        ok: false,
        ip: null,
        ipType: null,
        source: null,
        error: body?.message || 'Unable to detect the IP currently seen by HRMS.',
    }
}

export async function fetchCurrentHrmsIp(api, organizationId) {
    try {
        const { data } = await api.get('/ip-networks/current-ip', {
            params: { organization_id: organizationId },
        })
        return mapCurrentHrmsIp(data)
    } catch (err) {
        const data = err?.response?.data
        if (data?.message) return mapCurrentHrmsIp(data)
        return {
            ok: false,
            ip: null,
            ipType: null,
            source: null,
            error: 'Unable to detect the IP currently seen by HRMS.',
        }
    }
}
