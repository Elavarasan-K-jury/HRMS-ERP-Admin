import { defineStore } from 'pinia'

const mapBand = (b) => ({
    id: b?.id || '',
    organization_id: b?.organization_id || '',
    name: b?.name || '',
    description: b?.description || '',
    order: b?.order ?? 0,
    designation_count: b?.designation_count || 0,
    employee_count: b?.employee_count || 0,
    created_at: b?.created_at || '',
    updated_at: b?.updated_at || '',
})

export const useBandStore = defineStore('band', {
    state: () => ({
        loading: false,
        saving: false,
        organizationId: null,
        bands: [],
        band_list: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 1,
        search: '',
        sortBy: 'order',
        sortOrder: 'asc',

        band_id: null,
        name: null,
        description: null,
        order: null,
    }),

    getters: {
        bandSelect(state) {
            return (state.bands || [])
                .filter(b => b.name)
                .map(b => ({ value: b.id, label: b.name, order: b.order }))
        },
        bandListSelect(state) {
            return (state.band_list || [])
                .filter(b => b.name)
                .map(b => ({ value: b.id, label: b.name, description: b.description, order: b.order }))
        },
    },

    actions: {
        async fetchBands(orgId, opts = {}) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                this.organizationId = orgId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.page,
                    limit: opts.limit ?? this.limit,
                    search: opts.search ?? this.search,
                    sort_by: opts.sortBy ?? this.sortBy,
                    sort_order: opts.sortOrder ?? this.sortOrder,
                }
                const { data } = await $api.get('/bands', { params })
                this.bands = (data?.bands || []).map(mapBand)
                this.total = data?.total || 0
                this.page = data?.page || 1
                this.limit = data?.limit || this.limit
                this.totalPages = data?.total_pages || 0
                this.search = params.search
                return this.bands
            } catch (err) {
                console.error('[band] fetch bands error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchBandList(orgId) {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get('/bands/all', {
                    params: { organization_id: orgId },
                })
                this.band_list = (data?.bands || []).map(b => ({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    order: b.order,
                }))
                return this.band_list
            } catch (err) {
                console.error('[band] fetch band list error:', err)
                throw err
            }
        },

        resetForm() {
            this.band_id = null
            this.name = null
            this.description = null
            this.order = null
        },

        async createBand() {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/bands', {
                    organization_id: this.organizationId,
                    name: this.name,
                    description: this.description,
                    order: this.order,
                })
                toast.success({ title: 'Success!', message: data.message || 'Band created', timeout: 1500 })
                this.page = 1
                await this.fetchBands(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 1500 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updateBand() {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.put(`/bands/${this.band_id}`, {
                    name: this.name,
                    description: this.description,
                    order: this.order,
                })
                toast.success({ title: 'Success!', message: data.message || 'Band updated', timeout: 1500 })
                await this.fetchBands(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 1500 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async deleteBand(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/bands/${id}`, {
                    params: { organization_id: this.organizationId },
                })
                toast.success({ title: 'Success!', message: data.message || 'Band deleted', timeout: 1500 })
                await this.fetchBands(this.organizationId)
                return data
            } catch (err) {
                toast.error({ title: 'Error!', message: extractError(err), timeout: 1500 })
                throw err
            }
        },
    },
})

function extractError(err) {
    const msg = err?.response?.data?.error || err?.message || 'Something went wrong'
    return String(msg).replace(/^\d+ [A-Z_]+:\s*/, '')
}