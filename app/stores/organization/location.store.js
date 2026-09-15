import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', {
    state: () => ({
        locations: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        organization_id: null,
        loading: false,
        error: null,
        location_id: null,
    }),
    actions: {
        async fetchLocations() {
            const toast = useToast()
            const { $api } = useNuxtApp()
            this.loading = true
            this.error = null
            try {
                const { data } = await $api.get(`/api/v1/organizations/${this.organization_id}/locations`, {
                    params: { page: 1, limit: 100 },
                })
                this.locations = data?.locations || []
                this.total = data?.total || 0
                return data
            } catch (err) {
                console.error('[location-store] fetch locations error:', err)
                this.error = err
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.loading = false
            }
        },
        async saveLocation(payload) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            try {
                let data
                if (this.location_id) {
                    data = await $api.put(`/api/v1/locations/${this.location_id}`, payload)
                    data = data.data
                } else {
                    const res = await $api.post(`/api/v1/organizations/${this.organization_id}/locations`, payload)
                    data = res.data
                }
                if (data?.success) {
                    toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                    this.resetForm()
                } else {
                    toast.error({ title: 'Error!', message: data?.message || 'Failed to save location', timeout: 1500 })
                }
                await this.fetchLocations()
            } catch (err) {
                console.error('[location-store] save location error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                return err
            }
        },
        async deleteLocation(id) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            try {
                const { data } = await $api.delete(`/api/v1/locations/${id}`)
                if (data?.success) {
                    toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                    await this.fetchLocations()
                } else {
                    toast.error({ title: 'Error!', message: data?.message || 'Failed to delete location', timeout: 1500 })
                }
            } catch (err) {
                console.error('[location-store] delete location error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        resetForm() {
            this.location_id = null
        },
    },
})