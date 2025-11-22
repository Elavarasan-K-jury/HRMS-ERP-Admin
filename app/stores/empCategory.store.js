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
        code: null,
        description: null,
        id_prefix: null,
        is_permanent: true,
        benefits_applicable: true,
        is_active: true,
        training_required: true,
        training_months: 0,
        probation_required: true,
        probation_months: 0,
        notice_required: true,
        notice_months: 0,
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
                        label: `${e.name} (${e.id_prefix})`
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
                const { data } = await $api.delete(`/employee-categories/${this.empCategoryId}`)
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
            try {
                const { $api } = useNuxtApp()
                if (this.empCategoryId) {
                    const { data } = await $api.put(`/employee-categories/${this.empCategoryId}`, {
                        name: this.name,
                        code: this.code,
                        description: this.description,
                        id_prefix: this.id_prefix,
                        is_permanent: this.is_permanent,
                        benefits_applicable: this.benefits_applicable,
                        is_active: this.is_active,
                        training_required: this.training_required,
                        training_months: Number(this.training_months),
                        probation_required: this.probation_required,
                        probation_months: Number(this.probation_months),
                        notice_required: this.notice_required,
                        notice_months: Number(this.notice_months),
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
                        code: this.code,
                        description: this.description,
                        id_prefix: this.id_prefix,
                        is_permanent: this.is_permanent,
                        benefits_applicable: this.benefits_applicable,
                        is_active: this.is_active,
                        training_required: this.training_required,
                        training_months: Number(this.training_months),
                        probation_required: this.probation_required,
                        probation_months: Number(this.probation_months),
                        notice_required: this.notice_required,
                        notice_months: Number(this.notice_months),
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
