// app/stores/head.store.js
import { defineStore } from 'pinia'

export const useEmpCategoryStore = defineStore('EmployeeCategory', {
    state: () => ({
        total: 0,
        category_list: [],
        categories: [],
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
        description: null,
        is_active: true,
        employment_type: 'PROBATION',
        empCategoryId: null
    }),
    actions: {
        async fetchEmployeeCategories() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                this.loading = true
                const res = await $api.get('/employee-categories', {
                    params: {
                        organization_id: this.organization_id,
                        page: Number(this.page),
                        limit: Number(this.limit),
                        search: this.search,
                        sort_by: this.sortBy,
                        sort_order: this.sortOrder
                    },
                })
                if (res.data.success) {
                    this.categories = res.data.categories
                    this.total = res.data.total
                    this.totalPages = res.data.total_pages
                }
            } catch (err) {
                console.error('[EmployeeCategory] Fetch categories error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.loading = false
            }
        },
        async fetchAllEmployeeCategories() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                this.loading = true
                const res = await $api.get('/employee-categories', {
                    params: {
                        organization_id: this.organization_id,
                    },
                })
                if (res.data.success) {
                    this.category_list = res.data.categories.map(e => ({
                        value: e.id,
                        label: e.name,
                        employment_type: e.employment_type || 'PROBATION',
                    }))
                }
            } catch (err) {
                console.error('[EmployeeCategory] Fetch categories error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.loading = false
            }
        },
        async deleteEmployeeCategory() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/employee-categories/${this.empCategoryId}`, {
                    params: { organization_id: this.organization_id }
                })
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    this.fetchEmployeeCategories()
                }
            } catch (err) {
                console.error('[EmployeeCategory] Delete category error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        async saveEmpCategory() {
            const toast = useToast()
            const normalizeEmploymentType = (v) => v && typeof v === 'object' && 'value' in v ? v.value : v
            try {
                const { $api } = useNuxtApp()
                if (this.empCategoryId) {
                    const { data } = await $api.put(`/employee-categories/${this.empCategoryId}`, {
                        name: this.name,
                        description: this.description,
                        is_active: this.is_active,
                        employment_type: normalizeEmploymentType(this.employment_type),
                        organization_id: this.organization_id
                    }
                    )
                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.fetchEmployeeCategories()
                    } else {
                        toast.error({
                            title: 'Error!',
                            message: data.message,
                            timeout: 1500
                        })
                    }
                } else {
                    const { data } = await $api.post('/employee-categories', {
                        name: this.name,
                        description: this.description,
                        is_active: this.is_active,
                        employment_type: normalizeEmploymentType(this.employment_type),
                        organization_id: this.organization_id
                    }
                    )
                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.fetchEmployeeCategories()
                    } else {
                        toast.error({
                            title: 'Error!',
                            message: data.message,
                            timeout: 1500
                        })
                    }
                }
            } catch (err) {
                console.error('[EmployeeCategory] Save category error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        }
    }
})
