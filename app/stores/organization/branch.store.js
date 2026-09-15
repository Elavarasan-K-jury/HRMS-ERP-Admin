import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useBranchStore = defineStore('branch', {
    state: () => ({
        branches: [],
        branch_select: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        organization_id: null,
        loading: false,
        error: null,
        name: null,
        code: null,
        description: null,
        is_active: true,
        branch_id: null,
    }),
    actions: {
        async fetchAllBranches() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/api/v1/organizations/${this.organization_id}/branches`, {
                    params: { page: 1, limit: 100 }
                })
                if (data?.branches) {
                    this.branch_select = data.branches.map(b => ({
                        value: b.id,
                        label: b.name || b.code || '—',
                    }))
                }
                return data
            } catch (err) {
                console.error('[branch-store] fetch all branches error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        async fetchBranches() {
            const { $api } = useNuxtApp()
            const organization_id = this.organization_id
            const page = this.page
            const limit = this.limit
            const sortBy = this.sortBy
            const sortOrder = this.sortOrder
            const search = this.search != '' && this.search != null ? this.search : null

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get(`/api/v1/organizations/${organization_id}/branches`, {
                    params: {
                        page,
                        limit,
                        search,
                        sort_by: sortBy,
                        sort_order: sortOrder,
                    },
                })

                this.total = data.total
                this.totalPages = data.total_pages
                this.branches = data.branches
            } catch (err) {
                console.error('[branch-store] fetch branches error:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000)
            }
        },
        async saveBranch() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                if (this.branch_id) {
                    const { data } = await $api.put(`/api/v1/branches/${this.branch_id}`, {
                        name: this.name,
                        code: this.code,
                        description: this.description,
                        is_active: this.is_active,
                    })

                    if (data.success) {
                        toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                        this.resetForm()
                    } else {
                        toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                    }
                } else {
                    const { data } = await $api.post(`/api/v1/organizations/${this.organization_id}/branches`, {
                        name: this.name,
                        code: this.code,
                        description: this.description,
                    })

                    if (data.success) {
                        toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                        this.resetForm()
                    } else {
                        toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                    }
                    this.page = 1
                }

                await this.fetchBranches()
            } catch (error) {
                console.error('[branch-store] save branch error:', error)
                toast.error({ title: 'Error!', message: error.message, timeout: 1500 })
                return error
            }
        },
        async deleteBranch() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/api/v1/branches/${this.branch_id}`)
                if (data.success) {
                    toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                    this.fetchBranches()
                } else {
                    toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                }
            } catch (err) {
                console.error('[branch-store] delete branch error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        resetForm() {
            this.name = null
            this.code = null
            this.description = null
            this.is_active = true
            this.branch_id = null
        },
    },
})
