import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useAssetIdSeriesStore = defineStore('AssetIdSeries', {
    state: () => ({
        seriesList: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        loading: false,
        error: null,
        addModal: false,
        selectedSeries: null,
        name: null,
        prefix: null,
        digits: 6,
        suffix: null,
        isActive: true,
        generateModal: false,
        generatedId: null,
    }),

    actions: {
        async fetchSeries() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true
                this.error = null

                const res = await $api.get('/asset-id-series', {
                    params: {
                        organization_id: auth.organization,
                        page: Number(this.page),
                        limit: Number(this.limit),
                        search: this.search,
                    },
                })

                if (res.data?.success) {
                    this.seriesList = res.data.series
                    this.total = res.data.total
                    this.totalPages = res.data.total_pages
                }
            } catch (err) {
                console.error('[AssetIdSeries] Fetch error:', err)
                toast.error({ title: 'Error!', message: err?.message || 'Failed to fetch series', timeout: 1500 })
                this.error = err
            } finally {
                this.loading = false
            }
        },

        async createSeries() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true

                const payload = {
                    organization_id: auth.organization,
                    name: this.name,
                    prefix: this.prefix || '',
                    digits: this.digits || 6,
                    suffix: this.suffix || '',
                    is_active: this.isActive,
                }

                if (!payload.name) {
                    toast.error({ title: 'Validation Error', message: 'Name is required', timeout: 1500 })
                    return
                }

                const res = await $api.post('/asset-id-series', payload)

                if (res.data?.success) {
                    toast.success({ title: 'Success!', message: res.data.message, timeout: 1500 })
                    this.addModal = false
                    this.resetForm()
                    await this.fetchSeries()
                } else {
                    toast.error({ title: 'Error!', message: res.data?.message || 'Failed to create series', timeout: 1500 })
                }
            } catch (err) {
                console.error('[AssetIdSeries] Create error:', err)
                toast.error({ title: 'Error!', message: err?.message || 'Failed to create series', timeout: 1500 })
            } finally {
                this.loading = false
            }
        },

        async updateSeries() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true

                const payload = {
                    organization_id: auth.organization,
                    name: this.name,
                    prefix: this.prefix || '',
                    digits: this.digits || 6,
                    suffix: this.suffix || '',
                    is_active: this.isActive,
                }

                const res = await $api.put(`/asset-id-series/${this.selectedSeries.id}`, payload)

                if (res.data?.success) {
                    toast.success({ title: 'Success!', message: res.data.message, timeout: 1500 })
                    this.addModal = false
                    this.resetForm()
                    await this.fetchSeries()
                } else {
                    toast.error({ title: 'Error!', message: res.data?.message || 'Failed to update series', timeout: 1500 })
                }
            } catch (err) {
                console.error('[AssetIdSeries] Update error:', err)
                toast.error({ title: 'Error!', message: err?.message || 'Failed to update series', timeout: 1500 })
            } finally {
                this.loading = false
            }
        },

        async deleteSeries() {
            const { $api } = useNuxtApp()
            const toast = useToast()

            try {
                this.loading = true
                const res = await $api.delete(`/asset-id-series/${this.selectedSeries.id}`)

                if (res.data?.success) {
                    toast.success({ title: 'Success!', message: res.data.message, timeout: 1500 })
                    await this.fetchSeries()
                }
            } catch (err) {
                console.error('[AssetIdSeries] Delete error:', err)
                toast.error({ title: 'Error!', message: err?.message || 'Failed to delete series', timeout: 1500 })
            } finally {
                this.loading = false
                this.selectedSeries = null
            }
        },

        async generateAssetId(seriesId, previewOnly = false) {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                const res = await $api.post('/asset-id-series/generate', {
                    organization_id: auth.organization,
                    series_id: seriesId,
                    preview_only: previewOnly,
                })

                if (res.data?.success) {
                    this.generatedId = res.data.asset_id
                    return res.data.asset_id
                } else {
                    toast.error({ title: 'Error!', message: res.data?.message || 'Failed to generate Asset ID', timeout: 1500 })
                    return null
                }
            } catch (err) {
                console.error('[AssetIdSeries] Generate error:', err)
                toast.error({ title: 'Error!', message: err?.message || 'Failed to generate Asset ID', timeout: 1500 })
                return null
            }
        },

        resetForm() {
            this.selectedSeries = null
            this.name = null
            this.prefix = null
            this.digits = 6
            this.suffix = null
            this.isActive = true
            this.generatedId = null
        },
    },
})
