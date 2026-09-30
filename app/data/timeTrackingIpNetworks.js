import { IP_TYPE } from '~/data/ipNetwork'

/**
 * TEMPORARY UI-ONLY MOCK DATA — WILL BE REPLACED BY THE ORGANIZATION IP
 * CONFIGURATION API (GET /ip-networks) IN A FUTURE BACKEND PHASE.
 *
 * Same conceptual shape as the existing Organization IP Configuration
 * module (see ~/data/ipNetwork mapNetwork):
 * { id, name, ipType, fromIp, toIp, isEnabled }
 */
export const timeTrackingIpNetworks = [
    {
        id: 'ip-network-1',
        name: 'Head Office',
        ipType: IP_TYPE.SINGLE,
        fromIp: '103.102.234.10',
        toIp: null,
        isEnabled: true,
    },
    {
        id: 'ip-network-2',
        name: 'Factory Network',
        ipType: IP_TYPE.RANGE,
        fromIp: '103.102.234.20',
        toIp: '103.102.234.50',
        isEnabled: true,
    },
    {
        id: 'ip-network-3',
        name: 'Bangalore Branch',
        ipType: IP_TYPE.SINGLE,
        fromIp: '49.205.10.15',
        toIp: null,
        isEnabled: true,
    },
    {
        id: 'ip-network-4',
        name: 'Old Branch',
        ipType: IP_TYPE.SINGLE,
        fromIp: '49.205.20.15',
        toIp: null,
        isEnabled: false,
    },
]
