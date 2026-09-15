// app/stores/shared/utils.store.js
import { defineStore } from 'pinia'

export const useUtilsStore = defineStore('utils', {
    state: () => ({
        IpAddress: null,
        lattitude: null,   // (typo but keeping since you already use it)
        longitude: null,
        source: null,      // we’ll use this as "device source" (browser + os)
        browser: null,
        os: null,
        userAgent: null,
    }),

    actions: {
        setClientInfo(payload) {
            if (payload.IpAddress !== undefined) this.IpAddress = payload.IpAddress
            if (payload.lattitude !== undefined) this.lattitude = payload.lattitude
            if (payload.longitude !== undefined) this.longitude = payload.longitude
            if (payload.browser !== undefined) this.browser = payload.browser
            if (payload.os !== undefined) this.os = payload.os
            if (payload.userAgent !== undefined) this.userAgent = payload.userAgent
            if (payload.source !== undefined) this.source = payload.source
        },
    },
})
