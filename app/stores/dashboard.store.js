import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        loading: false,
        error: null,
        service_health: [],
    }),
    actions: {
        async fetchServicesHealth() {
            const { $api } = useNuxtApp()

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/service-metrics')
                this.service_health = data
            } catch (err) {
                console.error('❌ Failed to fetch service health:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
    }
})