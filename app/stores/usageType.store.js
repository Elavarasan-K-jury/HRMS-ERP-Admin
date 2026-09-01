import { defineStore } from 'pinia'

const mapUsageType = (u) => ({
    id: u?.id || '',
    organization_id: u?.organization_id || '',
    name: u?.name || '',
    description: u?.description || '',
    is_active: !!u?.is_active,
    created_at: u?.created_at || '',
    updated_at: u?.updated_at || '',
})

export const useUsageTypeStore = defineStore('usageType', {
    state: () => ({
        loading: false,
        saving: false,
        organizationId: null,
        usageTypes: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
        isActiveOnly: false,
    }),

    getters: {
        activeUsageTypes: (state) => (state.usageTypes || []).filter(u => u.is_active),
    },

    actions: {
        async fetchUsageTypes(orgId, opts = {}) {
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
                if (opts.isActiveOnly) params.is_active_only = 'true'
                const { data } = await $api.get('/usage-types', { params })
                this.usageTypes = (data?.usage_types || []).map(mapUsageType)
                this.total = data?.total || 0
                this.page = data?.page || 1
                this.limit = data?.limit || this.limit
                this.totalPages = data?.total_pages || 0
                this.search = params.search
                return this.usageTypes
            } catch (err) {
                console.error('[usageType] fetch error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchActiveUsageTypes(orgId) {
            return await this.fetchUsageTypes(orgId, { isActiveOnly: true, limit: 100 })
        },

        async createUsageType(payload) {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const normalize = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v)
                const isActive = normalize(payload.is_active)
                const { data } = await $api.post('/usage-types', {
                    organization_id: this.organizationId,
                    name: payload.name?.trim(),
                    description: payload.description?.trim() || null,
                    is_active: isActive ?? true,
                })
                toast.success({ title: 'Success!', message: data.message || 'Usage type created', timeout: 1500 })
                await this.fetchUsageTypes(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to create usage type'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updateUsageType(id, payload) {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const normalize = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v)
                const isActive = normalize(payload.is_active)
                const { data } = await $api.put(`/usage-types/${id}`, {
                    name: payload.name?.trim(),
                    description: payload.description?.trim() ?? null,
                    is_active: isActive,
                })
                toast.success({ title: 'Success!', message: data.message || 'Usage type updated', timeout: 1500 })
                await this.fetchUsageTypes(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to update'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updateStatus(id, isActive) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.patch(`/usage-types/${id}/status`, {
                    is_active: isActive,
                    organization_id: this.organizationId,
                })
                toast.success({ title: 'Success!', message: data.message || (isActive ? 'Activated' : 'Deactivated'), timeout: 1500 })
                await this.fetchUsageTypes(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to update status'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async deleteUsageType(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/usage-types/${id}`, { params: { organization_id: this.organizationId } })
                toast.success({ title: 'Success!', message: data.message || 'Deleted', timeout: 1500 })
                await this.fetchUsageTypes(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to delete'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },
    },
})
