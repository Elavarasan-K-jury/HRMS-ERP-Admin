import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store.js'

export const useDepartmentStore = defineStore('department', {
    state: () => ({
        total: 0,
        department_select: [],
        departments: [],
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
        note: null,
        department_head_id: null,
        department_head_start_date: null,
        department_id: null
    }),
    actions: {
        async fetchDepartmentEmployees(organization_id, department_id) {
            console.log('department.store.js @ Line 136:', {
                organization_id,
                department_id
            });
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/departments/employee-list`, {
                    params: {
                        organization_id,
                        department_id
                    },
                })
                console.log('department.store.js @ Line 36:', data);
                return data
            } catch (err) {
                console.error('[department-store] fetch department error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        async fetchAllDepartments() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const auth = useAuthStore()
                const { data } = await $api.get(`/departments/all`, {
                    params: {
                        organization_id: this.organization_id ? this.organization_id : auth.organization,
                    },
                })

                this.department_select = data.departments.map(e => ({
                    value: e.id,
                    label: `${e.name} (${e.code})`
                }))
            } catch (error) {
                console.error('[department-store] fetch department error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        async deleteDepartment() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/departments/${this.department_id}`)
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    this.fetchDepartments()
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error('[department-store] Delete department error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        async saveDepartment() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                if (this.department_id) {
                    const { data } = await $api.put(`/departments/${this.department_id}`, {
                        name: this.name,
                        code: this.code,
                        description: this.description,
                        note: this.note,
                        department_head_id: this.department_head_id.value,
                        department_head_start_date: this.department_head_start_date,
                        organization_id: this.organization_id
                    })

                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.name = null
                        this.code = null
                        this.description = null
                        this.note = null
                        this.department_head_id = null
                        this.department_head_start_date = null
                    } else {
                        toast.error({
                            title: 'Error!',
                            message: data.message,
                            timeout: 1500
                        })
                    }
                } else {
                    const { data } = await $api.post('/departments', {
                        name: this.name,
                        code: this.code,
                        description: this.description,
                        note: this.note,
                        department_head_id: this.department_head_id.value,
                        department_head_start_date: this.department_head_start_date,
                        organization_id: this.organization_id
                    })

                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.name = null
                        this.code = null
                        this.description = null
                        this.note = null
                        this.department_head_id = null
                        this.department_head_start_date = null
                    } else {
                        toast.error({
                            title: 'Error!',
                            message: data.message,
                            timeout: 1500
                        })
                    }

                    this.page = 1
                }

                await this.fetchDepartments()
            } catch (error) {
                console.error('❌ Failed to save department:', error)
                toast.error({
                    title: 'Error!',
                    message: error.message,
                    timeout: 1500
                })
                return error
            }
        },
        async fetchDepartments() {
            const { $api } = useNuxtApp()

            // merge provided options with current meta defaults
            const organization_id = this.organization_id
            const page = this.page
            const limit = this.limit
            const sortBy = this.sortBy
            const sortOrder = this.sortOrder
            const search = this.search != '' || this.search != null ? this.search : null

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/departments', {
                    params: {
                        page,
                        organization_id,
                        limit,
                        search,
                        sort_by: sortBy,
                        sort_order: sortOrder,
                    },
                })

                this.total = data.total
                this.totalPages = data.total_pages
                this.departments = data.departments
            } catch (err) {
                console.error('❌ Failed to fetch departments:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
    }
})